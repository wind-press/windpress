import './style.scss';

import { logger } from '../../../common/logger';
import { brxGlobalProp } from '../../constant';

import Logo from '../../../../../siul.svg?raw';

const bricksToolbarSelector = '#bricks-toolbar ul.group-wrapper.right';

// create element from html string
const settingButtonHtml = document.createRange().createContextualFragment(/*html*/`
    <li id="siulbricks-settings-navbar" data-balloon="Siul — Bricks settings" data-balloon-pos="bottom">
        <span class="bricks-svg-wrapper">
            ${Logo}
        </span>
    </li>
`);

// add the button to the bricks toolbar as the first item
const bricksToolbar = document.querySelector(bricksToolbarSelector);
bricksToolbar.insertBefore(settingButtonHtml, bricksToolbar.firstChild);

bricksToolbar.addEventListener('click', (event) => {
    brxGlobalProp.$_showMessage('[Siul] Settings functionality is not available yet, coming soon!');
});

logger('Module loaded!', { module: 'settings' });