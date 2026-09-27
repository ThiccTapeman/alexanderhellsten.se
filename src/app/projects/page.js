/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

// "/projects"

import Hero from "./partials/hero";
import ProjectList from "./partials/projectList";

export default function Projects() {
  return (
    <>
      <Hero></Hero>
      <section className="w-full bg-white text-black">
        <div className="container mx-auto pt-15 pb-15">
          <ProjectList></ProjectList>
        </div>
      </section>
    </>
  );
}
