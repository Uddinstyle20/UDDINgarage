// ...existing code...
(() => {
  'use strict';
  /* ====== Helpers ====== */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const el = (tag, props = {}) => Object.assign(document.createElement(tag), props);
  const fmtDate = iso => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('id-ID', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch { return iso; }
  };

  /* ====== Theme toggle ====== */
  const THEME_KEY = 'sparky_theme_v1';
  const themeToggle = qs('#themeToggle');
  function applyTheme(theme) {
    if (theme === 'dark') document.documentElement.classList.add('theme-dark');
    else document.documentElement.classList.remove('theme-dark');
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
      themeToggle.textContent = theme === 'dark' ? '🌙' : '🌗';
    }
  }
  const savedTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.classList.contains('theme-dark') ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  /* ====== Antrian (Queue) ====== */
  const QUEUE_KEY = 'sparky_queue_v1';
  const queueForm = qs('#formAntrian');
  const queueList = qs('#listAntrian');
  let queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');

  function saveQueue() {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  }

  function renderQueue() {
    if (!queueList) return;
    queueList.innerHTML = '';
    if (!queue.length) {
      const li = el('li', { textContent: 'Belum ada antrian.' });
      queueList.appendChild(li);
      return;
    }
    queue.forEach((item, idx) => {
      const li = el('li', { className: 'antrian-item' });
      const left = el('div', { innerHTML: `<strong>${idx + 1}. ${escapeHtml(item.nama)}</strong><div class="muted">${escapeHtml(item.servis)}</div>` });
      const right = el('div');
      const btn = el('button', { className: 'hapus-btn', textContent: 'Hapus', type: 'button' });
      btn.addEventListener('click', () => {
        if (!confirm(`Hapus antrian ${item.nama}?`)) return;
        queue.splice(idx, 1);
        saveQueue();
        renderQueue();
      });
      right.appendChild(btn);
      li.appendChild(left);
      li.appendChild(right);
      queueList.appendChild(li);
    });
  }

  if (queueForm) {
    queueForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = qs('#namaPelanggan', queueForm);
      const serviceSelect = qs('#jenisServis', queueForm);
      const nama = nameInput?.value?.trim() || '';
      const servis = serviceSelect?.value || '';
      if (!nama || !servis) {
        alert('Mohon isi nama dan pilih jenis servis.');
        return;
      }
      queue.push({ nama, servis, createdAt: new Date().toISOString() });
      saveQueue();
      renderQueue();
      queueForm.reset();
      if (nameInput) nameInput.focus();
    });
  }

  renderQueue();

  /* ====== Toast helper ====== */
  function showToast(msg, ms = 1800) {
    const t = el('div', { textContent: msg, className: 'toast' });
    Object.assign(t.style, {
      position: 'fixed', left: '50%', transform: 'translateX(-50%)',
      bottom: '28px', background: 'linear-gradient(90deg,#4fc3f7,#1e88e5)', color: '#fff',
      padding: '10px 14px', borderRadius: '10px', zIndex: 9999, boxShadow: '0 10px 30px rgba(30,58,138,0.12)'
    });
    document.body.appendChild(t);
    setTimeout(() => t.style.opacity = '0', ms - 250);
    setTimeout(() => t.remove(), ms);
  }

  /* ====== Rating module (single review per name) ====== */
  const RAT_KEY = 'sparky_ratings_v1';
  const ratingWidget = qs('#ratingWidget');
  const ratingText = qs('#ratingText');
  const ratingMeta = qs('#ratingMeta');
  const reviewsList = qs('#reviewsList');
  const nameField = qs('#namaPelanggan');

  let ratings = JSON.parse(localStorage.getItem(RAT_KEY) || '[]'); // [{name,value,createdAt}]

  function computeAggregate(arr) {
    const total = arr.reduce((s, r) => s + Number(r.value || 0), 0);
    const count = arr.length;
    const avg = count ? total / count : 0;
    return { avg, count };
  }

  function renderRatingUI() {
    if (!ratingWidget) return;
    const stars = qsa('.star', ratingWidget);
    const { avg, count } = computeAggregate(ratings);
    const round = Math.round(avg);
    stars.forEach(s => {
      const v = Number(s.dataset.value);
      const sel = count > 0 && v <= round;
      s.classList.toggle('selected', sel);
      s.setAttribute('aria-checked', String(sel));
      s.tabIndex = 0;
    });

    if (count === 0) {
      ratingText.textContent = 'Belum ada rating';
      ratingMeta.textContent = '';
    } else {
      ratingText.textContent = `Rata-rata ${avg.toFixed(2)} / 5`;
      ratingMeta.textContent = `${count} penilaian • Terima kasih atas partisipasi Anda.`;
    }

    // reviews list
    if (reviewsList) {
      reviewsList.innerHTML = '';
      if (!ratings.length) {
        reviewsList.appendChild(el('li', { textContent: 'Belum ada ulasan.' }));
      } else {
        // show newest first
        [...ratings].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(r => {
          const li = el('li');
          const left = el('div', { innerHTML: `<strong>${escapeHtml(r.name)}</strong><div class="review-meta">${fmtDate(r.createdAt)}</div>` });
          const right = el('div', { innerHTML: `<span class="review-score">★ ${r.value}</span>` });
          li.appendChild(left);
          li.appendChild(right);
          reviewsList.appendChild(li);
        });
      }
    }
  }

  function getReviewerName() {
    const fromForm = nameField?.value?.trim();
    if (fromForm) {
      try { localStorage.setItem('sparky_user', fromForm); } catch {}
      return fromForm;
    }
    const stored = localStorage.getItem('sparky_user');
    if (stored) return stored;
    // Use consistent anonymous name (no random suffix)
    const anon = 'Anonymus';
    try { sessionStorage.setItem('sparky_anon', anon); } catch {}
    return anon;
  }

  function saveRatings() {
    localStorage.setItem(RAT_KEY, JSON.stringify(ratings));
  }

  function attachRatingHandlers() {
    if (!ratingWidget) return;
    const stars = qsa('.star', ratingWidget);
    stars.forEach((star, idx) => {
      const value = Number(star.dataset.value);

      star.addEventListener('click', () => {
        const reviewer = getReviewerName();
        if (!reviewer) {
          showToast('Isi nama pada formulir antrian sebelum memberi rating.', 2200);
          return;
        }
        const existing = ratings.find(r => r.name === reviewer);
        if (existing) {
          existing.value = value;
          existing.createdAt = new Date().toISOString();
        } else {
          ratings.push({ name: reviewer, value, createdAt: new Date().toISOString() });
        }
        saveRatings();
        renderRatingUI();
        showToast('Terima kasih atas ulasan Anda ⭐', 1500);
        const sparkle = el('div', { className: 'sparkle' });
        star.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 520);
      });

      // keyboard support
      star.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); star.click(); return; }
        if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') {
          ev.preventDefault();
          const prev = stars[Math.max(0, idx - 1)]; if (prev) prev.focus();
        }
        if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') {
          ev.preventDefault();
          const next = stars[Math.min(stars.length - 1, idx + 1)]; if (next) next.focus();
        }
      });

      star.addEventListener('mouseover', () => stars.forEach(s => s.classList.toggle('hover', Number(s.dataset.value) <= value)));
      star.addEventListener('mouseleave', () => stars.forEach(s => s.classList.remove('hover')));
      star.addEventListener('focus', () => stars.forEach(s => s.classList.toggle('hover', Number(s.dataset.value) <= value)));
      star.addEventListener('blur', () => stars.forEach(s => s.classList.remove('hover')));
    });
  }

  attachRatingHandlers();
  renderRatingUI();

  /* ====== Accessibility: focus outline for keyboard users ====== */
  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('show-focus');
  });

  /* ====== Small UI hooks ====== */
  const sapaButton = qs('#sapaButton');
  if (sapaButton) sapaButton.addEventListener('click', () => alert('Halo! Selamat datang di SPARKY Service.'));

  // expose small API for debugging
  window.Sparky = {
    resetQueue() { queue = []; saveQueue(); renderQueue(); },
    resetRatings() { ratings = []; saveRatings(); renderRatingUI(); },
    getRatings() { return [...ratings]; },
    getQueue() { return [...queue] }
  };

  // utility escape
  function escapeHtml(text = '') {
    return String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
})();
// ...existing code...
