import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Toast, { showToast } from './components/Toast';
import UserIdentifyModal from './components/UserIdentifyModal';
import OriginalMenuModal from './components/OriginalMenuModal';
import CustomizeItemSheet from './components/CustomizeItemSheet';
import FloatingCart from './components/FloatingCart';
import OrderSuccessModal from './components/OrderSuccessModal';
import ZaloMessageModal from './components/ZaloMessageModal';
import CreateGroupOrderModal from './components/CreateGroupOrderModal';

// Employee Pages
import EmployeeHome from './pages/EmployeeHome';
import MyOrders from './pages/MyOrders';
import EmployeeStats from './pages/EmployeeStats';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSessions from './pages/admin/AdminSessions';
import AdminStores from './pages/admin/AdminStores';
import AdminStoreDetail from './pages/admin/AdminStoreDetail';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminHistory from './pages/admin/AdminHistory';
import AdminSettings from './pages/admin/AdminSettings';

import { api } from './api';
import { checkIsEligible } from './utils';
import { Lock, X } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeView, setActiveView] = useState('home'); // 'home', 'my-order', 'stats', 'admin'
  const [adminTab, setAdminTab] = useState('dashboard');
  const [selectedStoreDetailId, setSelectedStoreDetailId] = useState(null);

  // User State
  const [currentUser, setCurrentUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Admin Auth State (Always requires PIN to access)
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);

  // Session & Store State
  const [session, setSession] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [subsidyAmount, setSubsidyAmount] = useState(20000);
  const [frequentDrinks, setFrequentDrinks] = useState(null);

  // Group Order Modal State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // Cart State (Persisted in localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('drink_order_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Modals
  const [customizeModal, setCustomizeModal] = useState({ isOpen: false, product: null, initialData: null });
  const [isOriginalMenuOpen, setIsOriginalMenuOpen] = useState(false);
  const [orderSuccessModal, setOrderSuccessModal] = useState({ isOpen: false, order: null });
  const [zaloModal, setZaloModal] = useState({ isOpen: false, sessionId: null });

  // 1. Initial Load: Check stored user, load settings
  useEffect(() => {
    loadSettings();
    checkStoredUser();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('drink_order_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Load session & frequent drinks when user changes
  useEffect(() => {
    if (currentUser) {
      loadTodaySession(null, currentUser.id);
      loadFrequentDrinks(currentUser.id, session?.store_id);
    } else {
      loadTodaySession(null, null);
    }
  }, [currentUser?.id]);

  async function checkStoredUser() {
    const storedId = localStorage.getItem('drink_order_employee_id');
    if (storedId) {
      try {
        const res = await api.getEmployee(storedId);
        if (res.success && res.data) {
          setCurrentUser(res.data);
          return;
        }
      } catch (e) {}
    }
    // If no user stored, prompt user identify modal
    setIsUserModalOpen(true);
    loadTodaySession(null, null);
  }

  async function loadActiveSessions(empId = currentUser?.id) {
    try {
      const res = await api.getActiveSessions(empId);
      if (res.success && res.data) {
        setActiveSessions(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function loadTodaySession(targetSessionId = null, empId = currentUser?.id) {
    try {
      const res = await api.getTodaySession(targetSessionId, empId);
      if (res.success) {
        setSession(res.data);
      }
      loadActiveSessions(empId);
    } catch (err) {
      console.error(err);
      if (err.message && (err.message.includes('không có tên') || err.message.includes('không liên quan') || err.message.includes('không thuộc'))) {
        showToast(err.message, 'error');
        if (targetSessionId) {
          // Fallback to load default session for user
          loadTodaySession(null, empId);
        }
      }
    }
  }

  async function loadSettings() {
    try {
      const res = await api.getSettings();
      if (res.success && res.data.subsidy) {
        if (res.data.subsidy.enabled) {
          setSubsidyAmount(res.data.subsidy.amount_per_person || 20000);
        } else {
          setSubsidyAmount(0);
        }
      }
    } catch (e) {}
  }

  async function loadFrequentDrinks(empId, storeId) {
    try {
      const res = await api.getFrequentDrinks(empId, storeId);
      if (res.success) {
        setFrequentDrinks(res.data);
      }
    } catch (e) {}
  }

  // Handle User Identification
  const handleSelectUser = (emp) => {
    setCurrentUser(emp);
    localStorage.setItem('drink_order_employee_id', emp.id);
    setIsUserModalOpen(false);
    showToast(`Chào mừng bạn, ${emp.name}!`, 'success');
    loadTodaySession(null, emp.id);
  };

  // Handle Admin Login
  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    if (!adminPinInput) return;
    try {
      setAdminLoginLoading(true);
      const res = await api.adminLogin(adminPinInput);
      if (res.success) {
        setIsAdmin(true);
        setIsAdminLoginOpen(false);
        setAdminPinInput('');
        setActiveView('admin');
        showToast('Đăng nhập Quản trị viên thành công!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAdminLoginLoading(false);
    }
  };

  const handleExitAdmin = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('admin_authenticated');
    setActiveView('home');
    showToast('Đã thoát phiên Quản trị viên', 'info');
  };

  // Safety guard: require authenticated PIN to view admin
  useEffect(() => {
    if (activeView === 'admin' && !isAdmin) {
      setActiveView('home');
      setIsAdminLoginOpen(true);
    }
  }, [activeView, isAdmin]);

  // ==================== CART ACTIONS ====================
  const handleAddToCart = (item) => {
    setCart((prev) => {
      // Check if existing cart_item_id is being updated
      const existingIdx = prev.findIndex((i) => i.cart_item_id === item.cart_item_id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = item;
        return copy;
      }
      return [...prev, item];
    });
    showToast(`Đã thêm ${item.product_name} vào giỏ`, 'success');
  };

  const handleUpdateCartQty = (cartItemId, newQty) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.cart_item_id === cartItemId) {
          const unitTotal = i.unit_price + (i.topping_price || 0);
          return { ...i, quantity: newQty, total_price: unitTotal * newQty };
        }
        return i;
      })
    );
  };

  const handleRemoveCartItem = (cartItemId) => {
    setCart((prev) => prev.filter((i) => i.cart_item_id !== cartItemId));
    showToast('Đã xóa món khỏi giỏ hàng', 'info');
  };

  const handleEditCartItem = (item) => {
    const product = session?.products?.find((p) => p.id === item.product_id) || {
      id: item.product_id,
      name: item.product_name,
      image: item.image,
      sizes: [{ size_name: item.size, price: item.unit_price }]
    };
    setCustomizeModal({
      isOpen: true,
      product: product,
      initialData: item
    });
  };

  // Quick Reorder Action (1-click)
  const handleQuickReorder = (recentItem) => {
    if (!session || session.status !== 'OPEN') {
      showToast('Phiên order hôm nay đã đóng hoặc chưa mở', 'error');
      return;
    }

    let opts = {};
    try { opts = JSON.parse(recentItem.options_snapshot); } catch (e) {}

    const unitPrice = recentItem.current_unit_price || recentItem.unit_price_snapshot;
    const item = {
      cart_item_id: `reorder-${Date.now()}`,
      product_id: recentItem.product_id,
      product_name: recentItem.product_name_snapshot,
      image: recentItem.image,
      size: recentItem.size_snapshot,
      unit_price: unitPrice,
      topping: recentItem.topping_snapshot || '',
      topping_price: recentItem.topping_price_snapshot || 0,
      sugar: opts.sugar || '100%',
      ice: opts.ice || 'Bình thường',
      note: opts.note || '',
      quantity: 1,
      total_price: unitPrice + (recentItem.topping_price_snapshot || 0)
    };

    handleAddToCart(item);
  };

  // Place Order (Submit Cart)
  const handleSubmitOrder = async () => {
    if (!currentUser) {
      setIsUserModalOpen(true);
      return;
    }
    if (!session) {
      showToast('Hôm nay chưa có quán nào mở order', 'error');
      return;
    }
    if (session.status !== 'OPEN') {
      showToast('ORDER ĐÃ ĐÓNG! Quản trị viên đã chốt đơn.', 'error');
      return;
    }
    if (!checkIsEligible(session, currentUser)) {
      showToast('Bạn không có tên trong danh sách nhóm này và không thể đặt món!', 'error');
      return;
    }
    if (cart.length === 0) {
      showToast('Giỏ hàng của bạn đang trống', 'error');
      return;
    }

    try {
      setIsSubmittingOrder(true);
      const payload = {
        session_id: session.id,
        employee_id: currentUser.id,
        items: cart.map((it) => ({
          product_id: it.product_id,
          product_name: it.product_name,
          size: it.size,
          unit_price: it.unit_price,
          topping: it.topping,
          topping_price: it.topping_price,
          sugar: it.sugar,
          ice: it.ice,
          note: it.note,
          quantity: it.quantity
        }))
      };

      const res = await api.placeOrder(payload);
      if (res.success) {
        setCart([]); // Clear cart
        setOrderSuccessModal({ isOpen: true, order: res.data });
        loadTodaySession(session.id, currentUser.id);
        if (currentUser) loadFrequentDrinks(currentUser.id, session.store_id);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100">
      {/* Global Toast */}
      <Toast />

      {/* User Identification Modal */}
      <UserIdentifyModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSelectUser={handleSelectUser}
        currentUserId={currentUser?.id}
      />

      {/* Admin PIN Login Modal */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs overflow-hidden border border-slate-200">
            <div className="p-5 text-center bg-slate-950 text-white relative">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-2 shadow">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Đăng nhập Quản trị</h3>
              <p className="text-xs text-slate-400 mt-0.5">Nhập mã PIN để vào trang Admin</p>
              <button
                onClick={() => setIsAdminLoginOpen(false)}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mã PIN Admin
                </label>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="Nhập mã PIN Quản trị..."
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={adminLoginLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow transition-all flex items-center justify-center gap-2"
              >
                {adminLoginLoading ? 'Đang kiểm tra...' : 'XÁC NHẬN ĐĂNG NHẬP'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ROUTING */}
      {activeView === 'admin' ? (
        <AdminLayout
          activeTab={adminTab}
          setActiveTab={(tab) => {
            setAdminTab(tab);
            setSelectedStoreDetailId(null);
          }}
          onExitAdmin={handleExitAdmin}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboard
              onOpenZaloModal={(sessId) => setZaloModal({ isOpen: true, sessionId: sessId })}
              onNavigateToSessions={() => setAdminTab('sessions')}
            />
          )}

          {adminTab === 'sessions' && (
            <AdminSessions
              onSessionCreated={() => {
                loadTodaySession();
                setAdminTab('dashboard');
              }}
            />
          )}

          {adminTab === 'stores' && !selectedStoreDetailId && (
            <AdminStores
              onSelectStore={(stId) => {
                setSelectedStoreDetailId(stId);
                setAdminTab('store-detail');
              }}
            />
          )}

          {adminTab === 'store-detail' && selectedStoreDetailId && (
            <AdminStoreDetail
              storeId={selectedStoreDetailId}
              onBack={() => {
                setSelectedStoreDetailId(null);
                setAdminTab('stores');
              }}
            />
          )}

          {adminTab === 'employees' && <AdminEmployees />}

          {adminTab === 'history' && (
            <AdminHistory
              onOpenZaloModal={(sessId) => setZaloModal({ isOpen: true, sessionId: sessId })}
            />
          )}

          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
      ) : (
        <>
          {/* Top Navbar */}
          <Navbar
            currentUser={currentUser}
            onOpenUserModal={() => setIsUserModalOpen(true)}
            onOpenCreateGroup={() => {
              if (!currentUser) setIsUserModalOpen(true);
              else setIsCreateGroupOpen(true);
            }}
            activeView={activeView}
            setActiveView={setActiveView}
            isAdmin={isAdmin}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
            todayOrderCount={session?.total_orders || 0}
          />

          {/* Employee Sub-Views */}
          {activeView === 'home' && (
            <EmployeeHome
              session={session}
              currentUser={currentUser}
              activeSessions={activeSessions}
              onSelectSession={(sId) => loadTodaySession(sId, currentUser?.id)}
              onOpenCreateGroup={() => {
                if (!currentUser) setIsUserModalOpen(true);
                else setIsCreateGroupOpen(true);
              }}
              onOpenZaloModal={(sId) => setZaloModal({ isOpen: true, sessionId: sId })}
              onRefreshSession={() => loadTodaySession(session?.id, currentUser?.id)}
              onOpenOriginalMenu={() => setIsOriginalMenuOpen(true)}
              onOpenCustomize={(product) => setCustomizeModal({ isOpen: true, product, initialData: null })}
              onQuickReorder={handleQuickReorder}
              frequentDrinks={frequentDrinks}
              onOpenUserModal={() => setIsUserModalOpen(true)}
            />
          )}

          {activeView === 'my-order' && (
            <MyOrders
              session={session}
              currentUser={currentUser}
              onNavigateHome={() => setActiveView('home')}
              onOpenCustomize={(product) => setCustomizeModal({ isOpen: true, product, initialData: null })}
              onOrderCancelled={() => loadTodaySession(null, currentUser?.id)}
            />
          )}

          {activeView === 'stats' && <EmployeeStats currentUser={currentUser} />}

          {/* Floating Sticky Cart */}
          <FloatingCart
            cartItems={cart}
            subsidyAmount={subsidyAmount}
            session={session}
            onUpdateQty={handleUpdateCartQty}
            onRemoveItem={handleRemoveCartItem}
            onEditItem={handleEditCartItem}
            onSubmitOrder={handleSubmitOrder}
            isSubmitting={isSubmittingOrder}
            isSessionClosed={session?.status !== 'OPEN' || !checkIsEligible(session, currentUser)}
          />

          {/* Drink Customization Bottom Sheet */}
          <CustomizeItemSheet
            isOpen={customizeModal.isOpen}
            onClose={() => setCustomizeModal({ isOpen: false, product: null, initialData: null })}
            product={customizeModal.product}
            availableToppings={session?.toppings || []}
            onAddToCart={handleAddToCart}
            initialData={customizeModal.initialData}
          />

          {/* Original Menu Viewer Modal */}
          <OriginalMenuModal
            isOpen={isOriginalMenuOpen}
            onClose={() => setIsOriginalMenuOpen(false)}
            menuFiles={session?.menu_files || []}
            storeName={session?.store_name}
          />

          {/* Order Success Confetti Modal */}
          <OrderSuccessModal
            isOpen={orderSuccessModal.isOpen}
            onClose={() => setOrderSuccessModal({ isOpen: false, order: null })}
            order={orderSuccessModal.order}
            session={session}
            onEditOrder={() => {
              setOrderSuccessModal({ isOpen: false, order: null });
              setActiveView('my-order');
            }}
            onCancelOrder={async () => {
              if (!orderSuccessModal.order) return;
              try {
                await api.cancelOrder(orderSuccessModal.order.id);
                showToast('Đã hủy đơn hàng', 'success');
                setOrderSuccessModal({ isOpen: false, order: null });
                loadTodaySession(null, currentUser?.id);
              } catch (e) {
                showToast(e.message, 'error');
              }
            }}
          />

          {/* Create Group Order Modal */}
          <CreateGroupOrderModal
            isOpen={isCreateGroupOpen}
            onClose={() => setIsCreateGroupOpen(false)}
            currentUser={currentUser}
            onGroupCreated={(newSessionId) => {
              loadTodaySession(newSessionId, currentUser?.id);
            }}
          />
        </>
      )}

      {/* Global Zalo Message Export Modal */}
      <ZaloMessageModal
        isOpen={zaloModal.isOpen}
        onClose={() => setZaloModal({ isOpen: false, sessionId: null })}
        sessionId={zaloModal.sessionId}
      />
    </div>
  );
}
