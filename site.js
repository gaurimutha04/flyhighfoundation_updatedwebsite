/* ============================================
   SITE INTERACTIONS
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  // Scroll-reveal for sections
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach((el) => observer.observe(el));

    // Safety net: a very fast flick-scroll (common on touchscreens) can
    // occasionally skip a section past the observer without it ever
    // registering as intersecting. If a section sits well above the
    // current scroll position but never got revealed, show it anyway.
    function catchMissedReveals() {
      revealEls.forEach((el) => {
        if (!el.classList.contains('is-visible') && el.getBoundingClientRect().bottom < 0) {
          el.classList.add('is-visible');
        }
      });
    }
    window.addEventListener('scroll', catchMissedReveals, { passive: true });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Pencil underline — redraws every time it scrolls into view (not just once)
  const pencilEls = document.querySelectorAll('.pencil-underline');
  if ('IntersectionObserver' in window && pencilEls.length) {
    const pencilObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('pencil-drawn', entry.isIntersecting);
      });
    }, { threshold: 0.5 });
    pencilEls.forEach((el) => pencilObserver.observe(el));
  } else {
    pencilEls.forEach((el) => el.classList.add('pencil-drawn'));
  }

  // Documentary video — click to play inline
  const videoFrame = document.querySelector('.video-frame');
  if (videoFrame) {
    videoFrame.addEventListener('click', function () {
      const videoId = videoFrame.getAttribute('data-video-id');
      if (!videoId) return;
      videoFrame.innerHTML =
        '<iframe src="https://www.youtube.com/embed/' + videoId +
        '?autoplay=1" title="Fly High Foundation documentary" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    });
  }

  // Footer media marquee — generates placeholder press cards and duplicates
  // the set once so the continuous scroll loops seamlessly.
  const marqueeTrack = document.getElementById('media-marquee-track');
  if (marqueeTrack && marqueeTrack.children.length === 0) {
    const placeholderIcon = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="14" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M3 15l5-4 4 3 4-5 5 4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="8" cy="8.5" r="1.4" fill="currentColor"/></svg>';

    function buildSet() {
      const frag = document.createDocumentFragment();
      for (let i = 1; i <= 20; i++) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'media-logo-card';
        card.setAttribute('data-media-label', 'Media feature ' + i);
        // data-media-img can be set per card once real press images are added,
        // e.g. card.setAttribute('data-media-img', 'images/press/feature-' + i + '.jpg');
        card.innerHTML = placeholderIcon + '<span>Media feature ' + i + '</span>';
        frag.appendChild(card);
      }
      return frag;
    }

    // one set to display, one duplicate set immediately after for the loop
    marqueeTrack.appendChild(buildSet());
    marqueeTrack.appendChild(buildSet());
  }

  // Media preview modal — opens when any marquee card is clicked
  const mediaModal = document.getElementById('media-modal');
  const mediaModalBackdrop = document.getElementById('media-modal-backdrop');
  const mediaModalClose = document.getElementById('media-modal-close');
  const mediaModalBody = document.getElementById('media-modal-body');

  function openMediaModal(card) {
    if (!mediaModal || !mediaModalBody) return;
    const imgSrc = card.getAttribute('data-media-img');
    const label = card.getAttribute('data-media-label') || 'Media feature';

    if (imgSrc) {
      mediaModalBody.innerHTML = '<img src="' + imgSrc + '" alt="' + label + '">';
    } else {
      // no real image attached yet — show the placeholder icon + label
      const placeholderIcon = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="14" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M3 15l5-4 4 3 4-5 5 4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="8" cy="8.5" r="1.4" fill="currentColor"/></svg>';
      mediaModalBody.innerHTML = placeholderIcon + '<span class="media-modal-caption">' + label + '</span>';
    }

    mediaModal.classList.add('is-open');
    mediaModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMediaModal() {
    if (!mediaModal) return;
    mediaModal.classList.remove('is-open');
    mediaModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (marqueeTrack) {
    marqueeTrack.addEventListener('click', function (e) {
      const card = e.target.closest('.media-logo-card');
      if (card) openMediaModal(card);
    });
  }

  if (mediaModalBackdrop) mediaModalBackdrop.addEventListener('click', closeMediaModal);
  if (mediaModalClose) mediaModalClose.addEventListener('click', closeMediaModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMediaModal();
  });

  // Mission section confetti — pencils, books, rulers and friends tumble
  // down in 3D, colorful bursts every time the section scrolls into view.
  const confettiContainer = document.getElementById('mission-confetti');
  if (confettiContainer) {
    const icons = [
      // pencil
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21l1.5-5.5L15.5 4.5a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L8.5 19.5 3 21z" fill="currentColor" opacity="0.85"/><path d="M3 21l1.5-5.5L15.5 4.5a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L8.5 19.5 3 21z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M13.5 6.5l4 4" stroke="currentColor" stroke-width="1.6"/></svg>',
      // open book
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6.5c-1.6-1.2-4-1.5-6.5-1V17c2.5-.5 4.9-.2 6.5 1 1.6-1.2 4-1.5 6.5-1V5.5c-2.5-.5-4.9-.2-6.5 1z" fill="currentColor" opacity="0.8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 6.5V18" stroke="currentColor" stroke-width="1.6"/></svg>',
      // ruler
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="9" width="18" height="6" rx="1" fill="currentColor" opacity="0.8" stroke="currentColor" stroke-width="1.6"/><path d="M6 9v2.5M9.5 9v3.5M13 9v2.5M16.5 9v3.5" stroke="currentColor" stroke-width="1.4"/></svg>',
      // eraser
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 16l7-7a2 2 0 0 1 2.8 0l4.2 4.2a2 2 0 0 1 0 2.8L13 21H7l-3-3z" fill="currentColor" opacity="0.8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M4 16h10" stroke="currentColor" stroke-width="1.4"/></svg>',
      // graduation cap
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 5L2 9.5 12 14l10-4.5L12 5z" fill="currentColor" opacity="0.85" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M6 11.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4.5" stroke="currentColor" stroke-width="1.6"/></svg>',
      // paper plane
      '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12l18-8-7 18-3-7-8-3z" fill="currentColor" opacity="0.8" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
    ];

    // a real spread of colors, not just one accent tone
    const COLORS = ['#e0703f', '#3f8f5f', '#4d7bc4', '#d6539a', '#e8b13c', '#5fa8a0', '#a85fd6'];

    function spawnConfetti() {
      confettiContainer.innerHTML = '';
      const PIECE_COUNT = 30;
      for (let i = 0; i < PIECE_COUNT; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.innerHTML = icons[i % icons.length];
        piece.style.color = COLORS[i % COLORS.length];

        const size = 22 + Math.random() * 16; // 22-38px
        const startLeft = Math.random() * 100; // % across the section
        const drift = (Math.random() - 0.5) * 180; // px horizontal drift while falling
        const spinZ = 160 + Math.random() * 260; // deg flat rotation
        const duration = 3.4 + Math.random() * 2; // seconds
        const delay = Math.random() * 1.4; // staggered start

        piece.style.left = startLeft + '%';
        piece.style.width = size + 'px';
        piece.style.height = size + 'px';
        piece.style.setProperty('--drift', drift + 'px');
        piece.style.setProperty('--spin', spinZ + 'deg');
        piece.style.animationDuration = duration + 's';
        piece.style.animationDelay = delay + 's';

        confettiContainer.appendChild(piece);
      }
      // restart the fall animation on this fresh batch
      confettiContainer.classList.remove('is-falling');
      // force a reflow so the browser registers the class removal before re-adding it
      void confettiContainer.offsetWidth;
      confettiContainer.classList.add('is-falling');
    }

    if ('IntersectionObserver' in window) {
      const missionSection = document.querySelector('.mission-section');
      const confettiObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            spawnConfetti();
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -60% 0px' });
      confettiObserver.observe(missionSection || confettiContainer);
    } else {
      spawnConfetti();
    }
  }
});
