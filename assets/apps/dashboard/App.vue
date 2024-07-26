<script setup>
import Logo from '~/windpress.svg';
import { useUIStore } from './stores/ui';
import { buildCache } from './components/compiler.js';
import { useBusyStore } from './stores/busy';
import { useNotifier } from './library/notifier';

import WorkspacePage from './pages/WorkspacePage.vue';

const ui = useUIStore();
const notifier = useNotifier();
const busyStore = useBusyStore();
const channel = new BroadcastChannel('windpress');

channel.addEventListener('message', async (e) => {
    const data = e.data;
    const source = 'any';
    const target = 'windpress/dashboard';
    const task = 'windpress.generate-cache';

    if (data.target === target && data.task === task) {
        busyStore.add('settings.performance.cached_css.generate');

        const promise = buildCache(data.payload || {});

        promise.finally(() => {
            busyStore.remove('settings.performance.cached_css.generate');
            channel.postMessage({
                source: 'windpress/dashboard',
                target: 'windpress/dashboard',
                task: 'windpress.settings.cache.info.pull'
            });
        });

        notifier.async(
            promise,
            resp => {
                notifier.success('Cache generated and stored');
            },
            err => {
                notifier.alert('Failed to generate cache');
                console.error('err', err);
            },
            'Generating cache...',
        );
    }
});
</script>

<template>
    <div :class="{ 'hide-universal': ui.virtualState('window.minimized', false).value }" class="windpress-container my:40 px:40 font:13 h:calc(100vh-80px-var(--wp-admin--admin-bar--height))">
        <WorkspacePage />
    </div>
    <div v-if="windpress.is_universal" :class="{ hidden: ui.virtualState('window.minimized', false).value === false }" class="windpress-badge fixed bottom:0 right:0">
        <div @click="ui.virtualState('window.minimized', false).value = !ui.virtualState('window.minimized', false).value" class="cursor:pointer:hover fg:black">
            <inline-svg :src="Logo" class="inline-svg fill:current font:28" />
        </div>
    </div>
</template>
