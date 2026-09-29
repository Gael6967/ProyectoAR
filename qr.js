'use strict';
(() => {
  const input = document.getElementById('site-url');
  let svg = '';
  function generate(event) {
    event?.preventDefault();
    const error = document.getElementById('qr-error');
    error.textContent = '';
    try {
      const url = new URL(input.value.trim());
      if (url.protocol !== 'https:') throw new Error('Usa una dirección HTTPS publicada para permitir la cámara en el teléfono.');
      const host = url.hostname.toLowerCase();
      if (host === 'localhost' || host.endsWith('.localhost') || /^(127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) || host.includes(':')) throw new Error('Usa la dirección pública de GitHub Pages, no una dirección local.');
      if (url.username || url.password) throw new Error('La URL no debe contener credenciales.');
      if (url.href.length > 800) throw new Error('La URL es demasiado larga. Usa la dirección principal del proyecto.');
      const qr = qrcode(0, 'M');
      qr.addData(url.href); qr.make();
      // Quiet zone is at least four modules wide.
      svg = qr.createSvgTag({cellSize:6, margin:24, scalable:true});
      document.getElementById('qr-image').innerHTML = svg;
      document.getElementById('qr-url').textContent = url.href;
      document.getElementById('qr-result').hidden = false;
      input.value = url.href;
    } catch (e) { error.textContent = e.message; document.getElementById('qr-result').hidden = true; }
  }
  document.getElementById('qr-form').addEventListener('submit', generate);
  document.getElementById('qr-print').addEventListener('click', () => window.print());
  document.getElementById('qr-download').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([svg], {type:'image/svg+xml'}));
    const a = document.createElement('a'); a.href = url; a.download = 'AR-Maintenance-QR.svg'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  const base = new URL('./', location.href);
  if (base.protocol === 'https:' && base.hostname !== 'localhost' && !base.hostname.startsWith('127.')) {
    input.value = base.href;
    document.getElementById('local-notice').hidden = true;
    generate();
  }
})();
