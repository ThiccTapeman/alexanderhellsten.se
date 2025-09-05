/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { ProfileLinkCard } from "@/components/ProfileLinkCard";
import { FileText, Briefcase, Mail } from "lucide-react";

export default function Discover() {
  return (
    <section className="p-4 bg-white min-h-max">
      <div className="container mx-auto pt-20 pb-20">
        <h1 className="text-5xl text-black font-bold mb-4">Explore My Work</h1>
        <p className="text-lg text-black mb-8">
          Discover the projects I&apos;ve worked on, showcasing my skills and
          creativity.
        </p>
        <div className="flex flex-col gap-4 lg:flex-row">
          <ProfileLinkCard
            title="Projects"
            href="/projects"
            description="View my latest projects and designs"
            icon={Briefcase}></ProfileLinkCard>
          <ProfileLinkCard
            title="Resumé"
            href="/resume"
            description="Explore my background, skills, and experience"
            icon={FileText}></ProfileLinkCard>
          <ProfileLinkCard
            title="Contact"
            href="/contact"
            description="Ways of contacting me"
            icon={Mail}></ProfileLinkCard>
        </div>
      </div>
    </section>
  );
}
