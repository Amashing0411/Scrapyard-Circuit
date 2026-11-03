'use strict';
// Prints starter win rates per league. Use --write-golden after an intended combat change to re-record the fight test.
const fs = require('fs'), path = require('path');
const { loadGame, ROOT } = require('../tests/helpers/load-game.cjs'), { fightReport } = require('../tests/helpers/fight-report.cjs');

const report = fightReport(loadGame(process.env.GAME_HTML || path.join(ROOT, 'index.html')));
const leagues = ['Scrapyard', 'Underground', 'Regional', 'Pit Championship'];
console.log('Starter bot win rate (144 fights per league, fixed seeds)');
leagues.forEach((name, i) => console.log(`  ${name.padEnd(18)} ${report.starterWinPct[i]}%`));
if (process.argv.includes('--write-golden')) {
  fs.writeFileSync(path.join(ROOT, 'tests', 'fixtures', 'fight-golden.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('Recorded tests/fixtures/fight-golden.json');
}
