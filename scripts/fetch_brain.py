#!/usr/bin/env python3
"""Builds data/brain.json -- the slow-moving economy data behind the admin-only
"Market Brain" board (#/brain).

Everything fast (prices, yields from Yahoo, VIX, sectors, stocks) already
lives in data/market.json and is read from there. This file adds what that
snapshot cannot give:

  1. US macro series from FRED's public CSV export (no API key -- the same
     endpoint scripts/fetch_bubble.py already uses): inflation (CPI, core CPI,
     core PCE, 5y breakeven), the Fed (effective funds rate, 2y/10y yields,
     real 10y yield), jobs (unemployment, payrolls, weekly claims, Sahm rule),
     activity (retail sales, industrial production, real GDP, consumer
     sentiment), money and stress (M2, high-yield spread, financial
     conditions, 30y mortgage), oil, and the Fed's own recession-probability
     model. Each is stored as a short history plus derived values (YoY etc).
  2. Weekly closes (2 years) for a fixed list of ETFs the board uses to build
     model portfolios and measure risk -- market.json keeps 1y daily closes
     for single stocks but only summary stats for ETFs.

Each part fails soft: a series that cannot be fetched is simply left out,
and the page shows "no data" for it rather than a made-up number.
"""
import json
import os
import sys
import urllib.request
from datetime import datetime, timezone, date

OUT = os.path.join(os.path.dirname(__file__), "..", "data", "brain.json")
UA = {"User-Agent": "Mozilla/5.0 (compatible; SPACEZ-TERMINAL/1.0; +https://spacez001.github.io/TERMINAL/)"}

# id: (FRED series, en, th, unit, transform)
#   transform: 'lvl' = keep level, 'yoy' = % change vs 12 months earlier,
#              'mom_k' = month-on-month change in thousands (payrolls)
SERIES = {
    "cpi":      ("CPIAUCSL", "CPI inflation", "เงินเฟ้อทั่วไป (CPI)", "%", "yoy"),
    "core_cpi": ("CPILFESL", "Core CPI inflation", "เงินเฟ้อพื้นฐาน (Core CPI)", "%", "yoy"),
    "core_pce": ("PCEPILFE", "Core PCE (the Fed's gauge)", "Core PCE (ตัวที่เฟดใช้)", "%", "yoy"),
    "be5":      ("T5YIE", "5y inflation expectation", "เงินเฟ้อที่ตลาดคาด 5 ปี", "%", "lvl"),
    "ff":       ("DFF", "Fed funds rate", "ดอกเบี้ยนโยบายเฟด", "%", "lvl"),
    "y2":       ("DGS2", "2y Treasury yield", "บอนด์ยีลด์ 2 ปี", "%", "lvl"),
    "y10":      ("DGS10", "10y Treasury yield", "บอนด์ยีลด์ 10 ปี", "%", "lvl"),
    "t10y2y":   ("T10Y2Y", "10y minus 2y", "ส่วนต่าง 10 ปี − 2 ปี", "pt", "lvl"),
    "real10":   ("DFII10", "Real 10y yield", "ยีลด์จริง 10 ปี (หักเงินเฟ้อ)", "%", "lvl"),
    "unrate":   ("UNRATE", "Unemployment rate", "อัตราว่างงาน", "%", "lvl"),
    "payrolls": ("PAYEMS", "New jobs per month", "การจ้างงานเพิ่มต่อเดือน", "k", "mom_k"),
    "claims":   ("ICSA", "Weekly jobless claims", "คนขอรับสวัสดิการว่างงานรายสัปดาห์", "k", "lvl_k"),
    "sahm":     ("SAHMREALTIME", "Sahm recession rule", "สัญญาณถดถอย Sahm", "pt", "lvl"),
    "retail":   ("RSAFS", "Retail sales growth", "ยอดค้าปลีกโต", "%", "yoy"),
    "indpro":   ("INDPRO", "Industrial production growth", "การผลิตภาคอุตสาหกรรมโต", "%", "yoy"),
    "gdp":      ("A191RL1Q225SBEA", "Real GDP growth (annualised)", "GDP จริงโต (ต่อปี)", "%", "lvl"),
    "sent":     ("UMCSENT", "Consumer sentiment", "ความเชื่อมั่นผู้บริโภค", "", "lvl"),
    "m2":       ("M2SL", "Money supply (M2) growth", "ปริมาณเงิน M2 โต", "%", "yoy"),
    "hy":       ("BAMLH0A0HYM2", "High-yield credit spread", "ส่วนต่างดอกเบี้ยหุ้นกู้เสี่ยงสูง", "%", "lvl"),
    "nfci":     ("NFCI", "Financial conditions (Chicago Fed)", "สภาพคล่องการเงิน (Chicago Fed)", "", "lvl"),
    "mort":     ("MORTGAGE30US", "30y mortgage rate", "ดอกเบี้ยบ้าน 30 ปี", "%", "lvl"),
    "oil":      ("DCOILWTICO", "WTI crude oil", "น้ำมันดิบ WTI", "$", "lvl"),
    "recprob":  ("RECPROUSM156N", "Recession probability (model)", "โอกาสเกิดภาวะถดถอย (โมเดล)", "%", "lvl"),
    # added 2026-10-25 for the forecast tab
    "wages":    ("CES0500000003", "Wage growth", "ค่าจ้างเฉลี่ยโต", "%", "yoy"),
    "jolts":    ("JTSJOL", "Job openings", "ตำแหน่งงานว่าง", "m", "lvl_m"),
    "permits":  ("PERMIT", "Building permits", "ใบอนุญาตก่อสร้างบ้าน", "k", "lvl"),
    "mich":     ("MICH", "Consumers' 1y inflation expectation", "เงินเฟ้อที่ผู้บริโภคคาด 1 ปี", "%", "lvl"),
    "exp1y":    ("EXPINF1YR", "1y expected inflation (Cleveland Fed)", "เงินเฟ้อคาด 1 ปี (Cleveland Fed)", "%", "lvl"),
    "t10y3m":   ("T10Y3M", "10y minus 3m", "ส่วนต่าง 10 ปี − 3 เดือน", "pt", "lvl"),
    "y3m":      ("DGS3MO", "3m Treasury bill", "ตั๋วเงินคลัง 3 เดือน", "%", "lvl"),
    "gdpnow":   ("GDPNOW", "GDPNow (Atlanta Fed nowcast)", "GDPNow (ประมาณการสด Atlanta Fed)", "%", "lvl"),
}

