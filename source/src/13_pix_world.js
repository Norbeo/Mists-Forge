/* ═══════════════════════ Pixel art : la mine en losanges, la forge ═══════════════════════
   Case iso 32×16 ; ancre = centre du losange, au sol. */
const TW = 32, TH = 16, HW = 14, SLAB = 4;
const BIOMES = [
  { n: "Galeries", top: ["#2e241e", "#3e3028", "#4e3e32", "#5e4c3e"], side: ["#1a1410", "#241c16"], glow: "#ff9a3a", acc: "#8a6a4a" },
  { n: "Puits gris", top: ["#22242a", "#2e3238", "#3c4148", "#4c525a"], side: ["#121418", "#1a1c22"], glow: "#9fd0f0", acc: "#6a7a8a" },
  { n: "Racines", top: ["#1e2618", "#28321e", "#344026", "#425030"], side: ["#10140c", "#181e12"], glow: "#c8e070", acc: "#6a8a3a" },
  { n: "Forges perdues", top: ["#2e1814", "#3e201a", "#4e2a22", "#62362a"], side: ["#180c0a", "#22120e"], glow: "#ff5a1a", acc: "#a8401a" },
  { n: "Cœur d'âme", top: ["#1e1828", "#282034", "#342a44", "#443856"], side: ["#100c16", "#18121e"], glow: "#a888ff", acc: "#6e48c8" },
];
const biomeOf = d => BIOMES[Math.min(BIOMES.length - 1, Math.floor((d - 1) / 5)) % BIOMES.length] || BIOMES[0];
const bIdx = d => Math.min(BIOMES.length - 1, Math.floor((d - 1) / 5));
function hash2(a, b, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
// losange : renvoie pour la ligne r (0..15) l'abscisse de départ et la largeur
const diaRow = r => { const k = r < 8 ? r : 15 - r, w = 4 * (k + 1); return [16 - w / 2, w]; };
function inDia(x, y) { if (y < 0 || y > 15) return false; const [a, w] = diaRow(y); return x >= a && x < a + w; }
function fillDia(g, ox, oy, fn) { for (let r = 0; r < 16; r++) { const [a, w] = diaRow(r); for (let i = 0; i < w; i++) { const c = fn(a + i, r); if (c) P_(g, ox + a + i, oy + r, c); } } }
// dalle (sol) : dessus + tranche
function slab(g, oy, B, seed, fn) {
  const T = B.top, Sd = B.side;
  for (let r = 0; r < 16; r++) { const [a, w] = diaRow(r); if (r >= 8) { for (let i = 0; i < w; i++) { const xx = a + i; for (let s = 1; s <= SLAB; s++) P_(g, xx, oy + r + s, xx < 16 ? Sd[1] : Sd[0]); } } }
  fillDia(g, 0, oy, (x, y) => { const n = hash2(x + seed * 31, y, seed); let c = n < .12 ? T[0] : n < .7 ? T[1] : n < .93 ? T[2] : T[3]; if (fn) c = fn(x, y, c, n) || c; return c; });
  // arêtes : éclairées en haut à gauche, sombres en bas
  for (let r = 0; r < 16; r++) { const [a, w] = diaRow(r); if (r < 8) { P_(g, a, oy + r, T[3]); P_(g, a + 1, oy + r, T[2]); P_(g, a + w - 1, oy + r, T[2]); } else { P_(g, a, oy + r, T[0]); P_(g, a + w - 1, oy + r, Sd[1]); P_(g, a + w - 2, oy + r, T[0]); } }
}
function floorTile(depth, t, gx, gy, frame = 0) {
  const bi = bIdx(depth), B = BIOMES[bi], v = Math.floor(hash2(gx, gy, depth) * 4);
  const kind = t.t === "spikes" ? "sp" + (t.on ? 1 : 0) : t.t === "lava" ? "lv" + frame : t.t === "stairs" ? "st" : t.rubble ? "rb" + v : "fl" + v;
  return spr("tile|" + bi + "|" + kind, TW, TH + SLAB + 1, g => {
    if (t.t === "lava") {
      const E = PAL.ember; slab(g, 0, B, v, (x, y, c, n) => { const d = Math.abs(x - 16) / 16 + Math.abs(y - 8) / 8; if (d > .8) return null; const w = Math.sin((x + y * 2) * .6 + frame * 1.5) + Math.sin((x - y) * .4 - frame); return w > 1.1 ? E[4] : w > .2 ? E[3] : w > -.6 ? E[2] : E[1]; });
      return;
    }
    slab(g, 0, B, v + (t.rubble ? 7 : 0));
    if (t.t === "stairs") {
      for (let s = 0; s < 4; s++) fillDia(g, 0, 0, (x, y) => { const d = Math.abs(x - 16) / 16 + Math.abs(y - 8) / 8; const lim = .78 - s * .18; return d < lim && d > lim - .18 ? (s % 2 ? "#120c0a" : B.side[1]) : null; });
      fillDia(g, 0, 0, (x, y) => (Math.abs(x - 16) / 16 + Math.abs(y - 8) / 8) < .2 ? "#050302" : null);
      for (let r = 0; r < 3; r++) { P_(g, 16 - 8 + r * 2, 7 - r, B.acc); P_(g, 16 + 8 - r * 2, 7 - r, B.acc); }
    }
    if (t.t === "spikes") {
      const pts = [[10, 6], [16, 4], [22, 6], [13, 9], [19, 9], [16, 12]];
      for (const [x, y] of pts) { if (t.on) { P_(g, x, y + 1, "#1a1210"); L_(g, x, y, x, y - 4, "#8a8e92"); P_(g, x, y - 4, "#d84a3a"); P_(g, x - 1, y, "#4c5359"); } else { P_(g, x, y, "#0c0807"); P_(g, x + 1, y, B.top[0]); } }
    }
    if (t.rubble) { for (let i = 0; i < 4; i++) { const x = 6 + Math.floor(hash2(gx + i, gy, 3) * 20), y = 4 + Math.floor(hash2(gy, gx + i, 5) * 8); if (!inDia(x, y)) continue; R_(g, x, y, 2, 2, B.top[3]); P_(g, x + 1, y + 1, B.side[1]); P_(g, x, y, lt(B.top[3], .15)); } }
    // fissures et cailloux
    if (!t.t || t.t === "floor") { const n = hash2(gx * 7, gy * 3, depth); if (n < .5) { let x = 8 + (n * 30 | 0) % 16, y = 6; for (let i = 0; i < 5; i++) { if (inDia(x, y)) P_(g, x, y, B.top[0]); x += hash2(i, gx, gy) < .5 ? 1 : -1; y += i % 2; } } if (n > .8) { P_(g, 20, 9, B.acc); P_(g, 21, 9, B.top[3]); } }
  }, { outline: false, ax: 16, ay: 8 });
}
// bloc : mur ou filon (cube iso)
function blockTile(depth, t, gx, gy) {
  const bi = bIdx(depth), B = BIOMES[bi], v = Math.floor(hash2(gx, gy, depth + 9) * 3), ore = t.t === "ore" ? t.ore : null;
  return spr("blk|" + bi + "|" + v + "|" + (ore || "") + "|" + (t.n || 0), TW, TH + HW + SLAB + 1, g => {
    const T = B.top, top = ore ? ["#1e1814", "#2a221c", "#383028", "#463c32"] : [T[2], T[3], lt(T[3], .1), lt(T[3], .22)];
    // faces
    for (let r = 8; r < 16; r++) { const [a, w] = diaRow(r); for (let i = 0; i < w; i++) { const xx = a + i; for (let s = 0; s <= HW + SLAB - 1; s++) { const y = r + s; const left = xx < 16; let c = left ? (ore ? "#2a211a" : mixc(T[2], T[1], .4)) : (ore ? "#16110e" : mixc(T[0], "#000", .25)); if (s === HW + SLAB - 1 || (r === 15 && s >= HW + SLAB - 2)) c = dk(c, .4); const n = hash2(xx, y, v + 5); if (n < .12) c = dk(c, .3); else if (n > .92) c = lt(c, .08); if ((y + (left ? xx >> 2 : -xx >> 2)) % 6 === 0 && n < .6) c = dk(c, .2); P_(g, xx, y, c); } } }
    fillDia(g, 0, 0, (x, y) => { const n = hash2(x + v * 13, y, 77); return n < .15 ? top[0] : n < .7 ? top[1] : n < .93 ? top[2] : top[3]; });
    for (let r = 0; r < 16; r++) { const [a, w] = diaRow(r); if (r < 8) { P_(g, a, r, lt(top[3], .1)); P_(g, a + w - 1, r, top[3]); } else { P_(g, a, r, lt(top[2], .15)); P_(g, a + w - 1, r, top[2]); } }
    for (let s = 0; s < HW + 4; s++) P_(g, 16, 8 + s, ore ? "#0e0a08" : B.side[0]);
    if (!ore && v === 2) { R_(g, 14, 2, 3, 3, top[2]); P_(g, 15, 0, top[3]); P_(g, 15, 1, top[2]); }
    if (ore) {
      const C = { fer: ["#4c5359", "#8a929a", "#cdd5dc", "#ffffff"], argent: ["#2e5a8a", "#5a9ad0", "#9fd8ff", "#eaf8ff"], ame: ["#3c2470", "#6e48c8", "#a888ff", "#f0e8ff"] }[ore];
      const shard = (x, y, h, lean) => { for (let i = 0; i < h; i++) { const xx = x + Math.round(lean * i / h); P_(g, xx, y - i, i === h - 1 ? C[3] : C[2]); P_(g, xx + 1, y - i, i > h - 3 ? C[2] : C[1]); if (i < h - 2) P_(g, xx + 2, y - i, C[0]); } };
      shard(6, 18, 5, -1); shard(22, 20, 4, 1); shard(13, 10, 6, 0); if (t.n > 1) { shard(18, 6, 5, 1); shard(9, 7, 4, -1); }
      for (const [a, b] of [[10, 22], [24, 14], [5, 13], [20, 25]]) P_(g, a, b, C[2]);
    }
  }, { outline: false, ax: 16, ay: 8 + HW });
}
// surcouches (menaces, déplacements…)
function diaOver(col, mode) {
  return spr("dia|" + col + "|" + mode, TW, TH, g => {
    if (mode === "fill") fillDia(g, 0, 0, (x, y) => col);
    if (mode === "inner") fillDia(g, 0, 0, (x, y) => (Math.abs(x + .5 - 16) / 16 + Math.abs(y + .5 - 8) / 8) < .78 ? col : null);
    if (mode === "edge") for (let r = 0; r < 16; r++) { const [a, w] = diaRow(r); P_(g, a, r, col); P_(g, a + 1, r, col); P_(g, a + w - 1, r, col); P_(g, a + w - 2, r, col); }
    if (mode === "dot") fillDia(g, 0, 0, (x, y) => (Math.abs(x + .5 - 16) / 16 + Math.abs(y + .5 - 8) / 8) < .22 ? col : null);
    if (mode === "corner") for (let r = 0; r < 16; r++) { const [a, w] = diaRow(r); if (r < 3 || r > 12 || (r > 5 && r < 10)) { P_(g, a, r, col); P_(g, a + 1, r, col); P_(g, a + w - 1, r, col); P_(g, a + w - 2, r, col); } }
  }, { outline: false, ax: 16, ay: 8 });
}
// fond de caverne : abîme, stalactites, cristaux lointains
function caveBgPix(w, h, depth) {
  const bi = bIdx(depth), B = BIOMES[bi];
  return spr("cave|" + w + "|" + h + "|" + bi, w, h, g => {
    for (let y = 0; y < h; y++) { const t = y / h, c = mixc(mixc(B.side[0], "#000000", .35), "#030202", Math.abs(t - .45) * 1.6); R_(g, 0, y, w, 1, c); }
    // stalactites en haut, roches en bas
    const rk = [mixc(B.side[0], "#000", .2), B.side[0], B.side[1]];
    for (let x = 0; x < w; x += 1) { const n = hash2(x >> 2, bi, 4); const L = 6 + Math.floor(Math.abs(Math.sin(x * .13)) * 10 + n * 16 * (n > .8 ? 2 : 1)); for (let y = 0; y < L; y++) P_(g, x, y, y > L - 3 ? rk[2] : rk[(x >> 2) % 2]); }
    for (let x = 0; x < w; x++) { const L = 8 + Math.floor(Math.abs(Math.sin(x * .09 + 2)) * 10 + hash2(x >> 3, 8, bi) * 10); for (let y = 0; y < L; y++) P_(g, x, h - 1 - y, y > L - 2 ? rk[2] : rk[(x >> 3) % 2]); }
    // cristaux et braises lointaines
    for (let i = 0; i < 40; i++) { const x = Math.floor(hash2(i, 1, bi) * w), y = Math.floor(hash2(i, 2, bi) * h); P_(g, x, y, mixc(B.glow, "#000", .55 + hash2(i, 3) * .3)); }
  }, { outline: false, ax: 0, ay: 0 });
}
// ── la forge ──
function anvilPix() {
  return spr("anvil", 26, 16, g => { const M = METALS.noirci;
    R_(g, 2, 0, 20, 4, M[3]); R_(g, 2, 0, 20, 1, M[4]); R_(g, 22, 1, 4, 2, M[3]); P_(g, 25, 1, M[2]); R_(g, 0, 0, 3, 2, M[2]);
    R_(g, 8, 4, 9, 4, M[2]); R_(g, 8, 4, 2, 4, M[3]); R_(g, 5, 8, 15, 3, M[2]); R_(g, 5, 8, 15, 1, M[3]);
    R_(g, 4, 11, 18, 5, PAL.wood[1]); R_(g, 4, 11, 18, 1, PAL.wood[2]); R_(g, 4, 13, 18, 1, PAL.wood[0]); }, { ax: 13, ay: 15 });
}
function forgeStatic(w, h, fy, cx, look, rack) {
  return spr("forgeBg|" + w + "|" + h + "|" + JSON.stringify(look.crest) + "|" + look.cloth + "|" + rack, w, h, g => {
    const ST = ["#140e0c", "#1e1612", "#281e18", "#34281f", "#40321f"];
    // mur de pierres
    for (let y = 0; y < fy; y++) for (let x = 0; x < w; x++) {
      const row = Math.floor(y / 7), off = row % 2 ? 6 : 0, bx = Math.floor((x + off) / 12), mort = y % 7 === 6 || (x + off) % 12 === 11;
      const n = hash2(bx, row, 2), l = Math.max(0, 1 - Math.hypot((x - cx + 34) / 70, (y - fy + 20) / 60));
      let c = mort ? ST[0] : ST[1 + (n * 2 | 0)]; if (!mort && l > .35) c = mixc(c, "#5a2a14", (l - .35) * .9); if (!mort && (y % 7 === 0)) c = mixc(c, ST[4], .3 * l + .1);
      P_(g, x, y, c);
    }
    // poutres
    R_(g, 0, 6, w, 4, PAL.wood[1]); R_(g, 0, 6, w, 1, PAL.wood[2]); R_(g, 0, 9, w, 1, PAL.wood[0]);
    for (const px of [cx - 70, cx + 62]) { R_(g, px, 10, 5, fy - 10, PAL.wood[1]); R_(g, px, 10, 1, fy - 10, PAL.wood[2]); R_(g, px + 4, 10, 1, fy - 10, PAL.wood[0]); }
    // sol
    for (let y = fy; y < h; y++) for (let x = 0; x < w; x++) { const r = Math.floor((y - fy) / 6), pl = Math.floor((x + r * 9) / 18), edge = (y - fy) % 6 === 0 || (x + r * 9) % 18 === 0, n = hash2(pl, r, 9), dd = (y - fy) / (h - fy); let c = edge ? "#0e0a08" : mixc(["#2a2018", "#30251c", "#261d16"][n * 3 | 0], "#060403", dd * .8); P_(g, x, y, c); }
    R_(g, 0, fy, w, 1, "#4a3826");
    // four
    const fx = cx - 46, fw = 34;
    for (let y = fy - 44; y < fy; y++) { const d = Math.max(0, fy - 30 - y); const inset = Math.round(Math.sqrt(Math.max(0, 1 - (d / 14) ** 2)) * 0) ; R_(g, fx, y, fw, 1, (y % 5 === 0) ? "#3e2a20" : "#4e3426"); P_(g, fx, y, "#5e4030"); P_(g, fx + fw - 1, y, "#2e1e16"); }
    R_(g, fx - 3, fy - 46, fw + 6, 3, "#5e4030"); R_(g, fx - 3, fy - 46, fw + 6, 1, "#7a5640");
    R_(g, fx + 4, 0, fw - 8, fy - 46, "#2a1c16"); R_(g, fx + 4, 0, 2, fy - 46, "#3a2820"); R_(g, fx + fw - 6, 0, 2, fy - 46, "#1a100c");
    for (let y = fy - 30; y < fy - 2; y++) { const d = (fy - 30 + 10 - y) / 10; const hw = y < fy - 20 ? Math.round(10 * Math.sqrt(Math.max(0, 1 - d * d))) : 10; R_(g, fx + fw / 2 - hw, y, hw * 2, 1, "#0a0403"); }
    R_(g, fx + 2, fy - 3, fw - 4, 3, "#2a1a12");
    // braises au sol / charbon
    for (let i = 0; i < 14; i++) { const x = fx + fw + 2 + Math.floor(hash2(i, 4) * 14), y = fy + 2 + Math.floor(hash2(i, 5) * 5); R_(g, x, y, 2, 2, i % 3 ? "#141010" : "#262020"); }
    // râtelier d'armes
    const rx = cx + 22; R_(g, rx, fy - 40, 34, 3, PAL.wood[2]); R_(g, rx, fy - 40, 34, 1, PAL.wood[3]); R_(g, rx, fy - 6, 34, 3, PAL.wood[1]); R_(g, rx + 1, fy - 40, 2, 37, PAL.wood[1]); R_(g, rx + 31, fy - 40, 2, 37, PAL.wood[1]);
    rack.split(",").filter(Boolean).slice(0, 6).forEach((k, i) => { const [wk, tr] = k.split(":"); drawWeapon(g, wk, rx + 5 + i * 5, fy - 9, -90 * Math.PI / 180, WPN_MET[+tr || 0]); });
    // bannière au blason
    const bx = cx - 2, by = 12, bw = 22, bh = 34, cl = CLOTHS[look.cloth] || CLOTHS[0];
    R_(g, bx - 2, by - 2, bw + 4, 2, PAL.wood[2]);
    for (let y = 0; y < bh; y++) { const ww = y < bh - 6 ? bw : bw - Math.abs(y - (bh - 6)) * 0; for (let x = 0; x < bw; x++) { if (y >= bh - 6 && Math.abs(x - bw / 2 + .5) < (y - (bh - 6)) * 1.8) continue; P_(g, bx + x, by + y, x < 2 ? lt(cl, .15) : x > bw - 3 ? dk(cl, .35) : y % 9 === 0 ? dk(cl, .15) : cl); } }
    R_(g, bx, by + 1, bw, 1, "#c8a050");
    const cr = crestPix(look.crest); g.drawImage(cr, bx + 3, by + 6);
    // seau, tenailles
    R_(g, cx + 40, fy + 4, 9, 8, PAL.wood[1]); R_(g, cx + 40, fy + 4, 9, 1, METALS.acier[2]); R_(g, cx + 40, fy + 8, 9, 1, METALS.acier[1]); R_(g, cx + 41, fy + 5, 7, 1, "#1e3a4a");
  }, { outline: false, ax: 0, ay: 0 });
}
function fireFrame(g, x0, y0, w, t) {
  // flammes en pixels, dessinées en direct
  for (let i = 0; i < w; i++) { const hgt = 6 + Math.abs(Math.sin(i * .9 + t * 7)) * 8 + Math.sin(i * 2.3 - t * 11) * 3; for (let j = 0; j < hgt; j++) { const k = j / hgt; g.fillStyle = k < .3 ? PAL.ember[4] : k < .6 ? PAL.ember[3] : k < .85 ? PAL.ember[2] : PAL.ember[1]; g.fillRect(x0 + i, y0 - j, 1, 1); } }
}
