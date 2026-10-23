/* ═══════════════════════ Monstres : silhouettes humanoïdes, bêtes et horreurs ═══════════════════════
   Dessinés tournés vers la droite, pieds en (0,0) ; la scène les retourne face aux héros. */

// ── armes des monstres ──
const MON_WPN = {
  couperet(x) { shade(x, seg([0, 10], [0, -16], 5, 5), MAT.dwood, { d: 1 }); shade(x, P([[-3, -14, 1], [16, -16, 1], [18, -44, 1], [-3, -40, 1]], true), "#7a7470", { grad: metalGrad(x, "#7a7470", -3, -44, 18, -14), d: 2 }); x.fillStyle = rgba("#6a0a0a", .8); x.beginPath(); x.ellipse(10, -22, 5, 3, .3, 0, 7); x.fill(); dot(x, 3, -38, 2, INK); },
  coutelas(x, T) { shade(x, seg([0, 8], [0, -8], 4, 4), MAT.dleather, { d: 1 }); shade(x, P([[-6, -8, 1], [6, -8, 1]], false), MAT.iron); line(x, [[-6, -8], [6, -8]], 3, MAT.iron); shade(x, P([[-3, -9], [3, -9], [6, -30], [2, -44, 1], [-2, -32]], true, .4), "#8a8a84", { grad: metalGrad(x, "#8a8a84", -3, -44, 6, -9), d: 1.4 }); },
  arc(x) { line(x, [[0, -44], [6, -20], [7, 0], [6, 20], [0, 44]], 4.5, INK, true); line(x, [[0, -44], [6, -20], [7, 0], [6, 20], [0, 44]], 2.6, MAT.wood, true); line(x, [[0, -44], [-4, 0], [0, 44]], .9, "#d8d0b8"); line(x, [[-4, 0], [30, 0]], 1.6, MAT.wood); shade(x, P([[30, -2.5, 1], [36, 0, 1], [30, 2.5, 1]], true), MAT.iron, { ol: 1, d: .4 }); },
  arcos(x) { line(x, [[0, -44], [6, -20], [7, 0], [6, 20], [0, 44]], 4.5, INK, true); line(x, [[0, -44], [6, -20], [7, 0], [6, 20], [0, 44]], 2.6, MAT.bone, true); line(x, [[0, -44], [-4, 0], [0, 44]], .9, "#c8c0a8"); },
  trident(x) { shade(x, seg([0, 30], [0, -70], 4.4, 4), "#3a4a44", { d: 1 }); for (const dx of [-9, 0, 9]) shade(x, P([[dx - 2, -66], [dx + 2, -66], [dx + 1, -86], [dx, -92, 1], [dx - 1, -86]], true, .3), "#6a8a80", { d: 1, ol: 1.4 }); line(x, [[-10, -66], [10, -66]], 3.4, "#6a8a80"); },
  torche(x, T, o) { shade(x, seg([0, 14], [0, -30], 4.6, 5.5), MAT.wood, { d: 1 }); shade(x, seg([0, -26], [0, -34], 8, 8), "#3a2a1a", { d: 1 }); x.save(); x.globalCompositeOperation = "lighter"; const f = (o.t || 0) * 9; for (let i = 0; i < 5; i++) glow(x, Math.sin(f + i) * 2.5, -40 - i * 4 - Math.abs(Math.sin(f * .6 + i)) * 3, 11 - i, i < 2 ? "#ffe08a" : "#ff6a1a", .7); x.restore(); },
  sceptre(x, T, o) { shade(x, seg([0, 40], [0, -70], 4.5, 4), "#2a2420", { d: 1 }); shade(x, skullPath(0, -76, 7), MAT.bone, { d: 1.5 }); dot(x, -2, -77, 1.6, INK); dot(x, 3, -77, 1.6, INK); x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, -78, 22, o.col || "#6ad0a0", .55); x.restore(); },
  canne(x, T, o) { shade(x, seg([0, 40], [0, -40], 3.4, 3.2), "#1a1614", { d: 1 }); shade(x, circ(0, -42, 4.5), MAT.brass, { ol: 1.2, d: 1 }); },
  hache_b(x) { shade(x, seg([0, 26], [0, -64], 6, 5.5), MAT.dwood, { d: 1.2 }); shade(x, P([[0, -40], [10, -42], [34, -30], [40, -54], [34, -80], [10, -66], [0, -64]], true, .35), "#6a6a68", { grad: metalGrad(x, "#6a6a68", 0, -80, 40, -30), d: 2.5 }); line(x, [[38, -34], [39, -76]], 1.4, rgba("#ffffff", .4), true); x.fillStyle = rgba("#6a0a0a", .7); x.beginPath(); x.ellipse(30, -42, 6, 3, -.6, 0, 7); x.fill(); },
  epee_feu(x, T, o) { shade(x, seg([0, 12], [0, -14], 4.4, 4.4), "#1a1414", { d: 1 }); line(x, [[-13, -14], [13, -14]], 4, "#2a2020"); shade(x, P([[-5, -16, 1], [5, -16, 1], [4, -78], [0, -88, 1], [-4, -78]], true, .2), "#2a2224", { d: 1.4 }); x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 7; i++) glow(x, Math.sin((o.t || 0) * 7 + i) * 2, -22 - i * 9, 9, i % 2 ? "#ff6a1a" : "#ffb040", .5); x.restore(); line(x, [[0, -18], [0, -80]], 1.2, "#ff8a3a"); },
  crochet(x) { shade(x, seg([0, 8], [0, -10], 4, 4), MAT.dwood, { d: 1 }); line(x, [[0, -10], [0, -26], [8, -34], [14, -26], [10, -20]], 4.2, INK, true); line(x, [[0, -10], [0, -26], [8, -34], [14, -26], [10, -20]], 2.4, MAT.iron, true); },
  lanterne(x, T, o) { line(x, [[0, 0], [0, 14]], 1.6, MAT.iron); shade(x, P([[-6, 14, 1], [6, 14, 1], [7, 30, 1], [-7, 30, 1]], true), "#3a3a30", { d: 1.2 }); x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, 22, 26, o.col || "#9ad04a", .65); x.restore(); shade(x, P([[-4, 17, 1], [4, 17, 1], [4.5, 27, 1], [-4.5, 27, 1]], true), o.col || "#c8f07a", { ol: 0, d: 1, hi: .6 }); },
  fireball(x, T, o) { x.save(); x.globalCompositeOperation = "lighter"; const f = (o.t || 0) * 8; for (let i = 0; i < 5; i++) glow(x, Math.sin(f + i) * 2, -6 - i * 2.5, 12 - i, i < 2 ? "#ffe08a" : "#ff5a1a", .7); x.restore(); },
};
// ── têtes de monstres ──
const MON_HEAD = {
  skull(x, hx, hy, r, k, sp, t) { // crâne
    const p = P([[hx - r, hy], [hx - r * .8, hy - r], [hx + r * .5, hy - r * 1.05], [hx + r * 1.0, hy - r * .35], [hx + r * 1.05, hy + r * .25, 1], [hx + r * .75, hy + r * .4], [hx + r * .8, hy + r * .95, 1], [hx + r * .1, hy + r, 1], [hx - r * .55, hy + r * .55]], true, .5);
    shade(x, p, MAT.bone, { d: 2.5 });
    x.fillStyle = INK; x.beginPath(); x.ellipse(hx + r * .45, hy - r * .1, 3.4, 3.8, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(hx + r * .95, hy + r * .15); x.lineTo(hx + r * .75, hy + r * .38); x.lineTo(hx + r * 1.0, hy + r * .38); x.fill();
    for (let i = 0; i < 4; i++) x.fillRect(hx + r * .2 + i * 2.4, hy + r * .55, 1.1, 4);
    if (sp.eyeGlow) { glow(x, hx + r * .45, hy - r * .1, 9, sp.eyeGlow, .9); dot(x, hx + r * .45, hy - r * .1, 1.5, sp.eyeGlow); }
    if (k.helm) helm(x, hx, hy, r, { type: k.helm, col: k.hcol || "#5a5450" }, sp, t);
    if (k.crown) { const c = poly([[hx - r * .9, hy - r * .9], [hx - r * .7, hy - r * 1.7], [hx - r * .35, hy - r * 1.1], [hx, hy - r * 1.9], [hx + r * .35, hy - r * 1.1], [hx + r * .7, hy - r * 1.7], [hx + r * .85, hy - r * .85]]); shade(x, c, k.crown, { d: 2 }); if (k.gem) { glow(x, hx, hy - r * 1.2, 12, k.gem, .7); dot(x, hx, hy - r * 1.2, 2.4, k.gem); } }
  },
  beak(x, hx, hy, r, k, sp, t) { // masque de docteur
    helm(x, hx, hy, r, { type: "hood", col: "#1a1816" }, sp, t);
    const b = P([[hx + r * .1, hy - r * .55], [hx + r * .9, hy - r * .35], [hx + r * 2.6, hy + r * .9, 1], [hx + r * .9, hy + r * .75], [hx + r * .1, hy + r * .5]], true, .45);
    shade(x, b, "#c8b896", { d: 2.5 });
    line(x, [[hx + r * .7, hy + r * .05], [hx + r * 2.2, hy + r * .78]], 1, rgba(INK, .6), true);
    shade(x, circ(hx + r * .62, hy - r * .15, 4.2), "#2a2a20", { ol: 1.6 }); glow(x, hx + r * .62, hy - r * .15, 10, k.glow || "#9ad04a", .7); dot(x, hx + r * .62, hy - r * .15, 2.2, k.glow || "#c8f07a");
    helm(x, hx, hy, r, { type: "hat", col: "#141210", band: "#3a3a30" }, sp, t);
  },
  fish(x, hx, hy, r, k, sp, t) {
    const p = P([[hx - r * 1.1, hy + r * .5], [hx - r * .9, hy - r * .9], [hx + r * .3, hy - r * 1.2], [hx + r * 1.4, hy - r * .4], [hx + r * 1.7, hy + r * .3, 1], [hx + r * .9, hy + r * .45], [hx + r * 1.5, hy + r * .8, 1], [hx + r * .4, hy + r * 1.1]], true, .5);
    shade(x, p, sp.skin, { d: 3 });
    line(x, [[hx + r * .6, hy + r * .5], [hx + r * 1.5, hy + r * .55]], 1.4, INK);
    for (let i = 0; i < 3; i++) line(x, [[hx - r * .5 + i * 3, hy - r * .1], [hx - r * .3 + i * 3, hy + r * .6]], 1, rgba(INK, .55), true);
    shade(x, P([[hx - r * .8, hy - r * .8], [hx - r * 1.6, hy - r * 1.8, 1], [hx - r * .4, hy - r * 1.1], [hx - r * .9, hy - r * 2.0, 1], [hx + r * .1, hy - r * 1.15]], true, .3), dk(sp.skin, .2), { d: 1.5 });
    shade(x, circ(hx + r * .75, hy - r * .35, 3.6), "#e8e070", { ol: 1.2, d: .8 }); dot(x, hx + r * .8, hy - r * .35, 1.6, INK);
  },
  sack(x, hx, hy, r, k, sp, t) { // cagoule de bourreau
    const p = P([[hx - r * 1.05, hy + r * .95], [hx - r * 1.1, hy - r * .4], [hx - r * .2, hy - r * 1.6, 1], [hx + r * .7, hy - r * .9], [hx + r * 1.05, hy + r * .2], [hx + r * .9, hy + r * 1.0]], true, .45);
    shade(x, p, k.col || "#1a1614", { d: 3 });
    x.fillStyle = INK; x.beginPath(); x.ellipse(hx + r * .55, hy - r * .15, 2.8, 2.2, 0, 0, 7); x.fill();
    if (k.glow) { glow(x, hx + r * .55, hy - r * .15, 7, k.glow, .8); }
    line(x, [[hx - r * .6, hy + r * .9], [hx + r * .8, hy + r * .9]], 1.4, rgba("#ffffff", .1));
  },
  bark(x, hx, hy, r, k, sp, t) { // visage d'écorce
    const p = P([[hx - r, hy], [hx - r * .7, hy - r], [hx + r * .5, hy - r * 1.05], [hx + r, hy - r * .3], [hx + r * 1.1, hy + r * .3, 1], [hx + r * .7, hy + r * .9], [hx, hy + r * 1.2, 1], [hx - r * .7, hy + r * .5]], true, .5);
    shade(x, p, sp.skin, { d: 3 }); texture(x, p, "bark", { col: sp.skin });
    glow(x, hx + r * .5, hy - r * .1, 8, k.glow || "#9ad04a", .8); dot(x, hx + r * .5, hy - r * .1, 1.8, k.glow || "#c8f07a");
    for (let i = 0; i < 9; i++) { const a = -2.8 + i * .4, px = hx + Math.cos(a) * r * 1.05, py = hy - 2 + Math.sin(a) * r; line(x, [[px, py], [px + Math.cos(a) * (8 + (i % 3) * 5), py + Math.sin(a) * (10 + (i % 2) * 6)]], 2, MAT.dwood); if (k.leaves) shade(x, ell(px + Math.cos(a) * 9, py + Math.sin(a) * 10, 3, 1.8, a), i % 2 ? "#4a6a2a" : "#6a7a2a", { ol: .8, d: .5 }); if (k.thorns) shade(x, P([[px, py], [px + Math.cos(a - .2) * 14, py + Math.sin(a - .2) * 14, 1], [px + Math.cos(a + .2) * 3, py + Math.sin(a + .2) * 3]], true), "#3a2a1a", { ol: .8, d: .4 }); }
  },
  drowned(x, hx, hy, r, k, sp, t) { // noyé : cheveux d'algues
    const face = P([[hx - r, hy - 2], [hx - r * .7, hy - r], [hx + r * .4, hy - r * 1.02], [hx + r * .95, hy - r * .4], [hx + r * 1.05, hy + r * .3, 1], [hx + r * .9, hy + r * .9], [hx + r * .2, hy + r * 1.0], [hx - r * .7, hy + r * .5]], true, .5);
    shade(x, face, sp.skin, { d: 3 });
    shade(x, circ(hx + r * .5, hy - r * .1, 2.8), "#e8f0e0", { ol: 1, d: .5 }); dot(x, hx + r * .55, hy - r * .1, .9, INK);
    x.fillStyle = INK; x.beginPath(); x.ellipse(hx + r * .75, hy + r * .55, 2.6, 3.4, 0, 0, 7); x.fill();
    const sw = Math.sin(t * 1.4) * 2;
    const hair = P([[hx - r * 1.1, hy + 4], [hx - r * 1.0, hy - r * .9], [hx + r * .3, hy - r * 1.2], [hx + r * .95, hy - r * .6], [hx + r * .6, hy - r * .5], [hx + r * .2, hy + r * .2], [hx + r * .1 + sw, hy + r * (k.long ? 4 : 1.8), 1], [hx - r * .5 + sw, hy + r * (k.long ? 3.4 : 1.2), 1], [hx - r * 1.2 + sw, hy + r * (k.long ? 4.2 : 2.2), 1]], true, .5);
    shade(x, hair, k.hair || "#2a3a2a", { d: 2 }); x.save(); x.clip(hair); for (let i = 0; i < 6; i++) line(x, [[hx - r + i * 3, hy - r], [hx - r * 1.1 + i * 3 + sw, hy + r * 3]], .9, rgba("#6a8a5a", .5), true); x.restore();
    if (k.crown) { for (let i = 0; i < 5; i++) shade(x, P([[hx - r * .9 + i * r * .45, hy - r * .9], [hx - r * .75 + i * r * .45, hy - r * 1.6, 1], [hx - r * .6 + i * r * .45, hy - r * .95]], true), k.crown, { ol: .9, d: .6 }); }
  },
  imp(x, hx, hy, r, k, sp, t) {
    const p = P([[hx - r * .9, hy], [hx - r * .6, hy - r], [hx + r * .5, hy - r], [hx + r, hy - r * .2], [hx + r * 1.15, hy + r * .3, 1], [hx + r * .6, hy + r * .8], [hx - r * .1, hy + r * .9]], true, .5);
    shade(x, p, sp.skin, { d: 2.5 });
    for (const dx of [-.3, .4]) shade(x, P([[hx + r * dx - 2, hy - r * .85], [hx + r * dx - 5, hy - r * 1.7, 1], [hx + r * dx + 3, hy - r * .9]], true, .3), "#2a1410", { ol: 1, d: .6 });
    glow(x, hx + r * .5, hy - r * .15, 8, "#ffd04a", .8); dot(x, hx + r * .5, hy - r * .15, 1.8, "#ffe08a");
    line(x, [[hx + r * .35, hy + r * .5], [hx + r * 1.0, hy + r * .45]], 1.2, INK);
    for (let i = 0; i < 3; i++) shade(x, P([[hx + r * (.4 + i * .2), hy + r * .45], [hx + r * (.5 + i * .2), hy + r * .7, 1], [hx + r * (.6 + i * .2), hy + r * .45]], true), "#f0e8d0", { ol: .5, d: 0, flat: true });
  },
};
// ── squelette ──
function boneLimb(x, a, b, c, back, sp, leg) {
  const col = dk(sp.boneCol || MAT.bone, back ? .25 : 0);
  shade(x, seg(a, b, leg ? 6.5 : 5.5, leg ? 5 : 4.5), col, { d: 1.2 }); shade(x, circ(b[0], b[1], leg ? 4.6 : 3.8), col, { d: 1 });
  shade(x, seg(b, c, leg ? 5 : 4.5, leg ? 4 : 3.6), col, { d: 1.2 });
  if (leg) shade(x, P([[c[0] - 3, c[1] - 2], [c[0] + 12, c[1] + 1], [c[0] + 13, c[1] + 3, 1], [c[0] - 4, c[1] + 3, 1]], true, .4), col, { d: 1 });
  else for (let i = 0; i < 3; i++) line(x, [c, [c[0] + 5 + i, c[1] + 4 + i * 1.5]], 1.6, col);
}
function boneTorso(x, S, sp) {
  const { hip, lean } = S, tl = 57;
  const col = sp.boneCol || MAT.bone;
  // colonne
  line(x, tx([[-6, 0], [-8, -tl * .5], [-5, -tl]], hip, lean), 5.5, INK, true); line(x, tx([[-6, 0], [-8, -tl * .5], [-5, -tl]], hip, lean), 3.5, col, true);
  // côtes
  for (let i = 0; i < 5; i++) { const yy = -tl + 10 + i * 6.5; const p = tx([[-7, yy], [6 - i * .4, yy - 3], [13 - i * 1.2, yy + 4]], hip, lean); line(x, p, 4.2, INK, true); line(x, p, 2.4, col, true); }
  // bassin
  shade(x, P(tx([[-12, -6], [10, -8], [12, 2], [2, 6, 1], [-10, 4]], hip, lean), true, .5), col, { d: 1.5 });
  if (sp.torso.plate) { const p = P(tx([[-13, -tl + 4], [11, -tl + 2], [15, -tl + 26], [10, -tl + 36], [-12, -tl + 34]], hip, lean), true, .4); shade(x, p, sp.torso.plate, { grad: metalGrad(x, sp.torso.plate, hip[0] - 14, hip[1] - tl, hip[0] + 14, hip[1] - 20), d: 3 }); }
  if (sp.eyeGlow && sp.torso.soul) { const c = tx([[2, -tl + 18]], hip, lean)[0]; glow(x, c[0], c[1], 14, sp.eyeGlow, .5); }
}
// textures : pierre, écorce, écailles
function texture(x, path, mat, T) {
  x.save(); x.clip(path); const c = T.col;
  if (mat === "stone") { for (let i = 0; i < 18; i++) { const px = (i * 37 % 60) - 30, py = (i * 53 % 120) - 110; line(x, [[px, py], [px + 6, py + 5], [px + 4, py + 11]], 1.1, rgba(INK, .5)); } if (T.lava) for (let i = 0; i < 6; i++) { const px = (i * 23 % 40) - 20, py = -90 + i * 14; x.save(); x.globalCompositeOperation = "lighter"; line(x, [[px, py], [px + 7, py + 4], [px + 3, py + 10]], 2, T.lava); x.restore(); } }
  if (mat === "bark") { for (let i = 0; i < 12; i++) { const px = -30 + i * 5; line(x, [[px, -150], [px + 3, -100], [px - 2, -50], [px + 2, 10]], 1, rgba(INK, .45), true); } }
  if (mat === "scales") { x.strokeStyle = rgba(INK, .4); x.lineWidth = .8; for (let yy = -160; yy < 20; yy += 5) for (let xx = -40; xx < 40; xx += 6) { x.beginPath(); x.arc(xx + (yy / 5 % 2) * 3, yy, 3, 0, Math.PI); x.stroke(); } }
  x.restore();
}
// ── fiches des humanoïdes ──  { sp, B }
function monFig(key) {
  const base = (o) => Object.assign({ skin: "#c8a888", hair: 0, hairCol: "#2a2018", beard: -1, scar: -1, torso: { mat: "cloth", col: "#4a4038" }, legs: { col: "#3a3028" }, boots: { col: MAT.dleather }, arms: {}, headgear: {}, wt: 2, bulk: 1 }, o);
  switch (key) {
    case "pestifere": return { B: { h: .95 }, sp: base({ skin: "#9aa478", hair: 1, hairCol: "#3a3424", torso: { mat: "cloth", col: "#5a5442" }, skirt: { type: "kilt", col: "#4a4434", len: .42 }, legs: { col: "#4a4434", type: "wrap" }, boots: { type: "bare" }, arms: { bareFore: 1, col: "#5a5442" }, wpn: null, pose0: { lean: .38, head: .25, aFs: 1.1, aFe: .5, aBs: .8, aBe: .7, lFh: .3, lFk: -.5 }, eyeGlow: "#d8e06a", undead: 0, sores: 1 }) };
    case "cultiste": return { B: { h: 1 }, sp: base({ skin: "#b8a890", torso: { mat: "cloth", col: "#23281c" }, skirt: { type: "robe", col: "#1e2218", len: .96, trim: "#5a7a2a" }, arms: { col: "#23281c", bell: 1 }, headgear: { type: "cowl", col: "#1a1e14", mask: "#c8c0a0" }, eyeGlow: "#b0f05a", wpn: "lanterne", wcol: "#9ad04a", stance: { aFs: .9, aFe: .8, aBs: .6, aBe: 1.1, wa: 0 }, belt: { col: MAT.rope } }) };
    case "goule": return { B: { h: 1, w: 1.05 }, sp: base({ skin: "#7a8a88", hair: 2, hairCol: "#2a2a2a", torso: { mat: "bare" }, skirt: { type: "kilt", col: "#3a3028", len: .35 }, legs: { col: "#7a8a88" }, boots: { type: "bare" }, arms: { bare: 1, bareFore: 1 }, wpn: "griffes", claws: 1, pose0: { lean: .3, head: .3, aFs: .9, aFe: .9, aBs: .5, aBe: .9, lFh: .45, lFk: -.7 }, eyeGlow: "#e8f0a0" }) };
    case "boucher": return { B: { h: 1.12, w: 1.25 }, sp: base({ skin: "#c89878", bulk: 1.35, torso: { mat: "leather", col: "#7a6a50", blood: 1 }, skirt: { type: "tabard", col: "#8a7a5a", len: .6, w: 1.9 }, arms: { bare: 1, bareFore: 1 }, legs: { col: "#3a3028" }, boots: { col: MAT.dleather }, headgear: { type: "sack", col: "#6a5a44", full: 1 }, wpn: "couperet", stance: { aFs: .4, aFe: 1.5, aBs: .7, aBe: .6, wa: 2.6 }, belt: { col: MAT.dleather } }) };
    case "docteur": return { B: { h: 1.45, w: 1.05 }, sp: base({ skin: "#c8b8a0", torso: { mat: "leather", col: "#1c1a18", buckle: MAT.brass }, skirt: { type: "coat", col: "#181614", len: .9, trim: "#3a3428" }, arms: { col: "#1c1a18", glove: "#2a2420" }, legs: { col: "#141210" }, boots: { col: "#141210", high: 1 }, headgear: { type: "beak", full: 1 }, cape: { col: "#141210", len: .9, tatter: 1 }, wpn: "lanterne", wcol: "#9ad04a", stance: { aFs: .8, aFe: .9, aBs: .2, aBe: .6, wa: 0 }, belt: { col: MAT.dleather, pouch: MAT.leather }, vials: 1 }) };
    case "brigand": return { B: { h: 1 }, sp: base({ skin: "#c8a080", hair: 1, beard: 0, torso: { mat: "leather", col: "#4a3a28", buckle: MAT.iron }, skirt: { type: "coat", col: "#3a2e20", len: .35 }, arms: { col: "#5a4a34", bracer: MAT.leather }, headgear: { type: "hood", col: "#3a3424" }, wpn: "coutelas", stance: { aFs: .5, aFe: 1.3, aBs: .4, aBe: .9, wa: 2.4 }, belt: { col: MAT.dleather, pouch: MAT.leather } }) };
    case "archer": return { B: { h: 1 }, sp: base({ skin: "#b89070", torso: { mat: "leather", col: "#3a4a2a" }, skirt: { type: "coat", col: "#2a3a20", len: .4 }, arms: { col: "#3a4a2a", bracer: MAT.leather }, headgear: { type: "hood", col: "#2a3420" }, wpn: "arc", stance: { aFs: 1.35, aFe: .2, aBs: 1.2, aBe: -.4, wa: Math.PI }, quiver: 1, belt: { col: MAT.dleather } }) };
    case "pendu": return { B: { h: 1 }, sp: base({ skin: "#8a9090", hair: 4, hairCol: "#3a3a3a", torso: { mat: "cloth", col: "#3a3a40" }, skirt: { type: "robe", col: "#2e2e34", len: .75, wisp: 1 }, arms: { col: "#3a3a40", bareFore: 1 }, float: 1, wpn: null, pose0: { lean: -.05, head: .55, aFs: .1, aFe: .1, aBs: -.05, aBe: .1, hy: -12 }, noose: 1, eyeGlow: "#c8e0f0", ghost: .82 }) };
    case "squelette": return { B: { h: 1 }, sp: base({ bones: 1, torso: { mat: "bones" }, headgear: { type: "skull", helm: "kettle", hcol: "#5a5048", full: 1 }, wpn: "coutelas", shield: 1, wt: 1, stance: { aFs: .5, aFe: 1.3, aBs: .8, aBe: .6, wa: 2.5 }, eyeGlow: "#7af0e0", skirt: { type: "kilt", col: "#3a3028", len: .3 } }) };
    case "archer_os": return { B: { h: 1 }, sp: base({ bones: 1, torso: { mat: "bones" }, headgear: { type: "skull", full: 1 }, wpn: "arcos", stance: { aFs: 1.35, aFe: .2, aBs: 1.2, aBe: -.4, wa: Math.PI }, eyeGlow: "#7af0e0", quiver: 1 }) };
    case "chevalier_os": return { B: { h: 1.12, w: 1.15 }, sp: base({ bones: 1, torso: { mat: "bones", plate: "#4a4a50", soul: 1 }, headgear: { type: "skull", helm: "greathelm", hcol: "#4a4a50", full: 1 }, shoulders: { type: "ornate", col: "#4a4a50", spike: 1 }, cape: { col: "#2a1a1a", len: .8, tatter: 1 }, wpn: "espadon", wt: 3, stance: STANCE.espadon, eyeGlow: "#7af0e0", skirt: { type: "tassets", col: "#4a4a50" } }) };
    case "liche": return { B: { h: 1.5, w: 1 }, sp: base({ bones: 1, torso: { mat: "bones", soul: 1 }, skirt: { type: "robe", col: "#1a2220", len: .9, trim: "#3a8a6a", wisp: 1 }, mantle: { col: "#121a18", trim: "#6ad0a0" }, cape: { col: "#0e1412", len: .95, tatter: 1 }, arms: { col: "#1a2220", bell: 1 }, float: 1, headgear: { type: "skull", crown: MAT.gold, gem: "#6ad0a0", full: 1 }, wpn: "sceptre", wcol: "#6ad0a0", stance: { aFs: .5, aFe: 1.0, aBs: .9, aBe: 1.0, wa: 3.05 }, eyeGlow: "#6ad0a0", pose0: { hy: -16 } }) };
    case "noye": return { B: { h: 1.05, w: 1.15 }, sp: base({ skin: "#6a8a84", bulk: 1.2, torso: { mat: "cloth", col: "#2a3a38" }, skirt: { type: "kilt", col: "#24302e", len: .45 }, arms: { bareFore: 1, col: "#2a3a38" }, legs: { col: "#24302e" }, boots: { type: "bare" }, headgear: { type: "drowned", full: 1 }, wpn: "crochet", chains: 1, stance: { aFs: .7, aFe: 1.0, aBs: .6, aBe: .5, wa: 2.2 }, pose0: { lean: .2, head: .2 } }) };
    case "profond": return { B: { h: 1.05 }, sp: base({ skin: "#3a6a64", torso: { mat: "scales", col: "#3a6a64" }, skirt: { type: "kilt", col: "#2a3a30", len: .38 }, arms: { bare: 1, bareFore: 1 }, legs: { col: "#3a6a64" }, boots: { type: "bare" }, headgear: { type: "fish", full: 1 }, wpn: "trident", stance: { aFs: .6, aFe: .9, aBs: .9, aBe: .4, wa: 2.4, twoH: 1 } }) };
    case "chevalier_dechu": return { B: { h: 1.08, w: 1.1 }, sp: base({ skin: "#3a3030", torso: { mat: "plate", col: "#2e2a2a", trim: "#8a3a1a" }, skirt: { type: "tassets", col: "#2e2a2a", trim: "#8a3a1a" }, arms: { col: MAT.black, rerebrace: "#2e2a2a", bracer: "#2e2a2a", bracerMetal: 1, glove: "#2e2a2a", gloveMetal: 1 }, legs: { col: MAT.black, type: "plate", metal: "#2e2a2a" }, boots: { type: "sabaton", metal: "#2e2a2a" }, shoulders: { type: "ornate", col: "#2e2a2a", spike: 1, trim: "#8a3a1a" }, headgear: { type: "skullhelm", col: "#2e2a2a", spikes: 1, flame: "#ff6a1a" }, eyeGlow: "#ff8a3a", cape: { col: "#2a1210", len: .85, tatter: 1 }, wpn: "epee_feu", stance: STANCE.espadon, embers: 1 }) };
    case "inquisiteur": return { B: { h: 1.02 }, sp: base({ skin: "#d0b090", beard: 1, hairCol: "#6a6a6a", torso: { mat: "cloth", col: "#5a1410", collar: "#d8d0b8" }, skirt: { type: "robe", col: "#4a100c", len: .95, trim: MAT.gold }, arms: { col: "#5a1410", bell: 1 }, headgear: { type: "mitre", col: "#2a0a08", trim: MAT.gold }, wpn: "torche", stance: { aFs: .7, aFe: 1.3, aBs: .9, aBe: 1.2, wa: 2.9 }, belt: { col: MAT.rope } }) };
    case "bourreau": return { B: { h: 1.15, w: 1.2 }, sp: base({ skin: "#b88868", bulk: 1.3, torso: { mat: "bare", straps: [[[-12, -54], [12, -24]]] }, skirt: { type: "kilt", col: "#1a1614", len: .5 }, arms: { bare: 1, bareFore: 1, bracer: MAT.dleather }, legs: { col: "#1a1614" }, boots: { col: MAT.dleather, high: 1 }, headgear: { type: "sack", col: "#141210", full: 1, glow: "#ff3a2a" }, wpn: "hache_b", stance: { aFs: .3, aFe: 1.7, aBs: .45, aBe: 1.3, wa: 2.95 }, belt: { col: MAT.dleather, buckle: MAT.iron } }) };
    case "roi": return { B: { h: 1.6, w: 1.15 }, sp: base({ skin: "#3a2a24", torso: { mat: "plate", col: "#2a2420", trim: MAT.gold, sun: "#ff8a3a" }, skirt: { type: "tassets", col: "#2a2420", trim: MAT.gold }, arms: { col: MAT.black, rerebrace: "#2a2420", bracer: "#2a2420", bracerMetal: 1, gold: 1, glove: "#2a2420", gloveMetal: 1 }, legs: { col: MAT.black, type: "plate", metal: "#2a2420", gold: 1 }, boots: { type: "sabaton", metal: "#2a2420" }, shoulders: { type: "ornate", col: "#2a2420", trim: MAT.gold, spike: 1, gem: "#ff6a2a", size: 1.2 }, headgear: { type: "skullhelm", col: "#2a2420", crown: MAT.gold, gem: "#ff6a2a", flame: "#ff6a1a" }, eyeGlow: "#ffb04a", cape: { col: "#3a0a08", len: .95, trim: MAT.gold }, wpn: "epee_feu", stance: STANCE.espadon, embers: 1 }) };
    case "dryade": return { B: { h: 1.02, female: true }, sp: base({ skin: "#6a5a3a", torso: { mat: "bark", col: "#5a4a30" }, skirt: { type: "robe", col: "#3a4a24", len: .85, roots: 1 }, arms: { bare: 1, bareFore: 1 }, headgear: { type: "bark", leaves: 1, glow: "#c0f06a", full: 1 }, wpn: null, claws: 1, stance: { aFs: .9, aFe: 1.0, aBs: .4, aBe: 1.4, wa: 0 } }) };
    case "mere_ronces": return { B: { h: 1.65, w: 1.1, female: true }, sp: base({ skin: "#4a3a26", torso: { mat: "bark", col: "#4a3a26" }, skirt: { type: "robe", col: "#2a2a18", len: .98, roots: 1 }, cape: { col: "#1e2414", len: .9, tatter: 1 }, arms: { bare: 1, bareFore: 1 }, headgear: { type: "bark", thorns: 1, glow: "#e0ff6a", full: 1 }, wpn: null, claws: 1, stance: { aFs: 1.0, aFe: .9, aBs: .7, aBe: 1.2, wa: 0 }, vines: 1 }) };
    case "mere_noyes": return { B: { h: 1.6, w: 1.05, female: true }, sp: base({ skin: "#5a7a78", torso: { mat: "cloth", col: "#1e2e2e" }, skirt: { type: "robe", col: "#142424", len: .98, wisp: 1, tentacles: 1 }, arms: { bare: 1, bareFore: 1 }, float: 1, headgear: { type: "drowned", long: 1, hair: "#1a2a24", crown: "#d8d0b8", full: 1 }, wpn: null, claws: 1, stance: { aFs: .9, aFe: .9, aBs: .6, aBe: 1.2, wa: 0 }, pose0: { hy: -14 } }) };
    case "diablotin": return { B: { h: .72, w: .95 }, sp: base({ skin: "#9a2a1a", torso: { mat: "bare" }, skirt: { type: "kilt", col: "#2a1410", len: .3 }, arms: { bare: 1, bareFore: 1 }, legs: { col: "#9a2a1a" }, boots: { type: "bare" }, headgear: { type: "imp", full: 1 }, wpn: "fireball", stance: { aFs: .9, aFe: 1.3, aBs: .5, aBe: .9, wa: Math.PI }, wings: "#4a1410", tail: "#9a2a1a", float: 0, pose0: { hy: -26, air: 1, lFh: .2, lFk: -.9, lBh: -.1, lBk: -.8 } }) };
    case "golem": return { B: { h: 1.2, w: 1.35 }, sp: base({ skin: "#4a4440", bulk: 1.4, torso: { mat: "stone", col: "#4a4440", lava: "#ff6a1a" }, arms: { bare: 1, bareFore: 1 }, legs: { col: "#4a4440" }, boots: { type: "bare" }, headgear: { type: "rockhead", full: 1 }, wpn: null, stance: { aFs: .5, aFe: .7, aBs: .3, aBe: .6, wa: 0 }, eyeGlow: "#ff8a2a", stone: 1 }) };
  }
  return null;
}
MON_HEAD.rockhead = (x, hx, hy, r, k, sp) => { const p = P([[hx - r * .9, hy + r * .6, 1], [hx - r, hy - r * .5], [hx - r * .2, hy - r * 1.1, 1], [hx + r * .8, hy - r * .7], [hx + r * 1.1, hy + r * .3, 1], [hx + r * .3, hy + r * .9]], true, .2); shade(x, p, sp.skin, { d: 3 }); texture(x, p, "stone", { lava: "#ff6a1a" }); glow(x, hx + r * .5, hy - r * .1, 10, "#ff8a2a", .9); dot(x, hx + r * .5, hy - r * .1, 2.2, "#ffd08a"); };

// ── bêtes ──
function quad(x, o, t) {
  const L = o.len || 70, H = o.h || 44, col = o.col, belly = o.belly || lt(col, .15);
  const atk = o.atk || 0, br = Math.sin(t * 2.4) * 1.2;
  const sh = [L * .32 + atk * 10, -H - br * .5], hp = [-L * .38, -H * .95];
  const legs = [[sh[0] - 3, sh[1] + 6, -1], [hp[0] + 2, hp[1] + 4, -1], [sh[0] + 5, sh[1] + 8, 1], [hp[0] + 10, hp[1] + 6, 1]];
  const legW = o.legW || 9;
  const drawLegQ = (base, back, front, k) => {
    const c = back ? dk(col, .3) : col;
    if (front) { const kn = [base[0] + 2 + atk * 4 * k, -H * .45], ft = [base[0] + 4 + atk * 8 * k, -2]; shade(x, seg(base, kn, legW + 3, legW - 1), c, { d: 2 }); shade(x, seg(kn, ft, legW - 1, legW - 3), c, { d: 1.5 }); shade(x, ell(ft[0] + 3, ft[1], legW * .55, 3.2), dk(c, .2), { d: 1, ol: 1.4 }); if (o.claws) for (let i = 0; i < 3; i++) line(x, [[ft[0] + 4 + i * 2, ft[1] + 1], [ft[0] + 7 + i * 2, ft[1] + 3]], 1.2, MAT.bone); }
    else { const kn = [base[0] - 8, -H * .52], hk = [base[0] + 2, -H * .22], ft = [base[0] + 4, -2]; shade(x, seg(base, kn, legW + 6, legW), c, { d: 2 }); shade(x, seg(kn, hk, legW, legW - 2), c, { d: 1.5 }); shade(x, seg(hk, ft, legW - 2, legW - 3), c, { d: 1 }); shade(x, ell(ft[0] + 3, ft[1], legW * .55, 3.2), dk(c, .2), { d: 1, ol: 1.4 }); }
  };
  // queue
  if (o.tail) { const sw = Math.sin(t * 3) * 4; const tp = o.tail === "thin" ? P([[hp[0] - 4, hp[1] - 4], [hp[0] - 20, hp[1] + 4 + sw * .4], [hp[0] - 34, hp[1] + 16 + sw], [hp[0] - 36, hp[1] + 18 + sw, 1], [hp[0] - 20, hp[1] + 8], [hp[0] - 2, hp[1] + 4]], true, .5) : P([[hp[0] - 2, hp[1] - 6], [hp[0] - 18, hp[1] - 4 + sw * .5], [hp[0] - 32, hp[1] + 10 + sw], [hp[0] - 26, hp[1] + 22 + sw, 1], [hp[0] - 14, hp[1] + 10], [hp[0] - 2, hp[1] + 6]], true, .5); shade(x, tp, o.tail === "thin" ? lt(col, .2) : col, { d: 3 }); }
  drawLegQ(legs[0], true, true, 1); drawLegQ(legs[1], true, false, 1);
  // corps
  const body = P([[hp[0] - 8, hp[1] + 2], [hp[0] - 4, hp[1] - 10], [(sh[0] + hp[0]) / 2, -H - 9 - (o.hump || 0)], [sh[0] + 4, sh[1] - 12 - (o.mane ? 4 : 0)], [sh[0] + 14, sh[1] - 2], [sh[0] + 12, sh[1] + 14], [(sh[0] + hp[0]) / 2, -H * .58 + (o.belly0 || 0)], [hp[0] + 2, hp[1] + 12]], true, .5);
  shade(x, body, col, { grad: lgrad(x, 0, -H - 12, 0, -H * .5, [[0, lt(col, .1)], [1, dk(col, .3)]]), d: 4.5 });
  x.save(); x.clip(body); if (o.fur) for (let i = 0; i < 14; i++) line(x, [[hp[0] + i * L * .06, -H - 8], [hp[0] + i * L * .06 - 4, -H + 4]], .9, rgba(INK, .35)); if (o.stripes) for (let i = 0; i < 5; i++) line(x, [[hp[0] + 8 + i * 10, -H - 8], [hp[0] + 4 + i * 10, -H + 8]], 2.5, rgba(INK, .4)); x.restore();
  if (o.armor) { const ap = P([[hp[0] + 4, -H - 6], [(sh[0] + hp[0]) / 2, -H - 12], [sh[0] + 4, sh[1] - 10], [sh[0] + 10, sh[1] + 4], [(sh[0] + hp[0]) / 2, -H * .72], [hp[0] + 6, -H * .78]], true, .4); shade(x, ap, o.armor, { grad: metalGrad(x, o.armor, hp[0], -H - 12, sh[0], -H * .7), d: 3 }); for (let i = 0; i < 4; i++) dot(x, hp[0] + 14 + i * 12, -H - 4 - (i % 2), 1.4, MAT.brass); }
  if (o.mane) { const mp = P([[sh[0] - 14, sh[1] - 8], [sh[0] - 2, sh[1] - 18], [sh[0] + 12, sh[1] - 10], [sh[0] + 14, sh[1] + 6, 1], [sh[0] + 4, sh[1] + 2], [sh[0] - 6, sh[1] + 6, 1], [sh[0] - 12, sh[1]]], true, .5); shade(x, mp, dk(col, .15), { d: 2 }); }
  if (o.spikes) for (let i = 0; i < 5; i++) { const px = hp[0] + 6 + i * L * .13, py = -H - 8 - Math.sin(i / 4 * Math.PI) * 5; shade(x, P([[px - 3, py + 2], [px, py - 9, 1], [px + 3, py + 2]], true), o.spikes, { ol: 1, d: .6 }); }
  drawLegQ(legs[2], false, true, 1); drawLegQ(legs[3], false, false, 1);
  // tête
  const hd = [sh[0] + 18 + atk * 12, sh[1] - 10 + atk * 8 + (o.headDown || 0)];
  shade(x, seg([sh[0] + 4, sh[1] - 4], hd, 20, 14), col, { d: 2.5 });
  quadHead(x, hd, o, t, atk);
}
function quadHead(x, h, o, t, atk) {
  const col = o.col, s = o.hs || 1, open = atk * 7 + (o.jaw || 0);
  const ty = o.head || "wolf";
  if (ty === "wolf" || ty === "hound" || ty === "rat" || ty === "fox") {
    const sl = ty === "rat" ? 20 : ty === "hound" ? 17 : 19;
    // mâchoire inférieure
    shade(x, P([[h[0] + 2 * s, h[1] + 3 * s], [h[0] + sl * s, h[1] + 4 * s + open], [h[0] + (sl - 2) * s, h[1] + 7 * s + open, 1], [h[0] + 2, h[1] + 9 * s]], true, .4), dk(col, .25), { d: 1.5 });
    if (open > 2) for (let i = 0; i < 3; i++) shade(x, P([[h[0] + (8 + i * 4) * s, h[1] + 4 * s + open], [h[0] + (9 + i * 4) * s, h[1] + 1 * s + open, 1], [h[0] + (10 + i * 4) * s, h[1] + 4 * s + open]], true), "#f0e8d0", { ol: .6, flat: true });
    const head = P([[h[0] - 10 * s, h[1] + 4 * s], [h[0] - 8 * s, h[1] - 8 * s], [h[0] + 4 * s, h[1] - 9 * s], [h[0] + (sl + 3) * s, h[1] - 1 * s], [h[0] + (sl + 4) * s, h[1] + 2 * s, 1], [h[0] + sl * s, h[1] + 4 * s], [h[0] + 2 * s, h[1] + 7 * s]], true, .5);
    shade(x, head, col, { d: 2.5 });
    shade(x, circ(h[0] + (sl + 3) * s, h[1] + 0 * s, 2.4 * s), INK, { ol: 0, flat: true });
    if (open > 2) for (let i = 0; i < 3; i++) shade(x, P([[h[0] + (8 + i * 4) * s, h[1] + 4 * s], [h[0] + (9 + i * 4) * s, h[1] + 7.5 * s, 1], [h[0] + (10 + i * 4) * s, h[1] + 4 * s]], true), "#f0e8d0", { ol: .6, flat: true });
    // oreilles
    const ear = (dx, k) => shade(x, P([[h[0] + dx * s, h[1] - 7 * s], [h[0] + (dx - 3) * s, h[1] - (ty === "rat" ? 13 : 19) * s, ty === "rat" ? 0 : 1], [h[0] + (dx + 5) * s, h[1] - 8 * s]], true, .4), k ? dk(col, .25) : col, { d: 1.2 });
    if (ty === "rat") { shade(x, circ(h[0] - 3 * s, h[1] - 10 * s, 6 * s), lt(col, .1), { d: 1.5 }); shade(x, circ(h[0] - 3 * s, h[1] - 10 * s, 3.4 * s), "#c88a8a", { ol: 0, flat: true }); }
    else { ear(-6, 1); ear(-1, 0); }
    const ec = o.eye || "#ffb030"; glow(x, h[0] + 5 * s, h[1] - 3 * s, 7 * s, ec, .75); shade(x, ell(h[0] + 5 * s, h[1] - 3 * s, 2.4 * s, 1.6 * s, -.2), ec, { ol: 1, d: .5, hi: .6 });
    if (ty === "rat") for (let i = 0; i < 3; i++) line(x, [[h[0] + 20 * s, h[1] + 1 * s], [h[0] + 30 * s, h[1] - 3 * s + i * 3 * s]], .7, rgba("#e8e0d0", .7));
    if (o.ghost) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, h[0], h[1], 22 * s, o.ghost, .3); x.restore(); }
  } else if (ty === "cat") {
    const head = P([[h[0] - 9 * s, h[1] + 3 * s], [h[0] - 8 * s, h[1] - 8 * s], [h[0] + 4 * s, h[1] - 9 * s], [h[0] + 11 * s, h[1] - 2 * s], [h[0] + 12 * s, h[1] + 3 * s, 1], [h[0] + 4 * s, h[1] + 7 * s]], true, .55);
    shade(x, head, col, { d: 2.5 });
    for (const dx of [-7, 0]) shade(x, P([[h[0] + dx * s, h[1] - 6 * s], [h[0] + (dx + 1) * s, h[1] - 17 * s, 1], [h[0] + (dx + 7) * s, h[1] - 8 * s]], true, .3), dx ? dk(col, .2) : col, { d: 1 });
    const ec = o.eye || "#a0f04a"; glow(x, h[0] + 4 * s, h[1] - 3 * s, 7 * s, ec, .8); shade(x, ell(h[0] + 4.5 * s, h[1] - 2.6 * s, 2.6 * s, 2 * s), ec, { ol: 1, d: .4, hi: .7 }); line(x, [[h[0] + 4.5 * s, h[1] - 4 * s], [h[0] + 4.5 * s, h[1] - 1.2 * s]], 1, INK);
    for (let i = 0; i < 3; i++) line(x, [[h[0] + 10 * s, h[1] + 2 * s], [h[0] + 20 * s, h[1] - 1 * s + i * 2.5 * s]], .6, rgba("#e8e0d0", .6));
  } else if (ty === "boar") {
    const head = P([[h[0] - 12 * s, h[1] + 6 * s], [h[0] - 10 * s, h[1] - 10 * s], [h[0] + 4 * s, h[1] - 10 * s], [h[0] + 18 * s, h[1] - 2 * s], [h[0] + 22 * s, h[1] + 6 * s, 1], [h[0] + 16 * s, h[1] + 10 * s, 1], [h[0] + 2 * s, h[1] + 12 * s]], true, .45);
    shade(x, head, col, { d: 3 });
    shade(x, ell(h[0] + 22 * s, h[1] + 6 * s, 3.4 * s, 4.4 * s), dk(col, .3), { ol: 1.4, d: 1 }); dot(x, h[0] + 22.5 * s, h[1] + 5 * s, 1.1 * s, INK); dot(x, h[0] + 22.5 * s, h[1] + 8 * s, 1.1 * s, INK);
    shade(x, P([[h[0] + 12 * s, h[1] + 9 * s], [h[0] + 22 * s, h[1] - 6 * s, 1], [h[0] + 16 * s, h[1] + 9 * s]], true, .4), "#f0e4c8", { ol: 1.2, d: .6 });
    shade(x, P([[h[0] - 6 * s, h[1] - 8 * s], [h[0] - 9 * s, h[1] - 18 * s, 1], [h[0] - 1 * s, h[1] - 9 * s]], true, .3), dk(col, .1), { d: 1 });
    glow(x, h[0] + 6 * s, h[1] - 3 * s, 6 * s, o.eye || "#ff5a2a", .8); dot(x, h[0] + 6 * s, h[1] - 3 * s, 1.6 * s, o.eye || "#ff8a4a");
    if (o.armor) { shade(x, P([[h[0] - 8 * s, h[1] - 11 * s], [h[0] + 10 * s, h[1] - 8 * s], [h[0] + 14 * s, h[1] - 2 * s], [h[0] - 4 * s, h[1] - 1 * s]], true, .3), o.armor, { grad: metalGrad(x, o.armor, h[0] - 8, h[1] - 11, h[0] + 14, h[1]), d: 1.5 }); }
  }
}
// oiseau
function bird(x, o, t) {
  const col = o.col, s = o.s || 1, fly = !!o.fly, atk = o.atk || 0;
  const by = fly ? -70 * s + Math.sin(t * 3) * 5 : -26 * s;
  const b = [atk * 18, by + atk * 6];
  const flap = fly ? Math.sin(t * (o.fast ? 14 : 8)) : 0;
  // aile arrière
  const wing = (k) => { const up = fly ? -flap * 26 * s : 0; const c = k ? dk(col, .3) : col; const p = fly ? P([[b[0] - 6 * s, b[1] - 4 * s], [b[0] - 20 * s, b[1] - 22 * s + up], [b[0] - 46 * s, b[1] - 28 * s + up * 1.4, 1], [b[0] - 38 * s, b[1] - 16 * s + up], [b[0] - 44 * s, b[1] - 10 * s + up * 1.2, 1], [b[0] - 30 * s, b[1] - 6 * s + up * .6], [b[0] - 34 * s, b[1] + 2 * s + up * .8, 1], [b[0] - 14 * s, b[1] + 4 * s]], true, .45) : P([[b[0] + 6 * s, b[1] - 8 * s], [b[0] - 10 * s, b[1] - 10 * s], [b[0] - 28 * s, b[1] + 2 * s, 1], [b[0] - 10 * s, b[1] + 8 * s]], true, .5); shade(x, p, c, { d: 3 }); x.save(); x.clip(p); for (let i = 0; i < 5; i++) line(x, [[b[0] - 8 * s - i * 6 * s, b[1] - 6 * s], [b[0] - 14 * s - i * 7 * s, b[1] + 6 * s]], .9, rgba(INK, .5)); x.restore(); };
  if (fly) wing(1);
  if (!fly || o.legs) { for (const dx of [-4, 4]) { line(x, [[b[0] + dx * s, b[1] + 10 * s], [b[0] + dx * s + 2, fly ? b[1] + 20 * s : -2]], 2.6 * s, INK); line(x, [[b[0] + dx * s, b[1] + 10 * s], [b[0] + dx * s + 2, fly ? b[1] + 20 * s : -2]], 1.4 * s, o.leg || "#c8a050"); } }
  // queue
  shade(x, P([[b[0] - 8 * s, b[1] + 2 * s], [b[0] - 24 * s, b[1] + 8 * s + (fly ? 0 : 8 * s)], [b[0] - 26 * s, b[1] + 14 * s + (fly ? 0 : 8 * s), 1], [b[0] - 6 * s, b[1] + 10 * s]], true, .4), dk(col, .2), { d: 1.5 });
  const body = P([[b[0] - 14 * s, b[1] + 2 * s], [b[0] - 6 * s, b[1] - 12 * s], [b[0] + 10 * s, b[1] - 14 * s], [b[0] + 16 * s, b[1] - 2 * s], [b[0] + 8 * s, b[1] + 12 * s], [b[0] - 6 * s, b[1] + 12 * s]], true, .55);
  shade(x, body, col, { d: 3.5 });
  if (o.chest) { x.save(); x.clip(body); shade(x, ell(b[0] + 8 * s, b[1] + 2 * s, 8 * s, 10 * s), o.chest, { ol: 0, d: 1.5 }); x.restore(); }
  if (!fly) wing(0);
  // tête
  const h = [b[0] + 14 * s, b[1] - 16 * s];
  if (o.type === "owl") {
    shade(x, P([[h[0] - 12 * s, h[1] + 8 * s], [h[0] - 12 * s, h[1] - 8 * s], [h[0] - 9 * s, h[1] - 16 * s, 1], [h[0] - 4 * s, h[1] - 10 * s], [h[0] + 4 * s, h[1] - 10 * s], [h[0] + 9 * s, h[1] - 16 * s, 1], [h[0] + 12 * s, h[1] - 8 * s], [h[0] + 12 * s, h[1] + 8 * s]], true, .5), col, { d: 3 });
    for (const dx of [-5, 5]) { shade(x, circ(h[0] + dx * s, h[1] - 1 * s, 5 * s), lt(col, .25), { ol: 1.2, d: 1 }); glow(x, h[0] + dx * s, h[1] - 1 * s, 7 * s, o.eye || "#ffd04a", .6); shade(x, circ(h[0] + dx * s, h[1] - 1 * s, 3 * s), o.eye || "#ffd04a", { ol: 1, d: .4, hi: .7 }); dot(x, h[0] + dx * s, h[1] - 1 * s, 1.4 * s, INK); }
    shade(x, P([[h[0] - 2 * s, h[1] + 3 * s], [h[0] + 2 * s, h[1] + 3 * s], [h[0], h[1] + 8 * s, 1]], true), "#c8a050", { ol: 1, d: .5 });
  } else {
    shade(x, circ(h[0], h[1], 9 * s), col, { d: 2.5 });
    const beakL = o.type === "griffon" ? 16 : 18;
    shade(x, P([[h[0] + 5 * s, h[1] - 5 * s], [h[0] + beakL * s, h[1] + 1 * s + atk * 3], [h[0] + (beakL - 2) * s, h[1] + 5 * s, 1], [h[0] + 6 * s, h[1] + 4 * s]], true, .35), o.beak || "#2a2a2a", { d: 1.2 });
    glow(x, h[0] + 3 * s, h[1] - 2 * s, 6 * s, o.eye || "#ff3a2a", .8); dot(x, h[0] + 3 * s, h[1] - 2 * s, 1.8 * s, o.eye || "#ff6a4a");
    if (o.crest) for (let i = 0; i < 3; i++) shade(x, P([[h[0] - 4 * s - i * 3 * s, h[1] - 6 * s], [h[0] - 12 * s - i * 4 * s, h[1] - 14 * s + i * 2 * s, 1], [h[0] - 2 * s - i * 3 * s, h[1] - 2 * s]], true, .3), o.crest, { d: 1 });
  }
  if (fly) wing(0);
  if (o.glow) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, b[0], b[1], 40 * s, o.glow, .25); x.restore(); }
}
// araignée
function spider(x, o, t) {
  const col = o.col || "#2a2420", atk = o.atk || 0, s = o.s || 1;
  const c = [atk * 14, -26 * s - Math.sin(t * 3) * 1.5];
  const KN = [[-34, -34], [-16, -42], [12, -42], [30, -32]], FT = [[-58, 0], [-30, 0], [26, 0], [52, 0]];
  const leg = (i, back) => { const ph = Math.sin(t * 4 + i) * 2, o2 = back ? 8 : 0; const k1 = [c[0] + (KN[i][0] + o2) * s, c[1] + KN[i][1] * s + ph]; const f = [c[0] + (FT[i][0] + o2 + (i > 1 ? atk * 10 : 0)) * s, -2]; const cc = back ? dk(col, .35) : col; shade(x, seg([c[0] + (i - 1.5) * 3 * s, c[1]], k1, 6 * s, 4.5 * s), cc, { d: 1 }); shade(x, seg(k1, f, 4.5 * s, 2.2 * s), cc, { d: 1 }); };
  for (let i = 0; i < 4; i++) leg(i, true);
  const ab = P([[c[0] - 8 * s, c[1] - 6 * s], [c[0] - 20 * s, c[1] - 26 * s], [c[0] - 44 * s, c[1] - 26 * s], [c[0] - 54 * s, c[1] - 6 * s], [c[0] - 40 * s, c[1] + 10 * s], [c[0] - 16 * s, c[1] + 6 * s]], true, .55);
  shade(x, ab, col, { d: 5 });
  x.save(); x.clip(ab); shade(x, P([[c[0] - 26 * s, c[1] - 22 * s], [c[0] - 34 * s, c[1] - 12 * s], [c[0] - 26 * s, c[1] - 2 * s], [c[0] - 18 * s, c[1] - 12 * s]], true, .3), o.mark || "#8a1a1a", { ol: 0, d: 1 }); x.restore();
  shade(x, ell(c[0] + 6 * s, c[1] - 2 * s, 14 * s, 10 * s), lt(col, .05), { d: 3 });
  for (let i = 0; i < 4; i++) { glow(x, c[0] + (10 + (i % 2) * 4) * s, c[1] - (6 - Math.floor(i / 2) * 4) * s, 5 * s, o.eye || "#ff3a2a", .7); dot(x, c[0] + (10 + (i % 2) * 4) * s, c[1] - (6 - Math.floor(i / 2) * 4) * s, 1.4 * s, o.eye || "#ff6a4a"); }
  for (const dy of [0, 4]) shade(x, P([[c[0] + 16 * s, c[1] + dy * s], [c[0] + 22 * s, c[1] + (dy + 4) * s + atk * 3], [c[0] + 16 * s, c[1] + (dy + 6) * s, 1]], true, .4), "#e0d8c0", { ol: 1, d: .5 });
  for (let i = 0; i < 4; i++) leg(i, false);
}
function toad(x, o, t) {
  const col = o.col || "#4a5a2a", s = o.s || 1, atk = o.atk || 0, br = Math.sin(t * 2.5) * 2;
  const body = P([[-34 * s, -4], [-36 * s, -30 * s], [-14 * s, -52 * s - br], [16 * s, -50 * s - br], [36 * s, -30 * s], [38 * s, -10 * s], [20 * s, -2], [-10 * s, 0]], true, .55);
  shade(x, ell(-22 * s, -8, 16 * s, 9 * s), dk(col, .3), { d: 2 });
  shade(x, body, col, { grad: lgrad(x, 0, -52 * s, 0, 0, [[0, lt(col, .1)], [1, dk(col, .35)]]), d: 6 });
  x.save(); x.clip(body); shade(x, ell(14 * s, -12 * s, 24 * s, 14 * s), o.belly || "#a8a060", { ol: 0, d: 2 }); for (let i = 0; i < 12; i++) { const px = -28 * s + (i * 17 % 50) * s, py = -44 * s + (i * 29 % 30) * s; shade(x, circ(px, py, 3 * s), dk(col, .15), { ol: .8, d: .8 }); } x.restore();
  line(x, [[12 * s, -26 * s], [38 * s, -22 * s + atk * 6]], 2.4, INK, true);
  if (atk > .2) { line(x, [[36 * s, -22 * s], [36 * s + atk * 70 * s, -24 * s]], 6 * s, INK); line(x, [[36 * s, -22 * s], [36 * s + atk * 70 * s, -24 * s]], 4 * s, "#c05a6a"); }
  for (const dx of [-2, 12]) { shade(x, circ(dx * s, -48 * s - br, 8 * s), col, { d: 2 }); glow(x, dx * s + 2, -49 * s - br, 7 * s, o.eye || "#e0c040", .7); shade(x, ell(dx * s + 2, -49 * s - br, 4 * s, 3.4 * s), o.eye || "#e0c040", { ol: 1, d: .5, hi: .6 }); line(x, [[dx * s - 1, -49 * s - br], [dx * s + 5, -49 * s - br]], 1.4, INK); }
  shade(x, P([[20 * s, -16 * s], [32 * s, -10 * s], [34 * s, -2, 1], [18 * s, -2, 1]], true, .4), col, { d: 2 });
  if (o.crown) shade(x, poly([[-6 * s, -56 * s], [-4 * s, -66 * s], [0, -59 * s], [4 * s, -68 * s], [8 * s, -59 * s], [12 * s, -66 * s], [14 * s, -55 * s]]), MAT.gold, { d: 1.2 });
}
function leech(x, o, t) {
  const col = o.col || "#3a2a2a", s = o.s || 1, atk = o.atk || 0;
  const pts = []; for (let i = 0; i <= 8; i++) { const k = i / 8; pts.push([Math.sin(k * 3 + t * 2) * 10 * s - 20 * s + k * 26 * s + atk * k * 20, -k * 90 * s]); }
  for (let i = 0; i < pts.length - 1; i++) { const w = (22 - Math.abs(i - 3.5) * 2.6) * s; shade(x, seg(pts[i], pts[i + 1], w, w * .95), i % 2 ? col : lt(col, .08), { d: 3 }); }
  const h = pts[pts.length - 1];
  shade(x, ell(h[0] + 4 * s, h[1], 12 * s, 10 * s), lt(col, .1), { d: 2 });
  shade(x, circ(h[0] + 10 * s, h[1] + 1 * s, 7 * s), "#5a1a1a", { d: 1.5 });
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(x, [[h[0] + 10 * s + Math.cos(a) * 3 * s, h[1] + 1 * s + Math.sin(a) * 3 * s], [h[0] + 10 * s + Math.cos(a) * 6.5 * s, h[1] + 1 * s + Math.sin(a) * 6.5 * s]], 1.5, "#f0e8d0"); }
}
function hydra(x, o, t) {
  const col = o.col || "#2a4a3a", s = o.s || 1, atk = o.atk || 0;
  shade(x, P([[-60 * s, 0], [-56 * s, -40 * s], [-20 * s, -66 * s], [30 * s, -60 * s], [56 * s, -30 * s], [60 * s, 0, 1]], true, .55), col, { grad: lgrad(x, 0, -66 * s, 0, 0, [[0, lt(col, .1)], [1, dk(col, .4)]]), d: 6 });
  texture(x, P([[-60 * s, 0], [-56 * s, -40 * s], [-20 * s, -66 * s], [30 * s, -60 * s], [56 * s, -30 * s], [60 * s, 0, 1]], true, .55), "scales", { col });
  const heads = o.heads || 3;
  for (let i = 0; i < heads; i++) {
    const ph = t * 2 + i * 1.7, k = i - (heads - 1) / 2;
    const base = [k * 26 * s + 10 * s, -50 * s];
    const tip = [base[0] + 30 * s + Math.sin(ph) * 8 + atk * 30 * (i === 1 ? 1 : .4), base[1] - (60 + Math.abs(k) * -12) * s + Math.cos(ph) * 6 + atk * 20];
    const mid = [lerp(base[0], tip[0], .5) - 16 * s, lerp(base[1], tip[1], .5) - 6 * s];
    const c = i % 2 ? dk(col, .15) : col;
    shade(x, seg(base, mid, 20 * s, 15 * s), c, { d: 2.5 }); shade(x, seg(mid, tip, 15 * s, 12 * s), c, { d: 2 });
    const hp = P([[tip[0] - 8 * s, tip[1] + 6 * s], [tip[0] - 6 * s, tip[1] - 9 * s], [tip[0] + 10 * s, tip[1] - 8 * s], [tip[0] + 22 * s, tip[1] - 1 * s, 1], [tip[0] + 10 * s, tip[1] + 3 * s], [tip[0] + 20 * s, tip[1] + 8 * s + atk * 6, 1], [tip[0], tip[1] + 9 * s]], true, .45);
    shade(x, hp, c, { d: 2 });
    glow(x, tip[0] + 4 * s, tip[1] - 3 * s, 6 * s, o.eye || "#ffd04a", .8); dot(x, tip[0] + 4 * s, tip[1] - 3 * s, 1.6 * s, o.eye || "#ffe08a");
    for (let j = 0; j < 3; j++) shade(x, P([[tip[0] - 4 * s - j * 4 * s, tip[1] - 7 * s], [tip[0] - 10 * s - j * 4 * s, tip[1] - 16 * s, 1], [tip[0] - 2 * s - j * 4 * s, tip[1] - 6 * s]], true), dk(col, .3), { ol: 1, d: .5 });
  }
}
function ghost(x, o, t) {
  const col = o.col || "#8ab0c8", s = o.s || 1, atk = o.atk || 0, bob = Math.sin(t * 2) * 5;
  x.save(); x.globalAlpha = .85;
  const c = [atk * 20, -80 * s + bob];
  x.save(); x.globalCompositeOperation = "lighter"; glow(x, c[0], c[1], 70 * s, col, .22); x.restore();
  const sw = t * 3;
  const pts = [[c[0] - 16 * s, c[1] - 30 * s], [c[0] + 8 * s, c[1] - 36 * s], [c[0] + 22 * s, c[1] - 12 * s], [c[0] + 18 * s, c[1] + 30 * s], [c[0] + 8 * s + Math.sin(sw) * 6, c[1] + 70 * s, 1], [c[0] - 2 * s, c[1] + 56 * s], [c[0] - 12 * s + Math.sin(sw + 1) * 6, c[1] + 74 * s, 1], [c[0] - 20 * s, c[1] + 54 * s], [c[0] - 32 * s + Math.sin(sw + 2) * 6, c[1] + 64 * s, 1], [c[0] - 26 * s, c[1] + 20 * s]];
  const body = P(pts, true, .5);
  shade(x, body, dk(col, .45), { grad: lgrad(x, 0, c[1] - 30 * s, 0, c[1] + 70 * s, [[0, rgba(dk(col, .3), .95)], [1, rgba(dk(col, .6), .1)]]), olc: rgba(INK, .7), d: 4 });
  // bras griffus
  const arm = [c[0] + 18 * s + atk * 14, c[1] + 4 * s];
  shade(x, seg([c[0] + 8 * s, c[1] - 12 * s], arm, 10 * s, 6 * s), dk(col, .4), { d: 2 });
  for (let i = 0; i < 4; i++) line(x, [arm, [arm[0] + (10 + i * 2) * s, arm[1] + (-4 + i * 4) * s]], 1.6 * s, lt(col, .4));
  // capuche et visage
  shade(x, P([[c[0] - 18 * s, c[1] - 8 * s], [c[0] - 14 * s, c[1] - 34 * s], [c[0] + 6 * s, c[1] - 40 * s], [c[0] + 20 * s, c[1] - 26 * s], [c[0] + 22 * s, c[1] - 8 * s, 1], [c[0] + 8 * s, c[1] - 14 * s], [c[0] - 6 * s, c[1] - 2 * s]], true, .5), dk(col, .55), { d: 3 });
  x.fillStyle = "#000"; x.beginPath(); x.ellipse(c[0] + 10 * s, c[1] - 20 * s, 8 * s, 9 * s, 0, 0, 7); x.fill();
  for (const dx of [6, 13]) { glow(x, c[0] + dx * s, c[1] - 22 * s, 7 * s, o.eye || "#d0f0ff", .9); dot(x, c[0] + dx * s, c[1] - 22 * s, 1.8 * s, "#ffffff"); }
  x.restore();
}
function wisp(x, o, t) {
  const col = o.col || "#7ad0ff", s = o.s || 1, c = [(o.atk || 0) * 18, -60 * s + Math.sin(t * 3) * 6];
  x.save(); x.globalCompositeOperation = "lighter";
  glow(x, c[0], c[1], 46 * s, col, .4);
  for (let i = 0; i < 6; i++) { const a = t * 2 + i; glow(x, c[0] + Math.sin(a) * 6 * s, c[1] - i * 5 * s - Math.abs(Math.cos(a * 1.3)) * 6, (16 - i * 2) * s, i < 2 ? "#ffffff" : col, .55); }
  x.restore();
  for (const dx of [-4, 4]) dot(x, c[0] + dx * s + 3, c[1] - 2 * s, 2 * s, rgba(INK, .8));
  x.fillStyle = rgba(INK, .7); x.beginPath(); x.ellipse(c[0] + 3, c[1] + 5 * s, 3 * s, 2 * s, 0, 0, 7); x.fill();
}
function gargoyle(x, o, t) {
  const col = o.col || "#5a5a58", s = o.s || 1, atk = o.atk || 0;
  const c = [atk * 16, -40 * s];
  const wing = k => { const up = Math.sin(t * 2) * 4 - atk * 10; const p = P([[c[0] - 4 * s, c[1] - 20 * s], [c[0] - 20 * s, c[1] - 60 * s + up], [c[0] - 54 * s, c[1] - 70 * s + up, 1], [c[0] - 46 * s, c[1] - 50 * s + up], [c[0] - 58 * s, c[1] - 40 * s + up, 1], [c[0] - 40 * s, c[1] - 34 * s + up], [c[0] - 46 * s, c[1] - 20 * s + up, 1], [c[0] - 16 * s, c[1] - 14 * s]], true, .4); shade(x, p, k ? dk(col, .3) : col, { d: 3 }); line(x, [[c[0] - 4 * s, c[1] - 20 * s], [c[0] - 54 * s, c[1] - 70 * s + up]], 1.4, rgba(INK, .6)); };
  wing(1);
  // corps accroupi
  shade(x, seg([c[0] - 14 * s, -8], [c[0] - 4 * s, c[1] - 6 * s], 22 * s, 20 * s), dk(col, .2), { d: 2 });
  const body = P([[c[0] - 22 * s, c[1] + 18 * s], [c[0] - 18 * s, c[1] - 16 * s], [c[0] + 4 * s, c[1] - 28 * s], [c[0] + 20 * s, c[1] - 14 * s], [c[0] + 16 * s, c[1] + 14 * s], [c[0] - 4 * s, c[1] + 26 * s]], true, .5);
  shade(x, body, col, { d: 4 }); texture(x, body, "stone", {});
  shade(x, seg([c[0] + 12 * s, c[1] - 10 * s], [c[0] + 28 * s + atk * 12, c[1] + 18 * s], 10 * s, 8 * s), col, { d: 2 });
  for (let i = 0; i < 3; i++) line(x, [[c[0] + 28 * s + atk * 12, c[1] + 18 * s], [c[0] + 34 * s + atk * 12 + i * 2, c[1] + 24 * s + i * 2]], 2, dk(col, .4));
  shade(x, ell(c[0] + 8 * s, -6, 14 * s, 7 * s), dk(col, .1), { d: 2 });
  const h = [c[0] + 16 * s, c[1] - 30 * s];
  shade(x, P([[h[0] - 10 * s, h[1] + 6 * s], [h[0] - 8 * s, h[1] - 10 * s], [h[0] + 6 * s, h[1] - 12 * s], [h[0] + 16 * s, h[1] - 2 * s], [h[0] + 14 * s, h[1] + 8 * s, 1], [h[0] + 2 * s, h[1] + 10 * s]], true, .45), col, { d: 2.5 });
  for (const dx of [-6, 2]) shade(x, P([[h[0] + dx * s, h[1] - 8 * s], [h[0] + (dx - 6) * s, h[1] - 20 * s, 1], [h[0] + (dx + 4) * s, h[1] - 10 * s]], true, .3), dk(col, .25), { ol: 1, d: .6 });
  glow(x, h[0] + 7 * s, h[1] - 3 * s, 8 * s, o.eye || "#ff4a2a", .8); dot(x, h[0] + 7 * s, h[1] - 3 * s, 2 * s, o.eye || "#ff8a4a");
  for (let i = 0; i < 3; i++) shade(x, P([[h[0] + (6 + i * 3) * s, h[1] + 6 * s], [h[0] + (7 + i * 3) * s, h[1] + 10 * s, 1], [h[0] + (8 + i * 3) * s, h[1] + 6 * s]], true), "#e8e0d0", { ol: .6, flat: true });
  wing(0);
}
function horror(x, o, t) {
  const col = o.col || "#3a2a3a", s = o.s || 1, atk = o.atk || 0;
  for (let i = 0; i < 7; i++) { const a = -2.6 + i * .5, ph = t * 2 + i; const pts = []; for (let j = 0; j <= 6; j++) { const k = j / 6; pts.push([Math.cos(a) * k * 70 * s + Math.sin(ph + k * 4) * 10 * s + (a > -1.5 ? atk * k * 30 : 0), -40 * s + Math.sin(a) * k * 60 * s + Math.cos(ph + k * 3) * 6 * s]); } for (let j = 0; j < 6; j++) shade(x, seg(pts[j], pts[j + 1], (16 - j * 2.4) * s, (16 - (j + 1) * 2.4) * s), i % 2 ? col : dk(col, .2), { d: 2 }); for (let j = 1; j < 5; j++) dot(x, pts[j][0], pts[j][1] + 3 * s, 1.6 * s, "#c8a0c0"); }
  const body = P([[-36 * s, 0], [-38 * s, -40 * s], [-16 * s, -70 * s], [16 * s, -70 * s], [38 * s, -40 * s], [36 * s, 0, 1]], true, .55);
  shade(x, body, col, { grad: lgrad(x, 0, -70 * s, 0, 0, [[0, lt(col, .1)], [1, dk(col, .4)]]), d: 5 });
  shade(x, ell(10 * s, -36 * s, 16 * s, 12 * s + atk * 6), "#1a0a10", { d: 2 });
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; shade(x, P([[10 * s + Math.cos(a) * 12 * s, -36 * s + Math.sin(a) * 9 * s], [10 * s + Math.cos(a) * 6 * s, -36 * s + Math.sin(a) * 4 * s, 1], [10 * s + Math.cos(a + .3) * 12 * s, -36 * s + Math.sin(a + .3) * 9 * s]], true), "#e8e0d0", { ol: .6, flat: true }); }
  for (let i = 0; i < 4; i++) { const ex = -20 * s + i * 13 * s, ey = -58 * s + (i % 2) * 6 * s; shade(x, circ(ex, ey, 4 * s), "#e8e070", { ol: 1, d: .5 }); dot(x, ex + 1, ey, 1.8 * s, INK); }
}
function eyeBeast(x, o, t) {
  const s = o.s || 1, atk = o.atk || 0, c = [atk * 14, -70 * s + Math.sin(t * 2) * 6];
  for (let i = 0; i < 6; i++) { const a = 1 + i * .25 - .6, ph = t * 3 + i; const pts = []; for (let j = 0; j <= 5; j++) { const k = j / 5; pts.push([c[0] - 10 * s + Math.cos(a + Math.PI / 2) * 4 + Math.sin(ph + k * 3) * 8 * s, c[1] + 20 * s + k * 50 * s]); } for (let j = 0; j < 5; j++) shade(x, seg(pts[j], pts[j + 1], (8 - j * 1.3) * s, (8 - (j + 1) * 1.3) * s), "#4a2a3a", { d: 1.5 }); }
  shade(x, circ(c[0], c[1], 30 * s), "#5a3a4a", { d: 5 });
  shade(x, ell(c[0] + 6 * s, c[1], 22 * s, 16 * s * (1 - Math.max(0, Math.sin(t * .7) - .95) * 18)), "#f0e8d8", { d: 3 });
  x.save(); x.globalCompositeOperation = "lighter"; glow(x, c[0] + 10 * s, c[1], 26 * s, "#ff5a2a", .5); x.restore();
  shade(x, circ(c[0] + 10 * s + atk * 4, c[1], 9 * s), "#c02a1a", { d: 2, hi: .5 }); dot(x, c[0] + 11 * s + atk * 4, c[1], 4 * s, INK); dot(x, c[0] + 8 * s, c[1] - 4 * s, 1.6 * s, "#fff");
  for (let i = 0; i < 5; i++) line(x, [[c[0] - 14 * s + i * 2, c[1] - 12 * s + i * 6 * s], [c[0] - 6 * s + i * 2, c[1] - 8 * s + i * 5 * s]], 1, "#a02a2a");
}
function nameless(x, o, t) {
  const s = o.s || 1, atk = o.atk || 0;
  for (let i = 0; i < 9; i++) { const a = -3 + i * .45, ph = t * 1.6 + i; const pts = []; for (let j = 0; j <= 7; j++) { const k = j / 7; pts.push([Math.cos(a) * k * 110 * s + Math.sin(ph + k * 4) * 14 * s + (a > -1.4 ? atk * k * 40 : 0), -70 * s + Math.sin(a) * k * 80 * s + Math.cos(ph + k * 3) * 10 * s + 50 * s * k * k]); } for (let j = 0; j < 7; j++) shade(x, seg(pts[j], pts[j + 1], (24 - j * 3) * s, (24 - (j + 1) * 3) * s), i % 2 ? "#1e1424" : "#2a1a30", { d: 2.5 }); }
  const body = P([[-50 * s, 0], [-60 * s, -80 * s], [-30 * s, -150 * s], [20 * s, -160 * s], [56 * s, -110 * s], [50 * s, 0, 1]], true, .5);
  x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, -90 * s, 140 * s, "#8a4aff", .22); x.restore();
  shade(x, body, "#1a1220", { grad: lgrad(x, 0, -160 * s, 0, 0, [[0, "#2e2238"], [1, "#0a060e"]]), d: 6 });
  const eyes = [[10, -120, 9], [30, -96, 6], [-14, -100, 7], [16, -70, 11], [-24, -60, 5], [36, -56, 5], [-8, -136, 5], [40, -126, 4]];
  for (const [ex, ey, er] of eyes) { const op = .6 + Math.sin(t * 2 + ex) * .4; shade(x, ell(ex * s, ey * s, er * s, er * s * op), "#f0e0c0", { ol: 1.2, d: 1 }); glow(x, ex * s, ey * s, er * 2 * s, "#b06aff", .5); dot(x, ex * s + 1, ey * s, er * .45 * s * op, "#4a0a6a"); }
  for (let i = 0; i < 7; i++) shade(x, P([[-30 * s + i * 10 * s, -150 * s + Math.abs(i - 3) * 4 * s], [-28 * s + i * 10 * s, -186 * s + Math.abs(i - 3) * 8 * s, 1], [-24 * s + i * 10 * s, -150 * s + Math.abs(i - 3) * 4 * s]], true), "#3a2a40", { d: 1 });
}
function golemExtra(x, S, sp, t) { if (!sp.stone) return; }

