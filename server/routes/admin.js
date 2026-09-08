import express from 'express';
import { query } from '../database/db.js';
import { emitTelemetry } from './telemetry.js';

const router = express.Router();

// GET /api/admin/users
router.get('/users', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const hasValidAdminAuth = authHeader && authHeader.includes('apex_jwt');

  if (!hasValidAdminAuth) {
    // Emit telemetry event for unauthenticated access attempt to admin data
    await emitTelemetry(req, {
      event_type: 'UNAUTHORIZED_ADMIN_PROBE',
      severity: 'MEDIUM',
      summary: 'Direct unauthenticated probe against administrative users endpoint /api/admin/users',
      metadata: {
        mitre_technique: 'T1087.002 (Account Discovery: Domain Account)',
        source_ip: req.ip || '127.0.0.1',
        auth_header_present: !!authHeader
      }
    });
  }

  try {
    const users = await query(`
      SELECT id, name, email, role, company, balance, created_at 
      FROM users 
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      users,
      count: users.length,
      system_status: 'HEALTHY',
      treasury_liquidity: '$5,626,761.25'
    });
  } catch (err) {
    console.error('Admin users fetch error:', err);
    res.status(500).json({ error: 'Failed to retrieve admin records' });
  }
});

// GET /api/admin/metrics
router.get('/metrics', async (req, res) => {
  try {
    const userCount = await query('SELECT COUNT(*) as count FROM users');
    const txMetrics = await query(`
      SELECT 
        COUNT(*) as total_tx,
        SUM(amount) as total_volume,
        COUNT(CASE WHEN type = 'credit' THEN 1 END) as credits,
        COUNT(CASE WHEN type = 'debit' THEN 1 END) as debits
      FROM transactions
    `);

    res.json({
      active_enterprises: userCount[0].count,
      total_transactions: txMetrics[0].total_tx,
      cleared_volume: txMetrics[0].total_volume || 0,
      uptime: '99.99%',
      avg_settlement_latency: '180ms',
      soc_monitor: 'Active (Flare Connected)'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
