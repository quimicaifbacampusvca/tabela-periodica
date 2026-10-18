/* Reprodução da prévia 06 aprovada: sem redesenho, sempre ao abrir a página. */
(() => {
  'use strict';
  const intro = document.getElementById('brand-intro');
  const video = intro?.querySelector('.approved-intro-video');
  const skip = document.getElementById('intro-skip');
  if (!intro || !video || !skip) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = false, run = 0, watchdog = null, fadeTimer = null;
  const blocked = () => motion.matches || window.CordelAccess?.reduced() ||
    window.CordelAccess?.state.intro === false;
  function stop() {
    run++;
    active = false;
    clearTimeout(watchdog);
    clearTimeout(fadeTimer);
    watchdog = fadeTimer = null;
    video.pause();
    intro.hidden = true;
    intro.classList.remove('intro-leaving');
    document.removeEventListener('keydown', keySkip);
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
    intro.hidden = false;
    const remaining = Number.isFinite(video.duration) ? video.duration - video.currentTime : 12;
    watchdog = setTimeout(stop, Math.max(0, remaining) * 1000 + 3000);
  });
  video.addEventListener('ended', () => {
    if (!active) return;
    clearTimeout(watchdog);
    intro.classList.add('intro-leaving');
    fadeTimer = setTimeout(stop, 350);
  });
  video.addEventListener('error', stop);
  skip.addEventListener('click', stop);
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', event => { if (event.persisted) start(); });
  document.addEventListener('change', () => { if (active && blocked()) stop(); });
  motion.addEventListener?.('change', () => { if (active && blocked()) stop(); });
  start();
})();
