const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Helper function to format currency
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

// GET order synthesis and message export for a session
router.get('/:id/export-message', async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const formatMode = req.query.mode || 'GON'; // 'GON', 'CHITIET', 'THEONGUOI'

    const session = await get(`
      SELECT s.*, st.name as store_name, st.phone as store_phone
      FROM daily_order_sessions s
      JOIN stores st ON s.store_id = st.id
      WHERE s.id = ?
    `, [sessionId]);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Phiên order không tồn tại' });
    }

    // Get all order items for this session
    const items = await all(`
      SELECT oi.*, e.name as employee_name, e.department, o.created_at as order_time
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN employees e ON o.employee_id = e.id
      WHERE o.session_id = ? AND o.status != 'CANCELLED'
      ORDER BY oi.product_name_snapshot ASC, e.name ASC
    `, [sessionId]);

    const totalCups = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
    const totalAmount = items.reduce((sum, it) => sum + (it.item_total_price || 0), 0);

    let orderItemsText = '';

    if (formatMode === 'GON') {
      // 1. Group by Product Key (product_id or normalized name)
      const groupedByProd = {};
      for (const it of items) {
        const prodKey = (it.product_id || it.product_name_snapshot.toLowerCase().trim());
        const displayName = it.product_name_snapshot.toUpperCase();

        if (!groupedByProd[prodKey]) {
          groupedByProd[prodKey] = { displayName, totalCups: 0, variants: {} };
        }
        groupedByProd[prodKey].totalCups += it.quantity;

        // Parse options
        let opts = {};
        try { opts = JSON.parse(it.options_snapshot); } catch (e) {}

        const optParts = [];
        if (it.size_snapshot) optParts.push(`${it.size_snapshot}`);
        if (opts.sugar) optParts.push(`${opts.sugar} đường`);
        if (opts.ice) optParts.push(`${opts.ice}`);
        if (it.topping_snapshot && it.topping_snapshot.trim()) optParts.push(`+ ${it.topping_snapshot}`);
        if (opts.note && opts.note.trim()) optParts.push(`(${opts.note})`);

        const variantKey = optParts.join(' | ');
        if (!groupedByProd[prodKey].variants[variantKey]) {
          groupedByProd[prodKey].variants[variantKey] = 0;
        }
        groupedByProd[prodKey].variants[variantKey] += it.quantity;
      }

      let prodIndex = 1;
      const sections = [];
      for (const [_, data] of Object.entries(groupedByProd)) {
        let sec = `${prodIndex}. ${data.displayName} - ${data.totalCups} LY\n`;
        for (const [variantKey, qty] of Object.entries(data.variants)) {
          sec += `* ${qty} × ${variantKey}\n`;
        }
        sections.push(sec.trim());
        prodIndex++;
      }
      orderItemsText = sections.join('\n\n');

    } else if (formatMode === 'CHITIET') {
      // 2. Detailed list
      const lines = [];
      items.forEach((it, idx) => {
        let opts = {};
        try { opts = JSON.parse(it.options_snapshot); } catch (e) {}
        const optParts = [];
        if (it.size_snapshot) optParts.push(`Size ${it.size_snapshot}`);
        if (opts.sugar) optParts.push(`${opts.sugar} đường`);
        if (opts.ice) optParts.push(`${opts.ice}`);
        if (it.topping_snapshot && it.topping_snapshot.trim()) optParts.push(`Topping: ${it.topping_snapshot}`);
        if (opts.note && opts.note.trim()) optParts.push(`Ghi chú: ${opts.note}`);

        lines.push(`${idx + 1}. ${it.product_name_snapshot} (${it.quantity} ly) - [${it.employee_name}]\n   └ ${optParts.join(' | ')}`);
      });
      orderItemsText = lines.join('\n\n');

    } else if (formatMode === 'THEONGUOI') {
      // 3. Grouped by Employee
      const groupedByEmp = {};
      for (const it of items) {
        if (!groupedByEmp[it.employee_name]) {
          groupedByEmp[it.employee_name] = [];
        }
        let opts = {};
        try { opts = JSON.parse(it.options_snapshot); } catch (e) {}
        const optParts = [];
        if (it.size_snapshot) optParts.push(`${it.size_snapshot}`);
        if (opts.sugar) optParts.push(`${opts.sugar} đường`);
        if (opts.ice) optParts.push(`${opts.ice}`);
        if (it.topping_snapshot && it.topping_snapshot.trim()) optParts.push(`+ ${it.topping_snapshot}`);
        if (opts.note && opts.note.trim()) optParts.push(`(${opts.note})`);

        groupedByEmp[it.employee_name].push(`${it.quantity} × ${it.product_name_snapshot} | ${optParts.join(' | ')}`);
      }

      const sections = [];
      let empIdx = 1;
      for (const [empName, empItems] of Object.entries(groupedByEmp)) {
        let sec = `${empIdx}. ${empName.toUpperCase()}\n`;
        empItems.forEach(itemStr => {
          sec += `* ${itemStr}\n`;
        });
        sections.push(sec.trim());
        empIdx++;
      }
      orderItemsText = sections.join('\n\n');
    }

    // Load custom template from settings or use default
    const templateRow = await get("SELECT value FROM settings WHERE key = 'message_template'");
    let template = templateRow && templateRow.value ? templateRow.value : `ORDER NƯỚC - {STORE_NAME}
Ngày: {DATE}

{ORDER_ITEMS}

TỔNG: {TOTAL_CUPS} LY
TỔNG TIỀN: {TOTAL_AMOUNT}đ
{PAYMENT_INFO}

THÔNG TIN GIAO HÀNG
Người nhận: {RECIPIENT_NAME}
SĐT: {RECIPIENT_PHONE}
Địa chỉ: {DELIVERY_ADDRESS}
Giờ giao: {DELIVERY_TIME}
Ghi chú: {DELIVERY_NOTE}`;

    // Replace variables
    const formattedDate = session.session_date.split('-').reverse().join('/');
    const paymentInfoText = session.sponsor_type === 'SPONSOR' && session.sponsor_name
      ? `Hình thức: 🎁 ${session.sponsor_name} bao toàn bộ đơn hàng`
      : 'Hình thức: 🤝 Tự thanh toán (Campuchia)';

    let rendered = template
      .replace(/{STORE_NAME}/g, session.store_name || 'Quán nước')
      .replace(/{DATE}/g, formattedDate)
      .replace(/{ORDER_ITEMS}/g, orderItemsText || '(Chưa có món nào được đặt)')
      .replace(/{TOTAL_CUPS}/g, String(totalCups))
      .replace(/{TOTAL_AMOUNT}/g, formatVND(totalAmount));

    if (template.includes('{PAYMENT_INFO}')) {
      rendered = rendered.replace(/{PAYMENT_INFO}/g, paymentInfoText);
    } else {
      rendered = rendered.replace(
        `TỔNG TIỀN: ${formatVND(totalAmount)}đ`,
        `TỔNG TIỀN: ${formatVND(totalAmount)}đ\n${paymentInfoText}`
      );
    }

    const finalMessage = rendered
      .replace(/{RECIPIENT_NAME}/g, session.recipient_name_snapshot || 'Văn phòng')
      .replace(/{RECIPIENT_PHONE}/g, session.recipient_phone_snapshot || '')
      .replace(/{DELIVERY_ADDRESS}/g, session.delivery_address_snapshot || 'Cổng sau Công ty Phú Cường Hoàng Gia - 1 Hà Huy Tập, Rạch Giá')
      .replace(/{DELIVERY_TIME}/g, session.delivery_time_snapshot || '11:15')
      .replace(/{DELIVERY_NOTE}/g, session.delivery_note_snapshot || 'Gọi trước khi giao.');

    res.json({
      success: true,
      data: {
        session_id: sessionId,
        store_name: session.store_name,
        date: session.session_date,
        total_cups: totalCups,
        total_amount: totalAmount,
        total_amount_formatted: formatVND(totalAmount) + 'đ',
        message: finalMessage,
        raw_message: finalMessage,
        delivery_info: {
          recipient: session.recipient_name_snapshot || 'Văn phòng',
          phone: session.recipient_phone_snapshot,
          address: session.delivery_address_snapshot || 'Cổng sau Công ty Phú Cường Hoàng Gia - 1 Hà Huy Tập, Rạch Giá',
          time: session.delivery_time_snapshot,
          note: session.delivery_note_snapshot
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET list of orders in session for Admin review
router.get('/:id/orders-detail', async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const orders = await all(`
      SELECT o.*, e.name as employee_name, e.phone as employee_phone, e.department
      FROM orders o
      JOIN employees e ON o.employee_id = e.id
      WHERE o.session_id = ? AND o.status != 'CANCELLED'
      ORDER BY o.created_at ASC
    `, [sessionId]);

    for (const o of orders) {
      o.items = await all('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
    }

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
