'use strict';
// Old saves must survive every change to the save format. Fixtures are real saves: see tools/make-save-fixtures.cjs.
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { loadGame, ROOT } = require('../../helpers/load-game.cjs');
const v7Save = require('../../fixtures/saves/v7-career.json'), schema9Save = require('../../fixtures/saves/schema9-custom-bot.json');
const page = process.env.GAME_HTML || path.join(ROOT, 'index.html');
const boot = save => loadGame(page, 1234, { 'scrapyard-v3': typeof save === 'string' ? save : JSON.stringify(save) });
const read = (game, expression) => JSON.parse(game.evaluate(`JSON.stringify(${expression})`));

test('v7_save_keeps_name_scrap_record_and_progress', () => {
  const game = boot(v7Save);
  const state = read(game, '{ name:S.name, scrap:S.scrap, rec:S.rec, belts:S.belts, trophies:S.trophies, history:S.history.length, isNew:IS_NEW_CAREER }');
  assert.deepStrictEqual(state, { name:'Rusty', scrap:777, rec:{ w:5, l:2, ko:3, des:1 }, belts:{ 0:true }, trophies:{ first:1 }, history:1, isNew:false });
});

test('v7_save_keeps_fitted_and_owned_parts', () => {
  const game = boot(v7Save);
  assert.strictEqual(game.evaluate('S.build.head'), 'optic');
  assert.ok(game.evaluate(`S.owned.includes('optic')`));
  assert.strictEqual(game.evaluate(`S.items.filter(item => item.kind === 'part' && item.defId === 'optic').length`), 1);
});

test('v7_damage_becomes_part_condition', () => {
  const game = boot(v7Save);
  const conditions = read(game, `Object.fromEntries(['head','torso','lead','legs'].map(slot => [slot, Math.round(partStateFor(slot).condition)]))`);
  assert.deepStrictEqual(conditions, { head:60, torso:75, lead:90, legs:30 });
  assert.deepStrictEqual(read(game, `partStateFor('legs').faults`), [{ type:'gear', severity:1 }]);
});

test('v7_save_becomes_a_one_bot_stable_with_a_truck', () => {
  const game = boot(v7Save);
  const stable = read(game, '{ bots:S.stable.map(bot => bot.name), schema:S.stableSchema, truck:S.truck.location, active:activeStableBot().name }');
  assert.deepStrictEqual(stable, { bots:['Rusty'], schema:9, truck:'garbage-town', active:'Rusty' });
});

test('custom_bot_save_keeps_fitted_parts_wear_materials_and_xp', () => {
  const game = boot(schema9Save);
  const state = read(game, `(() => { const bot = S.stable.find(row => row.name === 'Fixture'), head = workbookPartItemById(bot.workbookFittedItems.head); return { model:bot.combatModel, slots:Object.keys(bot.workbookFittedItems).sort(), condition:head.state.condition, integrity:head.state.integrity, material:S.materials['MT-01'], xp:S.workbookProgression.xp, scrap:S.scrap, inTruck:S.stable[0].storageLocation }; })()`);
  assert.deepStrictEqual(state, { model:'workbook', slots:['fists','head','leadArm','legs','rearArm','torsoCore'], condition:64, integrity:81, material:22, xp:500, scrap:5000, inTruck:'truck' });
});

const resave = save => { const game = boot(save); game.evaluate('save()'); return game.storage()['scrapyard-v3']; };

test('custom_bot_save_is_unchanged_by_saving_and_reloading', () => {
  const stored = resave(schema9Save);
  assert.deepStrictEqual(JSON.parse(resave(stored)), JSON.parse(stored));
});

// A v7 save gains a few default bot fields on its second load, then stops changing.
test('v7_save_settles_after_its_second_load', () => {
  const stored = resave(resave(v7Save));
  assert.deepStrictEqual(JSON.parse(resave(stored)), JSON.parse(stored));
});

test('v7_save_keeps_its_progress_through_repeated_loads', () => {
  const game = boot(resave(resave(v7Save)));
  assert.deepStrictEqual(read(game, '{ name:S.name, scrap:S.scrap, rec:S.rec, head:Math.round(partStateFor("head").condition) }'), { name:'Rusty', scrap:777, rec:{ w:5, l:2, ko:3, des:1 }, head:60 });
});

test('corrupt_save_starts_a_new_career_without_crashing', () => {
  const game = boot('{not json');
  assert.ok(game.evaluate('IS_NEW_CAREER'));
  assert.strictEqual(game.evaluate('S.scrap'), 250);
});

test('save_for_parts_that_no_longer_exist_starts_a_new_career', () => {
  const game = boot({ ...v7Save, build:{ ...v7Save.build, torso:'part-removed-from-game' } });
  assert.ok(game.evaluate('IS_NEW_CAREER'));
});
