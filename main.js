/* ══════════════════════════════════════════════
   GENERATION GYM – main.js
   Scroll effects · Stats counter · Nav · Gallery
   ══════════════════════════════════════════════ */

'use strict';

/* ─── Helpers ──────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ─── 1. Navbar: scroll-aware ───────────────── */
(function initNavbar () {
  const navbar    = qs('#navbar');
  const toggle    = qs('#navToggle');
  const links     = qs('#navLinks');
  const spans     = qsa('span', toggle);

  function setScrolled () {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }

  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });

  /* Hamburger */
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    spans[0].style.transform = open ? 'translateY(7px) rotate(45deg)' : '';
    spans[1].style.opacity   = open ? '0' : '1';
    spans[2].style.transform = open ? 'translateY(-7px) rotate(-45deg)' : '';
  });

  /* Close on nav link click */
  qsa('a', links).forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '1';
      spans[2].style.transform = '';
    });
  });

  /* Close when clicking outside */
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      links.classList.remove('open');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '1';
      spans[2].style.transform = '';
    }
  });
})();

/* ─── 2. Hero parallax ──────────────────────── */
(function initParallax () {
  const bg = qs('#heroBg');
  if (!bg) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        bg.style.transform = `scale(1.1) translateY(${y * 0.28}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ─── 3. Scroll-reveal (Intersection Observer) */
(function initReveal () {
  const els = qsa('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ─── 4. Animated counters ──────────────────── */
(function initCounters () {
  const nums = qsa('.stat-num[data-target]');
  if (!nums.length) return;

  function animateCount (el, target, duration) {
    const start = performance.now();
    const startVal = 0;

    function step (now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(startVal + eased * (target - startVal));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const dur    = target > 50 ? 1800 : 1200;
        animateCount(el, target, dur);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  nums.forEach(el => observer.observe(el));
})();

/* ─── 5. Rating bars animate-in ─────────────── */
(function initRatingBars () {
  const fills = qsa('.rbar-fill');
  if (!fills.length) return;

  /* Store target widths & reset to 0 */
  fills.forEach(f => {
    f.dataset.w = f.style.width || '0%';
    f.style.width = '0%';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        qsa('.rbar-fill', entry.target.closest('.rating-summary')).forEach(f => {
          setTimeout(() => { f.style.width = f.dataset.w; }, 200);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  const summary = qs('.rating-summary');
  if (summary) observer.observe(summary);
})();

/* ─── 6. Active nav link on scroll ──────────── */
(function initActiveLink () {
  const sections = qsa('section[id]');
  const links    = qsa('.nav-links a[href^="#"]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');
      const link   = links.find(l => l.getAttribute('href') === `#${id}`);

      if (link) {
        link.classList.toggle('active-link',
          scrollY >= top && scrollY < top + height
        );
      }
    });
  }, { passive: true });
})();

/* ─── 7. Smooth scroll for all anchor links ─── */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = document.querySelector(a.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  const offset = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--nav-h')) || 72;
  window.scrollTo({
    top: target.offsetTop - offset,
    behavior: 'smooth'
  });
});

/* ─── 8. Ticker duplicate for seamless loop ─── */
(function initTicker () {
  const track = qs('.ticker-track');
  if (!track) return;
  const clone = track.cloneNode(true);
  track.parentElement.appendChild(clone);
})();

/* ─── 9. Fan Gallery ─────────────────────────── */
(function initFanGallery () {
  const track = qs('#fanTrack');
  const dotsWrap = qs('#fanDots');
  if (!track) return;

  const cards = qsa('.fan-card', track);
  const dots  = dotsWrap ? qsa('.fan-dot', dotsWrap) : [];
  const total = cards.length;
  let current = Math.floor(total / 2); // start at center
  let autoTimer;

  const positions = ['fc-left2', 'fc-left1', 'fc-active', 'fc-right1', 'fc-right2'];

  function render () {
    cards.forEach((card, i) => {
      card.classList.remove('fc-left2','fc-left1','fc-active','fc-right1','fc-right2','fc-hidden');
      const offset = i - current;
      if (offset === -2) card.classList.add('fc-left2');
      else if (offset === -1) card.classList.add('fc-left1');
      else if (offset === 0)  card.classList.add('fc-active');
      else if (offset === 1)  card.classList.add('fc-right1');
      else if (offset === 2)  card.classList.add('fc-right2');
      else                    card.classList.add('fc-hidden');
    });
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo (idx) {
    current = Math.max(0, Math.min(total - 1, idx));
    render();
  }

  function next () { goTo(current < total - 1 ? current + 1 : 0); }
  function prev () { goTo(current > 0 ? current - 1 : total - 1); }

  function startAuto () {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 3200);
  }

  function resetAuto () { startAuto(); }

  /* Clicks on cards */
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      goTo(i);
      resetAuto();
    });
  });

  /* Dot clicks */
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); resetAuto(); });
  });

  /* Touch/drag swipe */
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetAuto(); }
  }, { passive: true });

  /* Mouse drag */
  let mouseDown = false, startMX = 0;
  track.addEventListener('mousedown', e => { mouseDown = true; startMX = e.clientX; });
  track.addEventListener('mouseup', e => {
    if (!mouseDown) return;
    mouseDown = false;
    const dx = e.clientX - startMX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetAuto(); }
  });
  track.addEventListener('mouseleave', () => { mouseDown = false; });

  /* Init */
  current = 0;
  render();
  startAuto();
})();
