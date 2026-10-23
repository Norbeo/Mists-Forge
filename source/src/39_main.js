/* ═══════════════════════ Démarrage ═══════════════════════ */
if (HASWIN) {
  const boot = () => {
    sceneInit(); events();
    if (window.FB_SW && "serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => { });
    go("title");
    document.addEventListener("pointerdown", () => { audioInit(); if (SND.ctx && SND.ctx.state === "suspended") SND.ctx.resume(); if (!SND.mOn) musicPlay(UI.screen === "mine" && S.run ? (S.run.board.boss ? "boss" : "b" + bIdx(S.run.depth)) : "bastion"); });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
}
