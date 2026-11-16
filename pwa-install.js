/* KAFOOK — PWA Install Prompt
   Shows a branded banner inviting visitors to install the app.
   - Android/Chrome: uses beforeinstallprompt to trigger native install
   - iOS/Safari: shows step-by-step Add to Home Screen instructions
*/
(function () {
  "use strict";

  var DISMISS_KEY = "kafook_pwa_dismissed_at";
  var DISMISS_DAYS = 30;
  var SHOW_DELAY_MS = 3500;

  var isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (isStandalone) return;

  function dismissedRecently() {
    try {
      var t = localStorage.getItem(DISMISS_KEY);
      if (!t) return false;
      var days = (Date.now() - Number(t)) / (1000 * 60 * 60 * 24);
      return days < DISMISS_DAYS;
    } catch (e) {
      return false;
    }
  }
  function rememberDismissal() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (e) {}
  }

  var ua = window.navigator.userAgent || "";
  var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  var isSafari = /^((?!chrome|android).)*safari/i.test(ua);

  function buildBanner() {
    var wrap = document.createElement("div");
    wrap.id = "kafook-install-banner";
    wrap.setAttribute("dir", "rtl");
    wrap.style.cssText = [
      "position:fixed",
      "left:16px",
      "right:16px",
      "bottom:16px",
      "z-index:9000",
      "background:#FAF5EE",
      "border:1px solid rgba(196,160,106,0.4)",
      "border-radius:20px",
      "box-shadow:0 8px 32px rgba(45,27,78,0.18)",
      "padding:16px",
      "display:flex",
      "gap:12px",
      "align-items:center",
      "font-family:Cairo,sans-serif",
      "opacity:0",
      "transform:translateY(20px)",
      "transition:opacity .3s ease, transform .3s ease"
    ].join(";");

    wrap.innerHTML =
      '<div style="flex-shrink:0;width:48px;height:48px;border-radius:12px;background:#5C1A6B;display:flex;align-items:center;justify-content:center;">' +
      '<img src="/assets/kafook-logo.svg" alt="kafook" style="width:32px;height:32px;object-fit:contain;">' +
      "</div>" +
      '<div style="flex:1;min-width:0;text-align:right;">' +
      '<div style="font-weight:800;font-size:15px;color:#5C1A6B;margin-bottom:2px;">ثبّت تطبيق كفوك</div>' +
      '<div id="kafook-install-hint" style="font-weight:500;font-size:12px;color:#6b5f6e;line-height:1.4;">للوصول السريع والعروض الحصرية</div>' +
      "</div>" +
      '<button id="kafook-install-btn" type="button" style="flex-shrink:0;background:#5C1A6B;color:#fff;border:none;border-radius:12px;padding:10px 16px;font-weight:700;font-size:13px;font-family:Cairo,sans-serif;cursor:pointer;">تثبيت</button>' +
      '<button id="kafook-install-close" type="button" aria-label="close" style="flex-shrink:0;background:transparent;border:none;color:#9a8d99;font-size:20px;line-height:1;cursor:pointer;padding:4px 6px;">✕</button>';

    return wrap;
  }

  var banner = null;
  function showBanner() {
    if (!banner) {
      banner = buildBanner();
      document.body.appendChild(banner);
    }
    requestAnimationFrame(function () {
      banner.style.opacity = "1";
      banner.style.transform = "translateY(0)";
    });
  }
  function hideBanner() {
    if (!banner) return;
    banner.style.opacity = "0";
    banner.style.transform = "translateY(20px)";
  }

  function showIOSInstructions() {
    var overlay = document.createElement("div");
    overlay.setAttribute("dir", "rtl");
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "z-index:9500",
      "background:rgba(20,18,27,0.75)",
      "display:flex",
      "align-items:flex-end",
      "justify-content:center",
      "font-family:Cairo,sans-serif",
      "padding:16px"
    ].join(";");

    overlay.innerHTML =
      '<div style="background:#FAF5EE;border-radius:24px;padding:24px;max-width:420px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.4);">' +
      '<div style="text-align:center;margin-bottom:20px;">' +
      '<img src="/assets/kafook-logo.svg" style="width:56px;height:56px;" alt="kafook">' +
      '<h2 style="font-size:18px;font-weight:800;color:#5C1A6B;margin:12px 0 4px;">ثبّت تطبيق كفوك</h2>' +
      '<p style="font-size:13px;color:#6b5f6e;margin:0;">اتبع هذه الخطوات البسيطة</p>' +
      "</div>" +
      '<ol style="list-style:none;padding:0;margin:0 0 20px;">' +
      '<li style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px;">' +
      '<span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#5C1A6B;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;">1</span>' +
      '<span style="font-size:14px;color:#20172c;line-height:1.5;">افتح القائمة من زر <strong>المشاركة</strong> أسفل الشاشة</span>' +
      "</li>" +
      '<li style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px;">' +
      '<span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#5C1A6B;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;">2</span>' +
      '<span style="font-size:14px;color:#20172c;line-height:1.5;">اختر <strong>إضافة إلى الشاشة الرئيسية</strong></span>' +
      "</li>" +
      '<li style="display:flex;gap:12px;align-items:flex-start;">' +
      '<span style="flex-shrink:0;width:28px;height:28px;border-radius:50%;background:#5C1A6B;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;">3</span>' +
      '<span style="font-size:14px;color:#20172c;line-height:1.5;">اضغط <strong>إضافة</strong> وسيظهر التطبيق على شاشتك</span>' +
      "</li>" +
      "</ol>" +
      '<button id="kafook-ios-close" type="button" style="width:100%;background:#5C1A6B;color:#fff;border:none;border-radius:14px;padding:14px;font-weight:700;font-size:15px;font-family:Cairo,sans-serif;cursor:pointer;">فهمت</button>' +
      "</div>";

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    var closeBtn = overlay.querySelector("#kafook-ios-close");
    closeBtn.addEventListener("click", function () {
      overlay.remove();
      document.body.style.overflow = "";
      rememberDismissal();
    });
  }

  var deferredPrompt = null;

  function wireBannerHandlers(onInstall) {
    var installBtn = document.getElementById("kafook-install-btn");
    var closeBtn = document.getElementById("kafook-install-close");

    if (installBtn && !installBtn.dataset.wired) {
      installBtn.dataset.wired = "true";
      installBtn.addEventListener("click", onInstall);
    }
    if (closeBtn && !closeBtn.dataset.wired) {
      closeBtn.dataset.wired = "true";
      closeBtn.addEventListener("click", function () {
        hideBanner();
        rememberDismissal();
      });
    }
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;

    if (dismissedRecently()) return;

    setTimeout(function () {
      showBanner();
      wireBannerHandlers(function () {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choice) {
          if (choice.outcome === "accepted") {
            hideBanner();
            rememberDismissal();
          }
          deferredPrompt = null;
        });
      });
    }, SHOW_DELAY_MS);
  });

  window.addEventListener("load", function () {
    if (!isIOS || !isSafari || dismissedRecently()) return;

    setTimeout(function () {
      showBanner();

      var hint = document.getElementById("kafook-install-hint");
      if (hint) hint.textContent = "أضف كفوك لشاشة هاتفك بخطوات بسيطة";

      wireBannerHandlers(function () {
        hideBanner();
        showIOSInstructions();
      });
    }, SHOW_DELAY_MS);
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").catch(function (err) {
        console.warn("[Kafook] SW registration failed:", err);
      });
    });
  }
})();