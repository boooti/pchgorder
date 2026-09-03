import React, { useState, useEffect } from 'react';
import { Coffee, Search, ShoppingBag, Clock, FileText, Sparkles, UserCheck, Shield, ChevronRight, AlertCircle, RefreshCw, Users, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { UserProvider, useUser } from './context/UserContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './api';

import Header from './components/common/Header';
import ToastContainer, { showToast } from './components/common/Toast';
import OriginalMenuModal from './components/common/OriginalMenuModal';

import UserPickerModal from './components/employee/UserPickerModal';
import ProductCard from './components/employee/ProductCard';
import CustomizeBottomSheet from './components/employee/CustomizeBottomSheet';
import CartDrawer from './components/employee/CartDrawer';
import OrderSuccessModal from './components/employee/OrderSuccessModal';
import FavoriteOrders from './components/employee/FavoriteOrders';

import CreateGroupOrderWizard from './components/employee/CreateGroupOrderWizard';
import ActiveGroupSessionsList from './components/employee/ActiveGroupSessionsList';
import MyCreatedOrdersModal from './components/employee/MyCreatedOrdersModal';

import PersonalStatsModal from './components/user/PersonalStatsModal';

import AdminDashboard from './components/admin/AdminDashboard';
import StoreManager from './components/admin/StoreManager';
import DigitizedMenuEditor from './components/admin/DigitizedMenuEditor';
import OCRParseModal from './components/admin/OCRParseModal';
import ExcelImportModal from './components/admin/ExcelImportModal';
import SessionManager from './components/admin/SessionManager';
import MessageExporterModal from './components/admin/MessageExporterModal';
import EmployeeManager from './components/admin/EmployeeManager';
import HistoryReports from './components/admin/HistoryReports';
import AdminLoginModal from './components/admin/AdminLoginModal';

// Emoji Category Map for Quick Badge Icons
const CATEGORY_EMOJI_MAP = {
  'CÀ PHÊ': '☕',
  'CÀ PHÊ PHIN MỀ': '☕',
  'CÀ PHÊ PHIN MÊ': '☕',
  'CÀ PHÊ ESPRESSO': '☕',
  'MATCHA': '🍵',
  'MATCHA NHẬT BẢN': '🍵',
  'CACAO (MILO)': '🍫',
  'CACAO': '🍫',
  'TRÀ TRÁI CÂY': '🍹',
  'TRÀ TRÁI CÂY (FRUIT TEA)': '🍹',
  'TRÀ SỮA': '🧋',
  'TRÀ SỮA ĐẬM VỊ': '🧋',
  'LATTE SỮA': '🥛',
  'KHOAI MÔN': '🍠',
  'LIPTON & NƯỚC MẤT': '🍋',
  'TRÀ THANH MÁT': '🍃',
  'SỮA CHUA': '🥛',
  'YOGURT (SỮA CHUA)': '🍓',
  'BÁNH BAO & COMBO': '🥟',
  'BÍ ĐẠO': '🍈',
  'MÓN MỚI (NEW)': '✨',
  'TRÀ SÁNG TẠO': '🍑',
  'PHONG VỊ MỚI (KATINAT SPECIAL)': '🌟',
  'FREEZE (ĐÁ XAY)': '🧊',
  'TRÀ HIGHLANDS': '🫖'
};

function MainApp() {
  const { currentUser, isUserSelected } = useUser();
  const { isAdmin, adminTab, setAdminTab } = useAuth();
  const { cartItems, totalCups, totalAmount, setIsCartOpen, setCustomizeProduct, customizeProduct } = useCart();

  // Session & Store State
  const [sessionData, setSessionData] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [productsData, setProductsData] = useState({ categories: [], products: [], toppings: [] });
  const [productsLoading, setProductsLoading] = useState(false);

  // User Mode View State: 'ENTRY' (Initial 1-Page Screen), 'ACTIVE_SESSIONS', 'SHOW_MENU'
  const [userModeView, setUserModeView] = useState('ENTRY');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Employee Active Order for today
  const [myTodayOrder, setMyTodayOrder] = useState(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);

  // Modals state
  const [isUserPickerOpen, setIsUserPickerOpen] = useState(false);
  const [isCreateGroupWizardOpen, setIsCreateGroupWizardOpen] = useState(false);
  const [isMyCreatedOrdersOpen, setIsMyCreatedOrdersOpen] = useState(false);
  const [isOriginalMenuOpen, setIsOriginalMenuOpen] = useState(false);
  const [isPersonalStatsOpen, setIsPersonalStatsOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Admin Modals State
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);
  const [isMessageExporterOpen, setIsMessageExporterOpen] = useState(false);
  const [exportSessionId, setExportSessionId] = useState(null);
  const [digitizeStore, setDigitizeStore] = useState(null);
  const [ocrStore, setOcrStore] = useState(null);
  const [excelStore, setExcelStore] = useState(null);

  // Countdown timer state
  const [timeLeftStr, setTimeLeftStr] = useState('');

  // 1. Fetch Today's Session
  const fetchTodaySession = () => {
    setSessionLoading(true);
    api.getTodaySession()
      .then(res => {
        if (res.active) {
          setSessionData(res.session);
          fetchStoreProducts(res.session.store_id);
          if (currentUser) {
            fetchMyOrder(res.session.id, currentUser.id);
          }
        } else {
          setSessionData(null);
        }
      })
      .catch(() => setSessionData(null))
      .finally(() => setSessionLoading(false));
  };

  // 2. Fetch Store Products
  const fetchStoreProducts = (storeId) => {
    setProductsLoading(true);
    api.getProductsByStore(storeId)
      .then(res => setProductsData(res))
      .catch(err => showToast(err.message, 'error'))
      .finally(() => setProductsLoading(false));
  };

  // 3. Fetch My Order
  const fetchMyOrder = (sessionId, empId) => {
    api.getMyTodayOrder(sessionId, empId)
      .then(res => {
        if (res.hasOrder) {
          setMyTodayOrder(res.order);
        } else {
          setMyTodayOrder(null);
        }
      })
      .catch(() => setMyTodayOrder(null));
  };

  useEffect(() => {
    fetchTodaySession();
  }, []);

  useEffect(() => {
    if (sessionData && currentUser) {
      fetchMyOrder(sessionData.id, currentUser.id);
    }
  }, [currentUser, sessionData?.id]);

  // Prompt user picker on initial launch if not selected
  useEffect(() => {
    if (!isUserSelected) {
      const timer = setTimeout(() => setIsUserPickerOpen(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isUserSelected]);

  // Countdown Timer Logic
  useEffect(() => {
    if (!sessionData || !sessionData.cutoff_time || sessionData.status === 'CLOSED') {
      setTimeLeftStr('');
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const [cHours, cMins] = sessionData.cutoff_time.split(':').map(Number);
      const cutoffDate = new Date();
      cutoffDate.setHours(cHours, cMins, 0, 0);

      const diffMs = cutoffDate - now;
      if (diffMs <= 0) {
        setTimeLeftStr('Đã hết giờ chốt');
        clearInterval(interval);
      } else {
        const mins = Math.floor(diffMs / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        setTimeLeftStr(`Còn ${mins} phút ${secs}s để order`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionData]);

  // Filtered & Grouped Products by Category
  const categoryOrderMap = (productsData.categories || []).reduce((map, cat, idx) => {
    map[cat.id] = idx;
    return map;
  }, {});

  const filteredProducts = productsData.products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || p.category_id === Number(selectedCategory);
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const catOrderA = categoryOrderMap[a.category_id] ?? 999;
      const catOrderB = categoryOrderMap[b.category_id] ?? 999;
      if (catOrderA !== catOrderB) return catOrderA - catOrderB;
      return (a.display_order || a.id) - (b.display_order || b.id);
    });

  const groupedCategories = (productsData.categories || []).map(cat => {
    const catProducts = filteredProducts.filter(p => p.category_id === cat.id);
    return {
      ...cat,
      products: catProducts
    };
  }).filter(group => group.products.length > 0);

  const isSessionClosed = sessionData ? sessionData.status === 'CLOSED' : true;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col relative text-navy-950 bg-slate-100 font-sans select-none">
      
      {/* BRIGHT LUXURY DAYLIGHT BEVERAGE POSTER WALLPAPER BACKGROUND */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat filter brightness-[0.85] contrast-105 scale-105 transition-all duration-700 pointer-events-none"
        style={{ backgroundImage: `url('./drink_bg.jpg')` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/70 via-slate-100/40 to-white/80 pointer-events-none" />

      <ToastContainer />

      {/* Header - Fixed Height 5rem */}
      <div className="relative z-20 flex-shrink-0 shadow-sm bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <Header
          onOpenUserPicker={() => setIsUserPickerOpen(true)}
          onOpenAdminModal={() => setIsAdminLoginOpen(true)}
          onOpenPersonalStats={() => setIsPersonalStatsOpen(true)}
          onGoHome={() => setUserModeView('ENTRY')}
          onGoActiveGroups={() => setUserModeView('ACTIVE_SESSIONS')}
        />
      </div>

      {/* Main Single-Screen Container (h-[calc(100vh-5rem)] overflow-hidden) */}
      <main className="relative z-10 flex-1 flex flex-col h-[calc(100vh-5rem)] overflow-hidden max-w-6xl mx-auto px-4 w-full py-3">

        {/* ADMIN MODE VIEW */}
        {isAdmin ? (
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
            
            {/* Admin Sub-navigation */}
            <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl border border-slate-200 shadow-md flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none flex-shrink-0">
              <button
                onClick={() => setAdminTab('dashboard')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex-shrink-0 ${adminTab === 'dashboard' ? 'bg-navy-950 text-white shadow-md font-black' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Dashboard Đơn
              </button>

              <button
                onClick={() => setIsSessionManagerOpen(true)}
                className={`px-4 py-2 rounded-xl transition bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200 whitespace-nowrap flex-shrink-0`}
              >
                Chuyển Quán Hôm Nay
              </button>

              <button
                onClick={() => setAdminTab('stores')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex-shrink-0 ${adminTab === 'stores' ? 'bg-navy-950 text-white shadow-md font-black' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Quản Lý Quán & Menu
              </button>

              <button
                onClick={() => setAdminTab('employees')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex-shrink-0 ${adminTab === 'employees' ? 'bg-navy-950 text-white shadow-md font-black' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Nhân Viên
              </button>

              <button
                onClick={() => setAdminTab('history')}
                className={`px-4 py-2 rounded-xl transition whitespace-nowrap flex-shrink-0 ${adminTab === 'history' ? 'bg-navy-950 text-white shadow-md font-black' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Lịch Sử & Báo Cáo
              </button>
            </div>

            {/* Render selected admin view */}
            <div className="flex-1 overflow-y-auto pr-1">
              {adminTab === 'dashboard' && (
                <AdminDashboard
                  sessionData={sessionData}
                  onRefreshSession={fetchTodaySession}
                  onOpenMessageExporter={() => {
                    if (sessionData) {
                      setExportSessionId(sessionData.id);
                      setIsMessageExporterOpen(true);
                    }
                  }}
                  onOpenSessionManager={() => setIsSessionManagerOpen(true)}
                />
              )}

              {adminTab === 'stores' && (
                <StoreManager
                  onOpenDigitizedMenu={(store) => setDigitizeStore(store)}
                  onOpenOCR={(store) => setOcrStore(store)}
                  onOpenExcelImport={(store) => setExcelStore(store)}
                />
              )}

              {adminTab === 'employees' && <EmployeeManager />}

              {adminTab === 'history' && (
                <HistoryReports
                  onOpenMessageExporter={(sessId) => {
                    setExportSessionId(sessId);
                    setIsMessageExporterOpen(true);
                  }}
                />
              )}
            </div>

          </div>
        ) : (
          /* EMPLOYEE VIEW - BRIGHT LIGHT THEME SINGLE SCREEN */
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            
            {/* VIEW MODE 1: ENTRY SCREEN (BRIGHT CHOICE CARDS) */}
            {userModeView === 'ENTRY' && (
              <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full py-2 space-y-4 animate-fade-in my-auto">
                
                {/* Welcome Greeting Banner */}
                <div className="bg-white/95 backdrop-blur-xl text-navy-950 rounded-3xl p-5 shadow-xl border border-slate-200/80 text-center space-y-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full bg-amber-400 text-navy-950 inline-block shadow-xs">
                    ĐẶT NƯỚC NỘI BỘ PHÚ CƯỜNG HOÀNG GIA
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
                    XIN CHÀO {currentUser?.name?.toUpperCase() || 'BẠN'}! 🥤
                  </h2>
                </div>

                {/* Active Employee Order Summary Card on Entry Screen */}
                {myTodayOrder && (
                  <div className="bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 text-white p-4 rounded-3xl shadow-xl border border-emerald-400/80 flex items-center justify-between gap-3 animate-slide-up">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black shadow-md flex-shrink-0">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                          Trạng thái order của bạn hôm nay
                        </span>
                        <h4 className="font-extrabold text-sm text-white leading-snug">
                          ĐÃ ĐẶT {myTodayOrder.items?.reduce((s, i) => s + i.quantity, 0) || 0} LY NƯỚC ({new Intl.NumberFormat('vi-VN').format(myTodayOrder.total_amount)}đ)
                        </h4>
                        <p className="text-[11px] text-emerald-100 font-medium">
                          {myTodayOrder.items?.some(i => i.is_gium) ? `(Gồm các món đặt cho bạn & đặt giùm đồng nghiệp)` : `(Đã lưu trên hệ thống)`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (myTodayOrder && myTodayOrder.items) {
                          const cartFormatted = myTodayOrder.items.map(item => ({
                            product_id: item.product_id,
                            product_name: item.product_name_snapshot,
                            size: item.size_snapshot,
                            unit_price: item.unit_price_snapshot,
                            quantity: item.quantity,
                            sugar_option: item.sugar_option,
                            ice_option: item.ice_option,
                            toppings: item.toppings || [],
                            note: item.note || '',
                            subtotal: item.subtotal,
                            recipientEmployee: item.recipient_id ? {
                              id: item.recipient_id,
                              name: item.recipient_name,
                              department: item.recipient_department
                            } : currentUser
                          }));
                          setCartItems(cartFormatted);
                        }
                        setUserModeView('SHOW_MENU');
                        setIsEditingOrder(true);
                        setIsCartOpen(true);
                      }}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-navy-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 whitespace-nowrap flex-shrink-0"
                    >
                      ✏️ Xem & Sửa đơn
                    </button>
                  </div>
                )}

                {/* 3 PRIMARY CHOICE CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  
                  {/* CHOICE 1: TẠO NHÓM ORDER */}
                  <button
                    onClick={() => setIsCreateGroupWizardOpen(true)}
                    className="bg-white/95 hover:bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200/90 hover:border-navy-900 shadow-lg hover:shadow-xl transition duration-300 group flex flex-col justify-between space-y-4 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400 text-navy-950 flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition">
                        <Plus className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                        Bước 1
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-navy-950 group-hover:text-amber-600 transition">TẠO NHÓM MỚI</h3>
                      <p className="text-[11px] text-slate-600 mt-1 font-medium leading-relaxed">
                        Mở nhóm order, chọn quán nước & phân công người nhận.
                      </p>
                    </div>

                    <div className="flex items-center text-xs font-black text-navy-950 gap-1 pt-2 border-t border-slate-100">
                      <span>Bắt đầu tạo nhóm</span>
                      <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* CHOICE 2: ORDER NƯỚC */}
                  <button
                    onClick={() => setUserModeView('ACTIVE_SESSIONS')}
                    className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-600 text-navy-950 p-5 rounded-3xl shadow-lg hover:shadow-xl transition duration-300 group flex flex-col justify-between space-y-4 hover:scale-[1.02] border border-amber-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-navy-950 text-amber-400 flex items-center justify-center font-black shadow-md group-hover:scale-110 transition">
                        <Coffee className="w-7 h-7" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-navy-950 text-amber-300">
                        Bước 2
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-navy-950">VÀO CHỌN MÓN</h3>
                      <p className="text-[11px] text-navy-950 font-semibold mt-1 leading-relaxed opacity-90">
                        Xem thực đơn quán & chọn đồ uống mát lạnh của bạn.
                      </p>
                    </div>

                    <div className="flex items-center text-xs font-black text-navy-950 gap-1 pt-2 border-t border-navy-950/20">
                      <span>Đặt món ngay</span>
                      <ArrowRight className="w-4 h-4 text-navy-950 group-hover:translate-x-1 transition" />
                    </div>
                  </button>

                  {/* CHOICE 3: KIỂM TRA & GỬI QUÁN (ACTIVE & BRIGHT FOR CREATOR) */}
                  {(() => {
                    const isCreator = currentUser && sessionData && (
                      sessionData.created_by_employee_id === currentUser.id ||
                      (sessionData.recipient_name && sessionData.recipient_name.toLowerCase().includes(currentUser.name.toLowerCase()))
                    );

                    return (
                      <button
                        onClick={() => {
                          if (!sessionData) {
                            showToast('Chưa có nhóm order nào được mở hôm nay!', 'info');
                            return;
                          }
                          if (!isCreator) {
                            showToast('⚠️ Chức năng "Kiểm tra & gửi quán" chỉ dành riêng cho người đã tạo nhóm order này!', 'warning');
                            return;
                          }
                          setIsMyCreatedOrdersOpen(true);
                        }}
                        className={`backdrop-blur-xl p-5 rounded-3xl border shadow-lg hover:shadow-xl transition duration-300 group flex flex-col justify-between space-y-4 hover:scale-[1.02] ${
                          isCreator
                            ? 'bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white border-emerald-400 font-bold shadow-xl scale-[1.02]'
                            : 'bg-white/80 border-slate-200/90 text-navy-950 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-md group-hover:scale-110 transition ${
                            isCreator ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                          {isCreator ? (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                              ✓ Người tạo nhóm
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                              🔒 Đã khóa
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className={`text-lg font-black ${isCreator ? 'text-white' : 'text-navy-950'}`}>KIỂM TRA & GỬI QUÁN</h3>
                          <p className={`text-[11px] mt-1 font-medium leading-relaxed ${isCreator ? 'text-emerald-100' : 'text-slate-600'}`}>
                            {isCreator
                              ? 'Xem số người đã đặt / chưa đặt & sao chép 1-click gửi Zalo cho quán.'
                              : 'Dành riêng cho người tạo nhóm xem và tổng hợp đơn.'}
                          </p>
                        </div>

                        <div className={`flex items-center text-xs font-black gap-1 pt-2 border-t ${
                          isCreator ? 'text-amber-300 border-white/20' : 'text-slate-500 border-slate-100'
                        }`}>
                          <span>{isCreator ? 'Xem kết quả & gửi quán ➔' : '🔒 Chỉ dành cho người tạo'}</span>
                        </div>
                      </button>
                    );
                  })()}

                </div>

              </div>
            )}

            {/* VIEW MODE 2: ACTIVE SESSIONS LIST */}
            {userModeView === 'ACTIVE_SESSIONS' && (
              <div className="flex-1 overflow-y-auto">
                <ActiveGroupSessionsList
                  activeSession={sessionData}
                  onSelectSession={() => setUserModeView('SHOW_MENU')}
                  onBack={() => setUserModeView('ENTRY')}
                />
              </div>
            )}

            {/* VIEW MODE 3: SHOW DIGITIZED STORE MENU (BRIGHT LIGHT THEME) */}
            {userModeView === 'SHOW_MENU' && (
              <div className="flex-1 flex flex-col h-full overflow-hidden space-y-3">
                
                {/* Top action bar */}
                <div className="flex items-center justify-between flex-shrink-0">
                  <button
                    onClick={() => setUserModeView('ENTRY')}
                    className="px-3.5 py-2 bg-white/90 hover:bg-white text-navy-950 font-bold text-xs rounded-2xl border border-slate-200 shadow-sm backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap"
                  >
                    ⬅ Quay lại màn hình chọn
                  </button>
                </div>

                {/* Compact Bright Store Banner */}
                {sessionData && (
                  <div className="bg-white/95 backdrop-blur-xl text-navy-950 rounded-2xl p-3.5 shadow-md border border-slate-200/80 flex items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={sessionData.store_logo || 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=200&q=80'}
                        alt={sessionData.store_name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-navy-950 whitespace-nowrap">
                            HÔM NAY ORDER TẠI
                          </span>
                          {timeLeftStr && (
                            <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1 whitespace-nowrap">
                              <Clock className="w-3 h-3" /> {timeLeftStr}
                            </span>
                          )}
                        </div>
                        <h2 className="text-xl font-black text-navy-950 truncate">{sessionData.store_name}</h2>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsOriginalMenuOpen(true)}
                      className="px-3 py-2 bg-navy-950 hover:bg-navy-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1 transition whitespace-nowrap flex-shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span className="whitespace-nowrap">MENU GỐC</span>
                    </button>
                  </div>
                )}

                {/* Active Employee Order Alert */}
                {myTodayOrder && (
                  <div className="flex-shrink-0">
                    <OrderSuccessModal
                      order={myTodayOrder}
                      isSessionClosed={isSessionClosed}
                      onEdit={() => {
                        if (myTodayOrder && myTodayOrder.items) {
                          const cartFormatted = myTodayOrder.items.map(item => ({
                            product_id: item.product_id,
                            product_name: item.product_name_snapshot,
                            size: item.size_snapshot,
                            unit_price: item.unit_price_snapshot,
                            quantity: item.quantity,
                            sugar_option: item.sugar_option,
                            ice_option: item.ice_option,
                            toppings: item.toppings || [],
                            note: item.note || '',
                            subtotal: item.subtotal,
                            recipientEmployee: item.recipient_id ? {
                              id: item.recipient_id,
                              name: item.recipient_name,
                              department: item.recipient_department
                            } : currentUser
                          }));
                          setCartItems(cartFormatted);
                        }
                        setIsEditingOrder(true);
                        setIsCartOpen(true);
                      }}
                      onDeleteSuccess={() => {
                        setMyTodayOrder(null);
                        setIsEditingOrder(false);
                        fetchTodaySession();
                      }}
                    />
                  </div>
                )}

                {/* Show Search Bar & Beverage Menu Grid ONLY IF user hasn't ordered yet OR is currently editing order */}
                {myTodayOrder && !isEditingOrder ? (
                  <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-200 text-center space-y-1.5 my-2 shadow-xs">
                    <p className="font-extrabold text-amber-950 text-xs">
                      ℹ️ Bạn đã nạp đơn nước thành công cho phiên hôm nay.
                    </p>
                    <p className="text-[11px] text-amber-800 font-medium">
                      Để thay đổi món hoặc chọn thêm nước mới cho mình/đồng nghiệp, vui lòng bấm nút <b className="text-navy-950 underline">"Sửa món / Thêm món"</b> ở khung đơn trên!
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Editing mode banner */}
                    {isEditingOrder && (
                      <div className="bg-navy-950 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-md flex-shrink-0 animate-fade-in border border-amber-400/40">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
                          <span className="font-extrabold text-xs text-amber-300">
                            ✏️ ĐANG Ở CHẾ ĐỘ SỬA MÓN / THÊM MÓN NƯỚC MỚI
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setIsEditingOrder(false);
                            clearCart();
                          }}
                          className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-bold text-xs rounded-xl transition active:scale-95 whitespace-nowrap"
                        >
                          ✕ Hủy sửa
                        </button>
                      </div>
                    )}

                    {/* Search Bar & Flex-Wrap Category Pills Bar */}
                    {sessionData && (
                      <div className="space-y-2 flex-shrink-0">
                        <div className="relative w-full">
                          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Tìm món theo tên, hương vị..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-white text-navy-950 placeholder-slate-400 text-xs font-bold rounded-xl border border-slate-200/90 shadow-sm outline-none focus:border-navy-600"
                          />
                        </div>

                        {/* Category Flex-Wrap Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 py-1">
                          <button
                            onClick={() => setSelectedCategory('ALL')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition whitespace-nowrap flex-shrink-0 ${
                              selectedCategory === 'ALL'
                                ? 'bg-navy-950 text-white shadow-md font-black'
                                : 'bg-white text-navy-900 hover:bg-slate-100 border border-slate-200/80 shadow-xs'
                            }`}
                          >
                            🌟 Tất cả ({productsData.products.length})
                          </button>

                          {productsData.categories.map(cat => {
                            const isSel = selectedCategory === cat.id;
                            const catUpper = cat.name.toUpperCase();
                            const emoji = CATEGORY_EMOJI_MAP[catUpper] || '🧋';
                            const prodCount = productsData.products.filter(p => p.category_id === cat.id).length;

                            return (
                              <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 ${
                                  isSel
                                    ? 'bg-navy-950 text-white shadow-md font-black'
                                    : 'bg-white text-navy-900 hover:bg-slate-100 border border-slate-200/80 shadow-xs'
                                }`}
                              >
                                {emoji} {cat.name} ({prodCount})
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Inner Scrollable Products Grid Grouped by Category */}
                    <div className="flex-1 overflow-y-auto pr-1 pb-20 space-y-4">
                      {productsLoading ? (
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                          {[1, 2, 3, 4, 5, 6].map(n => (
                            <div key={n} className="h-24 bg-slate-200 rounded-2xl animate-pulse" />
                          ))}
                        </div>
                      ) : groupedCategories.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 text-xs bg-white/80 rounded-2xl border border-slate-200">
                          Không tìm thấy món nào phù hợp
                        </div>
                      ) : (
                        groupedCategories.map(catGroup => {
                          const emoji = CATEGORY_EMOJI_MAP[catGroup.name.toUpperCase()] || '🧋';
                          return (
                            <div key={catGroup.id} className="space-y-1.5">
                              <div className="flex items-center gap-1.5 px-1 border-b border-slate-300 pb-1">
                                <span className="text-xs font-black text-navy-950 uppercase tracking-wider">
                                  {emoji} {catGroup.name} ({catGroup.products.length})
                                </span>
                              </div>

                              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
                                {catGroup.products.map(product => (
                                  <ProductCard
                                    key={product.id}
                                    product={product}
                                    categoryName={catGroup.name}
                                    onSelect={(prod) => setCustomizeProduct(prod)}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                )}

              </div>
            )}

          </div>
        )}

      </main>

      {/* Floating Cart Bar (Fixed at bottom) */}
      {cartItems.length > 0 && !isAdmin && (
        <div className="fixed bottom-3 left-4 right-4 z-40 max-w-md mx-auto animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3.5 px-5 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white font-black text-sm rounded-2xl shadow-2xl flex items-center justify-between active:scale-98 transition border-2 border-amber-400 relative overflow-hidden"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-navy-950 flex items-center justify-center font-black text-sm shadow-md animate-bounce flex-shrink-0">
                {totalCups}
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-black text-white whitespace-nowrap">Giỏ hàng ({cartItems.length} món)</span>
                  <span className="animate-pulse bg-red-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase whitespace-nowrap">
                    ⚡ BẤM CHỐT ĐƠN NGAY!
                  </span>
                </div>
                <span className="text-[10px] text-amber-300 font-bold block animate-pulse truncate">
                  👉 Bấm vào đây gửi đơn ngay tránh quên!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-base font-black text-amber-300 whitespace-nowrap">{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</span>
              <ChevronRight className="w-5 h-5 text-amber-300 animate-pulse flex-shrink-0" />
            </div>
          </button>
        </div>
      )}

      {/* Modals */}
      <UserPickerModal
        isOpen={isUserPickerOpen}
        onClose={() => setIsUserPickerOpen(false)}
      />

      <CreateGroupOrderWizard
        isOpen={isCreateGroupWizardOpen}
        onClose={() => setIsCreateGroupWizardOpen(false)}
        onSuccess={() => {
          fetchTodaySession();
          setUserModeView('SHOW_MENU');
        }}
      />

      <MyCreatedOrdersModal
        isOpen={isMyCreatedOrdersOpen}
        onClose={() => setIsMyCreatedOrdersOpen(false)}
        sessionId={sessionData?.id}
        onCancelSuccess={() => {
          fetchTodaySession();
          setUserModeView('ENTRY');
        }}
      />

      <OriginalMenuModal
        isOpen={isOriginalMenuOpen}
        onClose={() => setIsOriginalMenuOpen(false)}
        menuFiles={sessionData?.menuFiles || []}
        storeName={sessionData?.store_name || ''}
      />

      <CustomizeBottomSheet
        product={customizeProduct}
        availableToppings={productsData.toppings}
        sessionId={sessionData?.id}
        allowedEmployeeIds={sessionData?.allowedEmployeeIds}
        isSessionClosed={isSessionClosed}
        onClose={() => setCustomizeProduct(null)}
        onOrderSubmitted={() => {
          fetchTodaySession();
          if (currentUser && sessionData) fetchMyOrder(sessionData.id, currentUser.id);
        }}
      />

      <CartDrawer
        sessionId={sessionData?.id}
        isSessionClosed={isSessionClosed}
        onOrderSubmitted={() => {
          setIsEditingOrder(false);
          fetchTodaySession();
          if (currentUser && sessionData) fetchMyOrder(sessionData.id, currentUser.id);
        }}
      />

      <PersonalStatsModal
        isOpen={isPersonalStatsOpen}
        onClose={() => setIsPersonalStatsOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
      />

      {/* Admin Specific Modals */}
      <SessionManager
        isOpen={isSessionManagerOpen}
        onClose={() => setIsSessionManagerOpen(false)}
        onSuccess={fetchTodaySession}
      />

      <MessageExporterModal
        sessionId={exportSessionId}
        isOpen={isMessageExporterOpen}
        onClose={() => {
          setIsMessageExporterOpen(false);
          setExportSessionId(null);
        }}
      />

      {digitizeStore && (
        <DigitizedMenuEditor
          store={digitizeStore}
          onClose={() => setDigitizeStore(null)}
        />
      )}

      {ocrStore && (
        <OCRParseModal
          store={ocrStore}
          onClose={() => setOcrStore(null)}
          onSuccess={fetchTodaySession}
        />
      )}

      {excelStore && (
        <ExcelImportModal
          store={excelStore}
          onClose={() => setExcelStore(null)}
          onSuccess={fetchTodaySession}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </UserProvider>
  );
}
