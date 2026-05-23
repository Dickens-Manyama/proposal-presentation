document.addEventListener('DOMContentLoaded', () => {
  const mode = document.getElementById('presentation-mode');
  if (!mode) return;

  const container = mode.querySelector('.presentation-slides');
  const progressBar = mode.querySelector('.presentation-progress span');
  const counter = mode.querySelector('.presentation-counter');
  let current = 0;
  let autoplayTimer = null;
  let autoplayOn = false;

  const slides = buildSlidesFromProposal();
  slides.forEach((slide, i) => {
    const el = document.createElement('div');
    el.className = 'presentation-slide' + (i === 0 ? ' is-current' : '');
    el.innerHTML = slide.html;
    container.appendChild(el);
  });

  const slideEls = () => [...container.querySelectorAll('.presentation-slide')];

  function update() {
    slideEls().forEach((s, i) => s.classList.toggle('is-current', i === current));
    const total = slideEls().length;
    progressBar.style.width = `${((current + 1) / total) * 100}%`;
    counter.textContent = `${current + 1} / ${total}`;
  }

  function next() {
    current = Math.min(current + 1, slideEls().length - 1);
    update();
  }

  function prev() {
    current = Math.max(current - 1, 0);
    update();
  }

  function openPresentation() {
    current = 0;
    update();
    mode.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  }

  function closePresentation() {
    mode.classList.remove('is-active');
    document.body.style.overflow = '';
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayOn = false;
  }

  document.getElementById('btn-presentation')?.addEventListener('click', openPresentation);
  mode.querySelector('.presentation-close')?.addEventListener('click', closePresentation);
  mode.querySelector('.presentation-prev')?.addEventListener('click', prev);
  mode.querySelector('.presentation-next')?.addEventListener('click', next);
  mode.querySelector('.presentation-autoplay')?.addEventListener('click', () => {
    if (autoplayOn) {
      clearInterval(autoplayTimer);
      autoplayOn = false;
      return;
    }
    autoplayOn = true;
    autoplayTimer = setInterval(() => {
      if (current >= slideEls().length - 1) current = 0;
      else current += 1;
      update();
    }, 8000);
  });

  document.addEventListener('keydown', (e) => {
    if (!mode.classList.contains('is-active')) return;
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      next();
    }
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'Escape') closePresentation();
  });

  update();
});

function buildSlidesFromProposal() {
  const sections = [...document.querySelectorAll('.proposal-section[data-slide]')].sort(
    (a, b) => Number(a.dataset.section || 0) - Number(b.dataset.section || 0)
  );

  return sections.map((section) => {
    const title = section.dataset.slide;
    const heading = section.querySelector('.section-heading h2, .proposal-title, h1')?.textContent?.trim() || title;
    const lead = section.querySelector('.lead-copy, .section-heading > p, .conclusion-text')?.textContent?.trim();
    const listItems = [...section.querySelectorAll('.establishment-list li, .mission-card li, .team-card h3, .team-position, .team-card p, .objective-card p, .timeline-item strong, .timeline-col li, .glass-card li, .industrial-card h3, .impact-card, .growth-card, .revenue-card p, .investor-card h3')]
      .map((el) => el.textContent.trim())
      .filter(Boolean);

    const products = [...section.querySelectorAll('.product-showcase-card')].map((card) => {
      const name = card.querySelector('h3')?.textContent?.trim();
      const desc = card.querySelector('.product-copy p')?.textContent?.trim();
      return desc ? `${name}: ${desc}` : name;
    }).filter(Boolean);

    let body = '';
    if (lead) body += `<p>${lead}</p>`;
    const bullets = products.length ? products : listItems;
    if (bullets.length) body += `<ul>${bullets.map((b) => `<li>${b}</li>`).join('')}</ul>`;

    return {
      html: `<span class="eyebrow gold-accent">${title}</span><h2>${heading}</h2>${body || ''}`
    };
  });
}
