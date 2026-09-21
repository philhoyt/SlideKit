/**
 * ESLint flat config. Extends the @wordpress/scripts defaults.
 */

const wpScriptsConfig = require( '@wordpress/scripts/config/eslint.config.cjs' );

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
];