// décors communs aux humanoïdes : ailes, queue, braises, nœud coulant, chaînes, ronces, lianes
function monExtrasBack(x, S, sp, t) {
  if (sp.wings) { const up = Math.sin(t * 6) * 10; for (const k of [1, 0]) { const b = S.shB, c = k ? dk(sp.wings, .3) : sp.wings; const p = P([[b[0] + 2, b[1] + 6], [b[0] - 18, b[1] - 28 + up], [b[0] - 44, b[1] - 34 + up * 1.3, 1], [b[0] - 36, b[1] - 20 + up], [b[0] - 44, b[1] - 10 + up, 1], [b[0] - 26, b[1] - 4 + up * .6], [b[0] - 30, b[1] + 6 + up * .5, 1], [b[0] - 10, b[1] + 12]], true, .4); x.save(); if (!k) x.translate(6, 0); shade(x, p, c, { d: 2.5 }); x.restore(); } }
  if (sp.tail) { const sw = Math.sin(t * 3) * 5; line(x, [S.hip, [S.hip[0] - 18, S.hip[1] + 8 + sw], [S.hip[0] - 30, S.hip[1] - 4 + sw], [S.hip[0] - 36, S.hip[1] - 14]], 4.5, INK, true); line(x, [S.hip, [S.hip[0] - 18, S.hip[1] + 8 + sw], [S.hip[0] - 30, S.hip[1] - 4 + sw], [S.hip[0] - 36, S.hip[1] - 14]], 2.6, sp.tail, true); shade(x, P([[S.hip[0] - 38, S.hip[1] - 12], [S.hip[0] - 40, S.hip[1] - 22, 1], [S.hip[0] - 30, S.hip[1] - 16]], true), sp.tail, { ol: 1, d: .5 }); }
  if (sp.float && sp.skirt && sp.skirt.wisp) {
    const { hip } = S; const sw = t * 2.4;
    const p = P([[hip[0] - 14, hip[1] - 8], [hip[0] + 14, hip[1] - 8], [hip[0] + 16 + Math.sin(sw) * 4, hip[1] + 40], [hip[0] + 4 + Math.sin(sw + 1) * 6, hip[1] + 78, 1], [hip[0] - 4, hip[1] + 56], [hip[0] - 14 + Math.sin(sw + 2) * 6, hip[1] + 84, 1], [hip[0] - 20, hip[1] + 40]], true, .5);
    shade(x, p, sp.skirt.col, { grad: lgrad(x, 0, hip[1], 0, hip[1] + 84, [[0, sp.skirt.col], [1, rgba(sp.skirt.col, 0)]]), olc: rgba(INK, .5) });
    if (sp.skirt.tentacles) for (let i = 0; i < 5; i++) { const ph = t * 2 + i; const pts = []; for (let j = 0; j <= 5; j++) { const k = j / 5; pts.push([hip[0] - 20 + i * 10 + Math.sin(ph + k * 3) * 8, hip[1] + 20 + k * 70]); } for (let j = 0; j < 5; j++) shade(x, seg(pts[j], pts[j + 1], 9 - j * 1.4, 9 - (j + 1) * 1.4), "#2a4a48", { d: 1.5 }); }
  }
}
function monExtrasFront(x, S, sp, t) {
  if (sp.noose) { const h = S.head; line(x, [[h[0] - 4, h[1] + 12], [h[0] + 4, h[1] + 10]], 3, MAT.rope); line(x, [[h[0] - 2, h[1] + 11], [h[0] - 6, h[1] - 60]], 2.4, INK); line(x, [[h[0] - 2, h[1] + 11], [h[0] - 6, h[1] - 60]], 1.4, MAT.rope); }
  if (sp.embers) { x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 6; i++) { const k = ((t * .4 + i / 6) % 1); glow(x, S.hip[0] - 14 + i * 6 + Math.sin(t * 2 + i) * 6, S.hip[1] - k * 120, 4, "#ff8a3a", (1 - k) * .8); } x.restore(); }
  if (sp.sores) for (let i = 0; i < 4; i++) { const p = lerp2(S.neck, S.hip, .2 + i * .2); glow(x, p[0] + 6 - i * 3, p[1], 4, "#c8e05a", .6); dot(x, p[0] + 6 - i * 3, p[1], 1.6, "#a8c03a"); }
  if (sp.chains) { line(x, [S.haB, [S.haB[0] - 8, S.haB[1] + 20], [S.haB[0] - 4, S.haB[1] + 36]], 3, INK, true); for (let i = 0; i < 6; i++) { const p = lerp2(S.haB, [S.haB[0] - 4, S.haB[1] + 36], i / 6); x.strokeStyle = MAT.iron; x.lineWidth = 1.4; x.strokeRect(p[0] - 2, p[1] - 3, 4, 6); } }
  if (sp.vines) for (let i = 0; i < 3; i++) { const a = i ? S.haF : S.haB; line(x, [a, [a[0] + 10, a[1] + 20 + i * 6], [a[0] + 4, a[1] + 40]], 3.4, INK, true); line(x, [a, [a[0] + 10, a[1] + 20 + i * 6], [a[0] + 4, a[1] + 40]], 2, "#3a4a1a", true); }
  if (sp.claws) for (const ha of [S.haF, S.haB]) for (let i = 0; i < 3; i++) { line(x, [ha, [ha[0] + 7 + i, ha[1] + 3 + i * 3]], 2.4, INK); line(x, [ha, [ha[0] + 7 + i, ha[1] + 3 + i * 3]], 1.2, "#e8e0c8"); }
  if (sp.ghost) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, S.neck[0], S.neck[1] + 20, 60, sp.eyeGlow || "#a0c8e0", .18); x.restore(); }
  if (sp.vials) for (let i = 0; i < 3; i++) { const p = add2(S.hip, [-8 + i * 7, -4]); shade(x, P([[p[0] - 2, p[1] - 4], [p[0] + 2, p[1] - 4], [p[0] + 3, p[1] + 4], [p[0] - 3, p[1] + 4]]), ["#9ad04a", "#c04ac0", "#d0c04a"][i], { ol: 1, d: .4 }); }
}

