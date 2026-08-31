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

    payload = {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "source": {"quotes": "yahoo finance (yfinance)",
                   "fundamentals": "yahoo finance (yfinance)",
                   "fx": fx_src or "unavailable"},
        "counts": {"stocks": len(stocks), "fx": len(fx)},
        "fx": fx,
        "stocks": stocks,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=1, sort_keys=True)
    print("wrote %s — %d stocks, %d fx rates" % (OUT, len(stocks), len(fx)))

    if len(stocks) < 10:
        print("too few stocks resolved — failing so the run is visible", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
