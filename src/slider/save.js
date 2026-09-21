import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

import { layoutVars } from './shared';

const ARROW_PREV = (
	<svg
		viewBox="0 0 24 24"
		width="24"
		height="24"
		aria-hidden="true"
		focusable="false"
	>
		<path
			d="M15 5l-7 7 7 7"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const ARROW_NEXT = (
	<svg
		viewBox="0 0 24 24"
		width="24"
		height="24"
		aria-hidden="true"
		focusable="false"
	>
		<path
			d="M9 5l7 7-7 7"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export default function save( { attributes } ) {
	const {
		centeredSlides,
		autoplay,
		autoplayDelay,
		loop,
		showArrows,
		showPagination,
		paginationType,
		effect,
		ariaLabel,
	} = attributes;

	const blockProps = useBlockProps.save( {
		className: `slidekit slidekit--${ effect }`,
		style: layoutVars( attributes ),
		'data-loop': String( loop ),
		'data-autoplay': String( autoplay ),
		'data-autoplay-delay': String( autoplayDelay ),
		'data-centered': String( centeredSlides ),
		'data-effect': effect,
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'slidekit__container',
	} );

	return (
		<div { ...blockProps }>
			<div
				className="slidekit__viewport"
				role="region"
				aria-roledescription="carousel"
				aria-label={ ariaLabel || undefined }
				tabIndex="0"
			>
				<div { ...innerBlocksProps } />
			</div>
			{ showArrows && (
				<div className="slidekit__arrows">
					<button
						type="button"
						className="slidekit__arrow slidekit__arrow--prev"
						aria-label="Previous slide"
					>
						{ ARROW_PREV }
					</button>
					<button
						type="button"
						className="slidekit__arrow slidekit__arrow--next"
						aria-label="Next slide"
					>
						{ ARROW_NEXT }
					</button>
				</div>
			) }
			{ showPagination && (
				<div
					className={ `slidekit__pagination slidekit__pagination--${ paginationType }` }
				>
					{ paginationType === 'progress' && (
						<div className="slidekit__progress" role="presentation">
							<div className="slidekit__progress-bar" />
						</div>
					) }
				</div>
			) }
			<div
				className="slidekit__live slidekit__sr-only"
				aria-live="polite"
				aria-atomic="true"
			/>
		</div>
	);
}
