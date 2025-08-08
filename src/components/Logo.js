import { Leckerli_One } from "next/font/google";
import Link from "next/link";
import DelayedLink from "./DelayedLink";

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
