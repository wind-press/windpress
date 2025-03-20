<script setup lang="ts">
import { useLogStore } from '@/dashboard/stores/log';
import dayjs from 'dayjs';
import { nextTick, ref, watch } from 'vue';

const log = useLogStore();

// Scroll to the bottom of the log history panel when new logs are added
const logHistoryPanel = ref<Element | null>(null);
watch(log.logs, () => {
  if (!logHistoryPanel.value) {
    // the parent element of the log history panel is the one that scrolls
    const logsContainer = document.querySelector('.logs-container');
    if (logsContainer) {
      logHistoryPanel.value = logsContainer.parentElement;
    } else {
      return;
    }
  }

  let isScrolledToBottom = logHistoryPanel.value && (logHistoryPanel.value.scrollHeight - logHistoryPanel.value.clientHeight <= logHistoryPanel.value.scrollTop + 1);

  // need to wait for the next tick to ensure the log history panel is rendered
  nextTick(() => {
    if (isScrolledToBottom) {
      if (logHistoryPanel.value) {
        logHistoryPanel.value.scrollTop = logHistoryPanel.value.scrollHeight - logHistoryPanel.value.clientHeight;
      }
    }
  });
});
</script>

<template>
  <UDashboardPanel id="logs" :ui="{ root: 'min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]', body: 'bg-(--ui-text) text-(--ui-bg) dark:text-(--ui-text) dark:bg-(--ui-bg)' }">
    <template #header>
      <UDashboardNavbar title="Logs">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="whitespace-nowrap logs-container">
        <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12  mx-auto">
          <div v-if="log.logs.length > 0" role="group" class="flex flex-col">
            <div v-for="history in log.logs" :key="history.id" class="font-mono">
              <span :title="history.id" class="text-(--ui-bg)/50 dark:text-(--ui-text)/50">[{{ dayjs(history.timestamp).format('HH:mm:ss.SSS') }}]</span>
              <span class="mr-4">
                <span v-if="history.type === 'error'" class="text-(--ui-error)">[ERROR]</span>
                <span v-else-if="history.type === 'warning'" class="text-(--ui-warning)">[WARNING]</span>
                <span v-else-if="history.type === 'info'" class="text-(--ui-info)">[INFO]</span>
                <span v-else-if="history.type === 'success'" class="text-(--ui-success)">[SUCCESS]</span>
                <span v-else-if="history.type === 'debug'" class="">[DEBUG]</span>
              </span>
              <template v-if="history.options?.raw">
                <span v-html="history.message"></span>
              </template>
              <template v-else>
                {{ history.message }}
              </template>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>