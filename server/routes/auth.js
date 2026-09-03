import express from 'express';
import db from '../db.js';

const router = express.Router();

// Login Admin
router.post('/login', (req, res) => {
  const { password } = req.body;
  const adminPassSetting = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  const currentPass = adminPassSetting ? adminPassSetting.value : 'admin123';

  if (password === currentPass) {
    return res.json({ success: true, token: 'admin-token-secret-session' });
  }
  return res.status(401).json({ success: false, message: 'Mật khẩu Admin không chính xác!' });
});

// Change Admin password
router.post('/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const adminPassSetting = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  const currentPass = adminPassSetting ? adminPassSetting.value : 'admin123';

  if (currentPassword !== currentPass) {
    return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không đúng!' });
  }

  db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password'").run(newPassword);
  res.json({ success: true, message: 'Đổi mật khẩu Admin thành công!' });
});

// Get Settings (Subsidy & Template)
router.get('/settings', (req, res) => {
  const settings = db.prepare('SELECT key, value FROM settings').all();
  const settingsObj = {};
  for (const s of settings) {
    settingsObj[s.key] = s.value;
  }
  res.json(settingsObj);
});

// Update Subsidy Setting
router.put('/settings/subsidy', (req, res) => {
  const { subsidy_enabled, subsidy_amount_per_person } = req.body;
  
  db.prepare("UPDATE settings SET value = ? WHERE key = 'subsidy_enabled'").run(subsidy_enabled ? '1' : '0');
  db.prepare("UPDATE settings SET value = ? WHERE key = 'subsidy_amount_per_person'").run(String(subsidy_amount_per_person || 0));

  res.json({ success: true, message: 'Cập nhật trợ giá thành công!' });
});

export default router;
