/* ═══════════════════════ Armes, boucliers, tenues par classe et par palier ═══════════════════════ */
const RUNE_C = { 1: null, 2: null, 3: null, 4: "#ffd27a", 5: "#9fe8ff" };
// une arme : poignée à l'origine, la lame vers -y. a = direction (0 = vers le bas)
function drawWeapon(x, type, tier, hand, a, o = {}) {
  x.save(); x.translate(hand[0], hand[1]); x.rotate(Math.PI - a);
  const T = tier, gold = T >= 4, rune = o.rune || (T >= 5 ? (o.runeCol || "#9fe8ff") : null);
  const steel = T <= 1 ? MAT.iron : T >= 5 ? "#d8dee6" : MAT.steel, wood = T <= 2 ? MAT.wood : MAT.dwood, trim = gold ? MAT.gold : T >= 3 ? MAT.silver : MAT.iron;
  const mg = (c, x0, y0, x1, y1) => metalGrad(x, c, x0, y0, x1, y1);
  const handle = (len, w = 4.2, col = wood) => { shade(x, seg([0, 10], [0, -len], w, w), col, { d: 1.2 }); for (let i = 0; i < 3; i++) line(x, [[-2.2, 6 - i * 4], [2.2, 4 - i * 4]], .9, rgba(INK, .5)); };
  switch (type) {
    case "masse": {
      handle(T <= 1 ? 36 : 32, 4.5, T <= 1 ? MAT.wood : MAT.dleather);
      if (T <= 1) { shade(x, P([[-5, -30], [5, -30], [8, -52], [0, -58], [-8, -52]], true, .5), MAT.wood); for (let i = 0; i < 5; i++) dot(x, -4 + (i % 3) * 4, -38 - i * 3.5, 1.3, MAT.iron); break; }
      shade(x, seg([0, -30], [0, -34], 6, 6), trim, { d: 1 });
      if (T >= 4) { // étoile du matin / marteau
        if (T >= 5) { shade(x, P([[-13, -42, 1], [13, -42, 1], [14, -54, 1], [-14, -54, 1]], true), steel, { grad: mg(steel, -13, -54, 13, -42) }); shade(x, P([[-15, -41, 1], [15, -41, 1], [15, -44, 1], [-15, -44, 1]]), MAT.gold, { d: 1 }); line(x, [[-13, -52], [13, -52]], 1.6, MAT.gold); if (rune) rune && (glow(x, 0, -48, 16, rune, .5)); shade(x, circ(0, -48, 3.2), "#fff4c0", { ol: 1 }); }
        else { shade(x, circ(0, -45, 10), steel, { grad: mg(steel, -10, -55, 10, -35) }); for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; shade(x, P([[Math.cos(an) * 8 - Math.sin(an) * 2.5, -45 + Math.sin(an) * 8 + Math.cos(an) * 2.5], [Math.cos(an) * 16, -45 + Math.sin(an) * 16, 1], [Math.cos(an) * 8 + Math.sin(an) * 2.5, -45 + Math.sin(an) * 8 - Math.cos(an) * 2.5]], true), MAT.dsteel, { d: 1, ol: 1.2 }); } shade(x, circ(0, -45, 3), MAT.gold, { ol: 1 }); }
      } else { // masse à ailettes
        for (const s of [-1, 1]) shade(x, P([[0, -32], [s * 9, -36], [s * 10, -48], [0, -54]], true, .3), steel, { grad: mg(steel, -10, -54, 10, -32), d: 2 });
        shade(x, seg([0, -32], [0, -56], 6, 4), dk(steel, .15), { d: 1.2 });
        if (T >= 3) line(x, [[-8, -40], [8, -40]], 1.4, MAT.gold);
      }
      break;
    }
    case "espadon": {
      handle(20, 4.5, MAT.dleather);
      shade(x, circ(0, 13, 4), trim, { d: 1 });
      const L = 70 + T * 6;
      shade(x, P([[-14 - T, -20, 1], [14 + T, -20, 1], [15 + T, -24, 1], [-15 - T, -24, 1]], true), trim, { grad: mg(trim, -15, -24, 15, -20), d: 1.2 });
      const bl = T <= 1 ? [[-4, -24, 1], [4, -24, 1], [3.5, -L + 4], [1, -L, 1], [-3, -L + 6]] : [[-5, -24, 1], [5, -24, 1], [4.5, -L + 8], [0, -L - 4, 1], [-4.5, -L + 8]];
      shade(x, P(bl, true, .2), steel, { grad: lgrad(x, -5, 0, 5, 0, [[0, lt(steel, .45)], [.48, steel], [.52, dk(steel, .3)], [1, dk(steel, .5)]]), d: 1.5 });
      line(x, [[0, -26], [0, -L + 6]], 1, rgba(INK, .45));
      if (T <= 1) { for (let i = 0; i < 3; i++) line(x, [[3.5, -34 - i * 14], [1.5, -38 - i * 14]], 1.4, INK); }
      if (rune) { x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 4; i++) glow(x, 0, -36 - i * 12, 7, rune, .5); x.restore(); }
      if (T >= 4) { shade(x, circ(0, -22, 3), o.gem || "#7af0e0", { ol: 1 }); }
      break;
    }
    case "baton": {
      const top = -84 - T * 4;
      shade(x, seg([0, 40], [0, top + 8], 5, 4.4), T >= 3 ? MAT.dwood : MAT.wood, { d: 1.2 });
      if (T <= 1) { shade(x, circ(0, top + 6, 5.5), MAT.wood, { d: 1.5 }); break; }
      if (T === 2) { shade(x, P([[0, top + 10], [8, top + 2], [7, top - 10], [0, top - 14], [-3, top - 8], [3, top - 6], [3, top + 2]], true, .5), MAT.silver, { d: 1.5 }); break; }
      // soleil captif
      const c = [0, top - 6]; const sc = T >= 5 ? "#fff0b0" : "#ffd27a";
      x.save(); x.globalCompositeOperation = "lighter"; glow(x, c[0], c[1], 26 + T * 3, sc, .55); x.restore();
      shade(x, circ(c[0], c[1], 9), MAT.gold, { d: 2 });
      for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + (o.t || 0) * .5; shade(x, P([[c[0] + Math.cos(an) * 8, c[1] + Math.sin(an) * 8], [c[0] + Math.cos(an + .2) * (14 + T), c[1] + Math.sin(an + .2) * (14 + T), 1], [c[0] + Math.cos(an + .35) * 8, c[1] + Math.sin(an + .35) * 8]], true), MAT.gold, { ol: 1, d: .8 }); }
      shade(x, circ(c[0], c[1], 5), sc, { ol: 1, hi: .6 });
      break;
    }
    case "faucille": {
      handle(18, 4, MAT.wood);
      const st = T >= 4 ? "#b8c8d0" : steel;
      shade(x, P([[-2, -16], [2, -18], [14, -30], [18, -46], [12, -60], [2, -66, 1], [8, -56], [10, -44], [4, -30], [-2, -20]], true, .5), st, { grad: mg(st, -2, -66, 18, -16), d: 1.5 });
      if (T >= 3) { line(x, [[4, -24], [12, -44]], 1, rgba(lt(st, .6), .8), true); }
      if (T >= 4) { glow(x, 12, -46, 12, "#9fe0a0", .45); }
      if (T >= 5) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, 10, -44, 22, "#7ad08a", .5); x.restore(); }
      break;
    }
    case "hache": {
      handle(T >= 3 ? 56 : 48, 5, MAT.wood);
      const st = steel, top = T >= 3 ? -52 : -44;
      const blade = s => P([[0, top + 12], [s * 6, top + 10], [s * (16 + T * 2), top + 22], [s * (20 + T * 2), top + 4], [s * (17 + T * 2), top - 14], [s * 6, top - 2], [0, top - 2]], true, .4);
      shade(x, blade(1), st, { grad: mg(st, 0, top - 14, 22, top + 22), d: 2 });
      if (T >= 3) shade(x, blade(-1), st, { grad: mg(st, -22, top - 14, 0, top + 22), d: 2 });
      line(x, [[(18 + T * 2) * .95, top + 18], [(20 + T * 2) * .98, top - 10]], 1.4, rgba("#ffffff", .5), true);
      shade(x, seg([0, top + 14], [0, top - 6], 7.5, 7.5), dk(st, .2), { d: 1 });
      if (T >= 4) { line(x, [[-4, top + 6], [4, top + 6]], 2, MAT.gold); for (let i = 0; i < 2; i++) dot(x, 10 + i * 5, top + 4, 1.6, MAT.gold); }
      if (rune) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, 14, top + 4, 16, "#ff5a3a", .5); x.restore(); }
      if (T <= 1) { line(x, [[2, top + 10], [5, top]], 1.5, INK); }
      break;
    }
    case "dague": {
      shade(x, seg([0, 7], [0, -8], 3.6, 3.6), MAT.dleather, { d: 1 });
      shade(x, P([[-7, -8, 1], [7, -8, 1], [6, -11, 1], [-6, -11, 1]], true), trim, { d: .8, ol: 1.2 });
      const L = 22 + T * 2.5, st = T >= 4 ? "#c8d0d8" : steel;
      shade(x, P([[-2.8, -11, 1], [2.8, -11, 1], [2.2, -L + 6], [0, -L, 1], [-2.6, -L + 8]], true, .3), st, { grad: lgrad(x, -3, 0, 3, 0, [[0, lt(st, .4)], [.5, st], [1, dk(st, .45)]]), ol: 1.6, d: 1 });
      if (T >= 3) { shade(x, P([[-2, -L * .55], [4, -L * .45], [2, -L * .35]], true), st, { ol: 1, d: .5 }); }
      if (T >= 4) glow(x, 0, -L * .6, 9, o.runeCol || "#ff4a5a", .45);
      break;
    }
    case "arbalete": {
      // crosse dans l'axe, arc perpendiculaire en avant
      shade(x, P([[-3.5, 18], [3.5, 18], [4.5, -10], [3, -40], [-3, -40], [-4.5, -10]], true, .4), T >= 4 ? MAT.dwood : MAT.wood, { d: 1.5 });
      if (T >= 3) { line(x, [[0, 10], [0, -36]], 1.2, MAT.iron); }
      const bw = 22 + T * 3, by = -36;
      shade(x, P([[-bw, by + 8], [-bw * .5, by - 2], [0, by - 4], [bw * .5, by - 2], [bw, by + 8], [bw * .55, by + 1], [0, by - 0.5], [-bw * .55, by + 1]], true, .5), T >= 3 ? steel : MAT.dwood, T >= 3 ? { grad: mg(steel, -bw, by - 4, bw, by + 8), d: 1.5 } : { d: 1.5 });
      line(x, [[-bw + 1, by + 7.5], [0, by + 14], [bw - 1, by + 7.5]], 1, "#d8d0b8");
      shade(x, seg([0, by + 14], [0, by - 6], 2, 2), dk(MAT.wood, .2), { ol: 1, d: .5 });
      shade(x, P([[-2.2, by - 6, 1], [2.2, by - 6, 1], [0, by - 13, 1]], true), o.boltCol || steel, { ol: 1, d: .5 });
      if (T >= 4) { line(x, [[-bw * .6, by + 2], [bw * .6, by + 2]], 1.4, MAT.gold); }
      if (T >= 5 || o.flame) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, by - 10, 12, o.flame || "#9fe8ff", .7); x.restore(); }
      // cric
      if (T >= 3) shade(x, circ(0, 2, 4), MAT.iron, { ol: 1.2, d: 1 });
      break;
    }
    case "faux": {
      const top = -92 - T * 3;
      shade(x, seg([0, 30], [0, top + 2], 4.8, 4.2), T >= 3 ? "#2a2420" : MAT.dwood, { d: 1.2 });
      shade(x, seg([0, -28], [7, -34], 3.5, 3.5), MAT.dwood, { d: .8 });
      const bc = T >= 4 ? "#a8b8b0" : T >= 3 ? MAT.steel : MAT.iron;
      shade(x, P([[0, top + 6], [-2, top - 2], [-20, top - 6], [-44 - T * 3, top + 6], [-62 - T * 4, top + 26, 1], [-40, top + 8], [-20, top + 4], [0, top + 10]], true, .45), bc, { grad: mg(bc, -60, top - 6, 0, top + 26), d: 1.8 });
      if (T >= 3) { shade(x, skullPath(0, top - 2, 5.2), MAT.bone, { d: 1.2 }); dot(x, -1.6, top - 3, 1.2, INK); dot(x, 2, top - 3, 1.2, INK); }
      if (T >= 4) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, -30, top + 4, 20, "#6ad0a0", .4); glow(x, 0, top - 2, 10, "#6ad0a0", .6); x.restore(); }
      break;
    }
    case "grimoire": {
      // livre ouvert tenu à plat
      x.rotate(-Math.PI / 2 + .3);
      const c = T >= 4 ? "#5a1a10" : "#4a2a1a";
      shade(x, P([[-14, -4, 1], [0, -1, 1], [14, -4, 1], [14, 6, 1], [0, 9, 1], [-14, 6, 1]], true), c, { d: 1.5 });
      shade(x, P([[-12, -5, 1], [-1, -2.5, 1], [-1, 6, 1], [-12, 4, 1]], true), "#e8dcc0", { ol: 1, d: .8 });
      shade(x, P([[12, -5, 1], [1, -2.5, 1], [1, 6, 1], [12, 4, 1]], true), "#d8ccb0", { ol: 1, d: .8 });
      for (let i = 0; i < 3; i++) { line(x, [[-10, -2 + i * 2.5], [-3, -.5 + i * 2.5]], .7, rgba(INK, .5)); line(x, [[3, -.5 + i * 2.5], [10, -2 + i * 2.5]], .7, rgba(INK, .5)); }
      if (T >= 3) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, -6, 16, "#ff8a3a", .55); x.restore(); }
      if (T >= 4) line(x, [[-14, 6], [0, 9], [14, 6]], 1.6, MAT.gold);
      break;
    }
    default: if (MON_WPN[type]) MON_WPN[type](x, T, o); break;
    case "orbe": {
      const fc = o.fire || "#ff7a2a";
      x.save(); x.globalCompositeOperation = "lighter";
      const fl = (o.t || 0) * 8;
      for (let i = 0; i < 5; i++) glow(x, Math.sin(fl + i) * 2, -10 - i * 2.5 - Math.abs(Math.sin(fl * .7 + i)) * 3, 9 - i + T, i < 2 ? "#ffe08a" : fc, .6);
      glow(x, 0, -10, 20 + T * 3, fc, .35);
      x.restore();
      break;
    }
    case "luth": {
      x.rotate(-1.15);
      shade(x, seg([0, -6], [0, -44], 5, 4), MAT.dwood, { d: 1 });
      shade(x, P([[-3, -44], [3, -44], [6, -54, 1], [-2, -56, 1]], true), MAT.dwood, { d: 1 });
      const bc = T >= 4 ? "#3a1a2a" : T >= 3 ? "#5a2a1a" : MAT.wood;
      shade(x, ell(0, 6, 13, 16), bc, { grad: lgrad(x, -13, -10, 13, 22, [[0, lt(bc, .25)], [1, dk(bc, .4)]]), d: 3 });
      shade(x, circ(0, 2, 4), INK, { ol: 0, flat: true });
      if (T >= 3) { x.strokeStyle = MAT.gold; x.lineWidth = 1.2; x.beginPath(); x.arc(0, 2, 5.5, 0, Math.PI * 2); x.stroke(); }
      for (let i = -1; i <= 1; i++) line(x, [[i * 1.3, 14], [i * 1, -48]], .6, "#e8dcc0");
      if (T >= 4) for (let i = 0; i < 6; i++) dot(x, Math.cos(i) * 11, 6 + Math.sin(i) * 13, 1, MAT.gold);
      if (T >= 5) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, 4, 24, "#c9a0ff", .45); x.restore(); }
      break;
    }
  }
  x.restore();
}
function drawShield(x, kind, tier, hand, a, o = {}) {
  x.save(); x.translate(hand[0] + 2, hand[1] - 2); x.rotate(a);
  const T = tier;
  if (kind === "round" || T <= 1) {
    shade(x, circ(0, 0, 19), MAT.wood, { grad: lgrad(x, -19, -19, 19, 19, [[0, lt(MAT.wood, .2)], [1, dk(MAT.wood, .4)]]), d: 4 });
    for (let i = -2; i <= 2; i++) line(x, [[i * 7, -18 + Math.abs(i) * 2], [i * 7, 18 - Math.abs(i) * 2]], 1, rgba(INK, .45));
    x.strokeStyle = MAT.iron; x.lineWidth = 3; x.beginPath(); x.arc(0, 0, 17.5, 0, Math.PI * 2); x.stroke();
    shade(x, circ(0, 0, 5.5), MAT.iron, { d: 1.5 });
  } else {
    const p = P([[-18, -24, 1], [18, -24, 1], [18, 0], [10, 18], [0, 28, 1], [-10, 18], [-18, 0]], true, .45);
    const face = T >= 5 ? "#e8e4d8" : T >= 3 ? MAT.steel : o.col || "#6b1f1f";
    shade(x, p, face, { grad: T >= 3 ? metalGrad(x, face, -18, -24, 18, 28) : null, d: 4.5 });
    x.save(); x.clip(p);
    if (T === 2 || T === 4) { x.fillStyle = o.col || "#6b1f1f"; x.fill(P([[-14, -20, 1], [14, -20, 1], [14, 0], [8, 14], [0, 22, 1], [-8, 14], [-14, 0]], true, .45)); }
    const cc = T >= 4 ? MAT.gold : T >= 3 ? (o.col || "#8a1a1a") : "#e8e0c8";
    shade(x, poly([[-3, -17], [3, -17], [3, -5], [12, -5], [12, 1], [3, 1], [3, 20], [-3, 20], [-3, 1], [-12, 1], [-12, -5], [-3, -5]]), cc, { ol: 1.2, d: 1.5 });
    x.restore();
    x.strokeStyle = T >= 4 ? MAT.gold : MAT.iron; x.lineWidth = 2.6; x.stroke(p); x.lineWidth = ART.ol; x.strokeStyle = INK; x.stroke(p);
    if (T >= 5) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, -2, 30, "#ffe8a0", .45); x.restore(); }
  }
  x.restore();
}

