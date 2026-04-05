'use strict';

(function rain() {
  const c = document.getElementById('rainCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, drops, rafId = null, lastTime = 0;
  const chars = '01アイウエカキタ│┼╋░▒'.split('');

  function init() {
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
    drops = Array.from({ length: Math.floor(W / 16) }, () => Math.random() * -H);
  }

  function draw(ts) {
    rafId = requestAnimationFrame(draw);
    if (ts - lastTime < 90) return;
    lastTime = ts;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#e60000';
    ctx.font = '10px Share Tech Mono,monospace';
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 16, y);
      drops[i] = y > H + 10 ? -16 : y + 14;
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!rafId) rafId = requestAnimationFrame(draw);
  });

  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(init, 150); });

  init();
  rafId = requestAnimationFrame(draw);
})();

(function reveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-in,.stagger').forEach(el => io.observe(el));
})();

(function mobileNav() {
  const toggle = document.getElementById('navToggle');
  const mobile = document.getElementById('navMobile');
  if (!toggle || !mobile) return;
  toggle.addEventListener('click', () => mobile.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!toggle.contains(e.target) && !mobile.contains(e.target)) mobile.classList.remove('open');
  });
})();

(function activeNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a,.nav-mobile a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
})();

(function noCopy() {
  document.addEventListener('copy', e => e.preventDefault());
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('selectstart', e => e.preventDefault());
})();