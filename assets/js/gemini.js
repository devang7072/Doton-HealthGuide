/**
 * gemini.js — Gemini API connection + AI Chat (MediChat)
 * Handles: API key validation, message I/O, typing indicator,
 *          Markdown-lite formatting, auto-resize textarea
 */

// ── State ───────────────────────────────────────────────────────
let GEMINI_KEY   = '';
let chatHistory  = [];   // [{role, parts:[{text}]}, …]

// ── System prompt for MediChat ──────────────────────────────────
const HEALTH_SYSTEM = `You are MediChat AI, a knowledgeable and empathetic health assistant for the doton app. Guidelines:
1. Give clear, accurate, evidence-based health information.
2. Use simple language. Use bullet points for symptom lists.
3. Bold key terms using **term**.
4. Keep responses concise (4-6 sentences) unless detail is needed.
5. ALWAYS recommend consulting a licensed doctor for personal medical decisions.
6. For EMERGENCY symptoms (chest pain, breathing trouble, stroke signs, severe bleeding), immediately say "⚠️ EMERGENCY: Call 112 now."
7. Never diagnose or prescribe. Never replace professional care.
8. Be warm, non-judgmental, and supportive.`;

// ── Connect Puter (Auto-init) ──────────────────────────────────
function connectGemini() {
  // Puter doesn't need a key, so we just simulate a connection or check status
  document.getElementById('status-dot').className = 'status-dot ok';
  document.getElementById('chat-send').disabled = false;
  
  // Update the badge UI to show Puter is active
  const apiBadge = document.getElementById('api-status-badge');
  if(apiBadge) {
    apiBadge.innerHTML = '<span class="status-dot ok"></span> <span style="font-size:12px; font-weight:600; color:var(--emerald)">Puter.js Active</span>';
  }
}

// ── Send a message ──────────────────────────────────────────────
async function chatSend() {
  const ta   = document.getElementById('chat-ta');
  const text = ta.value.trim();
  if (!text) return;

  ta.value = '';
  ta.style.height = '48px';

  addChatMsg('user', text);
  
  // Prepare chat context (Puter doesn't strictly require full history in the same format,
  // but we build the prompt to include system instructions)
  const fullPrompt = `${HEALTH_SYSTEM}\n\nUser Question: ${text}`;

  const sendBtn = document.getElementById('chat-send');
  sendBtn.disabled = true;
  showTyping();

  try {
    // Using Gemini 3 Flash via Puter (as per their docs)
    const response = await puter.ai.chat(fullPrompt, {
        model: 'gemini-3-flash-preview',
        stream: true
    });

    removeTyping();
    
    // Create an empty bot bubble for streaming
    const box = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div'); msgDiv.className = 'msg bot';
    const av = document.createElement('div'); av.className = 'msg-av2'; av.textContent = 'M';
    const inner = document.createElement('div');
    const b = document.createElement('div'); b.className = 'bubble';
    const t = document.createElement('div');
    t.style.cssText = `font-size:10px;color:var(--faint);margin-top:4px`;
    t.textContent = now();

    inner.appendChild(b);
    inner.appendChild(t);
    msgDiv.appendChild(av);
    msgDiv.appendChild(inner);
    box.appendChild(msgDiv);

    let fullText = "";
    for await (const part of response) {
      if (part?.text) {
        fullText += part.text;
        b.innerHTML = fmtMD(fullText);
        box.scrollTop = box.scrollHeight;
      }
    }
    
    chatHistory.push({ role: 'user', parts: [{ text }] });
    chatHistory.push({ role: 'model', parts: [{ text: fullText }] });

  } catch (e) {
    console.error("Puter Error:", e);
    removeTyping();
    addChatMsg('bot', '⚠️ Puter AI Error. Please check your connection.');
  }

  sendBtn.disabled = false;
  document.getElementById('chat-ta').focus();
}

/**
 * chatAsk — navigate to chat page then fire a pre-filled question.
 * @param {string} q
 */
function chatAsk(q) {
  if (currentPage !== 'chat') showPage('chat');
  setTimeout(() => {
    document.getElementById('chat-ta').value = q;
    chatSend();
  }, 100);
}

// ── Chat UI helpers ─────────────────────────────────────────────

/** Returns current time as HH:MM */
function now() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * fmtMD — minimal Markdown → HTML converter
 * Supports: **bold**, - list items, newlines
 */
function fmtMD(t) {
  return t
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul style="margin:6px 0 0 16px">$1</ul>')
    .replace(/\n/g, '<br>');
}

/**
 * addChatMsg — creates and appends a chat bubble.
 * @param {'bot'|'user'} role
 * @param {string}       text
 */
function addChatMsg(role, text) {
  const box   = document.getElementById('chat-messages');
  const isBot = role === 'bot';

  const d  = document.createElement('div');  d.className = 'msg ' + role;
  const av = document.createElement('div');  av.className = 'msg-av2'; av.textContent = isBot ? 'M' : 'U';

  const inner = document.createElement('div');
  const b     = document.createElement('div'); b.className = 'bubble'; b.innerHTML = fmtMD(text);
  const t     = document.createElement('div');
  t.style.cssText = `font-size:10px;color:var(--faint);margin-top:4px${isBot ? '' : ';text-align:right'}`;
  t.textContent   = now();

  inner.appendChild(b);
  inner.appendChild(t);
  d.appendChild(av);
  d.appendChild(inner);
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

/** showTyping — renders the animated dots indicator */
function showTyping() {
  const box = document.getElementById('chat-messages');
  const d   = document.createElement('div'); d.className = 'msg bot'; d.id = 'typing-ind';
  const av  = document.createElement('div'); av.className = 'msg-av2'; av.textContent = 'M';
  const b   = document.createElement('div'); b.className = 'bubble';
  b.style   = 'padding:0;background:var(--navy3);border:1px solid var(--border);border-radius:4px 18px 18px 18px';
  b.innerHTML = '<div class="typing-b"><span></span><span></span><span></span></div>';
  d.appendChild(av);
  d.appendChild(b);
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

function removeTyping() {
  const t = document.getElementById('typing-ind');
  if (t) t.remove();
}

// ── Textarea: send on Enter, auto-resize ────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const ta = document.getElementById('chat-ta');
  if (!ta) return;

  ta.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); chatSend(); }
  });

  ta.addEventListener('input', function () {
    this.style.height = '48px';
    this.style.height = Math.min(this.scrollHeight, 140) + 'px';
  });
});
