import { createStandardLoader, waitForCondition } from '@/integration/shared/utils/module-loader';

(async () => {
    await createStandardLoader(
        'builderius',
        async () => {
            // Wait for builderius builder to be ready
            return await waitForCondition(() => 
                !!document.getElementById('builderInner')?.contentDocument.querySelector('#builderiusBuilder')
            );
        },
        {
            core: [
                () => import('./modules/settings/main'),
                () => import('./modules/generate-cache/main')
            ],
            tailwindV4: [
                () => import('./modules/variables/main'),
                () => import('./modules/monaco/main'),
                () => import('./modules/variable-picker/main')
            ]
        }
    );
})();