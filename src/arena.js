/* ---- arena.js ---- */
/* ---------- arena: fight presentation ---------- */
const groundFor = f => GROUND + (f.z || 0) * .34;
const zScale = f => 1 + (f.z || 0) * .0009;
const NUMW = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
let lastMatch = null;
function resolveVenue(match) { const op = match.b; return match.venue && match.venue !== 'auto' && VENUES[match.venue] ? match.venue : (op.venue || LEAGUE_VENUE[op.lg || 0] || 'arena'); }
$('#replayTag').addEventListener('click', () => endReplay());
function newGame(match) {
  match = match || lastMatch; lastMatch = match;
  shutUp(); stopCrowdShouts(); ringing(false); setMuffle(0);
  const me = match.a, op = match.b, seed = (Date.now() & 0xffff) + seedN++;
  const schoolBusArrivalHypeBonus = match.career && !match.spectate && S.truck?.hypeArrivalPending === true ? .10 : 0;
  if (schoolBusArrivalHypeBonus) { S.truck.hypeArrivalPending = false; save(); }
  if (match.career && !match.spectate && me && me.id === 'you') me.applyFatigue = true;
  if (match.career && !match.spectate) { match.bout = match.tourney ? null : boutKind(op.id); match.rival = rivalOf(op.id) ? rivalOf(op.id).heat : 0; match.rounds = match.bout ? 5 : 0; }
  const F = createFight(me, op, seed, { rounds: match.rounds || S.rounds, roundLen: match.len || S.len });
  if (match.career && !match.spectate) {
    applyCarry(F.f[0]); F.f[0].carried = dmgAvg();
    if (S.mods && S.mods.weldsMinus) F.f[0].welds = Math.max(0, F.f[0].welds - 1);
    if (!F.f[0].spec.workbookCombat) { const bb = F.f[0].spec.build; for (const slot of ['head', 'torso', 'lead', 'rear', 'legs']) if (partIsWorn(slot, bb[slot]) && !F.f[0].cond[slot] && Math.random() < .3) F.f[0].cond[slot] = { type: WORN_COND[slot], sev: 1, t: 25 }; }
    if (match.rival) { const o = F.f[1], k = 1 + .03 * match.rival; o.s.sense *= 1 + .05 * match.rival; o.s.hp = Math.round(o.s.hp * k); o.hp = o.s.hp; }
  }
  if (match.spectate) F.human = -1;
  if (match.duo) { F.human = 0; F.human2 = 1; F.duo = true; }
  F.controlMode = match.duo ? 'pilot' : match.spectate ? 'coach' : (match.ctrl || S.ctrl || 'coach');
  const venue = resolveVenue(match); F.cfg.hazard = match.noVenueHazard || S.opt.hazards === false ? '' : venue;
  G = { F, match, op, spectate: !!match.spectate, career: !!match.career, speed: 1, prevPhase: 'intro', last: performance.now(), acc: 0, hitstop: 0, slow: 0, shake: 0, flash: [0, 0], screen: 0,
    fx: [], texts: [], debris: [], flashes: [], hype: Math.min(1, .35 + schoolBusArrivalHypeBonus), cam: { x: W / 2, z: 1.2, y: 0 }, scratches: [makeScratches(seed), makeScratches(seed + 9)],
    dockMode: '', doneT: 0, cornerT: 0, settled: false, refT: 0, refN: 0, weldT: [0, 0], tell: null, held2: new Set(), padHeld: [new Set(), new Set()], held: new Set(), paused: false, kdv: 0, hbT: 0, dial: null, lead: -1, comeback: 0, late: 0,
    combo: [[], []], blockRun: [0, 0], storyLeft: [F.f[0], F.f[1]].filter(f => f.spec.story || f.spec.lore).sort(() => Math.random() - .5), cues: null, modal: '', venue };
  G.rec = []; G.recHits = []; G.replay = null; $('#replayTag').hidden = true; $('#stage').classList.remove('replaying');
  if (schoolBusArrivalHypeBonus) toast('Bus arrival bonus applied: +10 points to starting crowd Hype.', 'good');
  VOX.said = new Set(); COMM.t = 0; COMM.lastIdle = 0; COMM.last = 0; COMM.lastByKey = {}; COMM.combo = [0, 0]; COMM.comboT = [0, 0]; COMM.lead = -1; COMM.heatSaid = [0, 0]; COMM.danger = [0, 0]; COMM.said = {};
  VOX.seen.clear(); VOX.eventId = null;
  if (venue !== curVenue) buildLayers(venue);
  const cine = S.opt.cinematic && !match.quickIntro;
  G.intro = { t: 0, dur: cine ? 14.2 : 3.6, cine, fired: new Set(), startAt: performance.now() };
  $('#nmA').textContent = me.name; $('#nmB').textContent = op.name; pipCache = ['', '']; $('#ovA').textContent = 'OVR ' + ovrOf(me); $('#ovB').textContent = 'OVR ' + ovrOf(op); hideL3();
  $('#skipBtn').hidden = false; closeModal(); setDock('none'); syncCtrlBtn(); $('#ctrlBtn').hidden = !!match.duo;
  setTheme(cine ? 'walkout' : 'fight'); crowdLevel(.45, true);
  hud();
}
const pickOne = a => a[Math.random() * a.length | 0];
const PYRO = { fire: [255, 120, 40, 'Fire'], blue: [70, 150, 255, 'Ice blue'], green: [80, 240, 120, 'Toxic green'], purple: [180, 90, 255, 'Ultraviolet'], gold: [255, 205, 60, 'Gold'], red: [255, 50, 50, 'Blood red'] };
function pyro(pc, force) { if (!force && curVenue !== 'dome' && curVenue !== 'arena') return; for (const x of [66, 894]) for (let i = 0; i < 16; i++) G.fx.push({ x: x + (Math.random() - .5) * 10, y: 262, vx: (Math.random() - .5) * 40, vy: -220 - Math.random() * 240, life: .8, max: .9, s: 10 + Math.random() * 10, type: 'fire', pc: pc || '' }); }
function origin(f) { return f.s.heart ? 'Garage-built' : f.s.set ? BRANDS[f.s.set].name + ' factory' : 'Mixed-parts build'; }
function recOf(f) { return f.spec.id === 'you' ? `${S.rec.w}–${S.rec.l}` : (f.spec.rec || '0–0'); }
function crowdLoves(f) { const home = curVenue === 'lot' || curVenue === 'drain' || curVenue === 'harbor' || curVenue === 'foundry'; return f.s.heart || !f.s.set || !home; }
/* ---- cinematic intro ---- */
function introCue(name, at, fn) { if (G.intro.t >= at && !G.intro.fired.has(name)) { G.intro.fired.add(name); fn(); } }
function ringNameKey(f) { return `ring.name.${f.spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`; }
function announceFighter(f, cb) { say('ring', f.spec.name, 3, { group: 'ring-intro', lock: true, assetKey: ringNameKey(f), cb }); }
function runIntro() {
  const I = G.intro, F = G.F, [A, B] = F.f;
  if (!I.cine) { introCue('go', 0, () => { announceFighter(A, () => announceFighter(B)); roar(.4); }); return; }
  introCue('redName', 4.0, () => announceFighter(A));
  introCue('red', 4.35, () => { if (crowdLoves(A)) cheer(.7); else boo(); if (A.spec.id === 'you') pyro(S.pyro, true); else pyro(); });
  introCue('redPose', 5.6, () => { if (crowdLoves(A)) { roar(.5); startChant('clap'); } });
  introCue('blue', 7.0, () => { announceFighter(B); if (crowdLoves(B)) cheer(.7); else boo(); pyro(); });
  introCue('blueRoar', 9.6, () => { if (crowdLoves(B)) roar(.45); else boo(); });
  introCue('face', 10.8, () => { setTheme('fight'); if (AC) stomp(AC.currentTime, .8); });
}
function introState(t) {
  const I = G.intro, [A, B] = G.F.f, st = { a: { x: -200, st: 'idle', walk: 0 }, b: { x: W + 200, st: 'idle', walk: 0 }, cam: { x: W / 2, z: 1.15 }, spot: null, card: null, title: 0, face: 0 };
  if (!I.cine) { st.a.x = A.x; st.b.x = B.x; st.cam = { x: W / 2, z: 1.1 }; st.tape = true; return st; }
  const walk = (x0, x1, t0, d) => { const k = ease(clamp((t - t0) / d, 0, 1)); return { x: x0 + (x1 - x0) * k, walking: t > t0 && t < t0 + d }; };
  if (t < 3) { const k = ease(t / 3); st.cam = { x: 240 + 480 * k, z: 1.42 - k * .12 }; st.title = Math.min(1, t / .5, (3 - t) / .4); }
  const ra = walk(-120, 260, 4.35, 1.2), rb = walk(W + 120, 700, 7.15, 2.3);
  if (t >= 4.2) { st.a.x = ra.x; st.a.walk = ra.x + 120; st.a.st = ra.walking ? 'idle' : (t > 5.5 && t < 6.6 ? 'victory' : 'idle'); }
  if (t >= 7) { st.b.x = rb.x; st.b.walk = W + 120 - rb.x; st.b.st = rb.walking ? 'idle' : (t > 9.5 && t < 10.6 ? 'victory' : 'idle'); }
  if (t >= 4.1 && t < 7) { st.cam = { x: clamp(st.a.x + 70, 300, 660), z: 1.5, y: 262 }; st.spot = st.a.x; st.card = { f: A, side: 0, k: clamp((t - 4.2) / .4, 0, 1) * clamp((7 - t) / .35, 0, 1) }; }
  if (t >= 7 && t < 10.8) { st.cam = { x: clamp(st.b.x - 70, 300, 660), z: 1.5, y: 262 }; st.spot = st.b.x; st.card = { f: B, side: 1, k: clamp((t - 7.5) / .4, 0, 1) * clamp((10.8 - t) / .35, 0, 1) }; }
  if (t >= 10.8) { const fa = walk(260, 330, 10.9, 1.4), fb = walk(700, 630, 10.9, 1.4); st.a.x = fa.x; st.b.x = fb.x; st.a.walk = fa.x; st.b.walk = 1000 - fb.x; st.cam = { x: W / 2, z: 1.16 - ease(clamp((t - 12.6) / 1.4, 0, 1)) * .06, y: 214 + ease(clamp((t - 12.6) / 1.4, 0, 1)) * 38 }; st.face = clamp((t - 11.2) / .4, 0, 1) * clamp((14 - t) / .4, 0, 1); }
  return st;
}
function skipIntro() { if (!G || !G.intro) return; shutUp(); startBout(); }
function startBout() {
  if (!G || !G.intro) return;
  G.intro = null; $('#skipBtn').hidden = true; setTheme('fight'); chant = null;
  addText(W / 2, 170, 'ROUND 1', '#ebe7de', 52, 1.3); addText(W / 2, 220, 'FIGHT', '#f0b20a', 72, 1.3); G.refT = 1.4; bell(3); pyro(); cheer(.7);
  const F = G.F;
  comm('round', F, 0, { n: 1 }, 2);
  setTimeout(() => { if (!G || G.F !== F) return; comm('open', F, 0, null, 1); commColor('openColor', F, 0, null, .9);
    const [A, B] = F.f, gb = A.s.heart && !B.s.heart && B.s.set ? [A, B] : B.s.heart && !A.s.heart && A.s.set ? [B, A] : null;
    if (gb) { say('pbp', fill(pickLine('underdog', LINES.underdog), { gb: gb[0].spec.name, fac: gb[1].spec.name, brand: BRANDS[gb[1].s.set].name }), 1, { ttl: 9000, assetKey: 'pbp.underdog' }); commColor('underdogColor', F, 0, null, .8); }
    const bt = G.match.bout, rv = G.match.rival;
    if (bt) { say('ring', RING_TITLE[bt.lg], 3, { tts: true, ttl: 9000 }); say('pbp', pickLine(bt.kind === 'title' ? 'titleOpen' : 'defendOpen', M4L[bt.kind === 'title' ? 'titleOpen' : 'defendOpen']), 1, { tts: true, ttl: 9000 }); if (Math.random() < .7) say('color', pickLine('titleColor', M4L.titleColor), 1, { tts: true, ttl: 8000 }); }
    else if (rv) { say('pbp', pickLine('rivalOpen', M4L.rivalOpen), 1, { tts: true, ttl: 9000 }); say('color', pickLine('rivalColor', M4L.rivalColor), 1, { tts: true, ttl: 8000 }); }
    if (F.f[0].carried > .12) { say('pbp', pickLine('hurtOpen', M4L.hurtOpen), 1, { tts: true, ttl: 8000 }); if (Math.random() < .6) say('color', pickLine('hurtColor', M4L.hurtColor), 1, { tts: true, ttl: 8000 }); }
    const hist = !G.spectate && !bt && !rv && S.history.filter(h => h.opp === F.f[1].spec.id);
    if (hist && hist.length) { const h = hist[hist.length - 1]; say('pbp', fill(pickLine('rematch', LINES.rematch), { last: h.win ? `${F.f[0].spec.name} won the last one by ${h.how.toLowerCase()}.` : `${F.f[1].spec.name} took the last one by ${h.how.toLowerCase()}. Revenge is on the menu.` }), 1, { ttl: 12000, assetKey: 'pbp.rematch' }); }
  }, 1600);
}
function drawTape() {
  const a = clamp(Math.min(G.intro.t / .3, (G.intro.dur - G.intro.t) / .3), 0, 1), [A, B] = G.F.f;
  const rows = [['Record', recOf], ['Style', f => STYLES[f.spec.style].name], ['Weight', f => Math.round(f.s.total) + ' kg'], ['Reach', f => `${f.s.armR.lead} / ${f.s.armR.rear}`], ['Hull', f => f.s.hp], ['Power', f => `${f.s.armP.lead} / ${f.s.armP.rear}`], ['Signature', f => f.spec.signature ? f.spec.signature.name : '—'], ['Origin', origin]];
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(8,9,11,.86)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.fillStyle = '#f0b20a'; ctx.font = '600 22px Teko, sans-serif'; ctx.fillText('TALE OF THE TAPE · ' + VENUES[curVenue].name.toUpperCase(), W / 2, 44);
  ctx.font = '600 64px Teko, sans-serif'; ctx.fillText('VS', W / 2, 124);
  ctx.font = '600 46px Teko, sans-serif'; ctx.fillStyle = '#ebe7de'; ctx.textAlign = 'right'; ctx.fillText(A.spec.name.toUpperCase(), W / 2 - 70, 120, 330); ctx.textAlign = 'left'; ctx.fillText(B.spec.name.toUpperCase(), W / 2 + 70, 120, 330);
  ctx.font = '500 15px "IBM Plex Mono", monospace';
  rows.forEach(([l, fn], i) => { const y = 172 + i * 34; ctx.fillStyle = 'rgba(255,255,255,.04)'; if (i % 2 === 0) ctx.fillRect(W / 2 - 330, y - 20, 660, 30); ctx.fillStyle = '#8f969d'; ctx.textAlign = 'center'; ctx.fillText(l.toUpperCase(), W / 2, y); ctx.fillStyle = '#ebe7de'; ctx.textAlign = 'right'; ctx.fillText(String(fn(A)), W / 2 - 70, y, 250); ctx.textAlign = 'left'; ctx.fillText(String(fn(B)), W / 2 + 70, y, 250); });
  ctx.restore(); ctx.textAlign = 'left';
}
function wrapText(c, text, x, y, maxW, lh, maxLines) { const words = String(text).split(' '); let line = '', n = 0; for (const w of words) { const test = line ? line + ' ' + w : w; if (c.measureText(test).width > maxW && line) { c.fillText(line, x, y + n * lh); line = w; if (++n >= maxLines) return; } else line = test; } if (line) c.fillText(line, x, y + n * lh); }
function drawIntroOverlay(st, t) {
  const I = G.intro, lb = Math.min(1, I.t / .6, (I.dur - I.t) / .5) * 44;
  if (st.spot != null) {
    const z = G.cam.z, cx = camX(), cy = camY(), sx = (st.spot - cx) * z + W / 2, sy = (GROUND - 150 - cy) * z + H / 2;
    const g = ctx.createRadialGradient(sx, sy, 60, sx, sy, 420); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.62)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter'; const cg = ctx.createLinearGradient(0, 0, 0, H); cg.addColorStop(0, 'rgba(255,240,210,.16)'); cg.addColorStop(1, 'rgba(255,240,210,.02)'); ctx.fillStyle = cg; ctx.beginPath(); ctx.moveTo(sx - 30, 0); ctx.lineTo(sx + 30, 0); ctx.lineTo(sx + 190, H); ctx.lineTo(sx - 190, H); ctx.closePath(); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
  }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, lb); ctx.fillRect(0, H - lb, W, lb);
  if (st.title > 0) {
    const V = VENUES[curVenue]; ctx.save(); ctx.globalAlpha = st.title; ctx.translate((1 - st.title) * -30, 0);
    ctx.fillStyle = '#f0b20a'; ctx.fillRect(40, 300, 6, 104);
    ctx.fillStyle = '#ebe7de'; ctx.font = '600 72px Teko, sans-serif'; ctx.fillText(V.name.toUpperCase(), 60, 360);
    ctx.font = '500 15px "IBM Plex Mono", monospace'; ctx.fillStyle = '#f0b20a'; ctx.fillText(`${V.when.toUpperCase()}  ·  ${V.crowd.toUpperCase()}`, 62, 384);
    ctx.fillStyle = 'rgba(235,231,222,.8)'; ctx.fillText(V.desc, 62, 404, 760); ctx.restore();
  }
  if (st.card && st.card.k > 0) {
    const { f, side, k } = st.card, col = side ? '#4fa3d9' : '#e2483d', x0 = side ? 40 : W - 470, off = (1 - k) * (side ? -60 : 60);
    ctx.save(); ctx.globalAlpha = k; ctx.translate(off, 0);
    ctx.fillStyle = 'rgba(10,11,13,.84)'; ctx.fillRect(x0, 284, 430, 146); ctx.fillStyle = col; ctx.fillRect(side ? x0 : x0 + 424, 284, 6, 146);
    const tx = x0 + (side ? 22 : 16);
    ctx.font = '600 15px "IBM Plex Mono", monospace'; ctx.fillStyle = col; ctx.fillText(side ? 'BLUE CORNER' : 'RED CORNER', tx, 305);
    ctx.fillStyle = '#ebe7de'; ctx.font = '600 50px Teko, sans-serif'; ctx.fillText(f.spec.name.toUpperCase(), tx, 347, 400);
    ctx.font = '500 13px "IBM Plex Mono", monospace'; ctx.fillStyle = '#f0b20a'; ctx.fillText(`${f.spec.nick ? '"' + f.spec.nick.toUpperCase() + '" · ' : ''}${recOf(f)} · ${(f.spec.home || '').toUpperCase()}`, tx, 367, 400);
    ctx.fillStyle = '#8f969d'; ctx.fillText(`${origin(f).toUpperCase()} · ${STYLES[f.spec.style].name.toUpperCase()} · ${Math.round(f.s.total)} KG`, tx, 385, 400);
    ctx.fillStyle = 'rgba(235,231,222,.82)'; ctx.font = 'italic 400 14px Barlow, sans-serif'; wrapText(ctx, f.spec.story || f.spec.lore || '', tx, 405, 400, 16, 2);
    ctx.restore();
  }
  if (st.face > 0) {
    const [A, B] = G.F.f; ctx.save(); ctx.globalAlpha = st.face; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(10,11,13,.72)'; ctx.fillRect(W / 2 - 220, 48, 440, 104);
    ctx.fillStyle = '#f0b20a'; ctx.font = '600 46px Teko, sans-serif'; ctx.fillText('VS', W / 2, 88);
    ctx.font = '600 26px Teko, sans-serif'; ctx.fillStyle = '#e2483d'; ctx.textAlign = 'right'; ctx.fillText(A.spec.name.toUpperCase(), W / 2 - 40, 84, 170); ctx.fillStyle = '#4fa3d9'; ctx.textAlign = 'left'; ctx.fillText(B.spec.name.toUpperCase(), W / 2 + 40, 84, 170);
    const rows = [['WEIGHT', f => f.s.total, v => Math.round(v) + ' kg'], ['REACH', f => Math.max(f.s.armR.lead, f.s.armR.rear), v => Math.round(v)], ['POWER', f => Math.max(f.s.armP.lead, f.s.armP.rear), v => Math.round(v)]];
    ctx.font = '500 12px "IBM Plex Mono", monospace';
    rows.forEach(([l, fn, fmt], i) => { const y = 106 + i * 16, va = fn(A), vb = fn(B), m = Math.max(va, vb) || 1; ctx.textAlign = 'center'; ctx.fillStyle = '#8f969d'; ctx.fillText(l, W / 2, y); ctx.fillStyle = '#e2483d'; ctx.fillRect(W / 2 - 40 - 130 * va / m, y - 8, 130 * va / m, 6); ctx.fillStyle = '#4fa3d9'; ctx.fillRect(W / 2 + 40, y - 8, 130 * vb / m, 6); ctx.fillStyle = '#ebe7de'; ctx.textAlign = 'right'; ctx.fillText(fmt(va), W / 2 - 176, y); ctx.textAlign = 'left'; ctx.fillText(fmt(vb), W / 2 + 176, y); });
    ctx.restore(); ctx.textAlign = 'left';
  }
}
/* ---- floating text and particles ---- */
function addText(x, y, s, col, size, life) {
  if (size >= 40) G.texts = G.texts.filter(q => q.size < 40 || (q.s === 'FIGHT' && s.startsWith('ROUND')) || (s === 'FIGHT' && q.s.startsWith('ROUND')));
  else for (let k = 0; k < 4; k++) { if (!G.texts.some(q => q.size < 40 && Math.abs(q.x - x) < 120 && Math.abs(q.y - y) < 26 && q.life > q.max * .35)) break; y -= 30; }
  G.texts.push({ x, y, s, col, size, life, max: life });
}
function sparks(x, y, dir, n, hot, cool) { for (let i = 0; i < n; i++) { const a = (Math.random() - .5) * 1.9, sp = 120 + Math.random() * 380; G.fx.push({ x, y, vx: Math.cos(a) * sp * dir, vy: Math.sin(a) * sp - 90, life: .25 + Math.random() * .35, max: .6, col: cool ? (Math.random() < .5 ? '#bfe9ff' : '#ffffff') : hot ? (Math.random() < .5 ? '#fff4c2' : '#ffb21a') : '#cfd6dc', s: 1.5 + Math.random() * 2.2, type: 'spark' }); } }
function smoke(x, y, dark) { G.fx.push({ x, y, vx: (Math.random() - .5) * 20, vy: -30 - Math.random() * 25, life: 1.4, max: 1.4, s: 6 + Math.random() * 6, type: 'smoke', dark }); }
function fire(x, y, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.28, sp = Math.random() * 220; G.fx.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: .5 + Math.random() * .4, max: .9, s: 8 + Math.random() * 14, type: 'fire' }); } }
function partPos(f, k) {
  const an = anchors(f.spec.build), d = f.dir, g = groundFor(f);
  if (k === 'head') return [f.x + d * 4, g + an.headY];
  if (k === 'lead') return [f.x + d * an.lsx, g + an.shY];
  if (k === 'rear') return [f.x + d * an.rsx, g + an.shY];
  if (k === 'legs') return [f.x, g + an.legsY];
  return [f.x, g + an.bodyY];
}
function spawnDebris(f, k, vx, vy) { const [x, y] = partPos(f, k); G.debris.push({ kind: k === 'head' ? 'head' : 'arm', build: f.spec.build, paint: f.spec.paint, x, y, vx, vy, rot: 0, vr: (Math.random() - .5) * 14, dir: f.dir, back: k === 'rear', side: k, rest: false, floor: groundFor(f) }); }
/* ---- events: visuals, sound, commentary ---- */
function handleEvents() {
  const F = G.F; let stop = false, i = 0;
  for (; i < F.events.length; i++) {
    const e = F.events[i];
    VOX.eventId = e.id || null;
    const f = e.side != null ? F.f[e.side] : null, o = e.side != null ? F.f[1 - e.side] : null;
    switch (e.type) {
      case 'hit': {
        if (!e.blocked && e.dmg > 0) { if (!G.recHits) G.recHits = []; G.recHits.push({ t: F.t, side: e.side, head: e.target === 'head', big: !!(e.crit || e.kd || e.ko || e.kind === 'hay' || e.special === 'piston') }); if (G.recHits.length > 40) G.recHits.shift(); }
        if (e.special) { const lab = { pile: 'PILEBUNKER', clamp: 'CLAMPED', mine: 'SEA MINE!', crank: 'SPIN-UP', lightning: 'CHAIN LIGHTNING' }[e.special], specialColor = e.special === 'mine' ? '#ff5a4a' : e.special === 'lightning' ? '#69e6ff' : '#f0b20a'; if (lab) addText(o.x, groundFor(o) - 300, lab, specialColor, e.special === 'mine' ? 38 : e.special === 'lightning' ? 30 : 26, 1); if (e.special === 'mine') { const an0 = anchors(o.spec.build); fire(o.x - f.dir * an0.half, groundFor(o) + an0.bodyY, 14); explosion(); if (S.opt.shake) G.shake = 18; } if (e.special === 'clamp' || e.special === 'lightning') { zap(); if (e.special === 'lightning') { sparks(o.x - f.dir * 18, groundFor(o) + anchors(o.spec.build).bodyY, f.dir, 16, false, true); if (S.opt.shake) G.shake = Math.max(G.shake, 7); } } }
        zoneHit(o.side, e.blocked ? (e.arm === 'rear' ? 'lead' : 'lead') : e.target === 'head' ? 'head' : 'torso', e.crit);
        if (!e.blocked && (e.crit || e.counterHit || e.dmg / DMG >= 9) && S.opt.punchcam !== false && !S.opt.reduced) G.pz = { t: .5, x: o.x };
        const vd = e.dmg / DMG, an = anchors(o.spec.build), x = o.x - f.dir * an.half, y = groundFor(o) + (e.target === 'head' ? an.headY : an.bodyY);
        sparks(x, y, f.dir, e.blocked ? 7 : 8 + Math.round(vd * 1.2), !e.blocked);
        G.flash[o.side] = e.blocked ? .2 : .8;
        if (S.opt.shake) G.shake = Math.max(G.shake, Math.min(16, vd * (e.blocked ? .3 : .9)));
        if (e.kind !== 'jab' && !e.blocked) { G.hitstop = e.kind === 'hay' ? .14 : .06; stop = true; }
        addText(x, y - 24, e.blocked ? 'BLOCK' : Math.round(e.dmg).toString(), e.blocked ? '#9fb3c2' : e.crit ? '#ff5a4a' : e.target === 'head' ? '#ffd24a' : '#ebe7de', e.blocked ? 22 : 18 + Math.min(18, vd), .8);
        if (e.crit) addText(x, y - 56, 'CRITICAL', '#ff5a4a', 26, .9);
        if (e.stag) addText(o.x, groundFor(o) - 260, 'STAGGERED', '#ff7a5a', 26, .9);
        if (!e.blocked) addFightHype(e.side, vd * .012 + (e.crit ? .15 : 0));
        if (vd > 9 && !e.blocked) { cheer(.3 + vd * .02); for (let j = 0; j < 3; j++) G.flashes.push({ x: Math.random() * W, y: 190 + Math.random() * 150, life: .15 }); }
        if (vd > 14 && !e.blocked && Math.random() < .5) ooh();
        thud(vd, e.blocked, e.kind, e.target, e.crit, { maker: hitMaker(o.spec, e.blocked ? 'arm' : e.target) }); ringHit(o, f.dir, vd, e);
        if (!e.blocked) {
          if (e.counterHit) crowdShout('counter', .94);
          else if (!e.ko && o.hp / o.s.hp <= .34) crowdShout('danger', .92);
          else if (e.ko) crowdShout('impact', 1.05);
          else if (e.crit || vd > 14) crowdShout('impact', .78);
        }
        const p = f.punch, sig = p && p.signature; if (G.tell && G.tell.side === f.side) G.tell = null;
        if (!e.blocked) {
          G.blockRun[o.side] = 0;
          const now = F.t, cl = G.combo[f.side]; cl.push(now); while (cl.length && now - cl[0] > 1.8) cl.shift();
          if (sig) { comm('sig', F, f.side, { sig: f.spec.signature.name }, 2); commColor('sigColor', F, f.side, null, .4); addText(f.x, groundFor(f) - 290, f.spec.signature.name.toUpperCase(), '#f0b20a', 30, 1.1); }
          else if (e.crit) { comm('crit', F, f.side, { target: e.target }, 2); commColor('critColor', F, f.side, null, .38); }
          else if (e.kind === 'hay') { comm('hay', F, f.side, null, 2); commColor('hayColor', F, f.side, null, .45); }
          else if (cl.length >= 3) { comm('combo', F, f.side); commColor('comboColor', F, f.side, null, .32); cl.length = 0; }
          else if (vd > 11 && Math.random() < .5) comm(e.target === 'head' ? 'bigHead' : 'bigBody', F, f.side);
        } else if (++G.blockRun[o.side] >= 4) { G.blockRun[o.side] = 0; commColor('blockColor', F, o.side, null, .6); }
        if (e.ko) { G.slow = 1; G.hitstop = .22; stop = true; addText(W / 2, 190, 'K.O.', '#f0b20a', 130, 2.4); G.hype = 1; floorCrash(); ringFall(o); roar(); }
        break; }
      case 'miss': if (e.glare) addText(f.x, groundFor(f) - 260, 'BLINDED BY THE GLARE', '#fff1c2', 20, .8); if (G.tell && G.tell.side === e.side) G.tell = null; whoosh(); if (f.punch && f.punch.signature) comm('sigMiss', F, e.side, { sig: f.spec.signature.name }, 2); break;
      case 'dodge': if (G.tell && G.tell.side === o.side) G.tell = null; addText(f.x, groundFor(f) - 250, 'DODGED', '#c9a6ff', 26, .8); whoosh(1.4); if (o.punch && o.punch.signature) { comm('sigMiss', F, o.side, { sig: o.spec.signature.name }, 2); commColor('slipColor', F, e.side, null, .5); } else if (Math.random() < .3) comm('dodge', F, o.side); break;
      case 'slip': { whoosh(.8); const g = groundFor(f); for (let j = 0; j < 3; j++) G.fx.push({ x: f.x - f.dir * (8 + j * 10), y: g - 120, vx: -f.dir * 30, vy: 0, life: .22, max: .22, s: 40 - j * 8, type: 'ghost', col: f.spec.paint }); break; }
      case 'windup': {
        servo(e.kind);
        if (e.signature && e.tell) G.tell = { side: e.side, text: e.tell, life: Math.max(.6, f.dur + .25), max: Math.max(.6, f.dur + .25), feint: false };
        else if (e.kind === 'hay') addText(f.x, groundFor(f) - 265, 'HAYMAKER', '#f0b20a', 30, .9);
        else if (e.kind === 'counter') addText(f.x, groundFor(f) - 255, 'COUNTER', '#4fe0ff', 24, .7);
        break; }
      case 'feint': if (e.tell) G.tell = { side: e.side, text: e.tell, life: .7, max: .7, feint: true }; servo('jab'); if (Math.random() < .35) comm('feint', F, e.side); break;
      case 'malf': { const [x, y] = partPos(f, e.part); sparks(x, y, -f.dir, 12, false, true); if (e.what === 'OVERHEAT') { for (let j = 0; j < 8; j++) smoke(f.x + (Math.random() - .5) * 30, y - 20, false); steam(); } addText(f.x, groundFor(f) - 275, e.what, '#ff9a3a', 28, 1.1); zap(); comm('malf', F, e.side, { what: e.what.toLowerCase() }, 2); commColor('malfColor', F, e.side, null, .35); break; }
      case 'detach': { const [x, y] = partPos(f, e.part); spawnDebris(f, e.part, -f.dir * (120 + Math.random() * 120), -380 - Math.random() * 120); sparks(x, y, -f.dir, 30, true); fire(x, y, 6); addText(f.x, groundFor(f) - 285, 'ARM TORN OFF', '#ff5a4a', 34, 1.4); if (S.opt.shake) G.shake = 14; G.hype = 1; tearOff(); ropeKick(f.x, 6); ringMark('oil', f.x, groundFor(f) + 4, 1.1); roar(.7); ooh(); comm('detach', F, 1 - e.side, null, 2); commColor('detachColor', F, e.side, null, .6); break; }
      case 'offline': addText(f.x, groundFor(f) - 285, e.part === 'head' ? 'HEAD OFFLINE' : 'LEGS LOCKED', '#ff9a3a', 30, 1.3); zap(); comm('offline', F, e.side, { what: e.part === 'head' ? 'head unit' : 'leg drive' }, 2); commColor('offlineColor', F, e.side, null, .35); break;
      case 'clinch': { addText(W / 2, 160, 'CLINCH', '#ebe7de', 40, .9); clank(.5); if (Math.random() < .7) say('pbp', pickLine('clinch', M5L.clinch), 1, { tts: true, ttl: 4200 }); else say('color', pickLine('clinchColor', M5L.clinchColor), 1, { tts: true, ttl: 5200 }); break; }
      case 'clinchShot': { const an = anchors(o.spec.build); sparks(o.x - f.dir * an.half * .6, groundFor(o) + an.bodyY + 10, -f.dir, 3, false); thud(4, false, 'jab', 'body'); zoneHit(o.side, 'torso', false); break; }
      case 'clinchBreak': { G.refT = Math.max(G.refT, 1); say('ref', 'Break!', 2, { tts: true, ttl: 2000 }); addText(W / 2, 160, 'BREAK!', '#f0b20a', 46, .8); break; }
      case 'hazard': {
        const lab = { scrap: 'SCRAP ON THE CANVAS', puddle: 'WATER ON THE CANVAS', fog: 'SEA FOG', heat: 'FURNACE FLARE' }[e.what]; addText(W / 2, 140, lab, '#ffb36a', 32, 1.6);
        if (e.what === 'scrap') { for (let i = 0; i < 12; i++) G.fx.push({ x: e.x + (Math.random() - .5) * 50, y: GROUND - 260 - Math.random() * 60, vx: (Math.random() - .5) * 90, vy: 120 + Math.random() * 100, life: .9, max: .9, col: '#7a7d82', s: 3.4, type: 'spark' }); clank(.6); }
        if (e.what === 'heat') { G.heatT = 3; for (const ff of F.f) smoke(ff.x, groundFor(ff) - 120, false); }
        if (e.what === 'puddle') G.fx.push({ x: e.x, y: 60, vx: 0, vy: 380, life: .5, max: .5, col: '#9fd3ff', s: 3, type: 'spark' });
        say('pbp', pickLine('hz' + e.what, M5L[e.what]), 2, { tts: true, ttl: 5200 }); break; }
      case 'knockdown': {
        const human = e.side === F.human;
        if (!human && G.replayRound !== F.round) { G.replayRound = F.round; G.wantReplay = 'kd'; }
        addText(W / 2, 170, 'DOWN!', '#ff5a4a', 96, 1.3); if (S.opt.shake) G.shake = 18; addFightHype(1 - e.side, .5); ooh(); roar(.8); crowdShout('danger', 1); G.refT = 99; G.refN = 0; thud(20, false, 'hay', 'body', false, { maker: hitMaker(f.spec, 'body') }); floorCrash(); ringFall(f); powerDown(); primeRefCount();
        comm(human ? 'downYou' : 'down', F, 1 - e.side, null, 3);
        if (human && !F.duo) { G.dial = { ph: Math.random() * 6, speed: 2.6 + f.kdTotal * .45, zoneC: (Math.random() - .5) * 1.4, zoneW: clamp(.78 - (f.kdTotal - 1) * .14 - (1 - f.hp / f.s.hp) * .2, .26, .78), lock: 0, flash: 0, miss: 0 }; ringing(true); setMuffle(.75); }
        break; }
      case 'kneel': { comm('kneel', F, 1 - e.side, null, 2); servo('hay'); const [x, y] = partPos(f, 'torso'); sparks(x, y, 1, 6, false, true); if (e.side === F.human) setMuffle(.4); break; }
      case 'boot': { bootHit(e.hits); const [x, y] = partPos(f, 'head'); sparks(x, y, 1, 8, false, true); if (G.dial) { G.dial.flash = 1; G.dial.zoneC = (Math.random() - .5) * 1.5; G.dial.speed += .35; } break; }
      case 'bootMiss': bootMiss(); if (G.dial) { G.dial.miss = 1; G.dial.lock = .45; } if (S.opt.shake) G.shake = 6; break;
      case 'count': { G.refN = e.n; beep(e.n >= 8); playRefCount(e.n); const d = F.f[e.side]; addText(d.x, groundFor(d) - 160, String(e.n), e.n >= 8 ? '#ff5a4a' : '#ebe7de', 90, .7); if (e.n >= 7) G.hype = 1; break; }
      case 'secondwind': addText(f.x, groundFor(f) - 305, 'SECOND WIND', '#6cc28a', 32, 1.4); comm('secondwind', F, e.side, null, 2); commColor('secondwindColor', F, e.side, null, .3); break;
      case 'rise': addText(f.x, groundFor(f) - 270, 'BACK UP!', '#6cc28a', 40, 1.2); G.refT = .8; cheer(.8); roar(.6); crowdShout('comeback', .95); powerUp(); comm('rise', F, 1 - e.side, { n: e.n }, 3); commColor('riseColor', F, e.side, { n: e.n }, .5); if (e.side === F.human) { G.dial = null; ringing(false); setMuffle(0); } break;
      case 'resume': addText(W / 2, 200, 'FIGHT', '#f0b20a', 64, .9); break;
      case 'bell': {
        if (F.round < F.cfg.rounds) setTimeout(() => showL3(F), 1700);
        addText(W / 2, 190, F.round >= F.cfg.rounds ? 'FINAL BELL' : `END OF ROUND ${e.round}`, '#ebe7de', 64, 1.6); bell(1); cheer(.5);
        comm('bell', F, 0, { n: e.round }, 2); const sc = F.scores[F.scores.length - 1];
        if (sc && F.round < F.cfg.rounds) { if (sc[0] !== sc[1]) say('color', fill(pickLine('bellWin', LINES.bellWin), { a: F.f[sc[0] > sc[1] ? 0 : 1].spec.name }), 1, { ttl: 6000 }); else say('color', pickLine('bellEven', LINES.bellEven), 1, { ttl: 6000 }); }
        break; }
      case 'round': pyro(); addText(W / 2, 170, `ROUND ${e.round}`, '#ebe7de', 52, 1.3); addText(W / 2, 220, 'FIGHT', '#f0b20a', 72, 1.3); G.refT = 1.4; G.refN = 0; G.late = 0; G.comeback = 0; bell(3); cheer(.6); comm(e.round === F.cfg.rounds ? 'final' : 'round', F, 0, { n: e.round }, 2); if (e.round === F.cfg.rounds) startChant('stomp'); break;
      case 'end': {
        if (e.reason !== 'Decision') G.wantReplay = 'ko';
        G.dial = null; ringing(false); setMuffle(0);
        if (e.reason !== 'Decision') pyro();
        if (e.reason === 'Decision') { addText(W / 2, 250, 'DECISION ' + e.detail, '#f0b20a', 48, 2.4); roar(.6); say('ring', `Ladies and gentlemen, after ${F.cfg.rounds} rounds, the judges score it ${e.detail.replace('–', ' to ')}... for the winner... ${F.f[e.winner].spec.name}!`, 3, { critical: true, assetKey: 'ring.decision' }); }
        else if (e.reason === 'TKO') { addText(W / 2, 190, 'T.K.O.', '#f0b20a', 120, 2.4); G.hype = 1; roar(); G.slow = .8; comm('tko', F, e.winner, null, 3); }
        else if (e.detail === 'Counted out') { addText(W / 2, 190, 'COUNTED OUT', '#f0b20a', 84, 2.4); roar(); comm('counted', F, e.winner, null, 3); }
        else comm('ko', F, e.winner, null, 3);
        G.refT = 2.5; break; }
      case 'choose': if (F.human === e.side) addText(W / 2, 140, 'DESTROY OR SPARE?', '#ff5a4a', 54, 2.5); else addText(W / 2, 140, 'THE CROWD WANTS IT...', '#ebe7de', 40, 2); G.hype = 1; sting(); startChant('stomp'); comm('choose', F, e.side, null, 2); break;
      case 'fwindup': addText(f.x, groundFor(f) - 290, 'FINISHER', '#ff5a4a', 44, 1.2); G.slow = .6; servo('hay'); break;
      case 'decap': { const L = F.f[1 - e.side], [x, y] = partPos(L, 'head'); spawnDebris(L, 'head', f.dir * 160, -620); fire(x, y, 26); sparks(x, y, f.dir, 50, true); for (let j = 0; j < 14; j++) smoke(x + (Math.random() - .5) * 40, y, true); G.screen = 1; if (S.opt.shake) G.shake = 26; G.hitstop = .25; stop = true; addText(W / 2, 200, 'DESTROYED', '#ff5a4a', 120, 2.6); G.hype = 1; explosion(); tearOff(); ropeKick(L.x, 10); ringMark('scorch', L.x, groundFor(L) + 3, 1.7); ringMark('oil', L.x, groundFor(L) + 4, 1.3); roar(1.3); comm('destroy', F, e.side, null, 3); commColor('destroyColor', F, e.side, null, .8); break; }
      case 'spare': addText(W / 2, 200, 'SPARED', '#6cc28a', 100, 2.2); cheer(.8); comm('spare', F, e.side, null, 3); commColor('spareColor', F, e.side, null, .7); break;
      case 'flywheel': addText(f.x, groundFor(f) - 270, 'FLYWHEEL · FREE HAYMAKER', '#f0b20a', 22, .9); break;
      case 'whistle': addText(f.x, groundFor(f) - 270, 'STEAM VENT', '#ebe7de', 22, .9); for (let j = 0; j < 8; j++) smoke(f.x - f.dir * 40, groundFor(f) - 180 - j * 6, false); steam(); break;
      case 'cond': {
        const C = CONDS[e.cond], [x, y] = partPos(f, e.part); zoneHit(e.side, e.part, true);
        addText(f.x, groundFor(f) - 292, e.sev >= 3 ? C.short + ' · CRITICAL' : e.sev > 1 ? C.short + ' WORSE' : C.short, e.sev >= 3 ? '#ff5a4a' : '#ff9a3a', 28, 1.3);
        if (e.cond === 'oil') { for (let j = 0; j < 10; j++) G.fx.push({ x: x + (Math.random() - .5) * 16, y, vx: (Math.random() - .5) * 60, vy: -40 - Math.random() * 80, life: .7, max: .7, col: '#0b0b0c', s: 3, type: 'spark' }); clank(.4); }
        else if (e.cond === 'leak') { for (let j = 0; j < 10; j++) smoke(x + (Math.random() - .5) * 20, y - 10, false); steam(); }
        else if (e.cond === 'glitch') { zap(); sparks(x, y, -f.dir, 10, false, true); }
        else { sparks(x, y, -f.dir, 14, true); clank(.5); }
        if (e.sev === 1 || e.sev === 3) commCond(e.sev === 3 ? 'condMax' : 'cond_' + e.cond, F, e.side, { part: { lead: 'lead arm', rear: 'rear arm', legs: 'legs', head: 'head', torso: 'chassis' }[e.part], cname: C.name.toLowerCase() });
        break; }
      case 'condEnd': if (e.how === 'rebooted') { addText(f.x, groundFor(f) - 292, 'SENSORS REBOOTED', '#6cf0a0', 26, 1.1); bootHit(2); } else if (e.how === 'wore off') addText(f.x, groundFor(f) - 292, CONDS[e.cond].short + ' CLEARED', '#9fb3c2', 20, .9); break;
      case 'callLost': addText(f.x, groundFor(f) - 280, 'CALL LOST · SENSOR GLITCH', '#ff9a3a', 22, 1); bootMiss(); if (e.side === F.human) commCond('callLost', F, e.side, null); break;
      case 'callLate': addText(f.x, groundFor(f) - 280, 'SIGNAL DELAYED…', '#e8a33a', 20, .8); blip(); break;
      case 'slick': addText(f.x, groundFor(f) - 250, e.what === 'scrap' ? 'STEPPED ON SCRAP' : e.what === 'puddle' ? 'SLIPPING IN WATER' : 'SLIPPING ON OIL', '#c9c4ba', 22, .9); whoosh(.6); if (Math.random() < .4) commCond(e.what === 'scrap' || e.what === 'puddle' ? 'slick' + e.what : 'slick', F, e.side, null); break;
      case 'plate': { const [x, y] = partPos(f, 'torso'); G.debris.push({ kind: 'plate', build: f.spec.build, paint: f.spec.paint, x, y, vx: -f.dir * (140 + Math.random() * 80), vy: -320, rot: 0, vr: (Math.random() - .5) * 12, dir: f.dir, side: 'torso', rest: false, floor: groundFor(f) }); clank(1); sparks(x, y, -f.dir, 20, true); addText(f.x, groundFor(f) - 292, 'ARMOUR PLATE OFF', '#ff5a4a', 30, 1.3); commCond('plate', F, e.side, null); break; }
      case 'weld': { if (e.fixed) addText(f.x, groundFor(f) - 250, 'FIXED', '#6cc28a', 26, 1); const [x, y] = partPos(f, e.part); sparks(x, y, f.dir, 18, true); G.weldT[f.side] = .6; weld(); if (e.reattach) addText(f.x, groundFor(f) - 270, 'ARM REATTACHED', '#6cc28a', 30, 1.2); break; }
      case 'cmd': if (e.side === F.human) addText(f.x, groundFor(f) - 280, { head: 'GO HEAD!', body: 'WORK THE BODY!', guard: 'COVER UP!', hay: 'LOAD IT UP!', sig: f.spec.signature ? f.spec.signature.name.toUpperCase() + '!' : 'SIGNATURE!' }[e.cmd] || '', '#ebe7de', 24, .8); break;
    }
    if (stop) { i++; break; }
  }
  F.events.splice(0, i);
  VOX.eventId = null;
  return stop;
}
/* ---- pilot inputs ---- */
function pilotInputs() {
  const F = G.F; if (F.controlMode !== 'pilot' || F.human < 0) return;
  const apply = (f, a, b) => { const h = k => a.has(k) || b.has(k); f.screenIntent = (h('right') ? 1 : 0) - (h('left') ? 1 : 0); f.laneIntent = (h('near') ? 1 : 0) - (h('far') ? 1 : 0); f.guardHold = h('guard'); };
  apply(F.f[F.human], G.held, G.padHeld[0]);
  if (F.duo) apply(F.f[1], G.held2, G.padHeld[1]);
}
function clearHeld() { if (!G) return; G.held.clear(); const f = G.F.f[0]; if (f) { f.screenIntent = f.laneIntent = 0; f.guardHold = false; } document.querySelectorAll('#dock [data-move],#dock [data-hold]').forEach(b => b.setAttribute('aria-pressed', 'false')); }
function setHeld(k, on) { if (!G) return; if (on) G.held.add(k); else G.held.delete(k); document.querySelectorAll(`#dock [data-move="${k}"],#dock [data-hold="${k}"]`).forEach(b => b.setAttribute('aria-pressed', String(on))); }
function setControl(mode) {
  if (!G || G.spectate) return; const F = G.F, f = F.f[0]; clearHeld();
  F.controlMode = mode; S.ctrl = mode; save(); f.manualQueue = []; f.queue = [];
  if (f.directGuard) { f.directGuard = false; f.coverT = 0; if (f.st === 'block') setSt(f, 'idle', 0); }
  G.dockMode = ''; syncCtrlBtn(); uiClick();
}
function syncCtrlBtn() { const b = $('#ctrlBtn'); if (!b || !G) return; b.hidden = G.spectate; b.innerHTML = G.F.controlMode === 'pilot' ? '<b>Pilot</b><small>You drive · C</small>' : '<b>Coach</b><small>Bot drives · C</small>'; }
/* ---- reboot dial ---- */
function dialAngle() { return Math.sin(G.dial.ph) * 1.25; }
function pressReboot() {
  if (!G || !G.dial) return false; const F = G.F, me = F.f[F.human];
  if (F.phase !== 'count' || !F.count || F.count.side !== F.human || !(me.st === 'down' || me.st === 'kneel')) return false;
  if (G.dial.lock > 0) return true;
  if (Math.abs(dialAngle() - G.dial.zoneC) <= G.dial.zoneW / 2) issue(F, F.human, 'boot'); else issue(F, F.human, 'bootMiss');
  handleEvents(); return true;
}
function drawDial(t) {
  const D = G.dial, F = G.F, C = F.count; if (!D || !C) return;
  const cx = W / 2, cy = H - 92, R = 70, a0 = -Math.PI / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(8,9,11,.78)'; ctx.beginPath(); ctx.arc(cx, cy, R + 26, Math.PI, 0); ctx.lineTo(cx + R + 26, cy + 30); ctx.lineTo(cx - R - 26, cy + 30); ctx.closePath(); ctx.fill();
  ctx.lineWidth = 12; ctx.strokeStyle = '#2a2e33'; ctx.beginPath(); ctx.arc(cx, cy, R, a0 - 1.35, a0 + 1.35); ctx.stroke();
  ctx.strokeStyle = D.flash > 0 ? '#ffffff' : '#6cf0a0'; ctx.shadowColor = '#6cf0a0'; ctx.shadowBlur = 12; ctx.beginPath(); ctx.arc(cx, cy, R, a0 + D.zoneC - D.zoneW / 2, a0 + D.zoneC + D.zoneW / 2); ctx.stroke(); ctx.shadowBlur = 0;
  const na = a0 + dialAngle(); ctx.strokeStyle = D.miss > 0 ? '#ff5a4a' : '#f0b20a'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(na) * (R + 8), cy + Math.sin(na) * (R + 8)); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = '#ebe7de'; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 7); ctx.fill();
  ctx.textAlign = 'center'; ctx.font = '600 22px Teko, sans-serif'; ctx.fillStyle = D.miss > 0 ? '#ff5a4a' : '#6cf0a0'; ctx.fillText(D.miss > 0 ? 'SIGNAL LOST' : 'SYSTEM REBOOT', cx, cy - R - 32);
  for (let i = 0; i < C.needHits; i++) { ctx.fillStyle = i < C.hits ? '#6cf0a0' : '#2a2e33'; ctx.fillRect(cx - C.needHits * 13 + i * 26 + 3, cy + 10, 20, 7); }
  ctx.font = '500 12px "IBM Plex Mono", monospace'; ctx.fillStyle = 'rgba(235,231,222,.85)'; ctx.fillText(C.hits >= C.needHits ? 'SYSTEMS ONLINE · GETTING UP' : 'SPACE / TAP WHEN THE NEEDLE IS IN THE GREEN', cx, cy + 34);
  ctx.restore(); ctx.textAlign = 'left';
}
/* ---- camera + render ---- */
function camX() { const z = G.cam.z; return clamp(G.cam.x, W / (2 * z), W - W / (2 * z)); }
function camY() { const z = G.cam.z; return clamp(G.cam.y || H / 2 + (z - 1) * 120, H / (2 * z), H - H / (2 * z)); }
function frame(ts) {
  if (!G) return;
  const dt = Math.min(.05, (ts - G.last) / 1000); G.last = ts;
  const F = G.F;
  if (G.paused) { render(ts / 1000, dt); return; }
  if (G.replay) { stepReplay(dt); render(ts / 1000, dt); return; }
  if (G.intro) { G.intro.t += dt; runIntro(); if (G.intro.t >= G.intro.dur) startBout(); }
  else if (G.hitstop > 0) G.hitstop -= dt;
  else if (F.events.length) handleEvents();
  else { pilotInputs(); G.acc += dt * (G.slow > 0 ? .3 : 1) * G.speed; let n = 0; while (G.acc >= DT && n < 8) { stepFight(F); G.acc -= DT; n++; if (handleEvents()) { G.acc = 0; break; } } }
  if (!G.intro) recordFrame(F);
  if (G.wantReplay) { const w = G.wantReplay; G.wantReplay = null; if (S.opt.replays !== false) startReplay(w); }
  G.slow = Math.max(0, G.slow - dt);
  G.heatT = Math.max(0, (G.heatT || 0) - dt); if (G.pz) G.pz.t -= dt; if (S.opt.reduced) { G.shake = 0; G.screen = 0; G.flash = G.flash.map(() => 0); } G.shake *= Math.pow(.0015, dt); G.flash = G.flash.map(v => Math.max(0, v - dt * 4)); if (G.zf) for (const zz of G.zf) for (const k in zz) zz[k] = Math.max(0, zz[k] - dt * 3); G.screen = Math.max(0, G.screen - dt * 1.6);
  G.hype += ((G.intro ? .5 : .28) - G.hype) * dt * .25; G.refT = Math.max(0, G.refT - dt); G.weldT = G.weldT.map(v => Math.max(0, v - dt));
  if (G.tell) { G.tell.life -= dt; if (G.tell.life <= 0) G.tell = null; }
  for (const p of G.fx) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.type === 'spark') p.vy += 900 * dt; else if (p.type === 'fire') { p.vx *= .92; p.vy = p.vy * .92 - 40 * dt; } else if (p.type === 'smoke') p.s += 10 * dt; }
  G.fx = G.fx.filter(p => p.life > 0 && p.y < GROUND + 80);
  if (G.fx.length > 700) G.fx.splice(0, G.fx.length - 700);
  for (const d of G.debris) { if (d.rest) continue; d.vy += 1400 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.rot += d.vr * dt; if (d.y > d.floor - 6) { d.y = d.floor - 6; d.vy *= -.35; d.vx *= .6; d.vr *= .5; if (Math.abs(d.vy) < 60) { d.rest = true; d.vy = 0; } clank(.4); } if (d.x < 30 || d.x > W - 30) { d.vx *= -.5; d.x = clamp(d.x, 30, W - 30); } if (!d.rest && Math.random() < .5) sparks(d.x, d.y, 1, 1, true); }
  for (const t of G.texts) { t.life -= dt; t.y -= 18 * dt; } G.texts = G.texts.filter(t => t.life > 0);
  for (const fl of G.flashes) fl.life -= dt; G.flashes = G.flashes.filter(f => f.life > 0);
  if (Math.random() < G.hype * dt * 3) G.flashes.push({ x: Math.random() * W, y: 190 + Math.random() * 150, life: .12 });
  if (!G.intro) for (const f of F.f) {
    const an = anchors(f.spec.build), g = groundFor(f);
    if (f.hp / f.s.hp < .3 && f.st !== 'wreck' && !DOWN.has(f.st) && Math.random() < dt * 6) smoke(f.x + (Math.random() - .5) * 20, g + an.bodyY - 40, f.hp / f.s.hp < .15);
    if (f.st === 'wreck' && Math.random() < dt * 10) { smoke(f.x - f.dir * 60, g - 30, true); if (Math.random() < .3) sparks(f.x - f.dir * 70, g - 30, 1, 3, true); }
    if ((f.st === 'down' || f.st === 'kneel') && Math.random() < dt * 4) sparks(f.x, g + an.bodyY * .5, 1, 2, false, true);
    for (const k of ['lead', 'rear', 'head']) if (f.lost[k] && Math.random() < dt * 5 && !DOWN.has(f.st)) { const [x, y] = partPos(f, k); sparks(x, y, -f.dir, 3, true); }
    if (f.heat > 80 && !DOWN.has(f.st) && Math.random() < dt * 8) smoke(f.x - f.dir * 30, g + an.bodyY - 30, false);
    for (const k in f.cond) { const c = f.cond[k]; if (!c || DOWN.has(f.st)) continue; const rate = dt * (2 + c.sev * 2.5); if (Math.random() > rate) continue; const [x, y] = partPos(f, k);
      if (c.type === 'oil') G.fx.push({ x: x + (Math.random() - .5) * 18, y: y + 12, vx: (Math.random() - .5) * 10, vy: 20, life: 1, max: 1, col: '#0b0b0c', s: 2.6, type: 'spark' });
      else if (c.type === 'leak') smoke(x - f.dir * 12, y - 18, false);
      else if (c.type === 'gear' || c.type === 'stutter') sparks(x, y, -f.dir, 2, true);
      else if (c.type === 'glitch') sparks(x, y - 6, f.dir, 1, false, true);
      else if (c.type === 'drain') sparks(x, y, 1, 1, false, true); }
  }
  // knockdown vision
  const meDown = !G.spectate && F.phase === 'count' && F.count && F.count.side === F.human;
  const kdTarget = meDown ? (F.f[F.human].st === 'kneel' ? .55 : 1) : 0;
  G.kdv += (kdTarget - G.kdv) * Math.min(1, dt * (kdTarget > G.kdv ? 4 : 2));
  if (G.kdv > .05) { G.hbT -= dt; if (G.hbT <= 0) { heartbeat(); G.hbT = .78; } }
  if (G.dial) { const D = G.dial; D.ph += dt * D.speed; D.lock = Math.max(0, D.lock - dt); D.flash = Math.max(0, D.flash - dt * 3); D.miss = Math.max(0, D.miss - dt * 2.5); }
  // camera
  const [a, b] = F.f; let tz = 1.1, tx = (a.x + b.x) / 2;
  let ty = null;
  if (G.intro) { const st = introState(G.intro.t); tz = st.cam.z; tx = st.cam.x; ty = st.cam.y ?? null; }
  else if (F.phase === 'finisher' || (F.phase === 'done' && F.reason !== 'Decision')) tz = 1.22;
  else if (G.pz && G.pz.t > 0 && F.phase === 'fight') { const k = Math.min(1, G.pz.t / .18); tz += .13 * k; tx = tx * (1 - .45 * k) + G.pz.x * .45 * k; }
  else if (F.phase === 'count' && F.count) { tz = F.count.side === F.human ? 1.3 : 1.18; tx = F.f[F.count.side].x; }
  if (!G.intro && innerWidth < innerHeight) tz += .22;
  const ck = G.intro ? 4 : 2.5; G.cam.z += (tz - G.cam.z) * Math.min(1, dt * ck); G.cam.x += (tx - G.cam.x) * Math.min(1, dt * (ck + .5)); const dy = ty == null ? H / 2 + (G.cam.z - 1) * 120 : ty; G.cam.y = G.cam.y ? G.cam.y + (dy - G.cam.y) * Math.min(1, dt * ck) : dy;
  if (F.phase === 'break' && G.prevPhase === 'break') { G.cornerT -= dt * G.speed; if (G.cornerT <= 0 && (G.dockMode === 'corner' || G.spectate)) ringBell(); }
  if (!G.intro && F.phase === 'fight') {
    const ra = a.hp / a.s.hp, rb = b.hp / b.s.hp, lead = Math.abs(ra - rb) > .12 ? (ra > rb ? 0 : 1) : G.lead;
    if (G.lead >= 0 && lead !== G.lead && !G.comeback) { G.comeback = 1; comm('comeback', F, lead, null, 2); }
    G.lead = lead;
    if (!G.late && F.cfg.roundLen - F.rt < 10) { G.late = 1; comm('late', F, 0, null, 1); }
    for (const f of F.f) if (f.hp / f.s.hp < .22 && !G['dg' + f.side]) { G['dg' + f.side] = 1; comm('danger', F, 1 - f.side, null, 2); }
  }
  render(ts / 1000, dt); hud(); dockTick(dt); musicIntensity(); tickCrowdShouts(); if (!G.intro) commIdle(F, dt);
}
let loopId = 0;
function startLoop() { const id = ++loopId; const step = ts => { if (id !== loopId || !G) return; try { frame(ts); } catch (err) { console.error(err); } requestAnimationFrame(step); }; requestAnimationFrame(step); }
function drawBelt(c, f, x, ground, sc) {
  const n = f.spec.id === 'you' && !G.spectate ? Object.keys(S.belts).length : f.spec.id !== 'you' && isChamp(f.spec.id) && !S.belts[f.spec.lg] ? 1 : 0; if (!n) return;
  const an = anchors(f.spec.build), w = an.D.T.w * .98 * sc, y = ground + (an.hip - 18) * sc, h = 14 * sc;
  c.save(); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#ffe08a'); g.addColorStop(.5, '#d39a12'); g.addColorStop(1, '#8a5a06'); c.fillStyle = '#3a1a14'; c.fillRect(x - w / 2, y, w, h); c.fillStyle = g; c.fillRect(x - w / 2, y + h * .2, w, h * .6);
  c.beginPath(); c.ellipse(x, y + h / 2, 17 * sc, 13 * sc, 0, 0, 7); c.fill(); c.strokeStyle = '#5a3a06'; c.lineWidth = 1.5 * sc; c.stroke(); c.fillStyle = '#c7362f'; c.beginPath(); c.arc(x, y + h / 2, 5 * sc, 0, 7); c.fill();
  if (n > 1) { c.fillStyle = '#16181b'; c.font = `600 ${10 * sc}px Teko, sans-serif`; c.textAlign = 'center'; c.fillText('×' + n, x + 26 * sc, y + h * .8); c.textAlign = 'left'; } c.restore();
}
function drawFighter(f, i, x, ground, sc, st, p, punch, walk, t) {
  if (st === 'clinch') x += f.dir * 14;
  const strikeStep = st === 'strike' ? 14 : st === 'recover' && punch ? 5 : 0;
  drawRobot(ctx, { st, build: f.spec.build, paint: f.spec.paint, accent: f.spec.accent, decal: f.spec.decal, num: f.spec.num, tally: f.spec.tally, wear: f.spec.wear, wseed: f.spec.wseed, workbookCombat: f.spec.workbookCombat, x: x + f.dir * strikeStep, ground, dir: f.dir, scale: sc, pose: poseFrom(st, p, punch, t, walk, i), t,
    dmg: { hpF: f.hp / f.s.hp, kd: 0, head: frac(f, 'head'), lead: frac(f, 'lead'), rear: frac(f, 'rear'), legs: frac(f, 'legs'), lost: f.lost, glitch: f.glitchT > 0 || st === 'kneel' || !!(f.cond.head && f.cond.head.type === 'glitch' && Math.sin(t * 9 + i) > .2), heat: f.heat + (f.cond.torso && f.cond.torso.type === 'leak' ? 20 : 0) }, scratches: G.scratches[i], flash: G.flash[i] });
  if ((G.intro || st === 'victory' || st === 'idle' && G.F.phase === 'done') && !DOWN.has(st)) drawBelt(ctx, f, x, ground, sc);
}
function render(t, dt) {
  const F = G.F, z = G.cam.z;
  ctx.setTransform(aScale, 0, 0, aScale, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const cx = camX(), cy = camY(), sh = S.opt.shake ? G.shake : 0;
  ctx.save(); ctx.translate(W / 2 + (Math.random() - .5) * sh, H / 2 + (Math.random() - .5) * sh); ctx.scale(z, z); ctx.translate(-cx, -cy);
  ctx.drawImage(layerBack, 0, 0); drawCrowd(ctx, t, G.hype); drawVenueBG(t);
  for (const fl of G.flashes) { ctx.fillStyle = `rgba(255,255,255,${Math.min(1, fl.life * 6)})`; ctx.beginPath(); ctx.arc(fl.x, fl.y, 3, 0, 7); ctx.fill(); }
  ctx.drawImage(layerRing, 0, 0); if (G.ropeAmp) { G.ropeAmp *= Math.pow(.015, dt); if (G.ropeAmp < .05) G.ropeAmp = 0; } drawRingRopes(ctx, t, G.ropeAmp || 0, G.ropeX); if (G.marks) ctx.drawImage(G.marks, 0, 0);
  markSlicks(G.F.slicks);
  for (const sl of (G.F.slicks || [])) { const a = Math.min(1, sl.t / 1.5), sx = sl.x, sy = GROUND + sl.z * .34 + 4;
    if (sl.kind === 'scrap') { ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < 9; i++) { const r1 = Math.sin(sl.x * 7.1 + i * 12.9) * .5 + .5, r2 = Math.sin(sl.x * 3.3 + i * 5.7) * .5 + .5; ctx.fillStyle = ['#5d6168', '#7a6248', '#8c8f94', '#3f4247'][i % 4]; ctx.save(); ctx.translate(sx + (r1 - .5) * sl.r * 2.2, sy + (r2 - .5) * sl.r * .5); ctx.rotate(r1 * 6); if (i % 3 === 0) { ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, 7); ctx.fill(); ctx.fillStyle = '#2a2c30'; ctx.beginPath(); ctx.arc(0, 0, 1.4, 0, 7); ctx.fill(); } else ctx.fillRect(-6, -2, 12 + r2 * 6, 3.5); ctx.restore(); } ctx.restore(); continue; }
    if (sl.kind === 'puddle') { ctx.save(); ctx.globalAlpha = .55 * a; ctx.fillStyle = '#1d3a52'; ctx.beginPath(); ctx.ellipse(sx, sy, sl.r * 1.2, sl.r * .3, 0, 0, 7); ctx.fill(); ctx.globalAlpha = .4 * a; ctx.strokeStyle = '#9fd3ff'; ctx.lineWidth = 1; const rr = (t * 22 + sl.x) % 18; ctx.beginPath(); ctx.ellipse(sx + 6, sy, 4 + rr, (4 + rr) * .3, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = .3 * a; ctx.fillStyle = '#cfe8ff'; ctx.beginPath(); ctx.ellipse(sx - sl.r * .35, sy - 2, sl.r * .35, 2, -.1, 0, 7); ctx.fill(); ctx.restore(); continue; }
    ctx.save(); ctx.globalAlpha = .82 * a; ctx.fillStyle = '#09090b'; ctx.beginPath(); ctx.ellipse(sx, sy, sl.r * 1.15, sl.r * .32, 0, 0, 7); ctx.fill(); ctx.globalAlpha = .28 * a; ctx.fillStyle = '#7a8aa0'; ctx.beginPath(); ctx.ellipse(sx - sl.r * .3, sy - sl.r * .08, sl.r * .4, sl.r * .07, -.1, 0, 7); ctx.fill(); ctx.globalAlpha = .18 * a; ctx.fillStyle = '#b48cff'; ctx.beginPath(); ctx.ellipse(sx + sl.r * .25, sy + sl.r * .05, sl.r * .3, sl.r * .05, .1, 0, 7); ctx.fill(); ctx.restore(); }
  const fogK = Math.max(...G.F.f.map(f => f.fogT || 0)) / 7;
  drawFogBanks(ctx, t, fogK);
  if (G.heatT > 0) { ctx.save(); const k = Math.min(1, G.heatT / 1.2); const g = ctx.createLinearGradient(0, H, 0, 0); g.addColorStop(0, `rgba(255,110,20,${.32 * k})`); g.addColorStop(.6, `rgba(255,140,40,${.1 * k})`); g.addColorStop(1, 'rgba(255,140,40,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  ctx.globalCompositeOperation = 'lighter';
  if (curVenue !== 'lot') for (const [x0, ph] of [[300, 0], [660, 1.7]]) { const sw = Math.sin(t * .4 + ph) * 30, g = ctx.createLinearGradient(0, 0, 0, GROUND + 30); g.addColorStop(0, 'rgba(255,240,200,.1)'); g.addColorStop(1, 'rgba(255,240,200,.02)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0 - 18, 0); ctx.lineTo(x0 + 18, 0); ctx.lineTo(x0 + 160 + sw, GROUND + 30); ctx.lineTo(x0 - 160 + sw, GROUND + 30); ctx.closePath(); ctx.fill(); }
  ctx.globalCompositeOperation = 'source-over';
  for (const d of G.debris) drawDebris(d, t);
  if (F.phase === 'break' && !G.intro) { drawMechanic(t, 0); drawMechanic(t, 1); }
  let ist = null;
  if (G.intro) {
    ist = introState(G.intro.t);
    const fs = [[F.f[0], 0, ist.a], [F.f[1], 1, ist.b]];
    for (const [f, i, s] of fs) { f.dir = i ? -1 : 1; drawFighter(f, i, s.x, GROUND, 1, s.st, 0, null, s.walk, t); }
    if (ist.face > 0) { G.refT = Math.max(G.refT, .3); }
  } else {
    const busy = s => s === 'windup' || s === 'strike' || s === 'fwindup' || s === 'fstrike';
    const order = [0, 1].sort((x, y) => (F.f[x].z - F.f[y].z) || ((busy(F.f[x].st) ? 1 : 0) - (busy(F.f[y].st) ? 1 : 0)));
    for (const i of order) {
      const f = F.f[i], p = f.dur > 0 && f.dur < 90 ? f.stT / f.dur : (DOWN.has(f.st) ? f.stT / .55 : 0);
      drawFighter(f, i, f.x, groundFor(f), zScale(f), f.st, p, f.punch, f.walk, t);
      if (i === F.human && F.phase === 'fight' && (f.focus.head > 0 || f.focus.body > 0)) { ctx.fillStyle = 'rgba(240,178,10,.9)'; ctx.font = '500 13px "IBM Plex Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText(f.focus.head > 0 ? 'HEAD HUNT ' + f.focus.head.toFixed(1) : 'BODY WORK ' + f.focus.body.toFixed(1), f.x, groundFor(f) + 26); ctx.textAlign = 'left'; }
      if (F.phase === 'count' && F.count && F.count.side === i && i !== F.human) { const C = F.count, k = clamp(C.prog / C.need, 0, 1), y = groundFor(f) + 30; ctx.fillStyle = 'rgba(8,9,11,.75)'; ctx.fillRect(f.x - 56, y - 16, 112, 24); ctx.fillStyle = '#2a2e33'; ctx.fillRect(f.x - 48, y - 2, 96, 5); ctx.fillStyle = k > .8 ? '#6cf0a0' : '#4fe0ff'; ctx.fillRect(f.x - 48, y - 2, 96 * k, 5); ctx.fillStyle = '#ebe7de'; ctx.font = '500 10px "IBM Plex Mono", monospace'; ctx.textAlign = 'center'; ctx.fillText('REBOOTING', f.x, y - 5); ctx.textAlign = 'left'; }
    }
  }
  for (const p of G.fx) {
    const a = Math.max(0, p.life / p.max);
    if (p.type === 'smoke') { ctx.fillStyle = p.dark ? `rgba(25,25,27,${a * .6})` : `rgba(70,70,74,${a * .45})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill(); }
    else if (p.type === 'fire') { ctx.globalCompositeOperation = 'lighter'; const pc = p.pc && PYRO[p.pc]; ctx.fillStyle = pc ? `rgba(${pc[0] + (255 - pc[0]) * a * .35 | 0},${pc[1] + (255 - pc[1]) * a * .35 | 0},${pc[2] + (255 - pc[2]) * a * .35 | 0},${a * .75})` : `rgba(255,${120 + a * 100 | 0},40,${a * .7})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * (1.4 - a * .4), 0, 7); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; }
    else if (p.type === 'ghost') { ctx.globalAlpha = a * .35; ctx.fillStyle = p.col; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.s * .5, p.s * 1.6, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
    else { ctx.strokeStyle = p.col; ctx.globalAlpha = a; ctx.lineWidth = p.s; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .02, p.y - p.vy * .02); ctx.stroke(); ctx.globalAlpha = 1; }
  }
  if (G.refT > 0 || F.phase === 'count') drawRef(t);
  const meGl = !G.spectate && F.human >= 0 && F.f[F.human].cond.head && F.f[F.human].cond.head.type === 'glitch';
  if (G.tell && !G.intro && !(meGl && G.tell.side !== F.human && F.controlMode === 'pilot')) { const f = F.f[G.tell.side], a = Math.min(1, G.tell.life / G.tell.max * 3), y = groundFor(f) - 300; ctx.save(); ctx.globalAlpha = a; ctx.font = '600 21px Teko, sans-serif'; const w = ctx.measureText(G.tell.text).width + 26; ctx.fillStyle = G.tell.feint ? 'rgba(40,44,52,.88)' : 'rgba(120,24,20,.9)'; rr(ctx, f.x - w / 2, y - 22, w, 30, 6); ctx.fill(); ctx.strokeStyle = G.tell.feint ? '#8f969d' : '#ff5a4a'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.fillText(G.tell.text, f.x, y); ctx.textAlign = 'left'; ctx.restore(); }
  const hz = ctx.createLinearGradient(0, 250, 0, GROUND); hz.addColorStop(0, 'rgba(120,120,130,0)'); hz.addColorStop(1, `rgba(120,120,130,${.06 + Math.sin(t * .7) * .02})`); ctx.fillStyle = hz; ctx.fillRect(0, 250, W, GROUND - 250);
  drawVenueFG(t);
  ctx.drawImage(layerFront, 0, 0);
  ctx.restore();
  ctx.textAlign = 'center';
  for (const tx of G.texts) {
    const a = Math.min(1, tx.life / tx.max * 2.5), k = 1 + (1 - tx.life / tx.max) * .08;
    const sx = (tx.x - cx) * z + W / 2, sy = (tx.y - cy) * z + H / 2;
    ctx.globalAlpha = a; ctx.font = `600 ${tx.size * k}px Teko, sans-serif`; ctx.lineWidth = Math.max(3, tx.size / 10); ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(tx.s, sx, sy); ctx.fillStyle = tx.col; ctx.fillText(tx.s, sx, sy);
  }
  ctx.globalAlpha = 1; ctx.textAlign = 'left';
  if (meGl && !G.intro && Math.random() < .35) { ctx.save(); ctx.fillStyle = 'rgba(200,220,255,.07)'; for (let q = 0; q < 5; q++) ctx.fillRect(0, Math.random() * H, W, 1 + Math.random() * 3); ctx.fillStyle = 'rgba(79,224,255,.9)'; ctx.font = '500 12px "IBM Plex Mono", monospace'; ctx.fillText('SENSOR GLITCH · CALLS UNRELIABLE · COVER UP TO REBOOT', 22, H - 14); ctx.restore(); }
  if (G.kdv > .02) drawKdVision(t);
  if (G.dial && !G.paused) drawDial(t);
  if (F.phase === 'count' && F.count && F.count.side === F.human && G.refN) { ctx.font = '600 40px Teko, sans-serif'; ctx.fillStyle = G.refN >= 8 ? '#ff5a4a' : '#ebe7de'; ctx.fillText(`COUNT ${G.refN}`, 22, 52); }
  if (G.screen > 0) { ctx.fillStyle = `rgba(255,240,220,${G.screen * .8})`; ctx.fillRect(0, 0, W, H); }
  if (G.intro) { if (G.intro.cine) drawIntroOverlay(ist, t); else drawTape(); }
}
let kdBuf = null;
function drawKdVision(t) {
  const k = G.kdv, pulse = .5 + .5 * Math.sin(t * 8.05);
  if (!kdBuf) kdBuf = document.createElement('canvas');
  if (kdBuf.width !== cv.width || kdBuf.height !== cv.height) { kdBuf.width = cv.width; kdBuf.height = cv.height; }
  const bc = kdBuf.getContext('2d'); bc.setTransform(1, 0, 0, 1, 0, 0); bc.clearRect(0, 0, kdBuf.width, kdBuf.height); bc.drawImage(cv, 0, 0);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = .5 * k; try { ctx.filter = `blur(${(2 + 3 * k) * aScale}px)`; } catch (e) {}
  ctx.drawImage(kdBuf, Math.sin(t * 1.7) * 22 * k * aScale, Math.cos(t * 1.3) * 8 * k * aScale);
  ctx.filter = 'none'; ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${.85 * k})`; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.globalCompositeOperation = 'source-over'; ctx.restore();
  ctx.save();
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, W * .62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(20,0,0,${(.75 + pulse * .2) * k})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = `rgba(120,10,10,${.12 * k * pulse})`; ctx.fillRect(0, 0, W, H);
  if (Math.random() < .25 * k) { ctx.fillStyle = 'rgba(255,255,255,.05)'; for (let i = 0; i < 6; i++) ctx.fillRect(0, Math.random() * H, W, 1 + Math.random() * 2); }
  ctx.restore();
}
function drawDebris(d, t) {
  ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.scale(d.dir, 1);
  const D = dims(d.build);
  if (d.kind === 'plate') { ctx.fillStyle = d.paint; ctx.strokeStyle = '#16181b'; ctx.lineWidth = 2; rr(ctx, -D.T.w * .22, -D.T.h * .16, D.T.w * .44, D.T.h * .32, 4); ctx.fill(); ctx.stroke(); bolt(ctx, -D.T.w * .16, -D.T.h * .1); bolt(ctx, D.T.w * .16, D.T.h * .1); }
  else if (d.kind === 'head') { ctx.translate(0, D.H * .5); drawHead(ctx, D.H, d.build.head, d.paint, { dmg: { head: .2, glitch: true, heat: 0 }, mood: 'ko' }, t); }
  else { const sd = d.side === 'rear' ? 'rear' : 'lead', A = D.A[sd], type = d.build[sd]; ctx.translate(-A.up * .6, 0); seg(ctx, A.up, A.th, d.back ? shade(d.paint, .32) : d.paint, DARK); ctx.translate(A.up, 0); joint(ctx, A.th * .55, '#33383e'); seg(ctx, A.fo, A.th * .88, STEEL, DARK); ctx.translate(A.fo, 0); drawFist(ctx, type, A.fist, false, t); ctx.translate(-(A.up + A.fo), 0); wires(ctx, -2, 0, 10, t); }
  ctx.restore();
}
function drawRef(t) {
  const F = G.F, x = F.phase === 'count' && F.count ? F.f[F.count.side].x + (F.count.side ? -40 : 40) : W / 2, y = 96 + Math.sin(t * 3) * 5;
  ctx.save(); ctx.translate(x, y);
  ctx.strokeStyle = '#3a3f45'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-34, -14); ctx.lineTo(34, -14); ctx.stroke();
  ctx.fillStyle = 'rgba(200,210,220,.35)'; ctx.fillRect(-46 + Math.sin(t * 60) * 4, -17, 22, 3); ctx.fillRect(24 - Math.sin(t * 60) * 4, -17, 22, 3);
  ctx.fillStyle = '#e8e4da'; rr(ctx, -26, -12, 52, 34, 9); ctx.fill(); ctx.fillStyle = '#16181b'; for (let i = 0; i < 6; i++) ctx.fillRect(-26 + i * 9, -12, 4.5, 34);
  ctx.fillStyle = '#0d0e10'; rr(ctx, -18, -6, 36, 22, 4); ctx.fill();
  ctx.fillStyle = G.refN >= 8 ? '#ff5a4a' : '#6cf0a0'; ctx.font = '600 22px Teko, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(F.phase === 'count' ? String(G.refN || '') : 'REF', 0, 13); ctx.textAlign = 'left';
  ctx.restore();
}
function drawMechanic(t, side) {
  const x = side ? RING.C1 + 80 : RING.C0 - 80, y = GROUND, active = G.weldT[side] > 0;
  ctx.save(); ctx.translate(x, y); if (side) ctx.scale(-1, 1);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(0, 1, 26, 5, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#2b3a4a'; rr(ctx, -12, -46, 24, 38, 6); ctx.fill(); ctx.fillRect(-10, -10, 8, 10); ctx.fillRect(2, -10, 8, 10);
  ctx.fillStyle = '#c99a6a'; ctx.beginPath(); ctx.arc(0, -56, 9, 0, 7); ctx.fill();
  ctx.fillStyle = '#3a3f45'; rr(ctx, -2, -64, 14, 16, 3); ctx.fill(); ctx.fillStyle = '#4fe0ff'; ctx.fillRect(4, -60, 7, 4);
  ctx.strokeStyle = '#2b3a4a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(8, -40); ctx.lineTo(28, -48 + Math.sin(t * 8) * (active ? 3 : 0)); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.strokeStyle = '#555'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(28, -48); ctx.lineTo(42, -54); ctx.stroke();
  if (active || Math.random() < .08) { glow(ctx, '#bfe9ff', 18, () => { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(44, -55, 3 + Math.random() * 3, 0, 7); ctx.fill(); }); }
  ctx.restore();
  if (active && Math.random() < .5) sparks(x + (side ? -44 : 44), y - 55, side ? -1 : 1, 2, true);
}
/* ---- HUD ---- */
const PIP_KEYS = [['head', 'HD'], ['lead', 'LA'], ['rear', 'RA'], ['legs', 'LG']];
function pipHtml(f) { return Object.entries(f.cond).filter(([, c]) => c).map(([k, c]) => `<span class="ctag s${c.sev}" title="${CONDS[c.type].name}: ${CONDS[c.type].desc}">${CONDS[c.type].short}${c.sev > 1 ? ' ' + 'I'.repeat(c.sev) : ''}</span>`).join(''); }
/* ---- damage silhouette: six zones coloured by health, condition icons, hit flashes ---- */
const ZONES = ['head', 'torso', 'lead', 'rear', 'legs'];
const ZONE_NAME = { head: 'Head', torso: 'Hull', lead: 'Lead arm', rear: 'Rear arm', legs: 'Legs' };
function zoneHit(side, part, crit) { if (!G) return; G.zf = G.zf || [{}, {}]; G.zf[side][part] = crit ? 1.4 : 1; }
function zoneCol(fr, lost) { return lost ? null : S.opt.cb ? (fr > .6 ? '#4fa3ff' : fr > .3 ? '#f0d23a' : '#ff4fd8') : fr > .6 ? '#6cc28a' : fr > .3 ? '#e8a33a' : '#e2483d'; }
function condIcon(c, type, x, y, k, sev, t) {
  c.save(); c.translate(x, y); c.scale(k, k); c.lineWidth = 1.4; const hot = sev >= 3 ? (Math.sin(t * 8) > 0 ? '#fff' : '#ff6a5a') : '#0d0e10';
  c.fillStyle = hot; c.strokeStyle = hot;
  if (type === 'oil') { c.beginPath(); c.moveTo(0, -5); c.bezierCurveTo(4, 0, 4, 4, 0, 4.5); c.bezierCurveTo(-4, 4, -4, 0, 0, -5); c.fill(); }
  else if (type === 'gear' || type === 'stutter') { c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; c.lineTo(Math.cos(a) * 4.6, Math.sin(a) * 4.6); c.lineTo(Math.cos(a + .39) * 3.2, Math.sin(a + .39) * 3.2); } c.closePath(); c.fill(); c.fillStyle = '#ddd'; c.beginPath(); c.arc(0, 0, 1.3, 0, 7); c.fill(); }
  else if (type === 'glitch') { c.beginPath(); c.moveTo(-5, 1); c.lineTo(-2.5, -3); c.lineTo(0, 2); c.lineTo(2.5, -3); c.lineTo(5, 1); c.stroke(); }
  else if (type === 'leak') { c.beginPath(); c.arc(-2, 0, 2.4, 0, 7); c.arc(2, -1, 2.8, 0, 7); c.arc(0, 2, 2.2, 0, 7); c.fill(); }
  else if (type === 'drain') { c.beginPath(); c.moveTo(1, -5); c.lineTo(-3, 1); c.lineTo(0, 1); c.lineTo(-1, 5); c.lineTo(3, -1); c.lineTo(0, -1); c.closePath(); c.fill(); }
  else if (type === 'plating') { c.strokeRect(-4, -3.5, 8, 7); c.beginPath(); c.moveTo(-4, -3.5); c.lineTo(4, 3.5); c.stroke(); }
  else if (type === 'wobble') { c.beginPath(); c.arc(0, 0, 4, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.beginPath(); c.arc(0, 2, 2, 0, 7); c.fill(); }
  c.restore();
}
function drawSil(cv, f, side, t, big) {
  if (!cv) return; const c = cv.getContext('2d'), W2 = cv.width, H2 = cv.height, k = W2 / 44; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W2, H2); c.setTransform(k, 0, 0, k, 0, 0);
  const mirror = side === 1; if (mirror) { c.translate(44, 0); c.scale(-1, 1); }
  const zf = (G && G.zf && G.zf[side]) || {}, wheel = f.spec.build.legs === 'wheel';
  const Z = { head: [15, 2, 14, 11, 4], torso: [11, 15, 22, 24, 3], lead: [34, 16, 8, 21, 3], rear: [2, 16, 8, 21, 3], legs: [12, 41, 20, 19, 2] };
  for (const z of ZONES) {
    const [x, y, w, h, r] = Z[z], lost = (z === 'lead' || z === 'rear') && f.lost[z], fr = clamp(frac(f, z), 0, 1), col = zoneCol(fr, lost), fl = zf[z] || 0;
    c.save(); if (fl > 1 && !mirror) c.translate((Math.random() - .5) * 1.5, 0);
    if (z === 'legs' && wheel) { c.beginPath(); c.arc(22, 51, 8.5, 0, 7); } else if (z === 'legs') { c.beginPath(); rrPath(c, 12, 41, 8.5, 19, 2); rrPath(c, 23.5, 41, 8.5, 19, 2); } else { c.beginPath(); rrPath(c, x, y, w, h, r); }
    if (lost) { c.setLineDash([2, 2]); c.strokeStyle = 'rgba(160,166,172,.6)'; c.lineWidth = 1; c.stroke(); c.setLineDash([]); }
    else {
      c.fillStyle = col; c.globalAlpha = .38 + (1 - fr) * .25; c.fill(); c.globalAlpha = 1; c.strokeStyle = col; c.lineWidth = 1.1; c.stroke();
      c.save(); c.clip(); c.fillStyle = col; c.globalAlpha = .55; c.fillRect(x - 2, y + h * (1 - fr), w + 4, h * fr + 2); c.restore();
      if (fr < .3) { c.strokeStyle = 'rgba(10,10,12,.7)'; c.lineWidth = .7; c.beginPath(); c.moveTo(x + w * .3, y + 1); c.lineTo(x + w * .5, y + h * .45); c.lineTo(x + w * .35, y + h * .7); c.moveTo(x + w * .5, y + h * .45); c.lineTo(x + w * .75, y + h * .55); c.stroke(); }
      if (fl > 0) { c.fillStyle = `rgba(255,255,255,${Math.min(1, fl) * .85})`; c.fill(); }
    }
    c.restore();
    const cd = f.cond[z]; if (cd && !lost) { const cx = z === 'legs' ? 22 : x + w / 2, cy = z === 'legs' ? 50 : y + h / 2; if (mirror) { c.save(); c.translate(cx, cy); c.scale(-1, 1); condIcon(c, cd.type, 0, 0, z === 'torso' ? 1.15 : .9, cd.sev, t); c.restore(); } else condIcon(c, cd.type, cx, cy, z === 'torso' ? 1.15 : .9, cd.sev, t); }
  }
  const label = ZONES.map(z => `${ZONE_NAME[z]} ${(z === 'lead' || z === 'rear') && f.lost[z] ? 'torn off' : Math.round(clamp(frac(f, z), 0, 1) * 100) + '%'}${f.cond[z] ? ' (' + CONDS[f.cond[z].type].name + ')' : ''}`).join(', ');
  if (cv.dataset.lab !== label) { cv.dataset.lab = label; cv.setAttribute('aria-label', label); cv.title = label; }
}
function rrPath(c, x, y, w, h, r) { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
let pipCache = ['', ''];
function hud() {
  const F = G.F, [a, b] = F.f;
  $('#hpA').style.transform = `scaleX(${Math.max(0, a.hp / a.s.hp)})`; $('#hpB').style.transform = `scaleX(${Math.max(0, b.hp / b.s.hp)})`;
  $('#enA').style.transform = `scaleX(${Math.max(0, a.en / a.s.en)})`; $('#enB').style.transform = `scaleX(${Math.max(0, b.en / b.s.en)})`;
  $('#htA').style.transform = `scaleX(${Math.min(1, a.heat / 100)})`; $('#htB').style.transform = `scaleX(${Math.min(1, b.heat / 100)})`;
  $('#htwA').classList.toggle('hot', a.heat > 70); $('#htwB').classList.toggle('hot', b.heat > 70);
  $('#kdA').textContent = a.kdTotal ? '▼'.repeat(a.kdTotal) : (G.spectate ? 'RED' : G.F.duo ? 'P1' : 'YOU'); $('#kdB').textContent = b.kdTotal ? '▼'.repeat(b.kdTotal) : (G.spectate ? 'BLUE' : G.F.duo ? 'P2' : 'CPU');
  const pa = pipHtml(a), pb = pipHtml(b); if (pa !== pipCache[0]) { $('#ppA').innerHTML = pa; pipCache[0] = pa; } if (pb !== pipCache[1]) { $('#ppB').innerHTML = pb; pipCache[1] = pb; }
  drawSil($('#silA'), a, 0, performance.now() / 1000); drawSil($('#silB'), b, 1, performance.now() / 1000);
  $('#clock').textContent = G.intro ? '—' : F.phase === 'break' ? Math.ceil(Math.max(0, G.cornerT)) : Math.max(0, Math.ceil(F.cfg.roundLen - F.rt));
  $('#rnd').textContent = G.intro ? VENUES[curVenue].name : F.phase === 'break' ? 'Corner break' : `Round ${F.round} of ${F.cfg.rounds}`;
  const sg = $('#sigA'), f = F.f[0], sig = f.spec.signature;
  if (sg) { if (!sig || G.spectate) sg.hidden = true; else { sg.hidden = false; const used = sig.maxUses != null && f.signatureUses >= sig.maxUses, cd = f.signatureCd; const txt = used ? `${sig.name} · spent` : cd > 0 ? `${sig.name} · ${cd.toFixed(0)} s` : `${sig.name} · ready`; if (sg.textContent !== txt) sg.textContent = txt; sg.classList.toggle('ready', !used && cd <= 0); } }
}
/* ---- dock ---- */
const dock = $('#dock');
const kl = act => { const o = (S.opt.keys || {})[act], d = (KEY_ACTIONS.find(x => x[0] === act) || [])[2]; return keyName(o || d || ''); };
function setDock(mode) {
  if (G.dockMode === mode) return; G.dockMode = mode;
  const sigName = G.F.f[0].spec.signature ? G.F.f[0].spec.signature.name : 'Signature';
  if (mode === 'none') dock.innerHTML = '';
  else if (mode === 'cmds') dock.innerHTML = `<div class="cmds">
    <button class="cmd" id="cmdHead"><kbd>${kl('cHead')}</kbd><b>Head hunt</b><small>5 s of head shots</small></button>
    <button class="cmd" id="cmdBody"><kbd>${kl('cBody')}</kbd><b>Body work</b><small>5 s to the body</small></button>
    <button class="cmd" id="cmdGuard"><kbd>${kl('cGuard')}</kbd><b>Cover up</b><small>Full guard</small></button>
    <button class="cmd" id="cmdHay"><kbd>${kl('cHay')}</kbd><b>Haymaker</b><small>Next punch 2×</small></button></div><div class="dockmsg" id="dockMsg"></div>`;
  else if (mode === 'pilot') dock.innerHTML = `<div class="pilot"><div class="dpad">
    <button class="pa up" data-move="far" aria-label="Move away (W)"><b>▲</b><small>${kl('far')}</small></button>
    <button class="pa lf" data-move="left" aria-label="Move left (A)"><b>◀</b><small>${kl('left')}</small></button>
    <button class="pa rt" data-move="right" aria-label="Move right (D)"><b>▶</b><small>${kl('right')}</small></button>
    <button class="pa dn" data-move="near" aria-label="Move closer to camera (S)"><b>▼</b><small>${kl('near')}</small></button></div>
    <div class="punches"><button class="pa" data-punch="jab"><b>Jab</b><small>${kl('jab')}</small></button><button class="pa" data-punch="cross"><b>Cross</b><small>${kl('cross')}</small></button><button class="pa" data-punch="hook"><b>Hook</b><small>${kl('hook')}</small></button><button class="pa" data-punch="upper"><b>Upper</b><small>I</small></button>
    <button class="pa sl" data-slip="far"><b>Slip ↑</b><small>${kl('slipFar')}</small></button><button class="pa gd" data-hold="guard"><b>Guard</b><small>${kl('guard')}</small></button><button class="pa sl" data-slip="near"><b>Slip ↓</b><small>${kl('slipNear')}</small></button><button class="pa sg" data-sig="1"><b>${sigName}</b><small>F</small></button></div></div>`;
  else if (mode === 'duo') dock.innerHTML = `<div class="duoleg"><div class="dl red"><b>P1 · red</b><span><kbd>WASD</kbd> move <kbd>F</kbd> jab <kbd>G</kbd> cross <kbd>H</kbd> hook <kbd>T</kbd> upper <kbd>Q</kbd>/<kbd>E</kbd> slip <kbd>L-Shift</kbd> guard <kbd>R</kbd> signature</span></div><div class="dl blue"><b>P2 · blue</b><span><kbd>Arrows</kbd> move <kbd>K</kbd> jab <kbd>L</kbd> cross <kbd>;</kbd> hook <kbd>O</kbd> upper <kbd>I</kbd>/<kbd>P</kbd> slip <kbd>R-Shift</kbd> guard <kbd>Enter</kbd> signature · numpad works too</span></div><div class="dl pad">🎮 Controllers: stick move · A jab · B cross · X hook · Y upper · LB/RB slip · LT guard · RT signature</div></div>`;
  else if (mode === 'reboot') dock.innerHTML = `<button class="bigbtn reboot" id="rebootBtn">Reboot · tap in the green</button>`;
  else if (mode === 'finish') dock.innerHTML = `<div class="finrow"><button class="bigbtn destroy" id="destroyBtn">Destroy <small>D</small></button><button class="bigbtn spare" id="spareBtn">Spare <small>S</small></button></div><div class="dockmsg"><span>Destroy rips the head off: crowd bonus plus a salvaged part. Sparing pays a sportsmanship bonus.</span><span id="finT"></span></div>`;
  else if (mode === 'spectate') dock.innerHTML = `<div class="specrow"><span id="specMsg" class="note"></span><div class="speed"><button class="small-btn" data-speed="1" aria-pressed="${G.speed === 1}">1×</button><button class="small-btn" data-speed="2" aria-pressed="${G.speed === 2}">2×</button><button class="small-btn" data-speed="4" aria-pressed="${G.speed === 4}">4×</button></div></div>`;
  else if (mode === 'wait') dock.innerHTML = `<div class="dockmsg wait"><span id="waitMsg"></span></div>`;
  else if (mode === 'corner') { dock.innerHTML = `<div class="dockmsg wait"><span>Corner break. Your crew is waiting on your call.</span></div>`; openCorner(); }
  else if (mode === 'result') { dock.innerHTML = ''; openResult(); }
}
dock.addEventListener('click', e => {
  if (!G) return; const F = G.F, btn = e.target.closest('button'); if (!btn) return; const id = btn.id;
  if (btn.dataset.speed) { G.speed = +btn.dataset.speed; dock.querySelectorAll('[data-speed]').forEach(b => b.setAttribute('aria-pressed', b === btn)); return; }
  if (btn.dataset.slip) { issue(F, 0, btn.dataset.slip === 'far' ? 'slipFar' : 'slipNear'); return; }
  if (btn.dataset.punch) { issue(F, 0, btn.dataset.punch); return; }
  if (btn.dataset.sig) { issue(F, 0, 'sig'); return; }
  if (btn.dataset.move && e.detail === 0) { setHeld(btn.dataset.move, true); setTimeout(() => setHeld(btn.dataset.move, false), 220); return; }
  if (btn.dataset.hold && e.detail === 0) { setHeld('guard', !G.held.has('guard')); return; }
  const map = { cmdHead: 'head', cmdBody: 'body', cmdGuard: 'guard', cmdHay: 'hay' };
  if (map[id]) { issue(F, 0, map[id]); return; }
  if (id === 'rebootBtn') { pressReboot(); return; }
  if (id === 'destroyBtn') { chooseFinish(F, 0, 'destroy'); return; }
  if (id === 'spareBtn') { chooseFinish(F, 0, 'spare'); return; }
});
dock.addEventListener('pointerdown', e => { const btn = e.target.closest('[data-move],[data-hold]'); if (!btn || !G || G.F.controlMode !== 'pilot') return; e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (er) {} if (btn.dataset.move) setHeld(btn.dataset.move, true); if (btn.dataset.hold) setHeld('guard', true); });
const relPtr = e => { const btn = e.target.closest && e.target.closest('[data-move],[data-hold]'); if (!btn || !G) return; if (btn.dataset.move) setHeld(btn.dataset.move, false); if (btn.dataset.hold) setHeld('guard', false); };
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => dock.addEventListener(n, relPtr));
window.addEventListener('blur', () => { clearHeld(); if (G && !G.paused && !G.intro && ['fight', 'count'].includes(G.F.phase) && !$('#scrArena').hidden) pauseGame(true); });
function specText(F) {
  if (F.phase === 'break') return `Corner break · round ${F.round + 1} in ${Math.ceil(Math.max(0, G.cornerT))} s`;
  if (F.phase === 'count') return `${F.f[F.count ? F.count.side : 0].spec.name} is down`;
  if (F.phase === 'finisher' || F.phase === 'done') return `${F.f[F.winner].spec.name} takes it`;
  return `Exhibition · ${F.f[0].spec.name} (${STYLES[F.f[0].spec.style].name}) vs ${F.f[1].spec.name} (${STYLES[F.f[1].spec.style].name})`;
}
function dockTick(dt) {
  const F = G.F, me = F.f[0];
  if (G.intro) { setDock('none'); return; }
  if (F.phase === 'break' && G.prevPhase !== 'break') G.cornerT = G.spectate ? 4 : 25;
  G.prevPhase = F.phase;
  if (G.spectate) {
    let m = 'spectate'; if (F.phase === 'done') { G.doneT += dt; if (G.doneT > 1.6) m = 'result'; }
    setDock(m);
    if (m === 'spectate') { const el = document.getElementById('specMsg'), txt = specText(F); if (el && el.textContent !== txt) el.textContent = txt; }
    return;
  }
  let mode = F.duo ? 'duo' : F.controlMode === 'pilot' ? 'pilot' : 'cmds';
  if (F.phase === 'count') mode = F.count && F.count.side === 0 && (me.st === 'down' || me.st === 'kneel') && F.count.hits < F.count.needHits ? 'reboot' : 'wait';
  else if (F.phase === 'finisher') mode = G.match?.runEncounter ? 'wait' : F.winner === 0 && F.finish.stage === 'choose' && !F.finish.choice ? 'finish' : 'wait';
  else if (F.phase === 'break') mode = 'corner';
  else if (F.phase === 'done') { G.doneT += dt; mode = G.doneT > 1.8 ? 'result' : 'wait'; }
  if (mode !== 'pilot' && mode !== 'duo' && G.held.size) clearHeld();
  if (F.duo && F.phase === 'count') mode = 'wait'; if (F.duo && F.phase === 'finisher') mode = 'wait';
  setDock(mode);
  if (mode === 'cmds') {
    const cds = { cmdHead: ['head', 9], cmdBody: ['body', 9], cmdGuard: ['guard', 8], cmdHay: ['hay', 10] };
    for (const id in cds) { const [k, max] = cds[id], el = document.getElementById(id); if (!el) continue; el.style.setProperty('--cd', Math.min(1, me.cd[k] / max).toFixed(3)); el.disabled = me.cd[k] > 0 || DOWN.has(me.st); }
    document.getElementById('cmdHay')?.classList.toggle('queued', me.hayQ); document.getElementById('cmdGuard')?.classList.toggle('queued', me.guardQ);
  }
  if (mode === 'cmds' || mode === 'pilot') {
    const m = document.getElementById('dockMsg'); if (m) { const tips = []; if (me.heat > 70) tips.push('Running hot: hands slow down, overheat at 100.'); if (me.lost.lead || me.lost.rear) tips.push('One arm gone. Lose both and it is a TKO.'); if (frac(me, 'head') < .4) tips.push('Head damaged: blocks are failing.'); const txt = tips.join(' ') || 'Your bot fights on its own. Call plays when you see an opening.'; if (m.textContent !== txt) m.textContent = txt; }
    const sb = dock.querySelector('[data-sig]'); if (sb) { const sig = me.spec.signature, avail = sig && me.signatureCd <= 0 && !(sig.maxUses != null && me.signatureUses >= sig.maxUses); sb.disabled = !avail; }
  } else if (mode === 'wait') {
    const el = document.getElementById('waitMsg'); if (el) { const txt = F.phase === 'count' ? (F.count && F.count.side === 0 ? 'Systems online. Getting up...' : `${F.f[F.count ? F.count.side : 1].spec.name} is down. Neutral corner.`) : F.phase === 'finisher' ? (F.winner === 0 ? 'Your bot stands over them...' : `${F.f[F.winner].spec.name} decides your bot's fate...`) : 'Judges are tallying...'; if (el.textContent !== txt) el.textContent = txt; }
  } else if (mode === 'finish') { const el = document.getElementById('finT'); if (el) el.textContent = `Auto-spare in ${Math.max(0, Math.ceil(8 - F.finish.ct))} s`; }
  else if (mode === 'corner') { const el = document.getElementById('cornerT'); if (el) el.textContent = Math.ceil(Math.max(0, G.cornerT)); }
}
/* ---- modals: corner, result, pause ---- */
function openModal(kind, html) { G.modal = kind; $('#arenaBox').innerHTML = html; $('#arenaModal').hidden = false; $('#arenaModal').className = 'amodal ' + kind; }
function closeModal() { if (G) G.modal = ''; $('#arenaModal').hidden = true; $('#arenaBox').innerHTML = ''; }
function crewAdvice(F) {
  const me = F.f[0], op = F.f[1], tips = [];
  const worst = Object.entries(me.cond).filter(([, c]) => c).sort((x, y) => y[1].sev - x[1].sev)[0];
  if (worst) tips.push(`Fix the ${CONDS[worst[1].type].name.toLowerCase()} first. ${CONDS[worst[1].type].desc}.`);
  const ow = Object.entries(op.cond).filter(([, c]) => c)[0]; if (ow) tips.push(`${op.spec.name} has a ${CONDS[ow[1].type].name.toLowerCase()} in the ${ZONE_NAME[ow[0]].toLowerCase()}. Go after it.`);
  if (op.spec.signature && op.signatureUses < (op.spec.signature.maxUses || 9)) tips.push(`Watch for the ${op.spec.signature.name}. When you see "${op.spec.signature.tell}", slip or cover.`);
  if (me.heat > 55) tips.push('You ran hot that round. Throw fewer haymakers or call Cover up to vent.');
  if (frac(me, 'head') < .5) tips.push('Your head unit is cracked. Weld it or your guard keeps failing.');
  if (op.hp / op.s.hp < .45) tips.push(`${op.spec.name} is leaking. Head hunt early and look for the knockdown.`);
  if (me.cnt.landed < op.cnt.landed * .7) tips.push('They are out-landing you. Try Body work to drain their battery.');
  if (!tips.length) tips.push('Good round. Stick to the plan.');
  return tips.slice(0, 2);
}
function openCorner() {
  const F = G.F, f = F.f[0], last = F.scores[F.scores.length - 1] || [10, 10], aiPlanRead = f.s.revealsCornerPlan && F.f[1].plan ? `<div class="note"><b>Optics read:</b> AI plan for next round · ${esc(F.f[1].plan.name)} — ${esc(F.f[1].plan.desc)}</div>` : '';
  const rows = [['head', 'Head'], ['lead', 'Lead arm'], ['rear', 'Rear arm'], ['legs', 'Legs'], ['torso', 'Hull']].map(([k, l]) => {
    const lost = (k === 'lead' || k === 'rear') && f.lost[k], fr = lost ? 0 : frac(f, k);
    const cd = f.cond[k], can = lost ? (f.mech.reattach && f.welds >= 2) : (f.welds > 0 && (fr < 1 || !!cd));
    const workbookWeld = !!f.spec.workbookCombat, amt = Math.round((workbookWeld ? 42 : f.mech.amt) * f.s.weldMul * (workbookWeld ? 1 : k === 'torso' ? 1.4 : 1)), restoreLabel = workbookWeld ? ` +${amt} Condition` : '';
    return `<div class="wrow ${fr > .6 ? '' : fr > .3 ? 'warn' : 'bad'}"><span>${l}${lost ? ' · torn off' : ` · ${Math.round(fr * 100)}%`}</span><span class="sb"><i style="width:${fr * 100}%"></i></span><button class="small-btn${cd && !lost ? ' fix' : ''}" data-weld="${k}" ${can ? '' : 'disabled'}>${lost ? (f.mech.reattach ? 'Reattach (2)' : 'Needs Doc') : cd ? `Fix ${CONDS[cd.type].name.toLowerCase()}${restoreLabel}` : `Weld +${amt}${workbookWeld ? ' Condition' : ''}`}</button></div>`;
  }).join('');
  const conds = Object.entries(f.cond).filter(([, c]) => c).sort((x, y) => y[1].sev - x[1].sev).map(([k, c]) => `<li class="s${c.sev}"><b>${CONDS[c.type].name}</b> · ${ZONE_NAME[k].toLowerCase()} · ${c.sev >= 3 ? 'stays until fixed' : 'severity ' + c.sev}<br>${CONDS[c.type].desc}</li>`).join('');
  openModal('corner', `<div class="mhead"><div><small>Corner · ${f.mech.name}</small><h3>Between rounds</h3></div><div class="ctimer"><span id="cornerT">${Math.ceil(G.cornerT)}</span><small>sec</small></div></div>
    <div class="scoreline">Round ${F.round} card: <b>${f.spec.name} ${last[0]}</b> – <b>${last[1]} ${F.f[1].spec.name}</b></div>
    ${aiPlanRead}
    <div class="welds">${Array.from({ length: f.weldLimit || f.mech.welds }, (_, i) => `<i class="${i < f.welds ? '' : 'used'}"></i>`).join('')}<span>${f.welds} welds left</span></div>
    <div class="cornerbody"><canvas class="csil" id="cornerSil" width="132" height="186" aria-label="Your bot's damage by part"></canvas><div class="wrows">${conds ? `<ul class="condlist">${conds}</ul>` : ''}${rows}</div></div>
    <div class="advice">${crewAdvice(F).map(t => `<p><b>Crew chief:</b> ${t}</p>`).join('')}</div>
    ${F.controlMode === 'pilot' ? '' : `<div class="cplan"><small>Plan for the next round</small><div class="seg tiny">${Object.values(GAMEPLANS).map(gp => `<button data-cplan="${gp.id}" aria-pressed="${f.plan.id === gp.id}" title="${gp.desc}">${gp.name}</button>`).join('')}</div></div>`}
    <div class="mbtns"><button class="btn primary" id="bellBtn">Ring the bell <small>Enter</small></button></div>`);
  drawSil($('#cornerSil'), f, 0, 0);
  if (Math.random() < .7) say('color', pickOne(['Look at that crew go. Sparks everywhere.', 'This is where fights are won, Hank. In the corner.', 'If I had a crew like that I would still have both my hands.', 'Weld it, bolt it, pray over it. Classic corner work.']), 1, { ttl: 8000 });
}
$('#arenaModal').addEventListener('click', e => {
  if (!G) return; const F = G.F;
  if (e.target.closest('#posterBtn')) { savePoster(); return; }
  const cp = e.target.closest('[data-cplan]'); if (cp && F.phase === 'break') { F.f[0].plan = GAMEPLANS[cp.dataset.cplan]; uiClick(); openCorner(); return; }
  if (e.target.id === 'cornerSil') { const r = e.target.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 44, y = (e.clientY - r.top) / r.height * 62; const k = y < 14 ? 'head' : y > 40 ? 'legs' : x < 11 ? 'rear' : x > 33 ? 'lead' : 'torso'; if (repair(F, F.f[0], k)) { handleEvents(); openCorner(); } else uiError(); return; }
  const btn = e.target.closest('button'); if (!btn) return;
  if (btn.dataset.weld) { if (repair(F, F.f[0], btn.dataset.weld)) { handleEvents(); openCorner(); } else uiError(); return; }
  const id = btn.id;
  if (id === 'bellBtn') { ringBell(); return; }
  if (id === 'resumeBtn') { pauseGame(false); return; }
  if (id === 'restartBtn') { pauseGame(false); newGame(); return; }
  if (id === 'quitBtn') { leaveArena(); return; }
  if (id === 'nextBtn') { const nb = nextBot(); if (nb) { S.opp = nb.id; save(); startCareerFight(); } return; }
  if (id === 'rematchBtn') { newGame(); return; }
  if (id === 'lobbyBtn') { leaveArena(); return; }
  if (btn.dataset.vol) return;
});
$('#arenaModal').addEventListener('input', e => { const k = e.target.dataset && e.target.dataset.vol; if (k) { S.opt[k] = +e.target.value; save(); applyVolumes(); } });
let l3T = 0;
function showL3(F) { const el = $('#l3'); if (!el || !G || G.F !== F) return; const sc = F.scores[F.scores.length - 1] || [10, 10], [a, b] = F.f; el.innerHTML = `<b>Round ${F.scores.length}</b><span>${esc(a.spec.name)} ${sc[0]} – ${sc[1]} ${esc(b.spec.name)}</span><em>Landed ${Math.round(a.cnt.landed)} / ${Math.round(b.cnt.landed)}</em><em>Damage ${Math.round(a.cnt.dmg)} / ${Math.round(b.cnt.dmg)}</em>`; el.hidden = false; clearTimeout(l3T); l3T = setTimeout(hideL3, 5200); }
function hideL3() { clearTimeout(l3T); const el = $('#l3'); if (el) el.hidden = true; }
function ringBell() { if (G && G.F.phase === 'break') { closeModal(); startRound(G.F); handleEvents(); } }
function pauseGame(p) {
  if (!G || G.intro || G.F.phase === 'done' || G.modal === 'corner' || G.modal === 'result') return;
  G.paused = p; pauseVoice(p); clearHeld(); if (p) stopCrowdShouts();
  if (p) openModal('pause', `<div class="mhead"><div><small>${VENUES[curVenue].name} · Round ${G.F.round}</small><h3>Paused</h3></div></div>
    <div class="vols">${[['music', 'Music'], ['sfx', 'Sound effects'], ['crowd', 'Crowd'], ['voice', 'Voices']].map(([k, l]) => `<label><span>${l}</span><input type="range" min="0" max="1" step=".05" value="${S.opt[k]}" data-vol="${k}"></label>`).join('')}</div>
    <div class="mbtns col"><button class="btn primary" id="resumeBtn">Resume <small>Esc</small></button><button class="btn" id="restartBtn">Restart fight</button><button class="btn ghost" id="quitBtn">${G.spectate ? 'Quit to menu' : 'Forfeit and leave'}</button></div>`);
  else closeModal();
}
function settleWorkbookRunEncounter(forfeit = false) {
  if (!G || G.settled || !G.match?.runEncounter) return false;
  const run = S.workbookRun, context = G.match.runEncounter, node = run?.map.nodes.find(row => row.id === context.nodeId), enemy = WORKBOOK_ENEMY_BY_ID[context.enemyId], player = G.F.f[0];
  G.settled = true; G.money = null;
  if (!run || run.status !== 'active' || !node || !enemy) return false;
  storeDamage(player);
  const failed = player.hp <= 0, won = !forfeit && !failed && G.F.winner === 0;
  const rewardResult = won ? workbookRunRollEnemyRewards(run, enemy, node) : { rewards:[], notes:[] };
  run.carry = Array.isArray(run.carry) ? run.carry : []; run.carry.push(...rewardResult.rewards.map(row => ({ ...row })));
  const report = { nodeId:node.id, nodeNumber:node.number, enemyId:enemy.id, outcome:failed ? 'failed' : forfeit ? 'forfeit' : won ? 'won' : 'lost', round:Math.max(1, Math.floor(+G.F.round || 1)), reason:forfeit ? 'Forfeit' : G.F.reason || 'Result', rewards:rewardResult.rewards.map(row => ({ ...row })), notes:rewardResult.notes.slice() };
  run.lastEncounterReport = report;
  if (failed) workbookFailRun(run.hardcore ? 'hardcore' : 'standard');
  else { if (node.type === 'boss') run.bossResolved = true; workbookCompleteRunNode(); }
  G.runEncounterReport = report; save(); return true;
}
function settle() {
  if (G.settled) return;
  if (G.match?.runEncounter) { settleWorkbookRunEncounter(); return; }
  G.settled = true;
  if (G.spectate || !G.career) { G.money = null; return; }
  const F = G.F, me = F.f[0], opp = G.op, fin = F.finish && F.finish.choice, workbookLegality = me.spec.workbookCombat ? workbookVenueLegality(curVenue, me.spec.workbookCombat) : null, ill = workbookLegality ? workbookLegality.illegalParts : illegalParts(me.spec.build).map(q => q.name);
  let win = F.winner === 0, dq = false;
  if (workbookLegality?.rule?.illegalParts === 'Banned (DQ)' && ill.length) { win = false; dq = ill.join(' and '); }
  else if (!workbookLegality && win && opp.lg >= 2 && ill.length && Math.random() < .35) { win = false; dq = ill.join(' and '); }
  const lines = [], bt = G.match.bout, heat = G.match.rival || 0, pm = bt ? (bt.kind === 'title' ? 1.75 : 1.4) : 1;
  if (G.match.tourney) lines.push(...tourneyAfter(win)); else if (win) { lines.push([bt ? (bt.kind === 'title' ? 'Title purse' : 'Defence purse') : 'Purse', Math.round(botPurse(opp) * pm)]); if (bt) lines.push([bt.kind === 'title' ? 'Belt bonus' : 'Defence bonus', bt.kind === 'title' ? 100 + bt.lg * 75 : 60 + bt.lg * 40]); if (heat) lines.push(['Grudge bonus', Math.round(botPurse(opp) * .15 * heat)]); if (F.reason !== 'Decision') lines.push(['Stoppage bonus', 50]); if (fin === 'destroy') lines.push(['Crowd bonus · destroyed', 60]); if (fin === 'spare') lines.push(['Sportsmanship', 25]); }
  else lines.push(['Show money', 40 + opp.lg * 15]);
  const cd = wcIx(opp) - wcIx(me.spec); if (win && cd > 0) lines.push(['Fighting up a class', Math.round(botPurse(opp) * .25 * cd)]); if (win && cd < 0) lines.push(['Fighting down a class', -Math.round(botPurse(opp) * .15 * -cd)]);
  if (win && S.mods && S.mods.purse2 === opp.id && !G.match.tourney) lines.push(['Short-notice bonus', botPurse(opp)]);
  const spn = sponsorOf(); if (spn) { const c = { win, stop: F.reason === 'KO' || F.reason === 'TKO', acc: me.cnt.landed / Math.max(1, me.cnt.thrown), hull: me.hp / me.s.hp, lost: me.lost.lead || me.lost.rear || me.lost.head, head: me.cnt.head, fin }; if (spn.ok(c)) lines.push([`Sponsor · ${spn.tag}`, spn.pay]); if (S.sponsor.left <= 1) lines.push(['Contract completion', spn.pay * 2]); }
  const hypeCrew = truckCrewCount('hype-man'), purseBase = lines.reduce((sum, [label, amount]) => /purse|show money|tournament prize/i.test(label) && amount > 0 ? sum + amount : sum, 0);
  if (hypeCrew && purseBase) lines.push(['Hype man · venue purse bonus', Math.round(purseBase * .15 * hypeCrew)]);
  const tutorialBot = activeStableBot(), tutorialPartFitted = !!tutorialBot && (S.workbookTutorial?.foundItemIds || []).some(itemId => { const item = workbookPartItemById(itemId); return item?.location === 'bay' && item.botId === tutorialBot.id && Object.values(tutorialBot.workbookFittedItems || {}).includes(itemId); });
  const tutorialRewardDue = !G.match.tourney && S.workbookTutorial?.status === 'awaiting-first-pit' && !S.workbookTutorial.rewardGranted && tutorialPartFitted;
  if (tutorialRewardDue) lines.push(['Guided first outing reward', 120]);
  const net = lines.reduce((s, l) => s + l[1], 0);
  S.scrap = Math.max(0, S.scrap + net);
  let unlocked = '', salvage = '';
  if (win) {
    if (fin === 'destroy') { const cand = SLOTS.map(([k, , pool]) => [pool, opp.build[k]]).filter(([pool, id]) => id !== 'none' && part(pool, id) && part(pool, id).b !== 'GB' && !owns(id)); if (cand.length) { const [pool, id] = cand[Math.random() * cand.length | 0]; createPartItem(id, { pool, location: 'stash' }); if (!S.owned.includes(id)) S.owned.push(id); salvage = part(pool, id).name; } }
    S.rec.w++; if (F.reason !== 'Decision') S.rec.ko++; if (fin === 'destroy') S.rec.des++;
    const nl = opp.lg + 1, before = nl < LEAGUES.length && lgOpen(nl);
    if (!S.wins.includes(opp.id)) S.wins.push(opp.id);
    if (nl < LEAGUES.length && !before && lgOpen(nl)) unlocked = LEAGUES[nl].name;
  } else S.rec.l++;
  S.history.push({ opp: opp.id, win, how: F.reason === 'Decision' ? 'Decision' : F.reason === 'TKO' ? 'TKO' : 'Knockout', round: F.round, venue: curVenue, net }); if (S.history.length > 20) S.history.shift();
  if (dq) S.history[S.history.length - 1].how = 'Disqualified';
  const m4 = afterCareerFight(me, opp, win, F.reason, fin, bt); if (tutorialRewardDue) { S.workbookTutorial = { ...S.workbookTutorial, status:'complete', rewardGranted:true }; m4.tutorialReward = 120; pushNews('Guided first outing complete · 120 Scrap paid after the pit bout.'); } if (win && streakN() >= 5) unlockTrophy('streak5', m4.trophies); activateWreckReplacementBot();
  save(); G.money = { lines, net, unlocked, salvage, dq, ...m4 };
}
const WCLASS = ['Lightweight', 'Middleweight', 'Heavyweight'], wcIx = spec => WCLASS.indexOf(weightClass(spec));
const SPONSORS = [
  { id: 'ratchet', name: 'Ratchet & Sons Hardware', tag: 'R&S', col: '#c7362f', goal: 'Win the fight', pay: 35, req: () => true, reqTxt: '', ok: c => c.win },
  { id: 'blueflame', name: 'Blue Flame Welding', tag: 'BLUE FLAME', col: '#2a72a8', goal: 'Win by KO or TKO', pay: 70, req: () => S.rec.w >= 3, reqTxt: '3 career wins', ok: c => c.win && c.stop },
  { id: 'glasshouse', name: 'Glasshouse Optics', tag: 'GLASSHOUSE', col: '#5fae8f', goal: 'Land 45% of your punches', pay: 45, req: () => lgOpen(1), reqTxt: 'Underground league open', ok: c => c.acc >= .45 },
  { id: 'ironsaint', name: 'Iron Saint Insurance', tag: 'IRON SAINT', col: '#d8d2c2', goal: 'Finish above 50% hull with nothing torn off', pay: 55, req: () => lgOpen(1), reqTxt: 'Underground league open', ok: c => c.hull > .5 && !c.lost },
  { id: 'crowncola', name: 'Crown Cola', tag: 'CROWN', col: '#f0b20a', goal: 'Land 12 head shots', pay: 55, req: () => lgOpen(2), reqTxt: 'Regional league open', ok: c => c.head >= 12 },
  { id: 'demoday', name: 'Demolition Daily', tag: 'DEMO DAILY', col: '#7a4bc2', goal: 'Win and destroy the loser', pay: 90, req: () => lgOpen(2), reqTxt: 'Regional league open', ok: c => c.win && c.fin === 'destroy' },
];
const CONTRACT_LEN = 5, sponsorOf = () => S.sponsor && SPONSORS.find(x => x.id === S.sponsor.id);
const TROPHIES = [
  ['first_win', '🥇', 'First win', 'Win a career fight'], ['first_ko', '💥', 'Lights out', 'Win by KO or TKO'], ['destroyer', '🔧', 'Scrap merchant', 'Destroy a beaten bot'],
  ['streak5', '🔥', 'On a run', 'Win 5 in a row'], ['ko10', '🥊', 'Ten stoppages', '10 KO or TKO wins'], ['comeback', '⤴', 'Off the canvas', 'Win after being knocked down'],
  ['hurt', '🩹', 'Walking wounded', 'Win starting below 70% condition'], ['upclass', '⬆', 'Giant killer', 'Beat a bot from a heavier class'], ['feud', '⚖', 'Grudge settled', 'End a rivalry'],
  ['belt0', '🏆', 'Scrapyard champion', 'Win the Scrapyard belt'], ['belt1', '🏆', 'Underground champion', 'Win the Underground belt'], ['belt2', '🏆', 'Regional champion', 'Win the Regional belt'],
  ['belt3', '👑', 'Pit champion', 'Win the Pit Championship belt'], ['defence', '🛡', 'Defending champion', 'Defend a belt'], ['foreman', '⚙', 'Beat the Foreman', 'Beat The Foreman'],
  ['venues', '🗺', 'Tour of the circuit', 'Win at all six venues'], ['tourney', '🏅', 'Weekend warrior', 'Win a tournament'], ['contract', '✍', 'Paid in full', 'Finish a sponsor contract'], ['drill', '🎯', 'Perfect drill', 'Score 100% in a gym drill'],
];
const WORKBOOK_ACHIEVEMENTS = [
  { id:'first-blood', icon:'🩸', name:'First blood', condition:'Win your first fight' },
  { id:'scrapper', icon:'🛠', name:'Scrapper', condition:'Repair a part from Broken' },
  { id:'second-owner', icon:'🔩', name:'Second owner', condition:'Buy a used part and win with it' },
  { id:'iron-stable', icon:'🤖', name:'Iron stable', condition:'Own 4 bots at once', pending:'Garage expansion to four bays is waiting on the workbook’s missing Council reputation thresholds.' },
  { id:'never-again', icon:'☠', name:'Never again', condition:'Lose a bot to an Annihilated wreck' },
  { id:'phoenix', icon:'🔥', name:'Phoenix', condition:'Rebuild a Salvageable wreck and win with it', pending:'Scrapworks rebuild is locked until the workbook’s material quantities are resolved.' },
  { id:'road-warrior', icon:'🚚', name:'Road warrior', condition:'Survive 10 road ambushes', pending:'Road ambush triggers and resolution are not implemented.' },
  { id:'long-haul', icon:'🛣', name:'Long haul', condition:'Drive 1,000 km', pending:'The workbook names route links but provides no distances or kilometer counter.' },
  { id:'smuggler', icon:'🕵', name:'Smuggler', condition:'Pass an Obelisk checkpoint with 2 illegal parts', pending:'Checkpoint inspection and pass outcomes are not implemented.' },
  { id:'street-legend', icon:'🥊', name:'Street legend', condition:'Win 10 parking-lot bouts', pending:'Parking-lot bout triggers, opponents, and rewards are not implemented.' },
  { id:'pit-survivor', icon:'🛡', name:'Pit survivor', condition:'Survive 5 Rustmouth pit fights', pending:'Rustmouth road-pit fights are not implemented.' },
  { id:'clean-hands', icon:'🧼', name:'Clean hands', condition:'Win a title with only legal parts' },
  { id:'brand-loyal', icon:'🏷', name:'Brand loyal', condition:'Win with a full 4-part set from one maker', pending:'The workbook does not identify which parts make a maker’s four-part set.' },
  { id:'frankenbot', icon:'🧩', name:'Frankenbot', condition:'Win with parts from 6 different makers' },
  { id:'heat-death', icon:'🌡', name:'Heat death', condition:'Extract at heat level 10' },
  { id:'vault-breaker', icon:'🔐', name:'Vault breaker', condition:'Finish a Deep Vault', pending:'Deep Vault content is scheduled for a later offline completion phase.' },
  { id:'iconic', icon:'✨', name:'Iconic', condition:'Own any Iconic part', pending:'Current offline loot tables do not roll Iconic rarity; its acquisition route is not defined.' },
  { id:'collector', icon:'🗃', name:'Collector', condition:'Own one part from every maker', pending:'Full-catalog maker acquisition routes are not implemented.' },
  { id:'faction-family', icon:'🤝', name:'Faction family', condition:'Reach Family with any faction', pending:'Faction reputation bands and rep-earning rules are not implemented.' },
  { id:'double-agent', icon:'🎭', name:'Double agent', condition:'Trusted with two enemy factions', pending:'Faction reputation bands and enemy-faction relationships are not implemented.' },
  { id:'underdog', icon:'⬆', name:'Underdog', condition:'Beat a bot 25+ OVR higher' },
  { id:'untouchable', icon:'🎯', name:'Untouchable', condition:'Win a fight taking no head damage', pending:'The fight result does not yet record a reliable per-bout head-damage total.' },
  { id:'old-faithful', icon:'🕰', name:'Old faithful', condition:'A single bot wins 25 fights' },
  { id:'museum', icon:'🏛', name:'Museum', condition:'Fill the Hall of Wrecks trophy wall', pending:'The workbook does not define how many memorials fill the trophy wall.' },
  { id:'champion', icon:'🏆', name:'Champion', condition:'Win the Pit belt' },
];
const WORKBOOK_ACHIEVEMENT_BY_ID = Object.fromEntries(WORKBOOK_ACHIEVEMENTS.map(row => [row.id, row]));
function workbookAchievementFitInfo(bot) {
  const rows = Array.isArray(S.items) ? S.items : [], fitted = []; if (!bot) return { fitted, makers:new Set(), legal:false, usedMarket:false };
  if (bot.combatModel === 'workbook') {
    for (const [slot, itemId] of Object.entries(bot.workbookFittedItems || {})) { const item = workbookPartItemById(itemId), def = item && WORKBOOK_PART_BY_ID[item.defId]; if (item && def) fitted.push({ slot, item, def, maker:def.maker || '', legality:def.legality || '' }); }
  } else {
    for (const [slot, id] of Object.entries(bot.build || {})) { if (typeof id !== 'string' || !id || id === 'none') continue; const found = partByAny(id), def = found && found.q; if (!def) continue; const item = rows.find(row => row && row.kind === 'part' && row.location === 'bay' && row.botId === bot.id && row.defId === id) || null; fitted.push({ slot, item, def, maker:def.maker || (def.b && BRANDS[def.b]?.name) || def.b || '', legality:def.legality || '' }); }
  }
  const makers = new Set(fitted.map(row => String(row.maker || '').trim()).filter(Boolean)), legal = bot.combatModel === 'workbook' && fitted.length > 0 && fitted.every(row => String(row.legality).toLowerCase() === 'legal');
  return { fitted, makers, legal, usedMarket:fitted.some(row => row.item?.source === 'used-market') };
}
function evaluateWorkbookAchievements(event = {}) {
  if (!S.workbookAchievements || typeof S.workbookAchievements !== 'object' || Array.isArray(S.workbookAchievements)) S.workbookAchievements = {};
  const unlocked = [], unlock = id => { const def = WORKBOOK_ACHIEVEMENT_BY_ID[id]; if (!def || S.workbookAchievements[id]) return; S.workbookAchievements[id] = { day:Math.max(1, Math.floor(+S.stableDay || 1)) }; unlocked.push(def); if (event.announce !== false) toast(`Achievement unlocked: ${def.name}`, 'good'); };
  const stable = Array.isArray(S.stable) ? S.stable : [], ownedBotCount = Math.max(0, +event.ownedBotCountBefore || stable.filter(bot => bot && !bot.loaner).length);
  if (ownedBotCount >= 4) unlock('iron-stable');
  const partItems = (Array.isArray(S.items) ? S.items : []).filter(item => item && item.kind === 'workbook-part' && ['stash','bay','truck'].includes(item.location) && WORKBOOK_PART_BY_ID[item.defId]), ownedMakers = new Set(partItems.map(item => WORKBOOK_PART_BY_ID[item.defId]?.maker).filter(Boolean)), allMakers = new Set(WORKBOOK_PART_DEFS.map(def => def.maker).filter(Boolean));
  if (partItems.some(item => String(WORKBOOK_PART_BY_ID[item.defId]?.rarity || '').toLowerCase() === 'iconic')) unlock('iconic');
  if (allMakers.size && [...allMakers].every(maker => ownedMakers.has(maker))) unlock('collector');
  const hall = Array.isArray(S.hallOfWrecks) ? S.hallOfWrecks : []; if (hall.some(row => row && row.outcome === 'Annihilated')) unlock('never-again');
  if (stable.some(bot => bot && (+bot.fightRecord?.w || +bot.rec?.w || 0) >= 25) || hall.some(row => (+row.record?.w || 0) >= 25)) unlock('old-faithful');
  if (S.trophies?.belt3) unlock('champion');
  if (event.type === 'fight') {
    const bot = event.bot, fitInfo = event.fitInfo || workbookAchievementFitInfo(bot), bout = event.bout;
    if (event.win && +S.rec?.w === 1 && +S.rec?.l === 0) unlock('first-blood');
    if (event.win && fitInfo.usedMarket) unlock('second-owner');
    if (event.win && bout?.kind === 'title' && fitInfo.legal) unlock('clean-hands');
    if (event.win && fitInfo.makers.size >= 6) unlock('frankenbot');
    if (event.win && Number.isFinite(+event.playerOVR) && Number.isFinite(+event.opponentOVR) && +event.opponentOVR - +event.playerOVR >= 25) unlock('underdog');
    if (event.win && event.beltWon && +bout?.lg === 3) unlock('champion');
    if (event.wreck?.outcome === 'Annihilated') unlock('never-again');
  }
  if (event.type === 'repair' && event.fromBroken) unlock('scrapper');
  if (event.type === 'run-extracted' && +event.heat >= 10) unlock('heat-death');
  return unlocked;
}

function unlockTrophy(id, list) { if (S.trophies[id]) return; S.trophies[id] = S.rec.w + S.rec.l || 1; const t = TROPHIES.find(x => x[0] === id); if (list) list.push(t); toast(`Trophy unlocked: ${t[1]} ${t[2]}`, 'good'); }
function streakN() { let n = 0; for (let i = S.history.length - 1; i >= 0 && S.history[i].win; i--) n++; return n; }
function worldInit() {
  if (!S.world || typeof S.world !== 'object') S.world = { rec: {}, log: [], n: 0 };
  for (const b of ROSTER) { if (!S.world.rec[b.id]) { const m = String(b.baseRec || b.rec).split(/[–-]/).map(Number); S.world.rec[b.id] = [m[0] || 0, m[1] || 0]; } if (!b.baseRec) b.baseRec = b.rec; b.rec = `${S.world.rec[b.id][0]}–${S.world.rec[b.id][1]}`; }
}
function worldResult(wId, lId) { const w = wId && S.world.rec[wId], l = lId && S.world.rec[lId]; if (w) w[0]++; if (l) l[1]++; for (const id of [wId, lId]) { if (!id) continue; const b = ROSTER.find(x => x.id === id); if (b) b.rec = `${S.world.rec[id][0]}–${S.world.rec[id][1]}`; } }
function worldTick(n = 3) {
  worldInit(); let left = n;
  const one = () => {
    if (left-- <= 0) { save(); return; }
    const lg = Math.random() * 4 | 0, list = ROSTER.filter(b => b.lg === lg), champ = champOf(lg), title = !S.belts[lg] && Math.random() < .22;
    let a = title ? champ : list[Math.random() * list.length | 0], b = list[Math.random() * list.length | 0]; let guard = 0; while ((b === a || (title && b === champ)) && guard++ < 20) b = list[Math.random() * list.length | 0];
    const venue = a.venue || LEAGUE_VENUE[lg], F = simulate({ ...a }, { ...b }, Math.random() * 1e9 | 0, { rounds: title ? 5 : 3, roundLen: 45 }), W2 = F.winner === 1 ? b : a, L = W2 === a ? b : a;
    worldResult(W2.id, L.id); S.world.n++;
    const how = F.reason === 'Decision' ? 'decision' : `${F.reason} in R${F.round}`;
    let line = `${W2.name} def. ${L.name} by ${how} · ${VENUES[venue].name}`;
    if (title) { if (W2 !== champ) { S.holders[lg] = W2.id; line = `NEW CHAMPION: ${W2.name} takes the ${BELTS[lg]} from ${champ.name} by ${how}`; } else line = `${champ.name} defends the ${BELTS[lg]} against ${L.name} by ${how}`; }
    S.world.log.unshift(line); S.world.log = S.world.log.slice(0, 12);
    setTimeout(one, 30);
  };
  setTimeout(one, 400);
}
/* ---- scrap market + workbench ---- */
const SLOT_POOL = { head: 'head', torso: 'torso', lead: 'arms', rear: 'arms', legs: 'legs', back: 'back' };
const tuneCost = (q, lv) => Math.round((q.cost || 0) * (lv ? .8 : .5)) + (lv ? 50 : 30);
const allParts = () => Object.entries(PARTS).flatMap(([pool, list]) => list.map(q => ({ pool, q })));
function refreshMarket() {
  const cand = allParts().filter(({ q }) => q.cost > 0 && q.b !== 'GB' && rarityOf(q) !== 'illegal' && !S.owned.includes(q.id) && !String(q.id).startsWith('fab'));
  const items = []; for (let i = 0; i < 4 && cand.length; i++) { const k = Math.random() * cand.length | 0, { pool, q } = cand.splice(k, 1)[0]; items.push({ pool, id: q.id, price: Math.round(q.cost * (.38 + Math.random() * .14)) }); }
  S.market = { items };
}
const WORKBOOK_VENDOR_CODES = ['HO','MR','VT'];
function workbookRarityColor(def) { const key = String(def && def.rarity || '').toLowerCase(), bucket = key === 'common' ? 'scrap' : key === 'uncommon' ? 'street' : key === 'rare' ? 'pro' : 'proto'; return RARITY[bucket].col; }
function workbookVendorSellValue(item) {
  const def = item && WORKBOOK_PART_BY_ID[item.defId]; if (!def) return 0;
  const condition = clamp(Number.isFinite(+(item.state || {}).condition) ? +(item.state || {}).condition : 100, 0, 100), integrity = clamp(Number.isFinite(+(item.state || {}).integrity) ? +(item.state || {}).integrity : 100, 0, 100);
  return Math.round((+def.baseValueScrap || 0) * .35 * (condition / 100) * (.5 + integrity / 200));
}
function addWorkbookLedgerEntry(entry) {
  if (!Array.isArray(S.workbookLedger)) S.workbookLedger = [];
  S.workbookLedger.push({ ...entry, day: Math.max(1, Math.floor(+S.stableDay || 1)) });
  if (S.workbookLedger.length > 5000) S.workbookLedger.splice(0, S.workbookLedger.length - 5000);
}
function refreshWorkbookMarket() {
  const day = Math.max(1, Math.floor(+S.stableDay || 1));
  if (S.workbookMarket && +S.workbookMarket.day === day && Array.isArray(S.workbookMarket.items)) return;
  const eligible = WORKBOOK_PHASE1B_PARTS.filter(def => WORKBOOK_VENDOR_CODES.includes(def.phase1BFactionCode) && /vendor/i.test(String(def.whereToFind || ''))), rng = mulberry32((0x5C4A7D + day * 7919) >>> 0), items = [], pool = eligible.slice();
  const take = choices => { if (!choices.length) return null; const picked = choices[rng() * choices.length | 0], at = pool.indexOf(picked); if (at >= 0) pool.splice(at, 1); return picked; };
  for (const code of WORKBOOK_VENDOR_CODES) { const picked = take(pool.filter(def => def.phase1BFactionCode === code)); if (picked) items.push({ defId: picked.id, price: Math.round((+picked.baseValueScrap || 0) * 1.2), factionCode: code }); }
  while (items.length < 4 && pool.length) { const picked = take(pool); if (picked) items.push({ defId: picked.id, price: Math.round((+picked.baseValueScrap || 0) * 1.2), factionCode: picked.phase1BFactionCode }); }
  S.workbookMarket = { day, items };
  save();
}
const WORN_COND = { head: 'glitch', torso: 'leak', lead: 'gear', rear: 'stutter', legs: 'wobble' };
/* ---- events between fights ---- */
const EVENTS = [
  { id: 'dealer', ok: () => allParts().some(({ q }) => rarityOf(q) === 'illegal' && !owns(q.id)), make: () => { const c = allParts().filter(({ q }) => rarityOf(q) === 'illegal' && !owns(q.id)), x = c[Math.random() * c.length | 0]; return { id: x.q.id, name: x.q.name, price: Math.round(x.q.cost * .5) }; },
    title: 'A shady parts dealer', text: d => `A man in a long coat opens it up in your garage. Inside: ${d.name}, ${d.price} scrap, half price. It's illegal from the Regional league up, and inspectors can disqualify you.`, yes: d => `Buy it · ${d.price}`, no: 'Walk away', accept: d => { if (!S.sandbox && S.scrap < d.price) { toast('Not enough scrap.'); return false; } if (!S.sandbox) S.scrap -= d.price; createPartItem(d.id, { location: 'stash' }); if (!S.owned.includes(d.id)) S.owned.push(d.id); toast(`${d.name} is in your parts rack.`, 'good'); } },
  { id: 'sick', title: 'Your mechanic is sick', text: () => 'Your corner mechanic caught something nasty at the Drain. They will still work your corner, but with one weld fewer next fight.', yes: () => 'Get well soon', accept: () => { S.mods.weldsMinus = 1; } },
  { id: 'promoter', ok: () => ROSTER.some(b => botOpen(b.id) && wcIx(b) > wcIx(playerSpec()) && !isChamp(b.id)), make: () => { const c = ROSTER.filter(b => botOpen(b.id) && wcIx(b) > wcIx(playerSpec()) && !isChamp(b.id)), b = c[Math.random() * c.length | 0]; return { id: b.id, name: b.name, wc: weightClass(b) }; },
    title: 'Short-notice fight', text: d => `A promoter lost his main event. He wants you as the late replacement against ${d.name}, a ${d.wc.toLowerCase()}. Win it and the purse is doubled.`, yes: () => 'Take the fight', no: 'Pass', accept: d => { S.opp = d.id; S.mods.purse2 = d.id; } },
  { id: 'windfall', make: () => ({ amt: 40 + (Math.random() * 6 | 0) * 10 }), title: 'Scrap windfall', text: d => `A neighbour clears out their shed and drops a truckload of scrap at your door. That's ${d.amt} scrap you didn't have.`, yes: d => `Thanks! +${d.amt}`, accept: d => { S.scrap += d.amt; } },
  { id: 'interview', make: () => { const r = Object.keys(S.rivals).filter(id => rivalOf(id))[0]; return { rival: r || '', name: r ? BOT(r).name : '' }; }, title: 'The paper wants an interview', text: d => `The Eastside Gazette wants a quote for Sunday's edition. It pays 25 scrap.${d.rival ? ` ${d.name}'s crew reads that paper, though.` : ''}`, yes: () => 'Talk to them · +25', no: 'No comment', accept: d => { S.scrap += 25; if (d.rival) bumpRival(d.rival, 1, S.rivals[d.rival].why); } },
  { id: 'sabotage', ok: () => Object.keys(S.rivals).some(id => rivalOf(id)), make: () => { const r = Object.keys(S.rivals).filter(id => rivalOf(id))[0]; return { name: BOT(r).name }; }, title: 'Someone was in the garage', text: d => `The back door was open this morning and your tools were moved. ${d.name}'s crew, maybe. Your gyros feel off: you start the next fight with a wobble.`, yes: () => 'Check the bolts', accept: () => { partStateFor('legs').faults = [{ type: 'wobble', severity: 1 }]; } },
  { id: 'gym', title: 'An old champ drops by', text: () => 'A retired champion is passing through and offers to run a sparring session with your bot. No charge.', yes: () => '+1 gym session', accept: () => { S.gym = Math.min(3, (S.gym || 0) + 1); } },
];
function rollEvent() { if (S.event || Math.random() > .38) return; const ok = EVENTS.filter(e => !e.ok || e.ok()); const e = ok[Math.random() * ok.length | 0]; if (e) S.event = { id: e.id, d: e.make ? e.make() : {} }; }
/* ---- tournaments ---- */
const tOdds = (a, b) => 1 / (1 + Math.exp(-((a === 'you' ? ovrOf(playerSpec()) : ovrOf(BOT(a))) - (b === 'you' ? ovrOf(playerSpec()) : ovrOf(BOT(b)))) / 6));
const tName = id => id === 'you' ? playerSpec().name : BOT(id).name;
function tourneyLg() { return LEAGUES.reduce((m, L, i) => lgOpen(i) ? i : m, 0); }
const tFee = lg => 40 + lg * 30, tPurse = lg => LEAGUES[lg].purse;
function startTourney() {
  const lg = tourneyLg(), fee = tFee(lg); if (!S.sandbox && S.scrap < fee) { toast(`The entry fee is ${fee} scrap.`); return; }
  if (!S.sandbox) S.scrap -= fee; const pool = ROSTER.filter(b => b.lg === lg).sort(() => Math.random() - .5).slice(0, 7).map(b => b.id), ids = ['you', ...pool].sort(() => Math.random() - .5);
  S.tourney = { lg, rounds: [[0, 2, 4, 6].map(i => ({ a: ids[i], b: ids[i + 1], w: '' }))], r: 0, done: false, champ: '' }; save(); refreshWallet();
  pushNews(`${playerSpec().name} enters the ${LEAGUES[lg].name} Open`); toast(`Entered the ${LEAGUES[lg].name} Open.`, 'good');
}
function tourneyOpp() { const T = S.tourney; if (!T || T.done) return null; const m = T.rounds[T.r].find(x => x.a === 'you' || x.b === 'you'); return m ? (m.a === 'you' ? m.b : m.a) : null; }
function tourneyAdvance(T) { const w = T.rounds[T.r].map(m => m.w); if (w.length > 1) { const nx = []; for (let i = 0; i < w.length; i += 2) nx.push({ a: w[i], b: w[i + 1], w: '' }); T.rounds.push(nx); T.r++; } else { T.done = true; T.champ = w[0]; } }
function tourneyAfter(win) {
  const T = S.tourney; if (!T || T.done) return []; const lines = [], P = tPurse(T.lg);
  for (const m of T.rounds[T.r]) { if (m.a === 'you' || m.b === 'you') m.w = win ? 'you' : (m.a === 'you' ? m.b : m.a); else m.w = Math.random() < tOdds(m.a, m.b) ? m.a : m.b; }
  const rnd = T.r; tourneyAdvance(T);
  if (!win) { const prize = [0, Math.round(P * .6), Math.round(P * 1.5)][rnd]; if (prize) lines.push(['Tournament prize', prize]); while (!T.done) { for (const m of T.rounds[T.r]) m.w = Math.random() < tOdds(m.a, m.b) ? m.a : m.b; tourneyAdvance(T); } pushNews(`${tName(T.champ)} wins the ${LEAGUES[T.lg].name} Open`); T.out = rnd; }
  else if (T.done) { lines.push(['Tournament prize', P * 4]); pushNews(`${playerSpec().name} wins the ${LEAGUES[T.lg].name} Open`); }
  else lines.push(['Advances to the ' + (T.rounds[T.r].length === 1 ? 'final' : 'semi-finals'), 0]);
  return lines;
}
const WRECK_BASE_SALVAGE_CHANCE = .7;
function calculateWreckCheck({ frameIntegrity = 100, overkillDamage = 0, destroyFinisher = false, hazardOrExplosion = false, hardcoreDistrict = false, insuredOrGrange = false, baseSalvageChance = WRECK_BASE_SALVAGE_CHANCE } = {}) {
  const severity = Math.max(0, +overkillDamage || 0) * .6 + (destroyFinisher ? 35 : 0) + (hazardOrExplosion ? 25 : 0) + (hardcoreDistrict ? 100 : 0);
  const salvageable = hardcoreDistrict ? 0 : clamp((+baseSalvageChance || 0) * clamp(+frameIntegrity || 0, 0, 100) / 100 - severity / 150 + (insuredOrGrange ? .1 : 0), 0, .95);
  const annihilated = hardcoreDistrict ? .6 : clamp((severity - 60) / 200, 0, .6), totaled = Math.max(0, 1 - salvageable - annihilated);
  return { severity, salvageable, annihilated, totaled };
}
function rollWreckOutcome(check, roll) {
  const value = clamp(Number.isFinite(+roll) ? +roll : 0, 0, .999999999);
  return { ...check, roll: value, outcome: value < check.salvageable ? 'Salvageable' : value < check.salvageable + check.annihilated ? 'Annihilated' : 'Totaled' };
}
function wreckPartItemsForBot(bot) { return (S.items || []).filter(item => item && ['part','workbook-part'].includes(item.kind) && item.location === 'bay' && item.botId === bot.id); }
function wreckPartInfo(item) {
  const def = item.kind === 'workbook-part' ? WORKBOOK_PART_BY_ID[item.defId] : null, legacy = def ? null : partByAny(item.defId)?.q;
  return { name: def?.name || legacy?.name || item.defId || 'Unknown part', value: Math.max(0, +def?.baseValueScrap || +legacy?.cost || 0), material: def?.material || '' };
}
function recordWreckPart(bot, item, action, detail = {}) {
  const row = { botId: bot.id, ...detail };
  if (item.kind === 'workbook-part') logWorkbookPartHistory(item, action, row);
  recordStablePartHistory(bot, item, action, row);
}
function setWreckPartCondition(item, condition) { item.state = cleanPartState(item.state || {}); item.state.condition = clamp(Math.round(condition), 0, 100); }
function moveWreckPartToStash(bot, item, action, detail = {}) {
  const state = cleanPartState(item.state || {}); recordWreckPart(bot, item, action, { ...detail, condition: state.condition, integrity: state.integrity });
  item.state = state; item.location = 'stash'; item.botId = null; item.slot = null;
}
function stableBotCanEnterArena(bot) {
  if (!bot || bot.wreckStatus === 'salvageable' || bot.role === 'Hauler') return false;
  return bot.combatModel === 'workbook' ? workbookCombatAdapter(bot).ready : bot.combatReady !== false;
}
function loadStableBotAfterWreck(bot) {
  if (!bot) return false;
  S.activeBotId = bot.id;
  for (const key of BOT_STATE_FIELDS) if (bot[key] !== undefined) S[key] = saveCopy(bot[key]);
  if (bot.combatModel === 'workbook') { S.build = saveCopy(DEFAULT.build); S.equippedItems = {}; S.partWear = {}; S.worn = {}; S.tune = {}; S.mods = {}; }
  else S.equippedItems = saveCopy(bot.equippedItems || {});
  return true;
}
function activateWreckReplacementBot() {
  const id = S.pendingWreckActiveBotId; if (!id) return false;
  const bot = (S.stable || []).find(entry => entry && entry.id === id); delete S.pendingWreckActiveBotId;
  if (!bot) return false;
  loadStableBotAfterWreck(bot); if (stableBuildBotId && !(S.stable || []).some(entry => entry && entry.id === stableBuildBotId)) stableBuildBotId = bot.id;
  return true;
}
function issueJunklineLoaner() {
  // User-approved offline continuation bridge: use the existing v7 starter core. The workbook gives no loaner loadout, and this remains a legacy combat build rather than a 10-Capacity-valid workbook fit.
  const garageBay = freeStableBay(), storageLocation = garageBay == null ? 'truck' : 'garage';
  let serial = 1, id = `junkline-loaner-${serial}`; while ((S.stable || []).some(bot => bot && bot.id === id) || (S.hallOfWrecks || []).some(row => row && row.botId === id)) id = `junkline-loaner-${++serial}`;
  const build = normBuild({ head:'bucket', torso:'barrel', lead:'pipe', rear:'pipe', legs:'stumps', back:'none' }), equippedItems = {};
  const fields = Object.fromEntries(BOT_STATE_FIELDS.map(key => [key, saveCopy(DEFAULT[key])]));
  Object.assign(fields, { build, equippedItems, name:'Junkline Loaner', nick:'The Borrowed Wrench', story:'Lent by Junkline after the stable lost its last fight-ready bot.', rec:{ w:0, l:0, ko:0, des:0 }, partWear:{}, history:[], training:{}, mods:{}, tune:{}, worn:{} });
  const bot = { ...fields, id, combatModel:'legacy', combatReady:true, bayIndex:storageLocation === 'truck' ? -1 : garageBay, storageLocation, frameItemId:null, role:'Fighter', fatigue:0, survivedFights:0, wrecksSurvived:0, wreckStatus:'', loaner:true, veteran:false, legend:false, frameCapacityBonus:0, legendPaintUnlocked:false, legendCrowdBonus:false, partsHistory:[], makers:[], scars:[], fightRecord:{ w:0,l:0,ko:0,des:0 } };
  const frame = createFrameItem('laundromat-shell', { location:storageLocation === 'truck' ? 'truck' : 'bay', botId:id });
  bot.frameItemId = frame?.itemId || null;
  for (const slot of ['head','torso','lead','rear','legs']) {
    const defId = build[slot], found = partByAny(defId), item = createPartItem(defId, { pool:found?.pool, location:'bay', botId:id, slot, state:cleanPartState() });
    if (item) { equippedItems[slot] = item.itemId; if (!S.owned.includes(defId)) S.owned.push(defId); recordStablePartHistory(bot, item, 'loaner-issued', { slot }); }
  }
  bot.equippedItems = equippedItems; S.stable.push(bot); S.loanerIssued = true; return bot;
}
function applyFightWreck(me, fin) {
  const bot = activeStableBot(); if (!bot || !me || +(me.spec.workbookCombat ? workbookPartItemById(me.spec.workbookCombat.itemIds.torso)?.state?.condition : partStateFor('torso').condition) > 0) return null;
  syncActiveBot();
  const frameItem = frameItemById(bot.frameItemId), frame = frameDefFor(frameItem), frameIntegrity = frameItem ? +frameItem.integrity : 100, items = wreckPartItemsForBot(bot);
  const check = calculateWreckCheck({ frameIntegrity, overkillDamage:me.overkillDamage || 0, destroyFinisher:fin === 'destroy', hazardOrExplosion:!!me.wreckExplosionHit, insuredOrGrange:S.sponsor?.id === 'ironsaint' });
  const result = rollWreckOutcome(check, G.F.rng()), day = Math.max(1, Math.floor(+S.stableDay || 1)), parts = [];
  const frameInfo = frame ? { itemId:frameItem.itemId, defId:frame.id, name:frame.name, integrity:frameIntegrity } : null;
  const partRows = items.map(item => ({ item, ...wreckPartInfo(item) }));
  if (result.outcome === 'Salvageable') {
    for (const row of partRows) {
      const state = cleanPartState(row.item.state || {}); setWreckPartCondition(row.item, G.F.rng() * 10); row.item.state.integrity = Math.max(0, state.integrity - 15);
      recordWreckPart(bot, row.item, 'wreck-salvageable', { condition:row.item.state.condition, integrity:row.item.state.integrity, slot:row.item.slot });
      parts.push({ itemId:row.item.itemId, name:row.name, disposition:'Fitted for rebuild', condition:row.item.state.condition, integrity:row.item.state.integrity });
    }
    bot.wreckStatus = 'salvageable'; bot.wrecksSurvived = Math.max(0, +bot.wrecksSurvived || 0) + 1;
    if (!Array.isArray(bot.scars)) bot.scars = []; bot.scars.push(`Fight wreck · ${G.op?.name || 'opponent'} · ${result.outcome}`);
  } else {
    let memento = result.outcome === 'Annihilated' && partRows.length ? Math.floor(G.F.rng() * partRows.length) : -1;
    for (let i = 0; i < partRows.length; i++) {
      const row = partRows[i], item = row.item; let disposition = 'Scrapped';
      if (result.outcome === 'Annihilated') disposition = i === memento ? 'Memento · Broken' : 'Scrapped';
      else { const roll = G.F.rng(); disposition = roll < .4 ? 'Broken' : roll < .75 ? 'Critical' : 'Scrapped'; }
      if (disposition.includes('Broken')) { setWreckPartCondition(item, Math.max(1, Math.min(14, +item.state?.condition || 0))); moveWreckPartToStash(bot, item, 'wreck-recovered', { slot:item.slot, outcome:result.outcome, disposition }); }
      else if (disposition === 'Critical') { setWreckPartCondition(item, clamp(+item.state?.condition || 0, 15, 39)); moveWreckPartToStash(bot, item, 'wreck-recovered', { slot:item.slot, outcome:result.outcome, disposition }); }
      else { recordWreckPart(bot, item, 'wreck-scrapped', { slot:item.slot, outcome:result.outcome, disposition, condition:item.state?.condition, integrity:item.state?.integrity }); S.items = S.items.filter(owned => owned !== item); }
      parts.push({ itemId:item.itemId, name:row.name, disposition, condition:disposition === 'Scrapped' ? 0 : item.state.condition, integrity:disposition === 'Scrapped' ? 0 : item.state.integrity });
    }
    if (frameItem) { recordStableFrameHistory(bot, frameItem, 'wreck-frame-lost'); S.items = S.items.filter(item => item !== frameItem); }
    bot.frameItemId = null; bot.wreckStatus = result.outcome.toLowerCase();
  }
  const report = { ...result, botId:bot.id, botName:bot.name || 'Unnamed Bot', opponent:G.op?.name || 'Unknown opponent', venue:curVenue, day, frame:frameInfo, parts, lost:result.outcome !== 'Salvageable', rebuilt:false, rebuildScrapCost:Math.ceil(partRows.reduce((sum,row) => sum + row.value, 0) * .6) };
  if (!Array.isArray(S.hallOfWrecks)) S.hallOfWrecks = [];
  const record = { wreckId:`wreck-${day}-${S.hallOfWrecks.length + 1}`, botId:bot.id, botName:bot.name || 'Unnamed Bot', outcome:result.outcome, lost:report.lost, opponent:report.opponent, venue:report.venue, day, frame:frameInfo, record:saveCopy(bot.fightRecord || bot.rec || DEFAULT.rec), scars:saveCopy(bot.scars || []), parts:saveCopy(parts), probabilities:{ salvageable:result.salvageable, annihilated:result.annihilated, totaled:result.totaled }, severity:result.severity, roll:result.roll, rebuildScrapCost:report.rebuildScrapCost, rebuilt:false };
  S.hallOfWrecks.unshift(record); report.wreckId = record.wreckId; bot.lastWreck = saveCopy(report);
  if (report.lost) S.stable = (S.stable || []).filter(entry => entry !== bot);
  const next = (S.stable || []).find(stableBotCanEnterArena) || (!report.lost && null);
  let active = next;
  if (!active) { active = issueJunklineLoaner(); report.loanerGranted = true; }
  S.pendingWreckActiveBotId = active.id; if (stableBuildBotId === bot.id) stableBuildBotId = active.id;
  return report;
}
function afterCareerFight(me, opp, win, reason, fin, bt) {
  const out = { belt: '', rival: '', repair: 0, coreBreach: !!me.coreBreached }, P = playerSpec(), stop = reason === 'KO' || reason === 'TKO';
  addSalvageXP(win ? WORKBOOK_XP_AWARDS.fightWin : WORKBOOK_XP_AWARDS.fightLoss); storeDamage(me); const workbookFight = !!me.spec.workbookCombat, workbookCore = workbookFight && workbookPartItemById(me.spec.workbookCombat.itemIds.torso);
  out.repair = repairTotal(); out.workbookRepairPending = workbookFight;
  const survivedFight = reason !== 'Forfeit' && (workbookFight ? +(workbookCore?.state?.condition ?? 0) > 0 : partStateFor('torso').condition > 0);
  const stableBot = activeStableBot(), achievementFit = stableBot ? workbookAchievementFitInfo(stableBot) : null, ownedBotCountBefore = (S.stable || []).filter(bot => bot && !bot.loaner).length;
  if (stableBot) {
    const record = stableBot.fightRecord || (stableBot.fightRecord = { w:0, l:0, ko:0, des:0 });
    if (win) { record.w++; if (reason !== 'Decision') record.ko++; if (fin === 'destroy') record.des++; } else record.l++;
    out.fatigueGain = win ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2);
    stableBot.fatigue = clamp((+stableBot.fatigue || 0) + out.fatigueGain, 0, 100); out.fatigue = stableBot.fatigue; out.fatiguePenalty = fatiguePenaltyPct(stableBot.fatigue);
    if (survivedFight) {
      stableBot.survivedFights = Math.max(0, +stableBot.survivedFights || 0) + 1;
      if (stableBot.survivedFights >= 10 && !stableBot.veteran) { stableBot.veteran = true; stableBot.frameCapacityBonus = Math.max(2, +stableBot.frameCapacityBonus || 0); out.pedigree = 'Veteran'; }
      if (stableBot.survivedFights >= 25 && !stableBot.legend) { stableBot.legend = true; stableBot.legendPaintUnlocked = true; stableBot.legendCrowdBonus = true; out.pedigree = 'Legend'; }
    }
  }
  if (reason !== 'Forfeit') out.wreck = applyFightWreck(me, fin);
  S.mods = {}; refreshMarket(); rollEvent(); if (S.tourney && S.tourney.done && S.tourney.champ === 'you' && G.match.tourney) out.tourneyWon = true; worldInit(); if (reason !== 'Forfeit') worldResult(win ? null : opp.id, win ? opp.id : null); worldTick(3); S.gym = Math.min(3, (S.gym || 0) + 1);
  const hh = S.h2h[opp.id] || [0, 0]; hh[win ? 0 : 1]++; S.h2h[opp.id] = hh;
  /* titles */
  if (bt && bt.kind === 'title' && win) { S.belts[bt.lg] = { def: 0, since: 0 }; out.belt = 'won'; pushNews(`${P.name} wins the ${BELTS[bt.lg]} from ${opp.name}`); }
  if (bt && bt.kind === 'defence') { if (win) { S.belts[bt.lg].def++; S.belts[bt.lg].since = 0; out.belt = 'defended'; pushNews(`${P.name} defends the ${BELTS[bt.lg]} against ${opp.name}`); } else { delete S.belts[bt.lg]; S.holders[bt.lg] = opp.id; out.belt = 'lost'; pushNews(`${opp.name} takes the ${BELTS[bt.lg]} from ${P.name}`); } S.defend = null; }
  if (!bt || bt.kind !== 'defence') {
    if (S.defend && S.belts[S.defend.lg]) { S.defend.left--; if (S.defend.left <= 0) { const lg = S.defend.lg; delete S.belts[lg]; S.holders[lg] = S.defend.id; out.belt = 'stripped'; out.beltLg = lg; pushNews(`${P.name} is stripped of the ${BELTS[lg]} for ducking ${BOT(S.defend.id).name}`); S.defend = null; } }
    for (const lg in S.belts) if (!(bt && bt.kind === 'title' && +lg === bt.lg)) S.belts[lg].since = (S.belts[lg].since || 0) + 1;
  }
  if (!S.defend) { const due = Object.keys(S.belts).map(Number).sort((a, b) => b - a).find(lg => S.belts[lg].since >= 3); if (due != null) {
    const pool = ROSTER.filter(b => b.lg === due && !isChamp(b.id)), rv = pool.filter(b => rivalOf(b.id)).sort((a, b) => S.rivals[b.id].heat - S.rivals[a.id].heat)[0];
    const ch = rv || pool.slice().sort((a, b) => ovrOf(b) - ovrOf(a))[(S.belts[due].def || 0) % 3]; S.defend = { lg: due, id: ch.id, left: 3 }; out.challenger = ch.name; pushNews(`${ch.name} is the mandatory challenger for the ${BELTS[due]}`); } }
  /* rivals */
  const was = rivalOf(opp.id); let r = '';
  if (win) {
    if (was) r = bumpRival(opp.id, fin === 'destroy' ? -3 : stop ? -2 : -1, was.why);
    else if (bt && bt.kind === 'title') r = bumpRival(opp.id, 2, 'belt');
    else if (fin === 'destroy') r = bumpRival(opp.id, 2, 'destroyed');
    else if (hh[0] >= 2 && Math.random() < .5) r = bumpRival(opp.id, 1, 'beat2');
  } else if (reason !== 'Forfeit') {
    if (stop) r = bumpRival(opp.id, 2, 'ko'); else if (was || Math.random() < .4) r = bumpRival(opp.id, 1, 'decision');
  }
  /* sponsor */
  const sp = sponsorOf(); if (sp) { S.sponsor.left--; if (S.sponsor.left <= 0) { out.contractDone = sp.name; S.sponsorsDone = (S.sponsorsDone || 0) + 1; S.sponsor = null; pushNews(`${P.name} completes a sponsor deal with ${sp.name}`); } }
  /* trophies */
  const tr = out.trophies = [], stopW = win && stop;
  if (win) { unlockTrophy('first_win', tr); if (stopW) unlockTrophy('first_ko', tr); if (fin === 'destroy') unlockTrophy('destroyer', tr); if (S.rec.ko >= 10) unlockTrophy('ko10', tr); if (me.kdTotal > 0) unlockTrophy('comeback', tr); if ((me.carried || 0) > .3) unlockTrophy('hurt', tr); if (wcIx(opp) > wcIx(P)) unlockTrophy('upclass', tr); if (opp.id === 'foreman') unlockTrophy('foreman', tr);
    if (!S.venueWins.includes(curVenue)) S.venueWins.push(curVenue); if (Object.keys(VENUES).every(v => S.venueWins.includes(v))) unlockTrophy('venues', tr); }
  if (out.tourneyWon) unlockTrophy('tourney', tr);
  if (out.belt === 'won') unlockTrophy('belt' + bt.lg, tr); if (out.belt === 'defended') unlockTrophy('defence', tr); if (out.contractDone) unlockTrophy('contract', tr);
  if (r) { out.rival = r; if (r === 'new') pushNews(`${opp.name} calls out ${P.name}: "${rivalTaunt(opp.id)}"`); if (r === 'settled') { pushNews(`${P.name} settles the feud with ${opp.name}`); unlockTrophy('feud', tr); } } out.workbookAchievements = evaluateWorkbookAchievements({ type:'fight', win, bot:stableBot, fitInfo:achievementFit, ownedBotCountBefore, playerOVR:ovrOf(me.spec), opponentOVR:ovrOf(opp), bout:bt, beltWon:out.belt === 'won', wreck:out.wreck });
  return out;
}
function nextBot() { const cur = BOT(S.opp), order = ROSTER.filter(b => botOpen(b.id) && !S.wins.includes(b.id) && !(isChamp(b.id) && !titleReady(b.lg))); return order.find(b => b.lg === cur.lg) || order.find(b => b.lg > cur.lg) || order[0] || null; }
function dmgLine(f) { const worst = ZONES.filter(z => !((z === 'lead' || z === 'rear') && f.lost[z])).sort((x, y) => frac(f, x) - frac(f, y))[0], lost = ['lead', 'rear'].filter(z => f.lost[z]).map(z => ZONE_NAME[z].toLowerCase()), cs = Object.values(f.cond).filter(Boolean).map(c => CONDS[c.type].name.toLowerCase()); if (frac(f, worst) >= .99 && !lost.length && !cs.length) return `<b>${esc(f.spec.name)}</b>: no damage.`; return `<b>${esc(f.spec.name)}</b>: worst hit ${ZONE_NAME[worst].toLowerCase()} at ${Math.round(clamp(frac(f, worst), 0, 1) * 100)}%${lost.length ? ', ' + lost.join(' and ') + ' torn off' : ''}${cs.length ? ', ' + cs.join(', ') : ''}.`; }
function resultM4() {
  const m = G.money, o = G.op, bt = G.match.bout, out = []; if (!m) return '';
  if (Number.isFinite(m.fatigueGain)) out.push(`<p class="unlock">${esc(G.F.f[0].spec.name)} gained <b>${m.fatigueGain} Fatigue</b> · ${m.fatigue || 0} total${m.fatiguePenalty ? ` · stats −${Math.round(m.fatiguePenalty * 100)}%` : ''}. Rest one in-game day to remove 2 Fatigue.</p>`);
  if (m.pedigree === 'Veteran') out.push('<p class="unlock good">Veteran earned: +2 frame Capacity recorded for this bot.</p>');
  if (m.pedigree === 'Legend') out.push('<p class="unlock good">Legend earned: unique paint slot and crowd response recorded for this bot.</p>');
  if (m.belt === 'won') out.push(`<p class="unlock good belt">🏆 You are the new ${BELTS[bt.lg]} holder. Defend it every few fights or lose it.</p>`);
  if (m.belt === 'defended') out.push(`<p class="unlock good belt">🏆 Title defended. ${BELTS[bt.lg]}, defence no. ${S.belts[bt.lg].def}.</p>`);
  if (m.belt === 'lost') out.push(`<p class="unlock belt lost">You lost the ${BELTS[bt.lg]}.</p>`);
  if (m.belt === 'stripped') out.push(`<p class="unlock belt lost">You were stripped of the ${BELTS[m.beltLg]} for skipping the mandatory defence.</p>`);
  if (m.challenger) out.push(`<p class="unlock">Mandatory challenger named: ${esc(m.challenger)}. Fight them within 3 fights.</p>`);
  if (m.rival === 'new') out.push(`<p class="unlock rival">New rival: ${esc(o.name)}. "${esc(rivalTaunt(o.id))}"</p>`);
  if (m.rival === 'up') out.push(`<p class="unlock rival">The feud with ${esc(o.name)} is heating up.</p>`);
  if (m.rival === 'down') out.push(`<p class="unlock good">The feud with ${esc(o.name)} is cooling off.</p>`);
  if (m.rival === 'settled') out.push(`<p class="unlock good">Feud settled with ${esc(o.name)}.</p>`);
  if ((m.trophies || []).length) out.push(`<p class="unlock good tline">Trophies: ${m.trophies.map(t => `${t[1]} ${t[2]}`).join(' · ')}</p>`); if ((m.workbookAchievements || []).length) out.push(`<p class="unlock good tline">Achievements: ${m.workbookAchievements.map(a => `${a.icon} ${a.name}`).join(' · ')}</p>`);
  if (m.contractDone) out.push(`<p class="unlock good">Contract complete with ${esc(m.contractDone)}. Sign a new sponsor in the Career hub.</p>`);
  if (m.coreBreach) out.push('<p class="unlock belt lost">Core breach: torso Integrity is 0. This core is beyond repair and must be replaced.</p>');
  if (m.wreck) {
    const w = m.wreck, odds = `Salvageable ${Math.round(w.salvageable * 100)}% · Totaled ${Math.round(w.totaled * 100)}% · Annihilated ${Math.round(w.annihilated * 100)}%`;
    out.push(`<p class="wreck-note"><b>Fight wreck · ${esc(w.outcome)}</b> — ${esc(w.botName)} · ${odds}. ${w.outcome === 'Salvageable' ? `The bot and fitted parts survive at 0–10% Condition; each part lost 15 Integrity. Rebuild at Scrapworks for ${w.rebuildScrapCost} Scrap plus materials and one day.` : `The frame and bot are lost. Recovered parts were transferred to stash; see the Hall of Wrecks in the Garage.`}${w.loanerGranted ? ' Junkline issued a Laundromat Shell loaner with starter parts.' : ''}</p>`);
  }
  const workbookCombat = G.F.f[0].spec.workbookCombat, workbookItems = workbookCombat ? Object.values(workbookCombat.itemIds).map(workbookPartItemById).filter(Boolean) : [], workbookDamaged = workbookItems.some(item => +item.state?.condition < 100 || +item.state?.integrity < 100 || item.state?.detached || item.state?.faults?.length);
  if (workbookCombat) out.push(workbookDamaged ? '<p class="note carry">Damage goes home with you.</p>' : '<p class="note carry">No damage to take home.</p>');
  else out.push(hasPartWear() ? `<p class="note carry">Damage goes home with you. Condition and Integrity are recorded per part. Current workshop repair estimate: <b>${m.repair || 0}</b> scrap${hasLost() ? '. Torn-off parts must be refitted before the next fight.' : ', or keep fighting hurt.'}</p>` : '<p class="note carry">No damage to take home.</p>');
  return out.join('');
}
function coachReport(F) {
  if (G.spectate || F.duo) return '';
  const f = F.f[F.human], s = f.coachStats, calls = s.calls;
  const delivered = calls.head + calls.body + calls.guard + calls.hay;
  if (F.controlMode !== 'coach' && !delivered && !s.signalLost && !s.signalDelayed) return '';
  const rows = [];
  if (calls.head) rows.push(`<div class="cr-row"><b>Head hunt</b><p>${calls.head} calls · ${s.focus.head.attempted} focused shots started · ${s.focus.head.landed} landed</p></div>`);
  if (calls.body) rows.push(`<div class="cr-row"><b>Body work</b><p>${calls.body} calls · ${s.focus.body.attempted} focused shots started · ${s.focus.body.landed} landed</p></div>`);
  if (calls.guard) rows.push(`<div class="cr-row"><b>Cover up</b><p>${calls.guard} calls · ${s.guardBlocks} punches blocked while the call was active</p></div>`);
  if (calls.hay) rows.push(`<div class="cr-row"><b>Haymaker</b><p>${calls.hay} calls · ${s.hay.attempted} called haymakers started · ${s.hay.landed} landed</p></div>`);
  const signals = s.signalLost || s.signalDelayed
    ? `<p class="cr-signal">Signal issues: ${s.signalLost ? `${s.signalLost} lost` : ''}${s.signalLost && s.signalDelayed ? ' · ' : ''}${s.signalDelayed ? `${s.signalDelayed} delayed` : ''}.</p>` : '';
  return `<section class="corner-report" aria-label="Coach call report"><div class="cr-head"><h4>Coach report</h4><span class="cr-count">${delivered} calls delivered</span></div>${rows.length ? rows.join('') : '<p class="cr-note">No Coach calls were delivered this fight. Try head focus, body work, Cover Up, or a queued haymaker next time.</p>'}<p class="cr-note">Focused shots began while that focus was active. Guard blocks count hits absorbed during Cover Up.</p>${signals}</section>`;
}
function openResult() {
  settle();
  const F = G.F, [a, b] = F.f, dq = G.money && G.money.dq, W2 = dq ? F.f[1] : F.f[F.winner], win = F.winner === 0 && !dq, fin = F.finish && F.finish.choice;
  setTheme(G.spectate || win ? 'victory' : 'defeat'); chant = null;
  const how = dq ? `Inspectors found an illegal part (${dq}). The win is overturned and the purse is withheld.` : F.reason === 'Decision' ? `Judges' decision, ${F.detail}.` : `${F.reason} in round ${F.round} · ${F.detail}.` + (fin === 'destroy' ? ` ${W2.spec.name} destroyed the loser.` : fin === 'spare' ? ` ${W2.spec.name} let them walk.` : '');
  const card = F.scores.map((s, i) => `<tr><td>Round ${i + 1}</td><td>${s[0]}</td><td>${s[1]}</td></tr>`).join('');
  const rows = [['Punches thrown', 'thrown'], ['Punches landed', 'landed'], ['Head shots', 'head'], ['Blocked', 'blocks'], ['Knockdowns', 'kd'], ['Critical hits', 'crit'], ['Damage dealt', 'dmg']];
  const corner = coachReport(F);
  const nb = G.career && win && !G.match.tourney ? nextBot() : null;
  const right = G.match.runEncounter ? renderWorkbookRunEncounterResult(G.runEncounterReport) : G.money ? `<div class="tbl money"><table class="rt"><thead><tr><th>Payout</th><th>Scrap</th></tr></thead><tbody>${G.money.lines.map(([l, v]) => `<tr><td>${l}</td><td class="${v < 0 ? 'neg' : 'pos'}">${v > 0 ? '+' : ''}${v}</td></tr>`).join('')}<tr class="tot"><td>Net</td><td class="${G.money.net < 0 ? 'neg' : 'pos'}">${G.money.net > 0 ? '+' : ''}${G.money.net}</td></tr><tr><td>Balance</td><td>${S.scrap}</td></tr></tbody></table>
    ${G.money.unlocked ? `<p class="unlock">League unlocked: ${G.money.unlocked}</p>` : ''}${G.money.salvage ? `<p class="unlock good">Salvaged from the wreck: ${G.money.salvage}. It is in your parts rack.</p>` : ''}${resultM4()}</div>`
    : `<div class="exnote"><p class="note">${G.spectate ? 'Exhibition bout.' : 'Quick fight.'} No purse, no repair bill, no record change.</p></div>`;
  const btns = G.match.runEncounter ? '<button class="btn primary" id="lobbyBtn">Back to Salvage Runs</button>' : G.career
    ? G.match.tourney ? `<button class="btn primary" id="lobbyBtn">Back to the bracket</button><button class="btn ghost" id="posterBtn">Save poster</button>` : `${nb ? `<button class="btn primary" id="nextBtn">Next: ${nb.name}</button>` : ''}<button class="btn ${nb ? '' : 'primary'}" id="rematchBtn">Rematch</button><button class="btn ghost" id="lobbyBtn">Back to the lobby</button><button class="btn ghost" id="posterBtn">Save poster</button>`
    : `<button class="btn primary" id="rematchBtn">Run it back</button><button class="btn ghost" id="posterBtn">Save poster</button><button class="btn ghost" id="lobbyBtn">${G.spectate ? 'Back' : 'Back to menu'}</button>`;
  openModal('result', `<div class="rbanner ${G.spectate ? 'neutral' : win ? 'win' : 'lose'}"><small>${G.spectate ? 'Result' : win ? 'Victory' : 'Defeat'}</small><h3>${W2.spec.name} wins</h3><p>${how}</p></div>
    <div class="rgrid"><div class="tbl"><table class="rt"><thead><tr><th></th><th>${a.spec.name}</th><th>${b.spec.name}</th></tr></thead><tbody>${card}${rows.map(([l, k]) => `<tr><td>${l}</td><td>${Math.round(a.cnt[k])}</td><td>${Math.round(b.cnt[k])}</td></tr>`).join('')}</tbody></table></div>${right}</div>
    <div class="dmgrep"><canvas id="resSilA" class="rsil" width="88" height="124"></canvas><div><b>Damage report</b><p>${dmgLine(a)}</p><p>${dmgLine(b)}</p></div><canvas id="resSilB" class="rsil" width="88" height="124"></canvas></div>
    ${corner}
    <div class="mbtns">${btns}</div>`);
  drawSil($('#resSilA'), a, 0, 0); drawSil($('#resSilB'), b, 1, 0);
  if (G.money && G.money.belt) say('pbp', pickLine('b' + G.money.belt, M4L[{ won: 'newChamp', defended: 'defended', lost: 'beltLost', stripped: 'beltLost' }[G.money.belt]]), 3, { tts: true, ttl: 9000 });
  else if (G.match.rival && G.money) say('pbp', pickLine(win ? 'grudgeWon' : 'grudgeLost', M4L[win ? 'grudgeWon' : 'grudgeLost']), 2, { tts: true, ttl: 8000 });
  if (!G.spectate) say('color', win ? pickOne(['Put that one in the highlight reel, Hank.', 'From a garage to the winners circle. I love this sport.', 'My circuits are still tingling.']) : pickOne(['Tough night. Every great bot has a few of these.', 'Back to the garage. Weld, learn, come back.', 'That is the circuit, Hank. Nobody stays on top forever.']), 1, { ttl: 8000 });
}
/* ---- gym drills: a rhythm game that earns training ranks ---- */
const DRILL_GAME = {
  head: { keys: { a: ['1', 'j'], b: ['2', 'k'] }, lab: { a: 'HEAD', b: 'BODY' }, kb: { a: '1', b: '2' }, mix: .7, hint: 'Calls slide in from the right. Press 1 for HEAD and 2 for BODY as each one crosses the line.' },
  body: { keys: { a: ['1', 'j'], b: ['2', 'k'] }, lab: { a: 'HEAD', b: 'BODY' }, kb: { a: '1', b: '2' }, mix: .3, hint: 'Press 1 for HEAD and 2 for BODY as each call crosses the line. This drill is mostly body work.' },
  guard: { keys: { a: [' ', 'g'] }, lab: { a: 'COVER' }, kb: { a: 'Space' }, mix: 1, speed: 1.25, hint: 'Punches come fast. Press Space to cover as each one crosses the line.' },
  hay: { keys: { a: [' ', 'h'] }, lab: { a: 'OPEN' }, kb: { a: 'Space' }, mix: 1, decoy: .35, decoyLab: 'GUARD UP', hint: 'Press Space to throw the haymaker only when the guard is OPEN. Leave GUARD UP alone.' },
  slip: { keys: { a: ['q', 'arrowleft', 'a'], b: ['e', 'arrowright', 'd'] }, lab: { a: '◀ SLIP', b: 'SLIP ▶' }, kb: { a: 'Q', b: 'E' }, mix: .5, hint: 'Q or ← slips left, E or → slips right. Match the arrow as it crosses the line.' },
  read: { keys: { a: [' '] }, lab: { a: 'REAL' }, kb: { a: 'Space' }, mix: 1, decoy: .4, decoyLab: 'FEINT', hint: 'Press Space to slip the REAL punches. Do nothing when you see a FEINT.' },
};
let DR = null, drRaf = 0, walkPrevT = 0;
const DR_LINE = 150, DR_PX = 330;
function openDrill(id) {
  const g = DRILL_GAME[id], d = DRILLS.find(x => x.id === id); if (!g || !d || (S.gym || 0) <= 0) return;
  const rank = S.training[id] || 0, gap = (.95 - rank * .08) / (g.speed || 1), cues = []; let at = 2.6;
  for (let i = 0; i < 16; i++) { const decoy = g.decoy && i > 1 && Math.random() < g.decoy, key = decoy ? null : (g.lab.b && Math.random() > g.mix ? 'b' : 'a'); cues.push({ at, key, lab: decoy ? g.decoyLab : g.lab[key], res: null }); at += gap * (.8 + Math.random() * .45); }
  DR = { id, g, d, rank, cues, t: -1.2, combo: 0, best: 0, strays: 0, fb: null, me: { st: 'idle', t0: 0, dur: 0, punch: null }, done: false, started: false, partner: BOT('mamafixit') };
  $('#drTitle').textContent = d.name + ' drill'; $('#drSub').textContent = `Gym · rank ${rank} → ${rank + 1} · pass with 70%`;
  $('#drMsg').innerHTML = `${g.hint} <b>Press Enter or tap Start.</b>`;
  $('#drPads').innerHTML = `<button class="btn primary" data-dstart>Start</button>`;
  $('#drillOv').hidden = false; cancelAnimationFrame(drRaf); DR.last = performance.now(); drRaf = requestAnimationFrame(drawDrill);
}
function drillPads() { const g = DR.g; $('#drPads').innerHTML = Object.keys(g.lab).map(k => `<button class="dpad2" data-dk="${k}"><kbd>${g.kb[k]}</kbd>${g.lab[k]}</button>`).join(''); }
function startDrill() { if (!DR || DR.started) return; DR.started = true; DR.t = -1.2; $('#drMsg').textContent = DR.g.hint; drillPads(); uiConfirm(); }
function closeDrill() { DR = null; cancelAnimationFrame(drRaf); $('#drillOv').hidden = true; if (curScreen === 'garage') renderGTab(); }
function drillPress(k) {
  if (!DR || !DR.started || DR.done) return; const t = DR.t;
  let best = null; for (const c of DR.cues) if (!c.res && Math.abs(c.at - t) < .25 && (!best || Math.abs(c.at - t) < Math.abs(best.at - t))) best = c;
  if (!best) { DR.strays++; DR.combo = 0; DR.fb = { txt: 'EARLY', col: '#ff8a7a', t }; uiClick(); return; }
  if (!best.key) { best.res = 'bad'; DR.combo = 0; DR.fb = { txt: best.lab === 'FEINT' ? 'BIT ON THE FEINT' : 'INTO THE GUARD', col: '#ff5a4a', t }; drillAnim('stagger'); thud(6, true, 'jab', 'head'); return; }
  if (best.key !== k) { best.res = 'miss'; DR.combo = 0; DR.fb = { txt: 'WRONG CALL', col: '#ff5a4a', t }; drillAnim('stagger'); thud(6, false, 'jab', 'body'); return; }
  const dt = Math.abs(best.at - t); best.res = dt < .08 ? 'perfect' : 'good'; DR.combo++; DR.best = Math.max(DR.best, DR.combo);
  DR.fb = { txt: best.res === 'perfect' ? 'PERFECT' : 'GOOD', col: best.res === 'perfect' ? '#6cf0a0' : '#f0b20a', t };
  const id = DR.id; if (id === 'slip' || id === 'read') drillAnim('slip'); else if (id === 'guard') { drillAnim('block'); thud(8, true, 'cross', 'head'); } else { drillAnim('strike', { kind: id === 'hay' ? 'hay' : best.key === 'b' ? 'hook' : 'cross', arm: 'rear', target: best.key === 'b' ? 'body' : 'head' }); thud(id === 'hay' ? 14 : 8, false, id === 'hay' ? 'hay' : 'cross', best.key === 'b' ? 'body' : 'head'); }
}
function drillAnim(st, punch) { DR.me = { st, t0: DR.t, dur: st === 'strike' ? .22 : st === 'stagger' ? .4 : .35, punch: punch || null }; }
function drillKey(e) {
  const k = e.key.toLowerCase(); e.preventDefault();
  if (k === 'escape') { closeDrill(); return; }
  if (!DR.started) { if (k === 'enter' || k === ' ') startDrill(); return; }
  if (DR.done) { if (k === 'enter' || k === ' ') closeDrill(); return; }
  if (e.repeat) return; for (const key in DR.g.keys) if (DR.g.keys[key].includes(k)) { drillPress(key); return; }
}
function finishDrill() {
  const D = DR, total = D.cues.length, sum = D.cues.reduce((a, c) => a + (c.res === 'perfect' || c.res === 'ok' ? 1 : c.res === 'good' ? .6 : 0), 0), pct = clamp((sum - D.strays * .25) / total, 0, 1), pass = pct >= .7;
  D.done = true; D.pct = pct; D.pass = pass; S.gym = Math.max(0, (S.gym || 0) - 1);
  if (pass) S.training[D.id] = Math.min(D.d.costs.length, D.rank + 1); if (pct >= .999) unlockTrophy('drill'); save();
  $('#drMsg').innerHTML = pass ? `<b class="ok">Passed, ${Math.round(pct * 100)}%.</b> ${D.d.name} is now rank ${D.rank + 1}: ${D.d.effect(D.rank)}.` : `<b class="bad">${Math.round(pct * 100)}%. Not this time.</b> You need 70%. The session is used; you get another after your next career fight.`;
  $('#drPads').innerHTML = `<button class="btn primary" data-dclose>Done</button>`; pass ? roar(.4) : uiError();
}
function drawDrill(ts) {
  if (!DR) return; const D = DR, cv = $('#drCv'), c = cv.getContext('2d'), now = performance.now(), dt = Math.min(.05, (now - D.last) / 1000); D.last = now;
  if (D.started && !D.done) { D.t += dt; for (const q of D.cues) if (!q.res && D.t > q.at + .25) { q.res = q.key ? 'miss' : 'ok'; if (q.key) { D.combo = 0; D.fb = { txt: 'MISS', col: '#ff5a4a', t: D.t }; drillAnim('stagger'); } } if (D.cues.every(q => q.res)) finishDrill(); }
  const t = ts / 1000; c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#121417'; c.fillRect(0, 0, 760, 300);
  const g = c.createRadialGradient(380, 210, 20, 380, 180, 380); g.addColorStop(0, '#2a2e33'); g.addColorStop(1, '#121417'); c.fillStyle = g; c.fillRect(0, 0, 760, 220);
  c.fillStyle = '#1b1e22'; c.fillRect(0, 200, 760, 20); c.strokeStyle = 'rgba(240,178,10,.25)'; c.beginPath(); c.moveTo(0, 200); c.lineTo(760, 200); c.stroke();
  // partner throws when a cue is near
  const next = D.cues.find(q => !q.res && q.at - D.t < .45 && q.at - D.t > -.05); let pst = 'idle', pp = 0, ppunch = null;
  if (next && D.started && !D.done) { pp = clamp(1 - (next.at - D.t) / .45, 0, 1); if (!next.key) { pst = D.id === 'hay' ? 'block' : 'feint'; } else if (D.id === 'hay' || D.id === 'head' || D.id === 'body') { pst = 'idle'; } else { pst = 'windup'; ppunch = { kind: D.id === 'slip' ? 'hook' : 'cross', arm: 'rear', target: 'head' }; } }
  if (D.id === 'hay' && next && next.key && pp > 0) { pst = 'stagger'; pp = .3; }
  const P = playerSpec(), me = D.me, mp = me.dur ? clamp((D.t - me.t0) / me.dur, 0, 1) : 0, mst = me.dur && mp < 1 ? me.st : 'idle';
  drawRobot(c, { st: mst, build: P.build, paint: P.paint, accent: P.accent, decal: P.decal, num: P.num, wear: P.wear, wseed: 4242, workbookCombat: P.workbookCombat, x: 320, ground: 204, dir: 1, scale: .78, pose: poseFrom(mst, mp, me.punch, t, 0, 0), t });
  const Q = D.partner; drawRobot(c, { st: pst, build: Q.build, paint: Q.paint, accent: Q.accent, decal: Q.decal, num: Q.num, wear: Q.wear, wseed: Q.wseed, x: 450, ground: 204, dir: -1, scale: .78, pose: poseFrom(pst, pp, ppunch, t, 0, 1), t });
  // track
  c.fillStyle = '#0b0c0e'; c.fillRect(0, 226, 760, 64); c.fillStyle = 'rgba(240,178,10,.14)'; c.fillRect(DR_LINE - 22, 226, 44, 64); c.fillStyle = '#f0b20a'; c.fillRect(DR_LINE - 1.5, 222, 3, 72);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (const q of D.cues) { const x = DR_LINE + (q.at - D.t) * DR_PX; if (x < -60 || x > 820) continue; if (q.res && q.res !== 'miss' && q.res !== 'bad') continue;
    const col = !q.key ? '#5a5f66' : q.key === 'a' ? '#c7362f' : '#2a72a8'; c.globalAlpha = q.res ? .35 : 1; c.fillStyle = col; c.fillRect(x - 38, 238, 76, 40); if (!q.key) { c.strokeStyle = '#9aa0a6'; c.setLineDash([4, 3]); c.strokeRect(x - 38, 238, 76, 40); c.setLineDash([]); }
    c.fillStyle = '#fff'; c.font = '600 20px Teko, sans-serif'; c.fillText(q.lab, x, 259); c.globalAlpha = 1; }
  c.textAlign = 'left'; c.font = '500 12px "IBM Plex Mono", monospace'; c.fillStyle = '#8f969d';
  const done = D.cues.filter(q => q.res).length; c.fillText(`${done}/${D.cues.length}`, 14, 18); c.textAlign = 'right'; c.fillText(`COMBO ${D.combo}`, 746, 18); c.textAlign = 'center';
  if (D.fb && D.t - D.fb.t < .6) { c.globalAlpha = 1 - (D.t - D.fb.t) / .6; c.fillStyle = D.fb.col; c.font = '600 34px Teko, sans-serif'; c.fillText(D.fb.txt, 380, 60 - (D.t - D.fb.t) * 30); c.globalAlpha = 1; }
  if (D.started && D.t < 0) { c.fillStyle = '#ebe7de'; c.font = '600 64px Teko, sans-serif'; c.fillText(String(Math.ceil(-D.t / .4) || 'GO'), 380, 110); }
  if (D.done) { c.fillStyle = 'rgba(8,9,11,.7)'; c.fillRect(0, 0, 760, 220); c.fillStyle = D.pass ? '#6cf0a0' : '#ff8a7a'; c.font = '600 72px Teko, sans-serif'; c.fillText(Math.round(D.pct * 100) + '%', 380, 100); c.font = '600 28px Teko, sans-serif'; c.fillStyle = '#ebe7de'; c.fillText(D.pass ? 'RANK UP' : 'NEED 70%', 380, 150); }
  c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  drRaf = requestAnimationFrame(drawDrill);
}
$('#drillOv').addEventListener('click', e => { if (e.target.closest('#drClose') || e.target.closest('[data-dclose]')) { closeDrill(); return; } if (e.target.closest('[data-dstart]')) { startDrill(); return; } });
$('#drillOv').addEventListener('pointerdown', e => { const b = e.target.closest('[data-dk]'); if (b) { e.preventDefault(); drillPress(b.dataset.dk); } });
/* ---- fight poster ---- */
function savePoster() {
  const F = G.F, dq = G.money && G.money.dq, wi = dq ? 1 : F.winner, W2 = F.f[wi], L = F.f[1 - wi], c0 = document.createElement('canvas'); c0.width = 1080; c0.height = 1350; const c = c0.getContext('2d');
  c.fillStyle = '#0b0c0e'; c.fillRect(0, 0, 1080, 1350);
  const wcol = wi === 0 ? '#c7362f' : '#2a72a8', lcol = wi === 0 ? '#2a72a8' : '#c7362f';
  c.globalCompositeOperation = 'screen'; c.globalAlpha = .75; splatter(c, 380, 760, 520, wcol, 77); splatter(c, 860, 620, 330, lcol, 78); softDot(c, 540, 200, 420, '#f0b20a', .12); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 3; i++) { const g = c.createLinearGradient(0, 0, 0, 1100); g.addColorStop(0, 'rgba(255,240,210,.16)'); g.addColorStop(1, 'rgba(255,240,210,0)'); c.fillStyle = g; c.beginPath(); const x = 220 + i * 320; c.moveTo(x - 20, 0); c.lineTo(x + 20, 0); c.lineTo(x + 240, 1100); c.lineTo(x - 240, 1100); c.fill(); }
  const sp = f => f.spec, t = 1.2;
  c.save(); c.globalAlpha = .55; if ('filter' in c) c.filter = 'brightness(.55)'; drawRobot(c, { st: 'slump', build: sp(L).build, paint: sp(L).paint, accent: sp(L).accent, decal: sp(L).decal, num: sp(L).num, wear: sp(L).wear, wseed: sp(L).wseed || 4242, workbookCombat: sp(L).workbookCombat, x: 820, ground: 1060, dir: -1, scale: 2.1, pose: poseFrom('slump', 0, null, t, 0, 1), t }); c.restore();
  drawRobot(c, { st: 'victory', build: sp(W2).build, paint: sp(W2).paint, accent: sp(W2).accent, decal: sp(W2).decal, num: sp(W2).num, tally: sp(W2).tally, wear: sp(W2).wear, wseed: sp(W2).wseed || 4242, workbookCombat: sp(W2).workbookCombat, x: 400, ground: 1120, dir: 1, scale: 3, pose: poseFrom('victory', 0, null, t, 0, 0), t });
  const fg = c.createLinearGradient(0, 860, 0, 1350); fg.addColorStop(0, 'rgba(11,12,14,0)'); fg.addColorStop(.45, 'rgba(11,12,14,.92)'); fg.addColorStop(1, '#0b0c0e'); c.fillStyle = fg; c.fillRect(0, 860, 1080, 490);
  c.fillStyle = '#f0b20a'; for (let x = -40; x < 1120; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 20, 0); c.lineTo(x + 40, 24); c.lineTo(x + 20, 24); c.fill(); }
  c.textAlign = 'left'; c.fillStyle = '#ebe7de'; c.font = '600 44px Teko, sans-serif'; c.fillText('SCRAPYARD', 60, 92); c.fillStyle = '#f0b20a'; c.fillText('CIRCUIT', 60 + c.measureText('SCRAPYARD ').width, 92);
  c.fillStyle = '#8f969d'; c.font = '500 22px "IBM Plex Mono", monospace'; c.fillText(`FIGHT NIGHT · ${VENUES[curVenue].name.toUpperCase()}`, 60, 128);
  const bt = G.match.bout; if (bt && G.money && G.money.belt) { c.fillStyle = '#f0b20a'; c.font = '600 40px Teko, sans-serif'; c.textAlign = 'right'; c.fillText('🏆 ' + BELTS[bt.lg].toUpperCase(), 1020, 92); c.textAlign = 'left'; }
  const big = (txt, y, size, col, stroke) => { c.font = `600 ${size}px Teko, sans-serif`; let sz = size; while (c.measureText(txt).width > 960 && sz > 40) { sz -= 6; c.font = `600 ${sz}px Teko, sans-serif`; } if (stroke) { c.lineWidth = 4; c.strokeStyle = col; c.strokeText(txt, 60, y); } else { c.fillStyle = col; c.fillText(txt, 60, y); } };
  big(sp(W2).name.toUpperCase(), 1060, 190, '#ebe7de');
  c.fillStyle = '#f0b20a'; c.font = '600 56px Teko, sans-serif'; c.fillText('DEF.', 60, 1130); const dw = c.measureText('DEF.  ').width; c.fillStyle = '#8fc6ef'; c.fillText(sp(L).name.toUpperCase(), 60 + dw, 1130);
  c.fillStyle = '#ebe7de'; c.font = '500 30px "IBM Plex Mono", monospace';
  const how = dq ? 'DISQUALIFICATION' : F.reason === 'Decision' ? `DECISION · ${F.detail}` : `${F.reason} · ROUND ${F.round}`; c.fillText(how, 60, 1190);
  c.fillStyle = '#8f969d'; c.font = '500 24px "IBM Plex Mono", monospace';
  c.fillText(`LANDED ${W2.cnt.landed}/${W2.cnt.thrown} · KNOCKDOWNS ${W2.cnt.kd} · OVR ${ovrOf(sp(W2))}`, 60, 1236);
  c.fillText(`${sp(W2).id === 'you' ? 'RECORD ' + S.rec.w + '–' + S.rec.l : sp(W2).rec ? 'RECORD ' + sp(W2).rec : ''}`, 60, 1274);
  c.fillStyle = '#c7362f'; c.fillRect(0, 1320, 1080, 30); c.fillStyle = '#ebe7de'; c.font = '600 22px Teko, sans-serif'; c.fillText('BUILD IT · FIGHT IT · SCRAP IT', 60, 1342);
  try { const a = document.createElement('a'); a.href = c0.toDataURL('image/png'); a.download = `${sp(W2).name}-def-${sp(L).name}.png`.replace(/\s+/g, '-').toLowerCase(); document.body.appendChild(a); a.click(); a.remove(); toast('Poster saved.', 'good'); } catch (err) { toast('Could not save the poster.'); }
  G.lastPoster = c0;
}
/* ---- instant replay ---- */
function recordFrame(F) {
  if (!G.rec) G.rec = []; if (!['fight', 'count', 'finisher'].includes(F.phase)) return;
  const last = G.rec[G.rec.length - 1]; if (last && last.t === F.t) return;
  G.rec.push({ t: F.t, f: F.f.map(f => ({ x: f.x, z: f.z, dir: f.dir, st: f.st, stT: f.stT, dur: f.dur, punch: f.punch ? { ...f.punch } : null, walk: f.walk })) });
  while (G.rec.length && G.rec[0].t < F.t - 4) G.rec.shift();
}
function startReplay(kind) {
  const F = G.F, rec = (G.rec || []).slice(); if (rec.length < 30) return;
  const tEnd = rec[rec.length - 1].t, t0 = Math.max(rec[0].t, tEnd - 2.4);
  G.replay = { kind, rec, t0, tEnd, t: t0, hits: (G.recHits || []).filter(h => h.t >= t0 && h.t <= tEnd), save: F.f.map(f => ({ x: f.x, z: f.z, dir: f.dir, st: f.st, stT: f.stT, dur: f.dur, punch: f.punch, walk: f.walk })) };
  $('#replayTag').hidden = false; $('#stage').classList.add('replaying'); whoosh(.8);
}
function stepReplay(dt) {
  const R = G.replay, F = G.F; R.t += dt * .42;
  let fr = R.rec[0]; for (const r of R.rec) { if (r.t > R.t) break; fr = r; }
  F.f.forEach((f, i) => Object.assign(f, fr.f[i]));
  for (const h of R.hits) if (!h.done && h.t <= R.t) { h.done = true; const d = F.f[1 - h.side], a = F.f[h.side], an = anchors(d.spec.build); sparks(d.x - a.dir * an.half, groundFor(d) + (h.head ? an.headY : an.bodyY), a.dir, h.big ? 18 : 8, true); G.flash[d.side] = 1; thud(h.big ? 16 : 8, false, h.big ? 'hay' : 'cross', h.head ? 'head' : 'body'); if (S.opt.shake && h.big) G.shake = 10; }
  for (const p of G.fx) { p.life -= dt; p.x += p.vx * dt * .5; p.y += p.vy * dt * .5; if (p.type === 'spark') p.vy += 450 * dt; } G.fx = G.fx.filter(p => p.life > 0);
  G.flash = G.flash.map(v => Math.max(0, v - dt * 2)); G.shake *= Math.pow(.01, dt);
  if (R.t >= R.tEnd) endReplay();
}
function endReplay() {
  const R = G && G.replay; if (!R) return; G.replay = null; G.F.f.forEach((f, i) => Object.assign(f, R.save[i]));
  $('#replayTag').hidden = true; $('#stage').classList.remove('replaying'); G.last = performance.now();
}
/* ---- enter / leave ---- */
function sizeArena() {
  const st = $('#stage'), cw = st.clientWidth || 960, ch = st.clientHeight || 480;
  const w = Math.max(240, Math.min(cw, ch * 2)), h = w / 2, dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.style.width = w + 'px'; cv.style.height = h + 'px'; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); aScale = cv.width / W;
}
function enterArena(match) {
  if (match.career && !match.spectate && match.a?.workbookCombat) {
    const venue = resolveVenue(match), legality = workbookVenueLegality(venue, match.a.workbookCombat);
    if (legality.rule?.illegalParts === 'Banned' && legality.illegalParts.length) { toast(`${legality.rule.venue} bans illegal equipment. Replace: ${legality.illegalParts.join(', ')}.`, 'bad'); return false; }
  }
  initAudio(); showScreen('arena'); requestAnimationFrame(() => sizeArena()); sizeArena();
  newGame(match); startLoop();
}
function leaveArena() {
  const g = G;
  if (g && g.match?.runEncounter && !g.settled) { if (g.F.phase === 'finisher' || g.F.phase === 'done') settle(); else settleWorkbookRunEncounter(true); }
  else if (g && !g.settled && g.career && !g.spectate) { if (['fight', 'count', 'break'].includes(g.F.phase) && !g.intro) { g.settled = true; settleForfeit(); } else if (g.F.phase === 'finisher' || g.F.phase === 'done') settle(); }
  G = null; shutUp(); ringing(false); setMuffle(0); chant = null; closeModal();
  if (g && g.spectate) showScreen(g.match.from || 'exhibition'); else if (g && g.career) showScreen('career'); else showScreen(g && g.match.from || 'menu');
}
function settleForfeit() { afterCareerFight(G.F.f[0], G.op, false, 'Forfeit', null, G.match.bout); S.rec.l++; S.history.push({ opp: G.op.id, win: false, how: 'Forfeit', round: G.F.round, venue: curVenue, net: 0 }); save(); }
let vsRaf = 0, vsOpen = false;
const VS = { mode: 'career', a: 'you', b: 'foreman', v: 'auto', rounds: 3, len: 45, A: null, B: null };
const vsSpecOf = id => id === 'you' ? playerSpec() : { ...BOT(id) };
function vsSpec() { return VS.B || { ...BOT(S.opp) }; }
function openVersus(mode, opts) {
  const prevMode = VS.mode; VS.mode = mode; if (mode === 'career') VS.a = 'you'; else if (mode === 'quick' && (!VS.a || prevMode !== 'quick')) VS.a = 'you'; if (mode === 'career') VS.b = S.opp; else if (!VS.b || VS.b === 'you' && mode === 'quick') VS.b = S.opp;
  Object.assign(VS, opts || {}); showScreen('versus');
}
function vsPool(side) {
  if (VS.mode === 'career') return side ? ROSTER.filter(b => botOpen(b.id)).map(b => b.id) : ['you'];
  if (VS.mode === 'quick') return side ? ROSTER.map(b => b.id) : ['you', ...ROSTER.map(b => b.id)];
  return ['you', ...ROSTER.map(b => b.id)];
}
const isFree = () => VS.mode === 'exh' || VS.mode === 'duo';
function vsCycle(side, d) {
  const pool = vsPool(side), key = side ? 'b' : 'a', other = side ? VS.a : VS.b; if (pool.length < 2) return;
  let i = pool.indexOf(VS[key]); for (let n = 0; n < pool.length; n++) { i = (i + d + pool.length) % pool.length; if (pool[i] !== other || pool.length < 3) break; }
  VS[key] = pool[i]; if (VS.mode === 'career') { S.opp = VS.b; save(); } uiClick(); renderVersus();
}
const VS_VENUES = () => ['auto', ...Object.keys(VENUES)];
function vsSet(k, d) {
  const car = VS.mode === 'career';
  if (k === 'v') { const L = VS_VENUES(), cur = car ? S.venue : VS.v; const nv = L[(L.indexOf(cur) + d + L.length) % L.length]; if (car) { S.venue = nv; save(); } else VS.v = nv; }
  if (k === 'r') { if (car && boutKind(S.opp)) return; const nv = (car ? S.rounds : VS.rounds) === 3 ? 5 : 3; if (car) { S.rounds = nv; save(); } else VS.rounds = nv; }
  if (k === 'l') { const L = [30, 45, 60], cur = car ? S.len : VS.len, nv = L[(L.indexOf(cur) + d + L.length) % L.length]; if (car) { S.len = nv; save(); } else VS.len = nv; }
  uiClick(); renderVersus();
}
const vsQuickOk = () => canFight();
function vsGo(alt) {
  const car = VS.mode === 'career', base = { rounds: VS.rounds, len: VS.len, venue: VS.v, from: 'versus' };
  if (car) { if (canFight()) startCareerFight(); else showScreen(repairBlocksFight() ? 'career' : 'garage'); return; }
  if (VS.mode === 'duo') { enterArena({ ...base, a: vsSpecOf(VS.a), b: vsSpecOf(VS.b), spectate: false, career: false, duo: true }); return; }
  const watch = VS.mode === 'exh' ? !alt : !!alt;
  if (watch) { enterArena({ ...base, a: vsSpecOf(VS.a), b: vsSpecOf(VS.b), spectate: true }); return; }
  if (VS.mode === 'quick' && VS.a !== 'you') { enterArena({ ...base, a: vsSpecOf(VS.a), b: vsSpecOf(VS.b), spectate: false, career: false }); return; }
  if (VS.a !== 'you') { toast('Put your bot in the red corner to fight it yourself.'); return; }
  if (!vsQuickOk()) { toast(repairBlocksFight() ? 'Your bot needs a core or part repair before it can fight.' : 'Your bot is over its load limit. Fix it in the Garage.'); return; }
  enterArena({ ...base, a: playerSpec(), b: vsSpecOf(VS.b), spectate: false, career: false });
}
function vsBack() { showScreen(VS.mode === 'career' ? 'career' : 'menu'); }
function vsSide(spec, side) {
  const nm = spec.name.split(' '), last = nm.length > 1 ? nm.pop() : nm[0], first = nm.length && spec.name.includes(' ') ? nm.join(' ') : (spec.nick || (side ? 'The challenger' : 'The underdog'));
  const st = statsOf(spec.build, spec.trait, spec.partWear || null), rec = spec.id === 'you' ? `${S.rec.w}–${S.rec.l}` : spec.rec;
  return `<small>${weightClass(spec)}</small><span class="first">${esc(first)}</span><span class="last" style="font-size:min(8.5vw, ${(40 / Math.max(4, last.length * .6)).toFixed(2)}vw, 120px)">${esc(last)}</span><span class="line">HT ${heightOf(spec)} m · WT ${Math.round(st.total)} kg · RCH ${Math.round(st.reach)} · ${rec}</span><span class="ovr">${side ? '<span>OVR</span><b>' + ovrOf(spec) + '</b>' : '<b>' + ovrOf(spec) + '</b><span>OVR</span>'}</span>${spec.signature ? `<span class="sig">${esc(spec.signature.name)} · ${spec.signature.tell}</span>` : ''}`;
}
function renderVersus() {
  makeGrain(); const car = VS.mode === 'career'; if (car) { VS.a = 'you'; if (!botOpen(S.opp)) S.opp = (nextBot() || ROSTER[0]).id; VS.b = S.opp; }
  const A = VS.A = vsSpecOf(VS.a), B = VS.B = vsSpecOf(VS.b), vset = car ? S.venue : VS.v, v = vset !== 'auto' && VENUES[vset] ? vset : (B.venue || LEAGUE_VENUE[B.lg] || 'lot');
  const o = car ? BOT(S.opp) : null, bk = car ? boutKind(o.id) : null, rv = car ? rivalOf(o.id) : null, hh = car ? h2hOf(o.id) : [0, 0], rounds = bk ? 5 : car ? S.rounds : VS.rounds, len = car ? S.len : VS.len;
  const pick = side => { const n = vsPool(side).length; return n > 1 ? `<div class="vspick"><button data-cyc="${side},-1" aria-label="Previous fighter">‹</button><span>${side ? (car ? 'Opponent' : VS.mode === 'duo' ? 'P2 · blue' : 'Blue corner') + ' · ← →' : (VS.mode === 'duo' ? 'P1 · red' : 'Red corner') + ' · Q E'}</span><button data-cyc="${side},1" aria-label="Next fighter">›</button></div>` : `<div class="vspick fixed"><span>${side ? 'Blue corner' : 'Your bot'}</span></div>`; };
  $('#vsA').innerHTML = pick(0) + vsSide(A, 0); $('#vsB').innerHTML = pick(1) + vsSide(B, 1); $('#vsVenue').textContent = `${VENUES[v].name} · ${rounds} rounds`;
  $('#vsMode').innerHTML = car ? `<small>Career · ${LEAGUES[o.lg].name}</small><b>Next fight</b>` : VS.mode === 'duo' ? '<small>P1 red · P2 blue</small><b>Local versus</b>' : VS.mode === 'quick' ? '<small>No purse · no record</small><b>Fight now</b>' : '<small>Pick two bots and watch</small><b>Exhibition</b>';
  const chip = (k, key, label, val, locked) => `<div class="vchip${locked ? ' locked' : ''}"><small>${label} <kbd>${key}</kbd></small><div><button data-vset="${k},-1" ${locked ? 'disabled' : ''} aria-label="Previous ${label}">‹</button><b>${val}</b><button data-vset="${k},1" ${locked ? 'disabled' : ''} aria-label="Next ${label}">›</button></div></div>`;
  $('#vsOpts').innerHTML = chip('v', 'V', 'Venue', vset === 'auto' ? 'Auto · ' + VENUES[v].name : VENUES[v].name) + chip('r', 'B', 'Rounds', rounds + (bk ? ' · title' : ''), !!bk) + chip('l', 'N', 'Length', len + ' s');
  const H = (a, k, l) => `<button class="hint" data-vs="${a}"><kbd>${k}</kbd> ${l}</button>`;
  $('#vsHints').innerHTML = H('help', 'F1', 'Help') + (car ? H('go', 'Enter', canFight() ? 'Fight' : repairBlocksFight() ? 'Repair first' : 'Garage') : VS.mode === 'duo' ? H('go', 'Enter', 'Fight') : VS.mode === 'quick' ? H('go', 'Enter', 'Fight') + H('alt', 'W', 'Watch') : H('go', 'Enter', 'Watch') + (VS.a === 'you' ? H('alt', 'F', 'Fight it') : '')) + H('back', 'Esc', 'Back') + H('rand', 'R', 'Random') + H('ratings', 'Tab', 'Ratings');
  const bd = $('#vsBadge'); bd.hidden = !(bk || rv); bd.className = 'vsbadge' + (bk ? ' title' : ' grudge'); bd.innerHTML = bk ? `<b>${bk.kind === 'title' ? 'Title fight' : 'Title defence'}</b><span>${BELTS[bk.lg]}</span>` : rv ? `<b>Grudge match</b><span>Head to head ${hh[0]}–${hh[1]} · ${'🔥'.repeat(rv.heat)}</span>` : '';
  const hurt = car ? dmgAvg() : 0; if (hurt > .02) $('#vsA').insertAdjacentHTML('beforeend', `<span class="hurt">Fighting hurt · ${Math.round((1 - hurt) * 100)}% condition</span>`);
  if (VS.a === 'you' && sponsorOf()) { const x = sponsorOf(); $('#vsA').insertAdjacentHTML('beforeend', `<span class="vspon">Presented by <span class="sptag" style="--sc:${x.col}">${x.tag}</span></span>`); }
  if (car) { const cd = wcIx(B) - wcIx(A); if (cd) $('#vsB').insertAdjacentHTML('beforeend', `<span class="hurt">${cd > 0 ? `Heavier class · +${25 * cd}% purse` : `Lighter class · −${15 * -cd}% purse`}</span>`); }
  if (VS.a === 'you' && Object.keys(S.belts).length) $('#vsA > small').insertAdjacentHTML('beforeend', ' · 🏆 Champion');
  $('#vsRatings').hidden = true; fillTicker($('#tkVs')); requestAnimationFrame(fitVsNames);
  const cv = $('#vsCanvas'); sizeCanvas(cv, cv.clientWidth || 960, cv.clientHeight || 540); cancelAnimationFrame(vsRaf); vsRaf = requestAnimationFrame(drawVersus);
}
function fitVsNames() {
  document.querySelectorAll('#scrVersus .last').forEach(el => { const w = el.parentElement.clientWidth; if (!w) return; let fs = parseFloat(getComputedStyle(el).fontSize); el.style.fontSize = fs + 'px'; while (el.scrollWidth > w && fs > 20) { fs -= 2; el.style.fontSize = fs + 'px'; } });
}
addEventListener('resize', () => { if (curScreen === 'career') startHub(); if (curScreen === 'versus') { document.querySelectorAll('#scrVersus .last').forEach(el => el.style.fontSize = ''); fitVsNames(); } });
let vsSplat = null;
function drawVersus(ts) {
  const cv = $('#vsCanvas'), c = cv.getContext('2d'), t = ts / 1000, cw = cv.width, ch = cv.height; if (!cw) return;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0b0c0e'; c.fillRect(0, 0, cw, ch);
  if (!vsSplat) { vsSplat = document.createElement('canvas'); vsSplat.width = 1200; vsSplat.height = 700; const x = vsSplat.getContext('2d'); splatter(x, 330, 380, 330, '#c7362f', 3); splatter(x, 870, 380, 330, '#2a72a8', 5); softDot(x, 600, 90, 260, '#ebe7de', .16); }
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .55; c.drawImage(vsSplat, 0, 0, cw, ch); c.restore();
  for (const [x0, ph] of [[.18, 0], [.5, 1.3], [.82, 2.1]]) { const gx = cw * x0 + Math.sin(t * .6 + ph) * cw * .03, g = c.createRadialGradient(gx, -ch * .05, 4, gx, -ch * .05, ch * .5); g.addColorStop(0, 'rgba(255,245,220,.35)'); g.addColorStop(1, 'rgba(255,245,220,0)'); c.fillStyle = g; c.fillRect(0, 0, cw, ch * .6); }
  const A = VS.A || playerSpec(), B = vsSpec(), port = ch > cw * 1.2, scale = port ? Math.min(ch / 520, cw / 330) : Math.min(ch / 300, cw / 760), gy = port ? ch * .52 : ch * .92;
  for (const [spec, x, dir, i] of [[A, cw * (port ? .3 : .36), 1, 0], [B, cw * (port ? .7 : .64), -1, 1]]) {
    const ps = { st: 'idle' }; drawRobot(c, { st: ps.st, build: spec.build, paint: spec.paint, accent: spec.accent, decal: spec.decal, num: spec.num, tally: spec.tally, wear: spec.wear, wseed: spec.wseed || 4242, workbookCombat: spec.workbookCombat, x, ground: gy, dir, scale, pose: poseFrom('idle', 0, null, t + i, 0, i), t });
  }
  const sh = c.createLinearGradient(0, ch * .45, 0, ch); sh.addColorStop(0, 'rgba(8,9,11,0)'); sh.addColorStop(1, 'rgba(8,9,11,.82)'); c.fillStyle = sh; c.fillRect(0, ch * .45, cw, ch * .55);
  vsRaf = requestAnimationFrame(drawVersus);
}
function vsRatings() {
  const el = $('#vsRatings'); if (!el.hidden) { el.hidden = true; return; }
  const A = VS.A || playerSpec(), B = vsSpec(), sa = statsOf(A.build, A.trait, A.partWear || null), sb = statsOf(B.build, B.trait);
  const rows = [['Power', 'power', 1], ['Hand speed', 'aspd', 2], ['Reach', 'reach', 0], ['Armor', 'armor', 0], ['Hull', 'hp', 0], ['Sensors', 'sense', 2], ['Footwork', 'move', 2], ['Balance', 'balance', 2], ['Battery', 'en', 0], ['Regen', 'regen', 0], ['Reliability', 'durability', 2]];
  el.innerHTML = `<h3>Bot ratings</h3>` + rows.map(([l, k, d]) => { const [lo, hi] = RANGE[k] || [0, 1], fa = clamp((sa[k] - lo) / ((hi - lo) || 1), .04, 1), fb = clamp((sb[k] - lo) / ((hi - lo) || 1), .04, 1); return `<div class="vrow"><b>${(+sa[k]).toFixed(d)}</b><span class="l"><i style="width:${fa * 100}%"></i></span><span>${l}</span><span class="r"><i style="width:${fb * 100}%"></i></span><b>${(+sb[k]).toFixed(d)}</b></div>`; }).join('') + `<p class="note">Press Tab or Bot ratings again to close.</p>`;
  el.hidden = false;
}
function vsRandom() {
  const pick = (side, not) => { const L = vsPool(side).filter(id => id !== not); return L.length ? L[Math.random() * L.length | 0] : null; };
  if (isFree()) { VS.a = pick(0, null); VS.b = pick(1, VS.a); } else { const nb = pick(1, VS.b); if (!nb) return; VS.b = nb; if (VS.mode === 'career') { S.opp = nb; save(); } }
  renderVersus(); uiConfirm();
}
$('#scrVersus').addEventListener('click', e => { const cy = e.target.closest('[data-cyc]'); if (cy) { const [sd, d] = cy.dataset.cyc.split(','); vsCycle(+sd, +d); return; } const vs = e.target.closest('[data-vset]'); if (vs && !vs.disabled) { const [k, d] = vs.dataset.vset.split(','); vsSet(k, +d); return; } const h = e.target.closest('[data-vs]'); if (!h) return; const a = h.dataset.vs; if (a === 'go') vsGo(false); else if (a === 'alt') vsGo(true); else if (a === 'back') vsBack(); else if (a === 'rand') vsRandom(); else if (a === 'ratings') vsRatings(); else if (a === 'help') showScreen('help'); });
function startCareerFight() { enterArena({ a: playerSpec(), b: { ...BOT(S.opp) }, spectate: false, career: true, venue: S.venue, from: 'career' }); }
cv.addEventListener('pointerdown', e => { if (!G) return; if (G.intro) { if (G.intro.t > .4) skipIntro(); return; } if (G.dial) { e.preventDefault(); pressReboot(); } });
$('#skipBtn').addEventListener('click', skipIntro);
$('#pauseBtn').addEventListener('click', () => { if (G) pauseGame(!G.paused); });
$('#ctrlBtn').addEventListener('click', () => { if (G) setControl(G.F.controlMode === 'pilot' ? 'coach' : 'pilot'); });
const KEY_ACTIONS = [['left', 'Move left', 'a'], ['right', 'Move right', 'd'], ['far', 'Step back (lane)', 'w'], ['near', 'Step forward (lane)', 's'], ['guard', 'Guard (hold)', 'shift'], ['jab', 'Jab', 'j'], ['cross', 'Cross', 'k'], ['hook', 'Hook', 'l'], ['upper', 'Uppercut', 'i'], ['slipFar', 'Slip up', 'q'], ['slipNear', 'Slip down', 'e'], ['sig', 'Signature', 'f'], ['clinch', 'Clinch', 'x'], ['cHead', 'Coach: head hunt', '1'], ['cBody', 'Coach: body work', '2'], ['cGuard', 'Coach: cover up', '3'], ['cHay', 'Coach: haymaker', '4']];
let KB = {};
function rebuildKeys() { KB = { arrowleft: 'left', arrowright: 'right', arrowup: 'far', arrowdown: 'near' }; const o = (S.opt && S.opt.keys) || {}; for (const [act, , def] of KEY_ACTIONS) KB[o[act] || def] = act; }
const keyName = k => ({ ' ': 'Space', shift: 'Shift', arrowleft: '←', arrowright: '→', arrowup: '↑', arrowdown: '↓' }[k] || k.toUpperCase());
const KEYMOVE = { a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right', w: 'far', arrowup: 'far', s: 'near', arrowdown: 'near', shift: 'guard' };
const DUO_KEYS = [
  { KeyW: 'far', KeyS: 'near', KeyA: 'left', KeyD: 'right', ShiftLeft: 'guard', KeyF: 'jab', KeyG: 'cross', KeyH: 'hook', KeyT: 'upper', KeyQ: 'slipFar', KeyE: 'slipNear', KeyR: 'sig' },
  { ArrowUp: 'far', ArrowDown: 'near', ArrowLeft: 'left', ArrowRight: 'right', ShiftRight: 'guard', Numpad0: 'guard', Numpad1: 'jab', KeyK: 'jab', Numpad2: 'cross', KeyL: 'cross', Numpad3: 'hook', Semicolon: 'hook', Numpad5: 'upper', KeyO: 'upper', Numpad4: 'slipFar', KeyI: 'slipFar', Numpad6: 'slipNear', KeyP: 'slipNear', Enter: 'sig', NumpadEnter: 'sig' },
];
const HOLDS = new Set(['far', 'near', 'left', 'right', 'guard']);
function duoKey(e, down) {
  for (const side of [0, 1]) { const a = DUO_KEYS[side][e.code]; if (!a) continue;
    if (HOLDS.has(a)) { const set = side ? G.held2 : G.held; if (down) set.add(a); else set.delete(a); return true; }
    if (down && !e.repeat) issue(G.F, side, a); return true; }
  return false;
}
function arenaKey(e, down) {
  if (!G) return false; const F = G.F, k = e.key.toLowerCase();
  if (!down) { if (G.F.duo) { duoKey(e, false); return false; } const ha = KB[k]; if (HOLDS.has(ha)) setHeld(ha, false); return false; }
  if (G.F.duo && !G.paused && !G.intro && !G.replay && duoKey(e, down)) return true;
  if (k === 'escape' || (k === 'p' && !G.F.duo)) { if (G.intro) skipIntro(); else if (G.modal === 'pause' || !G.modal) pauseGame(!G.paused); return true; }
  if (G.paused) return false;
  if (G.replay) { if (k === ' ' || k === 'enter') { endReplay(); return true; } return false; }
  if (G.intro) { if (k === ' ' || k === 'enter') { skipIntro(); return true; } return false; }
  if (G.modal === 'corner' && k === 'enter') { ringBell(); return true; }
  if (G.spectate) return false;
  if (k === ' ' || k === 'r') { if (pressReboot()) return true; }
  if (F.phase === 'finisher') { if (k === 'd') { chooseFinish(F, 0, 'destroy'); return true; } if (k === 's') { chooseFinish(F, 0, 'spare'); return true; } }
  if (k === 'c' && F.phase !== 'done') { setControl(F.controlMode === 'pilot' ? 'coach' : 'pilot'); return true; }
  const act = KB[k], cmd = { cHead: 'head', cBody: 'body', cGuard: 'guard', cHay: 'hay' }[act]; if (cmd) { issue(F, 0, cmd); return true; }
  if (F.controlMode === 'pilot' && act) {
    if (HOLDS.has(act)) { setHeld(act, true); return true; }
    if (e.repeat) return true;
    if (act === 'clinch') { F.f[0].clinchReq = true; return true; }
    issue(F, 0, act); return true;
  }
  return false;
}

/* Development-only booth harness. It reads the current fight for context but never adds combat events or advances the simulation. */
function initCommentaryDebug() {
  const local = /^(localhost|127(?:\.\d{1,3}){3}|::1)$/.test(location.hostname);
  if (!local || new URLSearchParams(location.search).get('commentaryDebug') !== '1') return;
  const options = [['bigHead', 'Clean hit'], ['combo', 'Combination'], ['crit', 'Critical hit'], ['hay', 'Haymaker'], ['malf', 'Overheating'], ['offline', 'Component offline'], ['down', 'Knockdown'], ['kneel', 'Attempt to rise'], ['rise', 'Recovery'], ['secondwind', 'Second wind'], ['round', 'Round transition'], ['final', 'Final round'], ['ko', 'Knockout'], ['tko', 'Technical knockout'], ['destroy', 'Mechanical finish']];
  const panel = document.createElement('aside'); panel.id = 'commentaryDebug';
  panel.style.cssText = 'position:fixed;z-index:100;left:10px;bottom:10px;max-width:min(360px,94vw);padding:10px;background:#101316ee;border:1px solid #4a535d;border-radius:8px;color:#ebe7de;font:12px system-ui;box-shadow:0 8px 30px #0009';
  panel.innerHTML = `<b style="color:#f0b20a">Commentary test · local only</b><div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap"><select id="commentaryDebugEvent">${options.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select><button data-debug="event">Play event</button><button data-debug="count">Count</button><button data-debug="burst">Burst</button><button data-debug="missing">Missing clip</button><button data-debug="reset">Reset audio</button></div><small style="display:block;color:#aab1b8;margin-top:6px">Start any fight, then trigger booth lines without changing combat state.</small>`;
  document.body.append(panel);
  const before = F => F && JSON.stringify([F.t, F.rt, F.round, F.phase, F.eventSeq, F.events.length, F.f.map(f => [f.hp, f.en, f.heat, f.ph, f.lost])]);
  const scenarios = {
    bigHead: ['bigHead', 1, null], combo: ['combo', 1, null], crit: ['crit', 2, { target: 'head' }], hay: ['hay', 2, null],
    malf: ['malf', 2, { what: 'overheating' }], offline: ['offline', 2, { what: 'head unit' }], down: ['down', 3, null], kneel: ['kneel', 2, null],
    rise: ['rise', 3, { n: 6 }], secondwind: ['secondwind', 2, null], round: ['round', 2, { n: 2 }], final: ['final', 2, { n: 3, len: 45 }],
    ko: ['ko', 3, null], tko: ['tko', 3, null], destroy: ['destroy', 3, null],
  };
  function run(kind) {
    if (!G || !G.F) { toast('Start a fight to use the commentary test harness.'); return { ok: false, reason: 'no active fight' }; }
    const F = G.F, snap = before(F);
    if (kind === 'count') { for (const n of [1, 2, 3]) say('ref', NUMW[n], 3, { group: 'debug-ref-count', lock: true, groupHoldMs: 1050, ttl: 4000, assetKey: `ref.count.${n}` }); }
    else if (kind === 'burst') { say('pbp', 'A clean shot lands!', 2, { ttl: 5000 }); say('color', 'That opening came from the footwork.', 1, { ttl: 5000 }); say('pbp', 'The fighter is down!', 3, { critical: true, ttl: 5000 }); for (const n of [1, 2, 3]) say('ref', NUMW[n], 3, { group: 'debug-ref-count', lock: true, groupHoldMs: 1050, ttl: 4000 }); }
    else if (kind === 'missing') say('pbp', 'Missing asset test. Captions-only fallback should continue cleanly.', 2, { assetKey: 'debug.missing', ttl: 8000 });
    else if (kind === 'repeat') { VOX.eventId = `debug-repeat-${Date.now()}`; say('pbp', 'This event should only enter the queue once.', 2, { assetKey: 'debug.repeat' }); say('pbp', 'This event should only enter the queue once.', 2, { assetKey: 'debug.repeat' }); VOX.eventId = null; }
    else { const [key, pri, extra] = scenarios[kind] || scenarios.bigHead; comm(key, F, 0, extra, pri); }
    const unchanged = before(F) === snap; if (!unchanged) console.error('Commentary test changed combat state.');
    return { ok: unchanged, combatStateUnchanged: unchanged, queued: VOX.queue.length, current: VOX.cur && VOX.cur.who };
  }
  window.ScrapyardCommentaryTest = { trigger: run, scenarios: options.map(([value]) => value).concat(['count', 'burst', 'missing', 'repeat']), reset() { shutUp(); VOX.seen.clear(); return { queueEmpty: VOX.queue.length === 0, stopped: !VOX.cur }; } };
  panel.addEventListener('click', e => {
    const act = e.target.closest('[data-debug]')?.dataset.debug; if (!act) return;
    if (act === 'reset') { window.ScrapyardCommentaryTest.reset(); return; }
    run(act === 'event' ? $('#commentaryDebugEvent').value : act);
  });
}
initCommentaryDebug();

boot();

