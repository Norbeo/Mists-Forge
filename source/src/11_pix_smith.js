/* ═══════════════════════ Pixel art : le forgeron et ses armes ═══════════════════════
   Sprite 40×40, pieds en (16, 38), tourné vers la droite. */
const ORE_GLOW = { fer: "#dfe6ec", argent: "#9fd8ff", ame: "#c49cff" };
const ARMOR_MET = [
  METALS.acier,
  METALS.acier,
  ["#3a4450", "#64748a", "#9aaec4", "#d0e0f0", "#f4fbff"],
  ["#140e1c", "#2a1e3a", "#463658", "#6e5a8a", "#a890c8"],
];
const WPN_MET = [METALS.acier, ["#3a4450", "#64748a", "#9aaec4", "#d6e8f8", "#ffffff"], ["#1e1238", "#3c2470", "#6e48c8", "#a888ff", "#ece2ff"]];
const FINISH = ["Naturel", "Bronze", "Noirci"];
function finishPal(p, f) { if (!f) return p; const o = f === 1 ? METALS.bronze : METALS.noirci; return p.map((c, i) => mixc(c, o[i], .55)); }
const HAIR_N = ["Rasé", "Court", "Long", "Tresse", "Crête"];
const BEARD_N = ["Aucune", "Courte", "Longue", "Tressée"];
const BODY_N = ["Robuste", "Fin"];

