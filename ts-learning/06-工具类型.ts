// ============================================================
// 第六课：常用工具类型 — TS 内置的"类型函数"
// ============================================================
// TS 自带了很多工具类型，不需要自己写

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}

// -------------------------------------------------------
// 1. Partial<T> — 所有属性变可选
// -------------------------------------------------------
// 常用于：更新接口，只传要改的字段

type UserUpdate = Partial<User>;
// 等价于 { id?: number; name?: string; email?: string; ... }

function updateUser(id: number, changes: UserUpdate): void {
  // changes 里可以只传 { name: "新名字" }
}

updateUser(1, { name: "新名字" });           // ✅
updateUser(1, { name: "新", age: 23 });     // ✅
// updateUser(1, { foo: "bar" });            // ❌ foo 不是 User 属性

// -------------------------------------------------------
// 2. Required<T> — 所有属性变必填
// -------------------------------------------------------

interface Config {
  debug?: boolean;
  port?: number;
  host?: string;
}

type FullConfig = Required<Config>;
// debug, port, host 全部变成必填

// let c: FullConfig = { debug: true };  // ❌ 缺少 port 和 host

// -------------------------------------------------------
// 3. Pick<T, K> — 从对象中挑几个属性
// -------------------------------------------------------

type UserBrief = Pick<User, "id" | "name">;
// 只有 id 和 name

let brief: UserBrief = { id: 1, name: "being" };

// -------------------------------------------------------
// 4. Omit<T, K> — 排除几个属性
// -------------------------------------------------------
// 比 Pick 更常用：说不要什么比说要什么更快

type UserWithoutPassword = Omit<User, "createdAt">;
// 除了 createdAt 之外的全部

type PublicUser = Omit<User, "email" | "createdAt">;
// 排除 email 和 createdAt

// -------------------------------------------------------
// 5. Record<K, V> — 快速创建键值对映射
// -------------------------------------------------------

type Page = "home" | "about" | "contact";
type PageTitles = Record<Page, string>;
// 等价于 { home: string; about: string; contact: string }

let titles: PageTitles = {
  home: "首页",
  about: "关于",
  contact: "联系我们",
};

// 实战：缓存映射
type CacheKey = string;
type CacheEntry = { data: unknown; timestamp: number };
type Cache = Record<CacheKey, CacheEntry>;

// -------------------------------------------------------
// 6. Exclude / Extract — 从联合类型中排除/提取
// -------------------------------------------------------

type AllStatus = "loading" | "success" | "error" | "idle";

type ActiveStatus = Exclude<AllStatus, "idle">;
// "loading" | "success" | "error"

type SettledStatus = Extract<AllStatus, "success" | "error">;
// "success" | "error"

// -------------------------------------------------------
// 7. ReturnType<T> — 获取函数返回值类型
// -------------------------------------------------------

function getQuote() {
  return { content: "知之为知之", author: "孔子" };
}

type Quote = ReturnType<typeof getQuote>;
// { content: string; author: string }

// 不需要手动写返回值类型，让 TS 推导然后用 ReturnType 提取

// -------------------------------------------------------
// 8. NonNullable<T> — 去掉 null 和 undefined
// -------------------------------------------------------

type MaybeString = string | null | undefined;
type DefiniteString = NonNullable<MaybeString>;  // 就是 string

// -------------------------------------------------------
// 练习：用工具类型重构留言板类型
// -------------------------------------------------------

interface Message {
  id: string;
  name: string;
  text: string;
  time: number;
  pinned: boolean;
}

// 新建留言时不需要 id 和 time
type NewMessage = Omit<Message, "id" | "time">;

// 编辑留言时所有字段可选
type EditMessage = Partial<Omit<Message, "id">>;

// 留言列表的键值对映射（id → Message）
type MessageMap = Record<string, Message>;

let newMsg: NewMessage = { name: "小明", text: "你好", pinned: false };
let editMsg: EditMessage = { text: "修改后的内容" };

console.log("✅ 第六课完成！");

export {};
