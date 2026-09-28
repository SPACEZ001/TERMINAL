
  (function(){
    'use strict';
    if (window.__SPZ_PT) return;
    window.__SPZ_PT = true;

    function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
    function tx(o){ return o ? (o[L()] !== undefined ? o[L()] : o.en) : ''; }
    function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function isNum(v){ return typeof v === 'number' && isFinite(v); }
    function sgn(v, d){ return (v >= 0 ? '+' : '') + Number(v).toFixed(d === undefined ? 1 : d); }
    function snap(){ try { return window.__SPZ_LIVE && window.__SPZ_LIVE.snapshot && window.__SPZ_LIVE.snapshot(); } catch(e){ return null; } }
    function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
    function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }

    var LS_KEY = 'spacez.paperPortfolio';
    var CAT_LABEL = {
      value:{en:'Value',th:'คุณค่า'}, growth:{en:'Growth',th:'เติบโต'},
      dividend:{en:'Dividend',th:'ปันผล'}, defensive:{en:'Defensive',th:'ตั้งรับ'}
    };

    var C = {
      h:{en:'Paper Trading',th:'พอร์ตจำลอง'},
      lede:{en:'Open simulated positions on any stock in the directory above, sized with the same risk formula as the calculator, and priced against the live snapshot. Everything here is saved only in this browser — closing the tab does not lose it, but a different device starts empty.',
            th:'เปิดโพซิชันจำลองกับหุ้นตัวไหนก็ได้ในหน้า Stock Directory ด้านบน คำนวณขนาดด้วยสูตรความเสี่ยงเดียวกับเครื่องคำนวณ แล้วตีราคาด้วยข้อมูลสดล่าสุด ทุกอย่างที่นี่บันทึกไว้ในเบราว์เซอร์นี้เท่านั้น — ปิดแท็บไม่หาย แต่เปิดจากเครื่องอื่นจะเริ่มใหม่'},
      lblTicker:{en:'Ticker',th:'หุ้น'},
      lblEntry:{en:'Entry Price',th:'ราคาเข้าซื้อ'},
      lblShares:{en:'Shares',th:'จำนวนหุ้น'},
      sizeHelpTitle:{en:'Need help sizing this? Use the risk calculator',th:'ต้องการช่วยคำนวณขนาด? ใช้เครื่องคิดความเสี่ยง'},
      lblAccount:{en:'Account Size',th:'ขนาดพอร์ต'},
      lblRisk:{en:'Risk Per Trade (%)',th:'ความเสี่ยงต่อไม้ (%)'},
      lblStop:{en:'Stop Loss Price',th:'ราคาตัดขาดทุน'},
      suggestBtn:{en:'Suggest Shares →',th:'แนะนำจำนวนหุ้น →'},
      openBtn:{en:'Open Position →',th:'เปิดโพซิชัน →'},
      errInvalid:{en:'Pick a stock and enter a valid entry price and share count.',th:'เลือกหุ้นและใส่ราคาเข้าซื้อกับจำนวนหุ้นให้ถูกต้อง'},
      errSizing:{en:'Fill in account size, risk %, entry, and stop loss first.',th:'กรอกขนาดพอร์ต ความเสี่ยง % ราคาเข้าซื้อ และราคาตัดขาดทุนก่อน'},
      errSameSizing:{en:'Entry and stop loss can\'t be the same price.',th:'ราคาเข้าซื้อกับราคาตัดขาดทุนต้องไม่เท่ากัน'},
      suggestMsg:{en:'Suggested: {n} shares — filled in above.',th:'แนะนำ: {n} หุ้น — ใส่ให้ด้านบนแล้ว'},
      openCount:{en:'Open Positions',th:'โพซิชันที่เปิดอยู่'},
      unrealized:{en:'Unrealized P&L',th:'กำไร/ขาดทุนที่ยังไม่รับรู้'},
      realized:{en:'Realized P&L',th:'กำไร/ขาดทุนที่รับรู้แล้ว'},
      openH:{en:'Open Positions',th:'โพซิชันที่เปิดอยู่'},
      closedH:{en:'Closed Positions',th:'โพซิชันที่ปิดแล้ว'},
      noOpen:{en:'No open positions yet — open one above.',th:'ยังไม่มีโพซิชันที่เปิดอยู่ — เปิดโพซิชันแรกด้านบนได้เลย'},
      noClosed:{en:'Nothing closed yet.',th:'ยังไม่มีโพซิชันที่ปิด'},
      colTicker:{en:'Ticker',th:'หุ้น'},
      colShares:{en:'Shares',th:'จำนวน'},
      colEntry:{en:'Entry',th:'ราคาเข้า'},
      colCurrent:{en:'Current',th:'ราคาปัจจุบัน'},
      colExit:{en:'Exit',th:'ราคาออก'},
      colHeld:{en:'Held',th:'ถือมา'},
      colPnl:{en:'P&L',th:'กำไร/ขาดทุน'},
      closeBtn:{en:'Close',th:'ปิดโพซิชัน'},
      confirm:{en:'Confirm',th:'ยืนยัน'},
      cancel:{en:'Cancel',th:'ยกเลิก'},
      resetBtn:{en:'Reset Portfolio',th:'ล้างพอร์ตทั้งหมด'},
      resetConfirm:{en:'Click again to confirm reset',th:'กดอีกครั้งเพื่อยืนยันการล้าง'},
      shortWindow:{en:'Held under 30 days — CAGR here is a steep extrapolation, not a real annual rate. See the CAGR entry in the glossary.',
                   th:'ถือมาไม่ถึง 30 วัน — ค่า CAGR ตรงนี้เป็นการยืดขยายที่ชันมาก ไม่ใช่อัตราต่อปีจริง ดูคำอธิบาย CAGR ในหน้าคำศัพท์'},
      days:{en:'d',th:'วัน'},
      disclaimer:{en:'Simulated only — no real money, no execution, no slippage or fees modeled. Prices come from the same snapshot as the rest of the site and can lag the real market. Educational tool, not investment advice.',
                  th:'เป็นการจำลองเท่านั้น ไม่มีเงินจริง ไม่มีการส่งคำสั่งจริง และไม่ได้จำลอง slippage หรือค่าธรรมเนียม ราคาที่ใช้มาจากชุดข้อมูลเดียวกับส่วนอื่นของเว็บ อาจช้ากว่าตลาดจริง เป็นเครื่องมือเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน'}
    };

    function loadPortfolio(){
      try {
        var raw = lsGet(LS_KEY);
        var d = raw ? JSON.parse(raw) : null;
        if (!d || !Array.isArray(d.positions)) return { positions: [] };
        return d;
      } catch(e){ return { positions: [] }; }
    }
    var portfolio = loadPortfolio();
    function savePortfolio(){ lsSet(LS_KEY, JSON.stringify(portfolio)); }

    function allTickers(){
      var dir = window.__SPZ_DIR || {};
      var out = [];
      Object.keys(dir).forEach(function(cat){
        (dir[cat] || []).forEach(function(s){
          out.push({ cat:cat, ticker:s.ticker, name_en:s.name_en, name_th:s.name_th });
        });
      });
      return out;
    }

    function posName(p){ return (L() === 'th' ? p.name_th : p.name_en) || p.ticker; }

    function quote(ticker){
      var s = snap();
      var r = s && s.stocks && s.stocks[ticker];
      if (!r || !isNum(r.price)) return null;
      return { price:r.price, ccy: r.ccy || 'USD', chg: r.chg_pct, sector: r.sector, name: r.name };
    }

    var fmtCache = {};
    function money(v, cur){
      cur = cur || 'USD';
      var small = Math.abs(v) < 1;
      var key = cur + (small ? 'a' : 'b');
      if (fmtCache[key] === undefined) {
        try {
          fmtCache[key] = new Intl.NumberFormat('en-US', { style:'currency', currency:cur,
            minimumFractionDigits: small ? 4 : 2, maximumFractionDigits: small ? 4 : 2 });
        } catch(e){ fmtCache[key] = null; }
      }
      if (fmtCache[key]) { try { return fmtCache[key].format(v); } catch(e){} }
      return (v < 0 ? '-' : '') + Math.abs(v).toFixed(2) + ' ' + cur;
    }

    var root = document.getElementById('paperTrading');
    var closingId = null;
    var resetArmed = false;

    function fillTickerSelect(){
      var sel = document.getElementById('ptTicker');
      if (!sel) return;
      var keep = sel.value;
      var cats = {};
      allTickers().forEach(function(t){ (cats[t.cat] = cats[t.cat] || []).push(t); });
      sel.innerHTML = Object.keys(cats).map(function(cat){
        return '<optgroup label="' + esc(tx(CAT_LABEL[cat] || {en:cat,th:cat})) + '">' +
          cats[cat].map(function(t){
            var nm = L() === 'th' ? t.name_th : t.name_en;
            return '<option value="' + esc(t.ticker) + '">' + esc(t.ticker) + ' — ' + esc(nm) + '</option>';
          }).join('') +
        '</optgroup>';
      }).join('');
      if (keep) sel.value = keep;
      if (!sel.value && sel.options.length) sel.selectedIndex = 0;
    }

    function openTableHTML(){
      var open = portfolio.positions.filter(function(p){ return p.status === 'open'; });
      if (!open.length) return '<div class="pt-empty">' + esc(tx(C.noOpen)) + '</div>';
      var rows = open.map(function(p){
        var q = quote(p.ticker);
        var cur = q ? q.price : p.entryPrice;
        var roi = ((cur - p.entryPrice) / p.entryPrice) * 100;
        var days = Math.max(0, (Date.now() - new Date(p.entryDate).getTime()) / 86400000);
        var years = Math.max(days / 365.25, 1 / 365.25);
        var cagr = (Math.pow(cur / p.entryPrice, 1 / years) - 1) * 100;
        var pnl = (cur - p.entryPrice) * p.shares;
        var isClosing = closingId === p.id;
        return '<div class="pt-row">' +
          '<div class="pt-cell pt-tk"><b>' + esc(p.ticker) + '</b><span class="pt-nm">' + esc(posName(p)) + '</span></div>' +
          '<div class="pt-cell">' + esc(String(p.shares)) + '</div>' +
          '<div class="pt-cell">' + money(p.entryPrice, p.ccy) + '</div>' +
          '<div class="pt-cell">' + (q ? money(cur, p.ccy) : '—') + '</div>' +
          '<div class="pt-cell ' + (roi >= 0 ? 'up' : 'dn') + '">' + sgn(roi, 1) + '%</div>' +
          '<div class="pt-cell ' + (cagr >= 0 ? 'up' : 'dn') + '">' + sgn(cagr, 1) + '%' +
            (days < 30 ? '<span class="pt-warn" title="' + esc(tx(C.shortWindow)) + '">*</span>' : '') + '</div>' +
          '<div class="pt-cell ' + (pnl >= 0 ? 'up' : 'dn') + '">' + (pnl >= 0 ? '+' : '') + money(pnl, p.ccy) + '</div>' +
          '<div class="pt-cell pt-actions">' +
            (isClosing
              ? '<input type="number" class="pt-exitinput" id="ptExitPrice_' + p.id + '" value="' + (q ? cur : p.entryPrice) + '" step="0.0001">' +
                '<button type="button" class="pt-mini pt-confirm" data-close-confirm="' + p.id + '">' + esc(tx(C.confirm)) + '</button>' +
                '<button type="button" class="pt-mini" data-close-cancel="1">' + esc(tx(C.cancel)) + '</button>'
              : '<button type="button" class="pt-mini" data-close-start="' + p.id + '">' + esc(tx(C.closeBtn)) + '</button>') +
          '</div>' +
        '</div>';
      }).join('');
      return '<div class="pt-tablewrap"><div class="pt-table"><div class="pt-row pt-head">' +
        '<div class="pt-cell">' + esc(tx(C.colTicker)) + '</div>' +
        '<div class="pt-cell">' + esc(tx(C.colShares)) + '</div>' +
        '<div class="pt-cell">' + esc(tx(C.colEntry)) + '</div>' +
        '<div class="pt-cell">' + esc(tx(C.colCurrent)) + '</div>' +
        '<div class="pt-cell">ROI</div>' +
        '<div class="pt-cell">CAGR</div>' +
        '<div class="pt-cell">' + esc(tx(C.colPnl)) + '</div>' +
        '<div class="pt-cell"></div>' +
      '</div>' + rows + '</div></div>';
    }

    function closedTableHTML(){
      var closed = portfolio.positions.filter(function(p){ return p.status === 'closed'; })
        .sort(function(a,b){ return new Date(b.exitDate) - new Date(a.exitDate); });
      if (!closed.length) return '<div class="pt-empty">' + esc(tx(C.noClosed)) + '</div>';
      var rows = closed.map(function(p){
        var pnl = (p.exitPrice - p.entryPrice) * p.shares;
        var roi = ((p.exitPrice - p.entryPrice) / p.entryPrice) * 100;
        var days = Math.max(0, (new Date(p.exitDate) - new Date(p.entryDate)) / 86400000);
        return '<div class="pt-row">' +
          '<div class="pt-cell pt-tk"><b>' + esc(p.ticker) + '</b><span class="pt-nm">' + esc(posName(p)) + '</span></div>' +
          '<div class="pt-cell">' + esc(String(p.shares)) + '</div>' +
          '<div class="pt-cell">' + money(p.entryPrice, p.ccy) + '</div>' +
          '<div class="pt-cell">' + money(p.exitPrice, p.ccy) + '</div>' +
          '<div class="pt-cell">' + Math.round(days) + esc(tx(C.days)) + '</div>' +
          '<div class="pt-cell ' + (roi >= 0 ? 'up' : 'dn') + '">' + sgn(roi, 1) + '%</div>' +
          '<div class="pt-cell ' + (pnl >= 0 ? 'up' : 'dn') + '">' + (pnl >= 0 ? '+' : '') + money(pnl, p.ccy) + '</div>' +
        '</div>';
      }).join('');
      return '<div class="pt-tablewrap"><div class="pt-table"><div class="pt-row pt-head">' +
        '<div class="pt-cell">' + esc(tx(C.colTicker)) + '</div>' +
        '<div class="pt-cell">' + esc(tx(C.colShares)) + '</div>' +
        '<div class="pt-cell">' + esc(tx(C.colEntry)) + '</div>' +
        '<div class="pt-cell">' + esc(tx(C.colExit)) + '</div>' +
        '<div class="pt-cell">' + esc(tx(C.colHeld)) + '</div>' +
        '<div class="pt-cell">ROI</div>' +
        '<div class="pt-cell">' + esc(tx(C.colPnl)) + '</div>' +
      '</div>' + rows + '</div></div>';
    }

    function summaryHTML(){
      var open = portfolio.positions.filter(function(p){ return p.status === 'open'; });
      var closed = portfolio.positions.filter(function(p){ return p.status === 'closed'; });
      var byCcy = {}, realizedByCcy = {};
      open.forEach(function(p){
        var q = quote(p.ticker);
        var cur = q ? q.price : p.entryPrice;
        byCcy[p.ccy] = (byCcy[p.ccy] || 0) + (cur - p.entryPrice) * p.shares;
      });
      closed.forEach(function(p){
        realizedByCcy[p.ccy] = (realizedByCcy[p.ccy] || 0) + (p.exitPrice - p.entryPrice) * p.shares;
      });
      var cards = ['<div class="pt-stat"><span class="lbl">' + esc(tx(C.openCount)) + '</span><span class="val">' + open.length + '</span></div>'];
      Object.keys(byCcy).forEach(function(c){
        var v = byCcy[c];
        cards.push('<div class="pt-stat"><span class="lbl">' + esc(tx(C.unrealized)) + ' (' + esc(c) + ')</span>' +
          '<span class="val ' + (v >= 0 ? 'up' : 'dn') + '">' + (v >= 0 ? '+' : '') + money(v, c) + '</span></div>');
      });
      Object.keys(realizedByCcy).forEach(function(c){
        var v = realizedByCcy[c];
        cards.push('<div class="pt-stat"><span class="lbl">' + esc(tx(C.realized)) + ' (' + esc(c) + ')</span>' +
          '<span class="val ' + (v >= 0 ? 'up' : 'dn') + '">' + (v >= 0 ? '+' : '') + money(v, c) + '</span></div>');
      });
      return cards.join('');
    }

    function paintStatic(){
      var q = function(k){ return root.querySelector('[data-pt="' + k + '"]'); };
      ['h','lede','lblTicker','lblEntry','lblShares','sizeHelpTitle','lblAccount','lblRisk','lblStop',
       'suggestBtn','openBtn','openH','closedH','resetBtn','disclaimer'].forEach(function(k){
        var el = q(k);
        if (el) el.textContent = tx(C[k]);
      });
    }

    function paint(){
      if (!root) return;
      paintStatic();
      fillTickerSelect();
      var summary = root.querySelector('[data-pt="summary"]');
      if (summary) summary.innerHTML = summaryHTML();
      var openHost = document.getElementById('ptOpenTable');
      if (openHost) openHost.innerHTML = openTableHTML();
      var closedHost = document.getElementById('ptClosedTable');
      if (closedHost) closedHost.innerHTML = closedTableHTML();
    }

    function bind(){
      var tickerSel = document.getElementById('ptTicker');
      if (tickerSel) tickerSel.addEventListener('change', function(){
        var q = quote(this.value);
        if (q) document.getElementById('ptEntry').value = q.price;
      });

      var suggestBtn = document.getElementById('ptSuggestBtn');
      if (suggestBtn) suggestBtn.addEventListener('click', function(){
        var account = parseFloat(document.getElementById('ptAccount').value);
        var risk = parseFloat(document.getElementById('ptRisk').value);
        var entry = parseFloat(document.getElementById('ptEntry').value);
        var stop = parseFloat(document.getElementById('ptStop').value);
        var msg = document.getElementById('ptSuggestMsg');
        if (!isFinite(account) || !isFinite(risk) || !isFinite(entry) || !isFinite(stop) ||
            account <= 0 || risk <= 0 || entry <= 0 || stop <= 0) {
          msg.textContent = tx(C.errSizing);
          return;
        }
        var perShareRisk = Math.abs(entry - stop);
        if (perShareRisk === 0) { msg.textContent = tx(C.errSameSizing); return; }
        var shares = Math.floor((account * (risk / 100)) / perShareRisk);
        document.getElementById('ptShares').value = shares;
        msg.textContent = tx(C.suggestMsg).replace('{n}', shares);
      });

      var openBtn = document.getElementById('ptOpenBtn');
      if (openBtn) openBtn.addEventListener('click', function(){
        var sel = document.getElementById('ptTicker');
        var ticker = sel.value;
        var shares = parseFloat(document.getElementById('ptShares').value);
        var entry = parseFloat(document.getElementById('ptEntry').value);
        var stopVal = parseFloat(document.getElementById('ptStop').value);
        var errEl = document.getElementById('ptError');
        errEl.textContent = '';
        if (!ticker || !isFinite(shares) || shares <= 0 || !isFinite(entry) || entry <= 0) {
          errEl.textContent = tx(C.errInvalid);
          return;
        }
        var q = quote(ticker);
        var info = allTickers().filter(function(t){ return t.ticker === ticker; })[0];
        portfolio.positions.push({
          id: 'p' + Date.now() + Math.floor(Math.random() * 1000),
          ticker: ticker,
          name_en: info ? info.name_en : ticker,
          name_th: info ? info.name_th : ticker,
          sector: q ? q.sector : null,
          ccy: (q && q.ccy) || 'USD',
          shares: shares,
          entryPrice: entry,
          entryDate: new Date().toISOString(),
          stopLoss: isFinite(stopVal) && stopVal > 0 ? stopVal : null,
          status: 'open'
        });
        savePortfolio();
        document.getElementById('ptShares').value = '';
        paint();
      });

      root.addEventListener('click', function(e){
        var t = e.target;
        if (!t || !t.getAttribute) return;
        var startId = t.getAttribute('data-close-start');
        if (startId) { closingId = startId; paint(); return; }
        if (t.getAttribute('data-close-cancel')) { closingId = null; paint(); return; }
        var confirmId = t.getAttribute('data-close-confirm');
        if (confirmId) {
          var input = document.getElementById('ptExitPrice_' + confirmId);
          var exitPrice = input ? parseFloat(input.value) : NaN;
          if (!isFinite(exitPrice) || exitPrice <= 0) return;
          var pos = portfolio.positions.filter(function(p){ return p.id === confirmId; })[0];
          if (pos) {
            pos.status = 'closed';
            pos.exitPrice = exitPrice;
            pos.exitDate = new Date().toISOString();
            savePortfolio();
          }
          closingId = null;
          paint();
        }
      });

      var resetBtn = document.getElementById('ptResetBtn');
      if (resetBtn) resetBtn.addEventListener('click', function(){
        if (!resetArmed) {
          resetArmed = true;
          resetBtn.textContent = tx(C.resetConfirm);
          setTimeout(function(){ resetArmed = false; if (resetBtn) resetBtn.textContent = tx(C.resetBtn); }, 4000);
          return;
        }
        portfolio = { positions: [] };
        savePortfolio();
        resetArmed = false;
        paint();
      });
    }

    function whenDirReady(cb){
      if (window.__SPZ_DIR) { cb(); return; }
      var tries = 0;
      var iv = setInterval(function(){
        tries++;
        if (window.__SPZ_DIR || tries > 100) { clearInterval(iv); cb(); }
      }, 50);
    }

    if (root) {
      whenDirReady(function(){
        bind();
        paint();
        document.addEventListener('spz:snapshot', function(){ paint(); });
        new MutationObserver(paint).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
      });
    }
  })();
  