import { initCSSRuntime } from '@master/css-runtime';
import { vscodeTheme } from './vscode-theme.js';

/** @type {import('@master/css').Config} */
const config = {
    scope: '#windpress-app',
    defaultMode: false,
    variables: {
        ...vscodeTheme,
    }
};

const masterCSS = initCSSRuntime(config);

console.log('masterCSS', masterCSS);

export {
    config,
    masterCSS,
};
