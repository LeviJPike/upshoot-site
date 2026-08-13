/* ==========================================================================
   Upshoot Collective — "The Stem"
   A single line of growth is drawn down the page as you scroll, sprouting a
   leaf at every section anchor. No dependencies, no build step.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- utils */
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function docTop(el) { return el.getBoundingClientRect().top + window.pageYOffset; }
  function debounce(fn, ms) {
    var t; return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  /* =========================================================== NAV STATE */
  var nav = document.querySelector('.site-nav');
  function navState() {
    if (nav) nav.classList.toggle('stuck', window.pageYOffset > 8);
  }

  /* ============================================================= THE STEM */
  // The leaf from the logo mark, re-origined so it grows from (0,0)
  // up and to the right. Bounding box: x 0→274, y -244→0.
  var LEAF = 'M0,0 C8,-126 118,-232 274,-244 C266,-104 158,6 0,0 Z';
  var LEAF_W = 274;

  var svg = document.querySelector('.stem');
  var stem = {
    line: null, ghost: null, len: 0,
    top: 0, bottom: 0, span: 1,
    leaves: []   // { y, els:[…] }
  };

  var NS = 'http://www.w3.org/2000/svg';
  function make(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function buildStem() {
    if (!svg) return;

    var startEl = document.querySelector('[data-stem-start]');
    var endEl   = document.querySelector('[data-stem-end]');
    var anchors = [].slice.call(document.querySelectorAll('[data-stem]'));
    if (!startEl || !endEl) return;

    // Size the canvas to the whole document
    var pageH = Math.max(
      document.documentElement.scrollHeight, document.body.scrollHeight
    );
    var pageW = document.documentElement.clientWidth;
    svg.setAttribute('viewBox', '0 0 ' + pageW + ' ' + pageH);
    svg.setAttribute('width', pageW);
    svg.setAttribute('height', pageH);
    svg.style.height = pageH + 'px';
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var wide = window.innerWidth > 900;

    // Where the stem lives, horizontally: just left of the content column.
    var probe = document.querySelector('[data-stem-probe]');
    var contentLeft = probe
      ? probe.getBoundingClientRect().left + window.pageXOffset
      : 60;
    var offset = wide ? 62 : 22;
    var cx = Math.max(12, contentLeft - offset);

    var amp    = wide ? 15 : 6;     // how much the stem sways
    var period = wide ? 780 : 620;  // how often
    var leafSize = wide ? 38 : 21;

    var y0 = docTop(startEl) + (wide ? 30 : 20);
    // Stop short of the closing section so the bud sits on paper with air
    // around it, rather than colliding with the dark CTA or the sticky nav.
    var y1 = docTop(endEl) - (wide ? 74 : 52);
    if (y1 - y0 < 200) return;

    function xAt(y) {
      return cx + amp * Math.sin(((y - y0) / period) * Math.PI * 2);
    }

    // Build the path
    var d = 'M' + xAt(y0).toFixed(1) + ',' + y0.toFixed(1);
    for (var y = y0 + 10; y < y1; y += 10) {
      d += 'L' + xAt(y).toFixed(1) + ',' + y.toFixed(1);
    }
    d += 'L' + xAt(y1).toFixed(1) + ',' + y1.toFixed(1);

    stem.ghost = make('path', { class: 'stem-ghost', d: d });
    stem.line  = make('path', { class: 'stem-line',  d: d });
    svg.appendChild(stem.ghost);
    svg.appendChild(stem.line);

    stem.len = stem.line.getTotalLength();
    stem.line.style.strokeDasharray = stem.len;
    stem.line.style.strokeDashoffset = reduced ? 0 : stem.len;
    stem.top = y0; stem.bottom = y1; stem.span = y1 - y0;

    // Sprout a leaf + node at each section anchor
    stem.leaves = [];
    anchors.forEach(function (el, i) {
      var ly = docTop(el) + (wide ? 34 : 22);
      if (ly < y0 + 40 || ly > y1 - 10) return;
      var lx = xAt(ly);
      var right = i % 2 === 0;              // alternate sides
      var s = leafSize / LEAF_W;
      var rot = right ? -18 : -62;          // both angle upward
      var g = make('g', {
        transform: 'translate(' + lx.toFixed(1) + ',' + ly.toFixed(1) + ') ' +
                   'rotate(' + rot + ') ' +
                   'scale(' + (right ? s : -s).toFixed(4) + ',' + s.toFixed(4) + ')'
      });
      var leaf = make('path', { class: 'stem-leaf', d: LEAF });
      g.appendChild(leaf);
      var node = make('circle', {
        class: 'stem-node', cx: lx.toFixed(1), cy: ly.toFixed(1), r: wide ? 5 : 3.6
      });
      svg.appendChild(g);
      svg.appendChild(node);
      stem.leaves.push({ y: ly, els: [leaf, node] });
    });

    // The tip: a small bud where the stem finishes
    var tx = xAt(y1), ts = (wide ? 30 : 18) / LEAF_W;
    var tipL = make('g', {
      transform: 'translate(' + tx.toFixed(1) + ',' + y1.toFixed(1) + ') rotate(-72) ' +
                 'scale(' + ts.toFixed(4) + ',' + ts.toFixed(4) + ')'
    });
    tipL.appendChild(make('path', { class: 'stem-tip', d: LEAF }));
    var tipR = make('g', {
      transform: 'translate(' + tx.toFixed(1) + ',' + y1.toFixed(1) + ') rotate(-108) ' +
                 'scale(' + (-ts).toFixed(4) + ',' + ts.toFixed(4) + ')'
    });
    tipR.appendChild(make('path', { class: 'stem-tip', d: LEAF }));
    svg.appendChild(tipL); svg.appendChild(tipR);
    stem.tips = [tipL.firstChild, tipR.firstChild];

    if (reduced) {
      stem.leaves.forEach(function (l) {
        l.els.forEach(function (e) { e.classList.add('sprouted'); });
      });
      stem.tips.forEach(function (t) { t.classList.add('lit'); });
    }
    drawStem();
  }

  function drawStem() {
    if (!stem.line || reduced) return;
    var readLine = window.pageYOffset + window.innerHeight * 0.62;
    var p = clamp((readLine - stem.top) / stem.span, 0, 1);
    stem.line.style.strokeDashoffset = (stem.len * (1 - p)).toFixed(1);

    for (var i = 0; i < stem.leaves.length; i++) {
      var l = stem.leaves[i];
      if (readLine >= l.y && !l.done) {
        l.done = true;
        l.els.forEach(function (e) { e.classList.add('sprouted'); });
      }
    }
    if (p > 0.985 && stem.tips) {
      stem.tips.forEach(function (t) { t.classList.add('lit'); });
    }
  }

  /* =========================================================== COUNT UP */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var pre = el.dataset.pre || '', post = el.dataset.post || '';
    var dur = 1250, t0 = null;
    var dec = (el.dataset.count.split('.')[1] || '').length;

    if (reduced) { el.textContent = pre + target.toFixed(dec) + post; return; }

    function frame(ts) {
      if (!t0) t0 = ts;
      var p = clamp((ts - t0) / dur, 0, 1);
      var e = 1 - Math.pow(1 - p, 3);            // ease-out cubic
      el.textContent = pre + (target * e).toFixed(dec) + post;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ========================================================== OBSERVERS */
  var io = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add('in');
          var n = en.target.matches('[data-count]')
            ? en.target
            : en.target.querySelector('[data-count]:not(.counted)');
          if (n && !n.classList.contains('counted')) {
            n.classList.add('counted'); countUp(n);
          }
          io.unobserve(en.target);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 })
    : null;

  function observe() {
    var targets = document.querySelectorAll('.reveal, [data-count], .rise-step');
    if (!io) {
      [].forEach.call(targets, function (t) {
        t.classList.add('in');
        if (t.matches('[data-count]')) {
          t.textContent = (t.dataset.pre || '') + t.dataset.count + (t.dataset.post || '');
        }
      });
      return;
    }
    [].forEach.call(targets, function (t) { io.observe(t); });
  }

  /* ====================================================== CLIENT LOGOS */
  // Show the logo image if it actually loads; otherwise fall back to the
  // company name in type. Means no broken images before the files exist.
  function clientLogos() {
    [].forEach.call(document.querySelectorAll('.client img'), function (img) {
      function useText() { if (img.parentNode) img.parentNode.removeChild(img); }
      function useImage() {
        var name = img.parentNode && img.parentNode.querySelector('.name');
        if (name) name.style.display = 'none';
      }
      if (img.complete) { img.naturalWidth > 0 ? useImage() : useText(); }
      else {
        img.addEventListener('load', useImage);
        img.addEventListener('error', useText);
      }
    });
  }

  /* ============================================================== SCROLL */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { drawStem(); navState(); ticking = false; });
  }

  /* ================================================================ INIT */
  function init() {
    clientLogos();
    observe();
    navState();
    buildStem();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', debounce(buildStem, 180));
    // Re-measure once webfonts have settled — they change section heights.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { setTimeout(buildStem, 60); });
    }
    setTimeout(buildStem, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
