import express from 'express';
import XLSX from 'xlsx';
import db from '../db.js';

const router = express.Router();

// Generate Formatted Text Message for Zalo/Messenger
router.get('/message', (req, res) => {
  const { sessionId, mode = 'GỌN', template } = req.query;

  if (!sessionId) return res.status(400).json({ message: 'sessionId là bắt buộc' });

  const session = db.prepare(`
    SELECT s.*, st.name as store_name
    FROM daily_order_sessions s
    JOIN stores st ON s.store_id = st.id
    WHERE s.id = ?
  `).get(sessionId);

  if (!session) return res.status(404).json({ message: 'Không tìm thấy phiên order' });

  // Get orders
  const orders = db.prepare(`
    SELECT o.*, e.name as employee_name
    FROM orders o
    JOIN employees e ON o.employee_id = e.id
    WHERE o.session_id = ?
    ORDER BY e.name ASC
  `).all(sessionId);

  const allItems = [];
  for (const order of orders) {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
    for (const item of items) {
      allItems.push({
        ...item,
        employee_name: order.employee_name,
        toppings: item.toppings_snapshot_json ? JSON.parse(item.toppings_snapshot_json) : []
      });
    }
  }

  let itemsFormattedText = '';
  let totalCups = 0;
  let totalAmount = 0;

  for (const item of allItems) {
    totalCups += item.quantity;
    totalAmount += item.subtotal;
  }

  if (mode === 'GỌN') {
    // Group identical items + identical size + sugar + ice + toppings
    const groupMap = new Map();

    for (const item of allItems) {
      const toppingNames = item.toppings.map(t => `+ ${t.name}`).join(' | ');
      const key = `${item.product_name_snapshot}___${item.size_snapshot}___${item.sugar_option || '100%'}___${item.ice_option || 'Bình thường'}___${toppingNames}___${item.note || ''}`;

      if (!groupMap.has(item.product_name_snapshot)) {
        groupMap.set(item.product_name_snapshot, new Map());
      }
      const prodSubMap = groupMap.get(item.product_name_snapshot);

      if (prodSubMap.has(key)) {
        const existing = prodSubMap.get(key);
        existing.qty += item.quantity;
      } else {
        prodSubMap.set(key, {
          size: item.size_snapshot,
          sugar: item.sugar_option || '100%',
          ice: item.ice_option || 'Bình thường',
          toppingNames,
          note: item.note,
          qty: item.quantity
        });
      }
    }

    let prodIdx = 1;
    const prodLines = [];
    for (const [prodName, subMap] of groupMap.entries()) {
      let prodCups = 0;
      const variantLines = [];
      for (const variant of subMap.values()) {
        prodCups += variant.qty;
        let line = `• ${variant.qty} × ${variant.size} | ${variant.sugar} đường | ${variant.ice}`;
        if (variant.toppingNames) line += ` | ${variant.toppingNames}`;
        if (variant.note) line += ` (${variant.note})`;
        variantLines.push(line);
      }

      prodLines.push(`${prodIdx++}. ${prodName.toUpperCase()} - ${prodCups} LY\n${variantLines.join('\n')}`);
    }

    itemsFormattedText = prodLines.join('\n\n');

  } else if (mode === 'CHI TIẾT') {
    let idx = 1;
    const lines = allItems.map(item => {
      const toppingNames = item.toppings.map(t => `+ ${t.name}`).join(' | ');
      let line = `${idx++}. ${item.product_name_snapshot} (${item.quantity} ly) - Size ${item.size_snapshot} | ${item.sugar_option || '100%'} đường | ${item.ice_option || 'Bình thường'}`;
      if (toppingNames) line += ` | ${toppingNames}`;
      if (item.note) line += ` | Ghi chú: ${item.note}`;
      return line;
    });
    itemsFormattedText = lines.join('\n');

  } else if (mode === 'THEO NGƯỜI') {
    const lines = orders.map(o => {
      const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
      const itemStrs = items.map(i => {
        const tops = i.toppings_snapshot_json ? JSON.parse(i.toppings_snapshot_json).map(t => t.name).join(', ') : '';
        return `  • ${i.product_name_snapshot} (${i.size_snapshot}) | ${i.sugar_option || '100%'} đường | ${i.ice_option || 'Bình thường'}${tops ? ' | Topping: ' + tops : ''}${i.note ? ' (' + i.note + ')' : ''}`;
      });
      return `👤 ${o.employee_name}:\n${itemStrs.join('\n')}`;
    });
    itemsFormattedText = lines.join('\n\n');
  }

  // Get template
  const defaultTpl = db.prepare("SELECT value FROM settings WHERE key = 'message_template'").get()?.value || '';
  const activeTpl = template || session.message_template || defaultTpl;

  // Format date DD/MM/YYYY
  const [year, month, day] = session.date.split('-');
  const dateFormatted = `${day}/${month}/${year}`;

  const formattedMsg = activeTpl
    .replace('{STORE_NAME}', (session.store_name || '').toUpperCase())
    .replace('{DATE}', dateFormatted)
    .replace('{ORDER_ITEMS}', itemsFormattedText)
    .replace('{TOTAL_CUPS}', String(totalCups))
    .replace('{TOTAL_AMOUNT}', new Intl.NumberFormat('vi-VN').format(totalAmount))
    .replace('{RECIPIENT_NAME}', session.recipient_name || 'Chưa điền')
    .replace('{RECIPIENT_PHONE}', session.recipient_phone || 'Chưa điền')
    .replace('{DELIVERY_ADDRESS}', session.delivery_address || 'Chưa điền')
    .replace('{DELIVERY_TIME}', session.delivery_time || 'Giao ngay')
    .replace('{DELIVERY_NOTE}', session.delivery_note || 'Không có');

  res.json({
    success: true,
    totalCups,
    totalAmount,
    message: formattedMsg
  });
});

