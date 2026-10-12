"use client";

import { useEffect, useRef, useState } from "react";

const SONG =
  "/audio/" +
  encodeURIComponent(
    "Labrinth – Formula (Extended version) Euphoria (Original Score from the HBO Series).mp3",
  );

const STORAGE_KEY = "meetrohit-audio";
const DEFAULT_VOLUME = 0.45;

type AudioPrefs = { volume: number; muted: boolean };
type AudioHost = Window & { __siteAudio?: HTMLAudioElement };

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

function readPrefs(): AudioPrefs {
  if (typeof window === "undefined") {
    return { volume: DEFAULT_VOLUME, muted: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { volume: DEFAULT_VOLUME, muted: false };
    const parsed = JSON.parse(raw) as Partial<AudioPrefs>;
    const volume = clampVolume(typeof parsed.volume === "number" ? parsed.volume : DEFAULT_VOLUME);
    const muted = Boolean(parsed.muted) || volume === 0;
    return { volume: muted && volume === 0 ? DEFAULT_VOLUME : volume || DEFAULT_VOLUME, muted };
  } catch {
    return { volume: DEFAULT_VOLUME, muted: false };
  }
}

function writePrefs(prefs: AudioPrefs) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        volume: clampVolume(prefs.volume > 0 ? prefs.volume : DEFAULT_VOLUME),
        muted: prefs.muted || prefs.volume === 0,
      }),
    );
  } catch {
    /* ignore */
  }
}

function getAudio() {
  if (typeof window === "undefined") return null;
  const host = window as AudioHost;
  if (!host.__siteAudio) {
    const prefs = readPrefs();
    const el = new Audio(SONG);
    el.loop = true;
    el.preload = "auto";
    el.volume = prefs.muted ? 0 : prefs.volume;
    el.muted = prefs.muted;
    host.__siteAudio = el;
  }
  return host.__siteAudio;
}

export function SiteAudio() {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const lastVolume = useRef(DEFAULT_VOLUME);

  useEffect(() => {
    const el = getAudio();
    if (!el) return;

    const prefs = readPrefs();
    el.muted = prefs.muted;
    el.volume = prefs.muted ? 0 : prefs.volume;
    lastVolume.current = prefs.volume || DEFAULT_VOLUME;
    setMuted(prefs.muted);
    setVolume(prefs.muted ? 0 : prefs.volume);

    const sync = () => {
      setPlaying(!el.paused);
      setMuted(el.muted || el.volume === 0);
      setVolume(el.muted ? 0 : el.volume);
    };
    let unlocked = !el.paused;

    const tryPlay = () => {
      void el.play().then(() => {
        unlocked = true;
        sync();
      }).catch(() => undefined);
    };

    el.addEventListener("play", sync);
    el.addEventListener("pause", sync);
    el.addEventListener("volumechange", sync);
    sync();
    tryPlay();

    const onGesture = () => {
      if (unlocked) return;
      tryPlay();
    };
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("touchstart", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);

    return () => {
      el.removeEventListener("play", sync);
      el.removeEventListener("pause", sync);
      el.removeEventListener("volumechange", sync);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, []);

  function persist(nextVolume: number, nextMuted: boolean) {
    const storedVolume = nextVolume > 0 ? nextVolume : lastVolume.current || DEFAULT_VOLUME;
    writePrefs({ volume: storedVolume, muted: nextMuted || nextVolume === 0 });
  }

  function applyVolume(next: number) {
    const el = getAudio();
    if (!el) return;
    const value = clampVolume(next);
    el.muted = value === 0;
    el.volume = value === 0 ? 0 : value;
    if (value > 0) lastVolume.current = value;
    persist(value > 0 ? value : lastVolume.current, value === 0);
  }

  function quieter() {
    applyVolume((getAudio()?.volume ?? volume) - 0.1);
  }

  function louder() {
    const el = getAudio();
    if (!el) return;
    if (el.muted || el.volume === 0) applyVolume(lastVolume.current || DEFAULT_VOLUME);
    else applyVolume(el.volume + 0.1);
  }

  function toggleMute() {
    const el = getAudio();
    if (!el) return;
    if (el.paused) {
      void el.play().catch(() => undefined);
      el.muted = false;
      if (el.volume === 0) applyVolume(lastVolume.current || DEFAULT_VOLUME);
      else persist(el.volume || lastVolume.current, false);
      return;
    }
    if (el.muted || el.volume === 0) {
      el.muted = false;
      applyVolume(lastVolume.current || DEFAULT_VOLUME);
    } else {
      lastVolume.current = el.volume || DEFAULT_VOLUME;
      el.muted = true;
      persist(lastVolume.current, true);
    }
  }

  const silent = muted || volume === 0 || !playing;

  return (
    <div className="hero-audio-dock">
      <button type="button" className="hero-audio-step hero-audio-step--down" aria-label="Decrease volume" onClick={quieter}>
        −
      </button>
      <button
        type="button"
        className="hero-audio"
        aria-pressed={!silent}
        aria-label={silent ? "Unmute music" : "Mute music"}
        onClick={toggleMute}
      >
        {silent ? (
          <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
            <path
              fill="currentColor"
              d="M4.3 3 3 4.3 7.7 9H3v6h4.2L12 19.8v-7.5l4.3 4.3c-.7.5-1.5.9-2.3 1.2V20c1.3-.4 2.5-1.1 3.5-2l2.2 2.2 1.3-1.3L4.3 3zM12 4.2 10.1 6l1.9 1.9V4.2zm5.5 7.8c0 .6-.1 1.2-.3 1.7l1.2 1.2c.5-.9.8-1.9.8-2.9 0-3.2-2.1-5.8-5-6.7V4c3.8.9 6.5 4.3 6.5 8z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true">
            <path
              fill="currentColor"
              d="M3 10v4h3.2L11 18.8V5.2L6.2 10H3zm11.5 2c0-1.8-1-3.3-2.5-4.1v8.2c1.5-.8 2.5-2.3 2.5-4.1zm-2.5-7v1.5c2.9.9 5 3.5 5 6.5s-2.1 5.6-5 6.5V20c3.7-.9 6.5-4.3 6.5-8.5S15.7 5.9 12 5z"
            />
          </svg>
        )}
      </button>
      <button type="button" className="hero-audio-step hero-audio-step--up" aria-label="Increase volume" onClick={louder}>
        +
      </button>
      <input
        className="hero-audio-slider"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        aria-label="Volume"
        onChange={(event) => applyVolume(Number(event.target.value))}
      />
    </div>
  );
}
