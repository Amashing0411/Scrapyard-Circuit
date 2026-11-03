'use strict';
// Plays whole careers of Scrapyard fights with the stock starter bot, repairing after each fight, and reports money and wear.
const path = require('path'), { loadGame, ROOT } = require('../tests/helpers/load-game.cjs');
const FIGHTS = +process.argv[2] || 30, CAREERS = +process.argv[3] || 12, RULES = process.env.REPAIR_RULES || '{}'; // REPAIR_RULES tries other values without editing the game
const rows = [];
for (let career = 0; career < CAREERS; career++) {
  const game = loadGame(process.env.GAME_HTML || path.join(ROOT, 'index.html'), 1234 + career);
  rows.push(JSON.parse(game.evaluate(`JSON.stringify((() => {
    const clone = value => JSON.parse(JSON.stringify(value)), league = ROSTER.filter(row => row.lg === 0), tryRules = ${RULES};
    if (tryRules.offlineHeadCondition) REPAIR_RULES.offlineHeadCondition = tryRules.offlineHeadCondition; Object.assign(REPAIR_RULES.loss, tryRules.loss || {}); Object.assign(REPAIR_RULES.replacement, tryRules.replacement || {}); if (tryRules.destroyMul !== undefined) for (const style of Object.values(STYLES)) style.destroy *= tryRules.destroyMul;
    const out = { destroyedBy:0, wins:0, repairs:0, emergencies:0, noRepair:0, stuckAt:null, wornOutAt:null, minScrap:S.scrap };
    for (let fight = 0; fight < ${FIGHTS}; fight++) {
      for (const slot of PART_STATE_SLOTS.filter(canWorkshopRepair)) { const state = repairState(slot); if (state.detached || state.condition < (tryRules.repairBelow ?? 101)) { if (doRepair(slot)) out.repairs++; else out.noRepair++; } }
      if (emergencyRepair()) out.emergencies++;
      if (repairBlocksFight()) { out.stuckAt = fight + 1; break; }
      const bot = league[fight % league.length], F = simulate(clone(playerSpec()), clone(bot), ${1000 + career * 31} + fight * 7919, { rounds:3, roundLen:45 }), win = F.winner === 0;
      storeDamage(F.f[0]); if (win) out.wins++; if (F.winner === 1 && F.finish && F.finish.choice === 'destroy') out.destroyedBy++;
      S.scrap += win ? botPurse(bot) + (F.reason !== 'Decision' ? 50 : 0) : 40 + bot.lg * 15; out.minScrap = Math.min(out.minScrap, S.scrap);
      if (out.wornOutAt === null && PART_STATE_SLOTS.some(slot => repairState(slot).integrity < REPAIR_THRESHOLD)) out.wornOutAt = fight + 1;
    }
    return { ...out, endScrap:S.scrap, integrity:Object.fromEntries(['head', 'torso', 'lead', 'rear', 'legs'].map(slot => [slot, Math.round(repairState(slot).integrity)])) };
  })())`)));
}
const mean = pick => Math.round(rows.reduce((sum, row) => sum + pick(row), 0) / rows.length);
const worn = rows.map(row => row.wornOutAt).filter(Boolean);
console.log(`${CAREERS} careers of up to ${FIGHTS} Scrapyard fights, no sponsors, salvage or part upgrades`);
console.table({
  'Wins': mean(row => row.wins), 'Times destroyed': mean(row => row.destroyedBy), 'Ending scrap': mean(row => row.endScrap), 'Lowest scrap': mean(row => row.minScrap),
  'Free emergency repairs': mean(row => row.emergencies), 'Careers stuck': rows.filter(row => row.stuckAt).length, 'Fights played': mean(row => row.stuckAt || FIGHTS),
  'Careers with a worn-out part': worn.length, 'First worn-out part at fight': worn.length ? Math.round(worn.reduce((a, b) => a + b, 0) / worn.length) : '-',
  'Head Integrity at the end': mean(row => row.integrity.head), 'Torso Integrity at the end': mean(row => row.integrity.torso)
});
