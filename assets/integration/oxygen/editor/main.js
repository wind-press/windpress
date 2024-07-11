import { logger } from '../../common/logger.js';

logger('Loading...');

(async () => {
    while (angular.element(window.top.document.body).scope() === void 0 || angular.element(window.top.document.body).scope().iframeScope === false) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger('Loading modules...');

    // TODO: dynamic import the features based on the enabled modules
    await import('./modules/settings/main.js');
    await import('./modules/plain-classses/main.js');
    await import('./modules/generate-cache/main.js');

    logger('Modules loaded!');
})();