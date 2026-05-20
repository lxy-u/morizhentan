/* ============================================================
   scenes.js  ——  Day 1 · 第一场「醒来」(探索 + 戏剧 双模式)

   结构:
     - SCENES.opening / S1_alarm / S1_tutorial:开场强制播
     - 之后:ROOM.enter("bedroom") → 玩家自由探索
     - SCENES.fragments[key]:每个热区/状态对应的剧情片段
   ============================================================ */

window.SCENES = {};

// ============================================================
// 开场强制流程
// ============================================================
SCENES.opening = [
  { type: "fade",
    bg: "#000",
    lines: [
      { text: "2031 年 3 月 14 日,世界开始坏了。" },
      { text: " " },
      { text: "七年过去。" },
      { text: " " },
      { text: "人们消失,残影出现,病毒变异," },
      { text: "时间错乱,神明归来,AI 觉醒。" },
      { text: " " },
      { text: "而我..." },
      { text: " " },
      { text: "死过一次,又活了回来。" },
    ],
  },
  { type: "fade",
    bg: "#000",
    lines: [
      { text: "末日开侦探社", cls: "title" },
      { text: " " },
      { text: "Day 01 · 第一场 · 醒来", cls: "sub" },
    ],
    cls: "title",
  },
  { type: "goto", scene: "S1_alarm" },
];

SCENES.S1_alarm = [
  { type: "bg", view: "bedroom" },
  { type: "place", name: "苏宁的公寓 · 卧室" },
  { type: "sfx", name: "alarm" },
  { type: "cg", view: "bedside" },
  { type: "narration", style: "sfx", text: "(闹钟在响)" },
  { type: "narration", style: "system", text: "[Day 1 · 末日 7 年第 23 天 · 07:23]" },
  { type: "narration", text: "你睁开眼。" },
  { type: "narration", text: "天花板还是那块天花板。" },
  { type: "narration", text: "你伸出手,按掉了闹钟。" },
  { type: "sfx", name: "click" },

  { type: "show", who: "suning", expr: "tired" },
  { type: "dialog", who: "suning", text: "末日第七年的第 23 天。" },
  { type: "dialog", who: "suning", text: "我活着。" },
  { type: "dialog", who: "suning", expr: "bitter", text: "......这件事比想象中无聊。" },

  { type: "goto", scene: "S1_tutorial" },
];

SCENES.S1_tutorial = [
  { type: "hide" },
  { type: "bg", view: "bedroom" },
  { type: "narration", style: "think", text: "(关节像生锈的合页。你坐起来。)" },

  { type: "unlock",
    tag: "📖 怎么玩",
    title: "Day 1 · 早晨",
    body: "▸ 房间里能互动的东西,鼠标移上去会发光。\n▸ 点一下,它就会发生一段戏。\n▸ 看够 3 件东西,你才会有「该开始今天了」的感觉。\n▸ 然后会进入公寓主屏 — 那里有菜园 / 净水 / 工作台 / 邻居 / 防守。" },

  // ★ 标记:正在 morning 探索
  { type: "fn", fn: () => { STATE.flags.morning_exploring = true; ROOM.enter("bedroom"); } },
];

// 兼容旧入口
SCENES.S1 = SCENES.opening;

// ============================================================
// ★ 片段库 fragments — 每个热区对应一段戏
// ============================================================
SCENES.fragments = {};

