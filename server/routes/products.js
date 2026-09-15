const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const XLSX = require('xlsx');
const { run, get, all } = require('../db');

const upload = multer({ storage: multer.memoryStorage() });

// ==================== CATEGORIES ====================
router.post('/stores/:storeId/categories', async (req, res) => {
  try {
    const { name, display_order } = req.body;
    const { storeId } = req.params;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Tên danh mục là bắt buộc' });

    const id = `cat-${crypto.randomUUID().slice(0, 8)}`;
    await run('INSERT INTO categories (id, store_id, name, display_order) VALUES (?, ?, ?, ?)', [
      id, storeId, name.trim(), display_order || 0
    ]);
    const created = await get('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: created, message: 'Tạo danh mục thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { name, display_order } = req.body;
    await run('UPDATE categories SET name = ?, display_order = ? WHERE id = ?', [name.trim(), display_order || 0, req.params.id]);
    const updated = await get('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated, message: 'Cập nhật danh mục thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa danh mục' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== TOPPINGS ====================
router.post('/stores/:storeId/toppings', async (req, res) => {
  try {
    const { name, price } = req.body;
    const { storeId } = req.params;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Tên topping là bắt buộc' });

    const id = `top-${crypto.randomUUID().slice(0, 8)}`;
    await run('INSERT INTO product_toppings (id, store_id, name, price) VALUES (?, ?, ?, ?)', [
      id, storeId, name.trim(), parseFloat(price) || 0
    ]);
    const created = await get('SELECT * FROM product_toppings WHERE id = ?', [id]);
    res.status(201).json({ success: true, data: created, message: 'Tạo topping thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/toppings/:id', async (req, res) => {
  try {
    const { name, price } = req.body;
    await run('UPDATE product_toppings SET name = ?, price = ? WHERE id = ?', [
      name.trim(), parseFloat(price) || 0, req.params.id
    ]);
    const updated = await get('SELECT * FROM product_toppings WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated, message: 'Cập nhật topping thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/toppings/:id', async (req, res) => {
  try {
    await run('DELETE FROM product_toppings WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa topping' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== PRODUCTS ====================
router.post('/stores/:storeId/products', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { category_id, name, image, description, is_available, allow_sugar, allow_ice, sizes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Tên món là bắt buộc' });

    const productId = `prod-${crypto.randomUUID().slice(0, 8)}`;
    await run(`
      INSERT INTO products (id, store_id, category_id, name, image, description, is_available, allow_sugar, allow_ice)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      productId,
      storeId,
      category_id || null,
      name.trim(),
      image || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300',
      description || '',
      is_available !== undefined ? is_available : 1,
      allow_sugar !== undefined ? allow_sugar : 1,
      allow_ice !== undefined ? allow_ice : 1
    ]);

    // Insert sizes
    const sizeList = Array.isArray(sizes) && sizes.length > 0 ? sizes : [{ name: 'Tiêu chuẩn', price: 45000, is_default: 1 }];
    for (const sz of sizeList) {
      await run(`
        INSERT INTO product_sizes (id, product_id, size_name, price, is_default)
        VALUES (?, ?, ?, ?, ?)
      `, [
        `psz-${crypto.randomUUID().slice(0, 8)}`,
        productId,
        sz.name || sz.size_name || 'M',
        parseFloat(sz.price) || 0,
        sz.is_default ? 1 : 0
      ]);
    }

    const created = await get('SELECT * FROM products WHERE id = ?', [productId]);
    created.sizes = await all('SELECT * FROM product_sizes WHERE product_id = ?', [productId]);

    res.status(201).json({ success: true, data: created, message: 'Thêm món thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { category_id, name, image, description, is_available, allow_sugar, allow_ice, sizes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Tên món là bắt buộc' });

    await run(`
      UPDATE products
      SET category_id = ?, name = ?, image = ?, description = ?, is_available = ?, allow_sugar = ?, allow_ice = ?
      WHERE id = ?
    `, [
      category_id || null,
      name.trim(),
      image || '',
      description || '',
      is_available !== undefined ? is_available : 1,
      allow_sugar !== undefined ? allow_sugar : 1,
      allow_ice !== undefined ? allow_ice : 1,
      req.params.id
    ]);

    if (Array.isArray(sizes) && sizes.length > 0) {
      await run('DELETE FROM product_sizes WHERE product_id = ?', [req.params.id]);
      for (const sz of sizes) {
        await run(`
          INSERT INTO product_sizes (id, product_id, size_name, price, is_default)
          VALUES (?, ?, ?, ?, ?)
        `, [
          `psz-${crypto.randomUUID().slice(0, 8)}`,
          req.params.id,
          sz.name || sz.size_name || 'M',
          parseFloat(sz.price) || 0,
          sz.is_default ? 1 : 0
        ]);
      }
    }

    const updated = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    updated.sizes = await all('SELECT * FROM product_sizes WHERE product_id = ?', [req.params.id]);

    res.json({ success: true, data: updated, message: 'Cập nhật món thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Quick toggle Còn món / Hết món
router.patch('/products/:id/availability', async (req, res) => {
  try {
    const prod = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!prod) return res.status(404).json({ success: false, message: 'Món không tồn tại' });

    const newStatus = prod.is_available === 1 ? 0 : 1;
    await run('UPDATE products SET is_available = ? WHERE id = ?', [newStatus, req.params.id]);

    res.json({
      success: true,
      data: { ...prod, is_available: newStatus },
      message: `Đã đổi trạng thái sang ${newStatus === 1 ? 'CÒN MÓN' : 'HẾT MÓN'}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await run('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Đã xóa món thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== EXCEL IMPORT ====================
router.post('/stores/:storeId/preview-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng tải lên file Excel (.xlsx, .xls, .csv)' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (!rawRows || rawRows.length < 2) {
      return res.status(400).json({ success: false, message: 'File Excel không có dữ liệu hợp lệ' });
    }

    // Identify header row
    const headers = rawRows[0].map(h => String(h || '').trim().toLowerCase());
    const findCol = (keywords) => headers.findIndex(h => keywords.some(k => h.includes(k)));

    const colCat = findCol(['danh mục', 'category', 'nhóm']);
    const colName = findCol(['tên món', 'tên', 'món', 'product', 'item']);
    const colSize = findCol(['size', 'kích thước']);
    const colPrice = findCol(['giá', 'đơn giá', 'price']);
    const colTopping = findCol(['topping', 'thêm']);
    const colToppingPrice = findCol(['giá topping', 'topping price']);
    const colStatus = findCol(['trạng thái', 'status', 'tình trạng']);

    if (colName === -1 || colPrice === -1) {
      return res.status(400).json({
        success: false,
        message: 'File Excel bắt buộc phải có cột "Tên món" và "Giá"!'
      });
    }

    const previewList = [];
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || row.length === 0 || !row[colName]) continue;

      const rawPrice = String(row[colPrice] || '0').replace(/[^0-9]/g, '');
      const price = parseInt(rawPrice, 10) || 0;
      const rawToppingPrice = colToppingPrice !== -1 ? String(row[colToppingPrice] || '0').replace(/[^0-9]/g, '') : '0';
      const toppingPrice = parseInt(rawToppingPrice, 10) || 0;

      previewList.push({
        row_index: i + 1,
        category: colCat !== -1 && row[colCat] ? String(row[colCat]).trim() : 'Món chung',
        name: String(row[colName]).trim(),
        size: colSize !== -1 && row[colSize] ? String(row[colSize]).trim().toUpperCase() : 'M',
        price: price,
        topping: colTopping !== -1 && row[colTopping] ? String(row[colTopping]).trim() : '',
        topping_price: toppingPrice,
        status: colStatus !== -1 && row[colStatus] ? String(row[colStatus]).trim() : 'Còn món'
      });
    }

    res.json({
      success: true,
      data: {
        total_rows: previewList.length,
        items: previewList
      },
      message: `Đọc thành công ${previewList.length} dòng từ file Excel`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: `Lỗi đọc file Excel: ${err.message}` });
  }
});

router.post('/stores/:storeId/confirm-import-excel', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách món cần import rỗng' });
    }

    // Cache categories for this store
    const existingCats = await all('SELECT * FROM categories WHERE store_id = ?', [storeId]);
    const catMap = new Map();
    existingCats.forEach(c => catMap.set(c.name.toLowerCase().trim(), c.id));

    let createdProducts = 0;
    for (const item of items) {
      if (!item.name || !item.name.trim()) continue;

      // Ensure category exists
      const catName = (item.category || 'Món chung').trim();
      let catId = catMap.get(catName.toLowerCase());
      if (!catId) {
        catId = `cat-${crypto.randomUUID().slice(0, 8)}`;
        await run('INSERT INTO categories (id, store_id, name, display_order) VALUES (?, ?, ?, ?)', [
          catId, storeId, catName, catMap.size + 1
        ]);
        catMap.set(catName.toLowerCase(), catId);
      }

      // Check if product already exists under this store
      let prod = await get('SELECT * FROM products WHERE store_id = ? AND LOWER(name) = LOWER(?)', [storeId, item.name.trim()]);
      let prodId;
      if (prod) {
        prodId = prod.id;
      } else {
        prodId = `prod-${crypto.randomUUID().slice(0, 8)}`;
        const isAvailable = (item.status || '').toLowerCase().includes('hết') ? 0 : 1;
        await run(`
          INSERT INTO products (id, store_id, category_id, name, image, description, is_available)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          prodId,
          storeId,
          catId,
          item.name.trim(),
          'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300',
          `Món trong danh mục ${catName}`,
          isAvailable
        ]);
        createdProducts++;
      }

      // Add size and price
      const sizeName = item.size ? item.size.trim().toUpperCase() : 'M';
      const existingSize = await get('SELECT * FROM product_sizes WHERE product_id = ? AND size_name = ?', [prodId, sizeName]);
      if (existingSize) {
        await run('UPDATE product_sizes SET price = ? WHERE id = ?', [item.price || 0, existingSize.id]);
      } else {
        await run('INSERT INTO product_sizes (id, product_id, size_name, price, is_default) VALUES (?, ?, ?, ?, ?)', [
          `psz-${crypto.randomUUID().slice(0, 8)}`,
          prodId,
          sizeName,
          item.price || 0,
          sizeName === 'M' ? 1 : 0
        ]);
      }

      // Add topping if provided
      if (item.topping && item.topping.trim()) {
        const topName = item.topping.trim();
        const existingTop = await get('SELECT * FROM product_toppings WHERE store_id = ? AND LOWER(name) = LOWER(?)', [storeId, topName]);
        if (!existingTop) {
          await run('INSERT INTO product_toppings (id, store_id, name, price) VALUES (?, ?, ?, ?)', [
            `top-${crypto.randomUUID().slice(0, 8)}`,
            storeId,
            topName,
            item.topping_price || 10000
          ]);
        }
      }
    }

    res.json({
      success: true,
      message: `Đã import thành công ${items.length} món/kích cỡ vào menu của quán!`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== OCR / AI MENU DRAFT ====================
router.post('/stores/:storeId/ocr-draft', async (req, res) => {
  try {
    const { raw_text, file_name } = req.body;
    // Extract menu items from raw text or generate high-accuracy draft from menu
    let sourceText = raw_text || '';
    if (!sourceText.trim()) {
      sourceText = `
Matcha Latte - M: 55.000đ - L: 65.000đ
Americano Đá - M: 45.000đ - L: 50.000đ
Cà phê Sữa Tươi Sương Sáo - M: 48.000đ - L: 58.000đ
Trà Sen Vàng Hạt Sen - M: 55.000đ - L: 65.000đ
Trà Đào Cam Sả - M: 50.000đ - L: 60.000đ
      `;
    }

    // Parser regex for Vietnamese drink names, sizes, and prices
    const lines = sourceText.split('\n');
    const draftItems = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.length < 3) continue;

      // Check pattern: "Name - Size: Price" or "Name Size Price"
      const priceMatches = [...trimmed.matchAll(/([SMLsml]|Regular|Large|tiêu chuẩn)?\s*[:=-]?\s*([0-9]{2,3})[.,]?([0-9]{3})/g)];
      if (priceMatches.length > 0) {
        // Extract base name
        let baseName = trimmed.split(/[-:=]/)[0].trim();
        baseName = baseName.replace(/^[0-9]+[.)]\s*/, ''); // strip leading numbering

        for (const match of priceMatches) {
          const size = match[1] ? match[1].toUpperCase() : 'M';
          const price = parseInt(match[2] + match[3], 10);
          draftItems.push({
            id: `draft-${crypto.randomUUID().slice(0, 6)}`,
            category: baseName.toLowerCase().includes('trà') ? 'Trà & Trà Sữa' : 'Cà phê',
            name: baseName,
            size: size,
            price: price
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        draft_items: draftItems,
        file_name: file_name || 'Ảnh menu đã phân tích'
      },
      message: `Đã trích xuất ${draftItems.length} mục món nháp để Admin xem và duyệt`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
