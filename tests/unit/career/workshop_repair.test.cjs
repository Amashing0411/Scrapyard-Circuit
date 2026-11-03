'use strict';
// Workshop repairs cost scrap and materials, can never strand the player, and work on custom bots.
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { loadGame, ROOT } = require('../../helpers/load-game.cjs');
const customSave = require('../../fixtures/saves/schema9-custom-bot.json'), v7Save = require('../../fixtures/saves/v7-career.json');
const page = process.env.GAME_HTML || path.join(ROOT, 'index.html');
const read = (game, expression) => JSON.parse(game.evaluate(`JSON.stringify(${expression})`));
const boot = save => loadGame(page, 1234, save ? { 'scrapyard-v3': JSON.stringify(save) } : {});
const FASTENERS = 'MT-15', WELD_RODS = 'MT-16', FERROUS = 'MT-01';

/** A new career with the head part damaged and known stock. */
function damagedHead({ condition = 60, integrity = 100, scrap = 1000, stock = {} } = {}) {
  const game = boot();
  game.evaluate(`Object.assign(partStateFor('head'), { condition:${condition}, integrity:${integrity} }); S.scrap = ${scrap}; for (const id of Object.keys(S.materials)) S.materials[id] = 0; Object.assign(S.materials, ${JSON.stringify(stock)});`);
  return game;
}
/** The custom bot save, with that bot active and its head set to the given state. */
function customBotHead(headState) {
  const game = boot(customSave);
  game.evaluate(`(() => { const bot = S.stable.find(row => row.name === 'Fixture'); bot.combatReady = true; selectStableBot(bot.id); Object.assign(workbookPartItemById(bot.workbookFittedItems.head).state, ${JSON.stringify(headState)}); S.scrap = 5000; })()`);
  return game;
}
const customHead = `workbookPartItemById(S.stable.find(row => row.name === 'Fixture').workbookFittedItems.head)`;

test('repair_needs_fasteners_and_family_material_scaled_to_damage', () => {
  const game = damagedHead({ condition:60 });
  assert.deepStrictEqual(read(game, `repairMaterialNeed('head')`), { [FASTENERS]:5, [FERROUS]:2 });
});

test('small_repair_uses_the_minimum_and_large_repair_the_maximum_fasteners', () => {
  assert.strictEqual(read(damagedHead({ condition:99 }), `repairMaterialNeed('head')`)[FASTENERS], 2);
  assert.strictEqual(read(damagedHead({ condition:1 }), `repairMaterialNeed('head')`)[FASTENERS], 10);
});

test('repair_with_stock_on_hand_spends_materials_and_only_the_scrap_fee', () => {
  const game = damagedHead({ stock:{ [FASTENERS]:9, [FERROUS]:9 } });
  const fee = game.evaluate(`repairCost('head')`);
  assert.strictEqual(game.evaluate(`doRepair('head')`), true);
  assert.deepStrictEqual(read(game, `{ scrap:S.scrap, fasteners:S.materials['${FASTENERS}'], ferrous:S.materials['${FERROUS}'], condition:partStateFor('head').condition, integrity:partStateFor('head').integrity }`), { scrap:1000 - fee, fasteners:4, ferrous:7, condition:99, integrity:99 });
});

test('missing_materials_are_bought_automatically_at_a_markup', () => {
  const game = damagedHead({ stock:{ [FASTENERS]:2 } });
  const quote = read(game, `repairQuote(['head'])`), fee = game.evaluate(`repairCost('head')`);
  // 3 more fasteners at base 1 and 2 ferrous scrap at base 2: each batch costs base × 1.2, rounded up once.
  assert.deepStrictEqual(quote.buy, { [FASTENERS]:3, [FERROUS]:2 });
  assert.strictEqual(quote.buyScrap, Math.ceil(3 * 1.2) + Math.ceil(2 * 2 * 1.2));
  assert.strictEqual(quote.total, fee + quote.buyScrap);
  assert.strictEqual(game.evaluate(`doRepair('head')`), true);
  assert.deepStrictEqual(read(game, `{ scrap:S.scrap, fasteners:S.materials['${FASTENERS}'], ferrous:S.materials['${FERROUS}'] }`), { scrap:1000 - quote.total, fasteners:0, ferrous:0 });
});

