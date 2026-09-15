import React, { useState, useEffect } from 'react';
import { Copy, Check, X, MessageSquare, Edit2, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { api } from '../api';
import { showToast } from './Toast';

export default function ZaloMessageModal({ isOpen, onClose, sessionId }) {
  const [mode, setMode] = useState('GON'); // 'GON', 'CHITIET', 'THEONGUOI'
  const [message, setMessage] = useState('');
  const [originalMessage, setOriginalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (isOpen && sessionId) {
      loadMessage(mode);
    }
  }, [isOpen, sessionId, mode]);

  async function loadMessage(targetMode) {
    try {
      setLoading(true);
      const res = await api.getExportMessage(sessionId, targetMode);
      if (res.success) {
        setMessage(res.data.message);
        setOriginalMessage(res.data.message);
        setSummaryData(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      showToast('Đã copy tin nhắn vào bộ nhớ tạm! Bạn có thể dán ngay vào Zalo/Messenger.', 'success');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      showToast('Lỗi copy clipboard: ' + err.message, 'error');
    }
  };

  const handleResetMessage = () => {
    setMessage(originalMessage);
    showToast('Đã khôi phục tin nhắn mẫu ban đầu', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Xuất tin nhắn gửi Quán</h3>
              <p className="text-xs text-blue-200/80">
                Định dạng chuẩn Zalo & Messenger • Copy 1-chạm không cần chỉnh sửa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Pills & KPI Info */}
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setMode('GON')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'GON'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GỌN (Gom món)
            </button>
            <button
              onClick={() => setMode('CHITIET')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'CHITIET'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CHI TIẾT
            </button>
            <button
              onClick={() => setMode('THEONGUOI')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'THEONGUOI'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              THEO NGƯỜI
            </button>
          </div>

          {summaryData && (
            <div className="text-xs font-medium text-slate-600 space-x-2">
              <span>Tổng: <b className="text-slate-900 font-mono">{summaryData.total_cups} ly</b></span>
              <span>•</span>
              <span>Thành tiền: <b className="text-blue-700 font-mono">{summaryData.total_amount_formatted}</b></span>
            </div>
          )}
        </div>

        {/* Message Editor Area */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto bg-slate-100/60 flex flex-col min-h-[250px]">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Edit2 className="w-3.5 h-3.5 text-slate-400" />
              Nội dung xem trước (Có thể chỉnh sửa text trực tiếp tại đây trước khi copy):
            </span>
            {message !== originalMessage && (
              <button
                onClick={handleResetMessage}
                className="text-blue-700 hover:underline flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                Khôi phục ban đầu
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
              Đang tổng hợp món...
            </div>
          ) : (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full flex-1 min-h-[300px] p-4 rounded-2xl bg-white border border-slate-200 text-slate-900 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-inner resize-none select-text"
              placeholder="Nội dung tin nhắn gửi quán..."
            />
          )}
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            * Mẹo: Nhấn nút Copy và dán thẳng vào hội thoại với quán trên Zalo.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={handleCopy}
              className={`flex-1 sm:flex-initial py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ĐÃ COPY TIN NHẮN!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>COPY TIN NHẮN</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