// ── point d'entrée ──
const MON_SCALE = { boucher: 1, docteur: 1, mere_ronces: 1, mere_noyes: 1, roi: 1, liche: 1 };
function drawMonster(x, art, pose = {}, t = 0) {
  const M = MONSTERS[art] ? MONSTERS[art].art : art;
  const atk = pose.atk || 0, o = { atk, t };
  const fig = monFig(M);
  if (fig) {
    const p = Object.assign({}, fig.sp.pose0 || {}, pose.fig || {});
    if (atk) { p.lean = (p.lean || POSE0.lean) + atk * .2; p.hx = (p.hx || 0) + atk * 12; p.aFs = (p.aFs != null ? p.aFs : (fig.sp.stance || STANCE.masse).aFs) + atk * .6; p.wa = ((fig.sp.stance || STANCE.masse).wa || 2.5) - atk * 1.4; }
    const sp = fig.sp;
    // couches propres aux monstres : on les insère autour du dessin principal
    const S0 = skel(Object.assign({}, POSE0, sp.pose0 || {}, p), Object.assign({ h: 1, w: 1 }, fig.B, { w: (fig.B.w || 1) * (sp.bulk || 1) }));
    if (sp.ghost) x.globalAlpha = sp.ghost;
    monExtrasBack(x, S0, sp, t);
    drawFigure(x, sp, fig.B, p, t, pose);
    monExtrasFront(x, S0, sp, t);
    x.globalAlpha = 1;
    return;
  }
  switch (M) {
    case "rat": return quad(x, { len: 46, h: 22, col: "#5a4a40", head: "rat", tail: "thin", eye: "#ff4a2a", fur: 1, legW: 6, hs: .8, atk, claws: 1 }, t);
    case "loup": return quad(x, { len: 70, h: 44, col: "#2e2a2a", head: "wolf", tail: "bushy", eye: "#ffb030", fur: 1, mane: 1, atk, claws: 1 }, t);
    case "alpha": return quad(x, { len: 90, h: 58, col: "#1e1a1c", head: "wolf", tail: "bushy", eye: "#ff4a2a", fur: 1, mane: 1, atk, hs: 1.3, legW: 12, spikes: "#d8d0c0", claws: 1 }, t);
    case "charognard": return bird(x, { col: "#1a1a1e", fly: 1, eye: "#ff3a2a", beak: "#3a3a3a", atk, s: .95 }, t);
    case "araignee": return spider(x, { atk }, t);
    case "crapaud": return toad(x, { atk, col: "#3e4a24" }, t);
    case "sangsue": return leech(x, { atk }, t);
    case "hydre": return hydra(x, { atk, s: 1.05 }, t);
    case "spectre": return ghost(x, { atk }, t);
    case "follet": return wisp(x, { atk, col: "#5ac0ff" }, t);
    case "gargouille": return gargoyle(x, { atk }, t);
    case "horreur": return horror(x, { atk }, t);
    case "oeil": return eyeBeast(x, { atk }, t);
    case "sans_nom": return nameless(x, { atk, s: 1.05 }, t);
    case "necrophage": return quad(x, { len: 64, h: 34, col: "#6a7270", head: "hound", tail: null, eye: "#e8f0a0", atk, hs: 1.05, legW: 9, claws: 1, hump: 8 }, t);
  }
}
function monSprite(key, pose = {}, t = 0, sc = 1, o = {}) {
  const M = MONSTERS[key] || {}, big = (M.sz || 1) > 1;
  const W = Math.ceil((big ? 420 : 300) * sc), H = Math.ceil((big ? 420 : 320) * sc), cv = mkCanvas(W, H), x = cv.getContext("2d");
  x.save(); x.translate(W * .5, H - 22 * sc); x.scale(sc, sc); drawMonster(x, key, pose, t); x.restore();
  litPass(x, W, H, o); spritePost(cv, sc, Object.assign({ rim: "#c8a0ff" }, o));
  cv.ax = W * .5; cv.ay = H - 22 * sc; cv.sc = sc; return cv;
}
