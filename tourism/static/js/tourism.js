/*
  global.js — Object-oriented ES module for global site-wide behaviors
  - Sticky navbar with active menu highlighting
  - Smooth in-page scrolling (respects prefers-reduced-motion)
  - Back-to-top button with smooth scroll
  - Reusable utility helpers
  - Encapsulated in a class with init/destroy lifecycle
  - Initialized after DOMContentLoaded; optimized for mobile/performance
*/

export class GlobalSite {
  /**
   * Construct controller with optional overrides:
   * new GlobalSite({ selectors: {...}, classes: {...}, thresholds: {...} })
   */
  constructor(options = {}) {
    this._defaults = {
      selectors: {
        navbar: '.site-nav',
        navLinks: '.site-nav a[href^="#"]',
        section: 'section[id]',
        backToTop: '.back-to-top',
      },
      classes: {
        sticky: 'is-sticky',
        active: 'is-active',
        backToTopVisible: 'is-visible',
      },
      thresholds: {
        backToTopPx: 400,
        stickyOffsetPx: 10,
      },
    };

    // Merge options
    this.opts = {
      ...this._defaults,
      ...options,
      selectors: { ...this._defaults.selectors, ...options.selectors },
      classes: { ...this._defaults.classes, ...options.classes },
      thresholds: { ...this._defaults.thresholds, ...options.thresholds },
    };

    // Internal state
    this._navbar = null;
    this._navLinks = [];
    this._sections = [];
    this._backToTop = null;
    this._observer = null;
    this._rafScheduled = false;
    this._lastScrollY = 0;
    this._stickyThreshold = this.opts.thresholds.stickyOffsetPx;
    this._unbindFns = [];
    this._destroyed = false;

    // Bound handlers
    this._onScroll = this._onScroll.bind(this);
    this._onResize = this._onResize.bind(this);
    this._handleAnchorClick = this._handleAnchorClick.bind(this);
    this._onBackToTopClick = this._onBackToTopClick.bind(this);

    // Auto-init on DOMContentLoaded for convenience
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
    } else {
      this.init();
    }
  }

  /* =========================
     Static utility helpers
     ========================= */
  static q(sel, ctx = document) {
    return ctx.querySelector(sel);
  }

  static qa(sel, ctx = document) {
    return Array.from(ctx.querySelectorAll(sel));
  }

  static addClass(el, cls) { if (el) el.classList.add(cls); }
  static removeClass(el, cls) { if (el) el.classList.remove(cls); }
  static toggleClass(el, cls, force) {
    if (!el) return;
    if (typeof force === 'boolean') el.classList.toggle(cls, force);
    else el.classList.toggle(cls);
  }

  // Delegation helper returns an unbind function
  static delegate(root, selector, event, handler, opts = {}) {
    const fn = (e) => {
      const target = e.target.closest ? e.target.closest(selector) : null;
      if (!target || !root.contains(target)) return;
      handler.call(target, e, target);
    };
    root.addEventListener(event, fn, opts);
    return () => root.removeEventListener(event, fn, opts);
  }

  static prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* =========================
     Initialization & teardown
     ========================= */
  init() {
    if (this._destroyed) return this;

    // Query and cache DOM elements
    this._navbar = GlobalSite.q(this.opts.selectors.navbar);
    this._navLinks = GlobalSite.qa(this.opts.selectors.navLinks);
    this._sections = GlobalSite.qa(this.opts.selectors.section);
    this._backToTop = GlobalSite.q(this.opts.selectors.backToTop);

    // Compute thresholds
    this._computeStickyThreshold();

    // Setup observer (preferred method for active-link)
    this._setupSectionObserver();

    // Bind event listeners
    this._bind();

    // Apply initial state (defer to idle if available)
    const applyInitial = () => {
      this._onScroll(); // sets sticky/back-to-top/active states
      if (!this._observer) this._updateActiveByPosition();
    };
    if ('requestIdleCallback' in window) requestIdleCallback(applyInitial, { timeout: 500 });
    else setTimeout(applyInitial, 80);

    return this;
  }

  destroy() {
    if (this._destroyed) return this;
    // Unbind all registered cleanup functions
    while (this._unbindFns.length) {
      const fn = this._unbindFns.pop();
      try { fn(); } catch { /* ignore */ }
    }

    // Disconnect observer if present
    if (this._observer) {
      try { this._observer.disconnect(); } catch { /* ignore */ }
      this._observer = null;
    }

    // Remove classes and aria attributes added by script
    if (this._navbar) GlobalSite.removeClass(this._navbar, this.opts.classes.sticky);
    this._navLinks.forEach((a) => {
      GlobalSite.removeClass(a, this.opts.classes.active);
      a.removeAttribute('aria-current');
    });
    if (this._backToTop) GlobalSite.removeClass(this._backToTop, this.opts.classes.backToTopVisible);

    this._destroyed = true;
    return this;
  }

  /* =========================
     Sticky threshold computation
     ========================= */
  _computeStickyThreshold() {
    if (!this._navbar) {
      this._stickyThreshold = this.opts.thresholds.stickyOffsetPx;
      return;
    }
    const rect = this._navbar.getBoundingClientRect();
    // Use navbar's top relative to document as threshold, with a lower bound
    this._stickyThreshold = Math.max(this.opts.thresholds.stickyOffsetPx, rect.top + window.scrollY);
  }

  /* =========================
     IntersectionObserver for active link highlighting
     ========================= */
  _setupSectionObserver() {
    if (typeof IntersectionObserver === 'undefined' || !this._sections.length) {
      this._observer = null;
      return;
    }

    this._observer = new IntersectionObserver(
      (entries) => {
        // Select most visible intersecting section
        let best = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
        }
        if (best && best.target && best.target.id) this._markActive(best.target.id);
      },
      {
        root: null,
        rootMargin: '0px 0px -45% 0px', // trigger when section reaches ~55% viewport
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    this._sections.forEach((s) => this._observer.observe(s));
  }

  _markActive(sectionId) {
    this._navLinks.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const id = href.startsWith('#') ? href.slice(1) : null;
      const isActive = id === sectionId;
      GlobalSite.toggleClass(a, this.opts.classes.active, isActive);
      if (isActive) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  }

  // Fallback active-link calculation based on viewport midpoint
  _updateActiveByPosition() {
    if (!this._sections.length) return;
    const viewportMid = window.innerHeight / 2;
    let chosen = null;
    for (const sec of this._sections) {
      const r = sec.getBoundingClientRect();
      if (r.top <= viewportMid && r.bottom > 0) {
        chosen = sec.id;
        break;
      }
    }
    if (!chosen && window.scrollY < 100 && this._sections[0]) chosen = this._sections[0].id;
    if (chosen) this._markActive(chosen);
  }

  /* =========================
     Smooth scrolling handler (delegated)
     ========================= */
  _handleAnchorClick(e, target) {
    const href = target.getAttribute('href') || '';
    if (!href || href === '#') return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();

    const behavior = GlobalSite.prefersReducedMotion() ? 'auto' : 'smooth';
    el.scrollIntoView({ behavior, block: 'start' });

    // Accessibility: focus without additional scrolling
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
    setTimeout(() => el.removeAttribute('tabindex'), 1000);

    // Replace hash without adding a history entry
    if (history && history.replaceState) {
      try { history.replaceState(null, '', `#${id}`); } catch { /* ignore */ }
    }
  }

  /* =========================
     Back-to-top click handler
     ========================= */
  _onBackToTopClick(e) {
    e.preventDefault();
    const behavior = GlobalSite.prefersReducedMotion() ? 'auto' : 'smooth';
    window.scrollTo({ top: 0, behavior });
  }

  /* =========================
     Scroll & resize handling (rAF + debounce)
     ========================= */
  _onScroll() {
    if (this._rafScheduled) return;
    this._rafScheduled = true;
    requestAnimationFrame(() => {
      this._rafScheduled = false;
      this._lastScrollY = window.scrollY || window.pageYOffset;
      // Sticky navbar
      if (this._navbar) {
        const isSticky = this._lastScrollY > this._stickyThreshold;
        GlobalSite.toggleClass(this._navbar, this.opts.classes.sticky, isSticky);
      }
      // Back-to-top visibility
      if (this._backToTop) {
        const visible = this._lastScrollY > this.opts.thresholds.backToTopPx;
        GlobalSite.toggleClass(this._backToTop, this.opts.classes.backToTopVisible, visible);
      }
      // Active link (fallback if no observer)
      if (!this._observer) this._updateActiveByPosition();
    });
  }

  _onResize() {
    clearTimeout(this._resizeTimer);
    this._resizeTimer = setTimeout(() => {
      this._computeStickyThreshold();
      this._sections = GlobalSite.qa(this.opts.selectors.section);
      if (this._observer) {
        try { this._observer.disconnect(); } catch { /* ignore */ }
        this._setupSectionObserver();
      }
      // re-evaluate state
      this._onScroll();
    }, 120);
  }

  /* =========================
     Bind/unbind helpers
     ========================= */
  _bind() {
    // Delegated anchor links
    const unbindAnchors = GlobalSite.delegate(document, 'a[href^="#"]', 'click', this._handleAnchorClick, { passive: false });
    this._unbindFns.push(unbindAnchors);

    // Back-to-top click
    if (this._backToTop) {
      this._backToTop.addEventListener('click', this._onBackToTopClick);
      this._unbindFns.push(() => this._backToTop.removeEventListener('click', this._onBackToTopClick));
    }

    // Scroll and resize
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._unbindFns.push(() => window.removeEventListener('scroll', this._onScroll));
    window.addEventListener('resize', this._onResize, { passive: true });
    this._unbindFns.push(() => window.removeEventListener('resize', this._onResize));
  }
}

/* =========================
   Default singleton
   - Auto-instantiated and exported for convenience
   - Consumers can import { GlobalSite } for manual control
   ========================= */
const defaultInstance = new GlobalSite();
export default defaultInstance;