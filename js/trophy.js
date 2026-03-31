'use strict';

const PLAYER_ID  = '1191935552';
const OD         = 'https://api.opendota.com/api';
const RANK_NAMES = ['','Herald','Guardian','Crusader','Archon','Legend','Ancient','Divine','Immortal'];
const delay      = ms => new Promise(r => setTimeout(r, ms));

function rankFromTier(t) {
  if (!t) return { name: 'Unranked', stars: 0, major: 0 };
  return { name: RANK_NAMES[Math.floor(t / 10)] || '?', stars: t % 10, major: Math.floor(t / 10) };
}
function mmrEst(t) {
  if (!t) return null;
  return Math.round((Math.floor(t / 10) - 1) * 770 + (t % 10 - 1) * 154 + 200);
}
function fmtDur(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
function ago(unix) {
  const d = Date.now() / 1000 - unix;
  if (d < 3600)  return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}
function set(id, html) {
  const e = document.getElementById(id);
  if (e) e.innerHTML = html;
}

async function loadDota() {
  try {
    const [pR, wlR, hR, recR, hnR] = await Promise.all([
      fetch(`${OD}/players/${PLAYER_ID}`),
      fetch(`${OD}/players/${PLAYER_ID}/wl`),
      fetch(`${OD}/players/${PLAYER_ID}/heroes`),
      fetch(`${OD}/players/${PLAYER_ID}/recentMatches`),
      fetch(`${OD}/heroes`),
    ]);

    if (!pR.ok) throw new Error('Profile fetch failed');

    const [player, wl, heroes, recent, hn] = await Promise.all([
      pR.json(), wlR.json(), hR.json(), recR.json(), hnR.json(),
    ]);

    const hMap = {};
    hn.forEach(h => { hMap[h.id] = h.localized_name; });

    /* ── Rank ── */
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
      if (i < stars) s.classList.add('lit');
    });

    /* ── W/L ── */
    const W = wl.win || 0, L = wl.lose || 0, T = W + L;
    const wr = T ? (W / T * 100).toFixed(1) : '0.0';
    set('wlW',  `WIN ${W.toLocaleString()}`);
    set('wlL',  `LOSS ${L.toLocaleString()}`);
    set('wlWR', `${wr}%`);
    setTimeout(() => { document.getElementById('wlFill').style.width = wr + '%'; }, 300);
    set('sgWR',      `${wr}%`);
    set('sgWRsub',   W >= L ? `+${W - L} balance` : `${W - L} balance`);
    set('sgMatches', T.toLocaleString());

    /* ── KDA + streak ── */
    if (recent && recent.length) {
      let tk = 0, td = 0, ta = 0;
      recent.forEach(m => { tk += m.kills || 0; td += m.deaths || 0; ta += m.assists || 0; });
      const n = recent.length;
      set('sgKDA', `${(tk / n).toFixed(1)} / ${(td / n).toFixed(1)} / ${(ta / n).toFixed(1)}`);

      let streak = 0;
      const firstWin = recent[0].radiant_win === (recent[0].player_slot < 128);
      for (const m of recent) {
        if ((m.radiant_win === (m.player_slot < 128)) === firstWin) streak++; else break;
      }
      set('sgStreak',    `<span class="${firstWin ? 'c-win' : 'c-loss'}">${firstWin ? 'W' : 'L'}${streak}</span>`);
      set('sgStreakLbl', firstWin ? 'win streak' : 'loss streak');
    }

    /* ── Hero leaderboard ── */
    const sorted = [...heroes].sort((a, b) => (b.games || 0) - (a.games || 0));

    if (sorted.length) {
      const maxGames = sorted[0].games || 1;
      set('sgMain',    hMap[sorted[0].hero_id] || `hero_${sorted[0].hero_id}`);
      set('sgMainSub', `${sorted[0].games} games`);

      document.getElementById('heroList').innerHTML =
        `<div class="hero-board-head">
          <div class="hbh-cell">#</div>
          <div class="hbh-cell">Герой</div>
          <div class="hbh-cell">Игры</div>
          <div class="hbh-cell right">Win%</div>
          <div class="hbh-cell right">KDA</div>
        </div>` +
        sorted.slice(0, 8).map((h, i) => {
          const name  = hMap[h.hero_id] || `hero_${h.hero_id}`;
          const g     = h.games || 0;
          const wrH   = g ? Math.round(h.win / g * 100) : 0;
          const kda   = h.kda ? h.kda.toFixed(2) : '—';
          const wrCls = wrH >= 54 ? 'wr-g' : wrH >= 45 ? 'wr-o' : 'hr-b';
          const pct   = Math.round((g / maxGames) * 100);
          return `
            <div class="hero-row">
              <span class="hr-rank ${i < 3 ? 'top3' : ''}">${i + 1}</span>
              <span class="hr-name">${name}</span>
              <div class="hr-bar-wrap">
                <div class="hr-bar-track"><div class="hr-bar-fill" style="width:${pct}%"></div></div>
                <div class="hr-bar-games">${g} игр</div>
              </div>
              <span class="hr-wr ${wrCls}">${wrH}%</span>
              <span class="hr-kda">${kda}</span>
            </div>`;
        }).join('');
    } else {
      document.getElementById('heroList').innerHTML =
        `<div style="padding:16px;font-family:var(--mono);font-size:11px;color:var(--dim);">профиль скрыт — данные недоступны</div>`;
    }

    /* ── Recent matches ── */
    if (recent && recent.length) {
      document.getElementById('matchList').innerHTML = recent.slice(0, 8).map(m => {
        const win  = m.radiant_win === (m.player_slot < 128);
        const hero = hMap[m.hero_id] || `hero_${m.hero_id}`;
        return `
          <div class="match-item">
            <div class="mi-stripe ${win ? 'win' : 'loss'}"></div>
            <div class="mi-result-col">
              <span class="mi-badge ${win ? 'win' : 'loss'}">${win ? 'WIN' : 'LOS'}</span>
            </div>
            <div class="mi-main">
              <span class="mi-hero">${hero}</span>
              <span class="mi-kda">
                <span class="kda-k">${m.kills}</span>
                <span style="color:var(--dim)"> / </span>
                <span class="kda-d">${m.deaths}</span>
                <span style="color:var(--dim)"> / </span>
                <span class="kda-a">${m.assists}</span>
              </span>
            </div>
            <div class="mi-right">
              <span class="mi-dur">${fmtDur(m.duration)}</span>
              <span class="mi-ago">${ago(m.start_time + m.duration)}</span>
            </div>
          </div>`;
      }).join('');
    }

  } catch (err) {
    console.error(err);
    set('dotaMMR', '<span class="api-error">⚠ не удалось загрузить данные</span>');
    set('dotaRank', 'ERROR');
  }
}

loadDota();