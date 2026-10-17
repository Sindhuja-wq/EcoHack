import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "EcoHack – Turn Waste Into Worth | AI-Powered Waste-to-Value Assistant",
  description:
    "Discover the hidden potential in everyday discards. Upload any waste item to get instant AI-powered repurposing, upcycling, repair, and verified recycling solutions.",
  keywords: [
    "EcoHack",
    "Waste to Value",
    "AI Recycling",
    "Upcycling",
    "Sustainability Assistant",
    "Zero Waste",
    "Circular Economy",
    "Daily Eco Challenges",
  ],
  authors: [{ name: "EcoHack Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body className="min-h-screen flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900 dark:selection:text-emerald-100">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
