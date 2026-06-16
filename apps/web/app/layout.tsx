import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Background from "@/components/background";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

const siteUrl = "https://tokenreceipt.ameyalambat.com";
const productName = "Token Receipt";
const productDescription =
  "Token Receipt turns your Codex, Claude Code, and Kiro CLI logs into your coding-agent bill, complete with a thermal-paper PNG and share-ready post copy.";
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION;

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex",
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
  icons: {
    icon: [
      {
        url: "/icon.png",
        type: "image/png",
        sizes: "128x128",
      },
    ],
    shortcut: "/icon.png",
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
      className={cn("dark bg-[#111010] text-white", ibmPlexSans.variable)}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Background />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
