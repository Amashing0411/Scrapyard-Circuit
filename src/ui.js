/* ---- ui.js ---- */
/* ---------- app shell ---------- */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
const clean = (s, n) => String(s || '').replace(/[<>&"]/g, '').slice(0, n);
function sizeCanvas(cv, lw, lh) { const dpr = Math.min(2, window.devicePixelRatio || 1); const w = cv.clientWidth || lw, h = cv.clientHeight || w * lh / lw; cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr)); return { k: cv.width / lw, w: cv.width, h: cv.height }; }
const SLOTS = [['head', 'Head', 'head', 'Sensors and head armor'], ['torso', 'Torso', 'torso', 'Hull, battery, load limit, cooling'], ['lead', 'Lead arm', 'arms', 'Throws jabs and every other hook'], ['rear', 'Rear arm', 'arms', 'Throws crosses, uppercuts and haymakers'], ['legs', 'Legs', 'legs', 'Footwork and balance'], ['back', 'Back', 'back', 'Optional module mounted on the spine']];
migratePartWear();
migratePartItems();
migrateWorkbookPartItems();
migrateFrameItems();
migrateTruck();
migrateTruckModuleItems();
migrateTruckCrew();
grantRepairSupplies();
function refreshWorkbookCombatReadiness() {
  let changed = false;
  for (const bot of S.stable || []) if (bot && bot.combatModel === 'workbook') { const ready = workbookCombatAdapter(bot).ready; if (bot.combatReady !== ready) { bot.combatReady = ready; changed = true; } }
  if (changed) save();
}
refreshWorkbookCombatReadiness();
let stableBuildBotId = null;
function activeStableBot() { return (S.stable || []).find(bot => bot && bot.id === S.activeBotId) || null; }
function managedStableBot() { return (S.stable || []).find(bot => bot && bot.id === stableBuildBotId) || activeStableBot(); }
function truckDefinition() { return WORKBOOK_TRUCK_BY_ID[S.truck && S.truck.defId] || null; }
function truckBotCount() { return (S.stable || []).filter(bot => bot && bot.storageLocation === 'truck').length; }
function freeStableBay() { return Array.from({ length: S.stableBays }, (_, bay) => bay).find(bay => !(S.stable || []).some(bot => bot && bot.storageLocation !== 'truck' && bot.bayIndex === bay)); }
function truckCargoMass() { return (S.items || []).reduce((mass, item) => item && item.kind === 'workbook-part' && item.location === 'truck' ? mass + workbookPartMass(WORKBOOK_PART_BY_ID[item.defId]) : mass, 0); }
function truckModuleSlotsUsed(moduleIds = S.truck?.moduleIds || []) { return moduleIds.reduce((sum, id) => { const item = truckModuleItemById(id), def = item && WORKBOOK_TRUCK_MODULE_BY_ID[item.defId]; return sum + (def ? Math.max(0, +def.slots || 0) : 0); }, 0); }
function truckModuleCount(defId) { return (S.truck?.moduleIds || []).filter(id => truckModuleItemById(id)?.defId === defId).length; }
function truckCargoCapacity() { const def = truckDefinition(); return (def ? def.cargoKg : 0) + truckModuleCount('parts-racks') * 150; }
function truckCrewCapacity() { const def = truckDefinition(); return (def ? def.crewSeats : 0) + truckModuleCount('bunk'); }
function truckCrewCount(roleId) { return (S.truck?.crew || []).filter(member => member && member.roleId === roleId).length; }
function truckCrewWagesPerDay() { return (S.truck?.crew || []).reduce((sum, member) => sum + (+WORKBOOK_TRUCK_CREW_BY_ID[member?.roleId]?.wagePerDay || 0), 0); }
function truckCrewEffectStatus(roleId) {
  return ({
    mechanic: 'Active: +1 corner weld. Field repair bonus waits for repair systems.',
    trainer: 'Active: −1 extra Fatigue per day and +1 Gym session.',
    driver: 'Active: −25% travel time. Road-ambush avoidance awaits road-event resolution.',
    scout: 'Pending runs: node and cache discovery effects.',
    'hype-man': 'Active: +15% venue purse per hired Hype man. Sponsor-goal easing is not numerically defined.',
    fixer: 'Pending black-market/checkpoint systems.'
  })[roleId] || 'Effect not mapped.';
}
function truckArmorValue() { const def = truckDefinition(); return (def ? def.armor : 0) + truckModuleCount('armor-kit') * 2; }
function migrateTruck() {
  let changed = false;
  if (!S.truck || typeof S.truck !== 'object' || Array.isArray(S.truck)) {
    S.truck = { truckId: 'truck-starter', defId: 'rust-bucket-pickup', condition: 100, integrity: 100, moduleIds: [], crew: [], cargoItemIds: [], botIds: [], location: 'garbage-town', clockHour: 8, history: [] };
    changed = true;
  }
  const truck = S.truck, def = WORKBOOK_TRUCK_BY_ID[truck.defId] ? WORKBOOK_TRUCK_BY_ID[truck.defId] : WORKBOOK_TRUCK_BY_ID['rust-bucket-pickup'];
  if (truck.defId !== def.id) { truck.defId = def.id; changed = true; }
  if (!truck.truckId) { truck.truckId = 'truck-starter'; changed = true; }
  const condition = clamp(Number.isFinite(+truck.condition) ? +truck.condition : 100, 0, 100), integrity = clamp(Number.isFinite(+truck.integrity) ? +truck.integrity : 100, 0, 100);
  if (truck.condition !== condition || truck.integrity !== integrity) changed = true;
  truck.condition = condition; truck.integrity = integrity;
  const hypeArrivalPending = truck.hypeArrivalPending === true;
  if (truck.hypeArrivalPending !== hypeArrivalPending) { truck.hypeArrivalPending = hypeArrivalPending; changed = true; }
  if (!Array.isArray(truck.moduleIds)) { truck.moduleIds = []; changed = true; }
  if (!Array.isArray(truck.crew)) { truck.crew = []; changed = true; }
  if (!Array.isArray(truck.history)) { truck.history = []; changed = true; }
  const occupied = new Set((S.stable || []).filter(bot => bot && bot.storageLocation !== 'truck').map(bot => bot.bayIndex));
  let truckBotSlots = 0;
  for (const bot of S.stable || []) if (bot && bot.storageLocation === 'truck') {
    if (truckBotSlots >= def.botBays) {
      const bay = Array.from({ length: S.stableBays }, (_, index) => index).find(index => !occupied.has(index));
      if (bay != null) { bot.storageLocation = 'garage'; bot.bayIndex = bay; occupied.add(bay); changed = true; }
    } else { bot.bayIndex = -1; truckBotSlots++; }
    const frame = frameItemById(bot.frameItemId);
    if (frame && bot.storageLocation !== 'truck' && (frame.location !== 'bay' || frame.botId !== bot.id)) { frame.location = 'bay'; frame.botId = bot.id; changed = true; }
  }
  const botIds = (S.stable || []).filter(bot => bot && bot.storageLocation === 'truck').map(bot => bot.id);
  const cargoItemIds = (S.items || []).filter(item => item && item.kind === 'workbook-part' && item.location === 'truck').map(item => item.itemId);
  if (!Array.isArray(truck.botIds) || JSON.stringify(truck.botIds) !== JSON.stringify(botIds)) { truck.botIds = botIds; changed = true; }
  if (!Array.isArray(truck.cargoItemIds) || JSON.stringify(truck.cargoItemIds) !== JSON.stringify(cargoItemIds)) { truck.cargoItemIds = cargoItemIds; changed = true; }
  if (!WORKBOOK_WORLD_LOCATION_BY_ID[truck.location]) {
    const oldLocation = WORKBOOK_WORLD_LOCATIONS.find(location => location.name === truck.location);
    truck.location = oldLocation ? oldLocation.id : 'garbage-town'; changed = true;
  }
  const clockHour = Number.isFinite(+truck.clockHour) ? clamp(Math.floor(+truck.clockHour), 0, 23) : 8;
  if (truck.clockHour !== clockHour) { truck.clockHour = clockHour; changed = true; }
  if (S.truckSchema < 5) { S.truckSchema = 5; changed = true; }
  if (!S.truckSeeded) { S.truckSeeded = true; changed = true; }
  if (changed) save();
}
function migrateTruckModuleItems() {
  let changed = false; const truck = S.truck, truckDef = truckDefinition();
  if (!truck || !Array.isArray(truck.moduleIds)) return;
  const installed = [], seenItems = new Set(); let usedSlots = 0;
  for (const rawId of truck.moduleIds) {
    let item = truckModuleItemById(rawId), def = item && WORKBOOK_TRUCK_MODULE_BY_ID[item.defId];
    if (!item) { def = WORKBOOK_TRUCK_MODULE_BY_ID[rawId]; if (def) { item = (S.items || []).find(candidate => candidate && candidate.kind === 'truck-module' && candidate.defId === def.id && candidate.location === 'stash') || createTruckModuleItem(def.id, { location: 'truck', source: 'legacy-installed' }); changed = true; } }
    if (!item || !def || seenItems.has(item.itemId)) { changed = true; continue; }
    if (usedSlots + (+def.slots || 0) > (+truckDef?.moduleSlots || 0)) { item.location = 'stash'; item.truckId = null; changed = true; continue; }
    item.location = 'truck'; item.truckId = truck.truckId; installed.push(item.itemId); seenItems.add(item.itemId); usedSlots += +def.slots || 0;
  }
  for (const item of S.items || []) if (item && item.kind === 'truck-module') {
    if (!WORKBOOK_TRUCK_MODULE_BY_ID[item.defId]) { if (item.location === 'truck') { item.location = 'stash'; item.truckId = null; changed = true; } continue; }
    if (item.location !== 'stash' && item.location !== 'truck') { item.location = 'stash'; changed = true; }
    if (item.location === 'truck' && !seenItems.has(item.itemId)) { item.location = 'stash'; item.truckId = null; changed = true; }
    if (item.location === 'stash' && item.truckId) { item.truckId = null; changed = true; }
  }
  if (JSON.stringify(truck.moduleIds) !== JSON.stringify(installed)) { truck.moduleIds = installed; changed = true; }
  if (changed) save();
}
function migrateTruckCrew() {
  let changed = false; const truck = S.truck; if (!truck || !Array.isArray(truck.crew)) return;
  const used = new Set();
  truck.crew = truck.crew.map(raw => {
    const member = raw && typeof raw === 'object' ? raw : {}, roleId = WORKBOOK_TRUCK_CREW_BY_ID[member.roleId] ? member.roleId : WORKBOOK_TRUCK_CREW_BY_ID[String(raw)] ? String(raw) : null;
    if (!roleId) { changed = true; return null; }
    let crewId = String(member.crewId || `crew-${(S.nextItemId++).toString(36)}`); while (used.has(crewId)) crewId = `crew-${(S.nextItemId++).toString(36)}`; used.add(crewId);
    const hiredDay = Math.max(1, Math.floor(+member.hiredDay || +S.stableDay || 1)), history = Array.isArray(member.history) ? member.history : [{ action: 'hired', day: hiredDay }];
    if (member.crewId !== crewId || member.roleId !== roleId || member.hiredDay !== hiredDay || !Array.isArray(member.history)) changed = true;
    return { crewId, roleId, hiredDay, history };
  }).filter(Boolean);
  if (changed) save();
}
function moveStableBotToTruck(botId) {
  const bot = (S.stable || []).find(item => item && item.id === botId), truck = S.truck, def = truckDefinition();
  if (!bot || !truck || !def || bot.storageLocation === 'truck') return false;
  if (truckBotCount() >= def.botBays) { toast('The truck has no open bot bay.', 'bad'); return false; }
  bot.storageLocation = 'truck'; bot.bayIndex = -1;
  const frame = frameItemById(bot.frameItemId); if (frame) { frame.location = 'truck'; frame.botId = bot.id; frame.history.push({ action: 'loaded-to-truck', botId: bot.id, day: Math.max(1, Math.floor(+S.stableDay || 1)) }); }
  truck.botIds = (truck.botIds || []).filter(id => id !== bot.id).concat(bot.id);
  save(); renderStable(); toast(`${bot.name || 'Bot'} loaded into the ${def.name}.`, 'good'); return true;
}
function moveStableBotToGarage(botId) {
  const bot = (S.stable || []).find(item => item && item.id === botId);
  if (!bot || bot.storageLocation !== 'truck') return false;
  const bay = freeStableBay(); if (bay == null) { toast('There is no empty garage bay.', 'bad'); return false; }
  bot.storageLocation = 'garage'; bot.bayIndex = bay;
  const frame = frameItemById(bot.frameItemId); if (frame) { frame.location = 'bay'; frame.botId = bot.id; frame.history.push({ action: 'unloaded-to-garage', botId: bot.id, day: Math.max(1, Math.floor(+S.stableDay || 1)) }); }
  S.truck.botIds = (S.truck.botIds || []).filter(id => id !== bot.id);
  save(); renderStable(); toast(`${bot.name || 'Bot'} unloaded into Garage Bay ${bay + 1}.`, 'good'); return true;
}
function moveWorkbookPartToTruck(itemId) {
  const item = workbookPartItemById(itemId), def = item && WORKBOOK_PART_BY_ID[item.defId], capacity = truckCargoCapacity(), used = truckCargoMass();
  if (!item || !def || item.location !== 'stash') { toast('Only a unique part in stash can be loaded.', 'bad'); return false; }
  if (used + (+def.massKg || 0) > capacity + 1e-9) { toast(`That load would exceed the truck's ${capacity} kg cargo limit.`, 'bad'); return false; }
  item.location = 'truck'; item.botId = null; item.slot = null; logWorkbookPartHistory(item, 'loaded-to-truck');
  S.truck.cargoItemIds = [...new Set([...(S.truck.cargoItemIds || []), item.itemId])];
  save(); renderStable(); toast(`${def.name} loaded into truck cargo.`, 'good'); return true;
}
function moveWorkbookPartToStash(itemId) {
  const item = workbookPartItemById(itemId), def = item && WORKBOOK_PART_BY_ID[item.defId];
  if (!item || !def || item.location !== 'truck') return false;
  item.location = 'stash'; item.botId = null; item.slot = null; logWorkbookPartHistory(item, 'unloaded-to-stash');
  S.truck.cargoItemIds = (S.truck.cargoItemIds || []).filter(id => id !== item.itemId);
  save(); renderStable(); toast(`${def.name} unloaded to stash.`, 'good'); return true;
}
function buyTruckModule(defId) {
  const def = WORKBOOK_TRUCK_MODULE_BY_ID[defId]; if (!def) { toast('That truck module is unavailable.', 'bad'); return false; }
  if (!S.sandbox && S.scrap < (+def.price || 0)) { toast(`Not enough Scrap. ${def.name} costs ${def.price}.`, 'bad'); return false; }
  const item = createTruckModuleItem(defId, { location: 'stash', source: 'truck-module-catalog' }); if (!item) return false;
  if (!S.sandbox) S.scrap -= +def.price || 0;
  addWorkbookLedgerEntry({ action: 'truck-module-purchase', itemId: item.itemId, defId, scrap: +def.price || 0 });
  save(); refreshWallet(); renderStable(); toast(`${def.name} added to the truck inventory.`, 'good'); return true;
}
function hireTruckCrew(roleId) {
  const def = WORKBOOK_TRUCK_CREW_BY_ID[roleId]; if (!def || !S.truck || !Array.isArray(S.truck.crew)) return false;
  if (S.truck.crew.length >= truckCrewCapacity()) { toast('The truck has no open crew seat. Install a Bunk or upgrade the vehicle first.', 'bad'); return false; }
  const member = createTruckCrewMember(roleId); if (!member) return false;
  addWorkbookLedgerEntry({ action: 'truck-crew-hire', crewId: member.crewId, roleId, wagePerDay: def.wagePerDay, scrap: 0 });
  save(); renderStable(); toast(`${def.role} hired for ${def.wagePerDay} Scrap per day.`, 'good'); return true;
}
function dismissTruckCrew(crewId) {
  const crew = S.truck?.crew || [], index = crew.findIndex(member => member && member.crewId === crewId), member = index >= 0 ? crew[index] : null, def = member && WORKBOOK_TRUCK_CREW_BY_ID[member.roleId];
  if (!member || !def) return false;
  crew.splice(index, 1);
  addWorkbookLedgerEntry({ action: 'truck-crew-dismiss', crewId, roleId: def.id, wagePerDay: def.wagePerDay, scrap: 0 });
  save(); renderStable(); toast(`${def.role} dismissed.`, 'good'); return true;
}
function installTruckModule(itemId) {
  const item = truckModuleItemById(itemId), def = item && WORKBOOK_TRUCK_MODULE_BY_ID[item.defId], truck = S.truck, truckDef = truckDefinition();
  if (!item || !def || !truck || !truckDef || item.location !== 'stash') { toast('That module is not available in truck inventory.', 'bad'); return false; }
  if (truckModuleSlotsUsed() + (+def.slots || 0) > truckDef.moduleSlots) { toast(`The truck needs ${def.slots} open module slot${+def.slots === 1 ? '' : 's'}.`, 'bad'); return false; }
  item.location = 'truck'; item.truckId = truck.truckId; item.history = Array.isArray(item.history) ? item.history : []; item.history.push({ action: 'installed', truckId: truck.truckId, day: Math.max(1, Math.floor(+S.stableDay || 1)) });
  truck.moduleIds = [...(truck.moduleIds || []), item.itemId];
  addWorkbookLedgerEntry({ action: 'truck-module-install', itemId, defId: def.id, scrap: 0 });
  save(); renderStable(); toast(`${def.name} installed.`, 'good'); return true;
}
function uninstallTruckModule(itemId) {
  const item = truckModuleItemById(itemId), def = item && WORKBOOK_TRUCK_MODULE_BY_ID[item.defId], truck = S.truck;
  if (!item || !def || item.location !== 'truck' || !truck) return false;
  if (def.id === 'parts-racks' && truckCargoMass() > truckCargoCapacity() - 150 + 1e-9) { toast('Unload enough cargo before removing the Parts racks.', 'bad'); return false; }
  if (def.id === 'bunk' && (truck.crew || []).length > (truckDefinition()?.crewSeats || 0) + Math.max(0, truckModuleCount('bunk') - 1)) { toast('Move a crew member before removing the Bunk.', 'bad'); return false; }
  item.location = 'stash'; item.truckId = null; item.history = Array.isArray(item.history) ? item.history : []; item.history.push({ action: 'uninstalled', truckId: truck.truckId, day: Math.max(1, Math.floor(+S.stableDay || 1)) });
  truck.moduleIds = (truck.moduleIds || []).filter(id => id !== item.itemId);
  addWorkbookLedgerEntry({ action: 'truck-module-uninstall', itemId, defId: def.id, scrap: 0 });
  save(); renderStable(); toast(`${def.name} moved to truck inventory.`); return true;
}
function roadRouteBetween(from, to) { return WORKBOOK_ROAD_LINKS.find(route => (route.from === from && route.to === to) || (route.from === to && route.to === from)) || null; }
function roadTravelHours(route, truckDef = truckDefinition()) {
  if (!route) return 0;
  let hours = Math.max(1, Number(route.hours) || 1);
  if (truckDef?.id === 'kestrel-courier-van') hours *= .5;
  hours *= Math.pow(.75, truckCrewCount('driver'));
  return Math.max(1, Math.ceil(hours));
}
function roadTravelDayCount(hours) {
  const current = Number.isFinite(+S.truck?.clockHour) ? clamp(Math.floor(+S.truck.clockHour), 0, 23) : 8;
  return Math.floor((current + Math.max(0, +hours || 0)) / 24);
}
function renderStableRoadMap() {
  const truck = S.truck, current = WORKBOOK_WORLD_LOCATION_BY_ID[truck?.location] || WORKBOOK_WORLD_LOCATION_BY_ID['garbage-town'], activeRun = S.workbookRun?.status === 'active';
  const truckDef = truckDefinition(), routes = WORKBOOK_ROAD_LINKS.filter(route => route.from === current.id || route.to === current.id).map(route => {
    const destinationId = route.from === current.id ? route.to : route.from, destination = WORKBOOK_WORLD_LOCATION_BY_ID[destinationId];
    const hours = roadTravelHours(route, truckDef), days = roadTravelDayCount(hours), daily = (+truckDef?.upkeepPerDay || 0) + truckCrewWagesPerDay(), cost = S.sandbox ? 0 : days * daily;
    const disabled = !destination || activeRun || +truck?.condition <= 0 || +truck?.integrity <= 0 || (!S.sandbox && +S.scrap < cost);
    const reason = activeRun ? 'Extract or finish the active run before travelling.' : +truck?.condition <= 0 || +truck?.integrity <= 0 ? 'Truck needs recovery before it can travel.' : !S.sandbox && +S.scrap < cost ? `Need ${cost} Scrap for travel-day upkeep and wages.` : '';
    return `<div class="road-route"><div><b>${esc(destination?.name || 'Unknown stop')}</b><span>${esc(destination?.type || '')} · ${esc(destination?.tier || '')} · ${esc(destination?.danger || '')}</span><small>${esc(destination?.controlledBy || '')} · Hazard: ${esc(destination?.hazard || 'Unknown')}</small></div><div class="road-route-action"><span>~${hours}h</span><button class="small-btn" data-road-travel="${esc(destinationId)}" aria-label="Travel to ${esc(destination?.name || 'unknown stop')} in about ${hours} hours" ${disabled ? `disabled title="${esc(reason)}"` : ''}>Travel</button></div></div>`;
  }).join('') || '<p class="note">No road links leave this location in the draft map.</p>';
  const hour = Number.isFinite(+truck?.clockHour) ? clamp(Math.floor(+truck.clockHour), 0, 23) : 8;
  const stops = WORKBOOK_WORLD_LOCATIONS.map(location => { const neighbors = WORKBOOK_ROAD_LINKS.filter(route => route.from === location.id || route.to === location.id).map(route => WORKBOOK_WORLD_LOCATION_BY_ID[route.from === location.id ? route.to : route.from]?.name).filter(Boolean).join(', '); return `<div class="road-stop"><b>${esc(location.name)}</b><span>${esc(location.type)} · ${esc(location.tier)} · ${esc(location.danger)}</span><small>${esc(location.controlledBy)} · ${esc(location.purpose)}</small><small>Signature hazard: ${esc(location.hazard)}</small><small>Road links: ${esc(neighbors || 'None in draft')}</small></div>`; }).join('');
  const mapLinks = WORKBOOK_ROAD_LINKS.map(route => { const from = WORKBOOK_WORLD_MAP_LAYOUT[route.from], to = WORKBOOK_WORLD_MAP_LAYOUT[route.to]; if (!from || !to) return ''; const near = route.from === current.id || route.to === current.id; return `<line class="${near ? 'road-map-link-near' : 'road-map-link'}" x1="${from[0]}" y1="${from[1]}" x2="${to[0]}" y2="${to[1]}"/>`; }).join('');
  const mapStops = WORKBOOK_WORLD_LOCATIONS.map(location => { const point = WORKBOOK_WORLD_MAP_LAYOUT[location.id]; if (!point) return ''; const here = location.id === current.id, stateClass = here ? ' current' : ''; return `<g><title>${esc(location.name)} · ${esc(location.tier)} · ${esc(location.type)}${here ? ' · Truck location' : ''}</title><circle class="road-map-node${stateClass}" cx="${point[0]}" cy="${point[1]}" r="${here ? 10 : 6}"/><text class="road-map-label${stateClass}" x="${point[0] + 14}" y="${point[1] - 3}">${esc(location.name)}</text><text class="road-map-tier${stateClass}" x="${point[0] + 14}" y="${point[1] + 11}">${esc(location.tier)} · ${esc(location.type)}</text></g>`; }).join('');
  const atlas = `<div class="road-atlas" role="img" aria-label="Draft road network with the truck at ${esc(current.name)}"><svg viewBox="0 0 1120 480" aria-hidden="true">${mapLinks}${mapStops}</svg></div><p class="road-map-caption">Highlighted roads leave from where your truck is parked.</p>`;
  return `<section class="road-map"><div class="road-map-heading"><div><h5>Road map</h5><p>At ${esc(current.name)} · ${esc(current.type)} · controlled by ${esc(current.controlledBy)}</p></div><span class="road-clock">DAY ${Math.max(1, Math.floor(+S.stableDay || 1))} · ${String(hour).padStart(2, '0')}:00</span></div>${atlas}<div class="road-routes">${routes}</div><details class="road-register"><summary>All locations · ${WORKBOOK_WORLD_LOCATIONS.length}</summary><div>${stops}</div></details></section>`;
}
function travelTruckTo(destinationId) {
  const truck = S.truck, destination = WORKBOOK_WORLD_LOCATION_BY_ID[destinationId], current = WORKBOOK_WORLD_LOCATION_BY_ID[truck?.location], route = current && roadRouteBetween(current.id, destinationId), truckDef = truckDefinition();
  if (S.workbookRun?.status === 'active') { toast('Extract or finish the active run before travelling.', 'bad'); return false; }
  if (!truck || !destination || !current || !route || !truckDef) { toast('That stop is not linked to the truck’s current location.', 'bad'); return false; }
  if (+truck.condition <= 0 || +truck.integrity <= 0) { toast('The truck needs recovery before it can travel.', 'bad'); return false; }
  const hours = roadTravelHours(route, truckDef), days = roadTravelDayCount(hours), upkeep = Math.max(0, Math.floor(+truckDef.upkeepPerDay || 0)), wages = truckCrewWagesPerDay(), dayCost = upkeep + wages, totalCost = S.sandbox ? 0 : days * dayCost;
  if (totalCost > 0 && +S.scrap < totalCost) { toast(`Need ${totalCost} Scrap for ${days} travel-day upkeep and wages.`, 'bad'); return false; }
  const fromId = current.id, startDay = Math.max(1, Math.floor(+S.stableDay || 1)), startHour = Number.isFinite(+truck.clockHour) ? clamp(Math.floor(+truck.clockHour), 0, 23) : 8;
  if (totalCost > 0) { S.scrap -= totalCost; addWorkbookLedgerEntry({ action:'truck-travel-day-cost', travelDays:days, truckUpkeep:upkeep * days, crewWages:wages * days, scrap:-totalCost }); }
  if (days && truckModuleCount('charging-dock')) for (const bot of S.stable || []) if (bot && bot.storageLocation === 'truck') bot.fatigue = Math.max(0, Math.floor(+bot.fatigue || 0) - days);
  truck.clockHour = (startHour + hours) % 24; S.stableDay = startDay + days; truck.location = destinationId;
  truck.hypeArrivalPending = truckDef.id === 'converted-school-bus';
  truck.history.push({ action:'travel', from:fromId, to:destinationId, hours, daysAdvanced:days, day:startDay, arrivalDay:S.stableDay, arrivalHour:truck.clockHour, hypeArrivalPending:truck.hypeArrivalPending });
  truck.history = truck.history.slice(-60);
  addWorkbookLedgerEntry({ action:'truck-travel', from:current.name, to:destination.name, hours, daysAdvanced:days });
  save(); refreshWallet(); renderStable(); renderReadout(); toast(truck.hypeArrivalPending ? `Reached ${destination.name} in about ${hours} hours. Bus arrival bonus: +10 Hype at your next career fight.` : `Reached ${destination.name} in about ${hours} hours.`, 'good'); return true;
}
function renderStableTruck() {
  const truck = S.truck, def = truckDefinition(); if (!truck || !def) return '';
  const bots = (S.stable || []).filter(bot => bot && bot.storageLocation === 'truck'), cargo = (S.items || []).filter(item => item && item.kind === 'workbook-part' && item.location === 'truck'), stash = (S.items || []).filter(item => item && item.kind === 'workbook-part' && item.location === 'stash');
  const used = truckCargoMass(), capacity = truckCargoCapacity(), freeBay = freeStableBay(), moduleSlots = truckModuleSlotsUsed(), moduleInventory = (S.items || []).filter(item => item && item.kind === 'truck-module' && item.location === 'stash'), installedModules = (truck.moduleIds || []).map(truckModuleItemById).filter(Boolean);
  const botRows = bots.map(bot => `<div class="stable-row"><div><span class="stable-label">Truck bot bay</span><h4>${esc(bot.name || 'Unnamed Bot')}</h4><p>${esc(STABLE_ROLES.find(role => role === bot.role) || 'Fighter')} · record ${+bot.rec?.w || 0}–${+bot.rec?.l || 0}</p></div><div class="stable-side"><button class="small-btn" data-stable-to-garage="${esc(bot.id)}" ${freeBay == null ? 'disabled' : ''}>Unload to garage</button></div></div>`).join('') || '<p class="note">No bot is loaded. Move a bot from a garage bay to use the truck bay.</p>';
  const cargoRows = cargo.map(item => { const part = WORKBOOK_PART_BY_ID[item.defId]; return part ? `<div class="stable-row"><div><span class="stable-label">${part.massKg} kg · ${Math.round(item.state?.condition || 0)}% Condition · ${Math.round(item.state?.integrity || 0)}% Integrity</span><h4>${esc(part.name)}</h4><p>${esc(part.slot)} · ${esc(part.maker)}</p></div><div class="stable-side"><button class="small-btn" data-workbook-truck-unload="${esc(item.itemId)}">Unload to stash</button></div></div>` : ''; }).join('') || '<p class="note">Nothing in cargo.</p>';
  const loadRows = stash.map(item => { const part = WORKBOOK_PART_BY_ID[item.defId]; if (!part) return ''; const fits = used + (+part.massKg || 0) <= capacity + 1e-9; return `<div class="stable-row"><div><span class="stable-label">${part.massKg} kg · ${Math.round(item.state?.condition || 0)}% Condition · ${Math.round(item.state?.integrity || 0)}% Integrity</span><h4>${esc(part.name)}</h4><p>${esc(part.slot)} · ${esc(part.maker)}</p></div><div class="stable-side"><button class="small-btn" data-workbook-truck-load="${esc(item.itemId)}" ${fits ? '' : 'disabled'}>Load into truck</button></div></div>`; }).join('') || '<p class="note">No spare parts to load.</p>';
  const installedRows = installedModules.map(item => { const module = WORKBOOK_TRUCK_MODULE_BY_ID[item.defId]; if (!module) return ''; return `<div class="stable-row"><div><span class="stable-label">Installed · ${module.slots} module slot</span><h4>${esc(module.name)}</h4><p>${esc(module.effect)}</p></div><div class="stable-side"><button class="small-btn" data-truck-module-remove="${esc(item.itemId)}">Uninstall</button></div></div>`; }).join('') || '<p class="note">No modules installed.</p>';
  const inventoryRows = moduleInventory.map(item => { const module = WORKBOOK_TRUCK_MODULE_BY_ID[item.defId]; if (!module) return ''; const fits = moduleSlots + (+module.slots || 0) <= def.moduleSlots; return `<div class="stable-row"><div><span class="stable-label">Truck inventory · ${module.slots} module slot</span><h4>${esc(module.name)}</h4><p>${esc(module.effect)}</p></div><div class="stable-side"><button class="small-btn" data-truck-module-install="${esc(item.itemId)}" ${fits ? '' : 'disabled'}>Install</button></div></div>`; }).join('') || '<p class="note">No purchased modules in inventory.</p>';
  const moduleRows = WORKBOOK_TRUCK_MODULE_DEFS.map(module => { const ownedCount = (S.items || []).filter(item => item && item.kind === 'truck-module' && item.defId === module.id).length; return `<div class="mrow"><div><b>${esc(module.name)}</b><small>${esc(module.effect)} · ${module.slots} slot · ${module.price} scrap${ownedCount ? ` · owned ${ownedCount}` : ''}</small></div><button class="small-btn gym" data-truck-module-buy="${esc(module.id)}" ${!S.sandbox && S.scrap < module.price ? 'disabled' : ''}>Buy · ${module.price}</button></div>`; }).join('');
  const crewMembers = truck.crew || [], crewWages = truckCrewWagesPerDay();
  const hiredCrewRows = crewMembers.map(member => { const role = WORKBOOK_TRUCK_CREW_BY_ID[member.roleId]; return role ? `<div class="stable-row"><div><span class="stable-label">Hired · Day ${member.hiredDay}</span><h4>${esc(role.role)}</h4><p>${esc(role.effect)} · ${role.wagePerDay} Scrap/day</p><small>${esc(truckCrewEffectStatus(role.id))}</small></div><div class="stable-side"><button class="small-btn" data-truck-crew-fire="${esc(member.crewId)}">Dismiss</button></div></div>` : ''; }).join('') || '<p class="note">No crew hired.</p>';
  const crewRows = WORKBOOK_TRUCK_CREW_DEFS.map(crew => { const count = truckCrewCount(crew.id), full = crewMembers.length >= truckCrewCapacity(); return `<div class="mrow"><div><b>${esc(crew.role)}${count ? ` · hired ${count}` : ''}</b><small>${esc(crew.effect)} · ${crew.wagePerDay} Scrap/day</small><small>${esc(truckCrewEffectStatus(crew.id))}</small></div><button class="small-btn gym" data-truck-crew-hire="${esc(crew.id)}" ${full ? 'disabled' : ''}>Hire</button></div>`; }).join(''), vehicleRows = WORKBOOK_TRUCK_DEFS.map(vehicle => `<div class="mrow"><div><b>${esc(vehicle.name)}</b><small>${esc(vehicle.maker)} · ${vehicle.botBays} bot bay · ${vehicle.crewSeats} crew seats · ${vehicle.cargoKg} kg · ${vehicle.moduleSlots} modules · ${esc(vehicle.speed)} · Armor ${vehicle.armor} · ${vehicle.price} scrap · ${vehicle.upkeepPerDay}/day</small><small>${esc(vehicle.notes)}${vehicle.breakdownChance == null ? '' : ` · ${Math.round(vehicle.breakdownChance * 100)}% breakdown per trip`}</small></div></div>`).join('');
  return `<div class="sect wbplan-sect"><h4>Truck · ${esc(def.name)}</h4><p class="note">${esc(def.notes)} Current condition ${Math.round(truck.condition)}% · Integrity ${Math.round(truck.integrity)}%.</p><div class="wbplan-kpis"><div><small>Bot bay</small><b>${bots.length} / ${def.botBays}</b><span>${def.botBays ? `${Math.max(0, def.botBays - bots.length)} open` : 'No bot bay'}</span></div><div><small>Cargo</small><b>${used.toFixed(1)} / ${capacity} kg</b><span>${Math.max(0, capacity - used).toFixed(1)} kg available</span></div><div><small>Truck</small><b>${esc(def.speed)} · ${truckArmorValue()} Armor</b><span>${moduleSlots} / ${def.moduleSlots} module slots · ${def.workshopModules} workshop capacity</span></div><div><small>Crew</small><b>${crewMembers.length} / ${truckCrewCapacity()}</b><span>${def.upkeepPerDay} upkeep + ${crewWages} wages Scrap/day</span></div></div>${renderStableRoadMap()}<h5>Bots on board</h5>${botRows}<details class="sect"><summary>Cargo · ${cargo.length} item${cargo.length === 1 ? '' : 's'}</summary>${cargoRows}<h5>Load from stash</h5>${loadRows}</details><details class="sect"><summary>Installed modules · ${installedModules.length}</summary>${installedRows}<h5>Not installed</h5>${inventoryRows}</details><details class="sect"><summary>Hired crew · ${crewMembers.length}</summary>${hiredCrewRows}</details><details class="sect"><summary>Hire crew · ${WORKBOOK_TRUCK_CREW_DEFS.length} roles</summary>${crewRows}</details><details class="sect"><summary>Buy modules · ${WORKBOOK_TRUCK_MODULE_DEFS.length}</summary>${moduleRows}</details><details class="sect"><summary>Vehicle catalog · ${WORKBOOK_TRUCK_DEFS.length} definitions</summary><p class="note">Reference only; the starter Rust Bucket is the owned vehicle.</p>${vehicleRows}</details></div>`;
}
function fatiguePenaltyPct(fatigue) { return Math.min(1, Math.max(0, Math.floor(+fatigue || 0) - 4) * .05); }
function applyFatiguePenalty(stats, fatigue, workbook = false) {
  const factor = Math.max(0, 1 - fatiguePenaltyPct(fatigue));
  for (const key of ['hp','armor','sense','power','aspd','reach','move','balance','en','regen','cool','dodge','crit','durability']) if (Number.isFinite(stats[key])) stats[key] *= factor;
  const armFactor = workbook ? Math.max(.5, factor) : factor;
  for (const key of ['armP','armS','armR','phMax','rel','critArm']) if (stats[key] && typeof stats[key] === 'object') for (const partKey of Object.keys(stats[key])) if (Number.isFinite(stats[key][partKey])) stats[key][partKey] *= key === 'armP' ? armFactor : factor;
  if (workbook && stats.armP) stats.power = (stats.armP.lead + stats.armP.rear) / 2;
  return stats;
}
function playerStats() {
  const bot = activeStableBot();
  if (bot && bot.combatModel === 'workbook') { const adapter = workbookCombatAdapter(bot); return applyFatiguePenalty({ ...adapter.stats, armP: { ...adapter.stats.armP }, armS: { ...adapter.stats.armS }, armR: { ...adapter.stats.armR }, phMax: { ...adapter.stats.phMax }, rel: { ...adapter.stats.rel }, critArm: { ...adapter.stats.critArm } }, bot.fatigue, true); }
  return applyFatiguePenalty(statsOf(S.build, S.trait, partWearForBuild(S.build)), bot ? bot.fatigue : 0);
}
function playerSpec() {
  const bot = activeStableBot(), workbookCombat = bot && bot.combatModel === 'workbook' ? { ...workbookCombatAdapter(bot), botId: bot.id } : null, sig = S.sigs.includes(S.sig) ? SIG_MOVES[S.sig] : null;
  return { id: 'you', build: workbookCombat ? { ...DEFAULT.build } : { ...S.build }, style: S.style, mech: S.mech, trait: S.trait, paint: S.paint, accent: S.accent, decal: S.decal, num: S.num, tally: S.rec.des, wear: S.wear, wseed: 4242, crewBonuses: { cornerWelds: truckCrewCount('mechanic') },
    name: clean(workbookCombat ? bot.name : S.name, 14).trim() || 'Ironside', nick: clean(S.nick, 22).trim(), home: clean(S.home, 24).trim() || 'Eastside', story: clean(S.story, 140).trim(), signature: sig ? { ...sig } : null, plan: S.plan, tune: workbookCombat ? {} : { ...(S.tune || {}) }, training: { ...S.training }, fatigue: (bot || {}).fatigue || 0, partWear: workbookCombat ? workbookCombat.partWear : partWearForBuild(S.build), workbookCombat, legendCrowdBonus: !!(bot && (bot.legend || bot.legendCrowdBonus)), rec: `${S.rec.w}–${S.rec.l}` };
}
function addFightHype(side, amount) {
  if (!G) return;
  const fighter = G.F?.f?.[side], legendBonus = fighter?.spec?.legendCrowdBonus ? .1 : 0, truckVenueBonus = side === 0 && truckModuleCount('sound-system-light-bar') > 0 ? .1 : 0, multiplier = 1 + legendBonus + truckVenueBonus;
  G.hype = Math.min(1, G.hype + Math.max(0, +amount || 0) * multiplier);
}
let curScreen = 'title', toastT = 0, screenFadeEl = null, screenFadeAnimation = null, screenFadeToken = 0, screenFadePending = false;
const SCREENS = ['title', 'menu', 'career', 'salvage', 'versus', 'garage', 'workshop', 'index', 'exhibition', 'settings', 'help', 'arena'];
function applyScreenNow(name) {
  if (name !== 'arena' && G) { G = null; shutUp(); }
  for (const s of SCREENS) { const el = document.getElementById('scr' + s[0].toUpperCase() + s.slice(1)); if (el) el.hidden = s !== name; }
  curScreen = name; stopPreviews(); pendingBuy = null;
  $$('.kScrap').forEach(e => e.textContent = S.sandbox ? '∞' : S.scrap);
  if (name !== 'arena' && AC) { setTheme('menu'); crowdLevel(0, false); }
  if (name === 'menu') { renderMenu(); if (AC) { crowdLevel(0, false); updateCrowdAudio(); } }
  if (name === 'title') startTitleFx();
  if (name === 'career') renderCareer();
  if (name === 'salvage') renderSalvage();
  if (name === 'versus') renderVersus();
  if (name === 'garage') renderGarage();
  if (name === 'workshop') { renderWorkshop(); startWs(); }
  if (name === 'index') renderIndex();
  if (name === 'exhibition') renderExh();
  if (name === 'settings') renderSettings();
  const root = document.getElementById('scr' + name[0].toUpperCase() + name.slice(1)); if (root) { const sc = root.querySelector('.scroll'); if (sc) sc.scrollTop = 0; }
}
function screenMusicSceneFor(name) { return name === 'title' ? 'loading' : name === 'menu' ? 'menu' : name === 'arena' ? 'none' : 'interior'; }
function showScreen(name) {
  if (!SCREENS.includes(name)) return;
  if (name !== 'arena' && G) { G = null; shutUp(); }
  if (name === 'arena') setScreenMusic('none', false, 160);
  if (name === curScreen && !screenFadePending) { setScreenMusic(screenMusicSceneFor(name)); return; }
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) { ++screenFadeToken; if (screenFadeAnimation) screenFadeAnimation.cancel(); screenFadeAnimation = null; screenFadePending = false; applyScreenNow(name); setScreenMusic(screenMusicSceneFor(name), true); if (screenFadeEl) { screenFadeEl.style.opacity = '0'; screenFadeEl.style.pointerEvents = 'none'; } return; }
  if (!screenFadeEl) {
    screenFadeEl = document.createElement('div'); screenFadeEl.className = 'screen-transition'; screenFadeEl.setAttribute('aria-hidden', 'true'); document.querySelector('.app').appendChild(screenFadeEl);
  }
  const token = ++screenFadeToken;
  // Keep the cut cinematic while giving each navigation a slightly different
  // rhythm, as a broadcast package would between cards and walkouts.
  const fadeOutMs = 118 + Math.random() * 68, fadeInMs = 132 + Math.random() * 82;
  if (screenFadeAnimation) screenFadeAnimation.cancel();
  screenFadeEl.style.pointerEvents = 'auto'; screenFadePending = true;
  const from = Number.parseFloat(getComputedStyle(screenFadeEl).opacity) || 0;
  const fadeOut = screenFadeEl.animate([{ opacity: from }, { opacity: 1 }], { duration: fadeOutMs, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
  screenFadeAnimation = fadeOut;
  fadeOut.finished.then(() => {
    if (token !== screenFadeToken) return;
    applyScreenNow(name);
    if (name === 'arena') requestAnimationFrame(sizeArena);
    setScreenMusic(screenMusicSceneFor(name), true);
    const fadeIn = screenFadeEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: fadeInMs, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'forwards' });
    screenFadeAnimation = fadeIn;
    return fadeIn.finished.then(() => {
      if (token !== screenFadeToken) return;
      screenFadeEl.style.opacity = '0'; screenFadeEl.style.pointerEvents = 'none';
      fadeIn.cancel(); screenFadeAnimation = null; screenFadePending = false;
    });
  }).catch(() => {});
}
function toast(msg, kind) { const t = $('#toast'); t.textContent = msg; t.className = 'toast show ' + (kind || ''); clearTimeout(toastT); toastT = setTimeout(() => t.className = 'toast', 2600); }
function stopPreviews() { cancelAnimationFrame(titleRaf); titleRaf = 0; cancelAnimationFrame(vsRaf); vsRaf = 0; cancelAnimationFrame(bayRaf); cancelAnimationFrame(wsRaf); cancelAnimationFrame(menuRaf); cancelAnimationFrame(hubRaf); bayRaf = wsRaf = menuRaf = hubRaf = 0; }
function refreshWallet() { $$('.kScrap').forEach(e => e.textContent = S.sandbox ? '∞' : S.scrap); }
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (b && !b.disabled && AC) uiClick();
  const go = e.target.closest('[data-go]'); if (go) { const to = go.dataset.go; if (to === 'fight') startCareerFight(); else showScreen(to); }
});
/* ---------- part previews, portraits ---------- */
function drawPartPreview(c, slot, id) {
  const W2 = 180, H2 = 110, b = { ...S.build, [slot]: id }, an = anchors(b);
  const foc = { head: [an.headY - 4, 1.05], torso: [an.bodyY, .62], lead: [an.shY + 18, .62], rear: [an.shY + 18, .62], legs: [an.legsY, .52], back: [an.bodyY - 10, .6] }[slot];
  const g = c.createLinearGradient(0, 0, 0, H2); g.addColorStop(0, '#22262c'); g.addColorStop(1, '#15171a'); c.fillStyle = g; c.fillRect(0, 0, W2, H2);
  drawRobot(c, { st: 'idle', build: b, paint: S.paint, accent: S.accent, decal: S.decal, num: S.num, tally: S.rec.des, wear: S.wear, wseed: 4242, x: W2 * .5 + (slot === 'back' ? 30 : slot === 'lead' || slot === 'rear' ? -12 : 0), ground: H2 / 2 - foc[0] * foc[1], dir: 1, scale: foc[1], pose: poseFrom('idle', 0, null, 0, 0, 0), t: 0 });
}
function drawPortrait(c, o, W2, H2, dim, dir = -1) {
  const g = c.createRadialGradient(W2 / 2, H2 * .8, 10, W2 / 2, H2 * .7, W2 * .6); g.addColorStop(0, '#2a2e33'); g.addColorStop(1, '#16181b'); c.fillStyle = g; c.fillRect(0, 0, W2, H2);
  c.fillStyle = 'rgba(255,255,255,.035)'; c.fillRect(0, H2 * .94, W2, H2 * .06);
  if (dim) c.globalAlpha = .16;
  drawRobot(c, { build: o.build, paint: o.paint, accent: o.accent, decal: o.decal, num: o.num, tally: o.tally, wear: o.wear, wseed: o.wseed, workbookCombat: o.workbookCombat, x: W2 * (dir < 0 ? .54 : .46), ground: H2 * .95, dir, scale: H2 / 265, pose: poseFrom('idle', 0, null, 0, 0, 1), t: 0 });
  c.globalAlpha = 1;
}
function paintPortraits(root) { (root || document).querySelectorAll('canvas[data-por]').forEach(cv => { const id = cv.dataset.por, o = id === 'you' ? playerSpec() : BOT(id); drawPortrait(cv.getContext('2d'), o, cv.width, cv.height, cv.dataset.dim === '1', cv.dataset.dir ? +cv.dataset.dir : -1); }); }
/* ---------- live previews (bay / hub / menu) ---------- */
const PREVIEW = { brawler: ['cross', 'hook', 'upper'], outboxer: ['jab', 'jab', 'cross'], runner: ['jab', 'block', 'jab', 'cross'], defensive: ['block', 'block', 'counter', 'hook'], counter: ['block', 'counter', 'hook'], swarmer: ['hook', 'hook', 'upper', 'hook'] };
function previewState(t, style, build) {
  const seq = PREVIEW[style] || PREVIEW.outboxer, b = normBuild({ ...build }), spd = (part('arms', b.lead).speed + part('arms', b.rear).speed) / 2;
  const total = seq.reduce((s, k) => s + (k === 'block' ? .6 : PUNCH[k].wu / spd + .09 + .16 / spd), 0) + 1.3;
  let time = t % total, last = 'rear';
  for (const k of seq) {
    if (k === 'block') { if (time < .6) return { st: 'block', p: time / .6 }; time -= .6; continue; }
    let arm = PUNCH[k].arm; if (arm === 'alt') arm = last === 'lead' ? 'rear' : 'lead'; last = arm;
    const wu = PUNCH[k].wu / spd, rc = .16 / spd, punch = { kind: k, arm, target: 'head' };
    if (time < wu) return { st: 'windup', p: time / wu, punch }; time -= wu;
    if (time < .09) return { st: 'strike', p: 0, punch }; time -= .09;
    if (time < rc) return { st: 'recover', p: time / rc, punch }; time -= rc;
  }
  return { st: 'idle', p: 0 };
}
function menuSparState(t, side) {
  const roundCycle = Math.floor(t / 4.1), cycle = t % 4.1, exchange = cycle < 2 ? 0 : cycle < 4 ? 1 : -1;
  if (exchange < 0) return { st: 'idle', p: 0, punch: null, lunge: 0 };
  const phase = cycle - exchange * 2, attacking = side === exchange;
  if (!attacking) {
    if (phase >= .12 && phase < .48) return { st: 'block', p: (phase - .12) / .36, punch: null, lunge: 0 };
    if (phase >= .91 && phase < 1.27) return { st: 'stagger', p: (phase - .91) / .36, punch: null, lunge: 0 };
    return { st: 'idle', p: 0, punch: null, lunge: 0 };
  }
  const combo = [
    { kind: 'jab', arm: 'lead', wind: 0, strike: .22, recover: .31, end: .58 },
    { kind: 'cross', arm: 'rear', wind: .65, strike: .88, recover: .98, end: 1.29 },
  ];
  for (const hit of combo) {
    const punch = { kind: hit.kind, arm: hit.arm, target: 'head' };
    if (phase >= hit.wind && phase < hit.strike) return { st: 'windup', p: (phase - hit.wind) / (hit.strike - hit.wind), punch, lunge: 0 };
    if (phase >= hit.strike && phase < hit.recover) return { st: 'strike', p: 0, punch, lunge: 12, hitId: `${roundCycle}:${exchange}:${hit.kind}` };
    if (phase >= hit.recover && phase < hit.end) return { st: 'recover', p: (phase - hit.recover) / (hit.end - hit.recover), punch, lunge: 5 };
  }
  return { st: 'idle', p: 0, punch: null, lunge: 0 };
}
let bayRaf = 0, wsRaf = 0, menuRaf = 0, hubRaf = 0, bayK = 1;
function drawBay(ts) {
  const t = ts / 1000, cv = $('#bayCanvas'), c = cv.getContext('2d'), k = bayK; c.setTransform(k, 0, 0, k, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, 380); g.addColorStop(0, '#1d2024'); g.addColorStop(1, '#141619'); c.fillStyle = g; c.fillRect(0, 0, 460, 380);
  c.strokeStyle = 'rgba(255,255,255,.035)'; c.lineWidth = 1; for (let x = 0; x < 460; x += 23) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 300); c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,.05)'; c.font = '600 64px Teko, sans-serif'; c.fillText('BAY 2', 18, 70);
  c.strokeStyle = '#3a3f45'; c.lineWidth = 3; c.beginPath(); c.moveTo(150, 0); c.lineTo(150, 38); c.moveTo(310, 0); c.lineTo(310, 38); c.stroke(); c.fillStyle = '#2c3136'; c.fillRect(130, 34, 200, 8);
  const lg = c.createRadialGradient(230, 335, 10, 230, 335, 200); lg.addColorStop(0, 'rgba(240,178,10,.12)'); lg.addColorStop(1, 'rgba(240,178,10,0)'); c.fillStyle = lg; c.fillRect(0, 150, 460, 230);
  c.fillStyle = '#1a1c1f'; c.fillRect(0, 335, 460, 45);
  c.save(); c.beginPath(); c.rect(0, 335, 460, 8); c.clip(); c.fillStyle = '#f0b20a'; for (let x = -20; x < 480; x += 22) { c.beginPath(); c.moveTo(x, 343); c.lineTo(x + 11, 343); c.lineTo(x + 19, 335); c.lineTo(x + 8, 335); c.fill(); } c.restore();
  const ps = previewState(t, S.style, S.build), P = playerSpec();
  drawRobot(c, { st: ps.st, build: S.build, paint: S.paint, accent: S.accent, decal: S.decal, num: S.num, tally: P.tally, wear: S.wear, wseed: 4242, workbookCombat: P.workbookCombat, x: 200, ground: 336, dir: 1, scale: 1.12, pose: poseFrom(ps.st, ps.p, ps.punch, t, 0, 0), t });
  c.fillStyle = 'rgba(235,231,222,.55)'; c.font = '500 12px "IBM Plex Mono", monospace'; c.textAlign = 'right'; c.fillText(STYLES[S.style].name.toUpperCase() + ' DRILL', 445, 365); c.textAlign = 'left';
  bayRaf = requestAnimationFrame(drawBay);
}
function startBay() { const cv = $('#bayCanvas'); bayK = sizeCanvas(cv, 460, 380).k; cancelAnimationFrame(bayRaf); bayRaf = requestAnimationFrame(drawBay); }
/* ---------- garage ---------- */
let pendingBuy = null, gTab = 'parts', rackTab = 'head';
function buyable(cost) { return S.sandbox || S.scrap >= cost; }
function spend(cost) { if (!S.sandbox) S.scrap -= cost; refreshWallet(); uiBuy(); }
function partBars(k, p) {
  const bar = (l, v, max) => `<span class="pbar"><small>${l}</small><i><b style="width:${Math.round(clamp(v / max, 0, 1) * 100)}%"></b></i></span>`;
  if (k === 'lead' || k === 'rear') return `<span class="pbars">${bar('Power', p.power, 13.5)}${bar('Speed', p.speed, 1.45)}${bar('Reach', p.reach, 104)}</span>`;
  if (k === 'head') return `<span class="pbars">${bar('Armor', p.armor, 7)}${bar('Sensors', p.sense, .45)}</span>`;
  if (k === 'torso') return `<span class="pbars">${bar('Hull', p.hp, 185)}${bar('Load', p.cap, 47)}</span>`;
  if (k === 'legs') return `<span class="pbars">${bar('Footwork', p.move, 1.65)}${bar('Balance', p.balance, .68)}</span>`;
  return '';
}
function renderRack() {
  const [k, label, pool, hint] = SLOTS.find(x => x[0] === rackTab), baseS = statsOf(S.build, S.trait, partWearForBuild(S.build)), active = activeStableBot(), workbookActive = active && active.combatModel === 'workbook';
  $('#rack').innerHTML = `${workbookActive ? `<p class="note">${esc(active.name)} uses a custom build. Fit its parts in Stable → Custom build.</p>` : ''}<div class="rtabs">${SLOTS.map(([sk, sl, sp]) => `<button data-rtab="${sk}" aria-pressed="${rackTab === sk}"><small>${sl}</small><b>${esc(part(sp, S.build[sk]).name)}</b></button>`).join('')}</div>
    <div class="slothead"><b>${label}</b><span class="note">${hint}${S.sandbox ? ' · sandbox: all unlocked' : ' · tap a locked part twice to buy'}</span></div>
    <div class="opts">${PARTS[pool].filter(p => !p.hidden).map(p => { const own = hasPartForSlot(p.id, k), conf = pendingBuy === p.id + '@' + k, br = BRANDS[p.b];
      const ra = rarityOf(p), RA = RARITY[ra], bars = partBars(k, p);
      return `<button class="opt r-${ra}${own ? '' : ' locked'}${conf ? ' confirm' : ''}" style="--rc:${RA.col}" data-slot="${k}" data-pool="${pool}" data-id="${p.id}" aria-pressed="${S.build[k] === p.id}">
      <canvas width="180" height="110" data-pv="${k}:${p.id}"></canvas>
      <span class="rar"><b>${'★'.repeat(RA.st)}</b>${RA.n}</span>
      <span class="br"><i style="background:${br ? br.col : '#5b626a'}"></i>${br ? br.name : 'Aftermarket'}</span><span class="pn">${esc(p.name)}</span>
      ${bars}${p.plus ? `<span class="tr up">+ ${p.plus}</span>` : ''}${p.minus ? `<span class="tr dn">− ${p.minus}</span>` : ''}
      <span class="mt">${k === 'torso' ? '' : `<em>${k === 'lead' || k === 'rear' ? p.w / 2 : p.w} kg</em> · `}${p.note || ''}</span>
      <span class="dcs">${S.build[k] === p.id ? '<i class="dc eq">Fitted now</i>' : deltaChips(baseS, statsOf({ ...S.build, [k]: p.id }, S.trait, partWearForBuild({ ...S.build, [k]: p.id })), k)}</span>
      ${own ? '' : `<span class="price">${conf ? `Tap again to buy · ${p.cost}` : `Locked · ${p.cost} scrap`}</span>`}</button>`; }).join('')}</div>`;
  $$('#rack [data-pv]').forEach(cv => { const [sk, id] = cv.dataset.pv.split(':'); drawPartPreview(cv.getContext('2d'), sk, id); });
}
const DKEYS = [['power', 'power', 1, 1], ['aspd', 'speed', 2, 1], ['reach', 'reach', 0, 1], ['armor', 'armor', 0, 1], ['hp', 'hull', 0, 1], ['sense', 'sensors', 'p', 1], ['move', 'footwork', 2, 1], ['balance', 'balance', 2, 1], ['en', 'battery', 0, 1], ['regen', 'regen', 1, 1], ['cool', 'cooling', 2, 1], ['dodge', 'dodge', 'p', 1], ['crit', 'crit', 'p', 1], ['durability', 'reliability', 'p', 1], ['load', 'kg load', 1, -1]];
function deltaChips(base, alt, slot) {
  const out = [], arm = slot === 'lead' || slot === 'rear';
  const add = (lab, dv, dec, good, scale) => { if (Math.abs(dv) < 1e-6) return; out.push({ lab, dv, dec, good: dv * good > 0, mag: Math.abs(dv) / (scale || 1) }); };
  for (const [k, lab, dec, good] of DKEYS) { if (arm && (k === 'power' || k === 'aspd' || k === 'reach')) continue; const rg = RANGE[k] || [0, 1]; add(lab, alt[k] - base[k], dec, good, (rg[1] - rg[0]) || 1); }
  if (arm) { add(slot + ' power', alt.armP[slot] - base.armP[slot], 1, 1, 7); add(slot + ' speed', alt.armS[slot] - base.armS[slot], 2, 1, .8); add(slot + ' reach', alt.armR[slot] - base.armR[slot], 0, 1, 26); }
  if (slot === 'head' || arm || slot === 'legs') { const pk = slot === 'head' ? 'head' : slot; add(pk + ' HP', alt.phMax[pk] - base.phMax[pk], 0, 1, 40); }
  if (alt.heart !== base.heart) out.push({ lab: alt.heart ? 'Underdog on' : 'Underdog off', dv: alt.heart ? 1 : -1, dec: 'x', good: !!alt.heart, mag: 9 });
  if (alt.over && !base.over) out.push({ lab: 'over limit', dv: 1, dec: 'x', good: false, mag: 10 });
  out.sort((a, b) => b.mag - a.mag);
  return out.slice(0, 4).map(o => `<i class="dc ${o.good ? 'up' : 'dn'}">${o.dec === 'x' ? '' : (o.dv > 0 ? '+' : '−') + (o.dec === 'p' ? Math.round(Math.abs(o.dv) * 100) + '%' : Math.abs(o.dv).toFixed(o.dec)) + ' '}${o.lab}</i>`).join('') || '<i class="dc eq">No stat change</i>';
}
function renderLook() {
  $('#gpLook').innerHTML = `<div class="formgrid">
    <label class="fld"><span>Bot name</span><input id="fName" maxlength="14" value="${esc(S.name)}"></label>
    <label class="fld"><span>Ring nickname</span><input id="fNick" maxlength="22" value="${esc(S.nick)}" placeholder="The Underdog"></label>
    <label class="fld"><span>Fighting out of</span><input id="fHome" maxlength="24" value="${esc(S.home)}" placeholder="Eastside"></label>
    <label class="fld wide"><span>Backstory · the announcer and the booth read this</span><textarea id="fStory" maxlength="140" rows="2">${esc(S.story)}</textarea></label></div>
    <div class="sect"><h4>Walkout</h4><p class="note">Your entrance music and pyro. Belts you hold are worn on the walk to the ring.</p>
      <div class="trow"><span><b>Walkout music</b><small>${walkStyle().bpm} bpm</small></span><div class="seg tiny">${Object.entries(WALKOUTS).map(([k, w]) => `<button data-walk="${k}" aria-pressed="${(S.walkout || 'anthem') === k}">${w.name}</button>`).join('')}</div><button class="small-btn" id="walkPrev">Preview</button></div>
      <div class="trow"><span><b>Pyro</b><small>Fires at every venue when you walk out</small></span><div class="pyros">${Object.entries(PYRO).map(([k, c]) => `<button class="pyro${(S.pyro || 'fire') === k ? ' on' : ''}" data-pyro="${k}" title="${c[3]}" style="--pc:rgb(${c[0]},${c[1]},${c[2]})"></button>`).join('')}</div></div></div>
    <div class="sect"><h4>Battle wear</h4><p class="note">Wear is cosmetic. It tells the crowd how many fights this frame has been through.</p><div class="wears">${WEARS.map(([n, d], i) => `<button class="wcard" data-wear="${i}" aria-pressed="${S.wear === i}"><canvas width="150" height="120" data-wpv="${i}"></canvas><b>${n}</b><small>${d}</small></button>`).join('')}</div></div>
    <div class="sect"><h4>Paint</h4><div class="paints">${PAINTS.map(([n, c]) => `<button class="sw" style="background:${c}" data-paint="${c}" aria-label="${n}" title="${n}" aria-pressed="${S.paint === c}"></button>`).join('')}</div></div>
    <div class="sect"><h4>Trim</h4><div class="paints">${ACCENTS.map(([n, c]) => `<button class="sw sm" style="background:${c}" data-accent="${c}" aria-label="${n} trim" title="${n}" aria-pressed="${S.accent === c}"></button>`).join('')}</div></div>
    <div class="sect"><h4>Decal</h4><div class="chips">${DECALS.map(([k, n]) => `<button class="chip" data-decal="${k}" aria-pressed="${S.decal === k}">${n}${k === 'tally' ? ` · ${S.rec.des}` : ''}</button>`).join('')}</div>
    ${S.decal === 'number' ? `<label class="fld inline"><span>Number</span><input id="fNum" type="number" min="0" max="99" value="${S.num}"></label>` : ''}${S.decal === 'tally' ? '<p class="note">One mark for every bot you have destroyed.</p>' : ''}</div>`;
  $$('#gpLook [data-wpv]').forEach(cv => { const c = cv.getContext('2d'), i = +cv.dataset.wpv; c.fillStyle = '#17191c'; c.fillRect(0, 0, 150, 120); const an = anchors(S.build); drawRobot(c, { st: 'idle', build: S.build, paint: S.paint, accent: S.accent, decal: S.decal, num: S.num, tally: S.rec.des, wear: i, wseed: 4242, x: 75, ground: 114, dir: 1, scale: .4, pose: poseFrom('idle', 0, null, 0, 0, 0), t: 0 }); });
}
function sigCard(k, m) { const own = S.sigs.includes(k), conf = pendingBuy === 'sig:' + k; return `<button class="mcard ${own ? '' : 'locked'}${conf ? ' confirm' : ''}" data-sigm="${k}" aria-pressed="${S.sig === k && own}"><b>${m.name}</b><small>${m.desc}</small><span class="tellt">${m.tell}</span><em>${PUNCH_NAME[m.kind]} · ${m.target} · ${m.maxUses} per fight${m.feint ? ' · can feint' : ''}</em>${own ? '' : `<span class="price">${conf ? `Tap again · ${m.cost} scrap` : `Learn · ${m.cost} scrap`}</span>`}</button>`; }
const PUNCH_NAME = { jab: 'Jab', cross: 'Cross', hook: 'Hook', upper: 'Uppercut', hay: 'Haymaker', counter: 'Counter' };
function renderPlan() {
  $('#gpPlan').innerHTML = `<div class="sect"><h4>Fighting style</h4><p class="note">How your bot fights when it is driving itself.</p><div class="seg">${Object.entries(STYLES).map(([k, s]) => `<button data-style="${k}" aria-pressed="${S.style === k}"><b>${s.name}</b><small>${s.desc}</small></button>`).join('')}</div></div>
    <div class="sect"><h4>Game plan</h4><div class="seg">${Object.values(GAMEPLANS).map(p => `<button data-plan="${p.id}" aria-pressed="${S.plan === p.id}"><b>${p.name}</b><small>${p.desc}</small></button>`).join('')}</div></div>
    <div class="sect"><h4>Signature move</h4><p class="note">Every pro has one. It shows a tell before it lands, so good opponents can slip it. In Pilot mode press F to throw it.</p><div class="mgrid">${Object.entries(SIG_MOVES).map(([k, m]) => sigCard(k, m)).join('')}</div></div>
    <div class="sect"><h4>Default controls</h4><div class="seg two"><button data-ctrl="coach" aria-pressed="${S.ctrl === 'coach'}"><b>Coach</b><small>The bot fights itself. You call plays with 1–4.</small></button><button data-ctrl="pilot" aria-pressed="${S.ctrl === 'pilot'}"><b>Pilot</b><small>You drive: move, punch, slip and guard by hand.</small></button></div><p class="note">You can switch any time in a fight with C.</p></div>`;
}
function renderCrew() {
  $('#gpCrew').innerHTML = `<div class="sect"><h4>Corner crew</h4><p class="note">They weld between rounds.</p><div class="seg">${Object.entries(MECHS).map(([k, m]) => { const own = ownsMech(k), conf = pendingBuy === 'mech:' + k; return `<button data-mech="${k}" class="${own ? '' : 'locked'}${conf ? ' confirm' : ''}" aria-pressed="${S.mech === k}"><b>${m.name}</b><small>${m.desc}${own ? '' : conf ? ` · tap again to hire (${m.cost})` : ` · hire for ${m.cost} scrap`}</small></button>`; }).join('')}</div></div>
    <div class="sect"><h4>AI chip</h4><p class="note">One firmware trait.</p><div class="seg">${Object.entries(TRAITS).map(([k, c]) => { const own = ownsChip(k), conf = pendingBuy === 'chip:' + k; return `<button data-chip="${k}" class="${own ? '' : 'locked'}${conf ? ' confirm' : ''}" aria-pressed="${S.trait === k}"><b>${c.name}</b><small>${c.desc}${own ? '' : conf ? ` · tap again to buy (${c.cost})` : ` · ${c.cost} scrap`}</small></button>`; }).join('')}</div></div>
    <div class="sect"><h4>Training drills</h4><p class="note">Permanent upgrades to your calls and your defense. Pay for a rank, or earn it in the gym: pass a drill with 70% to rank up for free. You get one gym session per career fight (up to 3 banked). <b class="gymk">Gym sessions: ${S.gym || 0}</b></p><div class="drills">${DRILLS.map(d => { const r = S.training[d.id] || 0, max = r >= d.costs.length, cost = d.costs[r], conf = pendingBuy === 'drill:' + d.id; return `<div class="drill"><div><b>${d.name}</b><span class="pips2">${d.costs.map((_, i) => `<i class="${i < r ? 'on' : ''}"></i>`).join('')}</span><small>${d.effect(r)}</small></div><div class="dbtns">${max ? '' : `<button class="small-btn gym" data-gym="${d.id}" ${S.gym > 0 ? '' : 'disabled'} title="${S.gym > 0 ? 'Play the drill' : 'Win or lose a career fight to earn a gym session'}">Gym · free</button>`}<button class="small-btn${conf ? ' confirm' : ''}" data-drill="${d.id}" ${max ? 'disabled' : ''}>${max ? 'Maxed' : conf ? `Confirm · ${cost}` : `Buy · ${cost}`}</button></div></div>`; }).join('')}</div></div>`;
}
const RADAR = [['Power', s => s.power, 'power'], ['Speed', s => s.aspd, 'aspd'], ['Reach', s => s.reach, 'reach'], ['Armor', s => s.armor, 'armor'], ['Hull', s => s.hp, 'hp'], ['Stamina', s => s.en / 100 + s.regen / 20, null], ['Footwork', s => s.move, 'move'], ['Balance', s => s.balance, 'balance']];
function drawRadar() {
  const cv = $('#radar'); if (!cv) return;
  const c = cv.getContext('2d'), cx = 220, cy = 190, R0 = 118, n = RADAR.length, s = playerStats(), o = BOT(S.opp), so = statsOf(o.build, o.trait);
  c.clearRect(0, 0, 440, 360);
  const val = (st, ax) => { const [lo, hi] = ax[2] ? RANGE[ax[2]] : [1.4, 3.1]; return clamp((ax[1](st) - lo) / ((hi - lo) || 1), 0, 1) * .85 + .15; };
  const ang = i => -Math.PI / 2 + i / n * 6.283;
  c.strokeStyle = 'rgba(235,231,222,.1)'; c.lineWidth = 1;
  for (let k = 1; k <= 4; k++) { c.beginPath(); for (let i = 0; i < n; i++) c.lineTo(cx + Math.cos(ang(i)) * R0 * k / 4, cy + Math.sin(ang(i)) * R0 * k / 4); c.closePath(); c.stroke(); }
  c.font = '500 12px "IBM Plex Mono", monospace'; c.fillStyle = '#8f969d'; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < n; i++) { c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ang(i)) * R0, cy + Math.sin(ang(i)) * R0); c.stroke(); c.fillText(RADAR[i][0].toUpperCase(), cx + Math.cos(ang(i)) * (R0 + 30), cy + Math.sin(ang(i)) * (R0 + 16)); }
  const poly = st => { c.beginPath(); RADAR.forEach((ax, i) => { const r = R0 * val(st, ax); c.lineTo(cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r); }); c.closePath(); };
  poly(so); c.setLineDash([5, 4]); c.strokeStyle = 'rgba(79,163,217,.95)'; c.lineWidth = 2; c.stroke(); c.setLineDash([]);
  poly(s); c.fillStyle = 'rgba(240,178,10,.22)'; c.fill(); c.strokeStyle = '#f0b20a'; c.lineWidth = 2.5; c.stroke();
  c.textAlign = 'left'; c.fillStyle = '#f0b20a'; c.fillRect(8, 14, 16, 3); c.fillStyle = '#ebe7de'; c.fillText('Your build', 30, 16);
  c.strokeStyle = 'rgba(79,163,217,.95)'; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(8, 34); c.lineTo(24, 34); c.stroke(); c.setLineDash([]); c.fillText('vs ' + o.name, 30, 34); c.textBaseline = 'alphabetic';
}
function fightMath(s) {
  const st = STYLES[S.style], ref = 22 / (22 + 7);
  const d = (arm, kind, head) => (s.armP[arm] * PUNCH[kind].mult * (kind === 'jab' ? st.jabMul || 1 : 1) * (head ? 1.3 : 1) * ref * DMG).toFixed(1);
  const cyc = arm => ((PUNCH.cross.wu + .09 + .24) / s.armS[arm]).toFixed(2);
  const heatPS = 9 * (st.hot || 1) * s.heatMul / .55 - 12 * s.cool, enPS = 12 / .55 - s.regen;
  const block = Math.min(.75, s.sense * st.guard * 2 + .14 + s.blockBonus);
  const rows = [['Jab to the head', d('lead', 'jab', 1) + ' dmg'], ['Cross to the body', d('rear', 'cross', 0) + ' dmg'], ['Uppercut', d('rear', 'upper', 1) + ' dmg'], ['Haymaker', d('rear', 'hay', 1) + ' dmg'], ['Punch cycle · lead / rear', `${cyc('lead')} s / ${cyc('rear')} s`], ['Reach · lead / rear', `${s.armR.lead} / ${s.armR.rear}`], ['Overheats throwing flat out', heatPS > 0 ? `in ${Math.round(100 / heatPS)} s` : 'Never'], ['Battery throwing flat out', enPS > 0 ? `empty in ${Math.round(s.en / enPS)} s` : 'Keeps up'], ['Block chance · ' + st.name, Math.round(block * 100) + '%'], ['Dodge · crit', `${Math.round(s.dodge * 100)}% · ${Math.round(s.crit * 100)}%`]];
  return `<table class="rt"><thead><tr><th>Fight math</th><th>vs armor 7</th></tr></thead><tbody>${rows.map(([l, v]) => `<tr><td>${l}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;
}
function renderData() {
  $('#gpData').innerHTML = `<div class="sect"><h4>Profile vs ${esc(BOT(S.opp).name)}</h4><div class="deep"><canvas id="radar" width="440" height="360" aria-label="Build profile compared with the selected opponent"></canvas><div class="tbl">${fightMath(playerStats())}</div></div></div>
    <div class="sect"><h4>Test bench</h4><p class="note" id="simStatus">Runs 40 headless fights against each bot in a league. Same engine, no graphics.</p><div class="chips">${LEAGUES.map((L, i) => `<button class="chip" data-bench="${i}">${L.name}</button>`).join('')}</div><div id="simOut"></div></div>`;
  drawRadar();
}
const STABLE_HISTORY_ACTION_LABELS = { fitted: 'Fitted', stashed: 'Returned to stash', 'fight-damaged': 'Fight damage', 'migration-fitted': 'On bot at migration', 'frame-assigned': 'Frame assigned', 'wreck-frame-lost':'Frame lost in wreck', 'wreck-salvageable':'Wreck damage', 'wreck-recovered':'Recovered from wreck', 'wreck-scrapped':'Scrapped in wreck', 'loaner-issued':'Loaner part issued' };
function renderStableBotHistory(bot) {
  const entries = (Array.isArray(bot.partsHistory) ? bot.partsHistory : []).filter(entry => entry && typeof entry === 'object'), makers = [...new Set((Array.isArray(bot.makers) ? bot.makers : []).map(value => String(value || '').trim()).filter(Boolean))];
  const rows = entries.slice().reverse().map(entry => {
    const action = STABLE_HISTORY_ACTION_LABELS[entry.action] || String(entry.action || 'Recorded').replace(/-/g, ' '), name = entry.name || entry.partName || entry.defId || 'Unknown part', slot = entry.slot ? `Slot ${entry.slot}` : '', maker = entry.maker ? `Maker ${entry.maker}` : '', condition = Number.isFinite(+entry.condition) ? `Condition ${Math.round(+entry.condition)}%` : '', integrity = Number.isFinite(+entry.integrity) ? `Integrity ${Math.round(+entry.integrity)}%` : '', detail = [slot, maker, condition, integrity].filter(Boolean).join(' · ');
    return `<li><b>${esc(action)}</b> · ${esc(name)}<small>Day ${Math.max(1, Math.floor(+entry.day || 1))}${detail ? ` · ${esc(detail)}` : ''}</small></li>`;
  }).join('') || '<li>No parts or frame history recorded yet.</li>';
  return `<details class="stable-pedigree"><summary>Workshop history · ${entries.length} events · ${makers.length} makers</summary><div class="stable-pedigree-body"><p class="stable-pedigree-makers"><b>Maker list</b> · ${makers.length ? makers.map(esc).join(' · ') : 'No makers recorded'}</p><ol class="stable-pedigree-list">${rows}</ol></div></details>`;
}
function renderStableWreckHall() {
  const rows = (S.hallOfWrecks || []).map(row => `<div class="lrow"><span class="rk">${esc(row.outcome || 'Wreck')}</span><span class="ln"><b>${esc(row.botName || 'Unnamed Bot')} · ${row.lost ? 'Memorial plate' : 'Rebuild pending'}</b><small>Record ${+row.record?.w || 0}–${+row.record?.l || 0} · Day ${+row.day || 1} · ${esc(row.venue || 'Unknown venue')} · Wrecked by ${esc(row.opponent || 'unknown opponent')}${row.frame?.name ? ` · ${esc(row.frame.name)}` : ''}</small><small>${(row.parts || []).filter(item => item.disposition !== 'Scrapped').map(item => `${esc(item.name)}: ${esc(item.disposition)}`).join(' · ') || 'No parts recovered'}</small></span><em>${Math.round((+row.probabilities?.salvageable || 0) * 100)}% salvage chance</em></div>`).join('');
  return `<div class="sect"><h4>Hall of Wrecks</h4>${rows ? `<div class="lrows">${rows}</div>` : '<p class="note">No wreck plates recorded yet. Fight wrecks and recoveries will be remembered here.</p>'}</div>`;
}
let stableView = 'bots';
function renderStable() {
  const bots = Array.isArray(S.stable) ? S.stable : [], garageBots = bots.filter(bot => bot && bot.storageLocation !== 'truck'), activeId = S.activeBotId, restBot = activeStableBot(), spareFrames = S.items.filter(item => item && item.kind === 'frame' && item.location === 'stash');
  if (!bots.some(bot => bot && bot.id === stableBuildBotId)) stableBuildBotId = activeId;
  const occupied = new Set(), slots = Array.from({ length: S.stableBays }, (_, bay) => {
    const bot = garageBots.find(item => item && item.bayIndex === bay && !occupied.has(item.id)) || garageBots.find(item => item && !occupied.has(item.id));
    if (bot) occupied.add(bot.id);
    if (!bot) {
      const frameOptions = spareFrames.map(item => { const frame = frameDefFor(item); return frame ? `<option value="${esc(item.itemId)}">${esc(frame.name)} · ${esc(frame.weightClass)} · ${esc(frame.mobility)} · ${frame.load} kg Load · ${effectiveFrameCapacity(frame, item.reinforcements)} Capacity</option>` : ''; }).join('');
      const roleOptions = STABLE_ROLES.map(role => `<option value="${esc(role)}"${role === 'Fighter' ? ' selected' : ''}>${esc(role)}</option>`).join('');
      return `<div class="stable-empty"><b>Bay ${bay + 1} · empty</b>${spareFrames.length ? `<p class="stable-footnote">Name it, pick a frame, then fit parts in the Custom build tab.</p><div class="stable-assembly" data-stable-assembly-form><label>Bot name<input data-assembly-name maxlength="14" placeholder="Name this bot" autocomplete="off"></label><label>Frame<select data-assembly-frame>${frameOptions}</select></label><label>Role<select data-assembly-role>${roleOptions}</select></label></div><button class="small-btn gym" data-stable-assemble="${bay}">Start bot build</button>` : '<p class="stable-footnote">No spare frame is available. Extra bots require an owned frame in stash.</p>'}</div>`;
    }
    const isActive = bot.id === activeId, frameItem = frameItemById(bot.frameItemId), frame = frameDefFor(frameItem), record = bot.fightRecord || bot.rec || {}, fatigue = Math.max(0, Math.floor(+bot.fatigue || 0)), botPenalty = fatiguePenaltyPct(fatigue), pedigree = bot.legend ? 'Legend · +10% fight Hype gain' : bot.veteran ? 'Veteran' : '';
    const frameBonus = frame ? workbookFrameCapacityBonus(bot, frame) : { veteran: 0, underdog: 0, total: 0 };
    const botHistory = renderStableBotHistory(bot);
    const frameShort = frame ? `${esc(frame.name)} · ${esc(frame.weightClass)} · ${esc(frame.mobility)} mobility` : 'No frame assigned', frameLine = frame ? `${esc(frame.name)} · ${esc(frame.weightClass)} · ${esc(frame.mobility)} mobility · ${esc(frame.quirk)} · ${frameItem.integrity}/${effectiveFrameIntegrity(frame, frameItem.reinforcements)} Integrity · ${frame.load} kg Load limit · ${effectiveFrameCapacity(frame, frameItem.reinforcements) + frameBonus.total} Capacity${frameBonus.veteran ? ` (+${frameBonus.veteran} Veteran)` : ''}${frameBonus.underdog ? ` (+${frameBonus.underdog} Underdog)` : ''} · ${frameItem.reinforcements}/3 Reinforcements` : 'Frame not assigned';
    const roleOptions = STABLE_ROLES.map(role => `<option value="${esc(role)}" ${normalizeStableRole(bot.role) === role ? 'selected' : ''}>${esc(role)}</option>`).join('');
    const reinforceButton = frameItem && +frameItem.reinforcements < 3 ? `<button class="small-btn" data-frame-reinforce="${esc(frameItem.itemId)}" title="+2 Capacity, −10 max Integrity. Permanent.">Reinforce</button>` : '';
    const combatReport = bot.combatModel === 'workbook' ? workbookCombatAdapter(bot) : null, combatReady = combatReport ? combatReport.ready : bot.combatReady !== false, buildStatus = combatReport && !combatReport.ready ? `<p>Build status · ${esc(combatReport.blockers.join(' '))}</p>` : '', wreckNotice = bot.wreckStatus === 'salvageable' ? '<p class="wreck-note">Fight wreck · bot held at Scrapworks. Rebuild before returning to the ring.</p>' : bot.loaner ? '<p class="note">Junkline loaner · Laundromat Shell with the approved legacy starter loadout.</p>' : '', truckButton = truckDefinition()?.botBays > truckBotCount() ? `<button class="small-btn" data-stable-to-truck="${esc(bot.id)}">Load into truck</button>` : '';
    return `<div class="stable-row"><div><span class="stable-label">Bay ${bay + 1} · ${isActive ? 'Active bot' : 'Stable bot'}${bot.wreckStatus ? ' · Wrecked' : bot.loaner ? ' · Loaner' : ''}</span><h4>${esc(bot.name || 'Unnamed Bot')}${pedigree ? ` · ${pedigree}` : ''}</h4><p>${frameShort}</p><details class="stable-more"><summary>Frame details</summary><p>${frameLine}</p></details>${wreckNotice}${buildStatus}<div class="stable-meta"><span>Record ${+record.w || 0}–${+record.l || 0}</span><span>${+record.ko || 0} KOs</span><span>${+bot.survivedFights || 0} survived fights</span><span>Fatigue ${fatigue}${botPenalty ? ` · −${Math.round(botPenalty * 100)}% stats` : ''}</span></div>${botHistory}</div><div class="stable-side"><label for="stableRole-${esc(bot.id)}">Bot role</label><select id="stableRole-${esc(bot.id)}" data-stable-role="${esc(bot.id)}" aria-label="Role for ${esc(bot.name || 'unnamed bot')}">${roleOptions}</select>${!isActive ? bot.wreckStatus ? '<span class="stable-label">Rebuild at Scrapworks</span>' : !combatReady ? '<button class="small-btn" disabled>Combat adapter pending</button>' : `<button class="small-btn" data-stable-select="${esc(bot.id)}">Switch to this bot</button>` : '<span class="stable-label">Currently selected</span>'}<button class="small-btn" data-stable-manage="${esc(bot.id)}" ${bot.wreckStatus ? 'disabled' : ''}>${stableBuildBotId === bot.id ? 'Build panel selected' : 'Manage build'}</button>${reinforceButton}${truckButton}<p>${bot.role === 'Hauler' ? 'Haulers cannot enter the arena.' : bot.role === 'Scavenger' ? 'Run carry and sensor role; run systems are still to come.' : bot.role === 'Sparring Partner' ? 'Training role; stable training interactions are still to come.' : bot.role === 'Show Bot' ? 'Cosmetic and hype role; the hype system is still to come.' : 'Arena fighter.'}</p></div></div>`;
  }).join('');
  const stashList = spareFrames.map(item => { const frame = frameDefFor(item); return frame ? `<span>${esc(frame.name)} · ${esc(frame.weightClass)} · ${item.integrity}/${effectiveFrameIntegrity(frame, item.reinforcements)} Integrity · ${effectiveFrameCapacity(frame, item.reinforcements)} Capacity · ${item.reinforcements}/3 Reinforcements${+item.reinforcements < 3 ? ` <button class="small-btn" data-frame-reinforce="${esc(item.itemId)}">Reinforce</button>` : ''}</span>` : ''; }).filter(Boolean).join('<br>') || 'No spare frames.';
  const buildBot = managedStableBot();
  const dayUpkeep = Math.max(0, Math.floor(+truckDefinition()?.upkeepPerDay || 0)), dayWages = truckCrewWagesPerDay(), dayCost = dayUpkeep + dayWages, trainerBonus = truckCrewCount('trainer'), canAdvanceDay = !!restBot && (S.sandbox || S.scrap >= dayCost);
  const stableViews = [['bots', 'Bots'], ['truck', 'Truck & road'], ['build', 'Custom build'], ['wrecks', 'Wrecks']];
  const stableBody = stableView === 'truck' ? renderStableTruck() : stableView === 'build' ? `${renderWorkbookOwnedBuild(buildBot)}<details class="sect"><summary>Plan a build on paper</summary>${renderWorkbookPlanner(buildBot)}</details><details class="sect"><summary>Spare frames · ${spareFrames.length}</summary><p class="note">${stashList}</p></details>${renderWorkbookModCatalog()}` : stableView === 'wrecks' ? renderStableWreckHall() : `<div class="stable-list">${slots}</div>`;
  $('#gpStable').innerHTML = `<div class="stable-top"><div><b>DAY ${S.stableDay}</b><p class="note">${bots.length} bot${bots.length === 1 ? '' : 's'} · ${garageBots.length}/${S.stableBays} bays</p></div><button class="small-btn" data-stable-rest ${canAdvanceDay ? '' : 'disabled'} title="Rest ${trainerBonus ? 2 + trainerBonus : 2} Fatigue. Pays ${dayUpkeep} truck upkeep and ${dayWages} crew wages.">Rest a day · ${dayCost} Scrap</button></div><div class="stableNav" role="tablist">${stableViews.map(([id, label]) => `<button role="tab" data-stable-view="${id}" aria-selected="${stableView === id}">${label}</button>`).join('')}</div>${stableBody}`;
}
function assembleStableBot(bayIndex, frameItemId, rawName, rawRole) {
  const bay = Math.floor(+bayIndex), frameItem = frameItemById(frameItemId), frame = frameDefFor(frameItem), name = clean(rawName, 14).trim();
  if (!Number.isFinite(bay) || bay < 0 || bay >= S.stableBays || S.stable.some(bot => bot && bot.bayIndex === bay)) { toast('That garage bay is not empty.', 'bad'); return false; }
  if (!frameItem || frameItem.location !== 'stash' || !frame) { toast('Choose an owned frame from stash.', 'bad'); return false; }
  if (!name) { toast('Give the bot a name before starting its build.', 'bad'); return false; }
  if (S.stable.some(bot => String(bot.name || '').trim().toLowerCase() === name.toLowerCase())) { toast('Each bot needs a distinct name.', 'bad'); return false; }
  let n = 1, id; do { id = `bot-build-${n++}`; } while (S.stable.some(bot => bot && bot.id === id));
  const blankBuild = { head: 'none', torso: 'none', lead: 'none', rear: 'none', legs: 'none', back: 'none' };
  const bot = { ...Object.fromEntries(BOT_STATE_FIELDS.map(key => [key, saveCopy(DEFAULT[key])])), id, combatModel: 'workbook', bayIndex: bay, storageLocation: 'garage', frameItemId: frameItem.itemId, role: normalizeStableRole(rawRole), fatigue: 0, survivedFights: 0, wrecksSurvived: 0, veteran: false, legend: false, frameCapacityBonus: 0, legendPaintUnlocked: false, legendCrowdBonus: false, partsHistory: [], makers: [], scars: [], build: blankBuild, equippedItems: {}, name, nick: '', home: S.home, story: '', wear: 0, workbookPlan: {}, workbookFittedItems: {}, combatReady: false };
  frameItem.location = 'bay'; frameItem.botId = id; frameItem.history = Array.isArray(frameItem.history) ? frameItem.history : []; frameItem.history.push({ action: 'assigned-to-build', botId: id, day: Math.max(1, Math.floor(+S.stableDay || 1)) }); recordStableFrameHistory(bot, frameItem);
  S.stable.push(bot); stableBuildBotId = id; evaluateWorkbookAchievements({ type:'state' }); save(); renderStable(); toast(`${name}'s bot build started on the ${frame.name}.`, 'good'); return true;
}
function selectStableBot(id, runRecovery = false) {
  const bot = (S.stable || []).find(item => item && item.id === id); if (!bot || bot.id === S.activeBotId) return;
  const activeRun = S.workbookRun; if (!runRecovery && activeRun?.status === 'active' && activeRun.party?.[0] && activeRun.party[0] !== bot.id) { toast('The deployed bot is locked to this salvage run until extraction or failure.'); return; }
  if (bot.wreckStatus === 'salvageable') { toast('That bot is wrecked. Rebuild it at Scrapworks first.'); return; }
  if (bot.combatReady === false) { toast('This bot needs a finished build before it can fight.'); return; }
  syncActiveBot(); S.activeBotId = bot.id;
  stableBuildBotId = bot.id;
  const workbook = bot.combatModel === 'workbook', workbookManaged = ['build','equippedItems','partWear','worn','tune','mods'];
  for (const key of BOT_STATE_FIELDS) if (bot[key] !== undefined && (!workbook || !workbookManaged.includes(key))) S[key] = saveCopy(bot[key]);
  if (workbook) { S.build = saveCopy(DEFAULT.build); S.equippedItems = {}; S.partWear = {}; S.worn = {}; S.tune = {}; S.mods = {}; }
  if (!workbook) S.equippedItems = saveCopy(bot.equippedItems || {}); pendingBuy = null; save(); renderGTab(); renderReadout(); startBay();
}
function restActiveBot() {
  const bot = activeStableBot(); if (!bot) return;
  const upkeep = Math.max(0, Math.floor(+truckDefinition()?.upkeepPerDay || 0)), wages = truckCrewWagesPerDay(), dailyCost = upkeep + wages;
  if (!S.sandbox && S.scrap < dailyCost) { toast(`Need ${dailyCost} Scrap to cover truck upkeep and crew wages before advancing a day.`, 'bad'); return; }
  if (!S.sandbox) { S.scrap = Math.max(0, S.scrap - dailyCost); addWorkbookLedgerEntry({ action: 'truck-day-cost', truckUpkeep: upkeep, crewWages: wages, scrap: -dailyCost }); }
  const trainerBonus = truckCrewCount('trainer'); bot.fatigue = Math.max(0, Math.floor(+bot.fatigue || 0) - 2 - trainerBonus); S.gym = Math.min(3, Math.max(0, +S.gym || 0) + trainerBonus); S.stableDay = Math.max(1, Math.floor(+S.stableDay || 1)) + 1;
  save(); refreshWallet(); renderGTab(); renderReadout(); toast(`Advanced one day. ${bot.fatigue} Fatigue remains. Paid ${dailyCost} Scrap (${upkeep} upkeep, ${wages} wages).`, 'good');
}
function reinforceStableFrame(id) {
  const item = frameItemById(id), frame = frameDefFor(item); if (!item || !frame || +item.reinforcements >= 3) return;
  item.reinforcements = clamp(Math.floor(+item.reinforcements || 0) + 1, 0, 3);
  item.integrity = Math.min(Math.max(0, +item.integrity || 0), effectiveFrameIntegrity(frame, item.reinforcements));
  save(); renderGTab(); renderReadout(); toast(`${frame.name} reinforced. +2 Capacity; max Integrity is now ${effectiveFrameIntegrity(frame, item.reinforcements)}.`, 'good');
}
function renderReadout() {
  const s = playerStats(), stableBot = activeStableBot(), fatigue = stableBot ? Math.max(0, Math.floor(+stableBot.fatigue || 0)) : 0, penalty = fatiguePenaltyPct(fatigue);
  const workbook = stableBot && stableBot.combatModel === 'workbook' ? workbookCombatAdapter(stableBot) : null;
  $('#loadVal').textContent = +s.load.toFixed(1); $('#capVal').textContent = s.cap;
  $('#loadBar').classList.toggle('over', s.over); $('#loadBar i').style.width = Math.min(100, s.load / s.cap * 100) + '%';
  $('#stats').innerHTML = STAT_ROWS.map(([lab, k, fmt]) => { const [lo, hi] = RANGE[k]; const pct = clamp(10 + 90 * (s[k] - lo) / (hi - lo || 1), 4, 100); return `<div class="stat"><span>${lab}</span><span class="sb"><i style="width:${pct}%"></i></span><b>${fmt(s[k])}</b></div>`; }).join('');
  $('#frameCode').textContent = workbook ? `${workbook.frame?.name || 'Custom frame'} · ${Math.round(s.total)} kg` : SLOTS.slice(0, 5).map(x => part(x[2], S.build[x[0]]).b).join('·') + ' · ' + Math.round(s.total) + ' kg';
  $('#setLine').innerHTML = (workbook ? 'Custom build.' : (s.set ? `Set bonus: <b>${BRANDS[s.set].name}</b> · ${BRANDS[s.set].bonus}` : 'Fit 3 parts from one maker for a set bonus.') + (s.heart ? ' <b>Underdog</b> · +10% power while behind.' : '')) + ` <b>Fatigue ${fatigue}${penalty ? ` · −${Math.round(penalty * 100)}% stats` : ''}</b>`;
  $('#gName').textContent = playerSpec().name; $('#gNick').textContent = S.nick ? `"${S.nick}" · ${S.home}` : S.home;
  const locked = workbook ? !workbook.ready : SLOTS.some(x => !owns(S.build[x[0]])) || !ownsMech(S.mech) || !ownsChip(S.trait), roleBlocked = stableBot && stableBot.role === 'Hauler', venueLegality = workbook ? workbookVenueLegality(S.venue, workbook) : null, venueBlocked = !!(venueLegality?.rule?.illegalParts === 'Banned' && venueLegality.illegalParts.length);
  const btn = $('#gFight'); btn.disabled = s.over || locked || roleBlocked || venueBlocked || !botOpen(S.opp);
  btn.innerHTML = venueBlocked ? 'Illegal equipment banned at this venue' : s.over ? 'Over the load limit' : locked ? workbook ? 'Finish this bot’s build' : 'Buy or swap locked parts' : roleBlocked ? 'Haulers cannot enter the arena' : `Fight ${esc(BOT(S.opp).name)} <span>›</span>`;
  const ill = workbook ? workbook.report?.nonLegal || [] : illegalParts(S.build).map(q => q.name);
  const venueNotice = venueLegality?.illegalParts.length ? venueLegality.rule?.illegalParts === 'Banned' ? `Cannot enter ${venueLegality.rule.venue}: illegal equipment is banned (${venueLegality.illegalParts.join(', ')}).` : venueLegality.rule?.illegalParts === 'Banned (DQ)' ? `${venueLegality.rule.venue} will disqualify this build for illegal equipment (${venueLegality.illegalParts.join(', ')}).` : venueLegality.rule?.illegalParts === 'Tolerated' ? `${venueLegality.rule.venue} tolerates this illegal equipment.` : '' : '';
  const restrictedNotice = venueLegality?.otherRestricted.length ? `Other restricted/grey-market parts are not covered by this venue rule yet: ${venueLegality.otherRestricted.join(', ')}.` : '';
  $('#gWarn').textContent = venueNotice || restrictedNotice || (!workbook && ill.length ? `Illegal part fitted (${ill.join(', ')}). In Regional and Pit fights, inspectors can overturn a win.` : s.over ? `Over the core limit by ${+(s.load - s.cap).toFixed(1)} kg. Pick lighter parts or a bigger torso.` : locked ? (workbook ? workbook.blockers.join(' ') : 'Something fitted is still locked. Buy it or swap it out.') : roleBlocked ? 'This bot is assigned as a Hauler. Change its role in the Stable tab to enter the arena.' : '');
}
function renderGTab() {
  $$('#gtabs [data-gtab]').forEach(b => b.setAttribute('aria-selected', b.dataset.gtab === gTab));
  for (const k of ['parts', 'stable', 'look', 'plan', 'crew', 'data']) $('#gp' + k[0].toUpperCase() + k.slice(1)).hidden = k !== gTab;
  if (gTab === 'parts') renderRack(); if (gTab === 'stable') renderStable(); if (gTab === 'look') renderLook(); if (gTab === 'plan') renderPlan(); if (gTab === 'crew') renderCrew(); if (gTab === 'data') renderData();
}
function renderGarage() { if (!botOpen(S.opp)) S.opp = ROSTER[0].id; refreshWallet(); renderGTab(); renderReadout(); startBay(); }
function rerender() { refreshWallet(); renderGTab(); renderReadout(); }
function tryBuy(key, cost, name, apply) {
  if (pendingBuy === key) { pendingBuy = null; if (buyable(cost)) { spend(cost); apply(); toast(`${name} bought.`, 'good'); } else { uiError(); toast(`Not enough scrap for ${name}. You need ${cost}.`, 'bad'); } }
  else pendingBuy = key;
  save(); rerender();
}
$('#scrGarage').addEventListener('click', e => {
  const tb = e.target.closest('[data-gtab]'); if (tb) { gTab = tb.dataset.gtab; pendingBuy = null; renderGTab(); return; }
  if (e.target.closest('[data-stable-rest]')) { restActiveBot(); return; }
  const botToTruck = e.target.closest('[data-stable-to-truck]'); if (botToTruck) { moveStableBotToTruck(botToTruck.dataset.stableToTruck); return; }
  const botToGarage = e.target.closest('[data-stable-to-garage]'); if (botToGarage) { moveStableBotToGarage(botToGarage.dataset.stableToGarage); return; }
  const truckLoad = e.target.closest('[data-workbook-truck-load]'); if (truckLoad) { moveWorkbookPartToTruck(truckLoad.dataset.workbookTruckLoad); return; }
  const truckUnload = e.target.closest('[data-workbook-truck-unload]'); if (truckUnload) { moveWorkbookPartToStash(truckUnload.dataset.workbookTruckUnload); return; }
  const truckModuleBuy = e.target.closest('[data-truck-module-buy]'); if (truckModuleBuy) { buyTruckModule(truckModuleBuy.dataset.truckModuleBuy); return; }
  const truckModuleInstall = e.target.closest('[data-truck-module-install]'); if (truckModuleInstall) { installTruckModule(truckModuleInstall.dataset.truckModuleInstall); return; }
  const truckModuleRemove = e.target.closest('[data-truck-module-remove]'); if (truckModuleRemove) { uninstallTruckModule(truckModuleRemove.dataset.truckModuleRemove); return; }
  const crewHire = e.target.closest('[data-truck-crew-hire]'); if (crewHire) { hireTruckCrew(crewHire.dataset.truckCrewHire); return; }
  const crewFire = e.target.closest('[data-truck-crew-fire]'); if (crewFire) { dismissTruckCrew(crewFire.dataset.truckCrewFire); return; }
  const stableTab = e.target.closest('[data-stable-view]'); if (stableTab) { stableView = stableTab.dataset.stableView; renderStable(); uiClick(); return; }
  const roadTravel = e.target.closest('[data-road-travel]'); if (roadTravel) { travelTruckTo(roadTravel.dataset.roadTravel); return; }
  const assemble = e.target.closest('[data-stable-assemble]'); if (assemble) { const area = assemble.closest('.stable-empty'), name = area && area.querySelector('[data-assembly-name]'), frame = area && area.querySelector('[data-assembly-frame]'), role = area && area.querySelector('[data-assembly-role]'); assembleStableBot(assemble.dataset.stableAssemble, frame && frame.value, name && name.value, role && role.value); return; }
  const manage = e.target.closest('[data-stable-manage]'); if (manage) { stableBuildBotId = manage.dataset.stableManage; renderStable(); return; }
  const stableSelect = e.target.closest('[data-stable-select]'); if (stableSelect) { selectStableBot(stableSelect.dataset.stableSelect); return; }
  const reinforceFrame = e.target.closest('[data-frame-reinforce]'); if (reinforceFrame) { reinforceStableFrame(reinforceFrame.dataset.frameReinforce); return; }
  const o = e.target.closest('.opt');
  if (o) { const id = o.dataset.id, slot = o.dataset.slot, p = part(o.dataset.pool, id); if (!hasPartForSlot(id, slot)) tryBuy(id + '@' + slot, p.cost, p.name, () => { equipPartItem(slot, id, { create: true, pool: o.dataset.pool }); }); else { equipPartItem(slot, id, { create: S.sandbox, pool: o.dataset.pool }); pendingBuy = null; save(); rerender(); } return; }
  const rt = e.target.closest('[data-rtab]'); if (rt) { rackTab = rt.dataset.rtab; pendingBuy = null; renderRack(); return; }
  const set = (k, v) => { S[k] = v; pendingBuy = null; save(); rerender(); };
  const pa = e.target.closest('[data-paint]'); if (pa) return set('paint', pa.dataset.paint);
  const ac = e.target.closest('[data-accent]'); if (ac) return set('accent', ac.dataset.accent);
  const dc = e.target.closest('[data-decal]'); if (dc) return set('decal', dc.dataset.decal);
  const wr = e.target.closest('[data-wear]'); if (wr) return set('wear', +wr.dataset.wear);
  const st = e.target.closest('[data-style]'); if (st) return set('style', st.dataset.style);
  const pl = e.target.closest('[data-plan]'); if (pl) return set('plan', pl.dataset.plan);
  const ct = e.target.closest('[data-ctrl]'); if (ct) return set('ctrl', ct.dataset.ctrl);
  const sm = e.target.closest('[data-sigm]'); if (sm) { const k = sm.dataset.sigm, m = SIG_MOVES[k]; if (S.sigs.includes(k)) return set('sig', k); return tryBuy('sig:' + k, m.cost, m.name, () => { S.sigs.push(k); S.sig = k; }); }
  const me = e.target.closest('[data-mech]'); if (me) { const k = me.dataset.mech; if (ownsMech(k)) return set('mech', k); return tryBuy('mech:' + k, MECHS[k].cost, MECHS[k].name, () => { S.mechs.push(k); S.mech = k; }); }
  const ch = e.target.closest('[data-chip]'); if (ch) { const k = ch.dataset.chip; if (ownsChip(k)) return set('trait', k); return tryBuy('chip:' + k, TRAITS[k].cost, TRAITS[k].name + ' chip', () => { S.chips.push(k); S.trait = k; }); }
  const wk = e.target.closest('[data-walk]'); if (wk) { S.walkout = wk.dataset.walk; save(); uiClick(); renderGTab(); return; }
  const py = e.target.closest('[data-pyro]'); if (py) { S.pyro = py.dataset.pyro; save(); uiClick(); renderGTab(); return; }
  if (e.target.closest('#walkPrev')) { if (AC) { setTheme('walkout'); clearTimeout(walkPrevT); walkPrevT = setTimeout(() => { if (curScreen !== 'arena') setTheme('menu'); }, 8000); } toast(`Playing ${walkStyle().name}.`); return; }
  const gy = e.target.closest('[data-gym]'); if (gy && !gy.disabled) { openDrill(gy.dataset.gym); return; }
  const dr = e.target.closest('[data-drill]'); if (dr) { const d = DRILLS.find(x => x.id === dr.dataset.drill), r = S.training[d.id] || 0; if (r >= d.costs.length) return; return tryBuy('drill:' + d.id, d.costs[r], d.name + ' rank ' + (r + 1), () => { S.training[d.id] = r + 1; }); }
  const bn = e.target.closest('[data-bench]'); if (bn) { runBench(+bn.dataset.bench); return; }
  if (e.target.closest('#randBtn')) { randomBuild(); return; }
  if (e.target.closest('#gFight')) { openVersus('career'); return; }
});
$('#scrGarage').addEventListener('input', e => {
  const id = e.target.id;
  if (id === 'fName') { S.name = clean(e.target.value, 14); $('#gName').textContent = playerSpec().name; }
  if (id === 'fNick') { S.nick = clean(e.target.value, 22); }
  if (id === 'fHome') { S.home = clean(e.target.value, 24); }
  if (id === 'fStory') { S.story = clean(e.target.value, 140); }
  if (id === 'fNum') { S.num = clamp(Math.round(+e.target.value || 0), 0, 99); }
  $('#gNick').textContent = S.nick ? `"${S.nick}" · ${S.home}` : S.home; save();
});
$('#scrGarage').addEventListener('change', e => {
  const roleSelect = e.target.closest('[data-stable-role]');
  if (roleSelect) { const bot = (S.stable || []).find(item => item && item.id === roleSelect.dataset.stableRole); if (!bot) return; bot.role = normalizeStableRole(roleSelect.value); save(); renderStable(); renderReadout(); return; }
  const fitSelect = e.target.closest('[data-wb-fit-slot]'); if (fitSelect) { fitOwnedWorkbookPart(fitSelect.dataset.wbFitBot || S.activeBotId, fitSelect.dataset.wbFitSlot, fitSelect.value); return; }
  const planSelect = e.target.closest('[data-wb-plan-slot]'); if (!planSelect) return;
  const bot = managedStableBot(), key = planSelect.dataset.wbPlanSlot, expected = WORKBOOK_PLAN_SLOT_TYPES[key], def = WORKBOOK_PART_BY_ID[planSelect.value];
  if (!bot || !expected || (planSelect.value && (!def || def.slot !== expected))) return;
  if (!bot.workbookPlan || typeof bot.workbookPlan !== 'object' || Array.isArray(bot.workbookPlan)) bot.workbookPlan = {};
  if (planSelect.value) bot.workbookPlan[key] = def.id; else delete bot.workbookPlan[key];
  save(); renderStable();
});
function randomBuild() {
  const pick = a => a[Math.random() * a.length | 0];
  let chosen = null;
  for (let g = 0; g < 400; g++) {
    const b = {}, used = new Set(), picks = {}; let possible = true;
    for (const [slot, , pool] of SLOTS) {
      let options = S.items.filter(item => item && item.kind === 'part' && (item.location === 'stash' || item.botId === S.activeBotId && item.slot === slot) && partByAny(item.defId)?.pool === pool && !partByAny(item.defId)?.q.hidden && !used.has(item.itemId)).map(item => ({ id: item.defId, itemId: item.itemId }));
      if (slot === 'back') options.push({ id: 'none', itemId: null });
      if (!options.length) { possible = false; break; }
      const option = pick(options); b[slot] = option.id; picks[slot] = option; if (option.itemId) used.add(option.itemId);
    }
    if (possible && !statsOf(b).over) { chosen = picks; break; }
  }
  if (chosen) for (const [slot] of SLOTS) equipPartItem(slot, chosen[slot].id, { itemId: chosen[slot].itemId, create: S.sandbox });
  S.paint = pick(PAINTS)[1]; S.accent = pick(ACCENTS)[1]; S.decal = pick(DECALS)[0]; S.style = pick(Object.keys(STYLES));
  pendingBuy = null; save(); rerender(); toast('Random build bolted on.');
}
function runBench(lg) {
  if (statsOf(S.build, S.trait, partWearForBuild(S.build)).over) { toast('Fix the load limit first.', 'bad'); return; }
  const me = playerSpec(), cfg = { rounds: S.rounds, roundLen: S.len }, out = [], list = ROSTER.filter(b => b.lg === lg), open = lgOpen(lg), NB = 40;
  $$('[data-bench]').forEach(b => b.disabled = true); $('#simOut').innerHTML = ''; const t0 = performance.now(); let i = 0, n = 0, w = 0, ko = 0;
  (function next() {
    if (!$('#simOut') || curScreen !== 'garage') return;
    if (i >= list.length) { $('#simStatus').textContent = `${list.length * NB} fights in ${((performance.now() - t0) / 1000).toFixed(1)} s. Both corners on autopilot.`; $$('[data-bench]').forEach(b => b.disabled = false); return; }
    const o = list[i];
    for (let k = 0; k < 6 && n < NB; k++, n++) { const F = simulate(me, o, 500 + n * 7919 + i * 31, cfg); if (F.winner === 0) { w++; if (F.reason !== 'Decision') ko++; } }
    if (n >= NB) { const pc = Math.round(w / NB * 100); out.push(`<div class="simrow"><span>${open ? esc(o.name) : 'Locked #' + (i + 1)}</span><span class="sb"><i style="width:${pc}%"></i></span><b>${pc}% win · ${Math.round(ko / NB * 100)}% stop</b></div>`); $('#simOut').innerHTML = out.join(''); i++; n = 0; w = 0; ko = 0; }
    $('#simStatus').textContent = `Running… ${Math.min(i + 1, list.length)} of ${list.length}`; setTimeout(next, 0);
  })();
}
/* ---------- workshop ---------- */
const DEF_HD = { shell: 'box', eyes: 'twin', glow: 'amber', mouth: 'grille', crest: 'handle', mat: 'tin' };
const DEF_TD = { shell: 'drum', core: 'gauge', mat: 'tin', tag: 'HOMEMADE' };
const WS = { hd: { ...DEF_HD, ...(S.hd || {}) }, td: { ...DEF_TD, ...(S.td || {}) } };
const HD_ROWS = [['shell', 'Shell', FAB_SHELL], ['eyes', 'Eyes', FAB_EYES], ['glow', 'Glow', FAB_GLOW], ['mouth', 'Mouth', FAB_MOUTH], ['crest', 'Top piece', FAB_CREST], ['mat', 'Metal', FAB_MAT]];
const TD_ROWS = [['shell', 'Chassis', FAB_TSHELL], ['core', 'Chest core', FAB_CORE], ['mat', 'Metal', FAB_MAT]];
function optRow(kind, key, label, table, cur) {
  return `<div class="wsrow"><span>${label}</span><div class="chips">${Object.entries(table).map(([k, v]) => key === 'glow' ? `<button class="sw sm" style="background:${v}" data-fab="${kind}:${key}:${k}" aria-pressed="${cur === k}" aria-label="${k} glow" title="${k}"></button>` : `<button class="chip" data-fab="${kind}:${key}:${k}" aria-pressed="${cur === k}">${v.n}</button>`).join('')}</div></div>`;
}
function renderWorkshop() {
  const ph = registerFab('head', 'fab-draft', WS.hd, 'Draft head', true), pt = registerFab('torso', 'fabt-draft', WS.td, 'Draft chassis', true);
  refreshWallet();
  const designs = ROSTER.filter(o => o.hd || o.td);
  $('#wsPreset').innerHTML = `<option value="">Load a fighter's design…</option>` + designs.map(o => `<option value="${o.id}">${esc(o.name)} · ${LEAGUES[o.lg].name}</option>`).join('');
  $('#hdOpts').innerHTML = HD_ROWS.map(([k, l, tb]) => optRow('hd', k, l, tb, WS.hd[k])).join('');
  $('#tdOpts').innerHTML = TD_ROWS.map(([k, l, tb]) => optRow('td', k, l, tb, WS.td[k])).join('') + `<div class="wsrow"><span>Plate text</span><div><input id="tagIn" maxlength="10" value="${esc(WS.td.tag || '')}" aria-label="Number plate text"><div class="note">Shows when the chest core is a number plate.</div></div></div>`;
  $('#hdMake').textContent = S.sandbox ? 'Fabricate head · free' : `Fabricate head · ${ph.cost} scrap`;
  $('#tdMake').textContent = S.sandbox ? 'Fabricate chassis · free' : `Fabricate chassis · ${pt.cost} scrap`;
  const both = statsOf({ ...S.build, head: 'fab-draft', torso: 'fabt-draft' }, S.trait), pct = v => Math.round(v * 100) + '%';
  const hx = [ph.xcool ? `+${ph.xcool} cooling` : '', ph.showboat ? `+${pct(ph.showboat)} when ahead` : '', ph.push ? `shoves +${pct(ph.push)}` : '', ph.weld ? `welds +${pct(ph.weld)}` : ''].filter(Boolean).join(', ') || 'None';
  const kv = rows => `<table class="rt"><tbody>${rows.map(([l, v]) => `<tr><td>${l}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;
  $('#wsSpec').innerHTML = `<div class="spec2"><div><h4>Head draft</h4>${kv([['Weight', ph.w + ' kg'], ['Armor', ph.armor], ['Sensors', pct(ph.sense)], ['Head HP', ph.hp], ['Reliability', pct(ph.rel)], ['Extras', hx]])}</div>
    <div><h4>Chassis draft</h4>${kv([['Weight', pt.w + ' kg'], ['Hull', pt.hp], ['Armor', pt.armor], ['Load limit', pt.cap + ' kg'], ['Battery', pt.en], ['Regen', pt.regen + '/s'], ['Cooling', pt.cool + '×'], ['Reliability', pct(pt.rel)]])}</div></div>
    <p class="note">${both.over ? `With both fitted, your limbs load ${+both.load.toFixed(1)} kg, over this chassis's ${both.cap} kg limit.` : `With both fitted: ${+both.load.toFixed(1)} / ${both.cap} kg load, ${both.hp} hull.`} A home-built head and chassis together earn <b>Underdog</b>: +10% power while behind.</p>`;
}
function wsNote(t) { $('#wsNote').textContent = t; }
$('#scrWorkshop').addEventListener('click', e => {
  const fb = e.target.closest('[data-fab]');
  if (fb) { const [kind, key, val] = fb.dataset.fab.split(':'); WS[kind][key] = val; renderWorkshop(); return; }
  const rnd = (kind, rows) => { for (const [k, , tb] of rows) { const ks = Object.keys(tb); WS[kind][k] = ks[Math.random() * ks.length | 0]; } renderWorkshop(); };
  if (e.target.closest('#hdRand')) { rnd('hd', HD_ROWS); return; }
  if (e.target.closest('#tdRand')) { rnd('td', TD_ROWS); return; }
  const make = (slot, id, key, label) => {
    const draft = part(slot, slot === 'head' ? 'fab-draft' : 'fabt-draft');
    if (!buyable(draft.cost)) { uiError(); wsNote(`Not enough scrap. You need ${draft.cost} and have ${S.scrap}.`); return; }
    spend(draft.cost);
    S[key] = { ...WS[key] }; registerFab(slot, id, S[key], label); equipPartItem(slot, id, { create: true }); save(); renderWorkshop();
    wsNote(`${label} fabricated and fitted.`); toast(`${label} fitted to your bot.`, 'good');
  };
  if (e.target.closest('#hdMake')) make('head', 'fab-you', 'hd', 'Workshop Head');
  if (e.target.closest('#tdMake')) make('torso', 'fabt-you', 'td', 'Workshop Chassis');
});
$('#scrWorkshop').addEventListener('input', e => { if (e.target.id === 'tagIn') { WS.td.tag = e.target.value.toUpperCase().replace(/[<>&"]/g, '').slice(0, 10); registerFab('torso', 'fabt-draft', WS.td, 'Draft chassis', true); } });
$('#scrWorkshop').addEventListener('change', e => { if (e.target.id === 'wsPreset' && e.target.value) { const o = BOT(e.target.value); if (o.hd) WS.hd = { ...DEF_HD, ...o.hd }; if (o.td) WS.td = { ...DEF_TD, ...o.td }; wsPaint = { paint: o.paint, accent: o.accent }; renderWorkshop(); wsNote(`Loaded ${o.name}'s design into the draft. Tweak it, then fabricate.`); } });
let wsPaint = null, wsK = 1;
function drawWs(ts) {
  const t = ts / 1000, cv = $('#wsCanvas'), c = cv.getContext('2d'); c.setTransform(wsK, 0, 0, wsK, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, 380); g.addColorStop(0, '#2a2420'); g.addColorStop(1, '#17140f'); c.fillStyle = g; c.fillRect(0, 0, 560, 380);
  c.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 14; y < 320; y += 16) for (let x = 14; x < 300; x += 16) { c.beginPath(); c.arc(x, y, 1.5, 0, 7); c.fill(); }
  const lg = c.createRadialGradient(150, 110, 10, 150, 200, 260); lg.addColorStop(0, 'rgba(255,200,120,.22)'); lg.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = lg; c.fillRect(0, 0, 560, 380);
  c.fillStyle = '#3a2e22'; c.fillRect(0, 342, 560, 38); c.fillStyle = '#4a3a2a'; c.fillRect(0, 338, 560, 6);
  const b = { ...S.build, head: 'fab-draft', torso: 'fabt-draft' }, ps = previewState(t, S.style, S.build), paint = wsPaint ? wsPaint.paint : S.paint, acc = wsPaint ? wsPaint.accent : S.accent;
  drawRobot(c, { st: ps.st, build: b, paint, accent: acc, decal: S.decal, num: S.num, wear: S.wear, wseed: 4242, x: 140, ground: 340, dir: 1, scale: 1, pose: poseFrom(ps.st, ps.p, ps.punch, t, 0, 0), t });
  c.fillStyle = 'rgba(10,11,13,.62)'; rr(c, 306, 18, 238, 248, 10); c.fill(); c.strokeStyle = 'rgba(240,178,10,.45)'; c.lineWidth = 1.5; c.stroke();
  c.fillStyle = '#8f969d'; c.font = '500 11px "IBM Plex Mono", monospace'; c.fillText('HEAD CLOSE-UP', 320, 38);
  const hs = (FAB_SHELL[WS.hd.shell] || FAB_SHELL.box).s;
  c.save(); c.translate(424, 206); c.scale(2.4, 2.4); drawHead(c, hs, 'fab-draft', paint, { dmg: { head: 1, glitch: false, heat: 0, hpF: 1 }, mood: 'neutral' }, t); c.restore();
  c.fillStyle = '#ebe7de'; c.font = '600 20px Teko, sans-serif'; c.fillText(`${FAB_MAT[WS.hd.mat].n} · ${FAB_SHELL[WS.hd.shell].n} · ${FAB_EYES[WS.hd.eyes].n}`, 320, 256, 216);
  c.fillStyle = 'rgba(235,231,222,.6)'; c.font = '500 12px "IBM Plex Mono", monospace'; c.fillText(`${FAB_TSHELL[WS.td.shell].n.toUpperCase()} · ${FAB_CORE[WS.td.core].n.toUpperCase()}`, 320, 300); c.fillText(`${FAB_MAT[WS.td.mat].n.toUpperCase()} CHASSIS`, 320, 318);
  wsRaf = requestAnimationFrame(drawWs);
}
function startWs() { wsK = sizeCanvas($('#wsCanvas'), 560, 380).k; cancelAnimationFrame(wsRaf); wsRaf = requestAnimationFrame(drawWs); }
/* ---------- bot index ---------- */
function mainMaker(b) { const c = {}; SLOTS.slice(0, 5).forEach(([k, , pool]) => { const m = part(pool, b[k]).b; c[m] = (c[m] || 0) + 1; }); return Object.entries(c).sort((x, y) => y[1] - x[1])[0][0]; }
function initIndex() {
  $('#fLeague').innerHTML = '<option value="all">All leagues</option>' + LEAGUES.map((L, i) => `<option value="${i}">${L.name}</option>`).join('');
  $('#fMaker').innerHTML = '<option value="all">All makers</option>' + Object.entries(BRANDS).map(([k, b]) => `<option value="${k}">${b.name}</option>`).join('');
  $('#fStyle').innerHTML = '<option value="all">All styles</option>' + Object.entries(STYLES).map(([k, st]) => `<option value="${k}">${st.name}</option>`).join('');
  ['#fLeague', '#fMaker', '#fStyle'].forEach(sel => $(sel).addEventListener('change', renderIndex));
  const nk = o => Object.keys(o).length, fabH = nk(FAB_SHELL) * nk(FAB_EYES) * nk(FAB_GLOW) * nk(FAB_MOUTH) * nk(FAB_CREST) * nk(FAB_MAT), fabT = nk(FAB_TSHELL) * nk(FAB_CORE) * nk(FAB_MAT);
  const fh = PARTS.head.filter(q => q.b !== 'GB').length, ft = PARTS.torso.filter(q => q.b !== 'GB').length;
  const total = LEGAL * (fh + fabH) / fh * (ft + fabT) / ft * nk(TRAITS) * nk(STYLES) * nk(MECHS) * PAINTS.length * ACCENTS.length * DECALS.length * WEARS.length;
  $('#indexIntro').innerHTML = `${ROSTER.length} registered fighters across ${LEAGUES.length} leagues. Counting parts, the Workshop, chips, styles, crews, paint and wear, there are about <b>${Number(total.toPrecision(3)).toLocaleString()}</b> possible bots.`;
}
function renderIndex() {
  const fl = $('#fLeague').value, fm = $('#fMaker').value, fs = $('#fStyle').value;
  const list = ROSTER.filter(o => (fl === 'all' || o.lg === +fl) && (fm === 'all' || mainMaker(o.build) === fm) && (fs === 'all' || o.style === fs));
  $('#dex').innerHTML = list.map(o => {
    const st = statsOf(o.build, o.trait), open = botOpen(o.id), beat = S.wins.includes(o.id);
    return `<article class="card"><canvas width="500" height="340" data-por="${o.id}" aria-label="${esc(o.name)}"></canvas><div class="cb">
      <div class="ct"><span>${LEAGUES[o.lg].name} · ${o.home}</span><span>${o.rec}${beat ? ' · <span class="beat">beaten</span>' : ''}</span></div>
      <h3>${esc(o.name)}</h3><p class="lore">${o.lore}</p>
      <p class="sigl"><b>${o.signature.name}</b> · ${o.signature.tell}</p>
      <div class="tags">${SLOTS.filter(([k]) => !(k === 'back' && o.build.back === 'none') && !(k === 'rear' && o.build.rear === o.build.lead)).map(([k, , pool]) => { const p = part(pool, o.build[k]), br = BRANDS[p.b]; return `<span class="tag"><i style="background:${br ? br.col : '#5b626a'}"></i>${esc(p.name)}${k === 'lead' && o.build.rear === o.build.lead ? ' ×2' : ''}</span>`; }).join('')}</div>
      <div class="tags"><span class="tag k">${STYLES[o.style].name}</span><span class="tag k">${TRAITS[o.trait].name}</span><span class="tag">${MECHS[o.mech].name}</span><span class="tag">${WEARS[o.wear][0]}</span>${st.set ? `<span class="tag">${BRANDS[st.set].name} set</span>` : ''}${st.heart ? '<span class="tag k">Garage-built</span>' : ''}</div>
      <div class="mstats"><span><b>${st.hp}</b>Hull</span><span><b>${st.power.toFixed(1).replace('.0', '')}</b>Power</span><span><b>${st.aspd.toFixed(2)}</b>Speed</span><span><b>${st.reach}</b>Reach</span></div>
      <div class="acts"><button class="small-btn" data-copy="${o.id}">Copy look</button><button class="small-btn" data-exh="${o.id}">Exhibition</button><button class="small-btn pri" data-fightbot="${o.id}" ${open ? '' : 'disabled'}>${open ? 'Career fight' : 'League locked'}</button></div>
    </div></article>`; }).join('') || '<p class="note">No bots match those filters.</p>';
  paintPortraits($('#dex'));
}
$('#scrIndex').addEventListener('click', e => {
  const c = e.target.closest('[data-copy]');
  if (c) {
    const o = BOT(c.dataset.copy); S.paint = o.paint; S.accent = o.accent; S.decal = o.decal === 'tally' ? 'tally' : o.decal; if (o.num != null) S.num = o.num; S.wear = o.wear; S.style = o.style;
    const locked = []; for (const [k] of SLOTS) { const id = o.build[k]; if (String(id).startsWith('fab') || id === 'none') continue; if (hasPartForSlot(id, k)) equipPartItem(k, id, { create: S.sandbox }); else locked.push(partByAny(id)?.q.name || id); }
    if (o.hd) WS.hd = { ...DEF_HD, ...o.hd }; if (o.td) WS.td = { ...DEF_TD, ...o.td }; if (o.hd || o.td) wsPaint = null;
    save(); toast(o.hd || o.td ? `Copied ${o.name}'s look. Owned parts were fitted; its custom head and chassis are loaded in the Workshop draft.` : locked.length ? `Copied ${o.name}'s look. ${locked.length} parts need to be bought before fitting.` : `Copied ${o.name}'s look and fitted the parts in your stash.`, 'good');
    showScreen(o.hd || o.td ? 'workshop' : 'garage'); return;
  }
  const x = e.target.closest('[data-exh]'); if (x) { openVersus('exh', { a: VS.a && VS.a !== x.dataset.exh ? VS.a : 'you', b: x.dataset.exh }); return; }
  const f = e.target.closest('[data-fightbot]');
  if (f && !f.disabled) { S.opp = f.dataset.fightbot; save(); if (!canFight()) { showScreen('garage'); toast('Your current build has locked parts or is over the load limit.', 'bad'); return; } showScreen('career'); return; }
});
/* ---------- career hub ---------- */
let hubLg = 0, hubK = 1;
function streak() { let n = 0, w = null; for (let i = S.history.length - 1; i >= 0; i--) { const h = S.history[i]; if (w === null) w = h.win; if (h.win !== w) break; n++; } return n ? `${n} ${w ? 'win' : 'loss'}${n > 1 ? (w ? 's' : 'es') : ''} in a row` : 'No fights yet'; }
let carSel = 0, carPanel = '', hubWc = 'all';
function renderEvent() {
  const el = $('#hubEvent'); if (!el) return; const ev0 = S.event && EVENTS.find(x => x.id === S.event.id); if (!ev0) { el.innerHTML = '<p class="note">Nothing happening. Quiet week at the garage.</p>'; return; }
  const d = S.event.d; el.innerHTML = `<div class="evcard"><small>Between fights</small><h4>${ev0.title}</h4><p>${esc(ev0.text(d))}</p><div class="evbtns"><button class="btn primary" data-ev="yes">${esc(ev0.yes(d))}</button>${ev0.no ? `<button class="btn ghost" data-ev="no">${ev0.no}</button>` : ''}</div></div>`;
}
function renderMarket() {
  const el = $('#hubMarket'); if (!el) return; if (!S.market) refreshMarket(); refreshWorkbookMarket();
  const deals = S.market.items.filter(it => !owns(it.id)).map(it => { const q = part(it.pool, it.id); if (!q) return ''; return `<div class="mrow"><span class="rdot" style="--rc:${RARITY[rarityOf(q)].col}"></span><div><b>${esc(q.name)}</b><small>${it.pool} · used · ${esc(q.note || '')} · new price ${q.cost}</small></div><button class="small-btn gym" data-mbuy="${it.id}">Buy · ${it.price}</button></div>`; }).join('') || '<p class="note">Sold out. New stock arrives after your next fight.</p>';
  const workbookDeals = S.workbookMarket.items.map(offer => { const def = WORKBOOK_PART_BY_ID[offer.defId]; if (!def) return ''; return `<div class="mrow"><span class="rdot" style="--rc:${workbookRarityColor(def)}"></span><div><b>${esc(def.name)}</b><small>${esc(def.phase1BFactionCode || 'Faction')} · ${esc(def.tier)} ${esc(def.rarity)} · ${esc(def.maker)} · ${esc(def.whereToFind || 'Vendor stock')}</small></div><button class="small-btn gym" data-wb-buy="${esc(def.id)}">Buy · ${offer.price}</button></div>`; }).join('') || '<p class="note">Faction vendors are sold out for today. Stock rotates after a rest day.</p>';
  const tunes = ['head', 'torso', 'lead', 'rear', 'legs'].map(slot => { const id = S.build[slot] || normBuild({ ...S.build })[slot], x = id && partByAny(id), item = activePartItem(slot, id); if (!x) return ''; const lv = item ? item.tune : S.tune[id] || 0, worn = partIsWorn(slot, id), itemKey = item ? item.itemId : id; return `<div class="mrow"><span class="tlv">${'★'.repeat(lv)}${'☆'.repeat(2 - lv)}</span><div><b>${esc(x.q.name)}</b><small>${ZONE_NAME[slot] || slot}${worn ? ' · <em class="worn">worn: may start fights with a fault</em>' : ''}</small></div><div class="mbt">${worn ? `<button class="small-btn" data-refurb="${itemKey}">Refurbish · ${Math.round((x.q.cost || 100) * .25)}</button>` : ''}${lv < 2 ? `<button class="small-btn gym" data-tune="${itemKey}">Tune +${lv + 1} · ${tuneCost(x.q, lv)}</button>` : '<span class="note">Maxed</span>'}</div></div>`; }).join('');
  const legacySpares = S.items.filter(item => item && item.kind === 'part' && item.location === 'stash').map(item => { const x = partByAny(item.defId); if (!x || x.q.cost <= 0) return ''; const value = partSellValue(item); return `<div class="mrow"><span class="rdot" style="--rc:${RARITY[rarityOf(x.q)].col}"></span><div><b>${esc(x.q.name)}</b><small>${x.pool}${item.worn ? ' · worn' : ''} · Condition ${Math.round(item.state.condition)}%</small></div><button class="small-btn" data-msell="${item.itemId}">${pendingBuy === 'sell' + item.itemId ? 'Tap again' : `Sell · ${value}`}</button></div>`; }).filter(Boolean).join('');
  const workbookSpares = S.items.filter(item => item && item.kind === 'workbook-part' && item.location === 'stash' && WORKBOOK_PART_BY_ID[item.defId]?.tradeable === 'Yes').map(item => { const def = WORKBOOK_PART_BY_ID[item.defId]; if (!def) return ''; const value = workbookVendorSellValue(item), condition = Math.round(item.state?.condition ?? 0), integrity = Math.round(item.state?.integrity ?? 0); return `<div class="mrow"><span class="rdot" style="--rc:${workbookRarityColor(def)}"></span><div><b>${esc(def.name)}</b><small>${esc(def.phase1BFactionCode || 'Faction')} · ${esc(def.tier)} · Condition ${condition}% · Integrity ${integrity}%</small></div><button class="small-btn" data-wb-sell="${esc(item.itemId)}">${pendingBuy === 'wb-sell' + item.itemId ? 'Tap again' : `Sell · ${value}`}</button></div>`; }).join('');
  const spare = [legacySpares, workbookSpares].filter(Boolean).join('') || '<p class="note">No spare parts. Everything you own is bolted on.</p>';
  el.innerHTML = `<h5 class="mh">Workbench · tune what you run</h5><p class="note">Each tuning level adds 4% to that part's stats.</p>${tunes}<h5 class="mh">Used parts · new stock after every fight</h5><p class="note">Under half price, but worn parts sometimes start a fight with a fault. Refurbish them to fix that.</p>${deals}<h5 class="mh">Faction vendors · daily stock</h5><p class="note">New stock every day. Purchases go to your stash.</p>${workbookDeals}<h5 class="mh">Sell spares</h5>${spare}`;
}
function renderTourney() {
  const el = $('#hubTourney'); if (!el) return; const T = S.tourney, lg = T ? T.lg : tourneyLg();
  if (!T) { el.innerHTML = `<p class="note">An 8-bot knockout weekend in the ${LEAGUES[lg].name} league. Three fights in a row: quarter-final, semi-final, final. Damage carries between rounds, so use the Repair bay. There's no purse per bout; prizes are paid by how far you get.</p><div class="tprize"><span>Semi-final loss <b>${Math.round(tPurse(lg) * .6)}</b></span><span>Final loss <b>${Math.round(tPurse(lg) * 1.5)}</b></span><span>Winner <b>${tPurse(lg) * 4}</b></span></div><button class="btn primary" data-tstart>Enter the ${LEAGUES[lg].name} Open · fee ${tFee(lg)}</button>`; return; }
  const names = ['Quarter-finals', 'Semi-finals', 'Final'], cell = (id, w) => `<span class="tb${id === 'you' ? ' you' : ''}${w && w !== id ? ' out' : ''}${w === id ? ' win' : ''}">${esc(tName(id))}</span>`;
  const cols = [0, 1, 2].map(r => `<div class="tcol"><small>${names[r]}</small>${(T.rounds[r] || Array.from({ length: [4, 2, 1][r] }, () => null)).map(m => m ? `<div class="tm">${cell(m.a, m.w)}${cell(m.b, m.w)}</div>` : '<div class="tm"><span class="tb tbd">TBD</span><span class="tb tbd">TBD</span></div>').join('')}</div>`).join('');
  const opp = tourneyOpp();
  el.innerHTML = `<p class="note">${LEAGUES[T.lg].name} Open${T.done ? ` · winner: <b>${esc(tName(T.champ))}</b>` : ''}</p><div class="bracket">${cols}<div class="tcol"><small>Champion</small><div class="tm"><span class="tb${T.champ === 'you' ? ' you win' : ''}">${T.done ? '🏅 ' + esc(tName(T.champ)) : '?'}</span></div></div></div>
    ${T.done ? `<button class="btn" data-tclear>Close the bracket</button>` : opp ? `<button class="btn primary" data-tfight ${canFight() ? '' : 'disabled'}>${canFight() ? `Fight ${names[T.r].toLowerCase().replace(/s$/, '')}: ${esc(tName(opp))}` : 'Repair torn-off parts first'}</button>` : ''}`;
}
function renderSponsor() {
  const el = $('#hubSponsor'); if (!el) return; const cur = sponsorOf();
  const card = (x, active) => `<div class="spcard${active ? ' on' : ''}${x.req() ? '' : ' locked'}" style="--sc:${x.col}"><span class="sptag">${x.tag}</span><div><b>${esc(x.name)}</b><small>${esc(x.goal)} · <em>${x.pay} scrap</em> each time</small>${active ? `<small>${S.sponsor.left} of ${CONTRACT_LEN} fights left · ${x.pay * 2} completion bonus</small>` : x.req() ? `<small>${CONTRACT_LEN}-fight deal · ${x.pay} scrap to sign · ${x.pay * 2} completion bonus</small>` : `<small>Needs: ${x.reqTxt}</small>`}</div>
    ${active ? `<button class="small-btn" data-spdrop>${pendingBuy === 'spdrop' ? 'Tap again' : 'Drop'}</button>` : !cur && x.req() ? `<button class="small-btn gym" data-spsign="${x.id}">Sign</button>` : ''}</div>`;
  el.innerHTML = `<p class="note">One sponsor at a time. Each career fight they pay when you hit their goal, win or lose. Finish all ${CONTRACT_LEN} fights for a completion bonus. Their patch goes on your walkout card.</p>${cur ? card(cur, true) : ''}${SPONSORS.filter(x => !cur || x.id !== cur.id).map(x => card(x, false)).join('')}`;
}
function renderTrophies() {
  const el = $('#hubTrophies'); if (!el) return;
  const discovered = evaluateWorkbookAchievements({ type:'state', announce:false }); if (discovered.length) save(); const earnedWorkbook = WORKBOOK_ACHIEVEMENTS.filter(row => S.workbookAchievements[row.id]).length; el.innerHTML = `<p class="note">${Object.keys(S.trophies).length} of ${TROPHIES.length} trophies on the shelf.</p><div class="shelf">${TROPHIES.map(([id, ic, nm, d]) => { const got = !!S.trophies[id]; return `<div class="trophy${got ? ' got' : ''}"><i>${got ? ic : '?'}</i><b>${got ? nm : '???'}</b><small>${d}</small></div>`; }).join('')}</div><h4 class="mh">Career achievements · ${earnedWorkbook}/${WORKBOOK_ACHIEVEMENTS.length}</h4><div class="shelf">${WORKBOOK_ACHIEVEMENTS.map(row => { const earned = S.workbookAchievements[row.id], note = earned ? `Unlocked · Day ${earned.day || 1}` : row.pending ? 'Coming later' : 'Not earned yet'; return `<div class="trophy${earned ? ' got' : ''}"><i>${row.icon}</i><b>${row.name}</b><small>${row.condition}</small><small>${esc(note)}</small></div>`; }).join('')}</div>`;
}
const CP_TITLES = { market: 'Scrap market', scrapworks: 'Scrapworks', progression: 'Salvage progression', tourney: 'Tournament', event: 'Between fights', sponsor: 'Sponsors', trophies: 'Trophy shelf', rank: 'Rankings', repair: 'Repair bay', rivals: 'Rivals', belts: 'Belts', hist: 'Fight history', next: 'Scouting report' };
function renderScrapworks() {
  const now = Date.now(); workbookReconcileCraftOrders(now);
  const orderRows = (S.workbookCraftOrders || []).slice(-8).reverse();
  const workOrders = orderRows.length ? orderRows.map(order => { const recipe = WORKBOOK_CRAFTING_RECIPE_DEFS.find(row => row.id === order.recipeId), output = recipe?.output || order.outputMaterial, isReady = order.status === 'ready', isClaimed = order.status === 'claimed', state = isClaimed ? `Collected · ${new Date(order.claimedAt || order.readyAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}` : isReady ? 'Ready to collect' : `${now < order.startedAt ? 'Queued' : 'Working'} · ${workbookCraftOrderEta(order, now)}`; return `<div class="mrow"><div><b>${esc(output)}</b><small>${esc(state)}</small></div>${isReady ? `<div class="mbt"><button class="small-btn pri" data-craft-claim="${esc(order.id)}">Collect</button></div>` : ''}</div>`; }).join('') : '<p class="note">No work orders yet.</p>';
  const materialRow = material => { const count = workbookMaterialCount(material.id); return `<div class="mrow" title="${esc(material.uses)}"><div><b>${esc(material.name)}</b><small>${esc(material.family)} · Tier ${material.tier}</small></div><span>${count}</span></div>`; };
  const recipeRow = recipe => { const inputs = [...recipe.inputs.map(([id,count]) => `${count} ${WORKBOOK_MATERIAL_BY_ID[id]?.name || id}`), ...(recipe.otherInputs || [])]; if (recipe.scrapPowerFee) inputs.push(`${recipe.scrapPowerFee} Scrap power fee`); if (recipe.scrapCostRange) inputs.push(`${recipe.scrapCostRange[0]}–${recipe.scrapCostRange[1]} Scrap`); const active = ['CR-01','CR-02','CR-06'].includes(recipe.id), blocker = active ? workbookCraftRecipeBlocker(recipe) : '', canStart = active && !blocker, action = active ? `<button class="small-btn pri" data-craft-start="${esc(recipe.id)}" ${canStart ? '' : 'disabled'}>${S.sandbox ? 'Start · Sandbox instant' : canStart ? `Start ${recipe.minutes} min order` : esc(blocker)}</button>` : ''; return `<div class="mrow" title="${esc(recipe.note)}"><div><b>${esc(recipe.output)}</b><small>${esc(inputs.length ? inputs.join(', ') : 'See recipe note')} · ${recipe.minutes ? `${recipe.minutes} min` : 'instant'}</small></div>${action ? `<div class="mbt">${action}</div>` : ''}</div>`; };
  const ownedMaterials = WORKBOOK_MATERIAL_DEFS.filter(material => workbookMaterialCount(material.id) > 0), usableRecipes = WORKBOOK_CRAFTING_RECIPE_DEFS.filter(recipe => ['CR-01','CR-02','CR-06'].includes(recipe.id));
  const partRows = partWorkItems().filter(item => item.location === 'stash' || !overhaulBlocker(item) || overhaulBlocker(item).startsWith('Needs')).sort((a, b) => a.state.integrity - b.state.integrity).map(item => {
    const info = partWorkInfo(item), blocker = overhaulBlocker(item), spare = item.location === 'stash', cost = blocker ? 0 : overhaulQuote(item).total, returned = spare ? Object.entries(dismantleYield(item)).map(([id, count]) => `${count} ${WORKBOOK_MATERIAL_BY_ID[id].name}`).join(', ') : '';
    return `<div class="mrow"><div><b>${esc(info.name)}</b><small>${spare ? 'Spare' : 'Fitted'} · Integrity ${Math.round(item.state.integrity)} · Overhauls ${item.state.overhauls}/${PART_WORK_RULES.overhaul.maxPerPart}${blocker ? ` · ${esc(blocker)}` : ''}</small></div><div class="mbt">${blocker ? '' : `<button class="small-btn gym" data-part-overhaul="${esc(item.itemId)}" title="+${PART_WORK_RULES.overhaul.integrity} Integrity">Overhaul · ${cost}</button>`}${spare ? `<button class="small-btn" data-part-dismantle="${esc(item.itemId)}" title="Returns ${esc(returned)}">${pendingBuy === 'dismantle' + item.itemId ? 'Tap again' : 'Dismantle'}</button>` : ''}</div></div>`;
  }).join('');
  const partsPanel = partRows ? `<h4 class="mh">Your parts</h4><p class="note">Overhaul restores Integrity. Dismantle turns a spare into materials.</p>${partRows}` : '';
  const rebuildable = (S.stable || []).filter(bot => bot && bot.wreckStatus === 'salvageable');
  const rebuilds = rebuildable.map(bot => `<article class="evcard"><small>Salvageable fight wreck · ${esc(bot.lastWreck?.opponent || 'Opponent')}</small><h4>${esc(bot.name || 'Unnamed Bot')}</h4><p>60% of fitted part value is ${+bot.lastWreck?.rebuildScrapCost || 0} Scrap plus materials and one in-game day. Rebuilding is not available yet.</p><button class="small-btn" disabled>Not available yet</button></article>`).join('');
  const rebuildSection = `${rebuilds ? `<h4 class="mh">Wreck recovery</h4>${rebuilds}` : ''}`;
  $('#hubScrapworks').innerHTML = `${rebuildSection}<div class="wbplan-kpis"><div><small>Patch kits</small><b>${S.consumables.patchKit}</b></div><div><small>Materials</small><b>${Object.values(S.materials).reduce((sum, count) => sum + Math.max(0, +count || 0), 0)}</b></div></div>${partsPanel}<h4 class="mh">Your materials</h4>${ownedMaterials.length ? `<div class="lrows">${ownedMaterials.map(materialRow).join('')}</div>` : '<p class="lockmsg">Nothing yet. Salvage runs fill this up.</p>'}${orderRows.length ? `<h4 class="mh">Work orders</h4><div class="lrows">${workOrders}</div>` : ''}<h4 class="mh">Make</h4><div class="lrows">${usableRecipes.map(recipeRow).join('')}</div><details class="sect"><summary>All materials · ${WORKBOOK_MATERIAL_DEFS.length}</summary><div class="lrows">${WORKBOOK_MATERIAL_DEFS.map(materialRow).join('')}</div></details><details class="sect"><summary>All recipes · ${WORKBOOK_CRAFTING_RECIPE_DEFS.length}</summary><div class="lrows">${WORKBOOK_CRAFTING_RECIPE_DEFS.map(recipeRow).join('')}</div></details>`;
}
$('#hubScrapworks').addEventListener('click', e => {
  const overhaul = e.target.closest('[data-part-overhaul]'); if (overhaul) { if (overhaulPart(overhaul.dataset.partOverhaul)) { uiConfirm(); toast('Overhauled. Integrity restored.', 'good'); renderScrapworks(); renderCareer(); } return; }
  const dismantle = e.target.closest('[data-part-dismantle]'); if (dismantle) { const id = dismantle.dataset.partDismantle; if (pendingBuy === 'dismantle' + id) { pendingBuy = null; if (dismantlePart(id)) { uiConfirm(); toast('Dismantled for materials.', 'good'); } } else pendingBuy = 'dismantle' + id; renderScrapworks(); return; }
  const start = e.target.closest('[data-craft-start]');
  if (start) { const recipe = WORKBOOK_CRAFTING_RECIPE_DEFS.find(row => row.id === start.dataset.craftStart), order = workbookStartCraftOrder(start.dataset.craftStart); if (!order) { toast(`Cannot start ${recipe?.output || 'recipe'}: ${workbookCraftRecipeBlocker(recipe)}.`); return; } renderScrapworks(); refreshWallet(); toast(S.sandbox ? `Sandbox ${recipe.output} order is ready to collect.` : `${recipe.output} order started at the ${recipe.station}.`, 'good'); return; }
  const claim = e.target.closest('[data-craft-claim]');
  if (claim) { const order = S.workbookCraftOrders.find(row => row.id === claim.dataset.craftClaim), recipe = WORKBOOK_CRAFTING_RECIPE_DEFS.find(row => row.id === order?.recipeId); if (!workbookClaimCraftOrder(claim.dataset.craftClaim)) { toast('That work order is not ready to collect.'); return; } renderScrapworks(); toast(`${recipe?.output || 'Crafted material'} added to Scrapworks.`, 'good'); }
});
window.setInterval(() => { if (!(S.workbookCraftOrders || []).some(order => order.status === 'working')) return; if (workbookReconcileCraftOrders() && curScreen === 'career' && carPanel === 'scrapworks') renderScrapworks(); }, 1000);
function renderWorkbookProgression() {
  const state = workbookRankState(), current = state.current, pct = Math.round(state.progressXP / current.xpToNext * 100);
  const rows = WORKBOOK_PROGRESSION_DEFS.map(row => `<div class="lrow${row.rank === state.rank ? ' on' : ''}"><span class="rk">R${row.rank}</span><span class="ln"><b>${esc(row.unlock)}</b><small>${row.rank === 1 ? 'Career start' : `Reached at ${WORKBOOK_PROGRESSION_DEFS[row.rank - 2].cumulativeXP.toLocaleString()} XP`} · next threshold ${row.cumulativeXP.toLocaleString()} XP</small>${row.online ? `<small>${esc(row.online.join(' · '))}</small>` : ''}</span><em>${row.xpToNext.toLocaleString()} XP</em></div>`).join('');
  const nextRankText = current.rank < WORKBOOK_PROGRESSION_DEFS.length ? `Rank ${current.rank + 1}` : 'Next rank';
  const conveyorOpen = workbookCanEnterDistrict('dead-conveyor');
  $('#hubProgression').innerHTML = `<p class="note">Earn XP from fights and from extracting on salvage runs.</p><div class="evcard"><small>Salvage rank</small><h4>Rank ${state.rank} · ${state.totalXP.toLocaleString()} total XP</h4><p>${state.progressXP.toLocaleString()} / ${current.xpToNext.toLocaleString()} XP toward ${nextRankText} · ${current.cumulativeXP.toLocaleString()} XP threshold</p><div class="cbar2"><i style="width:${pct}%"></i></div><p class="note">${conveyorOpen ? 'Dead Conveyor is open.' : `Dead Conveyor locked · Rank 3 requires ${WORKBOOK_PROGRESSION_DEFS[2].cumulativeXP.toLocaleString()} total XP.`}</p></div><h4 class="mh">Rank unlocks</h4><div class="lrows">${rows}</div>`;
}
const HUB_GROUPS = [
  { id: 'fight', label: 'Fight', tiles: ['rank', 'tourney', 'rivals', 'belts'] },
  { id: 'garage', label: 'Garage', tiles: ['garage', 'repair', 'market', 'scrapworks'] },
  { id: 'salvage', label: 'Salvage', tiles: ['salvage', 'progression'] },
  { id: 'record', label: 'Record', tiles: ['hist', 'sponsor', 'trophies'] }
];
let hubGroup = 'fight';
function applyHubGroups() {
  const box = $('#cTiles'), group = HUB_GROUPS.find(row => row.id === hubGroup) || HUB_GROUPS[0];
  box.querySelectorAll('.ctile:not(.next)').forEach(tile => { if (!group.tiles.includes(tile.dataset.tile)) tile.remove(); });
  const alert = { garage: repairTotal() > 0 || repairBlocksFight(), salvage: S.workbookRun?.status === 'active' };
  $('#hubFight').insertAdjacentHTML('afterend', `<div class="hubGroups" role="tablist">${HUB_GROUPS.map(row => `<button role="tab" data-hub-group="${row.id}" aria-selected="${row.id === group.id}">${row.label}${alert[row.id] ? '<i></i>' : ''}</button>`).join('')}</div>`);
}
function renderCareer() {
  if (!botOpen(S.opp)) S.opp = (nextBot() || ROSTER[0]).id; refreshWallet(); makeGrain();
  const P = playerSpec(), o = BOT(S.opp), st = statsOf(S.build, S.trait, partWearForBuild(S.build)), so = statsOf(o.build, o.trait), venue = S.venue !== 'auto' && VENUES[S.venue] ? S.venue : (o.venue || LEAGUE_VENUE[o.lg]);
  hubLg = clamp(hubLg, 0, LEAGUES.length - 1);
  const spn = sponsorOf(), belts = Object.keys(S.belts).map(Number), topLg = LEAGUES.reduce((m, L, i) => lgOpen(i) ? i : m, 0);
  const salvageRank = workbookRankState();
  $('#carSub').textContent = `${LEAGUES[topLg].name} league · ${streak()}`;
  $('#hubMeTxt').innerHTML = `<small>${P.nick ? `"${esc(P.nick)}" · ` : ''}from ${esc(P.home)}</small><span class="cname">${esc(P.name)}</span>
    <div class="crow"><span class="covr"><b>${ovrOf(P)}</b>OVR</span><span class="crec"><b>${S.rec.w}–${S.rec.l}</b>${S.rec.ko} KO · ${S.rec.des} destroyed</span><span class="crec"><b>${weightClass(P).replace('weight', '')}</b>weight</span></div>
    ${spn ? `<div class="cspon">Sponsored by <span class="sptag" style="--sc:${spn.col}">${spn.tag}</span></div>` : ''}${belts.length ? `<div class="cbelts">${belts.map(lg => `<span>🏆 ${BELTS[lg]}</span>`).join('')}</div>` : ''}
    <p class="cstory">${esc(P.story)}</p>
    <div class="cbtns"><button class="small-btn" data-go="garage">Garage</button><button class="small-btn" data-go="workshop">Workshop</button><div class="seg tiny"><button data-hctrl="coach" aria-pressed="${S.ctrl === 'coach'}">Coach</button><button data-hctrl="pilot" aria-pressed="${S.ctrl === 'pilot'}">Pilot</button></div></div>`;
  $('#carCtrl').textContent = S.ctrl === 'pilot' ? 'Pilot' : 'Coach';
  const lastVs = S.history.filter(h => h.opp === o.id).pop(), bk = boutKind(o.id), rv = rivalOf(o.id), hh = h2hOf(o.id), ok = canFight();
  const nm = o.name.split(' '), last = nm.length > 1 ? nm.pop() : nm[0], first = nm.length && o.name.includes(' ') ? nm.join(' ') : '';
  const rivs = Object.keys(S.rivals).filter(id => rivalOf(id) && BOT(id)).sort((x, y) => S.rivals[y].heat - S.rivals[x].heat), d = dmgAvg(), tot = repairTotal(), needsRepair = PART_STATE_SLOTS.some(slot => repairNeeded(slot) || partStateFor(slot).integrity < REPAIR_THRESHOLD), last1 = S.history[S.history.length - 1];
  const cdv = wcIx(o) - wcIx(P);
  const tile = (id, label, big, sub, extra = '') => `<button class="ctile t-${id}" data-tile="${id}"><small>${label}</small><b>${big}</b><span>${sub}</span>${extra}</button>`;
  $('#cTiles').innerHTML = `<button class="ctile next${ok ? '' : ' blocked'}" data-tile="next" id="hubFight"><canvas width="420" height="300" data-por="${o.id}"></canvas><div class="cninfo">
      <small>Next fight · ${LEAGUES[o.lg].name}${bk ? ` · <em class="tb">${bk.kind === 'title' ? 'Title fight' : 'Title defence'}</em>` : ''}${rv ? ` · <em class="gb">Grudge ${'🔥'.repeat(rv.heat)}</em>` : ''}</small>
      ${first ? `<span class="cn1">${esc(first)}</span>` : ''}<span class="cn2">${esc(last)}</span>
      <span class="cnl">${o.rec} · ${weightClass(o)} · ${STYLES[o.style].name} · OVR ${ovrOf(o)} · ${VENUES[venue].name}</span>${cdv ? `<span class="cnl ${cdv > 0 ? 'up' : 'down'}">${cdv > 0 ? `Fighting up a class · +${25 * cdv}% purse` : `Fighting down a class · −${15 * -cdv}% purse`}</span>` : ''}
      ${ok && repairState('head').condition < 15 ? '<span class="cnl down">Head broken: one clean hit ends the fight</span>' : ''}${rv ? `<q>${esc(rivalTaunt(o.id))}</q>` : lastVs ? `<span class="cnl dim">Last time: ${lastVs.win ? 'you won' : 'you lost'} by ${lastVs.how.toLowerCase()}</span>` : `<span class="cnl dim">${esc(o.scout.split('.')[0])}.</span>`}
      <span class="cgo"><b>${Math.round(botPurse(o) * (bk ? (bk.kind === 'title' ? 1.75 : 1.4) : 1))}</b> purse <i>${ok ? 'Walk out ›' : repairBlocksFight() ? 'Repair first ›' : 'Fix build ›'}</i></span></div></button>`
    + tile('rank', 'Rankings', LEAGUES[hubLg].name, S.belts[hubLg] ? `You hold the ${BELTS[hubLg]}` : titleReady(hubLg) ? `Title shot open vs ${esc(champOf(hubLg).name)}` : `Title shot ${lgWins(hubLg)}/${TITLE_NEED} wins`)
    + tile('repair', 'Repair bay', Math.round((1 - d) * 100) + '%', tot ? `${tot} scrap to repair${hasLost() ? ' · part detached' : ''}` : needsRepair ? 'Part service needed' : 'Fully repaired', `<i class="cbar2"><i style="width:${Math.round((1 - d) * 100)}%;background:${zoneCol(1 - d, false) || '#555'}"></i></i>`)
    + tile('garage', 'Garage', 'OVR ' + ovrOf(P), `${Math.round(st.total)} kg · ${STYLES[S.style].name}`)
    + tile('rivals', 'Rivals', rivs.length ? esc(BOT(rivs[0]).name) : 'None yet', rivs.length ? `${'🔥'.repeat(S.rivals[rivs[0]].heat)}${rivs.length > 1 ? ` +${rivs.length - 1} more` : ''}` : 'Make some enemies')
    + tile('belts', 'Belts', belts.length ? belts.length + ' held' : 'No gold', S.defend && S.belts[S.defend.lg] ? `Defence due vs ${esc(BOT(S.defend.id).name)}` : belts.length ? 'Champion' : `Beat ${TITLE_NEED} in a league for a shot`)
    + tile('hist', 'History', `${S.rec.w}–${S.rec.l}`, last1 ? `Last: ${last1.win ? 'W' : 'L'} vs ${esc(BOT(last1.opp).name)} · ${last1.how}` : 'No fights yet')
    + tile('sponsor', 'Sponsor', spn ? `<span class="sptag" style="--sc:${spn.col}">${spn.tag}</span>` : 'Unsigned', spn ? `${esc(spn.goal)} · ${spn.pay} · ${S.sponsor.left} fight${S.sponsor.left === 1 ? '' : 's'} left` : `${SPONSORS.filter(x => x.req()).length} offer${SPONSORS.filter(x => x.req()).length === 1 ? '' : 's'} on the table`)
    + tile('tourney', 'Tournament', S.tourney && !S.tourney.done ? `Round ${S.tourney.r + 1} of 3` : S.tourney && S.tourney.done ? (S.tourney.champ === 'you' ? 'Champion!' : 'Finished') : LEAGUES[tourneyLg()].name + ' Open', S.tourney && !S.tourney.done ? `Next: ${esc(tName(tourneyOpp()))}` : `8 bots · fee ${tFee(tourneyLg())} · prize ${tPurse(tourneyLg()) * 4}`)
     + tile('market', 'Scrap market', 'Buy &amp; sell', 'Parts and tune-ups')
     + tile('salvage', 'Salvage runs', S.workbookRun?.status === 'active' ? 'Run in progress' : 'The Crater', S.workbookRun?.status === 'active' ? `Heat ${S.workbookRun.heat} · ${S.workbookRun.usedPicks} picks · carried loot` : 'Scavenge, bank your finds, build the bot')
     + tile('scrapworks', 'Scrapworks', `${Object.values(S.materials).reduce((sum,count) => sum + Math.max(0, +count || 0), 0)}`, 'Materials · refine and craft')
     + tile('progression', 'Salvage rank', `Rank ${salvageRank.rank}`, `${salvageRank.totalXP.toLocaleString()} / ${salvageRank.nextThresholdXP.toLocaleString()} XP`)
    + tile('trophies', 'Trophies', `${Object.keys(S.trophies).length}/${TROPHIES.length}`, Object.keys(S.trophies).length ? TROPHIES.filter(t => S.trophies[t[0]]).slice(-4).map(t => t[1]).join(' ') : 'The shelf is empty');
  applyHubGroups();
  $('#hubNext').innerHTML = `<div class="nvs"><canvas width="420" height="300" data-por="${o.id}"></canvas><div class="ninfo"><h3>${esc(o.name)}</h3><p class="mono">${o.rec} · ${STYLES[o.style].name} · ${Math.round(so.total)} kg</p><p class="lore">${o.lore}</p></div></div>
    <div class="scout"><b>Scouting report</b><p>${o.scout}</p>${lastVs ? `<p class="note">Last time: ${lastVs.win ? 'you won' : 'you lost'} by ${lastVs.how.toLowerCase()} in round ${lastVs.round}.</p>` : ''}</div>
    <div class="nmeta"><div><small>Purse</small><b>${botPurse(o)}</b></div><div><small>Reach</small><b>${Math.round(st.reach)} / ${Math.round(so.reach)}</b></div><div><small>Hull</small><b>${st.hp} / ${so.hp}</b></div><div><small>Power</small><b>${st.power.toFixed(0)} / ${so.power.toFixed(0)}</b></div></div>
    <button class="btn primary" data-tile="next">${ok ? 'Walk out' : repairBlocksFight() ? 'Repair first' : 'Fix your build'}</button>`;
  $('#hubLg').innerHTML = LEAGUES.map((L, i) => `<button data-hlg="${i}" class="${lgOpen(i) ? '' : 'locked'}" aria-selected="${hubLg === i}">${L.name}</button>`).join('');
  const open = lgOpen(hubLg), list = ROSTER.filter(b => b.lg === hubLg && (hubWc === 'all' || weightClass(b) === hubWc));
  $('#hubLg').insertAdjacentHTML('afterend', '');
  $('#hubLadder').innerHTML = `<div class="wcf">${['all', ...WCLASS].map(w => `<button data-hwc="${w}" aria-pressed="${hubWc === w}">${w === 'all' ? 'All classes' : w.replace('weight', '')}</button>`).join('')}<span>You: ${weightClass(P)}</span></div>` + (open ? '' : `<p class="note lockmsg">Beat 3 bots in ${LEAGUES[hubLg - 1].name} to open this league.</p>`) + (open && !S.belts[hubLg] ? `<p class="note lockmsg">${titleReady(hubLg) ? `Title shot open: ${esc(champOf(hubLg).name)} for the ${BELTS[hubLg]}.` : `Beat ${TITLE_NEED} bots here for a title shot at ${esc(champOf(hubLg).name)} (${lgWins(hubLg)}/${TITLE_NEED}).`}</p>` : '') + list.map((b, i) => `<button class="lrow${S.opp === b.id ? ' on' : ''}${open && botOpen(b.id) ? '' : ' locked'}${isChamp(b.id) ? ' champrow' : ''}" data-hopp="${b.id}" ${open && botOpen(b.id) ? '' : 'disabled'}><span class="rk">${i + 1}</span><canvas width="96" height="72" data-por="${b.id}" ${open ? '' : 'data-dim="1"'}></canvas><span class="ln"><b>${open ? esc(b.name) : 'Locked'}${rivalOf(b.id) ? ' 🔥' : ''}</b><small>${open ? `${b.rec} · ${weightClass(b).replace('weight', '')} · ${STYLES[b.style].name}` : '—'}</small></span>${S.belts[b.lg] && isChamp(b.id) ? '<i class="ck belt">🏆</i>' : S.wins.includes(b.id) ? '<i class="ck">✓</i>' : isChamp(b.id) ? `<em class="champ">🏆 ${titleReady(b.lg) ? 'Title' : lgWins(b.lg) + '/' + TITLE_NEED}</em>` : `<em>${botPurse(b)}</em>`}</button>`).join('');
  $('#hubHist').innerHTML = S.history.length ? S.history.slice().reverse().map(h => `<li class="${h.win ? 'w' : 'l'}"><b>${h.win ? 'W' : 'L'}</b><span>${esc(BOT(h.opp).name)}</span><small>${h.how}${h.how === 'Decision' || h.how === 'Forfeit' || h.how === 'Disqualified' ? '' : ' · R' + h.round}${h.net ? ' · ' + (h.net > 0 ? '+' : '') + h.net : ''}</small></li>`).join('') : '<li class="none">No fights yet. Your first purse is waiting.</li>';
  renderBay(); renderBelts(); renderRivals(); renderSponsor(); renderTrophies(); renderMarket(); renderScrapworks(); renderWorkbookProgression(); renderTourney(); renderEvent();
  if (S.event && !carPanel) carPanel = 'event';
  if (!$('#hubRivals').innerHTML) $('#hubRivals').innerHTML = '<p class="note">No rivals yet. Bots that knock you out, or that you scrap, will come looking for you.</p>';
  if (!$('#hubBelts').innerHTML) $('#hubBelts').innerHTML = `<p class="note">No belts yet. The last bot in each league is its champion. Beat ${TITLE_NEED} other bots in that league to earn a title shot.</p>`;
  setCarSel(carSel); showCarPanel(carPanel);
  fillTicker($('#tkCar'));
  paintPortraits($('#scrCareer'));
  startHub();
}
function renderWorkbookRunReport(run) {
  if (!['extracted','failed'].includes(run?.status) || !run.lastReport) return '';
  const report = run.lastReport, district = WORKBOOK_RUN_DISTRICTS.find(row => row.key === report.districtKey) || WORKBOOK_RUN_DISTRICTS.find(row => row.key === run.districtKey), failed = run.status === 'failed', rewards = normalizeWorkbookRunRewards(failed ? report.lostCarry : report.banked), rewardHtml = rewards.map(row => `<span>${esc(workbookRunRewardLabel(row))}</span>`).join('');
  const day = failed ? report.failedDay : report.extractedDay, heading = failed ? 'Run failed · unbanked carry lost' : 'Haul secured', meta = `Run ${esc(String(run.id || '').replace(/^run-/, '#'))} · Heat ${Math.max(0, Math.floor(+report.heat || 0))} · ${Math.max(0, Math.floor(+report.usedPicks || 0))} Search picks`;
  if (failed) {
    const loss = report.failureMode === 'hardcore' ? (report.lostTorso ? `Hardcore loss: ${esc(report.lostTorso.name)} was permanently lost.` : 'Hardcore loss: no fitted torso was available to lose.') + ' The run did not use the fight Wreck check.' : `Recovery tow to Garbage Town. Damaged fitted parts are at 5% Condition; torso Integrity fell by 5. Tow fee ${Math.max(0, +report.towFeeCharged || 0)} / ${Math.max(0, +report.towFeeRequired || 0)} Scrap${report.towFeeWaived ? ` · ${report.towFeeWaived} waived because the wallet could not cover it` : ''}. No fight Wreck check.`;
    return `<section class="runReport"><small>Failure report · ${esc(district?.name || run.districtKey)} · Day ${Math.max(1, Math.floor(+day || 1))}</small><h4>${heading}</h4><p>${meta}</p><div class="salvageCarry">${rewardHtml || '<span>No unbanked carry</span>'}</div><p>${loss}</p></section>`;
  }
  return `<section class="runReport"><small>Extraction report · ${esc(district?.name || run.districtKey)} · Day ${Math.max(1, Math.floor(+day || 1))}</small><h4>${heading}</h4><p>${meta}</p><div class="salvageCarry">${rewardHtml || '<span>No rewards banked</span>'}</div><p>Materials are in the bank; recovered parts are in the stash.</p></section>`;
}
function workbookRunPvERandom(run, node, salt = 0) {
  let state = ((Math.floor(+run?.seed || 0) ^ Math.imul(Math.floor(+node?.number || 0), 0x9e3779b1) ^ (salt >>> 0)) >>> 0);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function workbookRunEnemyForNode(run, node) {
  const pool = workbookRunEncounterPool(run?.districtKey, node?.type);
  if (!pool.length) return null;
  if (node.type === 'boss') return pool.find(enemy => enemy.id === 'EN-04') || null;
  const random = workbookRunPvERandom(run, node, 0x454e454d);
  return pool[Math.floor(random() * pool.length)] || null;
}
function workbookRunEnemySpec(enemy, run) {
  const preset = WORKBOOK_PVE_ENEMY_PRESETS[enemy?.id]; if (!preset) return null;
  const guardHeatBonus = enemy.encounterType === 'guard' && (+run?.heat || 0) >= 8 ? 1.15 : 1;
  return { id:`run-${enemy.id.toLowerCase()}`, name:enemy.name, build:{ ...preset.build }, style:preset.style, trait:'stock', mech:'benny', plan:preset.plan, hull:(preset.hull || 1) * guardHeatBonus,
    signature:preset.signature ? { ...preset.signature } : null,
    runPveEnemy:{ id:enemy.id, styleLabel:enemy.style, attackMix:preset.attackMix ? { ...preset.attackMix } : null, chargeMul:preset.chargeMul || 1, tell:preset.signature?.tell || '' } };
}
function workbookRunRollEnemyRewards(run, enemy, node) {
  const rewards = [], notes = [], random = workbookRunPvERandom(run, node, 0x52455744);
  if (enemy.id === 'EN-01') rewards.push({ kind:'material', id:random() < .5 ? 'MT-05' : 'MT-13', count:1 });
  else if (enemy.id === 'EN-02') rewards.push({ kind:'material', id:'MT-01', count:1 });
  else if (enemy.id === 'EN-03') { rewards.push({ kind:'material', id:'MT-03', count:1 }); notes.push('Gears remains an unresolved listed drop because the workbook has no Gear material item.'); }
  else if (enemy.id === 'EN-04') {
    if (random() < .25) rewards.push({ kind:'blueprint', id:'pilebunker' });
    if (random() < .03) { const pool = WORKBOOK_PART_DEFS.filter(part => part.rarity === 'Iconic'); if (pool.length) { const part = pool[Math.floor(random() * pool.length)]; rewards.push({ kind:'part', id:part.id, condition:100, integrity:100 }); } }
    notes.push('The workbook-required guaranteed Rare+ reward is pending: Tier 2 has no Rare+ part and no cross-tier reward pool is defined.');
  }
  return { rewards, notes };
}
function workbookRunRewardLabel(row) {
  const def = row?.kind === 'material' ? WORKBOOK_MATERIAL_BY_ID[row.id] : row?.kind === 'part' ? WORKBOOK_PART_BY_ID[row.id] : row?.kind === 'blueprint' ? WORKBOOK_BLUEPRINT_BY_ID[row.id] : null;
  const name = def?.name || row?.id || 'Unknown reward';
  if (row?.kind === 'material') return `${name} ×${Math.max(1, Math.floor(+row.count || 1))}`;
  if (row?.kind === 'part') return `${name} · Condition ${Math.round(+row.condition || 0)} / Integrity ${Math.round(+row.integrity || 0)}`;
  return name;
}
function renderWorkbookBlueprintPanel() {
  const blueprints = Array.isArray(S.workbookBlueprints) ? S.workbookBlueprints : [];
  if (!blueprints.length) return '';
  const counts = new Map(); for (const id of blueprints) counts.set(id, (counts.get(id) || 0) + 1);
  const rows = [...counts].map(([id,count]) => `<span>${esc(WORKBOOK_BLUEPRINT_BY_ID[id]?.name || id)}${count > 1 ? ` ×${count}` : ''}</span>`).join('');
  return `<section class="runReport"><small>Blueprint vault · ${blueprints.length} item${blueprints.length === 1 ? '' : 's'}</small><h4>Recovered prints</h4><div class="salvageCarry">${rows}</div></section>`;
}
function renderWorkbookRunEncounterReport(report) {
  if (!report || typeof report !== 'object') return '';
  const enemy = WORKBOOK_ENEMY_BY_ID[report.enemyId], rewards = normalizeWorkbookRunRewards(report.rewards), rewardHtml = rewards.map(row => `<span>${esc(workbookRunRewardLabel(row))}</span>`).join('');
  const outcome = report.outcome === 'won' ? `${enemy?.name || report.enemyId} defeated. Its reward is in unbanked run carry.` : report.outcome === 'failed' ? 'Torso failure ended the run. The run recovery transaction is in Salvage Runs.' : report.outcome === 'forfeit' ? 'The encounter was abandoned. Damage persists and no enemy reward was granted.' : 'The player bot lost. Damage persists and no enemy reward was granted.';
  const notes = (Array.isArray(report.notes) ? report.notes : []).map(note => `<p class="note">${esc(note)}</p>`).join('');
  return `<section class="runReport"><small>Latest run fight · ${esc(enemy?.id || report.enemyId)} · Round ${Math.max(1, Math.floor(+report.round || 1))}</small><h4>${esc(enemy?.name || report.enemyId)} · ${report.outcome === 'won' ? 'Cleared' : report.outcome === 'failed' ? 'Run failed' : 'Not cleared'}</h4><p>${outcome}</p><div class="salvageCarry">${rewardHtml || '<span>No rewards added</span>'}</div>${notes}</section>`;
}
function renderWorkbookRunEncounterResult(report) {
  return `<div class="exnote"><p><b>Offline salvage encounter</b></p>${renderWorkbookRunEncounterReport(report) || '<p class="note">The run encounter result could not be recorded.</p>'}<p class="note">Part damage is saved to the deployed bot. Continue from Salvage Runs.</p></div>`;
}
function startWorkbookRunEncounter() {
  const run = S.workbookRun, node = run?.currentNodeId && run.map.nodes.find(row => row.id === run.currentNodeId);
  if (!run || run.status !== 'active' || !node || !['guard','boss'].includes(node.type)) return false;
  if (!run.party?.[0]) { if (!S.activeBotId) return false; run.party = [S.activeBotId]; }
  const botId = run.party[0]; if (S.activeBotId !== botId) selectStableBot(botId, true);
  const bot = activeStableBot(); if (!bot || bot.id !== botId) return false;
  const enemy = workbookRunEnemyForNode(run, node), spec = workbookRunEnemySpec(enemy, run); if (!enemy || !spec) return false;
  const preset = WORKBOOK_PVE_ENEMY_PRESETS[enemy.id], match = { a:playerSpec(), b:spec, career:false, spectate:false, from:'salvage', rounds:preset.rounds, len:45, venue:'lot', noVenueHazard:true, runEncounter:{ nodeId:node.id, nodeNumber:node.number, enemyId:enemy.id, heat:run.heat } };
  return enterArena(match);
}
function workbookPrepLabel(key) {
  const district = WORKBOOK_RUN_DISTRICTS.find(row => row.key === key), bot = activeStableBot(), loaded = bot?.storageLocation === 'truck';
  return loaded ? `Drive to ${district?.name || 'site'}` : `Load ${bot?.name || 'bot'} & drive to ${district?.name || 'site'}`;
}
function workbookPrepareDeployment(key) {
  const district = WORKBOOK_RUN_DISTRICTS.find(row => row.key === key), bot = activeStableBot(); if (!district || !bot) return;
  if (bot.storageLocation !== 'truck') moveStableBotToTruck(bot.id);
  if (bot.storageLocation !== 'truck') { renderSalvage(); return; }
  const locationId = WORKBOOK_RUN_LOCATION_IDS[district.key]; if (S.truck?.location !== locationId) travelTruckTo(locationId);
  renderSalvage();
}
function renderSalvage() {
  const el = $('#salvageBody'); if (!el) return;
  const run = S.workbookRun, active = run?.status === 'active', rank = workbookRankState().rank, currentLocation = WORKBOOK_WORLD_LOCATION_BY_ID[S.truck?.location] || WORKBOOK_WORLD_LOCATION_BY_ID['garbage-town'], blueprintPanel = renderWorkbookBlueprintPanel();
  const locationBadge = $('#scrSalvage .sbar-note'); if (locationBadge) locationBadge.textContent = `OFFLINE · ${currentLocation.name.toUpperCase()}`;
  if (!active) {
    const reportPanel = renderWorkbookRunReport(run), tutorialPanel = S.workbookTutorial?.status === 'awaiting-first-pit' ? `<section class="salvageCard"><small>First outing complete</small><h4>Fit the part you found</h4><p>Fit a found part, then fight one career bout to collect 120 Scrap, win or lose.</p><button class="btn ghost" data-road-open-stable>Open Stable</button></section>` : '', tutorialCard = S.workbookTutorial?.status === 'available' ? `<section class="salvageCard"><small>Onboarding · First outing</small><h4>The Crater</h4><p>A short, safe first run: search a pile, cut up a wreck, then extract.</p><button class="btn primary" data-run-start="crater" data-run-tutorial="true">Start first run</button></section>` : '', history = [...(S.workbookRunHistory || [])].slice(-5).reverse(), historyPanel = history.length ? `<section class="salvageCard"><small>Run history · ${S.workbookRunHistory.length} total</small><div class="runHistory">${history.map(row => { const districtName = WORKBOOK_RUN_DISTRICTS.find(d => d.key === row.districtKey)?.name || 'District', failed = row.state === 'failed', outcome = failed ? row.failureMode === 'hardcore' ? 'Failed · Hardcore' : 'Failed · Standard' : 'Extracted', rewards = (failed ? row.lostCarry : row.banked).map(reward => { const def = reward.kind === 'material' ? WORKBOOK_MATERIAL_BY_ID[reward.id] : WORKBOOK_PART_BY_ID[reward.id]; return `${def?.name || reward.id}${reward.kind === 'material' && reward.count > 1 ? ` ×${reward.count}` : ''}`; }); return `<article class="runHistoryRow"><b>${esc(districtName)}${row.tutorial ? ' · Guided first outing' : ''} · Run ${esc(String(row.id).replace(/^run-/, '#'))}</b><span>${outcome} · Heat ${row.heat} · ${row.usedPicks} picks · ${row.visitedNodeIds.length} nodes · Seed ${row.seed}</span><small>${rewards.length ? esc(`${failed ? 'Lost: ' : ''}${rewards.join(' · ')}`) : failed ? 'No unbanked carry' : 'No rewards banked'}${failed && row.towFeeRequired ? ` · Tow ${row.towFeeCharged}/${row.towFeeRequired} Scrap` : ''}</small></article>`; }).join('')}</div></section>` : '';
    el.innerHTML = `<div class="salvageHead"><div><span class="salvageTag">Truck at ${esc(currentLocation.name)}</span><h3>Salvage Runs</h3><p>Grab parts and materials, then extract to keep them. Get wrecked and you lose the haul.</p></div></div>${reportPanel}${blueprintPanel}${tutorialPanel}${tutorialCard}<div class="salvageDistricts">${WORKBOOK_RUN_DISTRICTS.map(district => { const unlocked = workbookCanEnterDistrict(district.key); return `<article class="salvageCard${unlocked ? '' : ' locked'}"><small>Tier ${district.tier}</small><h4>${esc(district.name)}</h4><p>${esc(district.finds.join(' · '))}</p>${unlocked ? `<div class="salvageBtns"><button class="btn primary" data-run-start="${district.key}">Deploy · Standard</button><button class="btn ghost" data-run-start="${district.key}" data-run-hardcore="true">Deploy · Hardcore</button></div><p class="note">Hardcore: better loot, but failing destroys your torso.</p>` : `<button class="btn ghost" disabled>Locked · need Rank ${district.minRank}</button>`}</article>`; }).join('')}</div>${historyPanel ? `<details class="sect"><summary>Past runs · ${S.workbookRunHistory.length}</summary>${historyPanel}</details>` : ''}`;
    for (const button of el.querySelectorAll('[data-run-start]')) {
      const blocker = workbookRunDeploymentBlocker(button.dataset.runStart), card = button.closest('.salvageCard'); if (!blocker) continue;
      if (/^(Load|Travel)/.test(blocker)) {
        if (card.querySelector('[data-run-prep]')) { button.remove(); continue; }
        const action = document.createElement('button'); action.type = 'button'; action.className = 'btn primary'; action.dataset.runPrep = button.dataset.runStart; action.textContent = workbookPrepLabel(button.dataset.runStart); button.replaceWith(action);
      } else { const status = document.createElement('p'); status.className = 'note road-deploy-status'; status.textContent = blocker; button.replaceWith(status); }
    }
    return;
  }
  const district = WORKBOOK_RUN_DISTRICTS.find(row => row.key === run.districtKey), candidates = new Set(workbookRunCandidates(run)), current = run.currentNodeId && run.map.nodes.find(node => node.id === run.currentNodeId), plan = workbookSearchPickPlan(run.districtKey, run.usedPicks), encounterPanel = renderWorkbookRunEncounterReport(run.lastEncounterReport), carry = run.carry.length ? run.carry.map(row => `<span>${esc(workbookRunRewardLabel(row))}</span>`).join('') : '<span>Nothing carried yet</span>';
  const nodeAction = current ? (() => {
    const def = WORKBOOK_RUN_NODE_DEFS.find(row => row.id === current.type);
    if (current.type === 'hazard') {
      const hazard = workbookRunHazardPool(run.districtKey)[0];
      return `<section class="salvageAction"><small>Heat +${def?.heat || 0}</small><h4>${esc(hazard?.name || 'Hazard')}</h4><p>${esc(hazard?.counter || 'Watch your footing and keep moving.')}</p><div class="salvageBtns"><button class="btn primary" data-run-complete>Move on</button>${workbookRunCanExtract(run) ? '<button class="btn ghost" data-run-extract>Extract and bank</button>' : ''}</div></section>`;
    }
    if (current.type === 'event') {
      return `<section class="salvageAction"><small>Heat +${def?.heat || 0}</small><h4>Quiet stop</h4><p>Nobody around. Keep moving.</p><div class="salvageBtns"><button class="btn primary" data-run-complete>Move on</button>${workbookRunCanExtract(run) ? '<button class="btn ghost" data-run-extract>Extract and bank</button>' : ''}</div></section>`;
    }
    if (current.type === 'workshop') {
      return `<section class="salvageAction"><small>Heat +${def?.heat || 0}</small><h4>Stripped workshop</h4><p>Someone got here first. Nothing left to use.</p><div class="salvageBtns"><button class="btn primary" data-run-complete>Move on</button>${workbookRunCanExtract(run) ? '<button class="btn ghost" data-run-extract>Extract and bank</button>' : ''}</div></section>`;
    }
    if (current.type === 'guard' || current.type === 'boss') {
      const enemies = workbookRunEncounterPool(run.districtKey, current.type), encounterLabel = current.type === 'boss' ? 'Crusher boss' : 'Guard encounter', rounds = current.type === 'boss' ? 3 : run.districtKey === 'crater' ? 1 : 2, encounterNote = current.type === 'boss' ? 'Crusher uses the offline three-round combat bridge. Clear or retreat from this terminal site to open extraction.' : run.districtKey === 'crater' ? 'The Crater selects the Scav drone or Rust hound at equal odds. The Guard cache is one enemy-mapped item on victory.' : 'Dead Conveyor uses the Line guard for two rounds. Its victory cache is one Alloy offcut; Gears remains unresolved.';
      const enemyRows = enemies.length ? enemies.map(enemy => `<article class="salvageCard"><small>${esc(enemy.style)}</small><h4>${esc(enemy.name)}</h4><p>${esc(enemy.behavior)}</p><p><b>Drops:</b> ${esc(enemy.drops.join(' · '))}</p></article>`).join('') : '<p class="note">No enemy here.</p>';
      return `<section class="salvageAction"><small>Layer ${current.layer} · Heat +${def?.heat || 0} · ${rounds} round${rounds === 1 ? '' : 's'}</small><h4>${encounterLabel} · Node ${current.number}</h4><p>${encounterNote}</p><div class="salvageDistricts">${enemyRows}</div><p class="note">Damage from this fight stays for the rest of the run.</p><div class="salvageBtns"><button class="btn primary" data-run-fight>${current.type === 'boss' ? 'Challenge Crusher' : 'Fight Guard'}</button>${workbookRunCanExtract(run) ? '<button class="btn ghost" data-run-extract>Extract and bank</button>' : ''}</div></section>`;
    }
    if (current.type === 'dismantle') {
      const reward = run.dismantleReward, partDef = reward && WORKBOOK_PART_BY_ID[reward.id];
      const detail = reward ? `<p>Recovered ${esc(partDef?.name || reward.id)} · ${esc(partDef?.rarity || 'Part')} · Condition ${reward.condition} / Integrity ${reward.integrity}. It is in unbanked carry.</p>` : '<p>Cut a salvaged assembly to recover one part. The district loot table sets the rarity band; item selection within that band is an even-odds provisional default.</p>';
      const action = reward ? '<button class="btn ghost" data-run-complete>Finish Dismantle</button>' : '<button class="btn primary" data-run-dismantle>Cut for part</button>';
      return `<section class="salvageAction"><small>Layer ${current.layer} · Heat +${def.heat}</small><h4>Dismantle · ${current.number}</h4>${detail}<div class="salvageBtns">${action}${workbookRunCanExtract(run) ? '<button class="btn primary" data-run-extract>Extract and bank</button>' : ''}</div></section>`;
    }
    if (current.type === 'search') { const search = run.search || { selectedSpots:[], rewards:[], plannedCategories:[] }, selectedCount = search.selectedSpots.length, targetCount = search.plannedCategories.length; return `<section class="salvageAction"><small>Layer ${current.layer} · Heat +${def.heat}</small><h4>Search · ${current.number}</h4><p>Choose ${targetCount} of six spots. Each pick pays one reward, following the run-wide two-material / one-Common-part mix. Sensors and clamp bonuses are not active yet. <em>Item odds and Search part condition are provisional defaults.</em></p><div class="runSpots">${Array.from({ length:WORKBOOK_SEARCH_RULES.spotsPerNode }, (_, i) => { const selectedAt = search.selectedSpots.indexOf(i), reward = selectedAt >= 0 ? search.rewards[selectedAt] : null, rewardDef = reward?.kind === 'material' ? WORKBOOK_MATERIAL_BY_ID[reward.id] : WORKBOOK_PART_BY_ID[reward?.id], label = reward ? `${rewardDef?.name || reward.id}${reward.kind === 'part' ? ` · C${reward.condition} / I${reward.integrity}` : ''}` : `Spot ${i + 1}`; const canPick = selectedAt < 0 && selectedCount < targetCount, content = reward ? esc(label) : `Spot ${i + 1}<br><small>Choose</small>`; return `<button class="runSpot${selectedAt >= 0 ? ' selected' : ''}" data-run-spot="${i}" ${canPick ? '' : 'disabled'} aria-pressed="${selectedAt >= 0}" aria-label="${reward ? esc(label) : `Search spot ${i + 1}`}" >${content}</button>`; }).join('')}</div><div class="salvageBtns"><button class="btn ghost" data-run-complete ${selectedCount < targetCount ? 'disabled' : ''}>Finish Search · ${selectedCount}/${targetCount} picks</button>${workbookRunCanExtract(run) ? '<button class="btn primary" data-run-extract>Extract and bank</button>' : ''}</div></section>`; }
    return `<section class="salvageAction"><small>Layer ${current.layer} · Heat +${def?.heat || 0}</small><h4>${esc(def?.name || current.type)} · ${current.number}</h4><p>${esc(def?.action || '')}</p><p class="note">This node’s full action is the next offline implementation slice. Traversing applies its listed heat cost only; combat, hazards, damage, loot, and event choices are not simulated yet.</p><div class="salvageBtns"><button class="btn primary" data-run-complete>Continue along route</button>${workbookRunCanExtract(run) ? '<button class="btn ghost" data-run-extract>Extract and bank</button>' : ''}</div></section>`;
  })() : '';
  const patchTargets = current && !run.tutorial ? workbookRunPatchTargets(run) : [], fieldPatchPanel = current && !run.tutorial ? `<section class="salvageCard"><small>Repair in the field · ${S.sandbox ? 'Sandbox' : `${Math.max(0, Math.floor(+S.consumables.patchKit || 0))} Patch kits`}</small><h4>Field patch</h4><p>Restore the part to at most 50% of its remaining Integrity. Costs one Patch kit and 1 Integrity; the part takes 25% more damage until workshop-repaired.</p>${patchTargets.length ? `<div class="lrows">${patchTargets.map(target => { const blocker = workbookRunPatchBlocker(target), nextIntegrity = Math.max(0, +target.state.integrity - 1), targetCondition = Math.min(50, nextIntegrity * .5); return `<div class="lrow"><span class="rk">${esc(target.slot.toUpperCase())}</span><span class="ln"><b>${esc(target.label)}</b><small>Condition ${Math.round(target.state.condition)} / Integrity ${Math.round(target.state.integrity)} · patch cap ${Math.round(targetCondition)}</small>${blocker ? `<small>${esc(blocker)}</small>` : ''}</span><em>${blocker ? 'Blocked' : 'Ready'}</em><button class="small-btn pri" data-run-patch="${esc(target.slot)}" ${blocker ? 'disabled' : ''}>${blocker ? 'Unavailable' : 'Patch'}</button></div>`; }).join('')}</div>` : '<p class="note">No fitted, repairable part is available on this bot.</p>'}</section>` : '';
  const layers = run.map.layers.map((layer, index) => `<section class="salvageLayer"><small>Layer ${index + 1} · ${layer.length} node${layer.length === 1 ? '' : 's'}</small>${layer.map(node => { const def = WORKBOOK_RUN_NODE_DEFS.find(row => row.id === node.type), isCurrent = current?.id === node.id, visited = run.visitedNodeIds.includes(node.id), resolved = run.resolvedNodeIds.includes(node.id), available = candidates.has(node.id) && !current, routeNames = (node.links || []).map(id => run.map.nodes.find(next => next.id === id)?.number).filter(Boolean); return `<button class="salvageNode${available ? ' available' : ''}${isCurrent ? ' current' : ''}${visited ? ' visited' : ''}" data-run-enter="${node.id}" ${available ? '' : 'disabled'}><small>Node ${String(node.number).padStart(2,'0')} · Heat ${def?.heat ?? 0}</small><b>${esc(def?.name || node.type)}${resolved ? ' · Done' : isCurrent ? ' · Active' : ''}</b><span class="route">${routeNames.length ? `Routes to ${routeNames.map(n => `N${String(n).padStart(2,'0')}`).join(' / ')}` : index === run.map.layers.length - 1 ? 'End of route' : 'Route ahead'}</span></button>`; }).join('')}</section>`).join('');
  el.innerHTML = `<div class="salvageHead"><div><span class="salvageTag">${run.tutorial ? 'Protected guided first outing' : 'Deployment active'}</span><h3>${esc(district?.name || 'Salvage route')}</h3><p>${run.tutorial ? 'Choose a Search node, dismantle the wreck, then take the link to extraction. This protected map has no enemy or hazard encounters.' : 'Pick your next stop. Extract to keep what you’re carrying.'}</p></div><div class="salvageBtns">${workbookRunCanExtract(run) ? '<button class="btn primary" data-run-extract>Extract and bank</button>' : `<span class="note">${run.tutorial ? 'Follow the route to its extraction node' : run.forceExtractNext ? 'District collapse · next node forces extraction' : 'Extract at nodes 4 or 8'}</span>`}</div></div>${blueprintPanel}${encounterPanel}<div class="salvageStats"><div class="salvageStat"><small>District</small><b>${esc(district?.name || 'Unknown')}</b></div><div class="salvageStat"><small>Run heat</small><b>${run.heat}${run.forceExtractNext ? ' · EXTRACT NEXT' : ''}</b></div><div class="salvageStat"><small>Search picks</small><b>${run.usedPicks} / ${plan?.budget || 0}</b></div><div class="salvageStat"><small>Carried rewards</small><b>${run.carry.length}</b></div></div>${nodeAction}${fieldPatchPanel}<section class="salvageCard"><small>Route map · seed ${run.seed}</small><div class="salvageMap">${layers}</div></section><section class="salvageCard"><small>Carrying · lost if you get wrecked</small><div class="salvageCarry">${carry}</div></section>`;
}
$('#scrSalvage').addEventListener('click', e => {
  if (e.target.closest('[data-road-open-stable]')) { gTab = 'stable'; stableView = 'build'; showScreen('garage'); return; }
  const prep = e.target.closest('[data-run-prep]'); if (prep) { workbookPrepareDeployment(prep.dataset.runPrep); uiClick(); return; }
  const start = e.target.closest('[data-run-start]'); if (start) { const tutorial = start.dataset.runTutorial === 'true', hardcore = !tutorial && start.dataset.runHardcore === 'true'; if (!workbookStartRun(start.dataset.runStart, undefined, { tutorial, hardcore })) { toast(workbookRunDeploymentBlocker(start.dataset.runStart) || (tutorial ? 'The guided outing is already in progress or complete.' : 'That district is not ready.')); return; } renderSalvage(); uiConfirm(); return; }
  const node = e.target.closest('[data-run-enter]'); if (node) { if (workbookEnterRunNode(node.dataset.runEnter)) { renderSalvage(); uiClick(); } else toast('That route is not open.'); return; }
  if (e.target.closest('[data-run-fight]')) { if (!startWorkbookRunEncounter()) toast('This encounter cannot start until its run node and deployed bot are ready.', 'bad'); return; }
  const dismantle = e.target.closest('[data-run-dismantle]'); if (dismantle) { const reward = workbookRunDismantle(); if (reward) { const def = WORKBOOK_PART_BY_ID[reward.id]; renderSalvage(); uiConfirm(); toast(`Recovered ${def?.name || reward.id}.`, 'good'); } else toast('That assembly is no longer available.'); return; }
  const spot = e.target.closest('[data-run-spot]'); if (spot) { const reward = workbookRunSearchSpot(spot.dataset.runSpot); if (reward) { const name = reward.kind === 'material' ? WORKBOOK_MATERIAL_BY_ID[reward.id]?.name : WORKBOOK_PART_BY_ID[reward.id]?.name; renderSalvage(); uiConfirm(); toast(`Found ${name || reward.id}.`, 'good'); } else toast('That spot is no longer available.'); return; }
  const fieldPatch = e.target.closest('[data-run-patch]');
  if (fieldPatch) { const target = workbookRunPatchTargets().find(row => row.slot === fieldPatch.dataset.runPatch), blocker = workbookRunPatchBlocker(target); if (blocker) { toast(blocker); return; } const before = target.state.condition, label = target.label; if (workbookRunFieldPatch(fieldPatch.dataset.runPatch)) { const after = workbookRunPatchTargets().find(row => row.slot === fieldPatch.dataset.runPatch), restored = Math.round((after?.state.condition || before) - before); renderSalvage(); toast(`Field-patched ${label} · +${restored} Condition, -1 Integrity.`, 'good'); } else toast('Field patch could not be applied.'); return; }
  if (e.target.closest('[data-run-complete]')) { if (workbookCompleteRunNode()) { renderSalvage(); uiConfirm(); } else toast('Finish the required picks before leaving this node.'); return; }
  if (e.target.closest('[data-run-extract]')) { if (workbookExtractRun()) { refreshWallet(); renderSalvage(); uiConfirm(); toast('Run extracted. Carried rewards are banked.', 'good'); } else toast('You cannot extract at this location.'); return; }
});
function setCarSel(i, focus) { const t = $$('#cTiles .ctile'); if (!t.length) return; carSel = (i + t.length) % t.length; t.forEach((b, k) => b.classList.toggle('on', k === carSel)); if (focus) t[carSel].focus({ preventScroll: false }); }
function showCarPanel(name) {
  carPanel = name || ''; const el = $('#cPanel'); el.hidden = !carPanel; if (!carPanel) return;
  $('#cpTitle').textContent = CP_TITLES[carPanel] || ''; $$('#cPanel .cpv').forEach(v => v.hidden = v.dataset.cpv !== carPanel);
}
function carTile(id) {
  if (id === 'next') { if (canFight()) openVersus('career'); else if (repairBlocksFight()) showCarPanel('repair'); else showScreen('garage'); uiConfirm(); return; }
  if (id === 'salvage') { showScreen('salvage'); return; }
  if (id === 'garage') { showScreen('garage'); return; }
  showCarPanel(carPanel === id ? '' : id); uiClick();
}
function renderBay() {
  const el = $('#hubBay'); if (!el) return; const tot = repairTotal(), repairable = PART_STATE_SLOTS.some(canWorkshopRepair), hasFaults = PART_STATE_SLOTS.some(slot => repairState(slot).faults.length), beyondRepair = PART_STATE_SLOTS.some(slot => repairState(slot).integrity < REPAIR_THRESHOLD), allQuote = repairQuote(PART_STATE_SLOTS.filter(canWorkshopRepair)), usesText = Object.entries(allQuote.materials).map(([id, count]) => `${count} ${WORKBOOK_MATERIAL_BY_ID[id].name}`).join(', '), buyingText = Object.values(allQuote.buy).reduce((sum, count) => sum + count, 0);
  const stateName = c => c >= 90 ? 'Pristine' : c >= 75 ? 'Scuffed' : c >= 40 ? 'Damaged' : c >= 15 ? 'Critical' : c > 0 ? 'Broken' : 'Destroyed';
  const rows = PART_STATE_SLOTS.map(slot => {
    const s = repairState(slot), row = SLOTS.find(x => x[0] === slot), c = repairQuote([slot]).total, faults = s.faults.map(f => `${CONDS[f.type]?.name || f.type} · fix: ${FAULT_FIX[f.type] || 'service required'}`);
    const status = s.detached ? 'Detached' : stateName(s.condition), can = canWorkshopRepair(slot), beyond = s.integrity < REPAIR_THRESHOLD;
    return `<div class="brow${s.detached ? ' lost' : ''}"><span>${row[1]}</span><i><b style="width:${Math.round(s.condition)}%;background:${zoneCol(s.condition / 100, s.detached) || '#555'}"></b></i><em>${status} · ${Math.round(s.condition)}/${Math.round(s.integrity)}</em>${can ? `<button class="small-btn" data-fix="${slot}" title="${s.detached ? 'Re-attach' : 'Repair'} · ${c} scrap">${c ? `${c} scrap` : 'Fix'}</button>` : '<s></s>'}${faults.length ? `<small>Fault: ${esc(faults.join(', '))}</small>` : ''}${beyond ? '<small>Worn out. No more repairs.</small>' : ''}</div>`;
  }).join('');
  const idleNote = hasFaults ? 'This fault needs a workshop service that is not available yet.' : beyondRepair ? 'Parts below 25 Integrity need dismantling or replacement.' : 'All installed parts are ready for the next fight.';
  el.innerHTML = `<div class="panel rbay"><h4 class="htitle">Repair bay</h4><div class="rbwrap"><canvas id="baySil" width="88" height="124" aria-label="Persistent part Condition"></canvas><div class="rbsum"><b>${Math.round((1 - dmgAvg()) * 100)}%</b><small>average Condition</small>${repairable ? `<span>${tot} scrap to fix everything</span>` : ''}</div></div><div class="rbrows">${rows}</div>
    ${repairable ? `<button class="btn ${repairBlocksFight() ? 'primary' : ''}" data-fix="all">${tot ? `Repair all · ${tot} scrap` : 'Repair all'}</button><p class="note">Uses ${esc(usesText)}${buyingText ? ` · buying ${buyingText} you're missing` : ''}. Each repair wears the part a little.</p>` : `<p class="note">${idleNote}</p>`}${emergencyRepairAvailable() ? '<button class="btn primary" data-emergency-fix>Stuck? Mang Benny gets it running for free</button>' : ''}</div>`;
  const f = mkFighter(playerSpec(), 0); drawSil($('#baySil'), f, 0, 0);
}
function renderBelts() {
  const el = $('#hubBelts'); if (!el) return; const held = Object.keys(S.belts).map(Number).sort();
  if (!held.length && !S.defend) { el.innerHTML = ''; return; }
  const df = S.defend && S.belts[S.defend.lg] ? S.defend : null;
  el.innerHTML = `<div class="panel belts"><h4 class="htitle">Belts</h4>${held.map(lg => `<div class="beltrow"><b>🏆 ${BELTS[lg]}</b><small>${S.belts[lg].def || 0} defence${S.belts[lg].def === 1 ? '' : 's'}</small></div>`).join('')}
    ${df ? `<div class="defend"><p><b>Mandatory defence:</b> ${esc(BOT(df.id).name)} for the ${BELTS[df.lg]}. ${df.left} fight${df.left === 1 ? '' : 's'} left before you are stripped.</p><button class="btn primary" data-defend="${df.id}">Set up the defence</button></div>` : ''}</div>`;
}
function renderRivals() {
  const el = $('#hubRivals'); if (!el) return; const list = Object.keys(S.rivals).filter(id => rivalOf(id) && BOT(id));
  if (!list.length) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="panel rivals"><h4 class="htitle">Rivals</h4>${list.map(id => { const b = BOT(id), r = S.rivals[id], hh = h2hOf(id), ok = botOpen(id); return `<div class="rvrow"><canvas width="96" height="72" data-por="${id}"></canvas><div><b>${esc(b.name)} <span class="heat">${'🔥'.repeat(r.heat)}</span></b><small>${RIVAL_WHY[r.why] || ''} · ${hh[0]}–${hh[1]}</small><q>${esc(rivalTaunt(id))}</q></div><button class="small-btn" data-grudge="${id}" ${ok ? '' : 'disabled'}>${S.opp === id ? 'Selected' : 'Grudge match'}</button></div>`; }).join('')}</div>`;
}
let hubSplat = null;
function drawHub(ts) {
  const cv = $('#hubMe'), c = cv.getContext('2d'), t = ts / 1000, w = cv.width / hubK, h = cv.height / hubK; if (!w) return;
  c.setTransform(hubK, 0, 0, hubK, 0, 0); c.fillStyle = '#0b0c0e'; c.fillRect(0, 0, w, h);
  const port = h > w * 1.1, bx = port ? w * .5 : w * .2, gy = port ? Math.min(h * .4, 340) : h * .8, sc = port ? Math.min(gy / 300, w / 330) : Math.min(h / 360, w / 720);
  if (!hubSplat) { hubSplat = document.createElement('canvas'); hubSplat.width = 900; hubSplat.height = 700; const x = hubSplat.getContext('2d'); splatter(x, 330, 360, 300, '#c7362f', 23); splatter(x, 560, 240, 200, '#f0b20a', 29); }
  c.save(); c.globalCompositeOperation = 'screen'; c.globalAlpha = .45; c.drawImage(hubSplat, bx - 330 * sc, gy - 520 * sc, 900 * sc * 1.1, 700 * sc * 1.1); c.restore();
  c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, 'rgba(255,240,210,.18)'); g.addColorStop(1, 'rgba(255,240,210,.02)'); c.fillStyle = g; c.beginPath(); c.moveTo(bx - 26 * sc, 0); c.lineTo(bx + 26 * sc, 0); c.lineTo(bx + 160 * sc, gy); c.lineTo(bx - 160 * sc, gy); c.closePath(); c.fill(); c.globalCompositeOperation = 'source-over';
  c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(bx, gy + 2, 110 * sc, 12 * sc, 0, 0, 7); c.fill();
  const ps = previewState(t, S.style, S.build), P = playerSpec();
  drawRobot(c, { st: ps.st, build: S.build, paint: S.paint, accent: S.accent, decal: S.decal, num: S.num, tally: P.tally, wear: S.wear, wseed: 4242, workbookCombat: P.workbookCombat, x: bx, ground: gy, dir: 1, scale: sc, pose: poseFrom(ps.st, ps.p, ps.punch, t, 0, 0), t });
  const sh = c.createLinearGradient(0, gy * .55, 0, h); sh.addColorStop(0, 'rgba(8,9,11,0)'); sh.addColorStop(1, 'rgba(8,9,11,.85)'); c.fillStyle = sh; c.fillRect(0, gy * .55, w, h);
  hubRaf = requestAnimationFrame(drawHub);
}
function startHub() { const cv = $('#hubMe'); hubK = sizeCanvas(cv, cv.clientWidth || 960, cv.clientHeight || 540).k; cancelAnimationFrame(hubRaf); hubRaf = requestAnimationFrame(drawHub); }
$('#scrCareer').addEventListener('click', e => {
  const l = e.target.closest('[data-hlg]'); if (l) { hubLg = +l.dataset.hlg; renderCareer(); return; }
  const op = e.target.closest('[data-hopp]'); if (op && !op.disabled) { S.opp = op.dataset.hopp; save(); uiClick(); renderCareer(); return; }
  const evb = e.target.closest('[data-ev]'); if (evb && S.event) { const e0 = EVENTS.find(x => x.id === S.event.id); if (evb.dataset.ev === 'yes' && e0 && e0.accept(S.event.d) === false) return; S.event = null; carPanel = ''; save(); refreshWallet(); uiConfirm(); renderCareer(); return; }
  const mb = e.target.closest('[data-mbuy]'); if (mb) { const it = S.market.items.find(x => x.id === mb.dataset.mbuy); if (it && (S.sandbox || S.scrap >= it.price)) { if (!S.sandbox) S.scrap -= it.price; createPartItem(it.id, { pool: it.pool, location: 'stash', worn: true, source: 'used-market' }); if (!S.owned.includes(it.id)) S.owned.push(it.id); save(); refreshWallet(); uiConfirm(); toast(`${part(it.pool, it.id).name} is in your parts rack.`, 'good'); renderCareer(); } else toast('Not enough scrap.'); return; }
  const wbBuy = e.target.closest('[data-wb-buy]'); if (wbBuy) { refreshWorkbookMarket(); const offer = S.workbookMarket.items.find(row => row.defId === wbBuy.dataset.wbBuy), def = offer && WORKBOOK_PART_BY_ID[offer.defId]; if (!offer || !def) { toast('That faction offer is no longer available.'); renderCareer(); return; } if (!S.sandbox && S.scrap < offer.price) { toast('Not enough scrap.'); return; } const item = createWorkbookPartItem(def.id, { location: 'stash', source: `vendor:${offer.factionCode}`, makerMark: def.maker }); if (!item) { toast('Could not create the part item.'); return; } if (!S.sandbox) S.scrap -= offer.price; S.workbookMarket.items = S.workbookMarket.items.filter(row => row.defId !== offer.defId); addWorkbookLedgerEntry({ action: 'purchase', itemId: item.itemId, defId: def.id, factionCode: offer.factionCode, scrap: offer.price }); evaluateWorkbookAchievements({ type:'state' }); save(); refreshWallet(); uiConfirm(); toast(`${def.name} added to stash.`, 'good'); renderCareer(); return; }
  const tn = e.target.closest('[data-tune]'); if (tn) { const key = tn.dataset.tune, item = partItemById(key), id = item ? item.defId : key, x = partByAny(id), lv = item ? item.tune : S.tune[id] || 0, c = tuneCost(x.q, lv); if (S.sandbox || S.scrap >= c) { if (!S.sandbox) S.scrap -= c; if (item) item.tune = lv + 1; else S.tune[id] = lv + 1; save(); refreshWallet(); uiConfirm(); toast(`${x.q.name} tuned to +${lv + 1}.`, 'good'); renderCareer(); } else toast(`Tuning costs ${c} scrap.`); return; }
  const rf = e.target.closest('[data-refurb]'); if (rf) { const key = rf.dataset.refurb, item = partItemById(key), id = item ? item.defId : key, x = partByAny(id), c = Math.round((x.q.cost || 100) * .25); if (S.sandbox || S.scrap >= c) { if (!S.sandbox) S.scrap -= c; if (item) item.worn = false; else delete S.worn[id]; save(); refreshWallet(); uiConfirm(); renderCareer(); } else toast(`Refurbishing costs ${c} scrap.`); return; }
  const ms = e.target.closest('[data-msell]'); if (ms) { const id = ms.dataset.msell, item = partItemById(id); if (item && item.location === 'stash' && pendingBuy === 'sell' + id) { const x = partByAny(item.defId), v = partSellValue(item); S.items = S.items.filter(candidate => candidate.itemId !== item.itemId); if (!S.items.some(candidate => candidate.kind === 'part' && candidate.defId === item.defId)) { S.owned = S.owned.filter(o => o !== item.defId); delete S.worn[item.defId]; delete S.tune[item.defId]; } S.scrap += v; pendingBuy = null; save(); refreshWallet(); toast(`Sold ${x.q.name} for ${v}.`); } else pendingBuy = 'sell' + id; renderCareer(); return; }
  const wbSell = e.target.closest('[data-wb-sell]'); if (wbSell) { const id = wbSell.dataset.wbSell, item = workbookPartItemById(id), def = item && WORKBOOK_PART_BY_ID[item.defId]; if (!item || item.location !== 'stash' || !def || def.tradeable !== 'Yes') { toast('Only tradeable spare parts can be sold.'); return; } if (pendingBuy === 'wb-sell' + id) { const value = workbookVendorSellValue(item), history = Array.isArray(item.history) ? item.history.slice(-40).map(row => ({ ...row })) : []; logWorkbookPartHistory(item, 'sold-to-vendor', { scrap: value }); addWorkbookLedgerEntry({ action: 'sale', itemId: item.itemId, defId: def.id, factionCode: def.phase1BFactionCode, scrap: value, itemHistory: [...history, { action: 'sold-to-vendor', day: Math.max(1, Math.floor(+S.stableDay || 1)), scrap: value }] }); S.items = S.items.filter(candidate => candidate.itemId !== item.itemId); S.scrap += value; pendingBuy = null; save(); refreshWallet(); toast(`Sold ${def.name} to a vendor for ${value} scrap.`); } else pendingBuy = 'wb-sell' + id; renderCareer(); return; }
  if (e.target.closest('[data-tstart]')) { startTourney(); renderCareer(); return; }
  if (e.target.closest('[data-tclear]')) { S.tourney = null; save(); renderCareer(); return; }
  if (e.target.closest('[data-tfight]')) { const o = tourneyOpp(); if (o && canFight()) enterArena({ a: playerSpec(), b: { ...BOT(o) }, spectate: false, career: true, venue: S.venue, from: 'career', tourney: true }); return; }
  const wc = e.target.closest('[data-hwc]'); if (wc) { hubWc = wc.dataset.hwc; renderCareer(); return; }
  const sg = e.target.closest('[data-spsign]'); if (sg) { const x = SPONSORS.find(y => y.id === sg.dataset.spsign); if (x && x.req() && !S.sponsor) { S.sponsor = { id: x.id, left: CONTRACT_LEN }; S.scrap += x.pay; save(); refreshWallet(); uiConfirm(); toast(`Signed with ${x.name}. +${x.pay} scrap.`, 'good'); pushNews(`${playerSpec().name} signs with ${x.name}`); renderCareer(); } return; }
  if (e.target.closest('[data-spdrop]')) { if (pendingBuy === 'spdrop') { pendingBuy = null; S.sponsor = null; save(); toast('Contract dropped.'); } else pendingBuy = 'spdrop'; renderCareer(); return; }
  if (e.target.closest('[data-emergency-fix]')) { if (emergencyRepair()) { uiConfirm(); toast('Mang Benny got it running. Just enough to fight.', 'good'); renderCareer(); } return; }
  const fx = e.target.closest('[data-fix]'); if (fx) { if (doRepair(fx.dataset.fix)) { uiConfirm(); toast('Repaired.'); renderCareer(); } return; }
  const gd = e.target.closest('[data-grudge],[data-defend]'); if (gd && !gd.disabled) { const id = gd.dataset.grudge || gd.dataset.defend; S.opp = id; hubLg = BOT(id).lg; carPanel = ''; carSel = 0; save(); uiConfirm(); renderCareer(); return; }
  const hc = e.target.closest('[data-hctrl]'); if (hc) { S.ctrl = hc.dataset.hctrl; save(); renderCareer(); return; }
  if (e.target.closest('#venuePick')) { openVenuePicker(); return; }
  const vp = e.target.closest('[data-vpick]'); if (vp) { S.venue = vp.dataset.vpick; save(); $('#venueModal').hidden = true; renderCareer(); return; }
  if (e.target.closest('#venueClose') || e.target.id === 'venueModal') { $('#venueModal').hidden = true; return; }
  const hg = e.target.closest('[data-hub-group]'); if (hg) { hubGroup = hg.dataset.hubGroup; carSel = 0; showCarPanel(''); renderCareer(); uiClick(); return; }
  const tl = e.target.closest('[data-tile]'); if (tl) { carTile(tl.dataset.tile); return; }
  if (e.target.closest('[data-cpclose]')) { showCarPanel(''); return; }
  const ch = e.target.closest('[data-chint]'); if (ch) { if (ch.dataset.chint === 'go') $$('#cTiles .ctile')[carSel]?.click(); if (ch.dataset.chint === 'ctrl') { S.ctrl = S.ctrl === 'pilot' ? 'coach' : 'pilot'; save(); renderCareer(); } return; }
});
$('#scrCareer').addEventListener('change', e => { if (e.target.id === 'hRounds') { S.rounds = +e.target.value; save(); } if (e.target.id === 'hLen') { S.len = +e.target.value; save(); } });
function openVenuePicker() { $('#venueGrid').innerHTML = venueCards(S.venue, 'data-vpick', true); $('#venueModal').hidden = false; }
/* ---------- exhibition ---------- */
const EXH = { a: 'you', b: 'foreman', v: 'auto', rounds: 3, len: 45 };
function exhOptions(cur) { return `<option value="you" ${cur === 'you' ? 'selected' : ''}>Your bot · ${esc(playerSpec().name)}</option>` + LEAGUES.map((L, i) => `<optgroup label="${L.name}">${ROSTER.filter(b => b.lg === i).map(b => `<option value="${b.id}" ${cur === b.id ? 'selected' : ''}>${esc(b.name)}</option>`).join('')}</optgroup>`).join(''); }
function specFor(v) { return v === 'you' ? playerSpec() : { ...BOT(v) }; }
function renderExh() {
  $('#exA').innerHTML = exhOptions(EXH.a); $('#exB').innerHTML = exhOptions(EXH.b);
  for (const [k, sel] of [['a', '#exPA'], ['b', '#exPB']]) { const cv = $(sel); cv.dataset.por = EXH[k]; cv.dataset.dir = k === 'a' ? '1' : '-1'; }
  paintPortraits($('#scrExhibition'));
  const sa = specFor(EXH.a), sb = specFor(EXH.b);
  $('#exInfoA').textContent = `${STYLES[sa.style].name} · ${sa.signature ? sa.signature.name : 'no signature'}`; $('#exInfoB').textContent = `${STYLES[sb.style].name} · ${sb.signature ? sb.signature.name : 'no signature'}`;
  $('#exVenues').innerHTML = venueCards(EXH.v, 'data-exv', true);
  $('#exR').value = EXH.rounds; $('#exL').value = EXH.len;
  const meOk = EXH.a !== 'you' || canFight();
  $('#exPlay').disabled = EXH.a !== 'you' || !meOk; $('#exPlay').title = EXH.a !== 'you' ? 'Pick your bot in the red corner to fight it yourself' : '';
}
$('#scrExhibition').addEventListener('change', e => { if (e.target.id === 'exA') EXH.a = e.target.value; if (e.target.id === 'exB') EXH.b = e.target.value; if (e.target.id === 'exR') EXH.rounds = +e.target.value; if (e.target.id === 'exL') EXH.len = +e.target.value; renderExh(); });
$('#scrExhibition').addEventListener('click', e => {
  const v = e.target.closest('[data-exv]'); if (v) { EXH.v = v.dataset.exv; renderExh(); return; }
  if (e.target.closest('#exSwap')) { [EXH.a, EXH.b] = [EXH.b, EXH.a]; renderExh(); return; }
  if (e.target.closest('#exRand')) { const r = () => ROSTER[Math.random() * ROSTER.length | 0].id; EXH.a = r(); EXH.b = r(); while (EXH.b === EXH.a) EXH.b = r(); renderExh(); return; }
  const base = { rounds: EXH.rounds, len: EXH.len, venue: EXH.v, from: 'exhibition' };
  if (e.target.closest('#exWatch')) { enterArena({ ...base, a: specFor(EXH.a), b: specFor(EXH.b), spectate: true }); return; }
  if (e.target.closest('#exPlay')) { if (EXH.a !== 'you') return; enterArena({ ...base, a: playerSpec(), b: specFor(EXH.b), spectate: false, career: false }); return; }
});
/* ---------- settings ---------- */
function slotInfo(i) { try { const v = JSON.parse(localStorage.getItem(slotKey(i)) || 'null'); if (!v || !v.build) return null; return { name: v.name || 'Ironside', w: v.rec ? v.rec.w : 0, l: v.rec ? v.rec.l : 0, scrap: v.scrap || 0, belts: Object.keys(v.belts || {}).length, troph: Object.keys(v.trophies || {}).length }; } catch (e) { return null; } }
function slotRows() {
  return `<div class="slots"><b class="slh">Save slots</b>${[0, 1, 2].map(i => { const v = i === SLOT ? { name: playerSpec().name, w: S.rec.w, l: S.rec.l, scrap: S.scrap, belts: Object.keys(S.belts).length, troph: Object.keys(S.trophies || {}).length } : slotInfo(i);
    return `<div class="slot${i === SLOT ? ' cur' : ''}"><small>Slot ${i + 1}${i === SLOT ? ' · playing' : ''}</small>${v ? `<b>${esc(v.name)}</b><span>${v.w}–${v.l} · ${v.scrap} scrap${v.belts ? ' · 🏆' + v.belts : ''} · ${v.troph} trophies</span>` : '<b class="empty">Empty</b><span>A garage bot and 250 scrap</span>'}
      <div class="slbtns">${i === SLOT ? '' : `<button class="small-btn" data-slot="${i}">${v ? 'Load' : 'New career'}</button>`}${v && i !== SLOT ? `<button class="small-btn" data-slotdel="${i}">${pendingBuy === 'slotdel' + i ? 'Tap again' : 'Delete'}</button>` : ''}</div></div>`; }).join('')}</div><p class="note">Switching slots saves this career and reloads the game.</p>`;
}
function applyA11y() { document.body.classList.toggle('reduced', !!S.opt.reduced); document.body.classList.toggle('cbmode', !!S.opt.cb); }
let keyWait = '';
function keyRows() {
  const o = S.opt.keys || {};
  return `<div class="keys">${KEY_ACTIONS.map(([act, label, def]) => `<div class="krow"><span>${label}</span><button class="small-btn${keyWait === act ? ' confirm' : ''}" data-rebind="${act}">${keyWait === act ? 'Press a key…' : keyName(o[act] || def)}</button></div>`).join('')}</div><button class="small-btn" id="keysReset">Reset to defaults</button>`;
}
function renderSettings() {
  const o = S.opt, tg = (k, l, d) => `<div class="trow"><span><b>${l}</b><small>${d}</small></span><button class="toggle" data-opt="${k}" aria-pressed="${!!o[k]}"><i></i></button></div>`;
  const voiceNote = 'Recorded clips play when they fit. Unmatched lines use your selected browser voice; system voices vary in realism and are not Hank or Sparkplug recordings.';
  const voiceRow = (key, label) => {
    const selected = CAST[key] && CAST[key].systemVoice ? (CAST[key].systemVoice.voiceURI || CAST[key].systemVoice.name) : '';
    const options = VOX.voices.map(v => { const value = v.voiceURI || v.name; return `<option value="${esc(value)}" ${value === selected ? 'selected' : ''}>${esc(v.name)} · ${esc(v.lang || 'voice')}</option>`; }).join('');
    return `<div class="trow"><span><b>${label} fallback</b><small>Used only when a recorded line cannot safely name this matchup</small></span><select class="voice-select" data-cast-voice="${key}" aria-label="${label} fallback voice" ${VOX.voices.length ? '' : 'disabled'}><option value="">Auto · broadcast male</option>${options}</select></div>`;
  };
  $('#setBody').innerHTML = `<div class="sect"><h4>Audio</h4>${[['music', 'Music'], ['sfx', 'Sound effects'], ['crowd', 'Crowd'], ['voice', 'Voices']].map(([k, l]) => `<label class="slider"><span>${l}</span><input type="range" min="0" max="1" step=".05" value="${o[k]}" data-vol="${k}"><b>${Math.round(o[k] * 100)}</b></label>`).join('')}
    <p class="voice-note">${voiceNote}</p>
    ${voiceRow('pbp', 'Hank Ruiz')}${voiceRow('color', 'Sparkplug')}
    <div class="trow"><span><b>Test the booth</b><small>Plays recorded voices, the referee count, and the dynamic fallback voice.</small></span><button class="small-btn" id="voiceTest">Play</button></div></div>
    <div class="sect"><h4>Presentation</h4>${tg('announcer', 'Ring announcer and referee', 'Intros, decisions and the 10 count, read aloud')}${tg('commentary', 'Commentary booth', 'Hank Ruiz and Sparkplug call the fight')}${tg('subtitles', 'Captions', 'Show what the voices say')}${tg('hazards', 'Venue hazards', 'Scrap on the canvas, leaking roofs, harbor fog and furnace heat')}${tg('replays', 'Instant replays', 'Slow-motion replay of knockdowns and stoppages')}${tg('punchcam', 'Punch camera', 'Quick zoom on big shots and counters')}${tg('cinematic', 'Cinematic walkouts', 'Full intro before each fight. Off gives a quick tale of the tape')}${tg('shake', 'Screen shake', 'Turn off if motion bothers you')}</div>
    <div class="sect"><h4>Accessibility</h4>${tg('reduced', 'Reduced motion', 'No screen shake, flashes or punch zoom; calmer animations')}${tg('cb', 'Colour-blind palette', 'Damage shows blue → yellow → magenta instead of green → orange → red')}</div>
    <div class="sect"><h4>Pilot and coach keys</h4><p class="note">Click a key, then press the new one. Arrow keys always move too. Local versus uses its own fixed layout.</p>${keyRows()}</div>
    <div class="sect"><h4>Fights</h4><div class="trow"><span><b>Default controls</b><small>Switch any time in a fight with C</small></span><div class="seg tiny"><button data-sctrl="coach" aria-pressed="${S.ctrl === 'coach'}">Coach</button><button data-sctrl="pilot" aria-pressed="${S.ctrl === 'pilot'}">Pilot</button></div></div>
    <div class="trow"><span><b>Rounds and length</b><small>Career default</small></span><span class="selrow"><select id="sRounds"><option value="3">3 rounds</option><option value="5">5 rounds</option></select><select id="sLen"><option value="30">30 s</option><option value="45">45 s</option><option value="60">60 s</option></select></span></div></div>
    <div class="sect"><h4>Career</h4><div class="trow"><span><b>Sandbox mode</b><small>Everything unlocked and free. Good for theorycrafting.</small></span><button class="toggle" id="sandboxT" aria-pressed="${S.sandbox}"><i></i></button></div>
    ${slotRows()}
    <div class="trow"><span><b>Back up this career</b><small>Download a save file you can restore on any device</small></span><span class="selrow"><button class="small-btn" id="saveExport">Download</button><label class="small-btn filebtn">Restore<input type="file" id="saveImport" accept=".json,application/json" hidden></label></span></div>
    <div class="trow danger"><span><b>Reset career</b><small>Wipes record, scrap, parts and fabricated designs.</small></span><button class="small-btn" id="resetBtn">${pendingBuy === 'reset' ? 'Tap again to wipe' : 'Reset'}</button></div></div>`;
  $('#sRounds').value = S.rounds; $('#sLen').value = S.len;
}
$('#scrSettings').addEventListener('input', e => { const k = e.target.dataset.vol; if (k) { S.opt[k] = +e.target.value; e.target.nextElementSibling.textContent = Math.round(S.opt[k] * 100); save(); applyVolumes(); } });
$('#scrSettings').addEventListener('change', e => {
  if (e.target.id === 'saveImport' && e.target.files && e.target.files[0]) { const fr = new FileReader(); fr.onload = () => { try { const d = JSON.parse(fr.result), sv = d && d.save ? d.save : d; if (!sv || !sv.build || !sv.rec) throw 0; localStorage.setItem(SAVE_KEY, JSON.stringify(sv)); toast('Save restored. Reloading…', 'good'); setTimeout(() => location.reload(), 700); } catch (er) { toast('That file is not a Scrapyard Circuit save.'); } }; fr.readAsText(e.target.files[0]); return; }
  const cast = e.target.dataset.castVoice;
  if (cast && CAST[cast]) { const value = e.target.value; S.voicePrefs[cast] = value; CAST[cast].systemVoice = VOX.voices.find(v => (v.voiceURI || v.name) === value) || autoSystemVoice(cast); save(); return; }
  if (e.target.id === 'sRounds') { S.rounds = +e.target.value; save(); } if (e.target.id === 'sLen') { S.len = +e.target.value; save(); }
});
$('#scrSettings').addEventListener('click', e => {
  const sl = e.target.closest('[data-slot]'); if (sl) { save(); try { localStorage.setItem('scrapyard-slot', sl.dataset.slot); } catch (er) {} location.reload(); return; }
  const sd = e.target.closest('[data-slotdel]'); if (sd) { const i = +sd.dataset.slotdel; if (pendingBuy === 'slotdel' + i) { try { localStorage.removeItem(slotKey(i)); } catch (er) {} pendingBuy = null; toast(`Slot ${i + 1} deleted.`); } else pendingBuy = 'slotdel' + i; renderSettings(); return; }
  const rb = e.target.closest('[data-rebind]'); if (rb) { keyWait = keyWait === rb.dataset.rebind ? '' : rb.dataset.rebind; renderSettings(); return; }
  if (e.target.closest('#keysReset')) { S.opt.keys = {}; keyWait = ''; rebuildKeys(); save(); renderSettings(); toast('Keys reset.'); return; }
  if (e.target.closest('#saveExport')) { try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify({ game: 'scrapyard-circuit', v: 7, save: S }, null, 1)], { type: 'application/json' })); a.download = `scrapyard-${(S.name || 'career').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-slot${SLOT + 1}.json`; document.body.appendChild(a); a.click(); a.remove(); toast('Save downloaded.', 'good'); } catch (er) { toast('Could not create the file.'); } return; }
  const t = e.target.closest('[data-opt]'); if (t) { const k = t.dataset.opt; S.opt[k] = !S.opt[k]; save(); applyA11y(); renderSettings(); if (!S.opt.commentary && !S.opt.announcer) shutUp(); return; }
  const sc = e.target.closest('[data-sctrl]'); if (sc) { S.ctrl = sc.dataset.sctrl; save(); renderSettings(); return; }
  if (e.target.closest('#sandboxT')) { S.sandbox = !S.sandbox; save(); renderSettings(); refreshWallet(); return; }
  if (e.target.closest('#voiceTest')) { initAudio(); shutUp(); say('ring', 'Ladies and gentlemen... welcome to the Scrapyard Circuit!', 3, { group: 'voice-test', lock: true, assetKey: 'ring.open' }); say('pbp', 'Big shot to the head by Graveyard Shift!', 2, { group: 'voice-test', assetKey: 'pbp.bigHead' }); say('color', 'The noise is already up, Hank. That first clean exchange is going to tell us a lot.', 2, { group: 'voice-test', assetKey: 'color.openColor' }); say('ref', 'One', 2, { group: 'voice-test', assetKey: 'ref.count.1' }); say('pbp', 'Dynamic fallback check for the live call.', 1, { group: 'voice-test', assetKey: 'debug.missing' }); return; }
  if (e.target.closest('#resetBtn')) { if (pendingBuy === 'reset') { const keep = S.opt; try { localStorage.removeItem(SAVE_KEY); } catch (er) {} S = JSON.parse(JSON.stringify(DEFAULT)); S.opt = keep; S.training = normalizeTraining({}); WS.hd = { ...DEF_HD }; WS.td = { ...DEF_TD }; grantRepairSupplies(); save(); pendingBuy = null; toast('Career wiped. Back to the scrapyard.'); renderSettings(); refreshWallet(); } else { pendingBuy = 'reset'; renderSettings(); } return; }
});
/* ---------- main menu ---------- */
let menuK = 1, menuScene = null, menuVenuePending = null, menuSparLastHit = '';
/* ---------- broadcast layer: ratings, ticker, menu, versus ---------- */
const OVR_K = [['power', 1.4], ['aspd', 1.2], ['reach', .7], ['armor', 1], ['hp', 1.2], ['sense', .8], ['move', .8], ['balance', .7], ['durability', .6], ['regen', .5], ['en', .4]];
function statScore(st) { let a = 0, w = 0; for (const [k, wt] of OVR_K) { const [lo, hi] = RANGE[k] || [0, 1]; a += wt * clamp((st[k] - lo) / ((hi - lo) || 1), 0, 1); w += wt; } return a / w; }
function ovrOf(spec) {
  const st = statsOf(spec.build, spec.trait); let bonus;
  if (spec.id === 'you') { const tr = Object.values(S.training || {}).reduce((a, b) => a + (+b || 0), 0); bonus = tr * .8 + (spec.signature ? 2 : 0) + Math.min(8, S.rec.w * .5) + (TRAITS[S.trait] && S.trait !== 'stock' ? 2 : 0); }
  else { const o = ROSTER.find(b => b.id === spec.id); const ix = o ? ROSTER.filter(b => b.lg === o.lg).indexOf(o) : 0; bonus = (o ? o.lg : 0) * 6 + ix * .6 + (o && o.hull ? 6 : 0); }
  return Math.round(clamp(30 + statScore(st) * 80 + bonus, 40, 99));
}
function weightClass(spec) { const t = statsOf(spec.build, spec.trait).total; return t < 50 ? 'Lightweight' : t <= 62 ? 'Middleweight' : 'Heavyweight'; }
function heightOf(spec) { const an = anchors(normBuild({ ...spec.build })); return ((-an.headY + dims(spec.build).H * .5) / 105).toFixed(1); }
function tickerItems() {
  const out = [], P = playerSpec();
  for (const h of S.history.slice(-3).reverse()) out.push(`${P.name} ${h.win ? 'def.' : 'lost to'} ${BOT(h.opp).name} · ${h.how}${h.how === 'Decision' || h.how === 'Forfeit' || h.how === 'Disqualified' ? '' : ' in R' + h.round}`);
  const day = Math.floor(Date.now() / 864e5) + S.rec.w * 7 + S.rec.l * 3, r = mulberry32(day);
  if (S.world && S.world.log.length) out.push(...S.world.log.slice(0, 8));
  else for (let i = 0; i < 6; i++) {
    const lg = r() * 4 | 0, list = ROSTER.filter(b => b.lg === lg), a = list[r() * list.length | 0], b = list[r() * list.length | 0]; if (a === b) continue;
    const ia = list.indexOf(a), ib = list.indexOf(b), aw = r() < (ia > ib ? .65 : .35), w = aw ? a : b, l = aw ? b : a, how = ['KO', 'TKO', 'Decision', 'KO', 'Decision'][r() * 5 | 0];
    out.push(`${w.name} def. ${l.name} by ${how}${how === 'Decision' ? '' : ' in R' + (1 + (r() * 3 | 0))} · ${VENUES[w.venue || LEAGUE_VENUE[w.lg]].name}`);
  }
  for (const n of (S.news || []).slice(0, 4)) out.unshift(n); if (sponsorOf()) out.push(`${P.name} is presented by ${sponsorOf().name}`);
  if (!S.belts[3]) out.push(`${champOf(3).name} defends the Pit belt Saturday at the Crown Dome`);
  for (const id of Object.keys(S.rivals || {})) if (rivalOf(id) && BOT(id)) out.push(`${BOT(id).name}: "${rivalTaunt(id)}"`);
  const nb = typeof nextBot === 'function' ? nextBot() : null; if (nb) out.push(`Next on the card: ${P.name} vs ${nb.name}`);
  out.push(`${LEAGUES.map((L, i) => `${L.name}: ${S.belts[i] ? P.name : champOf(i).name} holds the belt`).join(' · ')}`);
  return out;
}
function fillTicker(el) { if (!el) return; const items = tickerItems(); el.innerHTML = items.map(esc).join('<i>●</i>') + '<i>●</i>'; el.style.setProperty('--tkd', Math.max(30, items.join(' ').length * .22) + 's'); }
let menuSel = 0, grainDone = false;
function makeGrain() {
  if (grainDone) return; grainDone = true;
  try { const c = document.createElement('canvas'); c.width = c.height = 160; const x = c.getContext('2d'), d = x.createImageData(160, 160); for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() * 255 | 0; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); document.documentElement.style.setProperty('--grain', `url(${c.toDataURL('image/png')})`); } catch (e) {}
}
const hexA = (h, a) => { const n = parseInt(String(h).slice(1, 7), 16) || 0; return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
function softDot(c, x, y, r, col, a) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, hexA(col, a)); g.addColorStop(.45, hexA(col, a * .5)); g.addColorStop(1, hexA(col, 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
function splatter(c, x, y, rad, col, seed) {
  const r = mulberry32(seed); c.save();
  softDot(c, x, y, rad * 1.2, col, .5);
  for (let i = 0; i < 16; i++) { const a = r() * 6.283, d = r() * rad * .85; softDot(c, x + Math.cos(a) * d, y + Math.sin(a) * d * .7, rad * (.14 + r() * .32), col, .14 + r() * .26); }
  c.fillStyle = col; for (let i = 0; i < 10; i++) { const a = r() * 6.283, d = rad * (.55 + r() * .6); c.globalAlpha = .18 + r() * .25; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d * .7, .8 + r() * 1.8, 0, 7); c.fill(); }
  c.restore();
}
function setMenuSel(i, focus) {
  const items = $$('#mnav .mitem'); menuSel = (i + items.length) % items.length;
  items.forEach((b, k) => b.classList.toggle('on', k === menuSel)); if (focus) { const el = items[menuSel], reveal = () => { if (!el.classList.contains('on')) return; if (menuSel) el.scrollIntoView({ block: 'nearest' }); else el.closest('.mwrap').scrollTop = 0; }; el.focus({ preventScroll: true }); reveal(); setTimeout(reveal, 240); }
  renderMenuPlate();
}
function renderMenuPlate() {
  const el = $('#menuPlate'); if (!el || !menuScene) return;
  const F = menuScene.F; if (F) { const [a, b] = F.f, done = F.phase === 'done' || F.phase === 'finisher', clk = Math.max(0, Math.ceil(F.cfg.roundLen - F.rt)), hp = f => Math.round(clamp(f.hp / f.s.hp, 0, 1) * 100);
    el.innerHTML = `<small>${done ? 'Final' : 'Live'} · ${VENUES[menuScene.venue].name} · ${done ? (F.reason === 'Decision' ? 'Decision' : F.reason + ' R' + F.round) : F.phase === 'break' ? 'End of R' + F.round : F.phase === 'count' ? 'Knockdown' : 'R' + F.round + ' · ' + Math.floor(clk / 60) + ':' + String(clk % 60).padStart(2, '0')}</small><b class="live"><span class="r${done && F.winner === 0 ? ' won' : ''}">${esc(a.spec.name)}</span><i>vs</i><span class="b${done && F.winner === 1 ? ' won' : ''}">${esc(b.spec.name)}</span></b><span>${done ? esc(F.f[F.winner].spec.name) + ' wins' : `Hull ${hp(a)}% · ${hp(b)}%`} · OVR ${ovrOf(a.spec)} / ${ovrOf(b.spec)}</span>`; return; }
  const showOpp = menuScene.show === 'opp', spec = showOpp ? { ...BOT(S.opp) } : playerSpec();
  el.innerHTML = `<small>${showOpp ? 'Next opponent · ' + LEAGUES[BOT(S.opp).lg].name : 'Your fighter · ' + weightClass(spec)}</small><b>${!showOpp && Object.keys(S.belts).length ? '🏆 ' : ''}${esc(spec.name)}<em>${ovrOf(spec)}</em></b><span>${showOpp ? `${spec.rec} · ${STYLES[spec.style].name}` : `${S.rec.w}–${S.rec.l} · ${STYLES[spec.style].name}`}</span>`;
}
$('#mnav').addEventListener('mouseover', e => { const b = e.target.closest('.mitem'); if (!b) return; const ix = $$('#mnav .mitem').indexOf(b); if (ix !== menuSel) setMenuSel(ix); });
$('#mnav').addEventListener('focusin', e => { const b = e.target.closest('.mitem'); if (!b) return; const ix = $$('#mnav .mitem').indexOf(b); if (ix !== menuSel) setMenuSel(ix); });
function renderMenu() {
  refreshWallet(); const P = playerSpec();
  makeGrain();
  $('#menuCareer').innerHTML = S.history.length ? `<b>Continue career</b><small>${esc(P.name)} · ${S.rec.w}–${S.rec.l} · next: ${esc(BOT(S.opp).name)}</small>` : `<b>Start career</b><small>A garage bot, 250 scrap and a dream</small>`;
  fillTicker($('#tkMenu'));
  const opp = ROSTER[Math.random() * ROSTER.length | 0];
  const venue = menuVenuePending || ['dome', 'arena', 'drain', 'harbor', 'lot'][Math.random() * 5 | 0];
  menuVenuePending = null;
  menuScene = { opp, venue, t0: performance.now(), show: 'me', swapT: 0 };
  buildLayers(menuScene.venue); newMenuBout(); startMenu(); setMenuSel(menuSel);
}
function newMenuBout() {
  const M = menuScene; if (!M) return; const a = ROSTER[Math.random() * ROSTER.length | 0]; let b = a; while (b === a) b = ROSTER[Math.random() * ROSTER.length | 0];
  const F = createFight({ ...a }, { ...b }, Math.random() * 1e9 | 0, { rounds: 3, roundLen: 30, hazard: M.venue }); F.human = -1; F.controlMode = 'coach';
  Object.assign(M, { F, acc: 0, wait: 0, camX: W / 2, sparks: [], texts: [], heatT: 0, last: 0, plateT: 0, scr: [makeScratches(7 + (Math.random() * 99 | 0)), makeScratches(13 + (Math.random() * 99 | 0))] });
}
function menuSfx(M, F, e) {
  if (curScreen !== 'menu' || !AC) return; const now = performance.now(), txt = (s, col) => M.texts.push({ s, col, t: 1.2 });
  switch (e.type) {
    case 'hit': { if (e.dmg <= 0) break; if (now - (M.sfxT || 0) < 70) break; M.sfxT = now; const vd = e.dmg / DMG; thud(vd * .75, e.blocked, e.kind, e.target, e.crit, { gain: .5, dip: false }); if (!e.blocked && (e.crit || vd > 9)) cheer(.45); else if (!e.blocked && Math.random() < .12) cheer(.2); break; }
    case 'knockdown': thud(18, false, 'hay', 'head', true, { gain: .5, dip: false }); ooh(); roar(.75); txt('DOWN!', '#ff5a4a'); break;
    case 'clinch': clank(.35); txt('CLINCH', '#ebe7de'); break;
    case 'clinchShot': thud(3, false, 'jab', 'body', false, { gain: .5, dip: false }); break;
    case 'clinchBreak': whoosh(.3); txt('BREAK!', '#f0b20a'); break;
    case 'hazard': if (e.what === 'scrap') clank(.7); else if (e.what === 'puddle') whoosh(.5); else { whoosh(.8); ooh(); } if (e.what === 'heat') M.heatT = 3; txt({ scrap: 'SCRAP ON THE CANVAS', puddle: 'WATER ON THE CANVAS', fog: 'SEA FOG', heat: 'FURNACE FLARE' }[e.what], '#ffb36a'); break;
    case 'slick': whoosh(.4); ooh(); break;
    case 'malf': clank(.4); break;
    case 'bell': bell(2); cheer(.4); break;
    case 'round': bell(1); break;
    case 'end': bell(3); roar(1); break;
  }
}
function drawSlicksOn(c, slicks, t) {
  for (const sl of slicks || []) { const a = Math.min(1, sl.t / 1.5), sx = sl.x, sy = GROUND + sl.z * .34 + 4; c.save(); c.globalAlpha = a;
    if (sl.kind === 'scrap') { for (let i = 0; i < 9; i++) { const r1 = Math.sin(sl.x * 7.1 + i * 12.9) * .5 + .5, r2 = Math.sin(sl.x * 3.3 + i * 5.7) * .5 + .5; c.fillStyle = ['#5d6168', '#7a6248', '#8c8f94', '#3f4247'][i % 4]; c.save(); c.translate(sx + (r1 - .5) * sl.r * 2.2, sy + (r2 - .5) * sl.r * .5); c.rotate(r1 * 6); c.fillRect(-6, -2, 12 + r2 * 6, 3.5); c.restore(); } }
    else if (sl.kind === 'puddle') { c.globalAlpha = .55 * a; c.fillStyle = '#1d3a52'; c.beginPath(); c.ellipse(sx, sy, sl.r * 1.2, sl.r * .3, 0, 0, 7); c.fill(); c.globalAlpha = .3 * a; c.fillStyle = '#cfe8ff'; c.beginPath(); c.ellipse(sx - sl.r * .35, sy - 2, sl.r * .35, 2, -.1, 0, 7); c.fill(); }
    else { c.globalAlpha = .82 * a; c.fillStyle = '#09090b'; c.beginPath(); c.ellipse(sx, sy, sl.r * 1.15, sl.r * .32, 0, 0, 7); c.fill(); }
    c.restore(); }
}
function stepMenuBout(dt) {
  const M = menuScene; if (!M.F) newMenuBout(); const F = M.F;
  M.acc = Math.min(M.acc + dt, .2);
  while (M.acc >= DT) {
    M.acc -= DT;
    if (F.phase === 'fight' || F.phase === 'count') stepFight(F);
    else if (F.phase === 'break') { M.wait += DT; if (M.wait > 2.2) { M.wait = 0; startRound(F); } }
    else { M.wait += DT; if (M.wait > 4.5) { newMenuBout(); return; } }
    for (const e of F.events) { if (e.type === 'hit' && e.dmg > 0) { const d = F.f[1 - e.side]; M.sparks.push({ x: d.x - d.dir * 26, y: groundFor(d) - (e.target === 'head' ? 205 : 130), t: .3, big: !!(e.crit || e.kd), blk: !!e.blocked }); } menuSfx(M, F, e); }
    F.events.length = 0;
  }
  for (const sp of M.sparks) sp.t -= dt; M.sparks = M.sparks.filter(sp => sp.t > 0);
  for (const x of M.texts) x.t -= dt; M.texts = M.texts.filter(x => x.t > 0); M.heatT = Math.max(0, (M.heatT || 0) - dt);
}
function drawMenu(ts) {
  const cv = $('#menuCanvas'), c = cv.getContext('2d'), t = ts / 1000, M = menuScene; if (!M) return;
  const dtm = M.last ? Math.min(.1, t - M.last) : 0; M.last = t; stepMenuBout(dtm); const F = M.F, [fa, fb] = F.f;
  const cw = cv.width, ch = cv.height, port = ch > cw * 1.1, k = port ? cw / (W * .62) : Math.max(cw / W, ch / H) * 1.15;
  M.camX += ((fa.x + fb.x) / 2 - M.camX) * Math.min(1, dtm * 2);
  const cx = cw * (port ? .5 : .64), dx = clamp(cx - M.camX * k, cw - W * k, 0), dy = port ? ch * .8 - GROUND * k : (ch - H * k) / 2;
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#0b0c0e'; c.fillRect(0, 0, cw, ch);
  c.setTransform(k, 0, 0, k, dx, dy); c.globalAlpha = .55; c.drawImage(layerBack, 0, 0); drawCrowd(c, t, .55 + Math.sin(t * .5) * .15 + Math.min(.3, M.sparks.length * .08)); c.drawImage(layerRing, 0, 0); drawRingRopes(c, t); c.globalAlpha = 1;
  if (!M.splat) { M.splat = document.createElement('canvas'); M.splat.width = 900; M.splat.height = 600; const sx = M.splat.getContext('2d'); splatter(sx, 330, 300, 250, '#c7362f', 7); splatter(sx, 590, 300, 250, '#2a72a8', 11); splatter(sx, 460, 170, 150, '#f0b20a', 19); }
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'screen'; c.globalAlpha = .5; const sw = Math.min(cw * .7, ch * 1.4), bxs = M.camX * k + dx; c.drawImage(M.splat, bxs - sw / 2, GROUND * k + dy - sw * .62, sw, sw * .67); c.restore();
  drawSlicksOn(c, F.slicks, t);
  const order = [0, 1].sort((x, y) => F.f[x].z - F.f[y].z);
  for (const i of order) { const f = F.f[i], p = f.dur > 0 && f.dur < 90 ? f.stT / f.dur : (DOWN.has(f.st) ? f.stT / .55 : 0), step = f.st === 'strike' ? 14 : f.st === 'recover' && f.punch ? 5 : 0;
    c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(f.x, groundFor(f) + 2, 62, 9, 0, 0, 7); c.fill();
    drawRobot(c, { st: f.st, build: f.spec.build, paint: f.spec.paint, accent: f.spec.accent, decal: f.spec.decal, num: f.spec.num, tally: f.spec.tally, wear: f.spec.wear, wseed: f.spec.wseed, workbookCombat: f.spec.workbookCombat, x: f.x + f.dir * step, ground: groundFor(f), dir: f.dir, scale: zScale(f), pose: poseFrom(f.st, p, f.punch, t, f.walk, i), t,
      dmg: { hpF: f.hp / f.s.hp, kd: 0, head: frac(f, 'head'), lead: frac(f, 'lead'), rear: frac(f, 'rear'), legs: frac(f, 'legs'), lost: f.lost, glitch: f.glitchT > 0 || f.st === 'kneel', heat: f.heat }, scratches: M.scr[i], flash: 0 }); }
  drawFogBanks(c, t, Math.max(fa.fogT || 0, fb.fogT || 0) / 7);
  if (M.heatT > 0) { const g3 = c.createLinearGradient(0, H, 0, 0); g3.addColorStop(0, `rgba(255,110,20,${.3 * Math.min(1, M.heatT / 1.2)})`); g3.addColorStop(1, 'rgba(255,140,40,0)'); c.fillStyle = g3; c.fillRect(0, 0, W, H); }
  c.textAlign = 'center'; for (const x of M.texts) { c.globalAlpha = Math.min(1, x.t / .4); c.fillStyle = x.col; c.font = '600 34px Teko, sans-serif'; c.fillText(x.s, M.camX, 150 - (1.2 - x.t) * 20); } c.globalAlpha = 1; c.textAlign = 'left';
  for (const sp of M.sparks) { const a = sp.t / .3, r = (sp.big ? 34 : 18) * (1.4 - a); c.globalAlpha = a; c.fillStyle = sp.blk ? '#9fd3ff' : sp.big ? '#fff3c4' : '#ffd36a'; c.beginPath(); c.arc(sp.x, sp.y, r * .45, 0, 7); c.fill(); c.strokeStyle = c.fillStyle; c.lineWidth = 2.5; for (let j = 0; j < 6; j++) { const an = j * 1.05 + sp.x; c.beginPath(); c.moveTo(sp.x + Math.cos(an) * r * .5, sp.y + Math.sin(an) * r * .5); c.lineTo(sp.x + Math.cos(an) * r * 1.2, sp.y + Math.sin(an) * r * 1.2); c.stroke(); } }
  c.globalAlpha = 1;
  c.setTransform(1, 0, 0, 1, 0, 0);
  const vg = c.createRadialGradient(cw * .7, ch * .45, ch * .1, cw * .7, ch * .5, ch * .9); vg.addColorStop(0, 'rgba(8,9,11,.15)'); vg.addColorStop(1, 'rgba(8,9,11,.9)'); c.fillStyle = vg; c.fillRect(0, 0, cw, ch);
  const scale = k, bx = M.camX * k + dx, gy = GROUND * k + dy;
  c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, 'rgba(255,240,210,.2)'); g.addColorStop(1, 'rgba(255,240,210,.02)'); c.fillStyle = g; c.beginPath(); c.moveTo(bx - 30 * scale, 0); c.lineTo(bx + 30 * scale, 0); c.lineTo(bx + 170 * scale, gy); c.lineTo(bx - 170 * scale, gy); c.closePath(); c.fill(); c.globalCompositeOperation = 'source-over';
  if ((M.plateT -= dtm) <= 0) { M.plateT = .25; renderMenuPlate(); }
  const g2 = c.createLinearGradient(0, 0, cw * .6, 0); g2.addColorStop(0, 'rgba(8,9,11,.9)'); g2.addColorStop(1, 'rgba(8,9,11,0)'); c.fillStyle = g2; c.fillRect(0, 0, cw * .6, ch);
  menuRaf = requestAnimationFrame(drawMenu);
}
function startMenu() { const cv = $('#menuCanvas'); sizeCanvas(cv, cv.clientWidth || 960, cv.clientHeight || 540); cancelAnimationFrame(menuRaf); menuRaf = requestAnimationFrame(drawMenu); }
$('#scrMenu').addEventListener('click', e => { const b = e.target.closest('[data-menu]'); if (!b) return; const to = b.dataset.menu; if (to === 'quick') openVersus('quick'); else if (to === 'duo') openVersus('duo', { a: VS.a && VS.a !== VS.b ? VS.a : 'you', b: VS.b && VS.b !== 'you' ? VS.b : S.opp }); else if (to === 'exhibition') openVersus('exh', { a: VS.a === 'you' && VS.mode !== 'exh' ? ROSTER[Math.random() * ROSTER.length | 0].id : VS.a }); else showScreen(to); });
/* ---------- title: arena face-off backdrop ---------- */
let titleRaf = 0, TITLE = null;
function startTitleFx() {
  const cv = $('#titleCanvas'); if (!cv) return; sizeCanvas(cv, cv.clientWidth || 960, cv.clientHeight || 540);
  if (!TITLE) {
    const bg = document.createElement('canvas'); bg.width = W; bg.height = H; const x = bg.getContext('2d'), keep = curVenue;
    try { buildLayers('dome'); x.drawImage(layerBack, 0, 0); drawCrowd(x, 2.1, .7); x.drawImage(layerRing, 0, 0); drawRingRopes(x, 2.1); } catch (e) {}
    if (keep) try { buildLayers(keep); } catch (e) {}
    const splat = document.createElement('canvas'); splat.width = 1200; splat.height = 700; const sx = splat.getContext('2d'); splatter(sx, 330, 420, 330, '#c7362f', 41); splatter(sx, 870, 420, 330, '#2a72a8', 43);
    const champ = BOT(champOf(3).id);
    TITLE = { bg, splat, champ, embers: [], flashes: [], t0: performance.now() };
  }
  cancelAnimationFrame(titleRaf); titleRaf = requestAnimationFrame(drawTitle);
}
function drawTitle(ts) {
  const cv = $('#titleCanvas'), c = cv.getContext('2d'), T = TITLE, t = ts / 1000, cw = cv.width, ch = cv.height; if (!cw || curScreen !== 'title') return;
  const intro = clamp((performance.now() - T.t0) / 1600, 0, 1);
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#07080a'; c.fillRect(0, 0, cw, ch);
  const port = ch > cw * 1.1, k = Math.max(cw / W, ch / H) * (port ? 1.05 : 1.12), dx = (cw - W * k) / 2 + Math.sin(t * .07) * 14 * k, dy = (ch - H * k) / 2 + (port ? ch * .12 : 0);
  c.globalAlpha = .38 * intro; c.drawImage(T.bg, dx, dy, W * k, H * k); c.globalAlpha = 1;
  // camera flashes in the crowd
  if (Math.random() < .06) T.flashes.push({ x: Math.random() * cw, y: ch * (.35 + Math.random() * .25), life: .12 });
  c.globalCompositeOperation = 'lighter';
  for (const f of T.flashes) { f.life -= 1 / 60; softDot(c, f.x, f.y, 22 * k, '#ffffff', Math.max(0, f.life) * 4); } T.flashes = T.flashes.filter(f => f.life > 0);
  // sweeping searchlights
  for (const [x0, sp, ph, col] of [[.22, .45, 0, '255,90,70'], [.5, .3, 1.7, '255,240,210'], [.78, .5, 3.1, '90,160,255']]) {
    const ang = Math.sin(t * sp + ph) * .42, bx = cw * x0, len = ch * 1.15, w = 70 * k;
    c.save(); c.translate(bx, -10); c.rotate(ang); const g = c.createLinearGradient(0, 0, 0, len); g.addColorStop(0, `rgba(${col},${.22 * intro})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.beginPath(); c.moveTo(-w * .12, 0); c.lineTo(w * .12, 0); c.lineTo(w, len); c.lineTo(-w, len); c.closePath(); c.fill(); c.restore();
  }
  c.globalCompositeOperation = 'screen'; c.globalAlpha = .6 * intro; const sw = Math.min(cw * 1.1, ch * 1.9); c.drawImage(T.splat, cw / 2 - sw / 2, ch - sw * .62, sw, sw * .58); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  // the face-off: your bot vs the champion, low and backlit
  const sc = port ? Math.min(cw / 420, ch / 700) : Math.min(ch / 340, cw / 760), gy = ch * (port ? .97 : 1.02), slide = (1 - ease(intro)) * cw * .25, P = playerSpec();
  for (const [spec, x, dir, i] of [[P, cw * (port ? .27 : .24) - slide, 1, 0], [T.champ, cw * (port ? .73 : .76) + slide, -1, 1]]) {
    softDot(c, x, gy - 170 * sc, 190 * sc, i ? '#2a72a8' : '#c7362f', .35);
    c.save(); if ('filter' in c) c.filter = 'brightness(.55) saturate(.8)';
    drawRobot(c, { st: 'idle', build: spec.build, paint: spec.paint, accent: spec.accent, decal: spec.decal, num: spec.num, tally: spec.tally, wear: spec.wear, wseed: spec.wseed || 4242, x, ground: gy, dir, scale: sc, pose: poseFrom('idle', 0, null, t + i * .7, 0, i), t });
    c.restore();
  }
  // embers rising
  if (T.embers.length < 70 && Math.random() < .5) T.embers.push({ x: Math.random() * cw, y: ch + 10, vx: (Math.random() - .5) * 20, vy: -(30 + Math.random() * 70), life: 3 + Math.random() * 3, s: 1 + Math.random() * 2.2 });
  c.globalCompositeOperation = 'lighter';
  for (const e of T.embers) { e.life -= 1 / 60; e.x += (e.vx + Math.sin(t * 2 + e.y * .02) * 12) / 60; e.y += e.vy / 60; c.globalAlpha = clamp(e.life / 2, 0, .9) * intro; c.fillStyle = e.s > 2.2 ? '#ffd36a' : '#ff7a2a'; c.beginPath(); c.arc(e.x, e.y, e.s * (cw / 1400 + .5), 0, 7); c.fill(); }
  T.embers = T.embers.filter(e => e.life > 0 && e.y > -20); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  // floor haze + vignette
  const fg = c.createLinearGradient(0, ch * .62, 0, ch); fg.addColorStop(0, 'rgba(7,8,10,0)'); fg.addColorStop(1, 'rgba(7,8,10,.85)'); c.fillStyle = fg; c.fillRect(0, ch * .62, cw, ch * .38);
  const vg = c.createRadialGradient(cw / 2, ch * .45, ch * .15, cw / 2, ch * .5, Math.max(cw, ch) * .75); vg.addColorStop(0, 'rgba(7,8,10,0)'); vg.addColorStop(1, 'rgba(7,8,10,.9)'); c.fillStyle = vg; c.fillRect(0, 0, cw, ch);
  const lg = c.createRadialGradient(cw / 2, ch * .42, 10, cw / 2, ch * .42, Math.min(cw, ch) * .5); lg.addColorStop(0, 'rgba(7,8,10,.55)'); lg.addColorStop(1, 'rgba(7,8,10,0)'); c.fillStyle = lg; c.fillRect(0, 0, cw, ch);
  titleRaf = requestAnimationFrame(drawTitle);
}
addEventListener('resize', () => { if (curScreen === 'title') startTitleFx(); });
/* ---------- controllers ---------- */
const PAD = { prev: {}, rep: {}, on: false, raf: 0 };
function padKey(key, extra) { const t = DR ? document.body : (document.activeElement && document.activeElement !== document.body ? document.activeElement : document.body); t.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...(extra || {}) })); }
function padPoll() {
  if (PAD.blocked) return;
  let list; try { list = navigator.getGamepads ? navigator.getGamepads() : []; } catch (err) { PAD.blocked = true; PAD.raf = 0; return; }
  PAD.raf = requestAnimationFrame(padPoll);
  const pads = [...(list || [])].filter(Boolean); if (!pads.length) return;
  const now = performance.now();
  pads.forEach((gp, pi) => {
    const prev = PAD.prev[pi] || [], B = gp.buttons.map(b => b.pressed || b.value > .5), ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    const dir = { up: B[12] || ay < -.55, down: B[13] || ay > .55, left: B[14] || ax < -.55, right: B[15] || ax > .55 };
    const hit = i => B[i] && !prev[i]; PAD.prev[pi] = B;
    if (B.some(Boolean) || Object.values(dir).some(Boolean)) { if (!PAD.on) { PAD.on = true; document.body.classList.add('padmode'); toast('Controller connected'); } }
    const inFight = curScreen === 'arena' && G;
    if (inFight) { padFight(gp, pi, B, hit, dir, ax, ay); return; }
    if (pi > 0) return;
    // menus: repeat directions
    for (const [d, key] of [['up', 'ArrowUp'], ['down', 'ArrowDown'], ['left', 'ArrowLeft'], ['right', 'ArrowRight']]) {
      const r = PAD.rep[d] || (PAD.rep[d] = { on: false, next: 0 });
      if (dir[d]) { if (!r.on) { r.on = true; r.next = now + 380; padKey(key); } else if (now > r.next) { r.next = now + 130; padKey(key); } } else r.on = false;
    }
    if (DR) { if (hit(0)) { if (!DR.started || DR.done) padKey('Enter'); else drillPress('a'); } if (hit(1) || hit(2)) { if (DR.g.lab.b) drillPress('b'); else drillPress('a'); } if (hit(9)) padKey('Escape'); return; }
    if (hit(0) || hit(9)) { const el = document.activeElement; if (curScreen !== 'versus' && el && el !== document.body && el.matches('button,[role=tab],a')) el.click(); else padKey('Enter'); }
    if (hit(1)) padKey('Escape'); if (hit(2)) padKey('r'); if (hit(3)) padKey('Tab'); if (hit(4)) padKey('q'); if (hit(5)) padKey('e'); if (hit(6)) padKey('v'); if (hit(7)) padKey('b');
    if (hit(8)) padKey(curScreen === 'versus' ? (VS.mode === 'exh' ? 'f' : 'w') : 'c');
  });
}
function padFight(gp, pi, B, hit, dir, ax, ay) {
  const F = G.F, side = F.duo ? pi : 0; if (side > 1 || (!F.duo && pi > 0)) return;
  if (hit(9)) { if (G.intro) skipIntro(); else pauseGame(!G.paused); return; }
  if (G.paused) { if (hit(1)) pauseGame(false); return; }
  if (G.replay) { if (hit(0)) endReplay(); return; }
  if (G.intro) { if (hit(0)) skipIntro(); return; }
  if (G.modal === 'corner') { if (hit(0)) ringBell(); return; }
  if (G.modal === 'result') { if (hit(0)) ($('#nextBtn') || $('#rematchBtn'))?.click(); if (hit(1)) $('#lobbyBtn')?.click(); return; }
  if (G.spectate) return;
  if (!F.duo && F.phase === 'count' && hit(0)) { pressReboot(); return; }
  if (!F.duo && F.phase === 'finisher') { if (hit(3)) chooseFinish(F, 0, 'destroy'); if (hit(1)) chooseFinish(F, 0, 'spare'); return; }
  if (!F.duo && hit(8)) { setControl(F.controlMode === 'pilot' ? 'coach' : 'pilot'); return; }
  const H = G.padHeld[side]; H.clear();
  if (F.controlMode === 'pilot') {
    if (dir.left) H.add('left'); if (dir.right) H.add('right'); if (dir.up) H.add('far'); if (dir.down) H.add('near'); if (B[6]) H.add('guard');
    const map = { 0: 'jab', 1: 'cross', 2: 'hook', 3: 'upper', 4: 'slipFar', 5: 'slipNear', 7: 'sig' };
    for (const i in map) if (hit(+i)) issue(F, side, map[i]);
  } else { const map = { 0: 'head', 1: 'body', 2: 'guard', 3: 'hay' }; for (const i in map) if (hit(+i)) issue(F, 0, map[i]); }
}
addEventListener('gamepadconnected', () => { if (!PAD.raf && !PAD.blocked) padPoll(); });
try { if (navigator.getGamepads) padPoll(); } catch (err) { PAD.blocked = true; }
if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
/* ---------- title / boot ---------- */
let titleEntryPending = false, titleAudioUnlocked = false;
function restoreRequestedAudio() {
  let changed = false;
  for (const [key, value] of [['music', .6], ['crowd', .8], ['sfx', .85], ['voice', .9]]) {
    if (!(Number(S.opt[key]) > 0)) { S.opt[key] = value; changed = true; }
  }
  if (!S.opt.commentary) { S.opt.commentary = true; changed = true; }
  if (!S.opt.announcer) { S.opt.announcer = true; changed = true; }
  if (changed) save();
}
function pressStart() {
  if (curScreen !== 'title' || screenFadePending || titleEntryPending) return;
  if (!titleAudioUnlocked) {
    // Chrome blocks sound until this gesture. Use the first input only to
    // unlock playback so the boot/title screen can remain up with music.
    titleAudioUnlocked = true;
    restoreRequestedAudio();
    menuVenuePending = ['dome', 'arena', 'drain', 'harbor', 'lot'][Math.random() * 5 | 0];
    curVenue = menuVenuePending;
    initAudio(); shutUp(); setTheme('menu'); setScreenMusic('loading', true, 180);
    crowdStage = .70;
    primeCrowdAudioForGesture();
    const prompt = $('#titlePrompt'); if (prompt) prompt.textContent = 'SOUND ON · PRESS ANY KEY TO ENTER';
    return;
  }
  titleEntryPending = true;
  showScreen('menu');
  setTimeout(() => { titleEntryPending = false; }, 500);
}
$('#scrTitle').addEventListener('click', pressStart);
document.addEventListener('keydown', e => {
  if (DR) { drillKey(e); return; }
  if (keyWait && curScreen === 'settings') { e.preventDefault(); const k = e.key.toLowerCase(); if (k !== 'escape') { S.opt.keys = S.opt.keys || {}; for (const a in S.opt.keys) if (S.opt.keys[a] === k) delete S.opt.keys[a]; S.opt.keys[keyWait] = k; rebuildKeys(); save(); toast(`${KEY_ACTIONS.find(x => x[0] === keyWait)[1]}: ${keyName(k)}`); } keyWait = ''; renderSettings(); return; }
  const tag = e.target.tagName;
  if (curScreen === 'title') { if (!e.metaKey && !e.ctrlKey) { e.preventDefault(); pressStart(); } return; }
  if (curScreen === 'arena') { if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return; if (arenaKey(e, true)) e.preventDefault(); return; }
  if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
  if (curScreen === 'menu') { if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); setMenuSel(menuSel + 1, true); uiClick(); return; } if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); setMenuSel(menuSel - 1, true); uiClick(); return; } if (e.key === 'Enter' && !e.target.closest('.mitem')) { e.preventDefault(); $$('#mnav .mitem')[menuSel].click(); return; } }
  if (curScreen === 'career' && $('#venueModal').hidden) { const k = e.key.toLowerCase();
    if (k === 'escape') { if (carPanel) showCarPanel(''); else showScreen('menu'); return; }
    if (!carPanel && (k === 'arrowleft' || k === 'arrowright' || k === 'arrowup' || k === 'arrowdown')) { e.preventDefault(); const cols = Math.max(1, getComputedStyle($('#cTiles')).gridTemplateColumns.split(' ').length), t = $$('#cTiles .ctile'), i = carSel;
      let n = k === 'arrowleft' ? i - 1 : k === 'arrowright' ? i + 1 : i === 0 ? (k === 'arrowdown' ? 1 : t.length - 1) : k === 'arrowdown' ? i + cols : i - cols; if (n < 0) n = 0; if (n >= t.length) n = t.length - 1; setCarSel(n, true); uiClick(); return; }
    if (k === 'enter' && !e.target.closest('button,input,select')) { e.preventDefault(); $$('#cTiles .ctile')[carSel]?.click(); return; }
    if (k === 'g') { showScreen('garage'); return; }
    if (k === 'c') { S.ctrl = S.ctrl === 'pilot' ? 'coach' : 'pilot'; save(); renderCareer(); return; }
  }
  if (curScreen === 'versus') { const k = e.key.toLowerCase(); if (k === 'enter') { e.preventDefault(); vsGo(false); return; } if ((k === 'w' && VS.mode === 'quick') || (k === 'f' && VS.mode === 'exh')) { vsGo(true); return; } if (k === 'arrowleft' || k === 'arrowright') { e.preventDefault(); vsCycle(1, k === 'arrowleft' ? -1 : 1); return; } if (k === 'q' || k === 'e' || k === 'a' || k === 'd') { vsCycle(0, k === 'q' || k === 'a' ? -1 : 1); return; } if (k === 'v') { vsSet('v', e.shiftKey ? -1 : 1); return; } if (k === 'b') { vsSet('r', 1); return; } if (k === 'n') { vsSet('l', e.shiftKey ? -1 : 1); return; } if (k === 'r') { vsRandom(); return; } if (k === 'tab') { e.preventDefault(); vsRatings(); return; } if (k === 'f1') { e.preventDefault(); showScreen('help'); return; } if (k === 'escape') { if (!$('#vsRatings').hidden) $('#vsRatings').hidden = true; else vsBack(); return; } }
  if (e.key === 'Escape') { if (!$('#venueModal').hidden) { $('#venueModal').hidden = true; return; } if (curScreen !== 'menu') showScreen(curScreen === 'workshop' ? 'garage' : 'menu'); }
});
document.addEventListener('keyup', e => { if (curScreen === 'arena') arenaKey(e, false); });
function boot() {
  rebuildKeys(); applyA11y(); worldInit(); venueThumbs(); initIndex();
  window.addEventListener('resize', () => { if (curScreen === 'arena') sizeArena(); else if (curScreen === 'garage') startBay(); else if (curScreen === 'workshop') startWs(); else if (curScreen === 'menu') startMenu(); else if (curScreen === 'career') startHub(); });
  const t = $('#titleBot'); if (t) { const c = t.getContext('2d'); drawRobot(c, { st: 'idle', build: S.build, paint: S.paint, accent: S.accent, decal: S.decal, wear: S.wear, wseed: 4242, x: 150, ground: 290, dir: 1, scale: 1, pose: poseFrom('victory', 0, null, 0, 0, 0), t: 0 }); }
  // Do not attempt loading music during boot. Chrome rejects autoplay before
  // the player interacts, so the track starts from pressStart's gesture.
  applyScreenNow('title');
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { const keep = curVenue; venueThumbs(); if (keep) buildLayers(keep); if (curScreen === 'career') renderCareer(); if (curScreen === 'index') renderIndex(); });
}

function partByAny(id) { for (const pool in PARTS) { const q = PARTS[pool].find(x => x.id === id); if (q) return { pool, q }; } return null; }
