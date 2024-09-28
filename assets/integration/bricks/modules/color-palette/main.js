/**
 * @module color-palette 
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Register the color entry to the Bricks' color manager.
 */

import { brxGlobalProp, brxIframe } from '@/integration/bricks/constant.js';
import { getVariableList, decodeVFSContainer } from '@/packages/core/tailwindcss-v4';
import { logger } from '@/integration/common/logger';
import crc32 from 'buffer-crc32';

function generateHash(input) {
    const hashed = crc32(input).toString('hex');
    return `windpress-${hashed}`;
}

async function registerPallete() {
    // drop color palette with the name of windpress
    brxGlobalProp.$_state.colorPalette = brxGlobalProp.$_state.colorPalette.filter(palette => palette.name !== 'windpress');

    const vfsContainer = brxIframe.contentWindow.document.querySelector('script[type="text/tailwindcss"]');
    const volume = decodeVFSContainer(vfsContainer.textContent);

    const variableLists = await getVariableList({ volume });

    const colors = [];
    variableLists
        .filter((variable) => variable.key.startsWith('--color'))
        .forEach((variable) => {
            colors.push({
                id: generateHash(variable.key),
                raw: `var(${variable.key})`,
                name: variable.key.substring(2)
            });
        });

    // register palette if not exists
    if (!brxGlobalProp.$_state.colorPalette.find(palette => palette.name === 'windpress')) {
        brxGlobalProp.$_state.colorPalette.push({
            id: 'windpress',
            name: 'windpress',
            colors,
            default: true
        });
    }
}

const channel = new BroadcastChannel('windpress');
channel.addEventListener('message', async (e) => {
    const data = e.data;
    const source = 'windpress/autocomplete';
    const target = 'any';
    const task = 'windpress.code-editor.saved.done';

    if (data.source === source && data.task === task) {
        setTimeout(() => {
            registerPallete();
        }, 1000);

    }
});

registerPallete();

logger('Module loaded!', { module: 'color-palette' });