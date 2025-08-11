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

export default function ContactPage() {
  return (
    <>
      <Hero></Hero>
      <ContactCards></ContactCards>
      <Contact></Contact>
    </>
  );
}
