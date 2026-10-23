/* ═══════════════════════ Pixel art : moteur, palettes ═══════════════════════
   Tout est dessiné pixel par pixel dans de petits canvas, puis agrandi sans lissage. */
function hexRgb(h) { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map(c => c + c).join(""); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgbHex(r, g, b) { return "#" + [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join(""); }
function mixc(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t); }
const dk = (c, t = .35) => mixc(c, "#000000", t), lt = (c, t = .3) => mixc(c, "#ffffff", t);
function rgba(c, a) { const [r, g, b] = hexRgb(c); return `rgba(${r},${g},${b},${a})`; }
function mkCanvas(w, h) { if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h); const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
function glow(x, px, py, r, col, a = .6) { const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, rgba(col, a)); g.addColorStop(.45, rgba(col, a * .3)); g.addColorStop(1, rgba(col, 0)); x.fillStyle = g; x.fillRect(px - r, py - r, r * 2, r * 2); }
function lgrad(x, x0, y0, x1, y1, st) { const g = x.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, c]) => g.addColorStop(o, c)); return g; }

// palette : peu de couleurs, beaucoup de nuit
const PAL = {
  ink: "#0c0807", night: "#120d0c",
  st: ["#17120f", "#231c18", "#322823", "#463932", "#5f4e44", "#7d6a5c"],
  wood: ["#2a170c", "#452712", "#66391b", "#8b5427"],
  leather: ["#2e1a0e", "#4a2b16", "#6b4022", "#8f5a30"],
  ember: ["#5a1404", "#a8300a", "#e8601a", "#ff9a3a", "#ffd27a", "#fff3c4"],
  blood: ["#3a0808", "#6e1212", "#a82020", "#d84a3a"],
  bone: ["#5e5444", "#8f8370", "#c2b69c", "#e8dfc8"],
  soul: ["#1e1238", "#3c2470", "#6e48c8", "#a888ff", "#d8c8ff"],
  frost: ["#1a2a3a", "#2e4e6a", "#5a8ab0", "#9fd0f0", "#e0f4ff"],
  moss: ["#1a2410", "#2e4018", "#4e6a22", "#86a83a", "#c8e070"],
};
const METALS = {
  acier: ["#2c3034", "#4c5359", "#7a838a", "#aeb6bc", "#e2e8ec"],
  bronze: ["#2e1e10", "#5a3a1c", "#8a5e2e", "#c08a48", "#ecc888"],
  noirci: ["#141214", "#262226", "#3c363c", "#5e565e", "#8e868e"],
};
const SKINS = [["#f4d2b0", "#dcac84", "#a8764e"], ["#e2b48a", "#c08a5e", "#8a5a36"], ["#c08a5e", "#9a6640", "#6a4024"], ["#8a5a3a", "#6a4028", "#40241a"], ["#5a3826", "#42281a", "#28160e"], ["#c8c0b0", "#9a9082", "#6a6254"]];
const HAIRS = ["#1a120c", "#3a2414", "#6a3a18", "#a8642a", "#d8b070", "#e0ddd0", "#8a1e14", "#3a3a44"];
const CLOTHS = ["#5a1a14", "#1e3a26", "#1e2a4a", "#4a2a4a", "#4a3a22", "#2a2a2e", "#6a5a3a", "#7a4a14"];
const CREST_FIELDS = ["#7a1414", "#14324a", "#1e3e1e", "#2a1838", "#a88a2a", "#1a1a1a"];
const CREST_CHARGES = ["marteau", "enclume", "flamme", "crane", "loup", "corbeau", "couronne", "etoile"];
const CREST_N = { marteau: "Marteau", enclume: "Enclume", flamme: "Flamme", crane: "Crâne", loup: "Loup", corbeau: "Corbeau", couronne: "Couronne", etoile: "Étoile" };

// ── pinceaux ──
function pixCtx(w, h) { const c = mkCanvas(w, h), g = c.getContext("2d"); g.imageSmoothingEnabled = false; return { c, g, w, h }; }
function P_(g, x, y, col) { g.fillStyle = col; g.fillRect(x | 0, y | 0, 1, 1); }
function R_(g, x, y, w, h, col) { g.fillStyle = col; g.fillRect(x | 0, y | 0, w | 0, h | 0); }
function L_(g, x0, y0, x1, y1, col, w = 1) { x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0; const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; g.fillStyle = col; for (let i = 0; i < 300; i++) { g.fillRect(x0 - (w > 1 ? 1 : 0), y0, w, w > 1 ? w : 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
function E_(g, cx, cy, rx, ry, col) { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry + .01)))); g.fillRect(cx - hw | 0, cy + y | 0, hw * 2 + 1, 1); } }
// ombrage simple : la moitié droite/basse d'une forme plus sombre
function shadeRect(g, x, y, w, h, cols) { R_(g, x, y, w, h, cols[1]); R_(g, x, y, Math.max(1, w * .35 | 0), h, cols[2]); R_(g, x + w - Math.max(1, w * .3 | 0), y, Math.max(1, w * .3 | 0), h, cols[0]); }
// contour sombre autour des pixels opaques
function outline(c, col = PAL.ink, inner) {
  const g = c.getContext("2d"), { width: w, height: h } = c, im = g.getImageData(0, 0, w, h), d = im.data, src = new Uint8ClampedArray(d);
  const [r, gg, b] = hexRgb(col); const op = (x, y) => x >= 0 && y >= 0 && x < w && y < h && src[(y * w + x) * 4 + 3] > 40;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (src[i + 3] > 40) continue; if (op(x - 1, y) || op(x + 1, y) || op(x, y - 1) || op(x, y + 1)) { d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = 255; } }
  g.putImageData(im, 0, 0); return c;
}
// version blanche d'un sprite (éclair de coup)
function whiteOf(c) { const o = mkCanvas(c.width, c.height), g = o.getContext("2d"); g.drawImage(c, 0, 0); g.globalCompositeOperation = "source-in"; g.fillStyle = "#fff4e0"; g.fillRect(0, 0, c.width, c.height); return o; }
const SPR = {};
function spr(key, w, h, fn, o = {}) { if (SPR[key]) return SPR[key]; const P0 = pixCtx(w, h); fn(P0.g, P0); if (o.outline !== false) outline(P0.c, o.ol); P0.c.ax = o.ax != null ? o.ax : w / 2; P0.c.ay = o.ay != null ? o.ay : h - 1; SPR[key] = P0.c; return P0.c; }
// dessin agrandi, pixels nets
function blit(x, c, px, py, k, flip = false, alpha = 1) {
  x.save(); x.imageSmoothingEnabled = false; x.globalAlpha = alpha;
  if (flip) { x.translate(Math.round(px), 0); x.scale(-1, 1); x.drawImage(c, Math.round(-c.ax * k), Math.round(py - c.ay * k), c.width * k, c.height * k); }
  else x.drawImage(c, Math.round(px - c.ax * k), Math.round(py - c.ay * k), c.width * k, c.height * k);
  x.restore();
}
// texte pixel lisible
const PIXFONT = '"Pixelify Sans", "Silkscreen", monospace';
