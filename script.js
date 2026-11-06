/* ==========================================================
   BarberPro — main script
   1.  Storage helpers        2.  Data (services, barbers, cities)
   3.  i18n (KZ / RU / EN)    4.  Theme (light / dark)
   5.  Navigation & toast     6.  Authentication simulation
   7.  Form validation        8.  Services search & filter
   9.  Booking dialog         10. Weather (Open-Meteo API)
   11. Page initializers
   ========================================================== */
(function () {
  'use strict';

  /* ---------- 1. Storage helpers ---------- */
  const KEYS = {
    theme: 'bp_theme',
    lang: 'bp_lang',
    users: 'bp_users',
    session: 'bp_session',
    filters: 'bp_filters',
    favs: 'bp_favs',
    bookings: 'bp_bookings',
    messages: 'bp_messages',
    city: 'bp_city'
  };

  /** Read JSON from localStorage (never throws). */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  /** Write JSON to localStorage (never throws). */
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
  }

  /** Theme and language are stored as plain strings. */
  function readRaw(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeRaw(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  const $ = (selector, root) => (root || document).querySelector(selector);
  const $$ = (selector, root) => Array.from((root || document).querySelectorAll(selector));

  /** Escape user-provided text before inserting it into HTML. */
  function esc(value) {
    const div = document.createElement('div');
    div.textContent = String(value);
    return div.innerHTML;
  }

  /* ---------- 2. Data ---------- */
  const SERVICES = [
    { id: 1, cat: 'hair',  price: 4000,  duration: 45,  icon: 'scissors' },
    { id: 2, cat: 'hair',  price: 5000,  duration: 50,  icon: 'scissors' },
    { id: 3, cat: 'hair',  price: 3000,  duration: 30,  icon: 'smile' },
    { id: 4, cat: 'beard', price: 3000,  duration: 30,  icon: 'beard' },
    { id: 5, cat: 'beard', price: 4500,  duration: 40,  icon: 'razor' },
    { id: 6, cat: 'care',  price: 3500,  duration: 25,  icon: 'sparkles' },
    { id: 7, cat: 'combo', price: 7000,  duration: 75,  icon: 'layers' },
    { id: 8, cat: 'combo', price: 12000, duration: 120, icon: 'crown' }
  ];

  const BARBERS = [
    { id: 'arman', name: 'Arman' },
    { id: 'dias',  name: 'Dias' },
    { id: 'timur', name: 'Timur' }
  ];

  const TIME_SLOTS = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

  const CITIES = {
    astana:   { lat: 51.1694, lon: 71.4491 },
    almaty:   { lat: 43.2389, lon: 76.8897 },
    shymkent: { lat: 42.3417, lon: 69.5901 }
  };

  /** Inline SVG icons (stroke style) used for cards and buttons. */
  const ICONS = {
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
    smile: '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>',
    beard: '<path d="M5 8c0 8 3 13 7 13s7-5 7-13"/><path d="M9 14c1 1 2 1.5 3 1.5s2-.5 3-1.5"/><path d="M5 8c0-3 3-5 7-5s7 2 7 5"/>',
    razor: '<rect x="3" y="9" width="18" height="6" rx="1" transform="rotate(-35 12 12)"/><path d="M7 17l4 3"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17v4M17 19h4"/>',
    layers: '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>',
    crown: '<path d="M3 18h18M4 18 3 7l5 4 4-7 4 7 5-4-1 11"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
  };

  /** Build an <svg> string from the icon table. */
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------- 3. i18n ---------- */
  const I18N = window.BP_I18N || { kk: {}, ru: {}, en: {} };
  const SUPPORTED_LANGS = ['kk', 'ru', 'en'];
  const state = {
    lang: 'kk',
    filters: { q: '', cat: 'all' },
    weather: null,
    weatherStatus: 'idle',
    bookingServiceId: null
  };

  /** Pick the first saved or browser language, defaulting to Kazakh. */
  function detectLang() {
    const saved = readRaw(KEYS.lang);
    if (SUPPORTED_LANGS.includes(saved)) return saved;
    const nav = (navigator.language || '').slice(0, 2).toLowerCase();
    if (nav === 'ru') return 'ru';
    if (nav === 'en') return 'en';
    return 'kk';
  }

  /** Translate a key; {placeholders} are replaced from vars. */
  function t(key, vars) {
    const dict = I18N[state.lang] || {};
    let text = dict[key];
    if (text === undefined) text = (I18N.en && I18N.en[key]) || key;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.split('{' + name + '}').join(vars[name]);
      });
    }
    return text;
  }

  /** Apply translations to every marked element in the document. */
  function applyTranslations() {
    document.documentElement.lang = state.lang;
    $$('[data-i18n]').forEach(function (el) {
      let vars = null;
      if (el.dataset.i18nVars) {
        try { vars = JSON.parse(el.dataset.i18nVars); } catch (e) { vars = null; }
      }
      el.textContent = t(el.dataset.i18n, vars);
    });
    $$('[data-i18n-ph]').forEach(function (el) { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    $$('[data-i18n-alt]').forEach(function (el) { el.alt = t(el.dataset.i18nAlt, { name: el.dataset.name || '' }); });
    $$('.lang-switch button').forEach(function (btn) {
      const active = btn.dataset.lang === state.lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    // Re-translate error / status messages that are currently on screen
    $$('[data-msg-key]').forEach(function (el) { el.textContent = t(el.dataset.msgKey); });
  }

  function setLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    state.lang = lang;
    writeRaw(KEYS.lang, lang);
    applyTranslations();
    document.dispatchEvent(new CustomEvent('langchange'));
  }

  function initLang() {
    state.lang = detectLang();
    $$('.lang-switch button').forEach(function (btn) {
      btn.addEventListener('click', function () { setLang(btn.dataset.lang); });
    });
    applyTranslations();
  }

  /* ---------- 4. Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggle = $('#theme-toggle');
    if (toggle) toggle.setAttribute('aria-checked', String(theme === 'dark'));
  }

  /** The saved theme is shared by every page through localStorage. */
  function initTheme() {
    const saved = readRaw(KEYS.theme);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
    const toggle = $('#theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      writeRaw(KEYS.theme, next);
    });
  }

  /* ---------- 5. Navigation & toast ---------- */
  function initNav() {
    const toggle = $('#nav-toggle');
    const nav = $('#site-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    // Close the mobile menu after choosing a link
    $$('a', nav).forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  let toastTimer = null;
  /** Show a short message at the bottom of the screen. */
  function toast(message) {
    let el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3200);
  }

  /** Fade-in on scroll + animated counters. */
  function initReveal() {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('visible'); });
      $$('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        $$('[data-count]', entry.target).forEach(animateCounter);
        if (entry.target.hasAttribute('data-count')) animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  function animateCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const duration = 1200;
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * progress) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---------- 6. Authentication simulation (localStorage) ---------- */
  function getUsers() { return read(KEYS.users, []); }

  /** Return the logged-in user object or null. */
  function currentUser() {
    const email = read(KEYS.session, null);
    if (!email) return null;
    return getUsers().find(function (u) { return u.email === email; }) || null;
  }

  function logout() {
    try { localStorage.removeItem(KEYS.session); } catch (e) { /* ignore */ }
  }

  /** Show guest links or user links in the header. */
  function updateAuthUI() {
    const loggedIn = !!currentUser();
    $$('[data-auth="guest"]').forEach(function (el) { el.hidden = loggedIn; });
    $$('[data-auth="user"]').forEach(function (el) { el.hidden = !loggedIn; });
  }

  function initLogoutButtons() {
    $$('[data-action="logout"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        logout();
        updateAuthUI();
        toast(t('logout_done'));
        if (document.body.dataset.page === 'profile') {
          setTimeout(function () { window.location.href = 'login.html'; }, 600);
        }
      });
    });
  }

  /* ---------- 7. Form validation (no HTML validation attributes) ---------- */
  const RULES = {
    required: function (v) { return v.trim() === '' ? 'err_required' : null; },
    name: function (v) { return v.trim().length < 2 ? 'err_name' : null; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'err_email'; },
    // Kazakhstan format: +7 701 123 45 67 / 8 701 123 45 67 / +77011234567
    phone: function (v) { return /^(\+7|8)[\s-]?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/.test(v.trim()) ? null : 'err_phone'; },
    passwordLength: function (v) { return v.length < 8 ? 'err_pwd_len' : null; },
    passwordComplex: function (v) {
      return /\p{Lu}/u.test(v) && /\p{Ll}/u.test(v) && /\d/.test(v) ? null : 'err_pwd_complex';
    },
    match: function (v, form, field) {
      const other = form.elements[field.dataset.match];
      return other && v !== other.value ? 'err_pwd_match' : null;
    },
    message: function (v) { return v.trim().length < 10 ? 'err_message_len' : null; },
    futureDate: function (v) {
      const chosen = new Date(v + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen < today ? 'err_date_past' : null;
    }
  };

  /** Show or clear the error message under a field. */
  function setFieldError(field, key) {
    const box = $('.error', field.closest('.field'));
    if (box) {
      box.textContent = key ? t(key) : '';
      if (key) box.dataset.msgKey = key; else delete box.dataset.msgKey;
    }
    field.classList.toggle('invalid', !!key);
    field.setAttribute('aria-invalid', key ? 'true' : 'false');
  }

  /** Validate one field using the rules listed in data-rules. Returns true when valid. */
  function validateField(field, form) {
    const rules = (field.dataset.rules || '').split(/\s+/).filter(Boolean);
    let errorKey = null;
    for (let i = 0; i < rules.length; i++) {
      const rule = RULES[rules[i]];
      if (!rule) continue;
      errorKey = rule(field.value, form, field);
      if (errorKey) break;
    }
    setFieldError(field, errorKey);
    return !errorKey;
  }

  /** Validate every field of a form and focus the first invalid one. */
  function validateForm(form) {
    let firstInvalid = null;
    $$('[data-rules]', form).forEach(function (field) {
      if (!validateField(field, form) && !firstInvalid) firstInvalid = field;
    });
    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  function setStatus(form, key, type) {
    const box = $('.form-status', form);
    if (!box) return;
    box.textContent = key ? t(key) : '';
    box.className = 'form-status' + (type ? ' ' + type : '');
    if (key) box.dataset.msgKey = key; else delete box.dataset.msgKey;
  }

  /** Attach live validation and a submit handler to a form. */
  function initForm(form, onValid) {
    if (!form) return;
    form.setAttribute('novalidate', '');
    $$('[data-rules]', form).forEach(function (field) {
      field.addEventListener('blur', function () { validateField(field, form); });
      field.addEventListener('input', function () {
        if (field.classList.contains('invalid')) validateField(field, form);
      });
      field.addEventListener('change', function () { validateField(field, form); });
    });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      setStatus(form, '', '');
      if (validateForm(form)) onValid(form);
    });
  }

  /* ---- Sign up ---- */
  function handleSignup(form) {
    const email = form.elements.email.value.trim().toLowerCase();
    const users = getUsers();
    if (users.some(function (u) { return u.email === email; })) {
      setFieldError(form.elements.email, 'err_email_exists');
      form.elements.email.focus();
      return;
    }
    users.push({
      name: form.elements.name.value.trim(),
      email: email,
      phone: form.elements.phone.value.trim(),
      password: form.elements.password.value, // demo only: a real site must never store plain passwords
      createdAt: new Date().toISOString()
    });
    write(KEYS.users, users);
    setStatus(form, 'signup_success', 'ok');
    setTimeout(function () { window.location.href = 'login.html'; }, 1300);
  }

  /* ---- Log in ---- */
  function handleLogin(form) {
    const email = form.elements.email.value.trim().toLowerCase();
    const password = form.elements.password.value;
    const user = getUsers().find(function (u) { return u.email === email && u.password === password; });
    if (!user) {
      setStatus(form, 'err_credentials', 'fail');
      return;
    }
    write(KEYS.session, user.email);
    setStatus(form, 'login_success', 'ok');
    setTimeout(function () { window.location.href = 'profile.html'; }, 900);
  }

  /* ---- Contact ---- */
  function handleContact(form) {
    const messages = read(KEYS.messages, []);
    messages.push({
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      message: form.elements.message.value.trim(),
      sentAt: new Date().toISOString()
    });
    write(KEYS.messages, messages);
    form.reset();
    setStatus(form, 'contact_success', 'ok');
  }

  /* ---------- 8. Services: search + filter ---------- */
  function getFavs() { return read(KEYS.favs, []); }

  function serviceName(id) { return t('svc_' + id + '_name'); }

  /** Text used for searching: names and descriptions in all languages. */
  function searchableText(service) {
    return SUPPORTED_LANGS.map(function (lang) {
      const dict = I18N[lang] || {};
      return (dict['svc_' + service.id + '_name'] || '') + ' ' + (dict['svc_' + service.id + '_desc'] || '');
    }).join(' ').toLowerCase();
  }

  function formatPrice(value) {
    return value.toLocaleString('ru-RU').replace(/ /g, ' ') + ' ' + t('currency');
  }

  function renderServices() {
    const grid = $('#services-grid');
    if (!grid) return;
    const query = state.filters.q.trim().toLowerCase();
    const favs = getFavs();
    const list = SERVICES.filter(function (s) {
      const catOk = state.filters.cat === 'all' || s.cat === state.filters.cat;
      return catOk && (!query || searchableText(s).includes(query));
    });

    grid.innerHTML = list.map(function (s) {
      const isFav = favs.includes(s.id);
      const favLabel = isFav ? t('fav_remove') : t('fav_add');
      return '<article class="card service-card fade-in">' +
        '<div class="service-top"><div class="card-icon">' + icon(s.icon) + '</div>' +
        '<button class="icon-btn" type="button" data-action="fav" data-id="' + s.id + '" aria-pressed="' + isFav + '" aria-label="' + esc(favLabel) + '" title="' + esc(favLabel) + '">' + icon('heart') + '</button></div>' +
        '<h3>' + esc(serviceName(s.id)) + '</h3>' +
        '<p>' + esc(t('svc_' + s.id + '_desc')) + '</p>' +
        '<div class="service-meta"><span class="price">' + formatPrice(s.price) + '</span><span class="duration">' + s.duration + ' ' + esc(t('min')) + '</span></div>' +
        '<div class="service-actions"><button class="btn btn-primary btn-block" type="button" data-action="book" data-id="' + s.id + '">' + icon('calendar') + esc(t('btn_book')) + '</button></div>' +
        '</article>';
    }).join('');

    $('#results-count').textContent = t('results_count', { n: list.length });
    $('#empty-state').hidden = list.length > 0;
    $('#clear-filters').hidden = !(query || state.filters.cat !== 'all');
    $$('.chip').forEach(function (chip) {
      chip.setAttribute('aria-pressed', String(chip.dataset.cat === state.filters.cat));
    });
  }

  function initServices() {
    const grid = $('#services-grid');
    if (!grid) return;
    const input = $('#service-search');

    // Restore the last search saved in localStorage
    const saved = read(KEYS.filters, null);
    if (saved && typeof saved === 'object') {
      state.filters.q = String(saved.q || '');
      state.filters.cat = String(saved.cat || 'all');
      input.value = state.filters.q;
      if (state.filters.q || state.filters.cat !== 'all') toast(t('filters_restored'));
    }

    function save() { write(KEYS.filters, state.filters); }

    input.addEventListener('input', function () {
      state.filters.q = input.value;
      save();
      renderServices();
    });
    $$('.chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.filters.cat = chip.dataset.cat;
        save();
        renderServices();
      });
    });
    $('#clear-filters').addEventListener('click', function () {
      state.filters = { q: '', cat: 'all' };
      input.value = '';
      save();
      renderServices();
      input.focus();
    });

    // Event delegation for favorite / book buttons
    grid.addEventListener('click', function (event) {
      const btn = event.target.closest('[data-action]');
      if (!btn) return;
      const id = Number(btn.dataset.id);
      if (btn.dataset.action === 'fav') toggleFav(id);
      if (btn.dataset.action === 'book') openBooking(id);
    });

    renderServices();
    document.addEventListener('langchange', function () {
      renderServices();
      if ($('#booking-dialog') && $('#booking-dialog').open) updateBookingTexts();
    });
    initBookingDialog();
  }

  function toggleFav(id) {
    let favs = getFavs();
    const had = favs.includes(id);
    favs = had ? favs.filter(function (x) { return x !== id; }) : favs.concat(id);
    write(KEYS.favs, favs);
    toast(t(had ? 'fav_removed' : 'fav_added'));
    renderServices();
  }

  /* ---------- 9. Booking dialog ---------- */
  function initBookingDialog() {
    const dialog = $('#booking-dialog');
    if (!dialog) return;
    const form = $('#booking-form');

    // Fill barber and time selects once
    const barberSelect = form.elements.barber;
    const timeSelect = form.elements.time;
    barberSelect.innerHTML = '<option value="" data-i18n="book_choose"></option>' +
      BARBERS.map(function (b) { return '<option value="' + b.id + '">' + esc(b.name) + '</option>'; }).join('');
    timeSelect.innerHTML = '<option value="" data-i18n="book_choose"></option>' +
      TIME_SLOTS.map(function (s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
    applyTranslations();

    initForm(form, function () {
      const user = currentUser();
      if (!user) { toast(t('book_login')); return; }
      const bookings = read(KEYS.bookings, []);
      // One barber can serve only one client at a given date and time
      if (isSlotTaken(bookings, barberSelect.value, form.elements.date.value, timeSelect.value)) {
        setFieldError(timeSelect, 'err_slot_taken');
        timeSelect.focus();
        return;
      }
      bookings.push({
        id: Date.now(),
        email: user.email,
        serviceId: state.bookingServiceId,
        barber: barberSelect.value,
        date: form.elements.date.value,
        time: timeSelect.value
      });
      write(KEYS.bookings, bookings);
      dialog.close();
      form.reset();
      toast(t('book_ok'));
    });

    // Mark already booked times as unavailable when the barber or date changes
    function refreshSlots() {
      const bookings = read(KEYS.bookings, []);
      Array.from(timeSelect.options).forEach(function (opt) {
        if (!opt.value) return;
        const taken = isSlotTaken(bookings, barberSelect.value, form.elements.date.value, opt.value);
        opt.disabled = taken;
        opt.textContent = taken ? opt.value + ' ✕' : opt.value;
      });
      if (timeSelect.selectedOptions[0] && timeSelect.selectedOptions[0].disabled) timeSelect.value = '';
    }
    barberSelect.addEventListener('change', refreshSlots);
    form.elements.date.addEventListener('change', refreshSlots);

    $('#booking-close').addEventListener('click', function () { dialog.close(); });
    // Close when clicking the dark backdrop
    dialog.addEventListener('click', function (event) { if (event.target === dialog) dialog.close(); });
  }

  /** True when this barber is already booked at the given date and time. */
  function isSlotTaken(bookings, barber, date, time) {
    return bookings.some(function (b) { return b.barber === barber && b.date === date && b.time === time; });
  }

  function updateBookingTexts() {
    const title = $('#booking-title');
    if (title && state.bookingServiceId) title.textContent = t('book_title', { service: serviceName(state.bookingServiceId) });
  }

  function openBooking(serviceId) {
    if (!currentUser()) {
      toast(t('book_login'));
      setTimeout(function () { window.location.href = 'login.html'; }, 1400);
      return;
    }
    const dialog = $('#booking-dialog');
    const form = $('#booking-form');
    state.bookingServiceId = serviceId;
    form.reset();
    $$('[data-rules]', form).forEach(function (f) { setFieldError(f, null); });
    updateBookingTexts();
    dialog.showModal();
  }

  /* ---------- 10. Weather — Open-Meteo public API ---------- */
  /** Convert a WMO weather code to a translation key and an emoji. */
  function weatherInfo(code) {
    if (code <= 1) return { key: 'wc_clear', emoji: '☀️', wet: false };
    if (code <= 3) return { key: 'wc_cloudy', emoji: '⛅', wet: false };
    if (code === 45 || code === 48) return { key: 'wc_fog', emoji: '🌫️', wet: false };
    if (code >= 95) return { key: 'wc_storm', emoji: '⛈️', wet: true };
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { key: 'wc_snow', emoji: '❄️', wet: true };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { key: 'wc_rain', emoji: '🌧️', wet: true };
    return { key: 'wc_cloudy', emoji: '☁️', wet: false };
  }

  function renderWeather() {
    const out = $('#weather-output');
    if (!out) return;
    if (state.weatherStatus === 'loading') {
      out.innerHTML = '<div class="api-state"><div class="spinner" role="progressbar" aria-label="' + esc(t('weather_loading')) + '"></div><p>' + esc(t('weather_loading')) + '</p></div>';
      return;
    }
    if (state.weatherStatus === 'error') {
      out.innerHTML = '<div class="api-state error" role="alert"><p>' + esc(t('weather_error')) + '</p>' +
        '<button type="button" class="btn btn-outline btn-sm" id="weather-retry">' + esc(t('weather_retry')) + '</button></div>';
      $('#weather-retry').addEventListener('click', function () { loadWeather($('#weather-city').value); });
      return;
    }
    if (state.weatherStatus === 'ok' && state.weather) {
      const w = state.weather;
      const info = weatherInfo(w.weather_code);
      const temp = Math.round(w.temperature_2m);
      const tipKey = info.wet ? 'tip_wet' : (temp < 0 ? 'tip_cold' : 'tip_ok');
      out.innerHTML = '<div class="weather-now fade-in">' +
        '<div class="weather-icon" aria-hidden="true">' + info.emoji + '</div>' +
        '<div><div class="weather-temp">' + (temp > 0 ? '+' : '') + temp + '°C</div>' +
        '<div class="weather-meta">' + esc(t(info.key)) + ' · ' + esc(t('weather_wind')) + ': ' + Math.round(w.wind_speed_10m) + ' ' + esc(t('weather_kmh')) + '</div></div></div>' +
        '<p class="weather-tip">' + esc(t(tipKey)) + '</p>';
    }
  }

  /** Fetch the current weather with fetch/async-await, a loading state and error handling. */
  async function loadWeather(cityKey) {
    const city = CITIES[cityKey] || CITIES.astana;
    state.weatherStatus = 'loading';
    renderWeather();
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + city.lat + '&longitude=' + city.lon +
      '&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=kmh&timezone=auto';
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 9000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      if (!data.current) throw new Error('No data');
      state.weather = data.current;
      state.weatherStatus = 'ok';
    } catch (error) {
      state.weather = null;
      state.weatherStatus = 'error';
    } finally {
      clearTimeout(timer);
    }
    renderWeather();
  }

  function initWeather() {
    const select = $('#weather-city');
    if (!select) return;
    const saved = readRaw(KEYS.city);
    if (saved && CITIES[saved]) select.value = saved;
    select.addEventListener('change', function () {
      writeRaw(KEYS.city, select.value);
      loadWeather(select.value);
    });
    document.addEventListener('langchange', renderWeather);
    loadWeather(select.value);
  }

  /* ---------- 11. Page initializers ---------- */
  function initProfile() {
    const root = $('#profile-root');
    if (!root) return;
    const user = currentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    function render() {
      const bookings = read(KEYS.bookings, []).filter(function (b) { return b.email === user.email; })
        .sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
      const favs = getFavs();
      const since = new Date(user.createdAt).toLocaleDateString(state.lang === 'kk' ? 'kk-KZ' : (state.lang === 'ru' ? 'ru-RU' : 'en-GB'));

      $('#profile-avatar').textContent = user.name.charAt(0).toUpperCase();
      $('#profile-greeting').textContent = t('profile_greeting', { name: user.name });
      $('#pf-name').textContent = user.name;
      $('#pf-email').textContent = user.email;
      $('#pf-phone').textContent = user.phone;
      $('#pf-since').textContent = since;

      const bookingList = $('#booking-list');
      bookingList.innerHTML = bookings.map(function (b) {
        const barber = BARBERS.find(function (x) { return x.id === b.barber; });
        return '<li class="fade-in"><div><strong>' + esc(serviceName(b.serviceId)) + '</strong>' +
          '<small>' + esc(b.date) + ' · ' + esc(b.time) + ' · ' + esc(barber ? barber.name : '') + '</small></div>' +
          '<button class="btn btn-danger btn-sm" type="button" data-cancel="' + b.id + '">' + esc(t('booking_cancel')) + '</button></li>';
      }).join('');
      $('#no-bookings').hidden = bookings.length > 0;

      const favList = $('#fav-list');
      favList.innerHTML = SERVICES.filter(function (s) { return favs.includes(s.id); }).map(function (s) {
        return '<li><div><strong>' + esc(serviceName(s.id)) + '</strong><small>' + formatPrice(s.price) + ' · ' + s.duration + ' ' + esc(t('min')) + '</small></div></li>';
      }).join('');
      $('#no-favs').hidden = favList.children.length > 0;
    }

    $('#booking-list').addEventListener('click', function (event) {
      const btn = event.target.closest('[data-cancel]');
      if (!btn) return;
      const id = Number(btn.dataset.cancel);
      write(KEYS.bookings, read(KEYS.bookings, []).filter(function (b) { return b.id !== id; }));
      toast(t('booking_cancelled'));
      render();
    });

    render();
    document.addEventListener('langchange', render);
  }

  function initPage() {
    const page = document.body.dataset.page;
    if (page === 'home') {
      initServices();
      initWeather();
    }
    if (page === 'login') initForm($('#login-form'), handleLogin);
    if (page === 'signup') initForm($('#signup-form'), handleSignup);
    if (page === 'contact') initForm($('#contact-form'), handleContact);
    if (page === 'profile') initProfile();
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.documentElement.classList.add('js');
    initTheme();
    initLang();
    initNav();
    updateAuthUI();
    initLogoutButtons();
    initPage();
    initReveal();
  });
})();
