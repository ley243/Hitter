// Nerona Panel Gateway Status — non-injection URL-based detection
(function () {
  if (window.__Nerona_PANEL_GATEWAY_STATUS) return;
  window.__Nerona_PANEL_GATEWAY_STATUS = true;

  var GATEWAY_LABELS = {
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
    nordpay: 'NordPay'
  };

  function detectGatewayFromUrl(url) {
    if (!url) return null;
    var u = url.toLowerCase();
    if (u.includes('stripe.com') || u.includes('stripe.network')) return 'stripe';
    if (u.includes('adyen.com') || u.includes('adyenpayments.com')) return 'adyen';
    if (u.includes('paddle.com') || u.includes('paddle.net')) return 'paddle';
    if (u.includes('checkout.com')) return 'checkout_com';
    if (u.includes('braintree') || u.includes('braintreegateway.com')) return 'braintree';
    if (u.includes('squareup.com') || u.includes('square.site')) return 'square';
    if (u.includes('hipay.com') || u.includes('hipay-tpp.com')) return 'hipay';
    if (u.includes('xsolla.com') || u.includes('xsolla.net')) return 'xsolla';
    if (u.includes('steampowered.com') || u.includes('steam.com')) return 'steam';
    if (u.includes('gog.com') && (u.includes('/checkout') || u.includes('/payment'))) return 'gog';
    if (u.includes('edfapay.com')) return 'edfapay';
    if (u.includes('smart-glocal.com')) return 'smart_glocal';
    if (u.includes('nordcheckout.com') || u.includes('nordvpn.com')) return 'nordpay';
    if (u.includes('/checkout') || u.includes('/c/pay/') || u.includes('pay.')) return 'generic_payment';
    return null;
  }

  function updateBadge(gateway) {
    var badge = document.getElementById('gatewayBadge');
    var name = document.getElementById('gatewayName');
    if (!badge || !name) return;
    if (gateway && GATEWAY_LABELS[gateway]) {
      badge.textContent = 'Detected';
      badge.style.background = 'rgba(0, 229, 255, 0.12)';
      badge.style.color = '#00e5ff';
      name.textContent = GATEWAY_LABELS[gateway];
    } else if (gateway === 'generic_payment') {
      badge.textContent = 'Payment';
      badge.style.background = 'rgba(251, 191, 36, 0.12)';
      badge.style.color = '#fbbf24';
      name.textContent = 'Checkout page';
    } else {
      badge.textContent = 'None';
      badge.style.background = 'rgba(148, 163, 184, 0.12)';
      badge.style.color = '#94a3b8';
      name.textContent = 'No gateway detected';
    }
  }

  function refresh() {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var tab = tabs && tabs[0];
        var gateway = detectGatewayFromUrl(tab && tab.url);
        updateBadge(gateway);
      });
    } catch (e) {
      updateBadge(null);
    }
  }

  function init() {
    refresh();
    try {
      chrome.tabs.onActivated.addListener(refresh);
      chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
        if (changeInfo.url) refresh();
      });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
