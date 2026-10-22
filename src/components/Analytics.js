"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// Delegation covers links in server-rendered pages and newly loaded articles.
export default function Analytics() {
  useEffect(() => {
    if (!["alexanderhellsten.se", "www.alexanderhellsten.se"].includes(location.hostname)) return;
    window.sa_event = window.sa_event || function (...args) {
      (window.sa_event.q = window.sa_event.q || []).push(args);
    };
    // Also tolerate a tracker already installed through hosting configuration.
    if (!document.querySelector('script[src*="simpleanalyticscdn.com/latest.js"]') && !window.sa_loaded) {
      const script = document.createElement("script");
      script.src = "https://scripts.simpleanalyticscdn.com/latest.js";
      script.async = true;
      script.dataset.ignorePages = "/admin,/admin/*";
      document.body.appendChild(script);
    }

    const click = (event) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!link) return;
      const href = link.getAttribute("href");
      const placement = link.closest("header") ? "header" : link.closest("footer") ? "footer" : "content";
      if (/^mailto:/i.test(href)) return trackEvent("email_click", { placement });
      if (/^tel:/i.test(href)) return trackEvent("phone_click", { placement });
      const url = new URL(href, location.href);
      if (!["http:", "https:"].includes(url.protocol)) return;
      // No query strings, fragments, email addresses, or link text in metadata.
      const metadata = { destination: url.pathname, placement };
      if (/\.pdf$/i.test(url.pathname) && /resume/i.test(url.pathname)) {
        trackEvent("resume_download", metadata);
      } else if (link.hasAttribute("download")) {
        trackEvent("file_download", metadata);
      } else if (url.origin !== location.origin) {
        trackEvent("outbound_link_click", { ...metadata, domain: url.hostname });
      } else if (/^\/projects\/view\//.test(url.pathname)) {
        trackEvent("project_article_click", metadata);
      } else if (/\.(png|jpe?g|webp|avif|gif)$/i.test(url.pathname)) {
        trackEvent("article_image_open", metadata);
      } else if (url.pathname !== location.pathname) {
        trackEvent("navigation_click", metadata);
      } else if (url.hash && url.hash !== "#") {
        trackEvent("section_link_click", { placement });
      }
    };
    const play = (event) => {
      if (event.target instanceof HTMLVideoElement) trackEvent("article_video_play");
    };
    const toggle = (event) => {
      if (event.target instanceof HTMLDetailsElement && event.target.open) trackEvent("article_details_open");
    };
    document.addEventListener("click", click, true);
    document.addEventListener("play", play, true);
    document.addEventListener("toggle", toggle, true);
    return () => {
      document.removeEventListener("click", click, true);
      document.removeEventListener("play", play, true);
      document.removeEventListener("toggle", toggle, true);
    };
  }, []);
  return null;
}
