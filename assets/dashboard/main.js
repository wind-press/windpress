import './styles/main.css'

import './wp-admin.js';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import router from './router.js';

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(ui)
app.use(pinia)

app.mount('#windpress-app')