// —— 笔记本 ————————————————————————————————————
SCENES.fragments.notebook_first = [
  { type: "bg", view: "bedside" },
  { type: "narration", text: "你拿起床头那本棕皮笔记本。封面有磨损。" },
  { type: "sfx", name: "page" },
  { type: "closeup", view: "notebookCover", backText: "翻开" },
  { type: "narration", text: "封面上贴着泛黄的标签 —— 「残光社案件登记本 · 2031」。" },
  { type: "narration", text: "第一页是空的。" },
  { type: "sfx", name: "page" },
  { type: "closeup", view: "notebookOpen", backText: "再翻一页" },
  { type: "narration", style: "think", text: "(只有一行,我自己写的。)" },
  { type: "narration", style: "system", text: "「我又开始了。」" },

  { type: "sfx", name: "page" },
  { type: "closeup", view: "notebookPhoto", backText: "合上" },
  { type: "narration", text: "第三页夹着一张照片。" },
  { type: "narration", text: "海边,两个人并肩。左边的是我,在笑。" },
  { type: "narration", text: "右边那个男人的脸,被笔狠狠划掉了。" },
  { type: "narration", text: "照片背面手写:「2028 春,济州岛」。" },

  { type: "show", who: "suning", expr: "bitter" },
  { type: "dialog", who: "suning", text: "陈志强。" },
  { type: "dialog", who: "suning", text: "我前夫。" },
  { type: "narration", style: "think", text: "(停了一下。)" },
  { type: "dialog", who: "suning", text: "上一世害死我的人之一。" },

  { type: "choice", options: [
    { label: "把照片夹回去。",
      action: () => SCENE.play([
        { type: "dialog", who: "suning", text: "留着。" },
        { type: "dialog", who: "suning", text: "留着提醒自己。" },
        { type: "getItem", id: "notebook", qty: 1 },
        { type: "flag", key: "photoKept", value: true },
        { type: "fn", fn: () => returnToRoom({ markDoneFor: "notebook", countAsRead: true }) },
      ]),
    },
    { label: "撕掉照片。", deltas: { sanity: -2 },
      action: () => SCENE.play([
        { type: "narration", style: "think", text: "(你的手停在照片边缘。撕不下去。)" },
        { type: "dialog", who: "suning", text: "......算了。" },
        { type: "getItem", id: "notebook", qty: 1 },
        { type: "fn", fn: () => returnToRoom({ markDoneFor: "notebook", countAsRead: true }) },
      ]),
    },
  ]},
];
SCENES.fragments.notebook_revisit = [
  { type: "narration", style: "think", text: "(还是那张照片。不看了。)" },
  { type: "fn", fn: () => returnToRoom() },
];

// —— 手机 ————————————————————————————————————
SCENES.fragments.phone_first = [
  { type: "bg", view: "bedside" },
  { type: "narration", text: "你拿起手机,按亮屏幕。" },
  { type: "sfx", name: "click" },
  { type: "phoneOpen",
    contacts: [
      { name: "妈", avatar: "👩", badge: 47, disabled: true,
        last: "(两年前 · 未读 47 条)",
        onTap: "phone_mom",
      },
      { name: "阿默", avatar: "👧", badge: 1,
        last: "姐!别再迟到了!今天有客户预约!!",
        messages: [
          { time: "今天 07:01" },
          { from: "them", text: "姐!别再迟到了!今天有客户预约!!" },
        ],
      },
      { name: "顾沉", avatar: "🤵", badge: 0,
        last: "(从未联系)",
        empty: "空的。\n你们没有聊天记录。\n但通讯录里有他。",
        messages: [],
      },
      { name: "老猫", avatar: "🐱", badge: "?",
        last: "(状态:?)",
        empty: "他从来不用微信。\n但你的列表里有他。",
        messages: [],
      },
    ],
  },
  { type: "narration", style: "think", text: "(你把手机塞进口袋。)" },
  { type: "narration", style: "think", text: "(顾沉每天 7 点经过我家门口。我每天 8:30 出门。我们从来没正好遇到过。)" },
  { type: "getItem", id: "phone", qty: 1 },
  { type: "fn", fn: () => returnToRoom({ markDoneFor: "phone", countAsRead: true }) },
];
SCENES.fragments.phone_revisit = [
  { type: "narration", style: "think", text: "(没必要再看一遍。)" },
  { type: "fn", fn: () => returnToRoom() },
];