// ── tenues : pour chaque classe, l'apparence complète selon le palier d'armure (1 à 5) ──
function outfit(L) {
  const T = clamp(L.tier || 1, 1, 5), W = clamp(L.wtier || T, 1, 5), C = CLASSES[L.cls] || CLASSES.templier, pal = C.pal;
  const sp = { skin: L.skin || "#e0b48c", hair: L.hair == null ? 1 : L.hair, hairCol: L.hairCol || "#3a2414", beard: L.beard == null ? -1 : L.beard, scar: L.scar == null ? -1 : L.scar,
    torso: { mat: "cloth", col: pal.cloth }, legs: { col: "#3a3028" }, boots: { col: MAT.leather }, arms: {}, headgear: {}, wpn: C.wpn, wt: W, tier: T, cls: L.cls, evo: L.evo, aura: null, bulk: 1 };
  const ev = L.evo, gold = T >= 4;
  const ac = ev ? EVO_ACCENT[ev] : null;
  switch (L.cls) {
    case "forgeron": {
      // le forgeron : son armure suit ce qu'il forge (cuir → fer → argent → âme)
      sp.bulk = 1.12; sp.wpn = L.wpn || "marteau"; sp.wt = W;
      const ember = "#ff7a2a", soul = "#b48cff";
      if (T === 1) { sp.torso = { mat: "cloth", col: "#6a5a48" }; sp.skirt = { type: "tabard", col: "#5a3a22", len: .62, w: 1.9 }; sp.arms = { col: "#6a5a48", bareFore: 1, bracer: MAT.leather }; sp.legs = { col: "#3a3028", type: "wrap" }; sp.boots = { col: MAT.dleather, high: 1 }; sp.belt = { col: MAT.dleather, pouch: MAT.leather }; sp.headgear = { type: "bandana", col: "#4a2a1a" }; }
      if (T === 2) { sp.torso = { mat: "chain", col: MAT.iron }; sp.skirt = { type: "tabard", col: "#4a3020", len: .62, w: 1.9 }; sp.arms = { col: MAT.iron, chain: 1, bracer: MAT.leather, glove: MAT.dleather }; sp.legs = { col: "#3a3028", type: "greave", metal: MAT.iron }; sp.boots = { col: MAT.dleather, high: 1 }; sp.belt = { col: MAT.dleather, buckle: MAT.iron, pouch: MAT.leather }; sp.shoulders = { type: "pad", col: "#5a4430" }; sp.headgear = { type: "cap", col: "#3a2a1a" }; }
      if (T === 3) { const m = "#9aa2aa"; sp.torso = { mat: "plate", col: m }; sp.skirt = { type: "tabard", col: "#3a2418", len: .6, w: 1.7 }; sp.arms = { col: MAT.iron, chain: 1, rerebrace: m, bracer: m, bracerMetal: 1, glove: MAT.dleather }; sp.legs = { col: MAT.iron, type: "plate", metal: m }; sp.boots = { type: "sabaton", metal: m }; sp.shoulders = { type: "plate", col: m }; sp.belt = { col: MAT.dleather, buckle: MAT.silver }; sp.headgear = { type: "nasal", col: m }; }
      if (T === 4) { const m = "#3a3438"; sp.torso = { mat: "plate", col: m, trim: ember }; sp.skirt = { type: "tassets", col: m, trim: ember }; sp.arms = { col: MAT.black, rerebrace: m, bracer: m, bracerMetal: 1, glove: m, gloveMetal: 1 }; sp.legs = { col: MAT.black, type: "plate", metal: m }; sp.boots = { type: "sabaton", metal: m }; sp.shoulders = { type: "ornate", col: m, trim: ember }; sp.belt = { col: MAT.dleather, buckle: ember }; sp.headgear = { type: "sallet", col: m, visor: 1, trim: ember }; sp.cape = { col: "#3a1008", len: .8, tatter: 1 }; sp.eyeGlow = ember; }
      if (T >= 5) { const m = "#241e2e"; sp.torso = { mat: "plate", col: m, trim: soul, rune: soul }; sp.skirt = { type: "tassets", col: m, trim: soul }; sp.arms = { col: MAT.black, rerebrace: m, bracer: m, bracerMetal: 1, glove: m, gloveMetal: 1, gold: 1 }; sp.legs = { col: MAT.black, type: "plate", metal: m, gold: 1 }; sp.boots = { type: "sabaton", metal: m }; sp.shoulders = { type: "ornate", col: m, trim: soul, gem: soul, size: 1.15 }; sp.belt = { col: MAT.dleather, buckle: soul }; sp.headgear = { type: "sallet", col: m, visor: 1, trim: soul }; sp.cape = { col: "#1e1430", len: .9, trim: soul }; sp.eyeGlow = soul; sp.aura = soul; }
      break;
    }
    case "templier": {
      sp.bulk = 1.08 + T * .02; sp.shield = 1;
      const red = ac || pal.cloth;
      if (T === 1) { sp.torso = { mat: "gambeson", col: "#9a8466" }; sp.skirt = { type: "tabard", col: red, len: .42 }; sp.legs = { col: "#4a3a2a", type: "wrap" }; sp.boots = { col: MAT.leather }; sp.arms = { col: "#9a8466" }; sp.belt = { col: MAT.dleather }; sp.headgear = { type: "coif", col: "#8a7456" }; }
      if (T === 2) { sp.torso = { mat: "chain", col: MAT.iron }; sp.skirt = { type: "tabard", col: red, len: .5, cross: "#e8e0c8" }; sp.arms = { col: MAT.iron, chain: 1, glove: MAT.leather }; sp.legs = { col: MAT.iron, type: "greave", metal: MAT.iron }; sp.boots = { col: MAT.leather }; sp.belt = { col: MAT.dleather }; sp.shoulders = { type: "pad", col: "#7a6a52" }; sp.headgear = { type: "coif", col: MAT.iron, chain: 1 }; }
      if (T >= 3) {
        const m = T >= 5 ? "#e4e0d4" : T >= 4 ? "#b8c0c8" : MAT.steel;
        sp.torso = { mat: "plate", col: m, trim: gold ? MAT.gold : null }; sp.skirt = { type: "tabard", col: T >= 5 ? "#f0ead8" : red, len: .58, cross: T >= 5 ? MAT.gold : "#e8e0c8", trim: gold ? MAT.gold : null };
        sp.arms = { col: MAT.iron, chain: 1, rerebrace: m, bracer: m, bracerMetal: 1, glove: m, gloveMetal: 1, gold }; sp.legs = { col: MAT.iron, type: "plate", metal: m, gold }; sp.boots = { type: "sabaton", metal: m };
        sp.shoulders = { type: T >= 4 ? "ornate" : "plate", col: m, trim: gold ? MAT.gold : null, size: 1 + T * .04 }; sp.belt = { col: MAT.dleather, buckle: gold ? MAT.gold : MAT.brass };
        sp.headgear = { type: T >= 4 ? "crusader" : "greathelm", col: m, trim: gold ? MAT.gold : null, crest: T >= 4 ? (T >= 5 ? "#f0e8d0" : red) : null, crown: T >= 5 ? MAT.gold : null, gem: T >= 5 ? "#9fe8ff" : null };
        if (T >= 4) sp.cape = { col: T >= 5 ? "#f0ead8" : red, len: .85, trim: MAT.gold };
        if (T >= 5) { sp.halo = "#ffe8a0"; sp.aura = "#ffe8a0"; }
      }
      if (ev === "inquisiteur" && T >= 3) { sp.cape = sp.cape || { col: "#2a1a1a", len: .8 }; sp.cape.col = "#3a1410"; sp.torso.sun = null; sp.flames = "#ff7a2a"; }
      break;
    }
    case "revenant": {
      sp.bulk = 1.1; sp.skin = mixc(L.skin || "#c8b8a8", "#8a9aa0", .55); sp.undead = 1; sp.eyeGlow = ev === "seigneur_sang" ? "#ff3a3a" : "#7af0e0"; sp.hairCol = "#d8d8d0";
      const m = T >= 5 ? "#3a3e48" : T >= 4 ? "#4a4e56" : MAT.dsteel;
      if (T === 1) { sp.torso = { mat: "chain", col: "#5a5a58" }; sp.skirt = { type: "kilt", col: "#3a3a36", len: .4 }; sp.legs = { col: "#3a3632", type: "wrap" }; sp.boots = { col: MAT.dleather }; sp.arms = { col: "#5a5a58", chain: 1 }; sp.headgear = { type: "hood", col: "#3a3a3a" }; sp.cape = { col: "#2a2a2a", len: .55, tatter: 1 }; }
      if (T === 2) { sp.torso = { mat: "chain", col: MAT.iron }; sp.skirt = { type: "tabard", col: "#2a2f3a", len: .55 }; sp.arms = { col: MAT.iron, chain: 1, bracer: MAT.dsteel, bracerMetal: 1 }; sp.legs = { col: MAT.iron, type: "greave", metal: MAT.dsteel }; sp.boots = { col: MAT.dleather }; sp.shoulders = { type: "plate", col: MAT.dsteel }; sp.headgear = { type: "kettle", col: MAT.dsteel }; sp.cape = { col: "#22262e", len: .7, tatter: 1 }; }
      if (T >= 3) { sp.torso = { mat: "plate", col: m, trim: gold ? "#7fb0c0" : null }; sp.skirt = { type: "tassets", col: m, trim: gold ? "#7fb0c0" : null }; sp.arms = { col: MAT.black, rerebrace: m, bracer: m, bracerMetal: 1, glove: m, gloveMetal: 1 }; sp.legs = { col: MAT.black, type: "plate", metal: m }; sp.boots = { type: "sabaton", metal: m }; sp.shoulders = { type: T >= 4 ? "ornate" : "plate", col: m, spike: T >= 4, trim: gold ? "#5a8a9a" : null, gem: T >= 5 ? sp.eyeGlow : null, size: 1.12 }; sp.headgear = { type: "skullhelm", col: m, spikes: T >= 4, flame: T >= 5 ? sp.eyeGlow : null }; sp.cape = { col: "#1a1e26", len: .9, tatter: 1, trim: T >= 5 ? "#3a5a6a" : null }; if (T >= 5) sp.aura = sp.eyeGlow; }
      break;
    }
    case "pretresse": {
      sp.bulk = .92; sp.beard = -1;
      const white = T >= 5 ? "#f4f0e4" : T >= 3 ? "#e8e2d0" : T === 2 ? "#d8d0bc" : "#a8a090";
      sp.torso = { mat: "cloth", col: white, collar: T >= 3 ? MAT.gold : null, sun: T >= 3 ? "#ffd27a" : null };
      sp.skirt = { type: "robe", col: white, len: .97, trim: T >= 2 ? (gold ? MAT.gold : "#b0904a") : null };
      sp.arms = { col: white, bell: T >= 2 }; sp.legs = { col: white }; sp.boots = { col: "#6a5a4a" }; sp.belt = { col: T >= 3 ? MAT.gold : MAT.rope, buckle: MAT.gold };
      sp.headgear = T === 1 ? { type: "hood_down", col: white } : T === 2 ? { type: "hood", col: white, trim: "#b0904a" } : T === 3 ? { type: "circlet", col: MAT.gold, gem: "#ffd27a" } : { type: "mitre", col: white, trim: MAT.gold, gem: T >= 5 ? "#9fe8ff" : "#ffd27a" };
      if (T >= 3) sp.mantle = { col: T >= 4 ? "#c8a050" : "#d8ccb0", trim: MAT.gold };
      if (T >= 4) sp.cape = { col: "#e8e0cc", len: .95, trim: MAT.gold };
      if (T >= 5) { sp.halo = "#ffe8a0"; sp.aura = "#ffe8a0"; }
      if (ev === "martyre") { sp.skirt.trim = "#a02a2a"; if (sp.mantle) sp.mantle.col = "#7a1a1a"; }
      break;
    }
    case "sorciere": {
      sp.bulk = .93; sp.beard = -1;
      const g = ev === "sorciere_noire" ? "#2a2a24" : "#3a4a2a";
      sp.torso = { mat: T >= 2 ? "leather" : "cloth", col: T >= 2 ? "#4a3a28" : "#5a5040", buckle: T >= 3 ? MAT.brass : null, vials: T >= 3 ? ["#7ad04a", "#c04ac0", "#4ac0d0"].slice(0, T - 1) : null };
      sp.skirt = { type: "robe", col: T >= 2 ? g : "#4a4434", len: T >= 3 ? .92 : .75 };
      sp.arms = { col: T >= 2 ? g : "#5a5040", bracer: T >= 3 ? MAT.leather : null }; sp.legs = { col: "#3a3028", type: "wrap" }; sp.boots = { col: MAT.dleather, high: 1 };
      sp.belt = { col: MAT.dleather, pouch: MAT.leather };
      sp.mantle = T >= 2 ? { col: T >= 4 ? "#2e3a22" : "#3a4430", fur: T >= 4 } : null;
      sp.headgear = T === 1 ? { type: "bandana", col: "#6a5a3a" } : T === 2 ? { type: "hood", col: g } : T === 3 ? { type: "witch", col: g, band: "#7a5a2a", charms: ["#7ad04a", MAT.bone, "#c04ac0"] } : T === 4 ? { type: "witch", col: dk(g, .2), band: MAT.gold, charms: ["#7ad04a", MAT.bone, "#c04ac0"] } : { type: "flowers", col: ev === "sorciere_noire" ? "#6a2a6a" : "#7ad04a", col2: "#c04a6a", glow: ev === "sorciere_noire" ? "#b04ac0" : "#7ad04a" };
      if (T >= 4) sp.cape = { col: dk(g, .1), len: .9, tatter: 1 };
      if (T >= 5) sp.aura = ev === "sorciere_noire" ? "#b04ac0" : "#7ad04a";
      break;
    }
    case "menestrel": {
      sp.bulk = .96;
      const pur = ev === "chantre" ? "#2a1a2a" : T >= 4 ? "#5a2a5a" : "#4a2a4a";
      sp.torso = { mat: T >= 3 ? "brig" : "cloth", col: T === 1 ? "#6a5a4a" : pur, stud: gold ? MAT.gold : MAT.brass, collar: T >= 3 ? (gold ? MAT.gold : "#c0a060") : null };
      sp.skirt = { type: "coat", col: T === 1 ? "#5a4a3a" : dk(pur, .1), len: T >= 3 ? .55 : .35, trim: T >= 3 ? (gold ? MAT.gold : "#c0a060") : null };
      sp.arms = { col: T >= 2 ? "#c0a060" : "#6a5a4a", foreCol: pur, bell: T >= 2 }; sp.legs = { col: T >= 3 ? "#2a1a2a" : "#4a3a2a" }; sp.boots = { col: MAT.dleather, high: T >= 2, cuff: T >= 3 ? "#8a6a3a" : null };
      sp.belt = { col: MAT.dleather, buckle: gold ? MAT.gold : MAT.brass };
      sp.headgear = T === 1 ? { type: "cap", col: "#6a3a2a" } : { type: "hat", col: T >= 4 ? "#1e1420" : pur, band: gold ? MAT.gold : "#c0a060", plume: T >= 2 ? (T >= 4 ? "#e8e0d0" : "#a02a2a") : null, mask: T >= 4 ? (ev === "chantre" ? "#e8e0d0" : MAT.gold) : null };
      if (T >= 3) sp.cape = { col: T >= 4 ? "#2a1420" : "#3a2030", len: T >= 4 ? .8 : .55, trim: gold ? MAT.gold : null };
      if (T >= 5) sp.aura = "#c9a0ff";
      break;
    }
    case "berserker": {
      sp.bulk = 1.12; sp.paint = T >= 3 ? (ev === "ecorcheur" ? "#8a1a1a" : "#2a4a8a") : null;
      const fur = T >= 4 ? "#4a3a2e" : "#6a5444";
      if (T === 1) { sp.torso = { mat: "bare", straps: [[[-12, -58], [12, -26]]] }; sp.skirt = { type: "fur", col: fur, len: .35 }; sp.legs = { col: "#4a3a2a", type: "wrap" }; sp.boots = { col: "#5a4434", cuff: fur }; sp.arms = { bare: 1, bareFore: 1, bracer: MAT.leather }; sp.belt = { col: MAT.dleather }; sp.headgear = {}; }
      if (T === 2) { sp.torso = { mat: "bare", straps: [[[-12, -58], [12, -26]], [[12, -58], [-12, -26]]] }; sp.mantle = { col: fur, fur: 1 }; sp.skirt = { type: "fur", col: fur, len: .38 }; sp.legs = { col: "#4a3a2a", type: "wrap" }; sp.boots = { col: "#5a4434", cuff: fur, high: 1 }; sp.arms = { bare: 1, bareFore: 1, bracer: MAT.leather }; sp.belt = { col: MAT.dleather, buckle: MAT.iron }; sp.headgear = {}; }
      if (T >= 3) { sp.torso = { mat: T >= 4 ? "brig" : "leather", col: T >= 4 ? "#5a4a3a" : "#5a3a22", stud: T >= 4 ? MAT.iron : null }; sp.mantle = { col: fur, fur: 1 }; sp.skirt = { type: "kilt", col: "#3a2a1e", len: .42 }; sp.legs = { col: "#3a2e22", type: T >= 4 ? "greave" : "wrap", metal: MAT.iron }; sp.boots = { col: "#4a3424", cuff: fur, high: 1 }; sp.arms = { bare: 1, bareFore: 0, foreCol: MAT.leather, bracer: T >= 4 ? MAT.iron : MAT.leather, bracerMetal: T >= 4 }; sp.shoulders = { type: "fur", col: fur, size: 1.2 }; sp.belt = { col: MAT.dleather, buckle: gold ? MAT.gold : MAT.iron }; sp.headgear = T >= 4 ? { type: "bearhood", col: fur, } : { type: "nasal", col: MAT.iron }; if (T >= 5) { sp.aura = ev === "ecorcheur" ? "#ff3a2a" : "#ff8a3a"; sp.eyeGlow = "#ff5a2a"; } }
      if (L.hair < 3 && T <= 2) sp.hair = 4;
      break;
    }
    case "ombre": {
      sp.bulk = .92; sp.dual = 1;
      const bl = "#1f1f26", cr = ev === "ombre_sang" ? "#a01a2a" : "#8a2a3a";
      sp.torso = { mat: "leather", col: T === 1 ? "#3a3430" : bl, buckle: T >= 3 ? MAT.silver : null, straps: T >= 2 ? [[[-12, -46], [12, -40]]] : null };
      sp.skirt = { type: "coat", col: dk(bl, .1), len: T >= 3 ? .45 : .3, trim: T >= 3 ? cr : null };
      sp.arms = { col: bl, bracer: T >= 2 ? (T >= 4 ? MAT.silver : MAT.leather) : null, bracerMetal: T >= 4, glove: "#1a1a1e" }; sp.legs = { col: "#24242a", type: "wrap" }; sp.boots = { col: "#1a1a1e", high: 1 };
      sp.belt = { col: cr, buckle: MAT.silver };
      sp.headgear = { type: T >= 2 ? "cowl" : "hood", col: T >= 4 ? "#141418" : "#2a2a30", mask: T >= 3 ? cr : "#2a2a30", trim: T >= 4 ? cr : null };
      if (T >= 3) sp.mantle = { col: "#18181e" };
      if (T >= 4) sp.cape = { col: "#141418", len: .7, tatter: 1, trim: T >= 5 ? cr : null };
      if (T >= 4) sp.eyeGlow = cr;
      if (T >= 5) sp.aura = cr;
      break;
    }
    case "arbaletriere": {
      sp.bulk = .97;
      const bl = T >= 4 ? "#2a3a5a" : "#3a4a5a";
      const m = T >= 5 ? "#d8dce4" : T >= 4 ? "#b0b8c0" : MAT.steel;
      if (T === 1) { sp.torso = { mat: "gambeson", col: "#8a7a5a" }; sp.skirt = { type: "coat", col: "#6a5a42", len: .35 }; sp.arms = { col: "#8a7a5a" }; sp.legs = { col: "#3a3a3a" }; sp.boots = { col: MAT.leather, high: 1 }; sp.headgear = { type: "cap", col: "#5a4a3a" }; }
      if (T === 2) { sp.torso = { mat: "brig", col: bl, stud: MAT.brass }; sp.skirt = { type: "coat", col: bl, len: .4 }; sp.arms = { col: "#7a6a52", bracer: MAT.leather }; sp.legs = { col: "#3a3a3a" }; sp.boots = { col: MAT.leather, high: 1 }; sp.headgear = { type: "kettle", col: MAT.iron }; sp.shoulders = { type: "pad", col: "#6a5a42" }; }
      if (T >= 3) { sp.torso = { mat: "plate", col: m, trim: gold ? MAT.gold : null }; sp.skirt = { type: "tabard", col: bl, len: .5, trim: gold ? MAT.gold : null }; sp.arms = { col: bl, rerebrace: m, bracer: m, bracerMetal: 1, glove: MAT.leather }; sp.legs = { col: "#2a2a30", type: "greave", metal: m, gold }; sp.boots = { col: MAT.dleather, high: 1 }; sp.shoulders = { type: "plate", col: m, trim: gold ? MAT.gold : null }; sp.headgear = { type: "sallet", col: m, visor: T >= 4, trim: gold ? MAT.gold : null, plume: T >= 4 ? (T >= 5 ? "#e8e0d0" : "#3a5a8a") : null }; if (T >= 4) sp.cape = { col: bl, len: .7, trim: gold ? MAT.gold : null }; if (T >= 5) sp.aura = "#9fe8ff"; }
      sp.belt = { col: MAT.dleather, buckle: MAT.brass, pouch: MAT.leather }; sp.quiver = 1;
      if (ev === "chasseresse") { sp.mantle = { col: "#5a4a34", fur: 1 }; }
      break;
    }
    case "pyromancien": {
      sp.bulk = .95; sp.offhand = "orbe";
      const red = ev === "demoniste" ? "#3a0a14" : T >= 4 ? "#6a1a10" : "#5a1a10";
      sp.torso = { mat: "cloth", col: T === 1 ? "#6a4a3a" : red, collar: T >= 3 ? (gold ? MAT.gold : "#e08a30") : null, rune: T >= 4 ? "#ff8a3a" : null };
      sp.skirt = { type: "robe", col: T === 1 ? "#5a3a2a" : dk(red, .1), len: .95, trim: T >= 2 ? (gold ? MAT.gold : "#e08a30") : null };
      sp.arms = { col: T === 1 ? "#6a4a3a" : red, bell: 1 }; sp.legs = { col: "#2a1a14" }; sp.boots = { col: MAT.dleather }; sp.belt = { col: MAT.dleather, buckle: MAT.brass, pouch: MAT.leather };
      sp.headgear = T <= 1 ? { type: "hood_down", col: "#6a4a3a" } : T <= 3 ? { type: "hood", col: red, trim: T >= 3 ? "#e08a30" : null } : T === 4 ? { type: "hood", col: "#2a0a08", trim: MAT.gold } : { type: "flamecrown" };
      if (T >= 3) sp.mantle = { col: T >= 4 ? "#2a1410" : "#3a1a10", trim: gold ? MAT.gold : null };
      if (T >= 4) sp.cape = { col: "#2a0e0a", len: .9, tatter: T >= 5 ? 0 : 1, trim: gold ? "#e08a30" : null };
      sp.eyeGlow = T >= 4 ? "#ffb04a" : null; if (T >= 5) sp.aura = "#ff7a2a";
      sp.fire = ev === "demoniste" ? "#b04aff" : "#ff7a2a";
      break;
    }
    case "necromancien": {
      sp.bulk = .95; sp.skin = mixc(L.skin || "#c8b8a8", "#b0b8a8", .4);
      const g = T >= 4 ? "#141c18" : "#1e2a24";
      sp.torso = { mat: "cloth", col: T === 1 ? "#4a4a44" : g, bones: T >= 2, collar: T >= 3 ? MAT.bone : null };
      sp.skirt = { type: "robe", col: T === 1 ? "#3a3a36" : dk(g, .1), len: .97, trim: T >= 3 ? "#6ad0a0" : null };
      sp.arms = { col: T === 1 ? "#4a4a44" : g, bell: 1 }; sp.legs = { col: "#1a1a18" }; sp.boots = { col: "#1a1a18" }; sp.belt = { col: MAT.dleather, buckle: MAT.bone };
      sp.headgear = T <= 2 ? { type: "hood", col: T === 1 ? "#3a3a36" : g } : T === 3 ? { type: "hood", col: g, trim: "#6ad0a0" } : { type: "hood", col: "#0e1410", trim: "#6ad0a0", crown: T >= 5 ? MAT.bone : null, gem: T >= 5 ? "#6ad0a0" : null };
      if (T >= 3) sp.shoulders = { type: "bone", size: 1 + (T - 3) * .1 };
      if (T >= 4) sp.cape = { col: "#0e1410", len: .95, tatter: 1, trim: T >= 5 ? "#3a8a6a" : null };
      sp.eyeGlow = T >= 3 ? "#6ad0a0" : null; if (T >= 5) sp.aura = "#6ad0a0";
      break;
    }
  }
  if (L.apex && !sp.aura) sp.aura = ac || "#ffd27a";
  return sp;
}
const EVO_ACCENT = { bastion: "#4a5a8a", inquisiteur: "#8a2a10", spectre: "#3a6a7a", seigneur_sang: "#7a1018", sainte: "#d9b44a", martyre: "#a02a2a", druidesse: "#4a8a3a", sorciere_noire: "#5a2a5a", heraut: "#c0902a", chantre: "#2a1a2a", ecorcheur: "#8a1a1a", chef_guerre: "#2a4a8a", assassin: "#2a2a3a", ombre_sang: "#a01a2a", tireuse_elite: "#2a3a5a", chasseresse: "#4a5a2a", archimage: "#e08a30", demoniste: "#5a1a4a", liche: "#2a4a4a", maitre_tombes: "#4a4a3a" };

