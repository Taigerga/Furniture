"use server";

import { createInquiry } from "@/lib/api/inquiries";
import { getCompanyProfile } from "@/services/public.service";
import { InquirySchema } from "@/lib/validations";
import { buildCustomerInquiryText, normalizeWaNumber } from "@/lib/wa";

export type InquirySummary = {
  name: string;
  whatsapp: string;
  email: string;
  product: string | null;
  quantity: number;
};

export type InquiryResult =
  | { ok: true; waText: string; summary: InquirySummary }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createInquiryAction(
  _prev: InquiryResult | undefined,
  formData: FormData,
): Promise<InquiryResult> {
  // Normalisasi nomor lebih dulu agar yang tersimpan (dan yang muncul di
  // tautan WhatsApp admin) selalu format internasional 628…
  const waRaw = typeof formData.get("whatsapp") === "string" ? (formData.get("whatsapp") as string).trim() : "";
  const waNormalized = normalizeWaNumber(waRaw);
  if (waRaw && !waNormalized) {
    return {
      ok: false,
      error: "Periksa kembali isian form.",
      fieldErrors: {
        whatsapp: ["Nomor WhatsApp tidak valid. Contoh: 0812-3456-7890 atau +6281234567890."],
      },
    };
  }

  const parsed = InquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    whatsapp: waNormalized ?? waRaw,
    quantity: formData.get("quantity"),
    message: formData.get("message"),
    productId: formData.get("productId"),
  });
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: "Periksa kembali isian form.",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    };
  }

  let productName: string | null = null;
  try {
    const res = await createInquiry({
      name: parsed.data.name,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      quantity: parsed.data.quantity,
      message: parsed.data.message,
      ...(parsed.data.productId ? { productId: parsed.data.productId } : {}),
    });
    productName = res?.productName ?? null;
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Pengiriman gagal." };
  }

  const summary: InquirySummary = {
    name: parsed.data.name,
    whatsapp: parsed.data.whatsapp,
    email: parsed.data.email,
    product: productName,
    quantity: parsed.data.quantity,
  };

  // Nama perusahaan hanya untuk teks; kegagalan fetch tidak boleh membatalkan
  // inquiry yang sudah tersimpan.
  let companyName = "Admin";
  try {
    const company = await getCompanyProfile();
    if (company?.name) companyName = company.name;
  } catch {
    /* pakai nama cadangan */
  }

  const waText = buildCustomerInquiryText(
    {
      name: summary.name,
      email: summary.email,
      whatsapp: summary.whatsapp,
      quantity: summary.quantity,
      message: parsed.data.message,
      productName: summary.product,
    },
    companyName,
  );

  return { ok: true, waText, summary };
}
