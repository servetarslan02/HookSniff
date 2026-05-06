/**
 * HookSniff Embeddable Portal Widget
 * 
 * Usage: <script src="embed.js" data-api-key="YOUR_API_KEY" data-api-url="https://api.hooksniff.is-a.dev" data-theme="dark"></script>
 * 
 * Attributes:
 *   data-api-key   (required) — Customer API key
 *   data-api-url   (optional) — API base URL (default: https://api.hooksniff.is-a.dev)
 *   data-theme     (optional) — "dark" or "light" (default: "dark")
 *   data-height    (optional) — Widget height (default: "600px")
 *   data-width     (optional) — Widget width  (default: "100%")
 *   data-target    (optional) — CSS selector for target container (default: insert after script tag)
 */
(function () {
  "use strict";

  var SCRIPT_TAG = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var API_KEY  = SCRIPT_TAG.getAttribute("data-api-key");
  var API_URL  = SCRIPT_TAG.getAttribute("data-api-url") || "https://api.hooksniff.is-a.dev";
  var THEME    = SCRIPT_TAG.getAttribute("data-theme")    || "dark";
  var HEIGHT   = SCRIPT_TAG.getAttribute("data-height")   || "600px";
  var WIDTH    = SCRIPT_TAG.getAttribute("data-width")    || "100%";
  var TARGET   = SCRIPT_TAG.getAttribute("data-target");

  if (!API_KEY) {
    console.error("[HookSniff] data-api-key attribute is required.");
    return;
  }

  // Resolve widget.html relative to the script location
  var scriptSrc = SCRIPT_TAG.src || "";
  var baseUrl   = scriptSrc.replace(/[^/]*$/, "");
  var widgetUrl = baseUrl + "widget.html";

  // Build iframe
  var iframe = document.createElement("iframe");
  iframe.src = widgetUrl
    + "?api_key="  + encodeURIComponent(API_KEY)
    + "&api_url="  + encodeURIComponent(API_URL)
    + "&theme="    + encodeURIComponent(THEME);
  iframe.style.width      = WIDTH;
  iframe.style.height     = HEIGHT;
  iframe.style.border     = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.overflow   = "hidden";
  iframe.style.display    = "block";
  iframe.style.boxShadow  = "0 4px 24px rgba(0,0,0,0.12)";
  iframe.setAttribute("title", "HookSniff Webhook Portal");
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("allow", "clipboard-read; clipboard-write");

  // Insert iframe into target container or after script tag
  if (TARGET) {
    var container = document.querySelector(TARGET);
    if (container) {
      container.appendChild(iframe);
    } else {
      console.warn("[HookSniff] Target container '" + TARGET + "' not found. Falling back to script position.");
      SCRIPT_TAG.parentNode.insertBefore(iframe, SCRIPT_TAG.nextSibling);
    }
  } else {
    SCRIPT_TAG.parentNode.insertBefore(iframe, SCRIPT_TAG.nextSibling);
  }
})();
