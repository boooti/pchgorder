import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  Coffee,
  Check,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';
import { sortVietnameseByFirstName } from '../utils';

export default function UserIdentifyModal({ isOpen, onClose, onSelectUser, currentUserId }) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Sub-views: 'list' | 'password' | 'first_time'
  const [modalMode, setModalMode] = useState('list');
  const [targetEmp, setTargetEmp] = useState(null);

  // Password login form
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // First-time setup form
  const [wantPassword, setWantPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      resetViews();
    }
  }, [isOpen]);

  function resetViews() {
    setModalMode('list');
    setTargetEmp(null);
    setPasswordInput('');
    setShowPassword(false);
    setAuthError('');
    setAuthLoading(false);
    setWantPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
    setSetupError('');
    setSetupLoading(false);
  }

  async function loadEmployees() {
    try {
      setLoading(true);
      const res = await api.getEmployees(true); // Active only
      if (res.success) {
        // Guarantee sorted by Vietnamese First Name (ABC của Tên)
        setEmployees(sortVietnameseByFirstName(res.data));
      }
    } catch (err) {
      console.error('Lỗi tải nhân viên:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  // Extract department list with employee counts
  const deptCounts = employees.reduce((acc, emp) => {
    const d = emp.department || 'Văn phòng';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const departments = Object.keys(deptCounts);

  // Filter employees by department and search term
  const filtered = employees.filter((e) => {
    const matchesDept = selectedDept === 'ALL' || (e.department || 'Văn phòng') === selectedDept;
    if (!matchesDept) return false;

    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    return (
      e.name.toLowerCase().includes(term) ||
      (e.department && e.department.toLowerCase().includes(term))
    );
  });

  // Handle user clicking an employee card
  const handleCardClick = (emp) => {
    setTargetEmp(emp);
    setAuthError('');
    setSetupError('');

    // Case 1: Employee already set a password -> Require password
    if (emp.has_password) {
      setPasswordInput('');
      setShowPassword(false);
      setModalMode('password');
      return;
    }

    // Case 2: First time login (never asked to set password) -> Prompt question
    if (!emp.has_asked_password) {
      setWantPassword(false);
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setModalMode('first_time');
      return;
    }

    // Case 3: Already asked and chose passwordless -> Direct 1-click login
    handleDirectLogin(emp);
  };

  // Direct login without password
  const handleDirectLogin = async (emp) => {
    try {
      setAuthLoading(true);
      const res = await api.loginEmployee(emp.id);
      if (res.success) {
        onSelectUser(res.data);
      } else {
        setAuthError(res.message || 'Không thể đăng nhập');
      }
    } catch (err) {
      setAuthError(err.message || 'Lỗi kết nối đăng nhập');
    } finally {
      setAuthLoading(false);
    }
  };

  // Submit password for existing password account
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError('Vui lòng nhập mật khẩu của bạn');
      return;
    }

    try {
      setAuthLoading(true);
      setAuthError('');
      const res = await api.loginEmployee(targetEmp.id, passwordInput.trim());
      if (res.success) {
        onSelectUser(res.data);
      } else {
        setAuthError(res.message || 'Mật khẩu không chính xác');
      }
    } catch (err) {
      setAuthError(err.message || 'Mật khẩu không chính xác, vui lòng thử lại');
    } finally {
      setAuthLoading(false);
    }
  };

  // Save new password on first login
  const handleCreatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.trim().length < 3) {
      setSetupError('Mật khẩu cần tối thiểu 3 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setSetupError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setSetupLoading(true);
      setSetupError('');
      const res = await api.setEmployeePassword(targetEmp.id, newPassword.trim());
      if (res.success) {
        // Automatically login
        onSelectUser(res.data);
      } else {
        setSetupError(res.message || 'Không thể tạo mật khẩu');
      }
    } catch (err) {
      setSetupError(err.message || 'Lỗi khi lưu mật khẩu');
    } finally {
      setSetupLoading(false);
    }
  };

  // Skip creating password on first login (Passwordless flow)
  const handleSkipPassword = async () => {
    try {
      setSetupLoading(true);
      setSetupError('');
      const res = await api.skipEmployeePassword(targetEmp.id);
      if (res.success) {
        // Log in immediately
        onSelectUser(res.data);
      } else {
        setSetupError(res.message || 'Không thể thiết lập');
      }
    } catch (err) {
      setSetupError(err.message || 'Lỗi kết nối');
    } finally {
      setSetupLoading(false);
    }
  };

  // Format name highlighting First Name (Tên gọi)
  const renderFormattedName = (fullName) => {
    const parts = (fullName || '').trim().split(/\s+/);
    if (parts.length <= 1) {
      return <span className="font-extrabold text-slate-900">{fullName}</span>;
    }
    const firstName = parts[parts.length - 1];
    const rest = parts.slice(0, -1).join(' ');
    return (
      <>
        <span className="text-slate-500 font-normal text-xs">{rest} </span>
        <span className="text-slate-950 font-black text-sm tracking-tight">{firstName}</span>
      </>
    );
  };

  // Get department abbreviation / short badge
  const getDeptShortName = (dept) => {
    if (!dept) return 'Văn phòng';
    if (dept.includes('BIM')) return 'BIM';
    if (dept.includes('BQLDA')) return 'BQLDA';
    if (dept.includes('Tài chính')) return 'TC - Nhân sự';
    if (dept.includes('Đầu tư')) return 'ĐT - Pháp lý';
    if (dept.includes('Kinh doanh')) return 'Kinh doanh';
    if (dept.includes('Ban GĐ')) return 'Ban GĐ';
    return dept;
  };

  // Color generator based on name initial
  const getAvatarBadgeClass = (name) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-violet-100 text-violet-800 border-violet-200',
      'bg-amber-100 text-amber-800 border-amber-200',
      'bg-rose-100 text-rose-800 border-rose-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden border border-slate-200 flex flex-col max-h-[96vh] transition-all">

        {/* ===================== VIEW 1: ENTER PASSWORD ===================== */}
        {modalMode === 'password' && targetEmp && (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center max-w-md mx-auto w-full my-auto text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-inner">
              <KeyRound className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">
              Nhập mật khẩu tài khoản
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Tài khoản này được bảo vệ bằng mật khẩu cá nhân
            </p>

            {/* Target employee badge */}
            <div className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between mb-5">
              <div className="flex items-center gap-3 text-left">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border ${getAvatarBadgeClass(targetEmp.name)}`}>
                  {targetEmp.name.trim().split(/\s+/).slice(-1)[0][0]}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {targetEmp.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {targetEmp.department || 'Văn phòng'}
                  </div>
                </div>
              </div>
              <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                <Lock className="w-3 h-3" /> Đã bảo vệ
              </span>
            </div>

            <form onSubmit={handlePasswordSubmit} className="w-full space-y-4 text-left">
              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Mật khẩu của bạn
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Nhập mật khẩu..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => resetViews()}
                  className="flex-1 py-3 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Chọn tên khác
                </button>
                <button
                  type="submit"
                  disabled={authLoading || !passwordInput}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Đăng nhập</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================== VIEW 2: FIRST TIME PASSWORD PROMPT ===================== */}
        {modalMode === 'first_time' && targetEmp && (
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center max-w-lg mx-auto w-full my-auto text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-4 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">
              Bảo vệ tài khoản của bạn?
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Chào mừng <span className="font-bold text-slate-800">{targetEmp.name}</span>! Đây là lần đầu bạn đăng nhập. Bạn có muốn đặt mật khẩu để tránh người khác bấm nhầm tên bạn khi đặt nước không?
            </p>

            {/* If user clicked "Create Password" */}
            {wantPassword ? (
              <form onSubmit={handleCreatePassword} className="w-full space-y-3.5 text-left animate-in fade-in duration-200">
                {setupError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu mới (tối thiểu 3 ký tự) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      placeholder="Nhập mật khẩu..."
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Xác nhận lại mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Nhập lại mật khẩu..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWantPassword(false)}
                    className="flex-1 py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Quay lại
                  </button>
                  <button
                    type="submit"
                    disabled={setupLoading || !newPassword || !confirmPassword}
                    className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    {setupLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Tạo MK & Vào Order</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Two primary choice buttons */
              <div className="w-full space-y-3">
                <button
                  type="button"
                  onClick={() => setWantPassword(true)}
                  className="w-full p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/70 hover:bg-blue-100/80 text-blue-950 transition-all flex items-center justify-between group shadow-sm text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-blue-900 group-hover:text-blue-950">
                        Có, tôi muốn tạo mật khẩu bảo vệ
                      </div>
                      <div className="text-[11px] text-blue-700/80 mt-0.5">
                        Chỉ riêng bạn mới có thể đặt nước bằng tên của mình
                      </div>
                    </div>
                  </div>
                  <Check className="w-5 h-5 text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>

                <button
                  type="button"
                  disabled={setupLoading}
                  onClick={handleSkipPassword}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 group-hover:bg-slate-200">
                      <Unlock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        Không cần, đăng nhập không mật khẩu
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Vào thẳng nhanh chóng, không cần nhớ mật khẩu
                      </div>
                    </div>
                  </div>
                  {setupLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600">
                      Bỏ qua →
                    </span>
                  )}
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => resetViews()}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-1 px-3 rounded-lg transition-colors flex items-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Chọn tên khác
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== VIEW 3: MAIN LIST (GRID 47 EMPLOYEES) ===================== */}
        {modalMode === 'list' && (
          <>
            {/* Header - Modern Navy SaaS with Compact Toolbar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white relative shrink-0">
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                      <span>Bạn là ai hôm nay?</span>
                      <span className="text-[11px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full">
                        A - Z theo Tên
                      </span>
                    </h2>
                    <p className="text-xs text-blue-200/80">
                      Chọn đúng tên của bạn để đặt nước nhanh chóng
                    </p>
                  </div>
                </div>

                {currentUserId && (
                  <button
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                    title="Đóng cửa sổ"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search bar + Quick Department Tabs row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Tìm tên, chữ cái, phòng ban..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    autoFocus
                    className="w-full pl-9 pr-8 py-2 bg-white/10 text-white placeholder-slate-300 rounded-xl text-xs border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50 backdrop-blur-md transition-all"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Department quick filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
                  <button
                    onClick={() => setSelectedDept('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                      selectedDept === 'ALL'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    Tất cả ({employees.length})
                  </button>
                  {departments.map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDept(d)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all whitespace-nowrap ${
                        selectedDept === d
                          ? 'bg-blue-600 text-white shadow-sm font-bold'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {getDeptShortName(d)} ({deptCounts[d]})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* The Wide Grid of Employees - Designed for zero scrolling on standard desktop viewports */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-slate-50/50">
              {loading ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Đang nạp danh sách 47 nhân viên theo thứ tự A - Z...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm">
                  Không tìm thấy nhân viên nào khớp với "{search}"
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-2.5">
                  {filtered.map((emp) => {
                    const isSelected = currentUserId === emp.id;
                    const parts = emp.name.trim().split(/\s+/);
                    const initialLetter = parts[parts.length - 1][0] || 'N';

                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => handleCardClick(emp)}
                        className={`group relative p-2 sm:p-2.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 shadow-xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Colored Initial Badge */}
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border ${getAvatarBadgeClass(
                              emp.name
                            )}`}
                          >
                            {initialLetter}
                          </div>

                          {/* Full name with First Name bolded */}
                          <div className="min-w-0 flex-1 leading-tight">
                            <div className="truncate">
                              {renderFormattedName(emp.name)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                              {getDeptShortName(emp.department)}
                            </div>
                          </div>
                        </div>

                        {/* Status Icon */}
                        <div className="shrink-0 flex items-center gap-1">
                          {emp.has_password ? (
                            <span
                              title="Tài khoản có mật khẩu bảo vệ"
                              className="text-amber-500 p-0.5 rounded"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          ) : null}

                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="p-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between px-5 text-xs text-slate-500 gap-2 shrink-0">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-slate-700">
                  Hiển thị: <span className="text-blue-600 font-bold">{filtered.length}</span> / {employees.length} nhân viên
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <Lock className="w-3 h-3 text-amber-500" /> = Có mật khẩu
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 hidden md:inline">
                  Bấm vào tên để vào trang order ngay
                </span>
                {currentUserId && (
                  <button
                    onClick={onClose}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 py-1 px-3 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Đóng lại
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
