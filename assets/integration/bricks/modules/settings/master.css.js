import { initCSSRuntime } from '@master/css-runtime';

/** @type {import('@master/css').Config} */
const config = {
    scope: '#windpressbricks-settings-app',
    rootSize: 10,
};

const masterCSS = initCSSRuntime(config);

export {
    config,
    masterCSS,
};
