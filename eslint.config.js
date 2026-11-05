/**
 * ESLint flat config. Extends the @wordpress/scripts defaults.
 */

const wpScriptsConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );
const jestPlugin = require( 'eslint-plugin-jest' );

module.exports = [
	{
		ignores: [ 'lib/**', 'build/**', 'vendor/**', 'node_modules/**' ],
	},

	...wpScriptsConfig,

	{
		settings: {
			// Provided by WordPress at runtime and externalised by the build.
			'import/core-modules': [
				'@wordpress/blocks',
				'@wordpress/block-editor',
				'@wordpress/components',
				'@wordpress/data',
				'@wordpress/element',
				'@wordpress/i18n',
			],
		},
	},
	// The unit suite stays on Jest (wp-scripts test-unit-jest); the default
	// test override in @wordpress/eslint-plugin 27+ targets Vitest instead.
	{
		...jestPlugin.configs[ 'flat/recommended' ],
		files: [ 'src/**/*.test.js' ],
	},
];
