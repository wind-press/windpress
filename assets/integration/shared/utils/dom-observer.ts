/**
 * @module shared/utils/dom-observer
 * @package WindPress
 * @since 3.0.0
 * @author Joshua Gugun Siagian <suabahasa@gmail.com>
 * 
 * DOM observation utilities
 */

export function observe(target: Element, callback: MutationCallback, options?: MutationObserverInit): MutationObserver {
  const observer = new MutationObserver(callback);
  observer.observe(target, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    ...options
  });
  return observer;
}

export function waitForElement(selector: string, timeout: number = 10000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver((_, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

export function waitForCondition(condition: () => boolean, timeout: number = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (condition()) {
      resolve();
      return;
    }

    const intervalId = setInterval(() => {
      if (condition()) {
        clearInterval(intervalId);
        resolve();
      }
    }, 100);

    setTimeout(() => {
      clearInterval(intervalId);
      reject(new Error(`Condition not met within ${timeout}ms`));
    }, timeout);
  });
}