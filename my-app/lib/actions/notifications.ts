"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { markAllNotificationsRead as apiMarkAll, markNotificationRead as apiMarkRead } from "@/lib/api/notifications";

export async function markNotificationRead(id: string, redirectTo: string) {
  try {
    await apiMarkRead(id);
  } catch {
    // Abaikan: tetap arahkan pengguna ke tujuan.
  }
  const safe = redirectTo.startsWith("/") ? redirectTo : "/worker";
  redirect(safe);
}

export async function markAllNotificationsRead(redirectTo: string) {
  try {
    await apiMarkAll();
  } catch {
    // Abaikan: tetap arahkan pengguna ke tujuan.
  }
  const safe = redirectTo.startsWith("/") ? redirectTo : "/worker";
  revalidatePath(safe);
  redirect(`${safe}?msg=Semua notifikasi ditandai dibaca.`);
}
