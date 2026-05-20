/* ============================================================
   story.js  ——  剧情触发器(把侦探片段挂到日子)
   ============================================================ */

window.STORY = {};

// 每个 day 的 morning 事件
STORY.triggerMorning = function(day) {
  // 已经触发过的不重复
  if (STATE.flags["morning_d" + day]) return;
  STATE.flags["morning_d" + day] = true;

  if (day === 1) {
    // Day 1:完整开场 + 醒来 + 教程 → 进入卧室 explore → returnToRoom 后会让 door_leave 触发到 APT.show
    APT.hide();
    SCENE.play(SCENES.opening);
  } else if (day === 2) {
    APT.hide();
    const broken = STATE.flags["doorBroken_d1"];
    const beats = broken ? [
      { type: "bg", view: "bedroom" },
      { type: "place", name: "Day 2 · 苏宁的公寓" },
      { type: "show", who: "suning", expr: "tired" },
      { type: "narration", text: "门外的撞击停了。天微微亮。" },
      { type: "dialog", who: "suning", text: "......撑过来了。" },
      { type: "dialog", who: "suning", text: "但门破了一个洞。" },
      { type: "narration", style: "think", text: "(肩膀火辣辣地疼。)" },
      { type: "notice", text: "🩸 受伤:精力/理智已扣除" },
      { type: "fn", fn: () => APT.show() },
    ] : [
      { type: "bg", view: "bedroom" },
      { type: "place", name: "Day 2 · 苏宁的公寓" },
      { type: "show", who: "suning", expr: "neutral" },
      { type: "narration", text: "天亮了。这一夜守住了。" },
      { type: "dialog", who: "suning", text: "明天会更难。" },
      { type: "dialog", who: "suning", text: "但今天我还在。" },
      { type: "fn", fn: () => APT.show() },
    ];
    SCENE.play(beats);
  } else {
    // Day 3+:占位
    APT.hide();
    SCENE.play([
      { type: "bg", view: "bedroom" },
      { type: "place", name: `Day ${day}` },
      { type: "narration", style: "system", text: `(Day ${day} 的剧情还没写。)` },
      { type: "fn", fn: () => APT.show() },
    ]);
  }
};

// 门外占位(玩家点了"出门"按钮)
SCENES.outdoor_placeholder = [
  { type: "bg", view: "street" },
  { type: "place", name: "门外 · 街道" },
  { type: "narration", style: "system", text: "(门外的剧情还没开放。)" },
  { type: "narration", text: "你站在楼道里。" },
  { type: "narration", text: "电梯按了没反应,得走楼梯。" },
  { type: "dialog", who: "suning", text: "......算了,回家。物资还不够。" },
  { type: "fn", fn: () => APT.show() },
];

// —— 重写 returnToRoom:从 morning 探索结束后回公寓而非 room ——
const _originalReturn = window.returnToRoom;
window.returnToRoom = function(opts = {}) {
  const id = opts.markDoneFor;
  if (id) {
    STATE.flags["hs_" + id + "_done"] = true;
    if (opts.countAsRead) STATE.flags.read_count = (STATE.flags.read_count || 0) + 1;
  }
  if (opts.unlock) STATE.flags["hs_" + opts.unlock + "_unlocked"] = true;

  // 在公寓 morning 探索阶段,read 够了就直接结束 morning,进白天
  if (STATE.flags.morning_exploring && STATE.flags.read_count >= 3) {
    STATE.flags.morning_exploring = false;
    document.getElementById("room-layer").hidden = true;
    // 早晨结束 → 进入公寓白天
    WORLD.setTime(8, 30);
    APT.show();
    addNotice("📋 该开始今天的日子了");
    return;
  }
  // 否则继续在房间里摸
  ROOM.enter(ROOM.currentRoomId || "bedroom");
};

// —— 重写 door_leave:从公寓出门改为触发 outdoor ——
SCENES.fragments.door_leave_apt = [
  { type: "fn", fn: () => {
    APT.hide();
    SCENE.play(SCENES.outdoor_placeholder);
  }},
];
