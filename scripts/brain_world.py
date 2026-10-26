#!/usr/bin/env python3
"""Global economic outlook for the Market Brain's "World outlook" tab (#/brain),
added 2026-10-26. Called from scripts/fetch_brain_ext.py -> block "world".

Keyless public sources only:
  IMF DataMapper (World Economic Outlook)  GDP growth, inflation, unemployment,
                                           government debt -- history + forecasts
  OECD Composite Leading Indicators (CLI)  monthly, ~6-9 months ahead of the
                                           business cycle; 100 = long-run trend
  BIS                                      central-bank policy rates, CPI y/y
  Yahoo Finance (yfinance)                 copper (HG=F) and gold (GC=F) for the
                                           copper/gold ratio, a market gauge of
                                           global growth

Rules (no AI), all shown on the page:
  * cycle phase per country from its CLI (OECD convention):
      >100 and rising = expansion, >100 and falling = downturn,
      <100 and falling = slowdown, <100 and rising = recovery
  * global growth momentum = G20 CLI 6-month change + share of countries whose
    CLI is rising + copper/gold ratio trend
  * global inflation momentum = median 6-month change of CPI y/y + share of
    countries where inflation is rising
  * global easing = central banks that cut minus those that hiked (6 months)
  * country score = next-year IMF growth vs its own 10-year average + CLI level
    and direction + policy easing + inflation cooling   (the page adds market
    momentum from the country ETFs in market.json)
"""
import csv
import io
import json
import math
from datetime import date

# code: (IMF, OECD CLI, BIS, name en, name th, region, tile x, tile y, ETF)
COUNTRIES = [
    ("CAN", "CAN", "CA", "Canada", "แคนาดา", "am", 1, 0, "EWC"),
    ("GBR", "GBR", "GB", "UK", "อังกฤษ", "eu", 4, 0, "EWU"),
    ("DEU", "DEU", "DE", "Germany", "เยอรมนี", "eu", 5, 0, "EWG"),
    ("KOR", "KOR", "KR", "South Korea", "เกาหลีใต้", "as", 9, 0, "EWY"),
    ("JPN", "JPN", "JP", "Japan", "ญี่ปุ่น", "as", 10, 0, "EWJ"),
    ("USA", "USA", "US", "United States", "สหรัฐฯ", "am", 1, 1, "SPY"),
    ("FRA", "FRA", "FR", "France", "ฝรั่งเศส", "eu", 4, 1, "EWQ"),
    ("ITA", "ITA", "IT", "Italy", "อิตาลี", "eu", 5, 1, "EWI"),
    ("TUR", "TUR", "TR", "Türkiye", "ตุรกี", "eu", 6, 1, "TUR"),
    ("CHN", "CHN", "CN", "China", "จีน", "as", 8, 1, "MCHI"),
    ("MEX", "MEX", "MX", "Mexico", "เม็กซิโก", "am", 1, 2, "EWW"),
    ("ESP", "ESP", "ES", "Spain", "สเปน", "eu", 4, 2, "EWP"),
    ("IND", "IND", "IN", "India", "อินเดีย", "as", 7, 2, "INDA"),
    ("THA", None, "TH", "Thailand", "ไทย", "as", 8, 2, "THD"),
    ("VNM", None, "VN", "Vietnam", "เวียดนาม", "as", 9, 2, "VNM"),
    ("BRA", "BRA", "BR", "Brazil", "บราซิล", "am", 2, 3, "EWZ"),
    ("ZAF", "ZAF", "ZA", "South Africa", "แอฟริกาใต้", "af", 5, 3, "EZA"),
    ("IDN", "IDN", "ID", "Indonesia", "อินโดนีเซีย", "as", 9, 3, "EIDO"),
    ("AUS", "AUS", "AU", "Australia", "ออสเตรเลีย", "as", 10, 3, "EWA"),
]
GROUPS = [("WEOWORLD", "World", "โลก"), ("ADVEC", "Advanced economies", "ประเทศพัฒนาแล้ว"),
          ("OEMDC", "Emerging & developing", "ตลาดเกิดใหม่และกำลังพัฒนา"), ("EURO", "Euro area", "ยูโรโซน")]


