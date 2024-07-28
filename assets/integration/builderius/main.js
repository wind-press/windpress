import { logger } from '@/integration/common/logger.js';

logger('Loading...');

(async () => {
    while (!document.getElementById('builderInner')?.contentDocument.querySelector('#builderiusBuilder')) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger('Loading modules...');

    // TODO: dynamic import the features based on the enabled modules
    // await import('./modules/settings/main.js');
    // await import('./modules/plain-classses/main.js');
    // await import('./modules/color-palette/main.js');
    // await import('./modules/variables/main.js');
    // await import('./modules/html2builderius/main.js');
    await import('./modules/generate-cache/main.js');
    await import('./modules/monaco/main.js');
    await import('./modules/variable-picker/main.js');

    logger('Modules loaded!');
})();