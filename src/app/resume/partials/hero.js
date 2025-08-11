/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

"use client";

import ActionButton from "@/components/ActionButton";
import TagSlider from "@/components/TagSlider";
import TechnologyTag from "@/components/TechnologyTag";
import { Download, Mail } from "lucide-react";

export default function Hero() {
  const Technologies = [
    {
      title: "JavaScript",
      main: true,
      color: "bg-yellow-400",
      text: "text-black",
    },
    { title: "HTML5", main: true, color: "bg-amber-600", text: "text-white" },
    { title: "CSS3", main: true, color: "bg-blue-500", text: "text-white" },
    { title: "React", main: true, color: "bg-blue-600", text: "text-white" },
    {
      title: "Next.js",
      main: false,
      color: "bg-yellow-400",
      text: "text-black",
    },
    {
      title: "Node.js",
      main: false,
      color: "bg-green-700",
      text: "text-white",
    },
    { title: "Express", main: false, color: "bg-blue-300", text: "text-black" },
    { title: "MongoDB", main: false, color: "bg-lime-500", text: "text-black" },
    { title: "MySQL", main: false, color: "bg-blue-600", text: "text-white" },
    {
      title: "Tailwind CSS",
      main: true,
      color: "bg-blue-500",
      text: "text-white",
    },
    {
      title: "Bootstrap",
      main: false,
      color: "bg-purple-500",
      text: "text-white",
    },
    { title: "Git", main: false, color: "bg-green-500", text: "text-black" },
    { title: ".NET", main: false, color: "bg-purple-700", text: "text-white" },
    { title: "C#", main: true, color: "bg-blue-500", text: "text-white" },
  ];

  return (
    <section className="bg-black h-max w-full p-4">
      <div className="container mx-auto text-white flex flex-col items-between justify-center h-full mt-40 mb-10 lg:mb-10">
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold w-max">
            Alexander Hellstén
          </h1>
          <p className="mt-1 text-lg md:text-xl text-gray-400 w-max lg:w-full">
            Full Stack Developer
          </p>
          <p className="mt-5 text-md md:text-lg lg:w-full">
            Self taught developer with 5+ years of experience creating
            innovative web applications and digital solutions. Specialized in
            modern JavaScript frameworks, cloud technologies, and user-centered
            design.
          </p>
          <div className="mt-10 flex gap-4">
            <ActionButton href="#Download">
              <Download size={20}></Download>Download Resumé
            </ActionButton>
            <ActionButton href="/contact" secondaryInverted>
              <Mail size={20}></Mail>Contact Me
            </ActionButton>
          </div>
        </div>
        <div className="flex flex-col w-full mt-10 lg:w-1/3">
          <h2 className="mb-2 text-xl">Technologies I&apos;ve worked with:</h2>
        </div>
        <TagSlider content={Technologies} as={TechnologyTag}></TagSlider>
      </div>
    </section>
  );
}
