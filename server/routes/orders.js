import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get today's order dashboard (Ordered vs Not Ordered)
router.get('/today', (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) return res.status(400).json({ message: 'sessionId là bắt buộc' });

  const session = db.prepare(`
    SELECT s.*, st.name as store_name, st.logo as store_logo, st.phone as store_phone
    FROM daily_order_sessions s
    JOIN stores st ON s.store_id = st.id
    WHERE s.id = ?
  `).get(sessionId);
  if (!session) return res.status(404).json({ message: 'Không tìm thấy phiên order!' });

  // 1. Ordered list
  const orders = db.prepare(`
    SELECT o.*, e.name as employee_name, e.code as employee_code, e.department as employee_department
    FROM orders o
    JOIN employees e ON o.employee_id = e.id
    WHERE o.session_id = ?
    ORDER BY o.created_at DESC
  `).all(sessionId);

  const orderedList = orders.map(order => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    const parsedItems = items.map(item => ({
      ...item,
      toppings: item.toppings_snapshot_json ? JSON.parse(item.toppings_snapshot_json) : []
    }));

    return {
      ...order,
      items: parsedItems
    };
  });

  // 2. Not ordered list (filtered by group's allowed_employees_json if present)
  const orderedEmpIds = orders.map(o => o.employee_id);
  let allowedEmpIds = null;
  if (session.allowed_employees_json) {
    try { allowedEmpIds = JSON.parse(session.allowed_employees_json); } catch(e){}
  }

  let notOrderedQuery = 'SELECT * FROM employees WHERE is_active = 1';
  if (Array.isArray(allowedEmpIds) && allowedEmpIds.length > 0) {
    notOrderedQuery += ` AND id IN (${allowedEmpIds.join(',')})`;
  }
  if (orderedEmpIds.length > 0) {
    notOrderedQuery += ` AND id NOT IN (${orderedEmpIds.join(',')})`;
  }
  notOrderedQuery += ' ORDER BY department ASC, name ASC';
  const notOrderedList = db.prepare(notOrderedQuery).all();

  // Summary stats
  const totalEmployees = db.prepare('SELECT COUNT(*) as count FROM employees WHERE is_active = 1').get()?.count || 0;
  const totalAllowed = Array.isArray(allowedEmpIds) && allowedEmpIds.length > 0 ? allowedEmpIds.length : totalEmployees;
  const orderedCount = orderedList.length;
  const notOrderedCount = notOrderedList.length;

  const totalCups = orderedList.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);
  const totalAmount = orderedList.reduce((sum, o) => sum + o.total_amount, 0);
  const totalSubsidy = orderedList.reduce((sum, o) => sum + o.subsidy_amount, 0);
  const totalEmployeePay = orderedList.reduce((sum, o) => sum + o.employee_pay_amount, 0);

  res.json({
    session,
    stats: {
      totalEmployees,
      totalAllowed,
      orderedCount,
      notOrderedCount,
      totalCups,
      totalAmount,
      totalSubsidy,
      totalEmployeePay
    },
    orderedList,
    notOrderedList
  });
});

// Get My Today Order
router.get('/my-today', (req, res) => {
  const { sessionId, employeeId } = req.query;
  if (!sessionId || !employeeId) {
    return res.status(400).json({ message: 'sessionId và employeeId là bắt buộc' });
  }

  const order = db.prepare('SELECT * FROM orders WHERE session_id = ? AND employee_id = ?').get(sessionId, employeeId);
  if (!order) return res.json({ hasOrder: false });

  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  const parsedItems = items.map(item => ({
    ...item,
    toppings: item.toppings_snapshot_json ? JSON.parse(item.toppings_snapshot_json) : []
  }));

  res.json({
    hasOrder: true,
    order: {
      ...order,
      items: parsedItems
    }
  });
});

