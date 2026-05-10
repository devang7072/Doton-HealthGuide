/**
 * medicine.js — Medicine & Vaccine Reminder Tracker
 * Now backed by MongoDB via the Express API.
 * Falls back to in-memory if user is not logged in.
 */

let medAlerts = []; // local cache

// ── Load reminders from the server (called after login) ─────────
async function loadRemindersFromServer() {
  if (!isLoggedIn()) return;
  try {
    const reminders = await api.get('/reminders');
    // Map server fields to local format
    medAlerts = reminders.map(r => ({
      id  : r._id,
      name: r.name,
      type: r.type,
      time: r.time,
      note: r.note,
    }));
    renderMedAlerts();
  } catch (err) {
    console.error('Failed to load reminders:', err.message);
  }
}

/**
 * addMedAlert — reads form, saves to API (if logged in), re-renders.
 */
async function addMedAlert() {
  const name = document.getElementById('med-name').value.trim();
  const time = document.getElementById('med-time').value;
  const type = document.getElementById('med-type').value;
  const note = document.getElementById('med-note').value.trim();

  if (!name || !time || !type) {
    alert('Please fill in Name, Date/Time and Type.');
    return;
  }

  if (isLoggedIn()) {
    // ── Save to database ───────────────────────────────────────
    try {
      const saved = await api.post('/reminders', { name, type, time, note });
      medAlerts.push({
        id  : saved._id,
        name: saved.name,
        type: saved.type,
        time: saved.time,
        note: saved.note,
      });
      medAlerts.sort((a, b) => new Date(a.time) - new Date(b.time));
      renderMedAlerts();
    } catch (err) {
      alert('Could not save reminder: ' + err.message);
      return;
    }
  } else {
    // ── Session-only fallback (not logged in) ─────────────────
    medAlerts.push({ name, time, type, note, id: String(Date.now()) });
    medAlerts.sort((a, b) => new Date(a.time) - new Date(b.time));
    renderMedAlerts();
  }

  // Reset form
  ['med-name', 'med-time', 'med-note'].forEach(id => (document.getElementById(id).value = ''));
  document.getElementById('med-type').value = '';
}

/**
 * removeMed — deletes reminder from API (if logged in) and re-renders.
 * @param {string} id
 */
async function removeMed(id) {
  if (isLoggedIn()) {
    try {
      await api.delete(`/reminders/${id}`);
    } catch (err) {
      alert('Could not delete reminder: ' + err.message);
      return;
    }
  }
  medAlerts = medAlerts.filter(a => a.id !== id);
  renderMedAlerts();
}

/**
 * renderMedAlerts — rebuilds the reminder list UI.
 */
function renderMedAlerts() {
  const list = document.getElementById('med-list');
  if (!list) return;

  if (!medAlerts.length) {
    list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted);font-size:13px">No reminders yet. Add one!</div>';
    return;
  }

  list.innerHTML = medAlerts.map(a => `
    <div class="alert-item">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:14px;font-weight:700">${a.name}</span>
          <span class="badge badge-blue" style="font-size:10px">${a.type}</span>
        </div>
        ${a.note ? `<div style="font-size:12px;color:var(--muted)">${a.note}</div>` : ''}
        <div style="font-size:12px;color:var(--muted);margin-top:2px">
          <i class="far fa-clock"></i> ${new Date(a.time).toLocaleString()}
        </div>
      </div>
      <button
        onclick="removeMed('${a.id}')"
        style="background:none;border:none;color:var(--rose);cursor:pointer;font-size:18px;padding:4px"
        title="Remove reminder">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>`).join('');
}

/**
 * shareMedicineScheduleOnWhatsApp — Generates a WhatsApp share link for today's medicines.
 */
window.shareMedicineScheduleOnWhatsApp = function() {
  if (!medAlerts || medAlerts.length === 0) {
    alert("You have no active medicine reminders to share.");
    return;
  }

  let text = `📋 *Doton Medicine Schedule* 📋\n\n`;
  
  medAlerts.forEach((m, index) => {
    const timeStr = new Date(m.time).toLocaleString();
    text += `${index + 1}. *${m.name}* (${m.type})\n`;
    text += `   Time: ${timeStr}\n`;
    if (m.note) text += `   Note: ${m.note}\n`;
    text += `\n`;
  });

  text += `Stay healthy! Track your medicines on Doton: https://doton.netlify.app`;
  
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

/**
 * scanPrescription — Reads a medicine box or prescription photo using AI.
 */
window.scanPrescription = async function(event) {
  const file = event.target.files[0];
  if (!file) return;

  const btn = event.target.previousElementSibling.children[1];
  const oldText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scanning...';
  btn.disabled = true;

  try {
    // Convert file to DataURL just in case Puter prefers base64 over File objects
    const reader = new FileReader();
    reader.readAsDataURL(file);
    await new Promise(res => reader.onload = res);
    const base64Image = reader.result;

    const prompt = `You are a medical AI. Analyze this medical prescription or medicine package. Extract the main medicine/vaccine. Return ONLY a valid JSON object in this exact format:
    {
      "name": "Extracted Medicine Name",
      "type": "Medicine",
      "note": "Dosage instructions if any"
    }
    If you cannot read it or it is not a medicine, return {"error": "Could not read the medicine name"}.`;

    const response = await puter.ai.chat(
      [prompt, base64Image], 
      { model: 'gemini-1.5-flash' }
    );
    
    let rawText = '';
    if (typeof response === 'string') rawText = response;
    else if (response?.message?.content) rawText = response.message.content;
    else if (response?.text) rawText = response.text;
    else rawText = JSON.stringify(response);
    
    rawText = rawText.trim();
    console.log("Raw AI Vision Response:", rawText);

    // Try to extract JSON using Regex (foolproof against markdown padding)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      alert(`AI couldn't understand the image.\nWhat it said: ${rawText}`);
      return;
    }

    let data;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      alert(`AI tried to read it but failed formatting.\nRaw output: ${rawText}`);
      return;
    }

    if (data.error) {
      alert("AI says: " + data.error);
      return;
    }

    const medName = data.name || data.MedicineName || data.medicine || '';
    if (!medName) {
      alert(`AI scanned the image but couldn't find a medicine name.\nRaw output: ${rawText}`);
      return;
    }

    document.getElementById('med-name').value = medName;
    document.getElementById('med-type').value = data.type || 'Medicine';
    document.getElementById('med-note').value = data.note || '';

    // Default to tomorrow 8 AM
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(8, 0, 0, 0);
    const pad = (n) => n.toString().padStart(2, '0');
    const dtStr = `${tmrw.getFullYear()}-${pad(tmrw.getMonth()+1)}-${pad(tmrw.getDate())}T${pad(tmrw.getHours())}:${pad(tmrw.getMinutes())}`;
    document.getElementById('med-time').value = dtStr;

    alert(`✅ Scanned successfully: ${medName}. Please verify the details before adding.`);

  } catch (err) {
    console.error("Vision Error:", err);
    alert('Failed to scan prescription: ' + err.message);
  } finally {
    btn.innerHTML = oldText;
    btn.disabled = false;
    event.target.value = ''; // reset file input
  }
};
