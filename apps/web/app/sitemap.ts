import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://tokenreceipt.ameyalambat.com",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
