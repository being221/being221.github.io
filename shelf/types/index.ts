// === 收藏链接 ===
export interface Link {
  id: string;
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
  note: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LinkFormData {
  url: string;
  note?: string;
  tags?: string[];
}

// === 笔记 ===
export interface Note {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteFormData {
  title: string;
  content?: string;
  tags?: string[];
}

// === 标签 ===
export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
}

// === OG 元数据 ===
export interface OgMetadata {
  title: string;
  description: string | null;
  image: string | null;
  siteName: string | null;
}
