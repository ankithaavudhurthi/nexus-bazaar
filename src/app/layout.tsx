import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Lora, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-body-alt",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://agniomega.com"),
  title: "Nexus-Bazaar",
  description:
    "Multi-vendor marketplace. Shop across vendors in one checkout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light"><body
      className={`${playfair.variable} ${cormorant.variable} ${lora.variable} ${sourceSerif.variable} font-body antialiased pt-20`}
    >
      {children}
    </body></html>
  );
}