/**
 * myth.js — Health Myth Buster + Myth Mini-Quiz
 * Handles: myth database rendering, myth checker input,
 *          interactive fact/myth mini quiz with scoring
 */

// ── Myth database ────────────────────────────────────────────────
const myths = [
  { text: 'Eating garlic cures cold',                          isFact: false },
  { text: 'Drinking turmeric milk boosts immunity',            isFact: true  },
  { text: 'COVID-19 spreads through 5G towers',                isFact: false },
  { text: 'Regular exercise improves heart health',            isFact: true  },
  { text: 'Cracking knuckles causes arthritis',                isFact: false },
  { text: 'Vaccines cause autism',                             isFact: false },
  { text: 'Eating carrots improves night vision dramatically', isFact: false },
  { text: 'Eggs are bad for your heart',                       isFact: false },
  { text: 'Green tea helps in weight loss',                    isFact: true  },
  { text: 'Eating fat makes you fat',                          isFact: false },
  { text: 'Antibiotics cure viral infections',                 isFact: false },
  { text: 'Shaving makes hair grow back thicker',              isFact: false },
  { text: 'Sugar makes kids hyperactive',                      isFact: false },
  { text: 'Cold weather directly causes colds',                isFact: false },
  { text: 'Stress can cause gray hair',                        isFact: true  },
  { text: 'All cholesterol is bad',                            isFact: false },
  { text: 'Dark chocolate is good for the heart',              isFact: true  },
  { text: 'Washing hands prevents infections',                 isFact: true  },
  { text: 'Flu shot gives you the flu',                        isFact: false },
  { text: 'Sleeping 7-8 hours improves immunity',              isFact: true  },
  { text: 'Eating fish improves brain power',                  isFact: true  },
  { text: 'Yoga reduces stress',                               isFact: true  },
  { text: 'Skipping meals is the best way to lose weight',     isFact: false },
  { text: 'Sunscreen is needed only in summer',                isFact: false },
  { text: 'Honey helps soothe a sore throat',                  isFact: true  },
  { text: 'Coconut water is good for hydration',               isFact: true  },
  { text: 'You must drink exactly 8 glasses of water daily',   isFact: false },
  { text: 'Mental health is as important as physical health',  isFact: true  },
  { text: 'Eating spicy food causes ulcers',                   isFact: false },
  { text: 'Iron-rich food helps prevent anemia',               isFact: true  },
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
    <div class="myth-item">
      <span>${m.text}</span>
      <span class="fact-tag" style="${
        m.isFact
          ? 'background:rgba(16,185,129,.15);color:#34d399;border:1px solid rgba(16,185,129,.25)'
          : 'background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.25)'
      }">${m.isFact ? 'Fact ✅' : 'Myth ❌'}</span>
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
        <span style="font-size:12px;color:var(--muted);margin-top:4px;display:block">"${found.text}"</span>
      </div>`;
  } else {
    // FALLBACK TO PUTER AI
    res.innerHTML = `
      <div style="padding:12px;background:var(--glass);border:1px solid var(--border);border-radius:var(--r);font-size:13px;color:var(--muted)">
        <i class="fas fa-robot fa-spin" style="margin-right:8px"></i> Consulting doton AI…
      </div>`;
    
    puter.ai.chat(`Classify this health claim as FACT or MYTH and provide a 1-sentence explanation: "${input}"`, {
      model: 'gemini-3-flash-preview'
    }).then(response => {
      const isMyth = response.toLowerCase().includes('myth') || response.toLowerCase().includes('false');
      const bg     = !isMyth ? 'rgba(16,185,129,.1)' : 'rgba(239,68,68,.1)';
      const border = !isMyth ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)';
      const label  = !isMyth ? '✅ AI Fact Check: LIKELY TRUE' : '❌ AI Fact Check: LIKELY MYTH';
      
      res.innerHTML = `
        <div style="padding:14px;background:${bg};border:1px solid ${border};border-radius:var(--r)">
          <strong>${label}</strong>
          <br/>
          <span style="font-size:12px;color:var(--muted);margin-top:4px;display:block">${response}</span>
        </div>`;
    }).catch(err => {
      res.innerHTML = `
        <div style="padding:12px;background:var(--glass);border:1px solid var(--border);border-radius:var(--r);font-size:13px;color:var(--muted)">
          🤔 Not found in database and AI is unavailable. Try rephrasing.
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
