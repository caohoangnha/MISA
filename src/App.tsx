/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  MisaDatabaseInfo,
  CashFund,
  BankAccount,
  CustomerDebt,
  SupplierDebt,
  InventoryItem,
  Voucher,
  RevenueDataPoint,
} from './types/misa';
import {
  initialMisaDbInfo,
  initialCashFund,
  initialBankAccounts,
  initialCustomerDebts,
  initialSupplierDebts,
  initialInventory,
  initialVouchers,
  monthlyRevenueChart,
} from './data/mockMisaData';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { CashBankModule } from './components/CashBankModule';
import { ReceivablesModule } from './components/ReceivablesModule';
import { PayablesModule } from './components/PayablesModule';
import { InventoryModule } from './components/InventoryModule';
import { ProfitLossModule } from './components/ProfitLossModule';
import { VouchersModule } from './components/VouchersModule';
import { SyncSettingsModal } from './components/SyncSettingsModal';
import { AiAdvisorModal } from './components/AiAdvisorModal';
import {
  Server,
  RefreshCw,
  CheckCircle,
  ShieldCheck,
  Building,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Modals
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Accounting States
  const [dbInfo, setDbInfo] = useState<MisaDatabaseInfo>(initialMisaDbInfo);
  const [cashFund, setCashFund] = useState<CashFund>(initialCashFund);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [customerDebts, setCustomerDebts] = useState<CustomerDebt[]>(initialCustomerDebts);
  const [supplierDebts, setSupplierDebts] = useState<SupplierDebt[]>(initialSupplierDebts);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [monthlyData, setMonthlyData] = useState<RevenueDataPoint[]>(monthlyRevenueChart);

  // Manual or automatic sync action
  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = `Vừa xong (${now.toLocaleTimeString('vi-VN')} - ${now.toLocaleDateString(
        'vi-VN'
      )})`;

      setDbInfo((prev) => ({
        ...prev,
        lastSyncTime: timeStr,
        totalVouchers: prev.totalVouchers + 1,
      }));

      setIsSyncing(false);
      setSyncToast('Đã đồng bộ thành công dữ liệu mới nhất từ máy chủ MISA SME!');
      setTimeout(() => setSyncToast(null), 3500);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        dbInfo={dbInfo}
        isMasked={isMasked}
        onToggleMask={() => setIsMasked((prev) => !prev)}
        isSyncing={isSyncing}
        onManualSync={triggerSync}
        onOpenSyncSettings={() => setIsSyncModalOpen(true)}
        onOpenAiAdvisor={() => setIsAiModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Sync Toast Notification */}
      {syncToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewDashboard
            dbInfo={dbInfo}
            cashFund={cashFund}
            bankAccounts={bankAccounts}
            customerDebts={customerDebts}
            supplierDebts={supplierDebts}
            inventory={inventory}
            vouchers={vouchers}
            monthlyData={monthlyData}
            isMasked={isMasked}
            onNavigateTab={setActiveTab}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
            onOpenAiAdvisor={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'cash-bank' && (
          <CashBankModule
            cashFund={cashFund}
            bankAccounts={bankAccounts}
            vouchers={vouchers}
            isMasked={isMasked}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'receivables' && (
          <ReceivablesModule
            customerDebts={customerDebts}
            isMasked={isMasked}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'payables' && (
          <PayablesModule
            supplierDebts={supplierDebts}
            isMasked={isMasked}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryModule
            inventory={inventory}
            isMasked={isMasked}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'pnl' && (
          <ProfitLossModule
            isMasked={isMasked}
            fiscalYear={dbInfo.fiscalYear}
          />
        )}

        {activeTab === 'vouchers' && (
          <VouchersModule
            vouchers={vouchers}
            isMasked={isMasked}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {/* Sync & Server Connection Setup Modal */}
      <SyncSettingsModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        dbInfo={dbInfo}
        onUpdateDbInfo={(info) => setDbInfo((prev) => ({ ...prev, ...info }))}
        onSimulateSync={triggerSync}
      />

      {/* AI Financial Advisor Modal */}
      <AiAdvisorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        cashFund={cashFund}
        bankAccounts={bankAccounts}
        customerDebts={customerDebts}
        supplierDebts={supplierDebts}
        inventory={inventory}
        isMasked={isMasked}
      />

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">MISA Remote Web Portal</span>
            <span>•</span>
            <span>Tương thích MISA SME.NET & MISA SME 2020 - 2023 (SQL Server)</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="hover:text-blue-600 font-medium transition-colors"
            >
              Hướng dẫn kết nối Máy chủ
            </button>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Chuẩn mã hóa HTTPS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
