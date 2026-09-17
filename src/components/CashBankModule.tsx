import React, { useState } from 'react';
import {
  Wallet,
  Building2,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Download,
  CreditCard,
  Layers,
} from 'lucide-react';
import { BankAccount, CashFund, Voucher } from '../types/misa';
import { formatVND, formatNumber } from '../utils/formatters';

interface CashBankModuleProps {
  cashFund: CashFund;
  bankAccounts: BankAccount[];
  vouchers: Voucher[];
  isMasked: boolean;
  searchQuery: string;
}

export const CashBankModule: React.FC<CashBankModuleProps> = ({
  cashFund,
  bankAccounts,
  vouchers,
  isMasked,
  searchQuery,
}) => {
  const [selectedBank, setSelectedBank] = useState<string>('all');

  const totalBankBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0);
  const totalCashBalance = cashFund.cashVnd + cashFund.cashUsd * cashFund.exchangeRate;
  const totalFunds = totalBankBalance + totalCashBalance;

  // Filter cash/bank vouchers (111, 112)
  const cashBankVouchers = vouchers.filter((v) => {
    const isMoneyVoucher =
      v.debitAccount.includes('111') ||
      v.creditAccount.includes('111') ||
      v.debitAccount.includes('112') ||
      v.creditAccount.includes('112') ||
      v.type === 'PT' ||
      v.type === 'PC';

    if (!isMoneyVoucher) return false;

    if (searchQuery) {
      const matchSearch =
        v.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.partnerName.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            Quản Lý Tiền Mặt & Tiền Gửi Ngân Hàng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi chi tiết số dư tài khoản 111 (Tiền mặt) và tài khoản 112 (Tiền gửi ngân hàng) từ MISA SME
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Đã chuẩn bị tệp sao kê Sổ tiền gửi & Sổ quỹ để tải về.')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Overview Cards: Total + Cash Fund */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Liquidity */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-100 uppercase tracking-wider">
              Tổng Vốn Bằng Tiền (111 + 112)
            </span>
            <Layers className="w-5 h-5 text-blue-200" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {formatVND(totalFunds, isMasked)}
          </div>
          <div className="mt-3 pt-3 border-t border-blue-400/30 flex items-center justify-between text-xs text-blue-100">
            <span>Tiền gửi: {((totalBankBalance / totalFunds) * 100).toFixed(0)}%</span>
            <span>Tiền mặt: {((totalCashBalance / totalFunds) * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Cash Fund Card (1111 VNĐ & 1112 USD) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Két Tiền Mặt Tại Doanh Nghiệp (TK 111)
            </span>
            <Wallet className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatVND(totalCashBalance, isMasked)}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>TK 1111 (Tiền mặt VNĐ):</span>
              <strong className="text-slate-800">{formatVND(cashFund.cashVnd, isMasked)}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>TK 1112 (Ngoại tệ):</span>
              <strong className="text-slate-800">
                {isMasked ? '•••• USD' : `$${formatNumber(cashFund.cashUsd)} (~${formatVND(cashFund.cashUsd * cashFund.exchangeRate, false)})`}
              </strong>
            </div>
          </div>
        </div>

        {/* Bank Balances Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tổng Tiền Gửi Ngân Hàng (TK 112)
            </span>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {formatVND(totalBankBalance, isMasked)}
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Số tài khoản đang mở:</span>
              <strong className="text-slate-800">{bankAccounts.length} ngân hàng</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Trạng thái đối chiếu:</span>
              <span className="text-emerald-600 font-semibold">Khớp sổ phụ ngân hàng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bank Accounts Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          Chi Tiết Tài Khoản Tiền Gửi Các Ngân Hàng (TK 1121)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 transition-all"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${account.logoColor}`} />
                  <span className="font-bold text-slate-900 text-sm truncate">
                    {account.bankName.split('(')[1]?.replace(')', '') || account.bankName}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {account.accountCode}
                </span>
              </div>

              <div className="text-lg font-extrabold text-slate-900 my-1">
                {formatVND(account.balance, isMasked)}
              </div>

              <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span>Số TK:</span>
                  <span className="font-mono font-medium text-slate-700">{account.accountNumber}</span>
                </div>
                <div className="truncate" title={account.branch}>
                  CN: {account.branch}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cash & Bank Journal / Sổ quỹ thu chi */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Nhật Ký Thu - Chi & Giao Dịch Ngân Hàng MISA Gần Đây
            </h3>
            <p className="text-xs text-slate-500">
              Danh sách Phiếu thu (PT), Phiếu chi (PC), Giấy báo Có/Ủy nhiệm chi ghi nhận vào TK 111 & 112
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Tổng số: <strong>{cashBankVouchers.length}</strong> chứng từ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Số Chứng Từ</th>
                <th className="py-2.5 px-3">Ngày Lập</th>
                <th className="py-2.5 px-3">Loại CT</th>
                <th className="py-2.5 px-4">Diễn Giải Nội Dung</th>
                <th className="py-2.5 px-4">Đối Tượng Giao Dịch</th>
                <th className="py-2.5 px-3">ĐK (Nợ/Có)</th>
                <th className="py-2.5 px-4 text-right">Số Tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cashBankVouchers.map((v) => {
                const isIncome = v.type === 'PT' || v.debitAccount.startsWith('11');
                return (
                  <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{v.voucherNo}</td>
                    <td className="py-3 px-3 text-slate-600">{v.date}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          isIncome
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {v.typeName}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 max-w-xs truncate" title={v.description}>
                      {v.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate">
                      {v.partnerName}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      Nợ {v.debitAccount} / Có {v.creditAccount}
                    </td>
                    <td className="py-3 px-4 text-right font-bold">
                      <span
                        className={`flex items-center justify-end gap-1 ${
                          isIncome ? 'text-emerald-600' : 'text-slate-800'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        {formatVND(v.amount, isMasked)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
