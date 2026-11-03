/*
 * Hide AI Overview — background service worker.
 *
 * Responsibilities:
 *  - Persist the enabled/disabled state in chrome.storage.local.
 *  - On state change, inject or remove hide.css + hide.js in all matching tabs.
 *  - Update the toolbar badge (ON / OFF) and title.
 *  - On page load, re-inject into new Google search tabs if enabled.
 */

const GOOGLE_URL_PATTERNS = [
  '*://www.google.com/*',
  '*://www.google.co.ke/*',
  '*://www.google.co.uk/*',
  '*://www.google.ca/*',
  '*://www.google.com.au/*',
  '*://www.google.de/*',
  '*://www.google.fr/*',
  '*://www.google.co.in/*',
  '*://www.google.es/*',
  '*://www.google.it/*',
  '*://www.google.nl/*',
  '*://www.google.co.za/*',
  '*://www.google.com.ng/*',
  '*://www.google.co.tz/*',
  '*://www.google.co.ug/*'
];

const FILES_CSS = ['hide.css'];
const FILES_JS  = ['hide.js'];

// -------- State helpers --------

async function getEnabled() {
  const { enabled } = await chrome.storage.local.get('enabled');
  // Default: enabled (hide AI Overview) on first install
  return enabled !== false;
}

async function setEnabled(value) {
  await chrome.storage.local.set({ enabled: !!value });
  await updateBadge();
}

async function updateBadge() {
  const enabled = await getEnabled();
  const text = enabled ? 'ON' : 'OFF';
  const color = enabled ? '#c0392b' : '#7f8c8d';
  try {
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color });
    await chrome.action.setTitle({
      title: enabled
        ? 'Hide AI Overview: ON (click to disable)'
        : 'Hide AI Overview: OFF (click to enable)'
    });
  } catch (e) {
    // ignore (e.g., during install race)
  }
}

// -------- Injection helpers --------

function isGoogleTab(url) {
  if (!url) return false;
  try {
    const u = new URL(url);
    return /(^|\.)google\.[a-z.]+$/.test(u.hostname);
  } catch {
    return false;
  }
}

async function injectIntoTab(tabId) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: FILES_CSS
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: FILES_JS
    });
  } catch (e) {
    // Tab may be discarded, chrome://, or already closed — ignore.
  }
}

async function removeFromTab(tabId) {
  try {
    // Tell the running content script to restore elements.
    await chrome.tabs.sendMessage(tabId, { type: 'setState', enabled: false });
  } catch (e) {
    // No listener (script not present) — fall through to CSS removal.
  }
  try {
    await chrome.scripting.removeCSS({
      target: { tabId },
      files: FILES_CSS
    });
  } catch (e) {
    // ignore
  }
}

async function applyStateToAllTabs() {
  const enabled = await getEnabled();
  const tabs = await chrome.tabs.query({ url: GOOGLE_URL_PATTERNS });
  for (const tab of tabs) {
    if (tab.id == null) continue;
    if (enabled) {
      await injectIntoTab(tab.id);
    } else {
      await removeFromTab(tab.id);
    }
  }
}

// -------- Toolbar click --------

chrome.action.onClicked.addListener(async () => {
  const enabled = await getEnabled();
  await setEnabled(!enabled);
  await applyStateToAllTabs();
});

// -------- On tab load: re-inject if enabled --------

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!isGoogleTab(tab.url)) return;
  const enabled = await getEnabled();
  if (enabled) {
    await injectIntoTab(tabId);
  }
});

// -------- Install / startup --------

chrome.runtime.onInstalled.addListener(async () => {
  const { enabled } = await chrome.storage.local.get('enabled');
  if (enabled === undefined) {
    await chrome.storage.local.set({ enabled: true });
  }
  await updateBadge();
  await applyStateToAllTabs();
});

chrome.runtime.onStartup.addListener(async () => {
  await updateBadge();
  await applyStateToAllTabs();
});