import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { ariaLabel } = attributes;
	const blockProps = useBlockProps.save( {
		className: 'slidekit__slide',
		'aria-label': ariaLabel || undefined,
	} );
	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <div { ...innerBlocksProps } />;
}
