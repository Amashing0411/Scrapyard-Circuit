/* ---- audio.js ---- */
/* ---------- audio: buses, layered sfx, crowd, procedural music ---------- */
let AC = null, master = null, musicBus = null, sfxBus = null, crowdBus = null, noiseBuf = null, muffleF = null, duckG = null, mus = null, musTimer = 0, ringTone = null;
let crowdAudio = null, crowdAltAudio = null, crowdBedKey = '', crowdBedPendingKey = '', crowdBedRequest = 0, crowdStage = 0, crowdPulse = 0, crowdPulseUntil = 0, crowdShoutNextAt = 0;
const crowdOneShots = new Set();
const crowdFadeStates = new WeakMap();
const CROWD_SHOUT_LIMIT = 2;
const crowdShoutLastAt = new Map();
const crowdShoutSourceLastAt = new Map();
let crowdShoutLastSrc = '';
let crowdShoutLastAnyAt = 0;
const CROWD_SHOUT_SOURCE_COOLDOWN_MS = 32000;
const SCREEN_MUSIC_TRACKS = {
  loading: ['audio/loading/01. Loading.mp3', 'audio/loading/02. Loading.mp3'],
  menu: ['audio/menu/69. ibgm.mp3', 'audio/menu/70. ibgm.mp3', 'audio/menu/73. ibgm.mp3', 'audio/menu/88. ibgm.mp3'],
  interior: ['audio/index,garage etc/69. ibgm.mp3', 'audio/index,garage etc/70. ibgm.mp3', 'audio/index,garage etc/73. ibgm.mp3', 'audio/index,garage etc/88. ibgm.mp3'],
};
let screenMusicPlayers = [], screenMusicSlot = -1, screenMusicScene = '', screenMusicLastFile = '', screenMusicSequence = 0;
function fadeCrowdAudio(audio, target, duration = 650) {
  if (!audio) return;
  target = clamp(target, 0, .9);
  const previous = crowdFadeStates.get(audio);
  if (previous && Math.abs(previous.target - target) < .012) return;
  if (previous && previous.raf) cancelAnimationFrame(previous.raf);
  const now = performance.now(), wasPaused = audio.paused;
  if (target > .002 && wasPaused) {
    audio.volume = 0;
    audio.play().catch(() => {});
  }
  const from = wasPaused && target > .002 ? 0 : audio.volume;
  const state = { target, raf: 0 };
  crowdFadeStates.set(audio, state);
  const start = now, span = Math.max(80, duration);
  const tick = time => {
    if (crowdFadeStates.get(audio) !== state) return;
    const p = clamp((time - start) / span, 0, 1), eased = p * p * (3 - 2 * p);
    audio.volume = clamp(from + (target - from) * eased, 0, .9);
    if (p < 1) { state.raf = requestAnimationFrame(tick); return; }
    state.raf = 0; audio.volume = target;
    if (target <= .002) audio.pause();
  };
  state.raf = requestAnimationFrame(tick);
}
function ensureScreenMusic() {
  if (screenMusicPlayers.length || typeof Audio !== 'function') return;
  try { screenMusicPlayers = [new Audio(), new Audio()]; for (const a of screenMusicPlayers) { a.preload = 'auto'; a.loop = false; a.volume = 0; a.preservesPitch = true; } }
  catch (e) { screenMusicPlayers = []; }
}
function setScreenMusic(scene, force = false, fadeMs = 700) {
  ensureScreenMusic(); if (!screenMusicPlayers.length) return;
  if (scene === 'none') {
    ++screenMusicSequence; screenMusicScene = 'none'; screenMusicSlot = -1;
    for (const a of screenMusicPlayers) fadeCrowdAudio(a, 0, fadeMs);
    return;
  }
  const tracks = SCREEN_MUSIC_TRACKS[scene]; if (!tracks || !tracks.length) return;
  if (!force && screenMusicScene === scene) {
    const current = screenMusicPlayers[screenMusicSlot];
    if (current && current.paused) current.play().then(() => fadeCrowdAudio(current, clamp((S.opt.music || 0) * .8, 0, .9), 450)).catch(() => {});
    return;
  }
  const seq = ++screenMusicSequence, currentName = screenMusicLastFile.split('/').pop();
  const pool = tracks.filter(file => file.split('/').pop() !== currentName);
  const file = (pool.length ? pool : tracks)[Math.random() * (pool.length || tracks.length) | 0];
  const nextSlot = screenMusicSlot < 0 ? 0 : 1 - screenMusicSlot, next = screenMusicPlayers[nextSlot];
  const outgoing = screenMusicPlayers.filter((a, i) => i !== nextSlot && !a.paused);
  const clickStartedLoadingTrack = scene === 'loading' && curScreen === 'title';
  next.pause(); next.onended = next.onerror = null;
  next.volume = clickStartedLoadingTrack ? clamp((S.opt.music || 0) * .8, 0, .9) : 0;
  next.currentTime = 0;
  next.src = new URL(file, document.baseURI).href; next.load();
  screenMusicScene = scene; screenMusicLastFile = file; screenMusicSlot = nextSlot;
  next.onended = () => { if (seq === screenMusicSequence && screenMusicScene === scene) setScreenMusic(scene, true); };
  next.onerror = () => { if (seq === screenMusicSequence) screenMusicScene = ''; };
  next.play().then(() => { if (seq === screenMusicSequence) fadeCrowdAudio(next, clamp((S.opt.music || 0) * .8, 0, .9), 550); }).catch(() => { if (seq === screenMusicSequence) screenMusicScene = ''; });
  for (const a of outgoing) fadeCrowdAudio(a, 0, 850);
}
function updateScreenMusicVolume() {
  if (screenMusicSlot < 0 || screenMusicScene === 'none') return;
  const current = screenMusicPlayers[screenMusicSlot];
  if (current) fadeCrowdAudio(current, clamp((S.opt.music || 0) * .8, 0, .9), 180);
}
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; return; }
  const comp = AC.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.knee.value = 10;
  muffleF = AC.createBiquadFilter(); muffleF.type = 'lowpass'; muffleF.frequency.value = 18000; muffleF.Q.value = .4;
  master = AC.createGain(); master.gain.value = .9; master.connect(muffleF).connect(comp).connect(AC.destination);
  duckG = AC.createGain(); duckG.connect(master);
  musicBus = AC.createGain(); musicBus.connect(duckG);
  sfxBus = AC.createGain(); sfxBus.connect(master);
  crowdBus = AC.createGain(); crowdBus.connect(master);
  const len = AC.sampleRate * 2; noiseBuf = AC.createBuffer(1, len, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  initCrowdAmbience();
  applyVolumes(); startMusic();
}
function initCrowdAmbience() {
  if (crowdAudio || typeof Audio !== 'function') return;
  try {
    crowdAudio = new Audio();
    crowdAltAudio = new Audio();
    for (const a of [crowdAudio, crowdAltAudio]) { a.loop = true; a.preload = 'auto'; a.volume = 0; a.preservesPitch = false; if ('webkitPreservesPitch' in a) a.webkitPreservesPitch = false; }
  } catch (e) { crowdAudio = crowdAltAudio = null; }
  updateCrowdAudio();
}
function updateCrowdAudio() {
  if (!crowdAudio) return;
  const pulse = performance.now() < crowdPulseUntil ? crowdPulse : 0;
  const profile = CROWD_PROFILES[curVenue] || CROWD_PROFILES.arena;
  const beds = profile.beds || ['audio/commentary/arena-crowd-a.mp3', 'audio/commentary/arena-crowd-b.mp3'];
  const bedKey = beds.join('|');
  if (crowdBedKey !== bedKey) {
    const request = ++crowdBedRequest;
    crowdBedKey = crowdBedPendingKey = bedKey;
    fadeCrowdAudio(crowdAudio, 0, 240); fadeCrowdAudio(crowdAltAudio, 0, 240);
    setTimeout(() => {
      if (request !== crowdBedRequest || crowdBedKey !== bedKey) return;
      for (const a of [crowdAudio, crowdAltAudio]) { a.pause(); a.volume = 0; }
      crowdAudio.src = new URL(beds[0], document.baseURI).href;
      crowdAltAudio.src = new URL(beds[1] || beds[0], document.baseURI).href;
      let offsetApplied = false;
      const staggerLoopSeam = () => {
        if (offsetApplied || crowdBedKey !== bedKey || crowdAudio.readyState < 1 || crowdAltAudio.readyState < 1) return;
        offsetApplied = true;
        if (crowdAltAudio.duration > 2) try { crowdAltAudio.currentTime = crowdAltAudio.duration * .47; } catch (e) {}
      };
      crowdAudio.onloadedmetadata = staggerLoopSeam;
      crowdAltAudio.onloadedmetadata = staggerLoopSeam;
      crowdAudio.load(); crowdAltAudio.load();
      crowdBedPendingKey = '';
      crowdFadeStates.delete(crowdAudio); crowdFadeStates.delete(crowdAltAudio);
      updateCrowdAudio();
    }, 250);
    return;
  }
  if (crowdBedPendingKey === bedKey) return;
  const gain = clamp((S.opt.crowd || 0) * Math.min(.9, crowdStage + pulse), 0, .9);
  crowdAudio.playbackRate = profile.rateA;
  if (crowdAltAudio) crowdAltAudio.playbackRate = profile.rateB;
  fadeCrowdAudio(crowdAudio, gain * profile.mixA, gain > crowdAudio.volume ? 650 : 900);
  if (crowdAltAudio) fadeCrowdAudio(crowdAltAudio, gain * (1 - profile.mixA), gain > crowdAltAudio.volume ? 650 : 900);
}
function primeCrowdAudioForGesture() {
  if (!crowdAudio) initCrowdAmbience();
  if (!crowdAudio || !crowdAltAudio || typeof Audio !== 'function') return;
  const profile = CROWD_PROFILES[curVenue] || CROWD_PROFILES.arena;
  const beds = profile.beds || ['audio/commentary/arena-crowd-a.mp3', 'audio/commentary/arena-crowd-b.mp3'];
  const bedKey = beds.join('|'), request = ++crowdBedRequest;
  crowdBedKey = bedKey; crowdBedPendingKey = '';
  const audios = [crowdAudio, crowdAltAudio];
  for (const audio of audios) {
    const prior = crowdFadeStates.get(audio);
    if (prior && prior.raf) cancelAnimationFrame(prior.raf);
    crowdFadeStates.delete(audio);
  }
  const fileFor = [beds[0], beds[1] || beds[0]];
  let offsetApplied = false;
  const staggerLoopSeam = () => {
    if (offsetApplied || request !== crowdBedRequest || audios.some(a => a.readyState < 1)) return;
    offsetApplied = true;
    if (crowdAltAudio.duration > 2) try { crowdAltAudio.currentTime = crowdAltAudio.duration * .47; } catch (e) {}
  };
  audios.forEach((audio, i) => {
    const url = new URL(fileFor[i], document.baseURI).href;
    audio.loop = true; audio.preload = 'auto'; audio.volume = 0;
    audio.playbackRate = i ? profile.rateB : profile.rateA;
    audio.preservesPitch = false;
    if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
    if (audio.src !== url) { audio.pause(); audio.currentTime = 0; audio.src = url; }
    audio.onloadedmetadata = staggerLoopSeam;
    try { audio.load(); } catch (e) {}
    // Start both loops in the title click/key gesture. Deferring until the menu
    // fade completes loses Chrome's autoplay permission.
    try {
      const playRequest = audio.play();
      if (playRequest && playRequest.catch) playRequest.catch(() => {});
    } catch (e) {}
  });
  const gain = clamp((S.opt.crowd || 0) * crowdStage, 0, .9);
  fadeCrowdAudio(crowdAudio, gain * profile.mixA, 900);
  fadeCrowdAudio(crowdAltAudio, gain * (1 - profile.mixA), 1050);
}
function applyVolumes() {
  updateCrowdAudio();
  updateScreenMusicVolume();
  if (!AC) return; const o = S.opt, t = AC.currentTime;
  musicBus.gain.setTargetAtTime(o.music * .62, t, .08); sfxBus.gain.setTargetAtTime(o.sfx, t, .05); crowdBus.gain.setTargetAtTime(o.crowd, t, .08);
}
function duck(on) { if (duckG) duckG.gain.setTargetAtTime(on ? .45 : 1, AC.currentTime, .15); }
function setMuffle(k) { if (!muffleF) return; muffleF.frequency.setTargetAtTime(k > 0 ? 18000 * Math.pow(.035, k) : 18000, AC.currentTime, .12); }
function env(node, t, peak, dur, att = .006) { node.gain.setValueAtTime(.0001, t); node.gain.exponentialRampToValueAtTime(Math.max(.0002, peak), t + att); node.gain.exponentialRampToValueAtTime(.0001, t + dur); }
function noiseHit(t, dur, freq, q, peak, type = 'bandpass', dest, att) { const n = AC.createBufferSource(); n.buffer = noiseBuf; n.playbackRate.value = .8 + Math.random() * .4; const f = AC.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = AC.createGain(); env(g, t, peak, dur, att); n.connect(f).connect(g).connect(dest || sfxBus); n.start(t, Math.random() * 1.5); n.stop(t + dur + .05); return f; }
function tone(t, freq, dur, peak, type = 'sine', dest, endFreq, att) { const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t); if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur); env(g, t, peak, dur, att); o.connect(g).connect(dest || sfxBus); o.start(t); o.stop(t + dur + .05); return o; }
const ok = () => !!AC;
/* ---- impacts: contact crack + driven thump (audible on small speakers) + inharmonic metal per maker ---- */
const HIT_METAL = {
  JL: { modes: [215, 470, 1040, 1690], ring: .13, level: .85, rattle: .5 }, // loose salvaged scrap
  KS: { modes: [640, 1480, 2850], ring: .09, level: .7, rattle: 0 }, // thin composite: short and dry
  HL: { modes: [130, 305, 720, 1180], ring: .24, level: 1, rattle: .15 }, // thick slab: low and long
  VT: { modes: [520, 1290, 2380, 3410], ring: .2, level: .8, rattle: 0 }, // ceramic and coil: glassy
  SB: { modes: [410, 980, 2160, 3720], ring: .3, level: .9, rattle: 0 }, // premium alloy: clean ring
  def: { modes: [300, 690, 1320, 2240], ring: .16, level: .85, rattle: .25 },
};
const HIT_WEIGHT = { jab: .72, cross: .92, hook: 1, upper: 1.05, counter: 1.08, hay: 1.25 };
let hitDrive = null;
function hitBus() {
  if (hitDrive && hitDrive.context === AC) return hitDrive;
  const curve = new Float32Array(1024), k = 2.4, norm = Math.tanh(k); for (let i = 0; i < 1024; i++) curve[i] = Math.tanh(k * (i / 511.5 - 1)) / norm;
  hitDrive = AC.createWaveShaper(); hitDrive.curve = curve; hitDrive.oversample = '2x'; hitDrive.connect(sfxBus); return hitDrive;
}
const hitMaker = (spec, target) => { const b = spec && spec.build, q = !b ? null : target === 'head' ? part('head', b.head) : target === 'arm' ? part('arms', b.lead) : part('torso', b.torso); return q ? q.b : ''; };
function crowdDip(amount, recover = 420) {
  if (!crowdAudio) return;
  for (const a of [crowdAudio, crowdAltAudio]) {
    if (!a || a.paused) continue; const st = crowdFadeStates.get(a), target = st ? st.target : a.volume; if (target < .02) continue;
    if (st && st.raf) cancelAnimationFrame(st.raf); crowdFadeStates.delete(a);
    a.volume = clamp(Math.min(a.volume, target * (1 - amount)), 0, .9); fadeCrowdAudio(a, target, recover);
  }
}
function thud(p, blocked, kind, target, crit, opt = {}) {
  if (!ok()) return; const t = AC.currentTime, head = target === 'head', heavy = kind === 'hay' || kind === 'upper' || crit, bus = hitBus(), vary = () => .93 + Math.random() * .14;
  const gain = opt.gain == null ? 1 : opt.gain, v = Math.min(1, .46 + p * .04) * (HIT_WEIGHT[kind] || .9) * gain, m = HIT_METAL[opt.maker] || HIT_METAL.def, soft = blocked ? .55 : 1;
  if (blocked) {
    tone(t, 165 * vary(), .1, .4 * v, 'sine', bus, 70, .002);
    noiseHit(t, .07, 700, .6, .32 * v, 'lowpass', bus, .001);
    noiseHit(t, .018, 2300, .8, .22 * v, 'bandpass', null, .001);
  } else {
    noiseHit(t, .022, (head ? 3400 : 2400) * vary(), .7, .5 * v, 'bandpass', null, .001);
    tone(t, (head ? 235 : 170) * vary(), .15, .9 * v, 'sine', bus, head ? 88 : 58, .002);
    noiseHit(t, .09, head ? 1300 : 800, .6, .6 * v, 'lowpass', bus, .001);
  }
  m.modes.forEach((f, i) => { const hz = f * vary() * (head ? 1.18 : 1); tone(t + .003 + Math.random() * .006, hz, m.ring * soft / (1 + i * .35), .2 * m.level * soft * v / (1 + i * .55), 'triangle', null, hz * (.93 + Math.random() * .05), .001); });
  if (!blocked && m.rattle && Math.random() < m.rattle) scrapClatter(t + .05, 3, .45 * v);
  if (heavy && !blocked) { tone(t, 120, .34, .7 * v, 'sine', bus, 38, .003); noiseHit(t + .01, .2, 520, .5, .35 * v, 'lowpass', bus, .004); }
  if (crit && !blocked) { noiseHit(t + .004, .05, 5200, .8, .3 * v, 'highpass', null, .001); tone(t + .004, 1540 * vary(), .3, .16 * v, 'triangle', null, 1380, .001); }
  if (opt.dip !== false) crowdDip(blocked ? .12 : clamp(.16 + v * .26 + (heavy ? .14 : 0), 0, .6));
}
function scrapClatter(t, n = 5, v = 1) { if (!ok()) return; for (let i = 0, at = t; i < n; i++, at += .06 + Math.random() * .08) { const fade = v * (1 - i / (n + 1)); noiseHit(at, .03, 1800 + Math.random() * 2200, 2, .22 * fade, 'bandpass', null, .001); tone(at, 500 + Math.random() * 1500, .09, .1 * fade, 'triangle', null, null, .001); } }
function tearOff() { if (!ok()) return; const t = AC.currentTime; noiseHit(t, .32, 3100, 1.6, .42, 'bandpass', null, .004); [340, 770, 1490, 2620, 3900].forEach((f, i) => tone(t + Math.random() * .012, f, .55 / (1 + i * .4), .2 / (1 + i * .4), 'triangle', null, f * .86, .001)); tone(t, 150, .2, .8, 'sine', hitBus(), 52, .002); scrapClatter(t + .42, 5, .9); crowdDip(.55, 700); }
function floorCrash() { if (!ok()) return; const t = AC.currentTime, bus = hitBus(); tone(t, 110, .5, .95, 'sine', bus, 30, .003); noiseHit(t, .24, 620, .5, .75, 'lowpass', bus, .002); noiseHit(t + .02, .5, 2400, 1, .16, 'bandpass', null, .01); scrapClatter(t + .16, 6, .9); crowdDip(.6, 800); }
function whoosh(k = 1) { if (!ok()) return; const t = AC.currentTime, f = noiseHit(t, .22, 520, .9, .6 * k); f.frequency.exponentialRampToValueAtTime(2800, t + .19); }
function servo(kind) { if (!ok()) return; const t = AC.currentTime, f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 3; const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(kind === 'hay' ? 90 : 160, t); o.frequency.exponentialRampToValueAtTime(kind === 'hay' ? 260 : 420, t + (kind === 'hay' ? .5 : .14)); env(g, t, .28, kind === 'hay' ? .55 : .16); o.connect(f).connect(g).connect(sfxBus); o.start(t); o.stop(t + .7); if (kind === 'hay') noiseHit(t, .6, 4200, .7, .13, 'highpass', null, .3); }
function clank(v = 1) { if (!ok()) return; const t = AC.currentTime; noiseHit(t, .055, 1450, .6, .28 * v, 'bandpass', null, .002); [420, 760, 1280, 2130].forEach((f, i) => tone(t + Math.random() * .006, f * (.94 + Math.random() * .12), .28 / (1 + i * .65), .15 * v / (i + 1), 'triangle', null, f * (.88 + Math.random() * .1), .002)); noiseHit(t + .018, .09, 4100, .75, .13 * v, 'highpass', null, .003); }
function zap() { if (!ok()) return; const t = AC.currentTime; for (let i = 0; i < 4; i++) tone(t + i * .035, 1800 - i * 300, .05, .05, 'square', null, 300); noiseHit(t, .2, 5000, 3, .12); }
function steam() { if (!ok()) return; noiseHit(AC.currentTime, 1.1, 5200, .5, .12, 'highpass', null, .15); }
function weld() { if (!ok()) return; const t = AC.currentTime; noiseHit(t, .55, 5500, .8, .16, 'highpass'); for (let i = 0; i < 5; i++) noiseHit(t + Math.random() * .4, .03, 7000, 3, .08, 'bandpass'); }
function beep(hi) { if (!ok()) return; const t = AC.currentTime; tone(t, hi ? 1320 : 880, .14, .1, 'square'); tone(t, hi ? 660 : 440, .2, .08, 'sine'); }
function blip() { if (!ok()) return; tone(AC.currentTime, 600 + Math.random() * 400, .05, .06, 'square'); }
function bell(n = 1) { if (!ok()) return; const t = AC.currentTime; for (let k = 0; k < n; k++) [1, 2.76, 5.4, 8.9].forEach((h, i) => tone(t + k * .32, 540 * h, 1.7, .2 / (i + 1), 'sine', null, null, .002)); }
function explosion() { if (!ok()) return; const t = AC.currentTime; noiseHit(t, 1.6, 260, .4, 1, 'lowpass'); tone(t, 85, 1.1, .7, 'sine', null, 26); noiseHit(t, .5, 2000, .5, .4); for (let i = 0; i < 8; i++) noiseHit(t + .1 + Math.random() * .9, .05, 3000 + Math.random() * 3000, 4, .08); }
function bootHit(k) { if (!ok()) return; const t = AC.currentTime; tone(t, 520 + k * 140, .16, .12, 'triangle', null, 900 + k * 180); tone(t + .07, 1040 + k * 280, .25, .08, 'sine'); }
function bootMiss() { if (!ok()) return; const t = AC.currentTime; noiseHit(t, .35, 2400, .3, .3, 'bandpass'); tone(t, 62, .4, .18, 'square'); }
function powerUp() { if (!ok()) return; const t = AC.currentTime, f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(5000, t + .8); const g = AC.createGain(); env(g, t, .16, 1.1, .2); const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(720, t + .9); o.connect(f).connect(g).connect(sfxBus); o.start(t); o.stop(t + 1.2); tone(t + .85, 1320, .5, .1, 'sine'); tone(t + .95, 1760, .5, .07, 'sine'); }
function powerDown() { if (!ok()) return; const t = AC.currentTime; tone(t, 700, .9, .14, 'sawtooth', null, 40); noiseHit(t, .4, 1200, .6, .12); }
function heartbeat() { if (!ok()) return; const t = AC.currentTime; tone(t, 62, .16, .5, 'sine', null, 40); tone(t + .2, 55, .2, .38, 'sine', null, 36); }
function ringing(on) { if (!ok()) return; if (on && !ringTone) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = 3700; g.gain.value = 0; g.gain.setTargetAtTime(.025, AC.currentTime, .2); o.connect(g).connect(master); o.start(); ringTone = { o, g }; } else if (!on && ringTone) { const r = ringTone; ringTone = null; r.g.gain.setTargetAtTime(0, AC.currentTime, .3); r.o.stop(AC.currentTime + 1.5); } }
function uiClick() { if (!ok()) return; const t = AC.currentTime; tone(t, 1900, .04, .05, 'square'); noiseHit(t, .03, 4000, 2, .05); }
function uiConfirm() { if (!ok()) return; const t = AC.currentTime; tone(t, 660, .1, .07, 'triangle'); tone(t + .07, 990, .16, .07, 'triangle'); }
function uiBuy() { if (!ok()) return; const t = AC.currentTime; [1568, 2093, 2637].forEach((f, i) => tone(t + i * .06, f, .25, .06, 'triangle')); clank(.25); }
function uiError() { if (!ok()) return; const t = AC.currentTime; tone(t, 140, .18, .12, 'square'); tone(t + .12, 110, .22, .12, 'square'); }
/* ---- crowd: bed, formant shouts, claps, stomps ---- */
function formant(t, dur, f1, f2, peak, glide, dest) {
  for (const [f, q, k] of [[f1, 6, 1], [f2, 8, .55]]) { const n = noiseHit(t, dur, f, q, peak * k, 'bandpass', dest || crowdBus, dur * .25); if (glide) n.frequency.linearRampToValueAtTime(f * glide, t + dur); }
}
function crowdVox(f1, f2, dur, peak, glide, n = 6) { if (!ok()) return; const t = AC.currentTime; for (let i = 0; i < n; i++) formant(t + Math.random() * .08, dur * (.85 + Math.random() * .3), f1 * (.85 + Math.random() * .3), f2 * (.85 + Math.random() * .3), peak / Math.sqrt(n), glide); }
function crowdLift(amount, ms) { crowdPulse = Math.max(crowdPulse, amount); crowdPulseUntil = Math.max(crowdPulseUntil, performance.now() + ms); updateCrowdAudio(); }
function ooh() { if (!ok()) return; crowdLift(.13, 1150); }
function aww() { if (!ok()) return; crowdLift(.09, 1050); }
function boo() { if (!ok()) return; crowdLift(.06, 1350); }
function hey() { if (!ok()) return; crowdLift(.17, 650); clap(AC.currentTime, .65); }
function cheer(v = .5) { if (!ok()) return; crowdLift(.14 + clamp(v, 0, 1) * .13, 1500 + v * 800); clap(AC.currentTime + .05, .8 + v * .35); }
function roar(v = 1) { if (!ok()) return; crowdLift(.2 + clamp(v, 0, 1) * .18, 2400 + v * 900); clap(AC.currentTime + .08, 1 + v * .4); }
const CROWD_CALLOUTS = {
  impact: [{ src: 'audio/commentary/crowd-shouts/male-hit-hard.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/female-landed-clean.mp3', voice: 'female' }],
  counter: [{ src: 'audio/commentary/crowd-shouts/male-counter.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/female-beautiful-counter.mp3', voice: 'female' }],
  danger: [{ src: 'audio/commentary/crowd-shouts/male-pressure.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/female-get-up.mp3', voice: 'female' }],
  comeback: [{ src: 'audio/commentary/crowd-shouts/female-win-for-me.mp3', voice: 'female' }, { src: 'audio/commentary/crowd-shouts/male-landed.mp3', voice: 'male' }],
  ambient: [
    { src: 'audio/commentary/crowd-shouts/male-hit-hard.mp3', voice: 'male' },
    { src: 'audio/commentary/crowd-shouts/male-counter.mp3', voice: 'male' },
    { src: 'audio/commentary/crowd-shouts/male-pressure.mp3', voice: 'male' },
    { src: 'audio/commentary/crowd-shouts/female-beautiful-counter.mp3', voice: 'female' },
    { src: 'audio/commentary/crowd-shouts/female-get-up.mp3', voice: 'female' },
    { src: 'audio/commentary/crowd-shouts/female-win-for-me.mp3', voice: 'female' },
  ],
};
const CROWD_VENUE_CALLOUTS = {
  lot: {
    all: [{ src: 'audio/commentary/crowd-shouts/lot_en_male_pressure_01.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/lot_en_female_cheer_01.mp3', voice: 'female' }],
    impact: [{ src: 'audio/commentary/crowd-shouts/lot_en_male_pressure_01.mp3', voice: 'male' }],
    danger: [{ src: 'audio/commentary/crowd-shouts/lot_en_male_pressure_01.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/lot_en_female_cheer_01.mp3', voice: 'female' }],
    comeback: [{ src: 'audio/commentary/crowd-shouts/lot_en_female_cheer_01.mp3', voice: 'female' }],
  },
  drain: {
    all: [{ src: 'audio/commentary/crowd-shouts/drain_es_male_pressure_01.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/drain_es_female_counter_01.mp3', voice: 'female' }],
    impact: [{ src: 'audio/commentary/crowd-shouts/drain_es_female_impact_01.mp3', voice: 'female' }],
    counter: [{ src: 'audio/commentary/crowd-shouts/drain_es_female_counter_01.mp3', voice: 'female' }],
    danger: [{ src: 'audio/commentary/crowd-shouts/drain_es_male_danger_01.mp3', voice: 'male' }],
    comeback: [{ src: 'audio/commentary/crowd-shouts/drain_es_male_pressure_01.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/drain_es_female_counter_01.mp3', voice: 'female' }],
  },
  harbor: {
    all: [{ src: 'audio/commentary/crowd-shouts/harbor_pt_male_pressure_01.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/harbor_pt_female_counter_01.mp3', voice: 'female' }],
    impact: [{ src: 'audio/commentary/crowd-shouts/harbor_pt_male_pressure_01.mp3', voice: 'male' }],
    counter: [{ src: 'audio/commentary/crowd-shouts/harbor_pt_female_counter_01.mp3', voice: 'female' }],
    danger: [{ src: 'audio/commentary/crowd-shouts/harbor_pt_male_pressure_01.mp3', voice: 'male' }],
    comeback: [{ src: 'audio/commentary/crowd-shouts/harbor_pt_female_counter_01.mp3', voice: 'female' }],
  },
  foundry: {
    all: [{ src: 'audio/commentary/crowd-shouts/foundry_de_male_counter_01.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/foundry_de_female_danger_01.mp3', voice: 'female' }],
    impact: [{ src: 'audio/commentary/crowd-shouts/foundry_de_male_counter_01.mp3', voice: 'male' }],
    counter: [{ src: 'audio/commentary/crowd-shouts/foundry_de_male_counter_01.mp3', voice: 'male' }],
    danger: [{ src: 'audio/commentary/crowd-shouts/foundry_de_female_danger_01.mp3', voice: 'female' }],
    comeback: [{ src: 'audio/commentary/crowd-shouts/foundry_de_male_counter_01.mp3', voice: 'male' }],
  },
  arena: {
    all: [{ src: 'audio/commentary/crowd-shouts/arena_it_male_impact_01.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/arena_it_female_cheer_01.mp3', voice: 'female' }],
    impact: [{ src: 'audio/commentary/crowd-shouts/arena_it_male_impact_01.mp3', voice: 'male' }],
    counter: [{ src: 'audio/commentary/crowd-shouts/arena_it_male_impact_01.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/arena_it_female_cheer_01.mp3', voice: 'female' }],
    danger: [{ src: 'audio/commentary/crowd-shouts/arena_it_female_cheer_01.mp3', voice: 'female' }],
    comeback: [{ src: 'audio/commentary/crowd-shouts/arena_it_female_cheer_01.mp3', voice: 'female' }],
  },
  dome: {
    all: [{ src: 'audio/commentary/crowd-shouts/dome_ja_male_danger_01.mp3', voice: 'male' }, { src: 'audio/commentary/crowd-shouts/dome_ja_female_pressure_01.mp3', voice: 'female' }],
    impact: [{ src: 'audio/commentary/crowd-shouts/dome_ja_female_pressure_01.mp3', voice: 'female' }],
    counter: [{ src: 'audio/commentary/crowd-shouts/dome_ja_female_pressure_01.mp3', voice: 'female' }],
    danger: [{ src: 'audio/commentary/crowd-shouts/dome_ja_male_danger_01.mp3', voice: 'male' }],
    comeback: [{ src: 'audio/commentary/crowd-shouts/dome_ja_female_pressure_01.mp3', voice: 'female' }],
  },
};
function crowdShoutPool(kind) {
  const venue = CROWD_VENUE_CALLOUTS[curVenue], local = venue && (venue[kind] || venue.all);
  return local && local.length ? local : (CROWD_CALLOUTS[kind] || CROWD_CALLOUTS.ambient);
}
function routeCrowdShout(audio, profile) {
  if (!AC || !crowdBus || window.location.protocol === 'file:' || typeof AC.createMediaElementSource !== 'function') return false;
  let source = null;
  try {
    source = AC.createMediaElementSource(audio);
    const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 105;
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = profile.air;
    const pan = AC.createStereoPanner(); pan.pan.value = (Math.random() * 2 - 1) * profile.spread;
    source.connect(hp).connect(lp).connect(pan).connect(crowdBus);
    if (profile.room > .2) {
      const slap = AC.createDelay(.08), wet = AC.createGain();
      slap.delayTime.value = .016 + profile.room * .026; wet.gain.value = .035 + profile.room * .085;
      pan.connect(slap).connect(wet).connect(crowdBus);
    }
    return true;
  } catch (e) {
    if (source) { try { source.disconnect(); source.connect(AC.destination); } catch (err) {} }
    return false;
  }
}
function releaseCrowdShout(audio) {
  audio.onplay = audio.onended = audio.onerror = audio.ontimeupdate = null;
  try { audio.pause(); audio.currentTime = 0; } catch (e) {}
  crowdFadeStates.delete(audio); crowdOneShots.delete(audio);
}
function playCrowdCue(cue, kind, intensity, allowFallback = true, ambient = false) {
  const profile = CROWD_PROFILES[curVenue] || CROWD_PROFILES.arena;
  try {
    const audio = new Audio(new URL(cue.src, document.baseURI).href);
    audio.preload = 'auto'; audio.crowdSrc = cue.src;
    const gain = profile.shoutGain * clamp(.72 + intensity * .24, .72, .98) * (.76 + Math.random() * .28);
    const distancePitch = 1 - profile.room * .025;
    audio.playbackRate = clamp((cue.voice === 'female' ? profile.femaleRate : profile.maleRate) * distancePitch * (.93 + Math.random() * .14), .82, 1.18);
    audio.preservesPitch = false; if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
    const routed = routeCrowdShout(audio, profile);
    const targetVolume = routed
      ? clamp(gain * (ambient ? .72 : 1), .035, .27)
      : clamp((S.opt.crowd || 0) * gain * (ambient ? .72 : 1), 0, .24);
    let fadingTail = false;
    audio.volume = 0;
    audio.onplay = () => fadeCrowdAudio(audio, targetVolume, (ambient ? 620 : 430) + profile.room * 180);
    audio.ontimeupdate = () => { if (!fadingTail && audio.duration && audio.duration - audio.currentTime < .30) { fadingTail = true; fadeCrowdAudio(audio, 0, ambient ? 460 : 360); } };
    audio.onended = () => releaseCrowdShout(audio);
    audio.onerror = () => {
      releaseCrowdShout(audio);
      if (!allowFallback) return;
      const fallback = (CROWD_CALLOUTS[kind] || CROWD_CALLOUTS.ambient).find(item => item.src !== cue.src);
      if (fallback) playCrowdCue(fallback, kind, intensity * .88, false, ambient);
    };
    crowdOneShots.add(audio); crowdShoutLastSrc = cue.src;
    audio.play().catch(() => releaseCrowdShout(audio));
  } catch (e) { /* Missing optional crowd media never changes the fight. */ }
}
function crowdShout(kind, intensity = .7, ambient = false) {
  if (!G || G.intro || G.paused || G.modal || !S.opt.crowd || typeof Audio !== 'function') return;
  if (ambient ? G.F.phase !== 'fight' : G.F.phase === 'done') return;
  const now = performance.now(), gap = { impact: 4200, counter: 5200, danger: 7600, comeback: 7600, ambient: 0 }[kind] ?? 5000;
  const overallGap = ambient ? 3400 : 5900;
  if (now - crowdShoutLastAnyAt < overallGap || now - (crowdShoutLastAt.get(kind) || 0) < gap || crowdOneShots.size >= CROWD_SHOUT_LIMIT) return;
  const pool = crowdShoutPool(kind), active = new Set([...crowdOneShots].map(audio => audio.crowdSrc));
  const eligible = pool.filter(item => !active.has(item.src) && now - (crowdShoutSourceLastAt.get(item.src) || 0) >= CROWD_SHOUT_SOURCE_COOLDOWN_MS);
  const choices = eligible.filter(item => item.src !== crowdShoutLastSrc);
  if (!choices.length) return;
  const cue = pickOne(choices);
  if (!cue) return;
  crowdShoutLastAt.set(kind, now); crowdShoutLastAnyAt = now;
  crowdShoutSourceLastAt.set(cue.src, now); crowdShoutLastSrc = cue.src;
  playCrowdCue(cue, kind, clamp(intensity, .18, 1), true, ambient);
}
function tickCrowdShouts() {
  if (!G || G.intro || G.paused || G.modal || G.F.phase !== 'fight' || !(S.opt.crowd > 0)) { crowdShoutNextAt = 0; return; }
  const now = performance.now();
  if (!crowdShoutNextAt) { crowdShoutNextAt = now + 10500 + Math.random() * 8500; return; }
  if (now < crowdShoutNextAt) return;
  const [a, b] = G.F.f, pressure = Math.min(a.hp / a.s.hp, b.hp / b.s.hp) < .36 || G.hype > .82;
  crowdShout('ambient', .28 + G.hype * .34, true);
  if (Math.random() < .14) {
    const fight = G.F, delayedIntensity = .20 + G.hype * .24;
    setTimeout(() => { if (G && G.F === fight && !G.intro && !G.paused && !G.modal && G.F.phase === 'fight') crowdShout('ambient', delayedIntensity, true); }, 4500 + Math.random() * 2000);
  }
  crowdShoutNextAt = now + (pressure ? 15500 + Math.random() * 9500 : 23500 + Math.random() * 15500);
}
function stopCrowdShouts() { for (const audio of [...crowdOneShots]) releaseCrowdShout(audio); crowdShoutNextAt = 0; crowdShoutLastAt.clear(); crowdShoutSourceLastAt.clear(); crowdShoutLastAnyAt = 0; crowdShoutLastSrc = ''; }
function clap(t, k = 1) { if (!AC) return; for (let i = 0; i < 14; i++) noiseHit(t + Math.random() * .035, .05, 1100 + Math.random() * 900, 1.4, .07 * k, 'bandpass', crowdBus, .002); }
function stomp(t, k = 1) { if (!AC) return; for (let i = 0; i < 6; i++) tone(t + Math.random() * .04, 70 + Math.random() * 15, .22, .09 * k, 'sine', crowdBus, 40, .004); noiseHit(t, .12, 300, .7, .12 * k, 'lowpass', crowdBus); }
let chant = null;
function startChant(kind) { if (!ok() || chant) return; chant = { kind, step: 0, bars: 0 }; }
function chantStep(step, t, sd) {
  if (!chant) return; const b = step % 16;
  if (chant.kind === 'clap') { if ([0, 4, 8, 10, 12].includes(b)) clap(t, .9); if (b === 14) { const tt = t; setTimeout(() => hey(), Math.max(0, (tt - AC.currentTime) * 1000)); } }
  else { if (b === 0 || b === 4) stomp(t, 1); if (b === 8) clap(t, 1.1); if (b === 12) { stomp(t, .7); } }
  if (b === 15 && ++chant.bars >= 4) chant = null;
}
function crowdLevel(h, live) { crowdStage = live ? .55 + clamp(h, 0, 1) * .35 : curScreen === 'menu' ? .70 : 0; if (!live) { crowdPulse = 0; crowdPulseUntil = 0; stopCrowdShouts(); } updateCrowdAudio(); }
/* ---- procedural music: menu groove, walkout, fight score, victory, defeat ---- */
const WALKOUTS = { anthem: { name: 'Anthem', bpm: 124, tr: 0 }, grind: { name: 'Grind', bpm: 92, tr: -5, half: true }, pulse: { name: 'Pulse', bpm: 138, tr: 2, pulse: true }, swagger: { name: 'Swagger', bpm: 108, tr: -3, swing: true } };
const walkStyle = () => WALKOUTS[S.walkout] || WALKOUTS.anthem;
const THEMES = {
  menu: { bpm: 86, len: 64 }, walkout: { bpm: 124, len: 32 }, fight: { bpm: 96, len: 32 }, victory: { bpm: 112, len: 64 }, defeat: { bpm: 70, len: 64 }, none: { bpm: 90, len: 16 },
};
function startMusic() {
  mus = { theme: 'none', want: 'none', step: 0, next: AC.currentTime + .15, int: .2, target: .2, fade: 1 };
  const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 400; lp.connect(musicBus); mus.padF = lp;
  const padG = AC.createGain(); padG.gain.value = 0; padG.connect(lp); mus.padG = padG;
  [55, 82.4, 110.5].forEach(f => { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = (Math.random() - .5) * 14; g.gain.value = .04; o.connect(g).connect(padG); o.start(); });
  mus.themeG = AC.createGain(); mus.themeG.connect(musicBus);
  clearInterval(musTimer);
  musTimer = setInterval(() => {
    if (!AC || !mus) return;
    if (mus.want !== mus.theme) { mus.theme = mus.want; mus.step = 0; mus.next = AC.currentTime + .05; }
    mus.int += (mus.target - mus.int) * .05;
    const th = mus.theme === 'walkout' ? { ...THEMES.walkout, bpm: walkStyle().bpm } : THEMES[mus.theme] || THEMES.none, now = AC.currentTime;
    mus.padG.gain.setTargetAtTime(mus.theme === 'fight' ? 1 : 0, now, .5);
    mus.padF.frequency.setTargetAtTime(300 + mus.int * 1400, now, .3);
    const sd = 60 / (th.bpm + (mus.theme === 'fight' ? mus.int * 34 : 0)) / 4;
    if (mus.next < now) mus.next = now + .02;
    while (mus.next < now + .16) { playStep(mus.theme, mus.step, mus.next, mus.int, sd); chantStep(mus.step, mus.next, sd); mus.next += sd * (mus.theme === 'menu' && mus.step % 2 === 0 ? 1.16 : mus.theme === 'menu' ? .84 : 1); mus.step = (mus.step + 1) % th.len; }
  }, 30);
}
function setTheme(name) {
  // All music in the arena is intentionally silent. Arena atmosphere comes
  // from crowd beds, mechanics, impacts, the bell and commentary.
  const noMusic = ['menu', 'fight', 'walkout', 'victory', 'defeat'];
  if (mus) mus.want = noMusic.includes(name) ? 'none' : name;
}
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
function chord(t, notes, dur, peak, type, cut, dest) { const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut; f.connect(dest || musicBus); notes.forEach(n => { const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.value = NOTE(n); o.detune.value = (Math.random() - .5) * 10; env(g, t, peak, dur, .02); o.connect(g).connect(f); o.start(t); o.stop(t + dur + .05); }); }
function kick(t, k = 1, d) { tone(t, 120, .3, .55 * k, 'sine', d || musicBus, 38, .002); }
function snare(t, k = 1, d) { noiseHit(t, .16, 1900, .9, .22 * k, 'bandpass', d || musicBus, .002); tone(t, 190, .1, .12 * k, 'triangle', d || musicBus, 120); }
function hat(t, k = 1, open, d) { noiseHit(t, open ? .2 : .04, 8000, .7, .05 * k, 'highpass', d || musicBus, .002); }
function bassN(t, n, dur, k = 1, cut = 600) { const o = AC.createOscillator(), f = AC.createBiquadFilter(), g = AC.createGain(); o.type = 'sawtooth'; o.frequency.value = NOTE(n); f.type = 'lowpass'; f.frequency.value = cut; f.Q.value = 5; env(g, t, .2 * k, dur, .005); o.connect(f).connect(g).connect(musicBus); o.start(t); o.stop(t + dur + .05); tone(t, NOTE(n), dur, .14 * k, 'sine', musicBus); }
const MENU_CH = [[57, 60, 64, 67], [53, 57, 60, 64], [50, 53, 57, 60, 64], [52, 57, 59, 62]], MENU_B = [33, 29, 26, 28];
const MENU_MEL = [76, 0, 0, 74, 0, 72, 0, 0, 69, 0, 0, 0, 72, 0, 74, 0, 0, 0, 72, 0, 69, 0, 67, 0, 69, 0, 0, 0, 0, 0, 0, 0];
const WALK_B = [38, 38, 50, 38, 38, 50, 38, 41, 38, 38, 50, 38, 36, 36, 48, 36];
const VIC_CH = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]], VIC_B = [36, 31, 33, 29];
const BASS = [55, 0, 0, 55, 0, 0, 65.4, 0, 55, 0, 0, 49, 0, 0, 41.2, 0, 55, 0, 0, 55, 0, 0, 65.4, 0, 73.4, 0, 0, 65.4, 0, 0, 58.3, 0];
function playStep(theme, s, t, I, sd) {
  if (theme === 'none' || theme === 'fight') return;
  const b = s % 16, bar = (s / 16 | 0);
  if (theme === 'menu') {
    if (b === 0 || b === 10 || (bar % 2 && b === 7)) kick(t, .9);
    if (b === 4 || b === 12) snare(t, .8);
    if (b % 2 === 0) hat(t, b % 4 ? .7 : 1);
    if (b === 0) chord(t, MENU_CH[bar], sd * 15, .05, 'triangle', 1500);
    if (b === 11) chord(t, MENU_CH[bar].slice(1), sd * 3, .035, 'sine', 2200);
    if (b === 0 || b === 6 || b === 10) bassN(t, MENU_B[bar] + (b === 6 ? 12 : b === 10 ? 7 : 0), sd * 3, .8, 380);
    const m = MENU_MEL[s % 32]; if (m && bar >= 2) tone(t, NOTE(m), sd * 3, .04, 'sine', musicBus);
    if (Math.random() < .15) noiseHit(t + Math.random() * sd, .01, 3000, 1, .03, 'highpass', musicBus);
  } else if (theme === 'walkout') {
    const wv = walkStyle(), tr = wv.tr || 0;
    if (wv.half) { if (b === 0 || b === 10) kick(t, 1.1); if (b === 8) { snare(t, 1.2); clap(t, .7); } if (b % 2 === 0) hat(t, .45); }
    else { if (b % 4 === 0) kick(t, 1); if (b === 4 || b === 12) { snare(t, 1); clap(t, .5); } if (wv.pulse) hat(t, b % 2 ? .45 : .8, b % 4 === 2); else if (wv.swing) { if (b % 4 === 0 || b % 4 === 3) hat(t, .7); } else if (b % 4 === 2) hat(t, 1, true); else hat(t, .5); }
    bassN(t, WALK_B[b] + tr + (bar % 2 && b > 11 ? 3 : 0), sd * (wv.half ? 1.6 : .9), 1, 300 + I * 1500);
    if (b === 0 || b === 6 || b === 10) chord(t, [62, 69, 74].map(n => n + tr + (bar % 2 && b === 10 ? -2 : 0)), sd * (b === 10 ? 5 : 3), .045, wv.half ? 'square' : 'sawtooth', 900 + I * 2200);
} else if (theme === 'fight') {
    const d = musicBus;
    // Half-time, low-register industrial score; intensity rises with damage and late-round pressure.
    if (b === 0 || b === 8 || (I > .72 && (b === 6 || b === 14))) kick(t, .9 + I * .12);
    if (b === 4 || b === 12) snare(t, .38 + I * .3);
    if (I > .48 && b % 4 === 2) hat(t, .16 + I * .13);
    const hz = BASS[s % 32];
    if (hz && I > .1) tone(t, hz, .34, .11 + I * .045, 'sine', d, hz * .88, .004);
    if ((b === 0 || b === 8) && I > .32) tone(t, 110 + I * 18, .48, .035 + I * .025, 'triangle', d, 72, .008);
    if (I > .72 && b === 14) noiseHit(t, .1, 850, .45, .045 * I, 'lowpass', d, .008);
  } else if (theme === 'victory') {
    if (b % 4 === 0) kick(t, .9); if (b === 4 || b === 12) snare(t, .9); if (b % 2 === 0) hat(t, .8);
    if (b === 0) chord(t, VIC_CH[bar], sd * 14, .05, 'sawtooth', 2600);
    if (b === 8) chord(t, VIC_CH[bar].map(n => n + 12).slice(0, 3), sd * 6, .03, 'square', 3200);
    if (b % 4 === 0) bassN(t, VIC_B[bar], sd * 3, .9, 700);
  } else if (theme === 'defeat') {
    if (b === 0) chord(t, [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]][bar], sd * 16, .045, 'triangle', 900);
    if (b === 0 || b === 8) bassN(t, [33, 29, 31, 28][bar], sd * 7, .6, 260);
    if (b === 8 && bar % 2) tone(t, NOTE([69, 72][bar >> 1]), sd * 6, .03, 'sine', musicBus);
  }
}
function sting() { crowdLift(.18, 1400); }
function musicIntensity() {
  if (!AC || !mus || !G) return;
  const F = G.F, [a, b] = F.f, minHp = Math.min(a.hp / a.s.hp, b.hp / b.s.hp);
  let I = .25 + (1 - minHp) * .45;
  if (F.phase === 'fight' && F.cfg.roundLen - F.rt < 10) I += .2;
  if (F.round === F.cfg.rounds) I += .1;
  if (F.phase === 'count') I += .25; if (F.phase === 'finisher') I = 1; if (F.phase === 'break') I = .12;
  mus.target = clamp(I, 0, 1);
  crowdLevel(G.hype, true);
}

