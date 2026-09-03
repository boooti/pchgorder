import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import db from '../db.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get products by store (with categories, sizes & toppings)
router.get('/', (req, res) => {
  const { storeId } = req.query;
  if (!storeId) return res.status(400).json({ message: 'storeId là bắt buộc!' });

  const categories = db.prepare('SELECT * FROM categories WHERE store_id = ? ORDER BY sort_order ASC, id ASC').all(storeId);
  const products = db.prepare('SELECT * FROM products WHERE store_id = ? ORDER BY sort_order ASC, id ASC').all(storeId);
  const toppings = db.prepare('SELECT * FROM product_toppings WHERE store_id = ? ORDER BY id ASC').all(storeId);

  const productList = products.map(p => {
    const sizes = db.prepare('SELECT * FROM product_sizes WHERE product_id = ?').all(p.id);
    return {
      ...p,
      sizes
    };
  });

  res.json({
    categories,
    products: productList,
    toppings
  });
});

// Create product (with sizes)
router.post('/', (req, res) => {
  const { store_id, category_id, name, description, image, is_available, sizes } = req.body;

  if (!store_id || !name) {
    return res.status(400).json({ message: 'store_id và tên món là bắt buộc!' });
  }

  const pRes = db.prepare(`
    INSERT INTO products (store_id, category_id, name, description, image, is_available)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(store_id, category_id || null, name, description || '', image || null, is_available !== undefined ? (is_available ? 1 : 0) : 1);

  const productId = pRes.lastInsertRowid;

  if (Array.isArray(sizes) && sizes.length > 0) {
    for (const s of sizes) {
      if (s.size_name && s.price !== undefined) {
        db.prepare('INSERT INTO product_sizes (product_id, size_name, price) VALUES (?, ?, ?)').run(productId, s.size_name, Number(s.price));
      }
    }
  } else {
    db.prepare('INSERT INTO product_sizes (product_id, size_name, price) VALUES (?, ?, ?)').run(productId, 'M', 35000);
  }

  const newProd = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  newProd.sizes = db.prepare('SELECT * FROM product_sizes WHERE product_id = ?').all(productId);

  res.json(newProd);
});

// Update product
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { category_id, name, description, image, is_available, sizes } = req.body;

  db.prepare(`
    UPDATE products
    SET category_id = ?, name = ?, description = ?, image = ?, is_available = ?
    WHERE id = ?
  `).run(category_id || null, name, description || '', image || null, is_available ? 1 : 0, id);

  if (Array.isArray(sizes)) {
    db.prepare('DELETE FROM product_sizes WHERE product_id = ?').run(id);
    for (const s of sizes) {
      if (s.size_name && s.price !== undefined) {
        db.prepare('INSERT INTO product_sizes (product_id, size_name, price) VALUES (?, ?, ?)').run(id, s.size_name, Number(s.price));
      }
    }
  }

  const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  updated.sizes = db.prepare('SELECT * FROM product_sizes WHERE product_id = ?').all(id);

  res.json(updated);
});

// Toggle Available Status
router.patch('/:id/toggle-available', (req, res) => {
  const { id } = req.params;
  const p = db.prepare('SELECT is_available FROM products WHERE id = ?').get(id);
  if (!p) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

  const newStatus = p.is_available ? 0 : 1;
  db.prepare('UPDATE products SET is_available = ? WHERE id = ?').run(newStatus, id);

  res.json({ id: Number(id), is_available: newStatus });
});

// Delete Product
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  res.json({ success: true, id: Number(id) });
});

// Categories (Create, Update, Delete)
router.post('/categories', (req, res) => {
  const { store_id, name } = req.body;
  if (!store_id || !name) return res.status(400).json({ message: 'Thiếu thông tin danh mục' });

  const info = db.prepare('INSERT INTO categories (store_id, name) VALUES (?, ?)').run(store_id, name);
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
  res.json(cat);
});

router.put('/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, sort_order } = req.body;
  if (!name) return res.status(400).json({ message: 'Tên danh mục là bắt buộc!' });

  db.prepare('UPDATE categories SET name = ?, sort_order = ? WHERE id = ?').run(name, sort_order || 0, id);
  const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.json(updated);
});

router.delete('/categories/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM categories WHERE id = ?').run(id);
  // Also unassign products from deleted category
  db.prepare('UPDATE products SET category_id = NULL WHERE category_id = ?').run(id);
  res.json({ success: true, id: Number(id) });
});

// Toppings
router.post('/toppings', (req, res) => {
  const { store_id, topping_name, price } = req.body;
  if (!store_id || !topping_name) return res.status(400).json({ message: 'Thiếu thông tin topping' });

  const info = db.prepare('INSERT INTO product_toppings (store_id, topping_name, price, is_available) VALUES (?, ?, ?, 1)').run(store_id, topping_name, Number(price) || 0);
  const topping = db.prepare('SELECT * FROM product_toppings WHERE id = ?').get(info.lastInsertRowid);
  res.json(topping);
});

router.delete('/toppings/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM product_toppings WHERE id = ?').run(id);
  res.json({ success: true });
});

// --- OCR / AI MENU PARSER SIMULATOR ---
router.post('/parse-ocr', (req, res) => {
  const { storeId } = req.body;
  if (!storeId) return res.status(400).json({ message: 'storeId là bắt buộc!' });

  const store = db.prepare('SELECT name FROM stores WHERE id = ?').get(storeId);
  const storeName = store ? store.name : 'Quán';

  const draftItems = [
    { category: 'Cà Phê', name: `${storeName} Đặc Biệt`, size: 'M', price: 45000, description: 'Món đặc sản của quán' },
    { category: 'Trà Sữa', name: 'Trà Sữa Khoai Môn', size: 'M', price: 48000, description: 'Thơm dẻo vị khoai môn' }
  ];

  res.json({
    success: true,
    message: 'Phân tích menu thành công!',
    draftItems
  });
});

// --- EXCEL IMPORT MENU ---
router.post('/import-excel', upload.single('file'), (req, res) => {
  const { storeId } = req.body;
  if (!storeId) return res.status(400).json({ message: 'storeId là bắt buộc!' });

  let rows = [];

  if (req.file) {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json(worksheet);
  } else if (req.body.items && Array.isArray(req.body.items)) {
    rows = req.body.items;
  } else {
    return res.status(400).json({ message: 'Vui lòng cung cấp file Excel hoặc danh sách món!' });
  }

  if (rows.length === 0) {
    return res.status(400).json({ message: 'File Excel không có dữ liệu!' });
  }

  let importedCount = 0;
  const categoryMap = new Map();

  for (const row of rows) {
    const catName = row['Danh mục'] || row['Category'] || row['category'] || 'Khác';
    const prodName = row['Tên món'] || row['Món'] || row['name'] || row['Name'];
    const sizeName = row['Size'] || row['size'] || 'M';
    const price = Number(row['Giá'] || row['price'] || row['Đơn giá'] || 35000);
    const toppingName = row['Topping'] || row['topping'];
    const toppingPrice = Number(row['Giá topping'] || row['topping_price'] || 10000);

    if (!prodName) continue;

    let catId = categoryMap.get(catName);
    if (!catId) {
      const existingCat = db.prepare('SELECT id FROM categories WHERE store_id = ? AND name = ?').get(storeId, catName);
      if (existingCat) {
        catId = existingCat.id;
      } else {
        const cRes = db.prepare('INSERT INTO categories (store_id, name) VALUES (?, ?)').run(storeId, catName);
        catId = cRes.lastInsertRowid;
      }
      categoryMap.set(catName, catId);
    }

    let prod = db.prepare('SELECT id FROM products WHERE store_id = ? AND name = ?').get(storeId, prodName);
    let prodId;
    if (prod) {
      prodId = prod.id;
    } else {
      const pRes = db.prepare(`
        INSERT INTO products (store_id, category_id, name, description, is_available)
        VALUES (?, ?, ?, '', 1)
      `).run(storeId, catId, prodName);
      prodId = pRes.lastInsertRowid;
      importedCount++;
    }

    const existingSize = db.prepare('SELECT id FROM product_sizes WHERE product_id = ? AND size_name = ?').get(prodId, sizeName);
    if (!existingSize) {
      db.prepare('INSERT INTO product_sizes (product_id, size_name, price) VALUES (?, ?, ?)').run(prodId, sizeName, price);
    } else {
      db.prepare('UPDATE product_sizes SET price = ? WHERE id = ?').run(price, existingSize.id);
    }

    if (toppingName) {
      const existingTop = db.prepare('SELECT id FROM product_toppings WHERE store_id = ? AND topping_name = ?').get(storeId, toppingName);
      if (!existingTop) {
        db.prepare('INSERT INTO product_toppings (store_id, topping_name, price, is_available) VALUES (?, ?, ?, 1)').run(storeId, toppingName, toppingPrice);
      }
    }
  }

  res.json({
    success: true,
    message: `Đã import thành công ${importedCount} món mới vào menu của quán!`,
    importedCount
  });
});

export default router;
