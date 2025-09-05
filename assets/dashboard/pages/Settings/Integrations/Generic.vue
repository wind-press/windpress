<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { useSettingsStore } from '@/dashboard/stores/settings';

const route = useRoute();
const settingsStore = useSettingsStore();

// Get integration ID from route params
const integrationId = computed(() => route.params.integration as string);

// Integration metadata - this would typically come from API or store
const integrationMeta = computed(() => {
  const meta = {
    'bricks': {
      name: 'Bricks Builder',
      icon: 'i-lucide-package',
      description: 'Configure Bricks Builder integration settings',
      helpUrl: 'https://bricksbuilder.io/docs/'
    },
    'blockstudio': {
      name: 'Blockstudio',
      icon: 'i-lucide-package',
      description: 'Configure Blockstudio integration settings',
      helpUrl: 'https://blockstudio.dev/docs/'
    },
    'breakdance': {
      name: 'Breakdance Builder',
      icon: 'i-lucide-package',
      description: 'Configure Breakdance Builder integration settings',
      helpUrl: 'https://breakdance.com/documentation/'
    },
    'builderius': {
      name: 'Builderius',
      icon: 'i-lucide-package',
      description: 'Configure Builderius integration settings',
      helpUrl: 'https://builderius.io/documentation/'
    },
    'etch': {
      name: 'Etch',
      icon: 'i-lucide-package',
      description: 'Configure Etch integration settings',
      helpUrl: 'https://etchwp.com/docs/'
    },
    'livecanvas': {
      name: 'LiveCanvas',
      icon: 'i-lucide-package',
      description: 'Configure LiveCanvas integration settings',
      helpUrl: 'https://livecanvas.com/documentation/'
    },
    'oxygen': {
      name: 'Oxygen Builder',  
      icon: 'i-lucide-package',
      description: 'Configure Oxygen Builder integration settings',
      helpUrl: 'https://oxygenbuilder.com/documentation/'
    },
    'oxygen-classic': {
      name: 'Oxygen Classic Builder',
      icon: 'i-lucide-package',
      description: 'Configure Oxygen Classic Builder integration settings',
      helpUrl: 'https://oxygenbuilder.com/documentation/'
    },
    'wpcodebox2': {
      name: 'WPCodeBox 2',
      icon: 'i-lucide-package',
      description: 'Configure WPCodeBox 2 integration settings',
      helpUrl: 'https://wpcodebox.com/documentation/'
    },
    'elementor': {
      name: 'Elementor',
      icon: 'i-lucide-package',
      description: 'Configure Elementor integration settings',
      helpUrl: 'https://elementor.com/help/'
    },
    'greenshift': {
      name: 'GreenShift',
      icon: 'i-lucide-package',
      description: 'Configure GreenShift integration settings',
      helpUrl: 'https://greenshiftwp.com/documentation/'
    },
    'kadence': {
      name: 'Kadence WP',
      icon: 'i-lucide-package',
      description: 'Configure Kadence WP integration settings',
      helpUrl: 'https://kadencewp.com/documentation/'
    },
    'timber': {
      name: 'Timber',
      icon: 'i-lucide-package',
      description: 'Configure Timber integration settings',
      helpUrl: 'https://timber.github.io/docs/'
    },
    'metabox-views': {
      name: 'Meta Box Views',
      icon: 'i-lucide-package',
      description: 'Configure Meta Box Views integration settings',
      helpUrl: 'https://docs.metabox.io/extensions/mb-views/'
    },
    'divi': {
      name: 'Divi Builder',
      icon: 'i-lucide-package',
      description: 'Configure Divi Builder integration settings', 
      helpUrl: 'https://www.elegantthemes.com/documentation/divi/'
    },
    'default': {
      name: integrationId.value,
      icon: 'i-lucide-package',
      description: `Configure ${integrationId.value} integration settings`,
      helpUrl: '#'
    }
  };
  
  return meta[integrationId.value as keyof typeof meta] || meta.default;
});
</script>

