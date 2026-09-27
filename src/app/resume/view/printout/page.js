/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

// "/resume/view"

import Education from "../../partials/education";
import Experiences from "../../partials/experiences";
import Hero from "../../partials/hero";

import Skills from "../../partials/skills";
import Contact from "../../partials/readytowork";
import Projects from "../../partials/projects";
import Nonprofit from "../../partials/nonprofit";

export default function Resume() {
  return (
    <>
      <div className="print-scale">
        <Hero listView={true} showDownload={false} showContactInfo={true}></Hero>
        <Projects showLinks={false} showDescription={true}></Projects>
        <Experiences inverted={true}></Experiences>
        <Education inverted={false} showDesctription={false}></Education>
      </div>
    </>
  );
}
