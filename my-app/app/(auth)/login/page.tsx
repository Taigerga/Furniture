import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCompanyProfile } from "@/services/public.service";
import { uploadUrl } from "@/lib/uploads";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; msg?: string }>;
}) {
  const { callbackUrl, msg } = await searchParams;
  const session = await auth();
  if (session?.user?.role === "WORKER" && (!callbackUrl || callbackUrl.startsWith("/admin"))) {
    redirect("/worker");
  }
  if (session?.user?.role === "ADMIN" && callbackUrl?.startsWith("/worker")) {
    redirect("/admin");
  }
  const company = await getCompanyProfile();
  return (
    <main className="bg-blueprint-dark flex min-h-screen items-center justify-center bg-[#0A192F] px-4 py-10">
      <section className="w-full max-w-sm rounded-[3px] border border-white/10 bg-white p-6">
        <p className="tech-label text-center text-[#0063CE]">ACCESS / SECURE</p>
        {company?.logoUrl ? (
          <span className="relative mx-auto mb-3 mt-3 block h-12 w-32">
            <Image src={uploadUrl(company.logoUrl)} alt={company.name} fill sizes="128px" className="object-contain" />
          </span>
        ) : null}
        <h1 className="text-center text-xl font-extrabold tracking-tight text-[#0F172A]">Login Staf</h1>
        <p className="mb-5 mt-1 text-center text-sm text-[#64748B]">
          {company?.name ?? "Kelola konten website furniture."}
        </p>
        {msg ? (
          <p role="status" className="mb-4 rounded-[3px] border border-[#BFDBFE] bg-[#DBEAFE] px-3 py-2 text-center text-sm text-[#0A192F]">
            {msg}
          </p>
        ) : null}
        <LoginForm callbackUrl={callbackUrl ?? (session?.user?.role === "WORKER" ? "/worker" : "/admin")} />
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[#64748B]">
          GRID / AUTH / REV.01
        </p>
      </section>
    </main>
  );
}
