/*
  Navbar.js - Enhanced Navigation Module
  ======================================
  Professional implementation with AJAX, jQuery, and JSON responses
*/

(function (global, factory) {
  'use strict';
  
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    global.Navbar = factory(global.jQuery);
  }
}(typeof window !== 'undefined' ? window : this, function ($) {
  'use strict';
  
  // Check if jQuery is available
  if (!$) {
    console.warn('jQuery is required for Navbar.js to function properly');
    return null;
  }
  
  // Navbar Module
  const Navbar = {
    // Configuration
    config: {
      selectors: {
        navbar: '.site-navbar',
        navLinks: '.nav-link[data-page]',
        navToggler: '.navbar-toggler',
        navCollapse: '.navbar-collapse',
        ctaButton: '.nav-cta'
      },
      classes: {
        active: 'active',
        show: 'show',
        scrolled: 'scrolled',
        hidden: 'navbar-hidden',
        visible: 'navbar-visible'
      },
      animations: {
        delay: 10000 // 10 seconds for CTA pulse
      }
    },
    
    // State management
    state: {
      isInitialized: false,
      lastScrollTop: 0
    },
    
    // DOM Elements
    elements: {},
    
    // Initialize the navbar
    init: function() {
      if (this.state.isInitialized) {
        return;
      }
      
      // Cache DOM elements
      this.cacheElements();
      
      // Bind event listeners
      this.bindEvents();
      
      // Initialize components
      this.initComponents();
      
      // Set initialized state
      this.state.isInitialized = true;
    },
    
    // Cache DOM elements
    cacheElements: function() {
      const selectors = this.config.selectors;
      this.elements = {
        $navbar: $(selectors.navbar),
        $navLinks: $(selectors.navLinks),
        $navToggler: $(selectors.navToggler),
        $navCollapse: $(selectors.navCollapse),
        $ctaButton: $(selectors.ctaButton)
      };
    },
    
    // Bind event listeners
    bindEvents: function() {
      // Mobile menu toggle
      this.elements.$navToggler.on('click.navbar', (e) => this.toggleMobileMenu(e));
      
      // Dropdown interactions
      this.bindDropdownEvents();
      
      // Window events
      $(window).on('scroll.navbar', () => this.handleScroll());
      $(window).on('resize.navbar', () => this.handleResize());
      
      // Document events
      $(document).on('click.navbar', (e) => this.handleDocumentClick(e));
    },
    
    // Initialize components
    initComponents: function() {
      // Initialize navbar visibility
      this.elements.$navbar.addClass(this.config.classes.visible);
      
      // Initialize CTA button effects
      this.initCtaEffects();
      
      // Initialize keyboard navigation
      this.initKeyboardNavigation();
    },
    
    // Toggle mobile menu
    toggleMobileMenu: function(e) {
      e.preventDefault();
      this.elements.$navCollapse.collapse('toggle');
    },
    
    // Bind dropdown events
    bindDropdownEvents: function() {
      // Dropdown hover behavior for desktop
      $('.dropdown').hover(
        function() {
          if ($(window).width() >= 992) {
            $(this).addClass('show');
            $(this).find('.dropdown-menu').addClass('show');
          }
        },
        function() {
          if ($(window).width() >= 992) {
            $(this).removeClass('show');
            $(this).find('.dropdown-menu').removeClass('show');
          }
        }
      );
      
      // Dropdown click behavior for mobile
      $('.dropdown-toggle').on('click.navbar', function(e) {
        if ($(window).width() < 992) {
          e.preventDefault();
          const $parent = $(this).parent();
          const $menu = $parent.find('.dropdown-menu');
          
          // Close other dropdowns
          $('.dropdown').not($parent).removeClass('show');
          $('.dropdown-menu').not($menu).removeClass('show');
          
          // Toggle current dropdown
          $parent.toggleClass('show');
          $menu.toggleClass('show');
        }
      });
    },
    
    // Handle scroll events
    handleScroll: function() {
      this.updateNavbarOnScroll();
    },
    
    // Update navbar based on scroll position
    updateNavbarOnScroll: function() {
      const $navbar = this.elements.$navbar;
      const scrollTop = $(window).scrollTop();
      const navbarHeight = $navbar.outerHeight();
      const lastScrollTop = this.state.lastScrollTop;
      
      // Add scrolled class when scrolling down
      if (scrollTop > 50) {
        $navbar.addClass(this.config.classes.scrolled);
      } else {
        $navbar.removeClass(this.config.classes.scrolled);
      }
      
      // Hide navbar on scroll down, show on scroll up (mobile)
      if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
        $navbar.removeClass(this.config.classes.visible).addClass(this.config.classes.hidden);
      } else {
        $navbar.removeClass(this.config.classes.hidden).addClass(this.config.classes.visible);
      }
      
      this.state.lastScrollTop = scrollTop;
    },
    
    // Handle resize events
    handleResize: function() {
      // Close mobile menu on resize
      this.elements.$navCollapse.removeClass('show');
      
      // Close dropdowns
      $('.dropdown').removeClass('show');
      $('.dropdown-menu').removeClass('show');
    },
    
    // Handle document click events
    handleDocumentClick: function(e) {
      const $target = $(e.target);
      const $navbar = this.elements.$navbar;
      
      // Close dropdowns when clicking outside
      if (!$navbar.is($target) && $navbar.has($target).length === 0) {
        $('.dropdown').removeClass('show');
        $('.dropdown-menu').removeClass('show');
      }
    },
    
    // Initialize CTA button effects
    initCtaEffects: function() {
      const $ctaButton = this.elements.$ctaButton;
      if (!$ctaButton.length) return;
      
      // Add pulse animation to CTA button occasionally
      setInterval(() => {
        if (Math.random() > 0.7) { // 30% chance
          $ctaButton.addClass('pulse');
          setTimeout(() => {
            $ctaButton.removeClass('pulse');
          }, 2000);
        }
      }, this.config.animations.delay);
    },
    
    // Initialize keyboard navigation
    initKeyboardNavigation: function() {
      $(document).on('keydown.navbar', (e) => {
        const $activeElement = $(document.activeElement);
        
        // Escape key to close dropdowns
        if (e.key === 'Escape') {
          $('.dropdown').removeClass('show');
          $('.dropdown-menu').removeClass('show');
        }
        
        // Arrow keys for dropdown navigation
        if ($activeElement.hasClass('dropdown-item')) {
          const $dropdown = $activeElement.closest('.dropdown');
          const $items = $dropdown.find('.dropdown-item');
          const currentIndex = $items.index($activeElement);
          
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % $items.length;
            $items.eq(nextIndex).focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + $items.length) % $items.length;
            $items.eq(prevIndex).focus();
          }
        }
      });
    }
  };
  
  // Initialize automatically when DOM is ready
  $(() => {
    Navbar.init();
  });
  
  // Expose Navbar module
  return Navbar;
}));