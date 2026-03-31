'use strict';

/* ── TAB SWITCHER ────────────────────────────── */
document.querySelectorAll('.game-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.game-tab').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.game-panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-'+btn.dataset.game).classList.add('active');
  });
});

/* ══════════════════════════════════════════════
   SNAKE
   ══════════════════════════════════════════════ */
(function initSnake() {
  const canvas = document.getElementById('snakeCanvas');
  const ctx    = canvas.getContext('2d');
  const CELL   = 16;
  const COLS   = canvas.width / CELL;
  const ROWS   = canvas.height / CELL;
  const scoreEl = document.getElementById('snakeScore');
  const hiEl    = document.getElementById('snakeHi');
  const msgEl   = document.getElementById('snakeMsg');

  let snake, dir, next, food, score, hi, state, loop;
  hi = parseInt(localStorage.getItem('snake_hi') || '0');
  hiEl.textContent = String(hi).padStart(3,'0');

  function rnd(n) { return Math.floor(Math.random()*n); }
  function placeFood() {
    let pos;
    do { pos = {x:rnd(COLS), y:rnd(ROWS)}; }
    while (snake.some(s=>s.x===pos.x&&s.y===pos.y));
    food = pos;
  }

  function init() {
    snake = [{x:Math.floor(COLS/2), y:Math.floor(ROWS/2)}];
    dir  = {x:1, y:0};
    next = {x:1, y:0};
    score = 0;
    state = 'idle';
    scoreEl.textContent = '000';
    msgEl.textContent = 'press space or tap to start';
    placeFood();
    draw();
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // grid dots
    ctx.fillStyle = '#111';
    for (let x=0;x<COLS;x++) for (let y=0;y<ROWS;y++) {
      ctx.fillRect(x*CELL+CELL/2-1, y*CELL+CELL/2-1, 2, 2);
    }

    // food
    ctx.fillStyle = '#e60000';
    ctx.beginPath();
    ctx.arc(food.x*CELL+CELL/2, food.y*CELL+CELL/2, 4, 0, Math.PI*2);
    ctx.fill();

    // snake
    snake.forEach((seg, i) => {
      const alpha = 1 - (i / snake.length) * 0.6;
      ctx.fillStyle = `rgba(245,245,245,${alpha})`;
      const pad = i===0 ? 1 : 2;
      ctx.fillRect(seg.x*CELL+pad, seg.y*CELL+pad, CELL-pad*2, CELL-pad*2);
    });
  }

  function step() {
    dir = {...next};
    const head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};

    if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS
        ||snake.some(s=>s.x===head.x&&s.y===head.y)) {
      clearInterval(loop);
      state = 'dead';
      msgEl.textContent = `game over — score: ${score}`;
      if (score > hi) { hi=score; localStorage.setItem('snake_hi',hi); hiEl.textContent=String(hi).padStart(3,'0'); }
      return;
    }

    snake.unshift(head);
    if (head.x===food.x && head.y===food.y) {
      score++;
      scoreEl.textContent = String(score).padStart(3,'0');
      placeFood();
    } else { snake.pop(); }
    draw();
  }

  function start() {
    if (state==='running') return;
    if (state==='dead') init();
    state = 'running';
    msgEl.textContent = '';
    clearInterval(loop);
    loop = setInterval(step, 120);
  }

  document.addEventListener('keydown', e => {
    const map = {ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},
                 w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0}};
    if (e.key===' ') { e.preventDefault(); start(); return; }
    const nd = map[e.key];
    if (!nd) return;
    e.preventDefault();
    if (nd.x+dir.x!==0||nd.y+dir.y!==0) next=nd;
    if (state==='idle') start();
  });

  // touch swipe
  let tx=0,ty=0;
  canvas.addEventListener('touchstart', e=>{tx=e.touches[0].clientX;ty=e.touches[0].clientY;e.preventDefault();},{passive:false});
  canvas.addEventListener('touchend', e=>{
    const dx=e.changedTouches[0].clientX-tx, dy=e.changedTouches[0].clientY-ty;
    if (Math.abs(dx)<10&&Math.abs(dy)<10){start();return;}
    if (Math.abs(dx)>Math.abs(dy)){
      const nd=dx>0?{x:1,y:0}:{x:-1,y:0};
      if(nd.x+dir.x!==0||nd.y+dir.y!==0)next=nd;
    } else {
      const nd=dy>0?{x:0,y:1}:{x:0,y:-1};
      if(nd.x+dir.x!==0||nd.y+dir.y!==0)next=nd;
    }
    if(state==='idle')start();
  },{passive:false});

  document.getElementById('snakeReset').addEventListener('click', ()=>{ clearInterval(loop); init(); });

  init();
})();

