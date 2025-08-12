/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { Github, Codepen } from "lucide-react";
import ActionButton from "./ActionButton";

export default function SocialButtons({ additionalClasses, ...props }) {
  return (
    <div
      className={"flex gap-4 mt-4 justify-center" + " " + additionalClasses}
      {...props}>
      <ActionButton
        className="group w-15 aspect-square cursor-pointer bg-white flex items-center justify-center rounded-full shadow-lg text-black hover:text-white hover:bg-black hover:border-3 transition-all duration-200"
        delay={0}
        w="aspect-square"
        href={"https://github.com/ThiccTapeman"}>
        <Github className="transition duration-50" size={30} />
      </ActionButton>
      <ActionButton
        className="group w-15 text-black hover:text-white  aspect-square cursor-pointer bg-white flex items-center justify-center rounded-full shadow-lg hover:bg-black hover:border-3 transition-all duration-200"
        delay={0}
        w="aspect-square"
        href={"https://codepen.io/Alexander-Hellsten"}>
        <Codepen className="transition duration-50" size={30} />
      </ActionButton>
    </div>
  );
}
