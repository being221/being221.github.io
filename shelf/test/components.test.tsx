import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TagBadge } from "@/components/tags/TagBadge";
import { LinkGrid } from "@/components/links/LinkGrid";

// ========== TagBadge ==========
describe("TagBadge", () => {
  it("渲染标签文字", () => {
    render(<TagBadge tag="前端" />);
    expect(screen.getByText("前端")).toBeDefined();
  });

  it("点击时触发 onClick 回调", () => {
    let clicked = false;
    render(<TagBadge tag="React" onClick={() => { clicked = true; }} />);
    fireEvent.click(screen.getByText("React"));
    expect(clicked).toBe(true);
  });

  it("没有 onClick 时点击不报错", () => {
    render(<TagBadge tag="Vue" />);
    fireEvent.click(screen.getByText("Vue")); // 不抛异常即通过
    expect(screen.getByText("Vue")).toBeDefined();
  });
});

// ========== LinkGrid ==========
describe("LinkGrid", () => {
  it("空列表显示占位提示", () => {
    let onDelete = vi.fn();
    render(<LinkGrid links={[]} onDelete={onDelete} />);
    expect(screen.getByText("还没有收藏任何链接")).toBeDefined();
  });

  it("有链接时渲染卡片列表", () => {
    let onDelete = vi.fn();
    let links = [
      {
        id: "1", url: "https://nextjs.org", title: "Next.js 官网",
        description: "React 框架", imageUrl: null, siteName: null,
        note: null, tags: ["前端"], createdAt: "2026-06-01T00:00:00Z", updatedAt: "2026-06-01T00:00:00Z",
      },
      {
        id: "2", url: "https://tailwindcss.com", title: "Tailwind CSS",
        description: "CSS 框架", imageUrl: null, siteName: null,
        note: null, tags: ["CSS"], createdAt: "2026-06-02T00:00:00Z", updatedAt: "2026-06-02T00:00:00Z",
      },
    ];
    render(<LinkGrid links={links} onDelete={onDelete} />);
    expect(screen.getByText("Next.js 官网")).toBeDefined();
    expect(screen.getByText("Tailwind CSS")).toBeDefined();
  });
});