/*
 * Hide Google AI Overview — runs only when the extension is enabled.
 * Injected dynamically by background.js via chrome.scripting.
 *
 * Listens for { type: "setState", enabled } messages so the active tab
 * updates immediately when the toolbar button is toggled, without reload.
 */
(function () {
  'use strict';

  // Guard against double-injection when the toggle is flipped on twice.
  if (window.__hideAiOverviewInstalled) return;
  window.__hideAiOverviewInstalled = true;

  const SELECTORS = [
    '#Odp5De',                // AI Overview wrapper (primary target)
    '#eKIzJc',                // AI Overview card container
    'div[jsname="ZLxsqf"]',   // AI Overview component marker
    'div[jsname="dEwkXc"]'    // AI Overview controller
  ];

  const STYLE_ID = '__hide_ai_overview_style';
  const hiddenByUs = new WeakSet();

  function applyHide() {
    for (const sel of SELECTORS) {
      for (const el of document.querySelectorAll(sel)) {
        el.style.setProperty('display', 'none', 'important');
        hiddenByUs.add(el);
      }
    }
  }

  function undoHide() {
    for (const sel of SELECTORS) {
      for (const el of document.querySelectorAll(sel)) {
        el.style.removeProperty('display');
      }
    }
    // Remove the <style> fallback if present.
    const s = document.getElementById(STYLE_ID);
    if (s) s.remove();
  }

  function hideAll(root) {
    root = root || document;
    for (const sel of SELECTORS) {
      for (const el of root.querySelectorAll(sel)) {
        el.style.setProperty('display', 'none', 'important');
      }
    }
  }

  // Initial hide
  hideAll();

  // Watch for dynamically inserted AI Overview nodes
  const observer = new MutationObserver(function (mutations) {
    let shouldScan = false;
    for (const m of mutations) {
      if (m.addedNodes && m.addedNodes.length) {
        shouldScan = true;
        break;
      }
    }
    if (shouldScan) hideAll();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // SPA navigation
  let lastUrl = location.href;
  setInterval(function () {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      hideAll();
    }
  }, 300);

  // Live toggle from background.js (no page reload needed)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener(function (msg) {
      if (!msg || msg.type !== 'setState') return;
      if (msg.enabled) {
        hideAll();
      } else {
        undoHide();
        observer.disconnect();
        window.__hideAiOverviewInstalled = false;
      }
    });
  }
})();