/* ══════════════════════════════════════════════
   MEMORY
   ══════════════════════════════════════════════ */
(function initMemory() {
  const EMOJIS = ['🌑','🩸','🕯','🗡','⛓','💊','🖤','🌿'];
  const grid  = document.getElementById('memGrid');
  const movEl = document.getElementById('memMoves');
  const matEl = document.getElementById('memMatched');
  const timEl = document.getElementById('memTime');
  const msgEl = document.getElementById('memMsg');

  let cards=[], flipped=[], matched=0, moves=0, timer, seconds=0, lock=false;

  function fmt(s){ return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

  function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

  function build() {
    clearInterval(timer); seconds=0; moves=0; matched=0; lock=false; flipped=[];
    movEl.textContent='0'; matEl.textContent='0/8'; timEl.textContent='0:00'; msgEl.textContent='';
    const deck = shuffle([...EMOJIS,...EMOJIS]);
    grid.innerHTML='';
    cards=[];
    deck.forEach((em,i) => {
      const d=document.createElement('div');
      d.className='mem-card'; d.dataset.val=em; d.dataset.idx=i;
      d.textContent=em;
      d.addEventListener('click', onFlip);
      grid.appendChild(d);
      cards.push(d);
    });
  }

  function onFlip(e) {
    if (lock) return;
    const card = e.currentTarget;
    if (card.classList.contains('flipped')||card.classList.contains('matched')) return;
    if (!timer) timer=setInterval(()=>{seconds++;timEl.textContent=fmt(seconds);},1000);
    card.classList.add('flipped');
    flipped.push(card);
    if (flipped.length===2) {
      lock=true; moves++;
      movEl.textContent=moves;
      if (flipped[0].dataset.val===flipped[1].dataset.val) {
        flipped[0].classList.add('matched'); flipped[1].classList.add('matched');
        matched++;
        matEl.textContent=matched+'/8';
        flipped=[];
        lock=false;
        if (matched===8){ clearInterval(timer); msgEl.textContent=`cleared in ${fmt(seconds)}, ${moves} moves`; }
      } else {
        setTimeout(()=>{
          flipped[0].classList.remove('flipped'); flipped[1].classList.remove('flipped');
          flipped=[]; lock=false;
        },900);
      }
    }
  }

  document.getElementById('memReset').addEventListener('click', build);
  build();
})();

/* ══════════════════════════════════════════════
   VOID CLICKER
   ══════════════════════════════════════════════ */
(function initVoid() {
  const orb     = document.getElementById('voidOrb');
  const countEl = document.getElementById('voidCount');
  const psEl    = document.getElementById('voidPerSec');
  const clickEl = document.getElementById('voidClicks');
  const totalEl = document.getElementById('voidTotal');
  const upsEl   = document.getElementById('voidUpgrades');

  const UPGRADES = [
    { id:'whisper',  name:'Whisper',       cost:10,   pps:0.1, desc:'someone is listening',     bought:0 },
    { id:'shadow',   name:'Shadow',         cost:75,   pps:0.5, desc:'it watches you',           bought:0 },
    { id:'crawler',  name:'Crawler',        cost:300,  pps:2,   desc:'moves in the dark',        bought:0 },
    { id:'void_eye', name:'Eye of the Void',cost:1000, pps:8,   desc:'sees through everything',  bought:0 },
    { id:'nothing',  name:'The Nothing',   cost:5000, pps:30,  desc:'absolute emptiness',       bought:0 },
  ];

  let points  = 0;
  let totalEv = 0;
  let clicks  = 0;
  let pps     = 1; // base click value

  function save() {
    localStorage.setItem('void_save', JSON.stringify({ points, totalEv, clicks, upgrades: UPGRADES.map(u=>u.bought) }));
  }
  function load() {
    const s = localStorage.getItem('void_save');
    if (!s) return;
    try {
      const d = JSON.parse(s);
      points  = d.points  || 0;
      totalEv = d.totalEv || 0;
      clicks  = d.clicks  || 0;
      (d.upgrades||[]).forEach((b,i)=>{ if(UPGRADES[i]) UPGRADES[i].bought=b||0; });
    } catch(e){}
  }

  function calcPPS() {
    return UPGRADES.reduce((acc,u)=>acc+u.pps*u.bought, 0);
  }
  function fmt(n) {
    if (n>=1e9) return (n/1e9).toFixed(1)+'B';
    if (n>=1e6) return (n/1e6).toFixed(1)+'M';
    if (n>=1e3) return (n/1e3).toFixed(1)+'K';
    return Math.floor(n).toString();
  }

  function buildUpgrades() {
    upsEl.innerHTML='';
    UPGRADES.forEach(u => {
      const d = document.createElement('div');
      d.className = 'upgrade-item' + (points<u.cost?' disabled':'');
      d.innerHTML=`<div class="upgrade-name">${u.name} <span style="color:var(--dim);font-size:9px;">[${u.bought}]</span></div>
                   <div class="upgrade-cost">∅ ${fmt(u.cost)}</div>
                   <div class="upgrade-desc">${u.desc}</div>`;
      if (points>=u.cost) {
        d.addEventListener('click', ()=>{
          if(points<u.cost) return;
          points-=u.cost; u.cost=Math.floor(u.cost*1.15); u.bought++;
          update(); save();
        });
      }
      upsEl.appendChild(d);
    });
  }

  function update() {
    countEl.textContent = fmt(points);
    clickEl.textContent = fmt(clicks);
    totalEl.textContent = fmt(totalEv);
    const cps = calcPPS();
    psEl.textContent    = fmt(cps)+'/s';
    buildUpgrades();
  }

orb.addEventListener('click', () => {
    // Шанс крита 5% (дает х10 очков)
    const isCrit = Math.random() < 0.05;
    const baseGain = 1 + UPGRADES.reduce((a,u)=>a+u.bought*0.1,0);
    const finalGain = isCrit ? baseGain * 10 : baseGain;

    points += finalGain; 
    totalEv += finalGain; 
    clicks++;

    // Визуальные эффекты
    orb.style.transform = 'scale(0.92)';
    if(isCrit) {
      orb.classList.add('shake-anim');
      orb.style.borderColor = '#fff'; // Вспышка
      setTimeout(() => { 
        orb.classList.remove('shake-anim'); 
        orb.style.borderColor = ''; 
      }, 150);
    }
    
    setTimeout(() => { orb.style.transform = ''; }, 80);
    update(); save();
  });

  // Passive income tick
  setInterval(()=>{
    const cps = calcPPS();
    if(cps>0){ points+=cps/20; totalEv+=cps/20; update(); }
  }, 50);

  document.getElementById('voidReset').addEventListener('click', ()=>{
    if(!confirm('reset the void?')) return;
    points=0; totalEv=0; clicks=0;
    UPGRADES.forEach(u=>{u.bought=0; u.cost=UPGRADES.find(x=>x.id===u.id)?.cost||u.cost;});
    // restore base costs
    const BASE_COSTS=[10,75,300,1000,5000];
    UPGRADES.forEach((u,i)=>u.cost=BASE_COSTS[i]);
    localStorage.removeItem('void_save');
    update();
  });

  load();
  update();
})();