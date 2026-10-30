# 《分數魔法烘焙屋 4.0》全維度評測診斷報告 (QA Diagnostic Report)

> **受檢專案**：國小四年級上學期數學「分數」（分數魔法烘焙屋 4.0）  
> **課綱單元**：康軒版第四冊第九單元／108 課綱條目 `N-4-5`  
> **評測工具**：`fraction-game-qa-pipeline`（QA 體檢腳本 `qa-audit.js` ＋ Puppeteer E2E `run_playtest.js`）  
> **評測日期**：2026-10-30  
> **版本狀態**：v4.0.2（正式發佈版）  
> **評測總評**：🟢 **PASS 全項綠燈認證（0 Critical、0 Warning、100% 題庫圖示與測試通過）**

---

## 壹、 評測維度總覽矩陣 (D1 ~ D7)

| 維度編號 | 檢核維度 | 核心檢核重點 | 評測判定 | 備註說明 |
| :---: | :---| :---| :---: | :---|
| **D1** | **數學課綱概念嚴謹度** | 真分數、假分數、帶分數定義、同分母加減不減出負數、帶分數整數為純色實心圓、OMML 直式標準 | 🟢 **PASS** | 0 處超綱，帶分數整數嚴格維持純色實心圓（`<circle class="whole-cake">`），全站 100% 直式呈現 |
| **D2** | **題庫與答案邏輯完備性** | 4 關卡 × 30 題 = 120 題庫唯一 ID、數據結構、答案運算準確性、雙人對稱同構題池 | 🟢 **PASS** | 120 題 ID 零重複，答案運算驗證 100% 精準吻合 |
| **D3** | **幾何圖形與題圖適配性** | 盤數等於 $\lceil \text{數值} \rceil$、散裝切片與分子吻合、關卡 2 逐盤重疊比對、關卡 3 退位減法借位切刀、關卡 4 烤盤網格 | 🟢 **PASS** | 消除多餘空盤，重構逐盤並排重疊比對（克服帶分數忽略整數偏誤） |
| **D4** | **狀態機與計時器生命週期** | 畫面切換清理（`switchScreen`）、3.0s 讀題緩衝防偷跑、AI 皮埃爾思考計時器、教學安全閥暫停與恢復 | 🟢 **PASS** | 切換畫面時 100% 停止 TTS 與釋放所有計時器，防範幽靈彈窗 |
| **D5** | **語音 (TTS) 與音效控制** | Web Audio 原生音效防崩潰、`playTone` 通用備援、`cleanSpeechText` 清洗 Emoji/HTML/斜線分數發音、`autoSpeech` 開關 | 🟢 **PASS** | 實裝 `AudioSynth.playTone` 與 `VoiceManager.cleanSpeechText`，發音標準友善 |
| **D6** | **三級載具 RWD 與無障礙** | 平板直橫式、小手機（375px/414px）、觸控大螢幕、桌機鍵盤快捷鍵（數字鍵、Backspace、Escape 關閉 Modal、Enter 提交） | 🟢 **PASS** | 5 大解析度 0 溢出，支援全鍵盤 Escape/Enter 無障礙操作，補足離線中文字型 |
| **D7** | **自動化體檢腳本覆蓋** | 純 Node.js 沙盒快速檢驗腳本（`qa-audit.js`）與 Puppeteer 實際 Chrome 完整模擬（`run_playtest.js`） | 🟢 **PASS** | `qa-audit.js` 0 錯誤通過，`run_playtest.js` 64/64 斷言 100% 通過 |

---

## 貳、 統計數據總覽

* **受檢題庫總題數**：120 題
  * 關卡 1（認識與互換魔法屋）：30 題（分類 7 題、假換帶 12 題、帶換假 11 題）
  * 關卡 2（分數比大小天平）：30 題（含真分數、假分數、帶分數綜合比對）
  * 關卡 3（同分母加減魔法秤）：30 題（加法 13 題、減法 17 題，退位減法配備借位切刀動態圖解）
  * 關卡 4（倍數烤箱魔法陣）：30 題（各盤切片等於分子，烤盤數等於倍數）
* **自動化斷言執行數**：64 項
* **斷言成功率**：100% (64 Passed, 0 Failed)
* **CSS 規則總數**：418 組
* **彈出層與對話框（Modal/Overlay）**：11 組（全數支援 Escape 關閉）

