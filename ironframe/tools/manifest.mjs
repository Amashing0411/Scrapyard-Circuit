// Pure contract used by the packer and test suite; rejects timing and atlas inconsistencies.
export function validateManifest(m) {
  const e = [], fail = (p, s) => e.push(p + ": " + s);
  const obj = x => x !== null && typeof x === "object" && !Array.isArray(x);
  const nonneg = n => Number.isInteger(n) && n >= 0;
  const pos = n => Number.isInteger(n) && n > 0;
  if (!obj(m)) return ["manifest: expected an object"];
  if (m.schemaVersion !== 1) fail("schemaVersion", "must equal 1");
  if (!m.characterId || typeof m.characterId !== "string") fail("characterId", "missing ID");
  if (m.simulationHz !== 60) fail("simulationHz", "must be 60");
  if (!obj(m.canvas) || !pos(m.canvas.width) || !pos(m.canvas.height)) fail("canvas", "invalid canvas dimensions");
  const atlases = new Map();
  if (!Array.isArray(m.atlases)) fail("atlases", "must be an array");
  for (const [i, a] of (m.atlases || []).entries()) {
    if (!a?.id || !a?.image || !pos(a.width) || !pos(a.height)) fail("atlases[" + i + "]", "invalid atlas");
    if (atlases.has(a.id)) fail("atlases[" + i + "]", "duplicate ID");
    atlases.set(a.id, a);
  }
  if (!obj(m.actions) || !Object.keys(m.actions).length) fail("actions", "at least one action required");
  for (const [id, a] of Object.entries(m.actions || {})) {
    const p = "actions." + id;
    if (!obj(a) || !pos(a.durationTicks) || !pos(a.sourceFps) || 60 % a.sourceFps || typeof a.loop !== "boolean") {
      fail(p, "invalid action timing"); continue;
    }
    if (!Array.isArray(a.events)) fail(p, "events must be an array");
    for (const [i, ev] of (a.events || []).entries()) if (!ev || !nonneg(ev.tick) || ev.tick >= a.durationTicks || !ev.type) fail(p + ".events[" + i + "]", "bad tick/type");
    if (!obj(a.facings) || !Object.keys(a.facings).length) fail(p, "facing data missing");
    for (const [facing, f] of Object.entries(a.facings || {})) {
      if (facing !== "left" && facing !== "right") fail(p, "invalid facing " + facing);
      if (!obj(f.states) || !Object.keys(f.states).length) fail(p + "." + facing, "no states");
      for (const [state, s] of Object.entries(f.states || {})) {
        if (!obj(s.layers) || !Object.keys(s.layers).length) {fail(p + "." + state, "no layers"); continue;}
        for (const [layer, frames] of Object.entries(s.layers)) {
          const q = p + "." + facing + "." + state + "." + layer;
          if (!Array.isArray(frames) || !frames.length) {fail(q, "no frames"); continue;}
          let tick = 0;
          for (const [i, fr] of frames.entries()) {
            if (!fr || !pos(fr.holdTicks) || !nonneg(fr.tickStart)) {fail(q + "[" + i + "]", "bad tick"); continue;}
            if (fr.tickStart !== tick) fail(q + "[" + i + "]", "discontinuous tick, expected " + tick);
            tick = fr.tickStart + fr.holdTicks;
            const at = atlases.get(fr.atlasId);
            if (!at) fail(q + "[" + i + "]", "unknown atlas");
            const r = fr.rect;
            if (!obj(r) || !nonneg(r.x) || !nonneg(r.y) || !pos(r.width) || !pos(r.height)) fail(q + "[" + i + "]", "bad atlas rect");
            else if (at && (r.x+r.width > at.width || r.y+r.height > at.height)) fail(q + "[" + i + "]", "atlas overflow");
            if (!obj(fr.trim) || !nonneg(fr.trim.x) || !nonneg(fr.trim.y) || !pos(fr.trim.width) || !pos(fr.trim.height)) fail(q + "[" + i + "]", "bad trim");
            for (const name of ["pivot", "groundAnchor"]) if (!obj(fr[name]) || !Number.isFinite(fr[name].x) || !Number.isFinite(fr[name].y)) fail(q + "[" + i + "]", "missing " + name);
          }
          if (tick !== a.durationTicks) fail(q, "timeline covers " + tick + " ticks, expected " + a.durationTicks);
        }
      }
    }
  }
  return e;
}
