/**
 * Playwright config: extends the @wordpress/scripts default, which targets the
 * wp-env test site on port 8889 and logs in with the wp-env admin account.
 */
const { defineConfig } = require( '@playwright/test' );
const baseConfig = require( '@wordpress/scripts/config/playwright.config' );

module.exports = defineConfig( {
	...baseConfig,
	testDir: './tests/e2e',
} );
