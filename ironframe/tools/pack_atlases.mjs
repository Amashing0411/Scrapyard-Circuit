import fs from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {validateManifest} from "./manifest.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJSON = async p => JSON.parse(await fs.readFile(p, "utf8"));
const cfg = await readJSON(path.join(root, "config", "pipeline.json"));
const raw = path.join(root, "build", "raw");
const atlasDir = path.join(root, "build", "atlases");
const manifestDir = path.join(root, "build", "manifests");
const fatal = s => { throw new Error(s); };

async function pack() {
  let index;
  try { index = await readJSON(path.join(raw, "frames-index.json")); }
  catch { fatal("No real Blender frame index. Render an artist-approved ATOM .blend; no placeholder sprites will be generated."); }
  if (index.schemaVersion !== 1 || index.characterId !== cfg.characterId || !Array.isArray(index.frames)) fatal("Bad Blender index.");
  if (index.canvas.width !== cfg.render.width || index.canvas.height !== cfg.render.height) fatal("Frame dimensions differ from the locked Blender render preset.");
  const hold = 60 / cfg.sourceFps;
  if (!Number.isInteger(hold) || hold < 1) fatal("Source FPS must divide 60.");
  const expected = new Set();
  for (const a of cfg.actions) for (const facing of ["left","right"]) for (const pass of cfg.passes) {
    if (!pass.actions.includes(a.id)) continue;
    for (const layer of pass.layers) for (let i = 0; i < a.frames; i++) expected.add([a.id,facing,pass.state,layer.id,i].join("|"));
  }
  const found = new Map();
  for (const rec of index.frames) {
    const key = [rec.action,rec.facing,rec.state,rec.layer,rec.index].join("|");
    if (!expected.has(key) || found.has(key) || rec.holdTicks !== hold) fatal("Unexpected, duplicated or mistimed source frame " + key);
    if (!rec.pivot || !rec.groundAnchor) fatal("Frame lacks authored pivot/ground anchor " + key);
    found.set(key, rec);
  }
  for (const key of expected) if (!found.has(key)) fatal("Missing Blender frame " + key);
  const {default:sharp} = await import("sharp");
  const pad = cfg.atlas.padding, maxW = cfg.atlas.maxWidth, maxH = cfg.atlas.maxHeight;
  const prepared = [];
  for (const [key, rec] of [...found.entries()].sort(([a],[b]) => a.localeCompare(b))) {
    const filepath = path.resolve(raw, rec.file);
    if (!filepath.startsWith(raw + path.sep)) fatal("Unsafe source path");
    const meta = await sharp(filepath).metadata();
    if (meta.format !== "png" || meta.width !== cfg.render.width || meta.height !== cfg.render.height)
      fatal("Expected transparent, full-canvas Blender PNG: " + rec.file);
    const {data, info} = await sharp(filepath).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let x0=info.width, y0=info.height, x1=-1, y1=-1;
    for(let y=0; y<info.height; y++) for(let x=0; x<info.width; x++) {
      if(data[(y*info.width+x)*info.channels+3] > cfg.atlas.alphaThreshold){
        x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);
      }
    }
    if (x1 < 0) fatal("Empty/fully transparent render: " + rec.file);
    const trim={x:x0,y:y0,width:x1-x0+1,height:y1-y0+1};
    const tile=await sharp(filepath).extract({left:x0,top:y0,width:trim.width,height:trim.height})
      .extend({left:pad,top:pad,right:pad,bottom:pad,extendWith:"copy"}).png().toBuffer();
    prepared.push({...rec,trim,tile,w:trim.width+pad*2,h:trim.height+pad*2,key});
  }
  const pages=[];
  let page={items:[],x:0,y:0,row:0,w:0,h:0};
  function flush(){if(page.items.length)pages.push(page);page={items:[],x:0,y:0,row:0,w:0,h:0};}
  for(const f of prepared){
    if(f.w>maxW || f.h>maxH) fatal("Sprite exceeds maximum atlas page: "+f.key);
    if(page.x+f.w>maxW){page.x=0;page.y+=page.row;page.row=0;}
    if(page.y+f.h>maxH)flush();
    f.page=pages.length;f.px=page.x;f.py=page.y;page.items.push(f);
    page.x+=f.w;page.row=Math.max(page.row,f.h);
    page.w=Math.max(page.w,page.x);page.h=Math.max(page.h,page.y+page.row);
  }
  flush();
  await fs.mkdir(atlasDir,{recursive:true});await fs.mkdir(manifestDir,{recursive:true});
  const atlases=[];
  for(let i=0;i<pages.length;i++){
    const p=pages[i],id="atlas_"+String(i).padStart(3,"0");
    const name="atom-"+id+".png";
    await sharp({create:{width:p.w,height:p.h,channels:4,background:"#00000000"}})
      .composite(p.items.map(f=>({input:f.tile,left:f.px,top:f.py}))).png().toFile(path.join(atlasDir,name));
    atlases.push({id,image:"../atlases/"+name,width:p.w,height:p.h});
  }
  const manifest={schemaVersion:1,characterId:cfg.characterId,simulationHz:60,canvas:index.canvas,
    atlases,layerOrder:["body","forearm_r","debris_forearm_r"],actions:{}};
  for(const a of cfg.actions){
    manifest.actions[a.id]={sourceFps:cfg.sourceFps,loop:a.loop,durationTicks:a.frames*hold,events:a.events,facings:{}};
  }
  for(const f of prepared){
    const action=manifest.actions[f.action];
    const facing=action.facings[f.facing] ||= {states:{}};
    const state=facing.states[f.state] ||= {layers:{}};
    const frames=state.layers[f.layer] ||= [];
    frames.push({index:f.index,tickStart:f.index*hold,holdTicks:hold,atlasId:"atlas_"+String(f.page).padStart(3,"0"),
      rect:{x:f.px+pad,y:f.py+pad,width:f.trim.width,height:f.trim.height},
      trim:f.trim,pivot:f.pivot,groundAnchor:f.groundAnchor,sockets:f.sockets||{}});
  }
  for(const a of Object.values(manifest.actions))for(const f of Object.values(a.facings))
    for(const s of Object.values(f.states))for(const list of Object.values(s.layers))list.sort((a,b)=>a.index-b.index);
  const errors=validateManifest(manifest);
  if(errors.length)fatal("Invalid generated manifest:\n"+errors.join("\n"));
  await fs.writeFile(path.join(manifestDir,"atom.manifest.json"),JSON.stringify(manifest,null,2)+"\n");
  console.log("Packed "+prepared.length+" authentic Blender frames across "+pages.length+" atlas pages.");
}
pack().catch(err=>{console.error("IRONFRAME pack failed:",err.message);process.exitCode=1;});
