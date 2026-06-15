"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, ChevronDown, ChevronUp, Key } from "lucide-react";

interface AIPanelProps {
  content: string;       // 当前笔记或收藏的完整文本
  title?: string;        // 标题（可选，用于提供上下文）
}

const ACTIONS: Record<string, { label: string; prompt: string; emoji: string }> = {
  expand: {
    label: "扩写",
    emoji: "📝",
    prompt: "请基于以下内容进行扩写，补充更多细节、例子和论证，保持原文风格。不要添加结尾的署名或标记：",
  },
  summarize: {
    label: "总结",
    emoji: "📋",
    prompt: "请用简练的语言总结以下内容的核心要点，分点列出，每条不超过两句话。不要添加结尾的署名或标记：",
  },
  translate: {
    label: "翻译",
    emoji: "🌐",
    prompt: "请将以下中文内容翻译成英文，保持原有的语气和风格。如果原文是英文则翻译成中文。不要添加结尾的署名或标记：",
  },
  relate: {
    label: "关联",
    emoji: "🔗",
    prompt: "基于以下内容，提出3-5个与其相关的主题、概念或问题，每个关联用一两句话说明为什么相关。不要添加结尾的署名或标记：",
  },
};

export function AIPanel({ content, title }: AIPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("shelf-ai-key") || "";
    return "";
  });

  const saveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("shelf-ai-key", key);
  };

  const handleAction = async (action: string) => {
    if (!apiKey.trim()) {
      setShowApiKey(true);
      setError("请先填入 API Key");
      return;
    }
    if (!content.trim()) {
      setError("当前没有内容可以处理");
      return;
    }

    setLoading(action);
    setError("");
    setResult("");
    setOpen(true);

    try {
      let fullPrompt = ACTIONS[action].prompt;
      if (title) fullPrompt += `\n\n标题：${title}`;
      fullPrompt += `\n\n内容：\n${content}`;

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, apiKey }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "请求失败");
      }

      // 流式读取
      const reader = response.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // 解析 SSE 格式
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = line.slice(2).replace(/^"|"$/g, "");
              fullText += text;
              setResult(fullText);
            } catch {}
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setLoading("");
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
  };

  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      {/* 折叠标题栏 */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800/50 transition-colors text-sm"
      >
        <span className="flex items-center gap-2 text-zinc-300">
          <Sparkles className="w-4 h-4 text-blue-400" />
          AI 助手
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
        </span>
        {open ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronUp className="w-4 h-4 text-zinc-500" />}
      </button>

      {open && (
        <div className="p-4 space-y-3 bg-zinc-900/50">
          {/* API Key 区域 */}
          {showApiKey ? (
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => saveKey(e.target.value)}
                placeholder="粘贴 Anthropic API Key (sk-ant-...)"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => { setShowApiKey(false); setError(""); }}
                className="text-xs px-2 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white"
              >
                确定
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowApiKey(true)}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
            >
              <Key className="w-3 h-3" />
              {apiKey ? "已设置 API Key (点击更换)" : "设置 API Key"}
            </button>
          )}

          {/* 错误 */}
          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* 操作按钮 */}
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(ACTIONS).map(([key, { label, emoji }]) => (
              <button
                key={key}
                onClick={() => handleAction(key)}
                disabled={!!loading}
                className="px-3 py-1.5 text-xs rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white disabled:opacity-50 transition-colors"
              >
                {emoji} {label}
              </button>
            ))}
          </div>

          {/* 结果 */}
          {result && (
            <div className="relative">
              <div className="p-3 bg-zinc-800 rounded-md text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                {result}
              </div>
              <button
                onClick={copyResult}
                className="absolute top-2 right-2 p-1.5 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300 transition-colors"
                title="复制到剪贴板"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