---

## 參、 經典破綻診斷與本期升級清單 (v4.0.2)

### 1. 【D5 語音音效】實裝通用單音備援 `AudioSynth.playTone`
* **診斷破綻**：原 `AudioSynth` 僅實作預設字串音效（`correct`, `incorrect`, `click`, `victory` 等）。若未來擴充自訂頻率或拖曳音效時呼叫 `playTone` 會引發執行期未定義錯誤。
* **修復措施**：在 [app.js](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/app.js) 中新增 `playTone(freq = 440, duration = 0.12, type = 'sine')`，內建 Web Audio `AudioContext` 狀態保護與線性淡出，達成音效系統零崩潰防護。

### 2. 【D5 語音音效】實裝 `VoiceManager.cleanSpeechText` 朗讀文字清洗
* **診斷破綻**：原 TTS 模組直接將傳入文字送進 `SpeechSynthesisUtterance`。若字串夾帶 Emoji（如 🍰、🎂、🔪）或 HTML 標籤（如 `<span>`），部分瀏覽器會朗讀 Emoji 英文名稱或標籤符號，干擾學童聽力理解。
* **修復措施**：在 [app.js](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/app.js) 中實裝 `cleanSpeechText(rawText)`，主動清除 HTML 標籤、過濾 Emoji 字符集，並將文字中可能出現的 `3/4` 正則轉換為「四分之三」，使語音朗讀符合國小數學教學常態。

### 3. 【D6 載具無障礙】全域鍵盤 Escape 關閉彈窗與 Enter 提交支援
* **診斷破綻**：原鍵盤監聽器僅在單人模式下處理數字 0~9 與 Backspace，彈出說明、結算視窗或重疊比對時只能靠滑鼠/手指點擊關閉按鈕。
* **修復措施**：在 `window.addEventListener('keydown')` 中擴充：
  * 按下 `Escape` 鍵：依序偵測並關閉 `#instruction-modal`、`#winner-modal`、`#ai-gameover-modal`、`.overlap-overlay` 與 `#borrow-knife-animation`。
  * 按下 `Enter` 鍵：於單人答題畫面自動觸發答案提交。

### 4. 【D6 離線字型】加入 Windows 本機繁中字型 Fallback
* **診斷破綻**：原字型設定僅指定 Google Fonts（Outfit, Noto Sans TC），若在電腦教室完全斷網的環境下開啟網頁，中文字體可能降級為系統預設細明體。
* **修復措施**：在 [index.css](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/index.css) 中將字型定義擴充為 `'Outfit', 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', sans-serif`，確保離線狀態下依然保持高質感微軟正黑體渲染。

### 5. 【D7 自動化驗證】建置常態化 `qa-audit.js` 免瀏覽器體檢機制
* **升級效益**：在專案根目錄正式建立 [qa-audit.js](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/qa-audit.js)，任何後續維護者可隨時透過 `node qa-audit.js` 在 1 秒內快速完成 120 題庫與七大維度全面靜態檢查，形成防護網。

---

## 肆、 自動化體檢驗證紀錄

```bash
$ node qa-audit.js
{
  "critical": [],
  "warning": [],
  "info": [],
  "stats": {
    "totalQuestions": 120,
    "level1Questions": 30,
    "level2Questions": 30,
    "level3Questions": 30,
    "level4Questions": 30,
    "cssRuleCount": 418,
    "modalCount": 11
  }
}

$ node run_playtest.js
==================== TEST RESULT ====================
Passed assertions: 64
Failed assertions: 0
✅ E2E PLAYTEST PASSED! All systems are functional and bug-free.
```

---

## 伍、 交付物與線上部署狀態

* **核心代碼更新**：
  * [index.html](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/index.html)：版本升級為 `v=4.0.2`
  * [index.css](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/index.css)：加入 `Microsoft JhengHei` 離線繁中字型
  * [app.js](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/app.js)：加入 `AudioSynth.playTone`、`VoiceManager.cleanSpeechText`、全域 `Escape`/`Enter` 鍵盤無障礙支援
  * [qa-audit.js](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/qa-audit.js)：七大維度自動化驗證腳本
* **線上試玩網址**：
  👉 **https://linjingsiou-byte.github.io/fraction-bakery-game-4/**
