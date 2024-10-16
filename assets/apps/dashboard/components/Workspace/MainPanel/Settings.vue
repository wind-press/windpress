<script setup>
import { onBeforeMount, ref } from 'vue';
import { __ } from '@wordpress/i18n';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import { Switch } from '@headlessui/vue';
import { useLicenseStore } from '@/dashboard/stores/license';
import { useBusyStore } from '@/dashboard/stores/busy';
import { useSettingsStore } from '@/dashboard/stores/settings';
import { useNotifier } from '@/dashboard/library/notifier';
import { useApi } from '@/dashboard/library/api';
import { version as tw4_version } from '@tailwindcss/root/packages/tailwindcss/package.json';
import { version as tw3_version } from 'tailwindcss/package.json';

const notifier = useNotifier();
const licenseStore = useLicenseStore();
const settingsStore = useSettingsStore();
const busyStore = useBusyStore();
const api = useApi();
const channel = new BroadcastChannel('windpress');

const licenseKey = ref('');
const providers = ref([]);

function doLicenseChange() {
    const promise = licenseStore.license.key && licenseStore.isActivated
        ? licenseStore.doDeactivate()
        : licenseStore.doActivate(licenseKey.value);

    promise.then(() => {
        licenseKey.value = licenseStore.license.key;
    });

    notifier.async(
        promise,
        resp => notifier.success(resp.message),
        err => notifier.alert(err.message),
        licenseStore.license.key && licenseStore.isActivated ? __('Deactivating license...', 'windpress') : __('Activating license...', 'windpress')
    );
}

async function pullProviders() {
    await api
        .get('admin/settings/cache/providers')
        .then((resp) => {
            providers.value = resp.data.providers;
        });
}

function handleEnableKeyup(e, providerId) {
    if (e.code === 'Space') {
        e.preventDefault();
        settingsStore.virtualOptions(`integration.${providerId}.enabled`, true).value = !settingsStore.virtualOptions(`integration.${providerId}.enabled`, true).value;
    }
}

function switchProviderStatus(providerId) {
    settingsStore.virtualOptions(`integration.${providerId}.enabled`, true).value = !settingsStore.virtualOptions(`integration.${providerId}.enabled`, true).value;
    doSave();
}

function doSave() {
    const promise = settingsStore.doPush();

    notifier.async(
        promise,
        resp => notifier.success(resp.message),
        err => notifier.alert(err.message),
        __('Saving settings...', 'windpress')
    );
}

function doGenerateCache() {
    channel.postMessage({
        source: 'any',
        target: 'windpress/dashboard',
        task: 'windpress.generate-cache',
        payload: {
            force_pull: true,
            tailwindcss_version: Number(settingsStore.virtualOptions('general.tailwindcss.version', 4).value),
        }
    });
}

const css_cache = ref({
    last_generated: null,
    file_url: null,
    file_size: false,
});

function pullCacheInfo() {
    api
        .get('admin/settings/cache/index')
        .then((resp) => {
            css_cache.value = resp.data.cache;
        });
}

onBeforeMount(() => {
    licenseStore.doPull().then(() => {
        licenseKey.value = licenseStore.license.key;
    });

    settingsStore.doPull();

    pullProviders();

    pullCacheInfo();
});

channel.addEventListener('message', (e) => {
    const data = e.data;
    const source = 'windpress/dashboard';
    const target = 'windpress/dashboard';
    const task = 'windpress.save';

    if (data.source === source && data.target === target && data.task === task) {
        doSave();
    }
});

channel.addEventListener('message', (e) => {
    const data = e.data;
    const source = 'windpress/dashboard';
    const target = 'windpress/dashboard';
    const task = 'windpress.settings.cache.info.pull';

    if (data.source === source && data.target === target && data.task === task) {
        pullCacheInfo();
    }
});
</script>

