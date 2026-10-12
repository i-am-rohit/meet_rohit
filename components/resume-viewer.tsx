"use client";

import { useEffect } from "react";

export const RESUME_PDF = "/resume/Rohit%20Gusain.pdf";
export const RESUME_DOCX = "/resume/Rohit%20Gusain.docx";

export function ResumeViewer({ open, onClose }: { open: boolean; onClose: () => void }) {
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
    <div className="resume-viewer" role="dialog" aria-modal="true" aria-labelledby="resume-viewer-title">
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
        <iframe
          className="resume-viewer-frame"
          src={`${RESUME_PDF}#view=FitH`}
          title="Rohit Gusain resume"
        />
      </div>
    </div>
  );
}
