// Nerona Gateway Payload Handlers — non-injection utility library
// Card data replacement helpers for Stripe, Adyen, Paddle, Checkout.com, etc.
(function () {
  if (window.__Nerona_GATEWAY_HANDLERS) return;
  window.__Nerona_GATEWAY_HANDLERS = true;

  function getCardBrand(num) {
    if (!num) return 'unknown';
    var n = String(num).replace(/\s+/g, '');
    var f2 = n.substring(0, 2), f4 = n.substring(0, 4);
    if (f2 === '34' || f2 === '37') return 'amex';
    if (n[0] === '4') return 'visa';
    var i2 = parseInt(f2, 10);
    if (i2 >= 51 && i2 <= 55) return 'mastercard';
    var i4 = parseInt(f4, 10);
    if (i4 >= 2221 && i4 <= 2720) return 'mastercard';
    if (f4 === '6011' || f2 === '65') return 'discover';
    if (f2 === '35') return 'jcb';
    if (f2 === '30' || f2 === '36' || f2 === '38') return 'diners';
    if (f2 === '62' || f2 === '81' || f2 === '82') return 'unionpay';
    return 'unknown';
  }

  function pad2(v) { return String(v || '').replace(/\D/g, '').padStart(2, '0'); }
  function year4(v) {
    var s = String(v || '').replace(/\D/g, '');
    if (s.length === 2) return parseInt(s, 10) <= 30 ? '20' + s : '19' + s;
    return s;
  }
  function year2(v) {
    var s = String(v || '').replace(/\D/g, '');
    return s.length === 4 ? s.slice(-2) : s.padStart(2, '0');
  }

  function replaceStripe(body, card) {
    if (typeof body !== 'string') return body;
    var m = body;
    m = m.replace(/card%5Bnumber%5D=[^&]*/gi, 'card%5Bnumber%5D=' + encodeURIComponent(card.number));
    if (card.cvc) m = m.replace(/card%5Bcvc%5D=[^&]*/gi, 'card%5Bcvc%5D=' + encodeURIComponent(card.cvc));
    m = m.replace(/card%5Bexp_month%5D=[^&]*/gi, 'card%5Bexp_month%5D=' + encodeURIComponent(card.month));
    m = m.replace(/card%5Bexp_year%5D=[^&]*/gi, 'card%5Bexp_year%5D=' + encodeURIComponent(card.year));
    m = m.replace(/payment_method_data%5Bcard%5D%5Bnumber%5D=[^&]*/gi, 'payment_method_data%5Bcard%5D%5Bnumber%5D=' + encodeURIComponent(card.number));
    if (card.cvc) m = m.replace(/payment_method_data%5Bcard%5D%5Bcvc%5D=[^&]*/gi, 'payment_method_data%5Bcard%5D%5Bcvc%5D=' + encodeURIComponent(card.cvc));
    m = m.replace(/payment_method_data%5Bcard%5D%5Bexp_month%5D=[^&]*/gi, 'payment_method_data%5Bcard%5D%5Bexp_month%5D=' + encodeURIComponent(card.month));
    m = m.replace(/payment_method_data%5Bcard%5D%5Bexp_year%5D=[^&]*/gi, 'payment_method_data%5Bcard%5D%5Bexp_year%5D=' + encodeURIComponent(card.year));
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

  function replaceAdyen(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var o = JSON.parse(body);
      var pm = o && o.details && o.details.paymentMethod || o && o.paymentMethod;
      if (!pm) return body;
      if (pm.number !== undefined) pm.number = card.number;
      if (pm.expiryMonth !== undefined && card.month) pm.expiryMonth = pad2(card.month);
      if (pm.expiryYear !== undefined && card.year) pm.expiryYear = year2(card.year);
      if (pm.holderName !== undefined) pm.holderName = card.name || 'Michael Carter';
      return JSON.stringify(o);
    } catch (e) { return body; }
  }

  function replacePaddle(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var o = JSON.parse(body);
      var d = o.data || o;
      var pmd = d.payment_method_data;
      if (!pmd || !pmd.card) return body;
      var c = pmd.card;
      if (c.number !== undefined) c.number = card.number;
      if (c.expiry_month !== undefined && card.month) c.expiry_month = parseInt(card.month, 10);
      if (c.expiry_year !== undefined && card.year) { var y = parseInt(card.year, 10); c.expiry_year = y < 100 ? 2000 + y : y; }
      if (c.cvc !== undefined && card.cvc) c.cvc = card.cvc;
      return JSON.stringify(o);
    } catch (e) { return body; }
  }

  function replaceCheckoutCom(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var o = JSON.parse(body);
      var changed = false;
      var targets = [o, o.card];
      for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        if (!t || typeof t !== 'object') continue;
        if (t.number !== undefined) { t.number = card.number; changed = true; }
        if (t.expiry_month !== undefined && card.month) { t.expiry_month = parseInt(card.month, 10); changed = true; }
        if (t.expiry_year !== undefined && card.year) { var y = parseInt(card.year, 10); t.expiry_year = y < 100 ? 2000 + y : y; changed = true; }
        if (t.cvv !== undefined && card.cvc) { t.cvv = card.cvc; changed = true; }
      }
      return changed ? JSON.stringify(o) : body;
    } catch (e) { return body; }
  }

  function replaceHiPay(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var o = JSON.parse(body);
      var changed = false;
      if (o.card_number !== undefined) { o.card_number = card.number; changed = true; }
      if (o.card_expiry_month !== undefined && card.month) { o.card_expiry_month = pad2(card.month); changed = true; }
      if (o.card_expiry_year !== undefined && card.year) { var y = parseInt(card.year, 10); o.card_expiry_year = String(y < 100 ? 2000 + y : y); changed = true; }
      if (o.card_holder !== undefined) { o.card_holder = card.name || 'Michael Carter'; changed = true; }
      if (o.cvc !== undefined && card.cvc) { o.cvc = card.cvc; changed = true; }
      return changed ? JSON.stringify(o) : body;
    } catch (e) { return body; }
  }

  function replaceNordPay(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var o = JSON.parse(body);
      var changed = false;
      var numFields = ['primary_account_number'];
      var monthFields = ['expiration_month', 'expirationMonth'];
      var yearFields = ['expiration_year', 'expirationYear'];
      var cvcFields = ['cvc', 'cvv'];
      var nameFields = ['cardholder_name', 'cardholderName'];
      var i;
      for (i = 0; i < numFields.length; i++) { if (o[numFields[i]] !== undefined) { o[numFields[i]] = card.number; changed = true; } }
      for (i = 0; i < monthFields.length; i++) { if (o[monthFields[i]] !== undefined && card.month) { o[monthFields[i]] = pad2(card.month); changed = true; } }
      for (i = 0; i < yearFields.length; i++) { if (o[yearFields[i]] !== undefined && card.year) { var y = parseInt(card.year, 10); o[yearFields[i]] = String(y < 100 ? 2000 + y : y); changed = true; } }
      for (i = 0; i < cvcFields.length; i++) { if (o[cvcFields[i]] !== undefined && card.cvc) { o[cvcFields[i]] = card.cvc; changed = true; } }
      for (i = 0; i < nameFields.length; i++) { if (o[nameFields[i]] !== undefined && card.name) { o[nameFields[i]] = card.name; changed = true; } }
      return changed ? JSON.stringify(o) : body;
    } catch (e) { return body; }
  }

  function replaceBraintree(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var o = JSON.parse(body);
      var changed = false;
      var targets = [];
      if (o.variables && o.variables.input && o.variables.input.creditCard) targets.push(o.variables.input.creditCard);
      if (o.creditCard && typeof o.creditCard === 'object') targets.push(o.creditCard);
      for (var i = 0; i < targets.length; i++) {
        var cc = targets[i];
        if (cc.number !== undefined) { cc.number = card.number; changed = true; }
        if (cc.expirationMonth !== undefined && card.month) { cc.expirationMonth = pad2(card.month); changed = true; }
        if (cc.expirationYear !== undefined && card.year) { var y = parseInt(card.year, 10); cc.expirationYear = String(y < 100 ? 2000 + y : y); changed = true; }
        if (cc.cvv !== undefined && card.cvc) { cc.cvv = card.cvc; changed = true; }
        if (cc.cvc !== undefined && card.cvc) { cc.cvc = card.cvc; changed = true; }
      }
      return changed ? JSON.stringify(o) : body;
    } catch (e) { return body; }
  }

  function replaceSquare(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var o = JSON.parse(body);
      var changed = false;
      var targets = [o, o.card, o.cardData, o.card_data];
      for (var i = 0; i < targets.length; i++) {
        var t = targets[i];
        if (!t || typeof t !== 'object') continue;
        var numF = ['number', 'cardNumber', 'card_number'];
        for (var j = 0; j < numF.length; j++) { if (t[numF[j]] !== undefined) { t[numF[j]] = card.number; changed = true; } }
        var monthF = ['expiry_month', 'expMonth', 'exp_month'];
        for (var j = 0; j < monthF.length; j++) { if (t[monthF[j]] !== undefined && card.month) { t[monthF[j]] = parseInt(card.month, 10); changed = true; } }
        var yearF = ['expiry_year', 'expYear', 'exp_year'];
        for (var j = 0; j < yearF.length; j++) { if (t[yearF[j]] !== undefined && card.year) { var y = parseInt(card.year, 10); t[yearF[j]] = y < 100 ? 2000 + y : y; changed = true; } }
        var cvcF = ['cvv', 'cvc', 'security_code'];
        for (var j = 0; j < cvcF.length; j++) { if (t[cvcF[j]] !== undefined && card.cvc) { t[cvcF[j]] = card.cvc; changed = true; } }
      }
      return changed ? JSON.stringify(o) : body;
    } catch (e) { return body; }
  }

  function replaceSteam(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var sp = new URLSearchParams(body);
      var changed = false;
      if (sp.has('CardNumber')) { sp.set('CardNumber', card.number); changed = true; }
      if (sp.has('CardExpirationYear') && card.year) { var y = parseInt(card.year, 10); sp.set('CardExpirationYear', String(y < 100 ? 2000 + y : y)); changed = true; }
      if (sp.has('CardExpirationMonth') && card.month) { sp.set('CardExpirationMonth', pad2(card.month)); changed = true; }
      var cvcFields = ['SecurityCode', 'CardSecurityCode', 'CVV', 'CVC', 'CardCVC', 'CardCVV', 'CardCVV2'];
      for (var i = 0; i < cvcFields.length; i++) { if (sp.has(cvcFields[i])) { sp.delete(cvcFields[i]); changed = true; } }
      return changed ? sp.toString() : body;
    } catch (e) { return body; }
  }

  function replaceSmartGlocal(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var o = JSON.parse(body);
      if (!o.paymentDetails || !o.paymentDetails.card) return body;
      var c = o.paymentDetails.card;
      var changed = false;
      if (c.number !== undefined) { c.number = card.number; changed = true; }
      if (c.expirationMonth !== undefined && card.month) { c.expirationMonth = pad2(card.month); changed = true; }
      if (c.expirationYear !== undefined && card.year) { c.expirationYear = year2(card.year); changed = true; }
      var cvcF = ['securityCode', 'security_code', 'cvc', 'cvv'];
      for (var i = 0; i < cvcF.length; i++) { if (c[cvcF[i]] !== undefined && card.cvc) { c[cvcF[i]] = card.cvc; changed = true; } }
      return changed ? JSON.stringify(o) : body;
    } catch (e) { return body; }
  }

  function replaceEdfaPay(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var sp = new URLSearchParams(body);
      var changed = false;
      if (sp.has('card_number')) { sp.set('card_number', card.number.replace(/\s/g, '')); changed = true; }
      if (sp.has('card_exp_month') && card.month) { sp.set('card_exp_month', pad2(card.month)); changed = true; }
      if (sp.has('card_exp_year') && card.year) { var y = year4(card.year); sp.set('card_exp_year', y); changed = true; }
      if (sp.has('card_cvv2') && card.cvc) { sp.set('card_cvv2', card.cvc); changed = true; }
      if (sp.has('card_scheme')) { sp.set('card_scheme', getCardBrand(card.number)); changed = true; }
      return changed ? sp.toString() : body;
    } catch (e) { return body; }
  }

  function replaceXsolla(body, card) {
    if (typeof body !== 'string') return body;
    try {
      var o = JSON.parse(body);
      var changed = false;
      if (o.payment_method && o.payment_method.data && o.payment_method.data.card_number !== undefined) { o.payment_method.data.card_number = card.number; changed = true; }
      if (o.payment_method && o.payment_method.data && o.payment_method.data.exp_month !== undefined && card.month) { o.payment_method.data.exp_month = pad2(card.month); changed = true; }
      if (o.payment_method && o.payment_method.data && o.payment_method.data.exp_year !== undefined && card.year) { o.payment_method.data.exp_year = year2(card.year); changed = true; }
      if (o.payment_method && o.payment_method.data && o.payment_method.data.cvv !== undefined && card.cvc) { o.payment_method.data.cvv = card.cvc; changed = true; }
      if (o.card_number !== undefined) { o.card_number = card.number; changed = true; }
      if (o.exp_month !== undefined && card.month) { o.exp_month = pad2(card.month); changed = true; }
      if (o.exp_year !== undefined && card.year) { o.exp_year = year2(card.year); changed = true; }
      if (o.cvv !== undefined && card.cvc) { o.cvv = card.cvc; changed = true; }
      return changed ? JSON.stringify(o) : body;
    } catch (e) { return body; }
  }

  function replaceGog(body, card) {
    return replaceAdyen(body, card);
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

  function replaceCard(url, body, card) {
    if (!body || !card || !card.number) return body;
    var gateway = detectGatewayFromUrl(url) || detectGatewayFromBody(body);
    if (!gateway) return body;

    var handlers = {
      stripe: replaceStripe,
      adyen: replaceAdyen,
      paddle: replacePaddle,
      checkout_com: replaceCheckoutCom,
      braintree: replaceBraintree,
      square: replaceSquare,
      hipay: replaceHiPay,
      steam: replaceSteam,
      smart_glocal: replaceSmartGlocal,
      edfapay: replaceEdfaPay,
      xsolla: replaceXsolla,
      gog: replaceGog,
      nordpay: replaceNordPay
    };

    var handler = handlers[gateway];
    if (!handler) return body;
    try {
      return handler(body, card);
    } catch (e) {
      console.warn('[KIORAxAUTO Gateway] Handler error for ' + gateway + ':', e.message);
      return body;
    }
  }

  function isSuccess(data, gateway) {
    if (!data) return false;
    if (data.status === 'succeeded' || data.paid === true || data.success === true || data.approved === true) return true;
    if (data.object === 'charge' && data.status === 'succeeded') return true;
    if (data.payment_status === 'paid') return true;

    if (gateway === 'adyen' && (data.resultCode === 'Authorised' || data.resultCode === 'Pending')) return true;
    if (gateway === 'braintree' && data.transaction && (data.transaction.status === 'submitted_for_settlement' || data.transaction.status === 'authorized')) return true;
    if (gateway === 'checkout_com' && (data.approved === true || data.status === 'Authorized' || data.status === 'Captured')) return true;
    if (gateway === 'square' && data.payment && data.payment.status === 'COMPLETED') return true;
    if (gateway === 'paddle' && (data.state === 'completed' || data.status === 'success')) return true;
    if (gateway === 'hipay' && (data.status === '118' || data.state === 'completed')) return true;
    if (gateway === 'steam' && (data.success === 1 || data.transStatus === 'Y')) return true;

    if (data.payment_intent && data.payment_intent.status === 'succeeded') return true;
    if (data.charge && data.charge.status === 'succeeded') return true;
    if (data.data && data.data.status === 'succeeded') return true;
    return false;
  }

  function getDeclineCode(data) {
    if (!data) return null;
    if (data.decline_code) return data.decline_code;
    if (data.error && data.error.decline_code) return data.error.decline_code;
    if (data.error && data.error.code) return data.error.code;
    if (data.code && typeof data.code === 'string' && data.code.includes('_')) return data.code;
    if (data.failure_code) return data.failure_code;
    return null;
  }

  window.NeronaGatewayHandlers = {
    replaceCard: replaceCard,
    detectGatewayFromUrl: detectGatewayFromUrl,
    detectGatewayFromBody: detectGatewayFromBody,
    isSuccess: isSuccess,
    getDeclineCode: getDeclineCode,
    getCardBrand: getCardBrand,
    handlers: {
      stripe: replaceStripe,
      adyen: replaceAdyen,
      paddle: replacePaddle,
      checkout_com: replaceCheckoutCom,
      braintree: replaceBraintree,
      square: replaceSquare,
      hipay: replaceHiPay,
      steam: replaceSteam,
      smart_glocal: replaceSmartGlocal,
      edfapay: replaceEdfaPay,
      xsolla: replaceXsolla,
      gog: replaceGog,
      nordpay: replaceNordPay
    }
  };
})();
