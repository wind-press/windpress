import { logger } from '@/integration/common/logger';

logger('Loading...');

(async () => {
    while (!document.getElementById('etch-iframe')?.contentDocument.querySelector('body')) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    logger('Loading modules...');

    await import('./modules/play/observer');

    // document.querySelector('.etch-html-editor .cm-editor .cm-content').cmView
})();