// poses de garde selon l'arme
const STANCE = {
  marteau: { aFs: .55, aFe: 1.2, aBs: .95, aBe: .5, wa: 2.6, twoH: 1 },
  lance: { aFs: 1.0, aFe: .55, aBs: 1.1, aBe: .3, wa: 1.9, twoH: 1 },
  fleau: { aFs: .45, aFe: 1.4, aBs: .6, aBe: .7, wa: 2.7 },
  epee: { aFs: .55, aFe: 1.2, aBs: .4, aBe: .7, wa: 2.6 },
  masse: { aFs: .45, aFe: 1.4, aBs: .85, aBe: .55, wa: 2.75 },
  espadon: { aFs: .55, aFe: 1.2, aBs: .95, aBe: .5, wa: 2.75, twoH: 1 },
  baton: { aFs: .3, aFe: .95, aBs: -.15, aBe: .35, wa: 3.1 },
  faucille: { aFs: .45, aFe: 1.25, aBs: .6, aBe: .95, wa: 2.45 },
  luth: { aFs: .25, aFe: 1.35, aBs: .95, aBe: .75, wa: 1.6 },
  hache: { aFs: .35, aFe: 1.75, aBs: .35, aBe: .55, wa: 2.9 },
  dagues: { aFs: .7, aFe: 1.0, aBs: .55, aBe: 1.25, wa: 1.95, wa2: 2.5 },
  arbalete: { aFs: 1.3, aFe: .25, aBs: 1.15, aBe: .3, wa: 1.57, twoH: 1 },
  grimoire: { aFs: .6, aFe: 1.25, aBs: .7, aBe: .9, wa: 2.2 },
  faux: { aFs: .5, aFe: 1.0, aBs: .9, aBe: .45, wa: 3.0, twoH: 1 },
};
function heroLook(h) {
  const wt = h.gear && h.gear.wpn ? h.gear.wpn.tier : 1, at = h.gear && h.gear.arm ? h.gear.arm.tier : 1;
  const rar = Math.max(h.gear && h.gear.arm ? h.gear.arm.rar : 0, h.gear && h.gear.wpn ? h.gear.wpn.rar : 0);
  return { cls: h.cls, tier: at, wtier: wt, rar, evo: h.evo, apex: h.lvl >= APEX_LVL && !!h.evo, female: h.female, skin: h.look.skin, hair: h.look.hair, hairCol: h.look.hairCol, beard: h.female ? -1 : h.look.beard, scar: h.look.scar, key: [h.cls, at, wt, h.evo, h.female ? 1 : 0, h.look.hair, h.look.beard, h.look.skin, h.look.hairCol, h.lvl >= APEX_LVL ? 1 : 0].join("|") };
}
// dessin complet d'un héros
function drawHero(x, L, pose, t = 0, o = {}) { return drawFigure(x, outfit(L), { h: 1, w: 1, female: !!L.female }, pose, t, o); }
function drawFigure(x, sp, B0, pose = {}, t = 0, o = {}) {
  const B = Object.assign({ h: 1, female: false }, B0); B.w = (B0.w || 1) * (sp.bulk || 1);
  const st = sp.stance || STANCE[sp.wpn] || STANCE.masse;
  const p = Object.assign({}, POSE0, sp.pose0 || {}, { aFs: st.aFs, aFe: st.aFe, aBs: st.aBs, aBe: st.aBe, wa: st.wa, wa2: st.wa2 }, pose);
  const S = skel(p, B);
  // arme à deux mains : la main arrière rejoint la poignée
  if (st.twoH && !pose.free) { const grip = sp.wpn === "arbalete" ? polar(S.haF, p.wa, -2) : polar(S.haF, p.wa, 14); S.haB = grip; const mid = lerp2(S.shB, grip, .5); S.elB = [mid[0] - 2, mid[1] + 7]; }
  const wt = sp.wt;
  const weapon = () => {
    if (sp.wpn === "dagues") drawWeapon(x, "dague", wt, S.haF, p.wa, { runeCol: o.runeCol });
    else if (sp.wpn === "grimoire") drawWeapon(x, "orbe", wt, S.haF, Math.PI, { t, fire: sp.fire });
    else if (sp.wpn === "luth") drawWeapon(x, "luth", wt, lerp2(S.haF, S.haB, .4), p.wa, {});
    else if (sp.wpn) drawWeapon(x, sp.wpn, wt, S.haF, p.wa, { t, flame: o.boltFlame, col: sp.wcol });
  };
  x.save();
  if (o.flash) x.filter = "brightness(2.2) saturate(.3)";
  drawCape(x, S, sp, t);
  if (sp.quiver) { const q = add2(S.shB, [-8, 10]); shade(x, seg(q, add2(q, [-6, 30]), 9, 8), MAT.leather, { d: 1.5 }); for (let i = 0; i < 3; i++) line(x, [add2(q, [-1 + i * 2, -2]), add2(q, [-3 + i * 3, -12])], 1.4, "#d8d0b8"); }
  // bras arrière (+ bouclier, livre, seconde dague)
  drawArm(x, S, "B", sp, () => {
    if (sp.wpn === "dagues") drawWeapon(x, "dague", wt, S.haB, p.wa2 || 2.0, { runeCol: o.runeCol });
    if (sp.wpn === "grimoire") drawWeapon(x, "grimoire", wt, S.haB, 2.4, {});
  });
  drawPauldron(x, S, "B", sp);
  if (!sp.float) drawLeg(x, S, "B", sp);
  drawTorso(x, S, sp);
  drawMantle(x, S, sp);
  if (!sp.float) drawLeg(x, S, "F", sp);
  drawSkirt(x, S, sp, t);
  drawBelt(x, S, sp);
  if (sp.shield) drawShield(x, wt >= 2 ? "heater" : "round", wt, add2(S.haB, [10, 4]), -.08 + (p.shieldA || 0), { col: (sp.skirt && sp.skirt.col) || "#6b1f1f" });
  drawHead(x, S, sp, t);
  drawArm(x, S, "F", sp, sp.wpn === "luth" ? null : weapon);
  if (sp.wpn === "luth") weapon();
  drawPauldron(x, S, "F", sp);
  x.restore();
  return { S, sp };
}

