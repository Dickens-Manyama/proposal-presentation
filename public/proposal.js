document.addEventListener('DOMContentLoaded', () => {
  initLightbox();
  initExportButtons();
  initParallax();
});

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const img = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      img.src = btn.dataset.lightbox;
      img.alt = btn.dataset.alt || 'Product image';
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    img.src = '';
  };

  closeBtn?.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) close();
  });
}

function initExportButtons() {
  document.querySelectorAll('[data-export]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.export;
      window.location.href = `/api/export/${format}`;
    });
  });
}

function initParallax() {
  const heroBg = document.querySelector('.proposal-hero-bg');
  if (!heroBg || typeof gsap === 'undefined') return;

  gsap.to(heroBg, {
    yPercent: 12,
    ease: 'none',
    scrollTrigger: {
      trigger: '#proposal-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });
}
