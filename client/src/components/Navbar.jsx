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
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3">
          {/* Logo & Brand - PCHG Phú Cường Hoàng Gia */}
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 sm:gap-3.5 cursor-pointer group py-1 select-none"
          >
            <img
              src="/logo_pchg.png"
              alt="Phú Cường Hoàng Gia"
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 leading-none">
                <span className="font-black tracking-tight text-xl sm:text-2xl md:text-[26px] text-slate-900 group-hover:text-blue-900 transition-colors">
                  PCHG
                </span>
                <span className="text-[11px] sm:text-xs md:text-[13px] uppercase font-black tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-sm ring-2 ring-red-500/20">
                  ORDER
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 hidden sm:block tracking-tight mt-1">
                Phú Cường Hoàng Gia • Biệt đội săn trà sữa 🧋
              </p>
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
              <span>Ghé Menu 🍵</span>
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
              <span>Kèo hôm nay 🥤</span>
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
              <span>Sổ nợ trà sữa 📊</span>
            </button>
          </nav>

          {/* User Profile & Admin Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Identified Employee Badge */}
            {currentUser ? (
              <button
                onClick={onOpenUserModal}
                className="flex items-center gap-2.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-indigo-50/90 hover:from-blue-100/90 hover:to-indigo-100/90 border border-blue-200/90 py-1.5 pl-2 pr-3 rounded-2xl transition-all shadow-xs hover:shadow-sm cursor-pointer group text-left"
                title="Bấm để đổi người dùng khác"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                  {currentUser.name.split(' ').slice(-1)[0][0]}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                    {currentUser.department || 'Nhân viên'}
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold flex items-center gap-1 ml-1 group-hover:bg-blue-700 transition-colors shrink-0">
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span className="hidden md:inline">Đổi bạn</span>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenUserModal}
                className="py-2 px-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-2xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95 animate-pulse"
              >
                <User className="w-3.5 h-3.5" />
                <span>Xưng danh ngay 😎</span>
              </button>
            )}

            {/* Self-service Group Order button for any employee */}
            <button
              onClick={onOpenCreateGroup}
              className="py-2 px-3 sm:px-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              title="Tự tạo đợt order riêng cho nhóm hoặc phòng ban"
            >
              <Users className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden sm:inline">+ Mở kèo mới 🔥</span>
              <span className="sm:hidden">+ Kèo 🔥</span>
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
          <span className="text-[10px]">Menu 🍵</span>
        </button>

        <button
          onClick={() => setActiveView('my-order')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors relative ${
            activeView === 'my-order' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">Kèo hôm nay 🥤</span>
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
          <span className="text-[10px]">Sổ nợ 📊</span>
        </button>

        <button
          onClick={onOpenAdminLogin}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-colors ${
            activeView === 'admin' ? 'text-blue-700 font-bold' : 'text-slate-500'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px]">Quản trị</span>
        </button>
      </div>
    </>
  );
}
