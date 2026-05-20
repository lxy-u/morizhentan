/* ============================================================
   scene.js  ——  剧情引擎(beats 序列驱动)

   常用 beat:
     { type: "place",     name: "..."}
     { type: "narration", text: "...", style: "think|sfx|system" }
     { type: "dialog",    who: "ahmo|suning|...", text: "..." }
     { type: "choice",    options: [{label, deltas?, next?, action?, requiresSkill?, tag?}] }
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
     { type: "end"}

   新加 beat:
     { type: "fade",     bg:"#000", lines:[{text,cls?}], hold?:ms, click?:bool }  // 全屏字幕,可点继续
     { type: "cg",       view:"bedside|window|mirror|box|...", caption?, hold?:ms } // 显示一个 CG 画面
     { type: "cgClose"}                                                              // 收掉 CG
     { type: "whiteFlash", to?:scene, delay?:ms }                                    // 推门白光,然后跳场景
     { type: "phoneOpen", contacts:[...] }                                           // 打开手机微信列表
     { type: "phoneClose"}
     { type: "closeup",  view:"notebook|notebookOpen|photoJeju|cuCard:gun|..." }    // 道具特写
     { type: "closeupClose"}
     { type: "sfx",      name:"alarm|page|click|knock|whoosh|buzz" }                // 音效
     { type: "delay",    ms: 800 }
   ============================================================ */

window.SCENE = {
  current: null,
  beats: [],
  idx: 0,
  paused: false,
};

SCENE.play = function(beats, startIdx = 0) {
  SCENE.beats = beats;
  SCENE.idx = startIdx;
  SCENE.paused = false;
  SCENE.clearNarration();
  SCENE.step();
};

SCENE.clearNarration = function() {
  $("#narration").innerHTML = "";
  $("#choices").innerHTML = "";
  $("#continue-hint").hidden = true;
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
      $("#scene-place").textContent = b.name;
    }
    else if (b.type === "narration") {
      appendNarration(b);
      showContinueHint();
      return;
    }
    else if (b.type === "dialog") {
      appendDialog(b);
      showContinueHint();
      return;
    }
    else if (b.type === "choice") {
      renderChoices(b.options);
      return;
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
    else if (b.type === "end")       { showContinueHint("· 完 ·", false); return; }

    // —— 新 beats ——
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

// —— 渲染:旁白 / 对白 ——
function appendNarration(b) {
  const div = document.createElement("div");
  div.className = "line";
  const cls = b.style || "";
  if (cls) div.innerHTML = `<span class="${cls}">${escapeHtml(b.text)}</span>`;
  else div.textContent = b.text;
  $("#narration").appendChild(div);
  const stage = document.getElementById("stage");
  stage.scrollTop = stage.scrollHeight;
}
function appendDialog(b) {
  const npc = NPCS[b.who];
  const isSuning = b.who === "suning" || !npc;
  const name = isSuning ? "苏宁" : npc.name;
  const color = isSuning ? "suning" : (npc.color || "");
  const div = document.createElement("div");
  div.className = "line";
  div.innerHTML = `<span class="speaker ${color}">${name}:</span> ${escapeHtml(b.text)}`;
  $("#narration").appendChild(div);
  const stage = document.getElementById("stage");
  stage.scrollTop = stage.scrollHeight;
}
function escapeHtml(s){ return String(s).replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]); }

// —— 选项 ——
function renderChoices(options) {
  $("#continue-hint").hidden = true;
  const c = $("#choices");
  c.innerHTML = "";
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
    btn.onclick = () => {
      if (opt.deltas) applyDelta(opt.deltas);
      if (opt.action) { opt.action(); return; }
      if (opt.next) {
        SCENE.beats = opt.next;
        SCENE.idx = 0;
        SCENE.clearNarration();
        SCENE.step();
      } else {
        $("#choices").innerHTML = "";
        SCENE.step();
      }
    };
    c.appendChild(btn);
  }
}

// —— "点击继续" ——
function showContinueHint(text = "点击继续", clickable = true) {
  const h = $("#continue-hint");
  h.querySelector("span").textContent = text;
  h.hidden = false;
  if (clickable) {
    h.onclick = (e) => { e.stopPropagation(); h.hidden = true; SCENE.step(); };
    $("#scene").onclick = (e) => {
      if (e.target.closest(".choice")) return;
      if (e.target.closest("#continue-hint")) return;
      if ($("#continue-hint").hidden) return;
      h.hidden = true; SCENE.step();
    };
  } else {
    h.onclick = null;
  }
}

// ============================================================
// 新 beats 实现
// ============================================================

