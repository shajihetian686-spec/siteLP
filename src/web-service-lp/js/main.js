// ハンバーガーメニュー（右スライドイン）
const ham      = document.querySelector('.header__hamburger');
const drawer   = document.getElementById('navDrawer');
const overlay  = document.getElementById('navOverlay');

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

// ドロワー内リンクをクリックで閉じる
document.querySelectorAll('.nav-drawer__links a, .nav-drawer__cta').forEach(a => {
  a.addEventListener('click', closeMenu);
});

// ヘッダースクロール影
window.addEventListener('scroll', () => {
  document.querySelector('.header').style.boxShadow =
    window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,.08)' : 'none';
});

// スクロール連動アニメーション（.reveal → .is-visible）
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));