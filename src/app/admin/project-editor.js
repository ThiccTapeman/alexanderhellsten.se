"use client";

import { useId, useState } from "react";
import Link from "next/link";
import ImageField from "./image-field";
import { emptyPicture, newProjectSection, sectionTypes } from "@/lib/project-details.mjs";

const inputClass = "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500";
const smallButton = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-40";

function Field({ label, hint, value, onChange, multiline = false, ...props }) {
  const id = useId();
  return <div><label htmlFor={id} className="block text-sm font-semibold">{label}</label>
    {hint && <p id={`${id}-hint`} className="mt-1 text-xs leading-relaxed text-slate-500">{hint}</p>}
    {multiline ? <textarea id={id} rows={4} className={inputClass} value={value ?? ""} onChange={(event) => onChange(event.target.value)} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      : <input id={id} className={inputClass} value={value ?? ""} onChange={(event) => onChange(event.target.value)} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />}
  </div>;
}

function Group({ title, hint, children }) {
  return <section className="border-t border-slate-200 pt-6 space-y-5"><div><h3 className="text-lg font-bold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-slate-500">{hint}</p></div>{children}</section>;
}

function PictureEditor({ picture, onChange, upload, disabled }) {
  return <div className="space-y-4 rounded-xl bg-slate-50 p-4">
    <ImageField value={picture.src} disabled={disabled} onChange={(src) => onChange({ ...picture, src })} onUpload={async (file) => { const url = await upload(file); if (url) onChange({ ...picture, src: url }); }} />
    <Field label="Image description (alt text)" hint="Describe what the image shows for visitors using screen readers." value={picture.alt} onChange={(alt) => onChange({ ...picture, alt })} required maxLength={300} />
    <Field label="Caption (optional)" hint="A short explanation displayed below the image." value={picture.caption} onChange={(caption) => onChange({ ...picture, caption })} maxLength={300} />
  </div>;
}

function Reorder({ index, count, label, move, remove }) {
  return <div className="flex flex-wrap gap-2">
    <button type="button" className={smallButton} disabled={index === 0} aria-label={`Move ${label} up`} onClick={() => move(index - 1)}>↑</button>
    <button type="button" className={smallButton} disabled={index === count - 1} aria-label={`Move ${label} down`} onClick={() => move(index + 1)}>↓</button>
    <button type="button" className={`${smallButton} text-red-700`} aria-label={`Remove ${label}`} onClick={remove}>Remove</button>
  </div>;
}

