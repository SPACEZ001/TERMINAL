#!/usr/bin/env python3
"""
SPACEZ TERMINAL — bubble-risk indicator snapshot builder.

Runs in GitHub Actions on a light daily schedule (these sources update at
most monthly, unlike the 30-minute market snapshot) and writes
data/bubble.json, which the terminal page's "Bubble Radar" route loads.

Free, no-API-key sources only, each independent so one failure never sinks
the file — a source that fails keeps whatever value the previous run wrote,
flagged stale, exactly like fetch_market.py does for a stock:

  · Shiller CAPE ratio         -> Robert Shiller's own public dataset
                                   (moved from Yale to shillerdata.com in 2025)
  · Margin debt                -> FINRA's public margin-statistics workbook
  · Buffett Indicator proxy    -> FRED's public CSV export (no key needed):
                                   nonfinancial corporate equities / US GDP.
                                   FRED discontinued the Wilshire 5000 series
                                   in June 2024 with no replacement, so this
                                   uses the closest free FRED-only stand-in.

The regime signals that were already free (VIX, yield curve, breadth,
credit spread, cyclical-vs-defensive, ...) live in data/market.json already
and are read from there by the page — nothing here duplicates them.
"""

import io
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "bubble.json")

UA = {"User-Agent": "Mozilla/5.0 (compatible; SPACEZ-TERMINAL/1.0; "
                     "+https://spacez001.github.io/TERMINAL/)"}
HISTORY_YEARS = 25   # enough for a meaningful chart without a heavy file


