const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_PATH = path.join(DATA_DIR, 'drink_order.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

// Promisified wrappers
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initSchema() {
  await run('PRAGMA foreign_keys = ON');
  await run('PRAGMA journal_mode = WAL');

  await run(`
    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      department TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      logo TEXT,
      cover_image TEXT,
      address TEXT,
      phone TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS delivery_profiles (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      recipient_name TEXT,
      recipient_phone TEXT,
      delivery_address TEXT,
      desired_delivery_time TEXT,
      delivery_notes TEXT,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS store_menu_files (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      page_order INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      name TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      category_id TEXT,
      name TEXT NOT NULL,
      image TEXT,
      description TEXT,
      is_available INTEGER DEFAULT 1,
      allow_sugar INTEGER DEFAULT 1,
      allow_ice INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS product_sizes (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      size_name TEXT NOT NULL,
      price REAL NOT NULL,
      is_default INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS product_toppings (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS daily_order_sessions (
      id TEXT PRIMARY KEY,
      session_date TEXT NOT NULL,
      store_id TEXT NOT NULL,
      status TEXT DEFAULT 'OPEN',
      open_time TEXT,
      close_time TEXT,
      notes TEXT,
      recipient_name_snapshot TEXT,
      recipient_phone_snapshot TEXT,
      delivery_address_snapshot TEXT,
      delivery_time_snapshot TEXT,
      delivery_note_snapshot TEXT,
      sponsor_type TEXT DEFAULT 'SELF',
      sponsor_name TEXT,
      title TEXT DEFAULT 'Phiên Toàn Công Ty',
      created_by_employee_id TEXT,
      scope_type TEXT DEFAULT 'ALL',
      eligible_departments TEXT,
      eligible_employee_ids TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id),
      FOREIGN KEY (created_by_employee_id) REFERENCES employees(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      total_amount REAL NOT NULL DEFAULT 0,
      subsidy_amount REAL NOT NULL DEFAULT 0,
      employee_paid_amount REAL NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'CONFIRMED',
      is_paid INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES daily_order_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      store_name_snapshot TEXT,
      product_name_snapshot TEXT NOT NULL,
      size_snapshot TEXT NOT NULL,
      unit_price_snapshot REAL NOT NULL,
      topping_snapshot TEXT,
      topping_price_snapshot REAL DEFAULT 0,
      options_snapshot TEXT,
      item_total_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Default settings
  const defaultTemplate = `ORDER NƯỚC - {STORE_NAME}
Ngày: {DATE}

{ORDER_ITEMS}

TỔNG: {TOTAL_CUPS} LY
TỔNG TIỀN: {TOTAL_AMOUNT}đ

THÔNG TIN GIAO HÀNG
Người nhận: {RECIPIENT_NAME}
SĐT: {RECIPIENT_PHONE}
Địa chỉ: {DELIVERY_ADDRESS}
Giờ giao: {DELIVERY_TIME}
Ghi chú: {DELIVERY_NOTE}`;

  const defaultSubsidy = JSON.stringify({
    enabled: true,
    amount_per_person: 20000
  });

  const defaultAdmin = JSON.stringify({
    pin: 'admin123'
  });

  await run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('message_template', ?)`, [defaultTemplate]);
  await run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('subsidy', ?)`, [defaultSubsidy]);
  await run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_auth', ?)`, [defaultAdmin]);

  // Migration for daily_order_sessions
  try {
    const sessionCols = await all(`PRAGMA table_info(daily_order_sessions)`);
    const colNames = sessionCols.map(c => c.name);
    if (!colNames.includes('sponsor_type')) {
      await run(`ALTER TABLE daily_order_sessions ADD COLUMN sponsor_type TEXT DEFAULT 'SELF'`);
    }
    if (!colNames.includes('sponsor_name')) {
      await run(`ALTER TABLE daily_order_sessions ADD COLUMN sponsor_name TEXT`);
    }
    if (!colNames.includes('title')) {
      await run(`ALTER TABLE daily_order_sessions ADD COLUMN title TEXT DEFAULT 'Phiên Toàn Công Ty'`);
    }
    if (!colNames.includes('created_by_employee_id')) {
      await run(`ALTER TABLE daily_order_sessions ADD COLUMN created_by_employee_id TEXT`);
    }
    if (!colNames.includes('scope_type')) {
      await run(`ALTER TABLE daily_order_sessions ADD COLUMN scope_type TEXT DEFAULT 'ALL'`);
    }
    if (!colNames.includes('eligible_departments')) {
      await run(`ALTER TABLE daily_order_sessions ADD COLUMN eligible_departments TEXT`);
    }
    if (!colNames.includes('eligible_employee_ids')) {
      await run(`ALTER TABLE daily_order_sessions ADD COLUMN eligible_employee_ids TEXT`);
    }

    // Migration for orders
    const orderCols = await all(`PRAGMA table_info(orders)`);
    const orderColNames = orderCols.map(c => c.name);
    if (!orderColNames.includes('is_paid')) {
      await run(`ALTER TABLE orders ADD COLUMN is_paid INTEGER DEFAULT 0`);
    }

    // Migration for employees (password protection & first-login prompt)
    const empCols = await all(`PRAGMA table_info(employees)`);
    const empColNames = empCols.map(c => c.name);
    if (!empColNames.includes('password')) {
      await run(`ALTER TABLE employees ADD COLUMN password TEXT`);
    }
    if (!empColNames.includes('has_asked_password')) {
      await run(`ALTER TABLE employees ADD COLUMN has_asked_password INTEGER DEFAULT 0`);
    }

    // Auto-sync 47 active employees
    const syncEmployees = [
      { id: 'emp-03', name: 'Lâm Hoàng Lam', phone: '0903456789', department: 'Ban GĐ' },
      { id: 'emp-14', name: 'Nguyễn Ngọc Nguyên', phone: '0914567890', department: 'Đầu tư - Pháp lý' },
      { id: 'emp-15', name: 'Trần Thị Hương', phone: '0915678901', department: 'Đầu tư - Pháp lý' },
      { id: 'emp-16', name: 'Trần Thị Trinh', phone: '0916789012', department: 'Đầu tư - Pháp lý' },
      { id: 'emp-17', name: 'Hồ Huy Toàn', phone: '0917890123', department: 'Đầu tư - Pháp lý' },
      { id: 'emp-18', name: 'Lê Long Giang', phone: '0918901234', department: 'Đầu tư - Pháp lý' },
      { id: 'emp-19', name: 'Thị Yến Linh', phone: '0919012345', department: 'Đầu tư - Pháp lý' },
      { id: 'emp-20', name: 'Nguyễn Văn Công', phone: '0920123456', department: 'Phòng BIM' },
      { id: 'emp-21', name: 'Trần Văn Nhựt Cường', phone: '0921234567', department: 'Phòng BIM' },
      { id: 'emp-22', name: 'Trương Đình Thi', phone: '0922345678', department: 'Phòng BIM' },
      { id: 'emp-23', name: 'Trần Văn Sua', phone: '0923456789', department: 'Phòng BIM' },
      { id: 'emp-24', name: 'Nguyễn Thị Minh Thư', phone: '0924567890', department: 'Phòng BIM' },
      { id: 'emp-25', name: 'Hưng Tấn Đạt', phone: '0925678901', department: 'Phòng BIM' },
      { id: 'emp-26', name: 'Nguyễn Hồng Ái', phone: '0926789012', department: 'Phòng BIM' },
      { id: 'emp-27', name: 'Đồng Hữu Phú', phone: '0927890123', department: 'Phòng BIM' },
      { id: 'emp-28', name: 'Trần Minh Đăng', phone: '0928901234', department: 'Phòng BIM' },
      { id: 'emp-29', name: 'Dư Văn Đạt', phone: '0929012345', department: 'Phòng BIM' },
      { id: 'emp-30', name: 'Nguyễn Kiều Tiên', phone: '0930123456', department: 'Phòng BIM' },
      { id: 'emp-31', name: 'Phạm Bình An', phone: '0931234567', department: 'Phòng BIM' },
      { id: 'emp-32', name: 'Huỳnh Tấn Lộc', phone: '0932345678', department: 'Phòng BIM' },
      { id: 'emp-33', name: 'Lâm Thiên Phú', phone: '0933456789', department: 'Phòng BIM' },
      { id: 'emp-34', name: 'Trần Thị Diễm Linh', phone: '0934567890', department: 'Tài chính - Nhân sự' },
      { id: 'emp-35', name: 'Vũ Huỳnh Như Ý', phone: '0935678901', department: 'Tài chính - Nhân sự' },
      { id: 'emp-36', name: 'Nguyễn Phương Loan', phone: '0936789012', department: 'Tài chính - Nhân sự' },
      { id: 'emp-37', name: 'Trần Chí Hậu', phone: '0937890123', department: 'Tài chính - Nhân sự' },
      { id: 'emp-38', name: 'Trần Võ Phương Nghi', phone: '0938901234', department: 'Tài chính - Nhân sự' },
      { id: 'emp-39', name: 'Trần Thị Nhung', phone: '0939012345', department: 'Phòng Kinh doanh' },
      { id: 'emp-40', name: 'Đào Thị Huyền Trân', phone: '0940123456', department: 'Tài chính - Nhân sự' },
      { id: 'emp-41', name: 'Nguyễn Tất Vũ', phone: '0941234567', department: 'Phòng Kinh doanh' },
      { id: 'emp-42', name: 'Thị Mỹ Duyên', phone: '0942234567', department: 'Tài chính - Nhân sự' },
      { id: 'emp-43', name: 'Nguyễn Thị Kim Yến', phone: '0943234567', department: 'Ban GĐ' },
      { id: 'emp-04', name: 'Vũ Đăng Trình', phone: '0904567890', department: 'BQLDA' },
      { id: 'emp-05', name: 'Nguyễn Tam Giác', phone: '0905678901', department: 'BQLDA' },
      { id: 'emp-06', name: 'Trần Trung Tiến', phone: '0906789012', department: 'BQLDA' },
      { id: 'emp-07', name: 'Trương Vĩnh Thế', phone: '0907890123', department: 'BQLDA' },
      { id: 'emp-08', name: 'Du Vinh Huê', phone: '0908901234', department: 'BQLDA' },
      { id: 'emp-09', name: 'Lê Minh Đăng', phone: '0909012345', department: 'BQLDA' },
      { id: 'emp-10', name: 'Phan Văn Nhân', phone: '0910123456', department: 'BQLDA' },
      { id: 'emp-11', name: 'Đoàn Tuấn Anh', phone: '0911234567', department: 'BQLDA' },
      { id: 'emp-12', name: 'Nguyễn Văn Chiến', phone: '0912345678', department: 'BQLDA' },
      { id: 'emp-13', name: 'Trần Thanh Tiến', phone: '0913456789', department: 'BQLDA' },
      { id: 'emp-44', name: 'Lê Văn Hóa', phone: '0944234567', department: 'BQLDA' },
      { id: 'emp-45', name: 'Lâm Vĩ Khang', phone: '0945234567', department: 'BQLDA' },
      { id: 'emp-46', name: 'Nguyễn Minh Trí', phone: '0946234567', department: 'BQLDA' },
      { id: 'emp-47', name: 'Đinh Đặng Hồng Vĩ', phone: '0947234567', department: 'BQLDA' },
      { id: 'emp-48', name: 'Nguyễn Quang Đủ', phone: '0948234567', department: 'BQLDA' },
      { id: 'emp-49', name: 'Lê Đình Thạnh', phone: '0949234567', department: 'BQLDA' }
    ];

    const validIds = syncEmployees.map(e => e.id);
    await run(`UPDATE employees SET is_active = 0 WHERE id NOT IN (${validIds.map(() => '?').join(',')})`, validIds);

    for (const e of syncEmployees) {
      const existing = await get('SELECT id FROM employees WHERE id = ?', [e.id]);
      if (existing) {
        await run('UPDATE employees SET name = ?, department = ?, is_active = 1 WHERE id = ?', [e.name, e.department, e.id]);
      } else {
        await run('INSERT INTO employees (id, name, phone, department, is_active) VALUES (?, ?, ?, ?, 1)', [e.id, e.name, e.phone, e.department]);
      }
    }
  } catch (migErr) {
    console.warn('Migration note:', migErr.message);
  }

  console.log('Database initialized successfully.');
}

module.exports = {
  db,
  run,
  get,
  all,
  initSchema,
  DATA_DIR,
  UPLOADS_DIR,
  DB_PATH
};
