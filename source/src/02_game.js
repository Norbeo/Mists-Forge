/* ═══════════════════════ Règles : la mine, la grille, les tours ═══════════════════════ */
let S = null;
function newSave() {
  return { v: 2, ore: { fer: 0, argent: 0, ame: 0 }, braises: 0,
    weapons: { marteau: { tier: 0, q: 1 } }, equip: { wpn: "marteau", armor: 0, armorQ: 1, rune: null },
    runes: [], pet: "loup", up: { pv: 0, potion: 0, sacoche: 0, dressage: 0, raccourci: 0 },
    best: 0, bossDepth: 0, runs: 0, deaths: 0, kills: 0, run: null, seen: {}, tuto: {}, opts: { sound: 1, music: 1, fast: 0 }, created: Date.now() };
}
const DIRS8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const DIRS4 = DIRS8.slice(0, 4);
const inB = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
const sgn = v => v > 0 ? 1 : v < 0 ? -1 : 0;
const key = (x, y) => x + "," + y;

// ── héros ──
function heroDmg(run) { const W = WEAPONS[S.equip.wpn], w = S.weapons[S.equip.wpn]; return W.dmg + w.tier + (QUALITY[w.q].b) + run.boons.filter(b => b === "force").length; }
function heroHpMax() { return 6 + ARMOR[S.equip.armor].hp + (S.equip.armor ? QUALITY[S.equip.armorQ].b : 0) + S.up.pv; }
function heroMoves(run) { return 1 + (S.equip.rune === "pas" ? 1 : 0) + run.boons.filter(b => b === "leger").length; }
function smithLook() { const w = S.weapons[S.equip.wpn]; const at = ARMOR[S.equip.armor].look + (S.equip.armor && S.equip.armorQ === 2 && S.equip.armor < 3 ? 1 : 0); return { cls: "forgeron", tier: Math.min(5, at), wtier: TIERS[w.tier].look + (w.q === 2 ? 1 : 0), wpn: WEAPONS[S.equip.wpn].art, skin: "#d0a07a", hair: 1, hairCol: "#2a1a10", beard: 2, scar: 0 }; }
function smithKey() { const L = smithLook(); return [L.tier, L.wtier, L.wpn].join("|"); }

