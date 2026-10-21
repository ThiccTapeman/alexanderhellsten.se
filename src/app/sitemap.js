import { getContent } from "@/lib/content";

/** @returns {Promise<import('next').MetadataRoute.Sitemap>} */
export default async function sitemap() {
  const baseUrl = "https://alexanderhellsten.se";

  // List the main pages; PDF and print views are alternate resume formats.
  const routes = ["/", "/projects", "/resume", "/contact"];

  const projects = await getContent("projects");

  return [...routes.map((route) => ({
    url: `${baseUrl}${route}`,
  })), ...projects.filter((project) => project.showInProjects && project.sections?.length > 0).map((project) => ({
    url: `${baseUrl}/projects/view/${project.id}`,
  }))];
}
