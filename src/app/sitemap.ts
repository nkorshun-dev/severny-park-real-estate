import type { MetadataRoute } from "next";
import { SITE } from "@/data/complex";
import { flats } from "@/data/flats";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "flats/", "buildings/", "mortgage/", "about/", "progress/", "contacts/"];
  return [
    ...pages.map((p) => ({ url: `${SITE.url}/${p}`, priority: p === "" ? 1 : 0.7 })),
    ...flats.map((f) => ({ url: `${SITE.url}/flats/${f.id}/`, priority: 0.5 })),
  ];
}
