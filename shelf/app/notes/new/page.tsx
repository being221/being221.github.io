"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createNoteSimple } from "@/lib/storage";
import { NoteEditor } from "@/components/notes/NoteEditor";

function NewNoteContent() {
  const router = useRouter();
  const params = useSearchParams();

  const defaultTitle = params ? (params.get("title") || "") : "";
  const defaultText  = params ? (params.get("text")  || "") : "";

  return (
    <div>
      <button onClick={() => router.back()} className="text-sm text-zinc-400 hover:text-zinc-200 mb-4">
        &larr; 返回
      </button>
      <NoteEditor
        initialTitle={defaultTitle}
        initialContent={defaultText}
        onSave={async (title, content) => {
          createNoteSimple(title, content);
          router.push("/notes");
        }}
      />
    </div>
  );
}

export default function NewNotePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-500">加载中...</div>}>
      <NewNoteContent />
    </Suspense>
  );
}
