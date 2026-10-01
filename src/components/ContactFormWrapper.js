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
async function remainingCooldown() {
  const sentAt = Number((await cookies()).get("contact_sent")?.value || 0);
  const ttlMs = 5 * 60 * 1000;
  return Math.max(0, ttlMs - (Date.now() - sentAt));
}

export default async function ContactFormWrapper({ debug }) {
  const initialRemainingMs = await remainingCooldown();

  return <ContactForm debug={debug} initialRemainingMs={initialRemainingMs} />;
}
