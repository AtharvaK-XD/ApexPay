import { emitTelemetry } from '../routes/telemetry.js';

// Common attack signatures and detection regex patterns
const SQLI_PATTERNS = [
  /(\bunion\b.*\bselect\b)/i,
  /(\bselect\b.*\bfrom\b)/i,
  /(\binsert\b.*\binto\b)/i,
  /(\bupdate\b.*\bset\b)/i,
  /(\bdelete\b.*\bfrom\b)/i,
  /(\bdrop\b\s+(table|database))/i,
  /('|\b)\s*(or|and)\s+('?\d+'?|\w+)\s*=\s*('?\d+'?|\w+)/i,
  /--\s*$/,
  /\/\*.*?\*\//,
  /;\s*(select|insert|update|delete|drop)/i
];

const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
  /<script\b/i,
  /<\/script\b/i,
  /onerror\s*=/i,
  /onload\s*=/i,
  /javascript\s*:/i,
  /<img\b[^>]*src\s*=\s*['"]?javascript:/i,
  /<img\b[^>]*onerror\s*=/i,
  /<svg\b[^>]*onload\s*=/i
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /%2e%2e%2f/i,
  /%2e%2e%5c/i,
  /%252e%252e%252f/i
];

const CMD_INJECTION_PATTERNS = [
  /(\bexec\b|\bsystem\b|\bpopen\b|\bpassthru\b)/i,
  /(;|\||&&|\|\|)\s*(cat|ls|dir|whoami|id|uname|curl|wget|nc|bash|sh|powershell|cmd)\b/i,
  /`[^`]*`/
];

const SSRF_PATTERNS = [
  /(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|169\.254\.169\.254)/i
];

const ATTACK_TOOLS_PATTERN = /(sqlmap|nikto|nmap|hydra|metasploit|burpsuite|dirbuster|gobuster|wpscan|masscan|zaproxy)/i;

/**
 * Scan a single string value for known attack signatures
 */
function scanValue(value, paramName, source) {
  if (typeof value !== 'string') {
    if (typeof value === 'object' && value !== null) {
      // Recursively scan nested object values
      const results = [];
      for (const [k, v] of Object.entries(value)) {
        results.push(...scanValue(v, `${paramName}.${k}`, source));
      }
      return results;
    }
    return [];
  }

  const detected = [];

  // 1. SQL Injection
  for (const pattern of SQLI_PATTERNS) {
    if (pattern.test(value)) {
      detected.push({
        type: 'sql_injection',
        signature: 'ET WEB_ATTACK SQL Injection Attempt',
        severity: 'high',
        param: paramName,
        value,
        source
      });
      break;
    }
  }

  // 2. Cross-Site Scripting (XSS)
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(value)) {
      detected.push({
        type: 'xss',
        signature: 'ET WEB_ATTACK Cross-Site Scripting Attempt',
        severity: 'medium',
        param: paramName,
        value,
        source
      });
      break;
    }
  }

  // 3. Path Traversal
  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    if (pattern.test(value)) {
      detected.push({
        type: 'path_traversal',
        signature: 'ET WEB_ATTACK Directory Traversal Attempt',
        severity: 'high',
        param: paramName,
        value,
        source
      });
      break;
    }
  }

  // 4. Command Injection
  for (const pattern of CMD_INJECTION_PATTERNS) {
    if (pattern.test(value)) {
      detected.push({
        type: 'cmd_injection',
        signature: 'ET WEB_ATTACK Command Injection Attempt',
        severity: 'high',
        param: paramName,
        value,
        source
      });
      break;
    }
  }

  // 5. SSRF
  if (value.startsWith('http://') || value.startsWith('https://')) {
    for (const pattern of SSRF_PATTERNS) {
      if (pattern.test(value)) {
        detected.push({
          type: 'ssrf',
          signature: 'ET WEB_ATTACK Server-Side Request Forgery Attempt',
          severity: 'high',
          param: paramName,
          value,
          source
        });
        break;
      }
    }
  }

  return detected;
}

/**
 * Express Middleware: Intercepts and detects web application attacks in incoming requests
 */
export const attackDetectorMiddleware = async (req, res, next) => {
  // Avoid scanning telemetry endpoints themselves to prevent recursive triggers
  if (req.path.startsWith('/api/telemetry')) {
    return next();
  }

  const detectedAttacks = [];

  // 1. Scan GET Query Parameters
  if (req.query) {
    for (const [key, val] of Object.entries(req.query)) {
      detectedAttacks.push(...scanValue(val, key, 'GET'));
    }
  }

  // 2. Scan POST/PUT Body Parameters
  if (req.body && typeof req.body === 'object') {
    for (const [key, val] of Object.entries(req.body)) {
      detectedAttacks.push(...scanValue(val, key, 'POST'));
    }
  }

  // 3. Scan User-Agent Header for automated scanners
  const userAgent = req.headers['user-agent'] || '';
  if (ATTACK_TOOLS_PATTERN.test(userAgent)) {
    detectedAttacks.push({
      type: 'attack_tool',
      signature: 'ET SCAN Known Malicious Scanner User-Agent',
      severity: 'medium',
      param: 'User-Agent',
      value: userAgent,
      source: 'HEADER'
    });
  }

  // 4. Dispatch Telemetry for each detected attack
  if (detectedAttacks.length > 0) {
    for (const attack of detectedAttacks) {
      console.warn(`🚨 [SOC Defense Alert]: Detected ${attack.type.toUpperCase()} in ${attack.source} param "${attack.param}"`);

      // Fire and forget so we do not block response handling
      emitTelemetry(req, {
        event_type: attack.type,
        severity: attack.severity,
        signature: attack.signature,
        summary: attack.signature,
        metadata: {
          detection_param: attack.param,
          detection_value: String(attack.value).substring(0, 150),
          detection_source: attack.source,
          attack_target: 'server_web_app',
          generated_by: 'website_defense'
        }
      }).catch(err => console.error('Error dispatching attack telemetry:', err));
    }
  }

  // Attach detected attacks to request object for route-level simulation if needed
  req.detectedAttacks = detectedAttacks;
  next();
};
