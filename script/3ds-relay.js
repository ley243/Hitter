// Nerona 3DS Relay Background Handler — improved
// Proxies Stripe 3DS2 authenticate requests to the bypass relay server.
(function () {
  const RELAY_ENDPOINT_DEFAULT = "https://db-auth-svc-v2.testdeep.workers.dev/relay/3ds2";
  const DEFAULT_LICENSE_KEY = "DB-4588-8448-4848-8484";

  async function getLicenseState() {
    try {
      const storage = await chrome.storage.local.get(["dbLicense", "dbLicenseSession", "dbActiveLicenseKey"]);
      const license = storage?.dbLicense || null;
      const session = storage?.dbLicenseSession || null;
      const activeKey = storage?.dbActiveLicenseKey || null;
      const licenseKey = String(license?.key || activeKey || DEFAULT_LICENSE_KEY).trim().toUpperCase();
      if (/^DB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(licenseKey)) {
        return { licenseKey: licenseKey, sessionId: session?.sessionId || "", accessToken: session?.accessToken || "", refreshToken: session?.refreshToken || "" };
      }
      return { licenseKey: "", sessionId: "", accessToken: "", refreshToken: "" };
    } catch (e) {
      return { licenseKey: "", sessionId: "", accessToken: "", refreshToken: "" };
    }
  }

  try {
    if (chrome.runtime && chrome.runtime.onInstalled) {
      chrome.runtime.onInstalled.addListener(function () {
        chrome.storage.local.get(["dbLicense", "dbActiveLicenseKey", "Nerona_3ds_auto_cancel", "Nerona_toggle_gateway_skip"], function (result) {
          if (!result.dbLicense && !result.dbActiveLicenseKey) {
            chrome.storage.local.set({ dbLicense: { key: DEFAULT_LICENSE_KEY, valid: true, plan: "3ds", createdAt: Date.now() } });
          }
          if (typeof result.Nerona_3ds_auto_cancel === 'undefined') {
            chrome.storage.local.set({ Nerona_3ds_auto_cancel: true });
          }
          if (typeof result.Nerona_toggle_gateway_skip === 'undefined') {
            chrome.storage.local.set({ Nerona_toggle_gateway_skip: false });
          }
        });
      });
    }
  } catch (e) {}

  async function generateRequestSignature(licenseKey) {
    const timestamp = Date.now().toString();
    const secretKey = "dB_x9Kp$2vR!mL7w";
    const message = secretKey + ": " + timestamp + ": " + licenseKey;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(secretKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
    return {
      ts: timestamp,
      signature: Array.from(new Uint8Array(signature)).map(byte => byte.toString(16).padStart(2, "0")).join("")
    };
  }

  async function getRelayEndpoint() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["Nerona_3ds_relay_url", "Nerona_settings"], function (result) {
        var customUrl = result.Nerona_3ds_relay_url;
        if (customUrl && typeof customUrl === "string" && customUrl.trim()) {
          resolve(customUrl.trim().replace(/\/+$/, "") + "/relay/3ds2");
          return;
        }
        var settings = result.Nerona_settings || {};
        if (settings.relayServerUrl && typeof settings.relayServerUrl === "string") {
          resolve(settings.relayServerUrl.trim().replace(/\/+$/, "") + "/relay/3ds2");
          return;
        }
        resolve(RELAY_ENDPOINT_DEFAULT);
      });
    });
  }

  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.onMessage) return;

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (!request || request.type !== "Nerona_3DS_RELAY") return false;

    (async function () {
      try {
        var url = request.url;
        var body = request.body;
        var origin = request.origin;
        var referer = request.referer;

        if (!url || !url.includes("stripe.com")) {
          sendResponse({ error: "Invalid target URL" });
          return;
        }

        var cfg = await new Promise(function (resolve) {
          chrome.storage.local.get(["Nerona_3ds_auto_cancel"], resolve);
        });
        if (cfg.Nerona_3ds_auto_cancel === false) {
          sendResponse({ error: "3DS bypass disabled" });
          return;
        }

        var relayUrl = await getRelayEndpoint();
        var licenseState = await getLicenseState();
        if (!licenseState.licenseKey) {
          sendResponse({ error: "NO License required for 3DS bypass" });
          return;
        }
        var signature = await generateRequestSignature(licenseState.licenseKey);
        var headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-DB-License": licenseState.licenseKey,
          "X-DB-Timestamp": signature.ts,
          "X-DB-Signature": signature.signature
        };
        if (origin && typeof origin === "string") headers["X-Original-Origin"] = origin;
        if (referer && typeof referer === "string") headers["X-Original-Referer"] = referer;

        var response = await fetch(relayUrl, { method: "POST", headers: headers, body: body });
        var responseText = await response.text();

        var threeDSState = "";
        var threeDSTransStatus = "";
        var threeDSErrorMessage = "";
        try {
          var responseData = JSON.parse(responseText || "{}");
          threeDSState = responseData.state || responseData.status || "";
          threeDSTransStatus = responseData.ares && responseData.ares.transStatus || "";
          if (responseData.error) {
            threeDSErrorMessage = responseData.error.message || responseData.error.code || JSON.stringify(responseData.error);
          }
        } catch (e) {}

        var responseHeaders = {};
        response.headers.forEach(function (value, key) { responseHeaders[key.toLowerCase()] = value; });

        sendResponse({
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
          body: responseText,
          threeDSState: threeDSState,
          threeDSTransStatus: threeDSTransStatus,
          threeDSErrorMessage: threeDSErrorMessage
        });
      } catch (error) {
        sendResponse({ error: (error && error.message) || "Relay server connection failed" });
      }
    })();

    return true;
  });
})();
