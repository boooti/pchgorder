import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get today's active session
router.get('/today', (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Find latest open or today session
  const session = db.prepare(`
    SELECT s.*, st.name as store_name, st.logo as store_logo, st.cover_image as store_cover, st.phone as store_phone
    FROM daily_order_sessions s
    JOIN stores st ON s.store_id = st.id
    WHERE s.date = ?
    ORDER BY s.id DESC
    LIMIT 1
  `).get(todayStr);

  if (!session) {
    return res.json({ active: false, message: 'Chưa chọn quán order cho hôm nay' });
  }

  // Count active employees and orders count
  const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees WHERE is_active = 1').get()?.count || 0;
  const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE session_id = ?').get(session.id)?.count || 0;
  
  const totalCupsRes = db.prepare(`
    SELECT SUM(oi.quantity) as count
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.session_id = ?
  `).get(session.id);
  const totalCups = totalCupsRes?.count || 0;

  const totalAmountRes = db.prepare('SELECT SUM(total_amount) as total FROM orders WHERE session_id = ?').get(session.id);
  const totalAmount = totalAmountRes?.total || 0;

  // Fetch original menu files
  const menuFiles = db.prepare('SELECT * FROM store_menu_files WHERE store_id = ? ORDER BY page_number ASC').all(session.store_id);

  // Parse allowed employees list if present
  let allowedEmployeeIds = null;
  if (session.allowed_employees_json) {
    try {
      allowedEmployeeIds = JSON.parse(session.allowed_employees_json);
    } catch(e) {}
  }

  res.json({
    active: true,
    session: {
      ...session,
      allowedEmployeeIds,
      totalEmployees,
      ordersCount,
      totalCups,
      totalAmount,
      menuFiles
    }
  });
});

