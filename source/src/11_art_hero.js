/* ═══════════════════════ Héros : squelette, poses et pièces d'armure ═══════════════════════
   Repère : pieds en (0,0), le héros regarde vers la droite, hauteur ≈ 190 unités. */

const POSE0 = { hx: 0, hy: 0, lean: .1, head: -.05, aFs: .35, aFe: -1.0, aBs: -.12, aBe: -.55, lFh: .42, lFk: -.52, lBh: -.4, lBk: -.06, wpn: 0, breath: 0, cape: 0 };
function mkPose(o) { return Object.assign({}, POSE0, o); }

function skel(p, B) {
  const hip = [p.hx, -88 * B.h + p.hy];
  const tl = 57 * B.h; // longueur du torse
  const neck = add2(hip, rot([0, -tl - p.breath * .8], p.lean));
  const S = { hip, neck };
  S.head = add2(neck, rot([4, -14], p.lean + p.head));
  S.shF = add2(hip, rot([9 * B.w * 1.2, -tl + 10], p.lean));
  S.shB = add2(hip, rot([-9 * B.w * 1.2, -tl + 9], p.lean));
  const ua = 27 * B.h, fa = 26 * B.h, th = 43 * B.h, sh = 42 * B.h;
  S.elF = polar(S.shF, p.aFs, ua); S.haF = polar(S.elF, p.aFs + p.aFe, fa);
  S.elB = polar(S.shB, p.aBs, ua); S.haB = polar(S.elB, p.aBs + p.aBe, fa);
  S.hjF = add2(hip, rot([6, 2], p.lean * .3)); S.hjB = add2(hip, rot([-7, 1], p.lean * .3));
  S.knF = polar(S.hjF, p.lFh, th); S.anF = polar(S.knF, p.lFh + p.lFk, sh);
  S.knB = polar(S.hjB, p.lBh, th); S.anB = polar(S.knB, p.lBh + p.lBk, sh);
  // les pieds touchent le sol
  const low = Math.max(S.anF[1], S.anB[1]); const dy = -3 - low + p.hy * 0;
  if (!p.air) for (const k of Object.keys(S)) S[k] = [S[k][0], S[k][1] + dy];
  S.lean = p.lean; S.p = p; S.B = B;
  return S;
}

// ── corps ──
function torsoPath(S, sp, extra = 0) {
  const { hip, lean, B } = S; const f = B.female, tl = 57 * B.h;
  const w = (sp.bulk || 1) * B.w * 1.28, e = extra;
  const pts = [
    [-13 * w - e, -tl + 4 - e], [-4 * w, -tl - 2 - e], [11 * w + e, -tl + 1 - e],
    [16 * w + e + (f ? 2 : 0), -tl + 16], [f ? 15 * w + e : 15 * w + e, -tl + 26], [11 * w + e, -tl + 40],
    [12.5 * w + e, -6], [13 * w + e, 3 + e], [-12 * w - e, 3 + e], [-12 * w - e, -8], [-10.5 * w - e, -tl + 38], [-14 * w - e, -tl + 18],
  ];
  return P(tx(pts, hip, lean), true, .5);
}
function bodyGrad(x, S, col) { const { hip, neck } = S; return lgrad(x, hip[0] - 18, neck[1], hip[0] + 18, hip[1], [[0, lt(col, .12)], [.5, col], [1, dk(col, .25)]]); }

