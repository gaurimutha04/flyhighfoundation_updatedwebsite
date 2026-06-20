/* ============================================
   CHALK TRAIL — cursor effect for the hero
   Thicker, textured chalk strokes that cycle through
   classic chalk colors (white / yellow / sky blue) and
   fade like real dust. The eraser button wipes the
   whole board clean in one sweep, then drawing
   continues normally. Works on touch devices too:
   tap and hold inside the hero, then drag to draw,
   the same way a mouse would.
   ============================================ */

(function () {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('chalk-canvas');
  const eraserBtn = document.getElementById('eraser-toggle');
  if (!hero || !canvas) return;

  const ctx = canvas.getContext('2d');
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width, height;
  let lastX = null, lastY = null;
  let rafId = null;
  let touchDrawing = false;

  const CHALK_COLORS = [
    '245, 241, 232',  // chalk white
    '240, 193, 75',   // chalk yellow
    '130, 182, 217'   // sky chalk blue
  ];
  let colorIndex = 0;
  let distSinceColorChange = 0;
  const COLOR_SWITCH_DISTANCE = 260; // px of drawing before the color cycles

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);

  function chalkDab(x, y, angle, len, color) {
    const steps = Math.max(4, Math.floor(len / 2.2));
    const perpAngle = angle + Math.PI / 2;
    const strokeWidth = 9;

    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const sx = x - Math.cos(angle) * len * t;
      const sy = y - Math.sin(angle) * len * t;

      const speckCount = 3;
      for (let s = 0; s < speckCount; s++) {
        const w = (Math.random() - 0.5) * strokeWidth;
        const ox = Math.cos(perpAngle) * w + (Math.random() - 0.5) * 1.4;
        const oy = Math.sin(perpAngle) * w + (Math.random() - 0.5) * 1.4;
        const r = 1.3 + Math.random() * 1.8;
        const edgeFade = 1 - Math.abs(w) / (strokeWidth / 2) * 0.5;
        const alpha = (0.55 - t * 0.3) * edgeFade + Math.random() * 0.1;
        ctx.beginPath();
        ctx.arc(sx + ox, sy + oy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${Math.max(alpha, 0)})`;
        ctx.fill();
      }
    }
  }

  // Wipes the whole board clean in one sweep, left to right,
  // like a board eraser dragged across the entire surface.
  function clearBoard() {
    const durationMs = 420;
    const start = performance.now();

    function step(now) {
      const t = Math.min((now - start) / durationMs, 1);
      const sweepX = width * t;
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fillRect(0, 0, sweepX, height);
      ctx.restore();
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    }
    requestAnimationFrame(step);
  }

  function drawAt(x, y) {
    if (y < 0 || y > height) return;

    if (lastX !== null) {
      const dx = x - lastX;
      const dy = y - lastY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        const angle = Math.atan2(dy, dx);
        const travel = Math.min(dist, 30);

        distSinceColorChange += dist;
        if (distSinceColorChange > COLOR_SWITCH_DISTANCE) {
          colorIndex = (colorIndex + 1) % CHALK_COLORS.length;
          distSinceColorChange = 0;
        }
        chalkDab(x, y, angle, travel, CHALK_COLORS[colorIndex]);
      }
    }
    lastX = x;
    lastY = y;
  }

  function onMove(e) {
    const rect = hero.getBoundingClientRect();
    drawAt(e.clientX - rect.left, e.clientY - rect.top);
  }

  function onLeave() {
    lastX = null;
    lastY = null;
  }

  hero.addEventListener('mousemove', onMove);
  hero.addEventListener('mouseleave', onLeave);

  // Touch support — tap and hold inside the hero, then drag to draw
  hero.addEventListener('touchstart', function (e) {
    touchDrawing = true;
    const touch = e.touches[0];
    const rect = hero.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
  }, { passive: true });

  hero.addEventListener('touchmove', function (e) {
    if (!touchDrawing) return;
    e.preventDefault(); // stop page scroll while drawing inside the hero
    const touch = e.touches[0];
    const rect = hero.getBoundingClientRect();
    drawAt(touch.clientX - rect.left, touch.clientY - rect.top);
  }, { passive: false });

  function onTouchEnd() {
    touchDrawing = false;
    lastX = null;
    lastY = null;
  }
  hero.addEventListener('touchend', onTouchEnd);
  hero.addEventListener('touchcancel', onTouchEnd);

  function fadeLoop() {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,0.04)';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    rafId = requestAnimationFrame(fadeLoop);
  }
  fadeLoop();

  // Eraser button — wipes the board clean, then chalk drawing
  // continues normally. No separate "eraser mode" to toggle out of;
  // just a brief visual flash on click for feedback.
  if (eraserBtn) {
    eraserBtn.addEventListener('click', function () {
      clearBoard();
      eraserBtn.classList.add('is-active');
      setTimeout(() => eraserBtn.classList.remove('is-active'), 420);
    });
  }

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) {
    hero.removeEventListener('mousemove', onMove);
    if (rafId) cancelAnimationFrame(rafId);
  }
})();
