const $=id=>document.getElementById(id);
const ui={action:$("action"),facing:$("facing"),state:$("state"),speed:$("speed"),play:$("play"),
 prev:$("prev"),next:$("next"),restart:$("restart"),reload:$("reload"),guides:$("guides"),
 layers:$("layers"),compare:$("compare"),scrub:$("scrub"),tick:$("tick"),stage:$("stage"),
 other:$("other"),empty:$("empty"),otherEmpty:$("otherEmpty"),otherWrap:$("otherWrap"),
 details:$("details"),status:$("status")};
const url="../build/manifests/atom.manifest.json";
let manifest=null,images=new Map(),tick=0,playing=false,last=0,acc=0;
function action(){return manifest?.actions?.[ui.action.value]}
function duration(){return action()?.durationTicks||0}
function current(){return action()?.facings?.[ui.facing.value]?.states?.[ui.state.value]}
function frameAt(frames,t){return frames?.find(f=>f.tickStart<=t&&t<f.tickStart+f.holdTicks)}
function adjust(){ui.scrub.max=String(Math.max(0,duration()-1));ui.scrub.value=String(Math.min(tick,+ui.scrub.max))}
function setTick(v){tick=Math.max(0,Math.min(duration()-1,Math.floor(v)||0));draw()}
function options(el,list,old){el.replaceChildren();for(const item of list){const opt=document.createElement("option");opt.value=item;opt.textContent=item.replaceAll("_"," ");el.append(opt);}el.value=list.includes(old)?old:list[0]||"";}
function updateStates(){const states=Object.keys(action()?.facings?.[ui.facing.value]?.states||{});options(ui.state,states,ui.state.value);}
function plus(ctx,x,y,c,label){ctx.save();ctx.strokeStyle=c;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-12,y);ctx.lineTo(x+12,y);ctx.moveTo(x,y-12);ctx.lineTo(x,y+12);ctx.stroke();ctx.fillStyle=c;ctx.font="12px monospace";ctx.fillText(label,x+14,y-10);ctx.restore();}
function paint(canvas,facing){
 const ctx=canvas.getContext("2d");ctx.clearRect(0,0,canvas.width,canvas.height);
 const layers=action()?.facings?.[facing]?.states?.[ui.state.value]?.layers;
 if(!layers)return ["No authored "+ui.state.value+" render pass for "+facing];
 const messages=[];let guide=null,drawn=0;
 for(const name of manifest.layerOrder||Object.keys(layers)){
   if(name!=="body"&&!ui.layers.checked)continue;
   const fr=frameAt(layers[name],tick);if(!fr)continue;
   const image=images.get(fr.atlasId);if(!image){messages.push("Atlas not loaded: "+fr.atlasId);continue;}
   const scale=Math.min(canvas.width/manifest.canvas.width,canvas.height/manifest.canvas.height)*.9;
   const x=canvas.width*.5+(fr.trim.x-fr.groundAnchor.x)*scale;
   const y=canvas.height*.9+(fr.trim.y-fr.groundAnchor.y)*scale;
   ctx.drawImage(image,fr.rect.x,fr.rect.y,fr.rect.width,fr.rect.height,x,y,fr.rect.width*scale,fr.rect.height*scale);
   drawn++;guide ||=fr;messages.push(name+" frame "+(fr.index+1));
 }
 if(guide&&ui.guides.checked){
   const s=Math.min(canvas.width/manifest.canvas.width,canvas.height/manifest.canvas.height)*.9;
   plus(ctx,canvas.width*.5,canvas.height*.9,"#59edb3","GROUND");
   plus(ctx,canvas.width*.5+(guide.pivot.x-guide.groundAnchor.x)*s,
       canvas.height*.9+(guide.pivot.y-guide.groundAnchor.y)*s,"#ffca65","PIVOT");
 }
 return drawn ? [] : messages.length?messages:["No genuine art at selected tick/facing/state"];
}
function draw(){
 adjust();const m=paint(ui.stage,ui.facing.value);
 ui.empty.classList.toggle("hidden",m.length===0);ui.empty.textContent=m.join("; ");
 const opposite=ui.facing.value==="right"?"left":"right";
 ui.otherWrap.classList.toggle("hidden",!ui.compare.checked);
 if(ui.compare.checked){const other=paint(ui.other,opposite);ui.otherEmpty.classList.toggle("hidden",other.length===0);ui.otherEmpty.textContent=other.join("; ");}
 ui.tick.textContent="Tick "+(duration()?tick+1:0)+" / "+duration()+" at 60Hz";
 const a=action(),ev=a?.events?.filter(e=>e.tick===tick)||[];
 ui.details.textContent=["Source: "+(manifest?.characterId||"none"),
 "Animation: "+(ui.action.value||"none")+" | "+ui.facing.value+" | "+ui.state.value,
 "Source frames/sec: "+(a?.sourceFps||"—")+" | combat sim: 60Hz",
 "Elapsed sim time: "+(tick/60).toFixed(3)+" seconds",
 "Events at this tick: "+(ev.length?ev.map(e=>e.type).join(", "):"none authored"),
 "This preview is NOT connected to fight hit detection."].join("\n");
}
function next(){const a=action();if(!a)return;if(tick+1>=a.durationTicks){if(a.loop)tick=0;else{playing=false;ui.play.textContent="Play";tick=a.durationTicks-1;}}else tick++;}
async function load(){
 playing=false;ui.play.textContent="Play";images.clear();manifest=null;tick=0;acc=0;ui.status.textContent="Loading...";
 try{
  const resp=await fetch(url,{cache:"no-store"});if(!resp.ok)throw new Error("No valid manifest (HTTP "+resp.status+")");
  const m=await resp.json();if(m.schemaVersion!==1||m.simulationHz!==60||!m.actions||!Array.isArray(m.atlases))throw new Error("Bad manifest; validate it first");
  const base=new URL(url,location.href);
  const loaded=await Promise.all(m.atlases.map(a=>new Promise(resolve=>{
    const image=new Image();image.onload=()=>resolve({id:a.id,image});
    image.onerror=()=>resolve({id:a.id,error:true});image.src=new URL(a.image,base).href;
  })));
  if(loaded.some(a=>a.error))throw new Error("An authentic atlas image could not be loaded");
  for(const rec of loaded)images.set(rec.id,rec.image);
  manifest=m;options(ui.action,Object.keys(m.actions),ui.action.value);updateStates();
  ui.status.textContent="Loaded "+loaded.length+" real Blender atlas pages.";
 }catch(e){ui.status.textContent="No production sprites available: "+e.message+". This preview never fabricates character art.";}
 draw();
}
function animate(now){
 if(!last)last=now;
 const delta=Math.min(100,now-last);last=now;
 if(playing&&duration()){acc+=delta*Number(ui.speed.value);let budget=12;
  while(acc>=1000/60&&budget-- > 0){next();acc-=1000/60;}
  if(budget<0)acc=0;}
 draw();requestAnimationFrame(animate);
}
ui.action.onchange=()=>{tick=0;updateStates();draw();};
ui.facing.onchange=()=>{updateStates();draw();};
for(const name of ["state","guides","layers","compare"])ui[name].onchange=draw;
ui.play.onclick=()=>{if(!duration())return;playing=!playing;ui.play.textContent=playing?"Pause":"Play";};
ui.prev.onclick=()=>{playing=false;ui.play.textContent="Play";setTick(tick-1);};
ui.next.onclick=()=>{playing=false;ui.play.textContent="Play";next();draw();};
ui.restart.onclick=()=>setTick(0);
ui.reload.onclick=load;
ui.scrub.oninput=()=>{playing=false;ui.play.textContent="Play";setTick(Number(ui.scrub.value));};
load();requestAnimationFrame(animate);
