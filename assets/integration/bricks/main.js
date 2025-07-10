import { createStandardLoader, waitForCondition } from '@/integration/shared/utils/module-loader';

(async () => {
    await createStandardLoader(
        'bricks',
        async () => {
            // Wait for Vue app to be ready
            await waitForCondition(() => !!document.querySelector('.brx-body')?.__vue_app__);
            // Wait for preloader to be removed
            await waitForCondition(() => !document.getElementById('bricks-preloader'));
            // Wait for iframe Vue app to be ready
            return await waitForCondition(() => 
                !!document.getElementById('bricks-builder-iframe')?.contentDocument.querySelector('.brx-body')?.__vue_app__
            );
        },
        {
            core: [
                () => import('./modules/settings/main'),
                () => import('./modules/html2bricks/main'),
                () => import('./modules/generate-cache/main')
            ],
            tailwindV4: [
                () => import('./modules/color-palette/main'),
                () => import('./modules/variables/main'),
                () => import('./modules/variable-picker/main')
            ],
            conditional: [
                {
                    condition: () => window.bricksData.version.startsWith('1'),
                    modules: [() => import('./modules/plain-classes/main-1.x')]
                },
                {
                    condition: () => !window.bricksData.version.startsWith('1'),
                    modules: [() => import('./modules/plain-classes/main')]
                }
            ]
        }
    );
})();