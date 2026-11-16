/* KAFOOK — v4 fixes hub navigation + time slot highlight */
(function() {
  const KEY = 'kafook_booking';
  const WA_NUMBER = '966554949251';

  // ===== Mobile polish =====
  var style = document.createElement('style');
  // overflow-x clip: decorative shapes (pest-control) pushed the page 48px sideways on phones;
  // clip (not hidden) keeps position:sticky bars working
  // desktop column + overflow-x: /kafook-frame.css (in <head>, so the first paint is narrow)
  style.textContent = 'button,a,input,textarea{touch-action:manipulation;}.kafook-keyboard-safe{scroll-margin-bottom:340px;}@keyframes kafook-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}.kafook-shake{animation:kafook-shake 250ms ease-in-out;}';
  document.head.appendChild(style);

  function vibrate(ms) {
    if (navigator.vibrate) { try { navigator.vibrate(ms); } catch(e){} }
  }

  // ===== Notice: the one place the customer reads errors and confirmations =====
  // Replaces the browser's alert() ("localhost says…"): branded, Arabic, RTL, with the next step
  // as a button. kafookNotice({ type, title, message, primary:{label, action}, secondary:{…}, focus })
  var noticeCss = document.createElement('style');
  noticeCss.textContent =
    '.kf-notice-backdrop{position:fixed;inset:0;z-index:2147483000;background:rgba(36,12,44,.55);display:flex;align-items:flex-end;justify-content:center;padding:16px;animation:kf-fade .15s ease-out}' +
    '@media(min-width:600px){.kf-notice-backdrop{align-items:center}}' +
    '.kf-notice{direction:rtl;font-family:Cairo,sans-serif;background:#FAF7F2;color:#2b1433;width:100%;max-width:420px;border-radius:22px;padding:22px 20px 18px;box-shadow:0 20px 60px rgba(36,12,44,.35);animation:kf-rise .2s ease-out;text-align:right}' +
    '.kf-notice-head{display:flex;align-items:center;gap:12px;margin-bottom:8px}' +
    '.kf-notice-icon{flex:0 0 44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800}' +
    '.kf-notice--error .kf-notice-icon{background:#FBE7E7;color:#B42318}.kf-notice--success .kf-notice-icon{background:#E6F4EA;color:#1E7B3C}' +
    '.kf-notice--warning .kf-notice-icon{background:#FBF1DC;color:#9A6A00}.kf-notice--info .kf-notice-icon{background:#EFE3F4;color:#5C1A6B}' +
    '.kf-notice-title{font-size:17px;font-weight:800;margin:0;line-height:1.5;color:#2b1433}' +
    '.kf-notice-msg{font-size:14.5px;line-height:1.8;margin:6px 0 16px;color:#4a3a50;white-space:pre-line}' +
    '.kf-notice-actions{display:flex;flex-direction:column;gap:8px}' +
    '.kf-notice-btn{font-family:Cairo,sans-serif;font-size:15px;font-weight:700;border:0;border-radius:14px;padding:13px 16px;cursor:pointer;min-height:48px}' +
    '.kf-notice-btn--primary{background:#5C1A6B;color:#fff}.kf-notice-btn--primary:focus-visible{outline:3px solid #B8860B;outline-offset:2px}' +
    '.kf-notice-btn--secondary{background:transparent;color:#5C1A6B;border:1.5px solid #E9DCF0}' +
    '.kf-field-error{outline:2px solid #B42318 !important;outline-offset:2px;border-radius:12px}' +
    '@keyframes kf-fade{from{opacity:0}to{opacity:1}}@keyframes kf-rise{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}';
  document.head.appendChild(noticeCss);

  window.kafookNotice = function(opts) {
    opts = opts || {};
    var type = opts.type || 'info';
    var icons = { error: '!', success: '✓', warning: '!', info: 'i' };
    return new Promise(function(resolve) {
      var previous = document.activeElement;
      var backdrop = document.createElement('div');
      backdrop.className = 'kf-notice-backdrop';
      var box = document.createElement('div');
      box.className = 'kf-notice kf-notice--' + type;
      box.setAttribute('role', type === 'error' || type === 'warning' ? 'alertdialog' : 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.setAttribute('aria-labelledby', 'kf-notice-title');
      box.setAttribute('aria-describedby', 'kf-notice-msg');

      var head = document.createElement('div'); head.className = 'kf-notice-head';
      var icon = document.createElement('div'); icon.className = 'kf-notice-icon'; icon.textContent = icons[type] || 'i'; icon.setAttribute('aria-hidden', 'true');
      var title = document.createElement('h2'); title.className = 'kf-notice-title'; title.id = 'kf-notice-title'; title.textContent = opts.title || '';
      head.appendChild(icon); head.appendChild(title);
      var msg = document.createElement('p'); msg.className = 'kf-notice-msg'; msg.id = 'kf-notice-msg'; msg.textContent = opts.message || '';
      var actions = document.createElement('div'); actions.className = 'kf-notice-actions';

      function close(result, action) {
        document.removeEventListener('keydown', onKey, true);
        backdrop.remove();
        if (opts.focus && opts.focus.focus) {
          opts.focus.classList.add('kf-field-error');
          setTimeout(function(){ opts.focus.focus(); }, 30);
          opts.focus.addEventListener('input', function clear(){ opts.focus.classList.remove('kf-field-error'); opts.focus.removeEventListener('input', clear); });
        } else if (previous && previous.focus) { try { previous.focus(); } catch(e){} }
        if (typeof action === 'function') action();
        resolve(result);
      }
      function addButton(cfg, kind, result) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'kf-notice-btn kf-notice-btn--' + kind; b.textContent = cfg.label;
        b.addEventListener('click', function(){ close(result, cfg.action); });
        actions.appendChild(b);
        return b;
      }
      var primaryBtn = addButton(opts.primary || { label: 'حسناً' }, 'primary', 'primary');
      if (opts.secondary) addButton(opts.secondary, 'secondary', 'secondary');
      function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); close('dismiss'); } }
      document.addEventListener('keydown', onKey, true);
      backdrop.addEventListener('click', function(e){ if (e.target === backdrop && opts.dismissible !== false) close('dismiss'); });

      box.appendChild(head); box.appendChild(msg); box.appendChild(actions);
      backdrop.appendChild(box);
      document.body.appendChild(backdrop);
      vibrate(type === 'error' ? [50,30,50] : type === 'success' ? [30,20,30] : 20);
      setTimeout(function(){ primaryBtn.focus(); }, 30);
    });
  };
  var kafookNotice = window.kafookNotice;

  function whatsappLink(text) {
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }

  /**
   * What the customer reads when /api/book refuses, by the server's code: a title they
   * understand, why, and the step that fixes it. The server's own text is kept as the
   * explanation when it is the clearest (iCore's coverage/slot messages are already Arabic).
   */
  function bookingErrorNotice(status, data, ctx) {
    data = data || {};
    var code = data.code || (status === 429 ? 'rate_limited' : status >= 500 ? 'server_error' : 'conflict');
    var ref = ctx && ctx.reference ? ' (' + ctx.reference + ')' : '';
    var toDateTime = { label: 'اختر موعداً آخر', action: function(){ location.href = '/date-time.html'; } };
    var contact = { label: 'تواصل معنا عبر واتساب', action: function(){ window.open(whatsappLink('مرحباً، واجهتني مشكلة في الحجز' + ref + ': ' + (data.error || '')), '_blank'); } };
    switch (code) {
      case 'outside_coverage':
        return kafookNotice({ type: 'warning', title: 'الخدمة لا تصل لموقعك حالياً',
          message: 'نخدم حالياً أحياء محددة في الرياض، وموقعك أو الحي المكتوب خارجها.\nتأكّد من اسم الحي وموقعك على الخريطة، أو راسلنا لنخبرك متى نصل إليك.',
          primary: { label: 'تعديل الحي والموقع', action: function(){ var d = document.getElementById('district-name'); if (d) { d.focus(); d.classList.add('kf-field-error'); } } },
          secondary: contact });
      case 'slot_full': case 'slot_held': case 'slot_unavailable': case 'time_clash': case 'invalid_time':
        return kafookNotice({ type: 'warning', title: 'الموعد الذي اخترته لم يعد متاحاً',
          message: (data.error ? data.error + '\n' : '') + 'بياناتك محفوظة — اختر موعداً آخر وأكمل الطلب.', primary: toDateTime, secondary: { label: 'إغلاق' } });
      case 'PRICE_MISMATCH':
        return kafookNotice({ type: 'warning', title: 'تغيّر سعر الطلب',
          message: 'السعر الصحيح الآن ' + ((data.serverTotalHalalas || 0) / 100).toFixed(2) + ' ر.س. حدّث الصفحة لترى الإجمالي الجديد قبل التأكيد.',
          primary: { label: 'تحديث الصفحة', action: function(){ location.reload(); } }, secondary: { label: 'إغلاق' } });
      case 'unknown_service':
        return kafookNotice({ type: 'error', title: 'هذه الخدمة غير متاحة للحجز الآن',
          message: (data.error ? data.error + '\n' : '') + 'اختر خدمة أخرى أو راسلنا لنرتّبها لك.',
          primary: { label: 'تصفّح الخدمات', action: function(){ location.href = '/services.html'; } }, secondary: contact });
      case 'invalid_input':
        return kafookNotice({ type: 'error', title: 'بعض البيانات تحتاج تصحيحاً', message: data.error || 'راجع بياناتك ثم أعد المحاولة.' });
      case 'rate_limited':
        return kafookNotice({ type: 'warning', title: 'محاولات كثيرة', message: 'أرسلت طلبات كثيرة خلال وقت قصير. انتظر دقائق ثم حاول، أو راسلنا وسنكمل الطلب معك.', secondary: contact });
      case 'payment_timing_conflict':
        return kafookNotice({ type: 'error', title: 'طريقة الدفع لا تطابق الطلب', message: 'هذا الطلب سُجّل بطريقة دفع أخرى. أعد اختيار طريقة الدفع، أو راسلنا.', secondary: contact });
      case 'network':
        return kafookNotice({ type: 'error', title: 'لا يوجد اتصال', message: 'تعذّر الوصول إلى كفوك. تأكّد من الإنترنت ثم اضغط «راجع طلبك» مرة أخرى — لن يتكرر طلبك.' });
      case 'server_error':
        return kafookNotice({ type: 'error', title: 'تعذّر حفظ طلبك الآن', message: 'حدث خلل مؤقت عندنا. حاول بعد قليل — لن يتكرر طلبك — أو راسلنا وسنكمله معك.', secondary: contact });
      default:
        return kafookNotice({ type: 'error', title: 'لم يُسجَّل الطلب', message: data.error || 'حاول مرة أخرى بعد قليل.', secondary: contact });
    }
  }

  document.addEventListener('focusin', function(e) {
    if (!e.target.matches || !e.target.matches('input,textarea')) return;
    e.target.classList.add('kafook-keyboard-safe');
    setTimeout(function() {
      try { e.target.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch(err) { e.target.scrollIntoView(); }
    }, 300);
  });
  document.addEventListener('focusout', function(e) {
    if (e.target.classList) e.target.classList.remove('kafook-keyboard-safe');
  });

  // +/− steppers were 24–28px wide: too narrow for a thumb (deep-clean, studio, apartment, villa)
  function widenSteppers() {
    document.querySelectorAll('button').forEach(function(b) {
      var t = b.textContent.trim();
      if (t === '+' || t === '−' || t === '-' || t === 'add' || t === 'remove' || t === 'close') {
        b.style.minWidth = '36px';
        b.style.minHeight = '36px';
      }
    });
    // back / home / maps links were 20–28px tall: a bigger tap area, same look
    document.querySelectorAll('button,a').forEach(function(b) {
      var t = b.textContent.replace(/\s+/g, ' ').trim();
      if (/رجوع|الرئيسية|افتح الخرائط/.test(t) && t.length < 30 && b.getBoundingClientRect().height < 36) {
        b.style.minHeight = '40px';
        b.style.display = 'inline-flex';
        b.style.alignItems = 'center';
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', widenSteppers); else widenSteppers();

  function setVh() { document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px'); }
  setVh();
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', function(){ setTimeout(setVh, 200); });

  // ===== State =====
  window.KafookState = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    set(patch) { var next = Object.assign({}, this.get(), patch); localStorage.setItem(KEY, JSON.stringify(next)); return next; },
    clear() { localStorage.removeItem(KEY); },
    addService(svc) {
      var s = this.get(); var services = s.services || [];
      var i = services.findIndex(function(x){ return x.id === svc.id; });
      if (i >= 0) services[i] = svc; else services.push(svc);
      this.set({ services: services });
    },
    setTotal(amount) { this.set({ totalPrice: amount }); },
    getTotal() { return this.get().totalPrice || 0; }
  };

  // Arabic-Indic / Persian digits → Latin: «٠٥٠…» typed on an Arabic keyboard used to be
  // stripped to nothing and refused as «رقم الجوال غير صحيح» (same rule as shared/digits.ts)
  function toLatinDigits(value) {
    return String(value || '')
      .replace(/[٠-٩]/g, function(d){ return String(d.charCodeAt(0) - 0x0660); })
      .replace(/[۰-۹]/g, function(d){ return String(d.charCodeAt(0) - 0x06F0); })
      .replace(/٫/g, '.').replace(/٬/g, ',');
  }
  window.kafookLatinDigits = toLatinDigits;

  // A cart that holds nothing chosen: no service, or a deep clean left at 0 ر.س
  function cartIsEmpty(s) {
    return !s.services || !s.services.length || !(Number(s.totalPrice) > 0);
  }
  function emptyCartNotice() {
    return kafookNotice({ type: 'info', title: 'اختر الخدمة أولاً',
      message: 'لا توجد خدمة في طلبك — ربما انتهى طلبك السابق أو فُتحت الصفحة مباشرة. اختر الخدمة ثم الموعد.',
      primary: { label: 'اختيار الخدمة', action: function(){ location.href = '/services.html'; } }, dismissible: false });
  }

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ---- Payment modal helpers ----
  var KAFOOK_CONFIG = null;
  async function loadKafookConfig() {
    if (KAFOOK_CONFIG) return KAFOOK_CONFIG;
    try {
      var r = await fetch('/api/config', { cache: 'no-store' });
      var j = await r.json();
      if (j && j.success) KAFOOK_CONFIG = j;
    } catch(e) { console.warn('[Kafook] config load failed', e); }
    return KAFOOK_CONFIG;
  }

  function showMoyasarModal(reference, totalHalalas) {
    var modal = document.getElementById('moyasar-modal');
    var refLabel = document.getElementById('moyasar-ref-label');
    if (!modal) { paymentUnavailableNotice(reference); return; }
    if (refLabel) refLabel.textContent = 'طلب ' + reference + ' · ' + (totalHalalas / 100).toFixed(2) + ' ر.س';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    var closeBtn = document.getElementById('moyasar-close');
    if (closeBtn && !closeBtn.dataset.wired) {
      closeBtn.dataset.wired = 'true';
      closeBtn.addEventListener('click', function() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        // The order is unpaid: its time is held only for a short while, so it is not
        // "confirmed" (the success page used to say so). «أكمل الدفع» reopens the form.
        kafookNotice({ type: 'warning', title: 'لم يكتمل الدفع بعد',
          message: 'طلبك ' + reference + ' محجوز لك مؤقتاً لبضع دقائق فقط. أكمل الدفع الآن ليُثبَّت الموعد، وإلا يُلغى الحجز تلقائياً.',
          primary: { label: 'أكمل الدفع', action: function(){ modal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; } },
          secondary: { label: 'سأدفع لاحقاً', action: function(){ resetReviewButton(); } } });
      });
    }
  }

  function paymentUnavailableNotice(reference) {
    return kafookNotice({ type: 'error', title: 'بوابة الدفع لا تفتح الآن',
      message: 'طلبك ' + (reference || '') + ' محفوظ. أعد المحاولة بعد لحظات، أو اختر «الدفع عند الوصول» وأكمل الطلب.',
      primary: { label: 'حسناً', action: function(){ resetReviewButton(); } } });
  }

  function resetReviewButton() {
    var btns = document.querySelectorAll('button');
    for (var i = 0; i < btns.length; i++) {
      if (btns[i].disabled && btns[i].textContent.indexOf('جاري الحفظ') !== -1) { btns[i].disabled = false; btns[i].innerHTML = '<span>راجع طلبك</span>'; }
    }
  }

  function initMoyasarForm(reference, totalHalalas, config) {
    if (typeof Moyasar === 'undefined') {
      document.getElementById('moyasar-modal') && document.getElementById('moyasar-modal').classList.add('hidden');
      document.body.style.overflow = '';
      paymentUnavailableNotice(reference);
      return;
    }
    try {
      Moyasar.init({
        element: '.mysr-form',
        amount: totalHalalas,
        currency: 'SAR',
        description: 'Kafook Order ' + reference,
        publishable_api_key: config.moyasarPublishableKey,
        callback_url: window.location.origin + '/payment-result.html',
        methods: ['creditcard', 'stcpay', 'applepay'],
        supported_networks: ['mada', 'visa', 'mastercard'],
        // Apple Pay (Web Registration via Moyasar — no Apple Developer account required).
        // validate_merchant_url points to Moyasar's own endpoint when using
        // Web Registration. Moyasar handles merchant validation with Apple.
        apple_pay: {
          country: 'SA',
          label: 'Kafook',
          validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
        },
        metadata: { order_reference: reference },
      });
    } catch(e) {
      console.error('[Kafook] Moyasar init failed', e);
      document.getElementById('moyasar-modal') && document.getElementById('moyasar-modal').classList.add('hidden');
      document.body.style.overflow = '';
      paymentUnavailableNotice(reference);
    }
  }

  // Live toggle styling for payment method radios (any page that has them)
  document.addEventListener('change', function(e) {
    if (!e.target || e.target.name !== 'paymentMethod') return;
    document.querySelectorAll('label[data-pm]').forEach(function(lbl) {
      lbl.classList.remove('border-brand-purple', 'bg-purple-50/50');
      lbl.classList.add('border-stone-200');
    });
    var parent = e.target.closest('label[data-pm]');
    if (parent) {
      parent.classList.remove('border-stone-200');
      parent.classList.add('border-brand-purple', 'bg-purple-50/50');
    }
  }, true);

  function bindByText(text, handler) {
    var els = document.querySelectorAll('button, a');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.textContent.trim().indexOf(text) !== -1 && !el.dataset.wired) {
        el.addEventListener('click', handler);
        el.dataset.wired = 'true';
        el.style.cursor = 'pointer';
        return el;
      }
    }
    return null;
  }

  function showToast(msg) {
    var toast = document.getElementById('kafook-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'kafook-toast';
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#2d1b4e;color:#ffd88d;padding:12px 20px;border-radius:12px;font-family:Cairo,sans-serif;font-size:14px;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.4);transition:opacity 0.3s;opacity:0;max-width:90vw;text-align:center;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(function(){ toast.style.opacity = '0'; }, 2200);
  }

  var BACK_FALLBACKS = {
    'services.html': '/index.html',
    'maintenance.html': '/services.html',
    'deep-clean.html': '/services.html',
    'bundles.html': '/deep-clean.html',
    'apartment.html': '/bundles.html',
    'villa.html': '/bundles.html',
    'pest-control.html': '/services.html',
    'date-time.html': '/services.html',
    'details.html': '/date-time.html',
    'success.html': '/index.html'
  };

  var path = location.pathname.split('/').pop() || 'index.html';
  var page = path.toLowerCase();
  var ourDomain = location.hostname;
  var referrerIsOurs = document.referrer && document.referrer.indexOf(ourDomain) !== -1;

  // ===== Back buttons — always use fallback for reliability =====
  document.querySelectorAll('button, a').forEach(function(el) {
    var t = (el.textContent || '').trim();
    var aria = (el.getAttribute && el.getAttribute('aria-label')) || '';
    var combined = t + ' ' + aria;
    if (!/(رجوع|الرجوع|العودة)/.test(combined)) return;
    if (el.dataset.kafookBackWired) return;
    if (t.indexOf('العودة للرئيسية') !== -1) return;
    if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href') !== '#') return;
    if (el.getAttribute('onclick')) return; // Respect inline handlers (maintenance back button)
    el.dataset.kafookBackWired = 'true';
    el.style.cursor = 'pointer';
    el.addEventListener('click', function(e) {
      e.preventDefault();
      vibrate(15);
      // Prefer history if user came from within our domain
      if (referrerIsOurs && window.history.length > 1) { window.history.back(); return; }
      location.href = BACK_FALLBACKS[page] || '/index.html';
    });
  });

  // ===== Logo → home =====
  var logoImg = document.querySelector('header img');
  if (logoImg && !logoImg.dataset.wired) {
    logoImg.style.cursor = 'pointer';
    logoImg.dataset.wired = 'true';
    logoImg.addEventListener('click', function() { location.href = '/index.html'; });
  }

  // ===== Notifications =====
  document.querySelectorAll('header button').forEach(function(btn) {
    if (btn.textContent.indexOf('notifications') !== -1 && !btn.dataset.wired) {
      btn.dataset.wired = 'true';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        vibrate(10);
        showToast('الإشعارات قريباً');
      });
    }
  });

  // ===== WhatsApp contact =====
  document.querySelectorAll('a[href="#"], button').forEach(function(el) {
    if (el.dataset.waWired) return;
    var t = el.textContent.trim();
    if (t.indexOf('تواصل معنا') === -1 && t.indexOf('تواصل مع كابتن') === -1) return;
    el.dataset.waWired = 'true';
    el.style.cursor = 'pointer';
    el.addEventListener('click', function(e) {
      e.preventDefault();
      vibrate(15);
      var msg = encodeURIComponent('مرحباً كابتن كفوك، أبغى أستفسر عن خدماتكم');
      window.open('https://wa.me/' + WA_NUMBER + '?text=' + msg, '_blank');
    });
  });

  // ===== Referral (خلي غيرك يستفيد) =====
  document.querySelectorAll('button, a').forEach(function(el) {
    if (el.dataset.refWired) return;
    if (el.textContent.trim().indexOf('خلي غيرك يستفيد') === -1) return;
    el.dataset.refWired = 'true';
    el.style.cursor = 'pointer';
    el.addEventListener('click', function(e) {
      e.preventDefault();
      vibrate(20);
      var url = window.location.origin;
      var msg = 'جرّب كفوك — بيتك بين يدين كابتن كفوك ' + url;
      if (navigator.share) {
        navigator.share({ title: 'كفوك', text: msg, url: url }).catch(function(){});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(msg).then(function(){ showToast('تم نسخ الرابط'); });
      } else { showToast(url); }
    });
  });

  // ===== Window badge decrement =====
  ['win-s','win-m','win-l'].forEach(function(id) {
    var badge = document.getElementById('badge-' + id);
    if (!badge || badge.dataset.wired) return;
    badge.dataset.wired = 'true';
    badge.style.cursor = 'pointer';
    badge.style.pointerEvents = 'auto';
    badge.title = 'اضغط لتقليل العدد';
    badge.addEventListener('click', function(e) {
      e.stopPropagation();
      vibrate(10);
      if (typeof window.adjustChipQty === 'function') {
        window.adjustChipQty(id, -1);
      }
    });
  });

  // ===== Vibration on any service card selection =====
  document.querySelectorAll('[onclick*="selectService"], [onclick*="selectTile"], .service-card, .service-tile').forEach(function(el) {
    if (el.dataset.vibWired) return;
    el.dataset.vibWired = 'true';
    el.addEventListener('click', function() { vibrate(25); });
  });

  // ===== Time slots — use inline styles for reliable highlight =====
  var timeBtnRegex = /^\d{1,2}:\d{2}\s*[صم]$/;
  var allTimeBtns = [];
  document.querySelectorAll('button').forEach(function(btn) {
    var t = btn.textContent.trim();
    if (!timeBtnRegex.test(t)) return;
    allTimeBtns.push({ el: btn, text: t });
  });

  var TAILWIND_HL = ['bg-royal','text-white','border-royal','font-bold','shadow-md','shadow-royal/30','ring-2','ring-gold/40'];

  function clearTimeHighlights() {
    allTimeBtns.forEach(function(b) {
      b.el.style.backgroundColor = '';
      b.el.style.color = '';
      b.el.style.borderColor = '';
      b.el.style.boxShadow = '';
      b.el.style.fontWeight = '';
      TAILWIND_HL.forEach(function(cl) { b.el.classList.remove(cl); });
    });
  }

  function highlightTime(btn) {
    btn.style.backgroundColor = '#5C1A6B';
    btn.style.color = '#ffffff';
    btn.style.borderColor = '#5C1A6B';
    btn.style.boxShadow = '0 0 0 2px rgba(199, 163, 92, 0.4)';
    btn.style.fontWeight = '700';
  }

  allTimeBtns.forEach(function(entry) {
    var btn = entry.el;
    if (btn.dataset.timeWired) return;
    if (btn.classList.contains('text-gray-300')) return;
    btn.dataset.timeWired = 'true';
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', function() {
      vibrate(20);
      clearTimeHighlights();
      highlightTime(btn);
      setTimeInState(entry.text);
    });
  });

  // The time the customer sees highlighted is the time that is booked. The date-time page
  // called this for its default 9:00 but it was never defined: the page threw, the default
  // was shown but never saved, and the order fell back to "3 days from now" at a random hour.
  function setTimeInState(text) {
    var m = String(text || '').match(/^(\d{1,2}):(\d{2})\s*(ص|م)$/);
    if (!m) return;
    var hour = parseInt(m[1], 10);
    var min = parseInt(m[2], 10);
    var ap = m[3];
    if (ap === 'م' && hour < 12) hour += 12;
    if (ap === 'ص' && hour === 12) hour = 0;
    var s = KafookState.get();
    var baseDate = s.selectedDateISO ? new Date(s.selectedDateISO) : new Date();
    var now = new Date();
    var target = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, min);
    if (target < now) target.setDate(target.getDate() + 1);
    KafookState.set({ requestedStartAt: target.toISOString(), selectedTimeText: text });
  }

  // ===== PAGE-SPECIFIC =====

  // ---- INDEX ----
  if (page === '' || page === 'index.html') {
    bindByText('ابدأ حجز خدمتك الآن', function(){ vibrate(20); location.href = '/services.html'; });
    bindByText('كابتن كفوك جاهز', function(){ vibrate(20); location.href = '/services.html'; });

    // Inject referral button above the main CTA if not already present
    if (!document.getElementById('kafook-ref-btn')) {
      var ctaBtn = null;
      document.querySelectorAll('button').forEach(function(b) {
        if (b.textContent.indexOf('ابدأ حجز خدمتك الآن') !== -1) ctaBtn = b;
      });
      if (ctaBtn && ctaBtn.parentNode) {
        var refBtn = document.createElement('button');
        refBtn.id = 'kafook-ref-btn';
        refBtn.type = 'button';
        refBtn.className = 'w-full mb-2.5 bg-gradient-to-r from-[#b38827] via-[#c69a35] to-[#a3791f] text-white py-3 px-4 rounded-[14px] flex items-center justify-center gap-2 font-bold text-sm shadow-md active:scale-[0.99] transition';
        refBtn.innerHTML = '<span>خلي غيرك يستفيد</span><span class="text-white text-sm">✦</span>';
        refBtn.addEventListener('click', function() {
          vibrate(20);
          var url = window.location.origin;
          var msg = 'جرّب كفوك — بيتك بين يدين كابتن كفوك ' + url;
          if (navigator.share) { navigator.share({ title: 'كفوك', text: msg, url: url }).catch(function(){}); }
          else if (navigator.clipboard) { navigator.clipboard.writeText(msg).then(function(){ showToast('تم نسخ الرابط'); }); }
          else { showToast(url); }
        });
        ctaBtn.parentNode.insertBefore(refBtn, ctaBtn);
      }
    }
  }

  // ---- SERVICES (v4: direct navigation on card tap) ----
  if (page === 'services.html') {
    document.querySelectorAll('.service-card').forEach(function(card) {
      var t = card.textContent;
      var target = null;
      if (t.indexOf('الصيانة والإصلاح') !== -1) target = '/maintenance.html';
      else if (t.indexOf('التنظيف العميق') !== -1) target = '/deep-clean.html';
      else if (t.indexOf('مكافحة الحشرات') !== -1) target = '/pest-control.html';
      if (!target) return;
      card.style.cursor = 'pointer';
      card.addEventListener('click', function(e) {
        vibrate(25);
        card.style.transform = 'scale(0.98)';
        setTimeout(function() { location.href = target; }, 180);
      });
    });
    bindByText('التالي: اختيار الموعد', function(e) {
      e.preventDefault();
      vibrate(10);
      showToast('اختر خدمة من الأعلى');
    });
  }

  // ---- MAINTENANCE ----
  if (page === 'maintenance.html') {
    var goDT = function(){
      vibrate(20);
      KafookState.set({
        services: [{ id: 'maintenance-inspection', name: 'فحص صيانة شامل', category: 'maintenance', qty: 1, config: {} }],
        totalPrice: 30
      });
      location.href = '/date-time.html';
    };
    bindByText('احجز فحص الصيانة الآن', goDT);
    bindByText('احجز الفحص فقط الآن', goDT);
  }

  // ---- DEEP CLEAN ----
  if (page === 'deep-clean.html') {
    bindByText('باقات شاملة', function(){ vibrate(15); location.href = '/bundles.html'; });
    var commitDC = function(){
      vibrate(20);
      var totalEl = document.getElementById('total-price');
      var total = totalEl ? parseInt(totalEl.textContent.replace(/[^\d]/g, ''), 10) || 0 : 0;
      var config = (typeof window.__getDeepCleanConfig === 'function') ? window.__getDeepCleanConfig() : {};
      // nothing chosen = an order for 0 ر.س that no team can execute
      if (total <= 0) {
        return kafookNotice({ type: 'info', title: 'اختر ما تريد تنظيفه',
          message: 'أضف قطعة واحدة على الأقل (كنب، سجاد، غرفة…) بزر «+» ليظهر لك السعر، ثم اضغط «متابعة الحجز».\nأو اختر باقة شاملة للشقة أو الفيلا.',
          primary: { label: 'حسناً' }, secondary: { label: 'الباقات الشاملة', action: function(){ location.href = '/bundles.html'; } } });
      }
      KafookState.set({
        services: [{ id: 'deep-clean-custom', name: 'تنظيف عميق — قطعة بقطعة', category: 'cleaning', qty: 1, config: config }],
        totalPrice: total
      });
      location.href = '/date-time.html';
    };
    bindByText('متابعة الحجز', commitDC);
  }

  // ---- BUNDLES (attribute-based routing — no text matching) ----
  if (page === 'bundles.html') {
    bindByText('قطعة بقطعة', function(){ vibrate(15); location.href = '/deep-clean.html'; });

    document.querySelectorAll('[data-package]').forEach(function(card) {
      if (card.dataset.wired) return;
      card.dataset.wired = 'true';
      card.style.cursor = 'pointer';
      card.addEventListener('click', function(e) {
        // Ignore clicks that hit an inner link or button with its own handler
        if (e.target && e.target.closest && e.target.closest('a[href]:not([href="#"])')) return;

        vibrate(25);
        var pkg = card.dataset.package;
        if (pkg === 'studio') {
          KafookState.set({
            propertyType: 'studio',
            basePrice: 250,
            totalPrice: 250,
            packageName: 'باقة ستوديو',
            services: [{ id: 'studio-package', name: 'باقة ستوديو', category: 'cleaning', qty: 1, config: { rooms: 1, kitchens: 1, baths: 1 } }]
          });
          location.href = '/studio.html';
        } else if (pkg === 'apartment') {
          KafookState.set({ propertyType: 'apartment', basePrice: 600, totalPrice: 640, packageName: 'باقة الشقة' });
          location.href = '/apartment.html';
        } else if (pkg === 'villa') {
          KafookState.set({ propertyType: 'villa', basePrice: 1200, totalPrice: 1200, packageName: 'باقة الفيلا' });
          location.href = '/villa.html';
        } else if (pkg === 'palace') {
          window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent('مرحباً، أبغى أستفسر عن خدمة القصور'), '_blank');
        }
      });
    });

    bindByText('التالي', function(e) {
      e.preventDefault();
      vibrate(10);
      showToast('اختر باقة (شقة أو فيلا) للمتابعة');
    });
  }

  // ---- APARTMENT ----
  if (page === 'apartment.html') {
    bindByText('أضف للطلب والجدولة', function(){
      vibrate(20);
      var totalEl = document.getElementById('grand-total');
      var total = totalEl ? parseInt(totalEl.textContent.replace(/[^\d]/g, ''), 10) || 640 : 640;
      var config = (typeof window.__getApartmentConfig === 'function') ? window.__getApartmentConfig() : {};
      KafookState.set({
        services: [{ id: 'apartment-package', name: 'باقة الشقة', category: 'cleaning', qty: 1, config: config }],
        totalPrice: total
      });
      location.href = '/date-time.html';
    });
  }

  // ---- STUDIO ----
  // Its «أضف للطلب والجدولة» had no handler: a customer who chose the studio bundle could not
  // go on. The page's config function is named __getApartmentConfig (copied from apartment).
  if (page === 'studio.html') {
    bindByText('أضف للطلب والجدولة', function(){
      vibrate(20);
      var totalEl = document.getElementById('grand-total');
      var total = totalEl ? parseInt(totalEl.textContent.replace(/[^\d]/g, ''), 10) || 250 : 250;
      var getCfg = window.__getStudioConfig || window.__getApartmentConfig;
      var config = (typeof getCfg === 'function') ? getCfg() : {};
      KafookState.set({
        propertyType: 'studio',
        services: [{ id: 'studio-package', name: 'باقة ستوديو', category: 'cleaning', qty: 1, config: config }],
        totalPrice: total
      });
      location.href = '/date-time.html';
    });
  }

  // ---- VILLA ----
  if (page === 'villa.html') {
    bindByText('أضف للطلب والجدولة', function(){
      vibrate(20);
      var totalEl = document.getElementById('total-price');
      var total = totalEl ? parseInt(totalEl.textContent.replace(/[^\d]/g, ''), 10) || 1200 : 1200;
      var config = (typeof window.__getVillaConfig === 'function') ? window.__getVillaConfig() : {};
      KafookState.set({
        services: [{ id: 'villa-package', name: 'باقة الفيلا', category: 'cleaning', qty: 1, config: config }],
        totalPrice: total
      });
      location.href = '/date-time.html';
    });
  }

  // ---- PEST CONTROL ----
  if (page === 'pest-control.html') {
    bindByText('متابعة حجز الخدمة', function(){
      vibrate(20);
      var pc = (KafookState.get() || {}).pestControl || { plan: 'preventive', property: 'floor', priceHalalas: 24900 };
      KafookState.set({
        services: [{ id: 'pest-control', name: 'مكافحة الحشرات', category: 'pest', qty: 1, config: pc }],
        totalPrice: pc.priceHalalas / 100
      });
      location.href = '/date-time.html';
    });
    bindByText('احجز الفحص فقط الآن', function(){
      vibrate(20);
      KafookState.set({
        services: [{ id: 'pest-inspection', name: 'فحص مكافحة حشرات', category: 'pest', qty: 1, config: {} }],
        totalPrice: 30
      });
      location.href = '/date-time.html';
    });
  }

  // ---- DATE-TIME (v4: clear hardcoded 9:00, then re-apply default) ----
  if (page === 'date-time.html' || page === 'details.html') {
    if (cartIsEmpty(KafookState.get())) setTimeout(emptyCartNotice, 300);
  }

  if (page === 'date-time.html') {
    initCalendar();
    // Strip any Tailwind highlight classes from all time buttons on load
    allTimeBtns.forEach(function(entry) {
      TAILWIND_HL.forEach(function(cl) { entry.el.classList.remove(cl); });
    });
    // The hour already chosen for this cart (kept across a reload), else 9:00 ص, else the first
    // available time
    var defaultBtn = null;
    var savedTime = KafookState.get().selectedTimeText;
    if (savedTime) {
      allTimeBtns.forEach(function(entry) {
        if (entry.text === savedTime && !entry.el.classList.contains('text-gray-300')) defaultBtn = entry;
      });
    }
    if (!defaultBtn) allTimeBtns.forEach(function(entry) {
      if (entry.text === '9:00 ص' && !entry.el.classList.contains('text-gray-300')) defaultBtn = entry;
    });
    if (!defaultBtn) {
      allTimeBtns.forEach(function(entry) {
        if (!defaultBtn && !entry.el.classList.contains('text-gray-300')) defaultBtn = entry;
      });
    }
    if (defaultBtn) {
      clearTimeHighlights();
      highlightTime(defaultBtn.el);
      setTimeInState(defaultBtn.text);
    }
    bindByText('كمل التفاصيل', function(){ vibrate(20); location.href = '/details.html'; });
    bindByText('التالي', function(){ vibrate(20); location.href = '/details.html'; });
  }

  // ---- DETAILS ----
  // [iCore] حقل البريد (اختياري) — الصفحة الحية بلا حقل بريد، فيُضاف بعد الجوال بنفس التنسيق.
  // يُرسل فقط ما يكتبه العميل؛ الحقل الفارغ لا يُرسل ولا يُستبدل بقيمة وهمية
  function ensureEmailField() {
    if (document.getElementById('customer-email')) return;
    var phoneField = document.querySelector('[data-purpose="form-field-phone"]');
    if (!phoneField || !phoneField.parentNode) return;
    var field = document.createElement('div');
    field.setAttribute('data-purpose', 'form-field-email');
    field.innerHTML = '<label class="block text-xs font-bold text-brand-dark mb-1.5 mr-0.5" for="customer-email">'
      + 'البريد الإلكتروني <span class="font-normal text-stone-400">(اختياري — لإرسال الفاتورة)</span></label>'
      + '<div class="relative"><input class="w-full bg-white border border-stone-200/90 rounded-[14px] py-3 px-4 text-sm text-brand-dark placeholder-stone-400/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all font-medium"'
      + ' dir="ltr" id="customer-email" name="email" type="email" inputmode="email" autocomplete="email" maxlength="150" placeholder="name@example.com"></div>';
    phoneField.parentNode.insertBefore(field, phoneField.nextSibling);
    var saved = (KafookState.get() || {}).email;
    if (saved) field.querySelector('input').value = saved;
  }
  if (page === 'details.html') ensureEmailField();

  // ---- DETAILS: the form survives a reload until the booking succeeds ----
  // A reload (or coming back from a failed payment) used to empty the name, district, address,
  // location and payment choice. Each field is kept in KafookState.detailsDraft as it is typed;
  // success.html clears it. An allow-list: the Moyasar card form on this page is never stored.
  var DRAFT_FIELDS = {
    firstName: '#first-name',
    phone: '#phone-number',
    district: '#district-name',
    email: '#customer-email',
    address: 'textarea',
    latitude: 'input[placeholder*="Latitude"], input[placeholder*="Lat"]',
    longitude: 'input[placeholder*="Longitude"], input[placeholder*="Lon"]'
  };
  function draftEl(selector) {
    var list = document.querySelectorAll(selector);
    for (var i = 0; i < list.length; i++) { if (!list[i].closest('#moyasar-modal')) return list[i]; }
    return null;
  }
  function saveDetailsDraft() {
    var draft = {};
    Object.keys(DRAFT_FIELDS).forEach(function(key) {
      var el = draftEl(DRAFT_FIELDS[key]);
      if (el) draft[key] = el.value;
    });
    var pm = document.querySelector('input[name="paymentMethod"]:checked');
    draft.paymentMethod = pm ? pm.value : '';
    KafookState.set({ detailsDraft: draft });
  }
  function restoreDetailsDraft() {
    var s = KafookState.get();
    var draft = s.detailsDraft || {};
    // the location button stores coordinates outside the draft — they count too
    var fallback = { latitude: s.latitude, longitude: s.longitude };
    Object.keys(DRAFT_FIELDS).forEach(function(key) {
      var value = draft[key] != null && draft[key] !== '' ? draft[key] : fallback[key];
      var el = draftEl(DRAFT_FIELDS[key]);
      if (!el || value == null || value === '') return;
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    if (draft.paymentMethod) {
      var radio = document.querySelector('input[name="paymentMethod"][value="' + draft.paymentMethod + '"]');
      if (radio && !radio.checked) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }
  if (page === 'details.html') {
    restoreDetailsDraft();
    ['input', 'change'].forEach(function(type) {
      document.addEventListener(type, function(e) {
        var t = e.target;
        if (!t || !t.matches || (t.closest && t.closest('#moyasar-modal'))) return;
        if (t.matches('input, textarea, select')) saveDetailsDraft();
      }, true);
    });
    // the location button fills lat/lng by script, which fires no input event
    window.addEventListener('pagehide', saveDetailsDraft);
  }

  if (page === 'details.html') {
    bindByText('راجع طلبك', async function(e){
      e.preventDefault();
      vibrate(20);
      var nameEl = document.getElementById('first-name');
      var phoneEl = document.getElementById('phone-number');
      var districtEl = document.getElementById('district-name');
      var name = nameEl ? nameEl.value.trim() : '';
      var phone = phoneEl ? toLatinDigits(phoneEl.value).trim() : '';
      var district = districtEl ? districtEl.value.trim() : '';
      var ta = document.querySelector('textarea');
      var address = ta ? ta.value.trim() : '';
      // each check names the field and focuses it after the notice closes
      var missing = function(title, message, el) { kafookNotice({ type: 'error', title: title, message: message, focus: el }); };
      if (!name || name.length < 2) return missing('اكتب اسمك', 'نحتاج اسمك الأول ليتعرّف عليك فريق كفوك.', nameEl);
      var phoneDigits = phone.replace(/\D+/g, '');
      if (phoneDigits.length < 9 || phoneDigits.length > 12) return missing('رقم الجوال غير صحيح', 'اكتب رقم جوالك بالصيغة 05XXXXXXXX — نرسل عليه تأكيد الطلب ورسالة الفريق.', phoneEl);
      if (!district || district.length < 2) return missing('اكتب الحي', 'اكتب اسم الحي بالعربي (مثل: الحمراء) ليصل الفريق الأقرب إليك.', districtEl);
      // [iCore] طريقة الدفع اختيار صريح: غيابها كان يصير «عند الوصول» فيُؤكَّد الطلب ويُرسل فريق بلا دفع
      var pmEl = document.querySelector('input[name="paymentMethod"]:checked');
      var paymentChannel = pmEl && (pmEl.value === 'online' || pmEl.value === 'pos') ? pmEl.value : '';
      if (!paymentChannel) return missing('اختر طريقة الدفع', 'اختر «الدفع الآن عبر الإنترنت» أو «الدفع عند الوصول».', document.querySelector('input[name="paymentMethod"]'));
      var emailEl = document.getElementById('customer-email');
      var email = emailEl ? emailEl.value.trim().toLowerCase() : '';
      if (email && (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))) {
        return missing('البريد الإلكتروني غير صحيح', 'صحّح البريد (مثل name@example.com) أو اتركه فارغاً — هو اختياري.', emailEl);
      }
      KafookState.set({ phone: phone, email: email });
      var s = KafookState.get();
      // no invented service either: «خدمة عامة» was booked for a cart the customer never filled
      if (cartIsEmpty(s)) return emptyCartNotice();
      var services = s.services;
      // no invented time: an order is booked only for a time the customer chose
      var requestedStartAt = s.requestedStartAt;
      if (!requestedStartAt || new Date(requestedStartAt).getTime() < Date.now()) {
        return kafookNotice({ type: 'warning', title: 'اختر موعد الزيارة',
          message: 'لم نجد موعداً محفوظاً لطلبك، أو أن الموعد مضى. اختر اليوم والساعة ثم أكمل — بياناتك محفوظة.',
          primary: { label: 'اختيار الموعد', action: function(){ location.href = '/date-time.html'; } }, secondary: { label: 'إغلاق' } });
      }
      var btns = document.querySelectorAll('button');
      var btn = null;
      for (var i = 0; i < btns.length; i++) {
        if (btns[i].textContent.indexOf('راجع طلبك') !== -1) { btn = btns[i]; break; }
      }
      if (btn) { btn.disabled = true; btn.innerHTML = '<span>جاري الحفظ...</span>'; }

      // [iCore] الإحداثيات تُرسل مع الطلب (كانت تُحفظ في المتصفح فقط) — منها تُحدَّد الفرقة الأقرب
      var latEl = document.querySelector('input[placeholder*="Latitude"], input[placeholder*="Lat"]');
      var lngEl = document.querySelector('input[placeholder*="Longitude"], input[placeholder*="Lon"]');
      var lat = toLatinDigits((latEl && latEl.value) || s.latitude || '').trim();
      var lng = toLatinDigits((lngEl && lngEl.value) || s.longitude || '').trim();
      var coordsOk = /^-?\d{1,3}(\.\d+)?$/.test(lat) && /^-?\d{1,3}(\.\d+)?$/.test(lng);

      // [iCore] مفتاح الإرسال ثابت للسلة نفسها: إعادة الضغط بعد انقطاع الشبكة لا تُنشئ طلباً ثانياً،
      // وتغيير الخدمة أو الموعد أو الجوال يُنشئ مفتاحاً جديداً
      var submissionSig = JSON.stringify([services, requestedStartAt, phone, paymentChannel]);
      var submissionKey = (s.submissionKey && s.submissionSig === submissionSig) ? s.submissionKey : uuidv4();
      KafookState.set({ submissionKey: submissionKey, submissionSig: submissionSig });

      try {
        var res = await fetch('/api/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: name, phone: phone, district: district,
            email: email || undefined,
            address: address || undefined,
            latitude: coordsOk ? lat : undefined,
            longitude: coordsOk ? lng : undefined,
            services: services, requestedStartAt: requestedStartAt,
            propertyType: s.propertyType || undefined,
            // طريقة الدفع الفعلية يكتبها الخادم من دفعة Moyasar عند التحقق — هذه قيمة مبدئية فقط
            paymentMethod: 'mada',
            whatsappConsent: true,
            submissionKey: submissionKey,
            clientTotalHalalas: Math.round((s.totalPrice || 0) * 100),
            paymentChannel: paymentChannel
          })
        });
        var data = null;
        try { data = await res.json(); } catch (parseErr) { data = { success: false, code: res.status >= 500 ? 'server_error' : 'conflict' }; }
        if (data.success) {
          vibrate([30,20,30]);
          if (paymentChannel === 'online') {
            var cfg = await loadKafookConfig();
            if (!cfg || !cfg.moyasarPublishableKey) {
              if (btn) { btn.disabled = false; btn.innerHTML = '<span>راجع طلبك</span>'; }
              paymentUnavailableNotice(data.reference);
              return;
            }
            showMoyasarModal(data.reference, data.totalHalalas);
            initMoyasarForm(data.reference, data.totalHalalas, cfg);
          } else {
            // synced = iCore booked the team; queued = saved here, iCore confirms when reachable
            var state = data.iCoreStatus === 'synced' ? 'confirmed' : 'received';
            location.href = '/success.html?ref=' + encodeURIComponent(data.reference) + '&state=' + state;
          }
        } else {
          if (btn) { btn.disabled = false; btn.innerHTML = '<span>راجع طلبك</span>'; }
          bookingErrorNotice(res.status, data);
        }
      } catch (err) {
        console.error(err);
        if (btn) { btn.disabled = false; btn.innerHTML = '<span>راجع طلبك</span>'; }
        bookingErrorNotice(0, { code: 'network' });
      }
    });
  }

  // ---- DETAILS: location share button ----
  if (page === 'details.html') {
    var shareBtn = null;
    document.querySelectorAll('button').forEach(function(b) {
      if (b.textContent.indexOf('شارك موقعي الحالي') !== -1) shareBtn = b;
    });
    if (shareBtn && !shareBtn.dataset.wired) {
      shareBtn.dataset.wired = 'true';
      shareBtn.style.cursor = 'pointer';
      shareBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (!navigator.geolocation) {
          kafookNotice({ type: 'warning', title: 'تحديد الموقع غير متاح', message: 'جهازك لا يدعم تحديد الموقع. اكتب الحي والعنوان يدوياً، أو افتح الخرائط وانسخ الإحداثيات.' });
          return;
        }
        var origText = shareBtn.innerHTML;
        shareBtn.innerHTML = '<span>جاري تحديد موقعك...</span>';
        navigator.geolocation.getCurrentPosition(
          function(pos) {
            var latInput = document.querySelector('input[placeholder*="Latitude"], input[placeholder*="Lat"]');
            var lngInput = document.querySelector('input[placeholder*="Longitude"], input[placeholder*="Lon"]');
            var lat = pos.coords.latitude.toFixed(6);
            var lng = pos.coords.longitude.toFixed(6);
            if (latInput) latInput.value = lat;
            if (lngInput) lngInput.value = lng;
            KafookState.set({ latitude: lat, longitude: lng });
            saveDetailsDraft();
            shareBtn.innerHTML = '<span>تم تحديد موقعك ✓</span>';
            if (navigator.vibrate) try { navigator.vibrate(30); } catch(e){}
            setTimeout(function(){ shareBtn.innerHTML = origText; }, 2500);
          },
          function(err) {
            shareBtn.innerHTML = origText;
            var msgs = { 1: 'رفضت إذن الموقع. فعّله من إعدادات المتصفح ثم اضغط «شارك موقعي» مرة أخرى، أو اكتب العنوان يدوياً.', 2: 'تعذّر تحديد موقعك الآن. تأكّد من تشغيل GPS، أو اكتب العنوان يدوياً.', 3: 'استغرق تحديد الموقع وقتاً طويلاً. حاول مرة أخرى في مكان مفتوح، أو اكتب العنوان يدوياً.' };
            kafookNotice({ type: 'warning', title: 'لم نحدّد موقعك', message: msgs[err.code] || 'تعذّر الحصول على موقعك — اكتب العنوان يدوياً.' });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      });
    }
  }

  // ---- SUCCESS ----
  if (page === 'success.html') {
    var ref = new URLSearchParams(location.search).get('ref');
    // The badge says what actually happened — it used to say «تم اعتماد» for every visitor,
    // even an unpaid order or one iCore had not confirmed yet
    var stateText = {
      paid: 'تم الدفع وتأكيد طلبك',
      confirmed: 'تم تأكيد طلبك — الدفع عند وصول الفريق',
      received: 'استلمنا طلبك — نؤكد الموعد خلال دقائق'
    }[new URLSearchParams(location.search).get('state') || ''];
    if (stateText) {
      var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null), tn;
      while ((tn = walk.nextNode())) { if (tn.nodeValue.indexOf('تم اعتماد الطلب بنجاح') !== -1) { tn.nodeValue = stateText; break; } }
    }
    if (ref) {
      var el = document.getElementById('orderIdText');
      if (el) el.textContent = '#' + ref;
      // [iCore] الطلب اكتمل — السلة التالية تأخذ مفتاح إرسال جديداً
      KafookState.set({ submissionKey: null, submissionSig: null });

      // Save order to localStorage for "طلباتي" page
      var sSave = KafookState.get();
      var saved = [];
      try { saved = JSON.parse(localStorage.getItem('kafook_my_orders') || '[]'); } catch(e) { saved = []; }
      var exists = false;
      for (var i = 0; i < saved.length; i++) { if (saved[i].ref === ref) exists = true; }
      if (!exists) {
        saved.unshift({
          ref: ref,
          phone: sSave.phone || '',
          service: (sSave.services && sSave.services[0]) ? sSave.services[0].name : 'خدمة',
          status: 'قيد المراجعة',
          date: new Date().toLocaleDateString('ar-SA'),
          requestedStartAt: sSave.requestedStartAt || ''
        });
        saved = saved.slice(0, 20);
        localStorage.setItem('kafook_my_orders', JSON.stringify(saved));
      }

      // Fix "متابعة حالة الطلب" buttons
      var trackUrl = '/order-status.html?ref=' + encodeURIComponent(ref) + '&phone=' + encodeURIComponent(sSave.phone || '');
      document.querySelectorAll('button').forEach(function(btn){
        var t = btn.textContent.trim();
        if (t.indexOf('متابعة حالة الطلب') !== -1) {
          btn.addEventListener('click', function(e){
            e.preventDefault();
            location.href = trackUrl;
          }, true);
        }
      });
    }
    var s = KafookState.get();
    if (s.requestedStartAt) {
      try {
        // Use stored local date + time — no timezone math
        var days = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
        var months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
        var dateStr = '—', timeStr = s.selectedTimeText || '—';
        if (s.selectedDate) {
          var dp = s.selectedDate.split('-');
          if (dp.length === 3) {
            var dt = new Date(parseInt(dp[0], 10), parseInt(dp[1], 10) - 1, parseInt(dp[2], 10));
            dateStr = days[dt.getDay()] + ' ' + dt.getDate() + ' ' + months[dt.getMonth()];
          }
        }
        // Direct DOM text-node replacement (much more reliable than innerHTML regex)
        var dateRx = /(الاثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت|الأحد)\s+\d{1,2}\s+(يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر)/;
        var replaced = 0;
        var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        var node;
        while (node = walker.nextNode()) {
          if (dateRx.test(node.nodeValue) || /—\s*\d{1,2}:\d{2}\s*(ص|م)/.test(node.nodeValue)) {
            node.nodeValue = dateStr + ' — ' + timeStr;
            replaced++;
          }
        }
        console.log('[Kafook] Success date:', dateStr, timeStr, '| replaced:', replaced);
      } catch(e) { console.error('[Kafook] success date error', e); }
    }
    // The order is saved (and shown above): empty the cart, keep the customer's contact details.
    // A second booking used to start with the previous service and time already in it.
    if (ref) {
      KafookState.set({ services: null, totalPrice: 0, requestedStartAt: null, selectedTimeText: null,
        selectedDate: null, selectedDateISO: null, pestControl: null, packageName: null, basePrice: null,
        detailsDraft: null });
    }
    bindByText('العودة للرئيسية', function(){ KafookState.clear(); vibrate(20); location.href = '/index.html'; });
    bindByText('متابعة حالة الطلب والفني', function(){ vibrate(15); showToast('سيتواصل معك الفريق قريباً'); });
    bindByText('متابعة حالة الطلب', function(){ vibrate(15); showToast('سيتواصل معك الفريق قريباً'); });
  }

  function initCalendar() {
    var grid = null;
    document.querySelectorAll('div').forEach(function(d) {
      if (grid) return;
      var cls = d.className || '';
      if (cls.indexOf('grid-cols-7') !== -1 && cls.indexOf('gap-y-2') !== -1) grid = d;
    });
    if (!grid) { console.warn('[Kafook] Calendar grid not found'); return; }

    var monthHeader = null;
    document.querySelectorAll('h2').forEach(function(h) {
      if (h.textContent.match(/september|سبتمبر|2026|أكتوبر|اكتوبر|نوفمبر|نوفم|أغسطس|اغسطس/i)) monthHeader = h;
    });

    var selectedDisplay = null;
    document.querySelectorAll('span').forEach(function(s) {
      var t = s.textContent.trim();
      if (/الاثنين|الثلاثاء|الأربعاء|الخميس|الجمعة|السبت|الأحد/.test(t) && /سبتمبر|أكتوبر|نوفمبر|يناير|فبراير|مارس|أبريل|مايو|يونيو|يوليو|أغسطس|ديسمبر/.test(t)) {
        if (!selectedDisplay) selectedDisplay = s;
      }
    });

    var monthNamesAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    var dayNamesAr = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

    var today = new Date();
    today.setHours(0,0,0,0);

    // the day already chosen for this cart (a reload used to jump back to tomorrow); a past
    // or missing day falls back to tomorrow
    var savedDay = null;
    var savedParts = String(KafookState.get().selectedDate || '').split('-');
    if (savedParts.length === 3) {
      savedDay = new Date(parseInt(savedParts[0], 10), parseInt(savedParts[1], 10) - 1, parseInt(savedParts[2], 10));
      savedDay.setHours(0,0,0,0);
      if (isNaN(savedDay.getTime()) || savedDay.getTime() < today.getTime()) savedDay = null;
    }
    var initialDay = savedDay || new Date(today.getTime() + 24*60*60*1000);
    var state = {
      year: initialDay.getFullYear(),
      month: initialDay.getMonth(),
      selectedDate: initialDay
    };

    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    function toISODate(d) { return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()); }

    function render() {
      if (monthHeader) {
        // Arabic always — the page is Arabic; «October 2026» came from the English design mock
        monthHeader.textContent = monthNamesAr[state.month] + ' ' + state.year;
      }

      // First Sunday on or before the 1st of the month
      var firstOfMonth = new Date(state.year, state.month, 1);
      firstOfMonth.setHours(0,0,0,0);
      var firstSunday = new Date(firstOfMonth);
      firstSunday.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());
      firstSunday.setHours(0,0,0,0);

      // Last Saturday on or after last day of the month
      var lastOfMonth = new Date(state.year, state.month + 1, 0);
      lastOfMonth.setHours(0,0,0,0);
      var lastSaturdayOffset = (6 - lastOfMonth.getDay() + 7) % 7;
      var lastDisplayed = new Date(lastOfMonth.getTime() + lastSaturdayOffset * 86400000);

      var totalDays = Math.round((lastDisplayed.getTime() - firstSunday.getTime()) / 86400000) + 1;
      var totalCells = Math.ceil(totalDays / 7) * 7;

      var html = '';
      // RTL grid columns are laid out [Sa, Fr, Th, We, Tu, Mo, Su]
      // So DOM column c corresponds to weekday (6 - c)
      // For a given DOM index i: r = floor(i/7), c = i%7, dayOffset = r*7 + (6 - c)
      for (var i = 0; i < totalCells; i++) {
        var r = Math.floor(i / 7);
        var col = i % 7;
        var dayOffset = r * 7 + (6 - col);
        var cellDate = new Date(firstSunday.getTime() + dayOffset * 86400000);
        cellDate.setHours(0,0,0,0);

        var dayNum = cellDate.getDate();
        var isCurrentMonth = (cellDate.getMonth() === state.month && cellDate.getFullYear() === state.year);
        var isPast = cellDate.getTime() < today.getTime();
        var isSelected = state.selectedDate && cellDate.getTime() === state.selectedDate.getTime();
        var isToday = cellDate.getTime() === today.getTime();

        if (isSelected) {
          html += '<div class="relative flex items-center justify-center" data-kf-ts="' + cellDate.getTime() + '">' +
                  '<div class="absolute inset-0 bg-[#faecc8]/70 rounded-xl -m-0.5"></div>' +
                  '<span class="relative z-10 w-7 h-7 bg-royal text-white font-bold rounded-lg flex items-center justify-center shadow-md shadow-royal/30">' + dayNum + '</span>' +
                  '</div>';
        } else if (isPast) {
          html += '<span class="py-1.5 text-gray-300">' + dayNum + '</span>';
        } else if (!isCurrentMonth) {
          html += '<span class="py-1.5 text-gray-400 hover:text-royal transition cursor-pointer" data-kf-ts="' + cellDate.getTime() + '">' + dayNum + '</span>';
        } else {
          var todayDot = isToday ? '<span style="display:inline-block;margin-right:3px;width:4px;height:4px;border-radius:50%;background:#e7c088;vertical-align:middle;"></span>' : '';
          var weight = isToday ? ' font-extrabold' : '';
          html += '<span class="py-1.5 text-gray-700 hover:text-royal transition cursor-pointer' + weight + '" data-kf-ts="' + cellDate.getTime() + '">' + dayNum + todayDot + '</span>';
        }
      }

      grid.innerHTML = html;

      grid.querySelectorAll('[data-kf-ts]').forEach(function(el) {
        el.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          var ts = parseInt(el.getAttribute('data-kf-ts'), 10);
          var picked = new Date(ts);
          picked.setHours(0,0,0,0);
          if (picked.getTime() < today.getTime()) return;
          if (navigator.vibrate) try { navigator.vibrate(20); } catch(err) {}
          state.selectedDate = picked;
          updateSelectedDisplay();
          KafookState.set({ selectedDate: toISODate(picked), selectedDateISO: picked.toISOString() });
          // the hour already chosen moves to the new day — the booked time kept the old day
          var chosenTime = KafookState.get().selectedTimeText;
          if (chosenTime) setTimeInState(chosenTime);
          render();
        });
      });
    }

    function updateSelectedDisplay() {
      if (!selectedDisplay) return;
      var d = state.selectedDate;
      var label = dayNamesAr[d.getDay()] + '\u060C ' + d.getDate() + ' ' + monthNamesAr[d.getMonth()];
      selectedDisplay.textContent = label;
      document.querySelectorAll('span').forEach(function(s) {
        var t = s.textContent;
        if (/\u0627\u0644\u0627\u062b\u0646\u064a\u0646\u060c 21/.test(t) || /\u0627\u0644\u0627\u062b\u0646\u064a\u0646\u060c 24/.test(t)) s.textContent = label;
      });
    }

    KafookState.set({ selectedDate: toISODate(state.selectedDate), selectedDateISO: state.selectedDate.toISOString() });
    updateSelectedDisplay();
    render();

    // Month navigation (prev / next)
    var navButtons = [];
    document.querySelectorAll('button').forEach(function(b) {
      var al = b.getAttribute('aria-label') || '';
      if (al.indexOf('\u0627\u0644\u062a\u0627\u0644\u064a') !== -1 || al.indexOf('\u0627\u0644\u0633\u0627\u0628\u0642') !== -1) navButtons.push(b);
    });
    if (navButtons.length >= 2) {
      navButtons[0].addEventListener('click', function(e) {
        e.preventDefault();
        state.month -= 1;
        if (state.month < 0) { state.month = 11; state.year -= 1; }
        if (state.year < today.getFullYear() || (state.year === today.getFullYear() && state.month < today.getMonth())) {
          state.year = today.getFullYear();
          state.month = today.getMonth();
        }
        render();
      });
      navButtons[1].addEventListener('click', function(e) {
        e.preventDefault();
        state.month += 1;
        if (state.month > 11) { state.month = 0; state.year += 1; }
        render();
      });
    }
  }

  console.log('[Kafook v3] Wired page:', page);
})();