function moved(items, from, to) {
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

function SectionEditor({ section, onChange, upload, disabled }) {
  const update = (field, value) => onChange({ ...section, [field]: value });
  const updateItem = (field, index, value) => update(field, section[field].map((item, i) => i === index ? value : item));
  const removeItem = (field, index) => update(field, section[field].filter((_, i) => i !== index));
  return <div className="space-y-5">
    <Field label="Section heading" hint="For example: The idea, Development, Challenges, or Outcome." value={section.title} onChange={(value) => update("title", value)} required maxLength={300} />
    <Field label="Section text (optional)" hint="Keep it scannable. Line breaks are preserved; HTML is not needed." value={section.body} onChange={(value) => update("body", value)} multiline maxLength={10000} />
    {(section.type === "text" || section.type === "image") && <label className="block text-sm font-semibold">Layout<select className={inputClass} value={section.layout} onChange={(event) => update("layout", event.target.value)}>
      <option value="wide">Full width</option>{section.type === "text" ? <option value="split">Heading beside text</option> : <><option value="left">Image on the left</option><option value="right">Image on the right</option></>}
    </select></label>}
    {section.type === "image" && <PictureEditor picture={section.image} onChange={(value) => update("image", value)} upload={upload} disabled={disabled} />}
    {section.type === "gallery" && <div className="space-y-5">{section.images.map((picture, index) => <div key={index} className="rounded-xl border border-slate-200 p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold">Image {index + 1}</h4><Reorder index={index} count={section.images.length} label={`image ${index + 1}`} move={(to) => update("images", moved(section.images, index, to))} remove={() => removeItem("images", index)} /></div>
      <PictureEditor picture={picture} onChange={(value) => updateItem("images", index, value)} upload={upload} disabled={disabled} />
    </div>)}<button type="button" className={smallButton} disabled={section.images.length >= 12} onClick={() => update("images", [...section.images, emptyPicture()])}>Add image</button><p className="text-xs text-slate-500">1–12 images. Visitors can open each image at full size.</p></div>}
    {section.type === "video" && <>
      <Field label="Video URL" hint="A direct HTTPS link to an MP4 or WebM file, rather than a YouTube page. Videos load only when played." value={section.src} onChange={(value) => update("src", value)} type="url" required maxLength={2048} />
      <Field label="English captions URL (optional)" hint="For videos with speech, provide a HTTPS WebVTT (.vtt) caption file. The media host must allow cross-origin requests." value={section.captions} onChange={(value) => update("captions", value)} type="url" maxLength={2048} />
      <ImageField value={section.poster} disabled={disabled} onChange={(value) => update("poster", value)} onUpload={async (file) => { const url = await upload(file); if (url) update("poster", url); }} />
      <p className="text-xs text-slate-500">This optional image is the video poster shown before playback.</p>
      <Field label="Transcript / visual description" hint="Include spoken content and describe important visual actions so everyone can follow the demonstration." value={section.transcript} onChange={(value) => update("transcript", value)} multiline required maxLength={10000} />
    </>}
    {section.type === "features" && <div className="space-y-5">{section.items.map((item, index) => <div key={index} className="rounded-xl border border-slate-200 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold">Highlight {index + 1}</h4><Reorder index={index} count={section.items.length} label={`highlight ${index + 1}`} move={(to) => update("items", moved(section.items, index, to))} remove={() => removeItem("items", index)} /></div>
      <Field label="Highlight title" value={item.title} onChange={(title) => updateItem("items", index, { ...item, title })} required maxLength={300} />
      <Field label="Short explanation" value={item.body} onChange={(body) => updateItem("items", index, { ...item, body })} multiline maxLength={10000} />
      {item.image ? <><PictureEditor picture={item.image} onChange={(image) => updateItem("items", index, { ...item, image })} upload={upload} disabled={disabled} /><button type="button" className={smallButton} onClick={() => updateItem("items", index, { ...item, image: null })}>Remove highlight image</button></> : <button type="button" className={smallButton} onClick={() => updateItem("items", index, { ...item, image: emptyPicture() })}>Add highlight image</button>}
    </div>)}<button type="button" className={smallButton} disabled={section.items.length >= 12} onClick={() => update("items", [...section.items, { title: "", body: "", image: null }])}>Add highlight</button><p className="text-xs text-slate-500">1–12 highlights, shown as visual cards.</p></div>}
  </div>;
}

export default function ProjectEditor({ project, onChange, upload, disabled }) {
  const [nextType, setNextType] = useState("image");
  const update = (field, value) => onChange((current) => ({ ...current, [field]: value }));
  const sections = project.sections || [];
  const independent = project.independentDetails || { title: "", organization: "", date: "", description: "", current: false, url: "", position: project.position };
  const updateIndependent = (field, value) => update("independentDetails", { ...independent, [field]: value });

  return <div className="space-y-8">
    <Group title="Project basics" hint="Shared by the existing project card and the top of its detail page.">
      <Field label="Project name" value={project.projectName} onChange={(value) => update("projectName", value)} required maxLength={300} />
      <Field label="Summary" hint="The existing card description. Introduce the project in a few sentences." value={project.projectDescription} onChange={(value) => update("projectDescription", value)} multiline required maxLength={10000} />
      <div className="grid gap-5 sm:grid-cols-2"><Field label="Date / date range" hint="For example: Jan 2026 or July 2026 – Present." value={project.projectDate} onChange={(value) => update("projectDate", value)} required maxLength={300} /><Field label="Project type" hint="Used by the existing project filters." value={project.projectType} onChange={(value) => update("projectType", value)} required maxLength={300} /></div>
      <Field label="Technologies" hint="One technology per line. Existing technology names keep their badge colors." value={project.projectTechnologies.join("\n")} onChange={(value) => update("projectTechnologies", value.split("\n"))} multiline />
      <label className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4"><input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={project.independent} onChange={(event) => update("independent", event.target.checked)} /><span><span className="block font-semibold">Independent project</span><span className="text-sm text-slate-600">Include this project in Independent Projects on the résumé and its print versions.</span></span></label>
    </Group>
    <Group title="Cover & links" hint="The cover appears on the existing card and detail page. External links keep their current behavior.">
      <ImageField value={project.projectImage} disabled={disabled} onChange={(value) => update("projectImage", value)} onUpload={async (file) => { const url = await upload(file); if (url) update("projectImage", url); }} />
      <Field label="Project website" value={project.projectHomepage} type="url" onChange={(value) => update("projectHomepage", value)} maxLength={2048} />
      <Field label="GitHub repository" value={project.projectGithub} type="url" onChange={(value) => update("projectGithub", value)} maxLength={2048} />
    </Group>
    <Group title="Detail page" hint="Build a short case study with optional sections. Their order here is their order on the page. No sections are required.">
      {project.id && <Link className="inline-block text-sm font-semibold underline underline-offset-4" href={`/projects/view/${project.id}`} target="_blank" rel="noreferrer">View saved page ↗</Link>}
      <p className="text-xs text-slate-500">Save changes to publish. Viewing the page shows the last saved version.</p>
      {!sections.length && <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">Your project already has a page using its cover and summary. Add sections to tell more of its story.</p>}
      <div className="space-y-4">{sections.map((section, index) => <details key={section.id} open className="rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer p-4 font-semibold bg-slate-50 rounded-t-xl">{String(index + 1).padStart(2, "0")} · {section.title || sectionTypes[section.type]}<span className="ml-2 text-xs font-normal text-slate-500">{sectionTypes[section.type]}</span></summary>
        <div className="p-4 space-y-5"><Reorder index={index} count={sections.length} label={`section ${section.title || index + 1}`} move={(to) => update("sections", moved(sections, index, to))} remove={() => { if (window.confirm("Remove this section? Save changes to apply.")) update("sections", sections.filter((_, i) => i !== index)); }} />
          <SectionEditor section={section} onChange={(value) => update("sections", sections.map((item) => item.id === section.id ? value : item))} upload={upload} disabled={disabled} />
        </div>
      </details>)}</div>
      <div className="rounded-xl bg-slate-100 p-4 flex flex-wrap gap-3 items-end">
        <label className="flex-1 min-w-40 text-sm font-semibold">New section type<select className={inputClass} value={nextType} onChange={(event) => setNextType(event.target.value)}>{Object.entries(sectionTypes).map(([type, label]) => <option key={type} value={type}>{label}</option>)}</select></label>
        <button type="button" className="rounded-lg bg-black text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-40" disabled={sections.length >= 30} onClick={() => update("sections", [...sections, newProjectSection(nextType, crypto.randomUUID())])}>Add section</button>
      </div>
    </Group>
    <details className="rounded-xl border border-slate-200 p-4"><summary className="font-semibold cursor-pointer">Advanced settings & résumé wording</summary><div className="mt-5 space-y-5">
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="h-5 w-5 shrink-0" checked={project.showInProjects} onChange={(event) => update("showInProjects", event.target.checked)} /><span>Show in the project listing and home page. Turning this off keeps the detail URL accessible and does not remove it from the résumé.</span></label>
      <Field label="Display order" hint="Lower numbers first where manual ordering is used. The project listing retains its existing date sorting." type="number" min={0} max={100000} required value={project.position} onChange={(value) => update("position", Number(value))} />
      {project.independent && <div className="space-y-5 border-t border-slate-200 pt-5"><h4 className="font-semibold">Résumé presentation (optional)</h4><p className="text-sm text-slate-500">Leave text fields blank to reuse the project information. Migrated entries keep their original résumé wording here.</p>
        <Field label="Résumé title" value={independent.title} onChange={(value) => updateIndependent("title", value)} maxLength={300} />
        <Field label="Organization / event" value={independent.organization} onChange={(value) => updateIndependent("organization", value)} maxLength={300} />
        <Field label="Résumé date" value={independent.date} onChange={(value) => updateIndependent("date", value)} maxLength={300} />
        <Field label="Résumé description" value={independent.description} onChange={(value) => updateIndependent("description", value)} multiline maxLength={10000} />
        <Field label="Résumé project URL" value={independent.url} onChange={(value) => updateIndependent("url", value)} type="url" maxLength={2048} />
        <Field label="Résumé display order" value={independent.position} onChange={(value) => updateIndependent("position", Number(value))} type="number" min={0} max={100000} required />
        <label className="flex gap-3 items-center text-sm font-semibold"><input type="checkbox" checked={independent.current} onChange={(event) => updateIndependent("current", event.target.checked)} className="h-5 w-5" />Currently working on this project</label>
      </div>}
    </div></details>
  </div>;
}
