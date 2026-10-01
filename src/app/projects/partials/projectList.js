import { getContent } from "@/lib/content";
import ProjectListClient from "./projectListClient";

export default async function ProjectList(props) {
  const [portfolioItems, technologies] = await Promise.all([getContent("projects"), getContent("technologies")]);
  return <ProjectListClient {...props} portfolioItems={portfolioItems} technologies={technologies} />;
}
