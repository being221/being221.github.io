import { createNoteSimple } from "@/app/actions/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";

export default function NewNotePage() {
  const handleSave = async (title: string, content: string) => {
    "use server";
    await createNoteSimple(title, content);
  };

  return (
    <NoteEditor
      initialTitle=""
      initialContent=""
      onSave={handleSave}
    />
  );
}
