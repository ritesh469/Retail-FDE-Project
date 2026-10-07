import "./globals.css";
import type { Metadata } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import { Nav } from "./components/Nav";

// Archivo's width axis gives the expanded, shipping-label headings (.display);
// Martian Mono is for case numbers and prices.
const sans = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-sans",
  display: "swap",
});
const mono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReturnGuard Shop",
  description: "Shop + governed return review",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <Nav />
        <main className="shell">{children}</main>
        <footer className="site-foot">
          <div className="site-foot-inner">
            <span>ReturnGuard demo store</span>
            <span>Test mode - no real payments are taken.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
