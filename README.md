# SlideKit

[![CI](https://github.com/philhoyt/SlideKit/actions/workflows/ci.yml/badge.svg)](https://github.com/philhoyt/SlideKit/actions/workflows/ci.yml)

Slider and Slide blocks for the WordPress block editor, built on [Embla Carousel](https://www.embla-carousel.com/).

A Slide is a container: put an image, a cover, a group, or a query loop inside it. The Slider block sets slides per view and gap per breakpoint, slide or fade transition, loop, autoplay, arrows, and dots, fraction or progress-bar pagination.

## Blocks

| Block | Description |
|---|---|
| `slidekit/slider` | The slider. Holds Slide blocks and all the controls. In the editor it shows one slide at a time with Previous, Next, a count and Add slide underneath. |
| `slidekit/slide` | One panel. Any inner blocks. Supports layout, colour, padding and border. |

## Front end

- About 10 KB of JavaScript gzipped, loaded only on pages with a slider. Stylesheets are page-scoped on block themes; classic themes load every registered block's styles on every page.
- No library class names in saved markup. Arrows, dots, fraction and progress bar are plain HTML rendered by the plugin.
- Themes restyle controls through custom properties on `.wp-block-slidekit-slider`: `--slidekit-arrow-size`, `--slidekit-arrow-color`, `--slidekit-arrow-background`, `--slidekit-dot-size`, `--slidekit-dot-color`, `--slidekit-progress-height`, `--slidekit-progress-color`, `--slidekit-progress-track`, `--slidekit-autoplay-size`.
- Autoplay renders a stop / start button, pauses on hover, focus and off-screen, and is disabled under `prefers-reduced-motion`.

### Accessibility

The viewport is `role="region"` with `aria-roledescription="carousel"` and an optional label from the block sidebar. It is focusable and responds to the left and right arrow keys. Slides are `role="group"` with a "3 / 5" label or a custom one. A polite live region announces the current position after each change. Arrow, dot and autoplay labels are translated through `wp.i18n`.

### Events

Every event bubbles and carries the Embla instance in `event.detail.embla`.

| Event | Fired on | When |
|---|---|---|
| `slidekit:init` | the slider element | after Embla boots |
| `slidekit:slide:active` | a slide element | it becomes the selected slide |
| `slidekit:slide:leaving` | a slide element | it stops being the selected slide |

```js
document.addEventListener( 'slidekit:init', ( event ) => {
	const embla = event.detail.embla;
	embla.on( 'select', () => console.log( embla.selectedScrollSnap() ) );
} );
```

## Requirements

- WordPress 6.8+
- PHP 7.4+

## Installation

1. Download `slidekit.zip` from the [Releases page](https://github.com/philhoyt/SlideKit/releases).
2. In WordPress, go to **Plugins → Add New Plugin → Upload Plugin**, choose the zip, install and activate.

The plugin checks GitHub releases for updates.

## Development

```bash
npm install
composer install
npm start          # watch build
npm run build      # production build
npm run lint:js
npm run lint:css
npm run lint:php
npm run test:unit  # Jest, src/**/*.test.js
npm run env:start  # local WordPress via wp-env, plugin pre-installed
npm run test:e2e   # Playwright against the wp-env tests site
npm run test:php   # PHPUnit inside the wp-env tests container
npm run plugin-zip
```

`test:php` reinstalls WordPress in the tests site, which leaves it with no active theme or plugin. Run `npx wp-env reset tests` afterwards before `test:e2e`, or run the end-to-end suite first as CI does.

Block sources live in `src/slider` and `src/slide`. The front-end behaviour is `src/slider/view.js`. Values shared by the editor and the saved markup are in `src/slider/shared.js`.

## Releases

Bump the version in `slidekit.php` (header and constant), `package.json`, both `block.json` files and the `Stable tag` in `readme.txt`, add a changelog entry, then push a tag:

```bash
git tag v0.1.0 && git push origin v0.1.0
```

The release workflow builds the assets, zips the plugin and attaches it to a GitHub release.

## Limitations

- Vertical sliders are not offered yet.
- Fade always shows one slide per view.
- Loop needs enough slides to fill the viewport; with too few, Embla falls back to a non-looping slider.

## License

GPL-2.0-or-later
