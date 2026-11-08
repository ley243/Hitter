// Nerona Payment Gateway Detector — non-injection utility library
// Detects payment gateways from page context, URL, or request body.
(function () {
  if (window.__Nerona_GATEWAY_DETECTOR) return;
  window.__Nerona_GATEWAY_DETECTOR = true;

  var _cache = { result: null, ts: 0, ttl: 5000 };

  function hasScript(pattern) {
    try {
      var scripts = document.querySelectorAll('script[src]');
      for (var i = 0; i < scripts.length; i++) {
        if ((scripts[i].src || '').indexOf(pattern) !== -1) return true;
      }
    } catch (e) {}
    return false;
  }

  function hasIframe(pattern) {
    try {
      var iframes = document.querySelectorAll('iframe[src]');
      for (var i = 0; i < iframes.length; i++) {
        if ((iframes[i].src || '').indexOf(pattern) !== -1) return true;
      }
    } catch (e) {}
    return false;
  }

  function detectGateway() {
    var now = Date.now();
    if (_cache.result && now - _cache.ts < _cache.ttl) return _cache.result;

    var h = '';
    try { h = (window.location.hostname || '').toLowerCase(); } catch (e) {}
    var p = '';
    try { p = (window.location.pathname || '').toLowerCase(); } catch (e) {}
    var u = '';
    try { u = (window.location.href || '').toLowerCase(); } catch (e) {}

    var detected = [];

    if (h.indexOf('stripe.com') !== -1 || h.indexOf('stripe.network') !== -1 ||
        hasScript('js.stripe.com') || hasIframe('stripe.com') ||
        window.Stripe || window.__stripe) {
      detected.push('stripe');
    }

    if (h.indexOf('adyen.com') !== -1 || h.indexOf('adyenpayments.com') !== -1 ||
        hasScript('adyen') || window.AdyenCheckout || window.adyenPublicKey) {
      detected.push('adyen');
    }

    if (h.indexOf('paddle.com') !== -1 || h.indexOf('paddle.net') !== -1 ||
        hasScript('paddle.com') || hasScript('paddle.net') || window.Paddle) {
      detected.push('paddle');
    }

    if (h.indexOf('braintree') !== -1 || h.indexOf('braintreegateway.com') !== -1 ||
        hasScript('braintree') || hasIframe('braintree') ||
        window.braintree || window.Braintree || window.braintreeClient) {
      detected.push('braintree');
    }

    if (h.indexOf('checkout.com') !== -1 || hasScript('checkout.com') || window.Frames) {
      detected.push('checkout_com');
    }

    if (h.indexOf('squareup.com') !== -1 || h.indexOf('square.site') !== -1 ||
        hasScript('squareup.com') || hasScript('squarecdn.com') || hasIframe('squareup.com') ||
        window.Square || window.SquarePayments || window.square) {
      detected.push('square');
    }

    if (h.indexOf('hipay.com') !== -1 || h.indexOf('hipay-tpp.com') !== -1 || hasScript('hipay')) {
      detected.push('hipay');
    }

    if (h.indexOf('xsolla.com') !== -1 || h.indexOf('xsolla.net') !== -1 || hasScript('xsolla')) {
      detected.push('xsolla');
    }

    if (h.indexOf('steampowered.com') !== -1 || h.indexOf('steam.com') !== -1) {
      detected.push('steam');
    }

    if (h.indexOf('gog.com') !== -1 && (p.indexOf('/checkout') !== -1 || p.indexOf('/payment') !== -1)) {
      detected.push('gog');
    }

    if (h.indexOf('edfapay.com') !== -1 || hasScript('edfapay.com') || hasIframe('edfapay.com')) {
      detected.push('edfapay');
    }

    if (h.indexOf('smart-glocal.com') !== -1 || hasScript('smart-glocal.com') || hasIframe('smart-glocal.com')) {
      detected.push('smart_glocal');
    }

    if (h.indexOf('nordcheckout.com') !== -1 || h.indexOf('nordvpn.com') !== -1 || h.indexOf('nordsec.com') !== -1) {
      detected.push('nordpay');
    }

    if (detected.length === 0) {
      try {
        var cardInput = document.querySelector(
          '[autocomplete="cc-number"], input[name*="cardnumber" i], input[name*="card_number" i], ' +
          'input[placeholder*="card number" i], input[aria-label*="card number" i], ' +
          'iframe[name*="cardnumber"], iframe[title*="card number" i]'
        );
        if (cardInput) detected.push('generic_card');
      } catch (e) {}
    }

    var result = {
      gateways: detected,
      primary: detected[0] || null,
      isPaymentPage: detected.length > 0
    };

    _cache = { result: result, ts: now, ttl: 5000 };
    return result;
  }

  function detectGatewayFromUrl(url) {
    if (!url) return null;
    var u = url.toLowerCase();
    if (u.includes('api.stripe.com') || u.includes('stripe.com/v1/')) return 'stripe';
    if (u.includes('adyen.com') || u.includes('adyenpayments.com')) return 'adyen';
    if (u.includes('paddle.com') || u.includes('paddle.net')) return 'paddle';
    if (u.includes('checkout.com') || u.includes('api.checkout.com')) return 'checkout_com';
    if (u.includes('braintree') || u.includes('braintreegateway.com')) return 'braintree';
    if (u.includes('squareup.com') || u.includes('square.site')) return 'square';
    if (u.includes('hipay.com') || u.includes('hipay-tpp.com')) return 'hipay';
    if (u.includes('steampowered.com') || u.includes('steam.com')) return 'steam';
    if (u.includes('smart-glocal.com')) return 'smart_glocal';
    if (u.includes('edfapay.com')) return 'edfapay';
    if (u.includes('xsolla.com') || u.includes('xsolla.net')) return 'xsolla';
    if (u.includes('api.gog.com')) return 'gog';
    if (u.includes('nordcheckout.com') || u.includes('nordvpn.com')) return 'nordpay';
    return null;
  }

  function detectGatewayFromBody(body) {
    if (!body || typeof body !== 'string') return null;
    var b = body.toLowerCase();
    if (b.includes('payment_method_data') || b.includes('card[number]') || b.includes('card%5bnumber%5d')) return 'stripe';
    if (b.includes('encryptedcardnumber') || (b.includes('"details"') && b.includes('"paymentmethod"'))) return 'adyen';
    if (b.includes('card_number') && b.includes('card_expiry_month') && !b.includes('card_data')) return 'hipay';
    if (b.includes('card_number') && b.includes('card_cvv2')) return 'edfapay';
    if (b.includes('cardnumber') && b.includes('cardexpirationyear')) return 'steam';
    if (b.includes('primary_account_number')) return 'nordpay';
    return null;
  }

  window.NeronaGatewayDetector = {
    detect: detectGateway,
    isPaymentPage: function () { return detectGateway().isPaymentPage; },
    getGateway: function () { return detectGateway().primary; },
    detectGatewayFromUrl: detectGatewayFromUrl,
    detectGatewayFromBody: detectGatewayFromBody,
    GATEWAY_LABELS: {
      stripe: 'Stripe',
      adyen: 'Adyen',
      paddle: 'Paddle',
      checkout_com: 'Checkout.com',
      braintree: 'Braintree',
      square: 'Square',
      hipay: 'HiPay',
      xsolla: 'Xsolla',
      steam: 'Steam',
      gog: 'GOG',
      edfapay: 'EdfaPay',
      smart_glocal: 'Smart Glocal',
      nordpay: 'NordPay',
      generic_card: 'Card Payment'
    }
  };
})();
