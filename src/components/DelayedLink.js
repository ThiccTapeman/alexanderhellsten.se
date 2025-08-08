"use client";
import { usePathname, useRouter } from "next/navigation";
import { useLoading } from "@/components/LoadingProvider";

export default function DelayedLink({
  href,
  delay = 800,
  closeMenu,
  children,
  ...props
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { show } = useLoading();

  function onClick(e) {
    e.preventDefault();

    if (pathname == href) return;

    if (typeof closeMenu === "function") closeMenu();
    show();
    setTimeout(() => router.push(href), delay);
  }

  return (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  );
}
