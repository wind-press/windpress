import { initCSSRuntime } from '@master/css-runtime';
// import { vscodeTheme } from './vscode-theme.js';

/** @type {import('@master/css').Config} */
const config = {
    scope: '#windpressbreakdance-variable-app',
    // rootSize: 10,

    variables: {
        //     ...vscodeTheme,
        bdewhite: 'var(--white)',
        bdedark: 'var(--dark)',
    }
};

const masterCSS = initCSSRuntime(config);

export {
    config,
    masterCSS,
};
