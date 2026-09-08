import app from '../server/server.js';
import { initDB } from '../server/database/db.js';

let isInitialized = false;

export default async function handler(req, res) {
  if (!isInitialized) {
    try {
      await initDB();
    } catch (e) {
      console.warn('Vercel cold start initDB note:', e.message);
    }
    isInitialized = true;
  }
  return app(req, res);
}
