<?php
/**
 * PHPUnit bootstrap: loads the WordPress test suite and this plugin.
 *
 * Runs inside wp-env, where WP_TESTS_DIR points at the core test library.
 *
 * @package slidekit
 */

$slidekit_tests_dir = getenv( 'WP_TESTS_DIR' );

if ( ! $slidekit_tests_dir ) {
	$slidekit_tests_dir = rtrim( sys_get_temp_dir(), '/\\' ) . '/wordpress-tests-lib';
}

if ( ! file_exists( $slidekit_tests_dir . '/includes/functions.php' ) ) {
	echo "Could not find {$slidekit_tests_dir}/includes/functions.php. Run the tests through wp-env: npm run test:php" . PHP_EOL; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	exit( 1 );
}

require_once dirname( __DIR__, 2 ) . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';
require_once $slidekit_tests_dir . '/includes/functions.php';

/**
 * Loads the plugin before the test suite installs WordPress.
 *
 * @return void
 */
function slidekit_tests_load_plugin() {
	require dirname( __DIR__, 2 ) . '/slidekit.php';
}
tests_add_filter( 'muplugins_loaded', 'slidekit_tests_load_plugin' );

require $slidekit_tests_dir . '/includes/bootstrap.php';
