/**
 * @module generate-cache 
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * Generate cache when post saved
 */

import { logger } from '@/integration/common/logger';
import { iframeScope, oxyIframe } from "@/integration/oxygen/editor/constant.js"; 

const channel = new BroadcastChannel('windpress');

const originalAllSaved = iframeScope.allSaved;

iframeScope.allSaved = function () {
    originalAllSaved.apply(this, arguments);

    channel.postMessage({
        source: 'windpress/integration',
        target: 'windpress/dashboard',
        task: 'windpress.generate-cache',
        payload: {
            force_pull: true,
            tailwindcss_version: Number(oxyIframe.contentWindow.windpress?._tailwindcss_version)
        }
    });
};

logger('Module loaded!', { module: 'generate-cache' });