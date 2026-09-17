import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Warehouse,
  Download,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { InventoryItem } from '../types/misa';
import { formatVND, formatNumber } from '../utils/formatters';

interface InventoryModuleProps {
  inventory: InventoryItem[];
  isMasked: boolean;
  searchQuery: string;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  inventory,
  isMasked,
  searchQuery,
}) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');

  const totalValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const reorderCount = inventory.filter((item) => item.currentStock < item.minStock).length;

  const warehouses = Array.from(new Set(inventory.map((i) => i.warehouse)));

  const filteredInventory = inventory.filter((item) => {
    if (selectedWarehouse !== 'all' && item.warehouse !== selectedWarehouse) {
      return false;
    }
    if (searchQuery) {
      const match =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.warehouse.toLowerCase().includes(searchQuery.toLowerCase());
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
            <Package className="w-5 h-5 text-amber-500" />
            Báo Cáo Tồn Kho & Cảnh Báo Định Mức Vật Tư (TK 156, 152)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Dữ liệu thẻ kho, giá vốn bình quân và số lượng tồn thực tế từ MISA SME
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Đã chuẩn bị tệp Báo cáo Tổng hợp Tồn kho Excel!')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Xuất Báo Cáo Kho
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Tổng Giá Trị Hàng Tồn Kho (156)
          </span>
          <div className="text-2xl font-bold text-slate-900">
            {formatVND(totalValue, isMasked)}
          </div>
          <p className="text-xs text-slate-500 mt-2">Tổng số {inventory.length} mã mặt hàng quản lý</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-xs bg-amber-50/20">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Cảnh Báo Dưới Định Mức
          </span>
          <div className="text-2xl font-bold text-amber-700">
            {reorderCount} Mặt Hàng
          </div>
          <p className="text-xs text-amber-600 mt-2">Cần lập phiếu đề xuất mua hàng gấp</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
            Số Lượng Điểm Kho MISA
          </span>
          <div className="text-2xl font-bold text-slate-900">
            {warehouses.length} Kho Lưu Trữ
          </div>
          <p className="text-xs text-slate-500 mt-2">Hà Nội & Chi nhánh TP. Hồ Chí Minh</p>
        </div>
      </div>

      {/* Warehouse Selector & Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Lọc theo kho:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedWarehouse('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  selectedWarehouse === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất cả các kho
              </button>
              {warehouses.map((wh) => (
                <button
                  key={wh}
                  onClick={() => setSelectedWarehouse(wh)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    selectedWarehouse === wh
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {wh}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-500">
            Hiển thị <strong>{filteredInventory.length}</strong> sản phẩm
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Mã Hàng (SKU)</th>
                <th className="py-2.5 px-4">Tên Hàng Hóa & Quy Cách</th>
                <th className="py-2.5 px-3">Kho Lưu</th>
                <th className="py-2.5 px-2 text-center">ĐVT</th>
                <th className="py-2.5 px-3 text-center">Tồn Tối Thiểu</th>
                <th className="py-2.5 px-3 text-center font-bold">Tồn Thực Tế</th>
                <th className="py-2.5 px-3 text-right">Giá Vốn Đơn Vị</th>
                <th className="py-2.5 px-4 text-right">Tổng Giá Trị</th>
                <th className="py-2.5 px-3 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const isBelowMin = item.currentStock < item.minStock;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {item.code}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-sm">
                      {item.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Warehouse className="w-3 h-3 text-slate-400" />
                        {item.warehouse}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-slate-600">{item.unit}</td>
                    <td className="py-3 px-3 text-center text-slate-500">{item.minStock}</td>
                    <td className="py-3 px-3 text-center font-bold">
                      <span
                        className={`text-sm ${
                          isBelowMin ? 'text-amber-600 underline decoration-amber-300' : 'text-slate-800'
                        }`}
                      >
                        {item.currentStock}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">
                      {formatVND(item.unitCost, isMasked)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatVND(item.totalValue, isMasked)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isBelowMin ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Cần nhập hàng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Đủ tồn kho
                        </span>
                      )}
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
