# ApexPay — Next-Gen B2B Treasury & Global Payments Cloud
### *Live Target Application & SOC Telemetry Sensor for Flare AI*

ApexPay is a high-impact, full-stack fintech banking web application designed specifically as the live target environment for demonstrations of the **Flare AI SOC Alert Triage Tool**.

Equipped with automated web attack detection (SQLi, XSS, Path Traversal, Command Injection, SSRF, Malicious Scanners), ApexPay instantly converts malicious traffic into standardized **Suricata EVE alert records** and streams them live to Flare.

---

## ⚡ Quick Start (Local Run)

From this folder (`C:\Users\ATHARVA\Desktop\demo`), run:

```bash
npm run dev
```

This starts both the **Express Treasury Backend** (`http://localhost:5000`) and the **React Vite Frontend** (`http://localhost:3000`).

---

## 🌐 Deploy to Vercel

ApexPay is configured with `vercel.json` and a Serverless API handler in `api/index.js`.

### Option A: Via Vercel CLI
```bash
# 1. Install Vercel CLI (if not already installed)
npm install -g vercel

# 2. Login and deploy
vercel login
vercel

# 3. Deploy to production
vercel --prod
```

### Option B: Via GitHub / Vercel Web Dashboard
1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new) and Import the repository.
3. Add the following Environment Variables in the Vercel project settings:
   - `FLARE_WEBHOOK_URL`: `https://<your-ngrok-subdomain>.ngrok-free.app/api/v1/ingest/eve`
   - `FLARE_SERVICE_TOKEN`: `<your-flare-ingest-service-token>`
4. Click **Deploy**. Note your live URL (e.g. `https://apexpay-demo.vercel.app`).

---

## 📡 Live Ingestion Setup with Flare & ngrok

### Step 1: Enable Live Ingestion in Local Flare
In your local Flare backend directory, add to `.env`:
```bash
LIVE_INGEST_ENABLED=true
INGEST_SERVICE_TOKEN=your_secret_service_token_here
```
*(If on Linux/macOS, you can generate a token with: `python -c "import secrets; print(secrets.token_urlsafe(48))"`)*

Restart the Flare backend server to load the new settings.

### Step 2: Expose Flare via ngrok
In a separate terminal:
```bash
ngrok http 8000
```
Note the forwarding URL (e.g. `https://abc-123.ngrok-free.app`).  
Your live ingestion endpoint is:
👉 **`https://abc-123.ngrok-free.app/api/v1/ingest/eve`**

### Step 3: Link ApexPay to Flare
You can configure ApexPay via:
1. **The In-App Console:** Open your deployed Vercel site or `http://localhost:3000`, click **"Flare SOC Stream"** in the bottom-right corner, enter the ngrok URL and Service Token, and click **Save Config**.
2. **Environment Variables:** Set `FLARE_WEBHOOK_URL` and `FLARE_SERVICE_TOKEN`.

---

## 🐍 Running Python Attack Scripts Against Your Website

We have included an automated attack test script that fires realistic web attack vectors against your target (local or Vercel) and verifies detection:

```bash
# Run against localhost:
python scripts/attack_tester.py http://localhost:3000

# Or run against your live Vercel deployment:
python scripts/attack_tester.py https://your-site.vercel.app
```

### What the Attack Suite Tests:
1. **SQL Injection:** Probes query params with `' OR '1'='1'`, `UNION SELECT`, and boolean payloads.
2. **Cross-Site Scripting (XSS):** Tests reflected script tags `<script>alert('XSS')</script>`.
3. **Directory Traversal (LFI):** Probes file endpoints with `../../../../etc/passwd`.
4. **Command Injection:** Probes with command separators `127.0.0.1; whoami`.
5. **Malicious Scanner Detection:** Tests scanner user-agents (e.g. `sqlmap`, `nikto`).

---

## 🎯 Verification in Flare Dashboard

1. Open your Flare Dashboard: `http://localhost:5174`
2. Look at the **Live Alert Feed**:
   - Signature: `ET WEB_ATTACK SQL Injection Attempt`, `ET WEB_ATTACK Cross-Site Scripting Attempt`, etc.
   - Severity: `High`, `Medium`, etc.
   - Category: `Web Application Attack`
   - Source IP: Real client/attacker IP
   - MITRE ATT&CK Mapping: `T1190`, `T1059`, `T1083`
