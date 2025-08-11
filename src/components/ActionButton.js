/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import DelayedLink from "./DelayedLink";

export default function ActionButton({
  href,
  children,
  additionalClasses = "",
  className = "text-xs sm:text-base flex items-center gap-2 px-8 font-semibold py-3 bg-yellow-300 text-black rounded hover:bg-amber-500 hover:text-white w-max transition duration-200 cursor-pointer",
  secondary,
  secondaryInverted,
  delay = 0,
  download,
}) {
  let classes = className;

  if (secondary) {
    classes =
      "text-xs sm:text-base flex items-center gap-2 px-8 font-semibold py-3 text-black rounded hover:bg-black border-1 hover:text-white w-max transition duration-200 cursor-pointer";
  }

  if (secondaryInverted) {
    classes =
      "text-xs sm:text-base flex items-center gap-2 px-8 font-semibold py-3 text-white rounded hover:bg-white border-1 hover:text-black w-max transition duration-200 cursor-pointer";
  }

  return (
    <DelayedLink
      href={href}
      className={classes + " " + additionalClasses}
      delay={delay}
      download={download}>
      {children}
    </DelayedLink>
  );
}
