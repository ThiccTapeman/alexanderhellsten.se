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
