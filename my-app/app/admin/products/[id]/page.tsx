import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  updateProductAction,
  addProductImagesAction,
  setMainProductImageAction,
  deleteProductImageAction,
} from "@/lib/actions/products";
import { adminGetProduct } from "@/services/admin.service";
import { getCategoriesForAdmin } from "@/services/catalog.service";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader, FlashMessage } from "@/components/admin/PageHeader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { DropzoneInput } from "@/components/admin/DropzoneInput";
import { ApprovalBadge, draftLock } from "@/components/worker/WorkerBits";
import { auth } from "@/lib/auth";
import { uploadUrl } from "@/lib/uploads";

export const metadata: Metadata = { title: "Edit Produk" };

function AddImagesForm({ productId, count }: { productId: string; count: number }) {
  return (
    <form action={addProductImagesAction.bind(null, productId)} className="space-y-2">
      <DropzoneInput
        id="add-img"
        name="images"
        label={`Tambah foto (${count}/8 terpakai)`}
        multiple
        maxFiles={8}
        hint={`JPG, PNG, WebP · maks 2MB/file · sisa ${8 - count} slot`}
      />
      <button type="submit" className="rounded-[3px] bg-[#0A192F] px-4 py-2 text-sm font-medium text-white hover:bg-[#13233F]">
        Upload ({count}/8)
      </button>
    </form>
  );
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ msg?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const session = await auth();
  const product = await adminGetProduct(id);
  if (!product) notFound();
  const lock = draftLock(
    { createdById: product.createdById, approvalStatus: product.approvalStatus, createdBy: product.createdBy },
    session!.user.id,
  );
  const categories = await getCategoriesForAdmin();

  const updateAction = updateProductAction.bind(null, id);

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title={`Edit: ${product.name}`} />
      {sp.msg ? <FlashMessage message={sp.msg} /> : null}
      <p><ApprovalBadge status={product.approvalStatus} /></p>
      {lock.locked ? (
        <p role="status" className="rounded-[3px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-[#B45309]">
          Draf milik {lock.ownerName} — hanya pemilik yang boleh mengubah. {lock.orphan ? "Akun pemilik nonaktif: Anda boleh menghapus produk ini dari daftar." : "Minta pemilik yang mengubah, atau tunggu sampai diajukan untuk review."}
        </p>
      ) : null}
      {!lock.locked ? (
      <>
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

      <section className="rounded-[3px] border border-[#E2E8F0] bg-white p-6" aria-label="Kelola foto">
        <h2 className="font-medium text-[#0F172A]">Foto Produk</h2>
        {product.images.length === 0 ? (
          <p className="mt-2 text-sm text-[#64748B]">Belum ada foto.</p>
        ) : (
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
                <span className="flex gap-1 p-1.5">
                  {!img.isMain ? (
                    <form action={setMainProductImageAction.bind(null, id, img.id)} className="flex-1">
                      <button type="submit" className="w-full rounded-[3px] border border-[#CBD5E1] px-2 py-1 text-xs hover:border-[#0A192F]">
                        Jadikan utama
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteProductImageAction.bind(null, id, img.id)} className="flex-1">
                    <DeleteButton label="Hapus" confirmText="Hapus foto ini?" />
                  </form>
                </span>
              </li>
            ))}
          </ul>
        )}
        {product.images.length < 8 ? (
          <div className="mt-4 border-t border-[#E2E8F0] pt-4">
            <AddImagesForm productId={id} count={product.images.length} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#64748B]">Sudah 8/8 foto. Hapus salah satu untuk menambah.</p>
        )}
      </section>
      </>
      ) : null}
    </div>
  );
}
