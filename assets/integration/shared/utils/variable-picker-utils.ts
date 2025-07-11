import { logger } from '@/integration/common/logger.js';

export interface ObserverConfig {
  selector: string;
  callback: MutationCallback;
  options?: MutationObserverInit;
}

export function observe({ selector, callback, options }: ObserverConfig): MutationObserver | null {
  const observer = new MutationObserver(callback);
  const target = document.querySelector(selector);
  if (!target) {
    logger(`Target not found for selector: ${selector}`, { module: 'variable-picker', type: 'error' });
    return null;
  }
  const DEFAULT_OPTIONS: MutationObserverInit = {
    childList: true,
    subtree: true,
  };
  observer.observe(target, { ...DEFAULT_OPTIONS, ...options });
  return observer;
}


