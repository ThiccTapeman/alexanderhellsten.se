import Hero from "./home/partials/hero";
import AboutMe from "./home/partials/aboutme";
import Discover from "./home/partials/discover";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Loader from "@/components/Loader";

export default function Home() {
  return (
    <>
      <Hero></Hero>
      <AboutMe></AboutMe>
      <Discover></Discover>
    </>
  );
}
