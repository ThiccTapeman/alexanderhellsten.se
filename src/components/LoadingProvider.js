/*
 *
 * Code was written by Alexander Hellstén
 * Github: https://github.com/ThiccTapeman
 * Project Github: https://github.com/ThiccTapeman/alexanderhellsten.se
 *
 */

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/components/Loader";

const LoadingCtx = createContext({
  show: () => {},
  hide: () => {},
  showFor: async () => {},
});

// Handles when to show the loader.
export function LoadingProvider({
  children,
  initialDelay = 800,
  betweenDelay = 800,
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);
  const firstRouteRef = useRef(true);

  // Show loader on initial mount.
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), initialDelay);
    return () => clearTimeout(timerRef.current);
  }, [initialDelay]);

  // Show loader on route change (except for the initial mount)
  useEffect(() => {
    // Skips the initial mount
    if (firstRouteRef.current) {
      firstRouteRef.current = false;
      return;
    }

    clearTimeout(timerRef.current);
    setVisible(true);
    timerRef.current = setTimeout(() => setVisible(false), betweenDelay);
    return () => clearTimeout(timerRef.current);
  }, [pathname, betweenDelay]);

  function show() {
    clearTimeout(timerRef.current);
    setVisible(true);
  }

  function hide() {
    clearTimeout(timerRef.current);
    setVisible(false);
  }

  function showFor(ms) {
    clearTimeout(timerRef.current);
    setVisible(true);
    return new Promise((resolve) => {
      timerRef.current = setTimeout(() => {
        setVisible(false);
        resolve();
      }, ms);
    });
  }

  return (
    <LoadingCtx.Provider value={{ show, hide, showFor }}>
      <Loader visible={visible} />
      {children}
    </LoadingCtx.Provider>
  );
}

// Custom hook for accessing loader controls from context
export function useLoading() {
  return useContext(LoadingCtx);
}
