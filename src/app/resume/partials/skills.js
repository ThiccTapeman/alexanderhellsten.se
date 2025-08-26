import technologies from "../../../technologies.json";

/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

export default function Skills() {
  const mainTechnologies = technologies["technologies"].filter(
    (tech) => tech.main
  );

  return (
    <section className="p-4 bg-black">
      <div className="container mx-auto mt-10 mb-10">
        <h2 className="text-white mb-10 text-3xl md:text-4xl font-bold text-center">
          Skills
        </h2>
        <p className="text-center text-xl w-full lg:w-2/3 mx-auto mb-0.5">
          Here's a visualization of what I&apos;d say are my main skills. These
          levels show where I spend most of my time building, debugging, and
          improving code.
        </p>
        <p className="text-gray-500 text-xl text-center mb-5">
          (Personal opinion, not based on any tests)
        </p>
        <div className="bg-black rounded-lg p-6 shadow-md text-center grid grid-cols-1 grid-flow-row-dense md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainTechnologies.map((tech) => (
            <div
              key={tech.title}
              className="bg-black rounded-lg p-6 shadow-md text-center">
              <h3 className="text-lg font-semibold mb-2 text-left">
                {tech.title}:
              </h3>
              <div className="w-full bg-white rounded-full overflow-hidden h-3.5">
                <div
                  className={tech.color + " h-full"}
                  style={{ width: `${tech.level || 50}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
