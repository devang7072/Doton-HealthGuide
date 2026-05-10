/**
 * vitals.js — Handles logging vitals and rendering Chart.js visualizations.
 */

let healthChart = null;
let vitalsData = [];

/**
 * updateVitalUnit — Updates the unit label in the form based on selected metric.
 */
function updateVitalUnit() {
  const type = document.getElementById('vital-type').value;
  const unitEl = document.getElementById('vital-unit');
  
  const units = {
    bp_systolic : 'mmHg',
    bp_diastolic: 'mmHg',
    heart_rate  : 'bpm',
    blood_sugar : 'mg/dL',
    weight      : 'kg',
    temperature : '°C',
    oxygen_level: '%'
  };
  
  if (unitEl) unitEl.textContent = units[type] || '';
}

/**
 * addHealthLog — Saves a new reading to the backend.
 */
async function addHealthLog() {
  const type  = document.getElementById('vital-type').value;
  const value = document.getElementById('vital-value').value;
  const note  = document.getElementById('vital-note').value.trim();

  if (!value) {
    alert("Please enter a value.");
    return;
  }

  if (!isLoggedIn()) {
    alert("Please login to save your health vitals.");
    openAuthModal('login');
    return;
  }

  try {
    const payload = {
      metricType: type,
      value: parseFloat(value),
      notes: note
    };

    await api.post('/health-log', payload);
    
    // Clear form
    document.getElementById('vital-value').value = '';
    document.getElementById('vital-note').value = '';
    
    showAuthSuccess("Vitals logged successfully! 📊");
    
    // Refresh data
    loadVitalsFromServer();
  } catch (err) {
    console.error("Error saving vitals:", err);
    alert("Failed to save reading: " + err.message);
  }
}

/**
 * loadVitalsFromServer — Fetches logs from API and updates UI.
 */
async function loadVitalsFromServer() {
  if (!isLoggedIn()) return;

  try {
    // Fetch last 100 logs
    vitalsData = await api.get('/health-log');
    
    renderVitalsHistory();
    loadHealthChart();
  } catch (err) {
    console.error("Error loading vitals:", err);
  }
}

/**
 * renderVitalsHistory — Renders the list of recent logs.
 */
function renderVitalsHistory() {
  const listEl = document.getElementById('vitals-history-list');
  if (!listEl) return;

  if (vitalsData.length === 0) {
    listEl.innerHTML = `<div style="text-align:center;padding:30px;color:var(--muted);font-size:13px">No logs recorded yet.</div>`;
    return;
  }

  // Sort by date descending
  const sorted = [...vitalsData].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));

  listEl.innerHTML = sorted.map(log => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid var(--border);font-size:13px">
      <div>
        <div style="font-weight:700;color:var(--text)">${formatVitalType(log.metricType)}</div>
        <div style="font-size:11px;color:var(--muted)">${new Date(log.loggedAt).toLocaleString()}</div>
        ${log.notes ? `<div style="font-size:11px;color:var(--indigo);margin-top:2px italic">"${log.notes}"</div>` : ''}
      </div>
      <div style="text-align:right">
        <div style="font-size:15px;font-weight:800;color:var(--indigo)">${log.value} <span style="font-size:11px;font-weight:400">${log.unit}</span></div>
        <button onclick="deleteHealthLog('${log._id}')" style="background:none;border:none;color:var(--rose);font-size:11px;cursor:pointer;padding:0;margin-top:4px">Delete</button>
      </div>
    </div>
  `).join('');
}

/**
 * deleteHealthLog — Deletes a reading.
 */
async function deleteHealthLog(id) {
  if (!confirm("Are you sure you want to delete this reading?")) return;

  try {
    await api.delete(`/health-log/${id}`);
    loadVitalsFromServer();
  } catch (err) {
    alert("Error deleting log: " + err.message);
  }
}

/**
 * loadHealthChart — Renders the interactive trend chart.
 */
function loadHealthChart() {
  const canvas = document.getElementById('healthChart');
  if (!canvas) return;

  const metric = document.getElementById('chart-metric-selector').value;
  
  // Filter data for the selected metric
  const filtered = vitalsData
    .filter(d => d.metricType === metric)
    .sort((a, b) => new Date(a.loggedAt) - new Date(b.loggedAt));

  const labels = filtered.map(d => new Date(d.loggedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }));
  const values = filtered.map(d => d.value);

  // Destroy existing chart if it exists
  if (healthChart) {
    healthChart.destroy();
  }

  const ctx = canvas.getContext('2d');
  
  // Gradient for the line
  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)');
  gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

  healthChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: formatVitalType(metric),
        data: values,
        borderColor: '#6366f1',
        backgroundColor: gradient,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
          padding: 10,
          displayColors: false
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#94a3b8', font: { size: 10 } }
        }
      }
    }
  });
}

function formatVitalType(type) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * downloadVitalsPDF — Generates a PDF report of the user's health logs.
 */
window.downloadVitalsPDF = function() {
  if (vitalsData.length === 0) {
    alert("No vitals data available to download.");
    return;
  }

  const btn = event.currentTarget;
  const oldHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  btn.disabled = true;

  // 1. Create a temporary container for the PDF content
  const printDiv = document.createElement('div');
  printDiv.style.padding = '40px';
  printDiv.style.fontFamily = 'Arial, sans-serif';
  printDiv.style.color = '#333';
  printDiv.style.background = '#fff';

  // Sort data descending
  const sorted = [...vitalsData].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));

  // Generate Table Rows
  const rows = sorted.map(log => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 12px 8px;">${new Date(log.loggedAt).toLocaleDateString()}</td>
      <td style="padding: 12px 8px; font-weight: bold;">${formatVitalType(log.metricType)}</td>
      <td style="padding: 12px 8px; color: #4f46e5; font-weight: bold;">${log.value} ${log.unit}</td>
      <td style="padding: 12px 8px; font-style: italic; color: #666;">${log.notes || '-'}</td>
    </tr>
  `).join('');

  // Build the HTML structure
  printDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px;">
      <h1 style="color: #4f46e5; margin: 0 0 10px 0;">Doton Health Report</h1>
      <p style="margin: 0; color: #666;">Generated on: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;">
      <thead>
        <tr style="background: #f8fafc; border-bottom: 2px solid #ddd;">
          <th style="padding: 12px 8px;">Date</th>
          <th style="padding: 12px 8px;">Metric</th>
          <th style="padding: 12px 8px;">Reading</th>
          <th style="padding: 12px 8px;">Notes</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    
    <div style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
      <p>This report was generated automatically by Doton. Please consult a doctor for medical advice.</p>
    </div>
  `;

  // 2. Configure html2pdf
  const opt = {
    margin:       0.5,
    filename:     'Doton_Health_Report.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // 3. Generate PDF
  html2pdf().set(opt).from(printDiv).save().then(() => {
    btn.innerHTML = oldHTML;
    btn.disabled = false;
  }).catch(err => {
    console.error("PDF Error:", err);
    alert("Failed to generate PDF.");
    btn.innerHTML = oldHTML;
    btn.disabled = false;
  });
};
