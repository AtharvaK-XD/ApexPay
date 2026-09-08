import express from 'express';

const router = express.Router();

/**
 * Vulnerable SQL Endpoint: Simulates error-based and boolean SQL injection
 * Compatible with automated vulnerability scanners and attack_tester.py
 */
router.all('/query', (req, res) => {
  const paramId = req.query.id || req.body?.id || req.query.user || req.body?.user || '';
  const paramPass = req.query.password || req.body?.password || '';
  const input = String(paramId + ' ' + paramPass).trim();

  const sqliPatterns = /('|"|--|\bunion\b|\bselect\b|\bor\b\s+['"]?\d+['"]?\s*=\s*['"]?\d+)/i;

  if (sqliPatterns.test(input)) {
    // Deliberate simulated SQL error matching popular attack signatures
    return res.status(500).json({
      error: 'SQLite3::SQLException: near "\'": syntax error',
      query: `SELECT * FROM accounts WHERE id = '${input}' LIMIT 1`,
      status: 'error',
      code: 'SQLITE_ERROR'
    });
  }

  res.json({
    status: 'success',
    data: { id: paramId || 1, name: 'Apex Corporate Treasury Pool', balance: 5000000 }
  });
});

/**
 * Vulnerable XSS Endpoint: Simulates reflected Cross-Site Scripting
 */
router.get('/search', (req, res) => {
  const q = req.query.q || '';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>ApexPay Search</title></head>
      <body>
        <h2>Search Results</h2>
        <div id="results">Results for: ${q}</div>
      </body>
    </html>
  `);
});

/**
 * Vulnerable Path Traversal Endpoint: Simulates Local File Inclusion (LFI)
 */
router.get('/page', (req, res) => {
  const file = req.query.file || req.query.page || '';
  if (file.includes('..')) {
    return res.status(403).send(`Warning: file_get_contents(${file}): failed to open stream: Permission denied in /var/www/app.js`);
  }
  res.send(`Content for view: ${file || 'default'}`);
});

/**
 * Vulnerable Command Execution Endpoint: Simulates OS Command Injection
 */
router.all('/ping', (req, res) => {
  const host = req.query.host || req.body?.host || '127.0.0.1';
  if (/(\||;|&&|`)/.test(host)) {
    return res.json({
      status: 'executed',
      output: `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\nwww-data\nuid=33(www-data) gid=33(www-data)`
    });
  }
  res.json({ status: 'success', message: `Host ${host} is reachable (0% packet loss)` });
});

export default router;
