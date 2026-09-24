"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Briefcase,
  Newspaper,
  Images,
  Inbox,
  Building2,
  ClipboardCheck,
  UsersRound,
} from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approval", Icon: ClipboardCheck, badge: true },
  { href: "/admin/products", label: "Produk", Icon: Package },
  { href: "/admin/categories", label: "Kategori", Icon: Tags },
  { href: "/admin/portfolios", label: "Portofolio", Icon: Briefcase },
  { href: "/admin/articles", label: "Artikel", Icon: Newspaper },
  { href: "/admin/gallery", label: "Galeri", Icon: Images },
  { href: "/admin/inquiries", label: "Inquiry", Icon: Inbox },
  { href: "/admin/workers", label: "Kelola Worker", Icon: UsersRound },
  { href: "/admin/company-profile", label: "Profil Perusahaan", Icon: Building2 },
];

export function AdminNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 p-3" aria-label="Navigasi admin">
      {ITEMS.map(({ href, label, Icon, badge }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
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
            <span className="flex-1">{label}</span>
            {badge && pendingCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#DC2626] px-1.5 text-[11px] font-bold text-white">
                {pendingCount > 9 ? "9+" : pendingCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
