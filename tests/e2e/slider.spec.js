/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

test.describe( 'SlideKit slider', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost();
	} );

	test( 'inserts, saves, round-trips and renders', async ( {
		editor,
		page,
	} ) => {
		await editor.insertBlock( {
			name: 'slidekit/slider',
			attributes: {
				showPagination: true,
				paginationType: 'dots',
				slidesPerViewTablet: '1',
				slidesPerViewDesktop: '1',
			},
			innerBlocks: [
				{
					name: 'slidekit/slide',
					innerBlocks: [
						{
							name: 'core/paragraph',
							attributes: { content: 'Slide one' },
						},
					],
				},
				{
					name: 'slidekit/slide',
					innerBlocks: [
						{
							name: 'core/paragraph',
							attributes: { content: 'Slide two' },
						},
					],
				},
				{
					name: 'slidekit/slide',
					innerBlocks: [
						{
							name: 'core/paragraph',
							attributes: { content: 'Slide three' },
						},
					],
				},
			],
		} );

		// Saved markup contains no Embla class names and has the control shells.
		const html = await editor.getEditedPostContent();
		expect( html ).toContain( 'wp:slidekit/slider' );
		expect( html ).toContain(
			'class="slidekit__pagination slidekit__pagination--dots"'
		);
		expect( html ).toContain( 'slidekit__arrow--next' );
		expect( html ).not.toContain( 'embla' );

		// Reload the editor: block must still be valid (no recovery prompt).
		const postId = await editor.publishPost();
		await page.reload();
		await editor.canvas.locator( '.wp-block-slidekit-slider' ).waitFor();
		await expect(
			editor.canvas.locator( '.block-editor-warning' )
		).toHaveCount( 0 );

		// Front end: script boots, dots render, ARIA is in place.
		await page.goto( `/?p=${ postId }` );
		const slider = page.locator( '.wp-block-slidekit-slider' );
		await expect( slider ).toHaveAttribute( 'data-slidekit-ready', 'true' );
		await expect( slider.locator( '.slidekit__dot' ) ).toHaveCount( 3 );
		await expect( slider.locator( '.slidekit__viewport' ) ).toHaveAttribute(
			'aria-roledescription',
			'carousel'
		);
		await expect(
			slider.locator( '.wp-block-slidekit-slide' ).first()
		).toHaveAttribute( 'aria-label', '1 / 3' );

		// Next arrow advances the selection and the live region announces it.
		await slider.locator( '.slidekit__arrow--next' ).click();
		await expect(
			slider.locator( '.slidekit__dot.is-selected' )
		).toHaveAttribute( 'aria-label', '2 / 3' );
		await expect( slider.locator( '.slidekit__live' ) ).toHaveText(
			'2 / 3'
		);
	} );
} );

test.describe( 'SlideKit autoplay', () => {
	// The shared config forces reduced motion, and SlideKit honours it by
	// disabling autoplay. This suite needs the real thing.
	test.use( { reducedMotion: 'no-preference' } );

	test( 'advances on its own and pauses on hover', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'slidekit/slider',
			attributes: {
				autoplay: true,
				autoplayDelay: 1000,
				slidesPerViewTablet: '1',
				slidesPerViewDesktop: '1',
				paginationType: 'fraction',
			},
			innerBlocks: [ 'One', 'Two', 'Three' ].map( ( content ) => ( {
				name: 'slidekit/slide',
				innerBlocks: [
					{ name: 'core/paragraph', attributes: { content } },
				],
			} ) ),
		} );
		const postId = await editor.publishPost();
		await page.goto( `/?p=${ postId }` );

		const slider = page.locator( '.wp-block-slidekit-slider' );
		const fraction = slider.locator( '.slidekit__fraction' );
		await expect( fraction ).toHaveText( '1 / 3' );
		await expect( fraction ).toHaveText( '2 / 3', { timeout: 4000 } );

		// Hovering pauses autoplay.
		await slider.hover();
		const paused = await fraction.textContent();
		await page.waitForTimeout( 1600 );
		await expect( fraction ).toHaveText( paused );
	} );
} );
