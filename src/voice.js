/* ---- voice.js ---- */
/* ---------- recorded booth, ring announcer, referee and captions ---------- */
const CAST = {
  ring: { name: 'Ring announcer', short: 'RING', col: '#f0b20a', rate: .92, pitch: .82, pref: ['Daniel', 'Google UK English Male', 'Microsoft Guy', 'Microsoft Ryan', 'Alex', 'Fred', 'David', 'Arthur', 'Male'] },
  pbp: { name: 'Hank Ruiz', short: 'HANK', col: '#ebe7de', rate: 1.05, pitch: .84, pref: ['Microsoft Andrew', 'Microsoft Christopher', 'Google UK English Male', 'Google US English', 'Aaron', 'Tom', 'Microsoft Mark', 'David', 'Daniel', 'English Male'] },
  color: { name: 'Sparkplug', short: 'SPARKPLUG', col: '#4fe0ff', rate: .99, pitch: .90, pref: ['Microsoft Guy', 'Microsoft Ryan', 'Daniel', 'Google UK English Male', 'Alex', 'Fred', 'Arthur', 'Oliver', 'English Male'] },
  ref: { name: 'Referee unit', short: 'REF', col: '#6cf0a0', rate: 1.08, pitch: .8, pref: ['Fred', 'Microsoft David', 'Google US English', 'Alex', 'Daniel'] },
};
const VOX = { queue: [], cur: null, timer: 0, capTimer: 0, paused: false, seq: 0, eventId: null, generation: 0, audio: null, synthUtterance: null, synthActive: false, voices: [], speechAvailable: typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined', manifest: { schemaVersion: 1, assets: {} }, assetByText: new Map(), assetByFamily: new Map(), activeGroup: null, groupUntil: 0, seen: new Set(), status: 'ready' };
const COMMENTARY_MANIFEST_URL = './audio/commentary/manifest.json';
function updateCommentaryLive() {
  const el = document.getElementById('commentaryLive'); if (!el) return;
  if (curScreen && curScreen !== 'arena') { el.hidden = true; return; }
  const span = el.querySelector('span'), count = VOX.queue.length, active = VOX.cur;
  if (!active && !count) { el.hidden = true; el.classList.remove('live', 'queued'); return; }
  el.hidden = false; el.classList.toggle('live', !!active); el.classList.toggle('queued', !active && count > 0);
  const mode = VOX.status === 'text-only' ? 'TEXT ONLY' : VOX.status === 'system-voice' ? 'SYSTEM VOICE' : VOX.status === 'starting' ? 'STARTING' : 'ON AIR';
  span.textContent = active ? `${mode} · ${CAST[active.who].short}${count ? ` · ${count} QUEUED` : ''}` : `QUEUED · ${count}`;
}
function setVoiceStatus(status) { VOX.status = status; if (document.documentElement) document.documentElement.dataset.voiceStatus = status; updateCommentaryLive(); }
function installCommentaryManifest(m) {
  if (!m || m.schemaVersion !== 1 || !m.assets || typeof m.assets !== 'object') throw new Error('invalid manifest');
  VOX.manifest = m;
  VOX.assetByText = new Map();
  VOX.assetByFamily = new Map();
  for (const [manifestKey, asset] of Object.entries(m.assets)) {
    if (!asset || !asset.src || typeof asset.text !== 'string' || !asset.speaker) continue;
    const key = asset.speaker + '\u0000' + normLine(asset.text);
    if (!VOX.assetByText.has(key)) VOX.assetByText.set(key, []);
    VOX.assetByText.get(key).push(asset);
    const family = manifestKey.match(/(?:^|\.)(hank|sparkplug)_(.+)_\d+$/);
    if (family) {
      const speaker = family[1] === 'hank' ? 'pbp' : 'color', familyKey = `${speaker}.${family[2]}`;
      if (!VOX.assetByFamily.has(familyKey)) VOX.assetByFamily.set(familyKey, []);
      VOX.assetByFamily.get(familyKey).push(asset);
    }
  }
}
function embeddedCommentaryManifest() {
  const node = document.getElementById('commentaryManifestData');
  if (!node) throw new Error('embedded manifest missing');
  installCommentaryManifest(JSON.parse(node.textContent || '{}'));
}
function loadCommentaryManifest() {
  if (!/^https?:$/.test(location.protocol) || typeof fetch !== 'function') {
    try { embeddedCommentaryManifest(); } catch (e) { VOX.manifest = { schemaVersion: 1, assets: {} }; VOX.assetByText = new Map(); }
    return;
  }
  fetch(COMMENTARY_MANIFEST_URL, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('manifest missing'); return r.json(); }).then(installCommentaryManifest).catch(() => {
    try { embeddedCommentaryManifest(); } catch (e) { VOX.manifest = { schemaVersion: 1, assets: {} }; VOX.assetByText = new Map(); }
  });
}
loadCommentaryManifest();
function autoSystemVoice(who) {
  if (!VOX.voices.length) return null;
  const config = CAST[who], saved = S.voicePrefs && S.voicePrefs[who];
  return VOX.voices.find(v => (v.voiceURI || v.name) === saved) || VOX.voices.find(v => config.pref.some(name => v.name.toLowerCase().includes(name.toLowerCase()))) || VOX.voices[0];
}
function loadSystemVoices() {
  if (!VOX.speechAvailable) return;
  let voices = []; try { voices = speechSynthesis.getVoices() || []; } catch (e) {}
  const english = voices.filter(v => /^en(?:-|_)/i.test(v.lang)); VOX.voices = english.length ? english : voices;
  for (const who of Object.keys(CAST)) CAST[who].systemVoice = autoSystemVoice(who);
  if ((!S.voicePrefs || !S.voicePrefs.color) && CAST.color.systemVoice === CAST.pbp.systemVoice && VOX.voices.length > 1) {
    CAST.color.systemVoice = VOX.voices.find(v => v !== CAST.pbp.systemVoice && CAST.color.pref.some(n => v.name.toLowerCase().includes(n.toLowerCase()))) || VOX.voices.find(v => v !== CAST.pbp.systemVoice) || CAST.color.systemVoice;
  }
  if (curScreen === 'settings' && !document.activeElement?.matches('[data-cast-voice]')) renderSettings();
}
if (VOX.speechAvailable) { loadSystemVoices(); try { speechSynthesis.addEventListener('voiceschanged', loadSystemVoices); } catch (e) {} }
const capEl = () => document.getElementById('caption');
function showCap(who, text, mode = 'ON AIR') {
  const el = capEl(); if (!el) return; clearTimeout(VOX.capTimer);
  if (!S.opt.subtitles) { el.hidden = true; return; }
  const c = CAST[who], b = el.querySelector('b'), span = el.querySelector('span'), i = el.querySelector('i');
  b.style.color = c.col; b.textContent = c.short; span.textContent = text; i.textContent = mode;
  el.hidden = false; el.classList.remove('in'); void el.offsetWidth; el.classList.add('in');
}
function hideCap(delay = 350) { clearTimeout(VOX.capTimer); VOX.capTimer = setTimeout(() => { const el = capEl(); if (el) el.hidden = true; }, delay); }
const voiceOn = who => S.opt.voice > 0 && (who === 'ring' || who === 'ref' ? S.opt.announcer : S.opt.commentary);
function rememberEvent(key) {
  if (!key) return true;
  if (VOX.seen.has(key)) return false;
  VOX.seen.add(key); if (VOX.seen.size > 300) VOX.seen.delete(VOX.seen.values().next().value);
  return true;
}
function orderQueue() { VOX.queue.sort((a, b) => b.pri - a.pri || a.seq - b.seq); }
/* Priority orders queued calls; an already-playing sentence is never cut off by a new event. */
function say(who, text, pri = 1, opts = {}) {
  if (!text) return;
  if (who === 'pbp' || who === 'color') {
    const nt = normLine(text); if (!VOX.said) VOX.said = new Set();
    if (VOX.said.has(nt) || (VOX.cur && normLine(VOX.cur.text) === nt) || VOX.queue.some(q => normLine(q.text) === nt)) return;
    VOX.said.add(nt);
  }
  if (who !== 'ring' && who !== 'ref' && !S.opt.commentary) return;
  if ((who === 'ring' || who === 'ref') && !S.opt.announcer && !S.opt.subtitles) return;
  const now = performance.now(), eventKey = opts.eventId || VOX.eventId, dedupeKey = eventKey ? `${eventKey}:${who}:${opts.assetKey || text}` : '';
  if (!rememberEvent(dedupeKey)) return;
  const item = { who, text, pri, seq: ++VOX.seq, exp: now + (opts.ttl || (pri >= 3 ? 18000 : pri === 2 ? 4200 : 3000)), cb: opts.cb, assetKey: opts.assetKey || '', group: opts.group || '', lock: !!opts.lock, groupHoldMs: opts.groupHoldMs || 0, captionOnly: false, tts: !!opts.tts };
  const lockedBySequence = VOX.cur && VOX.cur.lock && item.group !== VOX.cur.group;
  if (lockedBySequence) { VOX.queue.push(item); orderQueue(); }
  else {
    if (pri >= 2) VOX.queue = VOX.queue.filter(q => q.lock || q.pri > pri || (item.group && q.group === item.group));
    VOX.queue.push(item); orderQueue();
  }
  if (VOX.queue.length > 5) { const ix = VOX.queue.map((q, i) => ({ q, i })).filter(x => !x.q.lock).sort((a, b) => a.q.pri - b.q.pri || b.q.seq - a.q.seq)[0]?.i; if (ix != null) VOX.queue.splice(ix, 1); }
  updateCommentaryLive();
  if (!VOX.cur) nextLine();
}
function stopSpeech() { clearTimeout(VOX.timer); VOX.cur = null; VOX.generation++; if (VOX.audio) { VOX.audio.onplay = VOX.audio.onended = VOX.audio.onerror = null; try { VOX.audio.pause(); VOX.audio.currentTime = 0; } catch (e) {} VOX.audio = null; } if (VOX.speechAvailable && VOX.synthActive) { try { speechSynthesis.cancel(); } catch (e) {} VOX.synthActive = false; VOX.synthUtterance = null; } updateCommentaryLive(); }
function shutUp() { VOX.queue = []; VOX.activeGroup = null; VOX.groupUntil = 0; VOX.eventId = null; stopSpeech(); hideCap(0); duck(false); }
function textFallback(it, done) { it.captionOnly = true; setVoiceStatus('text-only'); showCap(it.who, it.text, 'TEXT ONLY'); VOX.timer = setTimeout(done, 650); }
function playCaptionOnly(it, done) { textFallback(it, done); }
function playSystemVoice(it, done) {
  if (!VOX.speechAvailable || !voiceOn(it.who)) { playCaptionOnly(it, done); return; }
  let utterance, started = false, finished = false;
  const finish = () => { if (finished || VOX.cur !== it) return; finished = true; clearTimeout(VOX.timer); VOX.synthActive = false; VOX.synthUtterance = null; done(); };
  try {
    utterance = new SpeechSynthesisUtterance(it.text);
    const cast = CAST[it.who];
    utterance.voice = cast.systemVoice || autoSystemVoice(it.who) || null;
    utterance.rate = cast.rate; utterance.pitch = cast.pitch; utterance.volume = clamp(S.opt.voice, 0, 1) * boothLevel();
    utterance.onstart = () => { if (VOX.cur !== it) return; started = true; clearTimeout(VOX.timer); setVoiceStatus('system-voice'); showCap(it.who, it.text, 'SYSTEM VOICE'); duck(true); };
    utterance.onend = finish;
    utterance.onerror = () => { if (VOX.cur !== it) return; if (!started) { VOX.synthActive = false; VOX.synthUtterance = null; textFallback(it, done); } else finish(); };
    VOX.synthUtterance = utterance; VOX.synthActive = true; duck(true); speechSynthesis.speak(utterance);
     VOX.timer = setTimeout(() => { if (VOX.cur !== it || started) return; try { speechSynthesis.cancel(); } catch (e) {} VOX.synthActive = false; VOX.synthUtterance = null; textFallback(it, done); }, 5000);
  } catch (e) { VOX.synthActive = false; VOX.synthUtterance = null; playCaptionOnly(it, done); }
}
const normLine = t => String(t || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
function commentaryAsset(it) {
  const keyed = it.assetKey && VOX.manifest.assets && VOX.manifest.assets[it.assetKey];
  if (keyed && keyed.src && keyed.speaker === it.who && (normLine(keyed.text) === normLine(it.text) || it.assetKey.startsWith('ring.name.'))) return keyed;
  const matches = VOX.assetByText.get(it.who + '\u0000' + normLine(it.text)) || [];
  if (matches.length) return matches[Math.random() * matches.length | 0];
  // Only a recording that says exactly this line may play. Anything else is shown as text, so the
  // audio never names the wrong bots, record or round.
  return null;
  const familyKey = it.assetKey && it.assetKey.startsWith(`${it.who}.`) ? it.assetKey : '';
  // The only installed round-start recordings say "Round 1". Never let one be reused for later rounds.
  const spokenRound = Number((it.text.match(/\bround\s+(\d+)\b/i) || [])[1] || 0);
  if (familyKey === 'pbp.round' && spokenRound > 1) return null;
  const candidates = familyKey ? VOX.assetByFamily.get(familyKey) || [] : [];
  if (!candidates.length) return null;
  const line = it.text.toLocaleLowerCase();
  const participants = new Set(G && G.F ? G.F.f.map(f => f.spec.name.toLocaleLowerCase()) : []);
  const lineNames = ROSTER.filter(bot => line.includes(bot.name.toLocaleLowerCase())).map(bot => bot.name.toLocaleLowerCase());
  const safe = candidates.filter(asset => {
    const spoken = String(asset.text || '').toLocaleLowerCase();
    const spokenNames = ROSTER.filter(bot => spoken.includes(bot.name.toLocaleLowerCase())).map(bot => bot.name.toLocaleLowerCase());
    if (!spokenNames.length) return true;
    if (!spokenNames.every(name => participants.has(name))) return false;
    return spokenNames.length === lineNames.length && spokenNames.every(name => lineNames.includes(name));
  });
  // Choose a genuinely reusable line before a matchup-specific one so the same
  // robot names are not overrepresented just because a clip happened to load.
  const generic = safe.filter(asset => !ROSTER.some(bot => String(asset.text || '').toLocaleLowerCase().includes(bot.name.toLocaleLowerCase())));
  const pool = generic.length ? generic : safe;
  if (pool.length) return pool[Math.random() * pool.length | 0];
  // Keep booth playback on the recorded cast when an event has no dedicated
  // family clip or its matchup-specific versions do not fit.
  const fallbackKey = it.who === 'pbp' ? 'pbp.idle' : it.who === 'color' ? 'color.idleColor' : '';
  const fallback = fallbackKey ? VOX.assetByFamily.get(fallbackKey) || [] : [];
  return fallback.length ? fallback[Math.random() * fallback.length | 0] : null;
}
function playClip(it, done) {
  const asset = commentaryAsset(it);
  if (!voiceOn(it.who)) { playCaptionOnly(it, done); return; }
  if (!asset || !asset.src || asset.speaker !== it.who || typeof Audio !== 'function') { playCaptionOnly(it, done); return; }
  let audio, started = false;
  try { const url = new URL(asset.src, document.baseURI); audio = new Audio(url.href); } catch (e) { playCaptionOnly(it, done); return; }
  const fallbackToCaption = () => {
    if (VOX.cur !== it || started) return;
    started = true; clearTimeout(VOX.timer);
    audio.onplay = audio.onended = audio.onerror = null;
    if (VOX.audio === audio) VOX.audio = null;
    try { audio.pause(); } catch (e) {}
    playCaptionOnly(it, done);
  };
  VOX.audio = audio; audio.preload = 'auto'; audio.volume = clamp(S.opt.voice, 0, 1) * boothLevel();
  try { audio.load(); } catch (e) {}
  audio.onplay = () => { if (VOX.cur !== it) { audio.pause(); return; } started = true; clearTimeout(VOX.timer); setVoiceStatus('on-air'); showCap(it.who, asset.text || it.text, 'ON AIR'); duck(true); };
  audio.onended = () => { VOX.audio = null; done(); };
  audio.onerror = () => { if (VOX.cur !== it) return; if (!started) fallbackToCaption(); else { VOX.audio = null; done(); } };
  audio.play().catch(fallbackToCaption);
  VOX.timer = setTimeout(fallbackToCaption, 8000);
}
function nextLine() {
  clearTimeout(VOX.timer); VOX.cur = null;
  if (VOX.paused) return;
  const now = performance.now(); VOX.queue = VOX.queue.filter(q => q.exp > now);
  if (VOX.activeGroup && VOX.groupUntil > now) {
    const ix = VOX.queue.findIndex(q => q.group === VOX.activeGroup);
    if (ix < 0) { VOX.timer = setTimeout(nextLine, Math.min(260, VOX.groupUntil - now)); return; }
    const [it] = VOX.queue.splice(ix, 1); startLine(it, now); return;
  }
  VOX.activeGroup = null; VOX.groupUntil = 0; orderQueue();
  const it = VOX.queue.shift(); if (!it) { hideCap(VOX.status === 'text-only' ? 1600 : 350); duck(false); setVoiceStatus('ready'); updateCommentaryLive(); return; }
  startLine(it, now); updateCommentaryLive();
}
/* ---- the referee count: fired by the sim's count event on its own channel, never queued, so voice, number and caption stay together ---- */
const refClips = {}; let refClipNow = null, refBoothTimer = 0;
const boothLevel = () => (performance.now() < (VOX.refUntil || 0) ? .35 : 1);
function primeRefCount() { if (typeof Audio !== 'function') return; for (let n = 1; n <= 10; n++) { if (refClips[n]) continue; const asset = commentaryAsset({ who: 'ref', text: NUMW[n], assetKey: `ref.count.${n}` }); if (!asset || !asset.src || asset.speaker !== 'ref') continue; try { const a = new Audio(new URL(asset.src, document.baseURI).href); a.preload = 'auto'; a.load(); refClips[n] = a; } catch (e) {} } }
function stopRefCount() { clearTimeout(refBoothTimer); VOX.refUntil = 0; if (refClipNow) { try { refClipNow.pause(); } catch (e) {} refClipNow = null; } if (VOX.audio) VOX.audio.volume = clamp(S.opt.voice, 0, 1); }
function playRefCount(n) {
  const text = NUMW[n] || String(n); VOX.refUntil = performance.now() + 1100;
  if (VOX.audio) VOX.audio.volume = clamp(S.opt.voice, 0, 1) * boothLevel();
  clearTimeout(refBoothTimer); refBoothTimer = setTimeout(() => { if (VOX.audio && boothLevel() === 1) VOX.audio.volume = clamp(S.opt.voice, 0, 1); }, 1120);
  showCap('ref', text, 'ON AIR'); if (!VOX.cur) hideCap(800);
  if (refClipNow) { try { refClipNow.pause(); } catch (e) {} refClipNow = null; }
  if (!voiceOn('ref')) return; primeRefCount(); const a = refClips[n]; if (!a) return;
  a.volume = clamp(S.opt.voice, 0, 1); try { a.currentTime = 0; } catch (e) {} refClipNow = a; a.play().catch(() => {});
}
function startLine(it, now) {
  VOX.cur = it; it.startedAt = now; if (it.group) { VOX.activeGroup = it.group; VOX.groupUntil = Math.max(VOX.groupUntil, now + it.groupHoldMs); }
  setVoiceStatus('starting');
  let finished = false;
  const done = () => { if (finished || VOX.cur !== it) return; finished = true; clearTimeout(VOX.timer); if (it.cb) try { it.cb(); } catch (e) {} if (it.group && it.groupHoldMs) VOX.groupUntil = Math.max(VOX.groupUntil, performance.now() + it.groupHoldMs); const left = it.who === 'ref' ? 30 : it.captionOnly ? 30 : 85; VOX.timer = setTimeout(nextLine, left); };
  playClip(it, done);
}
function pauseVoice(p) { VOX.paused = p; if (p) { stopRefCount(); VOX.queue = []; VOX.activeGroup = null; VOX.groupUntil = 0; stopSpeech(); hideCap(0); } else if (!VOX.cur) nextLine(); }

/* ---------- the booth: Hank Ruiz (play-by-play) and Sparkplug (retired fighting robot, colour) ---------- */
const bagState = {}, lastPick = {};
function pickLine(key, list) {
  let bag = bagState[key];
  if (!bag || !bag.length) {
    bag = list.map((_, i) => i);
    for (let i = bag.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [bag[i], bag[j]] = [bag[j], bag[i]]; }
    if (bag.length > 1 && bag[bag.length - 1] === lastPick[key]) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    bagState[key] = bag;
  }
  const ix = bag.pop(); lastPick[key] = ix; return list[ix];
}
const fill = (s, c) => s.replace(/\{(\w+)\}/g, (_, k) => c[k] != null ? c[k] : '');
const LINES = {
  open: ["Good evening from {venue}. {a} and {b}, {rounds} rounds, and this crowd is already on its feet.", "We are live at {venue}, where {crowd} came out to watch {a} take on {b}.", "Welcome to {venue}. Tonight's main event is {a} against {b}."],
  openColor: ["The noise is already up, Hank. That first clean exchange is going to tell us a lot.", "Look at the posture in both corners. Nobody wants to give away the center of the ring.", "The lights are hot, the crowd is ready, and both machines look settled. Now we find out who can execute."],
  underdog: ["This is the story of the circuit, Sparkplug. A garage build against {brand} factory steel.", "{gb} was welded together in a garage. {fac} rolled off a {brand} assembly line.", "Money against grit tonight. {fac} cost more than this whole neighborhood."],
  underdogColor: ["Factory bots have never been hungry, Hank. Garage bots are always hungry.", "I was a garage bot. You learn to take a punch when you can't afford armor.", "Price tag doesn't block punches. Trust me, I checked."],
  rematch: ["These two have met before. {last}", "There is history here. {last}"],
  round: ["Round {n}. Fresh welds, same grudge.", "Here we go, round {n}.", "Round {n} is under way."],
  final: ["Final round! Everything they have left goes into these {len} seconds.", "This is it, the last round. Somebody has to empty the tank."],
  bigHead: ["Big shot to the head by {a}!", "{a} snaps {b}'s head back!", "Clean! {a} lands right on the sensor array.", "{b} eats that one flush!", "Oh, that rattled {b}'s optics!"],
  bigBody: ["{a} digs to the body!", "Right in the battery housing from {a}!", "{a} goes downstairs and {b} feels it.", "That body shot echoed through the whole building."],
  hay: ["HAYMAKER! {a} lands the big one!", "{a} unloads the haymaker and it connects!", "Oh! That haymaker could have knocked the paint off a bridge!"],
  hayColor: ["That was power through the target, Hank. The question now is whether {b} can answer before the pressure builds.", "A clean haymaker changes the whole exchange. {b} has to get the guard back in place.", "That shot landed with the kind of force that makes a corner rethink its plan."],
  crit: ["Critical hit! {a} found the gap in the armor!", "Right through the seam! Critical from {a}!", "That one found the opening. {b} took a clean shot to the {target}."],
  critColor: ["That is the detail to watch now: {read}", "A clean opening like that can swing momentum. {read}", "The damage is real, but {b} is still in this. Watch the next exchange."],
  sig: ["There it is, {sig}! {a} lands the signature!", "{sig}! That is what {a} is known for!", "The signature connects! {a} timed that perfectly."],
  sigColor: ["That timing was sharp, Hank. {read}", "You could see {a} wait for the opening, and then the signature landed."],
  sigMiss: ["{b} read the {sig} and slipped it!", "{sig} misses! {b} saw it coming a mile away.", "Nothing but air on the {sig}!"],
  slipColor: ["Good eyes. Read the shoulder, not the fist.", "That is homework paying off.", "Defense is just offense that waits."],
  feint: ["Feint from {a}, testing {b}'s nerve.", "{a} shows it and pulls it back."],
  dodge: ["{b} slips it!", "Made {a} miss!", "Beautiful head movement from {b}."],
  blockColor: ["Tight guard. You could hide a toaster behind that guard.", "Arms up, chin down. Textbook.", "Blocking all night is fine until your arms fall off. Literally."],
  combo: ["{a} puts three together in that exchange!", "Combination from {a}, and {b} is covering up!", "Three clean connections in the sequence from {a}!"],
  comboColor: ["That sequence opened up because {read}", "The important part is the follow-through. {a} kept the pressure on without giving {b} a reset."],
  heat: ["{a} is running hot. You can see the vents glowing.", "Watch the heat gauge on {a}. That is overheating territory."],
  malf: ["{a} has a malfunction! {what}!", "Trouble for {a}. {what}!", "Systems are glitching on {a}!"],
  malfColor: ["That is a real problem now. {read}", "The corner will have to adjust quickly; that system is not operating normally.", "That changes the tactical picture. {read}"],
  detach: ["The arm is OFF! {b} has torn {a}'s arm clean away!", "Oh my! {a} is down an arm! Sparks everywhere!"],
  detachColor: ["Is that legal? Apparently that is legal.", "One arm. I have seen bots win with one arm. Not many.", "Somebody grab that arm, they will want it back."],
  offline: ["{a}'s {what} is offline!", "{what} damage on {a}. That changes everything."],
  offlineColor: ["That loss is visible in the way {a} has to move now. {read}", "The remaining systems will have to carry the load. This is a very different fight."],
  down: ["Down goes {b}!", "{b} is down!", "Oh! {b} hits the canvas!"],
  downYou: ["{b} is down!", "Down goes {b}!"],
  kneel: ["{b} is up to a knee, systems flickering.", "{b} props itself up on one arm. The lights are coming back on.", "There is movement from {b}!"],
  rise: ["{b} beats the count at {n}!", "{b} is UP! This crowd cannot believe it!", "Back on its feet at {n}! {b} is not done yet!"],
  riseColor: ["Reboot at {n}. Respect the firmware.", "I always said, the ten count is just a suggestion.", "That bot has a heart. Well, a capacitor. Same thing."],
  secondwind: ["Second wind for {a}! The backup cells kick in!"],
  secondwindColor: ["That is a confirmed surge of power. Now {a} has to turn it into a clean exchange.", "The reserve cells are working, but stamina will still matter in the closing rounds."],
  late: ["Ten seconds left in the round!", "Ten seconds! Big finish from either corner?"],
  bell: ["That is the end of round {n}.", "There's the bell. End of round {n}."],
  bellWin: ["I'd give that round to {a}.", "{a} took that round on my card.", "Clear round for {a}, I think."],
  bellEven: ["Close round. Could go either way.", "Hard round to score. Judges earn their money on that one."],
  comeback: ["And now the tide is turning! {a} is taking over!", "{a} has come all the way back in this fight!"],
  danger: ["{b} is in serious trouble here!", "{b} is hurt, smoke pouring out!", "One more clean shot could finish {b}."],
  ko: ["IT IS ALL OVER! {a} WINS IT!", "That's it! {a} has done it!", "Stop the fight! {a} wins!"],
  counted: ["{b} could not beat the count! {a} wins by knockout!"],
  tko: ["The referee steps in! Technical knockout for {a}!", "That is a TKO! {a} wins!"],
  decision: ["We go to the scorecards. {a} wins by decision, {detail}.", "The judges have it {detail} for {a}!"],
  choose: ["The crowd wants it. Will {a} finish the job?", "Here's the moment. Destroy or spare?"],
  destroy: ["{a} rips the head right off! {b} is scrap metal!", "Oh! That is a full decapitation! The crowd goes crazy!"],
  destroyColor: ["Rest in pieces, {b}.", "And that is why I retired, Hank.", "I'll be taking that head home for the shelf. Kidding. Mostly."],
  spare: ["{a} walks away. Sportsmanship at {venue}.", "{a} spares {b}. The crowd respects it."],
  spareColor: ["Class act. Somebody owes somebody a drink of oil.", "That is a fighter with a code."],
  idle: ["{a} came in {recA}. {b} comes in at {recB}.", "{b} is a {styleB}. Expect {styleTipB}.", "Reach advantage {reachWho} by {reachD} centimeters.", "Weight check: {a} at {wA} kilos, {b} at {wB}.", "{a} runs a {chipA} chip. Interesting choice.", "The {crew} crew in {a}'s corner has the welders ready.", "Watch for the {sigB}. {scoutB}"],
  idleColor: ["Keep your guard up, kids. That's free advice.", "Back in my day we had one punch and it was called the punch.", "I'm watching the battery meters. Somebody is going to fade.", "That footwork is cleaner than my oil filter.", "Ninety percent of this sport is not falling over.", "Hank, how many arms have you lost? Zero? Must be nice."],
  story: ["{name} comes out of {home}. {story}", "A little about {name}: {story}"],
};
const STYLE_TIP = { brawler: 'heavy hooks and haymakers', outboxer: 'a lot of jabs from range', runner: 'movement, and shots from the outside', defensive: 'a tight guard and counters', counter: 'patience, then counters', swarmer: 'non-stop pressure up close' };
const COMM = { t: 0, last: 0, lastIdle: 0, lastByKey: {}, combo: [0, 0], comboT: [0, 0], lead: -1, heatSaid: [0, 0], danger: [0, 0], said: {} };
function commCtx(F, side) {
  const a = F.f[side], b = F.f[1 - side], sp = f => f.spec, rec = f => f.spec.id === 'you' ? `${S.rec.w} and ${S.rec.l}` : (f.spec.rec || 'unknown').replace('–', ' and ');
  const lostB = (b.lost.lead || b.lost.rear) && (b.lost.lead || b.lost.rear);
  const read = b.heat > 70 ? `${b.spec.name}'s heat is climbing` : frac(b, 'head') < .42 ? `${b.spec.name}'s head assembly is badly damaged` : lostB ? `${b.spec.name} is fighting with one arm missing` : b.hp / b.s.hp < .58 ? `${b.spec.name}'s chassis is carrying serious damage` : `the next exchange will show whether ${b.spec.name} can answer`;
  return { a: sp(a).name, b: sp(b).name, venue: VENUES[curVenue].name, crowd: VENUES[curVenue].crowd.replace(/^./, c => c.toLowerCase()), rounds: F.cfg.rounds, len: F.cfg.roundLen, recA: rec(a), recB: rec(b), styleB: STYLES[sp(b).style].name.toLowerCase(), styleTipB: STYLE_TIP[sp(b).style] || 'anything',
    wA: Math.round(a.s.total), wB: Math.round(b.s.total), chipA: TRAITS[a.s.trait].name, crew: a.mech.name.replace(/^the\s+/i, ""), sigB: sp(b).signature ? sp(b).signature.name : 'big one', scoutB: sp(b).signature ? `${b.spec.name} telegraphs it: ${sp(b).signature.tell.toLowerCase().replace(' · ', ', ')}.` : '',
    round: F.round, clock: Math.max(0, Math.ceil(F.rt)), read, target: 'head' };
}
const COMM_COOLDOWN = { chatter: 2600, action: 650, critical: 0 };
function comm(key, F, side, extra, pri = 1, who = 'pbp') {
  if (!S.opt.commentary && !S.opt.subtitles) return;
  const now = performance.now();
  if (pri < 2 && now - COMM.last < COMM_COOLDOWN.chatter) return;
  if (pri < 3 && G && G.F.phase === 'count' && key !== 'kneel' && key !== 'rise') return;
  const perKey = COMM.lastByKey[key] || 0, cooldown = pri >= 3 ? COMM_COOLDOWN.critical : COMM_COOLDOWN.action;
  if (perKey && now - perKey < cooldown) return;
  COMM.last = now; COMM.lastByKey[key] = now;
  const c = { ...commCtx(F, side < 0 ? 0 : side), ...(extra || {}) };
  const openingRound = key === 'round' && Number(c.n) === 1;
  const line = openingRound ? 'Round 1. Fresh welds, same grudge.' : fill(pickLine(key, LINES[key]), c);
  say(who, line, pri, { assetKey: openingRound ? 'voicepack.hank_round_01' : `${who}.${key}`, critical: pri >= 3, ttl: pri >= 3 ? 18000 : pri === 2 ? 5200 : 3800 });
}
/* M4 lines are written without names so one recording covers every fight (see the voice pack script) */
const M4L = {
  titleOpen: ['This one is for a championship belt. Five rounds, and the champion is waiting in the blue corner.', 'Title night. Five rounds, one belt, and the whole league is watching.', 'The belt is sitting on the apron. Somebody walks out of here a champion.'],
  defendOpen: ['The champion is defending tonight. Lose this one, and the belt changes hands.', 'Mandatory defence. The challenger earned this shot, and the champion has to answer it.'],
  titleColor: ['Champions do not hand belts over, Hank. You have to rip it off them.', 'I held a belt once. The first defence is the scariest fight of your life.', 'Five rounds is a long time. Pace wins title fights.'],
  rivalOpen: ['There is real bad blood in this one. These two have history.', 'This is a grudge match, folks. These two do not like each other.', 'Some fights are business. This one is personal.'],
  rivalColor: ['They have been studying tape, Hank. Every habit from last time, they know it now.', 'When it gets personal, bots stop thinking and start swinging. That is dangerous for both of them.'],
  hurtOpen: ['The red corner is not at full strength tonight. You can still see the damage from the last fight.', 'That bot came in banged up. The crew did not finish the repairs.'],
  hurtColor: ['Walking in hurt is a gamble, Hank. One clean shot on the old damage and it is over.', 'I would not fight on half a weld. But that is why I am in the booth.'],
  newChamp: ['And new! We have a new champion!', 'The belt changes hands tonight! A new champion is crowned!'],
  defended: ['And still! The champion keeps the belt!', 'The challenge is answered. The belt stays home.'],
  beltLost: ['The belt is gone. The champion could not hold on.', 'That is the end of the title reign.'],
  grudgeWon: ['That should settle the rivalry. Or start a bigger one.', 'Revenge served. The grudge goes to the red corner.'],
  grudgeLost: ['The rival wins again. This feud is not over.', 'Bad blood, and now a bad night for the red corner.'],
};
const RING_TITLE = ['Ladies and gentlemen, this bout is scheduled for five rounds, and it is for the Scrapyard championship!', 'Ladies and gentlemen, this bout is scheduled for five rounds, and it is for the Underground championship!', 'Ladies and gentlemen, this bout is scheduled for five rounds, and it is for the Regional championship!', 'Ladies and gentlemen, this bout is scheduled for five rounds, and it is for the Pit Championship of the world!'];
const M5L = {
  clinch: ['They are tied up in the clinch.', 'Clinch! Somebody needed a breather.', 'Holding on in there. Smart, if you are hurt.'],
  clinchColor: ['That is veteran stuff, Hank. Tie him up, let the battery catch up.', 'Lean on him, make him carry your weight. Old trick.'],
  scrap: ['Somebody threw scrap into the ring! Watch your footing.', 'There is junk on the canvas now. That is the Scrapyard Lot for you.'],
  puddle: ['The roof is leaking again. There is water on the canvas.', 'A puddle in the ring. Careful where you plant those feet.'],
  fog: ['The fog is rolling in off the harbor. The sensors will struggle in this.', 'Sea fog over the ring. Hard to read punches in this.'],
  heat: ['The furnace just flared. Both bots are running hot now.', 'A blast of heat off the foundry floor. Watch those temperatures.'],
  slipScrap: ['Stepped right on the scrap! Nearly went over.', 'Loose bolts underfoot. That cost some balance.'],
  slipPuddle: ['Sliding through the water! Footing is gone.', 'Right into the puddle. That is a skating rink.'],
};
const COND_LINES = {
  cond_oil: ['{a} is leaking oil all over the canvas!', 'That is an oil line gone on {a}. Watch the footing.', 'Black gold on the mat. {a} has sprung a leak.'],
  cond_gear: ['Something cracked in {a}\'s {part}. You can hear the gears grinding.', 'Broken gear in the {part} for {a}!', '{a}\'s {part} is grinding like a cement mixer.'],
  cond_glitch: ['{a}\'s sensors are glitching. The corner can\'t get through!', 'Static on {a}\'s head screen. That rattled the optics.', 'Sensor glitch for {a}. Calls from the corner are getting scrambled.'],
  cond_leak: ['Coolant leak on {a}. Look at that steam!', '{a} is venting coolant. It\'s going to run hot now.'],
  cond_drain: ['{a}\'s chest lights just dimmed. Power drain!', 'Battery trouble for {a}. The cells aren\'t holding charge.'],
  cond_plating: ['A plate on {a}\'s chassis has worked loose.', 'You can hear that plate rattling on {a}.'],
  cond_stutter: ['{a}\'s {part} has a stutter. The punches are coming late.', 'Servo stutter in the {part} for {a}.'],
  cond_wobble: ['{a}\'s gyros are off. It\'s swaying in its stance.', 'Gyro wobble on {a}. One clean shot could tip it over.'],
  condMax: ['That {cname} is getting worse. {a}\'s crew has to fix it at the bell.', 'The {cname} on {a} is critical now!'],
  callLost: ['The corner is shouting, but {a} can\'t hear a thing.', 'That call never reached {a}. Sensor static.'],
  slick: ['Careful! {a} just stepped in the oil.', 'Skating on the slick! {a} nearly went over.'],
  slickscrap: M5L.slipScrap, slickpuddle: M5L.slipPuddle,
  plate: ['The armour plate is off! {a} is wide open now!', 'There goes a chest plate from {a}!'],
};
function commCond(key, F, side, extra) {
  if (!S.opt.commentary && !S.opt.subtitles) return; const now = performance.now();
  if (now - (COMM.lastByKey[key] || 0) < 9000 || now - COMM.last < 1800 || (G && G.F.phase === 'count')) return;
  COMM.last = now; COMM.lastByKey[key] = now;
  const c = { ...commCtx(F, side < 0 ? 0 : side), ...(extra || {}) }, list = COND_LINES[key]; if (!list) return;
  say('pbp', fill(list[Math.random() * list.length | 0], c), 2, { tts: true, ttl: 5200 });
}
function commColor(key, F, side, extra, chance = .5) {
  if (!S.opt.commentary && !S.opt.subtitles || Math.random() >= chance || (G && G.F.phase === 'count')) return;
  const now = performance.now(), last = COMM.lastByKey[key] || 0; if (last && now - last < 2400) return;
  COMM.lastByKey[key] = now; const c = { ...commCtx(F, side < 0 ? 0 : side), ...(extra || {}) };
  say('color', fill(pickLine(key, LINES[key]), c), 1, { ttl: 5200, assetKey: `color.${key}` });
}
function commIdle(F, dt) {
  COMM.t += dt;
  if (F.phase !== 'fight' || COMM.t - COMM.lastIdle < 11 || performance.now() - COMM.last < 6000 || VOX.cur) return;
  COMM.lastIdle = COMM.t;
  const r = Math.random(), side = Math.random() < .5 ? 0 : 1, a = F.f[side], b = F.f[1 - side];
  if (r < .2 && G.storyLeft && G.storyLeft.length) { const f = G.storyLeft.shift(); say('pbp', fill(pickLine('story', LINES.story), { name: f.spec.name, home: f.spec.home || 'nowhere in particular', story: f.spec.story || f.spec.lore || '' }), 1, { assetKey: 'pbp.story' }); COMM.last = performance.now(); return; }
  // Keep the between-exchange booth alive with the installed generic analyst clips.
  // The Hank idle set names specific bots and otherwise degrades to captions.
  say('color', pickLine('idleColor', LINES.idleColor), 1, { assetKey: 'color.idleColor' }); COMM.last = performance.now();
}

