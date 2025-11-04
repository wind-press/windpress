import { ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import HtmlImportModal from './HtmlImportModal';

/**
 * HTML Import Button for Gutenberg Toolbar
 */
function HtmlImportButton() {
	const [isOpen, setIsOpen] = useState(false);

	const { insertBlocks } = useDispatch('core/block-editor');
	const { getSelectedBlockClientId, getBlockRootClientId } = useSelect(
		(select) => select('core/block-editor'),
		[]
	);

	const handleImport = (htmlCode) => {
		// Check if parser is available
		if (typeof window.windpressCommonBlock === 'undefined' || typeof window.windpressCommonBlock.html2blocks !== 'function') {
			alert(__('HTML parser not available. Please refresh the page.', 'windpress'));
			return;
		}

		try {
			// Parse HTML to block data
			const blockData = window.windpressCommonBlock.html2blocks(htmlCode);

			if (!blockData || blockData.length === 0) {
				alert(__('Could not parse HTML. Please check the HTML syntax.', 'windpress'));
				return;
			}

			// Convert block data to WordPress blocks
			const convertBlockData = (data) => {
				const innerBlocks = data.innerBlocks && data.innerBlocks.length > 0
					? data.innerBlocks.map(convertBlockData)
					: [];
				return createBlock(data.name, data.attributes, innerBlocks);
			};

			const newBlocks = blockData.map(convertBlockData);

			// Check if the first block should be full-width
			// If we're inserting at root level (not inside another block), make it full-width
			const selectedBlockClientId = getSelectedBlockClientId();
			const parentClientId = selectedBlockClientId
				? getBlockRootClientId(selectedBlockClientId)
				: null;

			// If no parent (root level), set first block to full-width if it's a Common Block
			if (!parentClientId && newBlocks.length > 0 && newBlocks[0].name === 'windpress/common-block') {
				newBlocks[0].attributes.align = 'full';
			}

			// Insert blocks at the current selection or at the end
			insertBlocks(newBlocks, undefined, selectedBlockClientId || undefined);

			// Close modal
			setIsOpen(false);
		} catch (error) {
			console.error('HTML import error:', error);
			alert(__('Error importing HTML. Check console for details.', 'windpress'));
		}
	};

	return (
		<>
			<ToolbarButton
				icon="download"
				label={__('Import HTML', 'windpress')}
				onClick={() => setIsOpen(true)}
			/>

			{isOpen && (
				<HtmlImportModal
					isOpen={isOpen}
					onClose={() => setIsOpen(false)}
					onImport={handleImport}
				/>
			)}
		</>
	);
}

export default HtmlImportButton;
