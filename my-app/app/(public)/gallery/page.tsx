import type { Metadata } from "next";
import Image from "next/image";
import { listGallery } from "@/services/content.service";
import { Reveal } from "@/components/public/Reveal";
import { uploadUrl } from "@/lib/uploads";

export const metadata: Metadata = { title: "Galeri" };

const CATEGORY_LABEL: Record<string, string> = {
  produk: "Produk",
  workshop: "Workshop",
  kantor: "Kantor",
  proyek: "Proyek",
  kegiatan: "Kegiatan",
};

export default async function GalleryPage() {
  const items = await listGallery();
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const list = groups.get(item.category) ?? [];
    list.push(item);
    groups.set(item.category, list);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-sans text-4xl font-semibold text-[#0F172A]">Galeri</h1>
      <p className="mt-2 max-w-lg text-[#334155]">Workshop, produk, proyek, dan kegiatan perusahaan.</p>

      {items.length === 0 ? (
        <p className="mt-8 rounded-[3px] border border-dashed border-[#E2E8F0] bg-white p-10 text-center text-sm text-[#64748B]" role="status">
          Belum ada foto galeri.
        </p>
      ) : (
        [...groups.entries()].map(([cat, photos]) => (
          <section key={cat} className="mt-10" aria-label={CATEGORY_LABEL[cat] ?? cat}>
            <h2 className="text-lg font-semibold text-[#0F172A]">{CATEGORY_LABEL[cat] ?? cat}</h2>
            <ul className="mt-4 columns-2 gap-4 md:columns-3 [&_li]:mb-4">
              {photos.map((g, i) => (
                <Reveal key={g.id} delay={Math.min(i * 0.04, 0.16)}>
                  <li className="break-inside-avoid overflow-hidden rounded-[3px] border border-[#E2E8F0] bg-white">
                    <span className="relative block aspect-[4/3] bg-[#F4F5F7]">
                      <Image
                        src={uploadUrl(g.url)}
                        alt={g.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover transition duration-500 hover:scale-105"
                      />
                    </span>
                    <span className="block truncate px-3 py-2 text-xs text-[#64748B]">{g.title}</span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
