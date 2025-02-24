import './styles/app.css';
import('./monaco-editor.js'); //

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import FloatingVue from 'floating-vue';
import InlineSvg from 'vue-inline-svg';
import { __, sprintf } from '@wordpress/i18n';
import { createRouter, createWebHistory } from 'vue-router';
import nuxtUiPro from '@nuxt/ui-pro/vue-plugin';

import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor';

import App from './App.vue';

// if in iframe, access the parent window's wp object
if (window.self !== window.top) {
    if (!window.wp && window.top.wp) {
        window.wp = window.top.wp;
    }

    if (!window.windpress && window.top.windpress) {
        window.windpress = window.top.windpress;
    }
}


const pinia = createPinia();
const app = createApp(App);

app.config.globalProperties.wp_i18n = {
    __,
    sprintf,
};
app.config.globalProperties.windpress = window.windpress;


const router = createRouter({
    routes: [],
    history: createWebHistory()
})

app
    .use(router)
    .use(nuxtUiPro)
    .use(pinia)
    .use(FloatingVue, {
        container: '#windpress-app',
    })
    .use(VueMonacoEditorPlugin)
    ;


app
    .component('inline-svg', InlineSvg)
    ;



app.mount('#windpress-app');