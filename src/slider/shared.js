/**
 * Values shared between edit.js and save.js so the two never drift.
 */

export const BREAKPOINTS = [ 'Mobile', 'Tablet', 'Desktop' ];

/**
 * Convert a slides-per-view attribute ("1"…"5" or "auto") into a flex-basis.
 *
 * @param {string} value Attribute value.
 * @return {string} CSS flex-basis value.
 */
export function slideBasis( value ) {
	if ( value === 'auto' ) {
		return 'auto';
	}
	const n = parseInt( value, 10 );
	return n > 0 ? `calc(100% / ${ n })` : '100%';
}

/**
 * Convert a spacing preset slug into a CSS value.
 *
 * @param {string} slug Spacing preset slug, or "0" for none.
 * @return {string} CSS length or custom-property reference.
 */
export function gapValue( slug ) {
	if ( ! slug || slug === '0' ) {
		return '0px';
	}
	return `var(--wp--preset--spacing--${ slug })`;
}

/**
 * Build the inline custom properties the stylesheet reads per breakpoint.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Style object of CSS custom properties.
 */
export function layoutVars( attributes ) {
	const vars = {};
	BREAKPOINTS.forEach( ( bp ) => {
		const key = bp.toLowerCase();
		vars[ `--slidekit-basis-${ key }` ] = slideBasis(
			attributes[ `slidesPerView${ bp }` ]
		);
		vars[ `--slidekit-gap-${ key }` ] = gapValue(
			attributes[ `gap${ bp }` ]
		);
	} );
	return vars;
}
