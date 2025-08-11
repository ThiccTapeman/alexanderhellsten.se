/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import DelayedLink from "./DelayedLink";

// Will make an action button that is unified with the rest of the buttons. Works with both downloads, links, and delayed links
export default function ActionButton({
  href,
  children,
  additionalClasses = "",
  className = "text-xs sm:text-base flex items-center gap-2 font-semibold rounded transition duration-200 cursor-pointer ",
  secondary,
  secondaryInverted,
  transparent,
  p = "px-8 py-3",
  w = "w-max",
  delay = 0,
  download,
}) {
  // Modifies the classes
  let classes = className;
  classes += p + " ";
  classes += w + " ";

  if (secondary) {
    classes += "bg-white border-1 text-black hover:bg-black hover:text-white";
  } else if (secondaryInverted) {
    classes +=
      "bg-black border-1 border-black  text-white hover:bg-white hover:text-black";
  } else if (transparent) {
    classes +=
      "bg-transparent border-1 text-black hover:bg-white hover:text-black";
  } else {
    classes += "bg-yellow-300 text-black hover:bg-amber-500 hover:text-white";
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
