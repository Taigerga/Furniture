import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Furniture — Custom Furniture Minimal & Elegan",
    template: "%s · Furniture",
  },
  description: "Katalog produk, portofolio proyek, dan inquiry custom furniture.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${sans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
