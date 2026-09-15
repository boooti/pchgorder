const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { run, get, all } = require('../db');
const { hashPassword, verifyPassword, sortVietnameseByFirstName } = require('../sessionUtils');

// GET all employees (sorted alphabetically by Vietnamese First Name / Tên)
router.get('/', async (req, res) => {
  try {
    const { active } = req.query;
    let sql = `
      SELECT id, name, phone, department, is_active, has_asked_password,
             (CASE WHEN password IS NOT NULL AND password != '' THEN 1 ELSE 0 END) as has_password,
             created_at
      FROM employees
    `;
    const params = [];
    if (active === '1' || active === 'true') {
      sql += ' WHERE is_active = 1';
    }
    const employees = await all(sql, params);
    // Sort by Vietnamese first name (ABC của Tên)
    const sorted = sortVietnameseByFirstName(employees);
    res.json({ success: true, data: sorted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single employee
router.get('/:id', async (req, res) => {
  try {
    const emp = await get(`
      SELECT id, name, phone, department, is_active, has_asked_password,
             (CASE WHEN password IS NOT NULL AND password != '' THEN 1 ELSE 0 END) as has_password,
             created_at
      FROM employees WHERE id = ?
    `, [req.params.id]);
    if (!emp) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại' });
    res.json({ success: true, data: emp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new employee
router.post('/', async (req, res) => {
  try {
    const { name, phone, department, is_active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên nhân viên là bắt buộc' });
    }
    const id = `emp-${crypto.randomUUID().slice(0, 8)}`;
    await run(`
      INSERT INTO employees (id, name, phone, department, is_active)
      VALUES (?, ?, ?, ?, ?)
    `, [id, name.trim(), phone || '', department || '', is_active !== undefined ? is_active : 1]);

    const created = await get('SELECT * FROM employees WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: created, message: 'Thêm nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update employee
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, department, is_active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên nhân viên là bắt buộc' });
    }
    await run(`
      UPDATE employees
      SET name = ?, phone = ?, department = ?, is_active = ?
      WHERE id = ?
    `, [name.trim(), phone || '', department || '', is_active !== undefined ? is_active : 1, req.params.id]);

    const updated = await get('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated, message: 'Cập nhật nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH toggle active status
router.patch('/:id/status', async (req, res) => {
  try {
    const emp = await get('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!emp) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại' });
    const newStatus = emp.is_active === 1 ? 0 : 1;
    await run('UPDATE employees SET is_active = ? WHERE id = ?', [newStatus, req.params.id]);
    res.json({
      success: true,
      data: { ...emp, is_active: newStatus },
      message: `Đã ${newStatus === 1 ? 'kích hoạt' : 'tạm ngưng'} nhân viên`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE employee
router.delete('/:id', async (req, res) => {
  try {
    // Check if employee has orders
    const orderCount = await get('SELECT COUNT(*) as count FROM orders WHERE employee_id = ?', [req.params.id]);
    if (orderCount && orderCount.count > 0) {
      // Soft delete by deactivating
      await run('UPDATE employees SET is_active = 0 WHERE id = ?', [req.params.id]);
      return res.json({
        success: true,
        message: 'Nhân viên đã có lịch sử order nên được chuyển sang trạng thái Tạm nghỉ thay vì xóa vĩnh viễn'
      });
    }
    await run('DELETE FROM employees WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Xóa nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST employee login / auth check
router.post('/login', async (req, res) => {
  try {
    const { employee_id, password } = req.body;
    if (!employee_id) {
      return res.status(400).json({ success: false, message: 'Thiếu mã nhân viên' });
    }

    const emp = await get('SELECT * FROM employees WHERE id = ?', [employee_id]);
    if (!emp) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại' });
    if (!emp.is_active) {
      return res.status(403).json({ success: false, message: 'Tài khoản nhân viên này đã ngừng hoạt động' });
    }

    const hasPassword = Boolean(emp.password && emp.password.length > 0);

    if (hasPassword) {
      if (!password) {
        return res.status(401).json({
          success: false,
          require_password: true,
          message: 'Vui lòng nhập mật khẩu tài khoản của bạn.'
        });
      }

      if (!verifyPassword(password, emp.password)) {
        return res.status(401).json({
          success: false,
          require_password: true,
          message: 'Mật khẩu không chính xác, vui lòng thử lại.'
        });
      }
    }

    // Return safe employee data without password hash
    const { password: _, ...safeEmp } = emp;
    safeEmp.has_password = hasPassword ? 1 : 0;
    safeEmp.has_asked_password = emp.has_asked_password || 0;

    res.json({
      success: true,
      data: safeEmp,
      message: `Đăng nhập thành công! Chào mừng ${emp.name}.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST set employee password
router.post('/:id/set-password', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || String(password).trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 3 ký tự'
      });
    }

    const emp = await get('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!emp) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại' });

    const hashed = hashPassword(password);
    await run('UPDATE employees SET password = ?, has_asked_password = 1 WHERE id = ?', [hashed, req.params.id]);

    const updated = await get(`
      SELECT id, name, phone, department, is_active, has_asked_password, 1 as has_password, created_at
      FROM employees WHERE id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: updated,
      message: 'Tạo mật khẩu bảo vệ thành công!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST skip creating password (first login without password)
router.post('/:id/skip-password', async (req, res) => {
  try {
    const emp = await get('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!emp) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại' });

    await run('UPDATE employees SET has_asked_password = 1 WHERE id = ?', [req.params.id]);

    const updated = await get(`
      SELECT id, name, phone, department, is_active, 1 as has_asked_password,
             (CASE WHEN password IS NOT NULL AND password != '' THEN 1 ELSE 0 END) as has_password,
             created_at
      FROM employees WHERE id = ?
    `, [req.params.id]);

    res.json({
      success: true,
      data: updated,
      message: 'Đã bỏ qua tạo mật khẩu.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST reset password (Admin function)
router.post('/:id/reset-password', async (req, res) => {
  try {
    const emp = await get('SELECT * FROM employees WHERE id = ?', [req.params.id]);
    if (!emp) return res.status(404).json({ success: false, message: 'Nhân viên không tồn tại' });

    await run('UPDATE employees SET password = NULL, has_asked_password = 0 WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: `Đã xóa mật khẩu của nhân viên ${emp.name}. Lần đăng nhập tới nhân viên có thể tạo lại mật khẩu mới hoặc tiếp tục không dùng mật khẩu.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET un-ordered employees for session + formatted reminder text
router.get('/un-ordered/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await get('SELECT * FROM daily_order_sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Phiên order không tồn tại' });
    }

    // Filter by session scope (ALL, DEPARTMENT, CUSTOM)
    let eligibleCondition = '';
    let params = [];

    if (session.scope_type === 'DEPARTMENT' && session.eligible_departments) {
      try {
        const depts = JSON.parse(session.eligible_departments);
        if (Array.isArray(depts) && depts.length > 0) {
          const placeholders = depts.map(() => '?').join(',');
          eligibleCondition = ` AND e.department IN (${placeholders}) `;
          params.push(...depts);
        }
      } catch (e) {}
    } else if (session.scope_type === 'CUSTOM' && session.eligible_employee_ids) {
      try {
        const empIds = JSON.parse(session.eligible_employee_ids);
        if (Array.isArray(empIds) && empIds.length > 0) {
          const placeholders = empIds.map(() => '?').join(',');
          eligibleCondition = ` AND e.id IN (${placeholders}) `;
          params.push(...empIds);
        }
      } catch (e) {}
    }

    params.push(sessionId);

    // Only active employees in scope who have NOT ordered in this session
    const rawUnOrdered = await all(`
      SELECT e.* FROM employees e
      WHERE e.is_active = 1
        ${eligibleCondition}
        AND e.id NOT IN (
          SELECT employee_id FROM orders WHERE session_id = ? AND status != 'CANCELLED'
        )
    `, params);

    // Sort un-ordered by Vietnamese First Name (Tên)
    const unOrdered = sortVietnameseByFirstName(rawUnOrdered);

    const ordered = await all(`
      SELECT e.name, o.total_amount, o.created_at
      FROM orders o
      JOIN employees e ON o.employee_id = e.id
      WHERE o.session_id = ? AND o.status != 'CANCELLED'
      ORDER BY o.created_at DESC
    `, [sessionId]);

    // Format chat reminder message for company/group
    const sessionTitle = session.title ? session.title : 'Hôm Nay';
    let reminderText = `📢 NHẮC NHỞ ORDER NƯỚC: [${sessionTitle.toUpperCase()}]\n`;
    reminderText += `⏰ Giờ chốt: ${session.close_time || '10:30'} • Ngày: ${session.session_date}\n\n`;
    if (unOrdered.length === 0) {
      reminderText += `🎉 Tuyệt vời! Tất cả thành viên trong nhóm đều đã chọn món!`;
    } else {
      reminderText += `👉 Còn ${unOrdered.length} bạn chưa đặt nước:\n`;
      unOrdered.forEach((emp, index) => {
        reminderText += `${index + 1}. @${emp.name} (${emp.department || 'Văn phòng'})\n`;
      });
      reminderText += `\nCác bạn tranh thủ đặt trước ${session.close_time || 'giờ chốt'} nhé!`;
    }

    res.json({
      success: true,
      data: {
        total_active: unOrdered.length + ordered.length,
        ordered_count: ordered.length,
        un_ordered_count: unOrdered.length,
        un_ordered_list: unOrdered,
        reminder_text: reminderText
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
