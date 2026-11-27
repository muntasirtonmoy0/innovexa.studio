/* =========================================================
   INNOVEXA STUDIO - CENTRALIZED DYNAMIC NAVBAR & FAVICON
   Clean URLs enabled for Vercel (/profile, /payment, etc.)
   ========================================================= */

// Set Browser Tab Favicon automatically across every page
(function setFavicon() {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  link.href = "/logo.png";
})();

const rawPath = window.location.pathname.split("/").pop().replace(/\.html$/, "") || "index";

const servicesAndProducts = [
  {
    name: "Web Development",
    desc: "Custom sites, landing pages & full-stack apps",
    href: "/web_service",
    slug: "web_service",
    icon: "🌐"
  },
  {
    name: "Discord Bots",
    desc: "Custom automation, moderation & economy bots",
    href: "/discord_service",
    slug: "discord_service",
    icon: "🤖"
  },
  {
    name: "App Making",
    desc: "Android & iOS mobile apps built for scale",
    href: "/app_service",
    slug: "app_service",
    icon: "📱"
  },
  {
    name: "Paid Promotion",
    desc: "Targeted server & social shoutout campaigns",
    href: "/promotion_service",
    slug: "promotion_service",
    icon: "📣"
  },
  {
    name: "Digital Marketing",
    desc: "SEO optimization, Google & Meta ad campaigns",
    href: "/marketing_service",
    slug: "marketing_service",
    icon: "📈"
  },
  {
    name: "Video Making & Editing",
    desc: "Full promo production & high-retention video edits",
    href: "/video_service",
    slug: "video_service",
    icon: "🎬"
  }
];

const isDropdownActive = servicesAndProducts.some(item => item.slug === rawPath);

const navbarHTML = `
  <nav class="navbar">
    <a href="/" class="nav-brand" style="display: inline-flex; align-items: center; gap: 10px;">
      <img
        src="/logo.png"
        alt="Innovexa Studio Logo"
        style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(56, 189, 248, 0.45); box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);"
      />
      <span>Innovexa Studio</span>
    </a>
    <ul class="nav-links">
      <li><a href="/" class="${rawPath === 'index' ? 'active' : ''}">Home</a></li>
      
      <li class="nav-dropdown" id="services-dropdown">
        <button type="button" class="nav-drop-trigger ${isDropdownActive ? 'active' : ''}">
          Services & Products <span class="drop-arrow">▾</span>
        </button>
        <div class="nav-dropdown-menu" style="max-height: 75vh; overflow-y: auto;">
          ${servicesAndProducts.map(item => `
            <a href="${item.href}" class="dropdown-item ${rawPath === item.slug ? 'active-item' : ''}">
              <span class="dropdown-icon">${item.icon}</span>
              <div class="dropdown-text">
                <div class="dropdown-title">${item.name}</div>
                <div class="dropdown-desc">${item.desc}</div>
              </div>
            </a>
          `).join("")}
        </div>
      </li>

      <li><a href="/gallery" class="${rawPath === 'gallery' ? 'active' : ''}">Gallery</a></li>
      <li><a href="/reviews" class="${rawPath === 'reviews' ? 'active' : ''}">Reviews</a></li>
      <li><a href="/support" class="${rawPath === 'support' ? 'active' : ''}">Support &amp; FAQ</a></li>
      <li><a href="/about" class="${rawPath === 'about' ? 'active' : ''}">About</a></li>
      <li class="auth-nav-slot"><button class="btn-nav">Sign In</button></li>
    </ul>
  </nav>
`;

const navPlaceholder = document.getElementById("navbar-placeholder");
if (navPlaceholder) {
  navPlaceholder.outerHTML = navbarHTML;
}

const dropdown = document.getElementById("services-dropdown");
if (dropdown) {
  const trigger = dropdown.querySelector(".nav-drop-trigger");
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("open");
  });
}