test('repair_is_refused_and_changes_nothing_when_scrap_cannot_cover_it', () => {
  const game = damagedHead({ scrap:1 });
  assert.strictEqual(game.evaluate(`doRepair('head')`), false);
  assert.deepStrictEqual(read(game, `{ scrap:S.scrap, condition:partStateFor('head').condition }`), { scrap:1, condition:60 });
});

test('sandbox_repairs_are_free', () => {
  const game = damagedHead({ scrap:0 });
  game.evaluate('S.sandbox = true');
  assert.strictEqual(game.evaluate(`doRepair('head')`), true);
  assert.deepStrictEqual(read(game, `{ scrap:S.scrap, fasteners:S.materials['${FASTENERS}'] }`), { scrap:0, fasteners:0 });
});

test('part_below_the_integrity_threshold_cannot_be_repaired', () => {
  const game = damagedHead({ condition:10, integrity:24 });
  assert.strictEqual(game.evaluate(`doRepair('head')`), false);
});

test('new_career_starts_with_repair_supplies', () => {
  const game = boot();
  assert.deepStrictEqual(read(game, `[S.materials['${FASTENERS}'], S.materials['${WELD_RODS}'], S.materials['${FERROUS}']]`), [20, 10, 10]);
});

test('converted_save_gets_repair_supplies_only_once', () => {
  const first = boot(v7Save); first.evaluate(`S.materials['${FASTENERS}'] = 3; save();`);
  const second = loadGame(page, 1234, first.storage());
  assert.strictEqual(second.evaluate(`S.materials['${FASTENERS}']`), 3);
  assert.strictEqual(first.evaluate(`S.materials['${WELD_RODS}']`), 10);
});

test('custom_bot_repair_restores_its_own_part_using_its_family_and_durability', () => {
  const game = customBotHead({ condition:40, integrity:80 });
  const def = read(game, `WORKBOOK_PART_BY_ID[${customHead}.defId]`), family = read(game, `WORKBOOK_MATERIAL_DEFS.filter(row => row.family === '${def.material}').sort((a, b) => a.tier - b.tier)[0].id`);
  assert.strictEqual(read(game, `repairMaterialNeed('head')`)[family], 2);
  assert.strictEqual(game.evaluate(`doRepair('head')`), true);
  const loss = +/−(\d+)/.exec(def.repairDurability)[1];
  assert.deepStrictEqual(read(game, `{ condition:${customHead}.state.condition, integrity:${customHead}.state.integrity, repairs:${customHead}.state.repairCount }`), { condition:80 - loss, integrity:80 - loss, repairs:1 });
});

test('custom_bot_with_a_torn_off_head_can_be_reattached_and_fight_again', () => {
  const game = customBotHead({ condition:0, integrity:80, detached:true });
  assert.strictEqual(game.evaluate('canFight()'), false);
  assert.strictEqual(game.evaluate(`doRepair('head')`), true);
  assert.deepStrictEqual(read(game, `{ detached:${customHead}.state.detached, condition:${customHead}.state.condition, integrity:${customHead}.state.integrity }`), { detached:false, condition:30, integrity:75 });
  assert.strictEqual(game.evaluate('canFight()'), true);
});

test('reattach_uses_fasteners_and_weld_rods', () => {
  const game = damagedHead({ condition:0, integrity:80 });
  game.evaluate(`partStateFor('head').detached = true`);
  assert.deepStrictEqual(read(game, `repairMaterialNeed('head')`), { [FASTENERS]:6, [WELD_RODS]:4 });
});

test('broke_player_with_a_blocked_bot_gets_a_free_emergency_repair_and_can_fight', () => {
  const game = damagedHead({ condition:0, integrity:80, scrap:0 });
  game.evaluate(`partStateFor('head').detached = true`);
  assert.strictEqual(game.evaluate('canFight()'), false);
  assert.strictEqual(game.evaluate('emergencyRepairAvailable()'), true);
  assert.strictEqual(game.evaluate('emergencyRepair()'), true);
  assert.deepStrictEqual(read(game, `{ detached:partStateFor('head').detached, condition:partStateFor('head').condition, integrity:partStateFor('head').integrity, scrap:S.scrap }`), { detached:false, condition:30, integrity:75, scrap:0 });
  assert.strictEqual(game.evaluate('canFight()'), true);
});

