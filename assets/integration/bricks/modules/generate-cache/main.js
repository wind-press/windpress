/**
 * @module generate-cache 
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Generate cache when post saved
 */

import { logger } from '@/integration/common/logger';
import { settingsState, brxIframe } from '@/integration/bricks/constant.js';

const channel = new BroadcastChannel('windpress');

(function () {
    const __xhr = window.XMLHttpRequest;
    function XMLHttpRequest() {

        const xhr = new __xhr();

        if (!settingsState('module.generate-cache.on-save', true).value) {
            return xhr;
        }

        const open = xhr.open;

        xhr.open = function (method, url) {
            if (method === 'POST' && url.includes('admin-ajax.php')) {
                const onreadystatechange = xhr.onreadystatechange;

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.data && response.data.action) {
                            if (response.data.action === 'bricks_save_post') {
                                channel.postMessage({
                                    source: 'windpress/integration',
                                    target: 'windpress/dashboard',
                                    task: 'windpress.generate-cache',
                                    payload: {
                                        force_pull: true,
                                    }
                                });
                            }
                        }
                    }

                    if (onreadystatechange) {
                        onreadystatechange.apply(this, arguments);
                    }
                };
            }

            open.apply(this, arguments);
        }

        return xhr;
    }

    window.XMLHttpRequest = XMLHttpRequest;
}());

logger('Module loaded!', { module: 'generate-cache' });