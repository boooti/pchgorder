const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// GET admin / host dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { sessionId } = req.query;

    let session;
    if (sessionId) {
      session = await get(`
        SELECT s.*, st.name as store_name, st.logo as store_logo
        FROM daily_order_sessions s
        JOIN stores st ON s.store_id = st.id
        WHERE s.id = ?
      `, [sessionId]);
    } else {
      session = await get(`
        SELECT s.*, st.name as store_name, st.logo as store_logo
        FROM daily_order_sessions s
        JOIN stores st ON s.store_id = st.id
        WHERE s.session_date = ?
        ORDER BY s.created_at DESC
        LIMIT 1
      `, [today]);
    }

    // Active employees count
    const activeEmpRow = await get('SELECT COUNT(*) as count FROM employees WHERE is_active = 1');
    const totalActiveEmployees = activeEmpRow ? activeEmpRow.count : 0;

    let orderedCount = 0;
    let totalCups = 0;
    let totalAmount = 0;
    let totalSubsidy = 0;
    let totalEmployeePaid = 0;
    let paidOrdersCount = 0;
    let unpaidOrdersCount = 0;
    let orderedEmployees = [];
    let unOrderedEmployees = [];
    let aggregatedItems = [];

    if (session) {
      const stats = await get(`
        SELECT COUNT(*) as order_count,
               COALESCE(SUM(total_amount), 0) as total_amount,
               COALESCE(SUM(subsidy_amount), 0) as total_subsidy,
               COALESCE(SUM(employee_paid_amount), 0) as total_employee_paid,
               SUM(CASE WHEN is_paid = 1 THEN 1 ELSE 0 END) as paid_count,
               SUM(CASE WHEN is_paid = 0 OR is_paid IS NULL THEN 1 ELSE 0 END) as unpaid_count
        FROM orders
        WHERE session_id = ? AND status != 'CANCELLED'
      `, [session.id]);

      const cupsRow = await get(`
        SELECT COALESCE(SUM(oi.quantity), 0) as total_cups
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.session_id = ? AND o.status != 'CANCELLED'
      `, [session.id]);

      orderedCount = stats.order_count || 0;
      totalCups = cupsRow.total_cups || 0;
      totalAmount = stats.total_amount || 0;
      totalSubsidy = stats.total_subsidy || 0;
      totalEmployeePaid = stats.total_employee_paid || 0;
      paidOrdersCount = stats.paid_count || 0;
      unpaidOrdersCount = stats.unpaid_count || 0;

      // Ordered list
      orderedEmployees = await all(`
        SELECT o.id as order_id, o.total_amount, o.subsidy_amount, o.employee_paid_amount,
               o.is_paid, o.status, o.created_at,
               e.id as employee_id, e.name as employee_name, e.department, e.phone,
               (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count,
               (SELECT COALESCE(SUM(quantity), 0) FROM order_items oi WHERE oi.order_id = o.id) as cups_count
        FROM orders o
        JOIN employees e ON o.employee_id = e.id
        WHERE o.session_id = ? AND o.status != 'CANCELLED'
        ORDER BY o.created_at DESC
      `, [session.id]);

      for (const oe of orderedEmployees) {
        oe.items = await all('SELECT * FROM order_items WHERE order_id = ?', [oe.order_id]);
      }

      // Un-ordered list filtered by scope
      let unOrderQuery = 'SELECT * FROM employees WHERE is_active = 1';
      let unOrderParams = [];

      if (session.scope_type === 'DEPARTMENT' && session.eligible_departments) {
        try {
          const depts = JSON.parse(session.eligible_departments);
          if (Array.isArray(depts) && depts.length > 0) {
            unOrderQuery += ` AND department IN (${depts.map(() => '?').join(',')})`;
            unOrderParams.push(...depts);
          }
        } catch (e) {}
      } else if (session.scope_type === 'CUSTOM' && session.eligible_employee_ids) {
        try {
          const empIds = JSON.parse(session.eligible_employee_ids);
          if (Array.isArray(empIds) && empIds.length > 0) {
            unOrderQuery += ` AND id IN (${empIds.map(() => '?').join(',')})`;
            unOrderParams.push(...empIds);
          }
        } catch (e) {}
      }

      unOrderQuery += ` AND id NOT IN (
        SELECT employee_id FROM orders WHERE session_id = ? AND status != 'CANCELLED'
      ) ORDER BY name COLLATE NOCASE ASC`;
      unOrderParams.push(session.id);

      unOrderedEmployees = await all(unOrderQuery, unOrderParams);

      // Aggregated items synthesis
      const allItems = await all(`
        SELECT oi.*, e.name as employee_name
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        JOIN employees e ON o.employee_id = e.id
        WHERE o.session_id = ? AND o.status != 'CANCELLED'
        ORDER BY oi.product_name_snapshot ASC
      `, [session.id]);

      const aggMap = {};
      for (const it of allItems) {
        const key = `${it.product_name_snapshot}_${it.size_snapshot}`;
        if (!aggMap[key]) {
          aggMap[key] = {
            product_name: it.product_name_snapshot,
            size: it.size_snapshot,
            total_quantity: 0,
            total_price: 0,
            details: []
          };
        }
        aggMap[key].total_quantity += it.quantity;
        aggMap[key].total_price += it.item_total_price;

        let opts = {};
        try { opts = JSON.parse(it.options_snapshot); } catch (e) {}
        aggMap[key].details.push({
          employee_name: it.employee_name,
          quantity: it.quantity,
          sugar: opts.sugar || '100%',
          ice: opts.ice || 'Bình thường',
          topping: it.topping_snapshot || '',
          note: opts.note || ''
        });
      }
      aggregatedItems = Object.values(aggMap);
    } else {
      unOrderedEmployees = await all('SELECT * FROM employees WHERE is_active = 1 ORDER BY name COLLATE NOCASE ASC');
    }

    res.json({
      success: true,
      data: {
        session,
        kpi: {
          ordered_count: orderedCount,
          un_ordered_count: unOrderedEmployees.length,
          total_active_employees: totalActiveEmployees,
          total_cups: totalCups,
          total_amount: totalAmount,
          total_subsidy: totalSubsidy,
          total_employee_paid: totalEmployeePaid,
          paid_orders_count: paidOrdersCount,
          unpaid_orders_count: unpaidOrdersCount
        },
        ordered_employees: orderedEmployees,
        un_ordered_employees: unOrderedEmployees,
        aggregated_items: aggregatedItems
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET history with filters
router.get('/history', async (req, res) => {
  try {
    const { start_date, end_date, store_id, employee_id } = req.query;

    let sql = `
      SELECT o.*, s.session_date, s.close_time, st.name as store_name, st.logo as store_logo,
             e.name as employee_name, e.department as employee_department
      FROM orders o
      JOIN daily_order_sessions s ON o.session_id = s.id
      JOIN stores st ON s.store_id = st.id
      JOIN employees e ON o.employee_id = e.id
      WHERE o.status != 'CANCELLED'
    `;
    const params = [];

    if (start_date) {
      sql += ' AND s.session_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND s.session_date <= ?';
      params.push(end_date);
    }
    if (store_id) {
      sql += ' AND s.store_id = ?';
      params.push(store_id);
    }
    if (employee_id) {
      sql += ' AND o.employee_id = ?';
      params.push(employee_id);
    }

    sql += ' ORDER BY s.session_date DESC, o.created_at DESC';

    const orders = await all(sql, params);

    for (const o of orders) {
      o.items = await all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
    }

    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalSubsidy = orders.reduce((sum, o) => sum + (o.subsidy_amount || 0), 0);
    const totalPaid = orders.reduce((sum, o) => sum + (o.employee_paid_amount || 0), 0);
    const totalCups = orders.reduce((sum, o) => sum + o.items.reduce((iSum, it) => iSum + (it.quantity || 1), 0), 0);

    res.json({
      success: true,
      data: {
        orders,
        summary: {
          total_orders: totalOrders,
          total_cups: totalCups,
          total_amount: totalAmount,
          total_subsidy: totalSubsidy,
          total_paid: totalPaid
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET personal employee stats
router.get('/personal/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const month = req.query.month || new Date().toISOString().slice(0, 7); // YYYY-MM

    const orders = await all(`
      SELECT o.*, s.session_date, st.name as store_name
      FROM orders o
      JOIN daily_order_sessions s ON o.session_id = s.id
      JOIN stores st ON s.store_id = st.id
      WHERE o.employee_id = ? AND o.status != 'CANCELLED' AND s.session_date LIKE ?
      ORDER BY s.session_date DESC
    `, [employeeId, `${month}%`]);

    let totalCups = 0;
    let totalSpent = 0;
    let totalSubsidy = 0;
    let totalPaid = 0;

    for (const o of orders) {
      o.items = await all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      totalSpent += o.total_amount || 0;
      totalSubsidy += o.subsidy_amount || 0;
      totalPaid += o.employee_paid_amount || 0;
      totalCups += o.items.reduce((s, it) => s + (it.quantity || 1), 0);
    }

    // Days count
    const uniqueDays = new Set(orders.map(o => o.session_date)).size;

    // Most ordered drink
    const topDrink = await get(`
      SELECT oi.product_name_snapshot, COUNT(*) as count, SUM(oi.quantity) as total_qty
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN daily_order_sessions s ON o.session_id = s.id
      WHERE o.employee_id = ? AND o.status != 'CANCELLED' AND s.session_date LIKE ?
      GROUP BY oi.product_name_snapshot
      ORDER BY total_qty DESC
      LIMIT 1
    `, [employeeId, `${month}%`]);

    res.json({
      success: true,
      data: {
        month,
        days_ordered: uniqueDays,
        total_cups: totalCups,
        total_spent: totalSpent,
        total_subsidy: totalSubsidy,
        total_paid: totalPaid,
        favorite_drink: topDrink ? `${topDrink.product_name_snapshot} (${topDrink.total_qty} ly)` : 'Chưa có',
        orders
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
