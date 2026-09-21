---
paths:
  - "**/*.php"
  - "**/*.js"
  - "**/*.scss"
  - "**/block.json"
  - "**/composer.json"
  - "**/package.json"
---
# Project: SlideKit

- Slug: `slidekit`
- Text domain: `slidekit`
- Block namespace: `slidekit/` (`slidekit/slider`, `slidekit/slide`)
- PHP minimum: 7.4
- WP minimum: 6.8 (uses `wp_register_block_types_from_metadata_collection`)
- Distribution: GitHub (Plugin Update Checker, release assets)
- Main file: `slidekit.php`
- Version locations: plugin header, `SLIDEKIT_VERSION`, `package.json`, both `block.json` files, `readme.txt` Stable tag
- Slider engine: Embla Carousel 8 + autoplay and fade plugins. SlideKit renders its own arrows, dots, fraction and progress bar, and its own ARIA layer. No Embla class names in saved markup.