// sprite éclairé : le héros est dessiné à part puis baigné de lumière (torche chaude en haut, ombre au sol)
function litPass(x, w, h, o = {}) {
  x.save(); x.globalCompositeOperation = "source-atop";
  x.fillStyle = lgrad(x, 0, 0, 0, h, [[0, "rgba(255,190,120,.10)"], [.45, "rgba(0,0,0,0)"], [1, "rgba(10,5,15,.42)"]]); x.fillRect(0, 0, w, h);
  x.fillStyle = lgrad(x, 0, 0, w, 0, [[0, "rgba(255,170,90,.12)"], [.5, "rgba(0,0,0,0)"], [1, "rgba(20,30,60,.22)"]]); x.fillRect(0, 0, w, h);
  if (o.tint) { x.fillStyle = o.tint; x.fillRect(0, 0, w, h); }
  x.restore();
}
// rendu d'un héros dans un canvas à part (mis en cache par l'écran de combat)
function heroSprite(L, pose = {}, t = 0, sc = 1, o = {}) {
  const W = Math.ceil(280 * sc), H = Math.ceil(320 * sc), cv = mkCanvas(W, H), x = cv.getContext("2d");
  x.save(); x.translate(W * .46, H - 22 * sc); x.scale(sc, sc);
  drawHero(x, L, pose, t, o);
  x.restore();
  litPass(x, W, H, o);
  spritePost(cv, sc, o);
  cv.ax = W * .46; cv.ay = H - 22 * sc; cv.sc = sc;
  return cv;
}

