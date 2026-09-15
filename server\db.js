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
