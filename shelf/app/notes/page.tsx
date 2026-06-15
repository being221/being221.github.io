import Link from "next/link";
import { Plus } from "lucide-react";
import { getNotes } from "@/app/actions/notes";
import { NoteList } from "@/components/notes/NoteList";

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">笔记</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{notes.length} 篇</span>
          <Link
            href="/notes/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建
          </Link>
        </div>
      </div>
      <NoteList notes={notes} />
    </div>
  );
}
