/**
 * MISA SME SQL Server Bridge Script for XAMPP (Apache + PHP)
 * Tương thích: XAMPP chạy trên Windows 10, 11, Windows Server 2016-2025
 * Hỗ trợ các phiên bản: MISA SME.NET, MISA SME 2020, 2021, 2022, 2023, 2024
 */

export function generateXamppPhpScript(config: {
  serverName?: string;
  databaseName?: string;
  apiToken?: string;
  sqlUser?: string;
  sqlPassword?: string;
  authType?: 'windows' | 'sql';
}): string {
  const server = config.serverName || 'localhost\\\\MISASME2022';
  const database = config.databaseName || 'MISASME2022_DATA';
  const token = config.apiToken || 'misa_sec_token_998877_live_sync';
  const auth = config.authType || 'windows';
  const user = config.sqlUser || 'sa';
  const pass = config.sqlPassword || '';

  return `<?php
/**
 * ==============================================================================
 * MISA SME REMOTE API BRIDGE - DÀNH CHO XAMPP (APACHE + PHP)
 * ==============================================================================
 * Vị trí lưu file: C:\\xampp\\htdocs\\misa\\api.php
 * URL kiểm tra thử nghiệm: http://localhost/misa/api.php?test=1
 *
 * Tính năng:
 * 1. Tự động tương thích cả 3 Driver kết nối SQL Server phổ biến trên Windows:
 *    - ODBC Driver (Có sẵn mặc định trong XAMPP Windows, không cần cài thêm DLL)
 *    - PDO_SQLSRV (Microsoft Official Driver)
 *    - SQLSRV Extension
 * 2. Hỗ trợ CORS: Trình duyệt web có thể gọi API trực tiếp an toàn
 * 3. Bảo mật khóa token bí mật API_TOKEN
 * 4. Truy vấn chỉ đọc (SELECT) các bảng: Sổ cái (GL), Công nợ (AR/AP), Kho (IN)
 * ==============================================================================
 */

// Bật thông báo lỗi nếu có tham số debug
if (isset($_GET['debug'])) {
    ini_set('display_errors', 1);
    error_reporting(E_ALL);
} else {
    error_reporting(0);
}

// Thiết lập Headers cho API JSON & CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Misa-Token');

// Xử lý Preflight OPTIONS Request từ Browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// CẤU HÌNH KẾT NỐI CSDL MISA SME
$CONFIG = [
    'server'    => '${server}',    // Ví dụ: localhost\\MISASME2022 hoặc .\\MISASME2022
    'database'  => '${database}',  // Tên cơ sở dữ liệu MISA của công ty
    'auth_type' => '${auth}',      // 'windows' (khuyên dùng) hoặc 'sql' (user 'sa')
    'username'  => '${user}',
    'password'  => '${pass}',
    'api_token' => '${token}',     // Mã khóa bảo mật đồng bộ
];

// 1. KIỂM TRA MÃ TOKEN BẢO MẬT (Trừ khi chạy trang chẩn đoán test=1 trên localhost)
$clientToken = '';
if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    if (preg_match('/Bearer\\s+(.*)$/i', $authHeader, $matches)) {
        $clientToken = trim($matches[1]);
    }
}
if (!$clientToken && isset($_SERVER['HTTP_X_MISA_TOKEN'])) {
    $clientToken = $_SERVER['HTTP_X_MISA_TOKEN'];
}
if (!$clientToken && isset($_REQUEST['token'])) {
    $clientToken = $_REQUEST['token'];
}

$isLocalhost = in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1', 'localhost']);
$isTestMode  = isset($_GET['test']) && $_GET['test'] == 1;

// Nếu không phải chạy test trên localhost thì bắt buộc phải đúng token
if (!($isLocalhost && $isTestMode)) {
    if (empty($clientToken) || $clientToken !== $CONFIG['api_token']) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error'   => 'Unauthorized: Mã khóa API Token không hợp lệ hoặc bị thiếu.',
            'tip'     => 'Vui lòng truyền token qua Header Authorization: Bearer <token> hoặc param ?token=<token>'
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
}

// 2. KHỞI TẠO KẾT NỐI SQL SERVER QUA ODBC HOẶC PDO/SQLSRV
$db = null;
$driverUsed = '';
$connectionError = '';

// Ưu tiên 1: Thử PDO_SQLSRV
if (extension_loaded('pdo_sqlsrv')) {
    try {
        $dsn = "sqlsrv:Server=" . $CONFIG['server'] . ";Database=" . $CONFIG['database'];
        if ($CONFIG['auth_type'] === 'windows') {
            $dsn .= ";IntegratedSecurity=true";
            $db = new PDO($dsn);
        } else {
            $db = new PDO($dsn, $CONFIG['username'], $CONFIG['password']);
        }
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $driverUsed = 'pdo_sqlsrv';
    } catch (Exception $e) {
        $connectionError .= "pdo_sqlsrv: " . $e->getMessage() . " | ";
    }
}

// Ưu tiên 2: Thử ODBC (Thường có sẵn 100% trên XAMPP Windows kết nối SQL Server)
if (!$db && function_exists('odbc_connect')) {
    try {
        if ($CONFIG['auth_type'] === 'windows') {
            $connStr = "Driver={SQL Server};Server=" . $CONFIG['server'] . ";Database=" . $CONFIG['database'] . ";Trusted_Connection=Yes;";
            $odbcConn = @odbc_connect($connStr, '', '');
        } else {
            $connStr = "Driver={SQL Server};Server=" . $CONFIG['server'] . ";Database=" . $CONFIG['database'] . ";";
            $odbcConn = @odbc_connect($connStr, $CONFIG['username'], $CONFIG['password']);
        }

        if ($odbcConn) {
            $db = $odbcConn;
            $driverUsed = 'odbc_sql_server';
        } else {
            $connectionError .= "odbc: " . odbc_errormsg() . " | ";
        }
    } catch (Exception $e) {
        $connectionError .= "odbc_exception: " . $e->getMessage() . " | ";
    }
}

// Ưu tiên 3: Thử sqlsrv_connect
if (!$db && function_exists('sqlsrv_connect')) {
    $connInfo = ["Database" => $CONFIG['database'], "CharacterSet" => "UTF-8"];
    if ($CONFIG['auth_type'] !== 'windows') {
        $connInfo["UID"] = $CONFIG['username'];
        $connInfo["PWD"] = $CONFIG['password'];
    }
    $sqlsrvConn = @sqlsrv_connect($CONFIG['server'], $connInfo);
    if ($sqlsrvConn) {
        $db = $sqlsrvConn;
        $driverUsed = 'sqlsrv_extension';
    } else {
        $errors = sqlsrv_errors();
        $connectionError .= "sqlsrv: " . ($errors ? $errors[0]['message'] : 'unknown') . " | ";
    }
}

// HÀM CHẠY SQL TRẢ VỀ MẢNG ASSOCIATIVE ARRAY
function executeQuery($db, $driverUsed, $sql) {
    $rows = [];
    if ($driverUsed === 'pdo_sqlsrv') {
        $stmt = $db->query($sql);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } elseif ($driverUsed === 'odbc_sql_server') {
        $result = @odbc_exec($db, $sql);
        if ($result) {
            while ($row = odbc_fetch_array($result)) {
                $rows[] = $row;
            }
        }
    } elseif ($driverUsed === 'sqlsrv_extension') {
        $result = @sqlsrv_query($db, $sql);
        if ($result) {
            while ($row = sqlsrv_fetch_array($result, SQLSRV_FETCH_ASSOC)) {
                $rows[] = $row;
            }
        }
    }
    return $rows;
}

// NẾU CHẠY KIỂM TRA CHẨN ĐOÁN TEST=1
if ($isTestMode) {
    $status = [
        'status'         => $db ? 'CONNECTED_SUCCESS' : 'CONNECTION_FAILED',
        'apache_server'  => $_SERVER['SERVER_SOFTWARE'] ?? 'Apache/XAMPP',
        'php_version'    => phpversion(),
        'os'             => PHP_OS,
        'driver_used'    => $driverUsed ?: 'None (Chưa có driver SQL phù hợp)',
        'misa_instance'  => $CONFIG['server'],
        'misa_database'  => $CONFIG['database'],
        'server_time'    => date('Y-m-d H:i:s'),
        'cors_enabled'   => true,
    ];

    if (!$db) {
        $status['error_detail'] = $connectionError;
        $status['troubleshoot'] = [
            '1. Đảm bảo dịch vụ SQL Server của MISA đang chạy trong Windows Services (services.msc -> SQL Server (MISASME2022)).',
            '2. Kiểm tra lại tên Instance trong file: Mặc định thường là localhost\\\\MISASME2022 hoặc .\\\\MISASME2022.',
            '3. Nếu dùng tài khoản sa: Đảm bảo SQL Server đã bật Mixed Mode Authentication (SQL Server and Windows Authentication mode).'
        ];
    } else {
        // Thử lấy số lượng chứng từ
        try {
            $testCount = executeQuery($db, $driverUsed, "SELECT COUNT(*) as Total FROM GLVoucher");
            $status['total_vouchers_found'] = isset($testCount[0]['Total']) ? intval($testCount[0]['Total']) : 0;
            $status['message'] = 'Kết nối XAMPP -> SQL Server MISA SME thành công 100%!';
        } catch (Exception $e) {
            $status['query_note'] = $e->getMessage();
        }
    }

    echo json_encode($status, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// NẾU KẾT NỐI THẤT BẠI KHI GỌI API
if (!$db) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Không thể kết nối đến SQL Server của MISA qua XAMPP.',
        'details' => $connectionError,
        'config'  => [
            'server'   => $CONFIG['server'],
            'database' => $CONFIG['database'],
            'auth'     => $CONFIG['auth_type'],
        ],
        'guide'   => 'Vui lòng mở http://localhost/misa/api.php?test=1 trên máy chủ để xem chẩn đoán chi tiết.'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// 3. XỬ LÝ CÁC HÀNH ĐỘNG DỮ LIỆU
$action = $_GET['action'] ?? 'all';
$response = [
    'success'   => true,
    'timestamp' => date('Y-m-d H:i:s'),
    'database'  => $CONFIG['database'],
    'server'    => gethostname(),
];

try {
    // 3.1. LẤY TOÀN BỘ SỐ DƯ TIỀN & NGÂN HÀNG (TK 111, 112)
    if ($action === 'all' || $action === 'cash_bank') {
        $sqlCashBank = "
            SELECT 
                AccountNumber, 
                AccountName,
                SUM(DebitAmount - CreditAmount) as ClosingBalance
            FROM GLVoucherDetail
            WHERE AccountNumber LIKE '111%' OR AccountNumber LIKE '112%'
            GROUP BY AccountNumber, AccountName
            ORDER BY AccountNumber ASC
        ";
        $response['cash_bank'] = executeQuery($db, $driverUsed, $sqlCashBank);
    }

    // 3.2. CÔNG NỢ PHẢI THU KHÁCH HÀNG (TK 131)
    if ($action === 'all' || $action === 'customers') {
        $sqlCustomerDebt = "
            SELECT TOP 50
                AccountObjectCode, 
                AccountObjectName,
                SUM(DebitAmount - CreditAmount) as TotalDebt
            FROM ARVoucherDetail
            GROUP BY AccountObjectCode, AccountObjectName
            HAVING SUM(DebitAmount - CreditAmount) > 0
            ORDER BY TotalDebt DESC
        ";
        $response['customer_debts'] = executeQuery($db, $driverUsed, $sqlCustomerDebt);
    }

    // 3.3. CÔNG NỢ PHẢI TRẢ NHÀ CUNG CẤP (TK 331)
    if ($action === 'all' || $action === 'suppliers') {
        $sqlSupplierDebt = "
            SELECT TOP 30
                AccountObjectCode, 
                AccountObjectName,
                SUM(CreditAmount - DebitAmount) as TotalDebt
            FROM APVoucherDetail
            GROUP BY AccountObjectCode, AccountObjectName
            HAVING SUM(CreditAmount - DebitAmount) > 0
            ORDER BY TotalDebt DESC
        ";
        $response['supplier_debts'] = executeQuery($db, $driverUsed, $sqlSupplierDebt);
    }

    // 3.4. BÁO CÁO TỒN KHO TỔNG HỢP (TK 156 / 152)
    if ($action === 'all' || $action === 'inventory') {
        $sqlInventory = "
            SELECT TOP 50
                ItemCode, 
                ItemName,
                StockCode,
                ClosingQuantity,
                ClosingAmount
            FROM INInventoryDetail
            ORDER BY ClosingAmount DESC
        ";
        $response['inventory'] = executeQuery($db, $driverUsed, $sqlInventory);
    }

    // 3.5. CHỨNG TỪ MỚI NHẤT
    if ($action === 'all' || $action === 'vouchers') {
        $sqlVouchers = "
            SELECT TOP 30
                VoucherNo,
                VoucherDate,
                Reason as Description,
                TotalAmount as Amount,
                IsPosted
            FROM GLVoucher
            ORDER BY VoucherDate DESC
        ";
        $response['recent_vouchers'] = executeQuery($db, $driverUsed, $sqlVouchers);
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Lỗi trong khi thực thi truy vấn MISA: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
`;
}