// Get Recent / Favorite Drinks for Employee Re-order
router.get('/recent', (req, res) => {
  const { employeeId, storeId } = req.query;
  if (!employeeId) return res.status(400).json({ message: 'employeeId là bắt buộc' });

  // Find recent order items by employee
  const recentItems = db.prepare(`
    SELECT oi.*, p.is_available as current_is_available, p.image as current_image, p.id as current_product_id
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN daily_order_sessions s ON o.session_id = s.id
    LEFT JOIN products p ON (p.name = oi.product_name_snapshot AND p.store_id = s.store_id)
    WHERE o.employee_id = ? ${storeId ? 'AND s.store_id = ?' : ''}
    ORDER BY o.created_at DESC
    LIMIT 10
  `).all(...(storeId ? [employeeId, storeId] : [employeeId]));

  const parsed = recentItems.map(item => {
    let currentPrice = item.unit_price_snapshot;
    if (item.current_product_id) {
      const liveSize = db.prepare('SELECT price FROM product_sizes WHERE product_id = ? AND size_name = ?').get(item.current_product_id, item.size_snapshot);
      if (liveSize) currentPrice = liveSize.price;
    }

    return {
      ...item,
      current_unit_price: currentPrice,
      toppings: item.toppings_snapshot_json ? JSON.parse(item.toppings_snapshot_json) : []
    };
  });

  res.json(parsed);
});

