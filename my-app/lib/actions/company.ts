"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminUpdateCompany } from "@/lib/api/company";
import { uploadOne } from "@/lib/api/client";
import { CompanyProfileSchema } from "@/lib/validations";
import { normalizeWaNumber } from "@/lib/wa";
import { formFiles, formValues, type ActionState } from "./helpers";

const KEYS = [
  "name", "tagline", "description", "history", "vision", "mission",
  "phone", "whatsapp", "email", "address", "mapsUrl",
  "instagram", "facebook", "linkedin", "hours", "latitude", "longitude",
];

export async function updateCompanyAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, KEYS);
  const parsed = CompanyProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  try {
    const logoFiles = formFiles(formData, "logo");
    const heroFiles = formFiles(formData, "hero");
    const logoUrl = logoFiles.length > 0 && logoFiles[0] ? await uploadOne(logoFiles[0], "logo") : undefined;
    let heroImageUrl: string | null | undefined;
    if (formData.get("removeHero") === "on") {
      heroImageUrl = null;
    } else if (heroFiles.length > 0 && heroFiles[0]) {
      heroImageUrl = await uploadOne(heroFiles[0], "hero");
    }
    // WhatsApp disimpan sebagai digit internasional tanpa "+" dan tanpa nol di
    // depan (628…). wa.me hanya menerima format itu; ini sekaligus memperbaiki
    // record lama yang masih tersimpan "0821…".
    const waRaw = typeof parsed.data.whatsapp === "string" ? parsed.data.whatsapp.trim() : "";
    const whatsapp = waRaw ? (normalizeWaNumber(waRaw) ?? waRaw) : "";
    await adminUpdateCompany({
      ...parsed.data,
      whatsapp,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      ...(logoUrl !== undefined ? { logoUrl } : {}),
      ...(heroImageUrl !== undefined ? { heroImageUrl } : {}),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal.", values: raw };
  }
  revalidatePath("/", "layout");
  redirect("/admin/company-profile?msg=Profil perusahaan berhasil disimpan.");
}
