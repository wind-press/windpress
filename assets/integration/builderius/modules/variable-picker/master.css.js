import { initCSSRuntime } from '@master/css-runtime';
// import { vscodeTheme } from './vscode-theme.js';

/** @type {import('@master/css').Config} */
const config = {
    scope: '#windpressbuilderius-variable-app',
    // rootSize: 10,
    
    // variables: {
    //     ...vscodeTheme,
    // }
};

const masterCSS = initCSSRuntime(config);

export {
    config,
    masterCSS,
};
