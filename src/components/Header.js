/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { FileText, Briefcase, Mail, House } from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import Logo from "./Logo";
import HeaderNavigationLink from "./HeaderNavigationLink";

export default function Header() {
  return (
    <header className="p-4 bg-white text-black fixed w-screen top-0 z-40 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Logo></Logo>
        <nav className="flex items-center">
          <Menu as="div" className="">
            <MenuButton className="group flex flex-col gap-1 justify-center relative w-7 h-7 items-end text-black focus:outline-none">
              <div className="w-5 h-1 rounded bg-black transition-all duration-200            group-data-[active]:translate-y-2	                                group-hover:w-7 group-data-[active]:opacity-0"></div>
              <div className="w-7 h-1 rounded bg-black transition-all duration-200 absolute   group-data-[active]:rotate-45 group-data-[active]:translate-x-0   group-hover:w-7"></div>
              <div className="w-7 h-1 rounded bg-black transition-all duration-200						group-data-[active]:-rotate-45 group-data-[active]:translate-x-0  group-hover:w-7"></div>
              <div className="w-3 h-1 rounded bg-black transition-all duration-200            group-data-[active]:-translate-y-2                                group-hover:w-7 group-data-[active]:opacity-0"></div>
            </MenuButton>
            <MenuItems
              transition
              className="group absolute top-9 left-0 w-screen mt-2 shadow-lg bg-white focus:outline-none origin-top transition duration-200 ease-in-out data-closed:-translate-y-1 data-closed:opacity-0 -z-10">
              <div className="p-3 py-10 flex container mx-auto flex-col gap-3">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs text-black/80 font-bold">
                    Quick Links
                  </h3>
                  <HeaderNavigationLink
                    href="/"
                    delay="delay-100"
                    title="Home"
                    description="Quick overview of me"
                    Icon={House}></HeaderNavigationLink>
                  <HeaderNavigationLink
                    href="/portfolio"
                    delay="delay-200"
                    title="Portfolio"
                    description="View my latest projects and designs"
                    Icon={Briefcase}></HeaderNavigationLink>
                  <HeaderNavigationLink
                    href="/resume"
                    delay="delay-300"
                    title="Resumé"
                    description="View and download my latest resumé"
                    Icon={FileText}></HeaderNavigationLink>
                  <HeaderNavigationLink
                    href="/contact"
                    delay="delay-400"
                    title="Contact"
                    description="Ways to get in touch with me"
                    Icon={Mail}></HeaderNavigationLink>
                </div>
              </div>
            </MenuItems>
          </Menu>
        </nav>
      </div>
    </header>
  );
}
