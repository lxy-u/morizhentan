/* ============================================================
   ui.js  ——  顶/底栏、浮窗、解锁弹窗、4 个面板
   ============================================================ */

window.UI = {};

// —— 顶部栏 ———————————————————————————————
UI.renderTopbar = function() {
  $("#tb-time").textContent = `${padTime(STATE.hour)}:${padTime(STATE.minute)}`;
  $("#tb-day").textContent  = `Day ${STATE.day} · ${STATE.era}`;
  $("#tb-weather").textContent = STATE.weather;
  const c = STATE.notices.length;
  const bc = $("#bell-count");
  bc.textContent = c;
  bc.classList.toggle("zero", c === 0);
};

// —— 通知抽屉 —————————————————————————————
UI.toggleBellDrawer = function(force) {
  const drawer = $("#bell-drawer");
  const open = (typeof force === "boolean") ? force : drawer.hidden;
  drawer.hidden = !open;
  if (open) {
    const list = $("#drawer-list");
    list.innerHTML = "";
    if (STATE.notices.length === 0) {
      list.innerHTML = '<li class="empty">没有新通知。</li>';
    } else {
      for (const n of STATE.notices) {
        const li = document.createElement("li");
        li.innerHTML = `<span style="color:#8a7e6a;font-size:11px;letter-spacing:1px">[${n.time}]</span> ${n.text}`;
        list.appendChild(li);
      }
    }
  }
};

// —— 数值浮窗 —————————————————————————————
UI.flashDeltas = function(items) {
  const stack = $("#delta-stack");
  for (const it of items) {
    const div = document.createElement("div");
    div.className = `delta-item ${it.dir}`;
    div.textContent = it.label;
    stack.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }
};

// —— 解锁弹窗 —————————————————————————————
UI.showUnlockModal = function({ tag = "🔓 新玩法解锁", title, body, okText = "我知道了", onOk }) {
  $("#modal-tag").textContent = tag;
  $("#modal-title").textContent = title;
  $("#modal-body").textContent = body || "";
  $("#modal-ok").textContent = okText;
  $("#modal-overlay").hidden = false;
  $("#modal-ok").onclick = () => {
    $("#modal-overlay").hidden = true;
    if (onOk) onOk();
  };
};

// —— 底部面板 —————————————————————————————
UI.openPanel = function(which) {
  const titleMap = { inventory: "背包", cases: "案件本", map: "地图", me: "我" };
  $("#panel-title").textContent = titleMap[which] || "";
  const body = $("#panel-body");
  body.innerHTML = "";
  if (which === "inventory") body.appendChild(buildInventory());
  else if (which === "cases") body.appendChild(buildCases());
  else if (which === "map")   body.appendChild(buildMap());
  else if (which === "me")    body.appendChild(buildMe());
  $("#panel-overlay").hidden = false;
};

UI.closePanel = function() {
  $("#panel-overlay").hidden = true;
};

// —— 背包面板 ——
function buildInventory() {
  const wrap = el("div");
  wrap.appendChild(elHtml(`<div class="inv-cap">容量 ${STATE.capUsed} / ${STATE.capMax}</div>`));
  const list = el("div", "inv-list");
  const ids = Object.keys(STATE.inventory);
  if (ids.length === 0) {
    list.appendChild(elHtml('<div style="color:#5a4540;font-size:12px;text-align:center;padding:20px;letter-spacing:2px">空空如也</div>'));
  } else {
    for (const id of ids) {
      const item = ITEMS[id]; if (!item) continue;
      const qty = STATE.inventory[id];
      const row = el("div", "inv-row" + (item.special ? " special" : ""));
      row.innerHTML = `
        <div>
          <div class="nm">${item.name}</div>
          <div class="ds">${item.desc}</div>
        </div>
        <div class="qt">${qty}${item.unit ? " " + item.unit : ""}</div>
      `;
      list.appendChild(row);
    }
  }
  // 钱单独显示
  const money = el("div", "inv-row");
  money.innerHTML = `<div class="nm">现金</div><div class="qt">¥ ${STATE.money.toLocaleString()}</div>`;
  list.appendChild(money);
  wrap.appendChild(list);
  return wrap;
}

