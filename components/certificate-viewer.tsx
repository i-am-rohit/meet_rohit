"use client";

import { useEffect } from "react";
import type { certificates } from "@/lib/content";

type Certificate = (typeof certificates)[number];

export function CertificateViewer({
  certificate,
  indexLabel,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
}: {
  certificate: Certificate | null;
  indexLabel?: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!certificate) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrev) onPrev();
      if (event.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [certificate, hasPrev, hasNext, onClose, onPrev, onNext]);

  if (!certificate) return null;

  return (
    <div className="certificate-viewer" role="dialog" aria-modal="true" aria-labelledby="certificate-viewer-title">
      <button type="button" className="certificate-viewer-backdrop" aria-label="Close certificate" onClick={onClose} />
      <div className="certificate-viewer-sheet">
        <header className="certificate-viewer-bar">
          <div>
            <p className="certificate-viewer-kicker">
              {certificate.category}
              {indexLabel ? ` · ${indexLabel}` : ""}
            </p>
            <h2 id="certificate-viewer-title">{certificate.name}</h2>
            <p className="certificate-viewer-issuer">
              {certificate.issuer}
              {"issueDate" in certificate && certificate.issueDate ? ` · ${certificate.issueDate}` : ""}
            </p>
          </div>
          <button type="button" className="certificate-viewer-close" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="certificate-viewer-stage">
          <img src={certificate.image} alt={`${certificate.name} certificate`} />
        </div>
        <footer className="certificate-viewer-foot">
          <div className="certificate-viewer-nav">
            <button type="button" onClick={onPrev} disabled={!hasPrev}>
              Previous
            </button>
            <button type="button" onClick={onNext} disabled={!hasNext}>
              Next
            </button>
          </div>
          <div className="certificate-viewer-links">
            {"pdfUrl" in certificate && certificate.pdfUrl ? (
              <a href={certificate.pdfUrl} target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
            ) : null}
            {"credentialUrl" in certificate && certificate.credentialUrl ? (
              <a href={certificate.credentialUrl} target="_blank" rel="noopener noreferrer">
                View credential
              </a>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}
