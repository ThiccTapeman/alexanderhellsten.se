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
import { Download, Mail, Phone, MapPinned, Globe } from "lucide-react";


export default function Hero({
  technologies,
  showDownload = true,
  listView = false,
  showContactInfo = false,
  showContactActions = false,
}) {
  return (
    <section className="bg-black h-max w-full p-4">
      <div className={"container mx-auto text-white flex flex-col items-between justify-center h-full mb-10 lg:mb-10 " + (showContactInfo ? "mt-20" : "mt-40")}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full lg:w-2/3">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold w-max">
              Alexander Hellstén
            </h1>
            <p className="mt-1 text-lg md:text-xl text-gray-400 w-max lg:w-full">
              Full Stack Developer
            </p>
            <p className="mt-5 text-md md:text-lg lg:w-full">
              Self-taught developer with 5+ years of experience building innovative web applications and digital solutions. Specialized in modern JavaScript frameworks, Unity development, and user-centered design.
            </p>
            {showDownload && (
              <div className="mt-10 flex gap-4">
                <ActionButton href="#Download">
                  <Download size={20}></Download>Download Resumé
                </ActionButton>
                <ActionButton href="/contact" secondaryInverted>
                  <Mail size={20}></Mail>Contact Me
                </ActionButton>
              </div>
            )}
            {!showDownload && showContactActions && (
              <div className="mt-10 flex gap-4">
                <ActionButton href="mailto:alexanderhellsten7@gmail.com">
                  <Mail size={20}></Mail>Contact Me
                </ActionButton>
                <ActionButton
                  href="https://alexanderhellsten.se"
                  secondary
                  target="_blank"
                  rel="noreferrer">
                  <Globe size={20}></Globe>Visit My Website
                </ActionButton>
              </div>
            )}
          </div>
          {showContactInfo && (
            <aside className="w-full lg:w-1/3 rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold mb-4">Contact</h2>
              <div className="flex flex-col gap-3 text-sm text-gray-300">
                <a
                  className="flex items-center gap-3 hover:text-white"
                  href="mailto:alexanderhellsten7@gmail.com">
                  <Mail size={16}></Mail>
                  alexanderhellsten7@gmail.com
                </a>
                <div className="flex items-center gap-3">
                  <Phone size={16}></Phone>
                  +46 070 473 58 86
                </div>
                <a
                  className="flex items-center gap-3 hover:text-white"
                  href="https://alexanderhellsten.se">
                  <Globe size={16}></Globe>
                  alexanderhellsten.se
                </a>
                <div className="flex items-center gap-3">
                  <MapPinned size={16}></MapPinned>
                  Sodermanland, Sweden
                </div>
              </div>
            </aside>
          )}
        </div>
        <div className="flex flex-col w-full mt-10 lg:w-1/3">
          <h2 className="mb-2 text-xl">Technologies I&apos;ve worked with:</h2>
        </div>
        <TagSlider
          content={technologies}
          as={TechnologyTag}
          listView={listView}
        ></TagSlider>
      </div>
    </section>
  );
}
