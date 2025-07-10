import { createStandardLoader, waitForCondition } from '@/integration/shared/utils/module-loader';

(async () => {
    await createStandardLoader(
        'oxygen',
        async () => {
            // Wait for Angular scope to be ready
            return await waitForCondition(() => {
                const scope = angular.element(window.top.document.body).scope();
                return scope !== void 0 && scope.iframeScope !== false;
            });
        },
        {
            core: [
                () => import('./modules/settings/main'),
                () => import('./modules/plain-classes/main'),
                () => import('./modules/generate-cache/main')
            ],
            tailwindV4: [
                () => import('./modules/variables/main'),
                () => import('./modules/variable-picker/main')
            ]
        }
    );
})();