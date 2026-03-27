import type { Metadata } from "next";
import { Oswald, Barlow } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const barlow = Barlow({
  variable: "--font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "MinTai Bape - Shop Acc PUBG Mobile",
  description: "Shop tai khoan PUBG Mobile voi giao dien gaming manh, ro, va de chot don.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${oswald.variable} ${barlow.variable}`}>{children}</body>
    </html>
  );
}
