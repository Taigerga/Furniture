import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  updateWorkerProduct,
  addWorkerProductImages,
  deleteWorkerProductImage,
  submitWorkerProduct,
} from "@/lib/actions/worker-products";
import { workerGetProduct } from "@/services/worker.service";
import { getCategories } from "@/services/catalog.service";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ApprovalBadge } from "@/components/worker/WorkerBits";
import { uploadUrl } from "@/lib/uploads";

export const metadata: Metadata = { title: "Edit Produk" };

export default async function WorkerEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await auth();
  const isAdmin = session!.user.role === "ADMIN";
  const product = await workerGetProduct(session!.user.id, id, isAdmin);
  if (!product) notFound();
  const categories = await getCategories();
  const locked = product.approvalStatus === "PENDING";
  const updateAction = updateWorkerProduct.bind(null, id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <PageHeader title={`Edit: ${product.name}`} />
        </div>
        <ApprovalBadge status={product.approvalStatus} />
      </div>
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      {product.approvalStatus === "REJECTED" && product.rejectionReason ? (
        <p role="alert" className="rounded-[3px] border border-[#FECACA] bg-[#FEE2E2] px-4 py-3 text-sm text-[#DC2626]">
          Ditolak admin. Alasan: {product.rejectionReason} — perbaiki lalu ajukan ulang.
        </p>
      ) : null}
      {locked ? (
        <p role="status" className="rounded-[3px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-[#B45309]">
          Sedang menunggu review admin — tidak dapat diubah. Hubungi admin bila mendesak.
        </p>
      ) : (
        <ProductForm
          action={updateAction}
          categories={categories}
          defaults={{
            name: product.name,
            slug: product.slug,
            categoryId: product.categoryId,
            shortDesc: product.shortDesc ?? "",
            description: product.description ?? "",
            material: product.material ?? "",
            dimensions: product.dimensions ?? "",
            color: product.color ?? "",
            specifications: product.specifications ?? "",
            status: product.status,
            featured: product.featured,
          }}
          submitLabel="Simpan Perubahan"
        />
      )}

      {!locked && (
        <section className="rounded-[3px] border border-[#E2E8F0] bg-white p-6" aria-label="Kelola foto">
          <h2 className="font-medium text-[#0F172A]">Foto Produk ({product.images.length}/8)</h2>
          {product.images.length > 0 ? (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {product.images.map((img) => (
                <li key={img.id} className="overflow-hidden rounded-[3px] border border-[#E2E8F0]">
                  <span className="relative block aspect-square bg-[#F4F5F7]">
                    <Image src={uploadUrl(img.url)} alt={img.alt ?? ""} fill loading="lazy" sizes="20vw" className="object-cover" />
                    {img.isMain ? (
                      <span className="absolute left-1.5 top-1.5 rounded-[3px] bg-[#0A192F] px-2 py-0.5 text-xs font-medium text-white">
                        Utama
                      </span>
                    ) : null}
                  </span>
                  <form action={deleteWorkerProductImage.bind(null, id, img.id)} className="p-1.5">
                    <DeleteButton label="Hapus" confirmText="Hapus foto ini?" />
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[#64748B]">Belum ada foto.</p>
          )}
          {product.images.length < 8 ? (
            <form action={addWorkerProductImages.bind(null, id)} className="mt-4 space-y-2 border-t border-[#E2E8F0] pt-4">
              <label htmlFor="w-add-img" className="text-sm text-[#334155]">Tambah foto (maks 2MB/file)</label>
              <input id="w-add-img" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="block text-sm" />
              <button type="submit" className="rounded-[3px] bg-[#0A192F] px-4 py-2 text-sm font-medium text-white hover:bg-[#13233F]">
                Upload
              </button>
            </form>
          ) : null}
        </section>
      )}

      {(product.approvalStatus === "DRAFT" || product.approvalStatus === "REJECTED") && (
        <form action={submitWorkerProduct.bind(null, id)}>
          <button type="submit" className="w-full rounded-[3px] bg-[#0A192F] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#0A192F]">
            Ajukan untuk Review Admin
          </button>
        </form>
      )}
    </div>
  );
}
