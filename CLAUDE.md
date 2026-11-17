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
  (+ min/part-83.css). (Checked 2026-11-15 across all 1,079 commits: the readable Brain code was never in the GitHub history.)

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
- Later 2026-11-13: (a) Brain print — dark document style uses a white copy of the site logo (`PR_LOGO_WHITE` / `prLogo()` in
  `k_print.js`); formal and light keep the black logo. Sources archive `brain-sources-2026-11-14.tgz`. (b) **Markets 101**
  (`assets/js/part-87.js` + `assets/css/part-87.css`, loaded right after part-86): "รู้จัก 4 ตลาด" lessons — stocks, forex, options,
  crypto — each with a drawn SVG infographic, how you earn / lose, a worked example, key terms, a safe-start list, plus a comparison
  table. It is inserted into the Guided Mode page `#/guided` (the "แนะนำ" pill, top right) before its note; part-23 is untouched.
  Facts checked 2026-11-13: BOT has licensed no retail forex in Thailand; TFEX SET50 options = 200 THB/point, European.

## Added 2026-11-15

- **The Worker source left the public repo.** `line-qr-worker.js` (Cloudflare Worker `spacez-line-link`: logins, admin APIs, Quiet
  Value formula, Brain key + alerts) now lives only on the Mac in `~/Documents/TERMINAL/☁️ WORKER (Cloudflare)/line-qr-worker.js`
  (gitignored folder) and is pasted into the Cloudflare dashboard from there. It is in `.gitignore`. Git history was rewritten with
  `git filter-repo --path line-qr-worker.js --invert-paths` (force-pushed 2026-11-15; all commit hashes changed). It never contained
  tokens — every secret comes from `env.*`. A full pre-cleanup backup is in the private folder:
  `terminal-history-before-cleanup-2026-11-15.bundle` (`git clone <bundle>` restores it). Any old clone must
  `git fetch && git reset --hard origin/main` (never push from an old clone — it would bring the file back).
  To edit the Worker: edit the Mac copy, paste into the dashboard, keep it out of git.

## Added 2026-11-15 (later)

- **Faster home:** `scripts/fetch_market.py` also writes `data/market_lite.json` (= market.json without each stock's `c`
  closes, ~360 KB vs ~2.1 MB, plus a ready-made `home_line` for the home hero line; the market-data workflow commits it).
  part-26 loads the lite file on home + reading-only routes (`LITE_ROUTES`) and fetches the full file the first time any
  other route opens (it wraps `history.pushState/replaceState` to notice router moves). part-85 `ewLine()` uses `home_line`.
- **Search + app install:** `assets/js/part-88.js` + `css/part-88.css`: top-bar search button (also "/" and Ctrl/Cmd+K) over
  menu pages (`window.__spzRouteList()` in part-15), stocks in the snapshot and other SPACEZ sites. PWA: `manifest.webmanifest`,
  `sw.js` (network-first, cache only as offline fallback; skips cross-origin, Range, no-store and `.bin`), icons in
  `assets/icons/`. "Install as an app" in the palette footer and at the end of the SPACEZ apps pop-up (browser prompt when
  offered, otherwise iPhone / Android / computer steps).
- **Locks:** `earlysignal` and `quietValue` are admin-only (`ADMIN_ONLY_ROUTES`, earlysignal left `MEMBER_ROUTES`). The
  locked-page pop-up (`.cag-toast`, part-46 + part-30.css) is a card with the page name; its button remembers the page
  (`pendingRoute`, 10 min) and opens it after sign-in (on `spz:tier` / `spz:line` / `spz:acc` …).
- **Beginner course:** `assets/js/part-89.js` + `css/part-89.css` mount one chapter (`.spzc`) under the heading of Learn
  pages 01 stockclass, 02 basics, 03 start, 04 types, 06 signals, 07 guided (05 glossary untouched): course bar, lesson,
  SVG drawings, calculators (`CALC`: grow, trade, dca, value, size), quick check, "next chapter". Progress localStorage
  `spz.course.v1`, folded state `spz.course.fold`. Thai market facts were checked 2026-11-15 (see the header comment).
  The Stock Classroom lessons themselves were already public (Worker `/api/classroom/public`).
