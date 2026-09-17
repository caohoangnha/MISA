import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
} from 'lucide-react';
import {
  CashFund,
  BankAccount,
  CustomerDebt,
  SupplierDebt,
  InventoryItem,
} from '../types/misa';
import { formatVND, formatShortVND } from '../utils/formatters';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashFund: CashFund;
  bankAccounts: BankAccount[];
  customerDebts: CustomerDebt[];
  supplierDebts: SupplierDebt[];
  inventory: InventoryItem[];
  isMasked: boolean;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  cashFund,
  bankAccounts,
  customerDebts,
  supplierDebts,
  inventory,
  isMasked,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [messages, setMessages] = useState<
    Array<{ role: 'ai' | 'user'; text: string; time: string }>
  >([
    {
      role: 'ai',
      text: `Xin chào Ban Giám Đốc! Tôi là Trợ Lý Phân Tích Tài Chính Kế Toán MISA. Tôi đã đọc toàn bộ dữ liệu tài khoản 111, 112, 131, 331 và 156 từ máy chủ của công ty.

Sau đây là 3 điểm trọng yếu cần lưu ý hôm nay:
1. **Dòng tiền khả dụng tốt**: Tổng tiền mặt và tiền gửi ngân hàng hiện có là ${formatShortVND(
        bankAccounts.reduce((s, b) => s + b.balance, 0) + cashFund.cashVnd,
        false
      )}, đủ khả năng chi trả các khoản nợ NCC đến hạn trong 30 ngày tới.
2. **Cảnh báo công nợ**: Có ${formatVND(
        customerDebts.reduce((s, c) => s + c.overdueDebt, 0),
        false
      )} nợ quá hạn. Đặc biệt công ty An Phát (245 triệu) và Thăng Long (125 triệu quá hạn) cần được bộ phận kinh doanh liên hệ thu hồi sớm.
3. **Tồn kho**: Có 3 mặt hàng trọng điểm (Server Dell R750, WiFi Aruba, Ổ cứng Server 8TB) đang dưới mức dự phòng an toàn.`,
      time: '10:45',
    },
  ]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!userQuery.trim()) return;

    const query = userQuery.trim();
    const newMsg = {
      role: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setUserQuery('');

    // Generate intelligent AI financial response based on accounting data
    setTimeout(() => {
      let reply = '';
      const lower = query.toLowerCase();

      if (lower.includes('công nợ') || lower.includes('thu hồi') || lower.includes('khách hàng')) {
        reply = `Dựa trên dữ liệu tài khoản 131 MISA SME:
- Tổng công nợ khách hàng hiện tại: ${formatVND(
          customerDebts.reduce((s, c) => s + c.totalDebt, 0),
          false
        )}.
- Khách hàng có rủi ro cao nhất: **Công ty TNHH Đầu tư & Dịch vụ An Phát** (Mã KH00219) với nợ quá hạn 185 triệu, trong đó có 65 triệu đã quá hạn trên 90 ngày. Đề xuất: Tạm dừng xuất thêm đơn hàng mới cho An Phát cho đến khi thanh toán tối thiểu 50% số nợ quá hạn.
- Nhân viên kinh doanh Nguyễn Văn Hùng và Lê Hoàng Nam cần gửi thông báo đối chiếu công nợ có đóng dấu trước ngày 25 hàng tháng.`;
      } else if (lower.includes('tiền') || lower.includes('ngân hàng') || lower.includes('chi trả')) {
        reply = `Phân tích dòng tiền & thanh khoản:
- Tổng vốn khả dụng: **${formatVND(
          bankAccounts.reduce((s, b) => s + b.balance, 0) + cashFund.cashVnd,
          false
        )}**.
- Tài khoản có số dư lớn nhất là Vietcombank (${formatShortVND(
          bankAccounts[0].balance,
          false
        )}).
- Khoản nợ nhà cung cấp sắp đến hạn trong tuần này là ${formatVND(
          220000000,
          false
        )} (FPT Synnex) và ${formatVND(
          135000000,
          false
        )} quá hạn (Cadivi).
=> Doanh nghiệp hoàn toàn đủ thanh khoản để thanh toán mà không cần vay thêm vốn lưu động ngắn hạn.`;
      } else if (lower.includes('tồn kho') || lower.includes('nhập hàng') || lower.includes('kho')) {
        reply = `Khuyến nghị quản trị hàng tồn kho (TK 156):
- Mặt hàng **Máy chủ Dell PowerEdge R750**: Hiện còn 3 chiếc (mức an toàn tối thiểu là 5 chiếc). Dự kiến chu kỳ nhập hàng mất 2-3 tuần, đề xuất lập phiếu đề xuất đặt thêm 5 chiếc ngay.
- Thiết bị phát WiFi Aruba Instant On AP505: Tồn kho chỉ còn 6 bộ tại chi nhánh HCM, đề xuất điều chuyển 10 bộ từ kho Hà Nội hoặc nhập mới.`;
      } else {
        reply = `Theo số liệu kết chuyển từ máy chủ MISA SME:
- Tình hình tài chính tổng thể của công ty đang ở trạng thái **Ổn định - Tăng trưởng tốt**.
- Biên lợi nhuận gộp đạt **28.7%**, lợi nhuận sau thuế lũy kế năm 2026 đạt 1.37 tỷ VNĐ.
- Điểm cần cải thiện lớn nhất là vòng quay công nợ phải thu (DSO) đang kéo dài lên 42 ngày so với mục tiêu 30 ngày. Đề xuất áp dụng chính sách chiết khấu 1.5% cho khách hàng thanh toán sớm trong 10 ngày.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  const quickPrompts = [
    'Đánh giá rủi ro công nợ khách hàng',
    'Kế hoạch chi trả nợ nhà cung cấp tuần này',
    'Các mặt hàng tồn kho cần nhập bổ sung',
    'Tư vấn tối ưu dòng tiền và lợi nhuận',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Trợ Lý Phân Tích Kế Toán MISA AI
              </h3>
              <p className="text-[11px] text-purple-200">
                Phân tích tự động báo cáo tài chính, công nợ & dòng tiền theo chuẩn kế toán Việt Nam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 text-lg font-bold"
          >
            ×
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    m.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick prompt suggestions */}
        <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-[11px] text-slate-500 shrink-0">Gợi ý câu hỏi:</span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => {
                setUserQuery(p);
              }}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors whitespace-nowrap"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi trợ lý AI về số liệu MISA, công nợ, dòng tiền..."
            className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-slate-900"
          />
          <button
            onClick={handleSend}
            disabled={!userQuery.trim()}
            className="p-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1 shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
