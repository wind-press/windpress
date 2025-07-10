import './style.scss';
import { createStandardLoader, waitForCondition } from '@/integration/shared/utils/module-loader';

(async () => {
    await createStandardLoader(
        'breakdance',
        async () => {
            // Wait for Vue app to be ready
            await waitForCondition(() => !!document.querySelector('#app')?.__vue__);
            // Wait for iframe canvas to be ready
            return await waitForCondition(() => 
                !!document.querySelector('#app #iframe')?.contentDocument.querySelector('#breakdance_canvas')
            );
        },
        {
            core: [
                () => import('./modules/plain-classes/main'),
                () => import('./modules/generate-cache/main')
            ],
            tailwindV4: [
                () => import('./modules/variables/main'),
                () => import('./modules/variable-picker/main')
            ],
            conditional: [
                // Uncomment when needed
                // {
                //     condition: () => {
                //         const { bdeIframe } = require('./constant');
                //         return bdeIframe.contentWindow.windpress?.is_ubiquitous;
                //     },
                //     modules: [() => import('./modules/settings/main')]
                // }
            ]
        }
    );
})();