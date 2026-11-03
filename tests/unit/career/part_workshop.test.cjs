'use strict';
// Scrapworks: dismantle spare parts for materials, overhaul parts to restore Integrity.
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { loadGame, ROOT } = require('../../helpers/load-game.cjs');
const page = process.env.GAME_HTML || path.join(ROOT, 'index.html');
const read = (game, expression) => JSON.parse(game.evaluate(`JSON.stringify(${expression})`));
const FASTENERS = 'MT-15', FERROUS = 'MT-01';

/** A career with no materials, plenty of scrap, Rank 2, and one spare workbook part in the stash. */
function withSpare({ integrity = 75, condition = 50, rank2 = true, defFilter = `row.material === 'Ferrous' && row.baseValueScrap === 150` } = {}) {
  const game = loadGame(page);
  game.evaluate(`S.scrap = 5000; for (const id of Object.keys(S.materials)) S.materials[id] = 0; S.workbookProgression.xp = ${rank2 ? 400 : 0}; var spare = createWorkbookPartItem(Object.values(WORKBOOK_PART_BY_ID).find(row => ${defFilter}).id, { location:'stash', condition:${condition}, integrity:${integrity}, source:'test' });`);
  return game;
}
const fitted = `activePartItem('head')`;

test('part_contains_its_family_material_scaled_by_value_plus_fasteners', () => {
  const game = withSpare(); // 150 scrap of 2-scrap ferrous, halved and capped
  assert.deepStrictEqual(read(game, 'partMaterialContent(spare)'), { [FERROUS]:12, [FASTENERS]:4 });
});

test('worthless_stock_part_still_contains_the_minimum', () => {
  const game = loadGame(page);
  assert.deepStrictEqual(read(game, `partMaterialContent(${fitted})`), { [FERROUS]:2, [FASTENERS]:4 });
});

test('dismantle_returns_the_workbook_yield_and_removes_the_part', () => {
  const game = withSpare({ integrity:75 }); // yield 30% + 0.4% × 75 = 60%
  const id = game.evaluate('spare.itemId');
  assert.deepStrictEqual(read(game, 'dismantleYield(spare)'), { [FERROUS]:7, [FASTENERS]:2 });
  assert.ok(game.evaluate('dismantlePart(spare.itemId)'));
  assert.strictEqual(game.evaluate(`S.items.some(item => item.itemId === '${id}')`), false);
  assert.deepStrictEqual(read(game, `[S.materials['${FERROUS}'], S.materials['${FASTENERS}']]`), [7, 2]);
});

test('worn_out_part_can_still_be_dismantled_and_returns_at_least_one_of_each', () => {
  const game = withSpare({ integrity:0 });
  assert.deepStrictEqual(read(game, 'dismantleYield(spare)'), { [FERROUS]:3, [FASTENERS]:1 });
  assert.ok(game.evaluate('dismantlePart(spare.itemId)'));
});

test('fitted_part_cannot_be_dismantled', () => {
  const game = loadGame(page);
  assert.strictEqual(game.evaluate(`dismantlePart(${fitted}.itemId)`), false);
  assert.ok(game.evaluate(`!!activePartItem('head')`));
});

test('dismantling_the_last_copy_of_a_stock_part_removes_it_from_owned', () => {
  const game = loadGame(page);
  game.evaluate(`var stock = createPartItem('optic', { location:'stash' }); S.owned.includes('optic') || S.owned.push('optic');`);
  assert.ok(game.evaluate('dismantlePart(stock.itemId)'));
  assert.strictEqual(game.evaluate(`owns('optic')`), false);
});

test('overhaul_adds_integrity_spends_half_the_materials_and_a_fee', () => {
  const game = withSpare({ integrity:60 });
  const quote = read(game, 'overhaulQuote(spare)');
  assert.deepStrictEqual(quote.materials, { [FERROUS]:6, [FASTENERS]:2 });
  assert.strictEqual(quote.fee, 38); // 25% of 150, rounded
  assert.strictEqual(quote.total, 38 + Math.ceil(6 * 2 * 1.2) + Math.ceil(2 * 1.2));
  assert.ok(game.evaluate('overhaulPart(spare.itemId)'));
  assert.deepStrictEqual(read(game, '{ integrity:spare.state.integrity, overhauls:spare.state.overhauls, condition:spare.state.condition, scrap:S.scrap }'), { integrity:80, overhauls:1, condition:50, scrap:5000 - quote.total });
});

test('overhaul_stops_at_the_cap_of_90', () => {
  const game = withSpare({ integrity:80 });
  assert.ok(game.evaluate('overhaulPart(spare.itemId)'));
  assert.strictEqual(game.evaluate('spare.state.integrity'), 90);
  assert.ok(game.evaluate('overhaulBlocker(spare)'));
});

test('a_part_can_only_be_overhauled_twice', () => {
  const game = withSpare({ integrity:30 });
  assert.ok(game.evaluate('overhaulPart(spare.itemId)'));
  assert.ok(game.evaluate('overhaulPart(spare.itemId)'));
  assert.strictEqual(game.evaluate('spare.state.integrity'), 70);
  assert.strictEqual(game.evaluate('overhaulPart(spare.itemId)'), false);
  assert.strictEqual(game.evaluate('spare.state.integrity'), 70);
});

test('part_below_25_integrity_cannot_be_overhauled', () => {
  const game = withSpare({ integrity:24 });
  assert.strictEqual(game.evaluate('overhaulPart(spare.itemId)'), false);
});

test('overhaul_needs_rank_2', () => {
  const game = withSpare({ rank2:false });
  assert.match(game.evaluate('overhaulBlocker(spare)'), /Rank 2/);
  assert.strictEqual(game.evaluate('overhaulPart(spare.itemId)'), false);
});

test('overhaul_is_refused_when_scrap_cannot_cover_it', () => {
  const game = withSpare();
  game.evaluate('S.scrap = 1');
  assert.strictEqual(game.evaluate('overhaulPart(spare.itemId)'), false);
  assert.strictEqual(game.evaluate('spare.state.integrity'), 75);
});

test('fitted_part_can_be_overhauled_and_raises_what_repairs_can_reach', () => {
  const game = loadGame(page);
  game.evaluate(`S.scrap = 5000; S.workbookProgression.xp = 400; Object.assign(partStateFor('head'), { condition:60, integrity:60 });`);
  assert.ok(game.evaluate(`overhaulPart(${fitted}.itemId)`));
  assert.deepStrictEqual(read(game, `{ integrity:partStateFor('head').integrity, canRepair:canWorkshopRepair('head') }`), { integrity:80, canRepair:true });
});