- **Economic calendar v2** (part-58 + end of part-40.css): calendar left (sticky), chosen day's schedule + this week right;
  feed times are UTC and are now shown/grouped in the visitor's local time; today pre-selected; "Today" button; legend.
- **Live outlook + shock watch:** `assets/js/part-90.js` + `css/part-90.css` read `data/brain.json` (raw FRED series only):
  a printed rule-of-thumb cycle reading sets `SPZ_CYCLE.live` (+ asOf, confidence), rewrites `OUTLOOK.ind/snapDate/disc/src`
  and each outlook scenario's watch list with live ✓ checks (part-15 exposes `window.__SPZ_OUTLOOK`). #/scenarios gets a
  "what the data points at now" strip (heat 0–3 per measurable shock, opens it via `__SPZ_SCENARIOS.open`). STATUS badges
  for outlook + scenarios are now 'mixed'.

## Added 2026-11-16

- **Brain gold & bitcoin charts** (`o_px.js` `pxChart`, sources archive `brain-sources-2026-11-16.tgz`): thinner, calmer lines in
  the style of the "gold vs real yields" chart — price 1.7, MAs 1, forecast 1.6 dashed, sample paths .8 at 28%, lighter fan,
  smaller markers, height 580 → 470. `cycleChart` lines 2 / 1.1.
- **Sign-in on first visit:** `maybeAutoOpenGate()` (part-46) now waits for the disclaimer however long it is read (it gave up after
  30 s) and for the loading screen (`.boot3`, + 1.2 s grace), then opens the gate once per tab session for basic visitors.
- **Reviewer tier** (ผู้ประเมิน — lecturers, deans, teachers, directors): its own tab in the gate, **same code as Editor**
  (`editorCodeMatches`), same rights (tier stays `'editor'`); sessionStorage `spz.role = 'reviewer'` changes the labels, lands on
  `#/home` and shows a gold "Reviewer mode" pill bottom-left (`.spz-rev-badge`). Logout clears it. Empty admin groups are hidden.
- **Admin panel tiles v2** (end of part-30.css): publish / reports / tools buttons as dark cards with a glowing icon tile and an
  animated gradient edge on hover (cyan-violet / amber-pink / emerald-cyan per group).
- Menu / admin developer card text: "Creator of SPACEZ TERMINAL" + "Elliott Wave Analyst · Fintech Web Developer" (part-15).
- part-88: search opens on mouse hover (260 ms); top bar is translucent navy glass with a gradient hairline; the bottom-right
  sign-in / status buttons glow on hover and show a preview card (`.spzd-card`, mouse only; click still opens the real panel).
- part-89: Stock Classroom chooser (`.spzc-hub`) shows ONE of the three tracks at a time — beginner course / 6 levels (part-84
  `#skStart`) / topic lessons — localStorage `spz.class.pane`.
- **Bubble Radar wide layout:** `assets/js/part-91.js` + `css/part-91.css` group part-40's flat blocks into sections on a 12-column
  grid (gauge | meaning, sticky risk shape | 5 signals, other signals, flows | money map, burst, playbook, archetypes | scenario
  link); re-runs after every part-40 repaint (it rebuilds with innerHTML). part-40 is untouched.

## Added 2026-11-17

- **Brain Summary tab polish** (sources archive `brain-sources-2026-11-17.tgz`). The "everything in one table" was broken —
  each value cell stacked into tall boxes — because part-84.css had a bare global `.v{display:flex…}` (Stock Classroom visual
  card) that also matched the Brain's `td.v` / `div.v`. It is now `:where(#skStart) .v` (same specificity). Also, at the end of
  part-83.css ("2026-11-17 Summary tab polish"): guide grid 3 columns, forecast cards 4 per row, rows of the big table with a
  coloured left edge by impact + tinted forecast cells, money-flow card sticky beside the long return list, section-title rules,
  mobile: "now → 6M" on one line, sticky first column in the table, no word-by-word wraps in the score block, BTC-USD no wrap.
  Heatmap header no longer prints the last month on top of the "latest" column (`n_ext.js`).

## Added 2026-11-17 (later)

