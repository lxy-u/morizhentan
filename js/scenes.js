/* ============================================================
   scenes.js  ——  Day 1 · 第一场「醒来」
   ============================================================ */

window.SCENES = {};

// ============================================================
// S0: 开场字幕(2031...)
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

// ============================================================
// S1: 闹钟特写 + 首句独白
// ============================================================
SCENES.S1_alarm = [
  { type: "place", name: "苏宁的公寓 · 卧室" },
  { type: "sfx",   name: "alarm" },
  { type: "cg",    view: "bedside" },
  { type: "narration", style: "sfx", text: "(闹钟在响)" },
  { type: "delta", deltas: { } },
  { type: "narration", style: "system", text: "[Day 1 · 末日 7 年第 23 天 · 07:23]" },
  { type: "narration", text: "你睁开眼。" },
  { type: "narration", text: "天花板还是那块天花板。" },
  { type: "narration", text: "你伸出手,按掉了闹钟。" },
  { type: "sfx",   name: "click" },

  { type: "dialog", who: "suning", text: "末日第七年的第 23 天。" },
  { type: "dialog", who: "suning", text: "我活着。" },
  { type: "dialog", who: "suning", text: "......这件事比想象中无聊。" },

  { type: "goto", scene: "S1_tutorial" },
];

// ============================================================
// S1.5: 教程 + 状态栏首次出现
// ============================================================
SCENES.S1_tutorial = [
  { type: "narration", style: "think", text: "(关节像生锈的合页。你坐起来。)" },

  { type: "unlock",
    tag: "📖 基础操作",
    title: "怎么玩",
    body: "点击屏幕继续阅读。\n出现选项时,选一个推进剧情。\n屏幕底部四个按钮(背包 / 案件 / 地图 / 我)随时可以打开查看。" },

  { type: "narration", text: "床头那盏小台灯还亮着。" },
  { type: "narration", text: "桌上有一杯昨晚没喝完的凉茶,杯壁留着一道明显的水渍线。" },

  { type: "unlock",
    tag: "🔓 新系统",
    title: "状态系统",
    body: "你有 5 项数值会影响今天能做什么:\n  💪 精力 80\n  🧠 理智 75\n  📦 物资 35  (低)\n  🌟 声望 30\n  🦠 腐化度 5\n\n物资偏低 — 出门得想想。",
    system: "status" },

  { type: "narration", text: "你扫了一眼床头柜。" },
  { type: "narration", text: "笔记本、手机、还有一只发夹。" },
  { type: "narration", text: "窗外天是灰的。" },

  { type: "goto", scene: "S1_room" },
];

// ============================================================
// S1.6: 房间循环 — 探索 3 个核心物品 + 隐藏铝盒
// ============================================================
SCENES.S1_room = [
  { type: "choice", options: [
      {
        label: "📖 翻开床头那本笔记本",
        action: () => SCENE.play(SCENES.S1_notebook),
      },
      {
        label: "📱 拿起手机",
        action: () => SCENE.play(SCENES.S1_phone),
      },
      {
        label: "🪟 走到窗边,看看外面",
        action: () => SCENE.play(SCENES.S1_window),
      },
      // 看见过任意一个之后,才出现"准备出门"
      ...(STATE.flags.sawAnyItem ? [{
        label: "▸ 准备出门(去玄关)",
        action: () => SCENE.play(SCENES.S1_beforeDoor),
      }] : []),
  ]},
];

// —— 重新构造房间菜单(每次返回时根据 flag 重算) ——
function backToRoom() {
  STATE.flags.sawAnyItem = true;
  // 重写房间选项
  const opts = [];
  if (!STATE.flags.sawNotebook)
    opts.push({ label: "📖 翻开床头那本笔记本", action: () => SCENE.play(SCENES.S1_notebook) });
  if (!STATE.flags.sawPhone)
    opts.push({ label: "📱 拿起手机", action: () => SCENE.play(SCENES.S1_phone) });
  if (!STATE.flags.sawWindow)
    opts.push({ label: "🪟 走到窗边,看看外面", action: () => SCENE.play(SCENES.S1_window) });
  opts.push({ label: "▸ 准备出门(去玄关)", action: () => SCENE.play(SCENES.S1_beforeDoor) });
  SCENE.play([
    { type: "narration", style: "think", text: "(你回到房间中央。)" },
    { type: "choice", options: opts },
  ]);
}
window.backToRoom = backToRoom;

