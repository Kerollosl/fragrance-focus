# Chrome Web Store listing: Fragrance Focus

Placeholders to resolve before submitting: `TODO_PRIVACY_URL`, `TODO_SUPPORT_URL`. The manifest has no `homepage_url` or `author` because Chrome rejects non-URL placeholders; add the real support URL as `homepage_url` once it exists.

## Short description (132 characters or fewer)
Calmer perfume pages on Fragrantica: clearer takeaways and fewer ads. Unofficial; not affiliated with Fragrantica.

## Long description
Fragrance Focus tidies Fragrantica perfume pages so the useful parts are easy to read.

- A one-sentence takeaway and the community rating sit near the title, built only from the accords and votes already on the page.
- Quick links jump to Performance, Notes, Reviews and Similar scents.
- Long descriptions and secondary discovery sections fold away until you open them. An "Original page" button restores the full page at any time.
- Remove ads: hides sponsored offers and blocks known ad-network requests, on Fragrantica perfume pages only.

It works only on https://www.fragrantica.com/perfume/... pages. Every other page, and every other site, is untouched.

Fragrance Focus is an independent, unofficial extension. It is not affiliated with, endorsed by, or sponsored by Fragrantica. Fragrantica is a trademark of its owner. The extension blocks ads on Fragrantica; if you want to support the site, you can turn "Remove ads" off in the popup.

## Single purpose
Make Fragrantica perfume pages easier to read by reorganising the page layout and removing ads on those pages.

## Permission justifications
- `storage`: remembers the two toggles ("Organize page", "Remove ads") on this device.
- `declarativeNetRequest`: blocks requests to a fixed list of advertising domains, only in tabs showing a Fragrantica perfume page. The rule list is bundled with the extension and never fetched remotely.
- Host permission `https://www.fragrantica.com/*`: lets the extension see the address of Fragrantica tabs so ad-blocking rules are attached only to perfume-page tabs (Chrome hides tab addresses from extensions without it). It also lets the popup reload the active perfume tab after the ad toggle changes. The extension does not read page content outside the content script described below.
- Content script on `https://www.fragrantica.com/perfume/*/*.html`: reads the visible accords, notes and vote counts to build the takeaway and re-style the page.
- No remote code. No analytics. No cookies or account data are read.

## Privacy answers
- Data collected: none. Settings (two true/false values) are stored locally via `chrome.storage.local`.
- Data sold or transferred: none. No network requests are made by the extension itself.
- Remote code: no.
- Certify: not used or transferred for purposes unrelated to the single purpose; not used for creditworthiness or lending.

## Privacy policy text (host at TODO_PRIVACY_URL)
Fragrance Focus does not collect, store off-device, transmit, or sell any personal data. It reads the content of Fragrantica perfume pages in your browser only to rearrange how they are displayed. Your two preferences are saved in your browser's local extension storage and never leave your device. The extension does not use analytics, cookies, or remote code. Contact: TODO_SUPPORT_URL.

## Store assets (owner follow-up)
- Screenshots 1280x800 (at least 1): a perfume page with and without Fragrance Focus; the popup.
- Promo tile 440x280.
- Icons present at 16/32/48/128 (rounded-corner transparent edges, opaque centre).
