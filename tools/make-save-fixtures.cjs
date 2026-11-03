'use strict';
// Records real saves for the save tests. The v7 save comes from the tagged v7 build; the schema 9 save comes from index.html.
// Usage: node tools/make-save-fixtures.cjs v7 | node tools/make-save-fixtures.cjs schema9
const fs = require('fs'), os = require('os'), path = require('path'), { execSync } = require('child_process');
const { loadGame, ROOT } = require('../tests/helpers/load-game.cjs');
const out = name => path.join(ROOT, 'tests', 'fixtures', 'saves', name);

const V7_PROGRESS = `(() => {
  S.name = 'Rusty'; S.nick = 'The Fixture'; S.scrap = 777; S.rec = { w:5, l:2, ko:3, des:1 };
  S.owned.push('optic'); S.build.head = 'optic';
  S.dmg = { head:.4, hull:.25, lead:.1, rear:0, legs:.7, lost:{ lead:false }, conds:[{ part:'legs', type:'gear' }] };
  S.belts = { 0:true }; S.trophies = { first:1 }; S.history.push({ opp:'homework', win:true, how:'KO', round:2 });
  S.seenIntro = true; save(); return true;
})()`;

const SCHEMA9_PROGRESS = `(() => {
  S.scrap = 5000; S.materials['MT-01'] = 12; S.workbookProgression.xp = 500;
  const frame = S.items.find(item => item.kind === 'frame' && item.location === 'stash'); assembleStableBot(1, frame.itemId, 'Fixture', 'Fighter');
  const bot = S.stable.find(row => row.name === 'Fixture'); for (let i = 0; i < 3; i++) reinforceStableFrame(frame.itemId);
  const rows = Object.values(WORKBOOK_PART_BY_ID), slots = { head:'Head', torsoCore:'Torso core', leadArm:'Arm', rearArm:'Arm', fists:'Fist', legs:'Legs' };
  for (const [key, slot] of Object.entries(slots)) { const def = rows.filter(row => row.slot === slot && row.tier === 'T1' && /^Legal$/i.test(row.legality) && /Impact|Sensors|Hull|Power|Footwork/.test(row.mainStat)).sort((a, b) => a.capacityCost - b.capacityCost)[0], item = createWorkbookPartItem(def.id, { location:'stash', condition:64, integrity:81, source:'fixture' }); fitOwnedWorkbookPart(bot.id, key, item.itemId); }
  moveStableBotToTruck(S.stable[0].id); save(); return true;
})()`;

function record(html, progress, file) {
  const game = loadGame(html); game.evaluate(progress);
  fs.mkdirSync(path.dirname(out(file)), { recursive: true });
  fs.writeFileSync(out(file), JSON.stringify(JSON.parse(game.storage()['scrapyard-v3']), null, 1) + '\n'); console.log('Recorded', file);
}
if (process.argv[2] === 'v7') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v7-')), html = path.join(dir, 'index.html');
  fs.writeFileSync(html, execSync('git show v7-combat-reference:index.html', { cwd: ROOT, maxBuffer: 1e8 }));
  record(html, V7_PROGRESS, 'v7-career.json');
} else if (process.argv[2] === 'schema9') record(path.join(ROOT, 'index.html'), SCHEMA9_PROGRESS, 'schema9-custom-bot.json');
