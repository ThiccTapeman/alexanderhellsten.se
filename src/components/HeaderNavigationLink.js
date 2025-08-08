import { MenuItem } from "@headlessui/react";
import Link from "next/link";
import LoaderLink from "./DelayedLink";

export default function HeaderNavigationLink({
  href,
  children,
  title,
  delay = "",
  description,
  additionalClasses = "",
  Icon,
}) {
  return (
    <MenuItem as="div">
      <LoaderLink
        href={href}
        className={
          "group flex items-center rounded-lg transition duration-200 hover:bg-black/5 p-3 px-5 gap-4 text-black group-data-[closed]:translate-x-2 " +
          additionalClasses +
          " " +
          delay
        }>
        <Icon size={25} className="transition duration-50" />
        <div>
          <p className="font-semibold">{title}</p>
          <p>{description}</p>
        </div>
      </LoaderLink>
    </MenuItem>
  );
}
