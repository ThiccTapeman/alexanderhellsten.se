import { Github, Codepen } from "lucide-react";

export default function SocialButtons({ additionalClasses, ...props }) {
  return (
    <div
      className={"flex gap-4 mt-4 justify-center" + " " + additionalClasses}
      {...props}>
      <a className="group w-15 aspect-square cursor-pointer bg-white flex items-center justify-center rounded-full shadow-lg text-black hover:text-white hover:bg-black hover:border-3 transition-all duration-200">
        <Github className="transition duration-50" size={30} />
      </a>
      <a className="group w-15 text-black hover:text-white  aspect-square cursor-pointer bg-white flex items-center justify-center rounded-full shadow-lg hover:bg-black hover:border-3 transition-all duration-200">
        <Codepen className="transition duration-50" size={30} />
      </a>
    </div>
  );
}
