<script setup lang="ts">
import { ref } from 'vue';
import { useLicenseStore } from '@/dashboard/stores/license';
import { useBusyStore } from '@/dashboard/stores/busy';

const appConfig = useAppConfig()

const licenseStore = useLicenseStore()
const busyStore = useBusyStore()

const licenseKey = ref('');
</script>

<template>
    <UPageCard v-if="window.windpress._via_wp_org" title="License" class="bg-gradient-to-tl from-(--ui-primary)/10 from-5% to-(--ui-bg)">
        <template #description>
            You are using the WordPress.org edition.
        </template>

        <template #footer>
            <UButton label="Upgrade to Pro" color="primary" :trailing-icon="appConfig.ui.icons.external" :ui="{ trailingIcon: 'inline-block size-3 align-top', base: 'gap-[normal] items-start' }" :to="`https://wind.press/?utm_source=wordpress-plugins&utm_medium=plugin-menu&utm_campaign=windpress&utm_id=all-edition&windpress_version=${window.windpress._version}#pricing`" target="_blank" />
        </template>
    </UPageCard>

    <!-- <UPageCard v-else title="License" description="To access updates when they are available, please provide your license key." class="bg-gradient-to-tl from-(--ui-primary)/10 from-5% to-(--ui-bg)"> -->
    <UPageCard v-else title="License" description="" class="bg-gradient-to-tl from-(--ui-primary)/10 from-5% to-(--ui-bg)">
        <template #default>
            <div class="flex flex-row gap-4">
                <UInput v-model="licenseKey" type="password" placeholder="License key" class="w-full" />

                <UButton type="button" :label="licenseStore.isActivated ? 'Deactivate' : 'Activate'" :leading-icon="busyStore.isBusy && busyStore.tasks.some((t) => t.task === 'settings.license.activate' || t.task === 'settings.license.deactivate') ? 'lucide:loader-circle' : undefined" :disabled="!licenseKey || busyStore.isBusy" :ui="{ leadingIcon: 'animate-spin' }" />
            </div>
        </template>

        <template #footer>
        </template>
    </UPageCard>



</template>