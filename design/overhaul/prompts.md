# Scrapyard Circuit — Prompts

Copy-paste prompts for building the overhaul with Claude Code and the installed
**Claude Code Game Studios** skills. Use them in order.

**Before the first prompt**
1. Install **Godot 4.7** (godotengine.org) and **jq** (`winget install jqlang.jq`).
2. In this folder, run `git init` and make a first commit. The studio's hooks and history assume git.
3. Start a **new** Claude Code session in this folder. The studio's hooks, agents and skills only load in a session that starts here.

**Rules that apply to every prompt**
- One phase per session; run `/clear` or start a new session between phases. The studio keeps its memory in `production/session-state/active.md`, not in the chat.
- The studio asks before writing files. Read the drafts — that's where your design decisions live.
- If you get lost, run `/help`.

---

## 0. The master prompt (your original request, upgraded)

Use this as the opening message of the Phase 1 session. It's also a good
standalone brief to give any AI or collaborator.

```text
I'm overhauling my robot-boxing prototype "Scrapyard Circuit" (Scrapyard Circuit.html, Prototype v2)
into a full 3D game AND a YouTube Shorts / Instagram Reels series made from the game's own fights.

Read these first, in full, and treat them as the design seed (draft, open to challenge):
- design/overhaul/overhaul-plan.md   (vision, pillars, systems, art, Shorts pipeline, roadmap)
- design/overhaul/world-and-roster.md (setting, factions, leagues, 24-bot roster, story arc)
- Scrapyard Circuit.html              (the working v2 prototype: deterministic sim, test bench, garage, corner)

What I want, in short:
1. GAME: build-train-coach robot boxing. Tournament ladder from scrapyard Pit Nights → District Circuit
   → FBRBA Regionals → corporate Grand Circuit. Sides: corporate Makers, gang Crews, independents,
   with reputation, sponsor contracts, illegal mods and story branches.
2. BODIES: a fully articulated shared skeleton (19 bones), 8 part slots, removable armor plates with
   material/thickness/angle/bolts, and internals (core, battery, hydraulics, coolant, wiring, gyro,
   sensors). Every part affects the fight. Plates crack, hang by a bolt and fly off; limbs can be
   severed; leaks, fires, seized joints, blind sides. Damage persists between fights.
3. COMBAT: damage from real factors: strike speed, effective mass through the kinetic chain,
   relative velocity, hit location, angle of incidence, plate penetration and absorption, energy
   transmitted to internals, blocking strain, shock, heat, battery sag. Physical balance and
   knockdowns (center of mass vs support, gyro recovery). Real footwork, defense (slips, rolls,
   parries, guards, clinch) and 12 fighting styles with data-driven movesets.
4. MOTION: fluid, real-boxing biomechanics on heavy machines: the kinetic chain, weight transfer,
   guard discipline, rhythm, follow-through, active-ragdoll hit reactions, and per-maker motion
   signatures. This is the #1 quality risk; prove it first.
5. TRAINING: bots learn: proficiency per move, style mastery, trained habits, drills, sparring, tape study.
6. ART: 3D in Godot 4.7, "Painted Steel" stylized realism, readable on a phone, faction visual
   languages, six atmospheric venues, a broadcast-grade camera director and VFX.
7. SHORTS: fights are deterministic and replayable, so each fight log can be re-rendered in 9:16 with
   Godot Movie Maker, cut by a highlight extractor and shot director, captioned with hyperframes and
   packaged with shorts-packaging. Ship the show before the game is finished.

Hard constraints:
- Original IP. Inspired by the feel of grounded robot-boxing fiction, but no names, characters,
  designs, plot beats or gimmicks from any existing film, show or game. Flag anything too close.
- The fight sim stays deterministic and headless-capable. Physics, ragdolls and debris are cosmetic;
  they never decide outcomes.
- Everything content-side is data (parts, plates, moves, styles, bots, rulesets, factions).
- Keep the v2 lessons: no defensive trap mechanics, no single dominant factor, knockdowns must never
  help the downed bot, every player command must measurably help, and exits can't be exploited.
- Balance gets measured with headless sweeps against the targets in overhaul-plan.md §11.
- Scope: the MVP is the Pit Nights vertical slice (overhaul-plan.md §15). Push back if I creep.

How to work with me:
- Follow the studio's collaboration protocol (question → options → decision → draft → approval).
- When something in the plan is weak, contradictory or over-scoped, say so and propose a better
  option instead of just executing it.
- Ask me the open decisions in overhaul-plan.md §18 when they become relevant, with your recommendation.

Start with /start. This is an existing project with a concept (Path C/D). Then route me through
/brainstorm to turn the overhaul plan into design/game-brief.md and design/gdd/game-concept.md.
```

