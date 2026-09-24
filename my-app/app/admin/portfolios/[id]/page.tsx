import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  updatePortfolioAction,
  addPortfolioImagesAction,
  deletePortfolioImageAction,
} from "@/lib/actions/portfolios";
import { adminGetPortfolio } from "@/services/admin.service";
import { PortfolioForm } from "@/components/admin/PortfolioForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { uploadUrl } from "@/lib/uploads";
import { DropzoneInput } from "@/components/admin/DropzoneInput";

export const metadata: Metadata = { title: "Edit Portofolio" };

export default async function EditPortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const pf = await adminGetPortfolio(id);
  if (!pf) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={`Edit: ${pf.title}`} />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}

      <PortfolioForm
        action={updatePortfolioAction.bind(null, id)}
        defaults={{
          title: pf.title,
          slug: pf.slug,
          client: pf.client ?? "",
          location: pf.location ?? "",
          year: pf.year ? String(pf.year) : "",
          description: pf.description ?? "",
          featured: pf.featured,
        }}
        submitLabel="Simpan Perubahan"
      />

      <section className="rounded-[3px] border border-[#E2E8F0] bg-white p-6" aria-label="Kelola foto proyek">
        <h2 className="font-medium text-[#0F172A]">Foto Proyek ({pf.images.length}/10)</h2>
        {pf.images.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pf.images.map((img) => (
              <li key={img.id} className="overflow-hidden rounded-[3px] border border-[#E2E8F0]">
                <span className="relative block aspect-square bg-[#F4F5F7]">
                  <Image src={uploadUrl(img.url)} alt={img.alt ?? ""} fill loading="lazy" sizes="20vw" className="object-cover" />
                </span>
                <form action={deletePortfolioImageAction.bind(null, id, img.id)} className="p-1.5">
                  <DeleteButton label="Hapus" confirmText="Hapus foto ini?" />
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-[#64748B]">Belum ada foto.</p>
        )}
        {pf.images.length < 10 ? (
          <form
            action={addPortfolioImagesAction.bind(null, id)}
            className="mt-4 space-y-2 border-t border-[#E2E8F0] pt-4"
          >
            <DropzoneInput
              id="pf-add"
              name="images"
              label={`Tambah foto (${pf.images.length}/10 terpakai)`}
              multiple
              maxFiles={10}
              hint={`JPG, PNG, WebP · maks 2MB/file · sisa ${10 - pf.images.length} slot`}
            />
            <button type="submit" className="rounded-[3px] bg-[#0A192F] px-4 py-2 text-sm font-medium text-white hover:bg-[#13233F]">
              Upload
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
