import { describe, it, expect } from "vitest";
import { cn, serializeTags, deserializeTags, truncate, getDomain, formatDate } from "@/lib/utils";

// ========== cn() — 合并 Tailwind 类名 ==========
describe("cn()", () => {
  it("合并多个字符串", () => {
    expect(cn("text-sm", "font-bold")).toBe("text-sm font-bold");
  });

  it("过滤掉 falsy 值（false/null/undefined 不出现）", () => {
    expect(cn("text-sm", false && "hidden", undefined, "block")).toBe("text-sm block");
  });

  it("处理条件类名", () => {
    let active = true;
    expect(cn("base", active && "active")).toBe("base active");
  });
});

// ========== serializeTags / deserializeTags — 标签序列化 ==========
describe("标签序列化", () => {
  it("serializeTags 把数组转成 JSON 字符串", () => {
    expect(serializeTags(["前端", "React"])).toBe('["前端","React"]');
  });

  it("serializeTags 过滤空值", () => {
    expect(serializeTags(["前端", "", "React"])).toBe('["前端","React"]');
  });

  it("deserializeTags 把 JSON 字符串还原为数组", () => {
    expect(deserializeTags('["前端","React"]')).toEqual(["前端", "React"]);
  });

  it("deserializeTags 遇到 null 返回空数组", () => {
    expect(deserializeTags(null)).toEqual([]);
  });

  it("deserializeTags 遇到非法 JSON 返回空数组", () => {
    expect(deserializeTags("这不是 JSON")).toEqual([]);
  });

  it("往返一致：序列化 → 反序列化 → 原始数组", () => {
    let tags = ["历史", "哲学", "AI"];
    expect(deserializeTags(serializeTags(tags))).toEqual(tags);
  });
});

// ========== truncate() — 文本截断 ==========
describe("truncate()", () => {
  it("短文本不截断", () => {
    expect(truncate("hello")).toBe("hello");
  });

  it("超长文本截断并加省略号", () => {
    let long = "a".repeat(200);
    let result = truncate(long, 120);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBe(121); // 120 chars + …
  });

  it("正好等于最大长度不截断", () => {
    let exact = "a".repeat(120);
    expect(truncate(exact, 120)).toBe(exact);
  });

  it("默认最大长度为 120", () => {
    let long = "a".repeat(200);
    let result = truncate(long);
    expect(result.length).toBe(121);
  });
});

// ========== getDomain() — 提取域名 ==========
describe("getDomain()", () => {
  it("从完整 URL 提取域名", () => {
    expect(getDomain("https://nextjs.org/docs/app")).toBe("nextjs.org");
  });

  it("去掉 www 前缀", () => {
    expect(getDomain("https://www.github.com/being221")).toBe("github.com");
  });

  it("非法 URL 返回原值", () => {
    expect(getDomain("not-a-url")).toBe("not-a-url");
  });
});

// ========== formatDate() — 日期格式化 ==========
describe("formatDate()", () => {
  it("格式化 ISO 字符串为中文日期", () => {
    let result = formatDate("2026-06-15T10:30:00.000Z");
    // 不同时区可能差一天，只验证格式
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });
});
