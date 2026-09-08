import express from 'express';
import { query, run, get } from '../database/db.js';
import { emitTelemetry } from './telemetry.js';

const router = express.Router();

// GET /api/transactions?search=&userId=
router.get('/', async (req, res) => {
  const { search = '', userId = 1 } = req.query;

  // Detect suspicious injection syntax for Flare telemetry
  const injectionPatterns = [/'\s*OR\s*'?1'?\s*=\s*'?1/i, /UNION\s+SELECT/i, /--/, /;\s*DROP/i, /<script>/i];
  const isSuspicious = injectionPatterns.some((pattern) => pattern.test(search));

  if (isSuspicious) {
    await emitTelemetry(req, {
      event_type: 'SUSPICIOUS_QUERY_INJECTION',
      severity: 'CRITICAL',
      summary: `Exploit pattern detected in query parameter: '${search}'`,
      metadata: {
        mitre_technique: 'T1190 (Exploit Public-Facing Application)',
        searched_term: search,
        source: 'Transaction Search API'
      }
    });
  } else if (search.trim().length > 0) {
    await emitTelemetry(req, {
      event_type: 'TRANSACTION_SEARCH',
      severity: 'INFO',
      summary: `User executed transaction search query for '${search}'`,
      metadata: { query: search }
    });
  }

  try {
    let sql = `SELECT * FROM transactions WHERE user_id = ?`;
    const params = [userId];

    if (search.trim()) {
      sql += ` AND (counterparty LIKE ? OR description LIKE ? OR category LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY id DESC LIMIT 50`;

    const transactions = await query(sql, params);

    // Get user balance
    const user = await get('SELECT balance FROM users WHERE id = ?', [userId]);

    res.json({
      transactions,
      balance: user?.balance || 348250.75,
      query: search,
      total_count: transactions.length
    });
  } catch (err) {
    console.error('Transaction fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve transactions' });
  }
});

// POST /api/transactions/send
router.post('/send', async (req, res) => {
  const { counterparty, description, amount, category, userId = 1 } = req.body;

  if (!counterparty || !amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'Invalid counterparty or amount' });
  }

  try {
    const user = await get('SELECT balance FROM users WHERE id = ?', [userId]);
    if (!user || user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient treasury funds for disbursement' });
    }

    const newBalance = user.balance - amount;
    const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Insert transaction
    await run(`
      INSERT INTO transactions (user_id, type, counterparty, description, amount, status, category, date)
      VALUES (?, 'debit', ?, ?, ?, 'Completed', ?, ?)
    `, [userId, counterparty, description || 'Direct Wire Transfer', amount, category || 'Wire Transfer', dateStr]);

    // Update user balance
    await run('UPDATE users SET balance = ? WHERE id = ?', [newBalance, userId]);

    await emitTelemetry(req, {
      event_type: 'WIRE_DISBURSED',
      severity: 'INFO',
      summary: `Treasury wire disbursed: $${amount.toLocaleString()} to ${counterparty}`,
      metadata: {
        amount,
        counterparty,
        new_balance: newBalance
      }
    });

    res.json({
      success: true,
      message: 'Disbursement executed successfully',
      new_balance: newBalance
    });
  } catch (err) {
    console.error('Disbursement error:', err);
    res.status(500).json({ error: 'Transfer failed' });
  }
});

export default router;
