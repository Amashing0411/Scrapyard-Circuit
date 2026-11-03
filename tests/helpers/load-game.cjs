'use strict';
// Loads the real game code in Node with a stubbed browser, so fights and formulas can be tested without a window.
const fs = require('fs'), path = require('path'), vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');

function makeStub() {
  const store = new Map();
  const stub = new Proxy(function () {}, {
    get(_, key) {
      if (store.has(key)) return store.get(key);
      if (key === Symbol.toPrimitive) return () => 0;
      if (key === Symbol.iterator) return function* () {};
      if (key === 'then') return undefined;
      if (key === 'length' || key === 'width' || key === 'height' || key === 'clientWidth' || key === 'clientHeight') return 0;
      if (key === 'hidden' || key === 'disabled') return false;
      return makeStub();
    },
    set(_, key, value) { store.set(key, value); return true; },
    apply() { return makeStub(); },
    construct() { return makeStub(); },
    has() { return true; }
  });
  return stub;
}

function seededRandom(seed) {
  let h = seed >>> 0;
  return () => { h = (h + 0x6D2B79F5) >>> 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** The script sources in load order, read from the page's script tags (inline or src). */
function readSources(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8'), dir = path.dirname(htmlPath), sources = [];
  let manifest = '{}', match;
  const tags = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  while ((match = tags.exec(html))) {
    const src = /\bsrc="([^"]+)"/.exec(match[1]);
    if (/application\/json/.test(match[1])) manifest = match[2];
    else if (src) sources.push({ name: src[1], code: fs.readFileSync(path.join(dir, src[1]), 'utf8') });
    else sources.push({ name: path.basename(htmlPath), code: match[2] });
  }
  return { sources, manifest };
}

/** Boots the game once. Returns evaluate(expression), which runs inside the game's own scope. */
function loadGame(htmlPath = path.join(ROOT, 'index.html'), seed = 1234) {
  const { sources, manifest } = readSources(htmlPath);
  const data = new Map();
  const localStorage = { getItem: k => data.has(k) ? data.get(k) : null, setItem: (k, v) => data.set(k, String(v)), removeItem: k => data.delete(k), clear: () => data.clear() };
  const math = {}; for (const key of Object.getOwnPropertyNames(Math)) math[key] = Math[key];
  math.random = seededRandom(seed);
  const doc = makeStub();
  doc.getElementById = id => id === 'commentaryManifestData' ? { textContent: manifest } : makeStub();
  doc.fonts = null;
  const noop = () => 0;
  const sandbox = {
    console, Math: math, JSON, Date, Object, Array, Map, Set, WeakMap, Number, String, Boolean, Symbol, Error, RegExp, Promise, Intl,
    parseInt, parseFloat, isNaN, isFinite, Float32Array, Uint8Array, Uint8ClampedArray, Int16Array, ArrayBuffer,
    document: doc, localStorage, sessionStorage: localStorage,
    navigator: makeStub(), location: makeStub(), history: makeStub(), screen: makeStub(), performance: { now: () => 0 },
    requestAnimationFrame: noop, cancelAnimationFrame: noop, setTimeout: noop, clearTimeout: noop, setInterval: noop, clearInterval: noop, queueMicrotask: noop,
    Audio: makeStub(), Image: makeStub(), AudioContext: makeStub(), OfflineAudioContext: makeStub(), HTMLElement: makeStub(), Path2D: makeStub(), ResizeObserver: makeStub(), MutationObserver: makeStub(), fetch: () => new Promise(() => {}),
    getComputedStyle: () => makeStub(), matchMedia: () => makeStub(), addEventListener: noop, removeEventListener: noop, innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1, btoa: s => s, atob: s => s, CSS: makeStub(), URL, URLSearchParams
  };
  sandbox.window = sandbox; sandbox.self = sandbox; sandbox.globalThis = sandbox;
  const context = vm.createContext(sandbox);
  for (const { name, code } of sources) new vm.Script(code, { filename: name }).runInContext(context);
  return { evaluate: expression => vm.runInContext(expression, context), localStorage };
}

module.exports = { loadGame, readSources, ROOT };
