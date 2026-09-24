"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminUpdateCompany } from "@/lib/api/company";
import { uploadOne } from "@/lib/api/client";
import { CompanyProfileSchema } from "@/lib/validations";
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
    await adminUpdateCompany({
      ...parsed.data,
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
