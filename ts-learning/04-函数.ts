// ============================================================
// 第四课：TypeScript 中的函数
// ============================================================
// JS 函数参数没类型 → 传错了不知道 → 函数签名解决

// -------------------------------------------------------
// 1. 参数类型 + 返回值类型
// -------------------------------------------------------

function add(a: number, b: number): number {
  return a + b;
}

// add("1", "2");  // ❌ 参数类型不匹配
add(1, 2);         // ✅

// 箭头函数的写法
let multiply = (a: number, b: number): number => a * b;

// 无返回值用 void
function log(msg: string): void {
  console.log(msg);
}

// -------------------------------------------------------
// 2. 可选参数 — 用 ?
// -------------------------------------------------------

function greet(name: string, title?: string): string {
  if (title) {
    return `你好，${title}${name}`;
  }
  return `你好，${name}`;
}

greet("being");              // "你好，being"
greet("being", "同学");      // "你好，同学being"

// -------------------------------------------------------
// 3. 默认参数
// -------------------------------------------------------

function rollDice(sides: number = 6): number {
  return Math.floor(Math.random() * sides) + 1;
}

rollDice();    // 默认 6 面骰子
rollDice(20);  // 20 面骰子

// -------------------------------------------------------
// 4. 剩余参数 — ...rest 带类型
// -------------------------------------------------------

function sum(...nums: number[]): number {
  return nums.reduce((total, n) => total + n, 0);
}

sum(1, 2, 3);       // 6
sum(10, 20, 30, 40); // 100

// -------------------------------------------------------
// 5. 函数类型表达式
// -------------------------------------------------------

// (参数类型) => 返回值类型
type MathFn = (a: number, b: number) => number;

let add2: MathFn = (a, b) => a + b;
let subtract: MathFn = (a, b) => a - b;

// 回调函数的类型
function fetchData(callback: (data: string) => void): void {
  // 模拟异步
  setTimeout(() => callback("获取到的数据"), 1000);
}

fetchData((data) => {
  console.log(data.toUpperCase()); // data 的类型安全
});

// -------------------------------------------------------
// 6. 函数重载 (Overload)
// -------------------------------------------------------
// 同一个函数，不同参数返回不同类型
// 用得少，但标准库经常这样写（如 Date 构造函数）

function getLength(value: string): number;
function getLength(value: any[]): number;
function getLength(value: string | any[]): number {
  return value.length;
}

getLength("hello");  // ✅ 返回 number
getLength([1, 2, 3]); // ✅ 返回 number

// -------------------------------------------------------
// 7. 练习：把主页的函数加上类型
// -------------------------------------------------------

// 原 JS：
// function updateTime() {
//   let now = new Date();
//   let h = String(now.getHours()).padStart(2, "0");
//   let m = String(now.getMinutes()).padStart(2, "0");
//   let s = String(now.getSeconds()).padStart(2, "0");
//   return `${h}:${m}:${s}`;
// }

// TS 版本：
function updateTime(): string {
  let now = new Date();
  let h = String(now.getHours()).padStart(2, "0");
  let m = String(now.getMinutes()).padStart(2, "0");
  let s = String(now.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

console.log(updateTime());
console.log("✅ 第四课完成！");

export {};
