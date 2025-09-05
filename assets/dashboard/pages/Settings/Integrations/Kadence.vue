<script setup lang="ts">
import { useSettingsStore } from '@/dashboard/stores/settings';

const settingsStore = useSettingsStore();
</script>

<template>
  <UDashboardPanel id="integration-kadence-settings" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
    <UDashboardNavbar :title="i18n.__('Kadence WP Settings', 'windpress')" :toggle="false" :ui="{ title: 'text-sm', root: 'border-none' }">
      <template #leading>
        <UTooltip :text="i18n.__('Back to Integrations', 'windpress')">
          <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" :to="{ name: 'settings.integrations' }" />
        </UTooltip>
      </template>

      <template #title>
        <UIcon name="i-lucide-package" class="size-5" />
        {{ i18n.__('Kadence WP Settings', 'windpress') }}
        <UBadge variant="soft" color="primary">@kadence</UBadge>
      </template>

      <template #right>
        <UTooltip :text="i18n.__('Help', 'windpress')">
          <UButton icon="i-lucide-circle-help" color="neutral" variant="soft" to="https://wind.press/docs/guide/integrations/kadence" target="_blank" />
        </UTooltip>
      </template>
    </UDashboardNavbar>

    <div class="flex-1 overflow-y-auto p-4">
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Compile Integration -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-cpu" class="size-5 text-primary" />
                <h3 class="text-sm font-medium">{{ i18n.__('Compile Integration', 'windpress') }}</h3>
                <UTooltip :text="i18n.__('Help', 'windpress')">
                  <UButton icon="i-lucide-circle-help" color="neutral" size="sm" variant="soft" to="https://wind.press/docs/guide/integrations/kadence" target="_blank" />
                </UTooltip>
              </div>
              <USwitch v-model="settingsStore.virtualOptions(`integration.kadence.compile.enabled`, true).value" />
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-muted">
              {{ i18n.__('Enable CSS compilation for Kadence WP theme and blocks. This processes Tailwind classes found in Kadence content and generates the necessary CSS. Requires the Gutenberg/Block Editor integration to be enabled.', 'windpress') }}
            </p>
          </div>
        </UCard>
      </div>
    </div>
  </UDashboardPanel>
</template>