// —— Fade(黑屏字幕) ——
function runFade(b) {
  const layer = $("#cg-layer");
  const stage = $("#cg-stage");
  const cap   = $("#cg-caption");
  const cont  = $("#cg-continue");
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
    if (b.keep) { /* 留着 */ }
    else { layer.hidden = true; cap.hidden = true; }
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

// —— CG(全屏画面 + 可选字幕) ——
function runCg(b) {
  const layer = $("#cg-layer");
  const stage = $("#cg-stage");
  const cap   = $("#cg-caption");
  const cont  = $("#cg-continue");
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
    if (b.keep !== true) { layer.hidden = true; }
    SCENE.paused = false;
    SCENE.step();
  };
  if (b.hold) setTimeout(() => { if (!layer.hidden && layer.onclick) layer.onclick(); }, b.hold);
}
function closeCg() {
  const layer = $("#cg-layer");
  layer.hidden = true;
  layer.onclick = null;
  $("#cg-continue").hidden = true;
  $("#cg-caption").hidden = true;
  $("#cg-stage").innerHTML = "";
}

function renderCgView(view) {
  switch (view) {
    case "bedside":
      return `
        <div class="cg-bedside">
          <div class="cg-clock ringing">
            <div class="cg-clock-face">07:23</div>
          </div>
        </div>
      `;
    case "bedsideQuiet":
      return `
        <div class="cg-bedside">
          <div class="cg-clock">
            <div class="cg-clock-face">07:24</div>
          </div>
        </div>
      `;
    case "window":
      return `
        <div class="cg-window">
          <div class="cg-fire"></div>
          <div class="cg-window-frame"></div>
        </div>
      `;
    case "mirror":
      return `
        <div class="cg-mirror">
          <div class="cg-mirror-frame">
            <div class="cg-mirror-note">周三<br>去看<br>妈</div>
            <div class="cg-mirror-figure">
              <div class="head"></div>
              <div class="body"></div>
            </div>
          </div>
        </div>
      `;
    case "doorHandle":
      return `
        <div class="cg-mirror">
          <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
                      width:120px;height:120px;border-radius:50%;
                      background:radial-gradient(circle at 40% 40%, #d4a857, #6a5020);
                      box-shadow:0 0 60px rgba(212,168,87,0.6),
                                 inset -8px -8px 20px rgba(0,0,0,0.5);"></div>
        </div>
      `;
    default:
      return `<div style="color:#5a4540;letter-spacing:4px">[CG · ${view}]</div>`;
  }
}

// —— 白光过曝 ——
function runWhiteFlash(b) {
  const fl = $("#white-flash");
  fl.hidden = false;
  requestAnimationFrame(() => fl.classList.add("on"));
  SCENE.paused = true;
  setTimeout(() => {
    if (b.to && SCENES[b.to]) {
      // 收掉 CG/手机/特写
      closeCg(); closePhone(); closeCloseup();
      SCENE.play(SCENES[b.to]);
    } else {
      SCENE.paused = false;
      SCENE.step();
    }
    setTimeout(() => {
      fl.classList.remove("on");
      setTimeout(() => fl.hidden = true, 1400);
    }, 400);
  }, b.delay || 1600);
}

// ============================================================
// 手机
// ============================================================
function openPhone(b) {
  const layer = $("#phone-layer");
  const screen = $("#phone-screen");
  layer.hidden = false;
  if (window.SFX) SFX.play("click");

  screen.innerHTML = renderPhoneList(b.contacts || []);
  bindPhoneList(b.contacts || []);

  SCENE.paused = true;
  $("#phone-home").onclick = () => {
    closePhone();
    SCENE.paused = false;
    SCENE.step();
  };
}
function closePhone() {
  $("#phone-layer").hidden = true;
}
function renderPhoneList(contacts) {
  const items = contacts.map((c, i) => `
    <div class="phone-contact ${c.disabled?'disabled':''}" data-i="${i}">
      <div class="phone-avatar">${c.avatar||'👤'}</div>
      <div class="phone-contact-info">
        <div class="phone-contact-name">${escapeHtml(c.name)}</div>
        <div class="phone-contact-last">${escapeHtml(c.last||'')}</div>
      </div>
      <div class="phone-badge ${c.badge===0?'zero':''} ${c.badge==='?'?'q':''}">${c.badge==null?'':c.badge}</div>
    </div>
  `).join("");
  return `
    <div class="phone-status">
      <span class="nosig">无信号</span>
      <span>${padTime(STATE.hour)}:${padTime(STATE.minute)}</span>
      <span>32%</span>
    </div>
    <div class="phone-app-title">微信</div>
    ${items}
  `;
}
function bindPhoneList(contacts) {
  document.querySelectorAll(".phone-contact").forEach(el => {
    el.onclick = () => {
      const i = +el.dataset.i;
      const c = contacts[i];
      if (c.disabled) {
        // 妈 — 震动一下,不开
        const frame = document.querySelector(".phone-frame");
        frame.classList.remove("phone-shake");
        void frame.offsetWidth;
        frame.classList.add("phone-shake");
        if (window.SFX) SFX.play("buzz");
        // 触发独白
        if (c.onTap && SCENES[c.onTap]) {
          setTimeout(() => {
            closePhone();
            SCENE.paused = false;
            SCENE.play(SCENES[c.onTap]);
          }, 700);
        }
        return;
      }
      // 打开聊天
      const screen = $("#phone-screen");
      screen.innerHTML = renderPhoneChat(c, contacts);
      $("#phone-screen .phone-back").onclick = () => {
        screen.innerHTML = renderPhoneList(contacts);
        bindPhoneList(contacts);
      };
      if (c.onOpen && SCENES[c.onOpen]) {
        // 看完后自动返回主线
        setTimeout(() => {
          closePhone();
          SCENE.paused = false;
          SCENE.play(SCENES[c.onOpen]);
        }, 100); // 这里不自动跳,先让玩家看
      }
    };
  });
}
function renderPhoneChat(c, contacts) {
  const msgs = (c.messages||[]).map(m => {
    if (m.time) return `<div class="phone-msg-time">${escapeHtml(m.time)}</div>`;
    return `<div class="phone-msg ${m.from==='me'?'me':'them'}">${escapeHtml(m.text)}</div>`;
  }).join("");
  const empty = (c.messages||[]).length === 0
    ? `<div class="phone-empty">${escapeHtml(c.empty || '空的。\n你们没有聊天记录。')}</div>`
    : "";
  return `
    <div class="phone-chat-head">
      <span class="phone-back">← 返回</span>
      <span class="phone-chat-name">${escapeHtml(c.name)}</span>
    </div>
    ${empty}${msgs}
  `;
}

