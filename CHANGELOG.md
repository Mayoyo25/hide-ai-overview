# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-11-03

### Fixed
- AI Overview flashed briefly before being hidden. `hide.css` is now
  injected at `document_start` via a static content script, and visibility
  is controlled by a class on `<html>`, eliminating the flash entirely.

### Changed
- `background.js` no longer uses `chrome.scripting` for CSS injection;
  the toolbar toggle now just adds/removes a class via `sendMessage`.

### Added
- Toolbar toggle button with ON/OFF badge.
- Persistent on/off state via `chrome.storage.local`.
- Live tab updates when toggling (no page reload needed).
- `background.js` service worker for injection control.
- Custom icons under `icons/`.

### Changed
- Content script is now injected dynamically via `chrome.scripting`
  instead of being declared statically in `manifest.json`.
- Manifest permissions updated: added `storage` and `scripting`.

### Fixed
- AI Overview reliably hidden across SPA navigations.

## [1.0.0] - 2026-11-03

### Added
- Initial release: hides Google AI Overview using `#Odp5De`,
  `#eKIzJc`, `div[jsname="ZLxsqf"]`, and `div[jsname="dEwkXc"]`.
- Leaves ads and organic results untouched.