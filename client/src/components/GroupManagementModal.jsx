import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserX,
  Coffee,
  DollarSign,
  Copy,
  Check,
  Lock,
  Unlock,
  MessageSquare,
  Clock,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Settings,
  ListOrdered,
  Layers,
  Phone,
  MapPin,
  Save,
  Gift
} from 'lucide-react';
import { api } from '../api';
import { showToast } from './Toast';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

export default function GroupManagementModal({
  isOpen,
  onClose,
  sessionId,
  currentUser,
  onOpenZaloModal,
  onSessionUpdated
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ORDERED'); // 'ORDERED' | 'AGGREGATE' | 'UN_ORDERED' | 'SETTINGS'
  const [actionLoading, setActionLoading] = useState(false);
  const [copyingReminder, setCopyingReminder] = useState(false);
  const [copyingAgg, setCopyingAgg] = useState(false);
  const [search, setSearch] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    close_time: '',
    notes: '',
    recipient_name: '',
    recipient_phone: '',
    delivery_address: '',
    delivery_time: '',
    delivery_note: '',
    sponsor_type: 'SELF',
    sponsor_name: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);

  useEffect(() => {
    if (isOpen && sessionId) {
      loadSessionDashboard();
    }
  }, [isOpen, sessionId]);

  async function loadSessionDashboard() {
    try {
      setLoading(true);
      const res = await api.getDashboardStats(sessionId);
      if (res.success) {
        setData(res.data);
        const s = res.data.session;
        if (s) {
          setSettingsForm({
            title: s.title || '',
            close_time: s.close_time || '',
            notes: s.notes || '',
            recipient_name: s.recipient_name_snapshot || '',
            recipient_phone: s.recipient_phone_snapshot || '',
            delivery_address: s.delivery_address_snapshot || '',
            delivery_time: s.delivery_time_snapshot || '',
            delivery_note: s.delivery_note_snapshot || '',
            sponsor_type: s.sponsor_type || 'SELF',
            sponsor_name: s.sponsor_name || ''
          });
        }
      }
    } catch (err) {
      showToast('Lỗi tải dữ liệu nhóm: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const session = data?.session;
  const kpi = data?.kpi || {};
  const isSessionClosed = session?.status !== 'OPEN';

  // Toggle paid status
  const handleTogglePayment = async (orderId, currentPaid) => {
    try {
      const nextPaid = currentPaid === 1 ? 0 : 1;
      const res = await api.toggleOrderPayment(orderId, nextPaid);
      if (res.success) {
        showToast(res.message, 'success');
        loadSessionDashboard();
      }
    } catch (err) {
      showToast('Lỗi cập nhật thanh toán: ' + err.message, 'error');
    }
  };

  // Cancel an order
  const handleCancelOrder = async (orderId, empName) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đơn đặt của "${empName}" không?`)) {
      return;
    }
    try {
      const res = await api.cancelOrder(orderId);
      if (res.success) {
        showToast('Đã hủy đơn hàng của ' + empName, 'success');
        loadSessionDashboard();
        if (onSessionUpdated) onSessionUpdated();
      }
    } catch (err) {
      showToast('Lỗi hủy đơn: ' + err.message, 'error');
    }
  };

  // Toggle close / reopen session
  const handleToggleSessionStatus = async () => {
    if (!session) return;
    try {
      setActionLoading(true);
      const res = isSessionClosed
        ? await api.reopenSession(session.id)
        : await api.closeSession(session.id);

      if (res.success) {
        showToast(res.message, 'success');
        await loadSessionDashboard();
        if (onSessionUpdated) onSessionUpdated();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Copy un-ordered reminder
  const handleCopyUnOrdered = async () => {
    if (!session) return;
    try {
      setCopyingReminder(true);
      const res = await api.getUnOrderedEmployees(session.id);
      if (res.success && res.data.reminder_text) {
        await navigator.clipboard.writeText(res.data.reminder_text);
        showToast('Đã copy danh sách nhắc nhở! Hãy dán vào nhóm chat.', 'success');
      }
    } catch (err) {
      showToast('Lỗi copy: ' + err.message, 'error');
    } finally {
      setTimeout(() => setCopyingReminder(false), 2500);
    }
  };

  // Copy aggregated text
  const handleCopyAggregate = async () => {
    if (!data?.aggregated_items || data.aggregated_items.length === 0) return;
    try {
      setCopyingAgg(true);
      let text = `📋 TỔNG HỢP GOM MÓN - ${session?.title || 'ĐỢT ORDER'}\n`;
      text += `Quán: ${session?.store_name} • Tổng: ${kpi.total_cups || 0} ly\n\n`;

      data.aggregated_items.forEach((it, idx) => {
        text += `${idx + 1}. ${it.product_name} (${it.size}) - ${it.total_quantity} ly\n`;
        it.details.forEach(d => {
          const opts = [];
          if (d.sugar) opts.push(d.sugar);
          if (d.ice) opts.push(d.ice);
          if (d.topping) opts.push(`+${d.topping}`);
          if (d.note) opts.push(`"${d.note}"`);
          text += `   • ${d.employee_name}: ${d.quantity} ly (${opts.join(' | ')})\n`;
        });
      });

      await navigator.clipboard.writeText(text);
      showToast('Đã copy bảng tổng hợp gom món!', 'success');
    } catch (err) {
      showToast('Lỗi copy: ' + err.message, 'error');
    } finally {
      setTimeout(() => setCopyingAgg(false), 2500);
    }
  };

  // Save settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!session) return;
    try {
      setSavingSettings(true);
      const res = await api.updateSessionSettings(session.id, settingsForm);
      if (res.success) {
        showToast('Đã lưu thông tin đợt order thành công!', 'success');
        await loadSessionDashboard();
        if (onSessionUpdated) onSessionUpdated();
      }
    } catch (err) {
      showToast('Lỗi lưu cài đặt: ' + err.message, 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Delete session
  const handleDeleteSession = async () => {
    if (!session) return;
    const confirmMsg = `CẢNH BÁO: Bạn có chắc chắn muốn XÓA VĨNH VIỄN đợt order "${session.title || 'này'}" không?\n\nToàn bộ các đơn hàng đã đặt trong đợt này sẽ bị xóa hoàn toàn. Hành động này không thể hoàn tác!`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingSession(true);
      const res = await api.deleteSession(session.id);
      if (res.success) {
        showToast(res.message, 'success');
        onClose();
        if (onSessionUpdated) onSessionUpdated();
      }
    } catch (err) {
      showToast('Lỗi xóa phiên: ' + err.message, 'error');
    } finally {
      setDeletingSession(false);
    }
  };

  // Filter ordered employees by search
  const filteredOrdered = (data?.ordered_employees || []).filter(emp =>
    emp.employee_name.toLowerCase().includes(search.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
  );

  // Filter un-ordered employees by search
  const filteredUnOrdered = (data?.un_ordered_employees || []).filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1">
              👑 Trưởng nhóm quản lý
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isSessionClosed ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}>
              {isSessionClosed ? '🔒 ĐÃ CHỐT ĐƠN' : '🟢 ĐANG MỞ ORDER'}
            </span>
            {session?.sponsor_type === 'SPONSOR' ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-300/20 text-amber-200 text-xs font-semibold border border-amber-300/30">
                🎁 {session.sponsor_name || 'Có người bao'} bao
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-400/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
                🤝 Tự trả tiền (Campuchia)
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>{session?.title || 'Quản lý Đợt Order'}</span>
            <span className="text-blue-300 text-base font-normal">({session?.store_name})</span>
          </h2>

          <div className="text-xs text-blue-200/80 mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>Giờ chốt: <b>{session?.close_time || '--:--'}</b></span>
            <span>Người nhận: <b>{session?.recipient_name_snapshot}</b> ({session?.recipient_phone_snapshot})</span>
            <span>Giao đến: <b>{session?.delivery_address_snapshot}</b></span>
          </div>

          {/* Quick KPI stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/15">
            <div className="bg-white/10 rounded-2xl p-2.5 text-center">
              <div className="text-[11px] text-blue-200 font-semibold uppercase">Đã Đặt</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {kpi.ordered_count || 0} <span className="text-xs font-normal">người</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center">
              <div className="text-[11px] text-blue-200 font-semibold uppercase">Tổng Số Ly</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">
                {kpi.total_cups || 0} <span className="text-xs font-normal">ly</span>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center">
              <div className="text-[11px] text-blue-200 font-semibold uppercase">Tổng Tiền</div>
              <div className="text-lg font-black text-amber-300 font-mono mt-0.5">
                {formatVND(kpi.total_amount)}đ
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-2.5 text-center">
              <div className="text-[11px] text-blue-200 font-semibold uppercase">Thu Tiền Campuchia</div>
              <div className="text-xs font-bold mt-1 text-emerald-300">
                {kpi.paid_orders_count || 0} đã trả • <span className="text-rose-300">{kpi.unpaid_orders_count || 0} chưa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 sm:px-6 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveTab('ORDERED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ORDERED'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>ĐƠN ĐÃ ĐẶT ({kpi.ordered_count || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('AGGREGATE')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'AGGREGATE'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>GOM MÓN KIỂM LY ({kpi.total_cups || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('UN_ORDERED')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'UN_ORDERED'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserX className="w-4 h-4" />
              <span>CHƯA ĐẶT ({kpi.un_ordered_count || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'SETTINGS'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>CÀI ĐẶT ĐỢT ORDER</span>
            </button>
          </div>

          <button
            onClick={loadSessionDashboard}
            disabled={loading}
            title="Tải lại dữ liệu"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-white rounded-xl transition-colors shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Đang tải dữ liệu nhóm...
            </div>
          ) : (
            <>
              {/* TAB 1: ORDERED LIST */}
              {activeTab === 'ORDERED' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm theo tên thành viên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="text-xs text-slate-500">
                      Hiển thị <b>{filteredOrdered.length}</b> đơn đặt
                    </div>
                  </div>

                  {filteredOrdered.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <Coffee className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      Chưa có bạn nào trong nhóm đặt món
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrdered.map((emp) => {
                        const isPaid = emp.is_paid === 1;
                        const orderTime = new Date(emp.created_at).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });

                        return (
                          <div
                            key={emp.order_id}
                            className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-900 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {emp.employee_name.split(' ').slice(-1)[0][0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-900 text-sm">{emp.employee_name}</span>
                                  <span className="text-xs text-slate-500">• {emp.department}</span>
                                  <span className="text-[11px] text-slate-400 font-mono">({orderTime})</span>
                                </div>

                                {/* Items list */}
                                <div className="mt-2 space-y-1">
                                  {emp.items?.map((it, idx) => {
                                    let opts = {};
                                    try { opts = JSON.parse(it.options_snapshot); } catch (e) {}
                                    return (
                                      <div key={idx} className="text-xs text-slate-700 flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-blue-900">{it.quantity}×</span>
                                        <span className="font-semibold">{it.product_name_snapshot}</span>
                                        <span className="text-slate-500">({it.size_snapshot})</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-600">{opts.sugar} đường, {opts.ice}</span>
                                        {it.topping_snapshot && (
                                          <span className="text-indigo-600 font-medium">+{it.topping_snapshot}</span>
                                        )}
                                        {opts.note && (
                                          <span className="italic text-amber-700 font-medium">"{opts.note}"</span>
                                        )}
                                        <span className="font-mono text-slate-500 font-semibold ml-auto">
                                          {formatVND(it.item_total_price)}đ
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Right side: Amount + Payment status button + Delete */}
                            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                              <div className="text-right">
                                <div className="font-black text-sm sm:text-base font-mono text-slate-900">
                                  {formatVND(emp.total_amount)}đ
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  NV trả: <b className="text-blue-700">{formatVND(emp.employee_paid_amount)}đ</b>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Toggle Payment Status */}
                                <button
                                  onClick={() => handleTogglePayment(emp.order_id, emp.is_paid)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm ${
                                    isPaid
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                                  }`}
                                  title="Bấm để chuyển trạng thái thanh toán"
                                >
                                  {isPaid ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Đã trả tiền</span>
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Chưa trả</span>
                                    </>
                                  )}
                                </button>

                                {/* Delete order */}
                                <button
                                  onClick={() => handleCancelOrder(emp.order_id, emp.employee_name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                  title="Hủy đơn của bạn này"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: AGGREGATED ITEMS (GOM MÓN) */}
              {activeTab === 'AGGREGATE' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Bảng tổng hợp gom món ({kpi.total_cups || 0} ly)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Dùng để đối chiếu số lượng và phân loại thức uống khi shipper giao tới.
                      </p>
                    </div>

                    <button
                      onClick={handleCopyAggregate}
                      disabled={copyingAgg}
                      className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm active:scale-95"
                    >
                      {copyingAgg ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Đã copy bảng gom món!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-blue-700" />
                          <span>Copy bảng gom món</span>
                        </>
                      )}
                    </button>
                  </div>

                  {(!data?.aggregated_items || data.aggregated_items.length === 0) ? (
                    <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      Chưa có món nào được đặt để tổng hợp
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {data.aggregated_items.map((item, idx) => (
                        <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-900 text-xs font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-black text-slate-900 text-sm">
                                {item.product_name}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                                Size {item.size}
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl bg-blue-600 text-white font-black text-xs font-mono">
                              {item.total_quantity} ly
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 space-y-1.5">
                            {item.details.map((d, dIdx) => (
                              <div key={dIdx} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-800">
                                  {d.employee_name} ({d.quantity} ly):
                                </span>
                                <span className="text-right text-[11px] text-slate-500">
                                  {d.sugar}, {d.ice} {d.topping ? `• +${d.topping}` : ''} {d.note ? `• "${d.note}"` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: UN-ORDERED MEMBERS */}
              {activeTab === 'UN_ORDERED' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Tìm theo tên thành viên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <button
                      onClick={handleCopyUnOrdered}
                      disabled={copyingReminder || filteredUnOrdered.length === 0}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                      {copyingReminder ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Đã copy nhắc nhở!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy nhắc nhở nhóm ({filteredUnOrdered.length})</span>
                        </>
                      )}
                    </button>
                  </div>

                  {filteredUnOrdered.length === 0 ? (
                    <div className="py-16 text-center text-emerald-600 bg-emerald-50 rounded-3xl border border-emerald-200">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-600" />
                      <div className="font-bold text-sm">Tuyệt vời!</div>
                      <div className="text-xs text-emerald-700 mt-0.5">
                        Tất cả các thành viên trong nhóm đều đã hoàn thành đặt món.
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filteredUnOrdered.map((emp) => (
                        <div
                          key={emp.id}
                          className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-3 shadow-soft"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {emp.name.split(' ').slice(-1)[0][0]}
                            </div>
                            <div className="truncate">
                              <div className="font-bold text-slate-900 text-xs truncate">{emp.name}</div>
                              <div className="text-[11px] text-slate-400 truncate">{emp.department}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                            Chưa đặt
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SETTINGS FORM */}
              {activeTab === 'SETTINGS' && (
                <form onSubmit={handleSaveSettings} className="max-w-2xl mx-auto space-y-4">
                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-600" />
                      <span>Thông tin chung & Thời gian</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tên đợt order</label>
                        <input
                          type="text"
                          value={settingsForm.title}
                          onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          placeholder="VD: Trà chiều Phòng BIM"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ chốt đơn (Khóa order)</label>
                        <input
                          type="time"
                          value={settingsForm.close_time}
                          onChange={(e) => setSettingsForm({ ...settingsForm, close_time: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú đợt order</label>
                      <input
                        type="text"
                        value={settingsForm.notes}
                        onChange={(e) => setSettingsForm({ ...settingsForm, notes: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        placeholder="VD: Nhớ đặt ít đá để lâu không nhạt"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-500" />
                      <span>Hình thức thanh toán</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, sponsor_type: 'SELF', sponsor_name: '' })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          settingsForm.sponsor_type === 'SELF'
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="text-xs">🤝 Tự trả tiền (Campuchia)</div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">Mỗi người tự trả phần của mình</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, sponsor_type: 'SPONSOR' })}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          settingsForm.sponsor_type === 'SPONSOR'
                            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="text-xs">🎁 Có người bao hôm nay</div>
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5">Nhân viên được miễn phí</div>
                      </button>
                    </div>

                    {settingsForm.sponsor_type === 'SPONSOR' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tên người / Quỹ bao</label>
                        <input
                          type="text"
                          value={settingsForm.sponsor_name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, sponsor_name: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          placeholder="VD: Sếp Tuấn Anh, Quỹ Công Đoàn..."
                        />
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Thông tin nhận hàng & Shipper</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Tên người nhận</label>
                        <input
                          type="text"
                          value={settingsForm.recipient_name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, recipient_name: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại nhận hàng</label>
                        <input
                          type="text"
                          value={settingsForm.recipient_phone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, recipient_phone: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ giao hàng</label>
                        <input
                          type="text"
                          value={settingsForm.delivery_address}
                          onChange={(e) => setSettingsForm({ ...settingsForm, delivery_address: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                          placeholder="VD: Tầng 8, phòng họp số 2"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Giờ quán giao tới</label>
                        <input
                          type="time"
                          value={settingsForm.delivery_time}
                          onChange={(e) => setSettingsForm({ ...settingsForm, delivery_time: e.target.value })}
                          className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú cho shipper</label>
                      <input
                        type="text"
                        value={settingsForm.delivery_note}
                        onChange={(e) => setSettingsForm({ ...settingsForm, delivery_note: e.target.value })}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        placeholder="VD: Gọi trước khi giao 5 phút, gửi lễ tân..."
                      />
                    </div>
                  </div>

                  {/* Danger Zone: Delete session */}
                  <div className="bg-rose-50/80 p-4 sm:p-5 rounded-2xl border border-rose-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-rose-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <Trash2 className="w-4 h-4 text-rose-600" />
                          <span>Hủy & Xóa Vĩnh Viễn Đợt Order Này</span>
                        </h4>
                        <p className="text-[11px] text-rose-700/80 mt-0.5">
                          Xóa bỏ đợt order này cùng toàn bộ các món nước đã đặt. Hành động này không thể hoàn tác.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeleteSession}
                        disabled={deletingSession}
                        className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0 active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{deletingSession ? 'Đang xóa...' : 'Xóa đợt order'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingSettings ? 'Đang lưu...' : 'Lưu Thay Đổi Cài Đặt'}</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleSessionStatus}
              disabled={actionLoading}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isSessionClosed
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {isSessionClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isSessionClosed ? 'MỞ LẠI ORDER' : 'CHỐT ĐƠN NHÓM'}</span>
            </button>

            <button
              onClick={() => {
                if (onOpenZaloModal && session) {
                  onOpenZaloModal(session.id);
                }
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>XUẤT ZALO GỬI QUÁN</span>
            </button>

            <button
              onClick={handleDeleteSession}
              disabled={deletingSession}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
              title="Xóa vĩnh viễn đợt order này"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Xóa đợt order</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
