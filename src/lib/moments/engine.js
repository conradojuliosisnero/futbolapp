/*! Minuto 90 · Match Moments (ESM). Motor de animaciones de momentos clave: GSAP (movimiento) + anime.js v3 (trazo SVG). */

const G = typeof window !== 'undefined' ? window : {};

const DEFAULT_THEME = {
  bg: '#0c0d0c',
  surface: '#151714',
  text: '#f1f2ee',
  textMuted: '#9a9d93',
  accent: '#c6f432',
  accentContrast: '#0c0d0c',
  live: '#e8332b',
  yellow: '#f2c230',
  fontSans: "'Archivo', Helvetica, Arial, sans-serif",
  fontMono: "'JetBrains Mono', ui-monospace, monospace",
};

const MOMENT_TYPES = ['goal', 'lastMinuteGoal', 'yellow', 'red', 'secondYellow', 'var', 'fullTime'];

const HAPTICS = {
  goal: [60, 40, 140],
  lastMinuteGoal: [80, 40, 80, 40, 240],
  yellow: [40],
  red: [140, 60, 140],
  secondYellow: [40, 80, 140],
  var: [30, 40, 30],
  fullTime: [120, 80, 120, 80, 400],
};

// ---------- utilidades ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rgba = (hex, a) => {
  const h = String(hex).replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
