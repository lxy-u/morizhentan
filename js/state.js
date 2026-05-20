/* ============================================================
   state.js  ——  全局 STATE + 修改 API
   ============================================================ */

window.STATE = {
  // 主角基础数值
  energy: 80,
  sanity: 75,
  supplies: 35,
  reputation: 30,
  corruption: 5,
  money: 0,

  // 世界状态
  day: 1,
  hour: 7,
  minute: 23,
  era: "末日 7 年 · 第 23 天",
  weather: "灰蒙清晨",

  // 背包(物品 id -> 数量)
  inventory: {},
  capUsed: 0,
  capMax: 20,

  // 已知 / 已解锁
  knownNPCs: {},        // id -> true
  knownLocations: {},   // id -> true
  unlockedSkills: {},   // id -> level
  unlockedSystems: {},  // 玩法 id -> true (eg. inventory, map, cases, detectEye, scanScene, search, deepGaze, evidenceWall, reasoning)

  // 关系(0..3 实心点)
  relations: {},        // npc id -> int 0..3

  // 案件
  cases: {
    inProgress: [],     // [{id, stage}]
    closed: [],
    secrets: 0,         // 我的暗线进度 0..6
  },

  // 资料墙(贴上的线索)
  evidenceWall: [],

  // 通知 / 待办
  notices: [],

  // 当前位置
  here: null,           // location id
  scene: null,          // 当前场景 id (调试用)

  // 已 fire 的剧情触发标记
  flags: {},
};

// —— 工具 —————————————————————————————————
window.addNotice = function(text) {
  STATE.notices.unshift({ text, time: `${pad(STATE.hour)}:${pad(STATE.minute)}` });
  UI.renderTopbar();
};

window.clearNotices = function() {
  STATE.notices = [];
  UI.renderTopbar();
};

function pad(n){ return n < 10 ? "0" + n : "" + n; }
window.padTime = pad;

// —— 数值变化 —————————————————————————————
window.applyDelta = function(deltas) {
  const list = [];
  for (const k in deltas) {
    const v = deltas[k];
    if (k === "money") {
      STATE.money += v;
      list.push({ label: `钱 ${v>0?"+":""}${v}`, dir: v>0?"up":"down" });
    } else if (k in STATE && typeof STATE[k] === "number") {
      STATE[k] = clamp(STATE[k] + v, 0, 100);
      const nameMap = { energy:"精力", sanity:"理智", supplies:"物资", reputation:"声望", corruption:"腐化" };
      // 腐化变化不显示给玩家
      if (k !== "corruption") {
        list.push({ label: `${nameMap[k]||k} ${v>0?"+":""}${v}`, dir: v>0?"up":"down" });
      }
    }
  }
  UI.flashDeltas(list);
  UI.renderTopbar();
};

function clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }

// —— 背包 —————————————————————————————————
window.addItem = function(id, qty=1) {
  STATE.inventory[id] = (STATE.inventory[id] || 0) + qty;
  STATE.capUsed = Math.min(STATE.capMax, STATE.capUsed + qty);
  const item = ITEMS[id];
  if (item) UI.flashDeltas([{ label: `获得 ${item.name}${qty>1?" x"+qty:""}`, dir: "info" }]);
};

window.removeItem = function(id, qty=1) {
  if (!STATE.inventory[id]) return;
  STATE.inventory[id] = Math.max(0, STATE.inventory[id] - qty);
  if (STATE.inventory[id] === 0) delete STATE.inventory[id];
  STATE.capUsed = Math.max(0, STATE.capUsed - qty);
};

// —— 学习 / 解锁 ——————————————————————————
window.learnNPC = function(id) {
  if (STATE.knownNPCs[id]) return;
  STATE.knownNPCs[id] = true;
  STATE.relations[id] = STATE.relations[id] || 1;
  const npc = NPCS[id];
  if (npc) UI.flashDeltas([{ label: `认识了 ${npc.name}`, dir: "info" }]);
};

window.learnLocation = function(id) {
  if (STATE.knownLocations[id]) return;
  STATE.knownLocations[id] = true;
  const loc = LOCATIONS[id];
  if (loc) UI.flashDeltas([{ label: `地图新增: ${loc.name}`, dir: "info" }]);
};

window.unlockSkill = function(id, lvl=1) {
  STATE.unlockedSkills[id] = lvl;
};

window.unlockSystem = function(id) {
  STATE.unlockedSystems[id] = true;
};

window.setRelation = function(id, val) {
  STATE.relations[id] = Math.max(0, Math.min(3, val));
};

window.adjustRelation = function(id, delta) {
  STATE.relations[id] = Math.max(0, Math.min(3, (STATE.relations[id]||0) + delta));
};

// —— 时间推进 —————————————————————————————
window.advanceTime = function(minutes) {
  STATE.minute += minutes;
  while (STATE.minute >= 60) { STATE.minute -= 60; STATE.hour++; }
  while (STATE.hour >= 24)   { STATE.hour -= 24; STATE.day++; }
  UI.renderTopbar();
};

// —— 位置 —————————————————————————————————
window.setLocation = function(id) {
  STATE.here = id;
  learnLocation(id);
};
