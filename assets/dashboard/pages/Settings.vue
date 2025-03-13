<script setup lang="ts">
import { useSettingsStore } from '@/dashboard/stores/settings';
import { useRouter } from 'vue-router';

const router = useRouter()

const settingsStore = useSettingsStore()

const links = [
    [
        {
            label: 'General',
            to: router.resolve({ name: 'settings.general' }),
            icon: 'lucide:settings',
            exact: true,
        },
        {
            label: 'Performance',
            to: router.resolve({ name: 'settings.performance' }),
            icon: 'lucide:rocket',
            exact: true,
        },
        {
            label: 'Integrations',
            to: router.resolve({ name: 'settings.integrations' }),
            icon: 'lucide:package',
            exact: true,
        },
    ],
    [
        // {
        //     label: 'Documentation',
        //     icon: 'i-lucide-book-open',
        //     to: `https://wind.press/docs?utm_source=wordpress-plugins&utm_medium=plugin-menu&utm_campaign=windpress&utm_id=all-edition&windpress_version=${window.windpress._version}`,
        //     target: '_blank'
        // },
        // {
        //     label: 'Support',
        //     icon: 'lucide:headset',
        //     to: `https://rosua.org/support-portal?utm_source=wordpress-plugins&utm_medium=plugin-menu&utm_campaign=windpress&utm_id=all-edition&windpress_version=${windpress._version}`,
        //     target: '_blank'
        // },
    ]
]
</script>

<template>
  <UDashboardPanel
    id="settings"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu
          :items="links"
          highlight
          class="-mx-1 flex-1"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto">
        <RouterView />
      </div>
    </template>
  </UDashboardPanel>
</template>