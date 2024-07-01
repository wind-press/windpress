<script setup>
import { storeToRefs } from 'pinia';
import { useWordpressNoticeStore } from '../stores/wordpressNotice';

const store = useWordpressNoticeStore();
const { notices } = storeToRefs(store);
</script>

<template>
    <TransitionGroup name="notice">
        <div v-for="notice in notices" :key="notice.id" :class="`notice notice-${notice.type} is-dismissible`" class="my:10">
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

<style lang="scss">
.awn-toast-icon {
    >div {
        width: 44px;

        >svg {
            font-size: 44px;
        }
    }

    .icon-async {
        animation: spin 2s linear infinite;

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }

            100% {
                transform: rotate(360deg);
            }
        }
    }
}

.awn-toast-label {
    margin-bottom: 6px;
}
</style>