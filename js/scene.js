/* ============================================================
   scene.js  ——  剧情引擎(影视布局版)

   beat 类型(原有 + 新增):
     { type: "place",     name: "..."}                          // 场景小角标
     { type: "narration", text: "...", style: "think|sfx|system" }
     { type: "dialog",    who: "suning|ahmo|...", text: "...", expr?:"neutral|tired|bitter|determined|closed" }
     { type: "choice",    options: [{label, deltas?, next?, action?, requiresSkill?, tag?}] }
     { type: "bg",        view: "bedroom|bedside|window|mirror|..." }   // ★ 切换全屏背景
     { type: "show",      who: "suning", expr?: "neutral" }             // ★ 显示立绘
     { type: "hide" }                                                    // ★ 收起立绘
     { type: "delta",     deltas: {energy:-10, ...} }
     { type: "unlock",    title:"..", body:"..", system?:"id", skill?:"id" }
     { type: "learnNPC",  id: "ahmo" }
     { type: "learnLoc",  id: "agency" }
     { type: "setLoc",    id: "agency" }
     { type: "getItem",   id: "phone", qty: 1 }
     { type: "rel",       id:"ahmo", delta:1 }
     { type: "time",      minutes: 30 }
     { type: "notice",    text: "..."}
     { type: "weather",   text: "小雨" }
     { type: "goto",      scene: "S2" }
     { type: "flag",      key:"..", value:true }
     { type: "fade",      bg:"#000", lines:[{text,cls?}], hold?:ms, click?:bool }
     { type: "cg",        view:"...", caption?, hold?:ms }
     { type: "cgClose"}
     { type: "whiteFlash", to?:scene, delay?:ms }
     { type: "phoneOpen", contacts:[...] }
     { type: "phoneClose"}
     { type: "closeup",   view:"notebook|notebookOpen|card:gun|..." }
     { type: "closeupClose"}
     { type: "sfx",       name:"alarm|page|click|knock|whoosh|buzz" }
     { type: "fn",        fn: () => {...} }
     { type: "delay",     ms: 800 }
     { type: "end"}
   ============================================================ */

window.SCENE = {
  current: null,
  beats: [],
  idx: 0,
  paused: false,
  history: [],
  currentChar: { who: null, expr: null },
};

SCENE.play = function(beats, startIdx = 0) {
  SCENE.beats = beats;
  SCENE.idx = startIdx;
  SCENE.paused = false;
  clearSubtitle();
  clearChoices();
  SCENE.step();
};

SCENE.resume = function() {
  SCENE.paused = false;
  SCENE.step();
};

SCENE.step = function() {
  if (SCENE.paused) return;
  while (SCENE.idx < SCENE.beats.length) {
    const b = SCENE.beats[SCENE.idx];
    SCENE.idx++;

    if (b.type === "place") {
      showPlace(b.name);
    }
    else if (b.type === "narration") {
      showSubtitle({ text: b.text, style: b.style });
      addHistory({ kind: "narr", text: b.text, style: b.style });
      return;
    }
    else if (b.type === "dialog") {
      const who = b.who || "suning";
      if (b.expr) showChar(who, b.expr);
      else if (SCENE.currentChar.who !== who && (who === "suning" || who === "ahmo")) {
        showChar(who, "neutral");
      }
      showSubtitle({ text: b.text, who });
      addHistory({ kind: "dia", who, text: b.text });
      return;
    }
    else if (b.type === "choice") {
      renderChoices(b.options);
      return;
    }
    else if (b.type === "bg") {
      switchBg(b.view);
    }
    else if (b.type === "show") {
      showChar(b.who, b.expr || "neutral");
    }
    else if (b.type === "hide") {
      hideChar();
    }
    else if (b.type === "delta") {
      applyDelta(b.deltas);
    }
    else if (b.type === "unlock") {
      UI.showUnlockModal({
        tag: b.tag || "🔓 新玩法解锁",
        title: b.title,
        body: b.body || "",
        onOk: () => {
          if (b.system) unlockSystem(b.system);
          if (b.skill)  unlockSkill(b.skill, 1);
          SCENE.step();
        },
      });
      return;
    }
    else if (b.type === "learnNPC")  { learnNPC(b.id); }
    else if (b.type === "learnLoc")  { learnLocation(b.id); }
    else if (b.type === "setLoc")    { setLocation(b.id); }
    else if (b.type === "getItem")   { addItem(b.id, b.qty || 1); }
    else if (b.type === "rel")       { adjustRelation(b.id, b.delta); }
    else if (b.type === "time")      { advanceTime(b.minutes); }
    else if (b.type === "notice")    { addNotice(b.text); }
    else if (b.type === "weather")   { STATE.weather = b.text; UI.renderTopbar(); }
    else if (b.type === "flag")      { STATE.flags[b.key] = b.value; }
    else if (b.type === "goto")      {
      const target = window.SCENES[b.scene];
      if (target) { SCENE.play(target); return; }
    }
    else if (b.type === "end")       {
      showSubtitle({ text: "—— 完 ——", style: "system" });
      return;
    }
    else if (b.type === "fade")        { runFade(b); return; }
    else if (b.type === "cg")          { runCg(b); return; }
    else if (b.type === "cgClose")     { closeCg(); }
    else if (b.type === "whiteFlash")  { runWhiteFlash(b); return; }
    else if (b.type === "phoneOpen")   { openPhone(b); return; }
    else if (b.type === "phoneClose")  { closePhone(); }
    else if (b.type === "closeup")     { runCloseup(b); return; }
    else if (b.type === "closeupClose"){ closeCloseup(); }
    else if (b.type === "sfx")         { if (window.SFX) SFX.play(b.name); }
    else if (b.type === "fn")          { if (typeof b.fn === "function") { b.fn(); return; } }
    else if (b.type === "delay")       {
      SCENE.paused = true;
      setTimeout(() => { SCENE.paused = false; SCENE.step(); }, b.ms || 600);
      return;
    }
  }
};

