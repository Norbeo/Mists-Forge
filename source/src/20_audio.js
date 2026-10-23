/* ═══════════════════════ Son : effets synthétisés et musique d'ambiance ═══════════════════════ */
const SND = { ctx: null, master: null, music: null, sfx: null, noise: null, mTimer: null, mOn: false };
function audioInit() {
  if (SND.ctx || !HASWIN) return;
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
    const c = SND.ctx = new C();
    SND.master = c.createGain(); SND.master.gain.value = .8; SND.master.connect(c.destination);
    SND.sfx = c.createGain(); SND.sfx.gain.value = .55; SND.sfx.connect(SND.master);
    SND.music = c.createGain(); SND.music.gain.value = .0; SND.music.connect(SND.master);
    // réverbération simple
    const conv = c.createConvolver(), len = c.sampleRate * 2.2, ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    conv.buffer = ir; SND.rev = c.createGain(); SND.rev.gain.value = .35; SND.rev.connect(conv); conv.connect(SND.master);
    const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1; SND.noise = nb;
  } catch (e) { SND.ctx = null; }
}
function sfxOn() { return S ? S.opts.sound : 1; }
function tone(f, d, type = "sine", v = .2, o = {}) {
  const c = SND.ctx; if (!c || !sfxOn()) return; const t = c.currentTime + (o.at || 0);
  const os = c.createOscillator(), g = c.createGain(); os.type = type; os.frequency.setValueAtTime(f, t); if (o.to) os.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t + d);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + (o.a || .005)); g.gain.exponentialRampToValueAtTime(.0008, t + d);
  os.connect(g); g.connect(SND.sfx); if (o.rev) g.connect(SND.rev); os.start(t); os.stop(t + d + .05);
}
function noise(d, v = .2, o = {}) {
  const c = SND.ctx; if (!c || !sfxOn() || !SND.noise) return; const t = c.currentTime + (o.at || 0);
  const s = c.createBufferSource(); s.buffer = SND.noise; const f = c.createBiquadFilter(); f.type = o.type || "bandpass"; f.frequency.setValueAtTime(o.f || 1200, t); if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + d); f.Q.value = o.q || 1;
  const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + (o.a || .004)); g.gain.exponentialRampToValueAtTime(.0008, t + d);
  s.connect(f); f.connect(g); g.connect(SND.sfx); if (o.rev) g.connect(SND.rev); s.start(t); s.stop(t + d + .05);
}
const SFX = {
  click() { tone(520, .06, "triangle", .08); },
  hover() { tone(880, .03, "sine", .03); },
  open() { noise(.25, .08, { f: 400, to: 1800, q: .7 }); tone(220, .3, "triangle", .05, { rev: 1 }); },
  slash() { noise(.18, .35, { f: 3000, to: 700, q: .8 }); tone(140, .12, "sawtooth", .08, { to: 60 }); },
  heavy() { noise(.3, .45, { f: 900, to: 150, q: .6 }); tone(90, .3, "sine", .3, { to: 40 }); },
  hit() { noise(.12, .35, { f: 1500, to: 300 }); tone(110, .14, "square", .07, { to: 50 }); },
  crit() { noise(.25, .5, { f: 2500, to: 200 }); tone(180, .3, "sawtooth", .12, { to: 50, rev: 1 }); tone(60, .4, "sine", .3, { to: 30 }); },
  miss() { noise(.2, .12, { f: 4000, to: 1500, q: 3 }); },
  shoot() { noise(.08, .3, { f: 2500, q: 2 }); tone(300, .15, "triangle", .06, { to: 900 }); },
  fire() { noise(.6, .3, { f: 600, to: 200, type: "lowpass", rev: 1 }); tone(80, .5, "sawtooth", .05, { to: 40 }); },
  holy() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 1.1, "sine", .06, { at: i * .05, rev: 1, a: .05 })); },
  heal() { [392, 523, 659].forEach((f, i) => tone(f, .8, "sine", .07, { at: i * .08, rev: 1, a: .04 })); },
  dark() { tone(110, .9, "sawtooth", .07, { to: 55, rev: 1 }); noise(.8, .12, { f: 300, type: "lowpass", rev: 1 }); },
  poison() { for (let i = 0; i < 4; i++) tone(300 + Math.random() * 200, .12, "sine", .05, { at: i * .06, to: 120 }); },
  buff() { [330, 440, 554].forEach((f, i) => tone(f, .5, "triangle", .06, { at: i * .06, rev: 1 })); },
  debuff() { [440, 349, 277].forEach((f, i) => tone(f, .4, "triangle", .06, { at: i * .07, rev: 1 })); },
  die() { noise(.7, .3, { f: 500, to: 80, type: "lowpass", rev: 1 }); tone(150, .8, "sawtooth", .08, { to: 40, rev: 1 }); },
  fall() { tone(220, 1.2, "sine", .1, { to: 110, rev: 1 }); tone(165, 1.2, "sine", .08, { to: 82, rev: 1, at: .1 }); },
  ult() { noise(1.2, .3, { f: 200, to: 3000, rev: 1 }); [130, 196, 261, 392].forEach((f, i) => tone(f, 1.6, "sawtooth", .05, { at: i * .08, rev: 1, a: .1 })); },
  coin() { tone(1320, .12, "square", .05); tone(1760, .2, "square", .05, { at: .06 }); },
  level() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, .5, "triangle", .07, { at: i * .08, rev: 1 })); },
  forge() { tone(1800, .4, "triangle", .08, { rev: 1 }); noise(.15, .3, { f: 3000 }); tone(900, .5, "sine", .05, { at: .02, rev: 1 }); },
  door() { noise(.9, .2, { f: 200, to: 80, type: "lowpass", rev: 1 }); tone(60, .8, "sine", .2, { to: 40 }); },
  step() { noise(.08, .1, { f: 300, type: "lowpass" }); },
  win() { [392, 523, 659, 784].forEach((f, i) => tone(f, 1.4, "triangle", .07, { at: i * .12, rev: 1 })); },
  lose() { [392, 330, 262, 196].forEach((f, i) => tone(f, 1.4, "sine", .08, { at: i * .2, rev: 1 })); },
  bell() { tone(196, 3, "sine", .14, { rev: 1 }); tone(392, 2.5, "sine", .05, { rev: 1 }); tone(587, 2, "sine", .03, { rev: 1 }); },
};
// ── un son par arme, par compagnon ──
Object.assign(SFX, {
  w_marteau() { tone(70, .35, "sine", .32, { to: 38 }); noise(.22, .4, { f: 700, to: 140, q: .7 }); tone(1500, .5, "triangle", .05, { at: .02, rev: 1 }); tone(2210, .35, "sine", .03, { at: .02, rev: 1 }); },
  w_lance() { noise(.22, .32, { f: 1800, to: 5000, q: 1.4 }); tone(240, .12, "triangle", .06, { to: 520 }); noise(.06, .25, { f: 900, at: .12 }); },
  w_hache() { noise(.14, .4, { f: 2600, to: 900, q: 1 }); noise(.12, .35, { f: 500, to: 180, at: .08 }); tone(120, .16, "square", .06, { at: .08, to: 70 }); },
  w_arbalete() { tone(180, .09, "square", .08, { to: 90 }); noise(.05, .3, { f: 3200, q: 3 }); tone(520, .2, "triangle", .05, { at: .02, to: 1600 }); noise(.3, .08, { f: 5000, to: 1500, at: .05, q: 4 }); },
  w_faux() { noise(.45, .3, { f: 900, to: 4200, q: 2.5 }); tone(330, .45, "sine", .035, { to: 180, rev: 1 }); },
  w_fleau() { for (let i = 0; i < 3; i++) tone(2400 + i * 300, .05, "square", .025, { at: i * .04 }); tone(60, .45, "sine", .36, { at: .13, to: 30 }); noise(.3, .45, { f: 500, to: 90, at: .13 }); },
  w_epee() { noise(.2, .25, { f: 4200, to: 1200, q: 1.5 }); [880, 1320, 1760].forEach((f, i) => tone(f, .9, "sine", .035, { at: .03 + i * .01, rev: 1 })); },
  p_loup() { noise(.16, .3, { f: 600, to: 250, q: 2 }); tone(160, .16, "sawtooth", .06, { to: 90 }); },
  p_corbeau() { tone(900, .12, "sawtooth", .05, { to: 600 }); tone(820, .14, "sawtooth", .04, { at: .14, to: 520 }); },
  p_chouette() { tone(420, .3, "sine", .07, { to: 380, rev: 1 }); tone(380, .4, "sine", .06, { at: .32, to: 330, rev: 1 }); },
  p_chat() { noise(.12, .22, { f: 3500, to: 2000, q: 2 }); tone(700, .18, "triangle", .04, { to: 1100 }); },
  p_salamandre() { noise(.5, .3, { f: 900, to: 300, type: "lowpass" }); tone(110, .4, "sawtooth", .04, { to: 60 }); },
  p_drake() { noise(.7, .35, { f: 1200, to: 250, type: "lowpass", rev: 1 }); tone(90, .6, "sawtooth", .07, { to: 45 }); },
});
function sfx(k) { try { if (SFX[k]) SFX[k](); } catch (e) { } }
// musique : nappes graves et cloches lentes, en mode mineur
const MUSIC = { bastion: [110, [0, 3, 7, 10], "fire"], combat: [98, [0, 3, 7, 8]], boss: [82, [0, 1, 7, 8]], map: [104, [0, 3, 5, 7]], titre: [110, [0, 3, 7, 12]],
  b0: [98, [0, 3, 7, 10], "drip"], b1: [92, [0, 2, 3, 7], "wind"], b2: [87, [0, 3, 5, 10], "creak"], b3: [82, [0, 1, 4, 7], "fire"], b4: [104, [0, 2, 6, 9], "choir"] };