// 妈那条灰的(disabled onTap)
SCENES.fragments.phone_mom = [
  { type: "narration", style: "sfx", text: "(手机在掌心震了一下。屏幕没打开。)" },
  { type: "show", who: "suning", expr: "tired" },
  { type: "dialog", who: "suning", text: "......她两年前消失了。" },
  { type: "dialog", who: "suning", text: "但她两年前发的消息,还在那里。" },
  { type: "dialog", who: "suning", text: "47 条。" },
  { type: "dialog", who: "suning", text: "我每天看到这个数字。" },
  { type: "dialog", who: "suning", text: "我没有勇气打开。" },
  { type: "notice", text: "🔍 暗线:妈 · 47 条未读" },
  { type: "delta", deltas: { sanity: -2, corruption: +1 } },
  { type: "getItem", id: "phone", qty: 1 },
  { type: "flag", key: "tappedMom", value: true },
  { type: "fn", fn: () => returnToRoom({ markDoneFor: "phone", countAsRead: true }) },
];

// —— 窗 ————————————————————————————————————
SCENES.fragments.window_first = [
  { type: "bg", view: "bedroom" },
  { type: "narration", text: "你走到窗边。" },
  { type: "cg", view: "window" },
  { type: "narration", text: "灰蒙蒙的天。街道空旷,偶尔一两人走过。" },
  { type: "narration", text: "远处一栋楼,正在缓慢燃烧。" },

  { type: "show", who: "suning" },
  { type: "dialog", who: "suning", text: "那家婚纱店,烧了三个月了。" },
  { type: "dialog", who: "suning", text: "火不大。但没人去管。" },
  { type: "dialog", who: "suning", expr: "bitter", text: "因为没人知道怎么管。" },
  { type: "notice", text: "🪟 婚纱店 · 已三个月" },
  { type: "fn", fn: () => returnToRoom({ markDoneFor: "window", countAsRead: true }) },
];
SCENES.fragments.window_revisit = [
  { type: "narration", style: "think", text: "(火还在烧。)" },
  { type: "fn", fn: () => returnToRoom() },
];

// —— 床(蹲下 → 解锁 underbed) ————————————————
SCENES.fragments.bed_check = [
  { type: "narration", style: "think", text: "(你弯下腰。)" },
  { type: "narration", style: "sfx", text: "(床底下露出一个铝盒的边角。)" },
  { type: "flag", key: "bed_checked", value: true },
  { type: "fn", fn: () => returnToRoom({ markDoneFor: "bed", unlock: "underbed" }) },
];
SCENES.fragments.bed_revisit = [
  { type: "narration", style: "think", text: "(床。没什么。)" },
  { type: "fn", fn: () => returnToRoom() },
];

// —— 床底铝盒 ————————————————————————————————
SCENES.fragments.underbed_first = [
  { type: "bg", view: "underbed" },
  { type: "narration", text: "你蹲下,把铝盒拖出来。" },
  { type: "sfx", name: "knock" },
  { type: "narration", style: "sfx", text: "(金属解锁的声音。)" },
  { type: "getItem", id: "alcBox", qty: 1 },
  { type: "flag", key: "box_seen", value: true },
  { type: "narration", text: "里面有五样东西。" },
  { type: "fn", fn: () => boxLoop() },
];
SCENES.fragments.underbed_revisit = [
  { type: "bg", view: "underbed" },
  { type: "narration", style: "think", text: "(打开,看,合上。)" },
  { type: "fn", fn: () => boxLoop() },
];

// 铝盒物品循环(动态过滤已看的)
window.boxLoop = function() {
  const F = STATE.flags;
  const opts = [];
  if (!F.box_cash)   opts.push({ label: "💴 应急金",          action: () => SCENE.play(SCENES.fragments.box_cash) });
  if (!F.box_gun)    opts.push({ label: "🔫 小型手枪",        action: () => SCENE.play(SCENES.fragments.box_gun) });
  if (!F.box_photo)  opts.push({ label: "📸 一张照片",        action: () => SCENE.play(SCENES.fragments.box_photo) });
  if (!F.box_cert)   opts.push({ label: "📜 一张纸",          action: () => SCENE.play(SCENES.fragments.box_cert) });
  if (!F.box_letter) opts.push({ label: "✉️ 一封没写完的信",   action: () => SCENE.play(SCENES.fragments.box_letter) });
  opts.push({
    label: opts.length === 0 ? "▸ 关上盒子,回房间" : "▸ 关上盒子,回房间",
    action: () => SCENE.play(SCENES.fragments.box_close),
  });
  SCENE.play([{ type: "choice", options: opts }]);
};

