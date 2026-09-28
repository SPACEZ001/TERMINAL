
(function(){
  'use strict';
  if (window.__SPZ_CORREL) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }

  var T = {
    eyebrow:{en:'ASSET CORRELATION MAP',th:'แผนที่ความสัมพันธ์สินทรัพย์'},
    h:{en:'What Moves Together, What Doesn’t',th:'อะไรขยับไปด้วยกัน อะไรไม่ไปด้วยกัน'},
    lede:{en:'How closely 14 sector and asset-class ETFs — plus the S&P 500 itself — have tracked each other week to week. A reading near +1 means two things have moved almost in lockstep; near -1 means they have tended to move opposite each other; near 0 means little relationship at all. This is the same weekly price history the backtest engine already uses, just turned into a map instead of a single number.',
      th:'ETF ตัวแทนกลุ่มอุตสาหกรรมและสินทรัพย์ 14 กลุ่ม บวก S&P 500 เอง เคยขยับตามกันมากแค่ไหนในแต่ละสัปดาห์ ค่าใกล้ +1 แปลว่าสองอย่างขยับไปด้วยกันเกือบตลอด ค่าใกล้ -1 แปลว่ามักขยับสวนทางกัน ค่าใกล้ 0 แปลว่าแทบไม่เกี่ยวกัน ข้อมูลชุดเดียวกับที่เครื่องมือ backtest ใช้อยู่แล้ว แค่เอามาทำเป็นแผนที่แทนตัวเลขเดียว'},
    win52:{en:'1 year',th:'1 ปี'}, win156:{en:'3 years',th:'3 ปี'},
    win260:{en:'5 years',th:'5 ปี'}, win0:{en:'All history',th:'ทั้งหมด'},
    topPairH:{en:'MOST TIED TOGETHER',th:'ผูกกันแน่นที่สุด'},
    oppPairH:{en:'MOST OPPOSITE',th:'สวนทางกันที่สุด'},
    diversH:{en:'BEST DIVERSIFIER vs S&P 500',th:'กระจายความเสี่ยงจาก S&P 500 ได้ดีที่สุด'},
    together:{en:'tend to move together',th:'มักขยับไปด้วยกัน'},
    tiedFmt:{en:'{a} and {b} — correlation {v} over {n} weeks',th:'{a} กับ {b} — สหสัมพันธ์ {v} จาก {n} สัปดาห์'},
    diversFmt:{en:'{a} — correlation {v} to S&P 500 over {n} weeks',th:'{a} — สหสัมพันธ์ {v} กับ S&P 500 จาก {n} สัปดาห์'},
    pickHint:{en:'Click any square for the plain-language read.',th:'คลิกช่องไหนก็ได้เพื่ออ่านคำอธิบายแบบง่าย'},
    guideH:{en:'WHAT THIS IS, AND HOW TO READ IT',th:'หน้านี้คืออะไร แล้วอ่านยังไง'},
    guideBody:{
      en:'Every square below compares the asset on that row against the asset in that column — using the ticker at the top (SPY, XLK, GLD, …) and the same ticker on the left. The number inside, from -1 to +1, says how closely their weekly price moves have tracked each other over the window you pick above. Color does the same job as the number: deep green means the two have moved together almost every week; deep red means one has tended to rise while the other fell; a dull grey square near 0 means the two barely relate at all. Why this matters for you: if you already hold something and add more of a deep-green neighbor, you have not really spread your risk — both tend to fall on the same bad week. Adding something deep red, or near 0, does spread it, because a bad week for one is not usually a bad week for the other. Click any square to get the one-sentence plain-language version, or use the window buttons to see whether a relationship has held over the last year, three years, five years, or the whole history.',
      th:'ทุกช่องด้านล่างคือการเทียบสินทรัพย์ในแถวนั้นกับสินทรัพย์ในคอลัมน์นั้น — ดูจากตัวย่อแถวบน (SPY, XLK, GLD, …) กับตัวย่อเดียวกันทางซ้าย ตัวเลขในช่อง ตั้งแต่ -1 ถึง +1 บอกว่าราคาทั้งสองขยับตามกันมากแค่ไหนในแต่ละสัปดาห์ ตลอดช่วงเวลาที่เลือกไว้ด้านบน สีก็บอกเรื่องเดียวกับตัวเลข: เขียวเข้มแปลว่าสองอย่างขยับไปด้วยกันแทบทุกสัปดาห์ แดงเข้มแปลว่าตัวหนึ่งมักขึ้นตอนอีกตัวลง ส่วนช่องสีเทาหม่นใกล้ 0 แปลว่าแทบไม่เกี่ยวกันเลย ทำไมเรื่องนี้ถึงสำคัญ: ถ้าคุณถืออะไรอยู่แล้วไปเพิ่มตัวที่เขียวเข้มกับมัน แปลว่ายังไม่ได้กระจายความเสี่ยงจริง เพราะสัปดาห์แย่ของตัวหนึ่งมักเป็นสัปดาห์แย่ของอีกตัวด้วย แต่ถ้าเพิ่มตัวที่แดงเข้มหรือใกล้ 0 นั่นคือกระจายความเสี่ยงจริง เพราะสัปดาห์แย่ของตัวหนึ่งมักไม่ใช่สัปดาห์แย่ของอีกตัว คลิกช่องไหนก็ได้เพื่ออ่านคำอธิบายแบบง่ายทีละคู่ หรือกดปุ่มช่วงเวลาด้านบนเพื่อดูว่าความสัมพันธ์นี้คงที่ไหมในรอบ 1 ปี 3 ปี 5 ปี หรือทั้งหมด'
    },
    legOpp:{en:'−1 · move opposite',th:'−1 · สวนทางกัน'},
    legTogether:{en:'+1 · move together',th:'+1 · ไปด้วยกัน'},
    strong:{en:'strong tie — these have moved almost in lockstep',th:'ผูกกันแน่น — ขยับไปทางเดียวกันแทบตลอด'},
    mod:{en:'moderate tie — these tend to lean the same direction',th:'ผูกกันปานกลาง — มักเอียงไปทิศทางเดียวกัน'},
    weak:{en:'little relationship — knowing one tells you almost nothing about the other',th:'แทบไม่เกี่ยวกัน — รู้ตัวหนึ่งแทบไม่ช่วยเดาอีกตัว'},
    inv:{en:'tend to offset each other — one often rises while the other falls',th:'มักสวนทางกัน — ตัวหนึ่งขึ้นอีกตัวมักลง'},
    detailFmt:{en:'{a} vs {b}: correlation {v} over {n} weekly returns — {read}.',
      th:'{a} เทียบ {b}: สหสัมพันธ์ {v} จากผลตอบแทนรายสัปดาห์ {n} จุด — {read}'},
    self:{en:'Same instrument.',th:'เป็นตัวเดียวกัน'},
    na:{en:'Not enough overlapping history yet.',th:'ประวัติที่ทับกันยังไม่พอ'},
    empty:{en:'Not enough shared weekly history to compute this window yet.',th:'ประวัติรายสัปดาห์ที่ทับกันยังไม่พอสำหรับช่วงนี้'},
    waiting:{en:'Loading backtest history…',th:'กำลังโหลดข้อมูลย้อนหลัง…'},
    noFile:{en:'Backtest data isn’t available right now — try again after the next daily refresh.',
      th:'ยังดึงข้อมูล backtest ไม่ได้ตอนนี้ — ลองใหม่หลังรอบรีเฟรชถัดไป'},
    foot:{en:'Correlation is computed from weekly % changes and looks backward only — it shifts over time and is not a promise that two assets will keep moving the same way. A useful diversifier today can stop being one tomorrow. Educational use only, not investment advice.',
      th:'สหสัมพันธ์คำนวณจากเปอร์เซ็นต์การเปลี่ยนแปลงรายสัปดาห์ และมองย้อนหลังเท่านั้น — ค่านี้เปลี่ยนไปตามเวลา ไม่ได้การันตีว่าสองสินทรัพย์จะขยับแบบเดิมต่อไป ตัวที่กระจายความเสี่ยงได้ดีวันนี้ อาจไม่ใช่พรุ่งนี้ก็ได้ ใช้เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน'},
    exH:{en:'TRY IT: A WORKED EXAMPLE',th:'ตัวอย่าง: ลองอ่านดู'},
    exNote:{en:'Made-up numbers for teaching only — not real data. Read them the same way as the real map below.',
      th:'ตัวเลขสมมติเพื่อสอนเท่านั้น ไม่ใช่ข้อมูลจริง — อ่านด้วยวิธีเดียวกับแผนที่จริงด้านล่าง'},
    exTechA:{en:'Tech A',th:'หุ้นเทคฯ A'}, exTechB:{en:'Tech B',th:'หุ้นเทคฯ B'},
    exGold:{en:'Gold',th:'ทองคำ'}, exBonds:{en:'Bonds',th:'พันธบัตร'},
    exCap1:{en:'Tech A × Tech B = .88, deep green: two tech names that moved together almost every week — holding both barely spreads your risk.',
      th:'หุ้นเทคฯ A × หุ้นเทคฯ B = .88 เขียวเข้ม — สองตัวนี้ขยับไปทางเดียวกันแทบทุกสัปดาห์ ถือทั้งคู่แทบไม่ได้กระจายความเสี่ยงเลย'},
    exCap2:{en:'Tech A × Bonds = -.55, red: these tended to move opposite each other — holding both can cushion a stock sell-off.',
      th:'หุ้นเทคฯ A × พันธบัตร = -.55 สีแดง — สองตัวนี้มักสวนทางกัน ถือคู่กันช่วยพยุงพอร์ตตอนหุ้นร่วง'},
    exCap3:{en:'Tech A × Gold = .05, dull grey: barely related — a genuine diversifier for a tech-heavy portfolio.',
      th:'หุ้นเทคฯ A × ทองคำ = .05 สีเทาหม่น — แทบไม่เกี่ยวกันเลย เป็นตัวกระจายความเสี่ยงที่แท้จริงสำหรับพอร์ตที่มีหุ้นเทคฯ เยอะ'},
    exDemoLbl:{en:'WATCH: READING A ROW AGAINST A COLUMN',th:'ดูตัวอย่าง: อ่านแถวเทียบกับคอลัมน์'},
    exDemoFmt:{en:'Follow the <b>{row}</b> row (left side) across, and the <b>{col}</b> column (top) down — they meet at the highlighted square: <b>{v}</b> ({read}). Same name can sit in a row AND a column; you always read row → across, column → down, and the number where they cross is the answer.',
      th:'ลากตามแถว <b>{row}</b> (ทางซ้าย) ไปทางขวา แล้วลากตามคอลัมน์ <b>{col}</b> (ด้านบน) ลงมา — สองเส้นจะมาเจอกันที่ช่องที่ไฮไลต์: <b>{v}</b> ({read}) ชื่อเดียวกันจะโผล่ทั้งแถวและคอลัมน์ได้ แต่หลักการอ่านคือ แถว → ลากไปทางขวา, คอลัมน์ → ลากลงมา แล้วตัวเลขตรงจุดตัดคือคำตอบ'},
    exPickRow:{en:'Row',th:'แถว'}, exPickCol:{en:'Column',th:'คอลัมน์'},
    exPickHint:{en:'Or pick your own two to compare:',th:'หรือเลือกสองตัวเปรียบเทียบเองก็ได้:'},
    exDemoSelf:{en:'That’s the same asset in both — pick two different ones to compare.',
      th:'อันนี้เป็นตัวเดียวกันทั้งแถวและคอลัมน์ — เลือกสองตัวที่ต่างกันเพื่อเปรียบเทียบ'},
    netLive:{en:'LIVE',th:'สด'},
    statusH:{en:'CURRENT MARKET STATUS, FROM THIS MAP',th:'สรุปสถานะตลาดตอนนี้ จากแผนที่นี้'},
    statusHigh:{en:'Correlation is running high right now ({v} average) — most tracked assets have been moving as one block rather than going their own ways. This usually shows up when the whole market is fearful or euphoric at once. Spreading money across several of these assets buys you less protection than usual until this cools off.',
      th:'ตอนนี้สหสัมพันธ์เฉลี่ยอยู่ในระดับสูง ({v}) — สินทรัพย์ที่ติดตามส่วนใหญ่ขยับไปเป็นก้อนเดียวกันมากกว่าจะแยกทางกัน มักเกิดตอนตลาดกลัวหรือดีใจพร้อมกันทั้งกระดาน การกระจายเงินไปหลายสินทรัพย์ตอนนี้ช่วยป้องกันความเสี่ยงได้น้อยกว่าปกติ จนกว่าจะคลายตัวลง'},
    statusMod:{en:'Correlation is at a middling level right now ({v} average) — some groups are moving together, others are clearly going their own way. There is still real room to reduce risk by choosing the right mix.',
      th:'ตอนนี้สหสัมพันธ์เฉลี่ยอยู่ระดับปานกลาง ({v}) — บางกลุ่มขยับไปด้วยกัน บางกลุ่มแยกทางกันชัดเจน ยังพอกระจายความเสี่ยงได้จริงถ้าเลือกสัดส่วนให้เหมาะ'},
    statusLow:{en:'Correlation is running low right now ({v} average) — each group has mostly been moving on its own drivers rather than following the market as a whole. This is the kind of environment where picking the right sector or stock matters more than guessing the market’s overall direction.',
      th:'ตอนนี้สหสัมพันธ์เฉลี่ยอยู่ในระดับต่ำ ({v}) — แต่ละกลุ่มขยับตามปัจจัยของตัวเองมากกว่าจะตามตลาดโดยรวม เป็นช่วงที่การเลือกกลุ่ม/หุ้นให้ถูกมีผลมากกว่าการเดาทิศทางรวมของตลาด'},
    statusPairs:{en:'{a} of {t} pairs are tightly bound (≥0.70) · {b} pairs are near-independent (≤0.20)',
      th:'{a} จาก {t} คู่ ผูกกันแน่นมาก (≥0.70) · {b} คู่ แทบไม่เกี่ยวกันเลย (≤0.20)'},
    netH:{en:'RELATIONSHIP NETWORK (LIVE, MOVES ON ITS OWN)',th:'แผนที่เครือข่ายความสัมพันธ์ (เคลื่อนไหวได้)'},
    netHint:{en:'The same numbers as the grid above, drawn as a living map: assets that behave alike drift close together, assets that move opposite drift apart, and a line only appears between two assets tied closely enough to matter (0.35 or stronger) — green for together, red for opposite, thicker and darker for a stronger tie. Drag any circle to move it; hover or click one to see what it is tied to, and what it isn’t.',
      th:'ตัวเลขชุดเดียวกับตารางด้านบน แต่วาดเป็นแผนที่ที่มีชีวิต — สินทรัพย์ที่ขยับคล้ายกันจะลอยเข้าใกล้กัน ตัวที่ขยับสวนทางจะลอยห่างกัน และจะมีเส้นเชื่อมก็ต่อเมื่อสองตัวผูกกันมากพอ (ตั้งแต่ 0.35 ขึ้นไป) — เขียวคือไปด้วยกัน แดงคือสวนทางกัน เส้นยิ่งหนา/เข้ม ยิ่งผูกกันแน่น ลากวงกลมไหนก็ได้เพื่อขยับดู ชี้หรือคลิกวงกลมไหนก็ได้เพื่อดูว่ามันผูกกับอะไร และไม่ผูกกับอะไร'},
    netDefault:{en:'Hover or click any circle above to see what it is most tied to, and most independent from.',
      th:'ชี้หรือคลิกวงกลมไหนก็ได้ด้านบน เพื่อดูว่ามันผูกกับอะไรมากที่สุด และเป็นอิสระจากอะไรมากที่สุด'},
    netInfoFmt:{en:'<b>{n}</b> — closest to: {a} ({av}), {b} ({bv}) · most opposite: {c} ({cv})',
      th:'<b>{n}</b> — ใกล้เคียงที่สุดกับ: {a} ({av}), {b} ({bv}) · สวนทางที่สุดกับ: {c} ({cv})'}
  };

  var WINDOWS = [52, 156, 260, 0];
  var state = { win:156, data:null, tried:false, sel:null };
  var net = { raf:null, canvas:null, ctx:null, nodes:[], edges:[], hover:-1, pin:-1, dragging:-1, dragMoved:false, t:0 };
  var liveSnap = null;
  /* individual stocks folded into the map alongside the sector ETFs, at the
     user's request — resampled to weekly (see isoWeek/stockWeeklySeries)
     so they line up with the ETFs' already-weekly history */
  var STOCKS = ['NVDA', 'JPM', 'TISCO'];

  /* first trading day found per ISO week, matching the same convention the
     backtest job already uses server-side to build the ETF weekly series */
  function isoWeek(ds){
    var d = new Date(ds + 'T00:00:00Z');
    var day = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - day + 3);
    var firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
    var fDay = (firstThu.getUTCDay() + 6) % 7;
    firstThu.setUTCDate(firstThu.getUTCDate() - fDay + 3);
    var wk = 1 + Math.round((d - firstThu) / 6.048e8);
    return d.getUTCFullYear() + '-W' + (wk < 10 ? '0' : '') + wk;
  }

  function stockWeeklySeries(snap, tk){
    if (!snap || !snap.stocks || !snap.charts || !snap.charts.cal) return null;
    var row = snap.stocks[tk];
    if (!row || !row.c || !row.cal || !snap.charts.cal[row.cal]) return null;
    var days = snap.charts.cal[row.cal].split(',');
    var raw = row.c.split(',');
    var out = [], seenWk = null;
    for (var i = 0; i < raw.length && i < days.length; i++) {
      if (raw[i] === '') continue;
      var n = parseFloat(raw[i]);
      if (!(n > 0)) continue;
      var wk = isoWeek(days[i]);
      if (wk !== seenWk) { out.push([days[i], n]); seenWk = wk; }
    }
    return out.length >= 60 ? out : null;
  }

  function fetchData(){
    if (state.data || state.tried) return;
    state.tried = true;
    fetch('data/backtest.json?v=' + Math.floor(Date.now() / 3.6e6))
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ state.data = d || false; paint(); })
      .catch(function(){ state.data = false; paint(); });
  }

  /* ---- build the symbol list: sector ETFs + SPY (+ SET if present) ---- */
  function symbols(){
    var d = state.data; if (!d) return [];
    var out = [];
    var sec = d.sectors || {};
    Object.keys(sec).forEach(function(sym){
      if (sec[sym] && sec[sym].s && sec[sym].s.length >= 60) {
        out.push({ sym:sym, en:sec[sym].en, th:sec[sym].th, s:sec[sym].s });
      }
    });
    if ((d.bench_series || []).length >= 60) {
      out.push({ sym:'SPY', en:'S&P 500', th:'S&P 500', s:d.bench_series });
    }
    STOCKS.forEach(function(tk){
      var ws = stockWeeklySeries(liveSnap, tk);
      if (!ws) return;
      var row = liveSnap.stocks[tk];
      var nm = (row && row.name) || tk;
      nm = nm.replace(/^[A-Za-z0-9.]+_/, '');
      out.push({ sym:tk, en:nm, th:nm, s:ws });
    });
    out.sort(function(a,b){ return a.sym === 'SPY' ? -1 : b.sym === 'SPY' ? 1 : a.sym.localeCompare(b.sym); });
    return out;
  }

  function windowed(s){
    if (!state.win) return s;
    return s.length > state.win ? s.slice(s.length - state.win) : s;
  }

  /* keyed by ISO week (not the raw date) so a US-calendar ETF and a
     Thai-calendar stock that traded on different days of the same week
     still line up when corr() matches return series by key */
  function returnsOf(s){
    var w = windowed(s), out = [];
    for (var i = 1; i < w.length; i++) {
      var a = w[i - 1][1], b = w[i][1];
      if (a) out.push([isoWeek(w[i][0]), (b - a) / a * 100]);
    }
    return out;
  }

  function corr(a, b){
    var mb = {}; b.forEach(function(p){ mb[p[0]] = p[1]; });
    var xa = [], xb = [];
    a.forEach(function(p){ if (mb[p[0]] !== undefined) { xa.push(p[1]); xb.push(mb[p[0]]); } });
    var n = xa.length;
    if (n < 20) return { v:null, n:n };
    var ma = xa.reduce(function(s,v){ return s+v; },0) / n;
    var mbv = xb.reduce(function(s,v){ return s+v; },0) / n;
    var sxy=0, sxx=0, syy=0;
    for (var i=0;i<n;i++){ var dx=xa[i]-ma, dy=xb[i]-mbv; sxy+=dx*dy; sxx+=dx*dx; syy+=dy*dy; }
    if (!sxx || !syy) return { v:null, n:n };
    return { v: sxy / Math.sqrt(sxx*syy), n:n };
  }

  function buildMatrix(){
    var syms = symbols();
    var rets = syms.map(function(s){ return returnsOf(s.s); });
    var M = syms.map(function(){ return new Array(syms.length).fill(null); });
    for (var i=0;i<syms.length;i++){
      for (var j=i;j<syms.length;j++){
        if (i === j) { M[i][j] = { v:1, n:rets[i].length }; continue; }
        var c = corr(rets[i], rets[j]);
        M[i][j] = c; M[j][i] = c;
      }
    }
    return { syms:syms, M:M };
  }

  function corrColor(v){
    if (v === null) return 'rgba(255,255,255,.04)';
    var t = Math.max(-1, Math.min(1, v));
    if (t >= 0) return 'rgba(48,209,88,' + (0.14 + 0.55 * t) + ')';
    return 'rgba(255,69,58,' + (0.14 + 0.55 * -t) + ')';
  }

  function readOf(v){
    if (v === null) return null;
    if (v >= 0.7) return T.strong;
    if (v >= 0.4) return T.mod;
    if (v <= -0.4) return T.inv;
    return T.weak;
  }

  function calloutsHTML(mx){
    var syms = mx.syms, M = mx.M;
    var best = null, worst = null;
    var spyIx = -1;
    syms.forEach(function(s, i){ if (s.sym === 'SPY') spyIx = i; });
    var diversify = null;
    for (var i=0;i<syms.length;i++){
      for (var j=i+1;j<syms.length;j++){
        var c = M[i][j];
        if (!c || c.v === null) continue;
        if (!best || c.v > best.v) best = { i:i, j:j, v:c.v, n:c.n };
        if (!worst || c.v < worst.v) worst = { i:i, j:j, v:c.v, n:c.n };
      }
      if (spyIx !== -1 && i !== spyIx) {
        var cs = M[i][spyIx];
        if (cs && cs.v !== null && (!diversify || cs.v < diversify.v)) diversify = { i:i, v:cs.v, n:cs.n };
      }
    }
    function nameOf(ix){ return esc(tx(syms[ix])); }
    var cards = [];
    if (best) cards.push('<div class="cm-card"><div class="cm-cl">' + esc(tx(T.topPairH)) + '</div>' +
      '<div class="cm-cv">' + nameOf(best.i) + ' × ' + nameOf(best.j) + '<br><b class="up">' +
      sgn(best.v * 100, 0).replace('+', '') + '%</b></div></div>');
    if (worst) cards.push('<div class="cm-card"><div class="cm-cl">' + esc(tx(T.oppPairH)) + '</div>' +
      '<div class="cm-cv">' + nameOf(worst.i) + ' × ' + nameOf(worst.j) + '<br><b class="' +
      (worst.v < 0 ? 'dn' : 'up') + '">' + sgn(worst.v * 100, 0) + '%</b></div></div>');
    if (diversify) cards.push('<div class="cm-card"><div class="cm-cl">' + esc(tx(T.diversH)) + '</div>' +
      '<div class="cm-cv">' + nameOf(diversify.i) + '<br><b class="' +
      (diversify.v < 0 ? 'dn' : 'up') + '">' + sgn(diversify.v * 100, 0) + '%</b></div></div>');
    return cards.length ? '<div class="cm-call">' + cards.join('') + '</div>' : '';
  }

  function gridHTML(mx){
    var syms = mx.syms, M = mx.M;
    if (syms.length < 3) return '<div class="ss-empty">' + esc(tx(T.empty)) + '</div>';
    var head = '<tr><th></th>' + syms.map(function(s){ return '<th>' + esc(s.sym) + '</th>'; }).join('') + '</tr>';
    var rows = syms.map(function(rs, i){
      return '<tr><th class="cm-rowh">' + esc(rs.sym) + '</th>' +
        syms.map(function(cs, j){
          var c = M[i][j];
          if (i === j) return '<td class="cm-cell cm-self" title="' + esc(tx(T.self)) + '"></td>';
          if (!c || c.v === null) return '<td class="cm-cell cm-na" data-cm-i="' + i + '" data-cm-j="' + j + '">—</td>';
          return '<td class="cm-cell" data-cm-i="' + i + '" data-cm-j="' + j +
            '" style="background:' + corrColor(c.v) + '">' + c.v.toFixed(2).replace(/^0\./, '.') + '</td>';
        }).join('') + '</tr>';
    }).join('');
    return '<div class="cm-tablewrap"><table class="cm-grid">' + head + rows + '</table>' +
      '<div class="cm-legend"><span>' + esc(tx(T.legOpp)) + '</span><span class="cm-legbar"></span><span>' +
      esc(tx(T.legTogether)) + '</span>' +
      '<span style="margin-left:10px;">' + esc(tx(T.pickHint)) + '</span></div></div>';
  }

  function detailHTML(mx){
    if (!state.sel) return '';
    var syms = mx.syms, M = mx.M;
    var i = state.sel.i, j = state.sel.j;
    if (!syms[i] || !syms[j]) return '';
    var c = M[i][j];
    var read = c && c.v !== null ? tx(readOf(c.v)) : tx(T.na);
    var v = c && c.v !== null ? c.v.toFixed(2) : '—';
    return '<div class="cm-detail">' + esc(tx(T.detailFmt)
      .replace('{a}', tx(syms[i])).replace('{b}', tx(syms[j]))
      .replace('{v}', v).replace('{n}', c ? c.n : 0).replace('{read}', read)) + '</div>';
  }

  function pillsHTML(){
    return WINDOWS.map(function(w){
      return '<button type="button" class="ss-pill' + (state.win === w ? ' on' : '') +
        '" data-cm-w="' + w + '">' + esc(tx(T['win' + w])) + '</button>';
    }).join('');
  }

  var sec = null;

  function guideHTML(){
    return '<div class="cm-card" style="flex:1 1 100%;margin-bottom:18px;">' +
      '<div class="cm-cl">' + esc(tx(T.guideH)) + '</div>' +
      '<div class="cm-cv" style="font-weight:400;font-size:12.5px;line-height:1.75;color:var(--grey);">' +
      esc(tx(T.guideBody)) + '</div></div>';
  }

  /* ---- a small, fixed, made-up example — same visual grammar as the real
     grid, so the reader learns the format on numbers that can't surprise
     them before meeting the real (larger, noisier) one below. Kept at
     module scope (not local to exampleHTML) so mountExampleDemo() below
     can drive the same data as an animated row/column walkthrough ---- */
  var EX = [
    { k:'techA', t:T.exTechA }, { k:'techB', t:T.exTechB },
    { k:'gold', t:T.exGold }, { k:'bonds', t:T.exBonds }
  ];
  var EX_VALS = {
    'techA|techB':0.88, 'techA|gold':0.05, 'techA|bonds':-0.55,
    'techB|gold':0.10, 'techB|bonds':-0.48, 'gold|bonds':0.20
  };
  function exVOf(a, b){
    if (a === b) return 1;
    var k1 = a + '|' + b, k2 = b + '|' + a;
    return EX_VALS[k1] !== undefined ? EX_VALS[k1] : EX_VALS[k2];
  }
  function exFmt(v){ return (v < 0 ? '-' : '') + Math.abs(v).toFixed(2).replace(/^0\./, '.'); }
  function exNameOf(k){ var f = EX.filter(function(e){ return e.k === k; })[0]; return f ? tx(f.t) : k; }
  function exSelHTML(dataCm, def){
    return '<select class="ctl-select" data-cm="' + dataCm + '">' + EX.map(function(e){
      return '<option value="' + e.k + '"' + (e.k === def ? ' selected' : '') + '>' + esc(tx(e.t)) + '</option>';
    }).join('') + '</select>';
  }

  function exampleHTML(){
    var head = '<tr><th></th>' + EX.map(function(e){
      return '<th data-excol="' + e.k + '">' + esc(tx(e.t)) + '</th>';
    }).join('') + '</tr>';
    var rows = EX.map(function(re){
      return '<tr><th class="cm-rowh" data-exrow="' + re.k + '">' + esc(tx(re.t)) + '</th>' +
        EX.map(function(ce){
          if (re.k === ce.k) return '<td class="cm-ex-cell cm-self" data-excell="' + re.k + '|' + ce.k + '"></td>';
          var v = exVOf(re.k, ce.k);
          return '<td class="cm-ex-cell" data-excell="' + re.k + '|' + ce.k + '" style="background:' +
            corrColor(v) + '">' + exFmt(v) + '</td>';
        }).join('') + '</tr>';
    }).join('');
    function sw(v){ return '<span class="cm-ex-sw" style="background:' + corrColor(v) + '"></span>'; }
    return '<div class="cm-ex-wrap">' +
      '<div class="cm-cl">' + esc(tx(T.exH)) + '</div>' +
      '<div style="font-size:11.5px;color:var(--grey-dim);margin-bottom:10px;">' + esc(tx(T.exNote)) + '</div>' +
      '<div class="cm-tablewrap" style="display:inline-flex;">' +
        '<table class="cm-ex-grid" data-cm="exgrid">' + head + rows + '</table></div>' +
      '<div class="cm-ex-demo" data-cm="exdemo">' +
        '<div class="cm-ex-demo-lbl">' + esc(tx(T.exDemoLbl)) + '</div>' +
        '<div class="cm-ex-pick">' +
          '<span class="cm-ex-pick-hint">' + esc(tx(T.exPickHint)) + '</span>' +
          '<label>' + esc(tx(T.exPickRow)) + exSelHTML('exrowsel', 'techA') + '</label>' +
          '<span class="cm-ex-pick-x">×</span>' +
          '<label>' + esc(tx(T.exPickCol)) + exSelHTML('excolsel', 'techB') + '</label>' +
        '</div>' +
        '<div class="cm-ex-demo-cap" data-cm="exdemocap"></div>' +
      '</div>' +
      '<div class="cm-ex-cap">' + sw(0.88) + '<span>' + esc(tx(T.exCap1)) + '</span></div>' +
      '<div class="cm-ex-cap">' + sw(-0.55) + '<span>' + esc(tx(T.exCap2)) + '</span></div>' +
      '<div class="cm-ex-cap">' + sw(0.05) + '<span>' + esc(tx(T.exCap3)) + '</span></div>' +
    '</div>';
  }

  /* ---- animates the worked example: walks a row out, a column down, and
     lands on the cell where they meet, one pair at a time, with a plain
     sentence explaining the crossing — this is the direct answer to "how
     do I compare when the same name is in both a row and a column" ---- */
  /* auto-cycles until the reader picks their own pair from the two
     dropdowns below the grid, at which point auto-cycling stops and that
     exact pair stays highlighted (see bind()) */
  var exDemo = { iv:null, seq:['techA|techB','techA|bonds','techA|gold','gold|bonds'], idx:0, manual:false, rk:'techA', ck:'techB' };

  function stopExampleDemo(){
    if (exDemo.iv) { clearInterval(exDemo.iv); exDemo.iv = null; }
  }

  function exDemoRender(rk, ck){
    var grid = sec && sec.querySelector('[data-cm="exgrid"]');
    var cap = sec && sec.querySelector('[data-cm="exdemocap"]');
    if (!grid || !cap) { stopExampleDemo(); return; }
    grid.querySelectorAll('.cm-ex-hi-row,.cm-ex-hi-col,.cm-ex-hi-cell').forEach(function(el){
      el.classList.remove('cm-ex-hi-row', 'cm-ex-hi-col', 'cm-ex-hi-cell');
    });
    var rowTh = grid.querySelector('[data-exrow="' + rk + '"]');
    var colTh = grid.querySelector('[data-excol="' + ck + '"]');
    var cell = grid.querySelector('[data-excell="' + rk + '|' + ck + '"]') ||
      grid.querySelector('[data-excell="' + ck + '|' + rk + '"]');
    if (rowTh) rowTh.classList.add('cm-ex-hi-row');
    if (colTh) colTh.classList.add('cm-ex-hi-col');
    if (cell) cell.classList.add('cm-ex-hi-cell');
    if (rk === ck) { cap.textContent = tx(T.exDemoSelf); return; }
    var v = exVOf(rk, ck);
    var read = tx(readOf(v)) || '';
    cap.innerHTML = tx(T.exDemoFmt)
      .replace('{row}', esc(exNameOf(rk))).replace('{col}', esc(exNameOf(ck)))
      .replace('{v}', exFmt(v)).replace('{read}', esc(read));
  }

  function exDemoSyncSelects(){
    var rs = sec && sec.querySelector('[data-cm="exrowsel"]');
    var cs = sec && sec.querySelector('[data-cm="excolsel"]');
    if (rs) rs.value = exDemo.rk;
    if (cs) cs.value = exDemo.ck;
  }

  function exDemoTick(){
    if (exDemo.manual) { exDemoRender(exDemo.rk, exDemo.ck); return; }
    var pair = exDemo.seq[exDemo.idx % exDemo.seq.length];
    exDemo.idx++;
    var parts = pair.split('|');
    exDemo.rk = parts[0]; exDemo.ck = parts[1];
    exDemoRender(exDemo.rk, exDemo.ck);
    exDemoSyncSelects();
  }

  function mountExampleDemo(){
    stopExampleDemo();
    exDemo.idx = 0;
    exDemo.manual = false;
    exDemoTick();
    exDemo.iv = setInterval(exDemoTick, 2600);
  }

  /* ---- one-paragraph reading of the live matrix: average |correlation|
     across every pair, bucketed into plain language ---- */
  function statusHTML(mx){
    var syms = mx.syms, M = mx.M;
    var vals = [], tight = 0, loose = 0;
    for (var i = 0; i < syms.length; i++) {
      for (var j = i + 1; j < syms.length; j++) {
        var c = M[i][j];
        if (!c || c.v === null) continue;
        vals.push(c.v);
        if (Math.abs(c.v) >= 0.7) tight++;
        if (Math.abs(c.v) <= 0.2) loose++;
      }
    }
    if (!vals.length) return '';
    var avgAbs = vals.reduce(function(s, v){ return s + Math.abs(v); }, 0) / vals.length;
    var bucket = avgAbs >= 0.45 ? T.statusHigh : (avgAbs >= 0.25 ? T.statusMod : T.statusLow);
    var txt = tx(bucket).replace('{v}', avgAbs.toFixed(2));
    var stats = tx(T.statusPairs).replace('{a}', tight).replace('{t}', vals.length).replace('{b}', loose);
    return '<div class="cm-status">' +
      '<div class="cm-cl">' + esc(tx(T.statusH)) + '</div>' +
      '<div class="cm-status-txt">' + esc(txt) + '</div>' +
      '<div class="cm-status-stats">' + esc(stats) + '</div></div>';
  }

  function netHTML(){
    return '<div class="cm-net-wrap">' +
      '<div class="cm-net-title-row"><div class="cm-cl">' + esc(tx(T.netH)) + '</div>' +
        '<span class="spz-tag spz-tag-rt">' + esc(tx(T.netLive)) + '</span></div>' +
      '<div class="cm-net-hint">' + esc(tx(T.netHint)) + '</div>' +
      '<canvas class="cm-net-canvas" data-cm="netcanvas" width="1320" height="700"></canvas>' +
      '<div class="cm-net-info" data-cm="netinfo">' + esc(tx(T.netDefault)) + '</div>' +
    '</div>';
  }

  function stopNetwork(){
    if (net.raf) { cancelAnimationFrame(net.raf); net.raf = null; }
  }

  /* ---- the same matrix, drawn as a force-directed network: ties pull
     nodes together, everything else pushes apart, a gentle jitter keeps
     it visibly alive instead of freezing solid ---- */
  function mountNetwork(mx){
    stopNetwork();
    var canvas = sec && sec.querySelector('[data-cm="netcanvas"]');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var W = canvas.width, H = canvas.height;
    var syms = mx.syms;
    net.canvas = canvas; net.ctx = ctx; net.hover = -1; net.pin = -1; net.dragging = -1;

    var cx = W / 2, cy = H / 2, R = Math.min(W, H) * 0.32;
    net.t = 0;
    net.nodes = syms.map(function(s, i){
      var ang = (i / syms.length) * Math.PI * 2;
      return { en:s.en, th:s.th, sym:s.sym, x: cx + Math.cos(ang) * R, y: cy + Math.sin(ang) * R,
        vx:0, vy:0, ph: i * 2.399 + Math.random() * 6.28 };
    });
    net.edges = [];
    for (var i = 0; i < syms.length; i++) {
      for (var j = i + 1; j < syms.length; j++) {
        var c = mx.M[i][j];
        if (c && c.v !== null && Math.abs(c.v) >= 0.35) net.edges.push({ i:i, j:j, v:c.v });
      }
    }

    function pos(evt){
      var r = canvas.getBoundingClientRect();
      var t = evt.touches && evt.touches[0];
      var px = (t ? t.clientX : evt.clientX) - r.left;
      var py = (t ? t.clientY : evt.clientY) - r.top;
      return { x: px * (W / r.width), y: py * (H / r.height) };
    }
    function nearest(p){
      var best = -1, bd = 30 * 30;
      net.nodes.forEach(function(n, idx){
        var dx = n.x - p.x, dy = n.y - p.y, d = dx * dx + dy * dy;
        if (d < bd) { bd = d; best = idx; }
      });
      return best;
    }
    function updateInfo(){
      var info = sec && sec.querySelector('[data-cm="netinfo"]');
      if (!info) return;
      var idx = net.hover !== -1 ? net.hover : net.pin;
      if (idx === -1) { info.textContent = tx(T.netDefault); return; }
      var row = mx.M[idx];
      var pairs = [];
      row.forEach(function(c, j){
        if (j === idx || !c || c.v === null) return;
        pairs.push({ j:j, v:c.v });
      });
      if (!pairs.length) { info.textContent = tx(T.netDefault); return; }
      pairs.sort(function(a, b){ return b.v - a.v; });
      var top = pairs.slice(0, 2);
      var bottom = pairs[pairs.length - 1];
      var n = tx(syms[idx]);
      var a = top[0] ? tx(syms[top[0].j]) : '—', av = top[0] ? top[0].v.toFixed(2) : '—';
      var b = top[1] ? tx(syms[top[1].j]) : '—', bv = top[1] ? top[1].v.toFixed(2) : '—';
      var c = bottom ? tx(syms[bottom.j]) : '—', cv = bottom ? bottom.v.toFixed(2) : '—';
      info.innerHTML = tx(T.netInfoFmt)
        .replace('{n}', esc(n)).replace('{a}', esc(a)).replace('{av}', av)
        .replace('{b}', esc(b)).replace('{bv}', bv).replace('{c}', esc(c)).replace('{cv}', cv);
    }

    function onDown(e){
      var p = pos(e), idx = nearest(p);
      if (idx !== -1) {
        net.dragging = idx; net.dragMoved = false; canvas.classList.add('dragging');
        if (e.cancelable) e.preventDefault();
      }
    }
    function onMove(e){
      var p = pos(e);
      if (net.dragging !== -1) {
        net.dragMoved = true;
        var n = net.nodes[net.dragging];
        n.x = Math.max(24, Math.min(W - 24, p.x));
        n.y = Math.max(24, Math.min(H - 24, p.y));
        n.vx = 0; n.vy = 0;
        if (e.cancelable) e.preventDefault();
      } else {
        var hv = nearest(p);
        if (hv !== net.hover) { net.hover = hv; updateInfo(); }
      }
    }
    function onUp(){
      if (net.dragging !== -1 && !net.dragMoved) net.pin = net.dragging;
      net.dragging = -1; canvas.classList.remove('dragging');
      updateInfo();
    }
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onUp);
    canvas.addEventListener('mouseleave', function(){
      if (net.dragging !== -1) onUp();
      if (net.hover !== -1) { net.hover = -1; updateInfo(); }
    });
    canvas.addEventListener('touchstart', onDown, { passive:false });
    canvas.addEventListener('touchmove', onMove, { passive:false });
    canvas.addEventListener('touchend', onUp);

    function tick(){
      if (!canvas.isConnected) { stopNetwork(); return; }
      if (sec.offsetParent === null) { net.raf = requestAnimationFrame(tick); return; }
      net.t += 0.028;
      var nodes = net.nodes, n = nodes.length;
      for (var i = 0; i < n; i++) {
        if (i === net.dragging) continue;
        var a = nodes[i], fx = 0, fy = 0;
        for (var j = 0; j < n; j++) {
          if (i === j) continue;
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy; if (d2 < 1) d2 = 1;
          var d = Math.sqrt(d2);
          var rep = 8600 / d2;
          fx += (dx / d) * rep; fy += (dy / d) * rep;
        }
        fx += (cx - a.x) * 0.004; fy += (cy - a.y) * 0.004;
        /* a smooth, deterministic sway per node -- unlike pure random jitter
           (which tends to cancel out into an almost-static blur), this keeps
           every node visibly, continuously drifting in its own slow orbit */
        fx += Math.cos(net.t + a.ph) * 3.4; fy += Math.sin(net.t * 1.15 + a.ph * 1.3) * 3.4;
        a.vx = (a.vx + fx * 0.02) * 0.86;
        a.vy = (a.vy + fy * 0.02) * 0.86;
      }
      net.edges.forEach(function(e){
        var a = nodes[e.i], b = nodes[e.j];
        var dx = b.x - a.x, dy = b.y - a.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        var ideal = 95 + (1 - Math.abs(e.v)) * 230;
        var f = (d - ideal) * 0.012;
        var ux = dx / d, uy = dy / d;
        if (e.i !== net.dragging) { a.vx += ux * f; a.vy += uy * f; }
        if (e.j !== net.dragging) { b.vx -= ux * f; b.vy -= uy * f; }
      });
      for (var k = 0; k < n; k++) {
        if (k === net.dragging) continue;
        var nd = nodes[k];
        nd.x += nd.vx; nd.y += nd.vy;
        nd.x = Math.max(24, Math.min(W - 24, nd.x));
        nd.y = Math.max(24, Math.min(H - 24, nd.y));
      }
      draw();
      net.raf = requestAnimationFrame(tick);
    }

    function draw(){
      ctx.clearRect(0, 0, W, H);
      net.edges.forEach(function(e){
        var a = net.nodes[e.i], b = net.nodes[e.j];
        var strength = Math.abs(e.v);
        var hi = (e.i === net.hover || e.j === net.hover || e.i === net.pin || e.j === net.pin);
        ctx.strokeStyle = e.v >= 0
          ? 'rgba(48,209,88,' + (0.16 + strength * 0.58) + ')'
          : 'rgba(255,69,58,' + (0.16 + strength * 0.58) + ')';
        ctx.lineWidth = (hi ? 2 : 0.8) + strength * 4;
        if (hi) { ctx.shadowBlur = 10; ctx.shadowColor = e.v >= 0 ? 'rgba(48,209,88,.6)' : 'rgba(255,69,58,.6)'; }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
      net.nodes.forEach(function(nd, idx){
        var active = idx === net.hover || idx === net.pin;
        var r = active ? 27 : 22;
        if (active) { ctx.shadowBlur = 16; ctx.shadowColor = 'rgba(204,255,0,.85)'; }
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, r, 0, Math.PI * 2);
        ctx.fillStyle = active ? 'rgba(204,255,0,0.94)' : 'rgba(255,255,255,0.13)';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = active ? '#0a0a0a' : 'rgba(255,255,255,0.38)';
        ctx.stroke();
        ctx.fillStyle = active ? '#0a0a0a' : '#f5f5f7';
        ctx.font = '700 12px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(nd.sym, nd.x, nd.y);
      });
    }

    tick();
  }

  function bodyHTML(mx){
    if (state.data === false) return '<div class="ss-empty">' + esc(tx(T.noFile)) + '</div>';
    if (!state.data || !mx) return '<div class="ss-empty">' + esc(tx(T.waiting)) + '</div>';
    return guideHTML() + exampleHTML() + statusHTML(mx) +
      '<div class="ss-pills" style="margin-bottom:16px;">' + pillsHTML() + '</div>' +
      calloutsHTML(mx) + gridHTML(mx) + detailHTML(mx) + netHTML() +
      '<div class="ss-foot">' + esc(tx(T.foot)) + '</div>';
  }

  function bind(body){
    body.querySelectorAll('[data-cm-w]').forEach(function(b){
      b.addEventListener('click', function(){ state.win = parseInt(b.getAttribute('data-cm-w'), 10); paint(); });
    });
    body.querySelectorAll('[data-cm-i]').forEach(function(td){
      td.addEventListener('click', function(){
        state.sel = { i:parseInt(td.getAttribute('data-cm-i'),10), j:parseInt(td.getAttribute('data-cm-j'),10) };
        paint();
      });
    });
    var exRowSel = body.querySelector('[data-cm="exrowsel"]');
    var exColSel = body.querySelector('[data-cm="excolsel"]');
    function onExPick(){
      stopExampleDemo();
      exDemo.manual = true;
      exDemo.rk = exRowSel.value; exDemo.ck = exColSel.value;
      exDemoRender(exDemo.rk, exDemo.ck);
    }
    if (exRowSel) exRowSel.addEventListener('change', onExPick);
    if (exColSel) exColSel.addEventListener('change', onExPick);
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-cm="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(T.eyebrow);
    if (q('h')) q('h').textContent = tx(T.h);
    if (q('lede')) q('lede').textContent = tx(T.lede);
    var body = q('body');
    if (!body) return;
    var mx = (state.data && state.data !== false) ? buildMatrix() : null;
    body.innerHTML = '<div class="spz-scan reveal in-view">' + bodyHTML(mx) + '</div>';
    bind(body);
    if (mx) { mountNetwork(mx); mountExampleDemo(); } else { stopNetwork(); stopExampleDemo(); }
  }

  function build(){
    if (document.getElementById('correl')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'correl';
    sec.setAttribute('data-route', 'correl');
    sec.innerHTML =
      '<div class="cm-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-cm="eb"></span></div>' +
          '<h2 data-cm="h"></h2>' +
          '<p class="lede" data-cm="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-cm="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'correl', feat:true, after:'anomaly',
      t:{en:'Correlation Map',th:'แผนที่ความสัมพันธ์สินทรัพย์'},
      d:{en:'A pairwise map of how 14 sector/asset-class ETFs and the S&P 500 have actually moved together — or not — week to week. Admin-only.',
         th:'แผนที่เปรียบเทียบว่า ETF ตัวแทนกลุ่ม 14 กลุ่มกับ S&P 500 เคยขยับไปด้วยกันมากแค่ไหนในแต่ละสัปดาห์ เฉพาะแอดมิน'}
    });

    sec.__render = paint;
    fetchData();
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 400);

    document.addEventListener('spz:snapshot', function(e){ liveSnap = e.detail; paint(); });
    var seed = setInterval(function(){
      var s = (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) || null;
      if (s) { liveSnap = s; paint(); clearInterval(seed); }
    }, 600);
    setTimeout(function(){ clearInterval(seed); }, 45000);

    new MutationObserver(paint)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  /* small read-only summary for other modules (the admin Command Center)
     to surface without recomputing the matrix themselves */
  function summary(){
    if (!state.data || state.data === false) return null;
    var mx = buildMatrix();
    var syms = mx.syms, M = mx.M;
    if (syms.length < 3) return null;
    var best = null, worst = null, vals = [];
    for (var i = 0; i < syms.length; i++) {
      for (var j = i + 1; j < syms.length; j++) {
        var c = M[i][j];
        if (!c || c.v === null) continue;
        vals.push(c.v);
        if (!best || c.v > best.v) best = { a:tx(syms[i]), b:tx(syms[j]), v:c.v };
        if (!worst || c.v < worst.v) worst = { a:tx(syms[i]), b:tx(syms[j]), v:c.v };
      }
    }
    if (!vals.length) return null;
    var avgAbs = vals.reduce(function(s, v){ return s + Math.abs(v); }, 0) / vals.length;
    return { avgAbs:avgAbs, pairs:vals.length, best:best, worst:worst, n:syms.length };
  }

  window.__SPZ_CORREL = { repaint: paint, summary: summary,
    /* read-only: the exact matrix this page already computes and its own
       colour scale, for the Command Center's heat-map card. */
    matrix: buildMatrix, color: corrColor };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1100); });
  } else {
    setTimeout(boot, 1100);
  }
})();