---

## Phase 0 — Setup and capture the prototype

```text
/start
```
When it asks where you are, say: *existing work (a playable HTML prototype)
plus a detailed concept in design/overhaul/*. Then:

```text
/setup-engine godot 4.7
```

```text
/reverse-document design "Scrapyard Circuit.html"
Document the v2 prototype as reference material only (it will not be ported line by line).
Capture: the deterministic sim loop, fight states, damage and knockdown math, corner/weld system,
Destroy/Spare finisher, economy, the test bench, and the balance lessons in design/overhaul/overhaul-plan.md §1.
Save it under design/reference/prototype-v2.md.
```

---

## Phase 1 — Concept, pillars, bibles

Paste the **master prompt** first, then:

```text
/brainstorm robot boxing manager, build-train-coach, scrapyard to corporate championship, 3D, Shorts-first
Seed it with design/overhaul/overhaul-plan.md and design/overhaul/world-and-roster.md instead of
generating unrelated concepts. Stress-test the pillars, challenge anything weak, and ask me the
§18 decisions. Output design/game-brief.md and design/gdd/game-concept.md.
```

```text
/art-bible
Art direction: "Painted Steel" stylized realism from design/overhaul/overhaul-plan.md §9.1.
Must include: phone-readability rules (200 px silhouette test, one hero color + accent, rim light,
eye-lights), the faction visual languages (corporate / gang / independent), per-maker material and
motion signatures, the six venue lighting moods, a VFX language for destruction stages, and the
9:16 framing rules. Produce reference-board descriptions and AI-image-prompt seeds per bot.
```

```text
/team-narrative
Turn design/overhaul/world-and-roster.md into the canon world bible under design/narrative/:
setting, timeline, districts, factions (Makers, Crews, independents, officials), sides/reputation
hooks, leagues, the 24-bot roster plus Ironside, Scrapjack and the corner crews, and the Season 1 arc.
Give each bot: personality quirks visible in the ring, a voice/catchphrase for commentary, a rivalry,
and a 30-second origin-Short outline. Run an originality check against existing robot-fighting fiction.
```

Channel identity (normal skills, not studio skills):

```text
Use the brand-identity and brand-naming skills to define the YouTube/Reels channel for Scrapyard Circuit:
channel name options, logo direction, color palette consistent with the art bible, title-card style,
voice, posting format, and a one-line channel promise.
```

---

## Phase 2 — Systems design

```text
/map-systems
Use the system list and order in design/overhaul/overhaul-plan.md §14. Map the dependencies and
build design/gdd/systems-index.md.
```

Then, **one system per session**, in index order:

```text
/design-system body-model
Source: design/overhaul/overhaul-plan.md §5. Define the 19-bone skeleton, joint/actuator stats
(torque, speed, range, heat, health, type), the 8 part slots with left/right independence,
plates (material, thickness, angle, integrity, bolts, covers) and internals. All formulas,
tuning knobs and acceptance criteria. Data schemas as YAML examples.
```

```text
/design-system damage-model
Source: overhaul-plan.md §6.3–6.5. Specify every formula with variables and ranges: strike speed,
effective mass / kinetic chain, relative velocity, impact energy, hit location with scatter, incidence
angle, penetration threshold, plate integrity and bolt shear, transmission to internals, blocking strain
and guard break, parry, shock, critical locations, fatigue. Include worked examples (a jab on a
chest plate; an overhand on an exposed shoulder) and the destruction state machine with gameplay effects.
Note every lesson from Prototype v2 that this design must not repeat.
```

```text
/design-system footwork-and-balance
Source: overhaul-plan.md §6.1 and §6.4. Ring geometry, distance bands, stance, pivots, cutting off
the ring, ropes and corners, center of mass vs support area, gyro recovery torque, stagger/stumble/
knockdown thresholds, the reboot count and every fight-end condition.
```

```text
/design-system moveset-system
Source: overhaul-plan.md §6.2, §6.6, §6.8. Move data schema, phases, arcs, chain mass, energy/heat,
requirements, league legality, combos and transition windows, feints, all defensive actions with
timing windows, robot specials tied to parts.
```

```text
/design-system fight-ai
Source: overhaul-plan.md §6.7 and §6.9. Perception with sensor delay/noise and blind spots, utility
scoring, the 12 style profiles with strengths/weaknesses, trained habits, per-round tactics, adaptation
(plus Sovereign's part-targeting "dismantler" logic), personality quirks for named bots, and how corner calls
override behavior. Define how balance sweeps will check every style.
```

Continue with the rest of the index (rules-and-officiating, corner-system,
training-system, garage-and-salvage, economy, factions-and-reputation,
tournament-system, story-events, animation-system, camera-director,
destruction-vfx, audio-and-commentary, shorts-pipeline). Use the matching
section of the plan as the source each time. Then:

```text
/review-all-gdds
```
```text
/consistency-check
```
```text
/ux-design hud
Broadcast HUD from overhaul-plan.md §9.5: fighter cards with damage silhouette, battery/heat, round
clock, corner-call dock, commentary captions, tale-of-the-tape card, and the clean Shorts feed variant.
```
```text
/ux-design accessibility
```

---

## Phase 3 — Architecture

```text
/create-architecture
Follow design/overhaul/overhaul-plan.md §4 and §10: a deterministic, headless-capable sim layer
(no scene-tree, physics or rendering dependencies) feeding a cosmetic presentation layer through a
state snapshot + event stream; data-driven content; fight logs and replays; golden-replay determinism
tests; the headless balance harness; the Shorts render path through Godot Movie Maker.
Check every Godot API against docs/engine-reference/godot (4.7; SkeletonModifier3D IK, BoneConstraint3D,
Jolt default, physical bones / active ragdoll).
```

Then one ADR per decision:

```text
/architecture-decision sim-presentation-split-and-determinism
```
```text
/architecture-decision content-data-format (JSON vs .tres for parts, moves, bots, rulesets)
```
```text
/architecture-decision robot-rig-and-modular-parts (shared 19-bone rig, sockets, detachable plates)
```
```text
/architecture-decision animation-stack (authored clips + timing warp + IK + procedural + active ragdoll)
```
```text
/architecture-decision shorts-render-pipeline (fight log → highlights → shot list → Movie Maker 1080x1920 → post)
```
```text
/create-control-manifest
```
```text
/test-setup
```

---

## Phase 4 — "One Great Fight" prototype (the most important milestone)

```text
/prototype --path engine
Goal: prove the overhaul's core promise before anything else. Throwaway-quality code is fine; the
result must look and feel right.

Scope: two bots (Ironside vs Rustbucket Rex) on the shared rig, one arena (Pit 4 greybox with
sodium/blue lighting), 6 moves each (jab, cross, lead hook, rear uppercut, high guard, slip),
footwork in/out/pivot, the deterministic sim core with plates, bolts, one hydraulic arm and a
severable forearm, balance-based knockdown, cosmetic Jolt debris, active-ragdoll hit reactions,
IK fist aiming and foot planting, a basic camera director that pushes in before big hits, hitstop,
sparks, and a replay of the last 4 seconds in slow motion.

Deliverables:
1. A playable scene where the bots fight on their own.
2. A 30-second 1080x1920 clip rendered with Godot Movie Maker from a saved fight log.
3. The same fight log replayed twice with identical sim results (determinism proof).
4. A debug overlay: hit capsules, center of mass, support area, hit vectors.

Use the blender-3d-modeling and blender-scripting skills (Blender MCP) for placeholder modular robot
meshes with separate plate meshes. Judge it against the art bible's motion quality bar and give me a
PROCEED / PIVOT / KILL verdict with reasons and screenshots.
```

Supporting prompts if the motion isn't fluid enough:

```text
Use the technical-artist and godot-specialist agents to diagnose why the punches look stiff.
Compare against the biomechanics checklist in overhaul-plan.md §8.1 point by point: ground-up
kinetic chain, hip load before hooks, guard hand staying home, rhythm break before punches,
follow-through vs recoil, overlap between combo moves. Fix the worst three and show before/after clips.
```

---

## Phase 5 — Shorts pipeline MVP (start posting here)

```text
Build the Shorts pipeline from design/gdd/shorts-pipeline.md (overhaul-plan.md §12) as tools in
src/tools/shorts/:
1. Highlight extractor: score each tick window from the fight log (damage spikes, detachments,
   knockdowns, comebacks, finisher choices, crowd hype); output a ranked moment list.
2. Shot director: turn moments into a 30–60 s vertical shot list following the beat sheet
   (hook 0–2 s, tale of the tape, escalation, one slow-mo replay, climax, cliffhanger).
3. Render driver: replay the log in Godot Movie Maker at 1080x1920 60 fps following the shot list,
   with captions safe zones respected.
4. A manifest for post-production: timestamps for title card, lower-thirds, captions and the end card.
Verify with one full episode end to end and show me the rendered file.
```

Post-production for each episode (normal skills):

```text
Use the hyperframes skills to finish episode <N> of Scrapyard Circuit from
<path to rendered clip> and <path to manifest>: animated title hook, tale-of-the-tape card in the
art-bible style, bold captions, lower-thirds with bot names and records, a "Destroy or Spare?" comment
prompt and the end card. Vertical 1080x1920. Original or generated music only.
```

```text
Use the shorts-packaging skill for episode <N>: <one-line summary of the fight and the story beat>.
Give me 5 title options, description, hashtags, pinned comment with the fan vote, and the best
thumbnail frame timestamp from the manifest.
```

---

## Phase 6 — Vertical slice: Pit Nights

```text
/vertical-slice
Scope from design/overhaul/overhaul-plan.md §15 (MVP): Pit 4 arena, Ironside + the 6 Pit Nights bots,
8 part slots with 3 makers' parts, plates and internals, 6 styles, ~25 moves, Pit ruleset, corner
calls and between-round repairs, training (heavy bag, mitts, sparring), salvage, Destroy/Spare,
persistent damage, a 3-fight Pit Nights run ending in the District invite.
```

```text
/create-epics
```
```text
/create-stories <epic>
```
```text
/sprint-plan
```
Day to day: `/dev-story` → `/story-done` → `/sprint-status`. For big features
use the team skills: `/team-combat`, `/team-level`, `/team-audio`,
`/team-narrative`, `/team-ui`.

Balance after every combat change:

```text
/balance-check
Run the headless sweep: every legal build × every style × the Pit Nights card, plus each corner call
vs autopilot, the ladder curve and the fight-ending mix. Compare against overhaul-plan.md §11 and list
violations with proposed data changes. Don't change code to fix balance; change data.
```

```text
/playtest-report
```

---

## Phase 7 — Production: the rest of the circuit

Per tier (District → Regionals → Grand Circuit):

```text
/team-level <venue> — build the venue from the world bible (lighting moods, crowd, ambient FX, one
interactive element) following the art bible.
```
```text
/team-combat <bot name> — implement the bot from design/narrative: build, style profile, signature
move, quirks, weakness, corner crew. Verify the signature move reads clearly on camera and the
weakness is actually exploitable in headless sims.
```
```text
/team-narrative <arc beat> — implement the story beat as in-game events and as a Shorts episode outline.
```

---

## Phase 8 — Polish and Season 1

```text
/team-polish
```
```text
/perf-profile
```
```text
/soak-test
```
```text
/scope-check
```
```text
/release-checklist
```

---

## Recurring prompts

**New bot (anytime):**
```text
Design and add a new bot to Scrapyard Circuit: <concept>. Check it against the world bible for
originality and faction fit, give it a build, style, signature move, weakness, quirks, corner crew and
a 30 s origin Short outline, add it as data only, and run a balance sweep to place it on the ladder.
```

**Weekly episode:**
```text
Book this week's canon fight from the Season 1 ledger: <matchup and stakes>. Simulate it once with a
fresh seed (canon: the result stands), run the Shorts pipeline, then the hyperframes and
shorts-packaging steps, and update the season ledger with the result.
```

**Fan vote outcome:**
```text
The fans voted <Destroy/Spare / next opponent / part> on episode <N>. Apply it to canon, update the
ledger and reputation, and outline the follow-up episode.
```

**Health check (every milestone):**
```text
/help, then /scope-check, then /balance-check. Summarize where we are against
design/overhaul/overhaul-plan.md §13 and what to cut if we're behind.
```
