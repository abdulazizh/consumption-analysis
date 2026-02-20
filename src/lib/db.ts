import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'consumption.db');

// إنشاء مجلد البيانات إذا لم يكن موجوداً
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// إنشاء الجداول
db.exec(`
  -- جدول المشتركين
  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_no TEXT UNIQUE NOT NULL,
    old_account_no TEXT,
    name TEXT NOT NULL,
    meter TEXT,
    subscription_no TEXT,
    address TEXT,
    region TEXT,
    sector TEXT,
    block TEXT,
    property TEXT,
    phase TEXT,
    factor INTEGER DEFAULT 1,
    install_date TEXT,
    last_payment REAL,
    last_payment_date TEXT,
    consumer_type TEXT,
    classification TEXT,
    current_reading REAL,
    current_date TEXT,
    prev_reading REAL,
    prev_date TEXT,
    total_consumption REAL DEFAULT 0,
    periods_count INTEGER DEFAULT 0,
    avg_consumption REAL DEFAULT 0,
    avg_duration REAL DEFAULT 0,
    avg_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- جدول الاستهلاك
  CREATE TABLE IF NOT EXISTS consumptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_no TEXT NOT NULL,
    period_no INTEGER NOT NULL,
    consumption REAL NOT NULL,
    actual_consumption REAL NOT NULL,
    duration_days INTEGER NOT NULL,
    prev_reading REAL NOT NULL,
    prev_date TEXT NOT NULL,
    next_reading REAL NOT NULL,
    next_date TEXT NOT NULL,
    rate REAL NOT NULL,
    factor INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_no) REFERENCES subscribers(account_no)
  );

  -- فهارس للبحث السريع
  CREATE INDEX IF NOT EXISTS idx_subscribers_account ON subscribers(account_no);
  CREATE INDEX IF NOT EXISTS idx_subscribers_name ON subscribers(name);
  CREATE INDEX IF NOT EXISTS idx_subscribers_meter ON subscribers(meter);
  CREATE INDEX IF NOT EXISTS idx_consumptions_account ON consumptions(account_no);
`);

export default db;

// دوال قاعدة البيانات

export function clearAllData() {
  db.exec('DELETE FROM consumptions');
  db.exec('DELETE FROM subscribers');
  return true;
}

export function insertSubscriber(data: {
  account_no: string;
  old_account_no?: string;
  name: string;
  meter?: string;
  subscription_no?: string;
  address?: string;
  region?: string;
  sector?: string;
  block?: string;
  property?: string;
  phase?: string;
  factor?: number;
  install_date?: string;
  last_payment?: number;
  last_payment_date?: string;
  consumer_type?: string;
  classification?: string;
  current_reading?: number;
  current_date?: string;
  prev_reading?: number;
  prev_date?: string;
  total_consumption?: number;
  periods_count?: number;
  avg_consumption?: number;
  avg_duration?: number;
  avg_rate?: number;
}) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO subscribers (
      account_no, old_account_no, name, meter, subscription_no, address,
      region, sector, block, property, phase, factor, install_date,
      last_payment, last_payment_date, consumer_type, classification,
      current_reading, current_date, prev_reading, prev_date,
      total_consumption, periods_count, avg_consumption, avg_duration, avg_rate
    ) VALUES (
      @account_no, @old_account_no, @name, @meter, @subscription_no, @address,
      @region, @sector, @block, @property, @phase, @factor, @install_date,
      @last_payment, @last_payment_date, @consumer_type, @classification,
      @current_reading, @current_date, @prev_reading, @prev_date,
      @total_consumption, @periods_count, @avg_consumption, @avg_duration, @avg_rate
    )
  `);
  return stmt.run(data);
}

export function insertConsumption(data: {
  account_no: string;
  period_no: number;
  consumption: number;
  actual_consumption: number;
  duration_days: number;
  prev_reading: number;
  prev_date: string;
  next_reading: number;
  next_date: string;
  rate: number;
  factor: number;
}) {
  const stmt = db.prepare(`
    INSERT INTO consumptions (
      account_no, period_no, consumption, actual_consumption, duration_days,
      prev_reading, prev_date, next_reading, next_date, rate, factor
    ) VALUES (
      @account_no, @period_no, @consumption, @actual_consumption, @duration_days,
      @prev_reading, @prev_date, @next_reading, @next_date, @rate, @factor
    )
  `);
  return stmt.run(data);
}

export function getSubscribersCount() {
  const result = db.prepare('SELECT COUNT(*) as count FROM subscribers').get() as { count: number };
  return result.count;
}

export function getConsumptionsCount() {
  const result = db.prepare('SELECT COUNT(*) as count FROM consumptions').get() as { count: number };
  return result.count;
}

export function searchSubscribers(searchTerm: string, limit: number = 50) {
  const stmt = db.prepare(`
    SELECT * FROM subscribers 
    WHERE account_no LIKE ? OR name LIKE ? OR meter LIKE ? OR subscription_no LIKE ? OR old_account_no LIKE ?
    LIMIT ?
  `);
  const term = `%${searchTerm}%`;
  return stmt.all(term, term, term, term, term, limit);
}

export function getSubscriberByAccount(accountNo: string) {
  const stmt = db.prepare('SELECT * FROM subscribers WHERE account_no = ?');
  return stmt.get(accountNo);
}

export function getConsumptionsByAccount(accountNo: string) {
  const stmt = db.prepare(`
    SELECT * FROM consumptions 
    WHERE account_no = ? 
    ORDER BY prev_date ASC
  `);
  return stmt.all(accountNo);
}

export function getAllSubscribers() {
  const stmt = db.prepare('SELECT * FROM subscribers ORDER BY name');
  return stmt.all();
}
