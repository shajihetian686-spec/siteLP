document.addEventListener('DOMContentLoaded', function () {

  // Hamburger menu toggle
  var hamburger = document.querySelector('.header__hamburger');
  var nav = document.querySelector('.header__nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      hamburger.classList.toggle('is-active');
    });

    nav.querySelectorAll('.header__nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        hamburger.classList.remove('is-active');
      });
    });
  }

  // Header shadow on scroll
  var header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        header.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      } else {
        header.style.boxShadow = 'none';
      }
    });
  }

  // Scroll animation (Intersection Observer)
  var animateElements = document.querySelectorAll(
    '.concerns__card, .reasons__sub-card, .works__gallery-card, ' +
    '.service__sub-card, .flow__step, .target__item'
  );

  if (animateElements.length > 0 && 'IntersectionObserver' in window) {
    animateElements.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    animateElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Works tab filtering (placeholder)
  var tabs = document.querySelectorAll('.works__tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('works__tab--active'); });
      tab.classList.add('works__tab--active');
    });
  });

});
