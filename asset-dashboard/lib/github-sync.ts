import { Transaction } from './types';

interface SyncConfig {
  token: string;
  owner: string;
  repo: string;
  path: string;
}

const CONFIG_KEY = 'asset-dashboard-sync-config';

export function getSyncConfig(): SyncConfig | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SyncConfig;
  } catch {
    return null;
  }
}

export function saveSyncConfig(config: SyncConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function clearSyncConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CONFIG_KEY);
}

/** 拉取 GitHub 上的数据 */
export async function fetchFromGitHub(
  config: SyncConfig
): Promise<{ transactions: Transaction[]; sha: string } | null> {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: 'application/vnd.github.v3+json',
      'Cache-Control': 'no-cache',
    },
  });

  if (res.status === 404) return null; // 文件还不存在
  if (!res.ok) {
    throw new Error(`GitHub fetch 失败: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  // GitHub API 有时返回数组（目录列表），有时返回单个文件对象
  if (Array.isArray(data)) return null;

  const content = decodeURIComponent(
    escape(atob(data.content))
  );
  const transactions = JSON.parse(content) as Transaction[];
  return { transactions, sha: data.sha };
}

/** 合并远程和本地交易（按 id 去重，本地优先） */
function mergeTransactions(
  remote: Transaction[],
  local: Transaction[]
): Transaction[] {
  const map = new Map<string, Transaction>();
  for (const tx of remote) map.set(tx.id, tx);
  for (const tx of local) map.set(tx.id, tx); // 本地覆盖远程
  return Array.from(map.values());
}

/** 推送交易数据到 GitHub（自动合并，防止覆盖丢数据） */
export async function pushToGitHub(
  transactions: Transaction[]
): Promise<{ success: boolean; error?: string }> {
  const config = getSyncConfig();
  if (!config) return { success: false, error: '未配置同步' };

  try {
    // 先拉取远程最新数据
    let sha: string | undefined;
    let merged: Transaction[] = transactions;

    try {
      const existing = await fetchFromGitHub(config);
      if (existing) {
        sha = existing.sha;
        merged = mergeTransactions(existing.transactions, transactions);
      }
    } catch {
      // 拉取失败（比如文件还不存在），直接用本地数据
    }

    const json = JSON.stringify(merged, null, 2);
    const content = btoa(unescape(encodeURIComponent(json)));

    const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.path}`;
    const body: Record<string, unknown> = {
      message: `sync: 更新交易记录 (${new Date().toLocaleString('zh-CN')})`,
      content,
    };
    if (sha) body.sha = sha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const msg =
        (errData as { message?: string }).message ?? `HTTP ${res.status}`;
      return { success: false, error: msg };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : '网络错误',
    };
  }
}

/** 验证 Token 是否有效 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    return res.ok;
  } catch {
    return false;
  }
}
