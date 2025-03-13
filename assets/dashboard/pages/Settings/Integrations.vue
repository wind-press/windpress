<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useSettingsStore } from '@/dashboard/stores/settings';
import { useApi } from '@/dashboard/library/api';

const settingsStore = useSettingsStore()
const api = useApi();

interface Provider {
  id: string;
  name: string;
  description: string;
}

const providers = ref<Provider[]>([]);

async function pullProviders() {
  await api
    .get('admin/settings/cache/providers')
    .then((resp) => {
      providers.value = resp.data.providers.sort((a: Provider, b: Provider) => a.id.localeCompare(b.id));
    });
}

onBeforeMount(() => {
  pullProviders();
});
</script>

<template>
  <UForm id="integrations" :state="{}">
    <UPageCard title="Integrations" description="Enable or disable integrations with other services." variant="naked" class="mb-4">
    </UPageCard>
    <UPageCard variant="subtle" :ui="{ container: 'divide-y divide-(--ui-border)' }">
      <UFormField v-for="provider in providers" :key="provider.id" :name="provider.id" :label="provider.name" :description="provider.description" class="flex items-center justify-between not-last:pb-4 gap-4">
        <USwitch v-model="settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value" :label="`[${provider.id}]`" :ui="{ label: 'whitespace-nowrap text-(--ui-text-muted) font-normal' }" class="flex-row-reverse gap-2" />
      </UFormField>
    </UPageCard>
  </UForm>
</template>