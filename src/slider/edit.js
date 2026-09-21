import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import {
	BlockControls,
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
	useSettings,
} from '@wordpress/block-editor';
import {
	Button,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	ToolbarGroup,
	ToolbarButton,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

import { BREAKPOINTS } from './shared';

const SLIDES_PER_VIEW_OPTIONS = [
	{ label: '1', value: '1' },
	{ label: '2', value: '2' },
	{ label: '3', value: '3' },
	{ label: '4', value: '4' },
	{ label: '5', value: '5' },
	{ label: __( 'Auto (slide width)', 'slidekit' ), value: 'auto' },
];

const PAGINATION_TYPE_OPTIONS = [
	{ label: __( 'Dots', 'slidekit' ), value: 'dots' },
	{ label: __( 'Fraction (1 / 5)', 'slidekit' ), value: 'fraction' },
	{ label: __( 'Progress bar', 'slidekit' ), value: 'progress' },
];

const EFFECT_OPTIONS = [
	{ label: __( 'Slide', 'slidekit' ), value: 'slide' },
	{ label: __( 'Fade', 'slidekit' ), value: 'fade' },
];

const BREAKPOINT_LABELS = {
	Mobile: __( 'Mobile', 'slidekit' ),
	Tablet: __( 'Tablet', 'slidekit' ),
	Desktop: __( 'Desktop', 'slidekit' ),
};

/**
 * "2 / 5" style position label for the toolbar and the canvas bar.
 *
 * @param {number} index Zero-based active slide.
 * @param {number} count Slide count.
 * @return {string} Label.
 */
function positionLabel( index, count ) {
	if ( count === 0 ) {
		return '— / —';
	}
	return sprintf(
		/* translators: 1: current slide number, 2: slide count */
		__( '%1$d / %2$d', 'slidekit' ),
		index + 1,
		count
	);
}

/**
 * Navigation bar rendered under the active slide in the canvas. It stays
 * put while a slide (or something inside it) is selected, when the Slider's
 * own toolbar is not showing.
 *
 * @param {Object}   props
 * @param {number}   props.displayIndex Zero-based active slide.
 * @param {number}   props.slideCount   Slide count.
 * @param {boolean}  props.canGoPrev    Whether there is a previous slide.
 * @param {boolean}  props.canGoNext    Whether there is a next slide.
 * @param {Function} props.onPrev       Show the previous slide.
 * @param {Function} props.onNext       Show the next slide.
 * @param {Function} props.onAdd        Append a slide.
 * @return {Element} The bar.
 */
function SlideNav( {
	displayIndex,
	slideCount,
	canGoPrev,
	canGoNext,
	onPrev,
	onNext,
	onAdd,
} ) {
	return (
		<div className="slidekit-editor-nav">
			<Button
				className="slidekit-editor-nav__prev"
				variant="tertiary"
				onClick={ onPrev }
				disabled={ ! canGoPrev }
				accessibleWhenDisabled
				__next40pxDefaultSize
			>
				{ __( 'Previous', 'slidekit' ) }
			</Button>
			<span className="slidekit-editor-nav__count" aria-live="polite">
				{ positionLabel( displayIndex, slideCount ) }
			</span>
			<Button
				className="slidekit-editor-nav__next"
				variant="tertiary"
				onClick={ onNext }
				disabled={ ! canGoNext }
				accessibleWhenDisabled
				__next40pxDefaultSize
			>
				{ __( 'Next', 'slidekit' ) }
			</Button>
			<Button
				className="slidekit-add-slide"
				variant="secondary"
				onClick={ onAdd }
				__next40pxDefaultSize
			>
				{ __( 'Add slide', 'slidekit' ) }
			</Button>
		</div>
	);
}

export default function Edit( { clientId, attributes, setAttributes } ) {
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

	const [ activeSlide, setActiveSlide ] = useState( 0 );

	const [ spacingSizes = [] ] = useSettings( 'spacing.spacingSizes' );
	const gapOptions = [
		{ label: __( 'None', 'slidekit' ), value: '0' },
		...spacingSizes.map( ( { name, slug } ) => ( {
			label: name,
			value: String( slug ),
		} ) ),
	];

	const { innerBlocks, selectedSlideIndex } = useSelect(
		( select ) => {
			const store = select( 'core/block-editor' );
			const blocks = store.getBlocks( clientId );
			const selected = store.getSelectedBlockClientId();
			// The slide that is selected, or that contains the selection.
			const candidates = selected
				? [ selected, ...store.getBlockParents( selected ) ]
				: [];
			return {
				innerBlocks: blocks,
				selectedSlideIndex: blocks.findIndex( ( block ) =>
					candidates.includes( block.clientId )
				),
			};
		},
		[ clientId ]
	);
	const slideCount = innerBlocks.length;

	const { selectBlock, insertBlock } = useDispatch( 'core/block-editor' );

	const addSlide = () => {
		insertBlock( createBlock( 'slidekit/slide' ), slideCount, clientId );
	};

	// Follow the selection: selecting a slide (or anything inside it) shows
	// it. The index also moves when the selected slide is reordered.
	useEffect( () => {
		if ( selectedSlideIndex !== -1 ) {
			setActiveSlide( selectedSlideIndex );
		}
	}, [ selectedSlideIndex ] );

	// activeSlide can point past the end after a deletion; this is the slide
	// actually shown, and what every control reasons about.
	const displayIndex =
		slideCount > 0 ? Math.min( activeSlide, slideCount - 1 ) : 0;
	const canGoPrev = displayIndex > 0;
	const canGoNext = displayIndex < slideCount - 1;

	const goTo = ( index ) => {
		const clamped = Math.max( 0, Math.min( slideCount - 1, index ) );
		setActiveSlide( clamped );
		if ( innerBlocks[ clamped ] ) {
			selectBlock( innerBlocks[ clamped ].clientId );
		}
	};

	const isFade = effect === 'fade';

	const blockProps = useBlockProps( {
		className: `slidekit slidekit--editor slidekit--${ clientId }`,
	} );
	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'slidekit__container' },
		{
			allowedBlocks: [ 'slidekit/slide' ],
			template: [ [ 'slidekit/slide' ] ],
			// Navigation and Add slide below the active slide, instead of the
			// default corner "+" that overlaps the slide's own appender.
			renderAppender: () => (
				<SlideNav
					displayIndex={ displayIndex }
					slideCount={ slideCount }
					canGoPrev={ canGoPrev }
					canGoNext={ canGoNext }
					onPrev={ () => goTo( displayIndex - 1 ) }
					onNext={ () => goTo( displayIndex + 1 ) }
					onAdd={ addSlide }
				/>
			),
		}
	);

	return (
		<>
			{ /* Hide every slide except the active one; leave the appender alone. */ }
			<style>{ `.slidekit--${ clientId } > .slidekit__container > *:not(:nth-child(${
				displayIndex + 1
			})):not(.block-list-appender) { display: none; }` }</style>

			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon="arrow-left-alt2"
						label={ __( 'Previous slide', 'slidekit' ) }
						onClick={ () => goTo( displayIndex - 1 ) }
						disabled={ ! canGoPrev }
					/>
					<span className="slidekit-toolbar__counter">
						{ positionLabel( displayIndex, slideCount ) }
					</span>
					<ToolbarButton
						icon="arrow-right-alt2"
						label={ __( 'Next slide', 'slidekit' ) }
						onClick={ () => goTo( displayIndex + 1 ) }
						disabled={ ! canGoNext }
					/>
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'slidekit' ) }>
					{ BREAKPOINTS.map( ( bp ) => (
						<SelectControl
							key={ `spv-${ bp }` }
							label={ sprintf(
								/* translators: %s: breakpoint name */
								__( 'Slides per view: %s', 'slidekit' ),
								BREAKPOINT_LABELS[ bp ]
							) }
							value={
								isFade
									? '1'
									: attributes[ `slidesPerView${ bp }` ]
							}
							options={ SLIDES_PER_VIEW_OPTIONS }
							onChange={ ( value ) =>
								setAttributes( {
									[ `slidesPerView${ bp }` ]: value,
								} )
							}
							disabled={ isFade }
							help={
								isFade && bp === 'Mobile'
									? __(
											'Fade shows one slide at a time.',
											'slidekit'
										)
									: undefined
							}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					) ) }
					{ BREAKPOINTS.map( ( bp ) => (
						<SelectControl
							key={ `gap-${ bp }` }
							label={ sprintf(
								/* translators: %s: breakpoint name */
								__( 'Gap: %s', 'slidekit' ),
								BREAKPOINT_LABELS[ bp ]
							) }
							value={ attributes[ `gap${ bp }` ] }
							options={ gapOptions }
							onChange={ ( value ) =>
								setAttributes( { [ `gap${ bp }` ]: value } )
							}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					) ) }
					<ToggleControl
						label={ __( 'Center the active slide', 'slidekit' ) }
						checked={ centeredSlides }
						onChange={ ( value ) =>
							setAttributes( { centeredSlides: value } )
						}
						__nextHasNoMarginBottom
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Behavior', 'slidekit' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Transition', 'slidekit' ) }
						value={ effect }
						options={ EFFECT_OPTIONS }
						onChange={ ( value ) =>
							setAttributes(
								value === 'fade'
									? {
											effect: value,
											slidesPerViewMobile: '1',
											slidesPerViewTablet: '1',
											slidesPerViewDesktop: '1',
										}
									: { effect: value }
							)
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Loop', 'slidekit' ) }
						checked={ loop }
						onChange={ ( value ) =>
							setAttributes( { loop: value } )
						}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Autoplay', 'slidekit' ) }
						help={ __(
							'Pauses on hover, on focus, when scrolled out of view, and for visitors who prefer reduced motion.',
							'slidekit'
						) }
						checked={ autoplay }
						onChange={ ( value ) =>
							setAttributes( { autoplay: value } )
						}
						__nextHasNoMarginBottom
					/>
					{ autoplay && (
						<RangeControl
							label={ __( 'Autoplay delay (ms)', 'slidekit' ) }
							value={ autoplayDelay }
							onChange={ ( value ) =>
								setAttributes( { autoplayDelay: value } )
							}
							min={ 1000 }
							max={ 15000 }
							step={ 500 }
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Controls', 'slidekit' ) }
					initialOpen={ false }
				>
					<ToggleControl
						label={ __( 'Previous / next arrows', 'slidekit' ) }
						checked={ showArrows }
						onChange={ ( value ) =>
							setAttributes( { showArrows: value } )
						}
						__nextHasNoMarginBottom
					/>
					<ToggleControl
						label={ __( 'Pagination', 'slidekit' ) }
						checked={ showPagination }
						onChange={ ( value ) =>
							setAttributes( { showPagination: value } )
						}
						__nextHasNoMarginBottom
					/>
					{ showPagination && (
						<SelectControl
							label={ __( 'Pagination style', 'slidekit' ) }
							value={ paginationType }
							options={ PAGINATION_TYPE_OPTIONS }
							onChange={ ( value ) =>
								setAttributes( { paginationType: value } )
							}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
					) }
					<TextControl
						label={ __( 'Accessible label', 'slidekit' ) }
						help={ __(
							'Read by screen readers to identify this slider, for example "Featured projects".',
							'slidekit'
						) }
						value={ ariaLabel }
						onChange={ ( value ) =>
							setAttributes( { ariaLabel: value } )
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}
