const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { run, get, all, UPLOADS_DIR } = require('../db');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `menu_${Date.now()}_${crypto.randomUUID().slice(0, 6)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, SVG) hoặc PDF'));
    }
  }
});

// GET all stores
router.get('/', async (req, res) => {
  try {
    const stores = await all(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id) as product_count,
        (SELECT COUNT(*) FROM store_menu_files f WHERE f.store_id = s.id) as menu_file_count
      FROM stores s
      ORDER BY s.created_at DESC
    `);

    // Attach delivery profiles
    for (const s of stores) {
      s.delivery_profile = await get('SELECT * FROM delivery_profiles WHERE store_id = ?', [s.id]);
    }

    res.json({ success: true, data: stores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single store with complete details
router.get('/:id', async (req, res) => {
  try {
    const store = await get('SELECT * FROM stores WHERE id = ?', [req.params.id]);
    if (!store) return res.status(404).json({ success: false, message: 'Quán không tồn tại' });

    const delivery_profile = await get('SELECT * FROM delivery_profiles WHERE store_id = ?', [store.id]);
    const menu_files = await all('SELECT * FROM store_menu_files WHERE store_id = ? ORDER BY page_order ASC, created_at ASC', [store.id]);
    const categories = await all('SELECT * FROM categories WHERE store_id = ? ORDER BY display_order ASC, name ASC', [store.id]);
    const toppings = await all('SELECT * FROM product_toppings WHERE store_id = ? ORDER BY price ASC', [store.id]);

    const products = await all('SELECT * FROM products WHERE store_id = ? ORDER BY created_at ASC', [store.id]);
    for (const p of products) {
      p.sizes = await all('SELECT * FROM product_sizes WHERE product_id = ? ORDER BY price ASC', [p.id]);
    }

    res.json({
      success: true,
      data: {
        ...store,
        delivery_profile,
        menu_files,
        categories,
        toppings,
        products
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST new store
router.post('/', async (req, res) => {
  try {
    const { name, logo, cover_image, address, phone, notes, is_active, delivery_profile } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên quán là bắt buộc' });
    }

    const storeId = `store-${crypto.randomUUID().slice(0, 8)}`;
    await run(`
      INSERT INTO stores (id, name, logo, cover_image, address, phone, notes, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      storeId,
      name.trim(),
      logo || 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150',
      cover_image || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
      address || '',
      phone || '',
      notes || '',
      is_active !== undefined ? is_active : 1
    ]);

    const dp = delivery_profile || {};
    await run(`
      INSERT INTO delivery_profiles (id, store_id, recipient_name, recipient_phone, delivery_address, desired_delivery_time, delivery_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      `dp-${storeId}`,
      storeId,
      dp.recipient_name || '',
      dp.recipient_phone || '',
      dp.delivery_address || '',
      dp.desired_delivery_time || '11:15',
      dp.delivery_notes || ''
    ]);

    const created = await get('SELECT * FROM stores WHERE id = ?', [storeId]);
    created.delivery_profile = await get('SELECT * FROM delivery_profiles WHERE store_id = ?', [storeId]);

    res.status(201).json({ success: true, data: created, message: 'Tạo quán thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update store
router.put('/:id', async (req, res) => {
  try {
    const { name, logo, cover_image, address, phone, notes, is_active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên quán là bắt buộc' });
    }

    await run(`
      UPDATE stores
      SET name = ?, logo = ?, cover_image = ?, address = ?, phone = ?, notes = ?, is_active = ?
      WHERE id = ?
    `, [
      name.trim(),
      logo || '',
      cover_image || '',
      address || '',
      phone || '',
      notes || '',
      is_active !== undefined ? is_active : 1,
      req.params.id
    ]);

    const updated = await get('SELECT * FROM stores WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated, message: 'Cập nhật quán thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update default delivery profile for store
router.put('/:id/delivery-profile', async (req, res) => {
  try {
    const { recipient_name, recipient_phone, delivery_address, desired_delivery_time, delivery_notes } = req.body;
    const storeId = req.params.id;

    const existing = await get('SELECT * FROM delivery_profiles WHERE store_id = ?', [storeId]);
    if (existing) {
      await run(`
        UPDATE delivery_profiles
        SET recipient_name = ?, recipient_phone = ?, delivery_address = ?, desired_delivery_time = ?, delivery_notes = ?
        WHERE store_id = ?
      `, [
        recipient_name || '',
        recipient_phone || '',
        delivery_address || '',
        desired_delivery_time || '',
        delivery_notes || '',
        storeId
      ]);
    } else {
      await run(`
        INSERT INTO delivery_profiles (id, store_id, recipient_name, recipient_phone, delivery_address, desired_delivery_time, delivery_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        `dp-${storeId}`,
        storeId,
        recipient_name || '',
        recipient_phone || '',
        delivery_address || '',
        desired_delivery_time || '',
        delivery_notes || ''
      ]);
    }

    const updated = await get('SELECT * FROM delivery_profiles WHERE store_id = ?', [storeId]);
    res.json({ success: true, data: updated, message: 'Đã lưu thông tin giao hàng mặc định' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload menu files (multi-file support: JPG, PNG, PDF)
router.post('/:id/menu-files', upload.array('files', 10), async (req, res) => {
  try {
    const storeId = req.params.id;
    const store = await get('SELECT * FROM stores WHERE id = ?', [storeId]);
    if (!store) return res.status(404).json({ success: false, message: 'Quán không tồn tại' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn ít nhất một file ảnh hoặc PDF' });
    }

    // Get current max page order
    const maxOrderRow = await get('SELECT MAX(page_order) as max_order FROM store_menu_files WHERE store_id = ?', [storeId]);
    let currentOrder = (maxOrderRow && maxOrderRow.max_order) ? maxOrderRow.max_order : 0;

    const uploadedRecords = [];
    for (const file of req.files) {
      currentOrder += 1;
      const fileId = `mf-${crypto.randomUUID().slice(0, 8)}`;
      const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
      const relativePath = `/uploads/${file.filename}`;

      await run(`
        INSERT INTO store_menu_files (id, store_id, file_name, file_path, file_type, page_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [fileId, storeId, file.originalname, relativePath, ext, currentOrder]);

      uploadedRecords.push({
        id: fileId,
        store_id: storeId,
        file_name: file.originalname,
        file_path: relativePath,
        file_type: ext,
        page_order: currentOrder
      });
    }

    res.status(201).json({
      success: true,
      data: uploadedRecords,
      message: `Đã tải lên ${uploadedRecords.length} trang menu`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE menu file
router.delete('/:id/menu-files/:fileId', async (req, res) => {
  try {
    const { id: storeId, fileId } = req.params;
    const fileRow = await get('SELECT * FROM store_menu_files WHERE id = ? AND store_id = ?', [fileId, storeId]);
    if (!fileRow) {
      return res.status(404).json({ success: false, message: 'File menu không tồn tại' });
    }

    // Delete disk file if exists
    const diskPath = path.join(UPLOADS_DIR, path.basename(fileRow.file_path));
    if (fs.existsSync(diskPath)) {
      try { fs.unlinkSync(diskPath); } catch (e) {}
    }

    await run('DELETE FROM store_menu_files WHERE id = ?', [fileId]);
    res.json({ success: true, message: 'Đã xóa trang menu' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT reorder menu files
router.put('/:id/menu-files/reorder', async (req, res) => {
  try {
    const { items } = req.body; // array of { id, page_order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: 'Danh sách sắp xếp không hợp lệ' });
    }

    for (const item of items) {
      await run('UPDATE store_menu_files SET page_order = ? WHERE id = ? AND store_id = ?', [item.page_order, item.id, req.params.id]);
    }

    const updated = await all('SELECT * FROM store_menu_files WHERE store_id = ? ORDER BY page_order ASC', [req.params.id]);
    res.json({ success: true, data: updated, message: 'Đã cập nhật thứ tự trang menu' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE store
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM stores WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa quán thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
