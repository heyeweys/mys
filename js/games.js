'use strict';

/* ── TAB SWITCHER ────────────────────────────── */
document.querySelectorAll('.game-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.game-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-' + btn.dataset.game).classList.add('active');
    window.dispatchEvent(new CustomEvent('gametabchange', { detail: btn.dataset.game }));
  });
});

/* ══════════════════════════════════════════════
   SNAKE
   ══════════════════════════════════════════════ */
(function initSnake() {
  const canvas  = document.getElementById('snakeCanvas');
  const ctx     = canvas.getContext('2d');
  const CELL    = 16;
  const COLS    = canvas.width  / CELL;
  const ROWS    = canvas.height / CELL;
  const scoreEl = document.getElementById('snakeScore');
  const hiEl    = document.getElementById('snakeHi');
  const msgEl   = document.getElementById('snakeMsg');

  let snake, dir, next, food, score, hi, state, loop;
  hi = parseInt(localStorage.getItem('snake_hi') || '0');
  hiEl.textContent = String(hi).padStart(3, '0');

  function rnd(n) { return Math.floor(Math.random() * n); }

  function placeFood() {
    let pos;
    do { pos = { x: rnd(COLS), y: rnd(ROWS) }; }
    while (snake.some(s => s.x === pos.x && s.y === pos.y));
    food = pos;
  }

  function init() {
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }];
    dir   = { x: 1, y: 0 };
    next  = { x: 1, y: 0 };
    score = 0; state = 'idle';
    scoreEl.textContent = '000';
    msgEl.textContent   = 'press space or tap to start';
    placeFood();
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#070610';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // grid dots
    ctx.fillStyle = 'rgba(62,56,80,0.5)';
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      ctx.fillRect(x * CELL + CELL / 2 - 1, y * CELL + CELL / 2 - 1, 2, 2);
    }
    // food
    ctx.fillStyle = '#e60000';
    ctx.shadowColor = '#e60000'; ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // snake
    snake.forEach((seg, i) => {
      const alpha = 1 - (i / snake.length) * 0.6;
      ctx.fillStyle = `rgba(240,238,248,${alpha})`;
      const pad = i === 0 ? 1 : 2;
      ctx.fillRect(seg.x * CELL + pad, seg.y * CELL + pad, CELL - pad * 2, CELL - pad * 2);
    });
  }

  function step() {
    dir = { ...next };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS
        || snake.some(s => s.x === head.x && s.y === head.y)) {
      clearInterval(loop);
      state = 'dead';
      msgEl.textContent = `game over — score: ${score}`;
      if (score > hi) { hi = score; localStorage.setItem('snake_hi', hi); hiEl.textContent = String(hi).padStart(3, '0'); }
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++; scoreEl.textContent = String(score).padStart(3, '0'); placeFood();
    } else { snake.pop(); }
    draw();
  }

  function start() {
    if (state === 'running') return;
    if (state === 'dead') init();
    state = 'running'; msgEl.textContent = '';
    clearInterval(loop); loop = setInterval(step, 120);
  }

  document.addEventListener('keydown', e => {
    const map = { ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},
                  w:{x:0,y:-1},s:{x:0,y:1},a:{x:-1,y:0},d:{x:1,y:0} };
    if (e.key === ' ') { e.preventDefault(); start(); return; }
    const nd = map[e.key];
    if (!nd) return;
    e.preventDefault();
    if (nd.x + dir.x !== 0 || nd.y + dir.y !== 0) next = nd;
    if (state === 'idle') start();
  });

  let tx = 0, ty = 0;
  canvas.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; e.preventDefault(); }, { passive: false });
  canvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) { start(); return; }
    if (Math.abs(dx) > Math.abs(dy)) {
      const nd = dx > 0 ? {x:1,y:0} : {x:-1,y:0};
      if (nd.x + dir.x !== 0 || nd.y + dir.y !== 0) next = nd;
    } else {
      const nd = dy > 0 ? {x:0,y:1} : {x:0,y:-1};
      if (nd.x + dir.x !== 0 || nd.y + dir.y !== 0) next = nd;
    }
    if (state === 'idle') start();
  }, { passive: false });

  document.getElementById('snakeReset').addEventListener('click', () => { clearInterval(loop); init(); });
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

  let flipped = [], matched = 0, moves = 0, timer = null, seconds = 0, lock = false;

  function fmt(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
  function shuffle(a) { for (let i = a.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  window.addEventListener('gametabchange', tab => { if (tab !== 'memory' && timer) { clearInterval(timer); timer = null; } });

  function build() {
    if (timer) { clearInterval(timer); timer = null; }
    seconds = 0; moves = 0; matched = 0; lock = false; flipped = [];
    movEl.textContent='0'; matEl.textContent='0/8'; timEl.textContent='0:00'; msgEl.textContent='';
    const deck = shuffle([...EMOJIS,...EMOJIS]);
    grid.innerHTML = '';
    deck.forEach((em, i) => {
      const d = document.createElement('div');
      d.className = 'mem-card'; d.dataset.val = em; d.dataset.idx = i;
      d.textContent = em;
      d.addEventListener('click', onFlip);
      grid.appendChild(d);
    });
  }

  function onFlip(e) {
    if (lock) return;
    const card = e.currentTarget;
    if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
    if (!timer) timer = setInterval(() => { seconds++; timEl.textContent = fmt(seconds); }, 1000);
    card.classList.add('flipped');
    flipped.push(card);
    if (flipped.length === 2) {
      lock = true; moves++; movEl.textContent = moves;
      if (flipped[0].dataset.val === flipped[1].dataset.val) {
        flipped[0].classList.add('matched'); flipped[1].classList.add('matched');
        matched++; matEl.textContent = `${matched}/8`; flipped = []; lock = false;
        if (matched === 8) { clearInterval(timer); timer = null; msgEl.textContent = `cleared in ${fmt(seconds)}, ${moves} moves`; }
      } else {
        setTimeout(() => { flipped[0].classList.remove('flipped'); flipped[1].classList.remove('flipped'); flipped = []; lock = false; }, 900);
      }
    }
  }

  document.getElementById('memReset').addEventListener('click', build);
  build();
})();

/* ══════════════════════════════════════════════
   BREAKOUT
   ══════════════════════════════════════════════ */
(function initBreakout() {
  const canvas  = document.getElementById('breakoutCanvas');
  const ctx     = canvas.getContext('2d');
  const scoreEl = document.getElementById('brkScore');
  const hiEl    = document.getElementById('brkHi');
  const livesEl = document.getElementById('brkLives');
  const levelEl = document.getElementById('brkLevel');
  const msgEl   = document.getElementById('brkMsg');

  const W = canvas.width;    // 480
  const H = canvas.height;   // 300

  const COLS   = 10;
  const ROWS   = 5;
  const BW     = 41;         // brick width
  const BH     = 13;         // brick height
  const BGAP   = 4;
  const START_X = Math.round((W - (COLS * (BW + BGAP) - BGAP)) / 2);
  const START_Y = 30;

  // Row colour, then brightness modifier and score
  const ROW_DATA = [
    { color: '#9355ff', pts: 5 },   // violet
    { color: '#4466ff', pts: 4 },   // blue
    { color: '#00c4e8', pts: 3 },   // cyan
    { color: '#44bb77', pts: 2 },   // green
    { color: '#e66000', pts: 1 },   // orange-red
  ];

  let ball, paddle, bricks, score, hi, lives, level, state, keys, rafId;
  hi = parseInt(localStorage.getItem('brk_hi') || '0');
  hiEl.textContent = hi;

  function makeBricks() {
    const arr = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        arr.push({
          x: START_X + c * (BW + BGAP),
          y: START_Y + r * (BH + BGAP),
          alive: true,
          row: r,
        });
      }
    }
    return arr;
  }

  function calcSpeed() { return 3.0 + (level - 1) * 0.45; }

  function launchBall() {
    const spd = calcSpeed();
    const angle = (Math.random() * 50 - 25) * (Math.PI / 180);
    ball.vx = Math.sin(angle) * spd;
    ball.vy = -Math.cos(angle) * spd;
    // Ensure minimum horizontal drift so ball doesn't go perfectly straight up
    if (Math.abs(ball.vx) < 0.8) ball.vx = (ball.vx >= 0 ? 1 : -1) * 0.8;
  }

  function init() {
    paddle = { x: W / 2 - 44, y: H - 24, w: 88, h: 10 };
    ball   = { x: W / 2, y: H - 44, vx: 0, vy: 0, r: 6 };
    bricks = makeBricks();
    score  = 0; lives = 3; level = 1; state = 'idle'; keys = {};
    scoreEl.textContent = '0';
    livesEl.textContent = '♥♥♥';
    levelEl.textContent = '1';
    msgEl.textContent   = 'press space or tap to start';
  }

  function updateLives() {
    livesEl.textContent = '♥'.repeat(lives) + '♡'.repeat(Math.max(0, 3 - lives));
  }

  function draw() {
    // Background
    ctx.fillStyle = '#070610';
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.fillStyle = 'rgba(62,56,80,0.35)';
    for (let x = 0; x < W; x += 20) for (let y = 0; y < H; y += 20) { ctx.fillRect(x, y, 1, 1); }

    // Bricks
    bricks.forEach(b => {
      if (!b.alive) return;
      const rd = ROW_DATA[b.row];
      ctx.fillStyle = rd.color;
      ctx.fillRect(b.x, b.y, BW, BH);
      // Top highlight
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(b.x + 1, b.y, BW - 2, 2);
      // Bottom shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(b.x + 1, b.y + BH - 2, BW - 2, 2);
    });

    // Paddle — white glow
    ctx.shadowColor = 'rgba(200,196,248,0.5)';
    ctx.shadowBlur  = 10;
    ctx.fillStyle   = '#eeedf5';
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Ball — red glow
    ctx.shadowColor = '#e60000';
    ctx.shadowBlur  = 12;
    ctx.fillStyle   = '#ff4444';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function update() {
    if (state !== 'running') { draw(); return; }

    // Paddle keyboard
    if (keys['ArrowLeft']  || keys['a']) paddle.x = Math.max(0, paddle.x - 7);
    if (keys['ArrowRight'] || keys['d']) paddle.x = Math.min(W - paddle.w, paddle.x + 7);

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounces
    if (ball.x - ball.r < 0)     { ball.x = ball.r;     ball.vx =  Math.abs(ball.vx); }
    if (ball.x + ball.r > W)     { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
    if (ball.y - ball.r < 0)     { ball.y = ball.r;     ball.vy =  Math.abs(ball.vy); }

    // Paddle collision (only when ball moving downward)
    if (ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x - ball.r &&
        ball.x <= paddle.x + paddle.w + ball.r) {
      const hit  = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2); // -1..1
      const spd  = Math.min(8, Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy));
      const ang  = hit * 65 * (Math.PI / 180);
      ball.vx    = Math.sin(ang) * spd;
      ball.vy    = -Math.cos(ang) * spd;
      if (Math.abs(ball.vx) < 0.6) ball.vx = (ball.vx >= 0 ? 1 : -1) * 0.6;
      ball.y     = paddle.y - ball.r - 1;
    }

    // Ball lost
    if (ball.y - ball.r > H) {
      lives--;
      updateLives();
      if (lives <= 0) {
        state = 'gameover';
        msgEl.textContent = `game over — score: ${score}`;
        if (score > hi) { hi = score; localStorage.setItem('brk_hi', hi); hiEl.textContent = hi; }
      } else {
        state = 'waiting';
        ball.x = W / 2; ball.y = H - 44; ball.vx = 0; ball.vy = 0;
        msgEl.textContent = 'press space to continue';
      }
      draw();
      return;
    }

    // Brick collisions
    for (const b of bricks) {
      if (!b.alive) continue;
      const bx2 = b.x + BW, by2 = b.y + BH;
      if (ball.x + ball.r <= b.x  || ball.x - ball.r >= bx2) continue;
      if (ball.y + ball.r <= b.y  || ball.y - ball.r >= by2) continue;
      b.alive = false;
      score  += ROW_DATA[b.row].pts;
      scoreEl.textContent = score;

      const overlapL = ball.x + ball.r - b.x;
      const overlapR = bx2 - (ball.x - ball.r);
      const overlapT = ball.y + ball.r - b.y;
      const overlapB = by2 - (ball.y - ball.r);
      const minH = Math.min(overlapL, overlapR);
      const minV = Math.min(overlapT, overlapB);
      if (minH < minV) ball.vx = -ball.vx;
      else              ball.vy = -ball.vy;
      break; // one brick per frame
    }

    // Level complete
    if (bricks.every(b => !b.alive)) {
      level++;
      levelEl.textContent = level;
      bricks = makeBricks();
      // Speed up ball
      const spd = Math.min(8, calcSpeed());
      const ang  = Math.atan2(ball.vx, -ball.vy);
      ball.vx = Math.sin(ang) * spd;
      ball.vy = -Math.cos(ang) * spd;
      msgEl.textContent = `level ${level}!`;
      setTimeout(() => { if (state === 'running') msgEl.textContent = ''; }, 1500);
    }

    draw();
  }

  function gameLoop() {
    update();
    rafId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    if (state === 'gameover') init();
    if (state === 'idle' || state === 'waiting') {
      if (state === 'idle') launchBall();
      else { ball.x = W / 2; ball.y = H - 44; launchBall(); }
      state = 'running';
      msgEl.textContent = '';
    }
  }

  // Controls
  document.addEventListener('keydown', e => {
    keys[e.key] = true;
    if (e.key === ' ') { e.preventDefault(); startGame(); }
  });
  document.addEventListener('keyup', e => { delete keys[e.key]; });

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const mx = (e.clientX - rect.left) * scaleX;
    paddle.x = Math.max(0, Math.min(W - paddle.w, mx - paddle.w / 2));
  });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const tx = (e.touches[0].clientX - rect.left) * scaleX;
    paddle.x = Math.max(0, Math.min(W - paddle.w, tx - paddle.w / 2));
  }, { passive: false });

  canvas.addEventListener('touchstart', () => { startGame(); }, { passive: true });

  // Stop loop when switching tabs
  window.addEventListener('gametabchange', tab => {
    if (tab !== 'breakout') { cancelAnimationFrame(rafId); rafId = null; }
    else if (!rafId) { rafId = requestAnimationFrame(gameLoop); }
  });

  document.getElementById('brkReset').addEventListener('click', () => { init(); });

  init();
  rafId = requestAnimationFrame(gameLoop);
})();

