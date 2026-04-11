'use strict';

const PLAYER_ID  = '1191935552';
const OD         = 'https://api.opendota.com/api';
const CACHE_TTL  = 5 * 60 * 1000;
const CACHE_KEY  = `dota_cache_${PLAYER_ID}`;
const RANK_NAMES = ['', 'Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal'];

function rankFromTier(t) {
  if (!t) return { name: 'Unranked', stars: 0, major: 0 };
  return { name: RANK_NAMES[Math.floor(t / 10)] || '?', stars: t % 10, major: Math.floor(t / 10) };
}
function mmrEst(t) {
  if (!t) return null;
  return Math.max(0, Math.round((Math.floor(t / 10) - 1) * 770 + (t % 10 - 1) * 154 + 200));
}
function fmtDur(s) {
  if (!s || s < 0) return '--:--';
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
function ago(unix) {
  if (!unix) return '--';
  const d = Date.now() / 1000 - unix;
  if (d < 60)    return 'just now';
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}
function set(id, content) {
  const e = document.getElementById(id);
  if (e) e.textContent = content;
}
function setHtml(id, html) {
  const e = document.getElementById(id);
  if (e) e.innerHTML = html;
}
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    return data;
  } catch { return null; }
}
function writeCache(data) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { }
}

function render(player, wl, heroes, recent, hMap) {
  const { name: rName, stars, major } = rankFromTier(player.rank_tier);
  if (major === 8) {
    set('dotaMMR', player.leaderboard_ranking ? `#${player.leaderboard_ranking}` : '∞');
    set('dotaRank', 'IMMORTAL');
  } else if (player.rank_tier) {
    set('dotaMMR', `~${(mmrEst(player.rank_tier) || 0).toLocaleString()}`);
    set('dotaRank', `${rName.toUpperCase()} ${stars}`);
  } else {
    set('dotaMMR', '—');
    set('dotaRank', 'UNRANKED');
  }
  document.querySelectorAll('#rankStars .rank-star').forEach((s, i) => {
    s.classList.toggle('lit', i < stars);
  });

  const W = wl.win  || 0;
  const L = wl.lose || 0;
  const T = W + L;
  const wr = T ? (W / T * 100).toFixed(1) : '0.0';
  set('wlW',  `WIN ${W.toLocaleString()}`);
  set('wlL',  `LOSS ${L.toLocaleString()}`);
  set('wlWR', `${wr}%`);
  setTimeout(() => {
    const fill = document.getElementById('wlFill');
    if (fill) fill.style.width = wr + '%';
  }, 350);
  set('sgWR',    `${wr}%`);
  set('sgWRsub', W >= L ? `+${W - L} balance` : `${W - L} balance`);
  set('sgMatches', T.toLocaleString());

  if (recent && recent.length) {
    let tk = 0, td = 0, ta = 0;
    recent.forEach(m => { tk += m.kills || 0; td += m.deaths || 0; ta += m.assists || 0; });
    const n = recent.length;
    set('sgKDA', `${(tk/n).toFixed(1)} / ${(td/n).toFixed(1)} / ${(ta/n).toFixed(1)}`);

    const isWin = m => m.radiant_win === (m.player_slot < 128);
    const firstWin = isWin(recent[0]);
    let streak = 0;
    for (const m of recent) {
      if (isWin(m) === firstWin) streak++; else break;
    }
    setHtml('sgStreak',
      `<span class="${firstWin ? 'c-win' : 'c-loss'}">${firstWin ? 'W' : 'L'}${streak}</span>`);
    set('sgStreakLbl', firstWin ? 'win streak' : 'loss streak');
  }

  const sorted = [...heroes].sort((a, b) => (b.games || 0) - (a.games || 0));
  const heroListEl = document.getElementById('heroList');

  if (sorted.length && heroListEl) {
    const maxGames = sorted[0].games || 1;
    set('sgMain',    hMap[sorted[0].hero_id] || `hero_${sorted[0].hero_id}`);
    set('sgMainSub', `${sorted[0].games} games`);

    heroListEl.innerHTML =
      `<div class="hero-board-head">
        <div class="hbh-cell">#</div>
        <div class="hbh-cell">Hero</div>
        <div class="hbh-cell">Games</div>
        <div class="hbh-cell right">Win%</div>
        <div class="hbh-cell right">KDA</div>
      </div>` +
      sorted.slice(0, 8).map((h, i) => {
        const name  = esc(hMap[h.hero_id] || `hero_${h.hero_id}`);
        const g     = h.games || 0;
        const wrH   = g ? Math.round(h.win / g * 100) : 0;
        const kda   = h.kda ? Number(h.kda).toFixed(2) : '--';
        const wrCls = wrH >= 54 ? 'wr-g' : wrH >= 45 ? 'wr-o' : 'wr-b';
        const pct   = Math.round((g / maxGames) * 100);
        return `
          <div class="hero-row">
            <span class="hr-rank ${i < 3 ? 'top3' : ''}">${i + 1}</span>
            <span class="hr-name">${name}</span>
            <div class="hr-bar-wrap">
              <div class="hr-bar-track"><div class="hr-bar-fill" style="width:${pct}%"></div></div>
              <div class="hr-bar-games">${g} games</div>
            </div>
            <span class="hr-wr ${wrCls}">${wrH}%</span>
            <span class="hr-kda">${esc(kda)}</span>
          </div>`;
      }).join('');
  } else if (heroListEl) {
    heroListEl.innerHTML =
      `<div style="padding:20px;font-family:var(--mono);font-size:11px;color:var(--dim);">
        profile is private — data unavailable
      </div>`;
  }

  const matchListEl = document.getElementById('matchList');
  if (recent && recent.length && matchListEl) {
    const isWin = m => m.radiant_win === (m.player_slot < 128);
    matchListEl.innerHTML = recent.slice(0, 8).map(m => {
      const win  = isWin(m);
      const hero = esc(hMap[m.hero_id] || `hero_${m.hero_id}`);
      return `
        <div class="match-item">
          <div class="mi-stripe ${win ? 'win' : 'loss'}"></div>
          <div class="mi-result-col">
            <span class="mi-badge ${win ? 'win' : 'loss'}">${win ? 'WIN' : 'LOS'}</span>
          </div>
          <div class="mi-main">
            <span class="mi-hero">${hero}</span>
            <span class="mi-kda">
              <span class="kda-k">${m.kills ?? 0}</span>
              <span style="color:var(--dim)"> / </span>
              <span class="kda-d">${m.deaths ?? 0}</span>
              <span style="color:var(--dim)"> / </span>
              <span class="kda-a">${m.assists ?? 0}</span>
            </span>
          </div>
          <div class="mi-right">
            <span class="mi-dur">${fmtDur(m.duration)}</span>
            <span class="mi-ago">${ago((m.start_time || 0) + (m.duration || 0))}</span>
          </div>
        </div>`;
    }).join('');
  }
}

