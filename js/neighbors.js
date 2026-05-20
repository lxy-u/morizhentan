/* ============================================================
   neighbors.js  ——  5 邻居栏 + 简单交互
   ============================================================ */

window.NBR_DATA = {
  gucheng: { name:"顾沉",    door:"302", avatar:"🤵", trait:"沉默", hp:100, max:100, supplies: 30 },
  ahmo:    { name:"阿默",    door:"303", avatar:"👧", trait:"热情", hp:100, max:100, supplies: 22 },
  maocat:  { name:"老猫",    door:"304", avatar:"🐱", trait:"神秘", hp:100, max:100, supplies: 999 },
  zou:     { name:"邹大爷",  door:"305", avatar:"👴", trait:"慷慨", hp:80,  max:100, supplies: 40 },
  linjie:  { name:"林洁",    door:"306", avatar:"👩‍🦰", trait:"焦虑", hp:60, max:100, supplies: 10 },
};

window.NBR = {};

// 初始化关系
NBR.init = function() {
  STATE.nbrState = STATE.nbrState || {};
  for (const id in NBR_DATA) {
    STATE.nbrState[id] = STATE.nbrState[id] || {
      hp:  NBR_DATA[id].hp,
      supplies: NBR_DATA[id].supplies,
      rel: STATE.relations?.[id] || 1,
      dead: false,
    };
  }
};

NBR.renderRail = function() {
  const rail = document.getElementById("nbr-rail");
  if (!rail) return;
  rail.innerHTML = "";
  for (const id in NBR_DATA) {
    const def = NBR_DATA[id];
    const st  = STATE.nbrState[id];
    const cell = document.createElement("div");
    cell.className = "nbr-cell" + (st.dead ? " dead" : "");
    const dots = "●".repeat(st.rel) + "○".repeat(Math.max(0, 3 - st.rel));
    cell.innerHTML = `
      <div class="nbr-avatar">${def.avatar}</div>
      <div class="nbr-name">${def.name}</div>
      <div class="nbr-rel">${dots}</div>
      <div class="nbr-hp"><div style="width:${(st.hp/def.max)*100}%"></div></div>
    `;
    cell.onclick = () => NBR.openCell(id);
    rail.appendChild(cell);
  }
};

NBR.openCell = function(id) {
  const def = NBR_DATA[id];
  const st  = STATE.nbrState[id];
  const head = document.getElementById("as-head");
  const body = document.getElementById("as-body");
  head.textContent = `${def.avatar} ${def.name} · ${def.door} · ${def.trait}`;
  body.innerHTML = "";

  const acts = [];
  if (st.dead) {
    acts.push({ label: "(他已经不在了)", disabled: true });
    acts.push({
      label: "进他家拾荒(食物 +2,材料 +3)",
      fn: () => {
        STATE.res.food = (STATE.res.food||0) + 2;
        STATE.res.material = (STATE.res.material||0) + 3;
        addNotice(`🗑 拾荒于 ${def.name}`);
        APT.renderTopHud();
      }
    });
  } else {
    acts.push({
      label: "👋 敲门 · 打个招呼(关系 +1)",
      fn: () => {
        st.rel = Math.min(3, st.rel + 1);
        addNotice(`👥 与 ${def.name} 关系 +1`);
        NBR.renderRail();
      }
    });
    acts.push({
      label: "🥫 送 2 食物(关系 +1)",
      cost: { food: 2 },
      fn: () => {
        st.rel = Math.min(3, st.rel + 1);
        st.supplies += 2;
        addNotice(`🎁 给了 ${def.name} 食物`);
        NBR.renderRail();
      }
    });
    if (st.rel >= 2) {
      acts.push({
        label: `🤝 求他今晚帮你守门(关系 ${st.rel} 够,但目前是占位)`,
        fn: () => {
          STATE.flags["nbr_help_" + id] = true;
          addNotice(`🤝 ${def.name} 答应今晚帮忙`);
        }
      });
    }
    // 剧情触发(占位)
    if (id === "gucheng" && st.rel >= 2 && !STATE.flags.gucheng_story1) {
      acts.push({
        label: `🔍 [线索] 问他每天 7 点经过的事`,
        fn: () => {
          STATE.flags.gucheng_story1 = true;
          APT.closeSheet();
          APT.hide();
          SCENE.play([
            { type: "bg", view: "hallway" },
            { type: "place", name: "门外 · 楼道" },
            { type: "dialog", who: "suning", text: "顾沉。你每天 7 点经过我家门口。" },
            { type: "dialog", who: "gucheng", text: "......你知道？" },
            { type: "dialog", who: "suning", text: "今天你来晚了。" },
            { type: "narration", style: "think", text: "(他没回答。)" },
            { type: "notice", text: "🔍 暗线:顾沉 · 第 1 块" },
            { type: "fn", fn: () => APT.show() },
          ]);
        }
      });
    }
  }

  for (const act of acts) {
    const btn = document.createElement("button");
    btn.className = "as-act";
    btn.innerHTML = `<div>${act.label}</div>`;
    if (act.cost) {
      const parts = [];
      for (const k in act.cost) {
        const ok = (STATE.res[k]||0) >= act.cost[k];
        parts.push(`<span class="${ok?'':'bad'}">${RESOURCES[k].icon} ${act.cost[k]}</span>`);
        if (!ok) btn.disabled = true;
      }
      btn.innerHTML += `<div class="as-cost">耗:${parts.join(" ")}</div>`;
    }
    if (act.disabled) btn.disabled = true;
    btn.onclick = () => {
      if (btn.disabled) return;
      if (act.cost) for (const k in act.cost) STATE.res[k] -= act.cost[k];
      if (act.fn) act.fn();
      APT.closeSheet();
      APT.renderTopHud();
    };
    body.appendChild(btn);
  }

  document.getElementById("action-sheet").hidden = false;
  document.getElementById("as-close").onclick = APT.closeSheet;
};
