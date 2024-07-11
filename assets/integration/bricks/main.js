import { logger } from '@/integration/common/logger.js';

logger('Loading...');

(async () => {
    while (!document.querySelector('.brx-body')?.__vue_app__) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    while (!document.getElementById('bricks-builder-iframe')?.contentDocument.querySelector('.brx-body')?.__vue_app__) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger('Loading modules...');

    // TODO: dynamic import the features based on the enabled modules
    // await import('./modules/settings/main.js');
    await import('./modules/plain-classses/main.js');
    // await import('./modules/html2bricks/main.js');
    // await import('./modules/generate-cache/main.js');

    logger('Modules loaded!');
})();