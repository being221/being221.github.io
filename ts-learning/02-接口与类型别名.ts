// ============================================================
// 第二课：interface 和 type — 给对象形状起名字
// ============================================================
// 上节课对象类型是直接写 { name: string; age: number }
// 不能复用，每次都要写一遍 → 用 interface/type 解决

// -------------------------------------------------------
// 1. interface — 接口
// -------------------------------------------------------
// 描述对象的"形状"（有什么属性，什么类型）

interface User {
  name: string;
  age: number;
  email?: string;     // ? = 可选
  readonly id: number; // readonly = 创建后不能改
}

let user1: User = {
  name: "being",
  age: 22,
  id: 1,
};

// user1.id = 2;       // ❌ readonly 不能改
user1.name = "being2";  // ✅ 非 readonly 可以改

// -------------------------------------------------------
// 2. type — 类型别名
// -------------------------------------------------------
// 和 interface 很像，但更灵活（除了对象还能定义别的）

type User2 = {
  name: string;
  age: number;
};

type ID = string | number;   // interface 做不到这个
type Point = { x: number; y: number };
type Callback = () => void;   // 函数类型也能起别名

// -------------------------------------------------------
// 3. interface vs type 怎么选
// -------------------------------------------------------
// 大部分情况可以互换。简单规则：
// - 对象形状 → interface（可扩展性更好）
// - 联合类型/简单别名 → type
// - 不确定 → 先用 interface

// -------------------------------------------------------
// 4. interface 的合并 (Declaration Merging)
// -------------------------------------------------------
// interface 同名会自动合并，type 不行

interface Animal {
  name: string;
}

interface Animal {
  age: number;
}

// 现在 Animal 同时有 name 和 age
let cat: Animal = { name: "咪咪", age: 3 };

// -------------------------------------------------------
// 5. extends — 继承
// -------------------------------------------------------

interface Person {
  name: string;
  age: number;
}

interface Student extends Person {
  grade: string;
  studentId: number;
}

// Student 拥有 Person 的全部属性 + 自己的属性
let s1: Student = {
  name: "小明",
  age: 18,
  grade: "大三",
  studentId: 2024001,
};

// type 的继承写法（交叉类型 &）
type Animal2 = { name: string };
type Dog = Animal2 & { breed: string; bark(): void };

let d1: Dog = {
  name: "旺财",
  breed: "柴犬",
  bark() {
    console.log("汪");
  },
};

// -------------------------------------------------------
// 6. 索引签名 (Index Signature)
// -------------------------------------------------------
// 当你不确定属性名，但知道类型时

interface StringMap {
  [key: string]: string;  // 所有属性名是 string，值是 string
}

let dict: StringMap = {
  hello: "你好",
  goodbye: "再见",
  // age: 123,  // ❌ 值必须是 string
};

// -------------------------------------------------------
// 7. 函数在 interface 里
// -------------------------------------------------------

interface Calculator {
  add(a: number, b: number): number;
  subtract(a: number, b: number): number;
}

let calc: Calculator = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
};

// -------------------------------------------------------
// 练习：把留言板的数据结构用 interface 定义
// -------------------------------------------------------

// 原 JS 数据形状：
// { name: "小明", text: "加油！", time: 1715678900000 }

interface Message {
  name: string;
  text: string;
  time: number; // 时间戳
}

// 再加一个 id 字段（可选）：
interface MessageV2 {
  id?: string;
  name: string;
  text: string;
  time: number;
}

let msgs: MessageV2[] = [
  { name: "小明", text: "加油！", time: Date.now() },
  { id: "a1", name: "小红", text: "你好", time: Date.now() },
];

console.log("✅ 第二课完成！");

export {};
