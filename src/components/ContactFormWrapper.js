/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { cookies } from "next/headers";
import ContactForm from "./ContactForm";

// Wrapper for the contact form, needed because cookies is a server-side API
export default function ContactFormWrapper({ debug }) {
  const sentAt = Number(cookies().get("contact_sent")?.value || 0);
  const ttlMs = 5 * 60 * 1000;
  const initialRemainingMs = Math.max(0, ttlMs - (Date.now() - sentAt));

  return <ContactForm debug={debug} initialRemainingMs={initialRemainingMs} />;
}
