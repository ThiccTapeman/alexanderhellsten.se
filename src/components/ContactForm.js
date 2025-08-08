// src/components/ContactForm.js
"use client";
import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function ContactForm({ debug, initialRemainingMs = 0 }) {
  const [form, setForm] = useState({
    name: debug ? "Dwayne Johnsson" : "",
    email: debug ? "thicctapeman@gmail.com" : "",
    subject: debug ? "Dwayne Johnsson" : "",
    message: debug ? "Dwayne Johnsson * Dwayne Johnsson" : "",
    website: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [remainingMs, setRemainingMs] = useState(initialRemainingMs);
  const abortRef = useRef(null);

  useEffect(() => {
    // live countdown from cookie + initialRemainingMs
    const readCookieMs = () => {
      const row = document.cookie
        .split("; ")
        .find((r) => r.startsWith("contact_sent="));
      if (!row) return 0;
      const sentAt = Number(row.split("=")[1]);
      const ttl = 5 * 60 * 1000;
      return Math.max(0, ttl - (Date.now() - sentAt));
    };

    const tick = () => {
      const fromCookie = readCookieMs();
      setRemainingMs((prev) => {
        const next = Math.max(fromCookie, prev - 1000);
        return next < 0 ? 0 : next;
      });
    };

    // sync immediately, then every second
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const valid =
    form.name.trim().length >= 2 &&
    isEmail(form.email) &&
    form.subject.trim().length >= 2 &&
    form.message.trim().length >= 10;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!valid) {
      setError("Please fill all fields correctly.");
      return;
    }
    setStatus("loading");

    const controller = new AbortController();
    abortRef.current = controller;
    const t = setTimeout(() => controller.abort(), 16000);

    try {
      const res = await fetch("/api/contactme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "", website: "" });
        // API should set contact_sent=Date.now
        // fallback in case proxy strips Set-Cookie
        if (!document.cookie.includes("contact_sent=")) {
          document.cookie = `contact_sent=${Date.now()}; path=/; max-age=${
            60 * 5
          }`;
        }
      } else {
        setStatus("error");
        setError(data.error || `Request failed with ${res.status}`);
      }
    } catch (err) {
      setStatus("error");
      setError(
        err.name === "AbortError" ? "Request timed out." : "Network error."
      );
    } finally {
      clearTimeout(t);
      abortRef.current = null;
    }
  };

  const className =
    "w-full border p-2 px-5 mt-10 rounded-lg border-zinc-800 resize-none";
  const secs = Math.floor((remainingMs / 1000) % 60);
  const mins = Math.floor(remainingMs / 1000 / 60);

  const blocked = remainingMs > 0;

  return (
    <form onSubmit={onSubmit} name="contactme" noValidate>
      <input type="hidden" name="form-name" value="contactme" />
      <input
        type="text"
        name="website"
        autoComplete="off"
        tabIndex={-1}
        style={{ position: "absolute", left: "-9999px" }}
        value={form.website}
        onChange={onChange}
      />

      {blocked && (
        <p className="mt-4 text-sm">
          You recently sent a message. Try again in {mins}:
          {String(secs).padStart(2, "0")}
        </p>
      )}

      <div className="flex gap-3 flex-col md:flex-row opacity-100">
        <input
          name="name"
          placeholder="Your full name"
          value={form.name}
          onChange={onChange}
          required
          className={className}
          disabled={blocked}
        />
        <input
          type="email"
          name="email"
          placeholder="your.email@example.com"
          value={form.email}
          onChange={onChange}
          required
          className={className}
          disabled={blocked}
        />
      </div>

      <input
        name="subject"
        placeholder="What is this about?"
        value={form.subject}
        onChange={onChange}
        required
        className={className}
        disabled={blocked}
      />
      <textarea
        name="message"
        placeholder="Tell me about your project, timeline, budget, or any questions you have..."
        value={form.message}
        onChange={onChange}
        required
        rows={6}
        className={className}
        disabled={blocked}
      />

      <button
        type="submit"
        disabled={blocked || status === "loading" || !valid}
        className={
          "w-full bg-white text-black border transition duration-200 p-2 px-5 font-bold items-center justify-center gap-2 rounded-lg mt-10 flex disabled:bg-gray-500 " +
          (blocked ? "" : "hover:bg-black hover:text-white")
        }>
        {blocked
          ? `Wait ${mins}:${String(secs).padStart(2, "0")}`
          : status === "loading"
          ? "Sending..."
          : "Send"}
        <Send size={20} />
      </button>

      {status === "sent" && <p>Sent</p>}
      {status === "error" && <p>{error || "Failed to send"}</p>}
    </form>
  );
}
