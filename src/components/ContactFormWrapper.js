import { cookies } from "next/headers";
import ContactForm from "./ContactForm";

export default function ContactFormWrapper({ debug }) {
  const sentAt = Number(cookies().get("contact_sent")?.value || 0);
  const ttlMs = 5 * 60 * 1000;
  const initialRemainingMs = Math.max(0, ttlMs - (Date.now() - sentAt));

  return <ContactForm debug={debug} initialRemainingMs={initialRemainingMs} />;
}