// ── descente ──
function startRun() {
  const start = S.up.raccourci && S.bossDepth ? S.bossDepth + 1 : 1;
  S.run = { depth: start, start, hp: heroHpMax(), potions: 1 + S.up.potion, boons: [], loot: { fer: 0, argent: 0, ame: 0 }, embers: 0, kills: 0, board: null, petHp: 3 + S.up.dressage, stats: { floors: 0 } };
  S.runs++;
  S.run.board = genFloor(S.run.depth);
  return S.run;
}
const isBossFloor = d => d % 5 === 0;
function oreFor(depth, rng = RNG) { const up = S && S.run && S.run.boons.includes("oeil") ? 4 : 0; const d = depth + up; if (d >= 16 && rng.chance(.12)) return "ame"; if (d >= 11) return rng.chance(.7) ? "argent" : "fer"; if (d >= 6) return rng.chance(.4) ? "argent" : "fer"; return "fer"; }
function genFloor(depth, seed) {
  const rng = seed ? mkRng(seed) : RNG;
  for (let tries = 0; tries < 60; tries++) {
    const T = []; for (let y = 0; y < ROWS; y++) { T.push([]); for (let x = 0; x < COLS; x++) T[y].push({ t: "floor" }); }
    const boss = isBossFloor(depth);
    const walls = boss ? rng.int(1, 2) : rng.int(3, 5);
    const free = (x, y) => y < ROWS - 1 && !(y === ROWS - 2 && x === 2) && T[y][x].t === "floor";
    for (let i = 0; i < walls; i++) { const x = rng.int(0, COLS - 1), y = rng.int(1, ROWS - 2); if (free(x, y)) T[y][x] = { t: "wall" }; }
    const veins = boss ? 1 : rng.int(1, 3);
    for (let i = 0; i < veins; i++) { const x = rng.int(0, COLS - 1), y = rng.int(1, ROWS - 2); if (free(x, y)) T[y][x] = { t: "ore", ore: oreFor(depth, rng), n: 1 + (rng.chance(.35) ? 1 : 0) }; }
    if (depth >= 3) { const sp = rng.int(0, depth >= 8 ? 3 : 2); for (let i = 0; i < sp; i++) { const x = rng.int(0, COLS - 1), y = rng.int(1, ROWS - 2); if (free(x, y)) T[y][x] = { t: "spikes", on: rng.chance(.5) }; } }
    if (depth >= 12) { const lv = rng.int(0, 2); for (let i = 0; i < lv; i++) { const x = rng.int(0, COLS - 1), y = rng.int(1, ROWS - 3); if (free(x, y)) T[y][x] = { t: "lava" }; } }
    // tout doit rester accessible
    const open = (x, y) => T[y][x].t !== "wall" && T[y][x].t !== "ore";
    const seen = new Set([key(2, ROWS - 1)]), q = [[2, ROWS - 1]];
    while (q.length) { const [x, y] = q.shift(); for (const [dx, dy] of DIRS4) { const nx = x + dx, ny = y + dy; if (inB(nx, ny) && open(nx, ny) && !seen.has(key(nx, ny))) { seen.add(key(nx, ny)); q.push([nx, ny]); } } }
    let total = 0; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (open(x, y)) total++;
    if (seen.size < total) continue;
    const B = { tiles: T, units: [], turn: 0, phase: "player", mv: 0, atk: 0, cleared: false, stairs: null, uid: 1, depth, boss, ev: [], rng };
    addUnit(B, { kind: "hero", side: "h", x: 2, y: ROWS - 1, hp: S.run ? S.run.hp : heroHpMax() });
    if (S.pet && S.run && S.run.petHp > 0) addUnit(B, { kind: "pet", side: "p", pet: S.pet, x: 1, y: ROWS - 1, hp: S.run.petHp, hpMax: 3 + S.up.dressage, n: 0 });
    // ennemis
    const spots = []; for (let y = 0; y < (boss ? 3 : 4); y++) for (let x = 0; x < COLS; x++) if (T[y][x].t === "floor") spots.push([x, y]);
    rng.shuffle(spots);
    if (boss) {
      const Bo = BOSSES[(depth / 5 - 1) % BOSSES.length], cyc = Math.floor((depth / 5 - 1) / BOSSES.length);
      const bx = 2, by = 1; T[by][bx] = { t: "floor" };
      addUnit(B, { kind: "boss", side: "e", boss: Bo.id, x: bx, y: by, hp: Bo.hp + cyc * 8 + Math.floor(depth / 4), dmg: Bo.dmg + cyc, n: 0 });
      const mins = 1 + (depth >= 10 ? 1 : 0); let k = 0; for (const [x, y] of spots) { if (k >= mins) break; if (cheb({ x, y }, { x: bx, y: by }) < 1) continue; addUnit(B, mkFoe(Bo.summon || "squelette", x, y, depth)); k++; }
    } else {
      const n = clamp(2 + Math.floor(depth / 3) + (rng.chance(.4) ? 1 : 0), 2, 6);
      const pool = Object.keys(MONSTERS).filter(k => (MONSTERS[k].from || 1) <= depth);
      for (let i = 0; i < n && i < spots.length; i++) { const [x, y] = spots[i]; addUnit(B, mkFoe(rng.weighted(pool, k => k === "golem" || k === "cultiste" ? .5 : k === "gelee" ? .7 : 1), x, y, depth)); }
    }
    B.mv = heroMoves(S.run || { boons: [] }); B.atk = 1; B.blocks = (S.equip.rune === "roc" ? 1 : 0) + ((S.run ? S.run.boons : []).filter(b => b === "pierre").length);
    planAll(B);
    return B;
  }
  throw new Error("génération impossible");
}
function mkFoe(k, x, y, depth) { const M = MONSTERS[k]; return { kind: "foe", side: "e", foe: k, x, y, hp: M.hp + Math.floor((depth - 1) / 5), dmg: M.dmg + Math.floor(depth / 9), fuse: M.fuse || 0, n: 0 }; }
function addUnit(B, u) { u.id = B.uid++; u.hpMax = u.hpMax || u.hp; u.st = u.st || {}; B.units.push(u); return u; }
const hero = B => B.units.find(u => u.kind === "hero");
const unitAtXY = (B, x, y) => B.units.find(u => u.x === x && u.y === y && u.hp > 0 && !u.under);
const foes = B => B.units.filter(u => u.side === "e" && u.hp > 0);
const tileAt = (B, x, y) => inB(x, y) ? B.tiles[y][x] : null;
const solid = t => !t || t.t === "wall" || t.t === "ore";
function walkable(B, x, y, fly) { const t = tileAt(B, x, y); if (!t || solid(t)) return false; if (!fly && t.t === "lava") return false; return !unitAtXY(B, x, y); }

