/* Abertura Cordel: renderização nativa + passagem contínua para a página.
   A arte do vídeo e o logotipo não são redesenhados por esta mecânica. */
(() => {
  'use strict';
  const intro = document.getElementById('brand-intro');
  const stage = intro?.querySelector('.intro-stage');
  const video = intro?.querySelector('.approved-intro-video');
  const closingLogo = intro?.querySelector('.intro-end-logo');
  const skip = document.getElementById('intro-skip');
  const heroLogo = document.querySelector('.hero-logo');
  if (!intro || !stage || !video || !closingLogo || !skip) return;

  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const affected = [...document.querySelectorAll('body > header, body > main, body > footer, body > a.skip')];
  const oldInert = new Map(affected.map(element => [element, element.inert]));
  let phase = 'idle';
  let loadTimeout = 0;
  let endTimeout = 0;
  let stallTimeout = 0;
  let appearanceFrame = 0;
  let bridgeAnimation = null;
  let sequence = 0;

  const disabled = () => motion.matches || window.CordelAccess?.reduced() ||
    window.CordelAccess?.state.intro === false;

  function clearWork() {
    clearTimeout(loadTimeout);
    clearTimeout(endTimeout);
    clearTimeout(stallTimeout);
    cancelAnimationFrame(appearanceFrame);
    loadTimeout = endTimeout = stallTimeout = appearanceFrame = 0;
    bridgeAnimation?.cancel();
    bridgeAnimation = null;
  }

  function restore() {
    sequence++;
    clearWork();
    phase = 'idle';
    intro.hidden = true;
    intro.classList.remove('intro-visible', 'intro-concluding', 'intro-leaving');
    root.classList.remove('intro-active');
    for (const [element, wasInert] of oldInert) element.inert = wasInert;
    video.pause();
    video.removeAttribute('src');
    video.load();
  }

  function conclude() {
    if (phase !== 'playing') return;
    phase = 'concluding';
    intro.classList.add('intro-concluding');
  }

  function end(openImmediately = false) {
    if (phase === 'idle' || phase === 'leaving') return;
    if (phase === 'loading') {
      restore(); // Never cover the site with an empty or broken opening.
      return;
    }
    const wasComplete = phase === 'concluding';
    if (!wasComplete && !openImmediately) conclude();
    phase = 'leaving';
    clearTimeout(loadTimeout);
    clearTimeout(stallTimeout);
    intro.classList.add('intro-leaving');
    if (openImmediately) intro.style.setProperty('--intro-exit-ms', '160ms');
    else intro.style.removeProperty('--intro-exit-ms');

    // Bridge the mark on the last page of the opening into its actual
    // position on the homepage. The entire motion is transform/opacity only.
    if (!openImmediately && heroLogo && typeof closingLogo.animate === 'function') {
      const from = closingLogo.getBoundingClientRect();
      const to = heroLogo.getBoundingClientRect();
      if (from.width > 0 && from.height > 0 && to.width > 0 && to.height > 0) {
        const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
        const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
        bridgeAnimation = closingLogo.animate([
          { transform:'translate(-50%,-50%) scale(1)', opacity:1 },
          { transform:`translate(calc(-50% + ${dx.toFixed(1)}px),calc(-50% + ${dy.toFixed(1)}px)) scale(${(to.width/from.width).toFixed(3)},${(to.height/from.height).toFixed(3)})`, opacity:0 }
        ], { duration:920, easing:'cubic-bezier(.2,.78,.2,1)', fill:'forwards' });
      }
    }
    endTimeout = window.setTimeout(() => {
      const wasSkip = openImmediately;
      restore();
      if (!wasSkip && !disabled()) {
        root.classList.add('intro-arrival');
        window.setTimeout(() => root.classList.remove('intro-arrival'), 1200);
      }
    }, openImmediately ? 190 : 940);
  }

  function reveal() {
    if (phase !== 'loading') return;
    if (disabled() || window.scrollY > 24) { restore(); return; }
    phase = 'playing';
    clearTimeout(loadTimeout);
    intro.hidden = false;
    root.classList.add('intro-active');
    for (const element of affected) element.inert = true;
    skip.focus({preventScroll:true});
    // Two frames allow a real CSS opacity/scale transition after display:none.
    appearanceFrame = requestAnimationFrame(() => {
      appearanceFrame = requestAnimationFrame(() => {
        if (phase === 'playing') intro.classList.add('intro-visible');
      });
    });
    const remaining = Number.isFinite(video.duration) && video.duration > 0
      ? Math.max(0, (video.duration - video.currentTime) / video.playbackRate) * 1000
      : 8500;
    endTimeout = window.setTimeout(() => end(), Math.min(17000, remaining + 1900));
  }

  function watchStall() {
    if (phase !== 'playing' && phase !== 'concluding') return;
    clearTimeout(stallTimeout);
    stallTimeout = window.setTimeout(() => end(), 3500);
  }

  function start() {
    if (phase !== 'idle' || disabled()) return;
    phase = 'loading';
    const current = ++sequence;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.playbackRate = .97;
    video.preload = 'metadata';
    video.src = video.dataset.src;
    loadTimeout = window.setTimeout(() => {
      if (phase === 'loading' && current === sequence) restore();
    }, 5000);
    try {
      const result = video.play();
      result?.catch(() => {
        if (current === sequence && phase === 'loading') restore();
      });
    } catch { restore(); }
  }

  video.addEventListener('playing', () => {
    clearTimeout(stallTimeout);
    reveal();
  });
  video.addEventListener('waiting', watchStall);
  video.addEventListener('stalled', watchStall);
  video.addEventListener('timeupdate', () => {
    clearTimeout(stallTimeout);
    if (phase !== 'playing' || !Number.isFinite(video.duration)) return;
    if (video.duration - video.currentTime <= 1.05) conclude();
  });
  video.addEventListener('ended', () => end());
  video.addEventListener('error', () => {
    if (phase === 'loading') restore();
    else end(true);
  });
  skip.addEventListener('click', () => end(true));
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && phase !== 'idle') {
      event.preventDefault();
      end(true);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && phase !== 'idle') end(true);
  });
  document.addEventListener('change', () => {
    if (disabled() && phase !== 'idle') end(true);
  });
  motion.addEventListener?.('change', () => {
    if (disabled() && phase !== 'idle') end(true);
  });
  window.addEventListener('pagehide', restore);
  window.addEventListener('pageshow', event => {
    // Returning through BFCache should not unexpectedly replay the opening.
    if (event.persisted && phase !== 'idle') restore();
  });
  start();
})();
