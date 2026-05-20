/* ============================================================
   room.js  ——  探索模式:房间 + 热区系统
   ============================================================ */

/*
   ROOMS:房间数据(每个房间的 bg + 热区)
   热区坐标:百分比,基于 1080×1920 竖屏
   热区类型:
     - mustRead:必须看完才能出门
     - critical:呼吸引导(玩家必须先看的关键道具)
     - hidden:默认不出现,由 fn 解锁
     - gated:点了走门控逻辑
*/
window.ROOMS = {
  bedroom: {
    bg: "bedroom",
    place: "苏宁的公寓 · 卧室",
    hotspots: [
      // 窗(左上,远景)
      { id: "window",   name: "窗",      x: 8,  y: 24, w: 22, h: 22 },
      // 床头柜上的笔记本(中下)— 关键引导
      { id: "notebook", name: "笔记本",  x: 38, y: 56, w: 14, h: 8,  critical: true, mustRead: true },
      // 手机
      { id: "phone",    name: "手机",    x: 55, y: 56, w: 11, h: 8,  mustRead: true },
      // 床(玩家点了之后 underbed 才出现)
      { id: "bed",      name: "床",      x: 25, y: 70, w: 32, h: 16, hint: "弯下腰看看" },
      // 床底铝盒 — 默认隐藏,点了 bed 才出现
      { id: "underbed", name: "床底",    x: 30, y: 86, w: 22, h: 6, hidden: true, mustRead: false },
      // 镜子(右,玄关方向)
      { id: "mirror",   name: "镜子",    x: 70, y: 38, w: 14, h: 22 },
      // 门(最右,出门)
      { id: "door",     name: "门",      x: 82, y: 30, w: 14, h: 50, gated: true },
    ],
  },
};

window.ROOM = {
  currentRoomId: null,
  isInRoom: false,
};

ROOM.enter = function(roomId) {
  const def = ROOMS[roomId];
  if (!def) return;
  ROOM.currentRoomId = roomId;
  ROOM.isInRoom = true;

  // 切到 explore 模式
  const vp = document.getElementById("viewport");
  vp.classList.remove("cinema", "zooming");
  vp.classList.add("explore");

  // 房间层显示
  const layer = document.getElementById("room-layer");
  layer.hidden = false;

  // 收起戏剧 UI
  if (typeof clearSubtitle === "function") clearSubtitle();
  if (typeof clearChoices === "function")  clearChoices();
  if (typeof hideChar === "function")      hideChar();

  // bg 切换
  if (typeof switchBg === "function") switchBg(def.bg);

  // 场景小角标
  if (def.place && typeof showPlace === "function") showPlace(def.place);

  // 渲染热区
  renderHotspots(def);

  // 入场闪一次
  setTimeout(() => {
    document.querySelectorAll(".hotspot").forEach(el => {
      el.classList.add("intro-flash");
      setTimeout(() => el.classList.remove("intro-flash"), 1600);
    });
  }, 200);

  // 右下提示(只在第一次进入显示)
  if (!STATE.flags.roomHintShown) {
    const hint = document.getElementById("room-hint");
    hint.hidden = false;
    hint.classList.remove("fade");
    STATE.flags.roomHintShown = true;
    setTimeout(() => hint.classList.add("fade"), 4000);
    setTimeout(() => { hint.hidden = true; }, 5500);
  } else {
    document.getElementById("room-hint").hidden = true;
  }
};

ROOM.leave = function() {
  ROOM.isInRoom = false;
  document.getElementById("room-layer").hidden = true;
  const vp = document.getElementById("viewport");
  vp.classList.remove("explore");
  vp.classList.add("cinema");
};