// ── déplacement du héros ──
function reachable(B, u, steps, fly) {
  const out = new Map(); out.set(key(u.x, u.y), 0); const q = [[u.x, u.y, 0]];
  while (q.length) { const [x, y, d] = q.shift(); if (d >= steps) continue; for (const [dx, dy] of DIRS8) { const nx = x + dx, ny = y + dy; if (!inB(nx, ny) || out.has(key(nx, ny))) continue; const t = tileAt(B, nx, ny); if (solid(t) && !fly) continue; if (solid(t)) continue; if (unitAtXY(B, nx, ny)) continue; if (t.t === "lava" && !fly) continue; out.set(key(nx, ny), d + 1); q.push([nx, ny, d + 1]); } }
  out.delete(key(u.x, u.y)); return out;
}
// cases touchées par l'arme si on vise (tx, ty)
function weaponTargets(B, h) {
  const W = WEAPONS[S.equip.wpn], res = [];
  if (W.all) { if (DIRS8.some(([dx, dy]) => { const u = unitAtXY(B, h.x + dx, h.y + dy); return u && u.side === "e"; })) for (const [dx, dy] of DIRS8) res.push({ x: h.x + dx, y: h.y + dy, tiles: DIRS8.map(([a, b]) => [h.x + a, h.y + b]).filter(([a, b]) => inB(a, b)) }); return res; }
  for (const [dx, dy] of DIRS8) {
    for (let r = 1; r <= W.reach; r++) {
      const x = h.x + dx * r, y = h.y + dy * r; if (!inB(x, y)) break;
      const t = tileAt(B, x, y), u = unitAtXY(B, x, y);
      if (W.reach > 1 && r > 1 && !W.line) break;
      if (u && u.side === "e" || t.t === "ore") {
        let tiles = [[x, y]];
        if (W.pierce) tiles = [[h.x + dx, h.y + dy], [h.x + dx * 2, h.y + dy * 2]].filter(([a, b]) => inB(a, b));
        if (W.arc) { const side = dx && dy ? [[dx, 0], [0, dy]] : dx ? [[dx, 1], [dx, -1]] : [[1, dy], [-1, dy]]; for (const [a, b] of side) if (inB(h.x + a, h.y + b)) tiles.push([h.x + a, h.y + b]); }
        if (t.t === "ore" && !(u && u.side === "e")) { if (r === 1) res.push({ x, y, mine: 1, tiles: [[x, y]] }); break; }
        res.push({ x, y, dir: [dx, dy], tiles });
        if (W.shot || !W.pierce) break;
      }
      if (solid(t) || (u && !W.pierce)) break;
    }
  }
  return res;
}
// ── actions du joueur ──  (chacune renvoie une liste d'événements pour l'animation)
function heroMove(B, x, y) {
  const h = hero(B); if (B.phase !== "player" || h.st.web) return null;
  const R = reachable(B, h, B.mv); const d = R.get(key(x, y)); if (d == null) return null;
  const ev = [{ k: "move", id: h.id, from: [h.x, h.y], to: [x, y] }]; h.x = x; h.y = y; B.mv -= d;
  const t = tileAt(B, x, y);
  if (t.t === "spikes" && t.on) hurt(B, h, 1, ev, "Piques");
  if (t.t === "stairs") { ev.push({ k: "descend" }); B.descend = true; }
  return ev;
}
function heroAttack(B, x, y) {
  const h = hero(B); if (B.phase !== "player" || B.atk <= 0) return null;
  const tg = weaponTargets(B, h).find(t => t.x === x && t.y === y); if (!tg) return null;
  B.atk--;
  const ev = [{ k: "atk", id: h.id, to: [x, y], tiles: tg.tiles }];
  if (tg.mine) { mine(B, x, y, ev); return ev; }
  const W = WEAPONS[S.equip.wpn], run = S.run, dmg = heroDmg(run);
  const hits = (S.equip.rune === "echo" && !B.echoUsed) ? 2 : 1; B.echoUsed = true;
  for (let i = 0; i < hits; i++) for (const [tx, ty] of tg.tiles) {
    const u = unitAtXY(B, tx, ty); if (!u || u.side !== "e" || u.hp <= 0) continue;
    if (u.st.phased) { ev.push({ k: "phase", id: u.id }); continue; }
    const killed = hurt(B, u, dmg + (u.st.mark ? 1 : 0), ev);
    if (!killed) {
      if (W.stun) { u.st.stun = 1; u.intent = null; ev.push({ k: "stun", id: u.id }); }
      if (S.equip.rune === "braise" || run.boons.includes("braise")) u.st.burn = 1;
      if (W.push && i === 0) push(B, u, tg.dir, ev);
    } else { if (W.vamp) healU(B, h, 1, ev); if (run.boons.includes("vampire") && chance(.35)) healU(B, h, 1, ev); if (run.boons.includes("furie") && !B.furyUsed) { B.furyUsed = true; B.atk++; ev.push({ k: "msg", text: "Furie !" }); } }
  }
  checkClear(B, ev);
  return ev;
}
function mine(B, x, y, ev) {
  const t = tileAt(B, x, y); const n = t.n + (S.equip.rune === "fortune" ? 1 : 0) + S.run.boons.filter(b => b === "prospecteur").length;
  S.run.loot[t.ore] += n; ev.push({ k: "mine", x, y, ore: t.ore, n });
  B.tiles[y][x] = { t: "floor", rubble: 1 };
}
function push(B, u, dir, ev) {
  const nx = u.x + dir[0], ny = u.y + dir[1]; const bonus = 1 + S.run.boons.filter(b => b === "choc").length;
  const t = tileAt(B, nx, ny), other = inB(nx, ny) ? unitAtXY(B, nx, ny) : null;
  if (!t || solid(t) || other) { ev.push({ k: "bump", id: u.id, dir }); hurt(B, u, bonus, ev, "Choc"); if (other) hurt(B, other, 1, ev, "Choc"); return; }
  ev.push({ k: "push", id: u.id, from: [u.x, u.y], to: [nx, ny] }); u.x = nx; u.y = ny; u.intent = null;
  if (t.t === "spikes" && t.on) hurt(B, u, 1, ev, "Piques");
  if (t.t === "lava" && !isFlying(u)) hurt(B, u, 3, ev, "Lave");
}
function isFlying(u) { return u.kind === "foe" ? !!MONSTERS[u.foe].fly : u.kind === "pet" ? !!PETS[u.pet].fly : false; }
function hurt(B, u, d, ev, src) {
  if (u.hp <= 0) return false;
  if (u.kind === "hero" && B.blocks > 0 && src !== "Piques") { B.blocks--; ev.push({ k: "block", id: u.id }); return false; }
  if (u.under) return false;
  u.hp = Math.max(0, u.hp - d); ev.push({ k: "hit", id: u.id, dmg: d, src });
  if (u.hp <= 0) { die(B, u, ev); return true; }
  return false;
}
function die(B, u, ev) {
  ev.push({ k: "die", id: u.id });
  if (u.side === "e") {
    S.run.kills++; S.kills++;
    if (u.kind === "foe" && u.foe === "gelee") explode(B, u, ev);
    const pet = B.units.find(p => p.kind === "pet");
    const dropC = .22 + (pet && PETS[pet.pet].loot && pet.lastHit === u.id ? .5 : 0);
    if (u.kind === "foe" && chance(dropC)) { const o = oreFor(B.depth); S.run.loot[o]++; ev.push({ k: "drop", x: u.x, y: u.y, ore: o, n: 1 }); }
    if (u.kind === "boss") { const n = 2 + Math.floor(B.depth / 10) + (S.equip.rune === "fortune" ? 1 : 0); S.run.loot.ame += n; ev.push({ k: "drop", x: u.x, y: u.y, ore: "ame", n }); B.bossDead = true; for (const m of foes(B)) if (m !== u) { m.hp = 0; ev.push({ k: "die", id: m.id }); } }
  }
}
function explode(B, u, ev) {
  ev.push({ k: "boom", x: u.x, y: u.y });
  for (const [dx, dy] of [[0, 0], ...DIRS8]) { const v = unitAtXY(B, u.x + dx, u.y + dy); if (v && v !== u && v.hp > 0) hurt(B, v, u.dmg, ev, "Explosion"); }
}
function healU(B, u, v, ev) { const mx = u.kind === "hero" ? heroHpMax() + S.run.boons.filter(b => b === "coeur").length * 2 : u.hpMax; const r = Math.min(v, mx - u.hp); if (r > 0) { u.hp += r; ev.push({ k: "heal", id: u.id, v: r }); } }
function usePotion(B) { const h = hero(B); if (S.run.potions <= 0 || B.phase !== "player") return null; S.run.potions--; const ev = [{ k: "potion", id: h.id }]; healU(B, h, 3, ev); h.st.web = 0; return ev; }
function checkClear(B, ev) {
  if (B.cleared || foes(B).length) return;
  B.cleared = true; B.mv = 99; B.atk = 0; B.rocks = null;
  // les filons restants s'effondrent ; l'escalier apparaît
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (B.tiles[y][x].t === "ore") { B.tiles[y][x] = { t: "floor", rubble: 1 }; ev.push({ k: "collapse", x, y }); }
  const h = hero(B); let best = null; const R = reachable(B, h, 99);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const t = B.tiles[y][x]; if (t.t === "floor" && R.has(key(x, y)) && (!best || y < best[1] || (y === best[1] && Math.abs(x - 2) < Math.abs(best[0] - 2)))) best = [x, y]; }
  if (!best) best = [h.x, Math.max(0, h.y - 1)];
  B.tiles[best[1]][best[0]] = { t: "stairs" }; B.stairs = best; ev.push({ k: "stairs", x: best[0], y: best[1] });
}
// ── fin du tour : compagnon puis ennemis ──
function endPlayerTurn(B) {
  const ev = [];
  if (B.phase !== "player") return ev;
  B.phase = "enemy";
  const h = hero(B); h.st.web = 0;
  petTurn(B, ev);
  // les attaques annoncées tombent
  for (const e of foes(B).slice()) {
    if (e.hp <= 0) continue;
    if (e.st.stun) { e.st.stunned = 1; e.st.stun = 0; continue; }
    if (e.intent && (e.intent.tiles || e.intent.type === "summon")) { execIntent(B, e, ev); if (hero(B).hp <= 0) break; }
  }
  if (hero(B).hp > 0) {
    // brûlures, piques
    for (const u of B.units.filter(u => u.hp > 0 && u.st.burn)) { u.st.burn = 0; hurt(B, u, 1, ev, "Brûlure"); }
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const t = B.tiles[y][x]; if (t.t === "spikes") { t.on = !t.on; if (t.on) { const u = unitAtXY(B, x, y); if (u && !isFlying(u)) hurt(B, u, 1, ev, "Piques"); } } }
    ev.push({ k: "spikes" });
    // la mine gronde : au-delà de 10 tours, des rochers tombent (annoncés un tour à l'avance)
    if (B.rocks) { for (const [x, y] of B.rocks) { ev.push({ k: "rock", x, y }); const u = unitAtXY(B, x, y); if (u) hurt(B, u, 1, ev, "Éboulement"); } B.rocks = null; }
    if (B.turn >= 10 && !B.cleared) { B.rocks = []; const h2 = hero(B); B.rocks.push([h2.x, h2.y]); for (let i = 0; i < 2 + Math.floor((B.turn - 10) / 3); i++) { const x = B.rng.int(0, COLS - 1), y = B.rng.int(0, ROWS - 1); if (!solid(tileAt(B, x, y))) B.rocks.push([x, y]); } ev.push({ k: "rumble" }); }
    // les ennemis avancent et annoncent leur prochain coup
    for (const e of foes(B)) { e.n++; if (e.st.mark) e.st.mark--; if (hero(B).hp > 0) moveFoe(B, e, ev); }
    planAll(B);
    checkClear(B, ev);
  }
  B.turn++; B.phase = "player"; B.mv = B.cleared ? 99 : heroMoves(S.run); B.atk = B.cleared ? 0 : 1; B.echoUsed = false; B.furyUsed = false;
  if (hero(B).hp <= 0) { B.phase = "dead"; ev.push({ k: "dead" }); }
  return ev;
}
function execIntent(B, e, ev) {
  const I = e.intent; e.intent = null;
  if (I.type === "summon") { const spot = DIRS8.map(([dx, dy]) => [e.x + dx, e.y + dy]).find(([x, y]) => walkable(B, x, y)); if (spot && foes(B).length < 7) { const m = addUnit(B, mkFoe(I.what, spot[0], spot[1], B.depth)); ev.push({ k: "spawn", id: m.id }); } return; }
  if (I.type === "burrow") { e.under = 1; e.x = I.tiles[0][0]; e.y = I.tiles[0][1]; ev.push({ k: "burrow", id: e.id }); e.emerge = I.at; return; }
  if (I.type === "emerge") { e.under = 0; let at = I.at; if (unitAtXY(B, at[0], at[1])) at = DIRS8.map(([a, b]) => [I.at[0] + a, I.at[1] + b]).find(([x, y]) => walkable(B, x, y)) || [e.x, e.y]; e.x = at[0]; e.y = at[1]; e.under = 1; ev.push({ k: "emerge", id: e.id, at }); }
  ev.push({ k: "eatk", id: e.id, tiles: I.tiles, kind: I.type });
  if (I.type === "bomb") { e.hp = 0; ev.push({ k: "die", id: e.id }); explode(B, e, ev); return; }
  for (const [x, y] of I.tiles) {
    const u = unitAtXY(B, x, y); if (!u || u === e || u.hp <= 0) continue;
    if (u.side === "e" && I.type !== "boom" && I.type !== "slam" && I.type !== "fire" && I.type !== "emerge") continue; // les ennemis s'épargnent, sauf les coups de zone
    hurt(B, u, I.dmg, ev);
    if (I.type === "web" && u.kind === "hero" && u.hp > 0) { u.st.web = 1; ev.push({ k: "web", id: u.id }); }
  }
  if (I.type === "emerge") e.under = 0;
}
// IA : se rapprocher, s'aligner, annoncer
function moveFoe(B, e, ev) {
  if (e.st.stunned) { e.st.stunned = 0; return; }
  if (e.st.stun || e.under) return;
  const M = e.kind === "foe" ? MONSTERS[e.foe] : null, h = hero(B);
  if (M && M.slow && e.n % 2 === 1) return;
  if (M && M.phase) e.st.phased = e.n % 2 === 1 ? 1 : 0;
  const mv = e.kind === "boss" ? (BOSSES.find(b => b.id === e.boss).move) : M.move;
  if (!mv) return;
  const fly = M ? !!M.fly : false;
  const ai = M ? M.ai : "melee";
  const want = (x, y) => {
    const d = Math.max(Math.abs(x - h.x), Math.abs(y - h.y));
    if (ai === "ranged" || ai === "web" || ai === "summon") { const al = (x === h.x || y === h.y || Math.abs(x - h.x) === Math.abs(y - h.y)); return (al && d >= 2 && clearLine(B, x, y, h.x, h.y) ? 0 : 10) + Math.abs(d - 3); }
    if (ai === "bomb") return d;
    return d === 1 ? 0 : d * 2;
  };
  const R = reachable(B, e, mv, fly); let best = [e.x, e.y], bs = want(e.x, e.y) + (dangerAt(B, e.x, e.y) ? 3 : 0);
  for (const [k2] of R) { const [x, y] = k2.split(",").map(Number); const t = tileAt(B, x, y); if (t.t === "stairs") continue; const sc = want(x, y) + (t.t === "spikes" && !fly ? 2 : 0) + B.rng() * .3; if (sc < bs) { bs = sc; best = [x, y]; } }
  if (best[0] !== e.x || best[1] !== e.y) { ev.push({ k: "move", id: e.id, from: [e.x, e.y], to: best }); e.x = best[0]; e.y = best[1]; }
  // les bêtes de mêlée frappent aussitôt arrivées au contact (leur zone de menace est affichée)
  if (ai === "melee" && !e.st.phased && cheb(e, h) === 1 && e.intent && e.intent.type === "threat") { ev.push({ k: "eatk", id: e.id, tiles: [[h.x, h.y]], kind: "melee" }); hurt(B, h, e.dmg, ev); }
  else if (ai === "melee" && cheb(e, h) > 1) { const p = B.units.find(u => u.kind === "pet" && u.hp > 0); if (p && cheb(e, p) === 1 && B.rng() < .5) { ev.push({ k: "eatk", id: e.id, tiles: [[p.x, p.y]], kind: "melee" }); hurt(B, p, e.dmg, ev); } }
}
// zone de menace des monstres de mêlée : là où ils peuvent frapper au prochain tour
function threatMap(B) {
  const m = new Map();
  for (const e of foes(B)) {
    if (e.under || e.st.stun || !e.intent || e.intent.type !== "threat") continue;
    const M = MONSTERS[e.foe]; if (M.slow && e.n % 2 === 0) continue;
    const spots = [[e.x, e.y], ...[...reachable(B, e, M.move, !!M.fly).keys()].map(k => k.split(",").map(Number))];
    const seen = new Set();
    for (const [x, y] of spots) for (const [dx, dy] of DIRS8) { const k2 = key(x + dx, y + dy); if (!inB(x + dx, y + dy) || seen.has(k2)) continue; seen.add(k2); m.set(k2, (m.get(k2) || 0) + e.dmg); }
  }
  return m;
}
function dangerAt(B, x, y) { return false; }
function clearLine(B, x0, y0, x1, y1) { const dx = sgn(x1 - x0), dy = sgn(y1 - y0); let x = x0 + dx, y = y0 + dy; while (x !== x1 || y !== y1) { const t = tileAt(B, x, y); if (solid(t) || unitAtXY(B, x, y)) return false; x += dx; y += dy; } return true; }
function lineTiles(B, x0, y0, dx, dy, n) { const out = []; let x = x0 + dx, y = y0 + dy; for (let i = 0; i < n && inB(x, y); i++) { if (solid(tileAt(B, x, y))) break; out.push([x, y]); x += dx; y += dy; } return out; }
function planAll(B) { for (const e of foes(B)) plan(B, e); }
function plan(B, e) {
  e.intent = null; if (e.st.stun) return;
  const h = hero(B), dx = sgn(h.x - e.x), dy = sgn(h.y - e.y), d = cheb(e, h);
  if (e.kind === "boss") return planBoss(B, e);
  const M = MONSTERS[e.foe];
  if (M.slow && e.n % 2 === 0 && e.n > 0) { /* le golem prépare son coup */ }
  switch (M.ai) {
    case "melee": e.intent = { type: "threat", tiles: null, dmg: e.dmg }; break;
    case "ranged": case "web": {
      const al = e.x === h.x || e.y === h.y || Math.abs(e.x - h.x) === Math.abs(e.y - h.y);
      if (al && d <= (M.range || 4)) e.intent = { type: M.ai === "web" ? "web" : "shot", tiles: lineTiles(B, e.x, e.y, dx, dy, M.range || 3), dmg: e.dmg };
      break;
    }
    case "summon": if (e.n % 3 === 2) e.intent = { type: "summon", what: "rat", tiles: null }; else { const al = e.x === h.x || e.y === h.y; if (al && d <= 3) e.intent = { type: "shot", tiles: lineTiles(B, e.x, e.y, dx, dy, 3), dmg: e.dmg }; } break;
    case "bomb": e.fuse = Math.max(0, (e.fuse || 3) - (e.n > 0 ? 1 : 0)); e.intent = e.fuse <= 0 ? { type: "bomb", tiles: [[e.x, e.y], ...DIRS8.map(([a, b]) => [e.x + a, e.y + b]).filter(([a, b]) => inB(a, b))], dmg: e.dmg } : { type: "fuse", tiles: null, fuse: e.fuse }; break;
    case "slam": if (e.n % 2 === 1 || e.n === 0) { if (d <= 2) { const ddx = Math.abs(h.x - e.x) >= Math.abs(h.y - e.y) ? dx : 0, ddy = ddx ? 0 : dy; e.intent = { type: "slam", tiles: lineTiles(B, e.x, e.y, ddx || dx, ddy, 3), dmg: e.dmg }; } } break;
  }
  if (e.intent && e.intent.tiles && !e.intent.tiles.length) e.intent = null;
}
function planBoss(B, e) {
  const Bo = BOSSES.find(b => b.id === e.boss), h = hero(B), dx = sgn(h.x - e.x), dy = sgn(h.y - e.y), ph = e.n % 3;
  if (Bo.ai === "boss_slam") {
    if (ph === 2) e.intent = { type: "summon", what: Bo.summon, tiles: null };
    else { const t = []; for (const [a, b] of DIRS4) t.push(...lineTiles(B, e.x, e.y, a, b, 2)); e.intent = { type: "slam", tiles: t, dmg: e.dmg }; }
  } else if (Bo.ai === "boss_web") {
    if (ph === 2) e.intent = { type: "summon", what: Bo.summon, tiles: null };
    else e.intent = { type: "web", tiles: [...lineTiles(B, e.x, e.y, dx || 1, dy, 6), ...lineTiles(B, e.x, e.y, dx || -1, dy ? -dy : 1, 4)], dmg: e.dmg };
  } else if (Bo.ai === "boss_burrow") {
    if (!e.under) { if (ph === 0) e.intent = { type: "burrow", tiles: [[e.x, e.y]], at: [h.x, h.y] }; else e.intent = { type: "melee", tiles: DIRS8.map(([a, b]) => [e.x + a, e.y + b]).filter(([a, b]) => inB(a, b)), dmg: e.dmg }; }
    else { const at = [h.x, h.y]; e.intent = { type: "emerge", at, tiles: [at, ...DIRS8.map(([a, b]) => [h.x + a, h.y + b]).filter(([a, b]) => inB(a, b) && !solid(tileAt(B, a, b)))], dmg: e.dmg }; }
  } else if (Bo.ai === "boss_fire") {
    if (ph === 1) e.intent = { type: "melee", tiles: DIRS8.map(([a, b]) => [e.x + a, e.y + b]).filter(([a, b]) => inB(a, b)), dmg: e.dmg - 1 };
    else { const col = Math.abs(h.x - e.x) <= Math.abs(h.y - e.y); const t = []; if (col) for (let y = e.y + 1; y < ROWS; y++) for (const xx of [h.x]) { if (!solid(tileAt(B, xx, y))) t.push([xx, y]); } else for (let x = 0; x < COLS; x++) if (x !== e.x && !solid(tileAt(B, x, h.y))) t.push([x, h.y]); e.intent = { type: "fire", tiles: t, dmg: e.dmg }; }
  }
}
// ── compagnon ──
function petTurn(B, ev) {
  const p = B.units.find(u => u.kind === "pet" && u.hp > 0); if (!p) return;
  const P = PETS[p.pet], h = hero(B); p.n++;
  const bonus = S.run.boons.filter(b => b === "meute").length;
  if (P.heal && p.n % P.heal === 0 && h.hp < heroHpMax()) { healU(B, h, 1, ev); ev.push({ k: "petcast", id: p.id }); }
  const targets = foes(B).filter(e => !e.under);
  if (!targets.length) return;
  const near = targets.slice().sort((a, b) => cheb(a, p) - cheb(b, p))[0];
  const reachAtk = P.range || (P.breath ? 4 : 1);
  const canHit = e => { const d = cheb(e, p); if (d > reachAtk) return false; if (d > 1) return (e.x === p.x || e.y === p.y || Math.abs(e.x - p.x) === Math.abs(e.y - p.y)) && clearLine(B, p.x, p.y, e.x, e.y); return true; };
  let tg = targets.find(canHit);
  if (!tg) { const R = reachable(B, p, P.move, !!P.fly); let best = null, bd = 99; for (const [k2] of R) { const [x, y] = k2.split(",").map(Number); if (tileAt(B, x, y).t === "stairs") continue; const dd = cheb({ x, y }, near) + (dangerTiles(B).has(key(x, y)) ? 2 : 0); if (dd < bd) { bd = dd; best = [x, y]; } } if (best) { ev.push({ k: "move", id: p.id, from: [p.x, p.y], to: best }); p.x = best[0]; p.y = best[1]; } tg = targets.find(canHit); }
  if (!tg) return;
  ev.push({ k: "patk", id: p.id, to: [tg.x, tg.y] });
  if (P.breath) { const dx = sgn(tg.x - p.x), dy = sgn(tg.y - p.y); for (const [x, y] of lineTiles(B, p.x, p.y, dx, dy, 4)) { const u = unitAtXY(B, x, y); if (u && u.side === "e") { u.lastHitBy = p.id; hurt(B, u, P.dmg + bonus - 1, ev); } } }
  else { if (P.mark) tg.st.mark = 2; p.lastHit = tg.id; const killed = hurt(B, tg, P.dmg + bonus, ev); if (P.burn && !killed) tg.st.burn = 1; if (killed && P.loot) { const o = oreFor(B.depth); S.run.loot[o]++; ev.push({ k: "drop", x: tg.x, y: tg.y, ore: o, n: 1 }); } }
  checkClear(B, ev);
}
function dangerTiles(B) { const s = new Set(); for (const e of foes(B)) if (e.intent && e.intent.tiles) for (const [x, y] of e.intent.tiles) s.add(key(x, y)); return s; }
// les ennemis frappent aussi le compagnon : s'il tombe, il rentre seul à la forge
// ── progression d'un étage à l'autre ──
function nextFloor() {
  const run = S.run, B = run.board, h = hero(B), p = B.units.find(u => u.kind === "pet");
  run.hp = h.hp; run.petHp = p ? p.hp : 0;
  run.embers += run.depth + (B.boss ? 15 : 0); run.stats.floors++;
  S.best = Math.max(S.best, run.depth);
  if (B.boss) { S.bossDepth = Math.max(S.bossDepth, run.depth); }
  run.depth++;
  if (S.equip.rune === "vie") run.hp = Math.min(heroHpMax() + run.boons.filter(b => b === "coeur").length * 2, run.hp + 1);
  if (run.petHp <= 0 && run.depth % 5 === 1) run.petHp = 3 + S.up.dressage;
  run.board = genFloor(run.depth);
}
function campChoices(rng = RNG) { const pool = BOON_IDS.slice(); rng.shuffle(pool); return pool.slice(0, 3); }
function takeBoon(k) { const run = S.run; run.boons.push(k); if (k === "coeur") run.hp = heroHpMax() + run.boons.filter(b => b === "coeur").length * 2; if (k === "potion") run.potions++; }
function runHpMax() { return heroHpMax() + (S.run ? S.run.boons.filter(b => b === "coeur").length * 2 : 0); }
function bossReward() { const un = RUNE_IDS.filter(r => !S.runes.includes(r)); if (un.length) { const r = pick(un); S.runes.push(r); return r; } return null; }
// fin de descente : on garde tout en remontant, une partie seulement si on meurt
function endRun(dead) {
  const run = S.run; if (!run) return null;
  const keep = dead ? .4 + S.up.sacoche * .15 : 1;
  const got = {}; for (const o in run.loot) { got[o] = Math.floor(run.loot[o] * keep); S.ore[o] += got[o]; }
  const embers = run.embers + (dead ? 0 : 5);
  S.braises += embers; S.best = Math.max(S.best, dead ? run.depth - 1 : run.depth - 1);
  if (dead) S.deaths++;
  const res = { dead, depth: run.depth, got, lost: dead ? Object.fromEntries(Object.keys(run.loot).map(o => [o, run.loot[o] - got[o]])) : null, embers, kills: run.kills };
  S.run = null;
  return res;
}
// ── forge ──
function canPay(c) { return Object.keys(c).every(o => S.ore[o] >= c[o]); }
function pay(c) { if (!canPay(c)) return false; for (const o in c) S.ore[o] -= c[o]; return true; }
function weaponUnlocked(k) { return WEAPONS[k].unlock <= S.best; }
function nextWeaponTier(k) { const w = S.weapons[k]; return w ? (w.tier < 2 ? w.tier + 1 : null) : 0; }
function forgeWeapon(k, q) { const t = nextWeaponTier(k); if (t == null) return false; if (!pay(WEAPON_COST[t])) return false; S.weapons[k] = { tier: t, q }; S.equip.wpn = k; return true; }
function forgeArmor(q) { const a = S.equip.armor + 1; if (a >= ARMOR.length) return false; if (!pay(ARMOR[a].cost)) return false; S.equip.armor = a; S.equip.armorQ = q; return true; }
function upCost(k) { const U = UPGRADES[k], l = S.up[k]; return l >= U.max ? null : U.cost[l]; }
function buyUp(k) { const c = upCost(k); if (c == null || S.braises < c) return false; S.braises -= c; S.up[k]++; return true; }
function petUnlocked(k) { return PETS[k].unlock <= S.best; }
// sauvegarde
function saveF() { if (!HASWIN || !S) return; try { localStorage.setItem(SAVE_KEY_F, JSON.stringify(Object.assign({}, S, { run: S.run ? Object.assign({}, S.run, { board: serialBoard(S.run.board) }) : null }))); } catch (e) { } }
function serialBoard(B) { if (!B) return null; const o = Object.assign({}, B); delete o.rng; delete o.ev; return o; }
function loadF() { if (!HASWIN) return null; try { const s = JSON.parse(localStorage.getItem(SAVE_KEY_F)); if (!s) return null; const b = newSave(); for (const k in b) if (s[k] === undefined) s[k] = b[k]; for (const k in b.up) if (s.up[k] === undefined) s.up[k] = 0; if (s.run && s.run.board) s.run.board.rng = RNG; return s; } catch (e) { return null; } }
