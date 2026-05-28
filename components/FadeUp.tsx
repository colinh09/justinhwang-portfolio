"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function FadeUp({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [primed, setPrimed] = useState(false);
  const [visible, setVisible] = useState(false);

  useIsoLayoutEffect(() => {
    setPrimed(true);
  }, []);

  useEffect(() => {
    if (!primed) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible(true);
        }),
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [primed]);

  const classes = [
    "jh-fadeup",
    primed && "jh-fadeup--prime",
    visible && "is-in",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
