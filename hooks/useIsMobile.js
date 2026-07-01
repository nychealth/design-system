/**
 * useIsMobile
 *
 * Returns true when the viewport is narrower than the sm breakpoint (640px).
 * Uses matchMedia so it updates reactively on resize.
 * Initialises to false to avoid SSR mismatches; the effect runs on mount —
 * safe for both CHP and RVP, which are both Next.js apps.
 *
 * Sourced from respiratory-virus-data-pages.
 */
import { useState, useEffect } from "react";

export function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setMobile(mq.matches);
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return mobile;
}

export default useIsMobile;
