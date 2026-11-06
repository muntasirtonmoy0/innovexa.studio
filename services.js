import { webServices } from "./web-services-data.js";
import { discordServices } from "./discord-services-data.js";

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
        $${s.price} <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: normal;">USD</span>
      </div>
      <ul class="card-features">
        ${s.features.map(f => `<li>${f}</li>`).join("")}
      </ul>
      <a href="payment.html?plan=${s.id}" class="btn btn-primary" style="width: 100%;">Order Now</a>
    </div>
  `).join("");
}

export function populateServiceDropdown(selectId, includeAllOption = false) {
  const select = document.getElementById(selectId);
  if (!select) return;

  let options = includeAllOption ? `<option value="General Service">General Service / All</option>` : "";

  options += `<optgroup label="Web Development">` +
    webServices.map(s => `<option value="${s.name}" data-plan="${s.id}" data-price="${s.price}">${s.name} — $${s.price}</option>`).join("") +
    `</optgroup>`;

  options += `<optgroup label="Discord Bot Development">` +
    discordServices.map(s => `<option value="${s.name}" data-plan="${s.id}" data-price="${s.price}">${s.name} — $${s.price}</option>`).join("") +
    `</optgroup>`;

  select.innerHTML = options;
}
