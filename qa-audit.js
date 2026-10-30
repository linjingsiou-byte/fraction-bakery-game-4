/**
 * 分數遊戲全維度自動化體檢腳本 (qa-audit.js)
 * 專為四年級上學期「分數魔法烘焙屋 4.0」量身打造
 * 涵蓋 D1 ~ D7 七大全方位檢核維度
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const htmlCode = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const cssCode = fs.readFileSync(path.join(ROOT, 'index.css'), 'utf8');
const jsCode = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');

const report = {
  critical: [],
  warning: [],
  info: [],
  stats: {
    totalQuestions: 0,
    level1Questions: 0,
    level2Questions: 0,
    level3Questions: 0,
    level4Questions: 0,
    cssRuleCount: 0,
    modalCount: 0
  }
};

// 1. 建立輕量沙盒載入核心物件
const domMock = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        id,
        style: {},
        classList: {
          classes: new Set(['hidden']),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        innerText: '',
        innerHTML: '',
        value: '',
        disabled: false,
        appendChild() {},
        remove() {},
        querySelectorAll() { return []; },
        querySelector() { return null; },
        addEventListener() {}
      };
    }
    return this.elements[id];
  },
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      style: {},
      classList: {
        classes: new Set(),
        add(c) { this.classes.add(c); },
        remove(c) { this.classes.delete(c); },
        contains(c) { return this.classes.has(c); }
      },
      innerText: '',
      innerHTML: '',
      appendChild() {},
      remove() {},
      setAttribute() {},
      getAttribute() { return null; },
      addEventListener() {},
      querySelectorAll() { return []; },
      querySelector() { return null; }
    };
  },
  createElementNS(ns, tag) {
    return this.createElement(tag);
  },
  querySelectorAll() { return []; },
  querySelector() { return null; }
};

const sandbox = {
  window: {
    AudioContext: function() {
      this.currentTime = 0;
      this.state = 'running';
      this.resume = () => Promise.resolve();
      this.createOscillator = () => ({
        type: 'sine',
        frequency: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {},
        start() {},
        stop() {}
      });
      this.createGain = () => ({
        gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
        connect() {}
      });
      this.destination = {};
    },
    webkitAudioContext: function() {},
    speechSynthesis: {
      speak: () => {},
      cancel: () => {}
    },
    addEventListener: () => {}
  },
  document: {
    readyState: 'complete',
    getElementById: (id) => domMock.getElementById(id),
    createElement: (tag) => domMock.createElement(tag),
    createElementNS: (ns, tag) => domMock.createElementNS(ns, tag),
    querySelectorAll: (sel) => domMock.querySelectorAll(sel),
    querySelector: (sel) => domMock.querySelector(sel)
  },
  localStorage: {
    data: {},
    getItem(k) { return this.data[k] || null; },
    setItem(k, v) { this.data[k] = String(v); }
  },
  SpeechSynthesisUtterance: function(text) {
    this.text = text;
    this.lang = 'zh-TW';
    this.rate = 1;
    this.pitch = 1;
  },
  console,
  setTimeout: (fn, ms) => 1,
  clearTimeout: () => {},
  setInterval: (fn, ms) => 1,
  clearInterval: () => {},
  Date,
  Math,
  parseInt,
  parseFloat,
  JSON,
  Array,
  Object,
  String,
  Number,
  Boolean,
  RegExp,
  Error,
  Set,
  Map,
  Promise
};

// 注入匯出指令並執行
const instrumentedJs = jsCode + `\n;globalThis.__EXPORT__ = {
  AudioSynth: typeof AudioSynth !== 'undefined' ? AudioSynth : null,
  VoiceManager: typeof VoiceManager !== 'undefined' ? VoiceManager : null,
  MathRenderer: typeof MathRenderer !== 'undefined' ? MathRenderer : null,
  RenderEngine: typeof RenderEngine !== 'undefined' ? RenderEngine : null,
  QuestionGenerator: typeof QuestionGenerator !== 'undefined' ? QuestionGenerator : null,
  gameEngine: typeof gameEngine !== 'undefined' ? gameEngine : null,
  duelEngine: typeof duelEngine !== 'undefined' ? duelEngine : null,
  aiEngine: typeof aiEngine !== 'undefined' ? aiEngine : null,
  playtestEngine: typeof playtestEngine !== 'undefined' ? playtestEngine : null
};`;

vm.createContext(sandbox);
vm.runInContext(instrumentedJs, sandbox);
const {
  AudioSynth,
  VoiceManager,
  MathRenderer,
  RenderEngine,
  QuestionGenerator,
  gameEngine,
  duelEngine,
  aiEngine,
  playtestEngine
} = sandbox.__EXPORT__;

// ==================== D1 & D2: 數學課綱嚴謹度與 120 題庫邏輯驗證 ====================
if (!QuestionGenerator || !QuestionGenerator.levels) {
  report.critical.push({ category: 'D2_題庫完備性', location: 'QuestionGenerator', title: '找不到 QuestionGenerator 題庫物件！' });
} else {
  const levels = QuestionGenerator.levels;
  let qCount = 0;
  const seenIds = new Set();

  for (let lvl = 1; lvl <= 4; lvl++) {
    const list = levels[lvl] || [];
    report.stats[`level${lvl}Questions`] = list.length;
    qCount += list.length;

    if (list.length < 30) {
      report.warning.push({ category: 'D2_題庫完備性', location: `levels[${lvl}]`, title: `關卡 ${lvl} 題數小於 30 題 (目前 ${list.length} 題)` });
    }

    list.forEach((q, idx) => {
      // ID 唯一性檢查
      if (seenIds.has(q.id)) {
        report.critical.push({ category: 'D2_題庫完備性', location: `L${lvl}-${idx+1}`, title: `重複的題目 ID: ${q.id}` });
      }
      seenIds.add(q.id);

      // 課綱邊界與答案嚴謹性
      if (lvl === 1) {
        const { int, num, den } = q.data;
        if (den <= 0) report.critical.push({ category: 'D1_課綱嚴謹度', location: `L1-${q.id}`, title: `分母不可小於等於 0 (den=${den})` });
        if (q.type === 'classify') {
          let exp = int > 0 ? 'mixed' : (num >= den ? 'improper' : 'true');
          if (q.ans !== exp) report.critical.push({ category: 'D2_答案邏輯', location: `L1-${q.id}`, title: `分類答案錯誤: 預期 ${exp}, 題目標記 ${q.ans}` });
        } else if (q.type === 'convert_to_mixed') {
          const total = int * den + num;
          const expInt = Math.floor(total / den);
          const expNum = total % den;
          if (q.ans.int !== expInt || q.ans.num !== expNum || q.ans.den !== den) {
            report.critical.push({ category: 'D2_答案邏輯', location: `L1-${q.id}`, title: `假轉帶答案錯誤: 預期 {int:${expInt}, num:${expNum}, den:${den}}` });
          }
        } else if (q.type === 'convert_to_improper') {
          const expNum = int * den + num;
          if (q.ans.int !== 0 || q.ans.num !== expNum || q.ans.den !== den) {
            report.critical.push({ category: 'D2_答案邏輯', location: `L1-${q.id}`, title: `帶轉假答案錯誤: 預期 {int:0, num:${expNum}, den:${den}}` });
          }
        }
      } else if (lvl === 2) {
        const v1 = q.data.f1.int + q.data.f1.num / q.data.f1.den;
        const v2 = q.data.f2.int + q.data.f2.num / q.data.f2.den;
        let expSign = '=';
        if (v1 - v2 > 0.00001) expSign = '>';
        else if (v2 - v1 > 0.00001) expSign = '<';
        if (q.ans !== expSign) {
          report.critical.push({ category: 'D2_答案邏輯', location: `L2-${q.id}`, title: `比大小答案錯誤: 預期 ${expSign}, 題目標記 ${q.ans}` });
        }
      } else if (lvl === 3) {
        const f1 = q.data.f1;
        const f2 = q.data.f2;
        if (f1.den !== f2.den) {
          report.critical.push({ category: 'D1_課綱嚴謹度', location: `L3-${q.id}`, title: `同分母加減法分母不一致: ${f1.den} vs ${f2.den}` });
        }
        const s1 = f1.int * f1.den + f1.num;
        const s2 = f2.int * f2.den + f2.num;
        const expSlices = q.data.op === '+' ? s1 + s2 : s1 - s2;
        if (expSlices < 0) {
          report.critical.push({ category: 'D1_課綱嚴謹度', location: `L3-${q.id}`, title: `國小加減法出現負分數結果: ${expSlices}/${f1.den}` });
        }
        const ansSlices = q.ans.int * q.ans.den + q.ans.num;
        if (ansSlices !== expSlices || q.ans.den !== f1.den) {
          report.critical.push({ category: 'D2_答案邏輯', location: `L3-${q.id}`, title: `加減法答案錯誤: 預期切片 ${expSlices}/${f1.den}, 實際 ${ansSlices}/${q.ans.den}` });
        }
      } else if (lvl === 4) {
        const f1 = q.data.f1;
        const factor = q.data.factor;
        const slices = f1.int * f1.den + f1.num;
        const expSlices = slices * factor;
        const ansSlices = q.ans.int * q.ans.den + q.ans.num;
        if (ansSlices !== expSlices || q.ans.den !== f1.den) {
          report.critical.push({ category: 'D2_答案邏輯', location: `L4-${q.id}`, title: `倍數乘法答案錯誤: 預期 ${expSlices}/${f1.den}, 實際 ${ansSlices}/${q.ans.den}` });
        }
      }
    });
  }
  report.stats.totalQuestions = qCount;
}

// ==================== D3: 視覺幾何圖形與題圖適配性 ====================
if (!RenderEngine) {
  report.critical.push({ category: 'D3_幾何適配', location: 'RenderEngine', title: '找不到 RenderEngine 渲染引擎！' });
} else {
  // 檢查 OMML 直式分數呈現是否無斜角 '/'（過濾 HTML 標籤自身之後，文字中不得出現 / 符號）
  const sampleMath = MathRenderer.render(1, 2, 3);
  const textOnly = sampleMath.replace(/<[^>]+>/g, '').trim();
  if (textOnly.includes('/') || !sampleMath.includes('math-frac')) {
    report.critical.push({ category: 'D3_幾何適配', location: 'MathRenderer.render', title: '分數未遵守 OMML 直式結構，發現非法斜線分數！' });
  }

  // 檢查關卡 2 重疊比對模組是否健全支援逐盤展示
  if (typeof RenderEngine.showLevel2Overlap !== 'function') {
    report.critical.push({ category: 'D3_幾何適配', location: 'RenderEngine.showLevel2Overlap', title: '缺少 showLevel2Overlap 迷思重疊比對模組！' });
  }

  // 檢查關卡 3 退位減法切刀鷹架
  if (typeof RenderEngine.showLevel3BorrowAnimation !== 'function') {
    report.warning.push({ category: 'D3_幾何適配', location: 'RenderEngine.showLevel3BorrowAnimation', title: '缺少 showLevel3BorrowAnimation 借位切刀動態圖解！' });
  }
}

// ==================== D4: 狀態機與計時器生命週期 ====================
// 靜態掃描未定義方法呼叫
const knownObjects = { AudioSynth, VoiceManager, MathRenderer, RenderEngine, QuestionGenerator, gameEngine, duelEngine, aiEngine, playtestEngine };
const methodRegex = /\b(AudioSynth|VoiceManager|MathRenderer|RenderEngine|QuestionGenerator|gameEngine|duelEngine|aiEngine|playtestEngine)\.([a-zA-Z0-9_]+)\s*\(/g;
let m;
while ((m = methodRegex.exec(jsCode)) !== null) {
  const [call, obj, fn] = m;
  const targetObj = knownObjects[obj];
  if (targetObj && typeof targetObj[fn] !== 'function') {
    report.critical.push({ category: 'D4_生命週期', location: `${obj}.${fn}`, title: `呼叫了未定義的方法: ${obj}.${fn}()` });
  }
}

// 檢查切換畫面時是否具備 VoiceManager.stop() 與計時器清理
const switchCode = gameEngine.switchScreen ? gameEngine.switchScreen.toString() : '';
if (!/VoiceManager\.stop/.test(switchCode)) {
  report.warning.push({ category: 'D4_生命週期', location: 'gameEngine.switchScreen', title: '切換畫面時未強制停止語音播放 (VoiceManager.stop)' });
}
if (!/clearBattleThinkingTimer/.test(switchCode) || !/clearAiThinkingTimer/.test(switchCode)) {
  report.warning.push({ category: 'D4_生命週期', location: 'gameEngine.switchScreen', title: '切換畫面時未徹底清理雙人對抗或 AI 思考計時器' });
}

// ==================== D5: 語音 (TTS) 與音效控制 ====================
if (!AudioSynth) {
  report.critical.push({ category: 'D5_語音音效', location: 'AudioSynth', title: '找不到 AudioSynth 音效合成器！' });
} else {
  // 檢查 playTone 通用備援實作
  if (typeof AudioSynth.playTone !== 'function') {
    report.warning.push({ category: 'D5_語音音效', location: 'AudioSynth.playTone', title: '缺乏 playTone 通用頻率音效兜底方法' });
  }
}

if (!VoiceManager) {
  report.critical.push({ category: 'D5_語音音效', location: 'VoiceManager', title: '找不到 VoiceManager 語音模組！' });
} else {
  // 檢查 Emoji 與標籤過濾清洗函數
  if (typeof VoiceManager.cleanSpeechText !== 'function') {
    report.warning.push({ category: 'D5_語音音效', location: 'VoiceManager.cleanSpeechText', title: '缺乏 cleanSpeechText 語音字串清洗方法（防 Emoji/HTML 朗讀雜音）' });
  }
}

// ==================== D6: 三級載具 RWD 與無障礙 ====================
// 檢查離線字型 Fallback
if (!/Microsoft JhengHei|微軟正黑體/.test(cssCode)) {
  report.info.push({ category: 'D6_載具與無障礙', location: 'index.css', title: '建議於 font-family 加入本機繁中字型 fallback (Microsoft JhengHei)' });
}

// 檢查小螢幕 RWD 斷點 (@media (max-width: 650px) 或 768px)
if (!cssCode.includes('@media') || !/max-width:\s*(?:650|768)px/.test(cssCode)) {
  report.critical.push({ category: 'D6_載具與無障礙', location: 'index.css', title: '缺少平板/手機小螢幕核心 RWD media query 斷點！' });
}

// 鍵盤無障礙檢查 (Escape / Enter / Backspace)
if (!/Escape/.test(jsCode)) {
  report.info.push({ category: 'D6_載具與無障礙', location: 'app.js', title: '建議全域 keydown 支援 Escape 鍵關閉彈出視窗 (Modal / Overlay)' });
}

// CSS 總規則數統計
const cssMatches = cssCode.match(/\{/g) || [];
report.stats.cssRuleCount = cssMatches.length;

// Modal 元素統計
const modalMatches = htmlCode.match(/class=["'][^"']*modal[^"']*["']/g) || [];
report.stats.modalCount = modalMatches.length;

// ==================== 輸出體檢報告 JSON ====================
console.log(JSON.stringify(report, null, 2));

const exitCode = report.critical.length > 0 ? 1 : 0;
process.exit(exitCode);
