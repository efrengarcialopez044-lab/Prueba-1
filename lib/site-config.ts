/**
 * Canonical site URL, used for metadataBase, sitemap.xml, robots.txt and
 * Open Graph tags. Defaults to the current Vercel deployment; set
 * NEXT_PUBLIC_SITE_URL once a custom domain is attached.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://casa-elody.vercel.app";
