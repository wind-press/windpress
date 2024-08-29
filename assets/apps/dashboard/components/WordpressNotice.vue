<script setup>
import { __ } from '@wordpress/i18n';
import { storeToRefs } from 'pinia';
import { useNoticeStore } from '@/dashboard/stores/notice';

const store = useNoticeStore();
const { notices } = storeToRefs(store);
</script>

<template>
    <TransitionGroup name="notice">
        <div v-for="notice in notices" :key="notice.id" :class="`notice windpress-notice notice-${notice.type} is-dismissible`" class="my:10">
            <div v-html="notice.message"></div>
            <button type="button" @click="store.remove(notice.id)" class="notice-dismiss">
                <span class="screen-reader-text">{{ __('Dismiss this notice.', 'windpress') }}</span>
            </button>
        </div>
    </TransitionGroup>
</template>

<style scoped>
.notice-enter-active,
.notice-leave-active {
    transition: transform 0.4s, opacity 0.6s;
}

.notice-enter-from,
.notice-leave-to {
    opacity: 0;
    transform: scale(0.88);
}
</style>