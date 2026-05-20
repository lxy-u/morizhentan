/* ============================================================
   apartment.js  ——  公寓主屏交互
   ============================================================ */

window.APT = {
  shown: false,
};

APT.show = function() {
  APT.shown = true;
  // 隐藏其他层
  document.getElementById("room-layer").hidden = true;
  document.getElementById("defense-layer").hidden = true;
  // 公寓显示
  document.getElementById("apt-layer").hidden = false;
  // 顶部老状态条隐藏(我们用 apt-hud 代替)
  document.getElementById("topbar").style.display = "none";
  // 底栏保留
  APT.renderTopHud();
  APT.applyPhaseLook(WORLD.phase);
  if (window.NBR) NBR.renderRail();
  APT.bindZones();
  if (!WORLD._timer) WORLD.start();
};

APT.hide = function() {
  APT.shown = false;
  document.getElementById("apt-layer").hidden = true;
  document.getElementById("topbar").style.display = "";
};

APT.renderTopHud = function() {
  const t = document.getElementById("hud-time");
  if (!t) return;
  const phaseIcon = { morning:"🌅", day:"☀️", dusk:"🌇", night:"🌑" }[WORLD.phase] || "";
  const h = padTime(STATE.hour), m = padTime(STATE.minute);
  t.textContent = `Day ${WORLD.day} · ${h}:${m} · ${phaseIcon}`;

  const r = document.getElementById("hud-res");
  if (!r) return;
  r.innerHTML = "";
  for (const k in RESOURCES) {
    const def = RESOURCES[k];
    const v = Math.floor(STATE.res[k] || 0);
    const cell = document.createElement("div");
    cell.className = "res-cell" + (v < 2 ? " low" : "");
    cell.innerHTML = `<span class="ic">${def.icon}</span>${v}`;
    r.appendChild(cell);
  }
};

APT.applyPhaseLook = function(phase) {
  const layer = document.getElementById("apt-layer");
  if (!layer) return;
  layer.classList.remove("morning","day","dusk","night");
  layer.classList.add(phase);
};

APT.bindZones = function() {
  document.querySelectorAll(".apt-zone").forEach(el => {
    el.onclick = () => {
      const zone = el.dataset.zone;
      APT.openZone(zone);
    };
  });
};

APT.openZone = function(zone) {
  const def = ZONE_ACTIONS[zone];
  if (!def) return;
  const head = document.getElementById("as-head");
  const body = document.getElementById("as-body");
  head.textContent = def.title;
  body.innerHTML = "";

  const acts = (typeof def.actions === "function" ? def.actions() : def.actions) || [];
  for (const act of acts) {
    const btn = document.createElement("button");
    btn.className = "as-act";
    btn.innerHTML = `<div>${act.label}</div>`;
    if (act.cost) {
      const costParts = [];
      for (const k in act.cost) {
        const have = STATE.res[k] || 0, need = act.cost[k];
        const ok = have >= need;
        costParts.push(`<span class="${ok?'':'bad'}">${RESOURCES[k].icon} ${need}</span>`);
        if (!ok) btn.disabled = true;
      }
      btn.innerHTML += `<div class="as-cost">耗:${costParts.join(" ")}</div>`;
    }
    if (act.gainText) btn.innerHTML += `<div class="as-cost">↑ ${act.gainText}</div>`;
    if (act.disabledReason) { btn.disabled = true; btn.innerHTML += `<div class="as-cost bad">${act.disabledReason}</div>`; }
    btn.onclick = () => {
      if (btn.disabled) return;
      // 消耗
      if (act.cost) for (const k in act.cost) STATE.res[k] -= act.cost[k];
      // 收益
      if (act.gain) for (const k in act.gain) STATE.res[k] = (STATE.res[k]||0) + act.gain[k];
      // 自定义
      if (act.fn) act.fn();
      // 关闭菜单
      APT.closeSheet();
      // 刷新
      APT.renderTopHud();
      // 闪一下数值
      if (act.gain && window.UI) {
        UI.flashDeltas(Object.entries(act.gain).map(([k,v]) => ({
          label: `${RESOURCES[k].icon} ${RESOURCES[k].name} +${v}`,
          dir: "up"
        })));
      }
    };
    body.appendChild(btn);
  }

  document.getElementById("action-sheet").hidden = false;
  document.getElementById("as-close").onclick = APT.closeSheet;
};

APT.closeSheet = function() {
  document.getElementById("action-sheet").hidden = true;
};

// ============================================================
// 区域动作定义
// ============================================================
window.ZONE_ACTIONS = {
  garden: {
    title: "🌱 菜园",
    actions: [
      { label: "采摘(消耗水 1,得食物 3)",
        cost: { water: 1 }, gain: { food: 3 },
        gainText: "食物 +3" },
      { label: "施肥升级(材料 3)",
        cost: { material: 3 },
        gainText: "未来产出 +50%(MVP 占位)",
        fn: () => addNotice("🌱 菜园已升级(占位)") },
    ],
  },
  water: {
    title: "💧 净水器",
    actions: [
      { label: "净化(电 1,得水 4)",
        cost: { power: 1 }, gain: { water: 4 },
        gainText: "水 +4" },
      { label: "检修(材料 2)",
        cost: { material: 2 },
        gainText: "未来产出 +50%(占位)",
        fn: () => addNotice("💧 净水器已检修(占位)") },
    ],
  },
  workshop: {
    title: "🔧 工作台 + 储物",
    actions: () => [
      { label: "造子弹(材料 2 → 子弹 3)",
        cost: { material: 2 }, gain: { ammo: 3 } },
      { label: "造门板(材料 4 → +门 HP 30)",
        cost: { material: 4 },
        fn: () => {
          STATE.door = STATE.door || { hp: 100, max: 100 };
          STATE.door.hp = Math.min(STATE.door.max, STATE.door.hp + 30);
          addNotice("🚪 门 HP +30");
        }},
      { label: "看背包",
        fn: () => UI.openPanel("inventory") },
    ],
  },
  bedroom: {
    title: "🛏 卧室",
    actions: () => [
      { label: "🛏 睡 1 小时(精力 +20)",
        fn: () => {
          STATE.energy = Math.min(100, STATE.energy + 20);
          WORLD.minutes += 60;
          APT.renderTopHud(); UI.renderTopbar();
          addNotice("💤 睡了一小时");
        }},
      { label: "📖 进卧室探索(剧情)",
        fn: () => { APT.hide(); ROOM.enter("bedroom"); }},
    ],
  },
  hallway: {
    title: "🚪 客厅 + 玄关",
    actions: () => [
      { label: "🪞 站到镜子前",
        fn: () => {
          APT.hide();
          SCENE.play(SCENES.fragments.mirror_first);
        }},
      { label: "🚪 出门(去街道)",
        fn: () => {
          APT.hide();
          SCENE.play(SCENES.outdoor_placeholder || SCENES.fragments.door_blocked);
        }},
      { label: "🛡 加固门(材料 5)",
        cost: { material: 5 },
        fn: () => {
          STATE.door = STATE.door || { hp: 100, max: 100 };
          STATE.door.max += 30; STATE.door.hp += 30;
          addNotice("🛡 门加固完成");
        }},
    ],
  },
};
