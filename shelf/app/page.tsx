"use client";

import { useState, useEffect, useCallback } from "react";
import { getLinks, getLinksByTag } from "@/lib/storage";
import { LinkForm } from "@/components/links/LinkForm";
import { LinkGrid } from "@/components/links/LinkGrid";
import { SearchBar } from "@/components/search/SearchBar";
import { TagFilter } from "@/components/tags/TagFilter";
import type { Link } from "@/types";

export default function HomePage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");

  const loadLinks = useCallback(() => {
    const data = tag ? getLinksByTag(tag) : getLinks(query);
    setLinks(data);
  }, [query, tag]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  // 监听元数据更新事件
  useEffect(() => {
    const handler = () => loadLinks();
    window.addEventListener("shelf-update", handler);
    return () => window.removeEventListener("shelf-update", handler);
  }, [loadLinks]);

  // 从 URL 读取搜索/标签参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") || "");
    setTag(params.get("tag") || "");
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">收藏</h1>
        <SearchBar />
      </div>
      <TagFilter />
      <LinkForm onAdded={loadLinks} />
      <LinkGrid links={links} onDelete={loadLinks} />
    </div>
  );
}
