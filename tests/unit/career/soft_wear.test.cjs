'use strict';
// Worn parts keep their stat penalties, but a fully repaired part starts each fight with full health.
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { loadGame, ROOT } = require('../../helpers/load-game.cjs');
const page = process.env.GAME_HTML || path.join(ROOT, 'index.html');
const read = (game, expression) => JSON.parse(game.evaluate(`JSON.stringify(${expression})`));

/** A fresh career whose head is set to this state, plus a fight between that bot and the first roster bot. */
function fightWithHead(condition, integrity) {
  const game = loadGame(page);
  game.evaluate(`Object.assign(partStateFor('head'), { condition:${condition}, integrity:${integrity} }); var F = createFight(JSON.parse(JSON.stringify(playerSpec())), JSON.parse(JSON.stringify(ROSTER[0])), 5, { rounds:3, roundLen:45 }); var me = F.f[0];`);
  return game;
}

test('fully_repaired_worn_part_starts_the_fight_at_full_health', () => {
  const game = fightWithHead(60, 60);
  assert.strictEqual(game.evaluate('me.ph.head'), game.evaluate('me.s.phMax.head'));
});

test('unrepaired_part_starts_at_its_share_of_its_integrity', () => {
  const game = fightWithHead(30, 60);
  assert.strictEqual(game.evaluate('me.ph.head / me.s.phMax.head'), .5);
});

test('torso_health_follows_the_same_rule', () => {
  const game = loadGame(page);
  game.evaluate(`Object.assign(partStateFor('torso'), { condition:50, integrity:50 }); var me = createFight(JSON.parse(JSON.stringify(playerSpec())), JSON.parse(JSON.stringify(ROSTER[0])), 5, { rounds:3, roundLen:45 }).f[0];`);
  assert.strictEqual(game.evaluate('me.hp'), game.evaluate('me.s.hp'));
});

test('worn_part_still_has_its_stat_penalty', () => {
  const fresh = fightWithHead(100, 100), worn = fightWithHead(60, 60);
  assert.ok(Math.abs(worn.evaluate('me.s.sense') - fresh.evaluate('me.s.sense') * .9) < 1e-9);
});

test('stored_condition_is_health_share_times_integrity', () => {
  const game = fightWithHead(60, 60);
  game.evaluate(`me.ph.head = me.s.phMax.head / 2; storeDamage(me);`);
  assert.deepStrictEqual(read(game, `{ condition:partStateFor('head').condition, integrity:partStateFor('head').integrity }`), { condition:30, integrity:60 });
});

test('undamaged_worn_part_keeps_its_condition_through_a_fight', () => {
  const game = fightWithHead(60, 60);
  game.evaluate('storeDamage(me)');
  assert.strictEqual(game.evaluate(`partStateFor('head').condition`), 60);
});

test('barely_alive_part_is_not_rounded_down_to_destroyed', () => {
  const game = fightWithHead(20, 20);
  game.evaluate(`me.ph.lead = me.s.phMax.lead * .001; storeDamage(me);`);
  assert.deepStrictEqual(read(game, `{ condition:partStateFor('lead').condition, detached:partStateFor('lead').detached }`), { condition:1, detached:false });
});

test('destroy_chance_follows_the_venues_wreck_risk', () => {
  const game = loadGame(page);
  assert.deepStrictEqual(read(game, `['lot', 'drain'].map(venueDestroyChance)`), [.25, .5]);
  assert.strictEqual(game.evaluate('venueDestroyChance("no-such-venue")'), 1);
});

test('fight_uses_the_destroy_chance_it_is_given', () => {
  const game = loadGame(page);
  const destroys = mul => game.evaluate(`(() => { let count = 0; const spec = { ...ROSTER[0], style:'brawler' }; for (let i = 0; i < 40; i++) { const F = simulate(JSON.parse(JSON.stringify(spec)), JSON.parse(JSON.stringify(ROSTER[1])), 100 + i * 37, { rounds:3, roundLen:45, destroyMul:${mul} }); if (F.finish && F.finish.choice === 'destroy') count++; } return count; })()`);
  assert.strictEqual(destroys(0), 0);
  assert.ok(destroys(1) > 0);
});

test('wreck_check_only_happens_as_often_as_the_venues_risk', () => {
  const game = loadGame(page);
  assert.strictEqual(game.evaluate(`fightWreckApplies('lot', .24)`), true);
  assert.strictEqual(game.evaluate(`fightWreckApplies('lot', .26)`), false);
  assert.strictEqual(game.evaluate(`fightWreckApplies('drain', .49)`), true);
  assert.strictEqual(game.evaluate(`fightWreckApplies('drain', .51)`), false);
});

test('surviving_a_torso_kill_at_a_low_risk_venue_leaves_the_bot_repairable', () => {
  const game = loadGame(page);
  game.evaluate(`Object.assign(partStateFor('torso'), { condition:0, integrity:90 }); survivedWreckCheck();`);
  assert.deepStrictEqual(read(game, `{ condition:partStateFor('torso').condition, canRepair:canWorkshopRepair('torso') }`), { condition:1, canRepair:true });
});
