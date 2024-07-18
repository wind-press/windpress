// Destructuring imports from wp and React
const React = window.React;
const {
    element: wpElement,
    blockEditor: wpBlockEditor,
    components: wpComponents,
    compose: wpCompose,
    plugins: wpPlugins,
    data: wpData
} = window.wp;



const utilities = {

};

const layoutUtils = {
    'aspect-ratio': 'Aspect Ratio',
    'container': 'Container',
    'columns': 'Columns',
    'break-after': 'Break After',
    'break-before': 'Break Before',
    'break-inside': 'Break Inside',
    'box-decoration-break': 'Box Decoration Break',
    'box-sizing': 'Box Sizing',
    'display': 'Display',
    'floats': 'Floats',
    'clear': 'Clear',
    'isolation': 'Isolation',
    'object-fit': 'Object Fit',
    'object-position': 'Object Position',
    'overflow': 'Overflow',
    'overscroll-behavior': 'Overscroll Behavior',
    'position': 'Position',
    'top-right-bottom-left': 'Top / Right / Bottom / Left',
    'visibility': 'Visibility',
    'z-index': 'Z-Index',
};

const flexboxGridUtils = {
    'flex-basis': 'Flex Basis',
    'flex-direction': 'Flex Direction',
    'flex-wrap': 'Flex Wrap',
    'flex': 'Flex',
    'flex-grow': 'Flex Grow',
    'flex-shrink': 'Flex Shrink',
    'order': 'Order',
    'grid-template-columns': 'Grid Template Columns',
    'grid-column-start-end': 'Grid Column Start / End',
    'grid-template-rows': 'Grid Template Rows',
    'grid-row-start-end': 'Grid Row Start / End',
    'grid-auto-flow': 'Grid Auto Flow',
    'grid-auto-columns': 'Grid Auto Columns',
    'grid-auto-rows': 'Grid Auto Rows',
    'gap': 'Gap',
    'justify-content': 'Justify Content',
    'justify-items': 'Justify Items',
    'justify-self': 'Justify Self',
    'align-content': 'Align Content',
    'align-items': 'Align Items',
    'align-self': 'Align Self',
    'place-content': 'Place Content',
    'place-items': 'Place Items',
    'place-self': 'Place Self',
};

const spacingUtils = {
    'padding': 'Padding',
    'margin': 'Margin',
    'space-between': 'Space Between',
};

const sizingUtils = {
    'width': 'Width',
    'min-width': 'Min-Width',
    'max-width': 'Max-Width',
    'height': 'Height',
    'min-height': 'Min-Height',
    'max-height': 'Max-Height',
    'size': 'Size',
};

const typographyUtils = {
    'font-family': 'Font Family',
    'font-size': 'Font Size',
    'font-smoothing': 'Font Smoothing',
    'font-style': 'Font Style',
    'font-weight': 'Font Weight',
    'font-variant-numeric': 'Font Variant Numeric',
    'letter-spacing': 'Letter Spacing',
    'line-clamp': 'Line Clamp',
    'line-height': 'Line Height',
    'list-style-image': 'List Style Image',
    'list-style-position': 'List Style Position',
    'list-style-type': 'List Style Type',
    'text-align': 'Text Align',
    'text-color': 'Text Color',
    'text-decoration': 'Text Decoration',
    'text-decoration-color': 'Text Decoration Color',
    'text-decoration-style': 'Text Decoration Style',
    'text-decoration-thickness': 'Text Decoration Thickness',
    'text-underline-offset': 'Text Underline Offset',
    'text-transform': 'Text Transform',
    'text-overflow': 'Text Overflow',
    'text-wrap': 'Text Wrap',
    'text-indent': 'Text Indent',
    'vertical-align': 'Vertical Align',
    'whitespace': 'Whitespace',
    'word-break': 'Word Break',
    'hyphens': 'Hyphens',
    'content': 'Content',
};

const backgroundUtils = {
    'background-attachment': 'Background Attachment',
    'background-clip': 'Background Clip',
    'background-color': 'Background Color',
    'background-origin': 'Background Origin',
    'background-position': 'Background Position',
    'background-repeat': 'Background Repeat',
    'background-size': 'Background Size',
    'background-image': 'Background Image',
    'gradient-color-stops': 'Gradient Color Stops',
};

const borderUtils = {
    'border-radius': 'Border Radius',
    'border-width': 'Border Width',
    'border-color': 'Border Color',
    'border-style': 'Border Style',
    'divide-width': 'Divide Width',
    'divide-color': 'Divide Color',
    'divide-style': 'Divide Style',
    'outline-width': 'Outline Width',
    'outline-color': 'Outline Color',
    'outline-style': 'Outline Style',
    'outline-offset': 'Outline Offset',
    'ring-width': 'Ring Width',
    'ring-color': 'Ring Color',
    'ring-offset-width': 'Ring Offset Width',
    'ring-offset-color': 'Ring Offset Color',
};
    
