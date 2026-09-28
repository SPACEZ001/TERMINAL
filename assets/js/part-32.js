
(function(){
  'use strict';
  if (window.__SPZ_STOCK) return;

  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  var isNum = function(v){ return typeof v === 'number' && isFinite(v); };
  function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 2 : d); }
  function money(v, ccy){
    if (!isNum(v)) return '—';
    var a = Math.abs(v);
    var s = v.toFixed(a >= 1000 ? 0 : a >= 10 ? 2 : a >= 1 ? 3 : 4);
    return (ccy === 'THB' ? '฿' : '$') + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function big(v){
    if (!isNum(v)) return '—';
    var u = [[1e12,'T'],[1e9,'B'],[1e6,'M']];
    for (var i = 0; i < u.length; i++) if (Math.abs(v) >= u[i][0]) return (v/u[i][0]).toFixed(2) + u[i][1];
    return String(Math.round(v));
  }

  var C = {
    eyebrow:{en:'One stock, one page',th:'หนึ่งหุ้น หนึ่งหน้า'},
    h:{en:'What does this company actually look like?',th:'หุ้นตัวนี้หน้าตาเป็นยังไง'},
    lede:{en:'Everywhere else on this terminal a stock is four numbers on a card, and four numbers cannot tell you anything on their own — a P/E of 15 is cheap for one industry and expensive for another. This page puts every figure next to the companies it should be compared with, draws the real price history behind it, and says in one sentence what the whole thing adds up to. Start with the search box, or come here by clicking any stock anywhere on the site.',
          th:'ที่อื่นในเว็บนี้ หุ้นหนึ่งตัวคือตัวเลขสี่ตัวบนการ์ด และตัวเลขสี่ตัวมันบอกอะไรไม่ได้เลยด้วยตัวเอง — P/E 15 ถูกสำหรับอุตสาหกรรมหนึ่งแต่แพงสำหรับอีกอุตสาหกรรม หน้านี้เอาทุกตัวเลขไปวางข้างบริษัทที่ควรเอามาเทียบกัน วาดราคาจริงย้อนหลังให้ดู แล้วสรุปเป็นประโยคเดียวว่ามันแปลว่าอะไร เริ่มจากช่องค้นหา หรือกดชื่อหุ้นตัวไหนก็ได้จากหน้าอื่นในเว็บ'},

    find:{en:'Search a ticker, a company or an industry…',th:'พิมพ์ชื่อย่อ ชื่อบริษัท หรืออุตสาหกรรม…'},
    all:{en:'All',th:'ทั้งหมด'}, us:{en:'US',th:'สหรัฐฯ'}, th:{en:'Thailand',th:'ไทย'},
    none:{en:'Nothing matches that.',th:'ไม่เจอที่ตรงกับที่พิมพ์'},
    waiting:{en:'Waiting for the market snapshot…',th:'รอข้อมูลตลาด…'},
    back:{en:'← All stocks',th:'← กลับไปรายชื่อหุ้นทั้งหมด'},

    vh:{en:'IN ONE SENTENCE',th:'สรุปเป็นประโยคเดียว'},
    stepsH:{en:'The order to read it in',th:'ลำดับที่ควรดู'},
    stepsL:{en:'You do not have to remember this. Five questions, always in this order — tap one and the answer for this company appears under it. If the first answer is no, the rest do not matter.',
            th:'ไม่ต้องจำครับ ห้าคำถาม เรียงลำดับนี้เสมอ — กดอันไหนคำตอบของหุ้นตัวนี้จะขึ้นข้างใต้ ถ้าข้อแรกตอบว่าไม่ ข้อที่เหลือก็ไม่ต้องดูแล้ว'},

    chartH:{en:'The price, as it actually was',th:'ราคาจริงที่ผ่านมา'},
    chartL:{en:'Real daily closes from the same snapshot the rest of the terminal uses — not the practice data in the Chart Lab. The two averages are the lines most people watch: while price holds above the slow one, the long trend is still up.',
            th:'ราคาปิดรายวันจริงจากชุดข้อมูลเดียวกับที่ทั้งเว็บใช้ ไม่ใช่ข้อมูลฝึกหัดในห้องทดลองกราฟ เส้นค่าเฉลี่ยสองเส้นคือเส้นที่คนส่วนใหญ่ดู — ตราบใดที่ราคายังอยู่เหนือเส้นช้า เทรนด์ยาวยังขึ้นอยู่'},
    noChart:{en:'No price history in this snapshot for this stock yet — the collector adds it on its next run.',
             th:'สแนปช็อตรอบนี้ยังไม่มีราคาย้อนหลังของหุ้นตัวนี้ — ตัวเก็บข้อมูลจะเติมให้ในรอบถัดไป'},
    r63:{en:'3 months',th:'3 เดือน'}, r252:{en:'1 year',th:'1 ปี'}, r504:{en:'2 years',th:'2 ปี'},
    legP:{en:'price',th:'ราคา'}, leg50:{en:'50-day average',th:'เฉลี่ย 50 วัน'},
    leg200:{en:'200-day average',th:'เฉลี่ย 200 วัน'}, legHi:{en:'52-week high / low',th:'สูง/ต่ำสุดรอบปี'},
    rsiLab:{en:'RSI — buying pressure',th:'RSI — แรงซื้อ'},

    mH:{en:'Every number, next to the companies it should be compared with',
        th:'ทุกตัวเลข วางข้างบริษัทที่ควรเอามาเทียบ'},
    mL:{en:'The bar shows where this company sits among its {n} peers — same industry group, same market. Full bar is the best of the group. This is a rough guide, not a ranking: with a handful of peers one outlier moves everything.',
        th:'แถบบอกว่าบริษัทนี้อยู่ตรงไหนเมื่อเทียบกับเพื่อน {n} ตัว — กลุ่มอุตสาหกรรมเดียวกัน ตลาดเดียวกัน แถบเต็มคือดีที่สุดในกลุ่ม อันนี้เป็นแค่แนวทางคร่าวๆ ไม่ใช่การจัดอันดับ เพราะเพื่อนไม่กี่ตัว ตัวสุดโต่งตัวเดียวก็ทำให้ทั้งกลุ่มเพี้ยนได้'},
    beats:{en:'better than {k} of {n}',th:'ดีกว่า {k} จาก {n} ตัว'},
    noPeers:{en:'not enough comparable companies in this file',th:'บริษัทที่เทียบได้ในไฟล์นี้มีไม่พอ'},

    crH:{en:'Credit risk — a computed proxy, not a market CDS price',
         th:'ความเสี่ยงด้านเครดิต — ค่าที่คำนวณเอง ไม่ใช่ราคา CDS ในตลาดจริง'},
    crL:{en:'Real single-name Credit Default Swap prices are not published anywhere for free, so this estimates the same idea — how likely the market would think this borrower is to miss a payment — from the leverage and profitability figures already on this page.',
         th:'ราคา Credit Default Swap รายบริษัทจริงไม่มีที่ไหนเปิดเผยให้ใช้ฟรี หน้านี้จึงประเมินแนวคิดเดียวกัน คือโอกาสที่ตลาดจะมองว่าลูกหนี้รายนี้จะผิดนัดชำระหนี้ จากตัวเลขหนี้สินต่อทุนและความสามารถทำกำไรที่แสดงอยู่ในหน้านี้แล้ว'},

    flagH:{en:'Things worth knowing before you go further',th:'เรื่องที่ควรรู้ก่อนไปต่อ'},
    flagL:{en:'Not reasons to buy or sell. Reasons to look closer at something specific.',
           th:'ไม่ใช่เหตุผลให้ซื้อหรือขาย แต่เป็นเหตุผลให้ไปดูบางอย่างให้ละเอียดขึ้น'},
    flagNone:{en:'Nothing unusual stands out in this snapshot.',th:'สแนปช็อตรอบนี้ไม่มีอะไรผิดปกติที่สะดุดตา'},

    note:{en:'These readings come from one free data feed and describe the past. Fundamentals can be months out of date, a peer group of a dozen companies is small, and none of this knows anything about the company\'s business, its management or what it announced this morning. Educational only — not investment advice. The metric definitions are in {g}.',
          th:'ตัวเลขพวกนี้มาจากแหล่งข้อมูลฟรีแหล่งเดียว และเล่าเรื่องอดีต ข้อมูลพื้นฐานอาจเก่าเป็นเดือน กลุ่มเพื่อนแค่สิบกว่าตัวถือว่าน้อย และไม่มีอะไรในนี้รู้เรื่องธุรกิจ ผู้บริหาร หรือข่าวที่เพิ่งประกาศเมื่อเช้า เพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำการลงทุน คำอธิบายศัพท์อยู่ที่{g}'},
    gloss:{en:'Core Metrics',th:'หน้าคำศัพท์'}
  };

  /* the five questions, in the order that saves the most time */
  var STEPS = [
    {k:'biz', q:{en:'What does it do?',th:'ทำธุรกิจอะไร'}},
    {k:'grow', q:{en:'Is it going up?',th:'ราคาไปทางไหน'}},
    {k:'good', q:{en:'Does it make money well?',th:'ทำกำไรเก่งไหม'}},
    {k:'safe', q:{en:'How much debt?',th:'หนี้เยอะไหม'}},
    {k:'cost', q:{en:'Is it expensive?',th:'ราคาแพงไหม'}}
  ];

  var METRICS = [
    {k:'pe', low:true, n:{en:'P/E',th:'P/E'},
     s:{en:'price ÷ earnings',th:'ราคา ÷ กำไร'},
     good:{en:'cheaper than most of its group',th:'ถูกกว่าเพื่อนส่วนใหญ่ในกลุ่ม'},
     bad:{en:'pricier than most of its group',th:'แพงกว่าเพื่อนส่วนใหญ่ในกลุ่ม'},
     fmt:function(v){ return v.toFixed(2); }},
    {k:'pb', low:true, n:{en:'P/B',th:'P/B'},
     s:{en:'price ÷ book value',th:'ราคา ÷ มูลค่าทางบัญชี'},
     good:{en:'cheap against what it owns',th:'ถูกเทียบกับทรัพย์สินที่มี'},
     bad:{en:'expensive against what it owns',th:'แพงเทียบกับทรัพย์สินที่มี'},
     fmt:function(v){ return v.toFixed(2); }},
    {k:'div', n:{en:'Dividend yield',th:'ปันผล'},
     s:{en:'annual payout ÷ price',th:'เงินปันผลต่อปี ÷ ราคา'},
     good:{en:'pays more than most of its group',th:'จ่ายมากกว่าเพื่อนส่วนใหญ่'},
     bad:{en:'pays less than most of its group',th:'จ่ายน้อยกว่าเพื่อนส่วนใหญ่'},
     fmt:function(v){ return v.toFixed(2) + '%'; }},
    {k:'roe', n:{en:'ROE',th:'ROE'},
     s:{en:'profit ÷ shareholder money',th:'กำไร ÷ เงินผู้ถือหุ้น'},
     good:{en:'turns shareholder money into profit well',th:'เปลี่ยนเงินผู้ถือหุ้นเป็นกำไรได้ดี'},
     bad:{en:'weaker at turning equity into profit',th:'เปลี่ยนเงินทุนเป็นกำไรได้ด้อยกว่า'},
     fmt:function(v){ return v.toFixed(2) + '%'; }},
    {k:'roic', n:{en:'ROIC',th:'ROIC'}, skipFin:true,
     s:{en:'profit ÷ all capital used',th:'กำไร ÷ ทุนทั้งหมดที่ใช้'},
     good:{en:'high return on everything it employs',th:'ผลตอบแทนต่อทุนที่ใช้สูง'},
     bad:{en:'low return on everything it employs',th:'ผลตอบแทนต่อทุนที่ใช้ต่ำ'},
     fmt:function(v){ return v.toFixed(2) + '%'; }},
    {k:'margin', n:{en:'Net margin',th:'อัตรากำไรสุทธิ'},
     s:{en:'profit ÷ revenue',th:'กำไร ÷ รายได้'},
     good:{en:'keeps more of every sale',th:'เก็บกำไรจากยอดขายได้มากกว่า'},
     bad:{en:'keeps less of every sale',th:'เก็บกำไรจากยอดขายได้น้อยกว่า'},
     fmt:function(v){ return v.toFixed(2) + '%'; }},
    {k:'de', low:true, n:{en:'Debt to equity',th:'หนี้ต่อทุน'}, skipFin:true,
     s:{en:'borrowed ÷ owned',th:'เงินที่ยืม ÷ เงินตัวเอง'},
     good:{en:'carries less debt than most of its group',th:'หนี้น้อยกว่าเพื่อนส่วนใหญ่'},
     bad:{en:'carries more debt than most of its group',th:'หนี้มากกว่าเพื่อนส่วนใหญ่'},
     fmt:function(v){ return v.toFixed(2); }},
    {k:'vol20', low:true, n:{en:'Volatility',th:'ความผันผวน'},
     s:{en:'how much it swings, annualised',th:'ราคาเหวี่ยงแค่ไหน ต่อปี'},
     good:{en:'steadier than most of its group',th:'นิ่งกว่าเพื่อนส่วนใหญ่'},
     bad:{en:'swings more than most of its group',th:'เหวี่ยงกว่าเพื่อนส่วนใหญ่'},
     fmt:function(v){ return v.toFixed(1) + '%'; }}
  ];

  /* Banks and insurers borrow as their raw material and do not employ capital
     the way a factory does, so two of the ratios above are meaningless for
     them rather than missing. Saying so is the whole point. */
  var FIN = ['Financial Services', 'Financial', 'Financials'];
  function isFin(row){ return !!(row && row.sector && FIN.indexOf(row.sector) !== -1); }
  var FIN_NOTE = {
    roic:{en:'Not used for banks — a bank\'s "capital" is deposits, so the ratio does not mean what it means elsewhere. Judge a bank on ROE instead.',
          th:'ไม่ใช้กับธนาคาร — "ทุน" ของธนาคารคือเงินฝาก อัตราส่วนนี้จึงไม่ได้แปลเหมือนอุตสาหกรรมอื่น ให้ดู ROE แทน'},
    de:{en:'Not comparable for banks — lending money out is the business, so the ratio is high by design and says nothing about risk here.',
        th:'เทียบไม่ได้กับธนาคาร — การปล่อยกู้คือตัวธุรกิจ ตัวเลขนี้จึงสูงโดยธรรมชาติ และไม่ได้บอกอะไรเรื่องความเสี่ยงในกรณีนี้'}
  };

  var state = { tkr:null, range:252, q:'', mkt:'all', step:null, snap:null };
  var sec = null;

  function snapshot(){
    if (state.snap) return state.snap;
    var s = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot();
    return s || null;
  }
  function stocks(){ return (snapshot() || {}).stocks || {}; }
  function rowOf(t){ return stocks()[t] || null; }

  /* ---------------------------------------------------------------
     the price series, unpacked from the shared calendar
     --------------------------------------------------------------- */
  var serCache = {};
  function seriesOf(t){
    if (serCache[t] !== undefined) return serCache[t];
    var s = snapshot(), row = rowOf(t);
    var out = null;
    if (s && row && row.c && row.cal && s.charts && s.charts.cal && s.charts.cal[row.cal]) {
      var days = s.charts.cal[row.cal].split(',');
      var raw = row.c.split(',');
      var d = [], v = [];
      for (var i = 0; i < raw.length && i < days.length; i++) {
        if (raw[i] === '') continue;              /* a day it did not trade */
        var n = parseFloat(raw[i]);
        if (n > 0) { d.push(days[i]); v.push(n); }
      }
      if (v.length >= 40) out = { d:d, v:v };
    }
    serCache[t] = out;
    return out;
  }

  function smaSeries(v, n){
    var out = new Array(v.length), run = 0;
    for (var i = 0; i < v.length; i++) {
      run += v[i];
      if (i >= n) run -= v[i - n];
      out[i] = i >= n - 1 ? run / n : null;
    }
    return out;
  }

  /* Wilder, the same definition the radar uses */
  function rsiSeries(v, n){
    var out = new Array(v.length), g = 0, l = 0, i;
    for (i = 0; i < v.length; i++) out[i] = null;
    if (v.length < n + 1) return out;
    for (i = 1; i <= n; i++) {
      var ch = v[i] - v[i - 1];
      if (ch >= 0) g += ch; else l -= ch;
    }
    g /= n; l /= n;
    out[n] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    for (i = n + 1; i < v.length; i++) {
      var c = v[i] - v[i - 1];
      g = (g * (n - 1) + (c > 0 ? c : 0)) / n;
      l = (l * (n - 1) + (c < 0 ? -c : 0)) / n;
      out[i] = l === 0 ? 100 : 100 - 100 / (1 + g / l);
    }
    return out;
  }

  /* ---------------------------------------------------------------
     peers — same industry group and same market, because a Thai bank
     and a US software company share no useful yardstick
     --------------------------------------------------------------- */
  function peersOf(t){
    var all = stocks(), me = all[t];
    if (!me) return [];
    var keys = Object.keys(all);
    function pick(fn){ return keys.filter(function(k){ return k !== t && fn(all[k]); }); }
    var same = pick(function(r){ return r.sector && r.sector === me.sector && r.ccy === me.ccy; });
    if (same.length >= 4) return same;
    var sector = pick(function(r){ return r.sector && r.sector === me.sector; });
    if (sector.length >= 4) return sector;
    var mkt = pick(function(r){ return r.ccy === me.ccy; });
    return mkt.length >= 4 ? mkt : [];
  }

  /* where this company sits among them: 100 = best in the group */
  function standing(t, key, lowerIsBetter){
    var all = stocks(), me = all[t];
    if (!me || !isNum(me[key])) return null;
    var peers = peersOf(t).filter(function(k){ return isNum(all[k][key]); });
    if (peers.length < 4) return null;
    var beat = peers.filter(function(k){
      return lowerIsBetter ? all[k][key] > me[key] : all[k][key] < me[key];
    }).length;
    return { beat:beat, n:peers.length, pct: beat / peers.length * 100 };
  }

  /* ---------------------------------------------------------------
     the sentence
     --------------------------------------------------------------- */
  function verdict(t){
    var r = rowOf(t);
    if (!r) return '';
    var th = L() === 'th';
    var parts = [];

    if (isNum(r.vs_ma200)) {
      var above = r.vs_ma200 >= 0;
      parts.push(th
        ? (above ? 'ราคาอยู่<b>เหนือ</b>เส้นค่าเฉลี่ย 200 วัน ' + Math.abs(r.vs_ma200).toFixed(1) + '%'
                 : 'ราคาอยู่<b>ใต้</b>เส้นค่าเฉลี่ย 200 วัน ' + Math.abs(r.vs_ma200).toFixed(1) + '%')
        : (above ? 'trading <b>above</b> its 200-day average by ' + Math.abs(r.vs_ma200).toFixed(1) + '%'
                 : 'trading <b>below</b> its 200-day average by ' + Math.abs(r.vs_ma200).toFixed(1) + '%'));
    }
    if (isNum(r.off_high)) {
      var near = r.off_high > -5;
      parts.push(th
        ? (near ? 'อยู่<b>แถวจุดสูงสุดรอบปี</b>' : 'ห่างจุดสูงสุดรอบปี ' + Math.abs(r.off_high).toFixed(1) + '%')
        : (near ? '<b>near its 12-month high</b>' : Math.abs(r.off_high).toFixed(1) + '% below its 12-month high'));
    }
    var pe = standing(t, 'pe', true);
    if (pe) {
      var cheap = pe.pct >= 50;
      parts.push(th
        ? (cheap ? '<b>ถูกกว่า</b>เพื่อนในกลุ่ม ' + pe.beat + ' จาก ' + pe.n + ' ตัว'
                 : '<b>แพงกว่า</b>เพื่อนในกลุ่ม ' + (pe.n - pe.beat) + ' จาก ' + pe.n + ' ตัว')
        : (cheap ? '<b>cheaper</b> than ' + pe.beat + ' of its ' + pe.n + ' peers'
                 : '<b>pricier</b> than ' + (pe.n - pe.beat) + ' of its ' + pe.n + ' peers'));
    } else if (!isNum(r.pe)) {
      parts.push(th ? '<b>ไม่มี P/E</b> (ยังไม่มีกำไร หรือไม่มีข้อมูล)'
                    : '<b>no P/E</b> (no earnings, or none reported)');
    }
    var roe = standing(t, 'roe', false);
    if (roe) {
      parts.push(th
        ? (roe.pct >= 50 ? 'ทำกำไรต่อทุน<b>ดีกว่า</b>เพื่อนส่วนใหญ่' : 'ทำกำไรต่อทุน<b>ด้อยกว่า</b>เพื่อนส่วนใหญ่')
        : (roe.pct >= 50 ? 'turns equity into profit <b>better</b> than most of them'
                         : 'turns equity into profit <b>less well</b> than most of them'));
    }
    if (!parts.length) return th ? 'สแนปช็อตรอบนี้มีข้อมูลไม่พอจะสรุป' : 'Not enough in this snapshot to summarise.';
    var lead = th ? (r.industry ? r.industry + ' — ' : '') : (r.industry ? r.industry + ' — ' : '');
    return lead + parts.join(th ? ' · ' : ' · ') + '.';
  }

  function stepAnswer(t, k){
    var r = rowOf(t) || {};
    var th = L() === 'th';
    if (k === 'biz') {
      return (r.industry || '—') + (r.mcap ? (th ? ' · มูลค่าตลาด ' : ' · market cap ') + big(r.mcap) : '');
    }
    if (k === 'grow') {
      var bits = [];
      if (isNum(r.m3)) bits.push((th ? '3 เดือน ' : '3 months ') + sgn(r.m3, 1) + '%');
      if (isNum(r.m1)) bits.push((th ? '1 เดือน ' : '1 month ') + sgn(r.m1, 1) + '%');
      if (isNum(r.vs_ma200)) bits.push((th ? 'เทียบเฉลี่ย 200 วัน ' : 'vs 200-day ') + sgn(r.vs_ma200, 1) + '%');
      return bits.join(' · ') || '—';
    }
    if (k === 'good') {
      var g = [];
      if (isNum(r.roe)) g.push('ROE ' + r.roe.toFixed(1) + '%');
      if (isNum(r.margin)) g.push((th ? 'กำไรสุทธิ ' : 'net margin ') + r.margin.toFixed(1) + '%');
      if (isNum(r.roic)) g.push('ROIC ' + r.roic.toFixed(1) + '%');
      else if (isFin(r)) g.push(th ? 'ROIC ไม่ใช้กับธนาคาร' : 'ROIC not used for banks');
      return g.join(' · ') || '—';
    }
    if (k === 'safe') {
      if (isFin(r)) return th ? 'เป็นธนาคาร — หนี้ต่อทุนเทียบไม่ได้กับอุตสาหกรรมอื่น'
                              : 'A bank — debt to equity is not comparable with other industries';
      var d = [];
      if (isNum(r.de)) d.push((th ? 'หนี้ต่อทุน ' : 'debt to equity ') + r.de.toFixed(2));
      if (isNum(r.vol20)) d.push((th ? 'ผันผวน ' : 'volatility ') + r.vol20.toFixed(0) + '%');
      return d.join(' · ') || '—';
    }
    var c = [];
    if (isNum(r.pe)) c.push('P/E ' + r.pe.toFixed(1)); else c.push(th ? 'ไม่มี P/E' : 'no P/E');
    if (isNum(r.pb)) c.push('P/B ' + r.pb.toFixed(1));
    if (isNum(r.div)) c.push((th ? 'ปันผล ' : 'yield ') + r.div.toFixed(2) + '%');
    var st = standing(t, 'pe', true);
    if (st) c.push(th ? 'ถูกกว่าเพื่อน ' + st.beat + '/' + st.n : 'cheaper than ' + st.beat + '/' + st.n);
    return c.join(' · ');
  }

  /* ---------------------------------------------------------------
     drawing
     --------------------------------------------------------------- */
  var W = 1000, H = 300, PAD_L = 6, PAD_R = 62, TOP = 12, BOT = 22;

  function chartHTML(t){
    var ser = seriesOf(t), r = rowOf(t) || {};
    if (!ser) return '<div class="sk-nochart">' + esc(tx(C.noChart)) + '</div>';

    var ma50 = smaSeries(ser.v, 50), ma200 = smaSeries(ser.v, 200);
    var n = ser.v.length;
    var take = Math.min(state.range, n);
    var from = n - take;
    var v = ser.v.slice(from), d = ser.d.slice(from);
    var m50 = ma50.slice(from), m200 = ma200.slice(from);

    var pool = v.slice();
    m50.concat(m200).forEach(function(x){ if (isNum(x)) pool.push(x); });
    var lo = Math.min.apply(null, pool), hi = Math.max.apply(null, pool);
    var span = (hi - lo) || 1;
    lo -= span * 0.06; hi += span * 0.06; span = hi - lo;

    var iw = W - PAD_L - PAD_R, ih = H - TOP - BOT;
    var X = function(i){ return PAD_L + (take === 1 ? 0 : i / (take - 1) * iw); };
    var Y = function(p){ return TOP + (hi - p) / span * ih; };

    function path(arr){
      var s = '', open = false;
      for (var i = 0; i < arr.length; i++) {
        if (!isNum(arr[i])) { open = false; continue; }
        s += (open ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(arr[i]).toFixed(1) + ' ';
        open = true;
      }
      return s.trim();
    }

    var LX = (W - PAD_R + 8) / W * 100;          /* label gutter, in per cent */

    /* horizontal guides, with their prices set in HTML beside them */
    var gy = '', glab = '';
    for (var g = 0; g <= 4; g++) {
      var p = lo + span * (g / 4), y = Y(p);
      gy += '<line x1="' + PAD_L + '" y1="' + y.toFixed(1) + '" x2="' + (W - PAD_R) +
            '" y2="' + y.toFixed(1) + '" stroke="rgba(255,255,255,.055)" stroke-width="1"/>';
      glab += '<span class="sk-ax" style="left:' + LX.toFixed(2) + '%;top:' +
              (y / H * 100).toFixed(2) + '%">' +
              esc(p >= 100 ? p.toFixed(0) : p.toFixed(2)) + '</span>';
    }

    /* the 52-week band, but only when the window actually shows a year */
    var band = '';
    if (state.range >= 252 && isNum(r.hi52) && isNum(r.lo52) && r.hi52 > lo && r.lo52 < hi) {
      [[r.hi52, tx(C.legHi)], [r.lo52, '']].forEach(function(pair){
        var y = Y(pair[0]);
        if (y < TOP - 4 || y > H - BOT + 4) return;
        band += '<line x1="' + PAD_L + '" y1="' + y.toFixed(1) + '" x2="' + (W - PAD_R) +
                '" y2="' + y.toFixed(1) + '" stroke="rgba(255,176,32,.32)" stroke-width="1" ' +
                'stroke-dasharray="4 4"/>';
      });
    }

    var area = 'M' + X(0).toFixed(1) + ' ' + (H - BOT) + ' ' +
      v.map(function(p, i){ return 'L' + X(i).toFixed(1) + ' ' + Y(p).toFixed(1); }).join('') +
      ' L' + X(take - 1).toFixed(1) + ' ' + (H - BOT) + ' Z';

    /* date ticks, also in HTML so they stay readable on a phone */
    var tick = '';
    [0, Math.floor(take / 3), Math.floor(take * 2 / 3), take - 1].forEach(function(i, k){
      if (i < 0 || i >= take) return;
      var pos = k === 3 ? 'right:' + (PAD_R / W * 100).toFixed(2) + '%'
                        : 'left:' + (X(i) / W * 100).toFixed(2) + '%';
      tick += '<span class="sk-axd" style="' + pos + ';top:' +
        ((H - BOT + 6) / H * 100).toFixed(2) + '%' +
        (k === 0 || k === 3 ? '' : ';transform:translateX(-50%)') + '">' +
        esc(d[i].slice(0, 7)) + '</span>';
    });

    var rsi = rsiSeries(ser.v, 14).slice(from);
    var RH = 78, rih = RH - 16;
    var RY = function(x){ return 8 + (100 - x) / 100 * rih; };
    var rpath = '', ropen = false;
    for (var i2 = 0; i2 < rsi.length; i2++) {
      if (!isNum(rsi[i2])) { ropen = false; continue; }
      rpath += (ropen ? 'L' : 'M') + X(i2).toFixed(1) + ' ' + RY(rsi[i2]).toFixed(1) + ' ';
      ropen = true;
    }

    return '<div class="sk-crow">' +
        [63, 252, 504].map(function(rr){
          if (rr > n + 20) return '';
          return '<button type="button" class="sk-r' + (state.range === rr ? ' on' : '') +
                 '" data-range="' + rr + '">' + esc(tx(C['r' + rr])) + '</button>';
        }).join('') +
        '<span class="sk-leg">' +
          '<span><i style="background:var(--neon,#cf0)"></i>' + esc(tx(C.legP)) + '</span>' +
          '<span><i style="background:#5ec8ff"></i>' + esc(tx(C.leg50)) + '</span>' +
          '<span><i style="background:#b98cff"></i>' + esc(tx(C.leg200)) + '</span>' +
          (band ? '<span><i style="background:var(--amber,#ffb020)"></i>' + esc(tx(C.legHi)) + '</span>' : '') +
        '</span>' +
      '</div>' +
      '<div data-sk="plot"><div class="sk-pw">' +
      '<svg class="sk-svg price" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" data-sk="price">' +
        '<defs><linearGradient id="skFill" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="var(--neon,#cf0)" stop-opacity=".20"/>' +
          '<stop offset="100%" stop-color="var(--neon,#cf0)" stop-opacity="0"/>' +
        '</linearGradient></defs>' +
        gy + band +
        '<path d="' + area + '" fill="url(#skFill)"/>' +
        '<path d="' + path(m200) + '" fill="none" stroke="#b98cff" stroke-width="1.4" ' +
          'vector-effect="non-scaling-stroke" opacity=".85"/>' +
        '<path d="' + path(m50) + '" fill="none" stroke="#5ec8ff" stroke-width="1.4" ' +
          'vector-effect="non-scaling-stroke" opacity=".85"/>' +
        '<path d="' + path(v) + '" fill="none" stroke="var(--neon,#cf0)" stroke-width="1.9" ' +
          'stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
        '<line data-sk="cross" x1="0" y1="' + TOP + '" x2="0" y2="' + (H - BOT) +
          '" stroke="rgba(255,255,255,.45)" stroke-width="1" opacity="0"/>' +
        '<circle data-sk="dot" r="3.5" fill="var(--neon,#cf0)" opacity="0"/>' +
      '</svg>' + glab + tick +
      '</div>' +
      '<div class="sk-rlab">' + esc(tx(C.rsiLab)) + '</div>' +
      '<div class="sk-rw">' +
      '<svg class="sk-svg rsi" viewBox="0 0 ' + W + ' ' + RH + '" preserveAspectRatio="none">' +
        '<line x1="' + PAD_L + '" y1="' + RY(70) + '" x2="' + (W - PAD_R) + '" y2="' + RY(70) +
          '" stroke="rgba(255,59,78,.3)" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<line x1="' + PAD_L + '" y1="' + RY(30) + '" x2="' + (W - PAD_R) + '" y2="' + RY(30) +
          '" stroke="rgba(124,255,178,.3)" stroke-width="1" stroke-dasharray="3 3"/>' +
        '<path d="' + rpath.trim() + '" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="1.3" ' +
          'vector-effect="non-scaling-stroke"/>' +
      '</svg>' +
      '<span class="sk-ax" style="left:' + LX.toFixed(2) + '%;top:' +
        (RY(70) / RH * 100).toFixed(2) + '%">70</span>' +
      '<span class="sk-ax" style="left:' + LX.toFixed(2) + '%;top:' +
        (RY(30) / RH * 100).toFixed(2) + '%">30</span>' +
      '</div>' +
      '<div class="sk-tip" data-sk="tip"></div>' +
      '</div>';
  }

  /* the crosshair has to survive every repaint, so it is wired here */
  function wireChart(host, t){
    var plot = host.querySelector('[data-sk="plot"]');
    var svg = host.querySelector('[data-sk="price"]');
    if (!plot || !svg) return;
    var ser = seriesOf(t);
    if (!ser) return;
    var n = ser.v.length, take = Math.min(state.range, n), from = n - take;
    var v = ser.v.slice(from), d = ser.d.slice(from);
    var ma50 = smaSeries(ser.v, 50).slice(from);
    var pool = v.slice();
    smaSeries(ser.v, 50).slice(from).concat(smaSeries(ser.v, 200).slice(from))
      .forEach(function(x){ if (isNum(x)) pool.push(x); });
    var lo = Math.min.apply(null, pool), hi = Math.max.apply(null, pool);
    var span = (hi - lo) || 1;
    lo -= span * 0.06; hi += span * 0.06; span = hi - lo;
    var iw = W - PAD_L - PAD_R, ih = H - TOP - BOT;
    var cross = svg.querySelector('[data-sk="cross"]');
    var dot = svg.querySelector('[data-sk="dot"]');
    var tip = host.querySelector('[data-sk="tip"]');
    var ccy = (rowOf(t) || {}).ccy;

    function move(ev){
      var box = svg.getBoundingClientRect();
      var cx = (ev.touches ? ev.touches[0].clientX : ev.clientX) - box.left;
      var frac = Math.max(0, Math.min(1, (cx / box.width * W - PAD_L) / iw));
      var i = Math.round(frac * (take - 1));
      if (i < 0 || i >= take) return;
      var x = PAD_L + (take === 1 ? 0 : i / (take - 1) * iw);
      var y = TOP + (hi - v[i]) / span * ih;
      cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.setAttribute('opacity', '1');
      dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('opacity', '1');
      tip.classList.add('on');
      tip.innerHTML = '<b>' + esc(d[i]) + '</b><br>' + esc(money(v[i], ccy)) +
        (isNum(ma50[i]) ? '<br>' + esc(tx(C.leg50)) + ' ' + esc(money(ma50[i], ccy)) : '');
      var px = x / W * box.width;
      tip.style.left = Math.max(4, Math.min(box.width - tip.offsetWidth - 4, px + 12)) + 'px';
      tip.style.top = Math.max(4, y / H * box.height - 14) + 'px';
    }
    function leave(){
      cross.setAttribute('opacity', '0');
      dot.setAttribute('opacity', '0');
      tip.classList.remove('on');
    }
    svg.addEventListener('mousemove', move);
    svg.addEventListener('mouseleave', leave);
    svg.addEventListener('touchmove', move, { passive:true });
    svg.addEventListener('touchend', leave);
  }

  function metricsHTML(t){
    var r = rowOf(t) || {};
    var peers = peersOf(t);
    var rows = METRICS.map(function(m){
      var v = r[m.k];
      var fin = m.skipFin && isFin(r);
      var st = fin ? null : standing(t, m.k, !!m.low);
      var val = fin ? (L() === 'th' ? 'ไม่ใช้' : 'n/a')
              : isNum(v) ? m.fmt(v) : (L() === 'th' ? 'ไม่มีข้อมูล' : 'no data');
      var bar = '', txt = '';
      if (fin) {
        txt = '<span class="sk-mt note">' + esc(tx(FIN_NOTE[m.k] || {})) + '</span>';
      } else if (st) {
        var goodSide = st.pct >= 50;
        var col = st.pct >= 66 ? 'var(--neon-2,#7CFFB2)' : st.pct >= 33 ? 'var(--amber,#ffb020)' : 'var(--red,#ff3b4e)';
        bar = '<div class="sk-mbar"><i style="width:' + Math.max(3, st.pct).toFixed(0) +
              '%;background:' + col + '"></i><u style="left:50%"></u></div>';
        txt = '<span class="sk-mt"><b>' + esc(tx(goodSide ? m.good : m.bad)) + '</b> — ' +
              esc(tx(C.beats).replace('{k}', st.beat).replace('{n}', st.n)) + '</span>';
      } else if (isNum(v)) {
        txt = '<span class="sk-mt">' + esc(tx(C.noPeers)) + '</span>';
      }
      return '<div class="sk-mrow">' +
        '<span class="sk-ml">' + esc(tx(m.n)) + '<small>' + esc(tx(m.s)) + '</small></span>' +
        '<span class="sk-mv' + (isNum(v) && !fin ? '' : ' na') + '">' + esc(val) + '</span>' +
        '<span>' + bar + txt + '</span>' +
      '</div>';
    }).join('');
    return '<p class="sk-l3">' + esc(tx(C.mL).replace('{n}', peers.length)) + '</p>' +
           '<div class="sk-mtable">' + rows + '</div>';
  }

  function flagsHTML(t){
    var r = rowOf(t) || {};
    var th = L() === 'th';
    var f = [];
    function add(kind, icon, head, body){ f.push({ k:kind, i:icon, h:head, b:body }); }

    if (isNum(r.off_high) && r.off_high > -4 && isNum(r.rsi) && r.rsi > 68) {
      add('warn', '▲', th ? 'อยู่จุดสูงสุด และแรงซื้อร้อน' : 'At the highs, and buying is hot',
        th ? 'ราคาห่างจุดสูงสุดรอบปีแค่ ' + Math.abs(r.off_high).toFixed(1) + '% และ RSI ' + r.rsi.toFixed(0) + ' ไม่ได้แปลว่าจะลง แต่แปลว่าคนที่ซื้อตอนนี้กำลังจ่ายราคาที่ดีที่สุดในรอบปี'
           : Math.abs(r.off_high).toFixed(1) + '% from its 12-month high with RSI at ' + r.rsi.toFixed(0) + '. Not a reason it must fall — a reason to notice you would be paying the best price of the year.');
    }
    if (r.divergence === 'bearish') {
      add('bad', '◆', th ? 'ราคาขึ้น แต่แรงลด' : 'Price up, momentum fading',
        th ? 'ราคาทำจุดสูงใหม่แต่ RSI ทำไม่ได้ — เป็นรูปแบบที่เจอบ่อยก่อนราคาพัก ไม่ใช่ทุกครั้ง'
           : 'A higher price high that RSI did not match. Common before a pause — not every time.');
    }
    if (r.divergence === 'bullish') {
      add('good', '◆', th ? 'ราคาลง แต่แรงเริ่มกลับ' : 'Price down, momentum turning',
        th ? 'ราคาทำจุดต่ำใหม่แต่ RSI ไม่ได้ต่ำตาม' : 'A lower price low that RSI did not match.');
    }
    if (r.cross === 'death') {
      add('bad', '✕', th ? 'เส้น 50 วันตัดลงใต้เส้น 200 วัน' : 'The 50-day crossed below the 200-day',
        th ? 'เพิ่งเกิดขึ้นไม่นาน คนจำนวนมากอ่านว่าเทรนด์ยาวเปลี่ยน' : 'Recent. Many readers treat this as the long trend changing.');
    }
    if (r.cross === 'golden') {
      add('good', '✓', th ? 'เส้น 50 วันตัดขึ้นเหนือเส้น 200 วัน' : 'The 50-day crossed above the 200-day',
        th ? 'เพิ่งเกิดขึ้นไม่นาน มักถูกอ่านว่าเทรนด์ยาวกลับขึ้น' : 'Recent. Usually read as the long trend turning up.');
    }
    if (isNum(r.vs_ma200) && r.vs_ma200 < 0) {
      add('warn', '▼', th ? 'อยู่ใต้เส้นค่าเฉลี่ย 200 วัน' : 'Below its 200-day average',
        th ? 'ต่ำกว่า ' + Math.abs(r.vs_ma200).toFixed(1) + '% — เส้นนี้คือเส้นที่คนใช้แบ่งว่าเทรนด์ยาวขึ้นหรือลง'
           : Math.abs(r.vs_ma200).toFixed(1) + '% under it. This is the line most people use to call the long trend.');
    }
    if (!isFin(r) && isNum(r.de) && r.de > 2) {
      add('warn', '⚖', th ? 'หนี้ต่อทุนสูง' : 'Carries a lot of debt',
        th ? 'หนี้ต่อทุน ' + r.de.toFixed(2) + ' เท่า — บริษัทแบบนี้เจ็บกว่าเวลาดอกเบี้ยขึ้นหรือรายได้หด'
           : 'Debt to equity of ' + r.de.toFixed(2) + '. Companies like this hurt more when rates rise or revenue dips.');
    }
    if (isNum(r.vol20) && r.vol20 > 45) {
      add('warn', '〜', th ? 'ผันผวนสูง' : 'Swings a lot',
        th ? 'ความผันผวน ' + r.vol20.toFixed(0) + '% ต่อปี — วันที่ขยับ 4-5% ถือเป็นเรื่องปกติของตัวนี้'
           : r.vol20.toFixed(0) + '% annualised. A 4–5% day is normal for this one.');
    }
    if (!isNum(r.pe)) {
      add('warn', '?', th ? 'ไม่มีค่า P/E' : 'No P/E figure',
        th ? 'แปลว่าบริษัทยังไม่มีกำไรสุทธิ หรือแหล่งข้อมูลไม่ได้ให้มา — ตัวไหนก็ต้องไปดูงบเอง'
           : 'Either it has no net profit, or the feed did not supply one. Either way, go and read the accounts.');
    }
    if (r.stale) {
      add('warn', '⏱', th ? 'ข้อมูลรอบนี้ดึงไม่สำเร็จ' : 'This row did not refresh',
        th ? 'ตัวเลขที่เห็นคือค่าจากรอบก่อน' : 'What you see is carried over from an earlier run.');
    }

    if (!f.length) return '<div class="sk-empty">' + esc(tx(C.flagNone)) + '</div>';
    return '<div class="sk-flags">' + f.map(function(x){
      return '<div class="sk-flag ' + x.k + '"><span class="sk-fi">' + esc(x.i) + '</span>' +
        '<span class="sk-ft"><b>' + esc(x.h) + '</b>' + esc(x.b) + '</span></div>';
    }).join('') + '</div>';
  }

  /* ---------------------------------------------------------------
     the two screens
     --------------------------------------------------------------- */
  function pickerHTML(){
    var all = stocks();
    var keys = Object.keys(all);
    if (!keys.length) return '<div class="sk-empty">' + esc(tx(C.waiting)) + '</div>';
    var q = state.q.trim().toLowerCase();
    var list = keys.filter(function(k){
      var r = all[k];
      if (state.mkt === 'us' && r.ccy === 'THB') return false;
      if (state.mkt === 'th' && r.ccy !== 'THB') return false;
      if (!q) return true;
      return (k + ' ' + (r.name || '') + ' ' + (r.sector || '') + ' ' + (r.industry || ''))
        .toLowerCase().indexOf(q) !== -1;
    }).sort();

    return '<div class="sk-search">' +
        '<input class="sk-in" data-sk="q" type="search" autocomplete="off" placeholder="' +
          esc(tx(C.find)) + '" value="' + esc(state.q) + '">' +
        ['all','us','th'].map(function(m){
          return '<button type="button" class="sk-f' + (state.mkt === m ? ' on' : '') +
                 '" data-mkt="' + m + '">' + esc(tx(C[m])) + '</button>';
        }).join('') +
      '</div>' +
      (list.length ? '<div class="sk-list">' + list.map(function(k){
        var r = all[k];
        var up = isNum(r.chg_pct) && r.chg_pct >= 0;
        return '<button type="button" class="sk-pick" data-go="' + esc(k) + '">' +
          '<span class="sk-pt">' + esc(k) + '</span>' +
          '<span class="sk-pn">' + esc(r.name || '') + '</span>' +
          '<span class="sk-pp"><b>' + esc(money(r.price, r.ccy)) + '</b> ' +
            (isNum(r.chg_pct) ? '<span class="' + (up ? 'up' : 'down') + '">' + sgn(r.chg_pct, 2) + '%</span>' : '') +
          '</span>' +
        '</button>';
      }).join('') + '</div>'
      : '<div class="sk-empty">' + esc(tx(C.none)) + '</div>');
  }

  function detailHTML(t){
    var r = rowOf(t);
    if (!r) return pickerHTML();
    var up = isNum(r.chg_pct) && r.chg_pct >= 0;
    var tags = window.__SPZ_TAGS;

    return '<button type="button" class="sk-back" data-sk="back">' + esc(tx(C.back)) + '</button>' +
      '<div class="sk-head">' +
        '<div><div class="sk-tk">' + esc(t) + '</div>' +
          '<div class="sk-nm">' + esc(r.name || '') + '</div>' +
          '<div class="sk-sec">' + esc([r.sector, r.industry].filter(Boolean).join(' · ')) +
            (r.ccy === 'THB' ? ' · 🇹🇭' : ' · 🇺🇸') + '</div></div>' +
        '<div class="sk-px"><div class="sk-pv">' + esc(money(r.price, r.ccy)) + '</div>' +
          '<div class="sk-pc ' + (up ? 'up' : 'down') + '">' +
            (isNum(r.chg_pct) ? sgn(r.chg_pct, 2) + '%' : '—') + '</div>' +
          (tags ? '<div style="margin-top:7px">' + tags.html('auto') + '</div>' : '') +
        '</div>' +
      '</div>' +

      '<div class="sk-verdict"><div class="sk-vh">' + esc(tx(C.vh)) + '</div>' +
        '<div class="sk-vt">' + verdict(t) + '</div></div>' +

      '<div class="sk-sec2" style="margin-top:26px"><h3 class="sk-h3">' + esc(tx(C.stepsH)) + '</h3>' +
        '<p class="sk-l3">' + esc(tx(C.stepsL)) + '</p>' +
        '<div class="sk-steps">' + STEPS.map(function(s, i){
          var on = state.step === s.k;
          return '<button type="button" class="sk-step' + (on ? ' on' : '') + '" data-step="' + s.k + '">' +
            '<span class="sk-sn">' + (i + 1) + '</span>' +
            '<span class="sk-sq">' + esc(tx(s.q)) + '</span>' +
            (on ? '<span class="sk-sa">' + esc(stepAnswer(t, s.k)) + '</span>' : '') +
          '</button>';
        }).join('') + '</div></div>' +

      '<div class="sk-sec2"><h3 class="sk-h3">' + esc(tx(C.chartH)) + '</h3>' +
        '<p class="sk-l3">' + esc(tx(C.chartL)) + '</p>' +
        '<div class="sk-cbox">' + chartHTML(t) + '</div></div>' +

      '<div class="sk-sec2"><h3 class="sk-h3">' + esc(tx(C.mH)) + '</h3>' +
        metricsHTML(t) + '</div>' +

      '<div class="sk-sec2"><h3 class="sk-h3">' + esc(tx(C.crH)) + '</h3>' +
        '<p class="sk-l3">' + esc(tx(C.crL)) + '</p>' +
        (window.__SPZ_CREDIT ? window.__SPZ_CREDIT.widgetHTML(t) : '') + '</div>' +

      '<div class="sk-sec2"><h3 class="sk-h3">' + esc(tx(C.flagH)) + '</h3>' +
        '<p class="sk-l3">' + esc(tx(C.flagL)) + '</p>' + flagsHTML(t) + '</div>' +

      '<div class="sk-note">' + tx(C.note).replace('{g}',
        '<a data-sk="goglossary">' + esc(tx(C.gloss)) + '</a>') + '</div>';
  }

  /* a shareable address for a stock, without fighting the router — the
     hash belongs to the router, the query string does not */
  function writeUrl(){
    try {
      var q = state.tkr ? '?stock=' + encodeURIComponent(state.tkr) : '';
      history.replaceState(history.state, '', location.pathname + q + (location.hash || ''));
    } catch(e){}
  }

  function open(t){
    state.tkr = t;
    state.step = null;
    state.range = 252;
    writeUrl();
    var link = document.querySelector('[data-route-to="stock"]');
    if (link) link.click(); else location.hash = '#/stock';
    paint();
    var host = document.getElementById('stock');
    if (host) window.scrollTo({ top:0, behavior:'auto' });
  }

  function paint(){
    if (!sec) return;
    var q = function(k){ return sec.querySelector('[data-sk="' + k + '"]'); };
    if (q('eb')) q('eb').textContent = tx(C.eyebrow);
    if (q('h')) q('h').textContent = tx(C.h);
    if (q('lede')) q('lede').textContent = tx(C.lede);
    var body = q('body');
    if (!body) return;
    var focus = document.activeElement && document.activeElement.getAttribute &&
                document.activeElement.getAttribute('data-sk') === 'q';
    body.innerHTML = state.tkr ? detailHTML(state.tkr) : pickerHTML();
    if (state.tkr) wireChart(body, state.tkr);
    wire(body);
    if (focus) {
      var inp = body.querySelector('[data-sk="q"]');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    }
  }

  function wire(body){
    body.querySelectorAll('[data-go]').forEach(function(b){
      b.addEventListener('click', function(){ open(b.getAttribute('data-go')); });
    });
    var inp = body.querySelector('[data-sk="q"]');
    if (inp) inp.addEventListener('input', function(){ state.q = inp.value; paint(); });
    body.querySelectorAll('[data-mkt]').forEach(function(b){
      b.addEventListener('click', function(){ state.mkt = b.getAttribute('data-mkt'); paint(); });
    });
    var back = body.querySelector('[data-sk="back"]');
    if (back) back.addEventListener('click', function(){
      state.tkr = null; writeUrl(); paint();
    });
    body.querySelectorAll('[data-range]').forEach(function(b){
      b.addEventListener('click', function(){
        state.range = parseInt(b.getAttribute('data-range'), 10);
        paint();
      });
    });
    body.querySelectorAll('[data-step]').forEach(function(b){
      b.addEventListener('click', function(){
        var k = b.getAttribute('data-step');
        state.step = state.step === k ? null : k;
        paint();
      });
    });
    var gl = body.querySelector('[data-sk="goglossary"]');
    if (gl) gl.addEventListener('click', function(){
      var link = document.querySelector('[data-route-to="glossary"]');
      if (link) link.click();
    });
  }

  function build(){
    if (document.getElementById('stock')) return true;
    if (!document.querySelector('.top-fixed') || !window.__spzAddRoute) return false;

    sec = document.createElement('section');
    sec.id = 'stock';
    sec.setAttribute('data-route', 'stock');
    sec.innerHTML =
      '<div class="sk-wrap">' +
        '<div class="section-head reveal in-view" style="padding-top:34px;">' +
          '<div class="eyebrow"><span class="cursor"></span><span data-sk="eb"></span></div>' +
          '<h2 data-sk="h"></h2>' +
          '<p class="lede" data-sk="lede"></p>' +
          '<div class="rule"></div>' +
        '</div>' +
        '<div data-sk="body"></div>' +
      '</div>';
    document.body.appendChild(sec);

    window.__spzAddRoute({
      id:'stock', after:'directory',
      t:{en:'One Stock, One Page',th:'ดูหุ้นรายตัว'},
      d:{en:'The deep dive on one company already chosen — real price history, every metric next to its peers, one sentence on what it adds up to. Reached by clicking any card in the Directory, or search here directly.',
         th:'หน้าเจาะลึกของบริษัทเดียวที่เลือกไว้แล้ว — ราคาจริงย้อนหลัง ทุกตัวเลขเทียบกับเพื่อนในกลุ่ม และหนึ่งประโยคสรุปว่ามันแปลว่าอะไร เปิดได้จากการกดการ์ดในหน้าหุ้นตัวอย่าง หรือค้นหาที่นี่โดยตรง'}
    });

    sec.__render = paint;
    paint();

    /* The router runs its first pass long before this screen exists, so a
       bookmark to #/stock would have been sent to the home page. Now that the
       route is registered, honour it. */
    if (/^#\/stock\b/.test(location.hash || '')) {
      var link = document.querySelector('[data-route-to="stock"]');
      if (link) link.click();
    }
    return true;
  }

  /* Every stock card in the directory now opens this page. Only those: the
     ticker chips elsewhere already have their own jump-to behaviour and
     stealing their clicks would break screens that work. */
  function delegate(){
    document.addEventListener('click', function(e){
      if (!e.target.closest) return;
      var el = e.target.closest('.stock-card[data-tk]');
      if (!el || e.target.closest('#stock')) return;
      var t = el.getAttribute('data-tk');
      if (!t || !rowOf(t)) return;
      open(t);
    });
    /* the hover label, in whichever language is showing */
    function label(){
      var s = L() === 'th' ? 'ดูรายละเอียด →' : 'OPEN →';
      document.querySelectorAll('.stock-card[data-tk]').forEach(function(c){
        c.setAttribute('data-open', s);
      });
    }
    label();
    setInterval(label, 4000);
    new MutationObserver(label).observe(document.documentElement,
      { attributes:true, attributeFilter:['lang'] });
  }

  function boot(){
    var tries = 0;
    var iv = setInterval(function(){
      if (build() || ++tries > 60) clearInterval(iv);
    }, 400);

    document.addEventListener('spz:snapshot', function(e){
      state.snap = e.detail;
      serCache = {};
      paint();
    });
    var seed = setInterval(function(){
      var s = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot();
      if (s) { state.snap = s; serCache = {}; paint(); clearInterval(seed); }
    }, 600);
    setTimeout(function(){ clearInterval(seed); }, 45000);

    new MutationObserver(paint).observe(document.documentElement,
      { attributes:true, attributeFilter:['lang'] });

    delegate();

    /* a link someone pasted, or a reload of this page */
    try {
      var m = /[?&]stock=([^&#]+)/.exec(location.search);
      if (m) {
        var want = decodeURIComponent(m[1]);
        var tryOpen = setInterval(function(){
          if (rowOf(want) && document.getElementById('stock')) {
            clearInterval(tryOpen);
            open(want);
          }
        }, 500);
        setTimeout(function(){ clearInterval(tryOpen); }, 30000);
      }
    } catch(e){}
  }

  window.__SPZ_STOCK = { open:open, state:state, paint:paint,
                         series:seriesOf, peers:peersOf, standing:standing };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot, 1200); });
  } else {
    setTimeout(boot, 1200);
  }
})();
