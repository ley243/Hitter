// Nerona iOS Toggle Wiring — non-injection, panel-only
// Wires all iOS-style switches to chrome.storage.local and cross-syncs state.
(function () {
  if (window.__Nerona_IOS_TOGGLE_WIRED) return;
  window.__Nerona_IOS_TOGGLE_WIRED = true;

  // Map data-toggle attribute to chrome.storage.local key.
  var TOGGLE_MAP = {
    hitSound: 'Nerona_toggle_hit_sound',
    autoSS: 'Nerona_toggle_auto_ss',
    bypass3ds: 'Nerona_3ds_auto_cancel',
    blurEmail: 'Nerona_blur_email',
    tgUserSs: 'Nerona_tg_user_ss',
    fx: 'Nerona_fx_enabled',
    gatewaySkip: 'Nerona_toggle_gateway_skip'
  };

  function getInput(toggle) {
    return toggle.querySelector('input[type="checkbox"]');
  }

  function findToggle(input) {
    return input.closest('.ios-toggle, .ios-toggle-wrapper');
  }

  function wireToggle(toggle) {
    if (toggle._neronaWired) return;
    toggle._neronaWired = true;

    var input = getInput(toggle);
    if (!input) return;

    var toggleType = input.dataset.toggle;
    if (!toggleType) return;

    var key = TOGGLE_MAP[toggleType];
    if (!key) return;

    input.addEventListener('change', function () {
      var checked = !!input.checked;
      try {
        chrome.storage.local.set({ [key]: checked }, function () {
          if (chrome.runtime.lastError) {
            console.warn('[KIORAxAUTO Toggle] save error:', chrome.runtime.lastError.message);
          }
        });
      } catch (e) {
        console.warn('[KIORAxAUTO Toggle] save error:', e);
      }
      try {
        window.postMessage({ type: 'Nerona_TOGGLE_STATE_CHANGED', toggleType: toggleType, value: checked }, '*');
      } catch (e) {}
    }, { passive: true });
  }

  function scanAndWire() {
    document.querySelectorAll('.ios-toggle, .ios-toggle-wrapper').forEach(wireToggle);
  }

  function loadInitialStates() {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) return;
    try {
      chrome.storage.local.get(Object.keys(TOGGLE_MAP).map(function (k) { return TOGGLE_MAP[k]; }), function (data) {
        if (chrome.runtime.lastError) return;
        Object.keys(TOGGLE_MAP).forEach(function (toggleType) {
          var key = TOGGLE_MAP[toggleType];
          if (typeof data[key] !== 'boolean') return;
          var input = document.querySelector('.ios-toggle input[data-toggle="' + toggleType + '"], .ios-toggle-wrapper input[data-toggle="' + toggleType + '"]');
          if (input) input.checked = data[key];
        });
      });
    } catch (e) {}
  }

  function listenForExternalChanges() {
    try {
      chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'local') return;
        Object.keys(TOGGLE_MAP).forEach(function (toggleType) {
          var key = TOGGLE_MAP[toggleType];
          if (!changes[key]) return;
          var input = document.querySelector('.ios-toggle input[data-toggle="' + toggleType + '"], .ios-toggle-wrapper input[data-toggle="' + toggleType + '"]');
          if (input && input.checked !== changes[key].newValue) input.checked = changes[key].newValue;
        });
      });
    } catch (e) {}
  }

  // Wire existing toggles immediately.
  scanAndWire();
  loadInitialStates();
  listenForExternalChanges();

  // Watch for dynamically added toggles.
  var observer = new MutationObserver(function (mutations) {
    var shouldScan = false;
    for (var i = 0; i < mutations.length; i++) {
      var mutation = mutations[i];
      if (mutation.type !== 'childList') continue;
      for (var j = 0; j < mutation.addedNodes.length; j++) {
        var node = mutation.addedNodes[j];
        if (node.nodeType !== 1) continue;
        if (node.matches && (node.matches('.ios-toggle') || node.matches('.ios-toggle-wrapper') || node.querySelector && (node.querySelector('.ios-toggle') || node.querySelector('.ios-toggle-wrapper')))) {
          shouldScan = true;
          break;
        }
      }
      if (shouldScan) break;
    }
    if (shouldScan) scanAndWire();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanAndWire, { once: true });
  }
})();
