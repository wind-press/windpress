import './style.scss';

import { logger } from '../../../../common/logger';

import Logo from '../../../../../../siul.svg?raw';

const oxygenToolbarSelector = '#oxygen-topbar .oxygen-toolbar-menus:has(.oxygen-dom-tree-button)';

// create element from html string
const settingButtonHtml = document.createRange().createContextualFragment(/*html*/`
    <div class="siuloxygen-settings-button">
        ${Logo}
    </div>
`);

// add the button to the bricks toolbar as the first item
const oxygenToolbar = document.querySelector(oxygenToolbarSelector);
oxygenToolbar.insertBefore(settingButtonHtml, oxygenToolbar.firstChild);
window.tippy('.siuloxygen-settings-button', {
    content: 'Siul — Oxygen settings (coming soon)',
    animation: 'shift-toward',
    placement: 'bottom',
});

oxygenToolbar.addEventListener('click', (event) => {
    logger('Settings functionality is not available yet, coming soon!', { module: 'settings' });
});

logger('Module loaded!', { module: 'settings' });