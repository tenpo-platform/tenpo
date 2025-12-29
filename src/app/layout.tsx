import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const seriouslyNostalgic = localFont({
  src: "./fonts/SeriouslyNostalgicFnIt-Reg.otf",
  variable: "--font-seriously-nostalgic",
});

export const metadata: Metadata = {
  title: "Tenpo — Coming Soon",
  description: "We're building something great. Check back soon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${seriouslyNostalgic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
