"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function CursorEffect() {
  const glowRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    document.documentElement.classList.add("has-pointer");

    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let cx = gx;
    let cy = gy;
    let rx = gx;
    let ry = gy;
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      gx = event.clientX;
      gy = event.clientY;
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      const hot = Boolean(
        target?.closest("a, button, [data-magnetic], [data-draggable], input, textarea, .hero-expertise-item, .skill-card, .skills-carousel-item"),
      );
      document.documentElement.classList.toggle("cursor-hot", hot);
    };

    const draw = () => {
      const glow = glowRef.current;
      const ring = ringRef.current;
      if (glow && ring) {
        cx += (gx - cx) * 0.12;
        cy += (gy - cy) * 0.12;
        rx += (gx - rx) * 0.35;
        ry += (gy - ry) * 0.35;
        glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      }
      frame = requestAnimationFrame(draw);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      document.documentElement.classList.remove("has-pointer", "cursor-hot");
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <>
      <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>,
    document.body,
  );
}
