// Bots : jouent des carrières complètes de La Forge des Brumes.  node test/sim.js [carrières] [descentes] [graine]
const fs = require("fs"), path = require("path");
const code = ["00_util", "01_data", "02_game"].map(f => fs.readFileSync(path.join(__dirname, "../src/" + f + ".js"), "utf8")).join("\n");
const N = +process.argv[2] || 10, RUNS = +process.argv[3] || 30, SEED = +process.argv[4] || 1;
const out = new Function("N", "RUNS", "SEED", code + `
RNG = mkRng(SEED);
const T = { runs: 0, deaths: 0, depth: [], turns: 0, floors: 0, errors: [], bossTry: {}, bossWin: {}, deathAt: {}, stalls: 0, potions: 0, hits: 0 };
function snap() { const b = S.run.board, rng = b.rng; b.rng = null; const s = JSON.stringify({ run: S.run, kills: S.kills }); b.rng = rng; return s; }
function restore(s) { const o = JSON.parse(s); o.run.board.rng = RNG; S.run = o.run; S.kills = o.kills; }
function evalState(B0) { const B = S.run.board, h = hero(B); if (!h || h.hp <= 0) return -999; const dz = new Map(); for (const e of foes(B)) if (e.intent && e.intent.tiles && !e.st.stun) for (const [x, y] of e.intent.tiles) dz.set(key(x, y), (dz.get(key(x, y)) || 0) + e.intent.dmg); for (const [k2, v] of threatMap(B)) dz.set(k2, (dz.get(k2) || 0) + v * .8); if (B.rocks) for (const [x, y] of B.rocks) dz.set(key(x, y), (dz.get(key(x, y)) || 0) + 1);
  let sc = h.hp * 6 - (dz.get(key(h.x, h.y)) || 0) * 9 - foes(B).reduce((a, e) => a + e.hp, 0) * (3 + B.turn * .3) - foes(B).length * 4 + (S.run.loot.fer + S.run.loot.argent * 2 + S.run.loot.ame * 4) * 1.5;
  if (B.cleared && B.stairs) { const R = reachable(B, h, 99); sc -= (R.get(key(B.stairs[0], B.stairs[1])) ?? 0) * 3; } else { const f = foes(B); if (f.length) sc -= Math.min(...f.map(e => cheb(e, h))) * (.6 + B.turn * .15); }
  if (B.descend) sc += 30; return sc; }
function botTurn() {
  const B = S.run.board, base = snap(); let best = null, bs = -1e9;
  const h0 = hero(B);
  const moves = [null, ...[...reachable(B, h0, B.mv).keys()].map(k => k.split(",").map(Number))];
  for (const order of ["ma", "am"]) for (const mv of moves) {
    restore(base); const Bc = S.run.board;
    const doMove = () => { if (mv) heroMove(Bc, mv[0], mv[1]); };
    const atks = () => weaponTargets(Bc, hero(Bc));
    if (order === "ma") { doMove(); if (Bc.descend) { const sc = evalState(); if (sc > bs) { bs = sc; best = { mv, order }; } continue; } const A = atks(); const opts = [null, ...A]; const s2 = snap(); for (const a of opts) { restore(s2); if (a) heroAttack(S.run.board, a.x, a.y); const sc = evalState(); if (sc > bs) { bs = sc; best = { mv, a, order }; } } }
    else { const A = atks(); for (const a of A) { restore(base); heroAttack(S.run.board, a.x, a.y); if (mv && !reachable(S.run.board, hero(S.run.board), S.run.board.mv).has(key(mv[0], mv[1]))) continue; if (mv) heroMove(S.run.board, mv[0], mv[1]); const sc = evalState(); if (sc > bs) { bs = sc; best = { mv, a, order }; } } }
  }
  restore(base);
  const Bn = S.run.board, h = hero(Bn);
  if (h.hp <= 2 && S.run.potions > 0 && foes(Bn).length) { usePotion(Bn); T.potions++; }
  if (best) { if (best.order === "ma") { if (best.mv) heroMove(Bn, best.mv[0], best.mv[1]); if (best.a && !Bn.descend) heroAttack(Bn, best.a.x, best.a.y); } else { if (best.a) heroAttack(Bn, best.a.x, best.a.y); if (best.mv) heroMove(Bn, best.mv[0], best.mv[1]); } }
  if (Bn.descend) return "descend";
  const hp0 = hero(Bn).hp; const ev = endPlayerTurn(Bn); T.hits += Math.max(0, hp0 - hero(Bn).hp);
  return Bn.phase === "dead" ? "dead" : "ok";
}
function playRun() {
  T.achN = achReady().length; T.bestiary = S.bestiary;
  if (T.runs % 7 === 6) { startDaily(); T.dailies = (T.dailies || 0) + 1; } else startRun(); T.runs++;
  let turns = 0;
  while (turns++ < 1500) {
    const B = S.run.board;
    if (B.boss && !B._c) { B._c = 1; T.bossTry[S.run.depth] = (T.bossTry[S.run.depth] || 0) + 1; }
    const r = botTurn(); T.turns++;
    if (B.turn > 60) { T.stalls++; if (T.stalls < 5) console.log("ENLISÉ", S.run.depth, "héros", JSON.stringify([hero(B).x, hero(B).y, hero(B).hp]), foes(B).map(e => (e.foe || e.boss) + "@" + e.x + "," + e.y + " hp" + e.hp + (e.under ? " sous" : "") + (e.st.phased ? " phase" : "")).join(" ; "), "cleared", B.cleared, B.stairs); if (T.stalls < 3) { const h = hero(B); console.log("  mv", B.mv, "reach stairs", reachable(B, h, 99).has(key(B.stairs ? B.stairs[0] : 0, B.stairs ? B.stairs[1] : 0)), "tile", JSON.stringify(B.stairs && B.tiles[B.stairs[1]][B.stairs[0]]), "web", h.st.web, "units", B.units.filter(u => u.hp > 0).map(u => u.kind + "@" + u.x + "," + u.y).join(" ")); } const res = endRun(true); return res; }
    if (r === "dead") { T.deaths++; T.deathAt[S.run.depth] = (T.deathAt[S.run.depth] || 0) + 1; return endRun(true); }
    if (r === "descend") {
      const wasBoss = B.boss, d = S.run.depth; T.floors++;
      if (wasBoss) { T.bossWin[d] = (T.bossWin[d] || 0) + 1; bossReward(); }
      nextFloor();
      if (wasBoss) { const hpk = S.run.hp / runHpMax(); if (hpk < .5 || S.run.depth > 40) return endRun(false); }
      { const evk = eventFor(S.run.depth - 1); if (evk) { const C = eventChoices(evk).filter(c => c.ok); applyEvent(evk, pick(C).k); T.events = (T.events || 0) + 1; } }
      if ((S.run.depth - 1) % 5 === 3 || wasBoss) { const ch = campChoices(); takeBoon(ch[0]); S.run.hp = Math.min(runHpMax(), S.run.hp + 2); }
    }
  }
  return endRun(true);
}
function hub() {
  for (const k of ["pv", "potion", "sacoche", "dressage", "raccourci"]) { let g = 0; while (g++ < 3 && buyUp(k)); }
  // forger : arme la plus forte possible
  for (const k of WEAPON_IDS.filter(weaponUnlocked).reverse()) { const t = nextWeaponTier(k); if (t != null && canPay(WEAPON_COST[t]) && (S.weapons[S.equip.wpn].tier < t || t > 0)) { forgeWeapon(k, RNG.int(0, 2)); break; } }
  if (S.equip.armor < 3 && canPay(ARMOR[S.equip.armor + 1].cost)) forgeArmor(RNG.int(0, 2));
  if (S.runes.length) S.equip.rune = S.runes.includes("echo") ? "echo" : S.runes[0];
  const pets = PET_IDS.filter(petUnlocked); S.pet = pets[pets.length - 1];
}
const careers = [];
for (let c = 0; c < N; c++) {
  try {
    S = newSave(); const rec = { best: [] };
    for (let r = 0; r < RUNS; r++) { hub(); const res = playRun(); rec.best.push(S.best); }
    rec.final = S.best; rec.ore = Object.assign({}, S.ore); rec.armor = S.equip.armor; rec.wpn = S.equip.wpn + S.weapons[S.equip.wpn].tier;
    careers.push(rec);
  } catch (e) { T.errors.push(e.stack.split("\\n").slice(0, 4).join(" | ")); }
}
return { T, careers };
`)(N, RUNS, SEED);
const { T, careers } = out;
const avg = (a, f) => a.length ? a.reduce((s, x) => s + f(x), 0) / a.length : 0;
console.log(`${N} carrières × ${RUNS} descentes`);
console.log(`Descentes ${T.runs} · morts ${T.deaths} · étages ${T.floors} · tours/étage ${(T.turns / Math.max(1, T.floors)).toFixed(1)} · enlisés ${T.stalls} · potions ${T.potions} · PV perdus/étage ${(T.hits / Math.max(1, T.floors)).toFixed(2)}`);
console.log("Record moyen après 5/10/20/30 descentes :", [5, 10, 20, 30].map(i => avg(careers, c => c.best[Math.min(i, c.best.length) - 1] || 0).toFixed(1)).join(" / "));
console.log("Gardiens (victoires/essais) :", Object.keys(T.bossTry).map(k => k + ":" + (T.bossWin[k] || 0) + "/" + T.bossTry[k]).join(" "));
console.log("Morts par profondeur :", JSON.stringify(T.deathAt));
console.log("Fin de carrière :", careers.slice(0, 5).map(c => `rec ${c.final} ${c.wpn} armure ${c.armor}`).join(" · "));
console.log("Événements : " + (T.events || 0) + " · défis : " + (T.dailies || 0) + " · succès disponibles : " + T.achN + " · bestiaire : " + JSON.stringify(T.bestiary) + "\nErreurs :", T.errors.length ? "\n" + T.errors.slice(0, 5).join("\n") : "aucune");
