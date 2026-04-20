import type { Metadata } from "next";
import { Mulish } from "next/font/google";

import { Web3Providers } from "@/components/providers/Web3Providers";
import { Toaster } from "sonner";

import "./globals.css";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  title: "K-INTENT | Intent-Based Payments on Solana",
  description:
    "Non-custodial payment gateway — SafeFound-inspired checkout on Solana Devnet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={mulish.variable}>
      <body className="min-h-screen bg-[#020202] font-mulish text-white antialiased">
        <Web3Providers>
          {children}
          <Toaster
            theme="dark"
            richColors
            position="top-center"
            toastOptions={{
              classNames: {
                toast:
                  "font-mulish border border-white/[0.1] bg-[#0a0a0a]/95 backdrop-blur-xl",
              },
            }}
          />
        </Web3Providers>
      </body>
    </html>
  );
}
