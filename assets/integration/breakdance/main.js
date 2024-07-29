import { logger } from '@/integration/common/logger.js';

logger('Loading...');

(async () => {
    while (!document.querySelector('#app')?.__vue__) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    while (!document.querySelector('#app #iframe')?.contentDocument.querySelector('#breakdance_canvas')) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger('Loading modules...');

    // TODO: dynamic import the features based on the enabled modules
    await import('./modules/settings/main.js');
    await import('./modules/plain-classses/main.js');
    // await import('./modules/html2breakdance/main.js');
    await import('./modules/generate-cache/main.js');
    await import('./modules/variable-picker/main.js');

    logger('Modules loaded!');
    
})();