- **Print the whole site (admin only):** `assets/js/part-92.js` + `css/part-92.css`, route `#/printall` (in `ADMIN_ONLY_ROUTES`
  and `NAV_HIDDEN`), opened from the admin panel Reports button `#cagBtnPrintAll` (hidden for editors). It visits every menu page
  (+ home), keeps only what is visible (text, lists, tables, SVG charts with colours inlined, canvases as images; no buttons,
  inputs, scripts, styles), adds both classrooms (part-65 `window.__SPZ_CLASSROOM_PRINT`: rooms / title / load with the admin key),
  the Market Brain "everything + all manuals" (`window.__SPZ_BRAIN_PRINT.html('all')` from k_print.js; its CSS + part-83.css are
  scoped under `.spa-brain` by `scopeCss`) and `IC_License.html`. Output: print / PDF (white A4, cover, contents, ref `SPZ-AL-…`),
  one .html file, or one .md text file for AI. Selection in localStorage `spz.printall.sel`. A full run takes ~45 s (~220 pages).
  `window.__SPZ_HTML2MD(node)` (DOM → Markdown) is shared with the Brain.
- **Brain print tab:** new first type "Everything + all manuals" (`all` in `PR_TYPES`) and a "Download as text (.md) for AI"
  button (`data-prmd`, `prMd()`). Sources archive `brain-sources-2026-11-17b.tgz`.

## Added 2026-11-17 (evening)

- **Bubble Radar:** the sticky "risk shape" radar no longer slides over the sections below — part-91 puts it and the 5 signals
  in one row box (`.bbx-pair`), so the sticky stays inside that row.
- **Top bar:** `.top-fixed .nav` has no background box any more (part-88.css end); the rounded `.nav-cluster` pill is the only surface.
- **Stock Classroom learning path (part-89):** the chooser is now "เรียนหุ้น 3 ขั้น" — step 1 beginner course (7 chapters) → step 2
  6 levels (part-84 `#skStart`) → step 3 lesson library (part-65 topic shell). Chapter 7 ends with "ไปขั้นที่ 2"; a band after the
  6 levels / the library (`.spzc-nb`, `data-pane-of`) links to the next step; any `[data-gopane="course|levels|topics"]` link opens
  the classroom on that step (`__SPZ_COURSE.goPane`). Chapter 5 "ตัวเลขสำคัญ" now exists (`CH.glossary`, mounted on `#glossary`
  above the terms) so every chapter has a "next" button.
- **Course pill (part-89 `pillMount`):** once the course bar / path is scrolled past, a pill like the Market Brain tab pill appears top
  left (after the LIVE chip, before the nav pill; below the top row when there is no room): ‹ chapters › and ▾ for the whole path
  (7 chapters + step 2 + step 3). Classes `.spzc-tp`, `.spzc-tpm`.
