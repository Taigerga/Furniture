"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createWorker as apiCreateWorker, listWorkers as apiListWorkers, resetWorkerPassword as apiResetPassword, toggleWorkerActive as apiToggleActive, type WorkerRow } from "@/lib/api/users";
import { formValues, type ActionState } from "./helpers";

const CreateSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter.").max(100),
  email: z.string().min(1).email("Format email tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter.").max(100),
});

const ResetSchema = z.object({
  password: z.string().min(8, "Password minimal 8 karakter.").max(100),
});

export async function createWorkerAction(_prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const raw = formValues(formData, ["name", "email", "password"]);
  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Periksa kembali isian form.", fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>, values: { name: raw.name ?? "", email: raw.email ?? "" } };
  }
  try {
    await apiCreateWorker(parsed.data);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal.", values: { name: raw.name ?? "", email: raw.email ?? "" } };
  }
  revalidatePath("/admin/workers");
  redirect("/admin/workers?msg=Akun worker berhasil dibuat.");
}

export async function toggleWorkerActive(id: string, isActive: boolean) {
  try {
    await apiToggleActive(id, isActive);
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Operasi gagal.");
  }
  revalidatePath("/admin/workers");
  redirect(`/admin/workers?msg=Akun worker berhasil ${isActive ? "diaktifkan" : "dinonaktifkan"}.`);
}

export async function resetWorkerPassword(id: string, _prev: ActionState | undefined, formData: FormData): Promise<ActionState> {
  const parsed = ResetSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Password tidak valid." };
  }
  try {
    await apiResetPassword(id, parsed.data.password);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Operasi gagal." };
  }
  revalidatePath("/admin/workers");
  redirect("/admin/workers?msg=Password worker berhasil direset.");
}

export async function listWorkers(): Promise<WorkerRow[]> {
  return apiListWorkers();
}
