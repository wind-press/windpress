import './styles/app.scss';
import 'floating-vue/dist/style.css';
import './master.css.js';
import './monaco-editor.js';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import FloatingVue from 'floating-vue';
import InlineSvg from 'vue-inline-svg';
import { FontAwesomeIcon } from './font-awesome.js';

import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor';

import App from './App.vue';
import vRipple from './directives/ripple/ripple.js';

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
    const el = document.createElement('div');
    el.id = 'windpress-app';
    el.classList.add('universal');
    document.body.appendChild(el);

    // app.config.globalProperties.isUniversal = true;
}

app.mount('#windpress-app');