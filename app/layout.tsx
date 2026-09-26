import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "studystow.com",
    template: "%s | studystow.com",
  },
  description:
    "Browse and discover books available on studystow.com.",
  applicationName: "studystow.com",
  keywords: [
    "studystow.com",
    "books",
    "online bookstore",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen bg-white text-black antialiased">
        {children}
      </body>
    </html>
  );
}