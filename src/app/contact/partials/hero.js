import { Clock2, CircleCheckBig } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-black h-max w-full p-4">
      <div className="container mx-auto text-white flex flex-col items-center justify-center h-full mt-40 mb-10 lg:mb-20">
        <h1 className="text-center text-4xl md:text-6xl font-bold mb-5 md:mb-8">
          Let&apos;s Work Together
        </h1>
        <p className="text-center text-lg md:text-xl w-full lg:w-1/2 text-gray-300">
          I&apos;m always interested in new opportunities, exciting projects,
          and meaningful collaborations. Whether you have a project in mind or
          just want to say hello, I&apos;d love to hear from you.
        </p>
        <div className="flex mt-15 gap-10 flex-col md:flex-row">
          <div className="flex gap-4">
            <Clock2 className="text-yellow-300"></Clock2>
            Usually responds within 24 hours
          </div>
          <div className="flex gap-4">
            <CircleCheckBig className="text-yellow-300"></CircleCheckBig>
            Aviable for new projects
          </div>
        </div>
      </div>
    </section>
  );
}
