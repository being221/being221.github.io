"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Save } from "lucide-react";

interface NoteEditorProps {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => Promise<void>;
  isNew?: boolean;
}

export function NoteEditor({ initialTitle, initialContent, onSave, isNew }: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "开始写点什么..." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
  });

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setSaving(true);
    await onSave(title, editor.getHTML());
    setSaving(false);
  }, [editor, title, onSave]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="笔记标题..."
          className="flex-1 text-3xl font-bold bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600"
        />
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
      <EditorContent editor={editor} className="min-h-[60vh]" />
    </div>
  );
}
