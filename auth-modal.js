import { auth, recordLoginSession, checkSessionExpiry } from "./firebase-config.js";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const modalHTML = `
<div id="auth-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); z-index:9999; align-items:center; justify-content:center; padding:1rem;">
  <div class="form-box" style="width:100%; max-width:440px; margin:0; position:relative;">
    <button id="modal-close" style="position:absolute; top:1.2rem; right:1.2rem; background:none; border:none; color:var(--text-muted); font-size:1.4rem; cursor:pointer;">&times;</button>
    
    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:1.2rem;">
      <button id="tab-email" class="btn" style="padding:0.4rem 1rem; font-size:0.85rem; background:rgba(255,255,255,0.1); color:#fff;">Email</button>
      <button id="tab-phone" class="btn" style="padding:0.4rem 1rem; font-size:0.85rem; background:transparent; color:var(--text-muted);">Phone Number</button>
    </div>

    <h2 id="modal-title" style="font-size:1.5rem; font-weight:700; margin-bottom:0.4rem; text-align:center;">Welcome Back</h2>
    <p id="modal-subtitle" style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem; text-align:center;">Sign in with your email</p>
    
    <div id="modal-msg" style="display:none; padding:0.75rem; border-radius:8px; font-size:0.85rem; margin-bottom:1rem;"></div>
    
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
      <button type="submit" id="modal-email-submit" class="btn btn-primary" style="width:100%;">Sign In</button>
      
      <div style="text-align:center; margin-top:1.2rem; font-size:0.88rem; color:var(--text-muted);">
        <span id="modal-toggle-prompt">Don't have an account?</span>
        <button type="button" id="modal-toggle-btn" style="background:none; border:none; color:var(--accent-cyan); font-weight:600; cursor:pointer;">Sign Up</button>
      </div>
    </form>

    <!-- Phone Number Form -->
    <form id="phone-form" style="display:none;">
      <div id="phone-step-1">
        <div class="form-group">
          <label>Phone Number (with Country Code)</label>
          <input type="tel" id="modal-phone" class="form-input" placeholder="+8801700000000" required>
        </div>
        <button type="submit" id="send-otp-btn" class="btn btn-primary" style="width:100%;">Send Verification Code</button>
      </div>

      <div id="phone-step-2" style="display:none;">
        <div class="form-group">
          <label>Enter 6-Digit SMS Code</label>
          <input type="text" id="modal-otp" class="form-input" placeholder="123456" maxlength="6" required>
        </div>
        <button type="button" id="verify-otp-btn" class="btn btn-primary" style="width:100%;">Verify & Sign In</button>
      </div>
    </form>
    
    <!-- Invisible reCAPTCHA container for Phone Auth -->
    <div id="recaptcha-container"></div>
  </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

const modal = document.getElementById('auth-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalSubtitle = document.getElementById('modal-subtitle');
const modalMsg = document.getElementById('modal-msg');

const tabEmail = document.getElementById('tab-email');
const tabPhone = document.getElementById('tab-phone');
const emailForm = document.getElementById('email-form');
const phoneForm = document.getElementById('phone-form');

const modalNameGroup = document.getElementById('modal-name-group');
const modalEmailSubmit = document.getElementById('modal-email-submit');
const modalToggleBtn = document.getElementById('modal-toggle-btn');
const modalTogglePrompt = document.getElementById('modal-toggle-prompt');

let isSignUp = false;
let currentTab = 'email';
let confirmationResult = null;

// Tab Switching
tabEmail.onclick = () => {
  currentTab = 'email';
  tabEmail.style.background = 'rgba(255,255,255,0.1)';
  tabEmail.style.color = '#fff';
  tabPhone.style.background = 'transparent';
  tabPhone.style.color = 'var(--text-muted)';
  emailForm.style.display = 'block';
  phoneForm.style.display = 'none';
  modalTitle.innerText = isSignUp ? "Create an Account" : "Welcome Back";
  modalSubtitle.innerText = isSignUp ? "Sign up with your email" : "Sign in with your email";
  modalMsg.style.display = 'none';
};

tabPhone.onclick = () => {
  currentTab = 'phone';
  tabPhone.style.background = 'rgba(255,255,255,0.1)';
  tabPhone.style.color = '#fff';
  tabEmail.style.background = 'transparent';
  tabEmail.style.color = 'var(--text-muted)';
  emailForm.style.display = 'none';
  phoneForm.style.display = 'block';
  modalTitle.innerText = "Phone Sign-In";
  modalSubtitle.innerText = "We'll send a one-time verification SMS";
  modalMsg.style.display = 'none';
};

export function openAuthModal(signUpMode = false) {
  isSignUp = signUpMode;
  modalNameGroup.style.display = isSignUp ? 'block' : 'none';
  modalEmailSubmit.innerText = isSignUp ? 'Sign Up' : 'Sign In';
  modalTogglePrompt.innerText = isSignUp ? 'Already registered?' : "Don't have an account?";
  modalToggleBtn.innerText = isSignUp ? 'Sign In' : 'Sign Up';
  modalMsg.style.display = 'none';
  modal.style.display = 'flex';
}

export function closeAuthModal() {
  modal.style.display = 'none';
}

modalClose.onclick = closeAuthModal;
modal.onclick = (e) => { if (e.target === modal) closeAuthModal(); };

modalToggleBtn.onclick = () => {
  isSignUp = !isSignUp;
  openAuthModal(isSignUp);
};

// 1. Email/Password Submit
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
    recordLoginSession(); // Set 2-3 week timestamp
    closeAuthModal();
  } catch (err) {
    showError(err.message);
  } finally {
    modalEmailSubmit.disabled = false;
    modalEmailSubmit.innerText = isSignUp ? "Sign Up" : "Sign In";
  }
};

// 2. Phone OTP Handler
let recaptchaVerifier = null;

function setupRecaptcha() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible'
    });
  }
}

phoneForm.onsubmit = async (e) => {
  e.preventDefault();
  const phoneNumber = document.getElementById('modal-phone').value.trim();
  const sendBtn = document.getElementById('send-otp-btn');

  sendBtn.disabled = true;
  sendBtn.innerText = "Sending SMS...";

  try {
    setupRecaptcha();
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    document.getElementById('phone-step-1').style.display = 'none';
    document.getElementById('phone-step-2').style.display = 'block';
    modalMsg.style.display = 'block';
    modalMsg.style.background = 'rgba(52, 211, 153, 0.15)';
    modalMsg.style.color = '#6ee7b7';
    modalMsg.innerText = "SMS code sent! Enter the 6-digit code below.";
  } catch (err) {
    showError(err.message);
    if (recaptchaVerifier) recaptchaVerifier.clear();
    recaptchaVerifier = null;
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerText = "Send Verification Code";
  }
};

document.getElementById('verify-otp-btn').onclick = async () => {
  const code = document.getElementById('modal-otp').value.trim();
  const verifyBtn = document.getElementById('verify-otp-btn');
  if (!confirmationResult || code.length < 6) return;

  verifyBtn.disabled = true;
  verifyBtn.innerText = "Verifying...";

  try {
    await confirmationResult.confirm(code);
    recordLoginSession(); // Set 2-3 week timestamp
    closeAuthModal();
  } catch (err) {
    showError(err.message);
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.innerText = "Verify & Sign In";
  }
};

function showError(msg) {
  modalMsg.style.display = 'block';
  modalMsg.style.background = 'rgba(239,68,68,0.15)';
  modalMsg.style.color = '#fca5a5';
  modalMsg.style.border = '1px solid rgba(239,68,68,0.3)';
  modalMsg.innerText = msg;
}

// 3. Global Navbar and 2-3 Week Session Check
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Check if session has exceeded 21 days
    if (checkSessionExpiry()) {
      return; // Will trigger re-auth cycle automatically
    }

    const displayName = user.displayName || user.phoneNumber || user.email.split('@')[0];
    document.querySelectorAll('.auth-nav-slot').forEach(slot => {
      slot.innerHTML = `
        <button class="btn-nav" id="global-logout-btn" style="cursor:pointer;">
          Sign Out (${displayName})
        </button>
      `;
      slot.querySelector('#global-logout-btn').onclick = () => {
        localStorage.removeItem('innovexa_login_timestamp');
        signOut(auth);
      };
    });
  } else {
    document.querySelectorAll('.auth-nav-slot').forEach(slot => {
      slot.innerHTML = `<button class="btn-nav" id="global-login-btn" style="cursor:pointer;">Sign In</button>`;
      slot.querySelector('#global-login-btn').onclick = () => openAuthModal(false);
    });
  }

  window.dispatchEvent(new CustomEvent('auth-changed', { detail: { user } }));
});
