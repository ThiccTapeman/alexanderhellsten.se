/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

// "/contact"

import ContactCards from "./partials/contactCards";
import Hero from "./partials/hero";
import Contact from "./partials/contact";

export const metadata = {
  title: "Contact | Alexander Hellstén",
  description:
    "Contact Alexander Hellstén to discuss software development projects, job opportunities, and collaborations. Get in touch using his contact form or social profiles.",
  alternates: {
    canonical: "https://alexanderhellsten.se/contact",
  },
};

export default function ContactPage() {
  return (
    <>
      <Hero></Hero>
      <ContactCards></ContactCards>
      <Contact></Contact>
    </>
  );
}