// Export Excel Report
router.get('/excel', (req, res) => {
  const { startDate, endDate, storeId } = req.query;

  let query = `
    SELECT oi.*, o.created_at as order_time, o.total_amount, o.subsidy_amount, o.employee_pay_amount,
           e.code as emp_code, e.name as emp_name, e.department as emp_dept,
           s.date as session_date, st.name as store_name
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN daily_order_sessions s ON o.session_id = s.id
    JOIN stores st ON s.store_id = st.id
    JOIN employees e ON o.employee_id = e.id
    WHERE 1=1
  `;
  const params = [];

  if (startDate) {
    query += ' AND s.date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND s.date <= ?';
    params.push(endDate);
  }
  if (storeId) {
    query += ' AND s.store_id = ?';
    params.push(storeId);
  }

  query += ' ORDER BY s.date DESC, e.name ASC';

  const rows = db.prepare(query).all(...params);

  const excelRows = rows.map(r => {
    const toppings = r.toppings_snapshot_json ? JSON.parse(r.toppings_snapshot_json).map(t => t.name).join(', ') : '';
    return {
      'Ngày': r.session_date,
      'Quán': r.store_name,
      'Mã NV': r.emp_code,
      'Tên Nhân Viên': r.emp_name,
      'Phòng Ban': r.emp_dept,
      'Món': r.product_name_snapshot,
      'Size': r.size_snapshot,
      'Đường': r.sugar_option || '100%',
      'Đá': r.ice_option || 'Bình thường',
      'Topping': toppings || 'Không',
      'Số Lượng': r.quantity,
      'Đơn Giá (đ)': r.unit_price_snapshot + (r.topping_price_snapshot || 0),
      'Thành Tiền (đ)': r.subtotal,
      'Công Ty Hỗ Trợ (đ)': Math.round(r.subsidy_amount / rows.filter(item => item.order_id === r.order_id).length),
      'Nhân Viên Trả (đ)': Math.round(r.employee_pay_amount / rows.filter(item => item.order_id === r.order_id).length),
      'Ghi Chú': r.note || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo Cáo Order Nước');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="Bao_Cao_Order_Nuoc_${Date.now()}.xlsx"`);
  res.send(buffer);
});

export default router;
