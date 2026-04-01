'use strict';

// [FIX] Guard: if SoundCloud API failed to load, fail gracefully
if (typeof SC === 'undefined') {
  const trackEl = document.getElementById('lcdTrack');
  if (trackEl) trackEl.textContent = 'player unavailable';
  const artist = document.getElementById('lcdArtist');
  if (artist) artist.textContent = 'SoundCloud API failed to load';
  throw new Error('SC Widget API not available');
}

/* ── DOM refs ────────────────────────────────────────── */
const widget   = SC.Widget(document.getElementById('sc-widget'));
const trackEl  = document.getElementById('lcdTrack');
const artistEl = document.getElementById('lcdArtist');
const timeEl   = document.getElementById('lcdTime');
const durEl    = document.getElementById('lcdDuration');
const pFill    = document.getElementById('progressFill');
const pBar     = document.getElementById('progressBar');
const vFill    = document.getElementById('volFill');
const vSlider  = document.getElementById('volSlider');
const plItems  = document.getElementById('plItems');
const btnPlay  = document.getElementById('btnPlay');

/* ── State ───────────────────────────────────────────── */
let currentTracks   = [];
let trackIndexMap   = [];
let currentIdx      = 0;
let isShuffle       = false;
let currentDuration = 0;
let userVolume      = 0.8;

let isDraggingProgress = false;
let isDraggingVolume   = false;
let lastDirection      = 1;
let skipGuard          = 0;

