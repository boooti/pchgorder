const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const { all } = require('../db');

// GET export Excel report
router.get('/excel', async (req, res) => {
  try {
    const { start_date, end_date, store_id, employee_id, month } = req.query;

    let sql = `
      SELECT oi.*, o.session_id, o.subsidy_amount, o.employee_paid_amount,
             s.session_date, st.name as store_name,
             e.name as employee_name, e.department as employee_department
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN daily_order_sessions s ON o.session_id = s.id
      JOIN stores st ON s.store_id = st.id
      JOIN employees e ON o.employee_id = e.id
      WHERE o.status != 'CANCELLED'
    `;
    const params = [];

    if (month) {
      sql += ' AND s.session_date LIKE ?';
      params.push(`${month}%`);
    } else {
      if (start_date) {
        sql += ' AND s.session_date >= ?';
        params.push(start_date);
      }
      if (end_date) {
        sql += ' AND s.session_date <= ?';
        params.push(end_date);
      }
    }
    if (store_id) {
      sql += ' AND s.store_id = ?';
      params.push(store_id);
    }
    if (employee_id) {
      sql += ' AND o.employee_id = ?';
      params.push(employee_id);
    }

    sql += ' ORDER BY s.session_date DESC, e.name ASC';

    const rows = await all(sql, params);

    // Build Excel dataset matching specification:
    // Ngày | Quán | Nhân viên | Món | Size | Đường | Đá | Topping | SL | Đơn giá | Thành tiền | Công ty hỗ trợ | Nhân viên trả
    const excelData = rows.map((r, idx) => {
      let opts = {};
      try { opts = JSON.parse(r.options_snapshot); } catch (e) {}

      // Calculate prorated or per-item subsidy if order has multiple items
      const lineTotal = r.item_total_price || 0;

      return {
        'STT': idx + 1,
        'Ngày': r.session_date,
        'Quán': r.store_name_snapshot || r.store_name,
        'Nhân viên': r.employee_name,
        'Phòng ban': r.employee_department,
        'Món': r.product_name_snapshot,
        'Size': r.size_snapshot,
        'Đường': opts.sugar || '100%',
        'Đá': opts.ice || 'Bình thường',
        'Topping': r.topping_snapshot || 'Không',
        'Ghi chú': opts.note || '',
        'Số lượng': r.quantity,
        'Đơn giá (đ)': r.unit_price_snapshot,
        'Thành tiền (đ)': lineTotal,
        'Công ty hỗ trợ (đ)': r.subsidy_amount || 0,
        'Nhân viên trả (đ)': r.employee_paid_amount || 0
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Column widths
    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 12 }, // Ngày
      { wch: 22 }, // Quán
      { wch: 20 }, // Nhân viên
      { wch: 14 }, // Phòng ban
      { wch: 26 }, // Món
      { wch: 8 },  // Size
      { wch: 10 }, // Đường
      { wch: 12 }, // Đá
      { wch: 22 }, // Topping
      { wch: 20 }, // Ghi chú
      { wch: 8 },  // SL
      { wch: 12 }, // Đơn giá
      { wch: 14 }, // Thành tiền
      { wch: 16 }, // Hỗ trợ
      { wch: 16 }  // NV trả
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Báo Cáo Order Nước');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    const filename = `Bao_Cao_Order_Nuoc_${Date.now()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
