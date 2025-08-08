"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoading } from "@/components/LoadingProvider";

export default function DelayedLink({ href, delay = 800, children, ...props }) {
  const router = useRouter();
  const { show } = useLoading();

  function onClick(e) {
    e.preventDefault();
    show();
    setTimeout(() => router.push(href), delay);
  }

  return (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  );
}
