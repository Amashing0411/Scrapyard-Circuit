# Scrapyard Circuit: Master Plan

**Source:** `Scrapyard_Circuit_Online_Design_v3` workbook (41 tabs, 1,265 rows)
**Status of this plan:** Active. All six decisions in section 2 accepted 2026-11-03
**Last checked against the game:** 2026-11-03, commit `125c7b1`

## 1. The short version

The workbook describes two games in one: a complete single-player game, and an online world built on top of it. The online half is only worth building if the single-player half is fun, so this plan finishes and releases that first.

| Milestone | Goal | Workbook phases | Size | You know it's done when |
|---|---|---|---|---|
| **A. Foundation** | Safe to build on | 0 | 1 week | Decisions signed; game split into files; automated fight tests run |
| **B. Damage loop** | Repairing means something | 1 | 3 weeks | Testers can explain why a part became unrepairable |
| **C. Real salvage runs** | The core loop is fun | 2 | 8 weeks | Testers choose to start a second run |
| **D. Stable and road** | Your bots and truck have stories | 1B | 6 weeks | Losing a bot hurts, but players keep playing |
| **E. The full world** | All offline content | 2B | 20–30 weeks (my guess) | Every offline tab is in the game and reviewed |
| **F. Offline 1.0** | Release it | New | 3–4 weeks (my guess) | Strangers finish a full career and the numbers look healthy |
| **G. Online** | The MMO | 3–8 | 36 weeks, then ongoing | Each phase passes its workbook test |

Sizes are for the workbook's team (1 programmer plus a part-time designer/artist). The workbook gives no size for E or F, so those two are my rough guesses. AI help should shorten code-heavy work, but playtests take as long as they take, so I'm not promising calendar dates.

**Order change:** C comes before D, though the workbook lists 1B first. The workbook itself says Phase 2 depends only on Phase 1, and C is the test of whether the game is fun. If it fails, it's better to learn that before building more on top.

## 2. Decisions (recommendations accepted 2026-11-03)

| # | Decision | Why it matters | Recommendation |
|---|---|---|---|
| 1 | **HTML or Godot?** | `CLAUDE.md`, `project.yaml` and `game-concept.md` say Godot, but the real game is about 1.1 MB of JavaScript | Stay on HTML/JavaScript. The workbook wants fight code shared with the server, and moving engines means rewriting the game. Update the project config to match |
| 2 | **Which scope wins?** | `game-concept.md` is the "scope contract" for a small Corner Genius MVP (1 arena, 4 bots, no networking). The workbook is far bigger | The workbook wins, with Offline 1.0 as the first release. Mark the concept doc as superseded where they conflict |
| 3 | **Combat scaling** | On 2026-11-03 you selected direct Hull, Footwork and Arm Power values for custom bots. I replaced that with scaled values because custom bots won every fight, without asking you first | Keep the scaling, and record your sign-off |
| 4 | **Can we fill the workbook's missing numbers?** | The earlier rule was "don't invent values", which blocks many systems (section 6) | Yes. Propose each value, mark it provisional and tune it in playtests |
| 5 | **Wreck risk early on** | A custom bot lost its frame after one loss in the first league | Use the Venues tab's Wreck risk column, so licensed early venues rarely wreck a bot |
| 6 | **Business model** | Affects accounts and the store | Decide before Milestone G. Workbook rule stands: premium or cosmetics only, never paid power or repairs |

Accept the workbook's other recommendations as written: shared hub with instanced runs, coach/mechanic role, Coach and Pilot control, opt-in PvP.

## 3. Milestones in detail

### A. Foundation
1. [x] Sign off the decisions above and close Phase 0.
2. [x] Tag `c644bfa` (48 bots) as the frozen v7 combat reference. Local tag, not pushed yet.
3. [x] Live site decision (2026-11-03): `scrapyard-circuit.vercel.app` keeps the old game for now. Test on Vercel preview links, and merge into `main` when Milestone C is ready for testers. This work shares no history with `main`, so that merge must exclude the studio files, and rolling a converted save back to the old build needs testing first. Every audio file the code names by path is already on GitHub.
4. [x] Split `index.html` into `src/`: sim, draw, data, ui, venues, audio, voice, arena, plus two stylesheets.
5. [x] Automated tests with fixed seeds cover the fight sim, the repair, wreck, dismantle and XP formulas, and loading real v7 and custom-bot saves.
6. [x] Balance report: `node tools/balance-report.cjs`.