<template>
  <UDashboardPanel :id="`integration-${integrationId}-settings`" class="min-h-[calc(100svh-var(--wp-admin--admin-bar--height))]">
    <UDashboardNavbar :title="`${integrationMeta.name} ${i18n.__('Settings', 'windpress')}`" :toggle="false" :ui="{ title: 'text-sm' }">
      <template #title>
        <UIcon :name="integrationMeta.icon" class="size-5" />
        {{ integrationMeta.name }} {{ i18n.__('Settings', 'windpress') }}
        <UBadge variant="soft" color="primary">@integration</UBadge>
        <UTooltip :text="integrationMeta.description">
          <span class="text-xs opacity-60 font-normal">
            {{ integrationMeta.description }}
          </span>
        </UTooltip>
      </template>

      <template #right>
        <UTooltip :text="i18n.__('Help', 'windpress')">
          <UButton icon="i-lucide-circle-help" color="neutral" variant="soft" :to="integrationMeta.helpUrl" target="_blank" />
        </UTooltip>
      </template>
    </UDashboardNavbar>

    <div class="flex-1 overflow-y-auto p-4">
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Coming Soon Message -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-construction" class="size-5 text-warning" />
              <h3 class="text-sm font-medium">{{ i18n.__('Settings Coming Soon', 'windpress') }}</h3>
              <UBadge variant="soft" color="warning">{{ i18n.__('In Development', 'windpress') }}</UBadge>
            </div>
          </template>

          <div class="space-y-3">
            <p class="text-sm text-muted">
              {{ i18n.__('Dedicated settings for', 'windpress') }} {{ integrationMeta.name }} {{ i18n.__('are currently being developed. They will be available in a future update.', 'windpress') }}
            </p>
            
            <!-- <div class="bg-muted/50 border border-default rounded-lg p-3">
              <div class="flex items-start gap-2">
                <UIcon name="i-lucide-lightbulb" class="size-4 text-info mt-0.5 flex-shrink-0" />
                <div class="text-xs text-muted">
                  <p class="font-medium mb-1">{{ i18n.__('What to expect:', 'windpress') }}</p>
                  <ul class="space-y-1 text-xs">
                    <li>- {{ i18n.__('Builder-specific optimization settings', 'windpress') }}</li>
                    <li>- {{ i18n.__('Custom CSS injection options', 'windpress') }}</li>
                    <li>- {{ i18n.__('Performance and caching configurations', 'windpress') }}</li>
                    <li>- {{ i18n.__('Editor integration enhancements', 'windpress') }}</li>
                  </ul>
                </div>
              </div>
            </div> -->
          </div>
        </UCard>

        <!-- Integration Status -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="size-5 text-neutral" />
              <h3 class="text-sm font-medium">{{ i18n.__('Integration Status', 'windpress') }}</h3>
            </div>
          </template>

          <div class="space-y-3">
            <div class="bg-elevated border border-default rounded-lg p-4 font-mono text-xs">
              <div class="text-dimmed mb-2">{{ i18n.__('Current Status:', 'windpress') }}</div>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span>{{ i18n.__('Integration:', 'windpress') }}</span>
                  <span class="text-highlighted">{{ integrationMeta.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ i18n.__('Enabled:', 'windpress') }}</span>
                  <span :class="settingsStore.virtualOptions(`integration.${integrationId}.enabled`, true).value ? 'text-success' : 'text-dimmed'">
                    {{ settingsStore.virtualOptions(`integration.${integrationId}.enabled`, true).value ? i18n.__('Yes', 'windpress') : i18n.__('No', 'windpress') }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>{{ i18n.__('Settings Available:', 'windpress') }}</span>
                  <span class="text-warning">{{ i18n.__('Coming Soon', 'windpress') }}</span>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UDashboardPanel>
</template>