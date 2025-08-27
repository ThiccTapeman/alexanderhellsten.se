/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import technologies from "../../../technologies.json";
import ActionButton from "@/components/ActionButton";
import { InfoCard } from "@/components/InfoCard";
import LoaderLink from "@/components/DelayedLink";
import { ArrowRight, Download, Mouse } from "lucide-react";
import DelayedLink from "@/components/DelayedLink";

export default function Hero() {
  return (
    <section className="min-h-screen h-max md:h-screen p-4 bg-white pt-60 md:pt-0">
      <div className="container mx-auto h-full flex flex-col md:flex-row md:justify-center items-center gap-10 relative">
        <div className="flex flex-col items-center justify-center h-full w-full md:w-2/3 md:items-start">
          <h1 className="text-6xl md:text-7xl font-bold mb-5 w-full text-center md:text-start text-black md:max-w-50">
            Alexander Hellstén
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-xl">
            Self taught developer. Check out my projects and resumé to get to
            know me better!
          </p>
          <div className="flex gap-4 flex-wrap justify-center md:justify-start w-full md:w-max md:flex-nowrap items-center">
            <ActionButton href="/projects">
              View Projects
              <ArrowRight size={20} />
            </ActionButton>
            <ActionButton href="/_Alexander_Hellsten_Resume.pdf" secondary>
              <Download className="transition duration-50" size={20} />
              Download Resumé
            </ActionButton>
          </div>
        </div>
        <div className="w-full h-40 md:block relative max-w-90 mb-46 mt-60 ">
          <InfoCard
            size="h-54"
            color="shadow-blue-400 bg-blue-400 bottom-30"
            textColor="text-white"
            label="Years of experience"
            value="5+"></InfoCard>
          <InfoCard
            size={"h-48"}
            color="shadow-teal-200 bg-teal-200 top-0 right-0"
            textColor="text-black"
            label="Technologies"
            value={technologies["technologies"].length}></InfoCard>
          <InfoCard
            size={"h-40"}
            color="shadow-pink-500 bg-pink-500 top-30"
            textColor="text-black"
            label="Passion"
            value="100%"></InfoCard>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-20">
        <Mouse
          className="text-gray-500 mx-auto w-10 h-10 animate-bounce md:block hidden"
          size={40}
        />
      </div>
    </section>
  );
}
