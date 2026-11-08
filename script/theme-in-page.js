// KIORAxAUTO In-Page Theme + Toast Controller
// Applies the dashboard theme to the in-page mini UI (rail, panel, start button)
// and provides a page-level toast notification. Defaults to KIORAxAUTO GOLD.
(function () {
  if (window.__Nerona_IN_PAGE_THEME_LOADED) return;
  window.__Nerona_IN_PAGE_THEME_LOADED = true;

  var THEME_KEY = 'Nerona_theme_config';

  var DEFAULT_THEME = {
    name: 'gold',
    accent: '#9b5cff',
    accent2: '#22d3ee',
    accentText: '#ffffff',
    panelBg: 'linear-gradient(180deg, #1b1230, #080610)',
    panelBg2: 'linear-gradient(145deg, #24133f, #0d0818)',
    inputBg: 'rgba(12,8,24,.94)',
    text: '#efe7ff',
    muted: 'rgba(215,202,242,.72)',
    border: 'rgba(155,92,255,.42)',
    glow: 'rgba(155,92,255,.45)',
    danger: '#ff6b6b',
    dangerBg: 'rgba(255,107,107,.12)',
    ok: '#4ade80'
  };

  var THEME_MAP = {
    gold: DEFAULT_THEME,
    narutox: {
      name: 'narutox',
      accent: '#a855f7',
      accent2: '#f472b6',
      accentText: '#ffffff',
      panelBg: 'linear-gradient(180deg, #2e1065, #140b2a)',
      panelBg2: 'linear-gradient(145deg, #4c1d95, #2e1065)',
      inputBg: 'rgba(46,16,101,.92)',
      text: '#e9d5ff',
      muted: 'rgba(233,213,255,.75)',
      border: 'rgba(192,132,252,.45)',
      glow: 'rgba(168,85,247,.45)',
      danger: '#ff6b6b',
      dangerBg: 'rgba(255,107,107,.12)',
      ok: '#34d399'
    },
    liquid: {
      name: 'liquid',
      accent: '#0ea5e9',
      accent2: '#8b5cf6',
      accentText: '#ffffff',
      panelBg: 'linear-gradient(180deg, rgba(224,242,254,.55), rgba(233,213,255,.45))',
      panelBg2: 'linear-gradient(145deg, rgba(224,242,254,.55), rgba(233,213,255,.45))',
      inputBg: 'rgba(255,255,255,.45)',
      text: '#0c4a6e',
      muted: 'rgba(12,74,110,.75)',
      border: 'rgba(14,165,233,.45)',
      glow: 'rgba(14,165,233,.40)',
      danger: '#dc2626',
      dangerBg: 'rgba(220,38,38,.12)',
      ok: '#059669'
    },
    blur: {
      name: 'blur',
      accent: '#22d3ee',
      accent2: '#34d399',
      accentText: '#042f2e',
      panelBg: 'linear-gradient(180deg, #0c1e2e, #061018)',
      panelBg2: 'linear-gradient(145deg, #164e63, #0c1e2e)',
      inputBg: 'rgba(6,22,32,.82)',
      text: '#a5f3fc',
      muted: 'rgba(165,243,252,.75)',
      border: 'rgba(34,211,238,.45)',
      glow: 'rgba(34,211,238,.45)',
      danger: '#ff6b6b',
      dangerBg: 'rgba(255,107,107,.12)',
      ok: '#34d399'
    }
  };

  function getTheme(name) {
    name = String(name || '').trim().toLowerCase();
    return THEME_MAP[name] || DEFAULT_THEME;
  }

  function mergeCustomAccent(t, accent1, accent2) {
    if (accent1) t.accent = accent1;
    if (accent2) t.accent2 = accent2;
    return t;
  }

  var styleEl = null;
  function setRootVars(t) {
    try {
      var root = document.documentElement;
      root.style.setProperty('--nerona-mini-accent', t.accent);
      root.style.setProperty('--nerona-mini-accent-2', t.accent2);
      root.style.setProperty('--nerona-mini-accent-text', t.accentText);
      root.style.setProperty('--nerona-mini-panel-bg', t.panelBg);
      root.style.setProperty('--nerona-mini-panel-bg-2', t.panelBg2);
      root.style.setProperty('--nerona-mini-input-bg', t.inputBg);
      root.style.setProperty('--nerona-mini-text', t.text);
      root.style.setProperty('--nerona-mini-muted', t.muted);
      root.style.setProperty('--nerona-mini-border', t.border);
      root.style.setProperty('--nerona-mini-glow', t.glow);
      root.style.setProperty('--nerona-mini-danger', t.danger);
      root.style.setProperty('--nerona-mini-danger-bg', t.dangerBg);
      root.style.setProperty('--nerona-mini-ok', t.ok);
      root.style.setProperty('--nerona-mini-transition', 'background-color .2s, color .2s, border-color .2s, box-shadow .2s');
    } catch (e) {}
  }

  function ensureStyleLast() {
    try {
      if (styleEl && document.head && styleEl.parentNode === document.head && document.head.lastChild !== styleEl) {
        document.head.appendChild(styleEl);
      }
    } catch (e) {}
  }

  function applyTheme(name, accent1, accent2) {
    var t = mergeCustomAccent(Object.assign({}, getTheme(name)), accent1, accent2);
    setRootVars(t);
    try { applyInlineStyles(); } catch (e) {}
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'NeronaInPageTheme';
      (document.head || document.documentElement).appendChild(styleEl);
      try {
        var headObserver = new MutationObserver(ensureStyleLast);
        headObserver.observe(document.head, { childList: true });
      } catch (e) {}
    }
    ensureStyleLast();
    styleEl.textContent = [
      ':root {',
      '  --nerona-mini-accent: ' + t.accent + ';',
      '  --nerona-mini-accent-2: ' + t.accent2 + ';',
      '  --nerona-mini-accent-text: ' + t.accentText + ';',
      '  --nerona-mini-panel-bg: ' + t.panelBg + ';',
      '  --nerona-mini-panel-bg-2: ' + t.panelBg2 + ';',
      '  --nerona-mini-input-bg: ' + t.inputBg + ';',
      '  --nerona-mini-text: ' + t.text + ';',
      '  --nerona-mini-muted: ' + t.muted + ';',
      '  --nerona-mini-border: ' + t.border + ';',
      '  --nerona-mini-glow: ' + t.glow + ';',
      '  --nerona-mini-danger: ' + t.danger + ';',
      '  --nerona-mini-danger-bg: ' + t.dangerBg + ';',
      '  --nerona-mini-ok: ' + t.ok + ';',
      '  --nerona-mini-transition: background-color .2s, color .2s, border-color .2s, box-shadow .2s;',
      '}',
      '#Nerona-mini-rail, #Nerona-mini-panel, #Nerona-mini-toggle, #Nerona-mini-save, #Nerona-mini-open-dashboard, .ip-card, .Nerona-mini-pill { transition: var(--nerona-mini-transition) !important; }',
      '#Nerona-mini-rail {',
      '  border-color: var(--nerona-mini-border) !important;',
      '  background: var(--nerona-mini-panel-bg) !important;',
      '  color: var(--nerona-mini-accent) !important;',
      '  box-shadow: 0 0 12px var(--nerona-mini-glow), 0 0 24px var(--nerona-mini-glow), inset 0 0 4px var(--nerona-mini-glow) !important;',
      '}',
      '#Nerona-mini-rail::before { background: linear-gradient(180deg, transparent, var(--nerona-mini-accent), transparent) !important; }',
      '#Nerona-mini-rail span { color: var(--nerona-mini-accent) !important; text-shadow: 0 0 10px var(--nerona-mini-glow), 0 0 18px var(--nerona-mini-glow), 0 0 26px var(--nerona-mini-glow), 0 1px 2px rgba(0,0,0,.4) !important; font-weight: 900 !important; filter: drop-shadow(0 0 4px var(--nerona-mini-accent)) !important; }',
      '#Nerona-mini-rail:hover { border-color: var(--nerona-mini-accent) !important; box-shadow: 0 0 18px var(--nerona-mini-glow), 0 0 32px var(--nerona-mini-glow), inset 0 0 6px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-rail:hover span { color: #fff !important; text-shadow: 0 0 12px var(--nerona-mini-accent), 0 0 22px var(--nerona-mini-accent), 0 0 30px var(--nerona-mini-accent) !important; filter: drop-shadow(0 0 6px var(--nerona-mini-accent)) !important; }',
      '#Nerona-mini-panel {',
      '  border-color: var(--nerona-mini-border) !important;',
      '  background: var(--nerona-mini-panel-bg-2) !important;',
      '  color: var(--nerona-mini-text) !important;',
      '  box-shadow: 0 16px 40px rgba(0,0,0,.28), 0 0 20px var(--nerona-mini-glow) !important;',
      '}',
      '.Nerona-mini-title { color: var(--nerona-mini-accent) !important; text-shadow: 0 0 10px var(--nerona-mini-glow) !important; }',
      '.Nerona-mini-dot { background: var(--nerona-mini-accent) !important; box-shadow: 0 0 0 3px var(--nerona-mini-glow), 0 0 12px var(--nerona-mini-glow) !important; }',
      '.Nerona-mini-pill { background: var(--nerona-mini-panel-bg) !important; color: var(--nerona-mini-muted) !important; border: 1px solid var(--nerona-mini-border) !important; font-weight: 900 !important; }',
      '.Nerona-mini-pill:hover { color: var(--nerona-mini-text) !important; border-color: var(--nerona-mini-accent) !important; }',
      '.Nerona-mini-pill.active {',
      '  background: linear-gradient(135deg, var(--nerona-mini-accent), var(--nerona-mini-accent-2)) !important;',
      '  color: var(--nerona-mini-accent-text) !important;',
      '  box-shadow: 0 0 14px var(--nerona-mini-glow) !important;',
      '  text-shadow: 0 1px 1px rgba(0,0,0,.2) !important;',
      '}',
      '.Nerona-mini-pill[data-mode=disconnect] { color: var(--nerona-mini-danger) !important; background: var(--nerona-mini-danger-bg) !important; border-color: var(--nerona-mini-danger) !important; }',
      '.Nerona-mini-pill[data-mode=disconnect]:hover { color: #fff !important; background: rgba(255,107,107,.2) !important; }',
      '#Nerona-mini-value {',
      '  border-color: var(--nerona-mini-border) !important;',
      '  background: var(--nerona-mini-input-bg) !important;',
      '  color: var(--nerona-mini-accent) !important;',
      '}',
      '#Nerona-mini-value:focus { border-color: var(--nerona-mini-accent) !important; box-shadow: 0 0 0 3px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-save {',
      '  color: var(--nerona-mini-accent-text) !important;',
      '  background: linear-gradient(135deg, var(--nerona-mini-accent), var(--nerona-mini-accent-2)) !important;',
      '  box-shadow: 0 0 14px var(--nerona-mini-glow) !important;',
      '  font-weight: 900 !important;',
      '  text-shadow: 0 1px 1px rgba(0,0,0,.2) !important;',
      '}',
      '#Nerona-mini-save:hover { transform: translateY(-1px) !important; box-shadow: 0 0 20px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-open-dashboard { background: var(--nerona-mini-panel-bg) !important; color: var(--nerona-mini-text) !important; border-color: var(--nerona-mini-border) !important; font-weight: 800 !important; }',
      '#Nerona-mini-open-dashboard:hover { border-color: var(--nerona-mini-accent) !important; color: var(--nerona-mini-accent) !important; box-shadow: 0 0 12px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-status { color: var(--nerona-mini-muted) !important; }',
      '#Nerona-mini-start-dock { font-family: "Segoe UI", Tahoma, sans-serif; }',
      '#Nerona-mini-toggle {',
      '  color: var(--nerona-mini-text) !important;',
      '  background: var(--nerona-mini-panel-bg) !important;',
      '  border-color: var(--nerona-mini-border) !important;',
      '  box-shadow: 0 0 14px var(--nerona-mini-glow), 0 0 28px var(--nerona-mini-glow) !important;',
      '  font-weight: 900 !important;',
      '  text-shadow: 0 0 10px var(--nerona-mini-glow) !important;',
      '  letter-spacing: .5px !important;',
      '}',
      '#Nerona-mini-toggle:hover { color: #fff !important; border-color: var(--nerona-mini-accent) !important; box-shadow: 0 0 20px var(--nerona-mini-glow), 0 0 36px var(--nerona-mini-glow) !important; text-shadow: 0 0 14px var(--nerona-mini-accent) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] { background: var(--nerona-mini-panel-bg-2) !important; border-color: var(--nerona-mini-border) !important; box-shadow: 0 16px 40px rgba(0,0,0,.28), 0 0 20px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] .Nerona-mini-pill { background: rgba(10,10,6,.8) !important; border-color: var(--nerona-mini-border) !important; color: var(--nerona-mini-muted) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] .Nerona-mini-pill.active { background: linear-gradient(135deg, var(--nerona-mini-accent), var(--nerona-mini-accent-2)) !important; border-color: var(--nerona-mini-accent) !important; color: var(--nerona-mini-accent-text) !important; box-shadow: 0 0 10px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] .Nerona-mini-pill[data-mode=disconnect] { color: var(--nerona-mini-danger) !important; background: var(--nerona-mini-danger-bg) !important; border-color: var(--nerona-mini-danger) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] .Nerona-mini-pill[data-mode=disconnect].active { background: linear-gradient(135deg, var(--nerona-mini-danger), #dc2626) !important; border-color: var(--nerona-mini-danger) !important; color: #fff !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] #Nerona-mini-value { background: var(--nerona-mini-input-bg) !important; border-color: var(--nerona-mini-border) !important; color: var(--nerona-mini-text) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] #Nerona-mini-value:focus { border-color: var(--nerona-mini-accent) !important; box-shadow: 0 0 10px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] #Nerona-mini-save-cloud { background: linear-gradient(135deg, var(--nerona-mini-accent), var(--nerona-mini-accent-2)) !important; color: var(--nerona-mini-accent-text) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] #Nerona-mini-save-cloud:hover { box-shadow: 0 0 14px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] #Nerona-mini-save-local { border-color: var(--nerona-mini-border) !important; background: var(--nerona-mini-panel-bg) !important; color: var(--nerona-mini-text) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] #Nerona-mini-save-local:hover { border-color: var(--nerona-mini-accent) !important; box-shadow: 0 0 10px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-panel[data-nerona-upgraded] #Nerona-mini-cloud-list { scrollbar-color: var(--nerona-mini-border) transparent; }',
      '#Nerona-mini-panel[data-nerona-upgraded] #Nerona-mini-cloud-list::-webkit-scrollbar-thumb { background: var(--nerona-mini-border); }',
      '#Nerona-mini-bin-use span:last-child { color: var(--nerona-mini-accent) !important; text-shadow: 0 0 8px var(--nerona-mini-glow) !important; font-weight: 900 !important; }',
      '.nerona-mini-cloud-select { color: var(--nerona-mini-text) !important; font-weight: 700 !important; }',
      '.nerona-mini-cloud-select:hover { color: var(--nerona-mini-accent) !important; text-shadow: 0 0 8px var(--nerona-mini-glow) !important; }',
      '.nerona-mini-section-label { color: var(--nerona-mini-muted) !important; font-weight: 900 !important; letter-spacing: .6px !important; }',
      '#Nerona-mini-status { color: var(--nerona-mini-muted) !important; font-weight: 700 !important; }',

      /* Top notification / status pill */
      '#Nerona-mini-top, html body #Nerona-mini-top {',
      '  background: var(--nerona-mini-panel-bg-2) !important;',
      '  border-color: var(--nerona-mini-border) !important;',
      '  color: var(--nerona-mini-accent) !important;',
      '  box-shadow: 0 10px 28px rgba(0,0,0,.24), 0 0 15px var(--nerona-mini-glow), 0 0 28px var(--nerona-mini-glow) !important;',
      '  text-shadow: 0 0 8px var(--nerona-mini-glow), 0 0 14px var(--nerona-mini-glow) !important;',
      '}',

      /* IP / Proxy card */
      '#Nerona-mini-ip-card.ip-card, .ip-card, html body #Nerona-mini-ip-card {',
      '  background: var(--nerona-mini-panel-bg-2) !important;',
      '  border-color: var(--nerona-mini-border) !important;',
      '  box-shadow: 0 8px 30px rgba(0,0,0,.3), 0 0 30px var(--nerona-mini-glow), inset 0 1px 0 rgba(255,255,255,.1) !important;',
      '  color: var(--nerona-mini-text) !important;',
      '}',
      '.ip-card::before { background: radial-gradient(circle at top right, var(--nerona-mini-glow), transparent 40%) !important; }',
      '.ip-card::after { background: linear-gradient(90deg, transparent, var(--nerona-mini-accent), transparent) !important; }',
      '.ip-card.minimized { background: var(--nerona-mini-panel-bg-2) !important; border-color: var(--nerona-mini-accent) !important; box-shadow: 0 8px 30px rgba(0,0,0,.3), 0 0 15px var(--nerona-mini-glow), inset 0 1px 0 rgba(255,255,255,.1) !important; }',
      '.ip-row { border-bottom-color: var(--nerona-mini-border) !important; }',
      '.ip-icon { color: var(--nerona-mini-accent) !important; background: var(--nerona-mini-glow) !important; border-color: var(--nerona-mini-border) !important; }',
      '.ip-label { color: var(--nerona-mini-muted) !important; }',
      '.ip-value { color: #fff !important; text-shadow: 0 0 6px var(--nerona-mini-glow) !important; }',
      '.ip-dot { background: var(--nerona-mini-muted) !important; }',
      '.ip-dot.ok { background: var(--nerona-mini-accent) !important; box-shadow: 0 0 8px var(--nerona-mini-glow) !important; }',
      '.ip-ping { color: var(--nerona-mini-muted) !important; }',
      '#Nerona-mini-toggle-btn.ip-mini-toggle::before, .ip-mini-toggle::before { color: var(--nerona-mini-accent) !important; text-shadow: 0 0 8px var(--nerona-mini-glow) !important; }',
      '#Nerona-mini-toggle-btn.ip-mini-toggle .ip-mini-dot, .ip-mini-toggle .ip-mini-dot { background: var(--nerona-mini-accent) !important; box-shadow: 0 0 6px var(--nerona-mini-glow) !important; }',
      '.ip-minimize-btn { border-color: var(--nerona-mini-border) !important; color: var(--nerona-mini-muted) !important; }',
      '.ip-minimize-btn:hover { background: var(--nerona-mini-danger-bg) !important; border-color: var(--nerona-mini-danger) !important; color: var(--nerona-mini-danger) !important; }'
    ].join('\n');
  }

  function loadTheme() {
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) return;
      chrome.storage.local.get([THEME_KEY], function (result) {
        var cfg = result[THEME_KEY] || {};
        applyTheme(cfg.theme || cfg.name || 'gold', cfg.accent1, cfg.accent2);
        applyInlineStyles();
      });
    } catch (e) {
      applyTheme('gold');
      applyInlineStyles();
    }
  }

  function listen() {
    try {
      chrome.storage.onChanged.addListener(function (changes, area) {
        if (area !== 'local') return;
        if (changes[THEME_KEY]) {
          var cfg = changes[THEME_KEY].newValue || {};
          applyTheme(cfg.theme || cfg.name || 'gold', cfg.accent1, cfg.accent2);
          applyInlineStyles();
        }
      });
    } catch (e) {}
  }

  // Toast API
  function removeToast(id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 250);
  }

  function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 2800;
    var id = 'NeronaToast_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    var container = document.getElementById('NeronaToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'NeronaToastContainer';
      container.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:2147483647;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.id = id;
    var color = type === 'err' ? 'var(--nerona-mini-danger)' : type === 'ok' ? 'var(--nerona-mini-ok)' : 'var(--nerona-mini-accent)';
    var icon = type === 'err' ? '&#10006;' : type === 'ok' ? '&#10004;' : '&#9889;';
    toast.style.cssText =
      'pointer-events:auto;max-width:260px;padding:10px 14px;border-radius:12px;' +
      'background:var(--nerona-mini-panel-bg-2, #1a1508);border:1px solid var(--nerona-mini-border, rgba(255,215,0,.35));' +
      'color:var(--nerona-mini-text, #ffec8c);font-family:"Segoe UI",Tahoma,sans-serif;font-size:12px;font-weight:700;' +
      'box-shadow:0 8px 32px rgba(0,0,0,.35),0 0 16px var(--nerona-mini-glow, rgba(255,215,0,.45));' +
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
      'display:flex;align-items:center;gap:8px;opacity:0;transform:translateY(12px);transition:opacity .25s,transform .25s;';
    toast.innerHTML = '<span style="color:' + color + ';font-size:14px">' + icon + '</span><span>' + escapeHtml(message) + '</span>';
    container.appendChild(toast);
    requestAnimationFrame(function () {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
    setTimeout(function () { removeToast(id); }, duration);
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.NeronaToast = { show: showToast };

  function applyInlineStyles() {
    try {
      var accent = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-accent').trim() || '#ffd700';
      var accent2 = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-accent-2').trim() || '#ffaa00';
      var panelBg = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-panel-bg-2').trim() || 'linear-gradient(145deg, #2a200c, #1a1508)';
      var border = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-border').trim() || 'rgba(255,215,0,.35)';
      var glow = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-glow').trim() || 'rgba(255,215,0,.45)';
      var text = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-text').trim() || '#ffec8c';
      var muted = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-muted').trim() || 'rgba(255,236,140,.7)';
      var danger = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-danger').trim() || '#ff6b6b';

      var top = document.getElementById('Nerona-mini-top');
      if (top) {
        top.style.background = panelBg;
        top.style.borderColor = border;
        top.style.color = accent;
        top.style.boxShadow = '0 10px 28px rgba(0,0,0,.24), 0 0 15px ' + glow + ', 0 0 28px ' + glow;
      }

      var rail = document.getElementById('Nerona-mini-rail');
      if (rail) {
        rail.style.background = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-panel-bg').trim() || 'linear-gradient(180deg, #2a200c, #0f0d06)';
        rail.style.borderColor = border;
        rail.style.color = accent;
        rail.style.boxShadow = '0 0 12px ' + glow + ', 0 0 24px ' + glow + ', inset 0 0 4px ' + glow;
      }

      var panel = document.getElementById('Nerona-mini-panel');
      if (panel) {
        panel.style.background = panelBg;
        panel.style.borderColor = border;
      }

      var toggle = document.getElementById('Nerona-mini-toggle');
      if (toggle) {
        toggle.style.background = getComputedStyle(document.documentElement).getPropertyValue('--nerona-mini-panel-bg').trim() || 'rgba(10,10,6,.88)';
        toggle.style.borderColor = border;
        toggle.style.color = text;
        toggle.style.boxShadow = '0 0 14px ' + glow + ', 0 0 28px ' + glow;
      }

      var ipCard = document.getElementById('Nerona-mini-ip-card');
      if (ipCard) {
        ipCard.style.background = panelBg;
        ipCard.style.borderColor = accent;
        ipCard.style.boxShadow = '0 8px 30px rgba(0,0,0,.3), 0 0 30px ' + glow + ', inset 0 1px 0 rgba(255,255,255,.1)';
      }

      var miniToggleBtn = document.getElementById('Nerona-mini-toggle-btn');
      if (miniToggleBtn) {
        miniToggleBtn.style.color = accent;
        var miniDot = miniToggleBtn.querySelector('.ip-mini-dot');
        if (miniDot) miniDot.style.background = accent;
      }

      document.querySelectorAll('.Nerona-mini-dot').forEach(function(el) { el.style.background = accent; el.style.boxShadow = '0 0 0 3px ' + glow + ', 0 0 12px ' + glow; });
      document.querySelectorAll('.Nerona-mini-pill.active').forEach(function(el) {
        el.style.background = 'linear-gradient(135deg, ' + accent + ', ' + accent2 + ')';
        el.style.borderColor = accent;
      });
      document.querySelectorAll('.Nerona-mini-pill[data-mode=disconnect]').forEach(function(el) { el.style.color = danger; el.style.borderColor = danger; });
      document.querySelectorAll('.ip-dot.ok').forEach(function(el) { el.style.background = accent; el.style.boxShadow = '0 0 8px ' + glow; });
      document.querySelectorAll('.ip-icon').forEach(function(el) { el.style.color = accent; el.style.background = glow; el.style.borderColor = border; });
    } catch (e) {}
  }

  function startInlineObserver() {
    try {
      var observer = new MutationObserver(function() { applyInlineStyles(); });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function() { applyInlineStyles(); }, 100);
      setTimeout(function() { applyInlineStyles(); }, 500);
      setTimeout(function() { applyInlineStyles(); }, 1500);
    } catch (e) {}
  }

  // Only inject theme CSS + run observers on actual checkout contexts.
  // Prevents the KIORAxAUTO stylesheet and :root CSS variables from touching every
  // stripe.com page or frame (dashboard, js.stripe.com iframes, etc.).
  function isCheckoutContext() {
    try {
      if (document.querySelector('#Nerona-mini-rail, #Nerona-mini-panel, #Nerona-mini-start-dock, .card-generator-overlay, [data-nerona-checkout]')) return true;
      var h = String(location.hostname || '').toLowerCase();
      var href = String(location.href || '').toLowerCase();
      if (h.indexOf('stripe.com') === -1 && h.indexOf('stripe.network') === -1 && href.indexOf('/c/pay/') === -1 && href.indexOf('/payment_pages/') === -1) return false;
      if (h.indexOf('checkout.') === 0 || href.indexOf('/c/pay/') !== -1 || href.indexOf('cs_live_') !== -1 || href.indexOf('cs_test_') !== -1) return true;
      return false;
    } catch (e) { return true; }
  }

  var IS_CHECKOUT = isCheckoutContext();
  if (IS_CHECKOUT) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { loadTheme(); listen(); applyInlineStyles(); startInlineObserver(); }, { once: true });
    } else {
      loadTheme();
      listen();
      applyInlineStyles();
      startInlineObserver();
    }
  } else {
    // Non-checkout frame: keep the toast API available, skip all CSS injection.
    window.NeronaToast = { show: showToast };
  }
})();

/* KIORAxAUTO visual theme override — visual-only */
(function(){
  try {
    var id='kiora-auto-x-visual-theme';
    if(document.getElementById(id)) return;
    var s=document.createElement('style');
    s.id=id;
    s.textContent='#Nerona-mini-rail,#Nerona-mini-panel,#Nerona-mini-toggle-btn,#Nerona-mini-dock,#Nerona-mini-top{--kiora-a:#8b5cf6;--kiora-b:#06b6d4;} #Nerona-mini-rail,#Nerona-mini-panel{border-color:rgba(139,92,246,.65)!important;box-shadow:0 0 22px rgba(139,92,246,.25),0 0 10px rgba(6,182,212,.15)!important;} .Nerona-mini-title,.Nerona-mini-pill.active{color:#c4b5fd!important;}';
    (document.head||document.documentElement).appendChild(s);
  } catch(e){}
})();
