import React, { useState, useEffect } from 'react';
import { Coffee, Copy, Check, MessageSquare, Clock, Phone, MapPin, X, AlertCircle, ShoppingBag, Send, Trash2 } from 'lucide-react';
import { api } from '../../api';
import { useUser } from '../../context/UserContext';
import { showToast } from '../common/Toast';

export default function MyCreatedOrdersModal({ isOpen, onClose, sessionId, onCancelSuccess }) {
  const { currentUser } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (isOpen && sessionId) {
      setLoading(true);
      api.getTodayOrders(sessionId)
        .then(res => setData(res))
        .catch(err => showToast(err.message, 'error'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, sessionId]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
        <div className="bg-white rounded-3xl p-8 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-navy-950 text-xs">Đang tải dữ liệu order của bạn...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="font-black text-lg text-navy-950">Chưa Có Nhóm Order Nào Được Tạo</h3>
          <p className="text-xs text-slate-500">
            Bạn chưa mở phiên order nào cho hôm nay. Vui lòng chọn <b>TẠO NHÓM ORDER MỚI</b> để khởi tạo nhóm nhé!
          </p>
          <button onClick={onClose} className="px-5 py-2.5 bg-navy-950 text-white font-bold text-xs rounded-xl">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const { session, stats, orderedList } = data;

  // Build Formatted Store Order Message
  const buildStoreMessage = () => {
    let msg = `🥤 [ĐƠN HÀNG ĐẶT NƯỚC - PHÚ CƯỜNG HOÀNG GIA]\n`;
    msg += `📍 Quán: ${session.store_name || session.storeName || 'Quán Đặt Nước'}\n`;
    msg += `👤 Người nhận: ${session.recipient_name || currentUser?.name} (${session.recipient_phone || 'SĐT'})\n`;
    msg += `🏢 Địa chỉ: ${session.delivery_address || 'Cổng sau Công ty Phú Cường - Số 1 Hà Huy Tập'}\n`;
    msg += `⏱️ Giờ giao dự kiến: ${session.delivery_time || '10:30'}\n`;
    msg += `-----------------------------------\n\n`;

    msg += `📋 CHI TIẾT ĐƠN HÀNG (${stats.totalCups} ly):\n`;

    // Group items by drink name & specs for quick kitchen summary
    const summaryMap = {};
    orderedList.forEach(order => {
      order.items.forEach(item => {
        const toppingsStr = item.toppings && item.toppings.length > 0
          ? ` + Topping: ${item.toppings.map(t => t.name).join(', ')}`
          : '';
        const noteStr = item.note ? ` (${item.note})` : '';
        const key = `${item.product_name_snapshot} [Size ${item.size_snapshot}] - ${item.sugar_option} đường, ${item.ice_option}${toppingsStr}${noteStr}`;
        
        summaryMap[key] = (summaryMap[key] || 0) + item.quantity;
      });
    });

    Object.entries(summaryMap).forEach(([spec, qty], index) => {
      msg += `${index + 1}. ${qty}x ${spec}\n`;
    });

    msg += `\n-----------------------------------\n`;
    msg += `💰 TỔNG CỘNG: ${new Intl.NumberFormat('vi-VN').format(stats.totalAmount)}đ (${stats.totalCups} ly)\n`;
    if (session.delivery_note) {
      msg += `📝 Ghi chú: ${session.delivery_note}\n`;
    }

    return msg;
  };

  const handleCopyMessage = () => {
    const text = buildStoreMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('🎉 Đã sao chép nội dung đơn hàng! Bạn có thể dán (Paste) để gửi Zalo cho quán.');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCancelGroup = async () => {
    if (!window.confirm('⚠️ BẠN CÓ CHẮC CHẮN MUỐN HỦY NHÓM ORDER NÀY KHÔNG?\nThao tác này sẽ xóa toàn bộ danh sách món đã đặt và đóng nhóm order này.')) {
      return;
    }

    setCanceling(true);
    try {
      await api.cancelSession(session.id, currentUser?.id);
      showToast('🎉 Đã hủy nhóm order thành công!', 'success');
      if (onCancelSuccess) onCancelSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Lỗi hủy nhóm order', 'error');
    } finally {
      setCanceling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-slide-up">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-navy-950 font-black flex items-center justify-center shadow-md flex-shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block whitespace-nowrap">
                Kết quả phiên order của bạn
              </span>
              <h3 className="text-lg font-black text-white whitespace-nowrap">KIỂM TRA ORDER BẠN ĐÃ TẠO</h3>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-navy-300 hover:text-white rounded-full hover:bg-navy-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs text-navy-950">
          
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white p-4 rounded-2xl border border-navy-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={session.store_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=150&q=80'}
                alt={session.store_name}
                className="w-12 h-12 rounded-xl object-cover border border-white/20 flex-shrink-0"
              />
              <div>
                <h4 className="font-extrabold text-base text-white">{session.store_name || session.storeName || 'Quán Đặt Nước'}</h4>
                <p className="text-xs text-amber-300 font-bold">
                  {stats.orderedCount} người đã đặt · {stats.totalCups} ly món nước
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-300 block uppercase font-bold">Tổng tiền đơn</span>
              <span className="text-lg font-black text-amber-400">
                {new Intl.NumberFormat('vi-VN').format(stats.totalAmount)}đ
              </span>
            </div>
          </div>

          {/* Formatted Message Preview for Store */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold uppercase tracking-wider text-navy-400 block whitespace-nowrap flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Nội dung tin nhắn sẵn sàng gửi cho Quán (Zalo/Messenger)</span>
              </label>

              <button
                onClick={handleCopyMessage}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-navy-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1 transition active:scale-95 whitespace-nowrap"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP GỬI QUÁN'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-amber-300 p-4 rounded-2xl border border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto shadow-inner">
              {buildStoreMessage()}
            </pre>
          </div>

          {/* Detailed Ordered Items List */}
          <div className="space-y-2">
            <label className="font-extrabold uppercase tracking-wider text-navy-400 block whitespace-nowrap">
              Danh sách chi tiết theo từng nhân viên ({orderedList.length} người)
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {orderedList.map((order, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between font-bold text-navy-950">
                    <span>{i + 1}. {order.employee_name} ({order.employee_department || 'NV'})</span>
                    <span className="text-amber-600">{new Intl.NumberFormat('vi-VN').format(order.total_amount)}đ</span>
                  </div>
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-slate-600 pl-3">
                      • {item.quantity}× {item.product_name_snapshot} ({item.size_snapshot}) - {item.sugar_option} đường, {item.ice_option}
                      {item.toppings && item.toppings.length > 0 && ` + Topping: ${item.toppings.map(t => t.name).join(', ')}`}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <button
            disabled={canceling}
            onClick={handleCancelGroup}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl border border-red-200 shadow-xs flex items-center gap-1 transition active:scale-95 whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            <span>HỦY NHÓM ORDER NÀY</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl whitespace-nowrap text-xs"
            >
              Đóng
            </button>

            <button
              onClick={handleCopyMessage}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-navy-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap"
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              <span>SAO CHÉP & GỬI NGAY CHO QUÁN</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
