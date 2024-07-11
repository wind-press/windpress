<script setup>
import { computed } from 'vue';
import { useLogStore } from '@/dashboard/stores/log';
import { useNotificationStore } from '@/dashboard/stores/notification';

const log = useLogStore();
const notification = useNotificationStore();
const channel = new BroadcastChannel('windpress');

const latestLogMessage = computed(() => {
    return log.logs.length > 0 ? log.logs[log.logs.length - 1].message : `Thank you for using WindPress! Join us on the Facebook Group.`;
});

function rebuildCache() {
    channel.postMessage({
        source: 'any',
        target: 'windpress/dashboard',
        task: 'windpress.generate-cache',
        payload: {
            force_pull: true
        }
    });
}
</script>

<template>
    <div class="status-bar flex fg:statusBar-foreground bg:statusBar-background bt:1|solid|statusBar-border">
        <div class="flex flex:row gap:2 w:full">
            <div class="flex flex-grow:1">
                <div @click="rebuildCache" v-tooltip="{ placement: 'top', content: 'Rebuild Cache' }" class="flex flex:row bg:statusBarItem-remoteBackground fg:statusBarItem-remoteForeground px:12 py:6 align-items:center cursor:pointer" v-ripple>
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
                    <svg class="inline-svg fill:current" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3774 10.5735C13.1262 9.80788 12.9946 9.00633 12.9946 8.19282V6.19493C13.0066 4.92681 12.5639 3.69457 11.7265 2.74946C10.8891 1.79239 9.74057 1.18226 8.48441 1.02673C7.79054 0.954953 7.08469 1.02673 6.41474 1.25404C5.74479 1.46938 5.13466 1.82828 4.62023 2.30682C4.1058 2.77339 3.68709 3.34764 3.41193 3.9817C3.13677 4.61576 2.98124 5.29767 2.98124 6.00351V8.20478C2.98124 9.00633 2.84965 9.80788 2.59841 10.5735L2.00024 12.3441L2.47878 13.0021H5.98406C5.98406 13.5285 6.1994 14.0429 6.57027 14.4138C6.94113 14.7847 7.45556 15 7.98195 15C8.50834 15 9.02277 14.7847 9.39363 14.4138C9.7645 14.0429 9.97984 13.5285 9.97984 13.0021H13.4851L13.9637 12.3441L13.3774 10.5735ZM8.68779 13.7199C8.49638 13.9113 8.24515 14.019 7.98195 14.019C7.71876 14.019 7.46752 13.9113 7.27611 13.7199C7.08469 13.5285 6.97702 13.2773 6.97702 13.0141H8.97491C8.98688 13.2773 8.87921 13.5285 8.68779 13.7199ZM3.17266 12.0091L3.54352 10.8965C3.83065 10.0232 3.98617 9.114 3.98617 8.20478V6.00351C3.98617 5.44123 4.1058 4.89092 4.33311 4.38845C4.56041 3.87403 4.88343 3.41942 5.30215 3.04855C5.72087 2.66572 6.21137 2.3786 6.73776 2.21111C7.27611 2.03166 7.83839 1.97184 8.38871 2.03166C9.39363 2.16326 10.3268 2.66572 10.9848 3.43138C11.6547 4.19704 12.0017 5.19 11.9897 6.20689V8.21675C11.9897 9.12596 12.1333 10.0352 12.4323 10.9085L12.8032 12.0211H3.17266V12.0091Z" fill="current" />
                    </svg>
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
