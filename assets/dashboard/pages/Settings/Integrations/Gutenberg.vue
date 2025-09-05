<script setup lang="ts">
import { useSettingsStore } from '@/dashboard/stores/settings';

const settingsStore = useSettingsStore();
</script>

<template>
  <UDashboardPanel id="integration-gutenberg-settings" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
    <UDashboardNavbar :title="i18n.__('Gutenberg Settings', 'windpress')" :toggle="false" :ui="{ title: 'text-sm', root: 'border-none' }">
      <template #leading>
        <UTooltip :text="i18n.__('Back to Integrations', 'windpress')">
          <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" :to="{ name: 'settings.integrations' }" />
        </UTooltip>
      </template>

      <template #title>
        <UIcon name="i-lucide-package" class="size-5" />
        {{ i18n.__('Gutenberg Settings', 'windpress') }}
        <UBadge variant="soft" color="primary">@gutenberg</UBadge>
      </template>

      <template #right>
        <UTooltip :text="i18n.__('Help', 'windpress')">
          <UButton icon="i-lucide-circle-help" color="neutral" variant="soft" to="https://wind.press/docs/guide/integrations/gutenberg" target="_blank" />
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
                  <UButton icon="i-lucide-circle-help" color="neutral" size="sm" variant="soft" to="https://wind.press/docs/guide/integrations/gutenberg" target="_blank" />
                </UTooltip>
              </div>
              <USwitch v-model="settingsStore.virtualOptions(`integration.gutenberg.compile.enabled`, true).value" />
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-muted">
              {{ i18n.__('Enable CSS compilation for Gutenberg blocks and editor content. This processes Tailwind classes found in block content and generates the necessary CSS.', 'windpress') }}
            </p>
          </div>
        </UCard>

        <!-- Editor Integration -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-edit-3" class="size-5 text-primary" />
                <h3 class="text-sm font-medium">{{ i18n.__('Editor Integration', 'windpress') }}</h3>
                <UTooltip :text="i18n.__('Help', 'windpress')">
                  <UButton icon="i-lucide-circle-help" color="neutral" size="sm" variant="soft" to="https://wind.press/docs/guide/integrations/gutenberg" target="_blank" />
                </UTooltip>
              </div>
              <USwitch v-model="settingsStore.virtualOptions(`integration.gutenberg.editor.enabled`, true).value" />
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-muted">
              {{ i18n.__('Enable enhanced Gutenberg editor features including real-time Tailwind CSS preview, autocomplete, and editor enhancements.', 'windpress') }}
            </p>
          </div>
        </UCard>


        <!-- theme.json Generation -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-file-json" class="size-5 text-primary" />
                <h3 class="text-sm font-medium">{{ i18n.__('Theme.json Generation', 'windpress') }}</h3>
                <UTooltip :text="i18n.__('Help', 'windpress')">
                  <UButton icon="i-lucide-circle-help" color="neutral" size="sm" variant="soft" to="https://developer.wordpress.org/themes/global-settings-and-styles/" target="_blank" />
                </UTooltip>
              </div>
              <USwitch v-model="settingsStore.virtualOptions(`integration.gutenberg.settings.theme_json`, false).value" />
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-muted">
              {{ i18n.__('Generate and load a theme.json file based on your Tailwind CSS configuration. This enables Full Site Editing features and provides better integration with the block editor.', 'windpress') }}
            </p>
            <div class="bg-muted/50 border border-default rounded-lg p-3">
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-info" class="size-4 text-info mt-0.5 flex-shrink-0" />
                <div class="text-xs text-muted">
                  <p class="font-medium mb-1">{{ i18n.__('What does this do?', 'windpress') }}</p>
                  <ul class="space-y-1 text-xs">
                    <li>- {{ i18n.__('Generates a theme.json file with your Tailwind colors, spacing, and typography', 'windpress') }}</li>
                    <li>- {{ i18n.__('Loads the generated theme.json on the Gutenberg editor', 'windpress') }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UDashboardPanel>
</template>