# SlideKit

Slider and Slide blocks for WordPress, built on Embla Carousel 8. Extracted from the House Studio client plugin on 2026-09-21 and rewritten from Swiper to Embla.

## Layout

- `slidekit.php` registers both blocks from `build/blocks-manifest.php`.
- `src/slider/` the Slider block. `edit.js` is the editor UI, `save.js` the static markup, `view.js` the front-end behaviour, `shared.js` the values both sides need.
- `src/slide/` the Slide block. A plain inner-blocks container with layout, colour, spacing and border supports.
- `lib/plugin-update-checker/` shipped; `vendor/` and `node_modules/` are not.

## Rules

- The saved markup must never contain Embla class names. SlideKit owns its controls so the library can change without breaking existing posts.
- Layout (slides per view, gap) is CSS, driven by `--slidekit-basis-*` and `--slidekit-gap-*` custom properties written inline by `save.js`. Do not move it into JavaScript.
- The tablet/desktop media queries come from `slidekit_breakpoint_css()` in `slidekit.php`, which reads the theme's `settings.viewport` (core default 480px / 782px) so the slider agrees with the editor's Mobile / Tablet / Desktop states. Do not hardcode breakpoints in `style.scss`.
- Any change to `save.js` output needs a `deprecated` entry.
- Keep `view.js` free of editor code and `edit.js` free of Embla.
- Versions to bump together: plugin header, `SLIDEKIT_VERSION`, `package.json`, `src/slider/block.json`, `src/slide/block.json`, `readme.txt` Stable tag.
- No `Co-Authored-By` trailers on commits.

## Verify

`npm run build && npm run lint:js && npm run lint:css && npm run lint:php`, then `npm run env:start`, insert a Slider, reload, confirm attributes round-trip and the front end has no console errors.
