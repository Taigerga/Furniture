"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { LoginSchema } from "@/lib/validations";

export async function loginAction(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid." };
  }
  // Rate limit login kini ditegakkan backend NestJS (POST /auth/login, 10x/10 mnt).
  const callbackUrl = (formData.get("callbackUrl") as string) || "/admin";
  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirectTo: callbackUrl.startsWith("/") ? callbackUrl : "/admin",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") return { error: "Email atau password salah." };
      return { error: "Login gagal. Silakan coba lagi." };
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
