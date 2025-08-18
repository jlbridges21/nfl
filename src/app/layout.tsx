import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NFL Game Predictor",
  description: "Predict NFL game outcomes using advanced analytics and machine learning. Get score predictions, win probabilities, and betting insights.",
  keywords: ["NFL", "predictions", "analytics", "football", "betting", "sports"],
  authors: [{ name: "NFL Game Predictor" }],
  openGraph: {
    title: "NFL Game Predictor",
    description: "Predict NFL game outcomes using advanced analytics and machine learning.",
    type: "website",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "NFL Game Predictor",
    description: "Predict NFL game outcomes using advanced analytics and machine learning.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
