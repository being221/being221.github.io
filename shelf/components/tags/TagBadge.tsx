interface TagBadgeProps {
  tag: string;
  onClick?: () => void;
}

export function TagBadge({ tag, onClick }: TagBadgeProps) {
  return (
    <span
      onClick={onClick}
      className="inline-block px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 cursor-pointer transition-colors"
    >
      {tag}
    </span>
  );
}
