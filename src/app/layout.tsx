import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { SITE } from "@/data/complex";
import { CompareBar } from "@/components/CompareBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ToastHost } from "@/components/Toast";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin", "cyrillic"], weight: "800", variable: "--font-manrope", display: "swap" });
const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Северный парк — квартиры в Минске, Уручье", template: "%s · Северный парк" },
  description: "Жилой комплекс «Северный парк» у Уручского леса: 3 корпуса, 420 квартир, шахматка, планировки и ипотечный калькулятор. Демо-проект для портфолио.",
  openGraph: { type: "website", locale: "ru_RU", siteName: SITE.name, title: "Северный парк — квартиры у Уручского леса", description: "Каталог квартир, шахматка, планировки и ипотека." },
  alternates: { canonical: "./" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CompareBar />
        <ToastHost />
      </body>
    </html>
  );
}
