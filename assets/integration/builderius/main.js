import { logger } from '@/integration/common/logger';

logger('Loading...');

(async () => {
    while (!document.getElementById('builderInner')?.contentDocument.querySelector('#builderiusBuilder')) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const { uniIframe } = await import('./constant.js');

    logger('Loading modules...');

    // TODO: dynamic import the features based on the enabled modules
    await import('./modules/settings/main.js');
    // await import('./modules/plain-classses/main.js');
    // await import('./modules/html2builderius/main.js');
    await import('./modules/generate-cache/main.js');

    // tailwindcss-v4
    if (Number(uniIframe.contentWindow.windpress?._tailwindcss_version) === 4) {
        await import('./modules/variables/main.ts');
        await import('./modules/monaco/main.js');
        await import('./modules/variable-picker/main.js');
    }

    logger('Modules loaded!');
})();