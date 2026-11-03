# Contributing

Thanks for your interest in improving **Hide AI Overview**.

## Reporting bugs

Open an issue and include:

- Browser + version (Chrome / Edge / Brave / Firefox).
- Extension version (from `chrome://extensions/`).
- The Google search URL that triggers the problem (if shareable).
- A screenshot showing the AI Overview still visible.
- Any errors from the extension's service-worker console
  (`chrome://extensions/` → **Errors** on the extension card).

## Suggesting features

Open an issue describing the use case. Keep requests aligned with the
single purpose of the extension: hiding Google's AI Overview.

## Pull requests

1. Fork and clone the repo.
2. Make your changes on a feature branch.
3. Test locally by loading the folder as an unpacked extension.
4. Open a PR with a clear description and screenshots if the UI changed.

## Coding style

- Plain ES2020+ JavaScript, no build step, no bundler.
- 2-space indentation.
- Keep it dependency-free.
- No network requests, no analytics, no remote code.