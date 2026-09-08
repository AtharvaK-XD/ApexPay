import { initDB, run, query } from './db.js';

export const seedDatabase = async () => {
  await initDB();

  // Check if users already exist
  const existingUsers = await query('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count > 0) {
    console.log('⚡ Database already seeded.');
    return;
  }

  console.log('🌱 Seeding ApexPay database with enterprise records...');

  // Seed Users
  await run(`
    INSERT INTO users (name, email, password, role, company, balance) VALUES
    ('Sarah Chen', 'sarah.chen@techscale.io', 'password123', 'admin', 'TechScale Global Inc.', 348250.75),
    ('Marcus Vance', 'marcus.vance@vanguard.co', 'vance2026', 'user', 'Vance Capital Partners', 194300.00),
    ('Elena Rostova', 'elena.rostova@hyperdrive.dev', 'hyperpass', 'user', 'Hyperdrive Systems', 84210.50),
    ('System Administrator', 'admin@apexpay.io', 'admin123', 'admin', 'ApexPay Security Ops', 5000000.00)
  `);

  // Seed Transactions for User 1 (Sarah Chen)
  const transactions = [
    { type: 'credit', counterparty: 'Sequoia Capital Fund IV', desc: 'Series B Tranche Disbursement', amount: 250000.00, status: 'Completed', category: 'Capital Inflow', date: '2026-09-02 14:22:00' },
    { type: 'debit', counterparty: 'Amazon Web Services', desc: 'Enterprise Cloud Infrastructure Cluster #9', amount: 14890.20, status: 'Completed', category: 'Cloud & Compute', date: '2026-09-02 10:15:30' },
    { type: 'debit', counterparty: 'Gusto Payroll Service', desc: 'Monthly Global Engineering & Design Payroll', amount: 78500.00, status: 'Completed', category: 'Payroll', date: '2026-09-01 09:00:00' },
    { type: 'credit', counterparty: 'Shopify Merchant Solutions', desc: 'Automated Treasury Settlement Batch #4109', amount: 42150.80, status: 'Completed', category: 'Merchant Revenue', date: '2026-08-31 18:45:12' },
    { type: 'debit', counterparty: 'Brex Corporate Card Services', desc: 'Executive Travel & Client Acquisition Expenses', amount: 6240.50, status: 'Completed', category: 'Corporate Cards', date: '2026-08-30 16:30:00' },
    { type: 'debit', counterparty: 'Datadog APM & Monitoring', desc: 'Infrastructure Observability Plan (Annual)', amount: 4800.00, status: 'Completed', category: 'Software & SaaS', date: '2026-08-29 11:20:00' },
    { type: 'credit', counterparty: 'Acme Corp B2B Wholesale', desc: 'Invoice #INV-2026-891 Enterprise License', amount: 35000.00, status: 'Completed', category: 'Client Revenue', date: '2026-08-28 15:10:00' },
    { type: 'debit', counterparty: 'OpenAI API Platform', desc: 'Tier 5 LLM Inference Usage Settlement', amount: 3200.45, status: 'Completed', category: 'AI Services', date: '2026-08-27 13:05:00' },
    { type: 'debit', counterparty: 'GitHub Enterprise Suite', desc: '50 Seats Copilot + CI/CD Minutes', amount: 1850.00, status: 'Completed', category: 'Developer Tools', date: '2026-08-26 10:00:00' },
    { type: 'credit', counterparty: 'Stripe Connect Payout', desc: 'Daily Aggregated Payout Europe & US', amount: 18940.10, status: 'Completed', category: 'Card Processing', date: '2026-08-25 17:30:00' },
    { type: 'debit', counterparty: 'WeWork Global Access', desc: 'San Francisco & London HQ Dedicated Desks', amount: 5400.00, status: 'Completed', category: 'Facilities', date: '2026-08-24 08:30:00' },
    { type: 'debit', counterparty: 'Deloitte Risk Advisory', desc: 'SOC 2 Type II Annual Attestation Retainer', amount: 12500.00, status: 'Completed', category: 'Legal & Audit', date: '2026-08-22 14:00:00' }
  ];

  for (const tx of transactions) {
    await run(`
      INSERT INTO transactions (user_id, type, counterparty, description, amount, status, category, date)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?)
    `, [tx.type, tx.counterparty, tx.desc, tx.amount, tx.status, tx.category, tx.date]);
  }

  // Seed initial system audit logs
  await run(`
    INSERT INTO audit_logs (timestamp, event_type, severity, source_ip, method, endpoint, summary, metadata, dispatched_to_flare)
    VALUES 
    (datetime('now', '-2 hours'), 'SYSTEM_BOOT', 'INFO', '127.0.0.1', 'SYSTEM', '/kernel', 'ApexPay Core Treasury Services initialized with TLS 1.3 encryption', '{"version":"2.4.0"}', 1),
    (datetime('now', '-45 minutes'), 'USER_AUTHENTICATED', 'INFO', '192.168.1.104', 'POST', '/api/auth/login', 'Successful admin authentication for sarah.chen@techscale.io', '{"mfa":"passed"}', 1)
  `);

  console.log('✅ ApexPay database successfully seeded with realistic fintech records.');
};

// If executed directly: node server/database/seed.js
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
