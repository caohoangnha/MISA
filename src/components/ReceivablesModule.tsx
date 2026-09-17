import React, { useState } from 'react';
import {
  Users,
  AlertTriangle,
  Phone,
  MessageSquare,
  Search,
  Filter,
  Download,
  Clock,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { CustomerDebt } from '../types/misa';
import { formatVND, formatShortVND } from '../utils/formatters';

interface ReceivablesModuleProps {
  customerDebts: CustomerDebt[];
  isMasked: boolean;
  searchQuery: string;
}

export const ReceivablesModule: React.FC<ReceivablesModuleProps> = ({
  customerDebts,
  isMasked,
  searchQuery,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDebt | null>(null);

  const totalReceivables = customerDebts.reduce((sum, c) => sum + c.totalDebt, 0);
  const totalOverdue = customerDebts.reduce((sum, c) => sum + c.overdueDebt, 0);
  const totalNormal = totalReceivables - totalOverdue;

  // Aging aggregates
  const agingUnder30 = customerDebts.reduce((sum, c) => sum + c.aging.under30, 0);
  const aging30to60 = customerDebts.reduce((sum, c) => sum + c.aging.from30to60, 0);
  const aging60to90 = customerDebts.reduce((sum, c) => sum + c.aging.from60to90, 0);
  const agingOver90 = customerDebts.reduce((sum, c) => sum + c.aging.over90, 0);

  // Filtered list
  const filteredCustomers = customerDebts.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const match =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.salesPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);
      if (!match) return false;
    }
    return true;
  });

  const handleSendReminder = (customer: CustomerDebt) => {
    const message = `Kính gửi ${customer.name}, Bộ phận Kế toán Công ty xin gửi thông báo số dư công nợ quá hạn là ${formatVND(customer.overdueDebt, false)}. Kính mong Quý đối tác sớm sắp xếp thanh toán. Trân trọng cảm ơn!`;
    navigator.clipboard.writeText(message);
    alert(`Đã sao chép tin nhắn nhắc nợ cho ${customer.name} vào bộ nhớ tạm! Bạn có thể dán vào Zalo/SMS/Email để gửi ngay.`);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Sổ Tổng Hợp Công Nợ Phải Thu Khách Hàng (TK 131)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi chi tiết công nợ từng khách hàng, tuổi nợ và cảnh báo nợ quá hạn đồng bộ từ MISA SME
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Đã chuẩn bị tệp Báo cáo công nợ tổng hợp & chi tiết theo tuổi nợ Excel!')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* KPI Cards: Total, In term, Overdue, Aging */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng Nợ Phải Thu (131)
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {formatVND(totalReceivables, isMasked)}
          </div>
          <p className="text-xs text-slate-500 mt-2">Tổng {customerDebts.length} khách hàng có số dư</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
            Nợ Trong Hạn
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600">
            {formatVND(totalNormal, isMasked)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Chiếm {((totalNormal / totalReceivables) * 100).toFixed(1)}% tổng dư nợ
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-xs bg-rose-50/20">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Nợ Quá Hạn Cần Thu
          </span>
          <div className="text-xl sm:text-2xl font-bold text-rose-600">
            {formatVND(totalOverdue, isMasked)}
          </div>
          <p className="text-xs text-rose-700 mt-2 font-medium">
            Chiếm {((totalOverdue / totalReceivables) * 100).toFixed(1)}% (Mức rủi ro cao)
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Nợ Khó Đòi (&gt; 90 Ngày)
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-700">
            {formatVND(agingOver90, isMasked)}
          </div>
          <p className="text-xs text-slate-500 mt-2">Cần trích lập dự phòng theo TT 200</p>
        </div>
      </div>

      {/* Debt Aging Breakdown Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Phân Tích Cơ Cấu Tuổi Nợ Khách Hàng</h3>
        <p className="text-xs text-slate-500 mb-3">
          Tỷ lệ công nợ chia theo khoảng thời gian quá hạn từ ngày phát sinh chứng từ MISA
        </p>

        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            title={`Dưới 30 ngày: ${formatShortVND(agingUnder30, isMasked)}`}
            style={{ width: `${(agingUnder30 / totalReceivables) * 100}%` }}
            className="h-full bg-emerald-500 hover:opacity-90 transition-opacity"
          />
          <div
            title={`Từ 30 - 60 ngày: ${formatShortVND(aging30to60, isMasked)}`}
            style={{ width: `${(aging30to60 / totalReceivables) * 100}%` }}
            className="h-full bg-blue-500 hover:opacity-90 transition-opacity"
          />
          <div
            title={`Từ 60 - 90 ngày: ${formatShortVND(aging60to90, isMasked)}`}
            style={{ width: `${(aging60to90 / totalReceivables) * 100}%` }}
            className="h-full bg-amber-500 hover:opacity-90 transition-opacity"
          />
          <div
            title={`Trên 90 ngày: ${formatShortVND(agingOver90, isMasked)}`}
            style={{ width: `${(agingOver90 / totalReceivables) * 100}%` }}
            className="h-full bg-rose-500 hover:opacity-90 transition-opacity"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <span className="text-slate-500 block">Dưới 30 ngày</span>
              <strong className="text-slate-800">{formatShortVND(agingUnder30, isMasked)}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
            <div>
              <span className="text-slate-500 block">30 - 60 ngày</span>
              <strong className="text-slate-800">{formatShortVND(aging30to60, isMasked)}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <span className="text-slate-500 block">60 - 90 ngày</span>
              <strong className="text-slate-800">{formatShortVND(aging60to90, isMasked)}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <div>
              <span className="text-slate-500 block">Trên 90 ngày (Rủi ro)</span>
              <strong className="text-rose-600">{formatShortVND(agingOver90, isMasked)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Lọc theo trạng thái:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất cả ({customerDebts.length})
              </button>
              <button
                onClick={() => setFilterStatus('critical')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterStatus === 'critical'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Nguy cấp ({customerDebts.filter((c) => c.status === 'critical').length})
              </button>
              <button
                onClick={() => setFilterStatus('warning')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  filterStatus === 'warning'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cảnh báo ({customerDebts.filter((c) => c.status === 'warning').length})
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Hiển thị <strong>{filteredCustomers.length}</strong> khách hàng
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Mã & Tên Khách Hàng</th>
                <th className="py-2.5 px-3">Phụ Trách</th>
                <th className="py-2.5 px-3">Hạn Nợ</th>
                <th className="py-2.5 px-3 text-right">Hạn Mức</th>
                <th className="py-2.5 px-4 text-right">Tổng Dư Nợ</th>
                <th className="py-2.5 px-4 text-right">Nợ Quá Hạn</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                <th className="py-2.5 px-4 text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 text-xs">{customer.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-blue-700 font-medium">{customer.code}</span>
                      <span>•</span>
                      <span>{customer.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {customer.salesPerson}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{customer.termDays} ngày</td>
                  <td className="py-3 px-3 text-right text-slate-500">
                    {formatShortVND(customer.debtLimit, isMasked)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 text-xs">
                    {formatVND(customer.totalDebt, isMasked)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    {customer.overdueDebt > 0 ? (
                      <span className="text-rose-600">{formatVND(customer.overdueDebt, isMasked)}</span>
                    ) : (
                      <span className="text-emerald-600 font-normal">0 ₫</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {customer.status === 'critical' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <ShieldAlert className="w-3 h-3" /> Nguy cấp
                      </span>
                    ) : customer.status === 'warning' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-3 h-3" /> Cảnh báo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> An toàn
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleSendReminder(customer)}
                        title="Sao chép tin nhắn nhắc nợ gửi Zalo / SMS"
                        className="p-1.5 rounded text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`tel:${customer.phone}`}
                        title={`Gọi điện thoại: ${customer.phone}`}
                        className="p-1.5 rounded text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
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
