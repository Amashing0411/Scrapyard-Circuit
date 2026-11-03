/* ---- venues6.js ---- */
/* ---------- arena: static layers ---------- */
const cv = $('#arenaCanvas'), ctx = cv.getContext('2d');
const W = 960, H = 480, GROUND = 420;
let aScale = 1, G = null, seedN = 1;
const layerBack = document.createElement('canvas'), layerRing = document.createElement('canvas'), layerFront = document.createElement('canvas');
let CROWD = [], ringRopes = null;
const VENUES = {
  lot: { name: 'Scrapyard Lot', desc: 'Dusk behind the salvage yard. Dirt floor, a ring of tires, folks watching from car roofs.', when: 'Friday · 7:40 PM', crowd: 'About 200 locals', tag: 'Where everybody starts', size: .25, key: 'outdoor' },
  drain: { name: 'The Drain', desc: 'A storm drain turned fight club. Chain-link cage, fire barrels, standing room only.', when: 'Saturday · 1:15 AM', crowd: '900, standing', tag: 'Underground · cash only', size: .5, key: 'tunnel' },
  harbor: { name: 'Harbor Pit', desc: 'Pier 9 after midnight. Stacked containers, fog off the water, mooring lines for ropes.', when: 'Thursday · 11:50 PM', crowd: 'Dock crews, 600', tag: 'Fog, salt and steel', size: .4, key: 'outdoor' },
  foundry: { name: 'Foundry Floor', desc: 'A retired steelworks. Mill crews watch from behind the safety rails while the furnace paints the ring amber.', when: 'Sunday · 9:20 PM', crowd: 'Mill crews and night-shift regulars', tag: 'Hot steel · hard hats', size: .65, key: 'industrial' },
  arena: { name: 'Regional Arena', desc: 'Real seats, LED boards and a paying crowd.', when: 'Saturday · 8:30 PM', crowd: '8,400 seats', tag: 'The big leagues start here', size: .75, key: 'hall' },
  dome: { name: 'Crown Dome', desc: 'The championship stage. Sixty thousand seats, lasers and a jumbotron.', when: 'Championship night · 9:00 PM', crowd: '60,000 sold out', tag: 'Championship stage', size: 1, key: 'hall' },
};
const CROWD_PROFILES = {
  lot:     { beds: ['audio/commentary/arena-crowd-a.mp3', 'audio/commentary/crowd-beds/fight-night-crowd-01-mixlevel.mp3'], mixA: .82, rateA: 1.025, rateB: .985, maleRate: .99, femaleRate: 1.045, shoutGain: .20, air: 3900, room: .16, spread: .72 },
  drain:   { beds: ['audio/commentary/arena-crowd-b.mp3', 'audio/commentary/crowd-beds/fight-night-crowd-02-mixlevel.mp3'], mixA: .60, rateA: .92,   rateB: .955, maleRate: .93, femaleRate: .98,   shoutGain: .18, air: 2450, room: .48, spread: .34 },
  harbor:  { beds: ['audio/commentary/crowd-beds/fight-night-crowd-03-mixlevel.mp3', 'audio/commentary/arena-crowd-a.mp3'], mixA: .38, rateA: 1.045, rateB: 1.015, maleRate: 1.04, femaleRate: 1.08,  shoutGain: .19, air: 3400, room: .28, spread: .88 },
  foundry: { beds: ['audio/commentary/crowd-beds/fight-night-crowd-04-mixlevel.mp3', 'audio/commentary/arena-crowd-b.mp3'], mixA: .54, rateA: .955,  rateB: 1.025, maleRate: .92, femaleRate: 1.00,  shoutGain: .21, air: 2950, room: .40, spread: .48 },
  arena:   { beds: ['audio/commentary/crowd-beds/fight-night-crowd-01-mixlevel.mp3', 'audio/commentary/crowd-beds/fight-night-crowd-03-mixlevel.mp3'], mixA: .52, rateA: 1.00,  rateB: 1.035, maleRate: 1.02, femaleRate: 1.055, shoutGain: .18, air: 4600, room: .31, spread: .76 },
  dome:    { beds: ['audio/commentary/crowd-beds/fight-night-crowd-02-mixlevel.mp3', 'audio/commentary/crowd-beds/fight-night-crowd-04-mixlevel.mp3'], mixA: .34, rateA: .965,  rateB: .925, maleRate: .95, femaleRate: 1.00,  shoutGain: .16, air: 2950, room: .62, spread: .96 },
};
const LEAGUE_VENUE = ['lot', 'drain', 'arena', 'dome'];
let curVenue = '', VFX = { barrels: [], bulbs: [], blink: [], phones: [] };
/* ---- crowd: people are pre-drawn into one atlas per venue (12 looks x 3 distances x 3 poses) so a sold-out dome stays cheap ---- */
const CROWD_LOOKS = {
  lot: { rim: '255,178,104', shade: '26,18,14', heads: ['cap', 'hair', 'long', 'cap', 'beanie', 'bald'], tops: ['#4d3b2c', '#3b4650', '#5c3528', '#334033', '#574a30', '#6b6358', '#2f3a48', '#65462c'] },
  drain: { rim: '126,214,190', shade: '12,18,16', heads: ['hood', 'hood', 'beanie', 'hair', 'long', 'bald'], tops: ['#25292b', '#33383a', '#1f3036', '#40303a', '#2c3a2e', '#4a3a24', '#363040', '#28343c'] },
  harbor: { rim: '150,190,230', shade: '10,20,36', heads: ['beanie', 'beanie', 'cap', 'hair', 'hood', 'bald'], tops: ['#24384d', '#2c3f4a', '#7a6324', '#6a3a2a', '#35424a', '#40505a', '#1f2c3c', '#4d5a3a'], vest: '#b8742a' },
  foundry: { rim: '255,168,84', shade: '26,16,10', heads: ['hardhat', 'hardhat', 'hardhat', 'hair', 'cap', 'bald'], tops: ['#3a4048', '#4c3a2a', '#2e3640', '#5a4630', '#40362e', '#343a34', '#4a4038', '#2a3038'], vest: '#b8642a' },
  arena: { rim: '236,238,245', shade: '16,18,26', heads: ['hair', 'long', 'cap', 'hair', 'bald', 'beanie'], tops: ['#7a2c2c', '#2c4a70', '#454a52', '#d8d4c8', '#33363c', '#6a5a2a', '#2c5a52', '#54406a'] },
  dome: { rim: '240,206,120', shade: '10,11,20', heads: ['hair', 'long', 'cap', 'hair', 'bald', 'hair'], tops: ['#8a7220', '#7a2630', '#24406a', '#d8d4c8', '#2e3038', '#3c3f48', '#8a7220', '#7a2630'] },
};
const CROWD_SKIN = ['#e2b999', '#c98e66', '#9a6744', '#6b452f', '#f0cdb0', '#4f3325'], CROWD_HAIR = ['#1a1412', '#2e2018', '#4a3020', '#6a5a4a', '#141418'], CROWD_HATS = ['#b8a040', '#b8b4a8', '#b86a2a'];
const CROWD_CELL = [120, 150], CROWD_ANCHOR = [60, 62], CROWD_R = 20;
let crowdAtlas = null, crowdAtlasVenue = '';
function drawFan(c, x, y, look, skin, hair, top, kind, wide, vest, hat, rim, pose) {
  const R = CROWD_R, sh = R * wide, neck = y + R * .85, chest = neck + R * .32, foot = y + R * 3.7;
  const arm = (side, up) => { const sx = x + side * sh * .86, sy = chest + R * .22; c.strokeStyle = top; c.lineWidth = R * .62; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); if (up) c.lineTo(sx + side * R * .42, y - R * 1.5); else c.lineTo(sx + side * R * .16, foot); c.stroke(); if (up) { c.fillStyle = skin; c.beginPath(); c.arc(sx + side * R * .46, y - R * 1.78, R * .36, 0, 7); c.fill(); } };
  if (kind === 'long') { c.fillStyle = hair; c.beginPath(); c.moveTo(x - R * 1.04, y - R * .2); c.lineTo(x - R * 1.14, y + R * 1.5); c.lineTo(x + R * 1.14, y + R * 1.5); c.lineTo(x + R * 1.04, y - R * .2); c.arc(x, y - R * .2, R * 1.04, 0, Math.PI, true); c.fill(); }
  arm(-1, pose === 2); arm(1, pose >= 1);
  c.fillStyle = top; c.beginPath(); c.moveTo(x - R * .4, neck); c.quadraticCurveTo(x - sh, neck + R * .08, x - sh, chest + R * .5); c.lineTo(x - sh * .92, foot); c.lineTo(x + sh * .92, foot); c.lineTo(x + sh, chest + R * .5); c.quadraticCurveTo(x + sh, neck + R * .08, x + R * .4, neck); c.closePath(); c.fill();
  if (vest) { c.fillStyle = vest; c.fillRect(x - sh * .78, chest + R * .95, sh * 1.56, R * .42); c.fillRect(x - sh * .78, chest + R * 1.75, sh * 1.56, R * .42); }
  c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.moveTo(x - R * .08, chest); c.lineTo(x + sh * .95, chest + R * .3); c.lineTo(x + sh * .88, foot); c.lineTo(x - R * .08, foot); c.closePath(); c.fill();
  c.fillStyle = skin; c.fillRect(x - R * .34, y + R * .55, R * .68, R * .55);
  if (kind === 'hood') { c.fillStyle = top; c.beginPath(); c.arc(x, y - R * .06, R * 1.34, 0, 7); c.fill(); }
  c.fillStyle = skin; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill();
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(x, y, R, -Math.PI * .42, Math.PI * .42); c.quadraticCurveTo(x + R * .22, y, x + R * .3, y - R * .95); c.fill();
  if (kind === 'hair' || kind === 'long') { c.fillStyle = hair; c.beginPath(); c.arc(x, y - R * .08, R * 1.04, Math.PI * 1.02, Math.PI * 1.98); c.quadraticCurveTo(x, y - R * .62, x - R * 1.04, y - R * .04); c.fill(); }
  else if (kind === 'cap') { c.fillStyle = hat; c.beginPath(); c.arc(x, y - R * .2, R * 1.03, Math.PI, 0); c.closePath(); c.fill(); c.fillRect(x - R * 1.32, y - R * .3, R * 2.1, R * .24); }
  else if (kind === 'beanie') { c.fillStyle = hat; c.beginPath(); c.arc(x, y - R * .18, R * 1.08, Math.PI, 0); c.lineTo(x + R * 1.08, y - R * .02); c.lineTo(x - R * 1.08, y - R * .02); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - R * 1.08, y - R * .3, R * 2.16, R * .28); }
  else if (kind === 'hardhat') { c.fillStyle = hat; c.beginPath(); c.arc(x, y - R * .24, R * 1.08, Math.PI, 0); c.closePath(); c.fill(); c.fillRect(x - R * 1.42, y - R * .3, R * 2.84, R * .24); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(x - R * .14, y - R * 1.3, R * .28, R * 1.02); }
  c.strokeStyle = `rgba(${rim},.5)`; c.lineWidth = R * .13; c.lineCap = 'round'; c.beginPath(); c.arc(x, y - (kind === 'hood' ? R * .06 : 0), kind === 'hood' ? R * 1.34 : R * 1.06, Math.PI * 1.2, Math.PI * 1.8); c.moveTo(x - sh * .94, chest + R * .32); c.quadraticCurveTo(x - sh * .9, neck + R * .1, x - R * .46, neck + R * .03); c.moveTo(x + R * .46, neck + R * .03); c.quadraticCurveTo(x + sh * .9, neck + R * .1, x + sh * .94, chest + R * .32); c.stroke();
}
function buildCrowdAtlas(r) {
  const v = curVenue, look = CROWD_LOOKS[v] || CROWD_LOOKS.arena, [cw, ch] = CROWD_CELL, [ax, ay] = CROWD_ANCHOR;
  if (!crowdAtlas) { crowdAtlas = document.createElement('canvas'); crowdAtlas.width = cw * 12; crowdAtlas.height = ch * 9; }
  const c = crowdAtlas.getContext('2d'); c.clearRect(0, 0, crowdAtlas.width, crowdAtlas.height); crowdAtlasVenue = v;
  for (let a = 0; a < 12; a++) {
    const pick = list => list[r() * list.length | 0], skin = pick(CROWD_SKIN), hair = pick(CROWD_HAIR), top = look.tops[a % look.tops.length], kind = look.heads[a % look.heads.length], wide = 1.22 + r() * .5, vest = look.vest && r() < .3 ? look.vest : null, hat = kind === 'hardhat' ? pick(CROWD_HATS) : kind === 'cap' || kind === 'beanie' ? pick(look.tops) : hair;
    for (let tone = 0; tone < 3; tone++) for (let pose = 0; pose < 3; pose++) {
      const cx = a * cw, cy = (tone * 3 + pose) * ch; c.save(); c.beginPath(); c.rect(cx, cy, cw, ch); c.clip();
      drawFan(c, cx + ax, cy + ay, look, skin, hair, top, kind, wide, vest, hat, look.rim, pose);
      c.globalCompositeOperation = 'source-atop'; c.fillStyle = `rgba(${look.shade},${[.76, .6, .46][tone]})`; c.fillRect(cx, cy, cw, ch); c.restore();
    }
  }
}
function makeCrowd(r, rows, y0, rowH, base, step, sizeBase, pal, density) {
  if (crowdAtlasVenue !== curVenue) buildCrowdAtlas(r);
  for (let row = 0; row < rows; row++) { const n = base + row * step, tone = rows < 2 ? 2 : Math.min(2, Math.floor((row / (rows - 1)) * 2.999)); for (let i = 0; i < n; i++) { if (r() > density) continue; CROWD.push({ x: (i + r() * .8) * (W / n) - 4, y: y0 + row * rowH + r() * 4, s: sizeBase + row * sizeBase * .12 + r() * 2, look: r() * 12 | 0, tone, ph: r() * 6.28, sp: 6 + r() * 6, ex: r(), row }); } }
}
function chainFence(c, x, y, w, h, a) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = `rgba(170,180,175,${a})`; c.lineWidth = 1.2; for (let i = -h; i < w; i += 14) { c.beginPath(); c.moveTo(x + i, y + h); c.lineTo(x + i + h, y); c.moveTo(x + i, y); c.lineTo(x + i + h, y + h); c.stroke(); } c.strokeStyle = `rgba(120,130,125,${Math.min(1, a * 2.4)})`; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x + w, y + 2); c.stroke(); c.restore(); }
function drawBarrel(c, x, y) { c.fillStyle = '#3a2a1e'; rr(c, x - 18, y - 46, 36, 46, 4); c.fill(); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x - 18, y - 34, 36, 4); c.fillRect(x - 18, y - 16, 36, 4); c.fillStyle = '#120c08'; c.beginPath(); c.ellipse(x, y - 46, 18, 5, 0, 0, 7); c.fill(); }
function buildLayers(v) {
  v = VENUES[v] ? v : 'arena'; curVenue = v;
  [layerBack, layerRing, layerFront].forEach(c => { c.width = W; c.height = H; });
  const b = layerBack.getContext('2d'), rg = layerRing.getContext('2d'), fr = layerFront.getContext('2d'), r = mulberry32(42 + v.length * 7);
  CROWD = []; VFX = { barrels: [], bulbs: [], blink: [], phones: [] };
  let g;
  if (v === 'lot') {
    g = b.createLinearGradient(0, 0, 0, 400); g.addColorStop(0, '#231c38'); g.addColorStop(.4, '#6a3340'); g.addColorStop(.7, '#c86a3a'); g.addColorStop(1, '#3a261e'); b.fillStyle = g; b.fillRect(0, 0, W, H);
    const sg = b.createRadialGradient(700, 290, 10, 700, 290, 170); sg.addColorStop(0, 'rgba(255,214,140,.9)'); sg.addColorStop(.25, 'rgba(255,170,90,.45)'); sg.addColorStop(1, 'rgba(255,140,60,0)'); b.fillStyle = sg; b.fillRect(500, 110, 400, 320);
    b.fillStyle = '#ffd890'; b.beginPath(); b.arc(700, 290, 40, 0, 7); b.fill();
    b.strokeStyle = '#1b1420'; b.lineWidth = 7; b.beginPath(); b.moveTo(150, 360); b.lineTo(150, 80); b.moveTo(110, 92); b.lineTo(470, 92); b.stroke(); b.lineWidth = 2; b.beginPath(); for (let x = 115; x < 470; x += 18) { b.moveTo(x, 84); b.lineTo(x + 9, 100); b.lineTo(x + 18, 84); } b.moveTo(400, 92); b.lineTo(400, 200); b.stroke(); b.fillStyle = '#1b1420'; b.beginPath(); b.arc(400, 210, 12, 0, Math.PI); b.fill(); b.fillRect(388, 198, 24, 10);
    for (let k = 0; k < 8; k++) { const cx = -40 + k * 140 + r() * 50, hh = 50 + r() * 80; b.fillStyle = k % 2 ? '#1c1517' : '#251a1b'; b.beginPath(); b.moveTo(cx - 130, 395); for (let i = 0; i <= 12; i++) b.lineTo(cx - 130 + i * 21.7, 395 - hh * Math.sin(i / 12 * Math.PI) - r() * 16); b.lineTo(cx + 130, 395); b.closePath(); b.fill(); }
    for (const [x, y, c] of [[110, 346, '#3a2c2a'], [800, 350, '#2c2a33']]) { b.fillStyle = c; rr(b, x - 60, y - 18, 120, 26, 6); b.fill(); rr(b, x - 34, y - 36, 66, 22, 8); b.fill(); b.fillStyle = '#120e10'; b.beginPath(); b.arc(x - 36, y + 8, 12, 0, 7); b.arc(x + 38, y + 8, 12, 0, 7); b.fill(); }
    makeCrowd(r, 2, 304, 26, 26, 6, 7, [[22, 16, 18], '#4a3a1a', '#3a1f22', '#1f2a3a'], .55);
  } else if (v === 'drain') {
    g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d0f0e'); g.addColorStop(.6, '#1b1f1c'); g.addColorStop(1, '#101211'); b.fillStyle = g; b.fillRect(0, 0, W, H);
    b.strokeStyle = 'rgba(0,0,0,.35)'; b.lineWidth = 1; for (let y = 0; y < 380; y += 26) for (let x = -26; x < W; x += 52) { const xx = x + ((y / 26) % 2 ? 26 : 0); b.strokeRect(xx, y, 52, 26); }
    b.fillStyle = '#070807'; b.beginPath(); b.arc(W / 2, 250, 260, Math.PI, 0); b.lineTo(W / 2 + 260, 380); b.lineTo(W / 2 - 260, 380); b.closePath(); b.fill();
    b.strokeStyle = '#2a2f2b'; b.lineWidth = 14; b.beginPath(); b.arc(W / 2, 250, 266, Math.PI, 0); b.stroke();
    b.strokeStyle = 'rgba(60,70,62,.6)'; b.lineWidth = 2; for (let i = 0; i < 18; i++) { const a = Math.PI + i / 17 * Math.PI; b.beginPath(); b.moveTo(W / 2 + Math.cos(a) * 259, 250 + Math.sin(a) * 259); b.lineTo(W / 2 + Math.cos(a) * 273, 250 + Math.sin(a) * 273); b.stroke(); }
    const gc = ['#e05aa0', '#4fe0ff', '#f0b20a', '#6cc28a']; for (let i = 0; i < 9; i++) { const x = r() < .5 ? 20 + r() * 150 : W - 170 + r() * 150, y = 40 + r() * 170; b.fillStyle = gc[i % 4]; b.globalAlpha = .2; b.beginPath(); b.ellipse(x, y, 20 + r() * 40, 10 + r() * 20, r() * 3, 0, 7); b.fill(); }
    b.globalAlpha = .6; b.fillStyle = '#f0b20a'; b.font = '600 62px Teko, sans-serif'; b.save(); b.translate(40, 130); b.rotate(-.1); b.fillText('THE DRAIN', 0, 0); b.restore(); b.fillStyle = 'rgba(240,178,10,.5)'; for (let i = 0; i < 7; i++) b.fillRect(52 + i * 26, 128 - i * 2.6, 2, 10 + r() * 22);
    b.fillStyle = '#e05aa0'; b.save(); b.translate(W - 230, 170); b.rotate(.08); b.font = '600 46px Teko, sans-serif'; b.fillText('CASH ONLY', 0, 0); b.restore(); b.globalAlpha = 1;
    makeCrowd(r, 5, 212, 32, 38, 5, 8, [[18, 20, 18], '#4a3a1a', '#4a2224', '#1f3247'], .95);
    for (let i = 0; i < 14; i++) VFX.bulbs.push({ x: 40 + i * 67, y: 64 + Math.sin(i / 13 * Math.PI) * 38, ph: r() * 6 });
    VFX.barrels = [[34, 420], [926, 420]];
  } else if (v === 'harbor') {
    g = b.createLinearGradient(0, 0, 0, 330); g.addColorStop(0, '#060a16'); g.addColorStop(1, '#1a2a44'); b.fillStyle = g; b.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { b.fillStyle = `rgba(255,255,255,${.2 + r() * .6})`; b.fillRect(r() * W, r() * 190, 1.5, 1.5); }
    b.fillStyle = '#e8e4da'; b.beginPath(); b.arc(820, 70, 26, 0, 7); b.fill(); b.fillStyle = '#0a1020'; b.beginPath(); b.arc(833, 63, 23, 0, 7); b.fill();
    g = b.createLinearGradient(0, 296, 0, 346); g.addColorStop(0, '#0f2236'); g.addColorStop(1, '#081420'); b.fillStyle = g; b.fillRect(0, 296, W, 52);
    for (let i = 0; i < 46; i++) { b.fillStyle = `rgba(255,${200 + r() * 55 | 0},150,${.15 + r() * .3})`; b.fillRect(r() * W, 300 + r() * 42, 8 + r() * 20, 1.5); }
    b.strokeStyle = '#4a2420'; b.lineWidth = 8; b.beginPath(); b.moveTo(560, 300); b.lineTo(600, 60); b.moveTo(700, 300); b.lineTo(660, 60); b.moveTo(520, 64); b.lineTo(900, 64); b.stroke(); b.lineWidth = 3; b.beginPath(); for (let y = 90; y < 300; y += 40) { b.moveTo(560 + (300 - y) * .16, y); b.lineTo(700 - (300 - y) * .16, y + 30); } b.stroke();
    VFX.blink.push([900, 60], [522, 60], [630, 56]);
    const cc = ['#7a2e24', '#24506a', '#a37a1c', '#3a5a3a', '#5a3a6a', '#7d858d'];
    for (const [x0, n] of [[0, 3], [128, 2], [256, 4], [744, 3], [868, 2]]) for (let j = 0; j < n; j++) { const y = 332 - (j + 1) * 34, c = cc[(x0 / 10 + j * 3 | 0) % cc.length]; b.fillStyle = c; b.fillRect(x0, y, 124, 32); b.strokeStyle = 'rgba(0,0,0,.35)'; b.lineWidth = 1; for (let x = x0 + 6; x < x0 + 124; x += 6) { b.beginPath(); b.moveTo(x, y + 2); b.lineTo(x, y + 30); b.stroke(); } b.strokeStyle = 'rgba(0,0,0,.6)'; b.strokeRect(x0 + .5, y + .5, 123, 31); }
    makeCrowd(r, 3, 292, 30, 30, 6, 8, [[14, 18, 26], '#a37a1c', '#7a2e24', '#24506a'], .8);
  } else if (v === 'foundry') {
    g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#111317'); g.addColorStop(.5, '#242326'); g.addColorStop(1, '#121214'); b.fillStyle = g; b.fillRect(0, 0, W, H);
    b.fillStyle = '#282a2d'; b.fillRect(0, 56, W, 20); b.fillRect(0, 118, W, 12);
    b.fillStyle = '#17191c'; b.fillRect(72, 76, 22, 246); b.fillRect(866, 76, 22, 246);
    b.strokeStyle = '#3c3c3b'; b.lineWidth = 9; b.beginPath(); b.moveTo(82, 88); b.lineTo(82, 168); b.lineTo(878, 168); b.lineTo(878, 88); b.stroke();
    b.strokeStyle = '#5b5650'; b.lineWidth = 5; b.beginPath(); b.moveTo(170, 74); b.lineTo(170, 157); b.moveTo(790, 74); b.lineTo(790, 157); b.moveTo(170, 102); b.lineTo(790, 102); b.stroke();
    for (const [x, y, rad] of [[242, 285, 112], [708, 278, 132]]) { const furnace = b.createRadialGradient(x, y, 8, x, y, rad); furnace.addColorStop(0, 'rgba(255,210,116,.9)'); furnace.addColorStop(.2, 'rgba(255,128,44,.66)'); furnace.addColorStop(1, 'rgba(255,92,28,0)'); b.fillStyle = furnace; b.fillRect(x - rad, y - rad, rad * 2, rad * 2); b.fillStyle = '#161414'; rr(b, x - 54, y - 28, 108, 74, 8); b.fill(); b.fillStyle = 'rgba(255,150,55,.75)'; rr(b, x - 36, y - 14, 72, 52, 6); b.fill(); }
    b.fillStyle = '#42403c'; for (let x = 112; x < W; x += 148) { b.fillRect(x, 188, 20, 145); b.fillRect(x - 14, 178, 48, 12); }
    makeCrowd(r, 4, 244, 31, 35, 7, 8, [[22, 19, 17], '#b8733a', '#d4a017', '#3f6572'], .89);
  } else if (v === 'dome') {
    g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05060a'); g.addColorStop(.5, '#0c0e16'); g.addColorStop(1, '#0a0b10'); b.fillStyle = g; b.fillRect(0, 0, W, H);
    b.strokeStyle = 'rgba(120,130,160,.12)'; b.lineWidth = 2; for (let i = 0; i < 14; i++) { b.beginPath(); b.moveTo(W / 2, -200); b.lineTo(-200 + i * 100, 140); b.stroke(); }
    for (let i = 0; i < 10; i++) { b.fillStyle = `rgb(${12 + i * 2},${13 + i * 2},${20 + i * 2})`; b.fillRect(0, 130 + i * 25, W, 25); }
    makeCrowd(r, 10, 142, 25, 70, 4, 4, [[16, 17, 24], '#d4a017', '#a3262f', '#24506a'], .96);
    for (let i = 0; i < 170; i++) VFX.phones.push({ x: r() * W, y: 136 + r() * 240, ph: r() * 6, sp: .5 + r() * 2 });
  } else {
    g = b.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a0b0e'); g.addColorStop(.5, '#14161b'); g.addColorStop(1, '#0e0f12'); b.fillStyle = g; b.fillRect(0, 0, W, H);
    b.fillStyle = '#1a1c1f'; b.fillRect(0, 36, W, 8); for (let x = 30; x < W; x += 70) { b.fillStyle = '#25282c'; b.fillRect(x, 44, 22, 10); b.fillStyle = 'rgba(255,240,200,.55)'; b.fillRect(x + 4, 54, 14, 3); }
    const bc = ['#c2602f', '#4fa3d9', '#9aa36a', '#a678e8', '#d94a5a', '#7fa04a', '#3f8fa0', '#b8733a'];
    b.globalAlpha = .55; for (let i = 0; i < 8; i++) { const x = 60 + i * 115; b.fillStyle = bc[i]; b.beginPath(); b.moveTo(x, 60); b.lineTo(x + 40, 60); b.lineTo(x + 40, 120); b.lineTo(x + 20, 108); b.lineTo(x, 120); b.fill(); } b.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { b.fillStyle = `rgb(${20 + i * 3},${21 + i * 3},${25 + i * 3})`; b.fillRect(0, 175 + i * 34, W, 34); b.fillStyle = 'rgba(0,0,0,.35)'; b.fillRect(0, 175 + i * 34, W, 3); }
    makeCrowd(r, 6, 192, 32, 42, 5, 7, [[18, 19, 22], '#5a4a1a', '#4a2224', '#1f3247'], .97);
  }
  // ring floor
  const fl = { lot: ['#5c4632', '#3a2b1f'], drain: ['#3c3f3b', '#252724'], harbor: ['#5a4a36', '#382d21'], foundry: ['#40352d', '#211d1a'], arena: ['#3b404c', '#292d36'], dome: ['#22252f', '#14161c'] }[v];
  g = rg.createLinearGradient(0, 384, 0, 452); g.addColorStop(0, fl[0]); g.addColorStop(1, fl[1]); rg.fillStyle = g;
  rg.beginPath(); rg.moveTo(70, 384); rg.lineTo(890, 384); rg.lineTo(944, 452); rg.lineTo(16, 452); rg.closePath(); rg.fill();
  if (v === 'lot') for (let i = 0; i < 170; i++) { rg.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,220,180'},${.08 + r() * .12})`; rg.fillRect(40 + r() * 880, 388 + r() * 60, 2 + r() * 3, 1.5); }
  if (v === 'drain') { rg.strokeStyle = '#1a1c1a'; rg.lineWidth = 3; rg.beginPath(); rg.ellipse(W / 2, 420, 60, 12, 0, 0, 7); rg.stroke(); rg.beginPath(); for (let i = -48; i <= 48; i += 12) { rg.moveTo(W / 2 + i, 410); rg.lineTo(W / 2 + i, 430); } rg.stroke(); for (let i = 0; i < 6; i++) { rg.fillStyle = 'rgba(0,0,0,.2)'; rg.beginPath(); rg.ellipse(100 + r() * 760, 395 + r() * 50, 20 + r() * 40, 5 + r() * 6, 0, 0, 7); rg.fill(); } }
  if (v === 'harbor') { rg.strokeStyle = 'rgba(0,0,0,.35)'; rg.lineWidth = 1.5; for (let y = 392; y < 452; y += 9) { rg.beginPath(); rg.moveTo(70 - (y - 384) * .8, y); rg.lineTo(890 + (y - 384) * .8, y); rg.stroke(); } }
  const floorPath = () => { rg.beginPath(); rg.moveTo(70, 384); rg.lineTo(890, 384); rg.lineTo(944, 452); rg.lineTo(16, 452); rg.closePath(); };
  const floorLogo = (text, col, size) => { rg.save(); rg.translate(W / 2, 421); rg.scale(1, .42); rg.fillStyle = col; rg.font = `600 ${size}px Teko, sans-serif`; rg.textAlign = 'center'; rg.textBaseline = 'middle'; rg.fillText(text, 0, 0); rg.restore(); };
  if (v === 'arena' || v === 'dome') {
    rg.strokeStyle = v === 'dome' ? 'rgba(212,160,23,.55)' : 'rgba(255,255,255,.2)'; rg.lineWidth = 2; rg.beginPath(); rg.moveTo(92, 389); rg.lineTo(868, 389); rg.lineTo(914, 447); rg.lineTo(46, 447); rg.closePath(); rg.stroke();
    rg.lineWidth = 3; rg.beginPath(); rg.ellipse(W / 2, 420, 158, 25, 0, 0, 7); rg.stroke();
    floorLogo(v === 'dome' ? 'CROWN DOME' : 'REGIONAL CIRCUIT', v === 'dome' ? 'rgba(212,160,23,.62)' : 'rgba(240,178,10,.42)', 62);
  }
  if (v === 'foundry') { rg.save(); floorPath(); rg.clip(); rg.strokeStyle = 'rgba(0,0,0,.34)'; rg.lineWidth = 1.5; for (let y = 396; y < 452; y += 17) { rg.beginPath(); rg.moveTo(0, y); rg.lineTo(W, y); rg.stroke(); } for (let i = -7; i <= 7; i++) { rg.beginPath(); rg.moveTo(W / 2 + i * 58, 384); rg.lineTo(W / 2 + i * 66, 452); rg.stroke(); } rg.restore(); floorLogo('FOUNDRY FLOOR', 'rgba(225,116,49,.36)', 58); }
  if (v === 'harbor') floorLogo('PIER 9', 'rgba(10,10,12,.42)', 66);
  { const pool = { lot: '255,190,120,.2', drain: '255,150,70,.15', harbor: '170,200,240,.15', foundry: '255,160,80,.2', arena: '255,250,235,.24', dome: '255,235,190,.28' }[v]; rg.save(); floorPath(); rg.clip();
    rg.save(); rg.translate(W / 2, 420); rg.scale(1, .2); g = rg.createRadialGradient(0, 0, 20, 0, 0, 430); g.addColorStop(0, `rgba(${pool})`); g.addColorStop(.62, `rgba(${pool.split(',').slice(0, 3).join(',')},.08)`); g.addColorStop(1, `rgba(${pool.split(',').slice(0, 3).join(',')},0)`); rg.globalCompositeOperation = 'lighter'; rg.fillStyle = g; rg.fillRect(-500, -400, 1000, 800); rg.restore();
    g = rg.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(0,0,0,.42)'); g.addColorStop(.2, 'rgba(0,0,0,0)'); g.addColorStop(.8, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.42)'); rg.fillStyle = g; rg.fillRect(0, 384, W, 68); rg.restore(); }
  g = rg.createLinearGradient(0, 452, 0, H); g.addColorStop(0, '#26282c'); g.addColorStop(1, '#101114'); rg.fillStyle = g; rg.fillRect(0, 452, W, H - 452);
  rg.fillStyle = 'rgba(0,0,0,.22)'; for (let x = 12; x < W; x += 34) rg.fillRect(x, 459, 2, H - 459);
  rg.fillStyle = 'rgba(255,255,255,.1)'; rg.beginPath(); rg.moveTo(16, 452); rg.lineTo(944, 452); rg.lineTo(944, 453.5); rg.lineTo(16, 453.5); rg.closePath(); rg.fill();
  const stripe = { foundry: '#e17431', arena: '#4fa3d9', dome: '#d4a017' }[v] || '#f0b20a';
  rg.save(); rg.beginPath(); rg.rect(0, 452, W, 7); rg.clip(); rg.fillStyle = stripe; for (let x = 0; x < W; x += 24) { rg.beginPath(); rg.moveTo(x, 459); rg.lineTo(x + 12, 459); rg.lineTo(x + 20, 452); rg.lineTo(x + 8, 452); rg.fill(); } rg.restore();
  rg.fillStyle = 'rgba(235,231,222,.62)'; rg.font = '600 16px Teko, sans-serif'; rg.textAlign = 'center'; rg.fillText(VENUES[v].name.toUpperCase() + ' · NO REFUNDS', W / 2, 475); rg.textAlign = 'left';
  const ropes = { lot: ['#6a4a2a', '#5a3e24'], harbor: ['#b89a6a', '#a3895c', '#8f784f'], foundry: ['#e17431', '#c8c0b4', '#d4a017'], arena: ['#c7362f', '#ebe7de', '#3f6fb5'], dome: ['#ebe7de', '#d4a017', '#ebe7de'] }[v];
  const backPost = x => {
    if (v === 'lot') { for (let i = 0; i < 4; i++) { const y = 372 - i * 26; rg.fillStyle = '#141414'; rg.beginPath(); rg.ellipse(x, y, 22, 13, 0, 0, 7); rg.fill(); rg.fillStyle = '#2a2a2a'; rg.beginPath(); rg.ellipse(x, y - 3, 12, 6, 0, 0, 7); rg.fill(); } }
    else if (v === 'harbor') { rg.fillStyle = '#1c1d20'; rr(rg, x - 13, 302, 26, 84, 6); rg.fill(); rg.fillStyle = '#f0b20a'; rg.fillRect(x - 13, 314, 26, 6); rg.fillStyle = '#2a2d31'; rg.beginPath(); rg.ellipse(x, 302, 17, 7, 0, 0, 7); rg.fill(); }
    else { rg.fillStyle = v === 'dome' ? '#8a6a10' : '#2a2d31'; rg.fillRect(x - 5, 262, 10, 124); rg.fillStyle = v === 'arena' ? (x < W / 2 ? '#a3262f' : '#24506a') : v === 'dome' ? '#d4a017' : '#555d66'; for (let i = 0; i < 3; i++) { rr(rg, x - 9, 280 + i * 34, 18, 22, 4); rg.fill(); } }
  };
  backPost(66); backPost(894);
  ringRopes = ropes ? { cols: ropes, w: v === 'harbor' ? 6 : 5, twist: v === 'harbor' } : null;
  if (v === 'drain') chainFence(rg, 40, 236, 880, 150, .2);
  for (const [x, y] of VFX.barrels) drawBarrel(rg, x, y);
  // front layer
  if (v === 'drain') chainFence(fr, 0, 246, W, 214, .07);
  else if (v === 'lot') { for (const x of [14, 946]) for (let i = 0; i < 5; i++) { const y = 474 - i * 30; fr.fillStyle = '#0f0f0f'; fr.beginPath(); fr.ellipse(x, y, 30, 16, 0, 0, 7); fr.fill(); fr.fillStyle = '#262626'; fr.beginPath(); fr.ellipse(x, y - 4, 16, 8, 0, 0, 7); fr.fill(); } }
  else if (v === 'harbor') { for (const x of [14, 946]) { fr.fillStyle = '#16181b'; rr(fr, x - 18, 300, 36, 200, 8); fr.fill(); fr.fillStyle = '#f0b20a'; fr.fillRect(x - 18, 316, 36, 8); } }
  else { const cols = v === 'arena' ? ['#a3262f', '#24506a'] : ['#d4a017', '#d4a017']; [14, 946].forEach((x, i) => { fr.fillStyle = v === 'dome' ? '#8a6a10' : '#26292d'; fr.fillRect(x - 7, 250, 14, 230); fr.fillStyle = cols[i]; for (let k = 0; k < 3; k++) { rr(fr, x - 12, 268 + k * 44, 24, 30, 5); fr.fill(); } }); }
  g = fr.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .65); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); fr.fillStyle = g; fr.fillRect(0, 0, W, H);
  fr.fillStyle = { lot: 'rgba(255,140,60,.07)', drain: 'rgba(80,140,90,.05)', harbor: 'rgba(60,110,200,.08)', foundry: 'rgba(255,115,50,.06)', arena: 'rgba(0,0,0,0)', dome: 'rgba(120,90,200,.05)' }[v]; fr.fillRect(0, 0, W, H);
}
function drawVenueBG(t) {
  const v = curVenue;
  if (v === 'drain') { ctx.strokeStyle = '#2a2d2a'; ctx.lineWidth = 1.5; ctx.beginPath(); VFX.bulbs.forEach((q, i) => { const y = q.y + Math.sin(t * 1.3 + q.ph) * 2; if (i) ctx.lineTo(q.x, y); else ctx.moveTo(q.x, y); }); ctx.stroke(); for (const q of VFX.bulbs) { const y = q.y + Math.sin(t * 1.3 + q.ph) * 2 + 8, f = .7 + Math.sin(t * 13 + q.ph * 5) * .15; glow(ctx, '#ffd890', 16, () => { ctx.fillStyle = `rgba(255,220,150,${f})`; ctx.beginPath(); ctx.arc(q.x, y, 4, 0, 7); ctx.fill(); }); } }
  if (v === 'harbor') for (const [x, y] of VFX.blink) if (Math.sin(t * 3 + x) > .6) glow(ctx, '#ff3a3a', 14, () => { ctx.fillStyle = '#ff5a4a'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); });
  if (v === 'foundry') { const hot = .72 + Math.sin(t * 2.1) * .12; for (const [x, y, r] of [[242, 282, 108], [708, 278, 126]]) glow(ctx, '#ff8a32', r, () => { const g = ctx.createRadialGradient(x, y, 5, x, y, r); g.addColorStop(0, `rgba(255,170,76,${hot * .18})`); g.addColorStop(1, 'rgba(255,90,20,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }); }
  if (v === 'arena' && G) { const y = 150; ctx.fillStyle = '#0a0b0e'; ctx.fillRect(0, y - 14, W, 26); ctx.save(); ctx.beginPath(); ctx.rect(0, y - 14, W, 26); ctx.clip(); ctx.fillStyle = '#f0b20a'; ctx.font = '600 22px Teko, sans-serif'; const msg = `${G.F.f[0].spec.name.toUpperCase()}  VS  ${G.F.f[1].spec.name.toUpperCase()}   ·   REGIONAL CIRCUIT   ·   ROUND ${G.F.round}   ·   `, wdt = ctx.measureText(msg).width, off = -(t * 80 % wdt); for (let x = off; x < W; x += wdt) ctx.fillText(msg, x, y + 8); ctx.restore(); ctx.fillStyle = 'rgba(0,0,0,.3)'; for (let x = 0; x < W; x += 3) ctx.fillRect(x, y - 14, 1, 26); }
  if (v === 'dome') {
    for (const q of VFX.phones) { const a = .25 + Math.sin(t * q.sp + q.ph) * .3 + (G ? G.hype : .45) * .35; if (a > .2) { ctx.fillStyle = `rgba(220,235,255,${Math.min(1, a)})`; ctx.fillRect(q.x, q.y, 2, 2); } }
    if (G) { const jx = W / 2 - 170, jy = 44, jw = 340, jh = 92, [A, B] = G.F.f;
    ctx.fillStyle = '#05060a'; rr(ctx, jx - 6, jy - 6, jw + 12, jh + 12, 6); ctx.fill(); ctx.fillStyle = '#0d1530'; ctx.fillRect(jx, jy, jw, jh);
    ctx.font = '600 19px Teko, sans-serif'; ctx.fillStyle = '#ebe7de'; ctx.textAlign = 'left'; ctx.fillText(A.spec.name.toUpperCase(), jx + 10, jy + 24, 120); ctx.textAlign = 'right'; ctx.fillText(B.spec.name.toUpperCase(), jx + jw - 10, jy + 24, 120);
    ctx.textAlign = 'center'; ctx.fillStyle = '#d4a017'; ctx.font = '600 38px Teko, sans-serif'; ctx.fillText(G.F.phase === 'break' ? 'BREAK' : String(Math.max(0, Math.ceil(G.F.cfg.roundLen - G.F.rt))), W / 2, jy + 40); ctx.textAlign = 'left';
    for (const [f, x0, d] of [[A, jx + 10, 1], [B, jx + jw - 10, -1]]) { const wb = 110 * Math.max(0, f.hp / f.s.hp); ctx.fillStyle = '#2a2e33'; ctx.fillRect(d > 0 ? x0 : x0 - 110, jy + 34, 110, 8); ctx.fillStyle = '#e2483d'; ctx.fillRect(d > 0 ? x0 : x0 - wb, jy + 34, wb, 8); }
    ctx.fillStyle = 'rgba(255,255,255,.04)'; for (let y = jy; y < jy + jh; y += 3) ctx.fillRect(jx, y, jw, 1); }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { const sx = i < 2 ? 0 : W, a2 = Math.sin(t * (.6 + i * .2) + i) * .5 + (i < 2 ? .45 : Math.PI - .45); ctx.strokeStyle = ['rgba(212,160,23,.28)', 'rgba(120,200,255,.24)', 'rgba(255,80,160,.24)', 'rgba(212,160,23,.28)'][i]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, 140); ctx.lineTo(sx + Math.cos(a2) * 1000, 140 + Math.sin(a2) * 1000); ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over';
  }
}
function drawVenueFG(t) {
  for (const [x, y] of VFX.barrels) { ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const fh = 18 + Math.sin(t * 9 + i * 1.7) * 8, fx = x - 12 + i * 5; ctx.fillStyle = `rgba(255,${120 + i * 15},40,.45)`; ctx.beginPath(); ctx.moveTo(fx - 5, y - 46); ctx.quadraticCurveTo(fx, y - 46 - fh * 1.6, fx + 5, y - 46); ctx.fill(); } const lg = ctx.createRadialGradient(x, y - 50, 4, x, y - 50, 90); lg.addColorStop(0, 'rgba(255,140,40,.22)'); lg.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = lg; ctx.fillRect(x - 90, y - 140, 180, 180); ctx.globalCompositeOperation = 'source-over'; if (Math.random() < .15) G.fx.push({ x: x + (Math.random() - .5) * 10, y: y - 60, vx: (Math.random() - .5) * 15, vy: -30, life: 1.4, max: 1.4, s: 5, type: 'smoke', dark: true }); }
  if (curVenue === 'harbor') for (let i = 0; i < 3; i++) { const y = 330 + i * 30, x = ((t * (12 + i * 6)) % (W + 400)) - 400, fg = ctx.createLinearGradient(0, y - 30, 0, y + 30); fg.addColorStop(0, 'rgba(160,180,200,0)'); fg.addColorStop(.5, 'rgba(160,180,200,.1)'); fg.addColorStop(1, 'rgba(160,180,200,0)'); ctx.fillStyle = fg; ctx.fillRect(x, y - 30, 900, 60); ctx.fillRect(x - W - 400, y - 30, 900, 60); }
  if (curVenue === 'lot') for (let i = 0; i < 22; i++) { const x = (i * 97 + t * 14) % W, y = 200 + (i * 53 % 200) + Math.sin(t + i) * 6; ctx.fillStyle = 'rgba(255,210,150,.25)'; ctx.fillRect(x, y, 2, 2); }
}
/* ---- ring: ropes sag and shake, and the canvas keeps the fight's marks (cosmetic only) ---- */
function drawRingRopes(c, t, amp = 0, hitX = W / 2) {
  if (!ringRopes) return; const { cols, w, twist } = ringRopes, x0 = 66, x1 = 894, n = 40;
  cols.forEach((col, i) => {
    const base = [280, 314, 348][i], sag = 4 + i * 2.5, yAt = x => { const u = (x - x0) / (x1 - x0), d = (x - hitX) / 190; return base + Math.sin(u * Math.PI) * (sag + Math.sin(t * 1.1 + i) * .5) + (amp ? amp * Math.exp(-d * d) * Math.cos(t * 34 + i * .9 - (x - hitX) * .03) * Math.sin(u * Math.PI) : 0); };
    const trace = dy => { c.beginPath(); for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n; if (k) c.lineTo(x, yAt(x) + dy); else c.moveTo(x, yAt(x) + dy); } };
    c.lineCap = 'round'; c.strokeStyle = 'rgba(0,0,0,.34)'; c.lineWidth = w + 1; trace(2.5); c.stroke();
    c.strokeStyle = col; c.lineWidth = w; trace(0); c.stroke();
    if (twist) { c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; c.beginPath(); for (let x = x0 + 4; x < x1 - 4; x += 8) { const y = yAt(x); c.moveTo(x, y - 3); c.lineTo(x + 5, y + 3); } c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; trace(-w * .32); c.stroke();
  });
}
function ropeKick(x, amp) { if (!G || S.opt.reduced) return; if (amp > (G.ropeAmp || 0)) { G.ropeAmp = amp; G.ropeX = x; } }
function ringMarks() {
  if (G.marks) return G.marksCtx; const m = document.createElement('canvas'); m.width = W; m.height = H; const x = m.getContext('2d');
  x.beginPath(); x.moveTo(70, 384); x.lineTo(890, 384); x.lineTo(944, 452); x.lineTo(16, 452); x.closePath(); x.clip(); x.lineCap = 'round';
  G.marks = m; G.marksCtx = x; return x;
}
function ringMark(kind, px, py, k = 1, dir = 1) {
  if (!G) return; const x = ringMarks(), rnd = Math.random;
  if (kind === 'scuff') { for (let i = 0, n = 2 + rnd() * 3 | 0; i < n; i++) { const sx = px + (rnd() - .5) * 46 * k, sy = py + (rnd() - .5) * 11, len = (7 + rnd() * 20) * k; x.strokeStyle = `rgba(0,0,0,${.16 + rnd() * .2})`; x.lineWidth = 1 + rnd() * 2; x.beginPath(); x.moveTo(sx, sy); x.lineTo(sx + dir * len, sy + (rnd() - .5) * 3); x.stroke(); if (rnd() < .55) { x.strokeStyle = 'rgba(200,205,210,.3)'; x.lineWidth = 1; x.beginPath(); x.moveTo(sx, sy - 1); x.lineTo(sx + dir * len * .6, sy - 1); x.stroke(); } } return; }
  if (kind === 'scrape') { const len = 84 * k; for (let i = 0; i < 4; i++) { const sy = py - 7 + i * 5 + rnd() * 2; x.strokeStyle = `rgba(0,0,0,${.24 + rnd() * .16})`; x.lineWidth = 2 + rnd() * 3; x.beginPath(); x.moveTo(px - dir * len * .2, sy); x.lineTo(px + dir * len * (.7 + rnd() * .4), sy + (rnd() - .5) * 5); x.stroke(); } x.strokeStyle = 'rgba(200,205,210,.42)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + dir * len * .8, py + 1); x.stroke(); return; }
  if (kind === 'oil') { for (let i = 0; i < 5; i++) { const ex = px + (rnd() - .5) * 42 * k, ey = py + (rnd() - .5) * 9 * k, rx = (5 + rnd() * 15) * k; x.fillStyle = `rgba(8,8,10,${.32 + rnd() * .28})`; x.beginPath(); x.ellipse(ex, ey, rx, rx * .3, 0, 0, 7); x.fill(); } x.fillStyle = 'rgba(122,138,160,.1)'; x.beginPath(); x.ellipse(px - 4, py - 1, 11 * k, 2.4 * k, -.08, 0, 7); x.fill(); return; }
  const r = 40 * k; x.save(); x.translate(px, py); x.scale(1, .3); const g = x.createRadialGradient(0, 0, 3, 0, 0, r); g.addColorStop(0, 'rgba(8,6,5,.68)'); g.addColorStop(.6, 'rgba(14,10,8,.28)'); g.addColorStop(1, 'rgba(14,10,8,0)'); x.fillStyle = g; x.fillRect(-r, -r, r * 2, r * 2); x.restore();
}
function ringHit(o, dir, vd, e) { const near = o.x < RING.L + 90 || o.x > RING.R - 90 || (o.z || 0) < RING.ZMIN + 22; ropeKick(o.x, Math.min(near ? 7 : 2.4, vd * (near ? .6 : .18))); if (!e.blocked && vd >= 5) ringMark('scuff', o.x, groundFor(o) + 3, Math.min(1.5, .6 + vd * .05), dir); }
function ringFall(f) { const d = f.dir ? -f.dir : 1; ropeKick(f.x, 9); ringMark('scrape', f.x, groundFor(f) + 3, 1, d); ringMark('scorch', f.x, groundFor(f) + 3, .9); }
function markSlicks(slicks) { if (!slicks || !slicks.length) return; if (!G.markedSlicks) G.markedSlicks = new WeakSet(); for (const sl of slicks) if (!sl.kind && !G.markedSlicks.has(sl)) { G.markedSlicks.add(sl); ringMark('oil', sl.x, GROUND + sl.z * .34 + 4, sl.r / 34); } }
function drawCrowd(c, t, hype) {
  if (!crowdAtlas) return; const [cw, ch] = CROWD_CELL, [ax, ay] = CROWD_ANCHOR;
  for (const p of CROWD) {
    const jump = Math.max(0, Math.sin(t * p.sp + p.ph)) * hype * 6 * (.4 + p.ex), y = p.y - jump, sway = Math.sin(t * 1.3 + p.ph) * p.s * .14 * (.4 + hype), mood = p.ex + Math.sin(t * .7 + p.ph) * .12;
    const pose = hype > .5 && mood > 1.15 - hype * .6 ? 2 : hype > .3 && mood > 1.02 - hype * .62 ? 1 : 0, k = p.s / CROWD_R;
    c.drawImage(crowdAtlas, p.look * cw, (p.tone * 3 + pose) * ch, cw, ch, p.x + sway - ax * k, y - ay * k, cw * k, ch * k);
  }
}
/* ---- fog hazard: soft drifting banks, not flat ovals ---- */
let fogPuff = null;
function drawFogBanks(c, t, fogK) {
  if (fogK <= 0) return;
  if (!fogPuff) { fogPuff = document.createElement('canvas'); fogPuff.width = 256; fogPuff.height = 256; const x = fogPuff.getContext('2d'), g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(201,210,216,1)'); g.addColorStop(.45, 'rgba(201,210,216,.5)'); g.addColorStop(1, 'rgba(201,210,216,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }
  c.save(); c.globalAlpha = .22 * Math.min(1, fogK * 2.5);
  for (let i = 0; i < 9; i++) { const dw = 460 + (i % 3) * 90, dh = 120 + (i % 2) * 34, fx = ((i * 137 + t * (11 + i * 2.5)) % (W + dw)) - dw * .5, fy = GROUND - 56 - (i % 3) * 62 + Math.sin(t * .4 + i) * 7; c.drawImage(fogPuff, fx - dw / 2, fy - dh / 2, dw, dh); }
  c.restore();
}

const VTHUMB = {};
function venueThumbs() {
  const keep = curVenue;
  for (const v of Object.keys(VENUES)) {
    buildLayers(v);
    const c = document.createElement('canvas'); c.width = 480; c.height = 240; const x = c.getContext('2d');
    x.scale(.5, .5); x.drawImage(layerBack, 0, 0); drawCrowd(x, 1.3, .55); x.drawImage(layerRing, 0, 0); drawRingRopes(x, 1.3); x.drawImage(layerFront, 0, 0);
    try { VTHUMB[v] = c.toDataURL('image/jpeg', .82); } catch (e) { VTHUMB[v] = ''; }
  }
  if (keep) buildLayers(keep);
}
function venueCards(cur, attr, withAuto) {
  const items = (withAuto ? [['auto', { name: 'League default', tag: 'Matches the opponent' }]] : []).concat(Object.entries(VENUES));
  return items.map(([k, v]) => `<button class="vcard" ${attr}="${k}" aria-pressed="${cur === k}"><span class="vimg"${k !== 'auto' && VTHUMB[k] ? ` style="background-image:url(${VTHUMB[k]})"` : ''}>${k === 'auto' ? '<i>AUTO</i>' : ''}</span><b>${v.name}</b><small>${v.tag}</small></button>`).join('');
}