// ============================================================
// S1 · 笔记本
// ============================================================
SCENES.S1_notebook = [
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

  { type: "dialog", who: "suning", text: "陈志强。" },
  { type: "dialog", who: "suning", text: "我前夫。" },
  { type: "narration", style: "think", text: "(停了一下。)" },
  { type: "dialog", who: "suning", text: "上一世害死我的人之一。" },

  { type: "choice", options: [
      { label: "A. 把照片夹回去。",
        action: () => SCENE.play([
          { type: "dialog", who: "suning", text: "留着。" },
          { type: "dialog", who: "suning", text: "留着提醒自己。" },
          { type: "getItem", id: "notebook", qty: 1 },
          { type: "flag", key: "sawNotebook", value: true },
          { type: "flag", key: "photoKept", value: true },
          { type: "goto", scene: "S1_backRoom" },
        ]),
      },
      { label: "B. 撕掉照片。",
        deltas: { sanity: -2 },
        action: () => SCENE.play([
          { type: "narration", style: "think", text: "(你的手停在照片边缘。撕不下去。)" },
          { type: "dialog", who: "suning", text: "......算了。" },
          { type: "getItem", id: "notebook", qty: 1 },
          { type: "flag", key: "sawNotebook", value: true },
          { type: "goto", scene: "S1_backRoom" },
        ]),
      },
  ]},
];

