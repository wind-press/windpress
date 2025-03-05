import { createWebHistory, createRouter } from 'vue-router'

const router = createRouter({
    history: createWebHistory(`${windpress.web_history}#/`),
    scrollBehavior(_, _2, savedPosition) {
        return savedPosition || { left: 0, top: 0 };
    },
    routes: [
      { path: '/', component: () => import('./pages/index.vue') },
    ],
});

export default router;