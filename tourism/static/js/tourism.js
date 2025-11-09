/*
  Tourism.js - Advanced JavaScript Module
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
    global.Tourism = factory(global.jQuery);
  }
}(typeof window !== 'undefined' ? window : this, function ($) {
  'use strict';
  
  // Check if jQuery is available
  if (!$) {
    console.warn('jQuery is required for Tourism.js to function properly');
    return null;
  }
  
  // Tourism.js Main Class
  class Tourism {
    constructor(options = {}) {
      // Default configuration
      this.config = {
        selectors: {
          mainContent: '#main-content',
          navLinks: '[data-page]',
          navbar: '.site-navbar',
          backToTop: '.back-to-top',
          loadingOverlay: '.ajax-loading-overlay'
        },
        classes: {
          active: 'active',
          loading: 'loading',
          hidden: 'hidden',
          visible: 'visible'
        },
        animations: {
          fadeDuration: 300,
          slideDuration: 400,
          delay: 50
        },
        ajax: {
          timeout: 10000,
          retries: 2
        },
        ...options
      };
      
      // State management
      this.state = {
        currentPage: null,
        isLoading: false,
        isScrolling: false
      };
      
      // DOM Elements
      this.elements = {};
      
      // Initialize the application
      this.init();
    }
    
    // Initialize the application
    init() {
      // Cache DOM elements
      this.cacheElements();
      
      // Bind event listeners
      this.bindEvents();
      
      // Initialize components
      this.initComponents();
      
      // Set initial state
      this.state.currentPage = this.getCurrentPage();
      
      // Initialize history state
      this.initHistory();
    }
    
    // Cache DOM elements for performance
    cacheElements() {
      const selectors = this.config.selectors;
      this.elements = {
        $mainContent: $(selectors.mainContent),
        $navLinks: $(selectors.navLinks),
        $navbar: $(selectors.navbar),
        $backToTop: $(selectors.backToTop),
        $loadingOverlay: $(selectors.loadingOverlay)
      };
    }
    
    // Bind event listeners
    bindEvents() {
      // Navigation events
      this.elements.$navLinks.on('click.tourism', (e) => this.handleNavigation(e));
      
      // Window events
      $(window).on('popstate.tourism', (e) => this.handlePopState(e));
      $(window).on('scroll.tourism', () => this.handleScroll());
      $(window).on('resize.tourism', () => this.handleResize());
      
      // Document events
      $(document).on('keydown.tourism', (e) => this.handleKeyDown(e));
    }
    
    // Initialize components
    initComponents() {
      // Initialize navbar behavior
      this.initNavbar();
      
      // Initialize back to top button
      this.initBackToTop();
    }
    
    // Initialize history state
    initHistory() {
      try {
        const state = {
          page: this.state.currentPage,
          content: this.elements.$mainContent.html(),
          title: document.title,
          timestamp: Date.now()
        };
        
        window.history.replaceState(state, document.title, window.location.href);
      } catch (error) {
        console.warn('Failed to initialize history state:', error);
      }
    }
    
    // Get current page identifier
    getCurrentPage() {
      const $activeLink = this.elements.$navLinks.filter('.active');
      return $activeLink.length ? $activeLink.data('page') : 'home';
    }
    
    // Handle navigation click
    handleNavigation(e) {
      e.preventDefault();
      
      const $link = $(e.currentTarget);
      const url = $link.attr('href');
      const page = $link.data('page');
      
      // Validate navigation
      if (!url || !page || this.state.isLoading) {
        return;
      }
      
      // Navigate to page
      this.navigateToPage(url, page, true);
    }
    
    // Navigate to a specific page
    async navigateToPage(url, page, pushState = true) {
      // Prevent concurrent requests
      if (this.state.isLoading) {
        return;
      }
      
      // Set loading state
      this.setLoadingState(true);
      
      try {
        // Fetch page content via AJAX
        const data = await this.fetchPageContent(url);
        
        // Update UI with new content
        await this.updatePageContent(data, pushState);
        
        // Update navigation state
        this.updateNavigation(page);
        
        // Trigger custom event
        $(document).trigger('tourism:pageLoaded', { page, url, data });
      } catch (error) {
        console.error('Navigation failed:', error);
        this.handleNavigationError(url, error);
      } finally {
        // Reset loading state
        this.setLoadingState(false);
      }
    }
    
    // Fetch page content via AJAX
    async fetchPageContent(url) {
      // Construct JSON endpoint URL
      const jsonUrl = this.getJsonEndpoint(url);
      
      // Retry mechanism
      for (let attempt = 0; attempt <= this.config.ajax.retries; attempt++) {
        try {
          const response = await $.ajax({
            url: jsonUrl,
            method: 'GET',
            dataType: 'json',
            timeout: this.config.ajax.timeout
          });
          
          // Validate response
          if (response && response.status === 'success') {
            return response;
          } else {
            throw new Error(response?.message || 'Invalid response format');
          }
        } catch (error) {
          if (attempt === this.config.ajax.retries) {
            throw error;
          }
          
          console.warn(`Attempt ${attempt + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }
    
    // Get JSON endpoint URL
    getJsonEndpoint(url) {
      if (url.endsWith('/')) {
        return `${url}json/`;
      } else if (url.endsWith('/json/')) {
        return url;
      } else {
        return `${url}/json/`;
      }
    }
    
    // Update page content
    async updatePageContent(data, pushState) {
      const $mainContent = this.elements.$mainContent;
      
      // Fade out current content
      await new Promise(resolve => $mainContent.fadeOut(this.config.animations.fadeDuration, resolve));
      
      // Update content
      $mainContent.html(data.content);
      
      // Update title
      if (data.title) {
        document.title = data.title;
      }
      
      // Fade in new content
      await new Promise(resolve => $mainContent.fadeIn(this.config.animations.fadeDuration, resolve));
      
      // Add page transition effect
      this.addPageTransition($mainContent);
      
      // Update browser history
      if (pushState) {
        const state = {
          page: this.state.currentPage,
          content: data.content,
          title: data.title || document.title,
          timestamp: Date.now()
        };
        
        try {
          window.history.pushState(state, data.title || document.title, window.location.href);
        } catch (error) {
          console.warn('Failed to update history state:', error);
        }
      }
    }
    
    // Update navigation state
    updateNavigation(page) {
      // Remove active class from all links
      this.elements.$navLinks.removeClass(this.config.classes.active);
      this.elements.$navLinks.attr('aria-current', 'false');
      
      // Add active class to current page link
      const $activeLink = this.elements.$navLinks.filter(`[data-page="${page}"]`);
      $activeLink.addClass(this.config.classes.active);
      $activeLink.attr('aria-current', 'page');
      
      // Update current page state
      this.state.currentPage = page;
    }
    
    // Handle popstate event (browser back/forward)
    async handlePopState(e) {
      const state = e.originalEvent.state;
      
      if (!state) {
        // No state, reload the page
        window.location.reload();
        return;
      }
      
      try {
        // Set loading state
        this.setLoadingState(true);
        
        // Update content from state
        const $mainContent = this.elements.$mainContent;
        
        // Fade out current content
        await new Promise(resolve => $mainContent.fadeOut(this.config.animations.fadeDuration, resolve));
        
        // Update content
        $mainContent.html(state.content);
        
        // Update title
        if (state.title) {
          document.title = state.title;
        }
        
        // Fade in new content
        await new Promise(resolve => $mainContent.fadeIn(this.config.animations.fadeDuration, resolve));
        
        // Add page transition effect
        this.addPageTransition($mainContent);
        
        // Update navigation
        this.updateNavigation(state.page);
        
        // Update state
        this.state.currentPage = state.page;
      } catch (error) {
        console.error('Failed to restore page state:', error);
        window.location.reload();
      } finally {
        this.setLoadingState(false);
      }
    }
    
    // Handle navigation error
    handleNavigationError(url, error) {
      // Log error
      console.error('Navigation error:', error);
      
      // Fallback to traditional navigation
      window.location.href = url;
    }
    
    // Set loading state
    setLoadingState(isLoading) {
      this.state.isLoading = isLoading;
      
      if (isLoading) {
        // Show loading overlay
        this.elements.$loadingOverlay.addClass(this.config.classes.active);
        
        // Add loading class to body
        $('body').addClass(this.config.classes.loading);
      } else {
        // Hide loading overlay
        this.elements.$loadingOverlay.removeClass(this.config.classes.active);
        
        // Remove loading class from body
        $('body').removeClass(this.config.classes.loading);
        
        // Close mobile menu if open
        $('.navbar-collapse.show').collapse('hide');
      }
    }
    
    // Initialize navbar behavior
    initNavbar() {
      const $navbar = this.elements.$navbar;
      if (!$navbar.length) return;
      
      let lastScrollTop = 0;
      
      // Scroll handler for navbar
      this.handleScroll = () => {
        const scrollTop = $(window).scrollTop();
        const navbarHeight = $navbar.outerHeight();
        
        // Add scrolled class when scrolling down
        if (scrollTop > 50) {
          $navbar.addClass('scrolled');
        } else {
          $navbar.removeClass('scrolled');
        }
        
        // Hide navbar on scroll down, show on scroll up (mobile)
        if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
          $navbar.removeClass('navbar-visible').addClass('navbar-hidden');
        } else {
          $navbar.removeClass('navbar-hidden').addClass('navbar-visible');
        }
        
        lastScrollTop = scrollTop;
      };
    }
    
    // Initialize back to top button
    initBackToTop() {
      const $backToTop = this.elements.$backToTop;
      if (!$backToTop.length) return;
      
      // Scroll handler for back to top button
      const originalHandleScroll = this.handleScroll || function() {};
      
      this.handleScroll = () => {
        // Call original scroll handler
        originalHandleScroll();
        
        // Show/hide back to top button
        if ($(window).scrollTop() > 400) {
          $backToTop.addClass('is-visible');
        } else {
          $backToTop.removeClass('is-visible');
        }
      };
      
      // Click handler for back to top button
      $backToTop.on('click.tourism', (e) => {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 600);
      });
    }
    
    // Handle keydown events
    handleKeyDown(e) {
      // Escape key to close modals/menus
      if (e.key === 'Escape') {
        // Close mobile menu
        $('.navbar-collapse.show').collapse('hide');
        
        // Hide loading overlay if visible
        this.elements.$loadingOverlay.removeClass(this.config.classes.active);
        $('body').removeClass(this.config.classes.loading);
      }
    }
    
    // Handle resize events
    handleResize() {
      // Close mobile menu on resize
      $('.navbar-collapse').removeClass('show');
    }
    
    // Add page transition effect
    addPageTransition($element) {
      $element.removeClass('active');
      setTimeout(() => {
        $element.addClass('active');
      }, this.config.animations.delay);
    }
    
    // Public API methods
    // Navigate to a page programmatically
    goTo(page, url) {
      const $link = this.elements.$navLinks.filter(`[data-page="${page}"]`);
      const targetUrl = url || $link.attr('href');
      
      if (targetUrl) {
        this.navigateToPage(targetUrl, page, true);
      }
    }
    
    // Refresh current page
    refresh() {
      const currentPage = this.state.currentPage;
      const $link = this.elements.$navLinks.filter(`[data-page="${currentPage}"]`);
      const url = $link.attr('href');
      
      if (url) {
        this.navigateToPage(url, currentPage, false);
      }
    }
    
    // Get current page
    getCurrentPageName() {
      return this.state.currentPage;
    }
    
    // Check if page is loading
    isLoading() {
      return this.state.isLoading;
    }
  }
  
  // Create singleton instance
  let instance = null;
  
  // Factory function
  function createTourism(options = {}) {
    if (!instance) {
      instance = new Tourism(options);
    }
    return instance;
  }
  
  // Expose Tourism class and factory function
  const TourismAPI = {
    Tourism: Tourism,
    create: createTourism,
    getInstance: () => instance
  };
  
  // Initialize automatically when DOM is ready
  $(() => {
    if (!instance) {
      instance = createTourism();
    }
  });
  
  return TourismAPI;
}));