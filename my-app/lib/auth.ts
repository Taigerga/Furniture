import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "./validations";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

declare module "next-auth" {
  interface User {
    role?: string;
    backendAccessToken?: string;
  }
  interface Session {
    backendAccessToken?: string;
    user: {
      id: string;
      email: string;
      role: string;
      name?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
    backendAccessToken?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: parsed.data.email.toLowerCase(),
              password: parsed.data.password,
            }),
          });
          if (!res.ok) return null;
          const body = (await res.json()) as {
            data?: {
              accessToken: string;
              user: { id: string; email: string; name: string | null; role: string };
            };
          };
          const payload = body.data;
          if (!payload?.accessToken || !payload?.user) return null;
          return {
            id: payload.user.id,
            email: payload.user.email,
            name: payload.user.name,
            role: payload.user.role,
            backendAccessToken: payload.accessToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;
      if (pathname.startsWith("/admin")) {
        return session?.user?.role === "ADMIN";
      }
      if (pathname.startsWith("/worker")) {
        return session?.user?.role === "ADMIN" || session?.user?.role === "WORKER";
      }
      return true;
    },
    jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      if (user?.backendAccessToken) token.backendAccessToken = user.backendAccessToken;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.sub === "string" ? token.sub : "";
        session.user.role = typeof token.role === "string" ? token.role : "";
        session.backendAccessToken =
          typeof token.backendAccessToken === "string" ? token.backendAccessToken : undefined;
      }
      return session;
    },
  },
});
