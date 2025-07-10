import { createStandardLoader, waitForCondition } from '@/integration/shared/utils/module-loader';

(async () => {
    await createStandardLoader(
        'livecanvas',
        async () => {
            // Wait for theme main element to be ready
            return await waitForCondition(() => 
                !!document.getElementById('previewiframe')?.contentDocument.querySelector('#theme-main')
            );
        },
        {
            core: [
                () => import('./modules/generate-cache/main')
            ]
        }
    );
})();