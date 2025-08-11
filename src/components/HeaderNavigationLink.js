/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

"use client";

import { MenuItem } from "@headlessui/react";
import DelayedLink from "./DelayedLink";
import { usePathname } from "next/navigation";

export default function HeaderNavigationLink({
  href,
  children,
  title,
  delay = "",
  description,
  additionalClasses = "",
  Icon,
  ...props
}) {
  const pathname = usePathname();
  return (
    <MenuItem as="div">
      {({ close }) => (
        <div
          className={
            "w-full h-max transition group-data-[closed]:translate-x-2" +
            " " +
            delay
          }>
          <DelayedLink
            href={href}
            closeMenu={close} // Pass close as a prop
            className={
              "group flex items-center rounded-lg duration-200 hover:bg-black/5 p-3 px-5 gap-4 text-black" +
              additionalClasses +
              " " +
              (pathname == href
                ? "bg-black text-white hover:bg-black/5 hover:text-black"
                : "")
            }
            {...props}>
            <Icon size={25} className="transition duration-50" />
            <div>
              <p className="font-semibold">{title}</p>
              <p>{description}</p>
            </div>
          </DelayedLink>
        </div>
      )}
    </MenuItem>
  );
}
