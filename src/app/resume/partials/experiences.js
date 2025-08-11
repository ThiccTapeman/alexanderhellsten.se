/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { Calendar } from "lucide-react";

export default function Experiences() {
  const Experiences = [
    {
      title: "Construction Work",
      company: "Hellstén's Bygg och Entreprenard",
      description:
        "I worked with refuling the machines on a large scale road project.",
      date: "Sep. 2024 - Aug. 2025",
      current: true,
    },
    {
      title: "Summer Job (3 weeks)",
      company: "Stadsmuseet, Eskilstuna",
      description:
        "I worked on documenting artworks by photographing them for an art exhibition, focusing on capturing the current appearance of Eskilstuna.",
      date: "Jun. 2022 - Jul. 2022",
      current: false,
    },
  ];

  return (
    <section className="min-h-max p-4 bg-white">
      <div className="container mx-auto mt-10 mb-10">
        <h2 className="text-black mb-10 text-3xl md:text-4xl font-bold text-center">
          Experiences
        </h2>
        <div className="">
          {Experiences.map((experience) => (
            <div
              key={experience.title}
              className={
                "p-10 w-full rounded-2xl mb-5 text-black text-xs flex flex-col md:flex-row border-1"
              }>
              <div className="w-full md:w-3/4 mb-4">
                <div className="flex md:justify-between md:items-center md:flex-row flex-col-reverse">
                  <h2 className="text-xl md:text-2xl font-black">
                    {experience.title}
                  </h2>
                  {experience.current && (
                    <div className="px-4 py-1 bg-yellow-300 md:hidden w-max mb-1 rounded-full">
                      Current
                    </div>
                  )}
                </div>
                <p className="text-lg text-pink-500 w-full">
                  {experience.company}
                </p>
                <div className="flex mb-3 gap-2 pt-1 md:hidden">
                  <Calendar size={15}></Calendar>
                  {experience.date}
                </div>
                <p className="text-base w-full">{experience.description}</p>
              </div>
              <div className="w-full md:w-1/4 ">
                <div className="mb-3 gap-2 hidden md:flex">
                  <Calendar size={15}></Calendar>
                  {experience.date}
                </div>
                {experience.current && (
                  <div className="px-4 py-1 hidden md:block bg-yellow-300 w-max rounded-full">
                    Current
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
