# Game Concept: Scrapyard Circuit (working title)

*Created: 2026-10-31*
*Status: Draft*

> **Sources.** Seeded from `design/overhaul/overhaul-plan.md` and
> `design/overhaul/world-and-roster.md`, then narrowed in `/brainstorm`
> (2026-10-31) to the "Corner Genius" framing. Where this document and the
> overhaul plan disagree, **this document is the scope contract**; the overhaul
> plan remains the long-term vision. Reviewed at gates CD-PILLARS (CONCERNS,
> resolved by amendment), AD-CONCEPT-VISUAL (STRONG), TD-FEASIBILITY (CONCERNS,
> conditions below) and PR-SCOPE (UNREALISTIC for the first MVP proposal;
> this MVP is the producer's revised one).

---

## Elevator Pitch

> It's a robot-boxing manager where your bot fights on its own and you win by
> **reading the fight** — spotting the opening, calling the right shot in the
> window — then training your bot until it can land what you see.

10-second test: "Your robot boxes by itself; you're the corner, calling the
shots." Passes.

---

## Core Identity

| Aspect | Detail |
| ---- | ---- |
| **Genre** | Sports management / tactics, with a real-time watched fight (robot boxing) |
| **Platform** | PC (Windows). Release on itch.io first; Steam later if it lands. Fights are also rendered offline to 9:16 video for a Shorts series |
| **Target Audience** | Strategy-minded mid-core players who like out-thinking an opponent (see Target Player Profile) |
| **Player Count** | Single-player |
| **Session Length** | 30–90 min (one fight ≈ 5–6 min; a session is 3–5 fights plus training) |
| **Monetization** | Premium (pay-what-you-want or low price on itch.io first); none decided beyond that |
| **Estimated Scope** | Large (4–6+ years, solo) for the full vision; the MVP is Medium (7–10 months, solo) — see Scope Tiers |
| **Comparable Titles** | Punch Club; Football Manager (the match engine you watch and influence); Mutant Football League / Blood Bowl coaching layers |

---

## Core Fantasy

**You are the trainer in the corner who sees what the fighter can't.**

Your bot is fast, strong and blind to the big picture. You watch the
opponent's guard sag after its third combo, see a chest plate hanging by one
bolt, hear a shoulder servo grinding hot — and you call it. When the call lands,
it lands because *you* saw it and *you* trained your bot to execute it.

What it offers that nothing else does: the tension of a live fight you cannot
touch directly, where your eye and your preparation are the only weapons.

*Alternatives considered:* "the mechanic who keeps a junk bot alive" (build-first,
"The Garage") and "the promoter of the bay's best fight night" (show-first,
"Fight Night"). Both remain present as flavour — the garage and the broadcast —
but neither is the core fantasy.

---

## Unique Hook

**Like Football Manager's match engine, and also every opening is a visible tell
you have to catch in a one-second window.**

Management games show you numbers after the fact; fighting games make you press
the punch. This game sits between: you watch real-time machines, read real sim
state off their bodies, and act in short windows — but you never throw a punch.
The hook is gameplay, not aesthetics: reading is the skill being tested.

---

## Player Experience Analysis (MDA Framework)

### Target Aesthetics (What the player FEELS)

| Aesthetic | Priority | How We Deliver It |
| ---- | ---- | ---- |
| **Challenge** (obstacle course, mastery) | 1 | Tells with short windows; opponents with distinct tell sets and feints; a skill ceiling in reading, not reflexes |
| **Fantasy** (make-believe, role-playing) | 2 | Being the corner: crew banter, the underdog garage, Ironside as "your uncle's forklift frame" |
| **Expression** (self-expression, creativity) | 3 | Build, paint and train a bot whose habits are yours |
| **Narrative** (drama, story arc) | 4 | Player-driven fight stories (the comeback, the plate that flew), a light Pit-tier arc with the rival Scrapjack |
| **Sensation** (sensory pleasure) | 5 | Painted Steel visuals, impacts, plates flying, crowd |
| **Discovery** (exploration, secrets) | 6 | Learning each opponent's tells and habits |
| **Submission** (relaxation, comfort zone) | N/A | Fights are tense by design |
| **Fellowship** (social connection) | N/A | Single-player; the Shorts audience is outside the game |

### Key Dynamics (Emergent player behaviors)

- Players will **study an opponent** before a fight (tape) and plan which tells to spend calls on.
- Players will **save a call** for the bigger tell rather than spend it on the first one (cooldowns make calls a budget).
- Players will **train toward the calls they trust**, giving their bot a recognisable habit.
- Players will **target damage**: work a cracked plate until it comes off, then call into the exposed region.
- Players will **weigh Destroy vs Spare** by what it costs and pays, not on reflex.

### Core Mechanics (Systems we build)

1. **Deterministic fight sim** (ported from v2): autonomous bots, 60 Hz fixed tick, seeded RNG, fight log of specs + seed + tick-stamped calls.
2. **Tells and corner calls**: tells are real sim states made visible through two channels (pose + a non-animation cue); calls fire inside a window with cooldowns; feints are real but distinguishable.
3. **Training and proficiency**: drills raise per-call proficiency; a correct read always measurably helps, proficiency scales how much.
4. **Readable damage**: plate states per body region and arm loss, each with a visible look and a gameplay effect; welds between rounds.
5. **Garage loop**: parts, purse, repair bill, Destroy/Spare.

---

## Player Motivation Profile

### Primary Psychological Needs Served

| Need | How This Game Satisfies It | Strength |
| ---- | ---- | ---- |
| **Autonomy** (freedom, meaningful choice) | Which tells to spend calls on, what to train, what to repair, Destroy or Spare | Supporting |
| **Competence** (mastery, skill growth) | Reads get sharper; calls you used to miss now land; harder opponents with subtler tells | **Core** |
| **Relatedness** (connection, belonging) | The corner crew, the bot you raised, the rival who's always one fight ahead | Supporting |

### Player Type Appeal (Bartle Taxonomy)

- [x] **Achievers** (goal completion, collection, progression) — How: climb the card to the title; proficiency bars; a record that means something.
- [x] **Explorers** (discovery, understanding systems, finding secrets) — How: learning each opponent's tells, habits and feints; understanding which damage opens which calls.
- [ ] **Socializers** (relationships, cooperation, community) — How: not served in-game; partly served by the Shorts audience.
- [ ] **Killers/Competitors** (domination, PvP, leaderboards) — How: no PvP. Secondary appeal only through beating the champion.

Quantic Foundry framing: primary **Strategy** (planning, thinking ahead) and
**Mastery** (challenge); secondary **Creativity** (custom bot) and **Story**.
**Not for:** players who want direct fighting-game control, or a deep 4X-style
management web.

### Flow State Design

- **Onboarding curve**: Fight 1 (Rustbucket Rex) has one slow, obvious tell (a wild looping haymaker with planted feet) and the crew calls it out loud the first time. Each new opponent introduces one new tell type.
- **Difficulty scaling**: Later opponents have shorter windows, subtler tells and feints, and punish wrong calls.
- **Feedback clarity**: Every call shows a result (landed / read but under-trained / wrong read) in the fight and in a post-fight breakdown.
- **Recovery from failure**: A loss costs scrap and repairs, never progress; rematches are immediate. Failure teaches which tell you missed.

---

## Core Loop

### Moment-to-Moment (30 seconds)

An exchange plays out. The opponent shows a **tell** — a guard sagging after its
combo, a plate hanging by one bolt, a heat-glowing shoulder, planted feet before
a haymaker. You **call it** inside a short window; within a second or two you see
whether your bot executed it. Satisfying because of legibility (the tell is
fair), timing (the window is short), and payoff (a plate flies off; a counter
lands clean).

### Short-Term (5-15 minutes)

One fight: 3 rounds of ~60 s with a 20 s corner break between rounds — choose
what to weld and set the next round's plan. Ends in a result screen: payout,
repair bill, which calls landed, which tells you missed. "One more fight"
starts there.

### Session-Level (30-120 minutes)

3–5 fights with training between them (drills raise call proficiency), buying
parts, and studying the next opponent's tape. Natural stopping point: after a
result. Reason to return: the next opponent's tells are known and you've just
trained the call that beats them.

### Long-Term Progression

Per-call proficiency, a growing parts kit and crews, and a card of opponents
that ends with the Pit title. Done when you're champion of the MVP card; later
tiers extend the climb.

### Retention Hooks

- **Curiosity**: the next opponent's tape; a locked opponent's tells.
- **Investment**: the bot you built and trained; its record; its scars.
- **Social**: the Shorts series (outside the game) — fights you can recognise.
- **Mastery**: the call you keep missing; the champion's feint.

---

## Game Pillars

### Pillar 1: Read the fight

Every opportunity shows up as a visible, fair tell, so a sharper eye wins more.
**Every tell is a real sim state made visible** — never a cosmetic hint the sim
might not back up. Feints are fair when a sharper eye can tell them from the real
thing. This pillar covers **moment-to-moment openings**.

*Design test*: Debating deeper simulation vs a clearer tell? **The clearer tell.**

### Pillar 2: Earned, not given

A call works only as well as training made it; the corner and the garage feed
each other. **A correct read always measurably helps; training scales how much.**

*Design test*: Debating an instant power-up vs a training-gated gain?
**Training-gated** — but never so gated that a correct read does nothing.

### Pillar 3: Damage is information

Every break shows on the bot and changes what it can and can't do. This pillar
covers **lasting body state** (both bots: yours shapes repairs and calls, theirs
shapes targets).

*Design test*: Debating a hidden stat vs a visible state? **Visible state.**

### Pillar 4: Honest fights

A real deterministic sim decides every fight; nothing is scripted, everything is
replayable, every result is real. **Presentation may select and frame, never
alter.**

*Design test*: Debating scripted drama vs the sim's actual result? **The actual
result.** Debating a Shorts cut that implies a different result vs an honest
cut? **The honest cut.**

*Intended tensions*: 1 vs 4 (an honest, noisy sim against fair, legible tells);
2 vs 1 (a perfect read can underperform with an untrained bot — but never zero).

### Anti-Pillars (What This Game Is NOT)

- **NOT a fighting game with direct punch input**: it would turn reading into reflexes (Pillars 1, 2). An optional "Direct Command" mode stays deferred.
- **NOT physics-decided**: Jolt physics is cosmetic (debris, ragdoll flops); the sim alone decides outcomes (Pillar 4).
- **NOT a faction and reputation web in v1**: Makers, Crews, sponsors and Heat are a second game's worth of systems; they stay as setting and tone (scope, Pillar 1 focus).
- **NOT scripted for content, ever**: "what if" Shorts pick from real runs, never fake one (Pillar 4).
- **NOT a loot grind**: no rarity tiers or random drops; progress is training, not drops (Pillar 2).

*Replaced from the overhaul plan's five pillars:* "Every part matters" →
Pillar 3; "Your bot, your corner" → Pillars 1–2; "Every fight is a story" →
Pillar 4; "Real fight, mechanical body" → demoted (realistic biomechanics is the
costliest item and serves feel, not mastery; fights should read like boxing
*logic*); "Scrap vs suits" → setting and tone.

---

## Visual Identity Anchor

**Direction: Painted Steel (lighter production)** — chosen by the author over the
art director's recommended "Signal on Steel" and the "Fight Poster" option.

**Visual rule:** *"Every scratch has a story."* Stylized realism: real materials
and lighting, slightly exaggerated proportions, hand-finished-looking wear.
Premium animated feature meets industrial photography (overhaul-plan §9.1).

**Production scope (lighter):** shared trim-sheet PBR materials with
shader-driven edge wear (curvature or vertex-colour masks) instead of
hand-painted wear per bot; rigid segmented parts on one shared rig.

**Supporting principles**

1. **Silhouette first.** Oversized forearms, fists and shoulders; compact heads
   with strong "faces". *Test:* every bot is identifiable as a black silhouette at
   200 px tall.
2. **Wear is history, damage is news.** Pre-existing wear must never be confused
   with new damage. *Test:* a freshly cracked or hanging plate reads instantly on
   the most worn Junkline bot.
3. **Light sets the mood, never hides a tell.** Venue key/fill contrast is
   strong, but tell and damage cues stay readable under every lighting preset.
   *Test:* every tell reads in a 1080×1920 frame scaled to ~360 px wide under each
   venue preset.

**Colour philosophy:** colour comes mainly from venue lighting (sodium vs cold
blue in the Yards) and faction liveries; one hero colour + one accent per bot,
and the two corners never share a value range. **Tell and damage signals use
reserved colours/brightness** that no livery or venue light uses; heat reads by
brightness and pulse, not orange hue (Pit 4's sodium light would hide it).
Hazard yellow `#f0b20a` gets one job (decided in `/art-bible`).

**Must-solve in `/art-bible` (from AD-CONCEPT-VISUAL):** wear vs damage contrast;
heat cue under orange venue light; the 360 px phone test; hazard-yellow's single
role; gang asymmetry in large shapes, not greebles (noisy silhouettes hide
hanging plates).

---

## Inspiration and References

| Reference | What We Take From It | What We Do Differently | Why It Matters |
| ---- | ---- | ---- | ---- |
| Football Manager (match engine) | Watching an autonomous match and intervening with instructions | Interventions are timed reads of visible tells, not menu tactics | Validates that watching-and-influencing sustains long sessions |
| Punch Club | Boxing management, training stats, an underdog story | Fights are a real readable sim you act on in real time, not a stat roll | Validates the boxing-management audience |
| Prototype v2 (`Scrapyard Circuit.html`) | The deterministic sim, manager play, corner calls, welds, Destroy/Spare, parts economy | Calls become reads of tells; damage becomes readable; 3D presentation | Our own evidence the loop works; its lessons are in `design/reference/prototype-v2.md` |

**Non-game inspirations**: boxing corner culture (cutmen, trainers shouting
between rounds); broadcast boxing presentation; industrial photography; the
grounded working-class robot-boxing tone (with the original-IP rule in
`world-and-roster.md`: no names, characters, designs or beats from existing
fiction).

---

## Target Player Profile

| Attribute | Detail |
| ---- | ---- |
| **Age range** | 18–40 |
| **Gaming experience** | Mid-core |
| **Time availability** | 30–60 min sessions on weeknights; longer on weekends |
| **Platform preference** | PC |
| **Current games they play** | Football Manager, Punch Club, auto-battlers, tactics games |
| **What they're looking for** | The tension of a live fight decided by their judgement, not their thumbs |
| **What would turn them away** | Fights that feel like dice rolls; calls that don't matter; a grind gate on progress |

---

## Technical Considerations

| Consideration | Assessment |
| ---- | ---- |
| **Recommended Engine** | Godot 4.7 (already pinned and installed; GDScript, Forward+). The author's choice; TD-FEASIBILITY found no engine-level blocker |
| **Key Technical Challenges** | Sim determinism in GDScript (PRNG port with 32-bit masking, no `pow` in state math, pinned patch version, golden replays from day one); sim → presentation contract (per-tick snapshot + typed event stream); first-time 3D rig and animation; Movie Maker offline render (unverified on 4.7) |
| **Art Style** | 3D stylized realism ("Painted Steel", lighter production) |
| **Art Pipeline Complexity** | High (custom 3D in Blender; author has no Blender experience) |
| **Audio Needs** | Moderate (impacts by material, servo whines, crowd; text barks, no voiced commentary in-game) |
| **Networking** | None |
| **Content Volume** | MVP: 1 arena, 4 bots, 4 calls, 4 tell types, 2 drills, ~12 parts, ~12 animation clips; a full card is ~1–2 hours, replayable |
| **Procedural Systems** | None for content. Procedural presentation only (secondary motion, damage dangle) |

---

## Risks and Open Questions

### Design Risks

- **Calls may not feel like they matter.** v2 never measured command value (prototype-v2 flag F5). Mitigation: the Pillar 2 rule (a correct read always helps) and a scripted-coach sweep in the balance harness.
- **Tells may read as quick-time events.** Mitigation: tells come from real sim state, opponents vary, cooldowns make calls a budget, not a prompt.
- **The rise heal and AI Destroy rates from v2** contradict current goals (flags F1, F2). Decide in the combat and finisher GDDs.

### Technical Risks

- **Animation carries gameplay, not just the look** (TD #1). Mitigation: every tell has two channels (pose + non-animation cue); lean into mechanical motion (held poses, hard stops, maker lag) instead of mocap smoothness.
- **Determinism drift.** Mitigation: PRNG parity test against the JS sequence; golden replays in CI from the first sim story; validate the port statistically, not seed-for-seed.
- **Movie Maker on 4.7 is unverified** in the engine reference. Mitigation: a 1–2 day spike (replay a log, render 10 s at 1080×1920, transcode with ffmpeg).
- **Post-cutoff Godot APIs** (IK via `SkeletonModifier3D`, D3D12 default, reworked glow). Mitigation: check `docs/engine-reference/godot/` before every 4.5–4.7 call; fill gaps found in spikes.

### Market Risks

- Robot-boxing management is niche; the Shorts series is the marketing plan and must find an audience.
- Visual comparison to existing robot-boxing fiction. Mitigation: the original-IP rule and a review before any public episode.
- Platform policy (monetization of repetitive content, synthetic-content disclosure). Re-check at the first public episode.

### Scope Risks

- **The author is a first-time developer with no Blender experience, targeting ~6 months at 20–30 h/week.** The producer's MVP estimate is 7–8 months expected (6–10), and zero Blender experience pushes toward the top of that range. **Honest reading: 6 months fits the Minimum tier comfortably; the full MVP likely lands at 8–10 months.**
- **Painted Steel is the costliest art direction offered.** Mitigated by lighter production (trim sheets, shader wear) and a go/no-go art spike.
- **The game UI is unbudgeted hidden work** (garage, shop, training, corner, HUD, save/load, settings).
- **The Shorts series is a second product.** Post devlog Shorts until the fight is presentable; build the fight-to-Short pipeline after the core loop is fun.

### Open Questions

- **Is reading tells fun with calls on cooldowns?** → `/prototype` of calls and tells on the ported sim with blockout visuals (2–3 weeks) before any 3D art.
- **Can a first-timer reach Painted Steel at target quality?** → presentation spike (one bot, final rig, ~5 clips, one tell, one material, one camera; 3–4 weeks) with the fallback tier decided before it starts.
- **Should damage persist between fights in the MVP** (instead of, or ahead of, the parts shop)? → `game-designer`, in the damage and economy GDDs.
- **Final game title** → revisit later (e.g. `brand-naming`); "Scrapyard Showdown" (the project folder name) is a candidate.

---

## MVP Definition

**Core hypothesis**: Players find reading visible tells and making timed corner
calls — with training that scales how well calls land — engaging across a
3–5 fight session.

**Required for MVP**:
1. **Deterministic sim** ported from v2: fight log, golden replays, headless bench.
2. **4 corner calls (1 is a feint read) and 4 tell types**, each tell on two channels (pose + non-animation cue).
3. **Training: 2 drills** raising per-call proficiency.
4. **Readable damage: 3 plate states on 4 body regions**, plus arm loss; welds between rounds.
5. **Player bot + 3 opponents** built from **2 makers' kits** on one shared rig with **rigid segmented parts**; **3 styles**.
6. **1 arena (Pit 4)**, **1 broadcast camera + one 9:16 framing**.
7. **~12 animation clips, no IK**; procedural hit reactions.
8. **Garage loop**: small shop (~12 parts), purse, repair bill, Destroy/Spare.
9. **Text barks** (event-driven, context-aware).
10. **Movie Maker render** of logged fights.

**Explicitly NOT in MVP** (defer to later):
- IK (fists and feet) — first add-on once the rigid base ships.
- Active ragdoll; physical debris beyond cosmetic plates.
- Leagues beyond Pit Nights; the 24-bot roster; factions, reputation, sponsors, Heat.
- 12 styles; 8 part slots; internals model; per-plate bolts.
- Auto camera director and instant replays.
- Voiced commentary; Direct Command mode; Scrap Royale; multiplayer.
- Localization (English captions only).

### Scope Tiers (if budget/time shrinks)

Estimates assume solo, first game, 20–30 h/week, no prior Blender experience
(PR-SCOPE, confidence low — no measured velocity yet).

| Tier | Content | Features | Timeline |
| ---- | ---- | ---- | ---- |
| **Minimum shippable** (fallback, and the MVP's base layer) | 1 arena, 3 opponents, rigid parts, no IK | Same sim, calls, tells, welds, Destroy/Spare | ~4 months (3–6) |
| **MVP** | 1 arena, player + 3 opponents, 2 makers, 3 styles | Core loop + training + garage + Movie Maker | 7–8 months expected (6–10; likely 8–10 with no Blender experience) |
| **Vertical Slice / Target** | Pit Nights complete + District venues, 8 styles | + IK, persistent damage across brackets, auto camera director | +8–12 months (~2–2.5 years total) |
| **Full Vision** | 24-bot roster, 4 leagues, 6 venues | Overhaul plan M0–M8: factions, calendar, active ragdoll, full Shorts pipeline | 4–6+ years solo (a long-term direction, not a first-game target) |

**Already cut** from the first MVP proposal, in PR-SCOPE's order: IK, opponents
5→3, the third maker, extra cameras, the fourth style, calls and tells 6→4, the
third drill, plate regions 6→4. **If the MVP still slips**, ship the Minimum
tier: it is built first as the MVP's base layer, so any cut point leaves a
shippable game. **Never cut:** the deterministic sim, tells, corner calls,
Destroy/Spare.

**Conditions from TD-FEASIBILITY:** (1) reconcile `overhaul-plan.md` §4, §8.2,
§8.3 and §15 with this MVP — **done 2026-10-31**: those sections (plus §1
pillars, §13 roadmap and §16 scope-creep row) now carry superseded notes pointing
here, and this document is the scope contract; (2) run the presentation go/no-go spike before any content production, with the
fallback tier chosen in advance.

---

## Next Steps

Prototype-first (the core mechanic — reading tells — is unproven):

- [ ] `/prototype corner-calls-and-tells` — port the v2 sim with blockout visuals; is reading tells fun? (2–3 weeks)
- [ ] PROCEED → `/art-bible` (Painted Steel, lighter; the five must-solve items above)
- [ ] Presentation spike (go/no-go on art tier) and Movie Maker spike
- [ ] `/design-review design/gdd/game-concept.md`
- [ ] `/map-systems` → `/design-system` per system → `/review-all-gdds`
- [ ] `/create-architecture` → `/architecture-decision` (sim–presentation contract, determinism rules, fight-log format) → `/architecture-review`
- [ ] `/gate-check`
- [ ] PIVOT → `/brainstorm` again with what the prototype taught
