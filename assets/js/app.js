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
  tools     : '🛠️ Health Toolbox',
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
  document.querySelectorAll('.mob-nav-item').forEach(n => {
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
    }).then(response => {
      let tip = typeof response === 'string' ? response : (response?.text || response?.message?.content[0]?.text || String(response));
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
      .then(reg => {
        console.log('ServiceWorker registered:', reg.scope);
        // Initialize Push Notifications if logged in
        if (localStorage.getItem('doton_token')) {
          initPushNotifications(reg);
        }
      })
      .catch(err => console.log('ServiceWorker registration failed:', err));
  });
}

/**
 * initPushNotifications — Requests permission and subscribes to Push API
 */
async function initPushNotifications(registration) {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push permission denied');
      return;
    }

    // Subscribe to push
    const subscribeOptions = {
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array('BAEUH0NxE9MOc7Ske_0hA2wMc5agCDGM8qsDwfjdgU0_wUVANAYKo9hJ96htUHjf7NjY4PeQ-OucE_ZGarNI7ms')
    };

    const subscription = await registration.pushManager.subscribe(subscribeOptions);
    console.log('User is subscribed:', subscription);

    // Send subscription to backend
    await apiFetch('/auth/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription)
    });
    
    console.log('Subscription saved to backend');
  } catch (err) {
    console.error('Failed to subscribe the user: ', err);
  }
}

/**
 * urlBase64ToUint8Array — Helper for VAPID key conversion
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ── Language Switcher Logic ──────────────────────────────────────────
let currentLang = 'en';

window.toggleLangMenu = function() {
  const menu = document.getElementById('lang-menu');
  if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
};

window.changeLanguage = function(langCode, langName) {
  currentLang = langCode;
  document.getElementById('current-lang-text').innerText = langName;
  document.getElementById('lang-menu').style.display = 'none';

  // Trigger Google Translate hidden dropdown
  const select = document.querySelector('.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
  }
};

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const switcher = document.querySelector('.lang-switcher');
  const menu = document.getElementById('lang-menu');
  if (switcher && menu && !switcher.contains(e.target)) {
    menu.style.display = 'none';
  }
});

// ── Smart Hub Logic ──────────────────────────────────────────────────
window.generateSmartSummary = async function() {
  const greetingEl = document.getElementById('smart-hub-greeting');
  const textEl = document.getElementById('smart-hub-text');
  if (!greetingEl || !textEl) return;

  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';

  // Get User Name
  const userStr = localStorage.getItem('doton_user');
  let name = '';
  if (userStr) {
    try { name = JSON.parse(userStr).name.split(' ')[0]; } catch(e){}
  }
  greetingEl.innerText = name ? `${greeting}, ${name}!` : `${greeting}!`;

  // Aggregate Data
  let medsCount = 0;
  if (typeof window.medicines !== 'undefined') {
    const todayStr = new Date().toLocaleDateString();
    medsCount = window.medicines.filter(m => new Date(m.time).toLocaleDateString() === todayStr).length;
  }

  let tempStr = 'Unknown weather';
  if (typeof window.weatherData !== 'undefined' && window.weatherData?.main?.temp) {
    tempStr = `${Math.round(window.weatherData.main.temp)}°C`;
  }

  let alertsCount = 0;
  if (typeof window.activeAlerts !== 'undefined') {
    alertsCount = window.activeAlerts.length;
  }

  let text = `You have ${medsCount > 0 ? `**${medsCount} medicines** scheduled` : 'no medicines scheduled'} for today. `;
  text += `It's currently **${tempStr}** outside. `;
  text += alertsCount > 0 
    ? `⚠️ There are **${alertsCount} health alerts** in your area.` 
    : `No new disease outbreaks reported in your area.`;

  // Convert **bold** to HTML
  textEl.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

// Auto-run smart summary on load and every minute to keep it fresh
setTimeout(generateSmartSummary, 2000); // 2 second delay to let weather/medicine load
setInterval(generateSmartSummary, 60000);

/**
 * showToast — Global notification toast.
 * @param {string} msg 
 */
function showToast(msg) {
  const toast = document.getElementById('auth-toast');
  if (toast) {
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.pointerEvents = 'auto'; // Make it interactive if needed
    setTimeout(() => { 
      toast.style.opacity = '0'; 
      toast.style.pointerEvents = 'none';
    }, 3000);
  } else {
    alert(msg);
  }
}
