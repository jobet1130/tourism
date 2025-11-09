/*
  Footer.js - Advanced Footer functionality
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
    global.Footer = factory(global.jQuery);
  }
}(typeof window !== 'undefined' ? window : this, function ($) {
  'use strict';
  
  // Check if jQuery is available
  if (!$) {
    console.warn('jQuery is required for Footer.js to function properly');
    return null;
  }
  
  // Footer Module
  const Footer = {
    // Configuration
    config: {
      selectors: {
        footer: '.site-footer',
        navLinks: '.footer-links a.ajax-link',
        socialLinks: '.social-link',
        newsletterForm: '#newsletter-form',
        newsletterInput: '#newsletter-form input[type="email"]',
        newsletterResponse: '#newsletter-response',
        languageSelector: '#language-selector',
        loadingOverlay: '.footer-loading-overlay'
      },
      classes: {
        active: 'active',
        success: 'success',
        error: 'error'
      },
      ajax: {
        timeout: 10000,
        retries: 2
      },
      api: {
        newsletter: '/api/newsletter/subscribe/',
        contact: '/api/contact/',
        analytics: '/api/analytics/'
      }
    },
    
    // State management
    state: {
      isInitialized: false,
      isLoading: false
    },
    
    // DOM Elements
    elements: {},
    
    // Initialize the footer
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
      
      console.log('Footer.js initialized successfully');
    },
    
    // Cache DOM elements
    cacheElements: function() {
      const selectors = this.config.selectors;
      this.elements = {
        $footer: $(selectors.footer),
        $navLinks: $(selectors.navLinks),
        $socialLinks: $(selectors.socialLinks),
        $newsletterForm: $(selectors.newsletterForm),
        $newsletterInput: $(selectors.newsletterInput),
        $newsletterResponse: $(selectors.newsletterResponse),
        $languageSelector: $(selectors.languageSelector),
        $loadingOverlay: $(selectors.loadingOverlay)
      };
    },
    
    // Bind event listeners
    bindEvents: function() {
      // Navigation events
      this.elements.$navLinks.on('click.footer', (e) => this.handleNavigation(e));
      
      // Social link events
      this.elements.$socialLinks.on('click.footer', (e) => this.handleSocialLink(e));
      
      // Newsletter form events
      this.elements.$newsletterForm.on('submit.footer', (e) => this.handleNewsletterSubmit(e));
      
      // Language selector events
      this.elements.$languageSelector.on('change.footer', (e) => this.handleLanguageChange(e));
      
      // Custom events
      $(document).on('footer:loadContent', (e, data) => this.loadContent(data));
    },
    
    // Initialize components
    initComponents: function() {
      // Initialize current year
      this.initCurrentYear();
      
      // Initialize any additional components here
    },
    
    // Initialize current year
    initCurrentYear: function() {
      const yearElement = document.getElementById('current-year');
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }
    },
    
    // Handle navigation click
    handleNavigation: function(e) {
      e.preventDefault();
      
      const $link = $(e.currentTarget);
      const url = $link.attr('href');
      const page = $link.data('page');
      
      // Validate navigation
      if (!url || !page) {
        return;
      }
      
      // Trigger custom event for AJAX navigation
      $(document).trigger('footer:navigate', { page: page, url: url });
      
      // If we have a global navigation function, use it
      if (typeof window.navigateToPage === 'function') {
        window.navigateToPage(url, page, true);
      } else {
        // Fallback to traditional navigation
        window.location.href = url;
      }
    },
    
    // Handle social link click
    handleSocialLink: function(e) {
      const $link = $(e.currentTarget);
      const url = $link.attr('href');
      const social = $link.data('social');
      
      // Track social link click
      this.trackSocialClick(social, url);
      
      // Trigger custom event
      $(document).trigger('footer:socialClick', { social: social, url: url });
    },
    
    // Track social link click with AJAX
    trackSocialClick: function(social, url) {
      // Track social link click via AJAX
      this.sendAnalyticsEvent('social_click', {
        social: social,
        url: url
      });
      
      console.log('Social link clicked:', social, url);
    },
    
    // Handle newsletter form submission
    handleNewsletterSubmit: function(e) {
      e.preventDefault();
      
      const email = this.elements.$newsletterInput.val().trim();
      
      // Validate email
      if (!email || !this.isValidEmail(email)) {
        this.showNewsletterResponse('Please enter a valid email address.', 'error');
        return;
      }
      
      // Submit newsletter signup
      this.submitNewsletterSignup(email);
    },
    
    // Submit newsletter signup via AJAX
    async submitNewsletterSignup(email) {
      // Set loading state
      this.setLoadingState(true);
      
      try {
        // Make AJAX request
        const response = await this.makeAjaxRequest({
          url: this.config.api.newsletter,
          method: 'POST',
          data: {
            email: email,
            source: 'footer'
          }
        });
        
        // Handle response
        if (response && response.status === 'success') {
          this.showNewsletterResponse(response.message || 'Thank you for subscribing!', 'success');
          this.elements.$newsletterForm[0].reset();
          
          // Track subscription event
          this.sendAnalyticsEvent('newsletter_subscribe', {
            email: email
          });
        } else {
          this.showNewsletterResponse(response.message || 'Failed to subscribe. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Newsletter signup failed:', error);
        this.showNewsletterResponse('An error occurred. Please try again later.', 'error');
      } finally {
        // Reset loading state
        this.setLoadingState(false);
      }
    },
    
    // Handle language change
    handleLanguageChange: function(e) {
      const selectedLanguage = $(e.currentTarget).val();
      
      // Set loading state
      this.setLoadingState(true);
      
      // Change language via AJAX
      this.changeLanguage(selectedLanguage)
        .then((response) => {
          if (response && response.status === 'success') {
            console.log('Language changed successfully:', response.message);
            // Reload page or update content
            window.location.reload();
          } else {
            console.warn('Failed to change language:', response.message);
            this.showNotification('Failed to change language', 'error');
          }
        })
        .catch((error) => {
          console.error('Language change failed:', error);
          this.showNotification('Language change failed', 'error');
        })
        .finally(() => {
          // Reset loading state
          this.setLoadingState(false);
        });
    },
    
    // Change language via AJAX
    async changeLanguage(language) {
      return await this.makeAjaxRequest({
        url: '/api/language/change/',
        method: 'POST',
        data: {
          language: language
        }
      });
    },
    
    // Load content via AJAX
    async loadContent(data) {
      // Set loading state
      this.setLoadingState(true);
      
      try {
        // Make AJAX request
        const response = await this.makeAjaxRequest({
          url: data.url,
          method: 'GET'
        });
        
        // Handle response
        if (response && response.status === 'success') {
          // Trigger custom event with loaded content
          $(document).trigger('footer:contentLoaded', {
            content: response.content,
            title: response.title,
            data: data
          });
        } else {
          throw new Error(response.message || 'Failed to load content');
        }
      } catch (error) {
        console.error('Content loading failed:', error);
        $(document).trigger('footer:contentLoadError', { error: error, data: data });
      } finally {
        // Reset loading state
        this.setLoadingState(false);
      }
    },
    
    // Make AJAX request with retry mechanism
    async makeAjaxRequest(options) {
      const settings = {
        method: 'GET',
        dataType: 'json',
        timeout: this.config.ajax.timeout,
        ...options
      };
      
      // Retry mechanism
      for (let attempt = 0; attempt <= this.config.ajax.retries; attempt++) {
        try {
          const response = await $.ajax(settings);
          return response;
        } catch (error) {
          if (attempt === this.config.ajax.retries) {
            throw error;
          }
          
          console.warn(`AJAX attempt ${attempt + 1} failed, retrying...`);
          await this.delay(1000 * (attempt + 1)); // Exponential backoff
        }
      }
    },
    
    // Send analytics event via AJAX
    async sendAnalyticsEvent(event, data) {
      try {
        await this.makeAjaxRequest({
          url: this.config.api.analytics,
          method: 'POST',
          data: {
            event: event,
            data: data,
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.warn('Failed to send analytics event:', error);
      }
    },
    
    // Show newsletter response message
    showNewsletterResponse: function(message, type) {
      const $response = this.elements.$newsletterResponse;
      
      // Clear previous classes
      $response.removeClass([this.config.classes.success, this.config.classes.error].join(' '));
      
      // Add appropriate class
      if (type) {
        $response.addClass(this.config.classes[type]);
      }
      
      // Set message
      $response.text(message);
      
      // Clear message after delay
      if (type === 'success') {
        setTimeout(() => {
          $response.text('');
        }, 5000);
      }
    },
    
    // Show notification
    showNotification: function(message, type) {
      // Create notification element
      const $notification = $(`
        <div class="footer-notification ${type}">
          <p>${message}</p>
        </div>
      `);
      
      // Add to footer
      this.elements.$footer.prepend($notification);
      
      // Remove after delay
      setTimeout(() => {
        $notification.fadeOut(() => {
          $notification.remove();
        });
      }, 3000);
    },
    
    // Set loading state
    setLoadingState: function(isLoading) {
      this.state.isLoading = isLoading;
      
      if (isLoading) {
        this.elements.$loadingOverlay.addClass(this.config.classes.active);
      } else {
        this.elements.$loadingOverlay.removeClass(this.config.classes.active);
      }
    },
    
    // Validate email format
    isValidEmail: function(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    
    // Delay function for async operations
    delay: function(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Cleanup function
    destroy: function() {
      // Remove event listeners
      $(document).off('.footer');
      
      console.log('Footer.js destroyed successfully');
    }
  };
  
  // Initialize automatically when DOM is ready
  $(() => {
    Footer.init();
  });
  
  // Expose Footer module
  return Footer;
}));