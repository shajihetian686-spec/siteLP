const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

(function setupLoader() {
  const loader = document.getElementById('pageLoader');
  const textEl = document.getElementById('loaderText');
  const seenKey = 'sht-website-seen';
  let seen = false;
  try { seen = localStorage.getItem(seenKey) === '1'; } catch (e) {}

  function ready() {
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    requestAnimationFrame(() => setupReveals());
  }

  if (!loader || !textEl || seen) {
    if (loader) loader.remove();
    ready();
    return;
  }

  const source = 'Webサイト、ただいま調整中…';
  const started = Date.now();
  let typed = false;
  let loaded = document.readyState === 'complete';
  let hidden = false;
  const caret = document.createElement('span');
  caret.className = 'loader__caret';

  function render(text) {
    textEl.textContent = text;
    textEl.appendChild(caret);
  }

  function hide() {
    if (hidden) return;
    hidden = true;
    try { localStorage.setItem(seenKey, '1'); } catch (e) {}
    const wait = Math.max(420, 2000 - (Date.now() - started));
    setTimeout(() => {
      loader.classList.add('is-done');
      ready();
      loader.addEventListener('transitionend', (e) => {
        if (e.target === loader) loader.remove();
      });
    }, wait);
  }

  function maybeHide() {
    if (typed && loaded) hide();
  }

  window.addEventListener('load', () => {
    loaded = true;
    maybeHide();
  });

  function finishType() {
    render(source);
    typed = true;
    maybeHide();
  }

  if (reduceMotion) {
    finishType();
    return;
  }

  let i = 0;
  function tick() {
    i += 1;
    render(source.slice(0, i));
    if (i < source.length) {
      setTimeout(tick, 42);
    } else {
      setTimeout(finishType, 280);
    }
  }
  tick();

  setTimeout(() => {
    if (!loader.classList.contains('is-done')) {
      typed = true;
      loaded = true;
      hide();
    }
  }, 7000);
})();

const ham = document.querySelector('.header__hamburger');
const drawer = document.getElementById('navDrawer');
const overlay = document.getElementById('navOverlay');

function openMenu() {
  ham.classList.add('is-open');
  drawer.classList.add('is-open');
  overlay.style.display = 'block';
  requestAnimationFrame(() => overlay.classList.add('is-open'));
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  ham.classList.remove('is-open');
  drawer.classList.remove('is-open');
  overlay.classList.remove('is-open');
  overlay.addEventListener('transitionend', () => {
    overlay.style.display = 'none';
  }, { once: true });
  document.body.style.overflow = '';
}

if (ham) {
  ham.addEventListener('click', () => {
    ham.classList.contains('is-open') ? closeMenu() : openMenu();
  });
}
if (overlay) overlay.addEventListener('click', closeMenu);
const navClose = document.getElementById('navClose');
if (navClose) navClose.addEventListener('click', closeMenu);

document.querySelectorAll('.nav-drawer__links a, .nav-drawer__cta').forEach((a) => {
  a.addEventListener('click', closeMenu);
});

const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 10);
}, { passive: true });

const revealTargets = document.querySelectorAll(
  '.reveal, .media-reveal, .hero__h1, .sec-title, .contact__title'
);

let revealsStarted = false;
function setupReveals() {
  if (revealsStarted) return;
  revealsStarted = true;

  if (reduceMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  revealTargets.forEach((el) => {
    if (el.dataset.delay) {
      el.style.transitionDelay = `${el.dataset.delay}ms`;
    }
  });

  const show = (el) => el.classList.add('is-visible');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      show(entry.target);
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.01, rootMargin: '80px 0px 80px 0px' });

  function start() {
    revealTargets.forEach((el) => {
      revealObserver.observe(el);
      const rect = el.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        show(el);
        revealObserver.unobserve(el);
      }
    });
  }

  requestAnimationFrame(() => requestAnimationFrame(start));
}

const parallaxEls = reduceMotion
  ? []
  : Array.from(document.querySelectorAll('[data-parallax]'));

let ticking = false;

function updateParallax() {
  const viewMid = window.innerHeight * 0.5;
  parallaxEls.forEach((el) => {
    const speed = parseFloat(el.dataset.parallax) || 0.1;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const offset = (rect.top + rect.height * 0.5 - viewMid) * speed;
    el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
  });
  ticking = false;
}

