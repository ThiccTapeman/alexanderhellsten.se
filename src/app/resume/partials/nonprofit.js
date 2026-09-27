/*
 *
 * Code was written by Alexander HellstÃ©n
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { Calendar } from "lucide-react";
import nonprofit from "../../../nonprofit.json";

export default function Nonprofit({ inverted = false }) {
  return (
    <section className={"min-h-max p-4 bg-white " + (inverted ? " md:bg-black md:text-gray-100" : "text-black")}>
      <div className="container mx-auto mt-10 mb-10">
        <h2 className="mb-10 text-3xl md:text-4xl font-bold text-center">
          Independent Projects
        </h2>
        <div className="flex flex-col gap-5">
          {nonprofit["nonprofit"].map((item) => (
            <div
              key={`${item.title}-${item.company}`}
              className={
                "p-10 w-full rounded-2xl text-xs flex flex-col md:flex-row border-1 " +
                (inverted ? "border-white/10 bg-white/5 " : "border-black/10") +
                " hover:shadow-md transition duration-200"
              }>
              <div className="w-full md:w-3/4">
                <div className="flex md:justify-between md:items-center md:flex-row flex-col-reverse">
                  <h2 className="text-xl md:text-2xl font-black">
                    {item.title}
                  </h2>
                  {item.current && (
                    <div className="px-4 py-1 bg-yellow-300 md:hidden w-max mb-1 rounded-full">
                      Current
                    </div>
                  )}
                </div>
                <p className={"text-lg text-pink-500 font-bold" + (inverted ? " opacity-90" : "") + " w-full"}>
                  {item.company}
                </p>
                <div className="flex mb-3 gap-2 pt-1 md:hidden">
                  <Calendar size={15}></Calendar>
                  {item.date}
                </div>
                <p className="text-base w-full">{item.description}</p>
                {item.projectLink && (
                  <a
                    href={item.projectLink}
                    target="_blank"
                    rel="noreferrer"
                    className={"mt-2 inline-block text-xs text-gray-500 underline" + (inverted ? " opacity-90" : "")}>
                    {item.projectLink}
                  </a>
                )}
              </div>
              <div className="w-full md:w-1/4 ">
                <div className="mb-3 gap-2 hidden md:flex justify-end">
                  <Calendar size={15}></Calendar>
                  {item.date}
                </div>
                {item.current && (
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
