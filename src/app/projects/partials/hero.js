import projects from "../../../projects.json";
import technologies from "../../../technologies.json";

export default function Hero() {
  return (
    <section className="w-full bg-black">
      <div className="container mx-auto pt-40 pb-25 w-full flex flex-col items-center text-center">
        <h2 className="text-6xl font-bold text-white mb-5">My Projects</h2>
        <p className="text-lg w-full md:w-2/3 text-gray-300 mb-15">
          A showcase of my creative and technical work, featuring web
          applications, mobile apps, and innovative digital solutions built with
          modern technologies.
        </p>
        <div className="flex w-full flex-col md:flex-row gap-10 text-white items-center justify-center">
          <div className="flex gap-3 w-max items-center">
            <div className="h-4 aspect-square bg-amber-500 rounded-full"></div>
            <p>{projects.projects.length} projects</p>
          </div>
          <div className="flex gap-3 w-max items-center">
            <div className="h-4 aspect-square bg-purple-500 rounded-full"></div>
            <p>{technologies.technologies.length} Technologies</p>
          </div>
        </div>
      </div>
    </section>
  );
}