test('emergency_repair_only_fixes_what_blocks_the_fight', () => {
  const game = damagedHead({ condition:0, integrity:80, scrap:0 });
  game.evaluate(`partStateFor('head').detached = true; Object.assign(partStateFor('legs'), { condition:50 })`);
  game.evaluate('emergencyRepair()');
  assert.strictEqual(game.evaluate(`partStateFor('legs').condition`), 50);
});

test('emergency_repair_is_not_offered_when_the_player_can_afford_the_fix', () => {
  const game = damagedHead({ condition:0, integrity:80, scrap:1000 });
  game.evaluate(`partStateFor('head').detached = true`);
  assert.strictEqual(game.evaluate('emergencyRepairAvailable()'), false);
});

test('emergency_repair_is_not_offered_when_nothing_blocks_the_fight', () => {
  const game = damagedHead({ condition:60, scrap:0 });
  assert.strictEqual(game.evaluate('emergencyRepairAvailable()'), false);
});

/** Runs a fight that ends with the given head state, then stores its damage on the player. */
const storeHead = (game, ph, lost) => game.evaluate(`(() => { const F = createFight(JSON.parse(JSON.stringify(playerSpec())), JSON.parse(JSON.stringify(ROSTER[0])), 5, { rounds:3, roundLen:45 }), me = F.f[0]; me.ph.head = ${ph}; me.lost.head = ${lost}; storeDamage(me); })()`);

test('head_knocked_offline_by_punches_is_broken_not_torn_off', () => {
  const game = boot();
  storeHead(game, 0, false);
  assert.deepStrictEqual(read(game, `{ detached:partStateFor('head').detached, condition:partStateFor('head').condition, blocked:repairBlocksFight() }`), { detached:false, condition:1, blocked:false });
});

test('head_ripped_off_by_a_destroy_finisher_is_torn_off', () => {
  const game = boot();
  storeHead(game, 0, true);
  assert.deepStrictEqual(read(game, `{ detached:partStateFor('head').detached, condition:partStateFor('head').condition, blocked:repairBlocksFight() }`), { detached:true, condition:0, blocked:true });
});

test('custom_bot_head_knocked_offline_is_broken_not_torn_off', () => {
  const game = customBotHead({ condition:100, integrity:80 });
  game.evaluate(`(() => { const F = createFight(JSON.parse(JSON.stringify(playerSpec())), JSON.parse(JSON.stringify(ROSTER[0])), 5, { rounds:3, roundLen:45 }), me = F.f[0]; me.ph.head = 0; storeDamage(me); })()`);
  assert.deepStrictEqual(read(game, `{ detached:${customHead}.state.detached, condition:${customHead}.state.condition, ready:canFight() }`), { detached:false, condition:1, ready:true });
});

test('bot_with_a_broken_head_can_still_enter_and_finish_a_fight', () => {
  const game = boot();
  storeHead(game, 0, false);
  const phase = game.evaluate(`simulate(JSON.parse(JSON.stringify(playerSpec())), JSON.parse(JSON.stringify(ROSTER[0])), 5, { rounds:3, roundLen:45 }).phase`);
  assert.strictEqual(phase, 'done');
});

test('worn_out_part_blocking_the_fight_gets_a_free_junkyard_replacement', () => {
  const game = damagedHead({ condition:0, integrity:20, scrap:1000 });
  game.evaluate(`partStateFor('head').detached = true`);
  assert.strictEqual(game.evaluate('emergencyRepairAvailable()'), true);
  assert.strictEqual(game.evaluate('emergencyRepair()'), true);
  assert.deepStrictEqual(read(game, `{ detached:partStateFor('head').detached, condition:partStateFor('head').condition, integrity:partStateFor('head').integrity, scrap:S.scrap }`), { detached:false, condition:40, integrity:60, scrap:1000 });
  assert.strictEqual(game.evaluate('canFight()'), true);
});

test('torso_with_no_integrity_left_gets_a_replacement_so_the_bot_can_fight', () => {
  const game = damagedHead({ condition:60 });
  game.evaluate(`Object.assign(partStateFor('torso'), { condition:50, integrity:0 })`);
  assert.strictEqual(game.evaluate('canFight()'), false);
  assert.strictEqual(game.evaluate('emergencyRepair()'), true);
  assert.strictEqual(game.evaluate('canFight()'), true);
});
