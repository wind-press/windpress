<script setup>
import { __ } from '@wordpress/i18n';
import { computed } from 'vue';
import { useLogStore } from '@/dashboard/stores/log';
import { useNotificationStore } from '@/dashboard/stores/notification';
import { useSettingsStore } from '@/dashboard/stores/settings';

const log = useLogStore();
const notification = useNotificationStore();
const settingsStore = useSettingsStore();
const channel = new BroadcastChannel('windpress');

const latestLogMessage = computed(() => {
    return log.logs.length > 0 ? log.logs[log.logs.length - 1].message : __('Thank you for using WindPress! Join us on the Facebook Group.', 'windpress');
});

function rebuildCache() {
    channel.postMessage({
        source: 'any',
        target: 'windpress/dashboard',
        task: 'windpress.generate-cache',
        payload: {
            force_pull: true,
            tailwindcss_version: Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value)
        }
    });
}
</script>

<template>
    <div class="status-bar flex fg:statusBar-foreground bg:statusBar-background bt:1|solid|statusBar-border">
        <div class="flex flex:row gap:2 w:full">
            <div class="flex flex-grow:1">
                <div @click="rebuildCache" v-tooltip="{ placement: 'top', content: wp_i18n.__('Rebuild Cache', 'windpress') }" class="flex flex:row bg:statusBarItem-remoteBackground fg:statusBarItem-remoteForeground px:12 py:6 align-items:center cursor:pointer" v-ripple>
                    <font-awesome-icon :icon="['fas', 'broom']" />
                </div>
            </div>
            <div class="flex flex:row px:12 py:6 gap:12 rel">
                <div class="status-bar__log rel flex align-items:center leading:normal fg:statusBar-foreground/.7 overflow:hidden">
                    <Transition mode="out-in" name="slide-up">
                        <span :key="latestLogMessage" class="leading:normal">
                            {{ latestLogMessage }}
                        </span>
                    </Transition>
                </div>

                <div v-tooltip="{ placement: 'top', content: `${notification.notices.length} Notifications` }" class="status-bar__notification flex flex:row align-items:center cursor:pointer">
                    <i-line-md-bell-alert-loop class="fill:current" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.25s ease-out;
}

.slide-up-enter-from {
    opacity: 0;
    transform: translateY(15px);
}

.slide-up-leave-to {
    opacity: 0;
    transform: translateY(-15px);
}
</style>
