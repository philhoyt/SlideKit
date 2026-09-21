import { BREAKPOINTS, slideBasis, gapValue, layoutVars } from './shared';

describe( 'slideBasis', () => {
	it( 'divides the width by the slide count', () => {
		expect( slideBasis( '1' ) ).toBe( 'calc(100% / 1)' );
		expect( slideBasis( '3' ) ).toBe( 'calc(100% / 3)' );
	} );

	it( 'passes "auto" through so slides size to their content', () => {
		expect( slideBasis( 'auto' ) ).toBe( 'auto' );
	} );

	it( 'falls back to full width for anything unusable', () => {
		expect( slideBasis( '0' ) ).toBe( '100%' );
		expect( slideBasis( '-2' ) ).toBe( '100%' );
		expect( slideBasis( 'abc' ) ).toBe( '100%' );
		expect( slideBasis( undefined ) ).toBe( '100%' );
	} );
} );

describe( 'gapValue', () => {
	it( 'maps a spacing preset slug to its custom property', () => {
		expect( gapValue( '40' ) ).toBe( 'var(--wp--preset--spacing--40)' );
		expect( gapValue( 'x-large' ) ).toBe(
			'var(--wp--preset--spacing--x-large)'
		);
	} );

	it( 'treats "0", empty and missing as no gap', () => {
		expect( gapValue( '0' ) ).toBe( '0px' );
		expect( gapValue( '' ) ).toBe( '0px' );
		expect( gapValue( undefined ) ).toBe( '0px' );
	} );
} );

describe( 'layoutVars', () => {
	const attributes = {
		slidesPerViewMobile: '1',
		slidesPerViewTablet: '2',
		slidesPerViewDesktop: 'auto',
		gapMobile: '0',
		gapTablet: '20',
		gapDesktop: '40',
	};

	it( 'writes a basis and gap property for every breakpoint', () => {
		expect( layoutVars( attributes ) ).toEqual( {
			'--slidekit-basis-mobile': 'calc(100% / 1)',
			'--slidekit-gap-mobile': '0px',
			'--slidekit-basis-tablet': 'calc(100% / 2)',
			'--slidekit-gap-tablet': 'var(--wp--preset--spacing--20)',
			'--slidekit-basis-desktop': 'auto',
			'--slidekit-gap-desktop': 'var(--wp--preset--spacing--40)',
		} );
	} );

	it( 'covers exactly the breakpoints the stylesheet reads', () => {
		const keys = Object.keys( layoutVars( attributes ) );
		expect( keys ).toHaveLength( BREAKPOINTS.length * 2 );
		BREAKPOINTS.forEach( ( bp ) => {
			const key = bp.toLowerCase();
			expect( keys ).toContain( `--slidekit-basis-${ key }` );
			expect( keys ).toContain( `--slidekit-gap-${ key }` );
		} );
	} );
} );
