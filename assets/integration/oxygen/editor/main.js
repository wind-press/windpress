import { logger } from '@/integration/common/logger.js';

logger('Loading...');

(async () => {
    while (angular.element(window.top.document.body).scope() === void 0 || angular.element(window.top.document.body).scope().iframeScope === false) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const { oxyIframe } = await import('./constant.js');

    logger('Loading modules...');

    // TODO: dynamic import the features based on the enabled modules
    await import('./modules/settings/main.js');
    await import('./modules/plain-classses/main.js');
    await import('./modules/generate-cache/main.js');

    // tailwindcss-v4
    if (Number(oxyIframe.contentWindow.windpress?._tailwind_version) === 4) {
        await import('./modules/variable-picker/main.js');
    }

    logger('Modules loaded!');
})();