/*
 * Hide AI Overview - background service worker.
 * Manages ON/OFF state and notifies tabs; badge reflects state.
 */

const GOOGLE_URL_PATTERNS = [
  "*://www.google.com/*",
  "*://www.google.co.ke/*",
  "*://www.google.co.uk/*",
  "*://www.google.ca/*",
  "*://www.google.com.au/*",
  "*://www.google.de/*",
  "*://www.google.fr/*",
  "*://www.google.co.in/*",
  "*://www.google.es/*",
  "*://www.google.it/*",
  "*://www.google.nl/*",
  "*://www.google.co.za/*",
  "*://www.google.com.ng/*",
  "*://www.google.co.tz/*",
  "*://www.google.co.ug/*"
];

async function getEnabled() {
  const { enabled } = await chrome.storage.local.get("enabled");
  return enabled !== false;
}

async function setEnabled(value) {
  await chrome.storage.local.set({ enabled: !!value });
  await updateBadge();
}

async function updateBadge() {
  const enabled = await getEnabled();
  const text = enabled ? "ON" : "OFF";
  const color = enabled ? "#c0392b" : "#7f8c8d";
  try {
    await chrome.action.setBadgeText({ text });
    await chrome.action.setBadgeBackgroundColor({ color });
    await chrome.action.setTitle({
      title: enabled
        ? "Hide AI Overview: ON (click to disable)"
        : "Hide AI Overview: OFF (click to enable)"
    });
  } catch (e) {}
}

async function broadcastState() {
  const enabled = await getEnabled();
  const tabs = await chrome.tabs.query({ url: GOOGLE_URL_PATTERNS });
  for (const tab of tabs) {
    if (tab.id == null) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: "setState",
        enabled
      });
    } catch (e) {
      // Tab has no content script (e.g., search page not fully loaded yet).
    }
  }
}

chrome.action.onClicked.addListener(async () => {
  const enabled = await getEnabled();
  await setEnabled(!enabled);
  await broadcastState();
});

chrome.runtime.onInstalled.addListener(async () => {
  const { enabled } = await chrome.storage.local.get("enabled");
  if (enabled === undefined) await chrome.storage.local.set({ enabled: true });
  await updateBadge();
});

chrome.runtime.onStartup.addListener(async () => {
  await updateBadge();
});