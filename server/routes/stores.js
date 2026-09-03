import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const name = `logo_${Date.now()}_${Math.floor(Math.random()*1000)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

// Helper to convert base64 image data URL to a static stored file
function processLogoDataUrl(logoStr, storeId) {
  if (!logoStr || !logoStr.startsWith('data:image')) return logoStr;

  try {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'logos');
    const distUploadDir = path.join(__dirname, '..', '..', 'dist', 'uploads', 'logos');
    
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    if (!fs.existsSync(distUploadDir)) fs.mkdirSync(distUploadDir, { recursive: true });

    const matches = logoStr.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return logoStr;

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const filename = `store_logo_${storeId || 'new'}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);
    const distFilePath = path.join(distUploadDir, filename);

    const buffer = Buffer.from(matches[2], 'base64');
    fs.writeFileSync(filePath, buffer);
    fs.writeFileSync(distFilePath, buffer);

    return `/uploads/logos/${filename}`;
  } catch (err) {
    console.error('Error saving logo file:', err);
    return logoStr;
  }
}

// Upload Company Logo Endpoint
router.post('/company-logo', upload.single('logo'), (req, res) => {
  const publicPath = path.join(__dirname, '..', '..', 'public', 'company_logo.png');
  const distPath = path.join(__dirname, '..', '..', 'dist', 'company_logo.png');

  try {
    if (req.file) {
      fs.copyFileSync(req.file.path, publicPath);
      if (fs.existsSync(path.join(__dirname, '..', '..', 'dist'))) {
        fs.copyFileSync(req.file.path, distPath);
      }
    } else if (req.body.logo && req.body.logo.startsWith('data:image')) {
      const base64Data = req.body.logo.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(publicPath, buffer);
      if (fs.existsSync(path.join(__dirname, '..', '..', 'dist'))) {
        fs.writeFileSync(distPath, buffer);
      }
    }

    const timestamp = Date.now();
    const logoUrl = `/company_logo.png?t=${timestamp}`;

    db.prepare("INSERT OR REPLACE INTO system_settings (key, value) VALUES ('company_logo', ?)").run(logoUrl);

    res.json({ success: true, message: 'Đã cập nhật Logo công ty thành công!', logoUrl });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lưu logo công ty: ' + err.message });
  }
});

// Get all stores with menu file count & product count
router.get('/', (req, res) => {
  const stores = db.prepare('SELECT * FROM stores ORDER BY id DESC').all();
  const result = stores.map(store => {
    const delivery = db.prepare('SELECT * FROM delivery_profiles WHERE store_id = ?').get(store.id);
    const menuFiles = db.prepare('SELECT * FROM store_menu_files WHERE store_id = ? ORDER BY page_number ASC').all(store.id);
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products WHERE store_id = ?').get(store.id)?.count || 0;

    return {
      ...store,
      delivery: delivery || {
        recipient_name: '',
        recipient_phone: '',
        delivery_address: '',
        delivery_time: '',
        delivery_note: ''
      },
      menuFiles,
      productCount
    };
  });

  res.json(result);
});

// Get single store detailed details
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const store = db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
  if (!store) return res.status(404).json({ message: 'Không tìm thấy quán!' });

  const delivery = db.prepare('SELECT * FROM delivery_profiles WHERE store_id = ?').get(id);
  const menuFiles = db.prepare('SELECT * FROM store_menu_files WHERE store_id = ? ORDER BY page_number ASC').all(id);
  const categories = db.prepare('SELECT * FROM categories WHERE store_id = ? ORDER BY sort_order ASC').all(id);

  res.json({
    ...store,
    delivery: delivery || {},
    menuFiles,
    categories
  });
});

