import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Dream Home Online | Find Your Perfect Property",
    template: "%s | Dream Home Online",
  },
  description:
    "Browse thousands of properties for sale and rent. Search homes, apartments, villas and more with Dream Home Online - your trusted property marketplace.",
  keywords: [
    "real estate",
    "properties for sale",
    "homes for rent",
    "house hunting",
    "Dream Home Online",
  ],
  openGraph: {
    title: "Dream Home Online",
    description:
      "Browse thousands of properties for sale and rent with Dream Home Online.",
    type: "website",
    siteName: "Dream Home Online",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col antialiased`}>
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
