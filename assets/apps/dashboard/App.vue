<script setup>
import prettyMilliseconds from 'pretty-ms';

import Logo from '~/windpress.svg';
import { useUIStore } from './stores/ui';
import { buildCache } from './components/compiler.js';
import { useBusyStore } from './stores/busy';
import { useNotifier } from './library/notifier';

import WorkspacePage from './pages/WorkspacePage.vue';
import WordpressNotice from './components/WordpressNotice.vue';
import { ref } from 'vue';

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
        let timeStart = performance.now();
        let timeEnd = timeStart;

        busyStore.add('settings.performance.cached_css.generate');

        const promise = buildCache(data.payload || {});

        promise.finally(() => {
            timeEnd = performance.now();
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
                notifier.success(`Cache generated in <b>${prettyMilliseconds(timeEnd - timeStart)}</b>`);
            },
            err => {
                notifier.alert('Failed to generate cache');
                console.error('err', err);
            },
            'Generating cache...',
        );
    }
});

const askForReview = localStorage.getItem('windpress-ask-for-review') ?? -1;
const isAskForReview = ref(askForReview === -1 || (askForReview !== 'done' && askForReview !== 'never' && new Date() > new Date(askForReview)));
const askForReviewClick = (action) => {
    localStorage.setItem('windpress-ask-for-review', action);

    if (action === 'done') {
        window.open('https://wordpress.org/support/plugin/windpress/reviews/?filter=5/#new-post', '_blank');
    } else if (action === 'later') {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        localStorage.setItem('windpress-ask-for-review', date);
    }

    isAskForReview.value = false;
};
</script>

<template>
    <div :class="{ 'hide-universal': ui.virtualState('window.minimized', false).value }" class="windpress-container my:40 px:40 font:13 h:calc(100vh-80px-var(--wp-admin--admin-bar--height))">
        <!-- Ask for reviews -->
        <div v-if="!windpress.is_universal && isAskForReview" class="notice windpress-notice notice-info my:10">
            <p v-html="wp_i18n.sprintf(
                wp_i18n.__('%sWindPress%s will always try to make you smile. If you smile, please consider giving us a %s rating. It would mean a lot to us!', 'windpress'),
                '<strong>',
                '</strong>',
                '<span class=&quot;fg:yellow-50&quot;>★★★★★</span>'
            )"></p>
            <p>
                <button @click="askForReviewClick('done')" class="button button-primary">
                    <font-awesome-icon :icon="['fas', 'face-smile-hearts']" />
                    {{ wp_i18n.__('OK, you deserve it!', 'windpress') }}
                </button>
                <button @click="askForReviewClick('later')" class="button button-secondary float:right ml:8">
                    <font-awesome-icon :icon="['fas', 'hourglass-clock']" />
                    {{ wp_i18n.__('Maybe later', 'windpress') }}
                </button>
                <button @click="askForReviewClick('never')" class="button button-link button-link-delete float:right">
                    {{ wp_i18n.__('Never ask again', 'windpress') }}
                </button>
            </p>
        </div>
        <WordpressNotice v-if="!windpress.is_universal" />
        <WorkspacePage />
    </div>
    <div v-if="windpress.is_universal" :class="{ hidden: ui.virtualState('window.minimized', false).value === false }" class="windpress-badge fixed bottom:0 right:0">
        <div @click="ui.virtualState('window.minimized', false).value = !ui.virtualState('window.minimized', false).value" class="cursor:pointer:hover fg:black">
            <inline-svg :src="Logo" class="inline-svg fill:current font:28" />
        </div>
    </div>
</template>