### B. Damage loop (Tabs: Damage & Repair, Status Effects, Materials, Crafting)
1. [x] Workshop repairs use materials as well as scrap, for stock and custom bots, and missing materials are bought automatically.
2. [x] Dismantle a spare part for materials (yield 30% + 0.4% × Integrity).
3. [x] Overhaul (+20 Integrity, max 2 per part, cap 90). Provisional: Rank 2, no blueprint or Mechanic skill until those exist.
4. [~] Re-attach works at 30% Condition and −15 Integrity, using fasteners and weld rods directly. The craftable kit (CR-16) isn't used yet.
5. Fault services: coolant flush, recalibration, gear rebuild.
6. Memorialise rare parts as trophies.
7. A clear damage report after every fight.
8. [~] Soften wear (accepted 2026-11-03): a repaired part starts each fight at full health, Destroy and Wreck checks follow venue risk, and repair wear is lighter. A stock bot now wins about 5 of 30 in simulation (`node tools/career-sim-report.cjs`), against 12 of 30 with no wear. The target is 8–12; recheck after overhauls and part replacement.

**Test:** give 5 testers a part that became unrepairable and ask them why.

### C. Real salvage runs (Tabs: Run Structure, Loot Tables, Enemies, Hazards, Crafting, Onboarding)
1. Real Hazard stops: Avoid, Brace or Push Through.
2. Real Event stops: Shady dealer, Stranded crew, Rival ambush, Sponsor test, Lost drone.
3. Real Workshop cache: one free repair or one patch kit.
4. Add Derelict stops: spend kits, then pick one of 3 rewards.
5. Timed Dismantle: choose which assemblies to cut before the hazard hits.
6. Make the carry limit real, plus heat effects at 5, 8 and 10.
7. Audit loot against the Loot Tables tab, and activate 10 recipes.
8. Crusher boss with a readable tell and full rewards.
9. Garbage Town hub with one clear "what next" action.
10. Onboarding: the first 45 minutes from the Onboarding tab.

**Test:** at least 5 people play with no help. Count how many start a second run by choice, and watch the extraction rate (target 70–80%).

### D. Stable and road (Tabs: Stable & Wrecks, Frames, Mods, Trucks & Road, Factions)
1. Rebuild Salvageable wrecks.
2. Install mods; today they are catalog only.
3. Road events: all 10 from the tab, starting with Breakdown, Gang toll and Street bout.
4. Truck damage, stranding and towing.
5. Parts from the first 3 factions in regular play; finish part traits and frame quirks.
6. Second bot found at the 2-hour mark.

**Test:** do players keep playing after losing a bot? Target 0.5–1.0 wrecks per 10 fights.

### E. The full world, in waves
- **E1 Goals:** Dispatch board, contracts from 12 templates, reputation tiers, skill tracks (Mechanic, Scavenger, Coach, Trader).
- **E2 Garage and economy:** building upgrades, full crafting, vendor prices, sink ratio of 75–90%.
- **E3 Districts wave 1:** Docks, Substation, Kiln Row, Old Arena, each with its own hazards, enemies and boss.
- **E4 Venues and roster:** real rulesets per venue, the 10 missing named bots.
- **E5 Story:** Prologue to Act IV, 3 endings, 10 faction questlines, the 14 missing characters.
- **E6 Endgame:** Factory Ruin, Black Market Tunnels, Deep Vault, New Game+.
- **E7 Expression:** remaining cosmetics and all 25 achievements.

**Test:** each district gives a distinct reason to run, confirmed by playtest.

### F. Offline 1.0
Balance pass against the Telemetry targets, performance and phone checks, local opt-in stats, first-time-player playtests, store page and launch. The result decides whether Milestone G goes ahead.

### G. Online (workbook phases, unchanged)
| Phase | Delivers | Weeks | Test |
|---|---|---|---|
| 3 | Accounts, server-owned items and fights, cloud saves, save import | 8 | No item loss or duplication in a 2-week test |
| 4 | Shared hub, 2–4 player runs, chat, exhibitions | 6 | 50 concurrent testers, stable reconnects |
| 5 | Trade with escrow, market, crafting orders, ledger | 6 | No dupes; prices settle; scam reports handled |
| 6 | Online districts, crews, projects | 10 | Each district has a distinct reason to run |
| 7 | Ranked, tournaments, crew cards, spectating | 6 | Match quality and retention targets met |
| 8 | Live service: Vault rotation, weekly events, moderation | Ongoing | Healthy population and economy |

## 4. Every tab, where it stands, where it goes

**Built** = works in the game. **Partly** = some of it works. **Data only** = listed but not played with. **Not started** = nothing found. Counts come from searching `index.html` by name, so a named item isn't always a working one.

