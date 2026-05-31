const API = window.location.origin + '/api';

// Menú móvil
document.querySelector('.nav-toggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
});

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.remove('open');
  });
});

// Galería
async function loadGallery() {
  const grid = document.getElementById('media-grid');
  if (!grid) return;
  try {
    const files = await (await fetch(API + '/media')).json();
    if (files.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#8a9aa8;padding:40px">Galería próximamente</p>';
      return;
    }
    grid.innerHTML = files.map(f => {
      const isVideo = f.filename.match(/\.(mp4|mov|avi)$/i);
      return '<div class="media-item">' +
        (isVideo
          ? '<video src="' + f.url + '" preload="metadata" muted></video>'
          : '<img src="' + f.url + '" loading="lazy" onclick="window.open(this.src,\'_blank\')" style="cursor:pointer"/>') +
        '</div>';
    }).join('');
  } catch (err) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#8a9aa8;padding:40px">Galería no disponible</p>';
  }
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
    const res = await fetch(API + '/leads/public', {
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
    btn.textContent = 'Error — intenta de nuevo';
    btn.disabled = false;
  }
});

loadGallery().catch(() => {});
