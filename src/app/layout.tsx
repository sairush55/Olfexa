import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OLFEXA — Understand what you wear",
  description: "Evidence-based fragrance ingredient intelligence platform. Scan perfume labels, detect alcohols accurately, identify regulated allergens, and decode formulations with scientific transparency.",
  keywords: ["perfume ingredients", "fragrance analysis", "INCI scanner", "alcohol-free perfume", "cosmetic allergens", "IFRA standards"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased selection:bg-emerald-800 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
