/**
 * myth.js — Health Myth Buster + Myth Mini-Quiz
 * Handles: myth database rendering, myth checker input,
 *          interactive fact/myth mini quiz with scoring
 */

// ── Myth database ────────────────────────────────────────────────
const myths = [
  { text: 'Crushed papaya leaves cure dengue immediately', isFact: false, rebuttal: 'While papaya extract may help increase platelet count, it is not a cure for Dengue. Severe Dengue requires immediate medical hospitalization.' },
  { text: 'Hot water with turmeric and lemon cures COVID-19', isFact: false, rebuttal: 'Turmeric has anti-inflammatory properties, but no food or drink cures COVID-19. Vaccination and proper medical care are essential.' },
  { text: 'Putting warm mustard oil in ears cures earache', isFact: false, rebuttal: 'Putting unsterile oil in the ear can cause fungal infections or damage the eardrum. Always consult a doctor for earaches.' },
  { text: 'Eating jaggery (gur) after meals prevents asthma', isFact: false, rebuttal: 'Jaggery is a good sugar alternative but there is no scientific evidence that it prevents or cures asthma.' },
  { text: 'Sleeping under a peepal tree at night causes death by ghosts', isFact: false, rebuttal: 'Trees release carbon dioxide at night. Sleeping under a large tree can cause slight breathlessness due to CO2 accumulation, not ghosts.' },
  { text: 'Cow dung and urine can cure cancer', isFact: false, rebuttal: 'There is no scientific proof that cow dung or urine cures cancer. Cancer requires clinically proven treatments like chemotherapy and radiation.' },
  { text: 'Vaccines cause autism in children', isFact: false, rebuttal: 'Numerous extensive scientific studies by the WHO have proven there is absolutely no link between vaccines and autism.' },
  { text: 'Drinking turmeric milk boosts immunity', isFact: true, rebuttal: 'Turmeric contains curcumin, which has antioxidant and anti-inflammatory properties that can support the immune system.' },
  { text: 'Mental health is as important as physical health', isFact: true, rebuttal: 'According to the WHO, health is a state of complete physical, mental and social well-being, not merely the absence of disease.' },
  { text: 'Antibiotics cure viral infections like the common cold', isFact: false, rebuttal: 'Antibiotics only kill bacteria. They are completely useless against viruses like those that cause colds or the flu.' }
];

// ── Mini-quiz state ──────────────────────────────────────────────
let mythQuizIdx = -1;
let mythScore   = 0;

// ── Database renderer ────────────────────────────────────────────

/**
 * renderMythDB — populates the myth database list (renders once).
 * Called by app.js on first visit to the Myth page.
 */
function renderMythDB() {
  const list = document.getElementById('myth-db-list');
  if (!list || list.children.length > 0) return;   // already rendered

  list.innerHTML = myths.map(m => `
    <div class="myth-item" style="display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--glass);border:1px solid var(--border);border-radius:var(--r);margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <span style="font-weight:600;font-size:14px;line-height:1.4;color:var(--text);">${m.text}</span>
        <span class="fact-tag" style="flex-shrink:0;margin-left:12px;${
          m.isFact
            ? 'background:rgba(16,185,129,.15);color:#34d399;border:1px solid rgba(16,185,129,.25)'
            : 'background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.25)'
        }">${m.isFact ? 'Fact ✅' : 'Myth ❌'}</span>
      </div>
      <div style="font-size:13px;color:var(--muted);line-height:1.5;">${m.rebuttal}</div>
      <button onclick="shareMythWhatsApp(decodeURIComponent('${encodeURIComponent(m.text)}'), decodeURIComponent('${encodeURIComponent(m.rebuttal)}'), ${m.isFact})" style="align-self:flex-start;background:transparent;border:1px solid #25D366;color:#25D366;border-radius:var(--r);padding:4px 10px;font-size:12px;cursor:pointer;margin-top:4px;display:flex;align-items:center;gap:6px;">
        <i class="fab fa-whatsapp"></i> Share Fact
      </button>
    </div>`).join('');
}

// ── Myth Checker ─────────────────────────────────────────────────

/**
 * checkMyth — looks up the typed phrase in the myth database.
 */
