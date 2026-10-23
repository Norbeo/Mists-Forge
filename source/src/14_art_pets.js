/* ═══════════════════════ Compagnons ═══════════════════════ */
function batShape(x, c, s, t, col) {
  const f = Math.sin(t * 16 + c[0]) * 8 * s;
  for (const k of [-1, 1]) shade(x, P([[c[0], c[1]], [c[0] + k * 10 * s, c[1] - 6 * s - f], [c[0] + k * 22 * s, c[1] - 4 * s - f * 1.3, 1], [c[0] + k * 16 * s, c[1] + 2 * s - f * .5], [c[0] + k * 18 * s, c[1] + 6 * s - f * .6, 1], [c[0] + k * 6 * s, c[1] + 4 * s]], true, .4), col, { d: 1.5, ol: 1.4 });
  shade(x, ell(c[0], c[1] + 2 * s, 4 * s, 6 * s), dk(col, .1), { d: 1, ol: 1.2 });
  for (const dx of [-1.5, 1.5]) dot(x, c[0] + dx * s, c[1] - 1 * s, 1 * s, "#ff4a4a");
}
function lizard(x, o, t) {
  const col = o.col, s = o.s || 1, atk = o.atk || 0, sw = Math.sin(t * 3) * 6;
  const tail = P([[-20 * s, -14 * s], [-46 * s, -10 * s + sw * .5], [-70 * s, -4 * s + sw], [-74 * s, -2 * s + sw, 1], [-48 * s, -4 * s], [-20 * s, -6 * s]], true, .5);
  shade(x, tail, col, { d: 2 });
  for (const dx of [-14, 14]) { shade(x, seg([dx * s - 4, -12 * s], [dx * s + 2, -2], 7 * s, 5 * s), dk(col, .3), { d: 1 }); }
  const body = P([[-24 * s, -8 * s], [-18 * s, -22 * s], [10 * s, -26 * s], [24 * s, -18 * s], [22 * s, -6 * s], [-10 * s, -4 * s]], true, .5);
  shade(x, body, col, { d: 3 });
  x.save(); x.clip(body); for (let i = 0; i < 6; i++) { glow(x, -16 * s + i * 7 * s, -20 * s, 4 * s, o.spots || "#ffd04a", .8); } x.restore();
  for (const dx of [-12, 16]) { shade(x, seg([dx * s, -10 * s], [dx * s + 6, -1], 7 * s, 5 * s), col, { d: 1 }); }
  const h = [30 * s + atk * 10, -22 * s];
  shade(x, P([[h[0] - 10 * s, h[1] + 6 * s], [h[0] - 8 * s, h[1] - 6 * s], [h[0] + 8 * s, h[1] - 7 * s], [h[0] + 18 * s, h[1] - 1 * s], [h[0] + 16 * s, h[1] + 4 * s + atk * 4], [h[0] - 2 * s, h[1] + 7 * s]], true, .5), col, { d: 2 });
  glow(x, h[0] + 4 * s, h[1] - 3 * s, 6 * s, o.eye || "#ffe08a", .9); dot(x, h[0] + 4 * s, h[1] - 3 * s, 1.6 * s, "#fff4c0");
  if (o.wings) { const up = Math.sin(t * 5) * 6; for (const k of [1, 0]) shade(x, P([[-4 * s, -24 * s], [-16 * s, -50 * s + up], [-40 * s, -58 * s + up, 1], [-34 * s, -44 * s + up], [-44 * s, -36 * s + up, 1], [-26 * s, -30 * s], [-12 * s, -20 * s]], true, .4), k ? dk(o.wings, .3) : o.wings, { d: 2 }); }
  if (o.horns) for (const dx of [-4, 2]) shade(x, P([[h[0] + dx * s, h[1] - 5 * s], [h[0] + (dx - 8) * s, h[1] - 14 * s, 1], [h[0] + (dx + 3) * s, h[1] - 6 * s]], true, .3), MAT.bone, { ol: 1, d: .5 });
  if (o.fire) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, h[0] + 18 * s + atk * 20, h[1] + 2 * s, (10 + atk * 20) * s, o.fire, .6); x.restore(); }
}
function drawPet(x, id, o = {}, t = 0) {
  const evo = !!o.evo, atk = o.atk || 0, E = evo ? 1.22 : 1;
  switch (id) {
    case "loup": return quad(x, { len: 64 * E, h: 38 * E, col: evo ? "#3a3432" : "#6a625a", head: "wolf", tail: "bushy", eye: evo ? "#ff6a2a" : "#ffb030", fur: 1, mane: 1, atk, hs: .95 * E, claws: 1, spikes: evo ? "#ff8a3a" : null, ghost: evo ? "#ff6a2a" : null }, t);
    case "corbeau": return bird(x, { col: "#16161c", eye: evo ? "#c06aff" : "#ff3a2a", beak: "#2a2a2a", s: .9 * E, atk, glow: evo ? "#a06aff" : null, crest: evo ? "#2a2a3a" : null, fly: o.fly }, t);
    case "chouette": return bird(x, { col: evo ? "#f0e8d0" : "#e0dccc", chest: "#f4f0e4", type: "owl", eye: evo ? "#ffe8a0" : "#ffb030", s: 1 * E, atk, glow: evo ? "#ffe8a0" : null }, t);
    case "molosse": {
      x.save(); x.globalAlpha = .9;
      quad(x, { len: 66 * E, h: 42 * E, col: "#5a7a90", head: "hound", tail: "thin", eye: "#c8f0ff", atk, hs: 1 * E, ghost: "#8ad0ff", claws: 1 }, t);
      if (evo) { x.save(); x.translate(-10, -14); x.scale(.85, .85); quadHead(x, [52, -66], { col: "#4a6a80", head: "hound", eye: "#c8f0ff", hs: 1 }, t, atk); x.restore(); x.save(); x.translate(8, 8); quadHead(x, [58, -52], { col: "#6a8aa0", head: "hound", eye: "#c8f0ff", hs: 1 }, t, atk); x.restore(); }
      x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, -40, 70, "#7ab8e0", .15); x.restore(); x.restore(); return;
    }
    case "chat_noir": return quad(x, { len: 46 * E, h: 28 * E, col: "#141418", head: "cat", tail: "thin", eye: evo ? "#c06aff" : "#a0f04a", atk, hs: .8 * E, legW: 6, ghost: evo ? "#a06aff" : null }, t);
    case "crapaud": return toad(x, { s: .62 * E, atk, col: "#5a6a2a", crown: evo }, t);
    case "sanglier": return quad(x, { len: 66 * E, h: 40 * E, col: "#4a3a2a", head: "boar", tail: "thin", eye: "#ff5a2a", fur: 1, mane: 1, atk, hs: 1.05 * E, legW: 10, armor: evo ? "#7a8088" : "#5a5450", hump: 6 }, t);
    case "salamandre": return lizard(x, { col: evo ? "#e0501a" : "#c04a1a", spots: evo ? "#ffe08a" : "#ffb04a", s: .95 * E, atk, fire: evo ? "#ff6a1a" : (atk ? "#ff8a3a" : null) }, t);
    case "chauve_souris": { const n = evo ? 5 : 3; for (let i = 0; i < n; i++) batShape(x, [Math.sin(t * 2 + i * 2) * 20 + (i - n / 2) * 14 + atk * 30, -60 - i % 2 * 18 + Math.cos(t * 3 + i) * 8], .9 + (i % 2) * .2, t + i, evo ? "#2a1a24" : "#3a2a30"); return; }
    case "feu_follet": return wisp(x, { col: evo ? "#ffe08a" : "#7ad0ff", s: .8 * E, atk }, t);
    case "griffon": {
      const up = Math.sin(t * 4) * 6;
      for (const k of [1]) shade(x, P([[-6, -52 * E], [-22, -86 * E + up], [-58 * E, -96 * E + up, 1], [-48 * E, -76 * E + up], [-62 * E, -66 * E + up, 1], [-40, -62 * E], [-20, -48 * E]], true, .4), k ? dk("#b08a50", .3) : "#b08a50", { d: 2 });
      quad(x, { len: 62 * E, h: 40 * E, col: evo ? "#c8a060" : "#b08a50", head: "eagle", tail: "thin", eye: "#ffd04a", atk, hs: 1 * E, claws: 1 }, t);
      shade(x, P([[0, -48 * E], [-14, -80 * E + up], [-48 * E, -90 * E + up, 1], [-38 * E, -72 * E + up], [-50 * E, -62 * E + up, 1], [-28, -56 * E], [-10, -42 * E]], true, .4), evo ? "#e0c890" : "#d0b080", { d: 2 });
      if (evo) { x.save(); x.globalCompositeOperation = "lighter"; glow(x, 0, -50, 70, "#ffd27a", .2); x.restore(); }
      return;
    }
    case "drake": return lizard(x, { col: evo ? "#3a1a22" : "#4a2a3a", spots: evo ? "#ff6a2a" : "#ff8a5a", s: 1.15 * E, atk, wings: evo ? "#5a1a22" : "#5a3a4a", horns: 1, fire: evo || atk ? "#ff6a1a" : null, eye: "#ffb04a" }, t);
  }
}
// tête d'aigle pour le griffon
const _qh = quadHead;
quadHead = function (x, h, o, t, atk) {
  if (o.head !== "eagle") return _qh(x, h, o, t, atk);
  const s = o.hs || 1, col = "#e8e0d0";
  shade(x, P([[h[0] - 10 * s, h[1] + 8 * s], [h[0] - 10 * s, h[1] - 8 * s], [h[0] + 4 * s, h[1] - 11 * s], [h[0] + 12 * s, h[1] - 4 * s], [h[0] + 8 * s, h[1] + 8 * s]], true, .5), col, { d: 2.5 });
  shade(x, P([[h[0] + 8 * s, h[1] - 6 * s], [h[0] + 22 * s, h[1] - 1 * s], [h[0] + 18 * s, h[1] + 7 * s + atk * 4, 1], [h[0] + 9 * s, h[1] + 3 * s]], true, .35), "#d8a030", { d: 1.2 });
  glow(x, h[0] + 5 * s, h[1] - 4 * s, 6 * s, o.eye, .8); dot(x, h[0] + 5 * s, h[1] - 4 * s, 1.8 * s, INK);
  for (let i = 0; i < 3; i++) shade(x, P([[h[0] - 6 * s - i * 3 * s, h[1] - 6 * s], [h[0] - 16 * s - i * 4 * s, h[1] - 10 * s + i * 4 * s, 1], [h[0] - 4 * s - i * 3 * s, h[1] - 1 * s]], true, .3), col, { d: 1 });
};
function petSprite(id, o = {}, t = 0, sc = 1) {
  const W = Math.ceil(220 * sc), H = Math.ceil(200 * sc), cv = mkCanvas(W, H), x = cv.getContext("2d");
  x.save(); x.translate(W * .5, H - 16 * sc); x.scale(sc, sc); drawPet(x, id, o, t); x.restore();
  litPass(x, W, H); spritePost(cv, sc, { rim: "#ffd8a0" });
  cv.ax = W * .5; cv.ay = H - 16 * sc; cv.sc = sc; return cv;
}