// ============================================================
// 视图操作:背景 / 立绘 / 字幕 / 选项 / 地点角标
// ============================================================
function switchBg(view) {
  const cur = document.getElementById("bg-layer");
  const next = document.getElementById("bg-layer-next");
  if (!view) return;
  if (cur.dataset.view === view) return;
  next.dataset.view = view;
  next.hidden = false;
  requestAnimationFrame(() => {
    next.classList.add("show");
    setTimeout(() => {
      cur.dataset.view = view;
      next.classList.remove("show");
      next.hidden = true;
    }, 650);
  });
}

function showChar(who, expr = "neutral") {
  const layer = document.getElementById("char-layer");
  if (!window.PORTRAITS || !PORTRAITS[who]) {
    // 没立绘:藏起来
    layer.classList.remove("show");
    SCENE.currentChar = { who, expr };
    return;
  }
  layer.innerHTML = PORTRAITS[who](expr);
  layer.classList.add("show");
  SCENE.currentChar = { who, expr };
}
function hideChar() {
  document.getElementById("char-layer").classList.remove("show");
  SCENE.currentChar = { who: null, expr: null };
}

function showPlace(name) {
  const el = document.getElementById("vp-place");
  el.textContent = name;
  el.hidden = false;
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "";
}

function showSubtitle({ text, who, style }) {
  const bar = document.getElementById("subtitle-bar");
  const sp  = document.getElementById("speaker-name");
  const tx  = document.getElementById("subtitle-text");
  bar.hidden = false;
  tx.className = "subtitle-text " + (style || "");
  if (who) {
    const npc = NPCS && NPCS[who];
    const name = (who === "suning") ? "苏宁" : (npc ? npc.name : who);
    sp.textContent = name;
    sp.className = "speaker-name " + who;
    sp.hidden = false;
  } else {
    sp.hidden = true;
  }
  // 打字机式逐字
  tx.textContent = "";
  let i = 0;
  if (SCENE._typer) clearInterval(SCENE._typer);
  SCENE._typer = setInterval(() => {
    if (i >= text.length) { clearInterval(SCENE._typer); SCENE._typer = null; return; }
    tx.textContent += text[i++];
  }, 28);
  document.getElementById("subtitle-hint").hidden = false;
}

function clearSubtitle() {
  document.getElementById("subtitle-bar").hidden = true;
  document.getElementById("speaker-name").hidden = true;
  document.getElementById("subtitle-text").textContent = "";
  if (SCENE._typer) { clearInterval(SCENE._typer); SCENE._typer = null; }
}

function clearChoices() {
  document.getElementById("choice-layer").hidden = true;
  document.getElementById("choice-layer").innerHTML = "";
}