- **Guided page (#/guided):** order is chapter 7 → Markets 101 (`#markets101`) → the 10-step tour folded into one card
  (`.spzg-tour`, localStorage `spz.guided.tour`) → the note. part-23 still drives its own elements inside the card. Emoji → line icons
  in part-23 (`GM_IC`, `gmIc`, `gmIcG`) and part-87 (`mk4-svg`). The Stock Classroom page no longer draws the candle/price-line
  background (`.ewv-page-stk .ewv-pagebg` hidden). A shared "course page skin" for #basics / #start / #guided and the lesson-library
  sidebar is at the end of part-89.css.
- **Executive board (admin only):** `assets/js/part-93.js` + `css/part-93.css`, route `#/board` (ADMIN_ONLY_ROUTES, NAV_HIDDEN): site
  numbers, data freshness (HEAD + Last-Modified of data/*.json), admin shortcuts, a to-do list (localStorage `spz.board.todo`). Menu:
  third card in the special block (`boardItem()` in part-15); the block is now titled "พื้นที่ผู้บริหาร · แอดมิน · Editor · ผู้ประเมิน" /
  "Executive suite · Admin · Editor · Reviewer".
- **Sign-in tabs:** order LINE · Telegram · Member · Reviewer · Editor · Admin; reviewer tab gold gradient; reviewer pane text a bit
  bigger (end of part-30.css, uses `:has`).
- **Developer card (part-15 `bioCard`, end of part-03.css):** black-hole disc removed; shooting stars (`.dev-meteors`), pointer light
  (`.dev-spot`, `--dmx/--dmy`), aurora hover per link button (IG pink, FB violet, links green) instead of plain blue.
- **Dock preview cards (part-88):** close as soon as the pointer leaves button + card (140 ms grace, pointermove watchdog, scroll/blur);
  the ring lingers ~1 s and fades (`.spzd-fade`). Switching buttons no longer leaves the old one glowing.
- `#printall` / `#board` sections use the site's 130px top padding; their inner cards are `div`s (a nested `<section>` picked up the
  global section padding).

## Added 2026-11-17 (night)

- **Course pill (part-89):** shows only while a course page is the active route (follows the router via `__spzNav.at()`, polled every
  400 ms — the site menu moves with pushState, no hashchange) and sits on the same line as the nav pill (`--cp-t`).
- **Page 2 (#basics):** under chapter 2 the old page's repeats (what a share is, the four first-order words) and the four link boxes are
  hidden; account opening + broker apps + the "5 checks" tab sit in one folded card (`.spzb-more`, localStorage `spz.basics.more`).
  Page 5 (#glossary) gets a title card above the 44-term explorer (`.spzc-libh`) and the library card look.
- **Search (part-88):** opening by hover is a "peek" (`.spzq.peek`) that closes when the pointer leaves the button + box; a click or typing
  pins it. New ✕ button (`.spzq-x`).
- **Sign-in tabs:** the reviewer tab is gold only when selected.
- **Board (part-93):** two tabs — "โครงสร้างองค์กร" (shareholders → board → CEO → six departments; names editable, localStorage
  `spz.board.org`, tab in `spz.board.tab`) and "แผงควบคุมเว็บ" (the earlier cards).
- **Tools modal v2:** `assets/js/part-94.js` + `css/part-94.css` (loaded after part-93): one-screen layout for Position size / Currency /
  Wealth builder, example numbers filled the first time, recalculates 300 ms after typing (presses the tool's own button), a price
  ladder under the position-size result (`.t2-ladder`), Paper Trading folded (`.t2-fold`). The calculators themselves are untouched.
- **Membership (part-52 + end of part-36.css "MEMBERSHIP v2"):** big demo / under-development notice (`demo` + `demoSub` copy), plan cards
  with an accent per plan (`--acc`), pointer light (`.mem-spot`), animated edge, check icons, "คุ้มที่สุด" ribbon on Pass; stats no
  longer reset to 0 on repaint; the section is inserted before the footer.
- **Footer + route strip (part-88):** the footer is kept after the last `body > section[data-route]` (some screens appended their section
  after it, so it showed at the top); the old `#v8Bar` "back · page name" strip is hidden (it showed through the see-through top bar).

## Added 2026-11-17 (late night)

- **Board (part-93) v3:** header with a founder card (avatar, shares % / votes %); three tabs — โครงสร้างองค์กร (owner level now built from
  the cap table: founder node with "สิทธิ์ผู้ก่อตั้ง" badge + other shareholders when the founder holds < 100%), **อำนาจผู้ก่อตั้ง**
  (founder-control planner: 100/75/51/50/25/5% or a slider, investor share type = ordinary / preference 10 shares = 1 vote /
  non-voting; rings for shares vs votes, verdict, the four resolution checks, six control tools, a legal note — state in
  localStorage `spz.board.ctrl`), and แผงควบคุมเว็บ. Thai CCC facts used (checked 2026-11-17): ordinary resolution = majority, special
  resolution ≥ 3/4 of votes present, directors removable by the meeting unless the articles/SHA add protection, preference shares
  may carry fewer votes. Shown as general information, not legal advice.
- Admin panel: new Tools button `#cagBtnBoard` ("บอร์ดบริหาร", hidden for editors) → `#/board`.
- Menu special block: the three cards stay full colour for everyone (no grey lock look inside `.np-feat`); one line under the title
  (`.np-feat-lock`, part-93 `featLock()`) says "ล็อกไว้ · เฉพาะแอดมิน Editor และผู้ประเมิน" for visitors. Access is unchanged. The
  board card text is now "โครงสร้างองค์กร · คณะกรรมการ · ฝ่ายงาน".
