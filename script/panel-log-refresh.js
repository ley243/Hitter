(function () {
  if (window.__Nerona_LOG_REFRESH) return;
  window.__Nerona_LOG_REFRESH = true;

  var list = document.getElementById('logList');
  if (!list) return;

  var lastSerialized = '';
  function getResponseClass(resp) {
    var r = (resp || '').toLowerCase();
    if (r === 'success' || r === 'hit' || r === 'approved') return 'success';
    if (r.indexOf('decline') !== -1 || r.indexOf('do_not') !== -1 || r.indexOf('error') !== -1 || r.indexOf('fail') !== -1 || r.indexOf('insufficient') !== -1) return 'decline';
    if (r === 'attempt' || r === 'auto') return 'attempt';
    if (r === 'three_ds') return 'three_ds';
    return 'unknown';
  }

  function getSourceInfo(src) {
    var s = (src || '').toLowerCase();
    if (s === 'interceptor' || s === 'main') return { cls: 'interceptor', label: 'CHK' };
    if (s === 'network') return { cls: 'network', label: 'API' };
    if (s === 'auto-hitter' || s === 'auto') return { cls: 'auto-hitter', label: 'AUTO' };
    if (s === 'relay') return { cls: 'relay', label: '3DS' };
    return { cls: 'unknown', label: 'OTH' };
  }

  function formatTimestamp(ts) {
    if (!ts) return '--';
    var diff = Date.now() - ts;
    if (diff < 0) return '--';
    if (diff < 60000) return Math.floor(diff / 1000) + 's';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm';
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  function render(logs) {
    if (!Array.isArray(logs)) logs = [];
    var display = logs.slice(0, 50).filter(function (entry) {
      return entry && typeof entry === 'object' && !Array.isArray(entry);
    });
    var serialized = JSON.stringify(display);
    if (serialized === lastSerialized) return;
    lastSerialized = serialized;
    list.innerHTML = '';
    if (display.length === 0) {
      list.innerHTML = '<div class="log-item">No logs yet.</div>';
      return;
    }
    display.forEach(function (entry) {
      var div = document.createElement('div');
      div.className = 'log-item-enhanced';

      var tsSpan = document.createElement('span');
      tsSpan.className = 'log-ts';
      tsSpan.textContent = formatTimestamp(entry.timestamp);

      var srcInfo = getSourceInfo(entry.source);
      var badgeSpan = document.createElement('span');
      badgeSpan.className = 'log-badge ' + srcInfo.cls;
      badgeSpan.textContent = srcInfo.label;

      var cardSpan = document.createElement('span');
      cardSpan.className = 'log-card';
      cardSpan.textContent = entry.card || 'N/A';
      cardSpan.title = entry.card || '';

      if (entry.expiry) {
        var expSpan = document.createElement('span');
        expSpan.className = 'log-expiry';
        expSpan.textContent = entry.expiry;
      }

      if (entry.cvc) {
        var cvcSpan = document.createElement('span');
        cvcSpan.className = 'log-cvc';
        cvcSpan.textContent = entry.cvc;
      }

      var respSpan = document.createElement('span');
      respSpan.className = 'log-response ' + getResponseClass(entry.response);
      respSpan.textContent = entry.response || 'N/A';

      var leftGroup = document.createElement('span');
      leftGroup.style.cssText = 'display:flex;align-items:center;gap:5px;min-width:0;overflow:hidden';
      leftGroup.appendChild(tsSpan);
      leftGroup.appendChild(badgeSpan);
      leftGroup.appendChild(cardSpan);
      if (expSpan) leftGroup.appendChild(expSpan);
      if (cvcSpan) leftGroup.appendChild(cvcSpan);

      div.appendChild(leftGroup);
      div.appendChild(respSpan);
      list.appendChild(div);
    });
  }

  function isCtxValid() {
    try { return !!(chrome && chrome.runtime && chrome.runtime.id); } catch(e) { return false; }
  }

  var _poll_iv = null;
  function poll() {
    if (!isCtxValid()) { if (_poll_iv) { clearInterval(_poll_iv); _poll_iv = null; } return; }
    try {
      chrome.storage.local.get(['Nerona_logs'], function (result) {
        if (chrome.runtime.lastError) return;
        render(result.Nerona_logs);
      });
    } catch (e) {}
  }

  poll();
  _poll_iv = setInterval(poll, 2000);
})();