// Create / Submit Employee Order (supports Order Giùm)
router.post('/', (req, res) => {
  const { sessionId, employeeId, orderedByEmployeeId, orderedByName, items, note } = req.body;

  if (!sessionId || !employeeId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Thông tin đặt hàng không hợp lệ!' });
  }

  // 1. Verify session status
  const session = db.prepare('SELECT * FROM daily_order_sessions WHERE id = ?').get(sessionId);
  if (!session) return res.status(404).json({ message: 'Phiên order không tồn tại!' });

  if (session.status === 'CLOSED') {
    return res.status(400).json({ message: 'Rất tiếc! Phiên order hôm nay đã chốt đơn. Không thể đặt hàng.' });
  }

  // Check cutoff time
  if (session.cutoff_time) {
    const now = new Date();
    const [cHours, cMins] = session.cutoff_time.split(':').map(Number);
    const cutoffDate = new Date();
    cutoffDate.setHours(cHours, cMins, 0, 0);
    if (now > cutoffDate) {
      return res.status(400).json({ message: `Đã quá giờ chốt order (${session.cutoff_time}). Vui lòng liên hệ Admin.` });
    }
  }

  // 2. Check existing order for target employee
  const existingOrder = db.prepare('SELECT * FROM orders WHERE session_id = ? AND employee_id = ?').get(sessionId, employeeId);
  
  const targetEmp = db.prepare('SELECT name FROM employees WHERE id = ?').get(employeeId);
  const targetEmpName = targetEmp ? targetEmp.name : 'đồng nghiệp';

  const submitterEmpId = orderedByEmployeeId || employeeId;
  let submitterName = orderedByName || '';
  if (!submitterName && submitterEmpId) {
    const sEmp = db.prepare('SELECT name FROM employees WHERE id = ?').get(submitterEmpId);
    if (sEmp) submitterName = sEmp.name;
  }

  if (existingOrder) {
    // Delete old order items and update existing order
    db.prepare('DELETE FROM order_items WHERE order_id = ?').run(existingOrder.id);
  }

  // 3. Calculate totals and build snapshots
  let grandTotal = 0;
  const processedItems = [];

  for (const item of items) {
    if (item.product_id) {
      const prod = db.prepare('SELECT is_available, name FROM products WHERE id = ?').get(item.product_id);
      if (prod && !prod.is_available) {
        return res.status(400).json({ message: `Món "${prod.name}" hiện tại đã HẾT MÓN!` });
      }
    }

    const unitPrice = Number(item.unit_price || item.unit_price_snapshot || 0);
    const toppings = Array.isArray(item.toppings) ? item.toppings : [];
    const toppingTotal = toppings.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    const qty = Number(item.quantity) || 1;
    const itemSubtotal = (unitPrice + toppingTotal) * qty;

    grandTotal += itemSubtotal;

    processedItems.push({
      productId: item.product_id || null,
      productName: item.product_name || item.product_name_snapshot || 'Món nước',
      size: item.size || item.size_snapshot || 'M',
      unitPrice,
      sugar: item.sugar_option || item.sugar || '100%',
      ice: item.ice_option || item.ice || 'Bình thường',
      toppingsJson: JSON.stringify(toppings),
      toppingPrice: toppingTotal,
      quantity: qty,
      subtotal: itemSubtotal,
      itemNote: item.note || ''
    });
  }

  // 4. Calculate subsidy & employee pay based on session.sponsor_mode
  let subsidyAmount = 0;
  let employeePayAmount = grandTotal;

  if (session.sponsor_mode === 'SPONSOR_100') {
    // 👑 100% Sponsored (Sếp/Người đó bao 100%, employee pays 0đ)
    subsidyAmount = grandTotal;
    employeePayAmount = 0;
  } else if (session.sponsor_mode === 'PARTIAL') {
    // 🤝 Partial sponsorship per cup
    const sponsorPerCup = Number(session.sponsor_amount || 15000);
    const totalCupsCount = processedItems.reduce((s, i) => s + i.quantity, 0);
    const maxPartial = totalCupsCount * sponsorPerCup;
    subsidyAmount = Math.min(grandTotal, maxPartial);
    employeePayAmount = Math.max(0, grandTotal - subsidyAmount);
  } else if (session.sponsor_mode === 'SHARE') {
    // 💸 Share / Self pay (0đ subsidy)
    subsidyAmount = 0;
    employeePayAmount = grandTotal;
  } else {
    // 🏢 Standard Company Subsidy (20k/person)
    const subsidyEnabledSetting = db.prepare("SELECT value FROM settings WHERE key = 'subsidy_enabled'").get();
    const subsidyAmountSetting = db.prepare("SELECT value FROM settings WHERE key = 'subsidy_amount_per_person'").get();
    const isSubsidyEnabled = subsidyEnabledSetting ? subsidyEnabledSetting.value === '1' : true;
    const maxSubsidy = isSubsidyEnabled ? Number(subsidyAmountSetting ? subsidyAmountSetting.value : 20000) : 0;

    subsidyAmount = Math.min(grandTotal, maxSubsidy);
    employeePayAmount = Math.max(0, grandTotal - subsidyAmount);
  }

  // Build combined note if ordered on behalf
  let finalNote = note || '';
  if (submitterEmpId && Number(submitterEmpId) !== Number(employeeId) && submitterName) {
    finalNote = finalNote ? `${finalNote} (Đặt giùm bởi ${submitterName})` : `(Đặt giùm bởi ${submitterName})`;
  }

  let orderId;
  if (existingOrder) {
    orderId = existingOrder.id;
    db.prepare(`
      UPDATE orders
      SET total_amount = ?, subsidy_amount = ?, employee_pay_amount = ?, note = ?, ordered_by_employee_id = ?, ordered_by_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(grandTotal, subsidyAmount, employeePayAmount, finalNote, submitterEmpId, submitterName, orderId);
  } else {
    const oRes = db.prepare(`
      INSERT INTO orders (session_id, employee_id, ordered_by_employee_id, ordered_by_name, total_amount, subsidy_amount, employee_pay_amount, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(sessionId, employeeId, submitterEmpId, submitterName, grandTotal, subsidyAmount, employeePayAmount, finalNote);
    orderId = oRes.lastInsertRowid;
  }

  // Insert Order Items
  for (const pi of processedItems) {
    db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name_snapshot, size_snapshot, unit_price_snapshot, sugar_option, ice_option, toppings_snapshot_json, topping_price_snapshot, quantity, subtotal, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      orderId,
      pi.productId,
      pi.productName,
      pi.size,
      pi.unitPrice,
      pi.sugar,
      pi.ice,
      pi.toppingsJson,
      pi.toppingPrice,
      pi.quantity,
      pi.subtotal,
      pi.itemNote
    );
  }

  const finalOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
  finalOrder.items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

  const isOrderGium = Number(submitterEmpId) !== Number(employeeId);
  const msg = isOrderGium
    ? `🎉 Đã đặt giùm & khóa đơn nước thành công cho ${targetEmpName}!`
    : (existingOrder ? 'Cập nhật đơn hàng thành công!' : 'Đặt nước thành công! Cảm ơn bạn.');

  res.json({
    success: true,
    message: msg,
    order: finalOrder
  });
});

// Delete order
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const order = db.prepare('SELECT session_id FROM orders WHERE id = ?').get(id);
  if (order) {
    const session = db.prepare('SELECT status FROM daily_order_sessions WHERE id = ?').get(order.session_id);
    if (session && session.status === 'CLOSED') {
      return res.status(400).json({ message: 'Phiên order đã chốt! Không thể hủy đơn.' });
    }
  }

  db.prepare('DELETE FROM orders WHERE id = ?').run(id);
  res.json({ success: true, message: 'Đã xóa đơn hàng thành công!' });
});

export default router;