# ETFs for model portfolios + risk (weekly closes, 2 years)
ETFS = ["SPY", "QQQ", "IWM", "EFA", "EEM", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "TIP",
        "GLD", "DBC", "USO", "UUP", "THD", "XLK", "XLF", "XLE", "XLV", "XLY", "XLP", "XLI",
        "XLU", "XLB", "XLRE", "XLC", "SMH", "VIG", "USMV"]


def _get(url, timeout=40):
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


def fred(series_id):
    raw = _get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=%s" % series_id).decode("utf-8", "ignore")
    rows = []
    for line in raw.splitlines()[1:]:
        p = line.split(",")
        if len(p) != 2:
            continue
        v = _num(p[1].strip()) if p[1].strip() not in ("", ".") else None
        if v is None:
            continue
        rows.append((p[0].strip(), v))
    return rows


def _d(s):
    return date(int(s[:4]), int(s[5:7]), int(s[8:10]))


def weekly(rows):
    """daily/weekly rows -> last observation per ISO week."""
    out, last_key = [], None
    for t, v in rows:
        y, w, _ = _d(t).isocalendar()
        k = (y, w)
        if k == last_key:
            out[-1] = (t, v)
        else:
            out.append((t, v))
            last_key = k
    return out


def yoy(rows):
    """monthly (or quarterly) index -> % vs the same month a year earlier."""
    by = {t[:7]: v for t, v in rows}
    out = []
    for t, v in rows:
        prev = by.get("%04d-%s" % (int(t[:4]) - 1, t[5:7]))
        if prev:
            out.append((t, round((v / prev - 1) * 100, 2)))
    return out