def _num(v):
    try:
        v = float(v)
    except (TypeError, ValueError):
        return None
    return None if v != v else v


def _r(v, n=2):
    return None if v is None else round(v, n)


def _mean(a):
    a = [x for x in a if x is not None]
    return sum(a) / len(a) if a else None


def _median(a):
    a = sorted(x for x in a if x is not None)
    if not a:
        return None
    m = len(a) // 2
    return a[m] if len(a) % 2 else (a[m - 1] + a[m]) / 2


def madd(k, n):
    y, m = int(k[:4]), int(k[5:7]) - 1 + n
    return "%04d-%02d" % (y + m // 12, m % 12 + 1)


def imf_all(get, ind):
    j = json.loads(get("https://www.imf.org/external/datamapper/api/v1/%s" % ind).decode("utf-8"))
    return (j.get("values") or {}).get(ind, {})


def oecd_cli(get, start):
    url = ("https://sdmx.oecd.org/public/rest/data/OECD.SDD.STES,DSD_STES@DF_CLI,4.1/.M.LI...AA...H"
           "?startPeriod=%s&dimensionAtObservation=AllDimensions&format=csvfilewithlabels" % start)
    raw = get(url, timeout=90).decode("utf-8", "ignore")
    out = {}
    for r in csv.DictReader(io.StringIO(raw)):
        v = _num(r.get("OBS_VALUE"))
        if v is not None:
            out.setdefault(r["REF_AREA"], {})[r["TIME_PERIOD"]] = v
    return out


def bis_series(get, flow, keys, start):
    url = "https://stats.bis.org/api/v2/data/dataflow/BIS/%s/1.0/%s?format=csv&startPeriod=%s" % (flow, keys, start)
    raw = get(url, timeout=90).decode("utf-8", "ignore")
    out = {}
    for r in csv.DictReader(io.StringIO(raw)):
        v = _num(r.get("OBS_VALUE"))
        if v is not None:
            out.setdefault(r["REF_AREA"], {})[r["TIME_PERIOD"][:7]] = v
    return out


def weekly_close(sym, years=10):
    import yfinance as yf
    df = yf.download(sym, period="%dy" % years, interval="1wk", progress=False, auto_adjust=False)
    col = df["Close"]
    if hasattr(col, "columns"):
        col = col.iloc[:, 0]
    col = col.dropna()
    return [(i.strftime("%Y-%m-%d"), float(v)) for i, v in zip(col.index, col.values) if float(v) > 0]


def phase_of(level, chg):
    if level is None or chg is None:
        return None
    if level >= 100:
        return "expansion" if chg >= 0 else "downturn"
    return "recovery" if chg >= 0 else "slowdown"


def build_world(get, fred):
    errs = []
    today = date.today()
    yr = today.year
    out = {"year": yr}
    # ---- IMF
    imf = {}
    for ind in ("NGDP_RPCH", "PCPIPCH", "LUR", "GGXWDG_NGDP"):
        try:
            imf[ind] = imf_all(get, ind)
        except Exception as e:  # noqa: BLE001
            errs.append("imf_%s:%s" % (ind, type(e).__name__))
    def iv(ind, code, y):
        return _num(((imf.get(ind) or {}).get(code) or {}).get(str(y)))
    # ---- OECD CLI
    cli = {}
    try:
        cli = oecd_cli(get, "%d-01" % (yr - 11))
    except Exception as e:  # noqa: BLE001
        errs.append("cli:%s" % type(e).__name__)
    # ---- BIS policy rates + CPI
    bis_codes = "+".join(c[2] for c in COUNTRIES) + "+XM"
    pol, cpi = {}, {}
    try:
        pol = bis_series(get, "WS_CBPOL", "M." + bis_codes, "%d-01" % (yr - 11))
    except Exception as e:  # noqa: BLE001
        errs.append("bis_pol:%s" % type(e).__name__)
    try:
        cpi = bis_series(get, "WS_LONG_CPI", "M." + bis_codes + ".771", "%d-01" % (yr - 11))
    except Exception as e:  # noqa: BLE001
        errs.append("bis_cpi:%s" % type(e).__name__)

    def last(d):
        if not d:
            return None, None
        k = max(d)
        return k, d[k]

    def ago(d, k, n):
        return d.get(madd(k, -n)) if d and k else None

    # ---- per country
    rows = []
    for code, ccli, cbis, en, th, reg, x, y, etf in COUNTRIES:
        r = {"c": code, "en": en, "th": th, "reg": reg, "x": x, "y": y, "etf": etf}
        r["gdp"] = {str(y_): _r(iv("NGDP_RPCH", code, y_), 1) for y_ in range(yr - 2, yr + 3)}
        r["infl"] = {str(y_): _r(iv("PCPIPCH", code, y_), 1) for y_ in range(yr - 2, yr + 3)}
        r["un"] = _r(iv("LUR", code, yr), 1)
        r["debt"] = _r(iv("GGXWDG_NGDP", code, yr), 0)
        hist10 = [iv("NGDP_RPCH", code, y_) for y_ in range(yr - 11, yr - 1) if y_ not in (2020, 2021)]
        r["gdp_avg"] = _r(_mean(hist10), 1)
        c = cli.get(ccli) if ccli else None
        if c:
            k, v = last(c)
            v6 = ago(c, k, 6)
            v1 = ago(c, k, 1)
            r["cli"] = {"t": k, "v": _r(v, 2), "c1": _r(v - v1, 2) if v1 else None, "c6": _r(v - v6, 2) if v6 else None,
                        "hist": [[kk, _r(c[kk], 2)] for kk in sorted(c) if kk >= "%d-01" % (yr - 6)]}
            r["phase"] = phase_of(v, (v - v1) if v1 else None)
        p = pol.get(cbis) or (pol.get("XM") if cbis in ("DE", "FR", "IT", "ES") else None)   # euro members use the ECB rate
        if p:
            k, v = last(p)
            r["rate"] = {"t": k, "v": _r(v, 2), "c6": _r(v - ago(p, k, 6), 2) if ago(p, k, 6) is not None else None,
                         "c12": _r(v - ago(p, k, 12), 2) if ago(p, k, 12) is not None else None}
        q = cpi.get(cbis)
        if q:
            k, v = last(q)
            r["cpi"] = {"t": k, "v": _r(v, 2), "c6": _r(v - ago(q, k, 6), 2) if ago(q, k, 6) is not None else None}
        # score (the page adds market momentum)
        s = 0.0
        parts = {}
        g1 = r["gdp"].get(str(yr + 1))
        if g1 is not None and r["gdp_avg"] is not None:
            parts["growth"] = max(-2, min(2, (g1 - r["gdp_avg"]) / 1.0))
        if r.get("cli"):
            parts["cli"] = max(-2, min(2, (r["cli"]["v"] - 100) / 1.0 + (r["cli"]["c6"] or 0) / 0.8))
        if r.get("rate") and r["rate"]["c6"] is not None:
            parts["easing"] = max(-2, min(2, -r["rate"]["c6"] / 0.5))
        if r.get("cpi") and r["cpi"]["c6"] is not None:
            parts["cooling"] = max(-2, min(2, -r["cpi"]["c6"] / 1.0))
        W = {"growth": 0.35, "cli": 0.35, "easing": 0.15, "cooling": 0.15}
        ws = sum(W[k_] for k_ in parts)
        s = sum(W[k_] * v_ for k_, v_ in parts.items()) / ws if ws else 0
        r["parts"] = {k_: _r(v_, 2) for k_, v_ in parts.items()}
        r["score"] = _r(s, 2)
        rows.append(r)
    out["countries"] = rows
    # ---- groups (IMF paths)
    out["groups"] = [{"c": c, "en": en, "th": th,
                      "gdp": [[y_, _r(iv("NGDP_RPCH", c, y_), 2)] for y_ in range(yr - 12, yr + 5) if iv("NGDP_RPCH", c, y_) is not None],
                      "infl": [[y_, _r(iv("PCPIPCH", c, y_), 2)] for y_ in range(yr - 12, yr + 5) if iv("PCPIPCH", c, y_) is not None]}
                     for c, en, th in GROUPS]
    # ---- global CLI aggregates + breadth history
    for key in ("G20", "G7", "A5M", "G4E"):
        if cli.get(key):
            out["cli_" + key] = [[k, _r(v, 2)] for k, v in sorted(cli[key].items())]
    ccodes = [c[1] for c in COUNTRIES if c[1] and cli.get(c[1])]
    months = sorted(set(k for cc in ccodes for k in cli[cc]))
    br = []
    for k in months:
        rising = [1 if cli[cc].get(k) is not None and cli[cc].get(madd(k, -1)) is not None and cli[cc][k] >= cli[cc][madd(k, -1)] else 0
                  for cc in ccodes if cli[cc].get(k) is not None and cli[cc].get(madd(k, -1)) is not None]
        above = [1 if cli[cc][k] >= 100 else 0 for cc in ccodes if cli[cc].get(k) is not None]
        if len(rising) >= 8:
            br.append([k, _r(sum(rising) / len(rising) * 100, 0), _r(sum(above) / len(above) * 100, 0)])
    out["cli_breadth"] = br
    # ---- global easing breadth (cuts minus hikes in 6 months) and inflation breadth
    pcodes = [c for c in pol if c != "XM"] + (["XM"] if "XM" in pol else [])
    eb = []
    allm = sorted(set(k for cc in pol for k in pol[cc]))
    for k in allm:
        if k < "%d-01" % (yr - 9):
            continue
        cuts = hikes = n = 0
        for cc in pcodes:
            a, b = pol[cc].get(k), pol[cc].get(madd(k, -6))
            if a is None or b is None:
                continue
            n += 1
            cuts += a < b - 0.01
            hikes += a > b + 0.01
        if n >= 8:
            eb.append([k, cuts, hikes, n])
    out["easing"] = eb
    ib = []
    allc = sorted(set(k for cc in cpi for k in cpi[cc]))
    for k in allc:
        if k < "%d-01" % (yr - 9):
            continue
        vals, ups = [], 0
        for cc in cpi:
            a, b = cpi[cc].get(k), cpi[cc].get(madd(k, -6))
            if a is None or b is None:
                continue
            vals.append(a)
            ups += a > b
        if len(vals) >= 8:
            ib.append([k, _r(_median(vals), 2), _r(ups / len(vals) * 100, 0), len(vals)])
    out["infl_breadth"] = ib
    # ---- copper / gold
    try:
        cu = weekly_close("HG=F", 10)
        au = dict(weekly_close("GC=F", 10))
        cg = [[t, _r(v / au[t] * 1000, 3)] for t, v in cu if t in au]
        out["cu"] = [[t, _r(v, 3)] for t, v in cu]
        out["cugold"] = cg
    except Exception as e:  # noqa: BLE001
        errs.append("copper:%s" % type(e).__name__)
    # ---- global summary numbers
    g20 = cli.get("G20") or {}
    k, v = last(g20)
    s = {}
    if k:
        s["g20"] = {"t": k, "v": _r(v, 2), "c1": _r(v - ago(g20, k, 1), 2) if ago(g20, k, 1) else None, "c6": _r(v - ago(g20, k, 6), 2) if ago(g20, k, 6) else None}
        s["phase"] = phase_of(v, v - ago(g20, k, 1) if ago(g20, k, 1) else None)
    if br:
        s["rising_share"] = br[-1][1]
        s["above_share"] = br[-1][2]
    if eb:
        s["cuts"], s["hikes"], s["n_cb"] = eb[-1][1], eb[-1][2], eb[-1][3]
    if ib:
        s["cpi_median"], s["cpi_rising"] = ib[-1][1], ib[-1][2]
        s["cpi_median_6m"] = _r(ib[-1][1] - ib[-7][1], 2) if len(ib) > 7 else None
    if out.get("cugold") and len(out["cugold"]) > 27:
        a, b = out["cugold"][-1][1], out["cugold"][-27][1]
        s["cugold_6m"] = _r((a / b - 1) * 100, 1)
    gw = lambda y_: iv("NGDP_RPCH", "WEOWORLD", y_)
    s["world_gdp"] = {str(y_): _r(gw(y_), 1) for y_ in range(yr - 1, yr + 3)}
    s["world_infl"] = {str(y_): _r(iv("PCPIPCH", "WEOWORLD", y_), 1) for y_ in range(yr - 1, yr + 3)}
    # momentum scores (-1..1) for the global clock
    gm = []
    if s.get("g20", {}).get("c6") is not None:
        gm.append(max(-1, min(1, s["g20"]["c6"] / 1.0)))
    if s.get("rising_share") is not None:
        gm.append((s["rising_share"] - 50) / 50)
    if s.get("cugold_6m") is not None:
        gm.append(max(-1, min(1, s["cugold_6m"] / 15)))
    im = []
    if s.get("cpi_median_6m") is not None:
        im.append(max(-1, min(1, s["cpi_median_6m"] / 1.0)))
    if s.get("cpi_rising") is not None:
        im.append((s["cpi_rising"] - 50) / 50)
    s["gmom"] = _r(_mean(gm), 2) if gm else 0
    s["imom"] = _r(_mean(im), 2) if im else 0
    out["summary"] = s
    out["errors"] = errs
    if not rows or (not cli and not imf):
        raise ValueError("no world data: %s" % errs)
    return out


# =============================================================== playbook
# History of the global clock since 2000 and what happened afterwards, so the
# page can say "the last N times the world looked like this, X happened".
#   * monthly growth / inflation momentum rebuilt with the same formulas as
#     the live summary above (G20 CLI 6M change, share of CLIs rising,
#     copper/gold 6M; median CPI 6M change, share of CPIs rising)
#   * one month publication lag: a phase seen for month k is acted on at the
#     end of month k+1, forward returns are measured from there
#   * per phase: forward 6-month return of sector / asset ETFs vs SPY, and of
#     every stock in market.json vs its benchmark (SPY for US, equal-weight of
#     the Thai list for Thai stocks), with hit rate and sample size
#   * per month (for the page's scenario calculator): momentum, Fed 6M change,
#     what the phase was 6 / 12 months later, US recession within 12 months
#     (FRED USREC), S&P 500 12-month return and worst drop, asset excess returns
PB_ASSETS = ["SPY", "QQQ", "IWM", "XLK", "XLF", "XLE", "XLV", "XLI", "XLB", "XLU", "XLP", "XLY", "XLC", "XLRE",
             "GLD", "TLT", "SHY", "EEM", "EFA", "THD", "DBC"]
PH_CODES = ["recovery", "overheat", "stagflation", "reflation"]
PB_VERSION = 2


def _ph(gm, im):
    if gm is None or im is None:
        return None
    return (1 if im >= 0 else 0) if gm >= 0 else (2 if im >= 0 else 3)


def _clip(v, a=-1.0, b=1.0):
    return max(a, min(b, v))


def monthly_closes(syms, start="1999-01-01"):
    import yfinance as yf
    out = {}
    for i in range(0, len(syms), 120):
        chunk = syms[i:i + 120]
        df = yf.download(chunk, start=start, interval="1mo", auto_adjust=True, progress=False, threads=True)
        c = df["Close"]
        if not hasattr(c, "columns"):
            c = c.to_frame(chunk[0])
        for col in c.columns:
            s = c[col].dropna()
            d = {}
            for ix, v in zip(s.index, s.values):
                if float(v) > 0:
                    d[ix.strftime("%Y-%m")] = float(v)      # later rows of the same month overwrite earlier ones
            if len(d) >= 24:
                out[str(col)] = d
    return out


def build_playbook(get, fred, prev=None, market_path=None):
    import os
    from datetime import datetime, timezone
    if prev and prev.get("v") == PB_VERSION and prev.get("gen"):
        try:
            age = (datetime.now(timezone.utc) - datetime.strptime(prev["gen"], "%Y-%m-%dT%H:%MZ").replace(tzinfo=timezone.utc)).days
            if age < 3:
                return prev
        except Exception:  # noqa: BLE001
            pass
    errs = []
    yr = date.today().year
    cli = oecd_cli(get, "1998-01")
    bis_codes = "+".join(c[2] for c in COUNTRIES)
    cpi = bis_series(get, "WS_LONG_CPI", "M." + bis_codes + ".771", "1998-01")
    ccodes = [c[1] for c in COUNTRIES if c[1] and cli.get(c[1])]
    g20 = cli.get("G20") or {}
    # market data
    mp = market_path or os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "market.json")
    stocks = {}
    try:
        with open(mp, encoding="utf-8") as f:
            stocks = json.load(f).get("stocks") or {}
    except Exception as e:  # noqa: BLE001
        errs.append("market:%s" % type(e).__name__)
    uni = {t: (s.get("yahoo") or t, s.get("cal"), s.get("sector")) for t, s in stocks.items() if s.get("cal") in ("us", "th")}
    syms = PB_ASSETS + ["HG=F", "GC=F"] + sorted(set(v[0] for v in uni.values()))
    px = monthly_closes(syms)
    cu, au = px.get("HG=F", {}), px.get("GC=F", {})
    # months
    months = [k for k in sorted(g20) if k >= "2000-01"]
    usrec = {d[:7]: v for d, v in fred("USREC")}
    ff = {d[:7]: v for d, v in fred("FEDFUNDS")}
    hist = []
    for k in months:
        k1, k6 = madd(k, -1), madd(k, -6)
        gm = []
        if g20.get(k) is not None and g20.get(k6) is not None:
            gm.append(_clip(g20[k] - g20[k6]))
        rs = [1 if cli[cc][k] >= cli[cc][k1] else 0 for cc in ccodes if cli[cc].get(k) is not None and cli[cc].get(k1) is not None]
        if len(rs) >= 8:
            gm.append((sum(rs) / len(rs) * 100 - 50) / 50)
        if cu.get(k) and au.get(k) and cu.get(k6) and au.get(k6):
            gm.append(_clip(((cu[k] / au[k]) / (cu[k6] / au[k6]) - 1) * 100 / 15))
        now = [cpi[cc][k] for cc in cpi if cpi[cc].get(k) is not None and cpi[cc].get(k6) is not None]
        was = [cpi[cc][k6] for cc in cpi if cpi[cc].get(k) is not None and cpi[cc].get(k6) is not None]
        im = []
        if len(now) >= 8:
            im.append(_clip(_median(now) - _median(was)))
            im.append((sum(1 for a, b in zip(now, was) if a > b) / len(now) * 100 - 50) / 50)
        if not gm or not im:
            continue
        g, i = _mean(gm), _mean(im)
        fd = ff.get(k) - ff.get(k6) if ff.get(k) is not None and ff.get(k6) is not None else None
        hist.append({"k": k, "g": g, "i": i, "fed": fd, "ph": _ph(g, i)})
    idx = {h["k"]: n for n, h in enumerate(hist)}

    def fwd(d, k, n, lag=1):
        a, b = d.get(madd(k, lag)), d.get(madd(k, lag + n))
        return (b / a - 1) * 100 if a and b else None

    # Thai benchmark: equal-weight monthly return of the Thai list
    th_syms = [v[0] for v in uni.values() if v[1] == "th" and v[0] in px]
    allm = sorted(set(m for s_ in th_syms for m in px[s_]))
    th_idx, lvl = {}, 100.0
    for j, m in enumerate(allm):
        if j:
            rr = [px[s_][m] / px[s_][allm[j - 1]] - 1 for s_ in th_syms if px[s_].get(m) and px[s_].get(allm[j - 1])]
            if len(rr) >= 5:
                lvl *= 1 + _mean(rr)
        th_idx[m] = lvl
    spy = px.get("SPY", {})
    rows = []
    for h in hist:
        k = h["k"]
        r = [k, _r(h["g"], 3), _r(h["i"], 3), _r(h["fed"], 2), h["ph"]]
        j6, j12 = idx.get(madd(k, 6)), idx.get(madd(k, 12))
        r.append(hist[j6]["ph"] if j6 is not None else None)
        r.append(hist[j12]["ph"] if j12 is not None else None)
        recs = [usrec.get(madd(k, n)) for n in range(1, 13)]
        r.append(None if any(v is None for v in recs) else (1 if any(recs) else 0))
        s12 = fwd(spy, k, 12)
        r.append(_r(s12, 1))
        # worst drop of SPY within the 12 months after the lag (month-end prices)
        a = spy.get(madd(k, 1))
        path = [spy.get(madd(k, 1 + n)) for n in range(1, 13)]
        r.append(_r((min(path) / a - 1) * 100, 1) if a and all(path) else None)
        s6 = fwd(spy, k, 6)
        for sym in PB_ASSETS:
            v = fwd(px.get(sym, {}), k, 6)
            r.append(_r(v if sym == "SPY" else (v - s6 if v is not None and s6 is not None else None), 1))
        rows.append(r)
    # per-phase stats for assets and stocks
    def stats(vals):
        vals = [v for v in vals if v is not None]
        if len(vals) < 6:
            return None
        return [_r(_mean(vals), 2), _r(sum(1 for v in vals if v > 0) / len(vals) * 100, 0), len(vals)]
    ast = {}
    for j, sym in enumerate(PB_ASSETS):
        col = 10 + j
        ast[sym] = {"all": stats([r[col] for r in rows]), "ph": [stats([r[col] for r in rows if r[4] == p]) for p in range(4)]}
    stk = {}
    for t, (ys, cal, sec) in uni.items():
        d = px.get(ys)
        if not d:
            continue
        bench = spy if cal == "us" else th_idx
        ex = []
        for h in hist:
            a, b = fwd(d, h["k"], 6), fwd(bench, h["k"], 6)
            ex.append((h["ph"], a - b if a is not None and b is not None else None))
        al = stats([v for _, v in ex])
        if not al:
            continue
        stk[t] = [al] + [stats([v for p, v in ex if p == q]) for q in range(4)]
    # current: the month after the last complete one is not known yet, so the
    # last history row is "now" in the same units
    last = hist[-1] if hist else {}
    return {"v": PB_VERSION, "gen": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ"),
            "assets": PB_ASSETS, "cols": ["k", "g", "i", "fed", "ph", "ph6", "ph12", "rec12", "spx12", "dd12"] + ["x_" + a for a in PB_ASSETS],
            "rows": rows, "ast": ast, "stk": stk, "now": {"k": last.get("k"), "g": _r(last.get("g"), 3), "i": _r(last.get("i"), 3), "fed": _r(last.get("fed"), 2)},
            "fed_now": _r(ff[max(ff)], 2) if ff else None, "first": hist[0]["k"] if hist else None, "errors": errs}
