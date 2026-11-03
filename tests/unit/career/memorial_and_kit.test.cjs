'use strict';
// Rare parts can retire to the trophy wall, and a craftable kit pays for one re-attach.
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { loadGame, ROOT } = require('../../helpers/load-game.cjs');
const page = process.env.GAME_HTML || path.join(ROOT, 'index.html');
const read = (game, expression) => JSON.parse(game.evaluate(`JSON.stringify(${expression})`));

const spareOfRarity = (game, rarity) => game.evaluate(`var trophy = createWorkbookPartItem(Object.values(WORKBOOK_PART_BY_ID).find(row => row.rarity === '${rarity}').id, { location:'stash', condition:70, integrity:80, source:'test' }); logWorkbookPartHistory(trophy, 'fight-damaged', { condition:70 }); true`);

test('rare_spare_part_can_be_memorialised_and_keeps_its_history', () => {
  const game = loadGame(page); spareOfRarity(game, 'Rare');
  const id = game.evaluate('trophy.itemId'), name = game.evaluate('WORKBOOK_PART_BY_ID[trophy.defId].name');
  assert.strictEqual(game.evaluate('canMemorialise(trophy)'), true);
  assert.strictEqual(game.evaluate('memorialisePart(trophy.itemId)'), true);
  assert.strictEqual(game.evaluate(`S.items.some(item => item.itemId === '${id}')`), false);
  const plate = read(game, 'S.memorials[0]');
  assert.strictEqual(plate.name, name);
  assert.strictEqual(plate.rarity, 'Rare');
  assert.strictEqual(plate.integrity, 80);
  assert.ok(plate.history.some(row => row.action === 'fight-damaged'));
});

test('common_part_cannot_be_memorialised', () => {
  const game = loadGame(page); spareOfRarity(game, 'Common');
  assert.strictEqual(game.evaluate('canMemorialise(trophy)'), false);
  assert.strictEqual(game.evaluate('memorialisePart(trophy.itemId)'), false);
  assert.ok(game.evaluate('S.items.includes(trophy)'));
});

test('fitted_part_cannot_be_memorialised', () => {
  const game = loadGame(page); spareOfRarity(game, 'Epic');
  game.evaluate(`trophy.location = 'bay'; trophy.botId = S.activeBotId;`);
  assert.strictEqual(game.evaluate('memorialisePart(trophy.itemId)'), false);
});

test('pricey_stock_part_can_be_memorialised', () => {
  const game = loadGame(page);
  game.evaluate(`var stock = createPartItem(allParts().find(({ q }) => rarityOf(q) === 'proto' && !q.hidden).q.id, { location:'stash' });`);
  assert.strictEqual(game.evaluate('memorialisePart(stock.itemId)'), true);
  assert.strictEqual(game.evaluate('S.memorials.length'), 1);
});

test('memorials_survive_saving_and_reloading', () => {
  const game = loadGame(page); spareOfRarity(game, 'Rare'); game.evaluate('memorialisePart(trophy.itemId)');
  assert.strictEqual(loadGame(page, 1234, game.storage()).evaluate('S.memorials.length'), 1);
});

/** A career with a torn-off head at Rank 2, no materials, and these kits. */
function tornHead(kits) {
  const game = loadGame(page);
  game.evaluate(`S.scrap = 500; S.workbookProgression.xp = 400; for (const id of Object.keys(S.materials)) S.materials[id] = 0; S.consumables.reattachKit = ${kits}; Object.assign(partStateFor('head'), { condition:0, integrity:80, detached:true });`);
  return game;
}

test('reattach_kit_can_be_crafted_and_collected', () => {
  const game = loadGame(page);
  game.evaluate(`S.workbookProgression.xp = 400; S.materials['MT-15'] = 6; S.materials['MT-16'] = 4; S.materials['MT-02'] = 1; S.consumables.reattachKit = 0; S.sandbox = true; var order = workbookStartCraftOrder('CR-16', 1000);`);
  assert.ok(game.evaluate('!!order'));
  assert.strictEqual(game.evaluate('workbookClaimCraftOrder(order.id)'), true);
  assert.strictEqual(game.evaluate('S.consumables.reattachKit'), 1);
});

test('reattach_kit_recipe_needs_its_materials_and_rank_2', () => {
  const game = loadGame(page), blocker = () => game.evaluate(`workbookCraftRecipeBlocker(WORKBOOK_CRAFTING_RECIPE_DEFS.find(row => row.id === 'CR-16'))`);
  assert.match(blocker(), /Rank 2/);
  game.evaluate(`S.workbookProgression.xp = 400; S.materials['MT-02'] = 0;`);
  assert.match(blocker(), /Steel stock/);
});

test('reattach_with_a_kit_costs_no_scrap_or_materials_and_uses_the_kit', () => {
  const game = tornHead(1);
  assert.deepStrictEqual(read(game, `(({ total, kitsUsed }) => ({ total, kitsUsed }))(repairQuote(['head']))`), { total:0, kitsUsed:1 });
  assert.strictEqual(game.evaluate(`doRepair('head')`), true);
  assert.deepStrictEqual(read(game, `{ kits:S.consumables.reattachKit, scrap:S.scrap, detached:partStateFor('head').detached, condition:partStateFor('head').condition }`), { kits:0, scrap:500, detached:false, condition:30 });
});

test('reattach_without_a_kit_still_works_with_fee_and_materials', () => {
  const game = tornHead(0);
  assert.ok(game.evaluate(`repairQuote(['head']).total`) > 0);
  assert.strictEqual(game.evaluate(`doRepair('head')`), true);
  assert.ok(game.evaluate('S.scrap') < 500);
});

test('one_kit_only_covers_one_torn_off_part', () => {
  const game = tornHead(1);
  game.evaluate(`Object.assign(partStateFor('lead'), { condition:0, integrity:80, detached:true });`);
  const quote = read(game, `repairQuote(['head', 'lead'])`);
  assert.strictEqual(quote.kitsUsed, 1);
  assert.ok(quote.total > 0);
  assert.strictEqual(game.evaluate(`doRepair('all')`), true);
  assert.strictEqual(game.evaluate('S.consumables.reattachKit'), 0);
  assert.strictEqual(game.evaluate('hasLost()'), false);
});
