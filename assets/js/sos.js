/**
 * Emergency SOS / Quick Contacts Feature
 * Handles saving emergency contact and triggering SOS with Geolocation and a safety countdown.
 */

let sosTimer = null;
let countdownValue = 5;

document.addEventListener('DOMContentLoaded', () => {
  // Initialization if needed
});

function triggerSOS() {
  const contact = localStorage.getItem('doton_emergency_contact');
  
  if (!contact) {
    openSOSConfig();
    return;
  }

  // If a timer is already running, treat the second click as a "CANCEL"
  if (sosTimer) {
    cancelSOS();
    return;
  }

  startSOSCountdown();
}

function startSOSCountdown() {
  const sosBtn = document.getElementById('floating-sos');
  if (!sosBtn) return;

  countdownValue = 5;
  const originalHtml = '<i class="fas fa-ambulance"></i>';
  
  // Visual feedback: Start countdown
  sosBtn.classList.add('sos-counting');
  sosBtn.innerHTML = `<span class="sos-countdown-num">${countdownValue}</span><span class="sos-cancel-text">CANCEL</span>`;
  
  if (typeof showToast === 'function') {
    showToast('SOS Triggered! Click button again to cancel.', 'info');
  }

  sosTimer = setInterval(() => {
    countdownValue--;
    
    if (countdownValue > 0) {
      sosBtn.querySelector('.sos-countdown-num').textContent = countdownValue;
    } else {
      // Execute SOS
      stopSOSCountdown();
      executeSOS();
    }
  }, 1000);
}

function cancelSOS() {
  stopSOSCountdown();
  if (typeof showToast === 'function') {
    showToast('SOS Alert Cancelled.', 'info');
  }
}

function stopSOSCountdown() {
  clearInterval(sosTimer);
  sosTimer = null;
  
  const sosBtn = document.getElementById('floating-sos');
  if (sosBtn) {
    sosBtn.classList.remove('sos-counting');
    sosBtn.innerHTML = '<i class="fas fa-ambulance"></i>';
  }
}

function executeSOS() {
  const contact = localStorage.getItem('doton_emergency_contact');
  const contactName = localStorage.getItem('doton_emergency_name') || 'Emergency Contact';
  const sosBtn = document.getElementById('floating-sos');
  
  const originalHtml = '<i class="fas fa-ambulance"></i>';
  sosBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

  // Get location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const mapLink = `https://www.google.com/maps?q=${lat},${lng}`;
        
        sendWhatsAppMessage(contact, mapLink, contactName);
        sosBtn.innerHTML = originalHtml;
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Could not get your location. Sending SOS without coordinates.");
        sendWhatsAppMessage(contact, "Location unavailable.", contactName);
        sosBtn.innerHTML = originalHtml;
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    alert("Geolocation is not supported by this browser. Sending SOS without coordinates.");
    sendWhatsAppMessage(contact, "Location unavailable.", contactName);
    sosBtn.innerHTML = originalHtml;
  }
}

function sendWhatsAppMessage(phone, locationText, name) {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = `🚨 *EMERGENCY!* I need help.\n\n📍 My location: ${locationText}\n\n_Sent to: ${name}_\n_via doton Health App_`;
  const encodedMessage = encodeURIComponent(message);
  
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  window.open(waUrl, '_blank');
}

function openSOSConfig() {
  const modal = document.getElementById('sos-config-modal');
  if (modal) {
    modal.style.display = 'flex';
    document.getElementById('sos-name-input').value = localStorage.getItem('doton_emergency_name') || '';
    document.getElementById('sos-contact-input').value = localStorage.getItem('doton_emergency_contact') || '';
  }
}

function closeSOSConfig() {
  const modal = document.getElementById('sos-config-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function saveSOSContact() {
  const nameInput = document.getElementById('sos-name-input').value.trim();
  const phoneInput = document.getElementById('sos-contact-input').value.trim();
  const errorDiv = document.getElementById('sos-error');
  
  if (!nameInput || !phoneInput) {
    errorDiv.textContent = 'Please enter both name and phone number.';
    errorDiv.style.display = 'block';
    return;
  }
  
  const cleanPhone = phoneInput.replace(/\D/g, '');
  if (cleanPhone.length < 10) {
    errorDiv.textContent = 'Please enter a valid phone number.';
    errorDiv.style.display = 'block';
    return;
  }
  
  localStorage.setItem('doton_emergency_name', nameInput);
  localStorage.setItem('doton_emergency_contact', cleanPhone);
  
  if (typeof showToast === 'function') {
    showToast('Emergency contact saved successfully!');
  }
  
  errorDiv.style.display = 'none';
  closeSOSConfig();
}
