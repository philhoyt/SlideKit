/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Slide blocks with a paragraph each.
 *
 * @param {number} count How many.
 * @return {Object[]} Inner block definitions.
 */
function slides( count ) {
	return Array.from( { length: count }, ( _, i ) => ( {
		name: 'slidekit/slide',
		innerBlocks: [
			{
				name: 'core/paragraph',
				attributes: { content: `Slide ${ i + 1 }` },
			},
		],
	} ) );
}

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
		await expect( slider.locator( '.slidekit__autoplay' ) ).toHaveCount(
			0
		);

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

	test( 'has a stop button that outlasts hover and focus', async ( {
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
			innerBlocks: slides( 3 ),
		} );
		const postId = await editor.publishPost();
		await page.goto( `/?p=${ postId }` );

		const slider = page.locator( '.wp-block-slidekit-slider' );
		const fraction = slider.locator( '.slidekit__fraction' );
		const toggle = slider.locator( '.slidekit__autoplay' );
		await expect( toggle ).toHaveAttribute(
			'aria-label',
			'Stop automatic slide show'
		);

		await toggle.click();
		await expect( toggle ).toHaveAttribute(
			'aria-label',
			'Start automatic slide show'
		);
		const stopped = await fraction.textContent();

		// Leaving the slider would normally resume the plugin's autoplay.
		await page.mouse.move( 0, 0 );
		await page.keyboard.press( 'Tab' );
		await page.waitForTimeout( 2200 );
		await expect( fraction ).toHaveText( stopped );

		await toggle.click();
		await expect( toggle ).toHaveAttribute(
			'aria-label',
			'Stop automatic slide show'
		);
		await expect( fraction ).not.toHaveText( stopped, { timeout: 4000 } );
	} );
} );

test.describe( 'SlideKit pagination', () => {
	test( 'counts scroll positions, not slides, when several fit in view', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'slidekit/slider',
			attributes: {
				loop: false,
				slidesPerViewMobile: '3',
				slidesPerViewTablet: '3',
				slidesPerViewDesktop: '3',
				paginationType: 'dots',
			},
			innerBlocks: slides( 6 ),
		} );
		const postId = await editor.publishPost();
		await page.goto( `/?p=${ postId }` );

		const slider = page.locator( '.wp-block-slidekit-slider' );
		await expect( slider ).toHaveAttribute( 'data-slidekit-ready', 'true' );

		// 6 slides, 3 in view, no loop: 4 positions.
		const dots = slider.locator( '.slidekit__dot' );
		await expect( dots ).toHaveCount( 4 );
		await expect( dots.first() ).toHaveAttribute( 'aria-label', '1 / 4' );
		await expect( dots.last() ).toHaveAttribute( 'aria-label', '4 / 4' );

		// Slides themselves still count slides.
		await expect(
			slider.locator( '.wp-block-slidekit-slide' ).last()
		).toHaveAttribute( 'aria-label', '6 / 6' );

		// At the start the previous arrow is disabled; at the end, next is.
		await expect(
			slider.locator( '.slidekit__arrow--prev' )
		).toBeDisabled();
		await dots.last().click();
		await expect(
			slider.locator( '.slidekit__arrow--next' )
		).toBeDisabled();
		await expect( slider.locator( '.slidekit__live' ) ).toHaveText(
			'4 / 4'
		);
	} );

	test( 'progress bar fills as the slider advances', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'slidekit/slider',
			attributes: {
				loop: false,
				slidesPerViewTablet: '1',
				slidesPerViewDesktop: '1',
				paginationType: 'progress',
			},
			innerBlocks: slides( 3 ),
		} );
		const postId = await editor.publishPost();
		await page.goto( `/?p=${ postId }` );

		const slider = page.locator( '.wp-block-slidekit-slider' );
		const bar = slider.locator( '.slidekit__progress-bar' );
		await expect( slider ).toHaveAttribute( 'data-slidekit-ready', 'true' );
		await expect( bar ).toHaveCSS(
			'transform',
			'matrix(0, 0, 0, 1, 0, 0)'
		);

		await slider.locator( '.slidekit__arrow--next' ).click();
		await slider.locator( '.slidekit__arrow--next' ).click();
		await expect( bar ).toHaveCSS(
			'transform',
			'matrix(1, 0, 0, 1, 0, 0)'
		);
	} );
} );

test.describe( 'SlideKit fade', () => {
	test( 'stacks slides and still advances with the arrows', async ( {
		admin,
		editor,
		page,
	} ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'slidekit/slider',
			attributes: { effect: 'fade', paginationType: 'fraction' },
			innerBlocks: slides( 3 ),
		} );
		const postId = await editor.publishPost();
		await page.goto( `/?p=${ postId }` );

		const slider = page.locator( '.wp-block-slidekit-slider' );
		await expect( slider ).toHaveAttribute( 'data-effect', 'fade' );
		await expect( slider ).toHaveClass( /slidekit--fade/ );

		// Only the active slide is visible; the others are faded out and inert.
		const first = slider.locator( '.wp-block-slidekit-slide' ).first();
		const second = slider.locator( '.wp-block-slidekit-slide' ).nth( 1 );
		await expect( first ).toHaveCSS( 'opacity', '1' );
		await expect( second ).toHaveCSS( 'opacity', '0' );
		await expect( second ).toHaveCSS( 'pointer-events', 'none' );

		await slider.locator( '.slidekit__arrow--next' ).click();
		await expect( slider.locator( '.slidekit__fraction' ) ).toHaveText(
			'2 / 3'
		);
		await expect( second ).toHaveCSS( 'opacity', '1' );
		await expect( first ).toHaveCSS( 'opacity', '0' );
	} );
} );
