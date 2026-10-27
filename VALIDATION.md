# Validation — 0.2.0

Validated 2026-10-27 after the user requested preservation of Fragrantica's original visual identity.

- Six Node tests pass: URL scope, count parsing, safe URLs, ranking, tab-scoped rules, and service-worker lifecycle.
- Manifest, permission allowlist, icons/source files, and JavaScript syntax validated.
- Twenty-three browser checks pass on the synthetic fixture: source metadata, all thirteen notes, native title/header/font/accord color/note orientation, absence of a replacement hero, duplicate-injection guard, accessible reading flow, visible reactive placeholders, cosmetic ad collapse, retained note/vote listeners, section focus, native node identity across updates, late performance navigation, empty-state navigation, reversible spacing, independent ad removal, and page overflow.
- Actual captured Khamrah markup was verified with the native site stylesheet/header/logo, dark/light themes, native performance/value cards, and photographic pyramid. Captured native layout has no horizontal page overflow at 390 and 960 CSS pixels.
- Two independent layout assessments completed; the mechanical design detector returned no findings.

Version 0.1 is installed in the live browser. Version 0.2 files and ZIP are ready, but the user must reload the unpacked extension and refresh the site before the revised live content script can be verified. The browser tool's URL policy blocks chrome://extensions; no further attempt was made to automate that page.

Private captured previews are excluded from the ZIP. Captured native widgets are serialized DOM, so their backend interactions are not exercised. The synthetic fixture separately verifies retained event listeners. Tests submit no live reviews or votes. Chrome's current network-rule registration has not been independently inspected.
