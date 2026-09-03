import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get History Sessions list
router.get('/', (req, res) => {
  const { storeId, startDate, endDate } = req.query;

  let query = `
    SELECT s.*, st.name as store_name, st.logo as store_logo
    FROM daily_order_sessions s
    JOIN stores st ON s.store_id = st.id
    WHERE 1=1
  `;
  const params = [];

  if (storeId) {
    query += ' AND s.store_id = ?';
    params.push(storeId);
  }
  if (startDate) {
    query += ' AND s.date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND s.date <= ?';
    params.push(endDate);
  }

  query += ' ORDER BY s.date DESC, s.id DESC';

  const sessions = db.prepare(query).all(...params);

  const result = sessions.map(session => {
    const ordersCount = db.prepare('SELECT COUNT(*) as count FROM orders WHERE session_id = ?').get(session.id)?.count || 0;
    
    const cupsRes = db.prepare(`
      SELECT SUM(oi.quantity) as count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE o.session_id = ?
    `).get(session.id);
    const totalCups = cupsRes?.count || 0;

    const totals = db.prepare(`
      SELECT SUM(total_amount) as total, SUM(subsidy_amount) as subsidy, SUM(employee_pay_amount) as pay
      FROM orders
      WHERE session_id = ?
    `).get(session.id);

    return {
      ...session,
      ordersCount,
      totalCups,
      totalAmount: totals?.total || 0,
      totalSubsidy: totals?.subsidy || 0,
      totalEmployeePay: totals?.pay || 0
    };
  });

  res.json(result);
});

// Personal Stats
router.get('/personal/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  const { month } = req.query; // YYYY-MM

  let dateFilter = '';
  const params = [employeeId];
  if (month) {
    dateFilter = "AND s.date LIKE ?";
    params.push(`${month}%`);
  }

  const orders = db.prepare(`
    SELECT o.*, s.date, s.store_id, st.name as store_name
    FROM orders o
    JOIN daily_order_sessions s ON o.session_id = s.id
    JOIN stores st ON s.store_id = st.id
    WHERE o.employee_id = ? ${dateFilter}
    ORDER BY s.date DESC
  `).all(...params);

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const totalSubsidy = orders.reduce((sum, o) => sum + o.subsidy_amount, 0);
  const totalPay = orders.reduce((sum, o) => sum + o.employee_pay_amount, 0);

  // Calculate total cups & favorite drink
  const items = db.prepare(`
    SELECT oi.product_name_snapshot, oi.quantity
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN daily_order_sessions s ON o.session_id = s.id
    WHERE o.employee_id = ? ${dateFilter}
  `).all(...params);

  const totalCups = items.reduce((sum, i) => sum + i.quantity, 0);

  const drinkCountMap = {};
  for (const i of items) {
    drinkCountMap[i.product_name_snapshot] = (drinkCountMap[i.product_name_snapshot] || 0) + i.quantity;
  }

  let favoriteDrink = 'Chưa có';
  let maxCount = 0;
  for (const [drink, count] of Object.entries(drinkCountMap)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteDrink = drink;
    }
  }

  res.json({
    totalOrders,
    totalCups,
    totalSpent,
    totalSubsidy,
    totalPay,
    favoriteDrink: maxCount > 0 ? `${favoriteDrink} (${maxCount} lần)` : 'Chưa có',
    orders
  });
});

export default router;
