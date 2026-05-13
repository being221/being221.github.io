import { useState, useEffect } from "react";

function safeGet(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 静默失败——微信等环境下存储不可用
  }
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => safeGet(key, initialValue));

  useEffect(() => {
    safeSet(key, value);
  }, [key, value]);

  return [value, setValue];
}
