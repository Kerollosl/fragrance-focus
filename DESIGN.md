# Fragrance Focus design

Purpose: help a fragrance reader understand the scent, its community reception, and its likely wearing context quickly.

Fragrantica is the visual authority. Retain its native type, logo/header, search, light/dark theme, teal accents, colorful accord bars, designer logos, emoji voting, photographic notes, gradients, and component shapes. Do not replace them with an extension-branded visual world.

The original header/search and native fragrance title lead. Add only a compact section navigator. Keep the native bottle/accord arrangement, reduce the bottle and oversized designer logo, and bring ratings, notes, performance/value, and pros/cons together before the longer description and discovery content. Source components stay in place in the DOM. CSS reading-flow follows their visual ordering for keyboard and assistive navigation (Chrome 137+).

Remove ads and affiliate offers. Scope all other changes to width, spacing, section order, and image dimensions. Do not override site-wide backgrounds, fonts, colors, gradients, or title styles. Do not generate duplicate fragrance summaries or missing-data cards. Native metadata and disclosures remain authoritative.

On narrow screens, preserve the two-column bottle/accord arrangement, allow title wrapping, and make the jump links scroll within their own row. The note pyramid retains centered stage headings, image-above-label links, and relative note emphasis. Section jumps account for the native sticky header. Restore original spacing independently of ad removal. Never hide empty reactive source wrappers: they may be lazy-loading anchors.
