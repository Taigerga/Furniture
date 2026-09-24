import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { getCompanyProfile } from "@/services/public.service";
import { Reveal } from "@/components/public/Reveal";

export const metadata: Metadata = { title: "Lokasi" };

export default async function LocationPage() {
  const company = await getCompanyProfile();
  const mapQuery =
    company?.latitude != null && company?.longitude != null
      ? `${company.latitude},${company.longitude}`
      : (company?.address ?? null);
  const mapEmbed = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`
    : null;
  const mapOpen =
    company?.mapsUrl ||
    (mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : null);
  const waNumber = company?.whatsapp ? company.whatsapp.replace(/[^0-9]/g, "") : null;

  const details = [
    company?.address
      ? { icon: MapPin, label: "Alamat", value: company.address }
      : null,
    company?.hours
      ? { icon: Clock, label: "Jam operasional", value: company.hours }
      : null,
    company?.phone
      ? { icon: Phone, label: "Telepon", value: company.phone, href: `tel:${company.phone.replace(/[^0-9+]/g, "")}` }
      : null,
    company?.whatsapp
      ? { icon: MessageCircle, label: "WhatsApp", value: company.whatsapp, href: `https://wa.me/${waNumber}` }
      : null,
    company?.email
      ? { icon: Mail, label: "Email", value: company.email, href: `mailto:${company.email}` }
      : null,
  ].filter((d): d is { icon: typeof MapPin; label: string; value: string; href?: string } => d !== null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-wider text-[#0063CE]">Kunjungi kami</p>
        <h1 className="font-sans mt-2 text-4xl font-semibold text-[#0F172A] md:text-5xl">Lokasi Workshop</h1>
        <p className="mt-3 max-w-lg leading-relaxed text-[#334155]">
          {company?.tagline ?? "Datang langsung untuk melihat material, mencoba produk, dan konsultasi custom."}
        </p>
      </Reveal>

      <Reveal delay={0.08} className="mt-8 overflow-hidden rounded-[3px] border border-[#E2E8F0] bg-[#F4F5F7] shadow-[0_20px_50px_-20px_rgba(28,25,23,0.35)]">
        {mapEmbed ? (
          <iframe
            title={`Peta lokasi ${company?.name ?? "workshop"}`}
            src={mapEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-[380px] w-full border-0 md:h-[520px]"
          />
        ) : (
          <p className="p-8 text-center text-sm text-[#64748B]">
            Titik lokasi belum diatur. Tambahkan latitude &amp; longitude via dashboard admin.
          </p>
        )}
      </Reveal>

      <Reveal delay={0.12} className="mt-8">
        <div className="rounded-[3px] border border-[#E2E8F0] bg-white p-6 shadow-[0_20px_50px_-20px_rgba(28,25,23,0.15)] md:p-8">
          <p className="flex items-center gap-2 text-xl font-semibold text-[#0F172A] md:text-2xl">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[3px] bg-[#DBEAFE] text-[#0063CE]">
              <Navigation size={18} aria-hidden />
            </span>
            {company?.name ?? "Furniture"}
          </p>
          {company?.description ? (
            <p className="mt-3 text-sm leading-relaxed text-[#334155]">{company.description}</p>
          ) : null}
          {details.length > 0 ? (
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {details.map((d) => (
                <div key={d.label} className="flex gap-3 rounded-[3px] bg-[#F4F5F7] px-4 py-3">
                  <d.icon size={18} className="mt-0.5 shrink-0 text-[#0063CE]" aria-hidden />
                  <div className="min-w-0">
                    <dt className="text-xs font-medium uppercase tracking-wider text-[#64748B]">{d.label}</dt>
                    <dd className="mt-0.5 break-words text-sm font-medium text-[#0F172A]">
                      {d.href ? (
                        <a href={d.href} target={d.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="hover:text-[#0063CE] hover:underline">
                          {d.value}
                        </a>
                      ) : (
                        d.value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {mapOpen ? (
              <a
                href={mapOpen}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[3px] bg-[#0A192F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A192F] active:translate-y-[1px]"
              >
                Buka di Google Maps
              </a>
            ) : null}
            {waNumber ? (
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent("Halo, saya mau tanya lokasi workshop.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[3px] border border-[#CBD5E1] px-6 py-3 text-sm font-medium text-[#0F172A] transition hover:border-ink"
              >
                Chat WhatsApp
              </a>
            ) : null}
            <Link
              href="/contact"
              className="rounded-[3px] border border-[#CBD5E1] px-6 py-3 text-sm font-medium text-[#0F172A] transition hover:border-ink"
            >
              Kirim Inquiry
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
