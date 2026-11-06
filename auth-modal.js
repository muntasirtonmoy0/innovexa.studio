import { auth } from "./firebase-config.js";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut 
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Modal HTML Template
const modalHTML = `
<div id="auth-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(8px); z-index:9999; align-items:center; justify-content:center; padding:1rem;">
  <div class="form-box" style="width:100%; max-width:440px; margin:0; position:relative;">
    <button id="modal-close" style="position:absolute; top:1.2rem; right:1.2rem; background:none; border:none; color:var(--text-muted); font-size:1.4rem; cursor:pointer;">&times;</button>
    <h2 id="modal-title" style="font-size:1.6rem; font-weight:700; margin-bottom:0.4rem; text-align:center;">Welcome Back</h2>
    <p id="modal-subtitle" style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem; text-align:center;">Sign in to your account</p>
    
    <div id="modal-msg" style="display:none; padding:0.75rem; border-radius:8px; font-size:0.85rem; margin-bottom:1rem;"></div>
    
    <form id="modal-form">
      <div class="form-group" id="modal-name-group" style="display:none;">
        <label>Your Full Name</label>
        <input type="text" id="modal-name" class="form-input" placeholder="e.g. Alex Hunter">
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" id="modal-email" class="form-input" placeholder="name@domain.com" required>
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" id="modal-pass" class="form-input" placeholder="••••••••••••" required>
      </div>
      <button type="submit" id="modal-submit" class="btn btn-primary" style="width:100%;">Sign In</button>
    </form>
    
    <div style="text-align:center; margin-top:1.2rem; font-size:0.88rem; color:var(--text-muted);">
      <span id="modal-toggle-prompt">Don't have an account?</span>
      <button id="modal-toggle-btn" style="background:none; border:none; color:var(--accent-cyan); font-weight:600; cursor:pointer;">Sign Up</button>
    </div>
  </div>
</div>
`;

// Inject into DOM
document.body.insertAdjacentHTML('beforeend', modalHTML);

const modal = document.getElementById('auth-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalNameGroup = document.getElementById('modal-name-group');
const modalSubmit = document.getElementById('modal-submit');
const modalToggleBtn = document.getElementById('modal-toggle-btn');
const modalTogglePrompt = document.getElementById('modal-toggle-prompt');
const modalMsg = document.getElementById('modal-msg');
const modalForm = document.getElementById('modal-form');

let isSignUp = false;

export function openAuthModal(signUpMode = false) {
  isSignUp = signUpMode;
  updateModalUI();
  modalMsg.style.display = 'none';
  modal.style.display = 'flex';
}

export function closeAuthModal() {
  modal.style.display = 'none';
}

modalClose.onclick = closeAuthModal;
modal.onclick = (e) => { if (e.target === modal) closeAuthModal(); };

function updateModalUI() {
  if (isSignUp) {
    modalTitle.innerText = "Create an Account";
    modalSubtitle.innerText = "Join Innovexa Studio";
    modalNameGroup.style.display = "block";
    modalSubmit.innerText = "Sign Up";
    modalTogglePrompt.innerText = "Already registered?";
    modalToggleBtn.innerText = "Sign In";
  } else {
    modalTitle.innerText = "Welcome Back";
    modalSubtitle.innerText = "Sign in to manage orders and post reviews";
    modalNameGroup.style.display = "none";
    modalSubmit.innerText = "Sign In";
    modalTogglePrompt.innerText = "Don't have an account?";
    modalToggleBtn.innerText = "Sign Up";
  }
}

modalToggleBtn.onclick = () => {
  isSignUp = !isSignUp;
  modalMsg.style.display = 'none';
  updateModalUI();
};

modalForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('modal-email').value.trim();
  const password = document.getElementById('modal-pass').value;
  const name = document.getElementById('modal-name').value.trim();

  modalSubmit.disabled = true;
  modalSubmit.innerText = "Processing...";

  try {
    if (isSignUp) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) await updateProfile(cred.user, { displayName: name });
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    closeAuthModal();
  } catch (err) {
    modalMsg.style.display = 'block';
    modalMsg.style.background = 'rgba(239,68,68,0.15)';
    modalMsg.style.color = '#fca5a5';
    modalMsg.style.border = '1px solid rgba(239,68,68,0.3)';
    modalMsg.innerText = err.message;
  } finally {
    modalSubmit.disabled = false;
    modalSubmit.innerText = isSignUp ? "Sign Up" : "Sign In";
  }
};

// Global Navbar Syncer
onAuthStateChanged(auth, (user) => {
  const authNavElements = document.querySelectorAll('.auth-nav-slot');
  authNavElements.forEach(slot => {
    if (user) {
      const displayName = user.displayName || user.email.split('@')[0];
      slot.innerHTML = `
        <button class="btn-nav" id="global-logout-btn" style="cursor:pointer;">
          Sign Out (${displayName})
        </button>
      `;
      slot.querySelector('#global-logout-btn').onclick = () => signOut(auth);
    } else {
      slot.innerHTML = `<button class="btn-nav" id="global-login-btn" style="cursor:pointer;">Sign In</button>`;
      slot.querySelector('#global-login-btn').onclick = () => openAuthModal(false);
    }
  });

  // Custom event for pages to react to auth changes (reviews, payment)
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user } }));
});
