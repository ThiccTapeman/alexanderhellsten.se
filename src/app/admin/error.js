"use client";

export default function AdminError({ reset }) {
  return <main className="min-h-screen bg-slate-950 text-white p-10">
    <h1 className="text-2xl font-bold">Admin temporarily unavailable</h1>
    <p className="my-4">The database could not be reached. Please try again shortly.</p>
    <button onClick={reset} className="rounded bg-yellow-300 text-black px-4 py-2">Try again</button>
  </main>;
}
