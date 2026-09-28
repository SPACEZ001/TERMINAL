
(function(){
  'use strict';
  if (window.__SPZ_RULELAB) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }

  var T = {
    eyebrow:{en:'RULE LAB',th:'ห้องทดลองกฎ'},
    h:{en:'Build Your Own Warning Rule, Then Test It',th:'ประกอบกฎเตือนภัยของตัวเอง แล้วทดสอบย้อนหลัง'},
    lede:{en:'Proof Lab grades each gauge alone and five combinations the site chose ahead of time. Here you pick any set of gauges yourself, decide how strict the rule should be, and this re-runs the exact same 12-25 year history to see what actually happened afterward — no guessing, no cherry-picking after the fact.',
      th:'หน้าทดสอบเรดาร์ให้เกรดทีละตัวชี้วัดและชุดค่าผสม 5 แบบที่เว็บเลือกไว้ล่วงหน้า ส่วนหน้านี้ให้คุณเลือกตัวชี้วัดเองกี่ตัวก็ได้ กำหนดว่ากฎควรเข้มแค่ไหน แล้วรันย้อนหลัง 12-25 ปีชุดเดียวกันเพื่อดูว่าหลังจากนั้นเกิดอะไรขึ้นจริง — ไม่เดา ไม่เลือกข้อมูลย้อนหลังทีหลัง'},
    pickH:{en:'PICK GAUGES',th:'เลือกตัวชี้วัด'},
    logicH:{en:'RULE',th:'เงื่อนไข'},
    logicAnd:{en:'ALL picked must be red',th:'ต้องแดง "ทั้งหมด" ที่เลือก'},
    logicCount:{en:'At least this many red:',th:'แดงอย่างน้อยกี่ตัว:'},
    horizonH:{en:'MEASURE THE MARKET OVER',th:'วัดตลาดในช่วง'},
    h21:{en:'1 month',th:'1 เดือน'}, h63:{en:'3 months',th:'3 เดือน'},
    h126:{en:'6 months',th:'6 เดือน'}, h252:{en:'12 months',th:'12 เดือน'},
    marketH:{en:'MARKET',th:'ตลาด'}, mUS:{en:'US · S&P 500',th:'สหรัฐฯ · S&P 500'},
    mTH:{en:'Thai · SET',th:'ไทย · SET'},
    run:{en:'TEST THIS RULE',th:'ทดสอบกฎนี้'},
    hint0:{en:'Pick at least one gauge above to test it.',th:'เลือกตัวชี้วัดอย่างน้อย 1 ตัวก่อนทดสอบ'},
    running:{en:'Running…',th:'กำลังคำนวณ…'},
    waiting:{en:'Loading backtest history…',th:'กำลังโหลดข้อมูลย้อนหลัง…'},
    noFile:{en:'Backtest data isn’t available right now — try again after the next daily refresh.',
      th:'ยังดึงข้อมูล backtest ไม่ได้ตอนนี้ — ลองใหม่หลังรอบรีเฟรชถัดไป'},
    noSet:{en:'Thai history too short yet',th:'ข้อมูลไทยยังสั้นเกินไป'},
    ruleAnd:{en:'When ALL of: {names} were red at once',th:'เมื่อ "ทุกตัว" ใน: {names} แดงพร้อมกัน'},
    ruleCount:{en:'When at least {n} of: {names} were red',th:'เมื่ออย่างน้อย {n} ตัวจาก: {names} แดง'},
    ep:{en:'EPISODES',th:'ครั้งที่เกิด'}, after:{en:'MEDIAN AFTER',th:'ค่ากลางหลังจากนั้น'},
    base:{en:'USUAL MEDIAN',th:'ค่ากลางทั่วไป'}, edge:{en:'EDGE',th:'ส่วนต่าง'},
    neg:{en:'FELL AFTERWARD',th:'ลงหลังจากนั้น'}, pval:{en:'p-VALUE (RAW)',th:'p-VALUE (ดิบ)'},
    tooFew:{en:'Fewer than 3 episodes in the whole history — too few to grade or trust. Pick a looser rule (fewer gauges, or "at least N" instead of "all").',
      th:'เกิดน้อยกว่า 3 ครั้งในประวัติทั้งหมด — น้อยเกินกว่าจะให้เกรดหรือเชื่อได้ ลองปรับกฎให้หลวมขึ้น (เลือกตัวชี้วัดน้อยลง หรือใช้ "อย่างน้อย N ตัว" แทน "ทั้งหมด")'},
    gA:{en:'Historically this rule was followed by a meaningfully worse market than usual, consistently enough that it’s unlikely to be chance.',
        th:'ในอดีตหลังกฎนี้ตลาดแย่กว่าปกติอย่างมีนัยสำคัญ สม่ำเสมอพอที่จะไม่ใช่แค่เรื่องบังเอิญ'},
    gB:{en:'Historically this rule was followed by a somewhat worse market than usual.',
        th:'ในอดีตหลังกฎนี้ตลาดแย่กว่าปกติในระดับหนึ่ง'},
    gC:{en:'A small, inconsistent edge — worth watching, not worth trusting alone.',
        th:'ส่วนต่างเล็กน้อยและไม่สม่ำเสมอ — เฝ้าดูได้ แต่อย่าเชื่อตัวเดียวโดด ๆ'},
    gD:{en:'Barely any difference from a random time — this rule alone told you almost nothing.',
        th:'แทบไม่ต่างจากช่วงเวลาสุ่ม — กฎนี้เดี่ยว ๆ แทบไม่บอกอะไรเลย'},
    gF:{en:'The market historically did fine — or better — after this rule fired. It was not a warning.',
        th:'ในอดีตตลาดกลับไปได้ดี — หรือดีกว่าปกติ — หลังกฎนี้ทำงาน มันไม่ใช่สัญญาณเตือน'},
    epH:{en:'When this rule fired (first 12):',th:'ครั้งที่กฎนี้ทำงาน (12 ครั้งแรก):'},
    note:{en:'This tests one rule you chose, once — there is no correction here for trying many combinations the way Proof Lab does, so treat a good-looking result with real caution, especially with few episodes. Historical patterns can and do stop working. Educational use only, not investment advice.',
      th:'นี่คือการทดสอบกฎเดียวที่คุณเลือกเอง ไม่ได้ปรับแก้ทางสถิติสำหรับการลองหลายชุดค่าผสมแบบหน้าทดสอบเรดาร์ ดังนั้นแม้ผลจะดูดีก็ควรระวังไว้ก่อน โดยเฉพาะถ้าเกิดน้อยครั้ง รูปแบบในอดีตหยุดใช้ได้จริงเสมอ ใช้เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน'}
  };

  var state = { data:null, tried:false, picked:{}, mode:'and', n:2, horizon:63, bench:'SPY', result:null };

  function fetchData(){
    if (state.data || state.tried) return;
    state.tried = true;
    fetch('data/backtest.json?v=' + Math.floor(Date.now() / 3.6e6))
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(d){ state.data = d || false; paint(); })
      .catch(function(){ state.data = false; paint(); });
  }

  function gauges(){
    var d = state.data;
    return (d && d.gauges || []).filter(function(g){ return g.thresholds; });
  }

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
  function benchArr(){
    var d = state.data || {};
    return (state.bench === 'SET' && hasSet()) ? d.bench_series_th : (d.bench_series || []);
  }
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
      p: pValue(med, fwd.length, pool), eps: eps
    };
  }
  function gradeIt(r){
    if (!isNum(r.edge) || r.n < 3) return 'n/a';
    if (r.edge <= -4 && r.n >= 5 && isNum(r.p) && r.p <= 0.20) return 'A';
    if (r.edge <= -2 && r.n >= 4 && isNum(r.p) && r.p <= 0.50) return 'B';
    if (r.edge <= -0.75) return 'C';
    if (r.edge < 0) return 'D';
    return 'F';
  }
  var COOL_W = 8;

  function weekTable(gs){
    var d = state.data, weeks = {}, order = [];
    gs.forEach(function(g){
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

  function runRule(){
    var d = state.data;
    var picked = gauges().filter(function(g){ return state.picked[g.k]; });
    if (!picked.length) return null;
    var tbl = weekTable(picked);
    var flags = [], dates = [];
    for (var i = 0; i < tbl.length; i++) {
      var st = tbl[i].st;
      var avail = 0, red = 0, missing = false;
      picked.forEach(function(g){
        var s = st[g.k];
        if (!s || s === 'na') { missing = true; return; }
        avail++;
        if (s === 'alert') red++;
      });
      dates.push(tbl[i].d);
      if (state.mode === 'and') {
        flags.push(!missing && red === picked.length);
      } else {
        flags.push(!missing && red >= Math.min(state.n, picked.length));
      }
    }
    var eps = episodesFromFlags(flags, dates, COOL_W);
    var arr = benchArr() || [];
    if (arr.length < 100) return { picked:picked, n:0, grade:'n/a', tooFew:true };
    var weeks = Math.max(1, Math.round(state.horizon / 5));
    var r = scoreEpisodes(eps, arr, weeks);
    r.grade = gradeIt(r);
    r.picked = picked;
    r.onRate = flags.length ? (flags.filter(Boolean).length / flags.length * 100) : 0;
    r.tooFew = r.n < 3;
    return r;
  }

  function pickHTML(){
    return gauges().map(function(g){
      return '<button type="button" class="rl-chip' + (state.picked[g.k] ? ' on' : '') +
        '" data-rl-g="' + esc(g.k) + '">' + esc(tx(g)) + '</button>';
    }).join('');
  }

  function pickedCount(){ return Object.keys(state.picked).filter(function(k){ return state.picked[k]; }).length; }

  function panelHTML(){
    var pc = pickedCount();
    return '<div class="rl-panel">' +
      '<div class="rl-row"><span class="rl-lab">' + esc(tx(T.pickH)) + '</span>' + pickHTML() + '</div>' +
      '<div class="rl-row"><span class="rl-lab">' + esc(tx(T.logicH)) + '</span>' +
        '<button type="button" class="rl-chip' + (state.mode === 'and' ? ' on' : '') + '" data-rl-mode="and">' +
          esc(tx(T.logicAnd)) + '</button>' +
        '<button type="button" class="rl-chip' + (state.mode === 'count' ? ' on' : '') + '" data-rl-mode="count">' +
          esc(tx(T.logicCount)) + '</button>' +
        (state.mode === 'count' ? '<input class="rl-n" type="number" min="1" max="' + Math.max(1, pc) +
          '" value="' + Math.min(state.n, Math.max(1, pc)) + '" data-rl="n">' : '') +
      '</div>' +
      '<div class="rl-row"><span class="rl-lab">' + esc(tx(T.horizonH)) + '</span>' +
        [21,63,126,252].map(function(h){
          return '<button type="button" class="rl-h' + (state.horizon === h ? ' on' : '') +
            '" data-rl-h="' + h + '">' + esc(tx(T['h' + h])) + '</button>';
        }).join('') +
      '</div>' +
      '<div class="rl-row"><span class="rl-lab">' + esc(tx(T.marketH)) + '</span>' +
        '<button type="button" class="rl-h' + (state.bench === 'SPY' ? ' on' : '') + '" data-rl-bench="SPY">' +
          esc(tx(T.mUS)) + '</button>' +
        '<button type="button" class="rl-h' + (state.bench === 'SET' ? ' on' : '') + '" data-rl-bench="SET"' +
          (hasSet() ? '' : ' disabled title="' + esc(tx(T.noSet)) + '"') + '>' + esc(tx(T.mTH)) + '</button>' +
      '</div>' +
      '<div class="rl-row">' +
        '<button type="button" class="rl-run" data-rl="run"' + (pc ? '' : ' disabled') + '>' + esc(tx(T.run)) + '</button>' +
        '<span class="rl-hint">' + (pc ? '' : esc(tx(T.hint0))) + '</span>' +
      '</div>' +
    '</div>';
  }

  function resultHTML(){
    var r = state.result;
    if (!r) return '';
    var names = r.picked.map(function(g){ return tx(g); }).join(', ');
    var ruleTxt = state.mode === 'and'
      ? tx(T.ruleAnd).replace('{names}', names)
      : tx(T.ruleCount).replace('{n}', Math.min(state.n, r.picked.length)).replace('{names}', names);
    if (r.tooFew) {
      return '<div class="rl-result"><div class="rl-rh">' +
        '<div class="rl-grade g-na">—</div>' +
        '<div><div class="rl-rule">' + esc(ruleTxt) + '</div>' +
        '<div class="rl-sub">' + (r.n || 0) + ' ' + esc(tx(T.ep).toLowerCase()) + '</div></div></div>' +
        '<div class="rl-verdict">' + esc(tx(T.tooFew)) + '</div></div>';
    }
    var gKey = r.grade === 'n/a' ? 'na' : r.grade;
    var gCopy = { A:T.gA, B:T.gB, C:T.gC, D:T.gD, F:T.gF }[r.grade] || null;
    return '<div class="rl-result">' +
      '<div class="rl-rh"><div class="rl-grade g-' + gKey + '">' + (r.grade === 'n/a' ? '—' : r.grade) + '</div>' +
        '<div><div class="rl-rule">' + esc(ruleTxt) + '</div>' +
        '<div class="rl-sub">' + r.n + ' ' + esc(tx(T.ep).toLowerCase()) + ' · ' +
          esc(tx(T['h' + state.horizon])) + ' · ' + esc(tx(state.bench === 'SET' ? T.mTH : T.mUS)) + '</div></div></div>' +
      '<div class="rl-nums">' +
        '<div><div class="rl-nl">' + esc(tx(T.ep)) + '</div><div class="rl-nv">' + r.n + '</div></div>' +
        '<div><div class="rl-nl">' + esc(tx(T.after)) + '</div><div class="rl-nv ' + (isNum(r.med) && r.med < 0 ? 'dn' : 'up') + '">' +
          (isNum(r.med) ? sgn(r.med, 1) + '%' : '—') + '</div></div>' +
        '<div><div class="rl-nl">' + esc(tx(T.base)) + '</div><div class="rl-nv">' +
          (isNum(r.base) ? sgn(r.base, 1) + '%' : '—') + '</div></div>' +
        '<div><div class="rl-nl">' + esc(tx(T.edge)) + '</div><div class="rl-nv ' + (isNum(r.edge) && r.edge < 0 ? 'dn' : 'up') + '">' +
          (isNum(r.edge) ? sgn(r.edge, 1) + ' pts' : '—') + '</div></div>' +
        '<div><div class="rl-nl">' + esc(tx(T.neg)) + '</div><div class="rl-nv">' +
          (isNum(r.negRate) ? Math.round(r.negRate) + '%' : '—') + '</div></div>' +
        '<div><div class="rl-nl">' + esc(tx(T.pval)) + '</div><div class="rl-nv">' +
          (isNum(r.p) ? r.p.toFixed(2) : '—') + '</div></div>' +
      '</div>' +
      (gCopy ? '<div class="rl-verdict">' + esc(tx(gCopy)) + '</div>' : '') +
      (r.eps && r.eps.length ? '<div class="rl-eps">' + esc(tx(T.epH)) + ' ' + r.eps.slice(0, 12).join(', ') + '</div>' : '') +
      '<div class="rl-note">' + esc(tx(T.note)) + '</div>' +
    '</div>';
  }

  function bodyHTML(){
    if (state.data === false) return '<div class="ss-empty">' + esc(tx(T.noFile)) + '</div>';
    if (!state.data) return '<div class="ss-empty">' + esc(tx(T.waiting)) + '</div>';
    return panelHTML() + resultHTML();
  }

  var sec = null;

  function bind(body){
    body.querySelectorAll('[data-rl-g]').forEach(function(b){
      b.addEventListener('click', function(){
        var k = b.getAttribute('data-rl-g');
        state.picked[k] = !state.picked[k];
        state.result = null;
        paint();
      });
    });
    body.querySelectorAll('[data-rl-mode]').forEach(function(b){
      b.addEventListener('click', function(){ state.mode = b.getAttribute('data-rl-mode'); paint(); });
    });
    body.querySelectorAll('[data-rl-h]').forEach(function(b){
      b.addEventListener('click', function(){ state.horizon = parseInt(b.getAttribute('data-rl-h'), 10); paint(); });
    });
    body.querySelectorAll('[data-rl-bench]').forEach(function(b){
      if (b.disabled) return;
      b.addEventListener('click', function(){ state.bench = b.getAttribute('data-rl-bench'); paint(); });
    });
    var nIn = body.querySelector('[data-rl="n"]');
    if (nIn) nIn.addEventListener('change', function(){ state.n = Math.max(1, parseInt(nIn.value, 10) || 1); });
    var runBtn = body.querySelector('[data-rl="run"]');
    if (runBtn) runBtn.addEventListener('click', function(){
      state.result = runRule();
      paint();
    });
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-rl="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(T.eyebrow);
    if (q('h')) q('h').textContent = tx(T.h);
    if (q('lede')) q('lede').textContent = tx(T.lede);
    var body = q('body');
    if (!body) return;
    body.innerHTML = bodyHTML();
    bind(body);
  }

  function build(){
    if (document.getElementById('rulelab')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'rulelab';
    sec.setAttribute('data-route', 'rulelab');
    sec.innerHTML =
      '<div class="rl-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-rl="eb"></span></div>' +
          '<h2 data-rl="h"></h2>' +
          '<p class="lede" data-rl="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-rl="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'rulelab', feat:true, after:'correl',
      t:{en:'Rule Lab',th:'ห้องทดลองกฎ'},
      d:{en:'Pick your own combination of early-warning gauges, choose how strict the rule is, and re-run 12-25 years of history to see what actually followed. Admin-only.',
         th:'เลือกตัวชี้วัดเตือนล่วงหน้าผสมกันเอง กำหนดความเข้มของกฎ แล้วรันย้อนหลัง 12-25 ปีดูว่าหลังจากนั้นเกิดอะไรจริง เฉพาะแอดมิน'}
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
    new MutationObserver(paint)
      .observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
  }

  window.__SPZ_RULELAB = { repaint: paint };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1100); });
  } else {
    setTimeout(boot, 1100);
  }
})();
