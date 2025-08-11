/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-white text-black p-4  h-40 border-t-1 border-gray-200">
      <div className="flex justify-between items-center gap-4 h-full container mx-auto">
        <Logo></Logo>
        <p>&copy; {new Date().getFullYear()} My Portfolio</p>
      </div>
    </footer>
  );
}
