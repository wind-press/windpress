import './styles/app.scss';
import 'floating-vue/dist/style.css';
import './master.css.js';
import './monaco-editor.js';

import { createApp, watch } from 'vue';
import { createPinia } from 'pinia';
import FloatingVue from 'floating-vue';
import InlineSvg from 'vue-inline-svg';
import { FontAwesomeIcon } from './font-awesome.js';

import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor';

import App from './App.vue';
import vRipple from './directives/ripple/ripple.js';
import { useUIStore } from './stores/ui.js';

const pinia = createPinia();
const app = createApp(App);

app.config.globalProperties.windpress = window.windpress;

app
    .use(pinia)
    .use(FloatingVue, {
        container: '#windpress-app',
    })
    .use(VueMonacoEditorPlugin)
    ;

app
    .component('font-awesome-icon', FontAwesomeIcon)
    .component('inline-svg', InlineSvg)
    ;

app.directive('ripple', vRipple);

// find a container element to mount the app, if not found, create one
if (!document.getElementById('windpress-app')) {
    // create an iframe
    const iframe = document.createElement('iframe');

    // set the iframe attributes
    iframe.setAttribute('id', 'windpress-iframe');

    // create an HTML document for the iframe src
    const doc = document.implementation.createHTMLDocument('windpress');

    // find all stylesheets in the parent document with id starting with 'windpress', and append them to the iframe
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"][id^="windpress"]');

    // append the stylesheets to the iframe
    stylesheets.forEach((stylesheet) => {
        // clone the stylesheet element and append it to the iframe
        const clone = stylesheet.cloneNode(true);
        doc.head.appendChild(clone);
    });

    // find all scripts in the parent document with id starting with 'windpress', and append them to the iframe
    const scripts = document.querySelectorAll('script[id^="windpress"]');
    scripts.forEach((script) => {
        // if id contain 'observer', skip
        if (script.id.includes('observer') || script.id.includes('autocomplete')) {
            return;
        }

        // clone the script element and append it to the iframe
        const clone = script.cloneNode(true);
        doc.body.appendChild(clone);
    });

    // add the windpress-app div to the iframe
    const windpressApp = document.createElement('div');
    windpressApp.id = 'windpress-app';
    windpressApp.classList.add('universal');
    doc.body.appendChild(windpressApp);

    // set the iframe srcdoc
    iframe.srcdoc = doc.documentElement.outerHTML;

    // append the iframe to the body
    document.body.appendChild(iframe);

    const ui = useUIStore();

    if (ui.virtualState('window.minimized', false).value === false) {
        iframe.classList.add('expanded');
    }

    watch(() => ui.virtualState('window.minimized', false).value, (state) => {
        if (!state) {
            iframe.classList.add('expanded');
        } else {
            iframe.classList.remove('expanded');
        }
    });
} else {
    app.mount('#windpress-app');
}
