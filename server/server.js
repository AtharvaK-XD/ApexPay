try {
  process.loadEnvFile();
} catch (e) {
  // .env may not be present in all environments
}

import express from 'express';
import cors from 'cors';
import { initDB } from './database/db.js';
import { seedDatabase } from './database/seed.js';
import authRoutes from './routes/auth.js';
import transactionsRoutes from './routes/transactions.js';
import adminRoutes from './routes/admin.js';
import telemetryRoutes from './routes/telemetry.js';
import vulnerableRoutes from './routes/vulnerable.js';
import { attackDetectorMiddleware } from './middleware/attackDetector.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attack Detection Middleware - analyzes all incoming traffic & sends Suricata EVE records to Flare
app.use(attackDetectorMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ApexPay Core Treasury Backend',
    timestamp: new Date().toISOString(),
    version: '2.5.0',
    defense_sensor: 'Active',
    flare_integration: 'Suricata EVE JSON v1'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/vulnerable', vulnerableRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server (only if not imported by serverless)
export const startServer = async () => {
  try {
    await initDB();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 ApexPay Treasury Server running on http://localhost:${PORT}`);
      console.log(`📡 SOC Telemetry Bridge ready to stream events to Flare.`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
    process.exit(1);
  }
};

// Auto-start if executed directly
if (process.argv[1]?.includes('server.js')) {
  startServer();
}

export default app;
