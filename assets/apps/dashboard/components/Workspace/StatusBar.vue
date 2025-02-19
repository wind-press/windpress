<script setup>
import { __ } from '@wordpress/i18n';
import dayjs from 'dayjs';
import { computed, nextTick, ref, watch } from 'vue';
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

// Scroll to the bottom of the log history panel when new logs are added
const logHistoryPanel = ref(null);
watch(log.logs, () => {
    if (logHistoryPanel.value) {
        let isScrolledToBottom = logHistoryPanel.value.scrollHeight - logHistoryPanel.value.clientHeight <= logHistoryPanel.value.scrollTop + 1;
        // need to wait for the next tick to ensure the log history panel is rendered
        nextTick(() => {
            if (isScrolledToBottom) {
                logHistoryPanel.value.scrollTop = logHistoryPanel.value.scrollHeight - logHistoryPanel.value.clientHeight;
            }
        });

    }
});
</script>

<template>
    <div class="status-bar flex fg:statusBar-foreground bg:statusBar-background bt:1|solid|statusBar-border">
        <div class="flex flex:row gap:2 w:full">
            <div class="flex flex-grow:1">
                <div @click="rebuildCache" v-tooltip="{ placement: 'top', content: wp_i18n.__('Rebuild Cache', 'windpress') }" class="flex flex:row bg:statusBarItem-remoteBackground fg:statusBarItem-remoteForeground px:12 py:6 align-items:center cursor:pointer" v-ripple>
                    <i-octicon-cache-24 class="iconify" />
                </div>
            </div>
            <div class="flex flex:row px:12 py:6 gap:12 rel">
                <VDropdown placement="top-end" class="sidebar-nav-item help" :autoHide="false" v-tooltip="{ placement: 'top', content: wp_i18n.__('Log', 'windpress') }">
                    <div class="status-bar__log rel flex align-items:center leading:normal fg:statusBar-foreground/.7 overflow:hidden">
                        <Transition mode="out-in" name="slide-up">
                            <span :key="latestLogMessage" class="leading:normal user-select:none cursor:pointer">
                                {{ latestLogMessage }}
                            </span>
                        </Transition>
                    </div>

                    <template #popper>
                        <div>
                            <div ref="logHistoryPanel" v-if="log.logs.length > 0" role="group" class="flex flex:column bg:editor-background font:14 text:foreground min-w:120 p:4 w:auto max-w:900 max-h:300 overflow:auto">
                                <div v-for="history in log.logs" :key="history.id" class="font:mono">
                                    <span :title="history.id" class="text:foreground/.5">[{{ new dayjs(history.timestamp).format('HH:mm:ss.SSS') }}]</span>
                                    <span>
                                        <span v-if="history.type === 'error'" class="text:red">[ERROR]</span>
                                        <span v-else-if="history.type === 'warning'" class="text:yellow">[WARNING]</span>
                                        <span v-else-if="history.type === 'info'" class="text:blue">[INFO]</span>
                                        <span v-else-if="history.type === 'success'" class="text:green">[SUCCESS]</span>
                                        <span v-else-if="history.type === 'debug'" class="text:gray">[DEBUG]</span>
                                    </span>
                                    {{ history.message }}
                                </div>
                            </div>
                        </div>
                    </template>
                </VDropdown>

                <div v-tooltip="{ placement: 'top', content: `${notification.notices.length} Notifications` }" class="status-bar__notification flex flex:row align-items:center cursor:pointer">
                    <i-line-md-bell-alert-loop class="iconify fill:current" />
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
