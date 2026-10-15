import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { migrate } from "../scripts/migrations.mjs";
import { contentStore } from "../src/lib/content-store.mjs";
import { collections } from "../src/lib/content-schema.mjs";
import { independentProjects, projectSectionsSchema } from "../src/lib/project-details.mjs";

const picture = { src: "/projectImages/lego-game.png", alt: "Puzzle level overview", caption: "The finished level" };
const sections = [
  { id: "idea", type: "text", title: "The idea", body: "A short story", layout: "split" },
  { id: "design", type: "image", title: "Development", body: "A visual walkthrough", image: picture, layout: "left" },
  { id: "gallery", type: "gallery", title: "Screenshots", body: "", images: [picture, { ...picture, caption: "Another view" }] },
  { id: "demo", type: "video", title: "Demo", body: "", src: "https://example.com/demo.mp4", poster: picture.src, captions: "https://example.com/demo.vtt", transcript: "The player moves the ball into the goal." },
  { id: "features", type: "features", title: "Key features", body: "", items: [{ title: "Physics", body: "Rolling movement", image: picture }, { title: "Level design", body: "Modular levels", image: null }] },
];

test("detail content round-trips through PostgreSQL JSON, reorders, removes, and retains conflict protection", async () => {
  const db = new PGlite();
  try {
    await migrate(db);
    const store = contentStore(db);
    const { id, version, ...project } = await store.project(1);
    assert.deepEqual(project.sections, []);
    const legacy = { ...project };
    for (const field of ["sections", "independent", "independentDetails", "showInProjects"]) delete legacy[field];
    const parsed = collections.projects.schema.parse(legacy);
    assert.deepEqual(parsed.sections, []);
    assert.equal(parsed.showInProjects, true);
    assert.equal(parsed.independent, false);
    assert.equal(await store.save("projects", { ...project, sections, independent: true }, id, version), true);
    const saved = await store.project(id);
    assert.deepEqual(saved.sections, sections);
    assert.equal(independentProjects([saved])[0].title, project.projectName);
    const reordered = [sections[4], sections[0]];
    assert.equal(await store.save("projects", { ...project, sections: reordered }, id, saved.version), true);
    assert.deepEqual((await store.project(id)).sections, reordered);
    assert.equal(await store.save("projects", project, id, version), false);
    assert.equal(await store.project(2147483648), null);
    assert.equal(await store.project(-1), null);
    assert.equal(await store.project(9999), null);
  } finally { await db.close(); }
});

test("sections reject unsafe media, duplicate anchors, invalid types and missing accessible descriptions", () => {
  assert.equal(projectSectionsSchema.parse(sections).length, 5);
  const invalid = [
    [{ ...sections[1], image: { ...picture, src: "javascript:alert(1)" } }],
    [{ ...sections[1], image: { ...picture, alt: "" } }],
    [{ ...sections[3], src: "data:text/html,test" }],
    [{ ...sections[3], captions: "javascript:alert(1)" }],
    [{ ...sections[3], transcript: "" }],
    [{ ...sections[2], images: [] }],
    [{ ...sections[4], items: [] }],
    [{ ...sections[0], type: "script" }],
    [sections[0], sections[0]],
    Array.from({ length: 31 }, (_, i) => ({ ...sections[0], id: `section-${i}` })),
  ];
  for (const input of invalid) assert.equal(projectSectionsSchema.safeParse(input).success, false);
});

test("migration merges matching independent work without changing cards and preserves unmatched entries", async () => {
  const db = new PGlite();
  try {
    await db.exec(await readFile(new URL("../db/migrations/001-schema.sql", import.meta.url), "utf8"));
    await db.exec(await readFile(new URL("../db/migrations/002-original-content.sql", import.meta.url), "utf8"));
    await db.query(`INSERT INTO nonprofit (title, company, date, description, current, "projectLink", position) VALUES ('Volunteer app', 'Local event', '2024', 'Original volunteer description', true, '', 8)`);
    const originalCards = (await db.query('SELECT id, "projectName", "projectDescription", "projectHomepage", position FROM projects ORDER BY id')).rows;
    const originalIndependent = (await db.query('SELECT * FROM nonprofit ORDER BY position, id')).rows;
    await migrate(db);
    const projects = await contentStore(db).list("projects");
    const resume = independentProjects(projects);
    assert.equal(projects.length, 7);
    assert.equal(projects.filter((item) => item.showInProjects).length, 6);
    assert.equal(resume.length, 3);
    for (const [index, original] of originalIndependent.entries()) {
      const { id, ...actual } = resume[index];
      assert.ok(id > 0);
      assert.deepEqual(actual, { title: original.title, company: original.company, date: original.date, description: original.description, current: original.current, projectLink: original.projectLink, position: original.position });
    }
    assert.deepEqual((await db.query('SELECT id, "projectName", "projectDescription", "projectHomepage", position FROM projects WHERE "showInProjects" ORDER BY id')).rows, originalCards);
    assert.equal((await db.query("SELECT * FROM nonprofit")).rows.length, 3);
    await db.query('UPDATE projects SET independent = false WHERE "projectName" = $1', ["Mea Culpa"]);
    await migrate(db);
    assert.equal((await contentStore(db).list("projects")).length, 7);
    assert.equal(independentProjects(await contentStore(db).list("projects")).length, 2);
    assert.equal(Object.hasOwn(collections, "nonprofit"), false);
  } finally { await db.close(); }
});
