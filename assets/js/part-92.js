/* =====================================================================
   SPACEZ PRINT ALL (2026-11-17) — admin only
   User request: from the admin terminal, print every page of the site (and
   the Stock / Elliott Wave classrooms, the Market Brain with all its manuals,
   the IC guide…) combined into ONE document — to print, keep as a PDF, or
   hand to an AI as text.
   * Route #/printall (in ADMIN_ONLY_ROUTES + NAV_HIDDEN), opened from the
     admin panel button "พิมพ์ทั้งเว็บ · รวมเป็นไฟล์เดียว" (#cagBtnPrintAll).
     Every action re-checks __SPZ_TIER() === 'full'.
   * Pages are visited one by one (so each screen draws itself), then their
     VISIBLE content is rebuilt as clean HTML: headings, text, lists, tables,
     charts (SVG with colours inlined, canvases as images). Buttons, inputs,
     scripts, styles and anything hidden are left out — no source code, no
     form values, no keys ever go into the document.
   * Classroom lessons come through part-65's __SPZ_CLASSROOM_PRINT (same
     admin/editor key the classroom already uses); the Brain through
     __SPZ_BRAIN_PRINT (k_print.js, needs the Brain to have been opened —
     this page opens it first); IC_License.html is fetched same-origin.
   * Output: print / save as PDF (A4, white, formal), one .html file, or one
     .md text file. Each document carries a reference code SPZ-AL-… and an
     "internal document — admin only" line on the cover.
   * window.__SPZ_HTML2MD(node) is also used by the Brain's ".md" button.
   ===================================================================== */
