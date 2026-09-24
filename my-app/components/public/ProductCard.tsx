import Image from "next/image";
import Link from "next/link";
import { uploadUrl } from "@/lib/uploads";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  material?: string | null;
  category: { name: string };
  images: { url: string; alt?: string | null }[];
};

export function ProductCard({ product, large = false }: { product: ProductCardData; large?: boolean }) {
  const img = product.images[0];
  return (
    <li
      className="group h-full overflow-hidden rounded-[3px] border border-[#E2E8F0] bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#0A192F]"
    >
      <Link href={`/products/${product.slug}`} className={large ? "grid h-full sm:grid-cols-2" : "block h-full"}>
        <div className={`relative overflow-hidden bg-[#E2E8F0] ${large ? "aspect-[4/3] sm:aspect-auto sm:h-full sm:min-h-80" : "aspect-[4/3]"}`}>
          {img ? (
            <Image
              src={uploadUrl(img.url)}
              alt={img.alt ?? product.name}
              fill
              loading="lazy"
              sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 33vw"}
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : null}
        </div>
        <div className={large ? "flex flex-col justify-center border-t-2 border-t-[#007BFF] p-5 sm:p-6" : "border-t border-[#E2E8F0] p-4"}>
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#0063CE]">{product.category.name}</p>
          <h3 className={`mt-1 font-bold leading-snug text-[#0F172A] group-hover:underline ${large ? "text-xl sm:text-2xl" : "text-base"}`}>
            {product.name}
          </h3>
          {product.material ? (
            <p className="mt-1 truncate font-mono text-xs text-[#64748B]">{product.material}</p>
          ) : null}
        </div>
      </Link>
    </li>
  );
}