// 选项
function renderChoices(options) {
  clearSubtitle();
  const c = document.getElementById("choice-layer");
  c.innerHTML = "";
  c.hidden = false;
  for (const opt of options) {
    if (opt.requiresSkill && !STATE.unlockedSkills[opt.requiresSkill]) continue;
    const btn = document.createElement("button");
    btn.className = "choice";
    let lbl = opt.label;
    if (opt.tag === "skill") lbl = `<span class="tag-skill">🔍 ${SKILLS[opt.requiresSkill]?.name || "技能"}</span>` + lbl;
    btn.innerHTML = lbl;
    if (opt.deltas) {
      const tag = Object.keys(opt.deltas).filter(k=>k!=="corruption").map(k=>{
        const v = opt.deltas[k];
        const nm = { energy:"精力",sanity:"理智",supplies:"物资",reputation:"声望",money:"钱" }[k]||k;
        return `${nm} ${v>0?"+":""}${v}`;
      }).join("  ");
      if (tag) btn.innerHTML += `<span class="cost">${tag}</span>`;
    }
    btn.onclick = (e) => {
      e.stopPropagation();
      clearChoices();
      if (opt.deltas) applyDelta(opt.deltas);
      if (opt.action) { opt.action(); return; }
      if (opt.next) { SCENE.play(opt.next); }
      else { SCENE.step(); }
    };
    c.appendChild(btn);
  }
}

// 历史回看
function addHistory(entry) {
  SCENE.history.push(entry);
  if (SCENE.history.length > 600) SCENE.history.shift();
  document.getElementById("backlog-btn").hidden = false;
}

window.toggleBacklog = function(force) {
  const p = document.getElementById("backlog-panel");
  const open = (typeof force === "boolean") ? force : p.hidden;
  p.hidden = !open;
  if (open) {
    const body = document.getElementById("backlog-body");
    body.innerHTML = "";
    for (const h of SCENE.history) {
      const div = document.createElement("div");
      div.className = "bl-line " + (h.style || "");
      if (h.kind === "dia") {
        const npc = NPCS && NPCS[h.who];
        const name = (h.who === "suning") ? "苏宁" : (npc ? npc.name : h.who);
        div.innerHTML = `<span class="who">${name}:</span>${escapeHtml(h.text)}`;
      } else {
        div.textContent = h.text;
      }
      body.appendChild(div);
    }
    body.scrollTop = body.scrollHeight;
  }
};

function escapeHtml(s){ return String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]); }

// ============================================================
// 全局点击推进
// ============================================================
window.bindViewportAdvance = function() {
  document.getElementById("viewport").addEventListener("click", (e) => {
    if (e.target.closest(".choice")) return;
    if (e.target.closest(".backlog-btn")) return;
    if (e.target.closest(".backlog-panel")) return;
    if (e.target.closest("#cg-layer")) return;
    if (e.target.closest("#phone-layer")) return;
    if (e.target.closest("#closeup-layer")) return;
    if (e.target.closest("#modal-overlay")) return;
    // 字幕条可见 → 推进
    const bar = document.getElementById("subtitle-bar");
    if (!bar.hidden) {
      // 如果正在打字 → 跳到结尾
      if (SCENE._typer) {
        clearInterval(SCENE._typer);
        const lastBeat = SCENE.beats[SCENE.idx - 1];
        if (lastBeat && lastBeat.text != null) {
          document.getElementById("subtitle-text").textContent = lastBeat.text;
        }
        SCENE._typer = null;
        return;
      }
      SCENE.step();
    }
  });
};

// ============================================================
// Fade(开场/结尾大字幕)
// ============================================================
function runFade(b) {
  const layer = document.getElementById("cg-layer");
  const stage = document.getElementById("cg-stage");
  const cap   = document.getElementById("cg-caption");
  const cont  = document.getElementById("cg-continue");
  layer.hidden = false;
  layer.style.background = b.bg || "#000";
  stage.innerHTML = "";
  const lines = b.lines || [];
  cap.hidden = false;
  cap.className = "cg-caption " + (b.cls || "");
  cap.innerHTML = lines.map(l => `<div class="${l.cls||""}">${escapeHtml(l.text)}</div>`).join("");
  cont.hidden = b.click === false;

  SCENE.paused = true;
  const done = () => {
    layer.onclick = null;
    cont.hidden = true;
    if (!b.keep) { layer.hidden = true; cap.hidden = true; }
    SCENE.paused = false;
    SCENE.step();
  };
  if (b.click === false && b.hold) {
    setTimeout(done, b.hold);
  } else {
    layer.onclick = done;
    if (b.hold) setTimeout(() => { if (!layer.hidden) done(); }, b.hold);
  }
}

