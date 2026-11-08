import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-forest/20 selection:text-forest dark:selection:text-limeaccent bg-cream dark:bg-night text-charcoal dark:text-cream transition-colors">
        <Providers>
          <Navbar />
          <main className="flex-1 w-full flex flex-col">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
