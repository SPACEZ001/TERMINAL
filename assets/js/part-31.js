
(function(){
  'use strict';
  if (window.__SPZ_PROOF) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 2 : d); }

  var C = {
    eyebrow:{en:'Proof Lab',th:'ห้องพิสูจน์'},
    h:{en:'Does any of this actually work?',th:'ของพวกนี้ใช้ได้จริงไหม'},
    lede:{en:'A dashboard that has never been tested is decoration. This screen runs every Turning Point Radar gauge back through 12–25 years of history, finds every time it went red, and measures what the market did over the following months — against the base rate for the same period, so a market that mostly rises cannot make a useless gauge look clever. Then it checks the live numbers against their own inputs. Both tests run on your click, in your browser, from the same data the rest of the site uses.',
          th:'แดชบอร์ดที่ไม่เคยถูกทดสอบก็เป็นแค่ของประดับ หน้านี้เอามาตรวัดทุกตัวในเรดาร์ย้อนกลับไปในประวัติศาสตร์ 12–25 ปี หาทุกครั้งที่มันขึ้นสีแดง แล้ววัดว่าตลาดทำอะไรในเดือนถัดมา — เทียบกับค่าปกติของช่วงเดียวกัน เพื่อไม่ให้ตลาดที่ยังไงก็ขึ้นทำให้มาตรวัดที่ไร้ประโยชน์ดูฉลาด จากนั้นตรวจว่าตัวเลขสดตรงกับวัตถุดิบของมันเองไหม ทั้งสองการทดสอบรันตอนคุณกด ในเบราว์เซอร์คุณ จากข้อมูลชุดเดียวกับที่ทั้งเว็บใช้'},
    tabBt:{en:'① Backtest the radar',th:'① ทดสอบเรดาร์ย้อนหลัง'},
    tabCk:{en:'② Check the live numbers',th:'② ตรวจตัวเลขสด'},
    run:{en:'▶ RUN THE TEST',th:'▶ รันการทดสอบ'},
    rerun:{en:'▶ RUN AGAIN',th:'▶ รันอีกครั้ง'},
    running:{en:'running…',th:'กำลังรัน…'},
    horizon:{en:'Measure the market over:',th:'วัดตลาดในช่วง:'},
    h21:{en:'1 month',th:'1 เดือน'}, h63:{en:'3 months',th:'3 เดือน'},
    h126:{en:'6 months',th:'6 เดือน'}, h252:{en:'12 months',th:'12 เดือน'},
    loading:{en:'Loading the history file…',th:'กำลังโหลดไฟล์ประวัติ…'},
    noFile:{en:'The history file is not on the server yet — it is rebuilt once a day by the same job that refreshes the market data. Check back after the next run.',
            th:'ไฟล์ประวัติยังไม่ขึ้นเซิร์ฟเวอร์ — มันถูกสร้างใหม่วันละครั้งโดยงานเดียวกับที่รีเฟรชข้อมูลตลาด กลับมาดูอีกทีหลังรอบถัดไป'},
    ready:{en:'{n} gauges · {a} of history · benchmark {b}',th:'มาตรวัด {n} ตัว · ข้อมูล {a} · เทียบกับ {b}'},
    resNote:{en:'your run samples the history weekly, so a grade can differ by one step from the daily pass the server does',
             th:'การรันในเบราว์เซอร์อ่านข้อมูลรายสัปดาห์ เกรดจึงอาจต่างจากรอบรายวันที่เซิร์ฟเวอร์คำนวณอยู่หนึ่งขั้น'},
    ep:{en:'RED EPISODES',th:'ครั้งที่ขึ้นแดง'},
    after:{en:'MARKET AFTER',th:'ตลาดหลังจากนั้น'},
    base:{en:'NORMAL PERIOD',th:'ช่วงปกติทั่วไป'},
    edge:{en:'DIFFERENCE',th:'ต่างกัน'},
    downRate:{en:'{p}% of those episodes were followed by a fall',th:'{p}% ของครั้งเหล่านั้น ตลาดลงต่อ'},
    missH:{en:'Worst false alarm:',th:'เตือนผิดหนักสุด:'},
    bestH:{en:'Best call:',th:'ทายแม่นสุด:'},
    gA:{en:'Real edge. When this one goes red the market has behaved measurably worse than usual, consistently across horizons.',
        th:'มีของจริง เมื่อตัวนี้ขึ้นแดง ตลาดทำผลงานแย่กว่าปกติอย่างวัดได้ และสม่ำเสมอในหลายช่วงเวลา'},
    gB:{en:'Useful. A clear tilt, though not big enough to act on alone.',
        th:'ใช้ได้ มีทิศทางชัด แต่ยังไม่แรงพอจะใช้ตัดสินใจตัวเดียว'},
    gC:{en:'Weak. There is a tilt, but small enough that noise could explain it.',
        th:'อ่อน มีทิศทางอยู่ แต่เล็กพอที่ความบังเอิญอธิบายได้'},
    gD:{en:'No evidence. Over this history the market did not behave differently after this gauge went red. Keep it as context, do not treat it as a signal.',
        th:'ไม่มีหลักฐาน ตลอดประวัติชุดนี้ ตลาดไม่ได้ทำอะไรต่างจากปกติหลังมาตรวัดตัวนี้ขึ้นแดง เก็บไว้เป็นบริบทได้ แต่อย่านับเป็นสัญญาณ'},
    gF:{en:'Backwards. The market has done BETTER than usual after this gauge went red. Reading it as a warning would have cost you.',
        th:'กลับทิศ ตลาดทำผลงานดีกว่าปกติหลังมาตรวัดตัวนี้ขึ้นแดง ถ้าอ่านว่าเป็นคำเตือนคือขาดทุน'},
    gNA:{en:'Not enough red episodes in the sample to judge. Silence is not evidence either way.',
         th:'จำนวนครั้งที่ขึ้นแดงน้อยเกินกว่าจะตัดสิน ความเงียบก็ไม่ใช่หลักฐานเช่นกัน'},
    recKeep:{en:'KEEP',th:'เก็บไว้'}, recCtx:{en:'CONTEXT ONLY',th:'ใช้เป็นบริบท'},
    recDrop:{en:'CONSIDER DROPPING',th:'ควรพิจารณาถอด'}, recNa:{en:'UNJUDGED',th:'ยังตัดสินไม่ได้'},
    summaryH:{en:'What the test says overall',th:'ผลรวมของการทดสอบ'},
    method:{en:'Method',th:'วิธีทดสอบ'},

    market:{en:'Measure which market:',th:'วัดกับตลาดไหน:'},
    mUS:{en:'US · SPY',th:'สหรัฐฯ · SPY'},
    mTH:{en:'Thailand · SET',th:'ไทย · SET'},
    onRate:{en:'ON {p}% OF WEEKS',th:'ติดอยู่ {p}% ของสัปดาห์'},
    onWarn:{en:'a condition that is switched on this often is a description of the weather, not a warning',
            th:'เงื่อนไขที่ติดบ่อยขนาดนี้คือคำบรรยายสภาพอากาศ ไม่ใช่คำเตือน'},
    pLab:{en:'LUCK CHECK',th:'ตรวจว่าฟลุ๊คไหม'},
    pRaw:{en:'{v} of random draws of the same size looked at least this bad',
          th:'การสุ่มวันจำนวนเท่ากันมี {v} ที่ดูแย่อย่างน้อยเท่านี้'},
    pAdjL:{en:'after correcting for {n} tests: {v}',th:'หลังปรับเพราะทดสอบ {n} อย่าง: {v}'},

    comboH:{en:'What happens when several go red at once',th:'ถ้าหลายตัวแดงพร้อมกันล่ะ'},
    comboL:{en:'Nobody reads one gauge. The fair test is the one you would actually run: several signals lit in the same week. Two families are tested here — "any N of the eleven are red", which has no opinion about which ones, and five named clusters, each one idea told through different instruments. Testing this many things guarantees that some of them look good by luck, so every card carries a luck check, and a grade is only handed out after that number has been multiplied by the number of tests run.',
            th:'ไม่มีใครดูมาตรวัดตัวเดียว การทดสอบที่ยุติธรรมคือแบบที่คุณใช้จริง — สัญญาณหลายตัวติดในสัปดาห์เดียวกัน ตรงนี้ทดสอบสองตระกูล: "แดงกี่ตัวก็ได้ N ตัวจาก 11" ซึ่งไม่สนว่าตัวไหน กับกลุ่มที่ตั้งชื่อไว้ 5 กลุ่ม แต่ละกลุ่มคือหนึ่งเรื่องที่เล่าผ่านเครื่องมือคนละชิ้น การทดสอบเยอะขนาดนี้รับประกันได้เลยว่าบางอันจะดูดีเพราะฟลุ๊ค ทุกใบจึงมีช่องตรวจฟลุ๊ค และจะให้เกรดได้ก็ต่อเมื่อเอาตัวเลขนั้นคูณจำนวนการทดสอบทั้งหมดแล้ว'},
    comboKind:{en:'GROUP',th:'สัญญาณรวม'},
    setNote:{en:'The Thai gauge is graded on the Thai market, where it belongs. Switching the market above re-runs every signal against SET instead — a US signal that also moves SET is telling you something, and one that does not is telling you something else.',
             th:'มาตรวัดฝั่งไทยถูกให้เกรดกับตลาดไทย ซึ่งเป็นที่ที่มันควรอยู่ ถ้าสลับตลาดด้านบน ทุกสัญญาณจะถูกทดสอบใหม่กับ SET แทน — สัญญาณอเมริกาที่ขยับ SET ด้วยก็บอกอะไรบางอย่าง และตัวที่ไม่ขยับก็บอกอะไรอีกอย่าง'},
    noSet:{en:'The Thai index history has not been collected yet — rerun the daily job.',
           th:'ยังไม่ได้เก็บประวัติดัชนีไทย — รอรอบงานประจำวันรอบถัดไป'},
    ckH:{en:'Do the live numbers reconcile?',th:'ตัวเลขสดตรงกันไหม'},
    ckL:{en:'Every derived figure on the site is recomputed here from the raw fields in the same snapshot and compared with what the collector published. A mismatch means a bug in the code, not a market event — which is exactly why it is worth checking in public.',
         th:'ทุกตัวเลขที่คำนวณต่อบนเว็บถูกคำนวณใหม่ตรงนี้จากข้อมูลดิบในสแนปช็อตเดียวกัน แล้วเทียบกับค่าที่ตัวเก็บข้อมูลเผยแพร่ ถ้าไม่ตรงแปลว่าโค้ดมีบั๊ก ไม่ใช่เหตุการณ์ตลาด ซึ่งเป็นเหตุผลว่าทำไมถึงควรตรวจให้เห็นกันไปเลย'},
    pass:{en:'PASS',th:'ผ่าน'}, fail:{en:'FAIL',th:'ไม่ผ่าน'}, skip:{en:'NO DATA',th:'ไม่มีข้อมูล'},
    ckPassed:{en:'checks passed',th:'รายการผ่าน'},
    ckFailed:{en:'failed',th:'ไม่ผ่าน'},
    ckSkipped:{en:'skipped',th:'ข้าม'},
    note:{en:'A backtest describes what already happened; it is not a promise about what happens next. Sample sizes here are small — a dozen episodes over twenty years is normal for this kind of signal, and a dozen is not many. Everything on this page is educational, not investment advice.',
          th:'การทดสอบย้อนหลังบอกสิ่งที่เกิดไปแล้ว ไม่ใช่คำสัญญาว่าอะไรจะเกิดต่อ จำนวนตัวอย่างในนี้น้อย — สิบกว่าครั้งในยี่สิบปีถือเป็นเรื่องปกติของสัญญาณประเภทนี้ และสิบกว่าครั้งก็ยังถือว่าน้อย ทุกอย่างในหน้านี้เพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'}
  };

  var state = { tab:'bt', horizon:63, bench:'SPY', data:null, loading:false, tried:false,
                results:null, combos:null, nTests:0, checks:null };
  var sec = null;

  /* ---------------------------------------------------------------
     the test itself — re-run in the browser from the weekly series
     --------------------------------------------------------------- */
  function median(xs){
    if (!xs.length) return null;
    var s = xs.slice().sort(function(a,b){ return a-b; });
    var n = s.length;
    return n % 2 ? s[(n-1)/2] : (s[n/2-1] + s[n/2]) / 2;
  }

  function stateOf(t, v){
    if (!isNum(v)) return 'na';
    if (t.dir === 'down') return v <= t.ok ? 'ok' : (v <= t.warn ? 'warn' : 'alert');
    return v >= t.ok ? 'ok' : (v >= t.warn ? 'warn' : 'alert');
  }

  /* ISO week key — the two markets keep different calendars, so weeks, not
     dates, are what line them up */
  function isoWeek(ds){
    var d = new Date(ds + 'T00:00:00Z');
    if (isNaN(d.getTime())) return ds;
    var dn = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - dn + 3);
    var y = d.getUTCFullYear();
    var t = Date.UTC(y, 0, 4);
    var w = 1 + Math.round(((d.getTime() - t) / 864e5 - 3 + ((new Date(t).getUTCDay() + 6) % 7)) / 7);
    return y + '-' + (w < 10 ? '0' : '') + w;
  }

  function hasSet(){ return (((state.data || {}).bench_series_th) || []).length > 200; }
  function benchSym(){ return state.bench === 'SET' && hasSet() ? 'SET' : 'SPY'; }
  function benchArr(){
    var d = state.data || {};
    return benchSym() === 'SET' ? d.bench_series_th : (d.bench_series || []);
  }
  function benchInfo(){ return ((state.data || {}).benchmarks || {})[benchSym()] || null; }
  function benchName(){
    var lab = benchInfo();
    if (!lab) return benchSym();
    /* say which instrument this actually is — "the Thai market" meaning the
       SET index and "the Thai market" meaning a dollar-priced ETF are not the
       same claim, and the reader is entitled to know which one they got */
    return tx(lab) + (lab.symbol && lab.symbol !== benchSym() ? ' · ' + lab.symbol : '');
  }

  /* first benchmark week on or after a date — an episode date from one
     market is not guaranteed to be a trading week in the other */
  function posOn(arr, d){
    var lo = 0, hi = arr.length;
    while (lo < hi) { var m = (lo + hi) >> 1; if (arr[m][0] < d) lo = m + 1; else hi = m; }
    return lo < arr.length ? lo : -1;
  }

  function forwardPool(arr, w){
    var out = [];
    for (var i = 0; i + w < arr.length; i++) {
      var a = arr[i][1];
      if (a) out.push((arr[i + w][1] - a) / a * 100);
    }
    return out;
  }

  /* How often would this many random dates have looked at least this bad?
     Without this number, testing twenty combinations and reporting the best
     one is just fishing. */
  var PTRIALS = 400;
  function pValue(med, n, pool){
    if (!isNum(med) || !pool.length || n < 2 || n > pool.length) return null;
    var hits = 0, pick = new Array(n);
    for (var i = 0; i < PTRIALS; i++) {
      var used = {};
      for (var j = 0; j < n; j++) {
        var k;
        do { k = (Math.random() * pool.length) | 0; } while (used[k]);
        used[k] = 1;
        pick[j] = pool[k];
      }
      if (median(pick) <= med) hits++;
    }
    return hits / PTRIALS;
  }

  function episodesFromFlags(flags, dates, cool){
    var eps = [], prev = false, last = -1e9;
    for (var i = 0; i < dates.length; i++) {
      var f = !!flags[i];
      if (f && !prev && (i - last) >= cool) { eps.push(dates[i]); last = i; }
      prev = f;
    }
    return eps;
  }

  function scoreEpisodes(eps, arr, w){
    var pool = forwardPool(arr, w);
    var baseMed = median(pool);
    var fwd = [];
    eps.forEach(function(d){
      var k = posOn(arr, d);
      if (k < 0 || k + w >= arr.length) return;
      var a = arr[k][1];
      if (a) fwd.push({ d:d, r:(arr[k + w][1] - a) / a * 100 });
    });
    if (fwd.length < 2) return { n:fwd.length, base:baseMed, grade:'n/a' };
    var rets = fwd.map(function(x){ return x.r; });
    var med = median(rets);
    return {
      n: fwd.length, med: med, base: baseMed,
      edge: baseMed === null ? null : med - baseMed,
      negRate: rets.filter(function(r){ return r < 0; }).length / rets.length * 100,
      worst: fwd.reduce(function(m, x){ return x.r > m.r ? x : m; }, fwd[0]),
      best: fwd.reduce(function(m, x){ return x.r < m.r ? x : m; }, fwd[0]),
      p: pValue(med, fwd.length, pool)
    };
  }

  function gradeIt(r){
    if (!isNum(r.edge) || r.n < 3) return 'n/a';
    var p = isNum(r.pAdj) ? r.pAdj : r.p;
    if (r.edge <= -4 && r.n >= 5 && isNum(p) && p <= 0.20) return 'A';
    if (r.edge <= -2 && r.n >= 4 && isNum(p) && p <= 0.50) return 'B';
    if (r.edge <= -0.75) return 'C';
    if (r.edge < 0) return 'D';
    return 'F';
  }

  var COOL_W = 8;                                  /* ~2 months of weeks */

  function runGauge(g, arr, weeksAhead){
    var ser = (state.data.series || {})[g.k] || [];
    if (ser.length < 100 || !g.thresholds) return null;
    var flags = [], dates = [];
    for (var i = 0; i < ser.length; i++) {
      dates.push(ser[i][0]);
      flags.push(stateOf(g.thresholds, ser[i][1]) === 'alert');
    }
    var eps = episodesFromFlags(flags, dates, COOL_W);
    var r = scoreEpisodes(eps, arr, weeksAhead);
    r.k = g.k; r.en = g.en; r.th = g.th;
    r.first = g.first; r.last = g.last; r.series = ser;
    r.onRate = flags.filter(Boolean).length / Math.max(1, flags.length) * 100;
    return r;
  }

  /* every gauge's state on one shared weekly timeline, so combinations can
     ask "were these all lit in the same week?" */
  function weekTable(){
    var d = state.data, weeks = {}, order = [];
    (d.gauges || []).forEach(function(g){
      if (!g.thresholds) return;
      ((d.series || {})[g.k] || []).forEach(function(p){
        var wk = isoWeek(p[0]);
        if (!weeks[wk]) { weeks[wk] = { d:p[0], st:{} }; order.push(wk); }
        if (p[0] < weeks[wk].d) weeks[wk].d = p[0];
        weeks[wk].st[g.k] = stateOf(g.thresholds, p[1]);
      });
    });
    order.sort();
    return order.map(function(wk){ return weeks[wk]; });
  }

  var MIN_AVAIL = 8;

  function comboFlags(c, tbl){
    var flags = [], dates = [];
    for (var i = 0; i < tbl.length; i++) {
      var st = tbl[i].st;
      dates.push(tbl[i].d);
      if (c.kind === 'count') {
        var avail = 0, red = 0;
        for (var k in st) {
          if (!st[k] || st[k] === 'na') continue;
          avail++;
          if (st[k] === 'alert') red++;
        }
        flags.push(avail >= MIN_AVAIL && red >= c.need);
      } else {
        var all = true, any = false, miss = false;
        (c.members || []).forEach(function(m){
          var s = st[m];
          if (!s || s === 'na') { miss = true; return; }
          if (s !== 'warn' && s !== 'alert') all = false;
          if (s === 'alert') any = true;
        });
        flags.push(!miss && all && any);
      }
    }
    return { flags:flags, dates:dates };
  }

  function runCombo(c, tbl, arr, weeksAhead){
    var f = comboFlags(c, tbl);
    var eps = episodesFromFlags(f.flags, f.dates, COOL_W);
    var r = scoreEpisodes(eps, arr, weeksAhead);
    r.k = c.k; r.en = c.en; r.th = c.th; r.en_d = c.en_d; r.th_d = c.th_d;
    r.kind = c.kind || 'cluster'; r.members = c.members || []; r.need = c.need;
    r.combo = true;
    r.onRate = f.flags.filter(Boolean).length / Math.max(1, f.flags.length) * 100;
    r.first = f.dates.length ? f.dates[0] : null;
    return r;
  }

  function runAll(done){
    var d = state.data;
    if (!d) { done(); return; }
    var arr = benchArr() || [];
    if (arr.length < 100) { state.results = []; state.combos = []; done(); return; }
    var weeks = Math.max(1, Math.round(state.horizon / 5));
    var gauges = d.gauges || [];
    var combos = d.combos || [];
    var tbl = null;
    var out = [], cout = [], i = 0;
    var total = gauges.length + combos.length;

    var prog = sec.querySelector('[data-pf="prog"]');
    var bar = prog && prog.querySelector('i');
    if (prog) prog.classList.add('on');

    (function step(){
      var t0 = Date.now();
      while (i < total && Date.now() - t0 < 40) {
        if (i < gauges.length) {
          var r = runGauge(gauges[i], arr, weeks);
          if (r) out.push(r);
        } else {
          if (!tbl) tbl = weekTable();
          cout.push(runCombo(combos[i - gauges.length], tbl, arr, weeks));
        }
        i++;
      }
      if (bar) bar.style.width = Math.round(i / Math.max(1, total) * 100) + '%';
      if (i < total) { setTimeout(step, 55); return; }

      /* one honest correction across everything that was just tested */
      var all = out.concat(cout);
      var n = all.filter(function(x){ return isNum(x.p); }).length;
      all.forEach(function(x){
        if (isNum(x.p)) x.pAdj = Math.min(1, x.p * n);
        x.grade = gradeIt(x);
      });
      setTimeout(function(){
        if (prog) prog.classList.remove('on');
        if (bar) bar.style.width = '0';
        state.results = out;
        state.combos = cout;
        state.nTests = n;
        done();
      }, 300);
    })();
  }

  /* ---------------------------------------------------------------
     self-check of the live snapshot
     --------------------------------------------------------------- */
  function near(a, b, tol){ return isNum(a) && isNum(b) && Math.abs(a - b) <= tol; }

  function buildChecks(){
    var snap = (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) || null;
    if (!snap) return null;
    var out = [];
    var r = snap.regime || {}, f = snap.flows || {}, st = snap.stocks || {};
    var idx = {};
    ['sector','asset','country'].forEach(function(b){
      (f[b] || []).forEach(function(x){ idx[x.sym] = x; });
    });

    function add(name, ok, detail){
      out.push({ name:name, ok:ok, detail:detail });
    }
    function spreadCheck(label, key, a, b) {
      var ra = idx[a], rb = idx[b];
      if (!ra || !rb || !isNum(ra.m1) || !isNum(rb.m1) || !isNum(r[key])) {
        add(label, null, a + ' / ' + b + ' — ' + tx(C.skip));
        return;
      }
      var expect = ra.m1 - rb.m1;
      add(label, near(r[key], expect, 0.05),
          a + ' ' + sgn(ra.m1) + '% − ' + b + ' ' + sgn(rb.m1) + '% = <b>' + sgn(expect) +
          '</b> · published <b>' + sgn(r[key]) + '</b>');
    }

    /* 1. day change recomputed for every stock */
    var bad = [], n = 0;
    Object.keys(st).forEach(function(t){
      var s = st[t];
      if (!isNum(s.price) || !isNum(s.prev) || !isNum(s.chg_pct)) return;
      n++;
      var e = (s.price - s.prev) / s.prev * 100;
      if (Math.abs(e - s.chg_pct) > 0.02) bad.push(t + ' (' + sgn(s.chg_pct) + ' vs ' + sgn(e) + ')');
    });
    add(L() === 'th' ? 'ราคาเปลี่ยนแปลงรายวันของหุ้นทุกตัว' : 'Day change on every stock',
        n > 0 ? bad.length === 0 : null,
        n + ' ' + (L() === 'th' ? 'ตัวคำนวณใหม่จาก (ราคา − ราคาก่อนหน้า)' : 'recomputed from (price − prev)') +
        (bad.length ? ' · <b>' + bad.slice(0, 4).join(', ') + '</b>' : ''));

    /* 2-5. the spread gauges */
    spreadCheck(L() === 'th' ? 'ตลาดหุ้นกู้ = HYG − LQD' : 'Credit gauge = HYG − LQD', 'credit_1m', 'HYG', 'LQD');
    spreadCheck(L() === 'th' ? 'ความอยากเสี่ยง = XLY − XLP' : 'Risk appetite = XLY − XLP', 'cyclical_vs_defensive_1m', 'XLY', 'XLP');
    spreadCheck(L() === 'th' ? 'ผู้นำตลาด = SMH − SPY' : 'Leadership = SMH − SPY', 'semis_vs_market_1m', 'SMH', 'SPY');
    spreadCheck(L() === 'th' ? 'หุ้นเล็ก = IWM − SPY' : 'Small caps = IWM − SPY', 'smallcap_vs_market_1m', 'IWM', 'SPY');
    spreadCheck(L() === 'th' ? 'หุ้น เทียบ พันธบัตร = SPY − TLT' : 'Stocks vs bonds = SPY − TLT', 'stocks_vs_bonds_1m', 'SPY', 'TLT');

    /* 6. yield curve */
    if (isNum(r.yield_10y) && isNum(r.yield_3m) && isNum(r.curve_10y_3m)) {
      var ec = r.yield_10y - r.yield_3m;
      add(L() === 'th' ? 'เส้นผลตอบแทน = 10 ปี − 3 เดือน' : 'Yield curve = 10y − 3m',
          near(r.curve_10y_3m, ec, 0.02),
          r.yield_10y + ' − ' + r.yield_3m + ' = <b>' + ec.toFixed(2) + '</b> · published <b>' +
          r.curve_10y_3m + '</b>');
    } else {
      add(L() === 'th' ? 'เส้นผลตอบแทน = 10 ปี − 3 เดือน' : 'Yield curve = 10y − 3m', null, tx(C.skip));
    }

    /* 7. breadth recomputed from the stocks themselves */
    var above = 0, tot = 0;
    Object.keys(st).forEach(function(t){
      var s = st[t];
      if (isNum(s.price) && isNum(s.ma200)) { tot++; if (s.price > s.ma200) above++; }
    });
    if (tot >= 20 && isNum(r.breadth_200)) {
      var eb = above / tot * 100;
      add(L() === 'th' ? 'ความกว้างของตลาด นับใหม่จากหุ้นทุกตัว' : 'Breadth recounted from the stocks',
          near(r.breadth_200, eb, 1.0),
          above + '/' + tot + ' = <b>' + eb.toFixed(1) + '%</b> · published <b>' + r.breadth_200 + '%</b>');
    } else {
      add(L() === 'th' ? 'ความกว้างของตลาด นับใหม่จากหุ้นทุกตัว' : 'Breadth recounted from the stocks', null, tx(C.skip));
    }

    /* 8. RSI inside its bounds, and distance-to-average consistent */
    var rsiBad = [], maBad = [], rn = 0;
    Object.keys(st).forEach(function(t){
      var s = st[t];
      if (isNum(s.rsi)) { rn++; if (s.rsi < 0 || s.rsi > 100) rsiBad.push(t); }
      if (isNum(s.price) && isNum(s.ma200) && isNum(s.vs_ma200)) {
        var e = (s.price - s.ma200) / s.ma200 * 100;
        if (Math.abs(e - s.vs_ma200) > 0.2) maBad.push(t);
      }
    });
    add(L() === 'th' ? 'RSI อยู่ในช่วง 0–100' : 'RSI within 0–100',
        rn > 0 ? rsiBad.length === 0 : null,
        rn + ' ' + (L() === 'th' ? 'ค่า' : 'values') + (rsiBad.length ? ' · <b>' + rsiBad.join(', ') + '</b>' : ''));
    add(L() === 'th' ? 'ระยะห่างจากเส้น 200 วัน' : 'Distance from the 200-day average',
        maBad.length === 0, (L() === 'th' ? 'คำนวณใหม่จากราคาและเส้นค่าเฉลี่ย' : 'recomputed from price and the average') +
        (maBad.length ? ' · <b>' + maBad.slice(0, 4).join(', ') + '</b>' : ''));

    /* 9. currency board sanity */
    var ccy = snap.ccy || {};
    var ck = Object.keys(ccy);
    var ccyBad = ck.filter(function(k){ return !isNum(ccy[k].rate) || ccy[k].rate <= 0; });
    add(L() === 'th' ? 'อัตราแลกเปลี่ยนทุกสกุลเป็นบวก และ USD = 1' : 'Every FX rate positive, USD = 1',
        ck.length ? (ccyBad.length === 0 && ccy.USD && ccy.USD.rate === 1) : null,
        ck.length + ' ' + (L() === 'th' ? 'สกุล' : 'currencies') +
        (ccyBad.length ? ' · <b>' + ccyBad.join(', ') + '</b>' : ''));

    /* 10. divergence flags re-derived */
    var divs = (r.divergences || []);
    var dBad = divs.filter(function(d){
      if (d.kind === 'bearish') return !(isNum(d.rsi) && isNum(d.rsi_then) && d.rsi < d.rsi_then);
      if (d.kind === 'bullish') return !(isNum(d.rsi) && isNum(d.rsi_then) && d.rsi > d.rsi_then);
      return true;
    });
    add(L() === 'th' ? 'ทิศทางไดเวอร์เจนซ์สอดคล้องกับ RSI' : 'Divergence direction agrees with its RSI pair',
        divs.length ? dBad.length === 0 : null,
        divs.length + ' ' + (L() === 'th' ? 'รายการ' : 'entries') +
        (dBad.length ? ' · <b>' + dBad.map(function(d){ return d.t; }).join(', ') + '</b>' : ''));

    /* 11. freshness */
    var age = snap.generated_at ? (Date.now() - Date.parse(snap.generated_at)) / 36e5 : null;
    add(L() === 'th' ? 'ความสดของข้อมูล (ควรไม่เกิน 3 ชม.)' : 'Snapshot freshness (should be under 3h)',
        isNum(age) ? age < 3 : null,
        isNum(age) ? '<b>' + age.toFixed(1) + ' h</b> · ' + esc(snap.generated_at) : tx(C.skip));

    /* 12. every flow row usable */
    var rows = (f.sector || []).concat(f.asset || [], f.country || []);
    var fBad = rows.filter(function(x){ return !x.sym || !isNum(x.m1); });
    add(L() === 'th' ? 'ทุกแถวในสแกนเนอร์มีสัญลักษณ์และผลตอบแทน' : 'Every scanner row has a symbol and a return',
        rows.length ? fBad.length === 0 : null,
        rows.length + ' ' + (L() === 'th' ? 'แถว' : 'rows') +
        (fBad.length ? ' · <b>' + fBad.length + ' incomplete</b>' : ''));

    return out;
  }

  /* ---------------------------------------------------------------
     drawing
     --------------------------------------------------------------- */
  function sparkline(ser, th){
    if (!ser || ser.length < 5) return '';
    var vals = ser.map(function(p){ return p[1]; });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var span = (hi - lo) || 1;
    var step = 100 / (ser.length - 1);
    var d = ser.map(function(p, i){
      var x = (i * step).toFixed(2);
      var y = (30 - (p[1] - lo) / span * 28).toFixed(2);
      return (i ? 'L' : 'M') + x + ' ' + y;
    }).join(' ');
    var warnY = th ? (30 - (th.warn - lo) / span * 28) : null;
    return '<div class="pf-spark"><svg viewBox="0 0 100 32" preserveAspectRatio="none">' +
      (warnY !== null && warnY > -5 && warnY < 37 ?
        '<line x1="0" y1="' + warnY.toFixed(2) + '" x2="100" y2="' + warnY.toFixed(2) +
        '" stroke="rgba(255,59,78,.55)" stroke-width=".6" stroke-dasharray="2 2"/>' : '') +
      '<path d="' + d + '" fill="none" stroke="var(--neon,#cf0)" stroke-width=".9" ' +
      'stroke-linejoin="round" vector-effect="non-scaling-stroke" opacity=".85"/>' +
    '</svg></div>';
  }

  function gradeCopy(g){
    return g === 'A' ? tx(C.gA) : g === 'B' ? tx(C.gB) : g === 'C' ? tx(C.gC)
         : g === 'D' ? tx(C.gD) : g === 'F' ? tx(C.gF) : tx(C.gNA);
  }
  function gradeRec(g){
    return g === 'A' || g === 'B' ? tx(C.recKeep) : g === 'C' ? tx(C.recCtx)
         : g === 'n/a' ? tx(C.recNa) : tx(C.recDrop);
  }

  function pct1(v){ return Number(v).toFixed(v >= 10 ? 0 : 1); }

  /* the luck check, spelled out rather than left as a Greek letter */
  function luckHTML(res){
    if (!isNum(res.p)) return '';
    var raw = res.p <= 1 / PTRIALS ? (L() === 'th' ? 'ไม่มีเลย' : 'none')
            : Math.round(res.p * 100) + '%';
    var line = tx(C.pRaw).replace('{v}', raw);
    var adj = isNum(res.pAdj)
      ? '<br>' + esc(tx(C.pAdjL).replace('{n}', state.nTests || '?')
          .replace('{v}', res.pAdj >= 1 ? (L() === 'th' ? 'อธิบายด้วยความบังเอิญได้ทั้งหมด' : 'fully explainable by chance')
                                        : Math.round(res.pAdj * 100) + '%'))
      : '';
    return '<div class="pf-miss"><b>' + esc(tx(C.pLab)) + '</b> ' + esc(line) + adj + '</div>';
  }

  function onHTML(res){
    if (!isNum(res.onRate)) return '';
    var hot = res.onRate >= 35;
    return '<div class="pf-sub" style="margin-top:-4px' + (hot ? ';color:var(--amber,#ffb020)' : '') + '">' +
      esc(tx(C.onRate).replace('{p}', pct1(res.onRate))) +
      (hot ? ' — ' + esc(tx(C.onWarn)) : '') + '</div>';
  }

  function cardHTML(res, spec){
    var g = res.grade;
    var th = spec && spec.thresholds;
    var desc = res.combo ? tx({ en:res.en_d || '', th:res.th_d || res.en_d || '' }) : '';
    return '<div class="pf-card g-' + (g === 'n/a' ? 'na' : g) + '">' +
      '<div class="pf-ch"><div><div class="pf-name">' + esc(tx(res)) + '</div>' +
        '<div class="pf-sub">' + (res.combo ? esc(tx(C.comboKind)) + ' · ' : '') +
          esc(gradeRec(g)) + (res.first ? ' · ' + esc(res.first) + ' →' : '') + '</div></div>' +
        '<div class="pf-grade">' + esc(g === 'n/a' ? '—' : g) + '</div></div>' +
      onHTML(res) +
      (desc ? '<div class="pf-verdict" style="font-size:12px;">' + esc(desc) + '</div>' : '') +
      sparkline(res.series, th) +
      '<div class="pf-nums">' +
        '<div class="pf-n"><div class="pf-nl">' + esc(tx(C.ep)) + '</div><div class="pf-nv">' + res.n + '</div></div>' +
        '<div class="pf-n"><div class="pf-nl">' + esc(tx(C.after)) + '</div><div class="pf-nv ' +
          (isNum(res.med) && res.med < 0 ? 'down' : 'up') + '">' + (isNum(res.med) ? sgn(res.med, 1) + '%' : '—') + '</div></div>' +
        '<div class="pf-n"><div class="pf-nl">' + esc(tx(C.base)) + '</div><div class="pf-nv">' +
          (isNum(res.base) ? sgn(res.base, 1) + '%' : '—') + '</div></div>' +
        '<div class="pf-n"><div class="pf-nl">' + esc(tx(C.edge)) + '</div><div class="pf-nv ' +
          (isNum(res.edge) && res.edge < 0 ? 'down' : 'up') + '">' + (isNum(res.edge) ? sgn(res.edge, 1) + ' pts' : '—') + '</div></div>' +
      '</div>' +
      '<div class="pf-verdict">' + esc(gradeCopy(g)) +
        (isNum(res.negRate) && res.n ? ' <b>' + esc(tx(C.downRate).replace('{p}', Math.round(res.negRate))) + '</b>' : '') +
      '</div>' +
      luckHTML(res) +
      (res.worst ? '<div class="pf-miss">' + esc(tx(C.missH)) + ' <b>' + esc(res.worst.d) + '</b> → ' +
        sgn(res.worst.r, 1) + '%<br>' + esc(tx(C.bestH)) + ' <b>' + esc(res.best.d) + '</b> → ' +
        sgn(res.best.r, 1) + '%</div>' : '') +
    '</div>';
  }

  function btBody(){
    var d = state.data;
    if (state.loading) return '<div class="pf-empty">' + esc(tx(C.loading)) + '</div>';
    if (state.tried && !d) return '<div class="pf-empty">' + esc(tx(C.noFile)) + '</div>';
    if (!d) return '<div class="pf-empty">' + esc(tx(C.loading)) + '</div>';

    var specs = {};
    (d.gauges || []).forEach(function(g){ specs[g.k] = g; });
    var res = state.results || [];
    var years = '';
    if (d.gauges && d.gauges.length) {
      var firsts = d.gauges.map(function(g){ return g.first; }).filter(Boolean).sort();
      if (firsts.length) years = firsts[0] + ' → ' + (d.gauges[0].last || '');
    }

    var combos = state.combos || [];
    var counts = { A:0, B:0, C:0, D:0, F:0, 'n/a':0 };
    res.concat(combos).forEach(function(x){ counts[x.grade] = (counts[x.grade] || 0) + 1; });

    var summary = res.length ? '<div class="pf-sum">' +
      [['A+B', counts.A + counts.B, 'var(--neon-2,#7CFFB2)'],
       ['C', counts.C, 'var(--amber,#ffb020)'],
       ['D+F', counts.D + counts.F, 'var(--red,#ff3b4e)']].map(function(x){
        return '<div><div class="pf-nl">' + x[0] + '</div><div class="pf-nv" style="color:' + x[2] + '">' +
               x[1] + '</div></div>';
      }).join('') + '</div>' : '';

    var markets = '<span class="pf-status" style="flex:0 0 auto">' + esc(tx(C.market)) + '</span>' +
      '<span class="pf-sel">' +
        '<button type="button" class="pf-h' + (state.bench === 'SPY' ? ' on' : '') +
          '" data-bench="SPY">' + esc(tx(C.mUS)) + '</button>' +
        '<button type="button" class="pf-h' + (state.bench === 'SET' ? ' on' : '') +
          '" data-bench="SET"' + (hasSet() ? '' : ' disabled title="' + esc(tx(C.noSet)) + '"') +
          '>' + esc(tx(C.mTH)) + '</button>' +
      '</span>';

    var comboGrid = combos.length
      ? '<div class="pf-grid">' + combos.map(function(x){ return cardHTML(x, null); }).join('') + '</div>'
      : '';

    return '<div class="pf-run">' +
        '<button type="button" class="pf-btn" data-pf="run">' +
          esc(res.length ? tx(C.rerun) : tx(C.run)) + '</button>' +
        '<span class="pf-status" style="flex:0 0 auto">' + esc(tx(C.horizon)) + '</span>' +
        '<span class="pf-sel">' + [21,63,126,252].map(function(h){
          return '<button type="button" class="pf-h' + (state.horizon === h ? ' on' : '') +
                 '" data-h="' + h + '">' + esc(tx(C['h' + h])) + '</button>';
        }).join('') + '</span>' +
        '<span class="pf-prog" data-pf="prog"><i></i></span>' +
        markets +
        '<span class="pf-status" style="flex-basis:100%">' +
          esc(tx(C.ready).replace('{n}', (d.gauges || []).length + (d.combos || []).length)
              .replace('{a}', years).replace('{b}', benchName())) +
          ' · ' + esc(tx(C.resNote)) + '</span>' +
      '</div>' + summary +
      (res.length ? '<div class="pf-grid">' + res.map(function(x){ return cardHTML(x, specs[x.k]); }).join('') + '</div>'
                  : '<div class="pf-empty">' + esc(tx(C.run)) + '</div>') +
      (comboGrid ? '<div class="pf-sec"><h3 class="pf-sech">' + esc(tx(C.comboH)) + '</h3>' +
        '<p class="pf-secl">' + esc(tx(C.comboL)) + '</p>' + comboGrid + '</div>' : '') +
      (res.length ? '<div class="pf-note" style="border-color:var(--neon,#cf0)">' + esc(tx(C.setNote)) + '</div>' : '') +
      '<div class="pf-sec"><h3 class="pf-sech">' + esc(tx(C.method)) + '</h3>' +
        '<p class="pf-secl">' + esc(d.method || '') + '</p></div>' +
      '<div class="pf-note">' + esc(tx(C.note)) + '</div>';
  }

  function ckBody(){
    var rows = state.checks;
    if (!rows) return '<div class="pf-run">' +
      '<button type="button" class="pf-btn" data-pf="check">' + esc(tx(C.run)) + '</button>' +
      '<span class="pf-status">' + esc(tx(C.ckL)) + '</span></div>';
    var pass = rows.filter(function(r){ return r.ok === true; }).length;
    var fail = rows.filter(function(r){ return r.ok === false; }).length;
    var skip = rows.filter(function(r){ return r.ok === null; }).length;
    return '<div class="pf-run">' +
        '<button type="button" class="pf-btn" data-pf="check">' + esc(tx(C.rerun)) + '</button>' +
        '<span class="pf-status">' +
          '<b style="color:var(--neon-2,#7CFFB2)">' + pass + '</b> ' + esc(tx(C.ckPassed)) + ' · ' +
          '<b style="color:' + (fail ? 'var(--red,#ff3b4e)' : 'var(--grey-dim)') + '">' + fail + '</b> ' +
          esc(tx(C.ckFailed)) + ' · ' + skip + ' ' + esc(tx(C.ckSkipped)) + '</span>' +
      '</div>' +
      '<div class="pf-check">' + rows.map(function(r){
        var cls = r.ok === true ? 'pass' : r.ok === false ? 'fail' : 'skip';
        var lab = r.ok === true ? tx(C.pass) : r.ok === false ? tx(C.fail) : tx(C.skip);
        return '<div class="pf-crow">' +
          '<span class="pf-cflag ' + cls + '">' + esc(lab) + '</span>' +
          '<span class="pf-cname">' + esc(r.name) + '</span>' +
          '<span></span>' +
          '<span class="pf-cdet">' + (r.detail || '') + '</span>' +
        '</div>';
      }).join('') + '</div>' +
      '<div class="pf-note">' + esc(tx(C.note)) + '</div>';
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-pf="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(C.eyebrow);
    if (q('h')) q('h').textContent = tx(C.h);
    if (q('lede')) q('lede').textContent = tx(C.lede);
    var tabs = q('tabs');
    if (tabs) {
      tabs.innerHTML =
        '<button type="button" class="pf-tab' + (state.tab === 'bt' ? ' on' : '') + '" data-tab="bt">' +
          esc(tx(C.tabBt)) + '</button>' +
        '<button type="button" class="pf-tab' + (state.tab === 'ck' ? ' on' : '') + '" data-tab="ck">' +
          esc(tx(C.tabCk)) + '</button>';
    }
    var body = q('body');
    if (body) {
      body.innerHTML = state.tab === 'bt'
        ? '<h3 class="pf-sech" style="margin-bottom:6px;">' + esc(tx(C.h)) + '</h3>' + btBody()
        : '<h3 class="pf-sech" style="margin-bottom:6px;">' + esc(tx(C.ckH)) + '</h3>' +
          '<p class="pf-secl">' + esc(tx(C.ckL)) + '</p>' + ckBody();
    }
    wire();

    /* Arriving here by a bookmark or a #/proof link used to leave the screen
       stuck on "loading" forever, because only a nav click fetched the file.
       Fetch as soon as the screen is actually on-stage instead. */
    if (state.tab === 'bt' && !state.data && !state.loading && !state.tried &&
        sec.offsetParent !== null) {
      setTimeout(ensureData, 0);
    }
  }

  function wire(){
    sec.querySelectorAll('[data-tab]').forEach(function(b){
      b.addEventListener('click', function(){
        state.tab = b.getAttribute('data-tab');
        if (state.tab === 'bt') ensureData();
        paint();
      });
    });
    sec.querySelectorAll('[data-h]').forEach(function(b){
      b.addEventListener('click', function(){
        state.horizon = parseInt(b.getAttribute('data-h'), 10);
        if (state.results) { runAll(paint); } else { paint(); }
      });
    });
    sec.querySelectorAll('[data-bench]').forEach(function(b){
      b.addEventListener('click', function(){
        if (b.disabled) return;
        state.bench = b.getAttribute('data-bench');
        if (state.results) { runAll(paint); } else { paint(); }
      });
    });
    var run = sec.querySelector('[data-pf="run"]');
    if (run) run.addEventListener('click', function(){
      run.disabled = true;
      run.textContent = tx(C.running);
      ensureData(function(){ runAll(paint); });
    });
    var chk = sec.querySelector('[data-pf="check"]');
    if (chk) chk.addEventListener('click', function(){
      chk.disabled = true;
      chk.textContent = tx(C.running);
      setTimeout(function(){ state.checks = buildChecks() || []; paint(); }, 260);
    });
  }

  function ensureData(then){
    if (state.data) { if (then) then(); return; }
    if (state.loading) return;
    state.loading = true;
    paint();
    fetch('data/backtest.json?v=' + Math.floor(Date.now() / 3.6e6))
      .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(d){ state.data = d; state.loading = false; state.tried = true; paint(); if (then) then(); },
            function(){ state.loading = false; state.tried = true; paint(); });
  }

  function build(){
    if (document.getElementById('proof')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'proof';
    sec.setAttribute('data-route', 'proof');
    sec.innerHTML =
      '<div class="pf-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-pf="eb"></span></div>' +
          '<h2 data-pf="h"></h2>' +
          '<p class="lede" data-pf="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div class="pf-tabs" data-pf="tabs"></div>' +
        '<div data-pf="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'proof', after:'regime',
      t:{en:'Proof Lab — test the radar',th:'ทดสอบเรดาร์'},
      d:{en:'Run every gauge back through 12–25 years of history and grade it on whether the market actually behaved differently — plus a self-check that recomputes the live numbers from their own inputs.',
         th:'รันมาตรวัดทุกตัวย้อนกลับไป 12–25 ปี แล้วให้เกรดว่าตลาดทำอะไรต่างจริงไหม พร้อมการตรวจสอบตัวเองที่คำนวณตัวเลขสดใหม่จากวัตถุดิบของมันเอง'}
    });

    sec.__render = paint;
    paint();
    return true;
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 400);
    new MutationObserver(paint).observe(document.documentElement,
      { attributes:true, attributeFilter:['lang'] });
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('[data-route-to="proof"]');
      if (a) setTimeout(function(){ ensureData(); }, 300);
    });
    window.addEventListener('hashchange', function(){
      if (/proof/.test(location.hash)) setTimeout(paint, 260);
    });
  }

  window.__SPZ_PROOF = { paint: paint, state: state, checks: buildChecks, run: runAll };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1300); });
  } else {
    setTimeout(boot, 1300);
  }
})();
