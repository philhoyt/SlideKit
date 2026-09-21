<?php
/**
 * Plugin Name:       SlideKit
 * Plugin URI:        https://github.com/philhoyt/SlideKit
 * Description:       Slider and Slide blocks for the block editor. Put any blocks in a slide; SlideKit handles the sliding.
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Version:           0.1.0
 * Author:            Phil Hoyt
 * Author URI:        https://philhoyt.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       slidekit
 * GitHub Plugin URI: https://github.com/philhoyt/SlideKit
 * Primary Branch:    main
 * Release Asset:     true
 *
 * @package slidekit
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SLIDEKIT_VERSION', '0.1.0' );
define( 'SLIDEKIT_DIR', plugin_dir_path( __FILE__ ) );

require_once SLIDEKIT_DIR . 'lib/plugin-update-checker/plugin-update-checker.php';

use YahnisElsts\PluginUpdateChecker\v5\PucFactory;

$slidekit_update_checker = PucFactory::buildUpdateChecker(
	'https://github.com/philhoyt/SlideKit/',
	__FILE__,
	'slidekit'
);
$slidekit_update_checker->getVcsApi()->enableReleaseAssets();

/**
 * Registers the Slider and Slide blocks from the build manifest.
 *
 * @return void
 */
function slidekit_register_blocks() {
	$manifest = SLIDEKIT_DIR . 'build/blocks-manifest.php';

	if ( file_exists( $manifest ) && function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection( SLIDEKIT_DIR . 'build', $manifest );
		return;
	}

	foreach ( array( 'slider', 'slide' ) as $block ) {
		register_block_type( SLIDEKIT_DIR . 'build/' . $block );
	}
}
add_action( 'init', 'slidekit_register_blocks' );

/**
 * Viewport breakpoints used when the theme and WordPress provide none.
 *
 * Mirrors WP_Theme_JSON::DEFAULT_VIEWPORT_BREAKPOINTS (WordPress 7.1) so the
 * slider agrees with the editor's Mobile / Tablet / Desktop states on older
 * versions too.
 *
 * @var array<string, string>
 */
const SLIDEKIT_DEFAULT_BREAKPOINTS = array(
	'mobile' => '480px',
	'tablet' => '782px',
);

/**
 * Returns the tablet and desktop media queries the slider layout uses.
 *
 * Reads `settings.viewport` from theme.json through core when available so a
 * theme's custom breakpoints apply to the slider as well as to core's
 * responsive block styles.
 *
 * @return array{tablet?: string, desktop: string} Media query strings keyed by breakpoint.
 */
function slidekit_get_media_queries() {
	if ( method_exists( 'WP_Theme_JSON', 'get_viewport_media_queries' ) ) {
		$queries = WP_Theme_JSON::get_viewport_media_queries(
			wp_get_global_settings( array( 'viewport' ) ),
			array( 'include_desktop' => true )
		);
		$result  = array();
		if ( isset( $queries['@tablet'] ) ) {
			$result['tablet'] = $queries['@tablet'];
		}
		if ( isset( $queries['@desktop'] ) ) {
			$result['desktop'] = $queries['@desktop'];
		}
		if ( isset( $result['desktop'] ) ) {
			return $result;
		}
	}

	$mobile = SLIDEKIT_DEFAULT_BREAKPOINTS['mobile'];
	$tablet = SLIDEKIT_DEFAULT_BREAKPOINTS['tablet'];

	return array(
		'tablet'  => "@media ({$mobile} < width <= {$tablet})",
		'desktop' => "@media (width > {$tablet})",
	);
}

/**
 * Builds the breakpoint CSS that switches the slider's layout custom properties.
 *
 * @return string CSS.
 */
function slidekit_breakpoint_css() {
	$queries = slidekit_get_media_queries();
	$css     = '';

	if ( isset( $queries['tablet'] ) ) {
		$css .= $queries['tablet'] . '{.wp-block-slidekit-slider{'
			. '--slidekit-basis:var(--slidekit-basis-tablet,var(--slidekit-basis-mobile,100%));'
			. '--slidekit-gap:var(--slidekit-gap-tablet,var(--slidekit-gap-mobile,0px));'
			. '}}';
	}

	$css .= $queries['desktop'] . '{.wp-block-slidekit-slider{'
		. '--slidekit-basis:var(--slidekit-basis-desktop,var(--slidekit-basis-tablet,var(--slidekit-basis-mobile,100%)));'
		. '--slidekit-gap:var(--slidekit-gap-desktop,var(--slidekit-gap-tablet,var(--slidekit-gap-mobile,0px)));'
		. '}}';

	return $css;
}

/**
 * Attaches the breakpoint CSS to the slider's stylesheet on the front end and in the editor.
 *
 * @return void
 */
function slidekit_add_breakpoint_css() {
	wp_add_inline_style( generate_block_asset_handle( 'slidekit/slider', 'style' ), slidekit_breakpoint_css() );
}
add_action( 'enqueue_block_assets', 'slidekit_add_breakpoint_css' );