export const MISA_XAMPP_CLOUDFLARE_GUIDE = `# ==============================================================================
# HƯỚNG DẪN MỞ XAMPP RA NGOÀI INTERNET BẰNG CLOUDFLARE TUNNEL (MIỄN PHÍ & BẢO MẬT 100%)
# ==============================================================================
# Ưu điểm:
# 1. KHÔNG CẦN mở cổng Modem (No Port Forwarding) -> Tránh 100% Virus tống tiền
# 2. Không cần IP Tĩnh
# 3. Tự động có HTTPS bảo mật
# 4. Giám đốc có thể xem báo cáo từ điện thoại (4G) ở bất kỳ đâu trên thế giới
# ==============================================================================

# Bước 1: Tải cloudflared cho Windows (file nhẹ 20MB)
# Link tải chính thức: https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi
# Hoặc giải nén cloudflared.exe vào C:\\xampp\\

# Bước 2: Mở CMD (Command Prompt) với quyền Administrator, gõ lệnh tạo đường hầm tức thì:
cloudflared tunnel --url http://localhost:80

# Bước 3: Cloudflare sẽ cấp ngay cho bạn một đường dẫn HTTPS miễn phí, ví dụ:
# https://financial-misa-company.trycloudflare.com
# Điền link này vào ô "XAMPP Endpoint URL" trên Web Portal để kết nối từ xa!
`;

