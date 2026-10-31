# Scrapyard Circuit — Overhaul Plan (draft v1)

> **What this is:** the master plan for turning the single-file prototype
> (`Scrapyard Circuit.html`, "Prototype v2") into a 3D robot-boxing game *and* a
> YouTube Shorts / Reels series built from that game.
>
> **Companion files**
> - [world-and-roster.md](world-and-roster.md) — setting, factions, leagues, the 24-bot roster, story arc
> - [prompts.md](prompts.md) — the master prompt and copy-paste prompts for each phase
>
> **How to use it:** don't build from this file directly. Feed it into the studio
> workflow (`/start` → `/brainstorm` → `/art-bible` → `/map-systems` →
> `/design-system` …) so each part becomes a reviewed design doc first. The
> prompts in `prompts.md` do exactly that, in order.

---

## 1. Vision

**One line:** *Build a fighting robot from scrap, train its style, and climb from
a scrapyard pit to the corporate championship — while every plate that flies off
is real, physical and permanent.*

**For the channel:** every fight is decided by a real simulation, not a script,
so every episode is a genuine result. The game makes the show; the show markets
the game.

### Pillars (every feature must serve at least one)

1. **Every part matters.** Damage lands on a specific plate, joint or system,
   and you can see it and feel its effect. No abstract HP bar decides a fight on
   its own.
2. **Real fight, mechanical body.** Boxing that reads like real boxing —
   weight transfer, guard, footwork, counters — performed by machines whose
   motion shows their maker and their damage.
3. **Your bot, your corner.** You don't press punch buttons; you build, train
   and coach. The bot's style is something you raised.
4. **Scrap vs suits.** A world of garages, gangs and corporations where every
   side you take changes what you can build and who wants you gone.
5. **Every fight is a story.** Big moments are staged, framed and replayed
   like a broadcast, and each fight should be clip-able in under 60 seconds.

### What we keep from Prototype v2

The prototype already proved several things. Keep them:
- **The deterministic sim with a fixed 60 Hz tick and seeded RNG**, separate from rendering. This is the foundation of balance testing, replays *and* Shorts.
- **The headless test bench** (hundreds of fights in under a second) and the balance-sweep method (every legal build × every style × the whole card).
- **Manager-style play**: the bot fights on its own, and the player calls corner commands, welds between rounds and chooses Destroy or Spare.
- **The parts economy**: makers, set bonuses, load limit, buy or hire with scrap.
- **Lessons from the v2 balance pass**:
  - Blocking that costs your own arms makes defense a trap.
  - Energy drain dominated every other factor.
  - Knockdowns must never help the bot that gets knocked down.
  - Exits like "Leave fight" and Sandbox need guards so they can't be exploited.
  - Every player command must measurably help.

---

## 2. Key decisions (with reasons)