function renderHotspots(def) {
  const stage = document.getElementById("room-stage");
  stage.innerHTML = "";
  for (const h of def.hotspots) {
    if (h.hidden && !STATE.flags["hs_" + h.id + "_unlocked"]) continue;
    const div = document.createElement("div");
    div.className = "hotspot";
    div.dataset.id = h.id;
    div.style.left = h.x + "%";
    div.style.top  = h.y + "%";
    div.style.width  = h.w + "%";
    div.style.height = h.h + "%";

    // 标签
    const lbl = document.createElement("div");
    lbl.className = "hotspot-label";
    lbl.textContent = h.name;
    div.appendChild(lbl);

    // 状态:已读 → 冷态
    if (STATE.flags["hs_" + h.id + "_done"]) div.classList.add("cold");

    // 关键道具:呼吸引导(仅当未读)
    if (h.critical && !STATE.flags["hs_" + h.id + "_done"]) {
      div.classList.add("breathing");
    }

    // 门:门控条件未满足 → 不呼吸
    if (h.gated && checkDoorReady()) div.classList.add("breathing");

    // 新解锁的热区:进入动画
    if (h.hidden && STATE.flags["hs_" + h.id + "_unlocked"] && !STATE.flags["hs_" + h.id + "_seen"]) {
      div.classList.add("new-spawn");
      STATE.flags["hs_" + h.id + "_seen"] = true;
    }

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      ROOM.clickHotspot(h);
    });

    stage.appendChild(div);
  }
}

ROOM.clickHotspot = function(h) {
  // 视觉:zap
  const el = document.querySelector(`.hotspot[data-id="${h.id}"]`);
  if (el) {
    el.classList.add("zap");
    setTimeout(() => el && el.classList.remove("zap"), 500);
  }
  // 推近过渡 → 戏剧模式
  const vp = document.getElementById("viewport");
  // 设置推近原点
  vp.style.setProperty("--zoom-x", (h.x + h.w / 2) + "%");
  vp.style.setProperty("--zoom-y", (h.y + h.h / 2) + "%");
  vp.classList.add("zooming");

  // 决定播哪一段
  const key = pickBeatKey(h.id);
  const beats = (SCENES.fragments || {})[key];

  setTimeout(() => {
    // 戏剧接管
    ROOM.leave();
    vp.classList.remove("zooming");
    if (window.SFX) SFX.play(h.id === "door" && checkDoorReady() ? "door" : "click");
    if (beats) {
      SCENE.play(beats);
    } else {
      // 无 fragment 兜底
      SCENE.play([
        { type: "narration", style: "think", text: `(${h.name}……没什么好看的。)` },
        { type: "fn", fn: () => returnToRoom() },
      ]);
    }
  }, 600);
};

// —— 回到房间(供 fragments 末尾调用) ——
window.returnToRoom = function(opts = {}) {
  const id = opts.markDoneFor;
  if (id) {
    STATE.flags["hs_" + id + "_done"] = true;
    STATE.flags["read_count"] = (STATE.flags.read_count || 0) + (opts.countAsRead ? 1 : 0);
  }
  if (opts.unlock) {
    STATE.flags["hs_" + opts.unlock + "_unlocked"] = true;
  }
  // 回到当前房间
  ROOM.enter(ROOM.currentRoomId || "bedroom");
};

// —— 出门条件 ——
function checkDoorReady() {
  return (STATE.flags.read_count || 0) >= 3;
}
window.checkDoorReady = checkDoorReady;

// —— Beat 分发:根据热区 id 与 state 选 fragment key ——
window.pickBeatKey = function(hotspotId) {
  const F = STATE.flags;
  if (hotspotId === "door") return checkDoorReady() ? "door_leave" : "door_blocked";
  if (hotspotId === "underbed") return F.box_seen ? "underbed_revisit" : "underbed_first";
  if (hotspotId === "bed" && !F.bed_checked) return "bed_check";
  if (hotspotId === "bed") return "bed_revisit";
  if (F["hs_" + hotspotId + "_done"]) return hotspotId + "_revisit";
  return hotspotId + "_first";
};
