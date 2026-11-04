# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian（若有 L3）。

## ⏯️ 目前做到哪
完成《分數魔法烘焙屋 4.0》【國小教師 × 學生家長】雙視角網站特色與教學導覽手冊產製（含 7 張黃金教學瞬間 `@2x` 高解析截圖、Markdown 線上預覽版與 Word 專書 `_v1.docx`），並將此端到端工作流封裝為跨年級全域技能 `fraction-game-guide-pipeline`！
1. **7 張「黃金教學瞬間」高解析截圖擷取與視覺防裁切檢核**：
   - 使用 Puppeteer 自動觸發各關卡動態鷹架並定格擷取 `@2x` 高解析截圖（首頁三大模式並排、關卡 1 湊滿 4 片打包成 1 個實心圓餅、關卡 2 藍橘半透明逐盤重疊比對、關卡 3 退位減法魔法借位切刀三步驟圖解、關卡 4 倍數烤盤 3 盤並列＋獨立算式、雙人對決 3.0 秒讀題思考緩衝條、單人 AI 挑戰賽 Combo 雙層加成與教學安全閥暫停徽章）。
   - 經逐圖視覺檢核，達成 0 裁切、0 疊字、0 遮擋。
2. **雙受眾（國小教師 × 學生家長）導覽手冊雙格式產出**：
   - 產出專案內可列印專書：`分數魔法烘焙屋4.0_網站特色與教學導覽手冊_v1.docx`（嚴格遵守全域規範，所有字型 ≧ 12pt，含雙色親師專欄表格與親子共學黃金提問）。
   - 產出內嵌截圖之線上預覽 Artifact：`分數魔法烘焙屋4.0_網站特色與教學導覽手冊.md`。
3. **跨年級全域技能封裝與多 Agent 同步**：
   - 建立 `fraction-game-guide-pipeline` 技能（含 `SKILL.md`、`scripts/capture_template.js`、`scripts/docx_guide_template.py`），並同步至 Antigravity（`~/.gemini/config/skills/`）、Claude Code（`~/.claude/skills/`）與 Codex（`~/.agents/skills/`）。

## 🚦 目前狀態
- **可運行狀態**：網站主程式（`v4.0.10`）與導覽手冊皆完整就緒、無任何未完成半成品。
- **待同步項目**：本地已更新 `AGENTS.md`、`handoff.md` 並新增 `分數魔法烘焙屋4.0_網站特色與教學導覽手冊_v1.docx`，等待使用者確認 commit 訊息後即可推播至 GitHub。

## ➡️ 下一步
1. 切換至其他年級（二年級、三年級上/下學期、四年級下學期）的分數互動網站專案，直接呼叫 `fraction-game-guide-pipeline` 技能產製各年級的親師導覽手冊。
2. 於實際課堂（觸控大電視／iPad）進行試教與親師分享，觀察教師與家長的使用回饋。

## ⚠️ 注意事項
- **DOM 巢狀結構提醒**：`index.html` 中 `#ai-screen` 目前位於 `#duel-screen` 標籤內部（未閉合 `</section>`），若透過腳本獨立截圖 `#ai-screen` 時，需維持 `#duel-screen.active` 並隱藏其餘非 `#ai-screen` 的直屬子元素。
- **跨電腦全域技能同步提醒**：本次新增的 `fraction-game-guide-pipeline` 位於本機全域目錄（`~/.gemini/config/skills/`、`~/.claude/skills/`、`~/.agents/skills/`），不在本專案 Git repo 內，若換到另一台電腦請記得同步全域技能資料夾。
- **既有暫存資料夾**：專案目錄下的 `scratch/` 為早期除錯截圖暫存，不納入版本控制（可考慮加入 `.gitignore`）。

## 🕐 最後更新
- 時間：2026-11-04 22:07
- 更新者：Antigravity @ LAPTOP-C73KGKMS
- Git push：✅ 已推（`origin/main`，GitHub Pages: `linjingsiou-byte/fraction-bakery-game-4`）