const el = (html) => { const tpl = document.createElement('template'); tpl.innerHTML = html.trim(); return tpl.content.firstElementChild; };
const $ = (n, k) => n.querySelector('[data-' + k + ']');
const $$ = (n, k) => Array.from(n.querySelectorAll('[data-' + k + ']'));
const repeat = (s, n) => Array(n).fill(s).join('');
const chars = (word) => Array.from(String(word)).map((c) => `<span data-ch style="display:inline-block;will-change:transform">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
const addCleanup = (node, fn) => { (node.__cleanup = node.__cleanup || []).push(fn); };
const presetDraw = (els) => els.forEach((p) => { const L = p.getTotalLength(); p.setAttribute('stroke-dasharray', L); p.style.strokeDashoffset = L; });
const cardBg = (c) => `linear-gradient(155deg, color-mix(in oklab, ${c} 62%, white) 0%, ${c} 48%, color-mix(in oklab, ${c} 68%, black) 100%)`;

const beamsHTML = (c) => `<div style="position:absolute;inset:0;overflow:hidden;pointer-events:none">${[22, 78].map((x) => `<div data-beam style="position:absolute;top:-12%;left:${x}%;width:48cqmin;height:160cqmax;margin-left:-24cqmin;transform-origin:50% 0;background:linear-gradient(180deg, ${rgba(c, 0.24)}, ${rgba(c, 0)} 72%);clip-path:polygon(45% 0,55% 0,100% 100%,0 100%);opacity:0;will-change:transform,opacity"></div>`).join('')}</div>`;

const sceneRoot = (inner) => el(`<div data-scene style="position:absolute;inset:0;overflow:hidden;display:grid;place-items:center;pointer-events:auto;cursor:pointer">${inner}</div>`);

// ---------- piezas SVG ----------
function ballSVG(color, size, filled) {
  const pts = [0, 1, 2, 3, 4].map((k) => { const a = (-90 + 72 * k) * Math.PI / 180; return [50 + 16 * Math.cos(a), 50 + 16 * Math.sin(a)]; });
  const pent = 'M' + pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' L') + ' Z';
  const spokes = pts.map(([x, y]) => { const dx = x - 50, dy = y - 50, l = Math.hypot(dx, dy); return `<path data-draw d="M${x.toFixed(2)} ${y.toFixed(2)} L${(50 + dx / l * 45).toFixed(2)} ${(50 + dy / l * 45).toFixed(2)}"/>`; }).join('');
  return `<svg data-ball viewBox="0 0 100 100" style="width:${size};height:${size};flex:none;overflow:visible" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle data-draw cx="50" cy="50" r="45"/><path data-draw data-pent d="${pent}" fill="${color}" fill-opacity="${filled ? 1 : 0}"/>${spokes}</svg>`;
}

const ringsSVG = (color, n, width = 0.5, key = 'ring') => repeat(`<div data-${key} style="position:absolute;left:50%;top:50%;width:180cqmax;height:180cqmax;margin:-90cqmax 0 0 -90cqmax;border-radius:50%;border:${(width * 1.8).toFixed(2)}cqmax solid ${color};opacity:0;transform:scale(0);will-change:transform,opacity;pointer-events:none"></div>`, n);

function raysSVG(color, n = 24) {
  let p = '';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, r1 = 9 + (i % 2) * 3, r2 = 30 + (i % 3) * 7;
    p += `<path data-ray d="M${(Math.cos(a) * r1).toFixed(2)} ${(Math.sin(a) * r1).toFixed(2)} L${(Math.cos(a) * r2).toFixed(2)} ${(Math.sin(a) * r2).toFixed(2)}" opacity="0"/>`;
  }
  return `<svg viewBox="-50 -50 100 100" style="position:absolute;left:50%;top:50%;width:150cqmin;height:150cqmin;translate:-50% -50%;overflow:visible;pointer-events:none" fill="none" stroke="${color}" stroke-width=".7" stroke-linecap="round">${p}</svg>`;
}

function cracksSVG(color) {
  let p = '';
  for (let i = 0; i < 9; i++) {
    let a = (i / 9) * Math.PI * 2 + Math.random() * 0.3, r = 12;
    const pts = [[Math.cos(a) * r, Math.sin(a) * r]];
    while (r < 48) { r += 6 + Math.random() * 8; a += (Math.random() - 0.5) * 0.35; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    p += `<path data-crack d="M${pts.map((q) => q[0].toFixed(1) + ' ' + q[1].toFixed(1)).join(' L')}"/>`;
  }
  return `<svg viewBox="-50 -50 100 100" style="position:absolute;left:50%;top:50%;width:130cqmin;height:130cqmin;translate:-50% -50%;overflow:visible;pointer-events:none" fill="none" stroke="${color}" stroke-width=".35" stroke-linecap="round" stroke-linejoin="round" opacity=".55">${p}</svg>`;
}

const shockSVG = (c) => repeat(`<div data-shock style="position:absolute;left:50%;top:50%;width:150cqmin;height:150cqmin;margin:-75cqmin 0 0 -75cqmin;border-radius:50%;border:1.5cqmin solid ${c};opacity:0;transform:scale(0);will-change:transform,opacity;pointer-events:none"></div>`, 2);

// ---------- animaciones compartidas (anime.js) ----------
function drawRays(anime, node) {
  const rays = $$(node, 'ray');
  anime({ targets: rays, strokeDashoffset: [anime.setDashoffset, 0], duration: 700, delay: anime.stagger(14), easing: 'easeOutExpo' });
  anime({ targets: rays, opacity: [{ value: 1, duration: 1 }, { value: 0, duration: 500, delay: 550 }], delay: anime.stagger(14), easing: 'linear' });
}

// ---------- partículas en canvas: un canvas por capa, sin nodos DOM por partícula ----------
const SPRITES = {};
const darken = (hex, k) => {
  const h = String(hex).replace('#', '');
  if (!/^[0-9a-f]{3}([0-9a-f]{3})?$/i.test(h)) return hex;
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16), f = (v) => Math.round(v * k);
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
};
function ballSprite(fill, ink, px) {
  const key = fill + ink + px; if (SPRITES[key]) return SPRITES[key];
  const c = document.createElement('canvas'); c.width = c.height = px;
  const x = c.getContext('2d'), k = px / 18;
  x.translate(px / 2, px / 2); x.scale(k, k); x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.arc(0, 0, 8, 0, 7); x.fillStyle = fill; x.fill(); x.lineWidth = 0.9; x.strokeStyle = ink; x.stroke();
  const pts = [0, 1, 2, 3, 4].map((i) => { const a = (-90 + 72 * i) * Math.PI / 180; return [3.2 * Math.cos(a), 3.2 * Math.sin(a)]; });
  x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); x.fillStyle = ink; x.fill();
  x.beginPath(); pts.forEach(([a, b]) => { const l = Math.hypot(a, b); x.moveTo(a, b); x.lineTo(a / l * 7.6, b / l * 7.6); }); x.stroke();
  return (SPRITES[key] = c);
}
function shadeSprite(px) {
  const key = 'shade' + px; if (SPRITES[key]) return SPRITES[key];
  const c = document.createElement('canvas'); c.width = c.height = px;
  const x = c.getContext('2d'), r = px / 2 * 8 / 9, gr = x.createRadialGradient(px * 0.38, px * 0.34, 0, px / 2, px / 2, r);
  gr.addColorStop(0, 'rgba(255,255,255,.5)'); gr.addColorStop(0.42, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.5)');
  x.fillStyle = gr; x.beginPath(); x.arc(px / 2, px / 2, r, 0, 7); x.fill();
  return (SPRITES[key] = c);
}

const TIERS = { high: { k: 1, dpr: 2, low: false }, low: { k: 0.5, dpr: 1.25, low: true } };
function detectTier(q) {
  if (q === 'high' || q === 'low') return TIERS[q];
  const n = G.navigator || {};
  const weak = (n.hardwareConcurrency && n.hardwareConcurrency <= 4) || (n.deviceMemory && n.deviceMemory <= 2) || (n.connection && n.connection.saveData);
  return weak ? TIERS.low : TIERS.high;
}

function particleLayer(layer, gsap, tier) {
  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:3';
  layer.appendChild(cv);
  const g = cv.getContext('2d');
  const SPR = 64, shade = shadeSprite(SPR);
  let W = 0, H = 0, dpr = 1, list = [], on = false;
  const size = () => {
    const r = layer.getBoundingClientRect();
    dpr = Math.min(G.devicePixelRatio || 1, tier.dpr); W = r.width; H = r.height;
    cv.width = Math.max(1, Math.round(W * dpr)); cv.height = Math.max(1, Math.round(H * dpr));
  };
  size();
  const ro = G.ResizeObserver ? new ResizeObserver(size) : null; if (ro) ro.observe(layer);

  function tick(time, dtMs) {
    const dt = Math.min(dtMs, 50) / 1000, f60 = dt * 60;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    let alive = 0;
    for (let i = 0; i < list.length; i++) {
      const p = list[i];
      p.age += dt;
      if (p.age < 0) { alive++; continue; }
      if (p.age > p.life) continue;
      alive++;
      const dr = Math.pow(p.drag, f60);
      p.vx = p.vx * dr + (p.sway ? Math.sin(p.age * p.wob + p.ph) * p.sway * dt : 0);
      p.vy = p.vy * dr + p.g * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
      g.globalAlpha = Math.max(0, Math.min(1, (p.life - p.age) / 0.45, p.age / 0.04));
      const cs = Math.cos(p.r), sn = Math.sin(p.r);
      if (p.kind === 'c') {
        p.f += p.vf * dt;
        const cf = Math.cos(p.f);
        g.setTransform(dpr * cs, dpr * sn, -dpr * sn * cf, dpr * cs * cf, p.x * dpr, p.y * dpr);
        g.fillStyle = cf > 0 ? p.c : p.c2;
        if (p.round) { g.beginPath(); g.arc(0, 0, p.w / 2, 0, 7); g.fill(); } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        const sc = (p.sz / SPR) * (p.age < 0.18 ? 0.35 + (p.age / 0.18) * 0.65 : 1);
        g.setTransform(dpr * cs * sc, dpr * sn * sc, -dpr * sn * sc, dpr * cs * sc, p.x * dpr, p.y * dpr);
        g.drawImage(p.img, -SPR / 2, -SPR / 2);
        g.setTransform(dpr * sc, 0, 0, dpr * sc, p.x * dpr, p.y * dpr);
        g.drawImage(shade, -SPR / 2, -SPR / 2);
      }
    }
    g.globalAlpha = 1;
    if (!alive) stop();
  }
  function start() { if (!on) { on = true; gsap.ticker.add(tick); } }
  function stop() { list = []; on = false; gsap.ticker.remove(tick); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height); }
  const R = Math.random;

  return {
    origin(el) { const a = layer.getBoundingClientRect(), b = el.getBoundingClientRect(); return [b.left - a.left + b.width / 2, b.top - a.top + b.height / 2]; },
    confetti(x, y, colors, count, power = 1) {
      const k = Math.max(0.6, Math.min(1.4, Math.min(W, H) / 700)), n = Math.round(count * tier.k);
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (R() - 0.5) * Math.PI * 1.15, v = (520 + R() * 980) * k * power, w = (5 + R() * 6) * k, c = colors[i % colors.length];
        list.push({ kind: 'c', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 900 * k, drag: 0.94, sway: 140 * k, wob: 3 + R() * 3, ph: R() * 6,
          r: R() * 6, vr: (R() - 0.5) * 10, f: R() * 6, vf: 6 + R() * 10, w, h: w * (1.3 + R()), round: R() < 0.25,
          c, c2: darken(c, 0.62), age: -R() * 0.08, life: 2.3 + R() * 0.9 });
      }
      start();
    },
    balls(x, y, t, count, scale) {
      const k = Math.max(0.5, scale / 400), n = Math.round(count * tier.k);
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (R() - 0.5) * Math.PI * 1.7, v = (380 + R() * 820) * k;
        list.push({ kind: 'b', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 1500 * k, drag: 0.985,
          r: R() * 6, vr: (R() - 0.5) * 16, sz: scale * (0.05 + R() * 0.055), img: ballSprite(i % 3 === 0 ? t.accent : t.text, t.bg, SPR),
          age: -R() * 0.06, life: 1.5 + R() * 0.6 });
      }
      start();
    },
    clear: stop,
    destroy() { stop(); if (ro) ro.disconnect(); cv.remove(); },
  };
}
const psOf = (host) => { const l = host && host.closest && host.closest('[data-pelibox-moments]'); return l && l.__ps; };

function confetti(anime, host, colors, count = 70, power = 1) {
  const ps = psOf(host); if (!ps) return;
  const [x, y] = ps.origin(host); ps.confetti(x, y, colors, count, power);
}

function haloIn(anime, node) {
  anime({ targets: $(node, 'arc'), strokeDashoffset: [anime.setDashoffset, 0], duration: 1100, easing: 'easeInOutCubic' });
  anime({ targets: $(node, 'dots'), opacity: [0, 0.6], duration: 600, delay: 300, easing: 'linear' });
  anime({
    targets: $$(node, 'spark'),
    opacity: [{ value: 1, duration: 80 }, { value: 0, duration: 420, delay: 380 }],
    scale: [{ value: [0, 1.6], duration: 420, easing: 'easeOutBack' }, { value: 0, duration: 420, easing: 'easeInQuad' }],
    delay: anime.stagger(55, { start: 250 }),
    easing: 'easeOutQuad',
  });
}

// ---------- bloques de contenido ----------
function scoreRow(t, d) {
  const side = d.side === 'away' ? 1 : 0;
  const prev = d.prevScore || d.score.map((s, i) => (i === side ? Math.max(0, s - 1) : s));
  const digit = (i) => i === side
    ? `<span style="position:relative;display:inline-block;overflow:hidden;height:1em;line-height:1em;vertical-align:top"><span data-old style="display:block">${prev[i]}</span><span data-new style="position:absolute;left:0;top:0;display:block;color:${t.accent}">${d.score[i]}</span></span>`
    : `<span style="display:inline-block;line-height:1em">${d.score[i]}</span>`;
  const code = `font:700 max(12px,3.2cqmin)/1 ${t.fontMono};letter-spacing:.06em;color:${t.textMuted}`;
  return `<div data-score style="display:flex;align-items:center;gap:2.6cqmin;padding:1.6cqmin 3.2cqmin;border-radius:999px;background:${rgba(t.text, 0.08)};color:${t.text}">
    <span style="${code}">${esc(d.home)}</span>
    <span style="display:flex;gap:1.4cqmin;font:900 6cqmin/1 ${t.fontSans};font-variant-numeric:tabular-nums">${digit(0)}<span style="color:${t.textMuted}">–</span>${digit(1)}</span>
    <span style="${code}">${esc(d.away)}</span></div>`;
}

// --- portería: red con profundidad (vista frontal) ---
const NET = { L: 16, R: 184, T: 14, B: 112, bL: 34, bR: 166, bT: 28, N: 14, M: 8 };

function ballGroup(fill, ink) {
  const pts = [0, 1, 2, 3, 4].map((k) => { const a = (-90 + 72 * k) * Math.PI / 180; return [3.2 * Math.cos(a), 3.2 * Math.sin(a)]; });
  const pent = 'M' + pts.map((p) => p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' L') + ' Z';
  const spokes = pts.map(([x, y]) => { const l = Math.hypot(x, y); return `M${x.toFixed(2)} ${y.toFixed(2)} L${(x / l * 7.6).toFixed(2)} ${(y / l * 7.6).toFixed(2)}`; }).join(' ');
  return `<circle r="8" fill="${fill}" stroke="${ink}" stroke-width=".9"/><path d="${pent}" fill="${ink}"/><path d="${spokes}" stroke="${ink}" stroke-width=".9" stroke-linecap="round" fill="none"/>`;
}

function netSVG(t) {
  const { L, R, T, B, bL, bR, bT, N, M } = NET;
  let side = '';
  for (let k = 1; k < 4; k++) {
    const f = k / 4;
    const xl = L + (bL - L) * f, xr = R + (bR - R) * f, y = T + (bT - T) * f;
    side += `M${xl.toFixed(1)} ${y.toFixed(1)} V${B} M${xr.toFixed(1)} ${y.toFixed(1)} V${B} M${xl.toFixed(1)} ${y.toFixed(1)} H${xr.toFixed(1)} `;
  }
  for (let j = 1; j < M; j++) {
    const y = bT + (B - bT) * (j / M), yf = T + (B - T) * (j / M);
    side += `M${L} ${yf.toFixed(1)} L${bL} ${y.toFixed(1)} M${R} ${yf.toFixed(1)} L${bR} ${y.toFixed(1)} `;
  }
  const gid = 'pbs' + Math.random().toString(36).slice(2, 8);
  return `<svg data-net viewBox="0 0 200 120" style="display:block;width:100%;height:auto;overflow:visible" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <defs><radialGradient id="${gid}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient></defs>
    <path d="M-10 ${B} H210" stroke="${t.text}" stroke-opacity=".18" stroke-width=".8"/>
    <ellipse data-shadow cx="100" cy="${B + 1}" rx="7" ry="1.6" fill="#000" opacity="0"/>
    <g stroke="${t.text}" stroke-opacity=".32" stroke-width=".55">
      <path data-side d="${side}" opacity="0"/>
      <path data-side d="M${L} ${T} L${bL} ${bT} H${bR} L${R} ${T} M${bL} ${bT} V${B} M${bR} ${bT} V${B}" opacity="0"/>
      ${repeat('<path data-mrow opacity="0"/>', M)}${repeat('<path data-mcol opacity="0"/>', N - 1)}
    </g>
    ${repeat(`<circle data-ghost r="8" fill="${t.text}" opacity="0"/>`, 3)}
    <g data-fly opacity="0"><g data-spin>${ballGroup(t.text, t.bg)}</g><circle r="8" fill="url(#${gid})"/></g>
    <g data-post>
      <path data-frame d="M${L} ${B} V${T} H${R} V${B}" stroke="#000" stroke-opacity=".45" stroke-width="4" transform="translate(1.4 1.4)"/>
      <path data-frame d="M${L} ${B} V${T} H${R} V${B}" stroke="${t.text}" stroke-width="4"/>
      <path data-frame d="M${L - 0.9} ${B} V${T - 0.9} H${R - 0.9}" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>
    </g>
  </svg>`;
}

function ballBurst(anime, host, t, count, W) {
  const ps = psOf(host); if (!ps || !count) return;
  const [x, y] = ps.origin(host); ps.balls(x, y, t, count, W);
}

function goalContent(t, d, word, big) {
  return `<div data-content style="position:relative;display:flex;flex-direction:column;align-items:center;gap:2.2cqmin;text-align:center;padding:3cqmin 5cqmin">
    <div data-netwrap style="position:relative;width:min(54cqmin,86cqw)">
      ${netSVG(t)}
      <div data-impact style="position:absolute;left:50%;top:50%;width:0;height:0">${ringsSVG(t.accent, 3)}${raysSVG(t.accent, big ? 32 : 24)}</div>
      <div data-burst style="position:absolute;left:50%;top:50%;width:0;height:0"></div>
    </div>
    <div data-eyebrow style="display:flex;align-items:center;gap:2cqmin;font:700 max(12px,3cqmin)/1 ${t.fontMono};letter-spacing:.16em;text-transform:uppercase;color:${t.accent}">
      <span>${esc(d.minute)}</span><span style="width:6cqmin;height:2px;background:currentColor"></span><span>${esc(d.team)}</span></div>
    <div data-word style="display:flex;font:900 ${big ? 26 : 24}cqmin/.8 ${t.fontSans};letter-spacing:-.05em;color:${t.accent};text-shadow:0 1.5cqmin 6cqmin rgba(0,0,0,.35)">${chars(word)}</div>
    ${d.headline ? `<div data-headline style="font:800 4.6cqmin/1.05 ${t.fontSans};color:${t.text};letter-spacing:-.02em;max-width:80cqw;text-wrap:balance">${esc(d.headline)}</div>` : ''}
    <div data-meta style="display:flex;flex-direction:column;align-items:center;gap:.8cqmin">
      <div style="font:800 5cqmin/1 ${t.fontSans};color:${t.text};letter-spacing:-.01em">${esc(d.scorer)}</div>
      ${d.assist ? `<div style="font:500 max(12px,2.8cqmin)/1.2 ${t.fontSans};color:${t.textMuted}">Asistencia · ${esc(d.assist)}</div>` : ''}
    </div>
    ${d.score ? scoreRow(t, d) : ''}
  </div>`;
}

function goalIn(ctx, node, tl, at, opts = {}) {
  const { gsap, anime, t } = ctx;
  const { L, R, T, B, bL, bR, bT, N, M } = NET;
  const ch = $$(node, 'ch');
  const parts = ['eyebrow', 'headline', 'meta', 'score'].map((k) => $(node, k)).filter(Boolean);
  const wrap = $(node, 'netwrap'), fly = $(node, 'fly'), spin = $(node, 'spin'), shadow = $(node, 'shadow');
  const rows = $$(node, 'mrow'), cols = $$(node, 'mcol'), frame = $$(node, 'frame'), sides = $$(node, 'side');

  // punto de impacto aleatorio dentro de la red
  const spots = [[128, 52], [70, 50], [146, 90], [56, 88], [100, 44]];
  const [ix, iy] = spots[Math.floor(Math.random() * spots.length)];
  ['impact', 'burst'].forEach((k) => { const e = $(node, k); e.style.left = `${ix / 2}%`; e.style.top = `${iy / 1.2}%`; });

  // malla de la red: se deforma hacia el punto de impacto
  const mesh = { b: 0 };
  const vx = (i) => bL + (bR - bL) * (i / N), vy = (j) => bT + (B - bT) * (j / M);
  const disp = (i, j) => {
    const x = vx(i), y = vy(j);
    if (i === 0 || i === N || j === 0 || j === M) return [x, y];
    const dx = ix - x, dy = iy - y, f = Math.exp(-(dx * dx + dy * dy) / 1800) * mesh.b * 0.5;
    return [x + dx * f, y + dy * f];
  };
  const pt = (p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1);
  const renderMesh = () => {
    rows.forEach((r, k) => { const j = k + 1; let d = ''; for (let i = 0; i <= N; i++) d += (i ? ' L' : 'M') + pt(disp(i, j)); r.setAttribute('d', d); });
    cols.forEach((c, k) => { const i = k + 1; let d = ''; for (let j = 0; j <= M; j++) d += (j ? ' L' : 'M') + pt(disp(i, j)); c.setAttribute('d', d); });
  };
  renderMesh();

  presetDraw(frame);
  gsap.set(ch, { yPercent: 120, rotate: (i) => (i - (ch.length - 1) / 2) * 14, opacity: 0, transformOrigin: '50% 100%' });
  gsap.set(parts, { opacity: 0, y: 24 });
  gsap.set(wrap, { opacity: 0, scale: 0.92 });
  const nw = $(node, 'new'); if (nw) gsap.set(nw, { yPercent: 105 });

  // trayectoria del balón: viene desde la cámara (grande) hasta la red (pequeño)
  const P0 = [ix < 100 ? 160 : 40, 200], P1 = [100, 8], P2 = [ix, iy];
  const fl = { p: 0 };
  const ghosts = ctx.low ? [] : $$(node, 'ghost');
  const bez = (p) => { const q = 1 - p; return [q * q * P0[0] + 2 * q * p * P1[0] + p * p * P2[0], q * q * P0[1] + 2 * q * p * P1[1] + p * p * P2[1], 4.4 + (1 - 4.4) * p]; };
  const place = () => {
    const [x, y, sc] = bez(fl.p);
    gsap.set(fly, { x, y, scale: sc });
    const flying = fl.p > 0 && fl.p < 1;
    ghosts.forEach((gh, k) => {
      const [gx, gy, gs] = bez(Math.max(0, fl.p - 0.05 * (k + 1)));
      gh.setAttribute('cx', gx.toFixed(1)); gh.setAttribute('cy', gy.toFixed(1)); gh.setAttribute('r', (8 * gs * (1 - k * 0.1)).toFixed(2));
      gh.setAttribute('opacity', flying ? (0.2 - k * 0.055).toFixed(3) : 0);
    });
  };
  gsap.set(fly, { svgOrigin: '0 0' }); gsap.set(spin, { svgOrigin: '0 0' });
  place();

  const hit = at + 1.05, rest = B - 8 * 0.78, drift = ix < 100 ? 6 : -6;
  tl.to(wrap, { opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }, at)
    .call(() => ctx.sfx('kick'), null, at + 0.43)
    .call(() => ctx.sfx('whoosh', { dur: 0.62, from: 300, to: 1800, level: 0.3 }), null, at + 0.45)
    .call(() => { ctx.sfx('net'); ctx.sfx('roar', { dur: opts.big ? 4.4 : 3.4, level: opts.big ? 0.7 : 0.55 }); ctx.sfx('horn', { delay: 0.15 }); if (opts.big) ctx.sfx('horn', { delay: 1.15 }); }, null, hit)
    .call(() => [0.27, 0.55, 0.68, 0.74].forEach((dl, i) => ctx.sfx('bounce', { delay: dl, level: 0.45 / (i + 1) })), null, hit + 0.16)
    .call(() => anime({ targets: frame, strokeDashoffset: [anime.setDashoffset, 0], duration: 550, easing: 'easeInOutCubic' }), null, at)
    .call(() => anime({ targets: sides.concat(rows, cols), opacity: [0, 1], duration: 280, delay: anime.stagger(16), easing: 'linear' }), null, at + 0.12)
    .set(fly, { opacity: 1 }, at + 0.45)
    .to(fl, { p: 1, duration: 0.6, ease: 'power1.in', onUpdate: place }, at + 0.45)
    .to(spin, { rotation: 620, duration: 0.6, ease: 'none' }, at + 0.45)
    // impacto
    .to(mesh, { b: 1, duration: 0.14, ease: 'power2.out', onUpdate: renderMesh }, hit)
    .to(mesh, { b: 0, duration: 1.4, ease: 'elastic.out(1,.28)', onUpdate: renderMesh }, hit + 0.14)
    .to(fly, { scale: 0.78, duration: 0.14, ease: 'power2.out' }, hit)
    .to(fly, { y: rest, duration: 0.75, ease: 'bounce.out' }, hit + 0.16)
    .to(fly, { x: ix + drift, duration: 0.95, ease: 'power2.out' }, hit + 0.16)
    .to(spin, { rotation: '+=220', duration: 0.95, ease: 'power2.out' }, hit + 0.16)
    .set(shadow, { attr: { cx: ix + drift } }, hit)
    .to(shadow, { opacity: 0.45, duration: 0.5 }, hit + 0.3)
    .fromTo(wrap, { x: 0, y: 0 }, { x: 'random(-8,8)', y: 'random(-5,5)', duration: 0.04, repeat: 5, yoyo: true, repeatRefresh: true, ease: 'none' }, hit)
    .to(wrap, { x: 0, y: 0, duration: 0.05 }, hit + 0.25)
    .fromTo($$(node, 'ring'), { scale: 0.02, opacity: 1 }, { scale: 1, opacity: 0, duration: 1.5, stagger: 0.14, ease: 'expo.out', force3D: true }, hit)
    .to($$(node, 'beam'), { opacity: 1, duration: 0.5, ease: 'power2.out' }, hit)
    .fromTo($$(node, 'beam'), { rotate: (i) => (i ? -30 : 30) }, { rotate: (i) => (i ? 12 : -12), duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: 2 }, hit)
    .fromTo($(node, 'post'), { y: 0 }, { y: -1.3, duration: 0.05, repeat: 7, yoyo: true, ease: 'sine.inOut' }, hit)
    .call(() => drawRays(anime, node), null, hit)
    .call(() => ballBurst(anime, $(node, 'burst'), t, opts.balls ?? 14, wrap.getBoundingClientRect().width), null, hit)
    .call(() => confetti(anime, $(node, 'confetti'), [t.accent, t.text, t.yellow], opts.confetti ?? 36, opts.power ?? 1), null, hit + 0.1)
    .to(ch, { yPercent: 0, rotate: 0, opacity: 1, duration: 0.75, stagger: 0.07, ease: 'back.out(2.4)' }, hit + 0.12)
    .to(parts, { opacity: 1, y: 0, duration: 0.55, stagger: 0.09, ease: 'power3.out' }, hit + 0.4)
    .to(ch, { scale: 1.05, duration: 0.45, yoyo: true, repeat: 3, stagger: 0.07, ease: 'sine.inOut' }, hit + 0.95);
  if (nw) {
    tl.call(() => ctx.sfx('tick', { level: 0.35 }), null, hit + 1.15);
    tl.to($(node, 'old'), { yPercent: -105, duration: 0.5, ease: 'power3.inOut' }, hit + 1.15)
      .to(nw, { yPercent: 0, duration: 0.5, ease: 'power3.inOut' }, hit + 1.15);
  }
  return hit + 3.2;
}

function exitStd(node, tl, at) {
  return tl.addLabel('exit', at)
    .to($(node, 'content'), { scale: 0.94, opacity: 0, duration: 0.38, ease: 'power2.in' }, 'exit')
    .to($$(node, 'beam'), { opacity: 0, duration: 0.3, ease: 'power2.in' }, 'exit')
    .to($(node, 'scrim'), { opacity: 0, duration: 0.45, ease: 'power2.inOut' }, 'exit+=.12');
}

function cardHTML(key, bg, z = 1) {
  return `<div data-${key} style="position:absolute;inset:0;border-radius:2.2cqmin;background:${bg};box-shadow:0 3cqmin 8cqmin rgba(0,0,0,.55), inset 0 0 0 .4cqmin rgba(255,255,255,.18);overflow:hidden;z-index:${z};will-change:transform">
    <div data-shine style="position:absolute;top:-30%;bottom:-30%;left:-70%;width:40%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent);rotate:18deg"></div></div>`;
}

function cardStage(inner, ringColor) {
  let sp = '';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    sp += `<g transform="translate(${(Math.cos(a) * 44).toFixed(1)} ${(Math.sin(a) * 44).toFixed(1)})"><path data-spark d="M0 -2.4 L0 2.4 M-2.4 0 L2.4 0" opacity="0" style="transform-box:fill-box;transform-origin:center"/></g>`;
  }
  return `<div data-cardwrap style="position:relative;width:26cqmin;aspect-ratio:3/4">
    <svg data-halo viewBox="-60 -60 120 120" style="position:absolute;left:50%;top:50%;width:64cqmin;height:64cqmin;translate:-50% -50%;overflow:visible;pointer-events:none" fill="none" stroke="${ringColor}" stroke-linecap="round">
      <circle data-arc r="54" stroke-width="1.2" transform="rotate(-90)"/>
      <circle data-dots r="58" stroke-width=".8" stroke-dasharray=".1 4.5" opacity="0"/>
      <g stroke-width="1.1">${sp}</g>
    </svg>${inner}</div>`;
}

function cardText(t, d, label, color) {
  return `<div data-text style="display:flex;flex-direction:column;align-items:center;gap:1.6cqmin;text-align:center;padding:0 6cqmin">
    <div data-eyebrow style="display:flex;align-items:center;gap:1.6cqmin;font:700 max(12px,2.8cqmin)/1 ${t.fontMono};letter-spacing:.16em;text-transform:uppercase;color:${color}">
      <span data-label>${esc(label)}</span><span style="width:4cqmin;height:2px;background:currentColor"></span><span>${esc(d.minute)}</span></div>
    <div style="overflow:hidden;padding:0 1cqmin"><div data-name style="display:flex;align-items:baseline;gap:2cqmin;font:900 9cqmin/1.05 ${t.fontSans};letter-spacing:-.025em;color:${t.text}">
      ${d.number != null ? `<span style="font:700 4cqmin/1 ${t.fontMono};color:${t.textMuted}">#${esc(d.number)}</span>` : ''}${esc(d.player)}</div></div>
    <div data-sub style="font:500 max(13px,3.2cqmin)/1.3 ${t.fontSans};color:${t.textMuted}">${esc([d.team, d.note || d.reason].filter(Boolean).join(' · '))}</div>
  </div>`;
}

function prepCard(gsap, node) {
  gsap.set($(node, 'eyebrow'), { opacity: 0, y: 12 });
  gsap.set($(node, 'name'), { yPercent: 110 });
  gsap.set($(node, 'sub'), { opacity: 0, y: 10 });
  presetDraw([$(node, 'arc')]);
}

function textIn(tl, node, at) {
  tl.to($(node, 'eyebrow'), { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, at)
    .to($(node, 'name'), { yPercent: 0, duration: 0.6, ease: 'expo.out' }, at + 0.08)
    .to($(node, 'sub'), { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, at + 0.22);
}

function impact(ctx, node, tl, at, target) {
  const { anime } = ctx;
  tl.fromTo($(node, 'flash'), { opacity: 0 }, { opacity: 0.55, duration: 0.06, yoyo: true, repeat: 1, ease: 'none' }, at)
    .fromTo(target, { x: 0, y: 0 }, { x: 'random(-14,14)', y: 'random(-10,10)', duration: 0.04, repeat: 7, yoyo: true, repeatRefresh: true, ease: 'none' }, at)
    .to(target, { x: 0, y: 0, duration: 0.06 }, at + 0.33)
    .fromTo($$(node, 'shock'), { scale: 0.12, opacity: 1 }, { scale: 1, opacity: 0, force3D: true, duration: 1, stagger: 0.12, ease: 'expo.out' }, at)
    .call(() => haloIn(anime, node), null, at + 0.1);
}

const redScrim = (t) => `<div data-scrim style="position:absolute;inset:0;background:radial-gradient(80% 65% at 50% 42%, ${rgba(t.live, 0.3)}, transparent 70%), ${rgba(t.bg, 0.86)};opacity:0"></div><div data-flash style="position:absolute;inset:0;background:${t.live};opacity:0"></div>`;

// ---------- escenas ----------
const SCENES = {};

SCENES.goal = {
  build: (t, d) => sceneRoot(`
    <div data-scrim style="position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 50%, ${rgba(t.bg, 0.7)} 0%, ${rgba(t.bg, 0.94)} 70%);opacity:0"></div>
    ${beamsHTML(t.accent)}
    <div data-flash style="position:absolute;inset:0;background:${t.accent};opacity:0"></div>
    <div data-confetti style="position:absolute;inset:0;pointer-events:none"></div>
    ${goalContent(t, d, d.word || 'GOL')}`),
  timeline: (ctx, node) => {
    const tl = ctx.gsap.timeline({ paused: true });
    tl.to($(node, 'scrim'), { opacity: 1, duration: 0.25, ease: 'power2.out' }, 0)
      .fromTo($(node, 'flash'), { opacity: 0 }, { opacity: 0.85, duration: 0.07, yoyo: true, repeat: 1, ease: 'none' }, 0.04);
    return exitStd(node, tl, goalIn(ctx, node, tl, 0.1));
  },
};

SCENES.lastMinuteGoal = {
  build: (t, d) => {
    const plus = (String(d.minute || '').match(/\+\s*(\d+)/) || [])[1];
    const tape = (txt, bg, fg, top, rot, key) => `<div data-${key} style="position:absolute;left:-15%;width:130%;top:${top};rotate:${rot}deg;background:${bg};color:${fg};padding:1.8cqmin 0;overflow:hidden;white-space:nowrap;box-shadow:0 1cqmin 4cqmin rgba(0,0,0,.4)"><div data-track style="display:inline-flex;gap:3cqmin;font:900 5.2cqmin/1 ${t.fontSans};letter-spacing:-.01em;text-transform:uppercase">${repeat(`<span>${esc(txt)}</span><span>·</span>`, 16)}</div></div>`;
    return sceneRoot(`
      <div data-scrim style="position:absolute;inset:0;background:${rgba(t.bg, 0.94)};opacity:0"></div>
      <div data-vignette style="position:absolute;inset:0;box-shadow:inset 0 0 16cqmin 2cqmin ${t.live};opacity:0;pointer-events:none"></div>
      ${ringsSVG(t.text, 2, 0.3, 'ring2')}
      <div data-stage style="position:absolute;inset:0;display:grid;place-items:center">
        ${tape(d.tapeA || 'Último minuto', t.accent, t.accentContrast, '28%', -7, 'tapeA')}
        ${tape(d.tapeB || 'Gol agónico', t.text, t.bg, '64%', 5, 'tapeB')}
        <div data-clock style="position:relative;display:flex;align-items:flex-start;gap:2cqmin">
          <span data-time style="font:700 20cqmin/1 ${t.fontMono};color:${t.text};font-variant-numeric:tabular-nums;letter-spacing:-.04em">89:57</span>
          ${plus ? `<span data-plus style="font:900 8cqmin/1 ${t.fontSans};background:${t.live};color:#fff;padding:1.2cqmin 2cqmin;border-radius:1.6cqmin">+${plus}</span>` : ''}
        </div>
      </div>
      ${beamsHTML(t.accent)}
      <div data-flash style="position:absolute;inset:0;background:#fff;opacity:0"></div>
      <div data-confetti style="position:absolute;inset:0;pointer-events:none"></div>
      ${goalContent(t, d, d.word || 'GOL', true)}`);
  },
  timeline: (ctx, node) => {
    const { gsap, anime, t } = ctx;
    const tl = gsap.timeline({ paused: true });
    const time = $(node, 'time'), plus = $(node, 'plus'), stage = $(node, 'stage'), clockEl = $(node, 'clock');
    const tA = $(node, 'tapeA'), tB = $(node, 'tapeB');
    gsap.set(tA, { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(tB, { scaleX: 0, transformOrigin: '100% 50%' });
    gsap.set(clockEl, { opacity: 0, scale: 0.8 });
    if (plus) gsap.set(plus, { scale: 0, rotate: -12 });
    const clock = { s: 89 * 60 + 57 };
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    tl.to($(node, 'scrim'), { opacity: 1, duration: 0.3 }, 0)
      .to(clockEl, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }, 0.05)
      .to(clock, { s: 90 * 60, duration: 0.9, ease: 'steps(3)', onUpdate: () => { time.textContent = fmt(clock.s); } }, 0.2)
      .to($(node, 'vignette'), { opacity: 1, duration: 0.18, yoyo: true, repeat: 5, ease: 'power1.inOut' }, 0.2);
    [0.2, 0.5, 0.8].forEach((x) => tl.call(() => ctx.sfx('tick'), null, x));
    [0.3, 0.66, 1.02].forEach((x) => tl.call(() => ctx.sfx('heart'), null, x));
    if (plus) tl.to(plus, { scale: 1, rotate: 0, duration: 0.45, ease: 'back.out(3)' }, 1.05).call(() => ctx.sfx('impact', { level: 0.7 }), null, 1.08);
    tl.fromTo(stage, { x: 0, y: 0 }, { x: 'random(-10,10)', y: 'random(-6,6)', duration: 0.045, repeat: 9, yoyo: true, repeatRefresh: true, ease: 'none' }, 1.1)
      .to(stage, { x: 0, y: 0, duration: 0.05 }, 1.56)
      .to(tA, { scaleX: 1, duration: 0.5, ease: 'expo.out' }, 1.2)
      .to(tB, { scaleX: 1, duration: 0.5, ease: 'expo.out' }, 1.3)
      .call(() => {
        ctx.sfx('whoosh', { dur: 0.45, from: 500, to: 2600, level: 0.3 });
        gsap.to($(tA, 'track'), { xPercent: -50, duration: 9, ease: 'none' });
        gsap.fromTo($(tB, 'track'), { xPercent: -50 }, { xPercent: 0, duration: 9, ease: 'none' });
      }, null, 1.2)
      .call(() => ctx.sfx('whoosh', { dur: 0.4, from: 2400, to: 400, level: 0.25 }), null, 2.25)
      .to(clockEl, { scale: 1.6, opacity: 0, duration: 0.35, ease: 'power3.in' }, 2.25)
      .to(tA, { yPercent: -300, opacity: 0, duration: 0.5, ease: 'power3.in' }, 2.3)
      .to(tB, { yPercent: 300, opacity: 0, duration: 0.5, ease: 'power3.in' }, 2.3)
      .fromTo($(node, 'flash'), { opacity: 0 }, { opacity: 0.9, duration: 0.06, yoyo: true, repeat: 1, ease: 'none' }, 3.66)
      .fromTo($$(node, 'ring2'), { scale: 0.02, opacity: 1 }, { scale: 1, opacity: 0, force3D: true, duration: 1.8, stagger: 0.2, ease: 'expo.out' }, 3.67)
      .to($(node, 'vignette'), { opacity: 0.6, duration: 0.2, yoyo: true, repeat: 3 }, 3.67);
    const end = goalIn(ctx, node, tl, 2.62, { confetti: 50, balls: 24, power: 1.25, big: true });
    tl.call(() => ballBurst(anime, $(node, 'burst'), t, 16, $(node, 'netwrap').getBoundingClientRect().width * 1.3), null, end - 2.2);
    exitStd(node, tl, end + 0.4);
    tl.to($(node, 'vignette'), { opacity: 0, duration: 0.3 }, 'exit');
    return tl;
  },
};

SCENES.yellow = {
  build: (t, d) => sceneRoot(`
    <div data-scrim style="position:absolute;inset:0;background:radial-gradient(90% 70% at 50% 45%, ${rgba(t.yellow, 0.12)}, transparent 70%), ${rgba(t.bg, 0.86)};opacity:0"></div>
    <div data-content style="position:relative;display:flex;flex-direction:column;align-items:center;gap:6cqmin">
      ${cardStage(cardHTML('card', cardBg(t.yellow)), t.yellow)}
      ${cardText(t, d, d.label || 'Tarjeta amarilla', t.yellow)}
    </div>`),
  timeline: (ctx, node) => {
    const { gsap, anime } = ctx;
    const tl = gsap.timeline({ paused: true });
    const card = $(node, 'card');
    prepCard(gsap, node);
    gsap.set(card, { rotationY: -110, rotation: -24, yPercent: -60, scale: 0.6, opacity: 0, transformPerspective: 900 });
    tl.to($(node, 'scrim'), { opacity: 1, duration: 0.3 }, 0)
      .to(card, { rotationY: 0, rotation: -8, yPercent: 0, scale: 1, opacity: 1, duration: 0.85, ease: 'back.out(1.5)' }, 0.05)
      .call(() => { ctx.sfx('whistle', { dur: 0.32 }); ctx.sfx('whoosh', { dur: 0.4, from: 700, to: 3000, level: 0.25 }); }, null, 0.05)
      .call(() => ctx.sfx('chime'), null, 0.78)
      .to(card, { rotation: -4, duration: 1.2, ease: 'elastic.out(1,.4)' }, 0.9)
      .call(() => haloIn(anime, node), null, 0.35)
      .to($(card, 'shine'), { left: '140%', duration: 0.8, ease: 'power2.inOut' }, 0.75)
      .to($(node, 'halo'), { rotate: 50, duration: 3, ease: 'power1.out' }, 0.35);
    textIn(tl, node, 0.55);
    return tl.addLabel('exit', 3.1)
      .to(card, { rotationY: 90, scale: 0.85, opacity: 0, duration: 0.4, ease: 'power2.in' }, 'exit')
      .to([$(node, 'text'), $(node, 'halo')], { opacity: 0, y: 10, duration: 0.3, ease: 'power2.in' }, 'exit')
      .to($(node, 'scrim'), { opacity: 0, duration: 0.4 }, 'exit+=.15');
  },
};

SCENES.red = {
  build: (t, d) => sceneRoot(`${redScrim(t)}
    <div data-content style="position:relative;display:flex;flex-direction:column;align-items:center;gap:6cqmin">
      ${cardStage(cracksSVG(t.text) + shockSVG(t.live) + cardHTML('card', cardBg(t.live), 2), t.live)}
      ${cardText(t, d, d.label || 'Tarjeta roja', t.live)}
    </div>`),
  timeline: (ctx, node) => {
    const { gsap, anime } = ctx;
    const tl = gsap.timeline({ paused: true });
    const card = $(node, 'card'), cracks = $$(node, 'crack');
    prepCard(gsap, node); presetDraw(cracks);
    gsap.set(card, { scale: 3.2, rotation: 32, yPercent: -30, opacity: 0, transformPerspective: 900 });
    tl.to($(node, 'scrim'), { opacity: 1, duration: 0.25 }, 0)
      .to(card, { scale: 1, rotation: -6, yPercent: 0, opacity: 1, duration: 0.34, ease: 'power4.in' }, 0.12)
      .call(() => ctx.sfx('whistle', { dur: 0.95, level: 0.5 }), null, 0)
      .call(() => { ctx.sfx('impact'); ctx.sfx('crack'); ctx.sfx('boo', { delay: 0.25 }); }, null, 0.46)
      .call(() => anime({ targets: cracks, strokeDashoffset: [anime.setDashoffset, 0], duration: 380, delay: anime.stagger(18), easing: 'easeOutExpo' }), null, 0.46)
      .to(card, { rotation: -3, duration: 1, ease: 'elastic.out(1,.35)' }, 0.51)
      .to($(card, 'shine'), { left: '140%', duration: 0.7, ease: 'power2.inOut' }, 0.7);
    impact(ctx, node, tl, 0.46, $(node, 'content'));
    textIn(tl, node, 0.7);
    return tl.addLabel('exit', 3.4)
      .to(card, { yPercent: 40, rotation: 14, opacity: 0, duration: 0.4, ease: 'power2.in' }, 'exit')
      .to([$(node, 'text'), $(node, 'halo')].concat(cracks), { opacity: 0, duration: 0.3 }, 'exit')
      .to($(node, 'scrim'), { opacity: 0, duration: 0.4 }, 'exit+=.15');
  },
};

SCENES.secondYellow = {
  build: (t, d) => sceneRoot(`${redScrim(t)}
    <div data-content style="position:relative;display:flex;flex-direction:column;align-items:center;gap:6cqmin">
      ${cardStage(shockSVG(t.live) + cardHTML('red', cardBg(t.live), 1) + cardHTML('card', cardBg(t.yellow), 2), t.live)}
      ${cardText(t, d, d.label || 'Segunda amarilla', t.yellow)}
    </div>`),
  timeline: (ctx, node, d) => {
    const { gsap, t } = ctx;
    const tl = gsap.timeline({ paused: true });
    const yellow = $(node, 'card'), red = $(node, 'red');
    prepCard(gsap, node);
    gsap.set(yellow, { rotationY: -110, rotation: -24, yPercent: -60, scale: 0.6, opacity: 0, transformPerspective: 900 });
    gsap.set(red, { opacity: 0, rotation: -8 });
    tl.to($(node, 'scrim'), { opacity: 1, duration: 0.3 }, 0)
      .to(yellow, { rotationY: 0, rotation: -8, yPercent: 0, scale: 1, opacity: 1, duration: 0.75, ease: 'back.out(1.5)' }, 0.05)
      .call(() => ctx.sfx('whistle', { dur: 0.25 }), null, 0.05)
      .call(() => ctx.sfx('whoosh', { dur: 0.45, from: 600, to: 2800, level: 0.28 }), null, 1.0)
      .call(() => ctx.sfx('whistle', { dur: 0.8, level: 0.5 }), null, 1.3)
      .call(() => { ctx.sfx('impact'); ctx.sfx('boo', { delay: 0.2 }); }, null, 1.85)
      .to($(yellow, 'shine'), { left: '140%', duration: 0.7, ease: 'power2.inOut' }, 0.6)
      .set(red, { opacity: 1 }, 0.95)
      .to(yellow, { xPercent: -38, rotation: -16, duration: 0.45, ease: 'power3.inOut' }, 1.0)
      .to(red, { xPercent: 38, rotation: 10, scale: 1.06, duration: 0.45, ease: 'power3.inOut' }, 1.0)
      .set(red, { zIndex: 3 }, 1.25)
      .to(red, { xPercent: 0, rotation: -5, scale: 1, duration: 0.4, ease: 'power4.in' }, 1.45)
      .to(yellow, { xPercent: -20, rotation: -20, scale: 0.92, duration: 0.4, ease: 'power3.out' }, 1.45)
      .call(() => { $(node, 'label').textContent = d.labelAfter || 'Expulsado'; }, null, 1.85)
      .to($(node, 'eyebrow'), { color: t.live, duration: 0.2 }, 1.85)
      .to($(red, 'shine'), { left: '140%', duration: 0.7, ease: 'power2.inOut' }, 2.0);
    impact(ctx, node, tl, 1.85, $(node, 'content'));
    textIn(tl, node, 0.5);
    return tl.addLabel('exit', 4.1)
      .to([yellow, red], { yPercent: 40, opacity: 0, duration: 0.4, stagger: 0.05, ease: 'power2.in' }, 'exit')
      .to([$(node, 'text'), $(node, 'halo')], { opacity: 0, duration: 0.3 }, 'exit')
      .to($(node, 'scrim'), { opacity: 0, duration: 0.4 }, 'exit+=.15');
  },
};

SCENES.var = {
  build: (t, d) => {
    const ok = d.outcome !== 'overturned', dc = ok ? t.accent : t.live;
    return sceneRoot(`
    <div data-scrim style="position:absolute;inset:0;background:${rgba(t.bg, 0.9)};opacity:0"></div>
    <div data-content style="position:relative;display:flex;flex-direction:column;align-items:center;gap:5cqmin;padding:0 6cqmin">
      <div data-tvwrap style="position:relative;width:min(64cqmin,84cqw);aspect-ratio:16/10">
        <div data-screen style="position:absolute;inset:7% 6%;border-radius:1.2cqmin;overflow:hidden;background:${rgba(t.text, 0.04)};opacity:0">
          <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg, ${rgba(t.text, 0.05)} 0 1px, transparent 1px 4px)"></div>
          <div data-scan style="position:absolute;left:0;right:0;top:0;height:22%;background:linear-gradient(180deg,transparent,${rgba(t.accent, 0.28)},transparent)"></div>
          <div style="position:absolute;top:7%;left:5%;display:flex;align-items:center;gap:1.2cqmin;font:700 max(10px,2.4cqmin)/1 ${t.fontMono};letter-spacing:.14em;color:${t.live}"><span data-rec style="width:1.6cqmin;height:1.6cqmin;border-radius:50%;background:${t.live}"></span>REVISIÓN</div>
          <div data-tc style="position:absolute;bottom:7%;right:5%;font:500 max(10px,2.4cqmin)/1 ${t.fontMono};color:${t.textMuted};font-variant-numeric:tabular-nums">CAM 3 · 00:00.00</div>
          <div style="position:absolute;inset:0;display:grid;place-items:center"><div data-var style="font:900 17cqmin/1 ${t.fontSans};letter-spacing:-.04em;color:${t.text}">VAR</div></div>
          <svg viewBox="0 0 100 100" style="position:absolute;left:50%;top:50%;width:22cqmin;height:22cqmin;translate:-50% -50%;overflow:visible"><path data-mark d="${ok ? 'M22 52 L42 72 L78 30' : 'M28 28 L72 72 M72 28 L28 72'}" fill="none" stroke="${dc}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <svg viewBox="0 0 160 100" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible">
          <path data-tv d="M80 3 H153 Q157 3 157 7 V93 Q157 97 153 97 H7 Q3 97 3 93 V7 Q3 3 7 3 Z" fill="none" stroke="${t.text}" stroke-width="2" stroke-linejoin="round"/>
          <circle data-tip cx="80" cy="3" r="3.2" fill="${t.accent}"/>
        </svg>
      </div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:1.8cqmin;text-align:center">
        <div data-reason style="font:700 max(12px,2.8cqmin)/1 ${t.fontMono};letter-spacing:.16em;text-transform:uppercase;color:${t.textMuted}">Revisando · ${esc(d.reason)}<span data-dots></span></div>
        <div style="overflow:hidden;padding:.5cqmin 1cqmin"><div data-decision style="font:900 8cqmin/1.05 ${t.fontSans};letter-spacing:-.025em;color:${dc}">${esc(d.decision)}</div></div>
      </div>
    </div>`);
  },
  timeline: (ctx, node, d) => {
    const { gsap, anime, t } = ctx;
    const tl = gsap.timeline({ paused: true });
    const ok = d.outcome !== 'overturned', dc = ok ? t.accent : t.live;
    const tv = $(node, 'tv'), tip = $(node, 'tip');
    presetDraw([tv, $(node, 'mark')]);
    const L = tv.getTotalLength();
    gsap.set($(node, 'reason'), { opacity: 0, y: 10 });
    gsap.set($(node, 'decision'), { yPercent: 110 });
    gsap.set(tip, { opacity: 0 });
    tl.to($(node, 'scrim'), { opacity: 1, duration: 0.3 }, 0)
      .set(tip, { opacity: 1 }, 0.15)
      .call(() => { ctx.sfx('beep', { f: 1320 }); ctx.sfx('scribble', { dur: 1.3 }); }, null, 0.15)
      .call(() => anime({
        targets: tv, strokeDashoffset: [anime.setDashoffset, 0], duration: 1300, easing: 'easeInOutQuad',
        update: () => { const off = parseFloat(tv.style.strokeDashoffset) || 0; const p = tv.getPointAtLength(Math.max(0, L - off)); tip.setAttribute('cx', p.x); tip.setAttribute('cy', p.y); },
      }), null, 0.15)
      .to(tip, { opacity: 0, duration: 0.25 }, 1.45)
      .to($(node, 'screen'), { opacity: 1, duration: 0.35 }, 1.2)
      .fromTo($(node, 'var'), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 1.3)
      .to($(node, 'reason'), { opacity: 1, y: 0, duration: 0.4 }, 1.35)
      .call(() => {
        ctx.sfx('hum', { dur: 1.7 }); [0, 0.45, 0.9, 1.35].forEach((dl) => ctx.sfx('beep', { delay: dl, f: 1760, dur: 0.05, level: 0.1 }));
        gsap.fromTo($(node, 'scan'), { yPercent: -100 }, { yPercent: 460, duration: 0.9, ease: 'sine.inOut', repeat: -1 });
        gsap.to($(node, 'rec'), { opacity: 0.2, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' });
        const dots = $(node, 'dots'), tc = $(node, 'tc'), t0 = performance.now();
        const tick = () => {
          const ms = performance.now() - t0, s = ms / 1000;
          if (!node.__decided) dots.textContent = '.'.repeat(1 + (Math.floor(ms / 350) % 3));
          tc.textContent = `CAM 3 · ${String(Math.floor(s / 60)).padStart(2, '0')}:${(s % 60).toFixed(2).padStart(5, '0')}`;
        };
        gsap.ticker.add(tick);
        addCleanup(node, () => gsap.ticker.remove(tick));
      }, null, 1.3)
      .addLabel('decide', 3.0)
      .call(() => { ctx.sfx(ok ? 'confirm' : 'deny'); ctx.sfx(ok ? 'roar' : 'boo', { dur: 2, level: 0.3, delay: 0.15 }); node.__decided = true; $(node, 'reason').firstChild.textContent = (d.reviewed || 'Revisión completada') + ' '; $(node, 'dots').textContent = ''; }, null, 'decide')
      .to(tv, { attr: { stroke: dc }, duration: 0.3 }, 'decide')
      .to($(node, 'var'), { scale: 1.2, opacity: 0, duration: 0.25, ease: 'power2.in' }, 'decide')
      .to($(node, 'screen'), { backgroundColor: rgba(dc, 0.14), duration: 0.3 }, 'decide')
      .call(() => anime({ targets: $(node, 'mark'), strokeDashoffset: [anime.setDashoffset, 0], duration: 500, easing: 'easeOutCubic' }), null, 'decide+=.15')
      .to($(node, 'decision'), { yPercent: 0, duration: 0.6, ease: 'expo.out' }, 'decide+=.1')
      .fromTo($(node, 'tvwrap'), { scale: 1 }, { scale: 1.04, duration: 0.12, yoyo: true, repeat: 1, ease: 'power2.out' }, 'decide+=.1');
    return exitStd(node, tl, 'decide+=2');
  },
};

SCENES.fullTime = {
  build: (t, d) => sceneRoot(`
    <div data-scrim style="position:absolute;inset:0;background:${rgba(t.bg, 0.93)};opacity:0"></div>
    <div data-content style="position:relative;display:flex;flex-direction:column;align-items:center;gap:4.5cqmin;text-align:center;padding:6cqmin">
      <svg data-whistle viewBox="0 0 140 80" style="width:30cqmin;height:auto;overflow:visible" fill="none" stroke="${t.text}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
        <path data-wdraw d="M34 34 H86 a6 6 0 0 1 6 6 v4 a6 6 0 0 1 -6 6 H62"/>
        <circle data-wdraw cx="44" cy="50" r="18"/><circle data-wdraw cx="44" cy="50" r="5"/>
        <path data-wave d="M102 30 q6 10 0 20" opacity="0"/><path data-wave d="M112 22 q10 18 0 36" opacity="0"/><path data-wave d="M122 14 q14 26 0 52" opacity="0"/>
      </svg>
      <div style="display:flex;font:900 22cqmin/.85 ${t.fontSans};letter-spacing:-.05em;color:${t.text}">${chars(d.word || 'FINAL')}</div>
      <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:4cqmin;width:min(88cqw,110cqmin)">
        <div data-hname style="font:800 4.6cqmin/1.1 ${t.fontSans};color:${t.text};text-align:right">${esc(d.home)}</div>
        <div data-score style="display:flex;gap:2cqmin;font:900 12cqmin/1 ${t.fontSans};color:${t.accent};font-variant-numeric:tabular-nums"><span data-sh>0</span><span style="color:${t.textMuted}">–</span><span data-sa>0</span></div>
        <div data-aname style="font:800 4.6cqmin/1.1 ${t.fontSans};color:${t.text};text-align:left">${esc(d.away)}</div>
      </div>
      <svg viewBox="0 0 200 4" preserveAspectRatio="none" style="width:min(70cqw,80cqmin);height:.6cqmin;overflow:visible"><path data-ldraw d="M0 2 H200" stroke="${t.accent}" stroke-width="4"/></svg>
      ${d.note ? `<div data-note style="font:500 max(13px,3.4cqmin)/1.35 ${t.fontSans};color:${t.textMuted};max-width:80cqw;text-wrap:balance">${esc(d.note)}</div>` : ''}
    </div>`),
  timeline: (ctx, node, d) => {
    const { gsap, anime } = ctx;
    const tl = gsap.timeline({ paused: true });
    const ch = $$(node, 'ch'), wh = $(node, 'whistle'), waves = $$(node, 'wave'), note = $(node, 'note');
    const sh = $(node, 'sh'), sa = $(node, 'sa'), score = d.score || [0, 0], cnt = { h: 0, a: 0 };
    presetDraw($$(node, 'wdraw').concat(waves, $$(node, 'ldraw')));
    gsap.set(wh, { transformOrigin: '30% 60%' });
    gsap.set(ch, { yPercent: 110, opacity: 0 });
    gsap.set($(node, 'score'), { opacity: 0, scale: 0.7 });
    gsap.set([$(node, 'hname'), $(node, 'aname')], { opacity: 0, x: (i) => (i ? 24 : -24) });
    if (note) gsap.set(note, { opacity: 0, y: 10 });
    const blow = (hold) => {
      anime.remove(waves);
      anime({ targets: waves, strokeDashoffset: [anime.setDashoffset, 0], opacity: [{ value: 1, duration: 1 }, { value: 0, duration: 260, delay: hold }], duration: 220, delay: anime.stagger(50), easing: 'easeOutQuad' });
    };
    tl.to($(node, 'scrim'), { opacity: 1, duration: 0.3 }, 0)
      .fromTo(wh, { opacity: 0, scale: 0.6, rotate: -20 }, { opacity: 1, scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2)' }, 0.05)
      .call(() => anime({ targets: $$(node, 'wdraw'), strokeDashoffset: [anime.setDashoffset, 0], duration: 650, delay: anime.stagger(90), easing: 'easeInOutSine' }), null, 0.08);
    [[0.75, 80], [1.1, 80], [1.45, 520]].forEach(([at, hold]) => {
      tl.call(() => { blow(hold); ctx.sfx('whistle', { dur: hold > 200 ? 1.0 : 0.2, level: 0.5 }); }, null, at)
        .fromTo(wh, { rotate: 0 }, { rotate: -6, duration: 0.06, yoyo: true, repeat: hold > 200 ? 9 : 3, ease: 'sine.inOut' }, at);
    });
    tl.to(ch, { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'expo.out' }, 1.55)
      .call(() => { ctx.sfx('applause', { dur: 3.2 }); ctx.sfx('roar', { dur: 3, level: 0.28 }); }, null, 2.4)
      .to($(node, 'score'), { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 1.95)
      .to(cnt, { h: score[0], a: score[1], duration: 0.8, ease: 'power2.out', onUpdate: () => { sh.textContent = Math.round(cnt.h); sa.textContent = Math.round(cnt.a); } }, 2.0)
      .to([$(node, 'hname'), $(node, 'aname')], { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }, 2.0)
      .call(() => anime({ targets: $$(node, 'ldraw'), strokeDashoffset: [anime.setDashoffset, 0], duration: 700, easing: 'easeInOutCubic' }), null, 2.25);
    if (note) tl.to(note, { opacity: 1, y: 0, duration: 0.45 }, 2.45);
    return exitStd(node, tl, 5.0);
  },
};

// ---------- banner (variante compacta, no bloquea) ----------
function bannerSpec(t, type, d) {
  const score = d.score ? `${d.home ?? ''} ${d.score[0]}–${d.score[1]} ${d.away ?? ''}`.trim() : '';
  const card = (c, r = -10, x = 0) => `<span style="position:absolute;width:15px;height:21px;border-radius:3px;background:${c};rotate:${r}deg;translate:${x}px 0;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>`;
  const box = (inner) => `<span style="position:relative;display:grid;place-items:center;width:100%;height:100%">${inner}</span>`;
  const txt = (s, size = 12) => `<span style="font:800 ${size}px/1 ${t.fontMono};color:${t.text};letter-spacing:.04em">${s}</span>`;
  switch (type) {
    case 'goal':
    case 'lastMinuteGoal':
      return { color: t.accent, iconBg: t.accent, icon: ballSVG(t.accentContrast, '26px', true), title: `${type === 'goal' ? '¡Gol!' : '¡Gol agónico!'} ${d.team || ''}`, sub: [d.scorer, score].filter(Boolean).join(' · '), min: d.minute };
    case 'yellow':
      return { color: t.yellow, iconBg: rgba(t.yellow, 0.16), icon: box(card(t.yellow)), title: `Amarilla · ${d.player || ''}`, sub: [d.team, d.reason].filter(Boolean).join(' · '), min: d.minute };
    case 'red':
      return { color: t.live, iconBg: rgba(t.live, 0.16), icon: box(card(t.live)), title: `Roja · ${d.player || ''}`, sub: [d.team, d.note || d.reason].filter(Boolean).join(' · '), min: d.minute };
    case 'secondYellow':
      return { color: t.live, iconBg: rgba(t.live, 0.16), icon: box(card(t.yellow, -16, -4) + card(t.live, 6, 4)), title: `Doble amarilla · ${d.player || ''}`, sub: [d.team, d.note || 'Expulsado'].filter(Boolean).join(' · '), min: d.minute };
    case 'var':
      return { color: d.outcome === 'overturned' ? t.live : t.accent, iconBg: rgba(t.text, 0.08), icon: txt('VAR'), title: d.decision || 'Revisión VAR', sub: d.reason || '', min: d.minute };
    case 'fullTime':
      return { color: t.accent, iconBg: rgba(t.text, 0.08), icon: txt('FIN', 13), title: `Final · ${d.home || ''} ${(d.score || [0, 0]).join('–')} ${d.away || ''}`, sub: d.note || '', min: '' };
    default:
      return { color: t.accent, iconBg: rgba(t.text, 0.08), icon: '', title: String(d.title || type), sub: d.sub || '', min: d.minute };
  }
}