<template>
    <div class="flex flex:col overflow-y:scroll! h:full fg:foreground {bt:1|solid|sideBar-border}>*+*">
        <div class="sections">
            <div class="sections__header flex  justify-content:space-between px:24 py:16">
                <div class="flex-grow:1">
                    <span class="font:18 font:semibold">{{ wp_i18n.__('License', 'windpress') }}</span>
                </div>
            </div>
            <div class="sections__body transition:max-height|0.2s|ease-out">
                <div class="{bt:1|solid|sideBar-border}>*+* ">
                    <div class="p:20">
                        <div v-if="!windpress._via_wp_org" class="flex flex:column gap:10">
                            <span class="font:15">
                                {{ wp_i18n.__('License Key', 'windpress') }}
                            </span>
                            <div class="flex gap:6">
                                <input v-model="licenseKey" type="password" id="license_key" :disabled="licenseStore.isActivated" class="max-w:400 w:full">
                                <button @click="doLicenseChange" type="button" :disabled="!licenseKey || busyStore.isBusy" class="button button-secondary inline-flex align-items:center gap:8">
                                    <i-fa6-solid-circle-notch v-if="busyStore.isBusy && busyStore.tasks.some((t) => t.task === 'settings.license.activate' || t.task === 'settings.license.deactivate')" class="iconify @rotate|1s|infinite|linear" />
                                    <template v-if="busyStore.isBusy && busyStore.tasks.some((t) => t.task === 'settings.license.activate' || t.task === 'settings.license.deactivate')">
                                        {{ licenseStore.isActivated ? wp_i18n.__('Deactivating', 'windpress') : wp_i18n.__('Activating', 'windpress') }}
                                    </template>
                                    <template v-else>
                                        {{ licenseStore.isActivated ? wp_i18n.__('Deactivate', 'windpress') : wp_i18n.__('Activate', 'windpress') }}
                                    </template>
                                </button>
                            </div>
                            <div v-if="licenseStore.license.key" class="flex align-items:center font:medium">
                                {{ wp_i18n.__('Status', 'windpress') }}:
                                <span :class="licenseStore.isActivated ? 'bg:green-80' : 'bg:yellow-70'" class="fg:white font:regular ml:10 px:6 py:4 r:4 user-select:none">
                                    {{ licenseStore.isActivated ? 'Active' : 'Inactive' }}
                                </span>
                            </div>
                            <p class="my:0">{{ wp_i18n.__('To access updates when they are available, please provide your license key.', 'windpress') }}</p>
                        </div>
                        <div v-else class="flex flex:column gap:10">
                            <div class="flex align-items:center font:medium">
                                <span v-html="wp_i18n.sprintf(
                                    wp_i18n.__('You are using the %sWordPress.org%s edition.', 'windpress'),
                                    '<a href=&quot;https://wordpress.org/plugins/windpress/&quot; target=&quot;_blank&quot;>',
                                    '</a>'
                                )">
                                </span>
                                <a href="https://wind.press/#pricing" target="_blank" rel="noopener noreferrer" class="ml:6 text-decoration:none bg:crimson-10 fg:crimson-80 px:6 py:3 r:4 b:1|solid|crimson-90/.2 user-select:none">
                                    {{ wp_i18n.__('Upgrade to Pro', 'windpress') }}
                                    <i-line-md-external-link class="iconify" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sections__footer">
                <div></div>
            </div>
        </div>
        <div class="sections">
            <div class="sections__header flex  justify-content:space-between px:24 py:16">
                <div class="flex-grow:1">
                    <span class="font:18 font:semibold">{{ wp_i18n.__('General', 'windpress') }}</span>
                </div>
            </div>
            <div class="sections__body transition:max-height|0.2s|ease-out">
                <div class="flex {bt:1|solid|sideBar-border}>*+* flex:column">
                    <div class="flex flex:column gap:30 p:20">
                        <div class="flex flex:column gap:10">
                            <div class="flex max-w:400 w:full">
                                <fieldset :aria-label="wp_i18n.__('Choose the Tailwind CSS version', 'windpress')" class="font:14 w:full b:0 p:0 m:0">
                                    <div class="flex align-items:center justify-content:space-between leading:1.5">
                                        <div class="font:15">{{ wp_i18n.__('Tailwind CSS version', 'windpress') }}</div>
                                        <a href="https://github.com/tailwindlabs/tailwindcss/releases" target="_blank" class="">{{ wp_i18n.__('See release notes', 'windpress') }}</a>
                                    </div>
                                    <div class="mt:8 grid grid-cols:2 gap:12 {flex;cursor:pointer;align-items:center;justify-content:center;r:4;px:12;py:12;font:semibold;flex-grow:1;bg:gray-10/.7}>label {bg:gray-10/.1}>label@dark {outline:1|solid|gray-20}>label:hover {bg:sky-70;fg:white}>label:has(:checked) {bg:sky-70;fg:white}>label:has(:checked)@dark">
                                        <label>
                                            <input type="radio" name="tailwindcss_version" value="3" v-model="settingsStore.virtualOptions('general.tailwindcss.version', 4).value" class="sr-only">
                                            <span>{{ tw3_version }}</span>
                                        </label>
                                        <label>
                                            <input type="radio" name="tailwindcss_version" value="4" v-model="settingsStore.virtualOptions('general.tailwindcss.version', 4).value" class="sr-only">
                                            <span>{{ tw4_version }}</span>
                                        </label>
                                    </div>
                                </fieldset>
                            </div>
                            <p class="my:0"> {{ wp_i18n.__('Note: You must update the `main.css` file accordingly.', 'windpress') }} </p>
                        </div>
                        <div class="flex flex:column gap:10">
                            <span class="font:15">{{ wp_i18n.__('Ubiquitous WindPress panel', 'windpress') }}</span>
                            <div class="flex align-items:center gap:4">
                                <input type="checkbox" id="enable_front_ubiquitous_panel" v-model="settingsStore.virtualOptions('general.ubiquitous-panel.enabled', false).value" class="checkbox mt:0">
                                <label for="enable_front_ubiquitous_panel" class="font:medium">{{ wp_i18n.__('Enable WindPress panel on the front page', 'windpress') }}</label>
                            </div>
                            <p class="my:0"> {{ wp_i18n.__('Access the WindPress panel right from the front page and made adjustment as it is on the wp-admin page.', 'windpress') }} </p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sections__footer">
                <div></div>
            </div>
        </div>
        <div class="sections">
            <div class="sections__header flex  justify-content:space-between px:24 py:16">
                <div class="flex-grow:1">
                    <span class="font:18 font:semibold">{{ wp_i18n.__('Performance', 'windpress') }}</span>
                </div>
            </div>
            <div class="sections__body transition:max-height|0.2s|ease-out">
                <div class="flex {bt:1|solid|sideBar-border}>*+*  flex:column">
                    <div class="flex flex:column gap:30 p:20">
                        <div class="flex flex:column gap:10">
                            <span class="font:15">{{ wp_i18n.__('Cached CSS', 'windpress') }}</span>
                            <div class="flex align-items:center gap:4">
                                <input type="checkbox" id="enable_cached_css" v-model="settingsStore.virtualOptions('performance.cache.enabled', false).value" class="checkbox mt:0">
                                <label for="enable_cached_css" class="font:medium">{{ wp_i18n.__('Use cached CSS if available', 'windpress') }}</label>
                            </div>
                            <div class="flex align-items:center gap:4">
                                <input type="checkbox" id="force_cdn_admin" v-model="settingsStore.virtualOptions('performance.cache.exclude_admin', false).value" class="checkbox mt:0">
                                <label for="force_cdn_admin" class="font:medium">{{ wp_i18n.__('Admin always uses the Play CDN', 'windpress') }}</label>
                            </div>
                            <div class="flex align-items:center gap:4">
                                <input type="checkbox" id="inline_cached_css" v-model="settingsStore.virtualOptions('performance.cache.inline_load', false).value" class="checkbox mt:0">
                                <label for="inline_cached_css" class="font:medium">{{ wp_i18n.__('Load the cached CSS inline', 'windpress') }}</label>
                            </div>
                            <p class="my:0">{{ wp_i18n.__('Serve the CSS file from the cache instead of generating it on the fly using Play CDN.', 'windpress') }}</p>
                            <p class="flex gap-x:4 my:0">
                                <span class="font:medium">{{ wp_i18n.__('Last Generated', 'windpress') }}:</span>
                                <template v-if="css_cache.last_generated">
                                    {{ new dayjs(css_cache.last_generated * 1000).format('YYYY-MM-DD HH:mm:ss') }}
                                    <a :href="`${css_cache.file_url}?ver=${css_cache.last_generated}`" target="_blank">
                                        <i-line-md-external-link class="iconify" />
                                    </a>
                                </template>
                                <template v-if="css_cache.file_size">
                                    <div class="bg:lime-5/.5 bg:lime-80/.5@dark fg:lime-70 fg:lime-30@dark font:12 font:medium ml:8 outline:1|solid|lime-60/.2 px:8 py:2 r:6">{{ prettyBytes(css_cache.file_size, { maximumFractionDigits: 2, space: true }) }}</div>
                                </template>
                            </p>
                            <div>
                                <button @click="doGenerateCache" :disabled="busyStore.isBusy" type="button" class="button button-secondary inline-flex align-items:center gap:8">
                                    <i-fa6-solid-circle-notch v-if="busyStore.isBusy && busyStore.hasTask('settings.performance.cached_css.generate')" class="iconify @rotate|1s|infinite|linear" />
                                    {{ busyStore.isBusy && busyStore.hasTask('settings.performance.cached_css.generate') ? wp_i18n.__('Generating...', 'windpress') : wp_i18n.__('Generate', 'windpress') }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sections__footer">
                <div></div>
            </div>
        </div>
        <div class="sections">
            <div class="sections__header flex  justify-content:space-between px:24 py:16">
                <div class="flex-grow:1">
                    <span class="font:18 font:semibold">{{ wp_i18n.__('Integrations', 'windpress') }}</span>
                </div>
            </div>
            <div class="sections__body transition:max-height|0.2s|ease-out">
                <div class="">
                    <div class="grid grid-cols:2 gap:1 m:1">
                        <div v-for="provider in providers" :key="provider.id" :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'bg:sky-5 bg:sky-30/.2@dark z:10' : '']" class="flex rel p:12">
                            <div class="flex align-items:center">
                                <Switch :aria-disabled="busyStore.isBusy" :checked="settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value" @click="switchProviderStatus(provider.id)" @keyup="e => handleEnableKeyup(e, provider.id)" :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'bg:sky-70' : 'bg:gray-15 opacity:.5']" class="inline-flex rel rounded b:2 b:transparent box-shadow:rgb(255,255,255)|0|0|0|2,rgb(14,165,233)|0|0|0|4,rgba(0,0,0,0)|0|0|0|0:focus cursor:pointer flex-shrink:0 h:24 outline:2|solid|transparent:focus p:0 transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:44">
                                    <span :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'translateX(20)' : 'translateX(0)']" class="inline-block rel rounded bg:white box-shadow:rgb(255,255,255)|0|0|0|0,rgba(59,130,246,0.5)|0|0|0|0,rgba(0,0,0,0.1)|0|1|3|0,rgba(0,0,0,0.1)|0|1|2|-1 font:12 h:20 pointer-events:none transition-duration:200 transition-property:color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter transition-timing-function:cubic-bezier(0.4,0,0.2,1) w:20">
                                        <span aria-hidden="true" :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'opacity:0 transition-duration:100 transition-timing-function:ease-out' : 'opacity:1 transition-duration:200 transition-timing-function:ease-in']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <i-fa6-solid-xmark class="iconify fg:gray-40" />
                                        </span>
                                        <span aria-hidden="true" :class="[settingsStore.virtualOptions(`integration.${provider.id}.enabled`, true).value ? 'opacity:1 transition-duration:200 transition-timing-function:ease-in' : 'opacity:0 transition-duration:100 transition-timing-function:ease-out']" class="abs flex align-items:center h:full inset:0 justify-content:center w:full">
                                            <i-fa6-solid-check class="iconify fg:sky-70" />
                                        </span>
                                    </span>
                                </Switch>
                            </div>
                            <div class="flex flex:col ml:12">
                                <div>
                                    <span class="font:semibold">{{ provider.name }}</span>
                                    <span class="fg:foreground/.7 font:10 ml:8">[ {{ provider.id }} ]</span>
                                </div>
                                <span class="">{{ provider.description }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sections__footer">
                <div></div>
            </div>
        </div>
    </div>
</template>