"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  certificateCategories,
  certificates,
  contactIcons,
  contacts,
  education,
  nav,
  projects,
  qrCodes,
  roles,
  skillLogos,
  skills,
} from "@/lib/content";
import { Chatbot } from "@/components/chatbot";
import { CertificateViewer } from "@/components/certificate-viewer";
import { HeroFullscreen } from "@/components/hero-fullscreen";
import { SiteAudio } from "@/components/site-audio";
import { ProjectViewer } from "@/components/project-viewer";
import { ResumeViewer } from "@/components/resume-viewer";
import { CursorEffect } from "@/components/cursor";

function SectionKicker({ children }: { children: ReactNode }) {
  return <p className="mb-3 font-display text-[13px] font-semibold tracking-[0.16em] text-accent uppercase">{children}</p>;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-[clamp(34px,7.5vw,64px)] leading-[0.98] font-extrabold tracking-[-0.05em]">
      {children}
    </h2>
  );
}

function QrCodes() {
  return (
    <ul className="contact-qr-list">
      {qrCodes.map((code) => (
        <li key={code.label}>
          <a
            href={code.href}
            aria-label={code.action}
            className="contact-qr-card"
            {...(code.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            <img src={code.src} alt="" width={72} height={72} draggable={false} />
            <span className="contact-qr-label">{code.label}</span>
            <span className="contact-qr-hint">{code.hint}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
      <path
        d="M3 8h10M9.2 4.2 13 8l-3.8 3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TalkButton({ href, light = false, onClick }: { href: string; light?: boolean; onClick?: () => void }) {
  return (
    <a
      href={href}
      data-magnetic
      onClick={onClick}
      className={`inline-flex items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5 font-display text-[14.5px] font-semibold tracking-[-0.02em] whitespace-nowrap ${
        light ? "bg-white text-ink hover:bg-white/92" : "bg-accent text-[#1a0906] hover:bg-[#ff6a33]"
      }`}
    >
      <span>Let&apos;s Talk</span>
      <span
        className={`grid size-8 place-items-center rounded-full ${
          light ? "bg-accent text-white" : "bg-white text-[#e44712]"
        }`}
      >
        <Arrow />
      </span>
    </a>
  );
}

export function Portfolio() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<(typeof projects)[number] | null>(null);
  const [certificateCategory, setCertificateCategory] = useState<(typeof certificateCategories)[number]>("All");
  const [activeCertificate, setActiveCertificate] = useState<(typeof certificates)[number] | null>(null);
  const [current, setCurrent] = useState("#top");
  const visibleCertificates =
    certificateCategory === "All"
      ? certificates
      : certificates.filter((item) => item.category === certificateCategory);
  const activeCertificateIndex = activeCertificate
    ? visibleCertificates.findIndex((item) => item.id === activeCertificate.id)
    : -1;

  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let alive = true;
    let extraCleanup: (() => void) | undefined;

    const run = async () => {
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (!alive || !rootRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ctx = gsap.context(() => {
        if (!reduce) {
          gsap.from("[data-hero-line]", {
            y: 40,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "all",
          });

          const heroShell = rootRef.current?.querySelector<HTMLElement>(".hero-shell");
          const heroFrame = heroShell?.querySelector<HTMLElement>(".hero");
          const desktop = window.matchMedia("(min-width: 768px)").matches;
          if (desktop && heroShell && heroFrame) {
            gsap.timeline({
              scrollTrigger: {
                trigger: heroShell,
                start: "top top",
                end: "+=75%",
                scrub: 0.7,
                pin: heroShell,
                pinSpacing: true,
                anticipatePin: 1,
              },
            })
              .to(heroFrame, { scale: 0.94, borderRadius: 32, ease: "none" }, 0)
              .to(heroShell, { opacity: 0.5, ease: "none" }, 0);
          }

          gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
            if (element.closest("#about, #experience, #projects, #skills, #certificates, #contact")) return;
            gsap.from(element, {
              y: 36,
              autoAlpha: 0,
              duration: 0.95,
              ease: "power3.out",
              scrollTrigger: { trigger: element, start: "top 90%", toggleActions: "play none none none" },
            });
          });

          gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
            if (group.closest("#about, #experience, #projects, #skills, #certificates, #contact")) return;
            const items = group.querySelectorAll<HTMLElement>("[data-reveal-item]");
            if (!items.length) return;
            gsap.from(items, {
              y: 40,
              autoAlpha: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.08,
              scrollTrigger: { trigger: group, start: "top 88%", toggleActions: "play none none none" },
            });
          });

          const skillTitle = rootRef.current?.querySelector<HTMLElement>(".skills-panel-title");
          const skillCards = rootRef.current?.querySelectorAll<HTMLElement>(".skill-card");
          if (skillTitle) {
            gsap.from(skillTitle, {
              y: 28,
              autoAlpha: 0,
              duration: 0.8,
              ease: "power3.out",
              clearProps: "all",
              scrollTrigger: { trigger: "#skills", start: "top 82%", toggleActions: "play none none none" },
            });
          }
          if (skillCards?.length) {
            gsap.from(skillCards, {
              y: 36,
              autoAlpha: 0,
              duration: 0.75,
              ease: "power3.out",
              stagger: 0.08,
              clearProps: "all",
              scrollTrigger: { trigger: ".skills-panel-cards", start: "top 86%", toggleActions: "play none none none" },
            });
          }

          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
            gsap.to(element, {
              yPercent: -12,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            });
          });
        }

        const fine = window.matchMedia("(pointer: fine)").matches;
        if (fine && !reduce) {
          rootRef.current?.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((button) => {
            const xTo = gsap.quickTo(button, "x", { duration: 0.35, ease: "power3.out" });
            const yTo = gsap.quickTo(button, "y", { duration: 0.35, ease: "power3.out" });
            button.addEventListener("pointermove", (event) => {
              const rect = button.getBoundingClientRect();
              xTo((event.clientX - (rect.left + rect.width / 2)) * 0.28);
              yTo((event.clientY - (rect.top + rect.height / 2)) * 0.4);
            });
            button.addEventListener("pointerleave", () => {
              xTo(0);
              yTo(0);
            });
          });
        }
      }, rootRef);

      const refreshPins = () => {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      };
      document.addEventListener("fullscreenchange", refreshPins);
      document.addEventListener("webkitfullscreenchange", refreshPins);
      window.addEventListener("resize", refreshPins);

      extraCleanup = () => {
        document.removeEventListener("fullscreenchange", refreshPins);
        document.removeEventListener("webkitfullscreenchange", refreshPins);
        window.removeEventListener("resize", refreshPins);
      };
    };

    void run();
    return () => {
      alive = false;
      extraCleanup?.();
      ctx?.revert();
    };
  }, []);

  useEffect(() => {
    const links = nav.map((item) => document.querySelector(item.href)).filter(Boolean) as HTMLElement[];
    if (!("IntersectionObserver" in window)) return;
    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) {
          setCurrent(visible.target.id === "top" ? "#top" : `#${visible.target.id}`);
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.15, 0.4] },
    );
    links.forEach((section) => spy.observe(section));
    return () => spy.disconnect();
  }, []);

  useEffect(() => {
    const panel = rootRef.current?.querySelector<HTMLElement>(".skills-panel");
    if (!panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (event: PointerEvent) => {
      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(".skill-card");
      if (!card || !panel.contains(card)) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--sx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--sy", `${event.clientY - rect.top}px`);
    };
    panel.addEventListener("pointermove", move);
    return () => panel.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="w-full max-w-full overflow-x-hidden">
      <CursorEffect />
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:text-ink"
      >
        Skip to content
      </a>

      <div className="hero-shell">
        <header id="top" className="hero text-white">
          <div className="hero-background" aria-hidden="true">
            <picture>
              <source media="(max-width: 767.98px)" srcSet="/images/mobile%20version.png" />
              <img
                src="/images/Sunset%20Cruiser%20on%20a%20Rainy%20Road.png"
                alt=""
                width={1672}
                height={941}
                decoding="async"
                draggable={false}
              />
            </picture>
          </div>

          <div className="hero-effects" aria-hidden="true">
            <div className="hero-effects-desk absolute inset-0 bg-[linear-gradient(105deg,rgba(8,8,8,0.22)_0%,rgba(8,8,8,0.06)_28%,transparent_50%,rgba(8,8,8,0.08)_100%)]" />
            <div className="hero-effects-desk absolute inset-0 bg-[linear-gradient(to_top,rgba(8,8,8,0.28)_0%,transparent_26%)]" />
          </div>

          <div className="hero-ui">
            <nav className="hero-nav relative z-30 flex w-full items-center justify-between gap-3 px-5 pt-5 md:px-0 md:pt-0" aria-label="Primary">
              <div id="nav-links" className="hero-nav-center hidden items-center md:flex">
                {nav.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      aria-current={current === item.href ? "page" : undefined}
                      className="font-display text-[14px] font-medium tracking-[-0.01em] text-white aria-[current=page]:text-white"
                    >
                      {item.label}
                    </a>
                  ))}
              </div>

              <div className="hero-nav-right hidden items-center gap-8 md:flex">
                <TalkButton href="#contact" />
              </div>

              <button
                type="button"
                className={`grid size-11 place-items-center gap-[5px] rounded-full md:hidden ${open ? "fixed top-4 right-5 z-[60] bg-white/10" : "relative bg-white/10"}`}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((value) => !value)}
              >
                <span className={`block h-px w-4 bg-white transition ${open ? "translate-y-[3px] rotate-45" : ""}`} />
                <span className={`block h-px w-4 bg-white transition ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
              </button>
            </nav>

            {open ? (
              <div id="mobile-menu" className="fixed inset-0 z-50 flex flex-col bg-[#080808] px-8 pt-24 pb-10 text-white md:hidden">
                <div className="flex flex-1 flex-col justify-center gap-1">
                  {nav.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="font-display text-[clamp(36px,8vw,52px)] font-bold tracking-[-0.05em]"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
                <TalkButton href="#contact" onClick={() => setOpen(false)} />
              </div>
            ) : null}

            <div className="hero-content relative z-10 grid w-full flex-1 items-center gap-8 px-5 py-10 md:py-0">
              <div className="hero-intro">
                <p className="hero-kicker font-display text-[26px] font-semibold tracking-[-0.02em] text-white sm:text-[32px]">
                  <span data-hero-line className="block">Hey, I&apos;m Rohit</span>
                </p>
                <h1 className="hero-title mt-4 font-display text-[clamp(42px,7vw,86px)] font-extrabold leading-none tracking-[-0.055em] text-white sm:mt-5">
                  <span className="hero-title-line block overflow-hidden">
                    <span data-hero-line className="block">AI &amp; Digital</span>
                  </span>
                  <span className="hero-title-line block overflow-hidden">
                    <span data-hero-line className="block">Transformation</span>
                  </span>
                </h1>
                <p className="hero-founder text-[18px] font-medium tracking-[-0.01em] text-white sm:text-[22px]">
                  Founder &amp; AI Architect —{" "}
                  <a
                    href="https://engineeringthing.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent transition hover:text-white"
                  >
                    Engineering Thing AI
                  </a>
                </p>
              </div>
              <div className="hero-aside relative z-10 max-w-[340px] justify-self-start md:justify-self-end">
                <p className="hero-aside-lead">
                  Engineering intelligent solutions. Driving AI from vision to impact.
                </p>
                <p className="hero-aside-support">
                  Designing and delivering end-to-end AI—from strategy and solution architecture to intelligent automation, deployment, integration, and enterprise-scale transformation.
                </p>
              </div>
            </div>
          </div>
          <button type="button" className="hero-resume" onClick={() => setResumeOpen(true)}>
            <span className="hero-resume-label">Resume</span>
            <span className="hero-resume-action">View</span>
          </button>
          <div className="hero-controls">
            <SiteAudio />
            <HeroFullscreen />
            <Chatbot />
          </div>
        </header>
      </div>

      <ResumeViewer open={resumeOpen} onClose={() => setResumeOpen(false)} />
      <ProjectViewer project={activeProject} onClose={() => setActiveProject(null)} />
      <CertificateViewer
        certificate={activeCertificate}
        indexLabel={
          activeCertificateIndex >= 0 ? `${activeCertificateIndex + 1} / ${visibleCertificates.length}` : undefined
        }
        hasPrev={activeCertificateIndex > 0}
        hasNext={activeCertificateIndex >= 0 && activeCertificateIndex < visibleCertificates.length - 1}
        onPrev={() => {
          if (activeCertificateIndex > 0) setActiveCertificate(visibleCertificates[activeCertificateIndex - 1]);
        }}
        onNext={() => {
          if (activeCertificateIndex >= 0 && activeCertificateIndex < visibleCertificates.length - 1) {
            setActiveCertificate(visibleCertificates[activeCertificateIndex + 1]);
          }
        }}
        onClose={() => setActiveCertificate(null)}
      />

      <main className="bg-[#080808]">
        <section id="about" className="about-panel px-5 pt-8 pb-12 md:pt-8 md:pb-10">
          <div className="about-panel-grid grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(320px,1.05fr)] md:gap-x-[clamp(20px,2.4vw,36px)]">
            <div data-reveal className="about-panel-title">
              <SectionKicker>About / 01</SectionKicker>
              <SectionTitle>
                <span className="block">Building AI Experiences</span>
                <span className="block">That Create Real</span>
                <span className="block">Business Impact</span>
              </SectionTitle>
            </div>
            <div data-reveal className="about-panel-copy">
              <p className="font-display text-[clamp(22px,2.1vw,32px)] leading-[1.28] font-medium tracking-[-0.035em]">
                I turn complex AI challenges into scalable products people can actually use.
              </p>
              <ol className="about-points">
                <li>
                  <span>01 — Who I am</span>
                  <p>
                    Programme Manager for AI &amp; Digital Transformation at VLCC Healthcare. Founder &amp; AI Architect at{" "}
                    <a className="text-white hover:text-accent" href="https://engineeringthing.in/">
                      Engineering Thing AI
                    </a>
                    . 6+ years across analytics, engineering and product delivery. Delhi NCR.
                  </p>
                </li>
                <li>
                  <span>02 — What I build</span>
                  <p>
                    Production AI: LLM applications and RAG, predictive ML, real-time computer vision, and end-to-end product platforms — from solution architecture through deployment.
                  </p>
                </li>
                <li>
                  <span>03 — How I work</span>
                  <p>
                    At the intersection of product, engineering and stakeholders. I turn ambiguous requirements into clear technical goals and keep delivery on adoption, performance and business impact.
                  </p>
                </li>
                <li>
                  <span>04 — Impact</span>
                  <p>
                    Multi-location vision analytics, AI workforce and field systems, private local assistants, and reporting that reduces manual effort for decision-makers.
                  </p>
                </li>
              </ol>
              <ul data-stagger className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-[14.5px] text-muted">
                <li data-reveal-item><strong className="font-display font-semibold text-white">6+</strong> years</li>
                <li data-reveal-item><strong className="font-display font-semibold text-white">15+</strong> AI projects</li>
                <li data-reveal-item><strong className="font-display font-semibold text-white">M.Tech</strong> AI · NIET</li>
                <li data-reveal-item><strong className="font-display font-semibold text-white">B.Tech</strong> ECE · Jamia Hamdard</li>
                <li data-reveal-item><strong className="font-display font-semibold text-white">Delhi NCR</strong></li>
              </ul>
              <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
                <p className="text-[14.5px] text-muted">From idea to implementation.</p>
                <a
                  href="#projects"
                  data-magnetic
                  className="inline-flex items-center gap-3 rounded-full bg-accent py-1.5 pr-1.5 pl-5 font-display text-[14.5px] font-semibold tracking-[-0.02em] text-[#1a0906] hover:bg-[#ff6a33]"
                >
                  <span>Explore My Work</span>
                  <span className="grid size-8 place-items-center rounded-full bg-white text-[#e44712]">
                    <Arrow />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="page-spine" aria-hidden="true" />

        <section id="experience" className="experience-panel px-5 pt-8 pb-24 md:pt-8 md:pb-32">
          <div className="experience-panel-grid grid items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(320px,1.05fr)] md:gap-x-[clamp(20px,2.4vw,36px)]">
            <div data-reveal className="experience-panel-title">
              <SectionKicker>Experience / 02</SectionKicker>
              <SectionTitle>
                <span className="block">From engineering</span>
                <span className="block">to programme</span>
                <span className="block">leadership.</span>
              </SectionTitle>
            </div>
            <div data-reveal className="experience-panel-copy">
              <p className="font-display text-[clamp(22px,2.1vw,32px)] leading-[1.28] font-medium tracking-[-0.035em]">
                Four roles from 2019 to now — hands-on AI engineering through to programme leadership.
              </p>
              <ol className="experience-points">
                {roles.map((role) => (
                  <li key={role.company}>
                    <span>
                      {role.index} — {role.year}
                    </span>
                    <h3>{role.company}</h3>
                    <p>
                      {role.title}. {role.period}. {role.place}. {role.detail}
                    </p>
                  </li>
                ))}
              </ol>
              <ul data-stagger className="mt-8 grid gap-4 sm:grid-cols-2">
                {education.map((item) => (
                  <li key={item.title} data-reveal-item>
                    <strong className="block font-display text-[15px] font-semibold tracking-[-0.02em] text-white">{item.title}</strong>
                    <span className="mt-1 block text-[14px] text-muted">{item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="page-spine" aria-hidden="true" />

        <section id="projects" className="projects-panel px-5 pt-8 pb-24 md:pt-8 md:pb-32">
          <div className="projects-panel-grid">
            <div className="projects-panel-title text-center">
              <p className="font-display text-[13px] font-semibold tracking-[0.16em] text-accent uppercase">Projects / 03</p>
              <h2 className="mt-3 font-display text-[clamp(28px,3.4vw,48px)] leading-none font-extrabold tracking-[-0.05em]">
                Work with an operational consequence.
              </h2>
            </div>
            <div className="projects-panel-cards mt-10 grid gap-4 md:mt-12 md:grid-cols-3">
              {projects.map((project) => (
                <button
                  key={project.name}
                  type="button"
                  className="project-card"
                  onClick={() => setActiveProject(project)}
                >
                  <img className="project-card-image" src={project.image} alt="" />
                  <span className="project-card-index">{project.index}</span>
                  <h3>{project.name}</h3>
                  <p>{project.summary}</p>
                  <span className="project-card-role">{project.role}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="page-spine" aria-hidden="true" />

        <section className="skills-carousel" aria-label="Technology logos">
          <div className="skills-carousel-track">
            {[0, 1].map((copy) => (
              <ul key={copy} className="skills-carousel-group" aria-hidden={copy === 1}>
                {skillLogos.map((item, index) => (
                  <li
                    key={`${copy}-${item.name}`}
                    className="skills-carousel-item"
                    style={{ animationDelay: `${(index % 6) * -0.45}s` }}
                  >
                    <img src={item.src} alt="" className={item.invert ? "is-inverted" : undefined} />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>

        <section id="skills" className="skills-panel px-5 pt-8 pb-24 md:pt-8 md:pb-32">
          <div className="skills-panel-grid">
            <div className="skills-panel-title text-center">
              <p className="font-display text-[13px] font-semibold tracking-[0.16em] text-accent uppercase">Skills / 04</p>
              <h2 className="mt-3 font-display text-[clamp(28px,3.4vw,48px)] leading-none font-extrabold tracking-[-0.05em]">
                Tools shaped by delivery.
              </h2>
            </div>
            <ul className="skills-panel-cards">
              {skills.map((skill) => (
                <li key={skill.name} className="skill-card">
                  <span className="skill-card-index">#{skill.index}</span>
                  <h3>{skill.name}</h3>
                  <ul className="skill-card-tags">
                    {skill.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="page-spine" aria-hidden="true" />

        <section id="certificates" className="certificates-panel px-5 pt-8 pb-24 md:pt-8 md:pb-32">
          <div className="certificates-panel-grid">
            <div className="certificates-panel-title text-center">
              <h2 className="font-display text-[13px] font-semibold tracking-[0.16em] text-accent uppercase">Certificates / 05</h2>
            </div>
            <div className="certificate-filters" role="tablist" aria-label="Certificate categories">
              {certificateCategories.map((category) => {
                const count =
                  category === "All"
                    ? certificates.length
                    : certificates.filter((item) => item.category === category).length;
                const selected = certificateCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className="certificate-filter"
                    onClick={() => setCertificateCategory(category)}
                  >
                    {category}
                    <span>{count}</span>
                  </button>
                );
              })}
            </div>
            <ul className="certificates-panel-cards">
              {visibleCertificates.map((item) => (
                <li key={item.id}>
                  <button type="button" className="certificate-card" onClick={() => setActiveCertificate(item)}>
                    <span className="certificate-card-frame">
                      <img src={item.image} alt="" />
                    </span>
                    <span className="certificate-card-copy">
                      <span className="certificate-card-index">{item.category}</span>
                      <h3>{item.name}</h3>
                      <p>
                        {item.issuer}
                        {"issueDate" in item && item.issueDate ? ` · ${item.issueDate}` : ""}
                      </p>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="page-spine" aria-hidden="true" />

        <section id="contact" className="contact-panel px-5 pt-8 pb-0 md:pt-8">
          <p className="contact-watermark contact-watermark--panel" aria-hidden="true">
            Engineering Thing AI
          </p>
          <div className="contact-panel-grid">
            <div className="contact-panel-main">
              <div className="contact-panel-title">
                <p className="font-display text-[13px] font-semibold tracking-[0.16em] text-accent uppercase">Contact / 06</p>
                <h2 className="contact-hire">
                  Hire <span>me</span>
                </h2>
                <p className="contact-quote">
                  Do not hire a man who does your work for money, but him who does it for the love of it.
                </p>
              </div>

              <ul className="contact-icons" aria-label="Social profiles">
                {contactIcons.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                      <img src={item.src} alt="" />
                      <span className="contact-icon-name">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>

              <div className="contact-list-wrap">
                <p className="contact-watermark contact-watermark--list" aria-hidden="true">
                  <span>Engineering</span>
                  <span>Thing AI</span>
                </p>
                <ul className="contact-list">
                  {contacts.map((item) => (
                    <li key={item.kind + ("href" in item && item.href ? item.href : "")}>
                      {"links" in item && item.links ? (
                        <div className="contact-list-row">
                          <span>{item.kind}</span>
                          <strong className="contact-list-phones">
                            {item.links.map((link, index) => (
                              <span key={link.href}>
                                {index > 0 ? <span className="contact-list-sep">·</span> : null}
                                <a href={link.href}>{link.label}</a>
                              </span>
                            ))}
                          </strong>
                        </div>
                      ) : (
                        <a
                          href={item.href}
                          {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        >
                          <span>{item.kind}</span>
                          <strong>{item.label}</strong>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="contact-qr contact-qr--inline">
                <p className="contact-qr-handle">Scan or tap a code</p>
                <QrCodes />
              </div>
            </div>

            <aside className="contact-qr contact-qr--aside" aria-label="QR codes">
              <p className="contact-qr-handle">Scan or tap a code</p>
              <QrCodes />
            </aside>
          </div>

          <footer className="site-footer">
            <a href="#top" className="site-footer-brand">
              <span className="size-2 rounded-full bg-accent" />
              Rohit Gusain
            </a>
            <p className="site-footer-credit">
              Beautifully crafted with{" "}
              <span className="site-footer-heart" aria-label="love">
                ❤
              </span>{" "}
              by{" "}
              <a href="https://engineeringthing.in/" target="_blank" rel="noopener noreferrer">
                engineeringthing.in
              </a>
            </p>
          </footer>
        </section>
      </main>
    </div>
  );
}
