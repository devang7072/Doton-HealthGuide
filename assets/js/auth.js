/**
 * auth.js — Handles Login, Register, Logout and session state
 * Reads/writes JWT to localStorage under the key 'doton_token'
 */

// ── State ────────────────────────────────────────────────────────
let currentUser = null;

// ── On page load, restore session ───────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('doton_token');
  const user  = localStorage.getItem('doton_user');

  if (token && user) {
    currentUser = JSON.parse(user);
    updateAuthUI(true);
    // Silently verify the token is still valid
    api.get('/auth/me')
      .then(u => { currentUser = u; updateAuthUI(true); })
      .catch(() => logoutUser()); // token expired — force logout
  } else {
    updateAuthUI(false);
  }
});

// ── Register ─────────────────────────────────────────────────────
async function registerUser() {
  const name     = document.getElementById('auth-name').value.trim();
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (!name || !email || !password) {
    showAuthError('Please fill in all fields.');
    return;
  }
  if (password.length < 6) {
    showAuthError('Password must be at least 6 characters.');
    return;
  }

  try {
    showAuthLoading(true);
    const data = await api.post('/auth/register', { name, email, password });
    saveSession(data);
    closeAuthModal();
    showAuthSuccess(`Welcome, ${data.name}! 🎉`);
  } catch (err) {
    showAuthError(err.message);
  } finally {
    showAuthLoading(false);
  }
}

// ── Login ─────────────────────────────────────────────────────────
async function loginUser() {
  const email    = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  if (!email || !password) {
    showAuthError('Please enter your email and password.');
    return;
  }

  try {
    showAuthLoading(true);
    const data = await api.post('/auth/login', { email, password });
    saveSession(data);
    closeAuthModal();
    showAuthSuccess(`Welcome back, ${data.name}! 👋`);
  } catch (err) {
    showAuthError(err.message);
  } finally {
    showAuthLoading(false);
  }
}

// ── Logout ────────────────────────────────────────────────────────
function logoutUser() {
  localStorage.removeItem('doton_token');
  localStorage.removeItem('doton_user');
  currentUser = null;
  updateAuthUI(false);
  // Reset reminders to empty
  medAlerts = [];
  renderMedAlerts();
}

// ── Helpers ──────────────────────────────────────────────────────
function saveSession(data) {
  localStorage.setItem('doton_token', data.token);
  localStorage.setItem('doton_user', JSON.stringify({
    _id  : data._id,
    name : data.name,
    email: data.email,
    role : data.role,
  }));
  currentUser = data;
  updateAuthUI(true);
}

function updateAuthUI(isLoggedIn) {
  const loginBtn    = document.getElementById('auth-login-btn');
  const userDisplay = document.getElementById('auth-user-display');
  const userName    = document.getElementById('auth-user-name');

  if (isLoggedIn && currentUser) {
    if (loginBtn)    loginBtn.style.display    = 'none';
    if (userDisplay) userDisplay.style.display = 'flex';
    if (userName)    userName.textContent       = currentUser.name;
    // Load user's reminders from server
    loadRemindersFromServer();
    // Load user's outbreaks from server
    loadOutbreaksFromServer();
    // Load user's vitals from server
    loadVitalsFromServer();
  } else {
    if (loginBtn)    loginBtn.style.display    = 'flex';
    if (userDisplay) userDisplay.style.display = 'none';
  }
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'flex';
  switchAuthTab(tab);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.style.display = 'none';
  clearAuthForm();
}

function switchAuthTab(tab) {
  const loginFields    = document.getElementById('auth-login-fields');
  const registerFields = document.getElementById('auth-register-fields');
  const loginTab       = document.getElementById('auth-tab-login');
  const registerTab    = document.getElementById('auth-tab-register');
  const submitBtn      = document.getElementById('auth-submit-btn');

  if (tab === 'login') {
    if (loginFields)    loginFields.style.display    = 'block';
    if (registerFields) registerFields.style.display = 'none';
    if (loginTab)       loginTab.classList.add('active');
    if (registerTab)    registerTab.classList.remove('active');
    if (submitBtn)      submitBtn.textContent         = 'Login';
    if (submitBtn)      submitBtn.onclick             = loginUser;
  } else {
    if (loginFields)    loginFields.style.display    = 'block'; // KEEP EMAIL AND PASSWORD VISIBLE
    if (registerFields) registerFields.style.display = 'block';
    if (loginTab)       loginTab.classList.remove('active');
    if (registerTab)    registerTab.classList.add('active');
    if (submitBtn)      submitBtn.textContent         = 'Create Account';
    if (submitBtn)      submitBtn.onclick             = registerUser;
  }
  clearAuthForm();
}

function clearAuthForm() {
  ['auth-name','auth-email','auth-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  showAuthError('');
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.style.display = msg ? 'block' : 'none'; }
}

function showAuthSuccess(msg) {
  // Re-use topbar or a toast
  const toast = document.getElementById('auth-toast');
  if (toast) {
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 3000);
  }
}

function showAuthLoading(on) {
  const btn = document.getElementById('auth-submit-btn');
  if (btn) btn.disabled = on;
}

// ── Helper to check if user is logged in ─────────────────────────
function isLoggedIn() {
  return !!localStorage.getItem('doton_token');
}
