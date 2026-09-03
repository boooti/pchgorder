import React, { useState, useEffect } from 'react';
import { Coffee, Copy, Check, MessageSquare, Clock, Phone, MapPin, X, AlertCircle, ShoppingBag, Send, Trash2, Users } from 'lucide-react';
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
          <p className="font-bold text-navy-950 text-xs">Đang kiểm tra danh sách đơn của nhóm...</p>
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
            Bạn chưa mở phiên order nào cho hôm nay. Vui lòng chọn <b>TẠO NHÓM MỚI</b> ở màn hình chính!
          </p>
          <button onClick={onClose} className="px-5 py-2.5 bg-navy-950 text-white font-bold text-xs rounded-xl">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const { session, stats, orderedList, notOrderedList = [] } = data;
  const totalGroupMembers = stats.totalAllowed || stats.totalEmployees || 0;

  // Build Formatted Store Order Message
  const buildStoreMessage = () => {
    let msg = `🥤 [ĐƠN HÀNG ĐẶT NƯỚC - PHÚ CƯỜNG HOÀNG GIA]\n`;
    msg += `📍 Quán: ${session.store_name || session.storeName || 'Quán Đặt Nước'}\n`;
    msg += `👤 Người nhận: ${session.recipient_name || currentUser?.name} (${session.recipient_phone || 'SĐT'})\n`;
    msg += `🏢 Địa chỉ: ${session.delivery_address || 'Cổng sau Công ty Phú Cường - Số 1 Hà Huy Tập'}\n`;
    msg += `⏱️ Giờ giao dự kiến: ${session.delivery_time || '14:30'}\n`;
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
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-navy-950">
          
          {/* Summary Banner with Order Progress Stats */}
          <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white p-4 rounded-2xl border border-navy-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={session.store_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=150&q=80'}
                  alt={session.store_name}
                  className="w-12 h-12 rounded-xl object-cover border border-white/20 flex-shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-base text-white">{session.store_name || session.storeName || 'Quán Đặt Nước'}</h4>
                  <p className="text-xs text-amber-300 font-bold">
                    Tổng tiền: {new Intl.NumberFormat('vi-VN').format(stats.totalAmount)}đ ({stats.totalCups} ly)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-300 block uppercase font-extrabold">Tiến độ nạp đơn</span>
                <span className="text-sm font-black text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/40 inline-block">
                  {stats.orderedCount}/{totalGroupMembers} người
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-emerald-300">✓ Đã đặt: {stats.orderedCount} người ({stats.totalCups} ly)</span>
                <span className="text-amber-300">⏳ Chưa đặt: {stats.notOrderedCount} người</span>
              </div>
              <div className="w-full h-2.5 bg-navy-950 rounded-full overflow-hidden flex border border-white/10">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${totalGroupMembers > 0 ? (stats.orderedCount / totalGroupMembers) * 100 : 0}%` }}
                />
                <div
                  className="bg-amber-500/70 h-full transition-all duration-500"
                  style={{ width: `${totalGroupMembers > 0 ? (stats.notOrderedCount / totalGroupMembers) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Section: NOT ORDERED YET (Members pending) */}
          {notOrderedList.length > 0 && (
            <div className="bg-amber-50/90 p-3.5 rounded-2xl border border-amber-300/80 space-y-2">
              <div className="flex items-center justify-between text-amber-950 font-black text-xs">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>DANH SÁCH {notOrderedList.length} THÀNH VIÊN CHƯA ĐẶT NƯỚC</span>
                </span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                  Cần nhắc nhở
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                {notOrderedList.map(emp => (
                  <span
                    key={emp.id}
                    className="px-2.5 py-1 bg-white text-navy-950 font-bold text-[11px] rounded-xl border border-amber-300 shadow-2xs flex items-center gap-1"
                  >
                    <span>{emp.name}</span>
                    <span className="text-[9px] text-slate-500 font-medium">({emp.department || 'VP'})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Section: ORDERED MEMBERS LIST */}
          <div className="space-y-2">
            <label className="font-extrabold uppercase tracking-wider text-navy-400 block whitespace-nowrap">
              Chi tiết món nước những người ĐÃ ĐẶT ({orderedList.length} người)
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {orderedList.length === 0 ? (
                <p className="text-center py-4 text-slate-400 italic bg-slate-50 rounded-xl border border-slate-200">
                  Chưa có thành viên nào nạp đơn vào nhóm
                </p>
              ) : (
                orderedList.map((order, i) => (
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
                ))
              )}
            </div>
          </div>

          {/* Formatted Message Preview for Store */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="font-extrabold uppercase tracking-wider text-navy-400 block whitespace-nowrap flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>Nội dung tin nhắn dán Zalo/Messenger gửi Quán</span>
              </label>

              <button
                onClick={handleCopyMessage}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-navy-950 font-black text-xs rounded-xl shadow-xs flex items-center gap-1 transition active:scale-95 whitespace-nowrap"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP GỬI QUÁN'}</span>
              </button>
            </div>

            <pre className="bg-slate-900 text-amber-300 p-4 rounded-2xl border border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-36 overflow-y-auto shadow-inner">
              {buildStoreMessage()}
            </pre>
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