// contour extérieur épais + liseré de lumière froide sur le dos (relief)
function spritePost(cv, sc = 1, o = {}) {
  const W = cv.width, H = cv.height, x = cv.getContext("2d");
  const m = mkCanvas(W, H), mx = m.getContext("2d");
  mx.drawImage(cv, 0, 0); mx.globalCompositeOperation = "source-in"; mx.fillStyle = INK; mx.fillRect(0, 0, W, H);
  const out = mkCanvas(W, H), ox = out.getContext("2d"); const r = Math.max(1.2, 1.6 * sc);
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ox.drawImage(m, Math.cos(a) * r, Math.sin(a) * r); }
  ox.drawImage(cv, 0, 0);
  // liseré : silhouette moins silhouette décalée
  const rim = mkCanvas(W, H), rx = rim.getContext("2d");
  rx.drawImage(cv, 0, 0); rx.globalCompositeOperation = "source-in"; rx.fillStyle = o.rim || "#9ab8ff"; rx.fillRect(0, 0, W, H);
  rx.globalCompositeOperation = "destination-out"; rx.drawImage(cv, 2.4 * sc, -1.2 * sc);
  ox.globalAlpha = .35; ox.globalCompositeOperation = "source-atop"; ox.drawImage(rim, 0, 0);
  const rim2 = mkCanvas(W, H), r2 = rim2.getContext("2d");
  r2.drawImage(cv, 0, 0); r2.globalCompositeOperation = "source-in"; r2.fillStyle = "#ffb070"; r2.fillRect(0, 0, W, H);
  r2.globalCompositeOperation = "destination-out"; r2.drawImage(cv, -2 * sc, 1.6 * sc);
  ox.globalAlpha = .28; ox.drawImage(rim2, 0, 0);
  x.clearRect(0, 0, W, H); x.drawImage(out, 0, 0);
}
