import { notFound } from "next/navigation";
import { getNote, updateNoteSimple } from "@/app/actions/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) notFound();

  const handleSave = async (title: string, content: string) => {
    "use server";
    await updateNoteSimple(id, title, content);
  };

  return (
    <NoteEditor
      initialTitle={note.title}
      initialContent={note.content || ""}
      onSave={handleSave}
    />
  );
}
