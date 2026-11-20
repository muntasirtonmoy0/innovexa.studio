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
    boxShadow: "0 0 12px rgba(56, 189, 248, 0.8)",
    zIndex: "99998",
    pointerEvents: "none",
    transition: "width 0.1s ease-out"
  });
  document.body.appendChild(progressBar);

  // 2. Staggered Scroll Reveal for Homepage Cards & Headings
  function setupStaggerObserver() {
    const cards = document.querySelectorAll(
      ".grid > .card, .section-title"
    );

    cards.forEach((el) => {
      if (el.dataset.staggerReady) return;
      el.dataset.staggerReady = "true";
      el.style.opacity = "0";
      el.style.transform = "translateY(36px) scale(0.96)";
      el.style.transition =
        "opacity 0.72s cubic-bezier(0.16, 1, 0.3, 1), transform 0.72s cubic-bezier(0.16, 1, 0.3, 1)";
      staggerObserver.observe(el);
    });
  }

  const staggerObserver = new IntersectionObserver(
    (entries, observer) => {
      let batchIndex = 0;
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const target = entry.target;
        const delay = batchIndex * 110; // 110ms cascade delay per card in row
        batchIndex++;

        setTimeout(() => {
          target.style.opacity = "1";
          target.style.transform = "translateY(0) scale(1)";

          // Clean up inline transition after entrance so 3D hover tilt stays snappy
          setTimeout(() => {
            target.style.transition = "";
          }, 750);
        }, delay);

        observer.unobserve(target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  setupStaggerObserver();

  // Watch for dynamically loaded Firestore gallery preview cards on homepage
  const homeGallery = document.getElementById("home-gallery-preview");
  if (homeGallery) {
    const mutationObs = new MutationObserver(() => {
      setupStaggerObserver();
    });
    mutationObs.observe(homeGallery, { childList: true });
  }

  // 3. Smooth Hero Depth Parallax & Progress Bar Loop (60fps)
  const heroSection = document.querySelector(".hero");
  const ambientGlow = document.querySelector(".ambient-glow");
  let ticking = false;

  function onScrollFrame() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;

    // Update top neon scroll bar
    if (docHeight > 0) {
      const percent = Math.min(100, (scrollTop / docHeight) * 100);
      progressBar.style.width = `${percent}%`;
    }

    // Hero parallax drift & soft fade out as user scrolls down
    if (heroSection && scrollTop < 750) {
      const translateY = scrollTop * 0.24;
      const opacity = Math.max(0.18, 1 - scrollTop / 620);
      heroSection.style.transform = `translateY(${translateY}px)`;
      heroSection.style.opacity = opacity.toFixed(3);
    }

    // Ambient glow depth shift
    if (ambientGlow) {
      ambientGlow.style.transform = `translateX(-50%) translateY(${scrollTop * 0.15}px)`;
    }

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScrollFrame);
        ticking = true;
      }
    },
    { passive: true }
  );
});
