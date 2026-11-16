import { webServices } from "./web-services-data.js";
import { discordServices } from "./discord-services-data.js";
import { appServices } from "./app-services-data.js";
import { promotionServices } from "./promotion-services-data.js";
import { marketingServices } from "./marketing-services-data.js";
import { videoServices } from "./video-services-data.js";
import { addToCart } from "./cart.js";
import { db } from "./firebase-config.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

export const allServices = [
  ...webServices,
  ...discordServices,
  ...appServices,
  ...promotionServices,
  ...marketingServices,
  ...videoServices
];

let serviceOverrides = {};
let activeRenders = [];
let activeDropdowns = [];

onSnapshot(collection(db, "service_overrides"), (snap) => {
  serviceOverrides = {};
  snap.forEach(d => {
    serviceOverrides[d.id] = d.data();
  });
  activeRenders.forEach(r => drawCards(r.containerId, r.servicesList));
  activeDropdowns.forEach(d => drawDropdown(d.selectId, d.includeAllOption));
});

export function getEnrichedService(service) {
  const ov = serviceOverrides[service.id] || {};
  const stockCount = ov.stockCount !== undefined ? Number(ov.stockCount) : 10;
  const inStock = (ov.inStock !== false) && (stockCount > 0);
  const discountPercent = Number(ov.discountPercent) || 0;
  const finalPrice = discountPercent > 0
    ? Math.round(service.price * (1 - discountPercent / 100))
    : service.price;

  return {
    ...service,
    stockCount,
    inStock,
    discountPercent,
    originalPrice: service.price,
    price: finalPrice
  };
}

export function renderServiceCards(containerId, servicesList) {
  if (!activeRenders.some(r => r.containerId === containerId)) {
    activeRenders.push({ containerId, servicesList });
  }
  drawCards(containerId, servicesList);
}

function drawCards(containerId, servicesList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = servicesList.map(raw => {
    const s = getEnrichedService(raw);

    let stockBadge = "";
    if (!s.inStock) {
      stockBadge = `<span style="font-size:0.72rem; padding:0.2rem 0.55rem; border-radius:99px; background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); font-weight:600;">● Out of Stock (0)</span>`;
    } else if (s.stockCount <= 3) {
      stockBadge = `<span style="font-size:0.72rem; padding:0.2rem 0.55rem; border-radius:99px; background:rgba(251,191,36,0.15); color:#fbbf24; border:1px solid rgba(251,191,36,0.35); font-weight:600;">● Only ${s.stockCount} Left</span>`;
    } else {
      stockBadge = `<span style="font-size:0.72rem; padding:0.2rem 0.55rem; border-radius:99px; background:rgba(52,211,153,0.12); color:#34d399; border:1px solid rgba(52,211,153,0.3); font-weight:600;">● In Stock (${s.stockCount})</span>`;
    }

    const discountBadge = s.discountPercent > 0
      ? `<span style="font-size:0.72rem; padding:0.2rem 0.55rem; border-radius:99px; background:rgba(56,189,248,0.15); color:var(--accent-cyan); border:1px solid rgba(56,189,248,0.35); font-weight:700;">${s.discountPercent}% OFF</span>`
      : ``;

    const priceMarkup = s.discountPercent > 0
      ? `<span style="text-decoration:line-through; color:var(--text-muted); font-size:0.95rem; font-weight:500; margin-right:6px;">৳${s.originalPrice.toLocaleString()}</span> ৳${s.price.toLocaleString()}`
      : `৳${s.price.toLocaleString()}`;

    const actionButtons = s.inStock
      ? `
        <div style="display:flex; gap:8px; margin-top:auto;">
          <button class="btn btn-secondary add-cart-btn" data-id="${s.id}" style="flex:1; padding:0.75rem 0.5rem; font-size:0.85rem;">
            🛒 Add Cart
          </button>
          <a href="payment.html?plan=${s.id}" class="btn btn-primary" style="flex:1; padding:0.75rem 0.5rem; font-size:0.85rem;">
            Order Direct
          </a>
        </div>
      `
      : `
        <button disabled class="btn btn-secondary" style="width:100%; margin-top:auto; opacity:0.5; cursor:not-allowed;">
          Currently Out of Stock
        </button>
      `;

    return `
      <div class="card ${s.highlight ? 'featured' : ''}" style="${!s.inStock ? 'opacity:0.78;' : ''}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
          <div class="card-icon" style="margin-bottom:0;">${s.icon}</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; justify-content:flex-end;">
            ${discountBadge}
            ${stockBadge}
          </div>
        </div>
        <h3>${s.name}</h3>
        <p>${s.description}</p>
        <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 1rem;">
          ${priceMarkup} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">BDT</span>
        </div>
        <ul class="card-features">
          ${s.features.map(f => `<li>${f}</li>`).join("")}
        </ul>
        ${actionButtons}
      </div>
    `;
  }).join("");

  container.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      const raw = allServices.find(s => s.id === id);
      if (raw) {
        const enriched = getEnrichedService(raw);
        if (!enriched.inStock) {
          alert("Sorry, this item is currently out of stock.");
          return;
        }
        addToCart(enriched);
      }
    };
  });
}

export function populateServiceDropdown(selectId, includeAllOption = false) {
  if (!activeDropdowns.some(d => d.selectId === selectId)) {
    activeDropdowns.push({ selectId, includeAllOption });
  }
  drawDropdown(selectId, includeAllOption);
}

function drawDropdown(selectId, includeAllOption) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const prevValue = select.value;
  const groups = [
    { label: "Web Development", items: webServices },
    { label: "Discord Bot Development", items: discordServices },
    { label: "App Making", items: appServices },
    { label: "Paid Promotion", items: promotionServices },
    { label: "Digital Marketing", items: marketingServices },
    { label: "Video Making & Editing", items: videoServices }
  ];

  let options = includeAllOption ? `<option value="General Service">General Service / All</option>` : "";

  options += groups.map(g => `
    <optgroup label="${g.label}">
      ${g.items.map(raw => {
        const s = getEnrichedService(raw);
        const tag = !s.inStock
          ? " [OUT OF STOCK]"
          : ` [${s.stockCount} in stock${s.discountPercent > 0 ? ` • ${s.discountPercent}% OFF` : ""}]`;
        return `<option value="${s.name}" data-plan="${s.id}" data-price="${s.price}" ${!s.inStock ? 'disabled' : ''}>${s.name} — ৳${s.price.toLocaleString()} BDT${tag}</option>`;
      }).join("")}
    </optgroup>
  `).join("");

  select.innerHTML = options;
  if (prevValue) select.value = prevValue;
  select.dispatchEvent(new Event("change"));
}
