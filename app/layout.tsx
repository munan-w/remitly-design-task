import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remitly name change prototype",
  description: "Mock Remitly profile and legal name change prototype"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