/**
 * Tạo file batch cài đặt 1-click tự động vào XAMPP cho Windows
 */
export function generateXamppBatchInstaller(phpCode: string): string {
  // Base64 encode the php code to prevent batch escaping issues
  const base64Php = btoa(unescape(encodeURIComponent(phpCode)));

  return `@echo off
chcp 65001 >nul
title CAI DAT CAU NOI MISA SME - XAMPP (TU DONG 1-CLICK)
color 1F

echo ==============================================================================
echo       BO CAI DAT TU DONG CAU NOI MISA SME VAO MAY CHU XAMPP
echo ==============================================================================
echo.

set TARGET_DIR=C:\\xampp\\htdocs\\misa
if not exist "C:\\xampp\\htdocs" (
    if exist "D:\\xampp\\htdocs" (
        set TARGET_DIR=D:\\xampp\\htdocs\\misa
    ) else (
        echo [!] Khong tim thay thu muc XAMPP o o dia C: hoac D:
        echo [*] Vui long kiem tra lai duong dan cai dat XAMPP tren may tinh nay.
        pause
        exit /b 1
    )
)

echo [*] Thu muc dich duoc chon: %TARGET_DIR%
if not exist "%TARGET_DIR%" (
    echo [*] Dang tao thu muc %TARGET_DIR% ...
    mkdir "%TARGET_DIR%"
)

echo [*] Dang ghi file api.php vao %TARGET_DIR%\\api.php ...

powershell -Command "[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String('${base64Php}')) | Out-File -Encoding utf8 -FilePath '%TARGET_DIR%\\api.php'"

if exist "%TARGET_DIR%\\api.php" (
    echo [OK] Da ghi thanh cong file api.php!
) else (
    echo [!] Ghi file that bai. Vui long chay CMD bang quyen Run as Administrator.
    pause
    exit /b 1
)

echo.
echo ==============================================================================
echo                    CAI DAT HOAN TAT THIET LAP!
echo ==============================================================================
echo 1. Hay dam bao nut [Start] o dong Apache tren XAMPP Control Panel dang chay.
echo 2. He thong dang tu dong mo trinh duyet kiem tra: http://localhost/misa/api.php?test=1
echo.
start http://localhost/misa/api.php?test=1
echo Nhan phim bat ky de dong cua so nay...
pause >nul
`;
}

