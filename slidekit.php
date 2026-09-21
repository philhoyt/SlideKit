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
