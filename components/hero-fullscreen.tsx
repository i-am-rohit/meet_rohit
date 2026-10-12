"use client";

import { useEffect, useRef, useState } from "react";

function isNativeFs() {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    msFullscreenElement?: Element | null;
  };
  return Boolean(document.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement);
}

let savedScrollY = 0;

function restoreScroll() {
  const y = savedScrollY;
  requestAnimationFrame(() => {
    window.scrollTo(0, y);
  });
}

async function enterNative() {
  savedScrollY = window.scrollY;
  const root = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void;
    msRequestFullscreen?: () => Promise<void> | void;
  };
  if (isNativeFs()) return;
  if (root.requestFullscreen) {
    await root.requestFullscreen();
    restoreScroll();
    return;
  }
  if (root.webkitRequestFullscreen) {
    await root.webkitRequestFullscreen();
    restoreScroll();
    return;
  }
  await root.msRequestFullscreen?.();
  restoreScroll();
}

async function exitNative() {
  const doc = document as Document & {
    webkitFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void> | void;
    msExitFullscreen?: () => Promise<void> | void;
  };
  if (document.fullscreenElement && document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
    await doc.webkitExitFullscreen();
    return;
  }
  await doc.msExitFullscreen?.();
}

export function HeroFullscreen() {
  const [active, setActive] = useState(false);
  const dismissed = useRef(false);
  const wasFs = useRef(false);

  useEffect(() => {
    const sync = () => {
      const open = isNativeFs();
      if (wasFs.current && !open) dismissed.current = true;
      wasFs.current = open;
      setActive(open);
      if (open) restoreScroll();
    };

    const tryEnter = async () => {
      if (dismissed.current || isNativeFs()) return;
      try {
        await enterNative();
      } catch {
        /* browsers require a user gesture */
      }
    };

    const stopGestures = () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("keydown", onType);
    };

    const onGesture = () => {
      if (dismissed.current || isNativeFs()) {
        stopGestures();
        return;
      }
      void tryEnter().finally(() => {
        if (isNativeFs()) stopGestures();
      });
    };

    const onType = (event: KeyboardEvent) => {
      if (event.key !== "Escape") onGesture();
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !isNativeFs()) return;
      event.preventDefault();
      dismissed.current = true;
      void exitNative().catch(() => undefined);
    };

    const onShow = () => {
      dismissed.current = false;
      void tryEnter();
    };

    sync();
    void tryEnter();
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("touchstart", onGesture, { passive: true });
    window.addEventListener("keydown", onType);
    window.addEventListener("keydown", onEsc);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    window.addEventListener("pageshow", onShow);

    return () => {
      stopGestures();
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("pageshow", onShow);
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  async function toggle() {
    try {
      if (isNativeFs()) {
        dismissed.current = true;
        await exitNative();
      } else {
        dismissed.current = false;
        await enterNative();
      }
    } catch {
      /* blocked */
    }
    setActive(isNativeFs());
  }

  return (
    <button
      type="button"
      className="hero-fs"
      aria-pressed={active}
      aria-label={active ? "Exit full screen" : "Enter full screen"}
      title={active ? "Exit fullscreen (Esc)" : "Enter fullscreen — first click opens it; Esc minimizes"}
      onClick={() => void toggle()}
    >
      {active ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 14h6v6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m3 21 7-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 10h-6V4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m21 3-7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 3h6v6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m21 3-7 7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m3 21 7-7" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21H3v-6" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
