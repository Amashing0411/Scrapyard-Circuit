'use strict';
// Persistent faults are cleared by workshop services; the damage report says plainly what happened to each part.
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { loadGame, ROOT } = require('../../helpers/load-game.cjs');
const customSave = require('../../fixtures/saves/schema9-custom-bot.json');
const page = process.env.GAME_HTML || path.join(ROOT, 'index.html');
const read = (game, expression) => JSON.parse(game.evaluate(`JSON.stringify(${expression})`));

/** A career with a fault on one part, no materials, and known scrap. */
function withFault(slot, type, scrap = 2000) {
  const game = loadGame(page);
  game.evaluate(`S.scrap = ${scrap}; for (const id of Object.keys(S.materials)) S.materials[id] = 0; partStateFor('${slot}').faults = [{ type:'${type}', severity:2 }];`);
  return game;
}

test('every_fault_a_fight_can_cause_has_a_service', () => {
  const game = loadGame(page);
  assert.deepStrictEqual(read(game, `Object.keys(CONDS).filter(type => !FAULT_SERVICES[type])`), []);
});

test('service_uses_the_workbook_recipe_materials', () => {
  assert.deepStrictEqual(read(withFault('torso', 'leak'), `faultServiceQuote('torso').materials`), { 'MT-17':3, 'MT-10':1 });
  assert.deepStrictEqual(read(withFault('head', 'glitch'), `faultServiceQuote('head').materials`), { 'MT-08':1 });
  assert.deepStrictEqual(read(withFault('lead', 'gear'), `faultServiceQuote('lead').materials`), { 'MT-02':2, 'MT-15':4, 'MT-09':1 });
});

test('service_clears_the_fault_and_charges_for_missing_materials', () => {
  const game = withFault('torso', 'leak'), quote = read(game, `faultServiceQuote('torso')`);
  assert.ok(quote.total > 0);
  assert.strictEqual(game.evaluate(`serviceFault('torso')`), true);
  assert.deepStrictEqual(read(game, `{ faults:partStateFor('torso').faults, scrap:S.scrap }`), { faults:[], scrap:2000 - quote.total });
});

test('service_uses_stock_on_hand_first', () => {
  const game = withFault('torso', 'plating');
  game.evaluate(`S.materials['MT-15'] = 9`);
  assert.strictEqual(game.evaluate(`faultServiceQuote('torso').total`), 0);
  assert.strictEqual(game.evaluate(`serviceFault('torso')`), true);
  assert.strictEqual(game.evaluate(`S.materials['MT-15']`), 5);
});

test('service_is_refused_when_scrap_cannot_cover_it', () => {
  const game = withFault('head', 'glitch', 1);
  assert.strictEqual(game.evaluate(`serviceFault('head')`), false);
  assert.strictEqual(game.evaluate(`partStateFor('head').faults.length`), 1);
});

test('service_on_a_healthy_part_does_nothing', () => {
  const game = loadGame(page);
  assert.strictEqual(game.evaluate(`serviceFault('head')`), false);
});

test('serviced_fault_does_not_come_back_in_the_next_fight', () => {
  const game = withFault('torso', 'leak');
  game.evaluate(`serviceFault('torso')`);
  assert.strictEqual(game.evaluate(`createFight(JSON.parse(JSON.stringify(playerSpec())), JSON.parse(JSON.stringify(ROSTER[0])), 5, { rounds:3, roundLen:45 }).f[0].cond.torso`), undefined);
});

test('custom_bot_part_can_have_its_fault_serviced', () => {
  const game = loadGame(page, 1234, { 'scrapyard-v3': JSON.stringify(customSave) });
  game.evaluate(`var bot = S.stable.find(row => row.name === 'Fixture'); bot.combatReady = true; selectStableBot(bot.id); S.scrap = 2000; var head = workbookPartItemById(bot.workbookFittedItems.head); head.state.faults = [{ type:'glitch', severity:1 }];`);
  assert.strictEqual(game.evaluate(`serviceFault('head')`), true);
  assert.strictEqual(game.evaluate('head.state.faults.length'), 0);
});

test('damage_report_lists_only_damaged_parts_with_plain_status', () => {
  const game = loadGame(page);
  game.evaluate(`Object.assign(partStateFor('head'), { condition:1, integrity:90 }); Object.assign(partStateFor('legs'), { condition:50, integrity:50 }); partStateFor('torso').faults = [{ type:'leak', severity:1 }];`);
  const rows = read(game, 'damageReportRows()');
  assert.deepStrictEqual(rows.map(row => [row.slot, row.status]), [['head', 'Broken'], ['torso', 'Coolant leak'], ['legs', 'Worn']]);
});

test('damage_report_calls_out_torn_off_and_worn_out_parts', () => {
  const game = loadGame(page);
  game.evaluate(`Object.assign(partStateFor('head'), { condition:0, integrity:90, detached:true }); Object.assign(partStateFor('lead'), { condition:20, integrity:20 });`);
  assert.deepStrictEqual(read(game, 'damageReportRows().map(row => [row.slot, row.status])'), [['head', 'Torn off'], ['lead', 'Worn out']]);
});

test('damage_report_is_empty_when_nothing_is_wrong', () => {
  assert.deepStrictEqual(read(loadGame(page), 'damageReportRows()'), []);
});
