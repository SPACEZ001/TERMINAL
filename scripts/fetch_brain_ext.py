#!/usr/bin/env python3
"""Builds data/brain_ext.json -- the long-history half of the admin-only
Market Brain board (#/brain), added 2026-10-26. Everything here is computed
from public, keyless sources and written as plain numbers; the page only
draws them.

  track    "How often has the brain been right?"  The board's forecast rules
           (the same formulas as assets/js/part-83.js -> forecast()) re-run
           month by month on the data that was available at the time, then
           compared with what actually happened 3 / 6 / 12 months later --
           against a "nothing changes" guess as the bar to beat.
  analog   "Which past months looked most like today?"  Nearest neighbours
           since 1960 on inflation, jobs, the Fed rate, the yield curve and
           oil, and what stocks / bonds / cash / jobs did in the next year.
  alerts   Warning rules (curve inversion, Sahm rule, claims, credit, oil,
           the Fed's first cut / hike ...) evaluated over decades: every time
           each fired, what followed, and how close each one is today.
  liq      Fed liquidity: balance sheet - Treasury account - reverse repo,
           weekly, against the S&P 500.
  thai     Thailand: Bank of Thailand policy rate and CPI (BIS), the baht
           (FRED), IMF forecasts for growth / inflation / jobs / debt.
  events   How much markets move on CPI, jobs-report and Fed days, and the
           next date of each.
  world    Global outlook: IMF forecasts, OECD leading indicators, central-bank
           rates and CPI (BIS), copper/gold (scripts/brain_world.py).
  px       Gold and bitcoin price forecasts, trend read, levels, walk-forward
           test (scripts/brain_px.py, added 2026-10-26).

Sources: FRED (fredgraph.csv), BIS SDMX API, IMF DataMapper API,
federalreserve.gov FOMC calendars, BLS release archive (when reachable),
Yahoo Finance (^GSPC daily since 1950, via yfinance).

Every block fails soft: if a source cannot be reached the previous copy of
that block (from the existing file) is kept, so one outage never blanks a
screen.
"""
import csv
import io
import json
import math
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timedelta, timezone

OUT = os.path.join(os.path.dirname(__file__), "..", "data", "brain_ext.json")
UA = {"User-Agent": "Mozilla/5.0 (compatible; SPACEZ-TERMINAL/1.0; +https://spacez001.github.io/TERMINAL/)"}
BLS_UA = {"User-Agent": "SPACEZ-TERMINAL research (+https://spacez001.github.io/TERMINAL/)", "Accept": "text/html", "Accept-Language": "en-US,en;q=0.9"}
TODAY = date.today()


# ----------------------------------------------------------------- helpers
def _get(url, timeout=45, headers=None):
    req = urllib.request.Request(url, headers=headers or UA)
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


_FRED = {}


def fred(sid):
    if sid in _FRED:
        return _FRED[sid]
    raw = _get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=%s" % sid).decode("utf-8", "ignore")
    rows = []
    for line in raw.splitlines()[1:]:
        p = line.split(",")
        if len(p) != 2:
            continue
        v = _num(p[1].strip()) if p[1].strip() not in ("", ".") else None
        if v is not None:
            rows.append((p[0].strip(), v))
    if not rows:
        raise ValueError("empty " + sid)
    _FRED[sid] = rows
    return rows


def d_(s):
    return date(int(s[:4]), int(s[5:7]), int(s[8:10]) if len(s) >= 10 else 1)


def mkey(d):
    return "%04d-%02d" % (d.year, d.month)


