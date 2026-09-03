import React, { useState, useEffect } from 'react';
import { Send, Copy, X, Edit3, Eye, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../common/Toast';

export default function MessageExporterModal({ sessionId, isOpen, onClose }) {
  const [mode, setMode] = useState('GỌN'); // 'GỌN' | 'CHI TIẾT' | 'THEO NGƯỜI'
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditingText, setIsEditingText] = useState(false);

  const fetchMessage = () => {
    if (sessionId && isOpen) {
      setLoading(true);
      api.getFormattedMessage(sessionId, mode)
        .then(res => {
          setMessageText(res.message);
        })
        .catch(err => showToast(err.message, 'error'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchMessage();
  }, [sessionId, mode, isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!messageText) return;
    navigator.clipboard.writeText(messageText);
    showToast('Đã copy tin nhắn! Hãy mở Zalo/Messenger và dán trực tiếp gửi quán.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">XUẤT TIN NHẮN GỬI QUÁN</h3>
              <p className="text-xs text-brand-100">Đã tối ưu format gửi qua Zalo / Messenger. Copy chỉ 1-click.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Export Mode Radio Pills */}
          <div>
            <label className="font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Chọn Đợt Format Tin Nhắn:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMode('GỌN')}
                className={`py-2.5 px-3 rounded-2xl border font-bold transition flex flex-col items-center justify-center ${
                  mode === 'GỌN'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>Chế độ GỌN</span>
                <span className="text-[10px] font-normal opacity-80 mt-0.5">Gom món cho quán dễ pha</span>
              </button>

              <button
                onClick={() => setMode('CHI TIẾT')}
                className={`py-2.5 px-3 rounded-2xl border font-bold transition flex flex-col items-center justify-center ${
                  mode === 'CHI TIẾT'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>CHI TIẾT</span>
                <span className="text-[10px] font-normal opacity-80 mt-0.5">Liệt kê từng ly một</span>
              </button>

              <button
                onClick={() => setMode('THEO NGƯỜI')}
                className={`py-2.5 px-3 rounded-2xl border font-bold transition flex flex-col items-center justify-center ${
                  mode === 'THEO NGƯỜI'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>THEO NGƯỜI</span>
                <span className="text-[10px] font-normal opacity-80 mt-0.5">Nhóm theo từng nhân viên</span>
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase tracking-wider text-slate-400">Xem Trước Nội Dung Tin Nhắn</span>
              <button
                onClick={() => setIsEditingText(!isEditingText)}
                className="text-brand-600 font-bold hover:underline flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingText ? 'Khóa chỉnh sửa' : 'Chỉnh sửa thủ công'}</span>
              </button>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 animate-pulse font-medium">
                Đang tổng hợp món và định dạng tin nhắn...
              </div>
            ) : isEditingText ? (
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-2xl border border-brand-300 font-mono text-slate-800 bg-brand-50/30 text-xs leading-relaxed outline-none focus:ring-2 focus:ring-brand-500"
              />
            ) : (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 font-mono text-slate-800 text-xs leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto select-all shadow-inner">
                {messageText}
              </div>
            )}
            <p className="text-[11px] text-slate-400 italic">
              * Chỉnh sửa thủ công nội dung không làm thay đổi dữ liệu đơn hàng gốc trong hệ thống.
            </p>
          </div>

        </div>

        {/* Footer 1-Click Copy */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-slate-600 font-bold"
          >
            Đóng
          </button>

          <button
            disabled={loading || !messageText}
            onClick={handleCopy}
            className="px-6 py-3 bg-gradient-to-r from-brand-600 to-amber-500 hover:from-brand-700 hover:to-amber-600 disabled:opacity-40 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-brand-500/30 flex items-center gap-2 transition active:scale-95"
          >
            <Copy className="w-4 h-4" /> COPY TIN NHẮN
          </button>
        </div>

      </div>
    </div>
  );
}
