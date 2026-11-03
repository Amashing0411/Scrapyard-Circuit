/* ---- draw.js ---- */
/* ---------- drawing ---------- */
const STEEL = '#7d858d', DARK = '#24282d';
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function shade(h, k) { const [r, g, b] = hexRgb(h); return `rgb(${r * (1 - k) | 0},${g * (1 - k) | 0},${b * (1 - k) | 0})`; }
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
function rgbOf(c) { if (c[0] === '#') return hexRgb(c); const m = c.match(/\d+(\.\d+)?/g); return m ? m.slice(0, 3).map(Number) : [128, 128, 128]; }
function mixc(c, to, k) { const [r, g, b] = rgbOf(c), t = to ? 255 : 0; return `rgb(${r + (t - r) * k | 0},${g + (t - g) * k | 0},${b + (t - b) * k | 0})`; }
let CUR_WEAR = 0, CUR_WSEED = 1;
function seg(ctx, len, th, fill, edge) {
  rr(ctx, -th * .3, -th / 2, len + th * .6, th, th * .45);
  const g = ctx.createLinearGradient(0, -th / 2, 0, th / 2); g.addColorStop(0, mixc(fill, 1, .3)); g.addColorStop(.42, fill); g.addColorStop(1, mixc(fill, 0, .42));
  ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = edge; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(th * .1, -th / 2 + 2.5); ctx.lineTo(len - th * .1, -th / 2 + 2.5); ctx.stroke();
  if (CUR_WEAR > 0) { const r = mulberry32((CUR_WSEED + len * 131 + th * 7) | 0); ctx.lineWidth = 1.2; for (let i = 0; i < CUR_WEAR * 2; i++) { const x = r() * len, y = (r() - .5) * th * .7; ctx.strokeStyle = 'rgba(15,15,15,.55)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 3 + r() * 7, y + (r() - .5) * 4); ctx.stroke(); } if (CUR_WEAR >= 2) { ctx.fillStyle = 'rgba(200,205,210,.35)'; for (let i = 0; i < CUR_WEAR; i++) { ctx.beginPath(); ctx.ellipse(r() * len, (r() - .5) * th * .6, 2 + r() * 2.5, 1.2 + r() * 1.5, r() * 3, 0, 7); ctx.fill(); } } if (CUR_WEAR >= 3) { ctx.fillStyle = 'rgba(130,60,25,.42)'; ctx.beginPath(); ctx.ellipse(len * (.3 + r() * .4), (r() - .5) * th * .4, 4 + r() * 6, th * .25, 0, 0, 7); ctx.fill(); } }
}
function drawWear(ctx, wear, w, h, seed, kind) {
  if (!wear) return;
  const r = mulberry32(seed | 0), safe = y => w * (.32 - Math.max(0, (y / h) - .7) * .5);
  ctx.save();
  if (kind === 'torso') { const g = ctx.createLinearGradient(0, -h * .4, 0, 0); g.addColorStop(0, 'rgba(30,24,18,0)'); g.addColorStop(1, `rgba(30,24,18,${.12 * wear})`); ctx.fillStyle = g; ctx.fillRect(-w * .3, -h * .4, w * .6, h * .38); }
  for (let i = 0; i < wear * 4; i++) { const yy = h * (.12 + r() * .72), x = (r() - .5) * 2 * safe(yy); ctx.fillStyle = 'rgba(205,210,214,.45)'; ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.283, rad = 1.5 + r() * 2.6; ctx.lineTo(x + Math.cos(a) * rad, -yy + Math.sin(a) * rad * .8); } ctx.closePath(); ctx.fill(); }
  if (wear >= 2) { for (let i = 0; i < wear; i++) { const yy = h * (.25 + r() * .4), x = (r() - .5) * 1.6 * safe(yy), len = h * (.12 + r() * .2); const g = ctx.createLinearGradient(0, -yy, 0, -yy + len); g.addColorStop(0, 'rgba(140,62,22,.55)'); g.addColorStop(1, 'rgba(140,62,22,0)'); ctx.fillStyle = g; ctx.fillRect(x - 1.5, -yy, 3, len); }
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.5; for (let i = 0; i < wear - 1; i++) { const yy = h * (.3 + r() * .4), x = (r() - .5) * 1.4 * safe(yy); ctx.beginPath(); ctx.arc(x, -yy, 4 + r() * 4, Math.PI * (.1 + r() * .3), Math.PI * (.7 + r() * .3)); ctx.stroke(); } }
  if (wear >= 2 && kind === 'torso') { const yy = h * (.18 + r() * .2), x = (r() - .5) * .6 * safe(yy), pw = w * .22, ph = h * .14; ctx.fillStyle = 'rgba(108,114,120,.9)'; ctx.strokeStyle = 'rgba(20,20,20,.7)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.rect(x - pw / 2, -yy - ph / 2, pw, ph); ctx.fill(); ctx.stroke(); for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bolt(ctx, x + dx * (pw / 2 - 3), -yy + dy * (ph / 2 - 3), 1.3); ctx.strokeStyle = 'rgba(255,200,120,.35)'; ctx.beginPath(); ctx.moveTo(x - pw / 2 - 1, -yy - ph / 2 - 1); ctx.lineTo(x + pw / 2 + 1, -yy - ph / 2 - 1); ctx.stroke(); }
  if (wear >= 3) { for (let i = 0; i < 3; i++) { const yy = h * (.2 + r() * .6), x = (r() - .5) * 1.6 * safe(yy); ctx.fillStyle = `rgba(${120 + r() * 30 | 0},${52 + r() * 15 | 0},20,.5)`; ctx.beginPath(); ctx.ellipse(x, -yy, 4 + r() * w * .08, 3 + r() * h * .05, r() * 3, 0, 7); ctx.fill(); }
    if (kind === 'torso') { const yy = h * .55, x = -w * .18; ctx.fillStyle = '#121315'; ctx.beginPath(); ctx.moveTo(x - 6, -yy - 5); ctx.lineTo(x + 7, -yy - 7); ctx.lineTo(x + 9, -yy + 6); ctx.lineTo(x - 5, -yy + 7); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#e2483d'; ctx.fillRect(x - 2, -yy - 2, 1.5, 7); ctx.fillStyle = '#f0b20a'; ctx.fillRect(x + 1, -yy - 3, 1.5, 8); } }
  ctx.restore();
}
function piston(ctx, len, th, back) {
  const y = -th / 2 - 2;
  ctx.fillStyle = back ? '#25292e' : '#3a3f45'; rr(ctx, len * .08, y - 3.5, len * .44, 7, 2); ctx.fill(); ctx.strokeStyle = back ? '#121417' : DARK; ctx.lineWidth = 1.5; ctx.stroke();
  const g = ctx.createLinearGradient(0, y - 1.5, 0, y + 1.5); g.addColorStop(0, back ? '#7d858d' : '#f2f4f5'); g.addColorStop(1, back ? '#3a3f45' : '#8a9198');
  ctx.fillStyle = g; ctx.fillRect(len * .5, y - 1.5, len * .4, 3);
  ctx.fillStyle = back ? '#2a2e33' : '#5b626a'; ctx.beginPath(); ctx.arc(len * .9, y, 2.5, 0, 7); ctx.fill();
}
const FACES = {
  neutral: ['........', '.##..##.', '.##..##.', '........', '..####..', '........'],
  angry:   ['#......#', '.##..##.', '.##..##.', '........', '.######.', '.#....#.'],
  hurt:    ['........', '.#....#.', '##....##', '........', '..####..', '.#....#.'],
  ko:      ['#.#..#.#', '.#....#.', '#.#..#.#', '........', '..####..', '........'],
  happy:   ['........', '.##..##.', '........', '.#....#.', '..####..', '........'],
};
function crtFace(ctx, x, y, w, h, R) {
  const rows = FACES[R.mood] || FACES.neutral, noisy = R.dmg.glitch || (R.dmg.head < .25 && Math.random() < .3), cw = w / 8, ch = h / 6;
  ctx.save(); ctx.shadowColor = '#5cff9a'; ctx.shadowBlur = 8; ctx.fillStyle = '#5cff9a';
  for (let j = 0; j < 6; j++) for (let i = 0; i < 8; i++) if (noisy ? Math.random() < .4 : rows[j][i] === '#') ctx.fillRect(x + i * cw + 1, y + j * ch + 1, cw - 2, ch - 2);
  ctx.restore();
  ctx.fillStyle = 'rgba(0,0,0,.28)'; for (let j = 0; j < h; j += 3) ctx.fillRect(x, y + j, w, 1);
}
function moodOf(st, dm) {
  if (st === 'down' || st === 'wreck' || st === 'out' || st === 'dazed') return 'ko';
  if (st === 'victory') return 'happy';
  if (st === 'windup' || st === 'strike' || st === 'fwindup' || st === 'fstrike') return 'angry';
  if (st === 'stagger' || st === 'stall' || st === 'slump' || (dm && dm.hpF < .35)) return 'hurt';
  return 'neutral';
}
function drawWheel(ctx, D, hipY, P, paint, fr, t) {
  const L = D.L, r = L.r, cy = -r, rot = (P.walk || 0) / r;
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = DARK; ctx.lineWidth = L.w + 4; ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(0, cy); ctx.stroke();
  const g = ctx.createLinearGradient(-L.w / 2, 0, L.w / 2, 0); g.addColorStop(0, mixc(paint, 1, .25)); g.addColorStop(1, mixc(paint, 0, .4));
  ctx.strokeStyle = g; ctx.lineWidth = L.w; ctx.beginPath(); ctx.moveTo(0, hipY); ctx.lineTo(0, cy); ctx.stroke(); ctx.lineCap = 'butt';
  piston(ctx, 0, 0, false);
  ctx.fillStyle = '#121417'; ctx.beginPath(); ctx.arc(0, cy, r, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 3; for (let i = 0; i < 12; i++) { const a = rot + i * .5236; ctx.beginPath(); ctx.arc(0, cy, r - 2, a, a + .22); ctx.stroke(); }
  const hg = ctx.createRadialGradient(-4, cy - 4, 2, 0, cy, r * .62); hg.addColorStop(0, '#9aa1a8'); hg.addColorStop(1, '#3a3f45');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, cy, r * .62, 0, 7); ctx.fill();
  ctx.strokeStyle = '#2a2e33'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = rot + i * 1.2566; ctx.moveTo(0, cy); ctx.lineTo(Math.cos(a) * r * .58, cy + Math.sin(a) * r * .58); } ctx.stroke();
  ctx.fillStyle = '#e05aa0'; ctx.beginPath(); ctx.arc(0, cy, 4.5, 0, 7); ctx.fill();
  if (fr < .4) wires(ctx, 5, (hipY + cy) / 2, 10, t);
  ctx.restore();
}
function drawBack(ctx, type, D, paint, t, heat) {
  const { w, h } = D.T, bx = -w * .5;
  ctx.lineWidth = 2; ctx.strokeStyle = DARK;
  if (type === 'stacks') { for (let i = 0; i < 2; i++) { const x = bx + 2 + i * 13, y0 = -h * .7, top = -h - 26 - i * 12; ctx.fillStyle = '#2b2f34'; rr(ctx, x - 5, top, 10, y0 - top, 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#16181b'; ctx.fillRect(x - 6.5, top - 3, 13, 5); if (heat > 35) glow(ctx, '#ff7a2a', 12, () => { ctx.fillStyle = `rgba(255,122,42,${Math.min(1, (heat - 35) / 60)})`; ctx.fillRect(x - 4, top - 4, 8, 3); }); } }
  else if (type === 'gyro') { const cx = bx - 4, cy = -h * .62; ctx.fillStyle = '#2b2f34'; ctx.beginPath(); ctx.arc(cx, cy, 17, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = '#c9cdd1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, 13, Math.max(1, 13 * Math.abs(Math.cos(t * 6))), 0, 0, 7); ctx.stroke(); ctx.fillStyle = '#f0b20a'; ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 7); ctx.fill(); }
  else if (type === 'cells') { for (let i = 0; i < 3; i++) { const y = -h * .92 + i * 21; ctx.fillStyle = '#2b2f34'; rr(ctx, bx - 14, y, 18, 18, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = (Math.floor(t * 2) + i) % 3 ? '#6cc28a' : '#3a6a4a'; ctx.fillRect(bx - 11, y + 5, 12, 4); } }
  else if (type === 'toolbox') { ctx.strokeStyle = '#9aa1a8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 8, -h * .78); ctx.lineTo(bx - 14, -h - 14); ctx.lineTo(bx + 2, -h - 22); ctx.stroke(); ctx.fillStyle = '#f0b20a'; ctx.beginPath(); ctx.arc(bx + 2, -h - 22, 3, 0, 7); ctx.fill(); ctx.fillStyle = '#c7362f'; rr(ctx, bx - 20, -h * .78, 24, 32, 3); ctx.fill(); ctx.strokeStyle = DARK; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#16181b'; ctx.fillRect(bx - 20, -h * .66, 24, 3); }
  else if (type === 'coil') { ctx.fillStyle = '#2b2f34'; rr(ctx, bx - 8, -h * .96, 11, h * .82, 4); ctx.fill(); ctx.stroke(); for (let i = 0; i < 6; i++) { const y = -h * .9 + i * h * .13, on = (Math.floor(t * 8) + i) % 6 === 0; glow(ctx, '#8fd8ff', on ? 14 : 0, () => { ctx.fillStyle = on ? '#dff6ff' : '#3a7a9a'; rr(ctx, bx - 13, y, 21, 5, 2); ctx.fill(); }); } }
  else if (type === 'flywheel') { const cx = bx - 10, cy = -h * .6, R0 = h * .3; ctx.fillStyle = '#2b2f34'; ctx.beginPath(); ctx.arc(cx, cy, R0, 0, 7); ctx.fill(); ctx.stroke(); ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 7); ctx.strokeStyle = '#f0b20a'; ctx.lineWidth = 4; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, R0 - 5, i * 1.57, i * 1.57 + .7); ctx.stroke(); } ctx.fillStyle = '#9aa1a8'; for (let i = 0; i < 3; i++) { ctx.rotate(2.094); ctx.fillRect(0, -2, R0 - 8, 4); } ctx.restore(); ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 7); ctx.fill(); }
  else if (type === 'batrack') { const cols = ['#e05aa0', '#6cc28a', '#f0b20a']; for (let i = 0; i < 2; i++) { const y = -h * .9 + i * 30; ctx.fillStyle = '#2b2f34'; rr(ctx, bx - 22, y, 26, 26, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#c7362f'; ctx.fillRect(bx - 18, y - 3, 5, 3); ctx.fillStyle = '#16181b'; ctx.fillRect(bx - 6, y - 3, 5, 3); } ctx.lineWidth = 3; cols.forEach((c, i) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(bx - 24, -h * .86 + i * 22); ctx.lineTo(bx + 6, -h * .8 + i * 22); ctx.stroke(); }); ctx.lineWidth = 2; ctx.strokeStyle = DARK; }
  else if (type === 'whistle') { ctx.fillStyle = '#7d858d'; rr(ctx, bx - 20, -h * .86, 22, h * .62, 10); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#c9a24a'; ctx.fillRect(bx - 12, -h * .86 - 16, 6, 16); ctx.beginPath(); ctx.arc(bx - 9, -h * .86 - 18, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#ebe7de'; ctx.beginPath(); ctx.arc(bx - 14, -h * .6, 6, 0, 7); ctx.fill(); ctx.strokeStyle = '#d94a5a'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(bx - 14, -h * .6); ctx.lineTo(bx - 14 + Math.cos(t + heat / 30) * 5, -h * .6 + Math.sin(t + heat / 30) * 5); ctx.stroke(); if (heat > 40) { ctx.fillStyle = `rgba(230,230,235,${Math.min(.5, (heat - 40) / 80)})`; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(bx - 9 + Math.sin(t * 3 + i) * 4, -h * .86 - 28 - i * 9 - (t * 20 % 9), 4 + i * 2, 0, 7); ctx.fill(); } } ctx.strokeStyle = DARK; ctx.lineWidth = 2; }
  else if (type === 'jets') { for (let i = 0; i < 2; i++) { const x = bx - 6 - i * 12, y = -h * .7 + i * 6; ctx.fillStyle = '#3a3f45'; rr(ctx, x - 6, y, 12, h * .36, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#16181b'; ctx.fillRect(x - 7, y + h * .34, 14, 6); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, y + h * .4, 0, y + h * .4 + 22); g.addColorStop(0, `rgba(110,180,255,${.6 + Math.sin(t * 40 + i) * .2})`); g.addColorStop(1, 'rgba(110,180,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 5, y + h * .4); ctx.lineTo(x + 5, y + h * .4); ctx.lineTo(x, y + h * .4 + 22); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; } }
  else if (type === 'tesla') { for (let i = 0; i < 2; i++) { const x = bx - 6 - i * 13, top = -h - 10 - i * 8; ctx.fillStyle = '#2b2f34'; ctx.fillRect(x - 3, top, 6, h * .9 + 10 + i * 8 - h * .2); ctx.strokeStyle = '#b8733a'; ctx.lineWidth = 3; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.moveTo(x - 6, top + 10 + k * 7); ctx.lineTo(x + 6, top + 12 + k * 7); ctx.stroke(); } ctx.fillStyle = '#9aa1a8'; ctx.beginPath(); ctx.arc(x, top, 5, 0, 7); ctx.fill(); } if (Math.random() < .6) { ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(190,150,255,.85)'; ctx.lineWidth = 1.5; ctx.beginPath(); let x = bx - 6, y = -h - 10; ctx.moveTo(x, y); for (let k = 0; k < 4; k++) { x -= 3.2; y += (Math.random() - .3) * 5; ctx.lineTo(x, y); } ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; } ctx.strokeStyle = DARK; ctx.lineWidth = 2; }
  else if (type === 'fins') { ctx.fillStyle = mixc(paint, 0, .35); for (let i = 0; i < 4; i++) { const y = -h * .9 + i * h * .17; ctx.beginPath(); ctx.moveTo(bx + 4, y); ctx.lineTo(bx - 24 + i * 2, y - 9); ctx.lineTo(bx - 21 + i * 2, y + 6); ctx.lineTo(bx + 4, y + 12); ctx.closePath(); ctx.fill(); ctx.stroke(); } }
}
function joint(ctx, r, c) { ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = c; ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, r * .4, 0, 7); ctx.fillStyle = '#5b626a'; ctx.fill(); }
function bolt(ctx, x, y, r = 2) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill(); ctx.beginPath(); ctx.arc(x - .5, y - .5, r * .55, 0, 7); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill(); }
function glow(ctx, col, blur, fn) { ctx.shadowColor = col; ctx.shadowBlur = blur; fn(); ctx.shadowBlur = 0; }
function wires(ctx, x, y, len, t) { const cols = ['#e2483d', '#f0b20a', '#4fa3d9']; ctx.lineWidth = 2; cols.forEach((c, i) => { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(x + i * 3 - 3, y); ctx.quadraticCurveTo(x + i * 4 - 4 + Math.sin(t * 3 + i) * 3, y + len * .6, x + i * 5 - 5, y + len); ctx.stroke(); }); }

function fabSize(id) { const q = part('head', id); return q && q.design ? (FAB_SHELL[q.design.shell] || FAB_SHELL.box).s : 40; }
function fabDims(id) { const q = part('torso', id); return q && q.dims ? { ...q.dims } : { w: 70, h: 90 }; }
function matFinish(ctx, mat, x, y, w, h, key) {
  const r = mulberry32(hashStr(key));
  if (mat === 'tin') { for (let i = 0; i < 4; i++) { ctx.fillStyle = `rgba(${120 + r() * 40 | 0},${55 + r() * 20 | 0},25,${.35 + r() * .25})`; ctx.beginPath(); ctx.ellipse(x + r() * w, y + r() * h, 3 + r() * w * .14, 2 + r() * h * .1, r() * 3, 0, 7); ctx.fill(); } ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; for (let i = 0; i < 4; i++) { const a = x + r() * w, b2 = y + r() * h; ctx.beginPath(); ctx.moveTo(a, b2); ctx.lineTo(a + 4 + r() * 8, b2 + r() * 4 - 2); ctx.stroke(); } for (let i = 0; i < 5; i++) bolt(ctx, x + r() * w, y + r() * h, 1.4); }
  else if (mat === 'ti') { ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = 1; for (let i = -h; i < w; i += 4) { ctx.beginPath(); ctx.moveTo(x + i, y + h); ctx.lineTo(x + i + h, y); ctx.stroke(); } ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fillRect(x + w * .15, y + 3, w * .45, 2); }
  else { ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(x, y + h * .55, w, 2); }
}
function shellPath(ctx, sh, s) {
  ctx.beginPath();
  const R = (x, y, w, h, r) => { if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
  switch (sh) {
    case 'dome': ctx.moveTo(-s * .5, -4); ctx.lineTo(-s * .5, -s * .5); ctx.quadraticCurveTo(-s * .48, -s * 1.02, s * .02, -s * 1.02); ctx.quadraticCurveTo(s * .56, -s, s * .56, -s * .5); ctx.lineTo(s * .56, -4); ctx.closePath(); break;
    case 'bullet': R(-s * .36, -s * 1.06, s * .74, s * 1.02, [s * .37, s * .37, 4, 4]); break;
    case 'wedge': ctx.moveTo(-s * .5, -4); ctx.lineTo(-s * .42, -s * .9); ctx.lineTo(s * .18, -s * .96); ctx.lineTo(s * .64, -s * .42); ctx.lineTo(s * .46, -4); ctx.closePath(); break;
    case 'can': R(-s * .44, -s * .96, s * .9, s * .92, 5); break;
    case 'skull': ctx.moveTo(-s * .44, -4); ctx.lineTo(-s * .5, -s * .55); ctx.quadraticCurveTo(-s * .46, -s * 1.04, s * .08, -s * 1.02); ctx.quadraticCurveTo(s * .62, -s * .98, s * .6, -s * .46); ctx.lineTo(s * .52, -s * .26); ctx.lineTo(s * .38, -s * .24); ctx.lineTo(s * .36, -4); ctx.closePath(); break;
    case 'slab': R(-s * .62, -s * .7, s * 1.26, s * .66, s * .1); break;
    case 'hex': for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; ctx.lineTo(s * .03 + Math.cos(a) * s * .54, -s * .52 + Math.sin(a) * s * .5); } ctx.closePath(); break;
    default: R(-s * .48, -s * .94, s * .98, s * .9, s * .12);
  }
}
function topOf(sh, s) { return { dome: -s * 1.02, bullet: -s * 1.06, wedge: -s * .93, can: -s * .96, skull: -s * 1.02, slab: -s * .7, hex: -s * 1.02 }[sh] || -s * .94; }
function drawFabHead(ctx, s, d, paint, PG, R, t, eye) {
  const sh = d.shell || 'box', fy = (FAB_SHELL[sh] || FAB_SHELL.box).fy, gc = FAB_GLOW[d.glow] || FAB_GLOW.amber, top = topOf(sh, s);
  if (d.crest === 'pipes') { ctx.fillStyle = '#2b2f34'; for (let i = 0; i < 2; i++) { rr(ctx, -s * .44 + i * s * .15, top - s * .3 - i * 5, s * .1, s * .5, 2); ctx.fill(); } ctx.fillStyle = '#16181b'; ctx.fillRect(-s * .46, top - s * .33, s * .3, 3); }
  if (d.crest === 'fin') { ctx.fillStyle = mixc(paint, 0, .3); ctx.strokeStyle = DARK; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-s * .42, top + 5); ctx.lineTo(-s * .22, top - s * .34); ctx.lineTo(s * .3, top + 3); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = PG; ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; shellPath(ctx, sh, s); ctx.fill();
  ctx.save(); shellPath(ctx, sh, s); ctx.clip(); matFinish(ctx, d.mat, -s * .65, top, s * 1.3, -top, sh + (d.eyes || '') + (d.mat || '') + (d.mouth || ''));
  if (sh === 'can') { ctx.fillStyle = 'rgba(0,0,0,.25)'; for (const k of [.3, .68]) ctx.fillRect(-s * .5, -s * k - 2, s, 3); }
  ctx.restore(); ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; shellPath(ctx, sh, s); ctx.stroke();
  const ex = s * .2, ey = -s * fy;
  switch (d.eyes) {
    case 'visor': ctx.fillStyle = '#121417'; rr(ctx, ex - s * .3, ey - s * .1, s * .6, s * .2, s * .05); ctx.fill(); eye(gc, () => { rr(ctx, ex - s * .24, ey - s * .035, s * .48, s * .07, 2); ctx.fill(); }); break;
    case 'mono': ctx.fillStyle = '#121417'; ctx.beginPath(); ctx.arc(ex, ey, s * .18, 0, 7); ctx.fill(); ctx.strokeStyle = '#7d858d'; ctx.lineWidth = 2; ctx.stroke(); eye(gc, () => { ctx.beginPath(); ctx.arc(ex + s * .03, ey, s * .08, 0, 7); ctx.fill(); }); break;
    case 'slits': ctx.fillStyle = '#121417'; rr(ctx, ex - s * .3, ey - s * .12, s * .6, s * .22, 3); ctx.fill(); eye(gc, () => { ctx.beginPath(); ctx.moveTo(ex - s * .25, ey - s * .07); ctx.lineTo(ex - s * .04, ey); ctx.lineTo(ex - s * .25, ey + s * .03); ctx.closePath(); ctx.moveTo(ex + s * .25, ey - s * .07); ctx.lineTo(ex + s * .04, ey); ctx.lineTo(ex + s * .25, ey + s * .03); ctx.closePath(); ctx.fill(); }); break;
    case 'cross': ctx.fillStyle = '#121417'; ctx.beginPath(); ctx.arc(ex, ey, s * .16, 0, 7); ctx.fill(); eye(gc, () => { ctx.fillRect(ex - s * .12, ey - s * .025, s * .24, s * .05); ctx.fillRect(ex - s * .025, ey - s * .12, s * .05, s * .24); }); break;
    case 'grid': ctx.fillStyle = '#121417'; rr(ctx, ex - s * .26, ey - s * .12, s * .52, s * .24, 3); ctx.fill(); eye(gc, () => { for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) if ((i + j + Math.floor(t * 3)) % 5) ctx.fillRect(ex - s * .21 + i * s * .115, ey - s * .08 + j * s * .09, s * .07, s * .06); }); break;
    case 'goggles': ctx.fillStyle = '#16181b'; ctx.fillRect(-s * .5, ey - 2, s * .3, 4); for (const dx of [-s * .14, s * .17]) { ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(ex + dx, ey, s * .14, 0, 7); ctx.fill(); ctx.fillStyle = '#0f1a24'; ctx.beginPath(); ctx.arc(ex + dx, ey, s * .1, 0, 7); ctx.fill(); } eye(gc, () => { for (const dx of [-s * .14, s * .17]) { ctx.beginPath(); ctx.arc(ex + dx + 1, ey, s * .045, 0, 7); ctx.fill(); } }); break;
    case 'scanner': ctx.fillStyle = '#121417'; rr(ctx, ex - s * .32, ey - s * .07, s * .64, s * .14, s * .07); ctx.fill(); eye(gc, () => { ctx.beginPath(); ctx.ellipse(ex + Math.sin(t * 3) * s * .24, ey, s * .07, s * .04, 0, 0, 7); ctx.fill(); }); break;
    default: for (const dx of [-s * .12, s * .14]) { ctx.fillStyle = '#121417'; ctx.beginPath(); ctx.arc(ex + dx, ey, s * .085, 0, 7); ctx.fill(); } eye(gc, () => { for (const dx of [-s * .12, s * .14]) { ctx.beginPath(); ctx.arc(ex + dx, ey, s * .05, 0, 7); ctx.fill(); } });
  }
  const my = Math.min(-s * .14, ey + s * .27);
  switch (d.mouth) {
    case 'grille': ctx.fillStyle = '#16181b'; rr(ctx, ex - s * .18, my - s * .08, s * .36, s * .16, 2); ctx.fill(); ctx.strokeStyle = '#5b626a'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 1; i < 6; i++) { ctx.moveTo(ex - s * .18 + i * s * .06, my - s * .08); ctx.lineTo(ex - s * .18 + i * s * .06, my + s * .08); } ctx.stroke(); break;
    case 'teeth': ctx.fillStyle = '#16181b'; rr(ctx, ex - s * .22, my - s * .07, s * .44, s * .14, 2); ctx.fill(); ctx.fillStyle = '#d8dde1'; ctx.beginPath(); for (let i = 0; i < 6; i++) { const x = ex - s * .2 + i * s * .068; ctx.moveTo(x, my - s * .065); ctx.lineTo(x + s * .034, my + s * .005); ctx.lineTo(x + s * .068, my - s * .065); } ctx.fill(); ctx.beginPath(); for (let i = 0; i < 6; i++) { const x = ex - s * .2 + i * s * .068; ctx.moveTo(x, my + s * .065); ctx.lineTo(x + s * .034, my - s * .005); ctx.lineTo(x + s * .068, my + s * .065); } ctx.fill(); break;
    case 'vent': ctx.fillStyle = 'rgba(0,0,0,.6)'; for (let i = 0; i < 3; i++) { rr(ctx, ex - s * .2, my - s * .08 + i * s * .06, s * .4, s * .032, 1); ctx.fill(); } break;
    case 'speaker': ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(ex, my, s * .1, 0, 7); ctx.fill(); ctx.fillStyle = '#5b626a'; for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; ctx.beginPath(); ctx.arc(ex + Math.cos(a) * s * .055, my + Math.sin(a) * s * .055, 1.3, 0, 7); ctx.fill(); } break;
    case 'jaw': ctx.fillStyle = mixc(paint, 0, .35); ctx.strokeStyle = DARK; ctx.lineWidth = 2; rr(ctx, ex - s * .32, my - s * .06, s * .62, s * .15, 3); ctx.fill(); ctx.stroke(); bolt(ctx, ex - s * .27, my + s * .01, 2); ctx.fillStyle = '#16181b'; ctx.fillRect(ex - s * .2, my - s * .065, s * .44, 2); break;
  }
  switch (d.crest) {
    case 'antenna': ctx.strokeStyle = '#9aa1a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-s * .1, top); ctx.lineTo(-s * .2, top - s * .38); ctx.stroke(); ctx.fillStyle = gc; ctx.beginPath(); ctx.arc(-s * .2, top - s * .4, 3, 0, 7); ctx.fill(); break;
    case 'horns': ctx.fillStyle = '#d8d2c2'; ctx.strokeStyle = DARK; ctx.lineWidth = 2; for (const hx of [-s * .32, s * .22]) { ctx.beginPath(); ctx.moveTo(hx - s * .07, top + s * .12); ctx.quadraticCurveTo(hx - s * .02, top - s * .28, hx + s * .2, top - s * .32); ctx.quadraticCurveTo(hx + s * .03, top - s * .08, hx + s * .08, top + s * .12); ctx.closePath(); ctx.fill(); ctx.stroke(); } break;
    case 'lamp': { const on = (Math.sin(t * 7) + 1) / 2; ctx.fillStyle = '#2b2f34'; ctx.fillRect(-s * .13, top - 3, s * .26, 5); glow(ctx, '#ff4040', 16 * on, () => { ctx.fillStyle = `rgba(255,${60 + on * 60 | 0},50,${.5 + on * .5})`; ctx.beginPath(); ctx.arc(0, top - 3, s * .12, Math.PI, 0); ctx.fill(); }); break; }
    case 'handle': ctx.strokeStyle = '#3a3f45'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-s * .22, top + 2); ctx.lineTo(-s * .22, top - s * .2); ctx.lineTo(s * .22, top - s * .2); ctx.lineTo(s * .22, top + 2); ctx.stroke(); break;
  }
  bolt(ctx, -s * .34, -s * .2);
}
function drawFabTorso(ctx, w, h, d, paint, PG, R, t) {
  const sh = d.shell || 'crate';
  const path = () => { ctx.beginPath(); const Rr = (x, y, ww, hh, r) => { if (ctx.roundRect) ctx.roundRect(x, y, ww, hh, r); else ctx.rect(x, y, ww, hh); }; switch (sh) {
    case 'drum': Rr(-w / 2, -h, w, h, 10); break;
    case 'chest': ctx.moveTo(-w / 2, -h + 6); ctx.lineTo(-w * .4, -h); ctx.lineTo(w * .4, -h); ctx.lineTo(w / 2, -h + 6); ctx.lineTo(w * .3, 0); ctx.lineTo(-w * .3, 0); ctx.closePath(); break;
    case 'fridge': Rr(-w / 2, -h, w, h, 14); break;
    case 'heater': Rr(-w / 2, -h, w, h, w * .45); break;
    case 'rollcage': Rr(-w / 2, -h, w, h, 12); break;
    default: ctx.rect(-w / 2, -h, w, h);
  } };
  ctx.strokeStyle = DARK; ctx.lineWidth = 2.5;
  if (sh === 'heater') { ctx.strokeStyle = '#b87333'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w * .2, -h + 4); ctx.lineTo(-w * .2, -h - 14); ctx.lineTo(-w * .46, -h - 14); ctx.moveTo(w * .15, -h + 4); ctx.lineTo(w * .15, -h - 10); ctx.stroke(); ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; }
  if (sh === 'rollcage') { ctx.fillStyle = '#15171b'; path(); ctx.fill(); }
  else { ctx.fillStyle = PG; path(); ctx.fill(); ctx.save(); path(); ctx.clip(); matFinish(ctx, d.mat, -w / 2, -h, w, h, sh + (d.core || '') + (d.mat || '')); ctx.restore(); }
  if (sh === 'crate') { ctx.fillStyle = '#2b2f34'; for (const [x, y, sx, sy] of [[-w / 2, -h, 1, 1], [w / 2, -h, -1, 1], [-w / 2, 0, 1, -1], [w / 2, 0, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sx * 16, y); ctx.lineTo(x + sx * 16, y + sy * 5); ctx.lineTo(x + sx * 5, y + sy * 5); ctx.lineTo(x + sx * 5, y + sy * 16); ctx.lineTo(x, y + sy * 16); ctx.closePath(); ctx.fill(); } ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-w / 2 + 7, -h + 7); ctx.lineTo(w / 2 - 7, -7); ctx.moveTo(w / 2 - 7, -h + 7); ctx.lineTo(-w / 2 + 7, -7); ctx.stroke(); }
  if (sh === 'drum') { for (const k of [.2, .5, .8]) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-w / 2 + 2, -h * k - 3, w - 4, 6); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(-w / 2 + 2, -h * k - 3, w - 4, 1.5); } }
  if (sh === 'chest') { ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -h + 4); ctx.lineTo(0, -h * .45); ctx.moveTo(-w * .4, -h * .64); ctx.quadraticCurveTo(0, -h * .5, w * .4, -h * .64); ctx.stroke(); }
  if (sh === 'fridge') { ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w / 2 + 2, -h * .66); ctx.lineTo(w / 2 - 2, -h * .66); ctx.stroke(); ctx.fillStyle = '#c9cdd1'; rr(ctx, w / 2 - 10, -h * .92, 5, h * .2, 2); ctx.fill(); rr(ctx, w / 2 - 10, -h * .58, 5, h * .28, 2); ctx.fill(); }
  if (sh === 'heater') { ctx.fillStyle = '#ebe7de'; rr(ctx, -w * .32, -h * .3, w * .42, h * .12, 2); ctx.fill(); ctx.fillStyle = '#16181b'; ctx.fillRect(-w * .28, -h * .26, w * .3, 2); ctx.fillRect(-w * .28, -h * .22, w * .2, 2); }
  const cx = w * .04, cy = -h * .56;
  switch (d.core) {
    case 'gauge': { const gr = w * .15; ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(cx, cy, gr + 3, 0, 7); ctx.fill(); ctx.fillStyle = '#ebe7de'; ctx.beginPath(); ctx.arc(cx, cy, gr, 0, 7); ctx.fill(); ctx.strokeStyle = '#d94a5a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(cx, cy, gr - 3, -.3, .7); ctx.stroke(); const ang = -2.6 + Math.min(1, (R.dmg.heat || 0) / 100) * 3.2 + Math.sin(t * 9) * .04; ctx.strokeStyle = '#16181b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * gr * .85, cy + Math.sin(ang) * gr * .85); ctx.stroke(); break; }
    case 'battery': ctx.fillStyle = '#16181b'; rr(ctx, cx - w * .2, cy - h * .1, w * .4, h * .22, 3); ctx.fill(); ctx.fillStyle = '#d94a5a'; ctx.fillRect(cx - w * .16, cy - h * .14, 6, 5); ctx.fillStyle = '#9aa1a8'; ctx.fillRect(cx + w * .1, cy - h * .14, 6, 5); ctx.fillStyle = '#6cc28a'; ctx.fillRect(cx - w * .15, cy, w * .3 * Math.max(.15, R.dmg.hpF || 1), 4); break;
    case 'grille': ctx.fillStyle = '#16181b'; rr(ctx, cx - w * .24, cy - h * .14, w * .48, h * .28, 3); ctx.fill(); ctx.strokeStyle = '#7d858d'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 1; i < 6; i++) { const y = cy - h * .14 + i * h * .047; ctx.moveTo(cx - w * .22, y); ctx.lineTo(cx + w * .22, y); } ctx.stroke(); break;
    case 'plate': { ctx.fillStyle = '#ebe7de'; rr(ctx, cx - w * .26, cy - h * .08, w * .52, h * .17, 3); ctx.fill(); ctx.strokeStyle = '#16181b'; ctx.lineWidth = 1.5; ctx.stroke(); const m = ctx.getTransform(); ctx.save(); if (m.a * m.d - m.b * m.c < 0) { ctx.translate(cx, 0); ctx.scale(-1, 1); ctx.translate(-cx, 0); } ctx.fillStyle = '#24506a'; ctx.font = `600 ${h * .13}px Teko, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(d.tag || 'HOMEMADE').slice(0, 10), cx, cy + 1, w * .48); ctx.restore(); break; }
    case 'speaker': { const pulse = 1 + Math.sin(t * 16) * .05; ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(cx, cy, w * .2, 0, 7); ctx.fill(); ctx.fillStyle = '#3a3f45'; ctx.beginPath(); ctx.arc(cx, cy, w * .15 * pulse, 0, 7); ctx.fill(); ctx.fillStyle = '#5b626a'; ctx.beginPath(); ctx.arc(cx, cy, w * .05, 0, 7); ctx.fill(); break; }
    case 'engine': ctx.fillStyle = '#3a3f45'; ctx.strokeStyle = DARK; ctx.lineWidth = 2; rr(ctx, cx - w * .25, cy - h * .12, w * .5, h * .26, 3); ctx.fill(); ctx.stroke(); for (let i = 0; i < 4; i++) { const px = cx - w * .18 + i * w * .12, up = Math.sin(t * 18 + i * 1.6) * 3; ctx.fillStyle = '#c9cdd1'; ctx.fillRect(px - 3, cy - h * .2 + up, 6, h * .1); ctx.fillStyle = '#16181b'; ctx.fillRect(px - 4, cy - h * .21 + up, 8, 3); } break;
  }
  if (sh === 'rollcage') { ctx.strokeStyle = PG; ctx.lineWidth = 7; path(); ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w / 2 + 4, -h + 6); ctx.lineTo(w / 2 - 4, -6); ctx.moveTo(-w / 2 + 3, -h * .3); ctx.lineTo(w / 2 - 3, -h * .3); ctx.stroke(); }
  ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; path(); ctx.stroke();
}
const ARMD = { pipe: { th: 15, fist: 21 }, servo: { th: 10, fist: 15 }, pile: { th: 23, fist: 31 }, arc: { th: 13, fist: 20 }, talon: { th: 13, fist: 21 }, baler: { th: 19, fist: 26 }, davit: { th: 15, fist: 22 }, aria: { th: 11, fist: 17 }, ram: { th: 18, fist: 24 }, gatling: { th: 13, fist: 22 }, wrecker: { th: 21, fist: 30 }, prism: { th: 11, fist: 19 }, shockjab: { th: 12, fist: 20 }, sawguard: { th: 15, fist: 22 }, magnet: { th: 13, fist: 24 }, buckler: { th: 15, fist: 28 }, pilebunker: { th: 13, fist: 20 }, hammer: { th: 18, fist: 28 }, ladle: { th: 16, fist: 26 }, twinpiston: { th: 17, fist: 24 }, shear: { th: 14, fist: 24 }, crank: { th: 18, fist: 28 }, seamine: { th: 15, fist: 26 } };
const PISTON_ARMS = new Set(['pile', 'baler', 'ram', 'wrecker', 'hammer', 'twinpiston']);
function armDims(id) { const ap = part('arms', id); return { ...ARMD[id], pist: PISTON_ARMS.has(id), up: ap.reach * .5, fo: ap.reach * .47 }; }
function dims(b) {
  b = normBuild(b);
  const L = { stumps: { th: 44, sh: 40, w: 24, foot: 'tread', fh: 12 }, struts: { th: 56, sh: 54, w: 13, foot: 'spring', fh: 8 }, pylons: { th: 42, sh: 44, w: 30, foot: 'slab', fh: 14 }, hover: { th: 46, sh: 42, w: 15, foot: 'thruster', fh: 11 }, hocks: { th: 50, sh: 50, w: 16, foot: 'claw', fh: 9 }, harrow: { th: 44, sh: 42, w: 22, foot: 'disc', fh: 12 }, bollard: { th: 38, sh: 40, w: 30, foot: 'bollard', fh: 16 }, poise: { th: 54, sh: 52, w: 12, foot: 'point', fh: 8 }, piston: { th: 46, sh: 46, w: 20, foot: 'plate', fh: 11 }, wheel: { th: 50, sh: 40, w: 12, foot: 'wheel', fh: 0, r: 25 }, outrigger: { th: 36, sh: 38, w: 32, foot: 'outrigger', fh: 14 }, spider: { th: 48, sh: 52, w: 13, foot: 'tri', fh: 10 }, leaf: { th: 44, sh: 46, w: 17, foot: 'tri', fh: 13 }, bogie: { th: 42, sh: 40, w: 24, foot: 'bogie', fh: 18 }, spiderp: { th: 54, sh: 52, w: 12, foot: 'point', fh: 9 } }[b.legs];
  if (['pylons', 'bollard', 'piston', 'outrigger', 'bogie', 'spiderp'].includes(b.legs)) L.pist = 1;
  const T = { barrel: { w: 66, h: 86 }, spindle: { w: 62, h: 96 }, foundry: { w: 82, h: 98 }, capacitor: { w: 66, h: 90 }, forge: { w: 72, h: 94 }, combine: { w: 84, h: 96 }, ballast: { w: 74, h: 92 }, gallery: { w: 60, h: 92 }, boiler: { w: 70, h: 98 }, jukebox: { w: 68, h: 94 }, vault: { w: 86, h: 96 }, reactor: { w: 70, h: 94 }, radial: { w: 76, h: 92 }, pendulum: { w: 80, h: 98 }, cryo: { w: 82, h: 96 } }[b.torso] || fabDims(b.torso);
  const H = { bucket: 40, optic: 36, dome: 48, halo: 38, visor: 42, silo: 42, bosun: 44, lumen: 36, furnace: 44, crt: 46, cab: 46, lantern: 40, periscope: 44, flood: 42, anvil: 46 }[b.head] || fabSize(b.head);
  return { L, T, H, A: { lead: armDims(b.lead), rear: armDims(b.rear) } };
}
function legAng(b, l) { return (b.legs === 'hocks' || b.legs === 'spider' || b.legs === 'spiderp') ? { a: l.a * .8 - .4, k: -(l.k + .55) } : l; }
function hipOf(b, D, P) {
  if (D.L.foot === 'wheel') return -(D.L.th + D.L.r * 2 - 6);
  const fl = legAng(b, P.fl), bl = legAng(b, P.bl), drop = l => D.L.th * Math.cos(l.a) + D.L.sh * Math.cos(l.a - l.k);
  return -Math.max(drop(fl), drop(bl)) - D.L.fh - (b.legs === 'hover' ? 7 : 0);
}
function anchors(b) {
  const D = dims(b), hip = hipOf(b, D, { fl: { a: .16, k: .19 }, bl: { a: -.14, k: .15 } });
  return { hip, headY: hip - D.T.h - D.H * .55, bodyY: hip - D.T.h * .5, half: D.T.w * .45, shY: hip - D.T.h + 16, lsx: D.T.w * .24, rsx: D.T.w * .04, legsY: hip * .5, D };
}

const GL = { u: 1, f: -1.2 }, GR = { u: .85, f: -1.5 };
const WIND = { jab: { u: 1.5, f: -1.4 }, cross: { u: 1.75, f: -1.5 }, hook: { u: 1.3, f: -.4 }, upper: { u: 1.8, f: .5 }, hay: { u: 2.4, f: -1.9 }, counter: { u: 1.6, f: -1.5 } };
const lerpA = (a, b, t) => ({ u: a.u + (b.u - a.u) * t, f: a.f + (b.f - a.f) * t });
const ease = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
function extPose(kind, target) {
  if (kind === 'hook') return target === 'head' ? { u: -.1, f: -.75 } : { u: .35, f: -.25 };
  if (kind === 'upper') return { u: .3, f: -1.45 };
  return target === 'head' ? { u: -.14, f: -.1 } : { u: .24, f: .22 };
}
const KNEEL = { crouch: 1.05, lean: .32 };
function poseFrom(st, p, punch, t, walk, side) {
  const P = { walk, lean: 0, crouch: .05 + Math.sin(t * 3.1 + side * 1.7) * .035, lead: { ...GL }, rear: { ...GR }, fall: 0, jit: 0 };
  const ph = walk * .075, s = Math.sin(ph);
  P.fl = { a: .16 + s * .3, k: .14 + Math.max(0, Math.cos(ph)) * .24 };
  P.bl = { a: -.14 - s * .3, k: .1 + Math.max(0, -Math.cos(ph)) * .24 };
  if (punch && (st === 'windup' || st === 'strike' || st === 'recover')) {
    const arm = punch.arm, G = arm === 'lead' ? GL : GR, sigJab = punch.signature && punch.kind === 'jab', W = sigJab ? { u: 1.85, f: -1.85 } : WIND[punch.kind] || WIND.cross, X = extPose(punch.kind, punch.target);
    const lean = punch.kind === 'jab' ? .06 : punch.kind === 'upper' ? -.04 : .14;
    if (st === 'windup') { const e = ease(p); P[arm] = lerpA(G, W, e); P.lean = sigJab ? -.16 * e : -.07 * e * (punch.kind === 'hay' ? 2 : 1); if (punch.kind === 'upper') P.crouch += .25 * e; if (sigJab) P.crouch += .08 * e; if (punch.kind === 'hay') { P.crouch += .14 * e; P.fl.a -= .16 * e; P.bl.a += .16 * e; } }
    else if (st === 'strike') { P[arm] = X; P.lean = lean; }
    else { const e = ease(p); P[arm] = lerpA(X, G, e); P.lean = lean * (1 - e); }
  }
  switch (st) {
    case 'block': P.lead = { u: .35, f: -1.75 }; P.rear = { u: .5, f: -1.8 }; P.lean = -.05; P.crouch += .08; break;
    case 'clinch': P.lead = { u: 1.5, f: -.25 }; P.rear = { u: 1.25 + Math.max(0, Math.sin(t * 11 + side)) * .25, f: -.9 }; P.lean = .22 + Math.sin(t * 6 + side) * .03; P.crouch += .12; break;
    case 'slip': P.lean = .26; P.crouch += .26; P.lead = { u: .45, f: -1.3 }; P.rear = { u: .65, f: -1.45 }; break;
    case 'feint': { const e = ease(p); P.lead = lerpA(GL, { u: 1.75, f: .48 }, e); P.lean = -.08 * e; P.crouch += .05 * e; break; }
    case 'stagger': { const q = 1 - ease(p); P.lean = -.26 * q; P.lead = lerpA(GL, { u: -.5, f: -.9 }, q); P.rear = lerpA(GR, { u: -.1, f: -.5 }, q); break; }
    case 'stall': P.lean = .12; P.lead = { u: 1.35, f: .25 }; P.rear = { u: 1.4, f: .35 }; P.jit = 1; P.crouch += .15; break;
    case 'dazed': P.lean = Math.sin(t * 2.2) * .12; P.lead = { u: 1.3, f: .5 }; P.rear = { u: 1.4, f: .7 }; P.crouch += .2; break;
    case 'victory': P.lead = { u: -1.35, f: -1.6 }; P.rear = { u: -1.9, f: -1.75 }; P.lean = -.06; P.crouch = .02 + Math.abs(Math.sin(t * 5)) * .06; break;
    case 'slump': P.lean = .18; P.lead = { u: 1.35, f: .6 }; P.rear = { u: 1.4, f: .8 }; P.crouch += .1; break;
    case 'fwindup': { const e = ease(p); P.crouch += .35 * e; P.rear = lerpA(GR, { u: 1.9, f: .9 }, e); P.lean = .1 * e; break; }
    case 'fstrike': P.rear = { u: -.9, f: -1.55 }; P.lead = { u: .6, f: -.3 }; P.lean = -.18; P.crouch = 0; break;
    case 'down': case 'out': case 'wreck': { const q = ease(Math.min(1, p)); P.fall = q; P.lead = lerpA(GL, { u: .5, f: .6 }, q); P.rear = lerpA(GR, { u: .7, f: .9 }, q); if (st === 'down' && p > 1.2) { const tw = Math.sin(t * 37) > .7 ? 1 : 0; P.lead.f += tw * .35; P.lead.u += Math.sin(t * 3) * .05; } break; }
    case 'kneel': { const e = ease(Math.min(1, p * 4)); P.fall = 1 - e; P.crouch = .8 * e + P.crouch * (1 - e); P.lean = KNEEL.lean * e; P.rear = lerpA({ u: .7, f: .9 }, { u: .25, f: .15 }, e); P.lead = lerpA({ u: .5, f: .6 }, { u: 1.05, f: -.4 }, e); P.jit = Math.sin(t * 23) > .6 ? 1 : 0; P.fl = { a: P.fl.a * (1 - e) - 1.3 * e, k: P.fl.k * (1 - e) + 1.6 * e - .8 * e }; P.bl = { a: P.bl.a * (1 - e) + .96 * e, k: P.bl.k * (1 - e) + 2.4 * e - .8 * e }; break; }
    case 'rise': { const e = ease(p), q = 1 - e; P.crouch = .8 * q + P.crouch * e; P.lean = KNEEL.lean * q; P.rear = lerpA({ u: .25, f: .15 }, GR, e); P.lead = lerpA({ u: 1.05, f: -.4 }, GL, e); P.fl = { a: -1.3 * q + P.fl.a * e, k: .8 * q + P.fl.k * e }; P.bl = { a: .96 * q + P.bl.a * e, k: 1.6 * q + P.bl.k * e }; break; }
  }
  P.fl.k += P.crouch; P.bl.k += P.crouch; P.fl.a += P.crouch * .5; P.bl.a += P.crouch * .3;
  return P;
}
function drawFoot(ctx, L, back, t) {
  ctx.fillStyle = back ? '#1b1e22' : '#2f3439'; ctx.strokeStyle = back ? '#121417' : DARK; ctx.lineWidth = 2;
  const fh = L.fh;
  if (L.foot === 'tread') { rr(ctx, -16, 0, 44, fh, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 6; i++) ctx.fillRect(-12 + i * 7, fh - 4, 4, 3); }
  else if (L.foot === 'spring') { rr(ctx, -10, 0, 34, fh, 3); ctx.fill(); ctx.stroke(); }
  else if (L.foot === 'slab') { rr(ctx, -20, 0, 52, fh, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? 'rgba(240,178,10,.25)' : 'rgba(240,178,10,.8)'; for (let i = 0; i < 4; i++) ctx.fillRect(-14 + i * 12, 3, 6, 3); }
  else if (L.foot === 'thruster') {
    rr(ctx, -12, 0, 32, fh, 5); ctx.fill(); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, fh, 0, fh + 12); g.addColorStop(0, `rgba(170,120,255,${.55 + Math.sin(t * 30) * .15})`); g.addColorStop(1, 'rgba(170,120,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-8, fh); ctx.lineTo(16, fh); ctx.lineTo(10, fh + 12); ctx.lineTo(-2, fh + 12); ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  else if (L.foot === 'plate') { rr(ctx, -16, 0, 46, fh, 4); ctx.fill(); ctx.stroke(); for (let i = 0; i < 4; i++) bolt(ctx, -10 + i * 12, fh / 2, 1.8); ctx.fillStyle = back ? '#3a2a1a' : '#b8733a'; ctx.fillRect(-16, 0, 46, 3); }
  else if (L.foot === 'outrigger') { ctx.strokeStyle = back ? '#2a2e33' : '#7d858d'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 3); ctx.lineTo(-32, fh - 3); ctx.moveTo(10, 3); ctx.lineTo(42, fh - 3); ctx.stroke(); ctx.fillStyle = back ? '#1b1e22' : '#2f3439'; ctx.strokeStyle = back ? '#121417' : DARK; ctx.lineWidth = 2; rr(ctx, -12, 0, 32, fh - 3, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#3a2a10' : '#c98a2b'; rr(ctx, -42, fh - 5, 18, 5, 2); ctx.fill(); rr(ctx, 36, fh - 5, 18, 5, 2); ctx.fill(); }
  else if (L.foot === 'tri') { ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(7, 0); ctx.lineTo(10, fh * .5); ctx.lineTo(-6, fh * .5); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.strokeStyle = back ? '#3a3f45' : '#c9cdd1'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); [[-15, fh], [12, fh], [31, fh]].forEach(([x, y]) => { ctx.moveTo(2, fh * .45); ctx.lineTo(x, y); }); ctx.stroke(); ctx.lineCap = 'butt'; }
  else if (L.foot === 'disc') { rr(ctx, -14, 0, 40, fh - 2, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#2a2d31' : '#5b626a'; [-12, 24].forEach(x => { ctx.beginPath(); ctx.ellipse(x, fh - 4, 5, fh * .5, 0, 0, 7); ctx.fill(); ctx.stroke(); }); }
  else if (L.foot === 'bollard') { ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(22, 0); ctx.lineTo(30, fh); ctx.lineTo(-22, fh); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#222' : '#16181b'; ctx.fillRect(-22, fh - 4, 52, 4); ctx.fillStyle = back ? 'rgba(240,178,10,.2)' : '#c9a24a'; ctx.fillRect(-6, 4, 16, 3); }
  else if (L.foot === 'bogie') { for (const x of [-10, 20]) { ctx.fillStyle = back ? '#1b1e22' : '#2f3439'; ctx.beginPath(); ctx.arc(x, fh * .55, fh * .5, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#2a2d31' : '#9aa1a8'; ctx.beginPath(); ctx.arc(x, fh * .55, fh * .5 - 4, 0, 7); ctx.fill(); ctx.save(); ctx.translate(x, fh * .55); ctx.rotate(t * 3); ctx.fillStyle = back ? '#16181b' : '#3a3f45'; ctx.fillRect(-1.5, -fh * .4, 3, fh * .8); ctx.restore(); } ctx.fillStyle = back ? '#16181b' : '#c7362f'; ctx.fillRect(-14, 0, 38, 4); }
  else if (L.foot === 'point') { ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.lineTo(26, fh); ctx.lineTo(-10, fh); ctx.closePath(); ctx.fill(); ctx.stroke(); if (!back) { ctx.fillStyle = '#3fb6a8'; ctx.fillRect(-6, fh - 3, 28, 2); } }
  else { ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(12, 0); ctx.lineTo(30, fh); ctx.lineTo(-14, fh); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#333' : '#c9cdd1'; [[26, fh], [14, fh], [-14, fh]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y); ctx.lineTo(x + 2, y - 4); ctx.fill(); }); }
}
function drawLeg(ctx, D, b, hx, hy, l, back, paint, fr, t, workbook = null) {
  const L = D.L, edge = back ? '#15171a' : DARK;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.PI / 2 - l.a);
  seg(ctx, L.th, L.w, back ? shade(STEEL, .4) : STEEL, edge);
  if (L.pist) piston(ctx, L.th, L.w, back);
  ctx.translate(L.th, 0); joint(ctx, L.w * .55, back ? '#1d2024' : '#33383e');
  ctx.rotate(l.k);
  seg(ctx, L.sh, L.w * .9, back ? shade(paint, .5) : shade(paint, .12), edge);
  const wbLegs = workbookVisualMounted(workbook, 'legs', fr); if (wbLegs) drawWorkbookMount(ctx, wbLegs.row, L.sh * .5, 0, Math.min(24, L.sh * .45), L.w * .48, back ? -.08 : .08, wbLegs.state);
  if (b.legs === 'leaf') { ctx.strokeStyle = back ? '#3a3f45' : '#c9cdd1'; ctx.lineWidth = 2.5; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(4 + i * 3, -L.w * .5 - 2 - i * 2); ctx.quadraticCurveTo(L.sh * .5, -L.w * .5 - 8 - i * 2, L.sh - 4 - i * 3, -L.w * .5 - 2 - i * 2); ctx.stroke(); } }
  if (b.legs === 'struts') { ctx.strokeStyle = back ? '#3a3f45' : '#9aa1a8'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 5; i++) { ctx.moveTo(10 + i * 7, -6); ctx.lineTo(14 + i * 7, 6); } ctx.stroke(); }
  if (fr < .45) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.ellipse(L.sh * .4, 0, 6, L.w * .3, .4, 0, 7); ctx.fill(); if (fr < .25) wires(ctx, L.sh * .6, -2, 8, t); }
  ctx.translate(L.sh, 0); ctx.rotate(-(Math.PI / 2 - l.a) - l.k);
  drawFoot(ctx, L, back, t);
  ctx.restore();
}
function drawFist(ctx, type, s, back, t) {
  ctx.fillStyle = back ? '#2a2e33' : '#3a3f45'; ctx.strokeStyle = back ? '#121417' : '#16181b'; ctx.lineWidth = 2;
  if (type === 'servo') { rr(ctx, -2, -s * .45, s * 1.3, s * .9, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#2e6a8c' : '#4fa3d9'; ctx.fillRect(s * .9, -2, s * .3, 4); }
  else if (type === 'pile') { rr(ctx, -4, -s / 2, s * 1.05, s, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#8a6a10' : '#f0b20a'; ctx.fillRect(s * .75, -s / 2 + 3, 4, s - 6); bolt(ctx, s * .2, -s * .25, 2.5); bolt(ctx, s * .2, s * .25, 2.5); }
  else if (type === 'arc') {
    rr(ctx, -3, -s / 2, s, s, s * .45); ctx.fill(); ctx.stroke();
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(190,150,255,${.5 + Math.random() * .5})`; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 0; i < 2; i++) { let x = s * .2, y = -s * .4; ctx.moveTo(x, y); for (let j = 0; j < 4; j++) { x += s * .2; y += (Math.random() - .3) * s * .4; ctx.lineTo(x, y); } }
    ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
  }
  else if (type === 'talon') { ctx.beginPath(); ctx.moveTo(-3, -s / 2); ctx.lineTo(s * .7, -s / 2); ctx.lineTo(s * 1.2, -s * .25); ctx.lineTo(s * .75, -s * .05); ctx.lineTo(s * 1.25, s * .15); ctx.lineTo(s * .7, s / 2); ctx.lineTo(-3, s / 2); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#6e2630' : '#d94a5a'; ctx.fillRect(0, -2, s * .5, 4); }
  else if (type === 'ram') { ctx.fillStyle = back ? '#2a2e33' : '#4a5058'; rr(ctx, -4, -s * .42, s * .7, s * .84, 3); ctx.fill(); ctx.stroke(); const g = ctx.createLinearGradient(0, -s * .12, 0, s * .12); g.addColorStop(0, back ? '#7d858d' : '#f2f4f5'); g.addColorStop(1, back ? '#3a3f45' : '#8a9198'); ctx.fillStyle = g; ctx.fillRect(s * .66, -s * .12, s * .24, s * .24); ctx.fillStyle = back ? '#3a2a1a' : '#b8733a'; rr(ctx, s * .88, -s * .52, s * .26, s * 1.04, 3); ctx.fill(); ctx.strokeStyle = back ? '#121417' : '#16181b'; ctx.stroke(); bolt(ctx, s * .1, -s * .25, 2); bolt(ctx, s * .1, s * .25, 2); bolt(ctx, s * 1.01, 0, 2); }
  else if (type === 'gatling') { const r = s * .5, sp = t * 14; ctx.beginPath(); ctx.arc(s * .45, 0, r, 0, 7); ctx.fill(); ctx.stroke(); for (let i = 0; i < 4; i++) { const a = sp + i * 1.5708, y = Math.sin(a) * r * .5, vis = Math.cos(a); if (vis < -.3) continue; ctx.fillStyle = back ? '#3a3f45' : mixc('#e05aa0', 0, .25 - vis * .25); rr(ctx, s * .3, y - s * .11, s * .82, s * .22, s * .09); ctx.fill(); ctx.strokeStyle = back ? '#121417' : '#16181b'; ctx.lineWidth = 1.5; ctx.stroke(); } ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(s * .45, 0, s * .15, 0, 7); ctx.fill(); }
  else if (type === 'wrecker') { const r = s * .58, g = ctx.createRadialGradient(s * .38, -r * .45, 2, s * .55, 0, r); g.addColorStop(0, back ? '#4a4f55' : '#b6bcc2'); g.addColorStop(1, back ? '#16181b' : '#2c3136'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(s * .55, 0, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = back ? '#5a4a1a' : '#c98a2b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(s * .55, 0, r * .3, r * .97, 0, 0, 7); ctx.stroke(); for (let i = 0; i < 5; i++) { const a = -1.2 + i * .6; bolt(ctx, s * .55 + Math.cos(a) * r * .74, Math.sin(a) * r * .74, 2.2); } }
  else if (type === 'prism') { ctx.beginPath(); ctx.moveTo(-3, -s * .4); ctx.lineTo(s * .5, -s * .56); ctx.lineTo(s * 1.15, -s * .1); ctx.lineTo(s * 1.15, s * .15); ctx.lineTo(s * .5, s * .56); ctx.lineTo(-3, s * .4); ctx.closePath(); const g = ctx.createLinearGradient(0, -s * .5, s, s * .5); g.addColorStop(0, back ? '#2a4a5a' : '#e8fbff'); g.addColorStop(.5, back ? '#1f3a4a' : '#8fd8ff'); g.addColorStop(1, back ? '#132630' : '#2f6a88'); ctx.fillStyle = g; ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s * .5, -s * .56); ctx.lineTo(s * .62, 0); ctx.lineTo(s * .5, s * .56); ctx.moveTo(s * .62, 0); ctx.lineTo(s * 1.15, 0); ctx.stroke(); if (!back) glow(ctx, '#8fd8ff', 16, () => { ctx.fillStyle = 'rgba(143,216,255,.4)'; ctx.beginPath(); ctx.arc(s * .62, 0, s * .2, 0, 7); ctx.fill(); }); }
  else if (type === 'shockjab') { ctx.strokeStyle = back ? '#6b5a20' : '#e8b10c'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 6; i++) ctx.lineTo(-4 + i * s * .1, i % 2 ? -s * .32 : s * .32); ctx.stroke(); ctx.strokeStyle = back ? '#121417' : '#16181b'; ctx.lineWidth = 2; rr(ctx, s * .55, -s * .48, s * .62, s * .96, 5); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(0,0,0,.35)'; for (let i = 0; i < 3; i++) ctx.fillRect(s * .6, -s * .3 + i * s * .25, s * .5, 2); }
  else if (type === 'sawguard') { ctx.save(); ctx.translate(s * .25, -s * .35); ctx.rotate(t * 9); ctx.fillStyle = back ? '#4a4f55' : '#c9cdd1'; ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * 6.283, rad = i % 2 ? s * .55 : s * .68; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#2a2e33' : '#5b626a'; ctx.beginPath(); ctx.arc(0, 0, s * .15, 0, 7); ctx.fill(); ctx.restore(); ctx.fillStyle = back ? '#6b5212' : '#e8b10c'; ctx.beginPath(); ctx.moveTo(-s * .45, -s * .3); ctx.arc(s * .25, -s * .35, s * .72, Math.PI, Math.PI * 1.5); ctx.lineTo(s * .25, -s * .35); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#2a2e33' : '#3a3f45'; rr(ctx, -3, -s * .3, s * .9, s * .7, 4); ctx.fill(); ctx.stroke(); }
  else if (type === 'magnet') { ctx.lineCap = 'butt'; ctx.strokeStyle = back ? '#5a1e1a' : '#c7362f'; ctx.lineWidth = s * .32; ctx.beginPath(); ctx.arc(s * .25, 0, s * .32, Math.PI * .5, Math.PI * 1.5); ctx.lineTo(s * .85, -s * .32); ctx.moveTo(s * .25, s * .32); ctx.lineTo(s * .85, s * .32); ctx.stroke(); ctx.fillStyle = back ? '#5b626a' : '#e8ecef'; ctx.fillRect(s * .8, -s * .48, s * .25, s * .32); ctx.fillRect(s * .8, s * .16, s * .25, s * .32); if (!back) { ctx.strokeStyle = `rgba(143,216,255,${.3 + Math.sin(t * 6) * .2})`; ctx.lineWidth = 1.5; for (let i = 1; i <= 2; i++) { ctx.beginPath(); ctx.arc(s * 1.05, 0, s * .22 * i, -1, 1); ctx.stroke(); } } ctx.lineWidth = 2; ctx.strokeStyle = '#16181b'; }
  else if (type === 'buckler') { const hh = s * 1.15; rr(ctx, -s * .1, -hh, s * .55, hh * 2, 6); ctx.fillStyle = back ? '#3a3010' : '#e8b10c'; ctx.fill(); ctx.save(); ctx.clip(); ctx.fillStyle = back ? '#121417' : '#16181b'; for (let y = -hh * 2; y < hh * 2; y += 12) { ctx.beginPath(); ctx.moveTo(-s * .2, y); ctx.lineTo(s * .6, y + s * .5); ctx.lineTo(s * .6, y + s * .5 + 6); ctx.lineTo(-s * .2, y + 6); ctx.fill(); } ctx.restore(); ctx.strokeStyle = back ? '#121417' : '#16181b'; ctx.lineWidth = 2.5; rr(ctx, -s * .1, -hh, s * .55, hh * 2, 6); ctx.stroke(); ctx.fillStyle = back ? '#2a2e33' : '#5b626a'; ctx.fillRect(s * .05, -hh * .2, s * .25, hh * .4); }
  else if (type === 'pilebunker') { rr(ctx, -3, -s * .42, s * .8, s * .84, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#4a4f55' : '#d0d5da'; ctx.beginPath(); ctx.moveTo(s * .77, -s * .14); ctx.lineTo(s * 1.6, 0); ctx.lineTo(s * .77, s * .14); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#6b5212' : '#f0b20a'; ctx.fillRect(s * .1, -s * .42, s * .14, s * .84); bolt(ctx, s * .5, -s * .2); bolt(ctx, s * .5, s * .2); }
  else if (type === 'hammer') { ctx.fillStyle = back ? '#2a2e33' : '#5b626a'; ctx.fillRect(-3, -s * .12, s * .5, s * .24); ctx.fillStyle = back ? '#1d2024' : '#2f3439'; rr(ctx, s * .35, -s * .62, s * .7, s * 1.24, 3); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#3a3f45' : '#7d858d'; ctx.fillRect(s * .95, -s * .62, s * .14, s * 1.24); ctx.strokeRect(s * .95, -s * .62, s * .14, s * 1.24); ctx.fillStyle = back ? '#3a3010' : '#e8b10c'; ctx.fillRect(s * .42, -s * .1, s * .5, s * .2); }
  else if (type === 'ladle') { ctx.fillStyle = back ? '#2a2420' : '#4a3a30'; ctx.beginPath(); ctx.moveTo(-3, -s * .45); ctx.lineTo(s * .55, -s * .5); ctx.arc(s * .6, 0, s * .5, -Math.PI / 2, Math.PI / 2); ctx.lineTo(-3, s * .45); ctx.closePath(); ctx.fill(); ctx.stroke(); const glo = back ? 'rgba(160,70,20,.6)' : `rgba(255,${120 + Math.sin(t * 7) * 30 | 0},30,1)`; glow(ctx, '#ff7a1a', back ? 0 : 14, () => { ctx.fillStyle = glo; ctx.beginPath(); ctx.ellipse(s * .68, 0, s * .28, s * .36, 0, 0, 7); ctx.fill(); }); if (!back && Math.sin(t * 3) > .6) { ctx.fillStyle = '#ffb21a'; ctx.beginPath(); ctx.arc(s * .7, s * .55 + (t * 40 % 10), 2.2, 0, 7); ctx.fill(); } }
  else if (type === 'twinpiston') { for (const y of [-s * .26, s * .26]) { ctx.fillStyle = back ? '#2a2e33' : '#4a5058'; rr(ctx, -3, y - s * .2, s * .6, s * .4, 3); ctx.fill(); ctx.stroke(); const g = ctx.createLinearGradient(0, y - 4, 0, y + 4); g.addColorStop(0, back ? '#7d858d' : '#f2f4f5'); g.addColorStop(1, back ? '#3a3f45' : '#8a9198'); ctx.fillStyle = g; ctx.fillRect(s * .56, y - s * .1, s * .3, s * .2); } ctx.fillStyle = back ? '#2a2e33' : '#3a3f45'; rr(ctx, s * .84, -s * .5, s * .32, s, 4); ctx.fill(); ctx.stroke(); }
  else if (type === 'shear') { const op = .18 + Math.max(0, Math.sin(t * 2)) * .12; ctx.fillStyle = back ? '#5a1e1a' : '#c7362f'; for (const sg of [-1, 1]) { ctx.save(); ctx.rotate(sg * op); ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(s * 1.25, sg * s * .05); ctx.lineTo(s * .9, sg * s * .38); ctx.lineTo(-3, sg * s * .36); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#4a4f55' : '#e8ecef'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(s * (.25 + i * .22), sg * s * .03); ctx.lineTo(s * (.34 + i * .22), sg * s * .12); ctx.lineTo(s * (.43 + i * .22), sg * s * .03); ctx.fill(); } ctx.fillStyle = back ? '#5a1e1a' : '#c7362f'; ctx.restore(); } bolt(ctx, s * .05, 0, 3); }
  else if (type === 'crank') { ctx.save(); ctx.translate(s * .55, 0); ctx.rotate(t * 4); ctx.fillStyle = back ? '#121417' : '#1d1f22'; ctx.beginPath(); ctx.arc(0, 0, s * .6, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#2a2e33' : '#3a3f45'; for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283; ctx.save(); ctx.rotate(a); ctx.fillRect(s * .44, -s * .07, s * .17, s * .14); ctx.restore(); } ctx.fillStyle = back ? '#5a4a1a' : '#c98a2b'; ctx.beginPath(); ctx.arc(0, 0, s * .26, 0, 7); ctx.fill(); ctx.stroke(); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283; bolt(ctx, Math.cos(a) * s * .15, Math.sin(a) * s * .15, 1.6); } ctx.restore(); }
  else if (type === 'seamine') { ctx.strokeStyle = back ? '#3a3f45' : '#9aa1a8'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(-3 + i * s * .14, -s * .2); ctx.lineTo(s * .05 + i * s * .14, s * .2); } ctx.stroke(); ctx.strokeStyle = back ? '#121417' : '#16181b'; ctx.lineWidth = 2; ctx.fillStyle = back ? '#2a3a3a' : '#3f5f5c'; ctx.beginPath(); ctx.arc(s * .7, 0, s * .45, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = back ? '#3a3f45' : '#a9b0b6'; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; ctx.save(); ctx.translate(s * .7 + Math.cos(a) * s * .45, Math.sin(a) * s * .45); ctx.rotate(a); ctx.fillRect(0, -2.5, s * .16, 5); ctx.restore(); } if (!back && Math.sin(t * 5) > 0) glow(ctx, '#ff3a3a', 10, () => { ctx.fillStyle = '#ff4a3a'; ctx.beginPath(); ctx.arc(s * .7, -s * .12, 2.6, 0, 7); ctx.fill(); }); }
  else if (type === 'baler') { rr(ctx, -4, -s / 2, s * 1.1, s, 3); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 1; i < 4; i++) { ctx.moveTo(i * s * .26, -s / 2 + 3); ctx.lineTo(i * s * .26, s / 2 - 3); } ctx.stroke(); bolt(ctx, s * .9, 0, 2.5); }
  else if (type === 'davit') { rr(ctx, -3, -s / 2, s * 1.05, s, s * .3); ctx.fill(); ctx.stroke(); ctx.save(); ctx.beginPath(); ctx.rect(-3, -s / 2, s * .35, s); ctx.clip(); ctx.fillStyle = back ? '#6b5212' : '#f0b20a'; ctx.fillRect(-3, -s / 2, s * .35, s); ctx.fillStyle = '#16181b'; for (let y = -s; y < s; y += 8) { ctx.beginPath(); ctx.moveTo(-3, y); ctx.lineTo(s * .35, y + 5); ctx.lineTo(s * .35, y + 9); ctx.lineTo(-3, y + 4); ctx.fill(); } ctx.restore(); }
  else if (type === 'aria') { ctx.beginPath(); ctx.ellipse(s * .5, 0, s * .62, s * .46, 0, 0, 7); ctx.fill(); ctx.stroke(); ctx.strokeStyle = back ? '#1f5a54' : '#3fb6a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s * .1, 0); ctx.lineTo(s * .95, 0); ctx.stroke(); }
  else { rr(ctx, -3, -s / 2, s * 1.05, s, s * .35); ctx.fill(); ctx.stroke(); for (let i = 0; i < 3; i++) bolt(ctx, s * .78, -s * .3 + i * s * .3, 2); }
}
function drawArm(ctx, D, b, sx, sy, ap, back, paint, which, fr, t, side, workbook = null) {
  const A = D.A[side], type = b[side], edge = back ? '#15171a' : DARK;
  const armKey = side === 'lead' ? 'leadArm' : 'rearArm', wbArm = workbookVisualMounted(workbook, armKey, fr), wbFist = workbookVisualMounted(workbook, 'fists', fr);
  ctx.save(); ctx.translate(sx, sy); ctx.rotate(ap.u);
  if (which !== 'fore') { seg(ctx, A.up, A.th, back ? shade(paint, .32) : paint, edge); if (wbArm) drawWorkbookMount(ctx, wbArm.row, A.up * .5, 0, Math.min(24, A.up * .5), A.th * .5, 0, wbArm.state); if (A.pist) piston(ctx, A.up, A.th, back); }
  ctx.translate(A.up, 0);
  if (which === 'upper') { joint(ctx, A.th * .55, back ? '#25292e' : '#33383e'); ctx.restore(); ctx.save(); ctx.translate(sx, sy); joint(ctx, A.th * .75, back ? '#202327' : '#2c3136'); ctx.restore(); return; }
  joint(ctx, A.th * .55, back ? '#25292e' : '#33383e');
  ctx.rotate(ap.f - ap.u);
  seg(ctx, A.fo, A.th * .88, back ? shade(STEEL, .28) : STEEL, edge);
  if (wbArm) drawWorkbookMount(ctx, wbArm.row, A.fo * .5, 0, Math.min(23, A.fo * .46), A.th * .44, 0, wbArm.state);
  if (fr < .7) { ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(A.fo * .45, 0, 5, A.th * .3, 0, 0, 7); ctx.fill(); }
  if (fr < .4) { ctx.fillStyle = '#16181b'; ctx.fillRect(A.fo * .25, -A.th * .3, A.fo * .4, A.th * .6); wires(ctx, A.fo * .4, -A.th * .2, A.th * .5, t); }
  ctx.translate(A.fo, 0); drawFist(ctx, type, A.fist, back, t); if (wbFist) drawWorkbookMount(ctx, wbFist.row, A.fist * .48, 0, A.fist * .5, A.fist * .46, 0, wbFist.state);
  ctx.restore();
  if (which === 'all') { ctx.save(); ctx.translate(sx, sy); joint(ctx, A.th * .75, back ? '#202327' : '#2c3136'); ctx.restore(); }
}
function stump(ctx, x, y, r, t) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#1b1d20'; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283, rr2 = r * (i % 2 ? .65 : 1); ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fill(); wires(ctx, 2, 2, r * 1.6, t); ctx.restore();
}

function drawTorso(ctx, D, b, paint, R, t) {
  const { w, h } = D.T; ctx.lineWidth = 2.5; ctx.strokeStyle = DARK;
  const PG = ctx.createLinearGradient(-w / 2, -h, w / 2, 0); PG.addColorStop(0, mixc(paint, 1, .28)); PG.addColorStop(.48, paint); PG.addColorStop(1, mixc(paint, 0, .38));
  if (b.torso.indexOf('fab') === 0) { drawFabTorso(ctx, w, h, (part('torso', b.torso) || {}).design || {}, paint, PG, R, t); } else if (b.torso === 'radial') {
    const cy = -h * .55, R0 = Math.min(w, h) * .4; ctx.fillStyle = shade(paint, .25); rr(ctx, -w * .3, -h * .22, w * .6, h * .22, 4); ctx.fill(); ctx.stroke();
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283 + t * .4; ctx.save(); ctx.translate(Math.cos(a) * R0 * .82, cy + Math.sin(a) * R0 * .82); ctx.rotate(a); ctx.fillStyle = '#7d858d'; rr(ctx, -2, -7, 20, 14, 3); ctx.fill(); ctx.stroke(); ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(3 + k * 4, -6); ctx.lineTo(3 + k * 4, 6); } ctx.stroke(); ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; ctx.restore(); }
    ctx.fillStyle = PG; ctx.beginPath(); ctx.arc(0, cy, R0 * .82, 0, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#2b2f34'; ctx.beginPath(); ctx.arc(0, cy, R0 * .38, 0, 7); ctx.fill(); ctx.stroke();
    glow(ctx, '#ff7a2a', 10, () => { ctx.fillStyle = `rgba(255,${130 + Math.min(1, (R.dmg.heat || 0) / 100) * 0 | 0},40,${.45 + Math.min(1, (R.dmg.heat || 0) / 100) * .5})`; ctx.beginPath(); ctx.arc(0, cy, R0 * .2, 0, 7); ctx.fill(); });
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283; bolt(ctx, Math.cos(a) * R0 * .6, cy + Math.sin(a) * R0 * .6, 2); }
  } else if (b.torso === 'pendulum') {
    ctx.fillStyle = '#1b1d21'; rr(ctx, -w / 2, -h, w, h, 6); ctx.fill();
    const sw = Math.sin(t * 2.2) * .35, bx2 = Math.sin(sw) * h * .45, by = -h + 10 + Math.cos(sw) * h * .45;
    ctx.strokeStyle = '#9aa1a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -h + 8); ctx.lineTo(bx2, by); ctx.stroke();
    const g2 = ctx.createRadialGradient(bx2 - 4, by - 4, 1, bx2, by, w * .17); g2.addColorStop(0, '#b6bcc2'); g2.addColorStop(1, '#2c3136'); ctx.fillStyle = g2; ctx.beginPath(); ctx.arc(bx2, by, w * .16, 0, 7); ctx.fill(); ctx.strokeStyle = DARK; ctx.stroke();
    ctx.strokeStyle = paint; ctx.lineWidth = 6; rr(ctx, -w / 2, -h, w, h, 6); ctx.stroke(); ctx.lineWidth = 4; ctx.beginPath(); for (let i = 1; i < 5; i++) { ctx.moveTo(-w / 2 + i * w / 5, -h); ctx.lineTo(-w / 2 + i * w / 5, 0); } ctx.moveTo(-w / 2, -h * .5); ctx.lineTo(w / 2, -h * .5); ctx.stroke(); ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; rr(ctx, -w / 2 - 3, -h - 3, w + 6, h + 6, 8); ctx.stroke();
    ctx.fillStyle = PG; ctx.fillRect(-w / 2 - 3, -h - 3, w + 6, 10); ctx.strokeRect(-w / 2 - 3, -h - 3, w + 6, 10);
  } else if (b.torso === 'cryo') {
    ctx.fillStyle = mixc(paint, 1, .45); rr(ctx, -w / 2, -h, w, h, 8); ctx.fill(); ctx.stroke(); ctx.fillStyle = PG; rr(ctx, -w / 2 + 6, -h + 6, w - 12, h - 12, 5); ctx.fill();
    ctx.fillStyle = '#e8ecef'; rr(ctx, w * .18, -h * .62, 8, h * .3, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(-w * .05, -h * .55, w * .14, 0, 7); ctx.fill(); ctx.fillStyle = '#9aa1a8'; ctx.beginPath(); ctx.arc(-w * .05, -h * .55, w * .1, 0, 7); ctx.fill(); ctx.strokeStyle = '#16181b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * .05, -h * .55); ctx.lineTo(-w * .05 + w * .08, -h * .6); ctx.stroke();
    ctx.strokeStyle = '#b8733a'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 - 6, -h * .8 + i * h * .12); ctx.lineTo(-w / 2 + 4, -h * .8 + i * h * .12); ctx.stroke(); }
    ctx.fillStyle = 'rgba(235,245,255,.92)'; ctx.beginPath(); ctx.moveTo(-w / 2, -h + 2); for (let i = 0; i <= 10; i++) ctx.lineTo(-w / 2 + i * w / 10, -h + 4 + (i % 2 ? 8 : 2) + (i % 3) * 2); ctx.lineTo(w / 2, -h + 2); ctx.closePath(); ctx.fill();
    glow(ctx, '#8fd8ff', 10, () => { ctx.fillStyle = '#8fd8ff'; ctx.fillRect(-w * .32, -h * .24, 10, 4); });
    ctx.strokeStyle = DARK; ctx.lineWidth = 2.5;
  } else if (b.torso === 'foundry') {
    ctx.fillStyle = '#2b2f34'; rr(ctx, -w * .48, -h - 22, 10, 30, 2); ctx.fill(); rr(ctx, -w * .3, -h - 30, 10, 38, 2); ctx.fill();
    ctx.fillStyle = shade(paint, .2); rr(ctx, -w / 2, -h, w, h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = PG; rr(ctx, -w / 2 + 6, -h + 6, w - 12, h * .46, 4); ctx.fill();
    ctx.fillStyle = '#1d2024'; rr(ctx, -w / 2 + 9, -h * .4, w - 18, h * .24, 3); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 9, -h * .4, w - 18, h * .24); ctx.clip(); ctx.fillStyle = '#f0b20a';
    for (let x = -w; x < w; x += 14) { ctx.beginPath(); ctx.moveTo(x, -h * .16); ctx.lineTo(x + 7, -h * .16); ctx.lineTo(x + 7 + h * .24, -h * .4); ctx.lineTo(x + h * .24, -h * .4); ctx.fill(); } ctx.restore();
    [[-w / 2 + 11, -h + 11], [w / 2 - 11, -h + 11], [-w / 2 + 11, -h * .58], [w / 2 - 11, -h * .58]].forEach(p => bolt(ctx, p[0], p[1], 2.5));
  } else if (b.torso === 'spindle') {
    ctx.fillStyle = PG; ctx.beginPath(); ctx.moveTo(-w / 2, -h); ctx.lineTo(w / 2, -h); ctx.lineTo(w * .26, -h * .25); ctx.lineTo(w * .18, 0); ctx.lineTo(-w * .18, 0); ctx.lineTo(-w * .26, -h * .25); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1d2024'; ctx.beginPath(); ctx.arc(w * .08, -h * .6, 10, 0, 7); ctx.fill();
    glow(ctx, '#4fe0ff', 12, () => { ctx.fillStyle = '#4fe0ff'; ctx.beginPath(); ctx.arc(w * .08, -h * .6, 5.5, 0, 7); ctx.fill(); });
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(-w * .16, -h * .36 + i * 6); ctx.lineTo(w * .16, -h * .36 + i * 6); } ctx.stroke();
  } else if (b.torso === 'capacitor') {
    ctx.fillStyle = shade(paint, .15); rr(ctx, -w / 2, -h, w, h, 14); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1b1d22'; rr(ctx, -w * .32, -h * .78, w * .64, h * .5, 6); ctx.fill();
    const pulse = .55 + Math.sin(t * 4) * .2;
    glow(ctx, '#b48cff', 14, () => { ctx.fillStyle = `rgba(180,140,255,${pulse})`; for (let i = 0; i < 4; i++) { rr(ctx, -w * .26, -h * .74 + i * h * .11, w * .52, h * .06, 3); ctx.fill(); } });
    ctx.fillStyle = PG; ctx.fillRect(-w / 2 + 3, -h * .2, w - 6, 8); ctx.fillRect(-w / 2 + 3, -h * .95, w - 6, 6);
  } else if (b.torso === 'forge') {
    ctx.fillStyle = '#2b2f34'; for (let i = 0; i < 4; i++) ctx.fillRect(-w / 2 - 7, -h * .85 + i * 12, 9, 5);
    ctx.fillStyle = PG; ctx.beginPath(); ctx.moveTo(-w / 2, -h); ctx.lineTo(w / 2, -h + 6); ctx.lineTo(w / 2 - 4, -h * .3); ctx.lineTo(w * .22, 0); ctx.lineTo(-w * .3, 0); ctx.lineTo(-w / 2, -h * .3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d94a5a'; ctx.beginPath(); ctx.moveTo(-w * .2, -h + 8); ctx.lineTo(w * .05, -h * .45); ctx.lineTo(w * .3, -h + 10); ctx.lineTo(w * .3, -h + 18); ctx.lineTo(w * .05, -h * .34); ctx.lineTo(-w * .2, -h + 16); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.fillRect(-w / 2 + 6, -h + 4, w - 14, 3);
  } else if (b.torso === 'boiler') {
    ctx.fillStyle = '#2b2f34'; rr(ctx, -w * .44, -h - 28, 12, 36, 3); ctx.fill(); ctx.fillStyle = '#16181b'; ctx.fillRect(-w * .44 - 2, -h - 30, 16, 5);
    ctx.fillStyle = PG; rr(ctx, -w / 2, -h, w, h, w * .38); ctx.fill(); ctx.stroke();
    for (const k of [-.8, -.5, -.2]) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-w / 2 + 3, h * k, w - 6, 5); for (let i = 0; i < 6; i++) bolt(ctx, -w / 2 + 9 + i * (w - 18) / 5, h * k + 2.5, 1.5); }
    const gx = w * .14, gy = -h * .64, gr = w * .17;
    ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(gx, gy, gr + 3.5, 0, 7); ctx.fill(); ctx.fillStyle = '#ebe7de'; ctx.beginPath(); ctx.arc(gx, gy, gr, 0, 7); ctx.fill();
    ctx.strokeStyle = '#d94a5a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(gx, gy, gr - 3, -.3, .7); ctx.stroke();
    const ang = -2.6 + Math.min(1, (R.dmg.heat || 0) / 100) * 3.2 + Math.sin(t * 9) * .05;
    ctx.strokeStyle = '#16181b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(ang) * gr * .85, gy + Math.sin(ang) * gr * .85); ctx.stroke();
    ctx.fillStyle = '#d94a5a'; ctx.beginPath(); ctx.arc(-w * .26, -h * .34, 5.5, 0, 7); ctx.fill(); ctx.fillStyle = '#16181b'; ctx.fillRect(-w * .26 - 1, -h * .34 - 7, 2, 14);
  } else if (b.torso === 'jukebox') {
    ctx.fillStyle = PG; ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2, -h + w / 2); ctx.arc(0, -h + w / 2, w / 2, Math.PI, 0); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    const hues = ['#ff4fa3', '#ffd24a', '#4fe0ff'], ph = Math.floor(t * 2.5);
    for (let i = 0; i < 3; i++) { const col = hues[(i + ph) % 3], r2 = w * (.4 - i * .09); glow(ctx, col, 12, () => { ctx.strokeStyle = col; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(0, -h + w / 2 + 4, r2, Math.PI + .2, -.2); ctx.stroke(); }); }
    ctx.fillStyle = '#16181b'; rr(ctx, -w * .32, -h * .5, w * .64, h * .36, 4); ctx.fill();
    ctx.fillStyle = '#3a3f45'; for (let j = 0; j < 4; j++) for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-w * .25 + i * w * .083, -h * .44 + j * h * .08, 2.1, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(-w / 2 + 5, -h * .09, w - 10, 3);
  } else if (b.torso === 'vault') {
    ctx.fillStyle = PG; rr(ctx, -w / 2, -h, w, h, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = mixc(paint, 0, .22); rr(ctx, -w * .4, -h * .92, w * .8, h * .84, 4); ctx.fill();
    const cx2 = w * .02, cy2 = -h * .52, R2 = Math.min(w, h) * .3, rot = t * .6;
    ctx.fillStyle = '#5b626a'; ctx.beginPath(); ctx.arc(cx2, cy2, R2, 0, 7); ctx.fill(); ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.lineWidth = 1.5; for (let i = 0; i < 24; i++) { const a = i * .2618 + rot * .3; ctx.beginPath(); ctx.moveTo(cx2 + Math.cos(a) * R2 * .78, cy2 + Math.sin(a) * R2 * .78); ctx.lineTo(cx2 + Math.cos(a) * R2 * .94, cy2 + Math.sin(a) * R2 * .94); ctx.stroke(); }
    const dg = ctx.createRadialGradient(cx2 - 4, cy2 - 4, 2, cx2, cy2, R2 * .55); dg.addColorStop(0, '#d8dde1'); dg.addColorStop(1, '#7d858d'); ctx.fillStyle = dg; ctx.beginPath(); ctx.arc(cx2, cy2, R2 * .55, 0, 7); ctx.fill();
    ctx.strokeStyle = '#c9cdd1'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = rot + i * 2.094; ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + Math.cos(a) * R2 * 1.15, cy2 + Math.sin(a) * R2 * 1.15); } ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(cx2, cy2, 4, 0, 7); ctx.fill();
    [[-w * .45, -h * .8], [-w * .45, -h * .24]].forEach(q => { ctx.fillStyle = '#2b2f34'; rr(ctx, q[0] - 4, q[1] - 9, 9, 18, 2); ctx.fill(); });
  } else if (b.torso === 'reactor') {
    ctx.fillStyle = '#15171b'; rr(ctx, -w / 2 + 4, -h + 4, w - 8, h - 8, 10); ctx.fill();
    const cy2 = -h * .52, spin = t * 3;
    glow(ctx, '#8fd8ff', 24, () => { const g = ctx.createRadialGradient(0, cy2, 2, 0, cy2, w * .3); g.addColorStop(0, '#ffffff'); g.addColorStop(.35, '#8fd8ff'); g.addColorStop(1, 'rgba(143,216,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, cy2, w * .3, 0, 7); ctx.fill(); });
    ctx.strokeStyle = '#8fd8ff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(0, cy2, w * .34, w * .11, spin, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.ellipse(0, cy2, w * .34, w * .11, -spin * .7 + 1, 0, 7); ctx.stroke();
    ctx.strokeStyle = PG; ctx.lineWidth = 8; rr(ctx, -w / 2, -h, w, h, 12); ctx.stroke();
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-w / 2 + 3, cy2); ctx.lineTo(-w * .33, cy2); ctx.moveTo(w / 2 - 3, cy2); ctx.lineTo(w * .33, cy2); ctx.moveTo(0, -h + 3); ctx.lineTo(0, -h * .84); ctx.moveTo(0, -3); ctx.lineTo(0, -h * .2); ctx.stroke();
    ctx.strokeStyle = DARK; ctx.lineWidth = 2; rr(ctx, -w / 2 - 4, -h - 4, w + 8, h + 8, 14); ctx.stroke(); rr(ctx, -w / 2 + 4, -h + 4, w - 8, h - 8, 10); ctx.stroke();
  } else if (b.torso === 'combine') {
    ctx.fillStyle = '#2b2f34'; rr(ctx, -w * .5 - 10, -h * .9, 14, h * .5, 3); ctx.fill();
    ctx.fillStyle = PG; rr(ctx, -w / 2, -h, w, h, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = shade(paint, .3); rr(ctx, -w / 2 + 4, -h * .42, w - 8, h * .38, 5); ctx.fill();
    ctx.fillStyle = '#16181b'; rr(ctx, -w * .3, -h * .9, w * .6, h * .3, 4); ctx.fill();
    ctx.strokeStyle = '#4a5058'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i < 6; i++) { const x = -w * .26 + i * w * .104; ctx.moveTo(x, -h * .87); ctx.lineTo(x, -h * .63); } ctx.stroke();
    glow(ctx, '#ffb21a', 10, () => { ctx.fillStyle = `rgba(255,178,26,${.6 + Math.sin(t * 6) * .3})`; rr(ctx, -6, -h - 8, 12, 8, 3); ctx.fill(); });
    [[-w / 2 + 9, -h * .35], [w / 2 - 9, -h * .35], [-w / 2 + 9, -h * .1], [w / 2 - 9, -h * .1]].forEach(q => bolt(ctx, q[0], q[1], 2.5));
  } else if (b.torso === 'ballast') {
    ctx.fillStyle = PG; rr(ctx, -w / 2, -h, w, h, [10, 10, 26, 26]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(-w / 2 + 2, -h * .64, w - 4, 3); ctx.fillRect(-w / 2 + 2, -h * .3, w - 4, 3);
    for (let r2 = 0; r2 < 3; r2++) for (let i = 0; i < 6; i++) bolt(ctx, -w / 2 + 8 + i * (w - 16) / 5, -h * .92 + r2 * h * .31, 1.6);
    const px = w * .12, py = -h * .5, pr = Math.min(w, h) * .15;
    ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(px, py, pr + 4, 0, 7); ctx.fill();
    const pg = ctx.createRadialGradient(px - 3, py - 3, 1, px, py, pr); pg.addColorStop(0, '#9fd3e0'); pg.addColorStop(1, '#1f3a52'); ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, py, pr, 0, 7); ctx.fill();
    ctx.strokeStyle = '#3a3f45'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-w / 2 + 4, -h * .18); ctx.quadraticCurveTo(0, -h * .04, w / 2 - 4, -h * .18); ctx.stroke();
  } else if (b.torso === 'gallery') {
    ctx.fillStyle = PG; ctx.beginPath(); ctx.moveTo(-w / 2, -h + 10); ctx.quadraticCurveTo(0, -h - 8, w / 2, -h + 10); ctx.lineTo(w * .3, -h * .2); ctx.quadraticCurveTo(0, 4, -w * .3, -h * .2); ctx.closePath(); ctx.fill(); ctx.stroke();
    glow(ctx, '#3fb6a8', 10, () => { ctx.strokeStyle = `rgba(63,182,168,${.7 + Math.sin(t * 2) * .2})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w * .38, -h * .9); ctx.quadraticCurveTo(0, -h * .8, w * .38, -h * .9); ctx.moveTo(-w * .28, -h * .24); ctx.quadraticCurveTo(0, -h * .14, w * .28, -h * .24); ctx.stroke(); });
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(-w * .2, -h * .86, w * .13, 4, -.2, 0, 7); ctx.fill();
  } else {
    ctx.fillStyle = PG; rr(ctx, -w / 2, -h, w, h, 20); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.fillRect(-w / 2 + 2, -h * .72, w - 4, 8); ctx.fillRect(-w / 2 + 2, -h * .3, w - 4, 8);
    for (let i = 0; i < 5; i++) { bolt(ctx, -w / 2 + 10 + i * (w - 20) / 4, -h * .72 + 4, 1.8); bolt(ctx, -w / 2 + 10 + i * (w - 20) / 4, -h * .3 + 4, 1.8); }
    ctx.fillStyle = 'rgba(120,52,20,.55)'; ctx.beginPath(); ctx.ellipse(w * .2, -h * .5, 10, 6, .4, 0, 7); ctx.fill();
  }
  if (R.decal && R.decal !== 'none') drawDecal(ctx, R.decal, R.accent || '#f0b20a', w, h, R.num, R.tally || 0);
  drawWear(ctx, R.wear || 0, w, h, (R.wseed || 7) + 3, 'torso');
  const hp = R.dmg.hpF;
  if (R.scratches && hp < .7) {
    const n = hp < .35 ? R.scratches.length : 3;
    for (let i = 0; i < n; i++) { const s = R.scratches[i]; ctx.strokeStyle = 'rgba(15,15,15,.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s.x * w, -s.y * h); ctx.lineTo(s.x * w + Math.cos(s.a) * s.l, -s.y * h + Math.sin(s.a) * s.l); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s.x * w + 1, -s.y * h + 1); ctx.lineTo(s.x * w + Math.cos(s.a) * s.l + 1, -s.y * h + Math.sin(s.a) * s.l + 1); ctx.stroke(); }
  }
  if (hp < .4) {
    ctx.fillStyle = '#0f1012'; ctx.beginPath(); ctx.moveTo(-w * .18, -h * .62); ctx.lineTo(w * .1, -h * .7); ctx.lineTo(w * .2, -h * .5); ctx.lineTo(w * .05, -h * .38); ctx.lineTo(-w * .22, -h * .45); ctx.closePath(); ctx.fill();
    wires(ctx, 0, -h * .58, 14, t);
    if (hp < .2) { const fl = .4 + Math.random() * .4; glow(ctx, '#ff7a2a', 16, () => { ctx.fillStyle = `rgba(255,140,40,${fl})`; ctx.beginPath(); ctx.arc(0, -h * .52, 5, 0, 7); ctx.fill(); }); }
  }
  if (R.dmg.heat > 75) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,80,20,${(R.dmg.heat - 75) / 100})`; rr(ctx, -w / 2, -h, w, h, 10); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
}

function drawHead(ctx, s, type, paint, R, t) {
  ctx.lineWidth = 2.5; ctx.strokeStyle = DARK;
  const PG = ctx.createLinearGradient(-s * .5, -s, s * .5, 0); PG.addColorStop(0, mixc(paint, 1, .3)); PG.addColorStop(.5, paint); PG.addColorStop(1, mixc(paint, 0, .38));
  ctx.fillStyle = '#33383e'; ctx.fillRect(-6, -8, 12, 10);
  const hf = R.dmg.head, flick = (R.dmg.glitch || hf < .25) ? (Math.random() < .35 ? .15 : 1) : 1;
  const eye = (col, fn) => { ctx.globalAlpha = flick; glow(ctx, col, 12, () => { ctx.fillStyle = R.dmg.glitch && Math.random() < .5 ? '#ffffff' : col; fn(); }); ctx.globalAlpha = 1; };
  if (type.indexOf('fab') === 0) { drawFabHead(ctx, s, (part('head', type) || {}).design || {}, paint, PG, R, t, eye); } else if (type === 'periscope') {
    ctx.fillStyle = '#7d858d'; rr(ctx, -s * .5, -s * .78, s * .2, s * .74, 4); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#5b626a'; ctx.fillRect(-s * .52, -s * .7, s * .24, 4);
    ctx.fillStyle = PG; rr(ctx, -s * .2, -s * .95, s * .36, s * .95, 5); ctx.fill(); ctx.stroke();
    rr(ctx, -s * .2, -s * 1.22, s * .7, s * .3, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(s * .48, -s * 1.07, s * .14, 0, 7); ctx.fill();
    eye('#4fe0ff', () => { ctx.beginPath(); ctx.arc(s * .5, -s * 1.07, s * .08, 0, 7); ctx.fill(); });
    for (const y of [-s * .3, -s * .62]) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-s * .2, y, s * .36, 4); bolt(ctx, -s * .1, y + 2, 1.6); bolt(ctx, s * .06, y + 2, 1.6); }
  } else if (type === 'flood') {
    ctx.fillStyle = '#1b1d20'; rr(ctx, -s * .55, -s * .86, s * 1.1, s * .78, 8); ctx.fill();
    const broken = R.dmg.head < .3;
    for (const x of [-s * .28, 0, s * .28]) { if (broken && x !== 0) { ctx.fillStyle = '#3a3f45'; ctx.beginPath(); ctx.arc(x, -s * .47, s * .14, 0, 7); ctx.fill(); continue; } eye('#fff1c2', () => { ctx.beginPath(); ctx.arc(x, -s * .47, s * .14, 0, 7); ctx.fill(); }); }
    ctx.strokeStyle = paint; ctx.lineWidth = 3.5; ctx.beginPath(); for (let i = 0; i < 6; i++) { const x = -s * .45 + i * s * .18; ctx.moveTo(x, -s * .86); ctx.lineTo(x, -s * .08); } ctx.stroke();
    ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; rr(ctx, -s * .55, -s * .86, s * 1.1, s * .78, 8); ctx.stroke();
    ctx.fillStyle = PG; rr(ctx, -s * .6, -s * .95, s * 1.2, s * .14, 4); ctx.fill(); ctx.stroke();
    if (!broken) { ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(s * .5, 0, s * 1.6, 0); g.addColorStop(0, 'rgba(255,240,190,.25)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(s * .5, -s * .7); ctx.lineTo(s * 1.6, -s * 1.0); ctx.lineTo(s * 1.6, s * .1); ctx.lineTo(s * .5, -s * .2); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
  } else if (type === 'anvil') {
    ctx.fillStyle = mixc('#3a3f45', 0, .1); ctx.beginPath(); ctx.moveTo(-s * .55, -s * .92); ctx.lineTo(s * .32, -s * .92); ctx.quadraticCurveTo(s * .7, -s * .9, s * .82, -s * .78); ctx.quadraticCurveTo(s * .55, -s * .72, s * .32, -s * .68); ctx.lineTo(s * .18, -s * .44); ctx.lineTo(s * .44, -s * .12); ctx.lineTo(s * .44, 0); ctx.lineTo(-s * .52, 0); ctx.lineTo(-s * .52, -s * .12); ctx.lineTo(-s * .28, -s * .44); ctx.lineTo(-s * .55, -s * .7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = PG; ctx.fillRect(-s * .5, -s * .3, s * .9, s * .1);
    ctx.fillStyle = '#16181b'; rr(ctx, -s * .05, -s * .64, s * .36, s * .1, 2); ctx.fill();
    eye('#ff4a3a', () => { ctx.fillRect(0, -s * .62, s * .26, s * .06); });
    ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(-s * .5, -s * .9, s * .8, 3);
  } else if (type === 'optic') {
    ctx.strokeStyle = '#9aa1a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-s * .2, -s * .9); ctx.lineTo(-s * .32, -s * 1.35); ctx.stroke();
    ctx.fillStyle = '#ff4a3a'; ctx.beginPath(); ctx.arc(-s * .32, -s * 1.38, 2.5, 0, 7); ctx.fill();
    ctx.fillStyle = '#c9cdd1'; ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; rr(ctx, -s * .5, -s * .95, s, s * .82, s * .38); ctx.fill(); ctx.stroke();
    ctx.fillStyle = PG; rr(ctx, -s * .5, -s * .95, s * .42, s * .82, [s * .38, 0, 0, s * .38]); ctx.fill();
    ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(s * .16, -s * .55, s * .24, 0, 7); ctx.fill();
    eye('#4fe0ff', () => { ctx.beginPath(); ctx.arc(s * .2, -s * .55, s * .12, 0, 7); ctx.fill(); });
  } else if (type === 'dome') {
    ctx.fillStyle = PG; ctx.beginPath(); ctx.moveTo(-s * .55, -4); ctx.lineTo(-s * .55, -s * .45); ctx.quadraticCurveTo(-s * .5, -s * .98, 0, -s * .98); ctx.quadraticCurveTo(s * .55, -s * .98, s * .6, -s * .45); ctx.lineTo(s * .6, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#16181b'; rr(ctx, -s * .05, -s * .56, s * .62, s * .2, 2); ctx.fill();
    eye('#ff5a2a', () => { ctx.fillRect(s * .12, -s * .5, s * .14, s * .08); ctx.fillRect(s * .34, -s * .5, s * .14, s * .08); });
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.moveTo(s * .05 + i * s * .13, -s * .28); ctx.lineTo(s * .05 + i * s * .13, -s * .1); } ctx.stroke();
    bolt(ctx, -s * .38, -s * .3, 2.5);
  } else if (type === 'halo') {
    ctx.fillStyle = PG; rr(ctx, -s * .45, -s * .88, s * .95, s * .82, s * .4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#16181b'; rr(ctx, s * .02, -s * .62, s * .44, s * .22, s * .11); ctx.fill();
    eye('#c9a6ff', () => { ctx.beginPath(); ctx.arc(s * .14, -s * .51, s * .06, 0, 7); ctx.arc(s * .34, -s * .51, s * .06, 0, 7); ctx.fill(); });
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(180,140,255,${.6 + Math.sin(t * 3) * .2})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, -s * 1.12 + Math.sin(t * 2) * 2, s * .42, s * .1, 0, 0, 7); ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
  } else if (type === 'visor') {
    ctx.fillStyle = PG; ctx.beginPath(); ctx.moveTo(-s * .5, -4); ctx.lineTo(-s * .45, -s * .8); ctx.lineTo(-s * .1, -s * .98); ctx.lineTo(s * .45, -s * .85); ctx.lineTo(s * .58, -s * .35); ctx.lineTo(s * .4, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = shade(paint, .35); ctx.beginPath(); ctx.moveTo(-s * .45, -s * .8); ctx.lineTo(-s * .62, -s * 1.15); ctx.lineTo(-s * .1, -s * .98); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.moveTo(-s * .1, -s * .62); ctx.lineTo(s * .55, -s * .58); ctx.lineTo(s * .52, -s * .44); ctx.lineTo(-s * .1, -s * .48); ctx.fill();
    eye('#ff3a4a', () => { ctx.fillRect(0, -s * .57, s * .5, s * .06); });
  } else if (type === 'furnace') {
    ctx.fillStyle = '#2b2f34'; ctx.fillRect(-s * .34, -s * 1.28, s * .17, s * .44); ctx.fillStyle = '#16181b'; ctx.fillRect(-s * .37, -s * 1.3, s * .23, s * .07);
    ctx.fillStyle = PG; rr(ctx, -s * .5, -s * .92, s * 1.04, s * .88, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#16181b'; rr(ctx, -s * .12, -s * .52, s * .6, s * .34, 3); ctx.fill();
    const fl = .55 + Math.random() * .35;
    glow(ctx, '#ff7a2a', 18, () => { ctx.fillStyle = `rgba(255,${110 + Math.random() * 70 | 0},30,${fl})`; rr(ctx, -s * .08, -s * .46, s * .52, s * .22, 2); ctx.fill(); });
    ctx.strokeStyle = '#3a3f45'; ctx.lineWidth = 2.5; ctx.beginPath(); for (let i = 0; i < 5; i++) { const x = -s * .05 + i * s * .12; ctx.moveTo(x, -s * .52); ctx.lineTo(x, -s * .18); } ctx.stroke();
    eye('#ffd24a', () => { ctx.fillRect(s * .02, -s * .76, s * .15, s * .08); ctx.fillRect(s * .28, -s * .76, s * .15, s * .08); });
    bolt(ctx, -s * .38, -s * .78); bolt(ctx, -s * .38, -s * .2); ctx.fillStyle = 'rgba(184,115,58,.8)'; ctx.fillRect(-s * .5, -s * .92, s * 1.04, 4);
  } else if (type === 'crt') {
    ctx.strokeStyle = '#9aa1a8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-s * .1, -s * .95); ctx.lineTo(-s * .38, -s * 1.32); ctx.moveTo(s * .06, -s * .95); ctx.lineTo(s * .28, -s * 1.3); ctx.stroke();
    ctx.fillStyle = '#d94a5a'; ctx.beginPath(); ctx.arc(-s * .38, -s * 1.34, 2.5, 0, 7); ctx.arc(s * .28, -s * 1.32, 2.5, 0, 7); ctx.fill();
    ctx.strokeStyle = DARK; ctx.lineWidth = 2.5; ctx.fillStyle = PG; rr(ctx, -s * .56, -s * .96, s * 1.12, s * .92, 8); ctx.fill(); ctx.stroke();
    const sx = -s * .4, sy = -s * .85, sw = s * .68, sh = s * .64;
    ctx.fillStyle = '#0b1611'; rr(ctx, sx, sy, sw, sh, 10); ctx.fill();
    crtFace(ctx, sx + 3, sy + 3, sw - 6, sh - 6, R);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.beginPath(); ctx.ellipse(sx + sw * .3, sy + sh * .2, sw * .22, sh * .08, -.3, 0, 7); ctx.fill();
    ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(s * .44, -s * .7, 3.5, 0, 7); ctx.arc(s * .44, -s * .5, 3.5, 0, 7); ctx.fill();
  } else if (type === 'cab') {
    ctx.fillStyle = PG; ctx.beginPath(); ctx.moveTo(-s * .5, -4); ctx.lineTo(-s * .5, -s * .92); ctx.lineTo(s * .28, -s * .92); ctx.lineTo(s * .6, -s * .5); ctx.lineTo(s * .6, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
    const gl = ctx.createLinearGradient(0, -s * .85, s * .5, -s * .35); gl.addColorStop(0, '#bfe6f0'); gl.addColorStop(1, '#24506a');
    ctx.fillStyle = gl; ctx.beginPath(); ctx.moveTo(-s * .06, -s * .84); ctx.lineTo(s * .25, -s * .84); ctx.lineTo(s * .51, -s * .5); ctx.lineTo(s * .51, -s * .36); ctx.lineTo(-s * .06, -s * .36); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(12,16,20,.78)'; ctx.beginPath(); ctx.arc(s * .17, -s * .62, s * .08, 0, 7); ctx.fill(); ctx.fillRect(s * .08, -s * .54, s * .18, s * .18); ctx.fillStyle = '#f0b20a'; ctx.beginPath(); ctx.arc(s * .17, -s * .66, s * .085, Math.PI, 0); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.beginPath(); ctx.moveTo(s * .02, -s * .82); ctx.lineTo(s * .1, -s * .82); ctx.lineTo(-s * .02, -s * .4); ctx.lineTo(-s * .06, -s * .4); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(-s * .5, -s * .3, s * .42, s * .15); ctx.clip(); ctx.fillStyle = '#16181b'; ctx.fillRect(-s * .5, -s * .3, s * .42, s * .15); ctx.fillStyle = '#f0b20a'; for (let i = -1; i < 5; i++) { const x = -s * .5 + i * s * .1; ctx.beginPath(); ctx.moveTo(x, -s * .15); ctx.lineTo(x + s * .05, -s * .15); ctx.lineTo(x + s * .12, -s * .3); ctx.lineTo(x + s * .07, -s * .3); ctx.fill(); } ctx.restore();
    const bl = (Math.sin(t * 8) + 1) / 2; glow(ctx, '#ff9a1a', 16 * bl, () => { ctx.fillStyle = `rgba(255,154,26,${.35 + bl * .65})`; rr(ctx, -s * .22, -s * 1.04, s * .22, s * .13, 3); ctx.fill(); });
  } else if (type === 'lantern') {
    ctx.fillStyle = '#2b2f34'; rr(ctx, -s * .38, -s * .22, s * .8, s * .22, 3); ctx.fill(); rr(ctx, -s * .3, -s * 1.04, s * .64, s * .15, 4); ctx.fill(); ctx.fillStyle = '#16181b'; ctx.fillRect(-s * .06, -s * 1.16, s * .16, s * .13);
    const fl = R.dmg.glitch ? Math.random() : .8 + Math.sin(t * 9) * .08 - (R.dmg.head < .3 ? Math.random() * .4 : 0);
    const bg = ctx.createRadialGradient(s * .02, -s * .56, 2, s * .02, -s * .56, s * .34); bg.addColorStop(0, `rgba(255,250,225,${fl})`); bg.addColorStop(.5, `rgba(143,216,255,${fl * .6})`); bg.addColorStop(1, 'rgba(143,216,255,.06)');
    glow(ctx, '#8fd8ff', 22 * fl, () => { ctx.fillStyle = bg; ctx.beginPath(); ctx.ellipse(s * .02, -s * .56, s * .32, s * .36, 0, 0, 7); ctx.fill(); });
    ctx.strokeStyle = '#fff1b8'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-s * .08, -s * .44); for (let i = 1; i < 6; i++) ctx.lineTo(-s * .08 + i * s * .04, -s * (.52 + (i % 2) * .08)); ctx.stroke();
    ctx.strokeStyle = PG; ctx.lineWidth = 3.5; ctx.beginPath(); for (let i = 0; i < 5; i++) { const x0 = -s * .27 + i * s * .14, bulge = x0 * .5; ctx.moveTo(x0, -s * .89); ctx.quadraticCurveTo(x0 + bulge, -s * .55, x0, -s * .22); } ctx.stroke();
    ctx.strokeStyle = DARK; ctx.lineWidth = 1; ctx.stroke();
  } else if (type === 'silo') {
    ctx.fillStyle = PG; rr(ctx, -s * .42, -s * 1.02, s * .9, s * .98, [s * .3, s * .3, 4, 4]); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#16181b'; rr(ctx, -s * .05, -s * .74, s * .5, s * .46, 3); ctx.fill();
    eye('#ffb21a', () => { ctx.fillRect(0, -s * .56, s * .4, s * .07); });
    ctx.strokeStyle = '#7d858d'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 5; i++) { const x = -s * .01 + i * s * .11; ctx.moveTo(x, -s * .74); ctx.lineTo(x, -s * .28); } ctx.stroke();
    ctx.fillStyle = shade(paint, .3); ctx.fillRect(-s * .42, -s * .2, s * .9, 4);
  } else if (type === 'bosun') {
    ctx.fillStyle = PG; ctx.beginPath(); ctx.arc(0, -s * .5, s * .52, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c9a24a'; ctx.beginPath(); ctx.arc(s * .16, -s * .52, s * .27, 0, 7); ctx.fill();
    ctx.fillStyle = '#0f1a24'; ctx.beginPath(); ctx.arc(s * .16, -s * .52, s * .2, 0, 7); ctx.fill();
    eye('#9fe8ff', () => { ctx.beginPath(); ctx.arc(s * .2, -s * .52, s * .08, 0, 7); ctx.fill(); });
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; bolt(ctx, s * .16 + Math.cos(a) * s * .235, -s * .52 + Math.sin(a) * s * .235, 1.4); }
    ctx.fillStyle = shade(paint, .3); ctx.fillRect(-s * .45, -s * .14, s * .9, 5);
  } else if (type === 'lumen') {
    ctx.fillStyle = PG; ctx.beginPath(); ctx.ellipse(s * .02, -s * .52, s * .44, s * .5, 0, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#16181b'; rr(ctx, s * .18, -s * .82, s * .12, s * .5, s * .06); ctx.fill();
    eye('#3fb6a8', () => { rr(ctx, s * .2, -s * .78, s * .08, s * .42, s * .04); ctx.fill(); });
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.beginPath(); ctx.ellipse(-s * .16, -s * .8, s * .12, s * .06, -.4, 0, 7); ctx.fill();
  } else {
    ctx.fillStyle = PG; ctx.beginPath(); ctx.moveTo(-s * .48, -4); ctx.lineTo(-s * .38, -s * .95); ctx.lineTo(s * .42, -s * .95); ctx.lineTo(s * .52, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-s * .4, -s * .95, s * .84, 5);
    ctx.fillStyle = '#16181b'; rr(ctx, -s * .2, -s * .62, s * .66, s * .16, 3); ctx.fill();
    eye('#ffb21a', () => { rr(ctx, -s * .12, -s * .58, s * .52, s * .08, 2); ctx.fill(); });
    bolt(ctx, -s * .28, -s * .25); bolt(ctx, s * .36, -s * .25);
  }
  if (R.wear) { ctx.save(); ctx.translate(s * .05, 0); drawWear(ctx, Math.max(0, R.wear - 1), s * .8, s * .9, (R.wseed || 7) + 11, 'head'); ctx.restore(); }
  if (hf < .5) { ctx.strokeStyle = 'rgba(10,10,10,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s * .3, -s * .9); ctx.lineTo(s * .1, -s * .6); ctx.lineTo(s * .25, -s * .4); ctx.moveTo(s * .1, -s * .6); ctx.lineTo(-s * .15, -s * .55); ctx.stroke(); }
}

function drawDecal(ctx, kind, col, w, h, num, tally) {
  const x0 = -w * .22, x1 = w * .22, y0 = -h * .82, y1 = -h * .3, cw = x1 - x0, ch = y1 - y0;
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, cw, ch); ctx.clip(); ctx.globalAlpha = .85; ctx.fillStyle = col; ctx.strokeStyle = col;
  if (kind === 'stripe') { ctx.fillRect(x0 + cw * .2, y0, cw * .16, ch); ctx.fillRect(x0 + cw * .46, y0, cw * .16, ch); }
  else if (kind === 'chevron') { ctx.lineWidth = 5; for (let i = 0; i < 2; i++) { const y = y0 + ch * (.3 + i * .34); ctx.beginPath(); ctx.moveTo(x0 + cw * .1, y + ch * .18); ctx.lineTo(x0 + cw * .5, y - ch * .02); ctx.lineTo(x0 + cw * .9, y + ch * .18); ctx.stroke(); } }
  else if (kind === 'checker') { const n = 5, sz = cw / n; for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++) if ((i + j) % 2 === 0) ctx.fillRect(x0 + i * sz, y0 + ch * .38 + j * sz, sz, sz); }
  else if (kind === 'bolt') { ctx.beginPath(); ctx.moveTo(x0 + cw * .62, y0 + 2); ctx.lineTo(x0 + cw * .25, y0 + ch * .56); ctx.lineTo(x0 + cw * .5, y0 + ch * .56); ctx.lineTo(x0 + cw * .36, y1 - 2); ctx.lineTo(x0 + cw * .78, y0 + ch * .42); ctx.lineTo(x0 + cw * .53, y0 + ch * .42); ctx.closePath(); ctx.fill(); }
  else if (kind === 'ring') { ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, y0 + ch * .5, Math.min(cw, ch) * .36, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, y0 + ch * .5, Math.min(cw, ch) * .13, 0, 7); ctx.fill(); }
  else if (kind === 'flame') { ctx.globalAlpha = .9; for (let i = 0; i < 4; i++) { const bx = x0 + cw * (.12 + i * .22), hh = ch * (.55 + (i % 2) * .3); ctx.beginPath(); ctx.moveTo(bx - cw * .1, y1); ctx.quadraticCurveTo(bx - cw * .12, y1 - hh * .6, bx + cw * .04, y1 - hh); ctx.quadraticCurveTo(bx, y1 - hh * .45, bx + cw * .12, y1); ctx.closePath(); ctx.fill(); } ctx.fillStyle = 'rgba(255,220,120,.6)'; for (let i = 0; i < 4; i++) { const bx = x0 + cw * (.12 + i * .22); ctx.beginPath(); ctx.moveTo(bx - cw * .04, y1); ctx.quadraticCurveTo(bx - cw * .05, y1 - ch * .25, bx + cw * .02, y1 - ch * .38); ctx.quadraticCurveTo(bx + cw * .02, y1 - ch * .15, bx + cw * .06, y1); ctx.closePath(); ctx.fill(); } }
  else if (kind === 'shark') { ctx.globalAlpha = 1; ctx.fillStyle = '#7a1a1a'; ctx.beginPath(); ctx.moveTo(x0, y0 + ch * .45); ctx.quadraticCurveTo(0, y0 + ch * .3, x1, y0 + ch * .45); ctx.quadraticCurveTo(0, y1 + ch * .2, x0, y0 + ch * .45); ctx.fill(); ctx.fillStyle = '#f2f4f5'; const n = 7; ctx.beginPath(); for (let i = 0; i < n; i++) { const x = x0 + cw * (i + .5) / n; ctx.moveTo(x - cw / n / 2, y0 + ch * .42); ctx.lineTo(x, y0 + ch * .62); ctx.lineTo(x + cw / n / 2, y0 + ch * .42); } ctx.fill(); ctx.beginPath(); for (let i = 0; i < n - 1; i++) { const x = x0 + cw * (i + 1) / n; ctx.moveTo(x - cw / n / 2, y0 + ch * .86); ctx.lineTo(x, y0 + ch * .68); ctx.lineTo(x + cw / n / 2, y0 + ch * .86); } ctx.fill(); ctx.fillStyle = '#16181b'; ctx.beginPath(); ctx.arc(x0 + cw * .14, y0 + ch * .22, ch * .07, 0, 7); ctx.fill(); }
  else if (kind === 'tally') { const n = Math.max(1, Math.min(15, tally || 0)); ctx.lineWidth = 2.5; ctx.lineCap = 'round'; for (let g = 0; g * 5 < n; g++) { const gx = x0 + cw * .08 + g * cw * .32, cnt = Math.min(5, n - g * 5); for (let i = 0; i < Math.min(4, cnt); i++) { ctx.beginPath(); ctx.moveTo(gx + i * cw * .055, y0 + ch * .25); ctx.lineTo(gx + i * cw * .055, y0 + ch * .75); ctx.stroke(); } if (cnt === 5) { ctx.beginPath(); ctx.moveTo(gx - cw * .02, y0 + ch * .7); ctx.lineTo(gx + cw * .2, y0 + ch * .3); ctx.stroke(); } } ctx.lineCap = 'butt'; }
  else if (kind === 'number') { const m = ctx.getTransform(); if (m.a * m.d - m.b * m.c < 0) ctx.scale(-1, 1); ctx.font = `600 ${ch * .95}px Teko, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(num == null ? 7 : num), 0, y0 + ch * .56); }
  ctx.restore();
}
const FULL = { hpF: 1, head: 1, lead: 1, rear: 1, legs: 1, lost: { head: false, lead: false, rear: false }, glitch: false, heat: 0 };
const WORKBOOK_VISUAL_MATERIALS = { ferrous:'#858b90', alloy:'#93a8b2', hydraulics:'#a66d43', electronics:'#4d94aa', ceramic:'#c3b99f', composite:'#688777', rubber:'#343a3e', polymer:'#6d8192' };
function workbookVisualRow(workbook, key) { return workbook?.report?.selected?.find(row => row.key === key) || null; }
function workbookVisualState(workbook, key, row) {
  const stateKey = ({ torsoCore:'torso', leadArm:'lead', rearArm:'rear' })[key] || key;
  return workbook?.partWear?.[stateKey] || row?.item?.state || {};
}
function workbookVisualMounted(workbook, key, conditionRatio = null) {
  const row = workbookVisualRow(workbook, key), state = workbookVisualState(workbook, key, row), current = +state.condition, live = conditionRatio !== null && Number.isFinite(+conditionRatio) ? Math.max(0, Math.min(100, +conditionRatio * 100)) : NaN;
  const visualState = Number.isFinite(live) ? { ...state, condition: Number.isFinite(current) ? Math.min(current, live) : live } : state;
  return row && !visualState.detached ? { row, state:visualState } : null;
}
function drawWorkbookMount(ctx, row, x, y, w, h, angle = 0, state = {}) {
  if (!row || !row.def || state.detached || !(w > 4 && h > 4)) return;
  const mat = String(row.def.material || '').toLowerCase(), color = Object.keys(WORKBOOK_VISUAL_MATERIALS).find(key => mat.includes(key));
  const base = color ? WORKBOOK_VISUAL_MATERIALS[color] : '#8c8f8a', maker = BRANDS[row.def.phase1BFactionCode]?.col || base, slot = String(row.def.slot || '').toLowerCase();
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle);
  const cut = Math.min(w * .2, h * .25), edge = '#15171a';
  ctx.beginPath(); ctx.moveTo(-w / 2 + cut, -h / 2); ctx.lineTo(w / 2 - cut, -h / 2); ctx.lineTo(w / 2, -h / 2 + cut); ctx.lineTo(w / 2, h / 2 - cut); ctx.lineTo(w / 2 - cut, h / 2); ctx.lineTo(-w / 2 + cut, h / 2); ctx.lineTo(-w / 2, h / 2 - cut); ctx.lineTo(-w / 2, -h / 2 + cut); ctx.closePath();
  const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2); grad.addColorStop(0, mixc(base, 1, .28)); grad.addColorStop(.45, base); grad.addColorStop(1, mixc(base, 0, .36)); ctx.fillStyle = grad; ctx.strokeStyle = edge; ctx.lineWidth = Math.max(1.25, Math.min(2.2, h * .1)); ctx.fill(); ctx.stroke();
  ctx.fillStyle = maker; ctx.fillRect(-w * .34, -h * .3, Math.max(2, w * .1), h * .6);
  if (slot === 'cooling') { ctx.strokeStyle = '#252a2e'; ctx.lineWidth = Math.max(1, h * .08); for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-w * .16, i * h * .2); ctx.lineTo(w * .28, i * h * .2); ctx.stroke(); } }
  else if (slot === 'power cell') { ctx.fillStyle = '#202529'; rr(ctx, -w * .12, -h * .26, w * .42, h * .52, 2); ctx.fill(); ctx.fillStyle = maker; ctx.fillRect(-w * .06, -h * .12, w * .3, Math.max(2, h * .08)); }
  else if (slot.includes('firmware') || slot.includes('optics')) { ctx.strokeStyle = '#273034'; ctx.lineWidth = 1; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * w * .13, -h * .3); ctx.lineTo(i * w * .13, -h * .46); ctx.moveTo(i * w * .13, h * .3); ctx.lineTo(i * w * .13, h * .46); ctx.stroke(); } ctx.fillStyle = maker; ctx.fillRect(-w * .14, -h * .1, w * .3, Math.max(2, h * .2)); }
  else if (slot === 'armor plate') { ctx.strokeStyle = mixc(base, 1, .45); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-w * .22, 0); ctx.lineTo(w * .18, 0); ctx.lineTo(w * .34, h * .22); ctx.stroke(); }
  else { ctx.strokeStyle = 'rgba(20,24,27,.65)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-w * .18, -h * .12); ctx.lineTo(w * .25, -h * .12); ctx.moveTo(-w * .18, h * .12); ctx.lineTo(w * .25, h * .12); ctx.stroke(); }
  bolt(ctx, -w * .35, -h * .3, Math.max(1.2, Math.min(2, h * .1))); bolt(ctx, w * .35, h * .3, Math.max(1.2, Math.min(2, h * .1)));
  if (Number.isFinite(+state.condition) && +state.condition < 35) { ctx.strokeStyle = 'rgba(15,17,19,.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-w * .16, -h * .34); ctx.lineTo(w * .02, -h * .04); ctx.lineTo(-w * .08, h * .3); ctx.stroke(); }
  ctx.restore();
}
function drawWorkbookBackModules(ctx, D, workbook) {
  for (let i = 1; i <= 4; i++) { const key = `back${i}`, mounted = workbookVisualMounted(workbook, key); if (!mounted) continue; drawWorkbookMount(ctx, mounted.row, -D.T.w * .5 - 3, -D.T.h * (.88 - (i - 1) * .18), 15, 14, -.08, mounted.state); }
}
function drawWorkbookTorsoModules(ctx, D, workbook, dm = {}) {
  if (!workbook?.report?.selected?.length) return;
  const w = D.T.w, h = D.T.h, core = workbookVisualMounted(workbook, 'torsoCore', dm.hpF);
  if (core) drawWorkbookMount(ctx, core.row, w * .13, -h * .52, Math.min(28, w * .34), Math.min(22, h * .24), -.04, core.state);
  const platePoints = [[-.34,-.7],[.35,-.7],[-.34,-.34],[.35,-.34]];
  for (let i = 1; i <= 4; i++) { const key = `plate${i}`, mounted = workbookVisualMounted(workbook, key), pt = platePoints[i - 1]; if (mounted) drawWorkbookMount(ctx, mounted.row, w * pt[0], -h * -pt[1], w * .22, h * .15, pt[0] < 0 ? -.12 : .12, mounted.state); }
  const accessorySlots = [
    ['powerCell',-.22,-.54,.23,.27,0], ['cooling',-.2,-.82,.27,.16,-.08], ['firmware',.24,-.82,.23,.16,0], ['firmware2',.24,-.6,.23,.16,0], ['optics',.25,-.39,.22,.16,.05],
    ['utility1',-.27,-.18,.2,.13,0], ['utility2',-.04,-.18,.2,.13,0], ['utility3',.19,-.18,.2,.13,0], ['utility4',.35,-.02,.17,.13,0]
  ];
  for (const [key, px, py, pw, ph, angle] of accessorySlots) { const mounted = workbookVisualMounted(workbook, key); if (mounted) drawWorkbookMount(ctx, mounted.row, w * px, h * py, w * pw, h * ph, angle, mounted.state); }
  const frame = workbook.frame, frameItem = workbook.frameItem, maker = BRANDS[frame?.b]?.col || '#9aa1a8';
  if (frame) { ctx.strokeStyle = '#171a1d'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w * .4, -h * .06); ctx.lineTo(w * .39, -h * .06); ctx.stroke(); ctx.strokeStyle = maker; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-w * .4, -h * .06); ctx.lineTo(w * .39, -h * .06); ctx.stroke();
    const ribs = Math.min(3, Math.max(0, Math.floor(+frameItem?.reinforcements || 0))); ctx.strokeStyle = '#c3c8cb'; ctx.lineWidth = 2; for (let i = 0; i < ribs; i++) { const x = -w * .25 + i * w * .2; ctx.beginPath(); ctx.moveTo(x, -h * .12); ctx.lineTo(x + 4, h * .01); ctx.stroke(); }
  }
}
function drawRobot(ctx, R) {
  const b = R.build, D = dims(b), P = R.pose, paint = R.paint, sc = R.scale || 1, dm = R.dmg || FULL, t = R.t || 0, workbook = R.workbookCombat || null;
  R.dmg = dm; R.mood = moodOf(R.st, dm); CUR_WEAR = R.wear || 0; CUR_WSEED = R.wseed || 7;
  const hipY = hipOf(b, D, P), fl = legAng(b, P.fl), bl = legAng(b, P.bl);
  ctx.save(); ctx.translate(R.x, R.ground);
  ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.ellipse(-P.fall * 70 * R.dir * sc, 1, (52 + P.fall * 70) * sc, 8 * sc, 0, 0, 7); ctx.fill();
  ctx.scale(R.dir * sc, sc);
  if (P.jit) ctx.translate((Math.random() - .5) * 2.5, 0);
  if (P.fall) { ctx.translate(-26, 0); ctx.rotate(-P.fall * 1.45); ctx.translate(26, -P.fall * 4); }
  const shY = -D.T.h + 16, lsx = D.T.w * .24, rsx = D.T.w * .04;
  if (b.back && b.back !== 'none' || workbook?.report?.selected?.some(row => /^back[1-4]$/.test(row.key))) { ctx.save(); ctx.translate(0, hipY); ctx.rotate(P.lean); if (b.back && b.back !== 'none') drawBack(ctx, b.back, D, paint, t, dm.heat || 0); drawWorkbookBackModules(ctx, D, workbook); ctx.restore(); }
  if (!dm.lost.rear) { ctx.save(); ctx.translate(0, hipY); ctx.rotate(P.lean); drawArm(ctx, D, b, rsx, shY, P.rear, true, paint, 'upper', dm.rear, t, 'rear', workbook); ctx.restore(); }
  if (D.L.foot === 'wheel') drawWheel(ctx, D, hipY, P, paint, dm.legs, t);
  else { drawLeg(ctx, D, b, -8, hipY, bl, true, paint, dm.legs, t, workbook); drawLeg(ctx, D, b, 8, hipY, fl, false, paint, dm.legs, t, workbook); }
  ctx.fillStyle = '#2c3136'; rr(ctx, -D.T.w * .32, hipY - 6, D.T.w * .64, 16, 5); ctx.fill();
  ctx.save(); ctx.translate(0, hipY); ctx.rotate(P.lean);
  drawTorso(ctx, D, b, paint, R, t);
  drawWorkbookTorsoModules(ctx, D, workbook, dm);
  if (!dm.lost.rear) drawArm(ctx, D, b, rsx, shY, P.rear, true, paint, 'fore', dm.rear, t, 'rear', workbook); else stump(ctx, rsx - 4, shY, 8, t);
  ctx.save(); ctx.translate(D.T.w * .06, -D.T.h - 2); ctx.rotate(P.lean * .6);
  if (!dm.lost.head) { drawHead(ctx, D.H, b.head, paint, R, t); const head = workbookVisualMounted(workbook, 'head', dm.head); if (head) drawWorkbookMount(ctx, head.row, D.H * .23, -D.H * .38, D.H * .42, D.H * .2, .04, head.state); } else stump(ctx, 0, -2, 9, t);
  ctx.restore();
  if (!dm.lost.lead) drawArm(ctx, D, b, lsx, shY, P.lead, false, paint, 'all', dm.lead, t, 'lead', workbook); else stump(ctx, lsx, shY, 9, t);
  if (R.flash > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,255,255,${R.flash * .45})`; rr(ctx, -D.T.w / 2, -D.T.h, D.T.w, D.T.h, 10); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore(); ctx.restore(); CUR_WEAR = 0;
}
function makeScratches(seed) { const r = mulberry32(seed); return Array.from({ length: 7 }, () => ({ x: (r() - .5) * .7, y: .2 + r() * .65, a: r() * 3, l: 8 + r() * 16 })); }