// jambe : cuisse, tibia, botte
function drawLeg(x, S, side, sp) {
  if (sp.bones) return boneLimb(x, side === "F" ? S.hjF : S.hjB, side === "F" ? S.knF : S.knB, side === "F" ? S.anF : S.anB, side === "B", sp, 1);
  const hj = side === "F" ? S.hjF : S.hjB, kn = side === "F" ? S.knF : S.knB, an = side === "F" ? S.anF : S.anB;
  const back = side === "B", shadeK = back ? .22 : 0;
  const L = sp.legs || {}, Bt = sp.boots || {};
  const lc = dk(L.col || "#4a3a2a", shadeK), bc = dk(Bt.col || MAT.leather, shadeK);
  // cuisse et tibia
  shade(x, seg(hj, kn, 20 * S.B.w, 15), lc);
  shade(x, seg(kn, an, 15, 11), lc);
  if (L.type === "greave" || L.type === "plate") {
    const mc = dk(L.metal || MAT.steel, shadeK);
    shade(x, seg(lerp2(kn, an, .12), lerp2(kn, an, .92), 16, 12.5), mc, { grad: metalGrad(x, mc, kn[0] - 6, kn[1], kn[0] + 6, an[1]) });
    if (L.type === "plate") shade(x, seg(lerp2(hj, kn, .25), lerp2(hj, kn, .95), 20.5, 16), mc, { grad: metalGrad(x, mc, hj[0] - 8, hj[1], hj[0] + 8, kn[1]) });
    // genouillère
    shade(x, ell(kn[0] + 2.5, kn[1], 9, 7.5), mc);
    if (L.gold) { x.strokeStyle = MAT.gold; x.lineWidth = 1.4; x.stroke(ell(kn[0] + 2, kn[1], 4.5, 3.8)); }
  } else if (L.type === "wrap") {
    for (let i = 1; i < 5; i++) { const a = lerp2(kn, an, i / 5.5); line(x, [[a[0] - 6, a[1] - 2], [a[0] + 6, a[1] + 1]], 1.3, rgba(INK, .55)); }
  }
  // botte
  const ang = ang2(kn, an);
  const toe = [an[0] + 17, an[1] + 3], heel = [an[0] - 7, an[1] + 3];
  const top = lerp2(kn, an, Bt.high ? .45 : .72);
  let boot;
  if (Bt.type === "sabaton") boot = P([[top[0] - 8.5, top[1]], [top[0] + 8.5, top[1]], [an[0] + 8, an[1] - 4], [toe[0] + 1, an[1] - 1], [toe[0] + 2, toe[1], 1], [heel[0], heel[1], 1], [heel[0] - 1, an[1] - 6]], true);
  else if (Bt.type === "bare") boot = P([[an[0] - 5, an[1] - 6], [an[0] + 5, an[1] - 6], [toe[0] - 2, an[1]], [toe[0] - 2, toe[1], 1], [heel[0] + 1, heel[1], 1]], true);
  else boot = P([[top[0] - 8, top[1]], [top[0] + 8, top[1]], [an[0] + 7, an[1] - 3], [toe[0], an[1]], [toe[0] + 1, toe[1], 1], [heel[0], heel[1], 1], [heel[0] - 1.5, an[1] - 5]], true);
  shade(x, boot, Bt.type === "bare" ? dk(sp.skin, shadeK) : Bt.type === "sabaton" ? dk(Bt.metal || MAT.steel, shadeK) : bc, Bt.type === "sabaton" ? { grad: metalGrad(x, dk(Bt.metal || MAT.steel, shadeK), heel[0], top[1], toe[0], toe[1]) } : {});
  if (Bt.cuff) shade(x, seg([top[0] - 7.5, top[1] + 1], [top[0] + 7.5, top[1] + 1], 5, 5), dk(Bt.cuff, shadeK));
  if (Bt.type === "sabaton") for (let i = 1; i < 3; i++) { const q = lerp2([an[0] + 4, an[1] - 3], [toe[0] - 1, toe[1] - 2], i / 3); line(x, [[q[0], q[1] - 4], [q[0] + 1, q[1] + 2]], 1, rgba(INK, .6)); }
  void ang;
}
// bras : épaule, coude, main (+ manche)
function drawArm(x, S, side, sp, beforeHand) {
  if (sp.bones && !(sp.arms && sp.arms.col)) { boneLimb(x, side === "F" ? S.shF : S.shB, side === "F" ? S.elF : S.elB, side === "F" ? S.haF : S.haB, side === "B", sp, 0); if (beforeHand) beforeHand(); return; }
  const sh = side === "F" ? S.shF : S.shB, el = side === "F" ? S.elF : S.elB, ha = side === "F" ? S.haF : S.haB;
  const back = side === "B", k = back ? .25 : 0;
  const A = sp.arms || {};
  const sl = dk(A.col || sp.torso.col || sp.skin, k);
  const uw = 16.5 * S.B.w, fw = 13.5 * Math.min(1.1, S.B.w);
  if (A.bare) shade(x, seg(sh, el, uw, fw), dk(sp.skin, k)); else shade(x, seg(sh, el, uw, fw), sl);
  if (A.bareFore) shade(x, seg(el, ha, fw, 9.5), dk(sp.skin, k)); else shade(x, seg(el, ha, A.bell ? fw + 2 : fw, A.bell ? 17 : 9.5), A.foreCol ? dk(A.foreCol, k) : sl);
  if (A.chain && !A.bare) chainTex(x, seg(sh, el, 12.5, 10), dk(MAT.steel, k));
  if (A.bracer) { const mc = dk(A.bracer, k); shade(x, seg(lerp2(el, ha, .2), lerp2(el, ha, .82), 11, 9.5), mc, A.bracerMetal ? { grad: metalGrad(x, mc, el[0] - 5, el[1], el[0] + 5, ha[1]) } : {}); if (A.gold) line(x, [lerp2(el, ha, .3), lerp2(el, ha, .3)].map((p, i) => [p[0] + (i ? 5 : -5), p[1]]), 1.6, MAT.gold); }
  if (A.rerebrace) { const mc = dk(A.rerebrace, k); shade(x, seg(lerp2(sh, el, .3), lerp2(sh, el, .95), 13, 11), mc, { grad: metalGrad(x, mc, sh[0] - 6, sh[1], sh[0] + 6, el[1]) }); shade(x, circ(el[0], el[1], 5.5), mc); }
  if (beforeHand) beforeHand();
  // main
  const hc = A.glove ? dk(A.glove, k) : dk(sp.skin, k);
  const fa = ang2(el, ha), m1 = polar(ha, fa, -2), m2 = polar(ha, fa, 5);
  shade(x, seg(m1, m2, 11, 10), hc, A.gloveMetal ? { grad: metalGrad(x, hc, ha[0] - 4, ha[1] - 4, ha[0] + 4, ha[1] + 4), d: 2 } : { d: 2 });
}
function chainTex(x, path, col) {
  x.save(); x.clip(path); x.strokeStyle = rgba(dk(col, .5), .5); x.lineWidth = .8;
  const b = 60; for (let yy = -b; yy < b; yy += 3) { x.beginPath(); for (let xx = -b; xx < b; xx += 3) { x.moveTo(xx, yy); x.arc(xx + 1.5, yy, 1.5, Math.PI, 0); } }
  x.restore();
}
// matières du torse
function drawTorso(x, S, sp) {
  if (sp.bones && sp.torso.mat === "bones") return boneTorso(x, S, sp);
  const T = sp.torso, { hip, neck, lean } = S, tl = 60 * S.B.h;
  const path = torsoPath(S, sp);
  const mat = T.mat;
  if (mat === "bare") { shade(x, path, sp.skin, { grad: bodyGrad(x, S, sp.skin) }); muscles(x, S, sp); }
  else if (mat === "plate") {
    const c = T.col; shade(x, path, c, { grad: metalGrad(x, c, hip[0] - 16, neck[1], hip[0] + 16, hip[1]), d: 4 });
    // plastron : arête centrale et lames du ventre
    const pc = tx([[4, -tl + 6], [9, -tl + 26], [6, -tl + 42]], hip, lean); line(x, pc, 1.2, rgba(lt(c, .6), .7), true);
    for (let i = 0; i < 3; i++) { const yy = -tl + 44 + i * 6; line(x, tx([[-11, yy + 1], [0, yy + 2.5], [12, yy]], hip, lean), 1.3, rgba(INK, .7), true); }
    if (T.trim) { x.save(); x.clip(path); x.strokeStyle = T.trim; x.lineWidth = 2.2; x.stroke(torsoPath(S, sp, -2)); x.restore(); }
  } else if (mat === "chain") { shade(x, path, T.col); chainTex(x, path, T.col); }
  else if (mat === "gambeson" || mat === "brig") {
    shade(x, path, T.col, { grad: bodyGrad(x, S, T.col) });
    x.save(); x.clip(path);
    for (let i = -3; i < 6; i++) line(x, tx([[-16 + i * 6, -tl], [-16 + i * 6 + 2, 4]], hip, lean), 1, rgba(INK, .35));
    if (mat === "brig") for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const p = tx([[-8 + j * 6, -tl + 12 + i * 8]], hip, lean)[0]; dot(x, p[0], p[1], 1.2, T.stud || MAT.brass); }
    x.restore(); x.lineWidth = ART.ol; x.strokeStyle = INK; x.stroke(path);
  } else if (mat === "leather") {
    shade(x, path, T.col, { grad: bodyGrad(x, S, T.col) });
    x.save(); x.clip(path); line(x, tx([[-12, -tl + 8], [12, -tl + 34]], hip, lean), 4, rgba(dk(T.col, .5), .8)); line(x, tx([[-12, -tl + 8], [12, -tl + 34]], hip, lean), 1, rgba(lt(T.col, .4), .5));
    if (T.buckle) { const p = tx([[2, -tl + 22]], hip, lean)[0]; shade(x, poly([[p[0] - 2.5, p[1] - 2.5], [p[0] + 2.5, p[1] - 2.5], [p[0] + 2.5, p[1] + 2.5], [p[0] - 2.5, p[1] + 2.5]]), T.buckle, { ol: 1 }); }
    x.restore();
  } else { // tissu, robe
    shade(x, path, T.col, { grad: bodyGrad(x, S, T.col) });
    x.save(); x.clip(path); for (let i = 0; i < 3; i++) line(x, tx([[-6 + i * 7, -tl + 10], [-8 + i * 8, -6]], hip, lean), 1.1, rgba(INK, .28), true); x.restore();
  }
  // col, encolure
  if (T.collar) { const c = tx([[-11, -tl + 2], [0, -tl - 5], [11, -tl + 1], [5, -tl + 9], [-6, -tl + 9]], hip, lean); shade(x, P(c), T.collar); }
  if (T.cross) { const c = tx([[2, -tl + 14]], hip, lean)[0]; x.save(); x.translate(c[0], c[1]); x.rotate(lean); shade(x, poly([[-2.2, -9], [2.2, -9], [2.2, -3], [7, -3], [7, 1], [2.2, 1], [2.2, 12], [-2.2, 12], [-2.2, 1], [-7, 1], [-7, -3], [-2.2, -3]]), T.cross, { ol: 1.1, d: 1.5 }); x.restore(); }
  if (T.sun) { const c = tx([[2, -tl + 18]], hip, lean)[0]; glow(x, c[0], c[1], 14, T.sun, .45); shade(x, circ(c[0], c[1], 5), T.sun, { ol: 1.2 }); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(x, [[c[0] + Math.cos(a) * 6.5, c[1] + Math.sin(a) * 6.5], [c[0] + Math.cos(a) * 9.5, c[1] + Math.sin(a) * 9.5]], 1.5, T.sun); } }
  if (T.straps) for (const s of T.straps) line(x, tx(s, hip, lean), 3.2, MAT.dleather), line(x, tx(s, hip, lean), 1, rgba("#ffffff", .15));
  if (T.vials) for (let i = 0; i < T.vials.length; i++) { const p = tx([[-8 + i * 6, -tl + 40]], hip, lean)[0]; shade(x, P([[p[0] - 2, p[1] - 5], [p[0] + 2, p[1] - 5], [p[0] + 3, p[1] + 3], [p[0] - 3, p[1] + 3]]), T.vials[i], { ol: 1 }); glow(x, p[0], p[1], 5, T.vials[i], .4); }
  if (T.bones) for (let i = 0; i < 3; i++) { const p = tx([[-6 + i * 6, -tl + 12 + (i % 2) * 4]], hip, lean)[0]; shade(x, skullPath(p[0], p[1], 3.2), MAT.bone, { ol: 1, d: 1 }); }
  if (T.rune) { const p = tx([[1, -tl + 22]], hip, lean)[0]; rune(x, p[0], p[1], 6, T.rune); }
}
function muscles(x, S, sp) {
  const { hip, lean } = S, tl = 60 * S.B.h;
  line(x, tx([[0, -tl + 8], [2, -tl + 22], [0, -tl + 32]], hip, lean), 1, rgba(INK, .45), true);
  line(x, tx([[-6, -tl + 22], [8, -tl + 24]], hip, lean), 1, rgba(INK, .35), true);
  for (let i = 0; i < 3; i++) line(x, tx([[-4, -tl + 34 + i * 6], [6, -tl + 34 + i * 6]], hip, lean), .9, rgba(INK, .3));
}
function skullPath(cx, cy, r) { return P([[cx - r, cy - r * .2], [cx - r * .8, cy - r], [cx + r * .8, cy - r], [cx + r, cy - r * .2], [cx + r * .55, cy + r * .5], [cx + r * .4, cy + r, 1], [cx - r * .4, cy + r, 1], [cx - r * .55, cy + r * .5]]); }
function rune(x, cx, cy, r, col) {
  glow(x, cx, cy, r * 2.6, col, .5);
  x.save(); x.strokeStyle = col; x.lineWidth = 1.4; x.shadowColor = col; x.shadowBlur = 6;
  x.beginPath(); x.moveTo(cx, cy - r); x.lineTo(cx, cy + r); x.moveTo(cx - r * .6, cy - r * .4); x.lineTo(cx + r * .6, cy + r * .2); x.moveTo(cx + r * .6, cy - r * .4); x.lineTo(cx - r * .2, cy); x.stroke(); x.restore();
}
// jupes, tabards, robes : par-dessus les jambes
function drawSkirt(x, S, sp, t) {
  const K = sp.skirt; if (!K) return;
  const { hip, lean } = S; const sw = Math.sin(t * 1.7) * 1.5;
  const ank = Math.max(S.anF[1], S.anB[1]);
  const L = K.len || .5; // 0..1 : de la taille aux chevilles
  const bot = lerp(hip[1] + 4, ank - 2, L);
  const spread = 4 + L * 14 + (S.p.lFh - S.p.lBh) * 10;
  if (K.type === "robe" || K.type === "coat") {
    const pts = [[hip[0] - 13, hip[1] - 4], [hip[0] + 13, hip[1] - 4], [S.knF[0] + 8 + (K.type === "coat" ? 0 : 3), lerp(hip[1], bot, .55)], [hip[0] + spread + sw, bot, 1], [hip[0] + spread * .2, bot + 2, 1], [hip[0] - spread * .5, bot + 1, 1], [hip[0] - spread - 2 + sw, bot - 1, 1], [S.knB[0] - 9, lerp(hip[1], bot, .5)]];
    if (K.type === "coat") { pts.splice(4, 2, [hip[0] + spread * .35, bot - (bot - hip[1]) * .35, 1]); }
    const p = P(pts, true, .45);
    shade(x, p, K.col, { grad: lgrad(x, hip[0] - 20, hip[1], hip[0] + 20, bot, [[0, lt(K.col, .1)], [1, dk(K.col, .35)]]) });
    x.save(); x.clip(p); for (let i = 0; i < 4; i++) line(x, [[hip[0] - 8 + i * 6, hip[1] + 4], [hip[0] - 12 + i * 9 + sw, bot]], 1.1, rgba(INK, .32), true);
    if (K.trim) { line(x, [[hip[0] - spread - 2 + sw, bot - 3], [hip[0] + spread + sw, bot - 3]], 3, K.trim); }
    if (K.tatter) for (let i = 0; i < 5; i++) { const xx = hip[0] - spread + i * spread * .5; x.fillStyle = "rgba(0,0,0,0)"; void xx; }
    x.restore();
  } else if (K.type === "tabard") {
    const tw = K.w || 1; const p = P([[hip[0] + 1 - 8 * tw, hip[1] - 26], [hip[0] + 1 + 8 * tw, hip[1] - 26], [hip[0] + 1 + 9 * tw + sw * .5, bot, 1], [hip[0] + 1, bot + 3, 1], [hip[0] + 1 - 9 * tw + sw * .5, bot, 1]], true, .3);
    shade(x, p, K.col);
    if (K.trim) { x.save(); x.clip(p); x.strokeStyle = K.trim; x.lineWidth = 3; x.stroke(p); x.restore(); x.lineWidth = ART.ol; x.strokeStyle = INK; x.stroke(p); }
    if (K.cross) { const c = [hip[0] + 1, hip[1] - 12]; shade(x, poly([[c[0] - 1.8, c[1] - 9], [c[0] + 1.8, c[1] - 9], [c[0] + 1.8, c[1] - 3], [c[0] + 6, c[1] - 3], [c[0] + 6, c[1]], [c[0] + 1.8, c[1]], [c[0] + 1.8, c[1] + 12], [c[0] - 1.8, c[1] + 12], [c[0] - 1.8, c[1]], [c[0] - 6, c[1]], [c[0] - 6, c[1] - 3], [c[0] - 1.8, c[1] - 3]]), K.cross, { ol: 1, d: 1.2 }); }
  } else if (K.type === "tassets") {
    for (let i = 0; i < 2; i++) { const yy = hip[1] + i * 7; const p = P([[hip[0] - 14, yy - 2], [hip[0] + 14, yy - 2], [hip[0] + 15, yy + 7], [hip[0] - 15, yy + 7]], true, .2); shade(x, p, K.col, { grad: metalGrad(x, K.col, hip[0] - 14, yy, hip[0] + 14, yy + 7) }); if (K.trim) line(x, [[hip[0] - 14, yy + 6], [hip[0] + 14, yy + 6]], 1.4, K.trim); }
  } else if (K.type === "kilt" || K.type === "fur") {
    const p = P([[hip[0] - 14, hip[1] - 4], [hip[0] + 14, hip[1] - 4], [hip[0] + 16 + sw, bot, 1], [hip[0] + 8, bot - 4, 1], [hip[0] + 2, bot + 1, 1], [hip[0] - 5, bot - 4, 1], [hip[0] - 14 + sw, bot, 1]], true, .3);
    shade(x, p, K.col);
    if (K.type === "fur") { x.save(); x.clip(p); for (let i = 0; i < 9; i++) line(x, [[hip[0] - 14 + i * 3.5, hip[1]], [hip[0] - 15 + i * 3.7, bot]], .9, rgba(INK, .4)); x.restore(); }
  }
}
// ceinture
function drawBelt(x, S, sp) {
  const Bt = sp.belt; if (!Bt) return;
  const { hip, lean } = S;
  const p = P(tx([[-13, -4], [13, -6], [13.5, 0], [-12.5, 2]], hip, lean), true, .3);
  shade(x, p, Bt.col || MAT.dleather, { d: 1.5 });
  const b = tx([[6, -2]], hip, lean)[0];
  shade(x, poly([[b[0] - 3, b[1] - 3.5], [b[0] + 3, b[1] - 3.5], [b[0] + 3, b[1] + 3], [b[0] - 3, b[1] + 3]]), Bt.buckle || MAT.brass, { ol: 1, d: 1 });
  if (Bt.pouch) { const q = tx([[-8, 4]], hip, lean)[0]; shade(x, P([[q[0] - 5, q[1] - 3], [q[0] + 4, q[1] - 3], [q[0] + 4, q[1] + 6], [q[0] - 5, q[1] + 6]], true, .5), Bt.pouch, { d: 1.6 }); }
}
// cape
function drawCape(x, S, sp, t) {
  const C = sp.cape; if (!C) return;
  const { shB, shF, hip } = S; const ank = Math.max(S.anF[1], S.anB[1]);
  const len = C.len || .8, bot = lerp(hip[1], ank, len);
  const w = Math.sin(t * 1.3) * 3 + (S.p.cape || 0) * -14;
  const pts = [[shB[0] - 4, shB[1] - 3], [shF[0] + 2, shF[1] - 4], [shB[0] + 4, hip[1] - 10], [shB[0] - 6 + w * .3, bot - 4, 1], [shB[0] - 16 + w, bot + 1, 1], [shB[0] - 26 + w * 1.4, bot - 3, 1], [shB[0] - 20 + w * .7, lerp(shB[1], bot, .45)]];
  if (C.tatter) { pts.splice(4, 1, [shB[0] - 12 + w, bot - 8, 1], [shB[0] - 15 + w, bot + 3, 1], [shB[0] - 19 + w, bot - 6, 1], [shB[0] - 23 + w, bot + 2, 1]); }
  const p = P(pts, true, .4);
  shade(x, p, dk(C.col, .18), { grad: lgrad(x, shB[0], shB[1], shB[0] - 20, bot, [[0, dk(C.col, .1)], [1, dk(C.col, .5)]]) });
  if (C.trim) { x.save(); x.clip(p); x.strokeStyle = C.trim; x.lineWidth = 3; x.stroke(p); x.restore(); x.lineWidth = ART.ol; x.strokeStyle = INK; x.stroke(p); }
  x.save(); x.clip(p); for (let i = 0; i < 3; i++) line(x, [[shB[0] - 2 - i * 6, shB[1] + 6], [shB[0] - 6 - i * 7 + w * .8, bot]], 1.2, rgba(INK, .35), true); x.restore();
}
function drawMantle(x, S, sp) {
  const M = sp.mantle; if (!M) return;
  const { shB, shF, neck } = S;
  const p = P([[shB[0] - 7, shB[1] + 2], [neck[0] - 2, neck[1] - 3], [shF[0] + 6, shF[1] - 1], [shF[0] + 9, shF[1] + 13, 1], [shF[0] + 1, shF[1] + 18, 1], [neck[0] - 2, shF[1] + 16], [shB[0] - 4, shB[1] + 18, 1], [shB[0] - 10, shB[1] + 12, 1]], true, .4);
  shade(x, p, M.col);
  if (M.fur) { x.save(); x.clip(p); for (let i = 0; i < 12; i++) line(x, [[shB[0] - 8 + i * 2.2, shB[1] + 2], [shB[0] - 9 + i * 2.3, shB[1] + 18]], .9, rgba(INK, .4)); x.restore(); }
  if (M.trim) line(x, [[shB[0] - 9, shB[1] + 13], [neck[0], shF[1] + 17], [shF[0] + 8, shF[1] + 13]], 2.2, M.trim, true);
}
// épaulières
function drawPauldron(x, S, side, sp) {
  const Pd = sp.shoulders; if (!Pd) return;
  const sh = side === "F" ? S.shF : S.shB, k = side === "B" ? .25 : 0; const c = dk(Pd.col || MAT.steel, k);
  const s = (Pd.size || 1) * .86;
  if (Pd.type === "pad") { shade(x, P([[sh[0] - 9 * s, sh[1] + 2], [sh[0] - 4, sh[1] - 6 * s], [sh[0] + 8 * s, sh[1] - 4 * s], [sh[0] + 9 * s, sh[1] + 7 * s], [sh[0] - 6 * s, sh[1] + 9 * s]], true, .5), c); return; }
  if (Pd.type === "fur") { const p = P([[sh[0] - 11 * s, sh[1] + 4], [sh[0] - 6, sh[1] - 8 * s], [sh[0] + 8 * s, sh[1] - 7 * s], [sh[0] + 12 * s, sh[1] + 6 * s, 1], [sh[0] + 6, sh[1] + 9 * s, 1], [sh[0], sh[1] + 6 * s, 1], [sh[0] - 6, sh[1] + 10 * s, 1]], true, .5); shade(x, p, c); x.save(); x.clip(p); for (let i = 0; i < 8; i++) line(x, [[sh[0] - 10 + i * 3, sh[1] - 6], [sh[0] - 11 + i * 3.2, sh[1] + 10]], .9, rgba(INK, .45)); x.restore(); return; }
  if (Pd.type === "bone") { shade(x, P([[sh[0] - 9 * s, sh[1] + 4], [sh[0] - 3, sh[1] - 7 * s], [sh[0] + 9 * s, sh[1] - 3 * s], [sh[0] + 8 * s, sh[1] + 8 * s], [sh[0] - 5 * s, sh[1] + 10 * s]], true, .5), dk(MAT.dleather, k)); shade(x, skullPath(sh[0] + 1, sh[1] - 1, 6.5 * s), dk(MAT.bone, k), { d: 2 }); dot(x, sh[0] - 1.5, sh[1] - 1.5, 1.4, INK); dot(x, sh[0] + 3, sh[1] - 1.5, 1.4, INK); return; }
  // plaques (2 à 3 lames)
  const lames = Pd.type === "ornate" ? 3 : 2;
  for (let i = lames - 1; i >= 0; i--) {
    const yy = sh[1] - 6 * s + i * 5.5 * s;
    const p = P([[sh[0] - 11 * s, yy + 5 * s], [sh[0] - 6 * s, yy - 4 * s], [sh[0] + 4 * s, yy - 6 * s], [sh[0] + 12 * s, yy + 1 * s], [sh[0] + 11 * s, yy + 8 * s, 1], [sh[0] - 10 * s, yy + 10 * s, 1]], true, .5);
    shade(x, p, c, { grad: metalGrad(x, c, sh[0] - 10, yy - 6, sh[0] + 10, yy + 10), d: 2.6 });
    if (Pd.trim) line(x, [[sh[0] - 10 * s, yy + 8.5 * s], [sh[0] + 11 * s, yy + 6.5 * s]], 1.5, dk(Pd.trim, k));
  }
  if (Pd.spike) { shade(x, P([[sh[0] - 2, sh[1] - 8 * s], [sh[0] + 3, sh[1] - 22 * s, 1], [sh[0] + 6, sh[1] - 8 * s]], true), dk(MAT.dsteel, k), { d: 1.5 }); }
  if (Pd.gem) { glow(x, sh[0] + 1, sh[1] - 2, 8, Pd.gem, .5); shade(x, circ(sh[0] + 1, sh[1] - 2, 2.6), Pd.gem, { ol: 1, d: 1 }); }
}
// ── tête ──
function drawHead(x, S, sp, t, evt) {
  const H = S.head, k = sp.headgear || {};
  const skin = sp.skin, f = S.B.female;
  const r = 13.5;
  const hx = H[0], hy = H[1];
  if (MON_HEAD[k.type] && k.full) { MON_HEAD[k.type](x, hx, hy, 13.5, k, sp, t, S); return; }
  // cheveux arrière (longs)
  const hairCol = sp.hairCol;
  const covered = ["greathelm", "crusader", "skullhelm", "hood", "cowl", "bearhood", "sallet_c"].includes(k.type);
  if (!covered && sp.hair >= 3 && k.type !== "kettle_c") hairBack(x, hx, hy, r, sp.hair, hairCol, t);
  // cou
  shade(x, seg([S.neck[0] - 1, S.neck[1] + 4], [hx - 1, hy + 6], 9, 8), dk(skin, .12), { d: 1.5 });
  // tête de profil 3/4 : crâne + mâchoire + nez
  const face = P([[hx - r, hy - 2], [hx - r * .7, hy - r], [hx + r * .4, hy - r * 1.02], [hx + r * .95, hy - r * .4], [hx + r * 1.02, hy + 1], [hx + r * 1.22, hy + 3.5, 1], [hx + r * .98, hy + 5], [hx + r * .95, hy + 8], [hx + r * .55, hy + r * 1.02], [hx - r * .1, hy + r * .9], [hx - r * .75, hy + r * .45]], true, .5);
  shade(x, face, skin, { d: 2.8, sh: .5 });
  // traits
  if (sp.undead) { glow(x, hx + 6, hy - 1, 7, sp.eyeGlow || "#7af0e0", .8); dot(x, hx + 6, hy - 1, 2.2, sp.eyeGlow || "#7af0e0"); }
  else {
    line(x, [[hx + 3, hy - 5.5], [hx + 9.5, hy - 4.6]], 1.6, dk(hairCol, .2));
    x.fillStyle = rgba(INK, .9); x.beginPath(); x.ellipse(hx + 6.8, hy - 1.4, 1.6, 2.1, 0, 0, Math.PI * 2); x.fill();
    dot(x, hx + 7.3, hy - 2.1, .6, "rgba(255,255,255,.8)");
    x.fillStyle = rgba(dk(skin, .5), .35); x.beginPath(); x.ellipse(hx + 6, hy - 1.5, 4.2, 3, 0, 0, Math.PI * 2); x.fill();
    line(x, [[hx + 8.5, hy + 7.2], [hx + 12, hy + 7]], 1.1, rgba(dk(skin, .6), .9));
    if (sp.scar >= 0) line(x, [[hx + 2, hy - 7], [hx + 5 + sp.scar, hy + 4]], 1.2, rgba("#8a2a2a", .85));
    if (sp.paint) { x.fillStyle = rgba(sp.paint, .75); x.beginPath(); x.moveTo(hx + 2, hy - 3); x.lineTo(hx + 12, hy - 2); x.lineTo(hx + 11, hy + 1); x.lineTo(hx + 2, hy + 1); x.fill(); }
    // oreille
    shade(x, ell(hx - 2, hy + 1, 2.6, 3.8), dk(skin, .08), { ol: 1.2, d: 1 });
  }
  // barbe
  if (sp.beard >= 0 && !["greathelm", "crusader", "skullhelm", "cowl"].includes(k.type)) beard(x, hx, hy, r, sp.beard, hairCol);
  // cheveux avant
  if (!covered) hairFront(x, hx, hy, r, sp.hair, hairCol, k.type);
  if (k.type) helm(x, hx, hy, r, k, sp, t);
  if (sp.halo) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, hx - 4, hy - 6, 34, sp.halo, .35); x.restore(); x.strokeStyle = rgba(sp.halo, .9); x.lineWidth = 2.2; x.beginPath(); x.ellipse(hx - 6, hy - 4, 17, 19, -.1, 0, Math.PI * 2); x.stroke(); }
}
function hairBack(x, hx, hy, r, style, col, t) {
  const sw = Math.sin(t * 1.2) * 1.2;
  const len = style === 3 ? 18 : style === 4 ? 28 : 36;
  const p = P([[hx - r * .9, hy - r * .8], [hx + r * .2, hy - r * 1.1], [hx - r * .2, hy + 4], [hx - r * .5 + sw, hy + len, 1], [hx - r * 1.2 + sw, hy + len - 3, 1], [hx - r * 1.35, hy + 4]], true, .5);
  shade(x, p, dk(col, .15));
  x.save(); x.clip(p); for (let i = 0; i < 4; i++) line(x, [[hx - r + i * 3, hy - 4], [hx - r * 1.1 + i * 3 + sw, hy + len]], .9, rgba(lt(col, .4), .35), true); x.restore();
}
function hairFront(x, hx, hy, r, style, col, cover) {
  if (cover && ["kettle", "sallet", "cap", "coif", "hat", "witch", "circlet", "mitre", "crown", "nasal", "bandana", "hood_down"].includes(cover) && style === 0) return;
  let pts;
  switch (style) {
    case 0: pts = [[hx - r * 1.02, hy], [hx - r * .9, hy - r * .8], [hx - r * .1, hy - r * 1.15], [hx + r * .8, hy - r * .75], [hx + r * .85, hy - r * .45, 1], [hx + r * .3, hy - r * .62], [hx - r * .3, hy - r * .5], [hx - r * .55, hy + 2]]; break; // court
    case 1: pts = [[hx - r * 1.05, hy + 2], [hx - r * 1.05, hy - r * .7], [hx - r * .2, hy - r * 1.25], [hx + r * .7, hy - r * 1.05], [hx + r * 1.0, hy - r * .55, 1], [hx + r * .4, hy - r * .7], [hx + r * .05, hy - r * .45, 1], [hx - r * .35, hy - r * .55], [hx - r * .6, hy + 3]]; break; // mèches
    case 2: pts = [[hx - r * .95, hy - r * .3], [hx - r * .4, hy - r * 1.05], [hx + r * .5, hy - r * 1.05], [hx + r * .75, hy - r * .7], [hx - r * .1, hy - r * .78], [hx - r * .55, hy - r * .25]]; break; // rasé sur les côtés
    case 3: pts = [[hx - r * 1.1, hy + 3], [hx - r * 1.05, hy - r * .75], [hx - r * .15, hy - r * 1.2], [hx + r * .75, hy - r * .85], [hx + r * 1.02, hy - r * .3, 1], [hx + r * .35, hy - r * .58], [hx - r * .35, hy - r * .45], [hx - r * .55, hy + 4]]; break;
    case 4: pts = [[hx - r * 1.1, hy + 5], [hx - r * 1.08, hy - r * .8], [hx - r * .1, hy - r * 1.22], [hx + r * .85, hy - r * .8], [hx + r * 1.0, hy - r * .1, 1], [hx + r * .55, hy - r * .55], [hx - r * .2, hy - r * .5], [hx - r * .5, hy + 6]]; break;
    default: pts = [[hx - r * 1.12, hy + 6], [hx - r * 1.1, hy - r * .8], [hx - r * .05, hy - r * 1.25], [hx + r * .9, hy - r * .75], [hx + r * 1.05, hy + 0, 1], [hx + r * .6, hy - r * .4], [hx + r * .1, hy - r * .62], [hx - r * .4, hy - r * .3], [hx - r * .55, hy + 8]];
  }
  const p = P(pts, true, .5); shade(x, p, col, { d: 2.2, hi: .4 });
  x.save(); x.clip(p); for (let i = 0; i < 5; i++) line(x, [[hx - r + i * 4, hy - r * 1.1], [hx - r * .9 + i * 3.5, hy + 2]], .8, rgba(lt(col, .5), .3), true); x.restore();
}
function beard(x, hx, hy, r, style, col) {
  let pts;
  if (style === 0) pts = [[hx + r * .1, hy + 2], [hx + r * .98, hy + 5], [hx + r * .9, hy + 9], [hx + r * .45, hy + r * 1.05], [hx - r * .1, hy + r * .85]]; // courte
  else if (style === 1) pts = [[hx - r * .2, hy + 1], [hx + r * 1.0, hy + 5], [hx + r * .95, hy + 13], [hx + r * .5, hy + r * 1.6, 1], [hx - r * .05, hy + r * 1.1]]; // pointue
  else if (style === 2) pts = [[hx - r * .4, hy], [hx + r * 1.05, hy + 4], [hx + r * 1.15, hy + 16], [hx + r * .6, hy + r * 2.1, 1], [hx - r * .2, hy + r * 1.5], [hx - r * .55, hy + r * .5]]; // longue
  else pts = [[hx + r * .55, hy + 5], [hx + r * 1.12, hy + 6], [hx + r * .95, hy + 9.5], [hx + r * .55, hy + 8]]; // moustache
  const p = P(pts, true, .5); shade(x, p, col, { d: 2 });
  x.save(); x.clip(p); for (let i = 0; i < 4; i++) line(x, [[hx + i * 3, hy + 3], [hx + i * 3.2, hy + 24]], .8, rgba(lt(col, .4), .3)); x.restore();
}
// casques, capuches, chapeaux
function helm(x, hx, hy, r, k, sp, t) {
  const c = k.col || MAT.steel, mg = (a, b, c2, d) => metalGrad(x, c, a, b, c2, d);
  const crest = () => { if (k.crest) { const p = P([[hx - r * .2, hy - r * 1.15], [hx + r * .6, hy - r * 1.05], [hx + r * .3, hy - r * 1.9, 1], [hx - r * .5, hy - r * 2.2, 1], [hx - r * 1.4, hy - r * 1.4, 1]], true, .5); shade(x, p, k.crest); } if (k.plume) { const sw = Math.sin(t * 2) * 2; const p = P([[hx - r * .4, hy - r * 1.05], [hx - r * .1, hy - r * 1.6], [hx - r * 1.2 + sw, hy - r * 2.3], [hx - r * 2.4 + sw * 1.5, hy - r * 1.6, 1], [hx - r * 1.3 + sw, hy - r * 1.5], [hx - r * .9, hy - r * 1.0]], true, .5); shade(x, p, k.plume); } if (k.crown) { const p = poly([[hx - r * .9, hy - r * .95], [hx - r * .75, hy - r * 1.55], [hx - r * .4, hy - r * 1.15], [hx - r * .05, hy - r * 1.7], [hx + r * .3, hy - r * 1.15], [hx + r * .65, hy - r * 1.5], [hx + r * .8, hy - r * .9]]); shade(x, p, k.crown, { d: 1.8 }); if (k.gem) { dot(x, hx - r * .05, hy - r * 1.15, 2, k.gem); glow(x, hx - r * .05, hy - r * 1.15, 8, k.gem, .5); } } };
  switch (k.type) {
    case "greathelm": case "crusader": {
      const p = P([[hx - r * 1.08, hy + r * .9, 1], [hx - r * 1.12, hy - r * .5], [hx - r * .6, hy - r * 1.18], [hx + r * .5, hy - r * 1.15], [hx + r * 1.15, hy - r * .55], [hx + r * 1.25, hy + r * .95, 1]], true, .45);
      shade(x, p, c, { grad: mg(hx - r, hy - r, hx + r, hy + r), d: 3.5 });
      x.fillStyle = INK; x.fillRect(hx + r * .05, hy - 3.2, r * 1.2, 2.6); // fente
      if (k.type === "crusader") { x.fillRect(hx + r * .62, hy - 1, 2.4, r * .9); for (let i = 0; i < 4; i++) dot(x, hx + r * .3 + i * 2.6, hy + 7, .8, INK); }
      line(x, [[hx + r * .9, hy - r * 1.0], [hx + r * 1.0, hy + r * .9]], 1.2, rgba(lt(c, .6), .6));
      if (k.trim) { line(x, [[hx - r * 1.08, hy + r * .8], [hx + r * 1.22, hy + r * .85]], 2, k.trim); line(x, [[hx + r * .85, hy - r * 1.05], [hx + r * .95, hy + r * .85]], 2.2, k.trim); }
      crest(); break;
    }
    case "skullhelm": {
      const p = P([[hx - r * 1.1, hy + r * .9, 1], [hx - r * 1.15, hy - r * .4], [hx - r * .5, hy - r * 1.2], [hx + r * .6, hy - r * 1.1], [hx + r * 1.2, hy - r * .4], [hx + r * 1.3, hy + r * .3], [hx + r * 1.05, hy + r * 1.0, 1]], true, .45);
      shade(x, p, c, { grad: mg(hx - r, hy - r, hx + r, hy + r), d: 3.5 });
      x.fillStyle = INK; x.beginPath(); x.ellipse(hx + r * .55, hy - 1, 3.4, 2.6, 0, 0, Math.PI * 2); x.fill();
      if (sp.eyeGlow) { glow(x, hx + r * .55, hy - 1, 9, sp.eyeGlow, .9); dot(x, hx + r * .55, hy - 1, 1.6, sp.eyeGlow); }
      for (let i = 0; i < 4; i++) x.fillRect(hx + r * .35 + i * 2.6, hy + 6, 1.3, 4);
      if (k.spikes) for (let i = 0; i < 3; i++) shade(x, P([[hx - r * .7 + i * r * .55, hy - r * 1.0], [hx - r * .55 + i * r * .55, hy - r * 1.75, 1], [hx - r * .35 + i * r * .55, hy - r * 1.05]], true), MAT.dsteel, { d: 1 });
      if (k.flame) { x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 5; i++) { const fx = hx - r * .6 + i * 4, fy = hy - r * 1.1 - (Math.sin(t * 6 + i) + 1) * 4; glow(x, fx, fy, 9, k.flame, .55); } x.restore(); }
      crest(); break;
    }
    case "kettle": case "kettle_c": {
      shade(x, P([[hx - r * .95, hy - r * .2], [hx - r * .8, hy - r * 1.05], [hx + r * .1, hy - r * 1.35], [hx + r * .9, hy - r * 1.0], [hx + r * .95, hy - r * .25]], true, .5), c, { grad: mg(hx - r, hy - r, hx + r, hy) });
      shade(x, P([[hx - r * 1.55, hy - r * .1, 1], [hx + r * 1.6, hy - r * .25, 1], [hx + r * 1.3, hy + r * .1, 1], [hx - r * 1.3, hy + r * .2, 1]], true), c, { grad: mg(hx - r, hy - r * .3, hx + r, hy + r * .2), d: 1.5 });
      if (k.trim) line(x, [[hx - r * .92, hy - r * .35], [hx + r * .92, hy - r * .4]], 1.8, k.trim);
      crest(); break;
    }
    case "sallet": {
      shade(x, P([[hx - r * 1.6, hy + r * .5, 1], [hx - r * 1.05, hy - r * .4], [hx - r * .4, hy - r * 1.2], [hx + r * .6, hy - r * 1.1], [hx + r * 1.05, hy - r * .4], [hx + r * 1.0, hy - r * .1, 1], [hx - r * .7, hy + r * .2]], true, .45), c, { grad: mg(hx - r, hy - r, hx + r, hy) });
      if (k.visor) { shade(x, P([[hx + r * .2, hy - r * .45], [hx + r * 1.15, hy - r * .4], [hx + r * 1.2, hy + r * .2, 1], [hx + r * .3, hy + r * .1]], true, .3), c, { grad: mg(hx, hy - r * .5, hx + r, hy) }); x.fillStyle = INK; x.fillRect(hx + r * .3, hy - r * .2, r * .9, 1.8); }
      if (k.trim) line(x, [[hx - r * 1.5, hy + r * .45], [hx - r * .7, hy + r * .15], [hx + r, hy - r * .15]], 1.8, k.trim);
      crest(); break;
    }
    case "nasal": {
      shade(x, P([[hx - r * 1.0, hy - r * .1], [hx - r * .85, hy - r * 1.05], [hx + r * .05, hy - r * 1.4, 1], [hx + r * .95, hy - r * .95], [hx + r * 1.02, hy - r * .15]], true, .45), c, { grad: mg(hx - r, hy - r, hx + r, hy) });
      shade(x, poly([[hx + r * .78, hy - r * .3], [hx + r * 1.0, hy - r * .3], [hx + r * 1.05, hy + r * .45], [hx + r * .88, hy + r * .45]]), c, { d: 1 });
      line(x, [[hx - r * .98, hy - r * .2], [hx + r * 1.0, hy - r * .25]], 2.2, k.trim || dk(c, .3));
      crest(); break;
    }
    case "cap": case "coif": {
      const p = P([[hx - r * 1.08, hy + (k.type === "coif" ? r * .9 : 0)], [hx - r * 1.0, hy - r * .8], [hx + r * .1, hy - r * 1.2], [hx + r * .85, hy - r * .85], [hx + r * .9, hy - r * .4, 1], [hx - r * .3, hy - r * .4], ...(k.type === "coif" ? [[hx - r * .35, hy + r * .6], [hx + r * .55, hy + r * 1.1], [hx - r * .2, hy + r * 1.3, 1]] : [])], true, .5);
      shade(x, p, c); if (k.type === "coif" && k.chain) chainTex(x, p, c);
      crest(); break;
    }
    case "hood": case "cowl": case "hood_down": {
      if (k.type === "hood_down") { shade(x, P([[hx - r * 1.4, hy + r * .3], [hx - r * .4, hy + r * .9], [hx + r * .2, hy + r * 1.1], [hx - r * .6, hy + r * 1.5, 1], [hx - r * 1.7, hy + r * 1.2, 1]], true, .5), dk(c, .1)); break; }
      const back = P([[hx - r * 1.45, hy + r * 1.3, 1], [hx - r * 1.4, hy - r * .4], [hx - r * .6, hy - r * 1.35], [hx + r * .55, hy - r * 1.35], [hx + r * 1.25, hy - r * .55], [hx + r * 1.35, hy + r * .2, 1], [hx + r * .9, hy - r * .2], [hx + r * .15, hy - r * .55], [hx - r * .2, hy + r * .6], [hx + r * .4, hy + r * 1.35, 1]], true, .45);
      // ombre sur le visage
      x.save(); x.clip(back); x.restore();
      shade(x, back, c, { d: 3.2 });
      x.fillStyle = rgba("#000000", .45); x.beginPath(); x.ellipse(hx + r * .55, hy - r * .1, r * .55, r * .35, 0, 0, Math.PI * 2); x.fill();
      if (k.type === "cowl") { shade(x, P([[hx + r * .15, hy + r * .1], [hx + r * 1.25, hy + r * .2], [hx + r * 1.15, hy + r * .95, 1], [hx - r * .1, hy + r * 1.1, 1]], true, .4), k.mask || dk(c, .2), { d: 1.5 }); }
      if (sp.eyeGlow) { glow(x, hx + r * .55, hy - 1.5, 8, sp.eyeGlow, .8); dot(x, hx + r * .55, hy - 1.5, 1.5, sp.eyeGlow); }
      if (k.trim) line(x, [[hx + r * 1.3, hy + r * .15], [hx + r * .6, hy - r * 1.3]], 2, k.trim, true);
      crest(); break;
    }
    case "bearhood": {
      const fur = c;
      const p = P([[hx - r * 1.5, hy + r * 1.4, 1], [hx - r * 1.5, hy - r * .3], [hx - r * .8, hy - r * 1.3], [hx + r * .6, hy - r * 1.45], [hx + r * 1.6, hy - r * .9], [hx + r * 1.95, hy - r * .45, 1], [hx + r * 1.2, hy - r * .35], [hx + r * .2, hy - r * .5], [hx - r * .3, hy + r * .6]], true, .45);
      shade(x, p, fur); x.save(); x.clip(p); for (let i = 0; i < 10; i++) line(x, [[hx - r * 1.4 + i * 3, hy - r * 1.2], [hx - r * 1.5 + i * 3, hy + r]], .9, rgba(INK, .4)); x.restore();
      shade(x, circ(hx - r * .3, hy - r * 1.25, 3.5), dk(fur, .1), { d: 1 });
      dot(x, hx + r * .95, hy - r * .8, 1.6, sp.eyeGlow || "#1a0a0a");
      for (let i = 0; i < 3; i++) shade(x, P([[hx + r * (1.05 + i * .25), hy - r * .4], [hx + r * (1.15 + i * .25), hy - r * .05, 1], [hx + r * (1.25 + i * .25), hy - r * .4]], true), MAT.bone, { ol: .8, d: .5 });
      break;
    }
    case "hat": {
      const sw = Math.sin(t * 2) * 1.5;
      shade(x, P([[hx - r * .9, hy - r * .55], [hx - r * .7, hy - r * 1.35], [hx + r * .3, hy - r * 1.55], [hx + r * .95, hy - r * 1.1], [hx + r * .9, hy - r * .55]], true, .5), c);
      shade(x, P([[hx - r * 1.9, hy - r * .35, 1], [hx - r * .4, hy - r * .8], [hx + r * 1.7, hy - r * .85, 1], [hx + r * .6, hy - r * .42], [hx - r * 1.1, hy - r * .2]], true, .5), dk(c, .1));
      if (k.band) line(x, [[hx - r * .85, hy - r * .75], [hx + r * .88, hy - r * .78]], 2.2, k.band);
      if (k.plume) { const p = P([[hx - r * .6, hy - r * .95], [hx - r * 1.6 + sw, hy - r * 2.2], [hx - r * 2.9 + sw * 2, hy - r * 2.4, 1], [hx - r * 1.8 + sw, hy - r * 1.6], [hx - r * .9, hy - r * .75]], true, .5); shade(x, p, k.plume); x.save(); x.clip(p); for (let i = 0; i < 6; i++) line(x, [[hx - r * .8 - i * 3, hy - r * 1.1 - i * 1.5], [hx - r * 1.2 - i * 3.5, hy - r * 1.6 - i * 1.6]], .8, rgba(INK, .4)); x.restore(); }
      if (k.mask) shade(x, P([[hx + r * .25, hy - r * .4], [hx + r * 1.1, hy - r * .4], [hx + r * 1.0, hy + r * .05, 1], [hx + r * .35, hy + r * .05]], true, .3), k.mask, { d: 1, ol: 1.2 });
      break;
    }
    case "witch": {
      const sw = Math.sin(t * 1.4) * 2;
      shade(x, P([[hx - r * 1.0, hy - r * .55], [hx - r * .4, hy - r * 1.3], [hx - r * .3 + sw * .3, hy - r * 2.2], [hx - r * 1.4 + sw, hy - r * 3.0, 1], [hx + r * .3, hy - r * 2.1], [hx + r * .85, hy - r * 1.1], [hx + r * .95, hy - r * .55]], true, .45), c);
      shade(x, P([[hx - r * 2.0, hy - r * .35, 1], [hx - r * .2, hy - r * .85], [hx + r * 1.9, hy - r * .55, 1], [hx + r * .4, hy - r * .3]], true, .5), dk(c, .12));
      if (k.band) line(x, [[hx - r * .95, hy - r * .75], [hx + r * .9, hy - r * .8]], 2.4, k.band);
      if (k.charms) for (let i = 0; i < 3; i++) { const cx = hx - r * 1.5 + i * r * 1.2, cy = hy - r * .3; line(x, [[cx, cy], [cx + 1, cy + 7 + i * 2]], .8, MAT.rope); shade(x, circ(cx + 1, cy + 8 + i * 2, 1.8), k.charms[i % k.charms.length], { ol: .8, d: .6 }); }
      break;
    }
    case "flowers": case "twigs": {
      for (let i = 0; i < 7; i++) { const a = -2.6 + i * .42, px = hx - 1 + Math.cos(a) * r * 1.02, py = hy - 3 + Math.sin(a) * r * 1.0; if (k.type === "twigs") { line(x, [[px, py], [px + Math.cos(a) * 6, py + Math.sin(a) * 7 - 3]], 1.6, MAT.dwood); } shade(x, circ(px, py, k.type === "flowers" ? 2.6 : 1.6), k.type === "flowers" ? [k.col, "#e8e0c0", k.col2 || "#c04a6a"][i % 3] : "#5a7a3a", { ol: .9, d: .6 }); }
      if (k.glow) for (let i = 0; i < 3; i++) glow(x, hx - r + i * r, hy - r * 1.1, 9, k.glow, .4);
      break;
    }
    case "circlet": { line(x, [[hx - r * 1.0, hy - r * .45], [hx + r * .2, hy - r * .78], [hx + r * .92, hy - r * .62]], 2.2, k.col || MAT.gold, true); if (k.gem) { dot(x, hx + r * .55, hy - r * .72, 2, k.gem); glow(x, hx + r * .55, hy - r * .72, 7, k.gem, .5); } break; }
    case "mitre": {
      shade(x, P([[hx - r * .9, hy - r * .6], [hx - r * .65, hy - r * 1.8], [hx + r * .1, hy - r * 2.35, 1], [hx + r * .75, hy - r * 1.7], [hx + r * .9, hy - r * .65]], true, .4), c);
      line(x, [[hx + r * .1, hy - r * 2.25], [hx + r * .05, hy - r * .7]], 2.2, k.trim || MAT.gold); line(x, [[hx - r * .88, hy - r * .78], [hx + r * .88, hy - r * .82]], 2.4, k.trim || MAT.gold);
      if (k.gem) { dot(x, hx + r * .07, hy - r * 1.45, 2.2, k.gem); glow(x, hx + r * .07, hy - r * 1.45, 9, k.gem, .55); }
      break;
    }
    case "crown": { crest(); break; }
    case "bandana": { shade(x, P([[hx - r * 1.05, hy - r * .1], [hx - r * .8, hy - r * .95], [hx + r * .3, hy - r * 1.15], [hx + r * .95, hy - r * .6], [hx + r * .95, hy - r * .35, 1], [hx - r * .5, hy - r * .4], [hx - r * 1.4, hy + r * .5, 1]], true, .5), c); break; }
    default: if (MON_HEAD[k.type]) MON_HEAD[k.type](x, hx, hy, r, k, sp, t); break;
    case "flamecrown": { x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 6; i++) { const fx = hx - r * .8 + i * 4.2, fy = hy - r * 1.0 - (Math.sin(t * 7 + i * 1.3) + 1.4) * 4; glow(x, fx, fy, 10, "#ff7a2a", .6); glow(x, fx, fy + 2, 5, "#ffe08a", .7); } x.restore(); break; }
  }
}
