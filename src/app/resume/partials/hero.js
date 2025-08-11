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
import technologies from "../../../technologies.json";

export default function Hero() {
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
        <TagSlider
          content={technologies["technologies"]}
          as={TechnologyTag}></TagSlider>
      </div>
    </section>
  );
}
