const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { run, get, all } = require('../db');
const { isEmployeeEligibleForSession } = require('../sessionUtils');

// GET all active or today's sessions
router.get('/active', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { employee_id, all_sessions } = req.query;
    const isAdmin = all_sessions === '1' || all_sessions === 'true';

    const sessions = await all(`
      SELECT s.*, st.name as store_name, st.logo as store_logo,
             e.name as creator_name, e.department as creator_department,
             (SELECT COUNT(*) FROM orders o WHERE o.session_id = s.id AND o.status != 'CANCELLED') as order_count,
             (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o WHERE o.session_id = s.id AND o.status != 'CANCELLED') as total_amount,
             (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.session_id = s.id AND o.status != 'CANCELLED') as total_cups
      FROM daily_order_sessions s
      JOIN stores st ON s.store_id = st.id
      LEFT JOIN employees e ON s.created_by_employee_id = e.id
      WHERE s.session_date = ? OR s.status = 'OPEN'
      ORDER BY CASE WHEN s.status = 'OPEN' THEN 0 ELSE 1 END, s.created_at DESC
    `, [today]);

    if (isAdmin) {
      return res.json({ success: true, data: sessions });
    }

    let employee = null;
    if (employee_id) {
      employee = await get('SELECT * FROM employees WHERE id = ?', [employee_id]);
    }

    // Filter sessions to only those the employee is related to (ALL, creator, sponsor, department, custom)
    const visibleSessions = sessions.filter((s) => isEmployeeEligibleForSession(s, employee));
    res.json({ success: true, data: visibleSessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET today's active session (or specific sessionId)
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { sessionId, employee_id, all_sessions } = req.query;
    const isAdmin = all_sessions === '1' || all_sessions === 'true';

    let employee = null;
    if (employee_id) {
      employee = await get('SELECT * FROM employees WHERE id = ?', [employee_id]);
    }

    let session = null;
    if (sessionId) {
      session = await get(`
        SELECT s.*, st.name as store_name, st.logo as store_logo, st.cover_image as store_cover,
               st.address as store_address, st.phone as store_phone,
               e.name as creator_name, e.department as creator_department
        FROM daily_order_sessions s
        JOIN stores st ON s.store_id = st.id
        LEFT JOIN employees e ON s.created_by_employee_id = e.id
        WHERE s.id = ?
      `, [sessionId]);

      // If user specified sessionId but is not eligible and not admin
      if (session && !isAdmin && !isEmployeeEligibleForSession(session, employee)) {
        return res.status(403).json({
          success: false,
          not_eligible: true,
          message: 'Bạn không có tên trong nhóm này và không liên quan đến đợt order này.'
        });
      }
    }

    if (!session) {
      // Find candidate OPEN sessions for today that the user is eligible for
      const openSessions = await all(`
        SELECT s.*, st.name as store_name, st.logo as store_logo, st.cover_image as store_cover,
               st.address as store_address, st.phone as store_phone,
               e.name as creator_name, e.department as creator_department
        FROM daily_order_sessions s
        JOIN stores st ON s.store_id = st.id
        LEFT JOIN employees e ON s.created_by_employee_id = e.id
        WHERE s.session_date = ? AND s.status = 'OPEN'
        ORDER BY s.created_at DESC
      `, [today]);

      if (isAdmin) {
        session = openSessions[0] || null;
      } else {
        session = openSessions.find((s) => isEmployeeEligibleForSession(s, employee)) || null;
      }
    }

    // If no OPEN session today, check if there's any candidate session today (even CLOSED)
    if (!session) {
      const allTodaySessions = await all(`
        SELECT s.*, st.name as store_name, st.logo as store_logo, st.cover_image as store_cover,
               st.address as store_address, st.phone as store_phone,
               e.name as creator_name, e.department as creator_department
        FROM daily_order_sessions s
        JOIN stores st ON s.store_id = st.id
        LEFT JOIN employees e ON s.created_by_employee_id = e.id
        WHERE s.session_date = ?
        ORDER BY s.created_at DESC
      `, [today]);

      if (isAdmin) {
        session = allTodaySessions[0] || null;
      } else {
        session = allTodaySessions.find((s) => isEmployeeEligibleForSession(s, employee)) || null;
      }
    }

    if (!session) {
      return res.json({ success: true, data: null, message: 'Hôm nay chưa mở quán nào để order' });
    }

    // Attach store menu files
    const menu_files = await all('SELECT * FROM store_menu_files WHERE store_id = ? ORDER BY page_order ASC', [session.store_id]);
    const categories = await all('SELECT * FROM categories WHERE store_id = ? ORDER BY display_order ASC', [session.store_id]);
    const toppings = await all('SELECT * FROM product_toppings WHERE store_id = ? ORDER BY price ASC', [session.store_id]);
    const products = await all('SELECT * FROM products WHERE store_id = ? ORDER BY created_at ASC', [session.store_id]);
    for (const p of products) {
      p.sizes = await all('SELECT * FROM product_sizes WHERE product_id = ? ORDER BY price ASC', [p.id]);
    }

    // Attach order summary count
    const stats = await get(`
      SELECT COUNT(*) as total_orders,
             COALESCE(SUM(total_amount), 0) as total_amount,
             COALESCE(SUM(subsidy_amount), 0) as total_subsidy,
             COALESCE(SUM(employee_paid_amount), 0) as total_employee_paid
      FROM orders
      WHERE session_id = ? AND status != 'CANCELLED'
    `, [session.id]);

    const cupsRow = await get(`
      SELECT COALESCE(SUM(oi.quantity), 0) as total_cups
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.session_id = ? AND o.status != 'CANCELLED'
    `, [session.id]);

    session.menu_files = menu_files;
    session.categories = categories;
    session.toppings = toppings;
    session.products = products;
    session.total_orders = stats.total_orders;
    session.total_cups = cupsRow.total_cups;
    session.total_amount = stats.total_amount;
    session.total_subsidy = stats.total_subsidy;
    session.total_employee_paid = stats.total_employee_paid;

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET all sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await all(`
      SELECT s.*, st.name as store_name, st.logo as store_logo,
        (SELECT COUNT(*) FROM orders o WHERE o.session_id = s.id AND o.status != 'CANCELLED') as order_count,
        (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o WHERE o.session_id = s.id AND o.status != 'CANCELLED') as total_amount,
        (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE o.session_id = s.id AND o.status != 'CANCELLED') as total_cups
      FROM daily_order_sessions s
      JOIN stores st ON s.store_id = st.id
      ORDER BY s.session_date DESC, s.created_at DESC
    `);
    res.json({ success: true, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single session
router.get('/:id', async (req, res) => {
  try {
    const { employee_id, all_sessions } = req.query;
    const isAdmin = all_sessions === '1' || all_sessions === 'true';

    const session = await get(`
      SELECT s.*, st.name as store_name, st.logo as store_logo, st.cover_image as store_cover,
             st.address as store_address, st.phone as store_phone
      FROM daily_order_sessions s
      JOIN stores st ON s.store_id = st.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (!session) return res.status(404).json({ success: false, message: 'Phiên order không tồn tại' });

    if (!isAdmin && employee_id) {
      const employee = await get('SELECT * FROM employees WHERE id = ?', [employee_id]);
      if (!isEmployeeEligibleForSession(session, employee)) {
        return res.status(403).json({
          success: false,
          not_eligible: true,
          message: 'Bạn không có tên trong nhóm này và không thể xem phiên order này.'
        });
      }
    }

    session.menu_files = await all('SELECT * FROM store_menu_files WHERE store_id = ? ORDER BY page_order ASC', [session.store_id]);
    session.categories = await all('SELECT * FROM categories WHERE store_id = ? ORDER BY display_order ASC', [session.store_id]);
    session.toppings = await all('SELECT * FROM product_toppings WHERE store_id = ? ORDER BY price ASC', [session.store_id]);
    const products = await all('SELECT * FROM products WHERE store_id = ? ORDER BY created_at ASC', [session.store_id]);
    for (const p of products) {
      p.sizes = await all('SELECT * FROM product_sizes WHERE product_id = ? ORDER BY price ASC', [p.id]);
    }
    session.products = products;

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create DailyOrderSession (Admin)
router.post('/', async (req, res) => {
  try {
    const {
      store_id, session_date, close_time, notes, delivery_info,
      sponsor_type, sponsor_name, title, scope_type,
      eligible_departments, eligible_employee_ids, created_by_employee_id
    } = req.body;
    if (!store_id) return res.status(400).json({ success: false, message: 'Quán là bắt buộc' });

    const store = await get('SELECT * FROM stores WHERE id = ?', [store_id]);
    if (!store) return res.status(404).json({ success: false, message: 'Quán không tồn tại' });

    const defaultProfile = await get('SELECT * FROM delivery_profiles WHERE store_id = ?', [store_id]) || {};

    const targetDate = session_date || new Date().toISOString().split('T')[0];
    const nowHour = new Date().getHours();
    const nowMin = new Date().getMinutes();
    const openTime = `${String(nowHour).padStart(2, '0')}:${String(nowMin).padStart(2, '0')}`;
    const closeTime = close_time || '10:30';

    // Auto-fill delivery snapshot from passed delivery_info OR store default
    const dInfo = delivery_info || {};
    const recipientName = dInfo.recipient_name || defaultProfile.recipient_name || 'Văn phòng';
    const recipientPhone = dInfo.recipient_phone || defaultProfile.recipient_phone || '';
    const deliveryAddress = dInfo.delivery_address || defaultProfile.delivery_address || '';
    const deliveryTime = dInfo.desired_delivery_time || defaultProfile.desired_delivery_time || '11:15';
    const deliveryNote = dInfo.delivery_notes || defaultProfile.delivery_notes || '';

    const spType = sponsor_type || 'SELF';
    const spName = spType === 'SPONSOR' ? (sponsor_name || 'Người bao tài trợ') : 'Tự trả tiền (Campuchia)';
    const sessionScope = scope_type || 'ALL';
    const sessionTitle = title ? title.trim() : `Phiên ${store.name}`;

    // Auto close previous company-wide sessions only if creating an ALL session
    if (sessionScope === 'ALL') {
      await run("UPDATE daily_order_sessions SET status = 'CLOSED' WHERE session_date = ? AND status = 'OPEN' AND (scope_type = 'ALL' OR scope_type IS NULL)", [targetDate]);
    }

    const sessionId = `session-${crypto.randomUUID().slice(0, 8)}`;
    await run(`
      INSERT INTO daily_order_sessions (
        id, session_date, store_id, status, open_time, close_time, notes,
        recipient_name_snapshot, recipient_phone_snapshot, delivery_address_snapshot,
        delivery_time_snapshot, delivery_note_snapshot, sponsor_type, sponsor_name,
        title, created_by_employee_id, scope_type, eligible_departments, eligible_employee_ids
      ) VALUES (?, ?, ?, 'OPEN', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionId,
      targetDate,
      store_id,
      openTime,
      closeTime,
      notes || `Phiên order ${store.name} ngày ${targetDate}`,
      recipientName,
      recipientPhone,
      deliveryAddress,
      deliveryTime,
      deliveryNote,
      spType,
      spName,
      sessionTitle,
      created_by_employee_id || null,
      sessionScope,
      eligible_departments ? JSON.stringify(eligible_departments) : null,
      eligible_employee_ids ? JSON.stringify(eligible_employee_ids) : null
    ]);

    const created = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [sessionId]);
    res.status(201).json({
      success: true,
      data: created,
      message: `Đã mở thành công phiên order hôm nay cho ${store.name}!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create Group Order Session (Self-Service by any Employee)
router.post('/group', async (req, res) => {
  try {
    const {
      title,
      store_id,
      created_by_employee_id,
      scope_type, // 'ALL' | 'DEPARTMENT' | 'CUSTOM'
      eligible_departments, // array of strings
      eligible_employee_ids, // array of strings
      close_time,
      notes,
      sponsor_type,
      sponsor_name,
      delivery_info
    } = req.body;

    if (!store_id) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn quán nước' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Vui lòng đặt tên cho đợt order nhóm' });
    }

    const store = await get('SELECT * FROM stores WHERE id = ?', [store_id]);
    if (!store) return res.status(404).json({ success: false, message: 'Quán nước không tồn tại' });

    const defaultProfile = await get('SELECT * FROM delivery_profiles WHERE store_id = ?', [store_id]) || {};

    const today = new Date().toISOString().split('T')[0];
    const nowHour = new Date().getHours();
    const nowMin = new Date().getMinutes();
    const openTime = `${String(nowHour).padStart(2, '0')}:${String(nowMin).padStart(2, '0')}`;
    const closeTime = close_time || '11:30';

    const dInfo = delivery_info || {};
    const recipientName = dInfo.recipient_name || defaultProfile.recipient_name || 'Văn phòng';
    const recipientPhone = dInfo.recipient_phone || defaultProfile.recipient_phone || '';
    const deliveryAddress = dInfo.delivery_address || defaultProfile.delivery_address || 'Văn phòng Công ty';
    const deliveryTime = dInfo.desired_delivery_time || closeTime;
    const deliveryNote = dInfo.delivery_notes || defaultProfile.delivery_notes || '';

    const spType = sponsor_type || 'SELF';
    const spName = spType === 'SPONSOR' ? (sponsor_name || 'Người bao tài trợ') : null;

    const sessionId = `session-grp-${crypto.randomUUID().slice(0, 8)}`;

    await run(`
      INSERT INTO daily_order_sessions (
        id, session_date, store_id, status, open_time, close_time, notes,
        recipient_name_snapshot, recipient_phone_snapshot, delivery_address_snapshot,
        delivery_time_snapshot, delivery_note_snapshot, sponsor_type, sponsor_name,
        title, created_by_employee_id, scope_type, eligible_departments, eligible_employee_ids
      ) VALUES (?, ?, ?, 'OPEN', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sessionId,
      today,
      store_id,
      openTime,
      closeTime,
      notes || `Đợt order: ${title.trim()}`,
      recipientName,
      recipientPhone,
      deliveryAddress,
      deliveryTime,
      deliveryNote,
      spType,
      spName,
      title.trim(),
      created_by_employee_id || null,
      scope_type || 'ALL',
      eligible_departments ? JSON.stringify(eligible_departments) : null,
      eligible_employee_ids ? JSON.stringify(eligible_employee_ids) : null
    ]);

    const created = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [sessionId]);
    res.status(201).json({
      success: true,
      data: created,
      message: `Đã tạo thành công đợt order "${title.trim()}"!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH close session
router.patch('/:id/close', async (req, res) => {
  try {
    const session = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [req.params.id]);
    if (!session) return res.status(404).json({ success: false, message: 'Phiên order không tồn tại' });

    await run("UPDATE daily_order_sessions SET status = 'CLOSED' WHERE id = ?", [req.params.id]);
    const updated = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [req.params.id]);

    res.json({ success: true, data: updated, message: 'Đã chốt đơn thành công! Nhân viên không thể đặt thêm hoặc sửa món.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH reopen session
router.patch('/:id/reopen', async (req, res) => {
  try {
    const session = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [req.params.id]);
    if (!session) return res.status(404).json({ success: false, message: 'Phiên order không tồn tại' });

    await run("UPDATE daily_order_sessions SET status = 'OPEN' WHERE id = ?", [req.params.id]);
    const updated = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [req.params.id]);

    res.json({ success: true, data: updated, message: 'Đã mở lại phiên order. Nhân viên có thể tiếp tục đặt món.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update session's today delivery snapshot
router.put('/:id/delivery-info', async (req, res) => {
  try {
    const { recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note } = req.body;
    await run(`
      UPDATE daily_order_sessions
      SET recipient_name_snapshot = ?, recipient_phone_snapshot = ?,
          delivery_address_snapshot = ?, delivery_time_snapshot = ?, delivery_note_snapshot = ?
      WHERE id = ?
    `, [recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note, req.params.id]);

    const updated = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated, message: 'Đã cập nhật thông tin giao hàng cho phiên hôm nay' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH update sponsor info on session
router.patch('/:id/sponsor', async (req, res) => {
  try {
    const { sponsor_type, sponsor_name } = req.body;
    const spType = sponsor_type || 'SELF';
    const spName = spType === 'SPONSOR' ? (sponsor_name || 'Người bao tài trợ') : 'Tự trả tiền (Campuchia)';

    await run(`
      UPDATE daily_order_sessions
      SET sponsor_type = ?, sponsor_name = ?
      WHERE id = ?
    `, [spType, spName, req.params.id]);

    const updated = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated, message: 'Đã cập nhật hình thức thanh toán cho phiên hôm nay' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update full session settings (close_time, title, delivery, sponsor, notes)
router.put('/:id/settings', async (req, res) => {
  try {
    const session = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [req.params.id]);
    if (!session) return res.status(404).json({ success: false, message: 'Phiên order không tồn tại' });

    const {
      title,
      close_time,
      notes,
      recipient_name,
      recipient_phone,
      delivery_address,
      delivery_time,
      delivery_note,
      sponsor_type,
      sponsor_name
    } = req.body;

    const newTitle = title !== undefined ? title.trim() : session.title;
    const newCloseTime = close_time !== undefined ? close_time : session.close_time;
    const newNotes = notes !== undefined ? notes : session.notes;
    const newRecName = recipient_name !== undefined ? recipient_name : session.recipient_name_snapshot;
    const newRecPhone = recipient_phone !== undefined ? recipient_phone : session.recipient_phone_snapshot;
    const newAddress = delivery_address !== undefined ? delivery_address : session.delivery_address_snapshot;
    const newDelTime = delivery_time !== undefined ? delivery_time : session.delivery_time_snapshot;
    const newDelNote = delivery_note !== undefined ? delivery_note : session.delivery_note_snapshot;
    const newSpType = sponsor_type !== undefined ? sponsor_type : session.sponsor_type;
    const newSpName = sponsor_name !== undefined ? sponsor_name : session.sponsor_name;

    await run(`
      UPDATE daily_order_sessions
      SET title = ?, close_time = ?, notes = ?,
          recipient_name_snapshot = ?, recipient_phone_snapshot = ?,
          delivery_address_snapshot = ?, delivery_time_snapshot = ?, delivery_note_snapshot = ?,
          sponsor_type = ?, sponsor_name = ?
      WHERE id = ?
    `, [
      newTitle, newCloseTime, newNotes,
      newRecName, newRecPhone, newAddress, newDelTime, newDelNote,
      newSpType, newSpName, req.params.id
    ]);

    const updated = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated, message: 'Đã cập nhật thông tin đợt order thành công!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE session (for admin and group creator)
router.delete('/:id', async (req, res) => {
  try {
    const session = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [req.params.id]);
    if (!session) return res.status(404).json({ success: false, message: 'Phiên order không tồn tại' });

    // Clean up order items and orders
    await run(`
      DELETE FROM order_items
      WHERE order_id IN (SELECT id FROM orders WHERE session_id = ?)
    `, [req.params.id]);

    await run('DELETE FROM orders WHERE session_id = ?', [req.params.id]);
    await run('DELETE FROM daily_order_sessions WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: `Đã xóa thành công phiên order "${session.title || 'Đợt order'}"!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
