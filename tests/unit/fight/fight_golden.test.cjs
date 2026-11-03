'use strict';
// Guards the fight sim: same seeds, same fights. If a change is meant to alter combat, regenerate with tools/balance-report.cjs --write-golden.
const test = require('node:test'), assert = require('node:assert'), path = require('path');
const { loadGame, ROOT } = require('../../helpers/load-game.cjs'), { fightReport } = require('../../helpers/fight-report.cjs');
const golden = require('../../fixtures/fight-golden.json');

test('fixed_seed_fights_match_the_recorded_results', () => {
  // Arrange
  const game = loadGame(process.env.GAME_HTML || path.join(ROOT, 'index.html'));
  // Act
  const report = fightReport(game);
  // Assert
  assert.deepStrictEqual(report, golden);
});
