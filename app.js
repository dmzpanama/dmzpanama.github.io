const API = window.location.origin + '/api';

// Mobile nav toggle
document.querySelector('.nav-toggle')?.addEventListener('click', () => {
  document.querySelector('.nav-links')?.classList.toggle('open');
});

// Close nav on link click
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.remove('open');
  });
});

// Gallery
async function loadGallery() {
  const grid = document.getElementById('media-grid');
  if (!grid) return;
  try {
    const files = await (await fetch(API + '/media')).json();
    if (files.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#8a9aa8;padding:40px">Gallery coming soon</p>';
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
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#8a9aa8;padding:40px">Gallery unavailable</p>';
  }
}

// Lead form
document.getElementById('lead-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('form-name').value.trim();
  const phone = document.getElementById('form-phone').value.trim();
  const station = document.getElementById('form-station')?.value.trim() || '';
  const btn = this.querySelector('button');
  const success = document.getElementById('form-success');
  if (!name || !phone) return;
  btn.disabled = true;
  btn.textContent = 'Sending...';
  try {
    const res = await fetch(API + '/leads/public', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, notes: station ? `Station: ${station}` : '' }),
    });
    if (!res.ok) throw new Error('Error');
    success.classList.remove('hidden');
    this.reset();
    btn.textContent = 'Sent!';
    setTimeout(() => { btn.textContent = 'Send'; btn.disabled = false; }, 3000);
  } catch (err) {
    btn.textContent = 'Error — try again';
    btn.disabled = false;
  }
});

loadGallery().catch(() => {});
