import {
	InspectorControls,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const DEFAULT_TEMPLATE = [ [ 'core/image' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { ariaLabel } = attributes;
	const blockProps = useBlockProps( { className: 'slidekit__slide' } );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: DEFAULT_TEMPLATE,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Accessibility', 'slidekit' ) }
					initialOpen={ false }
				>
					<TextControl
						label={ __( 'Slide label', 'slidekit' ) }
						help={ __(
							'Optional. Replaces the default "3 / 5" announcement for this slide.',
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
			<div { ...innerBlocksProps } />
		</>
	);
}
