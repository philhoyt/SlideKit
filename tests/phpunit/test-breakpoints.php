<?php
/**
 * Tests for the breakpoint CSS that follows the theme's viewport settings.
 *
 * @package slidekit
 */

/**
 * Breakpoint media query and inline style tests.
 */
class Test_Slidekit_Breakpoints extends WP_UnitTestCase {

	/**
	 * Viewport settings injected into theme.json for the current test.
	 *
	 * @var array|null
	 */
	private $viewport = null;

	/**
	 * Hooks a theme.json filter so each test can set settings.viewport.
	 */
	public function set_up() {
		parent::set_up();
		add_filter( 'wp_theme_json_data_theme', array( $this, 'filter_theme_json' ) );
	}

	/**
	 * Removes the filter and clears cached global settings.
	 */
	public function tear_down() {
		remove_filter( 'wp_theme_json_data_theme', array( $this, 'filter_theme_json' ) );
		$this->viewport = null;
		wp_clean_theme_json_cache();
		parent::tear_down();
	}

	/**
	 * Injects the test's viewport settings into the theme's theme.json data.
	 *
	 * @param WP_Theme_JSON_Data $theme_json Theme JSON data.
	 * @return WP_Theme_JSON_Data
	 */
	public function filter_theme_json( $theme_json ) {
		if ( null === $this->viewport ) {
			return $theme_json;
		}
		return $theme_json->update_with(
			array(
				'version'  => WP_Theme_JSON::LATEST_SCHEMA,
				'settings' => array( 'viewport' => $this->viewport ),
			)
		);
	}

	/**
	 * Sets the viewport settings for the current test and clears the cache.
	 *
	 * @param array $viewport Viewport settings.
	 */
	private function set_viewport( $viewport ) {
		$this->viewport = $viewport;
		wp_clean_theme_json_cache();
	}

	/**
	 * With no theme settings the queries match core's defaults.
	 */
	public function test_default_breakpoints_match_core() {
		$queries = slidekit_get_media_queries();

		$this->assertSame( '@media (480px < width <= 782px)', $queries['tablet'] );
		$this->assertSame( '@media (width > 782px)', $queries['desktop'] );
	}

	/**
	 * A theme's custom viewport settings drive the queries.
	 */
	public function test_custom_theme_breakpoints_are_used() {
		$this->set_viewport(
			array(
				'mobile' => '600px',
				'tablet' => '1024px',
			)
		);

		$queries = slidekit_get_media_queries();

		$this->assertSame( '@media (600px < width <= 1024px)', $queries['tablet'] );
		$this->assertSame( '@media (width > 1024px)', $queries['desktop'] );
	}

	/**
	 * A theme with only a mobile breakpoint gets no tablet query and a
	 * desktop query that starts after mobile.
	 */
	public function test_mobile_only_theme_skips_tablet() {
		$this->set_viewport( array( 'mobile' => '500px' ) );

		$queries = slidekit_get_media_queries();

		$this->assertArrayNotHasKey( 'tablet', $queries );
		$this->assertSame( '@media (width > 500px)', $queries['desktop'] );

		$css = slidekit_breakpoint_css();
		$this->assertSame( 1, substr_count( $css, '@media' ), 'Only the desktop query is emitted' );
		$this->assertStringContainsString( '@media (width > 500px){.wp-block-slidekit-slider{', $css );
	}

	/**
	 * The CSS switches both custom properties inside each query and cascades
	 * desktop through tablet to mobile.
	 */
	public function test_breakpoint_css_switches_layout_properties() {
		$css = slidekit_breakpoint_css();

		$this->assertStringContainsString(
			'@media (480px < width <= 782px){.wp-block-slidekit-slider{--slidekit-basis:var(--slidekit-basis-tablet,var(--slidekit-basis-mobile,100%));--slidekit-gap:var(--slidekit-gap-tablet,var(--slidekit-gap-mobile,0px));}}',
			$css
		);
		$this->assertStringContainsString(
			'@media (width > 782px){.wp-block-slidekit-slider{--slidekit-basis:var(--slidekit-basis-desktop,var(--slidekit-basis-tablet,var(--slidekit-basis-mobile,100%)));--slidekit-gap:var(--slidekit-gap-desktop,var(--slidekit-gap-tablet,var(--slidekit-gap-mobile,0px)));}}',
			$css
		);
	}

	/**
	 * The CSS is attached to the slider block's registered stylesheet.
	 */
	public function test_inline_style_is_attached_to_slider_stylesheet() {
		$handle = generate_block_asset_handle( 'slidekit/slider', 'style' );

		$this->assertTrue( wp_style_is( $handle, 'registered' ), 'Slider stylesheet is registered from block.json' );

		do_action( 'enqueue_block_assets' );

		$inline = wp_styles()->get_data( $handle, 'after' );

		$this->assertIsArray( $inline );
		$this->assertStringContainsString( '@media (width > 782px)', implode( '', $inline ) );
	}
}
