import Image from "next/image";

function Picture({ picture }) {
  return <figure className="min-w-0">
    <a href={picture.src} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-2xl border border-[var(--section-border)] bg-[var(--section-surface)] focus-visible:outline-2 focus-visible:outline-offset-4" aria-label={`Open full image: ${picture.alt}`}>
      <Image src={picture.src} alt={picture.alt} width={1400} height={900} unoptimized loading="lazy" className="w-full max-h-[75vh] object-contain" />
    </a>
    {picture.caption && <figcaption className="mt-3 text-sm text-[var(--section-muted)]">{picture.caption}</figcaption>}
  </figure>;
}

function Intro({ section, index }) {
  return <div className="min-w-0">
    <p className="text-sm font-semibold text-[var(--section-muted)] mb-4">{String(index + 1).padStart(2, "0")}</p>
    <h2 className="text-3xl md:text-4xl font-bold tracking-tight break-words">{section.title}</h2>
    {section.body && <p className="mt-5 text-base md:text-lg leading-relaxed text-[var(--section-muted)] whitespace-pre-line break-words max-w-3xl">{section.body}</p>}
  </div>;
}

export default function ProjectSections({ sections }) {
  return <div>
    {sections.map((section, index) => <section key={section.id} id={`section-${section.id}`} className={`scroll-mt-28 py-14 md:py-24 ${index % 2 === 1 ? "bg-black text-white" : "bg-white text-black"}`} style={{
      "--section-muted": index % 2 === 1 ? "#d1d5db" : "#4b5563",
      "--section-border": index % 2 === 1 ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
      "--section-surface": index % 2 === 1 ? "#18181b" : "#f9fafb",
    }}>
      <div className="container mx-auto px-4 md:px-8">
      {section.type === "text" && (section.layout === "split" ? <div className="grid gap-6 md:grid-cols-2"><Intro section={{ ...section, body: "" }} index={index} /><p className="md:pt-9 text-lg leading-relaxed text-[var(--section-muted)] whitespace-pre-line break-words">{section.body}</p></div> : <div className="max-w-3xl"><Intro section={section} index={index} /></div>)}
      {section.type === "image" && <div className={section.layout === "wide" ? "space-y-8" : "grid gap-8 md:grid-cols-2 items-center"}>
        <div className={section.layout === "left" ? "md:order-2" : ""}><Intro section={section} index={index} /></div><Picture picture={section.image} />
      </div>}
      {section.type === "gallery" && <><Intro section={section} index={index} /><div className="grid gap-6 md:grid-cols-2 mt-8">{section.images.map((picture, imageIndex) => <Picture key={imageIndex} picture={picture} />)}</div></>}
      {section.type === "features" && <><Intro section={section} index={index} /><div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-8">{section.items.map((item, itemIndex) => <article key={itemIndex} className="rounded-2xl border border-[var(--section-border)] p-6 bg-[var(--section-surface)]">
        {item.image && <div className="mb-6"><Picture picture={item.image} /></div>}
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-yellow-300 text-black text-sm font-bold">{itemIndex + 1}</span><h3 className="text-xl font-semibold mt-4 break-words">{item.title}</h3><p className="mt-3 text-[var(--section-muted)] whitespace-pre-line break-words leading-relaxed">{item.body}</p>
      </article>)}</div></>}
      {section.type === "video" && <><Intro section={section} index={index} /><video controls crossOrigin={section.captions ? "anonymous" : undefined} preload="none" playsInline poster={section.poster || undefined} aria-label={section.title} aria-describedby={`transcript-${section.id}`} className="mt-8 w-full max-h-[75vh] rounded-2xl bg-black"><source src={section.src} />{section.captions && <track kind="captions" src={section.captions} srcLang="en" label="English" default />}<p>Your browser cannot play this video. <a href={section.src}>Download the video</a>.</p></video><details className="mt-4 rounded-xl border border-[var(--section-border)] p-4" id={`transcript-${section.id}`}><summary className="cursor-pointer font-medium">Video transcript / description</summary><p className="mt-4 text-[var(--section-muted)] whitespace-pre-line">{section.transcript}</p></details></>}
      </div>
    </section>)}
  </div>;
}
