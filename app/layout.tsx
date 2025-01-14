import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Make IT FART",
  description: "Make IT FART THE OFFICIAL SOLANA TOKEN",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
