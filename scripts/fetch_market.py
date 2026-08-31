#!/usr/bin/env python3
"""
SPACEZ TERMINAL — market data snapshot builder.

Runs in GitHub Actions on a schedule, writes data/market.json, which the
terminal page loads on boot. Free data only:
  · yfinance (Yahoo Finance)      → prices + fundamentals, US and SET (.BK)
  · open.er-api.com / frankfurter → FX reference rates

Every symbol is fetched independently: one failure never sinks the file,
and values from the previous snapshot are carried over when a fetch fails.
"""

import json
import os
import sys
import time
from datetime import datetime, timezone

import yfinance as yf
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "market.json")

US = ["JPM", "BAC", "WFC", "C", "GS", "XOM", "CVX", "MMM", "BRK-B", "GM", "F",
      "CVS", "MET", "NVDA", "TSLA", "AMZN", "META", "PLTR", "AMD", "NFLX",
      "SHOP", "MSFT", "GOOGL", "AVGO", "TSM", "CRM", "NOW", "ORCL", "T", "VZ",
      "O", "DUK", "MO", "IBM", "SO", "ABBV", "KMI", "PM", "ENB", "JNJ", "PG",
      "KO", "PEP", "WMT", "COST", "UNH", "PFE", "CL", "MCD", "MDLZ", "KMB",
      "ABT", "SYY", "AAPL", "SPY", "QQQ"]

TH = ["KBANK", "BBL", "SCB", "KTB", "PTT", "SCC", "TOP", "DELTA", "GULF",
      "AOT", "CPALL", "MINT", "ADVANC", "TISCO", "LH", "RATCH", "EGCO", "TTB",
      "PTTEP", "BDMS", "BH", "CPF", "OSP", "TU", "CPAXT"]

FX_CODES = ["USD", "THB", "EUR", "JPY", "GBP", "CNY", "AUD", "CAD", "CHF",
            "SGD", "HKD", "KRW", "TWD", "INR", "MYR", "VND", "AED"]


def page_ticker(sym: str) -> str:
    """Yahoo symbol -> the ticker the page uses."""
    if sym.endswith(".BK"):
        return sym[:-3]
    return sym.replace("-", ".")


def yahoo_symbol(t: str, thai: bool) -> str:
    return (t + ".BK") if thai else t


def pct(v):
    """yfinance gives ratios (0.184) in some versions, percents in others."""
    if v is None:
        return None
    try:
        v = float(v)
    except (TypeError, ValueError):
        return None
    if v != v:            # NaN
        return None
    return round(v * 100.0, 2) if abs(v) <= 1.5 else round(v, 2)


def num(v, nd=2):
    try:
        v = float(v)
    except (TypeError, ValueError):
        return None
    if v != v:
        return None
    return round(v, nd)


def roic_of(tk):
    """Approximate ROIC = NOPAT / (total debt + total equity). Best effort."""
    try:
        fin = tk.financials
        bs = tk.balance_sheet
        if fin is None or bs is None or fin.empty or bs.empty:
            return None

        def row(df, *names):
            for n in names:
                if n in df.index:
                    val = df.loc[n].dropna()
                    if not val.empty:
                        return float(val.iloc[0])
            return None

        ebit = row(fin, "EBIT", "Operating Income", "OperatingIncome")
        pretax = row(fin, "Pretax Income", "Income Before Tax")
        tax = row(fin, "Tax Provision", "Income Tax Expense")
        equity = row(bs, "Stockholders Equity", "Total Stockholder Equity",
                     "Common Stock Equity")
        debt = row(bs, "Total Debt")
        if debt is None:
            ld = row(bs, "Long Term Debt") or 0.0
            sd = row(bs, "Current Debt", "Short Long Term Debt") or 0.0
            debt = ld + sd
        if ebit is None or equity is None:
            return None
        rate = 0.21
        if pretax and tax is not None and pretax != 0:
            r = tax / pretax
            if 0.0 <= r <= 0.6:
                rate = r
        invested = (debt or 0.0) + equity
        if invested <= 0:
            return None
        return round((ebit * (1 - rate)) / invested * 100.0, 2)
    except Exception:
        return None


