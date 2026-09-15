const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// GET settings
router.get('/', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM settings');
    const settings = {};
    for (const r of rows) {
      if (r.key === 'admin_auth') continue; // Don't expose pin directly
      try {
        settings[r.key] = JSON.parse(r.value);
      } catch (e) {
        settings[r.key] = r.value;
      }
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update settings (template, subsidy)
router.put('/', async (req, res) => {
  try {
    const { message_template, subsidy } = req.body;
    if (message_template !== undefined) {
      await run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['message_template', message_template]);
    }
    if (subsidy !== undefined) {
      const subsidyVal = typeof subsidy === 'string' ? subsidy : JSON.stringify(subsidy);
      await run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['subsidy', subsidyVal]);
    }
    res.json({ success: true, message: 'Cập nhật cấu hình thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST Admin Login
router.post('/admin-login', async (req, res) => {
  try {
    const { pin } = req.body;
    const row = await get("SELECT value FROM settings WHERE key = 'admin_auth'");
    let validPin = 'admin123';
    if (row && row.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (parsed.pin) validPin = parsed.pin;
      } catch (e) {}
    }

    if (pin === validPin) {
      // Return simple session token
      const token = `adm_token_${Date.now()}`;
      res.json({ success: true, token, message: 'Đăng nhập Quản trị viên thành công' });
    } else {
      res.status(401).json({ success: false, message: 'Mã PIN / Mật khẩu Admin không chính xác!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT change admin PIN
router.put('/admin-pin', async (req, res) => {
  try {
    const { old_pin, new_pin } = req.body;
    if (!new_pin || new_pin.length < 4) {
      return res.status(400).json({ success: false, message: 'Mã PIN mới phải từ 4 ký tự trở lên' });
    }

    const row = await get("SELECT value FROM settings WHERE key = 'admin_auth'");
    let currentPin = 'admin123';
    if (row && row.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (parsed.pin) currentPin = parsed.pin;
      } catch (e) {}
    }

    if (old_pin !== currentPin) {
      return res.status(401).json({ success: false, message: 'Mã PIN hiện tại không đúng' });
    }

    await run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [
      'admin_auth',
      JSON.stringify({ pin: new_pin })
    ]);

    res.json({ success: true, message: 'Đổi mã PIN Quản trị viên thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
