// Nerona Panel Load Init — set initial toggle states from chrome.storage.local
// before the main panel app wires its own handlers.
(function () {
  if (window.__Nerona_PANEL_LOAD_INIT) return;
  window.__Nerona_PANEL_LOAD_INIT = true;

  var map = {
    'Nerona_toggle_hit_sound': 'hitSound',
    'Nerona_toggle_auto_ss': 'autoSS',
    'Nerona_3ds_auto_cancel': 'bypass3ds',
    'Nerona_blur_email': 'blurEmail',
    'Nerona_tg_user_ss': 'tgUserSs',
    'Nerona_fx_enabled': 'fx',
    'Nerona_toggle_gateway_skip': 'gatewaySkip'
  };

  function setInitialStates() {
    try {
      chrome.storage.local.get(Object.keys(map), function (data) {
        if (chrome.runtime.lastError) return;
        Object.keys(map).forEach(function (key) {
          var toggleType = map[key];
          var val = data[key];
          if (typeof val !== 'boolean') return;
          var input = document.querySelector('.ios-toggle input[data-toggle="' + toggleType + '"], .ios-toggle-wrapper input[data-toggle="' + toggleType + '"]');
          if (input) input.checked = val;
        });
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setInitialStates, { once: true });
  } else {
    setInitialStates();
  }
})();
