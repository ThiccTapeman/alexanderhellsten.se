import { z } from "zod";
import { isImageUrl } from "./image-config.mjs";

const short = z.string().trim().max(300);
const prose = z.string().trim().max(10000);
const imageUrl = z.string().trim().max(2048).refine((value) => Boolean(value) && isImageUrl(value), "Choose an image or enter a valid image URL.");
const httpsUrl = z.string().trim().max(2048).refine((value) => {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Enter a full https:// URL.");
const picture = z.object({ src: imageUrl, alt: short.min(1, "Describe the image for screen readers."), caption: short }).strict();
const common = { id: z.string().min(1).max(100).regex(/^[\w-]+$/), title: short.min(1), body: prose };

export const projectSectionSchema = z.discriminatedUnion("type", [
  z.object({ ...common, type: z.literal("text"), layout: z.enum(["wide", "split"]) }).strict(),
  z.object({ ...common, type: z.literal("image"), layout: z.enum(["wide", "left", "right"]), image: picture }).strict(),
  z.object({ ...common, type: z.literal("gallery"), images: z.array(picture).min(1).max(12) }).strict(),
  z.object({ ...common, type: z.literal("video"), src: httpsUrl, poster: z.union([z.literal(""), imageUrl]), captions: z.union([z.literal(""), httpsUrl]).default(""), transcript: prose.min(1, "Add a transcript or a description of what the video demonstrates.") }).strict(),
  z.object({ ...common, type: z.literal("features"), items: z.array(z.object({ title: short.min(1), body: prose, image: z.union([z.null(), picture]) }).strict()).min(1).max(12) }).strict(),
]);

export const projectSectionsSchema = z.array(projectSectionSchema).max(30).default([]).refine(
  (sections) => new Set(sections.map(({ id }) => id)).size === sections.length,
  "Section IDs must be unique.",
);

// Optional résumé overrides preserve legacy independent-work wording exactly.
export const independentDetailsSchema = z.object({
  title: short, organization: short, date: short, description: prose,
  current: z.boolean(), url: z.string().max(2048).refine((value) => {
    if (!value) return true;
    try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
  }, "Enter a full http:// or https:// URL."),
  position: z.number().int().min(0).max(100000),
}).strict().nullable().default(null);

export const sectionTypes = { text: "Text / story", image: "Image / diagram", gallery: "Image gallery", video: "Video demo", features: "Feature highlights" };
export const emptyPicture = () => ({ src: "", alt: "", caption: "" });
export function newProjectSection(type, id) {
  const common = { id, type, title: "", body: "" };
  if (type === "text") return { ...common, layout: "split" };
  if (type === "image") return { ...common, layout: "wide", image: emptyPicture() };
  if (type === "gallery") return { ...common, images: [emptyPicture()] };
  if (type === "video") return { ...common, src: "", poster: "", captions: "", transcript: "" };
  if (type === "features") return { ...common, items: [{ title: "", body: "", image: null }] };
  throw new Error("Unknown section type");
}

export function independentProjects(projects) {
  return projects.filter((project) => project.independent).map((project) => {
    const details = project.independentDetails;
    return { id: project.id, title: details?.title || project.projectName,
      company: details?.organization || project.projectType, date: details?.date || project.projectDate,
      description: details?.description || project.projectDescription, current: details?.current ?? false,
      projectLink: details?.url || project.projectHomepage, position: details?.position ?? project.position };
  }).sort((a, b) => a.position - b.position || a.id - b.id);
}
