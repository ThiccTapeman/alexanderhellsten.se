/** @returns {import('next').MetadataRoute.Sitemap} */
export default function sitemap() {
  const baseUrl = "https://alexanderhellsten.se";

  // List the main pages; PDF and print views are alternate resume formats.
  const routes = ["/", "/projects", "/resume", "/contact"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
  }));
}
