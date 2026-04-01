'use strict';

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
let trackIndexMap   = []; // display index → real SC widget index (post-filter)
let currentIdx      = 0;
let isShuffle       = false;
let currentDuration = 0;
let userVolume      = 0.8; // matches the CSS .mp-vol-fill default width: 80%

let isDraggingProgress = false;
let isDraggingVolume   = false;

/* ── Helpers ─────────────────────────────────────────── */
const fmtMS = ms => {
  if (!isFinite(ms) || ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Returns the real SC widget index for a given display index
const widgetIdx = di => trackIndexMap[di] ?? di;

function shufflePlay() {
  if (currentTracks.length) widget.skip(widgetIdx(Math.floor(Math.random() * currentTracks.length)));
}

/* ── Build playlist ──────────────────────────────────── */
// Filters out tracks with no/blank title or literal "Unknown" —
// these are deleted/private/repost-placeholder objects SC sometimes
// injects into a set. trackIndexMap lets us always call widget.skip()
// with the correct raw SC index even after filtering.
function buildList(sounds) {
  trackIndexMap = [];
  const valid = [];

  sounds.forEach((t, i) => {
    const title = (t.title || '').trim();
    if (title && title.toLowerCase() !== 'unknown') {
      valid.push(t);
      trackIndexMap.push(i);
    }
  });

  currentTracks = valid;
  document.getElementById('plCount').textContent = `${valid.length} tracks`;

  plItems.innerHTML = valid.map((t, i) => `
    <div class="pl-item${i === currentIdx ? ' active' : ''}" data-index="${i}">
      <span class="pl-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="pl-info">
        <div class="pl-name">${t.title}</div>
        <div class="pl-artist">${t.user ? t.user.username : '—'}</div>
      </div>
      <span class="pl-dur">${fmtMS(t.duration)}</span>
    </div>
  `).join('');
}

/* ── Update player UI ────────────────────────────────── */
function updatePlayerUI(sound) {
  if (!sound) return;

  trackEl.textContent  = sound.title || '—';
  artistEl.textContent = sound.user ? sound.user.username : '—';

  // Restart scroll animation on title change
  trackEl.classList.remove('scrolling');
  void trackEl.offsetWidth; // force reflow
  if (trackEl.scrollWidth > trackEl.parentElement.clientWidth + 4) {
    trackEl.classList.add('scrolling');
  }

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

/* ── Progress drag (mouse + touch) ──────────────────── */
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
  e.preventDefault(); // prevent text-selection cursor while scrubbing
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

/* ── Volume drag (mouse + touch) ─────────────────────── */
function applyVolume(clientX) {
  const r    = vSlider.getBoundingClientRect();
  userVolume = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
  vFill.style.width = `${userVolume * 100}%`;
  widget.setVolume(userVolume * 100);
}

vSlider.addEventListener('mousedown', e => {
  isDraggingVolume = true;
  vSlider.classList.add('dragging');
  applyVolume(e.clientX);
  e.preventDefault();
});
document.addEventListener('mousemove', e => {
  if (isDraggingVolume) applyVolume(e.clientX);
});
document.addEventListener('mouseup', () => {
  if (isDraggingVolume) { isDraggingVolume = false; vSlider.classList.remove('dragging'); }
});

vSlider.addEventListener('touchstart', e => {
  isDraggingVolume = true;
  vSlider.classList.add('dragging');
  applyVolume(e.touches[0].clientX);
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (isDraggingVolume) applyVolume(e.touches[0].clientX);
}, { passive: true });
document.addEventListener('touchend', () => {
  if (isDraggingVolume) { isDraggingVolume = false; vSlider.classList.remove('dragging'); }
});

/* ── SoundCloud events ───────────────────────────────── */
widget.bind(SC.Widget.Events.READY, () => {
  widget.getSounds(sounds => {
    buildList(sounds);

    // Use widget's current sound; fall back to the first *valid* track
    // (sounds[0] might itself be a filtered-out unknown track)
    widget.getCurrentSound(sound => updatePlayerUI(sound || currentTracks[0]));

    widget.setVolume(userVolume * 100);
    vFill.style.width = `${userVolume * 100}%`;
  });
});

widget.bind(SC.Widget.Events.PLAY, () => {
  widget.getCurrentSoundIndex(wi => {
    // If the widget advanced to a filtered-out (unknown) track, skip it
    if (!trackIndexMap.includes(wi)) {
      widget.next();
      return;
    }
    setPlayIcon(true);
    const di = trackIndexMap.indexOf(wi);
    currentIdx = di;
    Array.from(plItems.children).forEach((el, i) => el.classList.toggle('active', i === di));
    widget.getCurrentSound(updatePlayerUI);
  });
});

widget.bind(SC.Widget.Events.PAUSE, () => setPlayIcon(false));

widget.bind(SC.Widget.Events.FINISH, () => {
  if (isShuffle) shufflePlay();
  // Otherwise the SC widget advances naturally (handled by PLAY above)
});

widget.bind(SC.Widget.Events.PLAY_PROGRESS, data => {
  // Suppress position updates while the user is actively scrubbing
  if (!isDraggingProgress) pFill.style.width = `${data.relativePosition * 100}%`;
  timeEl.textContent = fmtMS(data.currentPosition);
});

/* ── Controls ────────────────────────────────────────── */
plItems.addEventListener('click', e => {
  const item = e.target.closest('.pl-item');
  if (!item) return;
  const di = parseInt(item.dataset.index, 10);
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

document.getElementById('btnPrev').addEventListener('click', () => widget.prev());

document.getElementById('btnNext').addEventListener('click', () => {
  if (isShuffle) shufflePlay();
  else widget.next();
});

document.getElementById('btnShuffle').addEventListener('click', function () {
  isShuffle = !isShuffle;
  this.classList.toggle('active', isShuffle);
});