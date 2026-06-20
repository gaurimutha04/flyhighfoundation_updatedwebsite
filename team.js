/* ============================================
   TEAM PAGE — data, SEO grid, card modal,
   interactive intro headline
   ============================================ */

(function () {
  // Single source of truth for every team member. Used to build the
  // crawlable grid below (real text, real headings) and to look up
  // which full-size card image to show in the modal.
  const TEAM = [
    { batch: 'Founding Team', name: 'Gauri Mutha', role: 'Founder', fact: 'I am pursuing three degrees!', memory: 'Late night workdays for the Annual events & celebrating my birthday with the students!', photo: 'images/team/gauri-mutha.jpg', card: 'images/team-cards/gauri-mutha-card.png' },
    { batch: 'Founding Team', name: 'Swayam Shetiya', role: 'Founding Teacher', fact: 'I started driving in fifth grade!', memory: 'School visits for awareness campaigns and of course teaching the curious students!', photo: 'images/team/swayam-shetiya.jpg', card: 'images/team-cards/swayam-shetiya-card.png' },
    { batch: 'Founding Team', name: 'Ankush Thokal', role: 'Senior Teacher', fact: "I've got a solid smash in badminton.", memory: 'Bringing smiles to kids during our cultural event and teaching them new things.', photo: 'images/team/ankush-thokal.jpg', card: 'images/team-cards/ankush-thokal-card.png' },
    { batch: 'Founding Team', name: 'Anchal Munot', role: 'Senior Teacher', fact: 'I can stay calm even when things get chaotic!', memory: 'Making decorations, running around the city, and then watching it all come together in our events — seeing our hard work pay off fills me with pride and joy.', photo: 'images/team/anchal-munot.jpg', card: 'images/team-cards/anchal-munot-card.png' },
    { batch: 'Founding Team', name: 'Diya Poptani', role: 'Senior Teacher', fact: 'I started driving in fifth grade!', memory: 'Fly has honestly been the best part of my life. Seeing children filled with enthusiasm not just for their studies, but also for extracurricular activities, has been truly inspiring.', photo: 'images/team/diya-poptani.jpg', card: 'images/team-cards/diya-poptani-card.png' },

    { batch: 'Batch 2', name: 'Radha Mutha', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/radha-mutha.jpg', card: 'images/team-cards/radha-mutha-card.png' },
    { batch: 'Batch 2', name: 'Yuga Mutha', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/yuga-mutha.jpg', card: 'images/team-cards/yuga-mutha-card.png' },
    { batch: 'Batch 2', name: 'Ayush Mutha', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/ayush-mutha.jpg', card: 'images/team-cards/ayush-mutha-card.png' },
    { batch: 'Batch 2', name: 'Sujal Gandhi', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/sujal-gandhi.jpg', card: 'images/team-cards/sujal-gandhi-card.png' },
    { batch: 'Batch 2', name: 'Aryan Munot', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/aryan-munot.jpg', card: 'images/team-cards/aryan-munot-card.png' },
    { batch: 'Batch 2', name: 'Raj Mutha', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/raj-mutha.jpg', card: 'images/team-cards/raj-mutha-card.png' },
    { batch: 'Batch 2', name: 'Divyanshri Munot', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/divyanshri-munot.jpg', card: 'images/team-cards/divyanshri-munot-card.png' },

    { batch: 'Batch 3', name: 'Gunjan Mutha', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/gunjan-mutha.jpg', card: 'images/team-cards/gunjan-mutha-card.png' },
    { batch: 'Batch 3', name: 'Urvee Pitale', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/urvee-pitale.jpg', card: 'images/team-cards/urvee-pitale-card.png' },
    { batch: 'Batch 3', name: 'Prathamesh Kataria', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/prathamesh-kataria.jpg', card: 'images/team-cards/prathamesh-kataria-card.png' },
    { batch: 'Batch 3', name: 'Riddhi', role: 'Teacher', fact: 'Ask me about my favourite subject to teach!', memory: 'Every small breakthrough moment with a student.', photo: 'images/team/riddhi.jpg', card: 'images/team-cards/riddhi-card.png' }
  ];

  // ---------- Build the team grid (real, crawlable HTML) ----------
  const gridContainer = document.getElementById('team-grid-content');
  if (gridContainer) {
    const batches = [];
    TEAM.forEach((p) => { if (!batches.includes(p.batch)) batches.push(p.batch); });

    batches.forEach((batchName) => {
      const heading = document.createElement('h2');
      heading.className = 'team-batch-heading';
      heading.textContent = batchName;
      gridContainer.appendChild(heading);

      const grid = document.createElement('div');
      grid.className = 'team-grid';

      TEAM.filter((p) => p.batch === batchName).forEach((person) => {
        const card = document.createElement('article');
        card.className = 'team-grid-card';
        card.setAttribute('data-card-img', person.card);
        card.setAttribute('data-card-name', person.name);
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', 'View ' + person.name + '\u2019s full scrapbook card');
        card.innerHTML =
          '<img class="team-grid-card-scrapbook" src="' + person.card + '" alt="' + person.name + '\u2019s Fly High Foundation scrapbook card" loading="lazy">' +
          '<h3>' + person.name + '</h3>';
        grid.appendChild(card);
      });

      gridContainer.appendChild(grid);
    });
  }

  // ---------- JSON-LD structured data for SEO ----------
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fly High Foundation',
    url: 'https://flyhighfoundation.org/team.html',
    member: TEAM.map((person) => ({
      '@type': 'Person',
      name: person.name,
      jobTitle: person.role,
      worksFor: { '@type': 'Organization', name: 'Fly High Foundation' }
    }))
  };
  const ldScript = document.createElement('script');
  ldScript.type = 'application/ld+json';
  ldScript.textContent = JSON.stringify(jsonLd);
  document.head.appendChild(ldScript);

  // ---------- Card preview modal ----------
  const modal = document.getElementById('team-card-modal');
  const modalBackdrop = document.getElementById('team-card-modal-backdrop');
  const modalClose = document.getElementById('team-card-modal-close');
  const modalImg = document.getElementById('team-card-modal-img');

  function openCardModal(src, name) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modalImg.alt = name + '\u2019s Fly High Foundation scrapbook card';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCardModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (gridContainer) {
    gridContainer.addEventListener('click', function (e) {
      const card = e.target.closest('.team-grid-card');
      if (card) openCardModal(card.getAttribute('data-card-img'), card.getAttribute('data-card-name'));
    });
    gridContainer.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.team-grid-card');
        if (card) { e.preventDefault(); openCardModal(card.getAttribute('data-card-img'), card.getAttribute('data-card-name')); }
      }
    });
  }

  if (modalBackdrop) modalBackdrop.addEventListener('click', closeCardModal);
  if (modalClose) modalClose.addEventListener('click', closeCardModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeCardModal();
  });


  // ---------- Paparazzi flash intro ----------
  // Camera flashes pop in and out around the headline at random
  // positions and times, and each flash briefly lights up the one or
  // two letters nearest it — like paparazzi snapping photos as the
  // text gets caught in the glare. The flash layer is absolutely
  // positioned over the text and never changes the section's size,
  // no matter how many flashes are running.
  const flashLayer = document.getElementById('team-flash-layer');
  const introHeading = document.getElementById('team-intro-heading');
  const introSection = document.getElementById('team-intro-section');

  // Wrap every letter of the headline in its own span (once) so each
  // one can be lit individually when a flash pops near it.
  let letterSpans = [];
  if (introHeading && !introHeading.dataset.wrapped) {
    const text = introHeading.textContent;
    introHeading.innerHTML = text
      .split('')
      .map((ch) => (ch === ' ' ? ' ' : '<span class="team-intro-letter">' + ch + '</span>'))
      .join('');
    introHeading.dataset.wrapped = 'true';
  }
  if (introHeading) {
    letterSpans = Array.from(introHeading.querySelectorAll('.team-intro-letter'));
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let flashTimers = [];
  let flashesRunning = false;

  function clearFlashTimers() {
    flashTimers.forEach((t) => clearTimeout(t));
    flashTimers = [];
  }

  function popFlash() {
    if (!flashLayer || !letterSpans.length) return;

    // pick a random anchor letter and pop the flash near it, so the
    // lit-up letters and the visible flash always line up
    const anchorIndex = Math.floor(Math.random() * letterSpans.length);
    const anchorLetter = letterSpans[anchorIndex];
    const layerRect = flashLayer.getBoundingClientRect();
    const letterRect = anchorLetter.getBoundingClientRect();

    const flash = document.createElement('div');
    flash.className = 'team-flash';
    const flashX = letterRect.left - layerRect.left + letterRect.width / 2 - 35 + (Math.random() - 0.5) * 20;
    const flashY = letterRect.top - layerRect.top + letterRect.height / 2 - 35 + (Math.random() - 0.5) * 16;
    flash.style.left = flashX + 'px';
    flash.style.top = flashY + 'px';
    flashLayer.appendChild(flash);

    requestAnimationFrame(() => flash.classList.add('is-popping'));
    setTimeout(() => flash.remove(), 460);

    // light up the anchor letter and its immediate neighbor briefly
    const toLight = [anchorLetter, letterSpans[anchorIndex + 1]].filter(Boolean);
    toLight.forEach((letter) => letter.classList.add('is-lit'));
    setTimeout(() => toLight.forEach((letter) => letter.classList.remove('is-lit')), 300);
  }

  function scheduleChain() {
    if (!flashesRunning) return;
    const delay = 180 + Math.random() * 320; // faster cadence per chain
    const t = setTimeout(() => {
      popFlash();
      scheduleChain();
    }, delay);
    flashTimers.push(t);
  }

  const FLASH_CHAINS = 4; // multiple "photographers" firing independently, so several flashes overlap

  function startFlashes() {
    if (flashesRunning || reduceMotion) return;
    flashesRunning = true;
    for (let i = 0; i < FLASH_CHAINS; i++) {
      // stagger each chain's first pop so they don't all fire in sync
      const t = setTimeout(scheduleChain, i * 110);
      flashTimers.push(t);
    }
  }

  function stopFlashes() {
    flashesRunning = false;
    clearFlashTimers();
  }

  if (introSection && flashLayer && letterSpans.length && !reduceMotion) {
    if ('IntersectionObserver' in window) {
      const flashObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startFlashes();
          else stopFlashes();
        });
      }, { threshold: 0.3 });
      flashObserver.observe(introSection);
    } else {
      startFlashes();
    }
  }

  // ---------- Celebration confetti (both sides) ----------

  function launchCelebration() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
    document.body.appendChild(canvas);
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');

    const COLORS = ['#f0c14b','#ff6b6b','#4ecdc4','#45b7d1','#f7dc6f','#bb8fce','#82e0aa','#f0b27a','#ec407a','#42a5f5','#ffca28','#26a69a','#ff8a65','#ab47bc','#ef5350','#66bb6a','#ffd54f','#80cbc4'];
    const parts = [];
    const TOTAL = 600;

    for (let i = 0; i < TOTAL; i++) {
      const left = i % 2 === 0;
      const spd = 5 + Math.random() * 15;
      const ang = (-72 + Math.random() * 88) * Math.PI / 180; // -72° to +16°
      const sh = Math.random();
      parts.push({
        x: left ? -6 : W + 6,
        y: Math.random() * H,
        vx: Math.cos(ang) * spd * (left ? 1 : -1),
        vy: Math.sin(ang) * spd,
        color: COLORS[i % COLORS.length],
        w: 6 + Math.random() * 10,
        h: 4 + Math.random() * 7,
        type: sh < 0.55 ? 0 : sh < 0.82 ? 1 : 2, // 0=rect, 1=ellipse, 2=triangle
        rot: Math.random() * Math.PI * 2,
        rv: (Math.random() - 0.5) * 0.22,
        g: 0.1 + Math.random() * 0.1,
        drag: 0.989,
        delay: Math.random() * 1000
      });
    }

    const DUR = 7500;
    let t0 = null;

    function tick(now) {
      if (!t0) t0 = now;
      const ms = now - t0;
      ctx.clearRect(0, 0, W, H);
      let going = ms < DUR;

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (ms < p.delay) { going = true; continue; }
        p.vx *= p.drag;
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rv;

        const age = ms - p.delay;
        const fadeAt = DUR * 0.58;
        const alpha = age < fadeAt ? 1 : Math.max(0, 1 - (age - fadeAt) / (DUR * 0.42));

        if (alpha > 0 && p.y < H + 80) {
          going = true;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = p.color;
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          if (p.type === 0) {
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          } else if (p.type === 1) {
            ctx.beginPath();
            ctx.ellipse(0, 0, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.moveTo(0, -p.h / 2);
            ctx.lineTo(p.w / 2, p.h / 2);
            ctx.lineTo(-p.w / 2, p.h / 2);
            ctx.closePath();
            ctx.fill();
          }
          ctx.restore();
        }
      }

      if (going) requestAnimationFrame(tick);
      else canvas.remove();
    }

    requestAnimationFrame(tick);
  }

  // ---------- Clapping sound ----------

  function playClapping() {
    const audio = new Audio('sounds/clapping.mp3');
    audio.volume = 0.85;
    audio.play().catch(function () {});
  }

  if (!reduceMotion) {
    launchCelebration();
    try { playClapping(); } catch (e) {}
  }

})();