function checkMyth() {
  const input  = document.getElementById('myth-input').value.toLowerCase().trim();
  const res    = document.getElementById('myth-result');
  if (!input) return;

  const found = myths.find(
    m => m.text.toLowerCase().includes(input) ||
         input.includes(m.text.toLowerCase().slice(0, 15))
  );

  res.style.display = 'block';

  if (found) {
    const bg     = found.isFact ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)';
    const border = found.isFact ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)';
    const label  = found.isFact ? '✅ TRUE — This is a fact!' : '❌ FALSE — This is a myth!';
    res.innerHTML = `
      <div style="padding:14px;background:${bg};border:1px solid ${border};border-radius:var(--r)">
        <strong>${label}</strong>
        <br/>
        <span style="font-size:13px;font-weight:600;margin-top:6px;display:block">"${found.text}"</span>
        <span style="font-size:12px;color:var(--muted);margin-top:4px;display:block">${found.rebuttal}</span>
        <button onclick="shareMythWhatsApp(decodeURIComponent('${encodeURIComponent(found.text)}'), decodeURIComponent('${encodeURIComponent(found.rebuttal)}'), ${found.isFact})" style="margin-top:10px;background:#25D366;color:#fff;border:none;border-radius:var(--r);padding:6px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;">
          <i class="fab fa-whatsapp"></i> Share to WhatsApp
        </button>
      </div>`;
  } else {
    // FALLBACK TO PUTER AI
    res.innerHTML = `
      <div style="padding:12px;background:var(--glass);border:1px solid var(--border);border-radius:var(--r);font-size:13px;color:var(--muted)">
        <i class="fas fa-robot fa-spin" style="margin-right:8px"></i> Consulting doton AI…
      </div>`;
    
    puter.ai.chat(`Classify this health claim as FACT or MYTH and provide a concise, fact-checked rebuttal sourced from WHO & NIH guidelines: "${input}"`, {
      model: 'gemini-3-flash-preview'
    }).then(response => {
      // Puter may return a string or an object depending on the environment/version
      let responseText = typeof response === 'string' ? response : '';
      if (!responseText && response) {
         responseText = response.text || (response.message && response.message.content && response.message.content[0] && response.message.content[0].text) || String(response);
      }
      
      const isMyth = responseText.toLowerCase().includes('myth') || responseText.toLowerCase().includes('false');
      const bg     = !isMyth ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)';
      const border = !isMyth ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)';
      const label  = !isMyth ? '✅ AI Fact Check: LIKELY TRUE' : '❌ AI Fact Check: LIKELY MYTH';
      
      res.innerHTML = `
        <div style="padding:14px;background:${bg};border:1px solid ${border};border-radius:var(--r)">
          <strong>${label}</strong>
          <br/>
          <span style="font-size:12px;color:var(--muted);margin-top:4px;display:block">${responseText}</span>
          <button onclick="shareMythWhatsApp(decodeURIComponent('${encodeURIComponent(input)}'), decodeURIComponent('${encodeURIComponent(responseText)}'), ${!isMyth})" style="margin-top:10px;background:#25D366;color:#fff;border:none;border-radius:var(--r);padding:6px 12px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px;">
            <i class="fab fa-whatsapp"></i> Share AI Fact
          </button>
        </div>`;
    }).catch(err => {
      console.error("Puter API Error in checkMyth:", err);
      res.innerHTML = `
        <div style="padding:12px;background:var(--glass);border:1px solid var(--border);border-radius:var(--r);font-size:13px;color:var(--muted)">
          🤔 Not found in database and AI is unavailable. Try rephrasing.
          <br><br><span style="font-size:11px;color:var(--rose)">Error: ${err?.message || err}</span>
        </div>`;
    });
  }
}

// ── Mini Quiz ────────────────────────────────────────────────────

/** mythNext — advances to the next myth question. */
function mythNext() {
  mythQuizIdx = (mythQuizIdx + 1) % myths.length;
  const el = document.getElementById('quiz-myth-q');
  el.textContent = myths[mythQuizIdx].text;
  el.style.color = 'var(--text)';
}

/**
 * mythAnswer — evaluates the user's Fact/Myth answer.
 * @param {boolean} ans  — true = Fact button, false = Myth button
 */
function mythAnswer(ans) {
  if (mythQuizIdx === -1) { mythNext(); return; }

  const correct = myths[mythQuizIdx].isFact === ans;
  const el      = document.getElementById('quiz-myth-q');

  if (correct) {
    mythScore++;
    el.style.color = 'var(--emerald)';
  } else {
    el.style.color = 'var(--rose)';
  }

  document.getElementById('myth-score').textContent =
    `Score: ${mythScore} correct${mythScore >= 10 ? ' 🏆 Myth Buster Champion!' : ''}`;

  setTimeout(mythNext, 800);
}

// ── Event: Enter key in myth-input ──────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const mi = document.getElementById('myth-input');
  if (mi) mi.addEventListener('keydown', e => { if (e.key === 'Enter') checkMyth(); });
});

// ── WhatsApp Sharing ─────────────────────────────────────────────
/**
 * shareMythWhatsApp — formats the myth/fact and rebuttal to share on WhatsApp
 */
function shareMythWhatsApp(claim, rebuttal, isFact) {
  const status = isFact ? '✅ *FACT:*' : '❌ *MYTH BUSTED:*';
  const message = `🩺 *Doton Health Fact Check*\n\n${status} ${claim}\n\n*The Truth:* ${rebuttal}\n\n👉 Stop misinformation! Fact-check claims using doton AI.`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
}
