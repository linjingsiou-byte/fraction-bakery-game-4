# 交接檔（handoff.md）
 
> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。
 
## ⏯️ 目前做到哪
完成「開發者試玩除錯面板平時 100% 對學生隱藏，僅在網址附帶 `?debug=1` 時顯現（v4.0.6）」並推播部署至 GitHub Pages！
1. **開發者除錯面板權限與顯示機制優化（方案 A）**：
   - 需求目標：學生課堂操作時，右下角不應常駐出現除錯面板小標籤（避免學生分心點擊），但需保留開發者與自動化測試腳本使用。
   - 實作機制：
     - 在 [index.css](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/index.css) 中將 `.dev-panel` 預設樣式改為 `display: none;`，僅在帶有 `.dev-visible` 時設為 `display: flex;`。
     - 在 [app.js](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/app.js) 的 `playtestEngine.init()` 中讀取 URL 查詢字串與 Hash，只有當網址帶有 `?debug=1`、`?dev=1` 或 `#debug` 時才掛載 `.dev-visible` 顯現面板。
     - 若執行 `runFullAutoTest()`，自動掛載 `.dev-visible`，確保自動化腳本能無縫呼叫。
     - 在 [run_playtest.js](file:///d:/Antigravity/02_教材與教具(互動網頁遊戲)/2026_四年級上學期_數學：分數/run_playtest.js) 中加入 `?debug=1` 參數。
2. **全套測試雙驗證**：
   - 獨立驗證腳本 `scratch/verify_debug_visibility.js`：確認一般開啟時 `display: none`（100% 隱藏），加 `?debug=1` 時 `display: flex`（正常顯現）。
   - `node qa-audit.js`：0 Critical、0 Warning 通過。
   - `node run_playtest.js`：Puppeteer Chrome 64/64 斷言 100% 通過。
   - 資源版本號升級為 `v=4.0.6`。
 
## 🚦 目前狀態
- **可運行狀態**：全功能健全、無任何 Bug。正式學生版畫面 100% 乾淨無開發者面板干擾。
- **最新功能**：
  1. 學生模式下右下角乾淨純淨，不顯示除錯面板。
  2. 開發者或老師在網址後加上 `?debug=1` 即可呼叫除錯面板進行自動化試玩驗證。
  3. `qa-audit.js` 與 `run_playtest.js` 64 項斷言全數通過。
 
## ➡️ 下一步
1. 於平板（iPad）與大螢幕觸控電視進行實際課堂試教，驗證學童對全新「逐盤重疊比對」與「借位切刀」的直觀理解。
2. 依課堂試教觀察反饋進行後續微調。
 
## ⚠️ 注意事項
- 全站（單人自學、雙人對戰、AI 挑戰模式）數字鍵盤皆採觸控優化設計，點擊格子高亮選取，直接點按虛擬鍵盤或實體數字鍵皆可輸入。
- 帶分數整數部分必須保持純色實心圓（`<circle>`），不可預先切割為分母碎塊，以防止學童產生數碎片偏誤。
- 分數渲染使用 OMML 直式橫線樣式（`display: inline-table`），不可降級為 `/` 斜角或國字分數。
- 專案依賴 Puppeteer 執行本地端測試（`node run_playtest.js`），執行前請確認已安裝 Chrome。
 
## 🕐 最後更新
- 時間：2026-10-31 22:31
- 更新者：Antigravity @ LAPTOP-C73KGKMS
- Git push：已推播至 `origin/main`（GitHub Pages: `linjingsiou-byte/fraction-bakery-game-4`）
