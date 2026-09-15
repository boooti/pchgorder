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
      {/* 0. Prominent Order Sessions Section ("ô của từng Đợt order to hơn") */}
      {visibleSessions.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
                Các Đợt Order Hôm Nay ({visibleSessions.length})
              </h2>
            </div>
            <button
              onClick={() => {
                if (!currentUser) onOpenUserModal();
                else if (onOpenCreateGroup) onOpenCreateGroup();
              }}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <Users className="w-3.5 h-3.5" />
              <span>+ Mở đợt order mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleSessions.map((s) => {
              const isSelected = session && session.id === s.id;
              const isScopeAll = s.scope_type === 'ALL' || !s.scope_type;
              const isClosed = s.status !== 'OPEN';
              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession && onSelectSession(s.id)}
                  className={`p-3.5 sm:p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs hover:shadow-md ${
                    isSelected
                      ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white border-blue-500 ring-4 ring-blue-500/20 shadow-lg'
                      : 'bg-white text-slate-800 border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-white p-1.5 border border-slate-200/60 shadow-sm shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={s.store_logo || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100'}
                          alt={s.store_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isScopeAll
                              ? (isSelected ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800')
                              : s.scope_type === 'DEPARTMENT'
                              ? (isSelected ? 'bg-amber-500 text-slate-950' : 'bg-amber-100 text-amber-900')
                              : (isSelected ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-900')
                          }`}>
                            {isScopeAll ? 'Toàn công ty' : s.scope_type === 'DEPARTMENT' ? 'Phòng ban' : 'Nhóm riêng'}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isClosed
                              ? (isSelected ? 'bg-rose-500/30 text-rose-200' : 'bg-rose-100 text-rose-800')
                              : (isSelected ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-100 text-emerald-800')
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                            <span>{isClosed ? 'Đã chốt' : 'Đang mở'}</span>
                          </span>
                        </div>
                        <h3 className={`font-black text-sm sm:text-base mt-1 truncate ${
                          isSelected ? 'text-white' : 'text-slate-900'
                        }`}>
                          {s.title || s.store_name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className={`pt-2.5 border-t flex items-center justify-between text-xs ${
                    isSelected ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-500'
                  }`}>
                    <div className="truncate text-[11px]">
                      {s.creator_name ? (
                        <span>Tạo bởi: <strong className={isSelected ? 'text-white' : 'text-slate-800'}>{s.creator_name}</strong></span>
                      ) : (
                        <span>Phiên tự động</span>
                      )}
                    </div>
                    <div>
                      {isSelected ? (
                        <span className="text-[11px] font-black text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2.5 py-1 rounded-xl flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Đang xem</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-blue-600 hover:underline">
                          Chọn đợt này →
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5">
          {filteredProducts.map((prod) => {
            const isAvailable = prod.is_available === 1;
            const lowestPrice = prod.sizes?.length > 0
              ? Math.min(...prod.sizes.map((s) => s.price))
              : 25000;
            const highestPrice = prod.sizes?.length > 1
              ? Math.max(...prod.sizes.map((s) => s.price))
              : lowestPrice;

            return (
              <div
                key={prod.id}
                className={`group bg-white rounded-3xl p-4 border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                  isAvailable
                    ? 'border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/10'
                    : 'border-slate-200 bg-slate-50/70 opacity-60'
                }`}
              >
                <div>
                  {/* Title & Status Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-slate-900 text-sm sm:text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-1">
                      {prod.name}
                    </h4>
                    {!isAvailable && (
                      <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        HẾT MÓN
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {prod.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  )}

                  {/* Size Preview Tags */}
                  {prod.sizes?.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      {prod.sizes.map((s) => (
                        <span
                          key={s.id}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/60"
                        >
                          Size {s.size_name}: <strong className="font-mono text-slate-800">{formatVND(s.price)}đ</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Row: Price & Action */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="font-mono">
                    {session.sponsor_type === 'SPONSOR' ? (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-emerald-600 font-black text-sm sm:text-base">0đ</span>
                        <span className="line-through text-slate-400 text-xs font-normal">
                          {formatVND(lowestPrice)}đ
                        </span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md font-sans font-semibold">
                          Được bao
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-900 font-black text-sm sm:text-base">
                          {formatVND(lowestPrice)}đ
                        </span>
                        {prod.sizes?.length > 1 && (
                          <span className="text-[10px] text-slate-400 font-normal font-sans ml-1">
                            ~ {formatVND(highestPrice)}đ
                          </span>
                        )}
                      </div>
                    )}
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
                      className="py-1.5 px-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 active:scale-95 shadow-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Chọn món</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 px-2 py-1 bg-slate-100 rounded-lg">
                      Tạm hết
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
