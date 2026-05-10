/**
 * quiz.js — Health Awareness Quiz (10 Questions)
 * Handles: quiz start/restart, question loading, answer evaluation,
 *          progress bar, score display
 */

// ── Question bank ────────────────────────────────────────────────
const questions = [
  {
    q    : 'What is the recommended daily water intake for an average adult?',
    opts : ['2 liters', '8 liters', '500ml', '4 liters'],
    ans  : 0,
    exp  : 'Around 2 liters (8 cups) per day is generally recommended, though needs vary by individual.',
  },
  {
    q    : 'Which vitamin do we get primarily from sunlight?',
    opts : ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin B12'],
    ans  : 2,
    exp  : 'Vitamin D is synthesized in skin when exposed to sunlight. Deficiency is common in people who spend little time outdoors.',
  },
  {
    q    : 'What does BMI stand for?',
    opts : ['Body Mass Index', 'Basic Metabolic Indicator', 'Blood Mineral Intake', 'Bone Mass Information'],
    ans  : 0,
    exp  : 'BMI (Body Mass Index) is derived from height and weight, used to screen for weight categories.',
  },
  {
    q    : 'Which organ produces insulin?',
    opts : ['Liver', 'Kidney', 'Pancreas', 'Stomach'],
    ans  : 2,
    exp  : 'The pancreas produces insulin, a hormone that regulates blood sugar. Diabetes occurs when insulin production or function is impaired.',
  },
  {
    q    : 'How many hours of sleep do adults generally need?',
    opts : ['4-5 hours', '6 hours', '7-9 hours', '10-12 hours'],
    ans  : 2,
    exp  : 'Most adults need 7-9 hours of quality sleep per night for optimal health and cognitive function.',
  },
  {
    q    : 'Which food group is the best source of protein?',
    opts : ['Fruits', 'Grains', 'Legumes and meat', 'Vegetables'],
    ans  : 2,
    exp  : 'Legumes, meat, fish, eggs, and dairy are excellent protein sources essential for muscle repair and growth.',
  },
  {
    q    : 'What is a normal resting heart rate for adults?',
    opts : ['40-50 bpm', '60-100 bpm', '120-140 bpm', '150-160 bpm'],
    ans  : 1,
    exp  : 'A normal resting heart rate for adults is 60-100 beats per minute. Athletes may have lower resting rates.',
  },
  {
    q    : 'Which of these helps prevent tooth decay?',
    opts : ['Sugar', 'Fluoride', 'Coffee', 'Acidic drinks'],
    ans  : 1,
    exp  : 'Fluoride strengthens tooth enamel and helps prevent cavities. It is found in most toothpastes and some water supplies.',
  },
  {
    q    : 'What does the acronym F.A.S.T. stand for in stroke recognition?',
    opts : ['Fever, Arms, Speech, Time', 'Face, Arms, Speech, Time', 'Feel, Ache, Sight, Temperature', 'Fast, Act, Save, Transport'],
    ans  : 1,
    exp  : 'FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Quick recognition saves lives.',
  },
  {
    q    : "Which type of fat is considered 'healthy'?",
    opts : ['Trans fat', 'Saturated fat', 'Monounsaturated fat', 'Hydrogenated fat'],
    ans  : 2,
    exp  : 'Monounsaturated fats (olive oil, avocados, nuts) are heart-healthy and can reduce bad cholesterol levels.',
  },
];

// ── Quiz state ───────────────────────────────────────────────────
let qIdx      = 0;
let qScore    = 0;
let qAnswered = false;

// ── Public functions ─────────────────────────────────────────────

/** startQuiz — resets state and shows first question. */
function startQuiz() {
  qIdx   = 0;
  qScore = 0;
  document.getElementById('quiz-welcome').style.display = 'none';
  document.getElementById('quiz-result').style.display  = 'none';
  document.getElementById('quiz-play').style.display    = 'block';
  loadQ();
}

/** loadQ — renders the current question and answer options. */
function loadQ() {
  qAnswered = false;
  const q = questions[qIdx];

  document.getElementById('q-num').textContent      = qIdx + 1;
  document.getElementById('q-score').textContent    = qScore;
  document.getElementById('q-progress').style.width = ((qIdx / questions.length) * 100) + '%';
  document.getElementById('q-text').textContent     = q.q;
  document.getElementById('q-explain').style.display   = 'none';
  document.getElementById('q-next-btn').style.display  = 'none';

  const opts = document.getElementById('q-options');
  opts.innerHTML = q.opts
    .map((o, i) => `<button class="quiz-opt" onclick="answerQ(${i})">${String.fromCharCode(65 + i)}. ${o}</button>`)
    .join('');
}

/**
 * answerQ — marks correct/wrong, shows explanation, reveals Next button.
 * @param {number} i  — index of chosen option
 */
function answerQ(i) {
  if (qAnswered) return;
  qAnswered = true;

  const q    = questions[qIdx];
  const btns = document.querySelectorAll('.quiz-opt');

  btns.forEach((btn, idx) => {
    if (idx === q.ans)            btn.classList.add('correct');
    else if (idx === i && i !== q.ans) btn.classList.add('wrong');
    btn.disabled = true;
  });

  if (i === q.ans) qScore++;

  document.getElementById('q-explain').textContent    = '💡 ' + q.exp;
  document.getElementById('q-explain').style.display  = 'block';
  document.getElementById('q-next-btn').style.display = 'block';
}

/** nextQ — advances to next question or shows result. */
function nextQ() {
  qIdx++;
  if (qIdx >= questions.length) {
    showResult();
  } else {
    loadQ();
  }
}

/** showResult — renders final score and message. */
function showResult() {
  document.getElementById('quiz-play').style.display   = 'none';
  document.getElementById('quiz-result').style.display = 'block';
  document.getElementById('final-score').textContent   = qScore;

  const msgs = [
    'Keep learning! Health knowledge saves lives.',
    'Good effort! Keep exploring health topics.',
    'Well done! You know your health basics.',
    'Excellent! You\'re health savvy!',
    'Perfect score! You\'re a health champion! 🏆',
  ];
  document.getElementById('result-msg').textContent  = msgs[Math.min(Math.floor(qScore / 2.5), 4)];
  document.getElementById('result-icon').textContent = qScore >= 8 ? '🏆' : qScore >= 5 ? '🎉' : '📚';
}

/** restartQuiz — hides result and starts fresh. */
function restartQuiz() {
  document.getElementById('quiz-result').style.display = 'none';
  startQuiz();
}