(function(){
  'use strict';
  if(window.__SPZ_PRINTALL) return;
  window.__SPZ_PRINTALL = true;
  function L(){ return document.documentElement.getAttribute('lang') === 'th' ? 'th' : 'en'; }
  function T(o){ return o == null ? '' : typeof o === 'string' ? o : (o[L()] != null ? o[L()] : o.en); }
  function B(en, th){ return { en:en, th:th }; }
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]; }); }
  function isAdmin(){ try { return window.__SPZ_TIER && window.__SPZ_TIER() === 'full'; } catch(e){ return false; } }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }

  /* ------------------------------------------------------------------
     HTML → Markdown (headings, paragraphs, lists, tables, emphasis)
     ------------------------------------------------------------------ */
  function html2md(root){
    var out = [];
    function txt(s){ return String(s || '').replace(/\s+/g, ' '); }
    function inline(n){
      var s = '';
      n.childNodes.forEach(function(c){
        if(c.nodeType === 3){ s += txt(c.nodeValue); return; }
        if(c.nodeType !== 1) return;
        var t = c.tagName.toLowerCase();
        if(/^(script|style|svg|img|canvas|button|input|select|textarea)$/.test(t)) return;
        if(t === 'br'){ s += '  \n'; return; }
        var inner = inline(c);
        if(!inner.trim()){ s += inner; return; }
        if(t === 'b' || t === 'strong') s += '**' + inner.trim() + '** ';
        else if(t === 'em' || t === 'i') s += '*' + inner.trim() + '* ';
        else if(t === 'code') s += '`' + inner.trim() + '`';
        else s += inner + ' ';
      });
      return s.replace(/ {2,}(?!\n)/g, ' ');
    }
    function cell(n){ return inline(n).replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim(); }
    function block(n, depth){
      n.childNodes.forEach(function(c){
        if(c.nodeType === 3){ var v = txt(c.nodeValue).trim(); if(v) out.push(v + '\n'); return; }
        if(c.nodeType !== 1) return;
        var t = c.tagName.toLowerCase();
        if(/^(script|style|svg|img|canvas|button|input|select|textarea|noscript|template)$/.test(t)) return;
        var m = /^h([1-6])$/.exec(t);
        if(m){ var h = txt(c.textContent).trim(); if(h) out.push('\n' + '######'.slice(0, Math.min(6, +m[1] + (depth || 0))) + ' ' + h + '\n'); return; }
        if(t === 'p' || t === 'figcaption' || t === 'summary' || t === 'dt'){ var p = inline(c).trim(); if(p) out.push(p + '\n'); return; }
        if(t === 'ul' || t === 'ol'){
          var i = 0;
          Array.prototype.forEach.call(c.children, function(li){ if(li.tagName.toLowerCase() !== 'li') return; i++; var v = inline(li).trim(); if(v) out.push((t === 'ol' ? i + '. ' : '- ') + v); });
          out.push(''); return;
        }
        if(t === 'table'){
          var rows = Array.prototype.slice.call(c.querySelectorAll('tr'));
          if(!rows.length) return;
          var cols = 0, grid = rows.map(function(r){ var cs = Array.prototype.map.call(r.children, cell); cols = Math.max(cols, cs.length); return cs; });
          if(!cols) return;
          grid.forEach(function(r, k){ while(r.length < cols) r.push(''); out.push('| ' + r.join(' | ') + ' |'); if(k === 0) out.push('|' + new Array(cols + 1).join(' --- |')); });
          out.push(''); return;
        }
        if(t === 'blockquote'){ var q = inline(c).trim(); if(q) out.push('> ' + q + '\n'); return; }
        if(t === 'pre'){ out.push('```\n' + (c.textContent || '').trim() + '\n```\n'); return; }
        if(t === 'hr'){ out.push('\n---\n'); return; }
        /* a container: if it only holds inline content, write it as one line, else go deeper */
        var hasBlock = c.querySelector('p,div,section,article,ul,ol,table,h1,h2,h3,h4,h5,h6,li,blockquote,pre,header,footer,details,dl');
        if(!hasBlock){ var v2 = inline(c).trim(); if(v2) out.push(v2 + '\n'); return; }
        block(c, depth);
      });
    }
    block(root.body || root, 0);
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  }
  window.__SPZ_HTML2MD = html2md;

  /* ------------------------------------------------------------------
     live DOM → clean printable HTML (only what is visible)
     ------------------------------------------------------------------ */
  var SKIP_TAGS = /^(script|style|link|meta|noscript|template|button|input|select|textarea|option|iframe|object|embed|nav|form|dialog)$/;
  var SKIP_SEL = '.spz-src,.spzc-bar,.spzc-fold,.spzc-done,.spzc-end,.spzq,.spzd-card,.cag-toast,.bz-tabs,.bz-ask,.bqBar,[data-noprint],.spz-lock-badge';
  var KEEP = { h1:1, h2:1, h3:1, h4:1, h5:1, h6:1, p:1, ul:1, ol:1, li:1, table:1, thead:1, tbody:1, tfoot:1, tr:1, td:1, th:1, caption:1, blockquote:1, pre:1, code:1, b:1, strong:1, em:1, i:1, small:1, sup:1, sub:1, br:1, hr:1, dl:1, dt:1, dd:1, figure:1, figcaption:1, details:1, summary:1, mark:1, u:1, s:1 };
  var SVG_PROPS = ['fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'opacity', 'fill-opacity', 'stroke-opacity', 'font-size', 'font-weight', 'font-family', 'text-anchor', 'dominant-baseline', 'stop-color', 'stop-opacity', 'display'];
  function hidden(el, cs){
    cs = cs || getComputedStyle(el);
    if(cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return true;
    if(+cs.opacity === 0 && el.tagName !== 'svg') return true;
    return false;
  }
  function svgClone(svg){
    var c = svg.cloneNode(true), src = svg.querySelectorAll('*'), dst = c.querySelectorAll('*'), n = Math.min(src.length, dst.length, 6000);
    var apply = function(s, d){ var cs = getComputedStyle(s); SVG_PROPS.forEach(function(p){ var v = cs.getPropertyValue(p); if(v) d.style.setProperty(p, v); }); d.removeAttribute('class'); };
    apply(svg, c);
    for(var i = 0; i < n; i++){ try { apply(src[i], dst[i]); } catch(e){} }
    c.querySelectorAll('script,foreignObject').forEach(function(x){ x.remove(); });
    var r = svg.getBoundingClientRect();
    if(!c.getAttribute('viewBox') && r.width) c.setAttribute('viewBox', '0 0 ' + Math.round(r.width) + ' ' + Math.round(r.height));
    c.removeAttribute('width'); c.removeAttribute('height');
    c.setAttribute('style', (c.getAttribute('style') || '') + ';max-width:' + Math.max(120, Math.round(r.width)) + 'px;width:100%;height:auto;');
    return c.outerHTML;
  }
  function clean(el, budget){
    var out = '';
    el.childNodes.forEach(function(c){
      if(budget.n > 120000) return;
      if(c.nodeType === 3){ var v = c.nodeValue; if(v && v.trim()){ out += esc(v.replace(/\s+/g, ' ')); budget.n += v.length; } return; }
      if(c.nodeType !== 1) return;
      var t = c.tagName.toLowerCase();
      if(SKIP_TAGS.test(t)) return;
      if(c.matches && c.matches(SKIP_SEL)) return;
      var cs = getComputedStyle(c);
      if(hidden(c, cs) && t !== 'details') return;
      if(t === 'svg'){ var r = c.getBoundingClientRect(); if(r.width >= 60 && r.height >= 40){ try { out += '<div class="spa-fig">' + svgClone(c) + '</div>'; } catch(e){} } return; }
      if(t === 'canvas'){ try { if(c.width >= 60 && c.height >= 40) out += '<div class="spa-fig"><img src="' + c.toDataURL('image/png') + '" alt=""></div>'; } catch(e){} return; }
      if(t === 'img'){ var s = c.currentSrc || c.src || ''; if(/^data:image\//.test(s) || s.indexOf(location.origin) === 0){ var r2 = c.getBoundingClientRect(); if(r2.width >= 24) out += '<img src="' + esc(s) + '" alt="" style="max-width:' + Math.round(r2.width) + 'px">'; } return; }
      if(t === 'a'){ out += clean(c, budget); return; }
      /* a short row of label / value pieces (flex row) → one line "a · b · c" instead of one line per piece */
      if(!KEEP[t] && /flex$/.test(cs.display) && cs.flexDirection.indexOf('row') === 0 && !c.querySelector('svg,canvas,img,table,ul,ol,h1,h2,h3,h4,h5,h6,p,li')){
        var tx = (c.innerText || '').replace(/\s+/g, ' ').trim();
        if(tx && tx.length < 220){
          var direct = Array.prototype.some.call(c.childNodes, function(k){ return k.nodeType === 3 && k.nodeValue.trim(); });
          var bits = direct ? [] : Array.prototype.map.call(c.children, function(k){ return (k.innerText || '').replace(/\s+/g, ' ').trim(); }).filter(Boolean);
          out += '<div>' + esc(bits.length > 1 ? bits.join(' · ') : tx) + '</div>'; budget.n += tx.length; return;
        }
      }
      var inner = clean(c, budget);
      if(!inner.replace(/<[^>]+>/g, '').trim() && inner.indexOf('<div class="spa-fig">') < 0 && inner.indexOf('<img') < 0) return;
      if(KEEP[t]){ var span = (t === 'td' || t === 'th') && c.colSpan > 1 ? ' colspan="' + c.colSpan + '"' : ''; out += '<' + t + span + (t === 'details' ? ' open' : '') + '>' + inner + '</' + t + '>'; return; }
      var blk = /^(block|flex|grid|list-item|table|flow-root)/.test(cs.display);
      out += blk ? '<div>' + inner + '</div>' : inner + ' ';
    });
    return out;
  }

  /* scope a stylesheet under one wrapper class, so the Brain's own print CSS
     (html/body/:root rules, generic class names) cannot leak into the rest */
  function splitSel(t){ var out = [], d = 0, cur = ''; for(var i = 0; i < t.length; i++){ var c = t[i]; if(c === '(' || c === '[') d++; else if(c === ')' || c === ']') d--; if(c === ',' && !d){ out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out; }
  function scopeOne(sel, W){
    sel = sel.trim(); if(!sel) return '';
    var m = /^(html|:root|body)((?:\[[^\]]*\]|\.[\w-]+)*)\s*(.*)$/.exec(sel);
    if(m){ var rest = m[3].replace(/^body((?:\[[^\]]*\]|\.[\w-]+)*)\s*/, '$1 ').trim(); if(/^[\[.]/.test(rest)) { var k = /^((?:\[[^\]]*\]|\.[\w-]+)+)\s*(.*)$/.exec(rest); return W + m[2] + k[1] + (k[2] ? ' ' + k[2] : ''); } return W + m[2] + (rest ? ' ' + rest : ''); }
    if(/^\[data-(theme|pr)/.test(sel)) return W + sel;
    return W + ' ' + sel;
  }
  function scopeCss(css, W){
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    var out = '', i = 0, n = css.length;
    while(i < n){
      var o = css.indexOf('{', i); if(o < 0) break;
      var head = css.slice(i, o).trim(), d = 1, j = o + 1;
      while(j < n && d){ if(css[j] === '{') d++; else if(css[j] === '}') d--; j++; }
      var inner = css.slice(o + 1, j - 1);
      var semi = head.lastIndexOf(';'); if(semi >= 0 && head.charAt(0) === '@'){ head = head.slice(semi + 1).trim(); }
      if(/^@(media|supports|container|layer)/.test(head)) out += head + '{' + scopeCss(inner, W) + '}';
      else if(/^@(page|import|charset)/.test(head)) {}
      else if(head.charAt(0) === '@') out += head + '{' + inner + '}';
      else out += splitSel(head).map(function(x){ return scopeOne(x, W); }).filter(Boolean).join(',') + '{' + inner + '}';
      i = j;
    }
    return out;
  }

  /* ------------------------------------------------------------------
     page state + UI
     ------------------------------------------------------------------ */
  var EXTRA = [
    { k:'cls-stk', t:B('Stock Classroom — every lesson', 'ห้องเรียนหุ้น — ทุกบทเรียน') },
    { k:'cls-ew', t:B('Elliott Wave Classroom — every lesson', 'ห้องเรียน Elliott Wave — ทุกบทเรียน') },
    { k:'brain', t:B('Market Brain — everything + all manuals', 'สมองตลาด — ทุกอย่าง + คู่มือทั้งหมด') },
    { k:'ic', t:B('IC licence guide (IC_License.html)', 'คู่มือสอบ IC (IC_License.html)') }
  ];
  var SKIP_ROUTES = { printall:1, brain:1, stockclass:0 };
  var sel = null, busy = false, cancel = false, lastDoc = null, sec = null;
  function secOf(id){ return document.querySelector('section[data-route="' + id + '"]') || document.getElementById(id); }
  function routes(){
    var list = [];
    try { list = (window.__spzRouteList ? window.__spzRouteList() : []).filter(function(r){ return !SKIP_ROUTES[r.id]; }); } catch(e){}
    if(secOf('home') && !list.some(function(r){ return r.id === 'home'; })) list.unshift({ id:'home', t:B('Home', 'หน้าแรก') });
    return list;
  }
  function loadSel(){ try { var v = JSON.parse(localStorage.getItem('spz.printall.sel') || 'null'); if(v) return v; } catch(e){} return null; }
  function saveSel(){ try { localStorage.setItem('spz.printall.sel', JSON.stringify(sel)); } catch(e){} }
  function ensureSel(){
    if(!sel) sel = loadSel() || {};
    routes().forEach(function(r){ if(sel['r:' + r.id] == null) sel['r:' + r.id] = 1; });
    EXTRA.forEach(function(x){ if(sel[x.k] == null) sel[x.k] = 1; });
  }
  var IC = {
    lock:'<path d="M6 11h12v9H6z"/><path d="M8.5 11V8a3.5 3.5 0 017 0v3"/>',
    doc:'<path d="M5 3.5h10l4 4V20.5H5z"/><path d="M15 3.5V7.5h4"/><path d="M8 12h8M8 15.5h8"/>',
    print:'<path d="M6.5 9V3.5h11V9"/><rect x="3" y="9" width="18" height="8" rx="1.5"/><path d="M6.5 14h11v6.5h-11z"/>',
    code:'<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
    ai:'<path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8z"/><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    stop:'<rect x="6" y="6" width="12" height="12" rx="2"/>'
  };
  function ico(k){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[k] || '') + '</svg>'; }
  function paint(){
    if(!sec) return;
    if(!isAdmin()){
      sec.innerHTML = '<div class="pa-wrap"><div class="pa-lock">' + ico('lock') + '<b>' + esc(T(B('Admin only', 'เฉพาะแอดมิน'))) + '</b><p>' + esc(T(B('Sign in with the admin key to print the whole site.', 'เข้าสู่ระบบด้วยรหัสแอดมินเพื่อพิมพ์ทั้งเว็บ'))) + '</p></div></div>';
      return;
    }
    ensureSel();
    var rs = routes(), nOn = 0, nAll = rs.length + EXTRA.length;
    rs.forEach(function(r){ if(sel['r:' + r.id]) nOn++; }); EXTRA.forEach(function(x){ if(sel[x.k]) nOn++; });
    sec.innerHTML = '<div class="pa-wrap">' +
      '<header class="pa-head"><div class="pa-kick"><span class="pa-pill">' + ico('lock') + esc(T(B('Admin only', 'เฉพาะแอดมิน'))) + '</span><span>' + esc(T(B('Internal documents', 'เอกสารภายใน'))) + '</span></div>' +
        '<h2>' + esc(T(B('Print the whole site — one file', 'พิมพ์ทั้งเว็บ — รวมเป็นไฟล์เดียว'))) + '</h2>' +
        '<p>' + esc(T(B('Pick what to include. The page visits each screen, keeps only what is shown on it (text, tables, charts) and puts everything into one document — to print, save as PDF, or download as text to ask an AI.', 'เลือกสิ่งที่จะรวม ระบบจะเปิดทีละหน้า เก็บเฉพาะเนื้อหาที่แสดงบนจอ (ข้อความ ตาราง กราฟ) แล้วรวมเป็นเอกสารเดียว พิมพ์ได้ บันทึกเป็น PDF ได้ หรือดาวน์โหลดเป็นข้อความไว้ถาม AI'))) + '</p>' +
        '<ul class="pa-safe"><li>' + ico('code') + esc(T(B('No source code, scripts, keys or form values go into the file — only what a reader sees.', 'ไม่มีซอร์สโค้ด สคริปต์ รหัส หรือค่าที่พิมพ์ในช่องกรอก ติดไปในไฟล์ มีแต่สิ่งที่คนอ่านเห็นบนจอ'))) + '</li>' +
        '<li>' + ico('lock') + esc(T(B('This page and every button check the admin sign-in again before they run.', 'หน้านี้และทุกปุ่มจะเช็กว่าเป็นแอดมินอีกครั้งก่อนทำงาน'))) + '</li></ul></header>' +
      '<div class="pa-grid">' +
        '<div class="pa-card"><div class="pa-ch"><b>1 · ' + esc(T(B('What to include', 'เลือกเนื้อหา'))) + '</b><span>' + nOn + ' / ' + nAll + '</span>' +
          '<button type="button" data-pa-all="1">' + esc(T(B('All', 'ทั้งหมด'))) + '</button><button type="button" data-pa-all="0">' + esc(T(B('None', 'ไม่เลือก'))) + '</button></div>' +
          '<h4>' + esc(T(B('Classrooms, Brain and guides', 'ห้องเรียน สมองตลาด และคู่มือ'))) + '</h4><div class="pa-list pa-ex">' +
            EXTRA.map(function(x){ return '<label class="' + (sel[x.k] ? 'on' : '') + '"><input type="checkbox" data-pa-k="' + x.k + '"' + (sel[x.k] ? ' checked' : '') + '><span>' + esc(T(x.t)) + '</span></label>'; }).join('') + '</div>' +
          '<h4>' + esc(T(B('Every page in the menu', 'ทุกหน้าในเมนู'))) + ' <input type="search" class="pa-filter" placeholder="' + esc(T(B('filter…', 'ค้นหา…'))) + '"></h4><div class="pa-list pa-rt">' +
            rs.map(function(r){ var k = 'r:' + r.id; return '<label class="' + (sel[k] ? 'on' : '') + '" data-pa-name="' + esc((T(r.t) + ' ' + r.id).toLowerCase()) + '"><input type="checkbox" data-pa-k="' + k + '"' + (sel[k] ? ' checked' : '') + '><span>' + esc(T(r.t) || r.id) + '</span><em>#/' + esc(r.id) + '</em></label>'; }).join('') + '</div>' +
        '</div>' +
        '<div class="pa-card pa-go"><div class="pa-ch"><b>2 · ' + esc(T(B('Make the file', 'สร้างไฟล์'))) + '</b></div>' +
          '<button type="button" class="pa-btn pri" data-pa-run="print">' + ico('print') + '<span><b>' + esc(T(B('Print / Save as PDF', 'พิมพ์ / บันทึกเป็น PDF'))) + '</b><small>' + esc(T(B('A4, white paper, cover + contents', 'A4 กระดาษขาว มีหน้าปกและสารบัญ'))) + '</small></span></button>' +
          '<button type="button" class="pa-btn" data-pa-run="html">' + ico('doc') + '<span><b>' + esc(T(B('Download one .html file', 'ดาวน์โหลดไฟล์ .html ไฟล์เดียว'))) + '</b><small>' + esc(T(B('opens in any browser, keeps the charts', 'เปิดได้ทุกเบราว์เซอร์ กราฟยังอยู่ครบ'))) + '</small></span></button>' +
          '<button type="button" class="pa-btn" data-pa-run="md">' + ico('ai') + '<span><b>' + esc(T(B('Download as text (.md) for AI', 'ดาวน์โหลดเป็นข้อความ (.md) ไว้ถาม AI'))) + '</b><small>' + esc(T(B('headings, text and tables only — small and easy to paste', 'เฉพาะหัวข้อ ข้อความ และตาราง ไฟล์เล็ก วางง่าย'))) + '</small></span></button>' +
          '<div class="pa-prog" hidden><div class="pa-bar"><i></i></div><p data-pa-msg></p><button type="button" class="pa-stop" data-pa-stop>' + ico('stop') + esc(T(B('Stop', 'หยุด'))) + '</button></div>' +
          '<p class="pa-note">' + esc(T(B('Takes about 1 second per page (a full run ≈ 1–2 minutes). Keep this tab open. Pages that are still loading their data are printed as they look at that moment.', 'ใช้เวลาราว 1 วินาทีต่อหน้า (ทั้งเว็บราว 1–2 นาที) เปิดแท็บนี้ค้างไว้ หน้าที่ยังโหลดข้อมูลไม่เสร็จจะถูกเก็บตามที่เห็นในตอนนั้น'))) + '</p>' +
        '</div>' +
      '</div></div>';
  }
  function setMsg(t, pct){
    if(!sec) return;
    var pr = sec.querySelector('.pa-prog'); if(pr) pr.hidden = false;
    var m = sec.querySelector('[data-pa-msg]'); if(m) m.textContent = t;
    var i = sec.querySelector('.pa-bar i'); if(i && pct != null) i.style.width = Math.max(2, Math.min(100, pct)) + '%';
  }
  function refCode(){
    var d = new Date(), p2 = function(n){ return (n < 10 ? '0' : '') + n; }, A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = '';
    for(var i = 0; i < 5; i++) r += A.charAt(Math.floor(Math.random() * A.length));
    try { if(window.__SPZ_REPORTREF && window.__SPZ_REPORTREF.make) return window.__SPZ_REPORTREF.make('AL'); } catch(e){}
    return 'SPZ-AL-' + d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + '-' + r;
  }

  /* ------------------------------------------------------------------
     collectors
     ------------------------------------------------------------------ */
  function goRoute(id){ location.hash = '#/' + id; }
  function settle(el, maxMs){
    var t0 = Date.now(), last = -1, same = 0;
    return new Promise(function(res){
      (function tick(){
        var n = el ? (el.textContent || '').length : 0;
        if(n === last && n > 0) same++; else same = 0;
        last = n;
        if(same >= 2 || Date.now() - t0 > maxMs) return res();
        setTimeout(tick, 250);
      })();
    });
  }
  /* open a route and make sure it is the one on screen (a pending
     "open after sign-in" jump or a slow router can move the page back) */
  function show(id, tries){
    goRoute(id);
    return wait(450).then(function(){
      var el = secOf(id);
      var ok = el && location.hash === '#/' + id && getComputedStyle(el).display !== 'none';
      if(ok || tries <= 0) return ok ? el : null;
      return show(id, tries - 1);
    });
  }
  function grabRoute(r){
    return show(r.id, 3).then(function(el){ return el ? settle(el, 2600).then(function(){ return el; }) : null; }).then(function(el){
      if(!el) return null;
      try { window.scrollTo(0, 0); } catch(e){}
      var html = clean(el, { n:0 });
      return { title:T(r.t) || r.id, sub:'#/' + r.id, html:html };
    });
  }
  function sanitize(html){
    var d = new DOMParser().parseFromString('<div>' + html + '</div>', 'text/html');
    d.querySelectorAll('script,style,link,iframe,object,embed,button,input,select,textarea,form').forEach(function(n){ n.remove(); });
    d.querySelectorAll('img').forEach(function(n){ if(!/^(data:image\/|https:\/\/)/.test(n.getAttribute('src') || '')) n.remove(); });
    d.querySelectorAll('*').forEach(function(n){ Array.prototype.slice.call(n.attributes).forEach(function(a){ if(/^on/i.test(a.name) || (a.name === 'href' && /^\s*javascript:/i.test(a.value))) n.removeAttribute(a.name); }); });
    return d.body.firstChild ? d.body.firstChild.innerHTML : '';
  }
  function grabClass(room){
    var C = window.__SPZ_CLASSROOM_PRINT;
    if(!C) return Promise.resolve([{ title:T(B('Classroom', 'ห้องเรียน')), html:'<p>' + esc(T(B('The classroom module is not loaded.', 'ยังไม่ได้โหลดส่วนห้องเรียน'))) + '</p>' }]);
    return C.load().then(function(res){
      var R = C.rooms().filter(function(x){ return x.k === room; })[0]; if(!R) return [];
      var html = '';
      R.ids.forEach(function(n){
        var node = res.content[n.id], body = node ? T(node) : '';
        if(!body) return;
        html += '<h' + (n.lv ? 3 : 2) + ' class="spa-cls-h">' + esc(T(C.title(n.id))) + '</h' + (n.lv ? 3 : 2) + '>' + sanitize(body);
      });
      if(!html) html = '<p>' + esc(T(B('No lessons were returned (check the admin key).', 'ไม่ได้รับบทเรียน (ตรวจรหัสแอดมิน)'))) + '</p>';
      return [{ title:T(R.t), sub:T(B('every lesson, in course order', 'ทุกบท เรียงตามลำดับคอร์ส')), html:html, raw:true }];
    }).catch(function(e){ return [{ title:T(room === 'ew' ? B('Elliott Wave Classroom', 'ห้องเรียน Elliott Wave') : B('Stock Classroom', 'ห้องเรียนหุ้น')), html:'<p>' + esc(T(B('Could not load the lessons: ', 'โหลดบทเรียนไม่สำเร็จ: '))) + esc(String(e && e.message || e)) + '</p>' }]; });
  }
  function grabBrain(){
    var BP = function(){ return window.__SPZ_BRAIN_PRINT; };
    var ready = function(){ return BP() && BP().ready(); };
    var p = ready() ? Promise.resolve() : (goRoute('brain'), new Promise(function(res){ var t0 = Date.now(); (function tk(){ if(ready() || Date.now() - t0 > 45000 || cancel) return res(); setTimeout(tk, 400); })(); }));
    return p.then(function(){
      if(!ready()) return [{ title:T(B('Market Brain', 'สมองตลาด')), html:'<p>' + esc(T(B('The Market Brain did not finish loading — open it once, then try again.', 'สมองตลาดยังโหลดไม่เสร็จ ลองเปิดสมองตลาดหนึ่งครั้งแล้วกดใหม่'))) + '</p>' }];
      var doc = BP().html('all'), d = new DOMParser().parseFromString(doc, 'text/html');
      var own = Array.prototype.map.call(d.querySelectorAll('style'), function(s){ return s.textContent; }).join('\n');
      var attrs = ['data-theme', 'data-pr'].map(function(a){ var v = d.documentElement.getAttribute(a); return v ? ' ' + a + '="' + esc(v) + '"' : ''; }).join('');
      d.querySelectorAll('script,button,input,select,textarea,noscript').forEach(function(n){ n.remove(); });
      d.querySelectorAll('*').forEach(function(n){ Array.prototype.slice.call(n.attributes).forEach(function(a){ if(/^on/i.test(a.name)) n.removeAttribute(a.name); }); });
      var html = d.body.innerHTML;
      return fetch('assets/css/min/part-83.css').then(function(r){ return r.ok ? r.text() : ''; }, function(){ return ''; }).then(function(site){
        var css = scopeCss(site + '\n' + own, '.spa-brain');
        return [{ title:T(B('Market Brain — everything + all manuals', 'สมองตลาด — ทุกอย่าง + คู่มือทั้งหมด')), sub:'#/brain', html:'<div class="spa-brain"' + attrs + '>' + html + '</div>', brain:true, css:css }];
      });
    });
  }
  function grabIC(){
    return fetch('IC_License.html', { cache:'no-store' }).then(function(r){ if(!r.ok) throw new Error(r.status); return r.text(); }).then(function(t){
      var d = new DOMParser().parseFromString(t, 'text/html');
      d.querySelectorAll('script,style,link,iframe,button,input,select,textarea,nav,svg,.icp-bar').forEach(function(n){ n.remove(); });
      d.querySelectorAll('details').forEach(function(x){ x.setAttribute('open', ''); });
      d.querySelectorAll('*').forEach(function(n){ Array.prototype.slice.call(n.attributes).forEach(function(a){ if(/^on/i.test(a.name) || a.name === 'style' || a.name === 'class' || a.name === 'id') n.removeAttribute(a.name); }); });
      return [{ title:T(B('IC licence guide', 'คู่มือสอบ IC')), sub:'IC_License.html', html:d.body.innerHTML }];
    }).catch(function(e){ return [{ title:'IC_License.html', html:'<p>' + esc(String(e && e.message || e)) + '</p>' }]; });
  }

  /* ------------------------------------------------------------------
     document
     ------------------------------------------------------------------ */
  function docHTML(parts, ref){
    var loc = L() === 'th' ? 'th-TH' : 'en-GB', when = new Date().toLocaleString(loc), lg = window.__SPZ_PR_LOGO || '';
    var brainCss = parts.filter(function(p){ return p.brain && p.css; }).map(function(p){ return p.css; }).join('\n');
    var toc = parts.map(function(p, i){ return '<li><span>' + (i + 1) + '</span><b>' + esc(p.title) + '</b>' + (p.sub ? '<em>' + esc(p.sub) + '</em>' : '') + '</li>'; }).join('');
    var body = parts.map(function(p, i){
      return '<section class="spa-ch' + (p.brain ? ' spa-brainpart' : '') + '" id="ch' + (i + 1) + '"><header class="spa-chh"><span>' + (i + 1) + '</span><div><h1>' + esc(p.title) + '</h1>' + (p.sub ? '<small>' + esc(p.sub) + '</small>' : '') + '</div></header><div class="spa-chb">' + p.html + '</div></section>';
    }).join('');
    var css = '@page{size:A4;margin:14mm 13mm 16mm;}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}' +
      'html,body{margin:0;background:#fff;color:#111;font:13px/1.65 "Inter","IBM Plex Sans Thai","Noto Sans Thai",system-ui,sans-serif;}' +
      '.spa-wrap{max-width:820px;margin:0 auto;padding:24px 18px;}' +
      '.spa-cover{min-height:92vh;display:flex;flex-direction:column;justify-content:center;gap:14px;border-bottom:3px solid #111;page-break-after:always;break-after:page;}' +
      '.spa-cover img{width:64px;height:auto;} .spa-cover .spa-k{font:700 11px/1 "IBM Plex Mono",monospace;letter-spacing:.18em;text-transform:uppercase;color:#555;}' +
      '.spa-cover h1{font-size:34px;line-height:1.2;margin:0;} .spa-cover p{margin:0;color:#333;font-size:14px;}' +
      '.spa-cover table{border-collapse:collapse;margin-top:10px;font-size:12.5px;} .spa-cover td{border-top:1px solid #ddd;padding:6px 14px 6px 0;} .spa-cover td:first-child{color:#666;}' +
      '.spa-cover .spa-int{margin-top:18px;padding:10px 12px;border:1.5px solid #111;font-weight:700;font-size:12px;}' +
      '.spa-toc{page-break-after:always;break-after:page;} .spa-toc h2{font-size:20px;border-bottom:2px solid #111;padding-bottom:6px;}' +
      '.spa-toc ol{list-style:none;padding:0;margin:0;columns:2;column-gap:28px;} .spa-toc li{display:flex;gap:8px;align-items:baseline;padding:4px 0;border-bottom:1px dotted #ccc;break-inside:avoid;font-size:12.5px;}' +
      '.spa-toc li span{font:700 11px/1 "IBM Plex Mono",monospace;color:#666;min-width:22px;} .spa-toc li em{margin-left:auto;font-style:normal;font:10px/1 "IBM Plex Mono",monospace;color:#999;}' +
      '.spa-ch{page-break-before:always;break-before:page;} .spa-ch:first-of-type{page-break-before:auto;}' +
      '.spa-chh{display:flex;gap:12px;align-items:center;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:14px;}' +
      '.spa-chh > span{font:800 18px/1 "IBM Plex Mono",monospace;border:2px solid #111;border-radius:8px;padding:6px 9px;}' +
      '.spa-chh h1{margin:0;font-size:21px;line-height:1.25;} .spa-chh small{font:11px/1.2 "IBM Plex Mono",monospace;color:#777;}' +
      '.spa-chb:not(.x) h1,.spa-chb h2{font-size:17px;margin:18px 0 6px;} .spa-chb h3{font-size:15px;margin:14px 0 5px;} .spa-chb h4,.spa-chb h5,.spa-chb h6{font-size:13.5px;margin:12px 0 4px;}' +
      '.spa-chb p{margin:0 0 7px;} .spa-chb ul,.spa-chb ol{margin:4px 0 8px 20px;padding:0;} .spa-chb li{margin:2px 0;}' +
      '.spa-chb table{border-collapse:collapse;width:100%;margin:8px 0 12px;font-size:11.5px;page-break-inside:auto;} .spa-chb tr{page-break-inside:avoid;}' +
      '.spa-chb td,.spa-chb th{border:1px solid #cfcfcf;padding:4px 6px;vertical-align:top;text-align:left;} .spa-chb th{background:#f2f2f2;}' +
      '.spa-chb .spa-fig{margin:8px 0 12px;page-break-inside:avoid;break-inside:avoid;} .spa-chb .spa-fig svg,.spa-chb .spa-fig img{max-width:100%;height:auto;}' +
      '.spa-chb img{max-width:100%;height:auto;} .spa-chb div{margin:0;} .spa-chb details{margin:4px 0;} .spa-chb summary{font-weight:700;}' +
      '.spa-chb blockquote{margin:6px 0;padding:6px 10px;border-left:3px solid #999;color:#333;}' +
      '.spa-cls-h{border-top:1px solid #ddd;padding-top:10px;} ' +
      '.spa-brain{background:transparent!important;margin:0!important;} .spa-brain .doc{width:auto!important;padding:0!important;margin:0!important;} .spa-brainpart .spa-chb{font-size:12px;} .spa-brainpart .spa-chb .pg{box-shadow:none!important;margin:0 0 12px!important;padding:0!important;page-break-after:auto!important;}' +
      '.spa-foot{margin-top:30px;border-top:1px solid #ccc;padding-top:8px;font:10px/1.4 "IBM Plex Mono",monospace;color:#777;}' +
      '@media screen{body{background:#e9ebf2;} .spa-wrap{background:#fff;box-shadow:0 10px 40px rgba(0,0,0,.12);margin:24px auto;padding:40px 46px;}}';
    var fonts = Array.prototype.map.call(document.querySelectorAll('link[href*="fonts.googleapis"]'), function(l){ return l.outerHTML; }).join('');
    return '<!doctype html><html lang="' + L() + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(ref) + ' · SPACEZ TERMINAL</title>' + fonts +
      (brainCss ? '<style>' + brainCss + '</style>' : '') + '<style>' + css + '</style></head><body><div class="spa-wrap">' +
      '<div class="spa-cover">' + (lg ? '<img src="' + lg + '" alt="">' : '') + '<div class="spa-k">SPACEZ TERMINAL</div><h1>' + esc(T(B('The whole site in one document', 'เอกสารรวมทั้งเว็บ'))) + '</h1>' +
        '<p>' + esc(T(B('Pages, classrooms, the Market Brain and guides, as they looked when this file was made.', 'หน้าเว็บ ห้องเรียน สมองตลาด และคู่มือ ตามที่แสดงอยู่ตอนสร้างไฟล์นี้'))) + '</p>' +
        '<table><tr><td>' + esc(T(B('Reference', 'รหัสเอกสาร'))) + '</td><td><b>' + esc(ref) + '</b></td></tr><tr><td>' + esc(T(B('Made', 'สร้างเมื่อ'))) + '</td><td>' + esc(when) + '</td></tr><tr><td>' + esc(T(B('Sections', 'จำนวนส่วน'))) + '</td><td>' + parts.length + '</td></tr><tr><td>Web</td><td>terminal.spacezblack.workers.dev</td></tr></table>' +
        '<div class="spa-int">' + esc(T(B('INTERNAL DOCUMENT — ADMIN ONLY. Educational material, not investment advice. Do not share publicly.', 'เอกสารภายใน — เฉพาะแอดมิน · สื่อเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุน · ห้ามเผยแพร่สาธารณะ'))) + '</div></div>' +
      '<div class="spa-toc"><h2>' + esc(T(B('Contents', 'สารบัญ'))) + '</h2><ol>' + toc + '</ol></div>' + body +
      '<div class="spa-foot">' + esc(ref) + ' · SPACEZ TERMINAL · ' + esc(when) + ' · ' + esc(T(B('internal document — admin only', 'เอกสารภายใน — เฉพาะแอดมิน'))) + '</div></div></body></html>';
  }
  function download(name, text, type){
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type:type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 3000);
  }
  function printDoc(html){
    var old = document.getElementById('paPrintFrame'); if(old) old.remove();
    var f = document.createElement('iframe'); f.id = 'paPrintFrame';
    f.style.cssText = 'position:fixed;right:0;bottom:0;width:820px;height:600px;opacity:0;pointer-events:none;border:0;z-index:-1;';
    document.body.appendChild(f);
    var d = f.contentDocument; d.open(); d.write(html); d.close();
    var go = function(){ try { f.contentWindow.focus(); f.contentWindow.print(); } catch(e){} };
    f.onload = function(){ setTimeout(go, 900); };
    setTimeout(function(){ if(d.readyState === 'complete') go(); }, 2500);
  }

  function run(mode){
    if(busy) return;
    if(!isAdmin()){ paint(); return; }
    ensureSel();
    var rs = routes().filter(function(r){ return sel['r:' + r.id]; });
    var jobs = [];
    if(sel['cls-stk']) jobs.push({ t:B('Stock Classroom', 'ห้องเรียนหุ้น'), f:function(){ return grabClass('stk'); } });
    if(sel['cls-ew']) jobs.push({ t:B('Elliott Wave Classroom', 'ห้องเรียน Elliott Wave'), f:function(){ return grabClass('ew'); } });
    rs.forEach(function(r){ jobs.push({ t:r.t, f:function(){ return grabRoute(r).then(function(x){ return x ? [x] : []; }); } }); });
    if(sel['brain']) jobs.push({ t:B('Market Brain', 'สมองตลาด'), f:grabBrain });
    if(sel['ic']) jobs.push({ t:B('IC guide', 'คู่มือ IC'), f:grabIC });
    if(!jobs.length){ setMsg(T(B('Nothing selected.', 'ยังไม่ได้เลือกอะไรเลย')), 0); return; }
    busy = true; cancel = false;
    var parts = [], i = 0, ref = refCode(), back = location.hash || '#/home';
    sec.classList.add('pa-busy');
    (function next(){
      if(cancel || i >= jobs.length){ finish(); return; }
      var j = jobs[i];
      setMsg(T(B('Collecting ', 'กำลังเก็บ ')) + (i + 1) + '/' + jobs.length + ' · ' + T(j.t), i / jobs.length * 100);
      Promise.resolve().then(j.f).then(function(list){ (list || []).forEach(function(x){ if(x && x.html && x.html.replace(/<[^>]+>/g, '').trim().length > 20) parts.push(x); }); }, function(){}).then(function(){ i++; next(); });
    })();
    function finish(){
      busy = false;
      location.hash = '#/printall';
      sec.classList.remove('pa-busy');
      if(!isAdmin()){ paint(); return; }
      if(!parts.length){ setMsg(T(B('Nothing to print.', 'ไม่มีเนื้อหาให้พิมพ์')), 0); return; }
      var html = docHTML(parts, ref);
      lastDoc = html;
      if(mode === 'html'){ download(ref + '.html', html, 'text/html;charset=utf-8'); }
      else if(mode === 'md'){
        var d = new DOMParser().parseFromString(html, 'text/html');
        d.querySelectorAll('.cover table,.toc').forEach(function(n){ n.remove(); });
        var md = '# SPACEZ TERMINAL — ' + T(B('the whole site in one document', 'เอกสารรวมทั้งเว็บ')) + '\n\n' + ref + ' · ' + new Date().toLocaleString(L() === 'th' ? 'th-TH' : 'en-GB') + '\n\n' + html2md(d.body);
        download(ref + '.md', md, 'text/markdown;charset=utf-8');
      }
      else printDoc(html);
      setMsg((cancel ? T(B('Stopped — made the file from what was collected. ', 'หยุดแล้ว — สร้างไฟล์จากส่วนที่เก็บได้ ')) : '') + T(B('Done: ', 'เสร็จแล้ว: ')) + parts.length + T(B(' sections · ', ' ส่วน · ')) + ref, 100);
    }
  }

  /* ------------------------------------------------------------------
     mount
     ------------------------------------------------------------------ */
  function build(){
    if(!window.__spzAddRoute) return false;
    if(document.getElementById('printall')) return true;
    sec = document.createElement('section'); sec.id = 'printall'; sec.className = 'pa-sec'; sec.setAttribute('data-route', 'printall');
    var foot = document.querySelector('body > footer'); if(foot) document.body.insertBefore(sec, foot); else document.body.appendChild(sec);
    window.__spzAddRoute({ id:'printall', after:'printreport', t:B('Print the whole site', 'พิมพ์ทั้งเว็บ'), d:B('Admin only: every page, both classrooms, the Market Brain and guides in one document — print, PDF, .html or .md text.', 'เฉพาะแอดมิน: ทุกหน้า ห้องเรียนทั้งสอง สมองตลาด และคู่มือ รวมเป็นเอกสารเดียว พิมพ์ PDF .html หรือข้อความ .md') });
    sec.addEventListener('change', function(e){
      var c = e.target.closest('[data-pa-k]'); if(!c) return;
      sel[c.getAttribute('data-pa-k')] = c.checked ? 1 : 0; saveSel();
      c.closest('label').classList.toggle('on', c.checked);
      var cnt = sec.querySelector('.pa-ch span'); if(cnt){ var n = 0, a = 0; sec.querySelectorAll('[data-pa-k]').forEach(function(x){ a++; if(x.checked) n++; }); cnt.textContent = n + ' / ' + a; }
    });
    sec.addEventListener('input', function(e){
      if(!e.target.classList.contains('pa-filter')) return;
      var q = e.target.value.trim().toLowerCase();
      sec.querySelectorAll('.pa-rt label').forEach(function(l){ l.style.display = !q || l.getAttribute('data-pa-name').indexOf(q) >= 0 ? '' : 'none'; });
    });
    sec.addEventListener('click', function(e){
      var a = e.target.closest('[data-pa-all]');
      if(a){ var on = a.getAttribute('data-pa-all') === '1'; sec.querySelectorAll('[data-pa-k]').forEach(function(x){ if(x.closest('label').style.display === 'none') return; sel[x.getAttribute('data-pa-k')] = on ? 1 : 0; }); saveSel(); paint(); return; }
      var r = e.target.closest('[data-pa-run]'); if(r){ run(r.getAttribute('data-pa-run')); return; }
      if(e.target.closest('[data-pa-stop]')){ cancel = true; setMsg(T(B('Stopping…', 'กำลังหยุด…'))); }
    });
    paint();
    document.addEventListener('spz:tier', function(){ if(!busy) paint(); });
    new MutationObserver(function(){ if(!busy) paint(); }).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] });
    return true;
  }
  var n = 0, iv = setInterval(function(){ if(build() || ++n > 80) clearInterval(iv); }, 250);
})();
