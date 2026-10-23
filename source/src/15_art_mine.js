/* ═══════════════════════ Rendu : la mine, la forge, les créatures propres au jeu ═══════════════════════ */
// créatures supplémentaires
function drawFoe(x, art, o = {}, t = 0) {
  const atk = o.atk || 0;
  switch (art) {
    case "bat": { const s = 1.5; const f = Math.sin(t * 14) * 10; const c = [atk * 14, -70]; for (const k of [-1, 1]) shade(x, P([[c[0], c[1]], [c[0] + k * 14 * s, c[1] - 8 * s - f], [c[0] + k * 32 * s, c[1] - 6 * s - f * 1.3, 1], [c[0] + k * 24 * s, c[1] + 2 * s - f * .5], [c[0] + k * 26 * s, c[1] + 8 * s - f * .6, 1], [c[0] + k * 8 * s, c[1] + 6 * s]], true, .4), "#3a2a34", { d: 2 }); shade(x, ell(c[0], c[1] + 3, 7 * s, 10 * s), "#2e2028", { d: 2 }); for (const dx of [-3, 3]) { glow(x, c[0] + dx * s, c[1] - 2, 6, "#ff3a2a", .8); dot(x, c[0] + dx * s, c[1] - 2, 1.8, "#ff6a4a"); } shade(x, P([[c[0] - 7, c[1] - 8], [c[0] - 4, c[1] - 20, 1], [c[0] - 1, c[1] - 9]], true), "#2e2028", { ol: 1.2, d: .5 }); shade(x, P([[c[0] + 1, c[1] - 9], [c[0] + 4, c[1] - 20, 1], [c[0] + 7, c[1] - 8]], true), "#2e2028", { ol: 1.2, d: .5 }); return; }
    case "spore": { const p = .5 + Math.sin(t * 5) * .5, s = 1 + (o.fuse === 1 ? p * .12 : 0); x.save(); x.scale(s, s); shade(x, P([[-26, 0], [-30, -30], [-14, -56], [14, -58], [30, -32], [26, 0, 1]], true, .55), "#5a6a2a", { grad: lgrad(x, 0, -58, 0, 0, [[0, "#8a9a3a"], [1, "#3a4a1a"]]), d: 5 }); for (let i = 0; i < 9; i++) { const px = -18 + (i * 13 % 36), py = -48 + (i * 17 % 40); glow(x, px, py, 7, "#c8f04a", .5 + p * .3); shade(x, circ(px, py, 3.2), "#d8f07a", { ol: 1, d: .5 }); } x.restore(); glow(x, 0, -30, 50, o.fuse === 1 ? "#ff5a2a" : "#a8e04a", .25 + p * .15); return; }
    case "reine": x.save(); x.scale(1.5, 1.5); spider(x, { atk, col: "#2a1418", mark: "#ff2a5a", eye: "#ff4a8a" }, t); shade(x, poly([[-6, -50], [-4, -60], [0, -53], [4, -62], [8, -53], [12, -59], [14, -48]]), MAT.gold, { d: 1 }); x.restore(); return;
    case "ver": { if (o.under) { shade(x, ell(0, -6, 40, 10), "#2a1e16", { d: 2 }); for (let i = 0; i < 6; i++) shade(x, circ(-30 + i * 12, -10 - (i % 2) * 4, 5), "#4a3a2a", { ol: 1, d: 1 }); return; } x.save(); x.scale(1.7, 1.7); leech(x, { atk, col: "#5a3a3a" }, t); x.restore(); return; }
    case "dragon": x.save(); x.scale(1.5, 1.5); lizard(x, { col: "#4a1a14", spots: "#ff8a2a", s: 1.4, atk, wings: "#6a1a14", horns: 1, fire: atk ? "#ff6a1a" : null, eye: "#ffd04a" }, t); x.restore(); return;
  }
  drawMonster(x, art, { atk }, t);
}
const FOE_CACHE = {};
function foeSprite(art, atk, sc, o = {}) {
  const k = art + (atk ? "a" : "") + sc.toFixed(3) + (o.under ? "u" : "") + (o.fuse || "");
  if (FOE_CACHE[k]) return FOE_CACHE[k];
  const big = ["reine", "ver", "dragon", "chevalier_os", "golem"].includes(art);
  const W = Math.ceil((big ? 420 : 300) * sc), H = Math.ceil((big ? 420 : 320) * sc), cv = mkCanvas(W, H), x = cv.getContext("2d");
  x.save(); x.translate(W * .5, H - 22 * sc); x.scale(sc, sc); drawFoe(x, art, { atk, under: o.under, fuse: o.fuse }, atk ? .3 : 0); x.restore();
  litPass(x, W, H); spritePost(cv, sc, { rim: "#ffb070" });
  cv.ax = W * .5; cv.ay = H - 22 * sc; FOE_CACHE[k] = cv; return cv;
}
const SMITH_CACHE = {};
function smithSprite(pose, sc, look) {
  const L = look || smithLook(); const k = [L.tier, L.wtier, L.wpn, pose || "idle", sc.toFixed(3)].join("|");
  if (SMITH_CACHE[k]) return SMITH_CACHE[k];
  const st = STANCE[L.wpn] || STANCE.masse;
  const P0 = { idle: {}, strike: st.twoH && L.wpn === "arbalete" ? { lean: -.05, hx: -5 } : { lean: .3, hx: 8, lFh: .62, lFk: -.3, lBh: -.58, aFs: 1.55, aFe: .2, wa: 1.4 }, hurt: { lean: -.32, hx: -8, head: -.35, aFs: .1, aFe: .9 }, forge: { aFs: 2.2, aFe: .6, wa: 3.2, lean: .05 }, forge2: { aFs: .9, aFe: .1, wa: 1.2, lean: .3, hx: 4 }, cast: { aFs: 2.3, aFe: .3, aBs: 2.0, aBe: .5, wa: 3.1, lean: -.1, free: 1 } }[pose || "idle"];
  return SMITH_CACHE[k] = heroSprite(L, P0, 0, sc);
}
const PETC = {};
function petSpr(id, atk, sc) { const k = id + (atk ? "a" : "") + sc.toFixed(3); return PETC[k] = PETC[k] || petSprite(PETS[id].draw, { atk }, atk ? .3 : 0, sc); }

