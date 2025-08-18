import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SPX Daily Data - S&P 500 OHLC Tracker",
  description: "Track S&P 500 daily OHLC data with interactive filtering and statistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased bg-white text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