async function loadDota() {
  const cached = readCache();
  if (cached) {
    try { render(cached.player, cached.wl, cached.heroes, cached.recent, cached.hMap); return; }
    catch { }
  }

  try {
    const [pR, wlR, hR, recR, hnR] = await Promise.all([
      fetch(`${OD}/players/${PLAYER_ID}`),
      fetch(`${OD}/players/${PLAYER_ID}/wl`),
      fetch(`${OD}/players/${PLAYER_ID}/heroes`),
      fetch(`${OD}/players/${PLAYER_ID}/recentMatches`),
      fetch(`${OD}/heroes`),
    ]);

    if (![pR, wlR, hR, recR, hnR].every(r => r.ok)) {
      const failed = [pR, wlR, hR, recR, hnR].find(r => !r.ok);
      throw new Error(`Request failed: ${failed.status}`);
    }

    const [player, wl, heroes, recent, hn] = await Promise.all(
      [pR, wlR, hR, recR, hnR].map(r => r.json())
    );

    const hMap = {};
    if (Array.isArray(hn)) hn.forEach(h => { hMap[h.id] = h.localized_name; });

    writeCache({ player, wl, heroes, recent, hMap });
    render(player, wl, heroes, recent, hMap);

  } catch (err) {
    console.error('[trophy]', err);
    setHtml('dotaMMR', '<span class="api-error">⚠ failed to load data</span>');
    set('dotaRank', 'ERROR');
  }
}

loadDota();