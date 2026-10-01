/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

// "/resume"

import Education from "./partials/education";
import Experiences from "./partials/experiences";
import Hero from "./partials/hero";

import Skills from "./partials/skills";
import Contact from "./partials/readytowork";
import Nonprofit from "./partials/nonprofit";
import ProjectList from "../projects/partials/projectList";

export const metadata = {
  title: "Résumé | Alexander Hellstén",
  description:
    "Explore Alexander Hellstén’s résumé, including his full stack development experience, education, and nonprofit work. Download his résumé or get in touch.",
  alternates: {
    canonical: "https://alexanderhellsten.se/resume",
  },
};

export default function Resume() {
  return (
    <>
      <Hero></Hero>
      <Experiences></Experiences>
      <Nonprofit inverted></Nonprofit>
      <Education></Education>
      <Contact></Contact>
    </>
  );
}
