/* ============================================================
   THYNKS — Interaction Layer
   Everything degrades gracefully: no JS, no GSAP, no problem.
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && typeof window.ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------- Preloader ---------- */
  const preloader = $('.preloader');
  function killPreloader() {
    if (!preloader) return;
    preloader.classList.add('done');
    setTimeout(() => preloader.remove(), 1100);
  }
  if (preloader) {
    window.addEventListener('load', () => setTimeout(killPreloader, 650));
    setTimeout(killPreloader, 3200); // hard ceiling
  }

  /* ---------- Custom cursor ---------- */
  const dot = $('.cursor-dot');
  const glow = $('.cursor-glow');
  if (dot && glow && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mx = -100, my = -100, gx = -100, gy = -100;
    document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      gx += (mx - gx) * 0.16;
      gy += (my - gy) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    $$('a, button, .cap-card, .work-panel, .menu-link, .pf-item').forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ---------- Nav: shrink + hide on scroll down ---------- */
  const nav = $('.nav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (nav) {
      nav.classList.toggle('scrolled', y > 60);
      if (y > 400 && y > lastY) nav.classList.add('hidden');
      else nav.classList.remove('hidden');
    }
    lastY = y;
    const p = $('.progress');
    if (p) {
      const max = document.documentElement.scrollHeight - innerHeight;
      p.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    }
  }, { passive: true });

  /* ---------- Full-screen menu ---------- */
  const burger = $('.nav-burger');
  const mobileMenu = $('.mobile-menu');
  function closeMenu() {
    if (!burger || !mobileMenu) return;
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // close on link click — but NOT the Services expander (it toggles the submenu instead)
    $$('a', mobileMenu).forEach((a) => {
      if (a.classList.contains('js-expand')) return;
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---------- Services submenu expander ---------- */
  $$('.menu-group .js-expand').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.closest('.menu-group').classList.toggle('expanded');
    });
  });

  /* ---------- Theme: user override + scroll-driven sections ---------- */
  const THEME_KEY = 'thynks-theme';
  const root = document.body;
  let userTheme = null;
  try { userTheme = localStorage.getItem(THEME_KEY); } catch (e) {}

  function applyUserTheme(t) {
    userTheme = t;
    if (t) {
      root.dataset.userTheme = t;
      root.dataset.theme = t;
    } else {
      delete root.dataset.userTheme;
    }
    try { t ? localStorage.setItem(THEME_KEY, t) : localStorage.removeItem(THEME_KEY); } catch (e) {}
  }
  if (userTheme) applyUserTheme(userTheme);

  $$('.theme-toggle').forEach((tg) => {
    tg.addEventListener('click', () => {
      const next = (root.dataset.theme === 'light') ? 'dark' : 'light';
      applyUserTheme(next);
    });
  });

  // Scroll-driven section theme — only when user hasn't pinned a theme
  const themed = $$('[data-section-theme]');
  if (themed.length) {
    const io = new IntersectionObserver((entries) => {
      if (userTheme) return; // respect user override
      entries.forEach((en) => {
        if (en.isIntersecting) {
          root.dataset.theme = en.target.dataset.sectionTheme;
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    themed.forEach((s) => io.observe(s));
  }

  /* ---------- Marquee: duplicate track for seamless loop ---------- */
  $$('.marquee-track').forEach((track) => {
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Card spotlight ---------- */
  $$('.cap-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Magnetic buttons ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    $$('.btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ---------- Counters ---------- */
  function animateCount(el) {
    const raw = el.dataset.count || '0';
    const target = parseFloat(raw);
    const decimals = (raw.split('.')[1] || '').length;
    const dur = 1600;
    const t0 = performance.now();
    (function tick(t) {
      const k = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      const val = target * eased;
      el.textContent = decimals
        ? val.toFixed(decimals)
        : Math.round(val).toLocaleString();
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }
  const counters = $$('[data-count]');
  if (counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- GSAP reveals ---------- */
  if (hasGSAP && window.ScrollTrigger && !reduceMotion) {

    // Split headlines into masked lines
    $$('[data-split]').forEach((el) => {
      const lines = el.innerHTML.split('<br>');
      el.innerHTML = lines
        .map((l) => `<span class="split-line"><span>${l.trim()}</span></span>`)
        .join('');
      gsap.from($$('.split-line > span', el), {
        yPercent: 110,
        duration: 1.1,
        ease: 'power4.out',
        stagger: 0.09,
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    // Generic reveals
    $$('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 44,
        autoAlpha: 0,
        duration: 1,
        ease: 'power3.out',
        delay: parseFloat(el.dataset.revealDelay || 0),
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Staggered groups
    $$('[data-reveal-group]').forEach((group) => {
      gsap.from(group.children, {
        y: 50,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: group, start: 'top 85%' }
      });
    });

    // Sticky expertise — swap the bulb-stage index/keyword per active tile
    (function () {
      const idxEl = $('[data-xp-idx]');
      const kwEl = $('[data-xp-kw]');
      const tiles = $$('[data-xp-tile]');
      if (!idxEl || !kwEl || !tiles.length) return;
      const setActive = (t) => {
        const idx = t.dataset.idx, kw = t.dataset.kw;
        if (idxEl.textContent === idx) return;
        idxEl.textContent = idx;
        kwEl.style.opacity = 0;
        kwEl.style.transform = 'translateX(-50%) translateY(6px)';
        setTimeout(() => {
          kwEl.textContent = kw;
          kwEl.style.opacity = 1;
          kwEl.style.transform = 'translateX(-50%) translateY(0)';
        }, 180);
      };
      tiles.forEach((t) => {
        ScrollTrigger.create({
          trigger: t,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => { if (self.isActive) setActive(t); }
        });
      });
    })();

    // Horizontal work scroll
    const track = $('.work-track');
    const wrap = $('.work-wrap');
    if (track && wrap) {
      const getDist = () => track.scrollWidth - window.innerWidth;
      gsap.to(track, {
        x: () => -getDist(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top top',
          end: () => '+=' + getDist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true
        }
      });
    }

    // Hero parallax drift on watermark
    $$('.watermark').forEach((w) => {
      gsap.to(w, {
        xPercent: -8,
        ease: 'none',
        scrollTrigger: { trigger: w.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1 }
      });
    });
  }

  /* ---------- Circuit canvas (hero) ---------- */
  const canvas = $('#circuit');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let W, H, dpr;
    const runners = [];
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function spawn() {
      const edge = Math.floor(Math.random() * 4);
      let x, y, dir;
      if (edge === 0) { x = 0; y = Math.random() * H; dir = [1, 0]; }
      else if (edge === 1) { x = W; y = Math.random() * H; dir = [-1, 0]; }
      else if (edge === 2) { x = Math.random() * W; y = 0; dir = [0, 1]; }
      else { x = Math.random() * W; y = H; dir = [0, -1]; }
      runners.push({
        x, y, dir,
        speed: 1.2 + Math.random() * 2.2,
        life: 240 + Math.random() * 320,
        trail: [],
        glow: Math.random() > 0.55
      });
    }
    for (let i = 0; i < 14; i++) spawn();

    let frame = 0;
    (function draw() {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // faint grid dots
      ctx.fillStyle = 'rgba(214,180,49,0.05)';
      const gap = 48;
      for (let gx = gap / 2; gx < W; gx += gap) {
        for (let gy = gap / 2; gy < H; gy += gap) {
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
      }

      for (let i = runners.length - 1; i >= 0; i--) {
        const r = runners[i];
        r.x += r.dir[0] * r.speed;
        r.y += r.dir[1] * r.speed;
        r.life--;
        r.trail.push([r.x, r.y]);
        if (r.trail.length > 90) r.trail.shift();

        // right-angle turns, circuit style
        if (Math.random() < 0.012) {
          const perp = r.dir[0] !== 0 ? [[0, 1], [0, -1]] : [[1, 0], [-1, 0]];
          r.dir = perp[Math.floor(Math.random() * 2)];
        }

        // trail
        if (r.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(r.trail[0][0], r.trail[0][1]);
          for (let t = 1; t < r.trail.length; t++) ctx.lineTo(r.trail[t][0], r.trail[t][1]);
          ctx.strokeStyle = r.glow ? 'rgba(214,180,49,0.34)' : 'rgba(214,180,49,0.14)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // glowing head
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.glow ? 2.4 : 1.6, 0, Math.PI * 2);
        ctx.fillStyle = r.glow ? '#F2D24B' : 'rgba(214,180,49,0.7)';
        if (r.glow) {
          ctx.shadowColor = '#D6B431';
          ctx.shadowBlur = 14;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        if (r.life <= 0 || r.x < -60 || r.x > W + 60 || r.y < -60 || r.y > H + 60) {
          runners.splice(i, 1);
        }
      }
      if (runners.length < 14 && frame % 18 === 0) spawn();
      requestAnimationFrame(draw);
    })();
  }

  /* ---------- Lightbox (project galleries) ---------- */
  const lb = $('.lightbox');
  if (lb) {
    const stage = $('.lb-stage', lb);
    function openLB(src, isVideo) {
      stage.innerHTML = '';
      let node;
      if (isVideo) {
        node = document.createElement('video');
        node.src = src; node.controls = true; node.autoplay = true; node.playsInline = true;
      } else {
        node = document.createElement('img');
        node.src = src; node.alt = '';
      }
      stage.appendChild(node);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLB() {
      lb.classList.remove('open');
      stage.innerHTML = '';
      document.body.style.overflow = '';
    }
    $$('.gallery figure, .g-fig').forEach((fig) => {
      fig.addEventListener('click', () => {
        const v = $('video', fig);
        const i = $('img', fig);
        if (v) openLB(v.dataset.full || (v.querySelector('source') && v.querySelector('source').src) || v.src, true);
        else if (i) openLB(i.dataset.full || i.src, false);
      });
    });
    lb.addEventListener('click', (e) => { if (e.target === lb || e.target.classList.contains('close')) closeLB(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && lb.classList.contains('open')) closeLB(); });
  }

  /* ---------- Expertise stage fallback (no GSAP / reduced motion) ---------- */
  if (!(hasGSAP && window.ScrollTrigger) || reduceMotion) {
    const idxEl = $('[data-xp-idx]');
    const kwEl = $('[data-xp-kw]');
    const tiles = $$('[data-xp-tile]');
    if (idxEl && kwEl && tiles.length && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            idxEl.textContent = en.target.dataset.idx;
            kwEl.textContent = en.target.dataset.kw;
          }
        });
      }, { rootMargin: '-45% 0px -45% 0px' });
      tiles.forEach((t) => io.observe(t));
    }
  }

  /* ---------- Footer year ---------- */
  $$('.year').forEach((y) => { y.textContent = new Date().getFullYear(); });
})();
