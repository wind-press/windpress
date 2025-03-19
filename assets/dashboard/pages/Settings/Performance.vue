<script setup lang="ts">
import { onBeforeMount, reactive, ref, watch } from 'vue';
import { useBusyStore } from '@/dashboard/stores/busy';
import { useSettingsStore } from '@/dashboard/stores/settings';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { useApi } from '@/dashboard/library/api';
import prettyMilliseconds from 'pretty-ms';
import type { BuildCacheOptions } from '@/packages/core/windpress/compiler';

const api = useApi();
const toast = useToast();

const settingsStore = useSettingsStore()
const busyStore = useBusyStore()

const channel = new BroadcastChannel('windpress');

type CSS_Cache = {
  last_generated: number | null;
  last_full_build: number | null;
  file_url: string | null;
  file_size: number | null;
};

const css_cache = ref<CSS_Cache>({
  last_generated: null,
  last_full_build: null,
  file_url: null,
  file_size: null,
});

function pullCacheInfo() {
  api
    .get('admin/settings/cache/index')
    .then((resp: { data: { cache: CSS_Cache } }) => {
      css_cache.value = resp.data.cache;
    });
}

function doGenerateCache() {
  busyStore.add('settings.performance.cached_css.generate');

  const toastData: Omit<Partial<Toast>, "id"> = {
    title: 'Generating cache...',
    description: 'Please wait while we generate the CSS cache.',
    duration: 0,
    icon: 'lucide:loader-circle',
    close: false,
    color: 'neutral',
    ui: {
      icon: 'animate-spin',
    }
  };

  if (toast.toasts.value.find(t => t.id === 'worker.doGenerateCache')) {
    toast.update('worker.doGenerateCache', {
      ...toastData
    });
  } else {
    toast.add({
      id: 'worker.doGenerateCache',
      ...toastData
    });
  }


  let timeStart = performance.now();
  let timeEnd = timeStart;

  channel.postMessage({
    task: 'generate-cache',
    source: 'windpress/dashboard',
    target: 'windpress/compiler',
    data: {
      tailwindcss_version: Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value),
    } as BuildCacheOptions
  });

  channel.addEventListener('message', (event) => {
    const data = event.data;
    const source = 'windpress/compiler';
    const target = 'windpress/dashboard';
    if (data.source === source && data.target === target && data.task === 'generate-cache.response') {
      busyStore.remove('settings.performance.cached_css.generate');
      pullCacheInfo();

      timeEnd = performance.now();

      if (data.data.status === 'success') {
        toast.update('worker.doGenerateCache', {
          title: 'Generated',
          description: `Cache generated in ${prettyMilliseconds(timeEnd - timeStart)}.`,
          icon: 'lucide:codesandbox',
          color: 'success',
          duration: undefined,
          close: true,
          ui: {
            icon: undefined,
          }
        });
      } else if (data.data.status === 'error') {
        toast.update('worker.doGenerateCache', {
          title: 'Error',
          description: `An error occurred while generating the CSS cache. Check the Browser's Console for more information`,
          icon: 'lucide:codesandbox',
          color: 'error',
          duration: undefined,
          close: true,
          ui: {
            icon: undefined,
          }
        });
      }
    }
  });
}

onBeforeMount(() => {
  pullCacheInfo();
});
</script>

<template>
  <UForm id="performance" :state="{}">
    <UPageCard title="Performance" variant="naked" orientation="horizontal" class="mb-4">
    </UPageCard>
    <UPageCard variant="subtle">
      <UFormField label="Use cached CSS" description="Serve the cached CSS file when available instead of generating the style dynamically using the Compiler.." class="flex items-center justify-between gap-4">
        <USwitch v-model="settingsStore.virtualOptions('performance.cache.enabled', false).value" label="Enable Cached CSS" :ui="{ label: 'whitespace-nowrap' }" class="flex-row-reverse gap-2" />
      </UFormField>
      <USeparator />
      <UFormField label="Admin always uses Compiler" description="Exclude the Admin from the cached CSS to ensure they always use the Compiler." class="flex items-center justify-between gap-4">
        <USwitch v-model="settingsStore.virtualOptions('performance.cache.exclude_admin', false).value" label="Exclude Admin" :ui="{ label: 'whitespace-nowrap' }" class="flex-row-reverse gap-2" />
      </UFormField>
      <USeparator />
      <UFormField label="Cached CSS loading method" description="Load cached CSS as an inline instead of an external file." class="flex items-center justify-between gap-4">
        <USwitch v-model="settingsStore.virtualOptions('performance.cache.inline_load', false).value" label="Inline Cached CSS" :ui="{ label: 'whitespace-nowrap' }" class="flex-row-reverse gap-2" />
      </UFormField>
      <USeparator />
      <UFormField label="Generate the cached CSS" class="flex items-center justify-between gap-4">
        <template #description v-if="css_cache.last_generated">
          <div class="flex gap-2 items-center">
            <div class="flex gap-2 items-center">
              <span class="font-semibold">Last Generated: </span>
              <span v-if="css_cache.file_size" class="flex gap-1">
                {{ dayjs(css_cache.last_generated * 1000).format('YYYY-MM-DD HH:mm:ss') }}
                <ULink :to="css_cache.file_url" target="_blank" class="underline">
                  <UIcon name="lucide:external-link" />
                </ULink>
              </span>
            </div>
            <UBadge v-if="css_cache.file_size" color="success" variant="subtle"> {{ prettyBytes(css_cache.file_size, { maximumFractionDigits: 2, space: true }) }} </UBadge>
          </div>
        </template>
        <UTooltip :delay-duration="0" text="Generate the cached CSS file">
          <UButton color="primary" variant="subtle" @click="doGenerateCache" :disabled="busyStore.isBusy" :loading="busyStore.isBusy && busyStore.hasTask('settings.performance.cached_css.generate')">
            {{ busyStore.isBusy && busyStore.hasTask('settings.performance.cached_css.generate') ? 'Generating...' : 'Generate' }}
          </UButton>
        </UTooltip>
      </UFormField>
    </UPageCard>
  </UForm>
</template>