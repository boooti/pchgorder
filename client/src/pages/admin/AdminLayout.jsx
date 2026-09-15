import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Store,
  Users,
  FileSpreadsheet,
  Settings,
  ArrowLeft,
  Coffee,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({
  activeTab,
  setActiveTab,
  onExitAdmin,
  children
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Hôm Nay', icon: LayoutDashboard },
    { id: 'sessions', label: 'Chọn Quán Hôm Nay', icon: CalendarDays },
    { id: 'stores', label: 'Quản Lý Quán & Menu', icon: Store },
    { id: 'employees', label: 'Quản Lý Nhân Viên', icon: Users },
    { id: 'history', label: 'Lịch Sử & Xuất Excel', icon: FileSpreadsheet },
    { id: 'settings', label: 'Cài Đặt & Trợ Giá', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header Navbar for Admin - Matching Navbar.jsx positioning */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Danh mục Quản trị"
            >
              {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 text-white flex items-center justify-center shadow-md shadow-blue-900/15">
                <Coffee className="w-5 h-5 text-blue-200" />
              </div>
              <div>
                <span className="font-black tracking-tight text-lg text-slate-900 flex items-center gap-1.5">
                  SipDesk <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-slate-900 text-white">Quản Trị</span>
                </span>
                <p className="text-[10px] text-slate-500 hidden sm:block">Hệ thống quản lý order nước nội bộ</p>
              </div>
            </div>
          </div>

          {/* Center: Current Tab Badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-100/90 px-3.5 py-1.5 rounded-2xl border border-slate-200/70">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">
              {menuItems.find((m) => m.id === activeTab)?.label || 'Bảng điều khiển'}
            </span>
          </div>

          {/* Right Action: "Quay lại trang Order" button in EXACT SAME position as "Quản trị" in Navbar.jsx */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onExitAdmin}
              className="py-2 px-3 sm:px-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 shadow-sm active:scale-95"
              title="Quay lại trang dành cho Nhân viên"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden sm:inline">Quay lại trang Order</span>
              <span className="sm:hidden">Về Order</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Area with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar / Mobile Drawer - Navy */}
        <aside
          className={`fixed md:sticky top-16 inset-y-0 left-0 z-40 w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-200 md:translate-x-0 h-[calc(100vh-4rem)] shrink-0 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Chức năng quản trị
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm md:hidden"
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