// bruitages d'ambiance : gouttes, vent, racines qui grincent, braises, chœur lointain
function ambience(kind) {
  const c = SND.ctx; if (!c) return; const t = c.currentTime, out = SND.music;
  const n = (d, v, o) => { const s = c.createBufferSource(); s.buffer = SND.noise; const f = c.createBiquadFilter(); f.type = o.type || "bandpass"; f.frequency.setValueAtTime(o.f, t + (o.at || 0)); if (o.to) f.frequency.linearRampToValueAtTime(o.to, t + (o.at || 0) + d); f.Q.value = o.q || 1; const g = c.createGain(); g.gain.setValueAtTime(0, t + (o.at || 0)); g.gain.linearRampToValueAtTime(v, t + (o.at || 0) + d * .4); g.gain.linearRampToValueAtTime(0, t + (o.at || 0) + d); s.connect(f); f.connect(g); g.connect(out); g.connect(SND.rev); s.start(t + (o.at || 0)); s.stop(t + (o.at || 0) + d + .05); };
  const p = (f, d, v, o = {}) => { const os = c.createOscillator(), g = c.createGain(); os.type = o.type || "sine"; os.frequency.setValueAtTime(f, t + (o.at || 0)); if (o.to) os.frequency.exponentialRampToValueAtTime(o.to, t + (o.at || 0) + d); g.gain.setValueAtTime(0, t + (o.at || 0)); g.gain.linearRampToValueAtTime(v, t + (o.at || 0) + (o.a || .005)); g.gain.exponentialRampToValueAtTime(.0005, t + (o.at || 0) + d); os.connect(g); g.connect(out); g.connect(SND.rev); os.start(t + (o.at || 0)); os.stop(t + (o.at || 0) + d + .05); };
  if (kind === "drip") { for (let i = 0; i < 2; i++) if (Math.random() < .6) { const f = 1400 + Math.random() * 1200, at = Math.random() * 1.4; p(f, .18, .05, { at, to: f * .55 }); } }
  if (kind === "wind") n(1.6, .05, { f: 300 + Math.random() * 300, to: 700 + Math.random() * 500, q: 6 });
  if (kind === "creak" && Math.random() < .45) p(90 + Math.random() * 60, .7, .03, { type: "sawtooth", to: 70, a: .2, at: Math.random() });
  if (kind === "fire") { for (let i = 0; i < 5; i++) n(.04, .07, { f: 2500 + Math.random() * 2500, q: 2, at: Math.random() * 1.4 }); n(1.5, .03, { f: 200, type: "lowpass" }); }
  if (kind === "choir" && Math.random() < .5) { const f = 330 * Math.pow(2, [0, 3, 7, 10][Math.floor(Math.random() * 4)] / 12); for (const dt of [0, .006]) p(f * (1 + dt), 2.6, .02, { a: 1.1, type: "triangle" }); }
}
function musicPlay(kind) {
  if (!SND.ctx) return; SND.mKind = kind;
  const on = S ? S.opts.music : 1;
  SND.music.gain.setTargetAtTime(on ? .32 : 0, SND.ctx.currentTime, .8);
  if (SND.mOn) return; SND.mOn = true;
  let step = 0;
  const tick = () => {
    const c = SND.ctx; if (!c) return; const M = MUSIC[SND.mKind] || MUSIC.bastion, root = M[0], sc = M[1];
    const t = c.currentTime;
    if (step % 4 === 0) { // nappe
      for (const iv of [0, sc[1], sc[2]]) { const f = root * Math.pow(2, (iv + (step % 16 >= 8 ? sc[3] - sc[2] : 0)) / 12); const o = c.createOscillator(), g = c.createGain(), fl = c.createBiquadFilter(); o.type = "sawtooth"; o.frequency.value = f / 2; fl.type = "lowpass"; fl.frequency.value = 500; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + 1.5); g.gain.linearRampToValueAtTime(0, t + 6.2); o.connect(fl); fl.connect(g); g.connect(SND.music); g.connect(SND.rev); o.start(t); o.stop(t + 6.5); }
    }
    if (Math.random() < (SND.mKind === "combat" || SND.mKind === "boss" || /^b\d/.test(SND.mKind) ? .6 : .45)) { // cloche / harpe
      const iv = sc[Math.floor(Math.random() * sc.length)] + (Math.random() < .4 ? 12 : 0); const f = root * 2 * Math.pow(2, iv / 12);
      const o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .01); g.gain.exponentialRampToValueAtTime(.0005, t + 2.4); o.connect(g); g.connect(SND.music); g.connect(SND.rev); o.start(t); o.stop(t + 2.5);
    }
    if ((SND.mKind === "combat" || SND.mKind === "boss" || (/^b\d/.test(SND.mKind) && step % 4 === 0)) && step % 2 === 0) { // tambour
      const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(35, t + .3); g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + .35); o.connect(g); g.connect(SND.music); o.start(t); o.stop(t + .4);
    }
    const A = (MUSIC[SND.mKind] || [])[2]; if (A && (S ? S.opts.music : 1)) try { ambience(A); } catch (e) { }
    step++;
  };
  tick(); SND.mTimer = setInterval(tick, 1500);
}
function musicMute(on) { if (SND.ctx) SND.music.gain.setTargetAtTime(on ? .32 : 0, SND.ctx.currentTime, .3); }
