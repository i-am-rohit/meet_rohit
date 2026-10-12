"use client";

import { useEffect } from "react";
import type { projects } from "@/lib/content";

type Project = (typeof projects)[number];

export function ProjectViewer({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!project) return;
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
  }, [project, onClose]);

  if (!project) return null;

  const github = "github" in project ? project.github : undefined;
  const paperHref = "paperHref" in project ? project.paperHref : undefined;

  return (
    <div className="project-viewer" role="dialog" aria-modal="true" aria-labelledby="project-viewer-title">
      <button type="button" className="project-viewer-backdrop" aria-label="Close project" onClick={onClose} />
      <div className="project-viewer-sheet">
        <header className="project-viewer-bar">
          <p className="project-viewer-kicker">{project.index}</p>
          <button type="button" className="project-viewer-close" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="project-viewer-body">
          <img className="project-viewer-image" src={project.image} alt="" />
          <div className="project-viewer-copy">
            <h2 id="project-viewer-title">{project.name}</h2>
            <p className="project-viewer-role">{project.role}</p>
            <p className="project-viewer-overview">{project.overview}</p>
            <h3 className="project-viewer-sub">Features</h3>
            <ul className="project-viewer-features">
              {project.features.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3 className="project-viewer-sub">Technologies used</h3>
            <ul className="project-viewer-tech">
              {project.technologies.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="project-viewer-impact">{project.impact}</p>
            <div className="project-viewer-links">
              {github ? (
                <a className="project-viewer-link project-viewer-github" href={github} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              ) : null}
              {paperHref ? (
                <a className="project-viewer-link" href={paperHref} target="_blank" rel="noopener noreferrer">
                  View research paper
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