def fetch_one(sym, thai):
    ysym = yahoo_symbol(sym, thai)
    tk = yf.Ticker(ysym)
    out = {"ccy": "THB" if thai else "USD", "yahoo": ysym}

    # ---- price: history() is the one call that works for stocks and ETFs
    #      alike and hands us the previous close for the day change ----
    try:
        h = tk.history(period="7d", auto_adjust=False)
        if h is not None and not h.empty:
            closes = [float(c) for c in h["Close"].tolist() if c == c]
            if closes:
                out["price"] = num(closes[-1], 4)
            if len(closes) >= 2:
                out["prev"] = num(closes[-2], 4)
    except Exception as e:
        print("  history failed %s: %s" % (ysym, e), file=sys.stderr)

    if not out.get("price"):
        try:
            fi = tk.fast_info
            price = fi.get("last_price") if hasattr(fi, "get") else fi.last_price
            prev = fi.get("previous_close") if hasattr(fi, "get") else fi.previous_close
            cur = fi.get("currency") if hasattr(fi, "get") else None
            if cur:
                out["ccy"] = cur
            if price:
                out["price"] = num(price, 4)
            if prev and not out.get("prev"):
                out["prev"] = num(prev, 4)
        except Exception as e:
            print("  fast_info failed %s: %s" % (ysym, e), file=sys.stderr)

    # ---- fundamentals ----
    try:
        info = tk.get_info() or {}
        out["name"] = info.get("shortName") or info.get("longName")
        pe = info.get("trailingPE") or info.get("forwardPE")
        out["pe"] = num(pe) or None
        if out.get("pe") is not None and out["pe"] <= 0:
            out["pe"] = None
        if not out.get("prev"):
            out["prev"] = num(info.get("previousClose")
                              or info.get("regularMarketPreviousClose"), 4)
        if info.get("currency"):
            out["ccy"] = info["currency"]
        out["roe"] = pct(info.get("returnOnEquity"))
        out["roa"] = pct(info.get("returnOnAssets"))
        de = info.get("debtToEquity")
        if de is not None:
            try:
                de = float(de)
                out["de"] = round(de / 100.0, 2) if de > 5 else round(de, 2)
            except (TypeError, ValueError):
                pass
        out["margin"] = pct(info.get("profitMargins"))
        pb = num(info.get("priceToBook"))
        out["pb"] = pb if (pb and pb > 0) else None

        # Dividend yield: `dividendYield` has flipped between a ratio and a
        # percent across yfinance releases, so derive it from cash instead.
        rate = info.get("dividendRate")
        try:
            rate = float(rate) if rate is not None else None
        except (TypeError, ValueError):
            rate = None
        if rate and out.get("price"):
            out["div"] = round(rate / out["price"] * 100.0, 2)
        else:
            ty = info.get("trailingAnnualDividendYield")
            try:
                ty = float(ty) if ty is not None else None
            except (TypeError, ValueError):
                ty = None
            out["div"] = round(ty * 100.0, 2) if ty else None
        out["hi52"] = num(info.get("fiftyTwoWeekHigh"))
        out["lo52"] = num(info.get("fiftyTwoWeekLow"))
        mc = info.get("marketCap")
        if mc:
            out["mcap"] = int(mc)
        if not out.get("price") and info.get("currentPrice"):
            out["price"] = num(info.get("currentPrice"), 4)
    except Exception as e:
        print("  info failed %s: %s" % (ysym, e), file=sys.stderr)

    if out.get("price") and out.get("prev"):
        out["chg_pct"] = round((out["price"] - out["prev"]) / out["prev"] * 100.0, 2)

    r = roic_of(tk)
    if r is not None:
        out["roic"] = r

    return {k: v for k, v in out.items() if v is not None}


