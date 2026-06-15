"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Trash2 } from "lucide-react";
import { TagBadge } from "@/components/tags/TagBadge";
import { deleteLink, updateLinkNote } from "@/lib/storage";
import { formatDate, getDomain } from "@/lib/utils";
import type { Link } from "@/types";

interface LinkCardProps {
  link: Link;
  onDelete: () => void;
}

export function LinkCard({ link, onDelete }: LinkCardProps) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(link.note || "");

  const handleDelete = () => {
    deleteLink(link.id);
    onDelete();
  };

  const handleSaveNote = () => {
    updateLinkNote(link.id, note);
    setEditing(false);
    onDelete(); // refresh to show updated note
  };

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all">
      <div className="flex">
        {link.imageUrl && (
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image src={link.imageUrl} alt={link.title} fill className="object-cover" sizes="128px" unoptimized />
          </div>
        )}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-medium text-zinc-100 hover:text-blue-400 transition-colors line-clamp-1">
              {link.title}
              <ExternalLink className="inline w-3 h-3 ml-1 opacity-40" />
            </a>
            <button onClick={handleDelete} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all flex-shrink-0" aria-label="删除">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          {link.description && <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{link.description}</p>}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-zinc-500">{getDomain(link.url)}</span>
            <span className="text-xs text-zinc-600">{formatDate(link.createdAt)}</span>
          </div>
          {link.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {link.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
            </div>
          )}
          {editing ? (
            <div className="mt-2">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500" rows={2} placeholder="添加备注..." />
              <div className="flex gap-2 mt-1">
                <button onClick={handleSaveNote} className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white">保存</button>
                <button onClick={() => setEditing(false)} className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-zinc-300">取消</button>
              </div>
            </div>
          ) : (link.note && <p className="text-sm text-zinc-400 mt-2 italic">&ldquo;{link.note}&rdquo;</p>)}
        </div>
      </div>
    </div>
  );
}
