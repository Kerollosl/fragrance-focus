# Fragrance Focus

A no-build Chrome extension that organizes Fragrantica perfume pages while preserving their original look.

## Version 0.3

The site stays recognizably Fragrantica: native fonts, light/dark themes, colorful accord bars, emoji voting, photographic notes, designer logos, and colored performance cards are preserved. The bottle is larger and centered beside the accords. A short plain-language takeaway and the community rating sit near the title. Source charts retain every label and count, with a small “Most votes” readout to make the result obvious. Pros/cons and their original AI disclosure remain visible.

Takeaways use only page accords and visible community votes. Close, tied, and sparse votes do not produce confident wearing recommendations. Percentages are approximate because source counts can be abbreviated. Reaction percentages describe love/like votes rather than the star rating. Season and day/night votes are separate. Performance extraction supports Fragrantica's actual `.tw-perf-card` markup and sibling labels/counts.

**Show personal voting sliders** reveals the visitor's own performance voting inputs; these are separate from community results. Native voting listeners, note links, review controls, and empty lazy-loading wrappers stay intact. Long descriptions and secondary discovery sections are folded until requested. Loading/hydration must not duplicate the navigator or takeaway.

Known ad slots, sponsored shopping offers, affiliate embeds, and sticky ads are removed. Known ad-network requests are blocked only in perfume-page tabs.

Supported URLs: `https://www.fragrantica.com/perfume/<designer>/<fragrance>-<id>.html`. Other page types are untouched. English `.com` only. Chrome 111+ is required (newer Chrome adds an accessibility-aware reading flow).

## Install or update

1. Open `chrome://extensions` and enable Developer mode.
2. For first install: Load unpacked and select this folder (the one with `manifest.json`).
3. For an existing installation from this folder: click Reload on its extension card.
4. Refresh the Fragrantica tab. If you installed an extracted ZIP elsewhere, use the new package there or load this updated folder instead. Keep one copy enabled.

The toolbar popup controls **Organize page** and **Remove ads** independently. The inline **Original page** button restores the source layout and content visibility. Changing ad blocking reloads the active perfume tab automatically.

## Development

```sh
npm test
npm run validate
npm run preview
```

Open <http://127.0.0.1:8794/tools/preview.html> and choose **Run browser checks**. The fixture verifies native performance parsing, visible chart labels, source styles, native listeners, lazy updates, live reaction summaries, hydration clone recovery, disclosure rebinding, source escaping, original-layout restoration, centered bottle geometry, and overflow. It is a test page, not a pixel-faithful Fragrantica replica. Private captured source previews, when present, live only under ignored `artifacts/` and are excluded from the distribution ZIP.

No tests submit live votes/reviews. Fixture checks do not prove signed-in interaction or Chrome's live network rules.

## Privacy and permissions

No telemetry, external AI, keys, account-data access, or external font service. `storage` saves the two preferences locally. `declarativeNetRequest` manages ad rules restricted to perfume-page tab IDs. `https://www.fragrantica.com/*` identifies site tabs and allows narrowly matched content scripts. No other site access is granted.

Network rules are installed asynchronously on navigation; a request may start before registration. Newly introduced providers or markup may need updates. Ordinary main-frame navigation and bottle/note images are not blocked.

Source references: [CSS reading flow](https://developer.chrome.com/blog/reading-flow), [declarativeNetRequest](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest), [Tabs permissions](https://developer.chrome.com/docs/extensions/reference/api/tabs#permissions).

Fragrance Focus is independent of Fragrantica. Site content, imagery, and branding belong to their respective owners.
