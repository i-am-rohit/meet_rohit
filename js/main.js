(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const root = document.documentElement;

  const glow = document.querySelector(".cursor-glow");
  const visual = document.querySelector(".hero__visual");
  const sculpture = document.querySelector(".hero__sculpture");
  const canvas = document.querySelector(".hero__particles");
  const hero = document.querySelector(".hero");
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");

  if (finePointer) root.classList.add("has-pointer");

  /* Cursor glow */
  if (glow && finePointer && !reduce) {
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let cx = gx;
    let cy = gy;

    window.addEventListener("pointermove", (event) => {
      gx = event.clientX;
      gy = event.clientY;
    }, { passive: true });

    const drawGlow = () => {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(drawGlow);
    };
    drawGlow();
  }

  /* Magnetic buttons */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach((button) => {
      button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        button.style.setProperty("--mx", `${x * 0.28}px`);
        button.style.setProperty("--my", `${y * 0.4}px`);
      });
      button.addEventListener("pointerleave", () => {
        button.style.setProperty("--mx", "0px");
        button.style.setProperty("--my", "0px");
      });
    });
  }

  /* Hero sculpture parallax */
  if (sculpture && visual && finePointer && !reduce) {
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      tx = (event.clientX - rect.left) / rect.width - 0.5;
      ty = (event.clientY - rect.top) / rect.height - 0.5;
    }, { passive: true });

    hero.addEventListener("pointerleave", () => {
      tx = 0;
      ty = 0;
    });

    const tilt = () => {
      if (window.innerWidth > 980) {
        x += (tx - x) * 0.07;
        y += (ty - y) * 0.07;
        sculpture.style.transform = `translate3d(${x * -12}px, ${y * -8}px, 0) rotateX(${y * -2.5}deg) rotateY(${x * 3.5}deg)`;
      } else {
        sculpture.style.transform = "none";
      }
      requestAnimationFrame(tilt);
    };
    tilt();

    const onScroll = () => {
      if (window.innerWidth <= 980) {
        visual.style.setProperty("--scroll-y", "0px");
        return;
      }
      const rect = hero.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        visual.style.setProperty("--scroll-y", `${window.scrollY * 0.08}px`);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Neural particles */
  if (canvas && hero && !reduce) {
    const ctx = canvas.getContext("2d");
    const particles = [];
    const count = 42;
    let width = 0;
    let height = 0;
    let mx = -9999;
    let my = -9999;
    let running = true;
    let frame = 0;

    const reset = (p) => {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
      p.vx = (Math.random() - 0.5) * 0.28;
      p.vy = (Math.random() - 0.5) * 0.28;
      p.r = Math.random() * 1.4 + 0.4;
    };

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!particles.length) {
        for (let i = 0; i < count; i += 1) {
          const p = {};
          reset(p);
          particles.push(p);
        }
      }
    };

    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      mx = event.clientX - rect.left;
      my = event.clientY - rect.top;
    }, { passive: true });

    const step = () => {
      if (!running) {
        frame = 0;
        return;
      }
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 140 && dist > 0) {
          p.vx += (dx / dist) * 0.015;
          p.vy += (dy / dist) * 0.015;
        }
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10 || p.x > width + 10 || p.y < -10 || p.y > height + 10) reset(p);

        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 130) {
            ctx.strokeStyle = `rgba(255, 186, 140, ${0.16 * (1 - d / 130)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = "rgba(255, 214, 186, 0.75)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(step);
    };

    const watch = new IntersectionObserver((entries) => {
      running = entries[0].isIntersecting;
      if (running && !frame) step();
    }, { threshold: 0.05 });

    resize();
    watch.observe(hero);
    window.addEventListener("resize", resize);
    if (!frame) step();
  }

  /* Scroll reveals */
  const revealItems = document.querySelectorAll(".reveal");
  if (reduce) {
    revealItems.forEach((item) => item.classList.add("is-in"));
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-in"));
  }

  /* Active section */
  const navAnchors = Array.from(document.querySelectorAll(".nav__links a"));
  const sections = navAnchors
    .map((anchor) => document.querySelector(anchor.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navAnchors.forEach((anchor) => {
          if (anchor.getAttribute("href") === id) {
            anchor.setAttribute("aria-current", "page");
          } else {
            anchor.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0.01 });
    sections.forEach((section) => spy.observe(section));
  }

  /* Mobile menu */
  const setMenu = (open) => {
    if (!toggle || !links) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.querySelectorAll("a").forEach((anchor) => {
      anchor.addEventListener("click", () => setMenu(false));
    });
    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
  }
})();