def fetch_fx():
    for url, key in (("https://open.er-api.com/v6/latest/USD", "rates"),
                     ("https://api.frankfurter.dev/v1/latest?base=USD", "rates")):
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                d = json.loads(r.read().decode("utf-8"))
            rates = d.get(key) or {}
            out = {c: round(float(rates[c]), 6) for c in FX_CODES if c in rates}
            out["USD"] = 1.0
            if len(out) > 4:
                return out, url.split("/")[2]
        except Exception as e:
            print("fx failed %s: %s" % (url, e), file=sys.stderr)
    return {}, None


# ---------------------------------------------------------------------------
# Money-flow proxies.
#
# Real fund-flow tape (ICI, EPFR, Lipper) is not free. What IS free is the
# price and volume of the ETFs that money moves through, so the scanner is
# built on two honest observables per instrument:
#   · % price change over 1D / 1W / 1M / 3M / YTD
#   · dollar volume today vs its own 20-day average (crowding)
# Labelled as a proxy everywhere it is shown.
# ---------------------------------------------------------------------------

SECTORS = [
    ("XLK",  "Technology",       "เทคโนโลยี"),
    ("XLF",  "Financials",       "การเงิน"),
    ("XLE",  "Energy",           "พลังงาน"),
    ("XLV",  "Health care",      "สุขภาพ"),
    ("XLY",  "Consumer cyclical","สินค้าฟุ่มเฟือย"),
    ("XLP",  "Consumer staples", "สินค้าจำเป็น"),
    ("XLI",  "Industrials",      "อุตสาหกรรม"),
    ("XLU",  "Utilities",        "สาธารณูปโภค"),
    ("XLB",  "Materials",        "วัสดุ"),
    ("XLRE", "Real estate",      "อสังหาฯ"),
    ("XLC",  "Communication",    "สื่อสาร"),
    ("SMH",  "Semiconductors",   "เซมิคอนดักเตอร์"),
]

ASSETS = [
    ("SPY",     "US large cap",        "หุ้นใหญ่สหรัฐฯ"),
    ("QQQ",     "US tech / Nasdaq",    "เทคสหรัฐฯ / แนสแด็ก"),
    ("IWM",     "US small cap",        "หุ้นเล็กสหรัฐฯ"),
    ("EFA",     "Developed ex-US",     "ตลาดพัฒนาแล้วนอกสหรัฐฯ"),
    ("EEM",     "Emerging markets",    "ตลาดเกิดใหม่"),
    ("TLT",     "Long Treasuries",     "พันธบัตรยาวสหรัฐฯ"),
    ("IEF",     "7-10y Treasuries",    "พันธบัตร 7-10 ปี"),
    ("SHY",     "Short Treasuries",    "พันธบัตรสั้น"),
    ("HYG",     "High-yield credit",   "หุ้นกู้ผลตอบแทนสูง"),
    ("LQD",     "Investment grade",    "หุ้นกู้ระดับลงทุน"),
    ("GLD",     "Gold",                "ทองคำ"),
    ("SLV",     "Silver",              "เงิน"),
    ("DBC",     "Commodities",         "สินค้าโภคภัณฑ์"),
    ("USO",     "Crude oil",           "น้ำมันดิบ"),
    ("BTC-USD", "Bitcoin",             "บิตคอยน์"),
    ("UUP",     "US dollar",           "ดอลลาร์สหรัฐฯ"),
    ("^VIX",    "Volatility (VIX)",    "ความผันผวน (VIX)"),
]

