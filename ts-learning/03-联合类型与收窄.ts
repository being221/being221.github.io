// ============================================================
// 第三课：联合类型与类型收窄
// ============================================================
// TS 最常用的模式之一：一个值可能是多种类型
// 然后通过判断确定它具体是哪种

// -------------------------------------------------------
// 1. 联合类型 (Union Type) — A | B
// -------------------------------------------------------

type Status = "loading" | "success" | "error";

let currentStatus: Status = "loading";

function handleStatus(s: Status) {
  // 直接用 === 比较
  if (s === "loading") {
    console.log("加载中...");
  } else if (s === "success") {
    console.log("成功！");
  } else {
    // TS 知道这里只剩 "error"
    console.log(s.toUpperCase()); // s 确定是 "error"
  }
}

// -------------------------------------------------------
// 2. 类型收窄 (Type Narrowing)
// -------------------------------------------------------
// TS 根据条件判断，自动缩小类型范围

function printId(id: string | number) {
  // id 可能是 string 或 number

  if (typeof id === "string") {
    // 这里面 id 一定是 string
    console.log(id.toUpperCase());
  } else {
    // 这里面 id 一定是 number
    console.log(id.toFixed(2));
  }
}

// -------------------------------------------------------
// 3. 可辨识联合 (Discriminated Union)
// -------------------------------------------------------
// 给每个类型加一个共同的"标签"字段，用这个字段区分

interface Circle {
  kind: "circle";   // 标签
  radius: number;
}

interface Rectangle {
  kind: "rectangle"; // 标签
  width: number;
  height: number;
}

interface Triangle {
  kind: "triangle";  // 标签
  base: number;
  height: number;
}

type Shape = Circle | Rectangle | Triangle;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;  // shape 自动收窄为 Circle
    case "rectangle":
      return shape.width * shape.height;   // shape 收窄为 Rectangle
    case "triangle":
      return (shape.base * shape.height) / 2; // shape 收窄为 Triangle
  }
}

console.log(getArea({ kind: "circle", radius: 5 }));        // ~78.54
console.log(getArea({ kind: "rectangle", width: 4, height: 6 })); // 24

// -------------------------------------------------------
// 4. 实际场景：API 请求的三态模式
// -------------------------------------------------------

interface LoadingState {
  state: "loading";
}

interface SuccessState {
  state: "success";
  data: string[];
}

interface ErrorState {
  state: "error";
  message: string;
}

type RequestState = LoadingState | SuccessState | ErrorState;

function render(r: RequestState) {
  switch (r.state) {
    case "loading":
      return "⏳ 加载中...";
    case "success":
      return `✅ 获取到 ${r.data.length} 条数据`;
    case "error":
      return `❌ 出错：${r.message}`;
  }
}

console.log(render({ state: "loading" }));
console.log(render({ state: "success", data: ["a", "b", "c"] }));
console.log(render({ state: "error", message: "网络异常" }));

// -------------------------------------------------------
// 5. as const — 把值变成字面量类型
// -------------------------------------------------------
// 不加 as const，TS 推断为 string[]
// 加了 as const，推断为 readonly ["red", "green", "blue"]

let colors1 = ["red", "green", "blue"];        // 类型: string[]
let colors2 = ["red", "green", "blue"] as const; // 类型: readonly ["red", "green", "blue"]

// colors2[0] 的类型是 "red"，不是 string

// 实用场景：从数组推导联合类型
let COLORS = ["red", "green", "blue"] as const;
type Color = (typeof COLORS)[number]; // 类型: "red" | "green" | "blue"

let myColor: Color = "red";  // ✅
// let badColor: Color = "yellow";  // ❌

// -------------------------------------------------------
// 练习：把随机名言的状态设计成可辨识联合
// -------------------------------------------------------

// 考虑三种情况：空闲、加载中、有数据、出错
// 用你主页 getQuote 的逻辑来设计类型

interface Idle {
  state: "idle";
}
interface Loading {
  state: "loading";
}
interface QuoteData {
  state: "loaded";
  content: string;
  author: string;
}
interface QuoteError {
  state: "error";
  message: string;
}

type QuoteState = Idle | Loading | QuoteData | QuoteError;

console.log("✅ 第三课完成！");

export {};
