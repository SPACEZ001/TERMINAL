
(function(){
  'use strict';
  if (window.__SPZ_WATCH) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }

  /* =========================================================
     PART ONE — where each screen's numbers actually come from
     ========================================================= */
  var SRC = {
    live:{ ic:'', en:'LIVE · EVERY 30 MIN', th:'สด · ทุก 30 นาที',
      tip:{en:'Every figure on this screen is rebuilt from the market snapshot the site refreshes every half hour.',
           th:'ทุกตัวเลขในหน้านี้สร้างใหม่จากข้อมูลตลาดที่เว็บดึงมาใหม่ทุกครึ่งชั่วโมง'} },
    daily:{ ic:'', en:'LIVE · ONCE A DAY', th:'สด · วันละครั้ง',
      tip:{en:'Rebuilt once a day by the job that re-runs the backtest over the full history.',
           th:'สร้างใหม่วันละครั้งโดยงานที่รันการทดสอบย้อนหลังทั้งชุด'} },
    mixed:{ ic:'◐', en:'PART LIVE · PART WRITTEN', th:'ครึ่งสด · ครึ่งเขียนไว้',
      tip:{en:'Some of this screen refreshes itself and some of it was written by hand in August 2026. The screen says which is which where it matters.',
           th:'บางส่วนของหน้านี้อัปเดตเอง บางส่วนเขียนด้วยมือเมื่อสิงหาคม 2026 ในจุดที่สำคัญ หน้านั้นจะบอกว่าส่วนไหนเป็นแบบไหน'} },
    frozen:{ ic:'', en:'WRITTEN AUG 2026 · DOES NOT UPDATE', th:'เขียนไว้ ส.ค. 2026 · ไม่อัปเดต',
      tip:{en:'Typed once and frozen. Treat every number here as a dated illustration and check the source before relying on it.',
           th:'พิมพ์ครั้งเดียวแล้วหยุดนิ่ง ให้ถือว่าทุกตัวเลขในหน้านี้เป็นตัวอย่างที่มีวันที่กำกับ และตรวจกับแหล่งต้นทางก่อนใช้'} },
    teach:{ ic:'', en:'TEACHING EXAMPLES', th:'ตัวเลขตัวอย่างเพื่อสอน',
      tip:{en:'The numbers here exist to explain an idea, not to quote a market. The live versions are on the stock screens.',
           th:'ตัวเลขตรงนี้มีไว้อธิบายแนวคิด ไม่ใช่ราคาจริง ตัวเลขจริงอยู่ในหน้าหุ้น'} },
    sim:{ ic:'', en:'SIMULATED PRACTICE DATA', th:'ข้อมูลจำลองไว้ฝึก',
      tip:{en:'Generated shapes for practising chart reading. Not real prices — never value anything with them.',
           th:'รูปทรงที่สร้างขึ้นเพื่อฝึกอ่านกราฟ ไม่ใช่ราคาจริง ห้ามใช้ประเมินมูลค่าอะไรทั้งสิ้น'} }
  };

  /* Assigned by reading what each screen is actually built from, not by
     guessing from its title. Anything marked mixed has a note inside it
     naming which half is which. */
  var STATUS = {
    now:'mixed', regime:'live', stock:'live', proof:'daily', anomaly:'live',
    correl:'daily', rulelab:'daily', daily:'live',
    flow:'mixed', globe:'mixed', infl:'mixed', directory:'mixed', desk:'mixed',
    outlook:'frozen', scenarios:'frozen', pro:'frozen',
    types:'teach', glossary:'teach', signals:'teach', start:'teach', guided:'teach',
    chartlab:'sim'
  };

  function badgeHTML(kind){
    var s = SRC[kind];
    if (!s) return '';
    return '<span class="spz-src ' + kind + '" title="' + esc(tx(s.tip)) + '">' +
      '<span class="dot"></span><b>' + esc(tx(s)) + '</b></span>';
  }

  function stampBadges(){
    for (var id in STATUS) {
      var sec = document.getElementById(id);
      if (!sec) continue;
      var eb = sec.querySelector('.section-head .eyebrow') || sec.querySelector('.eyebrow');
      if (!eb) continue;
      var old = eb.querySelector('.spz-src');
      if (old) old.remove();
      eb.insertAdjacentHTML('beforeend', badgeHTML(STATUS[id]));
    }
  }

  /* =========================================================
     PART TWO — the memory
     ========================================================= */
  var KEY = 'spz_seen_v1';

  function snapshot(){
    try { return (window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot()) || null; }
    catch(e){ return null; }
  }
  function alerts(){
    try {
      var s = window.__SPZ_REGIME && window.__SPZ_REGIME.score && window.__SPZ_REGIME.score();
      return s ? s.alerts : null;
    } catch(e){ return null; }
  }
  /* Eight, not five. The name sitting fifth and the name sitting sixth are
     usually separated by a rounding error, so comparing the top five alone
     reports a "change" every visit as those two trade places. Keeping eight
     lets the diff ignore a shuffle at the cut and speak up only when a name
     crosses the whole band. */
  function topEight(){
    try {
      if (typeof window.__SPZ_RANK !== 'function') return null;
      var r = window.__SPZ_RANK({});
      if (!r || r.length < 8) return null;
      return r.slice(0, 8).map(function(x){ return x.s.tk; });
    } catch(e){ return null; }
  }

  /* one compact record of "how things stood when you last looked" */
  function reading(){
    var s = snapshot();
    if (!s) return null;
    var reg = s.regime || {};
    var sectors = {};
    ((s.flows && s.flows.sector) || []).forEach(function(r){
      if (r.en && isNum(r.m1)) sectors[r.en] = Math.round(r.m1 * 100) / 100;
    });
    var below = [];
    for (var k in (s.stocks || {})) {
      if (s.stocks[k].above_ma200 === false) below.push(k);
    }
    var cy = window.SPZ_CYCLE;
    return {
      v:1,
      at: Date.now(),
      dataAt: s.generated_at || null,
      phase: cy ? cy.live : null,
      alerts: alerts(),
      breadth: isNum(reg.breadth_200) ? Math.round(reg.breadth_200 * 10) / 10 : null,
      sectors: sectors,
      below: below.sort(),
      top8: topEight(),
      bear: ((reg.divergences || []).filter(function(d){ return d.kind === 'bearish'; })).length
    };
  }

  /* A reading taken before the ranking engine and the radar have settled is
     worse than no reading at all: it becomes the baseline, and every visit
     afterwards reports differences that never happened. */
  function complete(r){
    return !!(r && r.phase && isNum(r.alerts) && r.top8 && r.top8.length === 8 &&
              Object.keys(r.sectors).length >= 8);
  }

  function stored(){
    var raw = lsGet(KEY);
    if (!raw) return null;
    try { var o = JSON.parse(raw); return (o && o.v === 1 && complete(o)) ? o : null; }
    catch(e){ return null; }
  }
  function remember(r){ if (r) lsSet(KEY, JSON.stringify(r)); }

  function leaderOf(sectors){
    var best = null, bv = -1e9;
    for (var k in sectors) if (sectors[k] > bv) { bv = sectors[k]; best = k; }
    return best;
  }
  function laggardOf(sectors){
    var worst = null, wv = 1e9;
    for (var k in sectors) if (sectors[k] < wv) { wv = sectors[k]; worst = k; }
    return worst;
  }
  function sectorName(en){
    var s = snapshot();
    var rows = (s && s.flows && s.flows.sector) || [];
    for (var i = 0; i < rows.length; i++) if (rows[i].en === en) return tx(rows[i]);
    return en;
  }
  function phaseName(p){
    var c = window.SPZ_CYCLE;
    try { return c ? tx(c.label(p)) : p; } catch(e){ return p; }
  }
  function days(ms){ return Math.max(0, Math.floor((Date.now() - ms) / 86400000)); }

  var CH = {
    hNew:{en:'What moved since you last looked',th:'อะไรขยับตั้งแต่คุณดูครั้งล่าสุด'},
    hCalm:{en:'Nothing important moved since you last looked',th:'ไม่มีอะไรสำคัญขยับตั้งแต่คุณดูครั้งล่าสุด'},
    ago:{en:'{d} days ago',th:'{d} วันก่อน'},
    agoToday:{en:'earlier today',th:'เมื่อวันนี้เอง'},
    ack:{en:'Got it — start counting from now',th:'รับทราบ — เริ่มนับใหม่จากตอนนี้'},
    first:{en:'This is the first time this browser has opened this screen, so there is nothing to compare against yet. Come back after a week or two and this box will tell you what moved — the cycle call, which group money is going into, how many gauges are lit, and which names crossed their 200-day line. Nothing is sent anywhere; the reading is kept in this browser only.',
           th:'นี่เป็นครั้งแรกที่เบราว์เซอร์นี้เปิดหน้านี้ จึงยังไม่มีอะไรให้เทียบ กลับมาอีกทีสักหนึ่งถึงสองสัปดาห์ กล่องนี้จะบอกว่าอะไรขยับไปบ้าง — การอ่านวัฏจักร กลุ่มที่เงินไหลเข้า จำนวนมาตรวัดที่ติด และหุ้นตัวไหนข้ามเส้น 200 วัน ข้อมูลไม่ถูกส่งไปไหน เก็บไว้ในเบราว์เซอร์นี้เท่านั้น'},
    calm:{en:'The cycle read, the leading group and the radar are all where they were. That is the normal state — rotation takes months, not days.',
          th:'การอ่านวัฏจักร กลุ่มที่นำ และเรดาร์ ยังอยู่ที่เดิม นั่นคือสภาพปกติ — การหมุนกลุ่มใช้เวลาเป็นเดือน ไม่ใช่เป็นวัน'},

    phase:{en:'The cycle read changed',th:'การอ่านวัฏจักรเปลี่ยน'},
    phaseD:{en:'{a} → {b}. This is the hinge — the leading groups and the whole shortlist move with it.',
            th:'{a} → {b} นี่คือบานพับ — กลุ่มที่นำและรายชื่อทั้งชุดขยับตามมันหมด'},
    alertUp:{en:'More gauges went red',th:'มาตรวัดแดงเพิ่มขึ้น'},
    alertDn:{en:'Fewer gauges are red',th:'มาตรวัดแดงลดลง'},
    alertD:{en:'{a} → {b} of 11. The radar screen has the detail on which ones.',
            th:'{a} → {b} จาก 11 ตัว ดูว่าตัวไหนได้ที่หน้าเรดาร์'},
    lead:{en:'Money is going into a different group',th:'เงินเปลี่ยนกลุ่มที่ไหลเข้า'},
    leadD:{en:'The group taking the most money over a month was {a}, now it is {b}.',
           th:'กลุ่มที่รับเงินมากที่สุดในรอบเดือนเคยเป็น{a} ตอนนี้เป็น{b}'},
    lag:{en:'A different group is being left',th:'กลุ่มที่ถูกทิ้งเปลี่ยนตัว'},
    lagD:{en:'The most-sold group was {a}, now it is {b}.',th:'กลุ่มที่ถูกขายมากที่สุดเคยเป็น{a} ตอนนี้เป็น{b}'},
    flip:{en:'Groups that changed direction',th:'กลุ่มที่กลับทิศ'},
    flipD:{en:'{list}',th:'{list}'},
    brd:{en:'Market breadth crossed a line',th:'ความกว้างของตลาดข้ามเส้น'},
    brdD:{en:'{a}% → {b}%. Above 60 is healthy, below 45 means the index is being carried by fewer and fewer names.',
          th:'{a}% → {b}% เกิน 60 คือแข็งแรง ต่ำกว่า 45 แปลว่าดัชนีถูกแบกด้วยหุ้นน้อยลงเรื่อยๆ'},
    broke:{en:'Names that lost their 200-day line',th:'หุ้นที่หลุดเส้น 200 วัน'},
    fixed:{en:'Names that regained their 200-day line',th:'หุ้นที่กลับขึ้นเหนือเส้น 200 วัน'},
    rank:{en:'The shortlist changed',th:'รายชื่อห้าอันดับแรกเปลี่ยน'},
    rankD:{en:'out: {out} · in: {in}',th:'ออก: {out} · เข้า: {in}'},
    bearUp:{en:'More names are rising on fading momentum',th:'หุ้นที่ขึ้นทั้งที่แรงลดมีมากขึ้น'},
    bearD:{en:'{a} → {b} showing that pattern.',th:'จาก {a} เป็น {b} ตัวที่เป็นรูปแบบนี้'},
    andMore:{en:'and {n} more',th:'และอีก {n} ตัว'}
  };

  var cache = { res:null, at:0 };

  function changes(){
    if (cache.res && Date.now() - cache.at < 20000) return cache.res;
    var cur = reading();
    if (!cur) return null;
    var prev = stored();
    var out = { cur:cur, prev:prev, rows:[], high:0 };

    if (prev) {
      /* the cycle call — everything downstream hangs off it */
      if (prev.phase && cur.phase && prev.phase !== cur.phase) {
        out.rows.push({ sev:'high', i:'⚑', t:tx(CH.phase),
          d:tx(CH.phaseD).replace('{a}', phaseName(prev.phase)).replace('{b}', phaseName(cur.phase)) });
      }
      if (isNum(prev.alerts) && isNum(cur.alerts) && prev.alerts !== cur.alerts) {
        var up = cur.alerts > prev.alerts;
        out.rows.push({ sev: up ? (cur.alerts >= 3 ? 'high' : 'warn') : 'good',
          i: up ? '▲' : '▼', t:tx(up ? CH.alertUp : CH.alertDn),
          d:tx(CH.alertD).replace('{a}', prev.alerts).replace('{b}', cur.alerts) });
      }
      /* where the money is going, and where it is leaving */
      var pl = leaderOf(prev.sectors), cl = leaderOf(cur.sectors);
      if (pl && cl && pl !== cl) {
        out.rows.push({ sev:'high', i:'↔', t:tx(CH.lead),
          d:tx(CH.leadD).replace('{a}', sectorName(pl)).replace('{b}', sectorName(cl)) });
      }
      var pg = laggardOf(prev.sectors), cg = laggardOf(cur.sectors);
      if (pg && cg && pg !== cg) {
        out.rows.push({ sev:'warn', i:'↔', t:tx(CH.lag),
          d:tx(CH.lagD).replace('{a}', sectorName(pg)).replace('{b}', sectorName(cg)) });
      }
      /* groups that crossed from gaining to losing or back */
      var flips = [];
      for (var k in cur.sectors) {
        if (!(k in prev.sectors)) continue;
        var a = prev.sectors[k], b = cur.sectors[k];
        if ((a >= 0) !== (b >= 0)) {
          flips.push('<b>' + esc(sectorName(k)) + '</b> <span class="' + (b >= 0 ? 'up' : 'dn') +
            '">' + sgn(a) + '% → ' + sgn(b) + '%</span>');
        }
      }
      if (flips.length) {
        out.rows.push({ sev:'warn', i:'⇄', t:tx(CH.flip), d:flips.join(' · '), raw:true });
      }
      /* breadth, but only when it crosses a line that means something */
      if (isNum(prev.breadth) && isNum(cur.breadth)) {
        var band = function(v){ return v >= 60 ? 2 : v >= 45 ? 1 : 0; };
        if (band(prev.breadth) !== band(cur.breadth)) {
          out.rows.push({ sev: cur.breadth < prev.breadth ? 'high' : 'good', i:'◧', t:tx(CH.brd),
            d:tx(CH.brdD).replace('{a}', Math.round(prev.breadth)).replace('{b}', Math.round(cur.breadth)) });
        }
      }
      /* names crossing their own 200-day line */
      var pb = {}, i;
      for (i = 0; i < prev.below.length; i++) pb[prev.below[i]] = 1;
      var cb = {};
      for (i = 0; i < cur.below.length; i++) cb[cur.below[i]] = 1;
      var broke = cur.below.filter(function(t){ return !pb[t]; });
      var fixed = prev.below.filter(function(t){ return !cb[t]; });
      function names(list){
        var shown = list.slice(0, 8).map(function(t){ return '<b>$' + esc(t) + '</b>'; }).join(' ');
        return shown + (list.length > 8 ? ' ' + esc(tx(CH.andMore).replace('{n}', list.length - 8)) : '');
      }
      if (broke.length) {
        out.rows.push({ sev: broke.length >= 5 ? 'high' : 'warn', i:'↘',
          t:tx(CH.broke) + ' (' + broke.length + ')', d:names(broke), raw:true });
      }
      if (fixed.length) {
        out.rows.push({ sev:'good', i:'↗',
          t:tx(CH.fixed) + ' (' + fixed.length + ')', d:names(fixed), raw:true });
      }
      /* The shortlist is scored on fundamentals typed in by hand, so the only
         input to it that actually moves over time is the cycle phase. Without
         a phase change, any reshuffle is the ranking engine breaking a tie
         differently — reporting that as news would cry wolf on every visit. */
      var phaseMoved = prev.phase && cur.phase && prev.phase !== cur.phase;
      if (phaseMoved && prev.top8 && cur.top8 && prev.top8.length === 8 && cur.top8.length === 8) {
        var gone = prev.top8.slice(0, 5).filter(function(t){ return cur.top8.indexOf(t) === -1; });
        var came = cur.top8.slice(0, 5).filter(function(t){ return prev.top8.indexOf(t) === -1; });
        if (gone.length || came.length) {
          out.rows.push({ sev:'info', i:'≡', t:tx(CH.rank),
            d:tx(CH.rankD)
              .replace('{out}', gone.map(function(t){ return '$' + t; }).join(' ') || '—')
              .replace('{in}', came.map(function(t){ return '$' + t; }).join(' ') || '—') });
        }
      }
      if (isNum(prev.bear) && cur.bear > prev.bear + 2) {
        out.rows.push({ sev:'warn', i:'◆', t:tx(CH.bearUp),
          d:tx(CH.bearD).replace('{a}', prev.bear).replace('{b}', cur.bear) });
      }
      out.high = out.rows.filter(function(r){ return r.sev === 'high'; }).length;
    }

    cache.res = out; cache.at = Date.now();
    return out;
  }

  function panelHTML(){
    var c = changes();
    if (!c) return '';
    if (!c.prev) {
      return '<div class="wt-panel calm"><div class="wt-h"><span class="wt-hi">◔</span>' +
        '<span class="wt-ht">' + esc(tx(CH.hNew)) + '</span></div>' +
        '<div class="wt-first">' + esc(tx(CH.first)) + '</div></div>';
    }
    var d = days(c.prev.at);
    var when = d < 1 ? tx(CH.agoToday) : tx(CH.ago).replace('{d}', d);

    if (!c.rows.length) {
      return '<div class="wt-panel calm"><div class="wt-h"><span class="wt-hi">✓</span>' +
        '<span class="wt-ht">' + esc(tx(CH.hCalm)) + '</span>' +
        '<span class="wt-hs">' + esc(when) + '</span>' +
        '<button type="button" class="wt-ack" data-wt="ack">' + esc(tx(CH.ack)) + '</button></div>' +
        '<div class="wt-first">' + esc(tx(CH.calm)) + '</div></div>';
    }

    return '<div class="wt-panel"><div class="wt-h"><span class="wt-hi">⚡</span>' +
      '<span class="wt-ht">' + esc(tx(CH.hNew)) + '</span>' +
      '<span class="wt-hs">' + esc(when) + '</span>' +
      '<button type="button" class="wt-ack" data-wt="ack">' + esc(tx(CH.ack)) + '</button></div>' +
      '<div class="wt-rows">' + c.rows.map(function(r){
        return '<div class="wt-r ' + r.sev + '"><span class="wt-ri">' + r.i + '</span>' +
          '<span class="wt-rt">' + esc(r.t) + '</span>' +
          '<span class="wt-rd">' + (r.raw ? r.d : esc(r.d)) + '</span></div>';
      }).join('') + '</div></div>';
  }

  /* a one-line version for the warning strip at the top of every screen */
  function headline(){
    var c = changes();
    if (!c || !c.prev || !c.rows.length) return null;
    var big = c.rows.filter(function(r){ return r.sev === 'high'; });
    if (!big.length) return null;
    return { text: big.slice(0, 2).map(function(r){ return r.t; }).join(' · '),
             n: big.length,
             sig: 'chg:' + big.map(function(r){ return r.t; }).join('|') };
  }

  function ack(){
    var r = reading();
    if (complete(r)) remember(r);
    cache.res = null; cache.at = 0;
    document.dispatchEvent(new CustomEvent('spz:seen'));
  }

  /* the reading is taken when the reader actually opens the What Now screen —
     that is what "last time you looked" means */
  var armed = false;
  function armOnView(){
    if (armed) return;
    var sec = document.getElementById('now');
    if (!sec || !sec.classList.contains('route-on')) return;
    var c = changes();
    if (!c || !complete(c.cur)) return;
    armed = true;
    /* store after a beat, so the panel above is describing the visit you are
       in the middle of rather than being wiped by it */
    setTimeout(function(){
      var fresh = reading();
      if (complete(fresh)) remember(fresh);
    }, 4000);
  }

  window.__SPZ_WATCH = {
    panelHTML: panelHTML, changes: changes, headline: headline, ack: ack,
    reading: reading, stored: stored, remember: remember, complete: complete,
    badge: badgeHTML, status: STATUS, stamp: stampBadges,
    reset: function(){ try { localStorage.removeItem(KEY); } catch(e){} cache.res = null; }
  };

  function tick(){
    stampBadges();
    armOnView();
  }

  function boot(){
    tick();
    setInterval(tick, 2500);
    document.addEventListener('spz:snapshot', function(){ cache.res = null; cache.at = 0; });
    new MutationObserver(stampBadges).observe(document.documentElement,
      { attributes:true, attributeFilter:['lang'] });
    document.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('[data-wt="ack"]');
      if (!b) return;
      ack();
      if (window.__SPZ_NOW && window.__SPZ_NOW.paint) window.__SPZ_NOW.paint();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1500); });
  } else {
    setTimeout(boot, 1500);
  }
})();
