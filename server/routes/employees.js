import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all employees
router.get('/', (req, res) => {
  const employees = db.prepare('SELECT * FROM employees ORDER BY name ASC').all();
  res.json(employees);
});

// Create employee
router.post('/', (req, res) => {
  const { code, name, department, avatar } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Tên nhân viên là bắt buộc!' });
  }

  const generatedCode = code || `NV${String(Date.now()).slice(-4)}`;

  try {
    const info = db.prepare(`
      INSERT INTO employees (code, name, department, avatar, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(generatedCode, name, department || 'Chưa phân loại', avatar || null);

    const newEmp = db.prepare('SELECT * FROM employees WHERE id = ?').get(info.lastInsertRowid);
    res.json(newEmp);
  } catch (err) {
    res.status(400).json({ message: 'Mã nhân viên đã tồn tại hoặc dữ liệu không hợp lệ!' });
  }
});

// Update employee
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { code, name, department, avatar, is_active } = req.body;

  db.prepare(`
    UPDATE employees
    SET code = ?, name = ?, department = ?, avatar = ?, is_active = ?
    WHERE id = ?
  `).run(code, name, department, avatar, is_active ? 1 : 0, id);

  const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  res.json(updated);
});

// Toggle active status (Làm việc / Tạm nghỉ)
router.patch('/:id/toggle-active', (req, res) => {
  const { id } = req.params;
  const emp = db.prepare('SELECT is_active FROM employees WHERE id = ?').get(id);
  if (!emp) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });

  const newStatus = emp.is_active ? 0 : 1;
  db.prepare('UPDATE employees SET is_active = ? WHERE id = ?').run(newStatus, id);

  res.json({ id: Number(id), is_active: newStatus });
});

// Delete employee
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM employees WHERE id = ?').run(id);
  res.json({ success: true, id: Number(id) });
});

export default router;
