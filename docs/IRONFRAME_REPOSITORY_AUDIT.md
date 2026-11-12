# IRONFRAME — Scrapyard Circuit repository audit

Audited against main commit c644bfa36eda41a2883c30415cbf77f8a8de85b7 on 2026-11-12.

## Confirmed architecture

- Static/PWA browser game; all gameplay JavaScript and Canvas 2D drawing are embedded in index.html (5,868 lines).
- README documents no build step, Python static serving, and optional Vercel deployment. Audio, PWA icons, sw.js and manifest.webmanifest are separate.
- Engine time quantum: index.html defines DT = 1 / 60 (near line 838).
- Fight runner: frame(ts) accumulates elapsed requestAnimationFrame time in G.acc and invokes stepFight(F) while G.acc >= DT, up to 8 steps (near lines 4953–4963). Rendering is invoked independently from each animation frame (near line 5013).
- Fighter simulation: mkFighter exposes x, z, dir, st, stT, dur, punch, ph, lost, and related state (near lines 1091–1104).
- Render path: poseFrom(st, ...) and drawRobot(ctx, R) produce the current Canvas character art, called by drawFighter and render (near lines 1917, 2290, 5024–5065).
- Equipment is currently catalogued in PARTS with build slots head, torso, lead, rear, legs, back (near line 859).
- Damage and detachment already exist as simulation/gameplay concepts: f.lost.lead/rear, detach events, spawnDebris(), independent debris physics (near lines 1159–1166, 4786, 4841, 4972).

## Compatibility implications

1. Preserve the entire existing game and PWA unchanged until the 3D sprite proof is visually approved.
2. New production tooling is isolated under /ironframe; npm is only necessary to **build art offline**, not to play the existing game.
3. 60Hz simulation ticks own attack timing. 30fps rendered art normally holds each unique frame for two ticks, but never changes the combat simulation.
4. Distinguish **visual render interpolation** from fixed tick-driven action/frame selection.
5. Existing states (idle, windup, strike, recover, reactions) do not map one-to-one to asset action IDs (idle, forward_move, right_cross, heavy_head_impact). A future adapter will need validated animation triggers and event IDs.
6. Current damage uses "lead" and "rear" while Blender uses anatomical L and R sockets. Map them by actual stance/facing; do not assume "rear" always means right.
7. The game has an x/z depth lane, screen-ground anchors, z scaling and a moving arena camera. Atlases need stable authored ground/pivot coordinates and separate left/right perspective renders. Do not flip asymmetrical sprites as a substitute.
8. The existing "arm torn off" game event removes an arm and spawns debris. The vertical slice tests a *right forearm* detachment, which is more granular than existing gameplay. Its visual preview is NOT permission to update the game's damage topology.
9. The game has several other robot drawing entry points (garage, workshop, menu, portraits). A full integration would need an explicit cross-screen migration plan, not merely a replacement inside the arena render.
10. The static/PWA cache currently caches images; new runtime atlas URLs and versioning would require separate integration and caching review after asset acceptance.

## Unverified or deferred

- No approved production ATOM .blend or visual identity/reference geometry was found in the repository tree.
- No verified production sprite sequence or working 3D rig exists in the repository.
- Browser/device VRAM limits, actual atlas count, and final in-game resolution require profiling with genuine rendered frames.
- Source render events (e.g. precise PUNCH_CONTACT tick) and forearm breakup treatment require art and combat review.
- The existing 48-fighter part system is NOT assumed to be compatible with ATOM's future 14-slot modular model.

## Non-negotiable gates

- NO edits to index.html, sw.js, manifest.webmanifest, combat simulation, audio, or the current robot drawing implementation on this branch.
- NO generated placeholder robot, procedural 2D stand-in, stitched stills, or fake Blender screenshots.
- Asset exporter must reject missing approved model, rig, actions, cameras, sockets, and view layers.
- Build must reject missing, empty, mismatched, or improperly sized PNG sequences.
- Standalone HTML preview must show an honest missing-art state until real art is supplied.
- After the vertical slice passes, prepare a separate reviewed engine-integration PR. Do not merge this branch on the assumption that artwork is complete.

## Proposed integration boundary (future; not implemented here)

simulation fixed tick -> visual action adapter -> versioned manifest -> one or more sprite atlas layers -> Canvas drawImage on existing stage -> optional detached forearm sprite with independent debris motion

The adapter should be keyed by existing fighter states and dispatched combat events, should not own hit detection or damage, and should receive the actual rendered ground location and facing. Freeze and resume rules for hitstop, replays and pause must be signed off before integration.
