/* =========================================================
   INNOVEXA STUDIO — HOMEPAGE 3D BANNER + SCROLL-SCRUBBED BOXES
   Applies exclusively to index.html
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================
  // 1. 3D MOUSE-TRACKING ROTATION FOR ANIMATED VIDEO BANNER
  // =========================================================
  const bannerCard = document.getElementById("hero-3d-banner");
  const bannerVideo = bannerCard ? bannerCard.querySelector("video") : null;

  if (bannerVideo) {
    bannerVideo.play().catch(() => {});
  }

  const bannerState = {
    targetRotX: 0,
    targetRotY: 0,
    targetShiftX: 0,
    targetShiftY: 0,
    currRotX: 0,
    currRotY: 0,
    currShiftX: 0,
    currShiftY: 0
  };

  window.addEventListener(
    "mousemove",
    (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;

      // Mouse moves right -> rotates right (+rotateY); mouse moves up/down -> tilts in 3D (rotateX)
      bannerState.targetRotY = normX * 24;
      bannerState.targetRotX = -normY * 18;
      bannerState.targetShiftX = normX * 26;
      bannerState.targetShiftY = normY * 18;
    },
    { passive: true }
  );

  window.addEventListener("mouseleave", () => {
    bannerState.targetRotX = 0;
    bannerState.targetRotY = 0;
    bannerState.targetShiftX = 0;
    bannerState.targetShiftY = 0;
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        const normX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        const normY = (e.touches[0].clientY / window.innerHeight) * 2 - 1;
        bannerState.targetRotY = normX * 22;
        bannerState.targetRotX = -normY * 16;
      }
    },
    { passive: true }
  );

  function animateBanner3D() {
    if (bannerCard) {
      bannerState.currRotX += (bannerState.targetRotX - bannerState.currRotX) * 0.08;
      bannerState.currRotY += (bannerState.targetRotY - bannerState.currRotY) * 0.08;
      bannerState.currShiftX += (bannerState.targetShiftX - bannerState.currShiftX) * 0.08;
      bannerState.currShiftY += (bannerState.targetShiftY - bannerState.currShiftY) * 0.08;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollScale = Math.max(0.86, 1 - scrollTop / 3200);
      const scrollOpacity = Math.max(0.1, 0.44 - scrollTop / 2400);

      bannerCard.style.opacity = scrollOpacity.toFixed(3);
      bannerCard.style.transform = `translate3d(${bannerState.currShiftX.toFixed(2)}px, ${bannerState.currShiftY.toFixed(2)}px, 0px) rotateX(${bannerState.currRotX.toFixed(2)}deg) rotateY(${bannerState.currRotY.toFixed(2)}deg) scale(${scrollScale.toFixed(3)})`;
    }

    requestAnimationFrame(animateBanner3D);
  }
  animateBanner3D();

  // =========================================================
  // 2. LENGTHY SCROLL-SCRUBBED SIDE PERSPECTIVE FOR BOXES
  // =========================================================
  const trackedItems = [];

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

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateScrollScrub() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const vh = window.innerHeight;

    if (heroSection && scrollTop < 850) {
      const translateY = scrollTop * 0.24;
      const opacity = Math.max(0.15, 1 - scrollTop / 680);
      heroSection.style.transform = `translateY(${translateY}px)`;
      heroSection.style.opacity = opacity.toFixed(3);
    }

    if (ambientGlow) {
      ambientGlow.style.transform = `translateX(-50%) translateY(${scrollTop * 0.16}px)`;
    }

    trackedItems.forEach((item) => {
      if (item.settled) return;

      const rect = item.el.getBoundingClientRect();
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

  window.addEventListener("resize", updateScrollScrub);
  updateScrollScrub();
});
