/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { Leckerli_One } from "next/font/google";
import Link from "next/link";
import DelayedLink from "./DelayedLink";

// Fancy font from google fonts
const leckerliOne = Leckerli_One({
  subsets: ["latin"],
  weight: "400",
});

export default function Logo({ className = "text-2xl font-bold" }) {
  return (
    <DelayedLink href="/" className={`${leckerliOne.className} ${className}`}>
      alexanderhellstén
    </DelayedLink>
  );
}
