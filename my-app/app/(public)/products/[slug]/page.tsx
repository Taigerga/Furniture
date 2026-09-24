import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyProfile } from "@/services/public.service";
import { getProductBySlug, getRelatedProducts } from "@/services/catalog.service";
import { ProductGallery } from "@/components/public/ProductGallery";
import { ProductCard } from "@/components/public/ProductCard";
import { InquiryForm } from "@/components/public/InquiryForm";
import { Reveal } from "@/components/public/Reveal";
import { uploadUrl } from "@/lib/uploads";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.name,
    description: product.shortDesc ?? product.name,
    openGraph: {
      title: product.name,
      description: product.shortDesc ?? undefined,
      images: product.images[0] ? [{ url: uploadUrl(product.images[0].url) }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, company] = await Promise.all([
    getRelatedProducts(product.category.slug, product.id),
    getCompanyProfile(),
  ]);

  const specs = [
    ["Material", product.material],
    ["Dimensi", product.dimensions],
    ["Warna", product.color],
    ["Kategori", product.category.name],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <nav className="text-sm text-[#64748B]" aria-label="Breadcrumb">
        <Link href="/products" className="hover:text-[#0F172A] hover:underline">
          Produk
        </Link>
        {" / "}
        <Link href={`/products?cat=${product.category.slug}`} className="hover:text-[#0F172A] hover:underline">
          {product.category.name}
        </Link>
        {" / "}
        <span className="text-[#334155]">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <ProductGallery images={product.images} name={product.name} />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#0063CE]">{product.category.name}</p>
          <h1 className="font-sans mt-2 text-3xl font-semibold leading-tight text-[#0F172A] md:text-4xl">
            {product.name}
          </h1>
          {product.shortDesc ? <p className="mt-3 leading-relaxed text-[#334155]">{product.shortDesc}</p> : null}
          {specs.length > 0 ? (
            <dl className="mt-6 grid grid-cols-2 gap-3">
              {specs.map(([k, v]) => (
                <div key={k} className="rounded-[3px] border border-[#E2E8F0] bg-white px-4 py-3">
                  <dt className="text-xs text-[#64748B]">{k}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#0F172A]">{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {product.description ? (
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-[#334155]">{product.description}</p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#tanya"
              className="rounded-[3px] bg-[#0A192F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A192F] active:translate-y-[1px]"
            >
              Tanya Produk
            </a>
            {company?.whatsapp ? (
              <a
                href={`https://wa.me/${company.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Halo, saya tertarik dengan ${product.name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[3px] border border-[#CBD5E1] px-6 py-3 text-sm font-medium text-[#0F172A] transition hover:border-ink"
              >
                WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {product.specifications ? (
        <section className="mt-12 rounded-[3px] border border-[#E2E8F0] bg-white p-6" aria-label="Spesifikasi lengkap">
          <h2 className="font-sans text-xl font-semibold text-[#0F172A]">Spesifikasi</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#334155]">{product.specifications}</p>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-12" aria-label="Produk terkait">
          <h2 className="font-sans text-2xl font-semibold text-[#0F172A]">Produk terkait</h2>
          <ul className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ul>
        </section>
      ) : null}

      <section id="tanya" className="mt-12 scroll-mt-24 rounded-[3px] border border-[#E2E8F0] bg-white p-6 md:p-8" aria-label="Form tanya produk">
        <Reveal>
          <h2 className="font-sans text-2xl font-semibold text-[#0F172A]">Tanya tentang {product.name}</h2>
          <p className="mt-1 text-sm text-[#64748B]">Form otomatis tertaut ke produk ini.</p>
          <div className="mt-5">
            <InquiryForm products={[]} defaultProductId={product.id} whatsapp={company?.whatsapp} />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
