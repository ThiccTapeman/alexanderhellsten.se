import { SkillCard } from "@/components/SkillCard";
import { ArrowRight } from "lucide-react";
import ActionButton from "@/components/ActionButton";
import SocialButtons from "@/components/SocialButtons";

export default function AboutMe() {
  return (
    <section className="p-8 bg-black">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-10 pt-20 pb-20">
          <div className="w-full">
            <h2 className="text-5xl font-extrabold mb-4 text-white">
              About Me
            </h2>
            <p className="text-lg text-white">
              I am a passionate developer with a love for creating innovative
              web applications. My journey in tech has been driven by curiosity
              and a desire to solve real-world problems.
            </p>
            <p className="mt-4 text-lg text-white mb-10">
              With a strong foundation in both frontend and backend development,
              I bring ideas to life through clean, efficient code and thoughtful
              user experiences.
            </p>
            <ActionButton href="/resume" additionalClasses="hidden lg:flex">
              View Full Resumé
              <ArrowRight className="" size={20} />
            </ActionButton>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="flex gap-4">
              <div className="p-5 px-10 flex divide-x-2 divide-white w-full rounded-lg shadow-lg">
                <SkillCard
                  title={"Front-End"}
                  skills="React, Next.js, Tailwind"
                />
                <SkillCard title={"Back-End"} skills="MySQL, .NET, Node.js" />
              </div>
            </div>
            <SocialButtons></SocialButtons>
          </div>
          <ActionButton href="/resume" additionalClasses="flex lg:hidden mt-10">
            View full Resumé
            <ArrowRight className="" size={20} />
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
