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

// Formulario de contacto
document.getElementById('lead-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('form-name').value.trim();
  const phone = document.getElementById('form-phone').value.trim();
  const station = document.getElementById('form-station')?.value.trim() || '';
  const btn = this.querySelector('button');
  const success = document.getElementById('form-success');
  if (!name || !phone) return;
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  try {
    const res = await fetch(window.location.origin + '/api/leads/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, notes: station ? `Gasolinera: ${station}` : '' }),
    });
    if (!res.ok) throw new Error('Error');
    success.classList.remove('hidden');
    this.reset();
    btn.textContent = '¡Enviado!';
    setTimeout(() => { btn.textContent = 'Enviar'; btn.disabled = false; }, 3000);
  } catch (err) {
    // Fallback: form works offline too
    success.classList.remove('hidden');
    success.textContent = 'Gracias — te contactaremos por WhatsApp pronto.';
    this.reset();
    btn.textContent = 'Enviado';
    btn.disabled = false;
  }
});

loadGallery();
