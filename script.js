// filepath: sparky-admin/public/script.js
(() => {
  'use strict';

  const QUEUE_KEY = 'sparky_queue_v1';
  const THEME_KEY = 'sparky_theme';
  const queueList = document.getElementById('listAntrian');
  const formAntrian = document.getElementById('formAntrian');
  const nameInput = document.getElementById('namaPelanggan');
  const serviceSelect = document.getElementById('jenisServis');
  let queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');

  // THEME helpers
  function applyTheme(t) {
    const html = document.documentElement;
    if (t === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
    localStorage.setItem(THEME_KEY, t);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.setAttribute('aria-pressed', t === 'dark');
  }

  function toggleTheme() {
    const current = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // expose setActiveNav so pages with inline scripts can call it (if necessary)
  window.setActiveNav = function () {
    const navLinks = document.querySelectorAll('.site-nav a');
    if (!navLinks.length) return;
    const current = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      const target = href.split('/').pop() || 'index.html';
      if (target === current || (target === 'index.html' && current === '')) {
        a.classList.add('nav-active');
        a.setAttribute('aria-current', 'page');
      } else {
        a.classList.remove('nav-active');
        a.removeAttribute('aria-current');
      }
    });
  };

  // header offset helper: measure header and set CSS var so space sits BETWEEN header and headline
  function updateHeaderOffset() {
    try {
      const header = document.querySelector('.site-header');
      if (!header) return;
      const h = header.getBoundingClientRect().height;
      // set custom property; CSS applies this as margin-bottom on header
      document.documentElement.style.setProperty('--header-offset', (h + 12) + 'px'); // small gap
    } catch (e) {
      // ignore
    }
  }

  function saveQueue() {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  function escapeHtml(text = '') {
    return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function initials(name = '') {
    return (name || '').split(/\s+/).filter(Boolean).slice(0,2).map(s => s[0].toUpperCase()).join('') || '?';
  }

  function renderQueue() {
    if (!queueList) return;
    queueList.innerHTML = '';
    if (!queue.length) {
      const li = document.createElement('li');
      li.className = 'queue-empty';
      li.textContent = 'Belum ada antrian.';
      queueList.appendChild(li);
      return;
    }

    queue.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'queue-item reveal';
      // add small stagger
      li.classList.add(`delay-${Math.min(5, (idx % 6) + 1)}`);

      const left = document.createElement('div');
      left.className = 'left';

      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.textContent = initials(item.nama);

      const meta = document.createElement('div');
      meta.className = 'meta';
      const nameEl = document.createElement('div');
      nameEl.className = 'name';
      nameEl.textContent = `${idx + 1}. ${item.nama}`;
      const noteEl = document.createElement('div');
      noteEl.className = 'note';
      noteEl.textContent = item.servis || '';

      meta.appendChild(nameEl);
      meta.appendChild(noteEl);
      left.appendChild(avatar);
      left.appendChild(meta);

      const actions = document.createElement('div');
      actions.className = 'actions';
      // remove-per-item button (keputusan: tetap tersedia untuk user lokal)
      const btnRemove = document.createElement('button');
      btnRemove.className = 'btn btn-outline';
      btnRemove.type = 'button';
      btnRemove.textContent = 'Hapus';
      btnRemove.addEventListener('click', () => {
        if (!confirm(`Hapus antrian ${item.nama}?`)) return;
        queue.splice(idx, 1);
        saveQueue();
        renderQueue();
      });
      actions.appendChild(btnRemove);

      li.appendChild(left);
      li.appendChild(actions);
      queueList.appendChild(li);
    });
  }

  // form handling
  if (formAntrian) {
    formAntrian.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const nama = (nameInput.value || '').trim();
      const servis = (serviceSelect.value || '').trim();
      if (!nama || !servis) {
        alert('Isi nama dan jenis servis.');
        return;
      }
      queue.push({ nama, servis, time: Date.now() });
      saveQueue();
      renderQueue();
      formAntrian.reset();
      // micro-feedback
      const firstItem = queueList.querySelector('.queue-item');
      if (firstItem) {
        firstItem.style.transform = 'scale(.98)';
        firstItem.style.transition = 'transform .12s ease';
        requestAnimationFrame(() => {
          firstItem.style.transform = '';
        });
      }
    });
  }

  function revealStagger(selector, baseDelay = 0) {
    const nodes = Array.from(document.querySelectorAll(selector));
    nodes.forEach((n, i) => {
      n.classList.add('reveal');
      // small inline delay for fine control
      n.style.animationDelay = `${baseDelay + i * 0.06}s`;
    });
  }

  function animateOnLoad() {
    // hero and top cards
    revealStagger('.hero-inner > *', 0);
    revealStagger('.cards .card', 0.06);
    revealStagger('.queue-card', 0.04);
    revealStagger('.dir-card', 0.04);
    // table - reveal as one block
    const table = document.querySelector('.directory-table');
    if (table) table.classList.add('reveal');

    // small reveal for rating & reviews
    revealStagger('.rating-card, .reviews .review-item', 0.08);
  }

  // on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    try {
      // ensure header offset is set before other layout code runs
      updateHeaderOffset();

      // apply saved / preferred theme
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) applyTheme(saved);
      else applyTheme(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

      // attach theme toggle control
      const themeBtn = document.getElementById('themeToggle');
      if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

      // nav highlight and UI init
      window.setActiveNav();
      renderQueue();
      // small timeout to let layout settle before animations
      setTimeout(animateOnLoad, 120);

      // attach click/hover effects after DOM ready (existing logic)
    } catch (e) {
      // silent
    }
  });

  // update header offset on resize and when page becomes visible (handles dynamic header heights)
  window.addEventListener('resize', () => {
    updateHeaderOffset();
  });
  window.addEventListener('orientationchange', () => updateHeaderOffset());
  document.addEventListener('readystatechange', () => {
    if (document.readyState === 'complete') updateHeaderOffset();
  });

  // optional: highlight nav on SPA-like anchor changes
  window.addEventListener('popstate', window.setActiveNav);

  // expose toggleTheme if needed
  window.toggleSparkyTheme = toggleTheme;

  // keep existing API stubs (if used elsewhere)
  const API_BASE = window.API_BASE_URL || '';

  async function fetchEntries() {
    if (!API_BASE) return [];
    const res = await fetch(`${API_BASE}/admin/entries`, {
      headers: {}
    });
    if (!res.ok) return [];
    return res.json();
  }

  // --- Click animations: ripple + press + keyboard support (applies to all clickable elements except logo) ---
  function shouldExclude(node) {
    return !!node.closest('.logo') || !!node.closest('.logo-wrap');
  }

  function createRipple(el, x, y) {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (x - rect.left - size / 2) + 'px';
    ripple.style.top = (y - rect.top - size / 2) + 'px';
    el.appendChild(ripple);
    // force reflow then animate
    requestAnimationFrame(() => ripple.classList.add('animate'));
    // cleanup
    setTimeout(() => {
      ripple.remove();
    }, 620);
  }

  function attachClickAnimations(scope = document) {
    const selectors = [
      'a',
      'button',
      '.btn',
      '.btn-outline',
      '.btn-ghost',
      '.site-nav a',
      '.dir-card',
      '.card',
      '.queue-item',
      '.directory-table tbody tr',
      '.rating-widget .star'
    ];
    const nodes = Array.from(scope.querySelectorAll(selectors.join(',')));
    nodes.forEach(n => {
      // skip logos
      if (shouldExclude(n)) return;
      // add helper class for CSS
      n.classList.add('clickable');

      // ensure element is focusable for keyboard interactions
      if (!n.hasAttribute('tabindex') && (n.tagName !== 'A' && n.tagName !== 'BUTTON')) {
        n.setAttribute('tabindex', '0');
      }

      // pointer down: ripple + press
      n.addEventListener('pointerdown', (ev) => {
        try {
          // only primary button
          if (ev.isPrimary === false) return;
          createRipple(n, ev.clientX, ev.clientY);
          n.classList.add('press');
        } catch(e){}
      }, { passive: true });

      // release: remove press after small delay
      n.addEventListener('pointerup', () => {
        n.classList.remove('press');
        // small bounce feedback
        n.animate([
          { transform: 'scale(1.00)' },
          { transform: 'scale(1.03)' },
          { transform: 'scale(1.00)' }
        ], { duration: 220, easing: 'cubic-bezier(.2,.9,.2,1)' });
      });

      // cancel: remove press
      n.addEventListener('pointercancel', () => {
        n.classList.remove('press');
      });

      // keyboard: space/enter animation
      n.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          // simulate press effect at center
          const rect = n.getBoundingClientRect();
          createRipple(n, rect.left + rect.width / 2, rect.top + rect.height / 2);
          n.classList.add('press');
          setTimeout(() => n.classList.remove('press'), 220);
          // allow native click to follow
          n.click();
        }
      });

      // accessibility: focus ring
      n.addEventListener('focus', () => n.classList.add('focus-ring'));
      n.addEventListener('blur', () => n.classList.remove('focus-ring'));
    });
  }

  // call attach on DOM ready and whenever dynamic content loads
  document.addEventListener('DOMContentLoaded', () => {
    try {
      attachClickAnimations(document);
      // also attach to dynamic lists (e.g., when renderQueue adds items)
      // monkey-patch renderQueue and renderCards functions if exist to re-attach after updates
      const origRenderQueue = window.renderQueue;
      if (typeof origRenderQueue === 'function') {
        window.renderQueue = function () {
          const ret = origRenderQueue.apply(this, arguments);
          attachClickAnimations(document);
          return ret;
        };
      }
      // for directory rendering functions defined inline in pages, re-run attach after a short delay
      setTimeout(() => attachClickAnimations(document), 300);
    } catch (e) {
      // silent
    }
  });

  // expose utility so other scripts can call it after injecting content
  window.attachClickAnimations = attachClickAnimations;

  // Hover/tilt effects: follow cursor for all .clickable elements (excluding logo)
  function attachHoverEffects(scope = document) {
    const nodes = Array.from(scope.querySelectorAll('.clickable')).filter(n => !n.closest('.logo') && !n.closest('.logo-wrap'));
    nodes.forEach(el => {
      // avoid double-binding
      if (el.__hasHoverEffect) return;
      el.__hasHoverEffect = true;

      let raf = null;
      let last = { x: 0, y: 0, tx: 0, ty: 0 };

      function onMove(e) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const px = (e.clientX - cx) / rect.width; // -0.5..0.5 approx
        const py = (e.clientY - cy) / rect.height;
        last.x = Math.max(-1, Math.min(1, px * 2)); // normalized -1..1
        last.y = Math.max(-1, Math.min(1, py * 2));
        if (!raf) raf = requestAnimationFrame(apply);
      }

      function apply() {
        raf = null;
        // smoothing
        last.tx += (last.x - last.tx) * 0.18;
        last.ty += (last.y - last.ty) * 0.18;
        const mult = parseFloat(getComputedStyle(el).getPropertyValue('--tilt-mult')) || 6;
        const tiltX = (-last.ty * mult).toFixed(2) + 'deg';
        const tiltY = (last.tx * mult).toFixed(2) + 'deg';
        el.style.setProperty('--tilt-x', tiltX);
        el.style.setProperty('--tilt-y', tiltY);
        el.style.setProperty('--mx', String(last.tx));
        el.style.setProperty('--my', String(last.ty));
      }

      function onEnter(e) {
        el.classList.remove('resetting');
        // raise hover values
        el.style.setProperty('--hover-scale', el.style.getPropertyValue('--hover-scale') || '1.02');
        el.style.setProperty('--glow-opacity', el.style.getPropertyValue('--glow-opacity') || '1');
        // attach pointermove
        el.addEventListener('pointermove', onMove, { passive: true });
      }

      function onLeave() {
        el.removeEventListener('pointermove', onMove);
        // reset with smoothing
        el.classList.add('resetting');
        // quickly animate back to zero
        last.x = last.y = last.tx = last.ty = 0;
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
        el.style.setProperty('--mx', '0');
        el.style.setProperty('--my', '0');
        // fade glow
        el.style.setProperty('--glow-opacity', '0');
        setTimeout(() => {
          el.classList.remove('resetting');
        }, 360);
      }

      el.addEventListener('pointerenter', onEnter, { passive: true });
      el.addEventListener('pointerleave', onLeave, { passive: true });
      // keyboard focus should also trigger subtle effect
      el.addEventListener('focus', (ev) => {
        el.classList.remove('resetting');
        el.style.setProperty('--tilt-x', '0deg');
        el.style.setProperty('--tilt-y', '0deg');
        el.style.setProperty('--glow-opacity', '0.9');
      });
      el.addEventListener('blur', () => {
        onLeave();
      });
    });
  }

  // call after initial attach and whenever new interactive nodes added
  document.addEventListener('DOMContentLoaded', () => {
    try {
      attachHoverEffects(document);
      // re-run after dynamic updates
      setTimeout(() => attachHoverEffects(document), 260);
    } catch(e){}
  });

  // expose API
  window.attachHoverEffects = attachHoverEffects;

  // ensure attachClickAnimations calls attachHoverEffects after it sets .clickable
  const origAttach = window.attachClickAnimations;
  if (typeof origAttach === 'function') {
    window.attachClickAnimations = function(scope){
      const ret = origAttach(scope);
      attachHoverEffects(scope || document);
      return ret;
    };
  }

})();
