(function () {
  var listEl = document.getElementById('historyList');
  if (!listEl) return;

  // ── Extension context guard ──────────────────────────
  function isContextValid() {
    try {
      return !!(chrome && chrome.runtime && chrome.runtime.id);
    } catch (e) {
      return false;
    }
  }

  var _intervalId = null;
  var _destroyed = false;

  function destroy() {
    if (_destroyed) return;
    _destroyed = true;
    if (_intervalId) { clearInterval(_intervalId); _intervalId = null; }
  }

  // ── Formatting helpers ───────────────────────────────
  function fmt(ts) {
    if (!ts) return '';
    try {
      var d = new Date(ts);
      return isNaN(d.getTime()) ? '' : d.toLocaleString();
    } catch (e) { return ''; }
  }

  function fmtAmount(amount) {
    if (!amount && amount !== 0) return '';
    var val = amount > 100 ? (amount / 100).toFixed(2) : Number(amount).toFixed(2);
    return '$' + val;
  }

  function maskCard(value) {
    var digits = String(value || '').replace(/\D/g, '');
    if (digits.length >= 12) return digits.slice(0, 6) + '******' + digits.slice(-4);
    if (digits.length >= 6) return digits.slice(0, 6);
    return value || '';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Render ───────────────────────────────────────────
  function render() {
    if (_destroyed) return;
    if (!isContextValid()) { destroy(); return; }

    try {
      chrome.storage.local.get(['Nerona_hit_history', 'Nerona_logs'], function (data) {
        // Guard against late callbacks after context invalidation
        if (_destroyed) return;
        if (chrome.runtime.lastError) {
          // Context gone — stop polling
          destroy();
          return;
        }

        var hits = Array.isArray(data.Nerona_hit_history) ? data.Nerona_hit_history : [];

        if (hits.length === 0) {
          var logs = Array.isArray(data.Nerona_logs) ? data.Nerona_logs : [];
          hits = logs.filter(function (e) {
            if (!e || typeof e !== 'object') return false;
            var r = (e.response || '').toLowerCase();
            return r === 'success' || r === 'hit' || r === 'approved';
          });
        }

        if (hits.length === 0) {
          listEl.innerHTML = '<div class="log-item" style="color:#94a3b8;text-align:center;padding:16px 0">No hits yet.</div>';
          return;
        }

        listEl.innerHTML = '';
        var last = hits.slice(-30).reverse(); // most recent first

        last.forEach(function (h) {
          var div = document.createElement('div');
          div.className = 'log-item';
          div.style.cssText = [
            'padding:10px 12px',
            'border-bottom:1px solid rgba(139,92,246,0.08)',
            'border-radius:10px',
            'margin-bottom:6px',
            'background:rgba(139,92,246,0.04)',
            'transition:background 0.15s ease'
          ].join(';');

          var site = h.site ||
            (h.url ? h.url.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '') : '') ||
            'N/A';
          var card = maskCard(h.card || h.bin || '') || 'N/A';
          var amt  = fmtAmount(h.amount);
          var time = fmt(h.timestamp);
          var resp = (h.response || 'success').toUpperCase();
          var isHit = (resp === 'SUCCESS' || resp === 'HIT' || resp === 'APPROVED');

          var html = '';

          // Row 1: status badge + site
          html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:5px">';
          if (isHit) {
            html += '<span style="font-size:9px;font-weight:800;letter-spacing:0.8px;padding:2px 8px;border-radius:999px;background:rgba(16,185,129,0.12);border:1px solid rgba(52,211,153,0.25);color:#34d399">✓ HIT</span>';
          } else {
            html += '<span style="font-size:9px;font-weight:800;letter-spacing:0.8px;padding:2px 8px;border-radius:999px;background:rgba(244,63,94,0.10);border:1px solid rgba(251,113,133,0.22);color:#fb7185">' + escapeHtml(resp) + '</span>';
          }
          html += '<span style="font-size:10px;color:#6ee7ff;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:110px">' + escapeHtml(site) + '</span>';
          html += '</div>';

          // Row 2: card number
          html += '<div style="margin-bottom:4px">';
          html += '<span style="color:#f1f5f9;font-weight:700;font-size:12px;font-family:\'SF Mono\',Consolas,monospace;letter-spacing:0.4px">' + escapeHtml(card) + '</span>';
          html += '</div>';

          // Row 3: amount + timestamp
          html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">';
          if (amt) {
            html += '<span style="color:#a78bfa;font-weight:800;font-size:12px">' + escapeHtml(amt) + '</span>';
          } else {
            html += '<span></span>';
          }
          html += '<span style="color:#475569;font-size:9px">' + escapeHtml(time) + '</span>';
          html += '</div>';

          div.innerHTML = html;

          // Hover effect
          div.addEventListener('mouseenter', function () {
            div.style.background = 'rgba(139,92,246,0.08)';
            div.style.borderColor = 'rgba(139,92,246,0.18)';
          });
          div.addEventListener('mouseleave', function () {
            div.style.background = 'rgba(139,92,246,0.04)';
            div.style.borderColor = 'rgba(139,92,246,0.08)';
          });

          listEl.appendChild(div);
        });
      });
    } catch (e) {
      // Extension context gone
      destroy();
    }
  }

  // ── Init ─────────────────────────────────────────────
  render();

  try {
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (_destroyed) return;
      if (area === 'local' && (changes.Nerona_hit_history || changes.Nerona_logs)) {
        render();
      }
    });
  } catch (e) {}

  // Periodic refresh with self-healing
  _intervalId = setInterval(function () {
    if (!isContextValid()) { destroy(); return; }
    render();
  }, 5000);

  // Stop polling when panel tab is hidden (saves resources)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (_intervalId) { clearInterval(_intervalId); _intervalId = null; }
    } else {
      if (!_destroyed && !_intervalId) {
        render();
        _intervalId = setInterval(function () {
          if (!isContextValid()) { destroy(); return; }
          render();
        }, 5000);
      }
    }
  });
})();
