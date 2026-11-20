/* =========================================================
   INNOVEXA STUDIO — HOMEPAGE SCROLL-SCRUBBED SIDE PERSPECTIVE
   Applies exclusively to index.html
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const trackedItems = [];

  // Register cards and section headings with alternating left/right start offsets
  function registerScrollItems() {
    document.querySelectorAll(".grid").forEach((grid) => {
      const cards = grid.querySelectorAll(".card");
      cards.forEach((card, index) => {
        if (card.dataset.scrubBound) return;
        card.dataset.scrubBound = "true";

        const fromLeft = index % 2 === 0;
        trackedItems.push({
          el: card,
          startX: fromLeft ? -160 : 160,
          startY: 45,
          startRotateY: fromLeft ? 22 : -22,
          settled: false
        });
      });
    });

    document
      .querySelectorAll(".section-title, .container > .card")
      .forEach((el, idx) => {
        if (el.dataset.scrubBound) return;
        el.dataset.scrubBound = "true";

        const fromLeft = idx % 2 === 0;
        trackedItems.push({
          el,
          startX: fromLeft ? -110 : 110,
          startY: 30,
          startRotateY: fromLeft ? 10 : -10,
          settled: false
        });
      });
  }

  registerScrollItems();

  // Watch for live Firestore gallery cards on homepage
  const homeGallery = document.getElementById("home-gallery-preview");
  if (homeGallery) {
    const mutObs = new MutationObserver(() => {
      registerScrollItems();
      updateScrollScrub();
    });
    mutObs.observe(homeGallery, { childList: true });
  }

  const heroSection = document.querySelector(".hero");
  const ambientGlow = document.querySelector(".ambient-glow");
  let ticking = false;

  // Smooth ease-out curve for natural deceleration as boxes lock in
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateScrollScrub() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const vh = window.innerHeight;

    // 1. Hero subtle downward parallax & fade
    if (heroSection && scrollTop < 850) {
      const translateY = scrollTop * 0.24;
      const opacity = Math.max(0.15, 1 - scrollTop / 680);
      heroSection.style.transform = `translateY(${translateY}px)`;
      heroSection.style.opacity = opacity.toFixed(3);
    }

    if (ambientGlow) {
      ambientGlow.style.transform = `translateX(-50%) translateY(${scrollTop * 0.16}px)`;
    }

    // 2. Scroll-scrubbed side-to-center glide (requires deeper scrolling to settle)
    trackedItems.forEach((item) => {
      if (item.settled) return;

      const rect = item.el.getBoundingClientRect();

      // Starts entering when element top hits 98% of viewport height;
      // finishes settling only after user scrolls it up to 34% of viewport height
      const startPoint = vh * 0.98;
      const endPoint = vh * 0.34;
      const rawProgress = (startPoint - rect.top) / (startPoint - endPoint);
      const clamped = Math.max(0, Math.min(1, rawProgress));
      const eased = easeOutCubic(clamped);

      const currentX = item.startX * (1 - eased);
      const currentY = item.startY * (1 - eased);
      const currentRotY = item.startRotateY * (1 - eased);
      const currentScale = 0.92 + 0.08 * eased;
      const currentOpacity = Math.min(1, eased * 1.25);

      if (clamped >= 1) {
        item.settled = true;
        item.el.style.opacity = "1";
        item.el.style.transform =
          "perspective(1100px) translate3d(0px, 0px, 0px) rotateY(0deg) scale(1)";
      } else {
        item.el.style.opacity = currentOpacity.toFixed(3);
        item.el.style.transform = `perspective(1100px) translate3d(${currentX.toFixed(1)}px, ${currentY.toFixed(1)}px, 0px) rotateY(${currentRotY.toFixed(2)}deg) scale(${currentScale.toFixed(3)})`;
      }
    });

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollScrub);
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    updateScrollScrub();
  });

  // Initial positioning pass on page load
  updateScrollScrub();
});
