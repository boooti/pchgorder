import React, { useState, useEffect } from 'react';
import {
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
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../../components/Toast';

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

export default function AdminDashboard({ onOpenZaloModal, onNavigateToSessions }) {
  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ORDERED'); // 'ORDERED' | 'AGGREGATE' | 'UN_ORDERED'
  const [actionLoading, setActionLoading] = useState(false);
  const [copyingReminder, setCopyingReminder] = useState(false);
  const [copyingAgg, setCopyingAgg] = useState(false);
  const [deletingSession, setDeletingSession] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadInitialSessions();
  }, []);

  async function loadInitialSessions() {
    try {
      setLoading(true);
      const activeRes = await api.getActiveSessions(null, true);
      let targetId = null;
      if (activeRes.success && Array.isArray(activeRes.data) && activeRes.data.length > 0) {
        setSessions(activeRes.data);
        targetId = activeRes.data[0].id;
        setSelectedSessionId(targetId);
      }
      await loadDashboard(targetId);
    } catch (err) {
      showToast('Lỗi tải danh sách phiên: ' + err.message, 'error');
      setLoading(false);
    }
  }

  async function loadDashboard(sId) {
    try {
      setLoading(true);
      const res = await api.getDashboardStats(sId);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleSelectSession = (sId) => {
    setSelectedSessionId(sId);
    loadDashboard(sId);
  };

  const handleToggleSessionStatus = async () => {
    if (!data?.session) return;
    const isClosed = data.session.status === 'CLOSED';
    try {
      setActionLoading(true);
      const res = isClosed
        ? await api.reopenSession(data.session.id)
        : await api.closeSession(data.session.id);

      if (res.success) {
        showToast(res.message, 'success');
        loadDashboard(selectedSessionId);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCurrentSession = async () => {
    if (!data?.session) return;
    const confirmMsg = `CẢNH BÁO QUẢN TRỊ VIÊN:\n\nBạn có chắc chắn muốn XÓA VĨNH VIỄN phiên order "${data.session.title || data.session.store_name}" (Mã: ${data.session.id}) không?\n\nToàn bộ các món nước đã đặt trong phiên này sẽ bị xóa khỏi hệ thống.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingSession(true);
      const res = await api.deleteSession(data.session.id);
      if (res.success) {
        showToast(res.message, 'success');
        setSelectedSessionId(null);
        await loadInitialSessions();
      }
    } catch (err) {
      showToast('Lỗi xóa phiên: ' + err.message, 'error');
    } finally {
      setDeletingSession(false);
    }
  };

  const handleTogglePayment = async (orderId, currentPaid) => {
    try {
      const nextPaid = currentPaid === 1 ? 0 : 1;
      const res = await api.toggleOrderPayment(orderId, nextPaid);
      if (res.success) {
        showToast(res.message, 'success');
        loadDashboard(selectedSessionId);
      }
    } catch (err) {
      showToast('Lỗi cập nhật thanh toán: ' + err.message, 'error');
    }
  };

  const handleCancelOrder = async (orderId, empName) => {
    if (!window.confirm(`Bạn có chắc muốn hủy đơn đặt của "${empName}" không?`)) return;
    try {
      const res = await api.cancelOrder(orderId);
      if (res.success) {
        showToast('Đã hủy đơn của ' + empName, 'success');
        loadDashboard(selectedSessionId);
      }
    } catch (err) {
      showToast('Lỗi hủy đơn: ' + err.message, 'error');
    }
  };

  const handleCopyUnOrdered = async () => {
    if (!data?.session) return;
    try {
      setCopyingReminder(true);
      const res = await api.getUnOrderedEmployees(data.session.id);
      if (res.success && res.data.reminder_text) {
        await navigator.clipboard.writeText(res.data.reminder_text);
        showToast('Đã copy danh sách nhắc nhở! Hãy dán vào nhóm chat công ty.', 'success');
      }
    } catch (err) {
      showToast('Lỗi copy: ' + err.message, 'error');
    } finally {
      setTimeout(() => setCopyingReminder(false), 2500);
    }
  };

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
      showToast('Đã copy bảng gom món!', 'success');
    } catch (err) {
      showToast('Lỗi copy: ' + err.message, 'error');
    } finally {
      setTimeout(() => setCopyingAgg(false), 2500);
    }
  };

  if (loading && !data) {
    return (
      <div className="py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Đang tải dữ liệu Dashboard...
      </div>
    );
  }

  const session = data?.session;
  const kpi = data?.kpi || {};
  const isSessionOpen = session?.status === 'OPEN';

  // Filter ordered
  const filteredOrdered = (data?.ordered_employees || []).filter(emp =>
    emp.employee_name.toLowerCase().includes(search.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
  );

  // Filter un-ordered
  const filteredUnOrdered = (data?.un_ordered_employees || []).filter(emp =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Session Switcher Bar for Admin */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/80 shadow-soft flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-2">
              Phiên hôm nay ({sessions.length}):
            </span>
            {sessions.map((s) => {
              const isSelected = (selectedSessionId === s.id) || (!selectedSessionId && session?.id === s.id);
              const isScopeAll = s.scope_type === 'ALL' || !s.scope_type;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${s.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="truncate max-w-[160px]">{s.title || s.store_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border'
                  }`}>
                    {isScopeAll ? 'Toàn cty' : `Nhóm: ${s.creator_name || 'Riêng'}`}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onNavigateToSessions}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 shrink-0 pr-2"
          >
            <span>Tất cả phiên</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Session Status Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-soft flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex-wrap">
            <span>Phiên hôm nay: {session ? session.session_date : 'Chưa mở quán'}</span>
            {session && (
              <>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isSessionOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {isSessionOpen ? 'ĐANG MỞ ORDER' : 'ĐÃ CHỐT ĐƠN'}
                </span>
                <span>•</span>
                {session.title && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    {session.title}
                  </span>
                )}
                {session.creator_name && (
                  <span className="text-[10px] text-slate-500">
                    (Tạo bởi: {session.creator_name})
                  </span>
                )}
                <span>•</span>
                {session.sponsor_type === 'SPONSOR' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    🎁 {session.sponsor_name || 'Có người bao'} bao
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    🤝 Tự trả tiền (Campuchia)
                  </span>
                )}
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            {session ? session.store_name : 'Hôm nay chưa chọn quán'}
          </h1>
          {session && (
            <p className="text-xs text-slate-500 mt-1">
              Người nhận: <b>{session.recipient_name_snapshot}</b> ({session.recipient_phone_snapshot}) • Giờ giao: <b>{session.delivery_time_snapshot}</b> • Nơi giao: <b>{session.delivery_address_snapshot}</b>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {session ? (
            <>
              <button
                onClick={handleToggleSessionStatus}
                disabled={actionLoading}
                className={`py-2.5 px-4 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                  isSessionOpen
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isSessionOpen ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>CHỐT ĐƠN NGAY</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>MỞ LẠI ORDER</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onOpenZaloModal(session.id)}
                className="py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>XUẤT TIN NHẮN GỬI QUÁN</span>
              </button>

              <button
                onClick={handleDeleteCurrentSession}
                disabled={deletingSession}
                className="py-2.5 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                title="Xóa vĩnh viễn phiên order này"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>XÓA PHIÊN</span>
              </button>
            </>
          ) : (
            <button
              onClick={onNavigateToSessions}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow transition-all flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>CHỌN QUÁN HÔM NAY</span>
            </button>
          )}

          <button
            onClick={() => loadDashboard(selectedSessionId)}
            title="Làm mới dữ liệu"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Đã order */}
        <div
          onClick={() => setActiveTab('ORDERED')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer shadow-soft hover:shadow-elevated ${
            activeTab === 'ORDERED'
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">ĐÃ ORDER</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
            {kpi.ordered_count || 0}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">người</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
            {kpi.paid_orders_count || 0} đã trả • {kpi.unpaid_orders_count || 0} chưa
          </div>
        </div>

        {/* Chưa order */}
        <div
          onClick={() => setActiveTab('UN_ORDERED')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer shadow-soft hover:shadow-elevated ${
            activeTab === 'UN_ORDERED'
              ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-500/20'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="w-9 h-9 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center mb-3">
            <UserX className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">CHƯA ORDER</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
            {kpi.un_ordered_count || 0}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">người</span>
          </div>
        </div>

        {/* Tổng số ly */}
        <div
          onClick={() => setActiveTab('AGGREGATE')}
          className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer shadow-soft hover:shadow-elevated ${
            activeTab === 'AGGREGATE'
              ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="w-9 h-9 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
            <Coffee className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG SỐ LY</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono mt-1">
            {kpi.total_cups || 0}{' '}
            <span className="text-xs font-sans text-slate-400 font-normal">ly</span>
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            Bấm để xem gom món
          </div>
        </div>

        {/* Tổng tiền & Trợ giá */}
        <div className="p-4 sm:p-5 rounded-3xl border border-slate-200/80 bg-white shadow-soft">
          <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">TỔNG TIỀN NƯỚC</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
            {formatVND(kpi.total_amount)}đ
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
            <span>Hỗ trợ: <b className="text-emerald-700">{formatVND(kpi.total_subsidy)}đ</b></span>
            <span>NV trả: <b className="text-blue-700">{formatVND(kpi.total_employee_paid)}đ</b></span>
          </div>
        </div>
      </div>

      {/* Tabs ĐÃ ORDER / GOM MÓN / CHƯA ORDER */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-soft">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('ORDERED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'ORDERED'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ĐÃ ORDER ({data?.ordered_employees?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('AGGREGATE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'AGGREGATE'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GOM MÓN KIỂM LY ({kpi.total_cups || 0})
            </button>
            <button
              onClick={() => setActiveTab('UN_ORDERED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'UN_ORDERED'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CHƯA ORDER ({data?.un_ordered_employees?.length || 0})
            </button>
          </div>

          {/* Tab Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm nhân viên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {activeTab === 'UN_ORDERED' && data?.un_ordered_employees?.length > 0 && (
              <button
                onClick={handleCopyUnOrdered}
                className="py-2 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {copyingReminder ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>ĐÃ COPY!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-blue-700" />
                    <span>COPY NHẮC NHỞ</span>
                  </>
                )}
              </button>
            )}

            {activeTab === 'AGGREGATE' && data?.aggregated_items?.length > 0 && (
              <button
                onClick={handleCopyAggregate}
                className="py-2 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                {copyingAgg ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>ĐÃ COPY!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-blue-700" />
                    <span>COPY GOM MÓN</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tab Content List */}
        {activeTab === 'ORDERED' && (
          <div className="divide-y divide-slate-100">
            {filteredOrdered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Chưa có nhân viên nào đặt món trong phiên này
              </div>
            ) : (
              filteredOrdered.map((emp) => {
                const isPaid = emp.is_paid === 1;
                const orderTimeStr = new Date(emp.created_at).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={emp.order_id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {emp.employee_name.split(' ').slice(-1)[0][0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">
                            {emp.employee_name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {emp.department || 'Nhân viên'} • Lúc {orderTimeStr}
                          </span>
                        </div>

                        {/* Order items detail */}
                        <div className="space-y-1.5 pl-3 border-l-2 border-slate-200 mt-2">
                          {emp.items?.map((it, idx) => {
                            let opts = {};
                            try { opts = JSON.parse(it.options_snapshot); } catch (e) {}

                            return (
                              <div key={idx} className="flex justify-between text-xs text-slate-700 gap-2">
                                <span>
                                  <b>{it.quantity}×</b> {it.product_name_snapshot} ({it.size_snapshot} • {opts.sugar} đường • {opts.ice}
                                  {it.topping_snapshot ? ` • +${it.topping_snapshot}` : ''}
                                  {opts.note ? ` • "${opts.note}"` : ''})
                                </span>
                                <span className="font-mono text-slate-500 font-medium shrink-0">
                                  {formatVND(it.item_total_price)}đ
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                      <div className="text-right">
                        <div className="font-bold font-mono text-slate-900 text-sm">
                          {formatVND(emp.total_amount)}đ
                        </div>
                        <div className="text-[10px] text-slate-500 space-x-1">
                          <span>Hỗ trợ: -{formatVND(emp.subsidy_amount)}đ</span>
                          <span>•</span>
                          <span className="font-semibold text-blue-700">NV trả: {formatVND(emp.employee_paid_amount)}đ</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Payment Toggle */}
                        <button
                          onClick={() => handleTogglePayment(emp.order_id, emp.is_paid)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100'
                          }`}
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

                        {/* Cancel order */}
                        <button
                          onClick={() => handleCancelOrder(emp.order_id, emp.employee_name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Hủy đơn này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab AGGREGATE */}
        {activeTab === 'AGGREGATE' && (
          <div className="p-4 sm:p-6 space-y-4">
            {(!data?.aggregated_items || data.aggregated_items.length === 0) ? (
              <div className="py-12 text-center text-slate-400 text-xs">
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

        {/* Tab UN_ORDERED */}
        {activeTab === 'UN_ORDERED' && (
          <div className="divide-y divide-slate-100">
            {filteredUnOrdered.length === 0 ? (
              <div className="p-12 text-center text-emerald-600 text-xs font-bold">
                🎉 Tất cả nhân viên đều đã hoàn thành order!
              </div>
            ) : (
              filteredUnOrdered.map((emp) => (
                <div key={emp.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50/70">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {emp.name.split(' ').slice(-1)[0][0]}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{emp.name}</div>
                      <div className="text-xs text-slate-500">
                        {emp.department || 'Nhân viên'}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    Chưa order
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
