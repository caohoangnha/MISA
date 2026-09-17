import React from 'react';
import {
  Server,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Settings,
  Building2,
  ShieldCheck,
  Search,
  Zap,
} from 'lucide-react';
import { MisaDatabaseInfo } from '../types/misa';

interface NavbarProps {
  dbInfo: MisaDatabaseInfo;
  isMasked: boolean;
  onToggleMask: () => void;
  isSyncing: boolean;
  onManualSync: () => void;
  onOpenSyncSettings: () => void;
  onOpenAiAdvisor: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  dbInfo,
  isMasked,
  onToggleMask,
  isSyncing,
  onManualSync,
  onOpenSyncSettings,
  onOpenAiAdvisor,
  searchQuery,
  onSearchChange,
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: 'overview', label: 'Bàn Làm Việc' },
    { id: 'cash-bank', label: 'Tiền & Ngân Hàng' },
    { id: 'receivables', label: 'Công Nợ Phải Thu' },
    { id: 'payables', label: 'Nợ Phải Trả NCC' },
    { id: 'inventory', label: 'Tồn Kho' },
    { id: 'pnl', label: 'Báo Cáo Lãi Lỗ' },
    { id: 'vouchers', label: 'Sổ Chứng Từ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base leading-tight">MISA Remote Portal</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  <ShieldCheck className="w-3 h-3" /> Web Viewer
                </span>
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 leading-tight">
                <Building2 className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[280px] sm:max-w-md font-medium text-slate-700">
                  {dbInfo.companyName}
                </span>
                <span className="text-slate-400">|</span>
                <span>MST: {dbInfo.taxCode}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Server status & Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* MISA Server Connection Badge */}
          <button
            id="btn-server-status"
            onClick={onOpenSyncSettings}
            title="Nhấn để xem trạng thái kết nối XAMPP máy chủ MISA & hướng dẫn cấu hình"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span className="hidden md:inline">XAMPP Server:</span>
            <span className="font-semibold text-emerald-700">Đã Kết Nối</span>
          </button>

          {/* Mask / Privacy mode button */}
          <button
            id="btn-toggle-mask"
            onClick={onToggleMask}
            title={isMasked ? 'Hiện số tiền' : 'Ẩn số tiền (chế độ bảo mật nơi công cộng)'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isMasked
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isMasked ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Bảo mật: Đang ẩn tiền</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Ẩn số tiền</span>
              </>
            )}
          </button>

          {/* Sync Button */}
          <button
            id="btn-sync-now"
            onClick={onManualSync}
            disabled={isSyncing}
            title="Đồng bộ lại dữ liệu tức thời từ máy chủ MISA"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ'}</span>
          </button>

          {/* AI Advisor Button */}
          <button
            id="btn-ai-advisor"
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Trợ lý AI</span>
          </button>

          {/* Setup / Config */}
          <button
            id="btn-settings"
            onClick={onOpenSyncSettings}
            title="Cài đặt kết nối máy chủ MISA"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation tabs & quick search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-2 py-1.5 overflow-x-auto">
        {/* Module Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Search bar */}
        <div className="relative min-w-[220px] max-w-xs self-end md:self-auto w-full md:w-auto">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="search-input"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm chứng từ, khách hàng, mã hàng..."
            className="w-full pl-8 pr-3 py-1 text-xs rounded-md border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-800 placeholder-slate-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
