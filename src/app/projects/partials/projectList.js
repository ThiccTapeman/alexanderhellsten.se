"use client";

import { useMemo, useState } from "react";
import techData from "../../../technologies.json";
import projects from "../../../projects.json";
import ActionButton from "@/components/ActionButton";
import { Calendar, SquareArrowOutUpRight, Github } from "lucide-react";

export default function ProjectList() {
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedTech, setSelectedTech] = useState(new Set());

  const portfolioItems = projects["projects"];

  const techMap = useMemo(() => {
    const map = {};
    techData.technologies.forEach((t) => {
      map[t.title] = { color: t.color, text: t.text, main: t.main };
    });
    return map;
  }, []);

  const allTech = useMemo(() => {
    const set = new Set();
    for (const item of portfolioItems) {
      for (const t of item.projectTechnologies || []) {
        const cleaned = String(t || "").trim();
        if (cleaned) set.add(cleaned);
      }
    }
    return Array.from(set).sort((a, b) => {
      const aMain = techMap[a]?.main ? -1 : 1;
      const bMain = techMap[b]?.main ? -1 : 1;
      if (aMain !== bMain) return aMain - bMain;
      return a.localeCompare(b);
    });
  }, [techMap]);

  const toggleTech = (tech) => {
    setSelectedTech((prev) => {
      const next = new Set(prev);
      if (next.has(tech)) next.delete(tech);
      else next.add(tech);
      return next;
    });
  };

  const clearFilters = () => setSelectedTech(new Set());

  const filteredAndSorted = useMemo(() => {
    const hasFilter = selectedTech.size > 0;
    const filtered = portfolioItems.filter((p) => {
      if (!hasFilter) return true;
      const techs = new Set(
        (p.projectTechnologies || []).map((x) => String(x).trim())
      );
      for (const t of selectedTech) {
        if (techs.has(t)) return true;
      }
      return false;
    });
    const toTime = (d) => {
      if (!d) return NaN;
      const t = new Date(d).getTime();
      return Number.isFinite(t) ? t : NaN;
    };
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") {
        const cmp = String(a.projectName || "")
          .toLowerCase()
          .localeCompare(String(b.projectName || "").toLowerCase());
        return sortDir === "asc" ? cmp : -cmp;
      }
      const cmp = toTime(a.projectDate) - toTime(b.projectDate);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [selectedTech, sortBy, sortDir]);

  return (
    <section className="w-full bg-white p-4">
      <div className="container mx-auto mt-10 mb-10">
        {/* Controls */}
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between text-black">
          <div className="flex flex-wrap items-center gap-10">
            <span className="text-sm font-medium">Filter by tech</span>
            {allTech.length === 0 ? (
              <span className="text-sm text-gray-500">
                No technologies found
              </span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTech.map((t) => {
                  const active = selectedTech.has(t);
                  const colorData = techMap[t] || {
                    color: "bg-gray-200",
                    text: "text-black",
                  };
                  return (
                    <button
                      key={t}
                      onClick={() => toggleTech(t)}
                      className={`rounded-full px-3 py-1 text-sm ${
                        colorData.color
                      } ${colorData.text} ${active ? "ring-2 ring-black" : ""}`}
                      aria-pressed={active}>
                      {t}
                    </button>
                  );
                })}

                <button
                  onClick={clearFilters}
                  className="rounded-full border border-gray-300 px-3 py-1 text-sm">
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="mt-15 grid gap-4 grid-cols-1 lg:grid-cols-2">
          {filteredAndSorted.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-gray-500">
              No projects match your filters
            </div>
          ) : (
            filteredAndSorted.map((p, idx) => (
              <article
                key={`${p.projectName}-${idx}`}
                className="group relative rounded-2xl border overflow-hidden transition hover:shadow-md">
                <img
                  className="w-full h-60 object-center object-cover"
                  src={p.projectImage}></img>
                <div className="flex justify-between w-full top-0 absolute p-4">
                  <div className="w-12 aspect-square flex font-bold justify-center items-center text-black bg-yellow-300  rounded-full">
                    {idx + 1}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                    <ActionButton
                      href={p.projectHomepage}
                      secondaryInverted
                      p="px-3 py-3"
                      additionalClasses="h-max rounded-xl">
                      <SquareArrowOutUpRight size={15}></SquareArrowOutUpRight>
                    </ActionButton>
                    <ActionButton
                      href={p.projectGithub}
                      transparent
                      p="px-3 py-3"
                      additionalClasses="h-max rounded-xl">
                      <Github size={15}></Github>
                    </ActionButton>
                  </div>
                </div>
                <div className="p-4">
                  <header className="mb-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg text-black font-semibold">
                        {p.projectName || "Untitled project"}
                      </h3>
                      <div className="flex text-gray-500 gap-2">
                        <Calendar size={15}></Calendar>
                        <p className="text-xs text-gray-500">{p.projectDate}</p>
                      </div>
                    </div>
                  </header>
                  <p className="mb-3 text-sm text-gray-700">
                    {p.projectDescription || "No description provided."}
                  </p>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {(p.projectTechnologies || [])
                      .filter(Boolean)
                      .map((t, i) => {
                        const colorData = techMap[t] || {
                          color: "bg-gray-200",
                          text: "text-black",
                        };
                        return (
                          <span
                            key={`${t}-${i}`}
                            className={`rounded-full px-2 py-1 text-xs ${colorData.color} ${colorData.text}`}>
                            {t}
                          </span>
                        );
                      })}
                  </div>
                  <div className="flex gap-3 w-full">
                    {p.projectHomepage && (
                      <ActionButton
                        href={p.projectHomepage}
                        target="_blank"
                        rel="noreferrer"
                        w="w-full"
                        additionalClasses="justify-center">
                        <SquareArrowOutUpRight
                          size={15}></SquareArrowOutUpRight>
                        Live
                      </ActionButton>
                    )}
                    {p.projectGithub && (
                      <ActionButton
                        href={p.projectGithub}
                        target="_blank"
                        rel="noreferrer"
                        secondary
                        additionalClasses="py-0 px-1">
                        <Github size={15}></Github>
                        Code
                      </ActionButton>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function safeFormatDate(d) {
  if (!d) return "No date";
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return "Invalid date";
  return t.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
