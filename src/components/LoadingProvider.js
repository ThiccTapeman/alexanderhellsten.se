import { createContext, useContext, useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Loader from "@/components/Loader";

const LoadingCtx = createContext({
  show: () => {},
  hide: () => {},
  showFor: async () => {},
});

export function LoadingProvider({
  children,
  initialDelay = 800,
  betweenDelay = 800,
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);
  const firstRouteRef = useRef(true);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), initialDelay);
    return () => clearTimeout(timerRef.current);
  }, [initialDelay]);

  useEffect(() => {
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

export function useLoading() {
  return useContext(LoadingCtx);
}