// CG 全屏(电影感特殊镜头)
function runCg(b) {
  const layer = document.getElementById("cg-layer");
  const stage = document.getElementById("cg-stage");
  const cap   = document.getElementById("cg-caption");
  const cont  = document.getElementById("cg-continue");
  layer.hidden = false;
  layer.style.background = "#000";
  stage.innerHTML = renderCgView(b.view);
  if (b.caption) {
    cap.hidden = false;
    cap.className = "cg-caption " + (b.captionCls || "sub");
    cap.textContent = b.caption;
  } else { cap.hidden = true; }
  cont.hidden = false;

  SCENE.paused = true;
  layer.onclick = () => {
    layer.onclick = null;
    cont.hidden = true;
    if (!b.keep) { layer.hidden = true; }
    SCENE.paused = false;
    SCENE.step();
  };
  if (b.hold) setTimeout(() => { if (!layer.hidden && layer.onclick) layer.onclick(); }, b.hold);
}
function closeCg() {
  const layer = document.getElementById("cg-layer");
  layer.hidden = true;
  layer.onclick = null;
  document.getElementById("cg-continue").hidden = true;
  document.getElementById("cg-caption").hidden = true;
  document.getElementById("cg-stage").innerHTML = "";
}

function renderCgView(view) {
  switch (view) {
    case "bedside":
      return `<div class="cg-bedside"><div class="cg-clock ringing"><div class="cg-clock-face">07:23</div></div></div>`;
    case "bedsideQuiet":
      return `<div class="cg-bedside"><div class="cg-clock"><div class="cg-clock-face">07:24</div></div></div>`;
    case "window":
      return `<div class="cg-window"><div class="cg-fire"></div><div class="cg-window-frame"></div></div>`;
    case "mirror":
      return `<div class="cg-mirror"><div class="cg-mirror-frame">
        <div class="cg-mirror-note">周三<br>去看<br>妈</div>
        <div class="cg-mirror-figure"><div class="head"></div><div class="body"></div></div>
      </div></div>`;
    case "doorHandle":
      return `<div class="cg-mirror"><div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
        width:120px;height:120px;border-radius:50%;
        background:radial-gradient(circle at 40% 40%, #d4a857, #6a5020);
        box-shadow:0 0 60px rgba(212,168,87,0.6), inset -8px -8px 20px rgba(0,0,0,0.5);"></div></div>`;
    default:
      return `<div style="color:#5a4540;letter-spacing:4px">[CG · ${view}]</div>`;
  }
}

// 白光
function runWhiteFlash(b) {
  const fl = document.getElementById("white-flash");
  fl.hidden = false;
  requestAnimationFrame(() => fl.classList.add("on"));
  SCENE.paused = true;
  setTimeout(() => {
    if (b.to && SCENES[b.to]) {
      closeCg(); closePhone(); closeCloseup();
      SCENE.play(SCENES[b.to]);
    } else {
      SCENE.paused = false; SCENE.step();
    }
    setTimeout(() => {
      fl.classList.remove("on");
      setTimeout(() => fl.hidden = true, 1400);
    }, 400);
  }, b.delay || 1600);
}

