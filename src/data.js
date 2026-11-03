/* ---- data.js ---- */
/* ---------- career state ---------- */
const PAINTS = [['Hazard', '#e8b10c'], ['Rust', '#b5562b'], ['Cobalt', '#3f6fb5'], ['Signal red', '#c7362f'], ['Patina', '#5fae8f'], ['Bone', '#d8d2c2'], ['Gunmetal', '#555d66'], ['Ultraviolet', '#7a4fc9'], ['Tractor green', '#5e7d3a'], ['Harbor blue', '#24506a'], ['Ceramic', '#e8e4da'], ['Night', '#2a2e33']];
const ACCENTS = [['Yellow', '#f0b20a'], ['White', '#ebe7de'], ['Black', '#16181b'], ['Red', '#d94a5a'], ['Teal', '#3fb6a8'], ['Violet', '#c9a6ff'], ['Orange', '#ff7a2a'], ['Sky', '#9fd3e0']];
const DECALS = [['none', 'None'], ['stripe', 'Racing stripes'], ['chevron', 'Chevrons'], ['checker', 'Checker band'], ['bolt', 'Lightning'], ['ring', 'Target'], ['number', 'Number'], ['flame', 'Flames'], ['shark', 'Shark mouth'], ['tally', 'Kill tally']];
const LEAGUES = [{ name: 'Scrapyard', purse: 110 }, { name: 'Underground', purse: 190 }, { name: 'Regional', purse: 290 }, { name: 'Pit Championship', purse: 420 }];
/* ROSTER-START */
const ROSTER = [
  { id: 'homework', lg: 0, name: 'Homework', rec: '2–6', build: { head: 'fab-homework', torso: 'fabt-homework', lead: 'servo', rear: 'servo', legs: 'struts', back: 'cells' }, hd: { shell: 'bullet', eyes: 'grid', glow: 'cyan', mouth: 'none', crest: 'antenna', mat: 'tin' }, td: { shell: 'heater', core: 'battery', mat: 'tin' }, style: 'outboxer', trait: 'lucky', mech: 'twins', paint: '#3f6fb5', accent: '#ebe7de', decal: 'number', num: 101, lore: "A high school robotics club project that got out of hand. The permission slip is still taped inside." },
  { id: 'monsoon', lg: 0, name: 'Monsoon', rec: '3–6', build: { head: 'halo', torso: 'combine', arms: 'davit', legs: 'hocks', back: 'gyro' }, style: 'outboxer', trait: 'lucky', mech: 'benny', paint: '#4a5a6a', accent: '#9fd3e0', decal: 'bolt', lore: 'Comes in like weather. Long arms, cold sensors and no wasted motion.' },
  { id: 'gaff', lg: 0, venue: 'harbor', name: 'Gaff Hook', rec: '4–5', build: { head: 'bosun', torso: 'ballast', lead: 'davit', rear: 'pipe', legs: 'stumps' }, style: 'outboxer', trait: 'stock', mech: 'twins', paint: '#1f3a52', accent: '#f0b20a', decal: 'stripe', lore: 'Unloads containers on the night shift and fights on weekends. Longest arms on the docks.' },
  { id: 'graveyard', lg: 0, name: 'Graveyard Shift', rec: '5–5', build: { head: 'fab-graveyard', torso: 'fabt-graveyard', lead: 'prism', rear: 'prism', legs: 'spider', back: 'stacks' }, hd: { shell: 'skull', eyes: 'goggles', glow: 'green', mouth: 'grille', crest: 'pipes', mat: 'ti' }, td: { shell: 'heater', core: 'gauge', mat: 'ti' }, style: 'counter', trait: 'hothands', mech: 'doc', paint: '#2a2e33', accent: '#5cff9a', decal: 'none', lore: "A hospital night janitor builds it between floors. Quiet as the third shift." },
  { id: 'dumpster', lg: 0, name: 'Dumpster Diva', rec: '6–4', build: { head: 'fab-dumpster', torso: 'fabt-dumpster', lead: 'aria', rear: 'gatling', legs: 'poise', back: 'coil' }, hd: { shell: 'wedge', eyes: 'scanner', glow: 'violet', mouth: 'speaker', crest: 'fin', mat: 'tin' }, td: { shell: 'rollcage', core: 'engine', mat: 'tin' }, style: 'swarmer', trait: 'showboat', mech: 'twins', paint: '#e05aa0', accent: '#9fd3e0', decal: 'bolt', lore: "Every panel came out of a dumpster behind the mall. Somehow every panel matches." },
  { id: 'mamafixit', lg: 0, name: 'Mama Fixit', rec: '7–4', build: { head: 'fab-mamafixit', torso: 'fabt-mamafixit', lead: 'pipe', rear: 'pipe', legs: 'stumps', back: 'toolbox' }, hd: { shell: 'box', eyes: 'twin', glow: 'amber', mouth: 'speaker', crest: 'handle', mat: 'tin' }, td: { shell: 'drum', core: 'gauge', mat: 'tin' }, style: 'counter', trait: 'stock', mech: 'benny', paint: '#d8d2c2', accent: '#c7362f', decal: 'none', lore: "Built by a laundromat owner out of two dryers and a lot of nerve. Still smells like fabric softener." },
  { id: 'beacon', lg: 0, name: 'Beacon', rec: '8–3', build: { head: 'lantern', torso: 'reactor', lead: 'prism', rear: 'prism', legs: 'spider', back: 'gyro' }, style: 'outboxer', trait: 'general', mech: 'twins', paint: '#e8e4da', accent: '#8fd8ff', decal: 'ring', lore: 'Built by a lighthouse keeper who lost his job to automation. It sees punches before they leave.' },
  { id: 'rex', lg: 0, name: 'Rustbucket Rex', rec: '9–3', build: { head: 'bucket', torso: 'barrel', arms: 'pipe', legs: 'stumps', back: 'toolbox' }, style: 'brawler', trait: 'stock', mech: 'benny', paint: '#9a4a26', accent: '#f0b20a', decal: 'stripe', lore: 'Patched together from three wrecks behind a tire shop. Swings like it owes somebody money.' },
  { id: 'steamhammer', lg: 0, name: 'Steam Hammer', rec: '10–2', build: { head: 'dome', torso: 'boiler', lead: 'davit', rear: 'ram', legs: 'piston', back: 'none' }, style: 'outboxer', trait: 'stock', mech: 'twins', paint: '#555d66', accent: '#b8733a', decal: 'stripe', lore: 'Long reach on the left and a steam ram on the right. It sets you up, then sends the bill.' },
  { id: 'faithful', lg: 0, name: 'Old Faithful', rec: '41–19', build: { head: 'dome', torso: 'foundry', arms: 'talon', legs: 'pylons' }, style: 'counter', trait: 'secondwind', mech: 'doc', paint: '#6b5a3a', accent: '#ebe7de', decal: 'number', num: 1, lore: 'Twenty years on the circuit and never counted out. The crowd stands when it walks in.' },
  { id: 'needle', lg: 0, name: 'Needle', rec: '12–1', build: { head: 'optic', torso: 'spindle', arms: 'servo', legs: 'struts', back: 'cells' }, style: 'outboxer', trait: 'stock', mech: 'twins', paint: '#d9dde0', accent: '#4fa3d9', decal: 'none', lore: 'Built by a physics teacher for a science fair. It never got the A, so it learned to jab instead.' },
  { id: 'haybale', lg: 0, name: 'Haybale', rec: '13–1', build: { head: 'silo', torso: 'barrel', arms: 'pipe', legs: 'harrow' }, style: 'brawler', trait: 'bulldozer', mech: 'benny', paint: '#5e7d3a', accent: '#f0b20a', decal: 'chevron', lore: 'Nine harvests behind a plow before it found the ring. It still hits like a tractor.' },

  { id: 'brine', lg: 1, venue: 'harbor', name: 'Little Brine', rec: '8–5', build: { head: 'bosun', torso: 'barrel', arms: 'pipe', legs: 'stumps' }, style: 'swarmer', trait: 'lucky', mech: 'benny', paint: '#2f6f73', accent: '#ebe7de', decal: 'checker', lore: 'Fished out of the harbor with barnacles still on its shins. Small, fast and stubborn.' },
  { id: 'socket', lg: 1, name: 'Socket Jo', rec: '9–5', build: { head: 'bucket', torso: 'spindle', arms: 'servo', legs: 'poise' }, style: 'outboxer', trait: 'hothands', mech: 'benny', paint: '#c7362f', accent: '#ebe7de', decal: 'bolt', lore: 'A delivery-drone chassis stretched into a fighter. Jo keeps it plugged in until the bell.' },
  { id: 'glacier', lg: 1, name: 'Glacier', rec: '10–4', build: { head: 'silo', torso: 'foundry', arms: 'baler', legs: 'bollard' }, style: 'brawler', trait: 'scrapper', mech: 'doc', paint: '#bfd3dc', accent: '#24506a', decal: 'checker', lore: 'Slow to start and impossible to stop. The last thing most challengers remember is the cold.' },
  { id: 'pinball', lg: 1, name: 'Pinball', rec: '11–4', build: { head: 'crt', torso: 'spindle', lead: 'gatling', rear: 'gatling', legs: 'wheel', back: 'none' }, style: 'swarmer', trait: 'lucky', mech: 'twins', paint: '#5fae8f', accent: '#ebe7de', decal: 'checker', lore: 'Never stops rolling. It bounces off the ropes faster than most bots can turn.' },
  { id: 'kettledrum', lg: 1, name: 'Kettle Drum', rec: '12–3', build: { head: 'fab-kettledrum', torso: 'fabt-kettledrum', lead: 'pipe', rear: 'pipe', legs: 'harrow', back: 'none' }, hd: { shell: 'dome', eyes: 'goggles', glow: 'amber', mouth: 'grille', crest: 'horns', mat: 'steel' }, td: { shell: 'drum', core: 'speaker', mat: 'steel' }, style: 'brawler', trait: 'showboat', mech: 'benny', paint: '#a3262f', accent: '#f0b20a', decal: 'chevron', lore: "A marching band teacher's weekend build. It keeps time on your ribs." },
  { id: 'wreckless', lg: 1, name: 'Wreckless', rec: '13–3', build: { head: 'cab', torso: 'vault', lead: 'talon', rear: 'wrecker', legs: 'bollard', back: 'none' }, style: 'brawler', trait: 'bulldozer', mech: 'doc', paint: '#c7362f', accent: '#ebe7de', decal: 'bolt', lore: 'Took the guard rails off its own legs. Trades two hits for one and likes the math.' },
  { id: 'grudge', lg: 1, name: 'Grudge', rec: '27–12', build: { head: 'dome', torso: 'barrel', arms: 'talon', legs: 'stumps' }, style: 'brawler', trait: 'secondwind', mech: 'benny', paint: '#3b3f45', accent: '#d94a5a', decal: 'number', num: 13, lore: 'Lost its first twelve fights, then won twenty-seven. It remembers every one of the losses.' },
  { id: 'deacon', lg: 1, name: 'Tin Deacon', rec: '15–2', build: { head: 'bucket', torso: 'barrel', arms: 'baler', legs: 'stumps' }, style: 'counter', trait: 'general', mech: 'benny', paint: '#6d7378', accent: '#ebe7de', decal: 'number', num: 7, lore: 'Won as a parish raffle prize. It counts its blessings, then it counts your mistakes.' },
  { id: 'duchess', lg: 1, name: 'Duchess', rec: '16–1', build: { head: 'visor', torso: 'forge', arms: 'talon', legs: 'hocks', back: 'stacks' }, style: 'outboxer', trait: 'general', mech: 'doc', paint: '#a3262f', accent: '#ebe7de', decal: 'ring', lore: 'Sabre factory showpiece. Surgical, polite and very rarely beaten.' },
  { id: 'harbor', lg: 1, venue: 'harbor', name: 'Harbormaster', rec: '17–1', build: { head: 'visor', torso: 'ballast', arms: 'davit', legs: 'hocks' }, style: 'outboxer', trait: 'scrapper', mech: 'twins', paint: '#d8d2c2', accent: '#24506a', decal: 'stripe', lore: 'Runs the toughest pier in the city. Fights by the tide tables and never hurries.' },
  { id: 'teakettle', lg: 1, name: 'Teakettle', rec: '18–0', build: { head: 'furnace', torso: 'boiler', lead: 'ram', rear: 'ram', legs: 'piston', back: 'none' }, style: 'brawler', trait: 'pressure', mech: 'benny', paint: '#b8733a', accent: '#16181b', decal: 'none', lore: 'Boils over by the second round. Its crew keeps a bucket of water ringside for the gauge.' },
  { id: 'tollbooth', lg: 1, name: 'Tollbooth', rec: '19–0', build: { head: 'fab-tollbooth', torso: 'fabt-tollbooth', lead: 'davit', rear: 'pipe', legs: 'bollard', back: 'none' }, hd: { shell: 'can', eyes: 'slits', glow: 'red', mouth: 'vent', crest: 'lamp', mat: 'steel' }, td: { shell: 'crate', core: 'plate', mat: 'steel', tag: 'PAY TOLL' }, style: 'counter', trait: 'general', mech: 'twins', paint: '#c98a2b', accent: '#16181b', decal: 'checker', lore: "Built from a toll plaza that cameras replaced. Nobody gets through for free." },

  { id: 'paperweight', lg: 2, name: 'Paperweight', rec: '14–4', build: { head: 'fab-paperweight', torso: 'fabt-paperweight', lead: 'talon', rear: 'talon', legs: 'hocks', back: 'gyro' }, hd: { shell: 'hex', eyes: 'grid', glow: 'cyan', mouth: 'none', crest: 'antenna', mat: 'ti' }, td: { shell: 'chest', core: 'battery', mat: 'ti' }, style: 'outboxer', trait: 'general', mech: 'doc', paint: '#555d66', accent: '#9fd3e0', decal: 'ring', lore: "A retired accountant's hobby. It does the math on every punch and is rarely wrong." },
  { id: 'mismatch', lg: 2, name: 'Mismatch', rec: '15–4', build: { head: 'crt', torso: 'barrel', lead: 'gatling', rear: 'wrecker', legs: 'stumps', back: 'none' }, style: 'brawler', trait: 'hothands', mech: 'benny', paint: '#3f6fb5', accent: '#ff7a2a', decal: 'number', num: 2, lore: 'One buzzing fast hand and one wrecking ball. Opponents never know which side to cover.' },
  { id: 'cinder', lg: 2, name: 'Cinderblock', rec: '16–4', build: { head: 'furnace', torso: 'boiler', lead: 'pipe', rear: 'ram', legs: 'stumps', back: 'stacks' }, style: 'counter', trait: 'scrapper', mech: 'benny', paint: '#6b5a3a', accent: '#ff7a2a', decal: 'chevron', lore: 'A boiler on stumps with a steam ram in the right hand. Slow to anger and hard to dent.' },
  { id: 'channel9', lg: 2, name: 'Channel Nine', rec: '17–3', build: { head: 'crt', torso: 'jukebox', lead: 'gatling', rear: 'gatling', legs: 'wheel', back: 'cells' }, style: 'swarmer', trait: 'lucky', mech: 'twins', paint: '#e05aa0', accent: '#ffd24a', decal: 'checker', lore: 'A pawnshop television bolted to a jukebox. When it is winning, the screen smiles at you.' },
  { id: 'fridgemagnet', lg: 2, name: 'Fridge Magnet', rec: '18–3', build: { head: 'fab-fridgemagnet', torso: 'fabt-fridgemagnet', lead: 'baler', rear: 'baler', legs: 'stumps', back: 'fins' }, hd: { shell: 'box', eyes: 'mono', glow: 'cyan', mouth: 'teeth', crest: 'handle', mat: 'tin' }, td: { shell: 'fridge', core: 'grille', mat: 'tin' }, style: 'counter', trait: 'ironjaw', mech: 'benny', paint: '#e8e4da', accent: '#3fb6a8', decal: 'none', lore: "Two refrigerators and one bad attitude. It still hums when it stands still." },
  { id: 'undertow', lg: 2, venue: 'harbor', name: 'Undertow', rec: '19–3', build: { head: 'bosun', torso: 'combine', arms: 'baler', legs: 'bollard' }, style: 'counter', trait: 'ironjaw', mech: 'twins', paint: '#24506a', accent: '#9fd3e0', decal: 'checker', lore: 'Built from a salvage tug. Drags every fight into deep water and waits.' },
  { id: 'lamplighter', lg: 2, name: 'Lamplighter', rec: '20–2', build: { head: 'lantern', torso: 'gallery', lead: 'prism', rear: 'aria', legs: 'spider', back: 'toolbox' }, style: 'counter', trait: 'secondwind', mech: 'benny', paint: '#24506a', accent: '#ffd24a', decal: 'none', lore: 'Carries its own pit kit on its back and patches itself up between rounds.' },
  { id: 'nightjar', lg: 2, name: 'Nightjar', rec: '21–2', build: { head: 'lumen', torso: 'gallery', arms: 'talon', legs: 'poise', back: 'fins' }, style: 'counter', trait: 'hothands', mech: 'doc', paint: '#2a2e33', accent: '#c9a6ff', decal: 'none', lore: 'Ceramic and silent under the lights. Most bots never see the counter coming.' },
  { id: 'jackpot', lg: 2, name: 'Jackpot', rec: '22–2', build: { head: 'crt', torso: 'jukebox', lead: 'aria', rear: 'gatling', legs: 'poise', back: 'cells' }, style: 'swarmer', trait: 'showboat', mech: 'twins', paint: '#7a4fc9', accent: '#ffd24a', decal: 'number', num: 77, lore: 'Lit up like a casino floor and twice as loud. It plays to the cheap seats every round.' },
  { id: 'cathedral', lg: 2, name: 'Cathedral', rec: '23–1', build: { head: 'dome', torso: 'combine', arms: 'pile', legs: 'bollard' }, style: 'counter', trait: 'ironjaw', mech: 'doc', paint: '#d8d2c2', accent: '#a3262f', decal: 'chevron', lore: 'Forty-six kilograms of armor on a combine core. Fans just call it the building.' },
  { id: 'busstop', lg: 2, name: 'Bus Stop', rec: '24–1', build: { head: 'fab-busstop', torso: 'fabt-busstop', lead: 'pipe', rear: 'ram', legs: 'stumps', back: 'none' }, hd: { shell: 'slab', eyes: 'visor', glow: 'amber', mouth: 'vent', crest: 'lamp', mat: 'steel' }, td: { shell: 'crate', core: 'plate', mat: 'steel', tag: 'ROUTE 9' }, style: 'brawler', trait: 'bulldozer', mech: 'benny', paint: '#e8b10c', accent: '#16181b', decal: 'stripe', lore: "Assembled from a retired city bus by its last driver. It still stops for nobody." },
  { id: 'thresher', lg: 2, name: 'Thresher', rec: '25–1', build: { head: 'silo', torso: 'combine', lead: 'baler', rear: 'pile', legs: 'harrow' }, style: 'brawler', trait: 'bulldozer', mech: 'benny', paint: '#a37a1c', accent: '#16181b', decal: 'chevron', lore: 'A combine harvester rebuilt to fight. The intake still spins when it gets angry.' },

  { id: 'sickle', lg: 3, name: 'Sickle', rec: '19–3', build: { head: 'optic', torso: 'gallery', lead: 'aria', rear: 'prism', legs: 'hover' }, style: 'swarmer', trait: 'glass', mech: 'twins', paint: '#3fb6a8', accent: '#16181b', decal: 'chevron', lore: 'Light, sharp and always circling. Cuts angles you did not know the ring had.' },
  { id: 'velvet', lg: 3, name: 'Velvet', rec: '21–3', build: { head: 'lumen', torso: 'gallery', arms: 'aria', legs: 'poise', back: 'fins' }, style: 'counter', trait: 'general', mech: 'twins', paint: '#e8e4da', accent: '#3fb6a8', decal: 'none', lore: 'Gallery-white and quiet. It lets you swing, then makes you pay for every one.' },
  { id: 'sparky', lg: 3, name: 'Sparky Malou', rec: '23–3', build: { head: 'halo', torso: 'barrel', arms: 'arc', legs: 'hover', back: 'coil' }, style: 'swarmer', trait: 'pressure', mech: 'benny', paint: '#7a4fc9', accent: '#f0b20a', decal: 'bolt', lore: 'Volta fists on a junkyard barrel. Never stops coming and never stops crackling.' },
  { id: 'wildfire', lg: 3, name: 'Wildfire', rec: '25–2', build: { head: 'visor', torso: 'forge', arms: 'arc', legs: 'hover', back: 'stacks' }, style: 'swarmer', trait: 'pressure', mech: 'twins', paint: '#c2602f', accent: '#f0b20a', decal: 'stripe', lore: 'Runs hot on purpose. Every round it burns brighter until something gives.' },
  { id: 'nightshift', lg: 3, name: 'Night Shift', rec: '27–2', build: { head: 'cab', torso: 'combine', lead: 'baler', rear: 'wrecker', legs: 'harrow', back: 'none' }, style: 'brawler', trait: 'scrapper', mech: 'benny', paint: '#2a2e33', accent: '#f0b20a', decal: 'chevron', lore: 'Clocks in at midnight. Every punch sounds like a building site.' },
  { id: 'kiln', lg: 3, name: 'Kiln', rec: '29–2', build: { head: 'dome', torso: 'foundry', arms: 'pile', legs: 'stumps' }, style: 'counter', trait: 'ironjaw', mech: 'doc', paint: '#4d5a45', accent: '#ff7a2a', decal: 'none', lore: 'Waits behind a wall of foundry steel. One clean shot is all it needs.' },
  { id: 'lastcall', lg: 3, name: 'Last Call', rec: '31–1', build: { head: 'fab-lastcall', torso: 'fabt-lastcall', lead: 'baler', rear: 'baler', legs: 'stumps', back: 'none' }, hd: { shell: 'box', eyes: 'slits', glow: 'red', mouth: 'jaw', crest: 'horns', mat: 'ti' }, td: { shell: 'crate', core: 'speaker', mat: 'ti' }, style: 'brawler', trait: 'scrapper', mech: 'benny', paint: '#7a2e24', accent: '#f0b20a', decal: 'number', num: 3, lore: "The bartender's bot from the bar under the bridge. It cuts you off after three rounds." },
  { id: 'sprocket', lg: 3, name: 'Saint Sprocket', rec: '33–1', build: { head: 'fab-sprocket', torso: 'fabt-sprocket', lead: 'talon', rear: 'pipe', legs: 'piston', back: 'toolbox' }, hd: { shell: 'hex', eyes: 'cross', glow: 'white', mouth: 'jaw', crest: 'antenna', mat: 'steel' }, td: { shell: 'chest', core: 'plate', mat: 'steel', tag: 'PARISH 3' }, style: 'outboxer', trait: 'secondwind', mech: 'twins', paint: '#e8e4da', accent: '#d4a017', decal: 'none', lore: "The parish repair shop's pride. Blessed before every fight and patched every Monday." },
  { id: 'demoday', lg: 3, name: 'Demo Day', rec: '35–1', build: { head: 'cab', torso: 'vault', lead: 'wrecker', rear: 'wrecker', legs: 'piston', back: 'none' }, style: 'counter', trait: 'ironjaw', mech: 'doc', paint: '#e8b10c', accent: '#16181b', decal: 'stripe', lore: 'Leased from a demolition crew between jobs. The operator in the cab never takes off the hard hat.' },
  { id: 'towtess', lg: 3, name: 'Tow Truck Tess', rec: '37–0', build: { head: 'fab-towtess', torso: 'fabt-towtess', lead: 'wrecker', rear: 'pipe', legs: 'piston', back: 'none' }, hd: { shell: 'wedge', eyes: 'visor', glow: 'amber', mouth: 'teeth', crest: 'lamp', mat: 'steel' }, td: { shell: 'chest', core: 'engine', mat: 'steel' }, style: 'brawler', trait: 'bulldozer', mech: 'benny', paint: '#c7362f', accent: '#ebe7de', decal: 'stripe', lore: "Built by twin sisters who run a body shop. It hooks you and drags you to the ropes." },
  { id: 'rivet', lg: 3, name: 'Rivet Queen', rec: '39–0', build: { head: 'halo', torso: 'capacitor', arms: 'arc', legs: 'poise', back: 'coil' }, style: 'swarmer', trait: 'showboat', mech: 'twins', paint: '#7a4fc9', accent: '#f0b20a', decal: 'bolt', lore: 'Crowd favorite of the Volta circuit. Throws in bunches and bows after every round.' },
  { id: 'foreman', lg: 3, hull: 1.3, name: 'The Foreman', rec: '41–0', build: { head: 'visor', torso: 'forge', arms: 'talon', legs: 'pylons' }, style: 'brawler', trait: 'bulldozer', mech: 'doc', paint: '#2e3338', accent: '#f0b20a', decal: 'stripe', lore: 'Runs the Pit. Has destroyed nineteen bots and keeps their heads on a shelf.' },
];
/* ROSTER-END */
const WEARS = [['Factory fresh', 'Clean paint, no stories yet'], ['Road-worn', 'Chipped paint and a few dents'], ['Battle-scarred', 'Rust streaks, dents and welded patch plates'], ['Junkyard legend', 'Held together by welds, rust and spite']];
const WEAR_OF = { homework: 1, dumpster: 3, mamafixit: 2, monsoon: 1, graveyard: 3, pinball: 2, needle: 0, channel9: 2, gaff: 2, fridgemagnet: 3, socket: 1, beacon: 1, haybale: 3, deacon: 2, rex: 3, cathedral: 1, steamhammer: 2, faithful: 3, tollbooth: 2, undertow: 2, brine: 3, harbor: 1, mismatch: 2, lamplighter: 2, duchess: 0, kettledrum: 2, wreckless: 3, cinder: 2, teakettle: 2, kiln: 1, glacier: 1, nightjar: 0, paperweight: 1, velvet: 0, thresher: 2, jackpot: 0, demoday: 3, sickle: 0, grudge: 3, busstop: 2, nightshift: 2, sparky: 2, wildfire: 1, towtess: 2, lastcall: 3, sprocket: 2, rivet: 0, foreman: 1 };
const DECAL_OF = { foreman: ['tally', 19], wildfire: ['flame'], teakettle: ['flame'], lastcall: ['shark'], wreckless: ['shark'], demoday: ['tally', 11], grudge: ['tally', 27], towtess: ['flame'] };
const HOMES = ['the Rust Belt', 'Pier 9', 'Southside', 'the Flats', 'Old Mill Road', 'Route 9', 'the Tannery', 'Cold Spring', 'the Railyards', 'Eastside', 'Saint Agnes Parish', 'the Boneyard', 'Copper Hill', 'Lowtown', 'the Canal District', 'Gasworks Row'];
/* signature moves: every bot has one, the player can learn and equip one */
const SIG_MOVES = {
  haymaker: { name: 'Haymaker', kind: 'hay', target: 'head', windup: .72, power: 1.12, initial: 3.2, cooldown: 15, maxUses: 2, tell: 'SHOULDER COCKS · HIGH HAYMAKER', cost: 0, desc: 'A huge, slow overhand to the head.' },
  lance: { name: 'Lance Jab', kind: 'jab', target: 'head', windup: .46, rangeBonus: 40, initial: 2.4, cooldown: 8, maxUses: 3, tell: 'ARM TELESCOPES · LONG JAB', feint: { tell: 'SHOULDER TWITCH · CHECK', duration: .24, chance: .24 }, cost: 120, desc: 'A jab from way outside. Sometimes it is only a feint.' },
  liver: { name: 'Liver Hook', kind: 'hook', target: 'body', windup: .42, power: 1.1, initial: 2.2, cooldown: 9, maxUses: 3, tell: 'HIPS DIP · BODY HOOK', cost: 140, desc: 'A fast hook that digs under the ribs.' },
  rib: { name: 'Rib Breaker', kind: 'cross', target: 'body', windup: .5, power: 1.12, initial: 2, cooldown: 9, maxUses: 3, tell: 'GUARD OPENS · BODY CROSS', cost: 150, desc: 'A straight shot to the battery housing.' },
  spear: { name: 'Spear Cross', kind: 'cross', target: 'head', windup: .5, rangeBonus: 26, power: 1.08, initial: 2.6, cooldown: 10, maxUses: 3, tell: 'STEPS OUT · LONG CROSS', feint: { tell: 'FOOT SLIDES · CHECK', duration: .26, chance: .22 }, cost: 160, desc: 'Steps in from range behind a long cross.' },
  drop: { name: 'Foundry Drop', kind: 'upper', target: 'head', windup: .64, power: 1.16, initial: 3, cooldown: 12, maxUses: 2, tell: 'WEIGHT DROPS · HIGH UPPERCUT', cost: 180, desc: 'Plants low and launches an uppercut.' },
  press: { name: 'Press Gang', kind: 'hay', target: 'body', windup: .72, power: 1.15, initial: 3, cooldown: 13, maxUses: 3, tell: 'SHOULDERS LOCK · BODY HAYMAKER', cost: 220, desc: 'A crushing haymaker aimed at the chassis.' },
};
const STYLE_SIG = { brawler: 'haymaker', swarmer: 'liver', outboxer: 'lance', runner: 'spear', counter: 'drop', defensive: 'rib' };
const ARM_SIG_NAME = { arc: 'Arc Flash', ram: 'Steam Ram', wrecker: 'Wrecking Ball', pile: 'Pile Driver', baler: 'Baler Press', talon: 'Talon Draw', gatling: 'Buzzsaw', davit: 'Crane Hook', prism: 'Prism Lance', aria: 'Aria Snap', pipe: 'Pipe Swing', servo: 'Servo Snap' };
const SIG_OVERRIDE = { rex: 'haymaker', needle: 'lance', sparky: 'rib', kiln: 'drop', foreman: 'press', grudge: 'haymaker', faithful: 'drop', duchess: 'liver' };
const SIG_NAME = { rex: 'Rent Money', needle: 'Science Fair', sparky: 'Coil Flash', kiln: 'Foundry Drop', foreman: 'Press Gang', grudge: 'Twelve Losses', faithful: 'Old Reliable', duchess: 'Talon Draw', beacon: 'Lighthouse', homework: 'Late Homework', cathedral: 'Bell Tower', glacier: 'Avalanche', jackpot: 'Jackpot', rivet: 'Encore' };
function sigFor(o) {
  const base = SIG_MOVES[SIG_OVERRIDE[o.id] || STYLE_SIG[o.style] || 'haymaker'], arm = base.kind === 'jab' || base.kind === 'hook' ? o.build.lead : o.build.rear;
  return { ...base, name: SIG_NAME[o.id] || ARM_SIG_NAME[arm] || base.name };
}
const SCOUT = { hay: 'Slip or step clear when the shoulder draws back, then punish the recovery.', jab: 'Hold your slip for the full draw. An early slip just gives it a free jab.', hook: 'Fast and low. Cover up or step back out of hook range.', cross: 'Move off the line when the guard opens and counter the recovery.', upper: 'It plants first. Back out of range and make it miss.' };
ROSTER.forEach((o, i) => {
  normBuild(o.build); o.wear = WEAR_OF[o.id] ?? 1; o.wseed = hashStr(o.id) % 9999;
  if (DECAL_OF[o.id]) { o.decal = DECAL_OF[o.id][0]; o.tally = DECAL_OF[o.id][1] || 0; }
  o.signature = sigFor(o); o.scout = `${o.signature.name}: ${o.signature.tell.toLowerCase()}. ${SCOUT[o.signature.kind]}`;
  o.home = o.venue === 'harbor' ? 'Pier 9' : HOMES[hashStr(o.id + 'h') % HOMES.length];
});
registerRosterFabs(ROSTER);
const BOT = id => ROSTER.find(b => b.id === id) || ROSTER[0];
const botPurse = o => LEAGUES[o.lg].purse + ROSTER.filter(b => b.lg === o.lg).findIndex(b => b.id === o.id) * 12;
const FRAME_DEFS = [
  ['laundromat-shell','Laundromat Shell','JL','Light',30,10,2,0,1,1,1,90,70,'Average','Bad frame: tiny capacity, rattles (−5% sensing)',40,'The Crater'],
  ['shopping-cart-rig','Shopping-Cart Rig','DR','Light',28,12,2,0,0,2,1,80,65,'Fast','Wheeled base only; cannot use walker legs',60,'The Drain'],
  ['forklift-frame','Forklift Frame','JL','Middle',55,16,2,1,2,1,2,210,85,'Slow','Starter: tough, low capacity',0,'Starter'],
  ['church-raffle-chassis','Church Raffle Chassis','GB','Light',38,14,2,1,1,1,2,150,80,'Average','Underdog: +1 capacity after every 5 wins (max +6)',0,'Starter (Ironside)'],
  ['grain-elevator-frame','Grain Elevator Frame','HL','Heavy',70,18,2,1,3,1,2,240,90,'Slow','+0.1 balance',380,'Outer farm belt'],
  ['dockhand-mk-ii','Dockhand Mk II','TW','Middle',52,20,2,1,2,2,2,200,88,'Average','Waterproof: ignores puddle slips',420,'Floodline Docks'],
  ['boiler-barrel','Boiler Barrel','AB','Middle',50,18,2,2,2,1,2,190,85,'Average','Two back sockets; runs hot',360,'Kiln Row'],
  ['co-op-mule','Co-op Mule','GR','Middle',48,20,2,1,2,2,3,180,95,'Average','Repairs cost −20%; Integrity −1 per repair',400,'Grange co-op yard'],
  ['wrecking-cradle','Wrecking Cradle','BR','Heavy',75,18,2,1,3,0,2,260,85,'Slow','Shove +25%; no utility socket',520,'Demolition lots'],
  ['neon-skeleton','Neon Skeleton','CT','Light',34,22,2,1,1,1,3,130,70,'Very fast','+6% dodge; plates cost double capacity',480,'Neon Strip'],
  ['pit-dog-frame','Pit Dog Frame','RW','Middle',54,20,2,1,2,1,3,200,75,'Average','Illegal sockets: can mount banned weapons',450,'Rustmouth'],
  ['substation-saint','Substation Saint','CS','Middle',46,22,2,2,1,1,3,170,75,'Average','Tesla parts cost −2 capacity',460,'Copperline Substation'],
  ['union-anvil','Union Anvil','KB','Heavy',72,20,2,1,3,1,2,250,92,'Slow','Ceramic plates cost −1 capacity',540,'Kiln Row'],
  ['courier-frame-k4','Courier Frame K-4','KS','Light',36,24,2,1,1,1,3,140,80,'Very fast','+10% footwork',900,'Kestrel Raceway'],
  ['sentinel-chassis','Sentinel Chassis','HO','Middle',44,28,2,1,2,2,4,170,85,'Fast','+1 firmware socket; needs Halcyon clinic repairs above Rare',1400,'Halcyon Spire'],
  ['riot-containment-unit','Riot Containment Unit','OB','Heavy',68,24,2,1,4,1,3,280,90,'Slow','Four plate sockets; slow guard drop',1200,'Obelisk auction'],
  ['grid-warden','Grid Warden','VT','Middle',50,26,2,2,2,1,3,190,85,'Average','Battery +20%; only charges fully at Volta stations',1300,'Copperline Substation'],
  ['duelist-frame','Duelist Frame','SB','Middle',46,26,2,1,2,1,4,180,85,'Fast','+5% crits; voids warranty in gang venues',1500,'Security yards'],
  ['press-frame','Press Frame','MR','Heavy',82,28,2,1,3,2,3,300,92,'Slow','Huge load and hull',1800,'Factory Ruin'],
  ['titan-gantry','Titan Gantry','MR','Super-heavy',110,32,2,2,4,2,4,380,95,'Very slow','Super-heavyweight class only',3200,'Meridian contract'],
  ['spire-seraph','Spire Seraph','HO','Light',40,34,2,1,1,2,5,160,80,'Very fast','Iconic: prototype. Bound on pickup',0,'Deep Vault'],
  ['abattoir','Abattoir','RW','Heavy',76,30,2,1,3,1,4,290,70,'Average','Iconic: +15% damage to broken parts; illegal everywhere licensed',0,'Rustmouth champion drop'],
  ['old-faithfuls-frame',"Old Faithful's Frame",'GB','Middle',52,24,2,1,2,1,3,220,60,'Average','Iconic: legendary 41–19 veteran frame; low Integrity, huge history',0,'Retired champion event']
].map(([id,name,maker,weightClass,load,capacity,armSockets,backSockets,plateSockets,utilitySockets,modSockets,hull,maxIntegrity,mobility,quirk,price,found]) => ({ id,name,maker,weightClass,load,capacity,sockets:{ arms:armSockets,back:backSockets,plates:plateSockets,utility:utilitySockets,mods:modSockets },hull,maxIntegrity,mobility,quirk,price,found }));
const FRAME_BY_ID = Object.fromEntries(FRAME_DEFS.map(frame => [frame.id, frame]));
const STABLE_ROLES = ['Fighter','Scavenger','Hauler','Sparring Partner','Show Bot'];
const normalizeStableRole = value => STABLE_ROLES.find(role => role.toLowerCase() === String(value || '').toLowerCase()) || 'Fighter';
const DEFAULT = { build: { head: 'bucket', torso: 'barrel', arms: 'pipe', legs: 'stumps' }, paint: '#e8b10c', accent: '#16181b', decal: 'none', num: 7, style: 'outboxer', mech: 'benny', trait: 'stock', opp: 'homework', name: 'Ironside',
  scrap: 250, rec: { w: 0, l: 0, ko: 0, des: 0 }, owned: ['bucket', 'barrel', 'pipe', 'stumps'], mechs: ['benny'], chips: ['stock'], wins: [], sandbox: false, rounds: 3, len: 45,
  nick: 'The Underdog', home: 'Eastside', story: 'Built from a dead forklift and a church raffle prize. Nobody gave it a chance.', wear: 1, sig: 'haymaker', sigs: ['haymaker'], plan: 'balanced', training: {}, history: [], ctrl: 'coach', seenIntro: false, dmg: {}, partWear: {}, stable: [], activeBotId: 'bot-starter', stableSchema: 9, stableBays: 2, stableDay: 1, starterFramesSeeded: false, starterChurchReinforcementApplied: false, equippedItems: {}, items: [], nextItemId: 1, hallOfWrecks: [], truckSchema: 4, truckSeeded: false, truck: null, rivals: {}, belts: {}, holders: {}, world: null, walkout: 'anthem', pyro: 'fire', gym: 1, tune: {}, worn: {}, market: null, workbookMarket: null, workbookLedger: [], workbookProgression: { xp:0 }, event: null, mods: {}, tourney: null, sponsor: null, sponsorsDone: 0, trophies: {}, workbookAchievements: {}, venueWins: [], h2h: {}, news: [], voicePrefs: { pbp: '', color: '' },
  nextRunId:1, workbookRunHistory:[], workbookRun: null, workbookBlueprints:[], workbookTutorial:{ status:'available', runId:null, rewardGranted:false, foundItemIds:[] }, opt: { punchcam: true, reduced: false, cb: false, keys: {}, music: .6, sfx: .85, crowd: .8, voice: .9, announcer: true, commentary: true, shake: true, subtitles: true, cinematic: true, hazards: true, replays: true } };