COUNTRIES = [
    ("THD",  "TH", "🇹🇭", "Thailand",     "ไทย"),
    ("EWJ",  "JP", "🇯🇵", "Japan",        "ญี่ปุ่น"),
    ("MCHI", "CN", "🇨🇳", "China",        "จีน"),
    ("EWY",  "KR", "🇰🇷", "South Korea",  "เกาหลีใต้"),
    ("EWT",  "TW", "🇹🇼", "Taiwan",       "ไต้หวัน"),
    ("INDA", "IN", "🇮🇳", "India",        "อินเดีย"),
    ("EWZ",  "BR", "🇧🇷", "Brazil",       "บราซิล"),
    ("EWG",  "DE", "🇩🇪", "Germany",      "เยอรมนี"),
    ("EWU",  "GB", "🇬🇧", "United Kingdom","สหราชอาณาจักร"),
    ("EWA",  "AU", "🇦🇺", "Australia",    "ออสเตรเลีย"),
    ("EWC",  "CA", "🇨🇦", "Canada",       "แคนาดา"),
    ("EWH",  "HK", "🇭🇰", "Hong Kong",    "ฮ่องกง"),
    ("EWS",  "SG", "🇸🇬", "Singapore",    "สิงคโปร์"),
    ("VNM",  "VN", "🇻🇳", "Vietnam",      "เวียดนาม"),
    ("EWM",  "MY", "🇲🇾", "Malaysia",     "มาเลเซีย"),
    ("EIDO", "ID", "🇮🇩", "Indonesia",    "อินโดนีเซีย"),
    ("EPHE", "PH", "🇵🇭", "Philippines",  "ฟิลิปปินส์"),
    ("SPY",  "US", "🇺🇸", "United States","สหรัฐอเมริกา"),
    ("EZU",  "EU", "🇪🇺", "Euro area",    "ยูโรโซน"),
]

# currencies shown on the inflation / currency desk (menu 09)
DESK_CCY = ["USD", "EUR", "JPY", "GBP", "CHF", "CAD", "AUD", "CNY", "KRW",
            "TWD", "THB", "SGD", "MYR", "IDR", "PHP", "VND", "INR", "BRL",
            "MXN", "SAR", "AED", "TRY", "ARS"]


def _ret(closes, back):
    """% change from `back` sessions ago to the latest close."""
    if len(closes) <= back:
        return None
    a, b = closes[-1 - back], closes[-1]
    if not a:
        return None
    return round((b - a) / a * 100.0, 2)


def series_stats(ysym):
    """One history call -> the whole return ladder plus a crowding read."""
    tk = yf.Ticker(ysym)
    h = tk.history(period="1y", auto_adjust=False)
    if h is None or h.empty:
        raise ValueError("no history")
    closes = [float(c) for c in h["Close"].tolist() if c == c]
    if len(closes) < 2:
        raise ValueError("thin history")

    out = {
        "price": num(closes[-1], 4),
        "d1": _ret(closes, 1),
        "w1": _ret(closes, 5),
        "m1": _ret(closes, 21),
        "m3": _ret(closes, 63),
        "m6": _ret(closes, 126),
    }

    # year to date
    try:
        this_year = h.index[-1].year
        ytd_rows = h[h.index.year == this_year]
        if len(ytd_rows) > 1:
            first = float(ytd_rows["Close"].iloc[0])
            if first:
                out["ytd"] = round((closes[-1] - first) / first * 100.0, 2)
    except Exception:
        pass

    # crowding: today's dollar volume against its own 20-day average
    try:
        vol = [float(v) for v in h["Volume"].tolist()]
        dv = [c * v for c, v in zip(closes, vol[-len(closes):]) if v == v]
        if len(dv) > 21 and sum(dv[-21:-1]) > 0:
            avg20 = sum(dv[-21:-1]) / 20.0
            if avg20 > 0:
                out["vol_ratio"] = round(dv[-1] / avg20, 2)
                out["dollar_vol"] = int(dv[-1])
    except Exception:
        pass

    hi = num(h["Close"].max()); lo = num(h["Close"].min())
    if hi and lo and hi > lo:
        out["range_pos"] = round((closes[-1] - lo) / (hi - lo) * 100.0, 1)
    return {k: v for k, v in out.items() if v is not None}


