'use strict';
// Regressions from the Nov 3 audit, plus the workbook's own calculator examples.
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { loadGame, ROOT } = require('../../helpers/load-game.cjs');
const page = process.env.GAME_HTML || path.join(ROOT, 'index.html');

// Builds a custom bot from one workbook tier, then fights the whole Pit Championship league.
const customBotWinPct = tier => `(() => {
  const clone = value => JSON.parse(JSON.stringify(value)), rows = Object.values(WORKBOOK_PART_BY_ID), bot = S.stable[0], fit = {};
  const slots = { head:'Head', torsoCore:'Torso core', leadArm:'Arm', rearArm:'Arm', fists:'Fist', legs:'Legs' };
  let serial = 0;
  for (const [key, slot] of Object.entries(slots)) {
    const options = rows.filter(row => row.slot === slot && row.tier === '${tier}'), def = options[options.length >> 1], itemId = 'test-' + key + '-' + serial++;
    S.items.push({ itemId, kind:'workbook-part', defId:def.id, location:'bay', botId:bot.id, slot:key, state:{ condition:100, integrity:100, repairCount:0, faults:[], detached:false, patched:false, overhauls:0 } });
    fit[key] = itemId;
  }
  const report = workbookCombatAdapter({ ...bot, combatModel:'workbook', workbookFittedItems:fit });
  const spec = { ...clone(playerSpec()), workbookCombat:{ stats:clone(report.stats), itemIds:report.itemIds, frame:report.frame }, partWear:clone(report.partWear) };
  let wins = 0, total = 0;
  for (const rival of ROSTER.filter(row => row.lg === 3)) for (let i = 0; i < 5; i++) { total++; if (simulate(clone(spec), clone(rival), 1000 + i * 7919, { rounds:3, roundLen:45 }).winner === 0) wins++; }
  return Math.round(100 * wins / total);
})()`;

test('fight_damage_counter_stays_a_real_number', () => {
  const game = loadGame(page);
  const damage = game.evaluate(`(() => { const F = simulate({ ...ROSTER[0] }, { ...ROSTER[1] }, 7, { rounds:3, roundLen:45 }); return F.f.map(f => f.cnt.dmg); })()`);
  assert.ok(damage.every(Number.isFinite) && damage.some(value => value > 0), `damage was ${damage}`);
});

test('mid_tier_custom_bot_cannot_sweep_the_top_league', () => {
  const game = loadGame(page);
  const winPct = game.evaluate(customBotWinPct('T3'));
  assert.ok(winPct < 90, `T3 build won ${winPct}% against Pit Championship`);
});

test('custom_parts_draw_without_crashing', () => {
  const game = loadGame(page);
  const drawn = game.evaluate(`(() => { const def = Object.values(WORKBOOK_PART_BY_ID).find(row => row.phase1BFactionCode), ctx = new Proxy({}, { get: () => () => ({ addColorStop(){} }), set: () => true }); drawWorkbookMount(ctx, { def }, 0, 0, 20, 20); return true; })()`);
  assert.strictEqual(drawn, true);
});

test('wreck_check_matches_the_workbook_calculator', () => {
  const game = loadGame(page);
  const check = game.evaluate(`calculateWreckCheck({ frameIntegrity:70, overkillDamage:25, destroyFinisher:false, hazardOrExplosion:false, insuredOrGrange:true, baseSalvageChance:.7 })`);
  assert.strictEqual(check.severity, 15);
  assert.ok(Math.abs(check.salvageable - .49) < 1e-9);
  assert.ok(Math.abs(check.totaled - .51) < 1e-9);
});

test('dismantle_yield_matches_the_workbook_calculator', () => {
  const game = loadGame(page);
  assert.ok(Math.abs(game.evaluate('workbookDismantleMaterialYield(64)') - .556) < 1e-9);
});

test('repair_cost_matches_the_workbook_calculator', () => {
  const game = loadGame(page);
  const cost = game.evaluate(`(() => { const state = partStateFor('head'); Object.assign(state, { condition:22, integrity:64, repairCount:5 }); const baseValue = part('head', S.build.head).cost; return { cost: repairCost('head'), baseValue }; })()`);
  assert.strictEqual(cost.cost, Math.round(cost.baseValue * .6 * (64 - 22) / 100 * 1.4));
});

test('extracting_a_run_awards_salvage_xp', () => {
  const game = loadGame(page);
  const gained = game.evaluate(`(() => { const before = +S.workbookProgression.xp || 0; moveStableBotToTruck(activeStableBot().id); travelTruckTo('the-crater'); workbookStartRun('crater', 777, {}); workbookExtractRun(1); return (+S.workbookProgression.xp || 0) - before; })()`);
  assert.ok(gained > 0, `extraction gave ${gained} XP`);
});
