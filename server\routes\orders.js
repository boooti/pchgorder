const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { run, get, all } = require('../db');
const { isEmployeeEligibleForSession } = require('../sessionUtils');

// Helper to get active subsidy setting
async function getSubsidySetting() {
  const row = await get("SELECT value FROM settings WHERE key = 'subsidy'");
  if (row && row.value) {
    try { return JSON.parse(row.value); } catch (e) {}
  }
  return { enabled: true, amount_per_person: 20000 };
}

// POST create or update employee order
router.post('/', async (req, res) => {
  try {
    const { session_id, employee_id, items } = req.body;
    if (!session_id || !employee_id) {
      return res.status(400).json({ success: false, message: 'Thiếu mã phiên hoặc mã nhân viên' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng không được để trống' });
    }

    // 1. Strict Backend check: is session OPEN?
    const session = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [session_id]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Phiên order không tồn tại' });
    }
    if (session.status !== 'OPEN') {
      return res.status(403).json({
        success: false,
        message: 'ORDER ĐÃ ĐÓNG! Quản trị viên đã chốt đơn hôm nay, bạn không thể đặt hoặc sửa món.'
      });
    }

    // 2. Strict Backend check: is employee eligible for this session?
    const employee = await get('SELECT * FROM employees WHERE id = ?', [employee_id]);
    if (!employee || !employee.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản nhân viên không hợp lệ hoặc đã ngừng hoạt động.'
      });
    }

    if (!isEmployeeEligibleForSession(session, employee)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có tên trong danh sách nhóm này, không phải người tạo hoặc người bao nên không thể đặt món!'
      });
    }

    // Get store name snapshot
    const store = await get('SELECT name FROM stores WHERE id = ?', [session.store_id]);
    const storeNameSnapshot = store ? store.name : 'Quán nước';

    // 2. Calculate total & validate items
    let calculatedTotal = 0;
    const validatedItems = [];

    for (const it of items) {
      const qty = parseInt(it.quantity, 10) || 1;
      const unitPrice = parseFloat(it.unit_price) || 0;
      const toppingPrice = parseFloat(it.topping_price) || 0;
      const lineTotal = (unitPrice + toppingPrice) * qty;

      calculatedTotal += lineTotal;
      validatedItems.push({
        product_id: it.product_id || null,
        product_name: it.product_name || 'Món nước',
        size: it.size || 'M',
        unit_price: unitPrice,
        topping: it.topping || '',
        topping_price: toppingPrice,
        options: JSON.stringify({
          sugar: it.sugar !== undefined ? it.sugar : '100%',
          ice: it.ice !== undefined ? it.ice : 'Bình thường',
          note: it.note || ''
        }),
        quantity: qty,
        line_total: lineTotal
      });
    }

    // 3. Compute subsidy
    const subsidyCfg = await getSubsidySetting();
    let subsidyAmount = 0;
    if (subsidyCfg.enabled) {
      subsidyAmount = Math.min(calculatedTotal, subsidyCfg.amount_per_person || 20000);
    }
    const employeePaidAmount = Math.max(0, calculatedTotal - subsidyAmount);

    // 4. Check if employee already has an order in this session (replaces or updates to prevent duplicate orders)
    const existingOrder = await get(`
      SELECT * FROM orders WHERE session_id = ? AND employee_id = ? AND status != 'CANCELLED'
    `, [session_id, employee_id]);

    let orderId;
    if (existingOrder) {
      orderId = existingOrder.id;
      // Delete old order items and update header
      await run('DELETE FROM order_items WHERE order_id = ?', [orderId]);
      await run(`
        UPDATE orders
        SET total_amount = ?, subsidy_amount = ?, employee_paid_amount = ?, status = 'CONFIRMED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [calculatedTotal, subsidyAmount, employeePaidAmount, orderId]);
    } else {
      orderId = `ord-${crypto.randomUUID().slice(0, 8)}`;
      await run(`
        INSERT INTO orders (id, session_id, employee_id, total_amount, subsidy_amount, employee_paid_amount, status)
        VALUES (?, ?, ?, ?, ?, ?, 'CONFIRMED')
      `, [orderId, session_id, employee_id, calculatedTotal, subsidyAmount, employeePaidAmount]);
    }

    // 5. Insert immutable order items snapshots
    for (const vItem of validatedItems) {
      await run(`
        INSERT INTO order_items (
          id, order_id, product_id, quantity, store_name_snapshot, product_name_snapshot,
          size_snapshot, unit_price_snapshot, topping_snapshot, topping_price_snapshot,
          options_snapshot, item_total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        `oi-${crypto.randomUUID().slice(0, 8)}`,
        orderId,
        vItem.product_id,
        vItem.quantity,
        storeNameSnapshot,
        vItem.product_name,
        vItem.size,
        vItem.unit_price,
        vItem.topping,
        vItem.topping_price,
        vItem.options,
        vItem.line_total
      ]);
    }

    // Return complete order details
    const savedOrder = await get('SELECT * FROM orders WHERE id = ?', [orderId]);
    savedOrder.items = await all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    res.status(201).json({
      success: true,
      data: savedOrder,
      message: 'Đặt nước thành công!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET current order for an employee in a session
router.get('/my-order', async (req, res) => {
  try {
    const { sessionId, employeeId } = req.query;
    if (!sessionId || !employeeId) {
      return res.status(400).json({ success: false, message: 'Thiếu sessionId hoặc employeeId' });
    }

    const order = await get(`
      SELECT o.*, e.name as employee_name, e.department
      FROM orders o
      JOIN employees e ON o.employee_id = e.id
      WHERE o.session_id = ? AND o.employee_id = ? AND o.status != 'CANCELLED'
    `, [sessionId, employeeId]);

    if (!order) {
      return res.json({ success: true, data: null });
    }

    order.items = await all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET orders for a specific employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    const orders = await all(`
      SELECT o.*, s.name as store_name, s.logo as store_logo
      FROM orders o
      JOIN daily_order_sessions sess ON o.session_id = sess.id
      JOIN stores s ON sess.store_id = s.id
      WHERE o.employee_id = ? AND o.status != 'CANCELLED'
      ORDER BY o.created_at DESC
      LIMIT ?
    `, [employeeId, limit]);

    for (const ord of orders) {
      ord.items = await all('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
    }

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH toggle payment status of an order
router.patch('/:id/payment', async (req, res) => {
  try {
    const { is_paid } = req.body;
    const order = await get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

    const newPaidVal = (is_paid === 1 || is_paid === true || is_paid === '1') ? 1 : 0;
    await run('UPDATE orders SET is_paid = ? WHERE id = ?', [newPaidVal, req.params.id]);

    const updated = await get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json({
      success: true,
      data: updated,
      message: newPaidVal === 1 ? 'Đã đánh dấu ĐÃ THANH TOÁN' : 'Đã chuyển sang CHƯA THANH TOÁN'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE cancel an order
router.delete('/:id', async (req, res) => {
  try {
    const order = await get('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (!order) return res.status(404).json({ success: false, message: 'Đơn hàng không tồn tại' });

    // Check if session is OPEN
    const session = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [order.session_id]);
    if (session && session.status !== 'OPEN') {
      return res.status(403).json({ success: false, message: 'Phiên order đã chốt, không thể hủy đơn!' });
    }

    await run("UPDATE orders SET status = 'CANCELLED' WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'Đã hủy đơn hàng thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET Frequent drinks & Recent orders for 1-click Quick Re-order
router.get('/frequent/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.query;
    const currentStoreId = req.query.storeId;

    // 1. Recent items ordered by this employee
    const recentItems = await all(`
      SELECT oi.*, o.session_id, o.created_at as ordered_at,
             p.is_available as current_is_available, p.store_id as current_store_id
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.employee_id = ? AND o.status != 'CANCELLED'
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [employeeId]);

    // 2. Favorite item (most frequently ordered)
    const favoriteStats = await get(`
      SELECT oi.product_name_snapshot, COUNT(*) as order_count
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.employee_id = ? AND o.status != 'CANCELLED'
      GROUP BY oi.product_name_snapshot
      ORDER BY order_count DESC
      LIMIT 1
    `, [employeeId]);

    // Check availability & get current price for re-order
    for (const it of recentItems) {
      if (it.product_id) {
        const currentProd = await get('SELECT * FROM products WHERE id = ?', [it.product_id]);
        if (currentProd) {
          it.current_available = currentProd.is_available === 1;
          it.is_same_store = currentStoreId ? currentProd.store_id === currentStoreId : true;

          // Get current size price
          const currentSize = await get('SELECT price FROM product_sizes WHERE product_id = ? AND size_name = ?', [
            it.product_id, it.size_snapshot
          ]);
          it.current_unit_price = currentSize ? currentSize.price : it.unit_price_snapshot;
        } else {
          it.current_available = false;
        }
      } else {
        it.current_available = false;
      }
    }

    res.json({
      success: true,
      data: {
        recent_items: recentItems,
        favorite: favoriteStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
