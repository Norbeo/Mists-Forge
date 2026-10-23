/* ═══════════════════════ La mine : la grille, les tours, les animations ═══════════════════════ */
const MV = { vis: {}, fx: [], txt: [], busy: false, shake: 0, flash: 0, banner: null, sel: null, lay: null };
const mwait = ms => new Promise(r => setTimeout(r, ms * (S && S.opts.fast ? .5 : 1)));
// mise en page : un monde en pixels agrandi d'un facteur entier (kd pixels d'écran par pixel)
function mlayout() {
  const topH = ($("#top").offsetHeight || 60), botH = ($("#bot").offsetHeight || 130), dpr = SC.dpr;
  const Wd = SC.w * dpr, Hd = SC.h * dpr, avD = Math.max(100, (SC.h - topH - botH) * dpr);
  const BW = (COLS + ROWS) * 16 + 2, BH = (COLS + ROWS) * 8 + 50;
  const kd = Math.max(1, Math.floor(Math.min(Wd / BW, avD / BH)));
  const wW = Math.ceil(Wd / kd), wH = Math.ceil(Hd / kd), top = topH * dpr / kd, av = avD / kd;
  MV.lay = { kd, wW, wH, OX: Math.round(wW / 2 + (ROWS - COLS) * 8), OY: Math.round(top + (av - BH) / 2 + 38) };
}
// centre d'une case (au sol), en pixels du monde
const wpos = (gx, gy) => [MV.lay.OX + (gx - gy) * 16, MV.lay.OY + (gx + gy) * 8 + 8];
const toCss = (wx, wy) => [wx * MV.lay.kd / SC.dpr, wy * MV.lay.kd / SC.dpr];
function visOf(u) { let v = MV.vis[u.id]; if (!v) { v = MV.vis[u.id] = { gx: u.x, gy: u.y, tgx: u.x, tgy: u.y, a: 0, flash: 0, pose: "idle", pt: 0, off: [0, 0], face: u.side === "e" ? -1 : 1 }; } return v; }
const vpos = v => { const [a, b] = wpos(v.gx, v.gy); return [a + v.off[0], b + v.off[1]]; };
function syncVis(B, snap) { for (const u of B.units) { const v = visOf(u); v.tgx = u.x; v.tgy = u.y; if (snap) { v.gx = u.x; v.gy = u.y; } } }
const scrDir = (dx, dy) => sgn(dx - dy);
SCREENS.mine = {
  top: () => { const run = S.run, B = run.board, h = hero(B), mx = runHpMax(); return `<span class="pill">${ico("map", "#e8c878")}<b>${run.depth}</b></span><span class="hearts">${Array.from({ length: mx }, (_, i) => `<i class="${i < h.hp ? "" : "e"}"></i>`).join("")}</span><span class="grow"></span>${oreChips(run.loot)}`; },
  bot: () => { const run = S.run, B = run.board; const hint = MV.hint || defaultHint(B); return `<p class="hint">${hint}</p><div class="row w"><button class="btn ${run.potions ? "" : "off"}" data-a="mPotion">${ico("potion", "#ff6a5a")}Potion ×${run.potions}</button><button class="btn ${B.cleared || B.phase !== "player" ? "off" : ""}" data-a="mEnd">${ico("skip")}Fin du tour</button></div>`; },
  scene: () => drawMine,
  mount: () => { MV.vis = {}; MV.fx = []; MV.txt = []; MV.busy = false; MV.hint = null; mlayout(); syncVis(S.run.board, true); for (const u of S.run.board.units) visOf(u).a = 1; SC.tap = mineTap; musicPlay(S.run.board.boss ? "boss" : "combat"); floorIntro(); },
  resize: () => { mlayout(); syncVis(S.run.board, true); },
};
function defaultHint(B) {
  if (B.cleared) return "Étage nettoyé : touchez <b>l'escalier</b> pour descendre.";
  if (hero(B).st.web) return "<b>Englué</b> : vous ne pouvez pas bouger ce tour-ci.";
  if (B.mv > 0 && B.atk > 0) return "Touchez une case pour <b>bouger</b>, un ennemi ou un filon pour <b>frapper</b>.";
  if (B.atk > 0) return "Vous pouvez encore <b>frapper</b>.";
  if (B.mv > 0) return "Vous pouvez encore <b>bouger</b>.";
  return "";
}
async function floorIntro() {
  const B = S.run.board;
  MV.banner = { title: B.boss ? BOSSES.find(b => b.id === foes(B).find(e => e.kind === "boss").boss).n : "Profondeur " + S.run.depth, sub: B.boss ? "Gardien de la mine" : S.run.depth === 1 ? "La mine maudite" : "", t: 0, life: B.boss ? 2 : 1.2 };
  if (S.run.depth === 1 && !S.tuto.mine) { S.tuto.mine = 1; setTimeout(() => toast("Touchez une case lumineuse pour avancer."), 900); }
}
function tileFromXY(px, py) {
  const L = MV.lay, B = S.run.board, wx = px * SC.dpr / L.kd, wy = py * SC.dpr / L.kd;
  // les unités d'abord (leur silhouette dépasse de la case), puis les blocs en relief, puis le sol
  let best = null, bd = -1;
  for (const u of B.units) { if (u.hp <= 0) continue; const [ux, uy] = wpos(u.x, u.y), hgt = u.kind === "boss" ? 44 : 26; if (Math.abs(wx - ux) <= 9 && wy <= uy + 4 && wy >= uy - hgt && u.x + u.y > bd) { bd = u.x + u.y; best = [u.x, u.y]; } }
  if (best) return best;
  const inD = (cx2, cy2) => Math.abs(wx - cx2) / 16 + Math.abs(wy - cy2) / 8 <= 1;
  for (let gy = 0; gy < ROWS; gy++) for (let gx = 0; gx < COLS; gx++) { if (!solid(B.tiles[gy][gx])) continue; const [cx2, cy2] = wpos(gx, gy); if ((inD(cx2, cy2 - HW) || (Math.abs(wx - cx2) <= 16 && wy >= cy2 - HW && wy <= cy2)) && gx + gy > bd) { bd = gx + gy; best = [gx, gy]; } }
  const a = (wx - L.OX) / 32, b = (wy - L.OY) / 16, gx = Math.floor(a + b), gy = Math.floor(b - a);
  if (inB(gx, gy) && (!best || gx + gy > bd)) return [gx, gy];
  return best;
}
async function mineTap(px, py) {
  const B = S.run.board; if (MV.busy || B.phase !== "player") return;
  const g = tileFromXY(px, py); if (!g) return; const [x, y] = g, h = hero(B);
  const tg = weaponTargets(B, h).find(t => t.x === x && t.y === y);
  let ev = null;
  if (tg && B.atk > 0) ev = heroAttack(B, x, y);
  else if (!h.st.web && reachable(B, h, B.mv).has(key(x, y))) ev = heroMove(B, x, y);
  else { const u = unitAtXY(B, x, y); if (u && u.side === "e") { const M = u.kind === "boss" ? BOSSES.find(b => b.id === u.boss) : MONSTERS[u.foe]; toast(`<b>${M.n}</b> · ${u.hp} PV · ${u.dmg} dégât${u.dmg > 1 ? "s" : ""}<br><span class="small">${M.d}</span>`); } else if (u && u.kind === "pet") toast(`<b>${PETS[u.pet].n}</b> · ${u.hp} PV`); else if (tileAt(B, x, y).t === "ore") toast("Un filon : placez-vous à côté et frappez-le."); return; }
  if (!ev) return;
  MV.busy = true; await play(ev); MV.busy = false;
  afterAction();
}
async function afterAction() {
  const B = S.run.board;
  if (B.descend) return floorDone();
  refreshBars(); saveF();
  if (B.phase === "player" && !B.cleared && B.mv <= 0 && B.atk <= 0) { await mwait(220); doEndTurn(); }
}
async function doEndTurn() {
  const B = S.run.board; if (MV.busy || B.phase !== "player" || B.cleared) return;
  MV.busy = true; refreshBars();
  const ev = endPlayerTurn(B);
  await play(ev);
  MV.busy = false; refreshBars(); saveF();
  if (B.phase === "dead") return runOver(true);
}
ACT.mEnd = () => doEndTurn();
ACT.mPotion = async () => { const B = S.run.board; if (MV.busy) return; const ev = usePotion(B); if (!ev) return; MV.busy = true; sfx("heal"); await play(ev); MV.busy = false; refreshBars(); saveF(); };
// ── animations ──
const ORE_TXT = { fer: "Fer", argent: "Argent", ame: "Âme" };
function pop(x, y, text, col, big) { MV.txt.push({ x, y, text, col, big, t: 0, life: big ? 1.4 : 1 }); }
function sparks(x, y, col, n = 12, sp = 55) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = sp * (.3 + Math.random()); MV.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, g: 120, col, t: 0, life: .45 + Math.random() * .4, sz: Math.random() < .3 ? 2 : 1 }); } }
function U(id) { return S.run.board.units.find(u => u.id === id); }
async function play(ev) {
  for (const e of ev) {
    const u = e.id != null ? U(e.id) : null, v = u ? visOf(u) : null, P = v ? vpos(v) : null;
    switch (e.k) {
      case "move": if (v) { v.face = scrDir(e.to[0] - e.from[0], e.to[1] - e.from[1]) || v.face; v.tgx = e.to[0]; v.tgy = e.to[1]; if (u.kind === "hero") sfx("step"); await mwait(u.kind === "hero" ? 160 : 110); } break;
      case "atk": case "patk": case "eatk": {
        if (!v) break;
        const to = e.to || (e.tiles && e.tiles[0]); if (to) v.face = scrDir(to[0] - u.x, to[1] - u.y) || v.face;
        v.pose = "strike"; v.pt = .35;
        if (e.tiles) for (const [a, b] of e.tiles) MV.fx.push({ tile: [a, b], col: e.k === "eatk" ? "#ff3a2a" : "#ffb060", t: 0, life: .35 });
        if (to) { const [tx, ty] = wpos(to[0], to[1]), [fx, fy] = wpos(u.x, u.y), dx = tx - fx, dy = ty - fy, L = Math.hypot(dx, dy) || 1, r = Math.min(L * .45, 9); v.off = [dx / L * r, dy / L * r]; }
        if (e.kind === "shot" || e.kind === "web" || (u.kind === "hero" && WEAPONS[S.equip.wpn].shot)) { const [tx, ty] = wpos(to[0], to[1]); MV.fx.push({ proj: 1, x0: P[0], y0: P[1] - 14, x1: tx, y1: ty - 12, col: e.kind === "web" ? "#e8e8e0" : "#ffd08a", t: 0, life: .18 }); sfx("shoot"); }
        else if (e.kind === "fire") { sfx("fire"); MV.flash = .3; }
        else if (e.kind === "slam" || e.kind === "emerge") { sfx("heavy"); MV.shake = .3; }
        else sfx(u.kind === "hero" ? "heavy" : "slash");
        await mwait(e.k === "eatk" ? 170 : 130); break;
      }
      case "hit": if (v) { v.flash = 1; v.pose = "hurt"; v.pt = .3; sparks(P[0], P[1] - 14, u.side === "e" ? "#ffb060" : "#ff4a3a", 10); pop(P[0], P[1] - 30, "-" + e.dmg, u.side === "h" ? "#ff5a4a" : "#ffe0a0", u.kind === "hero"); if (u.kind === "hero") { MV.shake = .25; MV.flash = .25; refreshBars(); } sfx("hit"); await mwait(90); } break;
      case "die": if (v) { v.dying = 1; sparks(P[0], P[1] - 12, "#6a4a3a", 16, 45); sfx(u.kind === "boss" ? "die" : "hit"); await mwait(u.kind === "boss" ? 700 : 180); } break;
      case "push": if (v) { v.tgx = e.to[0]; v.tgy = e.to[1]; pop(P[0], P[1] - 32, "Repoussé", "#ffb060"); await mwait(120); } break;
      case "bump": if (v) { const [a, b] = wpos(u.x + e.dir[0], u.y + e.dir[1]), [c, d] = wpos(u.x, u.y); v.off = [(a - c) * .3, (b - d) * .3]; MV.shake = .15; pop(P[0], P[1] - 36, "Choc !", "#ffb060"); sfx("heavy"); await mwait(90); } break;
      case "mine": { const [x0, y0] = wpos(e.x, e.y); sparks(x0, y0 - 16, ORE_GLOW[e.ore], 22, 70); pop(x0, y0 - 26, `+${e.n} ${ORE_TXT[e.ore]}`, ORE_GLOW[e.ore], true); sfx("forge"); refreshBars(); await mwait(160); break; }
      case "drop": { const [x0, y0] = wpos(e.x, e.y); pop(x0, y0 - 26, `+${e.n} ${ORE_TXT[e.ore]}`, ORE_GLOW[e.ore]); sfx("coin"); refreshBars(); break; }
      case "collapse": { const [x0, y0] = wpos(e.x, e.y); sparks(x0, y0 - 10, "#6a5a4a", 10, 35); break; }
      case "boom": { const [x0, y0] = wpos(e.x, e.y); for (const [a, b] of [[0, 0], ...DIRS8]) MV.fx.push({ tile: [e.x + a, e.y + b], col: "#c8f04a", t: 0, life: .5 }); sparks(x0, y0 - 10, "#c8f04a", 40, 100); MV.shake = .4; sfx("crit"); await mwait(220); break; }
      case "stairs": { const [x0, y0] = wpos(e.x, e.y); sparks(x0, y0 - 6, "#ffb04a", 30, 70); sfx("win"); MV.hint = null; MV.banner = { title: "L'escalier s'ouvre", sub: "", t: 0, life: 1.1 }; await mwait(300); break; }
      case "heal": if (v) { pop(P[0], P[1] - 32, "+" + e.v, "#9fe07a"); sparks(P[0], P[1] - 14, "#9fe07a", 10, 30); refreshBars(); } break;
      case "potion": sfx("heal"); break;
      case "block": if (v) { pop(P[0], P[1] - 32, "Bloqué", "#a0c8ff", true); sfx("forge"); await mwait(120); } break;
      case "stun": if (v) pop(P[0], P[1] - 36, "Étourdi", "#ffd84a"); break;
      case "web": if (v) pop(P[0], P[1] - 36, "Englué", "#e8e8e0", true); break;
      case "phase": if (v) pop(P[0], P[1] - 32, "Intangible", "#a0c0ff"); break;
      case "spawn": if (v) { v.a = 0; sparks(P[0], P[1] - 8, "#9a6aff", 14, 35); sfx("dark"); await mwait(150); } break;
      case "burrow": if (v) { sparks(P[0], P[1] - 4, "#6a5040", 24, 55); MV.shake = .3; sfx("heavy"); await mwait(200); } break;
      case "emerge": if (v) { v.tgx = v.gx = u.x; v.tgy = v.gy = u.y; const Q = vpos(v); sparks(Q[0], Q[1] - 4, "#6a5040", 30, 75); MV.shake = .4; await mwait(150); } break;
      case "rock": { const [x0, y0] = wpos(e.x, e.y); MV.fx.push({ rockfall: 1, x: x0, y: y0 - 6, t: 0, life: .3 }); sparks(x0, y0 - 6, "#6a5a4a", 14, 45); sfx("heavy"); await mwait(60); break; }
      case "rumble": MV.shake = .3; MV.hint = "La mine gronde : des <b>rochers</b> vont tomber !"; break;
      case "msg": pop(MV.lay.OX + (COLS - ROWS) * 8, MV.lay.OY + 30, e.text, "#ffb060", true); break;
      case "petcast": if (v) { sparks(P[0], P[1] - 14, "#ffe8a0", 10, 30); sfx("heal"); } break;
    }
  }
  await mwait(80);
}
// ── fin d'étage ──
async function floorDone() {
  const run = S.run, B = run.board, wasBoss = B.boss, depth = run.depth;
  MV.busy = true; sfx("door");
  MV.banner = { title: "Plus bas…", sub: "", t: 0, life: .9 }; await mwait(650);
  let rune = null; if (wasBoss) rune = bossReward();
  nextFloor(); saveF();
  if (wasBoss) {
    const R = rune ? RUNES[rune] : null;
    sheet(`<div class="center"><div class="big">Gardien vaincu</div><p class="lore">La mine tremble. Un passage s'ouvre vers la profondeur ${run.depth}.</p>${R ? `<div class="item on" style="text-align:left">${ico(R.ic, "#c49cff", 34)}<div class="grow"><h3 style="margin:0">${R.n}</h3><p class="small dim">${R.d} (à graver à la forge)</p></div></div>` : ""}<p>Remonter maintenant, c'est garder <b>tout</b> votre minerai. Continuer, c'est risquer d'en perdre.</p><div class="row w"><button class="btn" data-a="goUp">${ico("up")}Remonter</button><button class="btn main" data-a="goOn">Continuer</button></div></div>`, { close: false });
    return;
  }
  if ((run.depth - 1) % 5 === 3) return camp();
  enterFloor();
}
function enterFloor() { MV.busy = false; closeSheet(); go("mine"); }
ACT.goUp = () => { closeSheet(); runOver(false); };
ACT.goOn = () => camp();
function camp() {
  const ch = campChoices(); S.run.hp = Math.min(runHpMax(), S.run.hp + 2); saveF();
  sheet(`<h2 class="center">${ico("camp", "#ff9a3a")} Campement</h2><p class="center lore">Un feu de mineur, encore tiède. Vous reprenez 2 PV. Une faveur vous attend :</p>${ch.map(k => `<button class="btn ghost boon" data-a="boon" data-v="${k}">${ico(BOONS[k].ic, "#ffb060")} <b>${BOONS[k].n}</b>${BOONS[k].d}</button>`).join("")}`, { close: false });
}
ACT.boon = k => { takeBoon(k); saveF(); sfx("buff"); enterFloor(); };
function runOver(dead) {
  const res = endRun(dead); saveF(); MV.busy = false;
  go("result", res);
}
SCREENS.result = {
  scene: () => (x, t, dt) => drawForgeScene(x, t, dt, { dark: .85, dim: .45 }),
  mid: r => `<div class="title" style="pointer-events:auto;justify-content:center"><div class="big">${r.dead ? "Vous êtes tombé" : "De retour à la forge"}</div><p class="lore">${r.dead ? `La mine vous a pris à la profondeur ${r.depth}. Des mineurs vous ont remonté, mais une partie du minerai est restée en bas.` : `Vous remontez de la profondeur ${r.depth - 1}, les poches pleines.`}</p><div class="row" style="flex-wrap:wrap;justify-content:center">${oreChips(r.got, true)}<span class="pill" style="color:#ffb060">${ico("ember", "#ff8a3a")}+${r.embers}</span></div>${r.dead && r.lost && Object.values(r.lost).some(v => v) ? `<p class="small dim">Perdu : ${Object.keys(r.lost).filter(k => r.lost[k]).map(k => r.lost[k] + " " + ORE_TXT[k]).join(", ")}</p>` : ""}<p class="small dim">${r.kills} monstres terrassés · record ${S.best}</p><button class="btn main" data-a="toForge" style="min-width:240px">${ico("anvil")}À la forge</button></div>`,
  mount: r => { sfx(r.dead ? "lose" : "win"); musicPlay("bastion"); },
};
ACT.toForge = () => go("forge");
// ── dessin de la mine : monde en pixels, losanges iso, tri par profondeur ──
function unitSprite(u, v) {
  const strike = v.pose === "strike";
  if (u.kind === "hero") return smithPix(smithLook(), strike ? "strike" : v.pose === "hurt" ? "hurt" : "idle");
  if (u.kind === "pet") return petPix(u.pet, strike);
  const art = u.kind === "boss" ? BOSSES.find(b => b.id === u.boss).art : MONSTERS[u.foe].art;
  return foeArt(art, strike, { under: u.under });
}
const WHITE = new Map();
function whiteSpr(c) { let w = WHITE.get(c); if (!w) { w = whiteOf(c); w.ax = c.ax; w.ay = c.ay; WHITE.set(c, w); } return w; }
function drawMine(x, t, dt) {
  const run = S.run; if (!run) return; const B = run.board, L = MV.lay; if (!L) return;
  const k = L.kd; x.setTransform(1, 0, 0, 1, 0, 0); x.imageSmoothingEnabled = false;
  x.drawImage(caveBgPix(L.wW, L.wH, B.depth), 0, 0, L.wW * k, L.wH * k);
  let sx = 0, sy = 0; if (MV.shake > 0) { MV.shake -= dt; sx = Math.round((Math.random() - .5) * 5 * MV.shake * 2); sy = Math.round((Math.random() - .5) * 4 * MV.shake * 2); }
  x.setTransform(k, 0, 0, k, sx * k, sy * k);
  const h = hero(B), frame = Math.floor(t * 4) % 4, pulse = .55 + Math.sin(t * 5) * .25;
  // 1) le sol (dalles), de l'arrière vers l'avant
  const order = []; for (let d = 0; d < COLS + ROWS - 1; d++) for (let gx = 0; gx < COLS; gx++) { const gy = d - gx; if (gy >= 0 && gy < ROWS) order.push([gx, gy]); }
  for (const [gx, gy] of order) { const tl = B.tiles[gy][gx], [px, py] = wpos(gx, gy); blit(x, floorTile(B.depth, solid(tl) ? { t: "floor" } : tl, gx, gy, frame), px, py, 1); }
  // 2) aides de jeu sur le sol
  const playing = B.phase === "player" && !MV.busy;
  const threat = !B.cleared ? threatMap(B) : new Map();
  for (const [k2] of threat) { const [gx, gy] = k2.split(",").map(Number); if (solid(tileAt(B, gx, gy))) continue; const [px, py] = wpos(gx, gy); blit(x, diaOver("#ff3c1e", "inner"), px, py, 1, false, .2); }
  for (const e of foes(B)) if (e.intent && e.intent.tiles) for (const [gx, gy] of e.intent.tiles) { if (!inB(gx, gy) || solid(tileAt(B, gx, gy))) continue; const [px, py] = wpos(gx, gy); blit(x, diaOver("#ff2a14", "inner"), px, py, 1, false, .3 + pulse * .25); blit(x, diaOver("#ff6a4a", "edge"), px, py, 1, false, .7); }
  if (B.rocks) for (const [gx, gy] of B.rocks) { const [px, py] = wpos(gx, gy); blit(x, diaOver("#000000", "inner"), px, py, 1, false, .35 + pulse * .2); drawIcon(x, "boom", px, py, .3, "rgba(255,180,120,.9)", 1); }
  if (playing && h) {
    if (!h.st.web && !B.cleared) for (const [k2] of reachable(B, h, B.mv)) { const [gx, gy] = k2.split(",").map(Number), [px, py] = wpos(gx, gy); blit(x, diaOver("#ffd27a", "dot"), px, py, 1, false, .55 + pulse * .3); blit(x, diaOver("#ffd27a", "edge"), px, py, 1, false, .14); }
    if (B.atk > 0) for (const tg of weaponTargets(B, h)) { const [px, py] = wpos(tg.x, tg.y); blit(x, diaOver("#ff9a3a", "corner"), px, py - (solid(tileAt(B, tg.x, tg.y)) ? HW : 0), 1, false, .7 + pulse * .3); }
  }
  if (B.cleared && B.stairs) { const [px, py] = wpos(B.stairs[0], B.stairs[1]); blit(x, diaOver("#ffd27a", "edge"), px, py, 1, false, .5 + pulse * .5); }
  for (const f of MV.fx) if (f.tile) { f.t += dt; const q = f.t / f.life; if (q >= 1) { f.done = 1; continue; } const [gx, gy] = f.tile; if (!inB(gx, gy)) continue; const [px, py] = wpos(gx, gy); blit(x, diaOver(f.col, "fill"), px, py, 1, false, .5 * (1 - q)); }
  // 3) blocs et unités triés par profondeur
  const units = B.units.filter(u => (u.hp > 0 || (MV.vis[u.id] && MV.vis[u.id].a > .02)));
  const D = [];
  for (const [gx, gy] of order) { const tl = B.tiles[gy][gx]; if (solid(tl)) D.push([gx + gy + gx * .01, 0, gx, gy, tl]); }
  for (const u of units) { const v = visOf(u); D.push([v.tgx + v.tgy + .5 + v.tgx * .01, 1, u, v]); }
  D.sort((a, b) => a[0] - b[0]);
  for (const d of D) { if (d[1] === 0) { const [px, py] = wpos(d[2], d[3]); blit(x, blockTile(B.depth, d[4], d[2], d[3]), px, py, 1); } else drawUnit(x, d[2], d[3], t, dt); }
  // 4) lumières (lave, filons, escalier, lanterne du forgeron)
  x.save(); x.globalCompositeOperation = "lighter";
  for (const [gx, gy] of order) { const tl = B.tiles[gy][gx], [px, py] = wpos(gx, gy); if (tl.t === "lava") glow(x, px, py, 22, "#ff5a1a", .22 + Math.sin(t * 3 + gx) * .04); if (tl.t === "ore") glow(x, px, py - 16, 14, ORE_GLOW[tl.ore], .16 + Math.sin(t * 2 + gy) * .05); if (tl.t === "stairs") { glow(x, px, py, 18, biomeOf(B.depth).glow, .25 + pulse * .1); } }
  if (h && MV.vis[h.id]) { const P = vpos(MV.vis[h.id]); glow(x, P[0], P[1] - 12, 46, "#ff9a4a", .1); }
  // projectiles et étincelles (pixels)
  for (const f of MV.fx) { if (f.tile) continue; f.t += dt; const q = f.t / f.life; if (q >= 1) { f.done = 1; continue; }
    if (f.proj) { const px = Math.round(lerp(f.x0, f.x1, q)), py = Math.round(lerp(f.y0, f.y1, q)); x.fillStyle = f.col; x.fillRect(px - 1, py, 3, 1); glow(x, px, py, 5, f.col, .8); continue; }
    if (f.rockfall) { const yy = Math.round(f.y - (1 - q) * 40); x.fillStyle = "#8a7a6a"; x.fillRect(f.x - 2, yy - 2, 4, 4); continue; }
    f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; x.globalAlpha = 1 - q; x.fillStyle = f.col; x.fillRect(Math.round(f.x), Math.round(f.y), f.sz, f.sz); x.globalAlpha = 1; }
  x.restore(); MV.fx = MV.fx.filter(f => !f.done);
  // 5) textes, bandeau, voile (en pixels CSS)
  x.setTransform(SC.dpr, 0, 0, SC.dpr, 0, 0);
  const tsz = Math.max(13, k / SC.dpr * 6.5);
  for (const p of MV.txt) { p.t += dt; const q = p.t / p.life; if (q >= 1) { p.done = 1; continue; } const [cx2, cy2] = toCss(p.x + sx, p.y + sy - easeOut(q) * 14), a = q < .75 ? 1 : (1 - q) * 4; x.save(); x.globalAlpha = a; x.font = `700 ${Math.round(tsz * (p.big ? 1.25 : 1))}px ${PIXFONT}`; x.textAlign = "center"; x.lineWidth = 4; x.strokeStyle = "#000"; x.strokeText(p.text, cx2, cy2); x.fillStyle = p.col; x.fillText(p.text, cx2, cy2); x.restore(); }
  MV.txt = MV.txt.filter(p => !p.done);
  if (MV.flash > 0) { x.fillStyle = `rgba(255,60,30,${MV.flash * .3})`; x.fillRect(0, 0, SC.w, SC.h); MV.flash -= dt * 2; }
  const cyB = toCss(0, L.OY + 48)[1];
  if (MV.banner) { const b = MV.banner; b.t += dt; const q = b.t / b.life; if (q >= 1) MV.banner = null; else { const a = q < .15 ? q / .15 : q > .8 ? (1 - q) / .2 : 1, yy = cyB; x.save(); x.globalAlpha = a; x.fillStyle = "rgba(0,0,0,.82)"; x.fillRect(0, yy - 34, SC.w, 62); x.fillStyle = "#5a2a14"; x.fillRect(0, yy - 34, SC.w, 2); x.fillRect(0, yy + 26, SC.w, 2); x.textAlign = "center"; x.font = `700 ${Math.round(Math.min(30, SC.w / 13))}px ${PIXFONT}`; x.fillStyle = "#ffe2b0"; x.shadowColor = "#ff5a1a"; x.shadowBlur = 12; x.fillText(b.title, SC.w / 2, yy + 4); if (b.sub) { x.shadowBlur = 0; x.font = `600 13px ${PIXFONT}`; x.fillStyle = "#ffb060"; x.fillText(b.sub.toUpperCase(), SC.w / 2, yy + 20); } x.restore(); } }
  const vg = x.createRadialGradient(SC.w / 2, cyB, Math.min(SC.w, SC.h) * .35, SC.w / 2, cyB, Math.max(SC.w, SC.h) * .75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.65)"); x.fillStyle = vg; x.fillRect(0, 0, SC.w, SC.h);
}
function drawIcon(x, name, px, py, s, col, lw = 2) { const p = new Path2D(IC[name] || IC.star); x.save(); x.translate(px - 12 * s, py - 12 * s); x.scale(s, s); x.strokeStyle = col; x.lineWidth = lw / s; x.lineCap = "round"; x.lineJoin = "round"; x.stroke(p); x.restore(); }
function drawUnit(x, u, v, t, dt) {
  const f = Math.min(1, dt * 14);
  v.gx += (v.tgx - v.gx) * f; v.gy += (v.tgy - v.gy) * f;
  v.off = [v.off[0] * Math.pow(.0004, dt), v.off[1] * Math.pow(.0004, dt)];
  if (v.pt > 0) { v.pt -= dt; if (v.pt <= 0) v.pose = "idle"; }
  v.flash = Math.max(0, v.flash - dt * 4);
  if (u.hp <= 0 || v.dying) v.a = Math.max(0, v.a - dt * 2.2); else v.a = Math.min(1, v.a + dt * 3);
  const [bx, by] = wpos(v.gx, v.gy), px = Math.round(bx + v.off[0]), py = Math.round(by + v.off[1]);
  const sp = unitSprite(u, v);
  if (u.under) { blit(x, sp, px, py + 2, 1); return; }
  const big = u.kind === "boss";
  x.fillStyle = "rgba(0,0,0,.45)"; x.beginPath(); x.ellipse(px, py + 1, big ? 13 : 7, big ? 4 : 2.5, 0, 0, 7); x.fill();
  const B = S.run.board, hh = hero(B);
  let face = v.face; if (u.side === "e" && hh) { const d = scrDir(hh.x - u.x, hh.y - u.y); face = d || face; v.face = face; }
  const fly = u.kind === "foe" && MONSTERS[u.foe].fly, bob = fly ? Math.round(Math.sin(t * 3 + u.id) * 2) - 5 : (v.pose === "idle" && Math.sin(t * 2.6 + u.id) > .55 ? -1 : 0);
  const al = v.a * (u.st.phased ? .45 : 1);
  blit(x, sp, px, py + bob + (big ? 2 : 1), 1, face < 0, al);
  if (v.flash > 0) blit(x, whiteSpr(sp), px, py + bob + (big ? 2 : 1), 1, face < 0, v.flash * .8 * al);
  if (u.hp <= 0) return;
  // points de vie : petits carrés sous les pieds
  const n = u.hpMax, ty = py + 4;
  if (n <= 10) { const w = n * 3 - 1; for (let i = 0; i < n; i++) { x.fillStyle = "#0c0807"; x.fillRect(px - w / 2 + i * 3 - 1 | 0, ty - 1, 4, 4); } for (let i = 0; i < n; i++) { x.fillStyle = i < u.hp ? (u.side === "e" ? "#e0503a" : "#7ad07a") : "#3a2a24"; x.fillRect(px - w / 2 + i * 3 | 0, ty, 2, 2); } }
  else { const w = big ? 30 : 20; x.fillStyle = "#0c0807"; x.fillRect(px - w / 2 - 1, ty - 1, w + 2, 4); x.fillStyle = "#3a2a24"; x.fillRect(px - w / 2, ty, w, 2); x.fillStyle = u.side === "e" ? "#e0503a" : "#7ad07a"; x.fillRect(px - w / 2, ty, Math.round(w * u.hp / n), 2); }
  if (u.side === "e") {
    const top = py + bob - sp.ay + 2;
    let tag = null; if (u.st.stun) tag = ["stun", "#ffd84a"]; else if (u.kind === "foe" && u.foe === "gelee") tag = [String(u.fuse), "#c8f04a"]; else if (u.intent && u.intent.type === "summon") tag = ["skull", "#c49cff"]; else if (u.st.mark) tag = ["mark", "#ff5a5a"];
    const showD = u.intent && u.intent.dmg && (u.intent.tiles || u.intent.type === "threat");
    if (showD || tag) {
      x.save(); x.setTransform(SC.dpr, 0, 0, SC.dpr, 0, 0); const [cx2, cy2] = toCss(px, top - 3), fs = Math.max(11, MV.lay.kd / SC.dpr * 5);
      x.textAlign = "center"; x.font = `700 ${Math.round(fs)}px ${PIXFONT}`; x.lineWidth = 3; x.strokeStyle = "#000";
      if (showD) { x.strokeText("⚔" + u.intent.dmg, cx2, cy2); x.fillStyle = u.intent.tiles ? "#ff7a5a" : "#ffb8a0"; x.fillText("⚔" + u.intent.dmg, cx2, cy2); }
      if (tag) { const ty2 = cy2 - fs * 1.2; if (IC[tag[0]]) drawIcon(x, tag[0], cx2, ty2 - fs * .3, fs / 22, tag[1]); else { x.strokeText(tag[0], cx2, ty2); x.fillStyle = tag[1]; x.fillText(tag[0], cx2, ty2); } }
      x.restore();
    }
  }
}
