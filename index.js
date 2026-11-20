/* =========================================================
   INNOVEXA STUDIO — HOMEPAGE SCROLL CHOREOGRAPHY & PARALLAX
   Applies exclusively to index.html
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Top Glowing Scroll Progress Bar
  const progressBar = document.createElement("div");
  progressBar.id = "home-scroll-progress";
  Object.assign(progressBar.style, {
    position: "fixed",
    top: "0",
    left: "0",
    height: "3px",
    width: "0%",
    background: "linear-gradient(90deg, #38bdf8, #818cf8, #34d399)",
    boxShadow: "0 0 12px rgba(56, 189, 248, 0.85)",
    zIndex: "99998",
    pointerEvents: "none",
    transition: "width 0.1s ease-out"
  });
  document.body.appendChild(progressBar);

  // 2. Smooth Scroll for the Hero "Scroll" Cue
  const scrollCue = document.getElementById("hero-scroll-cue");
  if (scrollCue) {
    scrollCue.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.getElementById("what-we-do");
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // 3. Staggered 3D Entrance Reveal for Homepage Cards & Headings
  const staggerObserver = new IntersectionObserver(
    (entries, observer) => {
      let batchIndex = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const delay = batchIndex * 115; // 115ms cascade per item
        batchIndex++;

        setTimeout(() => {
          target.style.opacity = "1";
          target.style.transform = "perspective(1000px) rotateX(0deg) translateY(0) scale(1)";

          // Restore fast hover transition after entrance completes
          setTimeout(() => {
            target.style.transition = "";
          }, 800);
        }, delay);

        observer.unobserve(target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -30px 0px"
    }
  );

  function bindStaggerElements() {
    const targets = document.querySelectorAll(
      ".grid > .card, .section-title, .container > .card"
    );

    targets.forEach((el) => {
      if (el.dataset.scrollBound) return;
      el.dataset.scrollBound = "true";
      el.style.opacity = "0";
      el.style.transform = "perspective(1000px) rotateX(8deg) translateY(42px) scale(0.95)";
      el.style.transition =
        "opacity 0.78s cubic-bezier(0.16, 1, 0.3, 1), transform 0.78s cubic-bezier(0.16, 1, 0.3, 1)";
      staggerObserver.observe(el);
    });
  }

  bindStaggerElements();

  // Watch for live Firestore gallery cards on homepage
  const homeGallery = document.getElementById("home-gallery-preview");
  if (homeGallery) {
    const mutObs = new MutationObserver(() => bindStaggerElements());
    mutObs.observe(homeGallery, { childList: true });
  }

  // 4. Smooth Hero Parallax & Progress Bar Loop (60fps)
  const heroSection = document.querySelector(".hero");
  const ambientGlow = document.querySelector(".ambient-glow");
  let ticking = false;

  function updateScrollEffects() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (docHeight > 0) {
      const percent = Math.min(100, (scrollTop / docHeight) * 100);
      progressBar.style.width = `${percent}%`;
    }

    if (heroSection && scrollTop < 780) {
      const translateY = scrollTop * 0.24;
      const opacity = Math.max(0.15, 1 - scrollTop / 640);
      heroSection.style.transform = `translateY(${translateY}px)`;
      heroSection.style.opacity = opacity.toFixed(3);
    }

    if (scrollCue) {
      scrollCue.style.opacity = Math.max(0, 1 - scrollTop / 180).toFixed(2);
    }

    if (ambientGlow) {
      ambientGlow.style.transform = `translateX(-50%) translateY(${scrollTop * 0.16}px)`;
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    },
    { passive: true }
  );
});
