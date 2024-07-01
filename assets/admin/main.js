import './styles/app.scss';
import 'floating-vue/dist/style.css';
import './master.css.js';
import './monaco-editor.js';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import FloatingVue from 'floating-vue';
import InlineSvg from 'vue-inline-svg';
import { FontAwesomeIcon } from './font-awesome.js';
import VueSelect from 'vue-select';

import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor';

import App from './App.vue';
import vRipple from './directives/ripple/ripple.js';

const pinia = createPinia();
const app = createApp(App);

app.config.globalProperties.windpress = window.windpress;

// https://github.com/lightvue/lightvue/blob/d3219dd658e960c85a27ad151bd0ba65c68993a7/docs-v3/src/main.js#L12
// app.config.globalProperties.$listeners = '';
// app.config.globalProperties.$lightvue = { ripple: true, version: 3 };

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
    .component('VueSelect', VueSelect)
    ;

app.directive('ripple', vRipple);

app.mount('#windpress-app');