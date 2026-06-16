// ============================================================
// 第五课：泛型 (Generics) — 让函数和类型能"接收类型参数"
// ============================================================
// 泛型 = 类型的变量。像函数参数，但传的是类型

// -------------------------------------------------------
// 1. 为什么需要泛型
// -------------------------------------------------------

// 没有泛型 —— 返回 any，丢失类型信息
function firstElementAny(arr: any[]): any {
  return arr[0];
}
let a1 = firstElementAny([1, 2, 3]);  // a1 类型是 any

// 有泛型 —— 保留类型信息
function firstElement<T>(arr: T[]): T {
  return arr[0];
}
let a2 = firstElement([1, 2, 3]);     // a2 类型是 number
let a3 = firstElement(["a", "b"]);    // a3 类型是 string

// <T> 就是一个类型变量，调用时自动推导

// -------------------------------------------------------
// 2. 泛型函数 — 常见模式
// -------------------------------------------------------

// 返回和参数相同的类型
function identity<T>(value: T): T {
  return value;
}

let s = identity("hello");  // s: string
let n = identity(42);       // n: number

// 两个参数相同类型
function makePair<T>(a: T, b: T): [T, T] {
  return [a, b];
}

makePair(1, 2);       // ✅ [number, number]
makePair("a", "b");   // ✅ [string, string]
// makePair(1, "a");  // ❌ 类型不一致

// -------------------------------------------------------
// 3. 泛型约束 — extends
// -------------------------------------------------------

// 要求 T 必须有 length 属性
function logLength<T extends { length: number }>(item: T): T {
  console.log(item.length);
  return item;  // 返回原类型，不会丢失
}

logLength("hello");     // 5 — string 有 length
logLength([1, 2, 3]);  // 3 — array 有 length
// logLength(123);      // ❌ number 没有 length

// 实用例子：要求对象有 name 属性
interface HasName {
  name: string;
}

function greet2<T extends HasName>(obj: T): string {
  return `你好，${obj.name}！`;
  // 返回后 obj 还是原类型
}

greet2({ name: "being", age: 22 }); // 传了多余属性也没问题

// -------------------------------------------------------
// 4. 泛型 interface
// -------------------------------------------------------

// API 响应的通用包装
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// T 不同，类型不同
type UserResponse = ApiResponse<{ name: string; age: number }>;
type ListResponse = ApiResponse<string[]>;

let res1: UserResponse = {
  code: 200,
  message: "ok",
  data: { name: "being", age: 22 },
};

// res1.data.name  ✅ data 的类型是对的

// -------------------------------------------------------
// 5. keyof — 获取对象的所有键
// -------------------------------------------------------

interface Person {
  name: string;
  age: number;
  email: string;
}

// keyof Person = "name" | "age" | "email"
type PersonKey = keyof Person;

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let person: Person = { name: "being", age: 22, email: "b@test.com" };

getProperty(person, "name");  // ✅ 返回 string
getProperty(person, "age");   // ✅ 返回 number
// getProperty(person, "foo"); // ❌ "foo" 不是 Person 的键

// -------------------------------------------------------
// 6. 练习：写一个通用的 localStorage 读写函数
// -------------------------------------------------------

// 目标：存什么类型，取出来就是什么类型
function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  let raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  return JSON.parse(raw) as T;
}

// 使用
interface Settings {
  theme: "dark" | "light";
  fontSize: number;
}

// 存 —— T 自动推导为 Settings
saveToStorage("settings", { theme: "dark", fontSize: 16 });

// 取 —— 明确告诉 TS 类型
let settings = loadFromStorage<Settings>("settings", {
  theme: "light",
  fontSize: 14,
});

// settings.theme —— 类型安全 ✅

console.log("✅ 第五课完成！");

export {};
