import { webServices } from "./web-services-data.js";
import { discordServices } from "./discord-services-data.js";
import { addToCart } from "./cart.js";

export const allServices = [...webServices, ...discordServices];

export function renderServiceCards(containerId, servicesList) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = servicesList.map(s => `
    <div class="card ${s.highlight ? 'featured' : ''}">
      <div class="card-icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.description}</p>
      <div style="font-size: 1.4rem; font-weight: 800; color: var(--accent-cyan); margin-bottom: 1rem;">
        ৳${s.price.toLocaleString()} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">BDT</span>
      </div>
      <ul class="card-features">
        ${s.features.map(f => `<li>${f}</li>`).join("")}
      </ul>
      <div style="display:flex; gap:8px; margin-top:auto;">
        <button class="btn btn-secondary add-cart-btn" data-id="${s.id}" style="flex:1; padding:0.75rem 0.5rem; font-size:0.85rem;">
          🛒 Add Cart
        </button>
        <a href="payment.html?plan=${s.id}" class="btn btn-primary" style="flex:1; padding:0.75rem 0.5rem; font-size:0.85rem;">
          Order Direct
        </a>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".add-cart-btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      const service = allServices.find(s => s.id === id);
      if (service) addToCart(service);
    };
  });
}

export function populateServiceDropdown(selectId, includeAllOption = false) {
  const select = document.getElementById(selectId);
  if (!select) return;

  let options = includeAllOption ? `<option value="General Service">General Service / All</option>` : "";

  options += `<optgroup label="Web Development">` +
    webServices.map(s => `<option value="${s.name}" data-plan="${s.id}" data-price="${s.price}">${s.name} — ৳${s.price.toLocaleString()} BDT</option>`).join("") +
    `</optgroup>`;

  options += `<optgroup label="Discord Bot Development">` +
    discordServices.map(s => `<option value="${s.name}" data-plan="${s.id}" data-price="${s.price}">${s.name} — ৳${s.price.toLocaleString()} BDT</option>`).join("") +
    `</optgroup>`;

  select.innerHTML = options;
}
