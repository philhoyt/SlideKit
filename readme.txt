=== SlideKit ===
Contributors:      philhoyt
Tags:              slider, carousel, slideshow, block, embla
Requires at least: 6.8
Tested up to:      7.1
Stable tag:        0.1.1
Requires PHP:      7.4
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Slider and Slide blocks for the block editor. Put any blocks in a slide; SlideKit handles the sliding.

== Description ==

SlideKit adds two blocks: a **Slider** and the **Slide** panels that go inside it. A slide is a container, so it holds whatever the editor can insert: an image, a cover, a group of text and buttons, a query loop.

The Slider block controls:

* Slides per view and gap at mobile, tablet and desktop widths. Gaps use the theme's spacing presets.
* Slide or fade transition.
* Loop, autoplay with a delay, and centered slides.
* Previous and next arrows.
* Pagination as dots, a fraction such as 2 / 5, or a progress bar.

In the editor the Slider shows one slide at a time, with Previous, Next, a slide count and an Add slide button underneath.

Autoplay shows a pause button, pauses on hover, on focus and when the slider scrolls out of view, and is skipped for visitors who prefer reduced motion.

The front end is built on Embla Carousel and loads about 10 KB of JavaScript, gzipped, only on pages that contain a slider. The saved markup contains no library class names, and arrows, dots and the progress bar are plain HTML that theme CSS can restyle through `--slidekit-*` custom properties.

**Accessibility.** The slider viewport is a labelled region with keyboard arrow navigation. Each slide is announced as "3 / 5" or with the label you give it. Slide changes are announced through a polite live region. Autoplay has a stop and start button. All labels follow the site language.

**For developers.** Each slider dispatches `slidekit:init` with the Embla instance in `event.detail.embla`. Slides dispatch `slidekit:slide:active` and `slidekit:slide:leaving` as the selection changes. All events bubble.

== Installation ==

1. Download `slidekit.zip` from the latest release on the [GitHub Releases page](https://github.com/philhoyt/SlideKit/releases).
2. In your WordPress admin, go to **Plugins → Add New Plugin → Upload Plugin**.
3. Choose the downloaded zip and click **Install Now**, then **Activate Plugin**.
4. In any post or page, insert a **Slider** block and add Slides.

Updates arrive through the normal Plugins screen.

== Frequently Asked Questions ==

= Can I put anything in a slide? =

Yes. A slide is an ordinary container block with layout, colour, padding and border controls.

= Why does fade force one slide per view? =

A cross-fade stacks slides on top of each other, so there is only ever one visible. Switch the transition back to Slide to show several at once.

= Does it load on every page? =

The script loads only where a Slider block is present. On block themes the stylesheet does too; classic themes load the stylesheets of every registered block on every page, which is how WordPress handles block styles there.

== Changelog ==

= 0.1.1 =
* Fix: The update checker's bundled Markdown and readme parsers now ship with the plugin, so update checks no longer fail with a missing class.

= 0.1.0 =
* Add: Slider and Slide blocks. A slide holds any blocks; the slider sets slides per view and gap per breakpoint, slide or fade transition, loop, centered slides, arrows, and dot, fraction or progress bar pagination.
* Add: autoplay with a delay and a pause button. It pauses on hover, on focus and off screen, and is skipped for visitors who prefer reduced motion.
* Add: Previous, Next, a slide count and an Add slide button under the active slide in the editor, shown while the slider is selected.
* Add: keyboard arrow navigation, labelled slides and live region announcements on the front end.
* Add: updates from GitHub releases through the Plugins screen.
