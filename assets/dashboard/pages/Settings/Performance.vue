<script setup lang="ts">
import { onBeforeMount, reactive, ref, watch } from 'vue';
import { useLicenseStore } from '@/dashboard/stores/license';
import { useBusyStore } from '@/dashboard/stores/busy';
import { version as tw4_version } from 'tailwindcss/package.json';
import { version as tw3_version } from 'tailwindcss3/package.json';
import { useSettingsStore } from '@/dashboard/stores/settings';

const appConfig = useAppConfig()

const toast = useToast()

const licenseStore = useLicenseStore()
const settingsStore = useSettingsStore()
const busyStore = useBusyStore()
</script>

<template>

  <UForm id="performance" :state="{}">
    <UPageCard title="Performance" variant="naked" orientation="horizontal" class="mb-4">
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField label="Use cached CSS" description="Serve the CSS file from the cache when available instead of compiling it on the fly." class="flex items-center justify-between gap-4">
        <USwitch v-model="settingsStore.virtualOptions('performance.cache.enabled', false).value" label="Enable Cached CSS" :ui="{ label: 'whitespace-nowrap' }" />
      </UFormField>

      <USeparator />

      <UFormField label="Admin always uses Compiler" description="Exclude the admin from cached CSS and always use the Compiler." class="flex items-center justify-between gap-4">
        <USwitch v-model="settingsStore.virtualOptions('performance.cache.exclude_admin', false).value" label="Exclude Admin" :ui="{ label: 'whitespace-nowrap' }" />
      </UFormField>

      <USeparator />
      <UFormField label="Load cached CSS inline" description="Load cached CSS inline instead of as an external file." class="flex items-center justify-between gap-4">
        <USwitch v-model="settingsStore.virtualOptions('performance.cache.inline_load', false).value" label="Inline Cached CSS" :ui="{ label: 'whitespace-nowrap' }" />
      </UFormField>

      <USeparator />




    </UPageCard>
  </UForm>
</template>