'use strict';

const SECTIONS = [
  { id: 'games',    label: 'games',    icon: 'あ', desc: 'あ' },
  { id: 'irl',      label: 'irl',      icon: 'あ', desc: 'あ' },
  { id: 'ambience', label: 'ambience', icon: 'あ', desc: 'あ' },
  { id: '1000-7',   label: '1000-7',   icon: 'あ', desc: 'あ' },
  { id: 'other',    label: 'other',    icon: 'あ', desc: 'あ' },
];

const GALLERY = [
  { src: '../assets/img/смешинки/1.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/2.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/3.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/4.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/5.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/6.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/7.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/8.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/9.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/1.mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/10.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/11.gif', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/12.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/13.gif', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/14.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/15.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/16.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/17.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/18.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/19.mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/20.gif', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/21.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/22.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/23.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/24.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/25.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/26.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/27.webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/28.mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (1).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (1).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (2).webp', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (2).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (3).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (3).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (4).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (5).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (6).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/29 (7).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (1).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (2).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (3).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (4).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (5).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (6).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (7).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (8).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (9).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/30 (10).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (1).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (2).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (3).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (4).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (5).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (6).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (7).jpg', caption: '死ぬ', section: 'other' },  
  { src: '../assets/img/смешинки/31 (8).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (9).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (10).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (11).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (12).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (13).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (14).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (16).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (17).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (18).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (19).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (20).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (21).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (22).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (23).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (24).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (25).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (26).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (27).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (28).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (29).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (30).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (31).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (32).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (33).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (34).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (35).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (36).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (37).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (38).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (39).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (40).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (41).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (42).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (43).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (44).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (45).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (46).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (47).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (48).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (49).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (50).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (51).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (52).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (53).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (54).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (55).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (56).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (57).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (58).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (59).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (60).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (61).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (62).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (63).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (64).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (65).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (66).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (67).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (68).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (69).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (70).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (71).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (72).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (73).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (74).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (75).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (76).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (77).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (78).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (79).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (80).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (81).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (82).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (83).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (84).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (85).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (86).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (87).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (88).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (89).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (90).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (91).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (92).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (93).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/31 (94).jpg', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/32 (2).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/32 (4).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/смешинки/32 (5).mp4', caption: '死ぬ', section: 'other' },
  { src: '../assets/img/games/33 (17).jpg', caption: '女子高生', section: 'other' },
  { src: '../assets/img/games/34 (2).jpg', caption: '女子高生', section: 'other' },
  { src: '../assets/img/games/34 (3).jpg', caption: '女子高生', section: 'other' },

  // ДОТА 2
  { src: '../assets/img/games/33 (1).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (1).mp4', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (2).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (3).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (4).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (5).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (6).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (7).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (8).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (9).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (10).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (11).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (12).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (13).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (14).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (15).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (16).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (17).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (18).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (19).jpg', caption: '女子高生', section: 'games' },
  { src: '../assets/img/games/33 (20).jpg', caption: '女子高生', section: 'games' },
  
  // aestetic
  { src: '../assets/img/ambience/34 (1).mp4', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (4).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (1).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (4).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (5).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (6).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (7).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (8).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (9).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (10).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (11).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (12).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (13).jpg', caption: '若者', section: 'ambience' },
  { src: '../assets/img/ambience/34 (14).jpg', caption: '若者', section: 'ambience' },


];

const root    = document.getElementById('galleryRoot');
const emptyEl = document.getElementById('emptyState');
const lb      = document.getElementById('lb');
const lbMedia = document.getElementById('lbMedia');
const lbCap   = document.getElementById('lbCaption');

let filtered = [], lbIdx = 0;

const lazyObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const media = entry.target;
      if (media.tagName === 'VIDEO') {
        media.src = media.dataset.src;
        media.load();
      } else {
        media.src = media.dataset.src;
      }
      obs.unobserve(media);
    }
  });
}, { rootMargin: '300px 0px' });

function isVideo(src) { return /\.(mp4|webm|mov)(\?|$)/i.test(src); }
function isGif(src)   { return /\.gif(\?|$)/i.test(src); }

function makeThumb(item) {
  if (isVideo(item.src)) {
    const v = document.createElement('video');
    v.dataset.src = item.src;
    v.muted = true;
    v.loop = true;
    v.preload = 'none';
    v.addEventListener('mouseenter', () => { v.play().catch(() => {}); });
    v.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
    return v;
  }
  const img = document.createElement('img');
  img.dataset.src = item.thumb || item.src;
  img.alt = item.caption || '';
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
}

