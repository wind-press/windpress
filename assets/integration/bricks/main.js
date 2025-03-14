import { logger } from '@/integration/common/logger.js';
// import './master.css.js';

logger('Loading...');

(async () => {
    while (!document.querySelector('.brx-body')?.__vue_app__) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    while (document.getElementById('bricks-preloader')) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    while (!document.getElementById('bricks-builder-iframe')?.contentDocument.querySelector('.brx-body')?.__vue_app__) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const { brxIframe } = await import('./constant.js');

    logger('Loading modules...');

    // TODO: dynamic import the features based on the enabled modules
    // await import('./modules/settings/main.js');
    // await import('./modules/plain-classses/main.js');
    // await import('./modules/html2bricks/main.js');
    // await import('./modules/generate-cache/main.js');

    // await import('./modules/color-palette/main.js');
    // await import('./modules/variables/main.js');
    // await import('./modules/variable-picker/main.js');

    logger('Modules loaded!');
})();