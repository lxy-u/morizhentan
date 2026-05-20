# 末日侦探社 · Day 1 第一场「醒来」

互动叙事 demo。纯 HTML + CSS + JS,无构建,无依赖。

## 在线试玩

部署后访问:`https://lxy-u.github.io/morizhentan/`

## 本地跑

```bash
python -m http.server 5174
# 浏览器打开 http://localhost:5174
```

或者直接双击 `index.html`(部分浏览器会因本地文件协议限制 Web Audio,推荐起 server)。

## 玩什么

第一场约 8–12 分钟。从闹钟响起,到推门白光结束。
- 房间循环探索:笔记本 / 手机 / 窗外
- 床底铝盒隐藏分支(5 件物品独白)
- 玄关镜子 + 阿默来电
- 推门白光

## 文件结构

```
index.html       主入口
style.css        全部样式 + 关键 CSS 精画(闹钟/窗外/镜子)
js/
  audio.js       Web Audio 合成音效
  data.js        NPC / 道具 / 地点 / 技能 / 主角
  state.js       全局状态 + 增减 API
  ui.js          顶/底栏 / 浮窗 / 4 个面板
  scene.js       beat 引擎
  scenes.js      Day 1 第一场的剧本
```

## 给同事的话

是真的游戏,不是 mock。可以玩,可以选,可以触发分支。视觉是 CSS/SVG 风格化,后续可以替换为 AI 出的真插画。
