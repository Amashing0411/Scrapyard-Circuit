'use strict';
// Average repair bill after one fight versus the purse, per league, for the stock starter bot.
const path = require('path'), { loadGame, ROOT } = require('../tests/helpers/load-game.cjs');
const game = loadGame(process.env.GAME_HTML || path.join(ROOT, 'index.html'));
const rows = JSON.parse(game.evaluate(`JSON.stringify([0, 1, 2, 3].map(league => {
  const clone = value => JSON.parse(JSON.stringify(value)), slots = PART_STATE_SLOTS, stock = clone(S.materials), reset = () => { for (const slot of slots) Object.assign(partStateFor(slot), { condition:100, integrity:100, detached:false, faults:[], patched:false, repairCount:0 }); };
  let bill = 0, fee = 0, purse = 0, wins = 0, blocked = 0, fights = 0;
  for (const bot of ROSTER.filter(row => row.lg === league)) for (let i = 0; i < 8; i++) {
    reset(); S.materials = clone(stock); for (const id of Object.keys(S.materials)) S.materials[id] = 0;
    const F = simulate(clone(playerSpec()), clone(bot), 1000 + i * 7919, { rounds:3, roundLen:45 }), win = F.winner === 0;
    storeDamage(F.f[0]); const quote = repairQuote(slots.filter(canWorkshopRepair));
    fights++; bill += quote.total; fee += quote.fee; if (win) { wins++; purse += botPurse(bot); } if (repairBlocksFight()) blocked++;
  }
  reset(); S.materials = stock;
  return { league:LEAGUES[league].name, avgBill:Math.round(bill / fights), avgFee:Math.round(fee / fights), winPct:Math.round(100 * wins / fights), avgIncome:Math.round(purse / fights), repairShare:purse ? Math.round(100 * bill / purse) : null, blockedPct:Math.round(100 * blocked / fights) };
}))`));
console.log('One fight, no materials in stock, purse only (no bonuses or sponsors). Target repair share: 30-45% of income');
console.table(rows);
