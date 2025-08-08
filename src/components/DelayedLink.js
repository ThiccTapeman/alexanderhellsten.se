"use client";
import { usePathname, useRouter } from "next/navigation";
import { useLoading } from "@/components/LoadingProvider";

import Link from "next/link";
import { useCallback } from "react";

const FILE_EXT = /\.(pdf|docx?|xlsx?|csv|zip|png|jpe?g|gif|mp4|mp3)$/i;

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

    if (typeof closeMenu === "function") closeMenu();
    show();
    setTimeout(() => router.push(href), delay);
  }

  if (isFile) {
    return (
      <a
        href={href}
        className={className}
        download={download ?? true}
        target={target}
        rel={rel}>
        {children}
      </a>
    );
  }

  if (delay > 0) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        target={target}
        rel={rel}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} target={target} rel={rel}>
      {children}
    </Link>
  );
}
