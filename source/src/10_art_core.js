/* ═══════════════════════ Rendu : encre et ombres portées (style gothique) ═══════════════════════
   Chaque forme est remplie, ombrée de l'intérieur (lumière en haut à gauche), éclairée sur son bord, puis cerclée d'encre. */
const INK = "#0b0807";
const LIGHT = { x: -.6, y: -.8 };
const ART = { ol: 2.2, quality: 1, hatch: true };

function hexRgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbHex(r, g, b) { return "#" + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join(""); }
function mixc(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
const dk = (c, t = .35) => mixc(c, "#000000", t);
const lt = (c, t = .3) => mixc(c, "#ffffff", t);
const warm = (c, t = .2) => mixc(c, "#ffb060", t);
const cool = (c, t = .2) => mixc(c, "#8ab0ff", t);
function rgba(c, a) { const [r, g, b] = hexRgb(c); return `rgba(${r},${g},${b},${a})`; }

// chemin lissé (Catmull-Rom) ; un point [x, y, 1] reste anguleux
function P(pts, closed = true, tension = .5) {
  const p = new Path2D(), n = pts.length;
  if (n < 2) return p;
  const get = i => closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  p.moveTo(pts[0][0], pts[0][1]);
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    if (p1[2] || p2[2]) {
      if (p1[2] && p2[2]) { p.lineTo(p2[0], p2[1]); continue; }
      const t1 = p1[2] ? 0 : tension, t2 = p2[2] ? 0 : tension;
      p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * t1 / 3, p1[1] + (p2[1] - p0[1]) * t1 / 3, p2[0] - (p3[0] - p1[0]) * t2 / 3, p2[1] - (p3[1] - p1[1]) * t2 / 3, p2[0], p2[1]);
    } else p.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3, p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3, p2[0], p2[1]);
  }
  if (closed) p.closePath();
  return p;
}
// polygone strict
function poly(pts) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
function circ(x, y, r) { const p = new Path2D(); p.arc(x, y, r, 0, Math.PI * 2); return p; }
function ell(x, y, rx, ry, rot = 0) { const p = new Path2D(); p.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); return p; }
// segment effilé entre deux points (membre)
function seg(a, b, w1, w2, cap = 1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, ux = dx / L, uy = dy / L;
  const h1 = w1 / 2, h2 = w2 / 2;
  return P([[a[0] + nx * h1, a[1] + ny * h1], [b[0] + nx * h2, b[1] + ny * h2], [b[0] + ux * h2 * cap, b[1] + uy * h2 * cap], [b[0] - nx * h2, b[1] - ny * h2], [a[0] - nx * h1, a[1] - ny * h1], [a[0] - ux * h1 * cap, a[1] - uy * h1 * cap]], true, .55);
}
// vecteur écran -> repère local (pour garder la lumière fixe même si le dessin est retourné)
function localVec(x, vx, vy) {
  const m = x.getTransform(); const det = m.a * m.d - m.b * m.c || 1;
  return [(m.d * vx - m.c * vy) / det, (-m.b * vx + m.a * vy) / det];
}
// remplissage ombré : forme principale de tout le moteur graphique
function shade(x, path, col, o = {}) {
  const s = o.scale || 1, d = (o.d || 3.8) * s;
  x.fillStyle = o.grad || col; x.fill(path);
  if (o.flat !== true) {
    const [sx, sy] = localVec(x, LIGHT.x * d, LIGHT.y * d);
    const big = 4000;
    x.save(); x.clip(path);
    // ombre propre : la forme moins elle-même décalée vers la lumière
    x.fillStyle = o.shc || rgba(dk(col, .6), o.sh == null ? .62 : o.sh);
    const q = new Path2D(); q.rect(-big, -big, big * 2, big * 2);
    const m = new DOMMatrix([1, 0, 0, 1, sx, sy]); q.addPath(path, m);
    x.fill(q, "evenodd");
    // hachures d'encre dans l'ombre (gravure)
    if (ART.hatch && o.hatch !== 0) {
      x.save(); x.clip(q, "evenodd"); x.strokeStyle = rgba(INK, o.hatchA || .32); x.lineWidth = .7 * s;
      const bb = 140; x.beginPath(); for (let i = -bb; i < bb; i += 2.6 * s) { x.moveTo(i - bb, bb); x.lineTo(i + bb, -bb); } x.stroke(); x.restore();
    }
    // reflet sur le bord éclairé
    if (o.hi !== 0) {
      x.fillStyle = o.hic || rgba(lt(col, .55), o.hi == null ? .32 : o.hi);
      const q2 = new Path2D(); q2.rect(-big, -big, big * 2, big * 2);
      q2.addPath(path, new DOMMatrix([1, 0, 0, 1, -sx * .45, -sy * .45])); x.fill(q2, "evenodd");
    }
    if (o.after) o.after(x);
    x.restore();
  }
  if (o.ol !== 0) { x.lineWidth = (o.ol || ART.ol) * s; x.strokeStyle = o.olc || INK; x.lineJoin = "round"; x.lineCap = "round"; x.stroke(path); }
}
function line(x, pts, w, col, smooth = false) { x.lineWidth = w; x.strokeStyle = col; x.lineCap = "round"; x.lineJoin = "round"; x.stroke(smooth ? P(pts, false) : (() => { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); return p; })()); }
function dot(x, px, py, r, col) { x.fillStyle = col; x.beginPath(); x.arc(px, py, r, 0, Math.PI * 2); x.fill(); }
function glow(x, px, py, r, col, a = .6) { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(.4, rgba(col, a * .35)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2); }
function lgrad(x, x0, y0, x1, y1, stops) { const g = x.createLinearGradient(x0, y0, x1, y1); stops.forEach((c, i) => g.addColorStop(Array.isArray(c) ? c[0] : i / (stops.length - 1), Array.isArray(c) ? c[1] : c)); return g; }
// rotation d'un point autour d'un centre
const rot = (p, a, c = [0, 0]) => { const s = Math.sin(a), co = Math.cos(a), dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * co - dy * s, c[1] + dx * s + dy * co]; };
// direction « vers le bas » tournée d'un angle (0 = vers le bas, + = vers l'avant)
const polar = (o, a, L) => [o[0] + Math.sin(a) * L, o[1] + Math.cos(a) * L];
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const add2 = (a, b) => [a[0] + b[0], a[1] + b[1]];
const ang2 = (a, b) => Math.atan2(b[0] - a[0], b[1] - a[1]); // angle depuis « le bas »
// transforme une liste de points définis autour d'une origine, avec rotation
const tx = (pts, o, a = 0, sx = 1) => pts.map(p => { const r = rot([p[0] * sx, p[1]], a); return [o[0] + r[0], o[1] + r[1], p[2]]; });