// ============================================================
// S1 · 手机
// ============================================================
SCENES.S1_phone = [
  { type: "narration", text: "你拿起手机,按亮屏幕。" },
  { type: "sfx", name: "click" },
  { type: "phoneOpen",
    contacts: [
      { name: "妈", avatar: "👩", badge: 47, disabled: true,
        last: "(两年前 · 未读 47 条)",
        onTap: "S1_phone_mom",
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
  // 玩家收起手机后 — 看玩家有没有点过妈,没有的话补一段独白
  { type: "narration", style: "think", text: "(你把手机塞进口袋。)" },
  { type: "narration", style: "think", text: "(顾沉每天 7 点经过我家门口。我每天 8:30 出门。我们从来没正好遇到过......或者说,我也不确定。)" },
  { type: "getItem", id: "phone", qty: 1 },
  { type: "flag", key: "sawPhone", value: true },
  { type: "goto", scene: "S1_backRoom" },
];

// 玩家点了"妈"那条灰色 — 单独触发
SCENES.S1_phone_mom = [
  { type: "narration", style: "sfx", text: "(手机在掌心震了一下。屏幕没打开。)" },
  { type: "dialog", who: "suning", text: "......她两年前消失了。" },
  { type: "dialog", who: "suning", text: "但她两年前发的消息,还在那里。" },
  { type: "dialog", who: "suning", text: "47 条。" },
  { type: "dialog", who: "suning", text: "我每天看到这个数字。" },
  { type: "dialog", who: "suning", text: "我没有勇气打开。" },
  { type: "notice", text: "🔍 暗线:妈 · 47 条未读" },
  { type: "delta", deltas: { sanity: -2, corruption: +1 } },
  { type: "getItem", id: "phone", qty: 1 },
  { type: "flag", key: "sawPhone", value: true },
  { type: "flag", key: "tappedMom", value: true },
  { type: "goto", scene: "S1_backRoom" },
];

// ============================================================
// S1 · 窗外
// ============================================================
SCENES.S1_window = [
  { type: "narration", text: "你走到窗边。" },
  { type: "cg", view: "window" },
  { type: "narration", text: "灰蒙蒙的天。" },
  { type: "narration", text: "街道空旷,偶尔一两人走过。" },
  { type: "narration", text: "远处一栋楼,正在缓慢燃烧。" },

  { type: "dialog", who: "suning", text: "那家婚纱店,烧了三个月了。" },
  { type: "dialog", who: "suning", text: "火不大。" },
  { type: "dialog", who: "suning", text: "但没人去管。" },
  { type: "dialog", who: "suning", text: "因为没人知道怎么管。" },
  { type: "notice", text: "🪟 婚纱店 · 已三个月" },
  { type: "flag", key: "sawWindow", value: true },
  { type: "goto", scene: "S1_backRoom" },
];

// ============================================================
// 房间循环转发器
// ============================================================
SCENES.S1_backRoom = [
  { type: "fn", fn: () => backToRoom() },
];

// ============================================================
// S2: 床底铝盒(隐藏分支)
// ============================================================
SCENES.S1_beforeDoor = [
  { type: "narration", text: "你站起来,准备走向玄关。" },
  { type: "narration", style: "think", text: "(走到床尾时,你顿了一下。)" },
  { type: "narration", style: "sfx", text: "(床底下露出一个铝盒的边角。)" },
  { type: "narration", style: "system", text: "[床底好像有东西......]" },

  { type: "choice", options: [
      { label: "A. 打开铝盒",
        action: () => SCENE.play(SCENES.S2_boxOpen),
      },
      { label: "B. 不看了,出门。",
        action: () => SCENE.play(SCENES.S2_boxSkip),
      },
  ]},
];

SCENES.S2_boxOpen = [
  { type: "narration", text: "你蹲下,把铝盒拖出来。" },
  { type: "sfx", name: "knock" },
  { type: "narration", style: "sfx", text: "(金属解锁的声音。)" },
  { type: "cg", view: "bedsideQuiet", caption: "(铝盒打开。)", hold: 1200 },
  { type: "getItem", id: "alcBox", qty: 1 },
  { type: "narration", text: "里面有五样东西。" },
  { type: "goto", scene: "S2_boxLoop" },
];

// 铝盒物品循环 — 用函数动态生成,过滤已看过的
function boxLoop() {
  const F = STATE.flags;
  const opts = [];
  if (!F.box_cash)   opts.push({ label: "💴 应急金",          action: () => SCENE.play(SCENES.S2_box_cash) });
  if (!F.box_gun)    opts.push({ label: "🔫 小型手枪",        action: () => SCENE.play(SCENES.S2_box_gun) });
  if (!F.box_photo)  opts.push({ label: "📸 一张照片",        action: () => SCENE.play(SCENES.S2_box_photo) });
  if (!F.box_cert)   opts.push({ label: "📜 一张纸",          action: () => SCENE.play(SCENES.S2_box_cert) });
  if (!F.box_letter) opts.push({ label: "✉️ 一封没写完的信",   action: () => SCENE.play(SCENES.S2_box_letter) });
  opts.push({ label: opts.length === 0 ? "▸ 关上盒子,出门(全部看完了)" : "▸ 关上盒子,出门", action: () => SCENE.play(SCENES.S2_boxClose) });
  SCENE.play([{ type: "choice", options: opts }]);
}
window.boxLoop = boxLoop;

SCENES.S2_boxLoop = [
  { type: "fn", fn: () => boxLoop() },
];

SCENES.S2_box_cash = [
  { type: "closeup", view: "card:cashEm", backText: "关闭" },
  { type: "dialog", who: "suning", text: "应急金。" },
  { type: "dialog", who: "suning", text: "我每个月都补一点。" },
  { type: "dialog", who: "suning", text: "万一......再死一次。" },
  { type: "getItem", id: "cashEm", qty: 1 },
  { type: "flag", key: "box_cash", value: true },
  { type: "goto", scene: "S2_boxLoop" },
];
SCENES.S2_box_gun = [
  { type: "closeup", view: "card:gun", backText: "关闭" },
  { type: "dialog", who: "suning", text: "我没用过。" },
  { type: "dialog", who: "suning", text: "但我留着。" },
  { type: "dialog", who: "suning", text: "他们如果再来......" },
  { type: "getItem", id: "gun", qty: 1 },
  { type: "flag", key: "box_gun", value: true },
  { type: "goto", scene: "S2_boxLoop" },
];
SCENES.S2_box_photo = [
  { type: "closeup", view: "card:photoLisa", backText: "关闭" },
  { type: "dialog", who: "suning", text: "Lisa。" },
  { type: "dialog", who: "suning", text: "她和陈志强,在那家婚纱店前拍的婚纱照。" },
  { type: "dialog", who: "suning", text: "那家婚纱店,现在烧着。" },
  { type: "dialog", who: "suning", text: "我有时候觉得," },
  { type: "dialog", who: "suning", text: "是我心里那把火,点燃了它。" },
  { type: "getItem", id: "photoLisa", qty: 1 },
  { type: "notice", text: "🔍 暗线:Lisa · 婚纱店" },
  { type: "flag", key: "box_photo", value: true },
  { type: "goto", scene: "S2_boxLoop" },
];
SCENES.S2_box_cert = [
  { type: "closeup", view: "card:deathCert", backText: "关闭" },
  { type: "dialog", who: "suning", text: "我的死亡证明。" },
  { type: "dialog", who: "suning", text: "2034 年 8 月 23 日。" },
  { type: "dialog", who: "suning", text: "签名:陈志强。" },
  { type: "narration", style: "think", text: "(停顿很久。)" },
  { type: "dialog", who: "suning", text: "那是上一世。" },
  { type: "dialog", who: "suning", text: "这一世,我还没死。" },
  { type: "dialog", who: "suning", text: "......还。" },
  { type: "getItem", id: "deathCert", qty: 1 },
  { type: "delta", deltas: { sanity: -3, corruption: +2 } },
  { type: "notice", text: "🔍 暗线:上一世 · 2034.8.23" },
  { type: "flag", key: "box_cert", value: true },
  { type: "goto", scene: "S2_boxLoop" },
];
SCENES.S2_box_letter = [
  { type: "closeup", view: "card:letterMom", backText: "关闭" },
  { type: "dialog", who: "suning", text: "「妈,我...」" },
  { type: "narration", style: "think", text: "(停顿很久。)" },
  { type: "dialog", who: "suning", text: "......写不下去。" },
  { type: "getItem", id: "letterMom", qty: 1 },
  { type: "flag", key: "box_letter", value: true },
  { type: "goto", scene: "S2_boxLoop" },
];

SCENES.S2_boxClose = [
  { type: "narration", style: "sfx", text: "(你关上铝盒,推回床底。)" },
  { type: "dialog", who: "suning", text: "今天又看了一遍。" },
  { type: "dialog", who: "suning", text: "明天还会再看。" },
  { type: "goto", scene: "S3_mirror" },
];

SCENES.S2_boxSkip = [
  { type: "narration", text: "你看了一眼,转身。" },
  { type: "dialog", who: "suning", text: "不看了。" },
  { type: "dialog", who: "suning", text: "昨天看过了。" },
  { type: "dialog", who: "suning", text: "但我知道它在那。" },
  { type: "dialog", who: "suning", text: "它每天都在那。" },
  { type: "goto", scene: "S3_mirror" },
];

// ============================================================
// S3: 玄关镜子前 + 阿默来电 + 推门白光
// ============================================================
SCENES.S3_mirror = [
  { type: "place", name: "苏宁的公寓 · 玄关" },
  { type: "time", minutes: 12 },
  { type: "narration", text: "你走到玄关。" },
  { type: "narration", text: "全身镜立在那里。" },
  { type: "cg", view: "mirror" },
  { type: "narration", style: "think", text: "(镜子里是一个 30 岁的女人。)" },
  { type: "narration", style: "think", text: "(深棕色短发,微卷,有点凌乱。)" },
  { type: "narration", style: "think", text: "(眼神疲惫但锐利。)" },
  { type: "narration", style: "think", text: "(深灰风衣,黑色高领,黑色长裤,短靴。)" },
  { type: "narration", style: "think", text: "(左腕一只旧机械手表。右耳一颗小银钉。)" },

  { type: "dialog", who: "suning", text: "今天是重开侦探社的第 23 天。" },
  { type: "dialog", who: "suning", text: "一个客户都没有。" },
  { type: "narration", style: "think", text: "(看着镜子。)" },
  { type: "dialog", who: "suning", text: "但我还在。" },

  // —— 阿默电话 ——
  { type: "delay", ms: 600 },
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
  { type: "dialog", who: "suning", text: "......客户。" },
  { type: "narration", style: "think", text: "(看镜子里的自己,深吸一口气。)" },
  { type: "dialog", who: "suning", text: "我开始了。" },
  { type: "learnNPC", id: "ahmo" },
  { type: "rel",      id: "ahmo", delta: 2 },
  { type: "notice",   text: "🔔 残光社门口 · 客户已到" },

  // —— 推门 ——
  { type: "cg", view: "doorHandle", caption: "你的手握住门把手。", hold: 1800 },
  { type: "sfx", name: "door" },
  { type: "narration", style: "sfx", text: "(门慢慢打开。门外光涌进来。)" },
  { type: "sfx", name: "flash" },
  { type: "whiteFlash", to: "S4_end", delay: 1600 },
];

// ============================================================
// S4: 收尾
// ============================================================
SCENES.S4_end = [
  { type: "fade",
    bg: "#fff",
    cls: "",
    lines: [
      { text: "(光淹没了画面。)", cls: "sub" },
    ],
    hold: 1400,
    click: false,
  },
  { type: "fade",
    bg: "#000",
    lines: [
      { text: "Day 1 · 第一场 · 完", cls: "title" },
      { text: " " },
      { text: "下一场", cls: "sub" },
      { text: "出门 — 街道 — 残光社", cls: "sub" },
    ],
  },
  { type: "place", name: "—— 待续 ——" },
  { type: "narration", style: "system", text: "本场结束。" },
  { type: "narration", text: "(后续场景需要新一批文案才能继续。)" },
  { type: "narration", text: "你可以打开底部「我 / 背包 / 案件 / 地图」回顾这场拿到的东西。" },
  { type: "end" },
];

// —— 兼容旧入口:让 main.js 不报错 ——
SCENES.S1 = SCENES.opening;
