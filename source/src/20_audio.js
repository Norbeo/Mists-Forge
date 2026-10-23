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
function sfx(k) { try { if (SFX[k]) SFX[k](); } catch (e) { } }
// musique : nappes graves et cloches lentes, en mode mineur
const MUSIC = { bastion: [110, [0, 3, 7, 10]], combat: [98, [0, 3, 7, 8]], boss: [82, [0, 1, 7, 8]], map: [104, [0, 3, 5, 7]], titre: [110, [0, 3, 7, 12]] };
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
    if (Math.random() < (SND.mKind === "combat" || SND.mKind === "boss" ? .7 : .45)) { // cloche / harpe
      const iv = sc[Math.floor(Math.random() * sc.length)] + (Math.random() < .4 ? 12 : 0); const f = root * 2 * Math.pow(2, iv / 12);
      const o = c.createOscillator(), g = c.createGain(); o.type = "triangle"; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05, t + .01); g.gain.exponentialRampToValueAtTime(.0005, t + 2.4); o.connect(g); g.connect(SND.music); g.connect(SND.rev); o.start(t); o.stop(t + 2.5);
    }
    if ((SND.mKind === "combat" || SND.mKind === "boss") && step % 2 === 0) { // tambour
      const o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(35, t + .3); g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + .35); o.connect(g); g.connect(SND.music); o.start(t); o.stop(t + .4);
    }
    step++;
  };
  tick(); SND.mTimer = setInterval(tick, 1500);
}
function musicMute(on) { if (SND.ctx) SND.music.gain.setTargetAtTime(on ? .32 : 0, SND.ctx.currentTime, .3); }
