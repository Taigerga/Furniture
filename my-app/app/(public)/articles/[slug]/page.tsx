import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/services/content.service";
import { uploadUrl } from "@/lib/uploads";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  return a
    ? {
        title: a.title,
        description: a.excerpt ?? undefined,
        openGraph: {
          title: a.title,
          description: a.excerpt ?? undefined,
          images: a.thumbnail ? [{ url: a.thumbnail }] : undefined,
        },
      }
    : { title: "Artikel tidak ditemukan" };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="text-sm text-[#64748B]" aria-label="Breadcrumb">
        <Link href="/articles" className="hover:text-[#0F172A] hover:underline">Artikel</Link>
        {" / "}
        <span className="text-[#334155]">{article.title}</span>
      </nav>
      <h1 className="font-sans mt-4 text-3xl font-semibold leading-tight text-[#0F172A] md:text-4xl">
        {article.title}
      </h1>
      <p className="mt-3 text-sm text-[#64748B]">
        {article.author?.name ? `${article.author.name} · ` : ""}
        {article.publishedAt
          ? new Date(article.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
          : ""}
      </p>
      {article.thumbnail ? (
        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[3px] bg-[#F4F5F7]">
          <Image
            src={uploadUrl(article.thumbnail)}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div
        className="prose-stone mt-8 max-w-none text-[#334155] [&_h2]:mt-8 [&_h2]:font-sans [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-[#0F172A] [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[#0F172A] [&_img]:rounded-[3px] [&_p]:mt-4 [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-[#007BFF] [&_blockquote]:pl-4 [&_blockquote]:italic"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </main>
  );
}
