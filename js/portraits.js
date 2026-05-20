/* ============================================================
   portraits.js  ——  SVG 风格化立绘(占位,等真插画)
   ============================================================ */

window.PORTRAITS = {};

// 苏宁 — 30 岁,深棕短发微卷,深灰风衣 + 黑色高领
// 半身,从胸口到头顶
PORTRAITS.suning = function(expr = "neutral") {
  // 表情参数
  const eyes = {
    neutral: { lDx: 0, rDx: 0, openY: 1.0, brow: 0 },
    tired:   { lDx: 0, rDx: 0, openY: 0.55, brow: 4 },
    bitter:  { lDx: 1, rDx: -1, openY: 0.8, brow: 2 },
    determined: { lDx: 0, rDx: 0, openY: 1.0, brow: -3 },
    closed:  { lDx: 0, rDx: 0, openY: 0.1, brow: 1 },
  }[expr] || { lDx:0, rDx:0, openY:1, brow:0 };

  const mouth = {
    neutral: "M 95 168 Q 105 170 115 168",
    tired:   "M 95 169 Q 105 169 115 169",
    bitter:  "M 95 170 Q 105 166 115 170",
    determined: "M 96 168 L 114 168",
    closed:  "M 95 169 Q 105 170 115 169",
  }[expr] || "M 95 168 Q 105 170 115 168";

  // 通用 path 数据
  return `
<svg viewBox="0 0 210 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="skinG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e8d0b8"/>
      <stop offset="100%" stop-color="#b89880"/>
    </linearGradient>
    <linearGradient id="coatG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4a4540"/>
      <stop offset="100%" stop-color="#1a1612"/>
    </linearGradient>
    <linearGradient id="hairG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3a2418"/>
      <stop offset="100%" stop-color="#1a0e08"/>
    </linearGradient>
  </defs>

  <!-- 风衣肩 -->
  <path d="M 20 320 L 30 220 Q 60 195 105 190 Q 150 195 180 220 L 190 320 Z"
        fill="url(#coatG)" stroke="#0a0808" stroke-width="1.5"/>

  <!-- 风衣领翻 -->
  <path d="M 70 218 Q 105 230 140 218 L 130 250 Q 105 240 80 250 Z"
        fill="#2a2520" stroke="#0a0808" stroke-width="1"/>

  <!-- 黑色高领 -->
  <path d="M 85 215 Q 105 225 125 215 L 122 195 Q 105 200 88 195 Z"
        fill="#0a0808"/>

  <!-- 脖子 -->
  <path d="M 92 195 L 90 175 Q 105 178 120 175 L 118 195 Z"
        fill="url(#skinG)"/>

  <!-- 脸轮廓 -->
  <ellipse cx="105" cy="148" rx="36" ry="42" fill="url(#skinG)" stroke="#5a3a28" stroke-width="0.8"/>

  <!-- 头发(齐肩短发,微卷) -->
  <path d="M 68 130 Q 65 100 80 85 Q 105 70 130 85 Q 145 100 142 130
           Q 145 155 142 175 L 130 178 Q 130 152 128 140
           Q 130 118 122 110 Q 105 103 88 110 Q 80 118 82 140
           Q 80 152 80 178 L 68 175 Q 65 155 68 130 Z"
        fill="url(#hairG)" stroke="#0a0a08" stroke-width="0.6"/>

  <!-- 头发碎发 -->
  <path d="M 78 110 Q 88 100 96 108" stroke="#0a0a08" stroke-width="1" fill="none"/>
  <path d="M 122 108 Q 116 100 110 110" stroke="#0a0a08" stroke-width="1" fill="none"/>

  <!-- 眉 -->
  <path d="M 86 ${135 - eyes.brow} Q 93 ${132 - eyes.brow} 100 ${135 - eyes.brow}" stroke="#1a0a04" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M 110 ${135 - eyes.brow} Q 117 ${132 - eyes.brow} 124 ${135 - eyes.brow}" stroke="#1a0a04" stroke-width="2" fill="none" stroke-linecap="round"/>

  <!-- 眼睛(根据表情 openY 拉扁) -->
  <ellipse cx="${93 + eyes.lDx}" cy="146" rx="4" ry="${4*eyes.openY}" fill="#2a1a10"/>
  <ellipse cx="${117 + eyes.rDx}" cy="146" rx="4" ry="${4*eyes.openY}" fill="#2a1a10"/>
  ${eyes.openY > 0.4 ? `
    <ellipse cx="${93 + eyes.lDx}" cy="145" rx="1.5" ry="${1.5*eyes.openY}" fill="#fff" opacity="0.7"/>
    <ellipse cx="${117 + eyes.rDx}" cy="145" rx="1.5" ry="${1.5*eyes.openY}" fill="#fff" opacity="0.7"/>
  ` : ""}

  <!-- 黑眼圈(疲惫感) -->
  <path d="M 87 152 Q 93 154 99 152" stroke="#7a5a48" stroke-width="0.8" fill="none" opacity="0.6"/>
  <path d="M 111 152 Q 117 154 123 152" stroke="#7a5a48" stroke-width="0.8" fill="none" opacity="0.6"/>

  <!-- 鼻 -->
  <path d="M 104 152 Q 102 162 104 165 L 108 165" stroke="#7a5a48" stroke-width="0.8" fill="none" opacity="0.7"/>

  <!-- 嘴 -->
  <path d="${mouth}" stroke="#7a3a3a" stroke-width="2" fill="none" stroke-linecap="round"/>

  <!-- 右耳银钉 -->
  <circle cx="142" cy="155" r="1.8" fill="#c0c0c0"/>

  <!-- 左腕手表(被遮)— 不画 -->
</svg>
  `;
};

// 阿默 — 暂时不画立绘(电话不出现),需要时再补
PORTRAITS.ahmo = function(expr = "neutral") {
  return `
<svg viewBox="0 0 210 320" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ahmoCoat" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#5a3050"/>
      <stop offset="100%" stop-color="#1a0a18"/>
    </linearGradient>
  </defs>
  <path d="M 30 320 L 40 220 Q 60 195 105 190 Q 150 195 170 220 L 180 320 Z"
        fill="url(#ahmoCoat)"/>
  <ellipse cx="105" cy="148" rx="34" ry="40" fill="#e8d0b8"/>
  <path d="M 70 135 Q 70 95 105 78 Q 145 90 140 130 L 140 160 L 130 155
           Q 130 130 125 120 Q 105 108 85 120 Q 80 130 80 155 L 70 160 Z"
        fill="#c84080"/>
  <circle cx="93" cy="148" r="3.5" fill="#2a1a10"/>
  <circle cx="117" cy="148" r="3.5" fill="#2a1a10"/>
  <path d="M 95 168 Q 105 174 115 168" stroke="#7a3a3a" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>
  `;
};