def madd(k, n):
    y, m = int(k[:4]), int(k[5:7]) - 1 + n
    return "%04d-%02d" % (y + m // 12, m % 12 + 1)


def mdiff(a, b):
    """months from b to a"""
    return (int(a[:4]) - int(b[:4])) * 12 + int(a[5:7]) - int(b[5:7])


def monthly(rows, how="last"):
    """daily / weekly rows -> {YYYY-MM: value} (last obs or mean in month)."""
    acc = {}
    for t, v in rows:
        k = t[:7]
        if how == "last":
            acc[k] = v
        else:
            s = acc.setdefault(k, [0.0, 0])
            s[0] += v
            s[1] += 1
    if how == "mean":
        acc = {k: s[0] / s[1] for k, s in acc.items()}
    return acc


def fill(M):
    """fill missing months (e.g. the Oct-2025 shutdown, when some data was
    never published) by straight-line interpolation between neighbours."""
    if not M:
        return M
    ks = sorted(M)
    out = dict(M)
    for a, b in zip(ks, ks[1:]):
        gap = mdiff(b, a)
        for i in range(1, gap):
            out[madd(a, i)] = M[a] + (M[b] - M[a]) * i / gap
    return out


def weekly(rows):
    out, last = [], None
    for t, v in rows:
        y, w, _ = d_(t).isocalendar()
        if (y, w) == last:
            out[-1] = (t, v)
        else:
            out.append((t, v))
            last = (y, w)
    return out


def yoy_m(M):
    return {k: (v / M[madd(k, -12)] - 1) * 100 for k, v in M.items() if M.get(madd(k, -12))}


def mean(a):
    a = [x for x in a if x is not None]
    return sum(a) / len(a) if a else None


def std(a):
    a = [x for x in a if x is not None]
    if len(a) < 3:
        return None
    m = sum(a) / len(a)
    return math.sqrt(sum((x - m) ** 2 for x in a) / (len(a) - 1))


def clamp(v, a, b):
    return max(a, min(b, v))


def r(v, n=2):
    return None if v is None else round(v, n)


def Phi(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def sp500_daily():
    """S&P 500 daily closes since 1950 (yfinance), FRED SP500 (10y) as fallback."""
    try:
        import yfinance as yf
        df = yf.download("^GSPC", start="1950-01-01", interval="1d", progress=False, auto_adjust=False)
        col = df["Close"]
        if hasattr(col, "columns"):
            col = col.iloc[:, 0]
        col = col.dropna()
        rows = [(i.strftime("%Y-%m-%d"), float(v)) for i, v in zip(col.index, col.values)]
        if len(rows) > 5000:
            return rows
    except Exception:  # noqa: BLE001
        pass
    return fred("SP500")


# ============================================================ 1. TRACK RECORD
def build_track():
    core_i = fill(monthly(fred("PCEPILFE")))
    cpi_i = fill(monthly(fred("CPIAUCSL")))
    un_m = fill(monthly(fred("UNRATE")))
    pay_l = fill(monthly(fred("PAYEMS")))
    jol_m = fill(monthly(fred("JTSJOL")))
    dff = fred("DFF")
    y3m = fred("DGS3MO")
    y2 = fred("DGS2")
    y10 = fred("DGS10")
    be5 = fred("T5YIE")
    oil = fred("DCOILWTICO")
    claims = fred("ICSA")
    w = {k: weekly(v) for k, v in (("ff", dff), ("y3m", y3m), ("y2", y2), ("y10", y10), ("be5", be5), ("oil", oil), ("claims", claims))}
    me = {k: monthly(v) for k, v in (("ff", dff), ("y2", y2), ("y10", y10), ("oil", oil))}
    core_y, cpi_y = yoy_m(core_i), yoy_m(cpi_i)
    pay_c = {k: (v - pay_l[madd(k, -1)]) for k, v in pay_l.items() if madd(k, -1) in pay_l}

    def upto(series, end):
        return [p for p in series if p[0] <= end]

    def last_before(series, end):
        u = upto(series, end)
        return u[-1] if u else None

    def ago_val(series, end, days):
        e = d_(end)
        best = None
        for t, v in series:
            if t > end:
                break
            if (e - d_(t)).days >= days:
                best = v
        return best

    def wsd(series, n):
        h = series[-(n + 1):]
        return std([h[i][1] - h[i - 1][1] for i in range(1, len(h))])

    def infl_path(I, keys, oil3):
        """mirror of forecast()->inflPath(): I = index levels up to the last month"""
        vals = [I[k] for k in keys]
        n = len(vals)
        if n < 26:
            return None
        mm = [math.log(vals[i] / vals[i - 1]) for i in range(1, n)]
        m3, m6, m12 = mean(mm[-3:]), mean(mm[-6:]), mean(mm[-12:])
        sd = std(mm[-24:])
        target = math.log(1.02) / 12
        drift = 0.45 * m3 + 0.35 * m6 + 0.2 * m12
        oil_adj = clamp(oil3, -40, 40) / 100 * 0.02 / 3 if oil3 is not None else 0
        cur, path = math.log(vals[-1]), []
        for k in range(1, 13):
            cur += drift + (target - drift) * min(1, k / 24) + (oil_adj if k <= 3 else 0)
            path.append(cur)
        out = {}
        for k in (3, 6, 12):
            base = vals[n - 1 - 12 + k]
            yv = (math.exp(path[k - 1]) / base - 1) * 100
            b = sd * math.sqrt(k) * 100 * 1.1
            out[k] = (yv, yv - b, yv + b)
        return out

    models = {k: {h: [] for h in (3, 6, 12)} for k in ("core", "cpi", "ff", "y10", "y2", "un", "oil")}
    start = "2012-01"
    A = start
    last_month = mkey(TODAY)
    while A <= last_month:
        L = madd(A, -2)                       # last monthly print known on the 1st of A
        dlim = (d_(A + "-01") - timedelta(days=1)).isoformat()   # daily data up to end of A-1
        D0 = madd(A, -1)                      # month of the last daily value
        try:
            ik = sorted(k for k in core_i if k <= L)
            ck = sorted(k for k in cpi_i if k <= L)
            oilw = upto(w["oil"], dlim)
            oil_v = oilw[-1][1] if oilw else None
            oil_m3 = ago_val(w["oil"], dlim, 88)
            oil3 = (oil_v / oil_m3 - 1) * 100 if oil_v and oil_m3 else None
            # inflation
            for key, I, ks, hl in (("core", core_i, ik, False), ("cpi", cpi_i, ck, True)):
                p = infl_path(I, ks, oil3 if hl else None)
                if p:
                    Y = core_y if key == "core" else cpi_y
                    for h in (3, 6, 12):
                        T = madd(ks[-1], h)
                        models[key][h].append((A, T, Y.get(ks[-1]), p[h][0], p[h][1], p[h][2], Y.get(T)))
            # the Fed
            ff = last_before(w["ff"], dlim)
            bill = last_before(w["y3m"], dlim)
            y2v = last_before(w["y2"], dlim)
            un = un_m.get(L)
            cv = core_y.get(L)
            if ff and y2v and bill:
                ff, bill, y2v = ff[1], bill[1], y2v[1]
                taylor = 1.0 + cv + 0.5 * (cv - 2) + 0.5 * (-2 * (un - 4.2)) if cv is not None and un is not None else None
                slope = (y2v - 0.15 - ff) / 12
                r3b = clamp(2 * bill - ff, ff - 0.75, ff + 0.75)
                r3 = 0.7 * r3b + 0.3 * (ff + 3 * slope)
                r6 = ff + 6 * slope * 0.9 + (r3 - ff - 3 * slope) * 0.5
                r12 = ff + 12 * slope * 0.85
                for h, v in ((3, r3), (6, r6), (12, r12)):
                    b = 0.18 * math.sqrt(h / 3)
                    T = madd(D0, h)
                    models["ff"][h].append((A, T, ff, v, v - b, v + b, me["ff"].get(T)))
                # yields
                y10w, y2w = upto(w["y10"], dlim), upto(w["y2"], dlim)
                b5 = last_before(w["be5"], dlim)
                y10v = y10w[-1][1]
                fair10 = 0.5 * (((b5[1] if b5 else 2.3)) + 1.0 + 0.6) + 0.5 * (r12 + 0.55)
                fair2 = 0.6 * r12 + 0.4 * (clamp(taylor, 0, 8) if taylor is not None else y2v)
                for key, now, fair, ser in (("y10", y10v, fair10, y10w), ("y2", y2v, fair2, y2w)):
                    mom = ser[-1][1] - ser[-14][1] if len(ser) > 14 else 0
                    sd = wsd(ser, 104) or 0.1
                    for h in (3, 6, 12):
                        wk = h * 4.33
                        v = now + (fair - now) * (1 - 0.97 ** wk) + mom * 0.25 * min(1, h / 6)
                        b = sd * math.sqrt(wk)
                        T = madd(D0, h)
                        models[key][h].append((A, T, now, v, v - b, v + b, me[key].get(T)))
            # unemployment
            if un is not None:
                pay3 = mean([pay_c.get(madd(L, -i)) for i in range(3)])
                clw = upto(w["claims"], dlim)
                clTr = (mean([p[1] for p in clw[-4:]]) / mean([p[1] for p in clw[-17:-13]]) - 1) if len(clw) > 17 else 0
                jk = madd(A, -3)
                joTr = (jol_m[jk] / jol_m[madd(jk, -3)] - 1) if jk in jol_m and madd(jk, -3) in jol_m else 0
                unMom = un - un_m[madd(L, -3)] if madd(L, -3) in un_m else 0
                dq = clamp(-(pay3 - 80) / 450 + clTr * 1.2 - joTr * 0.8 + unMom * 0.35, -0.4, 0.6)
                for h in (3, 6, 12):
                    v = un + dq * (h / 3) * (0.8 if h > 6 else 1)
                    b = 0.14 * math.sqrt(h / 3)
                    T = madd(L, h)
                    models["un"][h].append((A, T, un, v, v - b, v + b, un_m.get(T)))
            # oil
            if oil_v:
                h3 = [p[1] for p in oilw if (d_(dlim) - d_(p[0])).days <= 3 * 365.25]
                avg = mean(h3)
                mom = oil_v - oil_m3 if oil_m3 else 0
                hh = oilw[-105:]
                rets = [math.log(hh[i][1] / hh[i - 1][1]) for i in range(1, len(hh)) if hh[i][1] > 0 and hh[i - 1][1] > 0]
                vol = (std(rets) or 0.05) * math.sqrt(52)
                for h in (3, 6, 12):
                    v = oil_v + (avg - oil_v) * 0.45 * h / 12 + mom * 0.25 * min(1, h / 6)
                    s2 = vol * math.sqrt(h / 12)
                    T = madd(D0, h)
                    models["oil"][h].append((A, T, oil_v, v, v * math.exp(-s2), v * math.exp(s2), me["oil"].get(T)))
        except Exception as e:  # noqa: BLE001
            print("track", A, type(e).__name__, e, file=sys.stderr)
        A = madd(A, 1)

    META = {
        "core": ({"en": "Core PCE inflation", "th": "เงินเฟ้อพื้นฐาน (Core PCE)"}, "%", 2),
        "cpi": ({"en": "CPI inflation", "th": "เงินเฟ้อทั่วไป (CPI)"}, "%", 2),
        "ff": ({"en": "Fed funds rate", "th": "ดอกเบี้ยนโยบายเฟด"}, "%", 2),
        "y10": ({"en": "10-year yield", "th": "บอนด์ยีลด์ 10 ปี"}, "%", 2),
        "y2": ({"en": "2-year yield", "th": "บอนด์ยีลด์ 2 ปี"}, "%", 2),
        "un": ({"en": "Unemployment rate", "th": "อัตราว่างงาน"}, "%", 2),
        "oil": ({"en": "Crude oil (WTI)", "th": "น้ำมันดิบ WTI"}, "$", 1),
    }
    out = []
    for k, H in models.items():
        name, unit, dec = META[k]
        m = {"k": k, "name": name, "unit": unit, "dec": dec, "h": {}}
        for h, rows in H.items():
            done = [x for x in rows if x[6] is not None and x[2] is not None]
            if len(done) < 12:
                continue
            err = [abs(x[3] - x[6]) for x in done]
            err0 = [abs(x[2] - x[6]) for x in done]
            beat = sum(1 for a, b in zip(err, err0) if a < b - 1e-9) / len(done) * 100
            cov = sum(1 for x in done if x[4] <= x[6] <= x[5]) / len(done) * 100
            thr = 0.1 if unit == "%" else 2.0
            dirs = [x for x in done if abs(x[3] - x[2]) > thr and abs(x[6] - x[2]) > thr / 2]
            dhit = sum(1 for x in dirs if (x[3] - x[2]) * (x[6] - x[2]) > 0) / len(dirs) * 100 if dirs else None
            recent = done[-24:]
            # how much wider the band would have had to be to hold ~68% of outcomes
            ratios = sorted(abs(x[6] - x[3]) / max(1e-9, (x[5] - x[4]) / 2) for x in done)
            cal = ratios[int(0.68 * (len(ratios) - 1))]
            m["h"][str(h)] = {
                "cal": r(clamp(cal, 0.5, 4.0), 2), "bias": r(mean([x[3] - x[6] for x in done]), 3),
                "n": len(done), "mae": r(mean(err), 3), "mae0": r(mean(err0), 3),
                "beat": r(beat, 1), "cov": r(cov, 1), "dir": r(dhit, 1), "ndir": len(dirs),
                "mae_recent": r(mean([abs(x[3] - x[6]) for x in recent]), 3),
                "mae0_recent": r(mean([abs(x[2] - x[6]) for x in recent]), 3),
                # [as-of month, target month, value then, forecast, lo, hi, actual]
                "pts": [[x[0], x[1], r(x[2], 3), r(x[3], 3), r(x[4], 3), r(x[5], 3), r(x[6], 3)] for x in rows if x[2] is not None][-160:],
            }
        if m["h"]:
            out.append(m)

    # recession model: NY Fed probit on the monthly 10y-3m spread
    t3 = monthly(fred("T10Y3M"), "mean")
    rec = monthly(fred("USREC"))
    probs = [(k, Phi(-0.5333 - 0.6330 * v) * 100) for k, v in sorted(t3.items())]
    starts = [k for k in sorted(rec) if rec[k] >= 1 and rec.get(madd(k, -1), 0) < 1 and k >= "1983-01"]
    calls = []
    for s in starts:
        lead = None
        for k, p in probs:
            if mdiff(s, k) <= 24 and mdiff(s, k) >= 0 and p >= 30:
                lead = mdiff(s, k)
                break
        calls.append({"start": s, "lead": lead})
    # false alarms: runs of p>=30 with no recession starting within 24 months
    alarms, run = [], None
    for k, p in probs:
        if p >= 30 and run is None:
            run = k
        elif p < 30 and run is not None:
            alarms.append((run, k))
            run = None
    if run:
        alarms.append((run, None))
    fa = []
    for a, b in alarms:
        hit = any(0 <= mdiff(s, a) <= 24 for s in starts)
        open_window = mdiff(mkey(TODAY), a) < 24
        fa.append({"from": a, "to": b, "hit": hit, "open": (not hit) and open_window})
    recm = {
        "probs": [[k, r(p, 1)] for k, p in probs if k >= "1983-01"],
        "calls": calls, "alarms": fa,
    }
    # S&P 500 range honesty: was the realised 6-month move inside the VIX band?
    spx = monthly(sp500_daily())
    vix = monthly(fred("VIXCLS"))
    inside1 = inside2 = n = 0
    pts = []
    for k in sorted(vix):
        T = madd(k, 6)
        if k in spx and T in spx:
            ret = (spx[T] / spx[k] - 1) * 100
            mu, sig = 3.5, vix[k] * math.sqrt(0.5)
            n += 1
            inside1 += abs(ret - mu) <= sig
            inside2 += abs(ret - mu) <= 2 * sig
            pts.append([k, r(ret, 1), r(mu - sig, 1), r(mu + sig, 1)])
    spxm = {"n": n, "cov1": r(inside1 / n * 100, 1) if n else None, "cov2": r(inside2 / n * 100, 1) if n else None, "pts": pts[-240:]}
    return {"models": out, "rec": recm, "spx": spxm, "from": start}


# ================================================================ 2. ANALOGS
FEATS = [
    ("core", {"en": "Core inflation (CPI ex food & energy)", "th": "เงินเฟ้อพื้นฐาน"}, "%", 1.2),
    ("dcore", {"en": "Change in core inflation, 6 months", "th": "เงินเฟ้อพื้นฐานเปลี่ยนใน 6 เดือน"}, "pt", 0.8),
    ("un", {"en": "Unemployment rate", "th": "อัตราว่างงาน"}, "%", 0.8),
    ("dun", {"en": "Unemployment above its 12-month low", "th": "ว่างงานสูงกว่าจุดต่ำสุด 12 เดือน"}, "pt", 1.0),
    ("ff", {"en": "Fed funds rate", "th": "ดอกเบี้ยนโยบายเฟด"}, "%", 1.0),
    ("real", {"en": "Real Fed rate (Fed rate − core inflation)", "th": "ดอกเบี้ยเฟดที่แท้จริง (หักเงินเฟ้อ)"}, "pt", 0.8),
    ("curve", {"en": "Yield curve (10y − 3m)", "th": "เส้นยีลด์ (10 ปี − 3 เดือน)"}, "pt", 1.0),
    ("oil", {"en": "Oil price vs a year ago", "th": "น้ำมันเทียบปีก่อน"}, "%", 0.6),
]


def build_frame():
    core = yoy_m(fill(monthly(fred("CPILFESL"))))
    un = fill(monthly(fred("UNRATE")))
    ff = fill(monthly(fred("FEDFUNDS")))
    g10 = fill(monthly(fred("GS10")))
    tb = fill(monthly(fred("TB3MS")))
    oil = yoy_m(fill(monthly(fred("WTISPLC"))))
    rec = monthly(fred("USREC"))
    spx = monthly(sp500_daily())
    X = {}
    for k in sorted(core):
        if k < "1960-01":
            continue
        try:
            v = {
                "core": core[k], "dcore": core[k] - core[madd(k, -6)],
                "un": un[k], "dun": un[k] - min(un[madd(k, -i)] for i in range(0, 12)),
                "ff": ff[k], "real": ff[k] - core[k], "curve": g10[k] - tb[k],
                "oil": clamp(oil[k], -60, 120),
            }
        except KeyError:
            continue
        X[k] = v
    return X, {"core": core, "un": un, "ff": ff, "g10": g10, "tb": tb, "rec": rec, "spx": spx, "oilp": fill(monthly(fred("WTISPLC")))}


def build_analogs(X, S):
    keys = sorted(X)
    now = keys[-1]
    zs = {}
    for f, _, _, _ in FEATS:
        vals = [X[k][f] for k in keys]
        m, s = mean(vals), std(vals)
        zs[f] = (m, s)

    def z(k, f):
        return (X[k][f] - zs[f][0]) / zs[f][1]

    def dist(a, b):
        return math.sqrt(sum(wt * (z(a, f) - z(b, f)) ** 2 for f, _, _, wt in FEATS) / sum(wt for *_, wt in FEATS))

    cand = [k for k in keys if mdiff(now, k) >= 24]
    ds = sorted(((dist(now, k), k) for k in cand))
    allD = sorted(d for d, _ in ds)
    picks = []
    for d, k in ds:
        if all(abs(mdiff(k, p[1])) >= 24 for p in picks):
            picks.append((d, k))
        if len(picks) >= 6:
            break

    spx, g10, tb, core, un, ff, rec, oilp = S["spx"], S["g10"], S["tb"], S["core"], S["un"], S["ff"], S["rec"], S["oilp"]

    def outcome(k):
        o = {}
        if k in spx:
            for h in (6, 12):
                T = madd(k, h)
                if T in spx:
                    o["spx%d" % h] = r((spx[T] / spx[k] - 1) * 100, 1)
            o["path"] = [r(spx[madd(k, i)] / spx[k] * 100, 1) if madd(k, i) in spx else None for i in range(0, 13)]
            lo = min([spx[madd(k, i)] for i in range(0, 13) if madd(k, i) in spx] or [spx[k]])
            o["dd12"] = r((lo / spx[k] - 1) * 100, 1)
        tr = 0.0
        ok = True
        for i in range(12):
            a, b = madd(k, i), madd(k, i + 1)
            if a in g10 and b in g10:
                tr += g10[a] / 12 - 8.0 * (g10[b] - g10[a])
            else:
                ok = False
        if ok:
            o["bond12"] = r(tr, 1)
        if all(madd(k, i) in tb for i in range(12)):
            o["cash12"] = r(mean([tb[madd(k, i)] for i in range(12)]), 1)
        T = madd(k, 12)
        if T in core:
            o["core12"] = r(core[T] - core[k], 2)
        if T in un:
            o["un12"] = r(un[T] - un[k], 2)
        if T in ff:
            o["ff12"] = r(ff[T] - ff[k], 2)
        if T in oilp and k in oilp:
            o["oil12"] = r((oilp[T] / oilp[k] - 1) * 100, 1)
        o["rec12"] = any(rec.get(madd(k, i), 0) >= 1 for i in range(1, 13))
        o["rec18"] = any(rec.get(madd(k, i), 0) >= 1 for i in range(1, 19))
        return o

    matches = []
    for d, k in picks:
        pct = sum(1 for x in allD if x > d) / len(allD) * 100
        matches.append({"t": k, "d": r(d, 3), "sim": r(pct, 1), "f": {f: r(X[k][f], 2) for f, *_ in FEATS}, "out": outcome(k)})
    # weighted average of the outcomes (closer = more weight)
    agg = {}
    for key in ("spx6", "spx12", "bond12", "cash12", "core12", "un12", "ff12", "oil12", "dd12"):
        num = den = 0.0
        for m in matches:
            v = m["out"].get(key)
            if v is not None:
                wt = 1 / (0.15 + m["d"])
                num += v * wt
                den += wt
        agg[key] = r(num / den, 2) if den else None
    agg["rec12"] = r(sum(1 for m in matches if m["out"].get("rec12")) / len(matches) * 100, 0) if matches else None
    agg["up12"] = r(sum(1 for m in matches if (m["out"].get("spx12") or 0) > 0) / max(1, sum(1 for m in matches if m["out"].get("spx12") is not None)) * 100, 0)
    # base rates over every month (what "normal" looks like)
    base = {}
    allk = [k for k in keys if mdiff(now, k) >= 12]
    outs = [outcome(k) for k in allk[::1]]
    for key in ("spx6", "spx12", "bond12", "cash12", "core12", "un12", "dd12", "ff12", "oil12"):
        base[key] = r(mean([o.get(key) for o in outs]), 2)
    base["rec12"] = r(sum(1 for o in outs if o.get("rec12")) / len(outs) * 100, 0)
    base["up12"] = r(sum(1 for o in outs if (o.get("spx12") or 0) > 0) / max(1, sum(1 for o in outs if o.get("spx12") is not None)) * 100, 0)
    # the "distance over time" line: how similar every past month is to today
    simline = [[k, r(100 - sum(1 for x in allD if x < dist(now, k)) / len(allD) * 100, 1)] for k in cand[::3]]
    return {
        "now": now, "feats": [{"k": f, "name": n, "unit": u, "w": wt, "now": r(X[now][f], 2), "avg": r(zs[f][0], 2), "sd": r(zs[f][1], 2)} for f, n, u, wt in FEATS],
        "matches": matches, "avg": agg, "base": base, "pool": len(cand), "since": keys[0], "simline": simline,
    }


# ================================================================= 3. ALERTS
def build_alerts(X, S):
    rec, spx = S["rec"], S["spx"]
    t3 = monthly(fred("T10Y3M"), "mean")
    t2 = monthly(fred("T10Y2Y"), "mean")
    sahm = fill(monthly(fred("SAHMREALTIME")))
    icsa = monthly(fred("ICSA"), "mean")
    baa = monthly(fred("BAA10Y"), "mean")
    nfci = monthly(fred("NFCI"), "mean")
    core = S["core"]
    ff = S["ff"]
    oil = yoy_m(S["oilp"])
    hy = monthly(fred("BAMLH0A0HYM2"), "mean")

    def cross(series, thr, up=True, need=3):
        """months where the series crosses thr (after `need` months on the other side)."""
        ks = sorted(series)
        out = []
        for i in range(need, len(ks)):
            k = ks[i]
            prev = [series[ks[j]] for j in range(i - need, i)]
            if up and series[k] >= thr and all(p < thr for p in prev):
                out.append(k)
            if not up and series[k] < thr and all(p >= thr for p in prev):
                out.append(k)
        return out

    claims_r = {}
    ks = sorted(icsa)
    for i in range(12, len(ks)):
        lo = min(icsa[ks[j]] for j in range(i - 12, i))
        claims_r[ks[i]] = (icsa[ks[i]] / lo - 1) * 100
    baa_c = {k: v - baa[madd(k, -3)] for k, v in baa.items() if madd(k, -3) in baa}
    hy_c = {k: v - hy[madd(k, -3)] for k, v in hy.items() if madd(k, -3) in hy}
    ff_c = {k: v - ff[madd(k, -2)] for k, v in ff.items() if madd(k, -2) in ff}
    spx_dd = {}
    pk = None
    for k in sorted(spx):
        pk = spx[k] if pk is None else max(pk, spx[k])
        spx_dd[k] = (spx[k] / pk - 1) * 100

    def first_move(series, thr, sign):
        ks = sorted(series)
        out = []
        for i in range(12, len(ks)):
            k = ks[i]
            if sign * series[k] >= thr and all(sign * series[ks[j]] < thr for j in range(i - 12, i)):
                out.append(k)
        return out

    R = [
        ("inv3m", "bad", {"en": "Yield curve inverts (10y below 3m)", "th": "เส้นยีลด์กลับหัว (10 ปี ต่ำกว่า 3 เดือน)"},
         {"en": "Short rates above long rates: banks lend less, and recessions have followed every lasting inversion since the 1960s (with a long, variable delay).", "th": "ดอกเบี้ยสั้นสูงกว่ายาว ธนาคารปล่อยกู้น้อยลง และทุกครั้งที่กลับหัวนานๆ มักตามมาด้วยภาวะถดถอย (ช้าเร็วไม่เท่ากัน)"},
         cross(t3, 0, up=False), t3, 0, -1, "pt"),
        ("uninv3m", "bad", {"en": "Curve turns positive again after inverting", "th": "เส้นยีลด์กลับมาเป็นบวกหลังกลับหัว"},
         {"en": "Historically the un-inversion, not the inversion, came closest to the start of recessions — the Fed is usually cutting by then.", "th": "ในอดีต ช่วงที่เส้นกลับมาเป็นบวก (ไม่ใช่ตอนกลับหัว) มักใกล้จุดเริ่มถดถอยที่สุด เพราะตอนนั้นเฟดมักกำลังลดดอกเบี้ยแล้ว"},
         cross(t3, 0, up=True, need=6), t3, 0, 1, "pt"),
        ("inv2y", "bad", {"en": "10y − 2y curve inverts", "th": "ส่วนต่าง 10 ปี − 2 ปี กลับหัว"},
         {"en": "The curve most people quote. Same message as above, usually earlier.", "th": "เส้นที่คนพูดถึงบ่อยที่สุด ความหมายเหมือนข้อบน มักเกิดก่อน"},
         cross(t2, 0, up=False), t2, 0, -1, "pt"),
        ("sahm", "bad", {"en": "Sahm rule triggers (≥ 0.5)", "th": "สัญญาณ Sahm ทำงาน (≥ 0.5)"},
         {"en": "Unemployment (3-month average) 0.5 pt above its 12-month low. It has fired at the start of every US recession since 1970.", "th": "อัตราว่างงาน (เฉลี่ย 3 เดือน) สูงกว่าจุดต่ำสุด 12 เดือน 0.5 จุด เกิดขึ้นตอนเริ่มถดถอยทุกครั้งตั้งแต่ปี 1970"},
         cross(sahm, 0.5, up=True), sahm, 0.5, 1, ""),
        ("sahm3", "mid", {"en": "Sahm rule enters the warning zone (≥ 0.3)", "th": "สัญญาณ Sahm เข้าเขตเตือน (≥ 0.3)"},
         {"en": "Half-way to the trigger: the job market is clearly softening.", "th": "มาได้ครึ่งทางแล้ว ตลาดแรงงานอ่อนตัวชัดเจน"},
         cross(sahm, 0.3, up=True), sahm, 0.3, 1, ""),
        ("claims", "bad", {"en": "Jobless claims 20% above their 12-month low", "th": "คนขอสวัสดิการว่างงานสูงกว่าจุดต่ำสุด 12 เดือน 20%"},
         {"en": "Layoffs picking up. Weekly claims are the fastest jobs data there is.", "th": "การเลิกจ้างเริ่มเพิ่ม ตัวเลขรายสัปดาห์นี้เป็นข้อมูลการจ้างงานที่เร็วที่สุด"},
         cross(claims_r, 20, up=True), claims_r, 20, 1, "%"),
        ("credit", "bad", {"en": "Corporate credit spread jumps (+0.6 pt in 3 months)", "th": "ส่วนต่างดอกเบี้ยหุ้นกู้กระโดด (+0.6 จุดใน 3 เดือน)"},
         {"en": "Lenders demanding much more to lend to companies — stress is building in the financial system.", "th": "ผู้ให้กู้เรียกดอกเบี้ยเพิ่มมากเพื่อปล่อยกู้ให้บริษัท ความเครียดในระบบการเงินกำลังก่อตัว"},
         cross(baa_c, 0.6, up=True), baa_c, 0.6, 1, "pt"),
        ("hy", "bad", {"en": "Junk-bond spread jumps (+1 pt in 3 months)", "th": "ส่วนต่างหุ้นกู้เสี่ยงสูงกระโดด (+1 จุดใน 3 เดือน)"},
         {"en": "The riskiest borrowers getting shut out. Only ~3 years of history are public, so no long statistics.", "th": "ผู้กู้ที่เสี่ยงที่สุดเริ่มกู้ยาก ข้อมูลสาธารณะมีแค่ราว 3 ปี จึงไม่มีสถิติยาว"},
         cross(hy_c, 1.0, up=True), hy_c, 1.0, 1, "pt"),
        ("hot", "bad", {"en": "Core inflation climbs above 3%", "th": "เงินเฟ้อพื้นฐานขึ้นเกิน 3%"},
         {"en": "Above 3% the Fed finds it hard to cut and may hike.", "th": "เกิน 3% เฟดลดดอกเบี้ยได้ยาก และอาจต้องขึ้น"},
         cross(core, 3.0, up=True, need=6), core, 3.0, 1, "%"),
        ("cool", "good", {"en": "Core inflation falls back below 3%", "th": "เงินเฟ้อพื้นฐานกลับลงต่ำกว่า 3%"},
         {"en": "Gives the Fed room to cut — usually good for bonds and stocks.", "th": "เปิดทางให้เฟดลดดอกเบี้ย มักดีต่อบอนด์และหุ้น"},
         cross(core, 3.0, up=False, need=6), core, 3.0, -1, "%"),
        ("cut1", "mid", {"en": "The Fed's first rate cut of a cycle", "th": "เฟดลดดอกเบี้ยครั้งแรกของรอบ"},
         {"en": "Good for stocks if growth holds (1995, 2019), bad if it is a rescue (2001, 2007).", "th": "ดีต่อหุ้นถ้าเศรษฐกิจยังไปได้ (1995, 2019) แต่แย่ถ้าเป็นการลดเพื่อกู้วิกฤต (2001, 2007)"},
         first_move(ff_c, 0.2, -1), {k: -v for k, v in ff_c.items()}, 0.2, 1, "pt"),
        ("hike1", "bad", {"en": "The Fed's first rate hike of a cycle", "th": "เฟดขึ้นดอกเบี้ยครั้งแรกของรอบ"},
         {"en": "Tightening begins. Stocks often keep rising at first; trouble tends to come later in the cycle.", "th": "เริ่มรอบการขึ้นดอกเบี้ย หุ้นมักยังขึ้นต่อในช่วงแรก ปัญหามักมาช่วงท้ายรอบ"},
         first_move(ff_c, 0.2, 1), ff_c, 0.2, 1, "pt"),
        ("oil", "bad", {"en": "Oil up 50% or more in a year", "th": "น้ำมันขึ้น 50% ขึ้นไปใน 1 ปี"},
         {"en": "Oil shocks preceded most recessions before 2000 and squeeze consumers' budgets.", "th": "ราคาน้ำมันพุ่งเกิดก่อนภาวะถดถอยส่วนใหญ่ก่อนปี 2000 และกดกำลังซื้อผู้บริโภค"},
         cross(oil, 50, up=True, need=6), oil, 50, 1, "%"),
        ("nfci", "bad", {"en": "Financial conditions turn tight (NFCI above 0)", "th": "สภาพการเงินตึงตัว (NFCI เกิน 0)"},
         {"en": "The Chicago Fed's index of credit, leverage and risk across markets says money is harder to get than normal.", "th": "ดัชนีเฟดชิคาโกที่รวมสินเชื่อ หนี้ และความเสี่ยงทุกตลาด บอกว่าเงินหายากกว่าปกติ"},
         cross(nfci, 0, up=True), nfci, 0, 1, ""),
        ("bear", "bad", {"en": "S&P 500 falls 20% from its high", "th": "S&P 500 ลง 20% จากจุดสูงสุด"},
         {"en": "The textbook bear market. Shows what came after the damage was already done.", "th": "ตลาดหมีตามตำรา ดูว่าหลังจากร่วงไปแล้วเกิดอะไรต่อ"},
         cross(spx_dd, -20, up=False, need=3), spx_dd, -20, -1, "%"),
    ]
    RECENT = {"uninv3m": 12, "cut1": 6, "hike1": 6, "bear": 6}
    rules, events = [], []
    for k, tone, name, why, fires, series, thr, sign, unit in R:
        fires = [f for f in fires if f >= "1970-01"]
        st = []
        for fk in fires:
            o = {}
            for h in (6, 12):
                T = madd(fk, h)
                if fk in spx and T in spx:
                    o["spx%d" % h] = r((spx[T] / spx[fk] - 1) * 100, 1)
            o["rec18"] = any(rec.get(madd(fk, i), 0) >= 1 for i in range(0, 19)) if mdiff(mkey(TODAY), fk) >= 18 or any(rec.get(madd(fk, i), 0) >= 1 for i in range(0, 19)) else None
            st.append(o)
            events.append({"t": fk, "k": k, "tone": tone, "v": r(series.get(fk), 2), "spx12": o.get("spx12"), "rec18": o["rec18"]})
        s12 = [o["spx12"] for o in st if o.get("spx12") is not None]
        r18 = [o["rec18"] for o in st if o.get("rec18") is not None]
        last_k = sorted(series)[-1]
        cur = series[last_k]
        hist = [series[x] for x in sorted(series)[-36:]]
        on = (cur >= thr) if sign > 0 else (cur < thr)
        close_override = False
        if k in RECENT:     # one-off events: "on" while the event is fresh
            on = bool(fires) and mdiff(mkey(TODAY), fires[-1]) <= RECENT[k]
        close_override = k == "uninv3m"
        # "closeness" 0..100: how far between its 3-year calm extreme and the trigger
        calm = min(hist) if sign > 0 else max(hist)
        span = (thr - calm) if sign > 0 else (calm - thr)
        close = 100.0 if on else clamp(((cur - calm) if sign > 0 else (calm - cur)) / span * 100, 0, 99) if span > 1e-9 else 0
        rules.append({
            "k": k, "tone": tone, "name": name, "why": why, "unit": unit, "thr": thr, "sign": sign,
            "cur": r(cur, 2), "at": last_k, "on": on, "close": r((100.0 if on else 0.0) if close_override else close, 0),
            "last": fires[-1] if fires else None, "n": len(fires),
            "spx12": r(mean(s12), 1), "up12": r(sum(1 for x in s12 if x > 0) / len(s12) * 100, 0) if s12 else None,
            "rec18": r(sum(1 for x in r18 if x) / len(r18) * 100, 0) if r18 else None,
            "spark": [r(x, 2) for x in hist],
        })
    events.sort(key=lambda e: e["t"])
    recs = []
    start = None
    for k in sorted(rec):
        if k < "1970-01":
            continue
        if rec[k] >= 1 and start is None:
            start = k
        if rec[k] < 1 and start is not None:
            recs.append([start, madd(k, -1)])
            start = None
    return {"rules": rules, "events": events, "recessions": recs}


# ============================================================== 4. LIQUIDITY
def build_liq():
    walcl = dict(fred("WALCL"))
    tga = dict(fred("WTREGEN"))
    res = dict(fred("WRESBAL"))
    rrp = fred("RRPONTSYD")
    spx = fred("SP500")
    rrp_i, spx_i = 0, 0
    out = []
    keys = sorted(walcl)
    for t in keys:
        if t < "2019-01-01" or t not in tga:
            continue
        while rrp_i + 1 < len(rrp) and rrp[rrp_i + 1][0] <= t:
            rrp_i += 1
        while spx_i + 1 < len(spx) and spx[spx_i + 1][0] <= t:
            spx_i += 1
        rv = rrp[rrp_i][1] if rrp and rrp[rrp_i][0] <= t else 0.0
        sv = spx[spx_i][1] if spx and spx[spx_i][0] <= t else None
        bs, tg = walcl[t] / 1000.0, tga[t] / 1000.0
        out.append([t, r(bs, 0), r(tg, 0), r(rv, 0), r(bs - tg - rv, 0), r(res.get(t, 0) / 1000.0, 0), r(sv, 1)])

    def chg(i, n):
        return out[-1][i] - out[-1 - n][i] if len(out) > n else None
    # correlation of 13-week changes (net liquidity vs S&P %), last 3 years, and with leads
    best = None
    tail = out[-160:]
    for lead in range(0, 9):
        a, b = [], []
        for j in range(13 + lead, len(tail)):
            x0, x1 = tail[j - 13 - lead][4], tail[j - lead][4]
            s0, s1 = tail[j - 13][6], tail[j][6]
            if s0 and s1:
                a.append(x1 - x0)
                b.append((s1 / s0 - 1) * 100)
        if len(a) > 20:
            ma, mb = mean(a), mean(b)
            cov = sum((x - ma) * (y - mb) for x, y in zip(a, b))
            den = math.sqrt(sum((x - ma) ** 2 for x in a) * sum((y - mb) ** 2 for y in b))
            c = cov / den if den else 0
            if best is None or c > best[1]:
                best = (lead, c)
            if lead == 0:
                c0 = c
    peak = max(out, key=lambda x: x[4])
    return {
        "hist": out, "cols": ["t", "fed_bn", "tga_bn", "rrp_bn", "net_bn", "reserves_bn", "spx"],
        "now": out[-1], "chg4": r(chg(4, 4), 0), "chg13": r(chg(4, 13), 0), "chg52": r(chg(4, 52), 0),
        "bs13": r(chg(1, 13), 0), "tga13": r(chg(2, 13), 0), "rrp13": r(chg(3, 13), 0),
        "qt_week": r(chg(1, 13) / 13, 1) if chg(1, 13) is not None else None,
        "corr0": r(c0, 2), "best_lead": best[0] if best else None, "best_corr": r(best[1], 2) if best else None,
        "peak": [peak[0], peak[4]],
    }


# =================================================================== 5. THAI
def bis(key, start="2000-01"):
    raw = _get("https://stats.bis.org/api/v2/data/dataflow/BIS/%s?format=csv&startPeriod=%s" % (key, start)).decode("utf-8", "ignore")
    rows = []
    for rec in csv.DictReader(io.StringIO(raw)):
        v = _num(rec.get("OBS_VALUE"))
        t = rec.get("TIME_PERIOD")
        if v is not None and t:
            rows.append((t, v))
    rows.sort()
    if not rows:
        raise ValueError("bis empty " + key)
    return rows


def imf(ind, iso="THA"):
    j = json.loads(_get("https://www.imf.org/external/datamapper/api/v1/%s/%s" % (ind, iso)).decode("utf-8"))
    v = (j.get("values") or {}).get(ind, {}).get(iso) or {}
    return {int(y): _num(x) for y, x in v.items() if _num(x) is not None}


def build_thai(prev):
    out = dict(prev or {})
    errs = []
    try:
        pol = bis("WS_CBPOL/1.0/D.TH", "2005-01-01")
        pm = monthly(pol)
        out["policy"] = [[k, r(v, 2)] for k, v in sorted(pm.items())]
        out["policy_now"] = [pol[-1][0], r(pol[-1][1], 2)]
        chg = [(pol[i][0], pol[i][1] - pol[i - 1][1]) for i in range(1, len(pol)) if abs(pol[i][1] - pol[i - 1][1]) > 1e-6]
        out["policy_moves"] = [[t, r(d, 2)] for t, d in chg[-12:]]
    except Exception as e:  # noqa: BLE001
        errs.append("policy:%s" % type(e).__name__)
    try:
        cpi = bis("WS_LONG_CPI/1.0/M.TH.771", "2005-01")
        out["cpi"] = [[t, r(v, 2)] for t, v in cpi]
    except Exception as e:  # noqa: BLE001
        errs.append("cpi:%s" % type(e).__name__)
    try:
        fx = monthly(fred("DEXTHUS"), "mean")
        out["thb"] = [[k, r(v, 3)] for k, v in sorted(fx.items()) if k >= "2005-01"]
        d = fred("DEXTHUS")
        out["thb_now"] = [d[-1][0], r(d[-1][1], 3)]
    except Exception as e:  # noqa: BLE001
        errs.append("thb:%s" % type(e).__name__)
    try:
        ffm = monthly(fred("FEDFUNDS"))
        out["fedfunds"] = [[k, r(v, 2)] for k, v in sorted(ffm.items()) if k >= "2005-01"]
    except Exception as e:  # noqa: BLE001
        errs.append("ff:%s" % type(e).__name__)
    weo = {}
    for ind, name in (("NGDP_RPCH", "gdp"), ("PCPIPCH", "infl"), ("LUR", "un"), ("BCA_NGDPD", "ca"), ("GGXWDG_NGDP", "debt")):
        try:
            th = imf(ind, "THA")
            us = imf(ind, "USA") if name in ("gdp", "infl") else {}
            weo[name] = {"th": [[y, r(v, 2)] for y, v in sorted(th.items()) if 2015 <= y <= TODAY.year + 4],
                         "us": [[y, r(v, 2)] for y, v in sorted(us.items()) if 2015 <= y <= TODAY.year + 4]}
        except Exception as e:  # noqa: BLE001
            errs.append("imf_%s:%s" % (name, type(e).__name__))
    if weo:
        out["weo"] = weo
    out["errors"] = errs
    return out


# ================================================================= 6. EVENTS
MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]


def fomc_dates():
    days = set()
    upcoming = []
    page = _get("https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", headers={"User-Agent": "Mozilla/5.0"}).decode("utf-8", "ignore")
    stm = re.findall(r"monetary(\d{8})a(1?)\.htm", page)
    has_note = {d for d, a in stm if a == "1"}
    for d, a in stm:
        if d in has_note:
            days.add("%s-%s-%s" % (d[:4], d[4:6], d[6:]))
    # scheduled meetings (incl. future) from the year blocks
    txt = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", page))
    for ym in re.finditer(r"(20\d\d) FOMC Meetings(.*?)(?=20\d\d FOMC Meetings|$)", txt):
        yr = int(ym.group(1))
        for mm in re.finditer(r"\b(January|February|March|April|May|June|July|August|September|October|November|December)(?:/(January|February|March|April|May|June|July|August|September|October|November|December))? (\d{1,2})-(\d{1,2})\b", ym.group(2)):
            mon = mm.group(2) or mm.group(1)
            try:
                dd = date(yr, MONTHS.index(mon.lower()) + 1, int(mm.group(4)))
            except ValueError:
                continue
            if dd >= TODAY:
                upcoming.append(dd.isoformat())
    for yr in range(2016, 2021):
        try:
            h = _get("https://www.federalreserve.gov/monetarypolicy/fomchistorical%d.htm" % yr, headers={"User-Agent": "Mozilla/5.0"}).decode("utf-8", "ignore")
            for d in re.findall(r"monetary(\d{8})a\.htm", h):
                dd = date(int(d[:4]), int(d[4:6]), int(d[6:]))
                if dd.weekday() in (2, 3):
                    days.add(dd.isoformat())
        except Exception:  # noqa: BLE001
            pass
    up = []
    for d in sorted(set(upcoming)):
        if up and (d_(d) - d_(up[-1])).days < 5:
            up[-1] = d          # "January 26-27" style duplicates -> keep the decision day
        else:
            up.append(d)
    return sorted(days), up


def fred_cal(rid):
    """release dates FRED shows for a release (recent past + scheduled)."""
    out = set()
    for y in (TODAY.year - 1, TODAY.year, TODAY.year + 1):
        try:
            h = _get("https://fred.stlouisfed.org/releases/calendar?rid=%d&y=%d" % (rid, y)).decode("utf-8", "ignore")
        except Exception:  # noqa: BLE001
            continue
        for s in re.findall(r"\w+day (\w+ \d{1,2}, \d{4})</span>", h):
            try:
                out.add(datetime.strptime(s, "%B %d, %Y").date().isoformat())
            except ValueError:
                pass
    return out


def bls_archive(name):
    """past release dates from the BLS archive page (file names carry MMDDYYYY)."""
    hdr = dict(BLS_UA)
    hdr["User-Agent"] = "SPACEZ-TERMINAL research %s" % os.environ.get("BLS_CONTACT", "")
    h = _get("https://www.bls.gov/bls/news-release/%s.htm" % name, headers=hdr, timeout=30).decode("utf-8", "ignore")
    out = set()
    for d in re.findall(r"%s_(\d{8})\.htm" % name, h):
        try:
            out.add(date(int(d[4:]), int(d[:2]), int(d[2:4])).isoformat())
        except ValueError:
            pass
    return out


def build_events(prev):
    prev = prev or {}
    known = {k: set(v) for k, v in (prev.get("dates") or {}).items()}
    errs = []
    nxt = {}
    try:
        fd, up = fomc_dates()
        known.setdefault("fomc", set()).update(fd)
        nxt["fomc"] = up
    except Exception as e:  # noqa: BLE001
        errs.append("fomc:%s" % type(e).__name__)
    for key, rid, arch in (("cpi", 10, "cpi"), ("jobs", 50, "empsit"), ("pce", 54, None), ("gdp", 53, None)):
        s = known.setdefault(key, set())
        try:
            fc = fred_cal(rid)
            s.update(d for d in fc if d < TODAY.isoformat())
            nxt[key] = sorted(d for d in fc if d >= TODAY.isoformat())
        except Exception as e:  # noqa: BLE001
            errs.append("%s_cal:%s" % (key, type(e).__name__))
        if arch and os.environ.get("BLS_CONTACT"):
            # BLS only serves its archive to requests that carry a contact
            # e-mail; set BLS_CONTACT as a repository secret to refresh the
            # old dates. Not needed day to day: dates found once are kept in
            # data/brain_ext.json and new ones come from FRED's calendar.
            try:
                s.update(d for d in bls_archive(arch) if d >= "2010-01-01")
            except Exception as e:  # noqa: BLE001
                errs.append("%s_bls:%s" % (key, type(e).__name__))
    # market reaction
    spx = sp500_daily()
    y10 = dict(fred("DGS10"))
    ret = {}
    for i in range(1, len(spx)):
        ret[spx[i][0]] = (spx[i][1] / spx[i - 1][1] - 1) * 100
    ydays = sorted(y10)
    ych = {ydays[i]: (y10[ydays[i]] - y10[ydays[i - 1]]) * 100 for i in range(1, len(ydays))}
    allev = set().union(*known.values()) if known else set()
    normal = [abs(v) for d, v in ret.items() if d not in allev]
    normal_y = [abs(v) for d, v in ych.items() if d not in allev]
    nm, nmy = mean(normal), mean(normal_y)
    stats = {}
    for key, ds in known.items():
        rs = [(d, ret[d]) for d in sorted(ds) if d in ret]
        if not rs:
            continue
        ab = [abs(v) for _, v in rs]
        yv = [abs(ych[d]) for d, _ in rs if d in ych]
        big = sorted(rs, key=lambda x: -abs(x[1]))[:5]
        stats[key] = {
            "n": len(rs), "abs": r(mean(ab), 2), "ratio": r(mean(ab) / nm, 2) if nm else None,
            "big1": r(sum(1 for x in ab if x >= 1) / len(ab) * 100, 0), "up": r(sum(1 for _, v in rs if v > 0) / len(rs) * 100, 0),
            "y10": r(mean(yv), 1), "y10ratio": r(mean(yv) / nmy, 2) if yv and nmy else None,
            "from": rs[0][0], "big": [[d, r(v, 2)] for d, v in big], "recent": [[d, r(v, 2)] for d, v in rs[-8:]],
        }
    return {
        "normal": {"abs": r(nm, 2), "big1": r(sum(1 for x in normal if x >= 1) / len(normal) * 100, 0) if normal else None, "y10": r(nmy, 1)},
        "stats": stats, "next": nxt, "dates": {k: sorted(v) for k, v in known.items()}, "errors": errs,
    }


# =================================================================== main
def main():
    prev = {}
    try:
        with open(OUT, encoding="utf-8") as f:
            prev = json.load(f)
    except Exception:  # noqa: BLE001
        pass
    doc = {"generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "errors": []}

    def part(name, fn, *a):
        try:
            doc[name] = fn(*a)
        except Exception as e:  # noqa: BLE001
            doc["errors"].append("%s:%s:%s" % (name, type(e).__name__, str(e)[:80]))
            if prev.get(name):
                doc[name] = prev[name]
    part("track", build_track)
    try:
        X, S = build_frame()
    except Exception as e:  # noqa: BLE001
        X = S = None
        doc["errors"].append("frame:%s" % type(e).__name__)
    if X:
        part("analog", build_analogs, X, S)
        part("alerts", build_alerts, X, S)
    else:
        for k in ("analog", "alerts"):
            if prev.get(k):
                doc[k] = prev[k]
    part("liq", build_liq)
    part("thai", build_thai, prev.get("thai"))
    part("events", build_events, prev.get("events"))
    try:
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import brain_px
        part("px", brain_px.build_px, fred, monthly)
    except Exception as e:  # noqa: BLE001
        doc["errors"].append("px_import:%s" % type(e).__name__)
        if prev.get("px"):
            doc["px"] = prev["px"]
    try:
        import brain_world
        part("world", brain_world.build_world, _get, fred)
        part("wpb", brain_world.build_playbook, _get, fred, prev.get("wpb"))
    except Exception as e:  # noqa: BLE001
        doc["errors"].append("world_import:%s" % type(e).__name__)
        for k in ("world", "wpb"):
            if prev.get(k):
                doc[k] = prev[k]
    got = [k for k in ("track", "analog", "alerts", "liq", "thai", "events", "px", "world") if doc.get(k)]
    if len(got) < 3:
        print("too little built (%s) -- not writing" % got, file=sys.stderr)
        sys.exit(1)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, separators=(",", ":"))
    print("brain_ext.json: %s errors=%s size=%dKB" % (got, doc["errors"], os.path.getsize(OUT) // 1024))


if __name__ == "__main__":
    main()
