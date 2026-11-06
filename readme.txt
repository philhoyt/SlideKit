=== SlideKit ===
Contributors:      philhoyt
Tags:              slider, carousel, slideshow, block, embla
Requires at least: 6.8
Tested up to:      7.1
Stable tag:        0.1.2
Requires PHP:      7.4
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Slider and Slide blocks for the block editor, with slides per view and gap per breakpoint, autoplay, arrows, and pagination

== Description ==

SlideKit adds two blocks: a Slider and the Slide panels that go inside it. A slide is a container, so it holds whatever the editor can insert: an image, a cover, a group of text and buttons, a query loop.

The Slider block's settings:

* Slides per view (1 to 5, or auto for the slide's own width) and gap at mobile, tablet, and desktop widths. Gaps use the theme's spacing presets.
* Slide or fade transition.
* Loop, autoplay with a delay in milliseconds, and centering the active slide.
* Previous and next arrows.
* Pagination as dots, a fraction such as 2 / 5, or a progress bar.
* An accessible label for the slider.

In the editor the Slider shows one slide at a time, with Previous, Next, a slide count, and an Add slide button underneath.

Autoplay adds a pause button. It pauses on hover, on focus, and while the slider is scrolled out of view, and it does not start for visitors who have asked their system for reduced motion.

The mobile and tablet breakpoints come from `settings.viewport` in the theme's theme.json when WordPress exposes them (7.1 and later). Otherwise the plugin uses 480px and 782px, which are the editor's own Mobile, Tablet, and Desktop widths.

The front end is built on Embla Carousel. The script is about 10 KB gzipped and loads only on pages that contain a Slider. The saved markup carries no library class names; arrows, dots, the fraction, and the progress bar are plain HTML that a theme can restyle through `--slidekit-*` custom properties.

Accessibility: the slider viewport is a labelled region that responds to the left and right arrow keys. Each slide is announced as "3 / 5" or with the label you give it. Slide changes are read out through a polite live region. All labels follow the site language.

For developers: each slider dispatches `slidekit:init` with the Embla instance in `event.detail.embla`. Slides dispatch `slidekit:slide:active` and `slidekit:slide:leaving` as the selection changes. All events bubble.

== Installation ==

1. Download `slidekit.zip` from the latest release on the [GitHub Releases page](https://github.com/philhoyt/SlideKit/releases).
2. Go to Plugins > Add New Plugin > Upload Plugin.
3. Choose the zip, click Install Now, then Activate Plugin.
4. In any post or page, insert a Slider block and add Slides.

Updates come from GitHub releases and show up on the Plugins screen like any other update.

== Frequently Asked Questions ==

= Can I put anything in a slide? =

Yes. A slide is an ordinary container block with layout, colour, padding, and border controls.

= Why does fade force one slide per view? =

A cross-fade stacks slides on top of each other, so only one is visible at a time. Switch the transition back to Slide to show several at once.

= Does it load on every page? =

The script loads only where a Slider block is present. On block themes the stylesheet does too. Classic themes load the stylesheets of every registered block on every page, which is how WordPress handles block styles there.

= Can I change the breakpoints? =

Set `settings.viewport` in theme.json on WordPress 7.1 or later and the slider uses the same mobile and tablet widths as the editor. On older versions the breakpoints are fixed at 480px and 782px.

== Changelog ==

= 0.1.2 =
* Fixed dashboard updates installing the release's readme.txt instead of the plugin zip (PCLZIP_ERR_BAD_FORMAT). Sites on 0.1.1 or earlier: upload this release's zip once; later updates arrive normally.
* Rewrote the readme files in plain English.

= 0.1.1 =
* Fixed update checks failing with a missing class: the update checker's bundled Markdown and readme parsers now ship with the plugin.

= 0.1.0 =
* Added the Slider and Slide blocks. A slide holds any blocks.
* Added slides per view and gap per breakpoint, slide or fade transition, loop, centered slides, arrows, and dot, fraction, or progress bar pagination.
* Added autoplay with a delay and a pause button. It pauses on hover, on focus, and off screen, and is skipped for visitors who prefer reduced motion.
* Added Previous, Next, a slide count, and an Add slide button under the active slide in the editor.
* Added keyboard arrow navigation, labelled slides, and live region announcements on the front end.
* Added updates from GitHub releases through the Plugins screen.
