import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0] ?? "http";
  const metadataBase = new URL(`${protocol}://${host}`);
  const image = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: "OpenPlanTier",
    description: "Open-source library archive and stack recommender.",
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      title: "OpenPlanTier",
      description: "Build your own operating platform from open-source projects.",
      images: [{ url: image, width: 1200, height: 630, alt: "OpenPlanTier platform builder" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "OpenPlanTier",
      description: "Build your own operating platform from open-source projects.",
      images: [image],
    },
  };
}

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
