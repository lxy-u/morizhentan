/* ============================================================
   main.js  ——  启动入口
   ============================================================ */

(function boot() {

  // 已知地点初始化
  for (const id in LOCATIONS) {
    if (LOCATIONS[id].knownAtStart) STATE.knownLocations[id] = true;
  }
  STATE.here = "home";

  // 顶部栏首次渲染
  UI.renderTopbar();

  // 按钮事件
  document.querySelectorAll(".bb-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const which = btn.getAttribute("data-panel");
      UI.openPanel(which);
    });
  });
  $("#panel-close").addEventListener("click", UI.closePanel);
  $("#panel-overlay").addEventListener("click", (e) => {
    if (e.target.id === "panel-overlay") UI.closePanel();
  });

  // 通知铃铛
  $("#tb-bell").addEventListener("click", () => UI.toggleBellDrawer());
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#bell-drawer") && !e.target.closest("#tb-bell")) {
      UI.toggleBellDrawer(false);
    }
  });

  // 启动 S1
  SCENE.play(SCENES.S1);

})();
