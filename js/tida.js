/* TIDA — site script (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Split headings into masked words ---------- */
  $$('[data-split]').forEach(function (el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    el.textContent = '';
    text.split(' ').forEach(function (word, i, all) {
      var w = document.createElement('span');
      w.className = 'w';
      var inner = document.createElement('span');
      inner.textContent = word;
      inner.style.setProperty('--i', i);
      w.appendChild(inner);
      el.appendChild(w);
      if (i < all.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var targets = $$('[data-split], [data-reveal], [data-wipe]');
  var hero = $('.hero');
  function show(el) { el.classList.add('is-in'); }

  if (!('IntersectionObserver' in window) || reduce) {
    targets.forEach(show);
    if (hero) show(hero);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          show(e.target.__reveal || e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) {
      if (hero && hero.contains(el)) return;      // hero is sequenced on load
      if (el.hasAttribute('data-wipe')) {         // a fully clipped element can't intersect; watch its wrapper
        el.parentNode.__reveal = el;
        io.observe(el.parentNode);
      } else {
        io.observe(el);
      }
    });
    if (hero) {
      var start = function () {
        // stagger hero pieces in reading order
        var base = 250;
        $$('[data-split]', hero).forEach(function (el, i) {
          el.style.setProperty('--base', (base + i * 380) + 'ms');
        });
        $$('[data-reveal]', hero).forEach(function (el, i) {
          el.style.setProperty('--d', (1.0 + i * 0.12) + 's');
        });
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            show(hero);
            $$('[data-split], [data-reveal]', hero).forEach(show);
          });
        });
      };
      if (document.fonts && document.fonts.ready) { document.fonts.ready.then(start); } else { start(); }
    }
  }
  // failsafe: never leave content hidden
  setTimeout(function () { targets.forEach(function (el) { if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight * 1.5) show(el); }); }, 3500);

  /* ---------- Nav ---------- */
  var nav = $('.nav');
  var bar = $('.progress');
  var goTop = $('.go-top');
  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('is-scrolled', y > 40);
    if (goTop) goTop.classList.toggle('show', y > 520);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (goTop) goTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  var burger = $('.burger');
  var wrap = $('.menu-wrap');
  if (burger && wrap) {
    var setMenu = function (open) {
      wrap.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    burger.addEventListener('click', function () { setMenu(!wrap.classList.contains('open')); });
    $$('.sub-toggle').forEach(function (t) {
      t.addEventListener('click', function () {
        var li = t.parentNode;
        var open = li.classList.toggle('open');
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    $$('.menu a', wrap).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1279) setMenu(false); });
  }

  /* ---------- Lightbox ---------- */
  var lb, lbImg, lbCap, lbList = [], lbIndex = 0, lastFocus;
  function buildLightbox() {
    if (lb) return;
    lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML =
      '<button type="button" class="lb-close" aria-label="Close"><i class="icofont-close"></i></button>' +
      '<button type="button" class="lb-prev" aria-label="Previous image"><i class="icofont-simple-left"></i></button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-next" aria-label="Next image"><i class="icofont-simple-right"></i></button>';
    document.body.appendChild(lb);
    lbImg = $('img', lb); lbCap = $('figcaption', lb);
    $('.lb-close', lb).addEventListener('click', closeLb);
    $('.lb-prev', lb).addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    $('.lb-next', lb).addEventListener('click', function (e) { e.stopPropagation(); step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') closeLb(); });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      sx = null;
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    });
  }
  function paint() {
    var img = lbList[lbIndex];
    var clone = lbImg.cloneNode(false);      // re-trigger the entrance animation
    clone.src = img.currentSrc || img.src;
    clone.alt = img.alt || '';
    lbImg.parentNode.replaceChild(clone, lbImg);
    lbImg = clone;
    lbCap.textContent = (lbIndex + 1) + ' / ' + lbList.length;
  }
  function openLb(list, i) {
    buildLightbox();
    lastFocus = document.activeElement;
    lbList = list; lbIndex = i;
    paint();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('.lb-close', lb).focus();
  }
  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(d) { lbIndex = (lbIndex + d + lbList.length) % lbList.length; paint(); }

  /* ---------- Galleries (lightbox + optional pagination) ---------- */
  $$('.js-gallery').forEach(function (g) {
    var items = $$('.g-item', g);
    var imgs = items.map(function (b) { return $('img', b); });
    items.forEach(function (b, i) {
      b.addEventListener('click', function () { openLb(imgs, i); });
    });

    var per = parseInt(g.getAttribute('data-per-page'), 10);
    if (!per || items.length <= per) return;

    var pages = Math.ceil(items.length / per);
    var current = 1;
    var pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', 'Gallery pages');
    var list = document.createElement('ul');
    var status = document.createElement('p');
    status.className = 'status';
    status.setAttribute('aria-live', 'polite');
    pager.appendChild(list); pager.appendChild(status);
    g.appendChild(pager);

    function btn(label, aria, handler) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = label; b.setAttribute('aria-label', aria);
      b.addEventListener('click', handler);
      li.appendChild(b); list.appendChild(li);
      return b;
    }

    var prev = btn('Previous', 'Previous page', function () { go(current - 1, true); });
    var nums = [];
    for (var p = 1; p <= pages; p++) {
      (function (n) { nums.push(btn(String(n), 'Page ' + n, function () { go(n, true); })); })(p);
    }
    var next = btn('Next', 'Next page', function () { go(current + 1, true); });

    function go(n, scroll) {
      if (n < 1 || n > pages) return;
      current = n;
      var from = (n - 1) * per, to = Math.min(from + per, items.length);
      items.forEach(function (it, i) {
        var visible = i >= from && i < to;
        it.hidden = !visible;
        it.classList.remove('pop');
        if (visible) {
          it.style.setProperty('--n', i - from);
          void it.offsetWidth;
          it.classList.add('pop');
        }
      });
      nums.forEach(function (b, i) {
        if (i + 1 === n) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      });
      prev.disabled = n === 1;
      next.disabled = n === pages;
      status.textContent = 'Showing ' + (from + 1) + '\u2013' + to + ' of ' + items.length;
      if (scroll) {
        var grid = $('.g-grid', g);
        var top = grid.getBoundingClientRect().top + window.pageYOffset - 130;
        window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    go(1, false);
  });

  /* ---------- Team profile dialogs ---------- */
  $$('[data-modal]').forEach(function (b) {
    var d = document.getElementById(b.getAttribute('data-modal'));
    if (!d) return;
    b.addEventListener('click', function () {
      if (d.showModal) d.showModal(); else d.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
    });
  });
  $$('dialog.modal').forEach(function (d) {
    var close = function () { if (d.close) d.close(); else d.removeAttribute('open'); };
    $('.modal__close', d).addEventListener('click', close);
    d.addEventListener('click', function (e) { if (e.target === d) close(); });
    d.addEventListener('close', function () { document.body.style.overflow = ''; });
  });
})();
