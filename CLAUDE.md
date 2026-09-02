# SPACEZ TERMINAL — brief for any new Claude session

Read this file first. It is the whole context you need.

## What this is

One self-contained HTML file, ~1.9 MB, bilingual (EN / TH), a financial-education
terminal. Everything the user sees is in **`SPACEZ_TERMINAL.html`**.

- Repo: `github.com/SPACEZ001/TERMINAL` (**public** — never commit an API key)
- Live: https://spacez001.github.io/TERMINAL/SPACEZ_TERMINAL.html (GitHub Pages, `main`)
- Working clone on the user's Mac: `~/mnt/Documents/TERMINAL` in `device_bash`
  (= `/Users/spacez/Documents/TERMINAL` on the Mac). It is a real git clone with
  push access already configured. Work here — do not clone somewhere else.

## The one rule

**Edit `SPACEZ_TERMINAL.html` only.** Do not create new pages, do not touch other
screens in the app, do not restructure anything the user did not ask about.
The user is a beginner and speaks Thai; they use speech-to-text, so read intent
generously and ask when a request is ambiguous.

## How the file is built

- Each screen is a `<style>` + `<script>` IIFE block appended just before `</body>`,
  behind a banner comment like `<!-- ===== SPACEZ WHAT NOW ===== -->`.
  Add new work the same way. Never rewrite the whole file.
- Every string exists in both English and Thai. If you add copy, add both.
- Screens talk to each other through globals: `__SPZ_LIVE`, `__SPZ_REGIME`,
  `__SPZ_STOCK`, `__SPZ_NOW`, `__SPZ_WATCH`, `__SPZ_RANK`, `__SPZ_DIR`,
  `__SPZ_PROOF`, `__SPZ_HERO`, `SPZ_CYCLE`, `__spzAddRoute`.
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

Serve the folder and drive it with Playwright — never `file://`:

    cd ~/mnt/Documents/TERMINAL && python3 -m http.server 8777

Existing suites: `scripts/test_backtest.py`, `scripts/test_charts.py`,
`scripts/test_pipeline_offline.py`. Browser suites live outside the repo; a quick
smoke test in a headless browser is usually enough for a small change.

## Shipping

    cd ~/mnt/Documents/TERMINAL
    git pull --ff-only
    # edit
    git add -A && git commit -m "..." && git push

Then wait for the Pages build and confirm the deployed file matches:

    shasum SPACEZ_TERMINAL.html
    curl -s https://raw.githubusercontent.com/SPACEZ001/TERMINAL/main/SPACEZ_TERMINAL.html | shasum

**Always mask credentials in shell output:** pipe anything that could print the
remote URL through `sed 's/github_pat_[A-Za-z0-9_]*/***/g'`.
