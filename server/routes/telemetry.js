import express from 'express';
import { run, query, get } from '../database/db.js';

const router = express.Router();

/**
 * Helper to log and forward telemetry to Flare via ngrok or direct URL
 */
export const emitTelemetry = async (req, {
  event_type,
  severity = 'high',
  signature,
  summary,
  metadata = {}
}) => {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const source_ip = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                    req.headers['x-real-ip'] ||
                    req.socket?.remoteAddress ||
                    '127.0.0.1';
  const method = req.method || 'GET';
  const endpoint = req.originalUrl || req.url || '/';
  const alertSig = signature || summary || `ET WEB_ATTACK ${event_type.toUpperCase()}`;

  // 1. Save to local audit_logs table (safe for serverless if DB is unavailable)
  let logId = null;
  try {
    const res = await run(`
      INSERT INTO audit_logs (timestamp, event_type, severity, source_ip, method, endpoint, summary, metadata, dispatched_to_flare)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [timestamp, event_type, String(severity).toUpperCase(), source_ip, method, endpoint, alertSig, JSON.stringify(metadata)]);
    logId = res?.lastID;
  } catch (err) {
    // Non-fatal if DB is read-only or in serverless environment
    console.warn('[Audit Log Note]: Could not save to DB:', err.message);
  }

  // 2. Fetch configured Flare webhook URL and Service Token
  let flareUrl = process.env.FLARE_WEBHOOK_URL || null;
  let flareToken = process.env.FLARE_SERVICE_TOKEN || null;

  try {
    if (!flareUrl) {
      const row = await get(`SELECT value FROM config WHERE key = 'flare_webhook_url'`);
      flareUrl = row?.value;
    }
    if (!flareToken) {
      const row = await get(`SELECT value FROM config WHERE key = 'flare_service_token'`);
      flareToken = row?.value;
    }
  } catch (err) {
    // Silently continue if SQLite unavailable
  }

  // 3. Dispatch Suricata EVE alert to Flare if URL configured
  if (flareUrl && (flareUrl.startsWith('http://') || flareUrl.startsWith('https://'))) {
    // Ensure clean IP format for Suricata compatibility
    const cleanSrcIp = (source_ip && source_ip !== '127.0.0.1' && source_ip !== '::1')
      ? source_ip
      : '203.0.113.195';

    // Format metadata as list of key-value objects or strings as expected by Flare
    const metaList = [
      { attack_target: 'server_web_app' },
      { generated_by: 'website_defense' }
    ];
    for (const [k, v] of Object.entries(metadata)) {
      metaList.push({ [k]: v });
    }

    // Map severity to Suricata integer 1..4 (1=High/Critical, 2=Medium, 3=Low, 4=Info)
    const sevMap = { critical: 1, high: 1, medium: 2, low: 3, info: 4 };
    const numericSeverity = sevMap[String(severity).toLowerCase()] || 2;

    // Exact Suricata EVE JSON Record
    const eveRecord = {
      timestamp: new Date().toISOString(),
      event_type: 'alert',
      src_ip: cleanSrcIp,
      src_port: Math.floor(Math.random() * (65535 - 1024) + 1024),
      dest_ip: '198.51.100.10',
      dest_port: 443,
      proto: 'TCP',
      alert: {
        signature: alertSig,
        signature_id: Math.floor(Math.random() * 1000000) + 2000000,
        category: 'Web Application Attack',
        severity: numericSeverity,
        metadata: metaList
      },
      http: {
        hostname: req.hostname || req.headers['host'] || 'unknown',
        url: endpoint,
        http_method: method,
        protocol: 'HTTP/1.1',
        length: 0
      }
    };

    const headers = {
      'Content-Type': 'application/json'
    };
    if (flareToken) {
      headers['Authorization'] = `ServiceToken ${flareToken.trim()}`;
    }

    // Flare backend requires: {"events": [eveRecord]}
    const payload = {
      events: [eveRecord]
    };

    fetch(flareUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (res.ok) {
          console.log(`[Flare Dispatched]: ${alertSig} -> ${flareUrl} (HTTP ${res.status})`);
          if (logId) {
            try {
              await run(`UPDATE audit_logs SET dispatched_to_flare = 1 WHERE id = ?`, [logId]);
            } catch (e) {}
          }
        } else {
          const body = await res.text();
          console.warn(`[Flare Dispatch Warning]: HTTP ${res.status} from ${flareUrl}: ${body}`);
        }
      })
      .catch((err) => {
        console.warn(`[Flare Connection Note]: Endpoint ${flareUrl} not reachable (${err.message})`);
      });
  }
};

// GET /api/telemetry/events - List recent logs
router.get('/events', async (req, res) => {
  try {
    const logs = await query(`
      SELECT * FROM audit_logs 
      ORDER BY id DESC 
      LIMIT 60
    `);
    res.json(logs || []);
  } catch (err) {
    res.json([]);
  }
});

// GET /api/telemetry/config - Get current Flare webhook and token status
router.get('/config', async (req, res) => {
  let flare_webhook_url = process.env.FLARE_WEBHOOK_URL || '';
  let flare_service_token = process.env.FLARE_SERVICE_TOKEN || '';

  try {
    const rowUrl = await get(`SELECT value FROM config WHERE key = 'flare_webhook_url'`);
    if (rowUrl?.value) flare_webhook_url = rowUrl.value;
    const rowTok = await get(`SELECT value FROM config WHERE key = 'flare_service_token'`);
    if (rowTok?.value) flare_service_token = rowTok.value;
  } catch (err) {}

  res.json({
    flare_webhook_url: flare_webhook_url || 'http://127.0.0.1:8000/api/v1/ingest/eve',
    has_token: Boolean(flare_service_token),
    flare_service_token: flare_service_token || ''
  });
});

// POST /api/telemetry/config - Update Flare webhook & token
router.post('/config', async (req, res) => {
  try {
    const { flare_webhook_url, flare_service_token } = req.body;

    if (flare_webhook_url !== undefined) {
      process.env.FLARE_WEBHOOK_URL = flare_webhook_url;
      await run(`
        INSERT INTO config (key, value) VALUES ('flare_webhook_url', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `, [flare_webhook_url]);
    }

    if (flare_service_token !== undefined) {
      process.env.FLARE_SERVICE_TOKEN = flare_service_token;
      await run(`
        INSERT INTO config (key, value) VALUES ('flare_service_token', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `, [flare_service_token]);
    }

    res.json({ success: true, flare_webhook_url, flare_service_token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/telemetry/simulate - Trigger attack scenario simulation
router.post('/simulate', async (req, res) => {
  const { scenario } = req.body;

  if (scenario === 'brute_force') {
    await emitTelemetry(req, {
      event_type: 'AUTH_BRUTE_FORCE_SPIKE',
      severity: 'high',
      signature: 'ET SCAN Suricata SSH/Auth Brute-Force Surge',
      metadata: {
        mitre_technique: 'T1110.001 (Password Guessing)',
        targeted_user: 'admin@apexpay.io',
        burst_rate: '6.2 req/sec'
      }
    });
    return res.json({ success: true, message: 'Simulated Brute-Force burst dispatched to Flare.' });
  }

  if (scenario === 'sql_probe') {
    await emitTelemetry(req, {
      event_type: 'sql_injection',
      severity: 'high',
      signature: 'ET WEB_ATTACK SQL Injection Attempt',
      metadata: {
        detection_param: 'id',
        detection_value: "' OR '1'='1' --",
        detection_source: 'GET',
        mitre_technique: 'T1190 (Exploit Public-Facing Application)'
      }
    });
    return res.json({ success: true, message: 'Simulated SQL Injection pattern dispatched to Flare.' });
  }

  if (scenario === 'xss_probe') {
    await emitTelemetry(req, {
      event_type: 'xss',
      severity: 'medium',
      signature: 'ET WEB_ATTACK Cross-Site Scripting Attempt',
      metadata: {
        detection_param: 'q',
        detection_value: "<script>alert('XSS')</script>",
        detection_source: 'GET',
        mitre_technique: 'T1059.007 (JavaScript Execution)'
      }
    });
    return res.json({ success: true, message: 'Simulated XSS attack dispatched to Flare.' });
  }

  if (scenario === 'admin_probe') {
    await emitTelemetry(req, {
      event_type: 'path_traversal',
      severity: 'high',
      signature: 'ET WEB_ATTACK Directory Traversal Attempt',
      metadata: {
        mitre_technique: 'T1083 (File and Directory Discovery)',
        detection_param: 'page',
        detection_value: '../../etc/passwd'
      }
    });
    return res.json({ success: true, message: 'Simulated Directory Traversal dispatched to Flare.' });
  }

  res.status(400).json({ error: 'Unknown scenario' });
});

export default router;