| Tab | Status today | Milestone |
|---|---|---|
| Overview, Player Flow | Guide; the flow isn't fully playable yet | All |
| Story | Not started | E5 |
| Characters | Partly: 6 of 20 named | C, E5 |
| Factions | Data only: names and part makers, no reputation | D, E1 |
| World Map | Partly: all 19 stops and travel work | D, E3 |
| Venues | Partly: 11 of 14 named, rulesets not found | E4 |
| Named Bots | Partly: 50 of 60 | E3, E4 |
| Damage & Repair | Partly: Condition, Integrity and scrap repairs work | B |
| Stable & Wrecks | Partly: bots, roles, fatigue and wreck checks work; rebuild disabled | D |
| Frames | Built for data and fitting; some quirks inactive | D |
| Parts | Data complete (361); some traits inactive | D, E |
| Mods | Data only (102) | D |
| Build Planner | Built | Done |
| Moves | Partly: 16 of 19 named | D, E |
| Status Effects | Partly: 14 of 15 named, services missing | B |
| Hazards | Partly: 8 of 15 named | C, E3, E4 |
| Formulas | Partly: repair and wreck match; see section 6 | A, B |
| Trucks & Road | Partly: vehicles, modules, crew, travel; no road events or truck damage | D |
| Zones | Partly: 2 of 10 have runs | C, E3, E6 |
| Run Structure | Partly: Search, Dismantle, Guard, Boss, Extract work | C |
| Enemies | Partly: 4 of 15 | C, E3, E6 |
| Loot Tables | Partly: not yet audited | C |
| Contracts | Not started: 0 of 48 | E1 |
| Materials | Data complete (18); used by little so far | B, C |
| Crafting | Partly: 3 of 22 usable | B, C, E2 |
| Economy | Partly: vendor path works, not tuned | E2, F |
| Garage & Base | Not started as upgrades | E2 |
| Progression | Partly: ranks and provisional XP; no skills | C, E1 |
| Achievements | Partly: 10 of 25 can unlock | E7 |
| Cosmetics | Partly: original paint, trim, decals, walkouts | E7 |
| Social & PvP | Offline parts exist (tournaments, living circuit, exhibition); the rest needs a server | G |
| Live Ops | Not started | G |
| Onboarding | Partly: first salvage run only | C |
| Screens | Partly: 14 of 20 | C, E, G |
| Data Model | Partly: local saves with unique item records | A, G |
| Telemetry & KPIs | Not started | F, G |
| Combat Map | Built: v7 sim carried over | A, G |
| Roadmap, Risks & Decisions | Used by this plan | A |
| Glossary | Reference | Done |

## 5. How we keep it on track
- **One slice at a time:** each change is small, playable, tested and committed.
- **No milestone closes on my word:** each ends with its workbook test on real players.
- **Every screen stays simple:** one clear next action, long lists folded, no design notes on screen.
- **Balance is measured:** the win-rate report runs on every combat or parts change.

## 6. Holes and contradictions in the workbook

These need a value or a ruling. Each gets a proposal when its milestone starts.

| Issue | Where | Blocks |
|---|---|---|
| XP awards undefined (60/20/80 is provisional) | Progression | C |
| Punch multipliers differ: workbook jab 1.0× and cross 1.4×; game jab 0.55× and cross 0.95× | Formulas, Moves vs sim | A |
| Field repair: 70% of Integrity (Run Structure) vs 50% (Damage & Repair) | Two tabs | C |
| Hazard option costs and event outcomes undefined | Run Structure | C |
| Material weights undefined, so the carry limit can't work | Materials, Run Structure | C |
| "Gears" is a listed drop but not a material | Zones, Enemies vs Materials | C |
| Rebuild material quantities undefined | Stable & Wrecks | D |
| Fuel is mentioned but has no rules | Player Flow, Data Model, Trucks | D |
| Road links and distances undefined (19 stops only; "Drive 1,000 km" needs them) | World Map, Achievements | D |
| Which parts form a maker's 4-part set | Factions, Achievements | D |
| Reputation values undefined | Factions | E1 |
| Scrapworks Guild and Dockside Smugglers aren't in the Factions tab, yet ZN-08 needs Smugglers rep | Progression, Zones | E1 |
| Some sample contracts don't fit the map (ceramic from Copperline; tier 5 at the Scrapyard pit) | Contracts | E1 |
| Bay upgrade rep gates and clinic price undefined | Garage & Base, Stable | E2 |
| "Second garage bay" at Rank 10, but you start with 2 bays | Progression vs Stable | E2 |
| Social & PvP phase numbers don't match the Roadmap tab (shared hub is 2 vs 4) | Two tabs | G |

## 7. First steps
1. Milestone A is closed.
2. Continue Milestone B with dismantling and overhauls.
