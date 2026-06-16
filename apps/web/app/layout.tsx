import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Background from "@/components/background";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const siteUrl = "https://tokenreceipt.ameyalambat.com";
const productName = "Token Receipt";
const productDescription =
  "Token Receipt turns your Codex, Claude Code, and Kiro CLI logs into your coding-agent bill, complete with a thermal-paper PNG, pricing-aware analysis, and share-ready post copy.";
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  display: "swap",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Token Receipt | Your Agent Has Expenses",
  description: productDescription,
  keywords: [
    "Token Receipt",
    "Codex",
    "Claude Code",
    "Kiro CLI",
    "AI bill",
    "satire",
    "skills",
    "receipt generator",
    "developer tools",
  ],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  verification: googleSiteVerification
    ? {
        google: googleSiteVerification,
      }
    : undefined,
  openGraph: {
    title: productName,
    description: productDescription,
    url: siteUrl,
    siteName: productName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: productName,
    description: productDescription,
  },
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
    <html
      lang="en"
      className={cn(
        "dark bg-[color:var(--background)] text-white",
        geistSans.variable,
        geistMono.variable,
      )}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Background />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