// ===== KAFOOK HOME PROFILE (Batch 11B) =====
(function() {
  'use strict';

  var PROFILE_KEY = 'kafook_home_profile';
  var DISMISS_KEY = 'kafook_home_profile_dismissed';

  function getProfile() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null; }
    catch(e) { return null; }
  }

  function saveProfile(p) {
    p.savedAt = new Date().toISOString();
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  }

  function pageName() {
    return (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }

  function counterRow(key, label, emoji) {
    return '<div class="flex items-center justify-between p-2 mb-2 bg-[#faf0ff] rounded-2xl">'
      + '<div class="flex items-center gap-2 min-w-0">'
      + '<span class="text-base leading-none flex-shrink-0">' + (emoji || '') + '</span>'
      + '<span class="font-bold text-xs text-[#170338] truncate">' + label + '</span>'
      + '</div>'
      + '<div class="flex items-center bg-surface-container-lowest rounded-full p-1 shadow-xs flex-shrink-0">'
      + '<button data-adjust="' + key + '" data-delta="-1" type="button" class="w-7 h-7 rounded-full flex items-center justify-center bg-surface-container text-primary font-bold text-sm active:scale-90 transition-transform flex-shrink-0">−</button>'
      + '<span id="profile-' + key + '" class="w-7 text-center font-headline font-bold text-xs text-primary tabular-nums">0</span>'
      + '<button data-adjust="' + key + '" data-delta="1" type="button" class="w-7 h-7 rounded-full flex items-center justify-center bg-primary text-on-primary font-bold text-sm active:scale-90 transition-transform flex-shrink-0">+</button>'
      + '</div></div>';
}

  

  

  

  function maybeShowModal() {
    var page = pageName();
    if (page !== 'index.html' && page !== '') return;
    if (getProfile()) return;
    if (localStorage.getItem(DISMISS_KEY) === 'true') return;
    if (document.getElementById('kafook-profile-modal')) return;

    var state = { propertyType: '', rooms: 0, baths: 0, kitchens: 0, sofaSeats: 0, diningTables: 0, floors: 0 };

    var modal = document.createElement('div');
    modal.id = 'kafook-profile-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(23,3,56,0.78);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center;font-family:"Plus Jakarta Sans","IBM Plex Sans",system-ui,sans-serif;direction:rtl;padding:0;';

    modal.innerHTML = '<div id="kafook-profile-sheet" style="width:100%;max-width:min(500px,100vw);background:#fff7ff;border-radius:clamp(22px,6vw,32px) clamp(22px,6vw,32px) 0 0;box-shadow:0 -16px 48px rgba(23,3,56,0.5);display:flex;flex-direction:column;height:min(88vh,88dvh);max-height:min(88vh,88dvh);overflow:hidden;">'
      + '<div style="width:100%;height:4px;background:linear-gradient(90deg,transparent,#ffd88d,transparent);flex-shrink:0;"></div>'
      + '<div style="display:flex;justify-content:center;padding:clamp(8px,2.5vw,13px) 0 clamp(4px,1vw,6px);flex-shrink:0;"><div style="width:clamp(36px,10vw,48px);height:5px;border-radius:3px;background:rgba(232,193,120,0.6);"></div></div>'
      + '<div style="padding:clamp(2px,1vw,4px) clamp(14px,4vw,20px) clamp(6px,2vw,10px);text-align:center;flex-shrink:0;position:relative;">'
      + '<button id="kafook-profile-close" type="button" aria-label="إغلاق" style="position:absolute;top:0;left:clamp(14px,4vw,22px);width:clamp(28px,7vw,32px);height:clamp(28px,7vw,32px);border-radius:50%;background:#f6e9ff;border:none;color:#49454e;cursor:pointer;font-size:clamp(12px,3.2vw,14px);font-family:inherit;display:flex;align-items:center;justify-content:center;">✕</button>'
      + '<div style="width:clamp(36px,9vw,44px);height:clamp(36px,9vw,44px);margin:0 auto clamp(5px,1.5vw,7px);border-radius:clamp(11px,3vw,14px);background:linear-gradient(135deg,#f6e9ff 0%,#ffd88d 100%);display:flex;align-items:center;justify-content:center;font-size:clamp(18px,4.8vw,22px);box-shadow:0 5px 16px rgba(199,163,92,0.25);">🏠</div>'
      + '<h2 style="margin:0;font-size:clamp(14px,3.8vw,16px);font-weight:800;color:#170338;letter-spacing:-0.01em;line-height:1.2;">بيتك بين يدين كفوك</h2>'
      + '<p style="margin:clamp(2px,0.6vw,3px) 0 0;font-size:clamp(9.5px,2.5vw,10.5px);color:#7a757f;line-height:1.45;">خلّنا نعرف بيتك ونجهّز لك كل شي</p>'
      + '</div>'
      + '<div style="padding:0 clamp(12px,3.5vw,18px) clamp(5px,1.5vw,9px);overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1;min-height:0;">'
      + '<label style="font-weight:700;font-size:clamp(10px,2.6vw,11px);color:#170338;display:block;margin-bottom:clamp(3px,1vw,5px);">نوع البيت</label>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:clamp(4px,1.4vw,6px);margin-bottom:clamp(5px,1.5vw,8px);">'
      + '<button class="profile-type-btn" data-type="studio" type="button" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:clamp(4px,1.4vw,7px) 3px;min-height:clamp(38px,9.5vw,46px);border-radius:clamp(9px,2.6vw,12px);background:#f6e9ff;color:#170338;font-weight:700;font-size:clamp(9px,2.4vw,10.5px);border:2px solid transparent;cursor:pointer;font-family:inherit;transition:all 0.15s ease;"><span style="font-size:clamp(13px,3.6vw,16px);line-height:1;">🏢</span><span>ستوديو</span></button>'
      + '<button class="profile-type-btn" data-type="apartment" type="button" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:clamp(4px,1.4vw,7px) 3px;min-height:clamp(38px,9.5vw,46px);border-radius:clamp(9px,2.6vw,12px);background:#f6e9ff;color:#170338;font-weight:700;font-size:clamp(9px,2.4vw,10.5px);border:2px solid transparent;cursor:pointer;font-family:inherit;transition:all 0.15s ease;"><span style="font-size:clamp(13px,3.6vw,16px);line-height:1;">🏬</span><span>شقة</span></button>'
      + '<button class="profile-type-btn" data-type="villa" type="button" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:clamp(4px,1.4vw,7px) 3px;min-height:clamp(38px,9.5vw,46px);border-radius:clamp(9px,2.6vw,12px);background:#f6e9ff;color:#170338;font-weight:700;font-size:clamp(9px,2.4vw,10.5px);border:2px solid transparent;cursor:pointer;font-family:inherit;transition:all 0.15s ease;"><span style="font-size:clamp(13px,3.6vw,16px);line-height:1;">🏰</span><span>فيلا</span></button>'
      + '</div>'
      + counterRow('rooms', 'عدد الغرف', '🛏️')
      + counterRow('baths', 'عدد الحمامات', '🚿')
      + counterRow('kitchens', 'عدد المطابخ', '🍳')
      + counterRow('sofaSeats', 'عدد مقاعد الكنب', '🛋️')
      + counterRow('diningTables', 'عدد طاولات الطعام', '🍽️')
      + '<div id="kafook-floors-wrap" style="display:none;">' + counterRow('floors', 'عدد الأدوار', '🏗️') + '</div>'
      + '<div style="height:1px;background:linear-gradient(90deg,transparent,#cbc4d0,transparent);margin:clamp(5px,1.5vw,8px) 0;"></div>'
      + '<label style="font-weight:700;font-size:clamp(10px,2.6vw,11.5px);color:#170338;display:block;margin-bottom:clamp(3px,1vw,5px);">اسمك <span style="font-weight:400;color:#7a757f;">(اختياري)</span></label>'
      + '<input id="profile-name" type="text" placeholder="مثال: فراس" style="width:100%;padding:clamp(7px,1.8vw,9px) clamp(9px,2.2vw,11px);border-radius:clamp(8px,2.2vw,10px);background:#faf0ff;border:1.5px solid #e4d4f2;color:#170338;font-family:inherit;font-size:16px;outline:none;box-sizing:border-box;-webkit-text-size-adjust:100%;margin-bottom:clamp(5px,1.4vw,7px);transition:border-color 0.2s;">'
      + '<label style="font-weight:700;font-size:clamp(10px,2.6vw,11.5px);color:#170338;display:block;margin-bottom:clamp(3px,1vw,5px);">رقم الجوال <span style="font-weight:400;color:#7a757f;">(اختياري)</span></label>'
      + '<input id="profile-phone" type="tel" inputmode="tel" placeholder="05xxxxxxxx" style="width:100%;padding:clamp(7px,1.8vw,9px) clamp(9px,2.2vw,11px);border-radius:clamp(8px,2.2vw,10px);background:#faf0ff;border:1.5px solid #e4d4f2;color:#170338;font-family:inherit;font-size:16px;outline:none;box-sizing:border-box;direction:ltr;text-align:right;-webkit-text-size-adjust:100%;transition:border-color 0.2s;">'
      + '</div>'
      + '<div style="padding:clamp(8px,2.2vw,12px) clamp(12px,3.5vw,18px) calc(clamp(8px,2.2vw,12px) + env(safe-area-inset-bottom,0px));background:#fff7ff;border-top:1px solid rgba(203,196,208,0.25);display:flex;gap:clamp(8px,2vw,12px);flex-shrink:0;">'
      + '<button id="kafook-profile-skip" type="button" style="flex:1;padding:clamp(8px,2vw,10px);min-height:clamp(34px,8vw,42px);border-radius:clamp(8px,2.4vw,10px);background:#f6e9ff;color:#170338;font-weight:700;border:none;cursor:pointer;font-family:inherit;font-size:clamp(11px,2.8vw,12.5px);">تخطي</button>'
      + '<button id="kafook-profile-save" type="button" style="flex:2;padding:clamp(8px,2vw,10px);min-height:clamp(34px,8vw,42px);border-radius:clamp(8px,2.4vw,10px);background:linear-gradient(135deg,#170338,#2d1b4e);color:#ffffff;font-weight:800;border:none;cursor:pointer;font-family:inherit;font-size:clamp(11px,2.8vw,12.5px);box-shadow:0 4px 12px rgba(23,3,56,0.30);">حفظ</button>'
      + '</div>'
      + '</div>';

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    modal.querySelectorAll('.profile-type-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        state.propertyType = btn.dataset.type;
        modal.querySelectorAll('.profile-type-btn').forEach(function(b) {
          b.style.background = '#f6e9ff';
          b.style.color = '#170338';
          b.style.borderColor = 'transparent';
        });
        btn.style.background = '#170338';
        btn.style.color = '#ffffff';
        btn.style.borderColor = '#ffd88d';

        var floorsWrap = document.getElementById('kafook-floors-wrap');
        if (floorsWrap) {
          if (state.propertyType === 'villa') {
            floorsWrap.style.display = 'block';
          } else {
            floorsWrap.style.display = 'none';
            state.floors = 0;
            var floorsEl = document.getElementById('profile-floors');
            if (floorsEl) floorsEl.textContent = '0';
          }
        }
      });
    });

    modal.querySelectorAll('[data-adjust]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var key = btn.dataset.adjust;
        var delta = parseInt(btn.dataset.delta, 10);
        state[key] = Math.max(0, (state[key] || 0) + delta);
        var el = document.getElementById('profile-' + key);
        if (el) el.textContent = state[key];
      });
    });

    document.getElementById('kafook-profile-save').addEventListener('click', function() {
      if (!state.propertyType) {
        kafookNotice({ type: 'info', title: 'اختر نوع البيت', message: 'اختر استوديو أو شقة أو فيلا لنقترح لك الخدمات المناسبة.' });
        return;
      }
      var name = document.getElementById('profile-name').value.trim();
      var phone = document.getElementById('profile-phone').value.trim();
      saveProfile({
        propertyType: state.propertyType,
        rooms: state.rooms,
        baths: state.baths,
        kitchens: state.kitchens,
        sofaSeats: state.sofaSeats,
        diningTables: state.diningTables,
        floors: state.floors,
        firstName: name,
        phone: phone
      });
      modal.remove();
      document.body.style.overflow = '';
    });

    function dismiss() {
      localStorage.setItem(DISMISS_KEY, 'true');
      modal.remove();
      document.body.style.overflow = '';
    }
    document.getElementById('kafook-profile-skip').addEventListener('click', dismiss);
    document.getElementById('kafook-profile-close').addEventListener('click', dismiss);
  }

  

  function maybeShowSuggestBanner() {
    var profile = getProfile();
    if (!profile) return;
    if (document.getElementById('kafook-suggest-banner')) return;

    var page = pageName();
    var isServicesPage = (page === 'services.html');

    if (isServicesPage) {
      // On services.html, show banner regardless of profile type —
      // offers navigation to matching package
      if (localStorage.getItem('kafook_suggest_dismissed_' + page) === 'true') return;
    } else {
      var typeOnPage = null;
      if (page === 'apartment.html') typeOnPage = 'apartment';
      else if (page === 'villa.html') typeOnPage = 'villa';
      else if (page === 'studio.html') typeOnPage = 'studio';
      if (!typeOnPage) return;
      if (profile.propertyType !== typeOnPage) return;
      if (localStorage.getItem('kafook_suggest_dismissed_' + page) === 'true') return;
    }

    var typeAr = { studio: 'ستوديو', apartment: 'شقة', villa: 'فيلا' }[profile.propertyType];
    var summary = typeAr;
    if (profile.rooms) summary += ' — ' + profile.rooms + ' غرف';
    if (profile.baths) summary += '، ' + profile.baths + ' حمام';
    if (profile.kitchens) summary += '، ' + profile.kitchens + ' مطبخ';
    if (profile.sofaSeats) summary += '، ' + profile.sofaSeats + ' مقعد كنب';
    if (profile.diningTables) summary += '، ' + profile.diningTables + ' طاولة طعام';
    if (profile.floors && profile.propertyType === 'villa') summary += '، ' + profile.floors + ' أدوار';

    var ctaButton;
    if (isServicesPage) {
      var pkgUrl = profile.propertyType === 'villa' ? '/villa.html'
                 : profile.propertyType === 'studio' ? '/studio.html'
                 : '/apartment.html';
      ctaButton = '<button id="kafook-suggest-apply" type="button" data-navigate="' + pkgUrl + '" style="padding:7px 14px;border-radius:20px;background:#170338;color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;font-family:inherit;">احجز الآن</button>';
    } else {
      ctaButton = '<button id="kafook-suggest-apply" type="button" style="padding:7px 14px;border-radius:20px;background:#170338;color:#fff;font-weight:700;font-size:12px;border:none;cursor:pointer;font-family:inherit;">تطبيق</button>';
    }

    var banner = document.createElement('div');
    banner.id = 'kafook-suggest-banner';
    banner.style.cssText = 'margin:12px 16px 0;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,#ffdea3,#ffd88d);box-shadow:0 4px 16px rgba(199,163,92,0.25);display:flex;align-items:center;gap:10px;font-family:"Plus Jakarta Sans","IBM Plex Sans",system-ui,sans-serif;direction:rtl;';
    banner.innerHTML = '<span style="font-size:18px;">✨</span>'
      + '<div style="flex:1;min-width:0;">'
      + '<div style="font-weight:700;font-size:12.5px;color:#5c4203;">بناءً على بيتك:</div>'
      + '<div style="font-size:11.5px;color:#795c1d;margin-top:2px;">' + summary + '</div>'
      + '</div>'
      + ctaButton
      + '<button id="kafook-suggest-dismiss" type="button" style="width:24px;height:24px;border-radius:50%;background:rgba(121,92,29,0.15);color:#795c1d;font-weight:700;border:none;cursor:pointer;font-family:inherit;">✕</button>';

    if (isServicesPage) {
      // Insert at very top of main (above service cards)
      var mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.insertBefore(banner, mainEl.firstChild);
      } else {
        document.body.insertBefore(banner, document.body.firstChild);
      }
    } else {
      var addons = document.querySelector('.overflow-y-auto');
      if (addons && addons.parentNode) {
        addons.parentNode.insertBefore(banner, addons);
      } else {
        var main = document.querySelector('main');
        if (main) main.insertBefore(banner, main.firstChild);
        else document.body.insertBefore(banner, document.body.firstChild);
      }
    }

    document.getElementById('kafook-suggest-apply').addEventListener('click', function() {
      var navUrl = this.getAttribute('data-navigate');
      if (navUrl) {
        // Services page: navigate to matching package
        location.href = navUrl;
        return;
      }
      // Package page: apply profile quantities
      if (typeof window.__applyHomeProfile === 'function') {
        window.__applyHomeProfile(profile);
        this.textContent = 'تم ✓';
        this.disabled = true;
        this.style.background = '#775a1b';
      }
    });

    document.getElementById('kafook-suggest-dismiss').addEventListener('click', function() {
      localStorage.setItem('kafook_suggest_dismissed_' + page, 'true');
      banner.remove();
    });
  }

  function prefillDetails() {
    var profile = getProfile();
    if (!profile) return;
    if (pageName() !== 'details.html') return;
    var nameEl = document.getElementById('first-name');
    var phoneEl = document.getElementById('phone-number');
    if (nameEl && !nameEl.value && profile.firstName) nameEl.value = profile.firstName;
    if (phoneEl && !phoneEl.value && profile.phone) phoneEl.value = profile.phone;
  }

  function run() {
    try { maybeShowModal(); } catch(e) { console.warn('[Kafook profile] modal error', e); }
    try { maybeShowSuggestBanner(); } catch(e) { console.warn('[Kafook profile] banner error', e); }
    try { prefillDetails(); } catch(e) { console.warn('[Kafook profile] prefill error', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

/* KAFOOK × iCore — المواعيد المتاحة فعلاً في date-time.html
 *
 * التقويم كان يعرض الساعات كلها متاحة. الآن، عند اختيار اليوم، يسأل خادم كفوك
 * (/api/slots ← iCore) أيّ الساعات فيها فرقة متاحة، فتُعطَّل الباقية. وإن لم يكن
 * الربط مهيّأً (503) يبقى السلوك القديم كما هو.
 */
(function () {
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (page !== 'date-time.html' || !window.KafookState) return;

  var TIME_RX = /^\d{1,2}:\d{2}\s*[صم]$/;
  var lastDay = null;
  var seq = 0;

  function norm(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function isoDay(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function timeButtons() {
    return Array.prototype.filter.call(document.querySelectorAll('button'), function (b) { return TIME_RX.test(norm(b.textContent)); });
  }
  function toast(msg) {
    var t = document.getElementById('kafook-icore-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'kafook-icore-toast';
      t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#2d1b4e;color:#ffd88d;padding:12px 20px;border-radius:12px;font-family:Cairo,sans-serif;font-size:14px;z-index:9999;max-width:90vw;text-align:center;transition:opacity .3s;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(window.__kafookIcoreToast);
    window.__kafookIcoreToast = setTimeout(function () { t.style.opacity = '0'; }, 2600);
  }
  function setUnavailable(btn, off) {
    if (off) {
      btn.dataset.unavailable = '1';
      btn.style.opacity = '0.35';
      btn.style.textDecoration = 'line-through';
      btn.setAttribute('aria-disabled', 'true');
    } else {
      delete btn.dataset.unavailable;
      btn.style.opacity = '';
      btn.style.textDecoration = '';
      btn.removeAttribute('aria-disabled');
    }
  }

  // نقرة الوقت غير المتاح تُوقف قبل معالج الاختيار الأصلي (طور الالتقاط)
  timeButtons().forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (!btn.dataset.unavailable) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      toast('هذا الموعد غير متاح — اختر وقتاً آخر');
    }, true);
  });

  function refresh() {
    var s = KafookState.get();
    var day = s.selectedDate || (s.selectedDateISO ? isoDay(new Date(s.selectedDateISO)) : null);
    if (!day || day === lastDay) return;
    lastDay = day;
    var mine = ++seq;

    var q = new URLSearchParams({ date: day });
    (s.services || []).forEach(function (x) { if (x && x.id) q.append('services[]', x.id); });
    if (s.district) q.append('district', s.district);
    if (s.latitude && s.longitude) { q.append('lat', s.latitude); q.append('lng', s.longitude); }

    fetch('/api/slots?' + q.toString(), { cache: 'no-store' })
      .then(function (r) { return r.status === 503 ? null : r.json(); })
      .then(function (data) {
        if (mine !== seq || !data) return;
        if (!data.success) { toast(data.error || 'تعذّر جلب المواعيد الآن — حاول بعد قليل'); return; }

        // A location saved from an earlier visit (e.g. a district outside coverage) makes iCore
        // answer "not covered" with no slots. Every hour used to turn grey with a 2-second toast
        // that was then overwritten by "no slots this day" — the customer never learned why.
        if (data.covered === false && (s.district || s.latitude)) {
          timeButtons().forEach(function (btn) { setUnavailable(btn, true); });
          KafookState.set({ requestedStartAt: null, selectedTimeText: null });
          var where = s.district ? '(' + s.district + ') ' : '';
          window.kafookNotice({ type: 'warning', title: 'موقعك المحفوظ خارج نطاق الخدمة',
            message: 'آخر موقع أدخلته ' + where + 'لا تصله فرقنا حالياً، لذلك لا تظهر مواعيد.\nاعرض المواعيد بدونه ثم أدخل حيّاً داخل نطاقنا في الخطوة التالية، أو راسلنا لنخبرك متى نصل إليك.',
            primary: { label: 'عرض المواعيد بدون هذا الموقع', action: function () {
              KafookState.set({ district: null, latitude: null, longitude: null });
              lastDay = null;
              refresh();
            } },
            secondary: { label: 'تواصل معنا عبر واتساب', action: function () {
              window.open('https://wa.me/966554949251?text=' + encodeURIComponent('مرحباً، هل تصلون إلى ' + (s.district || 'موقعي') + '؟'), '_blank');
            } } });
          return;
        }

        var available = {};
        (data.slots || []).forEach(function (slot) { available[norm(slot.label)] = slot.available === true; });

        var chosen = norm(KafookState.get().selectedTimeText);
        var chosenOk = false;
        var firstFree = null;
        timeButtons().forEach(function (btn) {
          var label = norm(btn.textContent);
          var ok = available[label] === true;
          setUnavailable(btn, !ok);
          if (ok && !firstFree) firstFree = btn;
          if (ok && label === chosen) chosenOk = true;
        });

        if (!chosenOk) {
          if (firstFree) {
            firstFree.click();
          } else {
            KafookState.set({ requestedStartAt: null, selectedTimeText: null });
            window.kafookNotice({ type: 'info', title: 'هذا اليوم ممتلئ',
              message: 'كل مواعيد ' + new Date(day + 'T12:00:00').toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' }) + ' محجوزة. اختر يوماً آخر من التقويم — الأيام القريبة غالباً فيها مواعيد.' });
          }
        }
      })
      .catch(function () { /* بلا اتصال: يبقى العرض كما كان */ });
  }

  // التقويم يكتب اليوم المختار في KafookState — نراقبه
  var originalSet = KafookState.set.bind(KafookState);
  KafookState.set = function (patch) {
    var result = originalSet(patch);
    if (patch && ('selectedDate' in patch || 'selectedDateISO' in patch)) setTimeout(refresh, 0);
    return result;
  };

  setTimeout(refresh, 60);
})();
