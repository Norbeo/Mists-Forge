/* ═══════════════════════ La mine : la grille, les tours, les animations ═══════════════════════ */
const MV = { vis: {}, fx: [], txt: [], busy: false, shake: 0, flash: 0, banner: null, sel: null, lay: null };
const mwait = ms => new Promise(r => setTimeout(r, ms * (S && S.opts.fast ? .5 : 1)));
function mlayout() {
  const topH = ($("#top").offsetHeight || 60), botH = ($("#bot").offsetHeight || 130);
  const W = SC.w, H = SC.h - topH - botH;
  const ts = Math.floor(Math.min((W - 16) / COLS, (H - 20) / (ROWS + .35)));
  const bw = ts * COLS, bh = ts * ROWS;
  MV.lay = { ts, ox: Math.round((W - bw) / 2), oy: Math.round(topH + (H - bh) / 2 + ts * .2), bw, bh };
}
const cx = gx => MV.lay.ox + gx * MV.lay.ts + MV.lay.ts / 2;
const cy = gy => MV.lay.oy + gy * MV.lay.ts + MV.lay.ts * .78;
function visOf(u) { let v = MV.vis[u.id]; if (!v) { v = MV.vis[u.id] = { x: cx(u.x), y: cy(u.y), a: 0, flash: 0, pose: "idle", pt: 0, off: [0, 0], face: u.side === "e" ? -1 : 1 }; } return v; }
function syncVis(B, snap) { for (const u of B.units) { const v = visOf(u); if (snap) { v.x = cx(u.x); v.y = cy(u.y); } } }
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
function tileFromXY(px, py) { const L = MV.lay; const gx = Math.floor((px - L.ox) / L.ts), gy = Math.floor((py - L.oy) / L.ts); return inB(gx, gy) ? [gx, gy] : null; }
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
function sparks(x, y, col, n = 12, sp = 160) { for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, s = sp * (.3 + Math.random()); MV.fx.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 80, g: 340, r: 2 + Math.random() * 2, col, t: 0, life: .5 + Math.random() * .4 }); } }
function U(id) { return S.run.board.units.find(u => u.id === id); }
async function play(ev) {
  const ts = MV.lay.ts;
  for (const e of ev) {
    const u = e.id != null ? U(e.id) : null, v = u ? visOf(u) : null;
    switch (e.k) {
      case "move": if (v) { v.face = sgn(e.to[0] - e.from[0]) || v.face; v.tx = cx(e.to[0]); v.ty = cy(e.to[1]); if (u.kind === "hero") sfx("step"); await mwait(u.kind === "hero" ? 160 : 110); } break;
      case "atk": case "patk": case "eatk": {
        if (!v) break;
        const to = e.to || (e.tiles && e.tiles[0]); if (to) { v.face = sgn(to[0] - u.x) || v.face; }
        v.pose = "strike"; v.pt = .35;
        if (e.tiles) for (const [a, b] of e.tiles) MV.fx.push({ tile: [a, b], col: e.k === "eatk" ? "#ff3a2a" : "#ffb060", t: 0, life: .35 });
        if (to) { const dx = cx(to[0]) - v.x, dy = cy(to[1]) - v.y, L = Math.hypot(dx, dy) || 1; const reach = Math.min(L * .45, ts * .45); v.off = [dx / L * reach, dy / L * reach]; }
        if (e.kind === "shot" || e.kind === "web" || (u.kind === "hero" && WEAPONS[S.equip.wpn].shot)) { MV.fx.push({ proj: 1, x0: v.x, y0: v.y - ts * .5, x1: cx(to[0]), y1: cy(to[1]) - ts * .4, col: e.kind === "web" ? "#e8e8e0" : "#ffd08a", t: 0, life: .18 }); sfx("shoot"); }
        else if (e.kind === "fire") { sfx("fire"); MV.flash = .3; }
        else if (e.kind === "slam" || e.kind === "emerge") { sfx("heavy"); MV.shake = .3; }
        else sfx(u.kind === "hero" ? "heavy" : "slash");
        await mwait(e.k === "eatk" ? 170 : 130); break;
      }
      case "hit": if (v) { v.flash = 1; v.pose = "hurt"; v.pt = .3; sparks(v.x, v.y - ts * .45, u.side === "e" ? "#ffb060" : "#ff4a3a", 10); pop(v.x, v.y - ts * .95, "-" + e.dmg, u.side === "h" ? "#ff5a4a" : "#ffe0a0", u.kind === "hero"); if (u.kind === "hero") { MV.shake = .25; MV.flash = .25; sfx("hit"); refreshBars(); } else sfx("hit"); await mwait(90); } break;
      case "die": if (v) { v.dying = 1; sparks(v.x, v.y - ts * .4, "#2a1a14", 16, 120); sfx(u.kind === "boss" ? "die" : "hit"); await mwait(u.kind === "boss" ? 700 : 180); } break;
      case "push": if (v) { v.tx = cx(e.to[0]); v.ty = cy(e.to[1]); pop(v.x, v.y - ts, "Repoussé", "#ffb060"); await mwait(120); } break;
      case "bump": if (v) { v.off = [e.dir[0] * ts * .25, e.dir[1] * ts * .25]; MV.shake = .15; pop(v.x, v.y - ts * 1.15, "Choc !", "#ffb060"); sfx("heavy"); await mwait(90); } break;
      case "mine": { const x0 = cx(e.x), y0 = cy(e.y) - ts * .5; sparks(x0, y0, ORE_GLOW[e.ore], 22, 220); pop(x0, y0 - ts * .3, `+${e.n} ${ORE_TXT[e.ore]}`, ORE_GLOW[e.ore], true); sfx("forge"); refreshBars(); await mwait(160); break; }
      case "drop": pop(cx(e.x), cy(e.y) - ts * .8, `+${e.n} ${ORE_TXT[e.ore]}`, ORE_GLOW[e.ore]); sfx("coin"); refreshBars(); break;
      case "collapse": sparks(cx(e.x), cy(e.y) - ts * .3, "#5a4a3a", 10, 90); break;
      case "boom": { const x0 = cx(e.x), y0 = cy(e.y) - ts * .4; for (const [a, b] of [[0, 0], ...DIRS8]) MV.fx.push({ tile: [e.x + a, e.y + b], col: "#c8f04a", t: 0, life: .5 }); sparks(x0, y0, "#c8f04a", 40, 300); MV.shake = .4; sfx("crit"); await mwait(220); break; }
      case "stairs": sparks(cx(e.x), cy(e.y) - ts * .4, "#ffb04a", 30, 200); sfx("win"); MV.hint = null; MV.banner = { title: "L'escalier s'ouvre", sub: "", t: 0, life: 1.1 }; await mwait(300); break;
      case "heal": if (v) { pop(v.x, v.y - ts, "+" + e.v, "#9fe07a"); sparks(v.x, v.y - ts * .5, "#9fe07a", 10, 80); refreshBars(); } break;
      case "potion": sfx("heal"); break;
      case "block": if (v) { pop(v.x, v.y - ts, "Bloqué", "#a0c8ff", true); sfx("forge"); await mwait(120); } break;
      case "stun": if (v) pop(v.x, v.y - ts * 1.2, "Étourdi", "#ffd84a"); break;
      case "web": if (v) { pop(v.x, v.y - ts * 1.2, "Englué", "#e8e8e0", true); } break;
      case "phase": if (v) pop(v.x, v.y - ts, "Intangible", "#a0c0ff"); break;
      case "spawn": if (v) { v.a = 0; sparks(v.x, v.y - ts * .3, "#9a6aff", 14, 100); sfx("dark"); await mwait(150); } break;
      case "burrow": if (v) { sparks(v.x, v.y - ts * .2, "#6a5040", 24, 160); MV.shake = .3; sfx("heavy"); await mwait(200); } break;
      case "emerge": if (v) { v.tx = cx(u.x); v.ty = cy(u.y); v.x = v.tx; v.y = v.ty; sparks(v.x, v.y - ts * .2, "#6a5040", 30, 220); MV.shake = .4; await mwait(150); } break;
      case "rock": { const x0 = cx(e.x), y0 = cy(e.y) - ts * .4; MV.fx.push({ rockfall: 1, x: x0, y: y0, t: 0, life: .3 }); sparks(x0, y0, "#6a5a4a", 14, 140); sfx("heavy"); await mwait(60); break; }
      case "rumble": MV.shake = .3; MV.hint = "La mine gronde : des <b>rochers</b> vont tomber !"; break;
      case "msg": pop(SC.w / 2, MV.lay.oy + MV.lay.bh * .4, e.text, "#ffb060", true); break;
      case "petcast": if (v) { sparks(v.x, v.y - ts * .5, "#ffe8a0", 10, 80); sfx("heal"); } break;
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
  scene: () => (x, t) => { drawForgeRoom(x, SC.w, SC.h, t); x.fillStyle = "rgba(0,0,0,.6)"; x.fillRect(0, 0, SC.w, SC.h); },
  mid: r => `<div class="title" style="pointer-events:auto;justify-content:center"><div class="big">${r.dead ? "Vous êtes tombé" : "De retour à la forge"}</div><p class="lore">${r.dead ? `La mine vous a pris à la profondeur ${r.depth}. Des mineurs vous ont remonté, mais une partie du minerai est restée en bas.` : `Vous remontez de la profondeur ${r.depth - 1}, les poches pleines.`}</p><div class="row" style="flex-wrap:wrap;justify-content:center">${oreChips(r.got, true)}<span class="pill" style="color:#ffb060">${ico("ember", "#ff8a3a")}+${r.embers}</span></div>${r.dead && r.lost && Object.values(r.lost).some(v => v) ? `<p class="small dim">Perdu : ${Object.keys(r.lost).filter(k => r.lost[k]).map(k => r.lost[k] + " " + ORE_TXT[k]).join(", ")}</p>` : ""}<p class="small dim">${r.kills} monstres terrassés · record ${S.best}</p><button class="btn main" data-a="toForge" style="min-width:240px">${ico("anvil")}À la forge</button></div>`,
  mount: r => { sfx(r.dead ? "lose" : "win"); musicPlay("bastion"); },
};
ACT.toForge = () => go("forge");
// ── dessin de la mine ──
function drawMine(x, t, dt) {
  const run = S.run; if (!run) return; const B = run.board, L = MV.lay; if (!L) return;
  let sx = 0, sy = 0; if (MV.shake > 0) { MV.shake -= dt; sx = (Math.random() - .5) * 12 * MV.shake; sy = (Math.random() - .5) * 10 * MV.shake; }
  x.drawImage(caveBg(Math.ceil(SC.w), Math.ceil(SC.h), B.depth), 0, 0);
  x.save(); x.translate(sx, sy);
  const ts = L.ts, h = hero(B);
  // cadre de la grille
  x.fillStyle = "rgba(0,0,0,.55)"; x.fillRect(L.ox - 8, L.oy - ts * .5, L.bw + 16, L.bh + ts * .5 + 8);
  for (let gy = 0; gy < ROWS; gy++) for (let gx = 0; gx < COLS; gx++) { const tl = B.tiles[gy][gx]; if (!solid(tl)) drawTile(x, tl, L.ox + gx * ts, L.oy + gy * ts, ts, gx, gy, t, B.depth); else { x.fillStyle = "#0e0a08"; x.fillRect(L.ox + gx * ts, L.oy + gy * ts, ts, ts); } }
  // aides au jeu : menaces, intentions, déplacements, cibles
  const playing = B.phase === "player" && !MV.busy;
  const threat = !B.cleared ? threatMap(B) : new Map();
  for (const [k2] of threat) { const [gx, gy] = k2.split(",").map(Number); if (solid(tileAt(B, gx, gy))) continue; x.fillStyle = "rgba(255,60,30,.13)"; x.fillRect(L.ox + gx * ts + 2, L.oy + gy * ts + 2, ts - 4, ts - 4); x.strokeStyle = "rgba(255,80,40,.22)"; x.lineWidth = 1; x.strokeRect(L.ox + gx * ts + 5, L.oy + gy * ts + 5, ts - 10, ts - 10); }
  const pulse = .55 + Math.sin(t * 5) * .25;
  for (const e of foes(B)) if (e.intent && e.intent.tiles) for (const [gx, gy] of e.intent.tiles) { if (!inB(gx, gy)) continue; const px = L.ox + gx * ts, py = L.oy + gy * ts; x.fillStyle = `rgba(255,40,20,${.22 + pulse * .2})`; x.fillRect(px + 3, py + 3, ts - 6, ts - 6); x.strokeStyle = `rgba(255,90,60,${.6 + pulse * .3})`; x.lineWidth = 2; x.strokeRect(px + 4, py + 4, ts - 8, ts - 8); drawIcon(x, e.intent.type === "web" ? "trap" : e.intent.type === "fire" ? "fire" : e.intent.type === "bomb" ? "boom" : "swords", px + ts / 2, py + ts / 2, ts / 60, "rgba(255,200,180,.75)", 2); }
  if (B.rocks) for (const [gx, gy] of B.rocks) { const px = L.ox + gx * ts, py = L.oy + gy * ts; x.fillStyle = `rgba(40,20,10,${.35 + pulse * .2})`; x.beginPath(); x.ellipse(px + ts / 2, py + ts * .6, ts * .36, ts * .2, 0, 0, 7); x.fill(); drawIcon(x, "boom", px + ts / 2, py + ts * .55, ts / 70, "rgba(255,180,120,.8)", 2); }
  if (playing && h) {
    if (!h.st.web) for (const [k2] of reachable(B, h, B.mv)) { const [gx, gy] = k2.split(",").map(Number); const px = L.ox + gx * ts + ts / 2, py = L.oy + gy * ts + ts / 2; x.fillStyle = `rgba(255,200,120,${.18 + pulse * .1})`; x.beginPath(); x.arc(px, py, ts * .16, 0, 7); x.fill(); x.strokeStyle = "rgba(255,200,120,.5)"; x.lineWidth = 1.5; x.stroke(); }
    if (B.atk > 0) for (const tg of weaponTargets(B, h)) { const px = L.ox + tg.x * ts, py = L.oy + tg.y * ts; x.strokeStyle = `rgba(255,170,60,${.7 + pulse * .3})`; x.lineWidth = 3; const c = ts * .22; for (const [ax, ay, bx, by] of [[0, 0, 1, 0], [0, 0, 0, 1], [1, 0, -1, 0], [1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 0, -1], [1, 1, -1, 0], [1, 1, 0, -1]]) { x.beginPath(); x.moveTo(px + ax * ts + (ax ? -4 : 4), py + ay * ts + (ay ? -4 : 4)); x.lineTo(px + ax * ts + (ax ? -4 : 4) + bx * c, py + ay * ts + (ay ? -4 : 4) + by * c); x.stroke(); } }
  }
  // éclairs de cases (attaques en cours)
  for (const f of MV.fx) if (f.tile) { f.t += dt; const k = f.t / f.life; if (k >= 1) { f.done = 1; continue; } const [gx, gy] = f.tile; if (!inB(gx, gy)) continue; x.fillStyle = rgba(f.col, .45 * (1 - k)); x.fillRect(L.ox + gx * ts, L.oy + gy * ts, ts, ts); }
  // rangées : blocs puis unités (le relief cache ce qui est derrière)
  const units = B.units.filter(u => (u.hp > 0 || (MV.vis[u.id] && MV.vis[u.id].a > .02)));
  for (const u of units) { const v = visOf(u); if (v.tx == null) { v.tx = cx(u.x); v.ty = cy(u.y); } }
  for (let gy = 0; gy < ROWS; gy++) {
    for (let gx = 0; gx < COLS; gx++) { const tl = B.tiles[gy][gx]; if (solid(tl)) drawBlock(x, tl, L.ox + gx * ts, L.oy + gy * ts, ts, gx, gy, t, B.depth); }
    for (const u of units.filter(u => Math.round((MV.vis[u.id].ty - L.oy - ts * .78) / ts) === gy)) drawUnit(x, u, t, dt);
  }
  // projectiles, étincelles, textes
  x.save(); x.globalCompositeOperation = "lighter";
  for (const f of MV.fx) { if (f.tile) continue; f.t += dt; const k = f.t / f.life; if (k >= 1) { f.done = 1; continue; }
    if (f.proj) { const px = lerp(f.x0, f.x1, k), py = lerp(f.y0, f.y1, k); x.strokeStyle = f.col; x.lineWidth = 3; x.beginPath(); x.moveTo(px - (f.x1 - f.x0) * .1, py - (f.y1 - f.y0) * .1); x.lineTo(px, py); x.stroke(); glow(x, px, py, 10, f.col, .8); continue; }
    if (f.rockfall) { glow(x, f.x, f.y - (1 - k) * 80, 12, "#a08060", .6); continue; }
    f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; glow(x, f.x, f.y, f.r * 3, f.col, .9 * (1 - k)); }
  x.restore(); MV.fx = MV.fx.filter(f => !f.done);
  for (const p of MV.txt) { p.t += dt; const k = p.t / p.life; if (k >= 1) { p.done = 1; continue; } const yy = p.y - easeOut(k) * 40, a = k < .75 ? 1 : (1 - k) * 4; x.save(); x.globalAlpha = a; x.font = `${p.big ? 900 : 800} ${Math.round(ts * (p.big ? .3 : .24))}px Cinzel, serif`; x.textAlign = "center"; x.lineWidth = 4; x.strokeStyle = "#000"; x.strokeText(p.text, p.x, yy); x.fillStyle = p.col; x.fillText(p.text, p.x, yy); x.restore(); }
  MV.txt = MV.txt.filter(p => !p.done);
  x.restore();
  if (MV.flash > 0) { x.fillStyle = `rgba(255,60,30,${MV.flash * .3})`; x.fillRect(0, 0, SC.w, SC.h); MV.flash -= dt * 2; }
  // bandeau
  if (MV.banner) { const b = MV.banner; b.t += dt; const k = b.t / b.life; if (k >= 1) MV.banner = null; else { const a = k < .15 ? k / .15 : k > .8 ? (1 - k) / .2 : 1, yy = L.oy + L.bh * .42; x.save(); x.globalAlpha = a; x.fillStyle = lgrad(x, 0, yy - 46, 0, yy + 40, [[0, "rgba(0,0,0,0)"], [.3, "rgba(0,0,0,.85)"], [.7, "rgba(0,0,0,.85)"], [1, "rgba(0,0,0,0)"]]); x.fillRect(0, yy - 46, SC.w, 86); x.textAlign = "center"; x.font = `900 ${Math.min(34, SC.w / 12)}px "Cinzel Decorative", Cinzel, serif`; x.shadowColor = "#ff5a1a"; x.shadowBlur = 18; x.fillStyle = "#ffe2b0"; x.fillText(b.title, SC.w / 2, yy + 6); if (b.sub) { x.shadowBlur = 0; x.font = "700 13px Cinzel, serif"; x.fillStyle = "#ffb060"; x.fillText(b.sub.toUpperCase(), SC.w / 2, yy + 28); } x.restore(); } }
  const vg = x.createRadialGradient(SC.w / 2, L.oy + L.bh / 2, L.bw * .4, SC.w / 2, L.oy + L.bh / 2, Math.max(SC.w, SC.h) * .75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.6)"); x.fillStyle = vg; x.fillRect(0, 0, SC.w, SC.h);
}
function drawIcon(x, name, px, py, s, col, lw = 2) { const p = new Path2D(IC[name] || IC.star); x.save(); x.translate(px - 12 * s, py - 12 * s); x.scale(s, s); x.strokeStyle = col; x.lineWidth = lw / s; x.lineCap = "round"; x.lineJoin = "round"; x.stroke(p); x.restore(); }
function drawUnit(x, u, t, dt) {
  const v = visOf(u), ts = MV.lay.ts;
  v.x += (v.tx - v.x) * Math.min(1, dt * 14); v.y += (v.ty - v.y) * Math.min(1, dt * 14);
  v.off = [v.off[0] * Math.pow(.0004, dt), v.off[1] * Math.pow(.0004, dt)];
  if (v.pt > 0) { v.pt -= dt; if (v.pt <= 0) v.pose = "idle"; }
  v.flash = Math.max(0, v.flash - dt * 4);
  if (u.hp <= 0 || v.dying) v.a = Math.max(0, v.a - dt * 2.2); else v.a = Math.min(1, v.a + dt * 3);
  const px = v.x + v.off[0], py = v.y + v.off[1];
  if (u.under) { const sp = foeSprite("ver", 0, ts / 150, { under: 1 }); x.drawImage(sp, px - sp.ax, py - sp.ay); return; }
  // ombre
  x.fillStyle = "rgba(0,0,0,.45)"; x.beginPath(); x.ellipse(v.x, v.y, ts * .32, ts * .09, 0, 0, 7); x.fill();
  let sp, sc;
  if (u.kind === "hero") { sc = ts / 128; sp = smithSprite(v.pose === "idle" ? "idle" : v.pose, sc); }
  else if (u.kind === "pet") { sc = ts / 140; sp = petSpr(u.pet, v.pose === "strike", sc); }
  else { const art = u.kind === "boss" ? BOSSES.find(b => b.id === u.boss).art : MONSTERS[u.foe].art; const big = u.kind === "boss"; sc = ts / (big ? 100 : ["golem"].includes(art) ? 150 : 128); sp = foeSprite(art, v.pose === "strike", sc, { fuse: u.foe === "gelee" ? u.fuse : 0 }); }
  const face = u.kind === "hero" || u.kind === "pet" ? v.face : (hero(S.run.board) ? (hero(S.run.board).x < u.x ? -1 : hero(S.run.board).x > u.x ? 1 : v.face) : -1);
  x.save(); x.globalAlpha = v.a * (u.st.phased ? .45 : 1);
  const br = v.pose === "idle" ? 1 + Math.sin(t * 2.4 + u.id) * .015 : 1;
  x.translate(px, py); x.scale(face < 0 ? -1 : 1, br);
  if (u.kind === "foe" && MONSTERS[u.foe].fly) x.translate(0, Math.sin(t * 3 + u.id) * 3 - ts * .15);
  x.drawImage(sp, -sp.ax, -sp.ay);
  if (v.flash > 0) { x.globalCompositeOperation = "lighter"; x.globalAlpha = v.flash * .7; x.drawImage(sp, -sp.ax, -sp.ay); }
  x.restore();
  if (u.hp <= 0) return;
  // points de vie : petits losanges
  const n = u.hpMax, w = Math.min(ts * .9, n * ts * .14), pw = w / n, by = v.y + ts * .1;
  for (let i = 0; i < n; i++) { x.fillStyle = i < u.hp ? (u.side === "e" ? "#e0503a" : "#7ad07a") : "rgba(0,0,0,.6)"; x.fillRect(v.x - w / 2 + i * pw + 1, by, pw - 2, Math.max(3, ts * .06)); }
  if (u.side === "e") {
    let tag = null; if (u.st.stun) tag = ["stun", "#ffd84a"]; else if (u.kind === "foe" && u.foe === "gelee") tag = [String(u.fuse), "#c8f04a"]; else if (u.intent && u.intent.type === "summon") tag = ["skull", "#c49cff"]; else if (u.st.mark) tag = ["mark", "#ff5a5a"];
    if (u.intent && u.intent.dmg && (u.intent.tiles || u.intent.type === "threat")) { x.font = `800 ${Math.round(ts * .2)}px Cinzel, serif`; x.textAlign = "center"; x.lineWidth = 3; x.strokeStyle = "#000"; const ty = v.y - ts * (u.kind === "boss" ? 1.55 : 1.05); x.strokeText("⚔" + u.intent.dmg, v.x, ty); x.fillStyle = u.intent.tiles ? "#ff7a5a" : "#ffb8a0"; x.fillText("⚔" + u.intent.dmg, v.x, ty); }
    if (tag) { const ty = v.y - ts * (u.kind === "boss" ? 1.75 : 1.28); if (IC[tag[0]]) drawIcon(x, tag[0], v.x, ty, ts / 90, tag[1]); else { x.font = `900 ${Math.round(ts * .26)}px Cinzel`; x.textAlign = "center"; x.fillStyle = tag[1]; x.fillText(tag[0], v.x, ty); } }
  }
}
