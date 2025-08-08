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
    <form name="contact" netlify>
      <p>
        <label>
          <input type="text" name="name" placeholder="Your full name" />
        </label>
      </p>
      <p>
        <label>
          <input
            type="email"
            name="email"
            placeholder="your.email@example.com"
          />
        </label>
      </p>
      <p>
        <label>
          <input type="text" name="subject" placeholder="What's this about?" />
        </label>
      </p>
      <p>
        <label>
          <input
            type="text"
            name="text"
            placeholder="Tell me about your project, timeline, budget, or any questions you have..."
          />
        </label>
      </p>
      <p>
        <button type="submit">Send</button>
      </p>
    </form>
  );
}
