/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { Calendar } from "lucide-react";

export default function Education() {
  const Educations = [
    {
      title: "Technology Program",
      school: "Grillska Gymnasiet, Eskilstuna",
      subject: "Information and Media Technology",
      date: "Aug. 2021 - Jun. 2024",
      description: "DWDWADWADWADWAWD",
      recent: true,
    },
    {
      title: "Elementary School",
      school: "Gökstensskolan, Eskilstuna",
      subject: "Grade 1 - 9",
      date: "Aug. 2012 - Jun. 2021",
      description: "DWDWADWADWADWAWD",
      recent: false,
    },
  ];
  return (
    <section className="p-4 bg-white">
      <div className="container mx-auto mt-10 mb-10">
        <h2 className="text-black mb-10 text-3xl md:text-4xl font-bold text-center">
          Education
        </h2>
        <div className="flex gap-10 flex-col md:flex-row">
          {Educations.map((education) => (
            <div
              key={education.title}
              className={
                "p-10 w-full rounded-2xl mb-5 text-black text-xs flex flex-col md:flex-row border-1"
              }>
              <div className="w-full mb-4">
                <div className="w-full flex md:justify-between md:items-center flex-col-reverse gap-2 md:flex-row">
                  <h2 className="text-xl w-max md:text-2xl font-black">
                    {education.title}
                  </h2>

                  {education.recent && (
                    <div className="px-4 py-1 w-max h-max bg-yellow-300 rounded-full">
                      Most Recent
                    </div>
                  )}
                </div>

                <p className="text-lg text-blue-500 w-full">
                  {education.school}
                </p>
                <div className="flex mt-1 mb-2 gap-2">
                  <Calendar size={15}></Calendar>
                  {education.date}
                </div>
                <p className="text-base w-full">{education.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
