import Link from "next/link";
import LoaderLink from "./DelayedLink";
import DelayedLink from "./DelayedLink";

export default function ActionButton({
  href,
  className = "text-xs sm:text-base flex items-center gap-2 px-8 font-semibold py-3 bg-yellow-300 text-black rounded hover:bg-amber-500 hover:text-white w-max transition duration-200 cursor-pointer",
  additionalClasses = "",
  children,
  secondary,
  secondaryInverted,
}) {
  if (secondary) {
    className =
      "text-xs sm:text-base flex items-center gap-2 px-8 font-semibold py-3 text-black rounded hover:bg-black border-1 hover:text-white w-max transition duration-200 cursor-pointer";
  }
  if (secondaryInverted) {
    className =
      "text-xs sm:text-base flex items-center gap-2 px-8 font-semibold py-3 text-white rounded hover:bg-white border-1 hover:text-black w-max transition duration-200 cursor-pointer";
  }
  return (
    <DelayedLink href={href} className={className + " " + additionalClasses}>
      {children}
    </DelayedLink>
  );
}
