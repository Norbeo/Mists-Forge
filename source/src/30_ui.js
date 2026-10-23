/* ═══════════════════════ Interface : peu de boutons, tout se joue en touchant ═══════════════════════ */
const $ = s => document.querySelector(s);
const UI = { screen: null };
const SC = { cv: null, x: null, w: 0, h: 0, dpr: 1, t: 0, last: 0, draw: null, tap: null };
const ACT = {};
const GAME_URL = "https://norbeo.github.io/Mists-Forge/";
const PWA = { prompt: null,
  standalone: HASWIN && ((window.matchMedia && (matchMedia("(display-mode: standalone)").matches || matchMedia("(display-mode: fullscreen)").matches)) || navigator.standalone === true),
  framed: HASWIN && (() => { try { return window.top !== window.self; } catch (e) { return true; } })(),
  ios: HASWIN && (/iphone|ipad|ipod/i.test(navigator.userAgent || "") || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)),
  android: HASWIN && /android/i.test(navigator.userAgent || "") };
if (HASWIN) { addEventListener("beforeinstallprompt", e => { e.preventDefault(); PWA.prompt = e; }); addEventListener("appinstalled", () => { PWA.prompt = null; toast("La Forge des Brumes est installée !"); }); }

function sceneInit() {
  SC.cv = $("#scene"); SC.x = SC.cv.getContext("2d");
  const rs = () => { SC.dpr = Math.min(3, devicePixelRatio || 1); SC.w = innerWidth; SC.h = innerHeight; SC.cv.width = Math.round(SC.w * SC.dpr); SC.cv.height = Math.round(SC.h * SC.dpr); if (SCREENS[UI.screen] && SCREENS[UI.screen].resize) SCREENS[UI.screen].resize(); };
  addEventListener("resize", rs); rs();
  // toucher : appui court = action, appui long (ou clic droit) = fiche ; la souris survole
  let P0 = null;
  SC.cv.addEventListener("pointerdown", e => { audioInit(); if (e.button === 2) return; const p = P0 = { x: e.clientX, y: e.clientY, t: performance.now(), long: false }; p.timer = setTimeout(() => { if (P0 === p && SC.long) { p.long = true; SC.long(p.x, p.y); } }, 430); });
  SC.cv.addEventListener("pointermove", e => { if (e.pointerType === "mouse") { SC.mx = e.clientX; SC.my = e.clientY; } else if (P0) { SC.mx = e.clientX; SC.my = e.clientY; } if (P0 && Math.hypot(e.clientX - P0.x, e.clientY - P0.y) > 14) { clearTimeout(P0.timer); P0.moved = true; } if (P0 && P0.moved && SC.drag) SC.drag(e.clientX - (P0.lx ?? P0.x), e.clientY - (P0.ly ?? P0.y)); if (P0) { P0.lx = e.clientX; P0.ly = e.clientY; } });
  SC.cv.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") SC.mx = SC.my = null; });
  const up = e => { const p = P0; P0 = null; if (!p) return; clearTimeout(p.timer); if (e.pointerType !== "mouse") SC.mx = SC.my = null; if (!p.long && !p.moved && SC.tap) SC.tap(p.x, p.y); };
  SC.cv.addEventListener("pointerup", up); SC.cv.addEventListener("pointercancel", () => { if (P0) clearTimeout(P0.timer); P0 = null; });
  SC.cv.addEventListener("contextmenu", e => { e.preventDefault(); if (P0) clearTimeout(P0.timer); P0 = null; if (SC.long) SC.long(e.clientX, e.clientY); });
  const loop = now => { const dt = Math.min(.05, (now - (SC.last || now)) / 1000); SC.last = now; SC.t += dt; const x = SC.x; x.setTransform(SC.dpr, 0, 0, SC.dpr, 0, 0); try { if (SC.draw) SC.draw(x, SC.t, dt); } catch (e) { console.error(e); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
const SCREENS = {};
function go(name, arg) {
  UI.screen = name; UI.arg = arg; SC.tap = null; SC.long = null; SC.drag = null;
  const S2 = SCREENS[name];
  $("#top").innerHTML = S2.top ? S2.top(arg) : ""; $("#bot").innerHTML = S2.bot ? S2.bot(arg) : ""; $("#mid").innerHTML = S2.mid ? S2.mid(arg) : "";
  SC.draw = S2.scene ? S2.scene(arg) : null;
  if (S2.mount) S2.mount(arg);
}
function refreshBars() { const S2 = SCREENS[UI.screen]; if (S2.top) $("#top").innerHTML = S2.top(UI.arg); if (S2.bot) $("#bot").innerHTML = S2.bot(UI.arg); }
function toast(m) { const t = document.createElement("div"); t.className = "toast"; t.innerHTML = m; $("#toasts").appendChild(t); setTimeout(() => t.remove(), 3100); }
function sheet(html, o = {}) { const s = $("#sheet"); s.hidden = false; s.innerHTML = `<div class="box"><div class="grab"></div>${html}</div>`; s.onclick = e => { if (e.target === s && o.close !== false) closeSheet(); }; if (o.mount) o.mount(s); UI.sheetClose = o.onClose; }
function closeSheet() { const s = $("#sheet"); s.hidden = true; s.innerHTML = ""; const f = UI.sheetClose; UI.sheetClose = null; if (f) f(); }
ACT.close = closeSheet;
function events() {
  document.addEventListener("click", e => { audioInit(); const a = e.target.closest("[data-a]"); if (a && ACT[a.dataset.a]) { sfx("click"); ACT[a.dataset.a](a.dataset.v, a, e); } });
  setInterval(() => S && saveF(), 10000); addEventListener("visibilitychange", () => { if (document.hidden && S) saveF(); });
}
const oreChips = (o, all) => Object.keys(ORES).filter(k => all || o[k]).map(k => `<span class="pill" style="color:${ORES[k].c}">${ico(ORES[k].ic, ORES[k].c)}${o[k] || 0}</span>`).join("");
const costHTML = c => `<span class="cost">${Object.keys(c).map(k => `<span class="${S.ore[k] >= c[k] ? "" : "no"}" style="color:${S.ore[k] >= c[k] ? ORES[k].c : ""}">${ico(ORES[k].ic, ORES[k].c)}${c[k]}</span>`).join("")}</span>`;
// schéma de la frappe d'une arme
function patternSVG(k, sz = 56) {
  const W = WEAPONS[k], g = 5, c = sz / g; let cells = "";
  const hit = new Set();
  if (W.all) for (const [a, b] of DIRS8) hit.add((2 + a) + "," + (2 + b));
  else if (W.pierce) { hit.add("3,2"); hit.add("4,2"); }
  else if (W.shot) { hit.add("3,2"); hit.add("4,2"); }
  else if (W.arc) { hit.add("3,2"); hit.add("3,1"); hit.add("3,3"); }
  else hit.add("3,2");
  for (let y = 0; y < g; y++) for (let x = 0; x < g; x++) { const h = x === 2 && y === 2, t = hit.has(x + "," + y); cells += `<rect x="${x * c + 1}" y="${y * c + 1}" width="${c - 2}" height="${c - 2}" rx="2" fill="${h ? "#e8c878" : t ? "#ff6a3a" : "#ffffff10"}"/>`; }
  if (W.push) cells += `<path d="M${4.1 * c} ${2.5 * c}l${c * .6} 0m-${c * .25} -${c * .25}l${c * .25} ${c * .25}-${c * .25} ${c * .25}" stroke="#ffb060" stroke-width="2" fill="none"/>`;
  if (W.shot) cells += `<text x="${4.5 * c}" y="${2.2 * c}" font-size="${c * .7}" fill="#ffb060" text-anchor="middle">…</text>`;
  return `<svg class="pat" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">${cells}</svg>`;
}

// ── écran-titre ──
SCREENS.title = {
  scene: () => (x, t, dt) => drawForgeScene(x, t, dt, { actors: false, dark: .85, dim: .25 }),
  mid: () => `<div class="title" style="pointer-events:auto"><div class="logo">La Forge<br>des Brumes<small>LA MINE SANS FOND</small></div><p class="lore" style="max-width:380px">Sous la forge, une mine maudite. Descendez, frappez, remontez forger. Plus bas, toujours plus bas.</p><button class="btn main" data-a="play" style="min-width:250px">${ico("hammer")}${loadF() ? "Continuer" : "Jouer"}</button>${PWA.standalone ? "" : `<button class="btn ghost sm" data-a="install">${ico("install")}Installer l'appli</button>`}</div>`,
};
ACT.play = () => { S = loadF() || newSave(); UI.achSeen = null; achCheck(); musicPlay("bastion"); if (S.run && S.run.board) go("mine"); else go("forge"); };
ACT.install = async () => {
  if (PWA.prompt) { PWA.prompt.prompt(); try { await PWA.prompt.userChoice; } catch (e) { } PWA.prompt = null; return; }
  const how = PWA.framed ? `<p>Ici, le jeu est affiché dans un aperçu : ouvrez-le sur son site pour l'installer.</p><p class="center"><a class="btn main" href="${GAME_URL}" target="_blank" rel="noopener">Ouvrir le jeu</a></p>`
    : PWA.ios ? `<p>Dans <b>Safari</b> : bouton <b>Partager</b>, puis <b>« Sur l'écran d'accueil »</b>.</p>` : PWA.android ? `<p>Dans <b>Chrome</b> : menu <b>⋮</b>, puis <b>« Installer l'application »</b>.</p>` : `<p>Dans <b>Chrome</b> ou <b>Edge</b> : l'icône d'installation à droite de la barre d'adresse.</p>`;
  sheet(`<h2>${ico("install")} Installer</h2>${how}<p class="small dim">Le jeu s'ouvre alors en plein écran et fonctionne sans connexion.</p>`);
};

// ── la forge en pixels (écran-titre, forge, résultats) ──
const FG = { fx: [], hammer: 0, lastHit: 0 };
function forgeLay() { const dpr = SC.dpr, Wd = SC.w * dpr, Hd = SC.h * dpr, port = SC.w < SC.h; const kd = Math.max(1, Math.floor(Math.min(Wd / (port ? 124 : 160), Hd / (port ? 230 : 190)))); const w = Math.ceil(Wd / kd), h = Math.ceil(Hd / kd); return { kd, w, h, fy: Math.round(h * (port ? .56 : .62)), cx: Math.round(w / 2) }; }
function rackKey() { return S ? WEAPON_IDS.filter(k => S.weapons[k]).map(k => WEAPONS[k].art + ":" + S.weapons[k].tier).join(",") : "marteau:0"; }
function drawForgeScene(x, t, dt, o = {}) {
  const F = forgeLay(), k = F.kd; FG.lay = F;
  x.setTransform(k, 0, 0, k, 0, 0); x.imageSmoothingEnabled = false;
  const look = S ? S.look : defaultLook();
  x.drawImage(forgeStatic(F.w, F.h, F.fy, F.cx, look, rackKey()), 0, 0);
  const fx = F.cx - 46, fw = 34; fireFrame(x, fx + fw / 2 - 8, F.fy - 3, 16, t);
  const fl = .32 + Math.sin(t * 9) * .03 + Math.sin(t * 23) * .02;
  x.save(); x.globalCompositeOperation = "lighter"; glow(x, fx + fw / 2, F.fy - 14, 90, "#ff6a1a", fl); glow(x, fx + fw / 2, F.fy - 12, 26, "#ffb050", fl * .9); x.restore();
  // braises qui montent du four
  if (Math.random() < dt * 12) FG.fx.push({ x: fx + fw / 2 + (Math.random() - .5) * 14, y: F.fy - 16, vx: (Math.random() - .5) * 6, vy: -12 - Math.random() * 16, g: -2, t: 0, life: 1.4 + Math.random(), col: Math.random() < .5 ? "#ffb04a" : "#ff6a1a" });
  if (o.actors !== false && S) {
    const sx = F.cx - 6, sy = F.fy + 20;
    const ph = (t * 1.1) % 1, pose = ph < .55 ? "forge" : "forge2";
    if (pose === "forge2" && !FG.hammer) { FG.hammer = 1; for (let i = 0; i < 12; i++) FG.fx.push({ x: sx + 22, y: sy - 8, vx: (Math.random() - .3) * 60, vy: -20 - Math.random() * 50, g: 160, t: 0, life: .4 + Math.random() * .4, col: Math.random() < .5 ? "#ffe08a" : "#ff9a3a" }); if (t - FG.lastHit > .5) { FG.lastHit = t; if (o.sound && $("#sheet").hidden) sfx("forge"); } }
    if (pose === "forge") FG.hammer = 0;
    blit(x, petPix(S.pet, 0), sx - 26, sy + 2, 1);
    blit(x, smithPix(smithLook(), pose), sx, sy, 1);
    blit(x, anvilPix(), sx + 21, sy + 9, 1);
    FG.smith = [sx, sy];
    // métal chaud sur l'enclume
    x.fillStyle = pose === "forge2" ? "#fff0b0" : "#ff8a3a"; x.fillRect(sx + 16, sy - 7, 7, 1);
    x.save(); x.globalCompositeOperation = "lighter"; glow(x, sx + 20, sy - 7, pose === "forge2" ? 22 : 12, "#ff9a3a", .35); x.restore();
  }
  x.save(); x.globalCompositeOperation = "lighter";
  for (const f of FG.fx) { f.t += dt; f.vy += f.g * dt; f.x += f.vx * dt; f.y += f.vy * dt; x.globalAlpha = Math.max(0, 1 - f.t / f.life); x.fillStyle = f.col; x.fillRect(Math.round(f.x), Math.round(f.y), 1, 1); }
  x.restore(); FG.fx = FG.fx.filter(f => f.t < f.life);
  x.setTransform(SC.dpr, 0, 0, SC.dpr, 0, 0);
  const cy0 = F.fy * k / SC.dpr, v = x.createRadialGradient(SC.w / 2, cy0 - 40, 60, SC.w / 2, cy0 - 40, Math.max(SC.w, SC.h) * .75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, `rgba(0,0,0,${o.dark || .7})`); x.fillStyle = v; x.fillRect(0, 0, SC.w, SC.h);
  if (o.dim) { x.fillStyle = `rgba(0,0,0,${o.dim})`; x.fillRect(0, 0, SC.w, SC.h); }
}
function forgeTap(px, py) { const F = FG.lay; if (!F || !FG.smith) return; const wx = px * SC.dpr / F.kd, wy = py * SC.dpr / F.kd; if (Math.abs(wx - FG.smith[0]) < 14 && wy < FG.smith[1] + 2 && wy > FG.smith[1] - 34) ACT.look(); }

// ── la forge (écran principal) ──
SCREENS.forge = {
  top: () => `${oreChips(S.ore, true)}<span class="pill" style="color:#ffb060" title="Braises">${ico("ember", "#ff8a3a")}${S.braises}</span><span class="grow"></span><button class="btn ghost icon crest" data-a="look" title="Forgeron">${crestImg(S.look.crest, 22)}</button><button class="btn ghost icon" data-a="opts">${ico("gear")}</button>`,
  bot: () => { const n = achReady().length; return `<p class="hint"><b>${esc(S.look.name)}</b>, maître forgeron · ${S.best ? `record : profondeur <b>${S.best}</b>` : "la mine attend"}</p><div class="row w"><button class="btn main" data-a="descend" style="flex:2">${ico("map")}Descendre${S.up.raccourci && S.bossDepth ? ` · ${S.bossDepth + 1}` : ""}</button><button class="btn daily ${S.daily.day === dayKey() && S.daily.tries ? "" : "new"}" data-a="dailyOpen">${ico("daily", "#c49cff")}Défi</button></div><div class="row w three"><button class="btn" data-a="forgeOpen">${ico("anvil")}Forger</button><button class="btn" data-a="petOpen">${ico("paw")}Compagnon</button><button class="btn" data-a="codex">${ico("book")}Codex${n ? `<i class="badge">${n}</i>` : ""}</button></div>`; },
  scene: () => (x, t, dt) => drawForgeScene(x, t, dt, { sound: UI.screen === "forge" }),
  mount: () => { SC.tap = forgeTap; if (!S.look.done) return ACT.look(); forgeTuto(); },
};
function forgeTuto() { if (!S.tuto.forge) { S.tuto.forge = 1; sheet(`<h2>${ico("anvil")} La forge</h2><p class="lore">Votre grand-père a creusé trop profond. La mine s'est réveillée.</p><p><b>Descendre</b> : chaque étage est une petite grille. À votre tour, vous pouvez <b>vous déplacer</b> d'une case et <b>frapper</b> une fois.</p><p>Les cases <b class="bad">rouges</b> montrent où les monstres vont frapper : ne restez pas dessus.</p><p>Frappez les <b>filons</b> pour récolter du minerai, puis remontez <b>forger</b> de meilleures armes et armures.</p><div class="center"><button class="btn main" data-a="close">À l'enclume</button></div>`); } }
ACT.descend = () => { startRun(); saveF(); sfx("door"); go("mine"); };
ACT.opts = () => sheet(`<h2>${ico("gear")} Options</h2><div class="item"><span class="grow">Effets sonores</span><button class="btn sm ${S.opts.sound ? "" : "ghost"}" data-a="optSnd">${S.opts.sound ? "Oui" : "Non"}</button></div><div class="item"><span class="grow">Musique</span><button class="btn sm ${S.opts.music ? "" : "ghost"}" data-a="optMus">${S.opts.music ? "Oui" : "Non"}</button></div><div class="item"><span class="grow">Animations rapides</span><button class="btn sm ${S.opts.fast ? "" : "ghost"}" data-a="optFast">${S.opts.fast ? "Oui" : "Non"}</button></div>${PWA.standalone ? "" : `<button class="btn" style="width:100%" data-a="install">${ico("install")}Installer l'appli</button>`}<p class="small dim center">${S.runs} descentes · ${S.kills} monstres tués · ${S.deaths} morts</p><button class="btn ghost sm" style="width:100%;color:var(--bad)" data-a="wipe">Effacer la partie</button>`);
ACT.optSnd = () => { S.opts.sound = S.opts.sound ? 0 : 1; saveF(); ACT.opts(); };
ACT.optMus = () => { S.opts.music = S.opts.music ? 0 : 1; musicMute(!!S.opts.music); saveF(); ACT.opts(); };
ACT.optFast = () => { S.opts.fast = S.opts.fast ? 0 : 1; saveF(); ACT.opts(); };
ACT.wipe = () => sheet(`<h2>Effacer la partie ?</h2><p>Tout sera perdu : minerai, armes, record.</p><div class="row w"><button class="btn ghost" data-a="close">Annuler</button><button class="btn" style="color:var(--bad)" data-a="wipeYes">Effacer</button></div>`);
ACT.wipeYes = () => { try { localStorage.removeItem(SAVE_KEY_F); } catch (e) { } S = newSave(); closeSheet(); go("title"); };
// panneau de forge
function forgeHTML() {
  const tab = UI.ftab || "armes";
  const T = [["armes", "Armes"], ["armure", "Armure"], ["runes", "Runes"], ["braises", "Braises"]];
  let body = "";
  if (tab === "armes") body = WEAPON_IDS.map(k => { const W = WEAPONS[k], own = S.weapons[k], un = weaponUnlocked(k), nt = nextWeaponTier(k), eq = S.equip.wpn === k;
    return `<div class="item ${eq ? "on" : ""} ${un ? "" : "lock"}">${patternSVG(k)}<div class="grow"><h3 style="margin:0">${W.n}${own ? ` <span class="small" style="color:${ORES[TIERS[own.tier].ore].c}">${TIERS[own.tier].n}</span>` : ""}</h3><p class="small dim" style="margin:2px 0 4px">${W.d}</p><p class="small" style="margin:0">Dégâts <b>${W.dmg + (own ? own.tier + QUALITY[own.q].b : 0)}</b>${own && own.q === 2 ? ` · <span style="color:${QUALITY[2].c}">Chef-d'œuvre</span>` : ""}</p>${!un ? `<p class="small dim">Atteignez la profondeur ${W.unlock}</p>` : ""}</div><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">${un && nt != null ? `${costHTML(WEAPON_COST[nt])}<button class="btn sm ${canPay(WEAPON_COST[nt]) ? "" : "off"}" data-a="forgeW" data-v="${k}">${own ? "Améliorer" : "Forger"}</button>` : ""}${own && !eq ? `<button class="btn ghost sm" data-a="equipW" data-v="${k}">Prendre</button>` : ""}${eq ? '<span class="small" style="color:var(--ember2)">En main</span>' : ""}</div></div>`; }).join("");
  if (tab === "armure") body = ARMOR.map((A, i) => { const cur = S.equip.armor, next = i === cur + 1; return `<div class="item ${i === cur ? "on" : ""} ${i > cur + 1 ? "lock" : ""}">${canvasMark("arm:" + i, 64, 80)}<div class="grow"><h3 style="margin:0">${A.n}</h3><p class="small dim">+${A.hp} PV${i === cur && i && S.equip.armorQ === 2 ? " (+1 chef-d'œuvre)" : ""}</p></div><div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">${i === cur ? '<span class="small" style="color:var(--ember2)">Portée</span>' : next ? `${costHTML(A.cost)}<button class="btn sm ${canPay(A.cost) ? "" : "off"}" data-a="forgeA">Forger</button>` : i < cur ? '<span class="small dim">Dépassée</span>' : ""}</div></div>`; }).join("");
  if (tab === "runes") body = `<p class="small dim">Une rune se grave sur votre arme. Chaque gardien vaincu pour la première fois en offre une.</p>` + RUNE_IDS.map(k => { const R = RUNES[k], own = S.runes.includes(k), eq = S.equip.rune === k; return `<div class="item ${eq ? "on" : ""} ${own ? "" : "lock"}">${ico(R.ic, own ? "#c49cff" : "#5a4a40", 34)}<div class="grow"><h3 style="margin:0">${own ? R.n : "Rune inconnue"}</h3><p class="small dim">${own ? R.d : "Vainquez un gardien."}</p></div>${own ? `<button class="btn sm ${eq ? "" : "ghost"}" data-a="equipR" data-v="${k}">${eq ? "Gravée" : "Graver"}</button>` : ""}</div>`; }).join("");
  if (tab === "braises") body = `<p class="small dim">Les braises se gagnent en descendant (plus c'est profond, plus il y en a). Elles renforcent la forge pour toujours.</p>` + Object.entries(UPGRADES).map(([k, U]) => { const c = upCost(k), l = S.up[k]; return `<div class="item"><div class="grow"><h3 style="margin:0">${U.n} <span class="small dim">${l}/${U.max}</span></h3><p class="small dim">${U.d}</p></div>${c == null ? '<span class="small good">Maximum</span>' : `<button class="btn sm ${S.braises >= c ? "" : "off"}" data-a="buyUp" data-v="${k}">${ico("ember", "#ff8a3a")}${c}</button>`}</div>`; }).join("");
  return `<div class="tabs">${T.map(([k, n]) => `<button class="btn ${tab === k ? "on" : "ghost"}" data-a="ftab" data-v="${k}">${n}</button>`).join("")}</div><div class="row" style="flex-wrap:wrap;margin-bottom:10px">${oreChips(S.ore, true)}<span class="pill" style="color:#ffb060">${ico("ember", "#ff8a3a")}${S.braises}</span></div>${body}`;
}
function canvasMark(id, w, h) { return `<canvas data-cv="${id}" width="${w}" height="${h}"></canvas>`; }
function paintMarks(root) { root.querySelectorAll("canvas[data-cv]").forEach(c => { const [k, v, w2] = c.dataset.cv.split(":"); const x = c.getContext("2d"); x.clearRect(0, 0, c.width, c.height); x.imageSmoothingEnabled = false;
  const put = (sp, by) => { const sc = Math.max(1, Math.floor(Math.min(c.width / sp.width, (c.height - 2) / sp.height))); blit(x, sp, Math.round(c.width / 2 - (sp.width / 2 - sp.ax) * sc), by != null ? by : c.height - 2 - (sp.height - 1 - sp.ay) * sc, sc); };
  if (k === "arm") put(smithPix(smithLook(+v), "idle"));
  if (k === "smith") put(smithPix(smithLook(), "idle"));
  if (k === "pet") put(petPix(v, 0));
  if (k === "crest") put(crestPix({ f: +v, c: +w2 }));
  if (k === "foe") put(foeArt(v, 0));
  if (k === "wpn") put(spr("wpnico|" + v + "|" + w2, 30, 30, g => drawWeapon(g, v, 8, 22, -45 * Math.PI / 180, WPN_MET[+w2 || 0]), { ax: 15, ay: 29 }));
}); }
ACT.forgeOpen = () => { sheet(forgeHTML(), { mount: paintMarks, onClose: () => refreshBars() }); };
ACT.ftab = v => { UI.ftab = v; ACT.forgeOpen(); };
ACT.equipW = k => { S.equip.wpn = k; saveF(); ACT.forgeOpen(); };
ACT.equipR = k => { S.equip.rune = S.equip.rune === k ? null : k; saveF(); ACT.forgeOpen(); };
ACT.buyUp = k => { if (!buyUp(k)) return; sfx("level"); saveF(); ACT.forgeOpen(); };
ACT.forgeW = k => minigame(WEAPONS[k].n, q => { if (forgeWeapon(k, q)) { saveF(); achCheck(); toast(`${WEAPONS[k].n} : <b>${TIERS[S.weapons[k].tier].n}</b>, ${QUALITY[q].n.toLowerCase()} !`); } ACT.forgeOpen(); });
ACT.forgeA = () => minigame(ARMOR[S.equip.armor + 1].n, q => { if (forgeArmor(q)) { saveF(); achCheck(); toast(`${ARMOR[S.equip.armor].n} forgée, ${QUALITY[q].n.toLowerCase()} !`); } ACT.forgeOpen(); });
// mini-jeu : trois coups de marteau au bon moment
function minigame(name, done) {
  let hits = [], pos = 0, dir = 1, speed = .9, raf = 0, over = false;
  sheet(`<h2 class="center">${ico("anvil")} ${name}</h2><p class="center small dim">Frappez quand le métal est au plus chaud : touchez au centre doré, trois fois.</p><div class="minigame" id="mg"><div class="zone ok"></div><div class="zone"></div><div class="cur" id="mgc"></div></div><div class="strikes" id="mgs"><span>⬥</span><span>⬥</span><span>⬥</span></div><div class="center" style="margin-top:12px"><button class="btn main" id="mgb" style="min-width:220px">${ico("hammer")}Frapper</button></div>`, { close: false });
  const cur = $("#mgc"), st = $("#mgs");
  const tick = () => { if (over) return; pos += dir * speed * .016 * (1 + hits.length * .35); if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } cur.style.left = (pos * 100) + "%"; raf = requestAnimationFrame(tick); };
  tick();
  const strike = () => { if (over) return; const d = Math.abs(pos - .5); const r = d < .08 ? "p" : d < .2 ? "g" : "m"; hits.push(r); st.children[hits.length - 1].className = r; sfx(r === "m" ? "miss" : "forge"); if (r === "p") toast("Parfait !");
    if (hits.length >= 3) { over = true; cancelAnimationFrame(raf); const p = hits.filter(h => h === "p").length, m = hits.filter(h => h === "m").length; const q = p >= 3 || (p === 2 && m === 0) ? 2 : m >= 3 ? 0 : 1; setTimeout(() => { closeSheet(); sfx(q === 2 ? "level" : "coin"); done(q); }, 500); } };
  $("#mgb").onclick = e => { e.stopPropagation(); strike(); };
  $("#mg").onclick = strike;
}
ACT.petOpen = () => sheet(`<h2>${ico("paw")} Compagnon</h2><p class="small dim">Il agit seul, juste après vous. S'il tombe, il rentre à la forge et vous rejoint au prochain gardien.</p><div class="cards">${PET_IDS.map(k => { const P = PETS[k], un = petUnlocked(k); return `<div class="card ${S.pet === k ? "on" : ""} ${un ? "" : "lock"}" data-a="${un ? "pickPet" : ""}" data-v="${k}">${canvasMark("pet:" + k, 140, 96)}<h3 style="margin:4px 0 2px">${P.n}</h3><p class="small dim" style="margin:0">${un ? P.d : "Profondeur " + P.unlock}</p></div>`; }).join("")}</div>`, { mount: paintMarks });
ACT.pickPet = k => { S.pet = k; saveF(); ACT.petOpen(); };
// ── le forgeron : visage, corps, couleurs, nom et blason ──
const CREST_IMG = {};
function crestImg(cr, sz = 22) { cr = cr || { f: 0, c: 0 }; const k = cr.f + "|" + cr.c; if (!CREST_IMG[k]) { const c = document.createElement("canvas"); c.width = 48; c.height = 54; const g = c.getContext("2d"); g.imageSmoothingEnabled = false; g.drawImage(crestPix(cr), 0, 0, 48, 54); CREST_IMG[k] = c.toDataURL(); } return `<img class="px" src="${CREST_IMG[k]}" alt="" style="width:${sz}px;height:${Math.round(sz * 1.125)}px">`; }
const LOOK_ROWS = [
  ["Corps", [["body", "Carrure", BODY_N], ["skin", "Peau", SKINS.map(s => s[0])], ["scar", "Cicatrice", ["Non", "Oui"]]]],
  ["Visage", [["hair", "Coiffure", HAIR_N], ["hairCol", "Cheveux", HAIRS], ["beard", "Barbe", BEARD_N]]],
  ["Équipement", [["cloth", "Tenue", CLOTHS], ["cape", "Cape", ["Aucune", ...CLOTHS]], ["finish", "Métal", FINISH], ["helm", "Casque", ["Caché", "Visible"]]]],
];
function lookHTML() {
  const L = S.look, first = !L.done;
  const opt = (key, val, cur, lab) => { const col = /^#/.test(lab); return `<button class="${col ? "sw" : "chip"} ${val === cur ? "on" : ""}" data-a="lk" data-v="${key}:${val}" ${col ? `style="background:${lab}" aria-label="couleur ${val + 1}"` : ""}>${col ? "" : lab}</button>`; };
  const rows = LOOK_ROWS.map(([sec, list]) => `<h3>${sec}</h3>` + list.map(([key, n, vals]) => `<div class="lrow"><span class="ln">${n}</span><div class="lopts">${vals.map((lab, i) => opt(key, i, L[key], lab)).join("")}</div></div>`).join("")).join("");
  const crest = `<h3>Nom et blason</h3><div class="lrow"><span class="ln">Nom</span><input id="lname" maxlength="16" value="${esc(L.name)}" autocomplete="off" spellcheck="false"></div>
    <div class="lrow"><span class="ln">Champ</span><div class="lopts">${CREST_FIELDS.map((c, i) => opt("cf", i, L.crest.f, c)).join("")}</div></div>
    <div class="lrow"><span class="ln">Meuble</span><div class="lopts">${CREST_CHARGES.map((c, i) => `<button class="chip cr ${i === L.crest.c ? "on" : ""}" data-a="lk" data-v="cc:${i}" title="${CREST_N[c]}">${crestImg({ f: L.crest.f, c: i }, 20)}</button>`).join("")}</div></div>`;
  return `<h2 class="center">${first ? "Votre forgeron" : "Le forgeron"}</h2>
    <div class="lookhead"><canvas data-cv="smith" width="168" height="168" class="px"></canvas><div class="arms">${ARMOR.map((A, i) => `<div><canvas data-cv="arm:${i}" width="48" height="48" class="px"></canvas><span class="small dim">${["Cuir", "Fer", "Argent", "Âme"][i]}</span></div>`).join("")}</div></div>
    <p class="center small dim">L'armure se forge à l'enclume ; ici, vous choisissez qui la porte.</p>
    ${crest}${rows}
    <div class="center" style="margin-top:14px"><button class="btn main" data-a="lookOk" style="min-width:220px">${ico("anvil")}${first ? "À la forge" : "Valider"}</button></div>`;
}
ACT.look = () => { const box = $("#sheet .box"), st = box ? box.scrollTop : 0; sheet(lookHTML(), { close: !!S.look.done, mount: r => { paintMarks(r); const b = $("#sheet .box"); if (b) b.scrollTop = st; const n = $("#lname"); if (n) n.oninput = () => { S.look.name = n.value.replace(/[<>]/g, "").slice(0, 16); saveF(); }; }, onClose: () => refreshBars() }); };
ACT.lk = v => { const [k, val] = v.split(":"), n = +val, L = S.look; if (k === "cf") L.crest.f = n; else if (k === "cc") L.crest.c = n; else L[k] = n; saveF(); ACT.look(); };
ACT.lookOk = () => { const L = S.look; if (!L.name.trim()) L.name = "Bran"; const first = !L.done; L.done = 1; saveF(); closeSheet(); refreshBars(); if (first) forgeTuto(); };

// ── codex : bestiaire, armes, succès ──
const STARS = (v, tiers) => `<span class="stars">${tiers.map(t => `<i class="${v >= t ? "on" : ""}">★</i>`).join("")}</span>`;
function codexHTML() {
  const tab = UI.ctab || "best", B = S.bestiary || {}, n = achReady().length;
  const T = [["best", "Bestiaire"], ["arme", "Armes"], ["ach", "Succès" + (n ? ` (${n})` : "")]];
  let body = "";
  if (tab === "best") {
    const card = (id, M, art, tiers, boss) => { const k = B[id] || 0; return `<div class="card ${k ? "" : "unseen"}" data-a="${k ? "bestInfo" : ""}" data-v="${id}"><canvas data-cv="foe:${art}" width="${boss ? 120 : 96}" height="${boss ? 100 : 80}" class="px"></canvas><h3 style="margin:4px 0 2px;font-size:14px">${k ? M.n : "???"}</h3><p class="small dim" style="margin:0">${k ? `${k} terrassé${k > 1 ? "s" : ""}` : boss ? "Un gardien" : "Profondeur " + (M.from || 1)}</p>${STARS(k, tiers)}</div>`; };
    const seen = Object.keys(MONSTERS).filter(k => B[k]).length + BOSSES.filter(b => B[b.id]).length;
    body = `<p class="small dim">${seen} / ${Object.keys(MONSTERS).length + BOSSES.length} créatures découvertes. Chaque étoile est un succès à réclamer.</p><div class="cards">${Object.keys(MONSTERS).map(k => card(k, MONSTERS[k], MONSTERS[k].art, [1, 10, 50])).join("")}</div><h3 style="margin-top:14px">Gardiens</h3><div class="cards">${BOSSES.map(b => card(b.id, b, b.art, [1, 3, 10], 1)).join("")}</div>`;
  }
  if (tab === "arme") body = `<p class="small dim">Forgez chaque arme, puis portez-la en argent et en âme.</p><div class="cards">${WEAPON_IDS.map(k => { const W = WEAPONS[k], o = S.weapons[k]; return `<div class="card ${o ? "" : "unseen"}"><canvas data-cv="wpn:${W.art}:${o ? o.tier : 0}" width="72" height="72" class="px"></canvas><h3 style="margin:4px 0 2px;font-size:14px">${W.n}</h3><p class="small dim" style="margin:0">${o ? TIERS[o.tier].n + (o.q === 2 ? " · chef-d'œuvre" : "") : weaponUnlocked(k) ? "À forger" : "Profondeur " + W.unlock}</p>${STARS(o ? o.tier + 1 : 0, [1, 2, 3])}</div>`; }).join("")}</div>`;
  if (tab === "ach") { const A = S.ach || {}, L = achList().sort((a, b) => ((A[a.id] ? 2 : a.cur() >= a.goal ? 0 : 1) - (A[b.id] ? 2 : b.cur() >= b.goal ? 0 : 1)));
    body = `<p class="small dim">${Object.keys(A).length} / ${L.length} succès obtenus.</p>` + L.map(a => { const done = A[a.id], ready = !done && a.cur() >= a.goal, p = Math.min(1, a.cur() / a.goal); return `<div class="item ${ready ? "on" : ""} ${done ? "done" : ""}"><div class="grow"><h3 style="margin:0;font-size:14px">${a.n}</h3><div class="prog"><i style="width:${Math.round(p * 100)}%"></i></div><p class="small dim" style="margin:2px 0 0">${Math.min(a.cur(), a.goal)} / ${a.goal}</p></div>${done ? `<span class="small good">${ico("star", "#9fe07a")}Obtenu</span>` : ready ? `<button class="btn sm" data-a="claim" data-v="${a.id}">${ico("ember", "#ff8a3a")}+${a.r}</button>` : `<span class="small dim">${ico("ember", "#6a5a4a")}${a.r}</span>`}</div>`; }).join(""); }
  return `<div class="tabs">${T.map(([k, n2]) => `<button class="btn ${tab === k ? "on" : "ghost"}" data-a="ctab" data-v="${k}">${n2}</button>`).join("")}</div>${body}`;
}
ACT.codex = () => { const box = $("#sheet .box"), keep = UI.codexOpen && box ? box.scrollTop : 0; UI.codexOpen = 1; sheet(codexHTML(), { mount: r => { paintMarks(r); const b = $("#sheet .box"); if (b) b.scrollTop = keep; }, onClose: () => { UI.codexOpen = 0; refreshBars(); } }); };
ACT.ctab = v => { UI.ctab = v; UI.codexOpen = 0; ACT.codex(); };
ACT.claim = id => { const r = claimAch(id); if (!r) return; sfx("level"); saveF(); toast(`Succès obtenu : <b>+${r} braises</b>`); ACT.codex(); };
ACT.bestInfo = id => { const boss = BOSSES.find(b => b.id === id), M = boss || MONSTERS[id], k = (S.bestiary || {})[id] || 0;
  sheet(`<div class="card-foe"><canvas data-cv="foe:${M.art}" width="${boss ? 180 : 132}" height="${boss ? 168 : 132}" class="px portrait"></canvas><div class="grow"><h2 style="margin:0">${M.n}</h2><p class="small dim">${boss ? "Gardien" : "Profondeur " + (M.from || 1) + " et plus"} · ${k} terrassé${k > 1 ? "s" : ""}</p><p class="small">${ico("heart", "#e0503a")} ${M.hp} PV de base · ${ico("swords", "#ff8a6a")} ${M.dmg} dégât${M.dmg > 1 ? "s" : ""}</p></div></div><p class="lore">${M.d}</p><div class="center"><button class="btn ghost" data-a="codex">Retour</button></div>`, { mount: paintMarks, onClose: () => refreshBars() }); };
// succès débloqués : un petit mot, une fois
function achCheck() { if (!S) return; const R = achReady(); if (!UI.achSeen) { UI.achSeen = new Set(R.map(a => a.id)); return; } const fresh = R.filter(a => !UI.achSeen.has(a.id)); for (const a of fresh) UI.achSeen.add(a.id); if (fresh.length) { sfx("coin"); toast(`${ico("star", "#ffd27a")} Succès : <b>${fresh[0].n}</b>${fresh.length > 1 ? ` (+${fresh.length - 1})` : ""}<br><span class="small dim">À réclamer dans le Codex</span>`); } }
// ── défi du jour ──
const fmtDay = d => { const s = String(d); return s.slice(6, 8) + "/" + s.slice(4, 6); };
ACT.dailyOpen = () => {
  const seed = dailySeed(), L = dailyLoadout(seed), today = S.daily.day === dayKey() ? S.daily : { best: 0, tries: 0, rewarded: 0 };
  sheet(`<h2 class="center">${ico("daily", "#c49cff")} Défi du ${fmtDay(dayKey())}</h2><p class="center lore">Aujourd'hui, tout le monde descend dans la même mine, avec le même équipement.</p>
    <div class="item"><canvas data-cv="dpreview" width="96" height="96" class="px portrait"></canvas><div class="grow"><p class="small" style="margin:0">${ico(WEAPONS[L.wpn].ic, "#ffb060")} <b>${WEAPONS[L.wpn].n}</b> en fer</p><p class="small" style="margin:4px 0">${ico("armor", "#a8aeb4")} ${ARMOR[L.armor].n}</p><p class="small" style="margin:4px 0">${ico("paw", "#d8c8b0")} ${PETS[L.pet].n}</p><p class="small" style="margin:0">${ico("seal", "#c49cff")} ${L.rune ? RUNES[L.rune].n : "Aucune rune"}</p></div></div>
    <p class="small dim">Score : profondeur × 100, + 10 par monstre, + le minerai ramassé. Le minerai du défi ne se garde pas ; la première descente du jour rapporte des braises.</p>
    <div class="row" style="justify-content:center;gap:16px"><div class="center"><div class="score sm">${today.best}</div><span class="small dim">record du jour</span></div><div class="center"><div class="score sm">${today.tries}</div><span class="small dim">essai${today.tries > 1 ? "s" : ""}</span></div></div>
    <div class="center" style="margin-top:12px"><button class="btn main" data-a="dailyGo" style="min-width:240px">${ico("map")}Relever le défi</button></div>`, { mount: r => { const c = r.querySelector('[data-cv="dpreview"]'); if (c) { const x = c.getContext("2d"); x.imageSmoothingEnabled = false; const look = Object.assign(smithLook(), { armor: L.armor, wpn: WEAPONS[L.wpn].art, wt: 0, mw: 0 }); blit(x, smithPix(look, "idle"), 32, 94, 2); } } });
};
ACT.dailyGo = () => { closeSheet(); startDaily(); saveF(); sfx("door"); go("mine"); };
ACT.dailyShare = async v => { const [sc, d] = v.split("|"), txt = `La Forge des Brumes — défi du ${fmtDay(dayKey())} : score ${sc}, profondeur ${d}. ${GAME_URL}`;
  try { if (navigator.share) { await navigator.share({ text: txt }); return; } } catch (e) { return; }
  try { await navigator.clipboard.writeText(txt); toast("Score copié : collez-le où vous voulez."); } catch (e) { toast(txt); } };
