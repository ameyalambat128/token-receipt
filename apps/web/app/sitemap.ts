import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://tokenreceipt.dev",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
