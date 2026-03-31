'use strict';

/* ══════════════════════════════════════════════
   GALLERY — add your images here
   ══════════════════════════════════════════════
   {
     src:     'images/myfile.jpg',    ← path to image
     thumb:   'images/thumb.jpg',     ← optional smaller version
     caption: 'caption text',
     tag:     'screenshots' | 'art' | 'pixel' | 'misc',
     aspect:  '1/1' | '4/3' | '16/9'  ← optional aspect ratio
   }
*/
const GALLERY = [
  /*
  { src: 'images/dota.jpg',     caption: 'peak moment',          tag: 'screenshots', aspect: '16/9' },
  { src: 'images/art1.jpg',     caption: 'void study #1',        tag: 'art',         aspect: '1/1'  },
  { src: 'images/pixel1.png',   caption: 'character concept',    tag: 'pixel',       aspect: '1/1'  },
  { src: 'images/cs.jpg',       caption: '4k on nuke',           tag: 'screenshots', aspect: '16/9' },
  */
];

const grid   = document.getElementById('galleryGrid');
const empty  = document.getElementById('emptyState');
const lb     = document.getElementById('lightbox');
const lbImg  = document.getElementById('lbImg');
const lbCap  = document.getElementById('lbCaption');

let filtered = [], lbIdx = 0;

function buildGrid(items) {
  grid.innerHTML = '';
  empty.style.display = items.length ? 'none' : 'block';

  items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.dataset.tag = item.tag;
    div.dataset.i   = i;

    if (item.aspect) {
      div.style.aspectRatio = item.aspect;
    }

    const img = document.createElement('img');
    img.src = item.thumb || item.src;
    img.alt = item.caption || '';
    img.loading = 'lazy';

    const ov = document.createElement('div');
    ov.className = 'gallery-item-overlay';
    ov.innerHTML = `<div class="gallery-item-caption"><span class="gallery-item-tag">${item.tag}</span>${item.caption||''}</div>`;

    div.appendChild(img);
    div.appendChild(ov);
    div.addEventListener('click', () => openLb(i));
    grid.appendChild(div);
  });
}

function openLb(i) {
  lbIdx = i;
  const item = filtered[i] || GALLERY[i];
  lbImg.src = item.src;
  lbCap.textContent = `${item.tag} — ${item.caption||''}`;
  lb.classList.add('open');
}
function closeLb() { lb.classList.remove('open'); }

document.getElementById('lbClose').addEventListener('click', closeLb);
lb.addEventListener('click', e => { if (e.target===lb) closeLb(); });
document.getElementById('lbPrev').addEventListener('click', () => {
  lbIdx = (lbIdx-1+filtered.length)%filtered.length; openLb(lbIdx);
});
document.getElementById('lbNext').addEventListener('click', () => {
  lbIdx = (lbIdx+1)%filtered.length; openLb(lbIdx);
});
document.addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key==='Escape') closeLb();
  if (e.key==='ArrowLeft')  { lbIdx=(lbIdx-1+filtered.length)%filtered.length; openLb(lbIdx); }
  if (e.key==='ArrowRight') { lbIdx=(lbIdx+1)%filtered.length; openLb(lbIdx); }
});

/* Filters */
document.getElementById('filterBar').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  filtered = f==='all' ? [...GALLERY] : GALLERY.filter(x=>x.tag===f);
  buildGrid(filtered);
});

filtered = [...GALLERY];
buildGrid(filtered);