import { logger } from '@/integration/common/logger';

export class ScriptInjector {
    private static findWindPressScripts(): HTMLScriptElement[] {
        const scriptElements = document.querySelectorAll('script');
        return Array.from(scriptElements).filter(scriptElement => {
            const id = scriptElement.getAttribute('id');
            return id && (id.startsWith('windpress:') || id.startsWith('vite-client')) && !id.startsWith('windpress:integration-');
        });
    }

    private static async waitForScripts(timeoutMs: number = 45000): Promise<HTMLScriptElement[]> {
        let timeoutOccurred = false;
        const timeout = setTimeout(() => {
            timeoutOccurred = true;
        }, timeoutMs);

        while (!timeoutOccurred) {
            const scriptElements = this.findWindPressScripts();
            if (scriptElements.length > 0) {
                clearTimeout(timeout);
                return scriptElements;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        throw new Error('Timeout: failed to find WindPress scripts');
    }

    private static isScriptAlreadyInjected(document: Document): boolean {
        const injectedScripts = document.querySelectorAll('script');
        return Array.from(injectedScripts).some(script => {
            const id = script.getAttribute('id');
            return id && id.startsWith('windpress:');
        });
    }

    private static injectScripts(targetDocument: Document, scripts: HTMLScriptElement[]): void {
        if (!targetDocument.head) {
            throw new Error('Target document head is not available');
        }

        scripts.forEach(scriptElement => {
            targetDocument.head.appendChild(
                document.createRange().createContextualFragment(scriptElement.outerHTML)
            );
        });
    }

    public static async injectIntoDocument(targetDocument: Document, timeoutMs: number = 45000): Promise<void> {
        if (this.isScriptAlreadyInjected(targetDocument)) {
            logger('WindPress script is already injected, skipping injection');
            return;
        }

        logger('Finding WindPress scripts...');
        const scripts = await this.waitForScripts(timeoutMs);
        
        logger('Found WindPress scripts, injecting...');
        this.injectScripts(targetDocument, scripts);
        
        logger('WindPress scripts injected successfully');
    }

    public static async injectIntoIframe(iframe: HTMLIFrameElement, timeoutMs: number = 45000): Promise<void> {
        const contentWindow = iframe.contentWindow;
        const contentDocument = iframe.contentDocument || contentWindow?.document;

        if (!contentDocument) {
            throw new Error('Cannot access iframe content document');
        }

        // Wait for document head to be available
        while (!contentDocument.head) {
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        await this.injectIntoDocument(contentDocument, timeoutMs);
    }
}