/* Reprodução da prévia 06 aprovada: sem redesenho, sempre ao abrir a página. */
(() => {
  'use strict';
  const intro = document.getElementById('brand-intro');
  const video = intro?.querySelector('.approved-intro-video');
  const canvas = intro?.querySelector('.approved-intro-canvas');
  const skip = document.getElementById('intro-skip');
  if (!intro || !video || !canvas || !skip) return;
  // A imagem passa pelo mesmo compositor sRGB da página, sem tratamento de vídeo HDR.
  let context;
  try { context = canvas.getContext('2d', {alpha:false, colorSpace:'srgb'}); } catch { return; }
  if (!context) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, run = 0, watchdog = null, fadeTimer = null, frame = null, lastPaint = -Infinity;
  const blocked = () => motion.matches || window.CordelAccess?.reduced() ||
    window.CordelAccess?.state.intro === false;
  function stop() {
    run++;
    active = false;
    clearTimeout(watchdog);
    clearTimeout(fadeTimer);
    cancelAnimationFrame(frame);
    frame = null;
    watchdog = fadeTimer = null;
    video.pause();
    intro.hidden = true;
    intro.classList.remove('intro-leaving');
    document.documentElement.classList.remove('intro-active');
    document.removeEventListener('keydown', keySkip);
  }
  function paint() {
    try { context.drawImage(video, 0, 0, canvas.width, canvas.height); return true; }
    catch { stop(); return false; }
  }
  function animate(time) {
    frame = null;
    if (!active || video.ended) return;
    if (time - lastPaint >= 1000 / 30 - 1) {
      if (!paint()) return;
      lastPaint = time;
    }
    frame = requestAnimationFrame(animate);
  }
  function keySkip(event) {
    if (['Escape', 'Enter', ' ', 'Tab'].includes(event.key)) stop();
  }
  function start() {
    stop();
    if (blocked()) return;
    active = true;
    const currentRun = run;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    if (!video.getAttribute('src')) video.src = video.dataset.src;
    video.currentTime = 0;
    lastPaint = -Infinity;
    document.addEventListener('keydown', keySkip);
    // Carregamento ou reprodução indisponíveis nunca bloqueiam o catálogo.
    watchdog = setTimeout(stop, 8000);
    try {
      const playback = video.play();
      playback?.catch(() => { if (currentRun === run) stop(); });
    } catch { stop(); }
  }
  video.addEventListener('playing', () => {
    if (!active || blocked()) { stop(); return; }
    clearTimeout(watchdog);
    cancelAnimationFrame(frame);
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 720;
    if (!paint()) return;
    // A borda da cena e o fundo da página recebem a mesma cor decodificada.
    try {
      const [r,g,b] = context.getImageData(2,2,1,1).data;
      intro.style.setProperty('--intro-paper', `rgb(${r},${g},${b})`);
    } catch { /* O fundo de marca permanece como alternativa. */ }
    intro.hidden = false;
    document.documentElement.classList.add('intro-active');
    frame = requestAnimationFrame(animate);
    const remaining = Number.isFinite(video.duration) ? video.duration - video.currentTime : 12;
    watchdog = setTimeout(stop, Math.max(0, remaining) * 1000 + 3000);
  });
  video.addEventListener('ended', () => {
    if (!active) return;
    clearTimeout(watchdog);
    cancelAnimationFrame(frame);
    frame = null;
    if (!paint()) return;
    intro.classList.add('intro-leaving');
    fadeTimer = setTimeout(stop, 500);
  });
  video.addEventListener('error', stop);
  skip.addEventListener('click', stop);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  document.addEventListener('change', () => { if (active && blocked()) stop(); });
  motion.addEventListener?.('change', () => { if (active && blocked()) stop(); });
  start();
})();
