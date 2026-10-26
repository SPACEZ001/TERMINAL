#!/usr/bin/env python3
"""Price forecasts for the Market Brain's "Price forecast" tab (#/brain),
added 2026-10-26. Called from scripts/fetch_brain_ext.py -> block "px".

Two assets, gold (COMEX front-month GC=F, $/oz) and bitcoin (BTC-USD).
Everything is a written rule, no AI:

  forecast(h) = long-run drift          (half the asset's own trailing growth)
              + trend                   (time-series momentum, 12m and 3m)
              + mean reversion          (only the part of the gap to the
                                         200-day average beyond its normal size)
              + seasonality             (average return of the calendar months
                                         ahead, half weight)
              + halving cycle (BTC)     (what BTC did from the same point of
                                         earlier 4-year cycles, 35% weight)
  range(h)    = volatility (recent EWMA blended into the 3-year average)
                x a calibration factor from the walk-forward test below.

The page adds a macro piece on top (gold: expected change in real yields and
the dollar, using the betas estimated here; bitcoin: its beta to the Nasdaq
times the board's own Nasdaq expectation).

Walk-forward test: the same function is re-run every week since ~2008 (gold)
/ 2018 (bitcoin) on the prices known at the time, and compared with what the
price really did -- against "no change" as the bar to beat.

Also: a trend read (moving averages, RSI, MACD, breakouts, trend strength
per time frame), support / resistance from swing points, Fibonacci levels of
the last big swing, month-of-year seasonality and, for bitcoin, the halving
cycle overlay.
"""
import math
from datetime import date, timedelta

HALVINGS = ["2012-11-28", "2016-07-09", "2020-05-11", "2024-04-20"]
NEXT_HALVING = "2028-04-15"   # approximate (block-height based)
HORIZONS = [(7, {"en": "1 week", "th": "1 สัปดาห์"}), (30, {"en": "1 month", "th": "1 เดือน"}),
            (91, {"en": "3 months", "th": "3 เดือน"}), (182, {"en": "6 months", "th": "6 เดือน"}),
            (365, {"en": "12 months", "th": "12 เดือน"})]


def _d(s):
    return date(int(s[:4]), int(s[5:7]), int(s[8:10]))


def _mean(a):
    a = [x for x in a if x is not None]
    return sum(a) / len(a) if a else None


def _std(a):
    a = [x for x in a if x is not None]
    if len(a) < 3:
        return None
    m = sum(a) / len(a)
    return math.sqrt(sum((x - m) ** 2 for x in a) / (len(a) - 1))


