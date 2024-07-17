import { logger } from '@/integration/common/logger.js';

logger('Loading...');

(async () => {
    let siteEditor;

    console.log('waiting for the siteEditor...');

    // wait for the root container to be available
    while (!siteEditor) {
        siteEditor = document.querySelector('div#site-editor');
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('finding SIUL script and style...');

    // Timeout flag and timer to limit the search duration
    let timeoutOccurred = false;
    let timeout = setTimeout(() => {
        timeoutOccurred = true;
    }, 45000); // 45 seconds timeout

    // wait for the script and style to be available
    while (!timeoutOccurred) {
        let cssElement = document.querySelector('style#siul-tailwindcss-main-css');
        let jitElement = document.querySelector('script#siul-tailwindcss-jit');
        let playElement = document.querySelector('script#siul-tailwindcss-play-cdn');

        if (cssElement && jitElement && playElement) {
            clearTimeout(timeout);
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (timeoutOccurred) {
        console.log('time out! failed to find SIUL script and style');
        return;
    }

    console.log('found SIUL script and style');

    // Create a textarea element to manipulate script content
    let textareaPlayElement = document.createElement('textarea');
    let textareaJitElement = document.createElement('textarea');

    // Copy the Play CDN script content to the textarea
    textareaPlayElement.innerHTML = document.querySelector('script#siul-tailwindcss-play-cdn').outerHTML;
    let playContent = textareaPlayElement.value;

    // Copy the JIT script content to the textarea
    textareaJitElement.innerHTML = document.querySelector('script#siul-tailwindcss-jit').outerHTML;
    let jitContent = textareaJitElement.value;
    

    // Function to inject the script and style into the editor canvas
    let injectIntoEditorCanvas = async () => {
        let editorCanvas;

        // Timeout flag to limit search duration
        let timeoutOccurred = false;
        let timeout = setTimeout(() => {
            timeoutOccurred = true;
        }, 45000); // 45 seconds timeout

        // wait for the editor canvas to be available
        while (!timeoutOccurred) {
            let editorCanvas = document.querySelector('iframe.edit-site-visual-editor__editor-canvas');
            if (editorCanvas) {
                clearTimeout(timeout);
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 100));
        }

        if (timeoutOccurred) {
            console.log('time out! failed to find editor canvas');
            return;
        }

        console.log('found editor canvas');
        
        console.log('waiting for the canvas loader to be removed...');

        while (document.querySelector('div.edit-site-canvas-loader') !== null) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log('canvas loader removed');

        editorCanvas = document.querySelector('iframe.edit-site-visual-editor__editor-canvas');

        let canvasWindow = editorCanvas.contentWindow || editorCanvas;
        let canvasDocument = editorCanvas.contentDocument || canvasWindow.document;
        
        canvasDocument.head.appendChild(document.createRange().createContextualFragment(jitContent));
        canvasDocument.head.appendChild(document.createRange().createContextualFragment(playContent));
        canvasDocument.head.appendChild(document.querySelector('style#siul-tailwindcss-main-css').cloneNode(true));
    };

    // Set up a mutation observer to react to changes in the site editor
    new MutationObserver(() => {
        injectIntoEditorCanvas();
    }).observe(siteEditor, {
        subtree: false,
        childList: true
    });
})();