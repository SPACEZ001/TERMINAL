# SPACEZ TERMINAL — brief for any new Claude session

Read this file first. It is the whole context you need.

## What this is

A bilingual (EN / TH) financial-education terminal. What the user sees is
**`SPACEZ_TERMINAL.html`**, but as of 2026-09-28 it is a shell (~275 KB) that
loads its code from external files under `assets/js/` (59 files) and
`assets/css/` (40 files). Before that date this was a single ~3.5 MB file with
everything inlined — it was split up because the huge inline file made the
page hang/freeze on load on some devices.

- Repo: `github.com/SPACEZ001/TERMINAL` (**public** — never commit an API key)
- Live: https://spacez001.github.io/TERMINAL/SPACEZ_TERMINAL.html (GitHub Pages, `main`)
- Working clone on the user's Mac: `~/mnt/Documents/TERMINAL` in `device_bash`
  (= `/Users/spacez/Documents/TERMINAL` on the Mac). It is a real git clone with
  push access already configured. Work here — do not clone somewhere else.

## The one rule

**Only touch what the user asked about.** Do not create new pages, do not
touch other screens in the app, do not restructure anything beyond the
request. The user is a beginner and speaks Thai; they use speech-to-text, so
read intent generously and ask when a request is ambiguous.

This repo used to also say "edit `SPACEZ_TERMINAL.html` only, never split it
into other files" — the user explicitly asked to override that and split the
file for real (2026-09-28), for the reason above. Don't revert that decision
or re-inline everything back into one file unless the user asks for that.

## How the file is built (post-split, 2026-09-28)

- `SPACEZ_TERMINAL.html` still has the same document structure and the same
  execution order as before — the split was a pure mechanical extraction
  (verified byte-for-byte reversible). Every inline `<script>...</script>` that
  had no `src=` became `<script src="assets/js/part-NN.js"></script>` in the
  exact same position; every `<style>...</style>` became
  `<link rel="stylesheet" href="assets/css/part-NN.css">` in the exact same
  position. The 3 external Firebase `<script src=...>` tags near the end were
  left untouched.
- **Files are named `part-01.js`, `part-02.js`, ... by position, not by
  feature.** The original file's banner comments
  (`<!-- ===== SPACEZ WHAT NOW ===== -->`) are sparse and one banner often
  covers many unrelated blocks spanning thousands of lines, so they were not
  reliable enough to name files after. `MODULE_MAP.md` (repo root) has a rough
  hint per file (nearest banner + a content preview) generated at split time —
  treat it as a starting point, not ground truth.
- **To find the file for a feature, grep for it**:
  `grep -rln "search term" assets/js/*.js assets/css/*.css`
  — e.g. grep for a UI string, a `data-` attribute, or a function name you see
  in a bug report.
- **To add a brand-new screen**, the old convention (append a `<style>` +
  `<script>` IIFE block before `</body>`, behind a banner comment) still
  works fine inline in the HTML — you don't have to create a new external file
  for small additions. Only pull something out to `assets/js/` or
  `assets/css/` if it's a large new module and the user's request is about
  performance/size, matching `part-NN` numbering (next unused NN).
- Every string exists in both English and Thai. If you add copy, add both.
- Screens talk to each other through globals: `__SPZ_LIVE`, `__SPZ_REGIME`,
  `__SPZ_STOCK`, `__SPZ_NOW`, `__SPZ_WATCH`, `__SPZ_RANK`, `__SPZ_DIR`,
  `__SPZ_PROOF`, `__SPZ_HERO`, `SPZ_CYCLE`, `__spzAddRoute`. These still work
  exactly as before — splitting into files did not change load order, so a
  module's `boot()`-polling pattern (waiting for a global to appear) is still
  safe to rely on.
- Routing is hash based: `#/now`, `#/regime`, `#/stock`, `#/proof`, ...
- A consent gate (`#spzGate`, localStorage `spacez.ack`) covers the first paint.

## Where the numbers come from

