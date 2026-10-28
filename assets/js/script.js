/**
 * Urban Nest Property Solutions Ltd — Website Interactive Logic
 * Features: Sticky header, drawer navigation, scrollspy, scroll reveals,
 * interactive timeline, form validation & endpoint handling with mailto fallback.
 */
'use strict';

const CLIENT_EMAIL = 'urbannestpropertysolutionsltd@gmail.com';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dynamic year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // 2. Sticky Header scroll handling
  const header = document.getElementById('header');
  function handleScroll() {
    if (!header) return;
    const isScrolled = window.scrollY > 30;
    header.classList.toggle('scrolled', isScrolled);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 3. Mobile Navigation Drawer
  const menuToggle = document.getElementById('menu-toggle');
  const navigation = document.getElementById('navigation');

  function openMenu() {
    if (!menuToggle || !navigation) return;
    navigation.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
    updateFloatingContact();
  }

  function closeMenu(returnFocus = false) {
    if (!menuToggle || !navigation) return;
    navigation.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    if (returnFocus) menuToggle.focus();
    updateFloatingContact();
  }

  if (menuToggle && navigation) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navigation.classList.contains('open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navigation.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (navigation.classList.contains('open') && !header.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navigation.classList.contains('open')) {
        closeMenu(true);
      }
    });

    window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => {
      if (e.matches) closeMenu();
    });
  }

  // 4. Scrollspy for Active Navigation Link
  const navLinks = document.querySelectorAll('#navigation a[href^="#"]');
  const sections = [];
  navLinks.forEach((link) => {
    const id = link.getAttribute('href');
    if (id && id.length > 1) {
      const el = document.querySelector(id);
      if (el) sections.push({ id, link, el });
    }
  });

  function getElementDocTop(el) {
    return el.getBoundingClientRect().top + window.scrollY;
  }

  function updateActiveNav() {
    const scrollPos = window.scrollY + 180;
    let currentId = '';
    for (let i = sections.length - 1; i >= 0; i--) {
      const { id, el } = sections[i];
      if (getElementDocTop(el) <= scrollPos) {
        currentId = id;
        break;
      }
    }
    navLinks.forEach((link) => {
      if (link.getAttribute('href') === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();

  // 5. Scroll Reveals via IntersectionObserver
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      revealObserver.observe(el);
    });

    // Ethical standards checkmarks trigger
    const checksList = document.getElementById('checks');
    if (checksList) {
      const checksObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              checksList.classList.add('in');
              checksObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      checksObserver.observe(checksList);
    }
  } else {
    // Reveal everything immediately if reduced motion is requested
    document.querySelectorAll('[data-reveal], #checks').forEach((el) => el.classList.add('in'));
  }

  // 6. Timeline progress bar & step illumination on scroll
  const timeline = document.getElementById('timeline');
  const steps = document.querySelectorAll('.step');
  function updateTimeline() {
    if (!timeline || steps.length === 0) return;
    const rect = timeline.getBoundingClientRect();
    const windowH = window.innerHeight;

    // Calculate progress as timeline moves through viewport
    const start = windowH * 0.75;
    const end = windowH * 0.25;
    let progress = (start - rect.top) / (rect.height + (start - end));
    progress = Math.max(0, Math.min(1, progress));
    timeline.style.setProperty('--p', progress.toFixed(3));

    steps.forEach((step) => {
      const sRect = step.getBoundingClientRect();
      const isLit = sRect.top < windowH * 0.65;
      step.classList.toggle('lit', isLit);
    });
  }
  window.addEventListener('scroll', updateTimeline, { passive: true });
  updateTimeline();

  // 7. Pre-fill enquiry form from service/property/requirement action cards
  const roleSelect = document.getElementById('role');
  const messageArea = document.getElementById('message');
  const locationInput = document.getElementById('location');

  document.querySelectorAll('[data-enquiry]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const enquiryRole = btn.dataset.enquiry;
      const topicVal = btn.dataset.topic || '';
      const locVal = btn.dataset.location || '';

      if (roleSelect && enquiryRole) {
        let found = false;
        for (let opt of roleSelect.options) {
          if (opt.value.toLowerCase().includes(enquiryRole.toLowerCase()) || 
              enquiryRole.toLowerCase().includes(opt.value.toLowerCase())) {
            roleSelect.value = opt.value;
            found = true;
            break;
          }
        }
        if (!found) roleSelect.value = enquiryRole;
      }

      if (locationInput && locVal && !locationInput.value) {
        locationInput.value = locVal;
      }

      if (messageArea && topicVal) {
        messageArea.value = `Hello Urban Nest,\n\nI would like to discuss: ${topicVal}.\n\n`;
      }
    });
  });

  // 8. Form Validation & Submission with Mailto Fallback
  const form = document.getElementById('enquiry-form');
  const formStatus = document.getElementById('form-status');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = nameInput ? nameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const roleVal = roleSelect ? roleSelect.value : '';
      const locVal = locationInput ? locationInput.value.trim() : '';
      const msgVal = messageArea ? messageArea.value.trim() : '';

      if (!nameVal) {
        if (nameInput) {
          nameInput.setCustomValidity('Please enter your full name.');
          nameInput.reportValidity();
        }
        return;
      }

      if (!emailVal || !emailVal.includes('@')) {
        if (emailInput) {
          emailInput.setCustomValidity('Please enter a valid email address.');
          emailInput.reportValidity();
        }
        return;
      }

      if (!roleVal) {
        if (roleSelect) {
          roleSelect.setCustomValidity('Please select what best describes you.');
          roleSelect.reportValidity();
        }
        return;
      }

      // Check whether a production endpoint is configured
      const action = form.getAttribute('action') || '';
      const isEndpointConfigured = action.length > 5 && !action.includes('TODO') && !action.startsWith('#');

      if (isEndpointConfigured) {
        // Send to configured endpoint
        const formData = new FormData(form);
        const submitBtn = document.getElementById('enquiry-submit');
        if (submitBtn) submitBtn.disabled = true;

        fetch(action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        })
        .then((res) => {
          if (res.ok) {
            form.reset();
            if (formStatus) {
              formStatus.className = 'form-status success';
              formStatus.textContent = 'Thank you! Your message has been sent to Urban Nest. We will get back to you shortly.';
            }
          } else {
            throw new Error('Form response not ok');
          }
        })
        .catch(() => {
          fallbackMailto(nameVal, emailVal, roleVal, locVal, msgVal);
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
      } else {
        // Fallback to mailto link
        fallbackMailto(nameVal, emailVal, roleVal, locVal, msgVal);
      }
    });
  }

  function fallbackMailto(name, email, role, loc, message) {
    const subject = encodeURIComponent(`Urban Nest Website Enquiry: ${role} (${name})`);
    const bodyText = [
      `Name: ${name}`,
      `Email: ${email}`,
      `I am a: ${role}`,
      `Preferred Location: ${loc || 'Not specified'}`,
      '',
      'Requirements / Message:',
      message || 'None provided'
    ].join('\n');

    const mailtoUri = `mailto:${CLIENT_EMAIL}?subject=${subject}&body=${encodeURIComponent(bodyText)}`;

    if (formStatus) {
      formStatus.className = 'form-status success';
      formStatus.innerHTML = `Opening your email application to send directly to <strong>${CLIENT_EMAIL}</strong>... If it didn't open automatically, <a href="${mailtoUri}" style="text-decoration:underline; font-weight:600;">click here to email us</a>.`;
    }

    window.location.href = mailtoUri;
  }

  // 9. Floating Contact button visibility logic
  const contactFloat = document.getElementById('quick-contact-float');
  const contactSection = document.getElementById('contact');

  function updateFloatingContact() {
    if (!contactFloat || !contactSection) return;
    const cRect = contactSection.getBoundingClientRect();
    const inContact = cRect.top < window.innerHeight && cRect.bottom > 0;
    const isNavOpen = navigation && navigation.classList.contains('open');

    if (inContact || isNavOpen) {
      contactFloat.style.opacity = '0';
      contactFloat.style.pointerEvents = 'none';
    } else {
      contactFloat.style.opacity = '1';
      contactFloat.style.pointerEvents = 'auto';
    }
  }
  window.addEventListener('scroll', updateFloatingContact, { passive: true });
  window.addEventListener('resize', updateFloatingContact);
  updateFloatingContact();

  // 10. Robust Image Error Handling & Fallback
  document.querySelectorAll('img').forEach((img) => {
    function markFallback() {
      img.classList.add('is-broken');
      const parent = img.closest('.prop, .insight-media, .hero-frame, .about-media, .founder-media');
      if (parent) parent.classList.add('img-fallback');
    }
    img.addEventListener('error', markFallback);
    if (img.complete && img.naturalWidth === 0) {
      markFallback();
    }
  });

  // 11. Smooth Back to Top
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
