import { logger } from '@/integration/common/logger';

logger('Loading...');

(async () => {
    while (!document.getElementById('previewiframe')?.contentDocument.querySelector('#theme-main')) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger('Loading modules...');

    // TODO: dynamic import the features based on the enabled modules
    // await import('./modules/settings/main.js');
    await import('./modules/generate-cache/main.js');

    logger('Modules loaded!');
})();