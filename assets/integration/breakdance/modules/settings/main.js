import './style.scss';

import { createVirtualRef } from '@/dashboard/composables/virtual.js';
import { logger } from '@/integration/common/logger';
import Logo from '~/windpress.svg?raw';

const bricksToolbarSelector = '#bricks-toolbar ul.group-wrapper.right';

// create element from html string
const settingButtonHtml = document.createRange().createContextualFragment(/*html*/`
    <li id="windpressbricks-settings-navbar" data-balloon="WindPress — Bricks settings" data-balloon-pos="bottom">
        <span class="bricks-svg-wrapper">
            ${Logo}
        </span>
    </li>
`);

const { getVirtualRef } = createVirtualRef({}, { 
    persist: 'windpress.ui.state'
});

// add the button to the bricks toolbar as the first item
const bricksToolbar = document.querySelector(bricksToolbarSelector);
bricksToolbar.insertBefore(settingButtonHtml, bricksToolbar.firstChild);

// select the settings button
const settingsButton = document.querySelector('#windpressbricks-settings-navbar');

function toggleMinimize() {
    const currentVal = getVirtualRef('window.minimized', false).value;

    getVirtualRef('window.minimized', false).value = !currentVal;

    if (!currentVal === true) {
        settingsButton.classList.remove('active');
    } else {
        settingsButton.classList.add('active');
    }
}

// add click event listener to the settings button
settingsButton.addEventListener('click', (event) => {
    toggleMinimize();
});

logger('Module loaded!', { module: 'settings' });