// Create/Open Today's Session (Admin or Group Wizard Select Store Today)
router.post('/open', (req, res) => {
  const {
    storeId,
    cutoff_time,
    recipient_name,
    recipient_phone,
    delivery_address,
    delivery_time,
    delivery_note,
    save_as_default,
    sponsor_mode,
    sponsor_name,
    sponsor_amount,
    allowed_employee_ids
  } = req.body;

  if (!storeId) return res.status(400).json({ message: 'Vui lòng chọn quán!' });

  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(storeId);
  if (!store) return res.status(404).json({ message: 'Không tìm thấy quán!' });

  const isValidTime = (t) => {
    if (!t || typeof t !== 'string' || !t.includes(':')) return false;
    const parts = t.trim().split(':');
    if (parts.length !== 2) return false;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return !isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59;
  };

  if (cutoff_time && !isValidTime(cutoff_time)) {
    return res.status(400).json({ message: 'Giờ hết nhận order không hợp lệ (Ví dụ 14:80 là không hợp lệ)! Phút phải từ 00 đến 59, giờ từ 00 đến 23.' });
  }
  if (delivery_time && !isValidTime(delivery_time)) {
    return res.status(400).json({ message: 'Giờ quán giao nước không hợp lệ (Ví dụ 14:80 là không hợp lệ)! Phút phải từ 00 đến 59, giờ từ 00 đến 23.' });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Fetch store default delivery profile if input missing
  const defaultDelivery = db.prepare('SELECT * FROM delivery_profiles WHERE store_id = ?').get(storeId) || {};

  const rName = recipient_name !== undefined ? recipient_name : (defaultDelivery.recipient_name || '');
  const rPhone = recipient_phone !== undefined ? recipient_phone : (defaultDelivery.recipient_phone || '');
  const dAddr = delivery_address !== undefined ? delivery_address : (defaultDelivery.delivery_address || store.address || '');
  const dTime = delivery_time !== undefined ? delivery_time : (defaultDelivery.delivery_time || '14:30');
  const dNote = delivery_note !== undefined ? delivery_note : (defaultDelivery.delivery_note || '');
  const cTime = cutoff_time || '11:30';

  const sMode = sponsor_mode || 'COMPANY';
  const sName = sponsor_name || '';
  const sAmount = Number(sponsor_amount || 0);

  const allowedJson = Array.isArray(allowed_employee_ids) && allowed_employee_ids.length > 0
    ? JSON.stringify(allowed_employee_ids)
    : null;

  // Save as default if option checked
  if (save_as_default) {
    if (defaultDelivery.id) {
      db.prepare(`
        UPDATE delivery_profiles
        SET recipient_name = ?, recipient_phone = ?, delivery_address = ?, delivery_time = ?, delivery_note = ?
        WHERE store_id = ?
      `).run(rName, rPhone, dAddr, dTime, dNote, storeId);
    } else {
      db.prepare(`
        INSERT INTO delivery_profiles (store_id, recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(storeId, rName, rPhone, dAddr, dTime, dNote);
    }
  }

  const createdByEmpId = req.body.created_by_employee_id || null;

  const info = db.prepare(`
    INSERT INTO daily_order_sessions (date, store_id, status, cutoff_time, recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note, sponsor_mode, sponsor_name, sponsor_amount, allowed_employees_json, created_by_employee_id)
    VALUES (?, ?, 'OPEN', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(todayStr, storeId, cTime, rName, rPhone, dAddr, dTime, dNote, sMode, sName, sAmount, allowedJson, createdByEmpId);

  const newSession = db.prepare('SELECT * FROM daily_order_sessions WHERE id = ?').get(info.lastInsertRowid);

  res.json({
    success: true,
    message: `Đã mở phiên order thành công cho quán ${store.name}!`,
    session: newSession
  });
});

// Update Delivery & Sponsorship Info for Active Session
router.put('/delivery', (req, res) => {
  const { sessionId, recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note, cutoff_time, sponsor_mode, sponsor_name, sponsor_amount } = req.body;

  if (!sessionId) return res.status(400).json({ message: 'sessionId là bắt buộc' });

  const session = db.prepare('SELECT * FROM daily_order_sessions WHERE id = ?').get(sessionId);
  if (!session) return res.status(404).json({ message: 'Không tìm thấy phiên order' });

  const sMode = sponsor_mode !== undefined ? sponsor_mode : session.sponsor_mode;
  const sName = sponsor_name !== undefined ? sponsor_name : session.sponsor_name;
  const sAmount = sponsor_amount !== undefined ? Number(sponsor_amount) : session.sponsor_amount;

  db.prepare(`
    UPDATE daily_order_sessions
    SET recipient_name = ?, recipient_phone = ?, delivery_address = ?, delivery_time = ?, delivery_note = ?, cutoff_time = ?, sponsor_mode = ?, sponsor_name = ?, sponsor_amount = ?
    WHERE id = ?
  `).run(recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note, cutoff_time, sMode, sName, sAmount, sessionId);

  res.json({ success: true, message: 'Đã cập nhật thông tin phiên order hôm nay!' });
});

// Close Today's Session
router.post('/close', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: 'sessionId là bắt buộc' });

  db.prepare("UPDATE daily_order_sessions SET status = 'CLOSED' WHERE id = ?").run(sessionId);
  res.json({ success: true, message: 'Đã chốt đơn hôm nay! Không thể đặt hàng thêm.' });
});

// Cancel Group Session (For Creator or Admin)
router.post('/cancel', (req, res) => {
  const { sessionId, employeeId } = req.body;
  if (!sessionId) return res.status(400).json({ message: 'sessionId là bắt buộc' });

  const session = db.prepare('SELECT * FROM daily_order_sessions WHERE id = ?').get(sessionId);
  if (!session) return res.status(404).json({ message: 'Không tìm thấy phiên order!' });

  if (employeeId && session.created_by_employee_id && Number(employeeId) !== Number(session.created_by_employee_id)) {
    return res.status(403).json({ message: 'Chỉ có người tạo nhóm order này mới được quyền hủy!' });
  }

  const orders = db.prepare('SELECT id FROM orders WHERE session_id = ?').all(sessionId);
  orders.forEach(o => {
    db.prepare('DELETE FROM order_items WHERE order_id = ?').run(o.id);
  });
  // DELETE the session record completely from daily_order_sessions
  db.prepare("DELETE FROM daily_order_sessions WHERE id = ?").run(sessionId);

  res.json({ success: true, message: 'Đã hủy nhóm order và xóa phiên thành công!' });
});

// Reopen Session
router.post('/reopen', (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ message: 'sessionId là bắt buộc' });

  db.prepare("UPDATE daily_order_sessions SET status = 'OPEN' WHERE id = ?").run(sessionId);
  res.json({ success: true, message: 'Đã mở lại phiên order!' });
});

export default router;
