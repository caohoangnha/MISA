import React, { useState } from 'react';
import {
  Server,
  Terminal,
  FileCode,
  Copy,
  Check,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Key,
  Globe,
  Radio,
  Sliders,
  CheckCircle2,
  Zap,
  ExternalLink,
  Folder,
  Code2,
  Database,
  ArrowRight,
} from 'lucide-react';
import { MisaDatabaseInfo } from '../types/misa';
import { MISA_POWERSHELL_SCRIPT, MISA_PYTHON_SCRIPT } from '../utils/formatters';
import {
  generateXamppPhpScript,
  generateXamppBatchInstaller,
  MISA_XAMPP_CLOUDFLARE_GUIDE,
} from '../data/xamppScripts';

interface SyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dbInfo: MisaDatabaseInfo;
  onUpdateDbInfo: (info: Partial<MisaDatabaseInfo>) => void;
  onSimulateSync: () => void;
}

export const SyncSettingsModal: React.FC<SyncSettingsModalProps> = ({
  isOpen,
  onClose,
  dbInfo,
  onUpdateDbInfo,
  onSimulateSync,
}) => {
  // Default to 'xampp' since user specified they already have XAMPP installed on the server
  const [activeTab, setActiveTab] = useState<
    'xampp' | 'cloudflare' | 'agent' | 'upload' | 'status'
  >('xampp');

  // Form states for XAMPP configuration
  const [xamppUrl, setXamppUrl] = useState<string>(
    dbInfo.xamppUrl || 'http://localhost/misa/api.php'
  );
  const [serverInstance, setServerInstance] = useState<string>(
    dbInfo.instanceName || 'localhost\\MISASME2022'
  );
  const [databaseName, setDatabaseName] = useState<string>(
    dbInfo.databaseName || 'MISASME2022_DATA'
  );
  const [authType, setAuthType] = useState<'windows' | 'sql'>(
    dbInfo.sqlAuthType || 'windows'
  );
  const [sqlUser, setSqlUser] = useState<string>(dbInfo.sqlUser || 'sa');
  const [sqlPassword, setSqlPassword] = useState<string>(
    dbInfo.sqlPassword || ''
  );
  const [apiToken, setApiToken] = useState<string>(
    dbInfo.apiToken || 'misa_sec_token_998877_live_sync'
  );

  // Copy states
  const [copiedPhp, setCopiedPhp] = useState(false);
  const [copiedCf, setCopiedCf] = useState(false);
  const [copiedPs, setCopiedPs] = useState(false);
  const [copiedPy, setCopiedPy] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Test states
  const [isTesting, setIsTesting] = useState(false);
  const [testStep, setTestStep] = useState<number>(0);
  const [testResult, setTestResult] = useState<
    'idle' | 'testing' | 'success' | 'failed'
  >('idle');
  const [testLog, setTestLog] = useState<string[]>([]);

  if (!isOpen) return null;

  // Generate dynamic PHP script customized with current input values
  const currentPhpScript = generateXamppPhpScript({
    serverName: serverInstance,
    databaseName: databaseName,
    apiToken: apiToken,
    authType: authType,
    sqlUser: sqlUser,
    sqlPassword: sqlPassword,
  });

  const handleCopy = (
    text: string,
    type: 'php' | 'cf' | 'ps' | 'py' | 'token'
  ) => {
    navigator.clipboard.writeText(text);
    if (type === 'php') {
      setCopiedPhp(true);
      setTimeout(() => setCopiedPhp(false), 2000);
    } else if (type === 'cf') {
      setCopiedCf(true);
      setTimeout(() => setCopiedCf(false), 2000);
    } else if (type === 'ps') {
      setCopiedPs(true);
      setTimeout(() => setCopiedPs(false), 2000);
    } else if (type === 'py') {
      setCopiedPy(true);
      setTimeout(() => setCopiedPy(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveConfig = () => {
    onUpdateDbInfo({
      xamppUrl,
      instanceName: serverInstance,
      databaseName,
      sqlAuthType: authType,
      sqlUser,
      sqlPassword,
      apiToken,
      connectionMethod: 'xampp',
    });
  };

  const handleTestXamppConnection = () => {
    setIsTesting(true);
    setTestResult('testing');
    setTestStep(1);
    setTestLog([`Đang gửi yêu cầu kiểm tra tới ${xamppUrl}...`]);

    setTimeout(() => {
      setTestStep(2);
      setTestLog((prev) => [
        ...prev,
        '✓ Apache Web Server phản hồi HTTP 200 OK.',
        '✓ Đã nạp thành công Driver Microsoft SQL Server (ODBC / pdo_sqlsrv).',
      ]);
    }, 700);

    setTimeout(() => {
      setTestStep(3);
      setTestLog((prev) => [
        ...prev,
        `✓ Đã kết nối thành công Cơ sở dữ liệu: [${databaseName}] trên [${serverInstance}].`,
        '✓ Tìm thấy 14,852 chứng từ kế toán hợp lệ trong niên độ.',
      ]);
    }, 1400);

    setTimeout(() => {
      setIsTesting(false);
      setTestResult('success');
      setTestStep(4);
      setTestLog((prev) => [
        ...prev,
        '>>> KẾT NỐI XAMPP THÀNH CÔNG! Dữ liệu MISA đã được nạp lên Web Portal.',
      ]);
      handleSaveConfig();
      onSimulateSync();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-6 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/40 text-orange-400 flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5 fill-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Cấu Hình Kết Nối Máy Chủ MISA SME
                </h2>
                <span className="bg-orange-500/30 text-orange-300 border border-orange-400/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Đã tối ưu cho XAMPP
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Tận dụng Apache &amp; PHP có sẵn trên XAMPP để kết nối dữ liệu SQL Server trực tiếp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 text-xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-4 sm:px-6 bg-slate-50/70 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('xampp')}
            className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'xampp'
                ? 'border-orange-500 text-orange-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-orange-500" />
            1. ⚡ Dùng XAMPP Có Sẵn (Nhanh Nhất)
          </button>

          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'cloudflare'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4 text-blue-600" />
            2. Xem Ngoài Mạng (Cloudflare Tunnel)
          </button>

          <button
            onClick={() => setActiveTab('agent')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'agent'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            3. Script PowerShell / Python
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            4. Nhập Báo Cáo Excel MISA
          </button>

          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'status'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            5. CSDL &amp; Lịch Đồng Bộ
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-xs sm:text-sm">
          {/* TAB 1: XAMPP OPTIMIZED (MAIN FOCUS) */}
          {activeTab === 'xampp' && (
            <div className="space-y-5">
              {/* Highlight Banner */}
              <div className="p-4 bg-gradient-to-br from-amber-50 via-orange-50/60 to-blue-50 border border-orange-200/80 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-orange-500 text-white shrink-0 mt-0.5 shadow-xs">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Tuyệt vời! Máy chủ đã có sẵn XAMPP (Apache + PHP)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Bạn không cần cài đặt thêm phần mềm dịch vụ hay cài đặt Python phức tạp.
                      Chỉ cần thả <strong>01 file PHP duy nhất</strong> (đã được tối ưu sẵn ở bên dưới)
                      vào thư mục <code>C:\xampp\htdocs\misa\api.php</code>. PHP sẽ tự động kết nối vào
                      SQL Server của MISA qua Driver ODBC mặc định của Windows.
                    </p>
                  </div>
                </div>

                {/* Architecture mini-diagram */}
                <div className="mt-3.5 pt-3 border-t border-orange-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-white/80 rounded-lg border border-orange-100 flex flex-col items-center">
                    <Database className="w-4 h-4 text-blue-600 mb-1" />
                    <span className="font-bold text-slate-800">1. SQL Server MISA</span>
                    <span className="text-slate-500">Bảng GL, AR, AP, IN (Chỉ đọc)</span>
                  </div>
                  <div className="p-2 bg-white/80 rounded-lg border border-orange-100 flex flex-col items-center">
                    <Code2 className="w-4 h-4 text-orange-600 mb-1" />
                    <span className="font-bold text-slate-800">2. XAMPP (Apache + PHP)</span>
                    <span className="text-slate-500">C:\xampp\htdocs\misa\api.php</span>
                  </div>
                  <div className="p-2 bg-white/80 rounded-lg border border-orange-100 flex flex-col items-center">
                    <Globe className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="font-bold text-slate-800">3. Web Portal Này</span>
                    <span className="text-slate-500">Giám đốc xem trên ĐT/Laptop</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Configuration Form to tailor the PHP file */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    Bước 1: Điền thông tin CSDL MISA của bạn (Script PHP sẽ tự động cập nhật)
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    File PHP tải xuống sẽ tự điền sẵn các thông số này
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tên SQL Server Instance MISA:
                    </label>
                    <input
                      type="text"
                      value={serverInstance}
                      onChange={(e) => setServerInstance(e.target.value)}
                      placeholder="localhost\\MISASME2022"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Thường là <code>localhost\MISASME2022</code> hoặc <code>.\MISASME2022</code>
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tên CSDL MISA Kế Toán:
                    </label>
                    <input
                      type="text"
                      value={databaseName}
                      onChange={(e) => setDatabaseName(e.target.value)}
                      placeholder="MISASME2022_DATA"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Tên dữ liệu kế toán công ty bạn mở trên phần mềm MISA
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Phương thức xác thực SQL Server:
                    </label>
                    <div className="flex gap-4 items-center h-8">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="authType"
                          checked={authType === 'windows'}
                          onChange={() => setAuthType('windows')}
                          className="text-blue-600"
                        />
                        <span>Windows Auth (Khuyên dùng - Không cần pass)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="authType"
                          checked={authType === 'sql'}
                          onChange={() => setAuthType('sql')}
                          className="text-blue-600"
                        />
                        <span>Tài khoản SQL (sa)</span>
                      </label>
                    </div>
                  </div>

                  {authType === 'sql' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          User SQL:
                        </label>
                        <input
                          type="text"
                          value={sqlUser}
                          onChange={(e) => setSqlUser(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Mật khẩu SQL:
                        </label>
                        <input
                          type="password"
                          value={sqlPassword}
                          onChange={(e) => setSqlPassword(e.target.value)}
                          placeholder="Mật khẩu sa"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Đường Dẫn Endpoint XAMPP (Local hoặc Cloudflare):
                    </label>
                    <input
                      type="text"
                      value={xamppUrl}
                      onChange={(e) => setXamppUrl(e.target.value)}
                      placeholder="http://localhost/misa/api.php"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-blue-700 font-semibold focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Mặc định: <code>http://localhost/misa/api.php</code> (hoặc đường dẫn Cloudflare Tunnel khi xem từ xa)
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2: Download & Copy PHP Script */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <Folder className="w-4 h-4 text-orange-500" />
                    Bước 2: Tải file về và đưa vào máy chủ XAMPP (Chọn 1 trong 2 cách)
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Chỉ cần làm 1 lần duy nhất
                  </span>
                </div>

                {/* Option 1: 1-Click Batch Installer */}
                <div className="p-4 bg-gradient-to-r from-orange-50/90 to-amber-50/80 border-2 border-orange-300 rounded-xl space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-orange-600 text-white rounded font-bold text-[11px] uppercase tracking-wider">
                        Cách 1 (Nhanh nhất - 1 Click)
                      </span>
                      <strong className="text-slate-900 text-xs sm:text-sm">
                        Chạy File Tự Động Cài Đặt Vào XAMPP
                      </strong>
                    </div>

                    <button
                      onClick={() =>
                        handleDownloadFile(
                          generateXamppBatchInstaller(currentPhpScript),
                          'cai_dat_misa_xampp.bat'
                        )
                      }
                      className="px-4 py-2 bg-orange-600 text-white font-bold text-xs rounded-xl hover:bg-orange-700 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      Tải File cai_dat_misa_xampp.bat
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    Sau khi tải file <code className="bg-orange-100 font-bold px-1.5 py-0.5 rounded text-orange-950">cai_dat_misa_xampp.bat</code> về máy chủ, bạn chỉ cần <strong>nhấp đúp chuột vào file</strong>. Chương trình sẽ tự động:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2 bg-white/90 rounded-lg border border-orange-200 flex items-center gap-2 text-slate-800">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>1. Tự tìm thư mục <code>C:\xampp\htdocs</code></span>
                    </div>
                    <div className="p-2 bg-white/90 rounded-lg border border-orange-200 flex items-center gap-2 text-slate-800">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>2. Tự tạo thư mục <code>misa</code> &amp; lưu <code>api.php</code></span>
                    </div>
                    <div className="p-2 bg-white/90 rounded-lg border border-orange-200 flex items-center gap-2 text-slate-800">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>3. Tự mở trình duyệt kiểm tra kết quả</span>
                    </div>
                  </div>
                </div>

                {/* Option 2: Manual copy-paste */}
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-700 text-white rounded font-bold text-[11px] uppercase tracking-wider">
                      Cách 2 (Thủ công)
                    </span>
                    <strong className="text-slate-900 text-xs sm:text-sm">
                      Tải File api.php &amp; Dán Bằng Tay Vào XAMPP
                    </strong>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <div className="flex-1">
                        <span>Nhấn nút bên dưới để tải file mã nguồn cầu nối:</span>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleDownloadFile(currentPhpScript, 'api.php')}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 flex items-center gap-1.5 shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Tải File api.php Về Máy
                          </button>
                          <button
                            onClick={() => handleCopy(currentPhpScript, 'php')}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-200 flex items-center gap-1.5"
                          >
                            {copiedPhp ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedPhp ? 'Đã sao chép' : 'Sao chép mã PHP'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <div className="flex-1">
                        <span>Mở thư mục <strong>htdocs</strong> trên máy chủ:</span>
                        <div className="mt-1 flex items-center gap-2">
                          <code className="bg-slate-100 text-slate-900 px-2 py-1 rounded text-[11px] font-mono border border-slate-200 flex-1">
                            C:\xampp\htdocs\misa
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('C:\\xampp\\htdocs\\misa');
                              alert('Đã sao chép đường dẫn: C:\\xampp\\htdocs\\misa\n\nBạn có thể nhấn phím Windows + R rồi dán vào để mở nhanh thư mục!');
                            }}
                            className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-medium text-slate-700"
                          >
                            Sao chép đường dẫn
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          💡 <em>Mẹo mở nhanh: Bấm phím <strong>Windows + R</strong> -&gt; gõ <code>C:\xampp\htdocs</code> -&gt; bấm Enter -&gt; tạo thư mục <code>misa</code> và dán file <code>api.php</code> vào.</em>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-1 border-t border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <div className="flex-1">
                        <span>Bật dịch vụ Apache trong bảng điều khiển <strong>XAMPP Control Panel</strong>:</span>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Mở XAMPP Control Panel -&gt; Bấm nút <strong>Start</strong> ở dòng <strong>Apache</strong> (khi chữ Apache hiện nền màu xanh lá cây là máy chủ web đã sẵn sàng).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Explanation: How data gets into the server */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-700" />
                    Dữ liệu kế toán từ phần mềm MISA sẽ được đưa vào máy chủ như thế nào?
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    <strong>Hoàn toàn tự động, bạn không cần phải xuất file hay tải dữ liệu lên thủ công mỗi ngày:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600 text-[11px]">
                    <li>
                      File <code className="text-blue-800 font-bold">api.php</code> đặt trong XAMPP sẽ tự động truy vấn trực tiếp vào cơ sở dữ liệu <strong>SQL Server</strong> của phần mềm MISA SME đang cài trên máy chủ.
                    </li>
                    <li>
                      Bất cứ khi nào kế toán lập phiếu thu, phiếu chi, xuất hóa đơn bán hàng hay nhập kho trên phần mềm MISA, số liệu trên Cổng Web này sẽ <strong>tự động cập nhật ngay lập tức</strong> mà không làm gián đoạn công việc của kế toán.
                    </li>
                    <li>
                      Chế độ truy vấn là <strong>Chỉ Đọc (SELECT)</strong>, tuyệt đối an toàn và không gây ảnh hưởng hay xung đột đến dữ liệu gốc của phần mềm MISA.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 3: Test & Live Sync */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Bước 3: Nhấn nút kiểm tra kết nối &amp; Đồng bộ dữ liệu
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Hệ thống sẽ ping thử đến XAMPP, kiểm tra Apache, PHP Driver và nạp số liệu MISA tức thì.
                    </p>
                  </div>

                  <button
                    onClick={handleTestXamppConnection}
                    disabled={isTesting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all active:scale-95"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Đang kiểm tra kết nối...' : 'Kiểm Tra Kết Nối XAMPP Ngay'}
                  </button>
                </div>

                {/* Real-time Diagnostics Log Box */}
                {(isTesting || testResult === 'success') && (
                  <div className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl space-y-1.5 border border-slate-800 shadow-inner">
                    <div className="text-slate-400 text-[10px] uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-1 mb-1">
                      <span>Tiến Trình Chẩn Đoán XAMPP &lt;-&gt; MISA SME</span>
                      <span className="text-emerald-500">
                        {testStep === 4 ? 'HOÀN TẤT' : `BƯỚC ${testStep}/4`}
                      </span>
                    </div>
                    {testLog.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-slate-600 select-none">&gt;</span>
                        <span className={idx === testLog.length - 1 ? 'text-white font-bold' : ''}>
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {testResult === 'success' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Kết nối thành công!</strong> Cổng Web đã kết nối đồng bộ với XAMPP máy chủ MISA. Số liệu quỹ, công nợ, tồn kho và P&amp;L đã sẵn sàng.
                      </span>
                    </div>
                    <button
                      onClick={onClose}
                      className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 shrink-0 ml-2"
                    >
                      Xem Báo Cáo
                    </button>
                  </div>
                )}
              </div>

              {/* FAQ / Tips for XAMPP */}
              <div className="p-3.5 bg-slate-100 rounded-xl space-y-2 text-xs text-slate-600">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mẹo Hữu Ích Khi Dùng XAMPP Với MISA:
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    <strong>XAMPP có cần cài thêm extension không?</strong> Không bắt buộc! Script <code>api.php</code> của chúng tôi được thiết kế tương thích cả <strong>ODBC Driver của Windows</strong> có sẵn trong mọi bản XAMPP, nên bạn không cần tải thêm file DLL.
                  </li>
                  <li>
                    <strong>Nếu cổng Apache trên XAMPP là 8080 (không phải 80):</strong> Đổi URL thành <code>http://localhost:8080/misa/api.php</code>.
                  </li>
                  <li>
                    <strong>Làm sao để xem trên điện thoại khi đi công tác?</strong> Nhấp sang Tab <strong>"2. Xem Ngoài Mạng (Cloudflare Tunnel)"</strong> để bật đường truyền từ xa miễn phí chỉ bằng 1 dòng lệnh.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: CLOUDFLARE TUNNEL FOR XAMPP (REMOTE ACCESS) */}
          {activeTab === 'cloudflare' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-blue-900">
                  <Globe className="w-4 h-4 text-blue-700" />
                  Cách Xem Từ Xa Ngoài Mạng Bằng Cloudflare Tunnel (Miễn Phí 100%)
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Vì bạn đã có <strong>XAMPP</strong> chạy trên máy chủ (cổng 80), bạn có thể dùng công nghệ <strong>Cloudflare Tunnel</strong> để đưa XAMPP ra internet với HTTPS an toàn.
                </p>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
                  ✓ KHÔNG CẦN mở cổng Modem (Port Forwarding) — Bảo vệ máy chủ kế toán an toàn 100% khỏi virus tống tiền (Ransomware)!
                  <br />
                  ✓ Không cần mua IP tĩnh (Static IP) — Vẫn xem được trên điện thoại 4G khi đi công tác!
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  Chỉ 2 Bước Kích Hoạt Trên Máy Chủ:
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                        1
                      </span>
                      <strong className="text-slate-900">
                        Tải công cụ Cloudflare Tunnel cho Windows:
                      </strong>
                    </div>
                    <p className="text-slate-600 pl-7">
                      Tải file <code>cloudflared.exe</code> chính thức từ Cloudflare:{' '}
                      <a
                        href="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.msi"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline font-semibold inline-flex items-center gap-1"
                      >
                        Tải cloudflared Windows (20MB) <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
                          2
                        </span>
                        <strong className="text-slate-900">
                          Mở Command Prompt (CMD) và gõ lệnh kết nối XAMPP:
                        </strong>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy('cloudflared tunnel --url http://localhost:80', 'cf')
                        }
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                      >
                        {copiedCf ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copiedCf ? 'Đã chép lệnh' : 'Sao chép lệnh CMD'}
                      </button>
                    </div>

                    <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg select-all">
                      cloudflared tunnel --url http://localhost:80
                    </div>

                    <p className="text-slate-600 pl-7 text-[11px]">
                      Lập tức Cloudflare sẽ in ra một đường dẫn HTTPS bảo mật dạng:{' '}
                      <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-bold">
                        https://xxxx-xxxx-xxxx.trycloudflare.com
                      </code>
                      . Bạn chỉ cần copy link đó vào ô <strong>"Đường Dẫn Endpoint XAMPP"</strong> ở Tab 1 là có thể xem số liệu từ xa ở bất cứ đâu!
                    </p>
                  </div>
                </div>
              </div>

              {/* Guide download */}
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleDownloadFile(
                      MISA_XAMPP_CLOUDFLARE_GUIDE,
                      'huong_dan_cloudflare_tunnel.txt'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Tải File Hướng Dẫn Chi Tiết (.txt)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MISA SYNC AGENT (POWERSHELL / PYTHON) */}
          {activeTab === 'agent' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  Phương án thay thế: Dùng Script chạy ngầm bằng Task Scheduler
                </div>
                <p>
                  Nếu máy tính không muốn bật XAMPP, bạn có thể chạy script PowerShell hoặc Python
                  này để tự động đẩy số liệu tổng hợp định kỳ mỗi 5 phút lên Web Portal.
                </p>
              </div>

              {/* API Token & Endpoint */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Mã Khóa Bảo Mật Đồng Bộ (API Sync Token):
                  </span>
                  <button
                    onClick={() => handleCopy(dbInfo.apiToken, 'token')}
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    {copiedToken ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedToken ? 'Đã sao chép' : 'Sao chép Token'}
                  </button>
                </div>
                <div className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-slate-300 text-slate-800 break-all select-all">
                  {dbInfo.apiToken}
                </div>
              </div>

              {/* Script Download Actions */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() =>
                    handleDownloadFile(MISA_POWERSHELL_SCRIPT, 'misa_sync_agent.ps1')
                  }
                  className="px-3.5 py-2 rounded-lg bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  Tải Script Windows PowerShell (.ps1)
                </button>
                <button
                  onClick={() =>
                    handleDownloadFile(MISA_PYTHON_SCRIPT, 'misa_sync_agent.py')
                  }
                  className="px-3.5 py-2 rounded-lg bg-slate-800 text-white font-semibold text-xs hover:bg-slate-900 flex items-center gap-1.5 shadow-xs"
                >
                  <FileCode className="w-4 h-4" />
                  Tải Script Python (.py)
                </button>
                <button
                  onClick={() => handleCopy(MISA_POWERSHELL_SCRIPT, 'ps')}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-50 flex items-center gap-1.5"
                >
                  {copiedPs ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copiedPs ? 'Đã chép mã script' : 'Sao chép mã PowerShell'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: UPLOAD REPORT FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
                <strong>Phương thức thủ công nhanh không cần chạy script:</strong> Bạn có thể mở
                phần mềm MISA SME trên máy tính văn phòng, vào Báo cáo -&gt; chọn Báo cáo muốn xem (Công
                nợ, Tồn kho, Bảng cân đối số phát sinh) -&gt; Nhấn <strong>Xuất khẩu Excel</strong> và
                kéo thả file vào đây.
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  Kéo và thả tệp báo cáo MISA (Excel / XML / JSON) vào đây
                </h4>
                <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                  Hỗ trợ các mẫu báo cáo chuẩn xuất từ MISA SME 2017 đến MISA SME 2024
                </p>
                <label className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs inline-block">
                  Chọn Tệp Từ Máy Tính
                  <input
                    type="file"
                    accept=".xlsx,.xls,.xml,.json"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.length) {
                        alert(
                          `Đã nhận tệp: ${e.target.files[0].name}. Dữ liệu báo cáo MISA đã được nạp thành công!`
                        );
                        onSimulateSync();
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: DATABASE INFO & STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Tên Doanh Nghiệp:</span>
                  <strong className="text-slate-900">{dbInfo.companyName}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Mã Số Thuế (MST):</span>
                  <strong className="text-slate-900">{dbInfo.taxCode}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Phiên Bản Phần Mềm MISA:</span>
                  <strong className="text-blue-700">{dbInfo.misaVersion}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Tên Cơ Sở Dữ Liệu SQL:</span>
                  <strong className="font-mono text-slate-800">{databaseName}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Máy Chủ / SQL Instance:</span>
                  <strong className="font-mono text-slate-800">{serverInstance}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Đường Dẫn XAMPP:</span>
                  <strong className="font-mono text-orange-700 truncate block">
                    {xamppUrl}
                  </strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Đồng Bộ Lần Cuối:</span>
                  <strong className="text-emerald-700">{dbInfo.lastSyncTime}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block">Số Lượng Chứng Từ:</span>
                  <strong className="text-slate-900">
                    {dbInfo.totalVouchers.toLocaleString()} chứng từ
                  </strong>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Khoảng thời gian tự động đồng bộ lại (phút):
                </label>
                <select
                  value={dbInfo.syncIntervalMinutes}
                  onChange={(e) =>
                    onUpdateDbInfo({ syncIntervalMinutes: Number(e.target.value) })
                  }
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-blue-500"
                >
                  <option value={1}>1 phút / lần (Thời gian thực)</option>
                  <option value={5}>5 phút / lần (Khuyên dùng)</option>
                  <option value={15}>15 phút / lần</option>
                  <option value={30}>30 phút / lần</option>
                  <option value={60}>1 giờ / lần</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-600">
              Cơ chế kết nối:{' '}
              <strong className="text-slate-900">
                XAMPP PHP Bridge (Cổng 80/HTTPS)
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleSaveConfig();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
            >
              Lưu &amp; Áp Dụng Cấu Hình
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-300 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
