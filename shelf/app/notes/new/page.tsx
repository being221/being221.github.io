"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNoteSimple } from "@/lib/storage";
import { NoteEditor } from "@/components/notes/NoteEditor";

export default function NewNotePage() {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-zinc-400 hover:text-zinc-200 mb-4">
        &larr; 返回
      </button>
      <NoteEditor
        initialTitle=""
        initialContent=""
        onSave={async (title, content) => {
          createNoteSimple(title, content);
          router.push("/notes");
        }}
      />
    </div>
  );
}
