/**
 * Blocks to HTML Parser
 *
 * Converts WindPress Common Block structures back to HTML
 * Mirrors html2blocks.js for consistent roundtrip conversion
 * Exposed as window.windpressCommonBlock.blocks2html()
 */

/**
 * Convert an array of blocks to HTML string
 * @param {Array} blocks - Array of block objects
 * @returns {string} HTML string
 */
function blocks2html(blocks) {
	if (!blocks || !Array.isArray(blocks)) {
		return '';
	}

	return blocks.map(block => blockToHTML(block)).join('\n');
}

/**
 * Convert a single block to HTML
 * @param {Object} block - Block object
 * @returns {string} HTML string
 */
function blockToHTML(block) {
	if (!block || block.name !== 'windpress/common-block') {
		return '';
	}

	const { attributes, innerBlocks } = block;
	const {
		tagName = 'div',
		contentType = 'text',
		content = '',
		globalAttrs = {},
		className = ''
	} = attributes;

	// Handle cb-text-node (wrapper for TEXT_NODE in html2blocks parser)
	// Just return the text content without wrapper tags
	if (tagName === 'cb-text-node') {
		return content || '';
	}

	// Build attributes string
	let attributesString = '';

	// Add className if present
	if (className) {
		attributesString += ` class="${escapeAttribute(className)}"`;
	}

	// Add global attributes
	Object.entries(globalAttrs).forEach(([name, value]) => {
		// Convert data-style back to style
		if (name === 'data-style') {
			attributesString += ` style="${escapeAttribute(value)}"`;
		} else if (name && value !== undefined && value !== '') {
			attributesString += ` ${escapeAttributeName(name)}="${escapeAttribute(value)}"`;
		}
	});

	// Handle different content types
	let innerContent = '';

	switch (contentType) {
		case 'text':
		case 'html':
			innerContent = content || '';
			break;

		case 'blocks':
			// Recursively convert inner blocks to HTML
			if (innerBlocks && innerBlocks.length > 0) {
				innerContent = blocks2html(innerBlocks);
			}
			break;

		case 'empty':
		default:
			innerContent = '';
			break;
	}

	// Generate HTML
	const shouldBeSelfClosing = contentType === 'empty' || isVoidElement(tagName);

	if (shouldBeSelfClosing) {
		return `<${tagName}${attributesString} />`;
	} else {
		return `<${tagName}${attributesString}>${innerContent}</${tagName}>`;
	}
}

/**
 * Check if a tag name is a void element
 * Must match the logic in html2blocks.js for consistent roundtrip
 * @param {string} tagName - HTML tag name
 * @returns {boolean}
 */
function isVoidElement(tagName) {
	const voidElements = [
		'img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base',
		'col', 'embed', 'source', 'track', 'wbr'
	];
	return voidElements.includes(tagName.toLowerCase());
}

/**
 * Escape HTML attribute value
 * @param {string} value - Attribute value
 * @returns {string} Escaped value
 */
function escapeAttribute(value) {
	if (typeof value !== 'string') {
		value = String(value);
	}
	return value
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Escape HTML attribute name
 * @param {string} name - Attribute name
 * @returns {string} Escaped name
 */
function escapeAttributeName(name) {
	// Only allow letters, numbers, hyphens, and underscores
	return name.replace(/[^a-zA-Z0-9\-_]/g, '');
}

// Expose to window
if (typeof window !== 'undefined') {
	window.windpressCommonBlock = window.windpressCommonBlock || {};
	window.windpressCommonBlock.blocks2html = blocks2html;
	window.windpressCommonBlock.blocksToHtml = blocks2html; // Alias for consistency
}

// Export for module usage
export { blocks2html };
