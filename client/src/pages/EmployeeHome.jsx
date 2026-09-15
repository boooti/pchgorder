import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  BookOpen,
  AlertTriangle,
  Plus,
  Check,
  RefreshCw,
  Flame,
  Heart,
  Store,
  FileImage,
  ZoomIn,
  Gift,
  Users2,
  Lock,
  Unlock,
  Copy,
  MessageSquare,
  Users,
  Building,
  Sparkles,
  ClipboardList,
  MapPin,
  Calendar
} from 'lucide-react';
import { api } from '../api';
import { showToast } from '../components/Toast';
import { checkIsEligible, formatVND } from '../utils';
import GroupManagementModal from '../components/GroupManagementModal';

export default function EmployeeHome({
  session,
  currentUser,
  activeSessions = [],
  onSelectSession,
  onOpenCreateGroup,
  onOpenZaloModal,
  onRefreshSession,
  onOpenOriginalMenu,
  onOpenCustomize,
  onQuickReorder,
  frequentDrinks,
  onOpenUserModal
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeLeftText, setTimeLeftText] = useState('');
  const [isSessionClosed, setIsSessionClosed] = useState(false);
  const [closingSession, setClosingSession] = useState(false);
  const [copyingReminder, setCopyingReminder] = useState(false);
  const [showGroupManageModal, setShowGroupManageModal] = useState(false);

  const isHost = Boolean(
    session && currentUser && session.created_by_employee_id === currentUser.id
  );

  const handleToggleSessionClose = async () => {
    if (!session) return;
    try {
      setClosingSession(true);
      const isClosed = session.status === 'CLOSED';
      const res = isClosed
        ? await api.reopenSession(session.id)
        : await api.closeSession(session.id);
      if (res.success) {
        showToast(res.message, 'success');
        if (onRefreshSession) onRefreshSession();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setClosingSession(false);
    }
  };

  const handleCopyReminder = async () => {
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

  // Countdown timer calculation
  useEffect(() => {
    if (!session) return;

    function updateCountdown() {
      if (session.status !== 'OPEN') {
        setIsSessionClosed(true);
        setTimeLeftText('ĐÃ ĐÓNG');
        return;
      }

      if (!session.close_time) {
        setTimeLeftText('Đang mở');
        setIsSessionClosed(false);
        return;
      }

      const now = new Date();
      const [closeHour, closeMin] = session.close_time.split(':').map(Number);
      const closeDate = new Date();
      closeDate.setHours(closeHour, closeMin, 0, 0);

      const diffMs = closeDate - now;
      if (diffMs <= 0) {
        setIsSessionClosed(true);
        setTimeLeftText('HẾT GIỜ (ĐÃ ĐÓNG)');
      } else {
        setIsSessionClosed(false);
        const diffMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        if (hours > 0) {
          setTimeLeftText(`Còn ${hours}h ${mins}p`);
        } else {
          setTimeLeftText(`Còn ${mins} phút`);
        }
      }
    }

    updateCountdown();
    const timer = setInterval(updateCountdown, 20000);
    return () => clearInterval(timer);
  }, [session]);

  const visibleSessions = activeSessions.filter((s) => checkIsEligible(s, currentUser));

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-blue-100 text-blue-900 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Store className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Hôm nay chưa mở quán nào để order
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
          Quản lý chưa tạo phiên order chung hôm nay. Nhưng bạn có thể tự chọn quán và tạo ngay đợt order riêng cho nhóm hoặc phòng ban của mình!
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              if (!currentUser) onOpenUserModal();
              else if (onOpenCreateGroup) onOpenCreateGroup();
            }}
            className="py-3 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>+ Tạo Đợt Order Cho Nhóm Riêng</span>
          </button>
        </div>
      </div>
    );
  }

  // Guard: If employee has no relation with this group session, do NOT display the order menu!
  const isEligible = checkIsEligible(session, currentUser);
  if (!isEligible) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-2 shadow-sm">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          Bạn không có tên trong đợt order này
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Đợt order <b>"{session.title || session.store_name}"</b> là phiên đặt món của nhóm riêng. Vì bạn không thuộc danh sách nhóm, không phải người tạo và không phải người bao nên không thể xem chi tiết menu hay đặt món.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {visibleSessions.length > 0 && (
            <button
              onClick={() => onSelectSession && onSelectSession(visibleSessions[0].id)}
              className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold shadow transition-all"
            >
              Về đợt order của bạn ({visibleSessions[0].title || visibleSessions[0].store_name})
            </button>
          )}
          <button
            onClick={() => {
              if (!currentUser) onOpenUserModal();
              else if (onOpenCreateGroup) onOpenCreateGroup();
            }}
            className="py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>+ Tạo đợt order nhóm riêng</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter products by category and search
  const products = session.products || [];
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'ALL' || p.category_id === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const formattedToday = session.session_date
    ? session.session_date.split('-').reverse().join('/')
    : new Date().toLocaleDateString('vi-VN');

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 space-y-5">
      {/* 0. Multi-Session Switcher Bar */}
      {visibleSessions.length > 0 && (
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
              Đợt order:
            </span>
            {visibleSessions.map((s) => {
              const isSelected = session && session.id === s.id;
              const isScopeAll = s.scope_type === 'ALL' || !s.scope_type;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSession && onSelectSession(s.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200 shadow-soft'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${s.status === 'OPEN' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className="truncate max-w-[140px] sm:max-w-[200px]">{s.title || s.store_name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isScopeAll ? 'Toàn cty' : 'Nhóm riêng'}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              if (!currentUser) onOpenUserModal();
              else if (onOpenCreateGroup) onOpenCreateGroup();
            }}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-2xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">+ Tạo nhóm riêng</span>
            <span className="sm:hidden">+ Nhóm</span>
          </button>
        </div>
      )}

      {/* 1. Today Hero Banner - Modern Luxury PCHG Style */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white shadow-2xl border border-slate-700/60 transition-all">
        {/* Cover Background */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src={session.store_cover || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200'}
            alt="Store Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

        {/* Content Container */}
        <div className="relative z-10 p-5 sm:p-7 flex flex-col gap-4">
          {/* Top Bar: Group Meta & Date / Time */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
            {/* Left: Group Title / Tag */}
            <div className="flex items-center gap-2 flex-wrap">
              {session.title ? (
                <>
                  <span className="px-3 py-1 rounded-full bg-blue-500/25 border border-blue-400/40 text-blue-100 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <Users className="w-3.5 h-3.5 text-blue-300" />
                    <span>{session.title}</span>
                  </span>
                  {session.creator_name && (
                    <span className="text-xs text-slate-300">
                      Tạo bởi: <strong className="text-white font-bold">{session.creator_name}</strong>
                    </span>
                  )}
                  {session.scope_type === 'DEPARTMENT' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-200 text-[11px] font-bold">
                      Phòng ban
                    </span>
                  )}
                  {session.scope_type === 'CUSTOM' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-400/20 border border-purple-400/30 text-purple-200 text-[11px] font-bold">
                      Nhóm riêng
                    </span>
                  )}
                </>
              ) : (
                <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                  <span>Phiên Order Toàn Công Ty</span>
                </span>
              )}
            </div>

            {/* Right: Date & Cutoff Time */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-300 flex items-center gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Hôm nay, {formattedToday}</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold text-xs">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Chốt đơn: {session.close_time || '10:30'}</span>
              </span>
            </div>
          </div>

          {/* Main Store Info & Actions Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pt-1">
            {/* Store Branding (Logo + Name + Address + Sponsor) */}
            <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
              {/* Store Logo with crisp white rounded frame */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white p-2 shadow-2xl border-2 border-white/20 shrink-0 flex items-center justify-center overflow-hidden group">
                <img
                  src={session.store_logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=150'}
                  alt={session.store_name}
                  className="w-full h-full object-contain rounded-2xl group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Store Typography & Details */}
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-sm truncate">
                  {session.store_name}
                </h1>

                {session.store_address && (
                  <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-1 font-medium line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>{session.store_address}</span>
                  </p>
                )}

                {/* Payment Mode / Sponsor Badge */}
                <div className="mt-3">
                  {session.sponsor_type === 'SPONSOR' && session.sponsor_name ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-yellow-500/25 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-bold shadow-sm">
                      <Gift className="w-4 h-4 text-amber-300 shrink-0 animate-pulse" />
                      <span>
                        Hôm nay <strong className="text-amber-100 underline decoration-amber-400/60 underline-offset-2">{session.sponsor_name}</strong> bao trọn gói! (Nhân viên: 0đ)
                      </span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-slate-200 text-xs sm:text-sm font-semibold">
                      <Users2 className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>Hôm nay: Tự trả tiền (Campuchia)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Countdown & Menu Gốc Actions */}
            <div className="flex sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-2.5 shrink-0 pt-2 md:pt-0">
              {/* Countdown Badge */}
              <div
                className={`px-4 py-2.5 rounded-2xl border backdrop-blur-md flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold shadow-sm ${
                  isSessionClosed
                    ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSessionClosed ? 'bg-rose-500' : 'bg-emerald-400 animate-ping'}`} />
                <Clock className="w-4 h-4" />
                <span>{timeLeftText}</span>
              </div>

              {/* Xem Menu Gốc Button */}
              <button
                onClick={onOpenOriginalMenu}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 active:scale-95 border border-blue-400/30"
              >
                <BookOpen className="w-4 h-4 text-blue-200" />
                <span>Xem Menu Gốc</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Group Host Toolbar (For the employee who created the group) */}
      {isHost && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-blue-800 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
              👑
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>Bạn là Trưởng nhóm đợt order này</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/25 border border-amber-400/40 text-amber-300 font-bold">
                  Quản lý nhóm
                </span>
              </div>
              <div className="text-[11px] text-blue-200 mt-0.5">
                Đã đặt: <b>{session.total_orders || 0}</b> đơn ({session.total_cups || 0} ly) • Tổng tiền: <b>{formatVND(session.total_amount)}đ</b>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowGroupManageModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md active:scale-95"
              title="Quản lý chi tiết danh sách đặt nước, gom món, theo dõi thanh toán và cài đặt nhóm"
            >
              <ClipboardList className="w-4 h-4 text-slate-950" />
              <span>Quản lý Đặt Nước</span>
            </button>

            <button
              onClick={handleToggleSessionClose}
              disabled={closingSession}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isSessionClosed
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {isSessionClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{isSessionClosed ? 'Mở lại order' : 'Chốt đơn nhóm'}</span>
            </button>

            <button
              onClick={handleCopyReminder}
              disabled={copyingReminder}
              className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
              title="Copy danh sách nhắc nhở các thành viên trong nhóm chưa đặt"
            >
              <Copy className="w-3.5 h-3.5 text-blue-200" />
              <span>{copyingReminder ? 'Đã copy!' : 'Nhắc nhở nhóm'}</span>
            </button>

            <button
              onClick={() => onOpenZaloModal && onOpenZaloModal(session.id)}
              className="px-3.5 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Xuất Zalo gửi quán</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Attached Original Menu Interactive Banner */}
      {session.menu_files && session.menu_files.length > 0 && (
        <div
          onClick={onOpenOriginalMenu}
          className="bg-gradient-to-r from-blue-900/10 via-slate-900/5 to-blue-900/10 hover:from-blue-900/15 hover:to-blue-900/15 border border-blue-200 rounded-3xl p-3.5 sm:p-4 flex items-center justify-between cursor-pointer transition-all group shadow-soft"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
              📖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  Menu gốc đính kèm theo quán
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {session.menu_files.length} ảnh gốc
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Bấm vào đây để phóng to xem trực tiếp bảng giá gốc & ảnh menu thực tế của {session.store_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform shrink-0 bg-white px-3 py-1.5 rounded-xl border border-blue-200 shadow-sm">
            <span>Phóng to menu</span>
            <ZoomIn className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 3. Quick Re-order Section (If user has recent orders) */}
      {currentUser && frequentDrinks && frequentDrinks.recent_items?.length > 0 && (
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Món bạn hay uống & Gần đây
              </h3>
            </div>
            <span className="text-[11px] text-blue-800 font-medium">Đặt lại 1 chạm</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {frequentDrinks.recent_items.slice(0, 5).map((rec, idx) => {
              let opts = {};
              try { opts = JSON.parse(rec.options_snapshot); } catch (e) {}
              const isAvailable = rec.current_available;

              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm shrink-0 w-64 flex flex-col justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">
                      {rec.product_name_snapshot}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 space-x-1">
                      <span className="font-semibold text-blue-700">Size {rec.size_snapshot}</span>
                      <span>•</span>
                      <span>{opts.sugar} đường</span>
                      <span>•</span>
                      <span>{opts.ice}</span>
                    </div>
                    {rec.topping_snapshot && (
                      <div className="text-[10px] text-blue-800 mt-1 line-clamp-1">
                        +{rec.topping_snapshot}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                    <span className="font-bold text-xs text-slate-900 font-mono">
                      {formatVND(rec.current_unit_price || rec.unit_price_snapshot)}đ
                    </span>
                    {isAvailable ? (
                      <button
                        onClick={() => onQuickReorder(rec)}
                        disabled={isSessionClosed}
                        className="py-1 px-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                      >
                        Order lại
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">Hết món</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Search & Category Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm món theo tên, hương vị, nguyên liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm transition-all placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 p-1"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal Scroll) */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-blue-700 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả ({products.length})
          </button>
          {session.categories?.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 p-8">
          <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">Không tìm thấy món nào phù hợp</p>
          <p className="text-xs mt-1 text-slate-400">Thử tìm bằng từ khóa khác hoặc chuyển danh mục</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredProducts.map((prod) => {
            const isAvailable = prod.is_available === 1;
            const lowestPrice = prod.sizes?.length > 0
              ? Math.min(...prod.sizes.map((s) => s.price))
              : 25000;

            return (
              <div
                key={prod.id}
                className={`bg-white rounded-3xl p-3.5 sm:p-4 border transition-all flex flex-col justify-between shadow-soft hover:shadow-elevated ${
                  isAvailable
                    ? 'border-slate-200/80 hover:border-blue-300'
                    : 'border-slate-200 bg-slate-50/70 opacity-75'
                }`}
              >
                <div className="flex gap-3.5">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                    <img
                      src={prod.image || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=250'}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-1 text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-white bg-red-600 px-1.5 py-0.5 rounded shadow">
                          HẾT MÓN
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {prod.description || 'Hương vị đặc trưng thơm ngon.'}
                    </p>
                    <div className="mt-2 text-xs font-bold font-mono">
                      {session.sponsor_type === 'SPONSOR' ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-emerald-700 font-black">0đ</span>
                          <span className="line-through text-slate-400 text-[11px] font-normal">{formatVND(lowestPrice)}đ</span>
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md font-sans font-semibold">Được bao</span>
                        </div>
                      ) : (
                        <span className="text-blue-900">
                          {formatVND(lowestPrice)}đ
                          {prod.sizes?.length > 1 && (
                            <span className="text-[10px] text-slate-400 font-normal font-sans ml-1">
                              (tùy size)
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Action */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    {prod.sizes?.map((s) => s.size_name).join(' · ')}
                  </div>

                  {isAvailable ? (
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          onOpenUserModal();
                        } else {
                          onOpenCustomize(prod);
                        }
                      }}
                      disabled={isSessionClosed}
                      className="py-1.5 px-3.5 bg-blue-50 hover:bg-blue-600 text-blue-800 hover:text-white rounded-xl text-xs font-bold border border-blue-200 transition-all flex items-center gap-1 active:scale-95 disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>THÊM</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-red-500 px-2 py-1 bg-red-50 rounded-lg">
                      TẠM HẾT
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Group Management Modal for Host */}
      {showGroupManageModal && (
        <GroupManagementModal
          isOpen={showGroupManageModal}
          onClose={() => setShowGroupManageModal(false)}
          sessionId={session?.id}
          currentUser={currentUser}
          onOpenZaloModal={onOpenZaloModal}
          onSessionUpdated={() => {
            if (onRefreshSession) onRefreshSession();
          }}
        />
      )}
    </div>
  );
}
