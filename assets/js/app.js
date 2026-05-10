/**
 * app.js — Navigation router & global initialisation
 * Handles: page switching, topbar title, lazy-init hooks
 */

// ── Page title map ──────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard : '🏠 Dashboard',
  chat      : '💬 AI Health Chat',
  news      : '📰 Daily Health News',
  outbreak  : '⚠️ Outbreak Alert',
  alert     : '💉 Medicine Tracker',
  myth      : '💡 Myth Buster',
  quiz      : '🎮 Health Quiz',
  weather   : '🌤️ WeatherWise',
  hospitals : '🏥 Hospitals',
  doctors   : '👨‍⚕️ Doctors',
  emergency : '🚨 Emergency',
  vitals    : '📊 Health Vitals',
};

let currentPage = 'dashboard';

/**
 * showPage — activates a named page and triggers lazy inits.
 * @param {string} id  — key from PAGE_TITLES
 */
function showPage(id) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  const target = document.getElementById('page-' + id);
  if (!target) return;
  target.classList.add('active');

  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(n => {
    const oc = n.getAttribute('onclick') || '';
    n.classList.toggle('active', oc.includes(`'${id}'`));
  });

  // Update mobile nav active state
  document.querySelectorAll('.mob-item').forEach(n => {
    const oc = n.getAttribute('onclick') || '';
    n.classList.toggle('active', oc.includes(`'${id}'`));
  });

  // Update topbar title
  document.getElementById('topbar-title').textContent = PAGE_TITLES[id] || id;

  // Scroll main panel back to top
  document.getElementById('main').scrollTop = 0;

  currentPage = id;

  // ── Lazy initialise feature modules on first visit ──
  if (id === 'news'    && !newsLoaded)  loadNews();
  if (id === 'weather')                 fetchWeather();
  if (id === 'doctors')                 renderDoctors();
  if (id === 'myth')                    renderMythDB();
  if (id === 'vitals')                  loadVitalsFromServer();
}

// ── Daily health tip (rotates by day-of-month) ──────────────────
const DAILY_TIPS = [
  'Drink at least 8 glasses of water today to stay hydrated and energised.',
  'Take a 10-minute walk after meals — it improves digestion and blood sugar.',
  'Eat at least 5 servings of vegetables and fruits for essential nutrients.',
  'Practice deep breathing for 5 minutes to reduce stress and improve focus.',
  'Wash your hands frequently — it prevents 80% of common infections.',
  'Limit screen time before bed for better sleep quality.',
  'A good laugh boosts immunity and lowers blood pressure naturally.',
  'Stand up and stretch for 2 minutes every hour if you sit at a desk.',
  'Get 7-9 hours of sleep tonight — your brain and body need it to recover.',
  'Eat breakfast — it kickstarts metabolism and improves concentration.',
];

// ── App bootstrap ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set AI daily tip
  const tipEl = document.getElementById('daily-tip');
  if (tipEl && typeof puter !== 'undefined') {
    puter.ai.chat("Give me a one-sentence health tip for today. Keep it short, actionable, and encouraging.", {
      model: 'gemini-3-flash-preview'
    }).then(tip => {
      tipEl.textContent = tip;
    }).catch(() => {
      tipEl.textContent = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];
    });
  }

  // Disable send button until API key connected
  const sendBtn = document.getElementById('chat-send');
  if (sendBtn) sendBtn.disabled = true;

  // Load myth DB on start (it's shown on dashboard too)
  renderMythDB();

  // Initialise Puter AI automatically
  if (typeof connectGemini === 'function') connectGemini();
});

// ── Register Service Worker for PWA ──────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('ServiceWorker registered:', reg.scope))
      .catch(err => console.log('ServiceWorker registration failed:', err));
  });
}
