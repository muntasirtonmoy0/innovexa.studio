/* =========================================================
   INNOVEXA STUDIO - CENTRALIZED DYNAMIC NAVBAR COMPONENT
   Edit links/products here once to sync across all pages!
   ========================================================= */

const currentPage = window.location.pathname.split("/").pop() || "index.html";

// Define your dropdown items here (Add future services/products easily!)
const servicesAndProducts = [
  {
    name: "Web Development",
    desc: "Custom sites, landing pages & full-stack apps",
    href: "web_service.html",
    icon: "🌐"
  },
  {
    name: "Discord Bots",
    desc: "Custom automation, moderation & economy bots",
    href: "discord_service.html",
    icon: "🤖"
  }
  // Future example:
  // { name: "Minecraft Plugins", desc: "Custom Paper/Spigot plugins", href: "mc_plugins.html", icon: "⚔️" }
];

const isDropdownActive = servicesAndProducts.some(item => item.href === currentPage);

const navbarHTML = `
  <nav class="navbar">
    <a href="index.html" class="nav-brand">
      <span class="brand-dot"></span>Innovexa Studio
    </a>
    <ul class="nav-links">
      <li><a href="index.html" class="${currentPage === 'index.html' ? 'active' : ''}">Home</a></li>
      
      <!-- Hover Dropdown for Services & Products -->
      <li class="nav-dropdown" id="services-dropdown">
        <button type="button" class="nav-drop-trigger ${isDropdownActive ? 'active' : ''}">
          Services & Products <span class="drop-arrow">▾</span>
        </button>
        <div class="nav-dropdown-menu">
          ${servicesAndProducts.map(item => `
            <a href="${item.href}" class="dropdown-item ${currentPage === item.href ? 'active-item' : ''}">
              <span class="dropdown-icon">${item.icon}</span>
              <div class="dropdown-text">
                <div class="dropdown-title">${item.name}</div>
                <div class="dropdown-desc">${item.desc}</div>
              </div>
            </a>
          `).join("")}
        </div>
      </li>

      <li><a href="gallery.html" class="${currentPage === 'gallery.html' ? 'active' : ''}">Gallery</a></li>
      <li><a href="reviews.html" class="${currentPage === 'reviews.html' ? 'active' : ''}">Reviews</a></li>
      <li class="auth-nav-slot"><button class="btn-nav">Sign In</button></li>
    </ul>
  </nav>
`;

// Inject navbar into the placeholder
const navPlaceholder = document.getElementById("navbar-placeholder");
if (navPlaceholder) {
  navPlaceholder.outerHTML = navbarHTML;
}

// Mobile tap support for the dropdown menu
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
