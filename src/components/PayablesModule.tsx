import React from 'react';
import {
  CreditCard,
  AlertCircle,
  Calendar,
  Phone,
  CheckCircle2,
  Clock,
  Download,
} from 'lucide-react';
import { SupplierDebt } from '../types/misa';
import { formatVND, formatShortVND } from '../utils/formatters';

interface PayablesModuleProps {
  supplierDebts: SupplierDebt[];
  isMasked: boolean;
  searchQuery: string;
}

export const PayablesModule: React.FC<PayablesModuleProps> = ({
  supplierDebts,
  isMasked,
  searchQuery,
}) => {
  const totalPayables = supplierDebts.reduce((sum, s) => sum + s.totalDebt, 0);
  const totalDueSoon = supplierDebts
    .filter((s) => s.status === 'due_soon')
    .reduce((sum, s) => sum + s.dueAmount, 0);
  const totalOverdue = supplierDebts
    .filter((s) => s.status === 'overdue')
    .reduce((sum, s) => sum + s.dueAmount, 0);

  const filteredSuppliers = supplierDebts.filter((s) => {
    if (!searchQuery) return true;
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.phone.includes(searchQuery)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-600" />
            Sổ Tổng Hợp Công Nợ Phải Trả Nhà Cung Cấp (TK 331)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kế hoạch cân đối dòng tiền thanh toán cho nhà cung cấp vật tư & thiết bị từ MISA SME
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Đã chuẩn bị tệp Kế hoạch thanh toán công nợ Nhà cung cấp!')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng Nợ Phải Trả (TK 331)
          </span>
          <div className="text-2xl font-bold text-slate-900">
            {formatVND(totalPayables, isMasked)}
          </div>
          <p className="text-xs text-slate-500 mt-2">Gồm {supplierDebts.length} đối tác phân phối chính</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Sắp Đến Hạn (Trong 7 ngày)
          </span>
          <div className="text-2xl font-bold text-amber-700">
            {formatVND(totalDueSoon, isMasked)}
          </div>
          <p className="text-xs text-amber-600 mt-2">Cần chuẩn bị số dư tại VCB/Techcombank</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> Quá Hạn Chưa Thanh Toán
          </span>
          <div className="text-2xl font-bold text-rose-600">
            {formatVND(totalOverdue, isMasked)}
          </div>
          <p className="text-xs text-rose-600 mt-2">Cần ưu tiên chuyển khoản tránh ngừng cấp hàng</p>
        </div>
      </div>

      {/* Supplier List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">
            Danh Sách Chi Tiết Công Nợ Nhà Cung Cấp
          </h3>
          <span className="text-xs text-slate-500">
            {filteredSuppliers.length} nhà cung cấp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Mã & Tên Nhà Cung Cấp</th>
                <th className="py-2.5 px-3">Điện Thoại</th>
                <th className="py-2.5 px-3">Hạn Thanh Toán</th>
                <th className="py-2.5 px-4 text-right">Tổng Dư Nợ</th>
                <th className="py-2.5 px-4 text-right">Số Cần Thanh Toán</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                <th className="py-2.5 px-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-xs">{supplier.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono text-blue-700 mt-0.5">
                      {supplier.code}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{supplier.phone}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {supplier.dueDate}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-xs">
                    {formatVND(supplier.totalDebt, isMasked)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-amber-700">
                    {formatVND(supplier.dueAmount, isMasked)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {supplier.status === 'overdue' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Quá hạn
                      </span>
                    ) : supplier.status === 'due_soon' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Đến hạn sớm
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Bình thường
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <a
                      href={`tel:${supplier.phone}`}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-[11px] font-medium"
                    >
                      <Phone className="w-3 h-3" /> Liên hệ
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