def fetch_flows():
    """Sector / asset-class / country money-flow proxies."""
    groups = {"sector": [], "asset": [], "country": []}

    def add(bucket, sym, row, extra):
        try:
            st = series_stats(sym)
        except Exception as e:
            print("  flow failed %s: %s" % (sym, e), file=sys.stderr)
            return
        st["sym"] = sym
        st.update(extra)
        groups[bucket].append(st)
        time.sleep(0.25)

    for sym, en, th in SECTORS:
        print("[flow/sector] %s" % sym)
        add("sector", sym, None, {"en": en, "th": th})
    for sym, en, th in ASSETS:
        print("[flow/asset] %s" % sym)
        add("asset", sym, None, {"en": en, "th": th})
    for sym, cc, flag, en, th in COUNTRIES:
        print("[flow/country] %s" % sym)
        add("country", sym, None, {"cc": cc, "flag": flag, "en": en, "th": th})

    return groups


def fetch_ccy_moves():
    """Spot vs USD plus 1D / 1M / YTD moves, for the currency desk."""
    out = {}
    for cur in DESK_CCY:
        if cur == "USD":
            out["USD"] = {"rate": 1.0, "d1": 0.0, "m1": 0.0, "ytd": 0.0}
            continue
        try:
            st = series_stats(cur + "=X")     # USD -> CUR
        except Exception as e:
            print("  ccy failed %s: %s" % (cur, e), file=sys.stderr)
            continue
        row = {"rate": st.get("price")}
        # a rise in USDXXX means the local currency weakened: flip the sign so
        # the number reads as "how the currency itself moved"
        for k in ("d1", "m1", "ytd"):
            if st.get(k) is not None:
                row[k] = round(-st[k], 2)
        out[cur] = {k: v for k, v in row.items() if v is not None}
        time.sleep(0.2)
    return out


def main():
    prev = {}
    if os.path.exists(OUT):
        try:
            with open(OUT, encoding="utf-8") as f:
                prev = json.load(f).get("stocks", {})
        except Exception:
            prev = {}

    stocks = {}
    jobs = [(s, False) for s in US] + [(s, True) for s in TH]
    for i, (sym, thai) in enumerate(jobs, 1):
        tkr = page_ticker(yahoo_symbol(sym, thai))
        print("[%d/%d] %s" % (i, len(jobs), tkr))
        try:
            row = fetch_one(sym, thai)
        except Exception as e:
            print("  hard fail %s: %s" % (tkr, e), file=sys.stderr)
            row = {}
        if not row.get("price") and tkr in prev:
            # keep whatever we had rather than dropping the ticker
            merged = dict(prev[tkr])
            merged.update(row)
            merged["stale"] = True
            row = merged
        if row:
            stocks[tkr] = row
        time.sleep(0.35)

    fx, fx_src = fetch_fx()

    try:
        flows = fetch_flows()
    except Exception as e:
        print("flows failed wholesale: %s" % e, file=sys.stderr)
        flows = {"sector": [], "asset": [], "country": []}

    try:
        ccy = fetch_ccy_moves()
    except Exception as e:
        print("ccy moves failed: %s" % e, file=sys.stderr)
        ccy = {}

    payload = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {"quotes": "yahoo finance (yfinance)",
                   "fundamentals": "yahoo finance (yfinance)",
                   "fx": fx_src or "unavailable",
                   "flows": "ETF price + volume proxy (yfinance) — not fund-flow data"},
        "counts": {"stocks": len(stocks), "fx": len(fx),
                   "sector": len(flows.get("sector", [])),
                   "asset": len(flows.get("asset", [])),
                   "country": len(flows.get("country", [])),
                   "ccy": len(ccy)},
        "fx": fx,
        "ccy": ccy,
        "flows": flows,
        "stocks": stocks,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1, sort_keys=True)
    print("wrote %s — %d stocks, %d fx rates, %d flow rows, %d currencies"
          % (OUT, len(stocks), len(fx),
             sum(len(v) for v in flows.values()), len(ccy)))

    if len(stocks) < 10:
        print("too few stocks resolved — failing so the run is visible", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
