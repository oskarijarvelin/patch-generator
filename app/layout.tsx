import type { Metadata } from "next";
import { Roboto_Condensed, Open_Sans } from "next/font/google";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Patch Generator",
  description: "CSV to PATCH document generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" className="h-full antialiased">
      <body className={`${robotoCondensed.variable} ${openSans.variable} min-h-full flex flex-col font-sans`}>{children}</body>
    </html>
  );
}
