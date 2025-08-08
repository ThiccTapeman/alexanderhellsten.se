"use client";
import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {};

  return (
    <form onSubmit={onSubmit} style={{ maxWidth: 480 }} netlify>
      <label>
        Name
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={onChange}
          required
        />
      </label>

      <label>
        Email
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />
      </label>

      <label>
        Message
        <textarea
          name="message"
          rows="6"
          value={form.message}
          onChange={onChange}
          required
        />
      </label>

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Sending..." : "Send"}
      </button>

      {status === "sent" && <p>Sent</p>}
      {status === "error" && <p>Failed to send</p>}
    </form>
  );
}