SCENES.fragments.box_cash = [
  { type: "closeup", view: "card:cashEm", backText: "关闭" },
  { type: "show", who: "suning", expr: "tired" },
  { type: "dialog", who: "suning", text: "应急金。" },
  { type: "dialog", who: "suning", text: "我每个月都补一点。" },
  { type: "dialog", who: "suning", text: "万一......再死一次。" },
  { type: "getItem", id: "cashEm", qty: 1 },
  { type: "flag", key: "box_cash", value: true },
  { type: "fn", fn: () => boxLoop() },
];
SCENES.fragments.box_gun = [
  { type: "closeup", view: "card:gun", backText: "关闭" },
  { type: "show", who: "suning", expr: "determined" },
  { type: "dialog", who: "suning", text: "我没用过。" },
  { type: "dialog", who: "suning", text: "但我留着。" },
  { type: "dialog", who: "suning", text: "他们如果再来......" },
  { type: "getItem", id: "gun", qty: 1 },
  { type: "flag", key: "box_gun", value: true },
  { type: "fn", fn: () => boxLoop() },
];
SCENES.fragments.box_photo = [
  { type: "closeup", view: "card:photoLisa", backText: "关闭" },
  { type: "show", who: "suning", expr: "bitter" },
  { type: "dialog", who: "suning", text: "Lisa。" },
  { type: "dialog", who: "suning", text: "她和陈志强,在那家婚纱店前拍的婚纱照。" },
  { type: "dialog", who: "suning", text: "那家婚纱店,现在烧着。" },
  { type: "dialog", who: "suning", text: "我有时候觉得," },
  { type: "dialog", who: "suning", text: "是我心里那把火,点燃了它。" },
  { type: "getItem", id: "photoLisa", qty: 1 },
  { type: "notice", text: "🔍 暗线:Lisa · 婚纱店" },
  { type: "flag", key: "box_photo", value: true },
  { type: "fn", fn: () => boxLoop() },
];
SCENES.fragments.box_cert = [
  { type: "closeup", view: "card:deathCert", backText: "关闭" },
  { type: "show", who: "suning", expr: "tired" },
  { type: "dialog", who: "suning", text: "我的死亡证明。" },
  { type: "dialog", who: "suning", text: "2034 年 8 月 23 日。" },
  { type: "dialog", who: "suning", text: "签名:陈志强。" },
  { type: "narration", style: "think", text: "(停顿很久。)" },
  { type: "dialog", who: "suning", text: "那是上一世。" },
  { type: "dialog", who: "suning", text: "这一世,我还没死。" },
  { type: "dialog", who: "suning", expr: "bitter", text: "......还。" },
  { type: "getItem", id: "deathCert", qty: 1 },
  { type: "delta", deltas: { sanity: -3, corruption: +2 } },
  { type: "notice", text: "🔍 暗线:上一世 · 2034.8.23" },
  { type: "flag", key: "box_cert", value: true },
  { type: "fn", fn: () => boxLoop() },
];
SCENES.fragments.box_letter = [
  { type: "closeup", view: "card:letterMom", backText: "关闭" },
  { type: "show", who: "suning", expr: "tired" },
  { type: "dialog", who: "suning", text: "「妈,我...」" },
  { type: "narration", style: "think", text: "(停顿很久。)" },
  { type: "dialog", who: "suning", text: "......写不下去。" },
  { type: "getItem", id: "letterMom", qty: 1 },
  { type: "flag", key: "box_letter", value: true },
  { type: "fn", fn: () => boxLoop() },
];
SCENES.fragments.box_close = [
  { type: "narration", style: "sfx", text: "(你关上铝盒,推回床底。)" },
  { type: "show", who: "suning", expr: "tired" },
  { type: "dialog", who: "suning", text: "今天又看了一遍。" },
  { type: "dialog", who: "suning", text: "明天还会再看。" },
  { type: "fn", fn: () => returnToRoom({ markDoneFor: "underbed" }) },
];

