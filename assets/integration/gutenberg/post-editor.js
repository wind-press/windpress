import { logger } from '@/integration/common/logger.js';

logger('Loading...');

(async () => {
    let rootContainer;
    let scriptElements;

    // wait for the root container to be available
    while (!rootContainer) {
        rootContainer = document.querySelector('iframe[name="editor-canvas"]');
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Timeout flag and timer to limit the search duration
    let timeoutOccurred = false;
    let timeout = setTimeout(() => {
        timeoutOccurred = true;
    }, 45000); // 45 seconds timeout

    // wait for the script to be available
    while (!timeoutOccurred) {
        scriptElements = document.querySelectorAll('script');

        // filter the script elements. Search for the script with the id prefixed with 'windpress:' except 'windpress:integration-'
        scriptElements = Array.from(scriptElements).filter(scriptElement => {
            let id = scriptElement.getAttribute('id');
            return id && id.startsWith('windpress:') && !id.startsWith('windpress:integration-');
        });

        if (scriptElements.length > 0) {
            clearTimeout(timeout);
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (timeoutOccurred) {
        logger('time out! failed to find WindPress script');
        return;
    }

    let contentWindow = rootContainer.contentWindow || rootContainer;
    let contentDocument = rootContainer.contentDocument || contentWindow.document;

    // wait until contentDocument.head is available
    while (!contentDocument.head) {
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Inject the script into the root iframe
    logger('injecting WindPress script into the root container');

    let injectedScript = contentDocument.querySelectorAll('script');
    
    // check if the script is already injected if it has any script's id that starts with 'windpress:'
    let isScriptInjected = Array.from(injectedScript).some(script => {
        let id = script.getAttribute('id');
        return id && id.startsWith('windpress:');
    });

    if (!isScriptInjected) {
        logger('starting the root injection process...');
        scriptElements.forEach(scriptElement => {
            contentDocument.head.appendChild(document.createRange().createContextualFragment(scriptElement.outerHTML));
        });
    } else {
        logger('WindPress script is already injected');
    }
})();
