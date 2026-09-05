import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Mentor Platform",
  description: "Nền tảng mentoring cộng đồng",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="vi">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
