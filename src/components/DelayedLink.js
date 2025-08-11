/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLoading } from "@/components/LoadingProvider";

import Link from "next/link";

const FILE_EXT = /\.(pdf|docx?|xlsx?|csv|zip|png|jpe?g|gif|mp4|mp3)$/i;

// Gives a delay to make the transition between pages more seemless
export default function DelayedLink({
  href,
  children,
  className,
  delay = 400,
  download,
  target,
  rel,
  closeMenu,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { show } = useLoading();

  const isFile = FILE_EXT.test(href) || download;

  function onClick(e) {
    e.preventDefault();

    if (pathname == href) return;

    // If theres a menu to close when clicking the link. Close it.
    if (typeof closeMenu === "function") closeMenu();
    show();

    // Reroutes after the delay
    setTimeout(() => router.push(href), delay);
  }

  // Delay, return an "a" element with the delay functionallity, if it's refering to a file, make it downloadable.
  if (delay > 0 || isFile) {
    return (
      <a
        href={href}
        className={className}
        onClick={isFile ? "" : onClick}
        download={download && isFile ? true : false}
        target={target}
        rel={rel}>
        {children}
      </a>
    );
  }

  // No delay, just return a normal Link tag
  return (
    <Link href={href} className={className} target={target} rel={rel}>
      {children}
    </Link>
  );
}