// —— 镜子(玄关) ————————————————————————————————
SCENES.fragments.mirror_first = [
  { type: "bg", view: "hallway" },
  { type: "hide" },
  { type: "place", name: "苏宁的公寓 · 玄关" },
  { type: "narration", text: "你走到玄关。全身镜立在那里。" },
  { type: "cg", view: "mirror" },
  { type: "narration", style: "think", text: "(镜子里是一个 30 岁的女人。)" },
  { type: "narration", style: "think", text: "(深棕色短发,微卷,有点凌乱。眼神疲惫但锐利。)" },
  { type: "narration", style: "think", text: "(深灰风衣,黑色高领,黑色长裤,短靴。左腕一只旧机械手表,右耳一颗小银钉。)" },

  { type: "show", who: "suning", expr: "tired" },
  { type: "dialog", who: "suning", text: "今天是重开侦探社的第 23 天。" },
  { type: "dialog", who: "suning", text: "一个客户都没有。" },
  { type: "narration", style: "think", text: "(看着镜子。)" },
  { type: "dialog", who: "suning", expr: "determined", text: "但我还在。" },

  { type: "fn", fn: () => returnToRoom({ markDoneFor: "mirror" }) },
];
SCENES.fragments.mirror_revisit = [
  { type: "narration", style: "think", text: "(还是那个人。)" },
  { type: "fn", fn: () => returnToRoom() },
];

// —— 门(门控) ————————————————————————————————
SCENES.fragments.door_blocked = [
  { type: "show", who: "suning", expr: "tired" },
  { type: "dialog", who: "suning", text: "......再看看吧。" },
  { type: "narration", style: "think", text: "(还有东西没摸清楚就出门 — 那不像我。)" },
  { type: "fn", fn: () => returnToRoom() },
];

// 门 · 出门完整序列(只触发一次)
SCENES.fragments.door_leave = [
  { type: "bg", view: "hallway" },
  { type: "hide" },
  { type: "place", name: "苏宁的公寓 · 玄关" },
  { type: "time", minutes: 10 },

  // —— 阿默来电 ——
  { type: "sfx", name: "buzz" },
  { type: "narration", style: "sfx", text: "(手机响了。屏幕显示:阿默。)" },
  { type: "phoneOpen",
    contacts: [
      { name: "📞 阿默(来电中)", avatar: "👧", badge: "!",
        last: "(语音中......)",
        messages: [
          { time: "现在" },
          { from: "them", text: "姐!!客户提前到了!!" },
          { from: "them", text: "她已经在侦探社门口了!!!" },
          { from: "them", text: "快来!!!" },
        ],
      },
    ],
  },
  { type: "show", who: "suning", expr: "neutral" },
  { type: "dialog", who: "suning", text: "......客户。" },
  { type: "narration", style: "think", text: "(深吸一口气。)" },
  { type: "show", who: "suning", expr: "determined" },
  { type: "dialog", who: "suning", text: "我开始了。" },
  { type: "learnNPC", id: "ahmo" },
  { type: "rel", id: "ahmo", delta: 2 },
  { type: "notice", text: "🔔 残光社门口 · 客户已到" },

  // —— 推门 ——
  { type: "cg", view: "doorHandle", caption: "你的手握住门把手。", hold: 1800 },
  { type: "sfx", name: "door" },
  { type: "narration", style: "sfx", text: "(门慢慢打开。门外光涌进来。)" },
  { type: "sfx", name: "flash" },
  { type: "whiteFlash", to: "S4_end", delay: 1600 },
];

// ============================================================
// 收尾
// ============================================================
SCENES.S4_end = [
  { type: "fade",
    bg: "#fff",
    lines: [{ text: "(光淹没了画面。)", cls: "sub" }],
    hold: 1400, click: false },
  { type: "fade",
    bg: "#000",
    lines: [
      { text: "Day 1 · 醒来 完", cls: "title" },
      { text: " " },
      { text: "回到公寓 · 开始今天", cls: "sub" },
    ],
  },
  // ★ 不再 end,而是进入公寓主屏开始当日
  { type: "fn", fn: () => {
    STATE.flags.morning_exploring = false;
    if (window.WORLD) WORLD.setTime(8, 30);
    if (window.APT)   APT.show();
    addNotice("📋 该开始今天的日子了");
  } },
];
