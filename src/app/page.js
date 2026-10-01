/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

// "/"

import Hero from "./home/partials/hero";
import AboutMe from "./home/partials/aboutme";
import Discover from "./home/partials/discover";

export const metadata = {
  title: "Alexander Hellstén | Full Stack Developer",
  description:
    "Meet Alexander Hellstén, a self-taught full stack developer working with React, Next.js, .NET, and Unity. Explore his projects, experience, and résumé.",
  alternates: {
    canonical: "https://alexanderhellsten.se/",
  },
};

export default function Home() {
  return (
    <>
      <Hero></Hero>
      <AboutMe></AboutMe>
      <Discover></Discover>
    </>
  );
}