// arme : image locale (u le long du manche, v en travers) échantillonnée selon l'angle
function wpnPix(k, u, v, M) {
  const W = PAL.wood;
  switch (k) {
    case "grandmarteau":
      if (u >= 16 && u <= 23 && v >= -6 && v <= 7) return u === 23 ? M[4] : u === 16 ? M[0] : v <= -3 ? M[3] : v <= 3 ? M[2] : M[1];
      if (u >= -5 && u <= 15 && v >= 0 && v <= 1) return v ? PAL.wood[1] : PAL.wood[2];
      return null;
    case "pioche":
      if (u >= 9 && u <= 10 && Math.abs(v) <= 6) return Math.abs(v) >= 5 ? M[3] : u === 9 ? M[2] : M[1];
      if (u >= -2 && u <= 9 && v === 0) return PAL.wood[2];
      return null;
    case "marteau":
      if (u >= 9 && u <= 13 && v >= -3 && v <= 4) return u === 13 ? M[4] : u === 9 ? M[0] : v <= -2 ? M[3] : v <= 1 ? M[2] : M[1];
      if (u >= -3 && u <= 8 && (v === 0 || v === 1)) return v ? W[2] : W[3];
      return null;
    case "lance":
      if (u >= 17 && u <= 22) { const hw = u <= 19 ? 1 : 0; if (Math.abs(v) <= hw) return v < 0 ? M[3] : v > 0 ? M[1] : M[4]; return null; }
      if (u === 16 && Math.abs(v) <= 1) return M[1];
      if (u >= -4 && u <= 15 && v === 0) return u % 5 === 0 ? W[1] : W[3];
      return null;
    case "hache": {
      const ext = { 7: 2, 8: 4, 9: 5, 10: 5, 11: 5, 12: 4, 13: 2 }[u];
      if (ext && v >= 2 && v <= 1 + ext) return v === 1 + ext ? M[4] : v === 2 ? M[1] : M[2 + (u < 10 ? 1 : 0)];
      if ((u === 9 || u === 10) && (v === -1 || v === -2)) return M[1];
      if (u >= -3 && u <= 12 && (v === 0 || v === 1)) return v ? W[2] : W[3];
      return null;
    }
    case "arbalete":
      if ((u === 9 || u === 10) && Math.abs(v) <= 6) return Math.abs(v) >= 5 ? M[1] : u === 9 ? M[3] : M[2];
      if (u === 8 && Math.abs(v) >= 3 && Math.abs(v) <= 6) return "#d8d0c0";
      if (u >= 11 && u <= 12 && v === 0) return M[4];
      if (u >= -3 && u <= 8 && (v === 0 || v === 1)) return v ? W[1] : W[3];
      return null;
    case "faux":
      if (v <= -1 && v >= -10) { const uc = 17 - Math.floor(v * v / 16); if (u === uc) return M[2]; if (u === uc - 1) return M[4]; }
      if (u === 6 && v === 1) return W[2];
      if (u >= -4 && u <= 18 && v === 0) return u % 6 === 0 ? W[1] : W[3];
      return null;
    case "fleau": {
      const d = (u - 13) * (u - 13) + v * v;
      if (d <= 6) return v < 0 ? M[3] : v > 1 ? M[1] : M[2];
      if ((u === 13 && Math.abs(v) === 3) || (u === 16 && v === 0)) return M[4];
      if (u >= 7 && u <= 10 && v === 0) return u % 2 ? M[1] : M[3];
      if (u === 6 && Math.abs(v) <= 1) return M[1];
      if (u >= -3 && u <= 5 && (v === 0 || v === 1)) return v ? W[1] : W[2];
      return null;
    }
    case "espadon":
      if (u >= 3 && u <= 19 && Math.abs(v) <= 1) return v < 0 ? M[3] : v > 0 ? M[2] : (u % 3 === 0 ? PAL.soul[3] : M[4]);
      if (u === 20 && v === 0) return M[3];
      if (u === 2 && Math.abs(v) <= 3) return M[1];
      if (u >= -2 && u <= 1 && v === 0) return PAL.leather[2];
      if (u === -3 && v === 0) return M[3];
      return null;
  }
  return null;
}
function drawWeapon(g, k, hx, hy, ang, M) {
  const c = Math.cos(ang), s = Math.sin(ang);
  for (let wy = hy - 28; wy <= hy + 28; wy++) for (let wx = hx - 28; wx <= hx + 28; wx++) {
    const dx = wx - hx, dy = wy - hy, u = Math.round(dx * c + dy * s), v = Math.round(-dx * s + dy * c);
    const col = wpnPix(k, u, v, M); if (col) P_(g, wx, wy, col);
  }
}
const POSES = {
  idle: { hand: [24, 30], ang: -66, lean: 0 },
  strike: { hand: [27, 25], ang: 8, lean: 1 },
  hurt: { hand: [23, 31], ang: -100, lean: -1 },
  forge: { hand: [19, 15], ang: -140, lean: 0 },
  forge2: { hand: [26, 27], ang: 28, lean: 1 },
};
// L : apparence complète (smithLook)
function smithPix(L, pose = "idle") {
  const key = "smith|" + pose + "|" + JSON.stringify(L);
  return spr(key, 48, 40, (g) => {
    const Po = POSES[pose] || POSES.idle, lx = Po.lean;
    const sk = SKINS[L.skin] || SKINS[1], hc = HAIRS[L.hairCol] || HAIRS[1], hcd = dk(hc, .35);
    const cl = CLOTHS[L.cloth] || CLOTHS[0], cld = dk(cl, .35), cll = lt(cl, .18);
    const a = L.armor || 0, M = finishPal(ARMOR_MET[a], L.finish), LE = PAL.leather;
    const fin = L.body === 1, t0 = fin ? 12 : 11, t1 = fin ? 20 : 21;
    // cape
    if (L.cape) { const cc = CLOTHS[L.cape - 1], ccd = dk(cc, .4); for (let y = 21; y <= 35; y++) { const w = 3 + Math.floor((y - 21) / 4); R_(g, t0 - w + 2 + lx, y, w, 1, y % 4 === 0 ? ccd : cc); P_(g, t0 - w + 2 + lx, y, ccd); } }
    // jambes et bottes
    const legC = a >= 2 ? M[2] : a === 1 ? dk(PAL.leather[1], .2) : "#2a1e18", legD = a >= 2 ? M[1] : "#1a120e";
    R_(g, 13, 31, 3, 5, legD); R_(g, 17, 31, 3, 5, legC); P_(g, 17, 31, a >= 2 ? M[3] : legC);
    if (a >= 2) { P_(g, 18, 33, M[4]); }
    R_(g, 12, 35, 4, 3, LE[0]); R_(g, 17, 35, 4, 3, a >= 2 ? M[1] : LE[1]); P_(g, 20, 37, a >= 2 ? M[0] : LE[0]); R_(g, 17, 35, 4, 1, a >= 2 ? M[3] : LE[2]);
    // bras arrière
    const slv = a === 0 ? cld : a === 3 ? M[1] : M[1];
    R_(g, t0 - 1 + lx, 22, 2, 7, slv); R_(g, t0 - 1 + lx, 29, 2, 2, a >= 2 ? M[2] : sk[2]);
    // torse
    const tx = t0 + lx, tw = t1 - t0 + 1;
    if (a === 0) {
      R_(g, tx, 21, tw, 10, cl); R_(g, tx, 21, 2, 10, cll); R_(g, tx + tw - 2, 21, 2, 10, cld);
      R_(g, tx + 3, 23, tw - 3, 11, LE[2]); R_(g, tx + 3, 23, 1, 11, LE[3]); R_(g, tx + tw - 1, 23, 1, 11, LE[1]); R_(g, tx + 3, 22, tw - 4, 1, LE[1]);
      P_(g, tx + 5, 26, LE[1]); P_(g, tx + 7, 28, LE[1]);
    } else if (a === 1) {
      for (let y = 21; y < 31; y++) for (let x2 = 0; x2 < tw; x2++) P_(g, tx + x2, y, (x2 + y) % 2 ? M[2] : M[1]);
      R_(g, tx, 21, tw, 1, M[3]);
      R_(g, tx + 4, 23, 4, 8, cl); R_(g, tx + 4, 23, 1, 8, cll); R_(g, tx + 7, 23, 1, 8, cld); P_(g, tx + 5, 31, cl); P_(g, tx + 6, 31, cld);
    } else {
      R_(g, tx, 21, tw, 9, M[2]); R_(g, tx, 21, 3, 9, M[3]); R_(g, tx + tw - 2, 21, 2, 9, M[1]); P_(g, tx + 1, 22, M[4]); P_(g, tx + 2, 23, M[4]);
      R_(g, tx, 25, tw, 1, M[1]);
      R_(g, tx + 1, 30, tw - 1, 3, cl); R_(g, tx + 1, 30, tw - 1, 1, cld); P_(g, tx + 3, 32, cld); P_(g, tx + 6, 32, cld);
      if (a === 3) { const r = PAL.soul[3]; P_(g, tx + 5, 22, r); P_(g, tx + 5, 23, r); P_(g, tx + 4, 24, r); P_(g, tx + 6, 24, r); P_(g, tx + 5, 27, r); P_(g, tx + 5, 28, PAL.soul[2]); }
    }
    R_(g, tx, 29, tw, 1, LE[0]); P_(g, tx + 6, 29, "#c8a050");
    if (L.mw) { P_(g, tx + 1, 21, "#ffd27a"); P_(g, tx + tw - 1, 21, "#ffd27a"); }
    // tête
    const hx = 12 + lx, hy = 12;
    R_(g, hx, hy, 9, 9, sk[1]); R_(g, hx + 3, hy + 1, 6, 7, sk[0]); R_(g, hx, hy + 6, 9, 3, sk[1]); P_(g, hx + 9, hy + 4, sk[1]); P_(g, hx + 9, hy + 5, sk[2]);
    P_(g, hx + 3, hy + 4, sk[2]); P_(g, hx + 3, hy + 5, sk[2]);
    P_(g, hx + 7, hy + 4, "#140c0a"); P_(g, hx + 6, hy + 3, hcd); P_(g, hx + 7, hy + 3, hcd); P_(g, hx + 8, hy + 7, sk[2]);
    if (L.scar) { P_(g, hx + 6, hy + 2, "#8a3a2a"); P_(g, hx + 7, hy + 3, "#8a3a2a"); P_(g, hx + 8, hy + 5, "#8a3a2a"); P_(g, hx + 8, hy + 6, "#a04a38"); }
    const helm = L.helm && a >= 1;
    if (!helm || a <= 2) {
      const h = L.hair;
      if (h === 0) { R_(g, hx, hy, 8, 1, dk(sk[1], .25)); R_(g, hx, hy, 2, 3, dk(sk[1], .25)); }
      if (h >= 1 && h <= 3) { R_(g, hx, hy - 1, 9, 2, hc); R_(g, hx, hy, 3, 5, hc); P_(g, hx + 1, hy - 1, lt(hc, .2)); P_(g, hx + 3, hy - 1, lt(hc, .2)); R_(g, hx, hy + 1, 1, 4, hcd); }
      if (h === 2) { R_(g, hx - 1, hy + 2, 3, 9, hc); R_(g, hx - 1, hy + 2, 1, 9, hcd); }
      if (h === 3) { for (let i = 0; i < 9; i++) P_(g, hx - 1 + (i % 2), hy + 5 + i, i % 2 ? hc : hcd); P_(g, hx - 1, hy + 14, "#c8a050"); }
      if (h === 4) { R_(g, hx + 2, hy - 3, 5, 3, hc); R_(g, hx + 1, hy - 1, 7, 1, hcd); P_(g, hx + 3, hy - 3, lt(hc, .2)); R_(g, hx, hy + 1, 2, 4, dk(sk[1], .25)); }
    }
    const b = L.beard;
    if (b >= 1) { R_(g, hx + 4, hy + 6, 5, 3, hc); P_(g, hx + 6, hy + 6, sk[2]); P_(g, hx + 7, hy + 6, sk[2]); R_(g, hx + 4, hy + 8, 5, 1, hcd); }
    if (b >= 2) { R_(g, hx + 4, hy + 9, 5, 2, hc); R_(g, hx + 5, hy + 11, 3, 2, hc); P_(g, hx + 6, hy + 13, hcd); R_(g, hx + 4, hy + 9, 1, 2, hcd); }
    if (b === 3) { P_(g, hx + 6, hy + 14, "#c8a050"); P_(g, hx + 6, hy + 15, hc); }
    if (helm) {
      if (a === 1) { R_(g, hx - 1, hy - 1, 11, 2, M[2]); R_(g, hx + 1, hy - 3, 7, 2, M[3]); P_(g, hx + 2, hy - 3, M[4]); R_(g, hx - 2, hy + 1, 13, 1, M[1]); }
      else if (a === 2) {
        R_(g, hx - 1, hy - 2, 10, 4, M[2]); R_(g, hx, hy - 2, 3, 3, M[3]); P_(g, hx + 1, hy - 1, M[4]); R_(g, hx - 1, hy + 2, 3, 6, M[2]); R_(g, hx - 1, hy + 2, 1, 6, M[1]);
        R_(g, hx + 7, hy + 2, 1, 4, M[3]); R_(g, hx - 1, hy + 1, 10, 1, M[1]); P_(g, hx + 3, hy - 3, cl); P_(g, hx + 2, hy - 4, cl); P_(g, hx + 1, hy - 4, cld);
      }
      else {
        R_(g, hx - 1, hy - 2, 10, 9, M[2]); R_(g, hx, hy - 2, 3, 9, M[3]); P_(g, hx + 1, hy - 1, M[4]); R_(g, hx + 7, hy - 1, 2, 8, M[1]);
        R_(g, hx + 5, hy + 3, 4, 1, a === 3 ? PAL.soul[4] : "#0c0807"); R_(g, hx + 7, hy + 4, 1, 3, M[0]);
        R_(g, hx - 1, hy + 7, 10, 1, M[1]);
        P_(g, hx - 1, hy - 3, M[3]); P_(g, hx - 2, hy - 4, M[3]); P_(g, hx - 2, hy - 5, M[4]); P_(g, hx + 8, hy - 3, M[3]); P_(g, hx + 9, hy - 4, M[3]); P_(g, hx + 9, hy - 5, M[4]);
      }
    }
    // spalière
    if (a >= 2) { R_(g, 18 + lx, 20, 5, 3, M[3]); R_(g, 18 + lx, 22, 5, 1, M[1]); P_(g, 19 + lx, 20, M[4]); if (a === 3) { P_(g, 21 + lx, 19, M[3]); P_(g, 22 + lx, 18, M[4]); } }
    // bras avant + arme
    const [hx2, hy2] = Po.hand, sx = 19 + lx, sy = 22;
    const WM = WPN_MET[L.wt || 0];
    drawWeapon(g, L.wpn || "marteau", hx2 + lx, hy2, Po.ang * Math.PI / 180, WM);
    const armC = a === 0 ? sk[1] : a === 1 ? M[2] : M[2];
    L_(g, sx, sy, hx2 + lx, hy2, armC, 2);
    if (a === 0) { L_(g, sx, sy, Math.round((sx + hx2 + lx) / 2), Math.round((sy + hy2) / 2), cl, 2); }
    R_(g, hx2 + lx - 1, hy2 - 1, 2, 2, a >= 2 ? M[1] : a === 1 ? LE[1] : sk[0]);
 }, { ax: 16, ay: 38 });
}
// blason pixel (16×18)
const CHARGE_PIX = {
  marteau: [".#####.", ".#####.", "...#...", "...#...", "...#...", "...#...", "..###.."],
  enclume: ["#######", ".#####.", "..###..", "..###..", ".#####.", "#######", "......."],
  flamme: ["...#...", "..##...", "..###..", ".####.#", ".#####.", "#######", ".#####."],
  crane: [".#####.", "#######", "#.#.#.#", "#######", ".#####.", ".#.#.#.", "......."],
  loup: ["#.....#", "##...##", "#######", "#.###.#", "#######", ".#####.", "..###.."],
  corbeau: ["...##..", "..####.", "######.", ".#####.", "..####.", "...##..", "..#..#."],
  couronne: ["#..#..#", "#..#..#", "#######", "#######", "#.#.#.#", "#######", "......."],
  etoile: ["...#...", "...#...", "#######", ".#####.", "..###..", ".##.##.", "#.....#"],
};
function crestPix(cr) {
  cr = cr || { f: 0, c: 0 };
  return spr("crest|" + cr.f + "|" + cr.c, 16, 18, g => {
    const f = CREST_FIELDS[cr.f] || CREST_FIELDS[0], gold = "#d8b060";
    for (let y = 0; y < 18; y++) { const w = y < 11 ? 16 : Math.max(2, 16 - (y - 10) * 2.2 | 0); const x0 = (16 - w) / 2 | 0; R_(g, x0, y, w, 1, gold); }
    for (let y = 1; y < 17; y++) { const w = y < 11 ? 14 : Math.max(0, 14 - (y - 10) * 2.2 | 0); const x0 = (16 - w) / 2 | 0; if (w > 0) R_(g, x0, y, w, 1, y < 3 ? lt(f, .15) : f); }
    const P = CHARGE_PIX[CREST_CHARGES[cr.c]] || CHARGE_PIX.marteau;
    P.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "#") P_(g, 4 + x, 4 + y, cr.f === 4 ? "#2a1a10" : gold); }));
  }, { ax: 8, ay: 17 });
}