| Decision | Choice | Why |
|---|---|---|
| **Dimension** | **Full 3D models, "2.5D" fight logic.** Bots move on the ring floor (a 2D plane with facing and circling) with full 3D bodies, and the camera is free and cinematic. | A full 3D physics fight is unbalanceable and non-deterministic. A pure side view can't do the camera work Shorts need. This split gets both. |
| **Engine** | **Godot 4.7** (3D, Forward+ renderer, Jolt physics) | Free and open; the studio template has Godot specialists and pinned 4.7 reference docs. Godot 4.6+ has a full IK stack via `SkeletonModifier3D` and `BoneConstraint3D`. **Movie Maker mode** renders frame-perfect offline video at any resolution, including 1080×1920, regardless of PC speed — ideal for Shorts. Runs headless for balance sims. |
| **Language** | GDScript with static typing (C# only if profiling demands it) | Fastest iteration with Claude; specialist agent exists. |
| **Sim vs presentation** | **The sim is authoritative and deterministic. Physics, ragdolls and debris are cosmetic.** | Same seed + same inputs = same fight, forever. That gives replays, re-rendering a Short from a new angle, headless balance runs and regression tests. Physics never decides a winner. |
| **Player role** | **Manager / corner coach** (as now), with a later optional "Direct Command" mode | Preserves pillar 3, keeps fights autonomous (good for Shorts), and avoids building a twitch fighting game. |
| **Platform** | PC (Windows) first; web or mobile export later only if needed | 3D, a renderer for video, and modding tools are all PC-friendly. |
| **Content strategy** | **Shorts-first.** The fight sim + renderer + one arena + 6 bots ships *as a show* before the full game is done. | It builds the audience during development, validates which bots and moments people love, and makes the game's marketing. |
| **Assets** | Modular kitbash parts made in Blender (Blender MCP + blender skills), on one shared robot skeleton | Parts swap per slot, plates are separate meshes that can detach, and the same rig serves every bot. |

---

## 3. World, factions and sides (summary)

Full detail lives in [world-and-roster.md](world-and-roster.md). In short:

- **Setting:** Ferrum Bay, 2041. Decommissioned labor robots became fighters after the Industrial Retirement Act. Gangs run the pits; corporations run the championship.
- **Factions:** four **Maker corps** (Sabre, Kestrel, Hollis, Volta), five **gang crews** (Rustmouths, Copperline Kings, Tidewater, the Choir, Grey Market), and **independents** (Salvagers' Co-op/Junkline, Veterans' Union, garage crews).
- **Sides system:** reputation tracks (Makers, each Crew, FBRBA, Crowd, Heat), sponsor contracts with rules, gang favors (dives, destroys, smuggling) and story branches.
- **Leagues:** Pit Nights → District Circuit → FBRBA Regionals → Grand Circuit. Each tier has different **rules** (clinch, headbutts, destroy allowed, inspections), which changes which styles and mods are viable.
- **Roster:** 24 rivals, plus the player bot and a recurring rival (Scrapjack), and 6 hireable corner crews.

---

## 4. Fight architecture: two layers

```
 ┌───────────────────────── SIM (deterministic, headless-capable) ───────────────────────┐
 │ 60 Hz tick · seeded RNG · plain data in, events out                                  │
 │ Body model (kinematic skeleton + hit capsules) · Parts/plates/internals state           │
 │ Motion timing (move clips sampled as curves) · Footwork & balance · Damage resolution │
 │ AI brain (style profile + utility scoring + adaptation) · Rules & officiating           │
 │ Output: per-tick state snapshot + event stream (hit, crack, detach, leak, stagger…)    │
 └───────────────────────────────────────────┬───────────────────────────────────────────┘
                                             │ state + events (read-only)
 ┌───────────────────────────────── PRESENTATION (cosmetic) ──────────────────────────────┐
 │ Full skeleton animation + IK + procedural layers + active-ragdoll hit reactions        │
 │ Physical debris (Jolt) · VFX · Dents & decals · Audio · Crowd · Commentary              │
 │ Camera director (broadcast + cinematic + vertical framing) · HUD · Replays             │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
```

**Rules:**
- The sim never reads the presentation. Presentation smooths between sim ticks, but it can never change an outcome.
- A fight log = bot specs + seed + timestamped player commands. Replaying a log reproduces the fight exactly, so you can re-render it, cut highlights or run a regression test.
- Debris physics, ragdoll flops and spark spray can differ between renders, and that's fine. **Where a plate ends up is cosmetic; the fact that it came off is sim truth.**

---

## 5. The articulated body

### 5.1 Standard skeleton (shared by every bot)

```
root ─ pelvis ─ spine_lower ─ spine_upper ─ chest ─ neck ─ head
                                     ├─ clavicle_L ─ upperarm_L ─ forearm_L ─ hand_L
                                     └─ clavicle_R ─ upperarm_R ─ forearm_R ─ hand_R
        pelvis ─ thigh_L ─ shin_L ─ foot_L ─ toe_L
               ─ thigh_R ─ shin_R ─ foot_R ─ toe_R
```

19 bones plus sockets for armor plates, cables, exhausts and lights. Parts are
designed per slot against this rig, so any head fits any torso.

### 5.2 Joints are actuators

Every joint has stats that matter in the fight:

| Stat | Effect |
|---|---|
| **Torque** | Punch power, guard strength, resisting being pushed |
| **Speed** | Wind-up and strike time, guard-return time |
| **Range of motion** | Which moves are possible (a seized elbow can't uppercut) |
| **Heat** | Rises with torque × time; above threshold torque and speed drop; overheat locks the joint briefly |
| **Health** | Damage reduces torque, speed and range; at zero the joint locks or goes limp |
| **Type** | Servo (fast, weak, electrical), hydraulic (strong, slow, can leak), pneumatic (bursty) — set by the part's maker |

### 5.3 Part slots

Expand from 4 slots to **8 part slots + internals**:

| Slot | Examples of what it governs |
|---|---|
| **Head** | Sensors (reaction time, reading feints), sensor mounts, head armor |
| **Neck/gyro** | Balance recovery, "chin" (stun resistance) |
| **Torso core** | Hull frame, power core, battery, cooling, load limit |
| **Shoulders ×2** | Guard strength, punch torque, range |
| **Arms ×2** (upper + forearm) | Power, speed, reach, forearm guard plates |
| **Hands/fists ×2** | Fist mass, knuckle plate, special tools (shock knuckles, clamp hands) |
| **Hips/pelvis** | Rotation power (the kinetic chain), stance width |
| **Legs ×2** | Footwork, stability, lateral speed, kick (Pit only) |

Arms and legs are now **left/right independent**, so a mismatched build (a
heavy Hollis rear arm with a fast Kestrel lead) is a valid choice.

### 5.4 Plates

Every body region has **removable plates**, which are separate meshes and separate sim objects:

| Field | Meaning |
|---|---|
| `material` | Mild steel / hardened steel / titanium / composite / ceramic. Each has hardness, toughness and weight. |
| `thickness`, `angle` | Thicker = more absorption and more weight. Angled plates deflect glancing blows. |
| `integrity` | Plate health. It cracks at 50%, shatters or deforms at 0. |
| `bolts` | Attachment points. Hits shear bolts; at 0 bolts the plate detaches. One bolt left = the plate hangs and flaps (a great visual). |
| `covers` | Which internals it protects, and how much |

Example regions: face plate, crown, jaw guard · chest L/R, abdomen, back ·
pauldrons L/R · upper-arm and forearm guards · knuckle plates · thigh, knee and
shin plates.

### 5.5 Internals (exposed when plates are gone)

Power core, battery cells, main bus wiring, coolant loop, hydraulic lines,
gyro, sensor array, actuators. Each has health and **a specific failure effect** (§6.5).

---

## 6. Combat overhaul

### 6.1 Ring and movement (2.5D)

- The ring is a real square with ropes and corners. Bots have a position (x, z) and a facing angle.
- Footwork: step in/out, lateral step, **pivot** (change angle), circle, **cut off the ring**, **trap in a corner**, back to the ropes (can't retreat → takes more damage, rope rebound).
- Distance bands: **outside** (jab range), **mid** (power-punch range), **inside** (hooks, uppercuts, clinch).
- Stance: orthodox / southpaw / switch. Stance decides which arm is lead or rear and opens angles (open-stance matchups favor the rear hand).

### 6.2 Moves are data

Each move is a data record. The sim samples its timing curves; the presentation plays matching animation.

```yaml
id: rear_overhand
category: power        # jab | power | hook | uppercut | body | special | defense | movement
arm: rear
targets: [head]
range_band: mid
phases:  { windup: 0.34, strike: 0.08, recover: 0.30 }   # seconds at proficiency 50
energy: 18
heat: { shoulder_R: 9, elbow_R: 4, hip: 3 }
chain_mass: 0.55       # how much body mass the kinetic chain adds (0–1)
arc: overhand          # straight | hook | uppercut | overhand → decides incidence angles
requires: { shoulder_R: { rom: 0.8 }, hip: { health: 0.3 } }
legal_in: [pit, district, regional, grand]
tags: [telegraphed, counterable_by_slip_left]
```

### 6.3 Damage model — the factors

Damage is **energy delivered to a specific place**, filtered by armor, and then
turned into **specific effects**.

**1. Strike speed**
`v = move.v_base × arm.speed × torque_avail × proficiency_mod`
- `torque_avail` drops with joint heat, battery voltage sag and joint damage.

**2. Effective mass (the kinetic chain)**
`m_eff = m_fist + 0.35·m_arm + chain_mass × m_body × chain_eff`
- `chain_eff` = feet planted × hip actuator health × stance width × balance. Punching off-balance or while retreating loses most of the body mass.

**3. Relative velocity**
`v_rel = v + max(0, target_approach_speed)`
- Walking into a punch hurts more. That's what makes counters strong.

**4. Impact energy**
`E = ½ · m_eff · v_rel²`

**5. Hit location**
- The sim checks the strike path against the target's hit capsules at the moment of impact.
- The aim point is the intended target, plus scatter from the attacker's sensors and proficiency, plus the target's defensive motion (slip, roll, pull-back move the capsules).
- A punch can miss, graze, or land on a different part than intended.

**6. Angle of incidence**
`E_n = E · cos²θ` (θ = angle between strike and plate normal)
- Glancing blows (θ > 60°) deflect: low damage, and the spark streak shows it.

**7. Plate response**
- **Penetration threshold:** `T = hardness × thickness² × k_material`
- If `E_n > T`: crack or breach, and plate integrity drops sharply.
- Otherwise integrity drops by `E_n × (1 − toughness)`.
- Each hit has a chance to shear a bolt, scaled by energy and by whether it hit near an edge.

**8. Transmission**
`E_t = E_n × (1 − absorption)`
- Energy that gets through the plate goes to the frame, then to the internals under it.
- Weighted, seeded rolls by coverage decide which component takes it.
- **No plate = full transmission.** Exposed internals are where fights end.

**9. Blocking**
- The guard is physical: a forearm capsule in the strike path takes the hit instead.
- The forearm plate takes the damage; the shoulder actuator takes **strain**.
- **Guard break:** if strain exceeds shoulder torque, the guard is knocked aside and the next hit lands clean.
- **Parry** (timed deflection) costs almost nothing and opens a counter window.

**10. Electrical (shock knuckles)**
- Shock damage ignores plate absorption only where metal is exposed or wet.
- It causes voltage sag, sensor glitches and joint twitches.

**11. Critical locations**
- **Neck/gyro ("chin")** → stun or reboot.
- **Power core** → output loss and fire risk.
- **Sensor array** → blind side (slower reactions on one side).
- **Hydraulic manifold** → whole-limb weakness.

**12. Fatigue**
- Battery level, actuator heat and coolant level shape rounds 3+.
- This is where swarmers fade and counter-punchers take over.

All coefficients are **tuning knobs in data files**, and the balance harness
sweeps them (§10).

### 6.4 Balance, stagger and knockdowns (physical, not dice)

- Each bot has a **center of mass** and a **support area** (between its feet).
- A hit adds impulse. The **gyro and leg actuators** apply recovery torque.
- The recoveries escalate:
  1. Small: absorbed.
  2. Medium: a stagger step.
  3. Large: a stumble into the ropes.
  4. Beyond recovery capacity: **knockdown**.
- Leg damage, a hit gyro, a heavy torso on light legs, or getting hit mid-step all make knockdowns likelier.
- **The KO meter is gone.** A fight ends through one of these:

| Ending | Trigger |
|---|---|
| **Core shutdown (KO)** | Power core or main bus failure |
| **Counted out** | Fails to reboot and stand before 10 |
| **TKO — corner** | The crew pulls the plug (the player can choose this to save the bot) |
| **TKO — referee** | Can't defend: both guards broken or arms lost, or too many unanswered shots |
| **TKO — three knockdowns** | Three knockdowns in one round, where the league uses that rule |
| **Disqualification** | Illegal mod found, or illegal move in a sanctioned tier |
| **Decision** | Judges score each round on clean hits, damage dealt, ring control and knockdowns |

### 6.5 Destruction — states and effects

Each stage below has both a look and a gameplay effect.

| What breaks | Visual | Gameplay effect |
|---|---|---|
| Plate dented | Vertex dent, scuffed paint | Integrity down, angle worsens (less deflection) |
| Plate cracked | Crack decal, sparks on every hit | Big integrity loss, more energy gets through |
| Bolts sheared | Bolt heads ping off; plate hangs by one bolt and flaps | Next solid hit takes it off |
| **Plate detached** | Plate flies off as physical debris and stays in the ring | Region exposed; internals take full damage. A plate on the canvas is a **trip hazard** |
| Wiring exposed | Sparking cable bundle | Intermittent twitch or glitch on that limb |
| **Hydraulic line cut** | Fluid spray, then a puddle | That limb gradually weakens; puddles reduce footing (slip chance) |
| Coolant leak | Steam venting | Heat climbs faster |
| Joint misaligned | Limb hangs at an angle; motion becomes jerky | Less range, slower, punches arc wrong |
| Joint seized | Limb locks in pose | That move set is lost; may block reflexively |
| **Limb severed** (wrist, elbow or shoulder) | Arm flies off with cables trailing | One-armed fighting; both gone = TKO |
| Sensor array cracked | Eye lights flicker or go dark | Blind side; feint reads fail |
| Gyro hit | Wobble, over-corrected steps | Knockdowns far likelier |
| Power core breach | Fire, smoke, flickering lights, voltage-sag sound | Output drops; shutdown risk climbs every hit |
| **Decapitation** (finisher or catastrophic hit) | Head torn off, spinning in the air | Sensors lost; instant TKO |

Damage **persists**: what's broken at the final bell is broken in the garage,
and it carries into the next bracket match unless you repair it.

### 6.6 Defense is a real system

- **Guards:** high guard, cross-arm, shoulder roll, peek-a-boo.
- **Head movement:** slip, roll, duck, pull-back.
- **Parry and catch.**
- **Footwork exits:** pivot out, step back, lateral.
- **Clinch:** where the league allows it.

Each defense has a timing window, energy cost and counter opportunities.
Sensors decide how early a bot *reads* an incoming punch. Proficiency decides
how well it *executes* the response.

### 6.7 Fighting styles (12)

A style = an AI profile (how it makes decisions) + a default moveset + style
moves it can learn.

| Style | Plan | Strong against | Weak against |
|---|---|---|---|
| **Brawler** | Trade, walk through shots, haymakers | Out-boxers who can't keep range | Counter-punchers |
| **Slugger** | Few punches, huge power, waits for one clean shot | Volume punchers with thin plates | Movers who out-point it |
| **Swarmer** | Smother inside, hook combos, never stops | Out-boxers, slow heavies | Clinchers, uppercuts, heat buildup |
| **Pressure fighter** | Cut off the ring, body work, attrition | Light movers | Counter-punchers with good feet |
| **Out-boxer** | Jab, range, footwork, points | Brawlers, sluggers | Swarmers, ring-cutters |
| **Boxer-puncher** | All-rounder, adapts per round | Specialists that can't adapt | Nothing hard; masters of one style |
| **Counter-puncher** | Make them miss, punish | Brawlers, swarmers | Patient out-boxers, feints |
| **Shoulder-roll** | Lean back, roll shots off the shoulder, rear-hand counters | Straight punchers | Body work, lead hooks |
| **Peek-a-boo** | Tight guard, bob and weave in, explosive hooks | Long-range jabbers once inside | Uppercuts, tall reach |
| **Switch-hitter** | Changes stance to create angles | Single-pattern AIs | Pressure that doesn't allow resets |
| **Clinch grappler** (Pit/District) | Tie up, short shots, drain battery | Swarmers, long-range bots | Strict rulesets, out-boxers |
| **Tank** | Absorb, grind, win late | Sluggers, glass cannons | Decisions; tape study |

### 6.8 Movesets (starter list)

- **Offense**
  - Jabs: jab, double jab, power jab, body jab, flicker jab.
  - Straights: cross, body cross.
  - Hooks: lead hook, rear hook, check hook, pivot hook, shovel hook, body hook.
  - Others: uppercut (lead/rear), overhand, bolo (feint-heavy), shoulder bump (inside).
- **Feints:** jab feint, shoulder feint, level change.
- **Defense:** high guard, cross-arm guard, shoulder roll, slip L/R, roll under, duck, pull-back, parry, catch, clinch, break clinch.
- **Movement:** step in/out, lateral step, pivot, circle, cut off, back off ropes.
- **Robot specials** (tied to parts):
  - piston jab (extending forearm),
  - spin-hammer (rotating wrist),
  - shock palm (Volta),
  - thruster dash (Kestrel),
  - hydraulic clamp (Tidewater; Pit and District only),
  - headbutt (Pit only),
  - stomp on a downed bot (Pit only, crowd loves it, Heat rises).

**Combos** are short sequences the AI can chain, with **transition windows**.
Training (§7) makes transitions faster and more reliable.

### 6.9 The fight AI ("the brain")

1. **Perception:** what the bot *thinks* it sees. Sensor quality adds delay and noise; damaged sensors create blind spots.
2. **Utility scoring:** for each available action, score expected value from range, energy, heat, opponent state, damage map and round state. Weight the scores by the **style profile** and **habits** (trained weights).
3. **Tactics per round:** the corner instruction plus the bot's game plan ("work the body", "stay outside").
4. **Adaptation:** the bot tracks which of its own moves landed and which of the opponent's got through. It shifts weights between rounds — or within a round for high-sensor bots. Sovereign's AI instead targets the weakest bolts and joints it can see (part-targeting AI).
5. **Personality noise:** each named bot has quirks (Halfmoon taunts, Kiln never leads, Tin Saint waits) so fighters are recognizable on screen.

### 6.10 Rules and officiating per league

- A ruleset is a data record covering: allowed moves, clinch time limit, knockdown rules, three-knockdown rule, inspections, destroy policy, judges' scoring weights, round count and length.
- The referee breaks clinches, counts, warns for illegal moves, deducts points and stops fights.
- In the Pit, the "referee" is a Rustmouth with a bat who doesn't care.

### 6.11 The player's controls

**Before the fight**
- Build, tune and paint the bot.
- Pick the game plan and study the opponent's tape.

**During the fight**
- **Corner calls** (expanding the current four):
  - Head hunt · Body work · Cover up · Haymaker
  - Stay outside · Cut the ring · Go to the body · Tie him up · Switch stance · Throw feints · Protect the left side · Push the pace
- Cooldowns stay, so calls are decisions, not spam.

**Between rounds**
- Corner repairs with your crew: limited welds, plate re-hangs, leak seals, coolant top-ups — a quick choice of what to fix with 20 seconds on the clock.
- A corner speech that sets the next round's game plan.

**After a knockdown or finisher**
- Reboot taps.
- Pull the plug, Destroy or Spare.

**Later — optional "Direct Command" mode**
- Queue specific moves in real time, for players who want more control.
- Never required.

---

## 7. Progression

### 7.1 Training (the bot learns)

- **Proficiency per move** (0–100): faster, more accurate, cheaper in energy, with smoother combo transitions.
- **Style mastery:** unlocks style-specific behaviors, such as a counter-puncher learning parry-counter timing.
- **Habits:** trained AI weights ("this bot doubles the jab", "this bot rolls under hooks"). Habits come from training and from what actually worked in fights.
- **Facilities and drills**, each a short, satisfying mini-sim:

  | Drill | Trains |
  |---|---|
  | Heavy bag | Power, chain efficiency |
  | Speed bag | Hand speed, rhythm |
  | Mitt work (the crew calls combos) | Combos and transitions |
  | Sparring | Decision quality and adaptation; costs wear |
  | Tape study | Opponent-specific counters for the next fight |
  | Calibration bay | Gyro, sensors, balance |
  | Cooling runs | Heat tolerance |

- **Firmware vs muscle memory:** a style chip (bought, or a gang mod) gives access to moves. Only training makes them good.
- Training costs **calendar time and wear**, and each week you choose: train, repair, scout or fight.

### 7.2 Parts, salvage and the garage

- Buy from makers (cheaper with a sponsor). Buy illegal mods from crews (Heat, DQ risk). **Salvage** parts from bots you destroy — this makes Destroy vs Spare a real economic choice.
- Parts have **condition and wear**. Damage persists; repair costs scrap and time.
- **Tuning:** joint gain (speed ↔ torque), cooling priority, battery map, plate thickness swaps.
- **Load and weight class:** total mass sets the class in sanctioned tiers.

### 7.3 Economy and reputation

- **Income:** purses, stoppage and crowd bonuses, sponsor salary, side bets (Crews), salvage sales.
- **Costs:** parts, repairs, crew wages, entry fees, inspection fines, gang cuts.
- **Reputation tracks** (§3) gate contracts, venues and story events.

### 7.4 Tournaments and the calendar

- A season is a calendar of weeks, with fight nights, brackets, a ranking ladder and title shots.
- **Brackets carry damage between rounds** — the corner decides how much to repair overnight.
- **Rivalries:** rematches, grudge matches and title defenses. Scrapjack shows up in every tier.

---

## 8. Motion and animation: "fluid like real fighters"

The prototype's stiff, 2D-limb look is the biggest visual gap. The target:
*real boxing biomechanics, performed by heavy machines.*

### 8.1 Biomechanics to reproduce

- **The kinetic chain:** every power punch starts from the ground — rear foot pivot → hip rotation → torso → shoulder → elbow → fist. Weight shifts forward on crosses; the hips load before hooks.
- **Guard discipline:** the non-punching hand stays home, the lead shoulder protects the chin, and the punch returns along the same line.
- **Rhythm:** idle bounce or sway; weight on the balls of the feet; a constant small rhythm that breaks just before a punch (the "tell" a good sensor reads).
- **Head off the center line** when punching (good technique) — skilled bots do it; poorly trained ones don't.
- **Follow-through and recoil:** a missed punch over-extends; a landed punch decelerates hard; a heavy hit drives the target's body back through the hips, not just the head.
- **Anticipation and overlap:** the next motion starts before the last fully ends (combos flow).

### 8.2 Layered animation stack (presentation)

1. **Authored key poses and clips** per move: windup, strike, recover, at proficiency 50. Made in Blender on the shared rig, using real boxing reference footage (record your own, or use licensed motion capture — check licenses for monetized video).
2. **Timing warp:** each clip is stretched to the sim's actual phase durations (proficiency, heat, damage).
3. **IK layer** (Godot `SkeletonModifier3D` stack):
   - TwoBoneIK aims the fist at the sim's hit point.
   - Feet are planted on the canvas.
   - Look-at keeps the head toward the opponent.
4. **Procedural layer:** hip/torso counter-rotation, weight-shift offsets, breathing and servo idle sway, guard-return springs, plates and cables jiggling with secondary motion.
5. **Hit reactions:** blend into **active ragdoll** (physical bones driven toward the animated pose with limited strength) for a split second on big hits, then recover. On a knockdown, ragdoll fully, then play a stand-up.
6. **Damage overlays:**
   - jittery noise on wiring-damaged limbs,
   - clamped range on misaligned joints,
   - limp chains on severed ones,
   - a dragged leg for leg damage.
7. **Maker motion signatures:**
   - Hollis has hydraulic lag and overshoot.
   - Kestrel is snappy with a spring settle.
   - Volta has micro-twitch bursts.
   - Sabre has minimal overshoot.
   - Junkline is jittery and rattly.

### 8.3 Animation budget (MVP)

- ~40 clips per rig: 12 offense, 10 defense, 8 movement, 6 reactions, 4 knockdown/rise.
- Style differences come from timing, procedural offsets and AI choice, not separate animation sets.
- Signature moves get bespoke clips.

---

## 9. Art direction and presentation

### 9.1 Art style: "Painted Steel"

**Stylized realism.** Real materials and lighting, with slightly exaggerated
proportions and hand-finished wear. Think premium animated feature meets
industrial photography.

**Proportions**
- Oversized forearms, fists and shoulders.
- Compact heads with strong "faces" (visors, grilles, eye-lights).
- Readable at phone size.

**Materials**
- PBR metal with painted edge wear, chipped livery, oil grime and rust bloom on Junkline.
- Factory-clean clearcoat on Sabre.
- Hazard stencils on Hollis.

**Faction language**

| Group | Visual language |
|---|---|
| Corporate | Clean panel lines, logos, symmetric design, pristine paint |
| Gang | Asymmetry, welded scrap, graffiti tags, spikes, mismatched paint, trophies |
| Independent | Practical, hand-painted numbers, duct tape, family names stenciled |

**Readability rules (non-negotiable for Shorts)**
- Silhouette test: each bot is identifiable as a black silhouette at 200 px tall.
- One hero color + one accent per bot; the two corners never share a value range.
- A rim light separates bots from the crowd.
- Eye-lights glow so you can always see where a bot is looking.

**Lighting:** every venue has a strong key/fill contrast — sodium orange vs cold
blue in the Yards, cyan arcs in Copperline, molten orange in Kiln Row, broadcast
white in the Sabre Dome.

**Deliverable:** `/art-bible` turns this into `design/art/art-bible.md`.

### 9.2 Arenas

The six venues in [world-and-roster.md §3](world-and-roster.md). Each needs:
- a ring variant,
- a crowd style,
- ambient FX (rain, arcs, fog, heat shimmer),
- a lighting rig with presets for broadcast and cinematic shots,
- one interactive element (the Pit 4 crane hook swings when the ring is hit; Copperline arcs flash on big impacts).

### 9.3 VFX

- **Sparks:** hot (orange, heavy) vs cold (white, glancing).
- **Metal shards and paint chips; bolts pinging.**
- **Hydraulic spray and puddles; coolant steam.**
- **Electrical arcs; smoke; core fire.**
- **Dents** (shader-driven deformation), scorch and scrape decals.
- **Heat glow** on overworked actuators.
- **Impact frames:** a one- or two-frame flash or invert on the biggest hits.
- **Hitstop:** a brief freeze on heavy hits (already in v2).
- **Camera shake** scaled by energy.
- **Slow-motion** on fight-ending moments.

### 9.4 Camera director

**Shot types**
- Broadcast wide (side, slightly high)
- Mid two-shot
- Over-the-shoulder
- Low hero angle
- Impact close-up
- Overhead count shot
- Corner cam
- Crowd reaction

**Event-driven cutting**
- The director listens to the sim's event stream and scores upcoming moments. Big windups, low-health exchanges, plates about to go and knockdown risk all score high.
- It cuts or pushes in **before** the hit lands. It can do that because the sim knows the windup is coming.

**Instant replays**
- Re-simulate the last few seconds from the log and show them in slow motion from a new angle.

**Vertical (9:16) framing**
- Use 3/4 and over-the-shoulder angles so both bots stack in depth.
- Track the action point (the impact location), not the ring center.
- Keep safe zones clear for captions and platform UI.

### 9.5 Broadcast HUD (game) vs clean feed (Shorts)

- **Game HUD:**
  - Fighter cards with a **damage silhouette** (each plate and joint colored by state)
  - Battery and heat
  - Round clock and corner-call buttons
  - Commentary captions
- **Shorts feed:**
  - No HUD by default
  - Big captions
  - A simple two-color health/damage ribbon
  - A lower-third for names and records
- **Tale-of-the-tape card:** class, record, style, signature move, maker.

### 9.6 Audio

**Impacts by material**
- Steel clang, titanium ring, composite crack, ceramic shatter.
- Layered with a low thump scaled by energy.

**Motors**
- Servo whine per maker, hydraulic hiss and groan, pneumatic bursts.
- Overheated actuators grind.

**Destruction**
- Bolt pings, plate scrape, cable snap, fluid spray, core-fire roar.

**Crowd and announcer**
- An adaptive crowd that reacts to hype, as in v2.
- Venue-specific chants.
- A ring announcer and commentary barks (§9.7).

**Music**
- An adaptive track per venue.
- **Generated, original or properly licensed only** — monetized Shorts get claimed otherwise.

### 9.7 Commentary

A two-person booth (play-by-play + color commentator) driven by sim events:
"THE PLATE IS OFF!", "He's leaking!", "Duchess has seen this before…"

- Start with a text bark library plus TTS, or record the lines yourself.
- Must be **context-aware** (names, records, rivalry, current damage), not random.

---

## 10. Technical architecture (Godot)

```
src/
  sim/                  # pure deterministic fight sim — no Node/scene dependencies
    body/               # skeleton model, capsules, plates, internals
    motion/             # move clip curves, footwork, balance
    damage/             # damage resolution, destruction state machine
    ai/                 # brain: perception, utility, styles, habits, adaptation
    rules/              # rulesets, referee, judges
    fight.gd            # tick loop, event stream, fight log
  gameplay/             # garage, training, economy, calendar, tournaments, reputation
  presentation/
    rig/                # skeleton driver, IK stack, procedural layers, active ragdoll
    vfx/  audio/  camera/  hud/
  tools/
    test_bench/         # headless sims, balance sweeps, regression replays
    fight_debugger/     # overlay: capsules, CoM, support polygon, hit vectors, AI scores
    shorts/             # highlight extractor, shot director, render driver
assets/
  data/                 # parts, plates, materials, moves, styles, bots, rulesets, factions (JSON or .tres)
  art/  audio/  vfx/  shaders/
tests/                  # unit tests for sim formulas + golden-replay determinism tests
```

**Non-negotiables**
- The sim has no rendering, physics-engine or scene-tree dependencies, so it runs headless (`godot --headless`).
- All content is **data**. Adding a bot, part or move must not require code changes.
- **Golden replays:** a set of stored fight logs must reproduce the same final state on every build. CI fails on drift.
- The balance harness reports the same sweeps used for the v2 fixes:
  - build × style × card win rates
  - part-usage share in the top builds
  - win-rate change per command
  - ladder curve
  - KO/TKO/decision mix

---

## 11. Balance targets (initial)

| Metric | Target |
|---|---|
| Style averages across all legal builds | Every style within ±5 points of the mean |
| Top-40 builds | No part in more than 40% of them |
| Each corner command vs autopilot | Positive in every matchup; none above +25 points alone |
| Fight endings across a season | ~45% KO/TKO, ~35% decision, ~20% corner/ref stoppage (decisions must matter) |
| Ladder curve | Each tier's first opponent ~55–65% for a bot that's progressed normally; each tier's boss ~15–25% |
| Fight length | Pit 2–3 rounds × 60 s; Grand Circuit up to 5 × 90 s |
| Destroy rate | Rare and earned: < 15% of stoppages |

---

## 12. The Shorts / Reels pipeline

### 12.1 Pipeline

1. **Book the card.** The season calendar or story beat picks the matchup.
2. **Simulate.** Run headless with seeds. For canon fights, run once and accept the result (authenticity). For "what if" content, run many and pick.
3. **Extract highlights.** Score every moment: damage spikes, detachments, knockdowns, comebacks, near-misses, finisher choices, crowd hype.
4. **Direct.** Build a shot list for a 30–60 s vertical edit (beat sheet below).
5. **Render.** Godot **Movie Maker** replays the log at 1080×1920 / 60 fps (and 16:9 for long-form), frame-perfect and offline.
6. **Post.** Use the `hyperframes` skills for title cards, captions, lower-thirds, the tale-of-the-tape and end card. Mix music and SFX.
7. **Package.** The `shorts-packaging` skill writes the title, description, hashtags, pinned comment and thumbnail frame choice.
8. **Canon log.** Record the result in the season ledger; the next episode builds on it.

### 12.2 Episode beat sheet (45 s example)

| Time | Beat |
|---|---|
| 0–2 s | **Hook:** flash-forward to the biggest moment (plate flying, head off) with a one-line caption |
| 2–6 s | Tale of the tape: two bots, records, the stakes ("lose and the Rustmouths take his bot") |
| 6–30 s | Fight highlights, escalating; one slow-mo replay |
| 30–40 s | Climax: knockdown or finisher; **Destroy or Spare?** |
| 40–45 s | Aftermath plus a cliffhanger ("Next week: Needle"), and a comment prompt |

### 12.3 Formats

- **Fight Night:** one fight, compressed.
- **Teardown:** a slow-motion destruction showcase.
- **Origin:** one bot's lore in 30 s.
- **Garage:** a build or upgrade montage.
- **Training montage.**
- **Tale of the Tape:** pre-fight hype.
- **Fan Vote results.**
- **Rivalry recap.**

### 12.4 Audience interaction

Let comments and polls decide canon:
- Destroy or Spare
- Next opponent
- Which part to buy
- Which side to take

This makes viewers part of the story, and the sim keeps the outcome honest.

### 12.5 Platform rules (check current terms before launch)

- **Monetization policies** penalize mass-produced or repetitive content. Every episode needs real variation, narrative and clear creative input (your story, your commentary, your choices), not auto-generated clips on loop.
- **Disclosure:** synthetic-content labels are aimed at realistic people and events. Animated robots are usually fine, but check the current rules.
- **Copyright:** original music and SFX only. No film footage, names or likenesses.
- **Length limits** change. Check current Shorts and Reels maximums. Design for 30–60 s regardless; it performs best.

---

## 13. Roadmap (mapped to the studio skills)

Milestones, not dates. Each ends with something you can see.

| # | Milestone | Done when | Main skills and agents |
|---|---|---|---|
| **M0** | Setup | Git repo, Godot 4.7 installed, `/start` done, engine pinned, the v2 prototype documented as reference | `/start`, `/setup-engine godot 4.7`, `/reverse-document`, `/adopt` |
| **M1** | Concept & bibles | Game brief, pillars, art bible, world bible, roster, channel identity | `/brainstorm`, `/art-bible`, `/team-narrative`, `brand-identity`, `brand-naming` |
| **M2** | Systems design | Systems index + GDDs for the core systems (§14) reviewed | `/map-systems`, `/design-system`, `/review-all-gdds`, `/consistency-check` |
| **M3** | Architecture | Architecture doc, ADRs (sim/presentation split, determinism, data format, rig, IK, render pipeline), tests scaffolded | `/create-architecture`, `/architecture-decision`, `/create-control-manifest`, `/test-setup` |
| **M4** | **"One Great Fight"** | Two articulated 3D bots in one arena. Plates crack and fly off, limbs can sever, real hit reactions, director camera. **A 30 s vertical clip rendered with Movie Maker.** PROCEED/PIVOT decision | `/prototype --path engine`, `/team-combat`, `blender-3d-modeling`, `technical-artist`, `godot-specialist` |
| **M5** | Shorts pipeline MVP → **start posting** | Log → highlights → shot list → render → captions → package, end to end; 3 pilot episodes from the Pit Nights arc | `hyperframes`, `shorts-packaging`, `tools-programmer` |
| **M6** | Vertical slice: Pit Nights | Garage, 8 part slots, plates, 6 Pit bots, training (3 drills), corner repairs, salvage, Destroy/Spare, Pit ruleset, Pit 4 arena | `/vertical-slice`, `/playtest-report`, `/balance-check` |
| **M7** | Production: Districts → Grand Circuit | Remaining roster, venues, rulesets, sides and reputation, calendar, brackets, story arc, commentary | `/create-epics`, `/create-stories`, `/sprint-plan`, `/dev-story`, `/story-done`, `/team-level`, `/team-audio`, `/team-narrative` |
| **M8** | Polish & Season 1 | Performance, accessibility, balance pass, soak tests; Season 1 of the show complete | `/team-polish`, `/perf-profile`, `/soak-test`, `/release-checklist` |

**Run Shorts in parallel from M5 onward.** Every new bot or arena is a new episode.

---

## 14. Systems to design (input for `/map-systems`)

Ordered **Foundation → Core → Feature → Presentation → Polish**.

| Order | System | GDD file (suggested) |
|---|---|---|
| Foundation | Deterministic fight sim & fight log | `fight-sim-core.md` |
| Foundation | Body model: skeleton, joints, actuators | `body-model.md` |
| Foundation | Parts, plates & internals data | `parts-and-plates.md` |
| Core | Damage resolution | `damage-model.md` |
| Core | Destruction states & persistence | `destruction-system.md` |
| Core | Footwork, ring & balance/knockdown | `footwork-and-balance.md` |
| Core | Moves, combos & defense | `moveset-system.md` |
| Core | Fighting styles & AI brain | `fight-ai.md` |
| Core | Rulesets, referee & judging | `rules-and-officiating.md` |
| Core | Corner calls & between-round repairs | `corner-system.md` |
| Feature | Training & proficiency | `training-system.md` |
| Feature | Garage, tuning & salvage | `garage-and-salvage.md` |
| Feature | Economy | `economy.md` |
| Feature | Factions, sides & reputation | `factions-and-reputation.md` |
| Feature | Tournaments, calendar & rankings | `tournament-system.md` |
| Feature | Story & rivalry events | `story-events.md` |
| Presentation | Animation stack & motion signatures | `animation-system.md` |
| Presentation | Camera director & replays | `camera-director.md` |
| Presentation | VFX & destruction visuals | `destruction-vfx.md` |
| Presentation | Broadcast HUD & tale of the tape | `design/ux/hud.md` (via `/ux-design`) |
| Presentation | Audio & commentary | `audio-and-commentary.md` |
| Presentation | Shorts pipeline | `shorts-pipeline.md` |
| Polish | Accessibility | `design/accessibility-requirements.md` |

---

## 15. Scope control

**MVP (through M6) includes**
- 1 arena (Pit 4)
- 6 bots + the player bot
- 3 makers' parts
- 6 styles
- ~25 moves
- the Pit ruleset
- training with 3 drills
- the Shorts pipeline

**Deferred**
- Direct Command mode
- Scrap Royale
- multiplayer
- mobile and web builds
- localization (captions excepted)
- full commentary recording

**Cut unless proven necessary**
- free-form 3D physics fighting
- procedurally generated bots
- live-service features

---

## 16. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Animation quality (the #1 risk) | Prove it in M4 before anything else. Layered approach (authored clips + IK + procedural + active ragdoll). Use real boxing reference. Keep a "motion quality bar" clip in the art bible. |
| Determinism drift | Sim isolated from physics. Golden-replay tests in CI. Seeded RNG only inside the sim. |
| Asset volume (24 bots × parts) | Modular kit on one rig: bots are combinations plus livery, not unique models. Blender scripting for variants. |
| Scope creep | `/scope-check` each milestone; this doc's §15 is the contract. |
| Balance in a high-dimension system | Data-driven tuning knobs; headless sweeps with the §11 targets as gates. |
| Copying Real Steel by accident | The original-IP rule in the world bible; a review pass before any public episode. |
| Platform policy changes | Re-check monetization and disclosure rules at M5 and every season. |
| Burnout (solo dev + weekly show) | Pipeline automation in M5; batch-render episodes; posting cadence you can keep. |

---

## 17. What was missing from the original brief (now covered)

1. **A content pipeline** — how a game fight becomes a vertical, captioned, packaged Short (§12).
2. **Determinism and replays** — essential for honest results, re-renders and balance (§4, §10).
3. **Defense and footwork** — real boxing is half defense; the brief only covered offense (§6.1, §6.6).
4. **Rulesets per league** — different tiers play differently (§6.10).
5. **Persistent damage and repair economy** — destruction needs consequences (§6.5, §7.2).
6. **Salvage** — makes Destroy vs Spare a real decision (§7.2).
7. **Corner crew and commentary** — the human side of the story (§6.11, §9.7, world bible).
8. **Phone readability** — art rules for small screens (§9.1).
9. **Audio** — impact by material, motor signatures, licensing (§9.6).
10. **Balance targets and test tooling** — measurable success (§10, §11).
11. **IP and platform-policy safety** (§12.5, world bible).
12. **Scope control and a milestone order** that ships the show before the game (§13, §15).
13. **Audience interaction** — fans voting on canon (§12.4).

---

## 18. Decisions only you can make

Answer these before or during `/brainstorm`. Each has a default.

| Question | Default if you don't decide |
|---|---|
| Player role: manager only, or manager + Direct Command later? | Manager only for v1 |
| Game release: Steam, itch.io, or show-only? | Show first, Steam later |
| Tone: gritty drama, or grit with humor? | Grit with heart and some humor |
| Narration: your voice, TTS, or captions only? | Captions + TTS barks, your voice for key episodes |
| Caption languages | English, plus Filipino/Taglish captions as an option |
| Destruction intensity | Mechanical only — never humans hurt |
| Season length | 8 arc beats ≈ 24–40 Shorts |
| Keep the names "Scrapyard Circuit" / "Ironside"? | Yes |