// —— 案件面板 ——
function buildCases() {
  const wrap = el("div");
  const sysOn = STATE.unlockedSystems.cases;

  if (!sysOn && STATE.cases.inProgress.length === 0) {
    wrap.appendChild(elHtml('<div style="color:#5a4540;font-size:12px;text-align:center;padding:30px;letter-spacing:2px">还没有案件。</div>'));
    return wrap;
  }

  // 进行中
  const s1 = el("div", "cs-section");
  s1.appendChild(elHtml(`<div class="cs-section-title">⚡ 进行中(${STATE.cases.inProgress.length})</div>`));
  if (STATE.cases.inProgress.length === 0) {
    s1.appendChild(elHtml('<div style="color:#5a4540;font-size:12px;padding:6px 12px">暂无</div>'));
  } else {
    for (const c of STATE.cases.inProgress) {
      const def = CASES[c.id]; if (!def) continue;
      const total = def.stages.length;
      const progBar = def.stages.map((st,i) => i<c.stage ? '<span class="dot">●</span>' : '○').join("");
      const row = el("div", "cs-row");
      row.innerHTML = `<div class="cs-name">▸ ${def.name}</div><div class="cs-prog">进度 ${progBar} ${def.stages[Math.min(c.stage, total-1)]}阶段</div>`;
      s1.appendChild(row);
    }
  }
  wrap.appendChild(s1);

  // 已结案
  const s2 = el("div", "cs-section");
  s2.appendChild(elHtml(`<div class="cs-section-title">✅ 已结案(${STATE.cases.closed.length})</div>`));
  if (STATE.cases.closed.length === 0) {
    s2.appendChild(elHtml('<div style="color:#5a4540;font-size:12px;padding:6px 12px">暂无</div>'));
  }
  wrap.appendChild(s2);

  // 暗线
  const s3 = el("div", "cs-section");
  s3.appendChild(elHtml(`<div class="cs-section-title">🔍 我的暗线(${STATE.cases.secrets} / 6)</div>`));
  for (let i = 0; i < 6; i++) {
    const r = el("div", "cs-row locked");
    r.innerHTML = `<div class="cs-name">▸ ???</div>`;
    s3.appendChild(r);
  }
  wrap.appendChild(s3);

  return wrap;
}

// —— 地图面板 ——
function buildMap() {
  const wrap = el("div");
  const area = el("div", "map-area");
  for (const id in LOCATIONS) {
    const loc = LOCATIONS[id];
    const known = STATE.knownLocations[id];
    const isHere = STATE.here === id;
    const pin = el("div", "map-pin " + (isHere ? "self" : (known ? "known" : "unknown")));
    pin.style.left = loc.x + "%";
    pin.style.top  = loc.y + "%";
    pin.innerHTML = `<div class="dot"></div><div class="nm">${known ? loc.name : "???"}</div>`;
    area.appendChild(pin);
  }
  wrap.appendChild(area);
  const here = LOCATIONS[STATE.here];
  wrap.appendChild(elHtml(`<div class="map-here">📍 当前位置: <span class="nm">${here ? here.name : "—"}</span></div>`));
  return wrap;
}

// —— 我面板 ——
function buildMe() {
  const wrap = el("div");

  wrap.appendChild(elHtml(`
    <div class="me-head">
      <span class="nm">${PROTAG.name}</span>
      <span class="sub">${PROTAG.age} 岁</span>
    </div>
  `));

  // 数值
  const stats = el("div", "me-stats");
  const defs = [
    { k: "energy",     name: "💪 精力" },
    { k: "sanity",     name: "🧠 理智" },
    { k: "supplies",   name: "📦 物资" },
    { k: "reputation", name: "🌟 声望" },
    { k: "corruption", name: "🦠 腐化度" },
  ];
  for (const d of defs) {
    const v = STATE[d.k];
    const div = el("div", "me-stat");
    div.innerHTML = `
      <div class="row"><span>${d.name}</span><span class="val">${v}%</span></div>
      <div class="bar ${d.k}"><div style="width:${v}%"></div></div>
    `;
    stats.appendChild(div);
  }
  wrap.appendChild(stats);

  // 技能 + 关系
  const cols = el("div", "me-cols");
  const skillCol = el("div");
  skillCol.appendChild(elHtml(`<div class="me-col-title">技能</div>`));
  for (const id in SKILLS) {
    const s = SKILLS[id];
    const lv = STATE.unlockedSkills[id];
    const row = el("div", "me-row" + (lv ? "" : " locked"));
    row.innerHTML = `<span class="nm">${s.name}</span>` + (lv ? `<span class="lv">Lv ${lv}</span>` : "");
    skillCol.appendChild(row);
  }
  cols.appendChild(skillCol);

  const relCol = el("div");
  relCol.appendChild(elHtml(`<div class="me-col-title">关系</div>`));
  const knownIds = Object.keys(STATE.knownNPCs);
  if (knownIds.length === 0) {
    relCol.appendChild(elHtml(`<div style="color:#5a4540;font-size:12px;padding:6px 0">还没认识谁</div>`));
  } else {
    for (const id of knownIds) {
      const npc = NPCS[id]; if (!npc) continue;
      const r = STATE.relations[id] || 0;
      const dots = "●".repeat(r) + "○".repeat(3 - r);
      const row = el("div", "me-row");
      row.innerHTML = `<span class="nm">${npc.name}</span><span class="rel-dots">${dots}</span>`;
      relCol.appendChild(row);
    }
  }
  cols.appendChild(relCol);
  wrap.appendChild(cols);

  return wrap;
}

// —— 工具 —————————————————————————————————
function $(sel){ return document.querySelector(sel); }
function el(tag, cls){ const e = document.createElement(tag); if (cls) e.className = cls; return e; }
function elHtml(html){ const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; }
window.$ = $;
