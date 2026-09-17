import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Download,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Voucher } from '../types/misa';
import { formatVND } from '../utils/formatters';

interface VouchersModuleProps {
  vouchers: Voucher[];
  isMasked: boolean;
  searchQuery: string;
}

export const VouchersModule: React.FC<VouchersModuleProps> = ({
  vouchers,
  isMasked,
  searchQuery,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const voucherTypes = [
    { code: 'all', label: 'Tất cả chứng từ' },
    { code: 'HĐBH', label: 'Hóa đơn bán hàng' },
    { code: 'PT', label: 'Phiếu thu' },
    { code: 'PC', label: 'Phiếu chi' },
    { code: 'PNK', label: 'Phiếu nhập kho' },
  ];

  const filteredVouchers = vouchers.filter((v) => {
    if (selectedType !== 'all' && v.type !== selectedType) {
      return false;
    }
    if (searchQuery) {
      const match =
        v.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.debitAccount.includes(searchQuery) ||
        v.creditAccount.includes(searchQuery);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Sổ Nhật Ký Chứng Từ MISA SME
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Tra cứu toàn bộ hóa đơn, phiếu thu, phiếu chi, nhập xuất kho đồng bộ từ máy chủ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Đã chuẩn bị tệp Sổ Nhật ký chung Excel!')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Sổ Nhật Ký
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {voucherTypes.map((t) => (
            <button
              key={t.code}
              onClick={() => setSelectedType(t.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedType === t.code
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Tìm thấy <strong>{filteredVouchers.length}</strong> chứng từ
        </span>
      </div>

      {/* Vouchers Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Số Chứng Từ</th>
                <th className="py-2.5 px-3">Ngày Hạch Toán</th>
                <th className="py-2.5 px-3">Phân Hệ</th>
                <th className="py-2.5 px-4">Nội Dung / Diễn Giải</th>
                <th className="py-2.5 px-4">Đối Tượng (Khách hàng / NCC)</th>
                <th className="py-2.5 px-3 text-center">TK Nợ / Có</th>
                <th className="py-2.5 px-4 text-right">Số Tiền Phát Sinh</th>
                <th className="py-2.5 px-3 text-center">Ghi Sổ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVouchers.map((voucher) => {
                const typeStyle =
                  voucher.type === 'HĐBH'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : voucher.type === 'PT'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : voucher.type === 'PC'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200';

                return (
                  <tr
                    key={voucher.id}
                    onClick={() => setSelectedVoucher(voucher)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {voucher.voucherNo}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{voucher.date}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${typeStyle}`}>
                        {voucher.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-800 font-medium max-w-sm">
                      {voucher.description}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                      {voucher.partnerName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500">
                      <span className="text-slate-800 font-semibold">{voucher.debitAccount}</span> /{' '}
                      <span>{voucher.creditAccount}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">
                      {formatVND(voucher.amount, isMasked)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã ghi sổ
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase">
                  Chi Tiết Chứng Từ MISA
                </span>
                <h3 className="text-lg font-bold text-slate-900">{selectedVoucher.voucherNo}</h3>
              </div>
              <button
                onClick={() => setSelectedVoucher(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold p-1"
              >
                ×
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Loại chứng từ:</span>
                <strong className="text-slate-900">{selectedVoucher.typeName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Ngày lập chứng từ:</span>
                <strong className="text-slate-900">{selectedVoucher.date}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Đối tượng:</span>
                <strong className="text-slate-900 text-right max-w-[240px] truncate">
                  {selectedVoucher.partnerName}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Định khoản:</span>
                <strong className="font-mono text-blue-700">
                  Nợ {selectedVoucher.debitAccount} / Có {selectedVoucher.creditAccount}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Số tiền:</span>
                <strong className="text-sm font-bold text-slate-900">
                  {formatVND(selectedVoucher.amount, isMasked)}
                </strong>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block mb-1">Diễn giải nội dung:</span>
                <div className="p-2.5 rounded bg-slate-50 text-slate-800 border border-slate-200">
                  {selectedVoucher.description}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedVoucher(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
