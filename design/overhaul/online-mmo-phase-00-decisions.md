# Phase 0 — Decide and Preserve

**Status:** Decisions signed off 2026-11-03; v7 reference tagged
**Source:** Scrapyard Circuit Online Design v3 workbook, Phase 0 and Risks & Decisions  
**Workbook effort estimate:** 1 person-week  
**Workbook exit test:** Decisions signed off.

## Purpose

Answer the workbook's open decisions, record conflicts between its sheets, and preserve v7 as the combat reference. Phase 0 is complete when the rules needed by the offline phases are consistent and the user has selected the stated open decisions.

The current task order is offline first. No online integration happens until Phases 0–2B are complete. Phase 0 changes planning documents only.

## Decisions already proposed by the workbook

These are the workbook's recommendations, not new decisions made by the assistant.

| Topic | Workbook recommendation | Status |
| --- | --- | --- |
| World format | Shared hub plus instanced runs first | Proposed in workbook |
| Player role | Coach/mechanic with node-map salvage runs; avatar can come later | Proposed in workbook |
| Fight control | Keep Coach and Pilot; ranked starts Coach-only | Proposed in workbook |
| PvP risk | Opt-in arenas and flagged zones | Proposed in workbook |
| Business model | Premium or cosmetic-only; never paid power or repairs | Proposed in workbook |
| Standard loss | Lose the run carry; tow the bot home at 5% Condition; reduce torso Integrity by 5 | Selected by the user on 2026-11-03, following Run Structure |
| Hardcore loss | Hardcore is opt-in; lose the carry and torso permanently | Selected by the user on 2026-11-03 |
| Wreck checks | Keep the Wreck check for fight wrecks; do not apply it to standard run wrecks | Selected by the user on 2026-11-03 |
| Starter frames | Grant the Church Raffle Chassis to assembled Ironside and the Forklift Frame as spare inventory for a new career | Selected by the user on 2026-11-03 |
| Starter frame reinforcement | Reinforce Ironside's Church Raffle Chassis three times; Capacity rises from 14 to 20 and max Integrity falls from 80 to 50 | Selected by the user on 2026-11-03 |
| Fatigue per fight | Wins add 1–2 Fatigue; losses add 2–3 | Selected by the user on 2026-11-03 |
| Workbook combat fist stat | Use Arm Power exactly as the `Formulas` damage equation states; keep Fist Impact visible but combat-inactive | Selected by the user on 2026-11-03 |
| Workbook hull bridge | Maximum hull = Frame Base Hull + installed Torso Hull | Selected by the user on 2026-11-03 |
| Workbook footwork bridge | Divide Footwork by 100, then apply the Load-overage penalty | Selected by the user on 2026-11-03 |
| Legend crowd reward | +10% fight Hype gain | Selected by the user on 2026-11-03 |
| Corner Weld Condition amount | Workbook-built bots restore +42 Condition per weld; the mechanic does not change this base amount. The workbook's fitted weld-restoration trait can still modify it. Legacy v7 mechanics retain their existing 30, 18, and 24 values. | Selected by the user on 2026-11-03 |
| Garage upgrade reputation gates | Workbook gives Scrap prices for 2→4, 4→6, and 6→8 bays but no Council reputation threshold for any step | Open; propose a provisional value in Milestone E2 |
| Clinic tune-up price | Workbook names the service but gives no price | Open; propose a provisional value in Milestone E2 |
| Fight-wreck trigger | Roll the Stable & Wrecks check when torso Condition reaches 0 in a career fight | Selected by the user on 2026-11-03; run wrecks stay under the separate selected run-loss rules |
| Emergency loaner fit | Laundromat Shell has 10 Capacity while the minimum workbook core needs 20 | Selected by the user: keep the legacy starter loadout as an offline continuation bridge; do not treat it as a workbook Capacity-valid build |

### Recorded exception to the workbook's starter selection

The Player Flow and Onboarding tabs say to pick one of three starter frames. The user selected a different starting grant: both the Church Raffle Chassis and Forklift Frame are owned at career start, with only Ironside assembled on the reinforced Church Raffle Chassis and the Forklift Frame left in stash. This is the implementation rule; it deliberately overrides the workbook's one-of-three selection prompt. The separate workbook tutorial reward remains one found part fitted and 120 Scrap after the guided Crater run; catalog definitions alone do not grant owned parts.

