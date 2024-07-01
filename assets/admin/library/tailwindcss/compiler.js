import compilerIframe from './compiler-iframe.html?raw';
import axios from 'axios';
import { useStorage } from '@vueuse/core';
import { Generator as JspmGenerator } from 'https://esm.sh/@jspm/generator?bundle';

export class IframeManager {
    static compilerIframeEl = null;
    static compilerIframeReady = false;

    /**
     * @param {string} version - The Tailwind CSS version
     * @param {boolean} forceRecreate - If true, the iframe will be recreated
     * @returns {Promise<HTMLIFrameElement>} The iframe element
     */
    static async getCompilerIframe(version, forceRecreate = false) {
        if (!version) {
            throw new Error('No version provided for the compiler iframe.');
        }

        if (forceRecreate) {
            IframeManager.removeCompilerIframe();
            IframeManager.compilerIframeReady = false;
        }

        if (!IframeManager.compilerIframeEl) {
            let jspmStorage = useStorage('windpress.ui.settings.performance.compile.jspm', {}, localStorage, {});

            let jspm = jspmStorage.value[`${version}`];

            if (jspm === undefined || jspm.generatedAt < new Date().getTime() - 1000 * 60 * 60 * 24 * 7) {
                try {
                    jspm = await axios
                        .get('https://api.jspm.io/generate', {
                            params: {
                                env: JSON.stringify(['production', 'browser', 'module']),
                                install: JSON.stringify([
                                    {
                                        target: 'tailwindcss@' + version,
                                        subpaths: [
                                            './nesting',
                                            './resolveConfig',
                                            './lib/processTailwindFeatures',
                                            './package.json.js',
                                        ]
                                    },
                                    { target: 'browserslist' },
                                    { target: 'postcss' },
                                ]),
                                defaultProvider: 'esm.sh',
                            },
                        }).then((response) => response.data);
                } catch (err1) {
                    const generator = new JspmGenerator({
                        // The URL of the import map, for normalising relative URLs:
                        // mapUrl: import.meta.url,
                        mapUrl: window.windpress.assets.url,

                        // The default CDN to use for external package resolutions:
                        defaultProvider: 'esm.sh',

                        // The environment(s) to target. Note that JSPM will use these to resolve
                        // conditional exports in any package it encounters:
                        env: ['production', 'browser', 'module'],
                    });

                    try {
                        await generator.install({
                            target: 'tailwindcss@' + version,
                            subpaths: [
                                './nesting',
                                './resolveConfig',
                                './lib/processTailwindFeatures',
                                './package.json.js'
                            ]
                        });
                        await generator.install('postcss');
                        await generator.install('browserslist');

                        jspm = {
                            map: generator.getMap(),
                        };

                    } catch (err2) {
                        console.error('Failed to generate importmap.');
                        console.error('err1:' + err1);
                        console.error('err2:' + err2);
                        return;
                    }
                }

                // Add node:fs polyfill. This is a temporary solution.
                jspm.map.imports['fs'] = 'https://ga.jspm.io/npm:@jspm/core@2.0.1/nodelibs/browser/fs.js';
                jspm.map.scopes['https://esm.sh/'] = {
                    ...jspm.map.scopes['https://esm.sh/'] || {},
                    'https://esm.sh/v135/node_fs.js': 'https://ga.jspm.io/npm:@jspm/core@2.0.1/nodelibs/browser/fs.js',
                    'https://esm.sh/v136/node_fs.js': 'https://ga.jspm.io/npm:@jspm/core@2.0.1/nodelibs/browser/fs.js',
                };
                
                jspm.generatedAt = new Date().getTime();

                jspmStorage.value[`${version}`] = jspm;
            }

            IframeManager.compilerIframeEl = document.createElement('iframe');
            IframeManager.compilerIframeEl.id = 'windpress-compiler-iframe';

            IframeManager.compilerIframeEl.srcdoc = compilerIframe.replace('<!-- <script type="importmap"></script> -->', `<script type="importmap">${JSON.stringify(jspm.map)}</script>`);
            IframeManager.compilerIframeEl.style.display = 'none';
            document.body.appendChild(IframeManager.compilerIframeEl);
        }

        // Wait for the iframe to be ready. it will send a message to the parent window when it's ready
        if (!IframeManager.compilerIframeReady) {
            await new Promise((resolve) => {
                window.addEventListener('message', (event) => {
                    if (event.source === IframeManager.compilerIframeEl.contentWindow && event.data.type === 'iframe-ready') {
                        IframeManager.compilerIframeReady = true;
                        resolve();
                    }
                });
            });
        }

        return IframeManager.compilerIframeEl;
    }

    static removeCompilerIframe() {
        if (IframeManager.compilerIframeEl) {
            IframeManager.compilerIframeEl.remove();
            IframeManager.compilerIframeEl = null;
        }
    }
}

export async function parseConfig(tw_version, tw_config) {
    const iframe = await IframeManager.getCompilerIframe(tw_version, false);

    const iframeEval = await new Promise(resolve => {
        // add event listener, and remove before resolve
        const listener = (event) => {
            // Check if the message comes from the specific iframe
            if (event.source === iframe.contentWindow && event.data.type === 'action' && event.data.action === 'parse-config') {
                // Process the message from the iframe
                window.removeEventListener('message', listener);
                resolve(event.data);
            }
        };

        window.addEventListener('message', listener, false);

        iframe.contentWindow.postMessage({
            type: 'action',
            action: 'parse-config',
            tw_config,
        }, '*');
    });

    return iframeEval;
}

export async function compileCSS(tw_version, tw_config, main_css, contents) {
    const iframe = await IframeManager.getCompilerIframe(tw_version, true);

    const iframeEval = await new Promise(resolve => {
        // add event listener, and remove before resolve
        const listener = (event) => {
            // Check if the message comes from the specific iframe
            if (event.source === iframe.contentWindow && event.data.type === 'action' && event.data.action === 'compile-css') {
                // Process the message from the iframe
                window.removeEventListener('message', listener);
                resolve(event.data);
            }
        };

        window.addEventListener('message', listener, false);

        iframe.contentWindow.postMessage({
            type: 'action',
            action: 'compile-css',
            tw_config,
            main_css,
            contents,
        }, '*');
    });

    return iframeEval;
}