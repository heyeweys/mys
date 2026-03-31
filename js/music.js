'use strict';

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

let currentTracks   = [];
let currentIdx      = 0;
let isShuffle       = false;
let currentDuration = 0;
let userVolume      = 0.05;

const fmtMS = ms => {
  if (!isFinite(ms) || ms < 0) return '0:00';
  const sec = Math.floor(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
};

function buildList(tracks) {
  currentTracks = tracks;
  document.getElementById('plCount').textContent = `${tracks.length} tracks`;
  plItems.innerHTML = tracks.map((t, i) => `
    <div class="pl-item${i === currentIdx ? ' active' : ''}" data-index="${i}">
      <span class="pl-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="pl-info">
        <div class="pl-name">${t.title || 'Unknown'}</div>
        <div class="pl-artist">${t.user ? t.user.username : 'Unknown Artist'}</div>
      </div>
      <span class="pl-dur">${fmtMS(t.duration)}</span>
    </div>
  `).join('');
}

function updatePlayerUI(sound) {
  trackEl.textContent  = sound.title || 'Unknown';
  artistEl.textContent = sound.user ? sound.user.username : 'Unknown Artist';

  trackEl.classList.remove('scrolling');
  void trackEl.offsetWidth;
  if (trackEl.scrollWidth > trackEl.parentElement.clientWidth + 4) {
    trackEl.classList.add('scrolling');
  }

  currentDuration     = sound.duration || 0;
  durEl.textContent   = fmtMS(currentDuration);

  const artworkUrl = sound.artwork_url || (sound.user && sound.user.avatar_url);
  const cover = document.getElementById('coverArt');
  const ph    = document.getElementById('coverPlaceholder');
  if (artworkUrl) {
    cover.src          = artworkUrl.replace('large', 't500x500');
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

/* ── SoundCloud events ── */
widget.bind(SC.Widget.Events.READY, () => {
  widget.getSounds(sounds => {
    buildList(sounds);
    widget.getCurrentSound(sound => updatePlayerUI(sound || sounds[0]));
    widget.setVolume(userVolume * 100);
    vFill.style.width = `${userVolume * 100}%`;
  });
});

widget.bind(SC.Widget.Events.PLAY, () => {
  setPlayIcon(true);
  widget.getCurrentSoundIndex(index => {
    currentIdx = index;
    Array.from(plItems.children).forEach((el, i) => el.classList.toggle('active', i === currentIdx));
    widget.getCurrentSound(updatePlayerUI);
  });
});

widget.bind(SC.Widget.Events.PAUSE,  () => setPlayIcon(false));

widget.bind(SC.Widget.Events.FINISH, () => {
  if (isShuffle && currentTracks.length) {
    widget.skip(Math.floor(Math.random() * currentTracks.length));
  }
});

widget.bind(SC.Widget.Events.PLAY_PROGRESS, data => {
  pFill.style.width = `${data.relativePosition * 100}%`;
  timeEl.textContent = fmtMS(data.currentPosition);
});

/* ── Controls ── */
plItems.addEventListener('click', e => {
  const item = e.target.closest('.pl-item');
  if (!item) return;
  const index = parseInt(item.dataset.index, 10);
  if (currentIdx === index) { widget.seekTo(0); widget.play(); }
  else widget.skip(index);
});

pBar.addEventListener('click', e => {
  if (!currentDuration) return;
  const r = pBar.getBoundingClientRect();
  widget.seekTo(currentDuration * Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
});

vSlider.addEventListener('click', e => {
  const r = vSlider.getBoundingClientRect();
  userVolume = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  vFill.style.width = `${userVolume * 100}%`;
  widget.setVolume(userVolume * 100);
});

btnPlay.addEventListener('click', () => widget.toggle());

document.getElementById('btnPrev').addEventListener('click', () => widget.prev());

document.getElementById('btnNext').addEventListener('click', () => {
  if (isShuffle && currentTracks.length) widget.skip(Math.floor(Math.random() * currentTracks.length));
  else widget.next();
});

document.getElementById('btnShuffle').addEventListener('click', function () {
  isShuffle = !isShuffle;
  this.classList.toggle('active', isShuffle);
});