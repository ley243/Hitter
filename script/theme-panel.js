// KIORAxAUTO Panel Theme Controller — non-injection version
// Applies theme + effects only to the extension panel. No webpage injection.
(function () {
  if (window.__Nerona_PANEL_THEME_LOADED) return;
  window.__Nerona_PANEL_THEME_LOADED = true;

  var THEME_KEY = 'Nerona_theme_config';
  var FX_KEY = 'Nerona_fx_enabled';
  var FX_TYPE_KEY = 'Nerona_fx_type';
  var FX_POWER_KEY = 'Nerona_fx_power';

  var THEMES = {
    kiora: {
      label: 'KIORAxAUTO',
      page: 'radial-gradient(circle at 10% 8%, rgba(155,92,255,.22), transparent 34%), radial-gradient(circle at 88% 4%, rgba(34,211,238,.16), transparent 34%), linear-gradient(135deg, #080611 0%, #160d27 52%, #05040b 100%)',
      panel: 'rgba(14, 10, 27, 0.92)',
      panel2: 'rgba(30, 17, 51, 0.78)',
      card: 'rgba(24, 15, 43, 0.72)',
      input: 'rgba(8, 6, 17, 0.78)',
      line: 'rgba(155, 92, 255, 0.32)',
      text: '#f4efff',
      muted: '#aaa0c1',
      accent: '#9b5cff',
      accent2: '#22d3ee',
      glow: 'rgba(155, 92, 255, 0.30)',
      buttonText: '#ffffff'
    },
    narutox: {
      label: 'NarutoX Purple',
      page: 'linear-gradient(135deg, #21103e 0%, #39205f 48%, #140b2a 100%)',
      panel: 'rgba(31, 16, 62, 0.9)',
      panel2: 'rgba(55, 32, 94, 0.7)',
      card: 'rgba(55, 30, 92, 0.66)',
      input: 'rgba(20, 11, 42, 0.76)',
      line: 'rgba(192, 132, 252, 0.32)',
      text: '#fff7ff',
      muted: '#c4b5fd',
      accent: '#8b5cf6',
      accent2: '#ec4899',
      glow: 'rgba(192, 132, 252, 0.27)',
      buttonText: '#ffffff'
    },
    liquid: {
      label: 'Liquid Glass',
      page: 'radial-gradient(circle at 12% 6%, rgba(14,165,233,.28), transparent 34%), radial-gradient(circle at 88% 0%, rgba(99,102,241,.24), transparent 36%), linear-gradient(135deg, #e9fbff 0%, #d7e8ff 46%, #f4f8ff 100%)',
      panel: 'rgba(255, 255, 255, 0.38)',
      panel2: 'rgba(255, 255, 255, 0.28)',
      card: 'rgba(255, 255, 255, 0.24)',
      input: 'rgba(255, 255, 255, 0.30)',
      line: 'rgba(255, 255, 255, 0.56)',
      text: '#112033',
      muted: '#53657a',
      accent: '#0ea5e9',
      accent2: '#6366f1',
      glow: 'rgba(14, 165, 233, 0.30)',
      buttonText: '#ffffff'
    },
    blur: {
      label: 'Glassy Blur',
      page: 'linear-gradient(135deg, #08111f 0%, #102733 54%, #07131f 100%)',
      panel: 'rgba(8, 17, 31, 0.9)',
      panel2: 'rgba(15, 35, 48, 0.74)',
      card: 'rgba(15, 39, 52, 0.64)',
      input: 'rgba(5, 16, 27, 0.74)',
      line: 'rgba(45, 212, 191, 0.26)',
      text: '#ecfeff',
      muted: '#8fb4bd',
      accent: '#06b6d4',
      accent2: '#34d399',
      glow: 'rgba(45, 212, 191, 0.24)',
      buttonText: '#042f2e'
    }
  };

  var FX_TYPES = {
    sparkles: 'Sparkles',
    glitter: 'Glitter',
    bubbles: 'Bubbles',
    lightning: 'Lightning'
  };

  var FX_POWERS = {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  };

  function $(id) { return document.getElementById(id); }

  function normalizeTheme(name) {
    name = String(name || '').trim();
    return Object.prototype.hasOwnProperty.call(THEMES, name) ? name : 'kiora';
  }

  function normalizeFxType(value) {
    value = String(value || '').trim();
    return Object.prototype.hasOwnProperty.call(FX_TYPES, value) ? value : 'sparkles';
  }

  function normalizeFxPower(value) {
    value = String(value || '').trim();
    return Object.prototype.hasOwnProperty.call(FX_POWERS, value) ? value : 'medium';
  }

  function normalizeEffects(data) {
    data = data || {};
    return {
      enabled: data.enabled !== false && data.enabled !== 'false',
      type: normalizeFxType(data.type),
      power: normalizeFxPower(data.power)
    };
  }

  function setStatus(message) {
    var el = $('themeStatus');
    if (el) el.textContent = message || '';
  }

  function setEffectsStatus(config) {
    var el = $('fxStatus');
    if (!el) return;
    el.textContent = config && config.enabled
      ? 'Effects: ' + FX_TYPES[config.type] + ' / ' + FX_POWERS[config.power]
      : 'Effects off';
  }

  function setMainStatus(message, type) {
    var el = $('status');
    if (!el || !message) return;
    el.textContent = message;
    el.className = type ? 'status ' + type : 'status';
  }

  function setActiveButton(name) {
    var map = {
      '': 'themeDefault',
      kiora: 'themeDefault',
      narutox: 'themeNarutox',
      liquid: 'themeLiquid',
      blur: 'themeBlur'
    };
    Object.keys(map).forEach(function (themeName) {
      var button = $(map[themeName]);
      if (button) button.classList.toggle('active', themeName === name);
    });
  }

  function setEffectsControls(config) {
    config = normalizeEffects(config);
    var toggle = $('fxToggle');
    var type = $('fxType');
    var power = $('fxPower');
    if (toggle) toggle.checked = config.enabled;
    if (type) type.value = config.type;
    if (power) power.value = config.power;
    setEffectsStatus(config);
  }

  function getEffectsFromControls() {
    return normalizeEffects({
      enabled: !!($('fxToggle') && $('fxToggle').checked),
      type: $('fxType') ? $('fxType').value : 'sparkles',
      power: $('fxPower') ? $('fxPower').value : 'medium'
    });
  }

  function buildCss(theme, accent1, accent2) {
    var a1 = accent1 || theme.accent;
    var a2 = accent2 || theme.accent2;
    return [
      ':root {',
      '  --nerona-theme-page: ' + theme.page + ';',
      '  --nerona-theme-panel: ' + theme.panel + ';',
      '  --nerona-theme-panel-2: ' + theme.panel2 + ';',
      '  --nerona-theme-card: ' + theme.card + ';',
      '  --nerona-theme-input: ' + theme.input + ';',
      '  --nerona-theme-line: ' + theme.line + ';',
      '  --nerona-theme-text: ' + theme.text + ';',
      '  --nerona-theme-muted: ' + theme.muted + ';',
      '  --nerona-theme-accent: ' + a1 + ';',
      '  --nerona-theme-accent-2: ' + a2 + ';',
      '  --nerona-theme-glow: ' + theme.glow + ';',
      '  --nerona-theme-button-text: ' + theme.buttonText + ';',
      '  --nerona-accent: ' + a1 + ';',
      '  --nerona-accent1: ' + a1 + ';',
      '  --nerona-accent2: ' + a2 + ';',
      '}',
      'body { background: var(--nerona-theme-page) !important; color: var(--nerona-theme-text) !important; }',
      'body::before, body::after { opacity: 0 !important; }',
      '.wrap { background: var(--nerona-theme-panel) !important; border-color: var(--nerona-theme-line) !important; box-shadow: 0 24px 60px rgba(0,0,0,.24), 0 0 28px var(--nerona-theme-glow), inset 0 1px 0 rgba(255,255,255,.42) !important; -webkit-backdrop-filter: blur(22px) saturate(180%) !important; backdrop-filter: blur(22px) saturate(180%) !important; }',
      '.head { background: var(--nerona-theme-panel-2) !important; border-color: var(--nerona-theme-line) !important; }',
      '.card, .operator-card, .stat-card, .tool-card, .nerona-proxy-card, .nerona-proxy-help-card { background: var(--nerona-theme-card) !important; border-color: var(--nerona-theme-line) !important; color: var(--nerona-theme-text) !important; box-shadow: 0 10px 28px rgba(0,0,0,.16), 0 0 16px var(--nerona-theme-glow), inset 0 1px 0 rgba(255,255,255,.32) !important; }',
      '.card h3, .nerona-zone-title, .nerona-tab.active, .stat-value.good, .operator-name, .brand span { color: var(--nerona-theme-accent) !important; text-shadow: 0 0 12px var(--nerona-theme-glow) !important; }',
      '.target, .tool-mini-note, .nerona-tools-note, .stat-label, .operator-sub, .settings-cache-indicator { color: var(--nerona-theme-muted) !important; }',
      '.status, .log-list, input[type="text"], input[type="password"], input[type="color"], select, textarea { background: var(--nerona-theme-input) !important; border-color: var(--nerona-theme-line) !important; color: var(--nerona-theme-text) !important; }',
      '.btn, .mode button.active, .operator-avatar, .start-btn { background: linear-gradient(135deg, var(--nerona-theme-accent), var(--nerona-theme-accent-2)) !important; border-color: var(--nerona-theme-accent) !important; color: var(--nerona-theme-button-text) !important; box-shadow: 0 0 16px var(--nerona-theme-glow) !important; }',
      '.btn-alt, .mode button:not(.active), .theme-btn { background: var(--nerona-theme-input) !important; border-color: var(--nerona-theme-line) !important; color: var(--nerona-theme-text) !important; box-shadow: none !important; }',
      '.theme-btn:hover, .theme-btn.active, .nerona-version-pill, .tool-pill, .settings-cache-indicator { border-color: var(--nerona-theme-accent) !important; color: var(--nerona-theme-accent) !important; box-shadow: 0 0 14px var(--nerona-theme-glow) !important; }',
      'input:focus, select:focus, textarea:focus { border-color: var(--nerona-theme-accent) !important; box-shadow: 0 0 12px var(--nerona-theme-glow) !important; }',
      '.nerona-tab.active { background: color-mix(in srgb, var(--nerona-theme-accent) 14%, transparent) !important; border-bottom-color: var(--nerona-theme-accent) !important; }',
      '.log-item { color: var(--nerona-theme-text) !important; border-color: var(--nerona-theme-line) !important; }',
      '.ios-slider { background: rgba(255,255,255,0.12) !important; border-color: rgba(255,255,255,0.18) !important; }',
      '.ios-toggle input:checked + .ios-slider { background: var(--nerona-theme-accent) !important; border-color: var(--nerona-theme-accent) !important; }',
      '.ios-toggle input:checked + .ios-slider::before { background: #fff !important; }',
      '#themeStatus, #fxStatus { color: var(--nerona-theme-muted) !important; }'
    ].join('\n');
  }

  function getFxCount(type, power) {
    var counts = {
      low: { sparkles: 20, glitter: 30, bubbles: 12, lightning: 6 },
      medium: { sparkles: 40, glitter: 55, bubbles: 20, lightning: 12 },
      high: { sparkles: 70, glitter: 80, bubbles: 35, lightning: 20 }
    };
    return counts[power][type] || counts[power].sparkles;
  }

  function getFxOpacity(power) {
    return power === 'high' ? '.65' : power === 'low' ? '.30' : '.48';
  }

  function createFxItem(type, index) {
    var item = document.createElement('span');
    item.className = 'fx-item';
    item.setAttribute('aria-hidden', 'true');
    var left = Math.round(Math.random() * 100);
    var top = Math.round(Math.random() * 100);
    var dx = Math.round((Math.random() * 90) - 45);
    var dy = -Math.round(24 + Math.random() * 96);
    var delay = -Math.random() * 8;
    var speed = 5 + Math.random() * 7;

    if (type === 'bubbles') {
      top = 86 + Math.round(Math.random() * 22);
      speed = 8 + Math.random() * 8;
      item.style.setProperty('--fx-size', Math.round(12 + Math.random() * 22) + 'px');
    } else if (type === 'lightning') {
      speed = 2.8 + Math.random() * 3.2;
      item.style.setProperty('--fx-rot', Math.round((Math.random() * 42) - 21) + 'deg');
    } else if (type === 'glitter') {
      speed = 6 + Math.random() * 7;
    }

    item.style.left = left + '%';
    item.style.top = top + '%';
    item.style.animationDelay = delay + 's';
    item.style.setProperty('--fx-dx', dx + 'px');
    item.style.setProperty('--fx-dy', dy + 'px');
    item.style.setProperty('--fx-speed', speed + 's');
    item.dataset.fxIndex = String(index);
    return item;
  }

  function applyEffects(config) {
    config = normalizeEffects(config);
    var old = document.getElementById('NeronaThemePanelEffectsLayer');
    if (old) old.remove();
    document.documentElement.removeAttribute('data-nerona-fx');
    setEffectsControls(config);

    if (!config.enabled) return;

    var layer = document.createElement('div');
    layer.id = 'NeronaThemePanelEffectsLayer';
    layer.className = 'Nerona-theme-effects-layer fx-' + config.type;
    layer.setAttribute('aria-hidden', 'true');
    layer.style.setProperty('--nerona-fx-opacity', getFxOpacity(config.power));

    var fragment = document.createDocumentFragment();
    var count = getFxCount(config.type, config.power);
    for (var i = 0; i < count; i += 1) {
      fragment.appendChild(createFxItem(config.type, i));
    }
    layer.appendChild(fragment);
    document.body.appendChild(layer);
    document.documentElement.setAttribute('data-nerona-fx', config.type);
  }

  function applyTheme(name) {
    name = normalizeTheme(name);
    var old = document.getElementById('apePanelThemeStyle');
    if (old) old.remove();
    document.documentElement.removeAttribute('data-nerona-theme');
    document.documentElement.className = document.documentElement.className.replace(/\btheme-\w+\b/g, '').trim();

    if (!name) {
      setActiveButton('');
      setStatus('No theme selected');
      return;
    }

    chrome.storage.local.get([THEME_KEY], function (data) {
      var cfg = data[THEME_KEY] || {};
      var style = document.createElement('style');
      style.id = 'apePanelThemeStyle';
      style.textContent = buildCss(THEMES[name], cfg.accent1, cfg.accent2);
      (document.head || document.documentElement).appendChild(style);
      document.documentElement.setAttribute('data-nerona-theme', name);
      setActiveButton(name);
      setStatus('Theme: ' + THEMES[name].label);
      applyAccentColors(cfg.accent1, cfg.accent2);
    });
  }

  function applyAccentColors(c1, c2) {
    if (c1) {
      document.documentElement.style.setProperty('--nerona-accent', c1);
      document.documentElement.style.setProperty('--nerona-accent1', c1);
      document.documentElement.style.setProperty('--nerona-theme-accent', c1);
    }
    if (c2) {
      document.documentElement.style.setProperty('--nerona-accent2', c2);
      document.documentElement.style.setProperty('--nerona-theme-accent-2', c2);
    }
  }

  function saveConfig(config) {
    try {
      chrome.storage.local.set({ [THEME_KEY]: config }, function () {
        if (chrome.runtime.lastError) {
          setStatus('Save failed');
          return;
        }
        setStatus(config.theme ? 'Theme: ' + THEMES[config.theme].label : 'No theme selected');
      });
    } catch (e) {
      setStatus('Save failed');
    }
  }

  function saveTheme(name) {
    name = normalizeTheme(name);
    chrome.storage.local.get([THEME_KEY], function (data) {
      var config = data[THEME_KEY] || {};
      config.theme = name;
      saveConfig(config);
      applyTheme(name);
      setMainStatus(name ? 'Theme saved: ' + THEMES[name].label + '.' : 'Theme reset.', 'ok');
    });
  }

  function saveEffects() {
    var config = getEffectsFromControls();
    chrome.storage.local.get([THEME_KEY], function (data) {
      var themeConfig = data[THEME_KEY] || {};
      themeConfig.fxEnabled = config.enabled;
      themeConfig.fxType = config.type;
      themeConfig.fxPower = config.power;
      saveConfig(themeConfig);
      applyEffects(config);
      setMainStatus(config.enabled ? 'Effects saved: ' + FX_TYPES[config.type] + ' / ' + FX_POWERS[config.power] + '.' : 'Effects disabled.', 'ok');
    });
  }

  function saveAccentColors() {
    var c1 = $('accentColor1') ? $('accentColor1').value : '';
    var c2 = $('accentColor2') ? $('accentColor2').value : '';
    applyAccentColors(c1, c2);
    chrome.storage.local.get([THEME_KEY], function (data) {
      var config = data[THEME_KEY] || {};
      config.accent1 = c1;
      config.accent2 = c2;
      saveConfig(config);
      if (config.theme) applyTheme(config.theme);
    });
  }

  function reset() {
    chrome.storage.local.get([THEME_KEY], function (data) {
      var config = data[THEME_KEY] || {};
      config.theme = '';
      saveConfig(config);
      applyTheme('');
      setMainStatus('Theme reset.', 'ok');
    });
  }

  function load() {
    chrome.storage.local.get([THEME_KEY], function (data) {
      var config = data[THEME_KEY] || {};
      var themeName = normalizeTheme(config.theme);
      var effects = normalizeEffects({
        enabled: config.fxEnabled,
        type: config.fxType,
        power: config.fxPower
      });

      var c1 = $('accentColor1');
      var c2 = $('accentColor2');
      if (c1 && config.accent1) c1.value = config.accent1;
      if (c2 && config.accent2) c2.value = config.accent2;

      applyAccentColors(config.accent1, config.accent2);
      applyTheme(themeName);
      applyEffects(effects);

      var defaults = {};
      if (!Object.prototype.hasOwnProperty.call(config, 'fxEnabled')) defaults.fxEnabled = true;
      if (!Object.prototype.hasOwnProperty.call(config, 'fxType')) defaults.fxType = effects.type;
      if (!Object.prototype.hasOwnProperty.call(config, 'fxPower')) defaults.fxPower = effects.power;
      if (Object.keys(defaults).length) {
        Object.assign(config, defaults);
        saveConfig(config);
      }
    });
  }

  function bind() {
    $('themeDefault')?.addEventListener('click', function () { saveTheme(''); });
    $('themeNarutox')?.addEventListener('click', function () { saveTheme('narutox'); });
    $('themeLiquid')?.addEventListener('click', function () { saveTheme('liquid'); });
    $('themeBlur')?.addEventListener('click', function () { saveTheme('blur'); });

    $('accentColor1')?.addEventListener('input', saveAccentColors);
    $('accentColor2')?.addEventListener('input', saveAccentColors);

    $('fxToggle')?.addEventListener('change', saveEffects);
    $('fxType')?.addEventListener('change', saveEffects);
    $('fxPower')?.addEventListener('change', saveEffects);

    $('resetThemeBtn')?.addEventListener('click', reset);
  }

  // Hit-recorder compatibility: trigger a one-off effects burst.
  window.burstEffects = function (duration) {
    var cfg = normalizeEffects({ enabled: true, type: 'sparkles', power: 'medium' });
    applyEffects(cfg);
    setTimeout(function () {
      applyEffects(normalizeEffects({ enabled: false }));
    }, duration || 6000);
  };

  function init() {
    bind();
    load();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
