import type { Metadata } from "next";
import { getCompanyProfile } from "@/services/public.service";
import { getAllActiveProducts } from "@/services/catalog.service";
import { InquiryForm } from "@/components/public/InquiryForm";

export const metadata: Metadata = { title: "Kontak & Inquiry" };

export default async function ContactPage() {
  const [company, products] = await Promise.all([getCompanyProfile(), getAllActiveProducts()]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-sans max-w-xl text-4xl font-semibold text-[#0F172A]">Hubungi Kami</h1>
      <p className="mt-3 max-w-lg leading-relaxed text-[#334155]">
        Isi form inquiry atau hubungi langsung — balasan maksimal 1×24 jam pada jam operasional.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <aside className="h-fit rounded-[3px] bg-[#0A192F] p-6 text-white">
          <h2 className="font-medium">Kontak langsung</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {company?.address ? <li>{company.address}</li> : null}
            {company?.phone ? <li>Tel: {company.phone}</li> : null}
            {company?.whatsapp ? <li>WA: {company.whatsapp}</li> : null}
            {company?.email ? <li>{company.email}</li> : null}
            {company?.hours ? <li className="pt-1 text-white/70">{company.hours}</li> : null}
          </ul>
        </aside>
        <section className="rounded-[3px] border border-[#E2E8F0] bg-white p-6" aria-label="Form inquiry">
          <InquiryForm products={products} whatsapp={company?.whatsapp} />
        </section>
      </div>
    </main>
  );
}
