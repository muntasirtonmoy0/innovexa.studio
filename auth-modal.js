import { auth, recordLoginSession, checkSessionExpiry } from "./firebase-config.js";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const modalHTML = `
<div id="auth-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(8px); z-index:9999; align-items:center; justify-content:center; padding:1rem;">
  <div class="form-box" style="width:100%; max-width:440px; margin:0; position:relative;">
    <button id="modal-close" style="position:absolute; top:1.2rem; right:1.2rem; background:none; border:none; color:var(--text-muted); font-size:1.4rem; cursor:pointer;">&times;</button>
    
    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:1.2rem;">
      <button id="tab-email" class="btn" style="padding:0.4rem 1.1rem; font-size:0.85rem; background:rgba(255,255,255,0.12); color:#fff; border-radius:8px;">Email</button>
      <button id="tab-phone" class="btn" style="padding:0.4rem 1.1rem; font-size:0.85rem; background:transparent; color:var(--text-muted); border-radius:8px;">Phone Number</button>
    </div>

    <h2 id="modal-title" style="font-size:1.5rem; font-weight:700; margin-bottom:0.4rem; text-align:center;">Welcome Back</h2>
    <p id="modal-subtitle" style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.2rem; text-align:center;">Sign in to your account</p>
    
    <div id="modal-msg" style="display:none; padding:0.75rem; border-radius:8px; font-size:0.85rem; margin-bottom:1rem; word-break:break-word;"></div>

    <!-- 1-Click Google Sign In Button -->
    <div id="google-auth-wrapper">
      <button type="button" id="google-auth-btn" class="btn" style="width:100%; display:flex; align-items:center; justify-content:center; gap:10px; background:#ffffff; color:#1f2937; font-weight:600; border:none; border-radius:10px; padding:0.75rem; margin-bottom:1.25rem; transition:transform 0.2s, background 0.2s; box-shadow:0 2px 10px rgba(0,0,0,0.15);">
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      <div id="auth-divider" style="display:flex; align-items:center; text-align:center; margin:1rem 0 1.25rem;">
        <div style="flex:1; border-bottom:1px solid rgba(255,255,255,0.1);"></div>
        <span style="padding:0 12px; color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:1px;">or continue with</span>
        <div style="flex:1; border-bottom:1px solid rgba(255,255,255,0.1);"></div>
      </div>
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
        <button type="button" id="verify-otp-btn" class="btn btn-primary" style="width:100%; margin-bottom:0.75rem;">Verify & Sign In</button>
        <button type="button" id="change-phone-btn" style="background:none; border:none; color:var(--accent-cyan); font-size:0.85rem; width:100%; cursor:pointer; text-align:center;">Change Phone Number</button>
      </div>
    </form>
    
    <!-- reCAPTCHA Container -->
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
const googleWrapper = document.getElementById('google-auth-wrapper');
const googleBtn = document.getElementById('google-auth-btn');

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
let recaptchaVerifier = null;

// Tab Switching
tabEmail.onclick = () => {
  currentTab = 'email';
  tabEmail.style.background = 'rgba(255,255,255,0.12)';
  tabEmail.style.color = '#fff';
  tabPhone.style.background = 'transparent';
  tabPhone.style.color = 'var(--text-muted)';
  
  googleWrapper.style.display = 'block';
  emailForm.style.display = 'block';
  phoneForm.style.display = 'none';
  
  modalTitle.innerText = isSignUp ? "Create an Account" : "Welcome Back";
  modalSubtitle.innerText = isSignUp ? "Sign up to Innovexa Studio" : "Sign in with your email";
  modalMsg.style.display = 'none';
};

tabPhone.onclick = () => {
  currentTab = 'phone';
  tabPhone.style.background = 'rgba(255,255,255,0.12)';
  tabPhone.style.color = '#fff';
  tabEmail.style.background = 'transparent';
  tabEmail.style.color = 'var(--text-muted)';
  
  googleWrapper.style.display = 'none'; // Clean view for Phone auth
  emailForm.style.display = 'none';
  phoneForm.style.display = 'block';
  
  modalTitle.innerText = "Phone Sign-In";
  modalSubtitle.innerText = "We'll send a one-time verification code";
  modalMsg.style.display = 'none';
};

export function openAuthModal(signUpMode = false) {
  isSignUp = signUpMode;
  modalNameGroup.style.display = isSignUp ? 'block' : 'none';
  modalEmailSubmit.innerText = isSignUp ? 'Sign Up' : 'Sign In';
  modalTogglePrompt.innerText = isSignUp ? 'Already registered?' : "Don't have an account?";
  modalToggleBtn.innerText = isSignUp ? 'Sign In' : 'Sign Up';
  modalMsg.style.display = 'none';
  
  // Default to Email tab when opened
  tabEmail.click();
  modal.style.display = 'flex';
}

export function closeAuthModal() {
  modal.style.display = 'none';
  // Reset phone steps if closed midway
  document.getElementById('phone-step-1').style.display = 'block';
  document.getElementById('phone-step-2').style.display = 'none';
  document.getElementById('modal-phone').value = '';
  document.getElementById('modal-otp').value = '';
}

modalClose.onclick = closeAuthModal;
modal.onclick = (e) => { if (e.target === modal) closeAuthModal(); };

modalToggleBtn.onclick = () => {
  isSignUp = !isSignUp;
  openAuthModal(isSignUp);
};

// 1. Google Provider Handler
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

// 3. Phone Authentication (reCAPTCHA and OTP)
function initRecaptcha() {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, 'send-otp-btn', {
      size: 'invisible',
      callback: () => {
        // Invisible reCAPTCHA completed
      },
      'expired-callback': () => {
        showError("reCAPTCHA expired. Please try sending the code again.");
      }
    });
  }
}

phoneForm.onsubmit = async (e) => {
  e.preventDefault();
  const phoneNumber = document.getElementById('modal-phone').value.trim();
  const sendBtn = document.getElementById('send-otp-btn');

  modalMsg.style.display = 'none';
  sendBtn.disabled = true;
  sendBtn.innerText = "Verifying & Sending...";

  try {
    initRecaptcha();
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    
    document.getElementById('phone-step-1').style.display = 'none';
    document.getElementById('phone-step-2').style.display = 'block';
    
    modalMsg.style.display = 'block';
    modalMsg.style.background = 'rgba(52, 211, 153, 0.15)';
    modalMsg.style.color = '#6ee7b7';
    modalMsg.style.border = '1px solid rgba(52, 211, 153, 0.35)';
    modalMsg.innerText = "Verification code sent! Enter the 6-digit code below.";
  } catch (err) {
    console.error("Phone Auth Error:", err);
    showError(err.message);
    if (recaptchaVerifier) {
      try { recaptchaVerifier.clear(); } catch (_) {}
      recaptchaVerifier = null;
    }
  } finally {
    sendBtn.disabled = false;
    sendBtn.innerText = "Send Verification Code";
  }
};

document.getElementById('verify-otp-btn').onclick = async () => {
  const code = document.getElementById('modal-otp').value.trim();
  const verifyBtn = document.getElementById('verify-otp-btn');
  if (!confirmationResult || code.length < 6) {
    showError("Please enter a valid 6-digit code.");
    return;
  }

  verifyBtn.disabled = true;
  verifyBtn.innerText = "Verifying...";

  try {
    await confirmationResult.confirm(code);
    recordLoginSession();
    closeAuthModal();
  } catch (err) {
    showError(err.message);
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.innerText = "Verify & Sign In";
  }
};

document.getElementById('change-phone-btn').onclick = () => {
  document.getElementById('phone-step-2').style.display = 'none';
  document.getElementById('phone-step-1').style.display = 'block';
  modalMsg.style.display = 'none';
};

function showError(msg) {
  modalMsg.style.display = 'block';
  modalMsg.style.background = 'rgba(239,68,68,0.15)';
  modalMsg.style.color = '#fca5a5';
  modalMsg.style.border = '1px solid rgba(239,68,68,0.3)';
  modalMsg.innerText = msg;
}

// 4. Global State & 2-3 Week Session Verification
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (checkSessionExpiry()) {
      return;
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
