import type { Metadata } from "next";

const APP_NAME = "Masjidinfo";
const APP_DESCRIPTION =
  "Aplikasi Masjid - Temukan masjid terdekat, jadwal, dan informasi ibadah.";
const APP_URL = "https://masjidinfo.id";

export type MetadataOptions = {
  title?: string;
  description?: string;
  keywords?: string[];
  noSuffix?: boolean;
  image?: string;
  url?: string;
};

export function createMetadata({
  title,
  description = APP_DESCRIPTION,
  keywords = ["masjid", "jadwal sholat", "quran", "islam", "muslim"],
  noSuffix = false,
  image,
}: MetadataOptions = {}): Metadata {
  const baseTitle = title
    ? noSuffix
      ? title
      : `${title} - ${APP_NAME}`
    : APP_NAME;
  const imageUrl = image || `${APP_URL}/favicon-32x32.png`;

  return {
    title: baseTitle,
    description,
    keywords,
    authors: { name: "Masjidinfo Team" },
    creator: "Masjidinfo",
    publisher: "Masjidinfo",
    metadataBase: new URL(APP_URL),
    openGraph: {
      title: title || APP_NAME,
      description,
      url: APP_URL,
      siteName: APP_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || APP_NAME,
        },
      ],
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title || APP_NAME,
      description,
      images: imageUrl,
      site: "@masjidinfo",
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    appleWebApp: {
      capable: true,
      title: APP_NAME,
      statusBarStyle: "default",
    },
    formatDetection: {
      telephone: false,
    },
    manifest: "/site.webmanifest",
  };
}
