// ─── Configuration ─────────────────────────────────────────
// Replace this URL with your deployed Google Apps Script Web App URL.
// See DEPLOYMENT_GUIDE.md for instructions.
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFSk4bcpEeqhkhTMskhCTTJ8X9AKEjemMyl-NNHjFERrt3AcYLAaMTJKfwh8mH7d0Cvg/exec';

// Menú móvil
document.querySelector('.nav-toggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.remove('open');
  });
});

// Galería local (funciona sin backend — GitHub Pages)
const MEDIA_FILES = [
  { file: 'pic-1.webp', type: 'image', w: 600, h: 450 },
  { file: 'pic-2.webp', type: 'image', w: 600, h: 450 },
  { file: 'pic-3.webp', type: 'image', w: 600, h: 450 },
  { file: 'pic-4.webp', type: 'image', w: 600, h: 450 },
  { file: 'pic-5.webp', type: 'image', w: 600, h: 450 },
  { file: 'pic-6.webp', type: 'image', w: 600, h: 450 },
  { file: 'pic-7.webp', type: 'image', w: 600, h: 450 },
  { file: 'pic-8.webp', type: 'image', w: 600, h: 450 },
  { file: 'DMZ-compressed.mp4', type: 'video' },
];

function loadGallery() {
  const grid = document.getElementById('media-grid');
  if (!grid) return;
  grid.innerHTML = MEDIA_FILES.map(f => {
    const url = 'media/' + encodeURIComponent(f.file);
    return '<div class="media-item">' +
      (f.type === 'video'
        ? '<video src="' + url + '" preload="none" muted controls></video>'
        : '<img src="' + url + '" loading="lazy" width="' + f.w + '" height="' + f.h + '" onclick="window.open(this.src,\'_blank\')" style="cursor:pointer;width:100%;height:auto"/>') +
      '</div>';
  }).join('');
}

// Limpiar errores al escribir
document.querySelectorAll('.assessment-field input, .assessment-field select').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.remove('error');
    const errorEl = document.getElementById(el.id + '-error');
    if (errorEl) errorEl.textContent = '';
  });
  el.addEventListener('change', () => {
    if (el.id === 'as-locations' && el.value) {
      el.classList.remove('error');
      const errorEl = document.getElementById(el.id + '-error');
      if (errorEl) errorEl.textContent = '';
    }
  });
});

// ─── Assessment Form / Lead Capture ────────────────────────

function validateField(id) {
  const el = document.getElementById(id);
  const errorEl = document.getElementById(id + '-error');
  let valid = true;
  let msg = '';
  if (el.hasAttribute('required') && !el.value.trim()) {
    valid = false;
    msg = 'Este campo es obligatorio';
  } else if (id === 'as-email' && el.value.trim()) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(el.value.trim())) { valid = false; msg = 'Correo electrónico inválido'; }
  } else if (id === 'as-phone' && el.value.trim()) {
    const digits = el.value.replace(/\D/g, '');
    if (digits.length < 7) { valid = false; msg = 'Ingrese al menos 7 dígitos'; }
  }
  el.classList.toggle('error', !valid);
  if (errorEl) errorEl.textContent = msg;
  return valid;
}

document.getElementById('assessment-form')?.addEventListener('submit', async function (e) {
  e.preventDefault();

  const fields = ['as-name', 'as-company', 'as-station', 'as-phone', 'as-email', 'as-locations'];
  const allValid = fields.every(f => validateField(f));
  if (!allValid) return;

  const form = this;
  const btn = form.querySelector('.assessment-submit');
  const formGrid = form.querySelector('.assessment-form-grid');
  const errorContainer = document.getElementById('assessment-error');
  const successContainer = document.getElementById('assessment-success');
  const investmentRange = document.querySelector('.investment-range');

  const payload = {
    name: document.getElementById('as-name').value.trim(),
    company: document.getElementById('as-company').value.trim(),
    station: document.getElementById('as-station').value.trim(),
    phone: document.getElementById('as-phone').value.trim(),
    email: document.getElementById('as-email').value.trim(),
    locations: document.getElementById('as-locations').value,
  };

  console.log('[DMZ Lead Capture] Submitting:', payload);

  btn.disabled = true;
  btn.textContent = 'Enviando...';

  if (errorContainer) errorContainer.classList.add('hidden');

  try {
    const params = new URLSearchParams(payload);

    console.log('[DMZ Lead Capture] Submitting as form-urlencoded');

    const res = await fetch(APPS_SCRIPT_URL, {
      redirect: 'follow',
      method: 'POST',
      body: params,
    });

    console.log('[DMZ Lead Capture] Response status:', res.status);

    const result = await res.json();
    console.log('[DMZ Lead Capture] Response body:', result);

    if (!res.ok || !result.success) {
      const msg = result.errors ? result.errors.join('. ') : 'Error al enviar el formulario';
      throw new Error(msg);
    }

    console.log('[DMZ Lead Capture] Success — lead saved to Google Sheets');

    formGrid.classList.add('hidden');
    btn.classList.add('hidden');
    if (investmentRange) investmentRange.classList.add('hidden');
    if (successContainer) successContainer.classList.remove('hidden');
  } catch (err) {
    console.error('[DMZ Lead Capture] Failed:', err.message);

    if (APPS_SCRIPT_URL === 'YOUR_WEB_APP_URL_HERE') {
      console.warn('[DMZ Lead Capture] APPS_SCRIPT_URL is still set to the placeholder. Update it with your deployed URL.');
    }

    btn.disabled = false;
    btn.textContent = 'Solicitar Evaluación Gratuita';

    if (errorContainer) {
      errorContainer.querySelector('.assessment-error-text').textContent = err.message || 'Error de conexión. Intente de nuevo.';
      errorContainer.classList.remove('hidden');
    }
  }
});

loadGallery();

// Calculadora de ingresos publicitarios
function setupRevenueCalculator() {
  const outdoor = document.getElementById('calc-outdoor');
  const indoor = document.getElementById('calc-indoor');
  const traffic = document.getElementById('calc-traffic');
  const rate = document.getElementById('calc-rate');
  if (!outdoor) return;

  function updateCalc() {
    const o = Number(outdoor.value) || 0;
    const i = Number(indoor.value) || 0;
    const r = Number(rate.value) || 0;
    const monthlyOutdoor = o * r;
    const monthlyIndoor = i * r;
    const total = monthlyOutdoor + monthlyIndoor;
    const annual = total * 12;
    document.getElementById('calc-outdoor-result').textContent = '$' + monthlyOutdoor.toLocaleString();
    document.getElementById('calc-indoor-result').textContent = '$' + monthlyIndoor.toLocaleString();
    document.getElementById('calc-total-monthly').textContent = '$' + total.toLocaleString();
    document.getElementById('calc-annual').textContent = '$' + annual.toLocaleString();
    document.getElementById('calc-5year').textContent = '$' + (annual * 5).toLocaleString();
  }

  outdoor.addEventListener('input', updateCalc);
  indoor.addEventListener('input', updateCalc);
  traffic.addEventListener('input', updateCalc);
  rate.addEventListener('input', updateCalc);
  updateCalc();
}

setupRevenueCalculator();
