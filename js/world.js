/* ============================================================
   world.js  ——  世界时钟 + 资源 tick + 时段切换
   ============================================================ */

window.WORLD = {
  // 游戏时间(分钟,0 = Day 1 00:00)
  minutes: 0,
  day: 1,
  phase: "morning",     // morning / day / dusk / night
  phaseLastTriggered: null,
  // 真实速度:每 4 秒 = 1 游戏小时(1 天 = 96 秒,可调)
  tickIntervalMs: 4000 / 60,   // 每多少毫秒 +1 游戏分钟
  _timer: null,
  paused: true,
  // 资源 — 与 STATE.resources 共用,这里只列定义
};

// 资源定义:每分钟净变化
window.RESOURCES = {
  food:     { name: "食物",   icon: "🥫", init: 8,  tickPerMin: -0.04 },
  water:    { name: "水",     icon: "💧", init: 6,  tickPerMin: -0.05 },
  power:    { name: "电",     icon: "⚡", init: 5,  tickPerMin: -0.02 },
  material: { name: "材料",   icon: "🧰", init: 4,  tickPerMin: +0.02 },
  ammo:     { name: "子弹",   icon: "🔫", init: 6,  tickPerMin: 0 },
};

// 初始化资源(挂到 STATE)
function initResources() {
  STATE.res = STATE.res || {};
  for (const k in RESOURCES) {
    if (STATE.res[k] == null) STATE.res[k] = RESOURCES[k].init;
  }
}
window.initResources = initResources;

// 时段判定
function computePhase(hour) {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "day";
  if (hour >= 18 && hour < 20) return "dusk";
  return "night";
}

WORLD.start = function() {
  if (WORLD._timer) return;
  WORLD.paused = false;
  WORLD._timer = setInterval(() => {
    if (WORLD.paused) return;
    WORLD.minutes += 1;
    // 资源 tick
    for (const k in RESOURCES) {
      STATE.res[k] = Math.max(0, (STATE.res[k] || 0) + RESOURCES[k].tickPerMin);
    }
    // 时段判定
    const h = Math.floor((WORLD.minutes % (24*60)) / 60);
    const m = WORLD.minutes % 60;
    const newPhase = computePhase(h);
    if (newPhase !== WORLD.phase) {
      WORLD.phase = newPhase;
      onPhaseChange(newPhase);
    }
    // 翻天
    if (WORLD.minutes >= 24*60) {
      WORLD.minutes = 0;
      WORLD.day++;
      onNewDay(WORLD.day);
    }
    // 同步 STATE 时间(供顶栏显示)
    STATE.hour = h;
    STATE.minute = m;
    STATE.day = WORLD.day;
    if (window.UI) UI.renderTopbar();
    if (window.APT && APT.renderTopHud) APT.renderTopHud();
  }, WORLD.tickIntervalMs);
};

WORLD.pause = function()  { WORLD.paused = true; };
WORLD.resume = function() { WORLD.paused = false; };
WORLD.stop = function() {
  if (WORLD._timer) clearInterval(WORLD._timer);
  WORLD._timer = null;
};

WORLD.setTime = function(hour, minute = 0) {
  WORLD.minutes = (hour * 60 + minute) % (24 * 60);
  WORLD.phase = computePhase(hour);
  STATE.hour = hour;
  STATE.minute = minute;
  if (window.UI) UI.renderTopbar();
  if (window.APT && APT.renderTopHud) APT.renderTopHud();
};

// 时段切换 — 触发对应事件
function onPhaseChange(phase) {
  WORLD.phaseLastTriggered = phase;
  if (window.APT && APT.applyPhaseLook) APT.applyPhaseLook(phase);
  if (phase === "dusk") {
    if (window.UI) UI.flashDeltas([{ label: "🌇 黄昏 · 准备布防", dir: "info" }]);
    addNotice("🌇 天黑前布防");
  } else if (phase === "night") {
    if (window.SFX) SFX.play("buzz");
    addNotice("🌑 丧尸来了");
    if (window.DEFENSE) DEFENSE.start();
  } else if (phase === "morning") {
    if (window.UI) UI.flashDeltas([{ label: "🌅 天亮了 · Day " + WORLD.day, dir: "info" }]);
  }
}

function onNewDay(day) {
  addNotice("📅 Day " + day + " 开始");
  // 触发当日 morning 事件
  if (window.STORY && STORY.triggerMorning) STORY.triggerMorning(day);
}
