import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel serverless environments, only /tmp is writable
let dbPath = path.resolve(__dirname, 'apexpay.sqlite');
if (process.env.VERCEL) {
  dbPath = path.join('/tmp', 'apexpay.sqlite');
  // Copy seed database from repo to /tmp if it doesn't exist yet
  const localDb = path.resolve(__dirname, 'apexpay.sqlite');
  if (fs.existsSync(localDb) && !fs.existsSync(dbPath)) {
    try {
      fs.copyFileSync(localDb, dbPath);
    } catch (e) {
      console.warn('Could not copy sqlite to /tmp:', e.message);
    }
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Helper functions for Promise-based queries
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Initialize tables
export const initDB = async () => {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        company TEXT NOT NULL,
        balance REAL DEFAULT 148520.50,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        type TEXT NOT NULL,
        counterparty TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'Completed',
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        event_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        source_ip TEXT,
        method TEXT,
        endpoint TEXT,
        summary TEXT,
        metadata TEXT,
        dispatched_to_flare INTEGER DEFAULT 0
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

    const defaultFlareUrl = process.env.FLARE_WEBHOOK_URL || 'http://127.0.0.1:8000/api/v1/ingest/eve';
    await run(`
      INSERT INTO config (key, value)
      VALUES ('flare_webhook_url', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `, [defaultFlareUrl]);

    // Permanently purge any legacy ngrok URLs
    await run(`
      UPDATE config
      SET value = 'http://127.0.0.1:8000/api/v1/ingest/eve'
      WHERE key = 'flare_webhook_url' AND (value LIKE '%ngrok%' OR value LIKE '%durable%')
    `);

    if (process.env.FLARE_SERVICE_TOKEN) {
      await run(`
        INSERT INTO config (key, value)
        VALUES ('flare_service_token', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `, [process.env.FLARE_SERVICE_TOKEN]);
    }
  } catch (err) {
    console.warn('[DB Init Warning]:', err.message);
  }
};

export default db;
