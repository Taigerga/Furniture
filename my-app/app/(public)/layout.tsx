import { getCompanyProfile } from "@/services/public.service";
import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const company = await getCompanyProfile();
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F5F7] text-[#0F172A]">
      <SiteHeader brand={company?.name ?? "Furniture"} phone={company?.phone} logoUrl={company?.logoUrl} />
      <div className="flex-1">{children}</div>
      <SiteFooter company={company} />
    </div>
  );
}
