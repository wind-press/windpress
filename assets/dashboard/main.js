import './styles/wp-admin.css'
import './styles/tailwind.css'

import './wp-admin.js';

import { createApp } from 'vue'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import router from './router.js';

const app = createApp(App)

app.use(router)
app.use(ui)

app.mount('#windpress-app')


