import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hammer, Ruler, Truck } from "lucide-react";
import { getCompanyProfile, getFeaturedProducts, getPublicCounts } from "@/services/public.service";
import { listPortfolios, listPublishedArticles } from "@/services/content.service";
import { ProductCard } from "@/components/public/ProductCard";
import { Reveal } from "@/components/public/Reveal";
import { FloatingDecor } from "@/components/public/FloatingDecor";
import { uploadUrl } from "@/lib/uploads";

const MATERIALS = ["Jati Solid", "Rotan", "Multiplek HPL", "Besi Powder-Coating", "Kain Linen", "Finishing Duco"];

export default async function HomePage() {
  const [company, featured, counts, portfolios, articles] = await Promise.all([
    getCompanyProfile(),
    getFeaturedProducts(5),
    getPublicCounts(),
    listPortfolios(),
    listPublishedArticles(),
  ]);
  const featuredPortfolios = portfolios.slice(0, 3);
  const latestArticles = articles.slice(0, 3);
  const miniPool = featured.slice(1);
  const miniSlides =
    miniPool.length > 1
      ? [miniPool[0], miniPool[1 % miniPool.length], miniPool[2 % miniPool.length]]
      : miniPool;
  const miniCycle = miniSlides.length * 4;

  return (
    <main>
      {/* HERO */}
      <section className="bg-blueprint-light relative overflow-hidden border-b border-[#E2E8F0] bg-[#F4F5F7]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 md:grid-cols-[1.05fr_1fr] md:pt-16">
          <FloatingDecor />
          <div className="relative">
            <p className="tech-label text-[#0063CE]">SPEC / CUSTOM FURNITURE / REV.01</p>
            <h1 className="anim-hero-rise mt-3 text-4xl font-extrabold leading-[1.05] tracking-tight text-[#0F172A] md:text-6xl">
              Furniture custom yang dibangun untuk bertahan.
            </h1>
            <p className="anim-hero-rise delay-1 mt-4 max-w-md leading-relaxed text-[#334155]">
              {company?.tagline ?? "Desain minimal, material jujur, pengerjaan rapi untuk rumah dan kantor."}
            </p>
            <div className="anim-hero-rise delay-2 mt-7 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="rounded-[3px] bg-[#0A192F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#13233F] active:translate-y-[1px]"
              >
                Lihat Katalog
              </Link>
              <Link
                href="/portfolio"
                className="group flex items-center gap-1.5 rounded-[3px] border border-[#CBD5E1] bg-white px-6 py-3 text-sm font-semibold text-[#0A192F] transition hover:border-[#0A192F]"
              >
                Proyek Kami
                <ArrowRight size={16} className="transition group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <dl className="anim-hero-rise delay-3 mt-9 flex gap-8 border-t border-[#E2E8F0] pt-5">
              {[
                { v: counts.products, l: "Produk aktif" },
                { v: counts.portfolios, l: "Proyek selesai" },
                { v: counts.articles, l: "Artikel" },
              ].map((s) => (
                <div key={s.l}>
                  <dd className="font-mono text-3xl font-bold text-[#0A192F]">{s.v}</dd>
                  <dt className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[#64748B]">{s.l}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="anim-hero-image relative aspect-[4/5] overflow-hidden rounded-[3px] border border-[#0A192F]/15 bg-[#E2E8F0] sm:aspect-[5/4] md:aspect-[4/5]">
              {company?.heroImageUrl || featured[0]?.images[0] ? (
                <Image
                  src={uploadUrl(company?.heroImageUrl ?? featured[0].images[0].url)}
                  alt={company?.heroImageUrl ? `Workshop ${company?.name ?? "furniture"}` : (featured[0].images[0].alt ?? featured[0].name)}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 45vw"
                  className="object-cover"
                />
              ) : null}
              <span className="absolute left-3 top-3 rounded-[3px] bg-[#0A192F] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#00B4D8]">
                FIG.01 / WORKSHOP
              </span>
            </div>
            {miniSlides.length > 0 ? (
              <div className="anim-hero-rise delay-4 absolute -bottom-6 -left-4 hidden w-52 overflow-hidden rounded-[3px] border border-[#E2E8F0] bg-white sm:block">
                <div className="relative aspect-[4/3] w-full">
                  {miniSlides.map((p, i) => (
                    <Link
                      key={`${p.id}-${i}`}
                      href={`/products/${p.slug}`}
                      aria-hidden={i > 0}
                      tabIndex={i > 0 ? -1 : undefined}
                      style={miniSlides.length > 1 ? { animationDelay: `${i * 4}s`, animationDuration: `${miniCycle}s` } : undefined}
                      className={miniSlides.length > 1 ? "anim-mini-slide absolute inset-0" : "absolute inset-0"}
                    >
                      {p.images[0] ? (
                        <Image
                          src={uploadUrl(p.images[0].url)}
                          alt={p.images[0].alt ?? p.name}
                          fill
                          loading="lazy"
                          sizes="208px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>
                  ))}
                </div>
                <div aria-hidden className="relative h-8 border-t border-[#E2E8F0] px-3 py-2">
                  {miniSlides.map((p, i) => (
                    <span
                      key={`${p.id}-cap-${i}`}
                      style={miniSlides.length > 1 ? { animationDelay: `${i * 4}s`, animationDuration: `${miniCycle}s` } : undefined}
                      className={
                        miniSlides.length > 1
                          ? "anim-mini-slide absolute inset-x-3 top-2 truncate text-xs font-medium text-[#334155]"
                          : "absolute inset-x-3 top-2 truncate text-xs font-medium text-[#334155]"
                      }
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-b border-[#E2E8F0] bg-[#0A192F] py-3">
        <div className="anim-marquee flex w-max whitespace-nowrap">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {[...MATERIALS, ...MATERIALS, ...MATERIALS].map((m, i) => (
                <span key={`${m}-${i}`} className="flex items-center font-mono text-xs uppercase tracking-[0.18em] text-white/70">
                  <span className="px-6">{m}</span>
                  <span className="text-[#00B4D8]">+</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* PRODUK UNGGULAN */}
      <section className="mx-auto max-w-6xl px-4 py-16" aria-label="Produk unggulan">
        <Reveal>
          <div className="mb-7 flex items-end justify-between border-b-2 border-[#0A192F] pb-4">
            <div>
              <p className="tech-label text-[#0063CE]">CATALOG / 01</p>
              <h2 className="mt-1 max-w-md text-2xl font-extrabold tracking-tight text-[#0F172A] md:text-3xl">
                Dibuat di workshop, dipilih untuk ruang Anda
              </h2>
            </div>
            <Link href="/products" className="hidden shrink-0 rounded-[3px] border border-[#CBD5E1] bg-white px-4 py-2 text-sm font-semibold text-[#0A192F] hover:border-[#0A192F] sm:block">
              Semua produk
            </Link>
          </div>
        </Reveal>
        {featured.length === 0 ? (
          <p className="rounded-[3px] border border-dashed border-[#CBD5E1] bg-white p-8 text-center text-sm text-[#64748B]">
            Belum ada produk aktif. Tambahkan via dashboard admin.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.06, 0.24)} className={i === 0 ? "col-span-2 row-span-2" : ""}>
                <ProductCard product={p} large={i === 0} />
              </Reveal>
            ))}
          </ul>
        )}
      </section>

      {/* PROSES */}
      <section className="border-y border-[#E2E8F0] bg-white" aria-label="Cara kerja">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
          <Reveal className="relative min-h-72 overflow-hidden rounded-[3px] border border-[#E2E8F0] bg-[#E2E8F0]">
            <Image
              src="https://picsum.photos/seed/furniture-workshop-craft/900/700"
              alt="Suasana workshop pengerjaan furniture"
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
          <div>
            <Reveal>
              <p className="tech-label text-[#0063CE]">WORKFLOW / 02</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A] md:text-3xl">Dari konsultasi sampai terkirim</h2>
            </Reveal>
            <ol className="mt-6 space-y-5">
              {[
                { icon: Ruler, t: "Konsultasi & ukur", d: "Ceritakan kebutuhan dan ukuran ruang Anda via form atau WhatsApp." },
                { icon: Hammer, t: "Produksi di workshop", d: "Material dipotong, dirakit, dan difinishing oleh tukang berpengalaman." },
                { icon: Truck, t: "Antar & pasang", d: "Kami antar, pasang, dan pastikan semuanya presisi di tempat." },
              ].map((s, i) => (
                <Reveal key={s.t} delay={i * 0.08}>
                  <li className="flex gap-4 rounded-[3px] border border-[#E2E8F0] bg-[#F4F5F7] p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-[#0A192F] text-[#00B4D8]">
                      <s.icon size={18} aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold text-[#0F172A]">
                        <span className="mr-2 font-mono text-xs text-[#0063CE]">0{i + 1}</span>
                        {s.t}
                      </p>
                      <p className="mt-1 max-w-md text-sm leading-relaxed text-[#334155]">{s.d}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* PORTOFOLIO */}
      {featuredPortfolios.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16" aria-label="Proyek pilihan">
          <Reveal>
            <p className="tech-label text-[#0063CE]">PORTFOLIO / 03</p>
            <h2 className="mt-1 max-w-md text-2xl font-extrabold tracking-tight text-[#0F172A] md:text-3xl">Proyek yang sudah kami kerjakan</h2>
          </Reveal>
          <ul className="mt-7 grid gap-4 md:grid-cols-3">
            {featuredPortfolios.map((pf, i) => (
              <Reveal key={pf.id} delay={i * 0.08}>
                <li>
                  <Link
                    href={`/portfolio/${pf.slug}`}
                    className="group block overflow-hidden rounded-[3px] border border-[#E2E8F0] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#0A192F]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#E2E8F0]">
                      {pf.images[0] ? (
                        <Image
                          src={uploadUrl(pf.images[0].url)}
                          alt={pf.images[0].alt ?? pf.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="border-t border-[#E2E8F0] p-4">
                      <h3 className="font-semibold text-[#0F172A] group-hover:underline">{pf.title}</h3>
                      <p className="mt-1 font-mono text-xs text-[#64748B]">
                        {[pf.client, pf.location, pf.year].filter(Boolean).join(" / ")}
                      </p>
                    </div>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ARTIKEL */}
      {latestArticles.length > 0 ? (
        <section className="border-t border-[#E2E8F0] bg-white" aria-label="Artikel terbaru">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <Reveal>
              <p className="tech-label text-[#0063CE]">JOURNAL / 04</p>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F172A] md:text-3xl">Cerita dari workshop</h2>
            </Reveal>
            <ul className="mt-6 divide-y divide-[#E2E8F0] border-y border-[#E2E8F0]">
              {latestArticles.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}`} className="group flex items-baseline justify-between gap-4 py-4">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-[#0F172A] group-hover:underline">{a.title}</h3>
                      {a.excerpt ? <p className="mt-1 truncate text-sm text-[#64748B]">{a.excerpt}</p> : null}
                    </div>
                    {a.publishedAt ? (
                      <time className="shrink-0 font-mono text-xs text-[#64748B]">
                        {new Date(a.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </time>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Reveal>
          <div className="bg-blueprint-dark rounded-[3px] bg-[#0A192F] px-6 py-12 text-center text-white md:py-16">
            <p className="tech-label text-[#00B4D8]">INQUIRY / RESPONSE 1x24H</p>
            <h2 className="mx-auto mt-2 max-w-xl text-2xl font-extrabold leading-tight tracking-tight md:text-3xl">
              Punya ukuran atau desain khusus?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/70">
              Kirim inquiry, tim kami balas maksimal 1x24 jam pada jam operasional.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-[3px] bg-[#007BFF] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#0063CE] active:translate-y-[1px]"
            >
              Kirim Inquiry
            </Link>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
