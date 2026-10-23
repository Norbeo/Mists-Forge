/* ═══════════════════════ Pixel art : monstres, gardiens, compagnons ═══════════════════════
   Tous tournés vers la droite ; les pieds sur la dernière ligne utile. */
// boule ombrée : sombre en bas à droite, claire en haut à gauche
function blob(g, cx, cy, rx, ry, c) { E_(g, cx, cy, rx, ry, c[0]); E_(g, cx - 1, cy - 1, Math.max(1, rx - 1), Math.max(1, ry - 1), c[1]); if (rx > 2 && ry > 2) E_(g, cx - Math.ceil(rx / 3), cy - Math.ceil(ry / 3), Math.max(1, rx / 3 | 0), Math.max(1, ry / 3 | 0), c[2]); }
function eye(g, x, y, col = "#ff3a1a") { P_(g, x, y, col); }
const BONE = PAL.bone;
function skeleton(g, o) {
  const s = o.strike, lx = s ? 1 : 0;
  // jambes
  L_(g, 14, 22, 13, 29, BONE[1]); L_(g, 17, 22, 18, 29, BONE[2]); R_(g, 12, 29, 3, 1, BONE[1]); R_(g, 17, 29, 3, 1, BONE[2]);
  R_(g, 13, 20, 6, 2, BONE[1]); P_(g, 15, 20, BONE[2]);
  // colonne et côtes
  for (let y = 13; y < 20; y++) P_(g, 15 + lx * (y < 16 ? 1 : 0), y, BONE[2]);
  for (let y = 13; y <= 18; y += 2) { R_(g, 12 + lx, y, 7, 1, BONE[2]); P_(g, 12 + lx, y, BONE[1]); }
  // bras arrière
  L_(g, 12 + lx, 13, 10 + lx, 19, BONE[1]);
  // crâne
  const hx = 12 + lx * 2, hy = 4;
  R_(g, hx, hy, 7, 6, BONE[2]); R_(g, hx + 1, hy, 5, 1, BONE[3]); R_(g, hx + 1, hy + 6, 5, 2, BONE[1]); P_(g, hx + 2, hy + 7, BONE[0]); P_(g, hx + 4, hy + 7, BONE[0]);
  R_(g, hx + 3, hy + 2, 2, 2, "#140c0a"); R_(g, hx + 6, hy + 2, 1, 2, "#140c0a"); eye(g, hx + 4, hy + 3, o.eye || "#ff6a2a");
  if (o.hood) { R_(g, hx - 1, hy - 1, 8, 2, o.hood); R_(g, hx - 1, hy, 2, 8, o.hood); R_(g, hx - 2, hy + 3, 2, 10, dk(o.hood, .3)); P_(g, hx + 6, hy - 1, dk(o.hood, .3)); }
  if (o.helmet) { R_(g, hx - 1, hy - 2, 9, 3, "#5a4a30"); R_(g, hx, hy - 3, 7, 1, "#7a6440"); R_(g, hx + 3, hy - 5, 2, 2, "#e8dfc8"); P_(g, hx + 3, hy - 6, "#ffd27a"); }
}
function foeArt(art, strike, o = {}) {
  const k = "foe|" + art + "|" + (strike ? 1 : 0) + "|" + (o.under ? 1 : 0);
  const D = FOE_ART[art] || FOE_ART.rat;
  return spr(k, D.w, D.h, g => D.f(g, { strike, ...o }), { ax: D.ax != null ? D.ax : D.w / 2, ay: D.h - 2 });
}
const FOE_ART = {
  rat: { w: 32, h: 24, f: (g, o) => { const s = o.strike ? 2 : 0, C = ["#2e2420", "#4e3e36", "#6e5a4c"];
    L_(g, 8, 18, 4, 16, "#7a5a5a"); L_(g, 4, 16, 2, 19, "#7a5a5a");
    blob(g, 14 + s, 17, 7, 4, C); blob(g, 21 + s, 16, 4, 3, C); R_(g, 24 + s, 16, 3, 2, C[1]); P_(g, 27 + s, 16, "#d88a8a");
    R_(g, 19 + s, 11, 2, 3, C[1]); P_(g, 19 + s, 12, "#c87a7a"); eye(g, 23 + s, 15);
    if (o.strike) { P_(g, 26 + s, 18, "#e8dfc8"); P_(g, 25 + s, 18, "#e8dfc8"); }
    R_(g, 10 + s, 21, 2, 1, C[0]); R_(g, 17 + s, 21, 2, 1, C[0]); } },
  squelette: { w: 32, h: 34, f: (g, o) => { skeleton(g, { strike: o.strike, helmet: 1 });
    drawWeapon(g, "pioche", o.strike ? 22 : 20, o.strike ? 16 : 19, (o.strike ? 15 : -70) * Math.PI / 180, ["#2a1a10", "#5a3a22", "#8a5a3a", "#a87a52", "#c8a070"]);
    L_(g, o.strike ? 18 : 17, 13, o.strike ? 22 : 20, o.strike ? 16 : 19, BONE[2]); } },
  bat: { w: 32, h: 26, f: (g, o) => { const C = ["#1e141e", "#3a2838", "#5a4058"], up = o.strike ? -4 : 0;
    for (let i = 0; i < 9; i++) { L_(g, 14, 12, 4 + i, 6 + up + Math.abs(4 - i) % 3, C[1]); L_(g, 18, 12, 28 - i, 6 + up + Math.abs(4 - i) % 3, C[1]); }
    L_(g, 14, 12, 3, 5 + up, C[2]); L_(g, 18, 12, 29, 5 + up, C[2]);
    blob(g, 16, 13, 3, 4, C); R_(g, 14, 8, 1, 2, C[1]); R_(g, 18, 8, 1, 2, C[1]); eye(g, 15, 12); eye(g, 17, 12); P_(g, 16, 15, "#e8dfc8"); } },
  goule: { w: 32, h: 34, f: (g, o) => { const C = ["#2e3a28", "#56664a", "#7e8e6a"], s = o.strike ? 2 : 0;
    L_(g, 12, 23, 10, 31, C[0], 2); L_(g, 17, 23, 19, 31, C[1], 2);
    blob(g, 14, 18, 6, 6, C); R_(g, 9, 13, 8, 3, C[0]);
    blob(g, 19 + s, 12, 4, 4, C); R_(g, 20 + s, 14, 4, 2, C[0]); P_(g, 21 + s, 11, "#e8f04a"); P_(g, 23 + s, 11, "#e8f04a"); P_(g, 21 + s, 15, BONE[3]); P_(g, 23 + s, 15, BONE[3]);
    L_(g, 18, 17, 24 + s * 2, 22 - s * 2, C[1], 2); R_(g, 24 + s * 2, 21 - s * 2, 1, 3, BONE[3]); R_(g, 26 + s * 2, 21 - s * 2, 1, 3, BONE[3]);
    L_(g, 11, 17, 9, 25, C[0], 2); } },
  archer_os: { w: 32, h: 34, f: (g, o) => { skeleton(g, { strike: o.strike, hood: "#3a2a22", eye: "#ffb04a" });
    const bx = o.strike ? 23 : 21; for (let y = -7; y <= 7; y++) P_(g, bx + Math.round(Math.cos(y / 7 * 1.3) * 3), 15 + y, PAL.wood[3]);
    L_(g, bx, 8, bx, 22, "#d8d0c0"); L_(g, 17, 14, bx + 2, 15, BONE[2]); if (o.strike) L_(g, bx - 3, 15, bx + 6, 15, "#c8a070"); } },
  spore: { w: 28, h: 26, f: (g, o) => { const C = ["#2e3a10", "#5a7a1e", "#8aaa3a"], p = o.strike ? 1 : 0;
    blob(g, 14, 15, 9 + p, 7 + p, C); R_(g, 8, 20, 12, 3, C[0]);
    for (const [a, b] of [[9, 12], [15, 10], [19, 15], [12, 17], [17, 19]]) { P_(g, a, b, "#e8ff7a"); P_(g, a + 1, b, "#c8f04a"); }
    P_(g, 13, 14, "#140c0a"); P_(g, 16, 14, "#140c0a"); R_(g, 13, 17, 4, 1, "#1e2808"); } },
  araignee: { w: 34, h: 24, f: (g, o) => { const C = ["#140c10", "#2e1e26", "#4a3440"], s = o.strike ? 2 : 0;
    for (let i = 0; i < 4; i++) { const bx = 12 + i * 3; L_(g, bx, 14, bx - 5 + i * 2, 9, C[1]); L_(g, bx - 5 + i * 2, 9, bx - 8 + i * 3, 21, C[1]); L_(g, bx + 1, 14, bx + 3 + i, 8 + i, C[2]); L_(g, bx + 3 + i, 8 + i, bx + 6 + i, 21, C[2]); }
    blob(g, 11, 13, 7, 5, C); P_(g, 10, 12, "#a82020"); P_(g, 10, 13, "#d84a3a"); P_(g, 10, 14, "#a82020");
    blob(g, 20 + s, 14, 4, 3, C); eye(g, 22 + s, 13); eye(g, 23 + s, 14); eye(g, 21 + s, 12, "#ff8a5a");
    if (o.strike) { P_(g, 25 + s, 16, BONE[3]); P_(g, 24 + s, 17, BONE[3]); } } },
  spectre: { w: 30, h: 34, f: (g, o) => { const C = PAL.frost, s = o.strike ? 2 : 0;
    for (let y = 5; y < 31; y++) { const w = y < 11 ? Math.round(Math.sqrt(Math.max(0, 36 - (y - 11) * (y - 11)))) : 6 + ((y - 11) / 4 | 0); for (let x = -w; x <= w; x++) { if (y > 22 && (x + y) % 2) continue; if (y > 27 && (x + y) % 3) continue; P_(g, 14 + x + (y > 18 ? Math.round(Math.sin(y * .7) * 1.2) : 0), y, x < -w + 2 ? C[3] : x > w - 2 ? C[1] : y < 12 ? C[2] : mixc(C[2], C[1], (y - 12) / 18)); } }
    E_(g, 15, 10, 3, 3, "#0a1018"); P_(g, 14, 10, "#e0f4ff"); P_(g, 17, 10, "#e0f4ff"); P_(g, 14, 9, C[4]);
    L_(g, 19, 15, 25 + s, 12 - s, C[2], 2); L_(g, 25 + s, 12 - s, 27 + s, 11 - s, C[4]); L_(g, 25 + s, 12 - s, 27 + s, 14 - s, C[4]); } },
  cultiste: { w: 32, h: 34, f: (g, o) => { const C = ["#2a0c10", "#4e1418", "#702028"], s = o.strike ? 1 : 0;
    for (let y = 10; y < 31; y++) { const w = 3 + Math.floor((y - 10) / 3); R_(g, 15 - w, y, w * 2 + 1, 1, C[1]); P_(g, 15 - w, y, C[2]); P_(g, 15 + w, y, C[0]); }
    R_(g, 11, 6, 9, 8, C[1]); R_(g, 11, 6, 2, 8, C[2]); R_(g, 14, 9, 5, 4, "#0c0606"); eye(g, 16, 10, "#c49cff"); eye(g, 18, 10, "#c49cff");
    R_(g, 12, 18, 7, 1, "#a88a2a");
    L_(g, 23 + s, 4, 23 + s, 30, PAL.wood[2]); blob(g, 23 + s, 4, 2, 2, PAL.soul.slice(2)); P_(g, 22 + s, 3, PAL.soul[4]);
    L_(g, 17, 15, 22 + s, 16, C[2], 2); } },
  golem: { w: 40, h: 38, f: (g, o) => { const C = ["#2a2420", "#4a3e36", "#6e5e50"], s = o.strike ? 3 : 0, E = PAL.ember;
    R_(g, 12, 26, 6, 10, C[0]); R_(g, 21, 26, 6, 10, C[1]);
    blob(g, 19, 19, 11, 9, C); R_(g, 15, 7, 9, 7, C[1]); R_(g, 15, 7, 3, 7, C[2]); R_(g, 20, 10, 3, 1, E[4]);
    L_(g, 14, 16, 18, 22, E[2]); L_(g, 18, 22, 22, 20, E[3]); L_(g, 22, 20, 24, 25, E[2]);
    blob(g, 9, 24, 4, 5, C); blob(g, 31 + s, 22 - s, 5, 5, C); P_(g, 31 + s, 21 - s, E[3]); } },
  // ── gardiens (56×56) ──
  chevalier_os: { w: 56, h: 56, f: (g, o) => { const s = o.strike, M = ["#24201c", "#3e3830", "#5e554a", "#8a7e6c", "#b0a48e"], cape = ["#2a0808", "#4e1010"];
    for (let y = 18; y < 52; y++) { const w = 6 + ((y - 18) / 3 | 0); R_(g, 20 - w, y, w, 1, y % 5 ? cape[1] : cape[0]); }
    R_(g, 20, 38, 5, 14, M[1]); R_(g, 28, 38, 5, 14, M[2]); R_(g, 19, 51, 7, 3, M[0]); R_(g, 28, 51, 7, 3, M[1]);
    R_(g, 17, 20, 19, 19, M[2]); R_(g, 17, 20, 5, 19, M[3]); R_(g, 32, 20, 4, 19, M[1]); for (let y = 23; y < 36; y += 3) R_(g, 22, y, 10, 1, BONE[2]);
    R_(g, 15, 18, 8, 5, M[3]); R_(g, 31, 18, 8, 5, M[3]); P_(g, 16, 18, M[4]);
    R_(g, 20, 6, 12, 12, BONE[2]); R_(g, 21, 6, 9, 2, BONE[3]); R_(g, 24, 10, 3, 3, "#0c0807"); R_(g, 29, 10, 2, 3, "#0c0807"); eye(g, 25, 11, "#ffb04a"); eye(g, 29, 11, "#ffb04a"); R_(g, 22, 15, 9, 2, BONE[1]);
    for (let i = 0; i < 5; i++) R_(g, 20 + i * 3, 3 - (i % 2), 2, 4, "#a88a2a");
    drawWeapon(g, "grandmarteau", s ? 40 : 39, s ? 30 : 37, (s ? 62 : -62) * Math.PI / 180, M);
    L_(g, 34, 23, s ? 40 : 38, s ? 32 : 36, M[3], 3); } },
  reine: { w: 56, h: 48, f: (g, o) => { const C = ["#1a0e1e", "#3a2240", "#5e3a66"], s = o.strike ? 3 : 0;
    for (let i = 0; i < 4; i++) { const bx = 18 + i * 5; L_(g, bx, 26, bx - 10 + i * 3, 14, C[1], 2); L_(g, bx - 10 + i * 3, 14, bx - 14 + i * 4, 44, C[1], 2); L_(g, bx + 2, 26, bx + 8 + i * 2, 12 + i * 2, C[2], 2); L_(g, bx + 8 + i * 2, 12 + i * 2, bx + 12 + i * 2, 44, C[2], 2); }
    blob(g, 17, 26, 13, 10, C); for (const [a, b] of [[12, 22], [17, 26], [12, 30], [21, 21]]) { P_(g, a, b, "#d84a3a"); P_(g, a + 1, b, "#a82020"); }
    blob(g, 35 + s, 26, 8, 6, C); for (const [a, b] of [[38, 24], [40, 25], [37, 22], [41, 23]]) eye(g, a + s, b, "#ff5a3a");
    R_(g, 32 + s, 15, 9, 3, "#a88a2a"); for (let i = 0; i < 3; i++) P_(g, 33 + s + i * 3, 14, "#ffd27a");
    if (o.strike) { L_(g, 42 + s, 29, 46 + s, 33, BONE[3]); L_(g, 41 + s, 30, 43 + s, 35, BONE[3]); } } },
  ver: { w: 56, h: 56, f: (g, o) => { const C = ["#3a1e1a", "#6a3a2e", "#9a5a44"], E = PAL.ember;
    if (o.under) { blob(g, 28, 48, 16, 5, ["#1a120e", "#2e221a", "#46362a"]); L_(g, 18, 47, 24, 45, "#0c0807"); L_(g, 30, 49, 38, 46, "#0c0807"); for (let i = 0; i < 5; i++) P_(g, 16 + i * 6, 43 - i % 2, "#5a4a3a"); return; }
    blob(g, 28, 50, 15, 4, ["#1a120e", "#2e221a", "#46362a"]);
    const seg = [[24, 46, 8], [26, 39, 8], [29, 32, 8], [33, 25, 8], [37, 19, 8]];
    for (const [a, b, r] of seg) { blob(g, a, b, r, r - 1, C); R_(g, a - r + 2, b, r * 2 - 4, 1, C[0]); }
    const s = o.strike ? 2 : 0; blob(g, 40 + s, 13, 9, 8, C); R_(g, 42 + s, 8 - s, 8, 10 + s * 2, "#1a0806"); for (let i = 0; i < 5; i++) { P_(g, 42 + s + i * 2, 8 - s, BONE[3]); P_(g, 42 + s + i * 2, 17 + s, BONE[3]); }
    R_(g, 44 + s, 11, 4, 4, E[2]); P_(g, 45 + s, 12, E[4]); } },
  dragon: { w: 60, h: 56, ax: 30, f: (g, o) => { const C = ["#3a0a06", "#6e1a0e", "#a83418"], E = PAL.ember, s = o.strike ? 2 : 0;
    for (let y = 4; y < 32; y++) { const t = (y - 4) / 28, x0 = Math.round(10 + t * 8), x1 = Math.round(18 + t * 14 + Math.sin(y * .9) * 1.5); R_(g, x0, y, Math.max(1, x1 - x0), 1, y % 6 < 1 ? C[2] : C[0]); }
    L_(g, 10, 4, 24, 30, C[2], 2); L_(g, 10, 4, 34, 22, C[1]); L_(g, 10, 4, 18, 26, C[1]);
    L_(g, 12, 44, 3, 49, C[1], 3); L_(g, 3, 49, 1, 44, C[1], 2); P_(g, 1, 43, BONE[2]);
    blob(g, 26, 38, 14, 10, C); R_(g, 20, 42, 14, 5, E[2]); for (let x = 20; x < 34; x += 2) P_(g, x, 43, E[3]);
    R_(g, 17, 45, 6, 8, C[0]); R_(g, 31, 45, 6, 8, C[1]); R_(g, 16, 52, 8, 2, C[0]); R_(g, 31, 52, 8, 2, C[0]); P_(g, 39, 53, BONE[2]); P_(g, 24, 53, BONE[2]);
    blob(g, 37, 30, 6, 6, C); blob(g, 41 + s, 24, 5, 5, C); blob(g, 44 + s, 19, 5, 5, C); R_(g, 38, 31, 5, 4, E[2]); R_(g, 42 + s, 25, 3, 3, E[2]);
    blob(g, 48 + s, 15, 7, 5, C); R_(g, 50 + s, 16, 8, 4, C[1]); R_(g, 52 + s, 19, 6, 1, C[0]); P_(g, 57 + s, 16, "#140c0a");
    eye(g, 49 + s, 13, "#ffd27a"); L_(g, 45 + s, 11, 40 + s, 5, BONE[2]); L_(g, 47 + s, 10, 45 + s, 4, BONE[3]);
    for (let i = 0; i < 4; i++) P_(g, 20 + i * 4, 28 - (i % 2), BONE[1]);
    if (o.strike) { R_(g, 57, 18, 3, 3, E[3]); P_(g, 58, 19, E[5]); } } },
  // ── compagnons ──
  loup: { w: 32, h: 24, f: (g, o) => { const C = ["#2e2c2c", "#5a5654", "#8a8480"], s = o.strike ? 2 : 0;
    L_(g, 6, 12, 2, 8, C[1], 2); blob(g, 14 + s, 13, 8, 5, C); R_(g, 8 + s, 16, 2, 5, C[0]); R_(g, 11 + s, 16, 2, 5, C[1]); R_(g, 17 + s, 16, 2, 5, C[0]); R_(g, 20 + s, 16, 2, 5, C[1]);
    blob(g, 23 + s, 9, 4, 4, C); R_(g, 25 + s, 10, 4, 2, C[1]); P_(g, 29 + s, 10, "#140c0a"); R_(g, 21 + s, 4, 2, 3, C[1]); R_(g, 23 + s, 4, 1, 2, C[0]); eye(g, 24 + s, 8, "#ffd27a"); R_(g, 12 + s, 15, 8, 1, lt(C[2], .3)); } },
  corbeau: { w: 26, h: 22, f: (g, o) => { const C = ["#0c0a10", "#1e1a26", "#3a3448"], s = o.strike ? -3 : 0;
    blob(g, 12, 12, 6, 4, C); L_(g, 6, 13, 2, 16, C[1], 2); blob(g, 17, 8, 3, 3, C); R_(g, 20, 8, 3, 1, "#c8a050"); eye(g, 18, 7, "#ffd27a");
    for (let i = 0; i < 6; i++) L_(g, 11, 11, 4 + i, 5 + s + i % 2, C[2]); R_(g, 11, 16, 1, 3, "#c8a050"); R_(g, 14, 16, 1, 3, "#c8a050"); } },
  chouette: { w: 26, h: 26, f: (g, o) => { const C = ["#3a2618", "#6a4a2e", "#9a7a52"];
    blob(g, 13, 14, 7, 8, C); R_(g, 8, 6, 3, 3, C[1]); R_(g, 15, 6, 3, 3, C[1]); R_(g, 8, 9, 10, 5, C[2]); R_(g, 9, 10, 3, 3, "#ffd27a"); R_(g, 14, 10, 3, 3, "#ffd27a"); P_(g, 10, 11, "#140c0a"); P_(g, 15, 11, "#140c0a"); P_(g, 12, 13, "#c8a050");
    for (let y = 16; y < 21; y += 2) R_(g, 10, y, 6, 1, C[0]); if (o.strike) { L_(g, 6, 12, 1, 6, C[1], 2); L_(g, 20, 12, 25, 6, C[1], 2); } R_(g, 10, 22, 2, 2, "#c8a050"); R_(g, 14, 22, 2, 2, "#c8a050"); } },
  chat_noir: { w: 28, h: 22, f: (g, o) => { const C = ["#0c0a0c", "#1e1a20", "#34303a"], s = o.strike ? 2 : 0;
    L_(g, 5, 14, 2, 5, C[1], 2); blob(g, 12 + s, 13, 6, 4, C); R_(g, 8 + s, 15, 2, 5, C[0]); R_(g, 15 + s, 15, 2, 5, C[1]);
    blob(g, 19 + s, 9, 4, 3, C); R_(g, 16 + s, 5, 2, 2, C[1]); R_(g, 21 + s, 5, 2, 2, C[1]); eye(g, 20 + s, 9, "#e8f04a"); eye(g, 22 + s, 9, "#e8f04a"); } },
  salamandre: { w: 30, h: 18, f: (g, o) => { const C = ["#6a1a04", "#c8460e", "#ff8a2a"], s = o.strike ? 2 : 0;
    L_(g, 7, 11, 1, 13, C[1], 2); blob(g, 13 + s, 11, 7, 3, C); blob(g, 22 + s, 10, 4, 3, C); eye(g, 23 + s, 9, "#ffe27a");
    for (const xx of [9, 17]) { R_(g, xx + s, 13, 2, 3, C[0]); } for (let x = 8; x < 20; x += 3) P_(g, x + s, 8, "#ffd27a");
    if (o.strike) { R_(g, 26 + s, 10, 3, 2, PAL.ember[4]); } } },
  drake: { w: 30, h: 26, f: (g, o) => { const C = ["#3a0a0a", "#7a1a14", "#b8402a"], s = o.strike ? 2 : 0;
    for (let i = 0; i < 7; i++) L_(g, 12, 12, 3 + i * 2, 3 + Math.abs(3 - i) - (o.strike ? 2 : 0), C[0]);
    L_(g, 7, 17, 2, 20, C[1], 2); blob(g, 13, 16, 6, 4, C); R_(g, 10, 19, 2, 4, C[0]); R_(g, 15, 19, 2, 4, C[1]);
    L_(g, 17, 14, 21 + s, 9, C[1], 2); blob(g, 23 + s, 8, 3, 3, C); R_(g, 25 + s, 8, 3, 2, C[1]); eye(g, 23 + s, 7, "#ffd27a"); P_(g, 21 + s, 5, BONE[2]);
    if (o.strike) { R_(g, 28, 8, 2, 2, PAL.ember[4]); } } },
};
const PET_ART = { loup: "loup", corbeau: "corbeau", chouette: "chouette", chat: "chat_noir", salamandre: "salamandre", drake: "drake" };
function petPix(id, strike) { return foeArt(PET_ART[id] || "loup", strike); }