/* ══════════════════════════════════════════════
   2048
   ══════════════════════════════════════════════ */
(function init2048() {
  const SIZE    = 4;
  const scoreEl = document.getElementById('g2048Score');
  const bestEl  = document.getElementById('g2048Best');
  const gridEl  = document.getElementById('g2048Grid');
  const msgEl   = document.getElementById('g2048Msg');

  let grid, score, best, gameOver;
  best = parseInt(localStorage.getItem('2048_best') || '0');
  bestEl.textContent = best;

  // Tile colours — dark theme with vibrant accents
  const TILE_STYLE = {
       2: { bg: '#1e1b2e', color: '#857ea0', fs: '22px' },
       4: { bg: '#2a2550', color: '#b0a8e0', fs: '22px' },
       8: { bg: '#4466ff', color: '#ffffff', fs: '22px' },
      16: { bg: '#3355cc', color: '#ffffff', fs: '22px' },
      32: { bg: '#00c4e8', color: '#070610', fs: '22px' },
      64: { bg: '#0099bb', color: '#ffffff', fs: '22px' },
     128: { bg: '#9355ff', color: '#ffffff', fs: '20px' },
     256: { bg: '#7733cc', color: '#ffffff', fs: '20px' },
     512: { bg: '#e66600', color: '#ffffff', fs: '20px' },
    1024: { bg: '#cc3300', color: '#ffffff', fs: '16px' },
    2048: { bg: '#e60000', color: '#ffffff', fs: '16px' },
  };

  function newGrid() { return Array.from({ length: SIZE }, () => Array(SIZE).fill(0)); }

  function addTile() {
    const empty = [];
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c] === 0) empty.push([r, c]);
    if (!empty.length) return false;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    grid[r][c] = Math.random() < 0.85 ? 2 : 4;
    return [r, c];
  }

  function renderGrid(newCell, mergedCells) {
    gridEl.innerHTML = '';
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'g2048-cell';
        const val = grid[r][c];
        if (val !== 0) {
          const tile = document.createElement('div');
          tile.className = 'g2048-tile';
          tile.textContent = val;
          const style = TILE_STYLE[Math.min(val, 2048)] || TILE_STYLE[2048];
          tile.style.background  = style.bg;
          tile.style.color       = style.color;
          tile.style.fontSize    = style.fs;
          if (val >= 2048) tile.style.boxShadow = '0 0 18px rgba(230,0,0,0.5)';
          if (newCell && newCell[0] === r && newCell[1] === c) tile.classList.add('is-new');
          else if (mergedCells && mergedCells.some(([mr, mc]) => mr === r && mc === c)) tile.classList.add('is-merged');
          cell.appendChild(tile);
        }
        gridEl.appendChild(cell);
      }
    }
  }

  function slideRow(row) {
    // Filter, merge, pad
    const tiles = row.filter(v => v !== 0);
    const result = [];
    let pts = 0;
    const merged = [];   // track col positions where merge happened
    let i = 0;
    while (i < tiles.length) {
      if (i + 1 < tiles.length && tiles[i] === tiles[i + 1]) {
        const val = tiles[i] * 2;
        result.push(val); pts += val; merged.push(result.length - 1);
        i += 2;
      } else { result.push(tiles[i]); i++; }
    }
    while (result.length < SIZE) result.push(0);
    const changed = result.some((v, j) => v !== row[j]);
    return { result, pts, changed, merged };
  }

  function move(dir) {
    // dir: 0=left 1=right 2=up 3=down
    if (gameOver) return;
    let moved = false;
    let points = 0;
    const mergedCells = [];

    for (let i = 0; i < SIZE; i++) {
      let row;
      if      (dir === 0) row = [...grid[i]];
      else if (dir === 1) row = [...grid[i]].reverse();
      else if (dir === 2) row = [grid[0][i], grid[1][i], grid[2][i], grid[3][i]];
      else                row = [grid[3][i], grid[2][i], grid[1][i], grid[0][i]];

      const { result, pts, changed, merged } = slideRow(row);
      if (changed) moved = true;
      points += pts;

      // Write back
      if (dir === 0) {
        grid[i] = result;
        merged.forEach(c => mergedCells.push([i, c]));
      } else if (dir === 1) {
        grid[i] = result.reverse();
        merged.forEach(c => mergedCells.push([i, SIZE - 1 - c]));
      } else if (dir === 2) {
        result.forEach((v, r) => grid[r][i] = v);
        merged.forEach(r => mergedCells.push([r, i]));
      } else {
        result.forEach((v, r) => grid[3 - r][i] = v);
        merged.forEach(r => mergedCells.push([3 - r, i]));
      }
    }

    if (!moved) return;

    score += points;
    scoreEl.textContent = score;
    if (score > best) { best = score; bestEl.textContent = best; localStorage.setItem('2048_best', best); }

    const newCell = addTile();
    renderGrid(newCell || null, mergedCells);

    // Win check
    if (grid.flat().some(v => v >= 2048) && !msgEl.textContent) {
      msgEl.textContent = '2048 — ты выиграл.';
    }

    // Lose check
    if (!canMove()) {
      gameOver = true;
      msgEl.textContent = 'game over';
    }
  }

  function canMove() {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
    return false;
  }

  function newGame() {
    grid = newGrid(); score = 0; gameOver = false;
    scoreEl.textContent = '0'; msgEl.textContent = '';
    addTile(); addTile();
    renderGrid();
  }

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!document.getElementById('panel-2048').classList.contains('active')) return;
    const map = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3 };
    if (e.key in map) { e.preventDefault(); move(map[e.key]); }
  });

  // Touch swipe on the board
  let tx0, ty0;
  gridEl.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; }, { passive: true });
  gridEl.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx0;
    const dy = e.changedTouches[0].clientY - ty0;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : 0);
    else                              move(dy > 0 ? 3 : 2);
  }, { passive: true });

  document.getElementById('g2048Reset').addEventListener('click', newGame);
  newGame();
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

  const BASE_COSTS = [10, 75, 300, 1000, 5000];
  const UPGRADES = [
    { id:'whisper',  name:'Whisper',        cost:BASE_COSTS[0], pps:0.1, desc:'someone is listening',    bought:0 },
    { id:'shadow',   name:'Shadow',          cost:BASE_COSTS[1], pps:0.5, desc:'it watches you',          bought:0 },
    { id:'crawler',  name:'Crawler',         cost:BASE_COSTS[2], pps:2,   desc:'moves in the dark',       bought:0 },
    { id:'void_eye', name:'Eye of the Void', cost:BASE_COSTS[3], pps:8,   desc:'sees through everything', bought:0 },
    { id:'nothing',  name:'The Nothing',     cost:BASE_COSTS[4], pps:30,  desc:'absolute emptiness',      bought:0 },
  ];

  let points = 0, totalEv = 0, clicks = 0;
  let passiveInterval = null;

  function save() {
    localStorage.setItem('void_save', JSON.stringify({
      points, totalEv, clicks,
      upgrades: UPGRADES.map(u => ({ bought: u.bought, cost: u.cost })),
    }));
  }
  function load() {
    const s = localStorage.getItem('void_save');
    if (!s) return;
    try {
      const d = JSON.parse(s);
      points = d.points || 0; totalEv = d.totalEv || 0; clicks = d.clicks || 0;
      (d.upgrades || []).forEach((saved, i) => {
        if (!UPGRADES[i]) return;
        UPGRADES[i].bought = saved.bought || 0;
        if (typeof saved.cost === 'number' && saved.cost >= BASE_COSTS[i]) UPGRADES[i].cost = saved.cost;
      });
    } catch (e) {}
  }

  function calcPPS() { return UPGRADES.reduce((a, u) => a + u.pps * u.bought, 0); }
  function fmt(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n).toString();
  }

  function buildUpgrades() {
    upsEl.innerHTML = '';
    UPGRADES.forEach(u => {
      const can = points >= u.cost;
      const d   = document.createElement('div');
      d.className = 'upgrade-item' + (can ? '' : ' disabled');
      const nameDiv = document.createElement('div'); nameDiv.className = 'upgrade-name';
      nameDiv.textContent = u.name + ' ';
      const bought = document.createElement('span'); bought.style.cssText = 'color:var(--dim);font-size:9px;';
      bought.textContent = `[${u.bought}]`;
      nameDiv.appendChild(bought);
      const costDiv = document.createElement('div'); costDiv.className = 'upgrade-cost';
      costDiv.textContent = `∅ ${fmt(u.cost)}`;
      const descDiv = document.createElement('div'); descDiv.className = 'upgrade-desc';
      descDiv.textContent = u.desc;
      d.appendChild(nameDiv); d.appendChild(costDiv); d.appendChild(descDiv);
      if (can) d.addEventListener('click', () => { if (points < u.cost) return; points -= u.cost; u.cost = Math.floor(u.cost * 1.15); u.bought++; update(); save(); });
      upsEl.appendChild(d);
    });
  }

  function update() {
    countEl.textContent = fmt(points); clickEl.textContent = fmt(clicks);
    totalEl.textContent = fmt(totalEv); psEl.textContent = fmt(calcPPS()) + '/s';
    buildUpgrades();
  }

  orb.addEventListener('click', () => {
    const isCrit    = Math.random() < 0.05;
    const baseGain  = 1 + UPGRADES.reduce((a, u) => a + u.bought * 0.1, 0);
    const finalGain = isCrit ? baseGain * 10 : baseGain;
    points += finalGain; totalEv += finalGain; clicks++;
    orb.style.transform = 'scale(0.92)';
    if (isCrit) { orb.classList.add('shake-anim'); orb.style.borderColor = '#fff'; setTimeout(() => { orb.classList.remove('shake-anim'); orb.style.borderColor = ''; }, 150); }
    setTimeout(() => { orb.style.transform = ''; }, 80);
    update(); save();
  });

  function startPassive() {
    if (passiveInterval) return;
    passiveInterval = setInterval(() => {
      const cps = calcPPS();
      if (cps > 0) { points += cps / 20; totalEv += cps / 20; update(); }
    }, 50);
  }
  function stopPassive() { clearInterval(passiveInterval); passiveInterval = null; }

  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPassive(); else startPassive(); });

  document.getElementById('voidReset').addEventListener('click', () => {
    if (!confirm('reset the void?')) return;
    points = 0; totalEv = 0; clicks = 0;
    UPGRADES.forEach((u, i) => { u.bought = 0; u.cost = BASE_COSTS[i]; });
    localStorage.removeItem('void_save');
    update();
  });

  load(); update(); startPassive();
})();