// 手机
function openPhone(b) {
  const layer = document.getElementById("phone-layer");
  const screen = document.getElementById("phone-screen");
  layer.hidden = false;
  if (window.SFX) SFX.play("click");
  screen.innerHTML = renderPhoneList(b.contacts || []);
  bindPhoneList(b.contacts || []);
  SCENE.paused = true;
  document.getElementById("phone-home").onclick = () => {
    closePhone(); SCENE.paused = false; SCENE.step();
  };
}
function closePhone() { document.getElementById("phone-layer").hidden = true; }
function renderPhoneList(contacts) {
  const items = contacts.map((c, i) => `
    <div class="phone-contact ${c.disabled?'disabled':''}" data-i="${i}">
      <div class="phone-avatar">${c.avatar||'👤'}</div>
      <div class="phone-contact-info">
        <div class="phone-contact-name">${escapeHtml(c.name)}</div>
        <div class="phone-contact-last">${escapeHtml(c.last||'')}</div>
      </div>
      <div class="phone-badge ${c.badge===0?'zero':''} ${c.badge==='?'?'q':''}">${c.badge==null?'':c.badge}</div>
    </div>`).join("");
  return `
    <div class="phone-status">
      <span class="nosig">无信号</span>
      <span>${padTime(STATE.hour)}:${padTime(STATE.minute)}</span>
      <span>32%</span>
    </div>
    <div class="phone-app-title">微信</div>
    ${items}`;
}
function bindPhoneList(contacts) {
  document.querySelectorAll(".phone-contact").forEach(el => {
    el.onclick = () => {
      const i = +el.dataset.i;
      const c = contacts[i];
      if (c.disabled) {
        const frame = document.querySelector(".phone-frame");
        frame.classList.remove("phone-shake");
        void frame.offsetWidth;
        frame.classList.add("phone-shake");
        if (window.SFX) SFX.play("buzz");
        if (c.onTap && SCENES[c.onTap]) {
          setTimeout(() => {
            closePhone(); SCENE.paused = false;
            SCENE.play(SCENES[c.onTap]);
          }, 700);
        }
        return;
      }
      const screen = document.getElementById("phone-screen");
      screen.innerHTML = renderPhoneChat(c);
      document.querySelector("#phone-screen .phone-back").onclick = () => {
        screen.innerHTML = renderPhoneList(contacts);
        bindPhoneList(contacts);
      };
    };
  });
}
function renderPhoneChat(c) {
  const msgs = (c.messages||[]).map(m => {
    if (m.time) return `<div class="phone-msg-time">${escapeHtml(m.time)}</div>`;
    return `<div class="phone-msg ${m.from==='me'?'me':'them'}">${escapeHtml(m.text)}</div>`;
  }).join("");
  const empty = (c.messages||[]).length === 0
    ? `<div class="phone-empty">${escapeHtml(c.empty || '空的。\n你们没有聊天记录。')}</div>` : "";
  return `
    <div class="phone-chat-head">
      <span class="phone-back">← 返回</span>
      <span class="phone-chat-name">${escapeHtml(c.name)}</span>
    </div>
    ${empty}${msgs}`;
}

// 道具特写
function runCloseup(b) {
  const layer = document.getElementById("closeup-layer");
  const stage = document.getElementById("closeup-stage");
  layer.hidden = false;
  stage.innerHTML = renderCloseupView(b.view, b);
  if (window.SFX) SFX.play(b.sfx || "page");
  SCENE.paused = true;
  document.getElementById("closeup-back").textContent = b.backText || "放回去";
  document.getElementById("closeup-back").onclick = () => {
    closeCloseup(); SCENE.paused = false; SCENE.step();
  };
}
function closeCloseup() {
  document.getElementById("closeup-layer").hidden = true;
  document.getElementById("closeup-stage").innerHTML = "";
}
function renderCloseupView(view, b) {
  if (view === "notebookCover") return `<div class="cu-notebook"><div class="nb-cover-title">残光社案件登记本<br>· 2031 ·</div></div>`;
  if (view === "notebookOpen")  return `<div class="cu-notebook opened"><div class="nb-line">「我又开始了。」</div></div>`;
  if (view === "notebookPhoto") return `<div class="cu-notebook opened">
    <div class="nb-photo"><div class="nb-figure left"></div><div class="nb-figure right"></div></div>
    <div class="nb-cap">背面手写:"2028 春,济州岛"</div></div>`;
  if (view && view.startsWith("card:")) {
    const k = view.slice(5);
    const data = CLOSEUP_CARDS[k];
    if (!data) return `<div style="color:#5a4540">[未知卡:${k}]</div>`;
    return `<div class="cu-card">
      <div class="cu-icon">${data.icon}</div>
      <div class="cu-name">${escapeHtml(data.name)}</div>
      <div class="cu-desc">${escapeHtml(data.desc)}</div>
      <div class="cu-mono">${escapeHtml(data.mono)}</div>
    </div>`;
  }
  return `<div style="color:#5a4540">[特写 · ${view}]</div>`;
}

window.CLOSEUP_CARDS = {
  cashEm:    { icon:"💴", name:"应急金",  desc:"几张末日货币 · 红色印章", mono:"我每个月都补一点。\n万一......再死一次。" },
  gun:       { icon:"🔫", name:"小型手枪", desc:"黑色 · 有磨损",         mono:"我没用过。\n但我留着。\n他们如果再来......" },
  photoLisa: { icon:"📸", name:"陈志强 + Lisa", desc:"他们在那家婚纱店前拍的婚纱照", mono:"那家婚纱店,\n现在烧着。\n我有时候觉得,\n是我心里那把火,点燃了它。" },
  deathCert: { icon:"📜", name:"死亡证明", desc:"我的 · 2034 年 8 月 23 日 · 签名:陈志强", mono:"那是上一世。\n这一世,我还没死。\n还。" },
  letterMom: { icon:"✉️", name:"写给妈妈的信", desc:"只有三个字", mono:"「妈,我...」\n(写不下去。)" },
};
