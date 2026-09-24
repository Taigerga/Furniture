"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { uploadUrl } from "@/lib/uploads";

const LINKS = [
  { href: "/products", label: "Produk" },
  { href: "/portfolio", label: "Portofolio" },
  { href: "/articles", label: "Artikel" },
  { href: "/gallery", label: "Galeri" },
  { href: "/about", label: "Tentang" },
  { href: "/lokasi", label: "Lokasi" },
  { href: "/contact", label: "Kontak" },
];

export function SiteHeader({ brand, phone, logoUrl }: { brand: string; phone?: string | null; logoUrl?: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0A192F] text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label={`${brand} — beranda`}>
          {logoUrl ? (
            <span className="relative block h-8 w-8 overflow-hidden rounded-[3px] bg-white p-0.5">
              <Image src={uploadUrl(logoUrl)} alt="" fill sizes="32px" className="object-contain" />
            </span>
          ) : null}
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-white">{brand}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#00B4D8]">FURNITURE / EST.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-[3px] px-3 py-2 text-sm transition ${
                  active
                    ? "bg-white/10 text-white underline decoration-[#00B4D8] decoration-2 underline-offset-8"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 lg:flex">
          {phone ? (
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="flex items-center gap-1.5 font-mono text-xs text-white/70 hover:text-white"
            >
              <Phone size={14} aria-hidden />
              {phone}
            </a>
          ) : null}
          <Link
            href="/contact"
            className="rounded-[3px] bg-[#007BFF] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0063CE] active:translate-y-[1px]"
          >
            Tanya Produk
          </Link>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="rounded-[3px] p-2 text-white hover:bg-white/10 lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-white/10 bg-[#1B2A4A] px-4 py-3 lg:hidden" aria-label="Navigasi seluler">
          <ul className="space-y-1">
            {LINKS.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-[3px] px-3 py-2 text-sm ${
                      active ? "bg-white/10 text-white" : "text-white/75 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="block rounded-[3px] bg-[#007BFF] px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Tanya Produk
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