// métaux et matières
const MAT = {
  iron: "#5e6468", steel: "#848d95", dsteel: "#3e4348", black: "#242428", gold: "#b88c3a", brass: "#a8823a", silver: "#aab0b8", bronze: "#9a6a3a",
  leather: "#5a3a24", dleather: "#3a2618", wood: "#6a4628", dwood: "#3e2a18", bone: "#d8ccb0", cloth: "#6a5a4a", fur: "#6a5444", rope: "#8a7450",
};
function metalGrad(x, col, x0, y0, x1, y1) { return lgrad(x, x0, y0, x1, y1, [[0, lt(col, .35)], [.45, col], [.55, dk(col, .15)], [1, dk(col, .45)]]); }
// grain de papier/pierre pour les décors
let NOISE = null;
function noisePattern(x) {
  if (NOISE) return x.createPattern(NOISE, "repeat");
  if (!HASWIN) return null;
  const c = document.createElement("canvas"); c.width = c.height = 128; const g = c.getContext("2d"); const im = g.createImageData(128, 128);
  for (let i = 0; i < im.data.length; i += 4) { const v = Math.random() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 11; }
  g.putImageData(im, 0, 0); NOISE = c; return x.createPattern(c, "repeat");
}
function mkCanvas(w, h) { if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h); const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
