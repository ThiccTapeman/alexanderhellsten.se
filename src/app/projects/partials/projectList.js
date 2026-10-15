import { getContent } from "@/lib/content";
import ProjectListClient from "./projectListClient";

export default async function ProjectList(props) {
  const [portfolioItems, technologies] = await Promise.all([getContent("projects"), getContent("technologies")]);
  const summaries = portfolioItems.filter((project) => project.showInProjects).map((project) => {
    const summary = { ...project };
    delete summary.sections;
    delete summary.independentDetails;
    return summary;
  });
  return <ProjectListClient {...props} portfolioItems={summaries} technologies={technologies} />;
}