/* ── Helpers ─────────────────────────────────────────── */
const fmtMS = ms => {
  if (!isFinite(ms) || ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

const widgetIdx = di => trackIndexMap[di] ?? di;

function shufflePlay() {
  if (!currentTracks.length) return;
  lastDirection = 1;
  widget.skip(widgetIdx(Math.floor(Math.random() * currentTracks.length)));
}

/* ── Build playlist ──────────────────────────────────── */
function buildList(sounds) {
  trackIndexMap = [];
  const valid   = [];

  sounds.forEach((t, i) => {
    const title = (t.title || '').trim();
    if (title && title.toLowerCase() !== 'unknown') {
      valid.push(t);
      trackIndexMap.push(i);
    }
  });

  currentTracks = valid;
  document.getElementById('plCount').textContent = `${valid.length} tracks`;

  plItems.innerHTML = valid.map((t, i) => {
    // [FIX] Use textContent-safe rendering via template — titles are escaped
    const title  = (t.title || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const artist = (t.user ? t.user.username : '—').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `
      <div class="pl-item${i === currentIdx ? ' active' : ''}" data-index="${i}">
        <span class="pl-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="pl-info">
          <div class="pl-name">${title}</div>
          <div class="pl-artist">${artist}</div>
        </div>
        <span class="pl-dur">${fmtMS(t.duration)}</span>
      </div>`;
  }).join('');
}

function loadSoundsWithRetry(attempt = 0, prevCount = -1) {
  widget.getSounds(sounds => {
    const count = sounds.length;
    if (count !== prevCount && attempt < 25) {
      if (count > 0) buildList(sounds);
      const delay = attempt < 5 ? 300 : attempt < 12 ? 500 : 800;
      setTimeout(() => loadSoundsWithRetry(attempt + 1, count), delay);
      return;
    }
    buildList(sounds);
    widget.getCurrentSound(sound => updatePlayerUI(sound || currentTracks[0]));
    widget.setVolume(userVolume * 100);
    vFill.style.width = `${userVolume * 100}%`;
  });
}

/* ── Update player UI ────────────────────────────────── */
function updatePlayerUI(sound) {
  if (!sound) return;

  const title = sound.title || '—';

  trackEl.classList.remove('scrolling');
  trackEl.textContent = title;
  void trackEl.offsetWidth;

  if (trackEl.scrollWidth > trackEl.parentElement.clientWidth + 4) {
    trackEl.textContent = title + '\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0' + title;
    trackEl.classList.add('scrolling');
  }

  artistEl.textContent = sound.user ? sound.user.username : '—';

  currentDuration   = sound.duration || 0;
  durEl.textContent = fmtMS(currentDuration);

  const url   = sound.artwork_url || (sound.user && sound.user.avatar_url);
  const cover = document.getElementById('coverArt');
  const ph    = document.getElementById('coverPlaceholder');
  if (url) {
    cover.src           = url.replace('large', 't500x500');
    cover.style.display = 'block';
    ph.style.display    = 'none';
  } else {
    cover.style.display = 'none';
    ph.style.display    = 'block';
  }
}

function setPlayIcon(playing) {
  document.getElementById('iconPlay').style.display  = playing ? 'none'  : 'block';
  document.getElementById('iconPause').style.display = playing ? 'block' : 'none';
  btnPlay.classList.toggle('active', playing);
}

/* ── Progress drag ───────────────────────────────────── */
function applyProgress(clientX) {
  if (!currentDuration) return;
  const r     = pBar.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  pFill.style.width = `${ratio * 100}%`;
  widget.seekTo(currentDuration * ratio);
}

pBar.addEventListener('mousedown', e => {
  isDraggingProgress = true;
  pBar.classList.add('dragging');
  applyProgress(e.clientX);
  e.preventDefault();
});
document.addEventListener('mousemove', e => {
  if (isDraggingProgress) applyProgress(e.clientX);
});
document.addEventListener('mouseup', () => {
  if (isDraggingProgress) { isDraggingProgress = false; pBar.classList.remove('dragging'); }
});
pBar.addEventListener('touchstart', e => {
  isDraggingProgress = true;
  pBar.classList.add('dragging');
  applyProgress(e.touches[0].clientX);
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (isDraggingProgress) applyProgress(e.touches[0].clientX);
}, { passive: true });
document.addEventListener('touchend', () => {
  if (isDraggingProgress) { isDraggingProgress = false; pBar.classList.remove('dragging'); }
});

/* ── Volume drag ─────────────────────────────────────── */
function applyVolume(clientX) {
  const r    = vSlider.getBoundingClientRect();
  userVolume = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  vFill.style.width = `${userVolume * 100}%`;
  widget.setVolume(userVolume * 100);
}

function startVolDrag(clientX) {
  isDraggingVolume = true;
  vSlider.classList.add('dragging');
  document.body.classList.add('vol-cursor-active');
  applyVolume(clientX);
}
function endVolDrag() {
  if (!isDraggingVolume) return;
  isDraggingVolume = false;
  vSlider.classList.remove('dragging');
  document.body.classList.remove('vol-cursor-active');
}

vSlider.addEventListener('mousedown', e => { startVolDrag(e.clientX); e.preventDefault(); });
document.addEventListener('mousemove', e => { if (isDraggingVolume) applyVolume(e.clientX); });
document.addEventListener('mouseup', endVolDrag);

vSlider.addEventListener('touchstart', e => { startVolDrag(e.touches[0].clientX); }, { passive: true });
document.addEventListener('touchmove', e => { if (isDraggingVolume) applyVolume(e.touches[0].clientX); }, { passive: true });
document.addEventListener('touchend', endVolDrag);

/* ── SoundCloud events ───────────────────────────────── */
widget.bind(SC.Widget.Events.READY, () => {
  setTimeout(() => loadSoundsWithRetry(), 150);
});

widget.bind(SC.Widget.Events.PLAY, () => {
  widget.getCurrentSoundIndex(wi => {
    if (!trackIndexMap.includes(wi)) {
      skipGuard++;
      if (skipGuard > 10) { skipGuard = 0; return; }
      if (lastDirection >= 0) widget.next();
      else widget.prev();
      return;
    }
    skipGuard = 0;
    setPlayIcon(true);
    const di = trackIndexMap.indexOf(wi);
    currentIdx = di;
    Array.from(plItems.children).forEach((el, i) => el.classList.toggle('active', i === di));
    const activeEl = plItems.children[di];
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    widget.getCurrentSound(updatePlayerUI);
  });
});

widget.bind(SC.Widget.Events.PAUSE, () => setPlayIcon(false));

widget.bind(SC.Widget.Events.FINISH, () => {
  if (isShuffle) shufflePlay();
});

widget.bind(SC.Widget.Events.PLAY_PROGRESS, data => {
  if (!isDraggingProgress) pFill.style.width = `${data.relativePosition * 100}%`;
  timeEl.textContent = fmtMS(data.currentPosition);
});

/* ── Controls ────────────────────────────────────────── */
plItems.addEventListener('click', e => {
  const item = e.target.closest('.pl-item');
  if (!item) return;
  const di = parseInt(item.dataset.index, 10);
  lastDirection = di >= currentIdx ? 1 : -1;
  if (currentIdx === di) { widget.seekTo(0); widget.play(); }
  else widget.skip(widgetIdx(di));
});

let touchHandled = false;
btnPlay.addEventListener('touchend', e => {
  e.preventDefault();
  touchHandled = true;
  widget.toggle();
  btnPlay.blur();
  setTimeout(() => { touchHandled = false; }, 400);
});
btnPlay.addEventListener('click', () => {
  if (!touchHandled) widget.toggle();
});

document.getElementById('btnPrev').addEventListener('click', () => {
  lastDirection = -1;
  widget.prev();
});

document.getElementById('btnNext').addEventListener('click', () => {
  if (isShuffle) shufflePlay();
  else { lastDirection = 1; widget.next(); }
});

document.getElementById('btnShuffle').addEventListener('click', function () {
  isShuffle = !isShuffle;
  this.classList.toggle('active', isShuffle);
});