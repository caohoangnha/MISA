import React from 'react';
import {
  TrendingUp,
  FileSpreadsheet,
  Download,
  Percent,
  Calculator,
  Building,
} from 'lucide-react';
import { profitLossStatement } from '../data/mockMisaData';
import { formatVND } from '../utils/formatters';

interface ProfitLossModuleProps {
  isMasked: boolean;
  fiscalYear: number;
}

export const ProfitLossModule: React.FC<ProfitLossModuleProps> = ({
  isMasked,
  fiscalYear,
}) => {
  // Key ratios
  const netRevenueItem = profitLossStatement.find((i) => i.code === '10');
  const grossProfitItem = profitLossStatement.find((i) => i.code === '20');
  const netProfitItem = profitLossStatement.find((i) => i.code === '60');

  const netRevenue = netRevenueItem ? netRevenueItem.currentYear : 1;
  const grossProfit = grossProfitItem ? grossProfitItem.currentYear : 0;
  const netProfit = netProfitItem ? netProfitItem.currentYear : 0;

  const grossMargin = ((grossProfit / netRevenue) * 100).toFixed(1);
  const netMargin = ((netProfit / netRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Báo Cáo Kết Quả Hoạt Động Kinh Doanh (P&L)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo Thông tư 200/2014/TT-BTC &amp; Thông tư 133/2016/TT-BTC • Niên độ {fiscalYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Đã chuẩn bị tệp Báo cáo Tài chính B02-DN để tải về!')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Mẫu B02-DN
          </button>
        </div>
      </div>

      {/* Margin Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Doanh Thu Thuần (Mã 10)
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900">
            {formatVND(netRevenue, isMasked)}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-2">
            ↑ +19.6% so với cùng kỳ năm trước
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Biên Lợi Nhuận Gộp (Gross Margin)
          </span>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {grossMargin}%
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Lợi nhuận gộp: {formatVND(grossProfit, isMasked)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Lợi Nhuận Sau Thuế TNDN (Mã 60)
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600">
            {formatVND(netProfit, isMasked)}
          </div>
          <div className="text-xs text-emerald-700 font-medium mt-2">
            Tỷ suất sinh lời ròng: {netMargin}%
          </div>
        </div>
      </div>

      {/* Official P&L Statement Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Bảng Báo Cáo Kết Quả Kinh Doanh Chi Tiết
            </h3>
            <p className="text-xs text-slate-500">
              Đơn vị tính: Việt Nam Đồng (VNĐ) • So sánh số liệu năm nay và năm trước
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Mẫu số B02-DN
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 w-16">Mã Số</th>
                <th className="py-2.5 px-4">Chỉ Tiêu Báo Cáo</th>
                <th className="py-2.5 px-4 text-right">Năm Nay ({fiscalYear})</th>
                <th className="py-2.5 px-4 text-right">Năm Trước ({fiscalYear - 1})</th>
                <th className="py-2.5 px-4 text-right">Tăng / Giảm (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profitLossStatement.map((row) => {
                const isHighlight =
                  row.code === '10' ||
                  row.code === '20' ||
                  row.code === '30' ||
                  row.code === '50' ||
                  row.code === '60';

                const diffAmount = row.currentYear - row.lastYear;
                const diffPct = ((diffAmount / row.lastYear) * 100).toFixed(1);
                const isPositive = diffAmount >= 0;

                return (
                  <tr
                    key={row.code}
                    className={`transition-colors ${
                      isHighlight
                        ? 'bg-slate-50/80 font-bold text-slate-900'
                        : 'hover:bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-slate-500">{row.code}</td>
                    <td className="py-3 px-4">
                      <span className={isHighlight ? 'text-slate-950 font-bold' : ''}>
                        {row.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatVND(row.currentYear, isMasked)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {formatVND(row.lastYear, isMasked)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold ${
                          isPositive ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isPositive ? `+${diffPct}%` : `${diffPct}%`}
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
