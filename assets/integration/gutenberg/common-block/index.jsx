import { registerBlockType } from '@wordpress/blocks';
import WindPressIconOriginal from '~/windpress.svg?react';
import Edit from './components/Edit';
import Save from './components/Save';
import metadata from './block.json';

// Import parsers to expose to window
import './lib/html2blocks.js';
import './lib/blocks2html.js';

// Import toolbar plugin for HTML import
import './toolbar-plugin.jsx';

// WindPress icon component
const icon = () => (
	<WindPressIconOriginal width={24} height={24} aria-hidden="true" focusable="false" />
);

registerBlockType(metadata.name, {
	...metadata,
	icon,
	edit: Edit,
	save: Save,
});