// ── tuiles de la mine ──
const ORE_GLOW = { fer: "#ffb070", argent: "#9fd8ff", ame: "#c49cff" };
const ORE_ROCK = { fer: "#5a3a26", argent: "#2e3a4a", ame: "#2e2440" };
function tileNoise(x0, y0) { return ((x0 * 73856093) ^ (y0 * 19349663)) >>> 0; }
function drawTile(x, t, px, py, s, gx, gy, time, depth) {
  const r = mkRng(tileNoise(gx + 1, gy + 1) + depth * 977);
  const base = mixc("#2a2420", depth >= 15 ? "#3a1814" : depth >= 8 ? "#1c2230" : "#2a2420", .5);
  // dalle
  const pad = s * .03, w = s - pad * 2;
  if (t.t !== "lava") {
    x.fillStyle = lgrad(x, px, py, px, py + s, [[0, lt(base, .08 + r() * .05)], [1, dk(base, .25)]]);
    x.fillRect(px + pad, py + pad, w, w);
    x.strokeStyle = rgba("#000", .7); x.lineWidth = Math.max(1, s * .03); x.strokeRect(px + pad, py + pad, w, w);
    x.strokeStyle = rgba("#ffffff", .05); x.beginPath(); x.moveTo(px + pad + 1, py + s - pad - 1); x.lineTo(px + pad + 1, py + pad + 1); x.lineTo(px + s - pad - 1, py + pad + 1); x.stroke();
    x.strokeStyle = rgba("#000", .45); x.lineWidth = 1; for (let i = 0; i < 2; i++) { const a = px + r() * s, b = py + r() * s; x.beginPath(); x.moveTo(a, b); x.lineTo(a + (r() - .5) * s * .4, b + (r() - .5) * s * .4); x.stroke(); }
  }
  if (t.rubble) for (let i = 0; i < 5; i++) { x.fillStyle = rgba("#5a4a3a", .8); x.beginPath(); x.arc(px + s * (.2 + r() * .6), py + s * (.3 + r() * .55), s * (.03 + r() * .04), 0, 7); x.fill(); }
  if (t.t === "spikes") {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { const cx = px + s * (.25 + i * .25), cy = py + s * (.3 + j * .22); if (t.on) { shade(x, P([[cx - s * .05, cy + s * .04], [cx, cy - s * .12, 1], [cx + s * .05, cy + s * .04]], true), "#8a8e94", { ol: 1, d: 1, hatch: 0 }); } else { x.fillStyle = "#0a0808"; x.beginPath(); x.arc(cx, cy, s * .035, 0, 7); x.fill(); } }
    if (t.on) { x.fillStyle = rgba("#ff3a2a", .08); x.fillRect(px, py, s, s); }
  }
  if (t.t === "lava") {
    const f = .7 + Math.sin(time * 3 + gx + gy) * .2;
    x.fillStyle = lgrad(x, px, py, px + s, py + s, [[0, "#ff9a3a"], [.5, "#c03a0a"], [1, "#ff6a1a"]]); x.fillRect(px, py, s, s);
    x.save(); x.globalCompositeOperation = "lighter"; glow(x, px + s / 2, py + s / 2, s * .9, "#ff6a1a", .4 * f); for (let i = 0; i < 3; i++) glow(x, px + s * (.2 + ((time * .3 + i * .33) % 1) * .6), py + s * (.3 + i * .2), s * .12, "#ffe08a", .6); x.restore();
    x.strokeStyle = rgba("#2a0a04", .8); x.lineWidth = 2; x.strokeRect(px + 1, py + 1, s - 2, s - 2);
  }
  if (t.t === "stairs") {
    const g = .6 + Math.sin(time * 3) * .2;
    x.fillStyle = "#050304"; x.fillRect(px + s * .12, py + s * .12, s * .76, s * .76);
    for (let i = 0; i < 4; i++) { x.fillStyle = mixc("#3a3028", "#0a0806", i / 4); x.fillRect(px + s * (.14 + i * .05), py + s * (.16 + i * .17), s * (.72 - i * .1), s * .12); }
    x.save(); x.globalCompositeOperation = "lighter"; glow(x, px + s / 2, py + s / 2, s * .8, "#ffb04a", .35 * g); x.restore();
    x.strokeStyle = rgba("#ffc070", .7 * g); x.lineWidth = 2; x.strokeRect(px + s * .1, py + s * .1, s * .8, s * .8);
  }
}
// murs et filons : blocs en relief
function drawBlock(x, t, px, py, s, gx, gy, time, depth) {
  const r = mkRng(tileNoise(gx + 7, gy + 3) + depth * 31);
  const h = s * .42, rock = t.t === "ore" ? ORE_ROCK[t.ore] : depth >= 15 ? "#3a2420" : depth >= 8 ? "#262a34" : "#3a332c";
  const top = P([[px + s * .04, py - h + s * .1], [px + s * .2, py - h - r() * s * .06], [px + s * .55, py - h - s * .05 - r() * s * .05], [px + s * .85, py - h + r() * s * .04], [px + s * .97, py - h + s * .12], [px + s * .96, py + s * .5], [px + s * .04, py + s * .5]], true, .35);
  shade(x, top, rock, { grad: lgrad(x, px, py - h, px, py + s * .5, [[0, lt(rock, .18)], [1, rock]]), d: s * .06, ol: Math.max(1.4, s * .035), hatch: 0 });
  const front = poly([[px + s * .04, py + s * .5], [px + s * .96, py + s * .5], [px + s * .97, py + s * .97], [px + s * .03, py + s * .97]]);
  shade(x, front, dk(rock, .45), { d: s * .04, ol: Math.max(1.4, s * .035), hatch: 0 });
  x.strokeStyle = rgba("#000", .5); x.lineWidth = 1; for (let i = 0; i < 3; i++) { const a = px + s * (.15 + r() * .7); x.beginPath(); x.moveTo(a, py - h * .6 + r() * s * .3); x.lineTo(a + (r() - .5) * s * .2, py + s * .45); x.stroke(); }
  if (t.t === "ore") {
    const col = ORE_GLOW[t.ore], f = .75 + Math.sin(time * 2.5 + gx * 2 + gy) * .25;
    x.save(); x.globalCompositeOperation = "lighter"; glow(x, px + s / 2, py - h * .1, s * .75, col, .32 * f); x.restore();
    const cxs = px + s * .5, cys = py - h * .05;
    const shards = [[-.22, .08, .2, -.5], [-.05, -.08, .26, -.1], [.14, .04, .2, .35], [.26, .14, .14, .7], [-.3, .16, .13, -.8]].slice(0, 3 + t.n);
    for (const [ox, oy, ln, a] of shards) { const bx = cxs + ox * s, by = cys + oy * s + s * .12, L = ln * s, wd = L * .32; const pts = [[-wd, 0], [-wd * .7, -L * .7], [0, -L, 1], [wd * .7, -L * .7], [wd, 0]].map(([u, v2, k]) => [bx + u * Math.cos(a) - v2 * Math.sin(a), by + u * Math.sin(a) + v2 * Math.cos(a), k]); shade(x, P(pts, true, .2), col, { grad: lgrad(x, bx, by - L, bx, by, [[0, lt(col, .5)], [1, dk(col, .25)]]), ol: Math.max(1.2, s * .025), d: 1.5, hi: .8, hatch: 0 }); }
  }
}
// fond de caverne
const CAVE_BG = {};
function caveBg(w, h, depth) {
  const k = w + "x" + h + ":" + Math.min(3, Math.floor(depth / 5)); if (CAVE_BG[k]) return CAVE_BG[k];
  const cv = mkCanvas(w, h), x = cv.getContext("2d"), rng = mkRng(Math.floor(depth / 5) * 99 + 3);
  const tint = depth >= 15 ? ["#140806", "#3a1408"] : depth >= 10 ? ["#100a14", "#2a1430"] : depth >= 5 ? ["#080c12", "#1a2430"] : ["#0c0908", "#2a1e16"];
  x.fillStyle = lgrad(x, 0, 0, 0, h, [[0, tint[0]], [.5, tint[1]], [1, tint[0]]]); x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { x.fillStyle = rgba("#000", .25 + rng() * .3); const rx = rng() * w, ry = rng() * h, rs = 30 + rng() * 120; x.beginPath(); x.moveTo(rx - rs, ry); x.lineTo(rx - rs * .3, ry - rs * .5); x.lineTo(rx + rs * .6, ry - rs * .3); x.lineTo(rx + rs, ry + rs * .4); x.lineTo(rx, ry + rs * .6); x.fill(); }
  // stalactites
  for (let i = 0; i < 14; i++) { const sx = rng() * w, sl = 30 + rng() * 90; x.fillStyle = "#050404"; x.beginPath(); x.moveTo(sx - 12, 0); x.lineTo(sx + 12, 0); x.lineTo(sx + 2, sl); x.fill(); }
  // poutres de mine
  for (const bx of [w * .06, w * .94]) { x.fillStyle = "#1a100a"; x.fillRect(bx - 10, 0, 20, h); }
  x.fillStyle = "#1a100a"; x.fillRect(0, h * .08, w, 16);
  for (let i = 0; i < 4; i++) { const lx = w * (.15 + i * .23); x.strokeStyle = "#0a0604"; x.lineWidth = 2; x.beginPath(); x.moveTo(lx, h * .08 + 16); x.lineTo(lx, h * .08 + 40); x.stroke(); glow(x, lx, h * .08 + 48, 50, "#ffa04a", .3); x.fillStyle = "#ffd08a"; x.beginPath(); x.arc(lx, h * .08 + 48, 4, 0, 7); x.fill(); }
  const np = noisePattern(x); if (np) { x.fillStyle = np; x.fillRect(0, 0, w, h); }
  CAVE_BG[k] = cv; return cv;
}
// la forge (écran principal)
function drawForgeRoom(x, w, h, t) {
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#0c0807"); g.addColorStop(1, "#1a100a"); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const floorY = h * .74;
  // murs de pierre
  x.save(); x.strokeStyle = "rgba(0,0,0,.55)"; x.lineWidth = 2;
  const bw = Math.max(46, w / 12), bh = bw * .5;
  for (let yy = 0, r = 0; yy < floorY; yy += bh, r++) for (let xx = -(r % 2) * bw / 2; xx < w; xx += bw) { x.fillStyle = mixc("#201814", "#2a201a", ((xx * 7 + yy * 3) % 10) / 10); x.fillRect(xx, yy, bw - 2, bh - 2); }
  x.restore();
  // âtre
  const fx = w * (w < h ? .5 : .68), fy = floorY, fw = Math.min(w * .5, 300), fh = fw * .8;
  const fl = .8 + Math.sin(t * 7) * .08 + Math.sin(t * 13) * .06;
  x.fillStyle = "#120c0a"; x.fillRect(fx - fw * .62, fy - fh * 1.25, fw * 1.24, fh * 1.25);
  x.fillStyle = "#0a0605"; x.beginPath(); x.moveTo(fx - fw * .45, fy); x.lineTo(fx - fw * .45, fy - fh * .55); x.quadraticCurveTo(fx, fy - fh * 1.0, fx + fw * .45, fy - fh * .55); x.lineTo(fx + fw * .45, fy); x.fill();
  x.save(); x.globalCompositeOperation = "lighter";
  glow(x, fx, fy - fh * .2, fw * 1.4, "#ff5a1a", .35 * fl);
  for (let i = 0; i < 9; i++) glow(x, fx + Math.sin(t * 5 + i * 1.7) * fw * .2, fy - fh * (.12 + (i % 4) * .1) - Math.abs(Math.sin(t * 4 + i)) * fh * .1, fw * (.22 - i * .015), i < 3 ? "#ffe08a" : "#ff7a2a", .55);
  for (let i = 0; i < 14; i++) { const k = (t * .35 + i / 14) % 1; glow(x, fx + Math.sin(i * 3.1 + t) * fw * .3, fy - fh * .5 - k * h * .6, 3 + (i % 3), "#ffa04a", (1 - k) * .9); }
  x.restore();
  // sol
  x.fillStyle = lgrad(x, 0, floorY, 0, h, [[0, "#2a1c14"], [1, "#0a0605"]]); x.fillRect(0, floorY, w, h - floorY);
  x.save(); x.globalCompositeOperation = "lighter"; const lg = x.createRadialGradient(fx, floorY, 10, fx, floorY, w * .7); lg.addColorStop(0, `rgba(255,120,40,${.25 * fl})`); lg.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = lg; x.fillRect(0, floorY - h * .4, w, h); x.restore();
  // râtelier d'armes
  const rx = w * (w < h ? .1 : .12), ry = floorY - h * .42;
  x.fillStyle = "#2a1a10"; x.fillRect(rx - 10, ry, Math.min(w * .3, 220), 10); x.fillRect(rx - 10, ry + h * .2, Math.min(w * .3, 220), 10);
  return { fx, fy, fw, floorY };
}
function drawAnvil(x, ax, ay, s) {
  shade(x, poly([[ax - 40 * s, ay - 46 * s], [ax + 52 * s, ay - 46 * s], [ax + 36 * s, ay - 34 * s], [ax + 16 * s, ay - 30 * s], [ax + 12 * s, ay - 14 * s], [ax + 26 * s, ay], [ax - 26 * s, ay], [ax - 12 * s, ay - 14 * s], [ax - 16 * s, ay - 30 * s], [ax - 30 * s, ay - 34 * s]]), "#3a3a40", { grad: metalGrad(x, "#4a4a52", ax - 40 * s, ay - 46 * s, ax + 40 * s, ay), d: 4 });
  x.save(); x.globalCompositeOperation = "lighter"; glow(x, ax + 10 * s, ay - 48 * s, 30 * s, "#ff8a3a", .35); x.restore();
}
// armes du forgeron (en plus de celles du moteur)
MON_WPN.marteau = (x, T) => {
  shade(x, seg([0, 26], [0, -52], 5, 5), T >= 3 ? MAT.dwood : MAT.wood, { d: 1.2 });
  for (let i = 0; i < 3; i++) line(x, [[-2.5, 18 - i * 5], [2.5, 16 - i * 5]], 1, rgba(INK, .5));
  const c = T >= 5 ? "#2a2438" : T >= 4 ? "#3a3438" : T >= 3 ? "#a8b0b8" : "#6a7076";
  shade(x, P([[-16, -48, 1], [18, -48, 1], [20, -66, 1], [-14, -66, 1]], true), c, { grad: metalGrad(x, c, -16, -66, 20, -48), d: 2.5 });
  shade(x, P([[-20, -50, 1], [-14, -50, 1], [-14, -64, 1], [-20, -64, 1]], true), dk(c, .2), { d: 1 });
  if (T >= 4) { line(x, [[-14, -57], [18, -57]], 2, T >= 5 ? "#b48cff" : "#ff7a2a"); x.save(); x.globalCompositeOperation = "lighter"; glow(x, 2, -57, 22, T >= 5 ? "#b48cff" : "#ff7a2a", .45); x.restore(); }
  if (T === 3) line(x, [[-14, -52], [18, -52]], 1.2, rgba("#ffffff", .5));
};
MON_WPN.lance = (x, T) => {
  shade(x, seg([0, 40], [0, -70], 4.2, 3.8), MAT.wood, { d: 1 });
  const c = T >= 5 ? "#c8b8ff" : T >= 3 ? "#b8c0c8" : "#7a8088";
  shade(x, P([[-5, -68], [5, -68], [3, -88], [0, -98, 1], [-3, -88]], true, .3), c, { grad: metalGrad(x, c, -5, -98, 5, -68), d: 1.2 });
  line(x, [[-7, -68], [7, -68]], 3, T >= 4 ? MAT.gold : MAT.iron);
  if (T >= 4) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, -86, 16, T >= 5 ? "#b48cff" : "#ff8a3a", .5); x.restore(); }
};
MON_WPN.fleau = (x, T) => {
  shade(x, seg([0, 10], [0, -24], 4.6, 4.6), MAT.dleather, { d: 1 });
  const ch = [[0, -24], [6, -34], [14, -40], [20, -44]]; line(x, ch, 3, INK, true); line(x, ch, 1.6, MAT.iron, true);
  const c = T >= 5 ? "#2a2438" : T >= 3 ? "#9aa2aa" : "#5a6066";
  shade(x, circ(24, -48, 10), c, { grad: metalGrad(x, c, 14, -58, 34, -38), d: 2 });
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; shade(x, P([[24 + Math.cos(a) * 8 - Math.sin(a) * 2.4, -48 + Math.sin(a) * 8 + Math.cos(a) * 2.4], [24 + Math.cos(a) * 16, -48 + Math.sin(a) * 16, 1], [24 + Math.cos(a) * 8 + Math.sin(a) * 2.4, -48 + Math.sin(a) * 8 - Math.cos(a) * 2.4]], true), MAT.dsteel, { ol: 1, d: .5 }); }
  if (T >= 4) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, 24, -48, 22, T >= 5 ? "#b48cff" : "#ff7a2a", .45); x.restore(); }
};
