import React, { useState, useEffect } from 'react';
import { Coffee, Copy, Check, MessageSquare, Clock, Phone, MapPin, X, AlertCircle, ShoppingBag, Send, Trash2, Users, Building2, UserCheck } from 'lucide-react';
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
        <div className="bg-white rounded-3xl p-8 text-center space-y-3 shadow-2xl">
          <div className="w-10 h-10 border-4 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-bold text-navy-950 text-xs">Đang kiểm tra dữ liệu order của nhóm...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.session) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
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

  // Group Not Ordered Members by Department (VP vs BQLDA)
  const notOrderedVP = notOrderedList.filter(e => (e.department || '').toLowerCase().includes('văn phòng'));
  const notOrderedBAN = notOrderedList.filter(e => !(e.department || '').toLowerCase().includes('văn phòng'));

  // Build Formatted Store Order Message
  const buildStoreMessage = () => {
    let msg = `🥤 [ĐƠN HÀNG ĐẶT NƯỚC - PHÚ CƯỜNG HOÀNG GIA]\n`;
    msg += `📍 Quán: ${session.store_name || session.storeName || 'Quán Đặt Nước'}\n`;
    msg += `👤 Người nhận: ${session.recipient_name || currentUser?.name} (${session.recipient_phone || 'SĐT'})\n`;
    msg += `🏢 Địa chỉ: ${session.delivery_address || 'Cổng sau Công ty Phú Cường - Số 1 Hà Huy Tập'}\n`;
    msg += `⏱️ Giờ giao dự kiến: ${session.delivery_time || '14:30'}\n`;
    msg += `-----------------------------------\n\n`;

    msg += `📋 CHI TIẾT ĐƠN HÀNG (${stats.totalCups} ly):\n`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      
      {/* EXPANDED FULLSCREEN MODAL (max-w-6xl h-[92vh]) */}
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[92vh] shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-slide-up">
        
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white flex items-center justify-between border-b border-navy-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-navy-950 font-black flex items-center justify-center shadow-md flex-shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 block whitespace-nowrap">
                Bảng điều khiển người tạo nhóm
              </span>
              <h3 className="text-xl font-black text-white whitespace-nowrap">KIỂM TRA ORDER & GỬI TỔNG HỢP CHO QUÁN</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMessage}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-navy-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-900" /> : <Send className="w-4 h-4" />}
              <span>{copied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP GỬI QUÁN'}</span>
            </button>

            <button onClick={onClose} className="p-2 text-navy-300 hover:text-white rounded-full hover:bg-navy-800 transition">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 2-COLUMN RESPONSIVE MAIN BODY */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs text-navy-950">
          
          {/* LEFT COLUMN: STATS, NOT ORDERED MEMBERS & MESSAGE PREVIEW */}
          <div className="space-y-4 flex flex-col justify-between">
            
            <div className="space-y-4">
              {/* Summary Banner with Order Progress Stats */}
              <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white p-5 rounded-2xl border border-navy-800 space-y-3 shadow-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={session.store_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=150&q=80'}
                      alt={session.store_name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 flex-shrink-0 shadow-sm"
                    />
                    <div>
                      <h4 className="font-black text-lg text-white">{session.store_name || session.storeName || 'Quán Đặt Nước'}</h4>
                      <p className="text-xs text-amber-300 font-bold mt-0.5">
                        Tổng tiền đơn: <b className="text-white text-sm">{new Intl.NumberFormat('vi-VN').format(stats.totalAmount)}đ</b> ({stats.totalCups} ly món)
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-300 block uppercase font-extrabold">Tiến độ nạp đơn</span>
                    <span className="text-base font-black text-emerald-400 bg-emerald-950 px-3 py-1 rounded-xl border border-emerald-500/40 inline-block shadow-sm">
                      {stats.orderedCount}/{totalGroupMembers} người
                    </span>
                  </div>
                </div>

                {/* Animated Dual Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between text-[11px] font-extrabold">
                    <span className="text-emerald-300">✓ Đã đặt: {stats.orderedCount} người ({stats.totalCups} ly)</span>
                    <span className="text-amber-300">⏳ Chưa đặt: {stats.notOrderedCount} người</span>
                  </div>
                  <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden flex border border-white/10 shadow-inner">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${totalGroupMembers > 0 ? (stats.orderedCount / totalGroupMembers) * 100 : 0}%` }}
                    />
                    <div
                      className="bg-amber-500/80 h-full transition-all duration-500"
                      style={{ width: `${totalGroupMembers > 0 ? (stats.notOrderedCount / totalGroupMembers) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* NOT ORDERED MEMBERS SECTION (Grouped by Department) */}
              {notOrderedList.length > 0 && (
                <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-300/80 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-amber-950 font-black text-xs border-b border-amber-200/80 pb-2">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>THÀNH VIÊN CHƯA ĐẶT NƯỚC ({notOrderedList.length} người)</span>
                    </span>
                    <span className="text-[10px] font-extrabold bg-amber-200 text-amber-950 px-2.5 py-0.5 rounded-full">
                      Cần nhắc nhở
                    </span>
                  </div>

                  <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                    {/* VP Department */}
                    {notOrderedVP.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 block">🏢 Khối Văn Phòng ({notOrderedVP.length}):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {notOrderedVP.map(emp => (
                            <span
                              key={emp.id}
                              className="px-2.5 py-1 bg-white text-navy-950 font-bold text-[11px] rounded-xl border border-amber-300 shadow-2xs flex items-center gap-1"
                            >
                              <span>{emp.name}</span>
                              <span className="text-[9px] text-slate-400 font-normal">({emp.code})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* BAN Department */}
                    {notOrderedBAN.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <span className="text-[10px] font-black uppercase text-slate-500 block">🏗️ Khối BAN / BQLDA ({notOrderedBAN.length}):</span>
                        <div className="flex flex-wrap gap-1.5">
                          {notOrderedBAN.map(emp => (
                            <span
                              key={emp.id}
                              className="px-2.5 py-1 bg-white text-navy-950 font-bold text-[11px] rounded-xl border border-amber-300 shadow-2xs flex items-center gap-1"
                            >
                              <span>{emp.name}</span>
                              <span className="text-[9px] text-slate-400 font-normal">({emp.code})</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Formatted Message Preview Block for Store */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="font-extrabold uppercase tracking-wider text-navy-400 block whitespace-nowrap flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  <span>Nội dung tin nhắn dán Zalo/Messenger gửi Quán</span>
                </label>

                <button
                  onClick={handleCopyMessage}
                  className="px-3 py-1 bg-amber-400 hover:bg-amber-500 text-navy-950 font-black text-[11px] rounded-xl shadow-xs flex items-center gap-1 transition active:scale-95 whitespace-nowrap"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-900" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'ĐÃ SAO CHÉP!' : 'SAO CHÉP GỬI QUÁN'}</span>
                </button>
              </div>

              <pre className="bg-slate-900 text-amber-300 p-4 rounded-2xl border border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-48 overflow-y-auto shadow-inner leading-relaxed">
                {buildStoreMessage()}
              </pre>
            </div>

          </div>

          {/* RIGHT COLUMN: DETAILED ORDERED ITEMS LIST PER EMPLOYEE */}
          <div className="space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <label className="font-extrabold uppercase tracking-wider text-navy-950 text-xs block whitespace-nowrap flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-emerald-600" />
                <span>CHI TIẾT MÓN ĐÃ ĐẶT THEO NGUYÊN TẮC HÀNG HÀNG ({orderedList.length} người)</span>
              </label>

              <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {stats.totalCups} ly món nước
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {orderedList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-xs">Chưa có thành viên nào nạp đơn vào nhóm</p>
                </div>
              ) : (
                orderedList.map((order, i) => (
                  <div key={i} className="p-4 bg-slate-50/90 hover:bg-slate-100/90 transition rounded-2xl border border-slate-200/90 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between font-black text-navy-950 border-b border-slate-200/70 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-navy-950 text-amber-400 text-xs font-black flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-sm font-black text-navy-950">{order.employee_name}</span>
                        <span className="text-[10px] font-extrabold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {order.employee_department || 'VP'} · MNV: {order.employee_code}
                        </span>
                      </div>

                      <span className="text-amber-600 text-sm font-black">
                        {new Intl.NumberFormat('vi-VN').format(order.total_amount)}đ
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/70 space-y-0.5">
                          <div className="flex items-center justify-between font-black text-navy-950 text-xs">
                            <span className="text-navy-950">
                              {item.quantity}× {item.product_name_snapshot} ({item.size_snapshot})
                            </span>
                            <span className="text-slate-600 font-extrabold">
                              {new Intl.NumberFormat('vi-VN').format(item.subtotal)}đ
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-medium">
                            <span>{item.sugar_option} đường · {item.ice_option}</span>
                            {item.toppings && item.toppings.length > 0 && (
                              <span className="text-amber-700 font-bold block">
                                + Topping: {item.toppings.map(t => t.name).join(', ')}
                              </span>
                            )}
                            {item.note && (
                              <span className="text-slate-600 italic block mt-0.5">
                                Ghi chú: "{item.note}"
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          <button
            disabled={canceling}
            onClick={handleCancelGroup}
            className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs rounded-xl border border-red-200 shadow-xs flex items-center gap-1.5 transition active:scale-95 whitespace-nowrap"
          >
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            <span>HỦY NHÓM ORDER NÀY</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl whitespace-nowrap text-xs transition"
            >
              Đóng
            </button>

            <button
              onClick={handleCopyMessage}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-navy-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition"
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
