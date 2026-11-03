'use strict';
// Fixed-seed fight results and starter win rates, as plain data. Shared by the golden test and the balance report.

/** Runs inside the game's scope. Returns one fingerprint per matchup plus a starter win-rate table. */
const REPORT_EXPRESSION = `(() => {
  const clone = value => JSON.parse(JSON.stringify(value)), config = { rounds: 3, roundLen: 45 };
  const seedAt = i => 1000 + i * 7919, starter = clone(playerSpec());
  const named = name => ROSTER.find(bot => bot.name === name);
  const fights = {};
  for (const [a, b] of [['Needle', 'Haybale'], ['Beacon', 'Rustbucket Rex'], ['The Foreman', 'Rivet Queen'], ['Thresher', 'Cathedral'], ['Duchess', 'Teakettle']]) {
    for (let i = 0; i < 3; i++) {
      const F = simulate(clone(named(a)), clone(named(b)), seedAt(i), config);
      fights[a + ' v ' + b + ' #' + i] = [F.winner, F.reason, +F.t.toFixed(3), F.f.map(f => [f.cnt.thrown, f.cnt.landed, f.cnt.kd, +f.cnt.dmg.toFixed(3), +f.hp.toFixed(3)])];
    }
  }
  const starterWinPct = {};
  for (const league of [0, 1, 2, 3]) {
    let wins = 0, total = 0;
    for (const bot of ROSTER.filter(row => row.lg === league)) for (let i = 0; i < 12; i++) { total++; if (simulate(clone(starter), clone(bot), seedAt(i), config).winner === 0) wins++; }
    starterWinPct[league] = Math.round(100 * wins / total);
  }
  return JSON.stringify({ roster: ROSTER.length, fights, starterWinPct });
})()`;

function fightReport(game) { return JSON.parse(game.evaluate(REPORT_EXPRESSION)); }

module.exports = { fightReport };
