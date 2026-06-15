import type { Link, LinkFormData, Note, NoteFormData, Tag } from "@/types";
import { generateId, now, serializeTags, deserializeTags } from "./utils";

// ===== localStorage 键名 =====
const LINKS_KEY = "shelf-links";
const NOTES_KEY = "shelf-notes";
const TAGS_KEY = "shelf-tags";

// ===== 读取 =====
function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

// ===== 写入 =====
function write<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== 链接 CRUD =====
export function getLinks(query?: string): Link[] {
  let links = read<Link>(LINKS_KEY);
  if (query) {
    const q = query.toLowerCase();
    links = links.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.description || "").toLowerCase().includes(q) ||
        (l.note || "").toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return links.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addLink(data: LinkFormData): Link {
  const link: Link = {
    id: generateId(),
    url: data.url,
    title: data.url,
    description: null,
    imageUrl: null,
    siteName: null,
    note: data.note || null,
    tags: data.tags || [],
    createdAt: now(),
    updatedAt: now(),
  };
  const links = [link, ...read<Link>(LINKS_KEY)];
  write(LINKS_KEY, links);

  // 异步抓取元数据
  fetchMetadataClient(data.url).then((meta) => {
    const all = read<Link>(LINKS_KEY);
    const idx = all.findIndex((l) => l.id === link.id);
    if (idx >= 0) {
      all[idx].title = meta.title || data.url;
      all[idx].description = meta.description;
      all[idx].imageUrl = meta.image;
      all[idx].siteName = meta.siteName;
      write(LINKS_KEY, all);
      // 触发自定义事件通知组件刷新
      window.dispatchEvent(new CustomEvent("shelf-update"));
    }
  });

  return link;
}

export function deleteLink(id: string) {
  const links = read<Link>(LINKS_KEY).filter((l) => l.id !== id);
  write(LINKS_KEY, links);
}

export function updateLinkNote(id: string, note: string) {
  const links = read<Link>(LINKS_KEY);
  const idx = links.findIndex((l) => l.id === id);
  if (idx >= 0) {
    links[idx].note = note;
    links[idx].updatedAt = now();
    write(LINKS_KEY, links);
  }
}

export function getLinksByTag(tag: string): Link[] {
  return read<Link>(LINKS_KEY)
    .filter((l) => l.tags.includes(tag))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ===== 笔记 CRUD =====
export function getNotes(query?: string): Note[] {
  let notes = read<Note>(NOTES_KEY);
  if (query) {
    const q = query.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content || "").toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getNote(id: string): Note | null {
  return read<Note>(NOTES_KEY).find((n) => n.id === id) || null;
}

export function createNote(data: NoteFormData): Note {
  const note: Note = {
    id: generateId(),
    title: data.title,
    content: data.content || "",
    tags: data.tags || [],
    createdAt: now(),
    updatedAt: now(),
  };
  write(NOTES_KEY, [note, ...read<Note>(NOTES_KEY)]);
  return note;
}

export function updateNote(id: string, data: Partial<NoteFormData>) {
  const notes = read<Note>(NOTES_KEY);
  const idx = notes.findIndex((n) => n.id === id);
  if (idx >= 0) {
    if (data.title !== undefined) notes[idx].title = data.title;
    if (data.content !== undefined) notes[idx].content = data.content;
    if (data.tags !== undefined) notes[idx].tags = data.tags;
    notes[idx].updatedAt = now();
    write(NOTES_KEY, notes);
  }
}

export function deleteNote(id: string) {
  write(
    NOTES_KEY,
    read<Note>(NOTES_KEY).filter((n) => n.id !== id)
  );
}

export function createNoteSimple(title: string, content: string): Note {
  return createNote({ title, content });
}

export function updateNoteSimple(id: string, title: string, content: string) {
  updateNote(id, { title, content });
}

// ===== 标签 CRUD =====
export function getTags(): Tag[] {
  return read<Tag>(TAGS_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createTag(name: string, color?: string): Tag {
  const tag: Tag = {
    id: generateId(),
    name: name.trim(),
    color: color || null,
    createdAt: now(),
  };
  // 去重
  const existing = read<Tag>(TAGS_KEY);
  if (existing.some((t) => t.name === tag.name)) {
    return existing.find((t) => t.name === tag.name)!;
  }
  write(TAGS_KEY, [tag, ...existing]);
  // 自动提取链接/笔记中的标签
  ensureTagsFromContent();
  return tag;
}

// ===== 从链接和笔记中提取标签 =====
function ensureTagsFromContent() {
  const allTags = new Set(read<Tag>(TAGS_KEY).map((t) => t.name));
  const linkTags = read<Link>(LINKS_KEY).flatMap((l) => l.tags);
  const noteTags = read<Note>(NOTES_KEY).flatMap((n) => n.tags);
  let changed = false;

  for (const name of [...linkTags, ...noteTags]) {
    if (!allTags.has(name)) {
      allTags.add(name);
      write(TAGS_KEY, [
        ...read<Tag>(TAGS_KEY),
        { id: generateId(), name, color: null, createdAt: now() },
      ]);
      changed = true;
    }
  }
  return changed;
}

// ===== 元数据抓取（客户端版） =====
async function fetchMetadataClient(url: string): Promise<{
  title: string;
  description: string | null;
  image: string | null;
  siteName: string | null;
}> {
  try {
    const response = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}`
    );
    const json = await response.json();
    const data = json.data;
    return {
      title: data?.title || url,
      description: data?.description || null,
      image: data?.image?.url || null,
      siteName: data?.publisher || null,
    };
  } catch {
    return { title: url, description: null, image: null, siteName: null };
  }
}
