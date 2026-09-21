import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	BlockControls,
	InspectorControls,
	InnerBlocks,
	useBlockProps,
	useInnerBlocksProps,
	useSettings,
} from '@wordpress/block-editor';
import {
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

	const { innerBlocks, selectedClientId, selectedBlockParents } = useSelect(
		( select ) => {
			const store = select( 'core/block-editor' );
			const selected = store.getSelectedBlockClientId();
			return {
				innerBlocks: store.getBlocks( clientId ),
				selectedClientId: selected,
				selectedBlockParents: selected
					? store.getBlockParents( selected )
					: [],
			};
		},
		[ clientId ]
	);
	const slideCount = innerBlocks.length;

	const { selectBlock } = useDispatch( 'core/block-editor' );

	// Follow the selection: selecting a slide (or anything inside it) shows it.
	useEffect( () => {
		const candidates = [ selectedClientId, ...selectedBlockParents ];
		const index = innerBlocks.findIndex( ( block ) =>
			candidates.includes( block.clientId )
		);
		if ( index !== -1 ) {
			setActiveSlide( index );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ selectedClientId ] );

	const displayIndex =
		slideCount > 0 ? Math.min( activeSlide, slideCount - 1 ) : 0;

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
			renderAppender: InnerBlocks.ButtonBlockAppender,
		}
	);

	return (
		<>
			<style>{ `.slidekit--${ clientId } > .slidekit__container > *:not(:nth-child(${
				displayIndex + 1
			})) { display: none; }` }</style>

			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						icon="arrow-left-alt2"
						label={ __( 'Previous slide', 'slidekit' ) }
						onClick={ () => goTo( activeSlide - 1 ) }
						disabled={ activeSlide === 0 || slideCount === 0 }
					/>
					<span className="slidekit-toolbar__counter">
						{ slideCount > 0
							? sprintf(
									/* translators: 1: current slide number, 2: slide count */
									__( '%1$d / %2$d', 'slidekit' ),
									displayIndex + 1,
									slideCount
								)
							: '— / —' }
					</span>
					<ToolbarButton
						icon="arrow-right-alt2"
						label={ __( 'Next slide', 'slidekit' ) }
						onClick={ () => goTo( activeSlide + 1 ) }
						disabled={
							activeSlide >= slideCount - 1 || slideCount === 0
						}
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
