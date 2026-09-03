import initSqlJs from 'sql.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '..', 'uploads', 'menus');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'company_order.db');

const SQL = await initSqlJs();

let sqlDb;
if (fs.existsSync(dbPath)) {
  const filebuffer = fs.readFileSync(dbPath);
  sqlDb = new SQL.Database(filebuffer);
} else {
  sqlDb = new SQL.Database();
}

function saveDb() {
  const data = sqlDb.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

const dbWrapper = {
  exec(sql) {
    sqlDb.exec(sql);
    saveDb();
  },
  prepare(sql) {
    return {
      run(...params) {
        const actualParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = sqlDb.prepare(sql);
        stmt.bind(actualParams);
        stmt.step();
        stmt.free();
        
        const idRes = sqlDb.exec("SELECT last_insert_rowid() as id, total_changes() as changes");
        const lastInsertRowid = idRes.length && idRes[0].values.length ? idRes[0].values[0][0] : 0;
        const changes = idRes.length && idRes[0].values.length ? idRes[0].values[0][1] : 0;
        
        saveDb();
        return { lastInsertRowid, changes };
      },
      get(...params) {
        const actualParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = sqlDb.prepare(sql);
        stmt.bind(actualParams);
        let row = null;
        if (stmt.step()) {
          const obj = stmt.getAsObject();
          row = obj;
        }
        stmt.free();
        return row;
      },
      all(...params) {
        const actualParams = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const stmt = sqlDb.prepare(sql);
        stmt.bind(actualParams);
        const rows = [];
        while (stmt.step()) {
          rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
      }
    };
  }
};

export function initDb() {
  dbWrapper.exec(`
    -- Settings table
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Employees table
    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      department TEXT,
      avatar TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Stores table
    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT,
      cover_image TEXT,
      address TEXT,
      phone TEXT,
      note TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Default Delivery Profiles table per store
    CREATE TABLE IF NOT EXISTS delivery_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER UNIQUE NOT NULL,
      recipient_name TEXT,
      recipient_phone TEXT,
      delivery_address TEXT,
      delivery_time TEXT,
      delivery_note TEXT,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    );

    -- Menu Original Files (Uploaded images/PDFs per store)
    CREATE TABLE IF NOT EXISTS store_menu_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      page_number INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    );

    -- Categories per Store
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    );

    -- Products per Store
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      category_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      image TEXT,
      is_available INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    -- Product Sizes
    CREATE TABLE IF NOT EXISTS product_sizes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      size_name TEXT NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- Product Toppings
    CREATE TABLE IF NOT EXISTS product_toppings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      store_id INTEGER NOT NULL,
      topping_name TEXT NOT NULL,
      price INTEGER NOT NULL,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    );

    -- Daily Order Sessions
    CREATE TABLE IF NOT EXISTS daily_order_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      store_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN',
      cutoff_time TEXT,
      recipient_name TEXT,
      recipient_phone TEXT,
      delivery_address TEXT,
      delivery_time TEXT,
      delivery_note TEXT,
      message_template TEXT,
      sponsor_mode TEXT DEFAULT 'COMPANY',
      sponsor_name TEXT,
      sponsor_amount INTEGER DEFAULT 0,
      allowed_employees_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores(id)
    );

    -- Employee Orders
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      ordered_by_employee_id INTEGER,
      ordered_by_name TEXT,
      total_amount INTEGER NOT NULL DEFAULT 0,
      subsidy_amount INTEGER NOT NULL DEFAULT 0,
      employee_pay_amount INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES daily_order_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      UNIQUE(session_id, employee_id)
    );

    -- Order Details
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name_snapshot TEXT NOT NULL,
      size_snapshot TEXT NOT NULL,
      unit_price_snapshot INTEGER NOT NULL,
      sugar_option TEXT,
      ice_option TEXT,
      toppings_snapshot_json TEXT,
      topping_price_snapshot INTEGER DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      subtotal INTEGER NOT NULL,
      note TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // Column Migrations
  try { dbWrapper.exec("ALTER TABLE daily_order_sessions ADD COLUMN sponsor_mode TEXT DEFAULT 'COMPANY'"); } catch(e){}
  try { dbWrapper.exec("ALTER TABLE daily_order_sessions ADD COLUMN sponsor_name TEXT"); } catch(e){}
  try { dbWrapper.exec("ALTER TABLE daily_order_sessions ADD COLUMN sponsor_amount INTEGER DEFAULT 0"); } catch(e){}
  try { dbWrapper.exec("ALTER TABLE daily_order_sessions ADD COLUMN allowed_employees_json TEXT"); } catch(e){}
  try { dbWrapper.exec("ALTER TABLE daily_order_sessions ADD COLUMN created_by_employee_id INTEGER"); } catch(e){}
  try { dbWrapper.exec("ALTER TABLE employees ADD COLUMN department TEXT"); } catch(e){}
  try { dbWrapper.exec("ALTER TABLE orders ADD COLUMN ordered_by_employee_id INTEGER"); } catch(e){}
  try { dbWrapper.exec("ALTER TABLE orders ADD COLUMN ordered_by_name TEXT"); } catch(e){}

  // Default settings
  const adminPassExists = dbWrapper.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  if (!adminPassExists) {
    dbWrapper.prepare("INSERT INTO settings (key, value) VALUES ('admin_password', 'admin123')").run();
  }

  const subsidyExists = dbWrapper.prepare("SELECT value FROM settings WHERE key = 'subsidy_enabled'").get();
  if (!subsidyExists) {
    dbWrapper.prepare("INSERT INTO settings (key, value) VALUES ('subsidy_enabled', '1')").run();
    dbWrapper.prepare("INSERT INTO settings (key, value) VALUES ('subsidy_amount_per_person', '20000')").run();
  }
}

export default dbWrapper;
