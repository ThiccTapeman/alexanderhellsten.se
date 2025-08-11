/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

"use client";

import { useState, useEffect, useRef } from "react";

export default function ContactCard({
  children,
  href,
  title,
  copy,
  text,
  description,
  value,
  icon,
  ...props
}) {
  const Icon = icon;
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  function handleClick(e) {
    if (copy) {
      e.preventDefault();
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
    }
  }

  useEffect(() => {
    if (copied) {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1200);
    }
    return () => clearTimeout(timerRef.current);
  }, [copied]);

  return (
    <a
      className="group w-full border p-10 rounded-xl text-black hover:shadow-md hover:bg-black hover:text-white cursor-pointer  transition duration-200"
      href={copy ? "#" : href}
      onClick={handleClick}
      {...props}>
      <div className="flex justify-between">
        <div className="flex gap-3 items-center">
          {children}
          <h2 className="text-2xl font-bold md:text-center">{title}</h2>
        </div>
        {copy ? (
          copied ? (
            <div className="p-1 rounded-full px-3 bg-black text-white group-hover:bg-white group-hover:text-black transition duration-200">
              Copied
            </div>
          ) : (
            ""
          )
        ) : (
          ""
        )}
      </div>
      <p className="mb-3">{value}</p>
      <p className="text-lg">{description}</p>
    </a>
  );
}
