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
  const rs = () => { SC.dpr = Math.min(2, devicePixelRatio || 1); SC.w = innerWidth; SC.h = innerHeight; SC.cv.width = Math.round(SC.w * SC.dpr); SC.cv.height = Math.round(SC.h * SC.dpr); if (SCREENS[UI.screen] && SCREENS[UI.screen].resize) SCREENS[UI.screen].resize(); };
  addEventListener("resize", rs); rs();
  SC.cv.addEventListener("pointerdown", e => { audioInit(); if (SC.tap) SC.tap(e.clientX, e.clientY); });
  const loop = now => { const dt = Math.min(.05, (now - (SC.last || now)) / 1000); SC.last = now; SC.t += dt; const x = SC.x; x.setTransform(SC.dpr, 0, 0, SC.dpr, 0, 0); try { if (SC.draw) SC.draw(x, SC.t, dt); } catch (e) { console.error(e); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
const SCREENS = {};
function go(name, arg) {
  UI.screen = name; UI.arg = arg; SC.tap = null;
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
  scene: () => (x, t) => { drawForgeRoom(x, SC.w, SC.h, t); const v = x.createRadialGradient(SC.w / 2, SC.h * .45, 50, SC.w / 2, SC.h * .45, Math.max(SC.w, SC.h) * .8); v.addColorStop(0, "rgba(0,0,0,.1)"); v.addColorStop(1, "rgba(0,0,0,.8)"); x.fillStyle = v; x.fillRect(0, 0, SC.w, SC.h); },
  mid: () => `<div class="title" style="pointer-events:auto"><div class="logo">La Forge<br>des Brumes<small>LA MINE SANS FOND</small></div><p class="lore" style="max-width:380px">Sous la forge, une mine maudite. Descendez, frappez, remontez forger. Plus bas, toujours plus bas.</p><button class="btn main" data-a="play" style="min-width:250px">${ico("hammer")}${loadF() ? "Continuer" : "Jouer"}</button>${PWA.standalone ? "" : `<button class="btn ghost sm" data-a="install">${ico("install")}Installer l'appli</button>`}</div>`,
};
ACT.play = () => { S = loadF() || newSave(); musicPlay("bastion"); if (S.run && S.run.board) go("mine"); else go("forge"); };
ACT.install = async () => {
  if (PWA.prompt) { PWA.prompt.prompt(); try { await PWA.prompt.userChoice; } catch (e) { } PWA.prompt = null; return; }
  const how = PWA.framed ? `<p>Ici, le jeu est affiché dans un aperçu : ouvrez-le sur son site pour l'installer.</p><p class="center"><a class="btn main" href="${GAME_URL}" target="_blank" rel="noopener">Ouvrir le jeu</a></p>`
    : PWA.ios ? `<p>Dans <b>Safari</b> : bouton <b>Partager</b>, puis <b>« Sur l'écran d'accueil »</b>.</p>` : PWA.android ? `<p>Dans <b>Chrome</b> : menu <b>⋮</b>, puis <b>« Installer l'application »</b>.</p>` : `<p>Dans <b>Chrome</b> ou <b>Edge</b> : l'icône d'installation à droite de la barre d'adresse.</p>`;
  sheet(`<h2>${ico("install")} Installer</h2>${how}<p class="small dim">Le jeu s'ouvre alors en plein écran et fonctionne sans connexion.</p>`);
};

// ── la forge (écran principal) ──
SCREENS.forge = {
  top: () => `${oreChips(S.ore, true)}<span class="pill" style="color:#ffb060" title="Braises">${ico("ember", "#ff8a3a")}${S.braises}</span><span class="grow"></span><span class="pill">${ico("up", "#e8c878")}${S.best}</span><button class="btn ghost icon" data-a="opts">${ico("gear")}</button>`,
  bot: () => `<p class="hint">${S.best ? `Record : profondeur <b>${S.best}</b>` : "La mine attend. Le minerai aussi."}</p><button class="btn main" data-a="descend" style="width:100%;max-width:460px">${ico("map")}Descendre${S.up.raccourci && S.bossDepth ? ` · prof. ${S.bossDepth + 1}` : ""}</button><div class="row w"><button class="btn" data-a="forgeOpen">${ico("anvil")}Forger</button><button class="btn" data-a="petOpen">${ico("paw")}Compagnon</button></div>`,
  scene: () => {
    let hammer = 0, lastHit = 0;
    return (x, t, dt) => {
      const R = drawForgeRoom(x, SC.w, SC.h, t);
      const port = SC.w < SC.h, sc = Math.min(SC.h * .0019, SC.w * .0034) * (port ? 1 : .9);
      const ax = port ? SC.w * .56 : SC.w * .38, ay = R.floorY + SC.h * .04;
      // compagnon
      const ps = petSpr(S.pet, 0, sc * .9); x.save(); x.translate(ax - 125 * sc, ay + 8); x.scale(-1, 1); x.drawImage(ps, -ps.ax, -ps.ay); x.restore();
      drawAnvil(x, ax + 40 * sc, ay, sc * 1.1);
      // le forgeron frappe l'enclume
      const ph = (t * 1.1) % 1, pose = ph < .55 ? "forge" : "forge2";
      if (pose === "forge2" && hammer === 0) { hammer = 1; if (t - lastHit > .5) { lastHit = t; if (UI.screen === "forge" && $("#sheet").hidden) sfx("forge"); } }
      if (pose === "forge") hammer = 0;
      const sp = smithSprite(pose, sc); x.drawImage(sp, ax - 30 * sc - sp.ax, ay - sp.ay);
      if (pose === "forge2" && ph < .7) { x.save(); x.globalCompositeOperation = "lighter"; for (let i = 0; i < 6; i++) glow(x, ax + 50 * sc + Math.cos(i) * (ph - .55) * 300 * sc, ay - 52 * sc - Math.abs(Math.sin(i * 2)) * (ph - .55) * 200 * sc, 4, "#ffd08a", .9); x.restore(); }
      const v = x.createRadialGradient(ax, ay - 80, 80, ax, ay - 80, Math.max(SC.w, SC.h) * .75); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.75)"); x.fillStyle = v; x.fillRect(0, 0, SC.w, SC.h);
    };
  },
  mount: () => { if (!S.tuto.forge) { S.tuto.forge = 1; sheet(`<h2>${ico("anvil")} La forge</h2><p class="lore">Votre grand-père a creusé trop profond. La mine s'est réveillée.</p><p><b>Descendre</b> : chaque étage est une petite grille. À votre tour, vous pouvez <b>vous déplacer</b> d'une case et <b>frapper</b> une fois.</p><p>Les cases <b class="bad">rouges</b> montrent où les monstres vont frapper : ne restez pas dessus.</p><p>Frappez les <b>filons</b> pour récolter du minerai, puis remontez <b>forger</b> de meilleures armes et armures.</p><div class="center"><button class="btn main" data-a="close">À l'enclume</button></div>`); } },
};
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
function paintMarks(root) { root.querySelectorAll("canvas[data-cv]").forEach(c => { const [k, v] = c.dataset.cv.split(":"); const x = c.getContext("2d"); if (k === "arm") { const L = Object.assign(smithLook(), { tier: ARMOR[+v].look }); const sp = heroSprite(L, {}, 0, c.width / 160); x.drawImage(sp, c.width / 2 - sp.ax, c.height - 2 - sp.ay); } if (k === "pet") { const sp = petSpr(v, 0, c.width / 170); x.drawImage(sp, c.width / 2 - sp.ax, c.height - 4 - sp.ay); } }); }
ACT.forgeOpen = () => { sheet(forgeHTML(), { mount: paintMarks, onClose: () => refreshBars() }); };
ACT.ftab = v => { UI.ftab = v; ACT.forgeOpen(); };
ACT.equipW = k => { S.equip.wpn = k; saveF(); ACT.forgeOpen(); };
ACT.equipR = k => { S.equip.rune = S.equip.rune === k ? null : k; saveF(); ACT.forgeOpen(); };
ACT.buyUp = k => { if (!buyUp(k)) return; sfx("level"); saveF(); ACT.forgeOpen(); };
ACT.forgeW = k => minigame(WEAPONS[k].n, q => { if (forgeWeapon(k, q)) { saveF(); toast(`${WEAPONS[k].n} : <b>${TIERS[S.weapons[k].tier].n}</b>, ${QUALITY[q].n.toLowerCase()} !`); } ACT.forgeOpen(); });
ACT.forgeA = () => minigame(ARMOR[S.equip.armor + 1].n, q => { if (forgeArmor(q)) { saveF(); toast(`${ARMOR[S.equip.armor].n} forgée, ${QUALITY[q].n.toLowerCase()} !`); } ACT.forgeOpen(); });
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