The user has now directed that online integration occur after offline systems/content. That order is recorded in the [phase roadmap](online-mmo-phase-roadmap.md).

## Reconciled wreck rules

The workbook described standard-mode wrecks differently across tabs. The user resolved the conflict as follows:

- **Standard run wreck:** lose all unbanked carry; tow the bot home with every damaged part at 5% Condition; reduce torso Integrity by 5. No Wreck check is rolled for this standard run outcome.
- **Hardcore run wreck:** hardcore is opt-in; lose the unbanked carry and torso permanently.
- **Fight wreck:** retain the Wreck check from Stable & Wrecks, with Salvageable, Totaled, or Annihilated outcomes.

These rules govern different activity types and are now the shared basis for later wreck implementation. The standard-run rule belongs with the offline run and recovery work; fight Wreck checks remain in the stable/wreck phase.

## Additional Phase 1B selections

- New careers receive both starter frame items. Ironside begins assembled on the Church Raffle Chassis; the Forklift Frame stays in stash for a later bot build.
- Reinforce Ironside's Church Raffle Chassis three times at career start. This gives the 20 Capacity needed by the workbook's lowest-cost core build and reduces maximum frame Integrity from 80 to 50. The spare Forklift Frame remains unreinforced.
- The workbook's one-of-three starter-frame selection is overridden by the selected two-frame grant. Keep the tutorial reward from Player Flow (one found part fitted and 120 Scrap after the guided Crater run) attached to that run; do not turn static catalog rows into owned items.
- Fatigue gain is randomized within the selected ranges: 1–2 after a win and 2–3 after a loss. Rest removes 2 Fatigue per in-game day. The clinic tune-up remains unpriced until the user supplies or selects a price rule.
- Workbook-built combat adds Frame Base Hull to Torso Hull. It converts Footwork to the v7 movement scale by dividing by 100, then applies the workbook's 1% penalty per kg over the frame Load limit.
- Workbook punches use Arm Power from the `Formulas` equation. Fist Impact stays visible on its owned item and does not affect arena damage.
- At 25 survived fights, the Legend crowd reward adds 10% to Hype gained during fights. The unique paint slot is unlocked, but its specific paint remains undefined by the workbook.
- If the stable has no other fight-ready bot after a fight wreck, issue a Laundromat Shell loaner with the legacy starter loadout. This is a user-approved offline continuation bridge; the workbook does not define that loadout, and the bridge does not satisfy the Shell's 10-Capacity workbook build rules.
- For travel, draft an editable connected graph from the workbook's 19 World Map locations. Keep inferred road links and baseline travel times explicitly provisional; do not treat them as workbook facts. See [Phase 1B Offline Road Network](online-mmo-phase-1b-road-network.md).

## Phase 0 checklist

- [x] Map the workbook's feature areas to design documents.
- [x] Preserve the workbook's phase effort figures and gates where given.
- [x] Reorder the implementation so offline work finishes before online integration.
- [x] User selects the standard-mode and fight-wreck rules.
- [x] User selects the workbook-to-v7 Hull, Footwork, and damage-field bridge.
- [x] Confirm the remaining workbook recommendations or mark exceptions.
- [x] Keep v7 frozen as the combat reference (git tag `v7-combat-reference`).
- [x] Review and sign off Phase 0 decisions.

## Phase 0 completion record