const SLOT = (() => { try { return clamp(+localStorage.getItem('scrapyard-slot') || 0, 0, 2); } catch (e) { return 0; } })(), slotKey = i => i ? 'scrapyard-v3-s' + i : 'scrapyard-v3', SAVE_KEY = slotKey(SLOT);
let S = JSON.parse(JSON.stringify(DEFAULT)), IS_NEW_CAREER = true;
try { const go = JSON.parse(localStorage.getItem('scrapyard-opt') || 'null'); if (go && typeof go === 'object') S.opt = { ...S.opt, ...go }; } catch (e) {}
try { const sv = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (sv && sv.build && (part('head', sv.build.head) || String(sv.build.head).indexOf('fab') === 0) && (part('torso', sv.build.torso) || String(sv.build.torso).indexOf('fab') === 0) && part('legs', sv.build.legs) && (part('arms', sv.build.arms) || (part('arms', sv.build.lead) && part('arms', sv.build.rear)))) { IS_NEW_CAREER = false; S = { ...S, ...sv, rec: { ...S.rec, ...sv.rec } }; } } catch (e) {}
const BOT_STATE_FIELDS = ['build', 'equippedItems', 'paint', 'accent', 'decal', 'num', 'style', 'mech', 'trait', 'name', 'nick', 'home', 'story', 'wear', 'sig', 'sigs', 'plan', 'training', 'history', 'rec', 'dmg', 'partWear', 'walkout', 'pyro', 'tune', 'worn', 'mods'];
const saveCopy = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const botStateSnapshot = () => Object.fromEntries(BOT_STATE_FIELDS.map(key => [key, saveCopy(S[key])]));
function syncActiveBot() {
  if (!Array.isArray(S.stable) || !S.stable.length) return;
  const bot = S.stable.find(entry => entry.id === S.activeBotId); if (!bot) return;
  if (bot.combatModel === 'workbook') {
    for (const key of BOT_STATE_FIELDS) if (!['build','equippedItems','partWear','worn','tune','mods'].includes(key)) bot[key] = saveCopy(S[key]);
    return;
  }
  if (!S.partWear || typeof S.partWear !== 'object') S.partWear = {};
  for (const slot of ['head', 'torso', 'lead', 'rear', 'legs', 'back']) { const id = S.build && S.build[slot], item = id && activePartItem(slot, id); if (item) S.partWear[wearKey(slot, id)] = saveCopy(item.state); }
  bot.equippedItems = saveCopy(S.equippedItems || {});
  Object.assign(bot, botStateSnapshot());
}
function migrateStable() {
  let changed = false;
  if (!Array.isArray(S.stable)) { S.stable = []; changed = true; }
  if (!S.stable.length) {
    const id = 'bot-starter';
    S.activeBotId = id; S.stable = [{ id, bayIndex: 0, storageLocation: 'garage', frameItemId: null, role: 'Fighter', fatigue: 0, survivedFights: 0, wrecksSurvived: 0, veteran: false, legend: false, frameCapacityBonus: 0, legendPaintUnlocked: false, legendCrowdBonus: false, partsHistory: [], makers: [], scars: [], ...botStateSnapshot() }];
    return true;
  }
  const seen = new Set(), activeIndex = Math.max(0, S.stable.findIndex(bot => bot && bot.id === S.activeBotId));
  S.stable = S.stable.map((entry, index) => {
    const bot = entry && typeof entry === 'object' ? entry : {}, active = index === activeIndex;
    let id = String(bot.id || `bot-${index + 1}`); while (seen.has(id)) id = `${id}-${index + 1}`; seen.add(id);
    const fields = Object.fromEntries(BOT_STATE_FIELDS.map(key => [key, bot[key] === undefined ? saveCopy(active ? S[key] : DEFAULT[key]) : saveCopy(bot[key])]));
    const storageLocation = bot.storageLocation === 'truck' ? 'truck' : 'garage';
    const combatModel = bot.combatModel === 'workbook' || bot.combatReady === false ? 'workbook' : 'legacy';
    changed ||= id !== bot.id || bot.combatModel !== combatModel || bot.storageLocation !== storageLocation || storageLocation === 'truck' && +bot.bayIndex !== -1 || !Number.isFinite(+bot.bayIndex) || !Array.isArray(bot.partsHistory) || !Array.isArray(bot.makers) || !Array.isArray(bot.scars) || !Number.isFinite(+bot.fatigue);
    return { ...bot, id, combatModel, storageLocation, bayIndex: storageLocation === 'truck' ? -1 : clamp(Number.isFinite(+bot.bayIndex) ? Math.floor(+bot.bayIndex) : index, 0, 7), frameItemId: bot.frameItemId || null, equippedItems: bot.equippedItems && typeof bot.equippedItems === 'object' && !Array.isArray(bot.equippedItems) ? bot.equippedItems : {}, role: normalizeStableRole(bot.role), fatigue: clamp(Number.isFinite(+bot.fatigue) ? +bot.fatigue : 0, 0, 100), survivedFights: Math.max(0, Math.floor(+bot.survivedFights || 0)), wrecksSurvived: Math.max(0, Math.floor(+bot.wrecksSurvived || 0)), veteran: !!bot.veteran, legend: !!bot.legend, frameCapacityBonus: Math.max(0, Math.floor(+bot.frameCapacityBonus || 0)), legendPaintUnlocked: !!bot.legendPaintUnlocked, legendCrowdBonus: !!bot.legendCrowdBonus, partsHistory: Array.isArray(bot.partsHistory) ? bot.partsHistory : [], makers: Array.isArray(bot.makers) ? bot.makers : [], scars: Array.isArray(bot.scars) ? bot.scars : [], ...fields };
  });
  for (const bot of S.stable) if (bot) { const wreckStatus = bot.wreckStatus === 'salvageable' ? 'salvageable' : '', loaner = !!bot.loaner; changed ||= bot.wreckStatus !== wreckStatus || bot.loaner !== loaner; bot.wreckStatus = wreckStatus; bot.loaner = loaner; }
  for (const bot of S.stable) if (bot) { const src = bot.fightRecord && typeof bot.fightRecord === 'object' ? bot.fightRecord : bot.rec || DEFAULT.rec, fightRecord = { w:Math.max(0, Math.floor(+src.w || 0)), l:Math.max(0, Math.floor(+src.l || 0)), ko:Math.max(0, Math.floor(+src.ko || 0)), des:Math.max(0, Math.floor(+src.des || 0)) }; changed ||= JSON.stringify(bot.fightRecord) !== JSON.stringify(fightRecord); bot.fightRecord = fightRecord; }
  for (const bot of S.stable) if (bot && bot.legend && !bot.legendCrowdBonus) { bot.legendCrowdBonus = true; changed = true; }
  let active = S.stable.find(bot => bot.id === S.activeBotId);
  if (!active) { active = S.stable[0]; S.activeBotId = active.id; changed = true; }
  for (const key of BOT_STATE_FIELDS) if (active[key] !== undefined) S[key] = saveCopy(active[key]);
  if (!S.equippedItems || typeof S.equippedItems !== 'object' || Array.isArray(S.equippedItems)) S.equippedItems = {};
  S.stableSchema = Math.max(9, Math.floor(+S.stableSchema || 1));
  return changed;
}
function save() { try { syncActiveBot(); localStorage.setItem(SAVE_KEY, JSON.stringify(S)); localStorage.setItem('scrapyard-opt', JSON.stringify(S.opt)); } catch (e) {} }
if (!Array.isArray(S.items)) S.items = [];
S.workbookBlueprints = normalizeWorkbookBlueprintInventory(S.workbookBlueprints);
if (!Array.isArray(S.hallOfWrecks)) S.hallOfWrecks = [];
if (!S.materials || typeof S.materials !== 'object' || Array.isArray(S.materials)) S.materials = {};
if (!S.consumables || typeof S.consumables !== 'object' || Array.isArray(S.consumables)) S.consumables = {};
S.consumables.patchKit = Math.max(0, Math.floor(+S.consumables.patchKit || 0));
if (!S.workbookProgression || typeof S.workbookProgression !== 'object' || Array.isArray(S.workbookProgression)) S.workbookProgression = { xp:0 };
S.workbookProgression.xp = Math.max(0, Math.floor(+S.workbookProgression.xp || 0));
S.workbookCraftOrders = Array.isArray(S.workbookCraftOrders) ? S.workbookCraftOrders.filter(order => order && typeof order === 'object' && WORKBOOK_CRAFTING_RECIPE_DEFS.some(recipe => recipe.id === order.recipeId) && ['working','ready','claimed'].includes(order.status)).map(order => ({ id:String(order.id || ''), recipeId:String(order.recipeId), station:String(order.station || ''), outputMaterial:WORKBOOK_MATERIAL_BY_ID[order.outputMaterial] ? order.outputMaterial : '', startedAt:Math.max(0, Math.floor(+order.startedAt || 0)), readyAt:Math.max(0, Math.floor(+order.readyAt || 0)), status:['working','ready','claimed'].includes(order.status) ? order.status : 'working', claimedAt:Math.max(0, Math.floor(+order.claimedAt || 0)) })) : [];
S.nextCraftOrderId = Math.max(1, Math.floor(+S.nextCraftOrderId || 1));
for (const order of S.workbookCraftOrders) { const match = /^craft-([0-9a-z]+)$/.exec(order.id), serial = match ? parseInt(match[1], 36) : NaN; if (Number.isSafeInteger(serial)) S.nextCraftOrderId = Math.max(S.nextCraftOrderId, serial + 1); }
S.nextRunId = Math.max(1, Math.floor(+S.nextRunId || 1));
S.workbookRunHistory = normalizeWorkbookRunHistory(S.workbookRunHistory);
S.workbookRun = normalizeWorkbookRunState(S.workbookRun);
S.workbookTutorial = S.workbookTutorial && typeof S.workbookTutorial === 'object' && !Array.isArray(S.workbookTutorial) ? S.workbookTutorial : { status:'available', runId:null, rewardGranted:false, foundItemIds:[] };
S.workbookTutorial = { status:['available','active','awaiting-first-pit','complete'].includes(S.workbookTutorial.status) ? S.workbookTutorial.status : 'available', runId:typeof S.workbookTutorial.runId === 'string' ? S.workbookTutorial.runId : null, rewardGranted:!!S.workbookTutorial.rewardGranted, foundItemIds:Array.isArray(S.workbookTutorial.foundItemIds) ? S.workbookTutorial.foundItemIds.filter(id => typeof id === 'string') : [] };
if (S.workbookTutorial.status === 'complete') S.workbookTutorial.rewardGranted = true;
if (S.workbookRun?.tutorial) { S.workbookTutorial.runId = S.workbookRun.id; if (S.workbookRun.status === 'active' && !S.workbookTutorial.rewardGranted) S.workbookTutorial.status = 'active'; else if (S.workbookRun.status === 'extracted' && !S.workbookTutorial.rewardGranted) S.workbookTutorial.status = 'awaiting-first-pit'; }
else if (S.workbookTutorial.status === 'active') { S.workbookTutorial.status = 'available'; S.workbookTutorial.runId = null; }
if (['extracted','failed'].includes(S.workbookRun?.status) && !S.workbookRunHistory.some(row => row.id === S.workbookRun.id)) {
  const report = S.workbookRun.lastReport, failed = S.workbookRun.status === 'failed';
  S.workbookRunHistory.push({ id:S.workbookRun.id, tutorial:!!S.workbookRun.tutorial, hardcore:!!S.workbookRun.hardcore, districtKey:S.workbookRun.districtKey, seed:S.workbookRun.seed, party:[...S.workbookRun.party], nodes:[], visitedNodeIds:[], heat:report.heat, usedPicks:report.usedPicks, startedDay:S.workbookRun.startedDay, extractedDay:report.extractedDay || 1, failedDay:report.failedDay || 1, state:failed ? 'failed' : 'extracted', failureMode:report.failureMode || '', carry:[], lostCarry:report.lostCarry || [], carryValueScrap:report.carryValueScrap || 0, towFeeRequired:report.towFeeRequired || 0, towFeeCharged:report.towFeeCharged || 0, towFeeWaived:report.towFeeWaived || 0, towedParts:report.towedParts || [], lostTorso:report.lostTorso || null, banked:report.banked || [] });
}

