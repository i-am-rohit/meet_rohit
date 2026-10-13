"use client";

import { useEffect, useRef, useState } from "react";

export const RESUME_PDF = "/resume/Rohit%20Gusain.pdf";
export const RESUME_DOCX = "/resume/Rohit%20Gusain.docx";

const MOBILE = "(max-width: 767.98px)";

export function ResumeViewer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE);
    const apply = () => setMobile(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`resume-viewer${mobile ? " is-fitted" : ""}`} role="dialog" aria-modal="true" aria-labelledby="resume-viewer-title">
      <button type="button" className="resume-viewer-backdrop" aria-label="Close resume" onClick={onClose} />
      <div className="resume-viewer-sheet">
        <header className="resume-viewer-bar">
          <p id="resume-viewer-title" className="resume-viewer-title">
            Resume
          </p>
          <div className="resume-viewer-actions">
            <a className="resume-viewer-download" href={RESUME_PDF} download="Rohit Gusain.pdf">
              Download PDF
            </a>
            <a className="resume-viewer-download resume-viewer-download--ghost" href={RESUME_DOCX} download="Rohit Gusain.docx">
              Download Word
            </a>
            <button type="button" className="resume-viewer-close" onClick={onClose}>
              Close
            </button>
          </div>
        </header>
        {mobile ? (
          <FittedResume src={RESUME_PDF} />
        ) : (
          <iframe className="resume-viewer-frame" src={`${RESUME_PDF}#view=FitH`} title="Rohit Gusain resume" />
        )}
      </div>
    </div>
  );
}

function FittedResume({ src }: { src: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("Fitting the resume to this screen…");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let job = 0;
    let lastWidth = 0;

    const draw = async () => {
      const width = host.clientWidth;
      if (width < 40 || Math.abs(width - lastWidth) < 8) return;
      lastWidth = width;
      const current = ++job;
      setMessage("Fitting the resume to this screen…");

      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const task = pdfjs.getDocument({ url: src });
      try {
        const doc = await task.promise;
        if (cancelled || current !== job) return;

        host.querySelectorAll("canvas").forEach((node) => node.remove());
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        const pageWidth = Math.max(1, width - 16);

        for (let index = 1; index <= doc.numPages; index += 1) {
          if (cancelled || current !== job) break;
          const page = await doc.getPage(index);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: pageWidth / base.width });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width * ratio);
          canvas.height = Math.floor(viewport.height * ratio);
          canvas.className = "resume-page";
          const context = canvas.getContext("2d");
          if (!context) continue;
          host.appendChild(canvas);
          await page.render({
            canvas,
            canvasContext: context,
            viewport,
            transform: [ratio, 0, 0, ratio, 0, 0],
          }).promise;
        }

        if (!cancelled && current === job) setMessage("");
      } finally {
        await task.destroy();
      }
    };

    const observer = new ResizeObserver(() => {
      void draw().catch(() => {
        if (!cancelled) setMessage("This screen couldn’t resize the preview. Use Download PDF to open it.");
      });
    });
    observer.observe(host);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [src]);

  return (
    <div className="resume-pages" ref={hostRef}>
      {message ? <p className="resume-pages-status">{message}</p> : null}
    </div>
  );
}