def _get(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def _num(v):
    try:
        v = float(v)
    except (TypeError, ValueError):
        return None
    if v != v or v in (float("inf"), float("-inf")):
        return None
    return v


def _trim_history(rows, years=HISTORY_YEARS):
    """rows: list of (date_str YYYY-MM[-DD], value). Newest last, trimmed."""
    if not rows:
        return rows
    try:
        last_year = int(rows[-1][0][:4])
        cutoff = last_year - years
        rows = [r for r in rows if int(r[0][:4]) >= cutoff]
    except Exception:
        pass
    return rows


# ---------------------------------------------------------------------------
# Shiller CAPE ratio
# ---------------------------------------------------------------------------

def _find_header_row(rows, must_contain):
    """rows: list of lists of cell values (as strings, upper-cased already
    lowered by the caller isn't required here). Returns the first row index
    where every needle in must_contain appears in some cell, scanning only
    the first 20 rows since every source here puts its header near the top.
    """
    for i, row in enumerate(rows[:20]):
        cells = [str(c).strip().lower() for c in row]
        if all(any(needle in c for c in cells) for needle in must_contain):
            return i
    return None


def fetch_cape():
    """Robert Shiller's own dataset (ie_data.xls) - monthly since 1871.

    Shiller moved this dataset off his old Yale faculty page onto
    shillerdata.com at some point in 2025 - the Yale page no longer links
    ie_data.xls at all, which is why this used to fail outright. The new
    page still serves the file from a versioned CDN URL that changes on
    every update, so - same as before - the page is scraped for the
    current link each run rather than hard-coding one that will go stale.
    Parsed with xlrd directly (not through pandas, whose newer releases
    refuse to even load xlrd>=2.0 - which itself dropped legacy .xls
    support, a version trap with no working combination) since the file is
    still the old binary .xls format.
    """
    page = _get("https://shillerdata.com/").decode("utf-8", "ignore")
    m = re.search(r'href="([^"]*ie_data\.xls[^"]*)"', page)
    if not m:
        raise ValueError("could not find ie_data.xls link on shillerdata.com")
    url = m.group(1)
    if url.startswith("//"):
        url = "https:" + url
    elif url.startswith("/"):
        url = "https://shillerdata.com" + url

    import xlrd
    wb = xlrd.open_workbook(file_contents=_get(url))
    sheet = wb.sheet_by_name("Data")
    all_rows = [[sheet.cell_value(r, c) for c in range(sheet.ncols)]
                for r in range(sheet.nrows)]
    hdr = _find_header_row(all_rows, ["date", "cape"])
    if hdr is None:
        raise ValueError("no header row with Date + CAPE columns found")
    headers = [str(c).strip().lower() for c in all_rows[hdr]]
    date_col = headers.index("date")
    cape_cols = [i for i, h in enumerate(headers) if "cape" in h]
    cape_col = cape_cols[0] if cape_cols else None

    rows = []
    for r in all_rows[hdr + 1:]:
        d, v = r[date_col], _num(r[cape_col]) if cape_col is not None else None
        if v is None or not isinstance(d, (int, float)):
            continue
        year = int(d)
        month = int(round((d - year) * 100))
        if not (1 <= month <= 12):
            continue
        rows.append(("%04d-%02d" % (year, month), round(v, 2)))

    sub_hdr = all_rows[hdr + 1] if hdr + 1 < len(all_rows) else []
    combined_headers = [
        (str(headers_raw_v).strip() + " " + str(sub_hdr[i]).strip()).strip()
        for i, headers_raw_v in enumerate(all_rows[hdr])
    ]
    debug = {
        "hdr_row_idx": hdr,
        "headers_raw": all_rows[hdr],
        "sub_hdr_raw": sub_hdr,
        "combined_headers": combined_headers,
        "cape_col_candidates": [(i, headers[i]) for i in cape_cols],
        "cape_col_used": cape_col,
        "date_col_used": date_col,
        "n_rows_parsed": len(rows),
        "last_5_rows": rows[-5:] if rows else [],
        "col12_last5": [[r[5], r[12]] for r in all_rows[-6:-1]] if sheet.ncols > 12 else None,
        "col14_last5": [[r[5], r[14]] for r in all_rows[-6:-1]] if sheet.ncols > 14 else None,
        "col16_last5": [[r[5], r[16]] for r in all_rows[-6:-1]] if sheet.ncols > 16 else None,
        "sheet_nrows": sheet.nrows,
        "sheet_ncols": sheet.ncols,
    }

    if not rows:
        raise ValueError("parsed zero CAPE rows; debug=%r" % (debug,))
    rows.sort()
    rows = _trim_history(rows)
    latest_d, latest_v = rows[-1]
    return {
        "value": latest_v,
        "date": latest_d,
        "history": [{"t": d, "v": v} for d, v in rows],
        "source": "Robert Shiller / Yale (ie_data.xls)",
        "_debug": debug,
    }


# ---------------------------------------------------------------------------
# FINRA margin debt
# ---------------------------------------------------------------------------

def fetch_margin_debt():
    """FINRA's public margin-statistics workbook - monthly since 1997.

    Parsed with openpyxl directly, same reasoning as the CAPE parser: one
    less dependency to version-match, and this file is a modern .xlsx so
    openpyxl reads it natively.
    """
    import openpyxl
    url = "https://www.finra.org/sites/default/files/2021-03/margin-statistics.xlsx"
    wb = openpyxl.load_workbook(io.BytesIO(_get(url)), data_only=True)
    ws = wb.worksheets[0]
    all_rows = [[c for c in row] for row in ws.iter_rows(values_only=True)]
    hdr = _find_header_row(all_rows, ["debit"])
    if hdr is None:
        raise ValueError("no header row with a 'Debit' column found")
    headers = [str(c).strip().lower() if c is not None else "" for c in all_rows[hdr]]
    month_col = 0
    debit_col = next(i for i, h in enumerate(headers) if "debit" in h)

    rows = []
    for r in all_rows[hdr + 1:]:
        if debit_col >= len(r) or month_col >= len(r):
            continue
        v = _num(r[debit_col])
        d = r[month_col]
        if v is None or d is None:
            continue
        dt = None
        if isinstance(d, datetime):
            dt = d
        else:
            ds = str(d).strip()
            for fmt in ("%b-%y", "%B %Y", "%Y-%m", "%m/%Y"):
                try:
                    dt = datetime.strptime(ds, fmt)
                    break
                except ValueError:
                    continue
        if dt is None:
            continue
        rows.append((dt.strftime("%Y-%m"), v))
    if not rows:
        raise ValueError("parsed zero margin-debt rows")
    rows = sorted(set(rows))
    rows = _trim_history(rows)

    latest_d, latest_v = rows[-1]
    yoy = None
    target_year = int(latest_d[:4]) - 1
    for d, v in rows:
        if d == "%d-%s" % (target_year, latest_d[5:]) and v:
            yoy = round((latest_v - v) / v * 100.0, 1)
            break
    return {
        "value_usd_m": round(latest_v, 0),
        "date": latest_d,
        "yoy_pct": yoy,
        "history": [{"t": d, "v": round(v, 0)} for d, v in rows],
        "source": "FINRA margin statistics",
    }


# ---------------------------------------------------------------------------
# Buffett Indicator proxy: Wilshire 5000 (FRED) / US GDP (FRED)
# ---------------------------------------------------------------------------

def _fred_csv(series_id):
    url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=%s" % series_id
    raw = _get(url).decode("utf-8", "ignore")
    rows = []
    for line in raw.splitlines()[1:]:
        parts = line.split(",")
        if len(parts) != 2:
            continue
        d, v = parts[0].strip(), parts[1].strip()
        if v in ("", "."):
            continue
        val = _num(v)
        if val is None:
            continue
        rows.append((d, val))
    return rows


def fetch_buffett():
    """Nonfinancial corporate equities (FRED) / nominal GDP (FRED).

    FRED discontinued the Wilshire 5000 series on 2024-06-03 (announced at
    https://news.research.stlouisfed.org/2024/04/fred-will-remove-wilshire-
    index-data-on-june-3-2024/) and never offered a replacement, so the
    classic "Wilshire 5000 / GDP" Buffett Indicator can't be built from free
    FRED data anymore. NCBEILQ027S - the market value of corporate equities
    issued by nonfinancial corporations, from the Fed's own Financial
    Accounts (Z.1) - is the closest free FRED-only stand-in: checked against
    the old Wilshire-based figure at several known points (2000, 2007,
    2021), it tracks the same shape and a comparable level, so the 0-100%
    risk scale this feeds doesn't need re-tuning.
    """
    ncb = _fred_csv("NCBEILQ027S")   # nonfinancial corp equities, $ millions, quarterly
    if not ncb:
        raise ValueError("could not fetch nonfinancial corporate equities "
                          "(NCBEILQ027S) from FRED")

    gdp = _fred_csv("GDP")   # nominal GDP, $ billions, quarterly
    if not gdp:
        raise ValueError("could not fetch GDP from FRED")

    ncb_by_q = {}
    for d, v in ncb:
        ncb_by_q[d[:7]] = v / 1000.0   # $ millions -> $ billions, same units as GDP

    gdp_by_q = {}
    for d, v in gdp:
        gdp_by_q[d[:7]] = v
    gdp_months = sorted(gdp_by_q)

    def gdp_asof(month):
        best = None
        for gm in gdp_months:
            if gm <= month:
                best = gdp_by_q[gm]
            else:
                break
        return best

    rows = []
    for m in sorted(ncb_by_q):
        g = gdp_asof(m)
        if not g:
            continue
        rows.append((m, round(ncb_by_q[m] / g * 100.0, 1)))
    if not rows:
        raise ValueError("could not align nonfinancial corporate equities with GDP")
    rows = _trim_history(rows)
    latest_d, latest_v = rows[-1]
    return {
        "value_pct": latest_v,
        "date": latest_d,
        "history": [{"t": d, "v": v} for d, v in rows],
        "source": "FRED: Nonfinancial corporate equities (NCBEILQ027S) / GDP",
        "note": "Approximation since FRED discontinued Wilshire 5000 in "
                "2024: nonfinancial-only, so it can run a little below the "
                "classic total-market figure",
    }


def main():
    prev = {}
    if os.path.exists(OUT):
        try:
            with open(OUT, encoding="utf-8") as f:
                prev = json.load(f)
        except Exception:
            prev = {}

    out = {}
    ok = 0
    for key, fn in (("cape", fetch_cape),
                    ("margin_debt", fetch_margin_debt),
                    ("buffett", fetch_buffett)):
        print("[bubble] fetching %s ..." % key)
        try:
            out[key] = fn()
            ok += 1
            print("  ok: %s = %s" % (key, out[key].get("value",
                  out[key].get("value_pct", out[key].get("value_usd_m")))))
        except Exception as e:
            print("  failed %s: %s" % (key, e), file=sys.stderr)
            if key in prev and prev[key]:
                stale = dict(prev[key])
                stale["stale"] = True
                out[key] = stale
                print("  carrying forward previous %s (stale)" % key)

    payload = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        **out,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1, sort_keys=True)
    print("wrote %s — %d/3 indicators fetched fresh this run" % (OUT, ok))

    if not out:
        print("nothing at all could be fetched or carried forward", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
