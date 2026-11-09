import { auth, recordLoginSession, checkSessionExpiry } from "./firebase-config.js";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const modalHTML = `
<div id="auth-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); z-index:9999; align-items:center; justify-content:center; padding:1rem;">
  <div class="form-box" style="width:100%; max-width:440px; margin:0; position:relative;">
    <button id="modal-close" style="position:absolute; top:1.2rem; right:1.2rem; background:none; border:none; color:var(--text-muted); font-size:1.4rem; cursor:pointer;">&times;</button>
    
    <h2 id="modal-title" style="font-size:1.6rem; font-weight:700; margin-bottom:0.4rem; text-align:center;">Welcome Back</h2>
    <p id="modal-subtitle" style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.5rem; text-align:center;">Sign in to your account</p>
    
    <div id="modal-msg" style="display:none; padding:0.75rem; border-radius:8px; font-size:0.85rem; margin-bottom:1rem; word-break:break-word;"></div>

    <!-- 1-Click Google Sign In Button -->
    <button type="button" id="google-auth-btn" class="btn" style="width:100%; display:flex; align-items:center; justify-content:center; gap:10px; background:#ffffff; color:#1f2937; font-weight:600; border:none; border-radius:10px; padding:0.75rem; margin-bottom:1.25rem; cursor:pointer; transition:transform 0.2s, background 0.2s; box-shadow:0 2px 10px rgba(0,0,0,0.15);">
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Continue with Google
    </button>

    <!-- Visual Divider -->
    <div style="display:flex; align-items:center; text-align:center; margin:1rem 0 1.25rem;">
      <div style="flex:1; border-bottom:1px solid rgba(255,255,255,0.1);"></div>
      <span style="padding:0 12px; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">or with email</span>
      <div style="flex:1; border-bottom:1px solid rgba(255,255,255,0.1);"></div>
    </div>
    
    <!-- Email Form -->
    <form id="email-form">
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
      <button type="submit" id="modal-email-submit" class="btn btn-primary" style="width:100%; margin-top:0.5rem;">Sign In</button>
      
      <div style="text-align:center; margin-top:1.2rem; font-size:0.88rem; color:var(--text-muted);">
        <span id="modal-toggle-prompt">Don't have an account?</span>
        <button type="button" id="modal-toggle-btn" style="background:none; border:none; color:var(--accent-cyan); font-weight:600; cursor:pointer;">Sign Up</button>
      </div>
    </form>
  </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

const modal = document.getElementById('auth-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalMsg = document.getElementById('modal-msg');
const googleBtn = document.getElementById('google-auth-btn');

const emailForm = document.getElementById('email-form');
const modalNameGroup = document.getElementById('modal-name-group');
const modalEmailSubmit = document.getElementById('modal-email-submit');
const modalToggleBtn = document.getElementById('modal-toggle-btn');
const modalTogglePrompt = document.getElementById('modal-toggle-prompt');

let isSignUp = false;

export function openAuthModal(signUpMode = false) {
  isSignUp = signUpMode;
  modalNameGroup.style.display = isSignUp ? 'block' : 'none';
  modalTitle.innerText = isSignUp ? 'Create an Account' : 'Welcome Back';
  modalSubtitle.innerText = isSignUp ? 'Sign up to submit and manage reviews' : 'Sign in to your account';
  modalEmailSubmit.innerText = isSignUp ? 'Sign Up' : 'Sign In';
  modalTogglePrompt.innerText = isSignUp ? 'Already have an account?' : "Don't have an account yet?";
  modalToggleBtn.innerText = isSignUp ? 'Sign In' : 'Sign Up';
  modalMsg.style.display = 'none';
  modal.style.display = 'flex';
}

export function closeAuthModal() {
  modal.style.display = 'none';
  document.getElementById('modal-email').value = '';
  document.getElementById('modal-pass').value = '';
  document.getElementById('modal-name').value = '';
}

modalClose.onclick = closeAuthModal;
modal.onclick = (e) => { if (e.target === modal) closeAuthModal(); };

modalToggleBtn.onclick = () => {
  isSignUp = !isSignUp;
  openAuthModal(isSignUp);
};

// 1. Google Authentication Provider Handler
const googleProvider = new GoogleAuthProvider();
googleBtn.onclick = async () => {
  try {
    googleBtn.style.opacity = '0.7';
    googleBtn.innerText = 'Connecting Google...';
    await signInWithPopup(auth, googleProvider);
    recordLoginSession();
    closeAuthModal();
  } catch (err) {
    showError(err.message);
  } finally {
    googleBtn.style.opacity = '1';
    googleBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Continue with Google
    `;
  }
};

// 2. Email / Password Submit
emailForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById('modal-email').value.trim();
  const pass = document.getElementById('modal-pass').value;
  const name = document.getElementById('modal-name').value.trim();

  modalEmailSubmit.disabled = true;
  modalEmailSubmit.innerText = "Processing...";

  try {
    if (isSignUp) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) await updateProfile(cred.user, { displayName: name });
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
    recordLoginSession();
    closeAuthModal();
  } catch (err) {
    showError(err.message);
  } finally {
    modalEmailSubmit.disabled = false;
    modalEmailSubmit.innerText = isSignUp ? "Sign Up" : "Sign In";
  }
};

function showError(msg) {
  modalMsg.style.display = 'block';
  modalMsg.style.background = 'rgba(239,68,68,0.15)';
  modalMsg.style.color = '#fca5a5';
  modalMsg.style.border = '1px solid rgba(239,68,68,0.3)';
  modalMsg.innerText = msg;
}

// 3. Global Navbar Sync: Shows a clean Profile button leading to profile.html
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (checkSessionExpiry()) {
      return;
    }

    const displayName = user.displayName || user.email.split('@')[0];
    document.querySelectorAll('.auth-nav-slot').forEach(slot => {
      slot.innerHTML = `
        <a href="profile.html" class="btn-nav" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
          <span>👤</span> Profile (${displayName})
        </a>
      `;
    });
  } else {
    document.querySelectorAll('.auth-nav-slot').forEach(slot => {
      slot.innerHTML = `<button class="btn-nav" id="global-login-btn" style="cursor:pointer;">Sign In</button>`;
      slot.querySelector('#global-login-btn').onclick = () => openAuthModal(false);
    });
  }

  window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user } }));
});
