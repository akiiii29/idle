import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Idle RPG",
  description: "Web interface for Idle RPG Discord Bot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
