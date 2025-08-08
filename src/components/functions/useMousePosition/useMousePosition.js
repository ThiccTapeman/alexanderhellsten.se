// MouseTracker.js

"use client";
import React, { useState, useEffect } from "react";

function MouseTracker() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const updateMousePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const updateScrollPosition = (e) => {
      setScrollPosition({
        x: window.scrollX || window.pageXOffset,
        y: window.scrollY || window.pageYOffset,
      });
    };

    window.addEventListener("scroll", updateScrollPosition);
    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("scroll", updateScrollPosition);

      setPosition({ x: 0, y: 0 });
      setScrollPosition({ x: 0, y: 0 });
    };
  }, []);

  return { position, scrollPosition };
}

export default MouseTracker;