| Decision | Selected rule | Date | Notes |
| --- | --- | --- | --- |
| Standard run wreck | Lose carry; tow at 5% Condition; torso Integrity −5; no Wreck check | 2026-11-03 | User selected recoverable standard outcome |
| Hardcore run wreck | Lose carry and torso permanently | 2026-11-03 | Opt-in hardcore |
| Fight wreck | Use the workbook Wreck check | 2026-11-03 | Keep separate from standard-run recovery |
| Fight-wreck trigger | Torso Condition 0 in a career fight | 2026-11-03 | User selected; standard and Hardcore run losses remain separate |
| Road map structure | Draft editable graph from the workbook's 19 locations | 2026-11-03 | Links and base hours are implementation assumptions, not workbook-specified facts |
| Emergency loaner loadout | Laundromat Shell with the existing legacy starter loadout | 2026-11-03 | User-approved continuation bridge; remains legacy combat, not a Capacity-valid workbook build |
| Workbook combat bridge | Frame Base Hull + Torso Hull; Footwork ÷ 100 then Load penalty; Arm Power damage; Fist Impact visible but inactive | 2026-11-03 | Confirmed bridge inputs; full effect mapping remains open |
| Workbook combat scale (supersedes the bridge inputs above) | Custom bots use the v7 damage curve, with stats scaled into the roster range by `WORKBOOK_COMBAT_SCALE`, because raw workbook numbers won every fight | 2026-11-03 | Accepted by the user 2026-11-03; values open to playtest |
| Repair costs | 2–10 fasteners, 1 family material per 25 Condition, re-attach 6 fasteners and 4 weld rods, missing materials at base × 1.2, starter supplies 20/10/10, instant repairs. Re-attach fees cut to head 40 and arms 30 (from 140 and 90) | 2026-11-03 | Provisional; user accepted the first five, and the fee cut is proposed |
| Offline head | A head knocked to 0 by punches is Broken (Condition 1), not torn off; only a Destroy finisher tears it off, matching the fight code | 2026-11-03 | Fix; applied |
| Material pricing | Missing materials cost batch × base × 1.2, rounded up once, instead of per item | 2026-11-03 | Fix; stops 1-scrap items costing double |
| Soft wear | Fight health is Condition as a share of Integrity, so a repaired part starts at full health; stat penalties stay. Stock parts wear 1 per repair, 3 from Broken, 5 on re-attach (workbook: 3, 10, 15); custom parts keep their catalog rate for normal repairs | 2026-11-03 | User chose softer wear; values provisional |
| Venue wreck risk | Venues tab risk scales CPU Destroy (Low 25%, Medium 50%, High 100%, Very high 150%) and how often a torso kill rolls a Wreck check (25%, 50%, 75%, 100%) | 2026-11-03 | Implements the accepted decision; values provisional |
| Part contents and overhaul cost | A part holds its family's lowest-tier material, value × 0.5 ÷ material value (2–12), plus 4 fasteners. Overhaul uses half of that plus a fee of 25% of value (minimum 30) | 2026-11-03 | Provisional; workbook gives only yield and limits |
| Overhaul access | Rank 2 with no blueprint, instead of Mechanic skill 3 and a blueprint, because skills arrive in Milestone E1 and few blueprints exist | 2026-11-03 | Provisional; revisit in E1 |
| Emergency repair | Free fix of whatever blocks the next fight when the player can't afford it, and a junkyard replacement (Condition 40, Integrity 60) for a worn-out part; Integrity wear still applies | 2026-11-03 | Provisional; proposed, so running out of scrap can't end a career |
| Salvage XP awards | Win 60, loss 20, extraction 80 (`WORKBOOK_XP_AWARDS`), so rank gates can open; the workbook set no values | 2026-11-03 | Active; provisional |
| v7 combat reference preserved | Git tag `v7-combat-reference` on `c644bfa`, the 48-bot build | 2026-11-03 | Local tag, not pushed yet |
| Platform | Stay on HTML/JavaScript | 2026-11-03 | Overrides the Godot pin; the workbook wants fight code shared with the server |
| Scope | The workbook is the scope contract; Offline 1.0 is the first release | 2026-11-03 | Overrides the Corner Genius MVP scope |
| Missing workbook values | Propose each one, mark it provisional, tune it in playtests | 2026-11-03 | Replaces "do not invent values" |
| Early-league wreck risk | Use the Venues tab's Wreck risk so licensed early venues rarely wreck a bot | 2026-11-03 | Implemented; see Venue wreck risk |
| Business model | Decide before Milestone G; premium or cosmetics only, never paid power or repairs | 2026-11-03 | Deferred on purpose |

## Phase 1 handoff

The selected wreck rules are inputs to later run and stable phases. Phase 1 implements the workbook's persistent Condition/Integrity, repair, dismantling, persistent faults, and beyond-repair rules independently of the run-wreck resolution.
