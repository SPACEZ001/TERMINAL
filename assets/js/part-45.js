
(function(){
  'use strict';
  function L(){ return document.documentElement.lang === 'th' ? 'th' : 'en'; }
  function T(o){ if(o == null) return ''; return typeof o === 'string' ? o : (o[L()] || o.en || ''); }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function isNum(v){ return typeof v === 'number' && isFinite(v); }

  var FIN_SECTORS = ['Financial Services','Financial','Financials'];
  function isFin(row){ return !!(row && row.sector && FIN_SECTORS.indexOf(row.sector) !== -1); }

  var TXT = {
    sub:{en:'Computed from public leverage, profitability (ROA) and margin data, then placed on a published reference spread scale — not a real market-traded CDS price. No free source publishes real single-name CDS spreads, so this is an honest estimate, not a quote.',
         th:'คำนวณจากข้อมูลสาธารณะด้านหนี้สินต่อทุน ความสามารถทำกำไร (ROA) และอัตรากำไร แล้วนำไปเทียบกับสเกลส่วนต่างเครดิตอ้างอิงที่เผยแพร่สาธารณะ — ไม่ใช่ราคา CDS ที่ซื้อขายจริงในตลาด เพราะไม่มีแหล่งข้อมูลฟรีที่เปิดเผยราคา CDS รายบริษัทจริง ตัวเลขนี้จึงเป็นค่าประมาณอย่างตรงไปตรงมา ไม่ใช่ราคาตลาด'},
    band:{ low:{en:'Low',th:'ต่ำ'}, mod:{en:'Moderate',th:'ปานกลาง'},
           high:{en:'High',th:'สูง'}, vhigh:{en:'Very high',th:'สูงมาก'} },
    comp:{ lev:{en:'Leverage (debt/equity)',th:'หนี้สินต่อทุน'},
           roa:{en:'Profitability (ROA)',th:'ความสามารถทำกำไร (ROA)'},
           mg:{en:'Net margin',th:'อัตรากำไรสุทธิ'} },
    finNote:{en:'Leverage is left out for banks and financials — lending money out is the business, so a high debt/equity here is normal and does not signal distress the way it would elsewhere.',
              th:'ไม่นับหนี้สินต่อทุนสำหรับกลุ่มธนาคาร/การเงิน เพราะการปล่อยกู้คือตัวธุรกิจ หนี้สูงจึงเป็นเรื่องปกติของกลุ่มนี้ ไม่ได้สื่อถึงปัญหาเหมือนอุตสาหกรรมอื่น'},
    none:{en:'Not enough public financial data in this snapshot to estimate this yet.',
          th:'ข้อมูลการเงินสาธารณะในสแนปช็อตนี้ยังไม่พอสำหรับประเมินค่านี้'},
    warnTitle:{en:'Elevated default risk — think twice',th:'ความเสี่ยงผิดนัดชำระหนี้สูงกว่าปกติ — คิดให้รอบคอบ'},
    warnBody:{en:'This company scores in the higher range of the tracked list for debt load versus profitability. A real CDS spread that expensive would mean the market prices in a meaningfully higher chance this borrower misses a payment — treat this reference the same way: a reason to look closer at the balance sheet and size any position carefully, not a reason to avoid the stock outright.',
               th:'บริษัทนี้มีคะแนนอยู่ในช่วงสูงของรายชื่อหุ้นที่ติดตาม เมื่อเทียบภาระหนี้กับความสามารถทำกำไร ถ้าเป็นราคา CDS จริงที่แพงขนาดนี้ก็แปลว่าตลาดให้ราคาความเสี่ยงที่จะผิดนัดชำระหนี้สูงขึ้นอย่างมีนัยสำคัญ — ให้อ่านค่านี้แบบเดียวกัน คือเป็นเหตุผลให้ไปดูงบดุลให้ละเอียดขึ้นและคุมขนาดการลงทุนให้รอบคอบ ไม่ใช่เหตุผลให้เลี่ยงหุ้นตัวนี้ไปเลยทันที'},
    chip:{en:'Credit risk',th:'ความเสี่ยงเครดิต'},
    debtLabel:{en:'Total debt (most recent filing)',th:'หนี้สินรวม (งบล่าสุด)'},
    naText:{en:'n/a',th:'ไม่มีข้อมูล'},
    tierLabel:{en:'Reference credit-spread tier',th:'ระดับส่วนต่างเครดิตอ้างอิง'},
    legendA:{en:'This company’s leverage-and-profitability profile falls in the same reference tier as a',
             th:'โครงสร้างหนี้สินและความสามารถทำกำไรของบริษัทนี้ อยู่ในระดับอ้างอิงเดียวกับ'},
    legendB:{en:'bond, where credit spreads have historically run around',
             th:'ซึ่งส่วนต่างเครดิต (spread) เคยอยู่ที่ประมาณ'},
    sourceNote:{en:'Reference spread ranges: NYU Stern (Aswath Damodaran) synthetic-rating table — a standard method for estimating a company’s cost of debt when no market bond or CDS price exists.',
                th:'ช่วงส่วนต่างเครดิตอ้างอิงจาก: ตารางเรตติ้งสังเคราะห์ของ NYU Stern (Aswath Damodaran) — วิธีมาตรฐานที่ใช้ประเมินต้นทุนหนี้ของบริษัท เมื่อไม่มีราคาพันธบัตรหรือ CDS ในตลาดจริง'}
  };

  var COLOR = { low:'#16a34a', mod:'var(--amber)', high:'var(--red)', vhigh:'var(--red)' };
  function bandOf(v){ return v>=80?'vhigh':v>=60?'high':v>=35?'mod':'low'; }

  /* NYU Stern (Damodaran) interest-coverage -> synthetic-rating -> default-spread
     table, collapsed to 4 tiers and laid out on one log-scaled axis (~40 to
     ~2,000 bps). Widths are pre-computed log10 proportions of that axis so the
     chart reads as a real scale, not four equal boxes. */
  var SPREAD_REF = [
    { k:'low',   code:'IG',   w:26.4, gap:5.7,
      name:{en:'Investment grade (Aaa–Baa)', th:'ระดับลงทุนได้ (Aaa–Baa)'},
      range:'40–111 bps' },
    { k:'mod',   code:'BB',   w:7.5,  gap:10.4,
      name:{en:'Upper high-yield (Ba)', th:'ไฮยีลด์ระดับบน (Ba)'},
      range:'138–184 bps' },
    { k:'high',  code:'B',    w:16.0, gap:14.3,
      name:{en:'High-yield (B)', th:'ไฮยีลด์ (B)'},
      range:'275–509 bps' },
    { k:'vhigh', code:'CCC+', w:19.8, gap:0,
      name:{en:'Speculative (Caa or below)', th:'เก็งกำไรสูง (Caa หรือต่ำกว่า)'},
      range:'885–1,900+ bps' }
  ];
  function tierOf(band){
    for(var i=0;i<SPREAD_REF.length;i++) if(SPREAD_REF[i].k === band) return SPREAD_REF[i];
    return null;
  }

  function fmtMoney(v, ccy){
    if(!isNum(v)) return null;
    var sym = ccy === 'THB' ? '฿' : '$';
    var abs = Math.abs(v), out;
    if(abs >= 1e12) out = (v/1e12).toFixed(2) + 'T';
    else if(abs >= 1e9) out = (v/1e9).toFixed(1) + 'B';
    else if(abs >= 1e6) out = (v/1e6).toFixed(1) + 'M';
    else if(abs >= 1e3) out = (v/1e3).toFixed(1) + 'K';
    else out = String(Math.round(v));
    return sym + out;
  }

  var CACHE = null;
  function pctRank(vals, x){
    if(!isNum(x) || !vals.length) return null;
    var below = 0, n = 0;
    for(var i=0;i<vals.length;i++){ if(!isNum(vals[i])) continue; n++; if(vals[i] < x) below++; }
    return n ? Math.round(100*below/n) : null;
  }
  function build(){
    var snap = window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot();
    var stocks = snap && snap.stocks;
    if(!stocks) return null;
    var deVals=[], roaVals=[], mgVals=[];
    var keys = Object.keys(stocks);
    for(var i=0;i<keys.length;i++){
      var r = stocks[keys[i]];
      if(isNum(r.de) && !isFin(r)) deVals.push(r.de);
      if(isNum(r.roa)) roaVals.push(r.roa);
      if(isNum(r.margin)) mgVals.push(r.margin);
    }
    return { stocks:stocks, deVals:deVals, roaVals:roaVals, mgVals:mgVals };
  }
  function get(ticker){
    if(!CACHE) CACHE = build();
    if(!CACHE) return null;
    var row = CACHE.stocks[ticker];
    if(!row) return null;
    var fin = isFin(row), comps = [], score = 0, wsum = 0;

    if(!fin && isNum(row.de)){
      var levP = pctRank(CACHE.deVals, row.de);
      if(levP != null){ comps.push({k:'lev', v:levP}); score += levP*0.5; wsum += 0.5; }
    }
    if(isNum(row.roa)){
      var roaP = pctRank(CACHE.roaVals, row.roa);
      if(roaP != null){ var rp = 100-roaP; comps.push({k:'roa', v:rp}); score += rp*0.3; wsum += 0.3; }
    }
    if(isNum(row.margin)){
      var mgP = pctRank(CACHE.mgVals, row.margin);
      if(mgP != null){ var mp = 100-mgP; comps.push({k:'mg', v:mp}); score += mp*0.2; wsum += 0.2; }
    }
    if(!wsum) return null;
    var final = Math.round(score/wsum);
    return { score:final, band:bandOf(final), isFin:fin, comps:comps, debt:row.debt, ccy:row.ccy };
  }

  function widgetHTML(ticker){
    var d = get(ticker);
    if(!d){
      return '<div class="crs-box crs-empty"><div class="crs-note">' + esc(T(TXT.none)) + '</div></div>';
    }
    var color = COLOR[d.band];
    var debtStr = fmtMoney(d.debt, d.ccy);

    var scaleHTML = SPREAD_REF.map(function(z){
      var active = z.k === d.band;
      return '<div class="crs-zone' + (active ? ' active' : '') + '" style="flex:' + z.w +
        ';color:' + COLOR[z.k] + '" title="' + esc(T(z.name)) + ' · ' + esc(z.range) + '">' +
        '<span class="crs-zone-code">' + esc(z.code) + '</span></div>' +
        (z.gap ? '<div class="crs-gap" style="flex:' + z.gap + '"></div>' : '');
    }).join('');

    var tier = tierOf(d.band);
    var legend = tier ? ('<div class="crs-legend">' + esc(T(TXT.legendA)) + ' <b>' + esc(T(tier.name)) +
      '</b> ' + esc(T(TXT.legendB)) + ' <b>' + esc(tier.range) + '</b>.</div>') : '';

    var compHTML = d.comps.map(function(c){
      var cband = bandOf(c.v);
      return '<div class="crs-comp-row">' +
        '<span>' + esc(T(TXT.comp[c.k])) + '</span>' +
        '<div class="crs-comp-track"><div class="crs-comp-fill" style="width:' + c.v +
          '%;background:' + COLOR[cband] + '"></div></div>' +
        '<span class="crs-comp-v">' + c.v + '</span>' +
      '</div>';
    }).join('');

    var warn = (d.band === 'high' || d.band === 'vhigh')
      ? '<div class="crs-warn"><span class="crs-warn-ic">' + (d.band === 'vhigh' ? '⛔' : '⚠') + '</span>' +
          '<div><b>' + esc(T(TXT.warnTitle)) + '</b><p>' + esc(T(TXT.warnBody)) + '</p></div></div>'
      : '';
    var finNote = d.isFin ? '<div class="crs-finnote">' + esc(T(TXT.finNote)) + '</div>' : '';

    return '<div class="crs-box">' +
      '<div class="crs-debt"><span>' + esc(T(TXT.debtLabel)) + '</span><b>' +
        (debtStr ? esc(debtStr) : esc(T(TXT.naText))) + '</b></div>' +
      '<div class="crs-head"><span class="crs-head-l">' + esc(T(TXT.tierLabel)) +
        '</span><span class="crs-pill" style="color:' + color + ';border-color:' + color + '">' +
        esc(T(TXT.band[d.band])) + '</span></div>' +
      '<div class="crs-scale">' + scaleHTML + '</div>' +
      '<div class="crs-scale-axis"><span>~40 bps</span><span>1,900+ bps</span></div>' +
      legend +
      '<div class="crs-comps">' + compHTML + '</div>' +
      finNote + warn +
      '<div class="crs-note">' + esc(T(TXT.sub)) + ' ' + esc(T(TXT.sourceNote)) + '</div>' +
    '</div>';
  }

  function chipHTML(ticker){
    var d = get(ticker);
    if(!d) return '';
    var color = COLOR[d.band];
    return '<span class="crs-chip" style="color:' + color + ';border-color:' + color + '" title="' +
      esc(T(TXT.sub)) + '">' + esc(T(TXT.chip)) + ': ' + esc(T(TXT.band[d.band])) + ' (' + d.score + ')</span>';
  }

  window.__SPZ_CREDIT = {
    get:get, widgetHTML:widgetHTML, chipHTML:chipHTML,
    reset:function(){ CACHE = null; }
  };
})();
