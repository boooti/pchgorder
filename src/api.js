import { offlineStorage } from './offlineStorage';

const API_BASE = '/api';

async function fetchOrOffline(url, options = {}, offlineFallbackFn) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Network / Server offline error -> Fallback to client-side offline storage!
  }

  // Execute pure offline storage fallback
  if (typeof offlineFallbackFn === 'function') {
    return Promise.resolve(offlineFallbackFn());
  }

  throw new Error('Đã có lỗi xảy ra');
}

export const api = {
  // Auth & Settings
  loginAdmin: (password) => fetchOrOffline(
    '/auth/login',
    { method: 'POST', body: JSON.stringify({ password }) },
    () => offlineStorage.loginAdmin(password)
  ),
  
  getSettings: () => fetchOrOffline(
    '/auth/settings',
    {},
    () => offlineStorage.getSettings()
  ),

  updateSubsidy: (enabled, amount) => fetchOrOffline(
    '/auth/settings/subsidy',
    { method: 'PUT', body: JSON.stringify({ subsidy_enabled: enabled, subsidy_amount_per_person: amount }) },
    () => offlineStorage.updateSubsidy(enabled, amount)
  ),

  // Employees
  getEmployees: () => fetchOrOffline(
    '/employees',
    {},
    () => offlineStorage.getEmployees()
  ),

  createEmployee: (emp) => fetchOrOffline(
    '/employees',
    { method: 'POST', body: JSON.stringify(emp) },
    () => offlineStorage.createEmployee(emp)
  ),

  updateEmployee: (id, emp) => fetchOrOffline(
    `/employees/${id}`,
    { method: 'PUT', body: JSON.stringify(emp) },
    () => offlineStorage.updateEmployee(id, emp)
  ),

  toggleEmployeeActive: (id) => fetchOrOffline(
    `/employees/${id}/toggle-active`,
    { method: 'PATCH' },
    () => offlineStorage.toggleEmployeeActive(id)
  ),

  deleteEmployee: (id) => fetchOrOffline(
    `/employees/${id}`,
    { method: 'DELETE' },
    () => offlineStorage.deleteEmployee(id)
  ),

  // Stores
  getStores: () => fetchOrOffline(
    '/stores',
    {},
    () => offlineStorage.getStores()
  ),

  getStore: (id) => fetchOrOffline(
    `/stores/${id}`,
    {},
    () => offlineStorage.getStore(id)
  ),

  createStore: (store) => fetchOrOffline(
    '/stores',
    { method: 'POST', body: JSON.stringify(store) },
    () => offlineStorage.createStore(store)
  ),

  updateStore: (id, store) => fetchOrOffline(
    `/stores/${id}`,
    { method: 'PUT', body: JSON.stringify(store) },
    () => offlineStorage.updateStore(id, store)
  ),

  deleteStore: (id) => fetchOrOffline(
    `/stores/${id}`,
    { method: 'DELETE' },
    () => offlineStorage.deleteStore(id)
  ),

  updateCompanyLogo: (logo) => fetchOrOffline(
    '/stores/company-logo',
    { method: 'POST', body: JSON.stringify({ logo }) },
    () => ({ success: true, logoUrl: '/company_logo.png' })
  ),

  updateDefaultDelivery: (storeId, delivery) => fetchOrOffline(
    `/stores/${storeId}/delivery-default`,
    { method: 'PUT', body: JSON.stringify(delivery) },
    () => offlineStorage.updateDefaultDelivery(storeId, delivery)
  ),

  addMenuFileUrl: (storeId, url, name) => fetchOrOffline(
    `/stores/${storeId}/menu-files-url`,
    { method: 'POST', body: JSON.stringify({ url, name }) },
    () => offlineStorage.addMenuFileUrl(storeId, url, name)
  ),

  deleteMenuFile: (fileId) => fetchOrOffline(
    `/stores/menu-files/${fileId}`,
    { method: 'DELETE' },
    () => offlineStorage.deleteMenuFile(fileId)
  ),

  // Products & Menu
  getProductsByStore: (storeId) => fetchOrOffline(
    `/products?storeId=${storeId}`,
    {},
    () => offlineStorage.getProductsByStore(storeId)
  ),

  createProduct: (product) => fetchOrOffline(
    '/products',
    { method: 'POST', body: JSON.stringify(product) },
    () => offlineStorage.createProduct(product)
  ),

  updateProduct: (id, product) => fetchOrOffline(
    `/products/${id}`,
    { method: 'PUT', body: JSON.stringify(product) },
    () => offlineStorage.updateProduct(id, product)
  ),

  toggleProductAvailable: (id) => fetchOrOffline(
    `/products/${id}/toggle-available`,
    { method: 'PATCH' },
    () => offlineStorage.toggleProductAvailable(id)
  ),

  deleteProduct: (id) => fetchOrOffline(
    `/products/${id}`,
    { method: 'DELETE' },
    () => offlineStorage.deleteProduct(id)
  ),

  createCategory: (store_id, name) => fetchOrOffline(
    '/products/categories',
    { method: 'POST', body: JSON.stringify({ store_id, name }) },
    () => offlineStorage.createCategory(store_id, name)
  ),

  updateCategory: (id, name) => fetchOrOffline(
    `/products/categories/${id}`,
    { method: 'PUT', body: JSON.stringify({ name }) },
    () => offlineStorage.updateCategory(id, name)
  ),

  deleteCategory: (id) => fetchOrOffline(
    `/products/categories/${id}`,
    { method: 'DELETE' },
    () => offlineStorage.deleteCategory(id)
  ),

  createTopping: (store_id, topping_name, price) => fetchOrOffline(
    '/products/toppings',
    { method: 'POST', body: JSON.stringify({ store_id, topping_name, price }) },
    () => offlineStorage.createTopping(store_id, topping_name, price)
  ),

  deleteTopping: (id) => fetchOrOffline(
    `/products/toppings/${id}`,
    { method: 'DELETE' },
    () => offlineStorage.deleteTopping(id)
  ),

  // Menu Digitization
  parseOcrMenu: (storeId) => fetchOrOffline(
    '/products/parse-ocr',
    { method: 'POST', body: JSON.stringify({ storeId }) },
    () => offlineStorage.parseOcrMenu(storeId)
  ),

  importExcelMenu: (storeId, items) => fetchOrOffline(
    '/products/import-excel',
    { method: 'POST', body: JSON.stringify({ storeId, items }) },
    () => offlineStorage.importExcelMenu(storeId, items)
  ),

  // Sessions
  getTodaySession: () => fetchOrOffline(
    '/sessions/today',
    {},
    () => offlineStorage.getTodaySession()
  ),

  openSession: (data) => fetchOrOffline(
    '/sessions/open',
    { method: 'POST', body: JSON.stringify(data) },
    () => offlineStorage.openSession(data)
  ),

  closeSession: (sessionId) => fetchOrOffline(
    '/sessions/close',
    { method: 'POST', body: JSON.stringify({ sessionId }) },
    () => offlineStorage.closeSession(sessionId)
  ),

  cancelSession: (sessionId, employeeId) => fetchOrOffline(
    '/sessions/cancel',
    { method: 'POST', body: JSON.stringify({ sessionId, employeeId }) },
    () => offlineStorage.closeSession(sessionId)
  ),

  reopenSession: (sessionId) => fetchOrOffline(
    '/sessions/reopen',
    { method: 'POST', body: JSON.stringify({ sessionId }) },
    () => offlineStorage.reopenSession(sessionId)
  ),

  // Orders
  getTodayOrders: (sessionId) => fetchOrOffline(
    `/orders/today?sessionId=${sessionId}`,
    {},
    () => offlineStorage.getTodayOrders(sessionId)
  ),

  getMyTodayOrder: (sessionId, employeeId) => fetchOrOffline(
    `/orders/my-today?sessionId=${sessionId}&employeeId=${employeeId}`,
    {},
    () => offlineStorage.getMyTodayOrder(sessionId, employeeId)
  ),

  getRecentOrders: (employeeId) => fetchOrOffline(
    `/orders/recent?employeeId=${employeeId}`,
    {},
    () => offlineStorage.getRecentOrders(employeeId)
  ),

  submitOrder: (orderData) => fetchOrOffline(
    '/orders',
    { method: 'POST', body: JSON.stringify(orderData) },
    () => offlineStorage.submitOrder(orderData)
  ),

  deleteOrder: (id) => fetchOrOffline(
    `/orders/${id}`,
    { method: 'DELETE' },
    () => offlineStorage.deleteOrder(id)
  ),

  // History & Stats
  getHistory: () => fetchOrOffline(
    '/history',
    {},
    () => offlineStorage.getHistory()
  ),

  getPersonalStats: (employeeId) => fetchOrOffline(
    `/history/personal/${employeeId}`,
    {},
    () => offlineStorage.getPersonalStats(employeeId)
  ),

  // Export
  getFormattedMessage: (sessionId, mode = 'GỌN') => fetchOrOffline(
    `/export/message?sessionId=${sessionId}&mode=${encodeURIComponent(mode)}`,
    {},
    () => offlineStorage.getFormattedMessage(sessionId, mode)
  ),

  getExcelDownloadUrl: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return `/api/export/excel?${query}`;
  }
};
