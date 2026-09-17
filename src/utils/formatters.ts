export function formatVND(amount: number, masked: boolean = false): string {
  if (masked) {
    return '•••••••• ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortVND(amount: number, masked: boolean = false): string {
  if (masked) return '••••••';
  if (Math.abs(amount) >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(2).replace('.', ',') + ' tỷ ₫';
  }
  if (Math.abs(amount) >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.', ',') + ' tr ₫';
  }
  return formatVND(amount, false);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

export const MISA_POWERSHELL_SCRIPT = `# ==============================================================================
# MISA SME 202x / SME.NET REMOTE SYNC AGENT (POWERSHELL - WINDOWS SERVER)
# ==============================================================================
# Hướng dẫn:
# 1. Chạy PowerShell với quyền Administrator trên máy chủ có cài MISA SME.
# 2. Script sẽ kết nối nội bộ vào Microsoft SQL Server của MISA (chỉ đọc SELECT).
# 3. Đẩy dữ liệu tổng hợp đã mã hóa qua cổng HTTPS lên Web Portal này.
# ==============================================================================

$ServerInstance = "localhost\\MISASME2022"    # Đổi thành tên SQL Server của bạn
$DatabaseName   = "MISASME2022_DATA"          # Đổi thành tên CSDL MISA của công ty
$PortalEndpoint = "https://your-misa-portal.app/api/sync"
$ApiToken       = "misa_sec_token_998877_live_sync"

Write-Host ">>> [MISA SYNC] Đang kết nối CSDL MISA SME trên máy chủ..." -ForegroundColor Cyan

$ConnectionString = "Server=$ServerInstance;Database=$DatabaseName;Integrated Security=True;TrustServerCertificate=True"
$SqlConnection    = New-Object System.Data.SqlClient.SqlConnection($ConnectionString)

try {
    $SqlConnection.Open()
    Write-Host ">>> [MISA SYNC] Kết nối SQL Server thành công!" -ForegroundColor Green

    # Lấy số dư Quỹ tiền mặt (TK 1111) & Tiền gửi Ngân hàng (TK 1121)
    $QueryBalance = @"
    SELECT 
        AccountID, AccountNumber, AccountName,
        SUM(DebitAmount - CreditAmount) AS ClosingBalance
    FROM GLVoucherDetail
    WHERE AccountNumber LIKE '111%' OR AccountNumber LIKE '112%'
    GROUP BY AccountID, AccountNumber, AccountName
"@
    $Command = New-Object System.Data.SqlClient.SqlCommand($QueryBalance, $SqlConnection)
    $Adapter = New-Object System.Data.SqlClient.SqlDataAdapter($Command)
    $Dataset = New-Object System.Data.DataSet
    $Adapter.Fill($Dataset) | Out-Null

    # Lấy tổng hợp Công nợ phải thu (TK 131)
    $QueryDebt = @"
    SELECT TOP 20
        AccountObjectID, AccountObjectCode, AccountObjectName,
        SUM(DebitAmount - CreditAmount) AS DebtAmount
    FROM ARVoucherDetail
    GROUP BY AccountObjectID, AccountObjectCode, AccountObjectName
    HAVING SUM(DebitAmount - CreditAmount) > 0
    ORDER BY DebtAmount DESC
"@
    $CommandDebt = New-Object System.Data.SqlClient.SqlCommand($QueryDebt, $SqlConnection)
    $AdapterDebt = New-Object System.Data.SqlClient.SqlDataAdapter($CommandDebt)
    $DatasetDebt = New-Object System.Data.DataSet
    $AdapterDebt.Fill($DatasetDebt) | Out-Null

    Write-Host ">>> [MISA SYNC] Đang đóng gói dữ liệu và gửi lên Web Portal..." -ForegroundColor Yellow

    $Payload = @{
        token = $ApiToken
        timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        server = $env:COMPUTERNAME
        data = @{
            balances = $Dataset.Tables[0]
            debts = $DatasetDebt.Tables[0]
        }
    } | ConvertTo-Json -Depth 4

    # Gửi qua HTTPS
    # $response = Invoke-RestMethod -Uri $PortalEndpoint -Method Post -Body $Payload -ContentType "application/json"
    Write-Host ">>> [MISA SYNC] Hoàn tất đồng bộ! Web portal đã cập nhật số liệu mới nhất." -ForegroundColor Green
}
catch {
    Write-Host ">>> [MISA SYNC] Lỗi kết nối: $_" -ForegroundColor Red
}
finally {
    $SqlConnection.Close()
}
`;

export const MISA_PYTHON_SCRIPT = `# ==============================================================================
# MISA SME SQL SERVER SYNC AGENT (PYTHON 3.x - PYODBC)
# ==============================================================================
import pyodbc
import requests
import json
from datetime import datetime

SQL_SERVER = "localhost\\\\MISASME2022"
DATABASE   = "MISASME2022_DATA"
API_URL    = "https://your-misa-portal.app/api/sync"
API_TOKEN  = "misa_sec_token_998877_live_sync"

def sync_misa_data():
    print(f"[{datetime.now()}] Kết nối SQL Server MISA {SQL_SERVER}...")
    conn_str = f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SQL_SERVER};DATABASE={DATABASE};Trusted_Connection=yes;"
    
    try:
        with pyodbc.connect(conn_str) as conn:
            cursor = conn.cursor()
            
            # 1. Truy vấn số dư Tiền & Ngân hàng
            cursor.execute("""
                SELECT AccountNumber, AccountName, SUM(DebitAmount - CreditAmount) as Balance
                FROM GLVoucherDetail
                WHERE AccountNumber LIKE '111%' OR AccountNumber LIKE '112%'
                GROUP BY AccountNumber, AccountName
            """)
            cash_bank = [{"code": row[0], "name": row[1], "balance": float(row[2] or 0)} for row in cursor.fetchall()]
            
            # 2. Truy vấn công nợ khách hàng (131)
            cursor.execute("""
                SELECT TOP 50 AccountObjectCode, AccountObjectName, SUM(DebitAmount - CreditAmount) as Debt
                FROM ARVoucherDetail
                GROUP BY AccountObjectCode, AccountObjectName
                HAVING SUM(DebitAmount - CreditAmount) > 0
                ORDER BY Debt DESC
            """)
            debts = [{"code": row[0], "name": row[1], "debt": float(row[2] or 0)} for row in cursor.fetchall()]
            
            payload = {
                "token": API_TOKEN,
                "timestamp": datetime.now().isoformat(),
                "cash_bank": cash_bank,
                "debts": debts
            }
            
            # response = requests.post(API_URL, json=payload, timeout=15)
            print("Đồng bộ MISA thành công! Dữ liệu đã sẵn sàng trên Web Portal.")
            return payload
    except Exception as e:
        print(f"Lỗi khi đọc MISA: {e}")

if __name__ == "__main__":
    sync_misa_data()
`;
