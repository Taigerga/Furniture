import type { Metadata } from "next";
import { getCompanyProfile } from "@/services/public.service";
import { getAllActiveProducts } from "@/services/catalog.service";
import { InquiryForm } from "@/components/public/InquiryForm";
import { formatWaDisplay, telLink, waLink } from "@/lib/wa";

export const metadata: Metadata = { title: "Kontak & Inquiry" };

export default async function ContactPage() {
  const [company, products] = await Promise.all([getCompanyProfile(), getAllActiveProducts()]);
  const waGreeting = waLink(
    company?.whatsapp,
    "Halo, saya mau bertanya soal produk dan layanan yang tersedia.",
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-sans max-w-xl text-4xl font-semibold text-[#0F172A]">Hubungi Kami</h1>
      <p className="mt-3 max-w-lg leading-relaxed text-[#334155]">
        Isi form inquiry atau hubungi langsung — balasan maksimal 1×24 jam pada jam operasional.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <aside className="h-fit rounded-[3px] bg-[#0A192F] p-6 text-white">
          <h2 className="font-bold">Kontak langsung</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {company?.address ? <li>{company.address}</li> : null}
            {company?.phone ? (
              <li>
                Tel:{" "}
                <a href={telLink(company.phone) ?? "#"} className="text-white underline underline-offset-4 hover:text-white/80">
                  {company.phone}
                </a>
              </li>
            ) : null}
            {company?.whatsapp ? (
              <li className="flex flex-wrap items-center gap-2">
                <span>WA:</span>
                <a href={formatWaDisplay(company.whatsapp)} className="text-white underline underline-offset-4 hover:text-white/80">
                  {formatWaDisplay(company.whatsapp)}
                </a>
                {waGreeting ? (
                  <a
                    href={waGreeting}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-[3px] bg-white/10 px-2 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                  >
                    Chat tanpa form
                  </a>
                ) : null}
              </li>
            ) : null}
            {company?.email ? <li>{company.email}</li> : null}
            {company?.hours ? <li className="pt-1 text-white/70">{company.hours}</li> : null}
          </ul>
        </aside>
        <section className="rounded-[3px] border border-[#E2E8F0] bg-white p-6" aria-label="Form inquiry">
          <InquiryForm
            products={products}
            whatsapp={company?.whatsapp}
            phone={company?.phone}
            email={company?.email}
          />
        </section>
      </div>
    </main>
  );
}
