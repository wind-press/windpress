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

const licenseKeyError = ref<string | boolean>(false)

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

  <UPageCard v-else title="License" description="" :class="licenseStore.isActivated ? 'from-(--ui-primary)/10' : 'from-(--ui-warning)/10'" class="bg-gradient-to-tl from-5% to-(--ui-bg)">
    <UForm :state="license" @submit="doLicenseChange">
      <UFormField label="License key" required :error="licenseKeyError" help="To access updates when they are available, please provide your license key.">
        <div class="flex flex-row gap-4 my-2">
          <UInput v-model="license.key" type="password" placeholder="WIND-12345-67890-PRESS" class="w-full" data-1p-ignore />

          <UTooltip :delay-duration="0" :text="`${licenseStore.isActivated ? 'Unregister' : 'Register'} your WindPress setup`">
            <UButton type="submit" color="primary" variant="subtle" :leading-icon="busyStore.isBusy && busyStore.tasks.some((t) => t.task === 'settings.license.activate' || t.task === 'settings.license.deactivate') ? 'lucide:loader-circle' : undefined" :disabled="!license.key || busyStore.isBusy" :ui="{ leadingIcon: 'animate-spin' }">
              {{(licenseStore.isActivated ? 'Deactivat' : 'Activat') + (busyStore.isBusy && busyStore.tasks.some((t) => t.task === 'settings.license.activate' || t.task === 'settings.license.deactivate') ? 'ing' : 'e')}}
            </UButton>
          </UTooltip>

        </div>
        <template v-if="licenseStore.license.key" #hint>
          <div class="flex items-center gap-2">
            <span class="text-(--ui-text-muted)">Status:</span>
            <UBadge :color="licenseStore.isActivated ? 'success' : 'error'" variant="subtle">
              {{ licenseStore.isActivated ? 'Active' : 'Inactive' }}
            </UBadge>
          </div>
        </template>
      </UFormField>
    </UForm>
  </UPageCard>

  <UForm id="general" :state="{}">
    <UPageCard title="General" description="General settings for WindPress." variant="naked" orientation="horizontal" class="mb-4">
    </UPageCard>

    <UPageCard variant="subtle">
      <UFormField label="Tailwind CSS version" description="You must update the `main.css` file accordingly." class="flex max-sm:flex-col justify-between items-start gap-4" :ui="{ container: 'flex-1' }">
        <template #hint>
          <ULink to="https://github.com/tailwindlabs/tailwindcss/releases" target="_blank" class="underline">
            See release notes
          </ULink>
        </template>
        <div class="grid grid-cols-2 gap-3">
          <label class="flex items-center justify-center rounded-md p-3 font-semibold flex-1 bg-(--ui-bg-accented) hover:ring-(--ui-text)/50 hover:ring-1 has-checked:bg-[#0073e0] has-checked:text-white">
            <input v-model="settingsStore.virtualOptions('general.tailwindcss.version', 4).value" type="radio" name="tailwindcss_version" :value="3" class="sr-only">
            <span>{{ tw3_version }}</span>
          </label>
          <label class="flex items-center justify-center rounded-md p-3 font-semibold flex-1 bg-(--ui-bg-accented) hover:ring-(--ui-text)/50 hover:ring-1 has-checked:bg-[#0073e0] has-checked:text-white">
            <input v-model="settingsStore.virtualOptions('general.tailwindcss.version', 4).value" type="radio" name="tailwindcss_version" :value="4" class="sr-only">
            <span>{{ tw4_version }}</span>
          </label>
        </div>
      </UFormField>
      <USeparator />
      <UFormField label="Ubiquitous panel" description="Access the WindPress dashboard panel right from the front page and made adjustment as it is on the wp-admin page." class="flex items-center justify-between not-last:pb-4 gap-4">
        <USwitch v-model="settingsStore.virtualOptions('general.ubiquitous-panel.enabled', false).value as boolean" disabled />
      </UFormField>
    </UPageCard>
  </UForm>
</template>