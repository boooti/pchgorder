import React from 'react';
import { Coffee, User, RefreshCw, Shield, History, ShoppingCart, Home, Users } from 'lucide-react';

export default function Navbar({
  currentUser,
  onOpenUserModal,
  onOpenCreateGroup,
  activeView,
  setActiveView,
  isAdmin,
  onOpenAdminLogin,
  todayOrderCount = 0,
}) {
  return (
    <>
      {/* Top Header Navbar for Desktop and Mobile */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white flex items-center justify-center shadow-md shadow-blue-900/15 group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <span className="font-black tracking-tight text-lg text-slate-900 flex items-center gap-1.5">
                SipDesk <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-900">Nội Bộ</span>
              </span>
              <p className="text-[10px] text-slate-500 hidden sm:block">Order nước công ty nhanh gọn</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveView('home')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'home'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>
            <button
              onClick={() => setActiveView('my-order')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                activeView === 'my-order'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Đơn hôm nay</span>
              {todayOrderCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              )}
            </button>
            <button
              onClick={() => setActiveView('stats')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'stats'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Thống kê cá nhân</span>
            </button>
          </nav>

          {/* User Profile & Admin Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Identified Employee Badge */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-blue-50/90 border border-blue-200/80 py-1.5 pl-2.5 pr-2 rounded-2xl">
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {currentUser.name.split(' ').slice(-1)[0][0]}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-blue-800">
                    {currentUser.department || 'Nhân viên'}
                  </div>
                </div>
                <button
                  onClick={onOpenUserModal}
                  title="Đổi nhân viên"
                  className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-900 transition-colors ml-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenUserModal}
                className="py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Bạn là ai?</span>
              </button>
            )}

            {/* Self-service Group Order button for any employee */}
            <button
              onClick={onOpenCreateGroup}
              className="py-2 px-3 sm:px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              title="Tự tạo đợt order riêng cho nhóm hoặc phòng ban"
            >
              <Users className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden sm:inline">+ Tạo Nhóm Order</span>
              <span className="sm:hidden">+ Nhóm</span>
            </button>

            {/* Admin Switcher - Always require password */}
            <button
              onClick={onOpenAdminLogin}
              className={`py-2 px-3 sm:px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                activeView === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Quản trị</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Visible only on phone screens) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 px-3 py-2 flex items-center justify-around">
        <button
          onClick={() => setActiveView('home')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
            activeView === 'home' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Trang chủ</span>
        </button>

        <button
          onClick={() => setActiveView('my-order')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors relative ${
            activeView === 'my-order' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">Đơn của tôi</span>
          {todayOrderCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-blue-600" />
          )}
        </button>

        <button
          onClick={() => setActiveView('stats')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
            activeView === 'stats' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px]">Lịch sử</span>
        </button>

        <button
          onClick={onOpenAdminLogin}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
            activeView === 'admin' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px]">Admin</span>
        </button>
      </div>
    </>
  );
}
