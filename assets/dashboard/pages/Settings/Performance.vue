<script setup lang="ts">
import { onBeforeMount, reactive, ref, watch } from 'vue';
import { useBusyStore } from '@/dashboard/stores/busy';
import { useSettingsStore } from '@/dashboard/stores/settings';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { useApi } from '@/dashboard/library/api';

const toast = useToast()
const api = useApi();

const settingsStore = useSettingsStore()
const busyStore = useBusyStore()

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
  setTimeout(() => busyStore.remove('settings.performance.cached_css.generate'), 2000);
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