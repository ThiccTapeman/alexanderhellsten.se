"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ImageField, { ImagePreview } from "./image-field";
import { collections, emptyRecord, backgroundColors, textColors } from "@/lib/content-schema.mjs";

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500";
const buttonClass = "rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-gray-900 disabled:opacity-50";

async function request(path, method = "GET", data) {
  const isUpload = data instanceof File;
  const response = await fetch(path, {
    method, credentials: "same-origin", cache: "no-store",
    headers: { "Content-Type": isUpload ? data.type : "application/json", "X-Admin-Request": "1" },
    ...(data === undefined ? {} : { body: isUpload ? data : JSON.stringify(data) }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || "The request failed. Please try again.");
    error.status = response.status;
    throw error;
  }
  return result;
}

export default function AdminPanel({ authenticated }) {
  const [signedIn, setSignedIn] = useState(authenticated);
  const [collection, setCollection] = useState("projects");
  const [records, setRecords] = useState([]);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(authenticated);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reload, setReload] = useState(0);
  const config = collections[collection];

  useEffect(() => {
    const clearOnHistory = (event) => { if (event.persisted) window.location.reload(); };
    window.addEventListener("pageshow", clearOnHistory);
    return () => window.removeEventListener("pageshow", clearOnHistory);
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    let active = true;
    request(`/api/admin/content/${collection}`).then((data) => {
      if (active) setRecords(data.records);
    }).catch((failure) => {
      if (active) {
        setError(failure.message);
        if (failure.status === 401) { setSignedIn(false); setEditing(null); }
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [signedIn, collection, reload]);

  async function perform(action) {
    setBusy(true); setError(""); setMessage("");
    try { await action(); }
    catch (failure) {
      setError(failure.message);
      if (failure.status === 401 && signedIn) { setSignedIn(false); setEditing(null); setRecords([]); }
    } finally { setBusy(false); }
  }

  function changeCollection(name) {
    if (name === collection) return;
    if (editing && !window.confirm("Discard unsaved edits?")) return;
    setEditing(null); setMessage(""); setError(""); setRecords([]); setLoading(true); setCollection(name);
  }

  if (!signedIn) return <main className="min-h-screen bg-black flex items-center justify-center px-4 py-16">
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-slate-900">
      <Link href="/" className="text-sm text-slate-500 hover:underline">← Back to portfolio</Link>
      <h1 className="mt-6 text-3xl font-bold">Admin sign in</h1>
      <p className="mt-2 text-slate-600">Manage your portfolio content.</p>
      <form className="mt-8 space-y-5" onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        perform(async () => {
          await request("/api/admin/login", "POST", { username: data.get("username"), password: data.get("password") });
          form.reset(); setLoading(true); setSignedIn(true);
        });
      }}>
        <label className="block font-medium">Username<input name="username" autoComplete="username" maxLength={100} required className={`${inputClass} mt-1`} /></label>
        <label className="block font-medium">Password<input name="password" type="password" autoComplete="current-password" maxLength={128} required className={`${inputClass} mt-1`} /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button disabled={busy} className={`${buttonClass} w-full`}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  </main>;

  return <main className="min-h-screen bg-slate-100 text-black">
    <header className="bg-black text-white px-6 py-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs uppercase tracking-widest text-yellow-300">Alexander Hellstén</p><h1 className="text-2xl font-bold mt-1">Portfolio admin</h1></div>
        <div className="flex items-center gap-5"><a href="/" target="_blank" rel="noreferrer" className="text-sm hover:underline">View site ↗</a>
          <button className="rounded-lg border border-slate-600 px-4 py-2 disabled:opacity-50" disabled={busy} onClick={() => {
            if (editing && !window.confirm("Discard unsaved edits and sign out?")) return;
            perform(async () => { await request("/api/admin/logout", "POST", {}); setSignedIn(false); setRecords([]); setEditing(null); window.location.replace("/admin"); });
          }}>Sign out</button>
        </div>
      </div>
    </header>
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <nav aria-label="Content sections" className="flex flex-wrap gap-2 mb-8">
        {Object.entries(collections).map(([key, item]) => <button key={key} disabled={busy} aria-pressed={collection === key} onClick={() => changeCollection(key)} className={`rounded-full px-4 py-2 text-sm font-medium ${collection === key ? "bg-black text-white" : "bg-white text-slate-700 border border-slate-200"}`}>{item.label}</button>)}
      </nav>
      {error && <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
      {message && <p role="status" className="mb-5 rounded-lg bg-green-100 p-4 text-green-900">{message}</p>}
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          <div className="flex justify-between items-center gap-3 mb-2"><h2 className="text-xl font-bold">{config.label}</h2>
            <button className={buttonClass} disabled={busy || loading} onClick={() => {
              if (editing && !window.confirm("Discard unsaved edits?")) return;
              setEditing(emptyRecord(collection, records.length ? Math.max(...records.map((item) => item.position)) + 1 : 0)); setMessage("");
            }}>Add entry</button>
          </div>
          <p className="text-sm text-slate-500 mb-5">{records.length} entries · Changes appear on the public site after saving.</p>
          <button className="text-sm underline mb-4 disabled:opacity-50" disabled={busy || loading} onClick={() => {
            if (editing && !window.confirm("Discard unsaved edits and reload?")) return;
            setEditing(null); setRecords([]); setError(""); setLoading(true); setReload((value) => value + 1);
          }}>Reload list</button>
          {loading ? <p role="status">Loading…</p> : records.length === 0 ? <p className="py-6 text-slate-500">No entries yet.</p> : <ul className="divide-y divide-slate-100">
            {records.map((record) => <li key={record.id} className="flex items-center justify-between gap-4 py-4">
              {collection === "projects" && <ImagePreview key={record.projectImage} src={record.projectImage} alt={`${record.projectName} thumbnail`} thumbnail />}
              <div className="min-w-0"><p className="font-semibold break-words">{record[config.titleField]}</p><p className="text-xs text-slate-500 mt-1">Order: {record.position}{record.projectDate || record.date ? ` · ${record.projectDate || record.date}` : ""}</p></div>
              <button className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" disabled={busy} onClick={() => {
                if (editing && !window.confirm("Discard unsaved edits?")) return;
                setEditing(structuredClone(record)); setMessage(""); setError("");
              }}>Edit</button>
            </li>)}
          </ul>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
          {!editing ? <div className="py-16 text-center text-slate-500"><h2 className="text-xl font-semibold text-slate-900 mb-2">Make it yours</h2><p>Select an entry to edit, or add something new.</p></div> : <form onSubmit={(event) => {
            event.preventDefault();
            perform(async () => {
              const { id, version, ...record } = editing;
              if (record.projectTechnologies) record.projectTechnologies = record.projectTechnologies.map((value) => value.trim()).filter(Boolean);
              const result = await request(`/api/admin/content/${collection}`, id ? "PUT" : "POST", { ...(id ? { id, version } : {}), record });
              setRecords(result.records); setEditing(null); setMessage("Saved. Your public pages will show the updated content.");
            });
          }}>
            <h2 className="text-xl font-bold mb-6">{editing.id ? "Edit entry" : "New entry"}</h2>
            <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
              {config.fields.map(([field, label, type]) => field === "projectImage" ? <ImageField key={field} value={editing[field]} disabled={busy}
                onChange={(value) => setEditing((current) => ({ ...current, [field]: value }))}
                onUpload={(file) => perform(async () => {
                  const uploaded = await request("/api/admin/images", "POST", file);
                  setEditing((current) => ({ ...current, [field]: uploaded.url }));
                  setMessage("Image uploaded. Save changes to use it on the public project.");
                })} /> : <label key={field} className={`block text-sm font-medium ${type === "checkbox" ? "flex items-center gap-3" : ""}`}>
                {type === "checkbox" ? <><input type="checkbox" checked={editing[field]} onChange={(event) => setEditing({ ...editing, [field]: event.target.checked })} className="h-5 w-5" />{label}</> : <>{label}
                  {type === "textarea" || type === "list" ? <textarea rows={type === "list" ? 4 : 5} className={`${inputClass} mt-1`} value={type === "list" ? editing[field].join("\n") : editing[field]} onChange={(event) => setEditing({ ...editing, [field]: type === "list" ? event.target.value.split("\n") : event.target.value })} />
                    : type === "color" || type === "textColor" ? <select className={`${inputClass} mt-1`} value={editing[field]} onChange={(event) => setEditing({ ...editing, [field]: event.target.value })}>{(type === "color" ? backgroundColors : textColors).map((color) => <option key={color} value={color}>{color.replace(/^(bg|text)-/, "").replaceAll("-", " ")}</option>)}</select>
                      : <input type={type} className={`${inputClass} mt-1`} value={editing[field] ?? ""} min={type === "number" ? 0 : undefined} max={type === "number" ? 100 : undefined} onChange={(event) => setEditing({ ...editing, [field]: type === "number" ? event.target.value === "" ? null : Number(event.target.value) : event.target.value })} />}
                </>}
              </label>)}
              <label className="block text-sm font-medium">Display order (lower numbers first)<input type="number" min="0" max="100000" required className={`${inputClass} mt-1`} value={editing.position} onChange={(event) => setEditing({ ...editing, position: Number(event.target.value) })} /></label>
              <div className="flex flex-wrap gap-3 pt-4">
                <button className={buttonClass} type="submit">{busy ? "Saving…" : "Save changes"}</button>
                <button type="button" className="rounded-lg border border-slate-300 px-4 py-2" onClick={() => { if (window.confirm("Discard unsaved edits?")) setEditing(null); }}>Cancel</button>
                {editing.id && <button type="button" className="rounded-lg px-4 py-2 text-red-700 hover:bg-red-50 ml-auto" onClick={() => {
                  if (!window.confirm(`Delete “${editing[config.titleField]}”? This cannot be undone.`)) return;
                  perform(async () => { const result = await request(`/api/admin/content/${collection}`, "DELETE", { id: editing.id, version: editing.version }); setRecords(result.records); setEditing(null); setMessage("Entry deleted."); });
                }}>Delete</button>}
              </div>
            </fieldset>
          </form>}
        </section>
      </div>
    </div>
  </main>;
}
