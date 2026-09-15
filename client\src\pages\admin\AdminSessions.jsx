import React, { useState, useEffect } from 'react';
import { Store, Calendar, Clock, MapPin, Phone, User, Check, AlertCircle, Save, ArrowRight, Gift, Users2, Trash2 } from 'lucide-react';
import { api } from '../../api';
import { showToast } from '../../components/Toast';

export default function AdminSessions({ onSessionCreated }) {
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [closeTime, setCloseTime] = useState('10:30');
  const [notes, setNotes] = useState('Phiên order nước trưa nay');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  // Delivery info for today's session
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('11:15');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Sponsor & payment mode
  const [sponsorType, setSponsorType] = useState('SELF'); // 'SELF' | 'SPONSOR'
  const [sponsorName, setSponsorName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [todaySession, setTodaySession] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [updatingSponsor, setUpdatingSponsor] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingDefault, setSavingDefault] = useState(false);

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
    try {
      setLoading(true);
      const [resStores, resEmp, resSession, resActive] = await Promise.all([
        api.getStores(),
        api.getEmployees(true).catch(() => ({ data: [] })),
        api.getTodaySession(null, null, true).catch(() => ({ data: null })),
        api.getActiveSessions(null, true).catch(() => ({ data: [] })),
      ]);

      if (resStores.success) {
        setStores(resStores.data);
        if (resStores.data.length > 0) {
          handleSelectStore(resStores.data[0]);
        }
      }

      if (resEmp.data) {
        setEmployees(resEmp.data);
      }

      if (resActive && resActive.success) {
        setActiveSessions(resActive.data || []);
      }

      if (resSession.data) {
        setTodaySession(resSession.data);
        if (resSession.data.sponsor_type) {
          setSponsorType(resSession.data.sponsor_type);
          setSponsorName(resSession.data.sponsor_name || '');
        }
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteSession = async (sId, title) => {
    if (!window.confirm(`Bạn có chắc muốn XÓA VĨNH VIỄN phiên order "${title || 'này'}" không?\n\nToàn bộ các đơn hàng đã đặt trong phiên này sẽ bị xóa khỏi hệ thống.`)) {
      return;
    }
    try {
      const res = await api.deleteSession(sId);
      if (res.success) {
        showToast(res.message, 'success');
        loadStores();
        if (onSessionCreated) onSessionCreated();
      }
    } catch (err) {
      showToast('Lỗi xóa phiên: ' + err.message, 'error');
    }
  };

  const handleSelectStore = (st) => {
    setSelectedStoreId(st.id);
    const dp = st.delivery_profile || {};
    setRecipientName(dp.recipient_name || 'Văn phòng');
    setRecipientPhone(dp.recipient_phone || '');
    setDeliveryAddress(dp.delivery_address || '');
    setDeliveryTime(dp.desired_delivery_time || '11:15');
    setDeliveryNotes(dp.delivery_notes || '');
  };

  const handleSaveAsDefault = async () => {
    if (!selectedStoreId) return;
    try {
      setSavingDefault(true);
      const res = await api.updateDeliveryProfile(selectedStoreId, {
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        delivery_address: deliveryAddress,
        desired_delivery_time: deliveryTime,
        delivery_notes: deliveryNotes,
      });
      if (res.success) {
        showToast('Đã lưu thông tin giao hàng làm mặc định cho quán này!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingDefault(false);
    }
  };

  const handleUpdateActiveSessionSponsor = async () => {
    if (!todaySession) return;
    try {
      setUpdatingSponsor(true);
      const res = await api.updateSessionSponsor(todaySession.id, {
        sponsor_type: sponsorType,
        sponsor_name: sponsorType === 'SPONSOR' ? sponsorName.trim() : null,
      });
      if (res.success) {
        showToast(res.message, 'success');
        setTodaySession({
          ...todaySession,
          sponsor_type: sponsorType,
          sponsor_name: sponsorType === 'SPONSOR' ? sponsorName.trim() : null,
        });
        if (onSessionCreated) onSessionCreated();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUpdatingSponsor(false);
    }
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!selectedStoreId) {
      showToast('Vui lòng chọn một quán để mở order!', 'error');
      return;
    }

    if (sponsorType === 'SPONSOR' && !sponsorName.trim()) {
      showToast('Vui lòng chọn hoặc nhập tên người bao hôm nay!', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createSession({
        store_id: selectedStoreId,
        session_date: targetDate,
        close_time: closeTime,
        notes: notes.trim(),
        sponsor_type: sponsorType,
        sponsor_name: sponsorType === 'SPONSOR' ? sponsorName.trim() : null,
        delivery_info: {
          recipient_name: recipientName,
          recipient_phone: recipientPhone,
          delivery_address: deliveryAddress,
          desired_delivery_time: deliveryTime,
          delivery_notes: deliveryNotes,
        },
      });

      if (res.success) {
        showToast(res.message, 'success');
        if (onSessionCreated) onSessionCreated();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">
          Hôm nay order quán nào?
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Chọn quán, đặt giờ chốt và xác nhận thông tin giao hàng để nhân viên vào đặt nước.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Đang tải danh sách quán...
        </div>
      ) : stores.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <AlertCircle className="w-10 h-10 text-blue-600 mx-auto mb-2" />
          <h3 className="font-bold text-base text-slate-800">Chưa có quán nào trong hệ thống</h3>
          <p className="text-xs text-slate-500 mt-1">Hãy tạo quán mới ở mục "Quản lý quán" trước nhé!</p>
        </div>
      ) : (
        <>
          {/* Active Sessions Today Card */}
          {activeSessions.length > 0 && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Các phiên order hôm nay ({activeSessions.length})</span>
                </h3>
              </div>

              <div className="divide-y divide-slate-100">
                {activeSessions.map((s) => (
                  <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.store_logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100'}
                        alt={s.store_name}
                        className="w-10 h-10 rounded-xl object-contain p-0.5 bg-white border border-slate-200 shadow-xs shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                          <span>{s.title || s.store_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            s.status === 'OPEN' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {s.status === 'OPEN' ? 'Đang mở' : 'Đã chốt'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            {s.scope_type === 'ALL' || !s.scope_type ? 'Toàn cty' : `Nhóm: ${s.creator_name || 'Riêng'}`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Quán: <b>{s.store_name}</b> • Chốt lúc: <b>{s.close_time}</b> • Đã đặt: <b>{s.order_count || 0}</b> đơn ({s.total_cups || 0} ly)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteSession(s.id, s.title || s.store_name)}
                        className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
                        title="Xóa phiên order này"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Xóa phiên</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleCreateSession} className="space-y-6">
          {/* 1. Store Selection Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              1. Chọn quán nước hôm nay <span className="text-blue-600">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {stores.map((st) => {
                const isSelected = selectedStoreId === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => handleSelectStore(st)}
                    className={`p-4 rounded-3xl border cursor-pointer select-none transition-all flex items-center gap-3.5 relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-600/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-soft'
                    }`}
                  >
                    <img
                      src={st.logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100'}
                      alt={st.name}
                      className="w-12 h-12 rounded-2xl object-contain p-1 bg-white border border-slate-200 shadow-sm shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm truncate">{st.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {st.product_count || 0} món • {st.menu_file_count || 0} trang menu
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Session Time & Schedule */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft space-y-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>2. Thời gian & Lịch order</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Ngày order
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Giờ chốt order <span className="text-blue-600">*</span>
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Ghi chú phiên
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Phiên order trưa thứ 2..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* 3. Payment Mode & Sponsor */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>3. Hình thức thanh toán hôm nay</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chọn xem nhân viên tự trả tiền (Campuchia) hay có người bao toàn bộ phiên hôm nay.
                </p>
              </div>

              {todaySession && (
                <button
                  type="button"
                  onClick={handleUpdateActiveSessionSponsor}
                  disabled={updatingSponsor}
                  className="py-1.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
                  title="Áp dụng hình thức thanh toán ngay cho phiên order hiện tại"
                >
                  <Save className="w-3.5 h-3.5 text-amber-600" />
                  <span>{updatingSponsor ? 'Đang cập nhật...' : 'Cập nhật cho phiên hiện tại'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option A: Campuchia (Self-pay) */}
              <div
                onClick={() => setSponsorType('SELF')}
                className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-start gap-3.5 ${
                  sponsorType === 'SELF'
                    ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-600/30'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  sponsorType === 'SELF' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Users2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                    <span>Tự trả tiền (Campuchia)</span>
                    {sponsorType === 'SELF' && <Check className="w-4 h-4 text-blue-600 stroke-[3]" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Mỗi nhân viên tự thanh toán phần tiền nước của mình. Hệ thống chia bill minh bạch.
                  </p>
                </div>
              </div>

              {/* Option B: Có người bao (Sponsored) */}
              <div
                onClick={() => setSponsorType('SPONSOR')}
                className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex items-start gap-3.5 ${
                  sponsorType === 'SPONSOR'
                    ? 'border-amber-500 bg-amber-50/70 shadow-sm ring-2 ring-amber-500/30'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  sponsorType === 'SPONSOR' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Gift className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                    <span>Có người bao hôm nay 🎁</span>
                    {sponsorType === 'SPONSOR' && <Check className="w-4 h-4 text-amber-600 stroke-[3]" />}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Một người/sếp bao toàn bộ tiền nước. Nhân viên đặt món 0đ, tổng bill tính cho người bao.
                  </p>
                </div>
              </div>
            </div>

            {/* Sponsor Name input / dropdown if SPONSOR selected */}
            {sponsorType === 'SPONSOR' && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 mt-2">
                <div className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ai là người bao hôm nay?</span>
                  <span className="text-rose-500">*</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Chọn nhanh từ danh sách nhân viên:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setSponsorName(e.target.value);
                      }}
                      value={employees.some(e => e.name === sponsorName) ? sponsorName : ''}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      <option value="">-- Chọn nhân viên bao --</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name} ({emp.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Hoặc tự nhập tên / bộ phận bao:
                    </label>
                    <input
                      type="text"
                      value={sponsorName}
                      onChange={(e) => setSponsorName(e.target.value)}
                      placeholder="VD: Anh Trình, Ban Giám Đốc, Quỹ Công Đoàn..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-amber-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                {sponsorName.trim() && (
                  <div className="text-xs text-amber-900 bg-amber-100/80 px-3.5 py-2.5 rounded-xl flex items-center gap-2 border border-amber-200">
                    <span className="text-base">🎉</span>
                    <span>Hôm nay <b>{sponsorName.trim()}</b> sẽ là người bao toàn bộ đơn hàng! Banner nhân viên sẽ hiển thị thông báo tri ân này.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Delivery Snapshot Information */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-soft space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>4. Thông tin người nhận hàng hôm nay</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thông tin này sẽ tự động xuất vào tin nhắn Zalo gửi cho quán
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveAsDefault}
                disabled={savingDefault || !selectedStoreId}
                className="py-1.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Save className="w-3.5 h-3.5 text-slate-500" />
                <span>Lưu làm mặc định cho quán này</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Người nhận hàng <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Họ và tên người nhận"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Số điện thoại người nhận <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="0901 234 567"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Địa chỉ giao hàng chi tiết <span className="text-blue-600">*</span>
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="VD: Tầng 8, Tòa nhà Landmark 81, 720A Điện Biên Phủ, P.22, Bình Thạnh"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Giờ giao mong muốn
                </label>
                <input
                  type="time"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Ghi chú cho shipper
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="VD: Gọi trước khi giao 5 phút, gửi lễ tân..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !selectedStoreId}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang tạo phiên order...</span>
              </>
            ) : (
              <>
                <Store className="w-5 h-5" />
                <span>CHỌN QUÁN HÔM NAY & MỞ ORDER</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        </>
      )}
    </div>
  );
}
