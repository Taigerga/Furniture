import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import { getCompanyProfile } from "@/services/public.service";
import { NotificationBell } from "@/components/worker/NotificationBell";
import { WorkerNav } from "@/components/worker/WorkerNav";
import { uploadUrl } from "@/lib/uploads";

const NAV = [
  { href: "/worker", label: "Dashboard" },
  { href: "/worker/products", label: "Produk Saya" },
  { href: "/worker/articles", label: "Artikel Saya" },
  { href: "/worker/gallery", label: "Galeri Saya" },
  { href: "/worker/categories", label: "Kategori" },
  { href: "/worker/inquiries", label: "Inquiry" },
  { href: "/worker/submissions", label: "Pengajuan Saya" },
  { href: "/worker/profile", label: "Profil Akun" },
];

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "WORKER") {
    redirect("/login?callbackUrl=/worker");
  }
  const role = session.user.role;
  let company = null;
  try {
    company = await getCompanyProfile();
  } catch {
    company = null;
  }

  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <aside className="hidden w-60 shrink-0 flex-col bg-[#0A192F] text-white md:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          {company?.logoUrl ? (
            <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-[3px] bg-white p-0.5">
              <Image src={uploadUrl(company.logoUrl)} alt="" fill sizes="32px" className="object-contain" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{company?.name ?? "Furniture"}</p>
            <p className="truncate font-mono text-[11px] text-white/50">{session.user.email}</p>
          </div>
          <span className="shrink-0 rounded-[3px] bg-[#007BFF] px-2 py-0.5 font-mono text-[10px] font-bold tracking-wide text-white">
            {role}
          </span>
        </div>
        <p className="px-5 pb-1 pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[#00B4D8]">SYS / WORKER</p>
        <WorkerNav />
        <div className="flex items-center justify-between border-t border-white/10 p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 rounded-[3px] px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut size={17} aria-hidden />
              Keluar
            </button>
          </form>
          <NotificationBell userId={session.user.id} base="/worker" />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[#E2E8F0] bg-white px-4 py-3 md:hidden">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0F172A]">
            {company?.logoUrl ? (
              <span className="relative block h-6 w-6 shrink-0 overflow-hidden">
                <Image src={uploadUrl(company.logoUrl)} alt="" fill sizes="24px" className="object-contain" />
              </span>
            ) : null}
            {company?.name ?? "Furniture"}
            <span className="rounded-[3px] bg-[#0A192F] px-2 py-0.5 font-mono text-[10px] font-bold text-white">{role}</span>
          </p>
          <nav className="flex gap-1 overflow-x-auto text-sm" aria-label="Navigasi worker mobile">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} className="whitespace-nowrap rounded-[3px] border border-[#E2E8F0] bg-white px-3 py-1.5 text-[#334155]">
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
