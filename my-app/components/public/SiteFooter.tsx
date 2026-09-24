import Image from "next/image";
import Link from "next/link";
import { uploadUrl } from "@/lib/uploads";

export function SiteFooter({
  company,
}: {
  company: {
    name: string;
    logoUrl?: string | null;
    address?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    hours?: string | null;
    instagram?: string | null;
    facebook?: string | null;
  } | null;
}) {
  return (
    <footer className="bg-[#0A192F] text-white">
      <div className="bg-blueprint-dark border-b border-white/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
          <div>
            <p className="flex items-center gap-2.5 text-lg font-bold text-white">
              {company?.logoUrl ? (
                <span className="relative block h-7 w-7 shrink-0 overflow-hidden rounded-[3px] bg-white p-0.5">
                  <Image src={uploadUrl(company.logoUrl)} alt="" fill sizes="28px" className="object-contain" />
                </span>
              ) : null}
              {company?.name ?? "Furniture"}
            </p>
            <p className="tech-label mt-2 text-[#00B4D8]">TECHNICAL / CORPORATE</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/70">
              {company?.address ?? "Custom furniture minimal, elegan, dan presisi."}
            </p>
            {company?.hours ? <p className="mt-2 font-mono text-xs text-white/60">{company.hours}</p> : null}
          </div>
          <nav aria-label="Navigasi footer">
            <p className="text-sm font-semibold text-white">Jelajahi</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {[
                { href: "/products", label: "Katalog Produk" },
                { href: "/portfolio", label: "Portofolio" },
                { href: "/articles", label: "Artikel" },
                { href: "/gallery", label: "Galeri" },
                { href: "/about", label: "Tentang Kami" },
                { href: "/contact", label: "Hubungi Kami" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/70 transition hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-sm font-semibold text-white">Kontak</p>
            <ul className="mt-3 space-y-1.5 text-sm text-white/70">
              {company?.phone ? <li className="font-mono text-[13px]">{company.phone}</li> : null}
              {company?.whatsapp ? <li className="font-mono text-[13px]">WA: {company.whatsapp}</li> : null}
              {company?.email ? <li>{company.email}</li> : null}
              <li className="flex gap-3 pt-1">
                {company?.instagram ? (
                  <a href={company.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    Instagram
                  </a>
                ) : null}
                {company?.facebook ? (
                  <a href={company.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    Facebook
                  </a>
                ) : null}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div>
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 font-mono text-[11px] text-white/50">
          <span>
            © {new Date().getFullYear()} {company?.name ?? "Furniture"}. Seluruh konten dikelola via dashboard admin.
          </span>
          <span className="uppercase tracking-[0.18em]">GRID / 24PX / REV.01</span>
        </p>
      </div>
    </footer>
  );
}
