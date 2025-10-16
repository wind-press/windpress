<script setup lang="ts">
import { __ } from '@wordpress/i18n';
import { onBeforeMount, ref } from 'vue';
import { useBusyStore } from '@/dashboard/stores/busy';
import { useSettingsStore } from '@/dashboard/stores/settings';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { useApi } from '@/dashboard/library/api';
import { generateCache } from '@/dashboard/composables/useGenerateCache';

const api = useApi();
const toast = useToast();

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

async function doGenerateCache() {
  generateCache((res) => {
    pullCacheInfo();
  });
}

onBeforeMount(() => {
  pullCacheInfo();
});
</script>

<template>
  <UForm id="performance" :state="{}">
    <UPageCard :title="i18n.__('Performance', 'windpress')" variant="naked" orientation="horizontal" class="mb-4">
    </UPageCard>
    <UPageCard variant="subtle">
      <UFormField :label="i18n.__('Use cached CSS', 'windpress')" :description="i18n.__('Serve the cached CSS file when available instead of generating the style dynamically using the Compiler.', 'windpress')" class="flex items-center justify-between gap-4">
        <USwitch v-model="settingsStore.virtualOptions('performance.cache.enabled', false).value" :label="i18n.__('Enable Cached CSS', 'windpress')" :ui="{ label: 'whitespace-nowrap' }" class="flex-row-reverse gap-2" />
      </UFormField>
      <USeparator />
      <UFormField :label="i18n.__('Admin always uses Compiler', 'windpress')" :description="i18n.__('Exclude the Admin from the cached CSS to ensure they always use the Compiler.', 'windpress')" class="flex items-center justify-between gap-4">
        <USwitch v-model="settingsStore.virtualOptions('performance.cache.exclude_admin', false).value" :label="i18n.__('Exclude Admin', 'windpress')" :ui="{ label: 'whitespace-nowrap' }" class="flex-row-reverse gap-2" />
      </UFormField>
      <USeparator />
      <UFormField :label="i18n.__('Cached CSS loading method', 'windpress')" :description="i18n.__('Load cached CSS as an inline instead of an external file.', 'windpress')" class="flex items-center justify-between gap-4">
        <USwitch v-model="settingsStore.virtualOptions('performance.cache.inline_load', false).value" :label="i18n.__('Inline Cached CSS', 'windpress')" :ui="{ label: 'whitespace-nowrap' }" class="flex-row-reverse gap-2" />
      </UFormField>
      <USeparator />
      <template v-if="settingsStore.virtualOptions('general.tailwindcss.version', 4).value === 4">
        <UFormField :label="i18n.__('Generate source map', 'windpress')" :description="i18n.__('Generate the source map for the cached CSS file.', 'windpress')" class="flex items-center justify-between gap-4">
          <USwitch v-model="settingsStore.virtualOptions('performance.cache.source_map', false).value" :label="i18n.__('Enable Source Map', 'windpress')" :ui="{ label: 'whitespace-nowrap' }" class="flex-row-reverse gap-2" />
        </UFormField>
        <USeparator />
      </template>
      <UFormField :label="i18n.__('Generate the cached CSS', 'windpress')" class="flex items-center justify-between gap-4">
        <template #description v-if="css_cache.last_generated">
          <div class="flex gap-2 items-center">
            <div class="flex gap-2 items-center">
              <span class="font-semibold"> {{ i18n.__('Last Generated', 'windpress') }}: </span>
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
        <UTooltip :delay-duration="0" :text="i18n.__('Generate the cached CSS file', 'windpress')">
          <UButton color="primary" variant="subtle" @click="doGenerateCache" :disabled="busyStore.isBusy" :loading="busyStore.isBusy && busyStore.hasTask('settings.performance.cached_css.generate')">
            {{ busyStore.isBusy && busyStore.hasTask('settings.performance.cached_css.generate') ? i18n.__('Generating...', 'windpress') : i18n.__('Generate', 'windpress') }}
          </UButton>
        </UTooltip>
      </UFormField>
    </UPageCard>
  </UForm>
</template>