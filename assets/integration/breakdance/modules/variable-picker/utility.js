import { logger } from '@/integration/common/logger.js';

export function observe({ selector, callback, options, }) {
    const observer = new MutationObserver(callback);
    const target = document.querySelector(selector);
    if (!target) {
        logger(`Target not found for selector: ${selector}`, { module: 'variable-picker', type: 'error' });
        return;
    }
    const DEFAULT_OPTIONS = {
        childList: true,
        subtree: true,
    };
    observer.observe(target, Object.assign(Object.assign({}, DEFAULT_OPTIONS), options));
}