"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { TagBadge } from "@/components/tags/TagBadge";
import { deleteNote } from "@/app/actions/notes";
import { formatDate, truncate } from "@/lib/utils";
import type { Note } from "@/types";

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p className="text-4xl mb-4">📝</p>
        <p>还没有笔记</p>
        <p className="text-sm mt-1">创建你的第一篇笔记吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className="group flex items-center gap-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors"
        >
          <Link href={`/notes/${note.id}`} className="flex-1 min-w-0">
            <h3 className="font-medium text-zinc-100 truncate">{note.title}</h3>
            {note.content && (
              <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">
                {truncate(note.content.replace(/[#*`]/g, "").replace(/<[^>]*>/g, ""), 100)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-zinc-600">{formatDate(note.updatedAt)}</span>
              {note.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </Link>
          <button
            onClick={async () => {
              await deleteNote(note.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all flex-shrink-0"
            aria-label="删除笔记"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