def build_series(key, spec):
    sid, en, th, unit, tf = spec
    rows = fred(sid)
    if not rows:
        raise ValueError("empty")
    index_tail = [[t, round(v, 3)] for t, v in rows[-30:]] if tf == "yoy" else None
    tail = rows[-30:]
    gap = (_d(tail[-1][0]) - _d(tail[0][0])).days / max(1, len(tail) - 1)
    daily = gap <= 8   # daily or weekly series -> store weekly history
    if tf == "yoy":
        rows = yoy(rows)
    elif tf == "mom_k":
        rows = [(rows[i][0], round(rows[i][1] - rows[i - 1][1], 0)) for i in range(1, len(rows))]
    elif tf == "lvl_m":
        rows = [(t, round(v / 1000.0, 2)) for t, v in rows]
    elif tf == "lvl_k":
        rows = [(t, round(v / 1000.0, 1)) for t, v in rows]
    last = rows[-1]
    # value ~1 month, ~3 months, ~1 year earlier (by date, whatever the frequency)
    ld = _d(last[0])

    def ago(days):
        best = None
        for t, v in rows:
            if (ld - _d(t)).days >= days:
                best = (t, v)
            else:
                break
        return best[1] if best else None

    if daily:
        hist = weekly(rows)
        cutoff = ld.year - 5
    else:
        hist = rows
        cutoff = ld.year - 15
    hist = [(t, v) for t, v in hist if int(t[:4]) >= cutoff]
    rnd = 3 if unit in ("%", "pt", "") else 1
    return {
        "sid": sid, "en": en, "th": th, "unit": unit,
        "freq": "w" if daily else ("q" if sid.startswith("A191") else "m"),
        "t": last[0], "v": round(last[1], rnd),
        "m1": ago(28), "m3": ago(88), "y1": ago(360),
        "hist": [[t, round(v, rnd)] for t, v in hist],
        **({"idx": index_tail} if index_tail else {}),
    }


def fetch_macro():
    out, errs = {}, []
    for k, spec in SERIES.items():
        try:
            out[k] = build_series(k, spec)
        except Exception as e:  # noqa: BLE001 -- fail soft per series
            errs.append("%s:%s" % (k, type(e).__name__))
    return out, errs


def fetch_recessions():
    """NBER recession months (USREC) as [start, end] pairs since 1990."""
    rows = fred("USREC")
    out, start, prev = [], None, None
    for t, v in rows:
        if t < "1990":
            continue
        if v >= 1 and start is None:
            start = t
        if v < 1 and start is not None:
            out.append([start, prev])
            start = None
        prev = t
    if start:
        out.append([start, prev])
    return out


def fetch_etfs():
    """weekly closes for the model-portfolio ETFs (yfinance)."""
    try:
        import yfinance as yf
    except Exception:
        return {}, ["yfinance missing"]
    out, errs = {}, []
    try:
        df = yf.download(ETFS, period="2y", interval="1wk", auto_adjust=True, progress=False, threads=True)
        closes = df["Close"] if "Close" in df else df
    except Exception as e:  # noqa: BLE001
        return {}, ["download:%s" % type(e).__name__]
    for s in ETFS:
        try:
            col = closes[s].dropna()
            if len(col) < 40:
                errs.append(s)
                continue
            out[s] = {"t": [d.strftime("%Y-%m-%d") for d in col.index],
                      "c": [round(float(v), 4) for v in col.values]}
        except Exception:  # noqa: BLE001
            errs.append(s)
    return out, errs


def main():
    prev = {}
    try:
        with open(OUT, encoding="utf-8") as f:
            prev = json.load(f)
    except Exception:
        pass
    macro, merr = fetch_macro()
    etfs, eerr = fetch_etfs()
    try:
        recs = fetch_recessions()
    except Exception:  # noqa: BLE001
        recs = prev.get("recessions") or []
    # keep the last good copy of anything that failed this run
    for k, v in (prev.get("macro") or {}).items():
        macro.setdefault(k, v)
    if not etfs and prev.get("etf"):
        etfs = prev["etf"]
    if len(macro) < 8:
        print("too few macro series fetched (%d) -- not writing" % len(macro), file=sys.stderr)
        sys.exit(1)
    doc = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {
            "macro": "FRED, Federal Reserve Bank of St. Louis (public CSV export)",
            "etf": "yahoo finance (yfinance), weekly closes, dividends adjusted",
        },
        "macro": macro,
        "etf": etfs,
        "recessions": recs,
        "errors": merr + eerr,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    print("brain.json: %d macro series, %d etfs, errors=%s" % (len(macro), len(etfs), doc["errors"]))


if __name__ == "__main__":
    main()
