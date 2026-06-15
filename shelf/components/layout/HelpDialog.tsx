"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bookmark, FileText, Search, Tag, Link2, PenLine } from "lucide-react";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            📦 使用帮助
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm text-zinc-300">
          {/* 收藏 */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-zinc-100 mb-2">
              <Bookmark className="w-4 h-4 text-blue-400" />
              收藏链接
            </h3>
            <ol className="list-decimal pl-5 space-y-1 text-zinc-400">
              <li>点虚线框 <span className="text-zinc-200">「+ 添加新链接…」</span></li>
              <li>粘贴一个网址（如一篇博客、新闻、文档）</li>
              <li>加标签（逗号分隔，如 <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-xs">前端, Next.js</code>）</li>
              <li>点「收藏」——自动抓取标题、摘要和封面图</li>
              <li>hover 卡片可点 ✏️ 添加备注、点 🗑️ 删除</li>
            </ol>
          </section>

          {/* 笔记 */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-zinc-100 mb-2">
              <FileText className="w-4 h-4 text-green-400" />
              写笔记
            </h3>
            <ol className="list-decimal pl-5 space-y-1 text-zinc-400">
              <li>点顶部 <span className="text-zinc-200">「笔记」</span> → <span className="text-zinc-200">「新建」</span></li>
              <li>输入标题和正文——支持 Markdown 格式</li>
              <li>编辑器支持：<strong>粗体</strong>、标题、列表、引用、代码块、链接</li>
              <li>点右上角「保存」——可随时回来编辑</li>
            </ol>
          </section>

          {/* 搜索 */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-zinc-100 mb-2">
              <Search className="w-4 h-4 text-yellow-400" />
              搜索 & 筛选
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>右上角搜索框输入关键词 → 回车搜索</li>
              <li>搜索范围：标题、摘要、备注、标签</li>
              <li>点标签徽章可以按标签筛选</li>
              <li>点「× 清除」回到全部</li>
            </ul>
          </section>

          {/* 标签 */}
          <section>
            <h3 className="flex items-center gap-2 font-semibold text-zinc-100 mb-2">
              <Tag className="w-4 h-4 text-purple-400" />
              标签管理
            </h3>
            <p className="text-zinc-400">
              添加收藏或创建笔记时，用逗号分隔输入标签。标签会自动出现在收藏和笔记页面顶部，点击即可筛选。
            </p>
          </section>

          {/* 快捷技巧 */}
          <section className="bg-zinc-800/50 rounded-lg p-3">
            <h3 className="flex items-center gap-2 font-semibold text-zinc-100 mb-2">
              <Link2 className="w-4 h-4 text-sky-400" />
              快捷技巧
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>收藏链接会自动抓取 Open Graph 元数据（标题/摘要/封面）</li>
              <li>收藏卡片 hover 显示删除按钮</li>
              <li>笔记编辑器下方有完整的格式工具栏</li>
              <li>数据存储在本地 SQLite 数据库中</li>
            </ul>
          </section>

          <p className="text-center text-xs text-zinc-600 pt-2">
            🚧 Shelf Phase 1 · Phase 2 将加入 AI 语义搜索和写作助手
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
