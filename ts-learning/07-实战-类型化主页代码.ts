// ============================================================
// 第七课：实战 — 把主页的 JS 模块类型化
// ============================================================
// 不运行，只练习给已有 JS 加类型

// -------------------------------------------------------
// 1. 留言板模块 — 类型化
// -------------------------------------------------------

interface ChatMessage {
  id: string;
  name: string;
  text: string;
  time: number; // 时间戳
}

// 新建留言（不含 id 和 time）
type NewMessageInput = Omit<ChatMessage, "id" | "time">;

// 留言列表
let chatMessages: ChatMessage[] = [];

function addMessage(input: NewMessageInput): ChatMessage {
  let msg: ChatMessage = {
    id: crypto.randomUUID(),
    name: input.name,
    text: input.text,
    time: Date.now(),
  };
  chatMessages = [...chatMessages, msg];
  return msg;
}

function deleteMessage(id: string): void {
  chatMessages = chatMessages.filter((m) => m.id !== id);
}

function getMessageStats(): { total: number; uniqueNames: number } {
  let names = chatMessages.map((m) => m.name);
  let unique = new Set(names);
  return {
    total: chatMessages.length,
    uniqueNames: unique.size,
  };
}

// -------------------------------------------------------
// 2. 主题切换 — 类型化
// -------------------------------------------------------

type ThemeMode = "dark" | "light";

function getTheme(): ThemeMode {
  let saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return "dark";
}

function setTheme(theme: ThemeMode): void {
  localStorage.setItem("theme", theme);
  document.body.className = theme;
}

// -------------------------------------------------------
// 3. 随机名言 — 类型化
// -------------------------------------------------------

interface Quote {
  content: string;
  author: string;
}

type QuoteFetchState =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "loaded"; quote: Quote }
  | { state: "error"; message: string };

let quoteState: QuoteFetchState = { state: "idle" };

let fallbackQuotes: Quote[] = [
  { content: "人不能两次踏入同一条河流。", author: "赫拉克利特" },
  { content: "我思故我在。", author: "笛卡尔" },
  { content: "知之为知之，不知为不知，是知也。", author: "《论语》" },
];

function getRandomQuote(): Quote {
  let i = Math.floor(Math.random() * fallbackQuotes.length);
  return fallbackQuotes[i];
}

async function fetchQuote(): Promise<Quote> {
  let response = await fetch("https://api.quotable.io/random");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  let data = await response.json();
  return { content: data.content, author: data.author };
}

// -------------------------------------------------------
// 4. 2048 游戏核心 — 类型化
// -------------------------------------------------------

type Grid = number[]; // 长度为 16 的一维数组
type Direction = 0 | 1 | 2 | 3; // 左 右 上 下

interface GameState {
  grid: Grid;
  score: number;
  over: boolean;
  won: boolean;
}

interface GameSnapshot {
  grid: Grid;
  score: number;
}

interface SlideResult {
  row: number[];
  merged: number[];
}

function createGame(): GameState {
  return {
    grid: Array(16).fill(0),
    score: 0,
    over: false,
    won: false,
  };
}

function slideRow(row: number[], score: number): SlideResult {
  let arr = row.filter((v) => v);
  let mergedVals: number[] = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) {
      arr[i] *= 2;
      mergedVals.push(arr[i]);
      arr[i + 1] = 0;
    }
  }
  arr = arr.filter((v) => v);
  while (arr.length < 4) arr.push(0);
  return { row: arr, merged: mergedVals };
}

let g2048KeyMap: Record<string, Direction> = {
  ArrowLeft: 0,
  ArrowRight: 1,
  ArrowUp: 2,
  ArrowDown: 3,
};

// -------------------------------------------------------
// 5. 总结：类型设计思路
// -------------------------------------------------------
// 1. 先想清楚数据的"形状" — 用 interface/type 描述
// 2. 函数签名要写清楚 — 参数类型 + 返回值类型
// 3. 状态用可辨识联合 — state 字段区分不同情况
// 4. 用工具类型（Omit/Pick/Partial）减少重复
// 5. 泛型让工具函数保持类型安全

console.log("✅ 第七课完成！全部课程结束 🎉");

export {};
