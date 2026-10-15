import { getContent } from "@/lib/content";
import ProjectListClient from "./projectListClient";

export default async function ProjectList(props) {
  const [portfolioItems, technologies] = await Promise.all([getContent("projects"), getContent("technologies")]);
  const summaries = portfolioItems.map((project) => {
    const summary = { ...project, hasArticle: Array.isArray(project.sections) && project.sections.length > 0 };
    delete summary.sections;
    return summary;
  });
  return <ProjectListClient {...props} portfolioItems={summaries} technologies={technologies} />;
}
