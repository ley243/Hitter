(function () {
  if (window.__Nerona_AUTO_3DS_CANCEL) return;
  window.__Nerona_AUTO_3DS_CANCEL = true;

  var CFG_KEY = 'Nerona_3ds_auto_cancel';

  var selectors = {
    frame: ['iframe[name^="__privateStripe"]', 'iframe[src*="3ds"]'],
    cancelBtn: ['[aria-label="Cancel" i]', '[aria-label="Close" i]', '[data-testid="close"]', 'button[name="cancel"]', '.ChallengeCancel', '#test-source-fail-3ds', '#test-source-authorize-3ds', '.ChallengeActions button'],
    challengeIframe: 'iframe[src*="3dsecure"]',
    challengeDialog: '[role="dialog"][aria-modal="true"][data-testid*="challenge"]'
  };

  function findCancel(el) {
    try {
      if (el.nodeName === 'IFRAME') {
        var doc = el.contentDocument || (el.contentWindow && el.contentWindow.document);
        if (!doc) return null;
        return doc.querySelector(selectors.cancelBtn.join(',')) || null;
      }
      return el.querySelector(selectors.cancelBtn.join(',')) || null;
    } catch (e) { return null; }
  }

  function cancel3dsOnce() {
    try {
      var candidates = [];
      selectors.frame.forEach(function (s) { candidates.push.apply(candidates, document.querySelectorAll(s)); });
      if (selectors.challengeIframe) candidates.push.apply(candidates, document.querySelectorAll(selectors.challengeIframe));
      candidates.push.apply(candidates, document.querySelectorAll(selectors.challengeDialog));

      for (var i = 0; i < candidates.length; i++) {
        var cancel = findCancel(candidates[i]);
        if (cancel && cancel.click) { cancel.click(); return true; }
      }
      for (var j = 0; j < selectors.cancelBtn.length; j++) {
        var btn = document.querySelector(selectors.cancelBtn[j]);
        if (btn && btn.click) { btn.click(); return true; }
      }
      return false;
    } catch (e) { return false; }
  }

  function _neronaCtxOk() {
    try { return !!(typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id); }
    catch(e) { return false; }
  }

  function runAuto3ds(callback) {
    if (!_neronaCtxOk()) { callback(false); return; }
    try {
      chrome.storage.local.get([CFG_KEY], function (cfg) {
        if (chrome.runtime.lastError || !cfg[CFG_KEY]) { callback(false); return; }
        var cancelled = cancel3dsOnce();
        if (cancelled) {
          console.info('[KIORAxAUTO 3DS Cancel] Cancel/Close button clicked');
          callback(true);
          return;
        }
        var observer = new MutationObserver(function () { cancel3dsOnce(); });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(function () { try { observer.disconnect(); } catch (e) {} }, 75000);
        callback(false);
      });
    } catch(e) { callback(false); }
  }

  var url = window.location.href.toLowerCase();
  var host = window.location.hostname.toLowerCase();
  var isStripe = host.indexOf('stripe.com') !== -1 || url.indexOf('/cs_live_') !== -1 || url.indexOf('/cs_test_') !== -1;

  if (!isStripe) return;

  runAuto3ds(function (done) {
    if (done) return;
    var wait = 1200;
    var attempts = 0;
    var interval = setInterval(function () {
      attempts++;
      var result = cancel3dsOnce();
      if (result || attempts >= 12) clearInterval(interval);
      wait += 200;
    }, wait);
  });
})();
