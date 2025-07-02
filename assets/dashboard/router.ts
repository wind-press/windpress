import { createWebHistory, createRouter } from 'vue-router'

const router = createRouter({
    history: createWebHistory(`${window.windpress.site_meta.web_history}#/`),
    scrollBehavior(_, _2, savedPosition) {
        return savedPosition || { left: 0, top: 0 };
    },
    routes: [
        { path: '/', name: 'home', redirect: { name: 'files' } },
        {
            path: '/files',
            name: 'files',
            component: () => import('./pages/File.vue'),
        },
        {
            path: '/logs',
            name: 'logs',
            component: () => import('./pages/Log.vue'),
        },
        {
            path: '/wizard',
            name: 'wizard',
            component: () => import('./pages/Wizard.vue'),
        },
        {
            path: '/settings',
            name: 'settings',
            redirect: { name: 'settings.general' },
            component: () => import('./pages/Settings.vue'),
            children: [
                {
                    path: '/general',
                    name: 'settings.general',
                    component: () => import('./pages/Settings/General.vue')
                },
                {
                    path: '/performance',
                    name: 'settings.performance',
                    component: () => import('./pages/Settings/Performance.vue')
                },
                {
                    path: '/integrations',
                    name: 'settings.integrations',
                    component: () => import('./pages/Settings/Integrations.vue')
                },
            ],
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('./pages/NotFound.vue'),
        },
    ],
});

export default router;