import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Candid",
  description: "Honest feedback on your resume and portfolio, for designers, in minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
