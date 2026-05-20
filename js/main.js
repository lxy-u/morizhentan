/* ============================================================
   main.js  ——  启动入口
   ============================================================ */

(function boot() {

  // 已知地点
  for (const id in LOCATIONS) {
    if (LOCATIONS[id].knownAtStart) STATE.knownLocations[id] = true;
  }
  STATE.here = "home";

  // 资源 + 邻居
  if (window.initResources) initResources();
  if (window.NBR) NBR.init();
  // 门 HP
  STATE.door = STATE.door || { hp: 100, max: 100 };

  // 顶栏(老的会被 apt-hud 接管,但 modal 渲染等还要)
  UI.renderTopbar();

  // 底部按钮
  document.querySelectorAll(".bb-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const which = btn.getAttribute("data-panel");
      UI.openPanel(which);
    });
  });
  document.getElementById("panel-close").addEventListener("click", UI.closePanel);
  document.getElementById("panel-overlay").addEventListener("click", (e) => {
    if (e.target.id === "panel-overlay") UI.closePanel();
  });

  // 铃铛
  document.getElementById("tb-bell").addEventListener("click", () => UI.toggleBellDrawer());
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#bell-drawer") && !e.target.closest("#tb-bell")) {
      UI.toggleBellDrawer(false);
    }
  });

  // 视口推进
  if (window.bindViewportAdvance) bindViewportAdvance();

  // 回看
  const blBtn = document.getElementById("backlog-btn");
  const blClose = document.getElementById("backlog-close");
  if (blBtn)   blBtn.addEventListener("click",   () => toggleBacklog(true));
  if (blClose) blClose.addEventListener("click", () => toggleBacklog(false));

  // 启动 Day 1 morning
  STATE.flags = STATE.flags || {};
  if (window.STORY) STORY.triggerMorning(1);
  else SCENE.play(SCENES.opening);

})();
