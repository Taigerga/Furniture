"use server";

import { createInquiry } from "@/lib/api/inquiries";
import { InquirySchema } from "@/lib/validations";

export type InquiryResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createInquiryAction(
  _prev: InquiryResult | undefined,
  formData: FormData,
): Promise<InquiryResult> {
  const parsed = InquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    whatsapp: formData.get("whatsapp"),
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
  try {
    await createInquiry({
      name: parsed.data.name,
      email: parsed.data.email,
      whatsapp: parsed.data.whatsapp,
      quantity: parsed.data.quantity,
      message: parsed.data.message,
      ...(parsed.data.productId ? { productId: parsed.data.productId } : {}),
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Pengiriman gagal." };
  }
  return { ok: true };
}
