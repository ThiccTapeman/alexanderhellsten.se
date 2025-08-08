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
      <input type="hidden" name="form-name" value="contact" />

      <input type="text" name="name" placeholder="Your full name" />
      <input type="email" name="email" placeholder="your.email@example.com" />
      <input type="text" name="subject" placeholder="What is this about?" />
      <textarea
        name="message"
        placeholder="Tell me about your project, timeline, budget, or any questions you have..."
      />
      <button type="submit">Send</button>
    </form>
  );
}
