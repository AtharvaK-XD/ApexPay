import express from 'express';
import { get, run } from '../database/db.js';
import { emitTelemetry } from './telemetry.js';

const router = express.Router();

// Track recent failed attempts in-memory for detection
const failedAttemptsMap = new Map();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user || user.password !== password) {
      // Increment failed count
      const currentAttempts = (failedAttemptsMap.get(ip) || 0) + 1;
      failedAttemptsMap.set(ip, currentAttempts);

      const isHighFrequency = currentAttempts >= 3;
      await emitTelemetry(req, {
        event_type: isHighFrequency ? 'AUTH_BRUTE_FORCE_PATTERN' : 'AUTH_FAILED',
        severity: isHighFrequency ? 'HIGH' : 'LOW',
        summary: isHighFrequency 
          ? `High frequency of failed logins (${currentAttempts} attempts) targeting account ${email}`
          : `Failed login attempt for user account: ${email}`,
        metadata: {
          target_email: email,
          failed_attempts_from_ip: currentAttempts,
          status_code: 401
        }
      });

      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Reset failed counter on success
    failedAttemptsMap.delete(ip);

    await emitTelemetry(req, {
      event_type: 'AUTH_SUCCESS',
      severity: 'INFO',
      summary: `User ${user.email} (${user.role}) successfully authenticated.`,
      metadata: {
        user_id: user.id,
        role: user.role,
        company: user.company
      }
    });

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      balance: user.balance
    };

    res.json({
      success: true,
      token: `apex_jwt_${user.id}_${Date.now()}`,
      user: sanitizedUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, company } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const companyName = company || `${name}'s Company LLC`;
    const initialBalance = 100000.00;

    const result = await run(`
      INSERT INTO users (name, email, password, role, company, balance)
      VALUES (?, ?, ?, 'user', ?, ?)
    `, [name, email, password, companyName, initialBalance]);

    await emitTelemetry(req, {
      event_type: 'ACCOUNT_CREATED',
      severity: 'INFO',
      summary: `New corporate account registered: ${companyName} (${email})`,
      metadata: {
        new_user_id: result.lastID,
        initial_balance: initialBalance
      }
    });

    res.status(201).json({
      success: true,
      message: 'Account successfully created',
      user: {
        id: result.lastID,
        name,
        email,
        role: 'user',
        company: companyName,
        balance: initialBalance
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
