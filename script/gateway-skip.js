(function () {
  if (window.__Nerona_GATEWAY_SKIP) return;
  window.__Nerona_GATEWAY_SKIP = true;

  var KEY = 'Nerona_toggle_gateway_skip';

  var payBtnSelectors = [
    'button[type="submit"]',
    'button.SubmitButton',
    'button[data-testid="hosted-payment-submit-button"]',
    '.SubmitButton-IconContainer',
    'button[data-testid="submit-button"]',
    'button[class*="SubmitButton"]',
    '#pay-button',
    'button.PayButton'
  ];

  function autoCheckConsent() {
    document.querySelectorAll('input[type="checkbox"][required], input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="consent"], input[type="checkbox"][name*="agree"]').forEach(function (cb) {
      if (!cb.checked) {
        try { cb.click(); } catch (e) {}
      }
    });
  }

  function trySkip() {
    autoCheckConsent();
    for (var i = 0; i < payBtnSelectors.length; i++) {
      try {
        var btn = document.querySelector(payBtnSelectors[i]);
        if (btn && !btn.disabled && btn.offsetParent !== null) {
          btn.click();
          console.info('[KIORAxAUTO Gateway Skip] Clicked pay button:', payBtnSelectors[i]);
          return true;
        }
      } catch (e) {}
    }
    return false;
  }

  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) return;
  try { chrome.storage.local.get([KEY], function (cfg) {
    if (chrome.runtime.lastError || !cfg[KEY]) return;

    var url = window.location.href.toLowerCase();
    var host = window.location.hostname.toLowerCase();
    var isCheckout = host.indexOf('stripe.com') !== -1 ||
      url.indexOf('/cs_live_') !== -1 ||
      url.indexOf('/cs_test_') !== -1 ||
      host.indexOf('buy.stripe.com') !== -1 ||
      host.indexOf('checkout.stripe.com') !== -1;

    if (!isCheckout) return;

    if (trySkip()) return;

    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      if (trySkip() || attempts >= 20) clearInterval(interval);
    }, 500);

    var observer = new MutationObserver(function () { trySkip(); });
    try {
      observer.observe(document.body, { childList: true, subtree: true });
      setTimeout(function () { observer.disconnect(); }, 30000);
    } catch (e) {}
  }); } catch(e) {}
})();
