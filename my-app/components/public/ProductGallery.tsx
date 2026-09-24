"use client";

import Image from "next/image";
import { useState } from "react";
import { uploadUrl } from "@/lib/uploads";

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt?: string | null }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-[3px] border border-dashed border-[#E2E8F0] bg-white text-sm text-[#64748B]">
        Belum ada foto
      </div>
    );
  }
  const current = images[Math.min(active, images.length - 1)];
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] border border-[#E2E8F0] bg-[#F4F5F7]">
        <Image
          key={current.url}
          src={uploadUrl(current.url)}
          alt={current.alt ?? name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2" role="tablist" aria-label="Foto produk">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Foto ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-[3px] border-2 transition ${
                i === active ? "border-[#007BFF]" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={uploadUrl(img.url)}
                alt=""
                fill
                loading="lazy"
                sizes="15vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