SCENES.banner = {
  build: (t, d, type) => {
    const s = bannerSpec(t, type, d);
    return el(`<div data-scene style="position:absolute;left:0;right:0;top:0;display:flex;justify-content:center;padding:max(12px,2.4cqmin) 12px 0;pointer-events:none">
      <div data-banner style="pointer-events:auto;cursor:pointer;position:relative;overflow:hidden;display:flex;align-items:center;gap:12px;width:min(440px,100%);padding:10px 16px 10px 10px;border-radius:20px;background:${rgba(t.surface, 0.96)};box-shadow:0 16px 40px rgba(0,0,0,.45),inset 0 0 0 1px ${rgba(t.text, 0.06)};-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)">
        <div data-icon style="flex:none;width:44px;height:44px;border-radius:13px;display:grid;place-items:center;background:${s.iconBg}">${s.icon}</div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:3px">
          <div data-btitle style="font:800 15px/1.15 ${t.fontSans};color:${t.text};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.title)}</div>
          <div data-bsub style="font:500 13px/1.25 ${t.fontSans};color:${t.textMuted};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(s.sub)}</div>
        </div>
        ${s.min ? `<div data-bmin style="flex:none;font:700 13px/1 ${t.fontMono};color:${s.color}">${esc(s.min)}</div>` : ''}
        <div data-bprog style="position:absolute;left:0;right:0;bottom:0;height:3px;background:${s.color};transform-origin:0 50%"></div>
      </div></div>`);
  },
  timeline: (ctx, node, d, type) => {
    const { gsap, reduced } = ctx;
    const tl = gsap.timeline({ paused: true });
    const b = $(node, 'banner'), icon = $(node, 'icon');
    const texts = [$(node, 'btitle'), $(node, 'bsub'), $(node, 'bmin')].filter(Boolean);
    const hold = type === 'lastMinuteGoal' || type === 'fullTime' ? 4 : 3.2;
    tl.call(() => ctx.sfx('banner', { type }), null, 0.05);
    if (reduced) {
      gsap.set(b, { opacity: 0 });
      tl.to(b, { opacity: 1, duration: 0.3 }, 0).fromTo($(node, 'bprog'), { scaleX: 1 }, { scaleX: 0, duration: hold, ease: 'none' }, 0.3);
      return tl.addLabel('exit', 0.3 + hold).to(b, { opacity: 0, duration: 0.3 }, 'exit');
    }
    gsap.set(b, { yPercent: -160, scale: 0.92, opacity: 0 });
    gsap.set(icon, { scale: 0, rotate: -30 });
    gsap.set(texts, { opacity: 0, x: -8 });
    tl.to(b, { yPercent: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.6)' }, 0)
      .to(icon, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(2.5)' }, 0.15)
      .to(texts, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power3.out' }, 0.2)
      .fromTo($(node, 'bprog'), { scaleX: 1 }, { scaleX: 0, duration: hold, ease: 'none' }, 0.4);
    const ball = $(node, 'ball');
    if (ball) tl.to(ball, { rotate: 360, duration: 1.4, ease: 'power2.out' }, 0.2);
    if (type === 'red' || type === 'secondYellow' || type === 'lastMinuteGoal') {
      tl.fromTo(b, { x: 0 }, { x: 'random(-6,6)', duration: 0.04, repeat: 7, yoyo: true, repeatRefresh: true, ease: 'none' }, 0.45).to(b, { x: 0, duration: 0.04 }, 0.8);
    }
    return tl.addLabel('exit', 0.4 + hold).to(b, { yPercent: -160, opacity: 0, duration: 0.4, ease: 'power3.in' }, 'exit');
  },
};

// ---------- sonido (Web Audio, sintetizado; sin archivos) ----------
function createAudio(opts = {}) {
  const AC = G.AudioContext || G.webkitAudioContext;
  const enabled = opts.sound !== false && !!AC;
  let ac = null, master = null, noise = null, muted = !!opts.muted, volume = opts.volume ?? 0.8;
  const sounds = opts.sounds || {}, buffers = {};

  function unlock() {
    if (!enabled) return null;
    if (!ac) {
      ac = new AC();
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 4;
      master = ac.createGain(); master.gain.value = muted ? 0 : volume;
      master.connect(comp); comp.connect(ac.destination);
      noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume().catch(() => {});
    return ac;
  }
  if (enabled && G.addEventListener) { const u = () => unlock(); G.addEventListener('pointerdown', u, { passive: true }); G.addEventListener('keydown', u); }

  const g0 = (dest, v = 1) => { const g = ac.createGain(); g.gain.value = v; g.connect(dest); return g; };
  const envG = (dest, t0, a, peak, hold, r) => {
    const g = ac.createGain(), p = Math.max(peak, 0.0002);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(p, t0 + a);
    g.gain.setValueAtTime(p, t0 + a + hold); g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + hold + r);
    g.connect(dest); return g;
  };
  const osc = (type, f, t0, dur) => { const o = ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t0); o.start(t0); o.stop(t0 + dur + 0.1); return o; };
  const nz = (t0, dur) => { const s = ac.createBufferSource(); s.buffer = noise; s.loop = true; s.start(t0, Math.random() * 1.5); s.stop(t0 + dur + 0.1); return s; };
  const flt = (type, f, q = 1) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const chain = (...n) => { for (let i = 0; i < n.length - 1; i++) n[i].connect(n[i + 1]); return n[n.length - 1]; };

  const V = {
    whistle(d, t0, o) {
      const dur = o.dur ?? 0.35, lv = o.level ?? 0.45;
      const g = envG(d, t0, 0.012, lv, Math.max(0, dur - 0.06), 0.06);
      const o1 = osc('sine', 2650, t0, dur); o1.frequency.exponentialRampToValueAtTime(2950, t0 + 0.05);
      const o2 = osc('sine', 3600, t0, dur);
      const lfo = osc('square', 26, t0, dur), lg = ac.createGain(); lg.gain.value = 70;
      lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
      o1.connect(g); chain(o2, g0(g, 0.18));
      chain(nz(t0, dur), flt('bandpass', 3000, 5), g0(g, 0.5));
    },
    kick(d, t0, o) {
      const lv = o.level ?? 0.9;
      const s = osc('sine', 170, t0, 0.25); s.frequency.exponentialRampToValueAtTime(45, t0 + 0.15);
      chain(s, envG(d, t0, 0.003, lv, 0, 0.2));
      chain(nz(t0, 0.03), flt('highpass', 2500), envG(d, t0, 0.001, lv * 0.35, 0, 0.03));
    },
    whoosh(d, t0, o) {
      const dur = o.dur ?? 0.5, lv = o.level ?? 0.3, from = o.from ?? 400, to = o.to ?? 2400;
      const bp = flt('bandpass', from, 1.2); bp.frequency.setValueAtTime(from, t0); bp.frequency.exponentialRampToValueAtTime(to, t0 + dur);
      chain(nz(t0, dur), bp, envG(d, t0, dur * 0.65, lv, 0, dur * 0.35));
    },
    net(d, t0, o) {
      const lv = o.level ?? 0.6;
      const bp = flt('bandpass', 2200, 0.8); bp.frequency.setValueAtTime(2200, t0); bp.frequency.exponentialRampToValueAtTime(500, t0 + 0.5);
      chain(nz(t0, 0.6), bp, envG(d, t0, 0.006, lv, 0.05, 0.5));
      const s = osc('sine', 95, t0, 0.3); s.frequency.exponentialRampToValueAtTime(48, t0 + 0.22);
      chain(s, envG(d, t0, 0.004, lv * 0.8, 0, 0.25));
    },
    roar(d, t0, o) {
      const dur = o.dur ?? 3.4, lv = o.level ?? 0.55, a = 0.35, r = Math.min(1.8, dur * 0.5);
      const g = envG(d, t0, a, lv, Math.max(0, dur - a - r), r);
      const trem = osc('sine', 5.5, t0, dur), tg = ac.createGain(); tg.gain.value = lv * 0.25; trem.connect(tg); tg.connect(g.gain);
      [[480, 0.7, 1], [1150, 1.1, 0.6], [2600, 1.4, 0.25]].forEach(([f, q, v]) => {
        const bp = flt('bandpass', f, q); bp.frequency.setValueAtTime(f * 0.85, t0); bp.frequency.linearRampToValueAtTime(f * 1.1, t0 + 0.8);
        chain(nz(t0, dur), bp, g0(g, v));
      });
    },
    horn(d, t0, o) {
      const dur = o.dur ?? 0.9, lv = o.level ?? 0.2;
      const lp = flt('lowpass', 1900, 0.8); lp.connect(envG(d, t0, 0.03, lv, Math.max(0, dur - 0.2), 0.15));
      [233, 235.5, 349].forEach((f) => osc('sawtooth', f, t0, dur).connect(lp));
    },
    bounce(d, t0, o) {
      const s = osc('sine', 130, t0, 0.12); s.frequency.exponentialRampToValueAtTime(70, t0 + 0.08);
      chain(s, envG(d, t0, 0.002, o.level ?? 0.4, 0, 0.09));
    },
    tick(d, t0, o) { chain(osc('square', 1900, t0, 0.03), flt('highpass', 1200), envG(d, t0, 0.001, o.level ?? 0.3, 0, 0.035)); },
    heart(d, t0, o) {
      const lv = o.level ?? 0.8;
      [[0, 1], [0.17, 0.7]].forEach(([dt, k]) => {
        const s = osc('sine', 62, t0 + dt, 0.2); s.frequency.exponentialRampToValueAtTime(38, t0 + dt + 0.15);
        chain(s, envG(d, t0 + dt, 0.006, lv * k, 0, 0.16));
      });
    },
    impact(d, t0, o) {
      const lv = o.level ?? 0.9;
      const s = osc('sine', 95, t0, 0.5); s.frequency.exponentialRampToValueAtTime(32, t0 + 0.4);
      chain(s, envG(d, t0, 0.003, lv, 0.02, 0.4));
      chain(nz(t0, 0.3), flt('lowpass', 1100), envG(d, t0, 0.002, lv * 0.6, 0, 0.25));
    },
    crack(d, t0, o) {
      const lv = o.level ?? 0.35;
      for (let i = 0; i < 7; i++) { const tt = t0 + Math.random() * 0.14; chain(nz(tt, 0.02), flt('highpass', 2800), envG(d, tt, 0.001, lv * (0.5 + Math.random() * 0.5), 0, 0.02 + Math.random() * 0.03)); }
    },
    boo(d, t0, o) {
      const dur = o.dur ?? 1.8, lv = o.level ?? 0.32;
      const g = envG(d, t0, 0.4, lv, Math.max(0, dur - 1.2), 0.8);
      [[280, 2, 1], [560, 3, 0.5]].forEach(([f, q, v]) => {
        const bp = flt('bandpass', f, q); bp.frequency.setValueAtTime(f, t0); bp.frequency.linearRampToValueAtTime(f * 0.78, t0 + dur);
        chain(nz(t0, dur), bp, g0(g, v));
      });
    },
    chime(d, t0, o) { [[1568, 0], [2349, 0.06], [3136, 0.12]].forEach(([f, dt]) => chain(osc('triangle', f, t0 + dt, 0.7), envG(d, t0 + dt, 0.004, o.level ?? 0.18, 0, 0.6))); },
    beep(d, t0, o) { const dur = o.dur ?? 0.09; chain(osc('sine', o.f ?? 880, t0, dur), envG(d, t0, 0.004, o.level ?? 0.22, Math.max(0, dur - 0.02), 0.03)); },
    scribble(d, t0, o) {
      const dur = o.dur ?? 1.2, lv = o.level ?? 0.12;
      const g = envG(d, t0, 0.05, lv, Math.max(0, dur - 0.15), 0.1);
      const lfo = osc('sine', 13, t0, dur), lg = ac.createGain(); lg.gain.value = lv * 0.8; lfo.connect(lg); lg.connect(g.gain);
      chain(nz(t0, dur), flt('bandpass', 1400, 3), g);
    },
    hum(d, t0, o) {
      const dur = o.dur ?? 1.6, lp = flt('lowpass', 520, 2);
      lp.connect(envG(d, t0, 0.15, o.level ?? 0.1, Math.max(0, dur - 0.35), 0.2));
      osc('sawtooth', 110, t0, dur).connect(lp); osc('sawtooth', 110.7, t0, dur).connect(lp);
    },
    confirm(d, t0) {
      V.beep(d, t0, { f: 660, dur: 0.12, level: 0.25 });
      V.beep(d, t0 + 0.13, { f: 990, dur: 0.26, level: 0.25 });
      V.beep(d, t0 + 0.13, { f: 1320, dur: 0.26, level: 0.1 });
    },
    deny(d, t0) { [[392, 0], [294, 0.16]].forEach(([f, dt]) => chain(osc('square', f, t0 + dt, 0.22), flt('lowpass', 1400), envG(d, t0 + dt, 0.005, 0.16, 0.14, 0.06))); },
    applause(d, t0, o) {
      const dur = o.dur ?? 3, bus = envG(d, t0, 0.5, o.level ?? 0.45, Math.max(0, dur - 1.7), 1.2), n = Math.floor(dur * 110);
      for (let i = 0; i < n; i++) { const tt = t0 + Math.random() * dur; chain(nz(tt, 0.03), flt('bandpass', 1200 + Math.random() * 2600, 1.5), envG(bus, tt, 0.001, 0.3 + Math.random() * 0.7, 0, 0.012 + Math.random() * 0.025)); }
    },
    banner(d, t0, o) {
      switch (o.type) {
        case 'goal': case 'lastMinuteGoal': V.net(d, t0, { level: 0.45 }); V.roar(d, t0, { dur: 1.8, level: 0.35 }); break;
        case 'yellow': V.whistle(d, t0, { dur: 0.3 }); break;
        case 'red': V.whistle(d, t0, { dur: 0.9 }); break;
        case 'secondYellow': V.whistle(d, t0, { dur: 0.2 }); V.whistle(d, t0 + 0.32, { dur: 0.7 }); break;
        case 'var': V.beep(d, t0, { f: 1320 }); V.beep(d, t0 + 0.12, { f: 1760 }); break;
        case 'fullTime': V.whistle(d, t0, { dur: 0.18 }); V.whistle(d, t0 + 0.35, { dur: 0.18 }); V.whistle(d, t0 + 0.7, { dur: 0.85 }); break;
        default: V.beep(d, t0, {});
      }
    },
  };

  const load = (src) => {
    if (!buffers[src]) buffers[src] = fetch(src).then((r) => r.arrayBuffer()).then((b) => new Promise((res, rej) => ac.decodeAudioData(b, res, rej))).catch(() => null);
    return buffers[src];
  };

  function bus() {
    if (!enabled || !ac || muted) return { fx() {}, url() {}, release() {} };
    const node = ac.createGain(); node.connect(master);
    return {
      fx(name, o = {}) { const v = V[name]; if (!v) return; try { v(node, ac.currentTime + 0.005 + (o.delay || 0), o); } catch (e) { /* noop */ } },
      url(src) { load(src).then((buf) => { if (!buf) return; const s = ac.createBufferSource(); s.buffer = buf; s.connect(node); s.start(); }); },
      release(fade = 0.6) {
        const t = ac.currentTime; node.gain.cancelScheduledValues(t); node.gain.setValueAtTime(node.gain.value, t); node.gain.linearRampToValueAtTime(0, t + fade);
        setTimeout(() => node.disconnect(), (fade + 0.1) * 1000);
      },
    };
  }

  return {
    unlock, bus,
    suspend(h) { if (!ac) return; (h ? ac.suspend() : ac.resume()).catch(() => {}); },
    custom: (type) => sounds[type],
    setMuted(m) { muted = !!m; if (master) master.gain.setTargetAtTime(muted ? 0 : volume, ac.currentTime, 0.05); },
    setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (master && !muted) master.gain.setTargetAtTime(volume, ac.currentTime, 0.05); },
    get muted() { return muted; },
  };
}

// ---------- motor ----------
/**
 * createMoments({ gsap, anime, root, theme, variant, position, zIndex, haptics, reducedMotion, quality: 'auto'|'high'|'low', onStart, onEnd })
 *  .play(type, data, { variant, priority, interrupt }) -> Promise<boolean>
 *  .skip() .clear() .destroy() .setVariant('full'|'banner') .setTheme({...}) .setMuted(bool) .setVolume(0-1)
 * Sonido: { sound: true, volume: 0.8, muted: false, sounds: { goal: '/sfx/gol.mp3', ... } } (archivos propios opcionales)
 */
function createMoments(options = {}) {
  const gsap = options.gsap || G.gsap, anime = options.anime || G.anime;
  if (!gsap || !anime) throw new Error('[PeliboxMoments] Se requieren gsap y anime.js');
  let theme = { ...DEFAULT_THEME, ...(options.theme || {}) };
  let variant = options.variant || 'full';
  const root = options.root || document.body;
  const position = options.position || (root === document.body ? 'fixed' : 'absolute');
  const reduced = options.reducedMotion ?? !!(G.matchMedia && G.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const layer = document.createElement('div');
  layer.setAttribute('data-pelibox-moments', '');
  layer.style.cssText = `position:${position};inset:0;z-index:${options.zIndex ?? 2147483000};pointer-events:none;overflow:hidden;container-type:size;font-family:${theme.fontSans};-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent;contain:strict`;
  const sr = document.createElement('div');
  sr.setAttribute('role', 'status'); sr.setAttribute('aria-live', 'assertive');
  sr.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap';
  layer.appendChild(sr);
  root.appendChild(layer);
  const tier = detectTier(options.quality);
  const ps = particleLayer(layer, gsap, tier);
  layer.__ps = ps;
  // espera a las fuentes (máx. 600 ms) para que el texto no cambie a mitad de animación
  let fontsReady = G.document && document.fonts && document.fonts.status !== 'loaded'
    ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 600))]) : null;

  const audio = createAudio(options);
  const queue = [];
  let current = null, destroyed = false;

  function next() {
    const item = queue.shift();
    if (!item) { current = null; return; }
    const v = reduced ? 'banner' : (item.opts.variant || variant);
    const scene = v === 'banner' ? SCENES.banner : SCENES[item.type];
    if (!scene) { console.warn('[PeliboxMoments] tipo desconocido:', item.type); item.resolve(false); next(); return; }
    const bus = audio.bus(), custom = audio.custom(item.type);
    const ctx = { gsap, anime, t: theme, reduced, low: tier.low, sfx: custom ? () => {} : (name, o) => bus.fx(name, o) };
    if (custom) bus.url(custom);
    const node = scene.build(theme, item.data, item.type);
    layer.appendChild(node);
    const spec = bannerSpec(theme, item.type, item.data);
    sr.textContent = `${spec.title}. ${spec.sub || ''}`;
    const tl = scene.timeline(ctx, node, item.data, item.type);
    let finished = false;
    const done = () => {
      if (finished) return; finished = true;
      (node.__cleanup || []).forEach((fn) => { try { fn(); } catch (e) { /* noop */ } });
      const all = node.querySelectorAll('*');
      anime.remove(all); gsap.killTweensOf(all); tl.kill(); node.remove(); bus.release();
      current = null;
      if (options.onEnd) options.onEnd(item.type, item.data);
      item.resolve(true);
      if (!destroyed) next();
    };
    tl.eventCallback('onComplete', done);
    node.addEventListener('pointerdown', (e) => { e.stopPropagation(); skip(false); });
    current = { tl, done };
    if (options.haptics !== false && HAPTICS[item.type] && G.navigator && G.navigator.vibrate) { try { G.navigator.vibrate(HAPTICS[item.type]); } catch (e) { /* noop */ } }
    if (options.onStart) options.onStart(item.type, item.data);
    tl.play(0);
  }

  function skip(immediate) {
    if (!current || !current.tl) return;
    const { tl, done } = current, exitAt = tl.labels.exit;
    if (immediate || exitAt == null || tl.time() >= exitAt) { tl.progress(1); done(); }
    else tl.seek(exitAt);
  }

  const flush = () => queue.splice(0).forEach((i) => i.resolve(false));

  function kick() {
    if (current) return;
    if (fontsReady) {
      current = { pending: true };
      fontsReady.then(() => { fontsReady = null; current = null; if (!destroyed) next(); });
      return;
    }
    next();
  }

  // pestaña oculta: pausa animación y audio; al volver continúa donde estaba
  const onVis = () => {
    const h = document.hidden;
    if (current && current.tl) (h ? current.tl.pause() : current.tl.resume());
    audio.suspend(h);
  };
  if (G.document) document.addEventListener('visibilitychange', onVis);

  function play(type, data = {}, opts = {}) {
    return new Promise((resolve) => {
      if (destroyed) return resolve(false);
      audio.unlock();
      const item = { type, data, opts, resolve };
      if (opts.interrupt) { flush(); queue.unshift(item); skip(true); }
      else if (opts.priority) queue.unshift(item);
      else queue.push(item);
      kick();
    });
  }

  return {
    play,
    skip: () => skip(false),
    clear: () => { flush(); skip(true); ps.clear(); },
    destroy: () => { destroyed = true; flush(); skip(true); ps.destroy(); if (G.document) document.removeEventListener('visibilitychange', onVis); layer.remove(); },
    setVariant: (v) => { variant = v; },
    setTheme: (th) => { theme = { ...theme, ...th }; },
    setMuted: (m) => audio.setMuted(m),
    setVolume: (v) => audio.setVolume(v),
    get muted() { return audio.muted; },
    get busy() { return !!current; },
  };
}

export { createMoments, DEFAULT_THEME, MOMENT_TYPES };
