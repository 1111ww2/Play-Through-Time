# V2 image assets

Mode: built-in image_gen. No API-key/CLI fallback used. Assets are copied into public/assets and included in the offline package's assets directory.

| File | Resolution | Purpose |
|---|---|---|
| museum-hd.png | 1627 × 967 | High-resolution museum welcome image |
| decoration-hd.png | 1938 × 811, RGBA | Transparent retro decorative vignette; alpha range 0–255 verified |
| avatar-hd.png | 1254 × 1254 | Gender-neutral handheld-console robot portrait |
| 1989-landscape.png | 2172 × 724 | Continuous olive monochrome landscape |
| 1998-landscape.png | 2172 × 724 | Continuous blue-sky/green-hill landscape |
| 2004-landscape.png | 2172 × 724 | Continuous detailed mountain landscape |

## Prompts used

### museum-hd.png
Edit the reference image into a crisp high-resolution landscape museum illustration, same 540:321 composition, target at least 2160px wide. Faithfully preserve the giant ivory retro handheld console in the center, warm cream museum walls, visitor with backpack lower left and visitor lower right, ceiling spotlights, and displays. Clean sharp architectural and illustrated linework, sophisticated warm neutral palette, no blurriness. Keep readable typography: left wall "PLAY THROUGH TIME" and "SAME GAME. THREE GENERATIONS.", right wall "1989", "1998", "2004"; console label "PLAY THROUGH TIME". Remove the pink Start Experience button and its surrounding capsule completely, replacing it with continuous console/museum artwork: this will be a real HTML button overlaid later. No UI frame, no navigation, no watermark. Retain perspective, subject placement, and original art direction.

The successful output is 1627 × 967. A follow-up request to fix the small 2004 subtitle and remove tiny illegible left-wall annotations was rejected by the image service's output moderation. It was not retried. The successful high-resolution version is retained; these minor embedded text differences remain.

### decoration-hd.png
Edit target reference. Recreate this small retro game decorative vignette as a crisp high-resolution transparent PNG, landscape about 2.4:1. Same composition: small classic pixel plumber character centered near baseline, muted pale warm-gray pixel clouds and low hills around it, sparse dashed ground baseline. Preserve 8-bit pixel art with sharp discrete square edges, dark olive-black character, subtle beige clouds. Make all otherwise empty background genuinely transparent, no beige rectangular plate, no checkerboard pattern, no drop shadow, no text. Clean cutout edges, suitable for a cream museum UI.

### avatar-hd.png
Replace the reference human player portrait with a high-resolution gender-neutral nonhuman player mascot portrait. A friendly little retro handheld-game-console robot, head is warm ivory rounded console with dark olive LCD screen face and two simple dot eyes, small understated smile, small raspberry button details, shoulders/bust in neutral taupe. No human hairstyle, no facial hair, no gender cues, no clothing associated with a gender. Same soft hand-illustrated museum style, warm sand backdrop, portrait crop, clean sharp outline and shading. Square 1024px illustration, no text, no badge, no UI frame.

### Landscape prompt template
Create one continuous, clean wide horizontal 3:1 side-scrolling platform game BACKGROUND plate in the style of the reference image, [ERA STYLE]. The reference is only a style reference; eliminate ALL visible rectangular collage seams and pasted patches. A single coherent landscape with continuous colour and pixel scale from left edge to right edge. Composition: sky upper 60%, distant hills/mountains lower 40%, landscape reaches exactly the bottom edge, no ground strip. Empty foreground for interactive sprite overlay. Do NOT draw any character, avatar, coin, question block, pipe, platforms, brick ground, text, labels, buttons, borders or user interface. Keep the scenery low and unobtrusive. Sharp deliberately pixelated edges, no smoothing, no pixel-grid overlay, no photo-realism. Landscape 1536x512 or larger.

ERA STYLE values:
- 1989: four-tone olive LCD monochrome: pale olive sky, medium olive rounded pixel hills, dark olive accents and simple outlined pixel clouds, authentic coarse 8-bit pixel shapes.
- 1998: bright 16-bit pixel art: consistent flat light blue sky, a few white black-outlined pixel clouds, rounded green hills with tiny darker pixel accents; crisp restrained retro game palette.
- 2004: rich polished early-2000s handheld pixel art: consistent azure blue sky, beautifully shaded fluffy pixel clouds, distant blue mountains and green rolling hills, leafy landscape near lower side edges; layered depth without blur.


## Final transparent icons — built-in image_gen, 2026-10-07

All four outputs are 1254 × 1254 RGBA PNGs, with alpha ranging from 0 to 255. Their active paths are `public/assets/<name>.png`. No raster postprocessing was used.

### icon-pixels.png

Use case: background-extraction. Edit target: the supplied icon-pixels image. Remake precisely the same single icon at high resolution with crisp clean edges. Preserve silhouette, arrangement, colors and style. Remove the beige rectangular backdrop completely. Output a centered isolated icon filling 85% of a square canvas on genuinely transparent alpha background, no plate, no text, no added objects, no outer shadow. Keep simple original graphic shapes.

Generation output: `/Users/d/.codex/generated_images/01a1119a-f648-71a2-92ee-0aa0a471fc8e/exec-a27288bc-9c7d-4954-b24e-2f492ffa34f3.png`

### icon-colours.png

Use case: background-extraction. Edit target: the supplied icon-colours image. Remake precisely the same single icon at high resolution with crisp clean edges. Preserve silhouette, arrangement, colors and style. Remove the beige rectangular backdrop completely. Output a centered isolated icon filling 85% of a square canvas on genuinely transparent alpha background, no plate, no text, no added objects, no outer shadow. Keep simple original graphic shapes.

Generation output: `/Users/d/.codex/generated_images/01a1119a-f648-71a2-92ee-0aa0a471fc8e/exec-85454e3b-85a0-4863-949f-b400b3428d31.png`

### icon-details.png

Use case: background-extraction. Edit target: the supplied icon-details image. Remake precisely the same single icon at high resolution with crisp clean edges. Preserve silhouette, arrangement, colors and style. Remove the beige rectangular backdrop completely. Output a centered isolated icon filling 85% of a square canvas on genuinely transparent alpha background, no plate, no text, no added objects, no outer shadow. Keep simple original graphic shapes.

Generation output: `/Users/d/.codex/generated_images/01a1119a-f648-71a2-92ee-0aa0a471fc8e/exec-82d4e928-5f69-4dcf-9550-b32f3b37f622.png`

### dpad.png

Use case: background-extraction. Edit target: the supplied dpad image. Remake precisely the same single icon at high resolution with crisp clean edges. Preserve silhouette, arrangement, colors and style. Remove the beige rectangular backdrop completely. Output a centered isolated icon filling 85% of a square canvas on genuinely transparent alpha background, no plate, no text, no added objects, no outer shadow. Preserve the charcoal physical game controller cross with subtle circular center and direction marks.

Generation output: `/Users/d/.codex/generated_images/01a1119a-f648-71a2-92ee-0aa0a471fc8e/exec-9c5a9669-7f2d-47de-a27a-8338b1f3ea4c.png`

