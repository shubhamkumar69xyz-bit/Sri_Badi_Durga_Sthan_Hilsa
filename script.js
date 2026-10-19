/**
 * ==========================================================================
 * SHREE MAA DURGA TEMPLE - CORE JAVASCRIPT (PHASE 3)
 * Accessible, Responsive, Production-Ready Vanilla JavaScript
 * ==========================================================================
 */

(function () {
  'use strict';

  // Check user motion preferences
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * --------------------------------------------------------------------------
   * 1. MOBILE NAVIGATION DRAWER
   * --------------------------------------------------------------------------
   */
  const navToggle = document.getElementById('navToggle');
  const primaryNav = document.getElementById('primaryNav');

  function openNav() {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute('aria-expanded', 'true');
    primaryNav.classList.add('is-open');
    document.body.classList.add('nav-locked');

    // Shift focus to the first focusable link in the nav
    const firstLink = primaryNav.querySelector('a');
    if (firstLink) {
      firstLink.focus();
    }
  }

  function closeNav() {
    if (!navToggle || !primaryNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('is-open');
    document.body.classList.remove('nav-locked');
  }

  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close navigation when any link inside it is clicked
    const navLinks = primaryNav.querySelectorAll('a');
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeNav();
        }
      });
    });

    // Close menu when Escape key is pressed
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && primaryNav.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });
  }

  /**
   * --------------------------------------------------------------------------
   * 2. SMOOTH SCROLLING & ACTIVE SECTION SCROLL SPY
   * --------------------------------------------------------------------------
   */
  // Smooth scroll offset calculation for sticky header
  const internalNavLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
  internalNavLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        e.preventDefault();
        const header = document.querySelector('.site-header');
        const headerOffset = header ? header.offsetHeight + 10 : 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });

        // Set focus to the section for screen readers and keyboard users
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({ preventScroll: true });
      }
    });
  });

  // IntersectionObserver for Scroll Spy
  const sections = document.querySelectorAll('section[id]');
  const mainNavLinks = document.querySelectorAll('.primary-nav .nav-link');

  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger near upper third of viewport
      threshold: 0,
    };

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          mainNavLinks.forEach((navLink) => {
            const href = navLink.getAttribute('href');
            if (href === `#${currentId}`) {
              navLink.classList.add('nav-link--active');
              navLink.setAttribute('aria-current', 'page');
            } else {
              navLink.classList.remove('nav-link--active');
              navLink.removeAttribute('aria-current');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /**
   * --------------------------------------------------------------------------
   * 3. ACCESSIBLE PHOTO GALLERY LIGHTBOX
   * --------------------------------------------------------------------------
   */
  const galleryFigures = document.querySelectorAll('.gallery-card');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');

  // Build gallery items list from existing HTML markup
  const galleryData = [];
  galleryFigures.forEach((figure, index) => {
    const img = figure.querySelector('.gallery-image');
    const caption = figure.querySelector('.gallery-caption');
    if (img) {
      galleryData.push({
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || '',
        caption: caption ? caption.textContent.trim() : '',
        triggerElement: figure,
      });

      // Make figure keyboard focusable and accessible
      figure.setAttribute('tabindex', '0');
      figure.setAttribute('role', 'button');
      figure.setAttribute('aria-haspopup', 'dialog');
      figure.setAttribute('aria-label', `बड़ा दृश्य देखें: ${caption ? caption.textContent.trim() : 'चित्र'}`);

      // Click or Enter/Space triggers lightbox
      const openTrigger = () => openLightbox(index);
      figure.addEventListener('click', openTrigger);
      figure.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openTrigger();
        }
      });
    }
  });

  let currentIndex = 0;
  let lastFocusedElement = null;

  function renderLightboxIndex(index) {
    if (index < 0 || index >= galleryData.length) return;
    currentIndex = index;
    const item = galleryData[currentIndex];

    if (lightboxImage) {
      lightboxImage.src = item.src;
      lightboxImage.alt = item.alt;
    }
    if (lightboxCaption) {
      lightboxCaption.textContent = `${item.caption} (${currentIndex + 1} / ${galleryData.length})`;
    }
  }

  function openLightbox(index) {
    if (!lightboxModal) return;
    lastFocusedElement = document.activeElement;
    renderLightboxIndex(index);

    lightboxModal.removeAttribute('hidden');
    lightboxModal.classList.add('is-active');
    document.body.classList.add('modal-locked');

    // Focus close button initially
    if (lightboxCloseBtn) {
      lightboxCloseBtn.focus();
    }
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.setAttribute('hidden', '');
    lightboxModal.classList.remove('is-active');
    document.body.classList.remove('modal-locked');

    // Restore focus back to original trigger card
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function showNextImage() {
    const nextIdx = (currentIndex + 1) % galleryData.length;
    renderLightboxIndex(nextIdx);
  }

  function showPrevImage() {
    const prevIdx = (currentIndex - 1 + galleryData.length) % galleryData.length;
    renderLightboxIndex(prevIdx);
  }

  if (lightboxModal) {
    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', showNextImage);
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', showPrevImage);

    // Backdrop click closes modal
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });

    // Keyboard navigation inside lightbox
    document.addEventListener('keydown', (e) => {
      if (!lightboxModal.classList.contains('is-active')) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      } else if (e.key === 'Tab') {
        // Trap focus inside modal
        const focusable = lightboxModal.querySelectorAll('button:not([disabled])');
        const firstElem = focusable[0];
        const lastElem = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstElem) {
          e.preventDefault();
          lastElem.focus();
        } else if (!e.shiftKey && document.activeElement === lastElem) {
          e.preventDefault();
          firstElem.focus();
        }
      }
    });
  }

  /**
   * --------------------------------------------------------------------------
   * 4. DISMISSIBLE ANNOUNCEMENT BAR
   * --------------------------------------------------------------------------
   */
  const announcementBar = document.getElementById('announcementBar');
  const dismissAnnouncementBtn = document.getElementById('dismissAnnouncementBtn');

  if (announcementBar && dismissAnnouncementBtn) {
    // Check if dismissed previously in the session
    const isDismissed = sessionStorage.getItem('durga_puja_announcement_dismissed');
    if (isDismissed === 'true') {
      announcementBar.style.display = 'none';
    }

    dismissAnnouncementBtn.addEventListener('click', () => {
      announcementBar.style.display = 'none';
      sessionStorage.setItem('durga_puja_announcement_dismissed', 'true');
    });
  }

  /**
   * --------------------------------------------------------------------------
   * 5. LIVE DARSHAN STATUS CONTROLLER (CONFIGURABLE & TRUTH-ALIGNED)
   * --------------------------------------------------------------------------
   * Note: We avoid inventing a fake live stream. This controller exposes a clean,
   * safe API to switch between 'OFFLINE', 'UPCOMING', and 'LIVE' states without
   * fabricating video data or misrepresenting broadcast readiness.
   */
  const DarshanStatusManager = {
    // Current default configuration - explicitly offline with upcoming notice
    currentStatus: 'OFFLINE', // Values: 'OFFLINE', 'UPCOMING', 'LIVE'
    nextScheduledTime: 'सांध्य महाआरती (सायं 07:00 बजे)',
    streamUrl: null, // Legitimate streaming URL to be plugged in by temple IT admin

    init: function () {
      this.updateStatusDisplay();
    },

    updateStatusDisplay: function () {
      const statusIndicator = document.getElementById('liveStatusIndicator');
      const statusSchedule = document.getElementById('liveStatusSchedule');
      const screenHeading = document.getElementById('liveScreenHeading');
      const screenMessage = document.getElementById('liveScreenMessage');

      if (!statusIndicator) return;

      if (this.currentStatus === 'LIVE' && this.streamUrl) {
        statusIndicator.innerHTML = '<span class="status-pulse status-pulse--live" aria-hidden="true"></span> लाइव प्रसारण सक्रिय (On Air)';
        if (statusSchedule) statusSchedule.textContent = 'महाआरती का सीधा दर्शन जारी है';
        if (screenHeading) screenHeading.textContent = 'मंदिर गर्भगृह सीधा प्रसारण';
        if (screenMessage) screenMessage.textContent = 'माँ भगवती के पावन दर्शन सीधे गर्भगृह से प्रसारित हो रहे हैं।';
      } else if (this.currentStatus === 'UPCOMING') {
        statusIndicator.innerHTML = '<span class="status-pulse" aria-hidden="true"></span> आगामी प्रसारण (Scheduled)';
        if (statusSchedule) statusSchedule.textContent = `अगला सीधा प्रसारण: ${this.nextScheduledTime}`;
        if (screenHeading) screenHeading.textContent = 'सीधा प्रसारण शीघ्र प्रारंभ होगा';
        if (screenMessage) screenMessage.textContent = `अगला सीधा प्रसारण ${this.nextScheduledTime} पर निर्धारित है। कृपया समय पर जुड़े रहें।`;
      } else {
        // Default: OFFLINE
        statusIndicator.innerHTML = '<span class="status-pulse" aria-hidden="true"></span> लाइव स्ट्रीम स्थिति: ऑफलाइन (Offline)';
        if (statusSchedule) statusSchedule.textContent = `अगला सीधा प्रसारण: ${this.nextScheduledTime}`;
        if (screenHeading) screenHeading.textContent = 'मंदिर गर्भगृह लाइव प्रसारण केंद्र';
        if (screenMessage) {
          screenMessage.textContent = 'वर्तमान में सीधा प्रसारण ऑफलाइन है। निर्धारित आरती एवं विशेष पूजा के समय यह विंडो स्वतः सक्रिय हो जाएगी।';
        }
      }
    },
  };

  DarshanStatusManager.init();

  // Expose configuration hook safely on window for future temple backend integration
  window.TempleDarshanManager = DarshanStatusManager;
})();