function requestParallax() {
  if (ticking || !parallaxEls.length) return;
  ticking = true;
  requestAnimationFrame(updateParallax);
}

if (parallaxEls.length) {
  window.addEventListener('scroll', requestParallax, { passive: true });
  window.addEventListener('resize', requestParallax);
  requestParallax();
}

const pagetop = document.getElementById('pagetop');
window.addEventListener('scroll', () => {
  if (!pagetop) return;
  pagetop.classList.toggle('is-visible', window.scrollY > 300);
}, { passive: true });

if (pagetop) {
  pagetop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

function setupWorksMarquee() {
  const track = document.querySelector('.works__track');
  const group = track && track.querySelector('.works__group');
  const marquee = document.querySelector('.works__marquee');
  if (!track || !group || !marquee) return;

  if (reduceMotion) {
    marquee.classList.add('is-static');
    return;
  }

  const speed = 78;
  let offset = 0;
  let last = 0;

  function gapSize() {
    return parseFloat(getComputedStyle(group).gap) || 0;
  }

  function tick(now) {
    if (!last) last = now;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    offset += speed * dt;

    const first = group.firstElementChild;
    if (first) {
      const step = first.offsetWidth + gapSize();
      if (step > 0 && offset >= step) {
        offset -= step;
        group.appendChild(first);
      }
    }

    group.style.marginLeft = `-${offset.toFixed(2)}px`;
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

setupWorksMarquee();

const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactFormStatus');
const mailConfirm = document.getElementById('mailConfirm');

if (contactForm && contactStatus) {
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const confirmSend = document.getElementById('mailConfirmSend');
  const confirmCancel = document.getElementById('mailConfirmCancel');
  const blank = '（未入力）';

  function fieldValue(name) {
    const el = contactForm.elements[name];
    return el ? String(el.value).trim() : '';
  }

  function openConfirm() {
    if (!mailConfirm) return false;
    const map = {
      name: fieldValue('name'),
      company: fieldValue('company') || blank,
      email: fieldValue('email'),
      tel: fieldValue('tel') || blank,
      message: fieldValue('message'),
    };
    mailConfirm.querySelectorAll('[data-confirm]').forEach((el) => {
      el.textContent = map[el.getAttribute('data-confirm')] || blank;
    });
    mailConfirm.hidden = false;
    document.body.style.overflow = 'hidden';
    if (confirmSend) confirmSend.focus();
    return true;
  }

  function closeConfirm() {
    if (!mailConfirm) return;
    mailConfirm.hidden = true;
    document.body.style.overflow = '';
    if (submitBtn) submitBtn.focus();
  }

  async function sendForm() {
    contactStatus.hidden = true;
    contactStatus.classList.remove('is-error');
    if (submitBtn) submitBtn.disabled = true;
    if (confirmSend) confirmSend.disabled = true;

    try {
      const res = await fetch(contactForm.action || 'mail.php', {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' },
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.ok) {
        throw new Error('send');
      }

      contactStatus.textContent = '送信しました。ご入力のメールアドレスに受付完了のメールをお送りしています。担当者より改めてご連絡いたします。';
      contactForm.reset();
    } catch (_) {
      contactStatus.classList.add('is-error');
      contactStatus.textContent = '送信できませんでした。時間をおいて再度お試しいただくか、0948-23-5156 までお電話ください。';
    } finally {
      closeConfirm();
      contactStatus.hidden = false;
      if (submitBtn) submitBtn.disabled = false;
      if (confirmSend) confirmSend.disabled = false;
    }
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    contactStatus.hidden = true;
    contactStatus.classList.remove('is-error');

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    if (!openConfirm()) sendForm();
  });

  if (confirmSend) {
    confirmSend.addEventListener('click', () => { sendForm(); });
  }
  if (confirmCancel) {
    confirmCancel.addEventListener('click', () => { closeConfirm(); });
  }
  if (mailConfirm) {
    mailConfirm.addEventListener('click', (e) => {
      if (e.target.closest('[data-mail-confirm-close]')) closeConfirm();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mailConfirm.hidden) closeConfirm();
    });
  }
}
