'use strict';

/* ── RAIN CANVAS ─────────────────── */
(function rain() {
  const c = document.getElementById('rainCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, drops;
  let rafId = null;
  let lastTime = 0;
  const INTERVAL = 90; // ms between frames — keeps the original slow aesthetic
  const chars = '01アイウエカキタ│┼╋░▒'.split('');

  function init() {
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
    drops = Array.from({ length: Math.floor(W / 16) },
                       () => Math.random() * -H);
  }

  function draw(ts) {
    rafId = requestAnimationFrame(draw);
    if (ts - lastTime < INTERVAL) return;
    lastTime = ts;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#e60000';
    ctx.font = '10px Share Tech Mono, monospace';
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y);
      drops[i] = y > H + 10 ? -16 : y + 14;
    });
  }

  // Pause when tab is hidden — saves CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
      rafId = null;
    } else {
      if (!rafId) rafId = requestAnimationFrame(draw);
    }
  });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 150); // debounce
  });

  init();
  rafId = requestAnimationFrame(draw);
})();

/* ── SCROLL REVEAL ───────────────── */
(function reveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in, .stagger')
          .forEach(el => io.observe(el));
})();

/* ── MOBILE NAV ──────────────────── */
(function mobileNav() {
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('navMobile');
  if (!toggle || !mobile) return;
  toggle.addEventListener('click', () => mobile.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !mobile.contains(e.target)) {
      mobile.classList.remove('open');
    }
  });
})();

/* ── ACTIVE NAV LINK ─────────────── */
(function activeNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();