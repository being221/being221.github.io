"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { getNotes, getNote, updateNoteSimple, createNoteSimple } from "@/lib/storage";
import { NoteList } from "@/components/notes/NoteList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import type { Note } from "@/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNew, setIsNew] = useState(false);
  const router = useRouter();

  const loadNotes = useCallback(() => {
    setNotes(getNotes());
  }, []);

  useEffect(() => {
    loadNotes();
    // 检查 URL 参数
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      const note = getNote(id);
      if (note) setEditingNote(note);
    }
  }, [loadNotes]);

  // 如果在编辑模式
  if (editingNote) {
    return (
      <div>
        <button onClick={() => { setEditingNote(null); loadNotes(); router.push("/shelf/notes"); }}
          className="text-sm text-zinc-400 hover:text-zinc-200 mb-4">
          &larr; 返回笔记列表
        </button>
        <NoteEditor
          initialTitle={editingNote.title}
          initialContent={editingNote.content || ""}
          onSave={async (title, content) => {
            updateNoteSimple(editingNote.id, title, content);
            setEditingNote(null);
            loadNotes();
            router.push("/notes");
          }}
        />
      </div>
    );
  }

  // 新建模式
  if (isNew) {
    return (
      <div>
        <button onClick={() => setIsNew(false)}
          className="text-sm text-zinc-400 hover:text-zinc-200 mb-4">
          &larr; 返回笔记列表
        </button>
        <NoteEditor
          initialTitle=""
          initialContent=""
          onSave={async (title, content) => {
            createNoteSimple(title, content);
            setIsNew(false);
            loadNotes();
          }}
        />
      </div>
    );
  }

  // 列表模式
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">笔记</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{notes.length} 篇</span>
          <button onClick={() => setIsNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium text-white transition-colors">
            <Plus className="w-4 h-4" />
            新建
          </button>
        </div>
      </div>
      <NoteList notes={notes} onDelete={loadNotes} />
    </div>
  );
}