function buildSections(items) {
  root.innerHTML = '';
  lazyObserver.disconnect();
  const totalItems = items.length;
  emptyEl.style.display = totalItems ? 'none' : 'flex';
  if (!totalItems) return;

  const groups = {};
  items.forEach(item => {
    if (!groups[item.section]) groups[item.section] = [];
    groups[item.section].push(item);
  });

  const order = SECTIONS.map(s => s.id).filter(id => groups[id]);
  const extra = Object.keys(groups).filter(k => !order.includes(k));
  
  const fragment = document.createDocumentFragment();

  [...order, ...extra].forEach(sid => {
    const sec = SECTIONS.find(s => s.id === sid) || { id: sid, label: sid, icon: '◈', desc: '' };
    const secItems = groups[sid];

    const section = document.createElement('div');
    section.className = 'g-section fade-in';

    const header = document.createElement('div');
    header.className = 'g-section-header';
    header.innerHTML = `
      <span class="g-section-icon">${sec.icon}</span>
      <div class="g-section-info">
        <div class="g-section-name">${sec.label}</div>
        <div class="g-section-count">${secItems.length} ${secItems.length === 1 ? 'файл' : 'файлов'}</div>
      </div>`;

    const grid = document.createElement('div');
    grid.className = 'g-grid';

    secItems.forEach((item) => {
      const globalIdx = filtered.indexOf(item);
      const div = document.createElement('div');
      div.className = 'g-item';
      if (item.aspect) div.style.aspectRatio = item.aspect;

      const media = makeThumb(item);
      lazyObserver.observe(media);
      div.appendChild(media);

      const typeLabel = isVideo(item.src) ? 'video' : isGif(item.src) ? 'gif' : null;
      if (typeLabel) {
        const badge = document.createElement('span');
        badge.className = 'g-item-type' + (isVideo(item.src) ? ' vid' : '');
        badge.textContent = typeLabel;
        div.appendChild(badge);
      }

      const ov = document.createElement('div');
      ov.className = 'g-overlay';
      const cap = document.createElement('div');
      cap.className = 'g-caption';
      const tagSpan = document.createElement('span');
      tagSpan.className = 'g-cap-tag';
      tagSpan.textContent = sec.icon + ' ' + sec.label;
      cap.appendChild(tagSpan);
      if (item.caption) cap.appendChild(document.createTextNode(item.caption));
      ov.appendChild(cap);
      div.appendChild(ov);

      div.addEventListener('click', () => openLb(globalIdx));
      grid.appendChild(div);
    });

    section.appendChild(header);
    section.appendChild(grid);
    fragment.appendChild(section);
  });

  root.appendChild(fragment);

  setTimeout(() => {
    document.querySelectorAll('.g-section.fade-in').forEach(el => el.classList.add('visible'));
  }, 10);
}

function openLb(i) {
  lbIdx = i;
  const item = filtered[i];
  if (!item) return;
  lbMedia.innerHTML = '';

  if (isVideo(item.src)) {
    const v = document.createElement('video');
    v.src = item.src; v.controls = true; v.autoplay = true; v.loop = true; v.muted = false;
    lbMedia.appendChild(v);
  } else {
    const img = document.createElement('img');
    img.src = item.src; img.alt = item.caption || '';
    lbMedia.appendChild(img);
  }

  const sec = SECTIONS.find(s => s.id === item.section);
  lbCap.textContent = (sec ? sec.icon + ' ' + sec.label : item.section) + (item.caption ? ' — ' + item.caption : '');
  lb.classList.add('open');
}

function closeLb() {
  lb.classList.remove('open');
  const v = lbMedia.querySelector('video');
  if (v) { v.pause(); v.src = ''; }
  lbMedia.innerHTML = '';
}

document.getElementById('lbClose').addEventListener('click', closeLb);
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
document.getElementById('lbPrev').addEventListener('click', () => {
  if (!filtered.length) return;
  lbIdx = (lbIdx - 1 + filtered.length) % filtered.length;
  openLb(lbIdx);
});
document.getElementById('lbNext').addEventListener('click', () => {
  if (!filtered.length) return;
  lbIdx = (lbIdx + 1) % filtered.length;
  openLb(lbIdx);
});
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLb();
  if (e.key === 'ArrowLeft')  { lbIdx = (lbIdx - 1 + filtered.length) % filtered.length; openLb(lbIdx); }
  if (e.key === 'ArrowRight') { lbIdx = (lbIdx + 1) % filtered.length; openLb(lbIdx); }
});

let lbTouchX = 0;
lb.addEventListener('touchstart', e => { lbTouchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - lbTouchX;
  if (Math.abs(dx) < 30) return;
  if (dx > 0) { lbIdx = (lbIdx - 1 + filtered.length) % filtered.length; openLb(lbIdx); }
  else        { lbIdx = (lbIdx + 1) % filtered.length; openLb(lbIdx); }
}, { passive: true });

document.getElementById('filterBar').addEventListener('click', e => {
  const btn = e.target.closest('.g-filter-btn');
  if (!btn) return;
  document.querySelectorAll('.g-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  filtered = f === 'all' ? [...GALLERY] : GALLERY.filter(x => x.section === f);
  buildSections(filtered);
});

filtered = [...GALLERY];
buildSections(filtered);