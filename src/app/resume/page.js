import Education from "./partials/education";
import Experiences from "./partials/experiences";
import Hero from "./partials/hero";

import Skills from "./partials/skills";
import Contact from "./partials/contact";

export default function Resume() {
  return (
    <>
      <Hero></Hero>
      <Experiences></Experiences>
      <Skills></Skills>
      <Education></Education>
      <Contact></Contact>
    </>
  );
}
