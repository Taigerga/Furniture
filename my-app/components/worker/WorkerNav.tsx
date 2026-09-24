"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Newspaper,
  Images,
  Tags,
  Inbox,
  ClipboardList,
  UserRound,
} from "lucide-react";

const ITEMS = [
  { href: "/worker", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/worker/products", label: "Produk Saya", Icon: Package },
  { href: "/worker/articles", label: "Artikel Saya", Icon: Newspaper },
  { href: "/worker/gallery", label: "Galeri Saya", Icon: Images },
  { href: "/worker/categories", label: "Kategori", Icon: Tags },
  { href: "/worker/inquiries", label: "Inquiry", Icon: Inbox },
  { href: "/worker/submissions", label: "Pengajuan Saya", Icon: ClipboardList },
  { href: "/worker/profile", label: "Profil Akun", Icon: UserRound },
];

export function WorkerNav() {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 p-3" aria-label="Navigasi worker">
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/worker" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-[3px] border-l-2 px-3 py-2 text-sm transition ${
              active
                ? "border-[#00B4D8] bg-white/10 font-semibold text-white"
                : "border-transparent text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={17} aria-hidden />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
