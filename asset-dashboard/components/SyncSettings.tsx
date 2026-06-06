'use client';

import { useState, useEffect } from 'react';
import {
  getSyncConfig,
  saveSyncConfig,
  clearSyncConfig,
  verifyToken,
} from '@/lib/github-sync';

interface Props {
  onClose: () => void;
}

export default function SyncSettings({ onClose }: Props) {
  const existing = getSyncConfig();
  const [token, setToken] = useState(existing?.token ?? '');
  const [owner, setOwner] = useState(existing?.owner ?? 'being221');
  const [repo, setRepo] = useState(existing?.repo ?? 'being221.github.io');
  const [path, setPath] = useState(
    existing?.path ?? 'dashboard-data/transactions.json'
  );
  const [status, setStatus] = useState<'idle' | 'testing' | 'saving' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleTest = async () => {
    if (!token.trim()) {
      setMessage('请输入 Token');
      setStatus('error');
      return;
    }
    setStatus('testing');
    setMessage('验证中...');
    const valid = await verifyToken(token.trim());
    if (valid) {
      setStatus('ok');
      setMessage('✅ Token 有效');
    } else {
      setStatus('error');
      setMessage('❌ Token 无效，请检查');
    }
  };

  const handleSave = () => {
    if (!token.trim()) return;
    saveSyncConfig({
      token: token.trim(),
      owner: owner.trim() || 'being221',
      repo: repo.trim() || 'being221.github.io',
      path: path.trim() || 'dashboard-data/transactions.json',
    });
    setStatus('ok');
    setMessage('✅ 已保存！刷新页面后生效');
    setTimeout(onClose, 1500);
  };

  const handleClear = () => {
    clearSyncConfig();
    setToken('');
    setStatus('idle');
    setMessage('已清除同步配置');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-1">
          ⚙️ 同步设置
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          配置后，记账数据会自动同步到 GitHub 仓库，多设备共享
        </p>

        <div className="space-y-3">
          {/* Token */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              GitHub Token
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxx"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm font-mono focus:outline-none focus:border-sky-500/50 placeholder-slate-600"
              />
              <button
                onClick={handleTest}
                disabled={status === 'testing'}
                className="px-3 py-2 rounded-lg border border-slate-600 text-slate-400 text-xs hover:border-slate-500 transition shrink-0"
              >
                {status === 'testing' ? '...' : '测试'}
              </button>
            </div>
          </div>

          {/* Owner */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              仓库所有者
            </label>
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Repo */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              仓库名
            </label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Path */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              数据文件路径
            </label>
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-sm focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* Token 获取指引 */}
          <details className="text-xs text-slate-500">
            <summary className="cursor-pointer hover:text-slate-400">
              如何获取 Token？
            </summary>
            <div className="mt-2 space-y-1 text-slate-500">
              <p>1. 打开 GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens</p>
              <p>2. 点「Generate new token」</p>
              <p>3. 选仓库：<code className="text-sky-400">{owner}/{repo}</code></p>
              <p>4. 权限勾选：<code className="text-sky-400">Contents: Read and write</code></p>
              <p>5. 生成后复制 Token 粘贴到上面</p>
            </div>
          </details>
        </div>

        {/* 消息 */}
        {message && (
          <p
            className={`text-sm mt-3 px-3 py-2 rounded-lg ${
              status === 'error'
                ? 'text-red-400 bg-red-400/10'
                : 'text-emerald-400 bg-emerald-400/10'
            }`}
          >
            {message}
          </p>
        )}

        {/* 按钮 */}
        <div className="flex gap-3 mt-4">
          {existing && (
            <button
              onClick={handleClear}
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition"
            >
              清除配置
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-600 text-slate-400 text-sm hover:bg-slate-700/50 transition"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
