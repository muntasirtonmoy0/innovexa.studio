/* =========================================================
   INNOVEXA STUDIO — HOMEPAGE SIDE-ENTRY PERSPECTIVE ANIMATION
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

  // 2. Side-Entry Perspective Observer for Cards & Section Titles
  const sideObserver = new IntersectionObserver(
    (entries, observer) => {
      let batchIndex = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const delay = batchIndex * 110;
        batchIndex++;

        setTimeout(() => {
          target.style.opacity = "1";
          target.style.transform =
            "perspective(1100px) translate3d(0, 0, 0) rotateY(0deg) scale(1)";

          // Clear inline transition once settled so 3D hover tilt stays instant
          setTimeout(() => {
            target.style.transition = "";
          }, 850);
        }, delay);

        observer.unobserve(target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -30px 0px"
    }
  );

  function bindSideEntryAnimations() {
    // Animate grid cards alternating from left and right sides with 3D perspective
    document.querySelectorAll(".grid").forEach((grid) => {
      const cards = grid.querySelectorAll(".card");
      cards.forEach((card, index) => {
        if (card.dataset.sideBound) return;
        card.dataset.sideBound = "true";

        // Left cards enter from left (-85px), right cards from right (+85px), middle card subtle right/left sweep
        const fromLeft = index % 2 === 0;
        const startX = fromLeft ? -85 : 85;
        const startRotateY = fromLeft ? 14 : -14;

        card.style.opacity = "0";
        card.style.transform = `perspective(1100px) translate3d(${startX}px, 18px, -40px) rotateY(${startRotateY}deg) scale(0.95)`;
        card.style.transition =
          "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)";
        sideObserver.observe(card);
      });
    });

    // Animate standalone section titles & bottom assurance card
    document
      .querySelectorAll(".section-title, .container > .card")
      .forEach((el, idx) => {
        if (el.dataset.sideBound) return;
        el.dataset.sideBound = "true";

        const startX = idx % 2 === 0 ? -55 : 55;
        el.style.opacity = "0";
        el.style.transform = `perspective(1100px) translate3d(${startX}px, 14px, 0) scale(0.97)`;
        el.style.transition =
          "opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)";
        sideObserver.observe(el);
      });
  }

  bindSideEntryAnimations();

  // Re-bind automatically when Firestore loads live gallery cards into #home-gallery-preview
  const homeGallery = document.getElementById("home-gallery-preview");
  if (homeGallery) {
    const mutObs = new MutationObserver(() => bindSideEntryAnimations());
    mutObs.observe(homeGallery, { childList: true });
  }

  // 3. Smooth Hero Parallax & Scroll Progress Loop (60fps)
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
      const translateY = scrollTop * 0.22;
      const opacity = Math.max(0.18, 1 - scrollTop / 640);
      heroSection.style.transform = `translateY(${translateY}px)`;
      heroSection.style.opacity = opacity.toFixed(3);
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
