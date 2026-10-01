import { z } from "zod";
import { isImageUrl } from "./image-config.mjs";

export const backgroundColors = ["bg-blue-600", "bg-yellow-400", "bg-amber-600", "bg-blue-500", "bg-lime-600", "bg-gray-800", "bg-green-700", "bg-blue-300", "bg-lime-500", "bg-purple-500", "bg-green-500", "bg-purple-700", "bg-orange-500", "bg-red-500", "bg-red-700", "bg-orange-400"];
export const textColors = ["text-white", "text-black"];

const text = z.string().trim().max(300);
const required = text.min(1, "This field is required.");
const description = z.string().trim().min(1).max(10000);
const link = z.string().trim().max(2048).refine((value) => {
  if (!value) return true;
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}, "Use a full https:// URL.");
const image = z.string().trim().max(2048).refine(isImageUrl, "Upload an image, use /projectImages/filename.png, or enter an https:// URL.");
const position = z.number().int().min(0).max(100000);

export const collections = {
  projects: { label: "Projects", titleField: "projectName", fields: [
    ["projectName", "Name", "text"], ["projectDescription", "Description", "textarea"],
    ["projectImage", "Image URL", "text"], ["projectDate", "Date", "text"],
    ["projectTechnologies", "Technologies (one per line)", "list"], ["projectType", "Project type", "text"],
    ["projectGithub", "GitHub URL", "url"], ["projectHomepage", "Website URL", "url"],
  ], schema: z.object({ projectName: required, projectDescription: description, projectImage: image,
    projectDate: required, projectTechnologies: z.array(required.max(100)).max(50), projectType: required,
    projectGithub: link, projectHomepage: link, position }).strict() },
  education: { label: "Education", titleField: "title", fields: [
    ["title", "Title", "text"], ["school", "School", "text"], ["subject", "Subject", "text"],
    ["date", "Date", "text"], ["description", "Description", "textarea"], ["recent", "Most recent", "checkbox"],
  ], schema: z.object({ title: required, school: required, subject: text, date: required, description, recent: z.boolean(), position }).strict() },
  experiences: { label: "Experience", titleField: "title", fields: [
    ["title", "Title", "text"], ["company", "Company", "text"], ["date", "Date", "text"],
    ["description", "Description", "textarea"], ["current", "Current", "checkbox"],
  ], schema: z.object({ title: required, company: required, date: required, description, current: z.boolean(), position }).strict() },
  nonprofit: { label: "Independent / nonprofit work", titleField: "title", fields: [
    ["title", "Title", "text"], ["company", "Organization / event", "text"], ["date", "Date", "text"],
    ["description", "Description", "textarea"], ["current", "Current", "checkbox"], ["projectLink", "Project URL", "url"],
  ], schema: z.object({ title: required, company: required, date: required, description, current: z.boolean(), projectLink: link, position }).strict() },
  technologies: { label: "Technologies", titleField: "title", fields: [
    ["title", "Name", "text"], ["main", "Main skill", "checkbox"], ["color", "Badge color", "color"],
    ["text", "Text color", "textColor"], ["level", "Skill level (0–100, optional)", "number"],
  ], schema: z.object({ title: required.max(100), main: z.boolean(), color: z.enum(backgroundColors),
    text: z.enum(textColors), level: z.number().int().min(0).max(100).nullable(), position }).strict() },
};

export function collectionConfig(name) {
  if (!Object.hasOwn(collections, name)) throw new Error("Unknown collection");
  return collections[name];
}

export function emptyRecord(name, position = 0) {
  const record = { position };
  for (const [field, , type] of collectionConfig(name).fields) {
    record[field] = type === "checkbox" ? false : type === "list" ? [] : type === "number" ? null : "";
  }
  if (name === "technologies") Object.assign(record, { color: backgroundColors[0], text: textColors[0] });
  return record;
}