def _phi(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def _r(v, n=2):
    return None if v is None else round(v, n)


def yf_daily(sym, start="2000-01-01"):
    import yfinance as yf
    df = yf.download(sym, start=start, interval="1d", progress=False, auto_adjust=False)
    col = df["Close"]
    if hasattr(col, "columns"):
        col = col.iloc[:, 0]
    col = col.dropna()
    rows = [(i.strftime("%Y-%m-%d"), float(v)) for i, v in zip(col.index, col.values) if float(v) > 0]
    if len(rows) < 500:
        raise ValueError("short history " + sym)
    return rows


class Series:
    """daily closes + the running statistics the model needs, precomputed once."""

    def __init__(self, rows, ppy):
        self.t = [x[0] for x in rows]
        self.p = [x[1] for x in rows]
        self.lp = [math.log(x) for x in self.p]
        self.ppy = ppy
        n = len(rows)
        self.ret = [0.0] + [self.lp[i] - self.lp[i - 1] for i in range(1, n)]
        # EWMA variance (lambda 0.94) of daily log returns
        ew, v = [], self.ret[1] ** 2 if n > 1 else 1e-4
        for x in self.ret:
            v = 0.94 * v + 0.06 * x * x
            ew.append(v)
        self.ew = ew
        # running moving averages
        self.ma = {}
        for w in (20, 50, 200):
            out, s = [], 0.0
            for i, x in enumerate(self.p):
                s += x
                if i >= w:
                    s -= self.p[i - w]
                out.append(s / w if i >= w - 1 else None)
            self.ma[w] = out
        self.idx = {t: i for i, t in enumerate(self.t)}

    def at_or_after(self, day):
        """index of the first observation on/after a date string"""
        lo, hi = 0, len(self.t)
        while lo < hi:
            m = (lo + hi) // 2
            if self.t[m] < day:
                lo = m + 1
            else:
                hi = m
        return lo if lo < len(self.t) else None

    def at_or_before(self, day):
        i = self.at_or_after(day)
        if i is None:
            return len(self.t) - 1
        if self.t[i] == day:
            return i
        return i - 1 if i > 0 else None


def seasonality(S, t_end):
    """mean monthly log return by calendar month using months fully before t_end."""
    by = {}
    last_in_month = {}
    for i in range(t_end + 1):
        last_in_month[S.t[i][:7]] = i
    ks = sorted(last_in_month)
    for a, b in zip(ks, ks[1:]):
        m = int(b[5:7])
        by.setdefault(m, []).append(S.lp[last_in_month[b]] - S.lp[last_in_month[a]])
    avg = {m: _mean(v) for m, v in by.items()}
    allm = _mean([x for v in by.values() for x in v]) or 0.0
    return avg, allm, by


def model(S, t, days, asset, seas=None):
    """expected log return + sigma for `days` calendar days ahead, as of index t."""
    ppy = S.ppy
    h = days * ppy / 365.0
    lr_n = min(t, 3 * ppy)
    rets = S.ret[t - lr_n + 1:t + 1]
    lrvar = sum(x * x for x in rets) / max(1, len(rets))
    sig_lr = math.sqrt(lrvar * ppy)
    # 1. long-run drift: half of the trailing growth rate (10y gold, 4y bitcoin)
    yrs = 10 if asset == "gold" else 4
    back = max(0, t - yrs * ppy)
    span = (t - back) / ppy
    cagr = (S.lp[t] - S.lp[back]) / span if span > 0.5 else 0.0
    base = max(0.0, min(0.08, 0.5 * cagr)) if asset == "gold" else max(-0.10, min(0.35, 0.5 * cagr))
    # 2. trend (time-series momentum, scaled by volatility)
    def z(n):
        if t - n < 0:
            return 0.0
        return (S.lp[t] - S.lp[t - n]) / (math.sqrt(lrvar * n) or 1)
    z12, z3 = z(ppy), z(int(ppy / 4))
    mom = sig_lr * (0.20 * math.tanh(z12 / 1.5) + 0.12 * math.tanh(z3 / 1.5))
    # 3. mean reversion: only the stretch beyond the normal gap to the 200-day average
    ma = S.ma[200][t]
    mr = 0.0
    dev = sd_dev = None
    if ma:
        dev = S.lp[t] - math.log(ma)
        hist = [S.lp[i] - math.log(S.ma[200][i]) for i in range(max(200, t - 5 * ppy), t + 1) if S.ma[200][i]]
        sd_dev = _std(hist) or 0.1
        excess = max(0.0, abs(dev) - sd_dev)
        mr = -0.35 * (1 - math.exp(-h / (ppy / 2))) * (1 if dev > 0 else -1) * excess
    # 4. seasonality (excess over the average month), half weight
    sea = 0.0
    if seas:
        avg, allm, _ = seas
        cur = _d(S.t[t])
        months = days / 30.44
        mth, left, k = cur.month, months, 0
        frac0 = 1 - (cur.day - 1) / 30.0
        while left > 1e-6 and k < 14:
            w = min(left, frac0 if k == 0 else 1.0)
            m = (mth - 1 + k) % 12 + 1
            if avg.get(m) is not None:
                sea += w * (avg[m] - allm)
            left -= w
            k += 1
        sea *= 0.5
    # 5. bitcoin halving cycle
    halv = 0.0
    if asset == "btc":
        today = _d(S.t[t])
        prior = [h_ for h_ in HALVINGS if _d(h_) <= today]
        if prior:
            d0 = (today - _d(prior[-1])).days
            acc = wsum = 0.0
            for j, hv in enumerate(prior[:-1]):
                a = (_d(hv) + timedelta(days=d0)).isoformat()
                b = (_d(hv) + timedelta(days=d0 + days)).isoformat()
                if b > S.t[t] or a < S.t[0]:
                    continue
                ia, ib = S.at_or_before(a), S.at_or_before(b)
                if ia is None or ib is None:
                    continue
                wt = 1.0 + j
                acc += wt * (S.lp[ib] - S.lp[ia])
                wsum += wt
            if wsum:
                halv = 0.35 * acc / wsum
    exp = (base + mom) * h / ppy + mr + sea + halv
    w = math.exp(-h / 40.0)
    sig = math.sqrt(h * (w * S.ew[t] + (1 - w) * lrvar))
    return exp, sig, {"base": (base) * h / ppy, "mom": mom * h / ppy, "mr": mr, "seas": sea, "halv": halv,
                      "z12": z12, "z3": z3, "dev": dev, "sd_dev": sd_dev, "cagr": cagr}


def backtest(S, asset, start_year):
    step = 5 if asset == "gold" else 7
    t0 = S.at_or_after("%d-01-01" % start_year) or 0
    out = {}
    pts = {d: [] for d, _ in HORIZONS}
    seas_cache = {}
    for t in range(t0, len(S.t), step):
        yr = S.t[t][:4]
        if yr not in seas_cache:
            seas_cache[yr] = seasonality(S, t)
        for days, _ in HORIZONS:
            tgt = (_d(S.t[t]) + timedelta(days=days)).isoformat()
            j = S.at_or_after(tgt)
            if j is None or tgt > S.t[-1]:
                continue
            e, s, _ = model(S, t, days, asset, seas_cache[yr])
            pts[days].append((S.t[j], S.lp[j] - S.lp[t], e, s, S.p[t]))
    for days, _ in HORIZONS:
        P = pts[days]
        if len(P) < 20:
            continue
        mae = _mean([abs(math.exp(e) - math.exp(a)) * 100 for _, a, e, s, _ in P])
        mae0 = _mean([abs(math.exp(a) - 1) * 100 for _, a, e, s, _ in P])
        dirs = [(a, e) for _, a, e, s, _ in P if abs(e) > 1e-4]
        dh = sum(1 for a, e in dirs if a * e > 0) / len(dirs) * 100 if dirs else None
        upb = sum(1 for _, a, *_ in P if a > 0) / len(P) * 100
        ratios = sorted(abs(a - e) / s for _, a, e, s, _ in P if s > 0)
        cal = ratios[int(0.68 * (len(ratios) - 1))]
        cov = sum(1 for _, a, e, s, _ in P if abs(a - e) <= s) / len(P) * 100
        # "big call" accuracy: when the model expected a move of more than half a sigma
        big = [(a, e) for _, a, e, s, _ in P if abs(e) > 0.5 * s]
        bh = sum(1 for a, e in big if a * e > 0) / len(big) * 100 if big else None
        out[str(days)] = {"n": len(P), "mae": _r(mae, 2), "mae0": _r(mae0, 2), "dir": _r(dh, 1), "upbase": _r(upb, 1),
                          "cov": _r(cov, 1), "cal": _r(max(0.6, min(3.0, cal)), 2), "big": _r(bh, 1), "nbig": len(big),
                          "from": P[0][0]}
    p30 = [[d, _r(math.exp(a) * p0, 2), _r(math.exp(e) * p0, 2)] for d, a, e, s, p0 in pts[30]][-160:]
    return out, p30


def rsi(p, n=14):
    gains = losses = 0.0
    for i in range(1, n + 1):
        d = p[i] - p[i - 1]
        gains += max(d, 0)
        losses += max(-d, 0)
    ag, al = gains / n, losses / n
    for i in range(n + 1, len(p)):
        d = p[i] - p[i - 1]
        ag = (ag * (n - 1) + max(d, 0)) / n
        al = (al * (n - 1) + max(-d, 0)) / n
    return 100 - 100 / (1 + ag / al) if al else 100.0


def ema(p, n):
    k, out, e = 2 / (n + 1), [], p[0]
    for x in p:
        e = x * k + e * (1 - k)
        out.append(e)
    return out


def trend_read(S, asset):
    t = len(S.p) - 1
    p = S.p
    ppy = S.ppy
    ma20, ma50, ma200 = S.ma[20][t], S.ma[50][t], S.ma[200][t]
    sl = lambda w, k: (S.ma[w][t] / S.ma[w][t - k] - 1) * 100 if S.ma[w][t - k] else None
    s20, s50, s200 = sl(20, 5), sl(50, 10), sl(200, 20)
    tail = p[-400:]
    R = rsi(tail)
    e12, e26 = ema(tail, 12), ema(tail, 26)
    macd = [a - b for a, b in zip(e12, e26)]
    sig = ema(macd, 9)
    hist = macd[-1] - sig[-1]
    hist_prev = macd[-6] - sig[-6]
    yr = p[-ppy:]
    hi52, lo52 = max(yr), min(yr)
    ath = max(p)
    ath_t = S.t[p.index(ath)]

    def er(n):
        seg = p[-n - 1:]
        move = abs(seg[-1] - seg[0])
        path = sum(abs(seg[i] - seg[i - 1]) for i in range(1, len(seg)))
        return move / path if path else 0

    def mom(n):
        return (p[-1] / p[-1 - n] - 1) * 100 if len(p) > n else None
    vol20 = _std(S.ret[-20:]) * math.sqrt(ppy) * 100
    vols = [(_std(S.ret[i - 20:i]) or 0) * math.sqrt(ppy) * 100 for i in range(len(p) - ppy, len(p), 5)]
    vol_pct = sum(1 for v in vols if v < vol20) / len(vols) * 100
    don_n = int(ppy * 55 / 252)
    don_hi, don_lo = max(p[-don_n - 1:-1]), min(p[-don_n - 1:-1])
    breakout = 1 if p[-1] > don_hi else -1 if p[-1] < don_lo else 0
    m1, m3, m6, m12 = mom(int(ppy / 12)), mom(int(ppy / 4)), mom(int(ppy / 2)), mom(ppy)

    def sc(*xs):
        v = sum(0.5 if x else -0.5 for x in xs)
        return max(-2.0, min(2.0, v))
    short = sc(p[-1] > ma20, s20 > 0, R > 50, hist > 0)
    medium = sc(p[-1] > ma50, s50 > 0, m3 > 0, ma20 > ma50)
    long_ = sc(p[-1] > ma200, s200 > 0, m12 > 0, ma50 > ma200)
    signals = []

    def add(tone, en, th):
        signals.append({"tone": tone, "en": en, "th": th})
    if R >= 70:
        add("mid", "RSI %.0f — overbought: rallies this stretched often pause." % R, "RSI %.0f — ซื้อมากเกินไป ราคาที่ยืดขนาดนี้มักพักตัว" % R)
    elif R <= 30:
        add("mid", "RSI %.0f — oversold: bounces are common from here." % R, "RSI %.0f — ขายมากเกินไป มักมีการเด้งกลับจากระดับนี้" % R)
    if hist > 0 and hist_prev <= 0:
        add("good", "MACD just crossed up — short-term momentum turning positive.", "MACD เพิ่งตัดขึ้น แรงส่งระยะสั้นเริ่มเป็นบวก")
    if hist < 0 and hist_prev >= 0:
        add("bad", "MACD just crossed down — short-term momentum turning negative.", "MACD เพิ่งตัดลง แรงส่งระยะสั้นเริ่มเป็นลบ")
    g_now = ma50 > ma200
    g_prev = S.ma[50][t - 10] > S.ma[200][t - 10] if S.ma[200][t - 10] else g_now
    if g_now and not g_prev:
        add("good", "Golden cross: the 50-day average crossed above the 200-day.", "Golden cross: เส้นเฉลี่ย 50 วันตัดขึ้นเหนือ 200 วัน")
    if not g_now and g_prev:
        add("bad", "Death cross: the 50-day average fell below the 200-day.", "Death cross: เส้นเฉลี่ย 50 วันตัดลงใต้ 200 วัน")
    if breakout > 0:
        add("good", "Breakout: closed above its 55-day high.", "เบรกขึ้น: ปิดเหนือจุดสูงสุด 55 วัน")
    if breakout < 0:
        add("bad", "Breakdown: closed below its 55-day low.", "หลุดลง: ปิดต่ำกว่าจุดต่ำสุด 55 วัน")
    dd = (p[-1] / ath - 1) * 100
    if dd > -3:
        add("good", "Within 3% of its all-time high.", "ห่างจุดสูงสุดตลอดกาลไม่ถึง 3%")
    elif dd < -20:
        add("bad", "%.0f%% below its all-time high — a bear-market-sized drop." % dd, "ต่ำกว่าจุดสูงสุดตลอดกาล %.0f%% ขนาดเท่าตลาดหมี" % abs(dd))
    if vol_pct > 85:
        add("mid", "Volatility is in the top 15% of the past year — expect wider swings.", "ความผันผวนอยู่ใน 15% สูงสุดของปี เตรียมรับการแกว่งที่กว้างขึ้น")
    if p[-1] < ma200 and s200 > 0:
        add("mid", "Below the 200-day average while it still rises — a test of the long-term trend.", "ราคาอยู่ใต้เส้น 200 วันขณะที่เส้นยังชี้ขึ้น กำลังทดสอบแนวโน้มระยะยาว")
    if p[-1] > ma200 and s200 < 0:
        add("mid", "Above a falling 200-day average — the long trend has not turned yet.", "ราคาอยู่เหนือเส้น 200 วันที่ยังชี้ลง แนวโน้มระยะยาวยังไม่กลับตัว")
    return {
        "p": _r(p[-1], 2), "t": S.t[-1], "ma20": _r(ma20, 2), "ma50": _r(ma50, 2), "ma200": _r(ma200, 2),
        "s20": _r(s20, 2), "s50": _r(s50, 2), "s200": _r(s200, 2), "rsi": _r(R, 1), "macd": _r(hist, 3), "macd_up": hist > 0,
        "hi52": _r(hi52, 2), "lo52": _r(lo52, 2), "pos52": _r((p[-1] - lo52) / (hi52 - lo52) * 100 if hi52 > lo52 else 50, 0),
        "ath": _r(ath, 2), "ath_t": ath_t, "dd": _r(dd, 1), "er20": _r(er(int(ppy * 20 / 252)), 2), "er60": _r(er(int(ppy * 60 / 252)), 2),
        "vol20": _r(vol20, 1), "vol_pct": _r(vol_pct, 0), "don_hi": _r(don_hi, 2), "don_lo": _r(don_lo, 2), "breakout": breakout,
        "m1": _r(m1, 1), "m3": _r(m3, 1), "m6": _r(m6, 1), "m12": _r(m12, 1),
        "score": {"short": short, "medium": medium, "long": long_}, "signals": signals,
    }


def levels(S, asset):
    """support / resistance from swing points of the last ~18 months, clustered."""
    ppy = S.ppy
    n0 = max(0, len(S.p) - int(ppy * 1.5))
    p, t = S.p, S.t
    W = 8 if asset == "gold" else 10
    piv = []
    for i in range(n0 + W, len(p) - W):
        seg = p[i - W:i + W + 1]
        if p[i] == max(seg):
            piv.append((p[i], t[i], "h"))
        if p[i] == min(seg):
            piv.append((p[i], t[i], "l"))
    tol = 0.015 if asset == "gold" else 0.035
    piv.sort()
    clusters = []
    for v, d, k in piv:
        if clusters and v / clusters[-1]["lo"] - 1 <= tol:
            c = clusters[-1]
            c["v"].append(v)
            c["last"] = max(c["last"], d)
        else:
            clusters.append({"lo": v, "v": [v], "last": d})
    now = p[-1]
    out = [{"p": _r(_mean(c["v"]), 2), "n": len(c["v"]), "last": c["last"]} for c in clusters]
    sup = sorted([x for x in out if x["p"] < now * 0.997], key=lambda x: -x["p"])[:4]
    res = sorted([x for x in out if x["p"] > now * 1.003], key=lambda x: x["p"])[:4]
    # Fibonacci of the last big swing (52-week extreme to extreme, in time order)
    yr = list(range(len(p) - ppy, len(p)))
    ih = max(yr, key=lambda i: p[i])
    il = min(yr, key=lambda i: p[i])
    a, b = (il, ih) if il < ih else (ih, il)
    lo_, hi_ = p[il], p[ih]
    up = il < ih
    fib = [[f, _r(hi_ - (hi_ - lo_) * f if up else lo_ + (hi_ - lo_) * f, 2)] for f in (0.236, 0.382, 0.5, 0.618, 0.786)]
    return {"sup": sup, "res": res, "fib": {"up": up, "from": [t[a], _r(p[a], 2)], "to": [t[b], _r(p[b], 2)], "lv": fib}}


def build_asset(asset, rows, extra):
    ppy = 252 if asset == "gold" else 365
    S = Series(rows, ppy)
    t = len(S.p) - 1
    seas = seasonality(S, t)
    bt, p30 = backtest(S, asset, 2008 if asset == "gold" else 2018)
    fc = []
    for days, lab in HORIZONS:
        e, s, comp = model(S, t, days, asset, seas)
        cal = (bt.get(str(days)) or {}).get("cal", 1.0)
        sc = s * cal
        p0 = S.p[t]
        fc.append({"d": days, "lab": lab, "exp": _r(e, 5), "sig": _r(s, 5), "cal": cal,
                   "mid": _r(p0 * math.exp(e), 2), "lo": _r(p0 * math.exp(e - sc), 2), "hi": _r(p0 * math.exp(e + sc), 2),
                   "lo2": _r(p0 * math.exp(e - 2 * sc), 2), "hi2": _r(p0 * math.exp(e + 2 * sc), 2),
                   "pup": _r(_phi(e / sc) * 100, 1),
                   "p10u": _r((1 - _phi((math.log(1.10) - e) / sc)) * 100, 1), "p10d": _r(_phi((math.log(0.90) - e) / sc) * 100, 1),
                   "comp": {k: _r(v * 100, 2) for k, v in comp.items() if k in ("base", "mom", "mr", "seas", "halv")},
                   "z12": _r(comp["z12"], 2), "z3": _r(comp["z3"], 2)})
    avg, allm, by = seas
    seas_out = [{"m": m, "avg": _r((math.exp(avg[m]) - 1) * 100 if avg.get(m) is not None else None, 2),
                 "up": _r(sum(1 for x in by.get(m, []) if x > 0) / len(by[m]) * 100 if by.get(m) else None, 0), "n": len(by.get(m, []))} for m in range(1, 13)]
    cut3 = (_d(S.t[t]) - timedelta(days=3 * 365 + 30)).isoformat()
    i3 = S.at_or_after(cut3) or 0
    hist_d = [[S.t[i], _r(S.p[i], 2), _r(S.ma[50][i], 2), _r(S.ma[200][i], 2)] for i in range(i3, len(S.t))]
    hist_w, lastwk = [], None
    for i in range(len(S.t)):
        y, w, _ = _d(S.t[i]).isocalendar()
        if (y, w) == lastwk:
            hist_w[-1] = [S.t[i], _r(S.p[i], 2)]
        else:
            hist_w.append([S.t[i], _r(S.p[i], 2)])
            lastwk = (y, w)
    out = {"asset": asset, "ppy": ppy, "last": [S.t[t], _r(S.p[t], 2)], "first": S.t[0], "fc": fc, "bt": bt, "bt30": p30,
           "trend": trend_read(S, asset), "levels": levels(S, asset), "seas": seas_out, "hist_d": hist_d, "hist_w": hist_w}
    out.update(extra(S) if extra else {})
    return out


def halving_cycles(S):
    cyc = []
    for hv in HALVINGS:
        i0 = S.at_or_after(hv)
        if i0 is None or abs((_d(S.t[i0]) - _d(hv)).days) > 5:
            continue      # the 2012 halving predates Yahoo's data
        p0 = S.p[i0]
        pts = []
        for i in range(i0, len(S.t), 7):
            day = (_d(S.t[i]) - _d(hv)).days
            if day > 1460:
                break
            pts.append([day, _r(S.p[i] / p0 * 100, 1)])
        cyc.append({"h": hv, "pts": pts})
    last = HALVINGS[-1]
    return {"cycles": cyc, "now_day": (_d(S.t[-1]) - _d(last)).days, "next": NEXT_HALVING, "last": last}


def ols(y, X):
    """tiny least squares (normal equations, k <= 3)."""
    k = len(X[0])
    XtX = [[sum(r[i] * r[j] for r in X) for j in range(k)] for i in range(k)]
    Xty = [sum(r[i] * yy for r, yy in zip(X, y)) for i in range(k)]
    # Gauss-Jordan
    M = [row[:] + [Xty[i]] for i, row in enumerate(XtX)]
    for c in range(k):
        piv = max(range(c, k), key=lambda r_: abs(M[r_][c]))
        M[c], M[piv] = M[piv], M[c]
        pv = M[c][c] or 1e-12
        M[c] = [v / pv for v in M[c]]
        for r_ in range(k):
            if r_ != c:
                f = M[r_][c]
                M[r_] = [a - f * b for a, b in zip(M[r_], M[c])]
    beta = [M[i][k] for i in range(k)]
    yhat = [sum(b * x for b, x in zip(beta, r)) for r in X]
    my = sum(y) / len(y)
    ss = sum((a - b) ** 2 for a, b in zip(y, yhat))
    st = sum((a - my) ** 2 for a in y)
    return beta, 1 - ss / st if st else 0


def build_px(fred, monthly):
    out, errs = {}, []
    # ---- gold
    try:
        g = yf_daily("GC=F", "2000-01-01")
        gld = yf_daily("GLD", "2015-01-01")
        real = monthly(fred("DFII10"), "mean")
        dol = monthly(fred("DTWEXBGS"), "mean")
        gm = monthly(g)

        def gx(S):
            ks = sorted(k for k in gm if k in real and k in dol)
            y, X = [], []
            for a, b in zip(ks, ks[1:]):
                if b[:4] < "2007":
                    continue
                y.append(math.log(gm[b] / gm[a]))
                X.append([1.0, real[b] - real[a], math.log(dol[b] / dol[a])])
            beta, r2 = ols(y, X)
            # real-yield level chart (weekly, 5y) for the overlay
            rr = [x for x in fred("DFII10") if x[0] >= "%d" % (int(S.t[-1][:4]) - 5)]
            wk, last = [], None
            for d0, v in rr:
                y_, w_, _ = _d(d0).isocalendar()
                if (y_, w_) == last:
                    wk[-1] = [d0, v]
                else:
                    wk.append([d0, v])
                    last = (y_, w_)
            return {"beta": {"real": _r(beta[1], 4), "dollar": _r(beta[2], 3), "r2": _r(r2, 3), "n": len(y)},
                    "real": wk, "gld_last": [gld[-1][0], _r(gld[-1][1], 3)]}
        out["gold"] = build_asset("gold", g, gx)
    except Exception as e:  # noqa: BLE001
        errs.append("gold:%s:%s" % (type(e).__name__, str(e)[:60]))
    # ---- bitcoin
    try:
        b = yf_daily("BTC-USD", "2014-01-01")
        qqq = yf_daily("QQQ", "2018-01-01")

        def bx(S):
            # weekly beta of bitcoin to the Nasdaq-100 over 2 years
            def wk(rows):
                o, last = {}, None
                for d0, v in rows:
                    y_, w_, _ = _d(d0).isocalendar()
                    o[(y_, w_)] = v
                return o
            bw, qw = wk([(S.t[i], S.p[i]) for i in range(len(S.t))]), wk(qqq)
            ks = sorted(k for k in bw if k in qw)[-105:]
            rb = [math.log(bw[ks[i]] / bw[ks[i - 1]]) for i in range(1, len(ks))]
            rq = [math.log(qw[ks[i]] / qw[ks[i - 1]]) for i in range(1, len(ks))]
            mb, mq = _mean(rb), _mean(rq)
            cov = sum((a - mb) * (c - mq) for a, c in zip(rb, rq)) / (len(rb) - 1)
            vq = _std(rq) ** 2
            corr = cov / (_std(rb) * _std(rq))
            return {"beta": {"qqq": _r(cov / vq, 2), "corr": _r(corr, 2), "n": len(rb)}, "halving": halving_cycles(S)}
        out["btc"] = build_asset("btc", b, bx)
    except Exception as e:  # noqa: BLE001
        errs.append("btc:%s:%s" % (type(e).__name__, str(e)[:60]))
    try:
        th = fred("DEXTHUS")
        out["thb"] = [th[-1][0], _r(th[-1][1], 3)]
    except Exception:  # noqa: BLE001
        pass
    out["errors"] = errs
    if not out.get("gold") and not out.get("btc"):
        raise ValueError("no price data: %s" % errs)
    return out
