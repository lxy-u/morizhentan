/* ============================================================
   audio.js  ——  Web Audio 合成音效(不依赖外部素材)
   ============================================================ */

(function() {
  let ctx = null;
  let unlocked = false;

  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { return null; }
    }
    return ctx;
  }

  function unlock() {
    if (unlocked) return;
    const c = getCtx(); if (!c) return;
    if (c.state === "suspended") c.resume();
    unlocked = true;
  }
  document.addEventListener("pointerdown", unlock, { once: false });
  document.addEventListener("keydown", unlock, { once: false });

  function tone(freq, dur, type = "sine", vol = 0.2, attack = 0.01, release = 0.05) {
    const c = getCtx(); if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    const t0 = c.currentTime;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + attack);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol = 0.15, hi = 4000) {
    const c = getCtx(); if (!c) return;
    const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1);
    const src = c.createBufferSource(); src.buffer = buf;
    const filt = c.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = hi;
    const g = c.createGain();
    const t0 = c.currentTime;
    g.gain.setValueAtTime(vol, t0);
    g.gain.linearRampToValueAtTime(0, t0 + dur);
    src.connect(filt).connect(g).connect(c.destination);
    src.start(t0);
  }

  const SFX = {
    alarm() {
      // 老式机械闹钟 — 两个铃高频锤击
      let n = 0;
      const id = setInterval(() => {
        tone(2400 + Math.random()*200, 0.08, "square", 0.18);
        tone(2100, 0.08, "square", 0.14);
        n++;
        if (n >= 8) clearInterval(id);
      }, 70);
    },
    page() { noise(0.18, 0.08, 6000); },
    click() { tone(1800, 0.04, "sine", 0.1); },
    knock() { tone(120, 0.05, "sine", 0.3, 0.001, 0.04); setTimeout(() => tone(110, 0.05, "sine", 0.3, 0.001, 0.04), 90); },
    buzz() {
      // 手机震动
      let n = 0;
      const id = setInterval(() => {
        tone(80, 0.05, "square", 0.25);
        n++; if (n >= 4) clearInterval(id);
      }, 70);
    },
    whoosh() { noise(0.5, 0.12, 1200); tone(220, 0.5, "sine", 0.08, 0.05, 0.4); },
    door() { tone(180, 0.18, "sawtooth", 0.18); setTimeout(() => noise(0.7, 0.06, 2000), 150); },
    flash() { noise(1.2, 0.12, 8000); tone(440, 1.2, "sine", 0.06, 0.3, 1.0); },
  };

  window.SFX = {
    play(name) {
      if (!SFX[name]) return;
      try { SFX[name](); } catch(e) {}
    }
  };
})();
