export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  balance: number;
  currency: string;
  accountCode: string; // e.g. 11211, 11212
  logoColor: string;
}

export interface CashFund {
  cashVnd: number; // 1111
  cashUsd: number; // 1112
  exchangeRate: number;
}

export interface CustomerDebt {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  salesPerson: string;
  totalDebt: number; // Số nợ hiện tại
  debtLimit: number; // Hạn mức nợ cho phép
  termDays: number; // Số ngày được nợ (hạn nợ)
  overdueDebt: number; // Nợ quá hạn
  aging: {
    under30: number;
    from30to60: number;
    from60to90: number;
    over90: number;
  };
  lastPaymentDate: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface SupplierDebt {
  id: string;
  code: string;
  name: string;
  phone: string;
  totalDebt: number;
  dueDate: string;
  dueAmount: number;
  status: 'normal' | 'due_soon' | 'overdue';
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  warehouse: string;
  minStock: number;
  currentStock: number;
  unitCost: number;
  totalValue: number;
  suggestedAction: 'ok' | 'reorder' | 'overstock';
}

export interface FinancialMetric {
  title: string;
  accountCode: string;
  currentPeriod: number;
  previousPeriod: number;
  percentageChange: number;
  isPositiveGood: boolean;
}

export interface Voucher {
  id: string;
  voucherNo: string;
  type: 'HĐBH' | 'PT' | 'PC' | 'PNK' | 'PXK' | 'PKT';
  typeName: string;
  date: string;
  description: string;
  partnerName: string;
  amount: number;
  debitAccount: string;
  creditAccount: string;
  isPosted: boolean;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface MisaDatabaseInfo {
  serverName: string;
  instanceName: string;
  databaseName: string;
  misaVersion: string; // e.g. MISA SME 2022 R26
  companyName: string;
  taxCode: string;
  fiscalYear: number;
  lastSyncTime: string;
  syncIntervalMinutes: number;
  syncStatus: 'connected' | 'syncing' | 'offline' | 'error';
  totalVouchers: number;
  apiToken: string;
  xamppUrl?: string;
  connectionMethod?: 'xampp' | 'agent' | 'upload';
  sqlAuthType?: 'windows' | 'sql';
  sqlUser?: string;
  sqlPassword?: string;
}
