import React from 'react';
import {
  Wallet,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Building,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  BankAccount,
  CashFund,
  CustomerDebt,
  SupplierDebt,
  InventoryItem,
  Voucher,
  RevenueDataPoint,
  MisaDatabaseInfo,
} from '../types/misa';
import { formatVND, formatShortVND } from '../utils/formatters';

interface OverviewDashboardProps {
  dbInfo: MisaDatabaseInfo;
  cashFund: CashFund;
  bankAccounts: BankAccount[];
  customerDebts: CustomerDebt[];
  supplierDebts: SupplierDebt[];
  inventory: InventoryItem[];
  vouchers: Voucher[];
  monthlyData: RevenueDataPoint[];
  isMasked: boolean;
  onNavigateTab: (tab: string) => void;
  onOpenSyncModal: () => void;
  onOpenAiAdvisor: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  dbInfo,
  cashFund,
  bankAccounts,
  customerDebts,
  supplierDebts,
  inventory,
  vouchers,
  monthlyData,
  isMasked,
  onNavigateTab,
  onOpenSyncModal,
  onOpenAiAdvisor,
}) => {
  // Calculations
  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const totalCashBalance = cashFund.cashVnd + cashFund.cashUsd * cashFund.exchangeRate;
  const totalAvailableFunds = totalBankBalance + totalCashBalance;

  const totalReceivables = customerDebts.reduce((sum, c) => sum + c.totalDebt, 0);
  const totalOverdueReceivables = customerDebts.reduce((sum, c) => sum + c.overdueDebt, 0);

  const totalPayables = supplierDebts.reduce((sum, s) => sum + s.totalDebt, 0);
  const totalDueSoonPayables = supplierDebts
    .filter((s) => s.status === 'due_soon' || s.status === 'overdue')
    .reduce((sum, s) => sum + s.dueAmount, 0);

  const totalInventoryValue = inventory.reduce((sum, i) => sum + i.totalValue, 0);
  const itemsBelowMinStock = inventory.filter((i) => i.currentStock < i.minStock).length;

  const currentMonthData = monthlyData[monthlyData.length - 1];

  return (
    <div className="space-y-6">
      {/* Banner status info */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                MISA SME Online Sync
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-500/20 text-orange-300 border border-orange-400/30">
                <Zap className="w-3 h-3 fill-orange-400" />
                XAMPP Bridge: C:\xampp\htdocs\misa\api.php
              </span>
              <span className="text-xs text-slate-300 hidden lg:inline">
                CSDL: {dbInfo.databaseName}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Báo Cáo Điều Hành Tài Chính & Kế Toán MISA
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Cập nhật tức thời từ máy chủ kế toán nội bộ • Niên độ tài chính {dbInfo.fiscalYear} • Đồng bộ lần cuối: {dbInfo.lastSyncTime}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              id="btn-banner-sync-guide"
              onClick={onOpenSyncModal}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors flex items-center gap-1.5"
            >
              <Building className="w-3.5 h-3.5" />
              Cấu hình Máy chủ MISA
            </button>
            <button
              id="btn-banner-ai"
              onClick={onOpenAiAdvisor}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 hover:bg-blue-400 text-white transition-all shadow-sm flex items-center gap-1.5"
            >
              Phân Tích AI
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tiền & Ngân hàng */}
        <div
          id="card-kpi-cash"
          onClick={() => onNavigateTab('cash-bank')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Tổng Quỹ & Tiền Gửi (111, 112)
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatVND(totalAvailableFunds, isMasked)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              NH: {formatShortVND(totalBankBalance, isMasked)}
            </span>
            <span className="text-slate-500">
              Quỹ: {formatShortVND(totalCashBalance, isMasked)}
            </span>
          </div>
        </div>

        {/* KPI 2: Công nợ phải thu (131) */}
        <div
          id="card-kpi-receivables"
          onClick={() => onNavigateTab('receivables')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Phải Thu Khách Hàng (131)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatVND(totalReceivables, isMasked)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Quá hạn:{' '}
              {formatShortVND(totalOverdueReceivables, isMasked)}
            </span>
            <span className="text-slate-400">
              {((totalOverdueReceivables / totalReceivables) * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* KPI 3: Phải trả nhà cung cấp (331) */}
        <div
          id="card-kpi-payables"
          onClick={() => onNavigateTab('payables')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Phải Trả Nhà Cung Cấp (331)
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatVND(totalPayables, isMasked)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-amber-700 font-medium">
              Đến hạn: {formatShortVND(totalDueSoonPayables, isMasked)}
            </span>
            <span className="text-slate-400">4 đối tác</span>
          </div>
        </div>

        {/* KPI 4: Hàng tồn kho (156) */}
        <div
          id="card-kpi-inventory"
          onClick={() => onNavigateTab('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Giá Trị Hàng Tồn Kho (156)
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatVND(totalInventoryValue, isMasked)}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span
              className={
                itemsBelowMinStock > 0
                  ? 'text-amber-600 font-medium'
                  : 'text-emerald-600 font-medium'
              }
            >
              {itemsBelowMinStock > 0
                ? `${itemsBelowMinStock} mặt hàng cần nhập`
                : 'Định mức an toàn'}
            </span>
            <span className="text-slate-400">{inventory.length} mã SKU</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-base">
                Biểu Đồ Doanh Thu & Lợi Nhuận Năm {dbInfo.fiscalYear}
              </h2>
              <p className="text-xs text-slate-500">
                Dữ liệu phát sinh tổng hợp từ Sổ cái MISA (Tài khoản 511 và 632)
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                <span className="w-3 h-3 rounded-xs bg-blue-500" /> Doanh thu (triệu ₫)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" /> Lợi nhuận gộp
              </span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickFormatter={(val) => `${val} tr`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val} triệu ₫`,
                    name === 'revenue' ? 'Doanh thu' : name === 'cost' ? 'Giá vốn' : 'Lợi nhuận gộp',
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 block">Doanh thu T9 (tạm tính)</span>
              <span className="font-bold text-slate-800 text-sm">
                {formatVND(currentMonthData.revenue * 1_000_000, isMasked)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Giá vốn T9</span>
              <span className="font-bold text-slate-800 text-sm">
                {formatVND(currentMonthData.cost * 1_000_000, isMasked)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Lãi gộp ước tính</span>
              <span className="font-bold text-emerald-600 text-sm">
                {formatVND(currentMonthData.profit * 1_000_000, isMasked)}
              </span>
            </div>
          </div>
        </div>

        {/* Bank & Cash Balances Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900 text-base">Cơ Cấu Tiền Gửi & Quỹ</h2>
              <button
                onClick={() => onNavigateTab('cash-bank')}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
              >
                Chi tiết <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Số dư thực tế khả dụng tại các tài khoản ngân hàng & két tiền mặt
            </p>

            <div className="space-y-3">
              {bankAccounts.map((account) => {
                const pct = (account.balance / totalAvailableFunds) * 100;
                return (
                  <div key={account.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-[170px]">
                        {account.bankName.split('(')[1]?.replace(')', '') || account.bankName}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {formatVND(account.balance, isMasked)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>TK: {account.accountNumber}</span>
                      <span>{pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Cash fund entry */}
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-amber-950">
                    Quỹ tiền mặt (1111 VNĐ + 1112 USD)
                  </span>
                  <span className="text-xs font-bold text-amber-950">
                    {formatVND(totalCashBalance, isMasked)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-amber-700">
                  <span>Tiền mặt két công ty</span>
                  <span>{((totalCashBalance / totalAvailableFunds) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">
              Tổng nguồn tiền lưu động:{' '}
              <strong className="text-slate-900">{formatVND(totalAvailableFunds, isMasked)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Two columns: Customer debts alert & Recent MISA Vouchers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Overdue Customers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Cảnh Báo Công Nợ Khách Hàng (TK 131)
              </h2>
              <p className="text-xs text-slate-500">
                Các khách hàng nợ lớn hoặc có khoản nợ quá hạn cần đôn đốc thu hồi
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('receivables')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
            >
              Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {customerDebts.slice(0, 4).map((debt) => (
              <div key={debt.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {debt.name}
                    </span>
                    {debt.overdueDebt > 0 && (
                      <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-rose-50 text-rose-600 border border-rose-200">
                        Quá hạn
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Mã: {debt.code} • Phụ trách: {debt.salesPerson} • Hạn nợ: {debt.termDays} ngày
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-slate-900">
                    {formatVND(debt.totalDebt, isMasked)}
                  </div>
                  {debt.overdueDebt > 0 && (
                    <div className="text-[11px] text-rose-600 font-medium">
                      Quá hạn: {formatShortVND(debt.overdueDebt, isMasked)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng công nợ KH: {formatShortVND(totalReceivables, isMasked)}</span>
            <span className="text-rose-600 font-medium">
              Quá hạn: {formatShortVND(totalOverdueReceivables, isMasked)}
            </span>
          </div>
        </div>

        {/* Recent MISA Vouchers / Invoices */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                Chứng Từ MISA Phát Sinh Mới Nhất
              </h2>
              <p className="text-xs text-slate-500">
                Ghi sổ tự động từ máy chủ MISA SME qua kết nối Web Sync
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('vouchers')}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
            >
              Xem sổ CT <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {vouchers.slice(0, 4).map((voucher) => {
              const typeColor =
                voucher.type === 'HĐBH'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : voucher.type === 'PT'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : voucher.type === 'PC'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200';

              return (
                <div key={voucher.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${typeColor}`}>
                        {voucher.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {voucher.voucherNo}
                      </span>
                      <span className="text-[11px] text-slate-400">({voucher.date})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {voucher.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-slate-900">
                      {formatVND(voucher.amount, isMasked)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Nợ {voucher.debitAccount} / Có {voucher.creditAccount}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đã ghi sổ trên MISA SME
            </span>
            <span>Tổng số {dbInfo.totalVouchers} chứng từ năm {dbInfo.fiscalYear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