- `data/market.json` — GitHub Actions job `market-data`, every 30 min, `yfinance`.
- `data/backtest.json` — GitHub Actions job `backtest`, daily.
- `data/brain.json` + `data/brain_ext.json` — job `brain-data`, twice a day (`scripts/fetch_brain.py`,
  `scripts/fetch_brain_ext.py`); feed the Market Brain (`#/brain`, admin + editor only since 2026-11-04, source pieces were
  concatenated into `assets/js/part-83.js`). `scripts/alerts_brain.py` sends its warning signals to
  the owner's Telegram (state in `data/alerts_state_brain.json`).
- Built by `scripts/fetch_market.py` and `scripts/build_backtest.py`.
- The page fetches them same-origin. Some screens are still hand-typed; each screen
  carries a `.spz-src` badge saying live / mixed / frozen / teach / sim. If you change
  what a screen is built from, change its badge in the `STATUS` map too.

## Added 2026-11-05

- `scripts/brain_wf.py` -> `data/brain_wf.json` (brain-data job): 12-year prices-only walk-forward of the
  stock rules, survivor-fair benchmark (equal-weight whole list), stop-loss study per market. The page's
  stop-loss (`stopFor()` in the Brain sources) uses its `best_stop`.
- Telegram alerts for the Brain run in `line-qr-worker.js` (BRAIN ALERTS + `scheduled()` handler), driven by a
  Cloudflare Cron Trigger (every 30 min), not GitHub Actions. The page syncs holdings to
  `/api/brain/alerts/pf`. The user must paste the Worker and add the Cron Trigger in the dashboard.
- Brain sources now also include `w_alert.js` (between `v_pill` and `f_pf` in the build order).
- Update guide PDF: `assets/docs/brain-update-2026-11-05.pdf` (linked from How-to-read).

## Testing

Serve the **repo root** (not just the HTML file — it now needs `assets/`
and `data/` to be siblings of it) and drive it with Playwright — never `file://`:

    cd ~/mnt/Documents/TERMINAL && python3 -m http.server 8777

Existing suites: `scripts/test_backtest.py`, `scripts/test_charts.py`,
`scripts/test_pipeline_offline.py`. Browser suites live outside the repo; a quick
smoke test in a headless browser is usually enough for a small change. After any
edit to `assets/js/*.js` or `assets/css/*.css`, do a full page load + a few
route changes in a headless browser and check the console for errors/404s —
a typo in a `src=`/`href=` path is the new failure mode to watch for that
didn't exist with a single inline file.

## Shipping

    cd ~/mnt/Documents/TERMINAL
    git pull --ff-only
    # edit
    git add -A && git commit -m "..." && git push

Then wait for the Pages build and confirm the deployed file matches:

    shasum SPACEZ_TERMINAL.html
    curl -s https://raw.githubusercontent.com/SPACEZ001/TERMINAL/main/SPACEZ_TERMINAL.html | shasum

When you changed `assets/js/*.js` or `assets/css/*.css` too, `git status`
should show those alongside the HTML — a commit for a code change is very
rarely just the HTML file anymore.

**Mirror backup on the Mac (2026-10-29, changed 2026-11-05):** do NOT refresh it
automatically any more. At the end of every task ASK the user whether to back up;
only when she says yes ("สำรอง") refresh the full mirror
`~/Documents/💾 TERMINAL BACKUP` (same file names; excludes `.git/` and
`💾 BACKUP (สำรองไฟล์)/`) by running, in `device_bash`,
`SPZ_NONINTERACTIVE=1 bash "$HOME/mnt/Documents/TERMINAL/⚙️ อัตโนมัติ (AUTOMATION)/🔄 เช็ก+ซิงก์สำรอง (SYNC BACKUP).command" --sync`
(needs the Documents folder connected). The daily 🚀 automation also runs it.

**Always mask credentials in shell output:** pipe anything that could print the
remote URL through `sed 's/github_pat_[A-Za-z0-9_]*/***/g'`.

## Added 2026-11-07

- Site root: `index.html` is now only a redirect to `SPACEZ_TERMINAL.html` (keeps `#/route`). The old
  password exam portal moved to `SPACEZ_EXAM_PORTAL.html` (git mv, unchanged inside).
- `assets/js/part-86.js` + `assets/css/part-86.css`: `#/exams` exam room (CEWA International sets +
  IC_1–6, old-portal cards + hover, 12 per page, random set; 'exams' is in LOCKED_ROUTES = admin +
  editor) and `#/apps` (other SPACEZ sites, new tab). The CEWA file list in part-86 is only scrambled,
  not secret. Admin panel button `#cagBtnArena` ("ทดลองสอบ CEWA International · IC") opens `#/exams`.
