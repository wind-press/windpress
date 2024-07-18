/**
 * @module variables 
 * @package WindPress
 * @since 1.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Register the variables entry to the Bricks' variable manager
 */

import { brxGlobalProp, brxIframe } from '@/integration/bricks/constant.js';
import { getVariableList } from '@/packages/core/tailwind';
import { logger } from '@/integration/common/logger';
import { __unstable__loadDesignSystem } from 'tailwindcss';
import { customAlphabet } from 'nanoid';

const randomId = () => customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6)();

function generateId() {
    let id = randomId();

    while (id.match(/^\d/)) {
        id = randomId();
    }

    return `windpress${id}`;
}

async function registerVariables() {
    // drop global variables with the category of windpress
    brxGlobalProp.$_state.globalVariables = brxGlobalProp.$_state.globalVariables.filter(variable => variable.category !== 'windpress');

    // register category if not exists
    if (!brxGlobalProp.$_state.globalVariablesCategories.find(category => category.id === 'windpress')) {
        brxGlobalProp.$_state.globalVariablesCategories.push({
            "id": "windpress",
            "name": "WindPress"
        });
    }

    // get design system
    const main_css = await brxIframe.contentWindow.wp.hooks.applyFilters('windpress.module.design_system.main_css');

    // register variables
    const variableLists = getVariableList(__unstable__loadDesignSystem(main_css));
    variableLists.forEach(variable => {
        brxGlobalProp.$_state.globalVariables.push({
            "id": generateId(),
            "name": variable.key.substring(2),            
            "value": variable.value,
            "category": "windpress"
        });
    });
}
const channel = new BroadcastChannel('windpress');

channel.addEventListener('message', async (e) => {
    const data = e.data;
    const source = 'windpress/autocomplete';
    const target = 'any';
    const task = 'windpress.main_css.saved.done';

    if (data.source === source && data.task === task) {
        setTimeout(() => {
            registerVariables();
        }, 1000);

    }
});

registerVariables();

logger('Module loaded!', { module: 'variables' });