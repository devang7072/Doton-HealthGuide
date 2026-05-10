/**
 * doctors.js — Doctors Directory
 * Handles: rendering doctor cards, live search/filter
 */

// ── Doctor data ──────────────────────────────────────────────────
const doctorsData = [
  {
    name  : 'Dr. Somya Ranjan Das',
    spec  : 'Neurologist',
    exp   : 18,
    email : 'somya@doton.in',
    phone : '+91 9876 XXX XXX',
    areas : 'Stroke, Epilepsy',
    icon  : 'fas fa-brain',
    col   : '#818cf8',
    seed  : 'dr1',
    stars : 4,
  },
  {
    name  : 'Dr. Biswa Prakash Rout',
    spec  : 'Cardiologist',
    exp   : 12,
    email : 'biswa@doton.in',
    phone : '+91 6371 XXX XXX',
    areas : 'Heart Care, Hypertension',
    icon  : 'fas fa-heartbeat',
    col   : '#34d399',
    seed  : 'dr2',
    stars : 5,
  },
  {
    name  : 'Dr. Priya Mehra',
    spec  : 'Pediatrician',
    exp   : 9,
    email : 'priya@doton.in',
    phone : '+91 9812 XXX XXX',
    areas : 'Child Health, Vaccinations',
    icon  : 'fas fa-child',
    col   : '#f472b6',
    seed  : 'dr3',
    stars : 4,
  },
  {
    name  : 'Dr. Rajesh Kumar',
    spec  : 'Orthopedic',
    exp   : 15,
    email : 'rajesh@doton.in',
    phone : '+91 7740 XXX XXX',
    areas : 'Joint Replacement, Fractures',
    icon  : 'fas fa-bone',
    col   : '#60a5fa',
    seed  : 'dr4',
    stars : 5,
  },
  {
    name  : 'Dr. Anjali Singh',
    spec  : 'Dermatologist',
    exp   : 7,
    email : 'anjali@doton.in',
    phone : '+91 9988 XXX XXX',
    areas : 'Skin Care, Acne, Psoriasis',
    icon  : 'fas fa-hand-sparkles',
    col   : '#fbbf24',
    seed  : 'dr5',
    stars : 4,
  },
  {
    name  : 'Dr. Manpreet Kaur',
    spec  : 'Gynecologist',
    exp   : 11,
    email : 'manpreet@doton.in',
    phone : '+91 9915 XXX XXX',
    areas : 'Women Health, Maternity',
    icon  : 'fas fa-venus',
    col   : '#ec4899',
    seed  : 'dr6',
    stars : 5,
  },
];

// ── Helpers ──────────────────────────────────────────────────────

/**
 * buildStars — returns star icon HTML string.
 * @param {number} filled  — filled stars count (0-5)
 */
function buildStars(filled) {
  const on  = '<i class="fas fa-star star-on"></i>';
  const off = '<i class="fas fa-star star-off"></i>';
  return on.repeat(filled) + off.repeat(5 - filled);
}

/**
 * buildDoctorCard — returns HTML for a single doctor card.
 * @param {object} d  — doctor object from doctorsData
 */
function buildDoctorCard(d) {
  return `
    <div class="doc-card" data-spec="${d.spec.toLowerCase()}">
      <div class="doc-av">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${d.seed}" alt="${d.name}"/>
      </div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px">
          <div>
            <div style="font-size:15px;font-weight:700">${d.name}</div>
            <div style="font-size:12px;color:${d.col};font-weight:600">${d.spec} — ${d.exp}y exp</div>
          </div>
          <span class="badge badge-green" style="font-size:10px">Available</span>
        </div>
        <div class="rating" style="margin-bottom:10px">${buildStars(d.stars)}</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:12px">
          <div><i class="fas fa-stethoscope" style="opacity:.5;margin-right:6px"></i>${d.areas}</div>
          <div style="margin-top:4px"><i class="fas fa-envelope" style="opacity:.5;margin-right:6px"></i>${d.email}</div>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" style="flex:1;justify-content:center;font-size:12px;padding:9px 14px">
            <i class="fas fa-video"></i> Consult Now
          </button>
          <a href="https://wa.me/?text=Consulting%20${encodeURIComponent(d.name)}"
             target="_blank"
             class="btn btn-ghost"
             style="font-size:12px;padding:9px 14px">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </div>`;
}

// ── Public functions ─────────────────────────────────────────────

/**
 * renderDoctors — populates the doctor list (renders once per session).
 * Called by app.js router on first visit to the Doctors page.
 */
function renderDoctors() {
  const list = document.getElementById('doc-list');
  if (list.children.length > 0) return;    // already rendered
  list.innerHTML = doctorsData.map(buildDoctorCard).join('');
}

/**
 * filterDoctors — live-filters doctor cards by the search input.
 * Bound to the oninput event of #doc-search.
 */
function filterDoctors() {
  const term = document.getElementById('doc-search').value.toLowerCase();
  document.querySelectorAll('.doc-card').forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(term) ? 'flex' : 'none';
  });
}
