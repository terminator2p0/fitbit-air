import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fitbit Air",
  description: "A private personal health dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
