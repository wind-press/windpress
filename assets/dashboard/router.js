import { createWebHistory, createRouter } from 'vue-router'

const router = createRouter({
    history: createWebHistory(`${windpress.web_history}#/`),
    scrollBehavior(_, _2, savedPosition) {
        return savedPosition || { left: 0, top: 0 };
    },
    routes: [
        { path: '/', name: 'home', redirect: { name: 'files' } },
        {
            name: 'files',
            path: '/files',
            component: () => import('./pages/Files.vue'),
        },

        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('./pages/NotFound.vue'),
        },
    ],
});

export default router;