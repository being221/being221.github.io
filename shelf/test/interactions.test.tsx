import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// mock — 必须放在 import 之前
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

vi.mock("@/lib/storage", () => ({
  addLink: vi.fn(() => ({ id: "test", url: "", title: "", description: null, imageUrl: null, siteName: null, note: null, tags: [], createdAt: "", updatedAt: "" })),
  getLinks: vi.fn(() => []),
  getTags: vi.fn(() => []),
}));

import { SearchBar } from "@/components/search/SearchBar";
import { LinkForm } from "@/components/links/LinkForm";

// ========== SearchBar ==========
describe("SearchBar", () => {
  it("渲染搜索输入框", () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText("搜索收藏和笔记...")).toBeDefined();
  });

  it("输入文字后出现清除按钮", () => {
    render(<SearchBar />);
    let input = screen.getByPlaceholderText("搜索收藏和笔记...");
    fireEvent.change(input, { target: { value: "React" } });
    expect(screen.getByRole("button")).toBeDefined();
  });
});

// ========== LinkForm ==========
describe("LinkForm", () => {
  let onAdded = vi.fn();

  it("初始显示虚线添加按钮", () => {
    render(<LinkForm onAdded={onAdded} />);
    expect(screen.getByText("添加新链接...")).toBeDefined();
  });

  it("点击虚线框展开表单", async () => {
    render(<LinkForm onAdded={onAdded} />);
    await userEvent.click(screen.getByText("添加新链接..."));
    expect(screen.getByText("收藏")).toBeDefined();
    expect(screen.getByText("取消")).toBeDefined();
  });

  it("展开后点取消收回表单", async () => {
    render(<LinkForm onAdded={onAdded} />);
    await userEvent.click(screen.getByText("添加新链接..."));
    await userEvent.click(screen.getByText("取消"));
    expect(screen.getByText("添加新链接...")).toBeDefined();
  });

  it("填写 URL 和标签后点收藏提交", async () => {
    render(<LinkForm onAdded={onAdded} />);
    await userEvent.click(screen.getByText("添加新链接..."));

    let urlInput = screen.getByPlaceholderText(/粘贴 URL/);
    let tagInput = screen.getByPlaceholderText(/标签/);
    await userEvent.type(urlInput, "https://example.com");
    await userEvent.type(tagInput, "前端, Demo");

    await userEvent.click(screen.getByText("收藏"));

    let { addLink } = await import("@/lib/storage");
    expect(addLink).toHaveBeenCalled();
    expect(onAdded).toHaveBeenCalled();
  });
});