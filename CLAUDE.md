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
- `IC_License.html` (2026-11-09): new section `#sec01b` "สรุปครบทุกบท" (22 chapters of the IC Plain syllabus with question
  counts, points, formulas, memory hooks, exam traps — built from the syllabus sheet the user sent), a TVM card (#16,
  `#tvmCard`) and a step-by-step teaching box + calculator inside the bond-pricing card. Styles/script are the
  "SPACEZ IC STUDY v2" block before `</body>` (`ys-` classes).
- 2026-11-09 (later): `IC_License.html` hero has a print bar (`.icp-bar`): "พิมพ์ / บันทึกเป็น PDF (A4)" + download links to
  `assets/docs/IC_Plain_Formulas_A4.pdf` (book 1: 43 formula cards, cheat sheet, 16 practice questions) and
  `assets/docs/IC_Plain_Summary_A4.pdf` (book 2: all 22 chapters, ethics, 23 reference tables, the 11 sub-topic pop-ups,
  plan, checklist). The "SPACEZ IC PRINT" block before `</body>` has the A4 `@media print` CSS and a beforeprint script
  that opens every `<details>`, copies each sub-topic pop-up inline (`.icp-sub`) and repaints dark colours light; afterprint undoes it.
  The two PDFs are rendered by Playwright from generator scripts kept outside the repo (Brain print palette); to change them,
  regenerate and replace the files. Risk-spectrum pop-up now uses the SEC 1–8 + 8+ scale (3 = government bond, 4 = fixed income).

## Added 2026-11-11

- Market Brain v2 (`x_smart.js`, built between `w_alert` and `f_pf`; styles at the end of `assets/css/part-83.css`):
  "Ask the Brain" box on every tab (`bqBar`, ~20 keyword topics EN/TH answered from the board's own numbers — no AI
  service), a confidence meter (`bqConf`), tripwires = the score-rule thresholds closest to being crossed (`bqTrip`,
  weights `BQ_W` must match `compute()` in `c_engine.js`), and a daily snapshot in localStorage `spz.brain.mem.v1`
  ("since you last looked" + score history). The three cards sit in the Summary tab under the verdict (`bqPanel`).
- `calibrate()` in `n_ext.js`: a forecast model whose own track record (60+ checks) is worse than "nothing changes"
  by more than 3% falls back to today's value (`q.fb`, `it.fb`; today that is unemployment). A general learned-shrinkage
  layer was tested walk-forward on `brain_ext.json` track points and NOT adopted — it made the other models worse.
- Latest Brain sources archive: `brain-sources-2026-11-11.tgz` (same private folder on the Mac).
- Local Brain testing: set sessionStorage `spacez.auth` = `{tier:'full',t:Date.now()}` + `spz_admin_users_key`, set
  localStorage `spacez.ack` to a timestamp, and mock `GET /api/brain/code-key` to return the key.
- Home (part-85, "HOME v3 polish" block at the end of part-85.css): aurora + dot grid + drawn price line behind the hero,
  trust line under the buttons, stats as one glass bar, topic ribbon (`tagsHTML`), section titles with a gradient rule,
  the path section has a real heading, and a closing band (`.spzh-end`) with links to `IC_License.html` and `SPACEZ_ISLAND.html`.


## Added 2026-11-12

- **Official-document (formal) print theme for the Market Brain.** `k_print.js` (Brain source) gained a third document
  style `formal` (now the default, stored in localStorage `spz.brain.prtheme`): white A4, black ink, thin rules — the
  admin Print-Report look. Print-settings also expose a chart "ink" choice (`spz.brain.prink`: `formal` deep hues vs
  `brain` bright). The formal cover (`coverFormal`) is plain ruled tables, not coloured cards; when the printed report is
  the price report only, the cover shows a per-asset forecast table (`pxCoverHTML` in `o_px.js`).
