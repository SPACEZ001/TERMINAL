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
- Built by `scripts/fetch_market.py` and `scripts/build_backtest.py`.
- The page fetches them same-origin. Some screens are still hand-typed; each screen
  carries a `.spz-src` badge saying live / mixed / frozen / teach / sim. If you change
  what a screen is built from, change its badge in the `STATUS` map too.

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

**Always mask credentials in shell output:** pipe anything that could print the
remote URL through `sed 's/github_pat_[A-Za-z0-9_]*/***/g'`.
