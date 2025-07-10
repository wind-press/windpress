export function getContentDocument(): Document | null {
    const rootContainer = document.querySelector('iframe[name="editor-canvas"]') as HTMLIFrameElement;
    const contentWindow = rootContainer?.contentWindow || rootContainer;
    return rootContainer?.contentDocument || contentWindow?.document || null;
}

export function waitForElement<T extends HTMLElement>(
    selector: string,
    timeoutMs: number = 30000
): Promise<T> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.querySelector(selector) as T;
            if (element) {
                resolve(element);
                return;
            }
            
            if (Date.now() - startTime > timeoutMs) {
                reject(new Error(`Timeout: element ${selector} not found within ${timeoutMs}ms`));
                return;
            }
            
            setTimeout(checkElement, 100);
        };
        
        checkElement();
    });
}

export function waitForElements<T extends HTMLElement>(
    selector: string,
    timeoutMs: number = 30000
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElements = () => {
            const elements = Array.from(document.querySelectorAll(selector)) as T[];
            if (elements.length > 0) {
                resolve(elements);
                return;
            }
            
            if (Date.now() - startTime > timeoutMs) {
                reject(new Error(`Timeout: elements ${selector} not found within ${timeoutMs}ms`));
                return;
            }
            
            setTimeout(checkElements, 100);
        };
        
        checkElements();
    });
}

export function waitForElementToDisappear(selector: string, timeoutMs: number = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (!element) {
                resolve();
                return;
            }
            
            if (Date.now() - startTime > timeoutMs) {
                reject(new Error(`Timeout: element ${selector} still present after ${timeoutMs}ms`));
                return;
            }
            
            setTimeout(checkElement, 200);
        };
        
        checkElement();
    });
}