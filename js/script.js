/* =========================================================
   NovaAI — script.js
   Vanilla JS only. No frameworks, no dependencies.

   Contents:
   1. Navbar scroll state
   2. Mobile hamburger menu
   3. Smooth scroll for in-page links
   4. Active navbar link on scroll (IntersectionObserver)
   5. Scroll reveal animations (IntersectionObserver, once only)
   6. Animated counters (requestAnimationFrame)
   7. Back-to-top button
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------
     1. Navbar scroll state — adds background/shadow once
        the page has scrolled past the hero a little.
     ----------------------------------------------------- */
  const navbar = document.getElementById('navbar');

  const handleNavbarScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };

  /* -----------------------------------------------------
     2. Mobile hamburger menu
     ----------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMobileMenu = () => {
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('is-open');
  };

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  /* -----------------------------------------------------
     3. Smooth scroll for in-page nav links
        (accounts for the sticky navbar height as an offset)
     ----------------------------------------------------- */
  const navHeight = () => navbar.offsetHeight;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId.length <= 1) return; // guard against a bare "#"
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight() + 1;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* -----------------------------------------------------
     4. Active navbar link while scrolling
     ----------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const setActiveLink = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  const activeLinkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  }, {
    // Trigger once a section occupies the middle band of the viewport
    rootMargin: '-40% 0px -50% 0px',
    threshold: 0
  });

  sections.forEach(section => activeLinkObserver.observe(section));

  /* -----------------------------------------------------
     5. Scroll reveal animations — fade + slide up, once only
     ----------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // animate only once
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* -----------------------------------------------------
     6. Animated counters — count up when stats enter view
     ----------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600; // ms
    let startTime = null;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out for a natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);

      el.textContent = value + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    };

    requestAnimationFrame(step);
  };

  const statsSection = document.getElementById('stats');
  let statsAnimated = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statNumbers.forEach(animateCounter);
        statsObserver.unobserve(statsSection);
      }
    });
  }, { threshold: 0.4 });

  if (statsSection) {
    if (prefersReducedMotion) {
      statNumbers.forEach(el => {
        el.textContent = el.dataset.target + (el.dataset.suffix || '');
      });
    } else {
      statsObserver.observe(statsSection);
    }
  }

  /* -----------------------------------------------------
     7. Back-to-top button
     ----------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');

  const handleBackToTopVisibility = () => {
    backToTop.classList.toggle('is-visible', window.scrollY > 500);
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* -----------------------------------------------------
     Scroll listener — throttled with requestAnimationFrame
     to avoid layout thrashing from multiple scroll handlers.
     ----------------------------------------------------- */
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleNavbarScroll();
        handleBackToTopVisibility();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Run once on load in case the page is refreshed mid-scroll
  handleNavbarScroll();
  handleBackToTopVisibility();
});
