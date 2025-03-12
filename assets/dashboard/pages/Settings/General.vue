<script setup lang="ts">
import { onBeforeMount, reactive, ref, watch } from 'vue';
import { useLicenseStore } from '@/dashboard/stores/license';
import { useBusyStore } from '@/dashboard/stores/busy';

const appConfig = useAppConfig()

const toast = useToast()

const licenseStore = useLicenseStore()
const busyStore = useBusyStore()

const licenseKeyError = ref<string|boolean>(false)

const license = reactive({
    key: '',
})

watch(() => license.key, () => {
    licenseKeyError.value = false;
})

function doLicenseChange() {
    licenseKeyError.value = false;

    toast.add({
        id: 'license.change',
        title: licenseStore.license.key && licenseStore.isActivated ? 'Deactivating license...' : 'Activating license...',
        description: `Please wait while we ${licenseStore.license.key && licenseStore.isActivated ? 'deactivate' : 'activate'} your license key.`,
        icon: 'lucide:loader-circle',
        close: false,
        duration: 0,
        color: 'neutral',
        ui: {
            icon: 'animate-spin',
        }
    });

    const promise = licenseStore.license.key && licenseStore.isActivated
        ? licenseStore.doDeactivate()
        : licenseStore.doActivate(license.key);

    promise.then(() => {
        license.key = licenseStore.license.key;

        toast.update('license.change', {
            title: 'License updated',
            description: `Your license key has been ${licenseStore.isActivated ? 'activated' : 'deactivated'}.`,
            icon: 'lucide:key-round',
            color: 'success',
            duration: undefined,
            close: true,
            ui: {
                icon: undefined,
            }
        });
    }).catch((error) => {
        toast.update('license.change', {
            title: 'License update failed',
            description: (error instanceof Error) ? error.message : 'An unknown error occurred',
            icon: 'lucide:key-round',
            color: 'error',
            close: true,
            duration: undefined,
            ui: {
                icon: undefined,
            }
        });

        licenseKeyError.value = 'Invalid license key';
    });
}

onBeforeMount(() => {
    licenseStore.doPull().then(() => {
        license.key = licenseStore.license.key;
    });
});

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

    <UPageCard v-else title="License" description="" class="bg-gradient-to-tl from-(--ui-primary)/10 from-5% to-(--ui-bg)">
        <UForm :state="license" @submit="doLicenseChange">
            <UFormField label="License key" required :error="licenseKeyError" help="To access updates when they are available, please provide your license key.">
                <div class="flex flex-row gap-4 my-2">
                    <UInput v-model="license.key" type="password" placeholder="WIND-12345-67890-PRESS" class="w-full" data-1p-ignore />
                    <UButton type="submit" :leading-icon="busyStore.isBusy && busyStore.tasks.some((t) => t.task === 'settings.license.activate' || t.task === 'settings.license.deactivate') ? 'lucide:loader-circle' : undefined" :disabled="!license.key || busyStore.isBusy" :ui="{ leadingIcon: 'animate-spin' }">
                        {{(licenseStore.isActivated ? 'Deactivat' : 'Activat') + (busyStore.isBusy && busyStore.tasks.some((t) => t.task === 'settings.license.activate' || t.task === 'settings.license.deactivate') ? 'ing' : 'e')}}
                    </UButton>
                </div>

                <template #hint v-if="licenseStore.license.key">
                    <div class="flex items-center gap-2">
                        <span class="text-(--ui-text-muted)">Status:</span>
                        <UBadge :color="licenseStore.isActivated ? 'success' : 'error'" variant="soft">
                            {{ licenseStore.isActivated ? 'Active' : 'Inactive' }}
                        </UBadge>
                    </div>
                </template>

                <!-- <template #help>
                    <p class="mt-2 text-(--ui-text-muted)">To access updates when they are available, please provide your license key.</p>
                </template>

                <template #error>
                    <p class="mt-2 text-error">{{ licenseKeyError }}</p>
                </template> -->
            </UFormField>

        </UForm>

    </UPageCard>



</template>