- **Gold & bitcoin price report is downloadable in one click.** The `px` tab (o_px.js `vPx`) now ends with a download
  bar (`.bz-pxdl`, buttons `data-pxdl="pdf|print|set"`) that builds the formal cover + full gold + full bitcoin document
  and saves a PDF without visiting the Print tab. `set` jumps to the Print tab for options.
- **PDF engine fix (applies to every Brain PDF button).** html2canvas 1.4.1 can't parse `color-mix()` / `color(srgb …)`
  (Chrome serialises mixed colours that way) and also threw `addColorStop non-finite` on some CSS gradients. `deModern()`
  in `k_print.js` (runs in the off-screen render copy inside `prep()`) rewrites every element's computed colour props to
  plain `rgb()/rgba()`, and in formal mode flattens leftover CSS gradients. Before this, the in-browser PDF was broken.
- **Forecast number box fixed.** The "now → 6M → 12M" chip in the forecast cards (and the macro-map header) used class
  `bz-fq`, which collided with another rule and rendered as a broken stacked box (the one in the user's photo). Renamed to
  `bz-hq` (`.bz-hq.st` on-screen = a clean horizontal pill with labels + arrows); the forecast range label `rg` → `bz-rg`.
  New on-screen styles are at the end of `assets/css/part-83.css` ("2026-11-11 (b)" block).
- A `PR_GUARD` script is embedded in every light/formal print document: darkens too-pale text for white paper and (formal
  only) flattens big tinted/gradient panels. Chart lines/text/legend swatches get a deeper shade via `inkify()` when
  ink = formal.
- Downloaded reports: new Mac folder `~/Documents/📄 SPACEZ REPORTS (เอกสารดาวน์โหลด)` for keeping the Brain PDFs (the
  browser still downloads to ~/Downloads first; this is just a tidy home for them). Not in the repo.
- Latest Brain sources archive: `brain-sources-2026-11-12.tgz` (same private folder on the Mac).

## Added 2026-11-13

- Loading screen v3 (`runBoot()` in `part-18.js`, styles "boot loader v3" at the end of `part-03.css`): glass card, logo in a
  progress ring, tagline (EN/TH), glowing bar, step dots; ring/bar/number glide with **time-based** easing (frame-based easing
  crawled when the page was busy). "Ready" only shows once the number is ~100.
- `part-01.js` (head, runs first): (1) `html.spz-pre` covers the very first paint for returning visitors so the bare page no
  longer flashes before the loader (CSS in `part-01.css`; runBoot removes it; 7 s safety timer). (2) `window.fetch` wrapper
  shares identical same-origin `data/*.json` GETs (each caller gets a clone, kept 60 s) — `data/backtest.json` used to be
  downloaded 3× per load (≈1.7 MB saved). (3) An IntersectionObserver pauses infinite CSS animations while they are off screen
  (class `.spz-anim-off`), ~150 were running below the fold.
- Mac (not in repo): `⚙️ อัตโนมัติ (AUTOMATION)/🗑 ลบรายงาน (CLEAR REPORTS).command` now covers TERMINAL/REPORTS **and**
  `~/Documents/📄 SPACEZ REPORTS (เอกสารดาวน์โหลด)` (list / delete all / pick folders, to Trash). The SYNC BACKUP command also
  copies `📄 SPACEZ REPORTS (…)` and `🔒 SPACEZ PRIVATE (…)` into `💾 TERMINAL BACKUP` with the same names (`SIDE` array).
- **Project manual** (2026-11-13): `📖 คู่มือระบบ (PROJECT DOCS)/` inside the Mac's TERMINAL folder (gitignored — it contains the
  Market Brain formulas; never publish) and mirrored into `💾 TERMINAL BACKUP` by the sync. Files `00_START_HERE.md` … `07_HOW_TO_WORK.md`
  + `SPACEZ_MANUAL_ALL_IN_ONE.md`: architecture, every file, every screen's formulas, the full Brain method, data pipeline, other apps,
  working rules. Update it when you change how something works.
