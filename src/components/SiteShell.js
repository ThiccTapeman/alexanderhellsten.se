"use client";

import { usePathname } from "next/navigation";
import { LoadingProvider } from "./LoadingProvider";
import { DyslexicProvider } from "./Dyslexic";
import Analytics from "./Analytics";

export default function SiteShell({ children, header, footer }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname?.startsWith("/admin/")) return children;
  const hideChrome = pathname?.startsWith("/resume/view/pdf") || pathname?.startsWith("/resume/view/printout");
  return <LoadingProvider initialDelay={0} betweenDelay={200}>
    <DyslexicProvider><Analytics />{!hideChrome && header}{children}{!hideChrome && footer}</DyslexicProvider>
  </LoadingProvider>;
}
