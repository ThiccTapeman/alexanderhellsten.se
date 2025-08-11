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

export default function Home() {
  return (
    <>
      <Hero></Hero>
      <AboutMe></AboutMe>
      <Discover></Discover>
    </>
  );
}
