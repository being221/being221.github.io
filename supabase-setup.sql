-- 在 Supabase SQL Editor 里执行（左侧菜单 → SQL Editor → New query）
CREATE TABLE messages (
  id BIGSERIAL PRIMARY KEY,
  nickname TEXT NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  reply_time TIMESTAMPTZ,
  device_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
