/* ============================================================
   data.js  ——  Day 1 · 第一场「醒来」的物品/NPC/地点/技能/案件/主角
   ============================================================ */

// —— 物品库 ——————————————————————————————
window.ITEMS = {
  notebook:  { name: "残光社案件登记本", desc: "棕皮笔记本。第二页写着「我又开始了。」第三页夹着一张照片。" },
  photoJeju: { name: "济州岛照片",       desc: "2028 春,海边。右边那个男人的脸被狠狠划掉了。" },
  phone:     { name: "手机",             desc: "无信号。47 条未读,来自妈妈。", },
  alcBox:    { name: "床底铝盒",         desc: "应急金、手枪、Lisa 的照片、我的死亡证明、写不下去的信。", special: true },
  cashEm:    { name: "应急金",           desc: "末日新版货币,红色印章。我每月都补一点。" },
  gun:       { name: "小型手枪",         desc: "黑色。我没用过,但我留着。" },
  photoLisa: { name: "陈志强 + Lisa 合照", desc: "在那家婚纱店前。那家婚纱店,现在烧着。" },
  deathCert: { name: "死亡证明",         desc: "我的。2034 年 8 月 23 日。签名:陈志强。", special: true },
  letterMom: { name: "写给妈妈的信",     desc: "只有三个字:「妈,我...」写不下去。" },
  coldTea:   { name: "凉茶",             desc: "昨晚没喝完。杯壁有一道水渍线。" },
  clock:     { name: "老式机械闹钟",     desc: "红色。显示 07:23。" },
};

// —— NPC ——————————————————————————————————
window.NPCS = {
  ahmo: {
    name: "阿默",
    title: "助理 · 残光社",
    color: "ahmo",
    intro: "残光社的助理,你早起的咖啡和晚归的灯。",
  },
  gucheng: {
    name: "顾沉",
    title: "邻居 · ???",
    color: "gucheng",
    intro: "每天 7 点经过我家门口。我从来没正好遇到过他。或者说,我也不确定。",
  },
  maocat: {
    name: "老猫",
    title: "神秘租客 · 残光社地下",
    color: "maocat",
    intro: "住在地下室。状态:?",
  },
  mom: {
    name: "妈",
    title: "失联 · 两年前",
    color: "mom",
    intro: "两年前消失了。但她两年前发的消息,还在那里。47 条。我没有勇气打开。",
    hidden: true,
  },
  chenzhi: {
    name: "陈志强",
    title: "前夫 · 上一世害死我的人之一",
    color: "chenzhi",
    intro: "我前夫。上一世害死我的人之一。",
    hidden: true,
  },
  lisa: {
    name: "Lisa",
    title: "陈志强的现任",
    color: "",
    intro: "她和陈志强,在那家婚纱店前拍的婚纱照。",
    hidden: true,
  },
};

// —— 地点 —————————————————————————————————
window.LOCATIONS = {
  home:      { name: "苏宁的公寓",        x: 22, y: 36, knownAtStart: true },
  agency:    { name: "残光社",            x: 50, y: 50, knownAtStart: true },
  wedding:   { name: "白雪婚纱(燃烧中)", x: 70, y: 22, knownAtStart: true, mystery: true },
  street:    { name: "街道",              x: 36, y: 56, knownAtStart: false },
  unknown1:  { name: "???",               x: 84, y: 78, knownAtStart: false, mystery: true },
  unknown2:  { name: "???",               x: 90, y: 50, knownAtStart: false, mystery: true },
};

// —— 技能 —————————————————————————————————
window.SKILLS = {
  detect:  { name: "侦探眼",  desc: "长按角色 1.5 秒,凝视并看穿信息。" },
  repair:  { name: "修复手",  desc: "把破损的物品/线索重新拼起来。" },
  revenge: { name: "复仇心",  desc: "未觉醒。", hidden: true },
};

// —— 案件 —————————————————————————————————
window.CASES = {
  unnamed: {
    name: "第一个客户",
    stages: ["接案", "调查", "拼图", "推理", "结案"],
  },
};

// —— 主角档案 —————————————————————————————
window.PROTAG = {
  name: "苏宁",
  age: 30,
  desc: "30 岁。深棕色短发,微卷,有点凌乱。眼神疲惫但锐利。深灰风衣 + 黑色高领。左腕一只旧机械手表,右耳一颗小银钉。",
};
