import './styles/main.css'

import './wp-admin';

import('./monaco-editor'); // Vite: Using dynamic import() to code-split the application

import { createApp } from 'vue'
import { createPinia, PiniaPluginContext } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor';

import App from './App.vue'
import router from './router';

const app = createApp(App)
const pinia = createPinia()

app.config.globalProperties.window = window;

// Pinia plugin: Initialize the store with the data from the server.
pinia.use(({ store }: PiniaPluginContext) => {
    if (['volume', 'settings'].includes(store.$id)) {
        store.initPull();
    }

    if (store.$id === 'log') {
        store.add({
            type: 'debug',
            message: `Thank you for using WindPress! Join us on the Facebook Group: <a href="https://wind.press/go/facebook" target="_blank" class="underline">https://wind.press/go/facebook</a>`,
            options: {
                raw: true
            }
        })
    }
})

app
    .use(router)
    .use(ui)
    .use(pinia)
    .use(VueMonacoEditorPlugin)

app.mount('#windpress-app')


