/* =========================================================
   INNOVEXA STUDIO - SHOPPING CART SYSTEM
   ========================================================= */

const CART_KEY = "innovexa_cart_items";

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

export function addToCart(service) {
  const cart = getCart();
  const existing = cart.find(item => item.id === service.id);
  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      id: service.id,
      name: service.name,
      price: service.price,
      quantity: 1
    });
  }
  saveCart(cart);
  openCartDrawer();
}

export function removeFromCart(serviceId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== serviceId);
  saveCart(cart);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartUI();
}

export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
}

// Inject Floating Cart Button & Side Drawer UI
const drawerHTML = `
<!-- Floating Cart Trigger Button -->
<button id="cart-floating-btn" title="View Cart" style="position:fixed; bottom:24px; right:24px; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg, #38bdf8, #2563eb); border:none; color:#fff; font-size:1.35rem; cursor:pointer; box-shadow:0 6px 24px rgba(56,189,248,0.4); z-index:9990; display:flex; align-items:center; justify-content:center; transition:transform 0.2s;">
  🛒
  <span id="cart-badge" style="position:absolute; top:-3px; right:-3px; background:#ef4444; color:#fff; font-size:0.72rem; font-weight:700; width:20px; height:20px; border-radius:50%; display:none; align-items:center; justify-content:center; border:2px solid #07080c;">0</span>
</button>

<!-- Cart Side Drawer Overlay -->
<div id="cart-drawer-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(6px); z-index:9998;"></div>

<!-- Cart Side Drawer -->
<div id="cart-drawer" style="position:fixed; top:0; right:-420px; width:100%; max-width:400px; height:100vh; background:#0e1017; border-left:1px solid rgba(255,255,255,0.1); z-index:9999; display:flex; flex-direction:column; transition:right 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow:-10px 0 30px rgba(0,0,0,0.5);">
  <div style="padding:1.4rem; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
    <h3 style="font-size:1.2rem; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px;">
      <span>🛒</span> Your Cart
    </h3>
    <button id="cart-close-btn" style="background:none; border:none; color:var(--text-muted); font-size:1.5rem; cursor:pointer;">&times;</button>
  </div>

  <div id="cart-items-list" style="flex:1; overflow-y:auto; padding:1.25rem; display:flex; flex-direction:column; gap:0.85rem;">
    <!-- Items rendered dynamically -->
  </div>

  <div style="padding:1.4rem; border-top:1px solid rgba(255,255,255,0.08); background:rgba(15,17,26,0.6);">
    <div style="display:flex; justify-content:space-between; font-size:1.1rem; font-weight:700; color:#fff; margin-bottom:1.2rem;">
      <span>Total:</span>
      <span id="cart-drawer-total" style="color:var(--accent-cyan);">৳0 BDT</span>
    </div>
    <a href="payment.html" id="cart-checkout-btn" class="btn btn-primary" style="width:100%; text-align:center;">Proceed to Checkout</a>
  </div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", drawerHTML);

const drawer = document.getElementById("cart-drawer");
const overlay = document.getElementById("cart-drawer-overlay");
const floatingBtn = document.getElementById("cart-floating-btn");
const closeBtn = document.getElementById("cart-close-btn");
const itemsList = document.getElementById("cart-items-list");
const totalEl = document.getElementById("cart-drawer-total");
const badgeEl = document.getElementById("cart-badge");

export function openCartDrawer() {
  drawer.style.right = "0";
  overlay.style.display = "block";
  updateCartUI();
}

export function closeCartDrawer() {
  drawer.style.right = "-420px";
  overlay.style.display = "none";
}

floatingBtn.onclick = openCartDrawer;
closeBtn.onclick = closeCartDrawer;
overlay.onclick = closeCartDrawer;

export function updateCartUI() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (totalCount > 0) {
    badgeEl.style.display = "flex";
    badgeEl.innerText = totalCount;
  } else {
    badgeEl.style.display = "none";
  }

  if (cart.length === 0) {
    itemsList.innerHTML = `
      <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted); font-size:0.9rem;">
        Your cart is empty.<br>Browse our web and bot services to add items.
      </div>
    `;
    totalEl.innerText = "৳0 BDT";
    return;
  }

  itemsList.innerHTML = cart.map(item => `
    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:0.85rem 1rem; border-radius:10px;">
      <div>
        <div style="font-weight:600; font-size:0.9rem; color:#fff;">${item.name}</div>
        <div style="font-size:0.8rem; color:var(--accent-cyan); margin-top:2px;">
          ৳${item.price.toLocaleString()} BDT ${item.quantity > 1 ? `&times; ${item.quantity}` : ""}
        </div>
      </div>
      <button data-remove="${item.id}" style="background:none; border:none; color:#f87171; cursor:pointer; font-size:1.1rem; padding:4px 8px;">🗑️</button>
    </div>
  `).join("");

  totalEl.innerText = `৳${getCartTotal().toLocaleString()} BDT`;

  itemsList.querySelectorAll("[data-remove]").forEach(btn => {
    btn.onclick = () => removeFromCart(btn.getAttribute("data-remove"));
  });
}

// Initial sync on script load
updateCartUI();
