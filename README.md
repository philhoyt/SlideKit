# SlideKit

[![CI](https://github.com/philhoyt/SlideKit/actions/workflows/ci.yml/badge.svg)](https://github.com/philhoyt/SlideKit/actions/workflows/ci.yml)

Slider and Slide blocks for the WordPress block editor, built on [Embla Carousel](https://www.embla-carousel.com/).

A Slide is a container: put an image, a cover, a group, or a query loop inside it. The Slider block sets slides per view and gap per breakpoint, slide or fade transition, loop, autoplay, arrows, and dots, fraction, or progress-bar pagination.

## Requirements

- WordPress 6.8 or newer
- PHP 7.4 or newer

## Installation

1. Download `slidekit.zip` from the [Releases page](https://github.com/philhoyt/SlideKit/releases).
2. In WordPress, go to Plugins > Add New Plugin > Upload Plugin, choose the zip, install, and activate.

The plugin checks GitHub releases for updates and offers them on the Plugins screen. The check runs in the admin and on cron only, never on front-end requests.

## Usage

Insert a Slider block and add a Slide for each panel. The Slider's inspector has three panels:

| Panel | Settings |
|---|---|
| Layout | Slides per view (1 to 5 or Auto) and Gap (a theme spacing preset or None) for Mobile, Tablet, and Desktop; Center the active slide. |
| Behavior | Transition (Slide or Fade), Loop, Autoplay, Autoplay delay (ms). |
| Controls | Previous / next arrows, Pagination, Pagination style (Dots, Fraction, Progress bar), Accessible label. |

While the Slider is selected the editor shows one slide at a time with Previous, Next, a "2 / 5" count, and an Add slide button underneath. Each Slide also has its own Accessible label field.

### Blocks

| Block | Description |
|---|---|
| `slidekit/slider` | The slider. Holds Slide blocks and all the controls. |
| `slidekit/slide` | One panel. Any inner blocks. Supports layout, colour, padding, and border. |

## Front end

- `build/slider/view.js` is about 10 KB gzipped and is registered as the Slider's `viewScript`, so it loads only on pages with a slider. On block themes the stylesheet is page-scoped too; classic themes load every registered block's styles on every page.
- No library class names in saved markup. Arrows, dots, fraction, and progress bar are plain HTML rendered by `save.js`.
- Layout is CSS. `save.js` writes `--slidekit-basis-{mobile,tablet,desktop}` and `--slidekit-gap-{mobile,tablet,desktop}` inline, and `slidekit_breakpoint_css()` in `slidekit.php` adds the media queries that switch between them. The breakpoints come from the theme's `settings.viewport` through `WP_Theme_JSON::get_viewport_media_queries()` on WordPress 7.1 and later, and fall back to 480px and 782px before that.
- Themes restyle the controls through custom properties on `.wp-block-slidekit-slider`: `--slidekit-arrow-size`, `--slidekit-arrow-color`, `--slidekit-arrow-background`, `--slidekit-dot-size`, `--slidekit-dot-color`, `--slidekit-progress-height`, `--slidekit-progress-color`, `--slidekit-progress-track`, `--slidekit-autoplay-size`.
- Autoplay renders a stop / start button, pauses on hover, focus, and off-screen (an `IntersectionObserver`), and is skipped under `prefers-reduced-motion: reduce`.

### Accessibility

The viewport is `role="region"` with `aria-roledescription="carousel"` and the optional label from the block sidebar. It is focusable and responds to the left and right arrow keys. Slides are `role="group"` with a "3 / 5" label or a custom one. A polite live region announces the current position after each change. Arrow, dot, and autoplay labels are translated through `wp.i18n`.

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

## Development

```bash
npm install
composer install

npm start              # wp-scripts watch, with the blocks manifest
npm run build          # production build to build/
npm run lint:js
npm run lint:css
npm run lint:php       # vendor/bin/phpcs
npm run lint:php:fix   # vendor/bin/phpcbf
npm run format
npm run test:unit      # Jest, src/**/*.test.js
npm run env:start      # local WordPress via wp-env with the plugin installed
npm run env:stop
npm run env:cli -- <wp command>
npm run test:e2e       # Playwright against the wp-env tests site
npm run test:php       # PHPUnit inside the wp-env tests container
npm run plugin-zip
```

`test:php` reinstalls WordPress in the tests site, which leaves it with no active theme or plugin. Run `npx wp-env reset tests` afterwards before `test:e2e`, or run the end-to-end suite first as CI does.

CI (`.github/workflows/ci.yml`) runs `composer audit` and phpcs on PHP 7.4 through 8.4; lint, build, and Jest on Node 22; and Playwright then PHPUnit against wp-env. Playwright artifacts are uploaded on failure.

Block sources live in `src/slider` and `src/slide`. The front-end behaviour is `src/slider/view.js`. Values shared by the editor and the saved markup are in `src/slider/shared.js`. Any change to `save.js` output needs a `deprecated` entry.

## Releases

Bump the version in `slidekit.php` (header and `SLIDEKIT_VERSION`), `package.json`, both `block.json` files, and the `Stable tag` in `readme.txt`, add a changelog entry, then push a `v`-prefixed tag:

```bash
git tag v0.1.1 && git push origin v0.1.1
```

The release workflow (`.github/workflows/release.yml`) installs dependencies, runs the three linters, builds the assets, runs `npm run plugin-zip`, pulls the matching `= X.Y.Z =` block out of `readme.txt` for the release notes, and attaches `slidekit.zip` and `readme.txt` to the GitHub release. The zip contains the paths listed under `files` in `package.json`: `slidekit.php`, `readme.txt`, `build/`, and `lib/`.

## Limitations

- No vertical sliders.
- Fade always shows one slide per view.
- Loop needs enough slides to fill the viewport. With too few, Embla falls back to a non-looping slider.
- Theme breakpoints are only read on WordPress 7.1 or later; earlier versions use 480px and 782px.

## License

GPL-2.0-or-later