// ============================================================
// 道具特写
// ============================================================
function runCloseup(b) {
  const layer = $("#closeup-layer");
  const stage = $("#closeup-stage");
  layer.hidden = false;
  stage.innerHTML = renderCloseupView(b.view, b);
  if (window.SFX) SFX.play(b.sfx || "page");

  SCENE.paused = true;
  $("#closeup-back").textContent = b.backText || "放回去";
  $("#closeup-back").onclick = () => {
    closeCloseup();
    SCENE.paused = false;
    SCENE.step();
  };
}
function closeCloseup() {
  $("#closeup-layer").hidden = true;
  $("#closeup-stage").innerHTML = "";
}
function renderCloseupView(view, b) {
  if (view === "notebookCover") {
    return `
      <div class="cu-notebook">
        <div class="nb-cover-title">残光社案件登记本<br>· 2031 ·</div>
      </div>
    `;
  }
  if (view === "notebookOpen") {
    return `
      <div class="cu-notebook opened">
        <div class="nb-line">「我又开始了。」</div>
      </div>
    `;
  }
  if (view === "notebookPhoto") {
    return `
      <div class="cu-notebook opened">
        <div class="nb-photo">
          <div class="nb-figure left"></div>
          <div class="nb-figure right"></div>
        </div>
        <div class="nb-cap">背面手写:"2028 春,济州岛"</div>
      </div>
    `;
  }
  if (view && view.startsWith("card:")) {
    const k = view.slice(5);
    const data = CLOSEUP_CARDS[k];
    if (!data) return `<div style="color:#5a4540">[未知卡:${k}]</div>`;
    return `
      <div class="cu-card">
        <div class="cu-icon">${data.icon}</div>
        <div class="cu-name">${escapeHtml(data.name)}</div>
        <div class="cu-desc">${escapeHtml(data.desc)}</div>
        <div class="cu-mono">${escapeHtml(data.mono)}</div>
      </div>
    `;
  }
  return `<div style="color:#5a4540">[特写 · ${view}]</div>`;
}

// —— 铝盒里物品的卡片 ——
window.CLOSEUP_CARDS = {
  cashEm: {
    icon: "💴", name: "应急金",
    desc: "几张末日货币 · 红色印章",
    mono: "我每个月都补一点。\n万一......再死一次。"
  },
  gun: {
    icon: "🔫", name: "小型手枪",
    desc: "黑色 · 有磨损",
    mono: "我没用过。\n但我留着。\n他们如果再来......"
  },
  photoLisa: {
    icon: "📸", name: "陈志强 + Lisa",
    desc: "他们在那家婚纱店前拍的婚纱照",
    mono: "那家婚纱店,\n现在烧着。\n我有时候觉得,\n是我心里那把火,点燃了它。"
  },
  deathCert: {
    icon: "📜", name: "死亡证明",
    desc: "我的 · 2034 年 8 月 23 日 · 签名:陈志强",
    mono: "那是上一世。\n这一世,我还没死。\n还。"
  },
  letterMom: {
    icon: "✉️", name: "写给妈妈的信",
    desc: "只有三个字",
    mono: "「妈,我...」\n(写不下去。)"
  },
};
