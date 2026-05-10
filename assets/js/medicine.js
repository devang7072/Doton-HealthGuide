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
    const prompt = `Analyze this medical prescription or medicine package. Extract the main medicine/vaccine. Return ONLY a valid JSON object in this exact format:
    {
      "name": "Medicine Name (e.g. Paracetamol)",
      "type": "Medicine" or "Vaccination",
      "note": "Dosage instructions (e.g. 500mg twice a day)"
    }
    Do not wrap it in markdown block quotes, just pure JSON.`;

    // Puter AI vision call
    const response = await puter.ai.chat(
      [prompt, file], 
      { model: 'gemini-1.5-flash' }
    );
    
    // Puter API might return a string directly or an object depending on the version
    let rawText = '';
    if (typeof response === 'string') {
      rawText = response;
    } else if (response && response.message && response.message.content) {
      rawText = response.message.content;
    } else if (response && response.text) {
      rawText = response.text;
    } else {
      rawText = JSON.stringify(response);
    }
    
    rawText = rawText.trim();
    console.log("Raw AI Vision Response:", rawText);

    let jsonStr = rawText;
    if (jsonStr.startsWith('\`\`\`json')) jsonStr = jsonStr.substring(7, jsonStr.length - 3);
    else if (jsonStr.startsWith('\`\`\`')) jsonStr = jsonStr.substring(3, jsonStr.length - 3);

    let data;
    try {
      data = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw Text:", rawText);
      alert(`AI tried to read it but didn't return perfect data.\nRaw output: ${rawText}`);
      return;
    }

    document.getElementById('med-name').value = data.name || '';
    document.getElementById('med-type').value = data.type || 'Medicine';
    document.getElementById('med-note').value = data.note || '';

    // Default to tomorrow 8 AM
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    tmrw.setHours(8, 0, 0, 0);
    // Format for datetime-local: YYYY-MM-DDThh:mm
    const pad = (n) => n.toString().padStart(2, '0');
    const dtStr = `${tmrw.getFullYear()}-${pad(tmrw.getMonth()+1)}-${pad(tmrw.getDate())}T${pad(tmrw.getHours())}:${pad(tmrw.getMinutes())}`;
    document.getElementById('med-time').value = dtStr;

    alert(`✅ Scanned successfully: ${data.name}. Please verify the details before adding.`);

  } catch (err) {
    console.error("Vision Error:", err);
    alert('Failed to scan prescription: ' + err.message);
  } finally {
    btn.innerHTML = oldText;
    btn.disabled = false;
    event.target.value = ''; // reset file input
  }
};