// Create Store
router.post('/', (req, res) => {
  const { name, logo, cover_image, address, phone, note, recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note } = req.body;

  if (!name) return res.status(400).json({ message: 'Tên quán là bắt buộc!' });

  const processedLogo = processLogoDataUrl(logo, Date.now());

  const storeRes = db.prepare(`
    INSERT INTO stores (name, logo, cover_image, address, phone, note, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(name, processedLogo || null, cover_image || null, address || null, phone || null, note || null);

  const storeId = storeRes.lastInsertRowid;

  // Insert default delivery profile
  db.prepare(`
    INSERT INTO delivery_profiles (store_id, recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    storeId,
    recipient_name || '',
    recipient_phone || '',
    delivery_address || address || 'Cổng sau công ty Phú Cường - Số 1 Hà Huy Tập, Rạch Giá',
    delivery_time || '10:30',
    delivery_note || ''
  );

  const newStore = db.prepare('SELECT * FROM stores WHERE id = ?').get(storeId);
  res.json(newStore);
});

// Update Store (PERSISTS LOGO TO DISK & DATABASE)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, logo, cover_image, address, phone, note, is_active } = req.body;

  const processedLogo = processLogoDataUrl(logo, id);

  db.prepare(`
    UPDATE stores
    SET name = ?, logo = ?, cover_image = ?, address = ?, phone = ?, note = ?, is_active = ?
    WHERE id = ?
  `).run(name, processedLogo, cover_image, address, phone, note, is_active ? 1 : 0, id);

  const updated = db.prepare('SELECT * FROM stores WHERE id = ?').get(id);
  res.json(updated);
});

// Update Default Delivery Profile for Store
router.put('/:id/delivery-default', (req, res) => {
  const { id } = req.params;
  const { recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note } = req.body;

  const existing = db.prepare('SELECT id FROM delivery_profiles WHERE store_id = ?').get(id);
  if (existing) {
    db.prepare(`
      UPDATE delivery_profiles
      SET recipient_name = ?, recipient_phone = ?, delivery_address = ?, delivery_time = ?, delivery_note = ?
      WHERE store_id = ?
    `).run(recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note, id);
  } else {
    db.prepare(`
      INSERT INTO delivery_profiles (store_id, recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, recipient_name, recipient_phone, delivery_address, delivery_time, delivery_note);
  }

  res.json({ success: true, message: 'Đã cập nhật thông tin giao hàng mặc định của quán!' });
});

// Upload Menu Files for Store
router.post('/:id/menu-files', upload.array('files', 10), (req, res) => {
  const { id } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: 'Không có file nào được gửi lên!' });
  }

  const existingFiles = db.prepare('SELECT COUNT(*) as count FROM store_menu_files WHERE store_id = ?').get(id)?.count || 0;
  let pageNum = existingFiles + 1;

  const inserted = [];
  for (const file of req.files) {
    const relativePath = `/uploads/logos/${file.filename}`;
    const info = db.prepare(`
      INSERT INTO store_menu_files (store_id, file_name, file_path, file_type, page_number)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, file.originalname, relativePath, file.mimetype, pageNum++);

    inserted.push(db.prepare('SELECT * FROM store_menu_files WHERE id = ?').get(info.lastInsertRowid));
  }

  res.json(inserted);
});

// Add Menu File by URL (e.g. image link)
router.post('/:id/menu-files-url', (req, res) => {
  const { id } = req.params;
  const { url, name } = req.body;

  if (!url) return res.status(400).json({ message: 'URL không hợp lệ' });

  const existingFiles = db.prepare('SELECT COUNT(*) as count FROM store_menu_files WHERE store_id = ?').get(id)?.count || 0;
  const pageNum = existingFiles + 1;

  const info = db.prepare(`
    INSERT INTO store_menu_files (store_id, file_name, file_path, file_type, page_number)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name || `Trang menu ${pageNum}`, url, 'image/jpeg', pageNum);

  const file = db.prepare('SELECT * FROM store_menu_files WHERE id = ?').get(info.lastInsertRowid);
  res.json(file);
});

// Delete Menu File
router.delete('/menu-files/:fileId', (req, res) => {
  const { fileId } = req.params;
  db.prepare('DELETE FROM store_menu_files WHERE id = ?').run(fileId);
  res.json({ success: true, fileId: Number(fileId) });
});

// Delete Store
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM stores WHERE id = ?').run(id);
  res.json({ success: true, id: Number(id) });
});

export default router;
