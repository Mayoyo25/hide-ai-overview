/*
 * Hide AI Overview content script.
 * Runs at document_start for both CSS and JS.
 *
 * Responsibilities:
 *  - Read the stored enabled state as early as possible.
 *  - Toggle <html class="hide-ai-overview-on"> accordingly.
 *  - Provide a mutation observer + SPA URL watcher as backup
 *    (CSS handles the hiding; JS just keeps state coherent).
 *  - Respond to live toggle messages from background.js.
 */
(function () {
  "use strict";

  const CLASS_ON = "hide-ai-overview-on";

  function setOn() {
    document.documentElement.classList.add(CLASS_ON);
  }

  function setOff() {
    document.documentElement.classList.remove(CLASS_ON);
  }

  // 1. Apply the stored state immediately (async read, but fast).
  chrome.storage.local.get("enabled").then(function (r) {
    const enabled = r.enabled !== false;
    if (enabled) setOn();
    else setOff();
  });

  // 2. Live toggle from background.js (toolbar click).
  if (chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function (msg) {
      if (!msg || msg.type !== "setState") return;
      if (msg.enabled) setOn();
      else setOff();
    });
  }

  // 3. Fallback: if for some reason storage wasn't readable yet
  //    and the extension is ON, keep the class applied on mutations.
  const observer = new MutationObserver(function () {
    chrome.storage.local.get("enabled").then(function (r) {
      if (r.enabled !== false) {
        if (!document.documentElement.classList.contains(CLASS_ON)) setOn();
      }
    });
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: false
  });

  // 4. SPA navigation — re-apply class (harmless if already there).
  let lastUrl = location.href;
  setInterval(function () {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      chrome.storage.local.get("enabled").then(function (r) {
        if (r.enabled !== false) setOn();
      });
    }
  }, 300);
})();