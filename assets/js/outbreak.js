/**
 * outbreak.js — Disease Outbreak Alert System
 * Now backed by MongoDB via the Express API.
 * Falls back to in-memory if user is not logged in.
 */

let outbreaks = []; // local cache

// ── Load outbreaks from the server ──────────────────────────────
async function loadOutbreaksFromServer() {
  try {
    const data = await api.get('/outbreaks');
    outbreaks = data.map(o => ({
      _id     : o._id,
      district: o.district,
      disease : o.disease,
      severity: o.severity,
      cases   : o.cases,
      time    : new Date(o.createdAt).toLocaleTimeString(),
      verified: o.verified,
      reporter: o.reportedBy ? o.reportedBy.name : 'Anonymous',
    }));
    renderOutbreakLog();
    // Rebuild campaign cards
    const clist = document.getElementById('campaign-list');
    if (clist) {
      clist.innerHTML = '';
      outbreaks.forEach(addCampaignCard);
    }
  } catch (err) {
    console.error('Failed to load outbreaks:', err.message);
  }
}

/**
 * broadcastOutbreak — reads form, saves to API (if logged in), re-renders.
 */
async function broadcastOutbreak() {
  const district    = document.getElementById('ob-district').value;
  const disease     = document.getElementById('ob-disease').value.trim();
  const severity    = document.getElementById('ob-severity').value;
  const cases       = document.getElementById('ob-cases').value;
  const description = document.getElementById('ob-desc') ? document.getElementById('ob-desc').value.trim() : '';

  if (!district || !disease || !cases) {
    alert('Please fill all fields (District, Disease, and Cases).');
    return;
  }

  if (isLoggedIn()) {
    // ── Save to database ───────────────────────────────────────
    try {
      const saved = await api.post('/outbreaks', { district, disease, severity, cases, description });
      const entry = {
        _id     : saved._id,
        district: saved.district,
        disease : saved.disease,
        severity: saved.severity,
        cases   : saved.cases,
        time    : new Date(saved.createdAt).toLocaleTimeString(),
        verified: saved.verified,
        reporter: currentUser ? currentUser.name : 'You',
      };
      outbreaks.unshift(entry);
      renderOutbreakLog();
      addCampaignCard(entry);
    } catch (err) {
      alert('Could not submit report: ' + err.message);
      return;
    }
  } else {
    // ── Session-only fallback (not logged in) ─────────────────
    const entry = {
      _id     : String(Date.now()),
      district,
      disease,
      severity,
      cases   : parseInt(cases, 10),
      time    : new Date().toLocaleTimeString(),
      verified: false,
      reporter: 'Guest',
    };
    outbreaks.unshift(entry);
    renderOutbreakLog();
    addCampaignCard(entry);
  }

  // Reset form fields
  ['ob-disease', 'ob-cases'].forEach(id => (document.getElementById(id).value = ''));
  document.getElementById('ob-district').value = '';
}

/**
 * renderOutbreakLog — re-renders the "Active Alerts Log" list.
 */
function renderOutbreakLog() {
  const log = document.getElementById('outbreak-log');
  if (!log) return;

  if (!outbreaks.length) {
    log.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);font-size:13px">No active alerts. Post one to see it here.</div>';
    return;
  }

  const colors = {
    high: 'var(--rose)',
    med : 'var(--amber)',
    low : 'var(--emerald)',
  };

  log.innerHTML = outbreaks.map(a => `
    <div class="outbreak-list-item">
      <div>
        <div style="font-size:14px;font-weight:700">
          ${a.disease} — ${a.district}
          ${a.verified ? '<span class="badge badge-blue" style="font-size:9px;margin-left:6px">✓ Verified</span>' : ''}
        </div>
        <div style="font-size:12px;color:var(--muted);margin-top:2px">
          ${a.cases} cases · ${a.time} · by ${a.reporter || 'Anonymous'}
        </div>
      </div>
      <span class="badge" style="
        background:${colors[a.severity]}20;
        color:${colors[a.severity]};
        border:1px solid ${colors[a.severity]}40">
        ${a.severity.toUpperCase()}
      </span>
    </div>`).join('');
}

/**
 * addCampaignCard — appends an entry to the "Active Campaigns" panel.
 * @param {object} entry
 */
function addCampaignCard(entry) {
  const clist = document.getElementById('campaign-list');
  if (!clist) return;

  const colorMap = { high: '#ef4444', med: '#f59e0b', low: '#10b981' };
  const color = colorMap[entry.severity];

  const div = document.createElement('div');
  div.style.cssText = `
    padding:14px;
    background:${color}15;
    border:1px solid ${color}30;
    border-radius:var(--r);
    border-left:4px solid ${color}`;
  div.innerHTML = `
    <div style="font-size:13px;font-weight:600;color:${color}">${entry.disease} — ${entry.district}</div>
    <div style="font-size:11px;color:var(--muted);margin-top:4px">
      Cases: ${entry.cases} | Severity: ${entry.severity.toUpperCase()}
      ${entry.verified ? ' | ✓ Verified' : ''}
    </div>`;
  clist.prepend(div);
}
