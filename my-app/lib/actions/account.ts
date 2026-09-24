"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";
import { changePassword, updateAccount } from "@/lib/api/users";
import { AccountSchema, ChangePasswordSchema } from "@/lib/validations";
import { formValues, type ActionState } from "./helpers";

export async function updateAccountAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const redirectTo = typeof formData.get("redirectTo") === "string" && (formData.get("redirectTo") as string).startsWith("/") ? (formData.get("redirectTo") as string) : "/admin/company-profile";
  const raw = formValues(formData, ["name", "email"]);
  const parsed = AccountSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: raw };
  }
  try {
    const r = (await updateAccount(parsed.data)) as unknown as { emailChanged: boolean };
    if (r.emailChanged) {
      await signOut({ redirectTo: "/login?msg=" + encodeURIComponent("Email berubah, silakan login kembali.") });
      return {};
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal.", values: raw };
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/worker", "layout");
  redirect(`${redirectTo}?msg=Profil akun berhasil diperbarui.`);
}

export async function changePasswordAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const redirectTo = typeof formData.get("redirectTo") === "string" && (formData.get("redirectTo") as string).startsWith("/") ? (formData.get("redirectTo") as string) : "/admin/company-profile";
  const parsed = ChangePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  try {
    await changePassword({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      confirmPassword: parsed.data.confirmPassword,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal." };
  }
  redirect(`${redirectTo}?msg=Password berhasil diganti. Sesi Anda tetap aktif.`);
}
