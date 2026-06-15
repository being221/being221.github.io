import { Suspense } from "react";
import { getLinks, getLinksByTag } from "@/app/actions/links";
import { LinkForm } from "@/components/links/LinkForm";
import { LinkGrid } from "@/components/links/LinkGrid";
import { SearchBar } from "@/components/search/SearchBar";
import { TagFilter } from "@/components/tags/TagFilter";

async function LinkList({ query, tag }: { query?: string; tag?: string }) {
  const links = tag ? await getLinksByTag(tag) : await getLinks(query);
  return <LinkGrid links={links} />;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">收藏</h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
      <Suspense>
        <TagFilter />
      </Suspense>
      <LinkForm />
      <Suspense fallback={<div className="text-center py-8 text-zinc-500">加载中...</div>}>
        <LinkList query={q} tag={tag} />
      </Suspense>
    </div>
  );
}
