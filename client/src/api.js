// API Service Helper for Drink Order Web App
const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Lỗi yêu cầu: ${res.status}`);
  }
  return data;
}

export const api = {
  // Employees
  getEmployees: (activeOnly = false) => request(`/employees${activeOnly ? '?active=1' : ''}`),
  getEmployee: (id) => request(`/employees/${id}`),
  loginEmployee: (employeeId, password = null) => request('/employees/login', { method: 'POST', body: JSON.stringify({ employee_id: employeeId, password }) }),
  setEmployeePassword: (id, password) => request(`/employees/${id}/set-password`, { method: 'POST', body: JSON.stringify({ password }) }),
  skipEmployeePassword: (id) => request(`/employees/${id}/skip-password`, { method: 'POST' }),
  resetEmployeePassword: (id) => request(`/employees/${id}/reset-password`, { method: 'POST' }),
  createEmployee: (data) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
  updateEmployee: (id, data) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleEmployeeStatus: (id) => request(`/employees/${id}/status`, { method: 'PATCH' }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  getUnOrderedEmployees: (sessionId) => request(`/employees/un-ordered/${sessionId}`),

  // Stores
  getStores: () => request('/stores'),
  getStore: (id) => request(`/stores/${id}`),
  createStore: (data) => request('/stores', { method: 'POST', body: JSON.stringify(data) }),
  updateStore: (id, data) => request(`/stores/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStore: (id) => request(`/stores/${id}`, { method: 'DELETE' }),
  updateDeliveryProfile: (storeId, data) => request(`/stores/${storeId}/delivery-profile`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadMenuFiles: async (storeId, formData) => {
    const res = await fetch(`${API_BASE}/stores/${storeId}/menu-files`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi upload menu');
    return data;
  },
  deleteMenuFile: (storeId, fileId) => request(`/stores/${storeId}/menu-files/${fileId}`, { method: 'DELETE' }),
  reorderMenuFiles: (storeId, items) => request(`/stores/${storeId}/menu-files/reorder`, { method: 'PUT', body: JSON.stringify({ items }) }),

  // Products, Categories, Toppings
  createCategory: (storeId, data) => request(`/stores/${storeId}/categories`, { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  createProduct: (storeId, data) => request(`/stores/${storeId}/products`, { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  toggleProductAvailability: (id) => request(`/products/${id}/availability`, { method: 'PATCH' }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  createTopping: (storeId, data) => request(`/stores/${storeId}/toppings`, { method: 'POST', body: JSON.stringify(data) }),
  updateTopping: (id, data) => request(`/toppings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTopping: (id) => request(`/toppings/${id}`, { method: 'DELETE' }),

  // Excel Import & OCR Draft
  previewExcel: async (storeId, formData) => {
    const res = await fetch(`${API_BASE}/stores/${storeId}/preview-excel`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Lỗi đọc file Excel');
    return data;
  },
  confirmImportExcel: (storeId, items) => request(`/stores/${storeId}/confirm-import-excel`, { method: 'POST', body: JSON.stringify({ items }) }),
  ocrDraft: (storeId, data) => request(`/stores/${storeId}/ocr-draft`, { method: 'POST', body: JSON.stringify(data) }),

  // Sessions
  getTodaySession: (sessionId = null, employeeId = null, allSessions = false) => {
    const params = new URLSearchParams();
    if (sessionId) params.append('sessionId', sessionId);
    if (employeeId) params.append('employee_id', employeeId);
    if (allSessions) params.append('all_sessions', '1');
    const qs = params.toString();
    return request(`/sessions/today${qs ? `?${qs}` : ''}`);
  },
  getActiveSessions: (employeeId = null, allSessions = false) => {
    const params = new URLSearchParams();
    if (employeeId) params.append('employee_id', employeeId);
    if (allSessions) params.append('all_sessions', '1');
    const qs = params.toString();
    return request(`/sessions/active${qs ? `?${qs}` : ''}`);
  },
  getAllSessions: () => request('/sessions'),
  getSession: (id) => request(`/sessions/${id}`),
  createSession: (data) => request('/sessions', { method: 'POST', body: JSON.stringify(data) }),
  createGroupSession: (data) => request('/sessions/group', { method: 'POST', body: JSON.stringify(data) }),
  closeSession: (id) => request(`/sessions/${id}/close`, { method: 'PATCH' }),
  reopenSession: (id) => request(`/sessions/${id}/reopen`, { method: 'PATCH' }),
  updateSessionDelivery: (id, data) => request(`/sessions/${id}/delivery-info`, { method: 'PUT', body: JSON.stringify(data) }),
  updateSessionSponsor: (id, data) => request(`/sessions/${id}/sponsor`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateSessionSettings: (id, data) => request(`/sessions/${id}/settings`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSession: (id) => request(`/sessions/${id}`, { method: 'DELETE' }),

  // Orders
  placeOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrder: (sessionId, employeeId) => request(`/orders/my-order?sessionId=${sessionId}&employeeId=${employeeId}`),
  getEmployeeOrders: (employeeId, limit = 10) => request(`/orders/employee/${employeeId}?limit=${limit}`),
  cancelOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  toggleOrderPayment: (orderId, isPaid) => request(`/orders/${orderId}/payment`, { method: 'PATCH', body: JSON.stringify({ is_paid: isPaid ? 1 : 0 }) }),
  getFrequentDrinks: (employeeId, storeId) => request(`/orders/frequent/${employeeId}${storeId ? `?storeId=${storeId}` : ''}`),

  // Aggregation & Export Message
  getExportMessage: (sessionId, mode = 'GON') => request(`/aggregation/${sessionId}/export-message?mode=${mode}`),
  getSessionOrdersDetail: (sessionId) => request(`/aggregation/${sessionId}/orders-detail`),

  // Stats & Dashboard
  getDashboardStats: (sessionId) => request(`/stats/dashboard${sessionId ? `?sessionId=${sessionId}` : ''}`),
  getHistory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/stats/history?${qs}`);
  },
  getPersonalStats: (employeeId, month) => request(`/stats/personal/${employeeId}${month ? `?month=${month}` : ''}`),

  // Excel Report Download
  getExcelDownloadUrl: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return `${API_BASE}/export/excel?${qs}`;
  },

  // Settings & Admin
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', { method: 'PUT', body: JSON.stringify(data) }),
  adminLogin: (pin) => request('/settings/admin-login', { method: 'POST', body: JSON.stringify({ pin }) }),
  changeAdminPin: (data) => request('/settings/admin-pin', { method: 'PUT', body: JSON.stringify(data) }),
};
