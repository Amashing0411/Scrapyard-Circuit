import test from "node:test";
import assert from "node:assert/strict";
import { validateManifest } from "../tools/manifest.mjs";
function frame(t) {
  return { tickStart:t, holdTicks:2, atlasId:"a", rect:{x:5,y:6,width:20,height:30},
    trim:{x:100,y:120,width:20,height:30}, pivot:{x:1024,y:1800}, groundAnchor:{x:1024,y:1900} };
}
function sample() {
  return {schemaVersion:1,characterId:"atom",simulationHz:60,canvas:{width:2048,height:2048},
    atlases:[{id:"a",image:"../atlases/a.png",width:1024,height:1024}],
    actions:{idle:{sourceFps:30,loop:true,durationTicks:4,events:[],facings:{
      left:{states:{intact:{layers:{body:[frame(0),frame(2)]}}}},
      right:{states:{intact:{layers:{body:[frame(0),frame(2)]}}}}}}}}};
}
test("valid 30fps source / 60Hz playback", () => assert.deepEqual(validateManifest(sample()), []));
test("detects gaps in tick timeline", () => {
  const m=sample();m.actions.idle.facings.left.states.intact.layers.body[1].tickStart=3;
  assert.ok(validateManifest(m).some(x=>x.includes("discontinuous tick")));
});
test("rejects wrong simulation rate", () => {
  const m=sample();m.simulationHz=120;
  assert.ok(validateManifest(m).some(x=>x.includes("simulationHz")));
});
test("rejects atlas overflow", () => {
  const m=sample();m.actions.idle.facings.right.states.intact.layers.body[0].rect.x=1020;
  assert.ok(validateManifest(m).some(x=>x.includes("atlas overflow")));
});
