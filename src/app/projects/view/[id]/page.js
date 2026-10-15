import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import ActionButton from "@/components/ActionButton";
import { getContent, getProject } from "@/lib/content";
import ProjectSections from "./project-sections";

export async function generateMetadata({ params }) {
  const project = await getProject((await params).id);
  if (!project) return { title: "Project not found" };
  return { title: `${project.projectName} | Alexander Hellstén`, description: project.projectDescription.slice(0, 160),
    alternates: { canonical: `https://alexanderhellsten.se/projects/view/${project.id}` } };
}

export default async function ProjectPage({ params }) {
  const project = await getProject((await params).id);
  if (!project) notFound();
  const technologies = await getContent("technologies");
  const sections = project.sections || [];

  return <main className="bg-white text-black">
    <section className="bg-black text-white pt-22 pb-0 md:pt-20 md:pb-0">
      <div className="container mx-auto px-4 md:px-8 pb-16 md:pb-25">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-yellow-300 focus-visible:outline-2 focus-visible:outline-offset-4"><ArrowLeft size={16} />All projects</Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-3 text-xs mb-5"><span className="rounded-full bg-yellow-300 text-black px-3 py-1">{project.projectType}</span>{project.independent && <span className="rounded-full border border-white/30 px-3 py-1">Independent project</span>}</div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight break-words">{project.projectName}</h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-300 max-w-2xl whitespace-pre-line">{project.projectDescription}</p>
          </div>
          <div className="lg:pl-10">
            <p className="text-xs uppercase tracking-widest text-gray-400">Date</p><p className="mt-2">{project.projectDate}</p>
            {!!project.projectTechnologies.length && <><p className="text-xs uppercase tracking-widest text-gray-400 mt-6 mb-3">Built with</p><div className="flex flex-wrap gap-2">{project.projectTechnologies.map((name, index) => {
              const technology = technologies.find((item) => item.title === name);
              return <span key={`${name}-${index}`} className={`rounded-full px-3 py-1 text-xs ${technology?.color || "bg-gray-800"} ${technology?.text || "text-white"}`}>{name}</span>;
            })}</div></>}
            <div className="mt-8 flex flex-wrap gap-3">
              {project.projectHomepage && <ActionButton href={project.projectHomepage} target="_blank">Visit project<ArrowUpRight size={16} /></ActionButton>}
              {project.projectGithub && <ActionButton href={project.projectGithub} target="_blank" secondary>Source code<Github size={16} /></ActionButton>}
            </div>
          </div>
        </div>
{project.projectImage && (
  <div className="relative mt-12 h-[50vh] md:h-[75vh] w-full overflow-hidden rounded-2xl border border-white/20 bg-white/5">
    <Image
      src={project.projectImage}
      alt={`${project.projectName} project preview`}
      fill
      unoptimized
      priority
      className="object-cover"
    />
  </div>
)}      </div>
    </section>
    {!!sections.length && <nav aria-label="Project sections" className="border-b border-black/10">
      <div className="container mx-auto flex flex-wrap gap-x-6 gap-y-3 px-4 py-5 md:px-8">{sections.map((section, index) => <a key={section.id} href={`#section-${section.id}`} className="text-sm hover:underline underline-offset-4"><span className="text-gray-500 mr-2">{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}</div>
    </nav>}
    <ProjectSections sections={sections} />
    <div className="container mx-auto px-4 py-16 md:px-8 flex flex-wrap gap-4 items-center justify-between border-t border-black/10">
      <div><h2 className="text-2xl font-bold">Explore more work</h2><p className="text-gray-600 mt-2">More projects, ideas, and experiments.</p></div>
      <ActionButton href="/projects">All projects<ArrowUpRight size={16} /></ActionButton>
    </div>
  </main>;
}
