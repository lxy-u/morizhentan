/* ============================================================
   defense.js  ——  夜晚防守 mini
   ============================================================ */

window.DEFENSE = {
  active: false,
  zombieTimer: null,
  doorTimer: null,
  kills: 0,
  losses: 0,
  doorHpMax: 100,
};

DEFENSE.start = function() {
  if (DEFENSE.active) return;
  DEFENSE.active = true;
  DEFENSE.kills = 0;
  DEFENSE.losses = 0;
  STATE.door = STATE.door || { hp: 100, max: 100 };
  DEFENSE.doorHpMax = STATE.door.max;

  // 暂停世界时钟,防守期间手动推进
  WORLD.pause();

  // 显示防守层
  document.getElementById("defense-layer").hidden = true;  // reset
  const layer = document.getElementById("defense-layer");
  layer.hidden = false;
  document.getElementById("def-end").hidden = true;
  document.getElementById("def-arena").innerHTML = "";
  DEFENSE.renderHud();

  // 生成丧尸
  DEFENSE.zombieTimer = setInterval(() => {
    if (!DEFENSE.active) return;
    DEFENSE.spawnZombie();
  }, 1400);

  // 门血量下降(被门外丧尸啃)
  DEFENSE.doorTimer = setInterval(() => {
    if (!DEFENSE.active) return;
    // 屏幕上每多 1 个未杀丧尸 → 门多掉 0.5 hp
    const aliveZombies = document.querySelectorAll(".zombie:not(.hit)").length;
    STATE.door.hp -= (0.6 + 0.3 * aliveZombies);
    if (STATE.door.hp <= 0) {
      STATE.door.hp = 0;
      DEFENSE.end(false);
      return;
    }
    DEFENSE.renderHud();
  }, 400);

  // 自动推进游戏时间(防守 = 一夜 = 10 真实秒/小时,共 60 秒)
  let gameMinutesAdded = 0;
  const advanceTimer = setInterval(() => {
    if (!DEFENSE.active) { clearInterval(advanceTimer); return; }
    WORLD.minutes += 6;
    gameMinutesAdded += 6;
    if (WORLD.minutes >= 24*60) {
      WORLD.minutes -= 24*60;
      WORLD.day++;
    }
    const h = Math.floor((WORLD.minutes % (24*60)) / 60);
    const m = WORLD.minutes % 60;
    STATE.hour = h; STATE.minute = m; STATE.day = WORLD.day;
    if (h >= 6 && h < 12) {
      // 天亮了 — 胜利
      DEFENSE.end(true);
      clearInterval(advanceTimer);
    }
  }, 300);

  // 点击射击
  const arena = document.getElementById("def-arena");
  arena.onclick = (e) => {
    const rect = arena.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // 视觉:弹孔闪光
    const flash = document.createElement("div");
    flash.className = "shot-flash";
    flash.style.left = (x - 15) + "px";
    flash.style.top  = (y - 15) + "px";
    arena.appendChild(flash);
    setTimeout(() => flash.remove(), 300);
    // 命中检测
    const target = e.target.closest(".zombie");
    if (target && !target.classList.contains("hit")) {
      if ((STATE.res.ammo || 0) >= 1) {
        STATE.res.ammo -= 1;
        target.classList.add("hit");
        DEFENSE.kills++;
        setTimeout(() => target.remove(), 300);
        if (window.SFX) SFX.play("knock");
      } else {
        addNotice("🔫 没子弹了!");
      }
    } else if ((STATE.res.ammo || 0) >= 1) {
      // 空射也消耗子弹
      STATE.res.ammo -= 1;
    }
    DEFENSE.renderHud();
  };
};

DEFENSE.spawnZombie = function() {
  const arena = document.getElementById("def-arena");
  if (!arena) return;
  const z = document.createElement("div");
  z.className = "zombie";
  z.textContent = "💀";
  const w = arena.clientWidth, h = arena.clientHeight;
  z.style.left = (Math.random() * (w - 60)) + "px";
  z.style.top  = (Math.random() * (h - 60)) + "px";
  arena.appendChild(z);
  // 30 秒不杀自动消失(算它进门了)
  setTimeout(() => {
    if (z.parentNode && !z.classList.contains("hit")) {
      z.remove();
      DEFENSE.losses++;
    }
  }, 20000);
};

DEFENSE.renderHud = function() {
  const hud = document.getElementById("def-hud");
  if (!hud) return;
  const door = STATE.door || { hp: 100, max: 100 };
  const pct = (door.hp / door.max) * 100;
  hud.innerHTML = `
    <div>🌑 <span class="def-time">Day ${WORLD.day} · ${padTime(STATE.hour)}:${padTime(STATE.minute)}</span> · 击杀 ${DEFENSE.kills} · 漏 ${DEFENSE.losses} · 🔫 ${Math.floor(STATE.res.ammo||0)}</div>
    <div class="def-door"><div style="width:${pct}%"></div></div>
    <div class="def-door-lbl">🚪 门 HP ${Math.floor(door.hp)} / ${door.max}</div>
  `;
};

DEFENSE.end = function(victory) {
  DEFENSE.active = false;
  if (DEFENSE.zombieTimer) clearInterval(DEFENSE.zombieTimer);
  if (DEFENSE.doorTimer)   clearInterval(DEFENSE.doorTimer);
  // 清屏
  const arena = document.getElementById("def-arena");
  if (arena) arena.innerHTML = "";

  const end = document.getElementById("def-end");
  end.hidden = false;
  if (victory) {
    end.innerHTML = `
      <h2>天亮了</h2>
      <p>击杀 ${DEFENSE.kills} 只 · 漏 ${DEFENSE.losses} 只</p>
      <p>🚪 门 HP ${Math.floor(STATE.door.hp)} / ${STATE.door.max}</p>
      <p>子弹剩 ${Math.floor(STATE.res.ammo||0)}</p>
      <button id="def-cont">继续 →</button>
    `;
  } else {
    end.innerHTML = `
      <h2>门破了</h2>
      <p>击杀 ${DEFENSE.kills} 只</p>
      <p>你受了伤,精力 -30,理智 -10。</p>
      <p>(门会自动修到 50)</p>
      <button id="def-cont">继续 →</button>
    `;
    STATE.energy = Math.max(0, STATE.energy - 30);
    STATE.sanity = Math.max(0, STATE.sanity - 10);
    STATE.door.hp = 50;
    STATE.flags["doorBroken_d" + WORLD.day] = true;
  }
  document.getElementById("def-cont").onclick = () => {
    end.hidden = true;
    document.getElementById("defense-layer").hidden = true;
    // 推到第二天 06:00
    WORLD.setTime(6, 30);
    WORLD.resume();
    APT.show();
    // 触发新一天 morning event
    if (window.STORY) STORY.triggerMorning(WORLD.day);
  };
};
