/* ═══════════════════════ Couronne de Cendres — utilitaires ═══════════════════════ */
"use strict";
const HASWIN = typeof window !== "undefined" && typeof document !== "undefined";
const SAVE_KEY = "couronne-de-cendres-v1";

// générateur pseudo-aléatoire déterministe (mulberry32)
function mkRng(seed) {
  let a = (seed >>> 0) || 1;
  const f = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  f.int = (lo, hi) => lo + Math.floor(f() * (hi - lo + 1));
  f.pick = arr => arr[Math.floor(f() * arr.length)];
  f.chance = p => f() < p;
  f.shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
  f.weighted = (items, w) => { let tot = 0; for (const it of items) tot += w(it); let r = f() * tot; for (const it of items) { r -= w(it); if (r <= 0) return it; } return items[items.length - 1]; };
  f.state = () => a; f.seed = s => { a = s >>> 0; };
  return f;
}
let RNG = mkRng(Date.now() & 0xffffffff);
const rnd = () => RNG();
const rint = (lo, hi) => RNG.int(lo, hi);
const pick = arr => RNG.pick(arr);
const chance = p => RNG.chance(p);

const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const sum = arr => arr.reduce((a, b) => a + b, 0);
const uid = (() => { let n = 0; return p => (p || "u") + (Date.now() % 1e7).toString(36) + (n++).toString(36); })();
const fmt = n => { n = Math.round(n); return n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(".", ",") + " M" : n >= 1e4 ? Math.round(n / 1000) + " k" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };
const pct = v => Math.round(v * 100) + " %";
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const deepCopy = o => JSON.parse(JSON.stringify(o));
const dayKey = (d = new Date()) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
