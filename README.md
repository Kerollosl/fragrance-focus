# Fragrance Focus

A no-build Chrome extension that organizes Fragrantica perfume pages while preserving their original look.

## Version 0.2

The site remains recognizably Fragrantica: its logo, header/search, native fonts, light/dark theme, colorful accord bars, designer logo, voting icons, and photographic note pyramid are preserved. The extension adds a small section navigator, reduces oversized bottle/logo imagery, cleans spacing, and groups ratings, notes, performance, and pros/cons before longer discovery content. It does not recreate the fragrance data in a second hero or override the site's palette.

Known ad slots, sponsored shopping offers, affiliate embeds, and sticky ads are removed. Known ad-network requests are blocked only in perfume-page tabs. Original note links, review controls, and voting listeners stay on their source DOM nodes. Empty native wrappers remain displayed so lazy components can load.

Supported URLs: `https://www.fragrantica.com/perfume/<designer>/<fragrance>-<id>.html`. Other page types are untouched. English `.com` only. Chrome 137+ is required for accessibility-aware CSS reading flow.

## Install or update

1. Open `chrome://extensions` and enable Developer mode.
2. For first install: Load unpacked and select this folder (the one with `manifest.json`).
3. For an existing installation from this folder: click Reload on its extension card.
4. Refresh the Fragrantica tab. If you installed an extracted ZIP elsewhere, use the new package there or load this updated folder instead. Keep one copy enabled.

The toolbar popup controls **Organize page** and **Remove ads** independently. The inline **Original spacing** button restores the source spacing. Reload the perfume tab after changing network ad blocking.

## Development

```sh
npm test
npm run validate
npm run preview
```

Open <http://127.0.0.1:8794/tools/preview.html> and choose **Run browser checks**. The synthetic fixture verifies source preservation, native styles, listeners, lazy metadata, layout restoration, duplicate injection, and overflow. It is a test page, not a pixel-faithful Fragrantica replica. Private captured source previews, when present, live only under ignored `artifacts/` and are excluded from the distribution ZIP.

No tests submit live votes/reviews. Fixture checks do not prove signed-in interaction or Chrome's live network rules.

## Privacy and permissions

No telemetry, external AI, keys, account-data access, or external font service. `storage` saves the two preferences locally. `declarativeNetRequest` manages ad rules restricted to perfume-page tab IDs. `https://www.fragrantica.com/*` identifies site tabs and allows narrowly matched content scripts. No other site access is granted.

Network rules are installed asynchronously on navigation; a request may start before registration. Newly introduced providers or markup may need updates. Ordinary main-frame navigation and bottle/note images are not blocked.

Source references: [CSS reading flow](https://developer.chrome.com/blog/reading-flow), [declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest), [Tabs permissions](https://developer.chrome.com/docs/extensions/reference/api/tabs#permissions).

Fragrance Focus is independent of Fragrantica. Site content, imagery, and branding belong to their respective owners.
