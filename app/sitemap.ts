import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/reservar`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/politica-cookies`, lastModified, changeFrequency: "yearly", priority: 0.2 },
  ];
}
