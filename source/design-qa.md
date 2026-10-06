# Design QA — revision 2

final result: passed

## Scope and references
The user's ten annotated screenshots from 2026-10-07 are the revision source of truth. Changes are scoped to removal of all outer UI, in-frame sound/navigation, smaller centered arrows, transparent/sharp decoration, seamless scenery, a gender-neutral sharp avatar, high-resolution museum art, and a complete forward journey. An eleventh screenshot was referenced but not supplied; its unknown request remains pending.

## Evidence
- Implementation: http://localhost:4173/ in the Codex in-app browser.
- Full screenshots: qa/v2/page-1.png through page-8.png. Desktop CSS viewport 1127 × 1137; frame 900 × 584.2 CSS pixels, native design coordinates 570 × 370.
- Per-frame crop coordinates: qa/v2/frames.json. Source V1 and final V2 frames normalized to 570 × 370 and viewed together in qa/v2/comparison-1-4.jpg and comparison-5-8.jpg.
- Earlier compact browser check: 476 × 973 viewport. Full screenshots confirmed that the area outside the frame contains only the blank ivory background.
- Focused checks: arrow centering, menu items/focus, new transparent decoration, portrait, landscape edges and floor, modal boundary, and footer next-action visibility.

## Findings and corrections
- Outer brand, sound, navigation and helper text removed from the DOM. Sound now lives in the frame header; logo opens an in-frame sidebar with all eight pages.
- Circular year/era buttons reduced from 39 to 28 design pixels. Centered Lucide chevrons replace font glyphs. The comparison divider handle is also smaller.
- Old scene collages replaced by one continuous generated background per era. Foreground sprite, coins, blocks and floor are independent original-asset layers. Game parallax draws one continuous plate instead of repeating mismatched edges.
- Low-resolution decoration and avatar replaced by high-resolution assets. Decoration has genuine alpha transparency; avatar is a nonhuman handheld-console robot.
- Welcome raster replaced by a sharper 1627 × 967 redraw with a real HTML CTA; original was 540 × 321.
- An initial rapid capture found images still decoding during transitions. Added eager preloading of backgrounds, portrait, decoration, sprites and icons. Re-captured all eight pages only after checking that every displayed image had complete=true and naturalWidth>0.
- Forward journey verified without using sidebar navigation: start → choose/continue → timeline/play → game/compare → comparison/details → detail/continue → observations/continue → review/finish.

## Required fidelity surfaces
- Typography: original Arial/monospace hierarchy retained. Sound label fits header; no long page label overlaps. Forward links slightly emphasized.
- Spacing/layout: existing frame, grids, card geometry and colour accents preserved. New menu and zoom dialog stay within the frame; sidebar focus is contained.
- Colours: ivory, raspberry and warm neutral palette retained; three backgrounds preserve era-specific green/blue treatments.
- Imagery: sharp generated museum/portrait, transparent ornament, seamless backgrounds; original pixel sprites and comparison screenshots retained. Deliberate block pixels are not blurred.
- Content: original interface copy preserved except clearer Continue label and new menu/sound wording. No external navigation/help text remains.

## Interaction and build validation
- Sidebar opens, routes to all eight pages, closes on selection, close button and Escape.
- Opening sidebar while playing pauses simulation and blocks game hotkeys. Closing it leaves the normal Resume action available.
- Header sound toggle updates ON/OFF and aria-pressed.
- Comparison slider, in-frame zoom, Escape close, form/review and completion still work.
- Actual Game-component tests passed for all three eras: keyboard/mouse input, collision/landing, coins, both pits, win, pause/restart/respawn, sidebar suspension/resume.
- Final browser console check: no errors. Production and offline builds passed. ZIP integrity and asset references checked.
- Direct file:// opening remains unavailable in the browser automation tool; offline distribution uses an ordinary non-module IIFE and local resources, as in V1.

## Remaining P3 / limits
- Generated museum artwork contains imperfect tiny wall annotations and a changed small 2004 subtitle. A focused image-service correction was rejected; the successful sharp illustration is retained instead of consuming further generation attempts.
- The original pixel-art references remain deliberately low-resolution in comparison views.
- No known P0/P1/P2 functional or layout issue remains for the supplied revision requirements. Missing screenshot 11 is outside what could be verified.

## Final delivery — 2026-10-07

- Replaced Pixels, Colours, Details and D-pad with 1254 × 1254 transparent PNGs. All four have RGBA alpha extrema 0–255; visually verified on the ivory interface.
- Removed unused outer navigation/help/toast CSS, dead toast state/import, superseded declarations, and 12 obsolete image files. Preserved hosting support files required by project instructions.
- Formatted application sources and added English lifecycle, physics, storage, layout and packaging comments. Added complete README.
- Prevented focus-induced scrolling of the fixed panel; contained page margins. Browser checked all eight pages: every button remains within the panel vertically.
- Browser screenshots: `qa/final/02-year.png`, `qa/final/05-icons.png` in the development workspace. No browser console errors observed.
- `npm run test:game`: all three eras passed movement, jump, collision, three coins, two pits, win, pause, restart, fall respawn, mouse controls and sidebar suspension.
- Production build and four hosting tests passed. Offline output is regenerated from scratch; the ZIP includes runtime, artwork, README and editable source, excluding dependencies/caches/old archives.
- Local file browser execution remains untested because the test browser blocks file://; resource completeness and ZIP integrity are checked separately.