for (const row of S.workbookRunHistory) { const match = /^run-([0-9a-z]+)$/.exec(row.id), serial = match ? parseInt(match[1], 36) : NaN; if (Number.isSafeInteger(serial)) S.nextRunId = Math.max(S.nextRunId, serial + 1); }
if (S.workbookRun?.id) { const match = /^run-([0-9a-z]+)$/.exec(S.workbookRun.id), serial = match ? parseInt(match[1], 36) : NaN; if (Number.isSafeInteger(serial)) S.nextRunId = Math.max(S.nextRunId, serial + 1); }
for (const material of WORKBOOK_MATERIAL_DEFS) S.materials[material.id] = Math.max(0, Math.floor(+S.materials[material.id] || 0));
function workbookMaterialCount(id) { return Math.max(0, Math.floor(+S.materials?.[id] || 0)); }
function addWorkbookMaterial(id, count = 1) { if (!WORKBOOK_MATERIAL_BY_ID[id]) return false; const amount = Math.max(0, Math.floor(+count || 0)); if (!amount) return false; S.materials[id] = workbookMaterialCount(id) + amount; return true; }
function consumeWorkbookMaterials(inputs) { const rows = Array.isArray(inputs) ? inputs : []; if (rows.some(([id, count]) => !WORKBOOK_MATERIAL_BY_ID[id] || workbookMaterialCount(id) < Math.max(0, Math.floor(+count || 0)))) return false; for (const [id, count] of rows) S.materials[id] = workbookMaterialCount(id) - Math.max(0, Math.floor(+count || 0)); return true; }
function workbookReconcileCraftOrders(now = Date.now()) {
  let changed = false;
  for (const order of S.workbookCraftOrders || []) if (order.status === 'working' && order.readyAt <= now) { order.status = 'ready'; changed = true; }
  if (changed) save();
  return changed;
}
function workbookCraftOrderEta(order, now = Date.now()) {
  const remaining = Math.max(0, Math.ceil((Math.max(+order.startedAt || 0, +order.readyAt || 0) - now) / 1000));
  return remaining >= 60 ? `${Math.ceil(remaining / 60)} min` : `${remaining}s`;
}
function workbookCraftRecipeBlocker(recipe) {
  const minRank = ['CR-01','CR-02'].includes(recipe?.id) ? 2 : recipe?.id === 'CR-06' ? 1 : 0;
  if (!recipe || !minRank || recipe.skill !== 0) return 'Reference only';
  if (!S.sandbox && workbookRankState().rank < minRank) return `Reach Rank ${minRank}`;
  if (!S.sandbox) {
    const missing = recipe.inputs.filter(([id,count]) => workbookMaterialCount(id) < count).map(([id,count]) => `${count - workbookMaterialCount(id)} ${WORKBOOK_MATERIAL_BY_ID[id]?.name || id}`);
    if (missing.length) return `Need ${missing.join(', ')}`;
    if (recipe.scrapPowerFee && +S.scrap < recipe.scrapPowerFee) return `Need ${recipe.scrapPowerFee} Scrap power`;
  }
  return '';
}
function workbookStartCraftOrder(recipeId, now = Date.now()) {
  const recipe = WORKBOOK_CRAFTING_RECIPE_DEFS.find(row => row.id === recipeId);
  if (!recipe || !['CR-01','CR-02','CR-06'].includes(recipe.id) || recipe.skill !== 0 || (!recipe.outputMaterial && recipe.id !== 'CR-01') || workbookCraftRecipeBlocker(recipe)) return null;
  workbookReconcileCraftOrders(now);
  if (!S.sandbox && !consumeWorkbookMaterials(recipe.inputs)) return null;
  if (!S.sandbox && recipe.scrapPowerFee) S.scrap = Math.max(0, Math.floor(+S.scrap || 0) - recipe.scrapPowerFee);
  const queuedUntil = Math.max(now, ...(S.workbookCraftOrders || []).filter(order => order.station === recipe.station && order.status === 'working').map(order => order.readyAt));
  const startedAt = queuedUntil, readyAt = startedAt + (S.sandbox ? 0 : recipe.minutes * 60000), serial = S.nextCraftOrderId++;
  const order = { id:`craft-${serial.toString(36)}`, recipeId:recipe.id, station:recipe.station, outputMaterial:recipe.outputMaterial, startedAt, readyAt, status:readyAt <= now ? 'ready' : 'working', claimedAt:0 };
  S.workbookCraftOrders.push(order); save(); return order;
}
function workbookClaimCraftOrder(orderId) {
  workbookReconcileCraftOrders();
  const order = (S.workbookCraftOrders || []).find(row => row.id === orderId && row.status === 'ready'), recipe = order && WORKBOOK_CRAFTING_RECIPE_DEFS.find(row => row.id === order.recipeId);
  if (!order || !recipe) return false;
  if (recipe.outputMaterial) { if (!addWorkbookMaterial(recipe.outputMaterial, 1)) return false; }
  else if (recipe.id === 'CR-01') S.consumables.patchKit = Math.max(0, +S.consumables.patchKit || 0) + 1;
  else return false;
  order.status = 'claimed'; order.claimedAt = Date.now(); save(); return true;
}
if (!Array.isArray(S.owned)) S.owned = [...DEFAULT.owned];
S.nextItemId = Math.max(1, Math.floor(+S.nextItemId || 1));
const owns = id => id === 'none' || S.sandbox || S.owned.includes(id) || S.items.some(item => item && item.kind === 'part' && item.defId === id);
const ownsMech = id => S.sandbox || S.mechs.includes(id);
if (S.hd) registerFab('head', 'fab-you', S.hd, 'Workshop Head'); if (S.td) registerFab('torso', 'fabt-you', S.td, 'Workshop Chassis'); if (!part('head', S.build.head)) S.build.head = 'bucket'; if (!part('torso', S.build.torso)) S.build.torso = 'barrel'; if (!S.venue) S.venue = 'auto';
S.opt = { ...DEFAULT.opt, ...(S.opt || {}) }; S.voicePrefs = { ...DEFAULT.voicePrefs, ...(S.voicePrefs || {}) }; if (!SIG_MOVES[S.sig]) S.sig = 'haymaker'; if (!Array.isArray(S.sigs)) S.sigs = ['haymaker']; if (!Array.isArray(S.history)) S.history = []; if (!GAMEPLANS[S.plan]) S.plan = 'balanced'; S.training = normalizeTraining(S.training); if (!STYLES[S.style]) S.style = 'outboxer'; if (!DECALS.some(d => d[0] === S.decal)) S.decal = 'none'; S.wear = clamp(+S.wear || 0, 0, 3); if (S.ctrl !== 'pilot') S.ctrl = 'coach'; for (const k of ['dmg', 'partWear', 'rivals', 'belts', 'h2h', 'holders']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {}; if (!S.defend || typeof S.defend !== 'object') S.defend = null; S.gym = clamp(Math.floor(+S.gym || 0), 0, 3); if (!S.trophies || typeof S.trophies !== 'object' || Array.isArray(S.trophies)) S.trophies = {}; if (!S.workbookAchievements || typeof S.workbookAchievements !== 'object' || Array.isArray(S.workbookAchievements)) S.workbookAchievements = {}; if (!Array.isArray(S.venueWins)) S.venueWins = []; for (const k of ['tune', 'worn', 'mods']) if (!S[k] || typeof S[k] !== 'object' || Array.isArray(S[k])) S[k] = {}; if (!Array.isArray(S.news)) S.news = []; if (!MECHS[S.mech]) S.mech = 'benny';
normBuild(S.build); if (!part('back', S.build.back)) S.build.back = 'none'; migrateStable(); if (S.stable.some(bot => bot && bot.id === S.activeBotId && bot.combatModel === 'workbook')) { S.build = saveCopy(DEFAULT.build); S.equippedItems = {}; S.partWear = {}; S.worn = {}; S.tune = {}; S.mods = {}; } normBuild(S.build); if (!part('back', S.build.back)) S.build.back = 'none'; if (!Array.isArray(S.wins)) S.wins = []; if (!Array.isArray(S.chips)) S.chips = ['stock']; if (!TRAITS[S.trait]) S.trait = 'stock'; if (!ROSTER.some(b => b.id === S.opp)) S.opp = 'homework';
const ownsChip = id => S.sandbox || S.chips.includes(id);
const lgOpen = lg => S.sandbox || lg === 0 || ROSTER.filter(b => b.lg === lg - 1 && S.wins.includes(b.id)).length >= 3;
const champOf = lg => { const h = S.holders && S.holders[lg] && ROSTER.find(b => b.id === S.holders[lg] && b.lg === lg); return h || ROSTER.filter(b => b.lg === lg).slice(-1)[0]; };
const isChamp = id => { const b = BOT(id); return !!b && champOf(b.lg).id === b.id; };
const TITLE_NEED = 4, BELTS = ['Scrapyard belt', 'Underground belt', 'Regional belt', 'Pit Championship belt'];
const lgWins = lg => ROSTER.filter(b => b.lg === lg && !isChamp(b.id) && S.wins.includes(b.id)).length;
const titleReady = lg => S.sandbox || lgWins(lg) >= TITLE_NEED;
const botOpen = id => { const b = BOT(id); return lgOpen(b.lg) && (!isChamp(id) || titleReady(b.lg) || !!S.belts[b.lg] || S.wins.includes(id)); };
function boutKind(id) {
  const o = BOT(id); if (!o) return null;
  if (isChamp(id) && !S.belts[o.lg]) return { kind: 'title', lg: o.lg };
  if (S.defend && S.defend.id === id && S.belts[S.defend.lg]) return { kind: 'defence', lg: S.defend.lg };
  return null;
}
const rivalOf = id => S.rivals[id] && S.rivals[id].heat > 0 ? S.rivals[id] : null;
const RIVAL_WHY = { ko: 'Put you on the canvas', decision: 'Took a decision off you', destroyed: 'You scrapped it. It was rebuilt angry', beat2: 'Lost to you twice and wants a third', belt: 'You took its belt' };
const RIVAL_TAUNT = {
  ko: ['Same result next time, {me}. Bring a softer chin.', 'I still have your paint on my knuckles.', 'You went down once. You will go down again.'],
  decision: ['The judges saw it. Next time I leave no doubt.', 'Points are points, {me}. Let me show you the knockout.'],
  destroyed: ['You scrapped me. They welded me back. I remember everything.', 'Rebuilt. Rewired. Coming for your head, {me}.', 'New bolts, same grudge.'],
  beat2: ['Twice is luck. Three times is a pattern. Let us find out.', 'I have watched the tape a hundred times, {me}.'],
  belt: ['That belt is mine. I am coming to collect it.', 'Enjoy the gold while it lasts, {me}.'],
};
function bumpRival(id, d, why) {
  const r = S.rivals[id] || { heat: 0, why, w: 0 }; r.heat = clamp(r.heat + d, 0, 3); if (d > 0) r.why = why; S.rivals[id] = r;
  if (r.heat <= 0) { delete S.rivals[id]; return 'settled'; }
  const live = Object.entries(S.rivals).filter(([, v]) => v.heat > 0).sort((a, b) => b[1].heat - a[1].heat);
  for (const [k] of live.slice(3)) delete S.rivals[k];
  return S.rivals[id] ? (d > 0 ? (r.heat === d ? 'new' : 'up') : 'down') : '';
}
function rivalTaunt(id) { const r = rivalOf(id); if (!r) return ''; const list = RIVAL_TAUNT[r.why] || RIVAL_TAUNT.ko; return fill(list[(id.length + r.heat) % list.length], { me: playerSpec().name }); }
const h2hOf = id => S.h2h[id] || [0, 0];
/* Persistent per-part Condition and Integrity. */
const PART_STATE_SLOTS = ['head', 'torso', 'lead', 'rear', 'legs', 'back'];
const PART_STATE_POOL = { head: 'head', torso: 'torso', lead: 'arms', rear: 'arms', legs: 'legs', back: 'back' };
const LOST_COST = { head: 40, lead: 30, rear: 30 }, REPAIR_THRESHOLD = 25; // provisional, see tools/repair-economy-report.cjs
const FAULT_FIX = { oil: 'Coolant flush / oil seals', leak: 'Coolant flush', drain: 'Charged cell swap', plating: 'Re-bolt', gear: 'Gear rebuild', stutter: 'Gear rebuild', wobble: 'Recalibration', glitch: 'Recalibration' };
const wearKey = (slot, id) => `${slot}|${id}`;
function cleanPartState(raw = {}) {
  return { condition: clamp(Number.isFinite(+raw.condition) ? +raw.condition : 100, 0, 100), integrity: clamp(Number.isFinite(+raw.integrity) ? +raw.integrity : 100, 0, 100), repairCount: Math.max(0, Math.floor(+raw.repairCount || 0)), faults: Array.isArray(raw.faults) ? raw.faults.filter(x => x && CONDS[x.type]).map(x => ({ type: x.type, severity: clamp(+x.severity || +x.sev || 1, 1, 3) })) : [], detached: !!raw.detached, patched: !!raw.patched, overhauls: clamp(Math.floor(+raw.overhauls || 0), 0, 2) };
}
function partWearForBuild(build = S.build) {
  const b = normBuild({ ...build }), out = {};
  for (const slot of PART_STATE_SLOTS) { const id = b[slot] || 'none', item = activePartItem(slot, id), raw = item && item.state || S.partWear && S.partWear[wearKey(slot, id)]; out[slot] = cleanPartState(raw || {}); }
  return out;
}
function partStateFor(slot, id = S.build[slot]) {
  const item = activePartItem(slot, id);
  if (item) { item.state = cleanPartState(item.state); return item.state; }
  const key = wearKey(slot, id || 'none');
  if (!S.partWear[key]) S.partWear[key] = cleanPartState();
  else S.partWear[key] = cleanPartState(S.partWear[key]);
  return S.partWear[key];
}
function migratePartWear() {
  let changed = false; S.partWear = S.partWear && !Array.isArray(S.partWear) ? S.partWear : {};
  const old = S.dmg || {}, legacy = { head: 'head', torso: 'hull', lead: 'lead', rear: 'rear', legs: 'legs' };
  for (const slot of Object.keys(legacy)) {
    const id = S.build[slot], key = wearKey(slot, id); if (!id || S.partWear[key]) continue;
    const faults = (old.conds || []).filter(c => c.part === slot).map(c => ({ type: c.type, severity: 1 }));
    const damaged = (Number.isFinite(+old[legacy[slot]]) && +old[legacy[slot]] > 0) || faults.length > 0, detached = !!(old.lost && old.lost[slot]);
    if (damaged || detached) { S.partWear[key] = cleanPartState({ condition: (detached ? 0 : damaged && Number.isFinite(+old[legacy[slot]]) ? 100 * (1 - +old[legacy[slot]]) : 100), detached, faults }); changed = true; }
  }
  for (const slot of PART_STATE_SLOTS) if (S.build[slot] && S.build[slot] !== 'none') partStateFor(slot, S.build[slot]);
  if (Object.keys(old).length) { S.dmg = {}; changed = true; }
  if (changed) save();
}
function partItemById(itemId) { return S.items.find(item => item && item.kind === 'part' && item.itemId === itemId) || null; }
function activePartItem(slot, defId = S.build && S.build[slot], botId = S.activeBotId) {
  if (!defId || defId === 'none' || !Array.isArray(S.items)) return null;
  const bot = (S.stable || []).find(entry => entry && entry.id === botId), map = botId === S.activeBotId ? (S.equippedItems || bot && bot.equippedItems) : bot && bot.equippedItems;
  const item = map && partItemById(map[slot]);
  return item && item.defId === defId ? item : null;
}
function createPartItem(defId, options = {}) {
  const found = partByAny(defId); if (!found) return null;
  const itemId = `part-${(S.nextItemId++).toString(36)}`;
  const item = { itemId, kind: 'part', defId, pool: options.pool || found.pool, location: options.location || 'stash', botId: options.botId || null, slot: options.slot || null, state: cleanPartState(options.state || {}), worn: !!options.worn, tune: clamp(Math.floor(+options.tune || 0), 0, 2), source: String(options.source || 'unspecified') };
  S.items.push(item); return item;
}
const WORKBOOK_PART_LOCATIONS = ['bay', 'truck', 'stash', 'market'];
function workbookPartItemById(itemId) { return S.items.find(item => item && item.kind === 'workbook-part' && item.itemId === itemId) || null; }
function nextWorkbookPartItemId(used = null) { let itemId; do { itemId = `wbpart-${(S.nextItemId++).toString(36)}`; } while (S.items.some(item => item && item.itemId === itemId) || used && used.has(itemId)); return itemId; }
function rememberBotMaker(bot, maker) { const value = String(maker || '').trim(); if (!bot || !value) return false; if (!Array.isArray(bot.makers)) bot.makers = []; if (bot.makers.includes(value)) return false; bot.makers.push(value); return true; }
function recordStablePartHistory(bot, item, action, detail = {}, dedupe = false) {
  if (!bot || !item) return false;
  if (!Array.isArray(bot.partsHistory)) bot.partsHistory = [];
  if (!Array.isArray(bot.makers)) bot.makers = [];
  const def = WORKBOOK_PART_BY_ID[item.defId], legacy = def ? null : partByAny(item.defId)?.q, maker = def?.maker || (legacy?.b ? BRANDS[legacy.b]?.name || legacy.b : ''), row = { kind: 'part', system: def ? 'workbook' : 'legacy', action, day: Math.max(1, Math.floor(Number.isFinite(+detail.day) ? +detail.day : +S.stableDay || 1)), itemId: item.itemId || '', defId: item.defId || '', name: def?.name || legacy?.name || item.defId || 'Unknown part', maker, slot: detail.slot || item.slot || '', ...detail };
  const key = value => [value.itemId, value.action, value.day, value.slot || '', value.condition ?? '', value.integrity ?? ''].join('|');
  if (dedupe && bot.partsHistory.some(entry => entry && typeof entry === 'object' && key(entry) === key(row))) return rememberBotMaker(bot, row.maker);
  bot.partsHistory.push(row); rememberBotMaker(bot, row.maker); return true;
}
function recordStableFrameHistory(bot, frameItem, action = 'frame-assigned', dedupe = false) {
  if (!bot || !frameItem) return false;
  if (!Array.isArray(bot.partsHistory)) bot.partsHistory = [];
  if (!Array.isArray(bot.makers)) bot.makers = [];
  const frame = frameDefFor(frameItem), row = { kind: 'frame', action, day: Math.max(1, Math.floor(+S.stableDay || 1)), itemId: frameItem.itemId || '', defId: frameItem.defId || '', name: frame?.name || frameItem.defId || 'Unknown frame', maker: frame?.maker || '', slot: 'frame' };
  if (dedupe && bot.partsHistory.some(entry => entry && typeof entry === 'object' && entry.itemId === row.itemId && entry.kind === 'frame')) return rememberBotMaker(bot, row.maker);
  bot.partsHistory.push(row); rememberBotMaker(bot, row.maker); return true;
}
function logWorkbookPartHistory(item, action, detail = {}) {
  if (!Array.isArray(item.history)) item.history = [];
  const def = WORKBOOK_PART_BY_ID[item.defId], row = { action, day: Math.max(1, Math.floor(+S.stableDay || 1)), itemId: item.itemId || '', defId: item.defId || '', name: def?.name || item.defId || 'Unknown part', maker: def?.maker || '', ...detail };
  item.history.push(row);
  const bot = (S.stable || []).find(candidate => candidate && candidate.id === (detail.botId || item.botId));
  if (bot && ['fitted', 'stashed', 'fight-damaged'].includes(action)) recordStablePartHistory(bot, item, action, row);
}
function createWorkbookPartItem(defId, options = {}) {
  if (!WORKBOOK_PART_BY_ID[defId]) return null;
  const itemId = nextWorkbookPartItemId(), location = WORKBOOK_PART_LOCATIONS.includes(options.location) ? options.location : 'stash';
  const state = options.state || { condition: Number.isFinite(+options.condition) ? +options.condition : 100, integrity: Number.isFinite(+options.integrity) ? +options.integrity : 100 };
  const cleanState = cleanPartState(state), item = { itemId, kind: 'workbook-part', defId, location, botId: options.botId || null, slot: options.slot || null, state: cleanState, repairs: Math.max(0, Math.floor(Number.isFinite(+options.repairs) ? +options.repairs : cleanState.repairCount)), tune: Math.max(0, Math.floor(+options.tune || 0)), mods: Array.isArray(options.mods) ? [...options.mods] : [], makerMark: String(options.makerMark || ''), history: Array.isArray(options.history) ? [...options.history] : [{ action: 'acquired', source: String(options.source || 'unspecified'), day: Math.max(1, Math.floor(+S.stableDay || 1)) }] };
  S.items.push(item); return item;
}
function workbookRunCandidates(run = S.workbookRun) {
  if (!run || run.status !== 'active') return [];
  const map = run.map, from = run.lastNodeId ? map.nodes.find(node => node.id === run.lastNodeId) : null;
  return from ? (from.links || []).filter(id => !run.visitedNodeIds.includes(id)) : (map.layers?.[0] || []).map(node => node.id).filter(id => !run.visitedNodeIds.includes(id));
}
function nextWorkbookRunId() {
  let id;
  do { id = `run-${(S.nextRunId++).toString(36)}`; } while ((S.workbookRunHistory || []).some(row => row.id === id) || S.workbookRun?.id === id);
  return id;
}
function workbookStartRun(districtKey, seed = Math.floor(Math.random() * 0x100000000), options = {}) {
  if (workbookRunDeploymentBlocker(districtKey)) return false;
  const tutorial = options?.tutorial === true;
  if (tutorial && (districtKey !== 'crater' || S.workbookTutorial?.status !== 'available')) return false;
  const map = tutorial ? workbookBuildFirstOutingMap(seed) : workbookBuildRunMap(districtKey, seed); if (!map) return false;
  const id = nextWorkbookRunId();
  S.workbookRun = { status:'active', tutorial, hardcore:options?.hardcore === true, id, party:S.activeBotId ? [S.activeBotId] : [], districtKey:map.districtKey, seed:map.seed, map, heat:0, usedPicks:0, visitedNodeIds:[], resolvedNodeIds:[], currentNodeId:null, lastNodeId:null, forceExtractNext:false, carry:[], search:null, startedDay:Math.max(1, Math.floor(+S.stableDay || 1)) };
  if (tutorial) S.workbookTutorial = { ...S.workbookTutorial, status:'active', runId:id, foundItemIds:[] };
  save(); return true;
}
function workbookEnterRunNode(nodeId) {
  const run = S.workbookRun, node = run?.map.nodes.find(row => row.id === nodeId);
  if (!run || run.status !== 'active' || run.currentNodeId || !node || !workbookRunCandidates(run).includes(nodeId)) return false;
  if (node.type === 'extract') { run.visitedNodeIds.push(node.id); return workbookExtractRun(node.number); }
  if (run.forceExtractNext) { run.visitedNodeIds.push(node.id); return workbookExtractRun(node.number); }
  const heat = workbookHeatAfterNode(run.heat, node.type); if (!heat) return false;
  run.heat = heat.heat; run.forceExtractNext = heat.forceExtractionNext; run.currentNodeId = node.id; run.dismantleReward = null; run.visitedNodeIds.push(node.id);
  if (node.type === 'search') { const plan = workbookSearchPickPlan(run.districtKey, run.usedPicks); run.search = { nodeId:node.id, selectedSpots:[], rewards:[], plannedCategories:plan?.categories || [] }; }
  save(); return true;
}
function workbookCompleteRunNode() {
  const run = S.workbookRun; if (!run || run.status !== 'active' || !run.currentNodeId) return false;
  if (run.search && (run.search.selectedSpots.length < run.search.plannedCategories.length || run.search.rewards.length < run.search.plannedCategories.length)) return false;
  const current = run.map.nodes.find(node => node.id === run.currentNodeId); if (current?.type === 'dismantle' && !run.dismantleReward) return false;
  run.resolvedNodeIds.push(run.currentNodeId); run.lastNodeId = run.currentNodeId; run.currentNodeId = null; run.search = null; run.dismantleReward = null; save(); return true;
}
function workbookRunDismantle() {
  const run = S.workbookRun, current = run?.currentNodeId && run.map.nodes.find(node => node.id === run.currentNodeId);
  if (!run || run.status !== 'active' || current?.type !== 'dismantle' || run.dismantleReward) return null;
  const seed = (run.seed ^ Math.imul(current.number, 0x9e3779b1) ^ 0xd1b54a35) >>> 0, reward = workbookRollDismantleReward(run.districtKey, run.heat, seed);
  if (!reward) return null;
  run.dismantleReward = reward; run.carry.push({ ...reward }); save(); return reward;
}
function workbookRollSearchReward(districtKey, category, random = Math.random) {
  const rand = () => Math.max(0, Math.min(.999999999, +random() || 0));
  if (category === 'material') { const pool = workbookSearchMaterialPool(districtKey); if (!pool.length) return null; return { kind:'material', category, id:pool[Math.floor(rand() * pool.length)].id, count:1 }; }
  if (category === 'common-part') { const pool = workbookSearchCommonPartPool(); if (!pool.length) return null; const def = pool[Math.floor(rand() * pool.length)], [c0,c1] = WORKBOOK_SEARCH_ROLL_POLICY.partConditionRange, [i0,i1] = WORKBOOK_SEARCH_ROLL_POLICY.partIntegrityRange; return { kind:'part', category, id:def.id, condition:c0 + Math.floor(rand() * (c1 - c0 + 1)), integrity:i0 + Math.floor(rand() * (i1 - i0 + 1)) }; }
  return null;
}
function workbookRunSearchSpot(spotIndex) {
  const run = S.workbookRun, search = run?.search, spot = Math.floor(+spotIndex);
  if (!run || run.status !== 'active' || !search || !run.currentNodeId || !Number.isInteger(spot) || spot < 0 || spot >= WORKBOOK_SEARCH_RULES.spotsPerNode || search.selectedSpots.includes(spot)) return null;
  const pickIndex = search.selectedSpots.length, category = search.plannedCategories[pickIndex];
  if (!category || pickIndex >= WORKBOOK_SEARCH_RULES.selectedPicksPerNode) return null;
  const node = run.map.nodes.find(row => row.id === run.currentNodeId), seed = (run.seed ^ Math.imul(node?.number || 0, 0x9e3779b1) ^ Math.imul(spot + 1, 0x85ebca6b) ^ Math.imul(pickIndex + 1, 0xc2b2ae35)) >>> 0;
  const reward = workbookRollSearchReward(run.districtKey, category, workbookSeededRunRandom(seed)); if (!reward) return null;
  search.selectedSpots.push(spot); search.rewards.push(reward); run.carry.push({ ...reward }); run.usedPicks += WORKBOOK_SEARCH_RULES.rewardsPerSelectedPick; save(); return reward;
}
function workbookRunCanExtract(run = S.workbookRun, nodeNumber = 0) {
  if (!run || run.status !== 'active') return false;
  if (run.tutorial) { const node = nodeNumber ? run.map.nodes.find(row => row.number === nodeNumber) : null, previous = run.lastNodeId && run.map.nodes.find(row => row.id === run.lastNodeId); return !!(node && node.type === 'extract' && previous?.type === 'dismantle' && (previous.links || []).includes(node.id)); }
  if (run.districtKey === 'crater') return true;
  const boss = run.districtKey === 'dead-conveyor' && run.bossResolved ? run.map.nodes.find(row => row.id === run.lastNodeId && row.type === 'boss') : null;
  if (boss && (!nodeNumber || nodeNumber === boss.number)) return true;
  const node = nodeNumber ? run.map.nodes.find(row => row.number === nodeNumber) : run.currentNodeId && run.map.nodes.find(row => row.id === run.currentNodeId);
  if (run.forceExtractNext) return !!(nodeNumber && node);
  return !!(node && workbookCanExtractAtNode(run.districtKey, node.number));
}
function workbookRunPatchTargets(run = S.workbookRun) {
  if (!run || run.status !== 'active' || !run.currentNodeId) return [];
  const botId = run.party?.[0] || S.activeBotId, bot = (S.stable || []).find(entry => entry && entry.id === botId);
  if (!bot) return [];
  const slots = bot.combatModel === 'workbook'
    ? [{ slot:'head', key:'head', label:'Head' },{ slot:'torso', key:'torsoCore', label:'Torso core' },{ slot:'lead', key:'leadArm', label:'Lead arm' },{ slot:'rear', key:'rearArm', label:'Rear arm' },{ slot:'legs', key:'legs', label:'Legs' }]
    : ['head','torso','lead','rear','legs'].map(slot => ({ slot, key:slot, label:({head:'Head',torso:'Torso',lead:'Lead arm',rear:'Rear arm',legs:'Legs'})[slot] }));
  return slots.map(row => {
    let item = null, state = null;
    if (bot.combatModel === 'workbook') { item = workbookPartItemById(bot.workbookFittedItems?.[row.key]); if (!item) return null; item.state = cleanPartState(item.state || {}); state = item.state; }
    else {
      const id = bot.build?.[row.key]; if (!id || id === 'none') return null;
      const key = wearKey(row.slot, id);
      if (bot.id === S.activeBotId) state = partStateFor(row.slot, id);
      else { if (!bot.partWear || typeof bot.partWear !== 'object') bot.partWear = {}; bot.partWear[key] = cleanPartState(bot.partWear[key] || {}); state = bot.partWear[key]; }
    }
    return { ...row, bot, item, state };
  }).filter(Boolean);
}
function workbookRunPatchBlocker(target) {
  if (!target) return 'Part is not fitted to the deployed bot.';
  if (target.item) return 'Custom parts can only be repaired at the workshop.';
  const state = target.state, nextIntegrity = Math.max(0, +state.integrity - 1), patchCondition = Math.min(50, nextIntegrity * .5);
  if (state.detached) return 'Re-attach the part before field patching.';
  if (state.integrity < REPAIR_THRESHOLD) return 'This part is below the 25 Integrity repair threshold.';
  if (state.patched) return 'This part is already patched; workshop repair clears the damage penalty.';
  if (state.condition >= patchCondition) return 'This part is already at the field-patch limit.';
  if (!S.sandbox && Math.max(0, Math.floor(+S.consumables?.patchKit || 0)) < 1) return 'Need one Patch kit.';
  return '';
}
function workbookRunFieldPatch(slot) {
  const target = workbookRunPatchTargets().find(row => row.slot === slot);
  if (workbookRunPatchBlocker(target)) return false;
  const state = target.state;
  if (!S.sandbox) S.consumables.patchKit = Math.max(0, Math.floor(+S.consumables.patchKit || 0) - 1);
  state.integrity = Math.max(0, state.integrity - 1);
  state.condition = Math.min(50, state.integrity * .5);
  state.patched = true;
  if (target.item) { target.item.state = cleanPartState(state); recordStablePartHistory(target.bot, target.item, 'field-patched', { slot, condition:target.item.state.condition, integrity:target.item.state.integrity }); }
  else if (target.bot.id === S.activeBotId) target.bot.partWear = saveCopy(S.partWear);
  else target.bot.partWear[wearKey(slot, target.bot.build[slot])] = cleanPartState(state);
  save(); return true;
}
function workbookExtractRun(nodeNumber = 0) {
  const run = S.workbookRun; if (!workbookRunCanExtract(run, nodeNumber)) return false;
  const banked = [];
  for (const row of run.carry) {
    if (row.kind === 'material' && addWorkbookMaterial(row.id, row.count)) banked.push({ ...row });
    else if (row.kind === 'part') { const item = createWorkbookPartItem(row.id, { location:'stash', condition:row.condition, integrity:row.integrity, source:`salvage:${run.districtKey}` }); if (item) banked.push({ ...row, itemId:item.itemId }); }
    else if (row.kind === 'blueprint' && WORKBOOK_BLUEPRINT_BY_ID[row.id]) { S.workbookBlueprints.push(row.id); banked.push({ ...row }); }
    else if (row.kind === 'blueprint' && WORKBOOK_BLUEPRINT_BY_ID[row.id]) { S.workbookBlueprints.push(row.id); banked.push({ ...row }); }
  }
  run.status = 'extracted'; run.currentNodeId = null; run.lastReport = { districtKey:run.districtKey, heat:run.heat, usedPicks:run.usedPicks, banked, extractedDay:Math.max(1, Math.floor(+S.stableDay || 1)) };
  if (!S.workbookRunHistory.some(row => row.id === run.id)) S.workbookRunHistory.push({ id:run.id, tutorial:!!run.tutorial, districtKey:run.districtKey, seed:run.seed, party:[...(run.party || [])], nodes:run.map.nodes.map(node => ({ id:node.id, number:node.number, layer:node.layer, type:node.type, links:[...(node.links || [])] })), visitedNodeIds:[...run.visitedNodeIds], heat:run.heat, usedPicks:run.usedPicks, startedDay:run.startedDay, extractedDay:run.lastReport.extractedDay, state:'extracted', carry:[], banked:banked.map(row => ({ ...row })) });
  if (run.tutorial && S.workbookTutorial?.runId === run.id) S.workbookTutorial = { ...S.workbookTutorial, status:'awaiting-first-pit', foundItemIds:banked.filter(row => row.kind === 'part' && row.itemId).map(row => row.itemId) };
  run.carry = []; run.search = null; addSalvageXP(WORKBOOK_XP_AWARDS.extract); evaluateWorkbookAchievements({ type:'run-extracted', heat:run.heat }); save(); return true;
}
function workbookRunUnbankedCarry(run) {
  const rows = Array.isArray(run?.carry) ? run.carry.map(row => ({ ...row })) : [];
  if (run?.search && Array.isArray(run.search.rewards)) rows.push(...run.search.rewards.filter(Boolean).map(row => ({ ...row })));
  if (run?.dismantleReward?.kind === 'part') rows.push({ ...run.dismantleReward });
  return normalizeWorkbookRunRewards(rows);
}
function workbookRunCarryValueScrap(rows) {
  return (rows || []).reduce((sum, row) => sum + (row.kind === 'material' ? Math.max(1, Math.floor(+row.count || 1)) * (+WORKBOOK_MATERIAL_BY_ID[row.id]?.baseValueScrap || 0) : (+WORKBOOK_PART_BY_ID[row.id]?.baseValueScrap || 0)), 0);
}
function workbookRunFailureTargets(run, bot) {
  if (!run || !bot) return [];
  const workbook = bot.combatModel === 'workbook', slots = workbook ? [{ slot:'head', key:'head' },{ slot:'torso', key:'torsoCore' },{ slot:'lead', key:'leadArm' },{ slot:'rear', key:'rearArm' },{ slot:'legs', key:'legs' }] : ['head','torso','lead','rear','legs'].map(slot => ({ slot, key:slot }));
  return slots.map(row => {
    let item = null, state = null, defId = '';
    if (workbook) { item = workbookPartItemById(bot.workbookFittedItems?.[row.key]); if (!item) return null; defId = item.defId; item.state = cleanPartState(item.state || {}); state = item.state; }
    else {
      defId = bot.build?.[row.key]; if (!defId || defId === 'none') return null; item = activePartItem(row.slot, defId, bot.id);
      if (item) { item.state = cleanPartState(item.state || {}); state = item.state; }
      else if (bot.id === S.activeBotId) state = partStateFor(row.slot, defId);
      else { if (!bot.partWear || typeof bot.partWear !== 'object') bot.partWear = {}; const key = wearKey(row.slot, defId); bot.partWear[key] = cleanPartState(bot.partWear[key] || {}); state = bot.partWear[key]; }
    }
    return { ...row, bot, item, state, defId, name:workbook ? WORKBOOK_PART_BY_ID[defId]?.name || defId : partByAny(defId)?.q?.name || defId };
  }).filter(Boolean);
}
function workbookRecordRunFailurePart(bot, target, action, detail = {}) {
  const facts = { botId:bot.id, slot:target.key, condition:Math.round(+target.state.condition || 0), integrity:Math.round(+target.state.integrity || 0), ...detail };
  if (target.item?.kind === 'workbook-part') logWorkbookPartHistory(target.item, action, facts);
  else if (target.item) { if (!Array.isArray(target.item.history)) target.item.history = []; target.item.history.push({ action, day:Math.max(1, Math.floor(+S.stableDay || 1)), ...facts }); }
  recordStablePartHistory(bot, target.item || { itemId:'', defId:target.defId, slot:target.key }, action, facts);
}
function workbookRunLoseTorso(bot, targets) {
  const target = targets.find(row => row.slot === 'torso') || null; if (!target) return null;
  const item = target.item, name = target.name, lostTorso = { defId:target.defId, name, itemId:item?.itemId || '' };
  workbookRecordRunFailurePart(bot, target, 'run-hardcore-torso-lost', { permanent:true });
  if (item?.itemId) S.items = (S.items || []).filter(row => row !== item && row.itemId !== item.itemId);
  if (bot.combatModel === 'workbook') { if (!bot.workbookFittedItems || typeof bot.workbookFittedItems !== 'object') bot.workbookFittedItems = {}; delete bot.workbookFittedItems.torsoCore; }
  else {
    bot.build = { ...(bot.build || {}), torso:'none' }; if (bot.equippedItems) delete bot.equippedItems.torso;
    const wear = wearKey('torso', target.defId); if (bot.partWear) { delete bot.partWear[wear]; delete bot.partWear.torso; }
    if (!S.items.some(row => row && row.kind === 'part' && row.defId === target.defId)) S.owned = (S.owned || []).filter(id => id !== target.defId);
    if (bot.id === S.activeBotId) { S.build = { ...(S.build || {}), torso:'none' }; if (S.equippedItems) delete S.equippedItems.torso; if (S.partWear) { delete S.partWear[wear]; delete S.partWear.torso; } }
  }
  return lostTorso;
}
function workbookFailRun(mode = 'standard') {
  const run = S.workbookRun; if (!run || run.status !== 'active' || run.tutorial) return false;
  const botId = run.party?.[0] || S.activeBotId, bot = (S.stable || []).find(entry => entry && entry.id === botId); if (!bot) return false;
  syncActiveBot();
  const failureMode = mode === 'hardcore' || run.hardcore ? 'hardcore' : 'standard', lostCarry = workbookRunUnbankedCarry(run), carryValueScrap = workbookRunCarryValueScrap(lostCarry), targets = workbookRunFailureTargets(run, bot);
  let towedParts = [], lostTorso = null, towFeeRequired = 0, towFeeCharged = 0, towFeeWaived = 0;
  if (failureMode === 'hardcore') lostTorso = workbookRunLoseTorso(bot, targets);
  else {
    for (const target of targets) { const next = workbookStandardTowPartState(target.state, target.slot); if (next.condition !== target.state.condition || next.integrity !== target.state.integrity) { if (target.item) target.item.state = next; else Object.assign(target.state, next); target.state = target.item ? target.item.state : target.state; workbookRecordRunFailurePart(bot, target, 'run-standard-towed'); towedParts.push({ slot:target.slot, name:target.name, condition:next.condition, integrity:next.integrity }); } }
    towFeeRequired = S.sandbox ? 0 : Math.ceil(workbookStandardTowFeeExact(carryValueScrap));
    if (!S.sandbox) { towFeeCharged = Math.min(towFeeRequired, Math.max(0, Math.floor(+S.scrap || 0))); towFeeWaived = towFeeRequired - towFeeCharged; S.scrap = Math.max(0, Math.floor(+S.scrap || 0) - towFeeCharged); }
  }
  const failedDay = Math.max(1, Math.floor(+S.stableDay || 1)); S.truck = S.truck && typeof S.truck === 'object' ? S.truck : {}; S.truck.location = 'garbage-town';
  if (bot.id === S.activeBotId && bot.combatModel !== 'workbook') syncActiveBot();
  const report = { districtKey:run.districtKey, heat:run.heat, usedPicks:run.usedPicks, failedDay, failureMode, lostCarry:lostCarry.map(row => ({ ...row })), carryValueScrap, towFeeRequired, towFeeCharged, towFeeWaived, towedParts, lostTorso };
  run.status = 'failed'; run.hardcore = failureMode === 'hardcore'; run.currentNodeId = null; run.lastReport = report; run.carry = []; run.search = null; run.dismantleReward = null;
  if (!(S.workbookRunHistory || []).some(row => row.id === run.id)) S.workbookRunHistory.push({ id:run.id, tutorial:!!run.tutorial, hardcore:failureMode === 'hardcore', districtKey:run.districtKey, seed:run.seed, party:[...(run.party || [])], nodes:run.map.nodes.map(node => ({ id:node.id, number:node.number, layer:node.layer, type:node.type, links:[...(node.links || [])] })), visitedNodeIds:[...(run.visitedNodeIds || [])], heat:run.heat, usedPicks:run.usedPicks, startedDay:run.startedDay, failedDay, state:'failed', failureMode, carry:[], lostCarry:report.lostCarry.map(row => ({ ...row })), carryValueScrap, towFeeRequired, towFeeCharged, towFeeWaived, towedParts, lostTorso, banked:[] });
  save(); return true;
}
function truckModuleItemById(itemId) { return (S.items || []).find(item => item && item.kind === 'truck-module' && item.itemId === itemId) || null; }
function createTruckModuleItem(defId, options = {}) {
  if (!WORKBOOK_TRUCK_MODULE_BY_ID[defId]) return null;
  let itemId; do { itemId = `truckmod-${(S.nextItemId++).toString(36)}`; } while ((S.items || []).some(item => item && item.itemId === itemId));
  const item = { itemId, kind: 'truck-module', defId, location: options.location === 'truck' ? 'truck' : 'stash', truckId: options.location === 'truck' ? S.truck?.truckId || 'truck-starter' : null, history: [{ action: 'acquired', source: String(options.source || 'vendor'), day: Math.max(1, Math.floor(+S.stableDay || 1)) }] };
  S.items.push(item); return item;
}
function createTruckCrewMember(roleId) {
  if (!WORKBOOK_TRUCK_CREW_BY_ID[roleId] || !S.truck || !Array.isArray(S.truck.crew)) return null;
  let crewId; do { crewId = `crew-${(S.nextItemId++).toString(36)}`; } while ((S.truck.crew || []).some(member => member && member.crewId === crewId));
  const hiredDay = Math.max(1, Math.floor(+S.stableDay || 1)), member = { crewId, roleId, hiredDay, history: [{ action: 'hired', day: hiredDay }] };
  S.truck.crew.push(member); return member;
}
function migrateWorkbookPartItems() {
  let changed = false;
  S.items = Array.isArray(S.items) ? S.items : [];
  S.nextItemId = Math.max(1, Math.floor(+S.nextItemId || 1));
  const used = new Set(S.items.filter(item => item && item.kind !== 'workbook-part' && item.itemId).map(item => item.itemId));
  for (const item of S.items) {
    if (!item || item.kind !== 'workbook-part') { if (item && item.itemId) used.add(item.itemId); continue; }
    if (!item.itemId || used.has(item.itemId)) { item.itemId = nextWorkbookPartItemId(used); changed = true; }
    used.add(item.itemId);
    const defId = String(item.defId || ''); if (item.defId !== defId) changed = true; item.defId = defId;
    const location = WORKBOOK_PART_LOCATIONS.includes(item.location) ? item.location : 'stash';
    if (item.location !== location) changed = true;
    const botId = item.botId || null, slot = item.slot || null;
    if (item.botId !== botId || item.slot !== slot) changed = true;
    item.location = location; item.botId = botId; item.slot = slot;
    const state = cleanPartState(item.state || item); if (state.patched) { state.patched = false; changed = true; } if (JSON.stringify(item.state) !== JSON.stringify(state)) changed = true; item.state = state;
    const repairs = Math.max(0, Math.floor(Number.isFinite(+item.repairs) ? +item.repairs : state.repairCount)), tune = Math.max(0, Math.floor(+item.tune || 0));
    if (item.repairs !== repairs || item.tune !== tune) changed = true; item.repairs = repairs; item.tune = tune;
    if (!Array.isArray(item.mods)) { item.mods = []; changed = true; }
    const makerMark = String(item.makerMark || ''); if (item.makerMark !== makerMark) changed = true; item.makerMark = makerMark;
    if (!Array.isArray(item.history)) { item.history = []; changed = true; }
    const serial = parseInt(String(item.itemId).replace(/^wbpart-/, ''), 36); if (Number.isFinite(serial)) S.nextItemId = Math.max(S.nextItemId, serial + 1);
  }
  if (changed) save();
  return changed;
}
function availablePartItem(defId, slot) {
  const equipped = activePartItem(slot, S.build && S.build[slot]);
  if (equipped && equipped.defId === defId) return equipped;
  const stash = S.items.find(item => item && item.kind === 'part' && item.defId === defId && item.location === 'stash');
  if (stash) return stash;
  const slotPool = PART_STATE_POOL[slot];
  return S.items.find(item => item && item.kind === 'part' && item.defId === defId && item.location === 'bay' && item.botId === S.activeBotId && PART_STATE_POOL[item.slot] === slotPool) || null;
}
function hasPartForSlot(defId, slot) { return defId === 'none' || S.sandbox || !!availablePartItem(defId, slot); }
function equipPartItem(slot, defId, options = {}) {
  if (!S.equippedItems || typeof S.equippedItems !== 'object') S.equippedItems = {};
  const oldDef = S.build && S.build[slot], old = oldDef && activePartItem(slot, oldDef);
  const owner = (S.stable || []).find(bot => bot && bot.id === (S.activeBotId || 'bot-starter')), record = (item, action, targetSlot = slot) => { if (owner && item) recordStablePartHistory(owner, item, action, { slot: targetSlot }); };
  if (defId === 'none') {
    if (old) { record(old, 'stashed'); old.location = 'stash'; old.botId = null; old.slot = null; }
    delete S.equippedItems[slot]; S.build[slot] = 'none'; return true;
  }
  let item = options.itemId ? partItemById(options.itemId) : availablePartItem(defId, slot);
  if (item && item.defId !== defId) item = null;
  if (item && item.location === 'bay' && item.botId !== S.activeBotId) return false;
  if (!item && options.create) item = createPartItem(defId, { pool: options.pool, location: 'stash', worn: !!options.worn, state: options.state, tune: options.tune });
  if (!item) return false;
  const sourceSlot = item.location === 'bay' && item.botId === S.activeBotId ? item.slot : null;
  if (sourceSlot && sourceSlot !== slot && PART_STATE_POOL[sourceSlot] === PART_STATE_POOL[slot]) {
    if (old && old.itemId !== item.itemId) { old.location = 'bay'; old.botId = S.activeBotId; old.slot = sourceSlot; S.equippedItems[sourceSlot] = old.itemId; record(old, 'fitted', sourceSlot); }
    else { delete S.equippedItems[sourceSlot]; S.build[sourceSlot] = 'none'; }
  } else if (old && old.itemId !== item.itemId) { record(old, 'stashed'); old.location = 'stash'; old.botId = null; old.slot = null; }
  item.location = 'bay'; item.botId = S.activeBotId || 'bot-starter'; item.slot = slot;
  S.equippedItems[slot] = item.itemId; S.build[slot] = defId;
  if (item !== old) record(item, 'fitted', slot);
  if (!S.owned.includes(defId)) S.owned.push(defId);
  return true;
}
function partIsWorn(slot, defId) { const item = activePartItem(slot, defId); return item ? !!item.worn : !!(S.worn && S.worn[defId]); }
function partSellValue(item) { const found = item && partByAny(item.defId); if (!found) return 0; return Math.round(found.q.cost * (item.worn ? .15 : .3)); }
function migratePartItems() {
  let changed = false;
  S.items = Array.isArray(S.items) ? S.items : [];
  S.nextItemId = Math.max(1, Math.floor(+S.nextItemId || 1));
  for (const item of S.items) if (item && item.kind === 'part') {
    if (!item.itemId) { item.itemId = `part-${(S.nextItemId++).toString(36)}`; changed = true; }
    const found = partByAny(item.defId || item.id);
    item.defId = item.defId || item.id; item.pool = item.pool || found && found.pool || '';
    item.location = ['bay', 'stash', 'truck', 'market'].includes(item.location) ? item.location : 'stash';
    item.botId = item.botId || null; item.slot = item.slot || null; item.state = cleanPartState(item.state || item);
    item.worn = !!item.worn; item.tune = clamp(Math.floor(+item.tune || 0), 0, 2);
    const serial = parseInt(String(item.itemId).replace(/^part-/, ''), 36); if (Number.isFinite(serial)) S.nextItemId = Math.max(S.nextItemId, serial + 1);
  }
  if (!Array.isArray(S.stable)) S.stable = [];
  for (const bot of S.stable) {
    if (!bot || typeof bot !== 'object') continue;
    bot.build = normBuild({ ...(bot.build || DEFAULT.build) });
    const wornMap = bot.worn && typeof bot.worn === 'object' ? bot.worn : S.worn, tuneMap = bot.tune && typeof bot.tune === 'object' ? bot.tune : S.tune;
    if (!bot.equippedItems || typeof bot.equippedItems !== 'object' || Array.isArray(bot.equippedItems)) bot.equippedItems = {};
    if (!bot.partWear || typeof bot.partWear !== 'object' || Array.isArray(bot.partWear)) bot.partWear = {};
    for (const slot of PART_STATE_SLOTS) {
      const defId = bot.build[slot]; if (!defId || defId === 'none') continue;
      let item = partItemById(bot.equippedItems[slot]);
      if (item && item.botId && (item.botId !== bot.id || item.slot !== slot)) item = null;
      if (!item || item.defId !== defId) {
        item = S.items.find(candidate => candidate && candidate.kind === 'part' && candidate.defId === defId && candidate.location === 'stash') || null;
        if (!item) {
          const oldState = bot.partWear[wearKey(slot, defId)] || bot.partWear[slot] || {};
          item = createPartItem(defId, { location: 'stash', state: oldState, worn: !!wornMap[defId], tune: tuneMap[defId] || 0 });
        } else {
          const oldState = bot.partWear[wearKey(slot, defId)] || bot.partWear[slot];
          if (oldState) item.state = cleanPartState(oldState);
        }
        if (!item) continue;
        item.location = 'bay'; item.botId = bot.id; item.slot = slot; bot.equippedItems[slot] = item.itemId; changed = true;
      } else {
        item.location = 'bay'; item.botId = bot.id; item.slot = slot;
      }
    }
  }
  for (const defId of [...new Set(S.owned || [])]) {
    if (!partByAny(defId) || S.items.some(item => item && item.kind === 'part' && item.defId === defId)) continue;
    createPartItem(defId, { location: 'stash', worn: !!S.worn[defId], tune: S.tune[defId] || 0 }); changed = true;
  }
  const active = S.stable.find(bot => bot && bot.id === S.activeBotId);
  if (active) S.equippedItems = saveCopy(active.equippedItems || {});
  if (S.stableSchema < 2) { S.stableSchema = 2; changed = true; }
  if (changed) save();
}
const FRAME_LOCATIONS = ['bay','stash','truck','market'];
const frameItemById = id => S.items.find(item => item && item.kind === 'frame' && item.itemId === id) || null;
const frameDefFor = item => item && FRAME_BY_ID[item.defId] || null;
const effectiveFrameIntegrity = (def, reinforcements = 0) => Math.max(0, def.maxIntegrity - 10 * clamp(Math.floor(+reinforcements || 0), 0, 3));
const effectiveFrameCapacity = (def, reinforcements = 0) => def.capacity + 2 * clamp(Math.floor(+reinforcements || 0), 0, 3);
function workbookFrameCapacityBonus(bot, frame) {
  const veteran = Math.max(+((bot || {}).frameCapacityBonus) || 0, bot && bot.veteran ? 2 : 0);
  const underdog = frame && frame.id === 'church-raffle-chassis' ? Math.min(6, Math.floor(Math.max(0, +(((bot || {}).rec || {}).w) || 0) / 5)) : 0;
  return { veteran, underdog, total: veteran + underdog };
}
const WORKBOOK_PLAN_SLOT_TYPES = { head:'Head', torsoCore:'Torso core', leadArm:'Arm', rearArm:'Arm', fists:'Fist', legs:'Legs', back1:'Back', back2:'Back', back3:'Back', back4:'Back', powerCell:'Power cell', cooling:'Cooling', firmware:'Firmware', firmware2:'Firmware', optics:'Optics module', plate1:'Armor plate', plate2:'Armor plate', plate3:'Armor plate', plate4:'Armor plate', utility1:'Utility', utility2:'Utility', utility3:'Utility', utility4:'Utility' };
const WORKBOOK_REQUIRED_PLAN_KEYS = [['head','Head'],['torsoCore','Torso core'],['leadArm','Lead arm'],['rearArm','Rear arm'],['fists','Fists'],['legs','Legs']];
function workbookPlanSlots(frame) {
  if (!frame) return [];
  const slots = [...WORKBOOK_REQUIRED_PLAN_KEYS.map(([key,label]) => ({ key, label, partSlot: WORKBOOK_PLAN_SLOT_TYPES[key], required: true }))];
  for (let i = 1; i <= Math.min(4, +frame.sockets.back || 0); i++) slots.push({ key: `back${i}`, label: `Back ${i}`, partSlot: 'Back' });
  slots.push({ key: 'powerCell', label: 'Power cell', partSlot: 'Power cell' }, { key: 'cooling', label: 'Cooling', partSlot: 'Cooling' }, { key: 'firmware', label: 'Firmware', partSlot: 'Firmware' });
  if (frame.id === 'sentinel-chassis') slots.push({ key: 'firmware2', label: 'Firmware 2 · Sentinel bonus socket', partSlot: 'Firmware' });
  slots.push({ key: 'optics', label: 'Optics module', partSlot: 'Optics module' });
  for (let i = 1; i <= Math.min(4, +frame.sockets.plates || 0); i++) slots.push({ key: `plate${i}`, label: `Armor plate ${i}`, partSlot: 'Armor plate' });
  for (let i = 1; i <= Math.min(4, +frame.sockets.utility || 0); i++) slots.push({ key: `utility${i}`, label: `Utility ${i}`, partSlot: 'Utility' });
  return slots;
}
function workbookPlanSummary(bot, frameItem, frame) {
  const plan = bot && bot.workbookPlan && typeof bot.workbookPlan === 'object' ? bot.workbookPlan : {}, selected = [];
  for (const [key,id] of Object.entries(plan)) { const def = WORKBOOK_PART_BY_ID[id]; if (def && WORKBOOK_PLAN_SLOT_TYPES[key] === def.slot) selected.push({ key, def }); }
  return workbookBuildSummary(bot, frameItem, frame, selected);
}
function workbookOwnedFitSummary(bot, frameItem, frame, fit = bot && bot.workbookFittedItems || {}) {
  const selected = [], seen = new Set();
  for (const [key,itemId] of Object.entries(fit)) {
    const item = workbookPartItemById(itemId), def = item && WORKBOOK_PART_BY_ID[item.defId];
    if (item && def && WORKBOOK_PLAN_SLOT_TYPES[key] === def.slot && !seen.has(item.itemId)) { selected.push({ key, def, item }); seen.add(item.itemId); }
  }
  return workbookBuildSummary(bot, frameItem, frame, selected);
}
function workbookPartMass(def) {
  let mass = Math.max(0, +def?.massKg || 0);
  const massOverride = String(def?.drawback || '').match(/^Mass\s+([\d.]+)\s*kg?$/i);
  if (massOverride) mass = +massOverride[1];
  else if (/\+20% mass/i.test(String(def?.drawback || ''))) mass *= 1.2;
  return mass;
}
function workbookPartHP(def) {
  const hpOverride = String(def?.drawback || '').match(/^Part HP\s+([\d.]+)$/i);
  let hp = Math.max(1, hpOverride ? +hpOverride[1] : +def?.partHP || 1);
  if (/fragile:\s*−20% part HP/i.test(String(def?.drawback || ''))) hp *= .8;
  if (/^\+12% hull on this part$/i.test(String(def?.makerTrait || ''))) hp *= 1.12;
  return hp;
}
function workbookPartCapacityCost(def, frame) {
  let cost = Math.max(0, +def?.capacityCost || 0);
  const quirk = String(frame?.quirk || '').toLowerCase(), slot = String(def?.slot || '').toLowerCase(), material = String(def?.material || '').toLowerCase(), trait = String(def?.makerTrait || '').toLowerCase();
  if (slot === 'armor plate' && quirk.includes('plates cost double capacity')) cost *= 2;
  if (slot === 'armor plate' && material === 'ceramic' && quirk.includes('ceramic plates cost −1 capacity')) cost = Math.max(0, cost - 1);
  if (quirk.includes('tesla parts cost −2 capacity') && trait.includes('tesla charge on hit (1 in 6)')) cost = Math.max(0, cost - 2);
  return cost;
}
function applyWorkbookFrameCombat(stats, frame) {
  if (!frame || !stats) return;
  switch (frame.id) {
    case 'laundromat-shell': stats.sense *= .95; break;
    case 'grain-elevator-frame': stats.balance = Math.min(.85, stats.balance + .1); break;
    case 'wrecking-cradle': stats.push *= 1.25; break;
    case 'neon-skeleton': stats.dodge = clamp((+stats.dodge || 0) + .06, 0, .95); break;
    case 'courier-frame-k4': stats.move *= 1.1; break;
    case 'grid-warden': stats.en *= 1.2; break;
    case 'duelist-frame':
      stats.crit = (+stats.crit || 0) + .05;
      for (const arm of ['lead', 'rear']) stats.critArm[arm] = clamp((+stats.critArm[arm] || 0) + .05, 0, .95);
      break;
  }
}
function workbookFramePendingEffects(frame) {
  const byFrame = {
    'shopping-cart-rig': ['Wheeled-base-only leg compatibility is not enforced.'],
    'dockhand-mk-ii': ['Puddle-slip immunity needs the workbook run-hazard system.'],
    'boiler-barrel': ['Runs hot has no numeric effect value in the workbook.'],
    'co-op-mule': ['Repair discount and Integrity loss need the repair system.'],
    'pit-dog-frame': ['Illegal-socket venue exceptions are not enforced.'],
    'sentinel-chassis': ['Halcyon clinic repair restrictions above Rare are not enforced.'],
    'riot-containment-unit': ['Slow guard drop has no numeric timing value in the workbook.'],
    'grid-warden': ['Volta-station full recharge needs the travel and station system.'],
    'duelist-frame': ['Gang-venue warranty restrictions need the repair and venue systems.'],
    'titan-gantry': ['Super-heavyweight eligibility is not enforced.'],
    'spire-seraph': ['Bound-on-pickup handling is not implemented for frame items.'],
  };
  return byFrame[frame?.id] || [];
}
function workbookMainNumber(def, label, suffix = '') {
  const expression = new RegExp(`^${label}\\s+([\\d.]+)${suffix}$`, 'i'), match = String(def?.mainStat || '').match(expression);
  return match ? +match[1] : null;
}
function workbookTraitNumber(def, label, suffix = '') {
  const expression = new RegExp(`(?:^|[,;]\\s*)${label}\\s+([\\d.]+)${suffix}(?=\\s*(?:[,;]|$))`, 'i'), match = String(def?.makerTrait || '').match(expression);
  return match ? +match[1] : null;
}
function workbookPartStatNumber(def, label, suffix = '') {
  const main = workbookMainNumber(def, label, suffix);
  return main == null ? workbookTraitNumber(def, label, suffix) : main;
}
function workbookPartLoadBonus(def) {
  const match = String(def?.makerTrait || '').match(/(?:^|[,;]\s*)load\s+\+([\d.]+)\s*kg?(?=$|[,;])/i);
  return match ? +match[1] : 0;
}
function workbookConditionFactor(condition) {
  const value = clamp(Number.isFinite(+condition) ? +condition : 100, 0, 100);
  return value >= 75 ? 1 : value >= 40 ? .9 : value >= 15 ? .75 : 0;
}
const WORKBOOK_SUPPORTED_COMBAT_TRAITS = new Set(['+0.05 balance', '+0.06 block bonus', '+15% shove', '+3% dodge', '+4% crit chance', 'welds restore +20%', '+10% damage to broken parts', 'vents heat 10% faster', 'armor +9 on the torso, guard +0.1', 'battery 300, regen +20%', 'crit chance +15%, crits ignore 3 armor', 'each clean hit steals 6 battery', 'every 4th hit chains lightning (stun 0.6 s)', 'power 26, +25% vs broken parts', 'hull 420, load +15 kg', 'reads tells 0.1 s earlier', 'sensors 82, sees signature tells 0.4 s early', 'reveals the next corner plan of the ai']);
const WORKBOOK_PARTIAL_COMBAT_TRAITS = new Set(['dodge +12%, feints read 40% better']);
const WORKBOOK_SUPPORTED_COMBAT_MAIN_STATS = new Set(['head focus +1 s (tier 2)', 'slip window +0.08 s (tier 3)', 'slip window +0.08 s (tier 4)', 'counter window +15% (tier 4)', 'coach calls never drop (tier 5)', 'free haymaker each round (tier 4)']);
function workbookTraitPendingText(text) {
  const value = String(text || '').trim(), trait = value.toLowerCase();
  if (!value || value === '-' || trait === '+12% hull on this part' || WORKBOOK_SUPPORTED_COMBAT_TRAITS.has(trait)) return '';
  if (trait === 'dodge +12%, feints read 40% better') return 'feints read 40% better (Dodge +12% is active)';
  if (trait === 'power 20, immune to heat damage') return 'immune to heat damage (Power 20 is active)';
  if (trait === 'hull 260, never drops below 30 integrity from repairs') return 'repair Integrity floor of 30 (Hull 260 is active)';
  return value;
}
function applyWorkbookPartCombatTraits(stats, selected) {
  let critBonus = 0;
  for (const row of selected || []) {
    const trait = String(row.def?.makerTrait || '').trim().toLowerCase();
    if (!WORKBOOK_SUPPORTED_COMBAT_TRAITS.has(trait) && !WORKBOOK_PARTIAL_COMBAT_TRAITS.has(trait)) continue;
    switch (trait) {
      case '+0.05 balance': stats.balance = Math.min(.85, (+stats.balance || 0) + .05); break;
      case '+0.06 block bonus': stats.blockBonus = (+stats.blockBonus || 0) + .06; break;
      case '+15% shove': stats.push = (+stats.push || 1) * 1.15; break;
      case '+3% dodge': stats.dodge = clamp((+stats.dodge || 0) + .03, 0, .95); break;
      case 'dodge +12%, feints read 40% better': stats.dodge = clamp((+stats.dodge || 0) + .12, 0, .95); break;
      case '+4% crit chance': critBonus += .04; break;
      case 'reads tells 0.1 s earlier': stats.tellReadBonus = (+stats.tellReadBonus || 0) + .1; break;
      case 'sensors 82, sees signature tells 0.4 s early': stats.tellReadBonus = (+stats.tellReadBonus || 0) + .4; break;
      case 'reveals the next corner plan of the ai': stats.revealsCornerPlan = true; break;
      case 'welds restore +20%': stats.weldMul = (+stats.weldMul || 1) * 1.2; break;
      case '+10% damage to broken parts': stats.brokenPartDamage = (+stats.brokenPartDamage || 0) + .10; break;
      case 'vents heat 10% faster': stats.cool = (+stats.cool || 0) * 1.1; break;
      case 'armor +9 on the torso, guard +0.1': stats.armor = (+stats.armor || 0) + 9; stats.blockBonus = (+stats.blockBonus || 0) + .1; break;
      case 'battery 300, regen +20%': stats.en = 300; stats.regen = (+stats.regen || 0) * 1.2; break;
      case 'crit chance +15%, crits ignore 3 armor': critBonus += .15; stats.critArmorPen = (+stats.critArmorPen || 0) + 3; break;
      case 'each clean hit steals 6 battery': stats.hitBatterySteal = (+stats.hitBatterySteal || 0) + 6; break;
      case 'every 4th hit chains lightning (stun 0.6 s)': stats.lightningEvery = 4; stats.lightningStun = .6; break;
      case 'power 26, +25% vs broken parts': stats.brokenPartDamage = (+stats.brokenPartDamage || 0) + .25; break;
    }
  }
  if (critBonus) {
    stats.crit = (+stats.crit || 0) + critBonus;
    for (const arm of ['lead', 'rear']) stats.critArm[arm] = clamp((+stats.critArm[arm] || 0) + critBonus, 0, .95);
  }
}
/* Workbook numbers use a wider scale than the fight sim. These map them onto the roster's range (arm power 8-13, hull 107-208, footwork 0.85-1.3, sensors 0.2-0.4). */
const WORKBOOK_COMBAT_SCALE = { power: { from: 8.5, to: 8, rate: .31 }, hull: { rate: .33, min: 90 }, move: { from: 65, to: .75, rate: .0043 }, sense: { base: .15, rate: .33 }, armor: { rate: .45, max: 16 } };
const workbookScaledPower = power => power > 0 ? WORKBOOK_COMBAT_SCALE.power.to + Math.max(0, power - WORKBOOK_COMBAT_SCALE.power.from) * WORKBOOK_COMBAT_SCALE.power.rate : 0;
const workbookScaledHull = hull => Math.max(WORKBOOK_COMBAT_SCALE.hull.min, Math.round(hull * WORKBOOK_COMBAT_SCALE.hull.rate));
const workbookScaledMove = footwork => WORKBOOK_COMBAT_SCALE.move.to + Math.max(0, footwork - WORKBOOK_COMBAT_SCALE.move.from) * WORKBOOK_COMBAT_SCALE.move.rate;
const workbookScaledArmor = armor => Math.min(WORKBOOK_COMBAT_SCALE.armor.max, armor * WORKBOOK_COMBAT_SCALE.armor.rate);
function workbookCombatAdapter(bot) {
  const frameItem = frameItemById(bot && bot.frameItemId), frame = frameDefFor(frameItem), report = frame && frameItem ? workbookOwnedFitSummary(bot, frameItem, frame) : null;
  const fit = bot && bot.workbookFittedItems || {}, itemAt = key => workbookPartItemById(fit[key]), defAt = key => { const item = itemAt(key); return item && WORKBOOK_PART_BY_ID[item.defId]; };
  const head = defAt('head'), torso = defAt('torsoCore'), lead = defAt('leadArm'), rear = defAt('rearArm'), fist = defAt('fists'), legs = defAt('legs');
  const blockers = [], missingStats = [];
  if (bot?.wreckStatus === 'salvageable') blockers.push('This bot is wrecked. Rebuild it at Scrapworks before another fight.');
  if (!report || !report.complete || !report.fits) blockers.push(report ? report.status : 'Frame unavailable.');
  const sensors = workbookPartStatNumber(head, 'Sensors', '%') ?? workbookPartStatNumber(head, 'Sensors'), torsoHull = workbookPartStatNumber(torso, 'Hull'), leadPower = workbookPartStatNumber(lead, 'Power'), rearPower = workbookPartStatNumber(rear, 'Power'), footwork = workbookMainNumber(legs, 'Footwork');
  for (const [label, value] of [['Head Sensors', sensors], ['Torso Hull', torsoHull], ['Lead Arm Power', leadPower], ['Rear Arm Power', rearPower], ['Leg Footwork', footwork]]) if (!(value > 0)) missingStats.push(label);
  if (missingStats.length) blockers.push(`Missing supported stats: ${missingStats.join(', ')}.`);
  const mappedUniqueFist = fist && String(fist.mainStat || '').trim().toLowerCase() === 'unique (see trait)' && WORKBOOK_SUPPORTED_COMBAT_TRAITS.has(String(fist.makerTrait || '').trim().toLowerCase());
  if (!fist || (!/^Impact\s+[\d.]+$/i.test(String(fist.mainStat || '')) && !mappedUniqueFist)) blockers.push('Fists need a visible Impact stat or a mapped Unique maker trait; Impact remains combat-inactive.');
  if (frameItem && +frameItem.integrity <= 0) blockers.push('Frame Integrity is depleted.');
  const conditionOf = key => clamp(Number.isFinite(+itemAt(key)?.state?.condition) ? +itemAt(key).state.condition : 100, 0, 100), integrityOf = key => clamp(Number.isFinite(+itemAt(key)?.state?.integrity) ? +itemAt(key).state.integrity : 100, 0, 100);
  if (conditionOf('torsoCore') < 15 || integrityOf('torsoCore') <= 0) blockers.push('Torso core is below fight-ready Condition or Integrity.');
  if (conditionOf('head') <= 0 || itemAt('head')?.state?.detached) blockers.push('Head is detached or has no Condition.');
  if (['leadArm','rearArm'].every(key => conditionOf(key) > 0 && conditionOf(key) < 15 || itemAt(key)?.state?.detached || conditionOf(key) <= 0)) blockers.push('Both arms are unusable.');
  const baseline = statsOf({ ...DEFAULT.build }, 'stock'), selected = report && report.selected || [], armor = selected.filter(row => row.def.slot === 'Armor plate').reduce((sum,row) => sum + (workbookPartStatNumber(row.def, 'Armor') || 0), 0);
  const battery = selected.find(row => row.def.slot === 'Power cell'), batteryValue = battery && workbookPartStatNumber(battery.def, 'Battery');
  const stats = { ...baseline, phMax: { ...baseline.phMax }, armP: { lead: workbookScaledPower(leadPower || 0), rear: workbookScaledPower(rearPower || 0) }, armTrait: { lead: { magnet:false,pile:false,hay:1,slag:false,twin:1,shear:false,crank:false,mine:false }, rear: { magnet:false,pile:false,hay:1,slag:false,twin:1,shear:false,crank:false,mine:false } }, brokenPartDamage: 0, critArmorPen: 0, hitBatterySteal: 0, lightningEvery: 0, lightningStun: 0, weldMul: 1 };
  stats.tellReadBonus = 0;
  stats.headFocusBonus = 0; stats.slipWindowBonus = 0; stats.counterWindowMultiplier = 1; stats.coachCallsNeverDrop = false; stats.freeHaymakerPerRound = false;
  for (const row of selected) {
    const mainStat = String(row.def?.mainStat || '').trim().toLowerCase();
    if (mainStat === 'head focus +1 s (tier 2)') stats.headFocusBonus += 1;
    else if (mainStat === 'slip window +0.08 s (tier 3)' || mainStat === 'slip window +0.08 s (tier 4)') stats.slipWindowBonus += .08;
    else if (mainStat === 'counter window +15% (tier 4)') stats.counterWindowMultiplier *= 1.15;
    else if (mainStat === 'coach calls never drop (tier 5)') stats.coachCallsNeverDrop = true;
    else if (mainStat === 'free haymaker each round (tier 4)') stats.freeHaymakerPerRound = true;
  }
  if (frame && report) {
    stats.hp = workbookScaledHull((+frame.hull || 0) + (+torsoHull || 0));
    stats.load = report.loadKg; stats.cap = report.capacityLimit; stats.over = report.capacityOver > 0; stats.total = report.loadKg;
    stats.move = Math.max(0, workbookScaledMove(+footwork || 0) * Math.max(0, 1 - report.loadOverKg / 100) * workbookConditionFactor(conditionOf('legs')));
  }
  stats.sense = clamp(WORKBOOK_COMBAT_SCALE.sense.base + (+sensors || 0) / 100 * WORKBOOK_COMBAT_SCALE.sense.rate, 0, 1.5) * workbookConditionFactor(conditionOf('head')); stats.armor = workbookScaledArmor(Math.max(0, armor));
  if (batteryValue > 0) stats.en = batteryValue;
  stats.phMax = { head: workbookPartHP(head), lead: workbookPartHP(lead), rear: workbookPartHP(rear), legs: workbookPartHP(legs) };
  stats.power = (stats.armP.lead + stats.armP.rear) / 2; stats.critArm = { lead: 0, rear: 0 }; stats.crit = 0; stats.set = null; stats.trait = 'stock';
  applyWorkbookPartCombatTraits(stats, selected);
  applyWorkbookFrameCombat(stats, frame);
  const itemIds = { head: itemAt('head')?.itemId || null, torso: itemAt('torsoCore')?.itemId || null, lead: itemAt('leadArm')?.itemId || null, rear: itemAt('rearArm')?.itemId || null, legs: itemAt('legs')?.itemId || null, fists: itemAt('fists')?.itemId || null };
  const partWear = Object.fromEntries(Object.entries(itemIds).map(([slot,itemId]) => [slot, cleanPartState((workbookPartItemById(itemId) || {}).state || {})]));
  const supportedDrawback = text => /^(fragile:\s*−20% part HP|\+20% mass|Part HP\s+[\d.]+|Mass\s+[\d.]+\s*kg?)$/i.test(text || '');
  const pendingEffects = selected.flatMap(row => [workbookTraitPendingText(row.def.makerTrait), supportedDrawback(row.def.drawback) ? '' : row.def.drawback].filter(Boolean).map(text => `${row.def.name}: ${text}`));
  pendingEffects.push('Legacy fight-template fallback: attack timing, energy/heat costs, speed, reach, guard, balance, and knockdown tuning are not workbook-derived yet.');
  if (frame) { pendingEffects.push(`${frame.name}: ${frame.mobility} mobility has no numeric conversion in the workbook crosswalk.`); pendingEffects.push(...workbookFramePendingEffects(frame).map(effect => `${frame.name}: ${effect}`)); }
  const supportedOptional = selected.filter(row => ['Armor plate','Power cell'].includes(row.def.slot) || WORKBOOK_REQUIRED_PLAN_KEYS.some(([key]) => key === row.key) || WORKBOOK_SUPPORTED_COMBAT_MAIN_STATS.has(String(row.def.mainStat || '').trim().toLowerCase()));
  const pendingSlots = selected.filter(row => !supportedOptional.includes(row) && row.def.slot !== 'Fist' && !/^Unique\s*\(see trait\)$/i.test(String(row.def.mainStat || '').trim())).map(row => `${row.label || row.key}: ${row.def.mainStat}`);
  return { ready: blockers.length === 0, blockers, pendingEffects: [...new Set([...pendingEffects, ...pendingSlots])], stats, partWear, itemIds, frameItem, frame, report, fatigue: Math.max(0, +bot?.fatigue || 0), fistImpact: fist && fist.mainStat || '' };
}
function workbookBuildSummary(bot, frameItem, frame, selected) {
  const picked = new Set(selected.map(item => item.key)), missing = WORKBOOK_REQUIRED_PLAN_KEYS.filter(([key]) => !picked.has(key)).map(([,label]) => label);
  const loadKg = selected.reduce((sum,item) => sum + workbookPartMass(item.def), 0), capacityUsed = selected.reduce((sum,item) => sum + workbookPartCapacityCost(item.def, frame), 0), value = selected.reduce((sum,item) => sum + (+item.def.baseValueScrap || 0), 0);
  const frameBonus = workbookFrameCapacityBonus(bot, frame);
  const loadLimitBonus = selected.filter(item => item.key === 'torsoCore').reduce((sum,item) => sum + workbookPartLoadBonus(item.def), 0), loadLimit = (+frame.load || 0) + loadLimitBonus;
  const capacityLimit = effectiveFrameCapacity(frame, frameItem.reinforcements) + frameBonus.total, capacityOver = Math.max(0, capacityUsed - capacityLimit), loadOverKg = Math.max(0, loadKg - loadLimit);
  const countSlot = slot => selected.filter(item => item.def.slot === slot).length;
  const firmwareSockets = frame.id === 'sentinel-chassis' ? 2 : 1;
  const socketChecks = [['Arms',countSlot('Arm'),frame.sockets.arms],['Back',countSlot('Back'),frame.sockets.back],['Firmware',countSlot('Firmware'),firmwareSockets],['Plates',countSlot('Armor plate'),frame.sockets.plates],['Utility',countSlot('Utility'),frame.sockets.utility]];
  const socketOver = socketChecks.filter(([,used,limit]) => used > limit).map(([label,used,limit]) => `${label} ${used}/${limit}`), complete = missing.length === 0, capacityFits = capacityOver <= 0, socketsFit = socketOver.length === 0;
  const status = !complete ? `Missing core slots: ${missing.join(', ')}.` : !capacityFits ? `Over capacity by ${capacityOver.toFixed(1)} points. This build cannot be fitted.` : !socketsFit ? `Frame socket limit exceeded: ${socketOver.join(', ')}.` : 'Core build fits Capacity and listed frame sockets.';
  const nonLegal = selected.filter(item => !/^legal$/i.test(String(item.def.legality || '').trim())).map(item => `${item.def.name} (${item.def.legality})`);
  return { selected, loadKg, loadLimit, loadLimitBonus, loadOverKg, loadPenalty: loadOverKg, capacityUsed, capacityLimit, capacityOver, frameBonus, socketChecks, socketOver, missing, complete, value, nonLegal, status, fits: complete && capacityFits && socketsFit };
}
function workbookVenueLegality(venueId, adapter) {
  const rule = WORKBOOK_VENUE_RULES_BY_LEGACY_ID[venueId] || null, selected = adapter?.report?.selected || [];
  const illegalParts = selected.filter(row => /^illegal\b/i.test(String(row.def?.legality || '').trim())).map(row => `${row.def.name} (${row.def.legality})`);
  if (adapter?.frame?.id === 'abattoir') illegalParts.push(`${adapter.frame.name} (illegal at licensed venues)`);
  const otherRestricted = selected.filter(row => !/^legal$/i.test(String(row.def?.legality || '').trim()) && !/^illegal\b/i.test(String(row.def?.legality || '').trim())).map(row => `${row.def.name} (${row.def.legality})`);
  return { rule, illegalParts, otherRestricted };
}
function renderWorkbookPlanner(bot) {
  if (!bot) return '';
  const frameItem = frameItemById(bot.frameItemId), frame = frameDefFor(frameItem);
  if (!frame || !frameItem) return `<div class="sect"><h4>Build Planner</h4><p class="note">Assign a frame first.</p></div>`;
  const plan = bot.workbookPlan || {}, report = workbookPlanSummary(bot, frameItem, frame), fields = workbookPlanSlots(frame).map(slot => {
    const id = `wbp-${slot.key}`, current = WORKBOOK_PART_BY_ID[plan[slot.key]], selected = current && current.slot === slot.partSlot ? current : null;
    const options = WORKBOOK_PART_DEFS.filter(def => def.slot === slot.partSlot).map(def => { const cost = workbookPartCapacityCost(def, frame), baseCost = +def.capacityCost || 0; return `<option value="${esc(def.id)}" ${selected && selected.id === def.id ? 'selected' : ''}>${esc(def.name)} · ${esc(def.maker)} · ${esc(def.tier)} · ${cost} CP${cost !== baseCost ? ` (base ${baseCost})` : ''} · ${(+def.massKg || 0).toFixed(1)} kg${!/^legal$/i.test(String(def.legality || '').trim()) ? ` · ${esc(def.legality)}` : ''}</option>`; }).join('');
    const detail = selected ? `<small class="wbplan-detail">${esc(selected.rarity)} · ${esc(selected.material)} · ${(+selected.massKg || 0).toFixed(1)} kg · HP ${esc(selected.partHP)} · Repair ${esc(selected.repairDurability)} · ${esc(selected.modSockets)} mod sockets · ${esc(selected.mainStat)}${selected.makerTrait ? ` · ${esc(selected.makerTrait)}` : ''}${selected.drawback ? ` · ${esc(selected.drawback)}` : ''} · ${esc(selected.legality)} · Tradeable: ${esc(selected.tradeable)} · ${esc(selected.whereToFind)} · ${+selected.baseValueScrap || 0} scrap · “${esc(selected.quip)}”</small>` : '';
    return `<div class="wbplan-field"><label for="${id}">${esc(slot.label)}${slot.required ? ' · required' : ''}</label><select id="${id}" data-wb-plan-slot="${esc(slot.key)}" aria-label="${esc(slot.label)} part"><option value="">Choose a part…</option>${options}</select>${detail}</div>`;
  }).join('');
  const loadMessage = report.loadOverKg ? `Overloaded by ${report.loadOverKg.toFixed(1)} kg: −${report.loadPenalty.toFixed(1)}% footwork.` : `${Math.max(0, report.loadLimit - report.loadKg).toFixed(1)} kg Load remaining.`;
  const sockets = report.socketChecks.map(([label,used,limit]) => `${label} ${used}/${limit}`).join(' · ');
  return `<div class="sect wbplan-sect"><h4>Build Planner</h4><p class="note">Preview only. This does not buy or fit anything.</p><div class="wbplan-grid">${fields}</div><div class="wbplan-kpis"><div><small>Load</small><b>${report.loadKg.toFixed(1)} / ${report.loadLimit} kg</b><span>${loadMessage}</span></div><div><small>Capacity</small><b>${report.capacityUsed.toFixed(1)} / ${report.capacityLimit}</b><span>${report.capacityOver ? `Over by ${report.capacityOver.toFixed(1)} · build cannot be fitted` : `${(report.capacityLimit - report.capacityUsed).toFixed(1)} available before mods`}</span></div><div><small>Frame sockets</small><b>${sockets}</b><span>${report.socketOver.length ? `Exceeded: ${esc(report.socketOver.join(', '))}` : 'Within listed socket limits'}</span></div><div><small>Build value</small><b>${report.value} scrap</b><span>${report.fits ? 'Core build fits' : 'Core fit incomplete'}</span></div></div><p class="stable-footnote">${esc(report.status)}${report.nonLegal.length ? ` Legality to review: ${esc(report.nonLegal.join(', '))}.` : ''} Mapped frame stats and Capacity rules apply in this preview. Mod Capacity, unmapped frame restrictions, and full arena legality remain open. Combat still uses the current owned build until catalog parts are fitted.</p></div>`;
}
function renderWorkbookOwnedBuild(bot) {
  if (!bot) return '';
  const frameItem = frameItemById(bot.frameItemId), frame = frameDefFor(frameItem);
  if (!frame || !frameItem) return `<div class="sect"><h4>Custom Build</h4><p class="note">Assign a frame first.</p></div>`;
  const inventoryCount = S.items.filter(item => item && item.kind === 'workbook-part').length, fit = bot.workbookFittedItems || {}, report = workbookOwnedFitSummary(bot, frameItem, frame, fit), adapter = workbookCombatAdapter(bot), fields = workbookPlanSlots(frame).map(slot => {
    const itemId = fit[slot.key] || '', current = workbookPartItemById(itemId), options = S.items.filter(item => item && item.kind === 'workbook-part' && WORKBOOK_PART_BY_ID[item.defId]?.slot === slot.partSlot && (item.location === 'stash' || item.location === 'bay' && item.botId === bot.id && item.slot === slot.key)).map(item => {
      const def = WORKBOOK_PART_BY_ID[item.defId], condition = Math.round(item.state && item.state.condition || 0), integrity = Math.round(item.state && item.state.integrity || 0);
      return `<option value="${esc(item.itemId)}" ${current && current.itemId === item.itemId ? 'selected' : ''}>${esc(def.name)} · ${esc(def.mainStat)} · ${workbookPartCapacityCost(def, frame)} CP · ${condition}% Condition / ${integrity}% Integrity</option>`;
    }).join('');
    const currentDef = current && WORKBOOK_PART_BY_ID[current.defId], effectLine = currentDef ? `<small class="wbplan-detail">${esc(currentDef.mainStat)}${currentDef.makerTrait ? ` · ${esc(currentDef.makerTrait)}` : ''}${currentDef.drawback ? ` · ${esc(currentDef.drawback)}` : ''}</small>` : '';
    return `<div class="wbplan-field"><label for="wbf-${slot.key}">${esc(slot.label)}${slot.required ? ' · core' : ''}</label><select id="wbf-${slot.key}" data-wb-fit-bot="${esc(bot.id)}" data-wb-fit-slot="${esc(slot.key)}" aria-label="Owned ${esc(slot.label)} part for ${esc(bot.name || 'unnamed bot')}"><option value="">${current ? 'Move fitted item to stash' : 'Leave empty'}</option>${options}</select>${effectLine}</div>`;
  }).join('');
  const loadMessage = report.loadOverKg ? `Overloaded by ${report.loadOverKg.toFixed(1)} kg: −${report.loadPenalty.toFixed(1)}% footwork.` : `${Math.max(0, report.loadLimit - report.loadKg).toFixed(1)} kg Load remaining.`;
  const sockets = report.socketChecks.map(([label,used,limit]) => `${label} ${used}/${limit}`).join(' · ');
  const bridgeStatus = adapter.ready ? 'Core stats are connected to the arena. ' : `Not arena-ready: ${esc(adapter.blockers.join(' '))} `, pendingEffects = adapter.pendingEffects.length ? `Pending effects: ${esc(adapter.pendingEffects.slice(0, 5).join('; '))}${adapter.pendingEffects.length > 5 ? `; and ${adapter.pendingEffects.length - 5} more` : ''}. ` : '';
  return `<div class="sect wbplan-sect"><h4>Custom Build · ${esc(bot.name || 'Unnamed Bot')}</h4><p class="note">${inventoryCount ? `${inventoryCount} salvaged part${inventoryCount === 1 ? '' : 's'} owned. ` : 'No salvaged parts yet. Salvage runs and the market supply them. '}Fit only unique parts in this career's stash or this bot's bay. Capacity and listed socket limits block overfitting; Load overage is a footwork penalty. Fist Impact remains visible on the fitted Fists part and does not affect combat.</p><div class="wbplan-grid">${fields}</div><div class="wbplan-kpis"><div><small>Load</small><b>${report.loadKg.toFixed(1)} / ${report.loadLimit} kg</b><span>${loadMessage}</span></div><div><small>Capacity</small><b>${report.capacityUsed.toFixed(1)} / ${report.capacityLimit}</b><span>${report.capacityOver ? `Over by ${report.capacityOver.toFixed(1)} · cannot fit` : `${(report.capacityLimit - report.capacityUsed).toFixed(1)} available`}</span></div><div><small>Frame sockets</small><b>${sockets}</b><span>${report.socketOver.length ? `Exceeded: ${esc(report.socketOver.join(', '))}` : 'Within listed socket limits'}</span></div><div><small>Part value</small><b>${report.value} scrap</b><span>${report.complete ? 'Core build complete' : `Missing: ${esc(report.missing.join(', '))}`}</span></div></div><p class="stable-footnote">${esc(report.status)}${report.nonLegal.length ? ` Legality to review: ${esc(report.nonLegal.join(', '))}.` : ''} ${bridgeStatus}${pendingEffects}Unmapped frame effects, mods, and venue legality remain open. Fitted parts render as material-coded mounts on the articulated combat shell; distinct catalog-specific silhouettes remain a later art pass.</p></div>`;
}
function renderWorkbookModCatalog() {
  const rows = WORKBOOK_MOD_DEFS.map(mod => { const stacking = mod.stacking && mod.stacking !== '-' ? ` · ${esc(mod.stacking)}` : ''; return `<div class="mrow"><span class="rdot" style="--rc:${workbookRarityColor(mod)}"></span><div><b>${esc(mod.name)}</b><small>${esc(mod.type)} · ${esc(mod.rarity)} · ${esc(mod.maker)} · ${+mod.capacityCost || 0} Capacity · ${+mod.baseValueScrap || 0} scrap · ${esc(mod.legality)}${stacking}</small><small>${esc(mod.effect)}</small></div></div>`; }).join('');
  return `<details class="sect wb-mod-reference"><summary>All mods · ${WORKBOOK_MOD_DEFS.length}</summary><div class="wb-mod-catalog">${rows}</div></details>`;
}
function fitOwnedWorkbookPart(botId, key, itemId) {
  const bot = (S.stable || []).find(candidate => candidate && candidate.id === botId), frameItem = bot && frameItemById(bot.frameItemId), frame = frameDefFor(frameItem), slot = frame && workbookPlanSlots(frame).find(entry => entry.key === key);
  if (!bot || !frameItem || !frame || !slot) return false;
  if (!bot.workbookFittedItems || typeof bot.workbookFittedItems !== 'object' || Array.isArray(bot.workbookFittedItems)) bot.workbookFittedItems = {};
  const currentId = bot.workbookFittedItems[key], current = workbookPartItemById(currentId);
  if (!itemId) {
    if (current) { logWorkbookPartHistory(current, 'stashed', { botId: bot.id, slot: key }); current.location = 'stash'; current.botId = null; current.slot = null; }
    delete bot.workbookFittedItems[key]; bot.combatReady = workbookCombatAdapter(bot).ready; save(); renderStable(); toast(current ? `Moved ${WORKBOOK_PART_BY_ID[current.defId]?.name || 'part'} to stash.` : 'Slot cleared.'); return true;
  }
  const item = workbookPartItemById(itemId), def = item && WORKBOOK_PART_BY_ID[item.defId];
  if (!item || !def || def.slot !== slot.partSlot || !(item.location === 'stash' || item.location === 'bay' && item.botId === bot.id && item.slot === key)) { toast('That unique item is not available for this slot.', 'bad'); renderStable(); return false; }
  const alreadyFitted = Object.entries(bot.workbookFittedItems).find(([otherKey, otherId]) => otherId === item.itemId && otherKey !== key);
  if (alreadyFitted) { toast('A unique part can only be fitted in one slot.', 'bad'); renderStable(); return false; }
  for (const otherBot of S.stable || []) if (otherBot && otherBot.id !== bot.id && Object.values(otherBot.workbookFittedItems || {}).includes(item.itemId)) { toast('That unique part is fitted to another bot.', 'bad'); renderStable(); return false; }
  const proposed = { ...bot.workbookFittedItems, [key]: item.itemId }, report = workbookOwnedFitSummary(bot, frameItem, frame, proposed);
  if (report.capacityOver > 0 || report.socketOver.length) { toast(report.capacityOver > 0 ? `That part would exceed frame Capacity by ${report.capacityOver.toFixed(1)}.` : `That part would exceed a frame socket limit (${report.socketOver.join(', ')}).`, 'bad'); renderStable(); return false; }
  if (current && current.itemId !== item.itemId) { logWorkbookPartHistory(current, 'stashed', { botId: bot.id, slot: key }); current.location = 'stash'; current.botId = null; current.slot = null; }
  if (current !== item) logWorkbookPartHistory(item, 'fitted', { botId: bot.id, slot: key });
  item.location = 'bay'; item.botId = bot.id; item.slot = key; bot.workbookFittedItems = proposed; bot.combatReady = workbookCombatAdapter(bot).ready;
  save(); renderStable(); toast(`Fitted ${def.name} to ${bot.name || 'bot'}.`, 'good'); return true;
}
function createFrameItem(defId, options = {}) {
  const def = FRAME_BY_ID[defId]; if (!def) return null;
  const reinforcements = clamp(Math.floor(+options.reinforcements || 0), 0, 3), maxIntegrity = effectiveFrameIntegrity(def, reinforcements);
  const item = { itemId: `frame-${(S.nextItemId++).toString(36)}`, kind: 'frame', defId, location: FRAME_LOCATIONS.includes(options.location) ? options.location : 'stash', botId: options.botId || null, slot: null, integrity: clamp(Number.isFinite(+options.integrity) ? +options.integrity : maxIntegrity, 0, maxIntegrity), reinforcements, history: Array.isArray(options.history) ? options.history : [] };
  S.items.push(item); return item;
}
function migrateFrameItems() {
  let changed = false;
  S.items = Array.isArray(S.items) ? S.items : [];
  S.nextItemId = Math.max(1, Math.floor(+S.nextItemId || 1));
  S.stableBays = clamp(Math.floor(+S.stableBays || 2), 2, 8);
  S.stableDay = Math.max(1, Math.floor(+S.stableDay || 1));
  for (const item of S.items) if (item && item.kind === 'frame') {
    const def = FRAME_BY_ID[item.defId];
    if (!item.itemId) { item.itemId = `frame-${(S.nextItemId++).toString(36)}`; changed = true; }
    const location = FRAME_LOCATIONS.includes(item.location) ? item.location : 'stash';
    if (item.location !== location) changed = true;
    item.location = location; item.botId = item.botId || null; item.slot = null;
    const reinforcements = clamp(Math.floor(+item.reinforcements || 0), 0, 3);
    if (item.reinforcements !== reinforcements) changed = true;
    item.reinforcements = reinforcements;
    if (def) {
      const integrity = clamp(Number.isFinite(+item.integrity) ? +item.integrity : def.maxIntegrity, 0, effectiveFrameIntegrity(def, reinforcements));
      if (item.integrity !== integrity) changed = true;
      item.integrity = integrity;
    }
    item.history = Array.isArray(item.history) ? item.history : [];
    const serial = parseInt(String(item.itemId).replace(/^frame-/, ''), 36); if (Number.isFinite(serial)) S.nextItemId = Math.max(S.nextItemId, serial + 1);
  }
  for (const bot of S.stable) if (bot && typeof bot === 'object') {
    const original = bot.workbookPlan, raw = original && typeof original === 'object' && !Array.isArray(original) ? original : {}, plan = {};
    for (const [key,id] of Object.entries(raw)) { const def = WORKBOOK_PART_BY_ID[id]; if (def && WORKBOOK_PLAN_SLOT_TYPES[key] === def.slot) plan[key] = def.id; }
    if (!original || typeof original !== 'object' || Array.isArray(original) || JSON.stringify(original) !== JSON.stringify(plan)) { bot.workbookPlan = plan; changed = true; }
  }
  const claimedFrames = new Set();
  for (const bot of S.stable) if (bot && bot.frameItemId) {
    const item = frameItemById(bot.frameItemId);
    if (!item || claimedFrames.has(item.itemId)) { bot.frameItemId = null; changed = true; continue; }
    claimedFrames.add(item.itemId);
    const itemLocation = bot.storageLocation === 'truck' ? 'truck' : 'bay';
    if (item.location !== itemLocation || item.botId !== bot.id) { item.location = itemLocation; item.botId = bot.id; changed = true; }
  }
  const active = S.stable.find(bot => bot && bot.id === S.activeBotId);
  if (active && !frameItemById(active.frameItemId)) {
    let starter = S.items.find(item => item && item.kind === 'frame' && item.defId === 'church-raffle-chassis' && item.location === 'stash');
    if (!starter) starter = createFrameItem('church-raffle-chassis');
    if (starter) { starter.location = 'bay'; starter.botId = active.id; active.frameItemId = starter.itemId; changed = true; }
  }
  const activeFrame = active && frameItemById(active.frameItemId), activeFrameDef = frameDefFor(activeFrame);
  if (!S.starterChurchReinforcementApplied && activeFrame && activeFrameDef && activeFrame.defId === 'church-raffle-chassis') {
    if (activeFrame.reinforcements < 3) {
      activeFrame.reinforcements = 3;
      activeFrame.integrity = clamp(+activeFrame.integrity || 0, 0, effectiveFrameIntegrity(activeFrameDef, 3));
    }
    S.starterChurchReinforcementApplied = true; changed = true;
  }
  if (!S.starterFramesSeeded) {
    if (IS_NEW_CAREER && !S.items.some(item => item && item.kind === 'frame' && item.defId === 'forklift-frame')) createFrameItem('forklift-frame');
    S.starterFramesSeeded = true; changed = true;
  }
  const claimedWorkbookParts = new Set();
  for (const bot of S.stable) if (bot && typeof bot === 'object') {
    const original = bot.workbookFittedItems, raw = original && typeof original === 'object' && !Array.isArray(original) ? original : {}, fitted = {};
    for (const [key, itemId] of Object.entries(raw)) {
      const item = workbookPartItemById(itemId), def = item && WORKBOOK_PART_BY_ID[item.defId], expected = WORKBOOK_PLAN_SLOT_TYPES[key];
      if (!item || !def || !expected || expected !== def.slot || claimedWorkbookParts.has(item.itemId)) continue;
      if (item.location !== 'stash' && !(item.location === 'bay' && item.botId === bot.id && item.slot === key)) continue;
      if (item.location !== 'bay' || item.botId !== bot.id || item.slot !== key) changed = true;
      item.location = 'bay'; item.botId = bot.id; item.slot = key; fitted[key] = item.itemId; claimedWorkbookParts.add(item.itemId);
    }
    if (!original || typeof original !== 'object' || Array.isArray(original) || JSON.stringify(original) !== JSON.stringify(fitted)) { bot.workbookFittedItems = fitted; changed = true; }
  }
  for (const item of S.items) if (item && item.kind === 'workbook-part' && item.location === 'bay' && !claimedWorkbookParts.has(item.itemId)) { item.location = 'stash'; item.botId = null; item.slot = null; changed = true; }
  for (const bot of S.stable) if (bot && typeof bot === 'object') {
    if (!Array.isArray(bot.partsHistory)) { bot.partsHistory = []; changed = true; }
    if (!Array.isArray(bot.makers)) { bot.makers = []; changed = true; }
    for (const item of S.items) if (item && item.kind === 'workbook-part' && Array.isArray(item.history)) for (const event of item.history) {
      if (!event || event.botId !== bot.id || !event.action) continue;
      if (recordStablePartHistory(bot, item, event.action, event, true)) changed = true;
    }
    for (const [slot, itemId] of Object.entries(bot.workbookFittedItems || {})) {
      const item = workbookPartItemById(itemId), def = item && WORKBOOK_PART_BY_ID[item.defId]; if (!item || !def) continue;
      const hasFitRecord = bot.partsHistory.some(event => event && event.itemId === item.itemId && ['fitted', 'migration-fitted'].includes(event.action));
      if (!hasFitRecord && recordStablePartHistory(bot, item, 'migration-fitted', { slot }, true)) changed = true;
      if (rememberBotMaker(bot, def.maker)) changed = true;
    }
    for (const item of S.items) if (item && item.kind === 'part' && item.location === 'bay' && item.botId === bot.id) {
      const hasFitRecord = bot.partsHistory.some(event => event && event.itemId === item.itemId && ['fitted', 'migration-fitted'].includes(event.action));
      if (!hasFitRecord && recordStablePartHistory(bot, item, 'migration-fitted', { slot: item.slot }, true)) changed = true;
      else if (hasFitRecord) { const maker = partByAny(item.defId)?.q?.b; if (rememberBotMaker(bot, maker ? BRANDS[maker]?.name || maker : '')) changed = true; }
    }
    const frameItem = frameItemById(bot.frameItemId);
    if (frameItem && recordStableFrameHistory(bot, frameItem, 'frame-assigned', true)) changed = true;
  }
  if (S.stableSchema < 8) { S.stableSchema = 8; changed = true; }
  if (changed) save();
}
/* Provisional repair costs and wear, see production/master-plan.md (Milestone B). Custom parts wear at their catalog rate instead of loss.normal. */
const REPAIR_RULES = {
  fasteners: { id:'MT-15', min:2, max:10 }, conditionPerMaterial:25, defaultFamily:'Ferrous', buyMarkup:1.2,
  reattach: { 'MT-15':6, 'MT-16':4 }, reattachCondition:30, offlineHeadCondition:1, replacement: { condition:40, integrity:60 }, loss: { normal:1, fromBroken:3, reattach:5 },
  starterSupplies: { 'MT-15':20, 'MT-16':10, 'MT-01':10 }
};
const REPAIR_BOT_KEYS = { head:'head', torso:'torsoCore', lead:'leadArm', rear:'rearArm', legs:'legs', back:'back' };
/** The part in a slot of the active bot, whether stock or custom, with what its repair needs to know. */
function repairPart(slot) {
  const bot = activeStableBot();
  if (bot?.combatModel === 'workbook') {
    const item = workbookPartItemById(bot.workbookFittedItems?.[REPAIR_BOT_KEYS[slot]]), def = item && WORKBOOK_PART_BY_ID[item.defId];
    if (!def) return { state:cleanPartState(), baseValue:0, family:REPAIR_RULES.defaultFamily, loss:REPAIR_RULES.loss.normal, empty:true };
    item.state = cleanPartState(item.state);
    return { state:item.state, baseValue:+def.baseValueScrap || 0, family:def.material, loss:+(/−(\d+)/.exec(def.repairDurability || '')?.[1]) || REPAIR_RULES.loss.normal, item, bot };
  }
  const id = S.build[slot], q = id && id !== 'none' ? part(PART_STATE_POOL[slot], id) : null;
  return { state:partStateFor(slot), baseValue:q ? (+q.cost || 0) : 0, family:REPAIR_RULES.defaultFamily, loss:REPAIR_RULES.loss.normal, empty:!q };
}
const repairState = slot => repairPart(slot).state;
function repairCost(slot) {
  const target = repairPart(slot), state = target.state; if (target.empty) return 0;
  if (state.detached) return LOST_COST[slot] || 0;
  if (state.integrity < REPAIR_THRESHOLD) return 0;
  if (state.condition >= state.integrity && !state.faults.length && !state.patched) return 0;
  return Math.round(target.baseValue * .6 * Math.max(0, state.integrity - state.condition) / 100 * (1 + .08 * state.repairCount)) || 0;
}
const familyRepairMaterial = family => WORKBOOK_MATERIAL_DEFS.filter(row => row.family === family).sort((a, b) => a.tier - b.tier)[0] || WORKBOOK_MATERIAL_DEFS.find(row => row.family === REPAIR_RULES.defaultFamily);
/** Materials one slot's repair uses, as { materialId: count }. */
function repairMaterialNeed(slot) {
  const target = repairPart(slot), state = target.state, { fasteners, conditionPerMaterial, reattach } = REPAIR_RULES;
  if (state.detached) return { ...reattach };
  const restored = Math.max(0, state.integrity - state.condition);
  if (!restored) return { [fasteners.id]:fasteners.min };
  const need = { [fasteners.id]:clamp(Math.round(fasteners.min + (fasteners.max - fasteners.min) * restored / 100), fasteners.min, fasteners.max) }, material = familyRepairMaterial(target.family);
  need[material.id] = (need[material.id] || 0) + Math.ceil(restored / conditionPerMaterial);
  return need;
}
const repairMaterialPrice = (id, count) => Math.ceil(count * (+WORKBOOK_MATERIAL_BY_ID[id]?.baseValueScrap || 0) * REPAIR_RULES.buyMarkup);
/** Full price of repairing these slots: scrap fee, materials used, and any shortfall bought automatically. */
function repairQuote(slots) {
  const fee = slots.reduce((sum, slot) => sum + repairCost(slot), 0), materials = {};
  for (const slot of slots) for (const [id, count] of Object.entries(repairMaterialNeed(slot))) materials[id] = (materials[id] || 0) + count;
  return workshopBill(fee, materials);
}
/** A workshop job's price: its scrap fee plus anything missing from stock, bought automatically. */
function workshopBill(fee, materials) {
  const buy = {}; let buyScrap = 0;
  if (S.sandbox) return { fee:0, materials:{}, buy, buyScrap:0, total:0 };
  for (const [id, count] of Object.entries(materials)) { const missing = Math.max(0, count - workbookMaterialCount(id)); if (missing) { buy[id] = missing; buyScrap += repairMaterialPrice(id, missing); } }
  return { fee, materials, buy, buyScrap, total:fee + buyScrap };
}
const payWorkshopBill = bill => { if (S.sandbox) return; S.scrap -= bill.total; for (const [id, count] of Object.entries(bill.materials)) S.materials[id] = Math.max(0, workbookMaterialCount(id) - count); };
const repairNeeded = slot => { const s = repairState(slot); return !!(s.detached || s.condition < s.integrity || s.faults.length || s.patched); };
const canWorkshopRepair = slot => { const s = repairState(slot); return s.integrity >= REPAIR_THRESHOLD && (s.detached || s.condition < s.integrity || s.patched) && (!s.detached || ['head', 'lead', 'rear'].includes(slot)); };
const repairTotal = () => repairQuote(PART_STATE_SLOTS.filter(canWorkshopRepair)).total;
const hasLost = () => ['head', 'lead', 'rear'].some(slot => repairState(slot).detached);
const dmgAvg = () => 1 - ['head', 'torso', 'lead', 'rear', 'legs'].reduce((sum, slot) => sum + repairState(slot).condition, 0) / 500;
const hasPartWear = () => PART_STATE_SLOTS.some(slot => { const s = repairState(slot); return s.condition < 100 || s.integrity < 100 || s.detached || s.faults.length > 0; });
function workshopRepair(slot) {
  if (!repairNeeded(slot)) return false;
  const target = repairPart(slot), state = target.state, { loss } = REPAIR_RULES; // read after the check: reading a part's state replaces the stored object
  if (state.detached) {
    if (!['head', 'lead', 'rear'].includes(slot) || state.integrity < REPAIR_THRESHOLD) return false;
    state.detached = false; state.condition = REPAIR_RULES.reattachCondition; state.integrity = Math.max(0, state.integrity - loss.reattach); state.patched = false;
  } else {
    if (state.integrity < REPAIR_THRESHOLD) return false;
    state.integrity = Math.max(0, state.integrity - (state.condition < 15 ? loss.fromBroken : target.loss)); state.condition = state.integrity; state.repairCount++; state.patched = false;
  }
  if (target.item) logWorkbookPartHistory(target.item, 'repaired', { botId:target.bot.id, slot, condition:state.condition, integrity:state.integrity });
  return true;
}
function doRepair(k) {
  const slots = k === 'all' ? PART_STATE_SLOTS.filter(canWorkshopRepair) : [k].filter(canWorkshopRepair), quote = repairQuote(slots);
  if (!slots.length) return false;
  if (!S.sandbox && S.scrap < quote.total) { toast(`Not enough scrap. That repair costs ${quote.total}.`); return false; }
  payWorkshopBill(quote);
  const repairedFromBroken = slots.some(slot => repairState(slot).condition < 15); for (const slot of slots) workshopRepair(slot); if (repairedFromBroken) evaluateWorkbookAchievements({ type:'repair', fromBroken:true });
  save(); refreshWallet(); return true;
}
/** Slots that must be fixed before the active bot can fight. */
function repairBlockingSlots() {
  const blockers = ['head', 'lead', 'rear'].filter(slot => repairState(slot).detached);
  if (repairState('torso').condition < 15 || repairState('torso').integrity <= 0) blockers.push('torso');
  if (['lead', 'rear'].every(slot => { const p = repairState(slot); return p.detached || (p.condition > 0 && p.condition < 15); })) blockers.push('lead', 'rear');
  return [...new Set(blockers)].filter(slot => !repairPart(slot).empty);
}
/** Mang Benny's free help, so running out of scrap or wearing out a part can never end a career. */
/** Whether a torso kill at this venue rolls a Wreck check. */
const fightWreckApplies = (venueId, roll) => roll < venueWreckChance(venueId);
/** No Wreck check this time: the bot goes home with its torso barely working. */
function survivedWreckCheck() { repairState('torso').condition = 1; }
const emergencyRepairAvailable = () => { const slots = repairBlockingSlots(); if (S.sandbox || !slots.length) return false; const fixable = slots.filter(canWorkshopRepair); return fixable.length < slots.length || S.scrap < repairQuote(fixable).total; };
function emergencyRepair() {
  if (!emergencyRepairAvailable()) return false;
  for (const slot of repairBlockingSlots()) {
    if (canWorkshopRepair(slot)) { workshopRepair(slot); continue; }
    Object.assign(repairState(slot), { ...REPAIR_RULES.replacement, detached:false, faults:[], patched:false, repairCount:0, overhauls:0 }); // worn out: a junkyard replacement
  }
  save(); return true;
}
/* Provisional: the workbook gives the dismantle yield and overhaul limits, but not what a part contains or an overhaul costs. */
const PART_WORK_RULES = {
  contentFasteners:4, contentFamily: { min:2, max:12, valueShare:.5 },
  overhaul: { integrity:20, cap:90, maxPerPart:2, materialShare:.5, feeShare:.25, feeMin:30, minRank:2 }
};
function partWorkInfo(item) {
  if (item?.kind === 'workbook-part') { const def = WORKBOOK_PART_BY_ID[item.defId]; return def ? { name:def.name, baseValue:+def.baseValueScrap || 0, family:def.material } : null; }
  const found = item?.kind === 'part' ? partByAny(item.defId) : null;
  return found ? { name:found.q.name, baseValue:+found.q.cost || 0, family:REPAIR_RULES.defaultFamily } : null;
}
/** What a whole part is made of, as { materialId: count }. */
function partMaterialContent(item) {
  const info = partWorkInfo(item); if (!info) return {};
  const material = familyRepairMaterial(info.family), { min, max, valueShare } = PART_WORK_RULES.contentFamily, fasteners = REPAIR_RULES.fasteners.id;
  const content = { [material.id]:clamp(Math.round(info.baseValue / Math.max(1, +material.baseValueScrap || 1) * valueShare), min, max) };
  content[fasteners] = (content[fasteners] || 0) + PART_WORK_RULES.contentFasteners;
  return content;
}
/** What dismantling gives back: 30% + 0.4% × Integrity of the part's materials, at least one of each. */
function dismantleYield(item) {
  const share = workbookDismantleMaterialYield(+item?.state?.integrity || 0);
  return Object.fromEntries(Object.entries(partMaterialContent(item)).map(([id, count]) => [id, Math.max(1, Math.floor(count * share))]));
}
const partWorkItem = id => (S.items || []).find(item => item && item.itemId === id && (item.kind === 'part' || item.kind === 'workbook-part')) || null;
/** Destroys a spare part in the stash for materials. Fitted parts must come off first. */
function dismantlePart(itemId) {
  const item = partWorkItem(itemId), info = partWorkInfo(item); if (!info || item.location !== 'stash') return false;
  const returned = dismantleYield(item);
  for (const [id, count] of Object.entries(returned)) addWorkbookMaterial(id, count);
  S.items = S.items.filter(row => row !== item);
  if (item.kind === 'part' && !S.items.some(row => row && row.kind === 'part' && row.defId === item.defId)) S.owned = (S.owned || []).filter(id => id !== item.defId);
  addWorkbookLedgerEntry({ action:'dismantle', itemId:item.itemId, defId:item.defId, materials:returned, scrap:0 });
  save(); return true;
}
/** Parts the Scrapworks can reach: the active bot's fitted parts and everything in the stash. */
const partWorkItems = () => (S.items || []).filter(item => item && (item.kind === 'part' || item.kind === 'workbook-part') && partWorkInfo(item) && (item.location === 'stash' || (item.location === 'bay' && item.botId === S.activeBotId)));
function overhaulQuote(item) {
  const info = partWorkInfo(item), { materialShare, feeShare, feeMin } = PART_WORK_RULES.overhaul;
  return workshopBill(Math.max(feeMin, Math.round((info?.baseValue || 0) * feeShare)), Object.fromEntries(Object.entries(partMaterialContent(item)).map(([id, count]) => [id, Math.ceil(count * materialShare)])));
}
/** Why this part can't be overhauled, or '' if it can. */
function overhaulBlocker(item) {
  const state = item?.state || {}, { cap, maxPerPart, minRank } = PART_WORK_RULES.overhaul;
  if (!S.sandbox && workbookRankState().rank < minRank) return `Needs Rank ${minRank}`;
  if ((+state.overhauls || 0) >= maxPerPart) return `Already overhauled ${maxPerPart} times`;
  if ((+state.integrity || 0) >= cap) return 'In good shape';
  if ((+state.integrity || 0) < REPAIR_THRESHOLD) return 'Too worn out';
  return '';
}
/** Restores Integrity, the only way to undo wear. Condition stays as it is; repair it separately. */
function overhaulPart(itemId) {
  const item = partWorkItem(itemId); if (!item || overhaulBlocker(item) || !partWorkItems().includes(item)) return false;
  const bill = overhaulQuote(item), { integrity, cap } = PART_WORK_RULES.overhaul;
  if (!S.sandbox && S.scrap < bill.total) { toast(`Not enough scrap. That overhaul costs ${bill.total}.`); return false; }
  payWorkshopBill(bill);
  item.state = cleanPartState(item.state); item.state.integrity = Math.min(cap, item.state.integrity + integrity); item.state.overhauls++;
  addWorkbookLedgerEntry({ action:'overhaul', itemId:item.itemId, defId:item.defId, materials:bill.materials, scrap:-bill.total });
  save(); refreshWallet(); return true;
}
/** One-time supplies, so the first repairs don't feel like a tax. Runs for new careers and converted saves. */
function grantRepairSupplies() {
  if (S.repairSuppliesGranted) return;
  S.repairSuppliesGranted = true;
  for (const [id, count] of Object.entries(REPAIR_RULES.starterSupplies)) addWorkbookMaterial(id, count);
}
/** A head knocked offline by punches is Broken, not gone: only a Destroy finisher tears it off. */
/** Fight health back to Condition: the share left, scaled to the part's Integrity. A part with anything left never rounds down to 0. */
const conditionFromHealth = (share, integrity) => { const condition = clamp(share, 0, 1) * clamp(+integrity || 0, 0, 100); return share > 0 ? Math.max(1, Math.round(condition)) : 0; };
const storedCondition = (slot, condition, detached) => slot === 'head' && !detached ? Math.max(REPAIR_RULES.offlineHeadCondition, condition) : condition;
function storeDamage(me) {
  if (me.spec.workbookCombat) {
    const zones = { head: 'head', torso: 'torso', lead: 'lead', rear: 'rear', legs: 'legs' };
    for (const [slot, zone] of Object.entries(zones)) {
      const item = workbookPartItemById(me.spec.workbookCombat.itemIds[slot]); if (!item) continue;
      const source = me.spec.partWear && me.spec.partWear[slot], state = item.state = cleanPartState(item.state || {}); let condition = 0;
      if (source) { state.integrity = Math.min(state.integrity, source.integrity); state.repairCount = Math.max(state.repairCount, source.repairCount); }
      if (slot === 'torso' && me.coreBreached) state.integrity = 0; condition = conditionFromHealth(frac(me, zone), Math.max(state.integrity, 1));
      state.detached = ['head', 'lead', 'rear'].includes(slot) && (!!me.lost[slot] || (condition <= 0 && slot !== 'head'));
      state.condition = storedCondition(slot, condition, state.detached);
      state.faults = me.cond[slot] && CONDS[me.cond[slot].type] ? [{ type: me.cond[slot].type, severity: clamp(me.cond[slot].sev || 1, 1, 3) }] : [];
      logWorkbookPartHistory(item, 'fight-damaged', { botId: me.spec.workbookCombat.botId, slot, condition, integrity: state.integrity });
    }
    return;
  }
  const owner = (S.stable || []).find(bot => bot && bot.id === (S.activeBotId || 'bot-starter'));
  const zones = { head: 'head', torso: 'torso', lead: 'lead', rear: 'rear', legs: 'legs' };
  for (const [slot, zone] of Object.entries(zones)) {
    const state = partStateFor(slot), source = me.spec.partWear && me.spec.partWear[slot]; let condition = 0;
    if (source) { state.integrity = Math.min(state.integrity, source.integrity); state.repairCount = Math.max(state.repairCount, source.repairCount); }
    if (slot === 'torso' && me.coreBreached) state.integrity = 0; condition = conditionFromHealth(frac(me, zone), Math.max(state.integrity, 1));
    state.detached = ['head', 'lead', 'rear'].includes(slot) && (!!me.lost[slot] || (condition <= 0 && slot !== 'head'));
    state.condition = storedCondition(slot, condition, state.detached);
    state.faults = me.cond[slot] && CONDS[me.cond[slot].type] ? [{ type: me.cond[slot].type, severity: clamp(me.cond[slot].sev || 1, 1, 3) }] : [];
    const item = activePartItem(slot, me.spec.build?.[slot]); if (owner && item) recordStablePartHistory(owner, item, 'fight-damaged', { slot, condition, integrity: state.integrity });
  }
}
/** How much of a part's fight health is left: its Condition as a share of what repairs can reach. Scars lower stats, not health. */
const fightHealthShare = state => { const condition = clamp(+state.condition || 0, 0, 100), integrity = clamp(+state.integrity || 0, 0, 100); return integrity > 0 ? Math.min(1, condition / integrity) : condition / 100; };
function applyCarry(f) {
  const wear = f.spec.partWear || (f.spec.id === 'you' ? partWearForBuild(f.spec.build) : null); if (!wear) return;
  f.startCondition = Object.fromEntries(PART_STATE_SLOTS.slice(0, 5).map(slot => [slot, 100 * fightHealthShare(wear[slot] || cleanPartState())]));
  for (const slot of ['head', 'lead', 'rear', 'legs']) { const state = wear[slot] || cleanPartState(); f.ph[slot] = Math.max(0, f.s.phMax[slot] * fightHealthShare(state)); if (['head', 'lead', 'rear'].includes(slot)) f.lost[slot] = !!state.detached; f.broken[slot] = state.condition > 0 && state.condition < 15; }
  const core = wear.torso || cleanPartState(); f.hp = Math.max(0, Math.round(f.s.hp * fightHealthShare(core))); f.broken.torso = core.condition > 0 && core.condition < 15;
  for (const slot of PART_STATE_SLOTS) { const fault = (wear[slot]?.faults || [])[0]; if (fault && CONDS[fault.type]) f.cond[slot] = { type: fault.type, sev: fault.severity, t: Infinity, persistent: true }; }
}
function installWearFaults(F, f) {
  const wear = f.spec.partWear || {};
  for (const slot of PART_STATE_SLOTS) {
    const state = wear[slot] || cleanPartState(), condition = state.condition;
    if (state.faults && state.faults[0] && CONDS[state.faults[0].type]) f.cond[slot] = { type: state.faults[0].type, sev: state.faults[0].severity, t: Infinity, persistent: true };
    if (f.cond[slot] || condition >= 75) continue;
    const broken = condition > 0 && condition < 15, critical = condition >= 15 && condition < 40;
    let fault = broken || F.rng() < (critical ? .08 : condition >= 40 ? .02 : 0);
    if (!fault && critical) fault = F.rng() < .30;
    if (!fault) continue;
    const choices = Object.keys(CONDS).filter(type => CONDS[type].parts.includes(slot));
    if (choices.length) f.cond[slot] = { type: choices[F.rng() * choices.length | 0], sev: 1, t: Infinity, persistent: true };
  }
}
function pushNews(t) { S.news.unshift(t); S.news = S.news.slice(0, 6); }
let viewLg = 0;
const repairBlocksFight = () => { const core = repairState('torso'), armsOut = ['lead', 'rear'].every(slot => { const p = repairState(slot); return p.detached || (p.condition > 0 && p.condition < 15); }); return hasLost() || core.condition < 15 || core.integrity <= 0 || armsOut; };
function canFight() {
  const bot = activeStableBot();
  if (bot?.wreckStatus === 'salvageable') return false;
  if (bot && bot.combatModel === 'workbook') return bot.role !== 'Hauler' && workbookCombatAdapter(bot).ready;
  const st = statsOf(S.build, S.trait, partWearForBuild(S.build)); return (bot || {}).role !== 'Hauler' && !st.over && !repairBlocksFight() && SLOTS.every(x => owns(S.build[x[0]])) && ownsMech(S.mech) && ownsChip(S.trait);
}

const RANGE = {}; let LEGAL = 0;
(function () {
  const keys = ['power', 'aspd', 'move', 'reach', 'armor', 'sense', 'hp', 'en', 'regen', 'cool', 'balance', 'durability'];
  keys.forEach(k => RANGE[k] = [Infinity, -Infinity]);
  const r = mulberry32(7), pick = a => a[r() * a.length | 0];
  for (let i = 0; i < 5000; i++) { const s = statsOf({ head: pick(PARTS.head).id, torso: pick(PARTS.torso).id, lead: pick(PARTS.arms).id, rear: pick(PARTS.arms).id, legs: pick(PARTS.legs).id, back: pick(PARTS.back).id }); keys.forEach(k => { RANGE[k][0] = Math.min(RANGE[k][0], s[k]); RANGE[k][1] = Math.max(RANGE[k][1], s[k]); }); }
  const bw = PARTS.back.map(q => q.w).sort((x, y) => x - y);
  const fH = PARTS.head.filter(q => q.b !== 'GB'), fT = PARTS.torso.filter(q => q.b !== 'GB');
  for (const h of fH) for (const t of fT) for (const a of PARTS.arms) for (const c of PARTS.arms) for (const l of PARTS.legs) { const rem = t.cap - (h.w + a.w / 2 + c.w / 2 + l.w) + 1e-9; for (const w of bw) { if (w <= rem) LEGAL++; else break; } }
})();
const STAT_ROWS = [['Power', 'power', v => v.toFixed(0)], ['Hand speed', 'aspd', v => v.toFixed(2) + '×'], ['Footwork', 'move', v => v.toFixed(2)], ['Reach', 'reach', v => v.toFixed(0)], ['Armor', 'armor', v => v.toFixed(0)], ['Sensors', 'sense', v => Math.round(v * 100) + '%'], ['Hull', 'hp', v => v.toFixed(0)], ['Battery', 'en', v => v.toFixed(0)], ['Regen', 'regen', v => v.toFixed(0) + '/s'], ['Cooling', 'cool', v => v.toFixed(2) + '×'], ['Balance', 'balance', v => v.toFixed(2)], ['Reliability', 'durability', v => Math.round(v * 100) + '%']];