- Home (part-85): "how stocks work in four pictures" infographic under the hero (`basicsHTML()`).
- IC: `IC_License.html#sec00` start-here plan; IC_1–6 save results to localStorage `spz.ic.results`
  and show score by part. IC question objects are `{s,q,c,a,e}` (s = part 1/2/3, a = answer index).
- `SPACEZ_TAX_TERMINAL.html`: "SPACEZ TAX v2" block before `</body>` = tab shell + calculator board;
  it overrides the global `renderTaxResults()`; the engine (`computeTax`) is untouched.
- Later on 2026-11-07: theme is a single moon/sun button (`.theme-toggle`, part-14) with only 'void' and
  'light'; SPACEZ apps button in the top bar (part-86); menu has a featured block (Market Brain + exam
  room, part-15 `examsItem()`) and an "Elliott Wave" group; part-86 also holds a light-theme
  readability guard (darkens low-contrast text, marked `data-spzlc`). Home has 5 tabbed basics lessons
  (`lessonsHTML()` in part-85).
- Market Brain code encryption: `assets/js/min/part-83.bin` = "SPZB1" + iv + AES-256-GCM. Key is the
  Worker secret BRAIN_CODE_KEY (never in the repo), served by `GET /api/brain/code-key` to Admin /
  Editor only. part-82 decrypts in the browser (`PLAIN_FALLBACK = false` since the user set up the
  Worker on 2026-11-07). The readable bundle `assets/js/part-83.js` / `min/part-83.js` is gitignored and
  must never be committed. Brain sources + build.sh + encrypt.js + the key live OUTSIDE the repo, on the
  Mac in `~/Documents/🔒 SPACEZ PRIVATE (ห้ามอัปขึ้น GitHub)/brain-sources-*.tgz`. To change the Brain:
  unpack to /tmp/bz, edit, run build.sh (it builds then encrypts into part-83.bin), commit only the .bin
  (+ min/part-83.css). Older git history still contains readable copies unless the user agrees to a
  history rewrite.

## Added 2026-11-08

- `SPACEZ_ISLAND.html`: pixel-art island-nation game (open to everyone), one self-contained file, all art
  drawn by its own code. Build on the map, a monthly economy sim (GDP, inflation, unemployment, policy rate,
  tax/spending, bonds, stock index, national fund), news events with lessons, and a "Council" quiz that reads
  the `var RAW` question arrays from `IC_1–6.html` (falls back to a small built-in set). Correct answers give
  ★ to unlock research (banks, central bank, exchange, regulator...). Saves: localStorage `spz.island.slot.1..3`
  + `spz.island.last`, plus export/import of a .json file. Linked from the SPACEZ apps list (part-86 `APPS`)
  and from `IC_License.html` section 06.
- Later on 2026-11-08/09: the game's "Council" is now a full-screen IC study room (lessons for 13 topics across
  the 3 exam parts, practice by part/topic, 20- and 100-question mock exams with the real pass rule, fix-mistakes,
  progress by topic). Questions are tagged with a topic by keyword (`topicOf`). News events are rarer (≥18 months
  apart) and each choice now shows a textbook verdict, its effects and a quick-check question. Also: building
  levels 1–3, roads, day/night with lit windows, birds, need bubbles, town rank. Source pieces are concatenated
  into the one HTML file — edit `SPACEZ_ISLAND.html` directly.
- 2026-11-09 (game v3): new saves use a 240×160 archipelago (`mapv:3`); old saves keep the 112×72 map (`setMapSize`).
  Other nations (`S.nat`, AI towns with owner in building slot 5, borders `OWNT`), exports/imports + currency (`tradeTick`),
  FTA/gifts in the World tab, settling empty islands (needs a shipyard), cargo ships on BFS sea routes, free smooth zoom
  + minimap, 3×3 wonders (airport, stadium, space port), 22 news events (5-year cooldown) whose quick check draws a real
  IC question on the same topic, and a "start from zero" path + memory tips + step calculators in the study room.
